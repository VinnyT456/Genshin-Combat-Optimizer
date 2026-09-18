import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { testPyro } from "@/game-data/characters/testPyro";
import { simulateRotation } from "@/simulation/engine";
import { createYelanDefinition, YELAN_KIT_METADATA } from "./yelanDefinition";

const noCrit = { critMode: "never" as const };

function readyYelan(constellationLevel: number) {
  const definition = createYelanDefinition(constellationLevel, { normal: 1, skill: 1, burst: 1 });
  return { ...definition, burst: { ...definition.burst, energyCost: 0 } };
}

function run(constellationLevel: number, actionTypes: readonly ("normal" | "skill" | "burst")[]) {
  const yelan = readyYelan(constellationLevel);
  return simulateRotation(
    [yelan],
    actionTypes.map((actionType) => ({ characterId: yelan.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof run>) {
  return result.timeline.flatMap((event) => event.type === "damage" && event.damage ? [event] : []);
}

describe("Yelan runtime kit", () => {
  it("deals positive sourced Hydro Skill damage", () => {
    const hit = damageEvents(run(0, ["skill"]))[0];
    expect(hit?.damage).toMatchObject({ element: "hydro", damageType: "skill" });
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("deals the opening Burst hit and three sourced coordinated hits on a normal attack", () => {
    const result = run(0, ["burst", "normal"]);
    const hits = damageEvents(result);
    const coordinated = hits.filter((event) => event.damage?.abilityId === "yelan-exquisite-throw-coordinated");
    expect(hits).toHaveLength(5); // one normal hit, Burst opening hit, and three coordinated arrows
    expect(coordinated).toHaveLength(3);
    expect(coordinated.every((event) => event.damage?.finalDamage && event.damage.finalDamage > 0)).toBe(true);
    expect(coordinated.every((event) => event.damage?.element === "hydro" && event.damage.damageType === "burst")).toBe(true);
  });

  it("keeps the Burst energy gate and does not trigger coordinated hits before the Burst", () => {
    const yelan = createYelanDefinition(0);
    const result = simulateRotation([yelan], [{ characterId: yelan.id, actionType: "normal" }], testEnemy, noCrit);
    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "yelan-exquisite-throw-coordinated")).toBe(false);
    expect(createYelanDefinition(0).burst.energyCost).toBe(70);
  });

  it("triggers the sourced coordinated attack when another active character attacks", () => {
    const yelan = readyYelan(0);
    const result = simulateRotation(
      [yelan, testPyro],
      [
        { characterId: yelan.id, actionType: "burst" },
        { characterId: testPyro.id, actionType: "swap" },
        { characterId: testPyro.id, actionType: "normal" },
      ],
      testEnemy,
      noCrit,
    );
    const coordinated = damageEvents(result).filter(
      (event) => event.damage?.abilityId === "yelan-exquisite-throw-coordinated",
    );
    expect(coordinated).toHaveLength(3);
    expect(coordinated.every((event) => event.characterId === yelan.id)).toBe(true);
    expect(coordinated.every((event) => event.timestamp >= 1.5 && event.timestamp < 16.5)).toBe(true);
    expect(coordinated.every((event) => event.damage?.finalDamage && event.damage.finalDamage > 0)).toBe(true);
    expect(coordinated.every((event) => event.damage?.element === "hydro" && event.damage.damageType === "burst")).toBe(true);
  });

  it("applies the sourced Burst +3 exactly at C3", () => {
    const burstDamage = (level: number) => damageEvents(run(level, ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c2 = createYelanDefinition(2);
    const c3 = createYelanDefinition(3);
    const c2BurstBoosts = c2.constellations.filter((row) => row.level <= 2).flatMap((row) => row.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? []).filter((modifier) => modifier.slot === "burst");
    const c3BurstBoosts = c3.constellations.filter((row) => row.level <= 3).flatMap((row) => row.buffs ?? [])
      .flatMap((buff) => buff.talentLevelModifiers ?? []).filter((modifier) => modifier.slot === "burst");
    expect(c2BurstBoosts).toEqual([]);
    expect(c3BurstBoosts).toEqual([{ slot: "burst", levels: 3 }]);
    expect(burstDamage(3)).toBeGreaterThan(burstDamage(2));
  });

  it("fails closed for unrepresented proc routes and lists unsupported mechanics", () => {
    const result = run(6, ["burst", "skill"]);
    const coordinated = damageEvents(result).filter((event) => event.damage?.abilityId === "yelan-exquisite-throw-coordinated");
    expect(coordinated).toHaveLength(3);
    expect(YELAN_KIT_METADATA.supportedChannels).toContain("c2ExtraWaterArrow");
    expect(YELAN_KIT_METADATA.supportedChannels).toContain("c6FiveBreakthroughBarbs");
  });

  it("adds one C2 water arrow on its independent 1.8s cooldown", () => {
    const hits = damageEvents(run(2, ["burst", "normal"]));
    expect(hits.filter((event) => event.damage?.abilityId === "yelan-c2-water-arrow")).toHaveLength(1);
  });

  it("adds one C4 marked-enemy HP stack after Lifeline resolves", () => {
    const c0 = damageEvents(run(0, ["skill", "burst"]));
    const c4Result = run(4, ["skill", "burst"]);
    const c4 = damageEvents(c4Result);
    expect(c4Result.finalState.characters.yelan?.resources?.["yelan-c4-marked-enemies"]?.value).toBe(1);
    expect(c4.find((event) => event.damage?.abilityId === "yelan-burst")?.damage?.finalDamage)
      .toBeGreaterThan(c0.find((event) => event.damage?.abilityId === "yelan-burst")?.damage?.finalDamage ?? 0);
  });

  it("refreshes party Max HP after a C4 mark is gained", () => {
    const yelan = readyYelan(4);
    const result = simulateRotation(
      [yelan, testPyro],
      [{ characterId: yelan.id, actionType: "skill" }],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(result.finalState.characters.yelan?.maxHp ?? 0).toBeGreaterThan(yelan.baseStats.hp);
    expect(result.finalState.characters[testPyro.id]?.maxHp ?? 0).toBeGreaterThan(testPyro.baseStats.hp);
  });

  it("replaces five C6 normals with Charged Attack Breakthrough Barbs", () => {
    const result = run(6, ["burst", "normal", "normal", "normal", "normal", "normal"]);
    const barbs = damageEvents(result).filter((event) => event.damage?.abilityId === "yelan-c6-breakthrough-barb");
    expect(barbs).toHaveLength(5);
    expect(barbs.every((event) => event.damage?.damageType === "charged" && event.damage.element === "hydro")).toBe(true);
    expect(result.finalState.characters.yelan?.resources?.["yelan-mastermind-arrows"]?.value).toBe(0);
  });

  it("ramps Adapt With Ease from 1% by 3.5% per second", () => {
    const yelan = readyYelan(0);
    const result = simulateRotation(
      [yelan],
      [
        { characterId: yelan.id, actionType: "burst" },
        ...Array.from({ length: 35 }, () => ({ characterId: yelan.id, actionType: "normal" as const })),
      ],
      testEnemy,
      { ...noCrit, timeLimit: 15 },
    );
    expect(result.finalState.characters.yelan?.resources?.["yelan-adapt-with-ease"]?.value).toBe(50);
  });
});
