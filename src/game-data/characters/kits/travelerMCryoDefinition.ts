/** Runtime overlay for sourced, directly simulatable Male Cryo Traveler damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMCryo } from "../generated/cryo";

export function createTravelerMCryoDefinition(
  constellationLevel = travelerMCryo.constellationLevel,
  talentLevels: TalentLevels = travelerMCryo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const baseBurstInstance = travelerMCryo.burst.instances[0];
  if (baseBurstInstance === undefined) throw new Error("Male Cryo Traveler burst damage instance is missing from generated data");

  return {
    ...travelerMCryo,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // The other javelin hits require the unpublished Stellar-Conduct/Swirl state.
    burst: { ...travelerMCryo.burst, instances: [baseBurstInstance] },
  };
}

export const TRAVELER_M_CRYO_KIT_METADATA = {
  unsupportedChannels: [
    "a1FrostpierceStarCryoInfusionAndAttackScalingBonus",
    "c1StellarGlimmerEnergyRestore",
    "c2IceCrystalTriggeredElementalMasteryBuff",
    "c4FrostpierceStarDurationExtension",
    "c6FrostglowTriggeredPartyReactionDamageBonus",
    "p3PolestarAndStellarSwirlReactionStateAndDamageScaling",
    "p4IcepointStacksFreezingIceChargedAttackAndFrostglow",
  ],
} as const;

export const travelerMCryoWithKit = createTravelerMCryoDefinition();
