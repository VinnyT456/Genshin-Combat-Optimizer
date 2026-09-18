/** Zhongli runtime overlay: only unconditional, directly sourced hits are executable. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { zhongli } from "../generated/geo";

export function createZhongliDefinition(
  constellationLevel = zhongli.constellationLevel,
  talentLevels: TalentLevels = zhongli.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const tapSkill = { ...zhongli.skill, instances: zhongli.skill.instances.slice(0, 1) };
  const holdInstance = zhongli.skill.instances[2];
  if (holdInstance === undefined) throw new Error("Zhongli skill is missing its sourced Hold DMG row");
  const holdSkill = { ...zhongli.skill, instances: [holdInstance] };

  return {
    ...zhongli,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Resonance is still lifecycle-dependent, but the direct Tap and Hold
    // damage rows are now addressable as separate sequence actions.
    skill: tapSkill,
    skillVariants: { tap: tapSkill, hold: holdSkill },
  };
}

export const ZHONGLI_KIT_METADATA = {
  unsupportedMechanics: [
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
