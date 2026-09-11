import { describe, expect, it } from "vitest";
import { nationalRotation, nationalTeam, testEnemy } from "@/game-data";
import { runSimulation } from "@/features/simulation/simulationAdapter";

describe("Raiden National preset runtime wiring", () => {
  it("adapts the exported legacy Raiden member to the generic kit", () => {
    const readyTeam = nationalTeam.map((character) => ({
      ...character,
      elementalBurst: { ...character.elementalBurst, energyCost: 0 },
    }));
    const result = runSimulation({
      team: readyTeam,
      rotation: nationalRotation,
      enemy: testEnemy,
    }).result;

    expect(result.errors).toEqual([]);
    expect(
      result.timeline.some(
        (event) => event.type === "damage" && event.damage?.abilityId === "raiden-shogun-eye-hit",
      ),
    ).toBe(true);
    expect(
      result.timeline.some(
        (event) => event.type === "damage" && event.damage?.abilityId.includes("raiden-shogun-musou"),
      ),
    ).toBe(true);
  });
});
