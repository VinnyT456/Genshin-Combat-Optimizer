/** Runtime Sigewinne overlay for sourced, executable talent-level channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sigewinne } from "../generated/hydro";

/**
 * Keep the authored talent tables and generated C3/C5 boosts intact. Other
 * sourced text describes lifecycle, healing, or hit-triggered effects that
 * cannot currently be expressed faithfully by this character-kit seam.
 */
export function createSigewinneDefinition(
  constellationLevel = sigewinne.constellationLevel,
  talentLevels: TalentLevels = sigewinne.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...sigewinne,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const SIGEWINNE_KIT_METADATA = {
  supportedChannels: ["sourcedTalentTables", "c3SkillTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    "a1HydroDamageBonusWindowAndOffFieldSkillFlatDamageStacks",
    "a4BondOfLifeDependentHealingBonus",
    "c1BubbleBounceAndA1StackEnhancement",
    "c2PostHitHydroResistanceReductionAndShield",
    "c4BurstDurationExtension",
    "c6HealingTriggeredBurstCritRateAndCritDamage",
    "p3UnderwaterEmergencyHealingAndResistanceReduction",
    "skillBubbleBounceLifecycleAndParticles",
  ],
} as const;

export const sigewinneWithKit = createSigewinneDefinition();
