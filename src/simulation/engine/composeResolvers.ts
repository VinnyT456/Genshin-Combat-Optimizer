import type {
  BuffContext,
  BuffResolver,
  EnemyModifierResolver,
  EnemyModifiers,
  SimulationConfig,
  Stats,
  TalentLevelBoostMap,
  TalentLevelResolver,
  TalentLevelSlot,
} from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import {
  makeBuffResolver,
  makeEnemyModifierResolver,
  makeTalentLevelResolver,
} from "@/simulation/buffs/makeBuffResolver";

// ============================================================================
// Resolver composition.
//
// Every buff SOURCE the engine harvests — constellations and ascension
// passives (`perkBuffs.ts`), weapon passives and artifact set bonuses
// (`equipmentBuffs.ts`) — ends in the same two steps: build resolvers over a
// buff list, then CHAIN them onto whatever the caller already supplied.
//
// Those steps are here so there is exactly ONE of them. A second copy is how
// two sources end up composing differently — one replacing the caller's
// resolver where the other chains it — which is invisible until a build that
// uses both produces a number neither source can explain.
//
// COMPOSITION IS ALWAYS ADDITIVE. A caller-supplied resolver is never
// replaced. `withHarvestedBuffs` returns its `config` argument BY IDENTITY
// when the buff list is empty, so a run with no perks and no gear buffs is
// byte-identical to one from before this layer existed.
//
// DETERMINISM: no `Object.keys` over a merged bag, no sorting by anything a
// caller can permute. Key orders below are fixed by construction.
// ============================================================================

/** Chains two stat resolvers: harvested buffs fold in first, then the caller's. */
export function composeBuffResolvers(
  harvested: BuffResolver,
  supplied: BuffResolver | undefined,
): BuffResolver {
  if (supplied === undefined) return harvested;
  return (base: Stats, context: BuffContext): Stats =>
    supplied(harvested(base, context), context);
}

/** Sums two enemy-modifier resolvers channel by channel. */
export function composeEnemyModifierResolvers(
  harvested: EnemyModifierResolver,
  supplied: EnemyModifierResolver | undefined,
): EnemyModifierResolver {
  if (supplied === undefined) return harvested;
  return (context: BuffContext): EnemyModifiers => {
    const a = harvested(context);
    const b = supplied(context);
    const resReduction: EnemyModifiers["resReduction"] = { ...a.resReduction };
    // Fixed key order: `a`'s keys keep their insertion order, `b`'s new keys
    // append. Never `Object.keys` over a merged bag.
    for (const [element, value] of Object.entries(b.resReduction)) {
      const key = element as keyof typeof resReduction;
      resReduction[key] = (resReduction[key] ?? 0) + (value ?? 0);
    }
    return {
      defReduction: a.defReduction + b.defReduction,
      defIgnore: a.defIgnore + b.defIgnore,
      resReduction,
      dmgReduction: (a.dmgReduction ?? 0) + (b.dmgReduction ?? 0),
    };
  };
}

/** Slots merged in a FIXED order so the boost bag never depends on iteration. */
const TALENT_LEVEL_SLOTS: readonly TalentLevelSlot[] = [
  "normal",
  "skill",
  "burst",
];

/**
 * Adds two talent-level boost bags.
 *
 * Deltas ADD across sources (a C3 +3 and a weapon +1 give +4); the clamp to
 * 1..15 belongs to the RESULTING level and stays where it already lives, in
 * `effectiveTalentLevel`. A net-zero slot is OMITTED, preserving the sparse-key
 * invariant that keeps optimizer memo keys from splitting for zero information.
 */
export function composeTalentLevelResolvers(
  harvested: TalentLevelResolver,
  supplied: TalentLevelResolver | undefined,
): TalentLevelResolver {
  if (supplied === undefined) return harvested;
  return (context: BuffContext): TalentLevelBoostMap => {
    const a = harvested(context);
    const b = supplied(context);
    const merged: TalentLevelBoostMap = {};
    for (const slot of TALENT_LEVEL_SLOTS) {
      const total = (a[slot] ?? 0) + (b[slot] ?? 0);
      if (total !== 0) merged[slot] = total;
    }
    return merged;
  };
}

/**
 * Config with `buffs` wired into all three mechanics seams.
 *
 * All three channels are wired from ONE list because a single buff may carry
 * any of them: a weapon passive can grant ATK% (`modifiers`), a set bonus can
 * shred RES (`enemyModifiers`), and a constellation can raise a talent level
 * (`talentLevelModifiers`). Sources that carry nothing on a channel contribute
 * nothing there rather than being special-cased per source.
 *
 * Returns `config` BY IDENTITY when `buffs` is empty — the caller can rely on
 * `withHarvestedBuffs(cfg, []) === cfg`.
 */
export function withHarvestedBuffs(
  config: SimulationConfig,
  buffs: readonly Buff[],
): SimulationConfig {
  if (buffs.length === 0) return config;
  return {
    ...config,
    buffResolver: composeBuffResolvers(
      makeBuffResolver({ buffs }),
      config.buffResolver,
    ),
    enemyModifierResolver: composeEnemyModifierResolvers(
      makeEnemyModifierResolver({ buffs }),
      config.enemyModifierResolver,
    ),
    talentLevelResolver: composeTalentLevelResolvers(
      makeTalentLevelResolver({ buffs }),
      config.talentLevelResolver,
    ),
  };
}
