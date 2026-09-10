import type { Aura, AuraState, CompoundAura } from "@/simulation/reactions/types";

// ============================================================================
// AURA DECAY PATH-INDEPENDENCE — the STATED TOLERANCE.
//
// RULING (mechanics-engineer, TASK #023): aura decay is composable within a
// stated RELATIVE tolerance. Step-wise re-anchoring is the CANONICAL path;
// single-step decay from a pristine origin is NOT available as an alternative,
// so this is a tolerance to be honoured, not a defect to be engineered away.
//
// ---------------------------------------------------------------------------
// Why re-anchoring is canonical, and why "store the origin" does not work
// ---------------------------------------------------------------------------
//
// An `Aura` is `{ gauge, since, decayRate }` and decays linearly:
//
//     gaugeAt(a, t) = a.gauge - (t - a.since) / a.decayRate
//
// It is tempting to say "store the ORIGINAL (gauge, since) and always evaluate
// in one step, then the problem disappears". It does not, because a pristine
// origin does not survive the mechanics:
//
//   1. `refreshAura()` — a same-element re-application takes
//      `max(currentGauge, taxedNewGauge)` and (for non-Pyro) INHERITS the old
//      decay rate. The result is not expressible as "the original aura
//      evaluated at t": the `max` is a genuinely new origin.
//   2. `consumeAura()` — a partial reaction subtracts consumed gauge and again
//      inherits the decay rate. Also a new origin.
//   3. Pyro's replace-if-stronger rule changes `decayRate` itself.
//
// So the origin is REDEFINED by ordinary gameplay, several times per rotation.
// A "single-step from origin" model would have to store the whole application
// history and replay it — which is the step-wise path with extra storage and
// exactly the same floating-point arithmetic. There is no path that avoids the
// repeated subtraction; there is only a choice about where it happens.
//
// Given that, `applyElement()` re-anchors on EVERY hit (it calls
// `decayAuraState(state, time)` first). The step boundaries are therefore the
// HIT TIMES, which are a property of the rotation, not of the search. This is
// the important consequence for the optimizer:
//
//   A checkpoint taken BETWEEN hits and resumed from introduces NO extra
//   re-anchor, because `decayAuraState(s, t)` at a time with no hit produces
//   the same step sequence that a straight-through run would have produced,
//   PLUS one additional re-anchor at the checkpoint time.
//
// That one extra re-anchor is the entire source of the divergence. It costs at
// most one rounding per aura per checkpoint.
//
// ---------------------------------------------------------------------------
// The measured bound
// ---------------------------------------------------------------------------
//
// Each re-anchor replaces one subtraction with two, so it can introduce at most
// ~1 ULP of relative error in the stored gauge. Errors from successive
// re-anchors do not systematically reinforce (the operands change sign-lessly
// but the rounding direction is not correlated), so the accumulated error grows
// far slower than linearly in practice.
//
// Measured on the real math (4U hydro aura, decayRate = 5.3125 s/GU):
//   -  1 extra re-anchor  ->  2.2e-16 absolute  (~1 ULP)
//   - 12 re-anchors       ->  8.9e-16 absolute  (~2.5 ULP)
//   - 2000 re-anchors     ->  6.9e-14 RELATIVE, worst case over the whole decay
//
// The 2000-re-anchor figure is pathological (a re-anchor every 5ms for the full
// aura lifetime); a realistic rotation re-anchors tens of times. The tolerance
// below is set at 1e-9 relative, which is ~4 orders of magnitude above the
// pathological measurement and ~7 above the realistic one. It is a CEILING
// chosen to be obviously safe, not a number fitted to make a test pass: if a
// future change pushes real drift anywhere near it, that indicates a genuine
// algorithmic problem (e.g. catastrophic cancellation), not accumulated noise.
//
// ---------------------------------------------------------------------------
// Does the bound still hold under COUPLED decay (`Aura.drains`)?
// ---------------------------------------------------------------------------
//
// YES, and the reason is structural rather than empirical. Adding drains
// changed the RATE but not the SHAPE of the decay:
//
//     gaugeAt(a, t) = a.gauge - (t - a.since) * totalConsumptionPerSecond(a)
//
// is still AFFINE in elapsed time, so the whole argument above — that the only
// error source is re-anchoring turning one subtraction into two — is unchanged.
// Two properties keep it that way, and both are load-bearing:
//
//   1. `totalConsumptionPerSecond(a)` depends ONLY on fields that re-anchoring
//      copies verbatim (`decayRate`, `drains`). It is therefore bit-identical
//      before and after a re-anchor, so the two paths differ by the rounding of
//      the gauge subtraction alone — exactly the ~1 ULP already measured. If a
//      drain rate were ever made a function of elapsed time or of the CURRENT
//      gauge, decay would stop being affine and this entire bound would be void.
//   2. Summation order is fixed (`drains` is an ordered list, compared
//      order-sensitively by `drainsEquivalent`), so the sum itself is
//      deterministic rather than merely equal-in-the-reals.
//
// A larger total rate does NOT loosen the bound: the tolerance is RELATIVE, and
// a faster-draining aura reaches a given gauge in less elapsed time, so the
// operands of the subtraction stay the same order of magnitude. What a faster
// rate does change is that the aura reaches 0 sooner, and `gaugeAt` clamps at
// 0 — and 0 compares exactly equal, tolerance untouched.
//
// ---------------------------------------------------------------------------
// Contract for consumers (qa, optimizer, combat)
// ---------------------------------------------------------------------------
//
//  * DO NOT assert exact equality (`toBe`, `toEqual`, `===`, structural hash)
//    between an aura state produced by resume-from-checkpoint and one produced
//    by simulate-from-zero. That equality CANNOT hold and pinning it would
//    create a test that fails on an unrelated, correct change.
//  * DO assert equality with `auraStatesEquivalent()` / `gaugesEquivalent()`.
//  * `decayRate`, `since` and `element` ARE exact — only `gauge` is subject to
//    this tolerance. `since` is assigned, never computed; `decayRate` is
//    inherited by reference-value copy, never recomputed. Tests may and should
//    pin those exactly.
//  * DETERMINISM IS UNAFFECTED. The same input sequence always produces a
//    bit-identical result. This tolerance is about two DIFFERENT input
//    sequences (checkpointed vs not) that are mathematically equivalent, not
//    about the same sequence being unstable.
//  * Optimizer memo-hashing of aura state MUST quantize the gauge (see
//    `quantizeGauge`) before hashing, or two equivalent states will hash apart
//    and defeat the memo.
//
// ---------------------------------------------------------------------------
// Relation to the engine's `EPSILON` — why this is a SEPARATE constant
// ---------------------------------------------------------------------------
//
// `src/simulation/engine/constants.ts` exports `EPSILON = 1e-9` as "floating
// point slack for time / energy comparisons". This module defines its own
// constant with the SAME MAGNITUDE rather than importing that one, for two
// reasons — both structural, not stylistic:
//
//   1. LAYERING. `docs/ARCHITECTURE.md` puts Mechanics strictly BELOW the
//      Combat Engine, and lower layers never import higher ones. Mechanics
//      currently has zero imports from `simulation/engine`; importing `EPSILON`
//      would make this file the first and only inversion, for a scalar.
//   2. DIFFERENT QUANTITY, DIFFERENT KIND. `EPSILON` is an ABSOLUTE slack on
//      SECONDS and ENERGY. This is a RELATIVE tolerance on GAUGE UNITS. They
//      answer different questions and should be free to diverge: if the engine
//      ever retunes its time slack, aura gauge comparison must not silently
//      move with it.
//
// The magnitudes are deliberately kept equal so there is no surprising
// asymmetry, and this comment is the cross-reference that keeps them honest.
// If a future refactor introduces a shared, layer-neutral numerics module,
// BOTH should move there — that is the correct de-duplication, not an upward
// import from here.
// ============================================================================

/**
 * Relative tolerance for comparing two aura GAUGE values that were produced by
 * mathematically equivalent but differently-stepped decay paths.
 *
 * Same magnitude as the engine's `EPSILON`, deliberately not imported from it —
 * see the layering rationale above.
 */
export const AURA_GAUGE_RELATIVE_TOLERANCE = 1e-9;

/**
 * Number of decimal places at which two path-equivalent gauges are guaranteed
 * to agree. Provided for test helpers that take a precision (e.g. vitest's
 * `toBeCloseTo`) rather than a tolerance.
 *
 * Kept consistent with the tolerance rather than independently chosen:
 * `1e-9` relative on a gauge bounded by ~2 GU is comfortably inside 9 dp.
 */
export const AURA_GAUGE_DECIMAL_PLACES = 9;

/**
 * Are two gauge values equal within the stated path-independence tolerance?
 *
 * Relative comparison, scaled by the larger magnitude, with an absolute floor
 * so that values decaying towards zero compare sensibly (a relative test alone
 * would be infinitely strict at 0).
 */
export function gaugesEquivalent(a: number, b: number): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= AURA_GAUGE_RELATIVE_TOLERANCE * scale;
}

/**
 * Are two drain lists identical?
 *
 * EXACT on both `source` and `ratePerSecond`, and ORDER-SENSITIVE. Drains are
 * assigned data, never computed by decay, so no tolerance applies — the same
 * reasoning that makes `since` and `decayRate` exact. Order is significant
 * because it is the only thing keeping `totalConsumptionPerSecond`'s summation
 * deterministic: floating-point addition is not associative, so two lists with
 * the same members in a different order can sum to different bits, and a state
 * that hashed equal here but decayed differently would be worse than one that
 * simply reports unequal.
 *
 * Absent and `[]` compare EQUAL (both mean "no drains"), even though only
 * absent may be stored — see `auraDrains()`. A deserialised snapshot that
 * materialised `[]` must not read as a different state.
 */
function drainsEquivalent(a: Aura | CompoundAura, b: Aura | CompoundAura): boolean {
  const da = a.drains ?? [];
  const db = b.drains ?? [];
  if (da.length !== db.length) return false;
  for (let i = 0; i < da.length; i++) {
    const x = da[i]!;
    const y = db[i]!;
    if (x.source !== y.source) return false;
    if (x.ratePerSecond !== y.ratePerSecond) return false;
  }
  return true;
}

/**
 * Fields shared by `Aura` and `CompoundAura`. `since`, `decayRate` and
 * `drains` must match EXACTLY (they are copied, never recomputed); only
 * `gauge` is toleranced.
 *
 * WHY `drains` IS COMPARED AT ALL: without it, two auras decaying at
 * measurably different total rates could compare equivalent purely because
 * they happened to be re-anchored at the same instant with the same gauge.
 * That would make `auraStatesEquivalent` unsound for exactly the resume-from-
 * snapshot case it exists to validate — the states would diverge on the very
 * next query.
 */
function decayFieldsEquivalent(a: Aura | CompoundAura, b: Aura | CompoundAura): boolean {
  if (a.since !== b.since) return false;
  if (a.decayRate !== b.decayRate) return false;
  if (!drainsEquivalent(a, b)) return false;
  return gaugesEquivalent(a.gauge, b.gauge);
}

/** Are two elemental auras equivalent? `element` must match exactly. */
export function aurasEquivalent(a: Aura, b: Aura): boolean {
  if (a.element !== b.element) return false;
  return decayFieldsEquivalent(a, b);
}

/** Are two compound auras equivalent? `kind` must match exactly. */
export function compoundAurasEquivalent(a: CompoundAura, b: CompoundAura): boolean {
  if (a.kind !== b.kind) return false;
  return decayFieldsEquivalent(a, b);
}

/**
 * Are two whole aura states equivalent within the stated tolerance?
 *
 * Order-sensitive by design: `decayAuraState` sorts by the fixed
 * `AURA_ELEMENTS` order, so two equivalent states must already agree on order.
 * A mismatch in order is a real defect, not a tolerance question.
 */
export function auraStatesEquivalent(a: AuraState, b: AuraState): boolean {
  if (a.auras.length !== b.auras.length) return false;
  if (a.compound.length !== b.compound.length) return false;
  for (let i = 0; i < a.auras.length; i++) {
    if (!aurasEquivalent(a.auras[i]!, b.auras[i]!)) return false;
  }
  for (let i = 0; i < a.compound.length; i++) {
    if (!compoundAurasEquivalent(a.compound[i]!, b.compound[i]!)) return false;
  }
  return true;
}

/**
 * Quantize a gauge to the tolerance grid so equivalent states hash identically.
 *
 * For optimizer memoisation ONLY. Never feed the result back into the decay
 * math — quantizing inside the model would turn a bounded rounding error into a
 * systematic bias.
 */
export function quantizeGauge(gauge: number): number {
  if (!Number.isFinite(gauge)) return gauge;
  const grid = 10 ** AURA_GAUGE_DECIMAL_PLACES;
  // `+ 0` normalizes -0 to 0 so two equivalent states cannot hash apart on sign.
  return Math.round(gauge * grid) / grid + 0;
}
