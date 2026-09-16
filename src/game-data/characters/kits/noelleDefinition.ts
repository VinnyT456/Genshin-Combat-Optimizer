/** Runtime Noelle overlay for Sweeping Time and damage-affecting constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { talentTable, talentValueAt } from "@/simulation/character/talent";
import { noelle } from "../generated/geo";

const BURST_DEF_TO_ATK = talentTable([
  0.4, 0.43, 0.46, 0.5, 0.53, 0.56, 0.6, 0.64, 0.68, 0.72, 0.76, 0.8, 0.85,
]);
const C2_CHARGED_DAMAGE_BONUS = 0.15;
const C6_ADDITIONAL_DEF_TO_ATK = 0.5;
const BURST_DURATION_SECONDS = 15;

const c2ChargedDamageBuff: Buff = {
  id: "noelle-c2-charged-damage",
  source: "Combat Maid",
  sourceCharacterId: noelle.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { damageTypes: ["charged"] },
  modifiers: [{ stat: "dmgBonus", value: C2_CHARGED_DAMAGE_BONUS }],
};

function sweptAbility(ability: KitAbility): KitAbility {
  return {
    ...ability,
    instances: ability.instances.map((instance) => ({ ...instance, element: "geo" })),
  };
}

function sweepingTime(base: GenericCharacterDefinition, constellationLevel: number): StanceDefinition<
  GenericCharacterDefinition["normalAttacks"], KitAbility
> {
  const effectiveBurstLevel = Math.min(15, base.talentLevels.burst + (constellationLevel >= 5 ? 3 : 0));
  const defRatio = talentValueAt(BURST_DEF_TO_ATK, effectiveBurstLevel)
    + (constellationLevel >= 6 ? C6_ADDITIONAL_DEF_TO_ATK : 0);
  return {
    id: "noelle-sweeping-time",
    name: "Sweeping Time",
    durationSeconds: BURST_DURATION_SECONDS,
    endsOnSwap: false,
    infusion: {
      id: "noelle-sweeping-time-geo-infusion",
      element: "geo",
      durationSeconds: BURST_DURATION_SECONDS,
      canBeOverridden: false,
    },
    conversions: [{ sourceStat: "def", targetStat: "atkFlat", ratio: defRatio }],
    normalAttacks: {
      loops: base.normalAttacks.loops,
      hits: base.normalAttacks.hits.map(sweptAbility),
    },
    chargedAttack: base.chargedAttack ? sweptAbility(base.chargedAttack) : undefined,
    plungeLow: base.plungeLow ? sweptAbility(base.plungeLow) : undefined,
    plungeHigh: base.plungeHigh ? sweptAbility(base.plungeHigh) : undefined,
  };
}

export function createNoelleDefinition(
  constellationLevel = noelle.constellationLevel,
  talentLevels: TalentLevels = noelle.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const base = { ...noelle, ...overrides, talentLevels };
  return {
    ...base,
    constellationLevel: level,
    skill: { ...base.skill },
    constellations: base.constellations.map((constellation) =>
      constellation.level === 2
        ? { ...constellation, buffs: [c2ChargedDamageBuff] }
        : constellation,
    ),
    burst: {
      ...base.burst,
      stance: sweepingTime(base, level),
    },
  };
}

export const noelleWithKit = createNoelleDefinition();

export const NOELLE_KIT_METADATA = {
  burstDurationSeconds: BURST_DURATION_SECONDS,
  burstDefToAtkByTalentLevel: BURST_DEF_TO_ATK.values,
  c2ChargedDamageBonus: C2_CHARGED_DAMAGE_BONUS,
  c6AdditionalDefToAtk: C6_ADDITIONAL_DEF_TO_ATK,
  unsupportedChannels: [
    "a1OffFieldShieldTriggerAndAbsorption",
    "a4NormalChargedHitGatedSkillCooldownReduction",
    "c1BurstAndShieldHealingGuarantee",
    "c4ShieldExpiryOrDestructionGeoExplosion",
    "c6OpponentDefeatDurationExtension",
    "p3CookingDoubleProductChance",
    "skillHealingAndShieldLifecycle",
    "skillParticlesUnpublishedBySources",
  ],
} as const;
