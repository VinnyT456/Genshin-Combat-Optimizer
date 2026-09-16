import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { testEnemy } from "@/game-data";
import { BAIZHU_C6_METADATA, createBaizhuDefinition } from "./baizhuDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createBaizhuDefinition>): SimulationSnapshot {
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

function burstDamage(character: ReturnType<typeof createBaizhuDefinition>): number {
  const result = simulateRotation([character], [{ characterId: character.id, actionType: "burst" }], testEnemy, {
    critMode: "never",
    resumeFrom: fullEnergySnapshot(character),
  });
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === character.id,
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error("No Baizhu burst damage event");
  }
  return event.damage.finalDamage;
}

describe("Baizhu runtime kit", () => {
  it("executes the sourced Universal Diagnosis skill damage", () => {
    const character = createBaizhuDefinition();
    const result = simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, {
      critMode: "never",
    });
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("executes the sourced Spiritvein burst damage", () => {
    expect(burstDamage(createBaizhuDefinition())).toBeGreaterThan(0);
  });

  it("adds C6's verified 8% Max HP Spiritvein scaling to burst damage", () => {
    const c0 = createBaizhuDefinition(0);
    const c6 = createBaizhuDefinition(6);
    expect(burstDamage(c6)).toBeGreaterThan(burstDamage(c0));
    expect(BAIZHU_C6_METADATA.spiritveinMaxHpRatio).toBe(0.08);
  });

  it("keeps C3 and C5 talent boosts on the generated damage tables", () => {
    expect(burstDamage(createBaizhuDefinition(3))).toBeGreaterThan(burstDamage(createBaizhuDefinition(0)));
    const c0 = createBaizhuDefinition(0);
    const c5 = createBaizhuDefinition(5);
    const c0Skill = simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const c5Skill = simulateRotation([c5], [{ characterId: c5.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    expect(c5Skill.totalDamage).toBeGreaterThan(c0Skill.totalDamage);
  });
});
