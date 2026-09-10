import type { Element } from "@/types";
import type { AbilitySlot, KitAbility } from "@/simulation/character/kit";
import type { ScalingStat } from "@/simulation/character/scaling";
import {
  MAX_TALENT_LEVEL,
  MIN_TALENT_LEVEL,
  talentValueAt,
} from "@/simulation/character/talent";

// ---------------------------------------------------------------------------
// Character detail — ability breakdown at a chosen talent level.
//
// The kit stores every multiplier as a PER-LEVEL TABLE (1..15). This module
// turns that data into rows a table can render at one selected level.
//
// It computes NO damage. It performs table lookup and presentation shaping
// only: resolving `table -> multiplier at level` through the engine's own
// `talentValueAt`, grouping terms, and labelling stats. Actual damage requires
// stats, buffs, enemy state and the whole pipeline, and belongs exclusively to
// `simulateRotation()`.
//
// Pure: no React, no DOM, no clock.
// ---------------------------------------------------------------------------

/** Talent levels a user may select, ascending. */
export const TALENT_LEVELS: readonly number[] = Array.from(
  { length: MAX_TALENT_LEVEL - MIN_TALENT_LEVEL + 1 },
  (_, i) => MIN_TALENT_LEVEL + i,
);

/** Chinese labels for the stat a multiplier scales from. */
const SCALING_STAT_ZH: Record<ScalingStat, string> = {
  atk: "攻击力",
  hp: "生命值上限",
  def: "防御力",
  elementalMastery: "元素精通",
};

/** Chinese label for a scaling stat, used in ability rows and legends. */
export function scalingStatZh(stat: ScalingStat): string {
  return SCALING_STAT_ZH[stat];
}

/** One scaling term of one hit, resolved at the selected talent level. */
export interface ResolvedTerm {
  readonly stat: ScalingStat;
  readonly statLabel: string;
  /** Fraction: 1.94 means 194% of `stat`. */
  readonly multiplier: number;
}

/** One damage instance (one hit) of an ability at the selected level. */
export interface AbilityInstanceRow {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly terms: readonly ResolvedTerm[];
  /** True when this hit sums more than one stat (hybrid scaling). */
  readonly hybrid: boolean;
  /** Gauge units applied, when this hit applies an element. */
  readonly gauge?: number;
}

/** An ability resolved for display at one talent level. */
export interface AbilityDetail {
  readonly id: string;
  readonly name: string;
  readonly slot: AbilitySlot;
  readonly level: number;
  readonly castTime: number;
  /** Cooldown at the selected level; `undefined` when the ability has none. */
  readonly cooldown: number | undefined;
  /** Burst cost; `undefined` for non-bursts rather than a misleading 0. */
  readonly energyCost: number | undefined;
  readonly particles: number | undefined;
  readonly instances: readonly AbilityInstanceRow[];
  /** Distinct stats this ability scales from, for an at-a-glance summary. */
  readonly scalingStats: readonly ScalingStat[];
}

/**
 * Clamps a requested talent level into the valid 1..15 range.
 *
 * Clamping rather than throwing matches `talentValueAt`: an out-of-range level
 * is a UI state problem, never a reason to blank the page.
 */
export function clampTalentLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_TALENT_LEVEL;
  return Math.min(Math.max(Math.trunc(level), MIN_TALENT_LEVEL), MAX_TALENT_LEVEL);
}

function resolveTerms(
  ability: KitAbility,
  instanceIndex: number,
  level: number,
): readonly ResolvedTerm[] {
  const instance = ability.instances[instanceIndex];
  if (instance === undefined) return [];
  return instance.scaling.map((term) => ({
    stat: term.stat,
    statLabel: SCALING_STAT_ZH[term.stat],
    multiplier: talentValueAt(term.table, level),
  }));
}

/**
 * Resolves one ability for display at `level`.
 *
 * `cooldown` and `energyCost` are reported as `undefined` when the ability has
 * none, so the UI can omit the field entirely instead of printing `0 s`, which
 * would read as "instantly reusable" rather than "not applicable".
 */
export function buildAbilityDetail(ability: KitAbility, level: number): AbilityDetail {
  const resolvedLevel = clampTalentLevel(level);

  const instances: AbilityInstanceRow[] = ability.instances.map((instance, index) => {
    const terms = resolveTerms(ability, index, resolvedLevel);
    return {
      id: instance.id,
      name: instance.name,
      element: instance.element,
      terms,
      hybrid: terms.length > 1,
      gauge: instance.application?.gauge,
    };
  });

  const scalingStats: ScalingStat[] = [];
  for (const row of instances) {
    for (const term of row.terms) {
      if (!scalingStats.includes(term.stat)) scalingStats.push(term.stat);
    }
  }

  const cooldownValue = talentValueAt(ability.cooldown, resolvedLevel);

  return {
    id: ability.id,
    name: ability.name,
    slot: ability.slot,
    level: resolvedLevel,
    castTime: ability.castTime,
    cooldown: cooldownValue > 0 ? cooldownValue : undefined,
    energyCost: ability.energyCost > 0 ? ability.energyCost : undefined,
    particles: ability.particles?.count,
    instances,
    scalingStats,
  };
}

/**
 * The per-level curve of one ability's total multiplier, for the level table.
 *
 * Sums every term of every instance at each level. This is a *multiplier*
 * total, not damage — hybrid abilities sum fractions of different stats, so the
 * figure is only meaningful as a relative growth curve. Callers must label it
 * as such; it is never presented as a damage number.
 */
export function totalMultiplierAt(ability: KitAbility, level: number): number {
  const resolvedLevel = clampTalentLevel(level);
  let total = 0;
  for (const instance of ability.instances) {
    for (const term of instance.scaling) {
      total += talentValueAt(term.table, resolvedLevel);
    }
  }
  return total;
}

/**
 * Whether an ability's multipliers actually vary across talent levels.
 *
 * Some abilities are authored with a single-entry (flat) table. Showing a level
 * selector for those implies a growth that does not exist, so the UI uses this
 * to suppress it.
 */
export function hasLevelVariation(ability: KitAbility): boolean {
  return ability.instances.some((instance) =>
    instance.scaling.some((term) => new Set(term.table.values).size > 1),
  );
}
