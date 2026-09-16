import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createYoimiyaDefinition,
  YOIMIYA_KIT_METADATA,
} from "./yoimiyaDefinition";

const noCrit = { critMode: "never" as const };

function run(
  constellationLevel: number,
  actionType: "normal" | "skill" | "burst",
  energyCost?: number,
) {
  const character = createYoimiyaDefinition(constellationLevel, {
    normal: 1,
    skill: 1,
    burst: 1,
  });
  return simulateRotation(
    [{
      ...character,
      burst: energyCost === undefined
        ? character.burst
        : { ...character.burst, energyCost },
    }],
    [{ characterId: "yoimiya", actionType }],
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline
    .filter((event) => event.type === "damage")
    .map((event) => event.damage)
    .filter((event) => event !== undefined);
}

describe("Yoimiya runtime kit", () => {
  it("emits positive physical normal and Pyro skill/burst damage with sourced damage types", () => {
    for (const [actionType, element, damageType] of [
      ["normal", "physical", "normal"],
      ["skill", "pyro", "skill"],
      ["burst", "pyro", "burst"],
    ] as const) {
      const result = run(0, actionType, actionType === "burst" ? 0 : undefined);
      const hits = damageEvents(result);
      expect(result.errors).toEqual([]);
      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits) {
        expect(hit).toMatchObject({ sourceCharacterId: "yoimiya", element, damageType });
        expect(hit.rawDamage).toBeGreaterThan(0);
        expect(hit.finalDamage).toBeGreaterThan(0);
      }
    }
  });

  it("uses both sourced Pyro Aurous Blaze burst hits", () => {
    const hits = damageEvents(run(0, "burst", 0));
    expect(hits).toHaveLength(2);
    expect(hits.map((hit) => hit.element)).toEqual(["pyro", "pyro"]);
    expect(hits.map((hit) => hit.damageType)).toEqual(["burst", "burst"]);
  });

  it("applies generated C3 Skill talent levels only at C3+", () => {
    const c2Hit = damageEvents(run(2, "skill"))[0];
    const c3Hit = damageEvents(run(3, "skill"))[0];
    expect(c2Hit?.rawDamage).toBeGreaterThan(0);
    expect(c3Hit?.rawDamage).toBeGreaterThan(c2Hit?.rawDamage ?? 0);
    expect(damageEvents(run(4, "skill"))[0]?.rawDamage).toBeCloseTo(c3Hit?.rawDamage ?? 0);
  });

  it("applies generated C5 Burst talent levels only at C5+", () => {
    const c4Hits = damageEvents(run(4, "burst", 0));
    const c5Hits = damageEvents(run(5, "burst", 0));
    expect(c4Hits[0]?.rawDamage).toBeGreaterThan(0);
    expect(c5Hits[0]?.rawDamage).toBeGreaterThan(c4Hits[0]?.rawDamage ?? 0);
    expect(damageEvents(run(6, "burst", 0))[0]?.rawDamage).toBeCloseTo(c5Hits[0]?.rawDamage ?? 0);
  });

  it("preserves the burst energy gate and explicitly lists unsupported state mechanics", () => {
    const starvedBurst = run(0, "burst");
    expect(damageEvents(starvedBurst)).toHaveLength(0);
    expect(starvedBurst.warnings.some((warning) => warning.includes("energy"))).toBe(true);
    expect(createYoimiyaDefinition(99).constellationLevel).toBe(6);
    expect(createYoimiyaDefinition(-1).constellationLevel).toBe(0);
    expect(YOIMIYA_KIT_METADATA.unsupportedMechanics).toContain(
      "C6 chance-based extra Blazing Arrow during Niwabi Fire-Dance (random proc deliberately omitted)",
    );
  });
});
