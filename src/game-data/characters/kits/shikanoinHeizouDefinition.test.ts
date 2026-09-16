import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createShikanoinHeizouDefinition,
  SHIKANOIN_HEIZOU_KIT_METADATA,
} from "./shikanoinHeizouDefinition";

function skillDamage(
  constellationLevel = 0,
  declensionStacks = 0,
  critMode: "never" | "expected" = "never",
) {
  const character = createShikanoinHeizouDefinition(constellationLevel, undefined, declensionStacks);
  const result = simulateRotation(
    [{ ...character, skill: { ...character.skill, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "skill" }],
    testEnemy,
    { critMode },
  );
  expect(result.errors).toEqual([]);
  return result.damageByAbility["shikanoin-heizou-skill"] ?? 0;
}

describe("Shikanoin Heizou generic kit overlay", () => {
  it("adds the sourced Declension Skill DMG at each explicitly supplied stack count", () => {
    const noStacks = skillDamage(0, 0);
    const oneStack = skillDamage(0, 1);
    const fourStacks = skillDamage(0, 4);

    expect(oneStack).toBeGreaterThan(noStacks);
    expect(fourStacks).toBeGreaterThan(oneStack);
  });

  it("applies C3's sourced Skill talent boost to simulated damage only at C3", () => {
    const c2 = skillDamage(2, 0);
    const c3 = skillDamage(3, 0);

    expect(c3).toBeGreaterThan(c2);
  });

  it("adds C6's four-stack crit package to actual simulated Skill damage", () => {
    const c5 = skillDamage(5, 4, "expected");
    const c6 = skillDamage(6, 4, "expected");

    expect(c6).toBeGreaterThan(c5);
  });

  it("keeps C6 inactive below its constellation gate", () => {
    const c0 = createShikanoinHeizouDefinition(0, undefined, 4);
    const c6 = createShikanoinHeizouDefinition(6, undefined, 4);

    expect(c0.constellations.find((row) => row.level === 6)?.buffs).toBeUndefined();
    expect(c6.constellations.find((row) => row.level === 6)?.buffs).toHaveLength(5);
  });

  it("documents event/state channels unavailable to the generic executable kit", () => {
    expect(SHIKANOIN_HEIZOU_KIT_METADATA.unsupportedChannels).toContain(
      "a1SwirlTriggeredDeclensionGain",
    );
  });
});
