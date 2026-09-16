import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createYanfeiDefinition,
  YANFEI_KIT_METADATA,
} from "./yanfeiDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "charged" | "skill" | "burst") {
  const character = createYanfeiDefinition(constellationLevel, {
    normal: 1,
    skill: 1,
    burst: 1,
  });
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: "yanfei", actionType }],
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

describe("Yanfei runtime kit", () => {
  it("emits positive Pyro normal, charged, skill, and burst damage with exact damage types", () => {
    for (const [actionType, damageType] of [
      ["normal", "normal"], ["charged", "charged"], ["skill", "skill"], ["burst", "burst"],
    ] as const) {
      const result = run(0, actionType);
      const hits = damageEvents(result);
      expect(result.errors).toEqual([]);
      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits) {
        expect(hit).toMatchObject({
          sourceCharacterId: "yanfei",
          element: "pyro",
          damageType,
        });
        expect(hit.rawDamage).toBeGreaterThan(0);
        expect(hit.finalDamage).toBeGreaterThan(0);
      }
    }
  });

  it("applies the generated C3 Skill talent boost only at C3+", () => {
    const c2 = run(2, "skill");
    const c3 = run(3, "skill");
    const c2Hit = damageEvents(c2)[0];
    const c3Hit = damageEvents(c3)[0];
    expect(c2Hit?.rawDamage).toBeGreaterThan(0);
    expect(c3Hit?.rawDamage).toBeGreaterThan(c2Hit?.rawDamage ?? 0);
    expect(damageEvents(run(4, "skill"))[0]?.rawDamage).toBeCloseTo(c3Hit?.rawDamage ?? 0);
  });

  it("applies the generated C5 Burst talent boost only at C5+", () => {
    const c4 = run(4, "burst");
    const c5 = run(5, "burst");
    const c4Hit = damageEvents(c4)[0];
    const c5Hit = damageEvents(c5)[0];
    expect(c4Hit?.rawDamage).toBeGreaterThan(0);
    expect(c5Hit?.rawDamage).toBeGreaterThan(c4Hit?.rawDamage ?? 0);
    expect(damageEvents(run(6, "burst"))[0]?.rawDamage).toBeCloseTo(c5Hit?.rawDamage ?? 0);
  });

  it("clamps constellation input and explicitly leaves seal-dependent effects unsupported", () => {
    expect(createYanfeiDefinition(99).constellationLevel).toBe(6);
    expect(createYanfeiDefinition(-2).constellationLevel).toBe(0);
    expect(YANFEI_KIT_METADATA.unsupportedMechanics).toContain(
      "Scarlet Seal generation, cap, consumption, and seal-count charged-attack scaling",
    );
    expect(YANFEI_KIT_METADATA.unsupportedMechanics).toContain(
      "A4 Blazing Eye follow-up hit after a CRIT charged attack",
    );
  });
});
