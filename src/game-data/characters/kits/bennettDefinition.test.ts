import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createBennettDefinition } from "./bennettDefinition";

describe("Bennett Fantastic Voyage runtime field", () => {
  it("uses Bennett's Base ATK for the party bonus", () => {
    const bennett = createBennettDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const ready = { ...bennett, burst: { ...bennett.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready, testPyro],
      [
        { characterId: ready.id, actionType: "burst" },
        { characterId: testPyro.id, actionType: "swap" },
        { characterId: testPyro.id, actionType: "normal" },
      ],
      testEnemy,
    );
    const hit = result.timeline.find(
      (event) => event.type === "damage" && event.characterId === testPyro.id,
    );
    // Bennett's generated level-90 Base ATK is 191 and the level-1 field is
    // 56%, so the target receives 106.96 flat ATK. If this were incorrectly
    // treated as recipient ATK%, the 1800-ATK target would receive 1008 ATK.
    expect(hit?.damage?.rawDamage).toBeCloseTo(0.85 * (1800 + 191 * 0.56), 8);
  });

  it("gates C0 ATK bonus below 70% target HP while C1 remains active", () => {
    const bennett = createBennettDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const ready = { ...bennett, burst: { ...bennett.burst, energyCost: 0 } };
    const rotation = [
      { characterId: ready.id, actionType: "burst" as const },
      { characterId: testPyro.id, actionType: "swap" as const },
      { characterId: testPyro.id, actionType: "normal" as const },
    ];
    const lowHpEvent = {
      timestamp: 1.5,
      sourceCharacterId: testPyro.id,
      targetCharacterId: testPyro.id,
      resourceId: "damageTaken" as const,
      kind: "gain" as const,
      amount: testPyro.baseStats.hp * 0.4,
    };
    const c0 = simulateRotation([ready, testPyro], rotation, testEnemy, {
      resourceEvents: [lowHpEvent],
    });
    const c1Definition = createBennettDefinition(1, { normal: 1, skill: 1, burst: 1 });
    const c1Ready = { ...c1Definition, burst: { ...c1Definition.burst, energyCost: 0 } };
    const c1 = simulateRotation(
      [c1Ready, testPyro],
      rotation,
      testEnemy,
      { resourceEvents: [lowHpEvent] },
    );
    const c0Hit = c0.timeline.find((event) => event.type === "damage" && event.characterId === testPyro.id);
    const c1Hit = c1.timeline.find((event) => event.type === "damage" && event.characterId === testPyro.id);
    expect(c1Hit?.damage?.finalDamage).toBeGreaterThan(c0Hit?.damage?.finalDamage ?? 0);
  });
});
