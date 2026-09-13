import { describe, expect, it } from "vitest";
import { findWeapon } from "@/game-data/weapons/registry";
import { findArtifact } from "@/game-data/artifacts/registry";
import { findCharacter } from "@/game-data/characters/registry";
import { compileAuthoredBuild } from "./buildAuthoring";
import { AUTHORED_BASE_BUILDS } from "./recommendedBuildsData";

// ---------------------------------------------------------------------------
// The safety net for HAND-AUTHORED build data. Its whole job is to make a typo
// in `recommendedBuildsData.ts` fail loudly here instead of shipping a silently
// broken build. If you fill in a row and this suite goes red, the message tells
// you which id did not resolve.
// ---------------------------------------------------------------------------

const filledEntries = Object.entries(AUTHORED_BASE_BUILDS).filter(
  ([, b]) => b !== null,
);

describe("authored base-build data integrity", () => {
  it("keys every row by a real character id", () => {
    for (const id of Object.keys(AUTHORED_BASE_BUILDS)) {
      expect(findCharacter(id), `unknown character id "${id}"`).toBeDefined();
    }
  });

  it("every filled build names a weapon id that resolves", () => {
    for (const [id, build] of filledEntries) {
      expect(
        findWeapon(build!.weapon),
        `${id}: unknown weapon id "${build!.weapon}"`,
      ).toBeDefined();
    }
  });

  it("every filled build names an artifact set id that resolves", () => {
    for (const [id, build] of filledEntries) {
      expect(
        findArtifact(build!.set),
        `${id}: unknown artifact set id "${build!.set}"`,
      ).toBeDefined();
    }
  });

  it("every filled build compiles without throwing", () => {
    for (const [id, build] of filledEntries) {
      expect(() => compileAuthoredBuild(build), `${id} failed to compile`).not.toThrow();
    }
  });
});

describe("compileAuthoredBuild", () => {
  it("returns undefined for a null (unfilled) row", () => {
    expect(compileAuthoredBuild(null)).toBeUndefined();
  });

  it("maps element goblet tokens to a per-element DMG bonus", () => {
    const b = compileAuthoredBuild({
      weapon: "engulfinglightning",
      set: "emblem-of-severed-fate",
      sands: "ER%",
      goblet: "pyro%",
      circlet: "crit_rate",
    })!;
    expect(b.mainStats.goblet).toEqual({
      stat: "elementalDmgBonus",
      value: 0.466,
      element: "pyro",
    });
    expect(b.mainStats.sands).toEqual({ stat: "energyRecharge", value: 0.518 });
    expect(b.mainStats.circlet).toEqual({ stat: "critRate", value: 0.311 });
  });

  it("leaves a non-damage circlet stat unsimulated and records the note", () => {
    const b = compileAuthoredBuild({
      weapon: "mistsplitterreforged",
      set: "noblesse-oblige",
      sands: "ER%",
      goblet: "HP%",
      circlet: "heal%",
    })!;
    // Heal% is not a damage stat, so it is NOT mapped to a wrong channel.
    expect(b.mainStats.circlet).toBeUndefined();
    // Its intent is carried honestly instead.
    expect(b.circletNote).toContain("治疗加成");
  });

  it("carries the free-text note through", () => {
    const b = compileAuthoredBuild({
      weapon: "engulfinglightning",
      set: "emblem-of-severed-fate",
      note: "ER ~250%",
    })!;
    expect(b.note).toBe("ER ~250%");
  });

  it("carries ordered substat priorities through to the baseline compiler", () => {
    const b = compileAuthoredBuild({
      weapon: "engulfinglightning",
      set: "emblem-of-severed-fate",
      substatPriorities: ["ER%", "crit_rate", "crit_dmg", "ATK%"],
    })!;
    expect(b.substatPriorities).toEqual([
      "ER%",
      "crit_rate",
      "crit_dmg",
      "ATK%",
    ]);
  });
});
