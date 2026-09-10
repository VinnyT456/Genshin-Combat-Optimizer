import { describe, expect, it } from "vitest";
import {
  applyElement,
  auraDecayRate,
  consumeAura,
  createAura,
  decayAuraState,
  evaluateIcd,
  gaugeAt,
  isExpired,
  refreshAura,
  sanitizeElementalMastery,
  sanitizeGauge,
  sanitizeTime,
  toReactionModifiers,
  EMPTY_AURA_STATE,
} from "@/simulation/reactions";
import type {
  Aura,
  AuraElement,
  AuraState,
  IcdBehaviour,
} from "@/simulation/reactions/types";

// ============================================================================
// TASK #026 regression suite.
//
// D1: a non-finite gauge must never ENTER aura state, and every aura must
//     eventually expire.
// D2: ICD negative elapsed = fresh window.
//
// These REPLACE the change-detectors qa pinned as `DEFECT D1` / `DEFECT D2` in
// `src/tests/reactionsRegression.test.ts`, which recorded the broken
// behaviour so that a fix would be visible.
// ============================================================================

/** Every non-finite double, plus the negatives that already behaved correctly. */
const NON_FINITE = [
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.NaN,
] as const;

const BAD_GAUGES = [...NON_FINITE, -1, -1e9] as const;

const LEVEL_90 = 90;
const RES_NEUTRAL = 1;
const FAR_FUTURE = 1e9;

/** Assert the structural invariant: everything stored is finite. */
function expectFiniteState(state: AuraState): void {
  for (const aura of state.auras) {
    expect(Number.isFinite(aura.gauge)).toBe(true);
    expect(Number.isFinite(aura.since)).toBe(true);
    expect(Number.isFinite(aura.decayRate)).toBe(true);
  }
  for (const aura of state.compound) {
    expect(Number.isFinite(aura.gauge)).toBe(true);
    expect(Number.isFinite(aura.since)).toBe(true);
    expect(Number.isFinite(aura.decayRate)).toBe(true);
  }
}

function freshAura(element: AuraElement, gauge: number): AuraState {
  return applyElement(EMPTY_AURA_STATE, element, gauge, 0).state;
}

describe("sanitizers — the single non-finite rule", () => {
  it("sanitizeGauge maps every non-finite and non-positive value to 0", () => {
    for (const bad of BAD_GAUGES) expect(sanitizeGauge(bad)).toBe(0);
    expect(sanitizeGauge(0)).toBe(0);
  });

  it("sanitizeGauge is the identity on legal gauges", () => {
    for (const good of [0.001, 1, 1.5, 2, 4, 8, 1e6]) {
      expect(sanitizeGauge(good)).toBe(good);
    }
  });

  it("sanitizeTime maps non-finite to 0 and preserves finite times incl. negatives", () => {
    for (const bad of NON_FINITE) expect(sanitizeTime(bad)).toBe(0);
    for (const good of [-5, 0, 12.5]) expect(sanitizeTime(good)).toBe(good);
  });

  it("sanitizeElementalMastery maps non-finite to 0 and preserves finite EM", () => {
    for (const bad of NON_FINITE) expect(sanitizeElementalMastery(bad)).toBe(0);
    for (const good of [-100, 0, 200, 5000]) {
      expect(sanitizeElementalMastery(good)).toBe(good);
    }
  });
});

describe("D1 — a non-finite gauge can no longer enter aura state", () => {
  it("applyElement with a non-finite gauge stores nothing and reacts with nothing", () => {
    for (const bad of BAD_GAUGES) {
      const onto = freshAura("pyro", 2);
      const result = applyElement(onto, "hydro", bad, 0);
      // Treated as 0U: no reaction, and the existing aura is untouched.
      expect(result.reactions).toEqual([]);
      expect(result.state.auras.map((a) => a.element)).toEqual(["pyro"]);
      expectFiniteState(result.state);
    }
  });

  it("+Infinity specifically — the member of the class that used to leak", () => {
    const state = applyElement(
      EMPTY_AURA_STATE,
      "pyro",
      Number.POSITIVE_INFINITY,
      0,
    ).state;
    // No aura at all: an infinite application is treated as absent, not as a
    // saturated one. Previously this stored {gauge: Infinity, decayRate: NaN}.
    expect(state.auras).toEqual([]);
  });

  it("createAura never stores a non-finite field, for any input", () => {
    for (const bad of BAD_GAUGES) {
      for (const badTime of NON_FINITE) {
        const aura = createAura("cryo", bad, badTime);
        expect(Number.isFinite(aura.gauge)).toBe(true);
        expect(Number.isFinite(aura.since)).toBe(true);
        // A 0-gauge aura carries the +Infinity "never decays" sentinel, but it
        // is already expired so it can never be retained by the state.
        expect(Number.isNaN(aura.decayRate)).toBe(false);
        expect(isExpired(aura, 0)).toBe(true);
      }
    }
  });

  it("auraDecayRate never returns NaN (the Infinity/Infinity bug)", () => {
    for (const bad of BAD_GAUGES) {
      expect(Number.isNaN(auraDecayRate(bad))).toBe(false);
      expect(auraDecayRate(bad)).toBe(Number.POSITIVE_INFINITY);
    }
    // Legal gauges keep their published rates.
    expect(auraDecayRate(1)).toBeCloseTo(11.875, 10);
    expect(auraDecayRate(2)).toBeCloseTo(7.5, 10);
  });

  it("refreshAura never stores a non-finite field, incl. the Pyro exception", () => {
    for (const element of ["pyro", "hydro"] as const) {
      const existing = createAura(element, 2, 0);
      for (const bad of BAD_GAUGES) {
        const next = refreshAura(existing, bad, 1);
        expect(Number.isFinite(next.gauge)).toBe(true);
        expect(Number.isFinite(next.since)).toBe(true);
        expect(Number.isFinite(next.decayRate)).toBe(true);
      }
    }
  });

  it("consumeAura treats a non-finite consumption as 0 GU, not as corruption", () => {
    const state = freshAura("pyro", 2);
    const before = state.auras[0]!.gauge;
    for (const bad of NON_FINITE) {
      const next = consumeAura(state, "pyro", bad, 0);
      expectFiniteState(next);
      expect(next.auras[0]?.gauge).toBe(before);
    }
  });
});

describe("D1 — every aura eventually expires (no immortal aura)", () => {
  it("a state built from any gauge is empty in the far future", () => {
    for (const gauge of [...BAD_GAUGES, 0.001, 1, 1.5, 2, 4, 8, 1e6]) {
      const state = applyElement(EMPTY_AURA_STATE, "pyro", gauge, 0).state;
      expect(decayAuraState(state, FAR_FUTURE).auras).toEqual([]);
    }
  });

  it("stored decay rates are strictly positive and finite, so gauge strictly decreases", () => {
    for (const gauge of [0.001, 1, 1.5, 2, 4, 8, 1e6]) {
      const aura = applyElement(EMPTY_AURA_STATE, "electro", gauge, 0).state
        .auras[0];
      expect(aura).toBeDefined();
      expect(Number.isFinite(aura!.decayRate)).toBe(true);
      expect(aura!.decayRate).toBeGreaterThan(0);
      expect(gaugeAt(aura!, 1)).toBeLessThan(gaugeAt(aura!, 0));
    }
  });

  it("aura state survives a JSON round trip unchanged (Web Worker soundness)", () => {
    let state = EMPTY_AURA_STATE;
    for (const [t, gauge] of [
      [0, 2],
      [1, Number.POSITIVE_INFINITY],
      [2, 1],
      [3, Number.NaN],
    ] as const) {
      state = applyElement(state, "hydro", gauge, t).state;
    }
    expectFiniteState(state);
    // The property the guard exists to protect: nothing serialises to `null`.
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it("gaugeAt reads a foreign (deserialised) poisoned aura as fully decayed", () => {
    // Defence in depth: an aura that did NOT come from this module cannot
    // resurrect the immortal-aura behaviour.
    const poisoned: Aura = {
      element: "pyro",
      gauge: Number.POSITIVE_INFINITY,
      since: 0,
      decayRate: Number.NaN,
    };
    expect(gaugeAt(poisoned, FAR_FUTURE)).toBe(0);
    expect(isExpired(poisoned, FAR_FUTURE)).toBe(true);
    expect(decayAuraState({ auras: [poisoned], compound: [] }, 1).auras).toEqual(
      [],
    );
  });
});

describe("D1 — non-finite Elemental Mastery no longer poisons damage", () => {
  it("amplifyingMultiplier is finite for every non-finite EM, and equals EM=0", () => {
    const { reactions } = applyElement(freshAura("pyro", 2), "hydro", 1, 0);
    expect(reactions).toHaveLength(1);
    const atZeroEm = toReactionModifiers(
      reactions,
      { level: LEVEL_90, elementalMastery: 0 },
      () => RES_NEUTRAL,
    ).amplifyingMultiplier;
    for (const bad of NON_FINITE) {
      const mods = toReactionModifiers(
        reactions,
        { level: LEVEL_90, elementalMastery: bad },
        () => RES_NEUTRAL,
      );
      expect(Number.isNaN(mods.amplifyingMultiplier)).toBe(false);
      expect(mods.amplifyingMultiplier).toBe(atZeroEm);
    }
  });

  it("transformative and additive channels are finite for non-finite EM", () => {
    // Overloaded (transformative) from Pyro onto Electro.
    const { reactions } = applyElement(freshAura("electro", 2), "pyro", 1, 0);
    for (const bad of NON_FINITE) {
      const mods = toReactionModifiers(
        reactions,
        { level: LEVEL_90, elementalMastery: bad },
        () => RES_NEUTRAL,
      );
      expect(Number.isFinite(mods.additiveBaseDamageBonus)).toBe(true);
      for (const instance of mods.transformative) {
        expect(Number.isFinite(instance.damage)).toBe(true);
      }
    }
  });
});

describe("D2 — ICD negative elapsed is a FRESH WINDOW", () => {
  const STANDARD: IcdBehaviour = { mode: "standard" };

  it("a counter whose windowStart is in the future applies and re-anchors", () => {
    const decision = evaluateIcd(
      STANDARD,
      { windowStart: 10, hitsInWindow: 1 },
      5,
    );
    // Previously: applies=false with the stale counter bumped to 2, silently
    // deleting an elemental application.
    expect(decision.applies).toBe(true);
    expect(decision.counter).toEqual({ windowStart: 5, hitsInWindow: 1 });
  });

  it("is IDENTICAL to having no counter at all — the stated semantics", () => {
    for (const future of [5.0001, 10, 1e6]) {
      const resumed = evaluateIcd(
        STANDARD,
        { windowStart: future, hitsInWindow: 2 },
        5,
      );
      const fresh = evaluateIcd(STANDARD, undefined, 5);
      expect(resumed).toEqual(fresh);
    }
  });

  it("is NOT 'clamp elapsed to 0', which would suppress the hit", () => {
    // Clamping to 0 keeps the stale counter, so hitsInWindow 2 -> 3 and
    // (3-1) % 3 !== 0 => applies false. Pin that this is NOT what happens.
    const decision = evaluateIcd(
      STANDARD,
      { windowStart: 100, hitsInWindow: 2 },
      0,
    );
    expect(decision.applies).toBe(true);
    expect(decision.counter.hitsInWindow).toBe(1);
  });

  it("resuming at an earlier clock then advancing behaves like a fresh sequence", () => {
    // windowStart ahead of the clock, then a normal 3-hit sequence.
    let counter = { windowStart: 50, hitsInWindow: 3 };
    const applied: boolean[] = [];
    for (const time of [0, 0.5, 1, 1.5]) {
      const decision = evaluateIcd(STANDARD, counter, time);
      applied.push(decision.applies);
      counter = decision.counter;
    }
    // Fresh 3-hit ICD inside one 2.5s window: 1st and 4th apply.
    expect(applied).toEqual([true, false, false, true]);
  });

  it("the forward path is unchanged (no regression in the normal direction)", () => {
    // Boundary: exactly 2.5s elapsed still resets (inclusive), as before.
    expect(
      evaluateIcd(STANDARD, { windowStart: 0, hitsInWindow: 2 }, 2.5),
    ).toEqual({ applies: true, counter: { windowStart: 2.5, hitsInWindow: 1 } });
    // Inside the window, the 2nd hit is still suppressed.
    expect(
      evaluateIcd(STANDARD, { windowStart: 0, hitsInWindow: 1 }, 1).applies,
    ).toBe(false);
  });

  it("mode:none still applies on a backwards hit", () => {
    const decision = evaluateIcd(
      { mode: "none" },
      { windowStart: 10, hitsInWindow: 5 },
      1,
    );
    expect(decision.applies).toBe(true);
  });
});
