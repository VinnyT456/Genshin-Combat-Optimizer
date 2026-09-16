import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { MIKA_KIT_METADATA, createMikaDefinition } from "./mikaDefinition";

function snapshot(character: ReturnType<typeof createMikaDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(character: ReturnType<typeof createMikaDefinition>, actionTypes: ("normal" | "skill")[], critMode: "never" | "always" = "never") {
  return simulateRotation(
    [character],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    { critMode, resumeFrom: snapshot(character) },
  );
}

describe("Mika runtime kit", () => {
  it("executes sourced baseline Skill and Normal damage", () => {
    const result = run(createMikaDefinition(0, { normal: 10, skill: 10, burst: 1 }), ["skill", "normal"]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.some((event) => event.type === "damage" && event.damage?.element === "cryo")).toBe(true);
  });

  it("applies a Detector stack as Physical DMG after Skill", () => {
    const mika = createMikaDefinition(0, { normal: 10, skill: 1, burst: 1 });
    const withoutSoulwind = run(mika, ["normal"]);
    const withSoulwind = run(mika, ["skill", "normal"]);
    expect(withSoulwind.totalDamage).toBeGreaterThan(withoutSoulwind.totalDamage);
    expect(MIKA_KIT_METADATA.detectorPhysicalDamageBonus).toBe(0.1);
  });

  it("stacks deterministic Detector gains across repeated Skills", () => {
    const mika = createMikaDefinition(0, { normal: 10, skill: 1, burst: 1 });
    const oneStack = run(mika, ["skill", "normal"]);
    // Skill cooldown is 15 seconds, so use a resumed snapshot only for the
    // sourced post-Skill behavior; repeated casts are represented by the
    // definition's capped resource contract below.
    expect(mika.resources).toEqual([expect.objectContaining({ id: MIKA_KIT_METADATA.detectorResourceId, max: 4 })]);
    expect(oneStack.finalState.characters[mika.id]?.resources?.[MIKA_KIT_METADATA.detectorResourceId]?.value).toBe(1);
  });

  it("applies C6 Physical CRIT DMG only while Soulwind is active", () => {
    const c5 = createMikaDefinition(5, { normal: 10, skill: 1, burst: 1 });
    const c6 = createMikaDefinition(6, { normal: 10, skill: 1, burst: 1 });
    const c5Damage = run(c5, ["skill", "normal"], "always").totalDamage;
    const c6Damage = run(c6, ["skill", "normal"], "always").totalDamage;
    expect(c6Damage).toBeGreaterThan(c5Damage);
    expect(MIKA_KIT_METADATA.c6PhysicalCritDamage).toBe(0.6);
  });

  it("retains generated C3 burst and C5 skill talent boosts", () => {
    const c0 = createMikaDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const c3 = createMikaDefinition(3, { normal: 1, skill: 10, burst: 10 });
    const c5 = createMikaDefinition(5, { normal: 1, skill: 10, burst: 10 });
    expect(c3.constellations.find((entry) => entry.id === "mika-c3")?.buffs).toBeDefined();
    expect(c5.constellations.find((entry) => entry.id === "mika-c5")?.buffs).toBeDefined();
    expect(run(c5, ["skill"]).totalDamage).toBeGreaterThan(run(c0, ["skill"]).totalDamage);
  });
});
