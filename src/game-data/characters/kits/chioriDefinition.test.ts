import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { CHIORI_KIT_METADATA, createChioriDefinition } from "./chioriDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createChioriDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

describe("Chiori runtime kit", () => {
  it("executes the sourced two-hit Geo skill", () => {
    const character = createChioriDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const result = simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, { critMode: "never" });
    const hits = result.timeline.filter((event) => event.type === "damage");

    expect(hits).toHaveLength(2);
    expect(hits.every((event) => event.damage?.element === "geo")).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("triggers A1's sourced 100% upward-sweep coordinated attack on Normal Attack", () => {
    const c0 = createChioriDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const result = simulateRotation(
      [c0],
      [
        { characterId: c0.id, actionType: "skill" },
        { characterId: c0.id, actionType: "normal" },
      ],
      testEnemy,
      { critMode: "never" },
    );
    const coordinated = result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId.includes("chiori-a1-tamoto-coordinated"),
    );

    expect(coordinated).toHaveLength(1);
    expect(coordinated[0]?.damage?.element).toBe("geo");
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("adds C2 Kinu's 170% Tamoto skill damage after Burst", () => {
    const c0 = createChioriDefinition(0);
    const c2 = createChioriDefinition(2);
    const rotation = [
      { characterId: c0.id, actionType: "burst" as const },
      ...Array.from({ length: 10 }, () => ({ characterId: c0.id, actionType: "normal" as const })),
    ];
    const c0Result = simulateRotation([c0], rotation, testEnemy, { critMode: "never", timeLimit: 5, resumeFrom: fullEnergySnapshot(c0) });
    const c2Result = simulateRotation([c2], rotation, testEnemy, { critMode: "never", timeLimit: 5, resumeFrom: fullEnergySnapshot(c2) });

    expect(c2Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c2Result.timeline.some((event) => event.type === "damage" && event.damage?.abilityId.includes("chiori-c2-kinu"))).toBe(true);
    expect(CHIORI_KIT_METADATA.c2KinuRatio).toBe(1.7);
  });

  it("adds C6's sourced 235% DEF Normal Attack damage", () => {
    const c0 = createChioriDefinition(0);
    const c6 = createChioriDefinition(6);
    const rotation = [{ characterId: c0.id, actionType: "normal" as const }];
    const c0Result = simulateRotation([c0], rotation, testEnemy, { critMode: "never" });
    const c6Result = simulateRotation([c6], rotation, testEnemy, { critMode: "never" });

    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c6.normalAttacks?.hits[0]?.instances[0]?.scaling.at(-1)).toMatchObject({ stat: "def" });
    expect(CHIORI_KIT_METADATA.c6NormalDefRatio).toBe(2.35);
  });

  it("applies A4's sourced 20% Geo DMG bonus only with explicit construct state", () => {
    const withoutConstruct = createChioriDefinition(0, undefined, {}, { nearbyGeoConstruct: false });
    const withConstruct = createChioriDefinition(0, undefined, {}, { nearbyGeoConstruct: true });
    const rotation = [{ characterId: withoutConstruct.id, actionType: "skill" as const }];
    const base = simulateRotation([withoutConstruct], rotation, testEnemy, { critMode: "never" });
    const boosted = simulateRotation([withConstruct], rotation, testEnemy, { critMode: "never" });

    expect(boosted.totalDamage).toBeGreaterThan(base.totalDamage);
    expect(withConstruct.passives.find((passive) => passive.id === "chiori-a4")?.buffs).toHaveLength(1);
    expect(CHIORI_KIT_METADATA.a4GeoDmgBonus).toBe(0.2);
  });
});
