import { describe, expect, it } from "vitest";
import type { Element } from "@/types";
import {
  elementMultiplier,
  fieldShare,
  particleEnergyFor,
} from "@/simulation/energy/particles";
import {
  OFF_FIELD_PARTICLE_SHARE_FALLBACK,
  PARTICLE_BASE_ENERGY,
  PARTICLE_COLORLESS_MULTIPLIER,
  PARTICLE_OFF_ELEMENT_MULTIPLIER,
} from "@/simulation/energy/constants";

describe("particle energy model", () => {
  it("gives full value to matching elements", () => {
    expect(elementMultiplier("pyro", "pyro")).toBe(1);
  });

  it("reduces off-element particles", () => {
    expect(elementMultiplier("pyro", "cryo")).toBe(
      PARTICLE_OFF_ELEMENT_MULTIPLIER,
    );
  });

  it("treats physical as colourless", () => {
    expect(elementMultiplier("physical", "pyro")).toBe(
      PARTICLE_COLORLESS_MULTIPLIER,
    );
  });

  it("gives the on-field collector full share regardless of party size", () => {
    expect(fieldShare(true, 4)).toBe(1);
  });

  it("scales the off-field share by party size", () => {
    expect(fieldShare(false, 4)).toBe(0.6);
    expect(fieldShare(false, 1)).toBe(1);
    expect(fieldShare(false, 99)).toBe(OFF_FIELD_PARTICLE_SHARE_FALLBACK);
  });

  it("multiplies count, element, field share and energy recharge", () => {
    const energy = particleEnergyFor({
      emission: { count: 4, element: "pyro" },
      receiverElement: "pyro",
      onField: false,
      partySize: 4,
      energyRecharge: 1.5,
    });
    // 4 * 3 * 1 (match) * 0.6 (off-field, 4p) * 1.5 (ER)
    expect(energy).toBeCloseTo(4 * PARTICLE_BASE_ENERGY * 0.6 * 1.5);
  });

  it("honours an explicit per-unit value (orbs)", () => {
    const energy = particleEnergyFor({
      emission: { count: 1, element: "pyro", baseEnergyPerUnit: 9 },
      receiverElement: "pyro",
      onField: true,
      partySize: 4,
      energyRecharge: 1,
    });
    expect(energy).toBeCloseTo(9);
  });
});

describe("documented reference values (KQM TCL / Genshin Impact Wiki)", () => {
  // Locks the four published figures for a single particle at 100% ER in a
  // 4-person party. These are the numbers the constants were verified against;
  // if a constant drifts, these fail loudly rather than silently skewing energy.
  const FOUR_PARTY = 4;
  const singleParticle = (
    receiverElement: Element,
    onField: boolean,
  ): number =>
    particleEnergyFor({
      emission: { count: 1, element: "pyro" },
      receiverElement,
      onField,
      partySize: FOUR_PARTY,
      energyRecharge: 1,
    });

  it("on-field, same element = 3 energy", () => {
    expect(singleParticle("pyro", true)).toBeCloseTo(3);
  });

  it("on-field, different element = 1 energy", () => {
    expect(singleParticle("cryo", true)).toBeCloseTo(1);
  });

  it("off-field, same element = 1.8 energy in a 4-party", () => {
    expect(singleParticle("pyro", false)).toBeCloseTo(1.8);
  });

  it("off-field, different element = 0.6 energy in a 4-party", () => {
    expect(singleParticle("cryo", false)).toBeCloseTo(0.6);
  });

  it("off-element multiplier is exactly 1/3, not 1/2", () => {
    // Regression guard: an earlier revision used 0.5, overstating every
    // off-element gain by ~50%.
    expect(PARTICLE_OFF_ELEMENT_MULTIPLIER).toBeCloseTo(1 / 3);
    expect(PARTICLE_BASE_ENERGY * PARTICLE_OFF_ELEMENT_MULTIPLIER).toBeCloseTo(1);
  });
});
