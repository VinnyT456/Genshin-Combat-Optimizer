import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { Rotation } from "@/types";
import { createXianglingDefinition } from "./xianglingDefinition";

function rotationFor(seconds: number) {
  const actions: Rotation = [{ characterId: "xiangling", actionType: "burst" }];
  while (actions.length * 0.4 < seconds) {
    actions.push({ characterId: "xiangling", actionType: "normal" as const });
  }
  return actions;
}

describe("Xiangling Pyronado runtime kit", () => {
  it("starts a snapshotting recurring field that survives its owner continuing actions", () => {
    const xiangling = createXianglingDefinition(0);
    const result = simulateRotation(
      [{ ...xiangling, burst: { ...xiangling.burst, energyCost: 0 } }],
      rotationFor(10),
      testEnemy,
    );
    const contacts = result.timeline.filter(
      (event) => event.type === "damage" && event.description.includes("旋火轮接触伤害"),
    );
    expect(contacts.length).toBeGreaterThanOrEqual(5);
    expect(contacts.every((event) => event.characterId === "xiangling")).toBe(true);
    expect(contacts.every((event) => event.timestamp >= 1.5 && event.timestamp < 10)).toBe(true);
  });

  it("extends the generic field lifecycle from 10s to 14s at C4", () => {
    const c0 = createXianglingDefinition(0);
    const c4 = createXianglingDefinition(4);
    expect(c0.burst.stance?.durationSeconds).toBe(10);
    expect(c4.burst.stance?.durationSeconds).toBe(14);
    expect(c4.burst.stance?.endsOnSwap).toBe(false);
    expect(c4.burst.stance?.triggers?.[0]).toMatchObject({
      trigger: "onInterval",
      intervalSeconds: 1.5,
      snapshotMode: "cast",
      maxProcs: 9,
    });
  });
});
