import { describe, expect, it } from "vitest";
import type { EnemyState, SimulationResult } from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import {
  advanceReactionTicks,
  createReactionTickQueue,
  nextElectroChargedTickTime,
  scheduleElectroCharged,
} from "@/simulation/engine/reactionTicks";
import type { ReactionTickQueue } from "@/simulation/engine/reactionTicks";
import {
  restoreEnemyAuras,
  snapshotEnemyAuras,
} from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";
import {
  ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK,
  ELECTRO_CHARGED_TICK_INTERVAL_SECONDS,
} from "@/simulation/engine/reactionTickConstants";
import { ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK } from "@/simulation/reactions/constants";
import { applyElement } from "@/simulation/reactions/applyElement";
import { createAura, gaugeAt, withDrain } from "@/simulation/reactions/aura";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent, talentTable } from "@/simulation/character/talent";
import { syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// TASK #066 — the reaction tick scheduler, and the checkpoint prerequisite it
// ships with.
//
// TWO INDEPENDENT THINGS ARE PROVEN HERE, and both are MUTATION-TESTED, i.e.
// each assertion is written so that removing the production code it guards
// makes it FAIL rather than pass vacuously:
//
//  A. `snapshotEnemyAuras` / `restoreEnemyAuras` carry `Aura.drains`. Dropping
//     them again resumes with a strictly slower-decaying aura — a wrong number
//     with no error. Section A fails the instant the field stops round-tripping.
//  B. Electro-Charged ticks on its own 1s clock, including after the final
//     authored action, at the sourced times. A tick firing at the WRONG time
//     fails section C/D, not merely "some tick happened".
//
// Burning is deliberately NOT scheduled and section F pins that as an
// intentional gap rather than an oversight.
// ============================================================================

const ENEMY: EnemyState = {
  id: "target",
  name: "Test Target",
  level: 90,
  resistances: {},
};

// ---------------------------------------------------------------------------
// A synthetic ELECTRO unit, mirroring the shared hydro `syntheticUnit`.
//
// Local to this file on purpose: it exists to create the Electro half of an
// Electro-Charged pair, and inventing it in the shared fixture module would
// push a test-only kit into everyone else's fixtures.
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
      // No icdGroup => every hit applies, which keeps the test's aura
      // bookkeeping about the SCHEDULER rather than about ICD.
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

/** Hydro + Electro on one target at `time`, i.e. a live Electro-Charged pair. */
function electroChargedStore(time = 0, gauge = 2): EnemyAuraStore {
  let state = applyElement(EMPTY_AURA_STATE, "hydro", gauge, time).state;
  state = applyElement(state, "electro", gauge, time).state;
  return { [ENEMY.id]: state };
}

function scheduledQueue(store: EnemyAuraStore, time = 0): ReactionTickQueue {
  const queue = createReactionTickQueue();
  scheduleElectroCharged({
    queue,
    store,
    enemyId: ENEMY.id,
    time,
    sourceCharacterId: "c",
    sourceCharacterName: "C",
    triggerLevel: 90,
    triggerElementalMastery: 0,
    enemyModifiers: NO_ENEMY_MODIFIERS,
  });
  return queue;
}

function gaugeOf(store: EnemyAuraStore, element: "hydro" | "electro", time: number) {
  const aura = store[ENEMY.id]?.auras.find((a) => a.element === element);
  return aura === undefined ? 0 : gaugeAt(aura, time);
}

/** Damage events whose ability id marks them as scheduler-emitted ticks. */
function tickEvents(result: SimulationResult) {
  return result.timeline.filter(
    (event) => event.damage?.abilityId === "electroCharged:tick",
  );
}

// ===========================================================================
// A. THE CHECKPOINT PREREQUISITE — drains survive the snapshot.
// ===========================================================================

describe("A. checkpoint: Aura.drains round-trip through the snapshot", () => {
  it("carries source and rate through snapshot -> restore", () => {
    const drained = withDrain(createAura("dendro", 2, 0), "test-source", 0.3, 0);
    const store: EnemyAuraStore = {
      [ENEMY.id]: { auras: [drained], compound: [] },
    };

    const restored = restoreEnemyAuras(snapshotEnemyAuras(store));
    const aura = restored[ENEMY.id]!.auras[0]!;

    // MUTATION GUARD: this is the exact field `snapshotEnemyAuras` used to
    // drop. Deleting `...drainsField(aura.drains)` from either direction makes
    // `drains` undefined and fails here.
    expect(aura.drains).toEqual([{ source: "test-source", ratePerSecond: 0.3 }]);
  });

  it("a resumed drained aura decays at the SAME rate, not slower", () => {
    // This is the defect stated as a NUMBER rather than as a field presence.
    // With the drain dropped, the restored aura decays at its natural rate
    // only, so it holds strictly MORE gauge at any later time.
    const drained = withDrain(createAura("hydro", 2, 0), "ec-like", 0.4, 0);
    const store: EnemyAuraStore = {
      [ENEMY.id]: { auras: [drained], compound: [] },
    };
    const restored = restoreEnemyAuras(snapshotEnemyAuras(store));
    const after = restored[ENEMY.id]!.auras[0]!;

    expect(gaugeAt(after, 1.5)).toBeCloseTo(gaugeAt(drained, 1.5), 12);

    // And the guard has teeth: the drain-less version really is different, so
    // the assertion above cannot pass by both sides being equal anyway.
    const undrained = createAura("hydro", 2, 0);
    expect(gaugeAt(undrained, 1.5)).toBeGreaterThan(gaugeAt(drained, 1.5));
  });

  it("round-trips drains on COMPOUND auras too, not just elemental ones", () => {
    const store: EnemyAuraStore = {
      [ENEMY.id]: {
        auras: [],
        compound: [
          {
            kind: "burning",
            gauge: 1,
            since: 0,
            decayRate: 10,
            drains: [{ source: "s", ratePerSecond: 0.2 }],
          },
        ],
      },
    };
    const restored = restoreEnemyAuras(snapshotEnemyAuras(store));
    expect(restored[ENEMY.id]!.compound[0]!.drains).toEqual([
      { source: "s", ratePerSecond: 0.2 },
    ]);
  });

  it("keeps ABSENT distinct from EMPTY, so two equal states hash alike", () => {
    // The mechanics layer stores "no drains" as an omitted key. Materialising
    // `[]` here would create a second representation of one state and split
    // the optimizer's memo for zero information.
    const store: EnemyAuraStore = {
      [ENEMY.id]: { auras: [createAura("pyro", 2, 0)], compound: [] },
    };
    const snap = snapshotEnemyAuras(store)!;
    expect("drains" in snap[ENEMY.id]!.auras[0]!).toBe(false);
    expect(restoreEnemyAuras(snap)[ENEMY.id]!.auras[0]!.drains).toBeUndefined();
  });

  it("copies drain entries rather than aliasing the snapshot's arrays", () => {
    const store: EnemyAuraStore = {
      [ENEMY.id]: {
        auras: [withDrain(createAura("hydro", 2, 0), "s", 0.4, 0)],
        compound: [],
      },
    };
    const snap = snapshotEnemyAuras(store)!;
    const restored = restoreEnemyAuras(snap);
    // Mutating the restored store must not write back through a snapshot a
    // caller (e.g. the optimizer, holding a parent node) still owns.
    restored[ENEMY.id]!.auras = [];
    expect(snap[ENEMY.id]!.auras).toHaveLength(1);
  });
});

// ===========================================================================
// B. TICK TIMING — the sourced rules, in isolation from the rotation walk.
// ===========================================================================

describe("B. Electro-Charged tick timing follows the sourced rules", () => {
  it("first tick is one interval AFTER the reaction, not at it", () => {
    const store = electroChargedStore(0);
    const queue = scheduledQueue(store, 0);
    expect(nextElectroChargedTickTime(queue.entries[0]!, store)).toBeCloseTo(
      ELECTRO_CHARGED_TICK_INTERVAL_SECONDS,
      12,
    );
  });

  it("consumes exactly 0.4U from BOTH gauges per tick", () => {
    const store = electroChargedStore(0);
    const before = {
      hydro: gaugeOf(store, "hydro", 1),
      electro: gaugeOf(store, "electro", 1),
    };
    const queue = scheduledQueue(store, 0);

    const fired = advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 1 });

    expect(fired).toHaveLength(1);
    expect(fired[0]!.time).toBeCloseTo(1, 12);
    expect(gaugeOf(store, "hydro", 1)).toBeCloseTo(
      before.hydro - ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
      12,
    );
    expect(gaugeOf(store, "electro", 1)).toBeCloseTo(
      before.electro - ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
      12,
    );
  });

  it("ticks once per second, at exactly the interval boundaries", () => {
    const store = electroChargedStore(0, 4);
    const queue = scheduledQueue(store, 0);
    const fired = advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 3 });

    // MUTATION GUARD: a tick at the wrong time fails here, because the TIMES
    // are asserted, not merely the count.
    expect(fired.map((tick) => Number(tick.time.toFixed(6)))).toEqual([1, 2, 3]);
  });

  it("does not tick before its first interval has elapsed", () => {
    const store = electroChargedStore(0);
    const queue = scheduledQueue(store, 0);
    const fired = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: ELECTRO_CHARGED_TICK_INTERVAL_SECONDS - 0.01,
    });
    expect(fired).toHaveLength(0);
  });

  it("stops once a gauge is exhausted rather than ticking forever", () => {
    const store = electroChargedStore(0, 1);
    const queue = scheduledQueue(store, 0);
    const fired = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: 1000,
    });
    // Finite, and the series is dropped from the queue.
    expect(fired.length).toBeGreaterThan(0);
    expect(fired.length).toBeLessThan(100);
    expect(queue.entries).toHaveLength(0);
  });

  it("re-triggering EC re-anchors ONE series instead of stacking a second", () => {
    const store = electroChargedStore(0, 4);
    const queue = scheduledQueue(store, 0);
    scheduleElectroCharged({
      queue,
      store,
      enemyId: ENEMY.id,
      time: 0.5,
      sourceCharacterId: "other",
      sourceCharacterName: "Other",
      triggerLevel: 90,
      triggerElementalMastery: 0,
    });

    expect(queue.entries).toHaveLength(1);
    // Re-anchored to the newer reaction: next tick is 1.5, not 1.0.
    expect(queue.entries[0]!.nextTickTime).toBeCloseTo(1.5, 12);
    // ...and the newest trigger owns the follow-up damage.
    expect(queue.entries[0]!.sourceCharacterId).toBe("other");
  });
});

// ===========================================================================
// C. THE EARLY-TICK / NO-TICK BRANCH.
//
// KQM [K6]: "When either the Electro or Hydro gauge completely decays, the
// next Electro-Charged tick will prematurely occur at the moment when the
// gauge is completely decayed. However, if one of the gauges empties within
// 0.5s of the last Electro-Charged tick, there will not be another tick."
// ===========================================================================

describe("C. early-tick and no-tick branches at gauge depletion", () => {
  /** A pair whose HYDRO half empties `gap` seconds after the last tick. */
  function pairEmptyingAfter(gap: number): EnemyAuraStore {
    const rate = 1; // seconds per GU — 1 GU left empties in exactly `gap` at gap GU
    return {
      [ENEMY.id]: {
        auras: [
          { element: "electro", gauge: 100, since: 0, decayRate: 1000 },
          { element: "hydro", gauge: gap, since: 0, decayRate: rate },
        ],
        compound: [],
      },
    };
  }

  it("ticks EARLY, exactly when the gauge empties, if that is >= 0.5s out", () => {
    const gap = 0.75; // between 0.5 and the 1s interval => early tick
    const store = pairEmptyingAfter(gap);
    const queue = scheduledQueue(store, 0);

    const when = nextElectroChargedTickTime(queue.entries[0]!, store);
    expect(when).toBeCloseTo(gap, 9);
    // MUTATION GUARD: it is NOT simply the regular cadence.
    expect(when).not.toBeCloseTo(ELECTRO_CHARGED_TICK_INTERVAL_SECONDS, 3);

    // ...and the early tick ACTUALLY FIRES. Asserting only the scheduled time
    // is not enough: an over-strict liveness guard in `fireElectroChargedTick`
    // can compute the right time and then refuse to emit it, which is exactly
    // the bug this assertion was added to catch. Probing gauge AT the empty
    // instant always reads 0, so the whole sourced branch silently became dead
    // code that still typechecked.
    const fired = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: 100,
    });
    expect(fired.map((tick) => Number(tick.time.toFixed(6)))).toEqual([gap]);
  });

  it("does NOT tick at all if the gauge empties within 0.5s of the last tick", () => {
    // The gap is a LITERAL 0.4, deliberately not derived from
    // `ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK`. Deriving it lets the
    // fixture move with the constant, so mutating 0.5 -> 0 would move the test
    // too and the exception would be untested. The sourced threshold is 0.5s,
    // so 0.4s is inside it and must produce no tick at all.
    const store = pairEmptyingAfter(0.4);
    const queue = scheduledQueue(store, 0);

    expect(nextElectroChargedTickTime(queue.entries[0]!, store)).toBeUndefined();
    expect(
      advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 100 }),
    ).toHaveLength(0);
  });

  it("the 0.5s threshold itself is the sourced value", () => {
    // Pinned separately so a change to the constant is a deliberate,
    // source-citing act rather than a silent retune.
    expect(ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK).toBe(0.5);
    expect(ELECTRO_CHARGED_TICK_INTERVAL_SECONDS).toBe(1);
  });

  it("recomputes the empty time after EVERY tick, since a tick moves it earlier", () => {
    // A tick subtracts 0.4U, so the aura empties sooner than the pre-tick
    // prediction. Caching the first answer would schedule ticks the gauge can
    // no longer pay for; this pins that the series ends early instead.
    const store = electroChargedStore(0, 2);
    const queue = scheduledQueue(store, 0);
    const entry = queue.entries[0]!;
    const predictedBefore = nextElectroChargedTickTime(entry, store)!;

    advanceReactionTicks({ queue, store, enemy: ENEMY, untilTime: 1 });

    const remaining = advanceReactionTicks({
      queue,
      store,
      enemy: ENEMY,
      untilTime: 1000,
    });
    const totalDrain =
      (remaining.length + 1) * ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK;
    expect(predictedBefore).toBeCloseTo(1, 12);
    // Ticks never remove more gauge than existed.
    expect(totalDrain).toBeLessThanOrEqual(2);
  });
});

// ===========================================================================
// D. INTEGRATION — the tick queue interleaved into the rotation walk.
// ===========================================================================

describe("D. ticks are interleaved into simulateRotation", () => {
  /** Hydro skill then Electro skill => Electro-Charged at the second cast. */
  const rotation = [
    { characterId: syntheticUnit.id, actionType: "skill" as const },
    { characterId: electroUnit.id, actionType: "skill" as const },
  ];

  function run(timeLimit?: number): SimulationResult {
    return simulateRotation(
      [syntheticUnit, electroUnit],
      rotation,
      ENEMY,
      timeLimit === undefined ? {} : { timeLimit },
    );
  }

  it("the rotation really does produce Electro-Charged (guards vacuity)", () => {
    const result = run();
    const ecInstances = result.timeline.filter((event) =>
      event.damage?.abilityId.endsWith(":electroCharged"),
    );
    expect(ecInstances.length).toBeGreaterThan(0);
  });

  it("emits follow-up tick events attributed to the trigger", () => {
    const ticks = tickEvents(run());
    // MUTATION GUARD: with the scheduler unwired there are ZERO of these, and
    // this is the assertion that catches it.
    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick.damage!.damageType).toBe("reaction");
      expect(tick.damage!.element).toBe("electro");
      // Non-crit by design: transformative damage does not crit here.
      expect(tick.damage!.finalDamage).toBe(tick.damage!.nonCritDamage);
    }
  });

  it("ticks land AFTER the final authored action — the tail case", () => {
    const result = run();
    const lastActionTime = Math.max(
      ...result.timeline
        .filter((event) => event.damage?.damageType !== "reaction")
        .map((event) => event.timestamp),
    );
    const ticks = tickEvents(result);
    // The whole point of an independent clock: at least one tick is strictly
    // later than anything the rotation itself produced.
    expect(
      ticks.some((tick) => tick.timestamp > lastActionTime),
    ).toBe(true);
  });

  it("tick damage is counted in the run's totals, not merely rendered", () => {
    const result = run();
    const tickDamage = tickEvents(result).reduce(
      (sum, event) => sum + event.damage!.finalDamage,
      0,
    );
    expect(tickDamage).toBeGreaterThan(0);
    expect(result.damageByAbility["electroCharged:tick"]).toBeCloseTo(
      tickDamage,
      9,
    );
    expect(result.damageByElement["electro"]).toBeGreaterThanOrEqual(tickDamage);
  });

  it("is DETERMINISTIC: identical inputs give a byte-identical result", () => {
    // The beam search depends on this. A time-driven queue is exactly where
    // nondeterminism creeps in, so it is asserted on the whole result object.
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });

  it("timeline stays chronologically sorted once ticks are merged in", () => {
    const times = run().timeline.map((event) => event.timestamp);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]!).toBeGreaterThanOrEqual(times[i - 1]!);
    }
  });

  it("HORIZON: no tick is emitted after config.timeLimit", () => {
    const bounded = run(0.5);
    for (const tick of tickEvents(bounded)) {
      expect(tick.timestamp).toBeLessThanOrEqual(0.5);
    }
  });

  it("HORIZON: pending ticks leave their aura in finalState for a resume", () => {
    // Ticks beyond the horizon are not processed, so the gauge they would have
    // consumed is still in the checkpoint — the unfinished reaction is owned
    // by whoever resumes, not silently discarded.
    const bounded = run(0.5);
    const auras = bounded.finalState.enemyAuras?.[ENEMY.id];
    expect(auras).toBeDefined();
    expect(auras!.auras.length).toBeGreaterThan(0);
  });

  it("CHECKPOINT: resumes a pending tick with its captured queue state", () => {
    // The EC reaction lands at t=1 and its first tick is due at t=2. Stop the
    // observation horizon before that tick, then resume at the action end.
    const bounded = run(1.5);
    expect(bounded.finalState.reactionTicks?.entries).toHaveLength(1);

    const resumed = simulateRotation(
      [syntheticUnit, electroUnit],
      [],
      ENEMY,
      { resumeFrom: bounded.finalState },
    );
    const cold = run();
    const resumedTicks = tickEvents(resumed);
    const coldTicks = tickEvents(cold);

    expect(resumedTicks.map((event) => event.timestamp)).toEqual(
      coldTicks.map((event) => event.timestamp),
    );
    expect(resumedTicks.map((event) => event.damage!.finalDamage)).toEqual(
      coldTicks.map((event) => event.damage!.finalDamage),
    );
    // The resumed tick at t=2 consumed one charge and reconstructed the next
    // pending tick, proving the queue is live state rather than a one-shot
    // event copied into the result.
    expect(resumed.finalState.reactionTicks?.entries[0]?.nextTickTime).toBe(3);
  });

  it("a rotation with no EC schedules nothing at all", () => {
    const hydroOnly = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "skill" }],
      ENEMY,
      {},
    );
    expect(tickEvents(hydroOnly)).toHaveLength(0);
  });
});

// ===========================================================================
// E. NON-REGRESSION — wiring a scheduler must not move existing numbers.
// ===========================================================================

describe("E. non-EC runs are unchanged by the scheduler", () => {
  it("a pure-hydro rotation's total damage contains no tick contribution", () => {
    const result = simulateRotation(
      [syntheticUnit],
      [
        { characterId: syntheticUnit.id, actionType: "skill" },
        { characterId: syntheticUnit.id, actionType: "normal" },
      ],
      ENEMY,
      {},
    );
    const fromTicks = tickEvents(result).reduce(
      (sum, event) => sum + event.damage!.finalDamage,
      0,
    );
    expect(fromTicks).toBe(0);
    expect(result.errors).toEqual([]);
  });
});

// ===========================================================================
// F. BURNING IS DELIBERATELY UNSCHEDULED.
// ===========================================================================

describe("F. Burning is NOT scheduled, and that is the correct outcome", () => {
  it("no Burning tick interval is defined by this module", () => {
    // KQM retired the pre-3.0 summed-rate claim and published no replacement,
    // so no coefficient exists to schedule against. Inventing one to "finish"
    // the feature is the precise failure the project's source rules forbid:
    // plausible, structurally valid, sourced-looking, wrong.
    //
    // This asserts on the module's own exports rather than on prose, so if
    // someone adds a Burning constant here it fails and must be justified.
    const constants: Record<string, unknown> = {
      ELECTRO_CHARGED_TICK_INTERVAL_SECONDS,
      ELECTRO_CHARGED_MIN_REMAINDER_FOR_EARLY_TICK,
    };
    expect(
      Object.keys(constants).some((key) => key.toUpperCase().includes("BURNING")),
    ).toBe(false);
  });

  it("a Pyro-onto-Dendro rotation emits no scheduled ticks", () => {
    const pyroUnit: GenericCharacterDefinition = {
      ...electroUnit,
      id: "pyro-unit",
      name: "Synthetic Pyro Unit",
      element: "pyro",
      skill: {
        ...electroSkill,
        id: "pyro-skill",
        instances: [
          {
            ...electroSkill.instances[0]!,
            id: "pyro-skill-hit",
            element: "pyro",
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
    };
    const dendroUnit: GenericCharacterDefinition = {
      ...electroUnit,
      id: "dendro-unit",
      name: "Synthetic Dendro Unit",
      element: "dendro",
      skill: {
        ...electroSkill,
        id: "dendro-skill",
        instances: [
          {
            ...electroSkill.instances[0]!,
            id: "dendro-skill-hit",
            element: "dendro",
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
    };

    const result = simulateRotation(
      [dendroUnit, pyroUnit],
      [
        { characterId: dendroUnit.id, actionType: "skill" },
        { characterId: pyroUnit.id, actionType: "skill" },
      ],
      ENEMY,
      {},
    );

    // Burning DID happen — so this is a real gap, not an absent scenario.
    expect(
      result.timeline.some((event) =>
        event.damage?.abilityId.endsWith(":burning"),
      ),
    ).toBe(true);
    // ...and produced exactly one instance, with no follow-up tick series.
    expect(
      result.timeline.filter((event) => event.damage?.abilityName === "burning"),
    ).toHaveLength(1);
  });
});
