import type { AbilityDefinition } from "@/types";
import type {
  ElementalApplication,
  IcdBehaviour,
} from "@/simulation/reactions/types";
import { STANDARD_ICD } from "@/simulation/reactions/types";

// ============================================================================
// ABILITY CONTRACT — what mechanics needs on an ability.
//
// combat-engineer owns `src/types` and `AbilityDefinition`; this file does NOT
// modify either. It states, in compilable form, exactly the two fields this
// layer requires, and provides a structural view so mechanics can consume an
// ability that carries them WITHOUT `src/types` having been changed yet.
//
// Requested addition to `AbilityDefinition` (both OPTIONAL, so the change is
// additive and no existing data or test breaks):
//
//   /** Element applied per applying hit, in Gauge Units. Absent => 0U. */
//   application?: { gauge: number };
//
//   /** ICD behaviour. Absent => treated as the 2.5s / 3-hit standard. */
//   icd?:
//     | { mode: "standard" }
//     | { mode: "none" }
//     | { mode: "custom"; config: { intervalSeconds: number; hits: number } };
//
//   /**
//    * Optional ICD group. Abilities sharing a group share one ICD counter
//    * (the game does this for e.g. Normal+Charged on most sword users).
//    * Absent => the ability's own `id` is the group.
//    */
//   icdGroup?: string;
//
//   /** Hits per cast, for multi-hit abilities. Absent => 1. */
//   hitCount?: number;
//
// DEFAULTING RULES, stated so the two modules cannot disagree:
//   - `application` absent  => the ability applies NO element (0U). This fails
//     CLOSED: an un-authored ability produces no reactions rather than silently
//     inventing 1U and fabricating damage.
//   - `icd` absent          => standard 2.5s/3hits. This is the documented
//     behaviour of "most character abilities", so it is the safe default for
//     an ability that DOES declare an application.
//
// Deviations (no ICD, 1s/3hits, 5s/5hits, 0.5s, ...) are authored per ability
// as DATA. There is no branch in this module that names an ability.
// ============================================================================

/**
 * Structural view of the fields this layer reads from an ability.
 *
 * Intersected with `AbilityDefinition` rather than redeclaring it, so once
 * combat-engineer lands the fields this type collapses to a no-op and the call
 * sites need no change.
 */
export type ElementalAbility = AbilityDefinition & {
  application?: ElementalApplication;
  icd?: IcdBehaviour;
  icdGroup?: string;
  hitCount?: number;
};

/**
 * Gauge applied by one hit of this ability.
 *
 * FAILS CLOSED at 0U when unauthored — see the defaulting rules above.
 */
export function abilityGauge(ability: ElementalAbility): number {
  return ability.application?.gauge ?? 0;
}

/** ICD behaviour for this ability, defaulting to the documented standard. */
export function abilityIcd(ability: ElementalAbility): IcdBehaviour {
  return ability.icd ?? STANDARD_ICD;
}

/**
 * ICD group for this ability. Defaults to the ability's own id, so abilities
 * have independent ICDs unless data explicitly shares them.
 */
export function abilityIcdGroup(ability: ElementalAbility): string {
  return ability.icdGroup ?? ability.id;
}

/** Number of hits one cast produces. Defaults to 1. */
export function abilityHitCount(ability: ElementalAbility): number {
  const count = ability.hitCount ?? 1;
  return count > 0 ? Math.floor(count) : 0;
}
