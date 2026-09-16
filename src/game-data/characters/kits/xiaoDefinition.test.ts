import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { ActionType, CharacterSnapshot, RotationAction, SimulationSnapshot } from "@/types";
import { createXiaoDefinition, XIAO_KIT_METADATA } from "./xiaoDefinition";

const noCrit = { critMode: "never" as const };

function fullEnergySnapshot(character: ReturnType<typeof createXiaoDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(character: ReturnType<typeof createXiaoDefinition>, actions: RotationAction[]) {
  return simulateRotation([character], actions, testEnemy, {
    ...noCrit,
    resumeFrom: fullEnergySnapshot(character),
  });
}

describe("Xiao runtime kit", () => {
  const damageEvents = (result: ReturnType<typeof run>) =>
    result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event.damage] : []);

  it("deals positive sourced direct Anemo skill damage", () => {
    const xiao = createXiaoDefinition(0, { normal: 10, skill: 10, burst: 10 });
    const result = run(xiao, [
      { characterId: xiao.id, actionType: "skill" },
    ]);

    expect(result.errors).toEqual([]);
    expect(damageEvents(result)).toContainEqual(expect.objectContaining({
      abilityId: "xiao-skill", element: "anemo", damageType: "skill", finalDamage: expect.any(Number),
    }));
    expect(damageEvents(result)[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("uses physical attacks before Burst and sourced Anemo normals, charged attacks, and plunges in stance", () => {
    const character = createXiaoDefinition(0, { normal: 10, skill: 10, burst: 10 });
    const cases: Array<{ actionType: ActionType; abilityId: string; damageType: string }> = [
      { actionType: "normal", abilityId: "xiao-na-1", damageType: "normal" },
      { actionType: "charged", abilityId: "xiao-charged", damageType: "charged" },
      { actionType: "plungeLow", abilityId: "xiao-plungeLow", damageType: "plunge" },
      { actionType: "plungeHigh", abilityId: "xiao-plungeHigh", damageType: "plunge" },
    ];
    for (const attack of cases) {
      const before = run(character, [{ characterId: character.id, actionType: attack.actionType }]);
      const during = run(character, [
        { characterId: character.id, actionType: "burst" },
        { characterId: character.id, actionType: attack.actionType },
      ]);
      const beforeHit = damageEvents(before).find((hit) => hit.abilityId === attack.abilityId);
      const stanceHit = damageEvents(during).find((hit) => hit.abilityId === attack.abilityId);
      expect(beforeHit).toMatchObject({ element: "physical", damageType: attack.damageType });
      expect(beforeHit?.finalDamage).toBeGreaterThan(0);
      expect(stanceHit).toMatchObject({ element: "anemo", damageType: attack.damageType });
      expect(stanceHit?.finalDamage).toBeGreaterThan(0);
    }
  });

  it("keeps Burst direct damage empty and ends the Anemo stance on swap", () => {
    const character = createXiaoDefinition();
    const other = { ...character, id: "xiao-swap-target", name: "Swap Target" };
    const stancePlunge = run(character, [
      { characterId: character.id, actionType: "burst" },
      { characterId: character.id, actionType: "plungeHigh" },
    ]);
    const swappedBack = simulateRotation([character, other], [
      { characterId: character.id, actionType: "burst" },
      { characterId: other.id, actionType: "swap" },
      { characterId: character.id, actionType: "swap" },
      { characterId: character.id, actionType: "plungeHigh" },
    ], testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(character) });

    expect(damageEvents(stancePlunge)).toHaveLength(1);
    expect(damageEvents(stancePlunge)[0]).toMatchObject({ abilityId: "xiao-plungeHigh", element: "anemo", damageType: "plunge" });
    expect(damageEvents(swappedBack).at(-1)).toMatchObject({ abilityId: "xiao-plungeHigh", element: "physical", damageType: "plunge" });
    expect(damageEvents(swappedBack).at(-1)?.finalDamage).toBeGreaterThan(0);
  });

  it("applies C3 skill and C5 Burst talent-level boosts only at their exact thresholds", () => {
    const skillDamage = (constellationLevel: number) => {
      const character = createXiaoDefinition(constellationLevel, { normal: 1, skill: 6, burst: 1 });
      const result = run(character, [{ characterId: character.id, actionType: "skill" }]);
      return damageEvents(result).find((hit) => hit.abilityId === "xiao-skill")?.finalDamage ?? 0;
    };
    const activeBoost = (constellationLevel: number, slot: "skill" | "burst") => {
      const character = createXiaoDefinition(constellationLevel);
      return character.constellations
        .filter((constellation) => constellation.level <= character.constellationLevel)
        .flatMap((constellation) => constellation.buffs ?? [])
        .flatMap((buff) => buff.talentLevelModifiers ?? [])
        .filter((modifier) => modifier.slot === slot)
        .reduce((sum, modifier) => sum + modifier.levels, 0);
    };

    expect(skillDamage(2)).toBeGreaterThan(0);
    expect(skillDamage(3)).toBeGreaterThan(skillDamage(2));
    expect(skillDamage(6)).toBe(skillDamage(3));
    expect(activeBoost(4, "burst")).toBe(0);
    expect(activeBoost(5, "burst")).toBe(3);
    expect(activeBoost(6, "burst")).toBe(3);
    expect(activeBoost(2, "skill")).toBe(0);
    expect(activeBoost(3, "skill")).toBe(3);
  });

  it("keeps unavailable conditional mechanics explicitly fail-closed", () => {
    const character = createXiaoDefinition(6);
    expect(character.burst.instances).toEqual([]);
    expect(character.burst.stance?.durationSeconds).toBe(XIAO_KIT_METADATA.burstDurationSeconds);
    expect(character.burst.stance?.endsOnSwap).toBe(true);
    expect(character.burst.stance?.infusion).toMatchObject({ element: "anemo", durationSeconds: 15, canBeOverridden: false });
    expect(XIAO_KIT_METADATA.unsupportedChannels).toContain("a1BurstDamageBonusTimeRamp");
    expect(XIAO_KIT_METADATA.unsupportedChannels).toContain("c6MultiOpponentPlungeSkillReset");
  });
});
