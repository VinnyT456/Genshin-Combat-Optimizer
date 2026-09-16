/** Runtime overlay for sourced, directly simulatable Hydro Traveler damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFHydro } from "../generated/hydro";

export function createTravelerFHydroDefinition(
  constellationLevel = travelerFHydro.constellationLevel,
  talentLevels: TalentLevels = travelerFHydro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const torrentSurge = travelerFHydro.skill.instances[0];
  if (torrentSurge === undefined) throw new Error("Hydro Traveler skill Torrent Surge instance is missing from generated data");
  const burstInstance = travelerFHydro.burst.instances[0];
  if (burstInstance === undefined) throw new Error("Hydro Traveler burst damage instance is missing from generated data");

  return {
    ...travelerFHydro,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // The later skill rows require hold-channel duration, HP cost and tick state.
    // Keep the sourced initial Torrent Surge, but do not assume any Dewdrop ticks.
    skill: { ...travelerFHydro.skill, instances: [torrentSurge] },
    // Rising Waters is sourced as one Hydro hit; movement/duration behavior is not damage.
    burst: { ...travelerFHydro.burst, instances: [burstInstance] },
  };
}

export const travelerFHydroWithKit = createTravelerFHydroDefinition();

export const TRAVELER_F_HYDRO_KIT_METADATA = {
  supportedChannels: ["sourcedTorrentSurgeHydroSkillDamage", "sourcedRisingWatersHydroBurstDamage", "c3SkillTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    "holdSkillDewdropRepeatedDamageAndSpiritbreathThornRequireChannelTiming",
    "a1SourcewaterDropletPickupHealingUnsupported",
    "a4SuffusionHpCostBonusDamageUnverifiedAndUnsupported",
    "c1SourcewaterDropletEnergyRestoreUnsupported",
    "c2BurstBubbleDurationAndMovementUnsupported",
    "c4AquacrestAegisShieldAndDewdropRefreshUnsupported",
    "c6SourcewaterDropletPartyHealingUnsupported",
    "p3BladeOfManyWatersTideboundChargedAttackRequiresHpChangeStacksAndHpThresholds",
    "skillParticlesNotPublished",
  ],
} as const;
