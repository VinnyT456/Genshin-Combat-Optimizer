/** Runtime overlay for Male Traveler's source-backed Geo talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMGeo } from "../generated/geo";

/**
 * Generated data contains the verified Geo talent tables and C3/C5 talent
 * boosts. State-dependent passives and constellations remain inert until their
 * event/state requirements are represented by the runtime.
 */
export function createTravelerMGeoDefinition(
  constellationLevel = travelerMGeo.constellationLevel,
  talentLevels: TalentLevels = travelerMGeo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...travelerMGeo,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const travelerMGeoWithKit = createTravelerMGeoDefinition();

export const TRAVELER_M_GEO_KIT_METADATA = {
  executableDamage: ["sourcedGeoSkill", "sourcedGeoBurst", "c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    // A1's cooldown reduction needs a cooldown-modifier channel.
    "a1StarfellSwordCooldownReductionUnsupported",
    // A4's combo-final-hit Geo damage is not established by the generated hit model.
    "a4NormalComboFinalHitGeoDamageUnverified",
    // These require burst-field, destroyed-meteorite, energy-hit, duration or stack state.
    "c1BurstFieldCritRateAndInterruptionResistanceUnsupported",
    "c2DestroyedMeteoriteExplosionUnverified",
    "c4BurstHitEnergyRestorationUnsupported",
    "c6BurstBarrierAndMeteoriteDurationUnsupported",
    "p3BladeOfArchaicPetraStacksAndRockfellChargedAttackUnsupported",
    "skillParticleGenerationNotPublished",
  ],
} as const;
