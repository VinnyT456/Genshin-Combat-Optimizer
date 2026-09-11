import { describe, expect, it } from "vitest";
import {
  activeConstellations,
  allAbilities,
  ascensionValue,
  findAbility,
  unlockedPassives,
} from "@/simulation/character/character";
import { syntheticUnit } from "@/simulation/character/fixtures";

describe("generic character definition", () => {
  it("enumerates abilities in a fixed, deterministic order", () => {
    const ids = allAbilities(syntheticUnit).map((a) => a.id);
    expect(ids).toEqual(["synthetic-n1", "synthetic-skill", "synthetic-burst"]);
    // Repeated calls must not reorder.
    expect(allAbilities(syntheticUnit).map((a) => a.id)).toEqual(ids);
  });

  it("finds an ability by id and reports undefined for an unknown one", () => {
    expect(findAbility(syntheticUnit, "synthetic-skill")?.name).toBe("Synthetic Skill");
    expect(findAbility(syntheticUnit, "nope")).toBeUndefined();
  });

  it("reads the ascension stat at the current phase, clamping past the table", () => {
    const bonus = syntheticUnit.ascensionBonus;
    expect(ascensionValue(bonus, 0)).toBe(0);
    expect(ascensionValue(bonus, 2)).toBeCloseTo(0.096);
    // Phase 6 with a 4-entry table clamps at the last entry.
    expect(ascensionValue(bonus, 6)).toBeCloseTo(0.192);
  });

  it("unlocks only passives at or below the ascension phase", () => {
    expect(unlockedPassives(syntheticUnit).map((p) => p.id)).toEqual([
      "synthetic-a1",
      "synthetic-a4",
    ]);
    const low = { ...syntheticUnit, ascensionPhase: 1 };
    expect(unlockedPassives(low).map((p) => p.id)).toEqual(["synthetic-a1"]);
    const none = { ...syntheticUnit, ascensionPhase: 0 };
    expect(unlockedPassives(none)).toEqual([]);
  });

  it("returns only owned constellations, in ascending level order", () => {
    // fixture owns C2; C1 is owned, C4 is not.
    expect(activeConstellations(syntheticUnit).map((c) => c.level)).toEqual([1]);
    const c6 = { ...syntheticUnit, constellationLevel: 6 };
    expect(activeConstellations(c6).map((c) => c.level)).toEqual([1, 4]);
    const c0 = { ...syntheticUnit, constellationLevel: 0 };
    expect(activeConstellations(c0)).toEqual([]);
  });

  it("fails closed for invalid runtime constellation levels", () => {
    // Generic definitions are also reconstructed from persisted/session input
    // at runtime, so the compile-time `number` field cannot be trusted as a
    // C0--C6 guarantee by itself.
    expect(
      activeConstellations({ ...syntheticUnit, constellationLevel: 7 }),
    ).toEqual([]);
    expect(
      activeConstellations({ ...syntheticUnit, constellationLevel: Number.NaN }),
    ).toEqual([]);
    expect(
      activeConstellations({ ...syntheticUnit, constellationLevel: Number.POSITIVE_INFINITY }),
    ).toEqual([]);
  });

  it("ignores malformed constellation rows instead of unlocking them", () => {
    const malformed = {
      ...syntheticUnit,
      constellationLevel: 6,
      constellations: [
        ...syntheticUnit.constellations,
        { level: 0 as 1, id: "invalid-c0", name: "invalid", effects: [] },
        { level: 7 as 6, id: "invalid-c7", name: "invalid", effects: [] },
      ],
    };
    expect(activeConstellations(malformed).map((c) => c.id)).toEqual([
      "synthetic-c1",
      "synthetic-c4",
    ]);
  });

  it("does not mutate the definition when sorting constellations", () => {
    const before = structuredClone(syntheticUnit.constellations);
    activeConstellations({ ...syntheticUnit, constellationLevel: 6 });
    expect(syntheticUnit.constellations).toEqual(before);
  });

  it("is fully JSON-serializable — no functions in the data model", () => {
    expect(structuredClone(syntheticUnit)).toEqual(syntheticUnit);
  });
});
