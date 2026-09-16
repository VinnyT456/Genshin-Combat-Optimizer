/**
 * Runtime Lohen kit overlay.
 *
 * The generated definition contains the sourced talent tables and the only
 * executable perk channels currently available for Lohen: C3 and C5 talent
 * levels. Masterstroke/Will to Win is lifecycle state that the current
 * generic character vocabulary cannot represent, so those effects remain
 * inert rather than assuming an uptime or damage multiplier.
 */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { lohen } from "../generated/cryo";

const LOHEN_C3_SKILL_TALENT_LEVELS = 3;
const LOHEN_C5_BURST_TALENT_LEVELS = 3;

export function createLohenDefinition(
  constellationLevel = lohen.constellationLevel,
  talentLevels: TalentLevels = lohen.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...lohen,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // C3/C5 are authored as executable generated buffs. All other rows stay
    // description-only because their state/trigger channels are unavailable.
    constellations: lohen.constellations.map((constellation) => ({
      ...constellation,
      ...(constellation.level === 3
        ? { buffs: lohen.constellations.find((entry) => entry.level === 3)?.buffs }
        : constellation.level === 5
          ? { buffs: lohen.constellations.find((entry) => entry.level === 5)?.buffs }
          : {}),
    })),
  };
}

export const lohenWithKit = createLohenDefinition();

export const LOHEN_KIT_METADATA = {
  modelledPerks: ["c3SkillTalentLevel", "c5BurstTalentLevel"],
  c3SkillTalentLevels: LOHEN_C3_SKILL_TALENT_LEVELS,
  c5BurstTalentLevels: LOHEN_C5_BURST_TALENT_LEVELS,
  unsupportedChannels: [
    "a1WillToWinAccumulationAndMasterstrokeState",
    "a4ConditionalPartyAndSelfAttackBuffAfterCryoReaction",
    "c1WillToWinLimitAndPartyAccumulationMultiplier",
    "c2EvilsbaneBladeFollowUpAndPartyElementalMastery",
    "c4MasterstrokeBurstWillToWinMaxAndEnergyRules",
    "c6JoyCritDamageAndMasterstrokeExtension",
    "p3MoodStrikesConditionalDamageAndMasterstrokeState",
    "p4UnhealingThornConditionalDamageAndMasterstrokeState",
  ],
} as const;
