/** Runtime overlay for Male Traveler's sourced Pyro talent damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { travelerMPyro } from "../generated/pyro";

/**
 * The generated definition supplies verified talent tables and executable C3/C5
 * talent-level buffs. Keep stateful Nightsoul effects inert until their lifecycle
 * can be represented without assuming resource values or uptime.
 */
export function createTravelerMPyroDefinition(
  constellationLevel = travelerMPyro.constellationLevel,
  talentLevels: TalentLevels = travelerMPyro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const safeConstellation = Number.isFinite(constellationLevel)
    ? Math.max(0, Math.min(6, Math.trunc(constellationLevel)))
    : 0;

  return {
    ...travelerMPyro,
    ...overrides,
    constellationLevel: safeConstellation,
    talentLevels,
  };
}

export const travelerMPyroWithKit = createTravelerMPyroDefinition();

export const TRAVELER_M_PYRO_KIT_METADATA = {
  executableDamage: [
    "sourcedPhysicalNormalAndChargedAttacks",
    "sourcedPhysicalPlunges",
    "sourcedPyroSkill",
    "sourcedPyroBurstHit",
    "c3SkillTalentLevels",
    "c5BurstTalentLevels",
  ],
  unsupportedChannels: [
    "a1NightsoulGatedSkillHitAoESize",
    "a4ReactionAndNightsoulBurstEnergyRestoration",
    "c1ThresholdStatePartyDamageBonus",
    "c2SkillTriggeredNightsoulPointRestoration",
    "c4PostBurstPyroDamageBonus",
    "c6NightsoulStatePyroInfusionAndCriticalDamageBonus",
    "p3NightsoulBurstStacksAndInfernoChargedAttack",
    "skillParticleGeneration",
  ],
} as const;
