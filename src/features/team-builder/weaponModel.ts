import type { Stats } from "@/types";
import type { WeaponDefinition, WeaponRarity, WeaponType } from "@/game-data/weapons/types";
import {
  applyEquipment,
  type EquipmentStat,
} from "@/features/simulation/simulationAdapter";
import {
  findWeaponBaseAtkAtLevel,
  findWeaponStatsAtLevel,
} from "@/game-data/weapons/registry";
import { DEFAULT_WEAPON_LEVEL } from "@/features/team-builder/equipmentSelection";

export type WeaponRarityFilter = "all" | WeaponRarity;

export interface WeaponFilterState {
  readonly weaponType: "all" | WeaponType;
  readonly rarity: WeaponRarityFilter;
  readonly query: string;
}

export function filterWeapons(
  weapons: readonly WeaponDefinition[],
  filters: WeaponFilterState,
): readonly WeaponDefinition[] {
  const q = filters.query.trim().toLowerCase();

  return weapons
    .filter((w) => {
      // 1. Weapon Type
      if (filters.weaponType !== "all" && w.weaponType !== filters.weaponType) {
        return false;
      }

      // 2. Rarity
      if (filters.rarity !== "all" && w.rarity !== filters.rarity) {
        return false;
      }

      // 3. Search query
      if (q) {
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesZh = w.nameZh.toLowerCase().includes(q);
        const matchesSub = w.subStat.labelZh.toLowerCase().includes(q);
        const matchesPassive =
          w.passive?.name.toLowerCase().includes(q) ||
          w.passive?.desc.toLowerCase().includes(q);
        if (!matchesName && !matchesZh && !matchesSub && !matchesPassive) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 1. Rarity first: 5★ before 4★
      if (a.rarity !== b.rarity) return b.rarity - a.rarity;

      // 2. Latest to earliest within rarity (v7.0 -> Luna -> v5.x -> ... -> v1.0)
      const wA = a.versionWeight ?? 100;
      const wB = b.versionWeight ?? 100;
      if (wA !== wB) return wB - wA;

      // 3. Higher base ATK first
      if (a.baseAtk !== b.baseAtk) return b.baseAtk - a.baseAtk;
      return a.nameZh.localeCompare(b.nameZh, "zh-CN");
    });
}

/**
 * Maps a UI weapon substat onto the engine's equipment-stat vocabulary.
 *
 * Returns `null` for `none` (weapons that genuinely have no substat), so the
 * caller grants nothing rather than inventing a zero-valued stat.
 */
function toEquipmentStat(subStat: WeaponDefinition["subStat"]): EquipmentStat | null {
  const { type, value } = subStat;
  switch (type) {
    case "none":
      return null;
    // The engine has no physical-specific channel; physical DMG% is the
    // generic DMG% bonus, which is what the engine's `dmgBonus` means.
    case "physicalDmg":
      return { stat: "dmgBonus", value };
    default:
      return { stat: type, value };
  }
}

/**
 * Computes updated character stats when a weapon is equipped.
 *
 * Delegates ALL arithmetic to the engine via the adapter. The previous local
 * implementation applied ATK% to the already-final ATK, but in game every
 * percentage scales BASE ATK (character base + weapon base) — an error that
 * inflates the number and compounds with each additional percentage source.
 * It also substituted invented `?? 15000` HP / `?? 800` DEF defaults when a
 * stat was missing; a guessed constant rendered as a real number is exactly
 * the failure mode this project has been burned by, so no default is supplied
 * here. A stat the character does not have simply stays absent.
 */
export function applyWeaponStats(
  baseStats: Stats,
  weapon: WeaponDefinition,
  weaponLevel = DEFAULT_WEAPON_LEVEL,
): Stats {
  // Generated weapons carry exact per-level values. Synthetic test weapons
  // keep using their catalog values, which represent level 90.
  const sourced = findWeaponStatsAtLevel(weapon.id, weaponLevel);
  const generatedBaseAtk = findWeaponBaseAtkAtLevel(weapon.id, weaponLevel);
  const baseAtk =
    sourced?.baseAtk ??
    generatedBaseAtk ??
    weapon.baseAtk;
  // A known generated weapon with a missing substat row must omit that
  // secondary stat. Unknown synthetic fixtures have no generated curve, so
  // retain their authored catalog substat for backwards-compatible tests and
  // custom definitions.
  const substat = sourced
    ? toEquipmentStat(sourced.subStat)
    : generatedBaseAtk === undefined
      ? toEquipmentStat(weapon.subStat)
      : null;
  return applyEquipment(baseStats, {
    weapon: {
      baseAtk,
      ...(substat === null ? {} : { substat }),
    },
  }).stats;
}
