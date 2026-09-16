import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createAlbedoDefinition } from "./albedoDefinition";
import { ILLUGA_KIT_METADATA, createIllugaDefinition } from "./illugaDefinition";

const noCrit = { critMode: "never" as const };
const expectedCrit = { critMode: "expected" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

describe("Illuga runtime kit", () => {
  it("executes the sourced Geo skill damage", () => {
    const result = simulateRotation(
      [createIllugaDefinition(0, { normal: 1, skill: 10, burst: 1 })],
      [{ characterId: "illuga", actionType: "skill" }],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result)).toHaveLength(2);
    expect(damageEvents(result)[0]?.damage?.element).toBe("geo");
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("increases sourced Skill damage at C5", () => {
    const c0 = createIllugaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createIllugaDefinition(5, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: "illuga", actionType: "skill" as const }];

    expect(simulateRotation([c5], rotation, testEnemy, noCrit).totalDamage).toBeGreaterThan(
      simulateRotation([c0], rotation, testEnemy, noCrit).totalDamage,
    );
  });

  it("increases sourced Burst damage at C3", () => {
    const c0 = createIllugaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createIllugaDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: "illuga", actionType: "burst" as const }];

    expect(simulateRotation([{ ...c3, burst: { ...c3.burst, energyCost: 0 } }], rotation, testEnemy, noCrit).totalDamage).toBeGreaterThan(
      simulateRotation([{ ...c0, burst: { ...c0.burst, energyCost: 0 } }], rotation, testEnemy, noCrit).totalDamage,
    );
  });

  it("buffs a different active Geo party member after Skill, with a stronger C6", () => {
    const albedo = createAlbedoDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const rotation = [
      { characterId: "illuga", actionType: "skill" as const },
      { characterId: "albedo", actionType: "skill" as const },
    ];
    const c0 = createIllugaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c6 = createIllugaDefinition(6, { normal: 1, skill: 1, burst: 1 });
    const c0Damage = simulateRotation([c0, albedo], rotation, testEnemy, expectedCrit).totalDamage;
    const c6Damage = simulateRotation([c6, albedo], rotation, testEnemy, expectedCrit).totalDamage;

    expect(c6Damage).toBeGreaterThan(c0Damage);
    expect(ILLUGA_KIT_METADATA.lightkeepersOathDurationSeconds).toBe(20);
    expect(ILLUGA_KIT_METADATA.c6CritDamage).toBe(0.3);
  });
});
