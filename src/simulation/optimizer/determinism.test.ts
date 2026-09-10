import { describe, expect, it } from "vitest";
import type { CharacterDefinition, EnemyState } from "@/types";
import { compareNodes, optimizeRotation } from "./optimizeRotation";
import type { SearchNode } from "./optimizeRotation";
import { generateCandidateActions } from "./actionGenerator";
import type { OptimizerConfig } from "./CONTRACT";

// ============================================================================
// Determinism + total-ranking hardening.
//
// SYNTHETIC fixtures only. `src/game-data/characters/*` multipliers carry no
// source citations and are under provenance audit (TASK #028), so pinning
// search behaviour to them would pin unverified numbers. Determinism and
// ranking are properties of the SEARCH, not of any character's balance.
// ============================================================================

const enemy: EnemyState = {
  id: "synthetic-target",
  name: "Synthetic Target",
  level: 90,
  resistances: { pyro: 0.1, hydro: 0.1 },
};

function synthetic(
  id: string,
  element: CharacterDefinition["element"],
  atk: number,
): CharacterDefinition {
  const ability = (
    suffix: string,
    actionType: "normal" | "charged" | "skill" | "burst",
    damageType: "normal" | "charged" | "skill" | "burst",
    multiplier: number,
    castTime: number,
    cooldown: number,
    energyCost: number,
    energyGenerated: number,
  ) => ({
    id: `${id}-${suffix}`,
    name: `${id} ${suffix}`,
    actionType,
    element,
    damageType,
    multiplier,
    scaling: "atk" as const,
    castTime,
    cooldown,
    energyCost,
    energyGenerated,
  });

  return {
    id,
    name: id,
    element,
    level: 90,
    baseStats: {
      atk,
      hp: 10000,
      def: 700,
      elementalMastery: 0,
      critRate: 0.5,
      critDmg: 1.0,
      energyRecharge: 1.0,
      dmgBonus: 0,
      elementalDmgBonus: {},
    },
    maxEnergy: 40,
    normalAttack: ability("na", "normal", "normal", 1.0, 0.5, 0, 0, 1),
    chargedAttack: ability("ca", "charged", "charged", 1.5, 0.7, 0, 0, 1),
    elementalSkill: ability("e", "skill", "skill", 2.0, 0.6, 6, 0, 3),
    elementalBurst: ability("q", "burst", "burst", 4.0, 1.0, 15, 40, 0),
  };
}

const alpha = synthetic("alpha", "pyro", 2000);
const beta = synthetic("beta", "hydro", 1800);

const config: OptimizerConfig = {
  beamWidth: 6,
  simulationDuration: 8,
  objective: "total-damage",
  topN: 5,
};

describe("optimizer determinism", () => {
  it("produces a byte-identical OptimizationResult across runs", () => {
    const a = optimizeRotation([alpha, beta], enemy, config);
    const b = optimizeRotation([alpha, beta], enemy, config);
    // Byte-identical, not field-by-field: this catches drift in ANY nested
    // part of the returned SimulationResult, including the full timeline.
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is byte-identical for the dps objective too", () => {
    const dpsConfig: OptimizerConfig = { ...config, objective: "dps" };
    const a = optimizeRotation([alpha, beta], enemy, dpsConfig);
    const b = optimizeRotation([alpha, beta], enemy, dpsConfig);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("does not depend on team array insertion order for its best score", () => {
    // Swapping the argument order changes Object.keys order downstream. The
    // best achievable score is a property of the team, not of its ordering.
    const a = optimizeRotation([alpha, beta], enemy, config);
    const b = optimizeRotation([beta, alpha], enemy, config);
    expect(a.ranked[0]!.score).toBeCloseTo(b.ranked[0]!.score, 6);
  });

  it("generates candidate actions deterministically", () => {
    const first = generateCandidateActions([alpha, beta], {
      time: 0,
      characters: {},
    });
    const second = generateCandidateActions([alpha, beta], {
      time: 0,
      characters: {},
    });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe("optimizer ranking", () => {
  it("returns a totally ordered, non-increasing ranking", () => {
    const result = optimizeRotation([alpha, beta], enemy, config);
    expect(result.ranked.length).toBeGreaterThan(0);
    for (let i = 1; i < result.ranked.length; i++) {
      expect(result.ranked[i - 1]!.score).toBeGreaterThanOrEqual(
        result.ranked[i]!.score,
      );
    }
  });

  it("never returns more than topN", () => {
    for (const topN of [1, 2, 3]) {
      const r = optimizeRotation([alpha, beta], enemy, { ...config, topN });
      expect(r.ranked.length).toBeLessThanOrEqual(topN);
    }
  });

  it("returns distinct rotations (no duplicate entries)", () => {
    const r = optimizeRotation([alpha, beta], enemy, config);
    const keys = r.ranked.map((x) => JSON.stringify(x.rotation));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("score agrees with the objective actually reported by the engine", () => {
    const total = optimizeRotation([alpha, beta], enemy, config);
    for (const entry of total.ranked) {
      expect(entry.score).toBe(entry.result.totalDamage);
    }
    const dps = optimizeRotation([alpha, beta], enemy, {
      ...config,
      objective: "dps",
    });
    for (const entry of dps.ranked) {
      expect(entry.score).toBe(entry.result.dps);
    }
  });

  it("emits only rotations the engine accepts without action-level warnings", () => {
    const r = optimizeRotation([alpha, beta], enemy, config);
    for (const entry of r.ranked) {
      expect(entry.result.errors).toHaveLength(0);
      const actionWarnings = entry.result.structuredWarnings.filter(
        (w) => w.actionIndex >= 0,
      );
      expect(actionWarnings).toHaveLength(0);
    }
  });

  it("a wider beam never scores worse than a narrow one (monotone quality)", () => {
    const narrow = optimizeRotation([alpha, beta], enemy, {
      ...config,
      beamWidth: 1,
    });
    const wide = optimizeRotation([alpha, beta], enemy, {
      ...config,
      beamWidth: 12,
    });
    expect(wide.ranked[0]!.score).toBeGreaterThanOrEqual(
      narrow.ranked[0]!.score - 1e-6,
    );
  });
});

describe("optimizer action space", () => {
  it("pins an explicit normalIndex on every generated normal attack", () => {
    // Without a pinned index, `normal` can only mean "whatever comes next", so
    // N2-without-N1 is UNGENERATABLE — invisible to pruning rather than
    // rejected by it. This is the B2 defect.
    const actions = generateCandidateActions([alpha], {
      time: 0,
      characters: {},
    });
    const normals = actions.filter((a) => a.actionType === "normal");
    expect(normals.length).toBeGreaterThan(0);
    for (const n of normals) {
      expect(n.normalIndex).toBeTypeOf("number");
    }
  });

  it("never emits an action for a character not on the team", () => {
    const teamIds = new Set([alpha.id, beta.id]);
    const r = optimizeRotation([alpha, beta], enemy, config);
    for (const entry of r.ranked) {
      for (const action of entry.rotation) {
        expect(teamIds.has(action.characterId)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Comparator totality.
//
// An in-process rerun CANNOT detect a missing tie-break: `Array.sort` is
// spec-stable, so ties silently keep insertion order and both runs agree.
// Mutation-verified: deleting the rotationKey tie-break leaves every
// byte-identity test above green. The ordering property therefore has to be
// asserted on the comparator itself.
// ---------------------------------------------------------------------------

function node(
  rotation: { characterId: string; actionType: "normal"; normalIndex?: number }[],
  totalDamage: number,
  dps: number,
): SearchNode {
  // `totalDamage` / `endTime` are node-level accumulated quantities: after
  // incremental (`resumeFrom`) expansion `result` describes only the resumed
  // suffix, so the comparator tie-breaks on these rather than on `result.*`.
  const endTime = dps > 0 ? totalDamage / dps : 0;
  return {
    rotation,
    score: totalDamage,
    totalDamage,
    endTime,
    result: { totalDamage, dps } as unknown as SearchNode["result"],
  };
}

describe("compareNodes totality", () => {
  const a = node([{ characterId: "alpha", actionType: "normal", normalIndex: 0 }], 100, 10);
  const b = node([{ characterId: "beta", actionType: "normal", normalIndex: 0 }], 100, 10);
  const c = node([{ characterId: "alpha", actionType: "normal", normalIndex: 1 }], 100, 10);
  const higher = node([{ characterId: "alpha", actionType: "normal", normalIndex: 0 }], 200, 10);

  it("orders strictly by score first", () => {
    expect(compareNodes(higher, a)).toBeLessThan(0);
    expect(compareNodes(a, higher)).toBeGreaterThan(0);
  });

  it("breaks every tie between DISTINCT rotations (no zero returned)", () => {
    // A zero here means two different rotations are unordered, so their
    // relative rank is decided by arrival order, not by the input.
    for (const [x, y] of [
      [a, b],
      [a, c],
      [b, c],
    ] as const) {
      expect(compareNodes(x, y)).not.toBe(0);
    }
  });

  it("is antisymmetric", () => {
    for (const [x, y] of [
      [a, b],
      [a, c],
      [b, c],
      [a, higher],
    ] as const) {
      expect(Math.sign(compareNodes(x, y))).toBe(-Math.sign(compareNodes(y, x)));
    }
  });

  it("is reflexively zero and sorts independently of initial order", () => {
    expect(compareNodes(a, a)).toBe(0);
    const forward = [a, b, c, higher].slice().sort(compareNodes);
    const reversed = [higher, c, b, a].slice().sort(compareNodes);
    expect(forward.map((n) => n.rotation)).toEqual(reversed.map((n) => n.rotation));
  });
});
