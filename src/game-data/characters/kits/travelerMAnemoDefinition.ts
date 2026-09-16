/** Runtime overlay for source-backed Male Traveler Anemo kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMAnemo } from "../generated/anemo";

/**
 * Generated data already carries the executable C2 energy-recharge, C3 burst,
 * and C5 skill buffs. This factory applies requested progression while
 * preserving those sourced tables and buffs.
 */
export function createTravelerMAnemoDefinition(
  constellationLevel = travelerMAnemo.constellationLevel,
  talentLevels: TalentLevels = travelerMAnemo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...travelerMAnemo,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const travelerMAnemoWithKit = createTravelerMAnemoDefinition();

export const TRAVELER_M_ANEMO_KIT_METADATA = {
  supportedChannels: ["sourcedAnemoSkillDamage", "sourcedAnemoBurstDamage", "c2EnergyRecharge", "c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    // Generated perk provenance marks A1 unverified; do not execute its prose-derived multiplier.
    "a1SlittingWindNormalComboWindBladeUnverified",
    "a4SecondWindKillHealingUnsupported",
    "c1RagingVortexPullUnsupported",
    "c4CherishingBreezesIncomingDamageReductionUnsupported",
    // Requires an on-hit enemy-state lifecycle absent from the current seam.
    "c6IntertwinedWindsBurstHitResistanceReductionUnsupported",
    // Requires party-element stack accumulation and a transformed charged attack.
    "p3ForeignWindwrathChargedDamageUnsupported",
    "skillParticlesNotPublished",
  ],
} as const;
