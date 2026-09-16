/** Yaoyao runtime overlay: retain only damage with an unconditional cast event. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { yaoyao } from "../generated/dendro";

export function createYaoyaoDefinition(
  constellationLevel = yaoyao.constellationLevel,
  talentLevels: TalentLevels = yaoyao.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...yaoyao,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Yuegui's skill is only a summon. Radish damage requires an interval plus
    // target selection (opponents vs. injured teammates), which the generic
    // interval trigger cannot represent without assuming the target.
    skill: { ...yaoyao.skill, instances: [] },
    // The opening Burst hit is unconditional. Subsequent radishes depend on
    // Adeptal Legacy's temporary state, which the source does not encode as a
    // generic cast-only damage event.
    burst: { ...yaoyao.burst, instances: yaoyao.burst.instances.slice(0, 1) },
  };
}

export const YAOYAO_KIT_METADATA = {
  unsupportedMechanics: [
    "yueguiRadishIntervalDamageAndTargetSelection",
    "burstAdeptalLegacyStateAndRadishDamage",
    "a1MovementGatedRadishesDuringAdeptalLegacy",
    "a4RadishExplosionHealing",
    "c1RadishTriggeredDendroBonusAndStaminaRestoration",
    "c2RadishHitEnergyRestorationDuringAdeptalLegacy",
    "c4HpScaledElementalMasteryAfterSkillOrBurst",
    "c6MegaRadishCounterDamageAndHealing",
    "p3WildlifeApproachPassive",
  ],
} as const;

export const yaoyaoWithKit = createYaoyaoDefinition();
