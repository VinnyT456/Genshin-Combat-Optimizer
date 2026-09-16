import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { harvestCharacterPerkBuffs } from "@/simulation/engine/perkBuffs";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { CITLALI_KIT_METADATA, createCitlaliDefinition } from "./citlaliDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createCitlaliDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(character: ReturnType<typeof createCitlaliDefinition>, actionType: "skill" | "burst") {
  return simulateRotation(
    [character],
    [{ characterId: character.id, actionType }],
    testEnemy,
    { critMode: "never", resumeFrom: actionType === "burst" ? fullEnergySnapshot(character) : undefined },
  );
}

describe("Citlali runtime kit", () => {
  it("executes sourced baseline skill damage", () => {
    const result = run(createCitlaliDefinition(0, { normal: 1, skill: 1, burst: 1 }), "skill");
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.find((entry) => entry.type === "damage")?.damage?.element).toBe("cryo");
  });

  it("adds A4's sourced EM scaling to Frostfall Storm and Ice Storm", () => {
    const locked = createCitlaliDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 3 });
    const unlocked = createCitlaliDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4 });
    expect(run(unlocked, "skill").totalDamage).toBeGreaterThan(run(locked, "skill").totalDamage);
    expect(run(unlocked, "burst").totalDamage).toBeGreaterThan(run(locked, "burst").totalDamage);
    expect(CITLALI_KIT_METADATA.a4SkillEmRatio).toBe(0.9);
    expect(CITLALI_KIT_METADATA.a4BurstEmRatio).toBe(12);
  });

  it("applies C2's sourced 125 EM self bonus through the perk buff path", () => {
    const c0 = createCitlaliDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4 });
    const c2 = createCitlaliDefinition(2, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4 });
    expect(harvestCharacterPerkBuffs(c2).map((buff) => buff.id)).toContain("citlali-c2-self-em");
    expect(run(c2, "skill").totalDamage).toBeGreaterThan(run(c0, "skill").totalDamage);
    expect(CITLALI_KIT_METADATA.c2SelfEm).toBe(125);
  });

  it("adds C4's sourced 1800% EM skull when Frostfall Storm hits", () => {
    const c0 = createCitlaliDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c4 = createCitlaliDefinition(4, { normal: 1, skill: 1, burst: 1 });
    expect(run(c4, "skill").totalDamage).toBeGreaterThan(run(c0, "skill").totalDamage);
    expect(c0.skill.instances).toHaveLength(2);
    expect(c4.skill.instances).toHaveLength(3);
    expect(CITLALI_KIT_METADATA.c4SkullEmRatio).toBe(18);
  });

  it("retains generated C3 skill and C5 burst talent boosts", () => {
    const c0 = createCitlaliDefinition(0);
    const c3 = createCitlaliDefinition(3);
    const c5 = createCitlaliDefinition(5);
    expect(run(c3, "skill").totalDamage).toBeGreaterThan(run(c0, "skill").totalDamage);
    expect(run(c5, "burst").totalDamage).toBeGreaterThan(run(c0, "burst").totalDamage);
  });
});
