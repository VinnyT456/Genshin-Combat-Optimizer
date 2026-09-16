import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createSayuDefinition } from "./sayuDefinition";

function damages(result: ReturnType<typeof simulateRotation>) {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "sayu")
    .map((event) => event.damage?.finalDamage ?? 0);
}

describe("Sayu runtime kit", () => {
  it("executes sourced baseline skill damage", () => {
    const sayu = createSayuDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const result = simulateRotation([sayu], [{ characterId: sayu.id, actionType: "skill" }], testEnemy);

    expect(damages(result)).toHaveLength(5);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C2's sourced 3.3% tap-mode kick damage increase only at C2+", () => {
    const rotation = [{ characterId: "sayu", actionType: "skill" as const }];
    const c0 = damages(simulateRotation([createSayuDefinition(0)], rotation, testEnemy));
    const c2 = damages(simulateRotation([createSayuDefinition(2)], rotation, testEnemy));

    expect(c2[3]).toBeCloseTo(c0[3]! * 1.033, 8);
    expect(c2.slice(0, 3)).toEqual(c0.slice(0, 3));
    expect(c2[4]).toBe(c0[4]);
  });

  it("raises actual Burst damage through the sourced C3 talent-level boost", () => {
    const rotation = [{ characterId: "sayu", actionType: "burst" as const }];
    const c0 = createSayuDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c3 = createSayuDefinition(3, { normal: 1, skill: 1, burst: 10 });
    const result0 = simulateRotation([{ ...c0, burst: { ...c0.burst, energyCost: 0 } }], rotation, testEnemy);
    const result3 = simulateRotation([{ ...c3, burst: { ...c3.burst, energyCost: 0 } }], rotation, testEnemy);

    expect(damages(result3)[0]).toBeGreaterThan(damages(result0)[0]!);
  });

  it("raises actual Skill damage through the sourced C5 talent-level boost", () => {
    const rotation = [{ characterId: "sayu", actionType: "skill" as const }];
    const c0 = createSayuDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const c5 = createSayuDefinition(5, { normal: 1, skill: 10, burst: 1 });

    expect(damages(simulateRotation([c5], rotation, testEnemy))[0])
      .toBeGreaterThan(damages(simulateRotation([c0], rotation, testEnemy))[0]!);
  });
});
