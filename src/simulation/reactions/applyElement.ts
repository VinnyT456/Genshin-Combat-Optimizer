import type { Element } from "@/types";
import {
  consumeAura,
  createAura,
  decayAuraState,
  findAura,
  refreshAura,
  withAura,
} from "@/simulation/reactions/aura";
import { sanitizeGauge, sanitizeTime } from "@/simulation/reactions/finiteness";
import {
  appliesAura,
  lookupReaction,
} from "@/simulation/reactions/reactionTable";
import type {
  AuraElement,
  AuraState,
  ReactionResult,
} from "@/simulation/reactions/types";
import { AURA_ELEMENTS, isAuraElement } from "@/simulation/reactions/types";

// ============================================================================
// applyElement — the Element -> Aura -> Reaction resolver.
//
// One entry point answers the engine's question: "a <element> hit of <gauge>GU
// landed at <time>; what happened?"
//
// It is a PURE function of (state, element, gauge, time). No clock, no RNG, no
// mutation, no character knowledge. Identical inputs give a byte-identical
// result, which is what lets the optimizer replay and memoise safely.
//
// Order of operations, which is itself part of the contract:
//   1. Decay the existing state to `time`.
//   2. If the hit applies 0U, stop — 0U attacks cannot react or apply an aura
//      (verified: Elemental Gauge Theory, "0U Elemental Attacks").
//   3. Resolve reactions against EVERY live aura, in a fixed element order.
//   4. Consume aura gauge per reaction coefficient.
//   5. Apply/refresh the trigger's own aura if it survived and its element can
//      leave one.
// ============================================================================

export interface ApplyElementResult {
  /** Aura state after the application. */
  state: AuraState;
  /**
   * Reactions produced, in deterministic order. Usually 0 or 1; a hit on an
   * Electro-Charged target can genuinely produce 2 (e.g. Pyro triggering both
   * vaporize and overloaded), which is why this is a list.
   */
  reactions: readonly ReactionResult[];
}

/**
 * Reactions that CONSUME the triggering element, preventing it from leaving
 * its own aura afterwards.
 *
 * Verified: Elemental Gauge Theory — an elemental attack applies its aura "if
 * it hits an enemy WITHOUT triggering an Elemental Reaction (except
 * Electro-Charged, Burning, Aggravate, and Spread)". The listed exceptions do
 * still leave/keep the trigger's aura, which is exactly why Electro-Charged
 * has both Hydro and Electro on the target simultaneously.
 */
const REACTIONS_THAT_KEEP_TRIGGER_AURA: ReadonlySet<string> = new Set([
  "electroCharged",
  "burning",
  "aggravate",
  "spread",
]);

/**
 * Reactions that do NOT consume the existing aura on contact.
 *
 * Electro-Charged is the important case: Hydro and Electro "exist
 * simultaneously as an aura during the reaction regardless of the element that
 * acted initially as the aura or trigger", and consumption happens per TICK
 * (0.4U from each gauge), not at the moment the reaction is triggered
 * (verified: Elemental Gauge Theory, "Electro-Charged").
 *
 * Consuming on contact here would delete the Hydro aura instantly and make
 * Electro-Charged a one-shot reaction, which is wrong in a way that quietly
 * suppresses every later Hydro reaction on the target.
 *
 * Burning behaves the same way: the Dendro aura is drained per second while
 * Burning is active, not consumed by the Pyro application.
 *
 * The per-tick drain itself is NOT yet scheduled — see `unverified.ts`
 * (`electro-charged-ticks`, `burning-ticks`): the tick INTERVAL could not be
 * cross-verified, so the drain is left unmodelled rather than guessed. The
 * consequence is that these two auras currently persist longer than in game.
 */
const REACTIONS_THAT_DO_NOT_CONSUME_ON_CONTACT: ReadonlySet<string> = new Set([
  "electroCharged",
  "burning",
]);

/**
 * Apply `gauge` GU of `element` to `state` at `time`.
 *
 * `gauge` is the ability's gauge for THIS hit; the caller is responsible for
 * having already decided (via ICD) that this hit applies at all. Separating
 * those two concerns keeps ICD out of the aura model entirely.
 */
export function applyElement(
  state: AuraState,
  element: Element,
  gauge: number,
  time: number,
): ApplyElementResult {
  // ENTRY GUARD (see `finiteness.ts`): a non-finite gauge or time is treated
  // as absent, so it can never reach stored aura state. This is the SAME rule
  // that already made negative and NaN gauges behave as 0U; +Infinity was the
  // only member of the class that leaked.
  const safeTime = sanitizeTime(time);
  const safeGauge = sanitizeGauge(gauge);
  const decayed = decayAuraState(state, safeTime);

  // 0U attacks (and non-elemental hits) change nothing.
  if (safeGauge <= 0 || element === "physical") {
    return { state: decayed, reactions: [] };
  }

  const reactions: ReactionResult[] = [];
  let next = decayed;

  // Iterate auras in the fixed AURA_ELEMENTS order rather than in state order,
  // so the reaction list is deterministic regardless of application history.
  for (const auraElement of AURA_ELEMENTS) {
    if (auraElement === element) continue;

    const aura = findAura(next, auraElement, safeTime);
    if (!aura) continue;

    const rule = lookupReaction(element, auraElement);
    if (!rule) continue;

    const consumesOnContact = !REACTIONS_THAT_DO_NOT_CONSUME_ON_CONTACT.has(
      rule.kind,
    );
    const consumed = consumesOnContact
      ? Math.min(aura.gauge, rule.coefficient * safeGauge)
      : 0;

    reactions.push({
      kind: rule.kind,
      category: rule.category,
      triggerElement: element,
      auraElement,
      gaugeConsumed: consumed,
      ...(rule.direction ? { direction: rule.direction } : {}),
      ...(rule.kind === "swirl" ? { swirledElement: auraElement } : {}),
    });

    if (consumed > 0) {
      next = consumeAura(next, auraElement, consumed, safeTime);
    }
  }

  // Anemo/Geo never leave an aura of their own.
  if (!appliesAura(element) || !isAuraElement(element)) {
    return { state: next, reactions };
  }

  const keepsAura =
    reactions.length === 0 ||
    reactions.every((reaction) =>
      REACTIONS_THAT_KEEP_TRIGGER_AURA.has(reaction.kind),
    );

  if (!keepsAura) {
    return { state: next, reactions };
  }

  const trigger: AuraElement = element;
  const existing = findAura(next, trigger, safeTime);
  const aura = existing
    ? refreshAura(existing, safeGauge, safeTime)
    : createAura(trigger, safeGauge, safeTime);

  return { state: withAura(next, trigger, aura), reactions };
}
