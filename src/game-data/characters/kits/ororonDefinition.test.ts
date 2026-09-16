import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createOroronDefinition, ORORON_KIT_METADATA } from "./ororonDefinition";

const noCrit = { critMode: "never" as const };

function run(constellation: number, actions: Array<"burst" | "skill" | "normal">) {
  const source = createOroronDefinition(constellation);
  const character = { ...source, burst: { ...source.burst, energyCost: 0 } };
  return simulateRotation(
    [character],
    actions.map((actionType) => ({ characterId: "ororon", actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Ororon runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    expect(run(0, ["skill"]).totalDamage).toBeGreaterThan(0);
    expect(run(0, ["burst"]).totalDamage).toBeGreaterThan(0);
  });

  it("applies C2's timed Electro DMG bonus to subsequent Electro skill damage", () => {
    const c0 = run(0, ["burst", "skill"]);
    const c2 = run(2, ["burst", "skill"]);
    const c0Skill = c0.timeline.find((event) => event.type === "damage" && event.damage?.abilityId === "ororon-skill");
    const c2Skill = c2.timeline.find((event) => event.type === "damage" && event.damage?.abilityId === "ororon-skill");

    expect(c2Skill?.damage?.finalDamage).toBeGreaterThan(c0Skill?.damage?.finalDamage ?? 0);
    expect((c2Skill?.damage?.finalDamage ?? 0) / (c0Skill?.damage?.finalDamage ?? 1)).toBeCloseTo(1.08, 5);
    expect(ORORON_KIT_METADATA.c2DurationSeconds).toBe(9);
  });

  it("adds C6's sourced 200%-of-Hypersense Burst hit", () => {
    const c0 = run(0, ["burst"]);
    const c6 = run(6, ["burst"]);
    const c0Hits = c0.timeline.filter((event) => event.type === "damage");
    const c6Hits = c6.timeline.filter((event) => event.type === "damage");
    const extra = c6Hits.at(-1);

    expect(c6Hits).toHaveLength(c0Hits.length + 1);
    expect(extra?.damage?.finalDamage).toBeGreaterThan(0);
    expect(extra?.damage?.rawDamage).toBeCloseTo(createOroronDefinition(6).baseStats.atk * 3.2, 5);
    expect(ORORON_KIT_METADATA.a1HypersenseAtkRatio * ORORON_KIT_METADATA.c6BurstHypersenseMultiplier).toBe(3.2);
  });

  it("retains generated C3 and C5 talent boosts as real damage increases", () => {
    expect(run(3, ["burst"]).totalDamage).toBeGreaterThan(run(0, ["burst"]).totalDamage);
    expect(run(5, ["skill"]).totalDamage).toBeGreaterThan(run(0, ["skill"]).totalDamage);
  });
});
