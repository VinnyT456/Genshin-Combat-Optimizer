import { describe, expect, it } from "vitest";
import {
  flatTalent,
  MAX_TALENT_LEVEL,
  talentTable,
  talentValueAt,
} from "@/simulation/character/talent";

describe("talent tables", () => {
  const table = talentTable([1, 2, 3, 4, 5]);

  it("indexes level 1 as the first entry", () => {
    expect(talentValueAt(table, 1)).toBe(1);
  });

  it("indexes an interior level", () => {
    expect(talentValueAt(table, 3)).toBe(3);
  });

  it("clamps below level 1", () => {
    expect(talentValueAt(table, 0)).toBe(1);
    expect(talentValueAt(table, -10)).toBe(1);
  });

  it("clamps a short table at its last entry rather than returning undefined", () => {
    // A partially-sourced table must not produce `undefined` damage.
    expect(talentValueAt(table, MAX_TALENT_LEVEL)).toBe(5);
  });

  it("returns 0 for an empty table instead of throwing", () => {
    expect(talentValueAt(talentTable([]), 5)).toBe(0);
  });

  it("flatTalent is level-invariant", () => {
    const flat = flatTalent(7);
    for (let level = 1; level <= MAX_TALENT_LEVEL; level++) {
      expect(talentValueAt(flat, level)).toBe(7);
    }
  });
});
