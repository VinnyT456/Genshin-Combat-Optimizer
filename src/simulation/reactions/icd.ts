import {
  DEFAULT_ICD_HITS,
  DEFAULT_ICD_SECONDS,
} from "@/simulation/reactions/constants";
import type {
  IcdBehaviour,
  IcdConfig,
  IcdCounter,
  IcdState,
} from "@/simulation/reactions/types";

// ============================================================================
// Internal Cooldown (ICD).
//
// Verified (Genshin Impact Wiki, `Internal Cooldown`, corroborated by
// `Elemental Gauge Theory`):
//
//   "For most character abilities, the standard ICD is 2.5 seconds or 3 hits.
//    The ICD is reset either after 2.5 seconds have passed or after 3 hits of
//    the particular move are made.
//      * The first hit after the 3-hit sequence will apply an element, but does
//        NOT reset the 2.5 second timer.
//      * The first hit after the timer will apply an element, reset the timer,
//        and reset the hit sequence."
//
//   "ICD is counted separately for each attacker and each target."
//
// Those two bullets are subtly different and are the entire reason this is a
// (windowStart, hitsInWindow) counter and not a simple cooldown timestamp:
//
//   - Hits 1, 4, 7, ... within one 2.5s window apply (every 3rd hit), and none
//     of them restart the timer.
//   - The first hit AFTER the window expires applies AND starts a fresh window
//     with the counter reset.
//
// Deviations are DATA (`IcdBehaviour`), never code branches. Real examples
// from the same source: several abilities have NO ICD at all; Burning is 2s;
// thrusting charged attacks are 0.5s; some are 1s/3hits or 5s/5hits. This
// module never asks which ability it is looking at.
// ============================================================================

/** The 2.5s / 3-hit standard, as a config. */
export const STANDARD_ICD_CONFIG: IcdConfig = {
  intervalSeconds: DEFAULT_ICD_SECONDS,
  hits: DEFAULT_ICD_HITS,
};

/**
 * Resolve a behaviour to a concrete config, or `undefined` for "no ICD"
 * (every hit applies).
 */
export function resolveIcdConfig(
  behaviour: IcdBehaviour,
): IcdConfig | undefined {
  switch (behaviour.mode) {
    case "none":
      return undefined;
    case "standard":
      return STANDARD_ICD_CONFIG;
    case "custom":
      return behaviour.config;
  }
}

/**
 * Key identifying one ICD counter.
 *
 * ICD is per attacker AND per target AND per ability (or per shared ICD
 * group). `group` lets game data express abilities that SHARE one ICD — e.g.
 * the documented rule that most sword/claymore users share ICD between Normal
 * and Charged attacks — without this module knowing any character.
 */
export function icdKey(params: {
  attackerId: string;
  targetId: string;
  group: string;
}): string {
  // Fixed field order => deterministic keys, stable across runs.
  return `${params.attackerId}|${params.targetId}|${params.group}`;
}

/** Outcome of testing one hit against its ICD counter. */
export interface IcdDecision {
  /** Does this hit apply its element (and therefore possibly react)? */
  applies: boolean;
  /** Counter state to store after this hit. */
  counter: IcdCounter;
}

/**
 * Decide whether a hit at `time` applies its element, and produce the next
 * counter state. Pure — the caller owns storage.
 *
 * `previous === undefined` means the counter has never been started for this
 * (attacker, target, group): the first hit always applies.
 */
export function evaluateIcd(
  behaviour: IcdBehaviour,
  previous: IcdCounter | undefined,
  time: number,
): IcdDecision {
  const config = resolveIcdConfig(behaviour);

  // No ICD: every hit applies. The counter is still advanced so callers can
  // report hit counts uniformly, but it never gates anything.
  if (!config) {
    return {
      applies: true,
      counter: {
        windowStart: time,
        hitsInWindow: (previous?.hitsInWindow ?? 0) + 1,
      },
    };
  }

  // First hit ever for this key: applies and starts the window.
  if (!previous) {
    return { applies: true, counter: { windowStart: time, hitsInWindow: 1 } };
  }

  // Timer branch: the window has elapsed. This hit applies, resets the timer
  // AND resets the hit sequence.
  //
  // NEGATIVE ELAPSED (TASK #026, D2) — `time` is BEFORE `previous.windowStart`.
  // This is reachable from the resume-from-snapshot path: a `CharacterSnapshot`
  // can legitimately carry an ICD counter whose `windowStart` sits ahead of the
  // clock the caller resumes at. RULING: treat it as a FRESH WINDOW, i.e.
  // identical to `previous === undefined`.
  //
  // Deliberately NOT the same stance as `gaugeAt`, which returns the stored
  // gauge when queried before `aura.since`. That works there because gauge is
  // monotonically non-increasing, so the stored value is the CONSERVATIVE
  // answer — it never invents gauge. An ICD counter has no such monotone
  // reading, and carrying the stale counter forward is actively wrong in the
  // dangerous direction: `(hitsInWindow + 1 - 1) % hits !== 0` SUPPRESSES the
  // hit, silently deleting an elemental application that should have landed.
  // "Clamp elapsed to 0" would do exactly that, so it is not equivalent.
  //
  // A counter from the future carries no information about the window the
  // resumed clock is actually in, so the honest reading is "no counter yet",
  // which is also what makes resumption consistent: an unknown-window hit is
  // treated the same whether the counter is absent or unusable.
  const elapsed = time - previous.windowStart;
  if (elapsed < 0 || elapsed >= config.intervalSeconds) {
    return { applies: true, counter: { windowStart: time, hitsInWindow: 1 } };
  }

  // Hit-counter branch: still inside the window. Every `config.hits`-th hit
  // applies. Crucially this does NOT restart the timer — `windowStart` is
  // carried through unchanged, which is what makes the 1st/4th/7th pattern
  // fall out rather than needing to be special-cased.
  const hitsInWindow = previous.hitsInWindow + 1;
  const applies =
    config.hits > 0 ? (hitsInWindow - 1) % config.hits === 0 : true;
  return { applies, counter: { windowStart: previous.windowStart, hitsInWindow } };
}

/** Immutably store a counter back into an `IcdState`. */
export function withIcdCounter(
  state: IcdState,
  key: string,
  counter: IcdCounter,
): IcdState {
  return { ...state, [key]: counter };
}
