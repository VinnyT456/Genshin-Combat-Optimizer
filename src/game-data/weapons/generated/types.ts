// ============================================================================
// GENERATED FILE -- DO NOT EDIT.
//
// Regenerate with:
//   python3 scripts/generate-weapons/fetch.py
//   python3 scripts/generate-weapons/emit.py
//
// SOURCES (two INDEPENDENT datamined mirrors of the game's own files)
//   primary   Project Amber  https://gi.yatta.moe/api/v2/en/weapon/{id}
//   verifier  Lunaris        https://api.lunaris.moe/data/{version}/en/weapon/{id}.json (version 7.0.54)
//   fetched   2026-09-07T00:19:20Z
//
// Every emitted number is confirmed by BOTH sources. Per-level stats are
// recovered by solving each shared growth curve against the verifier's
// published values and then REPLAYING the solution back through every weapon
// that shares the curve; a level that fails is omitted and reported, never
// interpolated.
//
// Weapon PASSIVES are prose. They are bucketed, not guessed -- see
// `GeneratedWeaponPassiveBucket`. A passive that is not `expressible` carries
// its text and its bucket and NO invented effect.
// ============================================================================

import type { DamageType, Element } from "@/types";
import type { EquipmentStatKey } from "@/simulation/character/equipment";
import type {
  EnemyModifierKey,
  StatConversionSourceStat,
  StatKey,
} from "@/simulation/buffs/types";

/**
 * How much of one weapon passive this generator could express.
 *
 * The SAME three buckets the character generator applies to constellations and
 * passives, produced by the SAME classifier (`scripts/generate-characters/perks.py`).
 * Weapon passives, artifact set bonuses and constellations are one idea, so
 * they get one vocabulary.
 *
 *  `expressible`    maps onto the declarative buff vocabulary.
 *  `unimplemented`  carries sourced numbers, but no channel exists for them.
 *  `unverified`     states no readable number, or the two sources contradict.
 */
export type GeneratedWeaponPassiveBucket =
  | "expressible"
  | "unimplemented"
  | "unverified";

/**
 * A stat grant read out of a passive's prose, with the scope it is confined to.
 *
 * TYPED AGAINST THE SIMULATION, NOT `string`. `stat` is the engine's own
 * `StatKey` and `damageTypes` its own `DamageType`, so a generator that starts
 * emitting a channel the buff system does not have becomes a TYPECHECK FAILURE
 * here rather than a value that is silently ignored at runtime.
 *
 * SCOPE IS PART OF THE VALUE. `damageTypes` is the set of damage types the
 * grant applies to; ABSENT means genuinely unscoped (an always-on ATK%), and it
 * is never a "scope unknown" sentinel -- a clause whose scope could not be
 * resolved is not emitted at all. A consumer MUST carry this onto the buff's
 * `conditions.damageTypes`: dropping it turns Rust's Normal-Attack-only +40%
 * into a global one and inflates every other hit in the rotation.
 */
export interface GeneratedWeaponModifier {
  readonly stat: StatKey;
  readonly value: number;
  /** Required when `stat === "elementalDmgBonus"`; absent otherwise. */
  readonly element?: Element;
  /** Damage types this grant is confined to. Absent means unscoped. */
  readonly damageTypes?: readonly DamageType[];
}

/**
 * A "X% of stat A becomes stat B" clause read out of a passive's prose.
 *
 * `damageTypes` scopes the conversion's OUTPUT exactly as it does for a
 * modifier: Redhorn Stonethresher converts DEF into a damage bonus that applies
 * only to Normal and Charged attacks.
 */
export interface GeneratedWeaponConversion {
  readonly sourceStat: StatConversionSourceStat;
  readonly targetStat: StatKey;
  readonly ratio: number;
  readonly maxCap?: number;
  /** Damage types the converted bonus is confined to. Absent means unscoped. */
  readonly damageTypes?: readonly DamageType[];
}

/**
 * An enemy-side debuff (DEF / RES shred) read out of a passive's prose.
 *
 * Emitted because several weapons state one plainly. NOTE that the engine
 * declares `EnemyModifier` but nothing consumes it yet (see the UNSUPPORTED
 * note in `src/simulation/buffs/types.ts`) -- so a row carrying one of these is
 * bucketed on its own merits and the shred rides along as sourced data rather
 * than as a wired effect.
 */
export interface GeneratedWeaponEnemyModifier {
  readonly key: EnemyModifierKey;
  readonly value: number;
  /** Required when `key === "resReduction"`; absent otherwise. */
  readonly element?: Element;
}

/**
 * One refinement level of a weapon passive.
 *
 * REFINEMENT IS DATA, NOT A CODE BRANCH. Each level carries its own prose and
 * its own numbers, so consuming R3 is indexing, never arithmetic on R1.
 */
export interface GeneratedWeaponRefinement {
  readonly refinement: 1 | 2 | 3 | 4 | 5;
  /** The passive's text at this refinement, markup stripped. */
  readonly text: string;
  readonly bucket: GeneratedWeaponPassiveBucket;
  /** Why it is not `expressible`. Absent when it is. */
  readonly reason?: string;
  /** Stat grants, when the prose yielded them. Empty otherwise. */
  readonly modifiers: readonly GeneratedWeaponModifier[];
  /** Stat conversions, when the prose yielded them. Empty otherwise. */
  readonly conversions: readonly GeneratedWeaponConversion[];
  /** Enemy-side shred, when the prose yielded it. Empty otherwise. */
  readonly enemyModifiers: readonly GeneratedWeaponEnemyModifier[];
}

/** A weapon's passive across all five refinement levels. */
export interface GeneratedWeaponPassive {
  readonly name: string;
  readonly refinements: readonly GeneratedWeaponRefinement[];
}

/**
 * A weapon's substat.
 *
 * `valueByLevel` is a table, not a single number: the substat scales with
 * weapon level, and emitting only the level-90 value would silently return the
 * level-90 number at every level -- the exact failure class the TASK #028 audit
 * was called to end.
 *
 * Values are FRACTIONS for percentage stats (0.662 == +66.2%) and raw points
 * for Elemental Mastery, matching `EquipmentStat` in the simulation seam.
 */
export interface GeneratedWeaponSubstat {
  readonly stat: EquipmentStatKey;
  readonly valueByLevel: Readonly<Record<number, number>>;
}

/** One value this run could not confirm, and why. */
export interface GeneratedWeaponUnverifiedField {
  readonly field: string;
  readonly reason: string;
}

/** One weapon, generated and cross-verified. */
export interface GeneratedWeapon {
  readonly id: string;
  readonly name: string;
  readonly weaponType: "sword" | "claymore" | "polearm" | "catalyst" | "bow";
  readonly rarity: 1 | 2 | 3 | 4 | 5;
  /** Base ATK at each weapon level. A missing level was not solvable. */
  readonly baseAtkByLevel: Readonly<Record<number, number>>;
  /** Absent for the handful of weapons that have no secondary stat. */
  readonly substat?: GeneratedWeaponSubstat;
  /** Absent for the low-rarity weapons that have no passive. */
  readonly passive?: GeneratedWeaponPassive;
  /** Per-field caveats. Empty when this run confirmed every emitted value. */
  readonly unverified: readonly GeneratedWeaponUnverifiedField[];
}
