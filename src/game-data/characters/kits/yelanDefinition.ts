/** Runtime Yelan overlay for Exquisite Throw, C2, A4 and C6 state. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { yelan } from "../generated/hydro";

const EXQUISITE_THROW_DURATION_SECONDS = 15;
const EXQUISITE_THROW_ICD_SECONDS = 1;
const YELAN_C6_ARROWS = "yelan-mastermind-arrows";
const YELAN_A4_RAMP = "yelan-adapt-with-ease";
const YELAN_C4_HP_STACKS = "yelan-c4-marked-enemies";

export interface YelanPartyComposition {
  /** Number of distinct elemental types in the team, including Hydro. */
  readonly distinctElementCount?: number;
}

const breakthroughBarbAtNormalTalent: readonly number[] = [
  0.1158, 0.1244, 0.1331, 0.1447, 0.1534, 0.1621, 0.1736,
  0.1852, 0.1968, 0.2084, 0.2199, 0.2199, 0.2199, 0.2199, 0.2199,
];

function yelanA1Buff(distinctElementCount: number): Buff | undefined {
  const bonus = [0, 0.06, 0.12, 0.18, 0.3][Math.min(4, Math.max(0, distinctElementCount))];
  if (bonus === undefined || bonus === 0) return undefined;
  return {
    id: "yelan-a1-turn-control",
    source: "Turn Control",
    sourceCharacterId: yelan.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "hpPercent", value: bonus }],
  };
}

const yelanA4Buff: Buff = {
  id: "yelan-a4-adapt-with-ease",
  source: "Adapt With Ease",
  sourceCharacterId: yelan.id,
  startTime: 0,
  duration: EXQUISITE_THROW_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active" },
  resourceModifiers: [{
    resourceId: YELAN_A4_RAMP,
    owner: "source",
    targetStat: "dmgBonus",
    ratio: 0.01,
  }],
};

const yelanC4MaxHpBuff: Buff = {
  id: "yelan-c4-bait-and-switch",
  source: "Bait-and-Switch",
  sourceCharacterId: yelan.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  conditions: {
    resources: [{ resourceId: YELAN_C4_HP_STACKS, comparator: "gte", value: 1, owner: "source" }],
  },
  resourceModifiers: [{
    resourceId: YELAN_C4_HP_STACKS,
    owner: "source",
    targetStat: "hpPercent",
    ratio: 0.1,
    maxCap: 0.4,
  }],
};

function breakthroughBarbAbility(): KitAbility {
  return {
    id: "yelan-c6-breakthrough-barb",
    name: "Mastermind Breakthrough Barb",
    slot: "normal",
    castTime: 0.7,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [{
      id: "yelan-c6-breakthrough-barb-1",
      name: "Breakthrough Barb DMG",
      damageType: "charged",
      element: "hydro",
      scaling: [{
        stat: "hp",
        table: { values: breakthroughBarbAtNormalTalent.map((value) => value * 1.56) },
      }],
      application: { element: "hydro", gauge: 1 },
    }],
  };
}

export function createYelanDefinition(
  constellationLevel = yelan.constellationLevel,
  talentLevels: TalentLevels = yelan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: YelanPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const coordinatedHits = yelan.burst.instances.slice(1);
  if (coordinatedHits.length !== 3) throw new Error("Yelan burst must provide three Exquisite Throw hits");
  const coordinatedAbility: KitAbility = {
    id: "yelan-exquisite-throw-coordinated",
    name: "Exquisite Throw coordinated attack",
    slot: "burst",
    castTime: 0,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: coordinatedHits,
  };
  const c2ExtraAbility: KitAbility = {
    id: "yelan-c2-water-arrow",
    name: "Additional water arrow",
    slot: "burst",
    castTime: 0,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [{
      id: "yelan-c2-water-arrow-1",
      name: "Additional water arrow DMG",
      damageType: "burst",
      element: "hydro",
      scaling: [{
        stat: "hp",
        table: { values: Array.from({ length: 15 }, () => 0.14) },
      }],
      application: { element: "hydro", gauge: 1 },
    }],
  };
  const c6Normal = breakthroughBarbAbility();
  const c6Stance = level >= 6
    ? {
        id: "yelan-mastermind",
        name: "Mastermind",
        durationSeconds: 20,
        endsOnSwap: false,
        normalAttacks: { hits: [c6Normal], loops: true },
        replacementResourceCost: {
          resourceId: YELAN_C6_ARROWS,
          amount: 1,
          minimum: 1,
          endWhenDepleted: true,
        },
      }
    : undefined;
  const a4Trigger = {
    id: "yelan-a4-ramp-trigger",
    name: "Adapt With Ease ramp",
    trigger: "onInterval" as const,
    durationSeconds: EXQUISITE_THROW_DURATION_SECONDS,
    intervalSeconds: 1,
    icdSeconds: 0,
    maxProcs: 14,
    sourceCharacterId: yelan.id,
    stateEffects: [{ resourceId: YELAN_A4_RAMP, kind: "gain" as const, amount: 3.5 }],
  };
  const fanfareTriggers = [
    {
      id: "yelan-exquisite-throw",
      name: "Exquisite Throw",
      trigger: "onNormalAttack" as const,
      durationSeconds: EXQUISITE_THROW_DURATION_SECONDS,
      icdSeconds: EXQUISITE_THROW_ICD_SECONDS,
      snapshotMode: "dynamic" as const,
      sourceCharacterId: yelan.id,
      ability: coordinatedAbility,
    },
    {
      id: "yelan-exquisite-throw-skill",
      name: "Exquisite Throw after Lifeline hit",
      trigger: "onSkillHit" as const,
      durationSeconds: EXQUISITE_THROW_DURATION_SECONDS,
      icdSeconds: 0,
      snapshotMode: "dynamic" as const,
      sourceCharacterId: yelan.id,
      eventSourceCharacterId: yelan.id,
      eventAbilityIds: [yelan.skill.id],
      ability: coordinatedAbility,
    },
    ...(level >= 2
      ? [{
          id: "yelan-c2-water-arrow-trigger",
          name: "Taking All Comers",
          trigger: "onNormalAttack" as const,
          durationSeconds: EXQUISITE_THROW_DURATION_SECONDS,
          icdSeconds: 1.8,
          snapshotMode: "dynamic" as const,
          sourceCharacterId: yelan.id,
          ability: c2ExtraAbility,
      }]
      : []),
  ];
  const c4Trigger = {
    id: "yelan-c4-lifeline-mark-trigger",
    name: "Bait-and-Switch marked enemy",
    trigger: "onSkillHit" as const,
    durationSeconds: 25,
    icdSeconds: 0,
    sourceCharacterId: yelan.id,
    eventSourceCharacterId: yelan.id,
    eventAbilityIds: [yelan.skill.id],
    stateEffects: [{ resourceId: YELAN_C4_HP_STACKS, kind: "gain" as const, amount: 1 }],
  };
  const triggers = [...fanfareTriggers, a4Trigger];
  const a1 = yelanA1Buff(composition.distinctElementCount ?? 0);

  return {
    ...yelan,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    resources: [
      { id: YELAN_C6_ARROWS, name: "Mastermind arrows", initial: 0, max: 5 },
      { id: YELAN_A4_RAMP, name: "Adapt With Ease damage percent", initial: 1, max: 50 },
      ...(level >= 4
        ? [{ id: YELAN_C4_HP_STACKS, name: "Bait-and-Switch marked enemies", initial: 0, max: 4, durationSeconds: 25 }]
        : []),
    ],
    passives: [
      ...yelan.passives.map((passive) =>
      passive.id === "yelan-a1" && a1 !== undefined
        ? { ...passive, buffs: [a1] }
        : passive,
      ),
      ...(level >= 4
        ? [{ id: "yelan-c4", name: "Bait-and-Switch", effects: [], buffs: [yelanC4MaxHpBuff] }]
        : []),
    ],
    skill: {
      ...yelan.skill,
      ...(level >= 1 ? { charges: { maxCharges: 2 } } : {}),
      ...(level >= 4 ? { triggers: [c4Trigger] } : {}),
    },
    burst: {
      ...yelan.burst,
      instances: yelan.burst.instances.slice(0, 1),
      effects: [
        { resourceId: YELAN_A4_RAMP, kind: "set" as const, amount: 1 },
        ...(level >= 6
          ? [{ resourceId: YELAN_C6_ARROWS, kind: "set" as const, amount: 5 }]
          : []),
      ],
      buffs: [yelanA4Buff],
      triggers,
      stance: c6Stance,
    },
  };
}

export const YELAN_KIT_METADATA = {
  supportedChannels: [
    "exquisiteThrowOpeningAndCoordinatedAttacks",
    "c1AdditionalSkillCharge",
    "c2ExtraWaterArrow",
    "a4ActiveCharacterDamageRamp",
    "c6FiveBreakthroughBarbs",
    "c4MarkedEnemyMaxHpIncrease",
  ],
  unsupportedChannels: [
    "skillLifelineMarkCountAndBreakthroughReset",
    "p3ExpeditionDuration",
  ],
} as const;

export const yelanWithKit = createYelanDefinition();
