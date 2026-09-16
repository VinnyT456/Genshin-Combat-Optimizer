import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { CHONGYUN_KIT_METADATA, createChongyunDefinition } from "./chongyunDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createChongyunDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

describe("Chongyun runtime kit", () => {
  it("executes the sourced baseline skill damage", () => {
    const character = createChongyunDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const result = simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.find((entry) => entry.type === "damage")?.damage?.element).toBe("cryo");
  });

  it("adds C1's three sourced 50% ATK Cryo blades to the final normal hit", () => {
    const c0 = createChongyunDefinition(0, { normal: 10, skill: 1, burst: 1 });
    const c1 = createChongyunDefinition(1, { normal: 10, skill: 1, burst: 1 });
    const rotation = Array.from({ length: 4 }, () => ({ characterId: c0.id, actionType: "normal" as const }));
    const c0Result = simulateRotation([c0], rotation, testEnemy, { critMode: "never" });
    const c1Result = simulateRotation([c1], rotation.map(() => ({ characterId: c1.id, actionType: "normal" as const })), testEnemy, { critMode: "never" });
    expect(c1Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c1.normalAttacks.hits.at(-1)?.instances).toHaveLength(4);
    expect(CHONGYUN_KIT_METADATA.c1BladeAtkRatio).toBe(0.5);
  });

  it("adds C6's additional spirit blade to burst damage", () => {
    const c0 = createChongyunDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c6 = createChongyunDefinition(6, { normal: 1, skill: 1, burst: 10 });
    const c0Result = simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c6Result = simulateRotation([c6], [{ characterId: c6.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c6) });
    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c6.burst.instances).toHaveLength(2);
  });

  it("retains generated C3 burst and C5 skill talent boosts", () => {
    const c0 = createChongyunDefinition(0);
    const c3 = createChongyunDefinition(3);
    const c5 = createChongyunDefinition(5);
    const c0Burst = simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c3Burst = simulateRotation([c3], [{ characterId: c3.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c3) });
    const c0Skill = simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const c5Skill = simulateRotation([c5], [{ characterId: c5.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    expect(c3Burst.totalDamage).toBeGreaterThan(c0Burst.totalDamage);
    expect(c5Skill.totalDamage).toBeGreaterThan(c0Skill.totalDamage);
  });
});
