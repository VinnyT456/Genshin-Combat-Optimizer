import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createZhongliDefinition, ZHONGLI_KIT_METADATA } from "./zhongliDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "skill" | "burst", talentLevel = 1) {
  const character = createZhongliDefinition(constellationLevel, {
    normal: talentLevel,
    skill: talentLevel,
    burst: talentLevel,
  });
  const configured = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation([configured], [{ characterId: configured.id, actionType }], testEnemy, noCrit);
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event.damage] : []);
}

describe("Zhongli runtime kit", () => {
  it("deals the unconditional Stone Stele hit as positive Geo skill damage", () => {
    const result = run(0, "skill");
    const hits = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ abilityId: "zhongli-skill", element: "geo", damageType: "skill" });
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("deals sourced Planet Befall as positive Geo Burst damage", () => {
    const result = run(0, "burst");
    const hits = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ abilityId: "zhongli-burst", element: "geo", damageType: "burst" });
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("applies sourced C3 skill and C5 Burst talent boosts at their exact thresholds", () => {
    const skillDamage = (level: number) => damageEvents(run(level, "skill", 6))[0]?.finalDamage ?? 0;
    const burstDamage = (level: number) => damageEvents(run(level, "burst", 6))[0]?.finalDamage ?? 0;

    expect(skillDamage(2)).toBeGreaterThan(0);
    expect(skillDamage(3)).toBeGreaterThan(skillDamage(2));
    expect(skillDamage(6)).toBe(skillDamage(3));
    expect(burstDamage(4)).toBeGreaterThan(0);
    expect(burstDamage(5)).toBeGreaterThan(burstDamage(4));
    expect(burstDamage(6)).toBe(burstDamage(5));
  });

  it("fails closed for resonance, HP-scaling damage, and shield lifecycle effects", () => {
    const character = createZhongliDefinition(6);
    expect(character.skill.instances.map((instance) => instance.id)).toEqual(["zhongli-skill-1"]);
    expect(ZHONGLI_KIT_METADATA.unsupportedMechanics).toContain("stoneSteleResonanceRequiresPillarLifecycleAndTiming");
    expect(ZHONGLI_KIT_METADATA.unsupportedMechanics).toContain("a4MaxHpBasedDamageForNormalSkillAndBurst");
    expect(ZHONGLI_KIT_METADATA.unsupportedMechanics).toContain("a1JadeShieldFortificationStacks");
  });
});
