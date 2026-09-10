import type { Element } from "@/types";

// ============================================================================
// Scaling — which stat a damage instance derives its base damage from.
//
// Replaces the `scaling: "atk"` literal in the legacy `AbilityDefinition`.
// A real kit can scale off ATK, HP, DEF or EM, and several scale off more than
// one stat at once (a "hybrid" instance), so the general shape is a LIST of
// (stat, multiplier) terms that are summed. A pure-ATK instance is simply a
// one-term list, which keeps the common case cheap to author.
// ============================================================================

/** Stats a talent multiplier may scale from. */
export type ScalingStat = "atk" | "hp" | "def" | "elementalMastery";

/**
 * One scaling term: `multiplier` fraction of `stat`.
 *
 * `multiplier` is the value for the CURRENT talent level — the per-level table
 * lookup happens before a term is built (see `talent.ts`), so nothing
 * downstream of this type needs to know about talent levels.
 */
export interface ScalingTerm {
  stat: ScalingStat;
  /** Fraction of `stat`. 2.0 == 200% of that stat. */
  multiplier: number;
}

/**
 * Base damage contribution of a set of scaling terms.
 *
 * Terms are SUMMED, which is the in-game behaviour for hybrid instances
 * (e.g. "X% ATK + Y% max HP"). Deterministic: a plain fold, no iteration-order
 * sensitivity beyond the array's own order, and addition of the same terms in
 * the same order is exact.
 */
export function scaledBase(
  terms: readonly ScalingTerm[],
  stats: Readonly<Record<ScalingStat, number>>,
): number {
  let total = 0;
  for (const term of terms) total += term.multiplier * stats[term.stat];
  return total;
}

/** Elemental gauge units applied by a hit: 1U, 2U or 4U. */
export type GaugeUnits = 1 | 2 | 4;

/**
 * Elemental application of one damage instance.
 *
 * `gauge` is the aura strength applied. `icdGroup` names the ICD counter the
 * hit shares with other hits — hits in the same group on the same character
 * share a hit-count/time window. Mechanics owns ICD EVALUATION; this type only
 * carries the declaration.
 */
export interface ElementalApplication {
  element: Element;
  gauge: GaugeUnits;
  /**
   * ICD bucket key. Hits sharing a key share one counter. Absent means the hit
   * has NO internal cooldown and applies its gauge every time.
   */
  icdGroup?: string;
}
