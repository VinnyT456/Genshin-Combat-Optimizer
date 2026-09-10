import type { SearchOutcome } from "./optimizerAdapter";
import { fingerprintSerializable } from "./searchTransport";

export type SearchJobStatus = "idle" | "queued" | "running" | "canceling" | "canceled" | "succeeded" | "empty" | "failed";
export type SearchProgress =
  | { readonly kind: "indeterminate"; readonly nodesExpanded: number; readonly depth?: number }
  | { readonly kind: "determinate"; readonly completed: number; readonly total: number; readonly nodesExpanded: number; readonly depth?: number };

export interface SearchRunViewModel {
  readonly runId: string;
  readonly requestFingerprint: string;
  readonly status: SearchJobStatus;
  readonly progress: SearchProgress | null;
  readonly outcome: SearchOutcome | null;
  readonly error: string | null;
}

export type SearchJobEvent =
  | { readonly type: "started"; readonly runId: string }
  | { readonly type: "progress"; readonly runId: string; readonly progress: SearchProgress }
  | { readonly type: "completed"; readonly runId: string; readonly outcome: SearchOutcome }
  | { readonly type: "canceled"; readonly runId: string }
  | { readonly type: "failed"; readonly runId: string; readonly error: string };

export function createSearchRun(runId: string, requestFingerprint: string): SearchRunViewModel {
  return { runId, requestFingerprint, status: "queued", progress: null, outcome: null, error: null };
}

/** Late events from an obsolete run cannot replace the active run. */
export function reduceSearchRun(current: SearchRunViewModel, event: SearchJobEvent): SearchRunViewModel {
  if (event.runId !== current.runId) return current;
  switch (event.type) {
    case "started": return { ...current, status: "running" };
    case "progress":
      if (current.status !== "running" && current.status !== "queued") return current;
      return { ...current, status: "running", progress: event.progress };
    case "completed": return { ...current, status: event.outcome.candidates.length > 0 ? "succeeded" : "empty", outcome: event.outcome, progress: null };
    case "canceled": return { ...current, status: "canceled", progress: null };
    case "failed": return { ...current, status: "failed", error: event.error, progress: null };
  }
}

/** Request identity uses the same canonical representation as the transport. */
export function requestFingerprint(value: unknown): string {
  return fingerprintSerializable(prepareForIdentity(value));
}

/** Search identity accepts domain objects with optional fields and resolvers. */
function prepareForIdentity(value: unknown, active = new Set<object>()): unknown {
  if (value === undefined) return null;
  if (typeof value === "function") return "[function]";
  if (typeof value === "number" && !Number.isFinite(value)) return String(value);
  if (value === null || typeof value !== "object") return value;
  if (active.has(value)) return "[cycle]";
  active.add(value);
  try {
    if (Array.isArray(value)) return value.map((item) => prepareForIdentity(item, active));
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      result[key] = prepareForIdentity((value as Record<string, unknown>)[key], active);
    }
    return result;
  } finally {
    active.delete(value);
  }
}
