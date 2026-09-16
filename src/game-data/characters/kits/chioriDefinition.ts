/** Runtime Chiori overlay for the executable, sourced A1/C2/C6 channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import { flatTalent } from "@/simulation/character/talent";
import { chiori } from "../generated/geo";

const CHIORI_A1_DURATION = 8;
const CHIORI_A1_ICD = 2;
const CHIORI_A1_MAX_PROCS = 2;
const CHIORI_C2_DURATION = 10;
const CHIORI_C2_INTERVAL = 3;
const CHIORI_C2_KINU_RATIO = 1.7;
const CHIORI_C6_NORMAL_DEF_RATIO = 2.35;
const CHIORI_A4_GEO_DMG_BONUS = 0.2;
const CHIORI_A4_DURATION = 20;

export interface ChioriRuntimeOptions {
  /** Set only when the scenario explicitly supplies a nearby Geo Construct. */
  readonly nearbyGeoConstruct?: boolean;
}

function upwardSweep(chioriSkill: NonNullable<GenericCharacterDefinition["skill"]>): KitAbility {
  const instance = chioriSkill.instances.find((entry) => entry.id === "chiori-skill-2");
  if (instance === undefined) throw new Error("Chiori generated skill is missing its upward sweep row");
  return {
    id: "chiori-a1-tamoto-coordinated",
    name: "Tamoto Coordinated Attack",
    slot: "skill",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{ ...instance, id: "chiori-a1-tamoto-coordinated-hit", name: "Tamoto Coordinated Attack" }],
  };
}

function kinusAttack(chioriSkill: NonNullable<GenericCharacterDefinition["skill"]>): KitAbility {
  const instance = chioriSkill.instances.find((entry) => entry.id === "chiori-skill-1");
  if (instance === undefined) throw new Error("Chiori generated skill is missing its Tamoto row");
  return {
    id: "chiori-c2-kinu",
    name: "Kinu Attack",
    slot: "skill",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{
      ...instance,
      id: "chiori-c2-kinu-hit",
      name: "Kinu Attack",
      scaling: instance.scaling.map((term) => ({
        ...term,
        table: { values: term.table.values.map((value) => value * CHIORI_C2_KINU_RATIO) },
      })),
    }],
  };
}

function a1Trigger(skill: NonNullable<GenericCharacterDefinition["skill"]>): TriggeredEffectDefinition<KitAbility> {
  return {
    id: "chiori-a1-seize-the-moment",
    name: "Seize the Moment",
    trigger: "onNormalAttack",
    durationSeconds: CHIORI_A1_DURATION,
    icdSeconds: CHIORI_A1_ICD,
    maxProcs: CHIORI_A1_MAX_PROCS,
    sourceCharacterId: "chiori",
    ability: upwardSweep(skill),
  };
}

function c2Trigger(skill: NonNullable<GenericCharacterDefinition["skill"]>): TriggeredEffectDefinition<KitAbility> {
  return {
    id: "chiori-c2-kinu",
    name: "Kinu",
    trigger: "onInterval",
    durationSeconds: CHIORI_C2_DURATION,
    intervalSeconds: CHIORI_C2_INTERVAL,
    icdSeconds: CHIORI_C2_INTERVAL,
    maxProcs: 3,
    sourceCharacterId: "chiori",
    ability: kinusAttack(skill),
  };
}

function withC6NormalScaling(definition: GenericCharacterDefinition): GenericCharacterDefinition["normalAttacks"] {
  if (definition.normalAttacks === undefined) return definition.normalAttacks;
  return {
    ...definition.normalAttacks,
    hits: definition.normalAttacks.hits.map((ability) => ({
      ...ability,
      instances: ability.instances.map((instance) => ({
        ...instance,
        scaling: [...instance.scaling, { stat: "def", table: flatTalent(CHIORI_C6_NORMAL_DEF_RATIO) }],
      })),
    })),
  };
}

function a4Buff(options: ChioriRuntimeOptions, ascensionPhase: number): Buff | undefined {
  if (!options.nearbyGeoConstruct || ascensionPhase < 4) return undefined;
  return {
    id: "chiori-a4-finishing-touch",
    source: "The Finishing Touch",
    sourceCharacterId: "chiori",
    startTime: 0,
    duration: CHIORI_A4_DURATION,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "elementalDmgBonus", element: "geo", value: CHIORI_A4_GEO_DMG_BONUS }],
  };
}

export function createChioriDefinition(
  constellationLevel = chiori.constellationLevel,
  talentLevels: TalentLevels = chiori.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  options: ChioriRuntimeOptions = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? chiori.ascensionPhase;
  const skill = {
    ...chiori.skill,
    ...(ascensionPhase >= 1 ? { triggers: [a1Trigger(chiori.skill)] } : {}),
  };
  const burst = {
    ...chiori.burst,
    ...(level >= 2 ? { triggers: [c2Trigger(skill)] } : {}),
  };
  const a4 = a4Buff(options, ascensionPhase);
  return {
    ...chiori,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    normalAttacks: level >= 6 ? withC6NormalScaling(chiori) : chiori.normalAttacks,
    skill,
    burst,
    passives: chiori.passives.map((passive) =>
      passive.id === "chiori-a4" ? { ...passive, buffs: a4 === undefined ? [] : [a4] } : passive,
    ),
  };
}

export const chioriWithKit = createChioriDefinition();

export const CHIORI_KIT_METADATA = {
  a1Duration: CHIORI_A1_DURATION,
  a1Icd: CHIORI_A1_ICD,
  a1MaxProcs: CHIORI_A1_MAX_PROCS,
  c2KinuRatio: CHIORI_C2_KINU_RATIO,
  c2Duration: CHIORI_C2_DURATION,
  c2Interval: CHIORI_C2_INTERVAL,
  c6NormalDefRatio: CHIORI_C6_NORMAL_DEF_RATIO,
  a4GeoDmgBonus: CHIORI_A4_GEO_DMG_BONUS,
  unsupportedChannels: ["a1TailoringGeoInfusion", "c1ConstructDependentSummon", "c4Kinu", "c6CooldownReduction"],
} as const;
