// ---------------------------------------------------------------------------
// Presentation names for transformative reaction damage buckets.
//
// The engine emits one damage event per transformative reaction with a
// COMPOSITE ability id, `${triggerAbilityId}:${reactionKind}`, so that
// `damageByAbility` separates "the skill" from "the overload the skill caused"
// instead of merging them. Its `abilityName` is the raw `ReactionKind` token
// (`electroCharged`), which is a machine word, not a display name.
//
// This module is DISPLAY ONLY. It classifies a key and names it; it never
// computes, attributes or re-derives damage. Kept out of React and out of the
// simulation layer so it is unit-testable without a DOM and cannot drift into
// engine logic.
// ---------------------------------------------------------------------------

/**
 * Separator the engine uses between the trigger ability id and the reaction
 * kind in a composite ability id. Mirrors `emitTransformative()`.
 */
export const REACTION_KEY_SEPARATOR = ":";

/** Separator between a reaction name and its trigger, and for row qualifiers. */
export const QUALIFIER_SEPARATOR = " · ";

/**
 * Display names for every reaction spelling the engine can emit.
 *
 * Keyed by the raw `ReactionKind` token. Deliberately NOT typed as
 * `Record<ReactionKind, string>`: `ReactionKind` lives in
 * `src/simulation/reactions`, and `simulationAdapter.ts` is the only module in
 * the UI layer permitted to import from `src/simulation`. An unknown token
 * therefore has to be handled at runtime, which `reactionDisplayName` does by
 * falling back to the token itself rather than inventing a name.
 */
const REACTION_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  vaporize: "Vaporize",
  melt: "Melt",
  overloaded: "Overloaded",
  superconduct: "Superconduct",
  electroCharged: "Electro-Charged",
  swirl: "Swirl",
  shattered: "Shattered",
  burning: "Burning",
  bloom: "Bloom",
  hyperbloom: "Hyperbloom",
  burgeon: "Burgeon",
  aggravate: "Aggravate",
  spread: "Spread",
  frozen: "Frozen",
  quicken: "Quicken",
  crystallize: "Crystallize",
};

/**
 * A composite reaction key, split into its parts.
 *
 * `triggerAbilityId` is the ability that CAUSED the reaction, so a consumer can
 * resolve its display name from the same `abilityNamesById` map it already
 * holds — no new engine contract is needed.
 */
export interface ReactionKey {
  readonly triggerAbilityId: string;
  readonly reactionKind: string;
}

/**
 * Splits a composite reaction ability id, or returns null when the key is not
 * one.
 *
 * Splits on the LAST separator: an ability id is engine-supplied and is not
 * guaranteed to be free of colons, whereas the reaction kind the engine appends
 * never contains one. Splitting on the first separator would truncate such an
 * ability id and misattribute the bucket.
 *
 * A key whose suffix is not a known reaction kind is NOT a reaction key. This
 * matters: an ordinary ability id that merely contains a colon must keep
 * rendering as an ordinary ability, not be silently relabelled as a reaction.
 */
export function parseReactionKey(abilityId: string): ReactionKey | null {
  const at = abilityId.lastIndexOf(REACTION_KEY_SEPARATOR);
  if (at <= 0 || at === abilityId.length - 1) return null;
  const reactionKind = abilityId.slice(at + REACTION_KEY_SEPARATOR.length);
  if (!Object.hasOwn(REACTION_DISPLAY_NAMES, reactionKind)) return null;
  return { triggerAbilityId: abilityId.slice(0, at), reactionKind };
}

/**
 * Display name for a raw reaction kind.
 *
 * DELIBERATE FALLBACK: an unmapped kind renders as the RAW TOKEN, for the same
 * reason `resolveLabel` falls back to a raw ability id — a token appearing in
 * the UI signals that the display map and the engine's union have drifted, and
 * inventing a prettified name would hide that. It stays attributable either way.
 */
export function reactionDisplayName(reactionKind: string): string {
  return REACTION_DISPLAY_NAMES[reactionKind] ?? reactionKind;
}
