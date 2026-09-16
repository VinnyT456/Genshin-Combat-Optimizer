/** Runtime overlay for Female Traveler's sourced Dendro talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFDendro } from "../generated/dendro";

/**
 * The generated kit already carries the verified per-level multipliers and C3/C5
 * talent-level buffs. Keep unverified stateful passives and non-damage
 * constellations inert until their lifecycle can be represented safely.
 */
export function createTravelerFDendroDefinition(
  constellationLevel = travelerFDendro.constellationLevel,
  talentLevels: TalentLevels = travelerFDendro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...travelerFDendro,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const travelerFDendroWithKit = createTravelerFDendroDefinition();

export const TRAVELER_F_DENDRO_KIT_METADATA = {
  executableDamage: ["sourcedDendroSkill", "sourcedDendroBurstHits", "c3SkillTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    "a1OverflowingLotuslightTimedPartyEmStacks",
    "a4EmScalingSkillAndBurstDamageBonus",
    "c1SkillHitEnergyRestoration",
    "c2BurstLampDurationExtension",
    "c4LotuslightTriggeredA1Stacks",
    "c6ConditionalDendroAndTransfiguredElementDamageBonus",
    "p3VerdantViridisStacksAndVerdessenceChargedAttack",
    "skillParticleGeneration",
  ],
} as const;
