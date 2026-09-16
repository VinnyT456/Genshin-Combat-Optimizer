/** Runtime overlay for source-backed Female Traveler Anemo kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFAnemo } from "../generated/anemo";

/**
 * Generated data already carries the executable C3 burst and C5 skill talent
 * boosts. This factory applies requested progression while preserving those
 * sourced tables and buffs.
 */
export function createTravelerFAnemoDefinition(
  constellationLevel = travelerFAnemo.constellationLevel,
  talentLevels: TalentLevels = travelerFAnemo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...travelerFAnemo,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const travelerFAnemoWithKit = createTravelerFAnemoDefinition();

export const TRAVELER_F_ANEMO_KIT_METADATA = {
  supportedChannels: ["sourcedAnemoSkillDamage", "sourcedAnemoBurstDamage", "c3BurstTalentLevels", "c5SkillTalentLevels", "c2EnergyRecharge"],
  unsupportedChannels: [
    // The generated perk audit marks A1 unverified; do not execute its prose-derived multiplier.
    "a1SlittingWindNormalComboWindBladeUnverified",
    "a4SecondWindKillHealingUnsupported",
    "c1RagingVortexPullUnsupported",
    "c4CherishingBreezesIncomingDamageReductionUnsupported",
    // Burst-hit debuffs need an on-hit lifecycle and enemy state beyond the current seam.
    "c6IntertwinedWindsBurstHitResistanceReductionUnsupported",
    "p3ForeignWindwrathChargedDamageUnsupported",
    "skillParticlesNotPublished",
  ],
} as const;
