import { describe, expect, it } from "vitest";
import {
  auraDecayRate,
  createAura,
  decayAuraState,
  gaugeAt,
  secondsUntilEmpty,
  timeWhenEmpty,
  totalConsumptionPerSecond,
  withAura,
  withDrain,
  withoutDrain,
} from "@/simulation/reactions/aura";
import {
  AURA_GAUGE_RELATIVE_TOLERANCE,
  auraStatesEquivalent,
  gaugesEquivalent,
} from "@/simulation/reactions/auraTolerance";
import {
  ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
} from "@/simulation/reactions/constants";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import type { AuraState } from "@/simulation/reactions/types";
import { findUnsupportedMechanic } from "@/simulation/reactions/unverified";

// ============================================================================
// COUPLED DECAY (`Aura.drains`) — the model change that unblocks a reaction
// tick scheduler.
//
// The pre-existing model stored ONE scalar `decayRate` per aura, which
// structurally could not express "Dendro decays at the SUM of the Dendro and
// Pyro rates". These tests pin the replacement: an ordered list of ATTRIBUTED
// drains, summed into a single total rate, with decay still AFFINE in elapsed
// time.
//
// NOTE ON PROVENANCE: nothing here asserts that Burning actually imposes any
// particular drain. The post-3.0 coefficient is UNKNOWN (see the
// `burning-coupled-decay` entry in `unverified.ts`), so these tests supply
// their own rates as inputs. They prove the MODEL is expressive and correct,
// not that a specific game number is right.
// ============================================================================

const BURNING_SOURCE = "burning";

describe("totalConsumptionPerSecond — rate composition", () => {
  it("is the reciprocal of decayRate when there are no drains", () => {
    const aura = createAura("dendro", 2, 0);
    // decayRate is SECONDS PER GU; the total is GU PER SECOND.
    expect(totalConsumptionPerSecond(aura)).toBeCloseTo(1 / auraDecayRate(2), 12);
  });

  it("adds drains to natural decay in GU/s", () => {
    const aura = withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.25, 0);
    expect(totalConsumptionPerSecond(aura)).toBeCloseTo(
      1 / auraDecayRate(2) + 0.25,
      12,
    );
  });

  it("expresses the SUM-OF-TWO-NATURAL-RATES shape that a scalar could not", () => {
    // This is the exact shape the old model could not represent, and the
    // reason combat-engineer refused to build a scheduler on it: the Dendro
    // aura consuming at (dendroRate + pyroRate). Whether Burning still does
    // this in the live game is a SEPARATE, unresolved question — see
    // `burning-coupled-decay`. Here it is only shown to be REPRESENTABLE.
    const dendroSecondsPerGu = auraDecayRate(2);
    const pyroSecondsPerGu = auraDecayRate(1);
    const dendro = withDrain(
      createAura("dendro", 2, 0),
      BURNING_SOURCE,
      1 / pyroSecondsPerGu,
      0,
    );
    expect(totalConsumptionPerSecond(dendro)).toBeCloseTo(
      1 / dendroSecondsPerGu + 1 / pyroSecondsPerGu,
      12,
    );
    // And it genuinely decays faster: strictly less gauge than the un-drained
    // aura at the same instant.
    const plain = createAura("dendro", 2, 0);
    expect(gaugeAt(dendro, 3)).toBeLessThan(gaugeAt(plain, 3));
  });

  it("ignores non-finite and non-positive drain rates rather than poisoning the total", () => {
    // `withDrain` refuses to store these, so build the state directly to prove
    // the READER is also defensive (a snapshot could carry anything).
    const aura = {
      ...createAura("dendro", 2, 0),
      drains: [
        { source: "nan", ratePerSecond: Number.NaN },
        { source: "inf", ratePerSecond: Number.POSITIVE_INFINITY },
        { source: "neg", ratePerSecond: -1 },
        { source: "ok", ratePerSecond: 0.5 },
      ],
    };
    expect(totalConsumptionPerSecond(aura)).toBeCloseTo(
      1 / auraDecayRate(2) + 0.5,
      12,
    );
  });
});

describe("gaugeAt stays AFFINE in elapsed time under drains", () => {
  // The whole tolerance argument in `auraTolerance.ts` rests on this. If decay
  // stopped being linear in elapsed time, the measured ULP bound would be void.
  it("halving the elapsed time halves the gauge lost", () => {
    // Both sample times must sit strictly INSIDE the aura's lifetime: a 2U
    // dendro aura under a 0.3 GU/s drain empties at ~3.69s, and past that
    // `gaugeAt` clamps at 0, which is not linear. Asserting the lifetime here
    // keeps the test honest if the model's rate composition ever changes.
    const aura = withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.3, 0);
    expect(secondsUntilEmpty(aura)).toBeGreaterThan(3);
    const lostAt1_5 = aura.gauge - gaugeAt(aura, 1.5);
    const lostAt3 = aura.gauge - gaugeAt(aura, 3);
    expect(lostAt3).toBeCloseTo(2 * lostAt1_5, 12);
  });

  it("gauge lost equals elapsed * totalConsumptionPerSecond exactly", () => {
    const aura = withDrain(createAura("hydro", 4, 0), "ec", 0.4, 0);
    const elapsed = 1.75;
    expect(aura.gauge - gaugeAt(aura, elapsed)).toBeCloseTo(
      elapsed * totalConsumptionPerSecond(aura),
      12,
    );
  });

  it("clamps at 0 and never goes negative", () => {
    const aura = withDrain(createAura("dendro", 1, 0), BURNING_SOURCE, 5, 0);
    expect(gaugeAt(aura, 1000)).toBe(0);
  });

  it("is unchanged BIT-FOR-BIT for an aura with no drains", () => {
    // Regression guard: the drained path must not perturb the existing,
    // separately-verified un-drained math.
    const aura = createAura("pyro", 2, 0);
    expect(gaugeAt(aura, 3)).toBe(aura.gauge - 3 / aura.decayRate);
  });
});

describe("secondsUntilEmpty / timeWhenEmpty — derived, not stored", () => {
  it("matches gauge / totalRate", () => {
    const aura = withDrain(createAura("hydro", 2, 0), "ec", 0.4, 0);
    const expected = aura.gauge / totalConsumptionPerSecond(aura);
    expect(secondsUntilEmpty(aura)).toBeCloseTo(expected, 12);
    expect(timeWhenEmpty(aura)).toBeCloseTo(expected, 12);
  });

  it("agrees with gaugeAt: the aura is empty at exactly that time", () => {
    const aura = withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.2, 0);
    const empty = timeWhenEmpty(aura);
    expect(gaugeAt(aura, empty)).toBeCloseTo(0, 9);
    expect(gaugeAt(aura, empty - 0.01)).toBeGreaterThan(0);
    expect(gaugeAt(aura, empty + 0.01)).toBe(0);
  });

  it("respects `since` — timeWhenEmpty is ABSOLUTE, not relative", () => {
    const aura = withDrain(createAura("dendro", 2, 10), BURNING_SOURCE, 0.2, 10);
    expect(timeWhenEmpty(aura)).toBeCloseTo(10 + secondsUntilEmpty(aura), 12);
  });

  it("is +Infinity only when nothing consumes the aura", () => {
    const inert = { element: "pyro" as const, gauge: 1, since: 0, decayRate: Number.POSITIVE_INFINITY };
    expect(secondsUntilEmpty(inert)).toBe(Number.POSITIVE_INFINITY);
    // ...and a drain alone is enough to make it finite again.
    expect(
      secondsUntilEmpty({ ...inert, drains: [{ source: "x", ratePerSecond: 0.4 }] }),
    ).toBeCloseTo(1 / 0.4, 12);
  });

  it("is 0 for an already-empty aura", () => {
    expect(secondsUntilEmpty({ ...createAura("pyro", 2, 0), gauge: 0 })).toBe(0);
  });
});

describe("withDrain / withoutDrain — attribution and re-anchoring", () => {
  it("re-anchors before applying, so a drain is never retroactive", () => {
    // Decay 2s at the natural rate, THEN attach. The gauge at t=2 must equal
    // the un-drained gauge at t=2 — the drain starts from t=2, not from t=0.
    const plain = createAura("dendro", 2, 0);
    const drained = withDrain(plain, BURNING_SOURCE, 0.5, 2);
    expect(drained.since).toBe(2);
    expect(drained.gauge).toBeCloseTo(gaugeAt(plain, 2), 12);
  });

  it("replaces rather than stacks when the same source is attached twice", () => {
    const once = withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.4, 0);
    const twice = withDrain(once, BURNING_SOURCE, 0.4, 0);
    expect(twice.drains).toHaveLength(1);
    expect(totalConsumptionPerSecond(twice)).toBeCloseTo(
      totalConsumptionPerSecond(once),
      12,
    );
  });

  it("keeps distinct sources separate and additive", () => {
    let aura = createAura("dendro", 2, 0);
    aura = withDrain(aura, "burning", 0.3, 0);
    aura = withDrain(aura, "other", 0.2, 0);
    expect(aura.drains).toHaveLength(2);
    expect(totalConsumptionPerSecond(aura)).toBeCloseTo(
      1 / auraDecayRate(2) + 0.5,
      12,
    );
  });

  it("removes only the named source", () => {
    let aura = createAura("dendro", 2, 0);
    aura = withDrain(aura, "burning", 0.3, 0);
    aura = withDrain(aura, "other", 0.2, 0);
    aura = withoutDrain(aura, "burning", 0);
    expect(aura.drains?.map((d) => d.source)).toEqual(["other"]);
  });

  it("OMITS the drains key entirely when the last drain is removed", () => {
    // Absence, not `[]` — the same fold-identity / hash-stability ruling as
    // `reactionBonus` (ROADMAP A1). `[]` and absent hash differently and would
    // split optimizer memo entries for zero information.
    const aura = withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.3, 0);
    const cleared = withoutDrain(aura, BURNING_SOURCE, 0);
    expect("drains" in cleared).toBe(false);
  });

  it("removing an absent source is the identity (aside from re-anchoring)", () => {
    const aura = createAura("dendro", 2, 0);
    const removed = withoutDrain(aura, "never-attached", 0);
    expect(removed).toEqual(aura);
  });

  it("does not store a zero or non-finite rate", () => {
    const base = createAura("dendro", 2, 0);
    expect("drains" in withDrain(base, "z", 0, 0)).toBe(false);
    expect("drains" in withDrain(base, "z", Number.NaN, 0)).toBe(false);
    expect("drains" in withDrain(base, "z", Number.POSITIVE_INFINITY, 0)).toBe(false);
  });

  it("orders drains deterministically regardless of insertion order", () => {
    // Float addition is not associative, so a stable order is what makes
    // `totalConsumptionPerSecond` reproducible.
    const a = withDrain(withDrain(createAura("dendro", 2, 0), "b", 0.1, 0), "a", 0.2, 0);
    const b = withDrain(withDrain(createAura("dendro", 2, 0), "a", 0.2, 0), "b", 0.1, 0);
    expect(a.drains).toEqual(b.drains);
    expect(totalConsumptionPerSecond(a)).toBe(totalConsumptionPerSecond(b));
  });

  it("does not mutate the input aura", () => {
    const aura = createAura("dendro", 2, 0);
    const before = { ...aura };
    withDrain(aura, BURNING_SOURCE, 0.5, 3);
    expect(aura).toEqual(before);
  });
});

describe("drains survive decayAuraState and snapshot round-tripping", () => {
  const drainedState = (): AuraState =>
    withAura(
      EMPTY_AURA_STATE,
      "dendro",
      withDrain(createAura("dendro", 2, 0), BURNING_SOURCE, 0.25, 0),
    );

  it("carries drains through re-anchoring", () => {
    const decayed = decayAuraState(drainedState(), 2);
    expect(decayed.auras[0]?.drains).toEqual([
      { source: BURNING_SOURCE, ratePerSecond: 0.25 },
    ]);
  });

  it("drops a drained aura once the FASTER total rate empties it", () => {
    // The point of the model: the aura must expire EARLIER than natural decay
    // alone would predict. 2U dendro naturally lasts 12s; the drain shortens it.
    const state = drainedState();
    const natural = createAura("dendro", 2, 0);
    const empty = timeWhenEmpty(state.auras[0]!);
    expect(empty).toBeLessThan(timeWhenEmpty(natural));
    expect(decayAuraState(state, empty + 0.001).auras).toHaveLength(0);
    // ...and the un-drained aura is still very much alive at that instant.
    expect(gaugeAt(natural, empty + 0.001)).toBeGreaterThan(0);
  });

  it("ROUND-TRIPS: resume-from-checkpoint stays within the stated tolerance", () => {
    // This is the `resumeFrom` case. Decaying 0->3->7 must match 0->7 within
    // AURA_GAUGE_RELATIVE_TOLERANCE, exactly as for un-drained auras.
    // Sample times stay inside the drained aura's lifetime (~4.17s); past it
    // the aura is dropped entirely and there is no gauge left to compare.
    const start = drainedState();
    expect(secondsUntilEmpty(start.auras[0]!)).toBeGreaterThan(4);
    const stepwise = decayAuraState(decayAuraState(start, 1.5), 3.5);
    const direct = decayAuraState(start, 3.5);
    expect(auraStatesEquivalent(stepwise, direct)).toBe(true);
    // And the residual is orders of magnitude under the ceiling, not merely
    // inside it — see the bound analysis in `auraTolerance.ts`.
    const drift = Math.abs(stepwise.auras[0]!.gauge - direct.auras[0]!.gauge);
    expect(drift).toBeLessThan(AURA_GAUGE_RELATIVE_TOLERANCE * 1e-3);
  });

  it("many re-anchors under a drain stay within tolerance", () => {
    let stepwise = drainedState();
    for (let t = 0.05; t <= 3.5; t += 0.05) stepwise = decayAuraState(stepwise, t);
    const direct = decayAuraState(drainedState(), 3.5);
    expect(
      gaugesEquivalent(stepwise.auras[0]!.gauge, direct.auras[0]!.gauge),
    ).toBe(true);
  });

  it("survives JSON serialisation (drains must be plain data)", () => {
    const state = drainedState();
    const revived = JSON.parse(JSON.stringify(state)) as AuraState;
    expect(auraStatesEquivalent(revived, state)).toBe(true);
    expect(totalConsumptionPerSecond(revived.auras[0]!)).toBe(
      totalConsumptionPerSecond(state.auras[0]!),
    );
  });
});

describe("auraStatesEquivalent is SOUND with respect to drains", () => {
  it("two auras differing ONLY in drains are NOT equivalent", () => {
    // Without this, states that decay at different rates would compare equal
    // and diverge on the very next query — unsound for the resume case.
    const plain = withAura(EMPTY_AURA_STATE, "dendro", createAura("dendro", 2, 0));
    const drained = withAura(
      EMPTY_AURA_STATE,
      "dendro",
      { ...createAura("dendro", 2, 0), drains: [{ source: "x", ratePerSecond: 0.4 }] },
    );
    expect(auraStatesEquivalent(plain, drained)).toBe(false);
  });

  it("differing drain RATE is not equivalent", () => {
    const mk = (rate: number): AuraState =>
      withAura(EMPTY_AURA_STATE, "dendro", {
        ...createAura("dendro", 2, 0),
        drains: [{ source: "x", ratePerSecond: rate }],
      });
    expect(auraStatesEquivalent(mk(0.4), mk(0.5))).toBe(false);
  });

  it("differing drain SOURCE is not equivalent even at the same rate", () => {
    const mk = (source: string): AuraState =>
      withAura(EMPTY_AURA_STATE, "dendro", {
        ...createAura("dendro", 2, 0),
        drains: [{ source, ratePerSecond: 0.4 }],
      });
    expect(auraStatesEquivalent(mk("burning"), mk("other"))).toBe(false);
  });

  it("absent and [] compare EQUAL — both mean no drains", () => {
    // Only absent is ever stored, but a deserialised snapshot could
    // materialise `[]`, and that must not read as a different state.
    const absent = withAura(EMPTY_AURA_STATE, "dendro", createAura("dendro", 2, 0));
    const empty = withAura(EMPTY_AURA_STATE, "dendro", {
      ...createAura("dendro", 2, 0),
      drains: [],
    });
    expect(auraStatesEquivalent(absent, empty)).toBe(true);
  });
});

// ============================================================================
// ELECTRO-CHARGED bookkeeping.
//
// Per KQM Elemental Gauge Theory, EC is specified entirely in GAUGE:
//   - ticks once per second while enough of BOTH gauges remain,
//   - each tick consumes 0.4U from BOTH,
//   - EXCEPTION: when a gauge fully decays, the next tick occurs early, at the
//     moment it empties — UNLESS it empties within 0.5s of the last tick, in
//     which case there is no further tick.
//
// These tests prove the aura model can ANSWER the questions a scheduler asks.
// They do NOT implement the scheduler: timing is engine-owned per AGENTS.md.
// ============================================================================
describe("EC aura bookkeeping is EXPRESSIBLE on this model", () => {
  const ecState = (): AuraState => {
    let state = withAura(EMPTY_AURA_STATE, "hydro", createAura("hydro", 1, 0));
    state = withAura(state, "electro", createAura("electro", 1, 0));
    return state;
  };

  it("a tick is representable as an equal gauge subtraction from BOTH auras", () => {
    const state = ecState();
    const tick = (aura: { gauge: number }): number =>
      aura.gauge - ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK;
    expect(tick(state.auras[0]!)).toBeCloseTo(0.8 - 0.4, 12);
    expect(tick(state.auras[1]!)).toBeCloseTo(0.8 - 0.4, 12);
  });

  it("answers 'when does a gauge empty' WITHOUT a seconds-of-aura model", () => {
    // The obstacle previously recorded — that EC needs a second, seconds-based
    // aura model — was a misreading. Seconds-remaining is DERIVED from gauge.
    const aura = ecState().auras[0]!;
    expect(secondsUntilEmpty(aura)).toBeCloseTo(
      aura.gauge * auraDecayRate(1),
      9,
    );
  });

  it("supports the EARLY-TICK branch: gauge empties MORE than 0.5s after the last tick", () => {
    // 1U hydro: 0.8U at 11.875 s/GU => empties at 9.5s. With a tick at 8.0s,
    // the gap is 1.5s > 0.5s, so a premature tick fires at the empty moment.
    const aura = ecState().auras[0]!;
    const empties = timeWhenEmpty(aura);
    expect(empties).toBeCloseTo(9.5, 6);
    const lastTick = 8.0;
    expect(empties - lastTick).toBeGreaterThan(0.5);
  });

  it("supports the NO-TICK branch: gauge empties WITHIN 0.5s of the last tick", () => {
    const aura = ecState().auras[0]!;
    const empties = timeWhenEmpty(aura);
    const lastTick = 9.2;
    expect(empties - lastTick).toBeLessThan(0.5);
  });

  it("a tick's gauge subtraction MOVES the empty time earlier, deterministically", () => {
    // The scheduler's feedback loop: each tick shortens the remaining aura, so
    // `timeWhenEmpty` must be recomputed after every tick rather than cached.
    const aura = ecState().auras[0]!;
    const afterTick = {
      ...aura,
      gauge: aura.gauge - ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
      since: 1,
    };
    expect(timeWhenEmpty(afterTick)).toBeLessThan(timeWhenEmpty(aura));
  });

  it("EC is still declared UNSUPPORTED, for SCHEDULING only", () => {
    // Honesty pin: the model is now expressive enough, but nothing schedules
    // ticks, so auras still outlive the game's. If a scheduler ever lands,
    // this assertion must be revisited deliberately.
    const gap = findUnsupportedMechanic("electro-charged-ticks");
    expect(gap?.status).toBe("unsupported");
    expect(gap?.note).toContain("SCHEDULING");
  });
});

describe("the coupled-decay gap stays honestly declared", () => {
  it("`burning-coupled-decay` is recorded as uncertain, not silently fixed", () => {
    const gap = findUnsupportedMechanic("burning-coupled-decay");
    expect(gap).toBeDefined();
    expect(gap?.status).toBe("uncertain");
  });

  it("NO drain is attached anywhere by default — the coefficient is unknown", () => {
    // The load-bearing honesty test. The model CAN express coupled decay; we
    // decline to assert a post-3.0 number we cannot cross-verify. A future
    // change that wires in the pre-3.0 summed rate must fail here.
    const dendro = createAura("dendro", 2, 0);
    expect("drains" in dendro).toBe(false);
    expect(totalConsumptionPerSecond(dendro)).toBe(1 / dendro.decayRate);
  });
});
