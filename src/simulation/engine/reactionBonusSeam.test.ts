import { describe, expect, it } from "vitest";
import { resolveReactions } from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";
import type { EnemyState, ReactionBonusMap, Rotation } from "@/types";
import { simulateRotation } from "@/simulation/engine";
import {
  LEVEL_0_DEF_MULTIPLIER,
  makeTestCharacter,
  NEUTRAL_ENEMY as NEUTRAL_DUMMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// `ReactionBonus` threading through the reaction seam (TASK #044, GAP 1).
//
// Before this, `ReactionSeamStats` carried only `{level, elementalMastery}`,
// so mechanics' `ReactionStats.reactionBonus` — which already existed and was
// already per-reaction — could never be reached. Crimson Witch 4pc, Mona C1,
// Thundering Fury 4pc and Viridescent Venerer 4pc were all inert.
//
// Source: KQM TCL `combat-mechanics/damage/damage-formula`. All three reaction
// formulas share the shape `ReactionMultiplier × (1 + emBonus + ReactionBonus)`;
// the Amplifying table names "the Crimson Witch 4-Piece set bonus and Mona's C1
// (for Vaporize)" as the sources of the term.
//
// EM is held at 0 throughout so the EM curve contributes exactly 0 and the
// expected values are exact integers/decimals rather than curve outputs.
// ============================================================================

const enemy: EnemyState = { id: "e", name: "E", level: 90, resistances: {} };

/** Amplifying base multipliers, per KQM `_formulas/amplifying.md`. */
const FORWARD_VAPORIZE = 2.0; // Hydro onto a Pyro aura
const REVERSE_VAPORIZE = 1.5; // Pyro onto a Hydro aura

/**
 * Apply a Pyro aura then a Hydro hit (forward vaporize), returning the
 * amplifying multiplier the seam produced.
 */
function vaporizeAmplifier(reactionBonus?: ReactionBonusMap): number {
  const store: EnemyAuraStore = {};
  const stats = { level: 90, elementalMastery: 0, reactionBonus };

  // Hit 1 establishes the Pyro aura; it reacts with nothing.
  resolveReactions({
    store,
    enemy,
    element: "pyro",
    gauge: 2,
    appliesElement: true,
    time: 0,
    stats,
  });

  // Hit 2 is Hydro onto Pyro => forward Vaporize (x2.0).
  return resolveReactions({
    store,
    enemy,
    element: "hydro",
    gauge: 2,
    appliesElement: true,
    time: 0.1,
    stats,
  }).amplifyingMultiplier;
}

describe("reaction seam — ReactionBonus threading", () => {
  it("is 1.0-equivalent when no bonus is supplied (nothing moves)", () => {
    // 2.0 * (1 + 0 EM + 0 bonus) = 2.0
    expect(vaporizeAmplifier()).toBeCloseTo(FORWARD_VAPORIZE, 12);
  });

  it("applies Crimson Witch 4pc (+15%) to Vaporize", () => {
    // WORKED EXAMPLE, KQM amplifying formula at EM 0:
    //   2.0 * (1 + 0 + 0.15) = 2.30
    // Before this change the seam produced 2.00 — a 13.0% understatement of
    // every vaporized hit for a Crimson Witch wearer.
    expect(vaporizeAmplifier({ vaporize: 0.15 })).toBeCloseTo(2.3, 12);
  });

  it("applies Mona C1 (+15% Vaporize) identically — same term, same channel", () => {
    // KQM lists Mona's C1 under the same `ReactionBonus` variable, so it is
    // the same arithmetic; stacked with Crimson Witch it SUMS inside the
    // bracket rather than multiplying: 2.0 * (1 + 0.15 + 0.15) = 2.60.
    expect(vaporizeAmplifier({ vaporize: 0.3 })).toBeCloseTo(2.6, 12);
  });

  it("is PER-REACTION: a melt bonus does not leak onto vaporize", () => {
    // This is why the map shape is load-bearing rather than a scalar. A
    // Vaporize-only bonus keyed under `melt` must do nothing here.
    expect(vaporizeAmplifier({ melt: 0.15 })).toBeCloseTo(FORWARD_VAPORIZE, 12);
  });

  it("distinguishes forward from reverse while carrying the same bonus", () => {
    // Reverse vaporize (Pyro onto Hydro) has base 1.5, so the same +15%
    // bonus yields 1.5 * 1.15 = 1.725, not 2.30.
    const store: EnemyAuraStore = {};
    const stats = {
      level: 90,
      elementalMastery: 0,
      reactionBonus: { vaporize: 0.15 },
    };
    resolveReactions({
      store,
      enemy,
      element: "hydro",
      gauge: 2,
      appliesElement: true,
      time: 0,
      stats,
    });
    const result = resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: 2,
      appliesElement: true,
      time: 0.1,
      stats,
    });
    expect(result.amplifyingMultiplier).toBeCloseTo(REVERSE_VAPORIZE * 1.15, 12);
  });

  it("applies Thundering Fury 4pc (+40%) to a TRANSFORMATIVE reaction", () => {
    // Overloaded at level 90, EM 0:
    //   coefficient 2.75 * levelMultiplier(90) * (1 + 0 + bonus) * resMult
    // We assert the RATIO rather than the absolute, so the test pins the
    // bonus term without re-encoding the level-multiplier table.
    const withoutBonus = overloadDamage();
    const withBonus = overloadDamage({ overloaded: 0.4 });
    expect(withBonus / withoutBonus).toBeCloseTo(1.4, 12);
  });

  it("applies Viridescent Venerer 4pc (+60%) to Swirl only", () => {
    const plain = swirlDamage();
    const buffed = swirlDamage({ swirl: 0.6 });
    expect(buffed / plain).toBeCloseTo(1.6, 12);
    // And a swirl bonus must not touch an unrelated transformative reaction.
    expect(overloadDamage({ swirl: 0.6 })).toBeCloseTo(overloadDamage(), 12);
  });
});

/** Pyro aura, then Electro => Overloaded. Returns the instance's damage. */
function overloadDamage(reactionBonus?: ReactionBonusMap): number {
  const store: EnemyAuraStore = {};
  const stats = { level: 90, elementalMastery: 0, reactionBonus };
  resolveReactions({
    store,
    enemy,
    element: "pyro",
    gauge: 2,
    appliesElement: true,
    time: 0,
    stats,
  });
  const out = resolveReactions({
    store,
    enemy,
    element: "electro",
    gauge: 2,
    appliesElement: true,
    time: 0.1,
    stats,
  });
  const overload = out.transformative.find((t) => t.kind === "overloaded");
  expect(overload).toBeDefined();
  return overload!.damage;
}

/** Pyro aura, then Anemo => Swirl. Returns the instance's damage. */
function swirlDamage(reactionBonus?: ReactionBonusMap): number {
  const store: EnemyAuraStore = {};
  const stats = { level: 90, elementalMastery: 0, reactionBonus };
  resolveReactions({
    store,
    enemy,
    element: "pyro",
    gauge: 2,
    appliesElement: true,
    time: 0,
    stats,
  });
  const out = resolveReactions({
    store,
    enemy,
    element: "anemo",
    gauge: 1,
    appliesElement: true,
    time: 0.1,
    stats,
  });
  const swirl = out.transformative.find((t) => t.kind === "swirl");
  expect(swirl).toBeDefined();
  return swirl!.damage;
}

// ---------------------------------------------------------------------------
// End-to-end: the new Stats fields must survive the whole engine path, not
// just the seam in isolation. `equippedStats` injects a stat bag through the
// public `SimulationConfig`, which is the same channel the buff layer's
// resolved bag flows down.
// ---------------------------------------------------------------------------

describe("engine end-to-end — new Stats fields reach the damage number", () => {
  it("Stats.baseDmgMultiplier scales a skill through simulateRotation", () => {
    // Fixture skill: 2.0x ATK, level-0 char vs level-0 enemy (DEF mult 0.5),
    // crit off. Baseline = atk * 2 * 0.5. With a 1.5 Base DMG Multiplier on
    // `skill` the total must be exactly 1.5x the baseline.
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const character = makeTestCharacter("a");
    const plain = simulateRotation(
      [character],
      rotation,
      NEUTRAL_DUMMY,
      NO_CRIT_CONFIG,
    ).totalDamage;

    const buffed = simulateRotation([character], rotation, NEUTRAL_DUMMY, {
      ...NO_CRIT_CONFIG,
      equippedStats: {
        a: { ...character.baseStats, baseDmgMultiplier: { skill: 1.5 } },
      },
    }).totalDamage;

    expect(plain).toBeGreaterThan(0);
    expect(buffed).toBeCloseTo(plain * 1.5, 8);
  });

  it("Stats.flatDamageBonus adds inside the base through simulateRotation", () => {
    // The additive term is scaled by DEF (0.5) on the way out, so a flat 400
    // of base damage shows up as +200 of final damage.
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const character = makeTestCharacter("a");
    const plain = simulateRotation(
      [character],
      rotation,
      NEUTRAL_DUMMY,
      NO_CRIT_CONFIG,
    ).totalDamage;

    const buffed = simulateRotation([character], rotation, NEUTRAL_DUMMY, {
      ...NO_CRIT_CONFIG,
      equippedStats: {
        a: { ...character.baseStats, flatDamageBonus: 400 },
      },
    }).totalDamage;

    expect(buffed - plain).toBeCloseTo(400 * LEVEL_0_DEF_MULTIPLIER, 8);
  });

  it("neither field changes anything when absent", () => {
    // The no-regression guarantee, asserted rather than assumed.
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const character = makeTestCharacter("a");
    const plain = simulateRotation(
      [character],
      rotation,
      NEUTRAL_DUMMY,
      NO_CRIT_CONFIG,
    ).totalDamage;
    const explicitlyEmpty = simulateRotation(
      [character],
      rotation,
      NEUTRAL_DUMMY,
      {
        ...NO_CRIT_CONFIG,
        equippedStats: {
          a: { ...character.baseStats, baseDmgMultiplier: {}, reactionBonus: {} },
        },
      },
    ).totalDamage;
    expect(explicitlyEmpty).toBeCloseTo(plain, 12);
  });
});
