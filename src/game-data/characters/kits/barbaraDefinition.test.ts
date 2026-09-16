import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { BARBARA_KIT_METADATA, createBarbaraDefinition } from "./barbaraDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter(
    (event) => event.type === "damage" && event.characterId === "barbara",
  );
}

describe("Barbara runtime kit", () => {
  it("executes sourced baseline normal, charged, and skill damage", () => {
    const barbara = createBarbaraDefinition(0, { normal: 10, skill: 10, burst: 1 });
    const result = simulateRotation(
      [{ ...barbara, burst: { ...barbara.burst, energyCost: 0 } }],
      [
        { characterId: "barbara", actionType: "normal" },
        { characterId: "barbara", actionType: "charged" },
        { characterId: "barbara", actionType: "skill" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result)).toHaveLength(3);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies C2's 15% Hydro DMG bonus after Melody Loop starts", () => {
    const c0 = createBarbaraDefinition(0, { normal: 10, skill: 10, burst: 1 });
    const c2 = createBarbaraDefinition(2, { normal: 10, skill: 10, burst: 1 });
    const rotation = [
      { characterId: "barbara", actionType: "skill" as const },
      { characterId: "barbara", actionType: "normal" as const },
    ];
    const run = (character: typeof c0) =>
      simulateRotation([character], rotation, testEnemy, noCrit);

    const c0Damage = damageEvents(run(c0))[1]?.damage?.finalDamage ?? 0;
    const c2Damage = damageEvents(run(c2))[1]?.damage?.finalDamage ?? 0;
    expect(c2Damage / c0Damage).toBeCloseTo(1.15, 8);
  });

  it("uses C2's 15% skill cooldown reduction", () => {
    const c0 = createBarbaraDefinition(0);
    const c2 = createBarbaraDefinition(2);
    expect(c0.skill.cooldown.values[0]).toBe(32);
    expect(c2.skill.cooldown.values[0]).toBe(27.2);
    expect(BARBARA_KIT_METADATA.c2CooldownMultiplier).toBe(0.85);
  });

  it("executes generated C5 skill talent boost through damage resolution", () => {
    const c0 = createBarbaraDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createBarbaraDefinition(5, { normal: 1, skill: 1, burst: 1 });
    const run = (character: typeof c0) =>
      simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        [{ characterId: "barbara", actionType: "skill" }],
        testEnemy,
        noCrit,
      );

    expect(damageEvents(run(c5))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(c0))[0]?.damage?.finalDamage ?? 0,
    );
  });
});
