import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { FISCHL_KIT_METADATA, createFischlDefinition } from "./fischlDefinition";

const noEnergyBurst = (character: ReturnType<typeof createFischlDefinition>) => ({
  ...character,
  burst: { ...character.burst, energyCost: 0 },
});

describe("Fischl runtime kit", () => {
  it("summons Oz and emits deterministic interval attacks", () => {
    const character = createFischlDefinition(0, undefined, { ascensionPhase: 0 });
    const rotation = [
      { characterId: character.id, actionType: "skill" as const },
      ...Array.from({ length: 8 }, () => ({ characterId: character.id, actionType: "normal" as const })),
    ];
    const result = simulateRotation([character], rotation, testEnemy, { critMode: "never", timeLimit: 4 });
    const ozHits = result.timeline.filter((event) => event.type === "damage" && event.damage?.abilityId.includes("fischl-oz-interval"));
    expect(ozHits.length).toBeGreaterThanOrEqual(3);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("increases summoning damage at C2", () => {
    const c0 = createFischlDefinition(0, undefined, { ascensionPhase: 0 });
    const c2 = createFischlDefinition(2, undefined, { ascensionPhase: 0 });
    const rotation = [{ characterId: "fischl", actionType: "skill" as const }];
    const base = simulateRotation([c0], rotation, testEnemy, { critMode: "never", timeLimit: 0.9 });
    const boosted = simulateRotation([c2], rotation, testEnemy, { critMode: "never", timeLimit: 0.9 });
    expect(boosted.totalDamage).toBeGreaterThan(base.totalDamage);
    expect(FISCHL_KIT_METADATA.c2SummoningBonusRatio).toBe(2);
  });

  it("adds C6 coordinated Oz damage to Normal Attacks and extends Oz", () => {
    const c0 = createFischlDefinition(0, undefined, { ascensionPhase: 0 });
    const c6 = createFischlDefinition(6, undefined, { ascensionPhase: 0 });
    const rotation = [
      { characterId: "fischl", actionType: "skill" as const },
      { characterId: "fischl", actionType: "normal" as const },
    ];
    const base = simulateRotation([c0], rotation, testEnemy, { critMode: "never", timeLimit: 2 });
    const boosted = simulateRotation([c6], rotation, testEnemy, { critMode: "never", timeLimit: 2 });
    expect(boosted.totalDamage).toBeGreaterThan(base.totalDamage);
    expect(c6.skill.triggers?.some((trigger) => trigger.id === "fischl-c6-oz-attack")).toBe(true);
    expect(FISCHL_KIT_METADATA.c6OzDurationSeconds).toBe(12);
  });

  it("adds the sourced C4 burst explosion damage", () => {
    const c0 = noEnergyBurst(createFischlDefinition(0, undefined, { ascensionPhase: 0 }));
    const c4 = noEnergyBurst(createFischlDefinition(4, undefined, { ascensionPhase: 0 }));
    const rotation = [{ characterId: "fischl", actionType: "burst" as const }];
    const base = simulateRotation([c0], rotation, testEnemy, { critMode: "never" });
    const boosted = simulateRotation([c4], rotation, testEnemy, { critMode: "never" });
    expect(boosted.totalDamage).toBeGreaterThan(base.totalDamage);
    expect(FISCHL_KIT_METADATA.c4BurstRatio).toBe(2.22);
  });
});
