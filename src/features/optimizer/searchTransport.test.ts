import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { testPyro } from "@/game-data/characters/testPyro";
import type { SearchRequest } from "./optimizerAdapter";
import {
  canonicalizeSerializable,
  createLocalSearchJob,
  createSearchJobRequest,
  fingerprintSerializable,
  isCurrentSearchResponse,
} from "./searchTransport";

const request: SearchRequest = {
  team: [testPyro],
  enemy: testEnemy,
  budget: "fast",
  objective: "total-damage",
  durationSeconds: 5,
  config: {},
};

describe("search transport request identity", () => {
  it("canonicalizes object key order and gives equivalent requests one identity", () => {
    expect(canonicalizeSerializable({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(fingerprintSerializable({ b: 2, a: 1 })).toBe(
      fingerprintSerializable({ a: 1, b: 2 }),
    );
    const first = createSearchJobRequest("run-1", request);
    const second = createSearchJobRequest("run-2", { ...request, config: {} });
    expect(first.inputFingerprint).toBe(second.inputFingerprint);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.payload)).toBe(true);
    expect(() => {
      (first.payload as { durationSeconds: number }).durationSeconds = 60;
    }).toThrow();
  });

  it("rejects functions, non-finite values, and cycles before execution", () => {
    expect(() => canonicalizeSerializable({ resolver: () => 1 })).toThrow(/functions/);
    expect(() => canonicalizeSerializable({ value: Number.NaN })).toThrow(/non-finite/);
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(() => canonicalizeSerializable(cyclic)).toThrow(/cyclic/);
  });
});

describe("local search job", () => {
  it("runs the deterministic adapter and emits honest lifecycle metadata", async () => {
    const envelope = createSearchJobRequest("run-1", request);
    const job = createLocalSearchJob(envelope);
    const events: string[] = [];
    const response = await job.run((event) => events.push(event.type));

    expect(job.capabilities).toEqual({
      worker: false,
      liveProgress: false,
      cancellation: false,
      resume: false,
    });
    expect(job.cancel()).toEqual({ acknowledged: false, reason: "unsupported" });
    expect(events).toEqual(["started", "completed"]);
    expect(response.kind).toBe("succeeded");
    if (response.kind !== "succeeded") return;
    expect(response.replay.mode).toBe("optimizer-emission-cold-replay");
    expect(response.replay.inputFingerprint).toBe(envelope.inputFingerprint);
    expect(response.replay.candidateFingerprints).toHaveLength(response.outcome.candidates.length);
    expect(isCurrentSearchResponse(response, envelope)).toBe(true);
    expect(isCurrentSearchResponse(response, { ...envelope, requestId: "run-old" })).toBe(false);
  });
});
