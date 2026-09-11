import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { StanceDefinition } from "@/simulation/buffs/types";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";

const zeroBurstUnit: GenericCharacterDefinition = {
  ...syntheticUnit,
  burst: { ...syntheticUnit.burst, energyCost: 0 },
};

function run(config: SimulationConfig, rotation: Rotation = []) {
  return simulateRotation([zeroBurstUnit], rotation, testEnemy, config);
}

describe("artifact lifecycle state effects", () => {
  it("applies declarative stance-end buffs and carries them through resume", () => {
    const second: GenericCharacterDefinition = {
      ...zeroBurstUnit,
      id: "stance-recipient",
      name: "Stance Recipient",
    };
    const stance: StanceDefinition<NormalAttackString, KitAbility> = {
      id: "synthetic-stance",
      name: "Synthetic Stance",
      durationSeconds: 10,
      stateEndBuffs: [{
        id: "state-end-atk",
        source: "Synthetic Stance End",
        sourceCharacterId: zeroBurstUnit.id,
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "characters", characterIds: [second.id] },
        modifiers: [{ stat: "atkFlat", value: 100 }],
      }],
    };
    const entering: KitAbility = { ...zeroBurstUnit.skill, stance };
    const source = { ...zeroBurstUnit, skill: entering };
    const result = simulateRotation(
      [source, second],
      [
        { characterId: source.id, actionType: "skill" },
        { characterId: second.id, actionType: "swap" },
        { characterId: second.id, actionType: "normal" },
      ],
      testEnemy,
    );
    expect(result.finalState.runtimeBuffs).toHaveLength(1);
    expect(result.finalState.runtimeBuffs?.[0]).toMatchObject({ id: "state-end-atk" });
  });

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

  it("reduces party burst cooldowns on qualifying stance hits", () => {
    const second: GenericCharacterDefinition = {
      ...zeroBurstUnit,
      id: "cooldown-recipient",
      name: "Cooldown Recipient",
      burst: { ...zeroBurstUnit.burst, energyCost: 0 },
    };
    const stance: StanceDefinition<NormalAttackString, KitAbility> = {
      id: "hit-stance",
      name: "Hit Stance",
      durationSeconds: 10,
    };
    const source = { ...zeroBurstUnit, skill: { ...zeroBurstUnit.skill, stance } };
    const result = simulateRotation(
      [source, second],
      [
        { characterId: second.id, actionType: "burst" },
        { characterId: source.id, actionType: "skill" },
        { characterId: source.id, actionType: "normal" },
      ],
      testEnemy,
      {
        artifactStateEffects: [{
          kind: "cooldownReductionOnHit",
          sourceCharacterId: source.id,
          reductionSeconds: 1,
          cooldownSeconds: 1,
          maxTriggers: 5,
          damageTypes: ["normal"],
          requiresStanceId: stance.id,
          excludeSource: true,
        }],
      },
    );
    expect(result.finalState.characters[second.id]?.cooldowns[second.burst.id]).toBe(14);
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
