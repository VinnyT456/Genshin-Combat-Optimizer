import { describe, expect, it } from "vitest";
import {
  evaluateIcd,
  icdKey,
  resolveIcdConfig,
  STANDARD_ICD_CONFIG,
} from "@/simulation/reactions/icd";
import type { IcdBehaviour, IcdCounter } from "@/simulation/reactions/types";
import { STANDARD_ICD } from "@/simulation/reactions/types";

/** Drive a sequence of hit times through one counter and record what applied. */
function sequence(
  behaviour: IcdBehaviour,
  times: readonly number[],
): boolean[] {
  let counter: IcdCounter | undefined;
  const applied: boolean[] = [];
  for (const time of times) {
    const decision = evaluateIcd(behaviour, counter, time);
    applied.push(decision.applies);
    counter = decision.counter;
  }
  return applied;
}

describe("standard ICD (2.5s / 3 hits)", () => {
  it("uses the verified constants", () => {
    expect(STANDARD_ICD_CONFIG).toEqual({ intervalSeconds: 2.5, hits: 3 });
    expect(resolveIcdConfig(STANDARD_ICD)).toEqual(STANDARD_ICD_CONFIG);
  });

  it("applies on the 1st, 4th and 7th hits of a fast sequence", () => {
    // The documented Yoimiya example: 7 shots inside ~2.5s, only 1/4/7 react.
    const times = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
    expect(sequence(STANDARD_ICD, times)).toEqual([
      true,
      false,
      false,
      true,
      false,
      false,
      true,
    ]);
  });

  it("the 4th hit does NOT restart the 2.5s timer", () => {
    // If hit 4 (at t=0.9) restarted the timer, the hit at t=3.0 would be only
    // 2.1s after it and would NOT apply on the timer branch. It must apply.
    const times = [0, 0.3, 0.6, 0.9, 3.0];
    expect(sequence(STANDARD_ICD, times)).toEqual([
      true,
      false,
      false,
      true,
      true,
    ]);
  });

  it("the first hit after the timer applies and resets the hit sequence", () => {
    // After the reset at t=3, hits at 3.1/3.2 must NOT apply (they are hits
    // 2 and 3 of a fresh window), proving the counter reset.
    const times = [0, 0.3, 0.6, 3.0, 3.1, 3.2, 3.3];
    expect(sequence(STANDARD_ICD, times)).toEqual([
      true,
      false,
      false,
      true,
      false,
      false,
      true,
    ]);
  });

  it("treats the interval boundary as inclusive (>= 2.5s applies)", () => {
    expect(sequence(STANDARD_ICD, [0, 2.5])).toEqual([true, true]);
    expect(sequence(STANDARD_ICD, [0, 2.4999])).toEqual([true, false]);
  });

  it("a slow sequence applies every hit", () => {
    expect(sequence(STANDARD_ICD, [0, 3, 6, 9])).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});

describe("ICD deviations are DATA, not code branches", () => {
  it("mode:none applies on every hit", () => {
    const none: IcdBehaviour = { mode: "none" };
    expect(sequence(none, [0, 0.1, 0.2, 0.3, 0.4])).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(resolveIcdConfig(none)).toBeUndefined();
  });

  it("supports a custom 1s / 3-hit ICD", () => {
    const custom: IcdBehaviour = {
      mode: "custom",
      config: { intervalSeconds: 1, hits: 3 },
    };
    // Same 3-hit pattern, but the timer resets after 1s instead of 2.5s.
    expect(sequence(custom, [0, 0.2, 0.4, 1.5])).toEqual([
      true,
      false,
      false,
      true,
    ]);
  });

  it("supports a custom 5s / 5-hit ICD", () => {
    const custom: IcdBehaviour = {
      mode: "custom",
      config: { intervalSeconds: 5, hits: 5 },
    };
    expect(sequence(custom, [0, 0.1, 0.2, 0.3, 0.4, 0.5])).toEqual([
      true,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("supports a timer-only ICD (hits: 1 applies every hit in-window)", () => {
    const custom: IcdBehaviour = {
      mode: "custom",
      config: { intervalSeconds: 0.5, hits: 1 },
    };
    expect(sequence(custom, [0, 0.1, 0.2])).toEqual([true, true, true]);
  });

  it("a 2s Burning-style ICD gates correctly", () => {
    const burning: IcdBehaviour = {
      mode: "custom",
      config: { intervalSeconds: 2, hits: 1 },
    };
    expect(sequence(burning, [0, 1, 2, 3])).toEqual([true, true, true, true]);
  });
});

describe("ICD keys are per attacker, per target, per ability group", () => {
  it("produces distinct keys for each dimension", () => {
    const base = { attackerId: "a", targetId: "t", group: "g" };
    expect(icdKey(base)).toBe("a|t|g");
    expect(icdKey({ ...base, attackerId: "b" })).not.toBe(icdKey(base));
    expect(icdKey({ ...base, targetId: "u" })).not.toBe(icdKey(base));
    expect(icdKey({ ...base, group: "h" })).not.toBe(icdKey(base));
  });

  it("is deterministic", () => {
    const params = { attackerId: "a", targetId: "t", group: "g" };
    expect(icdKey(params)).toBe(icdKey(params));
  });
});

describe("ICD purity", () => {
  it("does not mutate the previous counter", () => {
    const previous: IcdCounter = { windowStart: 0, hitsInWindow: 1 };
    const snapshot = structuredClone(previous);
    evaluateIcd(STANDARD_ICD, previous, 1);
    expect(previous).toEqual(snapshot);
  });

  it("is deterministic for identical inputs", () => {
    const previous: IcdCounter = { windowStart: 0, hitsInWindow: 2 };
    expect(evaluateIcd(STANDARD_ICD, previous, 1)).toEqual(
      evaluateIcd(STANDARD_ICD, previous, 1),
    );
  });
});
