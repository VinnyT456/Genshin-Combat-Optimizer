import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationConfig, SimulationSnapshot } from "@/types";
import { DEHYA_KIT_METADATA, createDehyaDefinition } from "./dehyaDefinition";

const noCrit = { critMode: "never" as const };

function fullEnergySnapshot(character: ReturnType<typeof createDehyaDefinition>): SimulationSnapshot {
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

function runSkill(character: ReturnType<typeof createDehyaDefinition>) {
  return simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, noCrit);
}

function runBurst(character: ReturnType<typeof createDehyaDefinition>, config: SimulationConfig = noCrit) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "burst" }],
    testEnemy,
    { ...config, resumeFrom: fullEnergySnapshot(character) },
  );
}

describe("Dehya runtime kit", () => {
  it("executes sourced Molten Inferno and Leonine Bite damage", () => {
    expect(runSkill(createDehyaDefinition()).totalDamage).toBeGreaterThan(0);
    expect(runBurst(createDehyaDefinition()).totalDamage).toBeGreaterThan(0);
  });

  it("applies C1's verified Max HP bonus and HP scaling to skill damage", () => {
    const c0 = createDehyaDefinition(0);
    const c1 = createDehyaDefinition(1);
    expect(runSkill(c1).totalDamage).toBeGreaterThan(runSkill(c0).totalDamage);
    expect(c1.passives.find((passive) => passive.id === "dehya-p3")?.buffs).toEqual([
      expect.objectContaining({ modifiers: [{ stat: "hpPercent", value: DEHYA_KIT_METADATA.c1MaxHpBonus }] }),
    ]);
  });

  it("applies C1's verified HP scaling to all burst damage instances", () => {
    const c0 = runBurst(createDehyaDefinition(0));
    const c1 = runBurst(createDehyaDefinition(1));
    const c0Hits = c0.timeline.filter((event) => event.type === "damage");
    const c1Hits = c1.timeline.filter((event) => event.type === "damage");
    expect(c1Hits).toHaveLength(c0Hits.length);
    expect(c1.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("executes generated C3 and C5 talent boosts", () => {
    expect(runBurst(createDehyaDefinition(3)).totalDamage).toBeGreaterThan(
      runBurst(createDehyaDefinition(0)).totalDamage,
    );
    expect(runSkill(createDehyaDefinition(5)).totalDamage).toBeGreaterThan(
      runSkill(createDehyaDefinition(0)).totalDamage,
    );
  });

  it("applies C6's verified 10% Leonine Bite CRIT Rate", () => {
    const c5 = runBurst(createDehyaDefinition(5), {});
    const c6 = runBurst(createDehyaDefinition(6), {});
    expect(c6.totalDamage).toBeGreaterThan(c5.totalDamage);
    expect(createDehyaDefinition(6).passives.find((passive) => passive.id === "dehya-p3")?.buffs?.find((buff) => buff.id === "dehya-c6-burst-crit-rate")).toEqual(
      expect.objectContaining({
        conditions: { abilityIds: ["dehya-burst"] },
        modifiers: [{ stat: "critRate", value: DEHYA_KIT_METADATA.c6BurstCritRate }],
      }),
    );
  });
});
