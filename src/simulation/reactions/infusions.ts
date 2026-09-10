import type { DamageType, Element } from "@/types";

// ============================================================================
// Weapon Infusions.
//
// Models elemental infusions (Chongyun E, Bennett C6, Ayaka dash, Keqing E,
// Diluc Q, Xiao Q, Noelle Q, Raiden Q, etc.) purely and generically.
//
// In Genshin, infusions modify the element of normal, charged, and plunge
// attacks. Some infusions can be overridden by other infusions (e.g. Chongyun's
// Cryo field or Bennett's C6 Pyro field), whereas others cannot be overridden
// (e.g. Raiden's burst or Xiao's burst: "cannot be overridden by any other
// elemental infusion").
//
// Priority rules:
//   1. Non-overridable infusions beat overridable infusions.
//   2. More recent infusions beat earlier infusions within the same category.
//   3. Infusion only applies if the attack's damageType is in the targets list.
// ============================================================================

/**
 * Standard attack types affected by weapon infusions in Genshin Impact.
 * By default, infusions apply to normal, charged, and plunge attacks.
 */
export const DEFAULT_INFUSION_TARGETS: readonly DamageType[] = [
  "normal",
  "charged",
  "plunge",
] as const;

/**
 * Declaration of an elemental weapon infusion.
 */
export interface InfusionDefinition {
  id: string;
  element: Element;
  durationSeconds: number;
  canBeOverridden: boolean;
  /**
   * Attack types affected by this infusion.
   * Defaults to {@link DEFAULT_INFUSION_TARGETS} (normal, charged, plunge).
   */
  targets?: readonly DamageType[];
}

/**
 * An active infusion instance with its start timestamp.
 */
export interface ActiveInfusionEntry {
  infusion: InfusionDefinition;
  startTime: number;
}

/**
 * Check whether an infusion is active at `time`.
 * Uses the half-open activation window `[startTime, startTime + durationSeconds)`.
 */
export function isInfusionActive(
  entry: { infusion: InfusionDefinition; startTime: number },
  time: number,
): boolean {
  if (entry.infusion.durationSeconds <= 0) return false;
  if (time < entry.startTime) return false;
  if (entry.infusion.durationSeconds === Number.POSITIVE_INFINITY) return true;
  return time < entry.startTime + entry.infusion.durationSeconds;
}

/**
 * Resolve the effective element of an attack given active infusions.
 *
 * Pure and deterministic:
 *  1. Filters infusions active at `time` that target `damageType`.
 *  2. If none match, returns `originalElement`.
 *  3. Applies priority rule:
 *     - Non-overridable beats overridable (`canBeOverridden: false` beats `true`).
 *     - More recent beats earlier (`startTime` higher wins).
 *     - Ties broken deterministically by entry index / id.
 */
export function resolveInfusedElement(
  originalElement: Element,
  damageType: DamageType,
  activeInfusions: readonly { infusion: InfusionDefinition; startTime: number }[],
  time: number,
): Element {
  const applicable: {
    infusion: InfusionDefinition;
    startTime: number;
    index: number;
  }[] = [];

  for (let i = 0; i < activeInfusions.length; i++) {
    const entry = activeInfusions[i]!;
    if (!isInfusionActive(entry, time)) continue;

    const targets = entry.infusion.targets ?? DEFAULT_INFUSION_TARGETS;
    if (!targets.includes(damageType)) continue;

    applicable.push({
      infusion: entry.infusion,
      startTime: entry.startTime,
      index: i,
    });
  }

  if (applicable.length === 0) {
    return originalElement;
  }

  // Sort by priority:
  // 1. Non-overridable (canBeOverridden: false) comes first
  // 2. Later startTime comes first
  // 3. Later array index comes first (stable tie-break)
  applicable.sort((a, b) => {
    if (a.infusion.canBeOverridden !== b.infusion.canBeOverridden) {
      return a.infusion.canBeOverridden ? 1 : -1;
    }
    if (b.startTime !== a.startTime) {
      return b.startTime - a.startTime;
    }
    return b.index - a.index;
  });

  return applicable[0]!.infusion.element;
}
