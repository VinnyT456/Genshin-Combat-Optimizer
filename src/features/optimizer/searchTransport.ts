import {
  runSearch,
  type SearchOutcome,
  type SearchRequest,
} from "./optimizerAdapter";
import {
  canonicalizeSerializable,
  fingerprintSerializable,
  NON_FINITE_NUMBER_TAG,
} from "./searchIdentity";

export { canonicalizeSerializable, fingerprintSerializable } from "./searchIdentity";

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
  readonly attempt: number;
  readonly retryable: boolean;
}

export interface SearchJobCanceled extends SearchRequestIdentity {
  readonly kind: "canceled";
  readonly reason: "requested" | "worker-terminated";
}

export type SearchJobResponse = SearchJobSuccess | SearchJobFailure | SearchJobCanceled;

export type SearchWorkerRequest =
  | { readonly type: "search"; readonly request: SearchJobRequest; readonly attempt: number }
  | { readonly type: "cancel"; readonly requestId: string; readonly inputFingerprint: string };

export type SearchWorkerMessage =
  | ({ readonly type: "started"; readonly attempt: number } & SearchRequestIdentity)
  | ({ readonly type: "progress"; readonly progress: SearchProgress } & SearchRequestIdentity)
  | ({ readonly type: "completed"; readonly response: SearchJobSuccess } & SearchRequestIdentity)
  | ({ readonly type: "failed"; readonly response: SearchJobFailure } & SearchRequestIdentity);

export interface SearchProgress {
  readonly kind: "indeterminate";
  readonly nodesExpanded: number;
}

export type SearchTransportEvent =
  | ({ readonly type: "started"; readonly attempt: number } & SearchRequestIdentity)
  | ({ readonly type: "progress"; readonly progress: SearchProgress } & SearchRequestIdentity)
  | ({ readonly type: "completed"; readonly response: SearchJobSuccess } & SearchRequestIdentity)
  | ({ readonly type: "failed"; readonly response: SearchJobFailure } & SearchRequestIdentity)
  | ({ readonly type: "canceled"; readonly response: SearchJobCanceled } & SearchRequestIdentity);

export interface SearchTransportJob {
  readonly identity: SearchRequestIdentity;
  readonly capabilities: SearchTransportCapabilities;
  readonly cancel: () =>
    | { readonly acknowledged: false; readonly reason: "unsupported" | "not-running" }
    | { readonly acknowledged: true; readonly reason: "requested" };
  readonly run: (onEvent?: (event: SearchTransportEvent) => void) => Promise<SearchJobResponse>;
}

export function createSearchJobRequest(requestId: string, payload: SearchRequest): SearchJobRequest {
  if (requestId.trim().length === 0) throw new TypeError("requestId must not be empty");
  const canonicalPayload = canonicalizeSerializable(payload, { allowNonFinite: true });
  const immutablePayload = reviveNonFiniteNumbers(
    JSON.parse(canonicalPayload),
  ) as SearchRequest;
  deepFreeze(immutablePayload);
  return Object.freeze({
    requestId,
    // Fingerprint the canonical transport form. Non-finite values are tagged
    // here, so request identity stays deterministic without asking the strict
    // public fingerprint helper to hash a value it intentionally rejects.
    inputFingerprint: fingerprintSerializable(JSON.parse(canonicalPayload)),
    payload: immutablePayload,
  });
}

function reviveNonFiniteNumbers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveNonFiniteNumbers);
  if (typeof value !== "object" || value === null) return value;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length === 1 &&
    record[NON_FINITE_NUMBER_TAG] === "NaN"
  ) return Number.NaN;
  if (
    Object.keys(record).length === 1 &&
    record[NON_FINITE_NUMBER_TAG] === "Infinity"
  ) return Number.POSITIVE_INFINITY;
  if (
    Object.keys(record).length === 1 &&
    record[NON_FINITE_NUMBER_TAG] === "-Infinity"
  ) return Number.NEGATIVE_INFINITY;
  for (const [key, child] of Object.entries(record)) {
    record[key] = reviveNonFiniteNumbers(child);
  }
  return record;
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
    onEvent?.({ type: "started", attempt: 1, ...identity });
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
        attempt: 1,
        retryable: false,
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

export const WORKER_SEARCH_TRANSPORT_CAPABILITIES: SearchTransportCapabilities = {
  worker: true,
  // The optimizer is currently a bounded synchronous call inside the Worker;
  // the initial progress snapshot is transport-visible, but not live detail.
  liveProgress: false,
  cancellation: true,
  resume: false,
};

interface WorkerLike {
  onmessage: ((event: MessageEvent<SearchWorkerMessage>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: SearchWorkerRequest): void;
  terminate(): void;
}

export type SearchWorkerFactory = () => WorkerLike;

/** Worker-backed transport. The default factory is only evaluated in a browser. */
export function createWorkerSearchJob(
  envelope: SearchJobRequest,
  workerFactory: SearchWorkerFactory = () => new Worker(
    new URL("./searchWorker.ts", import.meta.url),
    { type: "module" },
  ),
): SearchTransportJob {
  const identity: SearchRequestIdentity = {
    requestId: envelope.requestId,
    inputFingerprint: envelope.inputFingerprint,
  };
  let worker: WorkerLike | null = null;
  let canceled = false;
  let attempt = 0;
  let pendingCancel: (() => void) | null = null;

  const cancel = () => {
    if (worker === null || canceled) return { acknowledged: false as const, reason: "not-running" as const };
    canceled = true;
    worker.terminate();
    worker = null;
    pendingCancel?.();
    pendingCancel = null;
    return { acknowledged: true as const, reason: "requested" as const };
  };

  const run = (onEvent?: (event: SearchTransportEvent) => void): Promise<SearchJobResponse> => {
    attempt += 1;
    canceled = false;
    const currentAttempt = attempt;
    return new Promise((resolve) => {
      const activeWorker = workerFactory();
      worker = activeWorker;
      let settled = false;
      const finish = (response: SearchJobResponse) => {
        if (settled) return;
        settled = true;
        if (worker === activeWorker) worker = null;
        pendingCancel = null;
        resolve(response);
      };
      pendingCancel = () => {
        const response: SearchJobCanceled = { ...identity, kind: "canceled", reason: "requested" };
        onEvent?.({ type: "canceled", response, ...identity });
        finish(response);
      };
      activeWorker.onmessage = (event) => {
        const message = event.data;
        if (message.requestId !== identity.requestId || message.inputFingerprint !== identity.inputFingerprint) return;
        if (message.type === "started") {
          onEvent?.({ type: "started", attempt: message.attempt, ...identity });
        } else if (message.type === "progress") {
          onEvent?.({ type: "progress", progress: message.progress, ...identity });
        } else if (message.type === "completed") {
          onEvent?.({ type: "completed", response: message.response, ...identity });
          finish(message.response);
        } else {
          onEvent?.({ type: "failed", response: message.response, ...identity });
          finish(message.response);
        }
      };
      activeWorker.onerror = (event) => {
        const response: SearchJobFailure = {
          ...identity,
          kind: "failed",
          code: "execution-failed",
          message: event.message || "Search worker failed",
          attempt: currentAttempt,
          retryable: true,
        };
        onEvent?.({ type: "failed", response, ...identity });
        finish(response);
      };
      activeWorker.postMessage({ type: "search", request: envelope, attempt: currentAttempt });
    });
  };

  return Object.freeze({
    identity,
    capabilities: WORKER_SEARCH_TRANSPORT_CAPABILITIES,
    cancel,
    run,
  });
}

export function isCurrentSearchResponse(
  response: SearchJobResponse,
  current: SearchRequestIdentity,
): boolean {
  return response.requestId === current.requestId && response.inputFingerprint === current.inputFingerprint;
}
