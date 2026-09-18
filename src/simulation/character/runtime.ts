import type {
  ResourceDefinition,
  StateEffect,
} from "@/simulation/character/kit";

// ============================================================================
// Resource runtime — the extension seam for states / stacks / resources.
//
// The engine tracks resource VALUES generically. It never interprets what a
// resource means: a stack counter, a stance flag and an ammo pool are the same
// thing here (a clamped number with an optional expiry). Meaning is supplied by
// the mechanics layer, which reads these values through declarative buff
// conditions.
//
// Phase A scope: values are tracked and effects applied. What is deliberately
// NOT here is documented as a known gap rather than half-built.
// ============================================================================

/** Runtime value of one resource. Plain-data, JSON-serializable. */
export interface ResourceState {
  id: string;
  value: number;
  max: number;
  /** Clock at which the value was last changed; drives expiry. */
  lastChanged: number;
  /** Copied from the definition so expiry needs no definition lookup. */
  durationSeconds?: number;
}

/** All resources of one character, keyed by resource id. */
export type ResourceStates = Record<string, ResourceState>;

/** Initial runtime state for a character's declared resources. */
export function createResourceStates(
  definitions: readonly ResourceDefinition[],
  time = 0,
  startWithFullEnergy = false,
): ResourceStates {
  const states: ResourceStates = {};
  for (const def of definitions) {
    states[def.id] = {
      id: def.id,
      value: startWithFullEnergy && def.startAtMaxWithFullEnergy
        ? def.max
        : def.initial,
      max: def.max,
      lastChanged: time,
      ...(def.durationSeconds !== undefined
        ? { durationSeconds: def.durationSeconds }
        : {}),
    };
  }
  return states;
}

/**
 * Value of a resource at `time`, accounting for expiry.
 *
 * Expiry is evaluated lazily at read time rather than by a scheduled event:
 * there is no tick loop to drift, and the answer depends only on
 * (lastChanged, duration, time), so it is deterministic and order-independent.
 *
 * !! DUPLICATED BOUNDARY — KEEP IN SYNC !!
 * The `>=` below is the exclusive-end rule: a resource is ALREADY EXPIRED at
 * exactly `lastChanged + durationSeconds`, not still live for that instant.
 *
 * `src/simulation/buffs/getActiveBuffs.ts` RE-DERIVES this same rule for its
 * resource gate rather than importing it (mechanics must not depend upward on
 * the character module). The duplication is deliberate and layering-driven,
 * but it means CHANGING `>=` TO `>` HERE SILENTLY DIVERGES the two: buffs
 * would stay active for one boundary instant after the resource they read has
 * expired, with no error anywhere. If you touch this comparison, change it
 * there too and tell mechanics-engineer.
 */
export function resourceValueAt(
  state: ResourceState | undefined,
  time: number,
): number {
  if (state === undefined) return 0;
  if (
    state.durationSeconds !== undefined &&
    // Exclusive end — see the DUPLICATED BOUNDARY note above.
    time - state.lastChanged >= state.durationSeconds
  ) {
    return 0;
  }
  return state.value;
}

/**
 * Applies one declarative effect, returning the NEW state. Pure — callers
 * store the result, so an effect can be evaluated speculatively (the optimizer
 * needs this) without corrupting live state.
 *
 * Values clamp to [0, max]: over-gaining does not bank hidden stacks and
 * over-consuming does not go negative, both matching in-game behaviour.
 */
export function applyStateEffect(
  state: ResourceState,
  effect: StateEffect,
  time: number,
): ResourceState {
  const current = resourceValueAt(state, time);
  let next: number;
  switch (effect.kind) {
    case "gain":
      next = current + effect.amount;
      break;
    case "consume":
      next = current - effect.amount;
      break;
    case "set":
      next = effect.amount;
      break;
  }
  const clamped = Math.min(Math.max(next, 0), state.max);
  return { ...state, value: clamped, lastChanged: time };
}

/**
 * Applies a list of effects in order. Effects naming an unknown resource are
 * IGNORED rather than throwing — an unknown id is a data-authoring error that
 * a validator should catch, and a simulation must not crash on it.
 */
export function applyStateEffects(
  states: ResourceStates,
  effects: readonly StateEffect[],
  time: number,
): ResourceStates {
  let next = states;
  for (const effect of effects) {
    const target = next[effect.resourceId];
    if (target === undefined) continue;
    next = { ...next, [effect.resourceId]: applyStateEffect(target, effect, time) };
  }
  return next;
}
