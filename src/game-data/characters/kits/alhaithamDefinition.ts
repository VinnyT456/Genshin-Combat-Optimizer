/**
 * Alhaitham's runtime kit overlay.
 *
 * The generated rows contain sourced talent multipliers. This adapter adds the
 * subset the generic runtime can represent without guessing: one
 * Chisel-Light Mirror from the skill, its one-mirror Projection Attack, mirror
 * consumption by the burst, and Mysteries Laid Bare. Mirror-count-dependent
 * burst variants remain fail-closed because no conditional cast-variant seam
 * exists yet.
 */
import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { alhaitham } from "../generated/dendro";

const MIRROR_RESOURCE_ID = "alhaitham-mirrors";

const EM_PROJECTION_BONUS = {
  sourceStat: "elementalMastery" as const,
  targetStat: "elementalDmgBonus" as const,
  element: "dendro" as const,
  ratio: 0.001,
  maxCap: 1,
};

function mysteryBuff(abilityIds: readonly string[]) {
  return {
    id: "alhaitham-mysteries-laid-bare",
    source: "Mysteries Laid Bare",
    sourceCharacterId: "alhaitham",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" as const },
    targets: { scope: "self" as const },
    conditions: { abilityIds },
    conversions: [EM_PROJECTION_BONUS],
  };
}

export function createAlhaithamDefinition(
  constellationLevel = alhaitham.constellationLevel,
  talentLevels: TalentLevels = alhaitham.talentLevels,
  overrides?: Pick<GenericCharacterDefinition, "level" | "baseStats">,
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const sourcedProjection = alhaitham.skill.instances[1];
  const sourcedRush = alhaitham.skill.instances[0];
  if (sourcedProjection === undefined || sourcedRush === undefined) {
    throw new Error("Alhaitham skill is missing sourced Projection Attack rows");
  }

  const skill: KitAbility = {
    ...alhaitham.skill,
    instances: [sourcedRush, sourcedProjection],
    effects: [{ resourceId: MIRROR_RESOURCE_ID, kind: "gain", amount: 1 }],
  };
  const burst: KitAbility = {
    ...alhaitham.burst,
    // The generated source publishes one verified Field hit. Mirror-count
    // variants are intentionally not fabricated here.
    effects: [{ resourceId: MIRROR_RESOURCE_ID, kind: "consume", amount: 3 }],
    buffs: [mysteryBuff([alhaitham.burst.id])],
  };

  return {
    ...alhaitham,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill,
    burst,
    resources: [{ id: MIRROR_RESOURCE_ID, name: "Chisel-Light Mirrors", initial: 0, max: 3 }],
  };
}

export const alhaithamWithKit = createAlhaithamDefinition();
