/** Runtime overlay for Wanderer's sourced, executable damage and talent-boost channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { wanderer } from "../generated/anemo";

/**
 * Keep the generated per-level baseline intact. C3/C5 are already represented
 * by source-verified talent-level buffs in generated character data; the
 * simulator resolves those buffs only at the matching constellation level.
 */
export function createWandererDefinition(
  constellationLevel = wanderer.constellationLevel,
  talentLevels: TalentLevels = wanderer.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...wanderer,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const WANDERER_KIT_METADATA = {
  executableConstellations: [3, 5],
  unsupportedChannels: [
    "a1ElementalContactStateBuffs",
    "a4ProbabilisticDescentWindArrows",
    "c1WindfavoredAttackSpeedAndDescentArrowBonus",
    "c2BurstDamageFromMissingKuugoryokuAtCast",
    "c4RandomAdditionalElementalContactBuff",
    "c6WindfavoredNormalAttackTriggeredExtraHit",
    "windfavoredDurationAndKuugoryokuPoolLifecycle",
  ],
  unsupportedReason:
    "Windfavored and Kuugoryoku state are not represented. Keep state-gated/probabilistic damage inert; generated direct skill and burst damage remain executable.",
} as const;

export const wandererWithKit = createWandererDefinition();
