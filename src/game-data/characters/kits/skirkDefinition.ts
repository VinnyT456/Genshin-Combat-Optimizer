/** Runtime overlay for Skirk's source-backed, currently executable kit data. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { skirk } from "../generated/cryo";

export function createSkirkDefinition(
  constellationLevel = skirk.constellationLevel,
  talentLevels: TalentLevels = skirk.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...skirk,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
    // Only C3/C5 have executable damage channels today: sourced Burst/Skill
    // talent boosts. Stateful perk mechanics remain deliberately unsupported.
    constellations: skirk.constellations,
  };
}

export const SKIRK_KIT_METADATA = {
  supportedConstellations: [3, 5],
  unsupportedChannels: [
    "burstEnergyCostAndSerpentsSubtletyResource",
    "sevenPhaseFlashStanceAndCryoInfusion",
    "a1VoidRiftCreationAbsorptionAndC1CrystalBlades",
    "a4DeathCrossingDamageMultipliers",
    "c2SkillTriggeredBurstScalingAndStanceGatedAttackBuff",
    "c4DeathCrossingAttackScaling",
    "c6HavocSeverCoordinatedAttacksAndDamageReduction",
    "partyCompositionSkillTalentBoost",
  ],
} as const;

export const skirkWithKit = createSkirkDefinition();
