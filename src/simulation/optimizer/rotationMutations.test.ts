import { describe, expect, it } from "vitest";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import type { Rotation } from "@/types";
import { generateRotationMutations } from "./rotationMutations";
import { rotationKey } from "./rotationIdentity";

describe("rotation mutation neighborhood", () => {
  const original: Rotation = [
    { characterId: testPyro.id, actionType: "normal" },
    { characterId: testPyro.id, actionType: "skill" },
    { characterId: testHydro.id, actionType: "swap" },
  ];

  it("generates reorder candidates without changing the action set", () => {
    const mutations = generateRotationMutations(original);
    const keys = new Set(mutations.map(rotationKey));
    const actionSignatures = (rotation: Rotation) =>
      rotation.map((action) => rotationKey([action])).sort();

    expect(mutations.length).toBeGreaterThan(0);
    expect(keys.size).toBe(mutations.length);
    expect(keys.has(rotationKey(original))).toBe(false);
    expect(mutations.every((rotation) => rotation.length === original.length)).toBe(true);
    expect(mutations.every((rotation) => actionSignatures(rotation).join("|") === actionSignatures(original).join("|"))).toBe(true);
    expect(mutations.some((rotation) => rotation[0]?.actionType === "skill")).toBe(true);
  });

  it("does not mutate the original rotation or its actions", () => {
    const before = JSON.stringify(original);
    const firstAction = original[0]!;
    generateRotationMutations(original);
    expect(JSON.stringify(original)).toBe(before);
    expect(original[0]).toBe(firstAction);
  });

  it("keeps tap and hold as distinct rotation identities", () => {
    const tap: Rotation = [{ characterId: testPyro.id, actionType: "skill", skillVariant: "tap" }];
    const hold: Rotation = [{ characterId: testPyro.id, actionType: "skill", skillVariant: "hold" }];

    expect(rotationKey(tap)).not.toBe(rotationKey(hold));
  });
});
