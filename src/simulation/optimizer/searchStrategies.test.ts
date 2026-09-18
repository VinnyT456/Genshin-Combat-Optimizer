import { describe, expect, it } from "vitest";
import type { Rotation } from "@/types";
import {
  beamSearch,
  geneticSearch,
  localSearch,
  type SearchConfig,
  type SearchContext,
} from "./searchStrategies";
import { rotationKey } from "./rotationIdentity";

const initial: Rotation = [{ characterId: "a", actionType: "normal" }];
const skill: Rotation = [{ characterId: "a", actionType: "skill" }];

const config: SearchConfig = {
  topN: 5,
  maxEvaluations: 50,
  maxDepth: 3,
  beamWidth: 2,
  populationSize: 4,
  generations: 3,
  mutationRate: 1,
  eliteCount: 1,
  seed: 7,
};

function contextWithBudget(maxEvaluations = config.maxEvaluations): SearchContext {
  let evaluations = 0;
  return {
    objective: "dps",
    remainingEvaluations: () => maxEvaluations - evaluations,
    evaluate: (rotation) => {
      if (evaluations >= maxEvaluations) return undefined;
      evaluations += 1;
      const score = rotation.some((action) => action.actionType === "skill") ? 10 : 1;
      return {
        rotation,
        score,
        totalDamage: score,
        duration: 1,
        dps: score,
        valid: true,
      };
    },
    mutate: (rotation) =>
      rotation.some((action) => action.actionType === "skill")
        ? []
        : [skill],
  };
}

describe("MVP search strategies", () => {
  it("hill climbing finds an improving neighboring rotation and terminates", () => {
    const result = localSearch(initial, contextWithBudget(), config);
    expect(result.candidates[0]?.score).toBe(10);
    expect(result.iterations).toBeLessThanOrEqual(config.maxDepth);
    expect(result.budgetExhausted).toBe(false);
  });

  it("beam search respects width, depth and evaluation budget", () => {
    const result = beamSearch(initial, contextWithBudget(2), config);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.depthReached).toBeLessThanOrEqual(config.maxDepth);
    expect(result.budgetExhausted).toBe(true);
  });

  it("genetic search is reproducible with a fixed seed", () => {
    const first = geneticSearch(initial, contextWithBudget(), config);
    const second = geneticSearch(initial, contextWithBudget(), config);
    expect(first.candidates.map((entry) => rotationKey(entry.rotation))).toEqual(
      second.candidates.map((entry) => rotationKey(entry.rotation)),
    );
    expect(first.iterations).toBeLessThanOrEqual(config.generations);
  });

  it("continues past invalid offspring instead of aborting the generation", () => {
    let calls = 0;
    const context: SearchContext = {
      ...contextWithBudget(),
      evaluate: (rotation) => {
        calls += 1;
        if (rotation.length > 1) return null;
        return {
          rotation,
          score: 1,
          totalDamage: 1,
          duration: 1,
          dps: 1,
          valid: true,
        };
      },
      mutate: () => [
        [{ characterId: "a", actionType: "normal" }],
        [{ characterId: "a", actionType: "skill" }],
      ],
    };
    const result = beamSearch(initial, context, config);
    expect(calls).toBeGreaterThan(1);
    expect(result.candidates.every((entry) => entry.rotation.length === 1)).toBe(true);
  });
});
