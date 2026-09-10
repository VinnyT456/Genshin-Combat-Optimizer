import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";

// ---------------------------------------------------------------------------
// Artifact browsing model — filtering and a STATED order.
//
// THE DEFECT THIS FIXES: the picker's header read
// `按游戏上线版本顺序排列` ("ordered by the game version that released them"),
// but neither source publishes a release version. `version` / `versionWeight`
// are declared optional on the type and emitted by NOTHING, so the list was
// simply in generated set-id order and the header was a false statement about
// the user's own screen.
//
// The label was fixed by fixing the SORT: the list is now ordered by rarity and
// then by Chinese name, and the header says exactly that. A version sort could
// not be honest without version data, and inventing one from set id would be
// the same false claim with extra steps.
//
// Pure: no React, no DOM.
// ---------------------------------------------------------------------------

export type ArtifactRarityFilter = "all" | 4 | 5;

export interface ArtifactFilterState {
  readonly rarity: ArtifactRarityFilter;
  readonly query: string;
}

/**
 * Rarity descending, then Chinese name — the order the header states.
 *
 * `localeCompare` with `zh-CN` sorts by pinyin, which is the order a Chinese
 * reader expects from a name list. The comparator is total: two sets with the
 * same rarity and name would fall back to id, so the order never depends on the
 * input array's incoming order.
 */
export function sortArtifacts(
  sets: readonly ArtifactSetDefinition[],
): readonly ArtifactSetDefinition[] {
  return [...sets].sort((a, b) => {
    if (a.rarity !== b.rarity) return b.rarity - a.rarity;
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
