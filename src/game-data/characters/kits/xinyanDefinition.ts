/** Xinyan runtime overlay: sourced baseline hits, with unsupported effects inert. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { xinyan } from "../generated/pyro";

export function createXinyanDefinition(
  constellationLevel = xinyan.constellationLevel,
  talentLevels: TalentLevels = xinyan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...xinyan,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // The generated Skill includes one Pyro swing and one recurring DoT row.
    // No tick cadence/count is sourced here, so do not emit the DoT as an
    // immediate hit. Likewise the Burst's physical hit is absent from the
    // verified generated rows and is deliberately not reconstructed.
    skill: {
      ...xinyan.skill,
      instances: xinyan.skill.instances.filter((instance) => instance.id === "xinyan-skill-1"),
    },
  };
}

export const XINYAN_KIT_METADATA = {
  unsupportedChannels: [
    "skillShieldAndHitCountDependentShieldLevel",
    "skillRecurringPyroDamageTimingAndHitCount",
    "burstPhysicalDamageMissingFromVerifiedGeneratedRows",
    "a1ShieldLevelOpponentHitThreshold",
    "a4ShieldGatedPhysicalDamageBonus",
    "c1CritGatedAttackSpeed",
    "c2PhysicalBurstGuaranteedCriticalAndLevelThreeShield",
    "c4SkillHitGatedPhysicalResistanceReduction",
    "c6ChargedAttackDefenseScaling",
  ],
} as const;

export const xinyanWithKit = createXinyanDefinition();
