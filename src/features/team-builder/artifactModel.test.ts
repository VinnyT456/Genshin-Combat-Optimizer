import { describe, expect, it } from "vitest";
import { allArtifacts } from "@/game-data/artifacts/registry";
import { filterArtifacts, sortArtifacts } from "./artifactModel";

describe("artifactModel — reverse chronological order", () => {
  it("has a chronological catalog id for every published set", () => {
    expect(allArtifacts.every((set) => set.setId !== undefined)).toBe(true);
  });

  it("sorts by descending catalog id", () => {
    const sorted = sortArtifacts(allArtifacts);
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      expect(prev.setId).toBeGreaterThan(curr.setId!);
    }
  });

  it("is a total order — independent of the input array's order", () => {
    const reversed = [...allArtifacts].reverse();
    expect(sortArtifacts(reversed).map((s) => s.id)).toEqual(
      sortArtifacts(allArtifacts).map((s) => s.id),
    );
  });

  it("does not mutate its input", () => {
    const input = [...allArtifacts];
    const before = input.map((s) => s.id);
    sortArtifacts(input);
    expect(input.map((s) => s.id)).toEqual(before);
  });
});

describe("artifactModel — filtering", () => {
  it("filters by rarity", () => {
    const only5 = filterArtifacts(allArtifacts, { rarity: 5, query: "" });
    expect(only5.length).toBeGreaterThan(0);
    expect(only5.every((s) => s.rarity === 5)).toBe(true);
  });

  it("matches Chinese name, English name and bonus prose", () => {
    const sample = allArtifacts.find((s) => s.bonuses.length > 0)!;
    expect(
      filterArtifacts(allArtifacts, { rarity: "all", query: sample.nameEn }).some(
        (s) => s.id === sample.id,
      ),
    ).toBe(true);
    expect(
      filterArtifacts(allArtifacts, { rarity: "all", query: sample.nameZh }).some(
        (s) => s.id === sample.id,
      ),
    ).toBe(true);
  });

  it("an empty query returns every set, still sorted", () => {
    const all = filterArtifacts(allArtifacts, { rarity: "all", query: "   " });
    expect(all).toHaveLength(allArtifacts.length);
    expect(all.map((s) => s.id)).toEqual(sortArtifacts(allArtifacts).map((s) => s.id));
  });

  it("a query matching nothing returns an empty list rather than everything", () => {
    expect(
      filterArtifacts(allArtifacts, { rarity: "all", query: "zzzz-no-such-set" }),
    ).toHaveLength(0);
  });
});
