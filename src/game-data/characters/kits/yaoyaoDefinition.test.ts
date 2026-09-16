import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createYaoyaoDefinition, YAOYAO_KIT_METADATA } from "./yaoyaoDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "skill" | "burst", talentLevel = 1) {
  const base = createYaoyaoDefinition(constellationLevel, {
    normal: talentLevel,
    skill: talentLevel,
    burst: talentLevel,
  });
  const character = { ...base, burst: { ...base.burst, energyCost: 0 } };
  return simulateRotation([character], [{ characterId: character.id, actionType }], testEnemy, noCrit);
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event.damage] : []);
}

describe("Yaoyao runtime kit", () => {
  it("deals positive sourced Dendro Normal Attack damage", () => {
    const result = run(0, "normal");
    const hit = damageEvents(result)[0];

    expect(result.errors).toEqual([]);
    expect(hit).toMatchObject({ element: "physical", damageType: "normal" });
    expect(hit?.finalDamage).toBeGreaterThan(0);
  });

  it("keeps Yuegui's target-dependent skill radishes fail-closed", () => {
    const character = createYaoyaoDefinition(0);
    const result = run(0, "skill");

    expect(result.errors).toEqual([]);
    expect(character.skill.instances).toEqual([]);
    expect(damageEvents(result)).toEqual([]);
    expect(YAOYAO_KIT_METADATA.unsupportedMechanics).toContain("yueguiRadishIntervalDamageAndTargetSelection");
  });

  it("executes only the unconditional sourced Dendro Burst hit", () => {
    const result = run(0, "burst");
    const hits = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ element: "dendro", damageType: "burst" });
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("applies generated C5 Burst talent levels at C5 but not C4", () => {
    const burstDamage = (level: number) => damageEvents(run(level, "burst"))[0]?.finalDamage ?? 0;
    const modifiers = (level: number) => createYaoyaoDefinition(level).constellations
      .filter((constellation) => constellation.level <= level)
      .flatMap((constellation) => constellation.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? [])
      .filter((modifier) => modifier.slot === "burst");

    expect(modifiers(4)).toEqual([]);
    expect(modifiers(5)).toEqual([{ slot: "burst", levels: 3 }]);
    expect(burstDamage(5)).toBeGreaterThan(burstDamage(4));
  });

  it("retains generated C3 skill talent boost but does not invent summon damage", () => {
    const c3 = createYaoyaoDefinition(3);
    const modifiers = c3.constellations
      .filter((constellation) => constellation.level <= 3)
      .flatMap((constellation) => constellation.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? [])
      .filter((modifier) => modifier.slot === "skill");

    expect(modifiers).toEqual([{ slot: "skill", levels: 3 }]);
    expect(c3.skill.instances).toEqual([]);
  });
});
