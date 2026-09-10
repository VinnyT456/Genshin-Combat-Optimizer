import type {
  BuffContext,
  TalentLevelBoostMap,
  TalentLevelResolver,
} from "@/types";
import { NO_TALENT_LEVEL_BOOSTS } from "@/types";

// ============================================================================
// Talent-level seam.
//
// Third sibling of `buffSeam.ts` (character stats) and `enemySeam.ts` (enemy
// DEF/RES). Same shape, same purity rules, separate channel — because a talent
// LEVEL is not a stat. It does not enter `stat = base * (1 + pct) + flat`; it
// selects a different ROW from the ability's per-level multiplier table,
// upstream of all stat math. "Increases the Level of Elemental Skill by 3" is
// the most common constellation shape in the game.
//
// The engine does not know what a constellation is. It asks the mechanics
// layer, once per CAST, for a sparse bag of per-slot DELTAS, and hands it to
// `planAbility`, which selects the table row. The engine never decides what a
// boost is worth; mechanics never decides which row exists.
//
// Resolved per CAST rather than per hit because `planAbility` expands a whole
// cast's instances at ONE talent level — resolving per hit would imply hits of
// the same cast could read different rows, which is not a thing.
//
// Until a caller supplies a resolver the engine uses
// `noOpTalentLevelResolver`, which reports no boost and therefore preserves
// existing behaviour exactly.
// ============================================================================

/** Reports no talent-level boost. Levels are the character's configured ones. */
export const noOpTalentLevelResolver: TalentLevelResolver = () =>
  NO_TALENT_LEVEL_BOOSTS;

export function resolveTalentLevelBoosts(
  context: BuffContext,
  resolver: TalentLevelResolver | undefined,
): TalentLevelBoostMap {
  return (resolver ?? noOpTalentLevelResolver)(context);
}
