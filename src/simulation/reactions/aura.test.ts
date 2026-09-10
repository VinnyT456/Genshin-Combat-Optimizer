import { describe, expect, it } from "vitest";
import {
  auraBaseDuration,
  auraDecayRate,
  consumeAura,
  createAura,
  decayAuraState,
  findAura,
  gaugeAt,
  isExpired,
  refreshAura,
  taxedGauge,
  withAura,
} from "@/simulation/reactions/aura";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import type { AuraState } from "@/simulation/reactions/types";

// Values pinned against the published Elemental Gauge Theory table so a change
// to the decay model fails loudly rather than drifting.
describe("aura gauge model — verified table", () => {
  it("reproduces the published base durations", () => {
    expect(auraBaseDuration(1)).toBe(9.5);
    expect(auraBaseDuration(1.5)).toBe(10.75);
    expect(auraBaseDuration(2)).toBe(12);
    expect(auraBaseDuration(4)).toBe(17);
    expect(auraBaseDuration(8)).toBe(27);
  });

  it("reproduces the published decay rates (seconds per GU)", () => {
    expect(auraDecayRate(1)).toBeCloseTo(11.875, 6);
    expect(auraDecayRate(1.5)).toBeCloseTo(8.9583, 4);
    expect(auraDecayRate(2)).toBeCloseTo(7.5, 6);
    expect(auraDecayRate(4)).toBeCloseTo(5.3125, 6);
    expect(auraDecayRate(8)).toBeCloseTo(4.21875, 6);
  });

  it("applies the 20% aura tax", () => {
    // Documented example: a 2U Pyro application creates a 1.6U aura.
    expect(taxedGauge(2)).toBeCloseTo(1.6, 10);
    expect(taxedGauge(1)).toBeCloseTo(0.8, 10);
    expect(taxedGauge(4)).toBeCloseTo(3.2, 10);
  });
});

describe("decay is a pure function of elapsed time", () => {
  it("decays linearly and hits zero at the base duration", () => {
    const aura = createAura("pyro", 2, 0);
    expect(aura.gauge).toBeCloseTo(1.6, 10);
    // 1.6U at rate 7.5 s/GU => exactly 12s of life = the base duration.
    expect(gaugeAt(aura, 6)).toBeCloseTo(0.8, 10);
    expect(gaugeAt(aura, 12)).toBeCloseTo(0, 10);
    expect(isExpired(aura, 12)).toBe(true);
  });

  it("never returns negative gauge", () => {
    const aura = createAura("cryo", 1, 0);
    expect(gaugeAt(aura, 1000)).toBe(0);
  });

  it("is composable: decaying t1 then t2 equals decaying straight to t2", () => {
    const start: AuraState = { auras: [createAura("hydro", 4, 0)], compound: [] };
    const twoStep = decayAuraState(decayAuraState(start, 3), 9);
    const oneStep = decayAuraState(start, 9);
    // Composition is exact in the reals; in IEEE-754 it differs by at most one
    // ULP (~2.2e-16) because re-anchoring performs two subtractions instead of
    // one. This does NOT threaten determinism: identical inputs still produce
    // identical outputs. It only means "decay in steps" and "decay in one go"
    // are not bit-identical, so callers must not mix the two and then compare
    // states with ===.
    expect(twoStep.auras[0]!.gauge).toBeCloseTo(oneStep.auras[0]!.gauge, 12);
    expect(twoStep.auras[0]!.decayRate).toBe(oneStep.auras[0]!.decayRate);
    expect(twoStep.auras[0]!.since).toBe(oneStep.auras[0]!.since);
  });

  it("is deterministic: the same call twice is bit-identical", () => {
    const start: AuraState = { auras: [createAura("hydro", 4, 0)], compound: [] };
    expect(decayAuraState(start, 9)).toEqual(decayAuraState(start, 9));
  });

  it("is idempotent at the same time", () => {
    const start: AuraState = { auras: [createAura("electro", 2, 0)], compound: [] };
    const once = decayAuraState(start, 4);
    expect(decayAuraState(once, 4)).toEqual(once);
  });

  it("does not extrapolate backwards before `since`", () => {
    const aura = createAura("dendro", 2, 10);
    expect(gaugeAt(aura, 5)).toBeCloseTo(aura.gauge, 10);
  });

  it("drops fully decayed auras from the state", () => {
    const start: AuraState = { auras: [createAura("pyro", 1, 0)], compound: [] };
    // 0.8U at 11.875 s/GU => 9.5s lifetime.
    expect(decayAuraState(start, 9).auras).toHaveLength(1);
    expect(decayAuraState(start, 9.5).auras).toHaveLength(0);
  });

  it("does not mutate its input", () => {
    const start: AuraState = { auras: [createAura("pyro", 2, 0)], compound: [] };
    const snapshot = structuredClone(start);
    decayAuraState(start, 5);
    expect(start).toEqual(snapshot);
  });
});

describe("decay rate inheritance", () => {
  it("non-Pyro: takes the higher gauge but INHERITS the original decay rate", () => {
    // Documented example: 2U Cryo onto a 0.8U/D(1) aura => 1.6U at D(1),
    // giving a 19s lifetime rather than 12s.
    const existing = createAura("cryo", 1, 0); // 0.8U, D(1)=11.875
    const refreshed = refreshAura(existing, 2, 0);
    expect(refreshed.gauge).toBeCloseTo(1.6, 10);
    expect(refreshed.decayRate).toBeCloseTo(auraDecayRate(1), 6);
    expect(refreshed.gauge * refreshed.decayRate).toBeCloseTo(19, 6);
  });

  it("non-Pyro: a weaker application does not reduce the gauge", () => {
    // Documented example: 1U Cryo onto a 1.6U/D(2) aura stays 1.6U at D(2).
    const existing = createAura("cryo", 2, 0); // 1.6U, D(2)=7.5
    const refreshed = refreshAura(existing, 1, 0);
    expect(refreshed.gauge).toBeCloseTo(1.6, 10);
    expect(refreshed.decayRate).toBeCloseTo(auraDecayRate(2), 6);
    expect(refreshed.gauge * refreshed.decayRate).toBeCloseTo(12, 6);
  });

  it("Pyro is the documented EXCEPTION: no decay rate inheritance", () => {
    // A stronger Pyro application replaces the aura outright, taking the NEW
    // decay rate — unlike every other element.
    const existing = createAura("pyro", 1, 0); // 0.8U, D(1)
    const refreshed = refreshAura(existing, 2, 0);
    expect(refreshed.gauge).toBeCloseTo(1.6, 10);
    expect(refreshed.decayRate).toBeCloseTo(auraDecayRate(2), 6);
    // Contrast with Cryo above, which would have kept D(1) and lived 19s.
    expect(refreshed.gauge * refreshed.decayRate).toBeCloseTo(12, 6);
  });

  it("Pyro: a weaker application leaves the existing aura unchanged", () => {
    const existing = createAura("pyro", 4, 0); // 3.2U, D(4)
    const refreshed = refreshAura(existing, 1, 0);
    expect(refreshed.gauge).toBeCloseTo(3.2, 10);
    expect(refreshed.decayRate).toBeCloseTo(auraDecayRate(4), 6);
  });

  it("partial reaction consumption inherits the decay rate", () => {
    const state = withAura(EMPTY_AURA_STATE, "electro", createAura("electro", 2, 0));
    const after = consumeAura(state, "electro", 1, 0);
    const aura = findAura(after, "electro", 0);
    expect(aura?.gauge).toBeCloseTo(0.6, 10);
    expect(aura?.decayRate).toBeCloseTo(auraDecayRate(2), 6);
  });

  it("full consumption removes the aura", () => {
    const state = withAura(EMPTY_AURA_STATE, "electro", createAura("electro", 2, 0));
    expect(consumeAura(state, "electro", 99, 0).auras).toHaveLength(0);
  });
});

describe("aura state is order-independent", () => {
  it("stores auras in a fixed element order regardless of application order", () => {
    const a = withAura(
      withAura(EMPTY_AURA_STATE, "electro", createAura("electro", 1, 0)),
      "hydro",
      createAura("hydro", 1, 0),
    );
    const b = withAura(
      withAura(EMPTY_AURA_STATE, "hydro", createAura("hydro", 1, 0)),
      "electro",
      createAura("electro", 1, 0),
    );
    expect(a.auras.map((x) => x.element)).toEqual(b.auras.map((x) => x.element));
    expect(a).toEqual(b);
  });
});
