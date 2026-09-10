// ============================================================================
// Talent levels — multipliers are PER-LEVEL TABLES, never scalars.
//
// In game every talent multiplier is a function of the talent's level (1..15).
// Storing a scalar bakes in one level and makes the data unusable at any other,
// so the primitive here is a table indexed by level.
//
// No values are invented in this module: it defines the SHAPE and the lookup,
// and game-data supplies verified tables.
// ============================================================================

/** Talent levels are 1-based; 15 is the in-game maximum with constellations. */
export const MIN_TALENT_LEVEL = 1;
export const MAX_TALENT_LEVEL = 15;

/**
 * A multiplier as a function of talent level.
 *
 * `values[0]` is the level-1 value. The table need not be full length — a
 * shorter table clamps at its last entry, which lets partially-sourced data be
 * expressed honestly rather than padded with guesses.
 */
export interface TalentTable {
  readonly values: readonly number[];
}

/** Builds a table from an ordered level-1..N list. */
export function talentTable(values: readonly number[]): TalentTable {
  return { values };
}

/**
 * A constant that does not vary with talent level (e.g. a fixed cooldown).
 * Expressed as a 1-entry table so every consumer has one code path.
 */
export function flatTalent(value: number): TalentTable {
  return { values: [value] };
}

/**
 * Value of `table` at `level`, clamping into range at both ends.
 *
 * Clamping rather than throwing is deliberate: a short/partial table is a data
 * completeness issue, not a reason to crash a simulation. Deterministic for any
 * input.
 */
export function talentValueAt(table: TalentTable, level: number): number {
  const { values } = table;
  if (values.length === 0) return 0;
  const clampedLevel = Math.min(Math.max(level, MIN_TALENT_LEVEL), MAX_TALENT_LEVEL);
  const index = Math.min(clampedLevel - MIN_TALENT_LEVEL, values.length - 1);
  return values[index]!;
}
