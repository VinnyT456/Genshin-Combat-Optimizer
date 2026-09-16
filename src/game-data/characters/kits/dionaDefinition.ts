/** Runtime Diona overlay for executable, sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { diona } from "../generated/cryo";

const DIONA_C2_SKILL_DAMAGE_BONUS = 0.15;

function withC2SkillDamage(
  instance: DamageInstanceDefinition,
): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: instance.scaling.map((term) => ({
      ...term,
      table: {
        values: term.table.values.map(
          (multiplier) => multiplier * (1 + DIONA_C2_SKILL_DAMAGE_BONUS),
        ),
      },
    })),
  };
}

export function createDionaDefinition(
  constellationLevel = diona.constellationLevel,
  talentLevels: TalentLevels = diona.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const skill = level >= 2
    ? {
        ...diona.skill,
        instances: diona.skill.instances.map(withC2SkillDamage),
      }
    : diona.skill;

  return {
    ...diona,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill,
  };
}

export const dionaWithKit = createDionaDefinition();

export const DIONA_KIT_METADATA = {
  c2SkillDamageBonus: DIONA_C2_SKILL_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1ShieldMovementAndStamina",
    "a4EnemyAttackReduction",
    "c1BurstEndEnergyRestore",
    "c2ShieldAbsorptionAndPartyShield",
    "c4AimedShotChargeTime",
    "c6ConditionalHealingAndElementalMastery",
    "p3CookingDoubleProduct",
    "p4ReactionTriggeredExtraPaws",
  ],
} as const;
