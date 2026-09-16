import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { testEnemy } from "@/game-data";
import { DIONA_KIT_METADATA, createDionaDefinition } from "./dionaDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createDionaDefinition>): SimulationSnapshot {
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

function skillDamage(character: ReturnType<typeof createDionaDefinition>): number {
  return simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, {
    critMode: "never",
  }).totalDamage;
}

function burstDamage(character: ReturnType<typeof createDionaDefinition>): number {
  return simulateRotation([character], [{ characterId: character.id, actionType: "burst" }], testEnemy, {
    critMode: "never",
    resumeFrom: fullEnergySnapshot(character),
  }).totalDamage;
}

describe("Diona runtime kit", () => {
  it("executes sourced Icy Paws and Signature Mix damage", () => {
    expect(skillDamage(createDionaDefinition())).toBeGreaterThan(0);
    expect(burstDamage(createDionaDefinition())).toBeGreaterThan(0);
  });

  it("applies C2's verified 15% Icy Paws damage increase", () => {
    expect(skillDamage(createDionaDefinition(2))).toBeCloseTo(
      skillDamage(createDionaDefinition(0)) * 1.15,
      8,
    );
    expect(DIONA_KIT_METADATA.c2SkillDamageBonus).toBe(0.15);
  });

  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    expect(burstDamage(createDionaDefinition(3))).toBeGreaterThan(burstDamage(createDionaDefinition(0)));
    expect(skillDamage(createDionaDefinition(5))).toBeGreaterThan(skillDamage(createDionaDefinition(0)));
  });

  it("uses the configured talent level for skill scaling", () => {
    expect(skillDamage(createDionaDefinition(0, { normal: 1, skill: 10, burst: 1 }))).toBeGreaterThan(
      skillDamage(createDionaDefinition(0, { normal: 1, skill: 1, burst: 1 })),
    );
  });
});
