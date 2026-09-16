/** Runtime Neuvillette overlay for executable HP, stack, and constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { neuvillette } from "../generated/hydro";

const DRACONIC_GLORIES_RESOURCE_ID = "neuvillette-past-draconic-glories";
const DRACONIC_GLORIES_MAX_STACKS = 3;
const A1_CHARGED_HP_RATIO_PER_STACK = 0.28;
const C2_CRIT_DMG_PER_STACK = 0.14;

export interface NeuvilletteKitOptions {
  /** Sourced reaction-triggered stacks supplied by the scenario. */
  readonly draconicGloriesStacks?: number;
}

function c2CritDamageBuff(stackCount: number): Buff | undefined {
  if (stackCount === 0) return undefined;
  return {
    id: "neuvillette-c2-juridical-exhortation",
    source: "Juridical Exhortation",
    sourceCharacterId: neuvillette.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      damageTypes: ["charged"],
      resources: [{ resourceId: DRACONIC_GLORIES_RESOURCE_ID, comparator: "gte", value: 1 }],
    },
    modifiers: [{ stat: "critDmg", value: stackCount * C2_CRIT_DMG_PER_STACK }],
  };
}

export function createNeuvilletteDefinition(
  constellationLevel = neuvillette.constellationLevel,
  talentLevels: TalentLevels = neuvillette.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  options: NeuvilletteKitOptions = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const stacks = Math.max(0, Math.min(DRACONIC_GLORIES_MAX_STACKS, Math.trunc(options.draconicGloriesStacks ?? 0)));
  const sourcedCharged = neuvillette.chargedAttack;
  if (sourcedCharged === undefined) throw new Error("Neuvillette charged attack is missing from generated data");

  const chargedAttack = {
    ...sourcedCharged,
    instances: sourcedCharged.instances.map((instance) => ({
      ...instance,
      resourceScaling: [{
        resourceId: DRACONIC_GLORIES_RESOURCE_ID,
        stat: "hp" as const,
        multiplierPerStack: A1_CHARGED_HP_RATIO_PER_STACK,
        snapshot: "hit" as const,
      }],
    })),
  };

  const initialStacks = Math.max(stacks, level >= 1 ? 1 : 0);
  const c2Buff = level >= 2 ? c2CritDamageBuff(initialStacks) : undefined;

  return {
    ...neuvillette,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    chargedAttack,
    resources: [{
      id: DRACONIC_GLORIES_RESOURCE_ID,
      name: "Past Draconic Glories",
      initial: initialStacks,
      max: DRACONIC_GLORIES_MAX_STACKS,
      durationSeconds: 30,
    }],
    constellations: neuvillette.constellations.map((constellation) =>
      constellation.id === "neuvillette-c2"
        ? { ...constellation, buffs: c2Buff === undefined ? [] : [c2Buff] }
        : constellation,
    ),
  };
}

export const NEUVILLETTE_KIT_METADATA = {
  draconicGloriesResourceId: DRACONIC_GLORIES_RESOURCE_ID,
  draconicGloriesMaxStacks: DRACONIC_GLORIES_MAX_STACKS,
  a1ChargedHpRatioPerStack: A1_CHARGED_HP_RATIO_PER_STACK,
  c2CritDmgPerStack: C2_CRIT_DMG_PER_STACK,
  unsupportedChannels: [
    "a1ReactionTriggeredStackGeneration",
    "a4CurrentHpDependentHydroDamageBonus",
    "c1ChargedAttackDirectCastAndInterruptionResistance",
    "c4SourcewaterDropletGenerationFromHealing",
    "c6AdditionalEquitableJudgmentWaterfallsAndStackConsumption",
    "p3FontaineExpeditionRewardBonus",
  ],
} as const;

export const neuvilletteWithKit = createNeuvilletteDefinition();
