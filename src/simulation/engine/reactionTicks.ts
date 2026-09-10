import type {
  Element,
  EnemyModifiers,
  EnemyState,
  ReactionTickQueueSnapshot,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { resMultiplier } from "@/simulation/damage/pipeline";
import { EPSILON } from "@/simulation/engine/constants";
import { auraFor } from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";
import {
  ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK,
  ELECTRO_CHARGED_TICK_INTERVAL_SECONDS,
} from "@/simulation/engine/reactionTickConstants";
import {
  consumeAura,
  findAura,
  gaugeAt,
  timeWhenEmpty,
} from "@/simulation/reactions/aura";
import { transformativeDamage } from "@/simulation/reactions/reactionDamage";
import {
  ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
  TRANSFORMATIVE_RES_ELEMENT,
} from "@/simulation/reactions/constants";
import type { AuraElement } from "@/simulation/reactions/types";

// ============================================================================
// Reaction tick scheduler — the engine's independent clock.
//
// WHY A SECOND CLOCK EXISTS AT ALL
// --------------------------------
// Every other damage source in this engine is anchored to a HIT: the rotation
// walks actions, each action expands into hits, and every reaction is resolved
// at a hit's timestamp. Electro-Charged does not fit that shape. It ticks on
// its own schedule from the moment the reaction occurred, once per second,
// INCLUDING after the final authored action, and it keeps consuming gauge
// while nobody is attacking. Evaluating it only at hit boundaries would make
// its damage a function of when the player happened to attack next, which is
// wrong in both directions (no ticks during idle time; a burst of retroactive
// ticks at the next hit).
//
// This module therefore owns a genuine time-driven queue that the main loop
// interleaves into the action walk.
//
// ---------------------------------------------------------------------------
// CONTRACT 1 — ORDERING (total, deterministic, no RNG anywhere)
// ---------------------------------------------------------------------------
// The queue is drained by `advanceReactionTicks(untilTime, ...)`, which the
// main loop calls BEFORE processing anything at `untilTime`. Ticks are ordered
// by the triple
//
//     (time, phase, sequence)
//
//  * `time`      the tick's scheduled simulation time, ascending.
//  * `phase`     ticks occupy phase `reaction-tick`, which sorts BEFORE the
//                action/hit phase. So at an exactly equal timestamp, a pending
//                EC tick resolves BEFORE a hit landing at that same instant.
//                RATIONALE, stated so it is a rule and not an accident: the
//                tick was scheduled by an EARLIER event, so it is causally
//                prior; and the alternative (hit first) would let a hit that
//                refreshes the aura cancel a tick that was already due, making
//                the result depend on float equality at the boundary. This is
//                an ENGINE CONVENTION, not a sourced game rule — KQM publishes
//                no same-frame ordering between an EC tick and a simultaneous
//                hit. It is fixed so results are reproducible, not because the
//                game is known to do this.
//  * `sequence`  a monotonically increasing counter assigned at schedule time,
//                breaking ties between two ticks at the same time and phase.
//                With a single target and one EC reaction there is at most one
//                pending tick, so this is a guarantee rather than a live case.
//
// The queue is kept sorted by that triple, so drain order never depends on
// insertion order, `Object.keys` order, or map iteration order.
//
// ---------------------------------------------------------------------------
// CONTRACT 2 — CHECKPOINT
// ---------------------------------------------------------------------------
// A tick's entire future is derivable from state that is ALREADY snapshotted:
// the two auras (gauge / since / decayRate / drains) plus the reaction clock.
// Two consequences, both load-bearing:
//
//  * `Aura.drains` MUST survive the snapshot. Any drain an ongoing reaction
//    attaches is part of the aura's real consumption rate, so a snapshot that
//    dropped it resumes with an aura decaying STRICTLY SLOWER than the run it
//    came from — a wrong number, in the direction that manufactures extra
//    reactions, with no error anywhere. That hole was real (`snapshotEnemyAuras`
//    copied element/gauge/since/decayRate and silently discarded `drains`) and
//    is fixed in `reactionSeam.ts` (`drainsField`). Removing the fix does not
//    break a type; it silently changes results, which is why it is pinned by a
//    test rather than left to review.
//    EC itself attaches no drain — see the section below for why — so this is a
//    prerequisite the scheduler makes SAFE rather than one it consumes.
//  * The next tick time is RECOMPUTED from aura state rather than carried as an
//    opaque queue: `nextElectroChargedTickTime` derives it from the two auras
//    and `lastTickTime`. Tick series state is therefore reconstructible, and a
//    resumed run rebuilds the same schedule from the same auras.
//
//    KNOWN LIMIT, stated rather than hidden: `lastTickTime` is live queue state
//    and is NOT yet a snapshot field, so a run resumed mid-EC restarts its tick
//    phase from the resume point instead of continuing the original cadence.
//    The aura gauges — which decide how many ticks remain — do survive exactly.
//    Carrying the tick phase needs a new `SimulationSnapshot` field and so a
//    reviewed public-type change; it is called out in the handoff, not guessed
//    at here.
//
// ---------------------------------------------------------------------------
// WHY NO `withDrain` IS ATTACHED FOR EC — a deliberate modelling decision
// ---------------------------------------------------------------------------
// `Aura.drains` can express a continuous 0.4 GU/s consumption, and it is
// tempting to attach one for EC since 0.4U per tick at one tick per second is
// numerically 0.4 GU/s. That would DOUBLE-COUNT: KQM states the consumption is
// per TICK ("each tick consumes 0.4U from both gauges"), so if a drain removed
// 0.4 GU/s continuously AND each tick also subtracted 0.4U via `consumeAura`,
// the pair would drain at 0.8 GU/s and EC would end roughly twice as early.
//
// The two are alternative representations of ONE quantity, not two quantities.
// This scheduler uses the DISCRETE one, because it is the literal sourced
// behaviour and because it makes the early-tick rule fall out directly: under
// discrete ticks, `timeWhenEmpty()` measures decay from the CURRENT gauge
// under NATURAL decay, which is exactly "the moment when the gauge is
// completely decayed" that the KQM exception is phrased against. Adding a
// drain would make `timeWhenEmpty()` mean something else and the quoted rule
// would no longer be the rule being implemented.
//
// The drain machinery is still load-bearing for this feature in the CHECKPOINT
// direction (CONTRACT 2): any drain a future mechanic attaches must survive a
// snapshot, and that hole was real and is fixed alongside this scheduler.
//
// ---------------------------------------------------------------------------
// CONTRACT 3 — HORIZON
// ---------------------------------------------------------------------------
// Ticks are processed up to and INCLUDING the run's end time (the clock after
// the final authored action), and up to `config.timeLimit` when one is set.
// A tick scheduled exactly AT the horizon is INCLUDED; a tick after it is not
// processed and leaves the aura state untouched beyond the horizon, so the
// checkpoint a caller resumes from still contains the pending reaction.
// Inclusive-at-the-boundary is chosen to match the phase rule above (a tick at
// time T precedes anything else at time T, so it is inside the window), and
// because the alternative makes damage discontinuous in the horizon.
//
// The tail drain after the final action is the whole point of the feature: EC
// keeps ticking after the player stops attacking, so `advanceReactionTicks` is
// called once more at the end of the run with the run's end time.
// ============================================================================

/** Reaction kinds this scheduler can drive. */
export type ScheduledReactionKind = "electroCharged";

/**
 * Live tick state for ONE (enemy, reaction) pair.
 *
 * `lastTickTime` is the anchor the KQM early-tick rule is phrased against; it
 * starts at the time of the reaction that created the tick series, because the
 * first tick is one interval AFTER the reaction, not at it.
 */
export interface ReactionTickEntry {
  enemyId: string;
  kind: ScheduledReactionKind;
  /** Character credited with the tick damage (the reaction's trigger). */
  sourceCharacterId: string;
  sourceCharacterName: string;
  /** Level / EM of the trigger, captured when the series started. */
  triggerLevel: number;
  triggerElementalMastery: number;
  /** Reaction DMG bonus fraction for this kind, captured with the trigger. */
  reactionBonus: number;
  /** Enemy RES shred in force when the series started. */
  enemyModifiers: EnemyModifiers;
  /** Time of the reaction (or the most recent tick) this series is anchored to. */
  lastTickTime: number;
  /** Scheduled time of the next tick. */
  nextTickTime: number;
  /** Tie-break counter, assigned at schedule time. See CONTRACT 1. */
  sequence: number;
}

/** The engine's reaction-tick queue for one run. */
export interface ReactionTickQueue {
  entries: ReactionTickEntry[];
  nextSequence: number;
}

export function createReactionTickQueue(): ReactionTickQueue {
  return { entries: [], nextSequence: 0 };
}

/**
 * Copy the pending queue into the resumable snapshot representation.
 *
 * Queue entries contain captured trigger information, so retaining only the
 * aura would be insufficient: a resumed tick could otherwise lose its source
 * attribution, EM, or RES shred. Copies are deliberately detached from the
 * live queue so a later drain cannot mutate a checkpoint held by a search node.
 */
export function snapshotReactionTicks(
  queue: ReactionTickQueue,
): ReactionTickQueueSnapshot | undefined {
  if (queue.entries.length === 0) return undefined;
  return {
    entries: queue.entries.map((entry) => ({
      ...entry,
      enemyModifiers: {
        ...entry.enemyModifiers,
        resReduction: { ...entry.enemyModifiers.resReduction },
      },
    })),
    nextSequence: queue.nextSequence,
  };
}

/** Restore a detached live queue from a checkpoint. */
export function restoreReactionTicks(
  snapshot: ReactionTickQueueSnapshot | undefined,
): ReactionTickQueue {
  if (snapshot === undefined) return createReactionTickQueue();
  const entries = snapshot.entries
    .filter((entry) => entry.kind === "electroCharged")
    .map((entry) => ({
      ...entry,
      kind: "electroCharged" as const,
      enemyModifiers: {
        ...entry.enemyModifiers,
        resReduction: { ...entry.enemyModifiers.resReduction },
      },
    }));
  const maxSequence = entries.reduce(
    (max, entry) => Math.max(max, entry.sequence),
    -1,
  );
  return {
    entries,
    nextSequence: Math.max(snapshot.nextSequence, maxSequence + 1),
  };
}

/** One tick that fired, as the main loop needs to render it. */
export interface FiredReactionTick {
  time: number;
  enemyId: string;
  kind: ScheduledReactionKind;
  sourceCharacterId: string;
  sourceCharacterName: string;
  /** Element whose RES applied to this instance. */
  resElement: Element;
  damage: number;
}

/** The two auras Electro-Charged consumes, in the fixed order it drains them. */
const ELECTRO_CHARGED_AURAS: readonly AuraElement[] = ["electro", "hydro"];

/**
 * Sort the queue by `(time, sequence)`.
 *
 * All entries share one phase today (`reaction-tick`), so phase is implicit;
 * it becomes an explicit field when a second scheduled reaction family exists.
 * Sorting on every mutation rather than maintaining a heap is deliberate: the
 * queue holds at most one entry per (enemy, reaction) pair, so the constant
 * factor is irrelevant and a sort is trivially verifiable as deterministic.
 */
function sortQueue(queue: ReactionTickQueue): void {
  queue.entries.sort((a, b) => {
    if (a.nextTickTime !== b.nextTickTime) return a.nextTickTime - b.nextTickTime;
    return a.sequence - b.sequence;
  });
}

/** Details the scheduler needs to attribute and price a tick series. */
export interface ScheduleElectroChargedInput {
  queue: ReactionTickQueue;
  store: EnemyAuraStore;
  enemyId: string;
  time: number;
  sourceCharacterId: string;
  sourceCharacterName: string;
  triggerLevel: number;
  triggerElementalMastery: number;
  reactionBonus?: number;
  enemyModifiers?: EnemyModifiers;
}

/**
 * Start (or REFRESH) the Electro-Charged tick series on one enemy.
 *
 * Called by the main loop whenever a hit produced an `electroCharged`
 * reaction. Re-triggering EC does not stack a second series: the existing
 * entry is re-anchored to the new reaction time, matching the game's single
 * 1s-per-target damage cooldown. The trigger's attribution and stats are
 * re-captured, so the most recent trigger owns the subsequent ticks.
 */
export function scheduleElectroCharged(input: ScheduleElectroChargedInput): void {
  const { queue, enemyId, time } = input;
  const existing = queue.entries.find(
    (entry) => entry.enemyId === enemyId && entry.kind === "electroCharged",
  );

  const anchored: Omit<ReactionTickEntry, "sequence"> = {
    enemyId,
    kind: "electroCharged",
    sourceCharacterId: input.sourceCharacterId,
    sourceCharacterName: input.sourceCharacterName,
    triggerLevel: input.triggerLevel,
    triggerElementalMastery: input.triggerElementalMastery,
    reactionBonus: input.reactionBonus ?? 0,
    enemyModifiers: input.enemyModifiers ?? NO_ENEMY_MODIFIERS,
    lastTickTime: time,
    nextTickTime: time + ELECTRO_CHARGED_TICK_INTERVAL_SECONDS,
  };

  if (existing) {
    Object.assign(existing, anchored);
  } else {
    queue.entries.push({ ...anchored, sequence: queue.nextSequence++ });
  }
  sortQueue(queue);
}

/**
 * The time at which this EC series actually next ticks, or `undefined` for
 * "never again".
 *
 * Implements the two KQM branches verbatim, from `unverified.ts`
 * (`electro-charged-ticks`), quoting [K6]:
 *
 *   "When either the Electro or Hydro gauge completely decays, the next
 *    Electro-Charged tick will prematurely occur at the moment when the gauge
 *    is completely decayed. However, if one of the gauges empties within 0.5s
 *    of the last Electro-Charged tick, there will not be another tick."
 *
 * So with `empty` = the EARLIER of the two auras' empty times:
 *
 *   empty <  lastTick + 0.5   -> no further tick at all
 *   empty <  scheduled        -> tick EARLY, at `empty`
 *   otherwise                 -> tick at `scheduled`
 *
 * RECOMPUTED on every call rather than cached, because a tick subtracts gauge
 * and therefore moves the empty time EARLIER; a cached value would schedule
 * ticks the aura can no longer pay for.
 */
export function nextElectroChargedTickTime(
  entry: ReactionTickEntry,
  store: EnemyAuraStore,
): number | undefined {
  const state = auraFor(store, entry.enemyId);
  let earliestEmpty = Number.POSITIVE_INFINITY;
  for (const element of ELECTRO_CHARGED_AURAS) {
    const aura = findAura(state, element, entry.lastTickTime);
    // A missing aura means EC is already over: the pair no longer exists.
    if (aura === undefined) return undefined;
    const empty = timeWhenEmpty(aura);
    if (empty < earliestEmpty) earliestEmpty = empty;
  }

  // Both gauges outlast the scheduled tick: the ordinary 1s cadence.
  if (earliestEmpty >= entry.nextTickTime) return entry.nextTickTime;

  // A gauge empties before the next scheduled tick. Either it is too soon
  // after the last tick (no tick at all) or the tick is pulled forward.
  if (
    earliestEmpty <
    entry.lastTickTime + ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK - EPSILON
  ) {
    return undefined;
  }
  return earliestEmpty;
}

/** Everything `advanceReactionTicks` needs beyond the queue itself. */
export interface AdvanceReactionTicksInput {
  queue: ReactionTickQueue;
  store: EnemyAuraStore;
  enemy: EnemyState;
  /** Process every tick due at or before this time. Inclusive — CONTRACT 3. */
  untilTime: number;
}

/**
 * Drain every tick due at or before `untilTime`, mutating the aura store.
 *
 * Returns the fired ticks in chronological order so the caller can emit
 * timeline events. Pure with respect to everything except `queue` and `store`,
 * which are the run's mutable state by design.
 *
 * TERMINATION: every tick either advances `lastTickTime` by a positive
 * interval or removes the entry, and each tick strictly reduces gauge, so the
 * loop cannot spin. The explicit `while` bound is on the queue emptying, not
 * on an iteration count, because there is no configuration in which a tick
 * fails to make progress.
 */
export function advanceReactionTicks(
  input: AdvanceReactionTicksInput,
): FiredReactionTick[] {
  const { queue, store, enemy, untilTime } = input;
  const fired: FiredReactionTick[] = [];
  if (queue.entries.length === 0) return fired;

  // Re-evaluate every entry's due time against current aura state before
  // draining: a hit since the last advance may have moved an empty time.
  for (;;) {
    for (const entry of queue.entries) {
      const when = nextElectroChargedTickTime(entry, store);
      if (when === undefined) {
        // Series is over. Mark for removal by pushing it past the horizon;
        // removed below so we do not mutate the array mid-scan.
        entry.nextTickTime = Number.POSITIVE_INFINITY;
        continue;
      }
      entry.nextTickTime = when;
    }
    queue.entries = queue.entries.filter((entry) =>
      Number.isFinite(entry.nextTickTime),
    );
    sortQueue(queue);

    const due: ReactionTickEntry | undefined = queue.entries[0];
    if (due === undefined) break;
    // `+ EPSILON`: a tick landing exactly on the horizon is INSIDE it
    // (CONTRACT 3), and float arithmetic on `lastTick + 1.0` must not push it
    // out by one ulp.
    if (due.nextTickTime > untilTime + EPSILON) break;

    const tick = fireElectroChargedTick(due, store, enemy);
    if (tick === undefined) {
      // Gauge vanished between scheduling and firing; drop the series rather
      // than emitting damage for a reaction that is no longer live.
      queue.entries = queue.entries.filter((entry) => entry !== due);
      continue;
    }
    fired.push(tick);
  }

  return fired;
}

/**
 * Consume 0.4U from BOTH gauges and price the tick's damage.
 *
 * An EC tick is an equal gauge subtraction from both auras via the existing
 * `consumeAura` — there is no new mechanics API here, and this module computes
 * no reaction coefficient of its own: the damage comes from mechanics'
 * `transformativeDamage`, and the RES element from mechanics' table.
 */
function fireElectroChargedTick(
  entry: ReactionTickEntry,
  store: EnemyAuraStore,
  enemy: EnemyState,
): FiredReactionTick | undefined {
  const time = entry.nextTickTime;
  let state = auraFor(store, entry.enemyId);

  // PRESENCE IS CHECKED AT `lastTickTime`, NOT AT `time`, AND THAT MATTERS.
  //
  // The premature-tick branch schedules a tick at exactly the instant a gauge
  // reaches 0. Probing that instant asks "is there gauge left AFTER it ran
  // out", whose answer is always no, so the early tick could never fire and
  // the whole sourced branch would be dead code that still typechecks.
  //
  // Anchoring the liveness check at the previous tick instead asks the right
  // question: was the Electro-Charged pair live over the interval this tick
  // belongs to. `nextElectroChargedTickTime` has already decided the tick is
  // legal (including the 0.5s exception), so this guard exists only to reject
  // a pair that was destroyed outright — e.g. an aura overwritten by a hit
  // between two advances.
  for (const element of ELECTRO_CHARGED_AURAS) {
    const aura = findAura(state, element, entry.lastTickTime);
    if (aura === undefined || gaugeAt(aura, entry.lastTickTime) <= 0) {
      return undefined;
    }
  }

  for (const element of ELECTRO_CHARGED_AURAS) {
    state = consumeAura(
      state,
      element,
      ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
      time,
    );
  }
  store[entry.enemyId] = state;

  entry.lastTickTime = time;
  entry.nextTickTime = time + ELECTRO_CHARGED_TICK_INTERVAL_SECONDS;

  const resElement: Element = TRANSFORMATIVE_RES_ELEMENT.electroCharged;
  const baseRes = enemy.resistances[resElement] ?? 0;
  const shred = entry.enemyModifiers.resReduction[resElement] ?? 0;

  return {
    time,
    enemyId: entry.enemyId,
    kind: entry.kind,
    sourceCharacterId: entry.sourceCharacterId,
    sourceCharacterName: entry.sourceCharacterName,
    resElement,
    damage: transformativeDamage("electroCharged", {
      triggerCharacterLevel: entry.triggerLevel,
      elementalMastery: entry.triggerElementalMastery,
      reactionBonus: entry.reactionBonus,
      resMultiplier: resMultiplier(baseRes - shred),
    }),
  };
}
