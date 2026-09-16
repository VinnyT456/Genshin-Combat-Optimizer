/** Runtime Emilie overlay for the executable, sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { emilie } from "../generated/dendro";

const EMILIE_C1_SKILL_DAMAGE_BONUS = 0.2;
const EMILIE_A4_DAMAGE_PER_ATK = 0.00015;
const EMILIE_A4_MAX_DAMAGE_BONUS = 0.36;

/**
 * Rectification is evaluated from Emilie's final ATK while the enemy has the
 * Burning compound aura. The conversion seam expresses the sourced
 * 15%/1,000 ATK rule without baking character logic into the resolver.
 */
const a4RectificationBuff: Buff = {
  id: "emilie-a4-rectification",
  source: "Rectification",
  sourceCharacterId: "emilie",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { enemyAuraKinds: ["burning"] },
  conversions: [{
    sourceStat: "atk",
    targetStat: "dmgBonus",
    ratio: EMILIE_A4_DAMAGE_PER_ATK,
    maxCap: EMILIE_A4_MAX_DAMAGE_BONUS,
  }],
};

const c1SkillDamageBuff: Buff = {
  id: "emilie-c1-light-fragrance-leaching",
  source: "Light Fragrance Leaching",
  sourceCharacterId: "emilie",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["emilie-skill"] },
  modifiers: [{ stat: "dmgBonus", value: EMILIE_C1_SKILL_DAMAGE_BONUS }],
};

export function createEmilieDefinition(
  constellationLevel = emilie.constellationLevel,
  talentLevels: TalentLevels = emilie.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? emilie.ascensionPhase;

  return {
    ...emilie,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: emilie.passives.map((passive) =>
      passive.id === "emilie-a4"
        ? { ...passive, buffs: ascensionPhase >= 4 ? [a4RectificationBuff] : [] }
        : passive,
    ),
    constellations: emilie.constellations.map((constellation) =>
      constellation.id === "emilie-c1" && level >= 1
        ? { ...constellation, buffs: [c1SkillDamageBuff] }
        : constellation,
    ),
  };
}

export const EMILIE_KIT_METADATA = {
  c1SkillDamageBonus: EMILIE_C1_SKILL_DAMAGE_BONUS,
  a4DamagePerAtk: EMILIE_A4_DAMAGE_PER_ATK,
  a4MaximumDamageBonus: EMILIE_A4_MAX_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1ScentThresholdCleardewCologneProc",
    "c2BurningGatedDendroResReduction",
    "c4BurstDurationAndScentedDewInterval",
    "c6AbidingFragranceInfusionAndNormalChargedDamage",
    "p3BurningDamageResistance",
  ],
} as const;

export const emilieWithKit = createEmilieDefinition();
