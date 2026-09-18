import type { Rotation, RotationAction } from "@/types";

/** Stable identity for one action, including all explicit input selectors. */
export function actionKeySegment(action: RotationAction): string {
  return `${JSON.stringify([
    action.characterId,
    action.actionType,
    action.abilityId ?? null,
    action.normalIndex ?? null,
    action.skillVariant ?? null,
  ])}|`;
}

/** Stable, order-sensitive identity for a rotation. */
export function rotationKey(rotation: Rotation): string {
  let key = "";
  for (const action of rotation) key += actionKeySegment(action);
  return key;
}

/**
 * Informational edit distance from one rotation to another.
 *
 * Insertions, deletions and replacements are counted. A move/reorder is
 * intentionally represented by the equivalent delete/insert operations; the
 * result is a stable distance metric, not a fitness term.
 */
export function rotationEditDistance(
  from: Rotation,
  to: Rotation,
): number {
  const left = from.map(actionKeySegment);
  const right = to.map(actionKeySegment);
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0]!;
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column]!;
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      previous[column] = Math.min(
        previous[column]! + 1,
        previous[column - 1]! + 1,
        diagonal + cost,
      );
      diagonal = above;
    }
  }

  return previous[right.length]!;
}
