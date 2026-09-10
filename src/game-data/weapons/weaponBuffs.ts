import type { DamageType } from "@/types";
import type {
  Buff,
  EnemyModifier,
  StatConversionModifier,
  StatModifier,
} from "@/simulation/buffs/types";
import type {
  WeaponPassiveBuffs,
  WeaponRefinement,
} from "@/simulation/engine/equipmentBuffs";
import type {
  GeneratedWeapon,
  GeneratedWeaponConversion,
  GeneratedWeaponEnemyModifier,
  GeneratedWeaponModifier,
  GeneratedWeaponRefinement,
} from "./generated";
import { generatedWeaponsById } from "./generated";

// ============================================================================
// Generated weapon data -> `Buff` objects.
//
// THE GAP THIS CLOSES. `src/simulation/engine/equipmentBuffs.ts` harvests
// already-authored `Buff` objects for the owned refinement and composes them
// into the damage pipeline. The generator, correctly, does NOT emit `Buff`s: it
// emits its OWN sourced shape (`GeneratedWeaponModifier` /
// `...Conversion` / `...EnemyModifier`), because a generator that emitted
// engine types would couple the datamining pipeline to the simulation's
// internals. This module is the one seam between the two, and it lives in
// `src/game-data` because it is the DATA shape's translation, not an engine
// rule.
//
// It is pure, total and deterministic: same generated input, byte-identical
// `Buff` output, every array walked in a fixed order. Nothing here fetches,
// caches, or reads a clock.
//
// ---------------------------------------------------------------------------
// THE THREE RULES THIS MODULE ENFORCES
// ---------------------------------------------------------------------------
//
// 1. ONLY `expressible` BECOMES A BUFF.
//    A row bucketed `unimplemented` carries real, sourced numbers whose GATING
//    the vocabulary cannot state ("for 10s after using an Elemental Skill",
//    "when HP is below 70%"). Emitting one as a permanent buff would apply a
//    conditional passive at 100% uptime -- a plausible number that is simply
//    too big, which `docs/ROADMAP.md` 0 ranks as worse than a missing one.
//    An `unverified` row states no number this pipeline could read at all.
//    Both are skipped, silently and by construction, not filtered by a
//    hand-maintained allowlist.
//
// 2. `damageTypes` IS LOAD-BEARING AND IS CARRIED, NEVER DROPPED.
//    The generated modifier's `damageTypes` is the scope the grant is confined
//    to. `Buff` states scope on `conditions.damageTypes`, which is per-BUFF and
//    not per-modifier -- so a refinement row whose grants have DIFFERENT scopes
//    must become SEVERAL buffs, one per distinct scope. Rust is exactly this
//    shape: -10% Charged and +40% Normal in one row. Folding them into one
//    unconditioned buff would hand +40% to every Burst in the rotation.
//
// 3. FAIL CLOSED ON REFINEMENT.
//    A refinement level the generator did not emit yields NO entry, so
//    `harvestWeaponPassiveBuffs()` returns nothing for it. It never falls back
//    to R1: an R5 weapon quietly simulating as R1 is a wrong damage number that
//    a test asserting only "the passive applies" would still pass.
//
// ---------------------------------------------------------------------------
// WHY SCOPE GROUPING, AND WHY IT IS SAFE
// ---------------------------------------------------------------------------
// Splitting one refinement row into several buffs is not an approximation: the
// buff resolver sums every ACTIVE buff's modifiers, and two buffs with disjoint
// `conditions.damageTypes` are never both active for one hit. One buff per
// scope therefore reproduces exactly the per-modifier scoping the generated
// data states, using only the vocabulary that already exists.
//
// Each split buff gets its own `id` (scope-suffixed), because `Buff.id` is the
// STACKING identity: two same-id buffs would collapse under `refresh`.
// ============================================================================

/** The bucket whose rows map onto the buff vocabulary with nothing invented. */
const EXPRESSIBLE_BUCKET = "expressible";

/** Weapon passives are permanently on once equipped; conditionality is scope. */
const PERMANENT_DURATION = Number.POSITIVE_INFINITY;

/** Simulation time at which an always-on equipment buff becomes active. */
const EQUIPMENT_BUFF_START_TIME = 0;

/**
 * A refinement row's grants, grouped by the damage-type scope they share.
 *
 * The key is the scope rendered as a stable string; `UNSCOPED_KEY` is the
 * genuinely unscoped group (an always-on ATK%), which is NOT the same thing as
 * "scope unknown" -- the generator never emits a clause whose scope it could
 * not resolve.
 */
interface ScopeGroup {
  /** Sorted scope, or undefined for a genuinely unscoped group. */
  readonly damageTypes?: readonly DamageType[];
  readonly modifiers: StatModifier[];
  readonly conversions: StatConversionModifier[];
  readonly enemyModifiers: EnemyModifier[];
}

/** Map key standing for "this grant applies to every damage type". */
const UNSCOPED_KEY = "";

/**
 * Stable key for a damage-type scope.
 *
 * SORTED, so `["normal", "charged"]` and `["charged", "normal"]` land in the
 * same group and produce the same buff id on every run. The generator already
 * sorts, and this re-sorts rather than trusting it, because a group that split
 * on ordering would emit two half-buffs instead of one.
 */
function scopeKey(damageTypes: readonly DamageType[] | undefined): string {
  if (!damageTypes || damageTypes.length === 0) return UNSCOPED_KEY;
  return [...damageTypes].sort().join(",");
}

/** Get or create the group for one scope, preserving first-seen order. */
function groupFor(
  groups: Map<string, ScopeGroup>,
  damageTypes: readonly DamageType[] | undefined,
): ScopeGroup {
  const key = scopeKey(damageTypes);
  const existing = groups.get(key);
  if (existing) return existing;
  const created: ScopeGroup = {
    damageTypes:
      key === UNSCOPED_KEY ? undefined : (key.split(",") as DamageType[]),
    modifiers: [],
    conversions: [],
    enemyModifiers: [],
  };
  groups.set(key, created);
  return created;
}

/**
 * `GeneratedWeaponModifier` -> `StatModifier`.
 *
 * `damageTypes` is deliberately NOT copied here: it is consumed one level up,
 * as the buff's condition. `stat` and `element` are already the engine's own
 * `StatKey` / `Element` (the generated types are declared against them), so
 * this is a field projection and not a translation table that could drift.
 */
function toStatModifier(modifier: GeneratedWeaponModifier): StatModifier {
  return modifier.element === undefined
    ? { stat: modifier.stat, value: modifier.value }
    : { stat: modifier.stat, value: modifier.value, element: modifier.element };
}

/**
 * `GeneratedWeaponConversion` -> `StatConversionModifier`.
 *
 * `threshold` has no counterpart in the generated shape and is left ABSENT
 * rather than defaulted -- a conversion whose threshold the prose stated would
 * not have been bucketed `expressible` without it.
 */
function toStatConversion(
  conversion: GeneratedWeaponConversion,
): StatConversionModifier {
  const converted: StatConversionModifier = {
    sourceStat: conversion.sourceStat,
    targetStat: conversion.targetStat,
    ratio: conversion.ratio,
  };
  if (conversion.maxCap !== undefined) converted.maxCap = conversion.maxCap;
  return converted;
}

/** `GeneratedWeaponEnemyModifier` -> `EnemyModifier`. A field projection. */
function toEnemyModifier(
  modifier: GeneratedWeaponEnemyModifier,
): EnemyModifier {
  return modifier.element === undefined
    ? { key: modifier.key, value: modifier.value }
    : { key: modifier.key, value: modifier.value, element: modifier.element };
}

/**
 * The buffs one refinement row grants, one per distinct damage-type scope.
 *
 * A row outside the `expressible` bucket yields `[]` -- see rule 1 above.
 *
 * ENEMY MODIFIERS carry no scope in the generated shape (shred is a property of
 * the enemy, not of a hit), so they join the unscoped group. They ride along as
 * sourced data; the engine declares `EnemyModifier` but the damage pipeline
 * does not consume it yet, which is a documented gap in
 * `src/simulation/buffs/types.ts` and not this module's to close.
 */
export function buffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (row.bucket !== EXPRESSIBLE_BUCKET) return [];

  // Insertion-ordered: modifiers, then conversions, then enemy modifiers, each
  // in emitted order. A `Map` preserves that, so the buff list is stable.
  const groups = new Map<string, ScopeGroup>();

  for (const modifier of row.modifiers) {
    groupFor(groups, modifier.damageTypes).modifiers.push(
      toStatModifier(modifier),
    );
  }
  for (const conversion of row.conversions) {
    groupFor(groups, conversion.damageTypes).conversions.push(
      toStatConversion(conversion),
    );
  }
  for (const modifier of row.enemyModifiers) {
    groupFor(groups, undefined).enemyModifiers.push(toEnemyModifier(modifier));
  }

  const out: Buff[] = [];
  for (const [key, group] of groups) {
    const buff: Buff = {
      // Scope-suffixed so two scopes of one passive never collapse into one
      // stacking identity. Refinement is in the id too: a build is simulated at
      // exactly one refinement, but an id that omitted it would collide across
      // any caller that compared two refinements side by side.
      id:
        key === UNSCOPED_KEY
          ? `${weaponId}-r${row.refinement}`
          : `${weaponId}-r${row.refinement}-${key}`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      // `party` would leak a weapon's passive onto the whole team; a weapon is
      // worn by one character and buffs only its wearer. `self` is not used
      // because it requires `sourceCharacterId`, and the harvest is already
      // per-character -- the buff reaches exactly the character whose
      // equipment entry produced it.
      targets: { scope: "active" },
    };
    if (group.damageTypes) buff.conditions = { damageTypes: group.damageTypes };
    if (group.modifiers.length > 0) buff.modifiers = group.modifiers;
    if (group.conversions.length > 0) buff.conversions = group.conversions;
    if (group.enemyModifiers.length > 0) {
      buff.enemyModifiers = group.enemyModifiers;
    }
    out.push(buff);
  }
  return out;
}

/**
 * A generated weapon's passive as the `WeaponPassiveBuffs` the engine harvests.
 *
 * Returns `undefined` when the weapon has no passive, or when NO refinement of
 * it is expressible -- an entry whose every level is empty is indistinguishable
 * from an absent one to the harvest, and returning it would suggest the passive
 * is modelled when nothing about it is.
 *
 * A refinement level that is present but not expressible is OMITTED from
 * `buffsByRefinement`, which is what makes the fail-closed rule automatic:
 * `harvestWeaponPassiveBuffs()` reads the owned refinement's key and gets
 * nothing, rather than reading R1's.
 */
export function weaponPassiveBuffs(
  weapon: GeneratedWeapon,
): WeaponPassiveBuffs | undefined {
  const passive = weapon.passive;
  if (!passive) return undefined;

  const byRefinement: Partial<Record<WeaponRefinement, readonly Buff[]>> = {};
  let any = false;
  // Ascending refinement, so the emitted key order is fixed.
  for (const row of [...passive.refinements].sort(
    (a, b) => a.refinement - b.refinement,
  )) {
    const buffs = buffsForRefinement(weapon.id, passive.name, row);
    if (buffs.length === 0) continue;
    byRefinement[row.refinement] = buffs;
    any = true;
  }
  if (!any) return undefined;

  return { name: passive.name, buffsByRefinement: byRefinement };
}

/** Same as {@link weaponPassiveBuffs}, by weapon id. Unknown id -> undefined. */
export function weaponPassiveBuffsById(
  weaponId: string,
): WeaponPassiveBuffs | undefined {
  const weapon = generatedWeaponsById.get(weaponId);
  if (!weapon) return undefined;
  return weaponPassiveBuffs(weapon);
}

/**
 * Every generated weapon whose passive yields at least one buff, by id.
 *
 * Built eagerly and once: the generated set is fixed at build time, and a lazy
 * cache would be mutable state in a module the optimizer calls from a worker.
 * Insertion order follows `generatedWeaponsById`, which the generator sorts by
 * id, so iteration is deterministic.
 */
export const weaponPassiveBuffsByWeaponId: ReadonlyMap<
  string,
  WeaponPassiveBuffs
> = new Map(
  [...generatedWeaponsById]
    .map(([id, weapon]) => [id, weaponPassiveBuffs(weapon)] as const)
    .filter((entry): entry is readonly [string, WeaponPassiveBuffs] =>
      entry[1] !== undefined,
    ),
);
