import { describe, expect, it } from "vitest";
import type { Stats } from "@/types";
import type { ActiveBuff, Buff, StatConversionModifier } from "@/simulation/buffs/types";
import {
  computeStatConversion,
  applyStatConversions,
} from "@/simulation/buffs/conversions";
import { foldBuffsIntoStats } from "@/simulation/buffs/resolver";

// ============================================================================
// Stat Conversions unit test suite.
//
// Verifies pure calculation and folding of dynamic stat conversions:
//  - computeStatConversion formula: min(maxCap, max(0, source - threshold) * ratio)
//  - Hu Tao HP -> ATK conversion with cap
//  - Noelle DEF -> ATK conversion
//  - Raiden ER -> Electro DMG% conversion with threshold (ER > 100%)
//  - Stacking and non-cascading guarantees
// ============================================================================

function createStats(overrides: Partial<Stats> = {}): Stats {
  return {
    atk: 1000,
    hp: 15000,
    def: 800,
    elementalMastery: 100,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1.0,
    dmgBonus: 0,
    elementalDmgBonus: {},
    ...overrides,
  };
}

describe("computeStatConversion", () => {
  it("calculates basic linear conversion with no threshold and no cap", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "def",
      targetStat: "atkFlat",
      ratio: 0.5,
    };
    expect(computeStatConversion(1000, conversion)).toBe(500);
  });

  it("applies threshold correctly: zero when source <= threshold", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "energyRecharge",
      targetStat: "elementalDmgBonus",
      element: "electro",
      threshold: 1.0, // Only ER above 100%
      ratio: 0.4,
    };
    expect(computeStatConversion(1.0, conversion)).toBe(0);
    expect(computeStatConversion(0.8, conversion)).toBe(0);
  });

  it("applies threshold correctly: converts only the amount above threshold", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "energyRecharge",
      targetStat: "elementalDmgBonus",
      element: "electro",
      threshold: 1.0,
      ratio: 0.4,
    };
    // ER = 2.5 -> (2.5 - 1.0) * 0.4 = 1.5 * 0.4 = 0.60 (60%)
    expect(computeStatConversion(2.5, conversion)).toBeCloseTo(0.6);
  });

  it("applies maxCap when raw converted value exceeds cap", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "hp",
      targetStat: "atkFlat",
      ratio: 0.1,
      maxCap: 1500,
    };
    // 30,000 * 0.1 = 3,000 > cap 1,500 -> 1,500
    expect(computeStatConversion(30000, conversion)).toBe(1500);
    // 10,000 * 0.1 = 1,000 < cap 1,500 -> 1,000
    expect(computeStatConversion(10000, conversion)).toBe(1000);
  });

  it("scales ratio by stack count when stacks > 1", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "elementalMastery",
      targetStat: "dmgBonus",
      ratio: 0.001,
    };
    // 200 EM * 0.001 * 3 stacks = 0.6
    expect(computeStatConversion(200, conversion, 3)).toBeCloseTo(0.6);
  });

  it("handles non-finite or negative source values gracefully", () => {
    const conversion: StatConversionModifier = {
      sourceStat: "atk",
      targetStat: "dmgBonus",
      ratio: 0.1,
    };
    expect(computeStatConversion(NaN, conversion)).toBe(0);
    expect(computeStatConversion(Number.POSITIVE_INFINITY, conversion)).toBe(0);
    expect(computeStatConversion(-500, conversion)).toBe(0);
  });
});

describe("applyStatConversions", () => {
  it("folds flat ATK conversion into stats.atk", () => {
    const base = createStats({ def: 1000, atk: 800 });
    const conversion: StatConversionModifier = {
      sourceStat: "def",
      targetStat: "atkFlat",
      ratio: 0.85,
    };
    const result = applyStatConversions(base, [{ conversion }]);
    // 800 + 1000 * 0.85 = 1650
    expect(result.atk).toBe(1650);
  });

  it("folds elementalDmgBonus conversion into stats.elementalDmgBonus", () => {
    const base = createStats({ energyRecharge: 2.0, elementalDmgBonus: { electro: 0.15 } });
    const conversion: StatConversionModifier = {
      sourceStat: "energyRecharge",
      targetStat: "elementalDmgBonus",
      element: "electro",
      threshold: 1.0,
      ratio: 0.4,
    };
    const result = applyStatConversions(base, [{ conversion }]);
    // (2.0 - 1.0) * 0.4 = 0.4 + existing 0.15 = 0.55
    expect(result.elementalDmgBonus["electro"]).toBeCloseTo(0.55);
  });

  it("folds expected proc conversion into additive base damage", () => {
    const base = createStats({ atk: 1200 });
    const conversion: StatConversionModifier = {
      sourceStat: "atk",
      targetStat: "flatDamageBonus",
      ratio: 0.252,
    };
    const result = applyStatConversions(base, [{ conversion }]);
    expect(result.flatDamageBonus).toBeCloseTo(302.4);
  });

  it("ignores elementalDmgBonus conversion when element is undefined", () => {
    const base = createStats({ elementalMastery: 500 });
    const conversion: StatConversionModifier = {
      sourceStat: "elementalMastery",
      targetStat: "elementalDmgBonus",
      ratio: 0.001,
      // element missing
    };
    const result = applyStatConversions(base, [{ conversion }]);
    expect(result.elementalDmgBonus).toEqual({});
  });

  it("folds percent conversions using baseValues when provided", () => {
    const base = createStats({ hp: 20000, atk: 1200 });
    const conversion: StatConversionModifier = {
      sourceStat: "hp",
      targetStat: "atkPercent",
      threshold: 10000,
      ratio: 0.00002, // (20000 - 10000) * 0.00002 = 0.20 (20% ATK)
    };
    const baseValues = { atk: 800 };
    const result = applyStatConversions(base, [{ conversion }], baseValues);
    // 1200 + 800 * 0.20 = 1360
    expect(result.atk).toBe(1360);
  });

  it("is pure and does not mutate input stats", () => {
    const base = createStats({ hp: 30000 });
    const originalAtk = base.atk;
    const conversion: StatConversionModifier = {
      sourceStat: "hp",
      targetStat: "atkFlat",
      ratio: 0.05,
    };
    const result = applyStatConversions(base, [{ conversion }]);
    expect(base.atk).toBe(originalAtk);
    expect(result.atk).toBe(originalAtk + 1500);
  });
});

describe("foldBuffsIntoStats with conversions (integration)", () => {
  it("models Hu Tao HP -> ATK conversion: reads post-buff HP and respects cap", () => {
    const baseStats = createStats({ hp: 15552, atk: 715 });
    const baseValues = { hp: 15552, atk: 715 };

    // Buff 1: Artifact HP% (+46.6% HP)
    const hpBuff: Buff = {
      id: "hp-sands",
      source: "Artifact Sands",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      modifiers: [{ stat: "hpPercent", value: 0.466 }],
    };

    // Buff 2: Skill conversion (6.26% of Max HP, capped at 400% of base ATK = 2860)
    const skillConversion: Buff = {
      id: "guide-to-afterlife",
      source: "Elemental Skill",
      startTime: 0,
      duration: 9,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conversions: [
        {
          sourceStat: "hp",
          targetStat: "atkFlat",
          ratio: 0.0626,
          maxCap: 4 * baseValues.atk, // 2860
        },
      ],
    };

    const active: ActiveBuff[] = [
      { buff: hpBuff, stacks: 1 },
      { buff: skillConversion, stacks: 1 },
    ];

    const result = foldBuffsIntoStats(baseStats, active, baseValues);

    // Total HP = 15552 * (1 + 0.466) = 22799.232
    expect(result.hp).toBeCloseTo(22799.232);

    // Converted ATK = 22799.232 * 0.0626 = 1427.23
    // Final ATK = 715 + 1427.23 = 2142.23
    expect(result.atk).toBeCloseTo(715 + 22799.232 * 0.0626);

    // If HP was extraordinarily high, verify cap is enforced:
    const megaHpBuff: Buff = {
      id: "mega-hp",
      source: "Mega HP",
      startTime: 0,
      duration: 10,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      modifiers: [{ stat: "hpFlat", value: 100000 }],
    };
    const cappedResult = foldBuffsIntoStats(
      baseStats,
      [{ buff: megaHpBuff, stacks: 1 }, { buff: skillConversion, stacks: 1 }],
      baseValues,
    );
    // Cap is 400% of 715 = 2860
    expect(cappedResult.atk).toBeCloseTo(715 + 2860);
  });

  it("models Noelle DEF -> ATK conversion: reads post-buff DEF", () => {
    const baseStats = createStats({ def: 1200, atk: 600 });
    const baseValues = { def: 1000, atk: 600 };

    // Burst: 85% of DEF converted to flat ATK
    const sweepingTime: Buff = {
      id: "sweeping-time",
      source: "Elemental Burst",
      startTime: 0,
      duration: 15,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conversions: [
        {
          sourceStat: "def",
          targetStat: "atkFlat",
          ratio: 0.85,
        },
      ],
    };

    const result = foldBuffsIntoStats(baseStats, [{ buff: sweepingTime, stacks: 1 }], baseValues);
    // 600 + 1200 * 0.85 = 1620
    expect(result.atk).toBe(1620);
  });

  it("models Raiden ER -> Electro DMG% conversion above 100% ER", () => {
    const baseStats = createStats({ energyRecharge: 2.2, elementalDmgBonus: {} });

    // Passive: (ER - 100%) * 0.4 -> Electro DMG%
    const passive: Buff = {
      id: "enlightened-one",
      source: "A4 Passive",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conversions: [
        {
          sourceStat: "energyRecharge",
          targetStat: "elementalDmgBonus",
          element: "electro",
          threshold: 1.0,
          ratio: 0.4,
        },
      ],
    };

    const result = foldBuffsIntoStats(baseStats, [{ buff: passive, stacks: 1 }]);
    // (2.2 - 1.0) * 0.4 = 1.2 * 0.4 = 0.48 (48% Electro DMG)
    expect(result.elementalDmgBonus["electro"]).toBeCloseTo(0.48);
  });

  it("ensures converted stats do NOT cascade into other conversions in the same pass", () => {
    // Defense against infinite loops / cascading conversions
    const baseStats = createStats({ hp: 20000, atk: 1000 });

    const conversion1: Buff = {
      id: "c1",
      source: "HP to ATK",
      startTime: 0,
      duration: 10,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conversions: [{ sourceStat: "hp", targetStat: "atkFlat", ratio: 0.1 }], // +2000 ATK
    };

    const conversion2: Buff = {
      id: "c2",
      source: "ATK to Crit DMG",
      startTime: 0,
      duration: 10,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conversions: [{ sourceStat: "atk", targetStat: "critDmg", ratio: 0.0001 }], // should scale off 1000 ATK, NOT 3000
    };

    const result = foldBuffsIntoStats(baseStats, [
      { buff: conversion1, stacks: 1 },
      { buff: conversion2, stacks: 1 },
    ]);

    expect(result.atk).toBe(3000);
    // Crit DMG should be 0.5 + 1000 * 0.0001 = 0.60, NOT 0.5 + 3000 * 0.0001 = 0.80
    expect(result.critDmg).toBeCloseTo(0.6);
  });
});
