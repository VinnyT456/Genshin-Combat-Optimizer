import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { FLINS_KIT_METADATA, createFlinsDefinition } from "./flinsDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createFlinsDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function damage(character: ReturnType<typeof createFlinsDefinition>, actions: Array<"skill" | "normal" | "burst">): number {
  const result = simulateRotation(
    [character],
    actions.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    { critMode: "never", resumeFrom: fullEnergySnapshot(character) },
  );
  return result.totalDamage;
}

describe("Flins runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const character = createFlinsDefinition();
    expect(damage(character, ["skill"])).toBeGreaterThan(0);
    expect(damage(character, ["burst"])).toBeGreaterThan(0);
  });

  it("enters Manifest Flame and infuses the following normal attack with Electro", () => {
    const character = createFlinsDefinition();
    const result = simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill" }, { characterId: character.id, actionType: "normal" }],
      testEnemy,
      { critMode: "never" },
    );
    const normalHit = result.timeline.find(
      (entry) => entry.type === "damage" && entry.characterId === character.id && entry.damage?.abilityId.startsWith("flins-na-"),
    );
    expect(normalHit?.type).toBe("damage");
    expect(normalHit?.type === "damage" ? normalHit.damage?.element : undefined).toBe("electro");
  });

  it("applies C4's ATK bonus to real skill damage", () => {
    expect(damage(createFlinsDefinition(4), ["skill"])).toBeGreaterThan(damage(createFlinsDefinition(0), ["skill"]));
  });

  it("executes generated C3 burst and C5 skill talent boosts", () => {
    expect(damage(createFlinsDefinition(3), ["burst"])).toBeGreaterThan(damage(createFlinsDefinition(0), ["burst"]));
    expect(damage(createFlinsDefinition(5), ["skill"])).toBeGreaterThan(damage(createFlinsDefinition(0), ["skill"]));
  });

  it("records unsupported Lunar-Charged channels instead of inventing reaction math", () => {
    expect(FLINS_KIT_METADATA.unsupportedChannels).toContain("oldWorldSecretsElectroChargedToLunarChargedConversion");
  });
});
