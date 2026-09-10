import { describe, expect, it } from "vitest";
import { computeDamage } from "@/simulation/damage/pipeline";
import { baseDmgMultiplierFor, NO_REACTION_BONUS } from "@/types";
import type { AbilityDefinition, EnemyState, Stats } from "@/types";

// ============================================================================
// Regression tests for the two KQM formula terms landed in TASK #044:
//
//   1. `BaseDMGMultiplier` — inside the sigma, multiplying the talent motion
//      value ONLY, before `AdditiveBaseDMGBonus`.
//   2. `Stats.flatDamageBonus` — the non-reaction `AdditiveBaseDMGBonus`
//      channel, now actually supplied rather than being a dead parameter.
//
// Source for both: KQM TCL `combat-mechanics/damage/damage-formula`
//   DMG = (Σ(BaseDMG × BaseDMGMultiplier) + AdditiveBaseDMGBonus)
//         × (1 + DMGBonus − DMGReduction) × CRIT × DefMult × ResMult × Amp
//
// Every expected value below is computed BY HAND in the comment above it, so a
// change in the implementation cannot quietly redefine what "correct" means.
// ============================================================================

const baseStats: Stats = {
  atk: 1000,
  hp: 0,
  def: 0,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

/** 200% ATK skill. With ATK 1000 the talent base is exactly 2000. */
const skill: AbilityDefinition = {
  id: "a",
  name: "A",
  actionType: "skill",
  element: "pyro",
  damageType: "skill",
  multiplier: 2.0,
  scaling: "atk",
  castTime: 1,
  cooldown: 0,
  energyCost: 0,
  energyGenerated: 0,
};

/** Level 0, no resistances: DEF/RES multipliers are the only mitigation. */
const enemy: EnemyState = { id: "e", name: "E", level: 0, resistances: {} };

/** DEF mult for a level-0 character vs a level-0 enemy: 100/(100+100) = 0.5. */
const DEF_MULT_L0_V_L0 = 0.5;

function damageWith(stats: Stats, extra: Record<string, unknown> = {}): number {
  return computeDamage({
    timestamp: 0,
    sourceCharacterId: "c",
    ability: skill,
    stats,
    characterLevel: 0,
    enemy,
    config: { critMode: "never" },
    ...extra,
  }).finalDamage;
}

describe("baseDmgMultiplierFor", () => {
  it("defaults an absent map to 1, not 0", () => {
    // KQM's piecewise definition has `1` as its `otherwise` branch. Reading an
    // absent entry as 0 would zero out every talent that has no such buff.
    expect(baseDmgMultiplierFor(baseStats, "skill")).toBe(1);
  });

  it("defaults an absent KEY within a present map to 1", () => {
    // Xingqiu C4 buffs his SKILL. His normals must be untouched, not zeroed.
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: 1.5 } };
    expect(baseDmgMultiplierFor(stats, "skill")).toBe(1.5);
    expect(baseDmgMultiplierFor(stats, "normal")).toBe(1);
  });

  it("clamps a negative multiplier to 0 rather than inverting damage", () => {
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: -2 } };
    expect(baseDmgMultiplierFor(stats, "skill")).toBe(0);
  });

  it("does not cap above 1 — real values exceed it", () => {
    // Electro Traveler C6 World-Shaker is 2; Xingqiu C4 Evilsoother is 1.5.
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { burst: 2 } };
    expect(baseDmgMultiplierFor(stats, "burst")).toBe(2);
  });
});

describe("BaseDMGMultiplier in the damage pipeline", () => {
  it("is a no-op when absent — no existing damage number moves", () => {
    // 2000 talent base * 1 * DMG 1.0 * DEF 0.5 * RES 1.0 = 1000.
    expect(damageWith(baseStats)).toBeCloseTo(2000 * DEF_MULT_L0_V_L0, 10);
  });

  it("multiplies the talent motion value (Xingqiu C4 = 1.5 on Skill)", () => {
    // (2000 * 1.5) * 1.0 * 0.5 = 1500. Understated as 1000 before this landed.
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: 1.5 } };
    expect(damageWith(stats)).toBeCloseTo(2000 * 1.5 * DEF_MULT_L0_V_L0, 10);
  });

  it("applies only to the matching damage type", () => {
    // The buff names `normal`; our instance is a `skill`, so nothing changes.
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { normal: 2 } };
    expect(damageWith(stats)).toBeCloseTo(2000 * DEF_MULT_L0_V_L0, 10);
  });

  it("scales the talent base but NOT the additive bonus", () => {
    // THE LOAD-BEARING TEST. KQM's Yoimiya page: Niwabi Fire-Dance "does not
    // increase Yun Jin's Cliffbreaker's Banner bonus", and Yun Jin's bonus is
    // an AdditiveBaseDMGBonus. So the multiplier must be INSIDE the sigma.
    //
    // Correct:   (2000 * 1.5 + 500) * 0.5 = 3500 * 0.5 = 1750
    // Wrong:     ((2000 + 500) * 1.5) * 0.5 = 3750 * 0.5 = 1875
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: 1.5 } };
    const damage = damageWith(stats, { flatDamageBonus: 500 });
    expect(damage).toBeCloseTo((2000 * 1.5 + 500) * DEF_MULT_L0_V_L0, 10);
    expect(damage).not.toBeCloseTo((2000 + 500) * 1.5 * DEF_MULT_L0_V_L0, 6);
  });

  it("does not scale the ADDITIVE REACTION term either", () => {
    // Aggravate/Spread are AdditiveBaseDMGBonus by the same KQM section, so
    // they sit outside the sigma exactly like Yun Jin's does.
    //   (2000 * 2 + 800) * 0.5 = 4800 * 0.5 = 2400
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: 2 } };
    const damage = damageWith(stats, {
      reaction: { additiveBaseDamageBonus: 800 },
    });
    expect(damage).toBeCloseTo((2000 * 2 + 800) * DEF_MULT_L0_V_L0, 10);
  });

  it("composes with DMG% multiplicatively, since they are separate terms", () => {
    // BaseDMGMultiplier is inside the sigma; DMG% is its own bracket. So a
    // 1.5 base multiplier and a +50% DMG bonus give 1.5 * 1.5 = 2.25, not
    // an additive 1 + 0.5 + 0.5 = 2.0.
    //   (2000 * 1.5) * (1 + 0.5) * 0.5 = 3000 * 1.5 * 0.5 = 2250
    const stats: Stats = {
      ...baseStats,
      dmgBonus: 0.5,
      baseDmgMultiplier: { skill: 1.5 },
    };
    expect(damageWith(stats)).toBeCloseTo(2250, 10);
  });

  it("lets a per-instance override win over the stats-carried value", () => {
    // (2000 * 1) * 0.5 = 1000 — the override opts this instance out.
    const stats: Stats = { ...baseStats, baseDmgMultiplier: { skill: 1.5 } };
    expect(damageWith(stats, { baseDamageMultiplier: 1 })).toBeCloseTo(
      2000 * DEF_MULT_L0_V_L0,
      10,
    );
  });

  it("reaches crit through the same product", () => {
    // (2000 * 1.5) * 0.5 * (1 + 1.0 crit dmg) = 1500 * 2 = 3000
    const stats: Stats = {
      ...baseStats,
      critDmg: 1.0,
      baseDmgMultiplier: { skill: 1.5 },
    };
    const damage = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability: skill,
      stats,
      characterLevel: 0,
      enemy,
      config: { critMode: "always" },
    });
    expect(damage.finalDamage).toBeCloseTo(3000, 10);
    // `rawDamage` reports the base the pipeline actually scaled, so it must
    // already include the multiplier.
    expect(damage.rawDamage).toBeCloseTo(3000, 10);
  });
});

describe("Stats.flatDamageBonus wiring", () => {
  it("is read from the stat bag, so the buff layer can supply it", () => {
    // This is the fix for the dead parameter: before, only an explicit
    // `input.flatDamageBonus` worked and nothing in the engine passed one.
    //   (2000 + 300) * 0.5 = 1150
    const stats: Stats = { ...baseStats, flatDamageBonus: 300 };
    expect(damageWith(stats)).toBeCloseTo(2300 * DEF_MULT_L0_V_L0, 10);
  });

  it("is absent-safe — omitting it changes nothing", () => {
    expect(damageWith(baseStats)).toBeCloseTo(2000 * DEF_MULT_L0_V_L0, 10);
  });

  it("lets an explicit per-instance value override the stat bag", () => {
    // Explicit 0 must WIN, not fall through to the bag's 300 (`??` not `||`).
    const stats: Stats = { ...baseStats, flatDamageBonus: 300 };
    expect(damageWith(stats, { flatDamageBonus: 0 })).toBeCloseTo(
      2000 * DEF_MULT_L0_V_L0,
      10,
    );
  });

  it("stacks with the additive reaction term in the same channel", () => {
    // KQM lists both under "Additive Base DMG Sources" — one term, so they sum.
    //   (2000 + 300 + 700) * 0.5 = 1500
    const stats: Stats = { ...baseStats, flatDamageBonus: 300 };
    const damage = damageWith(stats, {
      reaction: { additiveBaseDamageBonus: 700 },
    });
    expect(damage).toBeCloseTo(3000 * DEF_MULT_L0_V_L0, 10);
  });
});

describe("NO_REACTION_BONUS", () => {
  it("is empty and frozen, so a shared default cannot be mutated", () => {
    expect(NO_REACTION_BONUS).toEqual({});
    expect(Object.isFrozen(NO_REACTION_BONUS)).toBe(true);
  });
});
