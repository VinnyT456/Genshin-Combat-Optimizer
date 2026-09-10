import type {
  BuffContext,
  BuffResolver,
  EnemyModifierResolver,
  EnemyModifiers,
  Stats,
} from "@/types";
import type {
  ActiveBuff,
  BaseStatValues,
  Buff,
  BuffState,
} from "@/simulation/buffs/types";
import { getActiveBuffs } from "@/simulation/buffs/getActiveBuffs";
import {
  foldBuffsIntoStats,
  sumActiveCharacterDefense,
  sumActiveHealing,
  sumActiveEnemyModifiers,
} from "@/simulation/buffs/resolver";
import type { CharacterDefenseTotals } from "@/simulation/buffs/resolver";
import type { HealingTotals } from "@/simulation/buffs/resolver";
import type { TalentLevelBoosts } from "@/simulation/buffs/talentLevel";
import { sumTalentLevelBoosts } from "@/simulation/buffs/talentLevel";


// ============================================================================
// Resolver factories.
//
// Two hooks, one buff list. combat-engineer deliberately kept the stat-side and
// enemy-side seams SEPARATE (rather than adding a second return channel to
// `BuffResolver`) so the frozen `BuffResolver` signature stayed byte-identical.
// We mirror that split here, and `makeResolvers` wires both from a single set
// of buffs so callers never have to keep two lists in sync.
//
// Both satisfy their frozen signatures exactly:
//     BuffResolver          (base: Stats, context: BuffContext) => Stats
//     EnemyModifierResolver (context: BuffContext) => EnemyModifiers
//
// Purity contract (enforced by tests), identical for both:
//  - no RNG, no Date/clock, no IO
//  - `base` and `context` are never mutated; fresh objects are returned
//  - identical inputs => identical output
// ============================================================================

/**
 * Per-character base stat values that percentage modifiers scale.
 *
 * FALLBACK ONLY. `Stats` now carries its own `base` channel, which WINS over
 * this map whenever it is present — see `resolveBaseValues` in `resolver.ts`
 * for the precedence rule and why the id-keyed map is the staler source.
 *
 * Supply this only for callers holding a `Stats` bag with no `base` attached
 * (a hand-built literal in data or a test). Channels left unspecified have
 * their percentage modifiers skipped and reported rather than misapplied.
 */
export type BaseStatsByCharacter = Readonly<Record<string, BaseStatValues>>;

export interface MakeBuffResolverOptions {
  /** All buffs in the run. Treated as immutable. */
  buffs: readonly Buff[];
  /**
   * Base ATK/HP/DEF per character id, used to scale % modifiers.
   *
   * Omit when the incoming `Stats` already carries `base` (the engine attaches
   * it), or when your data uses only flat and additive modifiers. Ignored for
   * any character whose stat bag carries its own `base`.
   */
  baseStats?: BaseStatsByCharacter;
}

/**
 * Shared query step: which buffs are live for the hit described by `context`?
 *
 * Both resolvers filter by exactly the same rules, so a buff carrying both stat
 * and enemy modifiers is gated consistently across the two seams.
 */
function activeFor(
  buffs: readonly Buff[],
  context: BuffContext,
): ActiveBuff[] {
  const state: BuffState = { buffs, snapshot: context.snapshot };
  return getActiveBuffs(context.time, state, {
    character: context.character,
    ability: context.ability,
    activeCharacterId: context.activeCharacterId,
    enemy: context.enemy,
  });
}

/**
 * Defensive copy so a caller mutating their array after construction cannot
 * change simulation behaviour mid-run (determinism).
 */
function freeze(buffs: readonly Buff[]): readonly Buff[] {
  return [...buffs];
}

/**
 * Build a stat-side resolver over a fixed set of buffs.
 *
 * The returned function is a closure over immutable data; calling it any number
 * of times in any order yields the same answers.
 */
export function makeBuffResolver(options: MakeBuffResolverOptions): BuffResolver {
  const buffs = freeze(options.buffs);
  const baseStats = options.baseStats ?? {};

  return (base: Stats, context: BuffContext): Stats => {
    const active = activeFor(buffs, context);
    // Always returns a NEW object so callers can never accidentally
    // alias-and-mutate the engine's base stats through us.
    //
    // The id-keyed map is passed as the FALLBACK only; `foldBuffsIntoStats`
    // applies `resolveBaseValues`, under which `base.base` takes precedence.
    const explicitBaseValues = baseStats[context.character.id] ?? {};
    return foldBuffsIntoStats(base, active, explicitBaseValues);
  };
}

export interface MakeEnemyModifierResolverOptions {
  /** All buffs in the run. Treated as immutable. */
  buffs: readonly Buff[];
}

/**
 * Build an enemy-side resolver (DEF/RES shred) over a fixed set of buffs.
 *
 * Reads each active buff's `enemyModifiers`, scaled by its stack count. Buffs
 * carrying no enemy modifiers contribute nothing, so the same list can safely
 * feed both this and {@link makeBuffResolver}.
 */
export function makeEnemyModifierResolver(
  options: MakeEnemyModifierResolverOptions,
): EnemyModifierResolver {
  const buffs = freeze(options.buffs);

  return (context: BuffContext): EnemyModifiers => {
    // Fresh totals every call; never a shared mutable accumulator.
    return sumActiveEnemyModifiers(activeFor(buffs, context));
  };
}

/** Resolve character-side resistance and shield-strength channels separately
 * from enemy DEF/RES modifiers. Conditions and target scope are shared with
 * the other resolver seams, so shield-gated effects fail closed identically. */
export function makeCharacterDefenseResolver(options: {
  buffs: readonly Buff[];
}): (context: BuffContext) => CharacterDefenseTotals {
  const buffs = freeze(options.buffs);
  return (context: BuffContext): CharacterDefenseTotals =>
    sumActiveCharacterDefense(activeFor(buffs, context));
}

/** Resolve healing effectiveness modifiers with the same deterministic gates
 * as character stats, resistance, and enemy modifiers. */
export function makeHealingResolver(options: {
  buffs: readonly Buff[];
}): (context: BuffContext) => HealingTotals {
  const buffs = freeze(options.buffs);
  return (context: BuffContext): HealingTotals =>
    sumActiveHealing(activeFor(buffs, context));
}

// ---------------------------------------------------------------------------
// Talent-level seam
// ---------------------------------------------------------------------------

/**
 * Resolver shape for the talent-level channel.
 *
 * Deliberately mirrors
 * `EnemyModifierResolver` — same `BuffContext` in, aggregated totals out, same
 * purity rules — so wiring it is the same shape of change that wiring enemy
 * shred already was.
 *
 * Returns per-slot DELTAS, not absolute levels: the buff layer does not know a
 * character's configured talent levels and must not invent them. The caller
 * adds the delta via `resolveTalentLevel()`, which owns the clamp.
 */
export type TalentLevelResolver = (context: BuffContext) => TalentLevelBoosts;

export interface MakeTalentLevelResolverOptions {
  /** All buffs in the run. Treated as immutable. */
  buffs: readonly Buff[];
}

/**
 * Build a talent-level resolver over a fixed set of buffs.
 *
 * Uses the SAME `activeFor` filter as the stat and enemy seams, so a
 * constellation buff carrying a talent-level boost is gated by identical
 * window / targeting / condition rules. A C3 boost is simply a buff whose
 * activation is decided by the constellation gate.
 *
 * The combat engine composes this resolver with caller-supplied boosts and
 * applies the result when selecting talent-table rows.
 */
export function makeTalentLevelResolver(
  options: MakeTalentLevelResolverOptions,
): TalentLevelResolver {
  const buffs = freeze(options.buffs);

  return (context: BuffContext): TalentLevelBoosts => {
    // Fresh totals every call; never a shared mutable accumulator.
    return sumTalentLevelBoosts(activeFor(buffs, context));
  };
}

/** Both resolvers, ready to spread into `SimulationConfig`. */
export interface Resolvers {
  buffResolver: BuffResolver;
  enemyModifierResolver: EnemyModifierResolver;
}

/**
 * Wire both seams from ONE buff list.
 *
 * Convenience for the common case: a caller holds a single set of buff data and
 * wants stat bonuses and enemy shred to stay consistent with each other.
 *
 *   simulateRotation(team, rotation, enemy, { ...makeResolvers({ buffs }) })
 */
export function makeResolvers(options: MakeBuffResolverOptions): Resolvers {
  return {
    buffResolver: makeBuffResolver(options),
    enemyModifierResolver: makeEnemyModifierResolver({ buffs: options.buffs }),
  };
}
