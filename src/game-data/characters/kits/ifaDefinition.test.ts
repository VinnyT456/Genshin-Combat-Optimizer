import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { IFA_KIT_METADATA, createIfaDefinition } from "./ifaDefinition";

function fullEnergySnapshot(...characters: GenericCharacterDefinition[]): SimulationSnapshot {
  return {
    time: 0,
    activeCharacterId: characters[0]?.id ?? "ifa",
    characters: Object.fromEntries(characters.map((character): [string, CharacterSnapshot] => [
      character.id,
      {
        characterId: character.id,
        energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
        cooldowns: {},
        normalStringIndex: 0,
      },
    ])),
  };
}

describe("Ifa runtime kit", () => {
  it("executes the generated baseline skill damage", () => {
    const ifa = createIfaDefinition();
    const result = simulateRotation([ifa], [{ characterId: ifa.id, actionType: "skill" }], testEnemy, { critMode: "never" });

    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C4's post-Burst EM to a later Swirl reaction", () => {
    const c0 = createIfaDefinition(0);
    const c4 = createIfaDefinition(4);
    const pyroSource: GenericCharacterDefinition = {
      ...c0,
      id: "ifa-pyro-source",
      name: "Synthetic Pyro Source",
      element: "pyro",
      skill: {
        ...c0.skill,
        id: "ifa-pyro-source-skill",
        instances: c0.skill.instances.map((instance) => ({
          ...instance,
          element: "pyro",
          application: { element: "pyro", gauge: 1 },
        })),
      },
    };
    const rotation = [
      { characterId: "ifa", actionType: "burst" as const },
      { characterId: pyroSource.id, actionType: "swap" as const },
      { characterId: pyroSource.id, actionType: "skill" as const },
      { characterId: "ifa", actionType: "swap" as const },
      { characterId: "ifa", actionType: "normal" as const },
    ];
    const c0Result = simulateRotation([c0, pyroSource], rotation, testEnemy, {
      critMode: "never",
      resumeFrom: fullEnergySnapshot(c0, pyroSource),
    });
    const c4Result = simulateRotation([c4, pyroSource], rotation, testEnemy, {
      critMode: "never",
      resumeFrom: fullEnergySnapshot(c4, pyroSource),
    });

    expect(c4Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
  });

  it("uses C3 and C5 talent-level boosts in actual damage output", () => {
    const c0 = createIfaDefinition(0);
    const c3 = createIfaDefinition(3);
    const c5 = createIfaDefinition(5);
    const skill = [{ characterId: "ifa", actionType: "skill" as const }];
    const burst = [{ characterId: "ifa", actionType: "burst" as const }];
    const c0Skill = simulateRotation([c0], skill, testEnemy, { critMode: "never" });
    const c3Skill = simulateRotation([c3], skill, testEnemy, { critMode: "never" });
    const c0Burst = simulateRotation([c0], burst, testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c5Burst = simulateRotation([c5], burst, testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c5) });

    expect(c3Skill.totalDamage).toBeGreaterThan(c0Skill.totalDamage);
    expect(c5Burst.totalDamage).toBeGreaterThan(c0Burst.totalDamage);
  });

  it("documents unsupported conditional kit channels without activating them", () => {
    expect(IFA_KIT_METADATA.unsupportedChannels).toContain("a1RescueEssentialsResourceAndReactionDamageBonus");
    expect(IFA_KIT_METADATA.unsupportedChannels).toContain("c6HoldSupportingFireChanceAndAdditionalTonicshot");
  });
});
