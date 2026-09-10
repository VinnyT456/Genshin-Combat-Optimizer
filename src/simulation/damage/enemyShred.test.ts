import { describe, expect, it } from "vitest";
import type {
  AbilityDefinition,
  EnemyModifiers,
  EnemyState,
  SimulationConfig,
  Stats,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { computeDamage, defMultiplier, resMultiplier } from "@/simulation/damage/pipeline";

// Level 0 attacker vs level 0 enemy keeps every factor hand-computable.
const LEVEL = 0;

const stats: Stats = {
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
  id: "e",
  name: "E",
  actionType: "skill",
  element: "pyro",
  damageType: "skill",
  multiplier: 1,
  scaling: "atk",
  castTime: 1,
  cooldown: 0,
  energyCost: 0,
  energyGenerated: 0,
};

const config: SimulationConfig = { critMode: "never" };

function enemyWithRes(res: number): EnemyState {
  return {
    id: "e",
    name: "E",
    level: LEVEL,
    resistances: { pyro: res },
  };
}

function damage(enemy: EnemyState, enemyModifiers?: EnemyModifiers): number {
  return computeDamage({
    timestamp: 0,
    sourceCharacterId: "c",
    ability,
    stats,
    characterLevel: LEVEL,
    enemy,
    config,
    ...(enemyModifiers ? { enemyModifiers } : {}),
  }).finalDamage;
}

describe("defMultiplier with DEF shred", () => {
  it("is unchanged when called with no shred (backwards compatible)", () => {
    expect(defMultiplier(LEVEL, LEVEL)).toBeCloseTo(defMultiplier(LEVEL, LEVEL, 0, 0));
    // 100 / (100 + 100)
    expect(defMultiplier(LEVEL, LEVEL)).toBeCloseTo(0.5);
  });

  it("increases the multiplier as DEF is reduced", () => {
    // defender = 100 * (1 - 0.5) = 50 -> 100 / 150
    expect(defMultiplier(LEVEL, LEVEL, 0.5, 0)).toBeCloseTo(100 / 150);
  });

  it("treats defIgnore the same way as defReduction in isolation", () => {
    expect(defMultiplier(LEVEL, LEVEL, 0, 0.5)).toBeCloseTo(
      defMultiplier(LEVEL, LEVEL, 0.5, 0),
    );
  });

  it("applies defReduction and defIgnore multiplicatively, never summed", () => {
    // defender = 100 * 0.5 * 0.5 = 25 -> 100 / 125. Summing would give 100/100.
    expect(defMultiplier(LEVEL, LEVEL, 0.5, 0.5)).toBeCloseTo(100 / 125);
    expect(defMultiplier(LEVEL, LEVEL, 0.5, 0.5)).not.toBeCloseTo(1);
  });

  it("clamps DEF at zero rather than letting >100% shred restore it", () => {
    // 150% shred must not produce a negative defender term.
    //
    // UPDATED by the KQM audit (TASK #039). DEF REDUCTION is hard capped at
    // 90% per KQM TCL `combat-mechanics/damage/damage-formula` ("DefReduction
    // is hard capped at 90%") and its Evidence Vault entry "Defense shred is
    // hard capped at 90%". So 150% reduction no longer nullifies DEF:
    //   old: 1        (defender term driven to 0 — provably wrong)
    //   new: 0.909090…  = 100 / (100 + 100 * (1 - 0.9))
    expect(defMultiplier(LEVEL, LEVEL, 1.5, 0)).toBeCloseTo(100 / 110, 12);
    // DEF IGNORE has no documented cap, so it still zeroes DEF entirely.
    expect(defMultiplier(LEVEL, LEVEL, 0, 1.5)).toBe(1);
  });
});

describe("RES shred through the pipeline", () => {
  it("reduces resistance before the piecewise multiplier", () => {
    const enemy = enemyWithRes(0.5);
    const shred: EnemyModifiers = {
      ...NO_ENEMY_MODIFIERS,
      resReduction: { pyro: 0.4 },
    };
    // 0.5 - 0.4 = 0.1 res -> multiplier 0.9
    expect(damage(enemy, shred)).toBeCloseTo(1000 * 0.5 * resMultiplier(0.1));
  });

  it("enters the negative-res branch when shredded past zero", () => {
    const enemy = enemyWithRes(0.1);
    const shred: EnemyModifiers = {
      ...NO_ENEMY_MODIFIERS,
      resReduction: { pyro: 0.5 },
    };
    // 0.1 - 0.5 = -0.4 -> 1 - (-0.4)/2 = 1.2, i.e. the surplus is halved.
    expect(resMultiplier(-0.4)).toBeCloseTo(1.2);
    expect(damage(enemy, shred)).toBeCloseTo(1000 * 0.5 * 1.2);
  });

  it("only shreds the matching element", () => {
    const enemy: EnemyState = {
      id: "e",
      name: "E",
      level: LEVEL,
      resistances: { pyro: 0.5, cryo: 0.5 },
    };
    const cryoOnly: EnemyModifiers = {
      ...NO_ENEMY_MODIFIERS,
      resReduction: { cryo: 0.5 },
    };
    // Ability is pyro, so a cryo shred must not affect it.
    expect(damage(enemy, cryoOnly)).toBeCloseTo(damage(enemy));
  });
});

describe("no-shred equivalence and non-mutation", () => {
  it("produces identical damage with omitted vs neutral modifiers", () => {
    const enemy = enemyWithRes(0.1);
    expect(damage(enemy, NO_ENEMY_MODIFIERS)).toBeCloseTo(damage(enemy));
  });

  it("never mutates the enemy it was given", () => {
    const enemy = enemyWithRes(0.5);
    const before = JSON.stringify(enemy);
    damage(enemy, {
      defReduction: 0.4,
      defIgnore: 0.2,
      resReduction: { pyro: 0.4 },
    });
    // Re-shredding the same object must give the same answer: proof that the
    // first call did not bake its shred into `enemy`.
    expect(JSON.stringify(enemy)).toBe(before);
  });

  it("does not double-apply when the same enemy is hit repeatedly", () => {
    const enemy = enemyWithRes(0.5);
    const shred: EnemyModifiers = {
      ...NO_ENEMY_MODIFIERS,
      resReduction: { pyro: 0.4 },
    };
    const first = damage(enemy, shred);
    const second = damage(enemy, shred);
    const third = damage(enemy, shred);
    expect(second).toBeCloseTo(first);
    expect(third).toBeCloseTo(first);
  });
});
