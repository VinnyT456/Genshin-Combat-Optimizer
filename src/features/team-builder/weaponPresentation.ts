import type {
  GeneratedWeapon,
  GeneratedWeaponModifier,
  GeneratedWeaponPassiveBucket,
  GeneratedWeaponRefinement,
} from "@/game-data/weapons/generated";
import type { EquipmentStat } from "@/features/simulation/simulationAdapter";

// ---------------------------------------------------------------------------
// Weapon presentation model — the VERIFIED level/refinement view.
//
// The legacy `WeaponDefinition` collapsed a weapon to ONE point: base ATK and
// substat at level 90, and a passive as a single prose blob with no refinement.
// Rendering that behind a level or refinement control would return the level-90
// number at every level and the R1 text at every refinement — a wrong value
// presented as a chosen one, which is the failure class this project exists to
// avoid.
//
// This module reads `generated/`, where BOTH facts are tables:
//
//   `baseAtkByLevel`             base ATK at each solvable weapon level
//   `substat.valueByLevel`       substat at each solvable weapon level
//   `passive.refinements[]`      per-refinement prose AND numbers
//
// REFINEMENT IS INDEXING, NEVER ARITHMETIC. R3 is looked up; it is never
// derived from R1 by multiplication. The generator emits each refinement's own
// text and its own numbers precisely so no consumer has to guess a progression.
//
// Pure: no React, no DOM, no engine calls. Nothing here computes damage — the
// only arithmetic is selecting a table entry and mapping a stat name onto the
// engine's own vocabulary.
// ---------------------------------------------------------------------------

/** Refinement levels a weapon passive can be owned at. */
export const REFINEMENTS = [1, 2, 3, 4, 5] as const;
export type Refinement = (typeof REFINEMENTS)[number];

/** Lowest weapon level the game allows. */
export const MIN_WEAPON_LEVEL = 1;

export function isRefinement(value: number): value is Refinement {
  return REFINEMENTS.includes(value as Refinement);
}

/**
 * The levels this weapon actually has a solvable base ATK for, ascending.
 *
 * Derived from the DATA, not from a hardcoded 1..90 range: low-rarity weapons
 * cap at 70, and the generator omits any level whose curve solution failed
 * rather than interpolating one. A selector built on an assumed range would
 * offer levels this weapon has no verified number for.
 */
export function weaponLevels(weapon: GeneratedWeapon): readonly number[] {
  return Object.keys(weapon.baseAtkByLevel)
    .map(Number)
    .sort((a, b) => a - b);
}

/** Highest level this weapon has a verified base ATK for. */
export function maxWeaponLevel(weapon: GeneratedWeapon): number {
  const levels = weaponLevels(weapon);
  return levels[levels.length - 1] ?? MIN_WEAPON_LEVEL;
}

/**
 * Snaps a requested level onto one this weapon actually publishes.
 *
 * Returns the highest available level at or below the request, so a user who
 * had a 90 selected and switches to a 70-capped weapon lands on 70 instead of
 * on a level with no data. Falls back to the lowest available level when the
 * request is below the whole table.
 */
export function clampWeaponLevel(weapon: GeneratedWeapon, level: number): number {
  const levels = weaponLevels(weapon);
  if (levels.length === 0) return MIN_WEAPON_LEVEL;
  let best = levels[0]!;
  for (const candidate of levels) {
    if (candidate <= level) best = candidate;
  }
  return best;
}

/**
 * A weapon's substat at one level.
 *
 * `null` covers TWO genuinely different facts, and the caller is told which:
 * a weapon with no secondary stat at all, and a weapon whose substat table has
 * no entry at this level. 138 weapons are missing substat values at levels
 * 40–44 because the generator could not solve those points and omitted them
 * rather than inventing them. Returning a silent 0 for either case would
 * render a missing number as a real one.
 */
export interface WeaponSubstatAtLevel {
  readonly stat: EquipmentStat["stat"];
  readonly value: number;
}

export type WeaponSubstatLookup =
  | { readonly kind: "none" }
  | { readonly kind: "unavailable-at-level" }
  | { readonly kind: "value"; readonly substat: WeaponSubstatAtLevel };

export function substatAtLevel(
  weapon: GeneratedWeapon,
  level: number,
): WeaponSubstatLookup {
  if (!weapon.substat) return { kind: "none" };
  const value = weapon.substat.valueByLevel[level];
  if (value === undefined) return { kind: "unavailable-at-level" };
  return { kind: "value", substat: { stat: weapon.substat.stat, value } };
}

/** A weapon's base ATK at one level, or `null` when that level is unsolved. */
export function baseAtkAtLevel(
  weapon: GeneratedWeapon,
  level: number,
): number | null {
  return weapon.baseAtkByLevel[level] ?? null;
}

/**
 * The passive row for one refinement, selected by INDEXING the emitted table.
 *
 * Returns `null` when the weapon has no passive, or when this refinement is
 * absent — some passives publish a single row rather than five, and answering
 * "R5" with the R1 row would overstate a weapon the user does not own at R5.
 */
export function refinementRow(
  weapon: GeneratedWeapon,
  refinement: Refinement,
): GeneratedWeaponRefinement | null {
  const rows = weapon.passive?.refinements;
  if (!rows || rows.length === 0) return null;
  return rows.find((row) => row.refinement === refinement) ?? null;
}

/** Refinements this weapon's passive actually publishes, ascending. */
export function availableRefinements(
  weapon: GeneratedWeapon,
): readonly Refinement[] {
  const rows = weapon.passive?.refinements ?? [];
  return rows
    .map((row) => row.refinement)
    .filter(isRefinement)
    .sort((a, b) => a - b);
}

/**
 * How a passive row should be PRESENTED.
 *
 * One-to-one with the generator's own bucket vocabulary; this module does not
 * invent a fourth state or promote one bucket into another. `simulated` is the
 * only value that claims the effect reaches the engine.
 */
export type WeaponPassiveDisplayKind =
  /** Maps onto the buff vocabulary — structured effects are shown. */
  | "simulated"
  /** Sourced numbers exist, but no channel carries them. Text only. */
  | "not-simulated"
  /** No readable number, or the two sources disagreed. Text only. */
  | "unverified";

export function displayKindOf(
  bucket: GeneratedWeaponPassiveBucket,
): WeaponPassiveDisplayKind {
  switch (bucket) {
    case "expressible":
      return "simulated";
    case "unimplemented":
      return "not-simulated";
    case "unverified":
      return "unverified";
  }
}

/**
 * A single structured stat grant, ready to render.
 *
 * `damageTypes` IS CARRIED THROUGH, deliberately. It is the scope the grant is
 * confined to; dropping it turns Rust's Normal-Attack-only +40% into a global
 * bonus and would inflate every other hit in a rotation. It is passed along
 * unchanged rather than summarised, so the renderer states the scope the source
 * states.
 */
export type WeaponModifierView = GeneratedWeaponModifier;

/** A passive resolved at one refinement, in the shape the UI renders. */
export interface WeaponPassiveView {
  readonly name: string;
  readonly refinement: Refinement;
  readonly kind: WeaponPassiveDisplayKind;
  /** The source prose at THIS refinement. Always present. */
  readonly text: string;
  /** Why the effect is not simulated. Absent when `kind === "simulated"`. */
  readonly reason?: string;
  readonly modifiers: readonly WeaponModifierView[];
  readonly conversions: GeneratedWeaponRefinement["conversions"];
  readonly enemyModifiers: GeneratedWeaponRefinement["enemyModifiers"];
  /** True when this weapon publishes only one row for every refinement. */
  readonly singleRow: boolean;
}

export function buildPassiveView(
  weapon: GeneratedWeapon,
  refinement: Refinement,
): WeaponPassiveView | null {
  const passive = weapon.passive;
  if (!passive) return null;
  const rows = passive.refinements;
  if (rows.length === 0) return null;
  const singleRow = rows.length === 1;
  // A single-row passive is the same statement at every refinement, so it is
  // shown for the selected refinement. A multi-row passive is INDEXED; a
  // missing row is reported as missing rather than substituted from R1.
  const row = singleRow ? rows[0]! : refinementRow(weapon, refinement);
  if (!row) return null;
  return {
    name: passive.name,
    refinement,
    kind: displayKindOf(row.bucket),
    text: row.text,
    ...(row.reason === undefined ? {} : { reason: row.reason }),
    modifiers: row.modifiers,
    conversions: row.conversions,
    enemyModifiers: row.enemyModifiers,
    singleRow,
  };
}

/**
 * A weapon resolved at the user's chosen level and refinement.
 *
 * Every number here is a table lookup at the SELECTED point. Nothing is a
 * level-90 stand-in, and every absent value is an explicit absence the renderer
 * can label rather than a zero.
 */
export interface ResolvedWeaponView {
  readonly weapon: GeneratedWeapon;
  readonly level: number;
  readonly maxLevel: number;
  readonly baseAtk: number | null;
  readonly substat: WeaponSubstatLookup;
  readonly passive: WeaponPassiveView | null;
  /** Per-field caveats the generator could not confirm. */
  readonly unverified: GeneratedWeapon["unverified"];
}

export function resolveWeaponView(
  weapon: GeneratedWeapon,
  level: number,
  refinement: Refinement,
): ResolvedWeaponView {
  const clamped = clampWeaponLevel(weapon, level);
  return {
    weapon,
    level: clamped,
    maxLevel: maxWeaponLevel(weapon),
    baseAtk: baseAtkAtLevel(weapon, clamped),
    substat: substatAtLevel(weapon, clamped),
    passive: buildPassiveView(weapon, refinement),
    unverified: weapon.unverified,
  };
}
