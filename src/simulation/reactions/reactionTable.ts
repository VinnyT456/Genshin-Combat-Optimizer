import type { Element } from "@/types";
import {
  REACTION_COEFFICIENT_HIGH,
  REACTION_COEFFICIENT_LOW,
  REACTION_COEFFICIENT_STANDARD,
} from "@/simulation/reactions/constants";
import type {
  AmplifyingDirection,
  AuraElement,
  ReactionCategory,
  ReactionKind,
} from "@/simulation/reactions/types";

// ============================================================================
// The reaction table.
//
// This is the whole "which element on which aura does what" rulebook, as DATA.
// There is no `if (character === ...)` anywhere, and no pairwise special case:
// a lookup of (triggerElement, auraElement) yields a rule, and the resolver
// applies rules uniformly.
//
// Verified: Genshin Impact Wiki, `Elemental Reaction` (reaction matrix) and
// `Elemental Gauge Theory` (reaction coefficients table).
// ============================================================================

/** One entry of the reaction rulebook. */
export interface ReactionRule {
  kind: ReactionKind;
  category: ReactionCategory;
  /**
   * Aura consumption coefficient: `consumed = coefficient * triggerGauge`.
   * Verified: Elemental Gauge Theory, "Most Elemental Reactions".
   */
  coefficient: number;
  /** Only for amplifying reactions. */
  direction?: AmplifyingDirection;
}

/**
 * Reaction lookup keyed by `trigger` then `aura`.
 *
 * Note the deliberate asymmetry between the two directions of Melt and
 * Vaporize — it drives BOTH the damage multiplier and the aura consumption,
 * and the two always agree in direction:
 *
 *   forward (2.0x damage) also consumes 2x aura  -> usually clears the aura
 *   reverse (1.5x damage) also consumes 0.5x aura -> usually preserves it
 *
 * Verified: Elemental Gauge Theory coefficient table lists "Pyro Melt / Hydro
 * Vaporize / Dendro Bloom" at coefficient 2, and "Cryo Melt / Pyro Vaporize /
 * Hydro Bloom / Crystallize / Swirl" at 0.5.
 */
const RULES: Readonly<
  Partial<Record<Element, Partial<Record<AuraElement, ReactionRule>>>>
> = {
  pyro: {
    // Pyro onto Cryo: forward melt, 2.0x damage, consumes 2x.
    cryo: {
      kind: "melt",
      category: "amplifying",
      direction: "forward",
      coefficient: REACTION_COEFFICIENT_HIGH,
    },
    // Pyro onto Hydro: reverse vaporize, 1.5x damage, consumes 0.5x.
    hydro: {
      kind: "vaporize",
      category: "amplifying",
      direction: "reverse",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    electro: {
      kind: "overloaded",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    dendro: {
      kind: "burning",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
  },
  hydro: {
    // Hydro onto Pyro: forward vaporize, 2.0x damage, consumes 2x.
    pyro: {
      kind: "vaporize",
      category: "amplifying",
      direction: "forward",
      coefficient: REACTION_COEFFICIENT_HIGH,
    },
    cryo: {
      kind: "frozen",
      category: "none",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    electro: {
      kind: "electroCharged",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    // Hydro onto Dendro: bloom, coefficient 0.5.
    dendro: {
      kind: "bloom",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
  },
  cryo: {
    // Cryo onto Pyro: reverse melt, 1.5x damage, consumes 0.5x.
    pyro: {
      kind: "melt",
      category: "amplifying",
      direction: "reverse",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    hydro: {
      kind: "frozen",
      category: "none",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    electro: {
      kind: "superconduct",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
  },
  electro: {
    pyro: {
      kind: "overloaded",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    hydro: {
      kind: "electroCharged",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    cryo: {
      kind: "superconduct",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    dendro: {
      kind: "quicken",
      category: "none",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
  },
  dendro: {
    pyro: {
      kind: "burning",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
    // Dendro onto Hydro: bloom, coefficient 2.
    hydro: {
      kind: "bloom",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_HIGH,
    },
    electro: {
      kind: "quicken",
      category: "none",
      coefficient: REACTION_COEFFICIENT_STANDARD,
    },
  },
  anemo: {
    pyro: {
      kind: "swirl",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    hydro: {
      kind: "swirl",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    electro: {
      kind: "swirl",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    cryo: {
      kind: "swirl",
      category: "transformative",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
  },
  geo: {
    pyro: {
      kind: "crystallize",
      category: "none",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    hydro: {
      kind: "crystallize",
      category: "none",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    electro: {
      kind: "crystallize",
      category: "none",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
    cryo: {
      kind: "crystallize",
      category: "none",
      coefficient: REACTION_COEFFICIENT_LOW,
    },
  },
};

/**
 * Look up the reaction produced by `trigger` hitting an aura of `aura`.
 * Returns undefined when the pair does not react (e.g. same element, or
 * Anemo/Geo onto Dendro).
 */
export function lookupReaction(
  trigger: Element,
  aura: AuraElement,
): ReactionRule | undefined {
  return RULES[trigger]?.[aura];
}

/**
 * Elements that consume an aura but never leave one of their own.
 * Verified: Elemental Gauge Theory — "Anemo and Geo attacks cannot apply an
 * aura."
 */
export function appliesAura(element: Element): boolean {
  return element !== "anemo" && element !== "geo" && element !== "physical";
}
