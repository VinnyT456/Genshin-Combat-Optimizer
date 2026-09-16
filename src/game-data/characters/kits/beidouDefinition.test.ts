import { describe, expect, it } from "vitest";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import { BEIDOU_KIT_METADATA, createBeidouDefinition } from "./beidouDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createBeidouDefinition>): SimulationSnapshot {
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

function firstDamage(character: ReturnType<typeof createBeidouDefinition>, actionType: "skill" | "burst") {
  const result = simulateRotation(
    [character],
    [{ characterId: character.id, actionType }],
    testEnemy,
    {
      critMode: "never",
      ...(actionType === "burst" ? { resumeFrom: fullEnergySnapshot(character) } : {}),
    },
  );
  const event = result.timeline.find((entry) => entry.type === "damage" && entry.characterId === character.id);
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No Beidou ${actionType} damage event`);
  }
  return event.damage.finalDamage;
}

describe("Beidou runtime kit", () => {
  it("executes the sourced Tidecaller skill damage", () => {
    expect(firstDamage(createBeidouDefinition(), "skill")).toBeGreaterThan(0);
  });

  it("executes the sourced Stormbreaker opening damage", () => {
    expect(firstDamage(createBeidouDefinition(), "burst")).toBeGreaterThan(0);
  });

  it("applies C3's verified Tidecaller talent increase to skill damage", () => {
    expect(firstDamage(createBeidouDefinition(3), "skill"))
      .toBeGreaterThan(firstDamage(createBeidouDefinition(0), "skill"));
    expect(BEIDOU_KIT_METADATA.c3SkillTalentLevels).toBe(3);
  });

  it("applies C5's verified Stormbreaker talent increase to burst damage", () => {
    expect(firstDamage(createBeidouDefinition(5), "burst"))
      .toBeGreaterThan(firstDamage(createBeidouDefinition(0), "burst"));
    expect(BEIDOU_KIT_METADATA.c5BurstTalentLevels).toBe(3);
  });

  it("preserves explicit talent levels for deterministic scaling", () => {
    const levelOne = createBeidouDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const levelTen = createBeidouDefinition(0, { normal: 10, skill: 10, burst: 10 });
    expect(firstDamage(levelTen, "skill")).toBeGreaterThan(firstDamage(levelOne, "skill"));
  });
});
