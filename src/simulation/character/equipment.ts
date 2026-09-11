import type { BaseStats, Element, Stats } from "@/types";
import { foldStatChannel, withBaseStats } from "@/types";

// ============================================================================
// EQUIPMENT STAT MODEL — weapons and artifacts.
//
// This module answers exactly one question: given a character's intrinsic base
// stats plus the gear they are wearing, what is the resolved `Stats` bag the
// damage pipeline should read?
//
// It is DELIBERATELY SPLIT from set bonuses and weapon passives:
//
//   STAT MODEL (here)          deterministic arithmetic. Base ATK, main stats,
//                              substats. No conditions, no time, no state.
//   CONDITIONAL EFFECTS        weapon passives, artifact 2pc/4pc set bonuses,
//   (NOT here)                 and constellations are the SAME idea — an
//                              effect that is live under some condition — and
//                              are expressed as `Buff` data for the existing
//                              declarative buff system in
//                              `src/simulation/buffs`. There is no second
//                              mechanism here, and there must never be: three
//                              implementations of one idea is precisely what
//                              the project forbids.
//
// A permanently-on set bonus (e.g. a flat "+18% ATK" 2pc) is just a `Buff` with
// `duration: Number.POSITIVE_INFINITY` and no conditions. It therefore flows
// through the same resolver, ordering and stacking rules as everything else.
//
// DETERMINISM: no RNG anywhere. Substat ROLLS ARE NOT MODELLED — artifacts are
// AUTHORED stat values. Randomised roll generation, if ever wanted, belongs in
// a generator OUTSIDE the simulation path, because the optimizer's beam search
// requires byte-identical results for identical inputs.
//
// NO GAME DATA LIVES HERE. This file defines SHAPES and ARITHMETIC only; every
// concrete weapon/artifact value is data owned by `src/game-data`.
// ============================================================================

// ---------------------------------------------------------------------------
// Stat channels equipment can supply
// ---------------------------------------------------------------------------

/**
 * A stat an artifact main stat / substat or a weapon substat can grant.
 *
 * Mirrors the buff layer's `StatKey` channel split for the same reason: the
 * percentage channels scale BASE and the flat channels do not, so they can
 * never be merged into one key.
 *
 * Declared here rather than imported from `src/simulation/buffs` because that
 * layer sits ABOVE this one — `src/simulation/character` must not import
 * upward. The two are structurally compatible on purpose.
 */
export type EquipmentStatKey =
  // Percentage channels — scale BASE ATK/HP/DEF.
  | "atkPercent"
  | "hpPercent"
  | "defPercent"
  // Flat channels — added after percentages.
  | "atkFlat"
  | "hpFlat"
  | "defFlat"
  // Additive-fraction stats. No percentage/flat split exists for these in game.
  | "elementalMastery"
  | "critRate"
  | "critDmg"
  | "energyRecharge"
  /** Generic DMG% bonus. */
  | "dmgBonus"
  /** Per-element DMG% bonus. REQUIRES `element`. */
  | "elementalDmgBonus";

/** One stat grant from a piece of equipment. */
export interface EquipmentStat {
  stat: EquipmentStatKey;
  /**
   * Magnitude. Percentages and fractions are expressed as fractions
   * (0.466 == +46.6%), flats in raw points (311 == +311 ATK).
   */
  value: number;
  /** Required when `stat === "elementalDmgBonus"`; ignored otherwise. */
  element?: Element;
}

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

/**
 * A weapon's contribution to the STAT MODEL.
 *
 * Two parts, and only two:
 *  - `baseAtk`  adds to BASE ATK, so every ATK% in the build scales it. This
 *               is why the base/final split had to land first: a weapon's base
 *               ATK is roughly a third of a build's base ATK, and applying
 *               ATK% without it understates ATK badly.
 *  - `substat`  the weapon's secondary stat, usually a percentage.
 *
 * The weapon's PASSIVE is not here. It is a conditional effect and is authored
 * as `Buff` data — the same seam artifact set bonuses and constellations use.
 * Refinement is expressed by authoring the buff's magnitude for the owned
 * refinement, not by a code branch.
 */
export interface WeaponStats {
  /** Weapon base ATK at its current level. Added to BASE ATK. */
  baseAtk: number;
  /** Secondary stat. Absent for the handful of weapons that have none. */
  substat?: EquipmentStat;
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

/**
 * The five artifact slots.
 *
 * Flower and Plume always roll FLAT HP and FLAT ATK respectively in game; the
 * other three have variable main stats. That constraint is data, not enforced
 * here, so an unusual or future piece stays expressible.
 */
export type ArtifactSlot =
  | "flower"
  | "plume"
  | "sands"
  | "goblet"
  | "circlet";

/** Deterministic slot order, so iteration can never depend on object key order. */
export const ARTIFACT_SLOTS: readonly ArtifactSlot[] = [
  "flower",
  "plume",
  "sands",
  "goblet",
  "circlet",
] as const;

/**
 * One artifact piece.
 *
 * `substats` are AUTHORED VALUES, not rolls. There is deliberately no roll
 * count, no roll quality and no RNG: the simulation path must be deterministic.
 */
export interface ArtifactPiece {
  slot: ArtifactSlot;
  /**
   * Set identifier, used to count pieces for 2pc/4pc bonuses. Matches the id
   * the corresponding set-bonus `Buff` data is keyed by.
   */
  setId: string;
  mainStat: EquipmentStat;
  /** Substats, as authored values. Order does not affect the result (sum). */
  substats: readonly EquipmentStat[];
}

/** A full or partial artifact loadout. Missing slots are simply absent. */
export type ArtifactLoadout = Partial<Record<ArtifactSlot, ArtifactPiece>>;

/**
 * Equipped gear for one character.
 *
 * Both fields optional so an ungeared character — the state of every existing
 * fixture — is expressible and behaves exactly as before.
 */
export interface Equipment {
  weapon?: WeaponStats;
  artifacts?: ArtifactLoadout;
}

// ---------------------------------------------------------------------------
// Set counting
// ---------------------------------------------------------------------------

/** Minimum pieces for the two set-bonus tiers Genshin defines. */
export const TWO_PIECE_THRESHOLD = 2;
export const FOUR_PIECE_THRESHOLD = 4;

/**
 * Counts equipped pieces per set id.
 *
 * Iterates {@link ARTIFACT_SLOTS} in fixed order and returns a plain record.
 * Deterministic: the counts do not depend on object key insertion order.
 */
export function countSetPieces(
  loadout: ArtifactLoadout | undefined,
): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!loadout) return counts;
  for (const slot of ARTIFACT_SLOTS) {
    const piece = loadout[slot];
    if (!piece) continue;
    counts[piece.setId] = (counts[piece.setId] ?? 0) + 1;
  }
  return counts;
}

/**
 * Which set-bonus tiers are active, as `${setId}:2` / `${setId}:4` keys.
 *
 * This is the ONLY thing the stat model says about set bonuses: which are
 * ACTIVE. What each one DOES is `Buff` data resolved by the mechanics layer.
 * Keeping the two apart is what stops set bonuses becoming a second buff
 * mechanism.
 *
 * A 4-piece set yields BOTH its 2pc and its 4pc key, matching the game.
 * Returned sorted so the result is order-stable for hashing/memoisation.
 */
export function activeSetBonusKeys(
  loadout: ArtifactLoadout | undefined,
): readonly string[] {
  const counts = countSetPieces(loadout);
  const keys: string[] = [];
  for (const setId of Object.keys(counts).sort()) {
    const count = counts[setId] ?? 0;
    if (count >= TWO_PIECE_THRESHOLD) keys.push(`${setId}:${TWO_PIECE_THRESHOLD}`);
    if (count >= FOUR_PIECE_THRESHOLD) keys.push(`${setId}:${FOUR_PIECE_THRESHOLD}`);
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Folding equipment into stats
// ---------------------------------------------------------------------------

/** Per-channel accumulator. Mirrors the buff resolver's totals, by design. */
interface EquipmentTotals {
  atkPercent: number;
  atkFlat: number;
  hpPercent: number;
  hpFlat: number;
  defPercent: number;
  defFlat: number;
  elementalMastery: number;
  critRate: number;
  critDmg: number;
  energyRecharge: number;
  dmgBonus: number;
  elementalDmgBonus: Partial<Record<Element, number>>;
}

function emptyTotals(): EquipmentTotals {
  return {
    atkPercent: 0,
    atkFlat: 0,
    hpPercent: 0,
    hpFlat: 0,
    defPercent: 0,
    defFlat: 0,
    elementalMastery: 0,
    critRate: 0,
    critDmg: 0,
    energyRecharge: 0,
    dmgBonus: 0,
    elementalDmgBonus: {},
  };
}

function addStat(totals: EquipmentTotals, entry: EquipmentStat): void {
  if (entry.stat === "elementalDmgBonus") {
    // An elemental DMG% grant naming no element is malformed data. Ignore it
    // rather than guessing which element was meant.
    if (entry.element === undefined) return;
    const current = totals.elementalDmgBonus[entry.element] ?? 0;
    totals.elementalDmgBonus[entry.element] = current + entry.value;
    return;
  }
  totals[entry.stat] += entry.value;
}

/**
 * Sums every stat grant from a set of equipment.
 *
 * Pure fold; addition is commutative so the result does not depend on
 * iteration order beyond floating-point associativity, and slots are walked in
 * the fixed {@link ARTIFACT_SLOTS} order to keep even that reproducible.
 *
 * NOTE: `weapon.baseAtk` is NOT summed here — it belongs to BASE ATK, not to
 * the flat-ATK channel, and is handled by {@link resolveEquippedStats}.
 * Treating it as flat ATK would exclude it from ATK% scaling and understate
 * ATK on every build.
 */
export function sumEquipmentStats(equipment: Equipment): EquipmentTotals {
  const totals = emptyTotals();

  if (equipment.weapon?.substat) addStat(totals, equipment.weapon.substat);

  const loadout = equipment.artifacts;
  if (loadout) {
    for (const slot of ARTIFACT_SLOTS) {
      const piece = loadout[slot];
      if (!piece) continue;
      addStat(totals, piece.mainStat);
      for (const sub of piece.substats) addStat(totals, sub);
    }
  }

  return totals;
}

/** Result of resolving gear onto a character's intrinsic stats. */
export interface ResolvedEquippedStats {
  /** Final stat bag, with the BASE channel attached. */
  stats: Stats;
  /** The base ATK/HP/DEF that percentages were scaled against. */
  base: BaseStats;
  /** Active set-bonus keys, for the mechanics layer to resolve into buffs. */
  setBonusKeys: readonly string[];
}

/**
 * Resolve a character's intrinsic stats plus equipment into a final stat bag.
 *
 * ORDER (this is the canonical Genshin stat formula and is fixed):
 *
 *   1. BASE ATK  = character base ATK + weapon base ATK
 *      BASE HP   = character base HP
 *      BASE DEF  = character base DEF
 *   2. For each of ATK/HP/DEF:  final = base * (1 + sum(pct)) + sum(flat)
 *   3. Additive stats (EM, Crit Rate, Crit DMG, ER, DMG%): incoming + sum
 *   4. Per-element DMG%: merged onto the incoming map
 *
 * `characterStats` must be the character's INTRINSIC stats — no gear folded in.
 * Its `atk`/`hp`/`def` are read as base values, which is correct by definition
 * for an ungeared character.
 *
 * The returned bag carries `base`, so any buff resolved later (a set bonus, a
 * weapon passive, an in-combat ATK% aura) scales the correct base rather than
 * being skipped or applied to final.
 *
 * PURE: never mutates its arguments.
 */
export function resolveEquippedStats(
  characterStats: Stats,
  equipment: Equipment = {},
): ResolvedEquippedStats {
  const totals = sumEquipmentStats(equipment);

  // 1. Weapon base ATK joins BASE ATK, so ATK% scales it too.
  const base: BaseStats = {
    atk: characterStats.atk + (equipment.weapon?.baseAtk ?? 0),
    hp: characterStats.hp,
    def: characterStats.def,
  };

  // 2. base * (1 + pct) + flat, per channel.
  const atk = foldStatChannel(base.atk, base.atk, totals.atkPercent, totals.atkFlat);
  const hp = foldStatChannel(base.hp, base.hp, totals.hpPercent, totals.hpFlat);
  const def = foldStatChannel(base.def, base.def, totals.defPercent, totals.defFlat);

  // 4. Per-element DMG% merges onto whatever the character already had.
  const elementalDmgBonus: Partial<Record<Element, number>> = {
    ...characterStats.elementalDmgBonus,
  };
  for (const element of Object.keys(totals.elementalDmgBonus).sort() as Element[]) {
    const bonus = totals.elementalDmgBonus[element] ?? 0;
    elementalDmgBonus[element] = (elementalDmgBonus[element] ?? 0) + bonus;
  }

  const stats: Stats = withBaseStats(
    {
      ...characterStats,
      atk: atk.value,
      hp: hp.value,
      def: def.value,
      // 3. Additive-fraction stats.
      elementalMastery: characterStats.elementalMastery + totals.elementalMastery,
      critRate: characterStats.critRate + totals.critRate,
      critDmg: characterStats.critDmg + totals.critDmg,
      energyRecharge: characterStats.energyRecharge + totals.energyRecharge,
      dmgBonus: characterStats.dmgBonus + totals.dmgBonus,
      elementalDmgBonus,
    },
    base,
  );

  return {
    stats,
    base,
    setBonusKeys: activeSetBonusKeys(equipment.artifacts),
  };
}

/**
 * Adds artifact stats to an already-resolved panel.
 *
 * The website stores weapon-resolved stats on the character while artifact
 * pieces live in the equipment selection. This helper applies only the new
 * artifact grants, scaling percentage channels from the existing BASE split,
 * so weapon ATK is preserved and never folded twice.
 */
export function applyArtifactStatsToResolvedStats(
  stats: Stats,
  artifacts: ArtifactLoadout | undefined,
): Stats {
  if (!artifacts) return stats;
  const totals = sumEquipmentStats({ artifacts });
  const base = stats.base ?? { atk: stats.atk, hp: stats.hp, def: stats.def };
  const next = withBaseStats(
    {
      ...stats,
      atk: foldStatChannel(stats.atk, base.atk, totals.atkPercent, totals.atkFlat).value,
      hp: foldStatChannel(stats.hp, base.hp, totals.hpPercent, totals.hpFlat).value,
      def: foldStatChannel(stats.def, base.def, totals.defPercent, totals.defFlat).value,
      elementalMastery: stats.elementalMastery + totals.elementalMastery,
      critRate: stats.critRate + totals.critRate,
      critDmg: stats.critDmg + totals.critDmg,
      energyRecharge: stats.energyRecharge + totals.energyRecharge,
      dmgBonus: stats.dmgBonus + totals.dmgBonus,
      elementalDmgBonus: Object.keys(totals.elementalDmgBonus).reduce(
        (map, element) => {
          const key = element as Element;
          map[key] = (map[key] ?? 0) + (totals.elementalDmgBonus[key] ?? 0);
          return map;
        },
        { ...stats.elementalDmgBonus } as Partial<Record<Element, number>>,
      ),
    },
    base,
  );
  return next;
}
