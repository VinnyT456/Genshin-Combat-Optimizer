import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { CHASCA_KIT_METADATA, createChascaDefinition } from "./chascaDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createChascaDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

describe("Chasca runtime kit", () => {
  it("executes the sourced skill and burst damage rows", () => {
    const character = createChascaDefinition();
    const skill = simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const burst = simulateRotation([character], [{ characterId: character.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(character) });
    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(0);
  });

  it("wires C2's sourced 400% ATK charged-type AoE into skill damage", () => {
    const c0 = createChascaDefinition(0);
    const c2 = createChascaDefinition(2);
    const c0Result = simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const c2Result = simulateRotation([c2], [{ characterId: c2.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    expect(c2Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c2.skill.instances.at(-1)).toMatchObject({ damageType: "charged" });
    expect(CHASCA_KIT_METADATA.c2AoeAtkRatio).toBe(4);
  });

  it("wires C4's sourced AoE and 1.5 self-energy restore", () => {
    const c0 = createChascaDefinition(0);
    const c4 = createChascaDefinition(4);
    const c0Result = simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c4Result = simulateRotation([c4], [{ characterId: c4.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c4) });
    expect(c4Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c4Result.finalState.characters[c4.id]?.energy.current).toBe(CHASCA_KIT_METADATA.c4EnergyRestore);
    expect(CHASCA_KIT_METADATA.c4AoeAtkRatio).toBe(4);
  });

  it("retains generated talent scaling and C3/C5 talent boosts", () => {
    const c0 = createChascaDefinition(0);
    const c3 = createChascaDefinition(3);
    const c5 = createChascaDefinition(5);
    const c0Skill = simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const c3Skill = simulateRotation([c3], [{ characterId: c3.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const c0Burst = simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c5Burst = simulateRotation([c5], [{ characterId: c5.id, actionType: "burst" }], testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c5) });
    expect(c3Skill.totalDamage).toBeGreaterThan(c0Skill.totalDamage);
    expect(c5Burst.totalDamage).toBeGreaterThan(c0Burst.totalDamage);
  });
});
