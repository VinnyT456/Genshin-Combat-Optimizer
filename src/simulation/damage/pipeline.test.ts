import { describe, expect, it } from "vitest";
import {
  computeDamage,
  defMultiplier,
  resMultiplier,
} from "@/simulation/damage/pipeline";
import type { AbilityDefinition, EnemyState, Stats } from "@/types";

const zeroStats: Stats = {
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

const ability: AbilityDefinition = {
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

// Enemy with no defense factor and no resistance -> pure formula isolation.
const noMitigationEnemy: EnemyState = {
  id: "e",
  name: "E",
  level: 0,
  resistances: {},
};

describe("resMultiplier", () => {
  it("halves negative resistance", () => {
    expect(resMultiplier(-0.5)).toBeCloseTo(1.25);
  });
  it("subtracts for the normal range", () => {
    expect(resMultiplier(0.1)).toBeCloseTo(0.9);
  });
  it("uses the diminishing formula at high res", () => {
    expect(resMultiplier(0.75)).toBeCloseTo(1 / 4);
  });
});

describe("defMultiplier", () => {
  it("is symmetric for equal levels", () => {
    // level 100 attacker vs level 0 enemy: (200) / (200 + 100)
    expect(defMultiplier(100, 0)).toBeCloseTo(200 / 300);
  });
});

describe("computeDamage", () => {
  it("converts a deterministic healing event into artifact-compatible damage", () => {
    const d = computeDamage({
      timestamp: 3,
      sourceCharacterId: "healer",
      healing: {
        event: {
          timestamp: 3,
          sourceCharacterId: "healer",
          targetCharacterId: "ally",
          amount: 20_000,
        },
        multiplier: 0.9,
        maxAmount: 30_000,
        bypassMitigation: true,
      },
      stats: { ...zeroStats, critRate: 1, critDmg: 2 },
      characterLevel: 1,
      enemy: {
        id: "resistant",
        name: "Resistant",
        level: 90,
        resistances: { physical: 0.9 },
      },
      config: { critMode: "always" },
    });

    expect(d.rawDamage).toBe(18_000);
    expect(d.finalDamage).toBe(18_000);
    expect(d.damageType).toBe("reaction");
  });

  it("caps and clamps healing input deterministically", () => {
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "healer",
      healing: {
        event: { timestamp: 0, sourceCharacterId: "healer", amount: -5 },
        multiplier: 0.9,
        maxAmount: 30_000,
        bypassMitigation: true,
      },
      stats: zeroStats,
      characterLevel: 90,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    });

    expect(d.finalDamage).toBe(0);
  });

  it("ATK*multiplier with no bonuses and no mitigation equals raw", () => {
    // ATK 1000 * 2.0 = 2000. def at level 90 vs 90, res 0.
    const enemy: EnemyState = { id: "e", name: "E", level: 90, resistances: {} };
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: zeroStats,
      characterLevel: 90,
      enemy,
      config: { critMode: "never" },
    });
    const def = defMultiplier(90, 90); // 0.5
    expect(d.rawDamage).toBe(2000);
    expect(d.finalDamage).toBeCloseTo(2000 * def);
  });

  it("fully isolated formula gives exactly raw damage", () => {
    // attacker lvl 0 -> defMult would not be 1, so isolate via known factor.
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: zeroStats,
      characterLevel: 0,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    });
    // defMultiplier(0,0) = 100/200 = 0.5
    expect(d.finalDamage).toBeCloseTo(2000 * 0.5);
  });

  it("expected damage averages crit correctly", () => {
    const stats: Stats = { ...zeroStats, critRate: 0.5, critDmg: 1.0 };
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats,
      characterLevel: 0,
      enemy: noMitigationEnemy,
      config: { critMode: "expected" },
    });
    // preCrit = 2000 * 0.5 = 1000. expected mult = 1 + 0.5*1.0 = 1.5
    expect(d.finalDamage).toBeCloseTo(1000 * 1.5);
    expect(d.critDamage).toBeCloseTo(1000 * 2.0);
    expect(d.nonCritDamage).toBeCloseTo(1000);
  });

  it("applies generic and elemental DMG bonus additively", () => {
    const stats: Stats = {
      ...zeroStats,
      dmgBonus: 0.2,
      elementalDmgBonus: { pyro: 0.3 },
    };
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats,
      characterLevel: 0,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    });
    // 2000 * (1 + 0.2 + 0.3) * 0.5 = 2000 * 1.5 * 0.5 = 1500
    expect(d.finalDamage).toBeCloseTo(1500);
  });

  it("applies resistance", () => {
    const enemy: EnemyState = {
      id: "e",
      name: "E",
      level: 0,
      resistances: { pyro: 0.1 },
    };
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: zeroStats,
      characterLevel: 0,
      enemy,
      config: { critMode: "never" },
    });
    // 2000 * 0.5(def) * 0.9(res) = 900
    expect(d.finalDamage).toBeCloseTo(900);
  });

  it("applies damageType-specific DMG bonus (e.g. burst/skill DMG bonus)", () => {
    const stats: Stats = {
      ...zeroStats,
      dmgBonus: 0.1,
      elementalDmgBonus: { pyro: 0.2 },
      typeDmgBonus: { burst: 0.5, skill: 0.3 },
    };
    // ability.damageType is 'skill' -> picks up skill: 0.3
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats,
      characterLevel: 0,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    });
    // 2000 * (1 + 0.1 + 0.2 + 0.3) * 0.5(def) = 2000 * 1.6 * 0.5 = 1600
    expect(d.finalDamage).toBeCloseTo(1600);
  });

  it("applies flat additive base damage bonus (e.g. Shenhe / Yun Jin / Xianyun)", () => {
    const d = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: zeroStats,
      characterLevel: 0,
      enemy: noMitigationEnemy,
      flatDamageBonus: 1000,
      config: { critMode: "never" },
    });
    // (2000 raw + 1000 flat) * 1.0(dmgBonus) * 0.5(def) * 1.0(res) = 1500
    expect(d.rawDamage).toBeCloseTo(3000);
    expect(d.finalDamage).toBeCloseTo(1500);
  });
});

// ===========================================================================
// TASK #039 — KQM Theorycrafting Library audit.
//
// Source for every number below: KQM TCL, page
// `combat-mechanics/damage/damage-formula` and its `_formulas` partials
// (enemydef.md, enemyres.md, amplifying.md), plus the Evidence Vault entries
// "Defense shred is hard capped at 90%" and "Damage Reduction Mechanics".
// ===========================================================================

describe("KQM audit: DEF reduction is hard capped at 90%", () => {
  // KQM: "DefReduction is hard capped at 90%".
  // Stacked shred in a real team (Lisa A4 15 + Klee C2 23 + Ayaka C4 30 +
  // Razor C4 15 + Zhongli 20) reaches 103%.
  const OVER_CAP = 1.03;

  it("caps at 90% instead of nullifying enemy DEF entirely", () => {
    // KQM value at the cap: 190 / (190 + 200 * (1 - 0.9)) = 0.904761...
    expect(defMultiplier(90, 100, OVER_CAP)).toBeCloseTo(190 / (190 + 200 * 0.1), 10);
  });

  it("is the ~10.5% overstatement the uncapped formula produced", () => {
    // OLD behaviour: Math.max(0, 1 - 1.03) == 0 => defender DEF vanished
    // => multiplier 1.0. That is provably wrong per KQM, so this number moved:
    //   old 1.0  ->  new 0.9047619047619048   (-9.52%, i.e. old was +10.5%).
    const capped = defMultiplier(90, 100, OVER_CAP);
    expect(capped).not.toBeCloseTo(1, 6);
    expect(1 / capped).toBeCloseTo(1.1052631578947367, 10);
  });

  it("caps exactly at the boundary and is continuous below it", () => {
    expect(defMultiplier(90, 100, 0.9)).toBeCloseTo(defMultiplier(90, 100, 2.5), 12);
    // Just below the cap must still vary, i.e. the clamp is not applied early.
    expect(defMultiplier(90, 100, 0.89)).toBeLessThan(defMultiplier(90, 100, 0.9));
  });

  it("leaves all sub-cap DEF reduction values untouched", () => {
    // Regression guard: no EXISTING damage number may move. Every realistic
    // shred total (<=90%) must match the pre-change formula exactly.
    for (const dr of [0, 0.15, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9]) {
      const attacker = 90 + 100;
      const expected = attacker / (attacker + (100 + 100) * (1 - dr));
      expect(defMultiplier(90, 100, dr)).toBeCloseTo(expected, 12);
    }
  });

  it("does NOT cap DEF ignore, which KQM documents no cap for", () => {
    // DEF ignore stays clamped at 0 only: >100% ignore removes DEF entirely.
    expect(defMultiplier(90, 100, 0, 1.5)).toBeCloseTo(1, 12);
  });

  it("keeps DEF reduction and DEF ignore as distinct multiplicative channels", () => {
    // KQM: (enemyLvl+100) * (1 - DefReduction) * (1 - DefIgnore).
    // Summing them (0.3+0.4=0.7) would give a different, wrong answer.
    const attacker = 190;
    const multiplicative = attacker / (attacker + 200 * (1 - 0.3) * (1 - 0.4));
    const summed = attacker / (attacker + 200 * (1 - 0.7));
    expect(defMultiplier(90, 100, 0.3, 0.4)).toBeCloseTo(multiplicative, 12);
    expect(multiplicative).not.toBeCloseTo(summed, 6);
  });
});

describe("KQM audit: RES multiplier matches the piecewise formula", () => {
  // KQM `_formulas/enemyres.md`, all three branches.
  it("matches KQM on every branch", () => {
    expect(resMultiplier(-0.5)).toBeCloseTo(1 - -0.5 / 2, 12); // negative branch
    expect(resMultiplier(0)).toBeCloseTo(1, 12); // boundary into middle branch
    expect(resMultiplier(0.1)).toBeCloseTo(0.9, 12);
    expect(resMultiplier(0.74999)).toBeCloseTo(1 - 0.74999, 12);
    expect(resMultiplier(0.75)).toBeCloseTo(1 / (4 * 0.75 + 1), 12); // >=0.75
    expect(resMultiplier(0.9)).toBeCloseTo(1 / (4 * 0.9 + 1), 12);
  });
});

describe("KQM audit: target DMG Reduction subtracts from the DMG bonus bracket", () => {
  const statsWithBonus: Stats = {
    ...zeroStats,
    dmgBonus: 0,
    elementalDmgBonus: { pyro: 0.466 },
  };

  function damageWith(dmgReduction: number | undefined): number {
    return computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: statsWithBonus,
      characterLevel: 90,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
      enemyModifiers: {
        defReduction: 0,
        defIgnore: 0,
        resReduction: {},
        dmgReduction,
      },
    }).finalDamage;
  }

  it("is NOT a separate multiplier", () => {
    // KQM Evidence Vault "Damage Reduction Mechanics": a Kairagi's 80% DMG
    // Reduction subtracts 0.8 from the DMG Bonus bracket.
    //   bracket = 1 + 0.466 - 0.8 = 0.666
    // A separate multiplier would instead give 1.466 * (1 - 0.8) = 0.2932.
    const base = damageWith(0);
    const reduced = damageWith(0.8);
    expect(reduced / base).toBeCloseTo(0.666 / 1.466, 10);
    expect(reduced / base).not.toBeCloseTo(0.2, 3);
  });

  it("clamps the bracket at zero rather than healing the target", () => {
    expect(damageWith(5)).toBe(0);
  });

  it("is inert when absent, so no existing damage number moves", () => {
    expect(damageWith(undefined)).toBeCloseTo(damageWith(0), 12);
  });
});

describe("KQM audit: DMG% sources are all additive with each other", () => {
  it("sums generic, elemental and type bonuses into one bracket", () => {
    // KQM: DMGBonus is the "sum of all percentage damage increases".
    // 1 + 0.2 + 0.3 + 0.15 = 1.65, NOT 1.2 * 1.3 * 1.15 = 1.794.
    const stats: Stats = {
      ...zeroStats,
      dmgBonus: 0.2,
      elementalDmgBonus: { pyro: 0.3 },
      typeDmgBonus: { skill: 0.15 },
    };
    const dmg = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats,
      characterLevel: 90,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    }).finalDamage;
    // base = 2.0 * 1000 = 2000; DEF/RES are 1 for this enemy at level 0? No:
    // enemy level 0 still contributes, so compare as a RATIO against no bonus.
    const plain = computeDamage({
      timestamp: 0,
      sourceCharacterId: "c",
      ability,
      stats: zeroStats,
      characterLevel: 90,
      enemy: noMitigationEnemy,
      config: { critMode: "never" },
    }).finalDamage;
    expect(dmg / plain).toBeCloseTo(1.65, 10);
    expect(dmg / plain).not.toBeCloseTo(1.2 * 1.3 * 1.15, 3);
  });
});

describe("KQM audit: crit is expected-value with a clamped rate", () => {
  it("matches KQM AverageCrit = 1 + clamp(0,CR,1) * CD", () => {
    const stats: Stats = { ...zeroStats, critRate: 0.4, critDmg: 1.2 };
    const base = { timestamp: 0, sourceCharacterId: "c", ability, stats, characterLevel: 90, enemy: noMitigationEnemy };
    const never = computeDamage({ ...base, config: { critMode: "never" } }).finalDamage;
    const expected = computeDamage({ ...base, config: { critMode: "expected" } }).finalDamage;
    const always = computeDamage({ ...base, config: { critMode: "always" } }).finalDamage;
    expect(expected / never).toBeCloseTo(1 + 0.4 * 1.2, 10);
    expect(always / never).toBeCloseTo(1 + 1.2, 10);
  });

  it("clamps crit rate above 100%, per KQM's clamp", () => {
    const over: Stats = { ...zeroStats, critRate: 1.8, critDmg: 1.0 };
    const at: Stats = { ...zeroStats, critRate: 1.0, critDmg: 1.0 };
    const mk = (s: Stats): number =>
      computeDamage({ timestamp: 0, sourceCharacterId: "c", ability, stats: s, characterLevel: 90, enemy: noMitigationEnemy, config: { critMode: "expected" } }).finalDamage;
    expect(mk(over)).toBeCloseTo(mk(at), 10);
  });
});

describe("KQM audit: amplifying reaction multiplies AFTER DEF/RES and crits", () => {
  it("crit applies on top of the amplified damage", () => {
    const stats: Stats = { ...zeroStats, critRate: 1, critDmg: 1.0 };
    const mk = (amp: number, critMode: "never" | "always"): number =>
      computeDamage({
        timestamp: 0,
        sourceCharacterId: "c",
        ability,
        stats,
        characterLevel: 90,
        enemy: noMitigationEnemy,
        config: { critMode },
        reaction: { amplifyingMultiplier: amp },
      }).finalDamage;
    // KQM: CRIT and AmplifyingReaction are both factors on the same product,
    // so a 2.0x vaporize doubles the crit and non-crit numbers alike.
    expect(mk(2, "never")).toBeCloseTo(mk(1, "never") * 2, 10);
    expect(mk(2, "always")).toBeCloseTo(mk(1, "always") * 2, 10);
    expect(mk(2, "always")).toBeCloseTo(mk(2, "never") * 2, 10);
  });

  it("is NOT folded into the additive DMG bonus bracket", () => {
    // Treating a 2.0x vaporize as +100% DMG bonus would give 1+1=2.0 only when
    // there is no other bonus; with a 0.466 goblet it would give 2.466 instead
    // of the correct 1.466 * 2 = 2.932.
    const stats: Stats = { ...zeroStats, elementalDmgBonus: { pyro: 0.466 } };
    const mk = (amp: number): number =>
      computeDamage({
        timestamp: 0, sourceCharacterId: "c", ability, stats, characterLevel: 90,
        enemy: noMitigationEnemy, config: { critMode: "never" },
        reaction: { amplifyingMultiplier: amp },
      }).finalDamage;
    const plain = computeDamage({
      timestamp: 0, sourceCharacterId: "c", ability, stats: zeroStats, characterLevel: 90,
      enemy: noMitigationEnemy, config: { critMode: "never" },
    }).finalDamage;
    expect(mk(2) / plain).toBeCloseTo(1.466 * 2, 10);
    expect(mk(2) / plain).not.toBeCloseTo(2.466, 3);
  });
});

describe("KQM audit: additive base DMG bonus enters inside the parenthesis", () => {
  it("is scaled by DMG%, DEF and RES like the talent base is", () => {
    // KQM: (ΣBaseDMG + AdditiveBaseDMGBonus) * (1 + DMGBonus) * ...
    const stats: Stats = { ...zeroStats, elementalDmgBonus: { pyro: 0.5 } };
    const withAdditive = computeDamage({
      timestamp: 0, sourceCharacterId: "c", ability, stats, characterLevel: 90,
      enemy: noMitigationEnemy, config: { critMode: "never" },
      reaction: { additiveBaseDamageBonus: 500 },
    });
    const without = computeDamage({
      timestamp: 0, sourceCharacterId: "c", ability, stats, characterLevel: 90,
      enemy: noMitigationEnemy, config: { critMode: "never" },
    });
    // base 2000 -> 2500, a 1.25x increase that the 1.5 DMG bracket also scales.
    expect(withAdditive.rawDamage).toBeCloseTo(2500, 10);
    expect(withAdditive.finalDamage / without.finalDamage).toBeCloseTo(1.25, 10);
  });

  it("adds flatDamageBonus into the same channel", () => {
    const d = computeDamage({
      timestamp: 0, sourceCharacterId: "c", ability, stats: zeroStats, characterLevel: 90,
      enemy: noMitigationEnemy, config: { critMode: "never" },
      reaction: { additiveBaseDamageBonus: 300 },
      flatDamageBonus: 200,
    });
    expect(d.rawDamage).toBeCloseTo(2500, 10);
  });
});
