/** Runtime overlay for Female Traveler's source-backed Geo talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFGeo } from "../generated/geo";

/**
 * Generated data contains the verified Geo talent tables and C3/C5 talent
 * boosts. State-dependent passives and constellations remain inert until their
 * event/state requirements are represented by the runtime.
 */
export function createTravelerFGeoDefinition(
  constellationLevel = travelerFGeo.constellationLevel,
  talentLevels: TalentLevels = travelerFGeo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...travelerFGeo,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const travelerFGeoWithKit = createTravelerFGeoDefinition();

export const TRAVELER_F_GEO_KIT_METADATA = {
  executableDamage: ["sourcedGeoSkill", "sourcedGeoBurst", "c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    // A1's cooldown reduction is well-described but needs a cooldown modifier channel.
    "a1StarfellSwordCooldownReductionUnsupported",
    // A4 describes a 60%-ATK hit, but the emitter marks its triggering combo/element as unverified.
    "a4NormalComboFinalHitGeoDamageUnverified",
    // These require meteorite destruction, a skill-hit energy event, field duration, or stack/pickup state.
    "c1BurstFieldCritRateAndInterruptionResistanceUnsupported",
    "c2DestroyedMeteoriteExplosionUnverified",
    "c4BurstHitEnergyRestorationUnsupported",
    "c6BurstBarrierAndMeteoriteDurationUnsupported",
    "p3BladeOfArchaicPetraStacksAndRockfellChargedAttackUnsupported",
    "skillParticleGenerationNotPublished",
  ],
} as const;
