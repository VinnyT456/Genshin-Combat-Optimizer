import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { testPyro } from "@/game-data/characters/testPyro";
import type { Rotation } from "@/types";
import { runSearch, type SearchRequest } from "./optimizerAdapter";

const initialRotation: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
];

const authoredRotation: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
  { characterId: testPyro.id, actionType: "normal" },
  { characterId: testPyro.id, actionType: "burst" },
  { characterId: testPyro.id, actionType: "charged" },
];

function request(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    team: [testPyro],
    enemy: testEnemy,
    initialRotation,
    budget: "fast",
    objective: "total-damage",
    durationSeconds: 5,
    config: { critMode: "never" },
    ...overrides,
  };
}

describe("optimizer frontend adapter", () => {
  it("does not invent actions when the current rotation is empty", () => {
    const outcome = runSearch(request({ initialRotation: [] }));

    expect(outcome.candidates).toEqual([]);
    expect(outcome.stopReason).toBe("no-candidates");
  });

  it("uses the current rotation as the portfolio baseline", () => {
    const outcome = runSearch(
      request({
        initialRotation: [{ characterId: "not-on-team", actionType: "skill" }],
      }),
    );

    expect(outcome.candidates).toEqual([]);
    expect(outcome.stopReason).toBe("no-candidates");
  });

  it("starts search candidates with full ordinary energy", () => {
    const outcome = runSearch(request({
      initialRotation: [{ characterId: testPyro.id, actionType: "burst" }],
    }));

    expect(outcome.candidates.length).toBeGreaterThan(0);
    expect(outcome.stopReason).not.toBe("no-candidates");
  });

  it("only reorders the authored action set", () => {
    const outcome = runSearch(
      request({ team: [testPyro], initialRotation: authoredRotation }),
    );
    const actionSignatures = (rotation: Rotation) =>
      rotation.map((action) => JSON.stringify(action)).sort();

    expect(outcome.candidates.length).toBeGreaterThan(0);
    expect(outcome.stopReason).not.toBe("no-candidates");
    for (const candidate of outcome.candidates) {
      expect(candidate.rotation).toHaveLength(authoredRotation.length);
      expect(actionSignatures(candidate.rotation)).toEqual(actionSignatures(authoredRotation));
    }
  });

  it("passes the current equipment into every candidate simulation", () => {
    const bare = runSearch(request());
    const geared = runSearch(
      request({
        equipment: {
          [testPyro.id]: {
            artifactLoadout: {
              flower: {
                slot: "flower",
                setId: "adapter-test-set",
                mainStat: { stat: "atkFlat", value: 100 },
                substats: [],
              },
            },
          },
        },
      }),
    );

    expect(geared.candidates[0]?.score ?? 0).toBeGreaterThan(
      bare.candidates[0]?.score ?? 0,
    );
  });
});
