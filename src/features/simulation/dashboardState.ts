// ---------------------------------------------------------------------------
// Pure model for the dashboard's top-level state.
//
// The empty (nothing simulated yet) and post-simulation states are genuinely
// different layouts, not one layout with holes: before a run there are no
// numbers to rank, so the page's job is to explain what to do next; after a
// run its job is to present results. Which one applies — and whether the
// primary action is even reachable — is decided here rather than inline, so
// the branch table can be tested without a DOM.
// ---------------------------------------------------------------------------

/** Why the simulate action is unavailable, if it is. */
export type BlockedReason = "no-team" | "no-rotation" | null;

export type DashboardPhase =
  /** Nothing has been simulated and the run is blocked by configuration. */
  | "blocked"
  /** Nothing simulated yet, but the configuration is runnable. */
  | "ready"
  /** A result exists and reflects the current configuration. */
  | "results"
  /** A result exists but the configuration changed underneath it. */
  | "stale";

export interface DashboardStateInput {
  readonly memberCount: number;
  readonly rotationLength: number;
  readonly hasResult: boolean;
  readonly resultStale: boolean;
}

export interface DashboardState {
  readonly phase: DashboardPhase;
  readonly canSimulate: boolean;
  readonly blockedReason: BlockedReason;
  /** True when the results region should render result content. */
  readonly showResults: boolean;
  /** True when the page should render the pre-run guidance layout. */
  readonly showEmptyState: boolean;
}

/**
 * Resolves the dashboard phase.
 *
 * `blocked` outranks everything for the ACTION, but a previously-computed
 * result is still shown: deleting the last rotation step must not silently
 * erase results the user is reading. Staleness is what qualifies them.
 */
export function resolveDashboardState(
  input: DashboardStateInput,
): DashboardState {
  const { memberCount, rotationLength, hasResult, resultStale } = input;

  // Team is checked before rotation: with no characters, a rotation cannot be
  // authored at all, so naming the rotation first would send the user to a
  // control that is itself unusable.
  const blockedReason: BlockedReason =
    memberCount <= 0 ? "no-team" : rotationLength <= 0 ? "no-rotation" : null;

  const canSimulate = blockedReason === null;

  const phase: DashboardPhase = hasResult
    ? resultStale
      ? "stale"
      : "results"
    : canSimulate
      ? "ready"
      : "blocked";

  return {
    phase,
    canSimulate,
    blockedReason,
    showResults: hasResult,
    showEmptyState: !hasResult,
  };
}
