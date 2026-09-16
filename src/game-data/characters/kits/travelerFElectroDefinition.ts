/** Runtime overlay for Female Traveler's sourced Electro talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerFElectro } from "../generated/electro";

/**
 * The generated kit provides verified damage multipliers and the C3/C5 talent
 * level buffs. Keep unverified Amulet, cooldown, resistance and charged-attack
 * resource mechanics inert until their lifecycle can be represented safely.
 */
export function createTravelerFElectroDefinition(
  constellationLevel = travelerFElectro.constellationLevel,
  talentLevels: TalentLevels = travelerFElectro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...travelerFElectro,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const travelerFElectroWithKit = createTravelerFElectroDefinition();

export const TRAVELER_F_ELECTRO_KIT_METADATA = {
  executableDamage: ["sourcedElectroSkill", "sourcedElectroBurstHits", "c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    "a1AbundanceAmuletCooldownReduction",
    "a4AmuletEnergyRechargeScaling",
    "c1AdditionalAbundanceAmulet",
    "c2FallingThunderElectroResistanceReduction",
    "c4LowEnergyAmuletEnergyRestoration",
    "c6EveryThirdFallingThunderDamageAndEnergy",
    "p3BurstStackChargedAttackDetonateAndDelayedStrike",
    "skillParticleGeneration",
  ],
} as const;
