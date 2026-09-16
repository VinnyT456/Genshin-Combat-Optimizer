import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine";
import { createSucroseDefinition, SUCROSE_KIT_METADATA } from "./sucroseDefinition";

const noCrit = { critMode: "never" as const };

function damage(character: GenericCharacterDefinition, actionType: "skill" | "burst") {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  const result = simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
  expect(result.errors).toEqual([]);
  return result.totalDamage;
}

describe("Sucrose runtime kit", () => {
  it("executes generated sourced Skill and Burst damage", () => {
    const sucrose = createSucroseDefinition();
    expect(damage(sucrose, "skill")).toBeGreaterThan(0);
    expect(damage(sucrose, "burst")).toBeGreaterThan(0);
  });

  it("applies C3's Skill talent boost to actual damage only at C3", () => {
    const c0 = createSucroseDefinition(0);
    const c2 = createSucroseDefinition(2);
    const c3 = createSucroseDefinition(3);
    expect(damage(c2, "skill")).toBe(damage(c0, "skill"));
    expect(damage(c3, "skill")).toBeGreaterThan(damage(c2, "skill"));
  });

  it("applies C5's Burst talent boost to actual damage only at C5", () => {
    const c0 = createSucroseDefinition(0);
    const c4 = createSucroseDefinition(4);
    const c5 = createSucroseDefinition(5);
    expect(damage(c4, "burst")).toBe(damage(c0, "burst"));
    expect(damage(c5, "burst")).toBeGreaterThan(damage(c4, "burst"));
  });

  it("keeps damage scaling tied to caller-selected talent level", () => {
    const base = createSucroseDefinition(0);
    const lowerTalentLevels: TalentLevels = { normal: 1, skill: 1, burst: 1 };
    const low = createSucroseDefinition(0, lowerTalentLevels);
    expect(damage(base, "skill")).toBeGreaterThan(damage(low, "skill"));
  });

  it("documents conditional or conflicted channels as unsupported", () => {
    expect(SUCROSE_KIT_METADATA.unsupportedChannels).toContain("a1SwirlTriggeredMatchingElementMastery");
    expect(SUCROSE_KIT_METADATA.unsupportedChannels).toContain("c6AbsorptionGatedElementalDamageBonusSourceConflict");
  });
});
