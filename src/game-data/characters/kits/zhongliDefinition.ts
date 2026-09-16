/** Zhongli runtime overlay: only unconditional, directly sourced hits are executable. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { zhongli } from "../generated/geo";

export function createZhongliDefinition(
  constellationLevel = zhongli.constellationLevel,
  talentLevels: TalentLevels = zhongli.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...zhongli,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // A generic skill cast cannot distinguish hold damage from pillar resonance ticks.
    skill: { ...zhongli.skill, instances: zhongli.skill.instances.slice(0, 1) },
  };
}

export const ZHONGLI_KIT_METADATA = {
  unsupportedMechanics: [
    "skillHoldDamageRequiresHoldAction",
    "stoneSteleResonanceRequiresPillarLifecycleAndTiming",
    "a1JadeShieldFortificationStacks",
    "a4MaxHpBasedDamageForNormalSkillAndBurst",
    "c1AdditionalStoneSteleTargetCount",
    "c2BurstGrantedJadeShield",
    "c4BurstAreaAndPetrificationDuration",
    "c6JadeShieldIncomingDamageToHealing",
    "p3OreCraftingRefund",
  ],
} as const;

export const zhongliWithKit = createZhongliDefinition();
