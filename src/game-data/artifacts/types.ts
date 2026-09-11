export type ArtifactSetId = string;

/**
 * How many pieces activate a bonus.
 *
 * Two and four are the familiar tiers, but the game also ships single-piece
 * sets -- the elemental-resistance relics (Instructor's/Exile-era 1-piece
 * items, source ids 15009-15013) grant their effect from one piece. The union
 * covers what the sources actually publish rather than the common case.
 */
export type ArtifactBonusPieces = 1 | 2 | 4;

export interface ArtifactSetBonus {
  readonly pieces: ArtifactBonusPieces;
  readonly descriptionZh: string; // Official Chinese set bonus description
}

/**
 * Rarity, as the maximum of the source's `levelList`.
 *
 * Three-star sets are real and are published by both sources; the previous
 * hand-authored table simply contained none, so its `5 | 4` union described the
 * table rather than the game.
 */
export type ArtifactRarity = 3 | 4 | 5;

export interface ArtifactSetDefinition {
  readonly id: ArtifactSetId;
  /** Numeric catalog id. Current game data allocates ids in release order. */
  readonly setId?: number;
  readonly nameZh: string;         // Official Chinese name
  readonly nameEn: string;         // English (for search/reference only)
  readonly rarity: ArtifactRarity;
  readonly bonuses: readonly ArtifactSetBonus[]; // 1pc, 2pc and/or 4pc
  /** Project Amber's internal icon identity (never derived from a set name). */
  readonly iconId?: string;
  readonly iconUrl?: string;       // Flower piece icon URL used as set icon
  readonly version?: string;       // e.g. "1.0"
  readonly versionWeight?: number; // Higher = newer release, for sorting
}
