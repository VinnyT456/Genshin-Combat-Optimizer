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

  it("applies Rekindle's 20% skill cooldown reduction only after ascension 1", () => {
    const unlocked = createBennettDefinition(0, undefined, { ascensionPhase: 1 });
    const locked = createBennettDefinition(0, undefined, { ascensionPhase: 0 });
    expect(unlocked.skill.cooldown.values[0]).toBeCloseTo(4, 8);
    expect(locked.skill.cooldown.values[0]).toBeCloseTo(5, 8);
  });

  it("applies C2's 30% ER bonus when Bennett starts below 70% HP", () => {
    const c0 = createBennettDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c2 = createBennettDefinition(2, { normal: 1, skill: 1, burst: 1 });
    const lowHp = {
      timestamp: 0,
      sourceCharacterId: "bennett",
      targetCharacterId: "bennett",
      resourceId: "damageTaken" as const,
      kind: "gain" as const,
      amount: c0.baseStats.hp * 0.4,
    };
    const c0Result = simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy, {
      resourceEvents: [lowHp],
    });
    const c2Result = simulateRotation([c2], [{ characterId: c2.id, actionType: "skill" }], testEnemy, {
      resourceEvents: [lowHp],
    });
    expect(c2Result.finalState?.characters[c2.id]?.energy.current).toBeGreaterThan(
      c0Result.finalState?.characters[c0.id]?.energy.current ?? 0,
    );
  });

  it("raises Passion Overload damage through C3's sourced skill talent boost", () => {
    const c0 = createBennettDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const c3 = createBennettDefinition(3, { normal: 1, skill: 10, burst: 1 });
    const rotation = [{ characterId: c0.id, actionType: "skill" as const }];
    const c0Hit = simulateRotation([c0], rotation, testEnemy).timeline.find((e) => e.type === "damage");
    const c3Hit = simulateRotation([c3], [{ characterId: c3.id, actionType: "skill" }], testEnemy)
      .timeline.find((e) => e.type === "damage");
    expect(c3Hit?.damage?.finalDamage).toBeGreaterThan(c0Hit?.damage?.finalDamage ?? 0);
  });

  it("raises Fantastic Voyage damage through C5's sourced burst talent boost", () => {
    const c0 = createBennettDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c5 = createBennettDefinition(5, { normal: 1, skill: 1, burst: 10 });
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c5Ready = { ...c5, burst: { ...c5.burst, energyCost: 0 } };
    const c0Hit = simulateRotation([c0Ready], [{ characterId: c0.id, actionType: "burst" }], testEnemy)
      .timeline.find((e) => e.type === "damage");
    const c5Hit = simulateRotation([c5Ready], [{ characterId: c5.id, actionType: "burst" }], testEnemy)
      .timeline.find((e) => e.type === "damage");
    expect(c5Hit?.damage?.finalDamage).toBeGreaterThan(c0Hit?.damage?.finalDamage ?? 0);
  });

  it("applies C6's Pyro field bonus to Bennett's sword damage", () => {
    const c0 = createBennettDefinition(1, { normal: 1, skill: 1, burst: 1 });
    const c6 = createBennettDefinition(6, { normal: 1, skill: 1, burst: 1 });
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c6Ready = { ...c6, burst: { ...c6.burst, energyCost: 0 } };
    const c0Result = simulateRotation([c0Ready], [{ characterId: c0.id, actionType: "burst" }], testEnemy);
    const c6Result = simulateRotation([c6Ready], [{ characterId: c6.id, actionType: "burst" }], testEnemy);
    const c0Hit = c0Result.timeline.find((e) => e.type === "damage");
    const c6Hit = c6Result.timeline.find((e) => e.type === "damage");
    expect(c6Hit?.damage?.finalDamage).toBeGreaterThan(c0Hit?.damage?.finalDamage ?? 0);
  });
});
