import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  DURIN_KIT_METADATA,
  createDurinDefinition,
} from "./durinDefinition";

function burstDamage(constellationLevel: number, talentLevels = { normal: 1, skill: 1, burst: 10 }) {
  const character = createDurinDefinition(constellationLevel, talentLevels);
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "burst" }],
    testEnemy,
    { critMode: "never" },
  );
  return result;
}

describe("Durin runtime kit", () => {
  it("executes the generated skill and four-hit burst kit", () => {
    const character = createDurinDefinition(0);
    const result = simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    );

    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(burstDamage(0).timeline.filter((event) => event.type === "damage")).toHaveLength(4);
  });

  it("applies C4's unconditional 40% Burst DMG increase to actual damage", () => {
    // C4 also owns C3, so compare against C3 to isolate the C4 multiplier.
    const c3 = burstDamage(3).totalDamage;
    const c4 = burstDamage(4).totalDamage;

    expect(c4).toBeGreaterThan(c3);
    expect(c4 / c3).toBeCloseTo(1.4, 8);
    expect(DURIN_KIT_METADATA.c4BurstDamageBonus).toBe(0.4);
  });

  it("applies C6's unconditional 30% Burst DEF ignore to actual damage", () => {
    const c0 = burstDamage(0).totalDamage;
    const c6 = burstDamage(6).totalDamage;

    expect(c6).toBeGreaterThan(c0);
    expect(c6).not.toBeCloseTo(c0 * 1.3, 8);
    expect(DURIN_KIT_METADATA.c6BurstDefIgnore).toBe(0.3);
  });

  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    expect(burstDamage(3).totalDamage).toBeGreaterThan(burstDamage(0).totalDamage);
    const c0Skill = createDurinDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const c5Skill = createDurinDefinition(5, { normal: 1, skill: 10, burst: 1 });
    const runSkill = (character: typeof c0Skill) => simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    ).totalDamage;
    expect(runSkill(c5Skill)).toBeGreaterThan(runSkill(c0Skill));
  });
});
