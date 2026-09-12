import { runSearch } from "./optimizerAdapter";
import {
  fingerprintSerializable,
  type SearchJobFailure,
  type SearchJobSuccess,
  type SearchWorkerMessage,
  type SearchWorkerRequest,
} from "./searchTransport";

type WorkerScope = {
  onmessage: ((event: MessageEvent<SearchWorkerRequest>) => void) | null;
  postMessage: (message: SearchWorkerMessage) => void;
};

const scope = globalThis as unknown as WorkerScope;

function candidateFingerprint(candidate: SearchJobSuccess["outcome"]["candidates"][number]): string {
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

scope.onmessage = (event) => {
  const message = event.data;
  if (message.type !== "search") return;
  const { request, attempt } = message;
  const identity = { requestId: request.requestId, inputFingerprint: request.inputFingerprint };
  scope.postMessage({ type: "started", ...identity, attempt });
  scope.postMessage({ type: "progress", ...identity, progress: { kind: "indeterminate", nodesExpanded: 0 } });
  try {
    const outcome = runSearch(request.payload);
    const response: SearchJobSuccess = {
      ...identity,
      kind: "succeeded",
      outcome,
      replay: {
        mode: "optimizer-emission-cold-replay",
        inputFingerprint: request.inputFingerprint,
        candidateFingerprints: outcome.candidates.map(candidateFingerprint),
      },
    };
    scope.postMessage({ type: "completed", ...identity, response });
  } catch (error) {
    const response: SearchJobFailure = {
      ...identity,
      kind: "failed",
      code: "execution-failed",
      message: error instanceof Error ? error.message : "Search execution failed",
      attempt,
      retryable: false,
    };
    scope.postMessage({ type: "failed", ...identity, response });
  }
};
