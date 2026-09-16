import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import { KIRARA_KIT_METADATA, createKiraraDefinition } from "./kiraraDefinition";

const noCrit = { critMode: "never" as const };

function burstDamage(character: ReturnType<typeof createKiraraDefinition>): number {
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation([ready], [{ characterId: ready.id, actionType: "burst" }], testEnemy, noCrit).totalDamage;
}

describe("Kirara runtime kit", () => {
  it("executes sourced skill and burst damage", () => {
    const character = createKiraraDefinition();
    const result = simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "skill" },
        { characterId: character.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(5);
  });

  it("applies A4 Max HP scaling to actual skill and burst damage", () => {
    const lowHp = createKiraraDefinition(0, undefined, { baseStats: { ...kiraraBaseStats(), hp: 10_000 } });
    const highHp = createKiraraDefinition(0, undefined, { baseStats: { ...kiraraBaseStats(), hp: 30_000 } });
    expect(highHp.baseStats.hp).toBeGreaterThan(lowHp.baseStats.hp);
    expect(simulateRotation([highHp], [{ characterId: highHp.id, actionType: "skill" }], testEnemy, noCrit).totalDamage)
      .toBeGreaterThan(simulateRotation([lowHp], [{ characterId: lowHp.id, actionType: "skill" }], testEnemy, noCrit).totalDamage);
    expect(burstDamage(highHp)).toBeGreaterThan(burstDamage(lowHp));
    expect(KIRARA_KIT_METADATA.a4SkillHpRatio).toBe(0.000004);
  });

  it("adds C4 Cardamom damage after the skill shield window starts", () => {
    const c0 = createKiraraDefinition(0);
    const c4 = createKiraraDefinition(4);
    const rotation = [
      { characterId: c4.id, actionType: "skill" as const },
      { characterId: c4.id, actionType: "normal" as const },
    ];
    const result = simulateRotation([c4], rotation, testEnemy, noCrit);
    const cardamom = result.timeline.filter((event) => event.type === "damage" && event.damage?.abilityId === "kirara-c4-small-cardamom");
    expect(cardamom).toHaveLength(1);
    expect(result.totalDamage).toBeGreaterThan(simulateRotation([c0], rotation, testEnemy, noCrit).totalDamage);
    expect(KIRARA_KIT_METADATA.c4CardamomAtkRatio).toBe(2);
  });

  it("applies C6 all-element DMG bonus to damage after skill", () => {
    const c0 = createKiraraDefinition(0);
    const c6 = createKiraraDefinition(6);
    const rotation = [
      { characterId: c6.id, actionType: "skill" as const },
      { characterId: c6.id, actionType: "burst" as const },
    ];
    const c6Ready = { ...c6, burst: { ...c6.burst, energyCost: 0 } };
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    expect(simulateRotation([c6Ready], rotation, testEnemy, noCrit).totalDamage)
      .toBeGreaterThan(simulateRotation([c0Ready], rotation, testEnemy, noCrit).totalDamage);
    expect(KIRARA_KIT_METADATA.c6ElementalDmgBonus).toBe(0.12);
  });
});

function kiraraBaseStats() {
  return {
    atk: 223,
    hp: 12_180,
    def: 546,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  } as const;
}
