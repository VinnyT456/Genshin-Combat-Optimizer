import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { testEnemy } from "@/game-data/enemies/testEnemy";

const zeroBurstUnit: GenericCharacterDefinition = {
  ...syntheticUnit,
  burst: { ...syntheticUnit.burst, energyCost: 0 },
};

function run(config: SimulationConfig, rotation: Rotation = []) {
  return simulateRotation([zeroBurstUnit], rotation, testEnemy, config);
}

describe("artifact lifecycle state effects", () => {
  it("applies pickup healing as a deterministic timeline event", () => {
    const result = run({
      pickupEvents: [{ timestamp: 0, sourceCharacterId: zeroBurstUnit.id, kind: "mora" }],
      artifactStateEffects: [{
        kind: "healOnPickup",
        sourceCharacterId: zeroBurstUnit.id,
        pickupKind: "mora",
        amount: 300,
      }],
    });
    expect(result.timeline.some((event) => event.type === "pickup")).toBe(true);
    expect(result.timeline.find((event) => event.type === "healing")?.healing?.amount).toBe(0);
  });

  it("converts Nightsoul Burst resource events into energy", () => {
    const result = run({
      resourceEvents: [{
        timestamp: 0,
        sourceCharacterId: zeroBurstUnit.id,
        resourceId: "nightsoul",
        kind: "triggerStart",
      }],
      artifactStateEffects: [{
        kind: "energyOnNightsoulBurst",
        sourceCharacterId: zeroBurstUnit.id,
        amount: 6,
      }],
    });
    expect(result.finalState.characters[zeroBurstUnit.id]?.energy.current).toBe(6);
  });

  it("resets skill cooldown once when damage defeats enemy", () => {
    const result = simulateRotation(
      [zeroBurstUnit],
      [{ characterId: zeroBurstUnit.id, actionType: "skill" }],
      { ...testEnemy, maxHp: 1, currentHp: 1 },
      {
        artifactStateEffects: [{
          kind: "cooldownResetOnDefeat",
          sourceCharacterId: zeroBurstUnit.id,
          cooldownSeconds: 15,
          abilityTypes: ["skill"],
        }],
      },
    );
    expect(result.finalState.characters[zeroBurstUnit.id]?.cooldowns).toEqual({});
  });

  it("applies burst healing and schedules Exile energy ticks", () => {
    const second: GenericCharacterDefinition = {
      ...zeroBurstUnit,
      id: "synthetic-second",
      name: "Synthetic Second",
    };
    const result = simulateRotation(
      [zeroBurstUnit, second],
      [
        { characterId: zeroBurstUnit.id, actionType: "burst" },
        { characterId: zeroBurstUnit.id, actionType: "normal" },
      ],
      testEnemy,
      {
        artifactStateEffects: [
          { kind: "healOnBurst", sourceCharacterId: zeroBurstUnit.id, maxHpFraction: 0.2 },
          {
            kind: "partyEnergyOverTimeAfterBurst",
            sourceCharacterId: zeroBurstUnit.id,
            amount: 2,
            intervalSeconds: 2,
            durationSeconds: 6,
            excludeSource: true,
          },
        ],
      },
    );
    expect(result.timeline.some((event) => event.type === "healing")).toBe(true);
    expect(result.finalState.characters[second.id]?.energy.current).toBe(2);
  });

  it("grants Scholar-style energy once per particle cooldown", () => {
    const result = run({
      artifactStateEffects: [{
        kind: "energyOnParticlePickup",
        sourceCharacterId: zeroBurstUnit.id,
        amount: 3,
        cooldownSeconds: 3,
        targetWeaponTypes: ["catalyst"],
      }],
    }, [{ characterId: zeroBurstUnit.id, actionType: "skill" }]);
    expect(result.timeline.some((event) => event.description.includes("artifact particle effect"))).toBe(true);
  });
});
