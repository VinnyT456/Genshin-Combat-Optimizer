/** Runtime overlay for Sucrose's sourced, executable constellation damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sucrose } from "../generated/anemo";

/**
 * Keep the generated talent tables and sourced C3/C5 talent-level boosts intact.
 * Triggered EM sharing, Burst duration, and absorbed-element effects are not
 * expressed here because their runtime gates are unsupported or source-conflicted.
 */
export function createSucroseDefinition(
  constellationLevel = sucrose.constellationLevel,
  talentLevels: TalentLevels = sucrose.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...sucrose,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const SUCROSE_KIT_METADATA = {
  supportedConstellations: ["c3SkillTalentLevel", "c5BurstTalentLevel"],
  unsupportedChannels: [
    "a1SwirlTriggeredMatchingElementMastery",
    "a4HitTriggeredSucroseMasterySharing",
    "c1AdditionalSkillCharge",
    "c2BurstDurationExtension",
    "c4NormalChargedHitGatedSkillCooldownReduction",
    "c6AbsorptionGatedElementalDamageBonusSourceConflict",
    "p3CraftingDoubleRewardChance",
    "p4HexereiPartyAndWindSpiritDamageBuffUnverifiedStateGate",
  ],
} as const;

export const sucroseWithKit = createSucroseDefinition();
