import { describe, expect, it } from "vitest";
import { testHydro } from "@/game-data/characters/testHydro";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { Rotation } from "@/types";
import { optimizeRotationPortfolio } from "./portfolioOptimizer";
import { rotationKey } from "./rotationIdentity";

describe("optimizeRotationPortfolio", () => {
  const team = [testPyro, testHydro];
  const initialRotation: Rotation = [
    { characterId: testPyro.id, actionType: "skill" },
    { characterId: testPyro.id, actionType: "normal" },
  ];

  it("runs the complete constrained portfolio and never emits an illegal result", () => {
    const result = optimizeRotationPortfolio({
      initialRotation,
      team,
      enemy: testEnemy,
      config: {
        simulationDuration: 5,
        maxEvaluations: 40,
        maxDepth: 2,
        populationSize: 4,
        generations: 2,
        beamWidth: 2,
        topN: 3,
        seed: 11,
      },
    });

    expect(result.baseline).not.toBeNull();
    expect(result.topRotations.length).toBeLessThanOrEqual(3);
    expect(result.algorithmStats.map((entry) => entry.algorithm)).toEqual([
      "local",
      "beam",
      "genetic",
    ]);
    expect(result.topRotations[0]?.score ?? 0).toBeGreaterThanOrEqual(
      result.baseline?.score ?? 0,
    );
    for (const candidate of result.topRotations) {
      const replay = simulateRotation(team, candidate.rotation, testEnemy, {
        timeLimit: 5,
      });
      expect(replay.errors).toEqual([]);
      expect(replay.structuredWarnings.filter((warning) => warning.actionIndex >= 0)).toEqual([]);
      expect(candidate.dps).toBeCloseTo(replay.dps, 10);
      expect(candidate.totalDamage).toBeCloseTo(replay.totalDamage, 10);
    }
  });

  it("includes the original rotation when it is the only requested algorithm", () => {
    const result = optimizeRotationPortfolio({
      initialRotation,
      team,
      enemy: testEnemy,
      config: {
        simulationDuration: 5,
        maxEvaluations: 10,
        maxDepth: 0,
        topN: 1,
        algorithms: [],
      },
    });
    expect(result.baseline).not.toBeNull();
    expect(result.topRotations).toHaveLength(1);
    expect(rotationKey(result.topRotations[0]!.rotation)).toBe(rotationKey(initialRotation));
    expect(result.topRotations[0]!.editsFromOriginal).toBe(0);
  });

  it("rejects an invalid original rotation without throwing", () => {
    const result = optimizeRotationPortfolio({
      initialRotation: [{ characterId: "missing", actionType: "skill" }],
      team,
      enemy: testEnemy,
      config: { simulationDuration: 5, maxEvaluations: 10 },
    });
    expect(result.baseline).toBeNull();
    expect(result.topRotations).toEqual([]);
    expect(result.stopReason).toBe("no-candidates");
  });

  it("ranks evaluated sequences by the selected damage objective", () => {
    for (const objective of ["total-damage", "dps"] as const) {
      const result = optimizeRotationPortfolio({
        initialRotation,
        team,
        enemy: testEnemy,
        config: {
          objective,
          simulationDuration: 5,
          maxEvaluations: 40,
          maxDepth: 2,
          populationSize: 4,
          generations: 2,
          beamWidth: 2,
          topN: 3,
          seed: 11,
        },
      });

      expect(result.topRotations.length).toBeGreaterThan(0);
      for (let index = 0; index < result.topRotations.length; index += 1) {
        const candidate = result.topRotations[index]!;
        expect(candidate.score).toBe(
          objective === "total-damage" ? candidate.totalDamage : candidate.dps,
        );
        const next = result.topRotations[index + 1];
        if (next !== undefined) {
          expect(candidate.score).toBeGreaterThanOrEqual(next.score);
        }
      }
    }
  });
});
