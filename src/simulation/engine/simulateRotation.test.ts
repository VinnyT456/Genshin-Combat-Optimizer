import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { CharacterDefinition, EnemyState, Rotation, Stats } from "@/types";

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

function makeChar(): CharacterDefinition {
  return {
    id: "c",
    name: "C",
    element: "pyro",
    level: 0,
    maxEnergy: 40,
    baseStats,
    normalAttack: {
      id: "na",
      name: "NA",
      actionType: "normal",
      element: "physical",
      damageType: "normal",
      multiplier: 1.0,
      scaling: "atk",
      castTime: 0.5,
      cooldown: 0,
      energyCost: 0,
      energyGenerated: 0,
    },
    chargedAttack: {
      id: "ca",
      name: "CA",
      actionType: "charged",
      element: "physical",
      damageType: "charged",
      multiplier: 1.0,
      scaling: "atk",
      castTime: 0.5,
      cooldown: 0,
      energyCost: 0,
      energyGenerated: 0,
    },
    elementalSkill: {
      id: "e",
      name: "E",
      actionType: "skill",
      element: "pyro",
      damageType: "skill",
      multiplier: 2.0,
      scaling: "atk",
      castTime: 1.0,
      cooldown: 6,
      energyCost: 0,
      energyGenerated: 20,
    },
    elementalBurst: {
      id: "q",
      name: "Q",
      actionType: "burst",
      element: "pyro",
      damageType: "burst",
      multiplier: 4.0,
      scaling: "atk",
      castTime: 1.0,
      cooldown: 15,
      energyCost: 40,
      energyGenerated: 0,
    },
  };
}

const enemy: EnemyState = { id: "e", name: "E", level: 0, resistances: {} };
const cfg = { critMode: "never" as const };

describe("simulateRotation", () => {
  it("sums damage of a simple rotation", () => {
    const c = makeChar();
    const rotation: Rotation = [
      { characterId: "c", actionType: "normal", abilityId: "na" },
      { characterId: "c", actionType: "skill", abilityId: "e" },
    ];
    const r = simulateRotation([c], rotation, enemy, cfg);
    // defMult(0,0)=0.5. NA: 1000*1.0*0.5=500. E: 1000*2.0*0.5=1000.
    expect(r.totalDamage).toBeCloseTo(1500);
    expect(r.errors).toHaveLength(0);
  });

  it("advances the clock by cast times and computes dps", () => {
    const c = makeChar();
    const rotation: Rotation = [
      { characterId: "c", actionType: "normal", abilityId: "na" }, // 0.5s
      { characterId: "c", actionType: "skill", abilityId: "e" }, // 1.0s
    ];
    const r = simulateRotation([c], rotation, enemy, cfg);
    expect(r.duration).toBeCloseTo(1.5);
    expect(r.dps).toBeCloseTo(1500 / 1.5);
  });

  it("rejects a skill still on cooldown", () => {
    const c = makeChar();
    const rotation: Rotation = [
      { characterId: "c", actionType: "skill", abilityId: "e" },
      { characterId: "c", actionType: "skill", abilityId: "e" }, // CD 6s, only 1s later
    ];
    const r = simulateRotation([c], rotation, enemy, cfg);
    // only first skill lands: 1000
    expect(r.totalDamage).toBeCloseTo(1000);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("rejects a burst without enough energy", () => {
    const c = makeChar();
    const rotation: Rotation = [
      { characterId: "c", actionType: "burst", abilityId: "q" }, // needs 40, has 0
    ];
    const r = simulateRotation([c], rotation, enemy, cfg);
    expect(r.totalDamage).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("can start a fresh combat with full energy", () => {
    const c = makeChar();
    const r = simulateRotation([c], [
      { characterId: "c", actionType: "burst", abilityId: "q" },
    ], enemy, { ...cfg, startWithFullEnergy: true });
    expect(r.totalDamage).toBeCloseTo(2000);
    expect(r.errors).toHaveLength(0);
    expect(r.structuredWarnings.filter((warning) => warning.actionIndex >= 0)).toEqual([]);
    expect(r.finalState.characters.c?.energy.current).toBe(0);
    expect(r.finalState.characters.c?.energy.totalSpent).toBe(40);
  });

  it("allows a burst after enough energy is generated", () => {
    // Fresh char with no skill CD so two skills can both land and generate energy.
    const noCd = makeChar();
    noCd.elementalSkill.cooldown = 0;
    const rot2: Rotation = [
      { characterId: "c", actionType: "skill", abilityId: "e" }, // +20 -> 20
      { characterId: "c", actionType: "skill", abilityId: "e" }, // +20 -> 40
      { characterId: "c", actionType: "burst", abilityId: "q" }, // spends 40
    ];
    const r = simulateRotation([noCd], rot2, enemy, cfg);
    // 2 skills (1000 each) + burst (1000*4*0.5=2000) = 4000
    expect(r.totalDamage).toBeCloseTo(4000);
    expect(r.warnings).toHaveLength(0);
  });

  it("errors on an unknown character", () => {
    const c = makeChar();
    const rotation: Rotation = [
      { characterId: "ghost", actionType: "normal", abilityId: "na" },
    ];
    const r = simulateRotation([c], rotation, enemy, cfg);
    expect(r.errors.length).toBeGreaterThan(0);
  });
});
