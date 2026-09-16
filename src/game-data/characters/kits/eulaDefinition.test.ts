import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { EULA_KIT_METADATA, createEulaDefinition } from "./eulaDefinition";

const noCrit = { critMode: "never" as const };

function fullEnergySnapshot(character: ReturnType<typeof createEulaDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(character: ReturnType<typeof createEulaDefinition>, actionType: "skill" | "burst") {
  return simulateRotation(
    [character],
    [{ characterId: character.id, actionType }],
    testEnemy,
    actionType === "burst" ? { ...noCrit, resumeFrom: fullEnergySnapshot(character) } : noCrit,
  );
}

describe("Eula runtime kit", () => {
  it("executes sourced Cryo skill and Lightfall burst damage", () => {
    expect(run(createEulaDefinition(), "skill").totalDamage).toBeGreaterThan(0);
    expect(run(createEulaDefinition(), "burst").totalDamage).toBeGreaterThan(0);
  });

  it("tracks a Grimheart stack from Icetide Vortex", () => {
    const result = run(createEulaDefinition(), "skill");
    expect(result.finalState.characters.eula?.resources?.[EULA_KIT_METADATA.grimheartResourceId]?.value).toBe(1);
  });

  it("applies generated C3 burst and C5 skill talent boosts to damage", () => {
    expect(run(createEulaDefinition(3), "burst").totalDamage).toBeGreaterThan(run(createEulaDefinition(0), "burst").totalDamage);
    expect(run(createEulaDefinition(5), "skill").totalDamage).toBeGreaterThan(run(createEulaDefinition(0), "skill").totalDamage);
  });

  it("adds C6's guaranteed five Lightfall starting stacks to burst damage", () => {
    const c0 = run(createEulaDefinition(0), "burst");
    const c6 = run(createEulaDefinition(6), "burst");
    expect(c6.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(c6.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
  });
});
