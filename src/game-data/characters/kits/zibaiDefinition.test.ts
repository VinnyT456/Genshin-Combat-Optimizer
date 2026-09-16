import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createZibaiDefinition,
  ZIBAI_KIT_METADATA,
} from "./zibaiDefinition";

const noCrit = { critMode: "never" as const };

function run(
  constellationLevel: number,
  actionTypes: ("normal" | "charged" | "skill" | "burst")[],
  talentLevels = { normal: 1, skill: 1, burst: 1 },
) {
  const source = createZibaiDefinition(constellationLevel, talentLevels);
  const character = { ...source, burst: { ...source.burst, energyCost: 0 } };
  return simulateRotation(
    [character],
    actionTypes.map((actionType) => ({ characterId: "zibai", actionType })),
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

describe("Zibai runtime kit", () => {
  it("emits positive sourced physical Normal/Charged and Geo Skill/Burst damage", () => {
    const expected = [
      ["normal", "physical", "normal"],
      ["charged", "physical", "charged"],
      ["skill", "geo", "skill"],
      ["burst", "geo", "burst"],
    ] as const;

    for (const [actionType, element, damageType] of expected) {
      const result = run(0, [actionType]);
      const hits = damageEvents(result);
      expect(result.errors).toEqual([]);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0]).toMatchObject({ element, damageType });
      expect(hits[0]?.rawDamage).toBeGreaterThan(0);
      expect(hits[0]?.finalDamage).toBeGreaterThan(0);
    }
  });

  it("honors the verified C3 Skill +3 and C5 Burst +3 talent boosts only at their gates", () => {
    const c2Skill = damageEvents(run(2, ["skill"]));
    const c3Skill = damageEvents(run(3, ["skill"]));
    const c4Burst = damageEvents(run(4, ["burst"]));
    const c5Burst = damageEvents(run(5, ["burst"]));

    expect(c2Skill[0]?.finalDamage).toBeGreaterThan(0);
    expect(c3Skill[0]?.rawDamage).toBeGreaterThan(c2Skill[0]?.rawDamage ?? 0);
    expect(c4Burst[0]?.rawDamage).toBeGreaterThan(0);
    expect(c5Burst[0]?.rawDamage).toBeGreaterThan(c4Burst[0]?.rawDamage ?? 0);
    expect(damageEvents(run(6, ["skill"]))[0]?.rawDamage).toBeCloseTo(c3Skill[0]?.rawDamage ?? 0);
    expect(damageEvents(run(6, ["burst"]))[0]?.rawDamage).toBeCloseTo(c5Burst[0]?.rawDamage ?? 0);
  });

  it("clamps constellation input and leaves all unverified perk channels fail-closed", () => {
    expect(createZibaiDefinition(99).constellationLevel).toBe(6);
    expect(createZibaiDefinition(-1).constellationLevel).toBe(0);
    expect(ZIBAI_KIT_METADATA.unsupportedMechanics).toHaveLength(8);
    expect(ZIBAI_KIT_METADATA.unsupportedMechanics.some((entry) => entry.includes("Lunar-Crystallize"))).toBe(true);
    expect(ZIBAI_KIT_METADATA.unsupportedMechanics.some((entry) => entry.includes("Phase Shift Radiance"))).toBe(true);
  });
});
