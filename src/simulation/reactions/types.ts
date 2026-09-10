import type { Element } from "@/types";

// ============================================================================
// Elemental aura / reaction / ICD object model.
//
// Everything here is PLAIN DATA and character-agnostic. The system is
//
//     Element application -> Aura state -> Reaction resolution -> modifier
//
// A character is never named. Adding a character with an exotic elemental
// application must be pure data authoring (`ElementalApplication` + `IcdConfig`
// on the ability), never an edit to this module.
// ============================================================================

// ---------------------------------------------------------------------------
// Aurable elements
// ---------------------------------------------------------------------------

/**
 * Elements that can linger on a target as an aura.
 *
 * Anemo and Geo apply NO aura (they only react with an existing one), and
 * `physical` is not an element in the reaction sense. Verified: Elemental
 * Gauge Theory — "Cryo, Dendro, Electro, Hydro, and Pyro attacks CAN apply an
 * aura. Anemo and Geo attacks CANNOT apply an aura."
 */
export const AURA_ELEMENTS = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "dendro",
] as const;

export type AuraElement = (typeof AURA_ELEMENTS)[number];

export function isAuraElement(element: Element): element is AuraElement {
  return (AURA_ELEMENTS as readonly Element[]).includes(element);
}

// ---------------------------------------------------------------------------
// Elemental application (what an ability does to the aura state)
// ---------------------------------------------------------------------------

/**
 * How much element one HIT of an ability applies.
 *
 * This is the contract combat-engineer must put on `AbilityDefinition` (see
 * `abilityContract.ts`). Gauge is in Gauge Units (GU); real abilities apply
 * 1, 1.5, 2 or 4 GU. A `gauge` of 0 models a 0U attack, which can neither
 * create an aura nor trigger a reaction.
 */
export interface ElementalApplication {
  /**
   * Gauge units applied per applying hit. Must be >= 0.
   * 0U attacks are legal and meaningful (they still "count" as elemental for
   * non-reaction purposes, which this layer does not model).
   */
  gauge: number;
}

// ---------------------------------------------------------------------------
// Aura state
// ---------------------------------------------------------------------------

/**
 * One elemental aura currently on a target.
 *
 * Decay is stored as `decayRate` (seconds per GU) rather than as an expiry
 * timestamp, because Genshin's decay-rate INHERITANCE rules mean a refreshed
 * aura can keep an old decay rate while taking a new gauge. Storing the rate
 * makes inheritance representable; storing only an expiry does not.
 *
 * `gauge` is always the value at `since`; the value at any later time is a
 * pure function of elapsed time (see `decayAura`). Nothing here reads a clock.
 */
export interface Aura {
  element: AuraElement;
  /** Gauge units remaining as of `since`. Always > 0 for a live aura. */
  gauge: number;
  /** Simulation time (seconds) at which `gauge` was last recomputed. */
  since: number;
  /**
   * Seconds required to decay 1 GU. Derived from the gauge of the application
   * that CREATED the aura, and inherited across same-element refreshes and
   * partial reactions (Pyro excepted — see `applyElement`).
   *
   * This is the aura's NATURAL rate only. Any additional, externally-caused
   * consumption lives in `drains` and is deliberately NOT folded in here, so
   * that the natural rate stays inheritable unchanged across refreshes.
   */
  decayRate: number;
  /**
   * Extra gauge consumption imposed on this aura by an ongoing reaction, on
   * top of natural decay. Absent (not `[]`) when there is none — see
   * `auraDrains()` for why absence rather than an empty array.
   */
  drains?: readonly AuraDrain[];
}

/**
 * One source of EXTRA, continuous gauge consumption on an aura, beyond the
 * aura's own natural decay.
 *
 * WHY THIS SHAPE, and why not a rate derived from the aura SET
 * -----------------------------------------------------------
 * The motivating case is Burning, where the Dendro aura drains faster while a
 * Pyro aura is present. It is tempting to model that as "effective decay rate
 * = f(set of auras present)", i.e. recompute a rate whenever the set changes.
 * That was considered and REJECTED, for two reasons:
 *
 *  1. PROVENANCE. The only sourced statement of a summed Dendro+Pyro rate is
 *     PRE-3.0 and superseded — see `unverified.ts` (`burning-coupled-decay`).
 *     A set-derived rate would hard-code that superseded claim as a law of the
 *     model, applying it automatically to every Pyro+Dendro pair forever. An
 *     explicit drain, defaulted to none, encodes no claim unless a caller
 *     supplies one.
 *  2. MECHANISM. The evidence describes the coupling not as the aura decaying
 *     faster by itself, but as gauge being SPENT by a repeating process (the
 *     reaction re-applying its element). That is attributable, per-source
 *     consumption, which is what this record is. A bare scalar rate loses the
 *     attribution, so two concurrent causes could not be told apart, added, or
 *     removed independently.
 *
 * `ratePerSecond` is GU consumed per second — the reciprocal dimension of
 * `decayRate` (seconds per GU). The two are deliberately different units so
 * they cannot be accidentally added.
 *
 * Plain data, never a predicate (project rule): a drain is removed by the
 * caller that added it, keyed on `source`, not by evaluating a condition.
 */
export interface AuraDrain {
  /**
   * Stable identifier for whatever imposed this drain, so it can be removed
   * again without ambiguity and so two sources cannot silently collapse into
   * one. Reaction-caused drains use the `ReactionKind`.
   */
  source: string;
  /** Gauge units consumed per second, in addition to natural decay. >= 0. */
  ratePerSecond: number;
}

/**
 * Auras that are not a plain element but a compound STATE created by a
 * reaction, which then reacts with further elements in its own way.
 *
 *  - `frozen`   created by Hydro+Cryo. Reacts with Pyro/Electro/Anemo, and is
 *               broken by Geo / Blunt attacks (Shatter).
 *  - `quicken`  created by Dendro+Electro. Reacts with Pyro/Hydro, and with
 *               Electro/Dendro to produce Aggravate/Spread WITHOUT being
 *               consumed.
 *  - `burning`  created by Pyro+Dendro; maintained while both a Burning and a
 *               Dendro aura persist.
 *
 * These coexist with "underlying" elemental auras rather than replacing them,
 * which is why `AuraState` holds a list plus these flags.
 */
export type CompoundAuraKind = "frozen" | "quicken" | "burning";

export interface CompoundAura {
  kind: CompoundAuraKind;
  /** Gauge units remaining as of `since`. */
  gauge: number;
  since: number;
  decayRate: number;
  /** See `Aura.drains`. Compound auras drain by the same rules. */
  drains?: readonly AuraDrain[];
}

/**
 * Full elemental state of ONE target.
 *
 * Multiple auras coexist in exactly the cases the game allows:
 *  - Electro-Charged: Hydro AND Electro simultaneously (both are real auras).
 *  - Frozen / Quicken / Burning: a compound aura plus underlying elements.
 *
 * Ordinary elements otherwise OVERWRITE: applying Cryo to a Pyro aura reacts
 * and does not leave both. Invariant: `auras` never contains two entries with
 * the same `element`.
 *
 * Immutable by convention — every function in this module returns a new state.
 */
export interface AuraState {
  /** Live elemental auras, ordered by `element` for deterministic output. */
  auras: readonly Aura[];
  /** Live compound auras (frozen / quicken / burning). */
  compound: readonly CompoundAura[];
}

/** A target with no elemental aura at all. */
export const EMPTY_AURA_STATE: AuraState = { auras: [], compound: [] };

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

/**
 * Every reaction this layer can name.
 *
 * `crystallize` produces a shield rather than damage; `frozen` and `quicken`
 * produce a compound aura rather than damage. They are still reactions and are
 * reported, so the engine can render them and so aura consumption is correct.
 */
export type ReactionKind =
  // Amplifying — multiply the triggering damage instance.
  | "vaporize"
  | "melt"
  // Transformative — their own damage instance.
  | "overloaded"
  | "superconduct"
  | "electroCharged"
  | "swirl"
  | "shattered"
  | "burning"
  | "bloom"
  | "hyperbloom"
  | "burgeon"
  // Additive — add a flat term to the triggering instance's base damage.
  | "aggravate"
  | "spread"
  // Neither damage nor multiplier.
  | "frozen"
  | "quicken"
  | "crystallize";

/**
 * How a reaction enters the damage pipeline. This is the seam that MUST be
 * modelled explicitly: getting it wrong silently corrupts every damage number,
 * because each category attaches at a DIFFERENT point in the formula.
 *
 *  - `amplifying`     multiplies the triggering instance's final damage
 *                     (`DMG * amplifyingMultiplier`). NOT a DMG% bonus.
 *  - `transformative` a SEPARATE damage instance. Ignores ATK, DMG%, DEF and
 *                     (by default) crit; affected by RES only.
 *  - `additive`       adds a flat term to BASE DMG, i.e. INSIDE the parenthesis
 *                     before DMG%/crit/DEF/RES — not to final damage.
 *  - `none`           no damage contribution (frozen / quicken / crystallize).
 */
export type ReactionCategory =
  | "amplifying"
  | "transformative"
  | "additive"
  | "none";

/**
 * Which side of an amplifying reaction was triggered.
 *
 *  - `forward` the 2.0x direction (Hydro onto Pyro; Pyro onto Cryo).
 *  - `reverse` the 1.5x direction (Pyro onto Hydro; Cryo onto Pyro).
 *
 * Named rather than left as a bare number so the trigger-order dependence is
 * visible in types and in test names.
 */
export type AmplifyingDirection = "forward" | "reverse";

/**
 * One reaction produced by one elemental application.
 *
 * A single hit CAN produce more than one reaction (the canonical case: a Pyro
 * hit on an Electro-Charged target vaporizes AND overloads), so the resolver
 * returns a list.
 */
export interface ReactionResult {
  kind: ReactionKind;
  category: ReactionCategory;
  /** Element that triggered the reaction (the incoming hit). */
  triggerElement: Element;
  /** Aura element consumed. Absent for reactions with no elemental aura side. */
  auraElement?: AuraElement;
  /** Gauge units of aura consumed by this reaction. */
  gaugeConsumed: number;
  /** Set only when `category === "amplifying"`. */
  direction?: AmplifyingDirection;
  /**
   * For swirl: the element that was swirled and thus the element of the swirl
   * damage instance (and the RES that applies to it).
   */
  swirledElement?: AuraElement;
}

// ---------------------------------------------------------------------------
// ICD
// ---------------------------------------------------------------------------

/**
 * Internal Cooldown configuration for ONE ability (or one shared ICD group).
 *
 * Deviations from the 2.5s/3-hit standard are COMMON (no ICD at all, 1s/3hits,
 * 5s/5hits, 0.5s, ...). They are therefore expressed as DATA on the ability —
 * there is deliberately no branch anywhere in this module that asks "is this
 * ability special".
 */
export interface IcdConfig {
  /**
   * Seconds after an applying hit during which the hit counter governs.
   * `undefined` is not allowed; use `mode: "none"` for no ICD.
   */
  intervalSeconds: number;
  /** Every Nth hit applies (1 == every hit applies within the timer). */
  hits: number;
}

/**
 * An ability's ICD behaviour.
 *
 *  - `standard` the 2.5s / 3-hit rule.
 *  - `custom`   an explicit interval / hit count from game data.
 *  - `none`     every hit applies its element (no ICD at all).
 *
 * A discriminated union rather than optional fields, so "no ICD" cannot be
 * confused with "ICD data not authored yet".
 */
export type IcdBehaviour =
  | { mode: "standard" }
  | { mode: "none" }
  | { mode: "custom"; config: IcdConfig };

/** The 2.5s / 3-hit default, as a value. */
export const STANDARD_ICD: IcdBehaviour = { mode: "standard" };

/**
 * Mutable-by-replacement counter state for one ICD group.
 *
 * ICD is tracked "separately for each attacker and each target" (verified:
 * Internal Cooldown), so the key that owns one of these must include both.
 * See `icdKey()`.
 */
export interface IcdCounter {
  /** Time of the hit that started the current window. */
  windowStart: number;
  /** Hits taken since `windowStart`, INCLUDING the one that started it. */
  hitsInWindow: number;
}

/** ICD counters for a whole run, keyed by `icdKey()`. */
export type IcdState = Readonly<Record<string, IcdCounter>>;

// ---------------------------------------------------------------------------
// Reaction damage inputs
// ---------------------------------------------------------------------------

/**
 * Everything needed to price a transformative or additive reaction.
 *
 * Deliberately NOT the character's full `Stats`: transformative damage depends
 * only on the TRIGGERING character's level and EM, plus reaction-specific
 * bonuses. Passing full stats would invite the classic bug of letting ATK or
 * generic DMG% leak into transformative damage.
 */
export interface ReactionDamageContext {
  /** Level of the character that TRIGGERED the reaction (not the aura applier). */
  triggerCharacterLevel: number;
  /** Elemental Mastery of the triggering character. */
  elementalMastery: number;
  /**
   * Reaction-specific DMG bonus as a fraction (e.g. an artifact set granting
   * +40% Overloaded DMG => 0.4). Additive with the EM bonus, per the game
   * formula `(1 + emBonus + reactionBonus)`.
   */
  reactionBonus?: number;
  /**
   * Flat additive bonus to the reaction's damage
   * (`Reaction Additive Base DMG Bonus`), applied before RES.
   */
  additiveBonus?: number;
  /** Enemy resistance multiplier for the reaction's damage element. */
  resMultiplier: number;
}
