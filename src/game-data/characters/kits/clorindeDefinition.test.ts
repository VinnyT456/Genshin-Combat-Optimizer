import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import { CLORINDE_KIT_METADATA, createClorindeDefinition } from "./clorindeDefinition";

const noCrit = { critMode: "never" as const };

describe("Clorinde runtime kit", () => {
  it("executes the sourced multi-hit skill damage", () => {
    const clorinde = createClorindeDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const result = simulateRotation(
      [clorinde],
      [{ characterId: clorinde.id, actionType: "skill" }],
      testEnemy,
      noCrit,
    );
    const hits = result.timeline.filter((event) => event.type === "damage");

    expect(hits).toHaveLength(8);
    expect(hits.every((event) => event.damage?.element === "electro")).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("enters Night Vigil and converts the following Normal Attack to Electro", () => {
    const clorinde = createClorindeDefinition();
    const result = simulateRotation(
      [clorinde],
      [
        { characterId: clorinde.id, actionType: "skill" },
        { characterId: clorinde.id, actionType: "normal" },
      ],
      testEnemy,
      noCrit,
    );
    const normal = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.damageType === "normal",
    );

    expect(normal?.damage?.element).toBe("electro");
    expect(clorinde.skill.stance).toMatchObject({
      durationSeconds: CLORINDE_KIT_METADATA.nightVigilDurationSeconds,
      infusion: { element: "electro", canBeOverridden: false },
    });
  });

  it("adds C1's two 30% ATK Nightvigil Shade hits after a Normal Attack", () => {
    const c0 = createClorindeDefinition(0);
    const c1 = createClorindeDefinition(1);
    const rotation = [
      { characterId: c0.id, actionType: "skill" as const },
      { characterId: c0.id, actionType: "normal" as const },
    ];
    const c0Result = simulateRotation([c0], rotation, testEnemy, noCrit);
    const c1Result = simulateRotation([c1], rotation, testEnemy, noCrit);
    const c1Shades = c1Result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId.includes("clorinde-c1-nightvigil-shade"),
    );

    expect(c1Shades).toHaveLength(2);
    expect(c1Shades.every((event) => event.damage?.element === "electro")).toBe(true);
    expect(c1Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(CLORINDE_KIT_METADATA.c1ShadeRatio).toBe(0.3);
  });

  it("applies C6's sourced 10% CRIT Rate and 70% CRIT DMG after the skill", () => {
    const c0 = createClorindeDefinition(0);
    const c6 = createClorindeDefinition(6);
    const rotation = [
      { characterId: c0.id, actionType: "skill" as const },
      { characterId: c0.id, actionType: "normal" as const },
    ];
    const config = { critMode: "expected" as const };
    const c0Result = simulateRotation([c0], rotation, testEnemy, config);
    const c6Result = simulateRotation([c6], rotation, testEnemy, config);

    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c6.skill.buffs?.[0]?.modifiers).toEqual([
      { stat: "critRate", value: CLORINDE_KIT_METADATA.c6CritRate },
      { stat: "critDmg", value: CLORINDE_KIT_METADATA.c6CritDamage },
    ]);
  });
});
