import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { KINICH_KIT_METADATA, createKinichDefinition } from "./kinichDefinition";

const noCrit = { critMode: "never" as const };

function runSkill(constellationLevel: number) {
  const character = createKinichDefinition(constellationLevel);
  return simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, noCrit);
}

function runBurst(constellationLevel: number) {
  const character = createKinichDefinition(constellationLevel);
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "burst" }],
    testEnemy,
    noCrit,
  );
}

describe("Kinich runtime kit", () => {
  it("executes the generated Loop Shots, Cannon, and Burst damage", () => {
    const skill = runSkill(0);
    const burst = runBurst(0);
    expect(skill.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
    expect(burst.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(0);
  });

  it("applies C2's executable +100% Scalespiker Cannon scaling", () => {
    const c0 = runSkill(0);
    const c2 = runSkill(2);
    const c0Cannon = c0.timeline.filter((event) => event.type === "damage")[2];
    const c2Cannon = c2.timeline.filter((event) => event.type === "damage")[2];
    expect(c2Cannon?.damage?.finalDamage).toBeGreaterThan(c0Cannon?.damage?.finalDamage ?? 0);
    expect(c2.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(KINICH_KIT_METADATA.c2CannonBonus).toBe(1);
  });

  it("applies C4's +70% Burst DMG to actual Burst output", () => {
    const c3 = runBurst(3).totalDamage;
    const c4 = runBurst(4).totalDamage;
    expect(c4 / c3).toBeCloseTo(1.7, 8);
    expect(KINICH_KIT_METADATA.c4BurstDmgBonus).toBe(0.7);
  });

  it("adds C6's sourced 700% ATK bounce as a fourth skill hit", () => {
    const c5 = runSkill(5);
    const c6 = runSkill(6);
    expect(c5.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
    expect(c6.timeline.filter((event) => event.type === "damage")).toHaveLength(4);
    expect(c6.totalDamage).toBeGreaterThan(c5.totalDamage);
    expect(KINICH_KIT_METADATA.c6BounceScaling).toBe(7);
  });
});
