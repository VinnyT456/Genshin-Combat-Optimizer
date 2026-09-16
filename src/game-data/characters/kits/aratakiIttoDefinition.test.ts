import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { ARATAKI_ITTO_KIT_METADATA, createAratakiIttoDefinition } from "./aratakiIttoDefinition";

const rotation = (actions: Array<"burst" | "skill" | "charged" | "normal">) =>
  actions.map((actionType) => ({ characterId: "arataki-itto", actionType }));

describe("Arataki Itto runtime kit", () => {
  it("enters an 11-second Geo stance with sourced DEF-to-ATK conversion", () => {
    const itto = createAratakiIttoDefinition(0, { normal: 10, skill: 10, burst: 10 });
    expect(itto.burst.instances).toHaveLength(0);
    expect(itto.burst.stance).toMatchObject({
      durationSeconds: ARATAKI_ITTO_KIT_METADATA.burstDurationSeconds,
      infusion: { element: "geo", canBeOverridden: false },
      conversions: [{ sourceStat: "def", targetStat: "atkFlat", ratio: 1.037 }],
    });
  });

  it("deals Geo normal damage during the burst stance", () => {
    const source = createAratakiIttoDefinition(0);
    const itto = { ...source, burst: { ...source.burst, energyCost: 0 } };
    const result = simulateRotation([itto, testPyro], rotation(["burst", "normal"]), testEnemy);
    const hits = result.timeline.filter((event) => event.type === "damage");

    expect(hits).toHaveLength(1);
    expect(hits[0]?.damage?.element).toBe("geo");
    expect(hits[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("applies the sourced Bloodline DEF scaling and C6 charged Crit DMG", () => {
    const c0Source = createAratakiIttoDefinition(0);
    const c6Source = createAratakiIttoDefinition(6);
    const c0 = { ...c0Source, burst: { ...c0Source.burst, energyCost: 0 } };
    const c6 = { ...c6Source, burst: { ...c6Source.burst, energyCost: 0 } };
    const c0Result = simulateRotation([c0, testPyro], rotation(["burst", "charged"]), testEnemy);
    const c6Result = simulateRotation([c6, testPyro], rotation(["burst", "charged"]), testEnemy);

    expect(c0.chargedAttack?.instances[0]?.scaling).toEqual([
      expect.objectContaining({ stat: "atk" }),
      expect.objectContaining({ stat: "def", table: expect.objectContaining({ values: expect.arrayContaining([0.35]) }) }),
    ]);
    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
  });

  it("gains Superlative Superstrength from skill and C1 burst", () => {
    const c0 = createAratakiIttoDefinition(0);
    const source = createAratakiIttoDefinition(1);
    const c1 = { ...source, burst: { ...source.burst, energyCost: 0 } };
    const c0Result = simulateRotation([c0, testPyro], rotation(["skill"]), testEnemy);
    const c1Result = simulateRotation([c1, testPyro], rotation(["burst"]), testEnemy);

    expect(c0Result.finalState.characters["arataki-itto"]?.resources?.[ARATAKI_ITTO_KIT_METADATA.stackResourceId]?.value).toBe(1);
    expect(c1Result.finalState.characters["arataki-itto"]?.resources?.[ARATAKI_ITTO_KIT_METADATA.stackResourceId]?.value).toBe(2);
  });
});
