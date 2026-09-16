import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { KLEE_KIT_METADATA, createKleeDefinition } from "./kleeDefinition";

const noCrit = { critMode: "never" as const };

function run(
  constellationLevel: number,
  actionType: "normal" | "charged" | "skill" | "burst",
) {
  const character = createKleeDefinition(constellationLevel);
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Klee runtime kit", () => {
  it("executes the sourced normal, skill, charged, and burst damage", () => {
    const normal = run(0, "normal");
    const skill = run(0, "skill");
    const charged = run(0, "charged");
    const burst = run(0, "burst");

    expect(normal.timeline.filter((event) => event.type === "damage")).toHaveLength(1);
    expect(skill.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
    expect(charged.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(0);
  });

  it("applies C2 DEF reduction to damage after Jumpy Dumpty", () => {
    const c0 = createKleeDefinition(0);
    const c2 = createKleeDefinition(2);
    const rotation = [
      { characterId: c0.id, actionType: "skill" as const },
      { characterId: c0.id, actionType: "charged" as const },
    ];
    const baseline = simulateRotation([c0], rotation, testEnemy, noCrit);
    const reduced = simulateRotation(
      [c2],
      rotation.map((action) => ({ ...action, characterId: c2.id })),
      testEnemy,
      noCrit,
    );
    const baselineCharged = baseline.timeline.find(
      (event) => event.type === "damage" && event.damage?.damageType === "charged",
    );
    const reducedCharged = reduced.timeline.find(
      (event) => event.type === "damage" && event.damage?.damageType === "charged",
    );

    expect(reducedCharged?.damage?.finalDamage).toBeGreaterThan(baselineCharged?.damage?.finalDamage ?? 0);
    expect(KLEE_KIT_METADATA.c2DefReduction).toBe(0.23);
    expect(KLEE_KIT_METADATA.c2DurationSeconds).toBe(10);
  });

  it("increases actual skill and burst damage through C3 and C5 talent boosts", () => {
    expect(run(3, "skill").totalDamage).toBeGreaterThan(run(0, "skill").totalDamage);
    expect(run(5, "burst").totalDamage).toBeGreaterThan(run(0, "burst").totalDamage);
  });
});
