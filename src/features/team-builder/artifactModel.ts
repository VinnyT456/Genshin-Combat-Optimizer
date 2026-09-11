import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";

// ---------------------------------------------------------------------------
// Artifact browsing model — filtering and chronological ordering.
//
// The generated catalog carries the game's numeric set id. These ids are
// allocated in release order, so descending set id gives a stable newest-to-
// oldest chronology without maintaining a hand-written version table.
//
// Pure: no React, no DOM.
// ---------------------------------------------------------------------------

export type ArtifactRarityFilter = "all" | 4 | 5;

export interface ArtifactFilterState {
  readonly rarity: ArtifactRarityFilter;
  readonly query: string;
}

/**
 * Chronological newest-to-oldest order, then deterministic fallbacks.
 *
 * A missing catalog id is sorted after sourced rows. `localeCompare` with
 * `zh-CN` sorts fallback names by pinyin, and id breaks the final tie.
 */
export function sortArtifacts(
  sets: readonly ArtifactSetDefinition[],
): readonly ArtifactSetDefinition[] {
  return [...sets].sort((a, b) => {
    const aOrder = a.setId;
    const bOrder = b.setId;
    if (aOrder !== undefined && bOrder !== undefined && aOrder !== bOrder) {
      return bOrder - aOrder;
    }
    if (aOrder === undefined && bOrder !== undefined) return 1;
    if (aOrder !== undefined && bOrder === undefined) return -1;
    const byName = a.nameZh.localeCompare(b.nameZh, "zh-CN");
    if (byName !== 0) return byName;
    return a.id.localeCompare(b.id);
  });
}

export function filterArtifacts(
  sets: readonly ArtifactSetDefinition[],
  filters: ArtifactFilterState,
): readonly ArtifactSetDefinition[] {
  const q = filters.query.trim().toLowerCase();
  const matched = sets.filter((set) => {
    if (filters.rarity !== "all" && set.rarity !== filters.rarity) return false;
    if (q.length === 0) return true;
    return (
      set.nameZh.toLowerCase().includes(q) ||
      set.nameEn.toLowerCase().includes(q) ||
      set.bonuses.some((bonus) => bonus.descriptionZh.toLowerCase().includes(q))
    );
  });
  return sortArtifacts(matched);
}
