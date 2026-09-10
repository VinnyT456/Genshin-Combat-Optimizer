// ---------------------------------------------------------------------------
// Incumbent preservation for "copy into editor".
//
// Adopting a suggestion REPLACES the rotation the user hand-authored. That is
// the highest-value interaction in the product and also the most destructive
// one: a rotation is real work, and beam search offers no guarantee that its
// top candidate is actually better for the user's purposes.
//
// So adoption is modelled as a reversible transition rather than an assignment.
// The rotation being replaced is captured BEFORE the replacement, and restoring
// it is always available while the adopted rotation is still in place. Nothing
// here mutates anything: both directions return new state.
//
// This is not undo/redo (UX-035, separate work). It is the narrower guarantee
// that search specifically can never destroy hand-authored input.
// ---------------------------------------------------------------------------

import type { Rotation } from "@/types";

export interface AdoptionState {
  /**
   * The rotation that was in the editor before a candidate was adopted, or
   * `null` when nothing has been adopted and there is nothing to restore.
   */
  readonly incumbent: Rotation | null;
  /** Rank (1-based) of the adopted candidate, for labelling the restore control. */
  readonly adoptedRank: number | null;
}

export const NO_ADOPTION: AdoptionState = {
  incumbent: null,
  adoptedRank: null,
};

export interface AdoptionTransition {
  /** What the editor should now contain. */
  readonly rotation: Rotation;
  readonly adoption: AdoptionState;
}

/**
 * Adopts a candidate, preserving whatever the editor currently holds.
 *
 * The incumbent is captured only on the FIRST adoption. Adopting a second
 * candidate must still restore to the user's original hand-authored rotation,
 * not to the previously adopted suggestion — otherwise browsing three
 * candidates in a row silently loses the original after the first click.
 */
export function adoptCandidate(
  current: Rotation,
  candidate: Rotation,
  rank: number,
  adoption: AdoptionState,
): AdoptionTransition {
  return {
    rotation: candidate,
    adoption: {
      incumbent: adoption.incumbent ?? current,
      adoptedRank: rank,
    },
  };
}

/**
 * Restores the preserved rotation.
 *
 * Returns `null` when there is nothing to restore, so a caller cannot blank the
 * editor by invoking restore in a state where no adoption happened.
 */
export function restoreIncumbent(
  adoption: AdoptionState,
): AdoptionTransition | null {
  if (adoption.incumbent === null) return null;
  return {
    rotation: adoption.incumbent,
    adoption: NO_ADOPTION,
  };
}

/**
 * Adoption is abandoned when the user edits the rotation themselves: at that
 * point the editor no longer holds the adopted candidate, so offering to
 * "restore" would replace their fresh edit with an older rotation.
 */
export function clearAdoptionOnManualEdit(): AdoptionState {
  return NO_ADOPTION;
}

export function canRestore(adoption: AdoptionState): boolean {
  return adoption.incumbent !== null;
}
