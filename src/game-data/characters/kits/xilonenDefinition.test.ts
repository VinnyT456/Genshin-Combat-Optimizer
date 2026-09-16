import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createXilonenDefinition } from "./xilonenDefinition";

const noCrit = { critMode: "never" as const };

function damage(constellationLevel: number, actionType: "skill" | "burst") {
  const character = createXilonenDefinition(constellationLevel, {
    normal: 1,
    skill: 1,
    burst: 1,
  });
  const ability = character[actionType];
  return simulateRotation(
    [{
      ...character,
      [actionType]: { ...ability, energyCost: 0 },
    }],
    [{ characterId: "xilonen", actionType }],
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof damage>) {
  return result.timeline
    .filter((event) => event.type === "damage")
    .map((event) => event.damage)
    .filter((event) => event !== undefined);
}

describe("Xilonen runtime kit", () => {
  it("emits positive DEF-scaled Geo skill and burst damage events", () => {
    const skill = damage(0, "skill");
    const burst = damage(0, "burst");

    expect(skill.errors).toEqual([]);
    expect(burst.errors).toEqual([]);
    expect(damageEvents(skill)).toEqual([
      expect.objectContaining({
        sourceCharacterId: "xilonen",
        abilityId: "xilonen-skill",
        element: "geo",
        damageType: "skill",
        rawDamage: expect.any(Number),
        finalDamage: expect.any(Number),
      }),
    ]);
    expect(damageEvents(skill)[0]?.rawDamage).toBeGreaterThan(0);
    expect(damageEvents(skill)[0]?.finalDamage).toBeGreaterThan(0);

    expect(damageEvents(burst)).toHaveLength(2);
    for (const event of damageEvents(burst)) {
      expect(event).toMatchObject({
        sourceCharacterId: "xilonen",
        abilityId: "xilonen-burst",
        element: "geo",
        damageType: "burst",
      });
      expect(event.rawDamage).toBeGreaterThan(0);
      expect(event.finalDamage).toBeGreaterThan(0);
    }
  });

  it("increases simulated skill damage through C3 only at constellation 3+", () => {
    const c2 = damage(2, "skill");
    const c3 = damage(3, "skill");
    const c4 = damage(4, "skill");
    const c2Damage = c2.damageByAbility["xilonen-skill"] ?? 0;

    const c2Hit = damageEvents(c2)[0];
    const c3Hit = damageEvents(c3)[0];
    const c4Hit = damageEvents(c4)[0];
    expect(c2Damage).toBeGreaterThan(0);
    expect(c3Hit?.rawDamage).toBeCloseTo((c2Hit?.rawDamage ?? 0) * (2.24 / 1.792));
    expect(c4Hit?.rawDamage).toBeCloseTo(c3Hit?.rawDamage ?? 0);
    expect(c4.damageByAbility["xilonen-skill"]).toBeGreaterThan(c2Damage);
  });

  it("increases simulated burst damage through C5 only at constellation 5+", () => {
    const c4 = damage(4, "burst");
    const c5 = damage(5, "burst");
    const c6 = damage(6, "burst");
    const c4Hits = damageEvents(c4);
    const c5Hits = damageEvents(c5);
    const c6Hits = damageEvents(c6);
    expect(c4Hits).toHaveLength(2);
    expect(c5Hits).toHaveLength(2);
    expect(c6Hits).toHaveLength(2);
    for (const index of [0, 1]) {
      expect(c4Hits[index]?.rawDamage).toBeGreaterThan(0);
      expect(c5Hits[index]?.rawDamage).toBeCloseTo(
        (c4Hits[index]?.rawDamage ?? 0) * (3.516 / 2.8128),
      );
      expect(c6Hits[index]?.rawDamage).toBeCloseTo(c5Hits[index]?.rawDamage ?? 0);
    }
    expect(c5.damageByAbility["xilonen-burst"]).toBeGreaterThan(
      c4.damageByAbility["xilonen-burst"] ?? 0,
    );
  });

  it("clamps constellation and honors caller-provided talent levels", () => {
    const c3 = createXilonenDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const invalid = createXilonenDefinition(99, { normal: 1, skill: 1, burst: 1 });
    expect(c3.constellations.find((row) => row.level === 3)?.buffs?.[0]?.talentLevelModifiers)
      .toEqual([{ slot: "skill", levels: 3 }]);
    expect(invalid.constellationLevel).toBe(6);
    expect(c3.talentLevels).toEqual({ normal: 1, skill: 1, burst: 1 });
  });
});
