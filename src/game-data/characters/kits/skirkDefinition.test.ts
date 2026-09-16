import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createSkirkDefinition, SKIRK_KIT_METADATA } from "./skirkDefinition";

const noCrit = { critMode: "never" as const };

function damage(constellationLevel: number, actionType: "normal" | "skill" | "burst", talentLevel = 10) {
  const character = createSkirkDefinition(constellationLevel, {
    normal: actionType === "normal" ? talentLevel : 10,
    skill: actionType === "skill" ? talentLevel : 10,
    burst: actionType === "burst" ? talentLevel : 10,
  });
  const result = simulateRotation(
    [character],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
  expect(result.errors).toEqual([]);
  return Object.values(result.damageByAbility).reduce((sum, value) => sum + value, 0);
}

describe("Skirk runtime kit", () => {
  it("preserves executable sourced baseline talent damage", () => {
    expect(damage(0, "normal")).toBeGreaterThan(0);
    expect(damage(0, "skill")).toBeGreaterThan(0);
    expect(damage(0, "burst")).toBeGreaterThan(0);
  });

  it("uses configured talent levels in simulated damage", () => {
    expect(damage(0, "normal", 10)).toBeGreaterThan(damage(0, "normal", 1));
    expect(damage(0, "skill", 10)).toBeGreaterThan(damage(0, "skill", 1));
    expect(damage(0, "burst", 10)).toBeGreaterThan(damage(0, "burst", 1));
  });

  it("gates the sourced C3 Burst talent increase at constellation 3", () => {
    expect(damage(3, "burst")).toBeGreaterThan(damage(2, "burst"));
    expect(damage(2, "burst")).toBe(damage(0, "burst"));
  });

  it("gates the sourced C5 Skill talent increase at constellation 5", () => {
    expect(damage(5, "skill")).toBeGreaterThan(damage(4, "skill"));
    expect(damage(4, "skill")).toBe(damage(0, "skill"));
  });

  it("documents the fail-closed stateful mechanics boundary", () => {
    expect(SKIRK_KIT_METADATA.supportedConstellations).toEqual([3, 5]);
    expect(SKIRK_KIT_METADATA.unsupportedChannels).toContain("a4DeathCrossingDamageMultipliers");
  });
});
