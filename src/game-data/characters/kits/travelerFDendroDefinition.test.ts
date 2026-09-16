import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerFDendroDefinition } from "./travelerFDendroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const character = createTravelerFDendroDefinition(constellationLevel);
  const simulationCharacter = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [simulationCharacter],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-f-dendro");
}

describe("Female Dendro Traveler runtime kit", () => {
  it("simulates the sourced Razorgrass Blade hit as Dendro damage", () => {
    const result = run(0, "skill");
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("dendro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates both sourced Lea Lotus Lamp burst hits as Dendro damage", () => {
    const result = run(0, "burst");
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "dendro")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("gates C3 skill and C5 burst talent boosts at their constellation levels", () => {
    const c0Skill = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c3Skill = damageEvents(run(3, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c0Burst = damageEvents(run(0, "burst")).map((event) => event.damage?.finalDamage ?? 0);
    const c5Burst = damageEvents(run(5, "burst")).map((event) => event.damage?.finalDamage ?? 0);

    expect(c3Skill).toBeGreaterThan(c0Skill);
    expect(c5Burst).toHaveLength(c0Burst.length);
    expect(c5Burst.every((damage, index) => damage > (c0Burst[index] ?? 0))).toBe(true);
  });
});
