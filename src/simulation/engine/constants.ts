// ============================================================================
// Engine constants.
//
// Every tunable number the engine relies on lives here with a source note, so
// the simulation body stays free of magic numbers.
// ============================================================================

/**
 * Seconds of on-field time consumed by a character swap.
 *
 * 0.6s is the commonly used theorycrafting figure for a swap + animation
 * cancel window. UNCERTAIN: the true in-game cost varies with animation,
 * latency and cancel technique; treat as a configurable model parameter
 * (`SimulationConfig.swapCost`), not a game constant.
 */
export const DEFAULT_SWAP_COST_SECONDS = 0.6;

/** Floating-point slack for time / energy comparisons (seconds or energy). */
export const EPSILON = 1e-9;

/**
 * Floor for `SimulationConfig.swapCost`. A swap consumes on-field time, so a
 * negative cost is never legitimate — it would rewind the simulation clock and
 * yield a negative duration. Values below this are clamped with a warning.
 */
export const MIN_SWAP_COST_SECONDS = 0;
