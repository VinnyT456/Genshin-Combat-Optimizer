import { describe, expect, it } from "vitest";
import { createAinoDefinition } from "./ainoDefinition";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { testEnemy } from "@/game-data";

function fullEnergySnapshot(character: GenericCharacterDefinition): SimulationSnapshot {
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

function damageFor(
  character: GenericCharacterDefinition,
  actionType: "skill" | "burst",
  rotation = [{ characterId: character.id, actionType }],
): number {
  const result = simulateRotation([character], rotation, testEnemy, {
    critMode: "never",
    resumeFrom: fullEnergySnapshot(character),
  });
  const event = result.timeline.find(
    (entry) =>
      entry.type === "damage" &&
      entry.characterId === character.id &&
      entry.description.includes(actionType === "burst" ? character.burst.name : character.skill.name),
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No ${actionType} damage event for Aino`);
  }
  return event.damage.finalDamage;
}

describe("Aino runtime kit", () => {
  it("executes the sourced baseline skill damage through the simulation path", () => {
    expect(damageFor(createAinoDefinition(), "skill")).toBeGreaterThan(0);
  });

  it("converts Aino's EM into Burst DMG at A4", () => {
    const beforeA4 = createAinoDefinition(0, undefined, { ascensionPhase: 3 });
    const afterA4 = createAinoDefinition(0, undefined, { ascensionPhase: 4 });
    expect(damageFor(afterA4, "burst")).toBeGreaterThan(damageFor(beforeA4, "burst"));
  });

  it("applies C1 EM after skill and carries it into the following Burst", () => {
    const c0 = createAinoDefinition(0);
    const c1 = createAinoDefinition(1);
    expect(damageFor(c1, "burst", [
      { characterId: c1.id, actionType: "skill" },
      { characterId: c1.id, actionType: "burst" },
    ])).toBeGreaterThan(damageFor(c0, "burst", [
      { characterId: c0.id, actionType: "skill" },
      { characterId: c0.id, actionType: "burst" },
    ]));
  });

  it("uses the generated C3 and C5 talent-level buffs in damage resolution", () => {
    const c0 = createAinoDefinition(0);
    expect(damageFor(createAinoDefinition(3), "burst")).toBeGreaterThan(damageFor(c0, "burst"));
    expect(damageFor(createAinoDefinition(5), "skill")).toBeGreaterThan(damageFor(c0, "skill"));
  });
});
