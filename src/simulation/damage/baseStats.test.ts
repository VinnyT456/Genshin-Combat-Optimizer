import { describe, expect, it } from "vitest";
import type { BaseStats, Stats } from "@/types";
import {
  baseStatOf,
  foldStatChannel,
  impliedBaseStats,
  withBaseStats,
} from "@/types";
import {
  simulateRotation,
  stanceBaseFor,
  statsWithBase,
} from "@/simulation/engine/simulateRotation";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { Rotation } from "@/types";

// ============================================================================
// BASE / FINAL STAT SPLIT
//
// Genshin scales ATK%/HP%/DEF% off BASE stat (character base + weapon base),
// never off final stat and never off accumulated flat bonuses:
//
//     stat = base * (1 + sum(pct)) + sum(flat)
//
// Before this split there was no base channel anywhere, so a percentage
// modifier could only be SKIPPED (understating damage) or applied to final
// (overstating it). Artifact main stats and substats are overwhelmingly
// percentage rolls, so neither option can express an artifact build.
//
// These tests pin three things:
//  1. the channel formula itself,
//  2. that the split is ADDITIVE — an ungeared run produces byte-identical
//     damage to before,
//  3. that base and final are genuinely DISTINCT quantities, i.e. a stat bag
//     whose base differs from its final scales percentages off base.
// ============================================================================

const ZERO_STATS: Stats = {
  atk: 0,
  hp: 0,
  def: 0,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

describe("foldStatChannel — the canonical channel formula", () => {
  it("applies percentage to BASE, not to the incoming final value", () => {
    // final 2000, base 800, +50% ATK. Correct: 2000 + 800*0.5 = 2400.
    // The on-final bug would give 2000 * 1.5 = 3000.
    const result = foldStatChannel(2000, 800, 0.5, 0);
    expect(result.value).toBe(2400);
    expect(result.percentApplied).toBe(true);
  });

  it("adds flat AFTER the percentage, never inside it", () => {
    // base 1000, +50%, +311 flat => 1000 + 1000*0.5 + 311 = 1811.
    // Scaling the flat term too would give (1000+311)*1.5 = 1966.5.
    const result = foldStatChannel(1000, 1000, 0.5, 311);
    expect(result.value).toBe(1811);
  });

  it("reports — and does not guess — when base is unknown", () => {
    // Flat still applies; the percentage is dropped and flagged rather than
    // silently applied to final.
    const result = foldStatChannel(2000, undefined, 0.5, 100);
    expect(result.value).toBe(2100);
    expect(result.percentApplied).toBe(false);
  });

  it("treats a zero percentage as trivially applied", () => {
    const result = foldStatChannel(2000, undefined, 0, 50);
    expect(result.value).toBe(2050);
    expect(result.percentApplied).toBe(true);
  });
});

describe("Stats base channel accessors", () => {
  it("withBaseStats is pure and attaches a detached copy", () => {
    const base: BaseStats = { atk: 800, hp: 10000, def: 600 };
    const withBase = withBaseStats(ZERO_STATS, base);

    expect(ZERO_STATS.base).toBeUndefined();
    expect(withBase.base).toEqual(base);

    // Mutating the source base must not reach into the produced stats.
    base.atk = 1;
    expect(withBase.base?.atk).toBe(800);
  });

  it("baseStatOf returns undefined rather than falling back to final", () => {
    const geared: Stats = { ...ZERO_STATS, atk: 2000 };
    // The dangerous behaviour would be returning 2000 here.
    expect(baseStatOf(geared, "atk")).toBeUndefined();
    expect(baseStatOf(withBaseStats(geared, { atk: 800, hp: 0, def: 0 }), "atk")).toBe(800);
  });

  it("impliedBaseStats reads final as base — valid only when ungeared", () => {
    const ungeared: Stats = { ...ZERO_STATS, atk: 800, hp: 10000, def: 600 };
    expect(impliedBaseStats(ungeared)).toEqual({ atk: 800, hp: 10000, def: 600 });
  });
});

describe("base/final split is additive — no existing damage number moves", () => {
  const rotation: Rotation = [
    { characterId: testPyro.id, actionType: "skill" },
    { characterId: testPyro.id, actionType: "normal" },
    { characterId: testPyro.id, actionType: "charged" },
  ];

  it("an ungeared simulation is byte-identical with and without an explicit base", () => {
    // The engine attaches `base` via the self-base assumption when the
    // definition carries none. Supplying that same base EXPLICITLY must change
    // nothing — which is what makes the split additive rather than breaking.
    const withoutBase = simulateRotation([testPyro], rotation, testEnemy);

    const explicitlyBased = {
      ...testPyro,
      baseStats: withBaseStats(
        testPyro.baseStats,
        impliedBaseStats(testPyro.baseStats),
      ),
    };
    const withExplicitBase = simulateRotation(
      [explicitlyBased],
      rotation,
      testEnemy,
    );

    expect(withExplicitBase.totalDamage).toBe(withoutBase.totalDamage);
    expect(JSON.stringify(withExplicitBase.timeline)).toBe(
      JSON.stringify(withoutBase.timeline),
    );
  });

  it("attaching a base channel alone never changes damage", () => {
    // `base` is an input to PERCENTAGE modifiers only. With no percentage
    // modifiers active, its presence must be inert. If this ever fails, the
    // base channel has leaked into the damage multiplication path.
    const baseline = simulateRotation([testPyro], rotation, testEnemy);

    const absurdBase = {
      ...testPyro,
      baseStats: withBaseStats(testPyro.baseStats, {
        atk: 999999,
        hp: 999999,
        def: 999999,
      }),
    };
    const withAbsurdBase = simulateRotation([absurdBase], rotation, testEnemy);

    expect(withAbsurdBase.totalDamage).toBe(baseline.totalDamage);
  });

  it("stays deterministic: repeated runs are identical", () => {
    const a = simulateRotation([testPyro], rotation, testEnemy);
    const b = simulateRotation([testPyro], rotation, testEnemy);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("stance percentage modifiers scale BASE, not final", () => {
  // These pin `stanceBaseFor`, the engine helper that decides what a stance's
  // atkPercent/hpPercent/defPercent multiply.
  //
  // MUTATION-VERIFIED: changing its body to `stats.base ?? impliedBaseStats(stats)`
  // — i.e. scaling off the already-buffed FINAL bag, the classic on-final bug —
  // passed the ENTIRE pre-existing suite (910 assertions, 0 failures). Nothing
  // covered this path. It fails here, which is the point of these cases.

  const DEFINITION: Stats = {
    ...ZERO_STATS,
    atk: 800,
    hp: 10000,
    def: 600,
  };

  it("prefers the resolved base channel over the definition stats", () => {
    // A geared character: final ATK 2400 (base 1100 + artifacts), base 1100
    // (char base 800 + weapon base 300). A stance ATK% must scale 1100.
    const geared = withBaseStats(
      { ...DEFINITION, atk: 2400 },
      { atk: 1100, hp: 10000, def: 600 },
    );
    expect(stanceBaseFor(geared, DEFINITION)).toEqual({
      atk: 1100,
      hp: 10000,
      def: 600,
    });
  });

  it("never uses the buffed final value as the base", () => {
    // The mutation under test: a buffed bag at final ATK 4000 whose true base
    // is 1100. Returning 4000 here would inflate every stance ATK% by ~3.6x.
    const buffed = withBaseStats(
      { ...DEFINITION, atk: 4000 },
      { atk: 1100, hp: 10000, def: 600 },
    );
    expect(stanceBaseFor(buffed, DEFINITION).atk).toBe(1100);
    expect(stanceBaseFor(buffed, DEFINITION).atk).not.toBe(4000);
  });

  it("falls back to the DEFINITION, not the buffed bag, when base is absent", () => {
    // Ungeared legacy path: the definition's own stats are the base. The
    // incoming bag has already had a +1200 flat ATK buff folded in; the
    // fallback must ignore that and yield 800.
    const buffedNoBase: Stats = { ...DEFINITION, atk: 2000 };
    expect(stanceBaseFor(buffedNoBase, DEFINITION).atk).toBe(800);
  });
});

describe("statsWithBase — engine attachment of the base channel", () => {
  it("attaches the self-base for an ungeared definition", () => {
    const ungeared: Stats = { ...ZERO_STATS, atk: 800, hp: 10000, def: 600 };
    expect(statsWithBase(ungeared).base).toEqual({
      atk: 800,
      hp: 10000,
      def: 600,
    });
  });

  it("respects an already-attached base rather than overwriting it", () => {
    // A geared definition (final 2400, base 1100) must keep its authored base.
    // Recomputing the self-base here would silently reset base to final and
    // reintroduce the on-final bug for every geared character.
    const geared = withBaseStats(
      { ...ZERO_STATS, atk: 2400, hp: 20000, def: 900 },
      { atk: 1100, hp: 10000, def: 600 },
    );
    expect(statsWithBase(geared).base).toEqual({
      atk: 1100,
      hp: 10000,
      def: 600,
    });
  });
});
