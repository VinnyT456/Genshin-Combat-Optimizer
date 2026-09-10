import { describe, expect, it } from "vitest";
import {
  applyStateEffect,
  applyStateEffects,
  createResourceStates,
  resourceValueAt,
} from "@/simulation/character/runtime";
import type { ResourceState } from "@/simulation/character/runtime";
import { syntheticUnit } from "@/simulation/character/fixtures";

const STACKS = "synthetic-stacks";

function stacks(): ResourceState {
  return createResourceStates(syntheticUnit.resources)[STACKS]!;
}

describe("resource states", () => {
  it("initialises from the definition", () => {
    const s = stacks();
    expect(s.value).toBe(0);
    expect(s.max).toBe(4);
    expect(s.durationSeconds).toBe(10);
  });

  it("gains and clamps at max", () => {
    let s = stacks();
    s = applyStateEffect(s, { resourceId: STACKS, kind: "gain", amount: 3 }, 0);
    expect(s.value).toBe(3);
    // Over-gaining must not bank hidden stacks.
    s = applyStateEffect(s, { resourceId: STACKS, kind: "gain", amount: 3 }, 1);
    expect(s.value).toBe(4);
  });

  it("consumes and clamps at zero", () => {
    let s = applyStateEffect(stacks(), { resourceId: STACKS, kind: "gain", amount: 2 }, 0);
    s = applyStateEffect(s, { resourceId: STACKS, kind: "consume", amount: 5 }, 1);
    expect(s.value).toBe(0);
  });

  it("sets an absolute value", () => {
    const s = applyStateEffect(stacks(), { resourceId: STACKS, kind: "set", amount: 3 }, 0);
    expect(s.value).toBe(3);
  });

  it("is pure — the input state is not mutated", () => {
    const before = stacks();
    const snapshot = { ...before };
    applyStateEffect(before, { resourceId: STACKS, kind: "gain", amount: 2 }, 0);
    expect(before).toEqual(snapshot);
  });

  it("expires after its duration", () => {
    const s = applyStateEffect(stacks(), { resourceId: STACKS, kind: "gain", amount: 4 }, 0);
    expect(resourceValueAt(s, 9.9)).toBe(4);
    expect(resourceValueAt(s, 10)).toBe(0);
  });

  it("treats an expired value as 0 when gaining, not as a hidden carry-over", () => {
    const s = applyStateEffect(stacks(), { resourceId: STACKS, kind: "gain", amount: 4 }, 0);
    const after = applyStateEffect(s, { resourceId: STACKS, kind: "gain", amount: 1 }, 20);
    expect(after.value).toBe(1);
  });

  it("reports 0 for an unknown resource rather than throwing", () => {
    expect(resourceValueAt(undefined, 0)).toBe(0);
  });

  it("ignores effects naming an unknown resource", () => {
    const states = createResourceStates(syntheticUnit.resources);
    const next = applyStateEffects(
      states,
      [{ resourceId: "does-not-exist", kind: "gain", amount: 5 }],
      0,
    );
    expect(next[STACKS]!.value).toBe(0);
  });

  it("applies an ability's declared effects in order", () => {
    const states = createResourceStates(syntheticUnit.resources);
    const next = applyStateEffects(states, syntheticUnit.skill.effects ?? [], 0);
    expect(next[STACKS]!.value).toBe(2);
  });

  it("stays JSON-serializable (Worker-safe)", () => {
    const states = createResourceStates(syntheticUnit.resources);
    expect(structuredClone(states)).toEqual(states);
  });
});
