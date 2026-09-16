/** Runtime Dehya overlay for the executable Max-HP and CRIT channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { dehya } from "../generated/pyro";

const DEHYA_C1_MAX_HP_BONUS = 0.2;
const DEHYA_C1_SKILL_HP_RATIO = 0.036;
const DEHYA_C1_BURST_HP_RATIO = 0.06;
const DEHYA_C6_BURST_CRIT_RATE = 0.1;

const c1MaxHpBuff: Buff = {
  id: "dehya-c1-max-hp",
  source: "The Flame Incandescent",
  sourceCharacterId: "dehya",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "hpPercent", value: DEHYA_C1_MAX_HP_BONUS }],
};

const c6BurstCritRateBuff: Buff = {
  id: "dehya-c6-burst-crit-rate",
  source: "The Burning Claws Cleaving",
  sourceCharacterId: "dehya",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["dehya-burst"] },
  modifiers: [{ stat: "critRate", value: DEHYA_C6_BURST_CRIT_RATE }],
};

export function createDehyaDefinition(
  constellationLevel = dehya.constellationLevel,
  talentLevels: TalentLevels = dehya.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const skillInstances = level >= 1
    ? dehya.skill.instances.map((instance) => ({
        ...instance,
        scaling: [
          ...instance.scaling,
          { stat: "hp" as const, table: flatTalent(DEHYA_C1_SKILL_HP_RATIO) },
        ],
      }))
    : dehya.skill.instances;
  const burstInstances = level >= 1
    ? dehya.burst.instances.map((instance) => ({
        ...instance,
        scaling: [
          ...instance.scaling,
          { stat: "hp" as const, table: flatTalent(DEHYA_C1_BURST_HP_RATIO) },
        ],
      }))
    : dehya.burst.instances;

  return {
    ...dehya,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: dehya.passives.map((passive) =>
      passive.id === "dehya-p3"
        ? {
            ...passive,
            buffs: [
              ...(level >= 1 ? [c1MaxHpBuff] : []),
              ...(level >= 6 ? [c6BurstCritRateBuff] : []),
            ],
          }
        : passive,
    ),
    skill: {
      ...dehya.skill,
      instances: skillInstances,
    },
    burst: {
      ...dehya.burst,
      instances: burstInstances,
    },
  };
}

export const dehyaWithKit = createDehyaDefinition();

export const DEHYA_KIT_METADATA = {
  c1MaxHpBonus: DEHYA_C1_MAX_HP_BONUS,
  c1SkillHpRatio: DEHYA_C1_SKILL_HP_RATIO,
  c1BurstHpRatio: DEHYA_C1_BURST_HP_RATIO,
  c6BurstCritRate: DEHYA_C6_BURST_CRIT_RATE,
  unsupportedChannels: [
    "a1RedmanesBloodDamageReductionAndGoldForgedForm",
    "a4LowHpHealing",
    "c2FieldDurationAndAttackBonus",
    "c4BurstEnergyAndHealing",
    "c6BurstCritDamageAndDurationExtension",
    "p3DaytimeMovementSpeed",
  ],
} as const;
