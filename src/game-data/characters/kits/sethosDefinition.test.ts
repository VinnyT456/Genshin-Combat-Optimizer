import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createSethosDefinition } from "./sethosDefinition";

const noCrit = { critMode: "never" as const };

function damage(constellationLevel: number, talentLevels: { normal: number; skill: number; burst: number }, actionType: "normal" | "skill") {
  const character = createSethosDefinition(constellationLevel, talentLevels);
  return simulateRotation([character], [{ characterId: character.id, actionType }], testEnemy, noCrit).totalDamage;
}

describe("Sethos runtime kit", () => {
  it("preserves sourced normal attack talent scaling in simulated damage", () => {
    expect(damage(0, { normal: 10, skill: 1, burst: 1 }, "normal"))
      .toBeGreaterThan(damage(0, { normal: 1, skill: 1, burst: 1 }, "normal"));
  });

  it("applies the sourced C3 normal talent boost only at constellation 3", () => {
    const talents = { normal: 10, skill: 1, burst: 1 };
    expect(damage(2, talents, "normal")).toBe(damage(0, talents, "normal"));
    expect(damage(3, talents, "normal")).toBeGreaterThan(damage(2, talents, "normal"));
  });

  it("preserves sourced skill talent scaling independently of the C3 normal boost", () => {
    expect(damage(3, { normal: 1, skill: 10, burst: 1 }, "skill"))
      .toBeGreaterThan(damage(3, { normal: 1, skill: 1, burst: 1 }, "skill"));
  });

  it("keeps physical normal hits damage-bearing while leaving unverified burst-state hits absent", () => {
    const character = createSethosDefinition();
    const result = simulateRotation([character], [{ characterId: character.id, actionType: "normal" }], testEnemy, noCrit);
    expect(result.timeline.some((event) => event.type === "damage" && event.damage?.element === "physical")).toBe(true);
    expect(character.burst.instances).toHaveLength(0);
  });
});
