import { describe, expect, it } from "vitest";
import {
  createAura,
  decayAuraState,
} from "@/simulation/reactions/aura";
import {
  AURA_GAUGE_DECIMAL_PLACES,
  AURA_GAUGE_RELATIVE_TOLERANCE,
  auraStatesEquivalent,
  aurasEquivalent,
  compoundAurasEquivalent,
  gaugesEquivalent,
  quantizeGauge,
} from "@/simulation/reactions/auraTolerance";
import type { AuraState, CompoundAura } from "@/simulation/reactions/types";

// ============================================================================
// Regression tests for the STATED aura-decay path-independence tolerance.
//
// These pin the CONTRACT, not an implementation detail:
//   1. Multi-step decay is equivalent to single-step decay within tolerance.
//   2. It is NOT bit-identical — so nobody may pin exact equality.
//   3. Determinism is untouched: identical input sequences stay bit-identical.
//   4. `since` / `decayRate` / `element` remain EXACT and may be pinned.
//   5. Real drift stays orders of magnitude below the stated ceiling, so the
//      tolerance is a safety margin rather than a fitted number.
// ============================================================================

function hydro4At0(): AuraState {
  return { auras: [createAura("hydro", 4, 0)], compound: [] };
}

describe("aura decay path-independence tolerance", () => {
  it("two-step and one-step decay are EQUIVALENT within the stated tolerance", () => {
    const start = hydro4At0();
    const twoStep = decayAuraState(decayAuraState(start, 3), 9);
    const oneStep = decayAuraState(start, 9);
    expect(auraStatesEquivalent(twoStep, oneStep)).toBe(true);
  });

  it("documents that they are NOT bit-identical, so exact equality is forbidden", () => {
    // This is the whole reason a tolerance exists. If this test ever starts
    // failing because the two ARE bit-identical, the tolerance may be dropped —
    // but that must be a deliberate decision, not an accident.
    const start = hydro4At0();
    const twoStep = decayAuraState(decayAuraState(start, 3), 9);
    const oneStep = decayAuraState(start, 9);
    expect(twoStep.auras[0]!.gauge).not.toBe(oneStep.auras[0]!.gauge);
    expect(twoStep).not.toEqual(oneStep);
  });

  it("keeps `since`, `decayRate` and `element` EXACT across both paths", () => {
    const start = hydro4At0();
    const twoStep = decayAuraState(decayAuraState(start, 3), 9).auras[0]!;
    const oneStep = decayAuraState(start, 9).auras[0]!;
    expect(twoStep.since).toBe(oneStep.since);
    expect(twoStep.decayRate).toBe(oneStep.decayRate);
    expect(twoStep.element).toBe(oneStep.element);
  });

  it("stays equivalent under MANY re-anchors (checkpoint-heavy search)", () => {
    const start = hydro4At0();
    const times = [0.3, 0.7, 1.1, 1.9, 2.4, 3.0, 3.6, 4.2, 5.0, 6.1, 7.3, 8.5];
    let stepped = start;
    for (const time of times) stepped = decayAuraState(stepped, time);
    const direct = decayAuraState(start, 8.5);
    expect(auraStatesEquivalent(stepped, direct)).toBe(true);
  });

  it("real drift stays far below the stated ceiling (margin, not a fitted number)", () => {
    const start = hydro4At0();
    let stepped = start;
    let worst = 0;
    // Pathological: a re-anchor every 5ms for most of the aura's lifetime.
    for (let i = 1; i <= 2000; i++) {
      const time = i * 0.005;
      stepped = decayAuraState(stepped, time);
      const direct = decayAuraState(start, time);
      const a = stepped.auras[0];
      const b = direct.auras[0];
      if (!a || !b) break;
      worst = Math.max(worst, Math.abs(a.gauge - b.gauge));
    }
    // Measured ~1e-13 absolute; assert it is at least 1000x inside the ceiling
    // so a genuine algorithmic regression is caught long before the tolerance.
    expect(worst).toBeGreaterThan(0);
    expect(worst).toBeLessThan(AURA_GAUGE_RELATIVE_TOLERANCE / 1000);
  });

  it("does NOT weaken determinism: identical sequences stay bit-identical", () => {
    const start = hydro4At0();
    const a = decayAuraState(decayAuraState(start, 3), 9);
    const b = decayAuraState(decayAuraState(start, 3), 9);
    expect(a).toEqual(b);
    expect(a.auras[0]!.gauge).toBe(b.auras[0]!.gauge);
  });
});

describe("gaugesEquivalent", () => {
  it("accepts a few-ULP difference", () => {
    const base = 1.5058823529411766;
    expect(gaugesEquivalent(base, base + Number.EPSILON)).toBe(true);
  });

  it("rejects a difference above the tolerance", () => {
    expect(gaugesEquivalent(1.5, 1.5 + 1e-6)).toBe(false);
  });

  it("treats exactly equal values as equal, including zero", () => {
    expect(gaugesEquivalent(0, 0)).toBe(true);
    expect(gaugesEquivalent(2, 2)).toBe(true);
  });

  it("compares near zero without being infinitely strict", () => {
    // A relative-only test would divide by ~0 here. The absolute floor of 1
    // in the scale keeps this sane.
    expect(gaugesEquivalent(0, 1e-15)).toBe(true);
    expect(gaugesEquivalent(0, 1e-3)).toBe(false);
  });

  it("rejects non-finite values rather than treating them as equal", () => {
    expect(gaugesEquivalent(Number.NaN, Number.NaN)).toBe(false);
    expect(
      gaugesEquivalent(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
    ).toBe(true); // identical by ===
    expect(gaugesEquivalent(Number.POSITIVE_INFINITY, 1)).toBe(false);
  });
});

describe("aurasEquivalent / compoundAurasEquivalent", () => {
  it("requires element to match exactly", () => {
    const a = createAura("hydro", 4, 0);
    const b = createAura("pyro", 4, 0);
    expect(aurasEquivalent(a, a)).toBe(true);
    expect(aurasEquivalent(a, b)).toBe(false);
  });

  it("requires `since` and `decayRate` to match exactly, not approximately", () => {
    const a = createAura("hydro", 4, 0);
    expect(aurasEquivalent(a, { ...a, since: a.since + 1e-12 })).toBe(false);
    expect(aurasEquivalent(a, { ...a, decayRate: a.decayRate + 1e-12 })).toBe(
      false,
    );
  });

  it("tolerances only the gauge", () => {
    const a = createAura("hydro", 4, 0);
    expect(aurasEquivalent(a, { ...a, gauge: a.gauge + Number.EPSILON })).toBe(
      true,
    );
    expect(aurasEquivalent(a, { ...a, gauge: a.gauge + 0.01 })).toBe(false);
  });

  it("requires compound `kind` to match exactly", () => {
    const frozen: CompoundAura = {
      kind: "frozen",
      gauge: 1,
      since: 0,
      decayRate: 5,
    };
    expect(compoundAurasEquivalent(frozen, { ...frozen })).toBe(true);
    expect(compoundAurasEquivalent(frozen, { ...frozen, kind: "quicken" })).toBe(
      false,
    );
  });
});

describe("auraStatesEquivalent", () => {
  it("rejects states with different aura counts", () => {
    const a: AuraState = { auras: [createAura("hydro", 4, 0)], compound: [] };
    const b: AuraState = { auras: [], compound: [] };
    expect(auraStatesEquivalent(a, b)).toBe(false);
  });

  it("rejects states with different compound counts", () => {
    const compound: CompoundAura = {
      kind: "frozen",
      gauge: 1,
      since: 0,
      decayRate: 5,
    };
    const a: AuraState = { auras: [], compound: [compound] };
    const b: AuraState = { auras: [], compound: [] };
    expect(auraStatesEquivalent(a, b)).toBe(false);
  });

  it("is order-sensitive by design (order mismatch is a defect, not slack)", () => {
    const hydro = createAura("hydro", 4, 0);
    const pyro = createAura("pyro", 4, 0);
    const a: AuraState = { auras: [pyro, hydro], compound: [] };
    const b: AuraState = { auras: [hydro, pyro], compound: [] };
    expect(auraStatesEquivalent(a, b)).toBe(false);
  });
});

describe("quantizeGauge", () => {
  it("maps two path-equivalent gauges to the same hashable value", () => {
    const start = hydro4At0();
    const twoStep = decayAuraState(decayAuraState(start, 3), 9).auras[0]!.gauge;
    const oneStep = decayAuraState(start, 9).auras[0]!.gauge;
    expect(twoStep).not.toBe(oneStep);
    expect(quantizeGauge(twoStep)).toBe(quantizeGauge(oneStep));
  });

  it("keeps genuinely different gauges distinct", () => {
    expect(quantizeGauge(1.5)).not.toBe(quantizeGauge(1.6));
  });

  it("normalizes -0 to 0 so equivalent states cannot hash apart on sign", () => {
    expect(Object.is(quantizeGauge(-0), 0)).toBe(true);
  });

  it("passes non-finite values through unchanged", () => {
    expect(quantizeGauge(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it("uses the documented number of decimal places", () => {
    expect(AURA_GAUGE_DECIMAL_PLACES).toBe(9);
    // A difference below the grid collapses; one above survives.
    expect(quantizeGauge(1 + 1e-12)).toBe(quantizeGauge(1));
    expect(quantizeGauge(1 + 1e-7)).not.toBe(quantizeGauge(1));
  });
});
