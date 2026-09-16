import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { Rotation } from "@/types";
import { createXianglingDefinition } from "./xianglingDefinition";
import { testPyro } from "@/game-data/characters/testPyro";

function rotationFor(seconds: number) {
  const actions: Rotation = [{ characterId: "xiangling", actionType: "burst" }];
  while (actions.length * 0.4 < seconds) {
    actions.push({ characterId: "xiangling", actionType: "normal" as const });
  }
  return actions;
}

function pyronadoDamage(constellation: number, seconds = 10) {
  const definition = createXianglingDefinition(constellation);
  const ready = { ...definition, burst: { ...definition.burst, energyCost: 0 } };
  const result = simulateRotation([ready], rotationFor(seconds), testEnemy);
  return result.timeline.filter(
    (event) => event.type === "damage" && event.description.includes("旋火轮接触伤害"),
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.damage);
}

describe("Xiangling Pyronado runtime kit", () => {
  it("starts a snapshotting recurring field that survives its owner continuing actions", () => {
    const xiangling = createXianglingDefinition(0);
    const result = simulateRotation(
      [{ ...xiangling, burst: { ...xiangling.burst, energyCost: 0 } }],
      rotationFor(10),
      testEnemy,
    );
    const contacts = damageEvents(result).filter(
      (event) => event.type === "damage" && event.description.includes("旋火轮接触伤害"),
    );
    expect(contacts.length).toBeGreaterThanOrEqual(5);
    expect(contacts.every((event) => event.damage!.finalDamage > 0)).toBe(true);
    expect(contacts.every((event) => event.damage!.element === "pyro")).toBe(true);
    expect(contacts.every((event) => event.damage!.damageType === "burst")).toBe(true);
    expect(contacts.every((event) => event.characterId === "xiangling")).toBe(true);
    expect(contacts.every((event) => event.timestamp >= 1.5 && event.timestamp < 10)).toBe(true);
    expect(contacts.every((event) => event.damage!.timestamp === event.timestamp)).toBe(true);
  });

  it("extends the generic field lifecycle from 10s to 14s at C4", () => {
    const c0 = createXianglingDefinition(0);
    const c4 = createXianglingDefinition(4);
    expect(c0.burst.stance?.durationSeconds).toBe(10);
    expect(c4.burst.stance?.durationSeconds).toBe(14);
    expect(c4.burst.stance?.endsOnSwap).toBe(false);
    expect(c4.burst.stance?.triggers?.[0]).toMatchObject({
      trigger: "onInterval",
      intervalSeconds: 1.5,
      snapshotMode: "cast",
      maxProcs: 9,
    });
  });

  it("raises real Burst damage with C3's sourced burst talent levels", () => {
    const getOpeningDamage = (constellation: number) => {
      const definition = createXianglingDefinition(constellation);
      const ready = { ...definition, burst: { ...definition.burst, energyCost: 0 } };
      return simulateRotation([ready], [{ characterId: "xiangling", actionType: "burst" }], testEnemy);
    };
    const c0 = damageEvents(getOpeningDamage(0)).filter(
      (event) => event.damage!.damageType === "burst" && event.timestamp === 0,
    );
    const c3 = damageEvents(getOpeningDamage(3)).filter(
      (event) => event.damage!.damageType === "burst" && event.timestamp === 0,
    );
    expect(c0).toHaveLength(3);
    expect(c3).toHaveLength(3);
    expect(c0.every((event) => event.damage!.finalDamage > 0)).toBe(true);
    expect(c0.every((event) => event.damage!.element === "pyro")).toBe(true);
    expect(c3.every((event, index) => event.damage!.finalDamage > c0[index]!.damage!.finalDamage)).toBe(true);
  });

  it("produces additional real Pyronado damage during C4's sourced duration extension", () => {
    const c0 = pyronadoDamage(0, 15);
    const c4 = pyronadoDamage(4, 15);
    const isPyroBurstDamage = (event: (typeof c0)[number]) =>
      event.damage!.finalDamage > 0 &&
      event.damage!.element === "pyro" &&
      event.damage!.damageType === "burst";
    expect(c0.every(isPyroBurstDamage)).toBe(true);
    expect(c4.every(isPyroBurstDamage)).toBe(true);
    expect(c0.every((event) => event.timestamp < 10)).toBe(true);
    expect(c4.some((event) => event.timestamp >= 10 && event.timestamp < 14)).toBe(true);
    expect(c4.length).toBeGreaterThan(c0.length);
    expect(c4.reduce((sum, event) => sum + (event.damage?.finalDamage ?? 0), 0)).toBeGreaterThan(
      c0.reduce((sum, event) => sum + (event.damage?.finalDamage ?? 0), 0),
    );
  });

  it("applies C6's Pyro bonus to an ally's actual damage during Pyronado", () => {
    const c0 = createXianglingDefinition(0);
    const c6 = createXianglingDefinition(6);
    const rotation = [
      { characterId: "xiangling", actionType: "burst" as const },
      { characterId: testPyro.id, actionType: "swap" as const },
      { characterId: testPyro.id, actionType: "skill" as const },
    ];
    const run = (definition: typeof c0) =>
      simulateRotation(
        [{ ...definition, burst: { ...definition.burst, energyCost: 0 } }, testPyro],
        rotation,
        testEnemy,
      );
    const c0Hit = damageEvents(run(c0)).find((event) => event.characterId === testPyro.id);
    const c6Hit = damageEvents(run(c6)).find((event) => event.characterId === testPyro.id);
    expect(c0Hit?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c0Hit?.damage?.element).toBe("pyro");
    expect(c0Hit?.damage?.damageType).toBe("skill");
    expect(c6Hit?.damage?.finalDamage).toBeGreaterThan(c0Hit?.damage?.finalDamage ?? 0);
    expect(c6Hit?.damage?.element).toBe("pyro");
    expect(c6Hit?.damage?.damageType).toBe("skill");
  });

  it("does not activate C1 Pyro shred from Guoba cast alone", () => {
    const c0 = createXianglingDefinition(0);
    const c1 = createXianglingDefinition(1);
    const rotation = [
      { characterId: "xiangling", actionType: "skill" as const },
      { characterId: testPyro.id, actionType: "swap" as const },
      { characterId: testPyro.id, actionType: "normal" as const },
    ];
    const run = (definition: typeof c0) =>
      simulateRotation([definition, testPyro], rotation, testEnemy).timeline.find(
        (event) => event.type === "damage" && event.characterId === testPyro.id,
      );
    expect(run(c1)?.damage?.finalDamage).toBe(run(c0)?.damage?.finalDamage);
  });
});
