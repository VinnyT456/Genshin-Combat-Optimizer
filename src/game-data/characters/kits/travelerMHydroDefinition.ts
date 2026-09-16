/** Runtime overlay for sourced, directly simulatable Hydro Traveler damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMHydro } from "../generated/hydro";

export function createTravelerMHydroDefinition(
  constellationLevel = travelerMHydro.constellationLevel,
  talentLevels: TalentLevels = travelerMHydro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const safeConstellation = Number.isFinite(constellationLevel)
    ? Math.max(0, Math.min(6, Math.trunc(constellationLevel)))
    : 0;
  const torrentSurge = travelerMHydro.skill.instances[0];
  if (torrentSurge === undefined) throw new Error("Hydro Traveler skill Torrent Surge instance is missing from generated data");
  const burstHit = travelerMHydro.burst.instances[0];
  if (burstHit === undefined) throw new Error("Hydro Traveler burst damage instance is missing from generated data");

  return {
    ...travelerMHydro,
    ...overrides,
    constellationLevel: safeConstellation,
    talentLevels,
    // Hold-mode ticks and the final thorn need channel timing and HP-consumption state.
    skill: { ...travelerMHydro.skill, instances: [torrentSurge] },
    // Rising Waters is one sourced Hydro hit; duration and movement do not affect damage.
    burst: { ...travelerMHydro.burst, instances: [burstHit] },
  };
}

export const travelerMHydroWithKit = createTravelerMHydroDefinition();

export const TRAVELER_M_HYDRO_KIT_METADATA = {
  executableDamage: [
    "sourcedPhysicalNormalAndChargedAttacks",
    "sourcedPhysicalPlunges",
    "sourcedTorrentSurgeHydroSkillDamage",
    "sourcedRisingWatersHydroBurstDamage",
    "c3SkillTalentLevels",
    "c5BurstTalentLevels",
  ],
  unsupportedChannels: [
    "holdSkillDewdropDamageAndSpiritbreathThornRequireChannelTiming",
    "a1SourcewaterDropletPickupHealingUnsupported",
    "a4SuffusionHpConsumptionBonusDamageRequiresUnmodelledHpCostState",
    "c1SourcewaterDropletEnergyRestoreUnsupported",
    "c2BurstBubbleDurationAndMovementUnsupported",
    "c4AquacrestAegisShieldAndDewdropRefreshUnsupported",
    "c6SourcewaterDropletPartyHealingUnsupported",
    "p3BladeOfManyWatersTideboundChargedAttackRequiresHpChangeStacksAndHpThresholds",
    "skillParticlesNotPublished",
  ],
} as const;
