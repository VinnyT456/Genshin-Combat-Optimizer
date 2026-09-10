import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import { simulateRotation } from "@/simulation/engine";
import { DEFAULT_SWAP_COST_SECONDS } from "@/simulation/engine/constants";
import { restoreFromSnapshot } from "@/simulation/engine/resume";
import { AURA_GAUGE_RELATIVE_TOLERANCE } from "@/simulation/reactions/auraTolerance";
import { makeTestCharacter, NEUTRAL_ENEMY } from "@/tests/helpers/fixtures";

// ============================================================================
// B2 — `config.resumeFrom` actually resumes.
//
// Before this change the field was INERT: the engine pushed
// "config.resumeFrom is not implemented yet; simulating from t=0." and then
// simulated from t=0 anyway. So the optimizer had to re-simulate every prefix
// of every candidate, O(W*D^2) engine work instead of O(W*D).
//
// The claim under test is not "the field is read". It is that
//   prefix, then RESUME suffix   ==   whole rotation in one run
// to within the mechanics layer's MEASURED aura tolerance, and that the split
// carries energy / cooldowns / normal-string position across the seam.
//
// TOLERANCE, stated rather than asserted-exact: snapshotting re-anchors aura
// decay (`since` moves to the checkpoint), which re-rounds in IEEE-754. Equal
// in the reals, not bit-equal. `AURA_GAUGE_RELATIVE_TOLERANCE = 1e-9` is the
// bound mechanics measured for that composition. These tests use it as a
// RELATIVE bound on damage; asserting exact equality would pin a test that
// cannot hold.
// ============================================================================

const NO_CRIT: SimulationConfig = { critMode: "never" };

/** Two characters so swaps, and therefore the on-field carry, are exercised. */
const TEAM = [makeTestCharacter("a"), makeTestCharacter("b")];

// Skill has a 6s cooldown and generates 20 energy; burst costs 40. So a
// rotation long enough to cross the split exercises cooldown AND energy carry.
const FULL: Rotation = [
  { characterId: "a", actionType: "skill", abilityId: "a-e" },
  { characterId: "a", actionType: "normal", abilityId: "a-na" },
  { characterId: "b", actionType: "swap" },
  { characterId: "b", actionType: "skill", abilityId: "b-e" },
  { characterId: "a", actionType: "swap" },
  { characterId: "a", actionType: "skill", abilityId: "a-e" },
  { characterId: "a", actionType: "normal", abilityId: "a-na" },
];

const SPLIT_AT = 3;
const PREFIX = FULL.slice(0, SPLIT_AT);
const SUFFIX = FULL.slice(SPLIT_AT);

function relativeDifference(a: number, b: number): number {
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) / scale;
}

describe("B2 — resumeFrom continues a run instead of restarting it", () => {
  it("no longer reports resumeFrom as unimplemented", () => {
    const whole = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const resumed = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: whole.finalState,
    });

    // The exact string the engine used to push unconditionally.
    for (const warning of resumed.warnings) {
      expect(warning).not.toContain("resumeFrom is not implemented");
    }
  });

  it("prefix + resumed suffix reproduces the whole run's damage", () => {
    const whole = simulateRotation(TEAM, FULL, NEUTRAL_ENEMY, NO_CRIT);

    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const suffix = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: prefix.finalState,
    });

    const composed = prefix.totalDamage + suffix.totalDamage;
    expect(
      relativeDifference(composed, whole.totalDamage),
    ).toBeLessThanOrEqual(AURA_GAUGE_RELATIVE_TOLERANCE);

    // And it is a real rotation, not two empty runs agreeing on zero.
    expect(whole.totalDamage).toBeGreaterThan(0);
    expect(suffix.totalDamage).toBeGreaterThan(0);
  });

  it("resuming is DIFFERENT from simulating the suffix cold", () => {
    // This is the test that fails if `resumeFrom` goes inert again: a cold
    // suffix starts every cooldown fresh and every energy bar empty, so it
    // cannot agree with the composed run.
    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const cold = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, NO_CRIT);
    const resumed = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: prefix.finalState,
    });

    // The resumed run starts at the checkpoint clock; the cold one at 0.
    expect(resumed.finalState.time).toBeGreaterThan(cold.finalState.time);
    expect(resumed.finalState.time).toBeGreaterThan(prefix.finalState.time);

    // The resumed run lands on the SAME clock as simulating the whole
    // rotation in one go — that is the property resume exists to provide.
    const whole = simulateRotation(TEAM, FULL, NEUTRAL_ENEMY, NO_CRIT);
    expect(resumed.finalState.time).toBeCloseTo(whole.finalState.time, 10);

    // It is NOT prefix + cold: the carried 6s skill cooldown makes the
    // resumed run SKIP a cast the cold run happily allows, because the cold
    // run starts every cooldown fresh. That skip is the observable proof the
    // cooldown crossed the seam.
    expect(prefix.finalState.time + cold.finalState.time).not.toBeCloseTo(
      resumed.finalState.time,
      10,
    );
    expect(
      resumed.warnings.some((w) => w.includes("is on cooldown")),
    ).toBe(true);
    expect(cold.warnings.some((w) => w.includes("is on cooldown"))).toBe(false);
    expect(cold.effectiveSwapCost).toBe(DEFAULT_SWAP_COST_SECONDS);
  });

  it("carries energy and cooldowns across the seam", () => {
    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const carriedEnergy = prefix.finalState.characters["a"]!.energy.current;
    expect(carriedEnergy).toBeGreaterThan(0);

    const resumed = simulateRotation(TEAM, [], NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: prefix.finalState,
    });

    // An empty resumed rotation must hand the state straight back.
    expect(resumed.finalState.characters["a"]!.energy.current).toBe(
      carriedEnergy,
    );
    expect(resumed.finalState.characters["a"]!.cooldowns).toEqual(
      prefix.finalState.characters["a"]!.cooldowns,
    );
    expect(resumed.finalState.time).toBe(prefix.finalState.time);
  });

  it("reports duration for the RESUMED span, not the absolute clock", () => {
    // Billing a resumed run from t=0 would include time it never simulated
    // and understate DPS by exactly the prefix length.
    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const resumed = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: prefix.finalState,
    });

    expect(resumed.duration).toBeCloseTo(
      resumed.finalState.time - prefix.finalState.time,
      10,
    );
    expect(resumed.duration).toBeLessThan(resumed.finalState.time);
    expect(resumed.dps).toBeCloseTo(
      resumed.totalDamage / resumed.duration,
      10,
    );
  });

  it("warns, but does not throw, on a snapshot from a different team", () => {
    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const stranger = {
      ...prefix.finalState,
      characters: {
        ...prefix.finalState.characters,
        ghost: prefix.finalState.characters["a"]!,
      },
    };

    const resumed = simulateRotation(TEAM, SUFFIX, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      resumeFrom: stranger,
    });

    expect(resumed.errors).toHaveLength(0);
    expect(
      resumed.warnings.some((w) => w.includes('unknown character "ghost"')),
    ).toBe(true);
  });

  it("leaves a cold start byte-identical (no resumeFrom, no behaviour change)", () => {
    const a = simulateRotation(TEAM, FULL, NEUTRAL_ENEMY, NO_CRIT);
    const b = simulateRotation(TEAM, FULL, NEUTRAL_ENEMY, NO_CRIT);
    expect(a.totalDamage).toBe(b.totalDamage);
    expect(a.duration).toBe(b.duration);
    // Duration on a cold start still equals the absolute clock.
    expect(a.duration).toBe(a.finalState.time);
  });
});

describe("B2 — restoreFromSnapshot is the inverse of snapshot()", () => {
  it("is deterministic in the ids it reports as unknown", () => {
    const prefix = simulateRotation(TEAM, PREFIX, NEUTRAL_ENEMY, NO_CRIT);
    const states = new Map(
      TEAM.map((def) => [
        def.id,
        {
          definition: def,
          energy: { current: 0, max: def.maxEnergy, totalGained: 0, totalSpent: 0 },
          cooldowns: {},
        },
      ]),
    );

    const snapshotWithStrangers = {
      ...prefix.finalState,
      characters: {
        zeta: prefix.finalState.characters["a"]!,
        alpha: prefix.finalState.characters["a"]!,
        ...prefix.finalState.characters,
      },
    };

    const restored = restoreFromSnapshot(states, snapshotWithStrangers);
    // Sorted, so the warning order does not depend on snapshot key order.
    expect(restored.unknownCharacterIds).toEqual(["alpha", "zeta"]);
    expect(restored.clock).toBe(prefix.finalState.time);
  });
});
