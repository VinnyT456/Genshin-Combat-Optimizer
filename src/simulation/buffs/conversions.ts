import type { Stats } from "@/types";
import type {
  ActiveBuff,
  BaseStatValues,
  StatConversionModifier,
} from "@/simulation/buffs/types";

// ============================================================================
// Stat Conversions.
//
// Models dynamic stat conversion passives and abilities (Hu Tao HP -> ATK,
// Noelle DEF -> ATK, Raiden ER -> Electro DMG, Cyno/Tighnari EM -> DMG, etc.)
// purely and deterministically.
//
// Genshin stat conversion rule:
//   convertedValue = Math.min(maxCap ?? Infinity, Math.max(0, (sourceValue - (threshold ?? 0))) * ratio)
//
// In Genshin, stat conversions are evaluated after direct stat bonuses
// (flat and percent) are folded. Crucially, converted stats do not feed further
// conversions (they do not recurse or loop).
// ============================================================================

/**
 * Compute the converted scalar value for a single stat conversion definition.
 *
 * Pure formula:
 *   convertedValue = Math.min(maxCap ?? Infinity, Math.max(0, (sourceValue - (threshold ?? 0))) * (ratio * stacks))
 */
export function computeStatConversion(
  sourceValue: number,
  conversion: StatConversionModifier,
  stacks: number = 1,
): number {
  if (!Number.isFinite(sourceValue)) {
    return 0;
  }
  const threshold = conversion.threshold ?? 0;
  const effectiveRatio = conversion.ratio * stacks;
  const aboveThreshold = Math.max(0, sourceValue - threshold);
  const rawConverted = aboveThreshold * effectiveRatio;
  const cap = conversion.maxCap ?? Number.POSITIVE_INFINITY;
  return Math.min(cap, rawConverted);
}

/**
 * Fold a converted value into the appropriate channel on a mutable copy of `Stats`.
 */
function foldConvertedValueIntoStats(
  target: Stats,
  conversion: StatConversionModifier,
  convertedValue: number,
  baseValues: BaseStatValues,
): void {
  if (convertedValue === 0) return;

  switch (conversion.targetStat) {
    case "atkFlat":
      target.atk += convertedValue;
      break;
    case "hpFlat":
      target.hp += convertedValue;
      break;
    case "defFlat":
      target.def += convertedValue;
      break;
    case "atkPercent":
      if (baseValues.atk !== undefined) {
        target.atk += baseValues.atk * convertedValue;
      }
      break;
    case "hpPercent":
      if (baseValues.hp !== undefined) {
        target.hp += baseValues.hp * convertedValue;
      }
      break;
    case "defPercent":
      if (baseValues.def !== undefined) {
        target.def += baseValues.def * convertedValue;
      }
      break;
    case "elementalMastery":
      target.elementalMastery += convertedValue;
      break;
    case "critRate":
      target.critRate += convertedValue;
      break;
    case "critDmg":
      target.critDmg += convertedValue;
      break;
    case "energyRecharge":
      target.energyRecharge += convertedValue;
      break;
    case "dmgBonus":
      target.dmgBonus += convertedValue;
      break;
    case "flatDamageBonus":
      target.flatDamageBonus = (target.flatDamageBonus ?? 0) + convertedValue;
      break;
    case "elementalDmgBonus":
      if (conversion.element !== undefined) {
        const current = target.elementalDmgBonus[conversion.element] ?? 0;
        target.elementalDmgBonus[conversion.element] = current + convertedValue;
      }
      break;
  }
}

/**
 * Apply a list of stat conversions to a `Stats` object.
 *
 * Pure: returns a fresh `Stats` object with a shallow-copied `elementalDmgBonus` map;
 * `stats` is never mutated.
 */
export function applyStatConversions(
  stats: Stats,
  conversions: readonly { conversion: StatConversionModifier; stacks?: number }[],
  baseValues: BaseStatValues = {},
): Stats {
  if (conversions.length === 0) {
    return {
      ...stats,
      elementalDmgBonus: { ...stats.elementalDmgBonus },
    };
  }

  const result: Stats = {
    ...stats,
    elementalDmgBonus: { ...stats.elementalDmgBonus },
  };

  for (const { conversion, stacks = 1 } of conversions) {
    const sourceValue = stats[conversion.sourceStat];
    const convertedValue = computeStatConversion(sourceValue, conversion, stacks);
    foldConvertedValueIntoStats(result, conversion, convertedValue, baseValues);
  }

  return result;
}

/**
 * Extract and apply all stat conversions from a set of active buffs.
 *
 * Source stats are read from `stats` (which should already have direct modifiers
 * applied), and converted values are folded into target channels.
 */
export function applyActiveConversions(
  stats: Stats,
  active: readonly ActiveBuff[],
  baseValues: BaseStatValues = {},
): Stats {
  const activeConversions: { conversion: StatConversionModifier; stacks: number }[] = [];

  for (const { buff, stacks } of active) {
    if (buff.conversions && buff.conversions.length > 0) {
      for (const conversion of buff.conversions) {
        activeConversions.push({ conversion, stacks });
      }
    }
  }

  if (activeConversions.length === 0) {
    return stats;
  }

  return applyStatConversions(stats, activeConversions, baseValues);
}
