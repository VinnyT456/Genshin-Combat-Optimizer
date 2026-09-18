import { describe, expect, it } from "vitest";
import {
  elementalSkillUsesAtConstellation,
  elementalSkillUsesForEntry,
} from "./elementalSkillUsageData";

describe("manual elemental skill usage data", () => {
  it("accumulates constellation bonuses instead of treating them as totals", () => {
    const entry = {
      baseUses: 2,
      additionalUsesByConstellation: { 1: 1, 4: 1 },
    } as const;

    expect(elementalSkillUsesForEntry(entry, 0)).toBe(2);
    expect(elementalSkillUsesForEntry(entry, 1)).toBe(3);
    expect(elementalSkillUsesForEntry(entry, 3)).toBe(3);
    expect(elementalSkillUsesForEntry(entry, 6)).toBe(4);
  });

  it("clamps invalid constellation levels and leaves unfilled rows undefined", () => {
    const entry = { baseUses: 1 } as const;
    expect(elementalSkillUsesForEntry(entry, -1)).toBe(1);
    expect(elementalSkillUsesForEntry(entry, 9)).toBe(1);
    expect(elementalSkillUsesForEntry(entry, Number.NaN)).toBe(1);
    expect(elementalSkillUsesAtConstellation("not-authored", 0)).toBeUndefined();
  });
});
