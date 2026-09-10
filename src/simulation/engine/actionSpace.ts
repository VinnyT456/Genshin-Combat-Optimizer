import type {
  AbilityActionType,
  ActionType,
  DamageType,
  RotationAction,
} from "@/types";

// ============================================================================
// Action space — which actions a rotation can ADDRESS.
//
// The optimizer generates candidates from this module and the engine resolves
// them through it, so the set of actions the search can propose is by
// construction the set the engine can execute. Previously these were different
// sets: `AbilitySlot` had six members but `ActionType` had four, so plunging
// attacks and normal-string positions were UNGENERATABLE rather than rejected.
// A validator cannot report a candidate that was never proposed, so the loss
// was invisible to pruning — the search quietly explored a smaller space and
// returned a confident best rotation from it.
//
// Pure and data-only: no character is named anywhere here.
// ============================================================================

/** Every action a rotation may request, in a fixed, deterministic order. */
export const ALL_ACTION_TYPES: readonly ActionType[] = [
  "normal",
  "charged",
  "plungeLow",
  "plungeHigh",
  "skill",
  "burst",
  "swap",
];

/** Action types that resolve to an ability (everything except `swap`). */
export const ABILITY_ACTION_TYPES: readonly AbilityActionType[] = [
  "normal",
  "charged",
  "plungeLow",
  "plungeHigh",
  "skill",
  "burst",
];

/** Narrowing guard: does this action type resolve to an ability? */
export function isAbilityActionType(
  actionType: ActionType,
): actionType is AbilityActionType {
  return actionType !== "swap";
}

/**
 * Filler `DamageType` for `swap`, which deals no damage at all.
 *
 * `AbilityDefinition.damageType` is a required field, so a swap-shaped
 * ability still needs *some* value. `"skill"` preserves the pre-existing
 * convention. Named rather than inlined so it is searchable, and so nobody
 * reads a bare `"skill"` at a swap call site as meaningful.
 */
export const SWAP_DAMAGE_TYPE: DamageType = "skill";

/**
 * The `DamageType` an ability slot deals. THE single source of this
 * conversion — no caller may re-derive it.
 *
 * `ActionType` and `DamageType` USED to coincide member-for-member, so callers
 * could assign one to the other directly. That was a COINCIDENCE, not a
 * contract, and widening `ActionType` for B2 broke it. The two unions answer
 * different questions and are deliberately kept at different granularities:
 *
 *   - `ActionType`  WHICH action a rotation requests. Low and high plunge are
 *                   genuinely distinct actions with distinct abilities.
 *   - `DamageType`  what KIND of damage results. Both plunges are one kind, so
 *                   `DamageType` stays coarse; pushing the low/high split into
 *                   the damage pipeline would give it a distinction with no
 *                   meaning there.
 *
 * Exhaustive by construction: the `never` assignment below fails to COMPILE if
 * a member is ever added to `ActionType` without being mapped here. That is the
 * property that would have caught the plunge widening at the point of change
 * rather than at a downstream call site.
 */
export function damageTypeForActionType(actionType: ActionType): DamageType {
  switch (actionType) {
    case "normal":
      return "normal";
    case "charged":
      return "charged";
    // Both plunge slots are the same KIND of damage.
    case "plungeLow":
    case "plungeHigh":
      return "plunge";
    case "skill":
      return "skill";
    case "burst":
      return "burst";
    case "swap":
      return SWAP_DAMAGE_TYPE;
    default: {
      // Unreachable. Exists so an unmapped new member is a compile error.
      const exhaustive: never = actionType;
      return exhaustive;
    }
  }
}

/** First position of a normal-attack string. */
export const FIRST_NORMAL_STRING_INDEX = 0;

/**
 * Length of the normal-attack string a LEGACY `CharacterDefinition` can
 * express. The legacy shape has a single `normalAttack`, i.e. an N1-only
 * string; the generic kit model carries the real N1..N5.
 */
export const LEGACY_NORMAL_STRING_LENGTH = 1;

/**
 * The normal-string position a character is currently at.
 *
 * Absent state reads as the first hit, so a `CharacterState` built before this
 * field existed behaves exactly as it did (always N1).
 */
export function normalStringIndexOf(state: {
  normalStringIndex?: number;
}): number {
  return state.normalStringIndex ?? FIRST_NORMAL_STRING_INDEX;
}

/**
 * Which normal-string position an action addresses.
 *
 * An explicit `normalIndex` PINS the position — this is what a search needs to
 * propose "N2 without N1". Absent falls back to the character's tracked
 * position, which is what a human authoring `N1 N2 N3` expects.
 *
 * Out-of-range indices are NOT clamped here: resolution is the caller's job
 * and an out-of-range request must be REJECTED (so the optimizer learns the
 * branch is illegal) rather than silently redirected to a different ability.
 */
export function resolveNormalStringIndex(
  action: RotationAction,
  state: { normalStringIndex?: number },
): number {
  return action.normalIndex ?? normalStringIndexOf(state);
}

/**
 * Position after performing a normal attack at `index`.
 *
 * A looping string wraps to the first hit; a non-looping one saturates at the
 * end (the game has no "past the last hit" state — the combo simply ends).
 */
export function advanceNormalStringIndex(
  index: number,
  stringLength: number,
  loops: boolean,
): number {
  if (stringLength <= 0) return FIRST_NORMAL_STRING_INDEX;
  const next = index + 1;
  if (next < stringLength) return next;
  return loops ? FIRST_NORMAL_STRING_INDEX : stringLength - 1;
}
