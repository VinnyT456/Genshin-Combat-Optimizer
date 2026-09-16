/** Runtime Qiqi kit overlay for sourced, executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { qiqi } from "../generated/cryo";

export function createQiqiDefinition(
  constellationLevel = qiqi.constellationLevel,
  talentLevels: TalentLevels = qiqi.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...qiqi,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const QIQI_KIT_METADATA = {
  unsupportedChannels: [
    "a1LifeProlongingMethodsHealing",
    "a4FortunePreservingTalismanChanceAndCooldown",
    "c1AsceticsOfFrostEnergyRestore",
    "c2FrozenToTheBoneNormalChargedDamageBonusSourceConflict",
    "c4DivineSuppressionEnemyAttackReduction",
    "c6RiteOfResurrectionRevive",
    "p3FormerLifeMemoriesStaminaReduction",
    "p4SevenSacredTreasuresHealingBonus",
  ],
} as const;

export const qiqiWithKit = createQiqiDefinition();
