import { describe, expect, it } from "vitest";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import { syntheticSkill, syntheticUnit } from "@/simulation/character/fixtures";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { generateCandidateActions } from "@/simulation/optimizer/actionGenerator";
import { findCharacter } from "@/game-data/characters/registry";
import {
  skillInputVariantCharacters,
  withSkillInputVariants,
} from "@/game-data/characters/skillInputVariants";
import type { EnemyState } from "@/types";

const enemy: EnemyState = {
  id: "variant-test-target",
  name: "Variant test target",
  level: 90,
  resistances: {},
};

function scaledSkill(
  id: string,
  multiplier: number,
  castTime: number,
): KitAbility {
  return {
    ...syntheticSkill,
    id,
    name: id,
    castTime,
    instances: syntheticSkill.instances.map((instance, index) => ({
      ...instance,
      id: `${id}-${index}`,
      scaling: [{ stat: "atk", table: flatTalent(multiplier) }],
    })),
  };
}

function variantUnit(): GenericCharacterDefinition {
  const tap = scaledSkill("variant-skill-tap", 1, 1);
  const hold = scaledSkill("variant-skill-hold", 2, 1.5);
  return {
    ...syntheticUnit,
    skill: tap,
    skillVariants: { tap, hold },
  };
}

describe("Elemental Skill tap/hold input variants", () => {
  it("keeps every published data mapping backed by both generated inputs", () => {
    for (const characterId of skillInputVariantCharacters) {
      const character = findCharacter(characterId);
      expect(character, characterId).toBeDefined();
      const withVariants = withSkillInputVariants(character!);

      expect(withVariants.skillVariants?.tap, characterId).toBeDefined();
      expect(withVariants.skillVariants?.hold, characterId).toBeDefined();
      // The legacy/default skill is the tap form, so older rotations do not
      // execute every generated tap/hold row together.
      expect(withVariants.skill.id).toBe(withVariants.skillVariants?.tap?.id);
    }
  });

  it("resolves the selected input to its own damage and cast time", () => {
    const character = variantUnit();
    const tap = simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill", abilityId: "variant-skill-tap", skillVariant: "tap" }],
      enemy,
      { critMode: "never" },
    );
    const hold = simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill", abilityId: "variant-skill-hold", skillVariant: "hold" }],
      enemy,
      { critMode: "never" },
    );

    expect(tap.errors).toHaveLength(0);
    expect(tap.warnings).toHaveLength(0);
    expect(hold.errors).toHaveLength(0);
    expect(hold.warnings).toHaveLength(0);
    expect(hold.totalDamage).toBeCloseTo(tap.totalDamage * 2);
    expect(tap.duration).toBeCloseTo(1);
    expect(hold.duration).toBeCloseTo(1.5);
  });

  it("rejects a variant selector when the character did not declare it", () => {
    const result = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "skill", skillVariant: "hold" }],
      enemy,
      { critMode: "never" },
    );

    expect(result.totalDamage).toBe(0);
    expect(result.structuredWarnings).toContainEqual(
      expect.objectContaining({ code: "unknown-ability", actionIndex: 0 }),
    );
  });

  it("offers both declared inputs to the optimizer", () => {
    const character = variantUnit();
    const initial = simulateRotation([character], [], enemy, { critMode: "never" });
    const skillActions = generateCandidateActions([character], initial).filter(
      (action) => action.actionType === "skill",
    );

    expect(skillActions).toEqual([
      {
        characterId: character.id,
        actionType: "skill",
        abilityId: "variant-skill-tap",
        skillVariant: "tap",
      },
      {
        characterId: character.id,
        actionType: "skill",
        abilityId: "variant-skill-hold",
        skillVariant: "hold",
      },
    ]);
  });
});
