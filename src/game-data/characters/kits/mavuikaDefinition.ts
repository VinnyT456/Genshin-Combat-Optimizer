/**
 * Runtime Mavuika kit overlay.
 *
 * The generated definition already contains the executable C3 burst and C5
 * skill talent-level buffs. Fighting Spirit, Nightsoul's Blessing, and
 * Flamestrider/Ring form state are not declared by the current generic
 * character vocabulary, so those effects remain inert rather than assuming
 * a resource value, uptime, or trigger cadence.
 */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { mavuika } from "../generated/pyro";

const MAVUIKA_C3_BURST_TALENT_LEVELS = 3;
const MAVUIKA_C5_SKILL_TALENT_LEVELS = 3;

export function createMavuikaDefinition(
  constellationLevel = mavuika.constellationLevel,
  talentLevels: TalentLevels = mavuika.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...mavuika,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // C3/C5 are sourced executable buffs. All other perk rows remain
    // description-only because their state/trigger channels are unavailable.
    constellations: mavuika.constellations.map((constellation) => ({
      ...constellation,
      ...(constellation.level === 3
        ? { buffs: mavuika.constellations.find((entry) => entry.level === 3)?.buffs }
        : constellation.level === 5
          ? { buffs: mavuika.constellations.find((entry) => entry.level === 5)?.buffs }
          : {}),
    })),
  };
}

export const mavuikaWithKit = createMavuikaDefinition();

export const MAVUIKA_KIT_METADATA = {
  modelledPerks: ["c3BurstTalentLevel", "c5SkillTalentLevel"],
  c3BurstTalentLevels: MAVUIKA_C3_BURST_TALENT_LEVELS,
  c5SkillTalentLevels: MAVUIKA_C5_SKILL_TALENT_LEVELS,
  unsupportedChannels: [
    "a1NightsoulBurstTriggeredAtkAndDuration",
    "a4FightingSpiritBurstDamageBuffAndDecay",
    "c1NightsoulMaximumFightingSpiritEfficiencyAndAtkBuff",
    "c2NightsoulBlessingFormDependentDefReductionAndAttackDamage",
    "c4FightingSpiritDamageBuffNoDecayAndAdditionalBonus",
    "c6FormDependentRingFollowUpAndDefReduction",
    "p3PhlogistonExhaustAndNightsoulTransmission",
    "p4NightsoulTransmissionCooldownReduction",
  ],
} as const;
