import { describe, expect, it } from "vitest";
import {
  ENERGY_PLACEHOLDER,
  formatEnergy,
  formatEnergyOfMax,
} from "@/lib/energyFormat";

describe("formatEnergy", () => {
  it("rounds whole values", () => {
    expect(formatEnergy(48)).toBe("48");
    expect(formatEnergy(60, 40)).toBe("60");
  });

  it("keeps one decimal below the burst cost, where it changes the answer", () => {
    expect(formatEnergy(29.4, 60)).toBe("29.4");
  });

  it("drops the decimal at or above the burst cost, where it is noise", () => {
    expect(formatEnergy(48.2, 40)).toBe("48");
  });

  it("drops the decimal when there is no threshold to compare against", () => {
    expect(formatEnergy(29.44)).toBe("29");
  });

  it("returns a placeholder rather than NaN", () => {
    expect(formatEnergy(Number.NaN)).toBe(ENERGY_PLACEHOLDER);
    expect(formatEnergy(Number.POSITIVE_INFINITY)).toBe(ENERGY_PLACEHOLDER);
  });
});

describe("formatEnergyOfMax", () => {
  it("renders the pair people actually read", () => {
    expect(formatEnergyOfMax(48, 60, 40)).toBe("48 / 60");
    expect(formatEnergyOfMax(29.4, 60, 60)).toBe("29.4 / 60");
  });

  it("shows a placeholder, never a zero, when there is no reading", () => {
    // A 0 would assert "this character has no energy", which is a claim.
    expect(formatEnergyOfMax(null, 60)).toBe(`${ENERGY_PLACEHOLDER} / 60`);
  });
});
