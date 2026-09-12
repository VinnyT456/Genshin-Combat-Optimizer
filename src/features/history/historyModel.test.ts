import { describe, expect, it } from "vitest";
import { createHistoryEntry, sessionHistoryLabel } from "./historyModel";
import type { SimulationRun } from "@/features/simulation/runState";

const run = { fingerprint: "x", swapCostIsDefault: true, inputs: { team: [], rotation: [], enemy: { id: "e", name: "e", level: 1, resistances: {} }, config: {} }, result: { totalDamage: 1 } } as unknown as SimulationRun;

describe("history snapshots", () => {
  it("labels session-only entries and freezes the snapshot", () => {
    const entry = createHistoryEntry(run, { id: "1", createdAt: 1, label: "测试" });
    expect(sessionHistoryLabel(entry)).toContain("仅本次会话");
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.run)).toBe(true);
  });
});
