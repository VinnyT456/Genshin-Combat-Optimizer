import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createYaeMikoDefinition, YAE_MIKO_KIT_METADATA } from "./yaeMikoDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "skill" | "burst", talentLevel = 10) {
  const base = createYaeMikoDefinition(constellationLevel, {
    normal: 1,
    skill: talentLevel,
    burst: talentLevel,
  });
  const character = {
    ...base,
    // Isolate sourced Burst damage without supplying a combat energy scenario.
    burst: { ...base.burst, energyCost: 0 },
  };
  return simulateRotation([character], [{ characterId: character.id, actionType }], testEnemy, noCrit);
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event.damage] : []);
}

describe("Yae Miko runtime kit", () => {
  it("deals positive sourced Electro Normal Attack damage", () => {
    const result = run(0, "normal");
    const hit = damageEvents(result)[0];

    expect(result.errors).toEqual([]);
    expect(hit).toMatchObject({ element: "electro", damageType: "normal" });
    expect(hit?.finalDamage).toBeGreaterThan(0);
  });

  it("executes only the unconditional sourced Electro Burst slash", () => {
    const result = run(0, "burst");
    const hits = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ abilityId: "yae-miko-burst", element: "electro", damageType: "burst" });
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("applies only the sourced C5 Burst talent boost at C5, not C4", () => {
    const burstDamage = (constellationLevel: number) => damageEvents(run(constellationLevel, "burst", 1))[0]?.finalDamage ?? 0;
    const c4 = createYaeMikoDefinition(4);
    const c5 = createYaeMikoDefinition(5);
    const c4BurstBoosts = c4.constellations
      .filter((constellation) => constellation.level <= c4.constellationLevel)
      .flatMap((constellation) => constellation.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? [])
      .filter((modifier) => modifier.slot === "burst");
    const c5BurstBoosts = c5.constellations
      .filter((constellation) => constellation.level <= c5.constellationLevel)
      .flatMap((constellation) => constellation.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? [])
      .filter((modifier) => modifier.slot === "burst");

    expect(c4BurstBoosts).toEqual([]);
    expect(c5BurstBoosts).toEqual([{ slot: "burst", levels: 3 }]);
    expect(burstDamage(5)).toBeGreaterThan(burstDamage(4));
  });

  it("fails closed for Sakura interval damage and documents unsupported stateful mechanics", () => {
    const character = createYaeMikoDefinition(6);
    const placement = run(6, "skill");

    expect(character.skill.instances).toEqual([]);
    expect(damageEvents(placement)).toEqual([]);
    expect(character.burst.instances).toHaveLength(1);
    expect(YAE_MIKO_KIT_METADATA.unsupportedChannels).toContain("skillSesshouSakuraPlacementCountAndIntervalDamage");
    expect(YAE_MIKO_KIT_METADATA.unsupportedChannels).toContain("burstTenkoThunderboltCountFromDestroyedSakura");
    expect(YAE_MIKO_KIT_METADATA.unsupportedChannels).toContain("c6SakuraDefenseIgnore");
  });
});
