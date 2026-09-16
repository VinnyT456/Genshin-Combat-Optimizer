/** Runtime Chevreuse overlay for the executable C2 damage channel. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import { chevreuse } from "../generated/pyro";

const CHEVREUSE_C2_EXPLOSION_ATK_RATIO = 1.2;

function c2Explosion(source: DamageInstanceDefinition, index: 1 | 2): DamageInstanceDefinition {
  return {
    ...source,
    id: `chevreuse-c2-explosion-${index}`,
    name: `Chain Explosion ${index} DMG`,
    scaling: [{ stat: "atk", table: flatTalent(CHEVREUSE_C2_EXPLOSION_ATK_RATIO) }],
    damageType: "skill",
    element: "pyro",
    application: { element: "pyro", gauge: 1 },
  };
}

/** Build Chevreuse's generic definition at a selected constellation/talent level. */
export function createChevreuseDefinition(
  constellationLevel = chevreuse.constellationLevel,
  talentLevels: TalentLevels = chevreuse.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const hold = chevreuse.skill.instances[1];
  if (hold === undefined) throw new Error("Chevreuse skill is missing its sourced Hold DMG row");

  return {
    ...chevreuse,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...chevreuse.skill,
      instances: level >= 2
        ? [...chevreuse.skill.instances, c2Explosion(hold, 1), c2Explosion(hold, 2)]
        : chevreuse.skill.instances,
    },
  };
}

export const chevreuseWithKit = createChevreuseDefinition();

export const CHEVREUSE_KIT_METADATA = {
  c2ExplosionAtkRatio: CHEVREUSE_C2_EXPLOSION_ATK_RATIO,
  unsupportedChannels: [
    "a1OverloadedPyroElectroResReduction",
    "a4MaxHpDerivedPartyAtk",
    "c1OverloadedEnergy",
    "c4HoldCooldownReset",
    "c6HealingAndElementalDmgStacks",
    "p3SprintingStamina",
  ],
} as const;
