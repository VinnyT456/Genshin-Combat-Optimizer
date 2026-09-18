/** Runtime overlay for Skirk's source-backed combat state and C2 kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition, KitAbility } from "@/simulation/character/kit";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import type { Buff } from "@/simulation/buffs/types";
import type { InfusionDefinition } from "@/simulation/reactions/infusions";
import { skirk } from "../generated/cryo";
import { withCharacterUsage } from "../usageProfile";

const SERPENTS_SUBTLETY = "serpents-subtlety";
const DEATHS_CROSSING = "skirk-deaths-crossing";
const VOID_RIFTS = "skirk-void-rifts";
const WITHER_RIFTS = "skirk-wither-rifts";
const WITHER_ATTACKS = "skirk-wither-attacks";
const SEVEN_PHASE_FLASH = "skirk-seven-phase-flash-active";
const HAVOC_SEVER = "skirk-havoc-sever";
const SEVEN_PHASE_FLASH_DURATION = 12.5;
const SERPENTS_DRAIN_PER_SECOND = 6.667;
const SERPENTS_DRAIN_INTERVAL = 0.2;
const C1_VOID_RIFT_BLADE_RATIO = 5;

const skirkInfusion: InfusionDefinition = {
  id: "skirk-seven-phase-flash-infusion",
  element: "cryo",
  durationSeconds: SEVEN_PHASE_FLASH_DURATION,
  canBeOverridden: false,
  targets: ["normal", "charged", "plunge"],
};

const deathCrossingResource = {
  id: DEATHS_CROSSING,
  name: "Death's Crossing",
  initial: 0,
  max: 3,
  durationSeconds: 20,
  gainOnDamageDealt: {
    elements: ["hydro", "cryo"] as const,
    amount: 1,
    cooldownSeconds: 0,
    excludeOwner: true,
    oncePerSource: true,
  },
};

function deathCrossingBuff(
  id: string,
  minimumStacks: number,
  bonus: number,
  damageTypes: readonly ("normal" | "burst")[],
): Buff {
  return {
    id,
    source: "Return to Oblivion",
    sourceCharacterId: skirk.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      damageTypes,
      resources: [
        { resourceId: SEVEN_PHASE_FLASH, comparator: "gte", value: 1 },
        { resourceId: DEATHS_CROSSING, comparator: "gte", value: minimumStacks },
      ],
    },
    modifiers: [{ stat: "baseDmgMultiplier", value: bonus, damageType: damageTypes[0] }],
  };
}

const deathCrossingBuffs: readonly Buff[] = [
  // KQM reports Normal multiplier totals of 110/120/170% and Burst totals of
  // 105/115/160% at one/two/three stacks.
  deathCrossingBuff("skirk-deaths-crossing-normal-1", 1, 0.1, ["normal"]),
  deathCrossingBuff("skirk-deaths-crossing-normal-2", 2, 0.1, ["normal"]),
  deathCrossingBuff("skirk-deaths-crossing-normal-3", 3, 0.5, ["normal"]),
  deathCrossingBuff("skirk-deaths-crossing-burst-1", 1, 0.05, ["burst"]),
  deathCrossingBuff("skirk-deaths-crossing-burst-2", 2, 0.1, ["burst"]),
  deathCrossingBuff("skirk-deaths-crossing-burst-3", 3, 0.45, ["burst"]),
];

const deathCrossingAttackBuffs: readonly Buff[] = [
  {
    id: "skirk-deaths-crossing-atk-1",
    source: "Fractured Flow",
    sourceCharacterId: skirk.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { resources: [{ resourceId: DEATHS_CROSSING, comparator: "gte", value: 1 }] },
    modifiers: [{ stat: "atkPercent", value: 0.1 }],
  },
  {
    id: "skirk-deaths-crossing-atk-2",
    source: "Fractured Flow",
    sourceCharacterId: skirk.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { resources: [{ resourceId: DEATHS_CROSSING, comparator: "gte", value: 2 }] },
    modifiers: [{ stat: "atkPercent", value: 0.1 }],
  },
  {
    id: "skirk-deaths-crossing-atk-3",
    source: "Fractured Flow",
    sourceCharacterId: skirk.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { resources: [{ resourceId: DEATHS_CROSSING, comparator: "gte", value: 3 }] },
    modifiers: [{ stat: "atkPercent", value: 0.2 }],
  },
];

export interface SkirkPartyComposition {
  readonly allHydroCryo?: boolean;
  readonly hasHydro?: boolean;
  readonly hasCryo?: boolean;
}

function skirkUtilityBuff(): Buff {
  return {
    id: "skirk-mutual-weapons-mentorship",
    source: "Mutual Weapons Mentorship",
    sourceCharacterId: skirk.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    talentLevelModifiers: [{ slot: "skill", levels: 1 }],
  };
}

function specialNormalDamageBonus(talentLevel: number): number {
  const values = [0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.1, 0.1];
  return values[Math.min(values.length, Math.max(1, Math.trunc(talentLevel))) - 1] ?? 0;
}

const c1VoidRiftBlade: DamageInstanceDefinition = {
  id: "skirk-c1-void-rift-blade",
  name: "Crystal Blade DMG",
  damageType: "charged",
  element: "cryo",
  scaling: [],
  application: { element: "cryo", gauge: 1 },
  resourceScaling: [{
    resourceId: VOID_RIFTS,
    stat: "atk",
    multiplierPerStack: C1_VOID_RIFT_BLADE_RATIO,
    maxStacks: 3,
    snapshot: "action",
  }],
};

const c6HavocSeverBurst: DamageInstanceDefinition = {
  id: "skirk-c6-havoc-sever-burst",
  name: "Havoc: Sever Burst Coordinated Attack",
  damageType: "burst",
  element: "cryo",
  scaling: [{ stat: "atk", table: { values: Array.from({ length: 15 }, () => 0) } }],
  resourceScaling: [{
    resourceId: HAVOC_SEVER,
    stat: "atk",
    multiplierPerStack: 7.5,
    maxStacks: 3,
    snapshot: "action",
  }],
  application: { element: "cryo", gauge: 1 },
};

const c6HavocSeverNormal: DamageInstanceDefinition = {
  id: "skirk-c6-havoc-sever-normal",
  name: "Havoc: Sever Normal Coordinated Attack",
  damageType: "normal",
  element: "cryo",
  scaling: [{ stat: "atk", table: { values: Array.from({ length: 15 }, () => 1.8) } }],
  resourceScaling: [{
    resourceId: HAVOC_SEVER,
    stat: "atk",
    multiplierPerStack: 1,
    maxStacks: 1,
    snapshot: "action",
  }],
  application: { element: "cryo", gauge: 1 },
};

const c6HavocSeverNormalAbility: KitAbility = {
  id: "skirk-c6-havoc-sever-normal-attack",
  name: "Havoc: Sever Normal Coordinated Attacks",
  slot: "normal",
  talentChannel: "skill",
  castTime: 0,
  cooldown: { values: [0] },
  energyCost: 0,
  instances: [
    c6HavocSeverNormal,
    { ...c6HavocSeverNormal, id: "skirk-c6-havoc-sever-normal-2" },
    { ...c6HavocSeverNormal, id: "skirk-c6-havoc-sever-normal-3" },
  ],
};

export function createSkirkDefinition(
  constellationLevel = skirk.constellationLevel,
  talentLevels: TalentLevels = skirk.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: SkirkPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const sourced = withCharacterUsage({
    ...skirk,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    constellations: skirk.constellations,
  });
  const resources = [
    ...sourced.resources.filter((resource) => resource.id !== DEATHS_CROSSING),
    deathCrossingResource,
    {
      id: VOID_RIFTS,
      name: "Void Rifts",
      initial: 0,
      max: 3,
      gainOnReaction: {
        reactions: ["frozen", "superconduct", "swirl", "crystallize"] as const,
        amount: 1,
        cooldownSeconds: 2.5,
        excludeOwner: true,
      },
    },
    {
      id: SEVEN_PHASE_FLASH,
      name: "Seven-Phase Flash active",
      initial: 0,
      max: 1,
      durationSeconds: SEVEN_PHASE_FLASH_DURATION,
    },
    { id: WITHER_RIFTS, name: "Absorbed Void Rifts", initial: 0, max: 3 },
    { id: WITHER_ATTACKS, name: "All Shall Wither attacks", initial: 0, max: 10 },
    { id: HAVOC_SEVER, name: "Havoc: Sever stacks", initial: 0, max: 3, durationSeconds: 15 },
  ];
  const c2ResourceGain = level >= 2
    ? [{ resourceId: SERPENTS_SUBTLETY, kind: "gain" as const, amount: 10 }]
    : [];
  const stateNormalHits: KitAbility[] = sourced.skill.instances.slice(0, 5).map((instance, index) => ({
    id: `skirk-seven-phase-normal-${index + 1}`,
    name: `Seven-Phase Flash Normal ${index + 1}`,
    slot: "normal",
    talentChannel: "skill",
    castTime: sourced.normalAttacks.hits[index]?.castTime ?? 0.4,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [{ ...instance, damageType: "normal" as const }],
  }));
  const stateChargedAttack: KitAbility = {
    id: "skirk-seven-phase-charged",
    name: "Seven-Phase Flash Charged Attack",
    slot: "charged",
    talentChannel: "skill",
    castTime: sourced.chargedAttack?.castTime ?? 0.7,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [
      ...sourced.skill.instances.slice(5, 8).map((instance) => ({
        ...instance,
        damageType: "charged" as const,
      })),
      ...(level >= 1 ? [c1VoidRiftBlade] : []),
    ],
  };
  const statePlungeLow: KitAbility = {
    id: "skirk-seven-phase-plunge-low",
    name: "Seven-Phase Flash Low Plunge",
    slot: "plungeLow",
    talentChannel: "skill",
    castTime: sourced.plungeLow?.castTime ?? 0.6,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: sourced.skill.instances[9] === undefined
      ? []
      : [{ ...sourced.skill.instances[9], damageType: "plunge" as const }],
  };
  const statePlungeHigh: KitAbility = {
    id: "skirk-seven-phase-plunge-high",
    name: "Seven-Phase Flash High Plunge",
    slot: "plungeHigh",
    talentChannel: "skill",
    castTime: sourced.plungeHigh?.castTime ?? 0.6,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: sourced.skill.instances[10] === undefined
      ? []
      : [{ ...sourced.skill.instances[10], damageType: "plunge" as const }],
  };
  const standardBurstInstances = sourced.burst.instances.map((instance) => ({
    ...instance,
    resourceScaling: [
      ...(instance.resourceScaling ?? []),
      {
        resourceId: SERPENTS_SUBTLETY,
        stat: "atk" as const,
        multiplierPerStack: 0.3478,
        threshold: 50,
        maxStacks: level >= 2 ? 22 : 12,
        snapshot: "cast" as const,
      },
    ],
  }));
  const specialNormalBonus = specialNormalDamageBonus(talentLevels.burst);
  const specialBurstBuffs: Buff[] = [
    {
      id: "skirk-all-shall-wither-normal-bonus-1",
      source: "All Shall Wither",
      sourceCharacterId: skirk.id,
      startTime: 0,
      duration: SEVEN_PHASE_FLASH_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: {
        damageTypes: ["normal"],
        resources: [{ resourceId: WITHER_ATTACKS, comparator: "gte", value: 1 }],
      },
      resourceModifiers: [{
        resourceId: WITHER_RIFTS,
        owner: "source",
        targetStat: "dmgBonus",
        ratio: specialNormalBonus,
      }],
    },
    {
      id: "skirk-all-shall-wither-normal-bonus-2",
      source: "All Shall Wither",
      sourceCharacterId: skirk.id,
      startTime: 0,
      duration: SEVEN_PHASE_FLASH_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: {
        damageTypes: ["normal"],
        resources: [{ resourceId: WITHER_ATTACKS, comparator: "gte", value: 2 }],
      },
      resourceModifiers: [{
        resourceId: WITHER_RIFTS,
        owner: "source",
        targetStat: "dmgBonus",
        ratio: specialNormalBonus * 0.5,
      }],
    },
    {
      id: "skirk-all-shall-wither-normal-bonus-3",
      source: "All Shall Wither",
      sourceCharacterId: skirk.id,
      startTime: 0,
      duration: SEVEN_PHASE_FLASH_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: {
        damageTypes: ["normal"],
        resources: [{ resourceId: WITHER_ATTACKS, comparator: "gte", value: 3 }],
      },
      resourceModifiers: [{
        resourceId: WITHER_RIFTS,
        owner: "source",
        targetStat: "dmgBonus",
        ratio: specialNormalBonus * 0.5,
      }],
    },
    ...(level >= 2
      ? [{
          id: "skirk-c2-havoc-attack",
          source: "Into the Abyss",
          sourceCharacterId: skirk.id,
          startTime: 0,
          duration: SEVEN_PHASE_FLASH_DURATION,
          stacking: { mode: "refresh" as const },
          targets: { scope: "self" as const },
          conditions: {
            requiresOnField: true,
            resources: [{ resourceId: WITHER_ATTACKS, comparator: "gte" as const, value: 1 }],
          },
          modifiers: [{ stat: "atkPercent" as const, value: 0.7 }],
        } satisfies Buff]
      : []),
  ];
  const specialBurst = {
    ...sourced.burst,
    id: "skirk-havoc-extinction",
    name: "Havoc: Extinction",
    energyCost: 0,
    cost: undefined,
    instances: level >= 1 ? [c1VoidRiftBlade] : [],
    effects: [{ resourceId: WITHER_ATTACKS, kind: "set" as const, amount: 10 }],
    resourceTransfers: [
      ...(level >= 6 ? [{
        sourceResourceId: VOID_RIFTS,
        targetResourceId: HAVOC_SEVER,
        amountPerSourceUnit: 1,
        maxSourceUnits: 3,
      }] : []),
      {
        sourceResourceId: VOID_RIFTS,
        targetResourceId: WITHER_RIFTS,
        amountPerSourceUnit: 1,
        maxSourceUnits: 3,
      },
      {
        sourceResourceId: VOID_RIFTS,
        targetResourceId: SERPENTS_SUBTLETY,
        amountPerSourceUnit: 8,
        maxSourceUnits: 3,
        consumeSource: true,
      },
    ],
    buffs: specialBurstBuffs,
  };
  const flashChargedAttack = sourced.chargedAttack === undefined
    ? undefined
    : {
        ...sourced.chargedAttack,
        resourceTransfers: [
          ...(level >= 6 ? [{
            sourceResourceId: VOID_RIFTS,
            targetResourceId: HAVOC_SEVER,
            amountPerSourceUnit: 1,
            maxSourceUnits: 3,
          }] : []),
          {
            sourceResourceId: VOID_RIFTS,
            targetResourceId: SERPENTS_SUBTLETY,
            amountPerSourceUnit: 8,
            maxSourceUnits: 3,
            consumeSource: true,
          },
        ],
      };
  const c6HavocSeverBurstTrigger: TriggeredEffectDefinition<KitAbility> = {
    id: "skirk-c6-havoc-sever-burst-trigger",
    name: "Havoc: Sever Burst Coordinated Attack",
    trigger: "onBurstCast",
    durationSeconds: Number.POSITIVE_INFINITY,
    icdSeconds: 0,
    sourceCharacterId: skirk.id,
    eventSourceCharacterId: skirk.id,
    eventAbilityIds: [sourced.burst.id],
    requiredResourceMinimum: { resourceId: HAVOC_SEVER, amount: 1 },
    ability: {
      ...sourced.burst,
      id: "skirk-c6-havoc-sever-burst-attack",
      name: "Havoc: Sever Burst Coordinated Attacks",
      instances: [c6HavocSeverBurst],
      energyCost: 0,
    },
    stateEffectsAfterAbility: [{ resourceId: HAVOC_SEVER, kind: "consume", amount: 3 }],
  };

  const skillEffects = [
    ...(sourced.skill.effects ?? []),
    { resourceId: SEVEN_PHASE_FLASH, kind: "set" as const, amount: 1 },
    ...c2ResourceGain,
  ];
  const holdSkillEffects = [
    ...(sourced.skill.effects ?? []),
    ...c2ResourceGain,
  ];
  const holdSkillResourceTransfers = [
    ...(level >= 6 ? [{
      sourceResourceId: VOID_RIFTS,
      targetResourceId: HAVOC_SEVER,
      amountPerSourceUnit: 1,
      maxSourceUnits: 3,
    }] : []),
    {
      sourceResourceId: VOID_RIFTS,
      targetResourceId: SERPENTS_SUBTLETY,
      amountPerSourceUnit: 8,
      maxSourceUnits: 3,
      consumeSource: true,
    },
  ];
  const tapSkill: KitAbility = {
    ...sourced.skill,
    instances: [],
    cooldownStartsAfterStance: true,
    effects: skillEffects,
    stance: {
      id: "skirk-seven-phase-flash",
      name: "Seven-Phase Flash",
      durationSeconds: SEVEN_PHASE_FLASH_DURATION,
      endsOnSwap: true,
      infusion: skirkInfusion,
      normalAttacks: { hits: stateNormalHits, loops: true },
      chargedAttack: { ...stateChargedAttack, resourceTransfers: flashChargedAttack?.resourceTransfers },
      plungeLow: statePlungeLow,
      plungeHigh: statePlungeHigh,
      burst: specialBurst,
      triggers: level >= 6 ? [
        {
          id: "skirk-c6-havoc-sever-normal-trigger",
          name: "Havoc: Sever Normal Coordinated Attack",
          trigger: "onDamageDealt",
          durationSeconds: SEVEN_PHASE_FLASH_DURATION,
          icdSeconds: 0,
          sourceCharacterId: skirk.id,
          eventSourceCharacterId: skirk.id,
          eventAbilityIds: [
            "skirk-seven-phase-normal-3",
            "skirk-seven-phase-normal-5",
          ],
          eventDamageTypes: ["normal"],
          requiredResourceMinimum: { resourceId: HAVOC_SEVER, amount: 1 },
          ability: c6HavocSeverNormalAbility,
          stateEffectsAfterAbility: [{ resourceId: HAVOC_SEVER, kind: "consume", amount: 1 }],
        },
      ] : undefined,
      postActionResourceCosts: [{
        resourceId: WITHER_ATTACKS,
        amount: 1,
      }],
      resourceDrain: {
        resourceId: SERPENTS_SUBTLETY,
        amountPerSecond: SERPENTS_DRAIN_PER_SECOND,
        intervalSeconds: SERPENTS_DRAIN_INTERVAL,
        endWhenDepleted: true,
      },
      resetResourcesOnEnd: [SERPENTS_SUBTLETY, WITHER_RIFTS, WITHER_ATTACKS, SEVEN_PHASE_FLASH],
    },
  };
  const holdSkill: KitAbility = {
    ...sourced.skill,
    name: `${sourced.skill.name} (Hold)`,
    instances: level >= 1 ? [c1VoidRiftBlade] : [],
    cooldownStartsAfterStance: true,
    effects: holdSkillEffects,
    resourceTransfers: holdSkillResourceTransfers,
    // Hold is a movement state, not Seven-Phase Flash. It absorbs nearby
    // Void Rifts, grants 8 Serpent's Subtlety per Rift, and C1 summons one
    // Crystal Blade per absorbed Rift through resource-scaled damage.
    stance: {
      id: "skirk-havoc-warp-hold",
      name: "Havoc: Warp Hold",
      durationSeconds: sourced.skill.castTime,
      endsOnSwap: true,
    },
  };

  return {
    ...sourced,
    resources,
    passives: sourced.passives.map((passive) =>
      passive.id === "skirk-a4"
        ? {
            ...passive,
            buffs: sourced.ascensionPhase >= 4
              ? [...deathCrossingBuffs, ...(level >= 4 ? deathCrossingAttackBuffs : [])]
              : undefined,
          }
        : passive.id === "skirk-p3" && composition.allHydroCryo && composition.hasHydro && composition.hasCryo
          ? { ...passive, buffs: [skirkUtilityBuff()] }
        : passive,
    ),
    skill: tapSkill,
    skillVariants: { tap: tapSkill, hold: holdSkill },
    burst: {
      ...sourced.burst,
      instances: standardBurstInstances,
      triggers: level >= 6 ? [c6HavocSeverBurstTrigger] : undefined,
    },
  };
}

export const SKIRK_KIT_METADATA = {
  supportedConstellations: [2, 4, 6],
  supportedChannels: [
    "serpentsSubtletySkillGainAndBurstCost",
    "serpentsSubtletyBurstOverflowScaling",
    "sevenPhaseFlashStanceAndCryoInfusion",
    "c2HavocExtinctionAndAttackBonus",
    "c1VoidRiftBladeChargedDamage",
    "deathsCrossingHydroCryoGainsAndAttackBonus",
    "a1VoidRiftCreationAndAbsorption",
    "a1HoldSkillAbsorption",
    "a4ExactStackTriggerTiming",
    "utilitySkillLevelPartyCondition",
    "c4DeathCrossingAttackScaling",
    "c6HavocSeverCoordinatedAttacks",
  ],
  unsupportedChannels: [
    "c6HavocSeverDamageReduction",
  ],
} as const;

export const skirkWithKit = createSkirkDefinition();
