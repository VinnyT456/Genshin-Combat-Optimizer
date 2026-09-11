import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { makeBuffResolver } from "@/simulation/buffs/makeBuffResolver";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { Buff } from "@/simulation/buffs/types";

const shortLivedAtk: Buff = {
  id: "short-lived-atk",
  source: "snapshot test",
  startTime: 0,
  duration: 0.1,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [{ stat: "atkFlat", value: 500 }],
};

function run(snapshotMode: Buff["snapshotMode"]) {
  return simulateRotation(
    [syntheticUnit],
    [{ characterId: syntheticUnit.id, actionType: "normal" }],
    testEnemy,
    {
      buffResolver: makeBuffResolver({
        buffs: [{ ...shortLivedAtk, snapshotMode }],
      }),
      critMode: "never",
    },
  );
}

describe("runtime buff snapshot semantics", () => {
  it("keeps a cast snapshot buff for every hit in a multi-hit ability", () => {
    const events = run("snapshot").timeline.filter((event) => event.type === "damage");
    expect(events).toHaveLength(2);
    expect(events[1]!.damage!.finalDamage).toBe(events[0]!.damage!.finalDamage);
  });

  it("resolves a dynamic buff again for each hit", () => {
    const events = run("dynamic").timeline.filter((event) => event.type === "damage");
    expect(events).toHaveLength(2);
    expect(events[1]!.damage!.finalDamage).toBeLessThan(events[0]!.damage!.finalDamage);
  });
});
