import {
  ADDITIVE_COEFFICIENTS,
  EM_BONUS_ADDITIVE_SCALE,
  EM_BONUS_ADDITIVE_SOFT_CAP,
  EM_BONUS_AMPLIFYING_SCALE,
  EM_BONUS_AMPLIFYING_SOFT_CAP,
  EM_BONUS_TRANSFORMATIVE_SCALE,
  EM_BONUS_TRANSFORMATIVE_SOFT_CAP,
  MAX_TABULATED_LEVEL,
  TRANSFORMATIVE_COEFFICIENTS,
  TRANSFORMATIVE_LEVEL_MULTIPLIER,
  AMPLIFYING_FORWARD_MULTIPLIER,
  AMPLIFYING_REVERSE_MULTIPLIER,
} from "@/simulation/reactions/constants";
import { sanitizeElementalMastery } from "@/simulation/reactions/finiteness";
import type {
  AmplifyingDirection,
  ReactionDamageContext,
} from "@/simulation/reactions/types";

// ============================================================================
// Reaction damage math.
//
// THE PIPELINE SEAM — stated explicitly, because getting it wrong silently
// corrupts every damage number:
//
//   General formula (verified: Genshin Impact Wiki, `Damage`):
//
//     DMG = (Σ(BaseDMG * BaseDMGMultiplier) + AdditiveBaseDMGBonus)
//           * DMGBonusMultiplier * DEFMultiplier * RESMultiplier
//           * CRITMultiplier
//
//   AMPLIFYING (vaporize / melt) multiplies that WHOLE result:
//
//     DMG_amplified = DMG * amplifyingMultiplier
//
//   It is NOT a DMG% bonus. Folding it into `dmgBonus` would make it additive
//   with elemental DMG% and understate it badly.
//
//   ADDITIVE (aggravate / spread) enters INSIDE the parenthesis, as
//   `AdditiveBaseDMGBonus` — before DMG%, DEF, RES and crit. Adding it to
//   final damage instead would understate it by every one of those factors.
//
//   TRANSFORMATIVE is a SEPARATE damage instance that shares almost nothing
//   with the triggering hit: no ATK, no DMG%, no DEF, and no crit by default.
//   Only the triggering character's level + EM and the target's RES matter.
// ============================================================================

/**
 * Generic EM diminishing-returns curve:  scale * EM / (EM + softCap).
 * Returned as a FRACTION (0.5 == +50%).
 */
function emCurve(em: number, scale: number, softCap: number): number {
  // ENTRY GUARD (see `finiteness.ts`): all three EM curves funnel through
  // here, so sanitising once covers amplifying, transformative and additive.
  // Without it, `Infinity / Infinity` yields NaN which then propagates into
  // the damage pipeline as a NaN multiplier.
  const clamped = Math.max(0, sanitizeElementalMastery(em));
  return (scale * clamped) / (clamped + softCap);
}

/** EM bonus for vaporize / melt.  2.78 * EM/(EM+1400). */
export function amplifyingEmBonus(elementalMastery: number): number {
  return emCurve(
    elementalMastery,
    EM_BONUS_AMPLIFYING_SCALE,
    EM_BONUS_AMPLIFYING_SOFT_CAP,
  );
}

/** EM bonus for transformative reactions.  16 * EM/(EM+2000). */
export function transformativeEmBonus(elementalMastery: number): number {
  return emCurve(
    elementalMastery,
    EM_BONUS_TRANSFORMATIVE_SCALE,
    EM_BONUS_TRANSFORMATIVE_SOFT_CAP,
  );
}

/** EM bonus for additive (aggravate / spread) reactions.  5 * EM/(EM+1200). */
export function additiveEmBonus(elementalMastery: number): number {
  return emCurve(
    elementalMastery,
    EM_BONUS_ADDITIVE_SCALE,
    EM_BONUS_ADDITIVE_SOFT_CAP,
  );
}

/**
 * Level multiplier for the TRIGGERING character.
 *
 * Clamped, never extrapolated: a level outside the tabulated range returns the
 * nearest tabulated value rather than a made-up one.
 */
export function levelMultiplier(level: number): number {
  const index = Math.min(Math.max(Math.floor(level), 1), MAX_TABULATED_LEVEL) - 1;
  return TRANSFORMATIVE_LEVEL_MULTIPLIER[index] ?? 0;
}

/**
 * Base multiplier of an amplifying reaction, BEFORE EM and reaction bonuses.
 * 2.0 forward, 1.5 reverse.
 */
export function amplifyingBaseMultiplier(
  direction: AmplifyingDirection,
): number {
  return direction === "forward"
    ? AMPLIFYING_FORWARD_MULTIPLIER
    : AMPLIFYING_REVERSE_MULTIPLIER;
}

/**
 * Full amplifying multiplier applied to the triggering damage instance:
 *
 *   base * (1 + emBonus + reactionBonus)
 *
 * The caller multiplies its computed damage by this. Verified: Genshin Impact
 * Wiki, `Damage` / "Amplifying Reaction Damage".
 */
export function amplifyingMultiplier(
  direction: AmplifyingDirection,
  elementalMastery: number,
  reactionBonus = 0,
): number {
  const base = amplifyingBaseMultiplier(direction);
  return base * (1 + amplifyingEmBonus(elementalMastery) + reactionBonus);
}

/** Transformative reactions that have a damage coefficient. */
export type TransformativeReactionKey = keyof typeof TRANSFORMATIVE_COEFFICIENTS;

/**
 * Damage of a transformative reaction instance:
 *
 *   (coefficient * levelMultiplier * (1 + emBonus + reactionBonus)
 *    + additiveBonus) * resMultiplier
 *
 * No ATK, no DMG%, no DEF, no crit — by design, not by omission. Crit-enabled
 * transformative reactions exist but require a character-specific ability to
 * grant them, so they are NOT modelled here (see `unverified.ts`).
 *
 * Verified: Genshin Impact Wiki, `Damage` / "Transformative Reaction Damage".
 */
export function transformativeDamage(
  reaction: TransformativeReactionKey,
  context: ReactionDamageContext,
): number {
  const coefficient = TRANSFORMATIVE_COEFFICIENTS[reaction];
  const level = levelMultiplier(context.triggerCharacterLevel);
  const bonus =
    1 +
    transformativeEmBonus(context.elementalMastery) +
    (context.reactionBonus ?? 0);
  const base = coefficient * level * bonus + (context.additiveBonus ?? 0);
  return base * context.resMultiplier;
}

/** Additive reactions that produce an Additive Base DMG Bonus. */
export type AdditiveReactionKey = keyof typeof ADDITIVE_COEFFICIENTS;

/**
 * `Additive Base DMG Bonus` contributed by aggravate / spread:
 *
 *   coefficient * levelMultiplier * (1 + emBonus + reactionBonus)
 *
 * The caller must ADD this to BASE DMG (inside the parenthesis), NOT to final
 * damage. RES/DEF/crit are applied by the normal pipeline afterwards, which is
 * exactly why it is returned unmultiplied by RES here.
 *
 * Verified: Genshin Impact Wiki, `Elemental Reaction` / "Additive Reactions"
 * and `Damage` / "Additive Base DMG Bonus".
 */
export function additiveBaseDamageBonus(
  reaction: AdditiveReactionKey,
  context: Pick<
    ReactionDamageContext,
    "triggerCharacterLevel" | "elementalMastery" | "reactionBonus"
  >,
): number {
  const coefficient = ADDITIVE_COEFFICIENTS[reaction];
  const level = levelMultiplier(context.triggerCharacterLevel);
  const bonus =
    1 + additiveEmBonus(context.elementalMastery) + (context.reactionBonus ?? 0);
  return coefficient * level * bonus;
}
