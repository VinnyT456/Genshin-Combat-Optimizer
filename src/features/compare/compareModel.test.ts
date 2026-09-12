import { describe, expect, it } from "vitest";
import { compareRuns } from "./compareModel";
import type { SimulationRun } from "@/features/simulation/runState";

function run(totalDamage: number, id = "a", rotation = []): SimulationRun {
  return {
    fingerprint: `identity-${id}`,
    swapCostIsDefault: true,
    inputs: { team: [], rotation, enemy: { id: "e", name: "e", level: 1, resistances: {} }, config: {} },
    result: { totalDamage } as SimulationRun["result"],
  };
}

describe("compareRuns", () => {
  it.each([[0, 100], [100, 0], [100, 100], [100, 80], [100, 120]])("handles %s -> %s", (base, value) => {
    const result = compareRuns(run(base), run(value));
    expect(result.status).toBe("compatible");
    expect(result.delta).toBe(value - base);
    expect(result.direction).toBe(value === base ? "equal" : value > base ? "increase" : "decrease");
    expect(result.percent).toBe(base === 0 ? null : ((value - base) / Math.abs(base)) * 100);
  });

  it("rejects incompatible, stale, and non-finite runs", () => {
    expect(compareRuns(run(1), { ...run(2), inputs: { ...run(2).inputs, enemy: { id: "other", name: "e", level: 1, resistances: {} } } }).status).toBe("incompatible");
    expect(compareRuns(run(1), run(2), { team: [], rotation: [], enemy: { id: "different", name: "e", level: 1, resistances: {} }, config: {} }).status).toBe("stale");
    expect(compareRuns(run(Number.NaN), run(2)).status).toBe("invalid");
  });
});
