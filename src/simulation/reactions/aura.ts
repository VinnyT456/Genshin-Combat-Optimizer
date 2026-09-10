import {
  AURA_DURATION_INTERCEPT,
  AURA_DURATION_SLOPE,
  AURA_TAX,
} from "@/simulation/reactions/constants";
import {
  sanitizeGauge,
  sanitizeTime,
} from "@/simulation/reactions/finiteness";
import type {
  Aura,
  AuraDrain,
  AuraElement,
  AuraState,
  CompoundAura,
} from "@/simulation/reactions/types";
import { AURA_ELEMENTS } from "@/simulation/reactions/types";

// ============================================================================
// Aura gauge model.
//
// Decay is a PURE FUNCTION of elapsed simulation time. There is no clock, no
// timer and no scheduled expiry event: `gaugeAt(aura, t)` can be evaluated for
// any t, in any order, any number of times, and always yields the same answer.
// That is what makes the whole reaction layer replayable and the optimizer's
// search stable.
//
// Model (verified: Genshin Impact Wiki, Elemental Gauge Theory):
//
//   baseDuration(x) = 2.5x + 7                 x = gauge of the ATTACK
//   initialGauge    = 0.8x                     ("Aura Tax")
//   gauge(t)        = 0.8x * (1 - t/baseDuration(x))
//   decayRate(x)    = baseDuration(x) / initialGauge   [seconds per GU]
//
// We store `decayRate` rather than a duration because decay rate is INHERITED
// across same-element refreshes and partial reactions, while the gauge is not.
// With the rate stored, decay is simply linear:
//
//   gauge(t) = gauge(since) - (t - since) / decayRate
// ============================================================================

/** Aura base duration in seconds for an attack of `attackGauge` GU. */
export function auraBaseDuration(attackGauge: number): number {
  return AURA_DURATION_SLOPE * attackGauge + AURA_DURATION_INTERCEPT;
}

/**
 * Seconds required to decay 1 GU, for an aura created by `attackGauge` GU.
 *
 *   D(x) = (2.5x + 7) / (0.8x) = 35/(4x) + 25/8
 *
 * Reproduces the published table: D(1)=11.875, D(1.5)=8.9583, D(2)=7.5,
 * D(4)=5.3125, D(8)=4.21875.
 */
export function auraDecayRate(attackGauge: number): number {
  // A non-finite or non-positive gauge creates no aura at all (see
  // `finiteness.ts`), so no rate is meaningful. +Infinity is returned as the
  // "never decays" sentinel; `createAura` is guarded so it can never reach
  // stored state. Guarding finiteness here too keeps `Infinity / Infinity`
  // from producing NaN for direct callers.
  const safe = sanitizeGauge(attackGauge);
  if (safe <= 0) return Number.POSITIVE_INFINITY;
  return auraBaseDuration(safe) / (AURA_TAX * safe);
}

/** Gauge an attack of `attackGauge` GU leaves as an aura, after Aura Tax. */
export function taxedGauge(attackGauge: number): number {
  return AURA_TAX * attackGauge;
}

/**
 * Gauge of `aura` at absolute time `time`, clamped at 0.
 *
 * Querying a time BEFORE `aura.since` returns the stored gauge rather than
 * extrapolating backwards — the engine never rewinds, and silently inventing
 * gauge for a past time would be worse than being conservative.
 */
/**
 * Extra drains on an aura, as a stable array.
 *
 * ABSENT rather than `[]` is the canonical "no drains" representation. This
 * mirrors the existing `reactionBonus` ruling (ROADMAP A1): materialising an
 * empty collection breaks fold-identity and, more importantly here, `{}`/`[]`
 * and absent hash DIFFERENTLY, which would split optimizer memo entries for
 * zero information. Every writer below therefore omits the key when empty.
 */
export function auraDrains(aura: Aura | CompoundAura): readonly AuraDrain[] {
  return aura.drains ?? [];
}

/**
 * Total gauge consumed per second: natural decay plus every extra drain.
 *
 *   totalRate = 1/decayRate + sum(drain.ratePerSecond)
 *
 * `decayRate` is SECONDS PER GU, so its contribution is the reciprocal; drains
 * are already GU PER SECOND. Keeping the two in different units is deliberate
 * (see `AuraDrain`) — it makes an accidental addition a dimension error rather
 * than a silent 1/x bug.
 *
 * `decayRate === +Infinity` (the "never decays" sentinel) contributes 0, so an
 * aura with only drains still drains correctly.
 */
export function totalConsumptionPerSecond(aura: Aura | CompoundAura): number {
  const natural = Number.isFinite(aura.decayRate) ? 1 / aura.decayRate : 0;
  let extra = 0;
  for (const drain of auraDrains(aura)) {
    // Non-finite / negative drains are treated as absent, per `finiteness.ts`.
    if (Number.isFinite(drain.ratePerSecond) && drain.ratePerSecond > 0) {
      extra += drain.ratePerSecond;
    }
  }
  return natural + extra;
}

/**
 * Seconds until this aura's gauge reaches exactly 0, measured from `since`.
 *
 * `+Infinity` when nothing consumes it. This is the "seconds of aura
 * remaining" quantity that tick bookkeeping (e.g. Electro-Charged) needs, and
 * it is DERIVED — no second aura model is stored to obtain it.
 */
export function secondsUntilEmpty(aura: Aura | CompoundAura): number {
  if (!Number.isFinite(aura.gauge) || aura.gauge <= 0) return 0;
  const rate = totalConsumptionPerSecond(aura);
  if (!(rate > 0)) return Number.POSITIVE_INFINITY;
  return aura.gauge / rate;
}

/** Absolute simulation time at which this aura empties. */
export function timeWhenEmpty(aura: Aura | CompoundAura): number {
  return aura.since + secondsUntilEmpty(aura);
}

/**
 * Deterministic drain ordering: by `source`, then `ratePerSecond`.
 *
 * Sorted rather than append-ordered so that attaching the same set of drains
 * in a different order yields a STRUCTURALLY IDENTICAL aura. Without this,
 * `totalConsumptionPerSecond` would sum in insertion order — and floating-point
 * addition is not associative, so two states that are equal in the reals could
 * decay to different bits. That would defeat the optimizer's memo and break the
 * order-sensitive comparison in `drainsEquivalent`.
 *
 * Locale-independent comparison (`<`/`>`, never `localeCompare`), because
 * determinism must not depend on the host's locale.
 */
function sortDrains(drains: readonly AuraDrain[]): AuraDrain[] {
  return [...drains].sort((a, b) => {
    if (a.source !== b.source) return a.source < b.source ? -1 : 1;
    return a.ratePerSecond - b.ratePerSecond;
  });
}

/**
 * Normalise a drain list into the canonical stored form.
 *
 * Returns `undefined` for "no drains" so the key is OMITTED rather than set to
 * `[]` — the same fold-identity / hash-stability ruling as `auraDrains()`.
 */
function normalizeDrains(
  drains: readonly AuraDrain[],
): readonly AuraDrain[] | undefined {
  return drains.length === 0 ? undefined : sortDrains(drains);
}

/**
 * Attach (or replace) one extra consumption source on an aura.
 *
 * RE-ANCHORS FIRST. The stored gauge is recomputed at `time` under the OLD
 * rate before the new drain is applied, so the drain takes effect from `time`
 * onward and never retroactively rewrites gauge already decayed under the
 * previous rate. Getting this wrong would make decay depend on when the
 * scheduler happened to call, which is precisely the non-determinism this
 * layer exists to prevent.
 *
 * Keyed on `source`: attaching the same source twice REPLACES rather than
 * stacks, so a scheduler that fires twice for one cause cannot double-drain.
 * A non-finite or non-positive rate removes the drain instead of storing a
 * value that `totalConsumptionPerSecond` would ignore anyway — absent and
 * ignored must not be two different states.
 */
export function withDrain(
  aura: Aura,
  source: string,
  ratePerSecond: number,
  time: number,
): Aura {
  const safeTime = sanitizeTime(time);
  const anchored = advance(aura, safeTime);
  const others = auraDrains(anchored).filter((drain) => drain.source !== source);
  const valid = Number.isFinite(ratePerSecond) && ratePerSecond > 0;
  const next = valid ? [...others, { source, ratePerSecond }] : others;
  const normalized = normalizeDrains(next);
  if (normalized) return { ...anchored, drains: normalized };
  // No drains left: OMIT the key rather than storing `[]` (see `auraDrains`).
  // Rebuilt field-by-field instead of destructuring-and-spreading so the
  // absence is explicit in the code and does not rely on an unused binding.
  return {
    element: anchored.element,
    gauge: anchored.gauge,
    since: anchored.since,
    decayRate: anchored.decayRate,
  };
}

/**
 * Remove one extra consumption source by `source`, re-anchoring at `time`.
 *
 * Removing an absent source is the IDENTITY (aside from the re-anchor), so a
 * scheduler may call this unconditionally when a reaction ends without first
 * checking whether the drain was ever attached.
 */
export function withoutDrain(aura: Aura, source: string, time: number): Aura {
  return withDrain(aura, source, 0, time);
}

export function gaugeAt(aura: Aura | CompoundAura, time: number): number {
  // Defence in depth: the entry guards in `createAura`/`refreshAura` mean a
  // stored gauge is always finite, but a state object could also arrive from a
  // deserialised snapshot. A non-finite stored gauge reads as 0 (fully
  // decayed) rather than being propagated, matching the "non-finite is
  // absent" rule in `finiteness.ts`.
  if (!Number.isFinite(aura.gauge)) return 0;
  const elapsed = time - aura.since;
  if (!(elapsed > 0)) return aura.gauge;
  // `decayRate === +Infinity` is the legitimate "never decays" sentinel for a
  // 0-gauge aura; NaN cannot be stored, but reads as fully decayed if it
  // arrives from outside.
  if (Number.isNaN(aura.decayRate)) return 0;
  // Linear in elapsed time, exactly as before. With no drains this reduces to
  // `gauge - elapsed / decayRate` bit-for-bit (a single multiply by the same
  // reciprocal is NOT used; see below), so the un-drained path is unchanged.
  const drains = auraDrains(aura);
  if (drains.length === 0) {
    return Math.max(0, aura.gauge - elapsed / aura.decayRate);
  }
  return Math.max(0, aura.gauge - elapsed * totalConsumptionPerSecond(aura));
}

/** Has this aura fully decayed by `time`? */
export function isExpired(aura: Aura | CompoundAura, time: number): boolean {
  return gaugeAt(aura, time) <= 0;
}

/** Re-anchor an aura's stored gauge to `time`. Pure; returns a new object. */
function advance(aura: Aura, time: number): Aura {
  return { ...aura, gauge: gaugeAt(aura, time), since: time };
}

function advanceCompound(aura: CompoundAura, time: number): CompoundAura {
  return { ...aura, gauge: gaugeAt(aura, time), since: time };
}

/**
 * Deterministic aura ordering. Auras are kept sorted by the fixed
 * `AURA_ELEMENTS` order so that two states holding the same auras are
 * structurally identical regardless of the order they were applied in — which
 * makes state comparison and snapshot tests exact.
 */
function auraOrder(element: AuraElement): number {
  return AURA_ELEMENTS.indexOf(element);
}

function sortAuras(auras: readonly Aura[]): Aura[] {
  return [...auras].sort((a, b) => auraOrder(a.element) - auraOrder(b.element));
}

/**
 * Advance an entire aura state to `time`, dropping anything that has decayed.
 *
 * Pure and idempotent at the same time: decaying to t and then to t again
 * changes nothing.
 *
 * COMPOSABLE ONLY WITHIN A STATED TOLERANCE. Decaying to t1 then t2 equals
 * decaying straight to t2 in the REALS, but not in IEEE-754: re-anchoring
 * performs two subtractions where one would do, so the gauge can differ by a
 * few ULP. This is the documented, accepted behaviour — re-anchoring is the
 * canonical path and cannot be avoided (see `auraTolerance.ts` for why storing
 * a pristine origin does not work, and for the measured bound).
 *
 * Callers comparing a resumed state against a straight-through one MUST use
 * `auraStatesEquivalent()`, never `===` / `toEqual`.
 */
export function decayAuraState(state: AuraState, time: number): AuraState {
  const auras = state.auras
    .filter((aura) => !isExpired(aura, time))
    .map((aura) => advance(aura, time));
  const compound = state.compound
    .filter((aura) => !isExpired(aura, time))
    .map((aura) => advanceCompound(aura, time));
  return { auras: sortAuras(auras), compound };
}

/** Read one element's live aura at `time`, or undefined if none/expired. */
export function findAura(
  state: AuraState,
  element: AuraElement,
  time: number,
): Aura | undefined {
  const aura = state.auras.find((candidate) => candidate.element === element);
  if (!aura) return undefined;
  return isExpired(aura, time) ? undefined : advance(aura, time);
}

/** Create the aura an attack of `attackGauge` GU would leave at `time`. */
export function createAura(
  element: AuraElement,
  attackGauge: number,
  time: number,
): Aura {
  // ENTRY GUARD: non-finite gauge/time are sanitised BEFORE anything is
  // stored, so no unserialisable value can ever enter aura state. A gauge that
  // sanitises to 0 yields a 0-gauge, +Infinity-rate aura which `isExpired`
  // reports as expired immediately, so it is dropped by `decayAuraState`.
  const safeGauge = sanitizeGauge(attackGauge);
  const safeTime = sanitizeTime(time);
  return {
    element,
    gauge: taxedGauge(safeGauge),
    since: safeTime,
    decayRate: auraDecayRate(safeGauge),
  };
}

/**
 * Refresh an existing aura with a new application of the SAME element.
 *
 * Non-Pyro rule (verified: Elemental Gauge Theory, "Decay Rate Inheritance"):
 *   gauge   = max(existing gauge, taxed new gauge)
 *   decay   = INHERITED from the existing aura
 * so applying a strong aura onto a weak one keeps the weak one's slower decay
 * and therefore lasts longer.
 *
 * Pyro is an explicit EXCEPTION (same source, "Pyro"): Pyro does NOT inherit
 * decay rate. A stronger new Pyro application replaces the aura outright,
 * including its decay rate; a weaker one leaves the existing aura untouched.
 *
 * This asymmetry is real game behaviour, not a special case for a character.
 */
export function refreshAura(
  existing: Aura,
  attackGauge: number,
  time: number,
): Aura {
  // ENTRY GUARD (see `finiteness.ts`): sanitise before any stored field is
  // derived from these inputs.
  const safeGauge = sanitizeGauge(attackGauge);
  const safeTime = sanitizeTime(time);
  const current = gaugeAt(existing, safeTime);
  const incoming = taxedGauge(safeGauge);

  if (existing.element === "pyro") {
    // Pyro: replace wholesale (new decay rate) only if strictly stronger.
    if (incoming > current) return createAura("pyro", safeGauge, safeTime);
    return { ...existing, gauge: current, since: safeTime };
  }

  return {
    element: existing.element,
    gauge: Math.max(current, incoming),
    since: safeTime,
    // Decay rate inheritance: the ORIGINAL rate is kept.
    decayRate: existing.decayRate,
  };
}

/**
 * Replace (or insert) one element's aura, keeping the deterministic ordering.
 * Passing `undefined` removes the element's aura.
 */
export function withAura(
  state: AuraState,
  element: AuraElement,
  aura: Aura | undefined,
): AuraState {
  const others = state.auras.filter((candidate) => candidate.element !== element);
  const next = aura ? [...others, aura] : others;
  return { auras: sortAuras(next), compound: state.compound };
}

/**
 * Reduce an element's aura by `consumed` GU, removing it if it hits 0.
 * `time` must already be the reaction time.
 */
export function consumeAura(
  state: AuraState,
  element: AuraElement,
  consumed: number,
  time: number,
): AuraState {
  // ENTRY GUARD: a non-finite `consumed` would otherwise store NaN/-Infinity
  // as the remaining gauge. A non-finite consumption reads as 0 GU consumed
  // (the identity), leaving the aura untouched rather than corrupting it.
  const safeTime = sanitizeTime(time);
  const safeConsumed = Number.isFinite(consumed) ? consumed : 0;
  const aura = findAura(state, element, safeTime);
  if (!aura) return state;
  const remaining = aura.gauge - safeConsumed;
  if (remaining <= 0) return withAura(state, element, undefined);
  // Decay rate is INHERITED when a reaction only partially consumes an aura
  // (verified: Elemental Gauge Theory, "Decay Rate Inheritance").
  return withAura(state, element, {
    ...aura,
    gauge: remaining,
    since: safeTime,
  });
}
