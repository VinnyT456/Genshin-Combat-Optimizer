import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { CharacterSnapshot, Rotation, SimulationSnapshot } from "@/types";
import { IANSAN_KIT_METADATA, createIansanDefinition } from "./iansanDefinition";

function fullEnergySnapshot(character: ReturnType<typeof createIansanDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function damageFor(
  character: ReturnType<typeof createIansanDefinition>,
  rotation: Rotation,
): number {
  const result = simulateRotation([character], rotation, testEnemy, {
    critMode: "never",
    resumeFrom: fullEnergySnapshot(character),
  });
  const event = result.timeline.findLast(
    (entry) => entry.type === "damage" && entry.characterId === character.id,
  );
  if (event?.type !== "damage" || event.damage === undefined) throw new Error("No Iansan damage event");
  return event.damage.finalDamage;
}

describe("Iansan runtime kit", () => {
  it("executes sourced baseline skill damage", () => {
    expect(damageFor(createIansanDefinition(0), [{ characterId: "iansan", actionType: "skill" }])).toBeGreaterThan(0);
  });

  it("applies A1 ATK after Skill, increasing the following Normal damage", () => {
    const c0 = createIansanDefinition(0);
    const a1Locked = createIansanDefinition(0, undefined, { ascensionPhase: 0 });
    const rotation: Rotation = [
      { characterId: "iansan", actionType: "skill" },
      { characterId: "iansan", actionType: "normal" },
    ];
    expect(damageFor(c0, rotation)).toBeGreaterThan(damageFor(a1Locked, rotation));
  });

  it("applies C2's off-field ATK bonus to the active party member", () => {
    const c0 = createIansanDefinition(0);
    const c2 = createIansanDefinition(2);
    const ally = { ...c0, id: "iansan-test-ally", name: "Test Ally", element: "pyro" as const };
    const rotation: Rotation = [
      { characterId: "iansan", actionType: "burst" },
      { characterId: ally.id, actionType: "swap" },
      { characterId: ally.id, actionType: "normal" },
    ];
    const c0Result = simulateRotation([c0, ally], rotation, testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c0) });
    const c2Result = simulateRotation([c2, ally], rotation, testEnemy, { critMode: "never", resumeFrom: fullEnergySnapshot(c2) });
    const allyDamage = (result: typeof c0Result) => result.timeline.find(
      (entry) => entry.type === "damage" && entry.characterId === ally.id,
    )?.damage?.finalDamage ?? 0;
    expect(allyDamage(c2Result)).toBeGreaterThan(allyDamage(c0Result));
  });

  it("resolves generated C3 and C5 talent boosts in actual damage", () => {
    expect(damageFor(createIansanDefinition(3), [{ characterId: "iansan", actionType: "skill" }]))
      .toBeGreaterThan(damageFor(createIansanDefinition(0), [{ characterId: "iansan", actionType: "skill" }]));
    expect(damageFor(createIansanDefinition(5), [{ characterId: "iansan", actionType: "burst" }]))
      .toBeGreaterThan(damageFor(createIansanDefinition(0), [{ characterId: "iansan", actionType: "burst" }]));
    expect(IANSAN_KIT_METADATA.unsupportedChannels).toContain("c6OverflowTriggeredExtremeForceDamageBonus");
  });
});
