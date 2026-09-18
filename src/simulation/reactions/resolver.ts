import type { Element } from "@/types";
import { sanitizeTime } from "@/simulation/reactions/finiteness";
import { applyElement } from "@/simulation/reactions/applyElement";
import { evaluateIcd, icdKey, withIcdCounter } from "@/simulation/reactions/icd";
import {
  additiveBaseDamageBonus,
  amplifyingMultiplier,
  transformativeDamage,
  type AdditiveReactionKey,
  type TransformativeReactionKey,
} from "@/simulation/reactions/reactionDamage";
import { TRANSFORMATIVE_COEFFICIENTS } from "@/simulation/reactions/constants";
import type {
  AuraState,
  IcdBehaviour,
  IcdState,
  ReactionResult,
} from "@/simulation/reactions/types";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";

// ============================================================================
// The mechanics seam the combat engine calls.
//
// Engine says:    "a Pyro hit from character X, ability A, landed on target T
//                  at time t."
// Mechanics says: "it applied 2U, it vaporized (forward), multiply your damage
//                  instance by 2.31, and here is the new aura + ICD state."
//
// The engine never inspects auras, never knows what vaporize is, and never
// computes a coefficient. One call, one answer.
//
// Purity: `resolveElementalHit` is a pure function of its inputs. It returns
// NEW state objects and never mutates the ones it is given, so the caller can
// snapshot, replay or memoise freely.
// ============================================================================

/** One elemental hit, as the engine describes it. */
export interface ElementalHit {
  time: number;
  attackerId: string;
  targetId: string;
  /** ICD group — `abilityIcdGroup(ability)`. */
  icdGroup: string;
  element: Element;
  /** Gauge units this ability applies per applying hit. */
  gauge: number;
  icd: IcdBehaviour;
}

/** Combined aura + ICD state for one target. */
export interface ElementalState {
  aura: AuraState;
  icd: IcdState;
}

export const EMPTY_ELEMENTAL_STATE: ElementalState = {
  aura: EMPTY_AURA_STATE,
  icd: {},
};

export interface ResolvedHit {
  /** State after this hit. Always a new object. */
  state: ElementalState;
  /** False when ICD suppressed the elemental application. */
  applied: boolean;
  /** Reactions produced by this hit, in deterministic order. */
  reactions: readonly ReactionResult[];
}

/**
 * Resolve one elemental hit: ICD gate, then aura/reaction resolution.
 *
 * ICD is evaluated FIRST and independently of the aura state. A hit suppressed
 * by ICD applies 0U — it neither reacts nor refreshes an aura — which is the
 * whole point of the mechanic.
 */
export function resolveElementalHit(
  state: ElementalState,
  hit: ElementalHit,
): ResolvedHit {
  const key = icdKey({
    attackerId: hit.attackerId,
    targetId: hit.targetId,
    group: hit.icdGroup,
  });

  const time = sanitizeTime(hit.time);
  const decision = evaluateIcd(hit.icd, state.icd[key], time);
  const icd = withIcdCounter(state.icd, key, decision.counter);

  // Suppressed by ICD: aura still DECAYS to `time` (time passes regardless),
  // but nothing is applied and nothing reacts.
  const gauge = decision.applies ? hit.gauge : 0;
  const { state: aura, reactions } = applyElement(
    state.aura,
    hit.element,
    gauge,
    time,
  );

  return { state: { aura, icd }, applied: decision.applies, reactions };
}

// ---------------------------------------------------------------------------
// Turning reactions into damage-pipeline modifiers
// ---------------------------------------------------------------------------

/**
 * The three channels a reaction can affect, kept SEPARATE because each enters
 * the damage formula at a different point. Combining them into one number is
 * the failure mode this design exists to prevent.
 */
export interface ReactionModifiers {
  /**
   * Multiply the triggering instance's FINAL damage by this.
   * 1 when no amplifying reaction occurred.
   */
  amplifyingMultiplier: number;
  /**
   * ADD this to the triggering instance's BASE damage, inside the parenthesis,
   * before DMG%/DEF/RES/crit. 0 when no additive reaction occurred.
   */
  additiveBaseDamageBonus: number;
  /**
   * Separate damage instances to emit, one per transformative reaction.
   * These do NOT interact with the triggering instance's stats.
   */
  transformative: readonly TransformativeInstance[];
  /** Element carried by each Crystallize reaction, in reaction order. */
  crystallizeElements?: readonly Element[];
  /** Reaction kinds produced by this hit, including non-damaging reactions. */
  reactionKinds?: readonly string[];
}

export interface TransformativeInstance {
  kind: TransformativeReactionKey;
  /** Element whose RES applies to this instance. */
  resElement: Element;
  damage: number;
}

export const NO_REACTION_MODIFIERS: ReactionModifiers = {
  amplifyingMultiplier: 1,
  additiveBaseDamageBonus: 0,
  transformative: [],
};

/** Stats of the TRIGGERING character needed to price reactions. */
export interface ReactionStats {
  level: number;
  elementalMastery: number;
  /** Per-reaction DMG bonus fractions (e.g. `{ overloaded: 0.4 }`). */
  reactionBonus?: Readonly<Partial<Record<string, number>>>;
}

function isTransformativeKey(kind: string): kind is TransformativeReactionKey {
  return kind in TRANSFORMATIVE_COEFFICIENTS;
}

const ADDITIVE_KEYS: ReadonlySet<string> = new Set(["aggravate", "spread"]);

/**
 * Convert resolved reactions into pipeline modifiers.
 *
 * `resMultiplierFor` is supplied by the caller (the engine already owns RES and
 * shred); mechanics does not duplicate that math. For swirl the RES element is
 * the SWIRLED element, not anemo — handled here rather than by the caller.
 *
 * Multiple amplifying reactions on one hit cannot occur in game (an aura pair
 * yields at most one), but if they ever did the multipliers would compose
 * multiplicatively, which is what this does.
 */
export function toReactionModifiers(
  reactions: readonly ReactionResult[],
  stats: ReactionStats,
  resMultiplierFor: (element: Element) => number,
): ReactionModifiers {
  let amplifying = 1;
  let additive = 0;
  const transformative: TransformativeInstance[] = [];
  const crystallizeElements: Element[] = [];
  const reactionKinds: string[] = [];

  for (const reaction of reactions) {
    // Keep every reaction kind for event-driven mechanics. Frozen and
    // Quicken are neutral in the direct-damage channels, but they are still
    // real reactions and can trigger character resources (e.g. Skirk's Void
    // Rifts) and reaction-based equipment effects.
    reactionKinds.push(reaction.kind);
    const bonus = stats.reactionBonus?.[reaction.kind] ?? 0;

    if (reaction.kind === "crystallize" && reaction.auraElement !== undefined) {
      crystallizeElements.push(reaction.auraElement);
      continue;
    }

    if (reaction.category === "amplifying" && reaction.direction) {
      amplifying *= amplifyingMultiplier(
        reaction.direction,
        stats.elementalMastery,
        bonus,
      );
      continue;
    }

    if (reaction.category === "additive" && ADDITIVE_KEYS.has(reaction.kind)) {
      additive += additiveBaseDamageBonus(reaction.kind as AdditiveReactionKey, {
        triggerCharacterLevel: stats.level,
        elementalMastery: stats.elementalMastery,
        reactionBonus: bonus,
      });
      continue;
    }

    if (reaction.category === "transformative" && isTransformativeKey(reaction.kind)) {
      // Swirl damage is dealt in the SWIRLED element, so its RES is dynamic.
      const resElement: Element =
        reaction.kind === "swirl" && reaction.swirledElement
          ? reaction.swirledElement
          : transformativeResElement(reaction.kind);

      transformative.push({
        kind: reaction.kind,
        resElement,
        damage: transformativeDamage(reaction.kind, {
          triggerCharacterLevel: stats.level,
          elementalMastery: stats.elementalMastery,
          reactionBonus: bonus,
          resMultiplier: resMultiplierFor(resElement),
        }),
      });
    }
  }

  if (reactionKinds.length === 0) return NO_REACTION_MODIFIERS;
  return {
    amplifyingMultiplier: amplifying,
    additiveBaseDamageBonus: additive,
    transformative,
    ...(crystallizeElements.length > 0 ? { crystallizeElements } : {}),
    reactionKinds,
  };
}

/**
 * RES element for a transformative reaction. Note these are NOT always the
 * trigger element: Burgeon/Hyperbloom are Dendro RES, Shattered is Physical.
 */
function transformativeResElement(kind: TransformativeReactionKey): Element {
  switch (kind) {
    case "burning":
    case "overloaded":
      return "pyro";
    case "superconduct":
      return "cryo";
    case "electroCharged":
      return "electro";
    case "bloom":
    case "burgeon":
    case "hyperbloom":
      return "dendro";
    case "shattered":
      return "physical";
    case "swirl":
      // Unreachable in practice: swirl is resolved by `swirledElement` above.
      // Falls back to anemo rather than guessing an element.
      return "anemo";
  }
}
