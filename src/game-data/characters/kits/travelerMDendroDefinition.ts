/** Runtime overlay for Male Traveler's sourced Dendro talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMDendro } from "../generated/dendro";

/**
 * The generated definition supplies verified talent tables and executable C3/C5
 * talent-level buffs. Keep stateful passives and non-damage constellations inert
 * until their lifecycle can be represented without assuming uptime or inputs.
 */
export function createTravelerMDendroDefinition(
  constellationLevel = travelerMDendro.constellationLevel,
  talentLevels: TalentLevels = travelerMDendro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const safeConstellation = Number.isFinite(constellationLevel)
    ? Math.max(0, Math.min(6, Math.trunc(constellationLevel)))
    : 0;

  return {
    ...travelerMDendro,
    ...overrides,
    constellationLevel: safeConstellation,
    talentLevels,
  };
}

export const travelerMDendroWithKit = createTravelerMDendroDefinition();

export const TRAVELER_M_DENDRO_KIT_METADATA = {
  executableDamage: ["sourcedPhysicalNormalAndChargedAttacks", "sourcedPhysicalPlunges", "sourcedDendroSkill", "sourcedDendroBurstHits", "c3SkillTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    "a1OverflowingLotuslightTimedPartyEmStacks",
    "a4EmScalingSkillAndBurstDamageBonus",
    "c1SkillHitEnergyRestoration",
    "c2BurstLampDurationExtension",
    "c4LotuslightTriggeredA1Stacks",
    "c6ConditionalDendroAndTransfiguredElementDamageBonus",
    "p3VerdantViridisStacksAndVerdessenceChargedAttackAndVinecores",
    "skillParticleGeneration",
  ],
} as const;
