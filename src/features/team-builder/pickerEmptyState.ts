// ---------------------------------------------------------------------------
// Pure model for "why is this picker showing nothing?".
//
// COMPONENTS.md §4.7 requires the empty state to name its CAUSE: a search miss,
// a filter combination, and an exhausted roster are three different situations
// with three different remedies, and collapsing them into one "no results"
// string tells the user nothing about how to recover.
//
// This lives outside the component so the branch logic is unit-testable — the
// repo has no jsdom, so any logic left inline in TSX is untestable by
// construction.
// ---------------------------------------------------------------------------

/** Which recovery control the empty state offers. */
export type PickerEmptyAction = "clear-search" | "clear-filters" | "none";

export type PickerEmptyKind =
  | "none"
  | "roster-error"
  | "no-search-match"
  | "no-filter-match"
  | "all-taken";

export interface PickerEmptyState {
  readonly kind: PickerEmptyKind;
  /** Primary sentence. Empty string when `kind` is `none`. */
  readonly message: string;
  /** Recovery affordance the component should render. */
  readonly action: PickerEmptyAction;
}

/** Inputs describing the picker's current result set. */
export interface PickerEmptyInput {
  /** Total size of the unfiltered roster handed to the picker. */
  readonly rosterSize: number;
  /** Size of the result set after all facets and the query are applied. */
  readonly filteredSize: number;
  /** Raw search box contents. */
  readonly query: string;
  /** True when any of element / weapon / rarity is narrowed. */
  readonly hasFacetFilters: boolean;
  /**
   * Number of results that exist but are unselectable because the character
   * already occupies another slot. Used to distinguish "nothing matches" from
   * "everything that matches is already on your team", which read identically
   * to the user but have opposite remedies.
   */
  readonly takenCount: number;
}

const ROSTER_ERROR =
  "角色数据加载失败，请刷新页面后重试。";
const ALL_TAKEN =
  "符合条件的角色均已在队伍中。";

/**
 * Resolves the single empty state that applies, in priority order:
 * roster error → all-taken → search miss → filter miss.
 *
 * A zero-length roster is an ERROR, not an empty state: the roster is static
 * data and is never legitimately empty (COMPONENTS.md §4.7).
 */
export function resolvePickerEmptyState(
  input: PickerEmptyInput,
): PickerEmptyState {
  const { rosterSize, filteredSize, query, hasFacetFilters, takenCount } = input;

  if (rosterSize === 0) {
    return { kind: "roster-error", message: ROSTER_ERROR, action: "none" };
  }

  // Results exist but every one of them is already on the team. This is a
  // distinct situation from "no results": clearing filters would not help.
  if (filteredSize > 0 && takenCount >= filteredSize) {
    return { kind: "all-taken", message: ALL_TAKEN, action: "none" };
  }

  if (filteredSize > 0) {
    return { kind: "none", message: "", action: "none" };
  }

  const trimmed = query.trim();

  // Search text is the most specific cause, so it is named first and its
  // remedy (clear the text) is the least destructive one.
  if (trimmed.length > 0) {
    return {
      kind: "no-search-match",
      message: `没有角色匹配「${trimmed}」。`,
      action: "clear-search",
    };
  }

  if (hasFacetFilters) {
    return {
      kind: "no-filter-match",
      message: "没有角色符合当前筛选条件。",
      action: "clear-filters",
    };
  }

  // No query, no facets, non-empty roster, zero results: the filter pipeline
  // is inconsistent with its input. Surfaced as an error rather than silently
  // rendering a bare empty box.
  return { kind: "roster-error", message: ROSTER_ERROR, action: "none" };
}
