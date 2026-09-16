import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import {
  CHEVREUSE_KIT_METADATA,
  createChevreuseDefinition,
} from "./chevreuseDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createChevreuseDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: {
      current: character.maxEnergy,
      max: character.maxEnergy,
      totalGained: character.maxEnergy,
      totalSpent: 0,
    },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function skillDamage(constellationLevel: number, talentLevels = { normal: 1, skill: 10, burst: 1 }) {
  const character = createChevreuseDefinition(constellationLevel, talentLevels);
  const result = simulateRotation(
    [character],
    [{ characterId: character.id, actionType: "skill" }],
    testEnemy,
    { critMode: "never" },
  );
  return result.totalDamage;
}

describe("Chevreuse runtime kit", () => {
  it("executes sourced skill and burst damage", () => {
    const character = createChevreuseDefinition(0);
    const skill = simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const burst = simulateRotation([character], [{ characterId: character.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(character) });
    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(0);
  });

  it("adds C2's two verified 120% ATK chain explosions to skill damage", () => {
    expect(skillDamage(2)).toBeGreaterThan(skillDamage(0));
    expect(CHEVREUSE_KIT_METADATA.c2ExplosionAtkRatio).toBe(1.2);
  });

  it("keeps the sourced C3 skill and C5 burst talent boosts executable", () => {
    expect(skillDamage(3)).toBeGreaterThan(skillDamage(0));
    const c0 = createChevreuseDefinition(0);
    const c5 = createChevreuseDefinition(5);
    const c0Burst = simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c5Burst = simulateRotation([c5], [{ characterId: c5.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c5) });
    expect(c5Burst.totalDamage).toBeGreaterThan(c0Burst.totalDamage);
  });
});
