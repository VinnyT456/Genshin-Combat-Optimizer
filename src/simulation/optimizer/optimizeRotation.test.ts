import { describe, expect, it } from "vitest";
import { optimizeRotation } from "./optimizeRotation";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import { testElectro } from "@/game-data/characters/testElectro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { filterCharacters } from "@/game-data/characters/registry";
import type { OptimizerConfig } from "./CONTRACT";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allCharacters } from "@/game-data/characters/registry";

describe("optimizeRotation", () => {
  it("generates valid rotations without illegal actions", () => {
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 5.0,
      objective: "total-damage",
      topN: 3,
    };

    const result = optimizeRotation([testPyro], testEnemy, config);

    expect(result.ranked.length).toBeGreaterThan(0);
    expect(result.ranked.length).toBeLessThanOrEqual(config.topN);

    for (const item of result.ranked) {
      expect(item.rotation.length).toBeGreaterThan(0);
      // Engine must accept every action without warnings or errors
      expect(item.result.errors).toHaveLength(0);
      expect(
        item.result.structuredWarnings.filter((w) => w.actionIndex >= 0),
      ).toHaveLength(0);
      expect(item.result.totalDamage).toBeGreaterThan(0);
      expect(item.score).toBe(item.result.totalDamage);
    }
  });

  it("correctly ranks rotations according to total-damage objective", () => {
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 6.0,
      objective: "total-damage",
      topN: 4,
    };

    const result = optimizeRotation([testPyro], testEnemy, config);
    expect(result.ranked.length).toBeGreaterThan(1);

    for (let i = 0; i < result.ranked.length - 1; i++) {
      const current = result.ranked[i]!;
      const next = result.ranked[i + 1]!;
      expect(current.score).toBe(current.result.totalDamage);
      expect(next.score).toBe(next.result.totalDamage);
      expect(current.score).toBeGreaterThanOrEqual(next.score);
    }
  });

  it("correctly ranks rotations according to dps objective", () => {
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 6.0,
      objective: "dps",
      topN: 4,
    };

    const result = optimizeRotation([testPyro], testEnemy, config);
    expect(result.ranked.length).toBeGreaterThan(1);

    for (let i = 0; i < result.ranked.length - 1; i++) {
      const current = result.ranked[i]!;
      const next = result.ranked[i + 1]!;
      expect(current.score).toBe(current.result.dps);
      expect(next.score).toBe(next.result.dps);
      expect(current.score).toBeGreaterThanOrEqual(next.score);
    }
  });

  it("is 100% deterministic (repeated runs produce identical outputs)", () => {
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 5.0,
      objective: "total-damage",
      topN: 3,
    };

    const run1 = optimizeRotation([testPyro, testHydro], testEnemy, config);
    const run2 = optimizeRotation([testPyro, testHydro], testEnemy, config);

    expect(run1.nodesExpanded).toBe(run2.nodesExpanded);
    expect(run1.ranked.length).toBe(run2.ranked.length);

    for (let i = 0; i < run1.ranked.length; i++) {
      const r1 = run1.ranked[i]!;
      const r2 = run2.ranked[i]!;
      expect(r1.score).toBe(r2.score);
      expect(r1.rotation).toEqual(r2.rotation);
      expect(r1.result.totalDamage).toBe(r2.result.totalDamage);
      expect(r1.result.dps).toBe(r2.result.dps);
      expect(r1.result.duration).toBe(r2.result.duration);
    }
  });

  it("completes beam search within tight performance budget", () => {
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 10.0,
      objective: "total-damage",
      topN: 3,
    };

    const start = performance.now();
    const result = optimizeRotation([testPyro, testHydro], testEnemy, config);
    const elapsed = performance.now() - start;

    expect(result.nodesExpanded).toBeGreaterThan(0);
    expect(result.ranked.length).toBeGreaterThan(0);
    // Should comfortably complete under 2500ms even under full parallel test runner load
    expect(elapsed).toBeLessThan(2500);
  });

  it("explores team swaps and multi-character rotations", () => {
    const config: OptimizerConfig = {
      beamWidth: 10,
      simulationDuration: 8.0,
      objective: "total-damage",
      topN: 5,
    };

    const team = [testPyro, testHydro, testElectro];
    const result = optimizeRotation(team, testEnemy, config);

    expect(result.ranked.length).toBeGreaterThan(0);
    // At least one top rotation should incorporate a character swap
    const hasSwap = result.ranked.some((r) =>
      r.rotation.some((a) => a.actionType === "swap"),
    );
    expect(hasSwap).toBe(true);

    // Verify all actions in all returned rotations are completely legal
    for (const r of result.ranked) {
      expect(r.result.errors).toHaveLength(0);
      expect(
        r.result.structuredWarnings.filter((w) => w.actionIndex >= 0),
      ).toHaveLength(0);
    }
  });

  it("works with GenericCharacterDefinition (PlayableCharacter from registry)", () => {
    const amber = filterCharacters({ element: "pyro" }).find(
      (c) => c.id === "amber",
    )!;
    expect(amber).toBeDefined();

    const config: OptimizerConfig = {
      beamWidth: 4,
      simulationDuration: 4.0,
      objective: "total-damage",
      topN: 2,
    };

    const result = optimizeRotation([amber], testEnemy, config);
    expect(result.ranked.length).toBeGreaterThan(0);
    expect(result.ranked[0]?.result.totalDamage).toBeGreaterThan(0);
  });

  it("handles edge cases: empty team and zero duration gracefully", () => {
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 10.0,
      objective: "total-damage",
      topN: 3,
    };

    const emptyTeamRes = optimizeRotation([], testEnemy, config);
    expect(emptyTeamRes.ranked).toEqual([]);
    expect(emptyTeamRes.nodesExpanded).toBe(0);

    const zeroDurationConfig: OptimizerConfig = {
      ...config,
      simulationDuration: 0,
    };
    const zeroDurRes = optimizeRotation([testPyro], testEnemy, zeroDurationConfig);
    expect(zeroDurRes.ranked).toEqual([]);
    expect(zeroDurRes.nodesExpanded).toBe(0);
  });

  it("reports the bounded search identity and an honest stop reason", () => {
    const config: OptimizerConfig = {
      beamWidth: 3,
      simulationDuration: 4,
      objective: "dps",
      topN: 2,
    };

    const result = optimizeRotation([testPyro], testEnemy, config);

    expect(result.objective).toBe("dps");
    expect(result.budget).toEqual({
      beamWidth: 3,
      topN: 2,
      simulationDuration: 4,
      maxDepth: result.budget.maxDepth,
    });
    expect(result.nodesExpanded).toBeGreaterThan(0);
    expect(result.depthReached).toBeGreaterThan(0);
    expect(result.depthReached).toBeLessThanOrEqual(result.budget.maxDepth);
    expect(["completed", "budget-exhausted", "no-candidates"]).toContain(
      result.stopReason,
    );

    for (const [index, candidate] of result.ranked.entries()) {
      expect(candidate.rank).toBe(index + 1);
      expect(candidate.tieBreakKey).toContain(candidate.rotation[0]!.characterId);
    }
  });

  it("keeps metadata and ranking byte-identical across repeated runs", () => {
    const config: OptimizerConfig = {
      beamWidth: 4,
      simulationDuration: 5,
      objective: "total-damage",
      topN: 3,
    };

    const first = optimizeRotation([testPyro, testHydro], testEnemy, config);
    const second = optimizeRotation([testPyro, testHydro], testEnemy, config);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
  // -----------------------------------------------------------------------
  // THE END-TO-END HONESTY CHECK (added TASK #054, Phase D3).
  //
  // Every node is now expanded via `resumeFrom`, so the score attached to a
  // rotation is accumulated across MANY partial simulations and is never, at
  // any point, computed by running the emitted rotation start-to-finish. That
  // makes one failure mode invisible to all the tests above: the optimizer
  // could report a score that a straight replay of the SAME rotation does not
  // reproduce, and every internal consistency check would still pass.
  //
  // This test closes that loop from the OUTSIDE — it takes the emitted
  // rotation, replays it cold through the engine, and demands the number
  // match. It is also the guard for the optimizer's hard rule that it must
  // never emit an illegal rotation (D2 repair must have removed every skipped
  // action, not merely scored around it).
  // -----------------------------------------------------------------------
  it("emits rotations that replay COLD to the reported damage, legally", () => {
    const TEAM = allCharacters.slice(0, 4);
    for (const simulationDuration of [5, 20, 80]) {
      const config: OptimizerConfig = {
        beamWidth: 8,
        simulationDuration,
        objective: "total-damage",
        topN: 5,
      };
      const result = optimizeRotation(TEAM, testEnemy, config);
      expect(result.ranked.length).toBeGreaterThan(0);

      for (const entry of result.ranked) {
        const replay = simulateRotation(TEAM, entry.rotation, testEnemy, {
          timeLimit: simulationDuration,
        });
        // The reported score must survive an independent cold replay.
        expect(replay.totalDamage).toBeCloseTo(entry.result.totalDamage, 6);
        // ...and the emitted rotation must be executable in FULL: no errors
        // and no action-level warning (which would mean an action was SKIPPED).
        expect(replay.errors).toEqual([]);
        expect(
          replay.structuredWarnings.filter((w) => w.actionIndex >= 0),
        ).toEqual([]);
      }

      // Ranking must be a total, non-increasing order.
      const damages = result.ranked.map((r) => r.result.totalDamage);
      for (let i = 1; i < damages.length; i++) {
        expect(damages[i - 1]!).toBeGreaterThanOrEqual(damages[i]!);
      }
    }
  }, 120000);

});
