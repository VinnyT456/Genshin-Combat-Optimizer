import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createXinyanDefinition, XINYAN_KIT_METADATA } from "./xinyanDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "skill" | "burst") {
  const character = createXinyanDefinition(constellationLevel);
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation([ready], [{ characterId: character.id, actionType }], testEnemy, noCrit);
}

function hits(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event.damage] : []);
}

describe("Xinyan runtime kit", () => {
  it("deals positive physical Normal Attack damage", () => {
    const result = run(0, "normal");
    expect(result.errors).toEqual([]);
    expect(hits(result)[0]).toMatchObject({ abilityId: "xinyan-na-1", element: "physical", damageType: "normal" });
    expect(hits(result)[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("models only the sourced direct Pyro Skill swing, not un-timed DoT", () => {
    const result = run(0, "skill");
    expect(result.errors).toEqual([]);
    expect(hits(result)).toHaveLength(1);
    expect(hits(result)[0]).toMatchObject({ abilityId: "xinyan-skill", element: "pyro", damageType: "skill" });
    expect(hits(result)[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("deals positive sourced Pyro Burst damage", () => {
    const result = run(0, "burst");
    expect(result.errors).toEqual([]);
    expect(hits(result)).toHaveLength(1);
    expect(hits(result)[0]).toMatchObject({ abilityId: "xinyan-burst", element: "pyro", damageType: "burst" });
    expect(hits(result)[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("gates C3 Skill and C5 Burst talent boosts at their exact constellation thresholds", () => {
    const c0Skill = hits(run(0, "skill"))[0]?.finalDamage ?? 0;
    const c2Skill = hits(run(2, "skill"))[0]?.finalDamage ?? 0;
    const c3Skill = hits(run(3, "skill"))[0]?.finalDamage ?? 0;
    const c0Burst = hits(run(0, "burst"))[0]?.finalDamage ?? 0;
    const c4Burst = hits(run(4, "burst"))[0]?.finalDamage ?? 0;
    const c5Burst = hits(run(5, "burst"))[0]?.finalDamage ?? 0;

    expect(c2Skill).toBe(c0Skill);
    expect(c3Skill).toBeGreaterThan(c2Skill);
    expect(c4Burst).toBe(c0Burst);
    expect(c5Burst).toBeGreaterThan(c4Burst);
  });

  it("keeps effects requiring absent shield, hit-count, or conditional state explicitly fail-closed", () => {
    const character = createXinyanDefinition(6);
    expect(character.skill.instances.map((instance) => instance.id)).toEqual(["xinyan-skill-1"]);
    expect(character.burst.instances.map((instance) => instance.id)).toEqual(["xinyan-burst-1"]);
    expect(XINYAN_KIT_METADATA.unsupportedChannels).toContain("skillShieldAndHitCountDependentShieldLevel");
    expect(XINYAN_KIT_METADATA.unsupportedChannels).toContain("burstPhysicalDamageMissingFromVerifiedGeneratedRows");
    expect(XINYAN_KIT_METADATA.unsupportedChannels).toContain("c2PhysicalBurstGuaranteedCriticalAndLevelThreeShield");
  });
});
