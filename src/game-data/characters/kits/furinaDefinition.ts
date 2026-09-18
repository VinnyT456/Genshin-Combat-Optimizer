/** Runtime Furina overlay for Salon Member HP drain and Fanfare state. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { HealingDefinition, KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import type { InfusionDefinition } from "@/simulation/reactions/infusions";
import { furina } from "../generated/hydro";

const FURINA_A4_HP_THRESHOLD = 30_000;
const FURINA_A4_DAMAGE_PER_HP = 0.000007;
const FURINA_A4_MAX_DAMAGE_BONUS = 0.28;
const FURINA_C1_INITIAL_FANFARE = 150;
const FURINA_FANFARE = "furina-fanfare";
const FURINA_C2_EXCESS_FANFARE = "furina-c2-excess-fanfare";
const FURINA_C2_MAX_HP_FANFARE_CAP = 140;
const FURINA_FANFARE_WINDOW = "furina-fanfare-window";
const FURINA_C2_FANFARE_MULTIPLIER = 3.5;
const FURINA_FANFARE_DURATION_SECONDS = 18;
const FURINA_C6_CENTER = "furina-c6-center-of-attention";
const FURINA_C6_CENTER_HITS = "furina-c6-center-of-attention-hits";
const FURINA_C6_DURATION_SECONDS = 10;

const FANFARE_DAMAGE_PER_POINT: readonly number[] = [
  0.0007, 0.0009, 0.0011, 0.0013, 0.0015, 0.0017, 0.0019,
  0.0021, 0.0023, 0.0025, 0.0027, 0.0029, 0.0031,
];
const FANFARE_RECEIVED_HEALING_PER_POINT: readonly number[] = [
  0.0001, 0.0002, 0.0003, 0.0004, 0.0005, 0.0006, 0.0007,
  0.0008, 0.0009, 0.0010, 0.0011, 0.0012, 0.0013,
];

export type FurinaSalonMode = "ousia" | "pneuma";

const furinaC6Infusion: InfusionDefinition = {
  id: "furina-c6-center-of-attention-infusion",
  element: "hydro",
  durationSeconds: FURINA_C6_DURATION_SECONDS,
  canBeOverridden: false,
  targets: ["normal", "charged", "plunge"],
};

const furinaPneumaHealing: HealingDefinition = {
  id: "furina-singer-of-many-waters-healing",
  name: "Singer of Many Waters healing",
  target: "active",
  scaling: [{
    stat: "hp",
    table: { values: Array.from({ length: 15 }, () => 0.0816) },
  }],
  flat: { values: Array.from({ length: 15 }, () => 940) },
  intervalSeconds: 2,
  durationSeconds: 30,
  intervalReductionFromStat: {
    stat: "hp",
    unitValue: 1000,
    ratio: 0.004,
    maxReduction: 0.16,
  },
};

const furinaC6OusiaHealing: HealingDefinition = {
  id: "furina-c6-center-of-attention-healing",
  name: "Center of Attention healing",
  target: "party",
  scaling: [{
    stat: "hp",
    table: { values: Array.from({ length: 15 }, () => 0.04) },
  }],
  intervalSeconds: 1,
  durationSeconds: 2.9,
};

function furinaC6CenterBuff(): Buff {
  return {
    id: "furina-c6-center-of-attention-bonus",
    source: "Hear Me — Let Us Raise the Chalice of Love!",
    sourceCharacterId: furina.id,
    startTime: 0,
    duration: FURINA_C6_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      damageTypes: ["normal", "charged", "plunge"],
      resources: [{ resourceId: FURINA_C6_CENTER, comparator: "gte", value: 1 }],
    },
    conversions: [{ sourceStat: "hp", targetStat: "flatDamageBonus", ratio: 0.18 }],
  };
}

function furinaC6PneumaBonusBuff(): Buff {
  return {
    id: "furina-c6-pneuma-attack-bonus",
    source: "Hear Me — Let Us Raise the Chalice of Love!",
    sourceCharacterId: furina.id,
    startTime: 0,
    duration: FURINA_C6_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      damageTypes: ["normal", "charged", "plunge"],
      resources: [
        { resourceId: FURINA_C6_CENTER, comparator: "gte", value: 1 },
        { resourceId: FURINA_C6_CENTER_HITS, comparator: "lt", value: 6 },
      ],
    },
    conversions: [{ sourceStat: "hp", targetStat: "flatDamageBonus", ratio: 0.25 }],
  };
}

function valueAtTalentLevel(values: readonly number[], talentLevel: number): number {
  return values[Math.min(values.length, Math.max(1, Math.trunc(talentLevel))) - 1] ?? values.at(-1) ?? 0;
}

const a4SalonDamageBuff: Buff = {
  id: "furina-a4-unheard-confession",
  source: "Unheard Confession",
  sourceCharacterId: "furina",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    abilityIds: [
      "furina-salon-usher",
      "furina-salon-chevalmarin",
      "furina-salon-crabaletta",
    ],
  },
  conversions: [{
    sourceStat: "hp",
    targetStat: "dmgBonus",
    threshold: FURINA_A4_HP_THRESHOLD,
    ratio: FURINA_A4_DAMAGE_PER_HP,
    maxCap: FURINA_A4_MAX_DAMAGE_BONUS,
  }],
};

function fanfareBuff(talentLevel: number): Buff {
  return {
    id: "furina-fanfare-party-damage",
    source: "Let the People Rejoice",
    sourceCharacterId: "furina",
    startTime: 0,
    duration: FURINA_FANFARE_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    conditions: {
      resources: [{
        resourceId: FURINA_FANFARE_WINDOW,
        comparator: "gte",
        value: 1,
        owner: "source",
      }],
    },
    resourceModifiers: [{
      resourceId: FURINA_FANFARE,
      owner: "source",
      targetStat: "dmgBonus",
      ratio: valueAtTalentLevel(FANFARE_DAMAGE_PER_POINT, talentLevel),
    }],
    healingModifiers: [{
      kind: "received",
      value: valueAtTalentLevel(FANFARE_RECEIVED_HEALING_PER_POINT, talentLevel),
    }],
  };
}

function c2MaxHpBuff(): Buff {
  return {
    id: "furina-c2-fanfare-max-hp",
    source: "Hear Me — Let Us Raise the Chalice of Love",
    sourceCharacterId: "furina",
    startTime: 0,
    duration: FURINA_FANFARE_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      resources: [{
        resourceId: FURINA_FANFARE_WINDOW,
        comparator: "gte",
        value: 1,
        owner: "source",
      }],
    },
    resourceModifiers: [{
      resourceId: FURINA_C2_EXCESS_FANFARE,
      owner: "source",
      targetStat: "hpPercent",
      ratio: 0.0035,
      maxCap: 1.4,
    }],
  };
}

export function createFurinaDefinition(
  constellationLevel = furina.constellationLevel,
  talentLevels: TalentLevels = furina.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  mode: FurinaSalonMode = "ousia",
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? furina.ascensionPhase;
  const fanfareBuffs = [fanfareBuff(talentLevels.burst), ...(level >= 2 ? [c2MaxHpBuff()] : [])];
  const salonDrain = [0.024, 0.016, 0.036] as const;
  const skillInstances = furina.skill.instances.map((instance, index) =>
    index === 0
      ? instance
      : {
          ...instance,
          hpChangesBeforeHit: [{
            kind: "damage" as const,
            target: "party" as const,
            maxHpFraction: salonDrain[index - 1] ?? salonDrain[salonDrain.length - 1],
            onlyIfHpFractionAbove: 0.5,
          }],
          partyHpDamageBonus: {
            minHpFraction: 0.5,
            bonusByCount: [0.1, 0.2, 0.3, 0.4],
          },
        },
  );
  const salonMemberIds = [
    "furina-salon-usher",
    "furina-salon-chevalmarin",
    "furina-salon-crabaletta",
  ] as const;
  const salonIntervals = [3.2, 1.5, 5.1] as const;
  const salonTriggers: TriggeredEffectDefinition<KitAbility>[] = mode === "pneuma" ? [] : salonMemberIds.flatMap((id, index) => {
    const instance = skillInstances[index + 1];
    if (instance === undefined) return [];
    const memberAbility: KitAbility = {
      ...furina.skill,
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
      durationSeconds: 30,
      intervalSeconds: salonIntervals[index] ?? 1,
      icdSeconds: 0,
      snapshotMode: "dynamic" as const,
      sourceCharacterId: furina.id,
      ability: memberAbility,
    }];
  });
  const c4EnergyTrigger: TriggeredEffectDefinition<KitAbility>[] = level >= 4 ? [{
    id: "furina-c4-energy-trigger",
    name: "Furina C4 energy restoration",
    trigger: "onInterval",
    durationSeconds: 30,
    intervalSeconds: 5,
    icdSeconds: 0,
    maxProcs: 6,
    sourceCharacterId: furina.id,
    energyGenerated: 4,
  }] : [];
  const c6OusiaHealingTriggers: TriggeredEffectDefinition<KitAbility>[] =
    level >= 6 && mode === "ousia" ? [{
      id: "furina-c6-center-of-attention-healing-trigger",
      name: "Center of Attention Ousia healing",
      trigger: "onDamageDealt",
      durationSeconds: FURINA_C6_DURATION_SECONDS,
      icdSeconds: 0.1,
      maxProcs: 6,
      sourceCharacterId: furina.id,
      eventSourceCharacterId: furina.id,
      eventDamageTypes: ["normal", "charged", "plunge"],
      requiredResourceMinimum: { resourceId: FURINA_C6_CENTER, amount: 1 },
      healing: [furinaC6OusiaHealing],
    }] : [];
  const c6PneumaHitTriggers: TriggeredEffectDefinition<KitAbility>[] =
    level >= 6 && mode === "pneuma" ? [
      {
        id: "furina-c6-pneuma-party-hp-consumption",
        name: "Center of Attention Pneuma HP consumption",
        trigger: "onDamageDealtBeforeHit",
        durationSeconds: FURINA_C6_DURATION_SECONDS,
        icdSeconds: 0.1,
        sourceCharacterId: furina.id,
        eventSourceCharacterId: furina.id,
        eventDamageTypes: ["normal", "charged", "plunge"],
        requiredResourceMinimum: { resourceId: FURINA_C6_CENTER, amount: 1 },
        hpChangesBeforeHit: [{ kind: "damage", target: "party", maxHpFraction: 0.01 }],
      },
      {
        id: "furina-c6-pneuma-hit-counter",
        name: "Center of Attention Pneuma hit counter",
        trigger: "onDamageDealt",
        durationSeconds: FURINA_C6_DURATION_SECONDS,
        icdSeconds: 0.1,
        sourceCharacterId: furina.id,
        eventSourceCharacterId: furina.id,
        eventDamageTypes: ["normal", "charged", "plunge"],
        requiredResourceMinimum: { resourceId: FURINA_C6_CENTER, amount: 1 },
        stateEffectsAfterAbility: [{ resourceId: FURINA_C6_CENTER_HITS, kind: "gain", amount: 1 }],
      },
    ] : [];
  const fanfareResource = {
    id: FURINA_FANFARE,
    name: "Fanfare",
    initial: 0,
    max: level >= 1 ? 400 : 300,
    gainOnHpChange: {
      pointsPerHpFraction: level >= 2 ? 100 * FURINA_C2_FANFARE_MULTIPLIER : 100,
      requiredResourceId: FURINA_FANFARE_WINDOW,
      requiredResourceMinimum: 1,
      ...(level >= 2 ? { overflowResourceId: FURINA_C2_EXCESS_FANFARE } : {}),
    },
  };
  const excessFanfareResource = {
    id: FURINA_C2_EXCESS_FANFARE,
    name: "Fanfare above the C2 cap",
    initial: 0,
    // C2's over-cap Fanfare can grant at most 140% Max HP (0.35% per
    // over-cap point), not a second 400-point pool.
    max: FURINA_C2_MAX_HP_FANFARE_CAP,
    durationSeconds: FURINA_FANFARE_DURATION_SECONDS,
  };
  const fanfareWindow = {
    id: FURINA_FANFARE_WINDOW,
    name: "Let the People Rejoice duration",
    initial: 0,
    max: 1,
    durationSeconds: FURINA_FANFARE_DURATION_SECONDS,
  };
  const c6Center = {
    id: FURINA_C6_CENTER,
    name: "Center of Attention",
    initial: 0,
    max: 1,
    durationSeconds: FURINA_C6_DURATION_SECONDS,
  };

  return {
    ...furina,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    resources: [
      fanfareResource,
      ...(level >= 2 ? [excessFanfareResource] : []),
      fanfareWindow,
      ...(level >= 6 ? [c6Center] : []),
      ...(level >= 6 ? [{
        id: FURINA_C6_CENTER_HITS,
        name: "Center of Attention attacks used",
        initial: 0,
        max: 6,
        durationSeconds: FURINA_C6_DURATION_SECONDS,
      }] : []),
    ],
    passives: furina.passives.map((passive) =>
      passive.id === "furina-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [a4SalonDamageBuff] }
        : passive,
    ),
    skill: {
      ...furina.skill,
      instances: mode === "pneuma" ? [] : skillInstances.slice(0, 1),
      healing: mode === "pneuma" ? [furinaPneumaHealing] : undefined,
      effects: [
        ...(furina.skill.effects ?? []),
        ...(level >= 6 ? [{ resourceId: FURINA_C6_CENTER, kind: "set" as const, amount: 1 }] : []),
        ...(level >= 6 ? [{ resourceId: FURINA_C6_CENTER_HITS, kind: "set" as const, amount: 0 }] : []),
      ],
      triggers: [
        ...salonTriggers,
        ...c4EnergyTrigger,
        ...c6OusiaHealingTriggers,
        ...c6PneumaHitTriggers,
      ],
      infusion: level >= 6 ? furinaC6Infusion : undefined,
      buffs: level >= 6
        ? [furinaC6CenterBuff(), ...(mode === "pneuma" ? [furinaC6PneumaBonusBuff()] : [])]
        : undefined,
    },
    burst: {
      ...furina.burst,
      effects: [
        { resourceId: FURINA_FANFARE, kind: "set", amount: level >= 1 ? FURINA_C1_INITIAL_FANFARE : 0 },
        { resourceId: FURINA_FANFARE_WINDOW, kind: "set", amount: 1 },
      ],
      preHitBuffs: fanfareBuffs,
      buffs: fanfareBuffs,
    },
  };
}

export const furinaWithKit = createFurinaDefinition();

export const FURINA_KIT_METADATA = {
  a4HpThreshold: FURINA_A4_HP_THRESHOLD,
  a4DamagePerHp: FURINA_A4_DAMAGE_PER_HP,
  a4MaximumDamageBonus: FURINA_A4_MAX_DAMAGE_BONUS,
  c1InitialFanfare: FURINA_C1_INITIAL_FANFARE,
  fanfareDamagePerPointAtBurstTalent10: FANFARE_DAMAGE_PER_POINT[9],
  c2FanfareGainMultiplier: FURINA_C2_FANFARE_MULTIPLIER,
  c2MaxHpFanfareCap: FURINA_C2_MAX_HP_FANFARE_CAP,
  c6CenterOfAttentionDurationSeconds: FURINA_C6_DURATION_SECONDS,
  supportedChannels: [
    "ousiaSalonMemberHpDrainAndPartyHpDamageScaling",
    "fanfareResetDurationAndPartyDamageBonus",
    "c1InitialFanfare",
    "c2FanfareGainAndMaxHpConversion",
    "pneumaSingerHealing",
    "pneumaSingerHealingCadenceReduction",
    "c4FanfareEnergyGeneration",
    "c6UniversalHydroInfusionAndDamageBonus",
    "c6UniversalSalonHealingAndPneumaAttackEffects",
  ],
  unsupportedChannels: [
    "a1PartyHealingAfterAllyDeath",
    "p3AquaticStamina",
  ],
} as const;
