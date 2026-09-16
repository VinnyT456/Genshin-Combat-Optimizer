import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { Rotation } from "@/types";
import { createXingqiuDefinition } from "./xingqiuDefinition";

function readyXingqiu(constellation: number): GenericCharacterDefinition {
  const definition = createXingqiuDefinition(constellation, { normal: 1, skill: 10, burst: 10 });
  return { ...definition, burst: { ...definition.burst, energyCost: 0 } };
}

function run(definition: GenericCharacterDefinition, actions: Rotation) {
  return simulateRotation([definition], actions, testEnemy);
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.damage);
}

function abilityHit(result: ReturnType<typeof simulateRotation>, abilityId: string) {
  return damageEvents(result).find((event) => event.damage?.abilityId === abilityId);
}

describe("Xingqiu runtime kit", () => {
  it("deals direct skill and burst damage as Hydro with sourced talent types", () => {
    const xingqiu = readyXingqiu(0);
    const result = run(xingqiu, [
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: xingqiu.id, actionType: "burst" },
    ]);
    const skill = abilityHit(result, "xingqiu-skill");
    const burst = abilityHit(result, "xingqiu-burst");

    expect(skill?.damage?.finalDamage).toBeGreaterThan(0);
    expect(skill?.damage).toMatchObject({ element: "hydro", damageType: "skill" });
    expect(burst?.damage?.finalDamage).toBeGreaterThan(0);
    expect(burst?.damage).toMatchObject({ element: "hydro", damageType: "burst" });
  });

  it("creates positive Hydro Burst sword-rain damage only after Raincutter and on Normal attacks", () => {
    const xingqiu = readyXingqiu(0);
    const result = run(xingqiu, [
      { characterId: xingqiu.id, actionType: "normal" },
      { characterId: xingqiu.id, actionType: "burst" },
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: xingqiu.id, actionType: "normal" },
    ]);
    const rainHits = damageEvents(result).filter(
      (event) => event.damage?.abilityId === "xingqiu-rain-sword",
    );

    expect(rainHits).toHaveLength(1);
    expect(rainHits[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(rainHits[0]?.damage).toMatchObject({ element: "hydro", damageType: "burst" });
    expect(rainHits[0]!.timestamp).toBeGreaterThanOrEqual(
      damageEvents(result).find((event) => event.damage?.abilityId === "xingqiu-burst")!.timestamp,
    );
  });

  it("applies C2 Hydro RES reduction from a sword-rain hit, and its source duration is 4 seconds", () => {
    const actions: Rotation = [
      { characterId: "xingqiu", actionType: "burst" },
      { characterId: "xingqiu", actionType: "normal" },
      { characterId: "xingqiu", actionType: "skill" },
    ];
    const c0 = run(readyXingqiu(0), actions);
    const c2 = run(readyXingqiu(2), actions);
    const c0Skill = abilityHit(c0, "xingqiu-skill")?.damage?.finalDamage ?? 0;
    const c2Skill = abilityHit(c2, "xingqiu-skill")?.damage?.finalDamage ?? 0;
    const c2Rain = abilityHit(c2, "xingqiu-rain-sword");

    expect(c2Rain?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c2Rain?.damage).toMatchObject({ element: "hydro", damageType: "burst" });
    expect(c2Skill).toBeGreaterThan(c0Skill);
    expect(readyXingqiu(2).burst.triggers?.[0]?.durationSeconds).toBe(18);
    expect(readyXingqiu(0).burst.triggers?.[0]?.durationSeconds).toBe(15);
    expect(readyXingqiu(2).burst.triggers?.[0]?.buffs?.[0]?.duration).toBe(4);
  });

  it("expires C2's Hydro RES reduction four seconds after the last sword-rain hit", () => {
    const actions: Rotation = [
      { characterId: "xingqiu", actionType: "burst" },
      { characterId: "xingqiu", actionType: "normal" },
      ...Array.from({ length: 6 }, () => ({ characterId: "xingqiu", actionType: "charged" as const })),
      { characterId: "xingqiu", actionType: "skill" },
    ];
    const c0 = abilityHit(run(readyXingqiu(0), actions), "xingqiu-skill");
    const c2 = abilityHit(run(readyXingqiu(2), actions), "xingqiu-skill");

    expect(c0?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c2?.damage?.finalDamage).toBe(c0?.damage?.finalDamage);
  });

  it("applies C4's 50% Fatal Rainscreen bonus only while Raincutter is active", () => {
    const actions: Rotation = [
      { characterId: "xingqiu", actionType: "burst" },
      { characterId: "xingqiu", actionType: "skill" },
    ];
    const c0Skill = abilityHit(run(readyXingqiu(0), actions), "xingqiu-skill");
    const c4Skill = abilityHit(run(readyXingqiu(4), actions), "xingqiu-skill");

    expect(c0Skill?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c4Skill?.damage?.finalDamage).toBeGreaterThan(c0Skill?.damage?.finalDamage ?? 0);
    expect(c4Skill?.damage).toMatchObject({ element: "hydro", damageType: "skill" });
    expect(readyXingqiu(4).burst.buffs?.[0]).toMatchObject({
      duration: 18,
      conditions: { damageTypes: ["skill"] },
      modifiers: [{ stat: "dmgBonus", value: 0.5 }],
    });
  });

  it("stops coordinated hits at the sourced burst duration", () => {
    const xingqiu = readyXingqiu(0);
    const actions: Rotation = [{ characterId: xingqiu.id, actionType: "burst" }];
    while (actions.length * 0.4 < 17) {
      actions.push({ characterId: xingqiu.id, actionType: "normal" });
    }
    const result = run(xingqiu, actions);
    const rainHits = damageEvents(result).filter(
      (event) => event.damage?.abilityId === "xingqiu-rain-sword",
    );

    expect(rainHits.length).toBeGreaterThan(0);
    expect(rainHits.every((event) => event.damage!.finalDamage > 0)).toBe(true);
    expect(rainHits.every((event) => event.damage!.element === "hydro")).toBe(true);
    expect(rainHits.every((event) => event.damage!.damageType === "burst")).toBe(true);
    expect(rainHits.every((event) => event.timestamp < 15)).toBe(true);
  });
});
