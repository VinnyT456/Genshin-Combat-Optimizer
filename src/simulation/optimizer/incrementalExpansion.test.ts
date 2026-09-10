import { describe, expect, it } from "vitest";
import { optimizeRotation } from "./optimizeRotation";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allCharacters } from "@/game-data/characters/registry";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { hasSkippedActions } from "./candidateAdmission";
import type { OptimizerConfig } from "./CONTRACT";

// ============================================================================
// B2 / D3 — incremental expansion via `resumeFrom`.
//
// The search now expands a node by simulating ONLY the appended action,
// resuming from the parent's snapshot. That is a large behavioural change to
// the hot loop, and it introduces two specific ways to be wrong:
//
//   1. SUFFIX LEAKAGE. A resumed `SimulationResult` reports suffix-only
//      `totalDamage`, `duration`, `dps` and `timeline`. If one of those ever
//      reaches a caller, `ranked[i].result` silently describes one action
//      instead of the whole rotation. These tests pin the emitted result to
//      the WHOLE rotation.
//
//   2. SCORE DRIFT. The search ranks on damage accumulated across suffixes,
//      while the emitted score is computed from a single from-zero run. Those
//      two numbers must agree, or the ranking is not the ranking that was
//      searched.
// ============================================================================

const TEAM = allCharacters.slice(0, 4);

describe("incremental expansion via resumeFrom", () => {
  it("the emitted result describes the WHOLE rotation, not the last suffix", () => {
    const config: OptimizerConfig = {
      beamWidth: 6,
      simulationDuration: 15,
      objective: "total-damage",
      topN: 5,
    };
    const out = optimizeRotation(TEAM, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(0);

    for (const ranked of out.ranked) {
      const fromZero = simulateRotation(TEAM, ranked.rotation, testEnemy, {
        timeLimit: config.simulationDuration,
      });

      // Byte-level agreement on the headline quantities. A suffix leak would
      // show up here as a result far smaller than the from-zero run.
      expect(ranked.result.totalDamage).toBe(fromZero.totalDamage);
      expect(ranked.result.duration).toBe(fromZero.duration);
      expect(ranked.result.timeline.length).toBe(fromZero.timeline.length);
      expect(ranked.result.finalState.time).toBe(fromZero.finalState.time);

      // The result must cover every action, so a multi-action rotation cannot
      // report a single-action timeline.
      if (ranked.rotation.length > 1) {
        expect(ranked.result.timeline.length).toBeGreaterThan(1);
      }
    }
  });

  it("the emitted score matches the emitted result", () => {
    for (const objective of ["total-damage", "dps"] as const) {
      const config: OptimizerConfig = {
        beamWidth: 6,
        simulationDuration: 15,
        objective,
        topN: 5,
      };
      const out = optimizeRotation(TEAM, testEnemy, config);
      expect(out.ranked.length).toBeGreaterThan(0);

      for (const ranked of out.ranked) {
        const expected =
          objective === "dps"
            ? ranked.result.dps
            : ranked.result.totalDamage;
        expect(ranked.score).toBe(expected);
      }
    }
  });

  it("ranking is monotonically non-increasing in score", () => {
    // The search ranks on accumulated suffix damage but emits a score from a
    // from-zero run. If those disagreed, the emitted list would not be sorted.
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 15,
      objective: "total-damage",
      topN: 6,
    };
    const out = optimizeRotation(TEAM, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(1);
    for (let i = 1; i < out.ranked.length; i++) {
      expect(out.ranked[i - 1]!.score).toBeGreaterThanOrEqual(
        out.ranked[i]!.score,
      );
    }
  });

  it("accumulated suffix damage equals the from-zero total", () => {
    // The additivity the search depends on, asserted directly against the
    // engine rather than assumed. Reactions make damage path-dependent, so
    // this is a real property of resume, not arithmetic.
    const team = [testPyro, testHydro];
    const cfg = { timeLimit: 30 };
    const rotation = [
      { characterId: testPyro.id, actionType: "skill" as const },
      { characterId: testHydro.id, actionType: "swap" as const },
      { characterId: testHydro.id, actionType: "skill" as const },
      { characterId: testHydro.id, actionType: "normal" as const },
    ];

    const full = simulateRotation(team, rotation, testEnemy, cfg);

    let accumulated = 0;
    let snapshot = simulateRotation(team, [], testEnemy, cfg).finalState;
    for (const action of rotation) {
      const step = simulateRotation(team, [action], testEnemy, {
        ...cfg,
        resumeFrom: snapshot,
      });
      accumulated += step.totalDamage;
      snapshot = step.finalState;
    }

    expect(accumulated).toBeCloseTo(full.totalDamage, 6);
    expect(snapshot.time).toBeCloseTo(full.finalState.time, 9);
  });

  it("still emits only rotations that run clean from t=0", () => {
    // The D2 legality invariant, re-established after the expansion rewrite.
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 20,
      objective: "total-damage",
      topN: 6,
    };
    const out = optimizeRotation(TEAM, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(0);

    for (const ranked of out.ranked) {
      const replay = simulateRotation(TEAM, ranked.rotation, testEnemy, {
        timeLimit: config.simulationDuration,
      });
      expect(replay.errors).toEqual([]);
      expect(hasSkippedActions(replay)).toBe(false);
    }
  });

  it("stays deterministic under incremental expansion", () => {
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 20,
      objective: "dps",
      topN: 5,
    };
    const a = optimizeRotation(TEAM, testEnemy, config);
    const b = optimizeRotation(TEAM, testEnemy, config);
    expect(a.nodesExpanded).toBe(b.nodesExpanded);
    expect(JSON.stringify(a.ranked)).toBe(JSON.stringify(b.ranked));
  });

  it("respects the combat window as the ENGINE defines it", () => {
    // `timeLimit` is ABSOLUTE (checked against the real clock, not elapsed
    // suffix time), so the window still closes correctly on a resumed run.
    //
    // NOTE ON THE BOUND. The engine admits an action that STARTS inside the
    // window and lets it finish past the limit: a 12s window was measured
    // ending at 12.4s on a 0.8s-cast skill, with NO `past-time-limit` warning.
    // Verified to be pre-existing engine semantics, reproduced by a plain
    // from-zero `simulateRotation` with no optimizer involved — so the
    // assertion is `< limit + longest single action`, not `<= limit`. Pinning
    // `<= limit` would encode a rule the engine does not implement.
    const DURATION = 12;
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: DURATION,
      objective: "total-damage",
      topN: 5,
    };
    const out = optimizeRotation(TEAM, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(0);

    for (const ranked of out.ranked) {
      const fromZero = simulateRotation(TEAM, ranked.rotation, testEnemy, {
        timeLimit: DURATION,
      });
      // The optimizer's window agrees exactly with the engine's own.
      expect(ranked.result.finalState.time).toBe(fromZero.finalState.time);
      // The overrun is bounded by one action, never unbounded.
      const lastDuration = fromZero.timeline.reduce(
        (max, e) => (e.duration !== undefined && e.duration > max ? e.duration : max),
        0,
      );
      expect(ranked.result.finalState.time).toBeLessThanOrEqual(
        DURATION + lastDuration,
      );
    }
  });
});
