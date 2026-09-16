/** Runtime Lauma overlay for the executable passive and talent-level seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { lauma } from "../generated/dendro";

const LAUMA_A4_SKILL_DAMAGE_PER_EM = 0.0004;
const LAUMA_A4_MAX_SKILL_DAMAGE_BONUS = 0.32;

/**
 * Cleansing for the Spring increases Lauma's Skill damage from her EM. The
 * ability gate matters: this must not leak onto her Normal Attacks or Burst.
 */
const a4SkillDamageBuff: Buff = {
  id: "lauma-a4-cleansing-for-the-spring",
  source: "Cleansing for the Spring",
  sourceCharacterId: "lauma",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["lauma-skill"] },
  conversions: [{
    sourceStat: "elementalMastery",
    targetStat: "dmgBonus",
    ratio: LAUMA_A4_SKILL_DAMAGE_PER_EM,
    maxCap: LAUMA_A4_MAX_SKILL_DAMAGE_BONUS,
  }],
};

export function createLaumaDefinition(
  constellationLevel = lauma.constellationLevel,
  talentLevels: TalentLevels = lauma.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? lauma.ascensionPhase;

  return {
    ...lauma,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: lauma.passives.map((passive) =>
      passive.id === "lauma-a4"
        ? { ...passive, buffs: ascensionPhase >= 4 ? [a4SkillDamageBuff] : [] }
        : passive,
    ),
  };
}

export const LAUMA_KIT_METADATA = {
  a4SkillDamagePerElementalMastery: LAUMA_A4_SKILL_DAMAGE_PER_EM,
  a4MaximumSkillDamageBonus: LAUMA_A4_MAX_SKILL_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1MoonsignDependentLunarBloomCriticalRules",
    "a1AndBurstPaleHymnReactionDamageBonuses",
    "a4SpiritEnvoyChargedAttackCooldownReduction",
    "p3BloomToLunarBloomConversionAndMoonsignPartyState",
    "c1ThreadsOfLifeHealingAndSpiritEnvoyDuration",
    "c2BurstReactionDamageBonusesScalingFromLaumaElementalMastery",
    "c4FrostgroveSanctuaryEnergyRefund",
    "c6SanctuaryAdditionalLunarBloomHitAndPaleHymnNormalAttackState",
  ],
} as const;

export const laumaWithKit = createLaumaDefinition();
