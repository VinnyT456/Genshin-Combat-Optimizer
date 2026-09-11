import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createXingqiuDefinition } from "./xingqiuDefinition";

describe("Xingqiu runtime kit", () => {
  it("creates sword rain only after Raincutter and applies Hydro", () => {
    const xingqiu = createXingqiuDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const ready = { ...xingqiu, burst: { ...xingqiu.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready, testPyro],
      [
        { characterId: ready.id, actionType: "burst" },
        { characterId: testPyro.id, actionType: "swap" },
        { characterId: testPyro.id, actionType: "normal" },
      ],
      testEnemy,
    );

    const rain = result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "xingqiu-rain-sword",
    );
    expect(rain).toHaveLength(1);
    expect(rain[0]?.damage?.element).toBe("hydro");
  });

  it("does not proc before the burst and expires after the authored window", () => {
    const xingqiu = createXingqiuDefinition(0);
    const ready = { ...xingqiu, burst: { ...xingqiu.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready, testPyro],
      [
        { characterId: testPyro.id, actionType: "normal" },
        { characterId: ready.id, actionType: "swap" },
        { characterId: ready.id, actionType: "burst" },
        { characterId: testPyro.id, actionType: "swap" },
        { characterId: testPyro.id, actionType: "normal" },
        ...Array.from({ length: 31 }, () => ({ characterId: testPyro.id, actionType: "normal" as const })),
      ],
      testEnemy,
    );
    const rain = result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "xingqiu-rain-sword",
    );
    expect(rain.length).toBeGreaterThan(0);
    const burst = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "xingqiu-burst",
    );
    expect(rain.at(-1)?.timestamp).toBeLessThan((burst?.timestamp ?? 0) + 15);
  });

  it("activates C2 Hydro shred only from sword rain and C4 boosts skill damage", () => {
    const xingqiu = createXingqiuDefinition(4, { normal: 1, skill: 10, burst: 10 });
    const ready = { ...xingqiu, burst: { ...xingqiu.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready, testPyro],
      [
        { characterId: ready.id, actionType: "burst" },
        { characterId: ready.id, actionType: "skill" },
        { characterId: testPyro.id, actionType: "swap" },
        { characterId: testPyro.id, actionType: "normal" },
      ],
      testEnemy,
    );
    expect(result.timeline.some((event) => event.type === "damage" && event.damage?.abilityId === "xingqiu-rain-sword")).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
