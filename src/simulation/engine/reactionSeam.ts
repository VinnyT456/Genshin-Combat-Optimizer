import type {
  AuraDrainSnapshot,
  AuraSnapshot,
  Element,
  EnemyModifiers,
  EnemyState,
  ReactionBonusMap,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { resMultiplier } from "@/simulation/damage/pipeline";
import { applyElement } from "@/simulation/reactions/applyElement";
import {
  NO_REACTION_MODIFIERS,
  toReactionModifiers,
} from "@/simulation/reactions/resolver";
import type { ReactionModifiers } from "@/simulation/reactions/resolver";
import type {
  AuraDrain,
  AuraElement,
  AuraState,
  CompoundAuraKind,
} from "@/simulation/reactions/types";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";


// ============================================================================
// Reaction seam — the engine's call into the mechanics reactions layer.
//
// The engine owns SEQUENCING; mechanics owns the RULES. This file is the thin
// adapter between them and deliberately contains no reaction math: it decides
// WHEN to ask, converts between the engine's per-enemy aura store and
// mechanics' pure `AuraState`, and hands back the three modifier channels the
// damage pipeline consumes.
//
// ICD is NOT evaluated here. `planAbility()` already resolved each hit's ICD
// verdict into `PlannedHit.appliesElement`/`gauge`, so calling mechanics'
// `resolveElementalHit()` (which gates on ICD itself) would gate the SAME hit
// twice and silently suppress applications. We therefore call `applyElement()`
// directly, which is the un-gated primitive.
//
// FAIL-CLOSED DEFAULT: a hit with no authored `application` has no `gauge`,
// applies 0U, and produces no reactions — an un-authored ability never
// fabricates reaction damage. This mirrors `abilityContract.ts`.
// ============================================================================

/** Mutable, per-enemy aura store owned by one simulation run. */
export type EnemyAuraStore = Record<string, AuraState>;

/** Aura state for `enemyId`, defaulting to empty. */
export function auraFor(store: EnemyAuraStore, enemyId: string): AuraState {
  return store[enemyId] ?? EMPTY_AURA_STATE;
}

/** Stats the reaction layer needs to price a reaction. */
export interface ReactionSeamStats {
  level: number;
  elementalMastery: number;
  /**
   * `ReactionBonus`, per reaction kind, from `Stats.reactionBonus`.
   *
   * Source: KQM TCL `combat-mechanics/damage/damage-formula` — the term
   * appears in all three reaction formulas (Amplifying, Transformative,
   * Additive) as `(1 + emBonus + ReactionBonus)`.
   *
   * PASSED THROUGH, NOT COMPUTED: the engine reads it off the buff-resolved
   * stat bag and hands it to mechanics, which owns the arithmetic. Optional so
   * every existing caller keeps working; absent means every reaction gets 0.
   */
  reactionBonus?: ReactionBonusMap;
}

export interface ResolveReactionsInput {
  store: EnemyAuraStore;
  enemy: EnemyState;
  /** Element actually applied (post-infusion). */
  element: Element;
  /**
   * Gauge units for this hit. `undefined` (no authored application) and 0 both
   * mean "applies nothing" — see the fail-closed rule above.
   */
  gauge: number | undefined;
  /** ICD verdict from `planAbility`. False suppresses the application. */
  appliesElement: boolean | undefined;
  time: number;
  stats: ReactionSeamStats;
  /** Enemy shred for THIS hit, so reaction RES matches the triggering hit. */
  enemyModifiers?: EnemyModifiers;
}

/**
 * Resolve one hit's elemental application against the enemy's aura.
 *
 * MUTATES `store` for the target enemy — aura is inherently stateful across
 * hits. The mechanics call itself stays pure; only this store is updated.
 */
export function resolveReactions(
  input: ResolveReactionsInput,
): ReactionModifiers {
  const { store, enemy, element, gauge, appliesElement, time, stats } = input;

  // Nothing applied => no aura change and no reactions. Note this returns
  // BEFORE touching the store, so a non-applying hit cannot even decay it;
  // decay is a pure function of time and is applied on the next real hit.
  if (appliesElement !== true || gauge === undefined || gauge <= 0) {
    return NO_REACTION_MODIFIERS;
  }

  const shred = input.enemyModifiers ?? NO_ENEMY_MODIFIERS;
  // Reaction RES uses the same shredded resistance as the triggering hit, so
  // a RES-shred buff cannot apply to direct damage but not to its reaction.
  const resMultiplierFor = (resElement: Element): number => {
    const base = enemy.resistances[resElement] ?? 0;
    return resMultiplier(base - (shred.resReduction[resElement] ?? 0));
  };

  const result = applyElement(auraFor(store, enemy.id), element, gauge, time);
  store[enemy.id] = result.state;

  if (result.reactions.length === 0) return NO_REACTION_MODIFIERS;

  return toReactionModifiers(
    result.reactions,
    {
      level: stats.level,
      elementalMastery: stats.elementalMastery,
      // `ReactionStats.reactionBonus` is keyed by reaction kind, which is
      // exactly the shape of `ReactionBonusMap`, so this is a pass-through
      // with no translation and therefore no place for a mapping bug.
      reactionBonus: stats.reactionBonus,
    },
    resMultiplierFor,
  );
}

/**
 * Serialize the aura store for `SimulationSnapshot.enemyAuras`.
 *
 * Keys are emitted in sorted order so the snapshot is byte-identical for
 * identical runs regardless of the order enemies were first touched.
 */
export function snapshotEnemyAuras(
  store: EnemyAuraStore,
): Record<string, AuraSnapshot> | undefined {
  const ids = Object.keys(store).sort();
  if (ids.length === 0) return undefined;
  const out: Record<string, AuraSnapshot> = {};
  for (const id of ids) {
    const state = store[id]!;
    out[id] = {
      auras: state.auras.map((aura) => ({
        element: aura.element,
        gauge: aura.gauge,
        since: aura.since,
        decayRate: aura.decayRate,
        ...drainsField(aura.drains),
      })),
      compound: state.compound.map((aura) => ({
        kind: aura.kind,
        gauge: aura.gauge,
        since: aura.since,
        decayRate: aura.decayRate,
        ...drainsField(aura.drains),
      })),
    };
  }
  return out;
}

/**
 * Copy a drain list for a snapshot, preserving ABSENT-vs-EMPTY.
 *
 * The mechanics layer stores "no drains" as an omitted key, never `[]`, so
 * that two structurally identical auras hash identically. Round-tripping an
 * absent key into `[]` would create a second representation of the same state
 * and split the optimizer's memo, so the key is spread in only when there is
 * something to carry. Entries are copied, not aliased, so mutating a restored
 * store can never write back through a snapshot a caller still holds.
 */
function drainsField(
  drains: readonly AuraDrain[] | undefined,
): { drains?: readonly AuraDrainSnapshot[] } {
  if (drains === undefined || drains.length === 0) return {};
  return {
    drains: drains.map((drain) => ({
      source: drain.source,
      ratePerSecond: drain.ratePerSecond,
    })),
  };
}

/**
 * Restore an EnemyAuraStore from a snapshot (e.g. SimulationSnapshot.enemyAuras).
 *
 * Reconstructs pure AuraState objects for each enemy id, ready for resume.
 */
export function restoreEnemyAuras(
  snapshots?: Readonly<Record<string, AuraSnapshot>>,
): EnemyAuraStore {
  if (!snapshots) return {};
  const store: EnemyAuraStore = {};
  for (const [id, snap] of Object.entries(snapshots)) {
    store[id] = {
      auras: snap.auras.map((aura) => ({
        element: aura.element as AuraElement,
        gauge: aura.gauge,
        since: aura.since,
        decayRate: aura.decayRate,
        ...drainsField(aura.drains),
      })),
      compound: snap.compound.map((compound) => ({
        kind: compound.kind as CompoundAuraKind,
        gauge: compound.gauge,
        since: compound.since,
        decayRate: compound.decayRate,
        ...drainsField(compound.drains),
      })),
    };
  }
  return store;
}

