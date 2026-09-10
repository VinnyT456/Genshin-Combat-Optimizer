import { describe, expect, it } from "vitest";
import { createSearchRun, reduceSearchRun, requestFingerprint } from "./searchState";

describe("search run identity", () => {
  it("ignores completion from an obsolete run", () => {
    const current = createSearchRun("run-new", requestFingerprint({ duration: 20 }));
    const outcome = {
      candidates: [{ score: 1 }],
    } as never;
    const next = reduceSearchRun(current, {
      type: "completed",
      runId: "run-old",
      outcome,
    });
    expect(next).toBe(current);
  });

  it("accepts completion only for the active run", () => {
    const current = reduceSearchRun(
      createSearchRun("run-1", "fingerprint"),
      { type: "started", runId: "run-1" },
    );
    const next = reduceSearchRun(current, {
      type: "completed",
      runId: "run-1",
      outcome: { candidates: [], requestedTopN: 5, nodesExpanded: 0, budget: "fast", objective: "dps", durationSeconds: 20, beamWidth: 4 },
    });
    expect(next.status).toBe("empty");
  });
});
