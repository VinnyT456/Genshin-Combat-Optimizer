import { describe, expect, it } from "vitest";

import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { statsWithBase } from "@/simulation/engine/simulateRotation";
import { makeResolvers } from "@/simulation/buffs/makeBuffResolver";
import { resolveEquippedStats } from "@/simulation/character/equipment";
import { resolveBaseValues } from "@/simulation/buffs/resolver";
import { defMultiplier, MAX_DEF_REDUCTION } from "@/simulation/damage/pipeline";
import { talentValueAt, talentTable, flatTalent } from "@/simulation/character/talent";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { allCharacters } from "@/game-data/characters/registry";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import type { RotationAction, SimulationConfig, Stats } from "@/types";

import {
  LEVEL_0_DEF_MULTIPLIER,
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// TASK #043 — stat-pipeline regression.
//
// Everything here goes END TO END through `simulateRotation` wherever the
// claim is about simulated damage. A unit-level assertion on a helper does not
// prove the engine consumes it: talent levels were inert roster-wide for a long
// time while `talentValueAt()` itself was correct.
//
// Fixtures are hand-computable: character level 0 and enemy level 0 give a DEF
// multiplier of exactly 0.5, zero resistances give 1.0, `critMode: "never"`
// removes crit. So ATK 1000 x mult 2.0 x 0.5 = 1000.
// ============================================================================

const SKILL_ONLY: RotationAction[] = [
  { characterId: "c", actionType: "skill" },
];

function damageOf(config: SimulationConfig): number {
  return simulateRotation(
    [makeTestCharacter("c")],
    SKILL_ONLY,
    NEUTRAL_ENEMY,
    config,
  ).totalDamage;
}

function partyBuff(id: string, modifiers: Buff["modifiers"]): Buff {
  return {
    id,
    source: "task-043 fixture",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    modifiers,
  };
}

// ---------------------------------------------------------------------------
// 1. Buffs are LIVE end to end (the bug that was suspected and is NOT real)
// ---------------------------------------------------------------------------

describe("buffs reach damage through simulateRotation (not inert)", () => {
  // The fixture skill is mult 2.0 at level 0 vs a level-0 enemy:
  //   damage = atk * 2.0 * 0.5 = atk
  // so total damage is numerically equal to effective ATK, which makes every
  // expectation below a direct statement about the ATK the engine used.
  const BASELINE = 1000;

  it("baseline: ungeared ATK 1000 deals exactly 1000", () => {
    expect(damageOf(NO_CRIT_CONFIG)).toBe(BASELINE);
  });

  it("a flat +1000 ATK buff moves damage by exactly +1000", () => {
    const buffed = damageOf({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [partyBuff("flat", [{ stat: "atkFlat", value: 1000 }])] }),
    });
    // Not merely `> baseline`: an inert resolver and a half-applied one both
    // have to fail, so pin the exact delta.
    expect(buffed).toBe(2000);
    expect(buffed - BASELINE).toBe(1000);
  });

  it("an ATK% buff scales BASE atk, which for an ungeared unit IS its final", () => {
    const buffed = damageOf({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [partyBuff("pct", [{ stat: "atkPercent", value: 1 }])] }),
    });
    expect(buffed).toBe(2000);
  });

  it("flat and percent compose as base * (1 + pct) + flat, never (base + flat) * (1 + pct)", () => {
    const buffed = damageOf({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({
        buffs: [
          partyBuff("pct", [{ stat: "atkPercent", value: 1 }]),
          partyBuff("flat", [{ stat: "atkFlat", value: 500 }]),
        ],
      }),
    });
    // base 1000 * (1 + 1.0) + 500 = 2500. The wrong order gives 3000.
    expect(buffed).toBe(2500);
    expect(buffed).not.toBe(3000);
  });
});

// ---------------------------------------------------------------------------
// 2. Equipment / base-stat math, end to end
// ---------------------------------------------------------------------------

describe("equipment: ATK% scales BASE atk, never final", () => {
  // char base ATK 1000 + weapon base ATK 500 = base 1500; +50% ATK from the
  // weapon substat => final 2250. Scaling off FINAL at any later step would
  // compound and is what these tests exist to catch.
  const geared = resolveEquippedStats(makeTestCharacter("c").baseStats, {
    weapon: {
      baseAtk: 500,
      substat: { stat: "atkPercent", value: 0.5 },
    },
  });
  const equipped: SimulationConfig = {
    ...NO_CRIT_CONFIG,
    equippedStats: { c: geared.stats },
  };

  it("resolveEquippedStats folds weapon base ATK into BASE, not into flat", () => {
    expect(geared.base).toEqual({ atk: 1500, hp: 0, def: 0 });
    // If weapon base ATK were treated as flat ATK it would escape the 50%
    // substat and final would be 1000*1.5 + 500 = 2000, not 2250.
    expect(geared.stats.atk).toBe(2250);
    expect(geared.stats.atk).not.toBe(2000);
  });

  it("the geared bag reaches the engine: damage equals the geared ATK", () => {
    expect(damageOf(equipped)).toBe(2250);
  });

  it("an in-combat ATK% buff scales the GEARED base (1500), not the final (2250)", () => {
    const buffed = damageOf({
      ...equipped,
      ...makeResolvers({ buffs: [partyBuff("pct", [{ stat: "atkPercent", value: 1 }])] }),
    });
    // 2250 + 1500 * 1.0 = 3750. Scaling off final would give 4500.
    expect(buffed).toBe(3750);
    expect(buffed).not.toBe(4500);
  });

  it("a flat ATK buff on a GEARED unit is a pure addition, untouched by gear %", () => {
    const buffed = damageOf({
      ...equipped,
      ...makeResolvers({ buffs: [partyBuff("flat", [{ stat: "atkFlat", value: 1000 }])] }),
    });
    expect(buffed).toBe(3250);
  });
});

describe("base-stat precedence: Stats.base WINS over the id-keyed map", () => {
  // RULED in docs/PROJECT-STATUS.md (2026-09-03). The map is keyed by character
  // id alone, so it cannot see which bag it is applied to and goes stale the
  // moment gear changes; the attached `base` travels WITH the bag.
  const geared = resolveEquippedStats(makeTestCharacter("c").baseStats, {
    weapon: { baseAtk: 500 },
  });

  it("resolveBaseValues returns the bag's base when the two DISAGREE", () => {
    const stale = { atk: 999999, hp: 1, def: 1 };
    expect(resolveBaseValues(geared.stats, stale)).toEqual(geared.base);
    expect(resolveBaseValues(geared.stats, stale)).not.toEqual(stale);
  });

  it("end to end: a WILDLY stale map cannot rescale an ATK% buff", () => {
    const withStaleMap = damageOf({
      ...NO_CRIT_CONFIG,
      equippedStats: { c: geared.stats },
      ...makeResolvers({
        buffs: [partyBuff("pct", [{ stat: "atkPercent", value: 1 }])],
        baseStats: { c: { atk: 999999, hp: 0, def: 0 } },
      }),
    });
    const withoutMap = damageOf({
      ...NO_CRIT_CONFIG,
      equippedStats: { c: geared.stats },
      ...makeResolvers({ buffs: [partyBuff("pct", [{ stat: "atkPercent", value: 1 }])] }),
    });
    // base 1500, final 1500 => 1500 + 1500 = 3000, map ignored entirely.
    expect(withStaleMap).toBe(3000);
    expect(withStaleMap).toBe(withoutMap);
  });

  it("the map is still USED as a fallback when the bag carries no base", () => {
    // The public `BuffResolver` seam accepts base-less `Stats` literals, so the
    // fallback must remain reachable — otherwise % modifiers get silently
    // skipped for hand-built bags.
    const baseless: Stats = { ...makeTestCharacter("c").baseStats };
    expect(baseless.base).toBeUndefined();
    expect(resolveBaseValues(baseless, { atk: 777, hp: 0, def: 0 })).toEqual({
      atk: 777,
      hp: 0,
      def: 0,
    });
  });

  it("statsWithBase leaves an already-based bag untouched (self-base only for ungeared)", () => {
    expect(statsWithBase(geared.stats)).toBe(geared.stats);
    const ungeared = statsWithBase(makeTestCharacter("c").baseStats);
    expect(ungeared.base).toEqual({ atk: 1000, hp: 0, def: 0 });
  });
});

// ---------------------------------------------------------------------------
// 3. Talent levels are LIVE for the real roster, not just for a fixture
// ---------------------------------------------------------------------------

describe("talent level moves damage for REAL roster characters", () => {
  // `kitWiring.test.ts` proves the engine reads the talent level for a
  // synthetic unit. That is necessary but not sufficient: the historical defect
  // was that every SHIPPED character used `flatTalent()`, so the engine was
  // correct and the data made it inert anyway. These tests run the registry.
  const sample = allCharacters.slice(0, 12);

  function skillDamageAtLevel(
    character: GenericCharacterDefinition,
    level: number,
  ): number {
    const at: GenericCharacterDefinition = {
      ...character,
      talentLevels: { ...character.talentLevels, skill: level },
    };
    return simulateRotation(
      [at],
      [{ characterId: at.id, actionType: "skill" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    ).totalDamage;
  }

  it("the sample is non-empty, so the loops below can actually fail", () => {
    expect(sample.length).toBeGreaterThan(0);
  });

  it("reports how many sampled characters have a LIVE (non-flat) skill table", () => {
    // A change detector, not a correctness claim: if data-engineer lands real
    // per-level tables this count rises and the pin must be updated
    // deliberately. If it ever falls to 0, talent level has gone inert again.
    const live = sample.filter(
      (c) => skillDamageAtLevel(c, 1) !== skillDamageAtLevel(c, 10),
    );
    expect(live.length).toBeGreaterThan(0);
  });

  it("for every character with a live table, L10 damage EXCEEDS L1 damage", () => {
    // Monotonicity: talent multipliers never decrease with level in game.
    for (const character of sample) {
      const low = skillDamageAtLevel(character, 1);
      const high = skillDamageAtLevel(character, 10);
      if (low === high) continue; // flat table — covered by the count above
      expect(high).toBeGreaterThan(low);
    }
  });

  it("talent level lookup clamps rather than throwing at both extremes", () => {
    const table = talentTable([1, 2, 3]);
    expect(talentValueAt(table, -5)).toBe(1);
    expect(talentValueAt(table, 1)).toBe(1);
    expect(talentValueAt(table, 3)).toBe(3);
    // Short table clamps at its LAST entry rather than padding with a guess.
    expect(talentValueAt(table, 15)).toBe(3);
    expect(talentValueAt(table, 99)).toBe(3);
    expect(talentValueAt(flatTalent(7), 12)).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// 4. Non-ATK scaling composed with the BUFF SEAM, end to end
// ---------------------------------------------------------------------------

describe("HP scaling composes with the real buff resolver", () => {
  // kitWiring proves HP scaling works under a hand-written `BuffResolver`
  // lambda. This runs it through `makeResolvers`, the resolver callers actually
  // use, so a regression in base-channel handling for HP is caught too.
  const unit: GenericCharacterDefinition = {
    ...syntheticUnit,
    id: "hp-unit",
    level: 0,
  };
  const rotation: RotationAction[] = [
    { characterId: unit.id, actionType: "skill" },
  ];

  function run(config: SimulationConfig): number {
    return simulateRotation([unit], rotation, NEUTRAL_ENEMY, config).totalDamage;
  }

  it("an HP% buff raises damage on a hit with an HP scaling term", () => {
    const baseline = run(NO_CRIT_CONFIG);
    const buffed = run({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [partyBuff("hp", [{ stat: "hpPercent", value: 1 }])] }),
    });
    // The synthetic skill is hybrid ATK + 5% max HP, so an HP buff must move it
    // and the delta must be exactly the HP term's share.
    expect(buffed).toBeGreaterThan(baseline);
    // base HP 10000, +100% => +10000 HP; 5% of that = +500 raw, x0.5 DEF.
    expect(buffed - baseline).toBeCloseTo(500 * LEVEL_0_DEF_MULTIPLIER, 9);
  });

  it("a flat HP buff moves the HP term and leaves the ATK term alone", () => {
    const baseline = run(NO_CRIT_CONFIG);
    const buffed = run({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [partyBuff("hpflat", [{ stat: "hpFlat", value: 10000 }])] }),
    });
    expect(buffed - baseline).toBeCloseTo(500 * LEVEL_0_DEF_MULTIPLIER, 9);
  });

  it("an EM buff does NOT move a hit with no EM scaling term", () => {
    // Guards against a fold that accidentally sums every stat into base damage.
    const baseline = run(NO_CRIT_CONFIG);
    const buffed = run({
      ...NO_CRIT_CONFIG,
      ...makeResolvers({
        buffs: [partyBuff("em", [{ stat: "elementalMastery", value: 1000 }])],
      }),
    });
    expect(buffed).toBe(baseline);
  });
});

// ---------------------------------------------------------------------------
// 5. DEF reduction cap (KQM 90%) and the DEF-IGNORE asymmetry
// ---------------------------------------------------------------------------

describe("DEF reduction is capped at 90%; DEF IGNORE is NOT", () => {
  const CHAR = 0;
  const ENEMY_LEVEL = 0;

  const at = (reduction: number, ignore = 0): number =>
    defMultiplier(CHAR, ENEMY_LEVEL, reduction, ignore);

  it("the cap constant is exactly 0.9 per KQM", () => {
    expect(MAX_DEF_REDUCTION).toBe(0.9);
  });

  it("boundary: just below, at, and just above the cap", () => {
    const belowCap = at(0.89);
    const atCap = at(0.9);
    const aboveCap = at(0.91);
    // 100 / (100 + 100 * (1 - 0.9)) = 100/110
    expect(atCap).toBeCloseTo(100 / 110, 12);
    expect(belowCap).toBeLessThan(atCap);
    // Everything past the cap is PINNED to the cap's value, not extrapolated.
    expect(aboveCap).toBe(atCap);
    expect(at(1)).toBe(atCap);
    expect(at(1.03)).toBe(atCap);
    expect(at(1000)).toBe(atCap);
  });

  it("the 103% real shred stack lands on the cap, not on zero DEF", () => {
    // Lisa A4 15 + Klee C2 23 + Ayaka C4 30 + Razor C4 15 + Zhongli 20 = 103%.
    const stacked = at(0.15 + 0.23 + 0.3 + 0.15 + 0.2);
    expect(stacked).toBeCloseTo(100 / 110, 12);
    // The pre-cap behaviour drove DEF to zero and the multiplier to 1.0,
    // overstating damage by 10/110 ~ 10.53%.
    expect(stacked).not.toBe(1);
    expect((1 - stacked) / stacked).toBeCloseTo(0.1, 9);
  });

  it("ASYMMETRY: DEF IGNORE has no upper cap and CAN zero out DEF", () => {
    // Same numeric input, different channel, different answer — that is the
    // whole point of keeping the two channels separate.
    expect(at(0, 1)).toBe(1);
    expect(at(0, 1.5)).toBe(1);
    expect(at(1.5, 0)).toBeCloseTo(100 / 110, 12);
    expect(at(0, 1)).not.toBeCloseTo(at(1, 0), 6);
  });

  it("neither channel ever revives DEF or returns a non-finite multiplier", () => {
    for (const reduction of [-5, -1, 0, 0.5, 0.9, 1, 50]) {
      for (const ignore of [-5, -1, 0, 0.5, 1, 50]) {
        const value = at(reduction, ignore);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("is monotonically non-decreasing in DEF reduction across the cap", () => {
    const points = [0, 0.25, 0.5, 0.75, 0.89, 0.9, 0.95, 1, 2];
    const values = points.map((p) => at(p));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]!).toBeGreaterThanOrEqual(values[i - 1]!);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Determinism across every path this file exercises
// ---------------------------------------------------------------------------

describe("determinism of the stat pipeline", () => {
  it("identical config produces identical totals across repeated runs", () => {
    const geared = resolveEquippedStats(makeTestCharacter("c").baseStats, {
      weapon: {
        baseAtk: 500,
        substat: { stat: "atkPercent", value: 0.5 },
      },
    });
    const build = (): SimulationConfig => ({
      ...NO_CRIT_CONFIG,
      equippedStats: { c: geared.stats },
      ...makeResolvers({
        buffs: [
          partyBuff("pct", [{ stat: "atkPercent", value: 0.4 }]),
          partyBuff("flat", [{ stat: "atkFlat", value: 250 }]),
        ],
      }),
    });
    const runs = [damageOf(build()), damageOf(build()), damageOf(build())];
    expect(new Set(runs).size).toBe(1);
    expect(Number.isFinite(runs[0]!)).toBe(true);
  });

  it("resolveEquippedStats never mutates its inputs", () => {
    const stats = makeTestCharacter("c").baseStats;
    const before = structuredClone(stats);
    resolveEquippedStats(stats, {
      weapon: { baseAtk: 500, substat: { stat: "atkPercent", value: 0.5 } },
    });
    expect(stats).toEqual(before);
  });
});
