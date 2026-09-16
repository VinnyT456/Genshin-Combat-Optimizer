/** Runtime overlay for sourced, directly simulatable Male Traveler Electro damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMElectro } from "../generated/electro";

export function createTravelerMElectroDefinition(
  constellationLevel = travelerMElectro.constellationLevel,
  talentLevels: TalentLevels = travelerMElectro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const initialBurstSlash = travelerMElectro.burst.instances[0];
  if (initialBurstSlash === undefined) throw new Error("Electro Traveler initial burst damage instance is missing from generated data");

  return {
    ...travelerMElectro,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Falling Thunder needs Normal/Charged-hit triggers and its proc interval;
    // do not execute the generated proc row as an immediate cast hit.
    burst: { ...travelerMElectro.burst, instances: [initialBurstSlash] },
  };
}

export const travelerMElectroWithKit = createTravelerMElectroDefinition();

export const TRAVELER_M_ELECTRO_KIT_METADATA = {
  supportedChannels: ["sourcedElectroSkillDamage", "sourcedInitialElectroBurstSlash", "c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    "a1AbundanceAmuletCooldownReduction",
    "a4AmuletEnergyRechargeScaling",
    "c1AdditionalAbundanceAmulet",
    "c2FallingThunderElectroResistanceReduction",
    "c4LowEnergyAmuletEnergyRestoration",
    "c6EveryThirdFallingThunderDamageAndEnergy",
    "p3BurstStackChargedAttackDetonateAndDelayedStrike",
    "fallingThunderNormalChargedHitTriggerAndProcInterval",
    "skillParticleGeneration",
  ],
} as const;
