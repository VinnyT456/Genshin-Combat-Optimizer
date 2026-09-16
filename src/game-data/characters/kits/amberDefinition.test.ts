import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createAmberDefinition } from "./amberDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter(
    (event) => event.type === "damage" && event.characterId === "amber",
  );
}

describe("Amber runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const amber = createAmberDefinition();
    const result = simulateRotation(
      [{ ...amber, burst: { ...amber.burst, energyCost: 0 } }],
      [
        { characterId: amber.id, actionType: "skill" },
        { characterId: amber.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result).length).toBeGreaterThanOrEqual(2);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A1's sourced Fiery Rain CRIT Rate in expected damage", () => {
    const locked = createAmberDefinition(0, undefined, { ascensionPhase: 0 });
    const unlocked = createAmberDefinition(0, undefined, { ascensionPhase: 1 });
    const rotation = [{ characterId: locked.id, actionType: "burst" as const }];
    const run = (character: typeof locked) =>
      simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        rotation,
        testEnemy,
      );

    expect(damageEvents(run(unlocked))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(locked))[0]?.damage?.finalDamage ?? 0,
    );
  });

  it("applies C6's sourced party ATK buff after Fiery Rain", () => {
    const c0 = createAmberDefinition(0);
    const c6 = createAmberDefinition(6);
    const rotation = [
      { characterId: c0.id, actionType: "burst" as const },
      { characterId: c0.id, actionType: "skill" as const },
    ];
    const run = (character: typeof c0) =>
      simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        rotation,
        testEnemy,
        noCrit,
      );
    const baseEvents = damageEvents(run(c0));
    const buffedEvents = damageEvents(run(c6));

    expect(buffedEvents[1]?.damage?.finalDamage).toBeGreaterThan(
      baseEvents[1]?.damage?.finalDamage ?? 0,
    );
  });

  it("applies generated C3 and C5 talent boosts through damage resolution", () => {
    const c0 = createAmberDefinition(0);
    const c3 = createAmberDefinition(3);
    const c5 = createAmberDefinition(5);
    const run = (character: typeof c0, actionType: "skill" | "burst") =>
      simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        [{ characterId: character.id, actionType }],
        testEnemy,
        noCrit,
      );

    expect(damageEvents(run(c3, "burst"))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(c0, "burst"))[0]?.damage?.finalDamage ?? 0,
    );
    expect(damageEvents(run(c5, "skill"))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(c0, "skill"))[0]?.damage?.finalDamage ?? 0,
    );
  });
});
