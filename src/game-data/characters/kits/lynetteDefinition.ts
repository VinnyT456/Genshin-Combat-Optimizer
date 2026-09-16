/** Runtime Lynette overlay for executable, source-backed damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { NormalAttackString, KitAbility } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { lynette } from "../generated/anemo";

const LYNETTE_C6_ANEMO_DAMAGE_BONUS = 0.2;
const LYNETTE_C6_INFUSION_DURATION_SECONDS = 6;

function c6Stance(): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "lynette-c6-watchful-eye",
    name: "Watchful Eye",
    durationSeconds: LYNETTE_C6_INFUSION_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "lynette-c6-anemo-infusion",
      element: "anemo",
      durationSeconds: LYNETTE_C6_INFUSION_DURATION_SECONDS,
      canBeOverridden: false,
    },
    modifiers: [{
      stat: "elementalDmgBonus",
      element: "anemo",
      value: LYNETTE_C6_ANEMO_DAMAGE_BONUS,
    }],
  };
}

export function createLynetteDefinition(
  constellationLevel = lynette.constellationLevel,
  talentLevels: TalentLevels = lynette.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...lynette,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...lynette.skill,
      ...(level >= 6 ? { stance: c6Stance() } : {}),
    },
  };
}

export const LYNETTE_KIT_METADATA = {
  c6AnemoDamageBonus: LYNETTE_C6_ANEMO_DAMAGE_BONUS,
  c6InfusionDurationSeconds: LYNETTE_C6_INFUSION_DURATION_SECONDS,
  unsupportedChannels: [
    "a1PartyElementCountAtkBonus",
    "a4ElementalConversionBurstDamageBonus",
    "c1ShadowsignVortex",
    "c2AdditionalVividShot",
    "c4AdditionalSkillCharge",
    "p3RecoveryOrbUtility",
  ],
} as const;

export const lynetteWithKit = createLynetteDefinition();
