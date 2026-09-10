import {
  runSearch,
  type SearchOutcome,
  type SearchRequest,
} from "./optimizerAdapter";

/** Capabilities keep the synchronous adapter from presenting fake worker UX. */
export interface SearchTransportCapabilities {
  readonly worker: boolean;
  readonly liveProgress: boolean;
  readonly cancellation: boolean;
  readonly resume: boolean;
}

export const LOCAL_SEARCH_TRANSPORT_CAPABILITIES: SearchTransportCapabilities = {
  worker: false,
  liveProgress: false,
  cancellation: false,
  resume: false,
};

export interface SearchRequestIdentity {
  readonly requestId: string;
  readonly inputFingerprint: string;
}

export interface SearchJobRequest extends SearchRequestIdentity {
  readonly payload: SearchRequest;
}

export interface ReplayVerificationMetadata {
  readonly mode: "optimizer-emission-cold-replay";
  readonly inputFingerprint: string;
  readonly candidateFingerprints: readonly string[];
}

export interface SearchJobSuccess extends SearchRequestIdentity {
  readonly kind: "succeeded";
  readonly outcome: SearchOutcome;
  readonly replay: ReplayVerificationMetadata;
}

export interface SearchJobFailure extends SearchRequestIdentity {
  readonly kind: "failed";
  readonly code: "invalid-request" | "execution-failed";
  readonly message: string;
}

export type SearchJobResponse = SearchJobSuccess | SearchJobFailure;

export type SearchTransportEvent =
  | ({ readonly type: "started" } & SearchRequestIdentity)
  | ({ readonly type: "completed"; readonly response: SearchJobSuccess } & SearchRequestIdentity)
  | ({ readonly type: "failed"; readonly response: SearchJobFailure } & SearchRequestIdentity);

export interface SearchTransportJob {
  readonly identity: SearchRequestIdentity;
  readonly capabilities: SearchTransportCapabilities;
  readonly cancel: () => { readonly acknowledged: false; readonly reason: "unsupported" };
  readonly run: (onEvent?: (event: SearchTransportEvent) => void) => Promise<SearchJobResponse>;
}

/** Stable JSON for request identity and transport validation. */
export function canonicalizeSerializable(value: unknown): string {
  const active = new Set<object>();

  function visit(input: unknown): string {
    if (input === null) return "null";
    switch (typeof input) {
      case "string": return JSON.stringify(input);
      case "boolean": return input ? "true" : "false";
      case "number":
        if (!Number.isFinite(input)) throw new TypeError("non-finite number is not transportable");
        return Object.is(input, -0) ? "0" : String(input);
      case "undefined": throw new TypeError("undefined is not transportable");
      case "function": throw new TypeError("functions are not transportable");
      case "symbol": throw new TypeError("symbols are not transportable");
      case "bigint": throw new TypeError("bigints are not transportable");
    }

    if (typeof input !== "object") throw new TypeError("unsupported transport value");
    if (active.has(input)) throw new TypeError("cyclic request is not transportable");
    active.add(input);
    try {
      if (Array.isArray(input)) return `[${input.map(visit).join(",")}]`;
      const prototype = Object.getPrototypeOf(input);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new TypeError("class instances are not transportable");
      }
      const record = input as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${visit(record[key])}`).join(",")}}`;
    } finally {
      active.delete(input);
    }
  }

  return visit(value);
}

/** Small deterministic digest; cryptographic integrity belongs to ReplayPack. */
export function fingerprintSerializable(value: unknown): string {
  const text = canonicalizeSerializable(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createSearchJobRequest(requestId: string, payload: SearchRequest): SearchJobRequest {
  if (requestId.trim().length === 0) throw new TypeError("requestId must not be empty");
  const canonicalPayload = canonicalizeSerializable(payload);
  const immutablePayload = JSON.parse(canonicalPayload) as SearchRequest;
  deepFreeze(immutablePayload);
  return Object.freeze({
    requestId,
    inputFingerprint: fingerprintSerializable(payload),
    payload: immutablePayload,
  });
}

function deepFreeze(value: object): void {
  Object.freeze(value);
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === "object" && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }
}

function candidateFingerprint(candidate: SearchOutcome["candidates"][number]): string {
  return fingerprintSerializable({
    candidateId: candidate.candidateId,
    rotation: candidate.rotation,
    score: candidate.score,
    rank: candidate.rank,
    tieBreakKey: candidate.tieBreakKey,
    totalDamage: candidate.result.totalDamage,
    dps: candidate.result.dps,
  });
}

export function createLocalSearchJob(envelope: SearchJobRequest): SearchTransportJob {
  const identity: SearchRequestIdentity = {
    requestId: envelope.requestId,
    inputFingerprint: envelope.inputFingerprint,
  };

  const run = async (onEvent?: (event: SearchTransportEvent) => void): Promise<SearchJobResponse> => {
    onEvent?.({ type: "started", ...identity });
    try {
      const outcome = runSearch(envelope.payload);
      const response: SearchJobSuccess = {
        ...identity,
        kind: "succeeded",
        outcome,
        replay: {
          mode: "optimizer-emission-cold-replay",
          inputFingerprint: envelope.inputFingerprint,
          candidateFingerprints: outcome.candidates.map(candidateFingerprint),
        },
      };
      onEvent?.({ type: "completed", ...identity, response });
      return response;
    } catch (error) {
      const response: SearchJobFailure = {
        ...identity,
        kind: "failed",
        code: "execution-failed",
        message: error instanceof Error ? error.message : "Search execution failed",
      };
      onEvent?.({ type: "failed", ...identity, response });
      return response;
    }
  };

  return Object.freeze({
    identity,
    capabilities: LOCAL_SEARCH_TRANSPORT_CAPABILITIES,
    cancel: () => ({ acknowledged: false as const, reason: "unsupported" as const }),
    run,
  });
}

export function isCurrentSearchResponse(
  response: SearchJobResponse,
  current: SearchRequestIdentity,
): boolean {
  return response.requestId === current.requestId && response.inputFingerprint === current.inputFingerprint;
}
