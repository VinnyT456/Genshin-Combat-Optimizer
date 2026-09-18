// ============================================================================
// Manual elemental-skill usage data
//
// Fill this table with the number of times a character can use their
// Elemental Skill before its charges are exhausted. Constellation values are
// ADDITIONAL uses unlocked at that constellation and are accumulated at higher
// constellation levels.
//
// Example:
//   "xiao": {
//     baseUses: 2,
//     additionalUsesByConstellation: { 1: 1 },
//   },
//
// A character with no row continues to use the evidence-derived value from
// the sourced talent text. Do not enter stack counts or recasts as charges.
// ============================================================================

export type ConstellationLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface ElementalSkillUsageEntry {
  /** Base number of independent Skill uses at C0. */
  readonly baseUses: number;
  /** Additional independent uses unlocked at each constellation level. */
  readonly additionalUsesByConstellation?: Readonly<
    Partial<Record<ConstellationLevel, number>>
  >;
  /** Optional source or mechanics note for the author maintaining this row. */
  readonly note?: string;
}

/**
 * Human-maintained overrides for Skill usage counts.
 *
 * This intentionally starts empty: an omitted row means "not yet authored",
 * not "one use". Add only values that have been checked against the relevant
 * character or constellation text.
 */
export const elementalSkillUsageData: Readonly<
  Record<string, ElementalSkillUsageEntry>
> = {};

const CONSTELLATION_LEVELS: readonly ConstellationLevel[] = [1, 2, 3, 4, 5, 6];

function clampConstellationLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.min(6, Math.max(0, Math.trunc(level)));
}

/** Resolves a row at a constellation level, accumulating unlocked bonuses. */
export function elementalSkillUsesForEntry(
  entry: ElementalSkillUsageEntry,
  constellationLevel: number,
): number {
  const level = clampConstellationLevel(constellationLevel);
  let uses = entry.baseUses;
  for (const constellation of CONSTELLATION_LEVELS) {
    if (constellation > level) break;
    uses += entry.additionalUsesByConstellation?.[constellation] ?? 0;
  }
  return uses;
}

/** Returns authored Skill uses, or undefined while a character is unfilled. */
export function elementalSkillUsesAtConstellation(
  characterId: string,
  constellationLevel: number,
): number | undefined {
  const entry = elementalSkillUsageData[characterId];
  return entry === undefined
    ? undefined
    : elementalSkillUsesForEntry(entry, constellationLevel);
}
