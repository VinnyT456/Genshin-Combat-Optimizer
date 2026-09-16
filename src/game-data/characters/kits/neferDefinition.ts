/** Runtime overlay for Nefer's executable generic kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { nefer } from "../generated/dendro";

export function createNeferDefinition(
  constellationLevel = nefer.constellationLevel,
  talentLevels: TalentLevels = nefer.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...nefer,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const NEFER_KIT_METADATA = {
  unsupportedChannels: [
    "a1MoonsignSeedConversionVeilOfFalsehoodStacksAndEMBuff",
    "a4ShadowDanceVerdantDewBonusAfterLunarBloom",
    "c1PhantasmLunarBloomBaseDamageAndVeilScaling",
    "c2VeilStackLimitEMBuffAndPhantasmDamageIncrease",
    "c4ShadowDanceDendroResistanceReductionAndVerdantDewRate",
    "c6PhantasmAdditionalLunarBloomDamageInstances",
    "p3BloomToLunarBloomConversionAndMoonsignLevel",
    "p4ExpeditionRewardBonus",
  ],
} as const;

export const neferWithKit = createNeferDefinition();
