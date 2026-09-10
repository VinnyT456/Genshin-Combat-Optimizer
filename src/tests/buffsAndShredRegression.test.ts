import { describe, expect, it } from "vitest";
import {
  foldBuffsIntoStats,
  getActiveBuffs,
  makeResolvers,
  sumActiveEnemyModifiers,
} from "@/simulation/buffs";
import type { ActiveBuff, Buff } from "@/simulation/buffs";
import { computeDamage, defMultiplier, resMultiplier } from "@/simulation/damage/pipeline";
import { simulateRotation } from "@/simulation/engine";
import type { BuffContext, EnemyState, Rotation, Stats } from "@/types";
import {
  LEVEL_0_DEF_MULTIPLIER,
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NEUTRAL_STATS,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// TASK #017 — buff application order, resolver purity/serializability, and
// enemy shred channel composition.
//
// Adversarial focus:
//  - buffs: prove `base * (1 + Sum pct) + Sum flat` is the ACTUAL order, by
//    choosing numbers where the wrong order gives a DIFFERENT answer.
//  - resolvers: prove they stay pure and structuredClone-able, since Web Worker
//    transport (Phase 5) depends on the buff DATA being serializable.
//  - shred: prove defReduction and defIgnore COMPOSE rather than collapse into
//    one channel, and cover all three RES branches including negative RES.
// ============================================================================

function activeBuff(buff: Partial<Buff>, stacks = 1): ActiveBuff {
  return {
    buff: {
      id: "b",
      source: "test",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      ...buff,
    },
    stacks,
  };
}

// ---------------------------------------------------------------------------
// 1. BUFF APPLICATION ORDER
// ---------------------------------------------------------------------------

describe("buff application order: base * (1 + Sum pct) + Sum flat", () => {
  // Numbers chosen so the two candidate orders DISAGREE:
  //   correct    : 1000 + 800*0.5 + 100 = 1500
  //   wrong (pct on final)      : 1000*1.5 + 100 = 1600
  //   wrong (flat before pct)   : (1000+100)*1.5 = 1650
  const FINAL_ATK = 1000;
  const BASE_ATK = 800;
  const PCT = 0.5;
  const FLAT = 100;

  const stats: Stats = { ...NEUTRAL_STATS, atk: FINAL_ATK };

  it("scales BASE atk by the percentage, then adds flat", () => {
    const result = foldBuffsIntoStats(
      stats,
      [
        activeBuff({ modifiers: [{ stat: "atkPercent", value: PCT }] }),
        activeBuff({ id: "b2", modifiers: [{ stat: "atkFlat", value: FLAT }] }),
      ],
      { atk: BASE_ATK },
    );
    expect(result.atk).toBeCloseTo(FINAL_ATK + BASE_ATK * PCT + FLAT, 10);
    expect(result.atk).toBeCloseTo(1500, 10);
    // Both wrong orders explicitly excluded.
    expect(result.atk).not.toBeCloseTo(1600, 6); // pct applied to final atk
    expect(result.atk).not.toBeCloseTo(1650, 6); // flat added before pct
  });

  it("sums percentages from several buffs BEFORE scaling base (never compounding)", () => {
    // 30% + 20% additive = 800*0.5 = 400. Compounding would be
    // 800*1.3*1.2 - 800 = 448.
    const result = foldBuffsIntoStats(
      stats,
      [
        activeBuff({ modifiers: [{ stat: "atkPercent", value: 0.3 }] }),
        activeBuff({ id: "b2", modifiers: [{ stat: "atkPercent", value: 0.2 }] }),
      ],
      { atk: BASE_ATK },
    );
    expect(result.atk).toBeCloseTo(FINAL_ATK + BASE_ATK * 0.5, 10);
    expect(result.atk).not.toBeCloseTo(FINAL_ATK + BASE_ATK * (1.3 * 1.2 - 1), 6);
  });

  it("multiplies each modifier by its stack count, per channel", () => {
    const result = foldBuffsIntoStats(
      stats,
      [
        activeBuff(
          {
            modifiers: [
              { stat: "atkPercent", value: 0.1 },
              { stat: "atkFlat", value: 50 },
            ],
          },
          3,
        ),
      ],
      { atk: BASE_ATK },
    );
    // 1000 + 800*(0.1*3) + 50*3 = 1000 + 240 + 150 = 1390
    expect(result.atk).toBeCloseTo(1390, 10);
  });

  it("is order-independent — the fold commutes", () => {
    const a = activeBuff({ id: "a", modifiers: [{ stat: "atkPercent", value: 0.2 }] });
    const b = activeBuff({ id: "b", modifiers: [{ stat: "atkFlat", value: 77 }] });
    const c = activeBuff({ id: "c", modifiers: [{ stat: "critRate", value: 0.15 }] });
    const forward = foldBuffsIntoStats(stats, [a, b, c], { atk: BASE_ATK });
    const reverse = foldBuffsIntoStats(stats, [c, b, a], { atk: BASE_ATK });
    expect(forward).toEqual(reverse);
  });

  it("applies flat modifiers even when the % channel is skipped for lack of a base", () => {
    // Under-applying % is the documented choice; silently dropping FLAT too
    // would be a second, undocumented loss.
    const result = foldBuffsIntoStats(stats, [
      activeBuff({
        modifiers: [
          { stat: "atkPercent", value: 0.5 },
          { stat: "atkFlat", value: FLAT },
        ],
      }),
    ]);
    expect(result.atk).toBe(FINAL_ATK + FLAT);
  });

  it("treats additive stats as plain sums, never as percentages of base", () => {
    const result = foldBuffsIntoStats(stats, [
      activeBuff({
        modifiers: [
          { stat: "critRate", value: 0.2 },
          { stat: "critDmg", value: 0.6 },
          { stat: "energyRecharge", value: 0.4 },
          { stat: "elementalMastery", value: 200 },
          { stat: "dmgBonus", value: 0.15 },
        ],
      }),
    ]);
    expect(result.critRate).toBeCloseTo(0.2, 10);
    expect(result.critDmg).toBeCloseTo(0.6, 10);
    expect(result.energyRecharge).toBeCloseTo(NEUTRAL_STATS.energyRecharge + 0.4, 10);
    expect(result.elementalMastery).toBe(200);
    expect(result.dmgBonus).toBeCloseTo(0.15, 10);
  });

  it("keeps HP and DEF channels independent of the ATK channel", () => {
    const result = foldBuffsIntoStats(
      { ...NEUTRAL_STATS, atk: 1000, hp: 2000, def: 300 },
      [
        activeBuff({
          modifiers: [
            { stat: "atkPercent", value: 1 },
            { stat: "hpPercent", value: 0.5 },
            { stat: "defFlat", value: 60 },
          ],
        }),
      ],
      { atk: 500, hp: 1000, def: 200 },
    );
    expect(result.atk).toBeCloseTo(1000 + 500 * 1, 10);
    expect(result.hp).toBeCloseTo(2000 + 1000 * 0.5, 10);
    expect(result.def).toBeCloseTo(300 + 60, 10);
  });
});

// ---------------------------------------------------------------------------
// 2. RESOLVER PURITY + SERIALIZABILITY (Web Worker transport)
// ---------------------------------------------------------------------------

describe("resolvers are pure and their buff data is serializable", () => {
  const character = makeTestCharacter("a", { element: "pyro" });

  const buffs: readonly Buff[] = [
    {
      id: "atk-up",
      source: "test-4pc",
      startTime: 0,
      duration: 10,
      stacking: { mode: "stack", maxStacks: 3 },
      targets: { scope: "party" },
      conditions: { damageTypes: ["skill"], elements: ["pyro"] },
      modifiers: [{ stat: "atkPercent", value: 0.2 }],
      enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    },
  ];

  function contextFor(time: number): BuffContext {
    return {
      time,
      character,
      ability: character.elementalSkill,
      activeCharacterId: character.id,
      snapshot: {
        time,
        activeCharacterId: character.id,
        characters: {
          a: {
            characterId: "a",
            energy: { current: 20, max: 40, totalGained: 20, totalSpent: 0 },
            cooldowns: {},
          },
        },
      },
      enemy: NEUTRAL_ENEMY,
    };
  }

  it("buff data survives structuredClone unchanged (declarative, not predicates)", () => {
    // A predicate-based condition would throw here — this is the test that
    // keeps conditions declarative and Web-Worker-transportable.
    expect(() => structuredClone(buffs)).not.toThrow();
    expect(structuredClone(buffs)).toEqual(buffs);
  });

  it("a buff carrying a function-valued condition is NOT serializable (guard rail)", () => {
    // Demonstrates the failure mode the declarative design prevents, proving
    // the check above is discriminating rather than vacuously true.
    const withPredicate = { ...buffs[0]!, conditions: { predicate: () => true } };
    expect(() => structuredClone(withPredicate)).toThrow();
  });

  it("makeResolvers produces resolvers that do not mutate base or context", () => {
    const { buffResolver, enemyModifierResolver } = makeResolvers({
      buffs,
      baseStats: { a: { atk: 800 } },
    });
    const base: Stats = { ...NEUTRAL_STATS };
    const baseCopy = structuredClone(base);
    const context = contextFor(1);
    const contextSnapshotCopy = structuredClone(context.snapshot);

    const out = buffResolver(base, context);
    enemyModifierResolver(context);

    expect(base).toEqual(baseCopy);
    expect(context.snapshot).toEqual(contextSnapshotCopy);
    expect(out).not.toBe(base);
  });

  it("both resolvers are deterministic across repeated calls", () => {
    const { buffResolver, enemyModifierResolver } = makeResolvers({
      buffs,
      baseStats: { a: { atk: 800 } },
    });
    const context = contextFor(1);
    expect(buffResolver({ ...NEUTRAL_STATS }, context)).toEqual(
      buffResolver({ ...NEUTRAL_STATS }, context),
    );
    expect(enemyModifierResolver(context)).toEqual(enemyModifierResolver(context));
  });

  it("makeResolvers gates BOTH seams by the same window and conditions", () => {
    // Composition claim: one buff list, consistently gated. At t=20 the buff
    // has expired, so neither the stat side nor the enemy side may apply.
    const { buffResolver, enemyModifierResolver } = makeResolvers({
      buffs,
      baseStats: { a: { atk: 800 } },
    });
    const inWindow = contextFor(1);
    const expired = contextFor(20);

    expect(buffResolver({ ...NEUTRAL_STATS }, inWindow).atk).toBeGreaterThan(
      NEUTRAL_STATS.atk,
    );
    expect(enemyModifierResolver(inWindow).resReduction.pyro).toBeCloseTo(0.4, 10);

    expect(buffResolver({ ...NEUTRAL_STATS }, expired).atk).toBe(NEUTRAL_STATS.atk);
    expect(enemyModifierResolver(expired).resReduction.pyro ?? 0).toBe(0);
  });

  it("is insulated from later mutation of the caller's array (determinism)", () => {
    const mutable: Buff[] = [];
    const { buffResolver } = makeResolvers({ buffs: mutable, baseStats: { a: { atk: 800 } } });
    const before = buffResolver({ ...NEUTRAL_STATS }, contextFor(1));
    mutable.push({
      id: "sneaky",
      source: "late",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      modifiers: [{ stat: "atkFlat", value: 9999 }],
    });
    expect(buffResolver({ ...NEUTRAL_STATS }, contextFor(1))).toEqual(before);
  });

  it("getActiveBuffs never returns an expired or unstarted buff", () => {
    const query = { character, ability: character.elementalSkill, activeCharacterId: "a" };
    const state = { buffs };
    expect(getActiveBuffs(-1, state, query)).toEqual([]);
    expect(getActiveBuffs(10.5, state, query)).toEqual([]);
    expect(getActiveBuffs(0, state, query)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 3. ENEMY SHRED — distinct multiplicative channels
// ---------------------------------------------------------------------------

describe("defReduction and defIgnore are DISTINCT multiplicative channels", () => {
  const CHAR_LEVEL = 0;
  const ENEMY_LEVEL = 0;

  /** The documented model, written out independently of the implementation. */
  function expectedDefMult(reduction: number, ignore: number): number {
    const attacker = CHAR_LEVEL + 100;
    const defender = (ENEMY_LEVEL + 100) * (1 - reduction) * (1 - ignore);
    return attacker / (attacker + defender);
  }

  it("composes multiplicatively, and NOT by summing the two channels", () => {
    // 0.2 and 0.3: multiplicative leaves 0.8*0.7 = 0.56 of DEF; summing would
    // leave 0.5. These give different multipliers, so the test discriminates.
    const actual = defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0.2, 0.3);
    expect(actual).toBeCloseTo(expectedDefMult(0.2, 0.3), 12);
    expect(actual).toBeCloseTo(100 / (100 + 100 * 0.56), 12);
    // The collapsed (summed) model, explicitly excluded.
    const summed = 100 / (100 + 100 * (1 - 0.5));
    expect(actual).not.toBeCloseTo(summed, 6);
  });

  it("the two channels are NOT interchangeable in combination (order-free but distinct)", () => {
    // Swapping which channel holds which value is symmetric (both multiply),
    // but putting BOTH into one channel is not the same thing.
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0.2, 0.3)).toBeCloseTo(
      defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0.3, 0.2), 12,
    );
    // All-in-one-channel (0.5 reduction, 0 ignore) differs from split 0.2/0.3.
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0.5, 0)).not.toBeCloseTo(
      defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0.2, 0.3), 6,
    );
  });

  it("each channel alone behaves identically to the other alone", () => {
    for (const value of [0, 0.15, 0.5, 0.9]) {
      expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, value, 0)).toBeCloseTo(
        defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0, value), 12,
      );
    }
  });

  it("clamps each channel at zero DEF independently, never reviving DEF", () => {
    // >100% in one channel must not make the other channel's factor negative
    // and multiply back up into a positive DEF.
    // KQM caps DEF REDUCTION at 90% (MAX_DEF_REDUCTION), so 150% reduction
    // cannot zero out DEF. Pre-cap this asserted 1 and overstated damage by
    // ~10.5% on real shred stacks. DEF IGNORE is uncapped, hence the next line.
    const full = defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 1.5, 0.5);
    expect(full).toBeCloseTo(100 / 105, 12);
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 2, 2)).toBe(1);
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 2, 2)).toBeLessThanOrEqual(1);
  });

  it("no shred reproduces the level-0 baseline exactly", () => {
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL)).toBe(LEVEL_0_DEF_MULTIPLIER);
    expect(defMultiplier(CHAR_LEVEL, ENEMY_LEVEL, 0, 0)).toBe(LEVEL_0_DEF_MULTIPLIER);
  });

  it("sumActiveEnemyModifiers keeps the two DEF channels separate", () => {
    // If the aggregator collapsed them, the totals object would lose the
    // distinction before the pipeline ever sees it.
    const totals = sumActiveEnemyModifiers([
      activeBuff({ enemyModifiers: [{ key: "defReduction", value: 0.2 }] }),
      activeBuff({ id: "b2", enemyModifiers: [{ key: "defIgnore", value: 0.3 }] }),
    ]);
    expect(totals.defReduction).toBeCloseTo(0.2, 12);
    expect(totals.defIgnore).toBeCloseTo(0.3, 12);
  });

  it("sums WITHIN a channel while keeping channels apart", () => {
    const totals = sumActiveEnemyModifiers([
      activeBuff({
        enemyModifiers: [
          { key: "defReduction", value: 0.2 },
          { key: "defReduction", value: 0.1 },
          { key: "defIgnore", value: 0.25 },
        ],
      }),
    ]);
    expect(totals.defReduction).toBeCloseTo(0.3, 12);
    expect(totals.defIgnore).toBeCloseTo(0.25, 12);
  });
});

describe("RES uses a piecewise multiplier — all three branches", () => {
  it("branch 1: negative RES halves the surplus (1 - res/2)", () => {
    expect(resMultiplier(-0.5)).toBeCloseTo(1.25, 12);
    expect(resMultiplier(-1)).toBeCloseTo(1.5, 12);
    // NOT the naive `1 - res`, which would give 1.5 at -0.5.
    expect(resMultiplier(-0.5)).not.toBeCloseTo(1.5, 6);
  });

  it("branch 2: 0 <= RES < 0.75 is linear (1 - res)", () => {
    expect(resMultiplier(0)).toBe(1);
    expect(resMultiplier(0.1)).toBeCloseTo(0.9, 12);
    expect(resMultiplier(0.5)).toBeCloseTo(0.5, 12);
    expect(resMultiplier(0.7499)).toBeCloseTo(0.2501, 12);
  });

  it("branch 3: RES >= 0.75 uses the divisor form 1/(4*res + 1)", () => {
    expect(resMultiplier(0.75)).toBeCloseTo(0.25, 12);
    expect(resMultiplier(0.9)).toBeCloseTo(1 / 4.6, 12);
    // The linear form would give 0.25 at 0.75 too — but 0.1 at 0.9, which the
    // divisor form does not. That is where the branches separate.
    expect(resMultiplier(0.9)).not.toBeCloseTo(0.1, 6);
  });

  it("is continuous at BOTH branch boundaries (0 and 0.75)", () => {
    const epsilon = 1e-9;
    expect(resMultiplier(-epsilon)).toBeCloseTo(resMultiplier(0), 8);
    expect(resMultiplier(0.75 - epsilon)).toBeCloseTo(resMultiplier(0.75), 8);
  });

  it("is monotonically decreasing in RES across the whole range", () => {
    const points = [-2, -1, -0.5, 0, 0.25, 0.5, 0.74, 0.75, 0.9, 2, 10];
    for (let i = 1; i < points.length; i++) {
      expect(resMultiplier(points[i]!)).toBeLessThan(resMultiplier(points[i - 1]!));
    }
  });

  it("never returns a negative or non-finite multiplier, even at extremes", () => {
    for (const res of [-100, -1, 0, 0.75, 1, 100]) {
      const m = resMultiplier(res);
      expect(Number.isFinite(m)).toBe(true);
      expect(m).toBeGreaterThan(0);
    }
  });
});

describe("resReduction is per-element and crosses into the negative branch", () => {
  const pyroChar = makeTestCharacter("a", { element: "pyro" });

  function damageWith(enemy: EnemyState, resReduction: Partial<Record<string, number>>): number {
    return computeDamage({
      timestamp: 0,
      sourceCharacterId: "a",
      ability: pyroChar.elementalSkill,
      stats: { ...NEUTRAL_STATS },
      characterLevel: 0,
      enemy,
      config: NO_CRIT_CONFIG,
      enemyModifiers: { defReduction: 0, defIgnore: 0, resReduction },
    }).finalDamage;
  }

  it("shreds ONLY the named element, leaving others untouched", () => {
    const enemy: EnemyState = {
      ...NEUTRAL_ENEMY,
      resistances: { pyro: 0.5, hydro: 0.5 },
    };
    // Pyro shred applies: res 0.5 - 0.4 = 0.1 -> mult 0.9.
    // 1000 atk * 2 mult * 0.5 def * 0.9 = 900.
    expect(damageWith(enemy, { pyro: 0.4 })).toBeCloseTo(900, 8);
    // A hydro-only shred must not touch this pyro hit: res stays 0.5 -> 500.
    expect(damageWith(enemy, { hydro: 0.4 })).toBeCloseTo(500, 8);
  });

  it("shredding past zero enters the NEGATIVE branch, not a clamp at zero", () => {
    const enemy: EnemyState = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.1 } };
    // 0.1 - 0.5 = -0.4 -> mult = 1 + 0.4/2 = 1.2 -> 1000*2*0.5*1.2 = 1200.
    expect(damageWith(enemy, { pyro: 0.5 })).toBeCloseTo(1200, 8);
    // A clamp at zero would give exactly 1000. Explicitly excluded.
    expect(damageWith(enemy, { pyro: 0.5 })).not.toBeCloseTo(1000, 6);
  });

  it("shred is applied exactly once per hit, never compounding across hits", () => {
    const enemy: EnemyState = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } };
    const first = damageWith(enemy, { pyro: 0.4 });
    const second = damageWith(enemy, { pyro: 0.4 });
    expect(second).toBe(first);
    // And the enemy object itself is untouched.
    expect(enemy.resistances.pyro).toBe(0.5);
  });

  it("DEF shred and RES shred compose without interfering", () => {
    const enemy: EnemyState = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } };
    const damage = computeDamage({
      timestamp: 0,
      sourceCharacterId: "a",
      ability: pyroChar.elementalSkill,
      stats: { ...NEUTRAL_STATS },
      characterLevel: 0,
      enemy,
      config: NO_CRIT_CONFIG,
      enemyModifiers: {
        defReduction: 0.2,
        defIgnore: 0.3,
        resReduction: { pyro: 0.4 },
      },
    }).finalDamage;
    // def mult = 100/(100 + 100*0.8*0.7) = 100/156
    // res mult = 1 - (0.5-0.4) = 0.9
    const expected = 1000 * 2 * (100 / (100 + 100 * 0.8 * 0.7)) * 0.9;
    expect(damage).toBeCloseTo(expected, 8);
  });
});

describe("shred end-to-end through simulateRotation", () => {
  it("a RES-shred buff raises damage through the whole stack", () => {
    const character = makeTestCharacter("a", { element: "pyro" });
    const enemy: EnemyState = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } };
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const shredBuff: Buff = {
      id: "res-shred",
      source: "test",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    };

    const unshredded = simulateRotation([character], rotation, enemy, NO_CRIT_CONFIG);
    const shredded = simulateRotation([character], rotation, enemy, {
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [shredBuff] }),
    });

    // 1000*2*0.5*0.5 = 500 -> 1000*2*0.5*0.9 = 900.
    expect(unshredded.totalDamage).toBeCloseTo(500, 8);
    expect(shredded.totalDamage).toBeCloseTo(900, 8);
  });

  it("stays deterministic with both resolvers attached", () => {
    const character = makeTestCharacter("a", { element: "pyro" });
    const enemy: EnemyState = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } };
    const buffs: Buff[] = [
      {
        id: "combo",
        source: "test",
        startTime: 0,
        duration: Number.POSITIVE_INFINITY,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "dmgBonus", value: 0.5 }],
        enemyModifiers: [
          { key: "defReduction", value: 0.2 },
          { key: "defIgnore", value: 0.3 },
          { key: "resReduction", value: 0.4, element: "pyro" },
        ],
      },
    ];
    const run = () =>
      simulateRotation(
        [character],
        [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
        enemy,
        { ...NO_CRIT_CONFIG, ...makeResolvers({ buffs }) },
      ).totalDamage;
    expect(run()).toBe(run());
    // And the composed value is the hand-computed one.
    const expected = 1000 * 2 * 1.5 * (100 / (100 + 100 * 0.8 * 0.7)) * 0.9;
    expect(run()).toBeCloseTo(expected, 8);
  });
});
