// ============================================================================
// Finiteness guards for aura state.
//
// THE RULE (single, deliberate, applied at every ENTRY point — TASK #026):
//
//   A non-finite numeric input to the mechanics layer is treated as ABSENT,
//   i.e. as the identity value for its position:
//
//     * a non-finite GAUGE is treated as 0U  — the attack applies nothing, so
//       it can neither create/refresh an aura nor trigger a reaction;
//     * a non-finite ELEMENTAL MASTERY is treated as 0 EM.
//
// It is CLAMPED-TO-ZERO, not rejected (no throw) and not saturated to a large
// finite value. Rationale:
//
//   1. It matches what the module ALREADY did correctly for negative and NaN
//      gauges (`!(gauge > 0)` is false for both) — `+Infinity` was the single
//      leak. One rule now covers the whole non-finite class instead of two
//      rules that agree by accident.
//   2. Throwing would make a bad input a crash inside the optimizer's search
//      loop rather than a locally-contained no-op, and the engine contract is
//      "illegal actions are skipped with warnings, never thrown".
//   3. Saturating to a large finite gauge would INVENT game state: a 1e308 GU
//      aura is not a real thing, and it would still dominate every reaction.
//
// WHY GUARD AT ENTRY RATHER THAN AT EACH READ:
//   A value that cannot be JSON-serialised must never be STORED. `Infinity`
//   and `NaN` both serialise to `null`, so a Web Worker round trip would
//   silently change the value. Guarding only at read sites leaves the
//   unserialisable value in the state object, so the corruption survives
//   transport even when every reader is careful. Guarding at entry makes the
//   invariant structural: every `Aura`/`CompoundAura` this module produces has
//   finite `gauge`, `since` and `decayRate`, and therefore round-trips.
//
// CONSEQUENCE (asserted by regression tests): every aura this module creates
// has a finite, strictly positive `decayRate`, so `gaugeAt` strictly decreases
// with elapsed time and every aura EVENTUALLY expires. There is no immortal
// aura.
// ============================================================================

/**
 * Gauge units of an incoming application, sanitised.
 *
 * Returns 0 for anything that is not a finite positive number (negative, NaN,
 * +/-Infinity). Callers may then use the existing `> 0` test unchanged.
 */
export function sanitizeGauge(gauge: number): number {
  return Number.isFinite(gauge) && gauge > 0 ? gauge : 0;
}

/**
 * Simulation time, sanitised. A non-finite time cannot anchor an aura (`since`
 * would be unserialisable and every later `gaugeAt` meaningless), so it reads
 * as 0 — the start of the timeline.
 */
export function sanitizeTime(time: number): number {
  return Number.isFinite(time) ? time : 0;
}

/**
 * Elemental Mastery, sanitised. Non-finite reads as 0 EM, matching the EM
 * curves' existing `Math.max(0, em)` clamp for negative values.
 *
 * Note `+Infinity` does NOT mean "infinite bonus": the EM curves are
 * `scale * EM / (EM + softCap)`, whose limit is `scale`, but IEEE-754
 * evaluates `Infinity / Infinity` as NaN. Treating it as 0 keeps the whole
 * non-finite class on one rule rather than special-casing the limit.
 */
export function sanitizeElementalMastery(elementalMastery: number): number {
  return Number.isFinite(elementalMastery) ? elementalMastery : 0;
}
