/**
 * Nahida's executable runtime overlay.
 *
 * The generic engine can represent the sourced skill rows, an EM conversion
 * scoped to Tri-Karma damage, and a bounded coordinated attack. It cannot yet
 * represent Seeds of Skandha target state, reaction-only activation, party
 * element counting, connected-target propagation, or the Shrine of Maya field
 * lifecycle. Those channels remain explicitly unsupported below.
 */
import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { nahida } from "../generated/dendro";

const TRI_KARMA_ID = "nahida-tri-karma-purification";
const C6_TRI_KARMA_ATK_RATIO = 2;
const C6_TRI_KARMA_EM_RATIO = 4;
const A4_EM_THRESHOLD = 200;
const A4_DMG_RATIO = 0.001;
const A4_CRIT_RATE_RATIO = 0.0003;
const A4_MAX_DMG_BONUS = 0.8;
const A4_MAX_CRIT_RATE = 0.24;
const TRI_KARMA_DURATION_SECONDS = 25;
const C6_DURATION_SECONDS = 10;
const C6_ICD_SECONDS = 0.2;
const C6_MAX_PROCS = 6;

function triKarmaDamageBuff(): Buff {
  return {
    id: "nahida-a4-awakening-elucidated",
    source: "Awakening Elucidated",
    sourceCharacterId: nahida.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { abilityIds: [TRI_KARMA_ID] },
    conversions: [
      {
        sourceStat: "elementalMastery",
        targetStat: "elementalDmgBonus",
        element: "dendro",
        threshold: A4_EM_THRESHOLD,
        ratio: A4_DMG_RATIO,
        maxCap: A4_MAX_DMG_BONUS,
      },
      {
        sourceStat: "elementalMastery",
        targetStat: "critRate",
        threshold: A4_EM_THRESHOLD,
        ratio: A4_CRIT_RATE_RATIO,
        maxCap: A4_MAX_CRIT_RATE,
      },
    ],
  };
}

function c6TriKarmaAttack(source: NonNullable<GenericCharacterDefinition["skill"]>["instances"][number]): KitAbility {
  return {
    id: TRI_KARMA_ID,
    name: "Tri-Karma Purification: Karmic Oblivion",
    slot: "skill",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{
      ...source,
      id: `${TRI_KARMA_ID}-1`,
      name: "Karmic Oblivion DMG",
      scaling: [
        { stat: "atk", table: flatTalent(C6_TRI_KARMA_ATK_RATIO) },
        { stat: "elementalMastery", table: flatTalent(C6_TRI_KARMA_EM_RATIO) },
      ],
    }],
  };
}

function triKarmaTrigger(
  source: NonNullable<GenericCharacterDefinition["skill"]>["instances"][number],
  constellationLevel: number,
): TriggeredEffectDefinition<KitAbility> {
  return {
    id: constellationLevel >= 6 ? "nahida-c6-karmic-oblivion" : "nahida-tri-karma-follow-up",
    name: constellationLevel >= 6 ? "Karmic Oblivion" : "Tri-Karma Purification",
    // Seeds of Skandha and reaction filtering are unavailable state channels.
    // This trigger therefore represents only the executable post-skill window.
    trigger: "onDamageDealt",
    durationSeconds: constellationLevel >= 6 ? C6_DURATION_SECONDS : TRI_KARMA_DURATION_SECONDS,
    icdSeconds: constellationLevel >= 6 ? C6_ICD_SECONDS : 2.5,
    ...(constellationLevel >= 6 ? { maxProcs: C6_MAX_PROCS } : {}),
    sourceCharacterId: nahida.id,
    snapshotMode: "cast",
    ability: constellationLevel >= 6 ? c6TriKarmaAttack(source) : {
      id: TRI_KARMA_ID,
      name: "Tri-Karma Purification",
      slot: "skill",
      castTime: 0,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{ ...source, id: `${TRI_KARMA_ID}-1` }],
    },
  };
}

export function createNahidaDefinition(
  constellationLevel = nahida.constellationLevel,
  talentLevels: TalentLevels = nahida.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const triKarmaSource = nahida.skill.instances[2];
  if (triKarmaSource === undefined) throw new Error("Nahida skill is missing its sourced Tri-Karma row");

  const passives = nahida.passives.map((passive) =>
    passive.id === "nahida-a4"
      ? { ...passive, buffs: [triKarmaDamageBuff()] }
      : passive,
  );
  const skill: KitAbility = {
    ...nahida.skill,
    // Tap/Hold damage are cast damage; Tri-Karma is a later marked-target hit.
    instances: nahida.skill.instances.slice(0, 2),
    triggers: [triKarmaTrigger(triKarmaSource, level)],
  };

  return {
    ...nahida,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives,
    skill,
  };
}

export const nahidaWithKit = createNahidaDefinition();

export const NAHIDA_KIT_METADATA = {
  triKarmaDurationSeconds: TRI_KARMA_DURATION_SECONDS,
  c6DurationSeconds: C6_DURATION_SECONDS,
  c6IcdSeconds: C6_ICD_SECONDS,
  c6MaxProcs: C6_MAX_PROCS,
  a4EmThreshold: A4_EM_THRESHOLD,
  a4DmgRatio: A4_DMG_RATIO,
  a4CritRateRatio: A4_CRIT_RATE_RATIO,
  unsupportedChannels: [
    "a1ShrineOfMayaPartyHighestEmShare",
    "c1ShrineOfMayaElementCounting",
    "c2MarkedTargetReactionCritAndDefReduction",
    "c4MarkedTargetCountEmBonus",
    "c6MarkedTargetAndConnectedOpponentsGate",
    "p3HarvestableInteraction",
  ],
} as const;
