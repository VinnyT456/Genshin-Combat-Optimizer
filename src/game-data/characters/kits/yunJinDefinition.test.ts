import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createYunJinDefinition,
  YUN_JIN_KIT_METADATA,
} from "./yunJinDefinition";

const noCrit = { critMode: "never" as const };

function run(
  constellationLevel: number,
  actionTypes: ("normal" | "charged" | "skill" | "burst")[],
  talentLevels = { normal: 1, skill: 1, burst: 1 },
) {
  const character = createYunJinDefinition(constellationLevel, talentLevels);
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline
    .filter((event) => event.type === "damage")
    .map((event) => event.damage)
    .filter((damage) => damage !== undefined);
}

describe("Yun Jin runtime kit", () => {
  it("emits positive sourced physical Normal/Charged and Geo Skill/Burst hits", () => {
    const expectations = [
      ["normal", "physical", "normal"],
      ["charged", "physical", "charged"],
      ["skill", "geo", "skill"],
      ["burst", "geo", "burst"],
    ] as const;

    for (const [actionType, element, damageType] of expectations) {
      const result = run(0, [actionType]);
      const hits = damageEvents(result);
      expect(result.errors).toEqual([]);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0]).toMatchObject({ element, damageType });
      expect(hits[0]?.rawDamage).toBeGreaterThan(0);
      expect(hits[0]?.finalDamage).toBeGreaterThan(0);
    }
  });

  it("applies C2's sourced 15% Normal Attack DMG bonus only after Burst and only at C2+", () => {
    const c1Events = damageEvents(run(1, ["burst", "normal"]));
    const c2Events = damageEvents(run(2, ["burst", "normal"]));
    const c2NormalOnlyEvents = damageEvents(run(2, ["normal"]));

    expect(c2Events[0]).toMatchObject({ element: "geo", damageType: "burst" });
    expect(c2Events[1]).toMatchObject({ element: "physical", damageType: "normal" });
    expect(c2Events[1]?.finalDamage).toBeGreaterThan(c1Events[1]?.finalDamage ?? 0);
    expect(c2Events[1]?.finalDamage).toBeGreaterThan(c2NormalOnlyEvents[0]?.finalDamage ?? 0);
    expect(YUN_JIN_KIT_METADATA.c2NormalDamageBonus).toBe(0.15);
  });

  it("honors generated C3 Burst and C5 Skill talent boosts at their constellation gates", () => {
    const c2Burst = damageEvents(run(2, ["burst"]))[0];
    const c3Burst = damageEvents(run(3, ["burst"]))[0];
    const c4Skill = damageEvents(run(4, ["skill"]))[0];
    const c5Skill = damageEvents(run(5, ["skill"]))[0];

    expect(c2Burst?.rawDamage).toBeGreaterThan(0);
    expect(c3Burst?.rawDamage).toBeGreaterThan(c2Burst?.rawDamage ?? 0);
    expect(damageEvents(run(4, ["burst"]))[0]?.rawDamage).toBeCloseTo(c3Burst?.rawDamage ?? 0);
    expect(c4Skill?.rawDamage).toBeGreaterThan(0);
    expect(c5Skill?.rawDamage).toBeGreaterThan(c4Skill?.rawDamage ?? 0);
    expect(damageEvents(run(6, ["skill"]))[0]?.rawDamage).toBeCloseTo(c5Skill?.rawDamage ?? 0);
  });

  it("fails closed on the Burst's unrepresentable additive quota and clamps constellation input", () => {
    expect(createYunJinDefinition(99).constellationLevel).toBe(6);
    expect(createYunJinDefinition(-1).constellationLevel).toBe(0);
    expect(YUN_JIN_KIT_METADATA.unsupportedMechanics).toContain(
      "Flying Cloud Flag Formation DEF-based additive Normal Attack damage and its sourced hit quota; runtime cannot consume a bounded quota per eligible hit",
    );
  });
});
