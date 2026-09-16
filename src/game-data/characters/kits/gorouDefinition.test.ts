import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { GOROU_KIT_METADATA, createGorouDefinition } from "./gorouDefinition";

const noCrit = { critMode: "never" as const };

function snapshot(character: ReturnType<typeof createGorouDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(
  character: ReturnType<typeof createGorouDefinition>,
  actionTypes: ("skill" | "burst")[],
  critMode: "never" | "always" = "never",
) {
  return simulateRotation(
    [character],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    { critMode, resumeFrom: snapshot(character) },
  );
}

function lastDamage(result: ReturnType<typeof simulateRotation>): number {
  const event = result.timeline.filter((entry) => entry.type === "damage").at(-1);
  if (event?.type !== "damage" || event.damage === undefined) throw new Error("expected damage event");
  return event.damage.finalDamage;
}

describe("Gorou runtime kit", () => {
  it("executes baseline Skill and Burst damage", () => {
    const result = run(createGorouDefinition(), ["skill", "burst"]);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("adds A4 DEF scaling to Skill and Burst damage", () => {
    const a4 = run(createGorouDefinition(0, undefined, { ascensionPhase: 4 }), ["skill"]);
    const locked = run(createGorouDefinition(0, undefined, { ascensionPhase: 3 }), ["skill"]);
    expect(a4.totalDamage).toBeGreaterThan(locked.totalDamage);
    expect(GOROU_KIT_METADATA.a4SkillDefRatio).toBe(1.56);
  });

  it("applies A1's post-Burst DEF field to a later DEF-scaling Skill", () => {
    const before = lastDamage(run(createGorouDefinition(0), ["skill"]));
    const after = lastDamage(run(createGorouDefinition(0), ["burst", "skill"]));
    expect(after).toBeGreaterThan(before);
  });

  it("applies C6 Geo CRIT DMG according to explicit General's Glory state", () => {
    const c5 = lastDamage(run(createGorouDefinition(5), ["burst", "skill"], "always"));
    const c6 = lastDamage(run(createGorouDefinition(6, undefined, {}, { fieldLevel: 3 }), ["burst", "skill"], "always"));
    expect(c6).toBeGreaterThan(c5);
    expect(GOROU_KIT_METADATA.c6CritDamageByFieldLevel[3]).toBe(0.4);
  });

  it("fails closed for C6 when field level is not supplied", () => {
    expect(lastDamage(run(createGorouDefinition(6), ["burst", "skill"])))
      .toBe(lastDamage(run(createGorouDefinition(5), ["burst", "skill"])));
    expect(GOROU_KIT_METADATA.unsupportedChannels).toContain("c6ImplicitGeneralGloryFieldLevel");
  });
});
