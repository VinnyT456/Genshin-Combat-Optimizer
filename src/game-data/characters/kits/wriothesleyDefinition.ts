/** Runtime overlay for Wriothesley's sourced, executable talent constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { wriothesley } from "../generated/cryo";

/**
 * Wriothesley's C3/C5 talent-level boosts are already generated as conditional
 * constellation buffs. Other damage perks rely on HP/resource/stance state,
 * and C1/C2/C4/C6 values conflict between the configured sources; those stay
 * fail-closed until both evidence and runtime state seams are available.
 */
export function createWriothesleyDefinition(
  constellationLevel = wriothesley.constellationLevel,
  talentLevels: TalentLevels = wriothesley.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...wriothesley,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const WRIOTHESLEY_KIT_METADATA = {
  executableConstellations: ["c3NormalTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    "a1HpGatedGraciousRebukeChargedAttack",
    "a4HpChangeTriggeredChillingPenaltyAttackStacks",
    // The verifier sources disagree on these constellation values.
    "c1GraciousRebukeAndChillingPenaltyStateConflictingValues",
    "c2BurstDamagePerProsecutionEdictConflictingValues",
    "c4OverflowHealingAttackSpeedAndEnhancedRebukeHealing",
    "c6RebukeCritAndAdditionalIcicleConflictingValues",
    "p4HexereiPartyEffect",
  ],
} as const;

export const wriothesleyWithKit = createWriothesleyDefinition();
