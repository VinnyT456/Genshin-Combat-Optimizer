/** Runtime overlay for Kamisato Ayato's executable generic kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { kamisatoAyato } from "../generated/hydro";

const NAMISEN_RESOURCE_ID = "kamisato-ayato-namisen";
const NAMISEN_MAX_STACKS = 4;
const NAMISEN_C2_MAX_STACKS = 5;
const NAMISEN_HP_RATIO_PER_STACK = 0.0056;

const ayatoC1Buff: Buff = {
  id: "kamisato-ayato-c1-shunsuiken-bonus",
  source: "Kyouka Fuushi",
  sourceCharacterId: kamisatoAyato.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    abilityIds: [
      "kamisato-ayato-shunsuiken-1",
      "kamisato-ayato-shunsuiken-2",
      "kamisato-ayato-shunsuiken-3",
    ],
    damageTypes: ["skill"],
    maxEnemyHpFraction: 0.5,
  },
  modifiers: [{ stat: "dmgBonus", value: 0.4 }],
};

const ayatoC2Buff: Buff = {
  id: "kamisato-ayato-c2-namisen-hp",
  source: "World Source",
  sourceCharacterId: kamisatoAyato.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    resources: [{ resourceId: NAMISEN_RESOURCE_ID, comparator: "gte", value: 3 }],
  },
  modifiers: [{ stat: "hpPercent", value: 0.5 }],
};

function shunsuikenNormalAttacks(base: GenericCharacterDefinition): NormalAttackString {
  const skillHits = base.skill.instances.slice(0, 3);
  return {
    loops: true,
    hits: skillHits.map((instance, index) => ({
      id: `kamisato-ayato-shunsuiken-${index + 1}`,
      name: `瞬水剑第${index + 1}段伤害`,
      slot: "normal" as const,
      castTime: 0.4,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{
        ...instance,
        id: `kamisato-ayato-shunsuiken-${index + 1}-1`,
        damageType: "skill" as const,
        // Namisen is an HP-scaling additive term on each Shunsuiken hit.
        resourceScaling: [{
          resourceId: NAMISEN_RESOURCE_ID,
          stat: "hp" as const,
          multiplierPerStack: NAMISEN_HP_RATIO_PER_STACK,
          snapshot: "hit" as const,
        }],
      }],
    })),
  };
}

function ayatoStance(base: GenericCharacterDefinition): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "kamisato-ayato-takimeguri-kanka",
    name: "滝廻鑑花",
    durationSeconds: 6,
    endsOnSwap: true,
    infusion: {
      id: "kamisato-ayato-takimeguri-kanka-infusion",
      element: "hydro",
      durationSeconds: 6,
      canBeOverridden: false,
    },
    normalAttacks: shunsuikenNormalAttacks(base),
  };
}

export function createKamisatoAyatoDefinition(
  constellationLevel = kamisatoAyato.constellationLevel,
  talentLevels: TalentLevels = kamisatoAyato.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const skillWaterIllusion = kamisatoAyato.skill.instances[3];
  if (!skillWaterIllusion) throw new Error("Kamisato Ayato skill is missing the water illusion row");

  return {
    ...kamisatoAyato,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    resources: [{
      id: NAMISEN_RESOURCE_ID,
      name: "Namisen",
      initial: 0,
      max: level >= 2 ? NAMISEN_C2_MAX_STACKS : NAMISEN_MAX_STACKS,
      durationSeconds: 6,
    }],
    skill: {
      ...kamisatoAyato.skill,
      // The sourced water-illusion row is delayed to the end of the stance;
      // the exact explosion-triggered Namisen handoff is not expressible in
      // StateEffect, so the supported approximation grants the stack package
      // on cast and documents that lifecycle gap in metadata below.
      instances: [{ ...skillWaterIllusion, delay: 6 }],
      effects: [{ resourceId: NAMISEN_RESOURCE_ID, kind: "gain", amount: NAMISEN_MAX_STACKS }],
      stance: ayatoStance({ ...kamisatoAyato, ...overrides }),
    },
    passives: kamisatoAyato.passives,
    constellations: kamisatoAyato.constellations.map((constellation) => {
      if (constellation.level === 1 && level >= 1) {
        return { ...constellation, buffs: [ayatoC1Buff] };
      }
      if (constellation.level === 2 && level >= 2) {
        return { ...constellation, buffs: [ayatoC2Buff] };
      }
      return constellation;
    }),
  };
}

export const KAMISATO_AYATO_KIT_METADATA = {
  namisenResourceId: NAMISEN_RESOURCE_ID,
  namisenHpRatioPerStack: NAMISEN_HP_RATIO_PER_STACK,
  stanceDurationSeconds: 6,
  unsupportedChannels: [
    "a1ExactWaterIllusionExplosionTriggeredMaxNamisenTiming",
    "a4OffFieldEnergyRegenerationBelow40Energy",
    "c4NormalAttackSpeedIncrease",
    "c6ShunsuikenAdditionalFollowUpHits",
    "p3CookingBonus",
  ],
} as const;

export const kamisatoAyatoWithKit = createKamisatoAyatoDefinition();
