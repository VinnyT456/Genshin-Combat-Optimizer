import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createWriothesleyDefinition } from "./wriothesleyDefinition";

const deterministic = { critMode: "never" as const };

function simulateAction(
  constellationLevel: number,
  actionType: "normal" | "skill" | "burst",
) {
  const character = createWriothesleyDefinition(constellationLevel);
  const burst = actionType === "burst"
    ? { ...character.burst, energyCost: 0 }
    : character.burst;
  const result = simulateRotation(
    [{ ...character, burst }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    deterministic,
  );
  const abilityId = actionType === "normal"
    ? "wriothesley-na-1"
    : character[actionType].id;
  const events = result.timeline.filter(
    (event) => event.type === "damage" && event.damage?.abilityId === abilityId,
  );
  return {
    abilityId,
    damage: result.damageByAbility[abilityId] ?? 0,
    events,
    errors: result.errors,
  };
}

function expectCryoDamage(
  result: ReturnType<typeof simulateAction>,
  damageType: "normal" | "skill" | "burst",
) {
  expect(result.errors).toEqual([]);
  expect(result.damage).toBeGreaterThan(0);
  expect(result.events.length).toBeGreaterThan(0);
  expect(result.events.every((event) =>
    event.type === "damage" && event.damage?.element === "cryo" &&
    event.damage.damageType === damageType && event.damage.finalDamage > 0,
  )).toBe(true);
}

describe("Wriothesley runtime kit", () => {
  it("simulates a normal hit as sourced Cryo normal damage", () => {
    const result = simulateAction(0, "normal");
    expectCryoDamage(result, "normal");
    expect(result.events).toHaveLength(1);
  });

  it("simulates Icefang Rush's direct enhanced-fist hit as Cryo skill damage", () => {
    const result = simulateAction(0, "skill");
    expectCryoDamage(result, "skill");
    expect(result.events).toHaveLength(1);
  });

  it("simulates all six sourced burst hits as Cryo burst damage", () => {
    const result = simulateAction(0, "burst");
    expectCryoDamage(result, "burst");
    expect(result.events).toHaveLength(6);
  });

  it("executes the sourced normal talent boost only from C3", () => {
    const c2 = simulateAction(2, "normal");
    const c3 = simulateAction(3, "normal");
    const c6 = simulateAction(6, "normal");

    expectCryoDamage(c2, "normal");
    expectCryoDamage(c3, "normal");
    expect(c3.damage).toBeGreaterThan(c2.damage);
    expect(c6.damage).toBe(c3.damage);
  });

  it("executes the sourced burst talent boost only from C5", () => {
    const c4 = simulateAction(4, "burst");
    const c5 = simulateAction(5, "burst");
    const c6 = simulateAction(6, "burst");

    expectCryoDamage(c4, "burst");
    expectCryoDamage(c5, "burst");
    expect(c5.damage).toBeGreaterThan(c4.damage);
    expect(c6.damage).toBe(c5.damage);
  });

  it("honors configured talent levels and leaves HP/state-dependent bonuses inert", () => {
    const levelOne = createWriothesleyDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const levelTen = createWriothesleyDefinition(0, { normal: 10, skill: 10, burst: 10 });
    const damageAtLevel = (character: typeof levelOne) => {
      const result = simulateRotation(
        [character],
        [{ characterId: character.id, actionType: "normal" }],
        testEnemy,
        deterministic,
      );
      return result.damageByAbility["wriothesley-na-1"] ?? 0;
    };

    expect(damageAtLevel(levelTen)).toBeGreaterThan(damageAtLevel(levelOne));
    expect(levelTen.passives.find(({ id }) => id === "wriothesley-a4")?.buffs).toBeUndefined();
  });
});
