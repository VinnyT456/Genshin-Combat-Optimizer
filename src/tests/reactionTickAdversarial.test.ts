import { describe, expect, it } from "vitest";
import type { EnemyState, SimulationResult } from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import {
  advanceReactionTicks,
  createReactionTickQueue,
  nextElectroChargedTickTime,
  restoreReactionTicks,
  scheduleElectroCharged,
  snapshotReactionTicks,
} from "@/simulation/engine/reactionTicks";
import type { ReactionTickQueue } from "@/simulation/engine/reactionTicks";
import {
  restoreEnemyAuras,
  snapshotEnemyAuras,
} from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";
import { applyElement } from "@/simulation/reactions/applyElement";
import { gaugeAt, withDrain } from "@/simulation/reactions/aura";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent, talentTable } from "@/simulation/character/talent";
import { syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// ADVERSARIAL attack on the REACTION TICK SCHEDULER (TASK #067).
//
// `src/simulation/engine/reactionTicks.ts` is the engine's SECOND clock. Every
// other damage source in this codebase is anchored to a hit, so the whole
// simulation inherits determinism from the fact that the rotation is a fixed
// list. A time-driven queue does not get that for free: its output depends on
// a sort, a float comparison against a horizon, and a snapshot round-trip.
// Those are exactly the three places nondeterminism and silent wrong numbers
// enter, so those are the three places attacked here.
//
// This file deliberately does NOT re-test the sourced KQM timing rules. The
// colocated `reactionTicks.test.ts` already pins the 1s cadence, the 0.4U
// drain, and both depletion branches against the quoted source. Repeating them
// would add passing assertions and no information.
//
// What is attacked instead:
//
//   1. The HORIZON comparison, with non-finite and adversarial inputs. A
//      horizon implemented as `x > untilTime` silently admits everything when
//      `untilTime` is NaN, because every comparison against NaN is false.
//   2. ORDERING under equal timestamps and multiple enemies, which is where a
//      queue's result starts depending on `Object.keys` order.
//   3. The SNAPSHOT round-trip, including aliasing (a checkpoint a search node
//      holds must not be mutable through the live queue) and sequence-counter
//      collision after a resume.
//
// METHOD: no assertion here derives its expectation from the same predicate as
// the code under test. Horizon behaviour is measured as a DAMAGE DIFFERENCE
// through the public `simulateRotation` API, not by inspecting the queue.
// ============================================================================

const ENEMY: EnemyState = {
  id: "target",
  name: "Test Target",
  level: 90,
  resistances: {},
};

// ---------------------------------------------------------------------------
// A synthetic Electro unit, so an Electro-Charged pair exists without pulling
// in real character data (whose kits change under other agents' hands).
// ---------------------------------------------------------------------------
const electroSkill: KitAbility = {
  id: "electro-skill",
  name: "Electro Skill",
  slot: "skill",
  castTime: 1,
  cooldown: talentTable([6]),
  energyCost: 0,
  instances: [
    {
      id: "electro-skill-hit",
      name: "Electro Skill Hit",
      damageType: "skill",
      element: "electro",
      scaling: [{ stat: "atk", table: flatTalent(1) }],
      application: { element: "electro", gauge: 1 },
    },
  ],
};

const electroUnit: GenericCharacterDefinition = {
  ...syntheticUnit,
  id: "electro-unit",
  name: "Synthetic Electro Unit",
  element: "electro",
  talentLevels: { normal: 1, skill: 1, burst: 1 },
  skill: electroSkill,
  passives: [],
  constellations: [],
  resources: [],
};

const TEAM = [syntheticUnit, electroUnit];
const EC_ROTATION = [
  { characterId: syntheticUnit.id, actionType: "skill" as const },
  { characterId: electroUnit.id, actionType: "skill" as const },
];

/** A live Electro-Charged pair on one enemy id. */
function pairedStore(enemyId: string, time = 0, gauge = 2): EnemyAuraStore {
  let state = applyElement(EMPTY_AURA_STATE, "hydro", gauge, time).state;
  state = applyElement(state, "electro", gauge, time).state;
  return { [enemyId]: state };
}

function scheduleOn(
  queue: ReactionTickQueue,
  store: EnemyAuraStore,
  enemyId: string,
  time = 0,
): void {
  scheduleElectroCharged({
    queue,
    store,
    enemyId,
    time,
    sourceCharacterId: "c",
    sourceCharacterName: "C",
    triggerLevel: 90,
    triggerElementalMastery: 0,
    enemyModifiers: NO_ENEMY_MODIFIERS,
  });
}

function tickEvents(result: SimulationResult) {
  return result.timeline.filter(
    (event) => event.damage?.abilityId === "electroCharged:tick",
  );
}

function run(config: Parameters<typeof simulateRotation>[3]): SimulationResult {
  return simulateRotation(TEAM, EC_ROTATION, ENEMY, config);
}

// ===========================================================================
// 1. THE HORIZON — the float comparison that bounds the second clock.
// ===========================================================================

describe("tick horizon — the bound must actually bind", () => {
  it("PRECONDITION: the unbounded rotation really does produce ticks", () => {
    // Guards every horizon assertion below against vacuity: if the fixture
    // stopped producing Electro-Charged, "no ticks past the horizon" would
    // pass for the wrong reason.
    expect(tickEvents(run({ critMode: "never" })).length).toBeGreaterThan(0);
  });

  it("a finite horizon admits no tick beyond it", () => {
    const bounded = run({ critMode: "never", timeLimit: 2.5 });
    for (const event of tickEvents(bounded)) {
      expect(event.timestamp).toBeLessThanOrEqual(2.5);
    }
  });

  it("a tighter horizon never yields MORE damage than a looser one", () => {
    // The monotonicity property is the honest statement of what a time limit
    // means, and it is checked across the whole range rather than at one point.
    const totals = [1, 2, 3, 4, 5, 10].map(
      (limit) => run({ critMode: "never", timeLimit: limit }).totalDamage,
    );
    for (let index = 1; index < totals.length; index += 1) {
      expect(totals[index]!).toBeGreaterThanOrEqual(totals[index - 1]!);
    }
  });

  it("a horizon at or below zero yields no damage at all", () => {
    expect(run({ critMode: "never", timeLimit: 0 }).totalDamage).toBe(0);
    expect(run({ critMode: "never", timeLimit: -5 }).totalDamage).toBe(0);
  });

  // -------------------------------------------------------------------------
  // DEFECT QA-067-D — owner: combat-engineer.
  //
  // src/simulation/engine/reactionTicks.ts:424
  //     if (due.nextTickTime > untilTime + EPSILON) break;
  //
  // reached from src/simulation/engine/simulateRotation.ts:1260
  //     config.timeLimit !== undefined ? Math.min(config.timeLimit, clock) : clock
  //
  // `Math.min(NaN, clock)` is NaN, and EVERY comparison against NaN is false,
  // so the break never fires and the loop drains the ENTIRE queue regardless of
  // the horizon. Nothing on the path validates `timeLimit` numerically:
  // `validateAction.ts:150` guards it with `!== undefined`, not `isFinite`.
  //
  // CONCRETE FAILING INPUT — measured, through the public API:
  //     simulateRotation(TEAM, EC_ROTATION, ENEMY, { critMode: "never" })
  //         -> totalDamage 6877.414, 1 tick
  //     simulateRotation(TEAM, EC_ROTATION, ENEMY,
  //                      { critMode: "never", timeLimit: NaN })
  //         -> totalDamage 9771.121, 2 ticks at t=2 and t=3
  //
  // A time LIMIT that increases damage by 42% over the UNBOUNDED run is not a
  // limit. The tick queue keeps draining past the end of the run because the
  // horizon evaporated, so a NaN limit is strictly worse than no limit.
  //
  // Severity: robustness, not a live wrong number for the current UI — the
  // enemy/rotation forms parse to finite numbers today. It is reachable by any
  // programmatic caller and by any future numeric input whose parse can yield
  // NaN, which is the ordinary failure mode of `parseFloat` on an empty field.
  //
  // Live regression guard: malformed horizon input must fail closed.
  // -------------------------------------------------------------------------
  it("QA-067-D: a NaN time limit is fail-closed", () => {
    const unbounded = run({ critMode: "never" }).totalDamage;
    const nanBounded = run({
      critMode: "never",
      timeLimit: Number.NaN,
    }).totalDamage;
    expect(nanBounded).toBeLessThanOrEqual(unbounded);
  });

  it("QA-067-D reproduction: NaN admits no action or tick", () => {
    const nanBounded = run({ critMode: "never", timeLimit: Number.NaN })
      .totalDamage;
    expect(nanBounded).toBe(0);
  });

  it("an infinite horizon behaves exactly like no horizon", () => {
    // +Infinity has none of NaN's comparison pathology, so this SHOULD hold —
    // and it is asserted rather than assumed, to separate "non-finite is
    // mishandled" from "NaN specifically is mishandled".
    expect(
      run({ critMode: "never", timeLimit: Number.POSITIVE_INFINITY })
        .totalDamage,
    ).toBeCloseTo(run({ critMode: "never" }).totalDamage, 6);
  });
});

// ===========================================================================
// 2. ORDERING — a queue's determinism lives in its sort.
// ===========================================================================

describe("tick ordering — total and reproducible", () => {
  it("ticks come back in ascending time order", () => {
    const store = pairedStore(ENEMY.id);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    const fired = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: 10,
    });
    expect(fired.length).toBeGreaterThan(1);
    for (let index = 1; index < fired.length; index += 1) {
      expect(fired[index]!.time).toBeGreaterThan(fired[index - 1]!.time);
    }
  });

  it("two enemies tied at one instant are ordered by SCHEDULE order, not key order", () => {
    // The tie-break must be the `sequence` counter. If it silently fell back to
    // the aura store's key order, the result would depend on which enemy was
    // touched first by an unrelated part of the engine.
    function firedOrder(scheduleOrder: readonly string[]): readonly string[] {
      // Store keys are inserted in the OPPOSITE order to the schedule order, so
      // a key-order implementation and a sequence-order implementation give
      // different answers and this test can tell them apart.
      const store: EnemyAuraStore = {};
      for (const id of [...scheduleOrder].reverse()) {
        Object.assign(store, pairedStore(id));
      }
      const queue = createReactionTickQueue();
      for (const id of scheduleOrder) scheduleOn(queue, store, id);
      return advanceReactionTicks({
        queue,
        store,
        enemy: ENEMY,
        untilTime: 1,
      }).map((tick) => tick.enemyId);
    }

    expect(firedOrder(["a", "b"])).toEqual(["a", "b"]);
    expect(firedOrder(["b", "a"])).toEqual(["b", "a"]);
  });

  it("repeated identical drains give identical output — no hidden state", () => {
    function once(): string {
      const store = pairedStore(ENEMY.id);
      const queue = createReactionTickQueue();
      scheduleOn(queue, store, ENEMY.id);
      return JSON.stringify(
        advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 10 }),
      );
    }
    expect(new Set([once(), once(), once()]).size).toBe(1);
  });

  // A gauge of 4 is used for the cut tests below because it yields ticks at
  // t = 1..6, so a cut at t = 3 has ticks strictly on BOTH sides. At the
  // default gauge of 2 the series ends at t = 3 and a cut there would leave
  // the second half empty, making the equality hold vacuously.
  const CUT_GAUGE = 4;
  const CUT_TIME = 3;
  const CUT_HORIZON = 8;

  function drainWhole(): readonly { time: number }[] {
    const store = pairedStore(ENEMY.id, 0, CUT_GAUGE);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    return advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: CUT_HORIZON,
    });
  }

  it("draining in two steps equals draining in one — the horizon is a cut, not a change", () => {
    // A time-driven queue must be resumable at any horizon. If splitting the
    // drain changed the outcome, the tick schedule would depend on HOW OFTEN
    // the main loop happened to call it, i.e. on action spacing.
    const store = pairedStore(ENEMY.id, 0, CUT_GAUGE);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    const first = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: CUT_TIME,
    });
    const second = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: CUT_HORIZON,
    });

    expect([...first, ...second]).toEqual(drainWhole());
  });

  it("the split-drain check is not vacuous — ticks land on BOTH sides of the cut", () => {
    const fired = drainWhole();
    expect(fired.some((tick) => tick.time <= CUT_TIME)).toBe(true);
    expect(fired.some((tick) => tick.time > CUT_TIME)).toBe(true);
  });
});

// ===========================================================================
// 3. THE SNAPSHOT ROUND-TRIP — a checkpoint must be inert and complete.
// ===========================================================================

describe("tick queue snapshot — detached and complete", () => {
  it("a snapshot is not aliased to the live queue", () => {
    // The optimizer holds checkpoints on search nodes while continuing to
    // simulate. If a snapshot aliased live entries, a later drain would mutate
    // a node's stored state and two branches would silently share a clock.
    const store = pairedStore(ENEMY.id);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    const snapshot = snapshotReactionTicks(queue)!;
    const before = JSON.stringify(snapshot);

    advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 10 });

    expect(JSON.stringify(snapshot)).toBe(before);
  });

  it("a restored queue is not aliased to the snapshot either", () => {
    const store = pairedStore(ENEMY.id);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    const snapshot = snapshotReactionTicks(queue)!;
    const before = JSON.stringify(snapshot);

    const restored = restoreReactionTicks(snapshot);
    const restoredStore = pairedStore(ENEMY.id);
    advanceReactionTicks({
      queue: restored,
      store: restoredStore,
      enemy: ENEMY,
      untilTime: 10,
    });

    expect(JSON.stringify(snapshot)).toBe(before);
  });

  it("restoring twice from one snapshot gives two independent queues", () => {
    const store = pairedStore(ENEMY.id);
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    const snapshot = snapshotReactionTicks(queue)!;

    const storeA = pairedStore(ENEMY.id);
    const firedA = advanceReactionTicks({
      queue: restoreReactionTicks(snapshot),
      store: storeA,
      enemy: ENEMY,
      untilTime: 10,
    });
    const storeB = pairedStore(ENEMY.id);
    const firedB = advanceReactionTicks({
      queue: restoreReactionTicks(snapshot),
      store: storeB,
      enemy: ENEMY,
      untilTime: 10,
    });

    expect(firedA.length).toBeGreaterThan(0);
    expect(firedB).toEqual(firedA);
  });

  it("an empty queue snapshots to undefined, and that replays as empty", () => {
    // ABSENT and EMPTY must not be two spellings of one state, or the
    // optimizer's memo splits on a distinction with no meaning.
    expect(snapshotReactionTicks(createReactionTickQueue())).toBeUndefined();
    expect(restoreReactionTicks(undefined)).toEqual({
      entries: [],
      nextSequence: 0,
    });
  });

  it("an explicitly-empty snapshot keeps its sequence counter", () => {
    // Resetting the counter here would let a post-resume schedule reuse a
    // sequence number that a previously-snapshotted entry still holds.
    expect(restoreReactionTicks({ entries: [], nextSequence: 7 })).toEqual({
      entries: [],
      nextSequence: 7,
    });
  });

  it("sequence numbers stay unique when a resumed queue schedules again", () => {
    // The tie-break is only a tie-break while it is injective. A restore that
    // reset `nextSequence` to 0 would hand a NEW entry the sequence an existing
    // entry already has, making the ordering of the two undefined.
    const store: EnemyAuraStore = { ...pairedStore("a"), ...pairedStore("b") };
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, "a");
    scheduleOn(queue, store, "b");

    const restored = restoreReactionTicks(snapshotReactionTicks(queue)!);
    const grown: EnemyAuraStore = { ...store, ...pairedStore("c") };
    scheduleOn(restored, grown, "c");

    const sequences = restored.entries.map((entry) => entry.sequence);
    expect(new Set(sequences).size).toBe(sequences.length);
    expect(restored.entries.length).toBe(3);
  });

  it("a resumed queue reproduces the ORIGINAL run's remaining ticks", () => {
    // The end-to-end statement of the checkpoint contract: cutting a run in
    // half and resuming must give the same ticks as never cutting it.
    const straightStore = pairedStore(ENEMY.id);
    const straightQueue = createReactionTickQueue();
    scheduleOn(straightQueue, straightStore, ENEMY.id);
    const straight = advanceReactionTicks({
      queue: straightQueue,
      store: straightStore,
      enemy: ENEMY,
      untilTime: 8,
    });

    const cutStore = pairedStore(ENEMY.id);
    const cutQueue = createReactionTickQueue();
    scheduleOn(cutQueue, cutStore, ENEMY.id);
    const before = advanceReactionTicks({
      queue: cutQueue,
      store: cutStore,
      enemy: ENEMY,
      untilTime: 2,
    });

    const resumedQueue = restoreReactionTicks(snapshotReactionTicks(cutQueue));
    const resumedStore = restoreEnemyAuras(snapshotEnemyAuras(cutStore));
    const after = advanceReactionTicks({
      queue: resumedQueue,
      store: resumedStore,
      enemy: ENEMY,
      untilTime: 8,
    });

    expect([...before, ...after]).toEqual(straight);
  });
});

// ===========================================================================
// 4. THE DRAINS PREREQUISITE — attacked as a NUMBER, not as a field.
// ===========================================================================

describe("aura drains survive a checkpoint — measured, not inspected", () => {
  // The colocated test proves `drains` round-trips structurally. The reason it
  // MATTERS is numeric: a dropped drain resumes an aura that decays strictly
  // slower, which manufactures reactions the original run never had. That is
  // asserted here as a gauge comparison, so it fails even if the field is
  // carried under a different name or restored with the wrong rate.
  const DRAIN_RATE = 0.5;

  function drainedStore(): EnemyAuraStore {
    const state = applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state;
    const aura = state.auras[0]!;
    return {
      [ENEMY.id]: {
        ...state,
        auras: [withDrain(aura, "test", DRAIN_RATE, 0)],
      },
    };
  }

  function hydroGauge(store: EnemyAuraStore, time: number): number {
    const aura = store[ENEMY.id]?.auras.find((a) => a.element === "hydro");
    return aura === undefined ? 0 : gaugeAt(aura, time);
  }

  it("PRECONDITION: the drain actually changes the decay curve", () => {
    // Without this, the resume comparison below could pass with the drain
    // dropped, simply because the drain never mattered.
    const undrained = { [ENEMY.id]: applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state };
    expect(hydroGauge(drainedStore(), 1)).toBeLessThan(
      hydroGauge(undrained, 1),
    );
  });

  it("a resumed aura decays at the same rate, at every probe time", () => {
    const live = drainedStore();
    const resumed = restoreEnemyAuras(snapshotEnemyAuras(live));
    for (const time of [0, 0.25, 0.5, 1, 1.5, 2, 3]) {
      expect(hydroGauge(resumed, time)).toBeCloseTo(hydroGauge(live, time), 9);
    }
  });

  it("a resumed aura empties at the same instant, not later", () => {
    // The direction of the old bug: a slower-decaying resumed aura stays alive
    // past the point the original died, so it keeps reacting.
    const live = drainedStore();
    const resumed = restoreEnemyAuras(snapshotEnemyAuras(live));
    const emptyTime = (store: EnemyAuraStore): number => {
      for (let t = 0; t <= 20; t += 0.05) {
        if (hydroGauge(store, t) <= 0) return Number(t.toFixed(2));
      }
      return Number.POSITIVE_INFINITY;
    };
    expect(emptyTime(resumed)).toBe(emptyTime(live));
    expect(emptyTime(live)).toBeLessThan(Number.POSITIVE_INFINITY);
  });
});

// ===========================================================================
// 5. THE SCHEDULER MUST NOT FIRE WHEN THERE IS NO REACTION.
// ===========================================================================

describe("the second clock stays silent when it should", () => {
  it("no Electro-Charged pair means no tick, at any horizon", () => {
    const store: EnemyAuraStore = {
      [ENEMY.id]: applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state,
    };
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    expect(
      advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 100 }),
    ).toEqual([]);
  });

  it("a scheduled series on an absent enemy never ticks", () => {
    const store: EnemyAuraStore = {};
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, "no-such-enemy");
    expect(
      advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 100 }),
    ).toEqual([]);
  });

  it("a dead series is REMOVED from the queue, not merely skipped", () => {
    // A skipped-but-retained entry is re-evaluated on every advance for the
    // rest of the run, and would resurrect if the aura were reapplied under
    // the ORIGINAL trigger's attribution rather than the new one's.
    const store: EnemyAuraStore = {
      [ENEMY.id]: applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state,
    };
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 100 });
    expect(queue.entries).toEqual([]);
  });

  it("nextElectroChargedTickTime reports 'never' for a broken pair", () => {
    const store: EnemyAuraStore = {
      [ENEMY.id]: applyElement(EMPTY_AURA_STATE, "hydro", 2, 0).state,
    };
    const queue = createReactionTickQueue();
    scheduleOn(queue, store, ENEMY.id);
    expect(
      nextElectroChargedTickTime(queue.entries[0]!, store),
    ).toBeUndefined();
  });

  it("a rotation without Electro-Charged produces no tick events", () => {
    const hydroOnly = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "skill" }],
      ENEMY,
      { critMode: "never" },
    );
    expect(tickEvents(hydroOnly)).toEqual([]);
  });
});
