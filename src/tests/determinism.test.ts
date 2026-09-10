import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { characters, sampleRotation, testEnemy } from "@/game-data";
import type { Rotation, SimulationConfig } from "@/types";
import {
  expectDeterministic,
  expectInputsUnmutated,
  expectNoCrossRunLeakage,
  registerScenario,
  registeredScenarios,
  type DeterminismScenario,
} from "@/tests/helpers/determinism";
import {
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// Determinism regression suite.
//
// Scenarios are registered below; the suite iterates the registry. To cover a
// new feature, register a scenario — no new test body required.
// ============================================================================

// --- Scenario 1: multi-action, multi-character, every action type ----------
registerScenario({
  name: "multi-action 4-character rotation with swaps, burst and cooldowns",
  team: () => [
    makeTestCharacter("alpha", { element: "pyro" }),
    makeTestCharacter("beta", { element: "hydro" }),
    makeTestCharacter("gamma", { element: "electro" }),
    makeTestCharacter("delta", { element: "cryo" }),
  ],
  rotation: () => [
    { characterId: "alpha", actionType: "skill", abilityId: "alpha-e" },
    { characterId: "alpha", actionType: "normal", abilityId: "alpha-na" },
    { characterId: "beta", actionType: "swap" },
    { characterId: "beta", actionType: "skill", abilityId: "beta-e" },
    { characterId: "beta", actionType: "charged", abilityId: "beta-ca" },
    { characterId: "gamma", actionType: "swap" },
    { characterId: "gamma", actionType: "skill", abilityId: "gamma-e" },
    // Illegal on purpose: gamma's skill is still on cooldown. Warnings are part
    // of the result and must be reproduced identically too.
    { characterId: "gamma", actionType: "skill", abilityId: "gamma-e" },
    { characterId: "delta", actionType: "swap" },
    { characterId: "delta", actionType: "normal", abilityId: "delta-na" },
  ],
  enemy: () => NEUTRAL_ENEMY,
  config: () => ({ ...NO_CRIT_CONFIG }),
});

// --- Scenario 2: expected-value crit + resistances + DMG bonuses ------------
registerScenario({
  name: "expected-value crit against a resistant enemy",
  team: () => [
    makeTestCharacter("crit", {
      level: 90,
      stats: {
        atk: 2137,
        critRate: 0.734,
        critDmg: 1.913,
        dmgBonus: 0.15,
        elementalDmgBonus: { pyro: 0.466 },
      },
    }),
  ],
  rotation: () => [
    { characterId: "crit", actionType: "normal", abilityId: "crit-na" },
    { characterId: "crit", actionType: "skill", abilityId: "crit-e" },
    { characterId: "crit", actionType: "charged", abilityId: "crit-ca" },
  ],
  enemy: () => ({
    id: "resist",
    name: "Resistant",
    level: 103,
    // Includes a negative and a >0.75 resistance to exercise both piecewise
    // branches of the RES formula in the determinism path.
    resistances: { pyro: -0.4, hydro: 0.9, physical: 0.3 },
  }),
  config: () => ({ critMode: "expected" }),
});

// --- Scenario 3: particle energy distribution across a party ---------------
registerScenario({
  name: "particle emission distributed across a 4-character party",
  team: () => {
    const emitter = makeTestCharacter("emitter", { element: "pyro" });
    emitter.elementalSkill.particles = { count: 4, element: "pyro" };
    emitter.elementalSkill.energyGenerated = 0;
    return [
      emitter,
      makeTestCharacter("onElement", { element: "pyro", stats: { energyRecharge: 1.5 } }),
      makeTestCharacter("offElement", { element: "cryo" }),
      makeTestCharacter("lowEr", { element: "pyro", stats: { energyRecharge: 0.5 } }),
    ];
  },
  rotation: () => [
    { characterId: "emitter", actionType: "skill", abilityId: "emitter-e" },
  ],
  enemy: () => NEUTRAL_ENEMY,
  config: () => ({ ...NO_CRIT_CONFIG }),
});

// --- Scenario 4: the shipped game-data sample rotation ---------------------
registerScenario({
  name: "shipped game-data sample rotation",
  team: () => characters.map((c) => structuredClone(c)),
  rotation: () => structuredClone(sampleRotation),
  enemy: () => structuredClone(testEnemy),
  config: () => ({}),
});

// --- Scenario 5: degenerate inputs still deterministic ---------------------
registerScenario({
  name: "empty rotation on an empty team",
  team: () => [],
  rotation: () => [],
  enemy: () => NEUTRAL_ENEMY,
  config: () => ({}),
});

const interference: DeterminismScenario = {
  name: "interference",
  team: () => [makeTestCharacter("noise", { stats: { atk: 99999 } })],
  rotation: () => [
    { characterId: "noise", actionType: "skill", abilityId: "noise-e" },
    { characterId: "noise", actionType: "normal", abilityId: "noise-na" },
  ],
  enemy: () => NEUTRAL_ENEMY,
  config: () => ({ critMode: "always" }),
};

describe("determinism harness", () => {
  it("registers at least one multi-action scenario", () => {
    const multiAction = registeredScenarios().filter(
      (s) => s.rotation().length > 1,
    );
    expect(multiAction.length).toBeGreaterThan(0);
  });

  for (const scenario of registeredScenarios()) {
    describe(scenario.name, () => {
      it("produces identical results across repeated runs", () => {
        expectDeterministic(scenario);
      });

      it("does not mutate its inputs", () => {
        expectInputsUnmutated(scenario);
      });

      it("is unaffected by a prior unrelated simulation", () => {
        expectNoCrossRunLeakage(scenario, interference);
      });
    });
  }
});

describe("determinism invariants beyond the registry", () => {
  it("produces identical results regardless of team array identity", () => {
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const first = simulateRotation(
      [makeTestCharacter("a")],
      rotation,
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    // Structurally equal but distinct object graph: results must still match.
    const second = simulateRotation(
      [makeTestCharacter("a")],
      structuredClone(rotation),
      structuredClone(NEUTRAL_ENEMY),
      { ...NO_CRIT_CONFIG },
    );
    expect(second).toEqual(first);
  });

  it("never emits NaN or Infinity in any numeric result field", () => {
    const team = [makeTestCharacter("a"), makeTestCharacter("b")];
    const configs: SimulationConfig[] = [
      {},
      { critMode: "always" },
      { critMode: "never" },
      { critMode: "expected" },
      { swapCost: 0 },
      { timeLimit: 0 },
      { partySize: 1 },
    ];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "normal", abilityId: "b-na" },
    ];
    for (const config of configs) {
      const result = simulateRotation(team, rotation, NEUTRAL_ENEMY, config);
      const numbers = [
        result.totalDamage,
        result.dps,
        result.duration,
        ...Object.values(result.damageByCharacter),
        ...Object.values(result.damageByAbility),
        ...Object.values(result.damageByElement),
        ...result.timeline.flatMap((e) => [
          e.timestamp,
          e.damage?.finalDamage ?? 0,
          e.energy ?? 0,
        ]),
      ];
      for (const n of numbers) expect(Number.isFinite(n)).toBe(true);
    }
  });

  it("keeps timeline timestamps non-decreasing", () => {
    const team = [makeTestCharacter("a"), makeTestCharacter("b")];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "skill", abilityId: "b-e" },
      { characterId: "a", actionType: "swap" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const result = simulateRotation(team, rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i]!.timestamp).toBeGreaterThanOrEqual(
        result.timeline[i - 1]!.timestamp,
      );
    }
  });

  it("keeps aggregate totals consistent with the timeline", () => {
    const team = [makeTestCharacter("a"), makeTestCharacter("b")];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "normal", abilityId: "b-na" },
      { characterId: "b", actionType: "charged", abilityId: "b-ca" },
    ];
    const r = simulateRotation(team, rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);

    const fromTimeline = r.timeline
      .filter((e) => e.type === "damage")
      .reduce((sum, e) => sum + (e.damage?.finalDamage ?? 0), 0);

    expect(r.totalDamage).toBeCloseTo(fromTimeline, 10);
    const sumBy = (rec: Record<string, number>): number =>
      Object.values(rec).reduce((a, b) => a + b, 0);
    expect(sumBy(r.damageByCharacter)).toBeCloseTo(r.totalDamage, 10);
    expect(sumBy(r.damageByAbility)).toBeCloseTo(r.totalDamage, 10);
    expect(sumBy(r.damageByElement)).toBeCloseTo(r.totalDamage, 10);
    expect(r.dps * r.duration).toBeCloseTo(r.totalDamage, 8);
  });
});
