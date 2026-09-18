import { describe, expect, it } from "vitest";
import { allCharacters } from "@/game-data";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { testPyro } from "@/game-data/characters/testPyro";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import type { SearchRequest } from "./optimizerAdapter";
import {
  canonicalizeSerializable,
  createLocalSearchJob,
  createWorkerSearchJob,
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
    expect(canonicalizeSerializable({ omitted: undefined, nested: { alsoOmitted: undefined, value: 1 } })).toBe(
      '{"nested":{"value":1}}',
    );
    expect(canonicalizeSerializable({ value: 1 })).toBe(
      canonicalizeSerializable({ value: 1, optional: undefined }),
    );
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

  it("round-trips permanent-effect Infinity through a frozen search payload", () => {
    const envelope = createSearchJobRequest("non-finite-config", {
      ...request,
      config: { timeLimit: Number.POSITIVE_INFINITY },
    });

    expect(envelope.payload.config.timeLimit).toBe(Number.POSITIVE_INFINITY);
    expect(Object.isFrozen(envelope.payload)).toBe(true);
    expect(Object.isFrozen(envelope.payload.config)).toBe(true);
    expect(envelope.inputFingerprint).toMatch(/^fnv1a-[0-9a-f]{8}$/);
  });

  it("accepts a real website character with optional kit fields", () => {
    const character = allCharacters.find((entry) => entry.id === "skirk");
    expect(character).toBeDefined();
    expect(() => createSearchJobRequest("website-character", {
      ...request,
      team: [toWebsiteCharacter(character!)],
    })).not.toThrow();
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

describe("worker search job", () => {
  it("keeps the Worker boundary to plain messages and forwards progress", async () => {
    const messages: unknown[] = [];
    const fakeWorker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      postMessage(message: unknown) {
        messages.push(message);
        const request = message as { request: typeof envelope };
        const outcome = {
          candidates: [], requestedTopN: 5, nodesExpanded: 0,
          budget: request.request.payload.budget,
          objective: request.request.payload.objective,
          durationSeconds: 5, beamWidth: 4,
        };
        const identity = { requestId: envelope.requestId, inputFingerprint: envelope.inputFingerprint };
        this.onmessage?.({ data: { type: "started", ...identity, attempt: 1 } } as MessageEvent);
        this.onmessage?.({ data: { type: "progress", ...identity, progress: { kind: "indeterminate", nodesExpanded: 0 } } } as MessageEvent);
        this.onmessage?.({ data: { type: "completed", ...identity, response: {
          ...identity, kind: "succeeded", outcome,
          replay: { mode: "optimizer-emission-cold-replay", inputFingerprint: identity.inputFingerprint, candidateFingerprints: [] },
        } } } as MessageEvent);
      },
      terminate() { /* fake */ },
    };
    const envelope = createSearchJobRequest("worker-1", request);
    const events: string[] = [];
    const response = await createWorkerSearchJob(envelope, () => fakeWorker).run((event) => events.push(event.type));
    expect(messages[0]).toEqual({ type: "search", request: envelope, attempt: 1 });
    expect(events).toEqual(["started", "progress", "completed"]);
    expect(response.kind).toBe("succeeded");
  });

  it("acknowledges cancellation and ignores an obsolete identity", async () => {
    const worker: { onmessage: ((event: MessageEvent) => void) | null; onerror: ((event: ErrorEvent) => void) | null; postMessage: (message: unknown) => void; terminate: () => void } = {
      onmessage: null, onerror: null,
      postMessage() { /* intentionally pending */ },
      terminate() { /* fake */ },
    };
    const job = createWorkerSearchJob(createSearchJobRequest("worker-2", request), () => worker);
    const events: string[] = [];
    const pending = job.run((event) => events.push(event.type));
    worker.onmessage?.({ data: { type: "completed", requestId: "old", inputFingerprint: "old", response: {} } } as MessageEvent);
    expect(job.cancel()).toEqual({ acknowledged: true, reason: "requested" });
    await expect(pending).resolves.toMatchObject({ kind: "canceled", reason: "requested" });
    expect(events).toEqual(["canceled"]);
  });
});
