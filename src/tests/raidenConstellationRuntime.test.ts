import { describe, expect, it } from "vitest";
import { generatedCharactersById } from "@/game-data/characters/generated";
import { createRaidenShogunDefinition } from "@/game-data/characters/kits/raidenShogunDefinition";
import { raidenArtifactStateEffects } from "@/game-data/characters/kits/raidenShogunDefinition";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { testEnemy } from "@/game-data";

function fullEnergySnapshot(
  characters: readonly GenericCharacterDefinition[],
): SimulationSnapshot {
  const entries: Record<string, CharacterSnapshot> = {};
  for (const character of characters) {
    entries[character.id] = {
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
  }
  return { time: 0, characters: entries };
}

describe("Raiden Shogun constellation runtime", () => {
  it("gains Resolve from burst energy and applies C1 source-element multipliers", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      const result = simulateRotation(
        [raiden, bennett],
        [
          { characterId: bennett.id, actionType: "burst" },
          { characterId: raiden.id, actionType: "burst" },
        ],
        testEnemy,
        {
          critMode: "never",
          resumeFrom: fullEnergySnapshot([raiden, bennett]),
        },
      );
      return result.timeline.find(
        (event) =>
          event.type === "resource" &&
          event.resource?.resourceId === "raiden-resolve" &&
          event.resource.kind === "gain",
      )?.resource?.amount;
    };

    // Bennett's 60-cost burst contributes 12 Resolve at C0. C1 raises that
    // teammate gain to 14.4; Raiden's own burst is excluded from this event.
    expect(run(0)).toBeCloseTo(12);
    expect(run(1)).toBeCloseTo(14.4);
  });

  it("uses cast-snapshotted Resolve for the initial slash and Musou Isshin hits", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      const result = simulateRotation(
        [raiden, bennett],
        [
          { characterId: bennett.id, actionType: "burst" },
          { characterId: raiden.id, actionType: "burst" },
          { characterId: raiden.id, actionType: "normal" },
        ],
        testEnemy,
        {
          critMode: "never",
          resumeFrom: fullEnergySnapshot([raiden, bennett]),
        },
      );
      return {
        initial: result.timeline.find(
          (event) =>
            event.type === "damage" &&
            event.characterId === raiden.id &&
            event.description.includes("Secret Art") &&
            event.timestamp === 1.5,
        )?.damage?.finalDamage,
        normal: result.timeline.find(
          (event) =>
            event.type === "damage" &&
            event.characterId === raiden.id &&
            event.description.includes("第1段伤害（梦想一心）"),
        )?.damage?.finalDamage,
      };
    };

    const c0 = run(0);
    const c1 = run(1);
    expect(c1.initial).toBeGreaterThan(c0.initial ?? 0);
    expect(c1.normal).toBeGreaterThan(c0.normal ?? 0);
  });

  it("applies C4 only after Dreams stance ends and excludes Raiden", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      const rotation = [
        { characterId: raiden.id, actionType: "burst" as const },
        ...Array.from({ length: 18 }, () => ({
          characterId: raiden.id,
          actionType: "normal" as const,
        })),
        { characterId: bennett.id, actionType: "skill" as const },
      ];
      return simulateRotation(
        [raiden, bennett],
        rotation,
        testEnemy,
        {
          critMode: "never",
          resumeFrom: fullEnergySnapshot([raiden, bennett]),
        },
      );
    };

    const c0 = run(0);
    const c4 = run(4);
    expect(c4.damageByAbility["bennett-skill"] ?? 0).toBeGreaterThan(
      c0.damageByAbility["bennett-skill"] ?? 0,
    );
    const lastRaidenC0 = c0.timeline.findLast(
      (event) => event.type === "damage" && event.characterId === "raiden-shogun" && event.timestamp > 8,
    );
    const lastRaidenC4 = c4.timeline.findLast(
      (event) => event.type === "damage" && event.characterId === "raiden-shogun" && event.timestamp > 8,
    );
    expect(lastRaidenC0?.damage?.finalDamage).toBeCloseTo(lastRaidenC4?.damage?.finalDamage ?? 0);
  });

  it("applies C2 DEF ignore to Raiden burst damage", () => {
    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      return simulateRotation(
        [raiden],
        [{ characterId: raiden.id, actionType: "burst" }],
        { ...testEnemy, level: 100 },
        {
          critMode: "never",
          resumeFrom: fullEnergySnapshot([raiden]),
        },
      ).totalDamage;
    };

    expect(run(2)).toBeGreaterThan(run(0));
  });

  it("applies Eye's Burst-DMG bonus from the target burst cost", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const damage = (withEye: boolean) => {
      const raiden = createRaidenShogunDefinition();
      const result = simulateRotation(
        [raiden, bennett],
        withEye
          ? [
              { characterId: raiden.id, actionType: "skill" as const },
              { characterId: bennett.id, actionType: "burst" as const },
            ]
          : [{ characterId: bennett.id, actionType: "burst" as const }],
        testEnemy,
        { critMode: "never", resumeFrom: fullEnergySnapshot([raiden, bennett]) },
      );
      return result.timeline.find(
        (event) =>
          event.type === "damage" &&
          event.characterId === bennett.id &&
          event.damage?.abilityId?.includes("bennett-burst"),
      )?.damage?.finalDamage ?? 0;
    };

    expect(damage(true)).toBeCloseTo(damage(false) * 1.18, 8);
  });

  it("restores party Energy five times and scales it with Raiden A4 ER", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const run = (ascensionPhase: number) => {
      const raiden = createRaidenShogunDefinition();
      const resume = fullEnergySnapshot([raiden, bennett]);
      resume.characters[bennett.id]!.energy.current = 0;
      resume.characters[bennett.id]!.energy.totalGained = 0;
      const result = simulateRotation(
        [raiden, bennett],
        [
          { characterId: raiden.id, actionType: "burst" },
          ...Array.from({ length: 18 }, () => ({
            characterId: raiden.id,
            actionType: "normal" as const,
          })),
        ],
        testEnemy,
        {
          critMode: "never",
          artifactStateEffects: raidenArtifactStateEffects(raiden.id, 0, 10, ascensionPhase),
          resumeFrom: resume,
        },
      );
      return {
        result,
        energyEvents: result.timeline.filter(
          (event) =>
            event.type === "energy" &&
            event.characterId === bennett.id &&
            event.description.includes("Raiden Shogun"),
        ),
      };
    };

    const a4 = run(6);
    const preA4 = run(3);
    expect(a4.energyEvents).toHaveLength(5);
    expect(preA4.energyEvents).toHaveLength(5);
    expect(a4.result.finalState.characters[bennett.id]?.energy.current).toBeCloseTo(14.9, 8);
    expect(preA4.result.finalState.characters[bennett.id]?.energy.current).toBeCloseTo(12.5, 8);
  });

  it("routes Eye's expected particle into A1 Resolve with its cooldown", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");
    const raiden = createRaidenShogunDefinition();
    const result = simulateRotation(
      [raiden, bennett],
      [
        { characterId: raiden.id, actionType: "skill" },
        { characterId: bennett.id, actionType: "normal" },
      ],
      testEnemy,
    );
    expect(result.timeline.find(
      (event) =>
        event.type === "resource" &&
        event.resource?.resourceId === "raiden-resolve" &&
        event.resource.kind === "gain",
    )?.resource?.amount).toBeCloseTo(1, 8);
  });

  it("applies the generated +3 burst talent row at C3", () => {
    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      return simulateRotation(
        [raiden],
        [{ characterId: raiden.id, actionType: "burst" }],
        testEnemy,
        {
          critMode: "never",
          resumeFrom: fullEnergySnapshot([raiden]),
        },
      ).totalDamage;
    };

    expect(run(3)).toBeGreaterThan(run(0));
  });

  it("reduces other burst cooldowns from stance hits at one-second ICD, max five", () => {
    const bennett = generatedCharactersById.get("bennett");
    if (!bennett) throw new Error("Bennett generated definition missing");

    const run = (constellationLevel: number) => {
      const raiden = createRaidenShogunDefinition(constellationLevel);
      const result = simulateRotation(
        [raiden, bennett],
        [
          { characterId: bennett.id, actionType: "burst" },
          { characterId: raiden.id, actionType: "burst" },
          ...Array.from({ length: 18 }, () => ({
            characterId: raiden.id,
            actionType: "normal" as const,
          })),
        ],
        testEnemy,
        {
          critMode: "never",
          artifactStateEffects: raidenArtifactStateEffects(raiden.id, constellationLevel),
          resumeFrom: fullEnergySnapshot([raiden, bennett]),
        },
      );
      return result.finalState.characters[bennett.id]?.cooldowns[bennett.burst.id];
    };

    expect(run(0)).toBeCloseTo(15);
    expect(run(6)).toBeCloseTo(10);
  });
});
