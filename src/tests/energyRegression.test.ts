import { describe, expect, it } from "vitest";
import {
  OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE,
  OFF_FIELD_PARTICLE_SHARE_FALLBACK,
  PARTICLE_BASE_ENERGY,
  PARTICLE_COLORLESS_MULTIPLIER,
  PARTICLE_MATCHING_ELEMENT_MULTIPLIER,
  PARTICLE_OFF_ELEMENT_MULTIPLIER,
  createEnergyState,
  distributeParticles,
  elementMultiplier,
  fieldShare,
  particleEnergyFor,
} from "@/simulation/energy";
import { simulateRotation } from "@/simulation/engine";
import { makeResolvers } from "@/simulation/buffs";
import type { Buff } from "@/simulation/buffs";
import type {
  CharacterDefinition,
  CharacterState,
  ParticleEmission,
  Rotation,
} from "@/types";
import { makeTestCharacter, NEUTRAL_ENEMY, NO_CRIT_CONFIG } from "@/tests/helpers/fixtures";

// ============================================================================
// TASK #017 — energy / particle regression suite.
//
// The point of this file is COMPOSITION, not spot values: a prior review
// claimed the element factor and the party-size factor were double-counted.
// They are not, and these tests pin that by decomposing each figure into its
// two factors independently, so a future change that folds one into the other
// fails even if the headline number happens to survive.
//
// Hand-computed expectations are used where the point is to catch a WRONG
// CONSTANT (the KQM reference figures below); constants are referenced
// symbolically only where the constant itself is the subject under test.
// ============================================================================

const FOUR_PARTY = 4;

function emission(overrides: Partial<ParticleEmission> = {}): ParticleEmission {
  return { count: 1, element: "pyro", ...overrides };
}

/** One particle's energy with every factor at its neutral value. */
function energyOf(input: {
  particleElement: ParticleEmission["element"];
  receiverElement: CharacterDefinition["element"];
  onField: boolean;
  partySize: number;
  energyRecharge?: number;
  count?: number;
  baseEnergyPerUnit?: number;
}): number {
  return particleEnergyFor({
    emission: {
      count: input.count ?? 1,
      element: input.particleElement,
      ...(input.baseEnergyPerUnit !== undefined
        ? { baseEnergyPerUnit: input.baseEnergyPerUnit }
        : {}),
    },
    receiverElement: input.receiverElement,
    onField: input.onField,
    partySize: input.partySize,
    energyRecharge: input.energyRecharge ?? 1,
  });
}

// ---------------------------------------------------------------------------
// 1. The constants themselves — hand-written values, NOT read from the module.
//    If someone edits a constant, this fails. That is the entire purpose.
// ---------------------------------------------------------------------------

describe("energy constants (hand-written expectations, VERIFIED against KQM/Wiki)", () => {
  it("base particle energy is 3", () => {
    expect(PARTICLE_BASE_ENERGY).toBe(3);
  });

  it("matching-element multiplier is 1", () => {
    expect(PARTICLE_MATCHING_ELEMENT_MULTIPLIER).toBe(1);
  });

  it("off-element multiplier is exactly 1/3, not 1/2", () => {
    // The 0.5 that shipped before TASK #007 overstated every off-element gain
    // by 50%. 1/3 is derived from the documented 3-energy / 1-energy pair.
    expect(PARTICLE_OFF_ELEMENT_MULTIPLIER).toBeCloseTo(1 / 3, 12);
    expect(PARTICLE_OFF_ELEMENT_MULTIPLIER).not.toBe(0.5);
    // Stated as the ratio it is defined by, so the relationship is asserted
    // rather than just the decimal.
    expect(PARTICLE_BASE_ENERGY * PARTICLE_OFF_ELEMENT_MULTIPLIER).toBeCloseTo(1, 12);
  });

  it("off-field share table is {1:1.0, 2:0.8, 3:0.7, 4:0.6}", () => {
    expect(OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[1]).toBe(1.0);
    expect(OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[2]).toBe(0.8);
    expect(OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[3]).toBe(0.7);
    expect(OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[4]).toBe(0.6);
  });

  it("the share table is monotonically non-increasing in party size", () => {
    // An invariant, not a value: more party members can never mean a LARGER
    // off-field share. Catches a transposed pair that individual value checks
    // would also catch, but also catches a future row inserted out of order.
    const sizes = [1, 2, 3, 4];
    for (let i = 1; i < sizes.length; i++) {
      const prev = OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[sizes[i - 1]!]!;
      const curr = OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[sizes[i]!]!;
      expect(curr).toBeLessThanOrEqual(prev);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. COMPOSITION — the claim under dispute.
// ---------------------------------------------------------------------------

describe("element factor and party factor each apply EXACTLY once", () => {
  it("on-field, same element = 3 energy (base only, no other factor)", () => {
    expect(energyOf({
      particleElement: "pyro", receiverElement: "pyro",
      onField: true, partySize: FOUR_PARTY,
    })).toBeCloseTo(3, 12);
  });

  it("on-field, different element = 1 energy (element factor applied once)", () => {
    // 3 * 1/3 = 1. If the element factor were applied twice this would be 1/3.
    expect(energyOf({
      particleElement: "pyro", receiverElement: "hydro",
      onField: true, partySize: FOUR_PARTY,
    })).toBeCloseTo(1, 12);
  });

  it("off-field, same element, 4-party = 1.8, decomposing as 3 x 0.6", () => {
    const actual = energyOf({
      particleElement: "pyro", receiverElement: "pyro",
      onField: false, partySize: FOUR_PARTY,
    });
    expect(actual).toBeCloseTo(1.8, 12);
    // The decomposition, asserted explicitly: base x party share, with NO
    // element factor (elements match, so it is exactly 1) and the party share
    // applied a single time.
    expect(actual).toBeCloseTo(3 * 0.6, 12);
    // Double-counting the party share would give 3*0.36 = 1.08.
    expect(actual).not.toBeCloseTo(3 * 0.6 * 0.6, 6);
  });

  it("off-field, different element, 4-party = 0.6, decomposing as (3 x 1/3) x 0.6", () => {
    const actual = energyOf({
      particleElement: "pyro", receiverElement: "hydro",
      onField: false, partySize: FOUR_PARTY,
    });
    expect(actual).toBeCloseTo(0.6, 12);
    expect(actual).toBeCloseTo(3 * (1 / 3) * 0.6, 12);
    // Double-counting EITHER factor is excluded explicitly.
    expect(actual).not.toBeCloseTo(3 * (1 / 3) * (1 / 3) * 0.6, 6); // element twice
    expect(actual).not.toBeCloseTo(3 * (1 / 3) * 0.6 * 0.6, 6); // party twice
  });

  it("the two factors are separable: off-field/on-field ratio is the party share alone", () => {
    // Strongest form of the no-double-counting claim. Holding element fixed,
    // the ONLY difference between on-field and off-field is the party share.
    for (const partySize of [1, 2, 3, 4]) {
      const share = OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[partySize]!;
      for (const receiverElement of ["pyro", "hydro"] as const) {
        const on = energyOf({
          particleElement: "pyro", receiverElement,
          onField: true, partySize,
        });
        const off = energyOf({
          particleElement: "pyro", receiverElement,
          onField: false, partySize,
        });
        expect(off / on).toBeCloseTo(share, 12);
      }
    }
  });

  it("the two factors are separable: off-element/same-element ratio is the element factor alone", () => {
    // Mirror of the above: holding field state fixed, the only difference is
    // the element factor — it does not vary with party size.
    for (const partySize of [1, 2, 3, 4]) {
      for (const onField of [true, false]) {
        const same = energyOf({
          particleElement: "pyro", receiverElement: "pyro", onField, partySize,
        });
        const diff = energyOf({
          particleElement: "pyro", receiverElement: "hydro", onField, partySize,
        });
        expect(diff / same).toBeCloseTo(1 / 3, 12);
      }
    }
  });

  it("energy is exactly the product of its four documented factors", () => {
    // Full-factorisation property over a deterministic grid.
    for (const partySize of [1, 2, 3, 4]) {
      for (const onField of [true, false]) {
        for (const receiverElement of ["pyro", "hydro"] as const) {
          for (const energyRecharge of [1, 1.5, 2]) {
            for (const count of [1, 3]) {
              const actual = energyOf({
                particleElement: "pyro", receiverElement,
                onField, partySize, energyRecharge, count,
              });
              const expected =
                count *
                PARTICLE_BASE_ENERGY *
                elementMultiplier("pyro", receiverElement) *
                fieldShare(onField, partySize) *
                energyRecharge;
              expect(actual).toBeCloseTo(expected, 12);
            }
          }
        }
      }
    }
  });
});

describe("field share edge cases", () => {
  it("the on-field collector gets full value at EVERY party size", () => {
    for (const partySize of [1, 2, 3, 4, 5, 99]) {
      expect(fieldShare(true, partySize)).toBe(1);
    }
  });

  it("a party size outside the table falls back rather than yielding undefined", () => {
    // A missing lookup returning undefined would poison the product into NaN.
    for (const partySize of [0, 5, 8, -1]) {
      const share = fieldShare(false, partySize);
      expect(Number.isFinite(share)).toBe(true);
      expect(share).toBe(OFF_FIELD_PARTICLE_SHARE_FALLBACK);
    }
  });

  it("never produces NaN or Infinity for degenerate inputs", () => {
    for (const partySize of [0, -3, Number.MAX_SAFE_INTEGER]) {
      const value = energyOf({
        particleElement: "pyro", receiverElement: "hydro",
        onField: false, partySize, energyRecharge: 0,
      });
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("zero count yields zero energy, not the base value", () => {
    expect(energyOf({
      particleElement: "pyro", receiverElement: "pyro",
      onField: true, partySize: FOUR_PARTY, count: 0,
    })).toBe(0);
  });

  it("honours baseEnergyPerUnit so an orb (9) is 3x a particle (3)", () => {
    const particle = energyOf({
      particleElement: "pyro", receiverElement: "pyro",
      onField: true, partySize: FOUR_PARTY,
    });
    const orb = energyOf({
      particleElement: "pyro", receiverElement: "pyro",
      onField: true, partySize: FOUR_PARTY, baseEnergyPerUnit: 9,
    });
    expect(particle).toBeCloseTo(3, 12);
    expect(orb).toBeCloseTo(9, 12);
  });
});

// ---------------------------------------------------------------------------
// 3. UNVERIFIED constant — change detector ONLY. Not a correctness claim.
// ---------------------------------------------------------------------------

describe("UNVERIFIED colourless particle behaviour (change-detector, not a correctness claim)", () => {
  it("UNVERIFIED: PARTICLE_COLORLESS_MULTIPLIER is currently 0.6 (community figure, no accessible source)", () => {
    // Pinned so a silent edit is caught. This is NOT evidence the value is
    // right. See docs/PROJECT-STATUS.md "Known Limitations".
    expect(PARTICLE_COLORLESS_MULTIPLIER).toBe(0.6);
  });

  it("UNVERIFIED: colourless is currently a SCALAR, applied identically at every party size", () => {
    // SHAPE, not value. The real mechanic may be party-size dependent, in which
    // case a scalar is the wrong shape and this test must be REPLACED by a
    // table-driven one -- it should not simply be re-pinned to a new number.
    const values = [1, 2, 3, 4].map((partySize) =>
      elementMultiplier("physical", "pyro") * 1 + partySize * 0,
    );
    expect(new Set(values).size).toBe(1);
    for (const partySize of [1, 2, 3, 4]) {
      // Colourless multiplier does not vary with party size TODAY.
      expect(elementMultiplier("physical", "pyro")).toBe(
        elementMultiplier("physical", "hydro"),
      );
      expect(fieldShare(true, partySize)).toBe(1);
    }
  });

  it("UNVERIFIED: colourless ignores the receiver's element entirely", () => {
    // Also a shape claim: colourless takes the same multiplier no matter who
    // collects it, unlike elemental particles.
    for (const receiverElement of ["pyro", "hydro", "electro", "geo"] as const) {
      expect(elementMultiplier("physical", receiverElement)).toBe(
        PARTICLE_COLORLESS_MULTIPLIER,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Distribution across a real party.
// ---------------------------------------------------------------------------

describe("distributeParticles composition", () => {
  function stateOf(def: CharacterDefinition): CharacterState {
    const energy = createEnergyState(def);
    return { definition: def, currentEnergy: energy.current, energy, cooldowns: {} };
  }

  const pyro = makeTestCharacter("p", { element: "pyro" });
  const hydro = makeTestCharacter("h", { element: "hydro" });
  const electro = makeTestCharacter("e", { element: "electro" });
  const anemo = makeTestCharacter("a", { element: "anemo" });
  const party = [pyro, hydro, electro, anemo].map(stateOf);

  it("each member's gain decomposes into their own element and field factors", () => {
    const gains = distributeParticles({
      emission: emission({ element: "pyro" }),
      party,
      activeCharacterId: "p",
      partySize: FOUR_PARTY,
    });
    const byId = new Map(gains.map((g) => [g.characterId, g]));

    // On-field pyro collecting a pyro particle: full base, no reductions.
    expect(byId.get("p")!.amount).toBeCloseTo(3, 12);
    expect(byId.get("p")!.onField).toBe(true);

    // Off-field, off-element: (3 * 1/3) * 0.6 = 0.6, each factor once.
    for (const id of ["h", "e", "a"]) {
      expect(byId.get(id)!.amount).toBeCloseTo(3 * (1 / 3) * 0.6, 12);
      expect(byId.get(id)!.onField).toBe(false);
    }
  });

  it("an off-field member matching the particle element gets 1.8, not 0.6", () => {
    // Distinguishes "party share applied" from "element factor wrongly applied
    // to a matching element".
    const gains = distributeParticles({
      emission: emission({ element: "hydro" }),
      party,
      activeCharacterId: "p",
      partySize: FOUR_PARTY,
    });
    const hydroGain = gains.find((g) => g.characterId === "h")!;
    expect(hydroGain.amount).toBeCloseTo(1.8, 12);
    expect(hydroGain.amount).toBeCloseTo(3 * 0.6, 12);
  });

  it("gain order follows party order exactly (determinism for event ordering)", () => {
    const gains = distributeParticles({
      emission: emission(),
      party,
      activeCharacterId: "p",
      partySize: FOUR_PARTY,
    });
    expect(gains.map((g) => g.characterId)).toEqual(["p", "h", "e", "a"]);
  });

  it("is deterministic: identical inputs produce identical output", () => {
    const call = () =>
      distributeParticles({
        emission: emission(),
        party,
        activeCharacterId: "h",
        partySize: FOUR_PARTY,
      });
    expect(call()).toEqual(call());
  });

  it("gives everyone the off-field share when nobody is on-field", () => {
    const gains = distributeParticles({
      emission: emission({ element: "pyro" }),
      party,
      activeCharacterId: undefined,
      partySize: FOUR_PARTY,
    });
    for (const gain of gains) expect(gain.onField).toBe(false);
    expect(gains.find((g) => g.characterId === "p")!.amount).toBeCloseTo(3 * 0.6, 12);
  });
});

// ---------------------------------------------------------------------------
// 5. Buff-resolved ER — TASK #016 has NOT landed. No-buff guard + gap pin.
// ---------------------------------------------------------------------------

describe("energy x buffs interaction (TASK #016 — buff-resolved ER, LANDED)", () => {
  const PARTICLE_COUNT = 4;

  /** Pyro character, 4 pyro particles on skill, base ER 1.0, solo party. */
  function erCharacter(id: string, energyRecharge: number): CharacterDefinition {
    const def = makeTestCharacter(id, {
      element: "pyro",
      maxEnergy: 200,
      stats: { energyRecharge },
      elementalSkill: { cooldown: 0, energyGenerated: 0 },
    });
    return {
      ...def,
      elementalSkill: {
        ...def.elementalSkill,
        particles: { count: PARTICLE_COUNT, element: "pyro" },
      },
    };
  }

  function erBuff(value: number): Buff {
    return {
      id: "er-buff",
      source: "test",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      modifiers: [{ stat: "energyRecharge", value }],
    };
  }

  const ROTATION: Rotation = [
    { characterId: "x", actionType: "skill", abilityId: "x-e" },
  ];

  it("REGRESSION GUARD (no buffs): base ER scales particle energy exactly once", () => {
    // 4 particles * 3 base * 1 (matching) * 1 (on-field) * 1.5 ER = 18.
    const r = simulateRotation(
      [erCharacter("x", 1.5)], ROTATION, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    );
    expect(r.finalState.characters["x"]!.energy.current).toBeCloseTo(
      PARTICLE_COUNT * 3 * 1.5, 12,
    );
  });

  it("REGRESSION GUARD (no buffs): ER 1.0 yields the unscaled base value", () => {
    const r = simulateRotation(
      [erCharacter("x", 1)], ROTATION, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    );
    expect(r.finalState.characters["x"]!.energy.current).toBeCloseTo(
      PARTICLE_COUNT * 3, 12,
    );
  });

  it("REGRESSION GUARD (no buffs): ER scaling is linear, never squared or offset", () => {
    const at1 = simulateRotation(
      [erCharacter("x", 1)], ROTATION, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    ).finalState.characters["x"]!.energy.current;
    const at2 = simulateRotation(
      [erCharacter("x", 2)], ROTATION, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    ).finalState.characters["x"]!.energy.current;
    expect(at2).toBeCloseTo(at1 * 2, 12);
  });

  it("an ER buff DOES scale particle energy (TASK #016 landed)", () => {
    // 4 particles * 3 base * 1 (matching, on-field) * (1.0 base + 0.8 buff) = 21.6.
    // Before TASK #016 `distributeParticles` read `baseStats.energyRecharge`
    // and this was 12 -- the buff was silently dropped.
    const r = simulateRotation([erCharacter("x", 1)], ROTATION, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [erBuff(0.8)] }),
    });
    expect(r.finalState.characters["x"]!.energy.current).toBeCloseTo(
      PARTICLE_COUNT * 3 * 1.8, 12,
    );
  });

  it("buffed ER composes ADDITIVELY with base ER, applied exactly once", () => {
    // base 1.5 + buff 0.5 = 2.0, so 4*3*2.0 = 24. A multiplicative fold would
    // give 1.5*1.5 = 2.25 -> 27; applying ER twice would give 4*3*4.0 = 48.
    const r = simulateRotation([erCharacter("x", 1.5)], ROTATION, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [erBuff(0.5)] }),
    });
    const energy = r.finalState.characters["x"]!.energy.current;
    expect(energy).toBeCloseTo(PARTICLE_COUNT * 3 * 2.0, 12);
    expect(energy).not.toBeCloseTo(PARTICLE_COUNT * 3 * 2.25, 6);
    expect(energy).not.toBeCloseTo(PARTICLE_COUNT * 3 * 4.0, 6);
  });

  it("an ER buff outside its active window does not apply", () => {
    // Window gating on the energy path, not just the damage path.
    const late: Buff = { ...erBuff(0.8), startTime: 100 };
    const r = simulateRotation([erCharacter("x", 1)], ROTATION, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      ...makeResolvers({ buffs: [late] }),
    });
    expect(r.finalState.characters["x"]!.energy.current).toBeCloseTo(
      PARTICLE_COUNT * 3, 12,
    );
  });

  it("attaching a resolver with no ER modifiers leaves energy byte-identical", () => {
    // The seam must be inert when it has nothing to say.
    const unbuffed = simulateRotation(
      [erCharacter("x", 1.3)], ROTATION, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    );
    const withResolver = simulateRotation(
      [erCharacter("x", 1.3)], ROTATION, NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, ...makeResolvers({ buffs: [] }) },
    );
    expect(withResolver.finalState.characters["x"]!.energy.current).toBe(
      unbuffed.finalState.characters["x"]!.energy.current,
    );
  });

  it("stays deterministic with an ER buff attached", () => {
    const run = () =>
      simulateRotation([erCharacter("x", 1)], ROTATION, NEUTRAL_ENEMY, {
        ...NO_CRIT_CONFIG,
        ...makeResolvers({ buffs: [erBuff(0.8)] }),
      }).finalState.characters["x"]!.energy.current;
    expect(run()).toBe(run());
  });
});
