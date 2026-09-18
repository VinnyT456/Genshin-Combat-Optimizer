import { describe, expect, it } from "vitest";
import type { EnemyState, Rotation } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { flatTalent } from "@/simulation/character/talent";
import {
  syntheticBurst,
  syntheticSkill,
  syntheticUnit,
} from "@/simulation/character/fixtures";

const enemy: EnemyState = {
  id: "usage-target",
  name: "Usage Target",
  level: 90,
  resistances: {
    physical: 0.1,
    pyro: 0.1,
    hydro: 0.1,
    electro: 0.1,
    cryo: 0.1,
    anemo: 0.1,
    geo: 0.1,
    dendro: 0.1,
  },
};

describe("ability usage/resource state", () => {
  it("allows multiple charges before each charge independently recharges", () => {
    const unit = {
      ...syntheticUnit,
      id: "charged-unit",
      skill: {
        ...syntheticSkill,
        id: "charged-skill",
        cooldown: flatTalent(5),
        charges: { maxCharges: 2 },
        effects: [],
      },
    };
    const rotation: Rotation = [
      { characterId: unit.id, actionType: "skill" },
      { characterId: unit.id, actionType: "skill" },
      { characterId: unit.id, actionType: "skill" },
    ];

    const result = simulateRotation([unit], rotation, enemy);
    expect(result.errors).toHaveLength(0);
    expect(result.structuredWarnings).toContainEqual(
      expect.objectContaining({
        actionIndex: 2,
        code: "on-cooldown",
      }),
    );
    expect(result.finalState.characters[unit.id]?.abilityCharges).toEqual({
      [unit.skill.id]: {
        current: 0,
        max: 2,
        rechargeAt: [5, 6],
      },
    });
  });

  it("validates and consumes an alternate resource without touching ordinary energy", () => {
    const unit = {
      ...syntheticUnit,
      id: "resource-unit",
      maxEnergy: 0,
      burst: {
        ...syntheticBurst,
        id: "resource-burst",
        energyCost: 0,
        cooldown: flatTalent(5),
        cost: {
          resources: [
            { resourceId: "resource-pool", amount: 50, consume: "all" as const },
          ],
        },
      },
      resources: [
        { id: "resource-pool", name: "Resource Pool", initial: 60, max: 100 },
      ],
    };

    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "burst" }],
      enemy,
    );
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.finalState.characters[unit.id]?.energy.current).toBe(0);
    expect(result.finalState.characters[unit.id]?.resources?.["resource-pool"]?.value).toBe(0);
    expect(result.timeline).toContainEqual(
      expect.objectContaining({
        type: "resource",
        resource: expect.objectContaining({
          resourceId: "resource-pool",
          kind: "consume",
          amount: 60,
        }),
      }),
    );
  });

  it("rejects an alternate burst when the minimum resource is not met", () => {
    const unit = {
      ...syntheticUnit,
      id: "poor-resource-unit",
      maxEnergy: 0,
      burst: {
        ...syntheticBurst,
        id: "poor-resource-burst",
        energyCost: 0,
        cost: {
          resources: [
            { resourceId: "resource-pool", amount: 50, consume: "all" as const },
          ],
        },
      },
      resources: [
        { id: "resource-pool", name: "Resource Pool", initial: 40, max: 100 },
      ],
    };

    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "burst" }],
      enemy,
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.structuredWarnings[0]?.code).toBe("insufficient-resource");
    expect(result.timeline.some((event) => event.type === "damage")).toBe(false);
  });
});

