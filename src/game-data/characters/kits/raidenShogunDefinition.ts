/**
 * Raiden Shogun's generic character template.
 *
 * The generated roster owns sourced multiplier tables. This adapter supplies
 * the kit metadata that cannot be inferred from a talent row alone: Resolve,
 * the Musou Isshin stance, and the constellation support boundary.
 */

import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import type { ArtifactStateEffect } from "@/types";
import { raidenShogun } from "../generated/electro";

const RESOLVE_RESOURCE_ID = "raiden-resolve";

// Resolve coefficients cross-checked against KQM's Raiden guide/library and
// the generated Lunaris/Project Amber talent rows. They are additive ATK
// multipliers per captured Resolve stack, not post-formula damage bonuses.
function resolveScaling(multiplierPerStack: number) {
  return [
    {
      resourceId: RESOLVE_RESOURCE_ID,
      stat: "atk" as const,
      multiplierPerStack,
      snapshot: "cast" as const,
    },
  ];
}

export interface RaidenConstellationMetadata {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  /** Whether the current generic engine can execute this row. */
  support: "modelled" | "described-only";
}

export interface RaidenKitMetadata {
  characterId: "raiden-shogun";
  nameZh: "雷电将军";
  nameEn: "Raiden Shogun";
  resolve: {
    id: "raiden-resolve";
    nameZh: "诸愿百眼之轮·愿力";
    max: 60;
    initial: 0;
    support: "modelled";
  };
  stance: {
    id: "raiden-musou-isshin";
    nameZh: "梦想一心";
    durationSeconds: 7;
    endsOnSwap: true;
    infusionElement: "electro";
    damageType: "burst";
  };
  constellations: readonly RaidenConstellationMetadata[];
}

export const RAIDEN_SHOGUN_KIT_METADATA: RaidenKitMetadata = {
  characterId: "raiden-shogun",
  nameZh: "雷电将军",
  nameEn: "Raiden Shogun",
  resolve: {
    id: "raiden-resolve",
    nameZh: "诸愿百眼之轮·愿力",
    max: 60,
    initial: 0,
    support: "modelled",
  },
  stance: {
    id: "raiden-musou-isshin",
    nameZh: "梦想一心",
    durationSeconds: 7,
    endsOnSwap: true,
    infusionElement: "electro",
    damageType: "burst",
  },
  constellations: [
    {
      level: 1,
      id: "raiden-shogun-c1",
      nameZh: "恶曜盼蕊",
      nameEn: "Ominous Inscription",
      descriptionZh: "诸愿百眼之轮能更加迅速地积攒愿力；雷元素角色施放元素爆发时积攒的愿力提升80%，其他元素角色提升20%。",
      support: "modelled",
    },
    {
      level: 2,
      id: "raiden-shogun-c2",
      nameZh: "斩铁断金",
      nameEn: "Steelbreaker",
      descriptionZh: "梦想一刀与梦想一心状态下的攻击无视敌人60%的防御力。",
      support: "modelled",
    },
    {
      level: 3,
      id: "raiden-shogun-c3",
      nameZh: "真影旧事",
      nameEn: "Shinkage Bygones",
      descriptionZh: "奥义·梦想真说的技能等级提高3级。",
      support: "modelled",
    },
    {
      level: 4,
      id: "raiden-shogun-c4",
      nameZh: "誓奉庆云",
      nameEn: "Pledge of Propriety",
      descriptionZh: "梦想一心状态结束后，附近队伍中其他角色攻击力提升30%，持续10秒。",
      support: "modelled",
    },
    {
      level: 5,
      id: "raiden-shogun-c5",
      nameZh: "凶将显形",
      nameEn: "Shogun's Descent",
      descriptionZh: "神变·恶曜开眼的技能等级提高3级。",
      support: "modelled",
    },
    {
      level: 6,
      id: "raiden-shogun-c6",
      nameZh: "负愿傲命",
      nameEn: "Wishbearer",
      descriptionZh: "梦想一心状态下的攻击命中敌人时，使附近其他角色元素爆发的冷却时间缩短1秒；每1秒至多触发一次，至多触发5次。",
      support: "modelled",
    },
  ],
};

function stanceNormalAttacks(base: GenericCharacterDefinition): NormalAttackString {
  const burstHits = base.burst.instances.slice(1, 6);
  return {
    loops: true,
    hits: burstHits.map((instance, index) => ({
      id: `raiden-shogun-musou-na-${index + 1}`,
      name: `第${index + 1}段伤害（梦想一心）`,
      slot: "normal",
      castTime: 0.4,
      cooldown: { values: [0] },
      energyCost: 0,
      instances: [{
        ...instance,
        id: `raiden-shogun-musou-na-${index + 1}-1`,
        resourceScaling: resolveScaling(0.0071),
      }],
    })),
  };
}

function stanceAbility(base: GenericCharacterDefinition, sourceIndex: number, id: string, name: string, slot: "charged" | "plungeLow" | "plungeHigh"): KitAbility {
  const instance = base.burst.instances[sourceIndex];
  if (!instance) throw new Error(`Missing sourced Raiden burst instance ${sourceIndex}`);
  return {
    id,
    name,
    slot,
    castTime: slot === "charged" ? 0.7 : 0.6,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [{
      ...instance,
      id: `${id}-1`,
      resourceScaling: resolveScaling(
        slot === "charged" ? 0.0099 : 0.0133,
      ),
    }],
  };
}

function raidenStance(
  base: GenericCharacterDefinition,
  constellationLevel: number,
): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: RAIDEN_SHOGUN_KIT_METADATA.stance.id,
    name: RAIDEN_SHOGUN_KIT_METADATA.stance.nameZh,
    durationSeconds: RAIDEN_SHOGUN_KIT_METADATA.stance.durationSeconds,
    endsOnSwap: true,
    infusion: {
      id: "raiden-musou-isshin-infusion",
      element: "electro",
      durationSeconds: RAIDEN_SHOGUN_KIT_METADATA.stance.durationSeconds,
      canBeOverridden: false,
    },
    damageTypeOverride: "burst",
    normalAttacks: stanceNormalAttacks(base),
    chargedAttack: stanceAbility(base, 6, "raiden-shogun-musou-charged", "重击伤害（梦想一心）", "charged"),
    plungeLow: stanceAbility(base, 8, "raiden-shogun-musou-plunge-low", "低空下落伤害（梦想一心）", "plungeLow"),
    plungeHigh: stanceAbility(base, 9, "raiden-shogun-musou-plunge-high", "高空下落伤害（梦想一心）", "plungeHigh"),
    ...(constellationLevel >= 4
      ? {
          stateEndBuffs: [
            {
              id: "raiden-shogun-c4-state-end-atk",
              source: "雷电将军·誓奉庆云",
              sourceCharacterId: "raiden-shogun",
              startTime: 0,
              duration: 10,
              stacking: { mode: "refresh" as const },
              targets: { scope: "party" as const, excludeSource: true },
              modifiers: [{ stat: "atkPercent" as const, value: 0.3 }],
            },
          ],
        }
      : {}),
  };
}

/** Runtime lifecycle effects for constellations that act after a hit. */
export function raidenArtifactStateEffects(
  sourceCharacterId: string,
  constellationLevel: number,
): readonly ArtifactStateEffect[] {
  if (constellationLevel < 6) return [];
  return [
    {
      kind: "cooldownReductionOnHit",
      sourceCharacterId,
      reductionSeconds: 1,
      cooldownSeconds: 1,
      maxTriggers: 5,
      actionTypes: ["normal", "charged", "plungeLow", "plungeHigh"],
      damageTypes: ["burst"],
      requiresStanceId: RAIDEN_SHOGUN_KIT_METADATA.stance.id,
      excludeSource: true,
    },
  ];
}

/** Build a generic Raiden definition for a selected constellation level. */
export function createRaidenShogunDefinition(constellationLevel = 0): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  // The generated skill table contains both the initial cast hit and the
  // Eye's coordinated hit as instances. The latter is a field trigger, so it
  // must not be emitted immediately with the skill cast.
  const generatedSkill = raidenShogun.skill;
  const eyeInstance = generatedSkill.instances[1];
  const skillWithoutEye = {
    ...generatedSkill,
    instances: generatedSkill.instances.slice(0, 1),
    ...(eyeInstance
      ? {
          triggers: [
            {
              id: "raiden-shogun-eye",
              name: "雷罚恶曜之眼协同攻击",
              trigger: "onDamageDealt" as const,
              durationSeconds: 25,
              icdSeconds: 0.9,
              ability: {
                id: "raiden-shogun-eye-hit",
                name: eyeInstance.name,
                slot: "skill" as const,
                castTime: 0,
                cooldown: { values: [0] },
                energyCost: 0,
                instances: [eyeInstance],
              },
              sourceCharacterId: "raiden-shogun",
            },
          ],
        }
      : {}),
  };
  const burstWithResolve = {
    ...raidenShogun.burst,
    instances: raidenShogun.burst.instances.map((instance, index) =>
      index === 0
        ? { ...instance, resourceScaling: resolveScaling(0.0087) }
        : instance,
    ),
  };
  const constellations = raidenShogun.constellations.map((constellation) =>
    constellation.level === 2
      ? {
          ...constellation,
          buffs:
            level >= 2
              ? [
                  {
                    id: "raiden-shogun-c2-def-ignore",
                    source: "雷电将军·斩铁断金",
                    sourceCharacterId: "raiden-shogun",
                    startTime: 0,
                    duration: Number.POSITIVE_INFINITY,
                    stacking: { mode: "refresh" as const },
                    targets: { scope: "self" as const },
                    conditions: { damageTypes: ["burst"] as const },
                    enemyModifiers: [{ key: "defIgnore" as const, value: 0.6 }],
                  },
                ]
              : undefined,
        }
      : constellation,
  );
  return {
    ...raidenShogun,
    skill: skillWithoutEye,
    constellationLevel: level,
    passives: raidenShogun.passives.map((passive) =>
      passive.id === "raiden-shogun-a4"
        ? {
            ...passive,
            buffs: [
              {
                id: "raiden-shogun-a4-er-electro",
                source: "雷电将军·殊胜之御体",
                sourceCharacterId: "raiden-shogun",
                startTime: 0,
                duration: Number.POSITIVE_INFINITY,
                stacking: { mode: "refresh" as const },
                targets: { scope: "self" as const },
                conversions: [
                  {
                    sourceStat: "energyRecharge" as const,
                    targetStat: "elementalDmgBonus" as const,
                    element: "electro" as const,
                    threshold: 1,
                    ratio: 0.4,
                  },
                ],
              },
            ],
          }
        : passive,
    ),
    constellations,
    resources: [
      {
        id: RAIDEN_SHOGUN_KIT_METADATA.resolve.id,
        name: RAIDEN_SHOGUN_KIT_METADATA.resolve.nameZh,
        initial: RAIDEN_SHOGUN_KIT_METADATA.resolve.initial,
        max: RAIDEN_SHOGUN_KIT_METADATA.resolve.max,
        gainOnBurstCast: {
          // Resolve gain is 0.2 per point of the triggering burst's energy
          // cost. C1 raises Electro-burst gains to 180% and other elements
          // to 120%; C0 keeps both multipliers at 100%.
          perEnergyCost: 0.2,
          defaultMultiplier: level >= 1 ? 1.2 : 1,
          multipliersByElement: {
            electro: level >= 1 ? 1.8 : 1,
          },
          excludeSource: true,
        },
        consumeOnBurstCast: true,
      },
    ],
    burst: {
      ...burstWithResolve,
      stance: raidenStance({ ...raidenShogun, burst: burstWithResolve }, level),
    },
  };
}

export const raidenShogunWithKit = createRaidenShogunDefinition();
