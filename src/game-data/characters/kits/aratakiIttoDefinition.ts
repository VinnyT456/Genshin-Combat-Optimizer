/** Runtime Arataki Itto kit overlay for the sourced Raging Oni King state. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { talentTable, talentValueAt } from "@/simulation/character/talent";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { aratakiItto } from "../generated/geo";

const STACKS = "itto-superlative-superstrength";
const BURST_DEF_TO_ATK = talentTable([
  0.576, 0.619, 0.662, 0.72, 0.763, 0.806, 0.864, 0.922, 0.979,
  1.037, 1.094, 1.152, 1.224,
]);
const KESAGIRI = talentTable([
  0.912, 0.986, 1.06, 1.166, 1.24, 1.325, 1.442, 1.558, 1.675,
  1.802, 1.948, 2.13, 2.303,
]);
const KESAGIRI_FINAL = talentTable([
  1.909, 2.065, 2.22, 2.442, 2.597, 2.775, 3.019, 3.263, 3.508,
  3.774, 4.079, 4.461, 4.825,
]);
const SAICHIMONJI = talentTable([
  0.905, 0.978, 1.052, 1.157, 1.231, 1.315, 1.431, 1.546, 1.662,
  1.788, 1.933, 2.114, 2.285,
]);

function gainStacks(amount: number) {
  return [{ resourceId: STACKS, kind: "gain" as const, amount }];
}

function chargedAttack(ascensionPhase: number): KitAbility {
  const bonus = ascensionPhase >= 4
    ? [{ stat: "def" as const, table: talentTable(Array.from({ length: 13 }, () => 0.35)) }]
    : [];
  return {
    id: "arataki-itto-charged",
    name: "Arataki Kesagiri",
    slot: "charged",
    castTime: 0.8,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [
      ...Array.from({ length: 5 }, (_, index) => ({
        id: `arataki-itto-charged-${index + 1}`,
        name: "Arataki Kesagiri Combo Slash",
        damageType: "charged" as const,
        element: "physical" as const,
        scaling: [
          { stat: "atk" as const, table: KESAGIRI },
          ...bonus,
        ],
      })),
      {
        id: "arataki-itto-charged-final",
        name: "Arataki Kesagiri Final Slash",
        damageType: "charged",
        element: "physical",
        scaling: [
          { stat: "atk", table: KESAGIRI_FINAL },
          ...bonus,
        ],
      },
    ],
    // The generic action model cannot yet consume one resource between
    // individual hits. The resource remains serialized and gains are modeled;
    // per-slash consumption is a documented future hit-lifecycle seam.
    effects: [],
  };
}

function stanceNormals(base: GenericCharacterDefinition): NormalAttackString {
  return {
    loops: true,
    hits: base.normalAttacks.hits.map((ability) => ({
      ...ability,
      instances: ability.instances.map((instance) => ({
        ...instance,
        id: `${instance.id}-raging-oni-king`,
        element: "physical" as const,
      })),
      effects: gainStacks(1),
    })),
  };
}

function ragingOniKing(
  base: GenericCharacterDefinition,
  constellationLevel: number,
  ascensionPhase: number,
): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "arataki-itto-raging-oni-king",
    name: "Raging Oni King",
    durationSeconds: 11,
    endsOnSwap: true,
    infusion: {
      id: "arataki-itto-raging-oni-king-infusion",
      element: "geo",
      durationSeconds: 11,
      canBeOverridden: false,
    },
    modifiers: [{ stat: "defPercent", value: 0 }],
    conversions: [{
      sourceStat: "def",
      targetStat: "atkFlat",
      ratio: talentValueAt(BURST_DEF_TO_ATK, base.talentLevels.burst),
    }],
    normalAttacks: stanceNormals(base),
    chargedAttack: chargedAttack(ascensionPhase),
    plungeLow: base.plungeLow,
    plungeHigh: base.plungeHigh,
    ...(constellationLevel >= 4
      ? { stateEndBuffs: [{
          id: "arataki-itto-c4-state-end",
          source: "Jailhouse Bread and Butter",
          sourceCharacterId: "arataki-itto",
          startTime: 0,
          duration: 10,
          stacking: { mode: "refresh" as const },
          targets: { scope: "party" as const },
          modifiers: [
            { stat: "atkPercent" as const, value: 0.2 },
            { stat: "defPercent" as const, value: 0.2 },
          ],
        }] }
      : {}),
  };
}

const c6ChargedCrit: Buff = {
  id: "arataki-itto-c6-charged-crit-dmg",
  source: "Arataki Itto, Present!",
  sourceCharacterId: "arataki-itto",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { damageTypes: ["charged"] },
  modifiers: [{ stat: "critDmg", value: 0.7 }],
};

export function createAratakiIttoDefinition(
  constellationLevel = aratakiItto.constellationLevel,
  talentLevels: TalentLevels = aratakiItto.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const burst = { ...aratakiItto.burst, instances: [] };
  return {
    ...aratakiItto,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    chargedAttack: chargedAttack(overrides.ascensionPhase ?? aratakiItto.ascensionPhase),
    passives: aratakiItto.passives,
    resources: [{ id: STACKS, name: "Superlative Superstrength", initial: 0, max: 5, durationSeconds: 60 }],
    normalAttacks: {
      ...aratakiItto.normalAttacks,
      hits: aratakiItto.normalAttacks.hits.map((ability, index) =>
        index === 1 ? { ...ability, effects: gainStacks(1) }
          : index === 3 ? { ...ability, effects: gainStacks(2) }
            : ability,
      ),
    },
    skill: { ...aratakiItto.skill, effects: gainStacks(1) },
    burst: {
      ...burst,
      stance: ragingOniKing({ ...aratakiItto, talentLevels, burst }, level, overrides.ascensionPhase ?? aratakiItto.ascensionPhase),
      effects: level >= 1 ? gainStacks(2) : undefined,
    },
    ...(level >= 6 ? {
      passives: aratakiItto.passives.map((passive) => ({
        ...passive,
        buffs: passive.id === "arataki-itto-a1" ? [c6ChargedCrit] : passive.buffs,
      })),
    } : {}),
  };
}

export const aratakiIttoWithKit = createAratakiIttoDefinition();

export const ARATAKI_ITTO_KIT_METADATA = {
  stackResourceId: STACKS,
  stackCap: 5,
  burstDurationSeconds: 11,
  burstDefToAtkAtTalent10: 1.037,
  bloodlineDefRatio: 0.35,
  c6ChargedCritDmg: 0.7,
  saichimonjiTalent10: SAICHIMONJI.values[9],
} as const;
