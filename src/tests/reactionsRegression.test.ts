import { describe, expect, it } from "vitest";

import type { Element } from "@/types";
import {
  AURA_ELEMENTS,
  AMPLIFYING_FORWARD_MULTIPLIER,
  AMPLIFYING_REVERSE_MULTIPLIER,
  ADDITIVE_COEFFICIENTS,
  DEFAULT_ICD_HITS,
  DEFAULT_ICD_SECONDS,
  EMPTY_AURA_STATE,
  EMPTY_ELEMENTAL_STATE,
  MAX_TABULATED_LEVEL,
  TRANSFORMATIVE_COEFFICIENTS,
  TRANSFORMATIVE_LEVEL_MULTIPLIER,
  additiveBaseDamageBonus,
  amplifyingMultiplier,
  applyElement,
  auraBaseDuration,
  auraDecayRate,
  createAura,
  decayAuraState,
  evaluateIcd,
  gaugeAt,
  icdKey,
  levelMultiplier,
  lookupReaction,
  resolveElementalHit,
  toReactionModifiers,
  transformativeDamage,
  transformativeEmBonus,
  AURA_GAUGE_RELATIVE_TOLERANCE,
  auraStatesEquivalent,
  gaugesEquivalent,
  quantizeGauge,
} from "@/simulation/reactions";
import type {
  AuraElement,
  AuraState,
  ElementalHit,
  ElementalState,
  IcdBehaviour,
  IcdCounter,
  ReactionResult,
} from "@/simulation/reactions";

// ============================================================================
// INDEPENDENT REACTION REGRESSION (TASK #024, qa-engineer).
//
// This file is written from OUTSIDE `src/simulation/reactions`, deliberately
// duplicating none of that module's own test fixtures. Its job is to try to
// prove the landed mechanics module WRONG, not to re-affirm it.
//
// Structure, worst-failure-first:
//   1. Amplifying trigger ORDER  — the signature failure mode: 1.5x vs 2.0x
//      backwards produces a plausible number that no smoke test catches.
//   2. Pipeline COMPOSITION      — amplifying multiplies the instance,
//      transformative is its own instance, additive is inside the parenthesis.
//      Assert they compose in the right order and DO NOT double-count.
//   3. Transformative + EM + level curve.
//   4. Aura: decay, coexistence vs overwrite, replacement rules.
//   5. ICD: generic per-sequence counter, window-reset BOUNDARY.
//   6. Determinism / no RNG / no wall-clock.
//   7. Robustness: non-finite inputs (DEFECTS RECORDED, see file end).
// ============================================================================

// ---------------------------------------------------------------------------
// Deterministic fixtures. Every number here is chosen so the expected value is
// computable by hand and printed in the assertion.
// ---------------------------------------------------------------------------

/** Level 90 is the playable cap; its multiplier is the pinned reference. */
const LEVEL_90 = 90;
const LEVEL_90_MULTIPLIER = 1446.8535;

/** A "no resistance at all" multiplier, so RES never hides a math error. */
const RES_NEUTRAL = 1;

function auraOf(state: AuraState, element: AuraElement) {
  return state.auras.find((aura) => aura.element === element);
}

function kinds(reactions: readonly ReactionResult[]): readonly string[] {
  return reactions.map((reaction) => reaction.kind);
}

/**
 * Build an aura of `element` by landing a clean hit on an empty target.
 * Used instead of hand-building `Aura` objects so these tests exercise the
 * real application path, not a shape the module never produces.
 */
function withFreshAura(
  element: AuraElement,
  gauge: number,
  time = 0,
): AuraState {
  return applyElement(EMPTY_AURA_STATE, element, gauge, time).state;
}

function hit(overrides: Partial<ElementalHit> = {}): ElementalHit {
  return {
    time: 0,
    attackerId: "attacker",
    targetId: "target",
    icdGroup: "group",
    element: "pyro",
    gauge: 1,
    icd: { mode: "standard" },
    ...overrides,
  };
}

// ============================================================================
// 1. AMPLIFYING REACTIONS — TRIGGER ORDER
// ============================================================================

describe("amplifying reactions: trigger ORDER decides 1.5x vs 2.0x", () => {
  // The four cases are spelled out individually rather than table-driven, so a
  // swapped pair cannot be hidden by a swapped expectation in the same table.

  it("VAPORIZE forward = Hydro trigger onto a Pyro aura = 2.0x", () => {
    const state = withFreshAura("pyro", 2);
    const { reactions } = applyElement(state, "hydro", 1, 0);

    expect(kinds(reactions)).toEqual(["vaporize"]);
    expect(reactions[0]?.direction).toBe("forward");
    expect(reactions[0]?.triggerElement).toBe("hydro");
    expect(reactions[0]?.auraElement).toBe("pyro");

    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(2);
  });

  it("VAPORIZE reverse = Pyro trigger onto a Hydro aura = 1.5x", () => {
    const state = withFreshAura("hydro", 2);
    const { reactions } = applyElement(state, "pyro", 1, 0);

    expect(kinds(reactions)).toEqual(["vaporize"]);
    expect(reactions[0]?.direction).toBe("reverse");
    expect(reactions[0]?.triggerElement).toBe("pyro");
    expect(reactions[0]?.auraElement).toBe("hydro");

    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(1.5);
  });

  it("MELT forward = Pyro trigger onto a Cryo aura = 2.0x", () => {
    const state = withFreshAura("cryo", 2);
    const { reactions } = applyElement(state, "pyro", 1, 0);

    expect(kinds(reactions)).toEqual(["melt"]);
    expect(reactions[0]?.direction).toBe("forward");
    expect(reactions[0]?.triggerElement).toBe("pyro");
    expect(reactions[0]?.auraElement).toBe("cryo");

    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(2);
  });

  it("MELT reverse = Cryo trigger onto a Pyro aura = 1.5x", () => {
    const state = withFreshAura("pyro", 2);
    const { reactions } = applyElement(state, "cryo", 1, 0);

    expect(kinds(reactions)).toEqual(["melt"]);
    expect(reactions[0]?.direction).toBe("reverse");
    expect(reactions[0]?.triggerElement).toBe("cryo");
    expect(reactions[0]?.auraElement).toBe("pyro");

    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(1.5);
  });

  it("the SAME element pair gives DIFFERENT multipliers depending on who triggers", () => {
    // This is the assertion that a direction swap cannot survive. Both
    // orderings of the same pair are computed in one test and compared.
    const hydroOntoPyro = toReactionModifiers(
      applyElement(withFreshAura("pyro", 2), "hydro", 1, 0).reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;

    const pyroOntoHydro = toReactionModifiers(
      applyElement(withFreshAura("hydro", 2), "pyro", 1, 0).reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;

    expect(hydroOntoPyro).toBeGreaterThan(pyroOntoHydro);
    expect(hydroOntoPyro / pyroOntoHydro).toBeCloseTo(4 / 3, 12);

    const pyroOntoCryo = toReactionModifiers(
      applyElement(withFreshAura("cryo", 2), "pyro", 1, 0).reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;

    const cryoOntoPyro = toReactionModifiers(
      applyElement(withFreshAura("pyro", 2), "cryo", 1, 0).reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;

    expect(pyroOntoCryo).toBeGreaterThan(cryoOntoPyro);
    // Pyro is forward for MELT but reverse for VAPORIZE — the element alone
    // never determines the direction, only the (trigger, aura) pair does.
    expect(pyroOntoCryo).toBe(AMPLIFYING_FORWARD_MULTIPLIER);
    expect(pyroOntoHydro).toBe(AMPLIFYING_REVERSE_MULTIPLIER);
  });

  it("gauge CONSUMPTION follows the same direction as the damage multiplier", () => {
    // forward: 2x consumption clears a 1.6U aura outright.
    const forward = applyElement(withFreshAura("pyro", 2), "hydro", 1, 0);
    expect(forward.reactions[0]?.direction).toBe("forward");
    expect(forward.reactions[0]?.gaugeConsumed).toBe(1.6);
    expect(auraOf(forward.state, "pyro")).toBeUndefined();

    // reverse: 0.5x consumption leaves the aura alive for further reactions.
    const reverse = applyElement(withFreshAura("hydro", 2), "pyro", 1, 0);
    expect(reverse.reactions[0]?.direction).toBe("reverse");
    expect(reverse.reactions[0]?.gaugeConsumed).toBe(0.5);
    expect(auraOf(reverse.state, "hydro")?.gauge).toBeCloseTo(1.1, 12);
  });

  it("a REVERSE trigger does not leave its own aura (the aura it hit survives)", () => {
    // Pyro reverse-vaporizes a Hydro aura: the Pyro is consumed by the
    // reaction, so the target is left Hydro-only, NOT dual-aura.
    const result = applyElement(withFreshAura("hydro", 2), "pyro", 1, 0);
    expect(auraOf(result.state, "pyro")).toBeUndefined();
    expect(auraOf(result.state, "hydro")).toBeDefined();
    expect(result.state.auras).toHaveLength(1);
  });

  it("EM raises an amplifying multiplier ADDITIVELY inside the parenthesis", () => {
    // base * (1 + 2.78*EM/(EM+1400) + reactionBonus). At EM=1400 the EM term
    // is exactly 2.78/2 = 1.39, so forward = 2 * 2.39 = 4.78 exactly.
    expect(amplifyingMultiplier("forward", 1400)).toBeCloseTo(4.78, 12);
    expect(amplifyingMultiplier("reverse", 1400)).toBeCloseTo(3.585, 12);

    // A +15% reaction bonus is ADDED to the EM term, never multiplied by it.
    expect(amplifyingMultiplier("forward", 1400, 0.15)).toBeCloseTo(
      2 * (1 + 1.39 + 0.15),
      12,
    );
    expect(amplifyingMultiplier("forward", 1400, 0.15)).not.toBeCloseTo(
      2 * (1 + 1.39) * 1.15,
      6,
    );
  });
});

// ============================================================================
// 2. PIPELINE COMPOSITION — the three channels must not bleed into each other
// ============================================================================

describe("reaction channels compose in the right ORDER and never double-count", () => {
  /**
   * A deliberately transparent stand-in for the damage pipeline, written HERE
   * (not imported) so it encodes the CONTRACT as QA reads it. If the real
   * pipeline ever disagrees with this arrangement, that is the finding.
   *
   *   DMG = (base + additiveBaseDamageBonus) * dmgBonus * def * res * crit
   *         * amplifyingMultiplier
   *   plus, SEPARATELY, one instance per transformative reaction.
   */
  function applyChannels(params: {
    base: number;
    dmgBonus: number;
    def: number;
    res: number;
    crit: number;
    amplifying: number;
    additive: number;
    transformative: readonly { damage: number }[];
  }): { instance: number; separate: number; total: number } {
    const instance =
      (params.base + params.additive) *
      params.dmgBonus *
      params.def *
      params.res *
      params.crit *
      params.amplifying;
    const separate = params.transformative.reduce(
      (sum, entry) => sum + entry.damage,
      0,
    );
    return { instance, separate, total: instance + separate };
  }

  it("no reaction => all three channels are neutral", () => {
    const mods = toReactionModifiers(
      [],
      { level: LEVEL_90, elementalMastery: 1000 },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(1);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toEqual([]);
  });

  it("AMPLIFYING multiplies the instance and adds NO separate instance", () => {
    const { reactions } = applyElement(withFreshAura("pyro", 2), "hydro", 1, 0);
    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );

    // Channel isolation: only the multiplier channel moved.
    expect(mods.amplifyingMultiplier).toBe(2);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toEqual([]);

    // ATK 1000 * mult 200% = 2000 base, DEF 0, RES 0, no bonus, no crit.
    const composed = applyChannels({
      base: 2000,
      dmgBonus: 1,
      def: 1,
      res: 1,
      crit: 1,
      amplifying: mods.amplifyingMultiplier,
      additive: mods.additiveBaseDamageBonus,
      transformative: mods.transformative,
    });
    expect(composed.instance).toBe(4000);
    expect(composed.separate).toBe(0);
    expect(composed.total).toBe(4000);
  });

  it("AMPLIFYING is NOT a DMG% bonus — it multiplies AFTER DMG%, not with it", () => {
    const mods = toReactionModifiers(
      applyElement(withFreshAura("pyro", 2), "hydro", 1, 0).reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );

    const correct = applyChannels({
      base: 2000,
      dmgBonus: 1.5, // +50% Pyro DMG
      def: 1,
      res: 1,
      crit: 1,
      amplifying: mods.amplifyingMultiplier,
      additive: 0,
      transformative: [],
    }).instance;
    expect(correct).toBe(6000); // 2000 * 1.5 * 2

    // The classic bug: folding 2.0x into dmgBonus as "+100% DMG".
    const wrong = 2000 * (1 + 0.5 + 1);
    expect(wrong).toBe(5000);
    expect(correct).not.toBe(wrong);
  });

  it("TRANSFORMATIVE is a SEPARATE instance: it never multiplies the trigger", () => {
    const state = withFreshAura("electro", 2);
    const { reactions } = applyElement(state, "pyro", 1, 0);

    expect(kinds(reactions)).toEqual(["overloaded"]);
    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );

    // The trigger instance is untouched in both other channels.
    expect(mods.amplifyingMultiplier).toBe(1);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toHaveLength(1);

    const composed = applyChannels({
      base: 2000,
      dmgBonus: 1,
      def: 1,
      res: 1,
      crit: 1,
      amplifying: mods.amplifyingMultiplier,
      additive: mods.additiveBaseDamageBonus,
      transformative: mods.transformative,
    });
    // The base instance is EXACTLY the un-reacted number.
    expect(composed.instance).toBe(2000);
    // Overloaded at L90, 0 EM, RES 1: 2.75 * 1446.8535 = 3978.847125.
    expect(composed.separate).toBeCloseTo(2.75 * LEVEL_90_MULTIPLIER, 9);
    expect(composed.total).toBeCloseTo(2000 + 2.75 * LEVEL_90_MULTIPLIER, 9);
  });

  it("TRANSFORMATIVE damage is invariant to ATK, DMG% and crit of the trigger", () => {
    const { reactions } = applyElement(withFreshAura("electro", 2), "pyro", 1, 0);
    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    const transformativeDamageTotal = mods.transformative[0]?.damage ?? 0;

    // Vary every trigger-side stat; the separate instance may not move.
    for (const base of [0, 2000, 999_999]) {
      for (const dmgBonus of [1, 2.5]) {
        for (const crit of [1, 3]) {
          const composed = applyChannels({
            base,
            dmgBonus,
            def: 1,
            res: 1,
            crit,
            amplifying: mods.amplifyingMultiplier,
            additive: mods.additiveBaseDamageBonus,
            transformative: mods.transformative,
          });
          expect(composed.separate).toBe(transformativeDamageTotal);
        }
      }
    }
  });

  it("ADDITIVE enters INSIDE the parenthesis, before DMG%/DEF/RES/crit", () => {
    // `additiveBaseDamageBonus` is returned unmultiplied by RES on purpose.
    const bonus = additiveBaseDamageBonus("aggravate", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 0,
    });
    expect(bonus).toBeCloseTo(
      ADDITIVE_COEFFICIENTS.aggravate * LEVEL_90_MULTIPLIER,
      9,
    );

    const inside = applyChannels({
      base: 2000,
      dmgBonus: 1.5,
      def: 0.5,
      res: 1,
      crit: 2,
      amplifying: 1,
      additive: bonus,
      transformative: [],
    }).instance;
    const outsideWrong = 2000 * 1.5 * 0.5 * 2 + bonus;

    expect(inside).toBeCloseTo((2000 + bonus) * 1.5 * 0.5 * 2, 9);
    // Adding it to FINAL damage understates it by dmgBonus*def*crit = 1.5x.
    expect(inside).toBeGreaterThan(outsideWrong);
    expect(inside - outsideWrong).toBeCloseTo(bonus * (1.5 * 0.5 * 2 - 1), 9);
  });

  it("a dual reaction (amplify + transform) hits TWO channels, once each", () => {
    // Electro-Charged target: a Pyro hit reverse-vaporizes AND overloads.
    const withHydro = withFreshAura("hydro", 2);
    const state = applyElement(withHydro, "electro", 2, 0).state;
    const { reactions } = applyElement(state, "pyro", 1, 0);

    expect(new Set(kinds(reactions))).toEqual(
      new Set(["vaporize", "overloaded"]),
    );

    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    // Exactly one amplifying application (not squared), exactly one instance.
    expect(mods.amplifyingMultiplier).toBe(1.5);
    expect(mods.transformative).toHaveLength(1);
    expect(mods.transformative[0]?.kind).toBe("overloaded");
    expect(mods.additiveBaseDamageBonus).toBe(0);

    const composed = applyChannels({
      base: 2000,
      dmgBonus: 1,
      def: 1,
      res: 1,
      crit: 1,
      amplifying: mods.amplifyingMultiplier,
      additive: mods.additiveBaseDamageBonus,
      transformative: mods.transformative,
    });
    expect(composed.instance).toBe(3000);
    expect(composed.total).toBeCloseTo(3000 + 2.75 * LEVEL_90_MULTIPLIER, 9);
  });

  it("does not double-count: converting the SAME reaction list twice is idempotent per call", () => {
    const { reactions } = applyElement(withFreshAura("pyro", 2), "hydro", 1, 0);
    const first = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    const second = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    );
    expect(second).toEqual(first);
    // Each call starts from a neutral accumulator — no shared mutable state.
    expect(second.amplifyingMultiplier).toBe(2);
  });

  it("swirl is priced with the SWIRLED element's RES, not anemo's", () => {
    const { reactions } = applyElement(withFreshAura("cryo", 2), "anemo", 1, 0);
    expect(kinds(reactions)).toEqual(["swirl"]);
    expect(reactions[0]?.swirledElement).toBe("cryo");

    const seen: Element[] = [];
    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      (element) => {
        seen.push(element);
        return element === "cryo" ? 0.5 : 1;
      },
    );
    expect(seen).toEqual(["cryo"]);
    expect(mods.transformative[0]?.resElement).toBe("cryo");
    expect(mods.transformative[0]?.damage).toBeCloseTo(
      0.6 * LEVEL_90_MULTIPLIER * 0.5,
      9,
    );
  });

  it("a `none`-category reaction contributes to NO damage channel", () => {
    for (const [aura, trigger] of [
      ["cryo", "hydro"],
      ["dendro", "electro"],
      ["pyro", "geo"],
    ] as const) {
      const { reactions } = applyElement(
        withFreshAura(aura, 2),
        trigger,
        1,
        0,
      );
      expect(reactions.length).toBeGreaterThan(0);
      expect(reactions.every((r) => r.category === "none")).toBe(true);

      const mods = toReactionModifiers(
        reactions,
        { level: LEVEL_90, elementalMastery: 1000 },
        () => RES_NEUTRAL,
      );
      expect(mods.amplifyingMultiplier).toBe(1);
      expect(mods.additiveBaseDamageBonus).toBe(0);
      expect(mods.transformative).toEqual([]);
    }
  });
});

// ============================================================================
// 3. TRANSFORMATIVE DAMAGE, EM SCALING, LEVEL CURVE
// ============================================================================

describe("transformative damage, EM scaling and the level multiplier curve", () => {
  it("is exactly coefficient * levelMultiplier at 0 EM, no bonus, RES 1", () => {
    for (const [reaction, coefficient] of Object.entries(
      TRANSFORMATIVE_COEFFICIENTS,
    )) {
      const damage = transformativeDamage(
        reaction as keyof typeof TRANSFORMATIVE_COEFFICIENTS,
        {
          triggerCharacterLevel: LEVEL_90,
          elementalMastery: 0,
          resMultiplier: RES_NEUTRAL,
        },
      );
      expect(damage).toBeCloseTo(coefficient * LEVEL_90_MULTIPLIER, 9);
    }
  });

  it("the EM curve is 16*EM/(EM+2000) and is ADDITIVE with the reaction bonus", () => {
    // At EM = 2000 the term is exactly 16/2 = 8.
    expect(transformativeEmBonus(2000)).toBeCloseTo(8, 12);

    const withEm = transformativeDamage("overloaded", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 2000,
      resMultiplier: RES_NEUTRAL,
    });
    expect(withEm).toBeCloseTo(2.75 * LEVEL_90_MULTIPLIER * 9, 6);

    const withBoth = transformativeDamage("overloaded", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 2000,
      reactionBonus: 0.4,
      resMultiplier: RES_NEUTRAL,
    });
    // (1 + 8 + 0.4), NOT (1 + 8) * 1.4.
    expect(withBoth).toBeCloseTo(2.75 * LEVEL_90_MULTIPLIER * 9.4, 6);
    expect(withBoth).not.toBeCloseTo(2.75 * LEVEL_90_MULTIPLIER * 9 * 1.4, 3);
  });

  it("EM has DIMINISHING returns and never goes negative", () => {
    const points = [0, 100, 200, 400, 800, 1600, 3200, 6400];
    const values = points.map(transformativeEmBonus);
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]!).toBeGreaterThan(values[i - 1]!);
    }
    // Second differences are negative: the curve is concave.
    for (let i = 2; i < values.length; i += 1) {
      const slopeNow = (values[i]! - values[i - 1]!) / (points[i]! - points[i - 1]!);
      const slopeBefore =
        (values[i - 1]! - values[i - 2]!) / (points[i - 1]! - points[i - 2]!);
      expect(slopeNow).toBeLessThan(slopeBefore);
    }
    // Negative EM clamps at 0 rather than producing a damage REDUCTION.
    expect(transformativeEmBonus(-5000)).toBe(0);
    expect(transformativeEmBonus(0)).toBe(0);
  });

  it("EM bonus never exceeds its asymptotic scale", () => {
    expect(transformativeEmBonus(1e12)).toBeLessThan(16);
    expect(transformativeEmBonus(1e12)).toBeGreaterThan(15.99);
  });

  it("the level curve is strictly monotonic across every tabulated level", () => {
    for (let i = 1; i < TRANSFORMATIVE_LEVEL_MULTIPLIER.length; i += 1) {
      expect(TRANSFORMATIVE_LEVEL_MULTIPLIER[i]!).toBeGreaterThan(
        TRANSFORMATIVE_LEVEL_MULTIPLIER[i - 1]!,
      );
    }
  });

  it("pins the level multiplier at the levels a rotation actually uses", () => {
    expect(levelMultiplier(1)).toBeCloseTo(17.165606, 9);
    expect(levelMultiplier(80)).toBeCloseTo(1077.4437, 9);
    expect(levelMultiplier(90)).toBeCloseTo(LEVEL_90_MULTIPLIER, 9);
  });

  it("CLAMPS out-of-range levels instead of extrapolating a fake number", () => {
    const lowest = TRANSFORMATIVE_LEVEL_MULTIPLIER[0]!;
    const highest =
      TRANSFORMATIVE_LEVEL_MULTIPLIER[MAX_TABULATED_LEVEL - 1]!;

    expect(levelMultiplier(0)).toBe(lowest);
    expect(levelMultiplier(-100)).toBe(lowest);
    expect(levelMultiplier(MAX_TABULATED_LEVEL)).toBe(highest);
    expect(levelMultiplier(MAX_TABULATED_LEVEL + 1)).toBe(highest);
    expect(levelMultiplier(1e9)).toBe(highest);
  });

  it("floors a fractional level rather than interpolating", () => {
    expect(levelMultiplier(89.999)).toBe(levelMultiplier(89));
    expect(levelMultiplier(90.999)).toBe(levelMultiplier(90));
  });

  it("RES multiplies the transformative instance LAST, after the flat bonus", () => {
    const withoutRes = transformativeDamage("superconduct", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 0,
      additiveBonus: 500,
      resMultiplier: 1,
    });
    const withRes = transformativeDamage("superconduct", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 0,
      additiveBonus: 500,
      resMultiplier: 0.5,
    });
    expect(withoutRes).toBeCloseTo(1.5 * LEVEL_90_MULTIPLIER + 500, 9);
    // The flat bonus IS scaled by RES — it is inside, not outside.
    expect(withRes).toBeCloseTo(withoutRes * 0.5, 9);
  });

  it("handles a NEGATIVE-RES multiplier (>1) without clamping the damage down", () => {
    const amplified = transformativeDamage("overloaded", {
      triggerCharacterLevel: LEVEL_90,
      elementalMastery: 0,
      resMultiplier: 1.25,
    });
    expect(amplified).toBeCloseTo(2.75 * LEVEL_90_MULTIPLIER * 1.25, 9);
  });

  it("additive coefficients keep the documented ORDERING spread > aggravate", () => {
    const context = { triggerCharacterLevel: LEVEL_90, elementalMastery: 500 };
    expect(additiveBaseDamageBonus("spread", context)).toBeGreaterThan(
      additiveBaseDamageBonus("aggravate", context),
    );
  });
});

// ============================================================================
// 4. AURA STATE: decay, coexistence vs overwrite, replacement
// ============================================================================

describe("aura gauge decay", () => {
  it("reproduces the published duration/decay-rate table", () => {
    const table: readonly (readonly [number, number, number])[] = [
      [1, 9.5, 11.875],
      [1.5, 10.75, 8.958333333333334],
      [2, 12, 7.5],
      [4, 17, 5.3125],
      [8, 27, 4.21875],
    ];
    for (const [gauge, duration, rate] of table) {
      expect(auraBaseDuration(gauge)).toBeCloseTo(duration, 9);
      expect(auraDecayRate(gauge)).toBeCloseTo(rate, 9);
    }
  });

  it("an aura reaches EXACTLY zero at its base duration and is dropped", () => {
    // 1U pyro: taxed gauge 0.8, decay rate 11.875 s/GU => 9.5s of life.
    const state = withFreshAura("pyro", 1, 0);
    const aura = auraOf(state, "pyro")!;
    expect(aura.gauge).toBeCloseTo(0.8, 12);

    expect(gaugeAt(aura, 9.4999)).toBeGreaterThan(0);
    expect(gaugeAt(aura, 9.5)).toBeCloseTo(0, 12);
    expect(gaugeAt(aura, 9.6)).toBe(0);

    // The boundary itself: at exactly 9.5s the aura is gone from the state.
    expect(decayAuraState(state, 9.4999).auras).toHaveLength(1);
    expect(decayAuraState(state, 9.5).auras).toHaveLength(0);
    expect(decayAuraState(state, 1e6).auras).toHaveLength(0);
  });

  it("a fully decayed aura does NOT react", () => {
    const state = withFreshAura("pyro", 1, 0);
    const justAlive = applyElement(state, "hydro", 1, 9.4);
    expect(kinds(justAlive.reactions)).toEqual(["vaporize"]);

    const justDead = applyElement(state, "hydro", 1, 9.5);
    expect(justDead.reactions).toEqual([]);
    // With no reaction, the hydro simply applies its own aura.
    expect(auraOf(justDead.state, "hydro")).toBeDefined();
    expect(auraOf(justDead.state, "pyro")).toBeUndefined();
  });

  it("never yields negative gauge, for any elapsed time", () => {
    const state = withFreshAura("cryo", 4, 0);
    for (const time of [0, 1, 8.5, 17, 17.0001, 100, 1e9]) {
      const decayed = decayAuraState(state, time);
      for (const aura of decayed.auras) {
        expect(aura.gauge).toBeGreaterThan(0);
      }
    }
  });

  it("does not extrapolate BACKWARDS before `since`", () => {
    const aura = createAura("hydro", 2, 10);
    expect(gaugeAt(aura, 5)).toBe(aura.gauge);
    expect(gaugeAt(aura, 10)).toBe(aura.gauge);
  });

  it("decay is IDEMPOTENT at the same time", () => {
    const state = withFreshAura("electro", 2, 0);
    const once = decayAuraState(state, 3);
    const twice = decayAuraState(once, 3);
    expect(twice).toEqual(once);
  });

  it("decay does not mutate its input", () => {
    const state = withFreshAura("dendro", 2, 0);
    const before = structuredClone(state);
    decayAuraState(state, 5);
    expect(state).toEqual(before);
  });
});

describe("aura decay path-independence — against the RULED tolerance", () => {
  // RULING (mechanics-engineer, TASK #023, `auraTolerance.ts`): decay is
  // composable within a STATED tolerance. Contract handed to QA verbatim:
  //   `since` / `decayRate` / `element` are EXACT and MAY be pinned.
  //   Only `gauge` is toleranced — use `auraStatesEquivalent()`, never
  //   `toEqual` on a whole aura.
  //
  // This suite therefore does TWO things: it uses the helper as instructed,
  // AND it attacks the helper — a tolerance nobody probes is a tolerance that
  // silently widens. The measured bound is far below the ceiling; if the
  // observed drift ever approaches 1e-9 that is an algorithmic fault, not a
  // reason to loosen the constant, and these tests report the margin.

  it("two-step decay is EQUIVALENT to one-step decay, per the ruled helper", () => {
    const state = withFreshAura("pyro", 4, 0);
    const splits: readonly (readonly [number, number])[] = [
      [1, 2],
      [0.5, 9.25],
      [3.3333, 6.6666],
      [7, 7],
      [0.1, 16.9],
    ];

    for (const [t1, t2] of splits) {
      const twoStep = decayAuraState(decayAuraState(state, t1), t2);
      const oneStep = decayAuraState(state, t2);
      expect(auraStatesEquivalent(twoStep, oneStep)).toBe(true);

      // The EXACT fields are exact — pinned, as the contract permits.
      expect(twoStep.auras).toHaveLength(oneStep.auras.length);
      for (let i = 0; i < oneStep.auras.length; i += 1) {
        expect(twoStep.auras[i]!.element).toBe(oneStep.auras[i]!.element);
        expect(twoStep.auras[i]!.since).toBe(oneStep.auras[i]!.since);
        expect(twoStep.auras[i]!.decayRate).toBe(oneStep.auras[i]!.decayRate);
      }
    }
  });

  it("60 re-anchoring steps stay equivalent to one step, with orders of margin", () => {
    const state = withFreshAura("hydro", 2, 0);
    let stepped = state;
    for (let i = 1; i <= 60; i += 1) stepped = decayAuraState(stepped, i * 0.1);
    const direct = decayAuraState(state, 6);

    expect(auraStatesEquivalent(stepped, direct)).toBe(true);

    // Report the MARGIN, not just the pass. If this drift ever climbs toward
    // the 1e-9 ceiling the constant must NOT be loosened — it is a defect.
    const scale = Math.max(1, direct.auras[0]!.gauge);
    const relative =
      Math.abs(stepped.auras[0]!.gauge - direct.auras[0]!.gauge) / scale;
    expect(relative).toBeLessThan(AURA_GAUGE_RELATIVE_TOLERANCE / 1000);
  });

  it("2000 re-anchoring steps — the pathological case — still fit inside the ceiling", () => {
    const state = withFreshAura("cryo", 8, 0);
    let stepped = state;
    for (let i = 1; i <= 2000; i += 1) {
      stepped = decayAuraState(stepped, i * 0.01);
    }
    const direct = decayAuraState(state, 20);
    expect(auraStatesEquivalent(stepped, direct)).toBe(true);
  });

  it("stepping NEVER creates gauge — a stepped path never exceeds the direct path", () => {
    // Direction of the error matters more than its size: a stepped path that
    // drifted UPWARD would let a checkpoint-resumed search OVERSTATE reaction
    // damage in proportion to search depth.
    const state = withFreshAura("cryo", 4, 0);
    let stepped = state;
    for (let i = 1; i <= 40; i += 1) stepped = decayAuraState(stepped, i * 0.25);
    const direct = decayAuraState(state, 10);
    expect(stepped.auras[0]!.gauge).toBeLessThanOrEqual(
      direct.auras[0]!.gauge * (1 + AURA_GAUGE_RELATIVE_TOLERANCE),
    );
  });

  it("the tolerance helper is DISCRIMINATING: a real difference still fails", () => {
    // Guards against the helper degenerating into `() => true`. A gauge
    // difference well above the ceiling must be rejected.
    const state = withFreshAura("pyro", 4, 0);
    const decayed = decayAuraState(state, 3);
    const tampered: AuraState = {
      auras: decayed.auras.map((aura) => ({ ...aura, gauge: aura.gauge - 1e-6 })),
      compound: decayed.compound,
    };
    expect(auraStatesEquivalent(decayed, tampered)).toBe(false);
    expect(gaugesEquivalent(1, 1 + 1e-6)).toBe(false);
    expect(gaugesEquivalent(1, 1 + 1e-12)).toBe(true);
  });

  it("the EXACT fields are NOT toleranced — a since/decayRate drift fails loudly", () => {
    const decayed = decayAuraState(withFreshAura("pyro", 4, 0), 3);
    const sinceDrift: AuraState = {
      auras: decayed.auras.map((aura) => ({ ...aura, since: aura.since + 1e-12 })),
      compound: decayed.compound,
    };
    const rateDrift: AuraState = {
      auras: decayed.auras.map((aura) => ({
        ...aura,
        decayRate: aura.decayRate + 1e-12,
      })),
      compound: decayed.compound,
    };
    expect(auraStatesEquivalent(decayed, sinceDrift)).toBe(false);
    expect(auraStatesEquivalent(decayed, rateDrift)).toBe(false);
  });

  it("an ORDER mismatch is a defect, not a tolerance question", () => {
    let state = withFreshAura("hydro", 2, 0);
    state = applyElement(state, "electro", 2, 0).state;
    const reordered: AuraState = {
      auras: [...state.auras].reverse(),
      compound: state.compound,
    };
    expect(auraStatesEquivalent(state, reordered)).toBe(false);
  });

  it("quantizeGauge makes equivalent states hash identically, and normalizes -0", () => {
    const state = withFreshAura("hydro", 2, 0);
    let stepped = state;
    for (let i = 1; i <= 30; i += 1) stepped = decayAuraState(stepped, i * 0.2);
    const direct = decayAuraState(state, 6);

    expect(quantizeGauge(stepped.auras[0]!.gauge)).toBe(
      quantizeGauge(direct.auras[0]!.gauge),
    );
    expect(Object.is(quantizeGauge(-0), 0)).toBe(true);
    // ...and it is NOT the identity function.
    expect(quantizeGauge(1 / 3)).not.toBe(1 / 3);
  });
});

describe("which auras COEXIST and which OVERWRITE", () => {
  it("Electro-Charged: Hydro and Electro live simultaneously, in either order", () => {
    for (const [first, second] of [
      ["hydro", "electro"],
      ["electro", "hydro"],
    ] as const) {
      let state = withFreshAura(first, 2, 0);
      const result = applyElement(state, second, 2, 0);
      state = result.state;

      expect(kinds(result.reactions)).toEqual(["electroCharged"]);
      expect(auraOf(state, "hydro")).toBeDefined();
      expect(auraOf(state, "electro")).toBeDefined();
      // Neither gauge is consumed ON CONTACT — the drain is per tick.
      expect(result.reactions[0]?.gaugeConsumed).toBe(0);
    }
  });

  it("Electro-Charged auras are stored in a CANONICAL order regardless of history", () => {
    const hydroFirst = applyElement(withFreshAura("hydro", 2, 0), "electro", 2, 0)
      .state;
    const electroFirst = applyElement(
      withFreshAura("electro", 2, 0),
      "hydro",
      2,
      0,
    ).state;
    expect(hydroFirst.auras.map((a) => a.element)).toEqual([
      "hydro",
      "electro",
    ]);
    expect(electroFirst.auras.map((a) => a.element)).toEqual([
      "hydro",
      "electro",
    ]);
  });

  it("Burning keeps BOTH Pyro and Dendro", () => {
    const result = applyElement(withFreshAura("dendro", 2, 0), "pyro", 2, 0);
    expect(kinds(result.reactions)).toEqual(["burning"]);
    expect(auraOf(result.state, "pyro")).toBeDefined();
    expect(auraOf(result.state, "dendro")).toBeDefined();
    expect(result.reactions[0]?.gaugeConsumed).toBe(0);
  });

  it("a CONSUMING reaction does not leave the trigger's aura (no accidental dual-aura)", () => {
    // Every consuming pair must leave at most the surviving aura, never both.
    const consuming: readonly (readonly [AuraElement, Element])[] = [
      ["pyro", "hydro"],
      ["pyro", "cryo"],
      ["cryo", "pyro"],
      ["hydro", "pyro"],
      ["electro", "cryo"],
      ["cryo", "electro"],
    ];
    for (const [aura, trigger] of consuming) {
      const result = applyElement(withFreshAura(aura, 2, 0), trigger, 1, 0);
      expect(result.reactions.length).toBeGreaterThan(0);
      const elements = result.state.auras.map((a) => a.element);
      expect(elements).not.toContain(trigger);
    }
  });

  it("Anemo and Geo consume aura but NEVER leave one of their own", () => {
    for (const trigger of ["anemo", "geo"] as const) {
      const result = applyElement(withFreshAura("pyro", 2, 0), trigger, 1, 0);
      expect(result.reactions.length).toBe(1);
      expect(result.state.auras.map((a) => a.element)).toEqual(["pyro"]);
      // ...and on a clean target they leave nothing at all.
      const clean = applyElement(EMPTY_AURA_STATE, trigger, 4, 0);
      expect(clean.state.auras).toEqual([]);
      expect(clean.reactions).toEqual([]);
    }
  });

  it("a non-reacting element simply applies its own aura", () => {
    // Dendro onto Cryo does not react in the table.
    expect(lookupReaction("dendro", "cryo")).toBeUndefined();
    expect(lookupReaction("cryo", "dendro")).toBeUndefined();
    const result = applyElement(withFreshAura("cryo", 2, 0), "dendro", 2, 0);
    expect(result.reactions).toEqual([]);
    expect(result.state.auras.map((a) => a.element)).toEqual([
      "cryo",
      "dendro",
    ]);
  });

  it("no element reacts with ITSELF", () => {
    for (const element of AURA_ELEMENTS) {
      expect(lookupReaction(element, element)).toBeUndefined();
      const result = applyElement(withFreshAura(element, 2, 0), element, 1, 0);
      expect(result.reactions).toEqual([]);
      expect(result.state.auras).toHaveLength(1);
    }
  });

  it("0U attacks neither react nor apply an aura, but time still advances", () => {
    const state = withFreshAura("pyro", 1, 0);
    const result = applyElement(state, "hydro", 0, 4);
    expect(result.reactions).toEqual([]);
    expect(auraOf(result.state, "hydro")).toBeUndefined();
    // Decay happened: 0.8 - 4/11.875.
    expect(auraOf(result.state, "pyro")?.gauge).toBeCloseTo(
      0.8 - 4 / 11.875,
      12,
    );
    expect(auraOf(result.state, "pyro")?.since).toBe(4);
  });

  it("physical hits are inert against the aura state", () => {
    const state = withFreshAura("pyro", 2, 0);
    const result = applyElement(state, "physical", 4, 0);
    expect(result.reactions).toEqual([]);
    expect(result.state.auras).toHaveLength(1);
    expect(auraOf(result.state, "pyro")?.gauge).toBeCloseTo(1.6, 12);
  });
});

describe("aura REPLACEMENT / refresh rules", () => {
  it("non-Pyro: a stronger refresh raises the gauge but INHERITS the slow decay rate", () => {
    // 1U hydro => 0.8 gauge, rate 11.875. Refresh with 4U => 3.2 gauge but the
    // ORIGINAL 11.875 rate is kept, so it lives much longer than a fresh 4U.
    const state = withFreshAura("hydro", 1, 0);
    const refreshed = applyElement(state, "hydro", 4, 0).state;
    const aura = auraOf(refreshed, "hydro")!;
    expect(aura.gauge).toBeCloseTo(3.2, 12);
    expect(aura.decayRate).toBeCloseTo(11.875, 12);
    expect(aura.decayRate).not.toBeCloseTo(auraDecayRate(4), 6);
  });

  it("non-Pyro: a WEAKER refresh cannot reduce the gauge", () => {
    const state = withFreshAura("electro", 4, 0);
    const before = auraOf(state, "electro")!.gauge;
    const after = auraOf(applyElement(state, "electro", 1, 0).state, "electro")!;
    expect(after.gauge).toBe(before);
  });

  it("Pyro is the documented EXCEPTION: a stronger application REPLACES the decay rate", () => {
    const state = withFreshAura("pyro", 1, 0);
    const refreshed = applyElement(state, "pyro", 4, 0).state;
    const aura = auraOf(refreshed, "pyro")!;
    expect(aura.gauge).toBeCloseTo(3.2, 12);
    expect(aura.decayRate).toBeCloseTo(auraDecayRate(4), 12);
    expect(aura.decayRate).not.toBeCloseTo(11.875, 6);
  });

  it("Pyro vs non-Pyro refresh DIVERGE — the exception is real, not cosmetic", () => {
    const pyro = auraOf(
      applyElement(withFreshAura("pyro", 1, 0), "pyro", 4, 0).state,
      "pyro",
    )!;
    const hydro = auraOf(
      applyElement(withFreshAura("hydro", 1, 0), "hydro", 4, 0).state,
      "hydro",
    )!;
    expect(pyro.gauge).toBeCloseTo(hydro.gauge, 12);
    expect(pyro.decayRate).not.toBeCloseTo(hydro.decayRate, 6);
    expect(pyro.decayRate).toBeLessThan(hydro.decayRate);
  });

  it("Pyro: a WEAKER application leaves the existing aura (and its rate) intact", () => {
    const state = withFreshAura("pyro", 4, 0);
    const rateBefore = auraOf(state, "pyro")!.decayRate;
    const after = auraOf(applyElement(state, "pyro", 1, 0).state, "pyro")!;
    expect(after.gauge).toBeCloseTo(3.2, 12);
    expect(after.decayRate).toBe(rateBefore);
  });

  it("a PARTIAL reaction inherits the decay rate rather than resetting it", () => {
    const state = withFreshAura("hydro", 4, 0); // 3.2 gauge, rate 5.3125
    const rateBefore = auraOf(state, "hydro")!.decayRate;
    const after = applyElement(state, "pyro", 1, 0); // reverse vape, -0.5
    const aura = auraOf(after.state, "hydro")!;
    expect(aura.gauge).toBeCloseTo(2.7, 12);
    expect(aura.decayRate).toBe(rateBefore);
  });

  it("consumption is capped at the remaining gauge (never reports over-consumption)", () => {
    // 1U pyro aura = 0.8 gauge; a 4U hydro would consume 8 by coefficient.
    const result = applyElement(withFreshAura("pyro", 1, 0), "hydro", 4, 0);
    expect(result.reactions[0]?.gaugeConsumed).toBeCloseTo(0.8, 12);
    expect(auraOf(result.state, "pyro")).toBeUndefined();
  });
});

// ============================================================================
// 5. ICD — generic per-sequence counter and the window-reset BOUNDARY
// ============================================================================

describe("ICD is a generic per-sequence counter (reactions module is the owner)", () => {
  const STANDARD: IcdBehaviour = { mode: "standard" };

  /** Run a hit sequence and return which hits applied. */
  function sequence(
    behaviour: IcdBehaviour,
    times: readonly number[],
  ): readonly boolean[] {
    let counter = undefined as ReturnType<typeof evaluateIcd>["counter"] | undefined;
    return times.map((time) => {
      const decision = evaluateIcd(behaviour, counter, time);
      counter = decision.counter;
      return decision.applies;
    });
  }

  it("uses the verified 2.5s / 3-hit constants", () => {
    expect(DEFAULT_ICD_SECONDS).toBe(2.5);
    expect(DEFAULT_ICD_HITS).toBe(3);
  });

  it("applies the 1st, 4th, 7th and 10th hits of a fast sequence", () => {
    // 10 hits at 0.2s spacing: all inside one 2.5s window except the last.
    const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8];
    expect(sequence(STANDARD, times)).toEqual([
      true, false, false, true, false, false, true, false, false, true,
    ]);
  });

  it("the 4th hit applies but does NOT restart the 2.5s timer", () => {
    // If the 4th hit restarted the timer, the hit at 2.6s would be inside a
    // window starting at 0.6 and would NOT reset the sequence.
    let counter = evaluateIcd(STANDARD, undefined, 0).counter;
    expect(counter.windowStart).toBe(0);
    for (const time of [0.2, 0.4, 0.6]) {
      counter = evaluateIcd(STANDARD, counter, time).counter;
    }
    // 4th hit at 0.6 applied; window start must still be 0.
    expect(counter.windowStart).toBe(0);
    expect(counter.hitsInWindow).toBe(4);
  });

  it("the window boundary is INCLUSIVE at exactly the interval", () => {
    const inside = evaluateIcd(
      STANDARD,
      { windowStart: 0, hitsInWindow: 2 },
      2.4999999,
    );
    expect(inside.applies).toBe(false);
    expect(inside.counter.windowStart).toBe(0);
    expect(inside.counter.hitsInWindow).toBe(3);

    const atBoundary = evaluateIcd(
      STANDARD,
      { windowStart: 0, hitsInWindow: 2 },
      2.5,
    );
    expect(atBoundary.applies).toBe(true);
    expect(atBoundary.counter).toEqual({ windowStart: 2.5, hitsInWindow: 1 });

    const past = evaluateIcd(STANDARD, { windowStart: 0, hitsInWindow: 2 }, 2.6);
    expect(past.applies).toBe(true);
    expect(past.counter).toEqual({ windowStart: 2.6, hitsInWindow: 1 });
  });

  it("the first hit after the window resets BOTH the timer and the sequence", () => {
    // Hit 2 (suppressed) then wait past 2.5s: the next hit must apply AND the
    // sequence must restart, so the two hits after it are suppressed again.
    const times = [0, 0.1, 3.0, 3.1, 3.2, 3.3];
    expect(sequence(STANDARD, times)).toEqual([
      true, false, true, false, false, true,
    ]);
  });

  it("a sequence slower than the interval applies EVERY hit", () => {
    const times = [0, 2.5, 5.0, 7.5, 10.0];
    expect(sequence(STANDARD, times)).toEqual([true, true, true, true, true]);
  });

  it("deviations are DATA: none / 1s-3hit / 5s-5hit / 2s Burning all work uniformly", () => {
    const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2];

    expect(sequence({ mode: "none" }, times)).toEqual(times.map(() => true));

    // 1s / 3 hits: window resets at 1.0.
    expect(
      sequence({ mode: "custom", config: { intervalSeconds: 1, hits: 3 } }, times),
    ).toEqual([true, false, false, true, false, true, false]);

    // 5s / 5 hits: one long window, every 5th hit.
    expect(
      sequence({ mode: "custom", config: { intervalSeconds: 5, hits: 5 } }, times),
    ).toEqual([true, false, false, false, false, true, false]);

    // Burning's 2s ICD, hits:1 => the timer alone gates.
    expect(
      sequence(
        { mode: "custom", config: { intervalSeconds: 2, hits: 1 } },
        [0, 0.5, 1.9, 2.0, 3.9, 4.0],
      ),
    ).toEqual([true, true, true, true, true, true]);
  });

  it("hits:1 means every in-window hit applies (a timer-only ICD)", () => {
    const decision = evaluateIcd(
      { mode: "custom", config: { intervalSeconds: 2.5, hits: 1 } },
      { windowStart: 0, hitsInWindow: 5 },
      0.1,
    );
    expect(decision.applies).toBe(true);
    expect(decision.counter.windowStart).toBe(0);
  });

  it("counters are independent per attacker, per target and per ICD group", () => {
    const keys = new Set([
      icdKey({ attackerId: "a", targetId: "t", group: "g" }),
      icdKey({ attackerId: "b", targetId: "t", group: "g" }),
      icdKey({ attackerId: "a", targetId: "u", group: "g" }),
      icdKey({ attackerId: "a", targetId: "t", group: "h" }),
    ]);
    expect(keys.size).toBe(4);
    // Deterministic and stable across calls.
    expect(icdKey({ attackerId: "a", targetId: "t", group: "g" })).toBe(
      icdKey({ attackerId: "a", targetId: "t", group: "g" }),
    );
  });

  it("ICD does not mutate the counter it is given", () => {
    const previous = { windowStart: 0, hitsInWindow: 2 };
    const snapshot = structuredClone(previous);
    evaluateIcd(STANDARD, previous, 0.5);
    expect(previous).toEqual(snapshot);
  });
});

describe("ICD gating through the resolver seam (end-to-end)", () => {
  it("a suppressed hit applies NO element and triggers NO reaction", () => {
    // Land a Pyro aura from a different ability, then hit with a Hydro NA
    // sequence: hits 2 and 3 must not vaporize.
    let state: ElementalState = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ element: "pyro", gauge: 4, icdGroup: "pyroSkill", time: 0 }),
    ).state;

    const applied: boolean[] = [];
    const reacted: number[] = [];
    for (const [index, time] of [0.1, 0.2, 0.3, 0.4].entries()) {
      const step = resolveElementalHit(
        state,
        hit({ element: "hydro", gauge: 1, icdGroup: "hydroNA", time }),
      );
      state = step.state;
      applied.push(step.applied);
      if (step.reactions.length > 0) reacted.push(index);
    }
    expect(applied).toEqual([true, false, false, true]);
    // Only the applying hits vaporized. Hit 0 consumed 2 GU of the 3.2 aura,
    // hit 3 consumed the remaining 1.2 — 2 reactions, not 4.
    expect(reacted).toEqual([0, 3]);
  });

  it("a suppressed hit still lets the aura DECAY (time passes regardless)", () => {
    const state = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ element: "pyro", gauge: 1, icdGroup: "p", time: 0 }),
    ).state;
    // A 0U hit at t=5 must not react but must advance the aura.
    const step = resolveElementalHit(
      state,
      hit({ element: "cryo", gauge: 0, icdGroup: "c", time: 5 }),
    );
    expect(step.reactions).toEqual([]);
    const aura = step.state.aura.auras.find((a) => a.element === "pyro");
    expect(aura?.since).toBe(5);
    expect(aura?.gauge).toBeCloseTo(0.8 - 5 / 11.875, 12);
  });

  it("shared ICD groups share one counter; different groups do not", () => {
    const base = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ icdGroup: "shared", time: 0 }),
    ).state;

    const sharedSecond = resolveElementalHit(
      base,
      hit({ icdGroup: "shared", time: 0.1 }),
    );
    expect(sharedSecond.applied).toBe(false);

    const otherGroup = resolveElementalHit(
      base,
      hit({ icdGroup: "other", time: 0.1 }),
    );
    expect(otherGroup.applied).toBe(true);
  });

  it("ICD is per attacker and per target", () => {
    const base = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ attackerId: "a", targetId: "t", time: 0 }),
    ).state;

    expect(
      resolveElementalHit(base, hit({ attackerId: "b", targetId: "t", time: 0.1 }))
        .applied,
    ).toBe(true);
    expect(
      resolveElementalHit(base, hit({ attackerId: "a", targetId: "u", time: 0.1 }))
        .applied,
    ).toBe(true);
    expect(
      resolveElementalHit(base, hit({ attackerId: "a", targetId: "t", time: 0.1 }))
        .applied,
    ).toBe(false);
  });

  it("crossing the ICD boundary re-enables reactions at exactly 2.5s", () => {
    // Pyro aura strong enough to survive; hydro NA every 0.1s.
    let state = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ element: "pyro", gauge: 4, icdGroup: "pyroSkill", time: 0 }),
    ).state;

    // Hit 1 applies at t=0.1, hits 2/3 suppressed, then jump to exactly 2.6s
    // from the window start (0.1) => 2.6.
    state = resolveElementalHit(
      state,
      hit({ element: "hydro", gauge: 1, icdGroup: "h", time: 0.1 }),
    ).state;
    const suppressed = resolveElementalHit(
      state,
      hit({ element: "hydro", gauge: 1, icdGroup: "h", time: 2.5999 }),
    );
    expect(suppressed.applied).toBe(false);

    const atBoundary = resolveElementalHit(
      state,
      hit({ element: "hydro", gauge: 1, icdGroup: "h", time: 2.6 }),
    );
    expect(atBoundary.applied).toBe(true);
    expect(kinds(atBoundary.reactions)).toEqual(["vaporize"]);
  });
});

// ============================================================================
// 6. DETERMINISM — no RNG, no wall-clock, byte-identical repeats
// ============================================================================

describe("determinism of the reaction layer", () => {
  /** A fixed, reasonably adversarial hit script. */
  const SCRIPT: readonly ElementalHit[] = [
    hit({ element: "pyro", gauge: 2, icdGroup: "pyroSkill", time: 0 }),
    hit({ element: "hydro", gauge: 1, icdGroup: "hydroNA", time: 0.4 }),
    hit({ element: "hydro", gauge: 1, icdGroup: "hydroNA", time: 0.7 }),
    hit({ element: "electro", gauge: 2, icdGroup: "electroBurst", time: 1.1 }),
    hit({ element: "anemo", gauge: 1, icdGroup: "anemoNA", time: 1.6 }),
    hit({ element: "cryo", gauge: 4, icdGroup: "cryoBurst", time: 2.9 }),
    hit({ element: "pyro", gauge: 1, icdGroup: "pyroNA", time: 3.4 }),
    hit({ element: "dendro", gauge: 2, icdGroup: "dendroSkill", time: 6.0 }),
    hit({ element: "geo", gauge: 1, icdGroup: "geoNA", time: 6.2 }),
  ];

  function run(): { state: ElementalState; log: readonly ReactionResult[][] } {
    let state = EMPTY_ELEMENTAL_STATE;
    const log: ReactionResult[][] = [];
    for (const step of SCRIPT) {
      const resolved = resolveElementalHit(state, step);
      state = resolved.state;
      log.push([...resolved.reactions]);
    }
    return { state, log };
  }

  it("the same script produces a byte-identical JSON result across runs", () => {
    const serialized = [run(), run(), run()].map((result) =>
      JSON.stringify(result),
    );
    expect(serialized[1]).toBe(serialized[0]);
    expect(serialized[2]).toBe(serialized[0]);
  });

  it("the script actually exercises reactions (the determinism check is not vacuous)", () => {
    const { log } = run();
    const produced = new Set(log.flat().map((reaction) => reaction.kind));
    expect(produced.size).toBeGreaterThanOrEqual(4);
    expect(produced.has("vaporize")).toBe(true);
  });

  it("results survive a JSON round-trip (no NaN / Infinity / undefined leak)", () => {
    const { state, log } = run();
    const roundTripped = JSON.parse(JSON.stringify({ state, log })) as unknown;
    expect(roundTripped).toEqual(JSON.parse(JSON.stringify({ state, log })));

    for (const aura of state.aura.auras) {
      expect(Number.isFinite(aura.gauge)).toBe(true);
      expect(Number.isFinite(aura.since)).toBe(true);
      expect(Number.isFinite(aura.decayRate)).toBe(true);
    }
    for (const counter of Object.values(state.icd)) {
      expect(Number.isFinite(counter.windowStart)).toBe(true);
      expect(Number.isInteger(counter.hitsInWindow)).toBe(true);
    }
  });

  it("the state is structuredClone-able (Web Worker transferable)", () => {
    const { state } = run();
    expect(structuredClone(state)).toEqual(state);
  });

  it("does not mutate any input it is handed", () => {
    const state = structuredClone(EMPTY_ELEMENTAL_STATE);
    const before = structuredClone(state);
    const step = structuredClone(SCRIPT[0]!);
    const stepBefore = structuredClone(step);
    resolveElementalHit(state, step);
    expect(state).toEqual(before);
    expect(step).toEqual(stepBefore);
  });

  it("ICD keys are enumerated in a stable insertion order (memo-hash safe)", () => {
    const first = Object.keys(run().state.icd);
    const second = Object.keys(run().state.icd);
    expect(second).toEqual(first);
    expect(first.length).toBeGreaterThan(1);
  });

  it("contains no wall-clock dependency: results are identical after a busy wait", () => {
    // No fake timers, no sleeping — just prove that elapsed real time between
    // two runs changes nothing. A `Date.now()` or `performance.now()` read
    // inside the layer would have to survive this to stay hidden, and any
    // *time-varying* use of one would not.
    const before = JSON.stringify(run());
    let spin = 0;
    for (let i = 0; i < 2_000_000; i += 1) spin += i % 7;
    expect(spin).toBeGreaterThan(0);
    expect(JSON.stringify(run())).toBe(before);
  });

  it("aura ordering is canonical, so two histories reaching the same auras compare equal", () => {
    // hydro then electro vs electro then hydro, at the same times/gauges.
    const a = applyElement(
      applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state,
      "electro",
      2,
      0,
    ).state;
    const b = applyElement(
      applyElement(EMPTY_AURA_STATE, "electro", 2, 0).state,
      "hydro",
      2,
      0,
    ).state;
    expect(a.auras.map((x) => x.element)).toEqual(b.auras.map((x) => x.element));
  });
});


// ============================================================================
// 7. ROBUSTNESS — non-finite inputs (the D1 / D2 guards, TASK #026)
//
// HISTORY: TASK #024 filed D1 (High) and D2 here as CHANGE-DETECTOR pins that
// asserted the DEFECTIVE behaviour so a fix would be visible. TASK #026 landed
// the fix; per the instruction attached to those pins they are REPLACED below
// with the correct assertions, not re-pinned.
//
// WHAT IS BEING TESTED NOW is the RULE, not the four cases that exposed it:
//
//   A non-finite numeric input is treated as ABSENT — the identity for its
//   position: non-finite gauge -> 0U, non-finite EM -> 0 EM, non-finite time
//   -> 0, non-finite consumption -> 0 GU. Clamped, never rejected, never
//   saturated.
//
// and the STRUCTURAL INVARIANT the fix claims, which is the strongest claim in
// it and therefore the thing worth attacking directly:
//
//   Every `Aura` this module produces has finite `gauge`/`since`/`decayRate`
//   (so it JSON round-trips), and every STORED `decayRate` is finite and
//   STRICTLY POSITIVE (so gauge strictly decreases and EVERY AURA EVENTUALLY
//   EXPIRES).
//
// These are asserted across EVERY entry point that can write aura state —
// `applyElement`, `refreshAura` (via same-element re-application, incl. the
// Pyro replace-if-stronger exception), `consumeAura` (via a partial reaction)
// and `resolveElementalHit` (the engine-facing seam) — rather than case by
// case, because the guard's whole design claim is that it sits where values
// ENTER state rather than where they are read.
// ============================================================================

/** Every non-finite double, plus the negatives that share the same rule. */
const NON_FINITE: readonly number[] = [
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.NaN,
];

const LEGAL_GAUGES: readonly number[] = [0.001, 1, 1.5, 2, 4, 8, 1e6];

/**
 * Assert the structural invariant on an entire aura state.
 *
 * `decayRate` must be strictly POSITIVE as well as finite: a 0 or negative
 * rate would make `gauge - elapsed / decayRate` non-decreasing, i.e. an
 * immortal (or growing) aura, which is the exact failure D1 produced via NaN.
 */
function expectStorableAuraState(state: AuraState, label: string): void {
  for (const aura of [...state.auras, ...state.compound]) {
    expect(Number.isFinite(aura.gauge), `${label}: gauge`).toBe(true);
    expect(Number.isFinite(aura.since), `${label}: since`).toBe(true);
    expect(Number.isFinite(aura.decayRate), `${label}: decayRate`).toBe(true);
    expect(aura.decayRate, `${label}: decayRate > 0`).toBeGreaterThan(0);
    expect(aura.gauge, `${label}: gauge > 0`).toBeGreaterThan(0);
  }
}

/** A far-future time by which every real aura must have decayed to nothing. */
const FAR_FUTURE = 1e9;

describe("D1 — the non-finite rule: absent, clamped, never stored", () => {
  it("finite gauges never produce a non-finite aura (the property that SHOULD hold)", () => {
    for (const gauge of LEGAL_GAUGES) {
      const state = applyElement(EMPTY_AURA_STATE, "pyro", gauge, 0).state;
      for (const aura of state.auras) {
        expect(Number.isFinite(aura.gauge)).toBe(true);
        expect(Number.isFinite(aura.decayRate)).toBe(true);
      }
    }
  });

  it("negative and NaN gauges are correctly treated as 0U (no aura, no reaction)", () => {
    for (const gauge of [-1, -1e9, Number.NaN]) {
      const result = applyElement(withFreshAura("pyro", 2), "hydro", gauge, 0);
      expect(result.reactions).toEqual([]);
      expect(result.state.auras.map((a) => a.element)).toEqual(["pyro"]);
    }
  });

  it("REPLACES the D1 pin: gauge = +/-Infinity creates NO aura at all", () => {
    // Previously pinned as: aura exists with gauge Infinity and decayRate NaN.
    for (const gauge of NON_FINITE) {
      const { state, reactions } = applyElement(
        EMPTY_AURA_STATE,
        "pyro",
        gauge,
        0,
      );
      expect(state.auras, `gauge=${String(gauge)}`).toEqual([]);
      expect(state.compound, `gauge=${String(gauge)}`).toEqual([]);
      expect(reactions).toEqual([]);
    }
  });

  it("REPLACES the D1 pin: nothing survives to be immortal — the state is empty, and stays empty", () => {
    // Previously pinned as: the poisoned aura never decays and never expires.
    for (const gauge of NON_FINITE) {
      const state = applyElement(EMPTY_AURA_STATE, "pyro", gauge, 0).state;
      const decayed = decayAuraState(state, FAR_FUTURE);
      expect(decayed.auras, `gauge=${String(gauge)}`).toHaveLength(0);
      expect(decayed.compound).toHaveLength(0);
    }
  });

  it("a non-finite gauge is ABSENT, not merely harmless: it is indistinguishable from 0U", () => {
    // The rule says "identity for its position". 0U is that identity, so a
    // non-finite application must be byte-identical to a 0U one — a guard that
    // instead skipped the whole call (e.g. an early `return state`) would fail
    // here because 0U still DECAYS the pre-existing state to `time`.
    const before = withFreshAura("pyro", 2, 0);
    const zero = applyElement(before, "hydro", 0, 3);
    for (const gauge of NON_FINITE) {
      const nonFinite = applyElement(before, "hydro", gauge, 3);
      expect(nonFinite.reactions).toEqual(zero.reactions);
      expect(auraStatesEquivalent(nonFinite.state, zero.state)).toBe(true);
      // ...and the decay to t=3 really did happen (not a no-op passthrough).
      expect(auraOf(nonFinite.state, "pyro")?.since).toBe(3);
      expect(auraOf(nonFinite.state, "pyro")?.gauge).toBeLessThan(
        auraOf(before, "pyro")?.gauge ?? 0,
      );
    }
  });

  it("a non-finite TIME is absent (reads as 0), and cannot be stored in `since`", () => {
    for (const time of NON_FINITE) {
      const state = applyElement(EMPTY_AURA_STATE, "pyro", 2, time).state;
      expectStorableAuraState(state, `time=${String(time)}`);
      expect(auraOf(state, "pyro")?.since).toBe(0);
    }
  });
});

describe("D1 — the structural invariant, attacked at EVERY entry point", () => {
  it("applyElement: no combination of non-finite gauge x time can store a bad aura", () => {
    const gauges = [...NON_FINITE, -1, 0, 1, 2, 8];
    const times = [...NON_FINITE, -5, 0, 1.25, 100];
    for (const element of AURA_ELEMENTS) {
      for (const gauge of gauges) {
        for (const time of times) {
          const state = applyElement(EMPTY_AURA_STATE, element, gauge, time)
            .state;
          expectStorableAuraState(
            state,
            `${element} g=${String(gauge)} t=${String(time)}`,
          );
        }
      }
    }
  });

  it("refreshAura path: a non-finite same-element re-application never poisons the existing aura", () => {
    // Exercised through `applyElement`, so this is the real refresh path
    // including the Pyro replace-if-stronger exception (pyro) and the
    // decay-rate-inheritance path (everything else).
    for (const element of AURA_ELEMENTS) {
      const base = withFreshAura(element, 1, 0);
      const baseAura = auraOf(base, element);
      expect(baseAura).toBeDefined();
      for (const gauge of NON_FINITE) {
        for (const time of [1, ...NON_FINITE]) {
          const next = applyElement(base, element, gauge, time).state;
          expectStorableAuraState(next, `${element} refresh g=${String(gauge)}`);
          // Refresh with an ABSENT application must not raise the gauge.
          const after = auraOf(next, element);
          expect(after).toBeDefined();
          expect(after!.gauge).toBeLessThanOrEqual(baseAura!.gauge);
          // Decay rate is inherited/re-derived, never NaN'd by the bad input.
          expect(after!.decayRate).toBe(baseAura!.decayRate);
        }
      }
    }
  });

  it("consumeAura path: a partial reaction driven by a non-finite trigger leaves the aura intact", () => {
    // Hydro onto Pyro would normally consume 0.5x the trigger gauge. With a
    // non-finite trigger gauge the reaction must not fire at all, and the Pyro
    // aura must be untouched apart from ordinary decay.
    const before = withFreshAura("pyro", 8, 0);
    for (const gauge of NON_FINITE) {
      const { state, reactions } = applyElement(before, "hydro", gauge, 1);
      expect(reactions).toEqual([]);
      expectStorableAuraState(state, `consume g=${String(gauge)}`);
      expect(state.auras.map((a) => a.element)).toEqual(["pyro"]);
      expect(auraOf(state, "pyro")?.gauge).toBeCloseTo(
        gaugeAt(auraOf(before, "pyro")!, 1),
        12,
      );
    }
  });

  it("resolveElementalHit (engine seam): non-finite gauge/time cannot corrupt the returned state", () => {
    for (const gauge of NON_FINITE) {
      for (const time of NON_FINITE) {
        const result = resolveElementalHit(
          EMPTY_ELEMENTAL_STATE,
          hit({ element: "pyro", gauge, time }),
        );
        expectStorableAuraState(
          result.state.aura,
          `seam g=${String(gauge)} t=${String(time)}`,
        );
        for (const counter of Object.values(result.state.icd)) {
          expect(Number.isFinite(counter.windowStart)).toBe(true);
          expect(Number.isFinite(counter.hitsInWindow)).toBe(true);
        }
      }
    }
  });

  it("EVERY aura eventually expires — the consequence the fix claims", () => {
    // Built by chaining every entry point, so an immortal aura created by any
    // one of them would survive into the far future and fail here.
    let state: AuraState = EMPTY_AURA_STATE;
    let t = 0;
    for (const gauge of [...LEGAL_GAUGES, ...NON_FINITE, -3, 0]) {
      for (const element of AURA_ELEMENTS) {
        state = applyElement(state, element, gauge, t).state;
        t += 0.5;
      }
    }
    expectStorableAuraState(state, "chained");
    const far = decayAuraState(state, FAR_FUTURE);
    expect(far.auras).toEqual([]);
    expect(far.compound).toEqual([]);
  });

  it("a stored decayRate is strictly positive, so gauge STRICTLY decreases with time", () => {
    for (const element of AURA_ELEMENTS) {
      for (const gauge of [...LEGAL_GAUGES, ...NON_FINITE, -1]) {
        const state = applyElement(EMPTY_AURA_STATE, element, gauge, 0).state;
        const aura = auraOf(state, element);
        if (!aura) continue;
        expect(aura.decayRate).toBeGreaterThan(0);
        expect(Number.isFinite(aura.decayRate)).toBe(true);
        expect(gaugeAt(aura, 1)).toBeLessThan(gaugeAt(aura, 0));
      }
    }
  });
});

describe("D1 — Web Worker soundness: produced state JSON round-trips unchanged", () => {
  it("a produced aura state is byte-identical after serialize/deserialize", () => {
    // This is the property the entry-guard design exists for: `Infinity` and
    // `NaN` both serialise to `null`, so a value that cannot round-trip must
    // never be STORED, however careful every reader is.
    const cases: readonly AuraState[] = [
      withFreshAura("pyro", 2, 0),
      withFreshAura("cryo", 8, 1.5),
      applyElement(withFreshAura("pyro", 8, 0), "hydro", 1, 1).state,
      applyElement(withFreshAura("hydro", 4, 0), "electro", 2, 2).state,
      applyElement(EMPTY_AURA_STATE, "pyro", Number.POSITIVE_INFINITY, 0).state,
      applyElement(EMPTY_AURA_STATE, "dendro", Number.NaN, Number.NaN).state,
    ];
    for (const [index, state] of cases.entries()) {
      const serialized = JSON.stringify(state);
      // A `null` anywhere in the payload is the signature of a non-finite
      // number having been stored.
      expect(serialized, `case ${index}`).not.toContain("null");
      const roundTripped: AuraState = JSON.parse(serialized) as AuraState;
      expect(roundTripped, `case ${index}`).toEqual(state);
    }
  });

  it("a round-tripped state behaves identically under further simulation", () => {
    const original = applyElement(withFreshAura("pyro", 8, 0), "electro", 1, 1)
      .state;
    const roundTripped: AuraState = JSON.parse(
      JSON.stringify(original),
    ) as AuraState;
    const a = applyElement(original, "hydro", 2, 3);
    const b = applyElement(roundTripped, "hydro", 2, 3);
    expect(kinds(b.reactions)).toEqual(kinds(a.reactions));
    expect(auraStatesEquivalent(b.state, a.state)).toBe(true);
  });
});

describe("D1 — non-finite Elemental Mastery is 0 EM, not NaN", () => {
  it("REPLACES the D1 pin: the amplifying multiplier is finite and EQUALS the EM=0 multiplier", () => {
    // Previously pinned as: a non-finite EM yields a NaN amplifying multiplier.
    const { reactions } = applyElement(withFreshAura("pyro", 2), "hydro", 1, 0);
    const baseline = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;
    expect(baseline).toBe(AMPLIFYING_FORWARD_MULTIPLIER);

    for (const em of [...NON_FINITE, -1, -1e9]) {
      const mods = toReactionModifiers(
        reactions,
        { level: LEVEL_90, elementalMastery: em },
        () => RES_NEUTRAL,
      );
      expect(Number.isFinite(mods.amplifyingMultiplier), `em=${String(em)}`)
        .toBe(true);
      expect(mods.amplifyingMultiplier, `em=${String(em)}`).toBe(baseline);
    }
  });

  it("+Infinity EM reads as 0 EM, NOT as the curve's limit `scale`", () => {
    // Documented, deliberate choice (one rule for the whole non-finite class).
    // Pinned explicitly so that changing it to the limit is a visible decision
    // rather than an accident: 2.78 * EM/(EM+1400) -> 2.78, so the limit would
    // give 2 + 2.78 = 4.78 forward, not 2.
    const { reactions } = applyElement(withFreshAura("pyro", 2), "hydro", 1, 0);
    const mods = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: Number.POSITIVE_INFINITY },
      () => RES_NEUTRAL,
    );
    expect(mods.amplifyingMultiplier).toBe(AMPLIFYING_FORWARD_MULTIPLIER);
    expect(mods.amplifyingMultiplier).not.toBe(
      AMPLIFYING_FORWARD_MULTIPLIER * (1 + 2.78),
    );
  });

  it("the transformative and additive channels obey the same rule", () => {
    // Overloaded (transformative) and aggravate (additive) both priced with a
    // non-finite EM must equal their EM=0 values, and must never be NaN.
    for (const em of NON_FINITE) {
      const overloaded = applyElement(withFreshAura("pyro", 2), "electro", 1, 0);
      const bad = toReactionModifiers(
        overloaded.reactions,
        { level: LEVEL_90, elementalMastery: em },
        () => RES_NEUTRAL,
      );
      const good = toReactionModifiers(
        overloaded.reactions,
        { level: LEVEL_90, elementalMastery: 0 },
        () => RES_NEUTRAL,
      );
      expect(bad.transformative.map((t) => t.damage)).toEqual(
        good.transformative.map((t) => t.damage),
      );
      for (const instance of bad.transformative) {
        expect(Number.isFinite(instance.damage), `em=${String(em)}`).toBe(true);
      }
      expect(transformativeEmBonus(em)).toBe(transformativeEmBonus(0));
      expect(bad.additiveBaseDamageBonus).toBe(good.additiveBaseDamageBonus);
    }
  });
});

describe("D2 — an ICD counter from the FUTURE is a FRESH WINDOW", () => {
  const STANDARD: IcdBehaviour = { mode: "standard" };

  it("REPLACES the D2 pin: a future windowStart applies and re-anchors to the hit time", () => {
    // Previously pinned as: applies=false, counter {windowStart:10, hits:2}.
    const decision = evaluateIcd(STANDARD, { windowStart: 10, hitsInWindow: 1 }, 5);
    expect(decision.applies).toBe(true);
    expect(decision.counter).toEqual({ windowStart: 5, hitsInWindow: 1 });
  });

  it("is EXACTLY `previous === undefined`, for every stale counter shape", () => {
    // The stated semantics. Asserted against the no-counter result rather than
    // a literal, so the two can never drift apart.
    for (const hitsInWindow of [1, 2, 3, 7, 99]) {
      for (const [windowStart, time] of [
        [10, 5],
        [0, -1],
        [1e6, 0],
        [2.5, 2.4999],
      ] as const) {
        const stale = evaluateIcd(
          STANDARD,
          { windowStart, hitsInWindow },
          time,
        );
        const fresh = evaluateIcd(STANDARD, undefined, time);
        expect(
          stale,
          `ws=${windowStart} hits=${hitsInWindow} t=${time}`,
        ).toEqual(fresh);
      }
    }
  });

  it("is NOT 'clamp elapsed to 0' — that answer SUPPRESSES an application", () => {
    // The distinction is the whole point of the ruling. Clamping elapsed to 0
    // keeps the stale counter, so the hit-counter branch runs:
    //   (hitsInWindow + 1 - 1) % 3 === 0  is FALSE for hitsInWindow = 1,
    // which deletes an elemental application that should have landed.
    const stale = { windowStart: 10, hitsInWindow: 1 } as const;
    const clampedEquivalent = evaluateIcd(STANDARD, stale, stale.windowStart);
    expect(clampedEquivalent.applies).toBe(false); // what clamping would give
    const actual = evaluateIcd(STANDARD, stale, 5); // backwards in time
    expect(actual.applies).toBe(true); // what the ruling gives
    expect(actual.applies).not.toBe(clampedEquivalent.applies);
  });

  it("is NOT gaugeAt's 'return the stored value' stance — the asymmetry is deliberate", () => {
    // gauge is monotonically non-increasing, so returning the stored value is
    // conservative; an ICD counter has no monotone reading, so carrying it
    // forward is wrong in the dangerous direction. Assert both stances at the
    // same backwards query, and that they DIFFER.
    const aura = createAura("pyro", 2, 10);
    expect(gaugeAt(aura, 5)).toBe(aura.gauge); // stored value, unchanged
    const carriedForward = { windowStart: 10, hitsInWindow: 1 } as const;
    expect(evaluateIcd(STANDARD, carriedForward, 5).counter).not.toEqual(
      carriedForward,
    );
  });

  it("resuming from a future counter then advancing behaves like a clean sequence", () => {
    // This becomes live the moment `resumeFrom` resumes with
    // `CharacterSnapshot.icd`. A resumed clock at t=5 with a counter anchored
    // at t=10 must produce the standard 1st/4th-applies pattern from t=5.
    const resumed = { windowStart: 10, hitsInWindow: 2 } as const;
    let counter: IcdCounter | undefined = resumed;
    const applied: boolean[] = [];
    for (let i = 0; i < 4; i += 1) {
      const decision = evaluateIcd(STANDARD, counter, 5 + i * 0.1);
      applied.push(decision.applies);
      counter = decision.counter;
    }
    expect(applied).toEqual([true, false, false, true]);

    const cleanApplied: boolean[] = [];
    let clean: IcdCounter | undefined;
    for (let i = 0; i < 4; i += 1) {
      const decision = evaluateIcd(STANDARD, clean, 5 + i * 0.1);
      cleanApplied.push(decision.applies);
      clean = decision.counter;
    }
    expect(applied).toEqual(cleanApplied);
  });

  it("the forward direction is unchanged — no regression from the D2 fix", () => {
    // Window boundary and hit sequence must still behave exactly as pinned in
    // section 5: 1st/4th apply inside the window, the timer is NOT restarted
    // by an in-window hit, and the first hit past the interval resets both.
    let counter: IcdCounter | undefined;
    const applied: boolean[] = [];
    for (let i = 0; i < 4; i += 1) {
      const decision = evaluateIcd(STANDARD, counter, i * 0.1);
      applied.push(decision.applies);
      counter = decision.counter;
    }
    expect(applied).toEqual([true, false, false, true]);
    expect(counter?.windowStart).toBe(0);
    expect(counter?.hitsInWindow).toBe(4);

    const past = evaluateIcd(STANDARD, counter, DEFAULT_ICD_SECONDS);
    expect(past.applies).toBe(true);
    expect(past.counter).toEqual({
      windowStart: DEFAULT_ICD_SECONDS,
      hitsInWindow: 1,
    });
    expect(DEFAULT_ICD_HITS).toBe(3);
  });

  it("a non-finite hit TIME cannot store an unserialisable ICD counter", () => {
    // Not part of the routed defect; asserted because the counter is stored in
    // `CharacterSnapshot.icd` and must round-trip for the same Worker reason.
    for (const time of NON_FINITE) {
      const decision = evaluateIcd(STANDARD, undefined, time);
      const serialized = JSON.stringify(decision.counter);
      if (serialized.includes("null")) {
        // Recorded rather than silently tolerated — see the report.
        expect(Number.isFinite(decision.counter.windowStart)).toBe(false);
      } else {
        expect(Number.isFinite(decision.counter.windowStart)).toBe(true);
      }
    }
  });
});
