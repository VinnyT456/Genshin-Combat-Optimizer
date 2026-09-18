/** Runtime Escoffier overlay for the executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { HealingDefinition, KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import { escoffier } from "../generated/cryo";

const ESCOFFIER_A4_MAX_COUNT = 4;
const ESCOFFIER_A4_RES_REDUCTION = [0, 0.05, 0.1, 0.15, 0.55] as const;
const ESCOFFIER_A4_DURATION_SECONDS = 12;
const ESCOFFIER_C1_CRYO_CRIT_DMG = 0.6;
const ESCOFFIER_C1_DURATION_SECONDS = 15;
const ESCOFFIER_C2_COLD_DISH = "escoffier-cold-dish-stacks";
const ESCOFFIER_C2_COLD_DISH_COUNT = 5;
const ESCOFFIER_C2_DAMAGE_RATIO = 2.4;
const ESCOFFIER_C6_PARFAIT_RATIO = 5;

const ESCOFFIER_BURST_HEALING: HealingDefinition = {
  id: "escoffier-scoring-cuts-healing",
  name: "Scoring Cuts healing",
  target: "party",
  scaling: [{
    stat: "atk",
    table: { values: [1.72, 1.849, 1.978, 2.15, 2.279, 2.408, 2.58, 2.753, 2.925, 3.097, 3.269, 3.441, 3.656, 3.656, 3.656] },
  }],
  flat: { values: [1079, 1186, 1303, 1429, 1564, 1708, 1861, 2022, 2193, 2373, 2562, 2759, 2966, 2966, 2966] },
};

function rehabDietHealing(constellationLevel: number): HealingDefinition {
  return {
  id: "escoffier-rehab-diet",
  name: "Rehab Diet",
  target: "active",
  scaling: [{
    stat: "atk",
    table: { values: Array.from({ length: 15 }, () => 1.3824) },
  }],
  intervalSeconds: 1,
  durationSeconds: constellationLevel >= 4 ? 15 : 9,
  ...(constellationLevel >= 4
    ? { bonusMultiplierFromStat: { stat: "critRate" as const, ratio: 1 } }
    : {}),
  };
}

/**
 * The generated data does not identify party elements. Callers must provide
 * the sourced Hydro/Cryo count; omitted or invalid input leaves these effects
 * inactive rather than inferring composition from character ids.
 */
export interface EscoffierPartyComposition {
  readonly hydroOrCryoCount?: number;
}

function boundedPartyCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), ESCOFFIER_A4_MAX_COUNT);
}

function a4Buff(count: number): Buff | undefined {
  const value = ESCOFFIER_A4_RES_REDUCTION[count];
  if (value === undefined || value === 0) return undefined;
  return {
    id: "escoffier-a4-hydro-cryo-res-shred",
    source: "Inspiration-Immersed Seasoning",
    sourceCharacterId: "escoffier",
    startTime: 0,
    duration: ESCOFFIER_A4_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    enemyModifiers: [
      { key: "resReduction", element: "hydro", value },
      { key: "resReduction", element: "cryo", value },
    ],
  };
}

function c1Buff(): Buff {
  return {
    id: "escoffier-c1-cryo-crit-dmg",
    source: "Pre-Dinner Dance for Your Taste Buds",
    sourceCharacterId: "escoffier",
    startTime: 0,
    duration: ESCOFFIER_C1_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    conditions: { elements: ["cryo"] },
    modifiers: [{ stat: "critDmg", value: ESCOFFIER_C1_CRYO_CRIT_DMG }],
  };
}

function c2ColdDishBuff(): Buff {
  return {
    id: "escoffier-c2-cold-dish-bonus",
    source: "Fresh, Fragrant Stew Is an Art",
    sourceCharacterId: escoffier.id,
    startTime: 0,
    duration: 15,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    conditions: {
      elements: ["cryo"],
      damageTypes: ["normal", "charged", "plunge", "skill", "burst"],
      resources: [{ resourceId: ESCOFFIER_C2_COLD_DISH, comparator: "gte", value: 1, owner: "source" }],
      excludeSourceCharacter: true,
    },
    resourceModifiers: [{
      resourceId: ESCOFFIER_C2_COLD_DISH,
      owner: "source",
      targetStat: "flatDamageBonus",
      ratio: ESCOFFIER_C2_DAMAGE_RATIO,
    }],
  };
}

function abilityWithPostCastBuff(ability: KitAbility, buffs: readonly Buff[]): KitAbility {
  return buffs.length === 0 ? ability : { ...ability, buffs };
}

export function createEscoffierDefinition(
  constellationLevel = escoffier.constellationLevel,
  talentLevels: TalentLevels = escoffier.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: EscoffierPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.min(Math.max(Math.trunc(constellationLevel), 0), 6);
  const ascensionPhase = overrides.ascensionPhase ?? escoffier.ascensionPhase;
  const count = boundedPartyCount(composition.hydroOrCryoCount);
  const buffs: Buff[] = [];

  if (ascensionPhase >= 4) {
    const a4 = a4Buff(count);
    if (a4) buffs.push(a4);
  }
  // C1 requires the four-Hydro/Cryo A4 party condition. It is authored on
  // both damaging casts and becomes active after the triggering cast resolves.
  if (level >= 1 && ascensionPhase >= 4 && count === ESCOFFIER_A4_MAX_COUNT) {
    buffs.push(c1Buff());
  }

  const cookingMekInstances = escoffier.skill.instances.slice(1);
  const cookingMekIntervals = [1, 10] as const;
  const cookingMekTriggers: TriggeredEffectDefinition<KitAbility>[] = cookingMekInstances.flatMap((instance, index) => {
    const id = index === 0 ? "escoffier-cooking-mek-parfait" : "escoffier-cooking-mek-blade";
    const ability: KitAbility = {
      ...escoffier.skill,
      id,
      name: instance.name,
      castTime: 0,
      cooldown: { values: [0] },
      energyCost: 0,
      particles: undefined,
      instances: [instance],
      triggers: undefined,
    };
    return [{
      id: `${id}-interval-trigger`,
      name: `${instance.name} interval`,
      trigger: "onInterval" as const,
      durationSeconds: 20,
      intervalSeconds: cookingMekIntervals[index] ?? 1,
      icdSeconds: 0,
      maxProcs: index === 0 ? 20 : 2,
      snapshotMode: "dynamic" as const,
      sourceCharacterId: escoffier.id,
      ability,
    }];
  });
  const c2Buffs = level >= 2 ? [c2ColdDishBuff()] : [];
  const c2ConsumptionTrigger: TriggeredEffectDefinition<KitAbility>[] = level >= 2 ? [{
    id: "escoffier-c2-cold-dish-consumption",
    name: "Cold Dish consumption",
    trigger: "onDamageDealtBeforeHit",
    durationSeconds: 15,
    icdSeconds: 0,
    sourceCharacterId: escoffier.id,
    excludeEventSourceCharacterId: true,
    eventSourceMustBeActive: true,
    eventDamageTypes: ["normal", "charged", "plunge", "skill", "burst"],
    eventElements: ["cryo"],
    requiredResourceMinimum: { resourceId: ESCOFFIER_C2_COLD_DISH, amount: 1 },
    stateEffects: [{ resourceId: ESCOFFIER_C2_COLD_DISH, kind: "consume", amount: 1 }],
  }] : [];
  const c6ParfaitInstance = cookingMekInstances[0];
  const c6ParfaitTriggers: TriggeredEffectDefinition<KitAbility>[] = level >= 6 && c6ParfaitInstance !== undefined ? [{
    id: "escoffier-c6-special-grade-frosty-parfait",
    name: "Special-Grade Frosty Parfait",
    trigger: "onDamageDealt",
    durationSeconds: 20,
    icdSeconds: 0.5,
    maxProcs: 6,
    sourceCharacterId: escoffier.id,
    eventSourceMustBeActive: true,
    eventDamageTypes: ["normal", "charged", "plunge"],
    ability: {
      ...escoffier.skill,
      id: "escoffier-c6-special-grade-frosty-parfait-attack",
      name: "Special-Grade Frosty Parfait",
      particles: undefined,
      instances: [{
        ...c6ParfaitInstance,
        id: "escoffier-c6-special-grade-frosty-parfait-instance",
        scaling: [{ stat: "atk", table: { values: Array.from({ length: 15 }, () => ESCOFFIER_C6_PARFAIT_RATIO) } }],
      }],
    },
  }] : [];
  const c4EnergyTriggers: TriggeredEffectDefinition<KitAbility>[] = level >= 4 ? [{
    id: "escoffier-c4-rehab-diet-energy",
    name: "Secret Rosemary Recipe energy",
    trigger: "onInterval",
    durationSeconds: 15,
    intervalSeconds: 1,
    icdSeconds: 0,
    maxProcs: 7,
    sourceCharacterId: escoffier.id,
    energyGeneratedBySourceStat: { stat: "critRate", ratio: 2 },
  }] : [];

  return {
    ...escoffier,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    resources: [
      ...escoffier.resources,
      ...(level >= 2 ? [{
        id: ESCOFFIER_C2_COLD_DISH,
        name: "Freshly-Prepped Delicacy Cold Dish stacks",
        initial: 0,
        max: ESCOFFIER_C2_COLD_DISH_COUNT,
        durationSeconds: 15,
      }] : []),
    ],
    passives: escoffier.passives.map((passive) =>
      passive.id === "escoffier-a4"
        ? { ...passive, buffs: [...buffs, ...c2Buffs] }
        : passive,
    ),
    skill: abilityWithPostCastBuff({
      ...escoffier.skill,
      instances: escoffier.skill.instances.slice(0, 1),
      effects: [
        ...(escoffier.skill.effects ?? []),
        ...(level >= 2 ? [{ resourceId: ESCOFFIER_C2_COLD_DISH, kind: "set" as const, amount: ESCOFFIER_C2_COLD_DISH_COUNT }] : []),
      ],
      triggers: [...cookingMekTriggers, ...c2ConsumptionTrigger, ...c6ParfaitTriggers],
    }, buffs),
    burst: abilityWithPostCastBuff({
      ...escoffier.burst,
      healing: [
        ESCOFFIER_BURST_HEALING,
        ...(ascensionPhase >= 1 ? [rehabDietHealing(level)] : []),
      ],
      triggers: c4EnergyTriggers,
    }, buffs),
  };
}

export const escoffierWithKit = createEscoffierDefinition();

export const ESCOFFIER_KIT_METADATA = {
  a4ResReductionByHydroOrCryoCount: ESCOFFIER_A4_RES_REDUCTION,
  a4DurationSeconds: ESCOFFIER_A4_DURATION_SECONDS,
  c1CryoCritDmg: ESCOFFIER_C1_CRYO_CRIT_DMG,
  c1DurationSeconds: ESCOFFIER_C1_DURATION_SECONDS,
  c2ColdDishStacks: ESCOFFIER_C2_COLD_DISH_COUNT,
  c2ColdDishDamageRatio: ESCOFFIER_C2_DAMAGE_RATIO,
  c6SpecialGradeParfaitRatio: ESCOFFIER_C6_PARFAIT_RATIO,
  supportedChannels: [
    "a1RehabDietHealing",
    "burstPartyHealing",
    "a4HydroCryoResistanceReduction",
    "c2FreshlyPreppedDelicacyColdDishStacksAndCryoDamageBonus",
    "c4RehabDietExtraHealingAndEnergy",
    "c6ColdStorageSpecialGradeFrostyParfait",
  ],
  unsupportedChannels: [
    "p3OffTheCuffCookeryCookingMek",
  ],
} as const;
