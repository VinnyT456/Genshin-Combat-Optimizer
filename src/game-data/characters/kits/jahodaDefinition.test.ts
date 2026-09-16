import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { JAHODA_KIT_METADATA, createJahodaDefinition } from "./jahodaDefinition";

function fullEnergySnapshot(...characters: GenericCharacterDefinition[]): SimulationSnapshot {
  return {
    time: 0,
    activeCharacterId: characters[0]?.id ?? "jahoda",
    characters: Object.fromEntries(
      characters.map(
        (character): [string, CharacterSnapshot] => [
          character.id,
          {
            characterId: character.id,
            energy: {
              current: character.maxEnergy,
              max: character.maxEnergy,
              totalGained: character.maxEnergy,
              totalSpent: 0,
            },
            cooldowns: {},
            normalStringIndex: 0,
          },
        ],
      ),
    ),
  };
}

describe("Jahoda runtime kit", () => {
  it("executes generated baseline skill damage", () => {
    const jahoda = createJahodaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const result = simulateRotation(
      [jahoda],
      [{ characterId: jahoda.id, actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    );

    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies A1's Pyro-dominant 130% robot damage branch", () => {
    const baseline = createJahodaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const enhanced = createJahodaDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      {},
      { pyroCount: 1, hydroCount: 0, electroCount: 0, cryoCount: 0 },
    );
    const rotation = [{ characterId: baseline.id, actionType: "burst" as const }];
    const baselineResult = simulateRotation([baseline], rotation, testEnemy, {
      critMode: "never",
      resumeFrom: fullEnergySnapshot(baseline),
    });
    const enhancedResult = simulateRotation(
      [enhanced],
      [{ characterId: enhanced.id, actionType: "burst" }],
      testEnemy,
      { critMode: "never", resumeFrom: fullEnergySnapshot(enhanced) },
    );

    expect(enhancedResult.totalDamage).toBeGreaterThan(baselineResult.totalDamage);
  });

  it("keeps A1 inactive before ascension 1 and for non-Pyro dominance", () => {
    const locked = createJahodaDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      { ascensionPhase: 0 },
      { pyroCount: 1 },
    );
    const nonPyro = createJahodaDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      {},
      { hydroCount: 2, pyroCount: 1 },
    );
    const unlocked = createJahodaDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      { ascensionPhase: 1 },
      { pyroCount: 1 },
    );
    const run = (character: GenericCharacterDefinition) =>
      simulateRotation(
        [character],
        [{ characterId: character.id, actionType: "burst" }],
        testEnemy,
        { critMode: "never", resumeFrom: fullEnergySnapshot(character) },
      ).totalDamage;

    expect(run(locked)).toBe(run(nonPyro));
    expect(run(unlocked)).toBeGreaterThan(run(locked));
  });

  it("uses sourced C3 and C5 talent boosts in actual damage output", () => {
    const c0 = createJahodaDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const c3 = createJahodaDefinition(3, { normal: 1, skill: 10, burst: 10 });
    const c5 = createJahodaDefinition(5, { normal: 1, skill: 10, burst: 10 });
    const skill = [{ characterId: c0.id, actionType: "skill" as const }];
    const burst = [{ characterId: c0.id, actionType: "burst" as const }];
    const c0Skill = simulateRotation([c0], skill, testEnemy, { critMode: "never" });
    const c5Skill = simulateRotation([c5], [{ characterId: c5.id, actionType: "skill" }], testEnemy, {
      critMode: "never",
    });
    const c0Burst = simulateRotation([c0], burst, testEnemy, {
      critMode: "never",
      resumeFrom: fullEnergySnapshot(c0),
    });
    const c3Burst = simulateRotation([c3], [{ characterId: c3.id, actionType: "burst" }], testEnemy, {
      critMode: "never",
      resumeFrom: fullEnergySnapshot(c3),
    });

    expect(c5Skill.totalDamage).toBeGreaterThan(c0Skill.totalDamage);
    expect(c3Burst.totalDamage).toBeGreaterThan(c0Burst.totalDamage);
  });

  it("documents unsupported conditional channels without activating them", () => {
    expect(JAHODA_KIT_METADATA.unsupportedChannels).toContain("c1MeowballBounceChanceAndNearbyDamage");
    expect(JAHODA_KIT_METADATA.unsupportedChannels).toContain("c6MoonsignPartyCritBuffAfterFullFlask");
  });
});
