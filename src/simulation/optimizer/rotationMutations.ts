import type { Rotation } from "@/types";
import { rotationKey } from "./rotationIdentity";

/**
 * Generates the reorder-only neighborhood used by the portfolio search.
 *
 * The optimizer is intentionally not a rotation editor. A search candidate
 * must contain the exact same actions as the user's sequence: it may only
 * change their order. Damage, timing, cooldowns, energy and action legality
 * are still evaluated by `simulateRotation()` after each candidate is made.
 */
export function generateRotationMutations(
  original: Rotation,
): readonly Rotation[] {
  const out: Rotation[] = [];
  const seen = new Set<string>();
  const originalKey = rotationKey(original);

  // Swapping every pair gives the search a useful reorder neighborhood while
  // keeping each candidate the same length and preserving every action.
  for (let left = 0; left < original.length - 1; left += 1) {
    for (let right = left + 1; right < original.length; right += 1) {
      const reordered = [...original];
      [reordered[left], reordered[right]] = [
        reordered[right]!,
        reordered[left]!,
      ];
      const key = rotationKey(reordered);
      if (key === originalKey || seen.has(key)) continue;
      seen.add(key);
      out.push(reordered);
    }
  }

  return out;
}
