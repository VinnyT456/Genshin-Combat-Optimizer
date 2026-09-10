import type { ActiveBuff, TalentLevelModifier, TalentSlot } from "@/simulation/buffs/types";

// ============================================================================
// Talent-level channel.
//
// "Increases the Level of Elemental Skill by 3" is the single most common
// constellation shape in the game (259 of the roster's emitted effects). It was
// unrepresentable until now for one reason: a TALENT LEVEL IS NOT A STAT. It
// does not enter `stat = base * (1 + pct) + flat`; it selects a DIFFERENT ROW
// out of the ability's per-level multiplier table before any stat math runs.
//
// So it gets its own channel alongside `modifiers` (character stats) and
// `enemyModifiers` (enemy DEF/RES), not a new `StatKey`. Folding it into
// `StatKey` would have been the cheap move and the wrong one: every consumer of
// `Stats` would then have to know that one of its numbers is an index, not a
// magnitude.
//
// WHAT THIS MODULE PRODUCES: a per-slot integer DELTA (+3 skill).
// WHAT IT DOES NOT DO: apply it. Talent lookup lives in
// `src/simulation/character/talent.ts`, which mechanics does not own and may
// not import (layering is one-way: mechanics sits BELOW character). The delta
// is handed across the seam and applied at lookup time. See the contract note
// on `MAX_TALENT_LEVEL_BOUND` below.
// ============================================================================

/**
 * Upper bound a boosted talent level is clamped to.
 *
 * This MIRRORS `MAX_TALENT_LEVEL` in `src/simulation/character/talent.ts`, which
 * is the authoritative definition. It is re-declared rather than imported
 * because the character module sits ABOVE mechanics in the layering
 * (`docs/ARCHITECTURE.md`) and a lower layer must not import upward — the same
 * reason `getActiveBuffs.ts` re-derives the resource-expiry rule. This is a
 * shared CONTRACT (one number, stated in both places), not duplicated logic.
 *
 * The value is load-bearing twice over:
 *  - Every talent table in the emitted roster carries exactly 15 levels
 *    (confirmed across all 1818 tables), so a +3 boost on a level-15 talent
 *    must not index past the end.
 *  - In game, constellation prose says so explicitly: "Maximum upgrade level
 *    is 15."
 *
 * If the game ever raises the cap, BOTH constants must move together. The
 * `talentLevel.test.ts` guard asserts they agree.
 */
export const MAX_TALENT_LEVEL_BOUND = 15;

/**
 * Lower bound. Mirrors `MIN_TALENT_LEVEL`; see {@link MAX_TALENT_LEVEL_BOUND}.
 *
 * Present so a NEGATIVE boost (no known game source, but expressible data)
 * cannot drive a level below the bottom of the table.
 */
export const MIN_TALENT_LEVEL_BOUND = 1;

/** Neutral deltas: no slot boosted. */
export const NO_TALENT_LEVEL_BOOSTS: TalentLevelBoosts = {};

/**
 * Per-slot talent-level DELTAS active for one damage instance.
 *
 * A delta, never an absolute level: the buff layer does not know a character's
 * configured talent levels and must not invent them. Absent key == +0.
 *
 * Sparse by design. A slot with a net-zero delta is OMITTED rather than
 * materialised as 0, for exactly the reason `reactionBonus` omits its key:
 * `{}` and `{ skill: 0 }` are behaviourally identical but hash differently,
 * which would split optimizer memo entries for zero information.
 */
export type TalentLevelBoosts = Partial<Record<TalentSlot, number>>;

/**
 * Sum the talent-level boosts carried by already-filtered active buffs.
 *
 * COMPOSITION: multiple boosts to the SAME slot ADD (a C3 +3 and a C5 +3 on the
 * same slot give +6), scaled by stack count like every other buff channel.
 * Different slots never interact.
 *
 * NOT CLAMPED HERE. Clamping is deliberately deferred to
 * {@link resolveTalentLevel}, because the cap applies to the RESULTING LEVEL
 * (base + delta <= 15), not to the delta. Clamping the delta alone would be
 * wrong in both directions: it would cap a +20 boost on a level-1 talent at
 * +15 (fine by accident) while letting +3 on a level-15 talent through (wrong).
 *
 * Pure; returns a fresh object and never mutates its input.
 */
export function sumTalentLevelBoosts(
  active: readonly ActiveBuff[],
): TalentLevelBoosts {
  const boosts: TalentLevelBoosts = {};
  for (const { buff, stacks } of active) {
    for (const modifier of buff.talentLevelModifiers ?? []) {
      accumulate(boosts, modifier, stacks);
    }
  }
  return boosts;
}

/**
 * Fold one modifier into `boosts`. Mutates only the accumulator the caller owns.
 *
 * A net-zero slot is REMOVED rather than left as 0, so the sparse-key invariant
 * holds even when two boosts cancel (+3 then -3).
 */
function accumulate(
  boosts: TalentLevelBoosts,
  modifier: TalentLevelModifier,
  stacks: number,
): void {
  const current = boosts[modifier.slot] ?? 0;
  const next = current + modifier.levels * stacks;
  if (next === 0) {
    delete boosts[modifier.slot];
    return;
  }
  boosts[modifier.slot] = next;
}

/**
 * Apply a delta to a character's configured talent level, clamped into the
 * legal range.
 *
 *     effectiveLevel = clamp(configuredLevel + delta, 1, 15)
 *
 * This is the function the talent-lookup seam should call. It is exported so
 * the clamp rule lives in exactly ONE place: a caller that adds the delta
 * itself and clamps separately is the shape that eventually reads past the end
 * of a 15-entry table.
 *
 * `talentValueAt()` already clamps its own input, so an unclamped level would
 * not crash today — it would silently resolve to the level-15 row while the UI
 * reported level 18. Clamping here keeps the REPORTED level honest, which is
 * the part `talentValueAt` cannot fix.
 *
 * Pure and total for any finite input.
 */
export function resolveTalentLevel(
  configuredLevel: number,
  delta: number,
): number {
  const boosted = configuredLevel + delta;
  if (boosted < MIN_TALENT_LEVEL_BOUND) return MIN_TALENT_LEVEL_BOUND;
  if (boosted > MAX_TALENT_LEVEL_BOUND) return MAX_TALENT_LEVEL_BOUND;
  return boosted;
}

/**
 * Convenience: the effective level of one slot given a boost bag.
 *
 * A slot with no boost resolves to the configured level, still clamped — so an
 * out-of-range configured level is corrected even with no constellation active.
 */
export function effectiveTalentLevel(
  slot: TalentSlot,
  configuredLevel: number,
  boosts: TalentLevelBoosts,
): number {
  return resolveTalentLevel(configuredLevel, boosts[slot] ?? 0);
}
