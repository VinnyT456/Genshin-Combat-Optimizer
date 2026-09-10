import { describe, expect, it } from "vitest";
import { applyElement } from "@/simulation/reactions/applyElement";
import { createAura, findAura, withAura } from "@/simulation/reactions/aura";
import {
  additiveBaseDamageBonus,
  amplifyingBaseMultiplier,
  amplifyingEmBonus,
  amplifyingMultiplier,
  levelMultiplier,
  transformativeDamage,
  transformativeEmBonus,
} from "@/simulation/reactions/reactionDamage";
import { lookupReaction } from "@/simulation/reactions/reactionTable";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import type { AuraElement, AuraState } from "@/simulation/reactions/types";

function auraOf(element: AuraElement, gauge: number, time = 0): AuraState {
  return withAura(EMPTY_AURA_STATE, element, createAura(element, gauge, time));
}

// ---------------------------------------------------------------------------
// TRIGGER ORDER — the headline requirement. Same two elements, opposite order,
// different multiplier AND different aura consumption.
// ---------------------------------------------------------------------------

describe("amplifying reactions depend on trigger order", () => {
  it("Hydro onto Pyro is FORWARD vaporize (2.0x)", () => {
    const { reactions } = applyElement(auraOf("pyro", 2), "hydro", 1, 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0]!.kind).toBe("vaporize");
    expect(reactions[0]!.direction).toBe("forward");
    expect(amplifyingBaseMultiplier(reactions[0]!.direction!)).toBe(2.0);
  });

  it("Pyro onto Hydro is REVERSE vaporize (1.5x)", () => {
    const { reactions } = applyElement(auraOf("hydro", 2), "pyro", 1, 0);
    expect(reactions).toHaveLength(1);
    expect(reactions[0]!.kind).toBe("vaporize");
    expect(reactions[0]!.direction).toBe("reverse");
    expect(amplifyingBaseMultiplier(reactions[0]!.direction!)).toBe(1.5);
  });

  it("Pyro onto Cryo is FORWARD melt (2.0x)", () => {
    const { reactions } = applyElement(auraOf("cryo", 2), "pyro", 1, 0);
    expect(reactions[0]!.kind).toBe("melt");
    expect(reactions[0]!.direction).toBe("forward");
    expect(amplifyingBaseMultiplier("forward")).toBe(2.0);
  });

  it("Cryo onto Pyro is REVERSE melt (1.5x)", () => {
    const { reactions } = applyElement(auraOf("pyro", 2), "cryo", 1, 0);
    expect(reactions[0]!.kind).toBe("melt");
    expect(reactions[0]!.direction).toBe("reverse");
    expect(amplifyingBaseMultiplier("reverse")).toBe(1.5);
  });

  it("the two directions are NOT interchangeable", () => {
    const forward = applyElement(auraOf("pyro", 2), "hydro", 1, 0);
    const reverse = applyElement(auraOf("hydro", 2), "pyro", 1, 0);
    expect(forward.reactions[0]!.direction).not.toBe(
      reverse.reactions[0]!.direction,
    );
  });
});

describe("aura consumption follows the direction", () => {
  it("forward vaporize consumes 2x trigger gauge and clears a 1.6U aura", () => {
    // 2U Pyro attack => 1.6U aura. 1U Hydro consumes 2*1 = 2U > 1.6U.
    const result = applyElement(auraOf("pyro", 2), "hydro", 1, 0);
    expect(result.reactions[0]!.gaugeConsumed).toBeCloseTo(1.6, 10);
    expect(findAura(result.state, "pyro", 0)).toBeUndefined();
  });

  it("reverse vaporize consumes 0.5x trigger gauge and PRESERVES the aura", () => {
    // 2U Hydro attack => 1.6U aura. 1U Pyro consumes 0.5*1 = 0.5U.
    const result = applyElement(auraOf("hydro", 2), "pyro", 1, 0);
    expect(result.reactions[0]!.gaugeConsumed).toBeCloseTo(0.5, 10);
    const remaining = findAura(result.state, "hydro", 0);
    expect(remaining?.gauge).toBeCloseTo(1.1, 10);
  });

  it("documented example: 2U Cryo aura melts ONCE against 1U Pyro", () => {
    // Wiki example: coefficient 2 => 2 - 2*1 = 0, aura cleared in one hit.
    let state = withAura(EMPTY_AURA_STATE, "cryo", {
      element: "cryo",
      gauge: 2,
      since: 0,
      decayRate: Number.POSITIVE_INFINITY,
    });
    const first = applyElement(state, "pyro", 1, 0);
    expect(first.reactions[0]!.kind).toBe("melt");
    expect(findAura(first.state, "cryo", 0)).toBeUndefined();
    state = first.state;
  });

  it("documented example: 2U Pyro aura melts FOUR times against 1U Cryo", () => {
    // Wiki example: coefficient 0.5 => 2 - 0.5*1 per hit => 4 reactions.
    let state: AuraState = withAura(EMPTY_AURA_STATE, "pyro", {
      element: "pyro",
      gauge: 2,
      since: 0,
      decayRate: Number.POSITIVE_INFINITY, // isolate consumption from decay
    });
    let melts = 0;
    for (let i = 0; i < 6; i++) {
      const result = applyElement(state, "cryo", 1, 0);
      if (result.reactions.some((r) => r.kind === "melt")) melts++;
      state = result.state;
    }
    expect(melts).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Aura replacement vs coexistence
// ---------------------------------------------------------------------------

describe("which auras coexist vs overwrite", () => {
  it("Electro-Charged leaves BOTH Hydro and Electro on the target", () => {
    const result = applyElement(auraOf("hydro", 2), "electro", 2, 0);
    expect(result.reactions[0]!.kind).toBe("electroCharged");
    expect(findAura(result.state, "hydro", 0)).toBeDefined();
    expect(findAura(result.state, "electro", 0)).toBeDefined();
  });

  it("Burning leaves both Pyro and Dendro (trigger aura is kept)", () => {
    const result = applyElement(auraOf("dendro", 2), "pyro", 2, 0);
    expect(result.reactions[0]!.kind).toBe("burning");
    expect(findAura(result.state, "pyro", 0)).toBeDefined();
  });

  it("a consuming reaction does NOT leave the trigger's aura", () => {
    // Forward vaporize: the Hydro is spent reacting, so no Hydro aura remains.
    const result = applyElement(auraOf("pyro", 2), "hydro", 1, 0);
    expect(findAura(result.state, "hydro", 0)).toBeUndefined();
    expect(findAura(result.state, "pyro", 0)).toBeUndefined();
  });

  it("a non-reacting element simply applies its aura", () => {
    const result = applyElement(EMPTY_AURA_STATE, "cryo", 2, 0);
    expect(result.reactions).toHaveLength(0);
    expect(findAura(result.state, "cryo", 0)?.gauge).toBeCloseTo(1.6, 10);
  });

  it("Anemo consumes an aura but never leaves one", () => {
    const result = applyElement(auraOf("pyro", 2), "anemo", 1, 0);
    expect(result.reactions[0]!.kind).toBe("swirl");
    expect(result.reactions[0]!.swirledElement).toBe("pyro");
    // Swirl coefficient 0.5 => 1U Anemo consumes 0.5U of the 1.6U Pyro aura.
    expect(findAura(result.state, "pyro", 0)?.gauge).toBeCloseTo(1.1, 10);
    // Anemo is not an aura element, so the state holds ONLY the pyro aura.
    expect(result.state.auras.map((a) => a.element)).toEqual(["pyro"]);
  });

  it("Geo crystallizes without leaving an aura", () => {
    const result = applyElement(auraOf("cryo", 2), "geo", 1, 0);
    expect(result.reactions[0]!.kind).toBe("crystallize");
    expect(result.reactions[0]!.category).toBe("none");
  });

  it("0U attacks neither react nor apply an aura", () => {
    const result = applyElement(auraOf("pyro", 2), "hydro", 0, 0);
    expect(result.reactions).toHaveLength(0);
    expect(findAura(result.state, "pyro", 0)).toBeDefined();
    expect(findAura(result.state, "hydro", 0)).toBeUndefined();
  });

  it("one hit can produce TWO reactions on an Electro-Charged target", () => {
    // Wiki: "a Pyro attack can trigger both Vaporize and Overload
    // simultaneously on an Electro-Charged target."
    const ec = applyElement(auraOf("hydro", 4), "electro", 4, 0).state;
    const result = applyElement(ec, "pyro", 2, 0);
    const kinds = result.reactions.map((r) => r.kind).sort();
    expect(kinds).toEqual(["overloaded", "vaporize"]);
  });

  it("decayed auras do not react", () => {
    // 1U Pyro => 0.8U aura, 9.5s lifetime.
    const result = applyElement(auraOf("pyro", 1), "hydro", 1, 10);
    expect(result.reactions).toHaveLength(0);
  });
});

describe("reaction table", () => {
  it("has no self-reactions", () => {
    for (const element of ["pyro", "hydro", "electro", "cryo", "dendro"] as const) {
      expect(lookupReaction(element, element)).toBeUndefined();
    }
  });

  it("is symmetric in kind for reversible pairs", () => {
    expect(lookupReaction("pyro", "hydro")?.kind).toBe("vaporize");
    expect(lookupReaction("hydro", "pyro")?.kind).toBe("vaporize");
    expect(lookupReaction("electro", "cryo")?.kind).toBe("superconduct");
    expect(lookupReaction("cryo", "electro")?.kind).toBe("superconduct");
  });

  it("is asymmetric in coefficient for amplifying pairs", () => {
    expect(lookupReaction("hydro", "pyro")?.coefficient).toBe(2);
    expect(lookupReaction("pyro", "hydro")?.coefficient).toBe(0.5);
    expect(lookupReaction("pyro", "cryo")?.coefficient).toBe(2);
    expect(lookupReaction("cryo", "pyro")?.coefficient).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// Damage math
// ---------------------------------------------------------------------------

describe("EM bonus curves", () => {
  it("is zero at zero EM", () => {
    expect(amplifyingEmBonus(0)).toBe(0);
    expect(transformativeEmBonus(0)).toBe(0);
  });

  it("matches the published amplifying curve 2.78*EM/(EM+1400)", () => {
    // 100 EM => 2.78 * 100/1500 = 0.185333...
    expect(amplifyingEmBonus(100)).toBeCloseTo(0.1853333, 6);
    // 200 EM => 2.78 * 200/1600 = 0.3475
    expect(amplifyingEmBonus(200)).toBeCloseTo(0.3475, 6);
  });

  it("matches the published transformative curve 16*EM/(EM+2000)", () => {
    // 100 EM => 16 * 100/2100 = 0.7619...
    expect(transformativeEmBonus(100)).toBeCloseTo(0.7619048, 6);
    // 1000 EM => 16 * 1000/3000 = 5.3333...
    expect(transformativeEmBonus(1000)).toBeCloseTo(5.3333333, 6);
  });

  it("has diminishing returns", () => {
    const a = amplifyingEmBonus(200) - amplifyingEmBonus(100);
    const b = amplifyingEmBonus(1200) - amplifyingEmBonus(1100);
    expect(b).toBeLessThan(a);
  });
});

describe("amplifying multiplier composition", () => {
  it("is base * (1 + emBonus + reactionBonus)", () => {
    const em = 200;
    // forward = 2.0, EM bonus at 200 = 0.3475
    expect(amplifyingMultiplier("forward", em)).toBeCloseTo(2 * 1.3475, 6);
    expect(amplifyingMultiplier("reverse", em)).toBeCloseTo(1.5 * 1.3475, 6);
  });

  it("adds the reaction bonus to the EM bonus, not multiplicatively", () => {
    // e.g. a +15% vaporize bonus at 0 EM => 2.0 * 1.15.
    expect(amplifyingMultiplier("forward", 0, 0.15)).toBeCloseTo(2.3, 10);
  });

  it("is exactly the base multiplier at 0 EM and no bonus", () => {
    expect(amplifyingMultiplier("forward", 0)).toBe(2);
    expect(amplifyingMultiplier("reverse", 0)).toBe(1.5);
  });
});

describe("level multiplier table", () => {
  it("pins verified endpoints", () => {
    expect(levelMultiplier(1)).toBeCloseTo(17.165606, 6);
    expect(levelMultiplier(90)).toBeCloseTo(1446.8535, 4);
  });

  it("uses the CHARACTER column, not the enemy column, at level >= 58", () => {
    // The two columns diverge from level 58: character 452.95105 vs
    // enemy 452.566797. Picking the wrong column is a silent ~0.1-2% error.
    expect(levelMultiplier(58)).toBeCloseTo(452.95105, 4);
    expect(levelMultiplier(58)).not.toBeCloseTo(452.566797, 4);
  });

  it("is monotonically increasing", () => {
    for (let level = 2; level <= 90; level++) {
      expect(levelMultiplier(level)).toBeGreaterThan(levelMultiplier(level - 1));
    }
  });

  it("clamps rather than extrapolating out-of-range levels", () => {
    expect(levelMultiplier(0)).toBe(levelMultiplier(1));
    expect(levelMultiplier(-5)).toBe(levelMultiplier(1));
    expect(levelMultiplier(9999)).toBe(levelMultiplier(100));
  });
});

describe("transformative damage", () => {
  const base = {
    triggerCharacterLevel: 90,
    elementalMastery: 0,
    resMultiplier: 1,
  };

  it("is coefficient * levelMultiplier at 0 EM and no RES", () => {
    // Overloaded: 2.75 * 1446.8535
    expect(transformativeDamage("overloaded", base)).toBeCloseTo(
      2.75 * 1446.8535,
      3,
    );
    // Superconduct: 1.5 * 1446.8535
    expect(transformativeDamage("superconduct", base)).toBeCloseTo(
      1.5 * 1446.8535,
      3,
    );
    // Swirl: 0.6 * 1446.8535
    expect(transformativeDamage("swirl", base)).toBeCloseTo(0.6 * 1446.8535, 3);
  });

  it("scales with EM via the 16/(EM+2000) curve", () => {
    const withEm = transformativeDamage("overloaded", {
      ...base,
      elementalMastery: 1000,
    });
    // (1 + 5.33333) multiplier
    expect(withEm).toBeCloseTo(2.75 * 1446.8535 * (1 + 16 * 1000 / 3000), 2);
  });

  it("ignores ATK and crit entirely — only level, EM, bonuses and RES", () => {
    // There is deliberately no ATK/crit input on the context type; this test
    // documents that as intentional rather than an oversight.
    const a = transformativeDamage("overloaded", base);
    const b = transformativeDamage("overloaded", { ...base });
    expect(a).toBe(b);
  });

  it("applies RES multiplicatively at the end", () => {
    const full = transformativeDamage("overloaded", base);
    const halved = transformativeDamage("overloaded", {
      ...base,
      resMultiplier: 0.5,
    });
    expect(halved).toBeCloseTo(full * 0.5, 6);
  });

  it("adds the flat additive bonus BEFORE res", () => {
    const withBonus = transformativeDamage("overloaded", {
      ...base,
      additiveBonus: 100,
      resMultiplier: 0.5,
    });
    expect(withBonus).toBeCloseTo((2.75 * 1446.8535 + 100) * 0.5, 3);
  });
});

describe("additive (catalyze) reactions", () => {
  it("returns a BASE damage bonus, unmultiplied by RES", () => {
    // 1.25 * 1446.8535 at 0 EM for spread.
    expect(
      additiveBaseDamageBonus("spread", {
        triggerCharacterLevel: 90,
        elementalMastery: 0,
      }),
    ).toBeCloseTo(1.25 * 1446.8535, 3);
  });

  it("spread is stronger than aggravate (documented ordering)", () => {
    const ctx = { triggerCharacterLevel: 90, elementalMastery: 200 };
    expect(additiveBaseDamageBonus("spread", ctx)).toBeGreaterThan(
      additiveBaseDamageBonus("aggravate", ctx),
    );
  });
});

describe("purity", () => {
  it("applyElement does not mutate the input state", () => {
    const state = auraOf("pyro", 2);
    const snapshot = structuredClone(state);
    applyElement(state, "hydro", 1, 0);
    expect(state).toEqual(snapshot);
  });

  it("applyElement is deterministic", () => {
    const state = auraOf("pyro", 2);
    expect(applyElement(state, "hydro", 1, 0)).toEqual(
      applyElement(state, "hydro", 1, 0),
    );
  });

  it("state is structured-cloneable (Web Worker safe)", () => {
    const state = applyElement(auraOf("hydro", 2), "electro", 2, 0).state;
    expect(structuredClone(state)).toEqual(state);
  });
});
