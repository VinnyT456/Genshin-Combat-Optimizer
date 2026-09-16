import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerFElectroDefinition } from "./travelerFElectroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const character = createTravelerFElectroDefinition(constellationLevel);
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
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-f-electro");
}

describe("Female Electro Traveler runtime kit", () => {
  it("simulates Lightning Blade as Electro damage", () => {
    const result = run(0, "skill");
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("electro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates both sourced Bellowing Thunder hits as Electro damage", () => {
    const result = run(0, "burst");
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "electro")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("gates C5 skill and C3 burst talent boosts at their constellation levels", () => {
    const c0Skill = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c5Skill = damageEvents(run(5, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c0Burst = damageEvents(run(0, "burst")).map((event) => event.damage?.finalDamage ?? 0);
    const c3Burst = damageEvents(run(3, "burst")).map((event) => event.damage?.finalDamage ?? 0);

    expect(c5Skill).toBeGreaterThan(c0Skill);
    expect(c3Burst).toHaveLength(c0Burst.length);
    expect(c3Burst.every((damage, index) => damage > (c0Burst[index] ?? 0))).toBe(true);
  });
});
