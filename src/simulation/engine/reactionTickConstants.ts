// ============================================================================
// Timing constants for the reaction tick scheduler.
//
// These are ENGINE-side scheduling numbers, kept here rather than in
// `simulation/reactions/constants.ts` because that file is the mechanics
// layer's and this layer must not edit it. The GAUGE amounts a tick consumes
// stay in mechanics (`ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK`) and are imported,
// not restated.
//
// SOURCE for both values below, quoted through the mechanics layer's own gap
// register (`src/simulation/reactions/unverified.ts`, `electro-charged-ticks`),
// which cites the KQM Theorycrafting Library:
//   [K1] evidence vault, "Electro-Charged"
//   [K6] combat-mechanics/elemental-effects/elemental-gauge-theory
//
// WHAT IS DELIBERATELY ABSENT: Burning. The mechanics layer records that KQM
// RETIRED the pre-3.0 summed-decay-rate claim into a collapsed "Pre-3.0
// Findings" block and published NO replacement, so no Burning drain is
// attached anywhere and no Burning tick interval is defined here. Inventing a
// coefficient to "complete" the scheduler would be exactly the failure this
// project's source rules exist to prevent: a plausible, structurally valid,
// sourced-looking, wrong number. Electro-Charged is fully specified today and
// is scheduled; Burning is not and is not.
// ============================================================================

/**
 * Seconds between consecutive Electro-Charged damage ticks on one target.
 *
 * Verified [K1 "Electro-Charged"]: EC "has a CD of 1 second and can damage a
 * given enemy only once per second", with a cited 120fps clip showing ticks
 * exactly 60 frames apart.
 *
 * NOTE this is SAME-TARGET spacing. It is not a claim about how EC's chain to
 * adjacent enemies is timed — [K1] states that chain "simply applies the
 * Electro damage. It will not apply auras" — and the engine is single-target
 * regardless, so no secondary-target cadence is modelled.
 */
export const ELECTRO_CHARGED_TICK_INTERVAL_SECONDS = 1;

/**
 * Minimum seconds that must remain between the last tick and a gauge emptying
 * for the early ("premature") tick to happen at all.
 *
 * Verified [K6 "Electro-Charged"]: "When either the Electro or Hydro gauge
 * completely decays, the next Electro-Charged tick will prematurely occur at
 * the moment when the gauge is completely decayed. However, if one of the
 * gauges empties within 0.5s of the last Electro-Charged tick, there will not
 * be another tick."
 *
 * Corroborated independently by [K1 "Gauge Decay Rates of Hydro and Electro
 * Auras"], whose clip ends with the Electro aura persisting 0.53s after the
 * Hydro empties with no further tick — consistent with this 0.5s clause.
 */
export const ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK = 0.5;
