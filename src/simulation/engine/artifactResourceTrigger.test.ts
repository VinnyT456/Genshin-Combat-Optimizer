import { describe, expect, it } from "vitest";
import type { SimulationConfig } from "@/types";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { simulateRotation } from "@/simulation/engine/simulateRotation";

const enemy = { id: "resource-enemy", name: "Dummy", level: 90, resistances: {} };

describe("artifact resource trigger seam", () => {
  it("creates a timed source resource on skill cast and carries it through resume", () => {
    const config: SimulationConfig = {
      artifactStateEffects: [{
        kind: "resourceOnTrigger",
        sourceCharacterId: syntheticUnit.id,
        resourceId: "martial-artist",
        trigger: "skillCast",
        value: 1,
        durationSeconds: 8,
        cooldownSeconds: 2,
        maxStacks: 2,
        stackMode: "add",
      }],
    };
    const first = simulateRotation([syntheticUnit], [{ characterId: syntheticUnit.id, actionType: "skill" }], enemy, config);
    expect(first.finalState.characters[syntheticUnit.id]?.resources?.["martial-artist"]?.value).toBe(1);
    expect(first.timeline.some((event) => event.type === "resource")).toBe(true);

    const resumed = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "normal" }],
      enemy,
      { ...config, resumeFrom: first.finalState },
    );
    expect(resumed.finalState.characters[syntheticUnit.id]?.resources?.["martial-artist"]?.value).toBe(1);
  });

  it("requires and consumes the optional skill energy gate", () => {
    const effect = {
      kind: "resourceOnTrigger" as const,
      sourceCharacterId: syntheticUnit.id,
      resourceId: "shimenawa",
      trigger: "skillCast" as const,
      value: 1,
      durationSeconds: 10,
      cooldownSeconds: 0,
      maxStacks: 1,
      stackMode: "refresh" as const,
      consumeEnergy: 15,
    };
    const base = simulateRotation([syntheticUnit], [], enemy, { artifactStateEffects: [effect] });
    const insufficient = simulateRotation([syntheticUnit], [{ characterId: syntheticUnit.id, actionType: "skill" }], enemy, { artifactStateEffects: [effect] });
    expect(insufficient.finalState.characters[syntheticUnit.id]?.resources?.shimenawa).toBeUndefined();
    const seeded = {
      ...base.finalState,
      characters: {
        ...base.finalState.characters,
        [syntheticUnit.id]: {
          ...base.finalState.characters[syntheticUnit.id]!,
          energy: { ...base.finalState.characters[syntheticUnit.id]!.energy, current: 20 },
          cooldowns: {},
        },
      },
    };
    const sufficient = simulateRotation([syntheticUnit], [{ characterId: syntheticUnit.id, actionType: "skill" }], enemy, { artifactStateEffects: [effect], resumeFrom: seeded });
    expect(sufficient.finalState.characters[syntheticUnit.id]?.resources?.shimenawa?.value).toBe(1);
    expect(sufficient.finalState.characters[syntheticUnit.id]?.energy.current).toBeGreaterThanOrEqual(0);
    expect(sufficient.timeline.some((event) => event.type === "energy" && event.description.includes("consumes 15"))).toBe(true);
  });

  it("supports damage-type-specific deterministic gains for hit-triggered stacks", () => {
    const effect = {
      kind: "resourceOnTrigger" as const,
      sourceCharacterId: syntheticUnit.id,
      resourceId: "radiance",
      trigger: "damageDealt" as const,
      value: 0,
      valuesByDamageType: { normal: 2 },
      damageTypes: ["normal"] as const,
      durationSeconds: 6,
      cooldownSeconds: 0,
      maxStacks: 5,
      stackMode: "add" as const,
    };
    const result = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "normal" }],
      enemy,
      { artifactStateEffects: [effect] },
    );
    expect(result.finalState.characters[syntheticUnit.id]?.resources?.radiance?.value).toBe(4);
    expect(result.timeline.some((event) => event.type === "resource" && event.resource?.amount === 2)).toBe(true);
  });

  it("activates resource-event stacks only for the declared event id", () => {
    const effect = {
      kind: "resourceOnTrigger" as const,
      sourceCharacterId: syntheticUnit.id,
      resourceId: "bond-stacks",
      trigger: "resourceEvent" as const,
      eventResourceId: "bondOfLife",
      value: 1,
      durationSeconds: 6,
      cooldownSeconds: 0,
      maxStacks: 3,
      stackMode: "add" as const,
    };
    const result = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "normal" }],
      enemy,
      {
        artifactStateEffects: [effect],
        resourceEvents: [
          { timestamp: 0, sourceCharacterId: syntheticUnit.id, resourceId: "unrelated", kind: "gain", amount: 1 },
          { timestamp: 0, sourceCharacterId: syntheticUnit.id, resourceId: "bondOfLife", kind: "gain", amount: 1 },
        ],
      },
    );
    expect(result.finalState.characters[syntheticUnit.id]?.resources?.["bond-stacks"]?.value).toBe(1);
    expect(result.timeline.filter((event) => event.type === "resource" && event.resource?.resourceId === "bond-stacks")).toHaveLength(1);
  });

  it("applies element gates to hit-triggered stacks", () => {
    const effect = {
      kind: "resourceOnTrigger" as const,
      sourceCharacterId: syntheticUnit.id,
      resourceId: "geo-stacks",
      trigger: "damageDealt" as const,
      value: 1,
      durationSeconds: 6,
      cooldownSeconds: 0,
      maxStacks: 2,
      stackMode: "add" as const,
      elements: ["geo"] as const,
    };
    const result = simulateRotation(
      [syntheticUnit],
      [{ characterId: syntheticUnit.id, actionType: "normal" }],
      enemy,
      { artifactStateEffects: [effect] },
    );
    expect(result.finalState.characters[syntheticUnit.id]?.resources?.["geo-stacks"]).toBeUndefined();
  });

  it("routes incoming damage to the target's damageTaken and hpDecrease events", () => {
    const result = simulateRotation(
      [syntheticUnit],
      [],
      enemy,
      {
        artifactStateEffects: [
          {
            kind: "resourceOnTrigger",
            sourceCharacterId: syntheticUnit.id,
            resourceId: "damage-stacks",
            trigger: "resourceEvent",
            eventResourceId: "damageTaken",
            value: 1,
            durationSeconds: 5,
            cooldownSeconds: 0,
            maxStacks: 1,
            stackMode: "refresh",
          },
          {
            kind: "resourceOnTrigger",
            sourceCharacterId: syntheticUnit.id,
            resourceId: "hp-loss-stacks",
            trigger: "resourceEvent",
            eventResourceId: "hpDecrease",
            value: 1,
            durationSeconds: 5,
            cooldownSeconds: 0,
            maxStacks: 1,
            stackMode: "refresh",
          },
        ],
        resourceEvents: [{
          timestamp: 0,
          sourceCharacterId: "enemy",
          targetCharacterId: syntheticUnit.id,
          resourceId: "damageTaken",
          kind: "gain",
          amount: 100,
        }],
      },
    );
    const state = result.finalState.characters[syntheticUnit.id];
    expect(state?.resources?.["damage-stacks"]?.value).toBe(1);
    expect(state?.resources?.["hp-loss-stacks"]?.value).toBe(1);
    expect(state?.currentHp).toBeLessThan(state?.maxHp ?? Infinity);
  });

  it("routes incoming damage to Marechaussee's generic hpChange event", () => {
    const result = simulateRotation(
      [syntheticUnit],
      [],
      enemy,
      {
        artifactStateEffects: [{
          kind: "resourceOnTrigger",
          sourceCharacterId: syntheticUnit.id,
          resourceId: "marechaussee",
          trigger: "resourceEvent",
          eventResourceId: "hpChange",
          value: 1,
          durationSeconds: 5,
          cooldownSeconds: 0,
          maxStacks: 3,
          stackMode: "add",
        }],
        resourceEvents: [{
          timestamp: 0,
          sourceCharacterId: "enemy",
          targetCharacterId: syntheticUnit.id,
          resourceId: "damageTaken",
          kind: "gain",
          amount: 100,
        }],
      },
    );
    expect(result.finalState.characters[syntheticUnit.id]?.resources?.marechaussee?.value).toBe(1);
  });
});
