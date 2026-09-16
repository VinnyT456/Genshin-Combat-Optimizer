import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { COLLEI_KIT_METADATA, createColleiDefinition } from "./colleiDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createColleiDefinition>): SimulationSnapshot {
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

function runSkill(character: ReturnType<typeof createColleiDefinition>) {
  return simulateRotation(
    [character],
    [{ characterId: character.id, actionType: "skill" }],
    testEnemy,
    { critMode: "never" },
  );
}

function burstDamage(character: ReturnType<typeof createColleiDefinition>): number {
  const result = simulateRotation(
    [character],
    [{ characterId: character.id, actionType: "burst" }],
    testEnemy,
    { critMode: "never", resumeFrom: fullEnergySnapshot(character) },
  );
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === character.id,
  );
  if (event?.type !== "damage" || event.damage === undefined) throw new Error("No Collei burst damage event");
  return event.damage.finalDamage;
}

describe("Collei runtime kit", () => {
  it("executes the sourced Floral Brush skill damage", () => {
    const result = runSkill(createColleiDefinition(0, { normal: 1, skill: 10, burst: 1 }));
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(1);
  });

  it("adds C6's verified 200% ATK miniature Cuilein-Anbar hit", () => {
    const c0 = runSkill(createColleiDefinition(0, { normal: 1, skill: 1, burst: 1 }));
    const c6 = runSkill(createColleiDefinition(6, { normal: 1, skill: 1, burst: 1 }));
    expect(c6.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(c6.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
    expect(COLLEI_KIT_METADATA.c6ExtraAtkRatio).toBe(2);
  });

  it("executes the generated C3 skill talent boost in the damage path", () => {
    expect(runSkill(createColleiDefinition(3)).totalDamage).toBeGreaterThan(
      runSkill(createColleiDefinition(0)).totalDamage,
    );
  });

  it("executes the generated C5 burst talent boost in the damage path", () => {
    expect(burstDamage(createColleiDefinition(5))).toBeGreaterThan(
      burstDamage(createColleiDefinition(0)),
    );
  });

  it("publishes C1 off-field ER and C4 party EM as executable state", () => {
    const c4 = createColleiDefinition(4);
    expect(c4.passives.find((passive) => passive.id === "collei-a1")?.buffs).toEqual([
      expect.objectContaining({
        conditions: { requiresOnField: false },
        modifiers: [{ stat: "energyRecharge", value: COLLEI_KIT_METADATA.c1EnergyRechargeBonus }],
      }),
    ]);
    expect(c4.burst.buffs).toEqual([
      expect.objectContaining({
        duration: COLLEI_KIT_METADATA.c4DurationSeconds,
        targets: { scope: "party", excludeSource: true },
        modifiers: [{ stat: "elementalMastery", value: COLLEI_KIT_METADATA.c4ElementalMasteryBonus }],
      }),
    ]);
  });
});
