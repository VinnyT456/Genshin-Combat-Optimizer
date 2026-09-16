/** Runtime overlay for sourced, directly simulatable Cryo Traveler damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFCryo } from "../generated/cryo";

export function createTravelerFCryoDefinition(
  constellationLevel = travelerFCryo.constellationLevel,
  talentLevels: TalentLevels = travelerFCryo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const baseBurstInstance = travelerFCryo.burst.instances[0];
  if (baseBurstInstance === undefined) throw new Error("Cryo Traveler burst damage instance is missing from generated data");

  return {
    ...travelerFCryo,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Stellar-Conduct and Stellar Swirl strikes require state the runtime cannot establish.
    burst: { ...travelerFCryo.burst, instances: [baseBurstInstance] },
  };
}

export const TRAVELER_F_CRYO_KIT_METADATA = {
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

export const travelerFCryoWithKit = createTravelerFCryoDefinition();
