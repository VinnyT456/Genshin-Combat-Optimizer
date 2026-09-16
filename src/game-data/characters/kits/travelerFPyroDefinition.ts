/** Runtime overlay for source-backed Female Traveler Pyro damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { travelerFPyro } from "../generated/pyro";

const c4BurstBuff: Buff = {
  id: "traveler-f-pyro-c4-burst-dmg",
  source: "Ravaging Flame",
  sourceCharacterId: "traveler-f-pyro",
  startTime: 0,
  duration: 9,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: 0.2 }],
};

export function createTravelerFPyroDefinition(
  constellationLevel = travelerFPyro.constellationLevel,
  talentLevels: TalentLevels = travelerFPyro.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...travelerFPyro,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...travelerFPyro.burst,
      ...(level >= 4 ? { buffs: [c4BurstBuff] } : {}),
    },
  };
}

export const travelerFPyroWithKit = createTravelerFPyroDefinition();

export const TRAVELER_F_PYRO_KIT_METADATA = {
  supportedChannels: [
    "sourcedPyroSkillDamage",
    "sourcedPyroBurstDamage",
    "c3SkillTalentLevels",
    "c4PostBurstPyroDamageBonus",
    "c5BurstTalentLevels",
  ],
  unsupportedChannels: [
    // A1 enlarges a Nightsoul-dependent skill AoE; that state is not represented.
    "a1NightsoulThresholdSkillAreaUnsupported",
    // Energy restoration depends on reaction/Nightsoul Burst event tracking.
    "a4ReactionAndNightsoulBurstEnergyUnsupported",
    "c1ThresholdFieldActiveCharacterDamageBonusUnsupported",
    "c2SkillNightsoulPointRestorationUnsupported",
    // C6 requires Nightsoul Blessing state for both infusion and CRIT DMG.
    "c6NightsoulGatedPyroInfusionAndCritDamageUnsupported",
    // This passive requires resonated-element bonuses and stack/proc state.
    "p3ForeignStarfireInfernoChargedAttackUnsupported",
    "skillParticlesNotPublished",
  ],
} as const;
