import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import {
  RAIDEN_SHOGUN_KIT_METADATA,
  createRaidenShogunDefinition,
  raidenArtifactStateEffects,
} from "./raidenShogunDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(constellationLevel = 0, energyRecharge?: number) {
  const base = createRaidenShogunDefinition(constellationLevel);
  const character = energyRecharge === undefined
    ? base
    : { ...base, baseStats: { ...base.baseStats, energyRecharge } };
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "burst" }],
    testEnemy,
    {
      ...noCrit,
      resumeFrom: fullEnergySnapshot(character),
    },
  );
}

function fullEnergySnapshot(character: ReturnType<typeof createRaidenShogunDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

describe("Raiden Shogun generic kit data", () => {
  it("reuses sourced burst rows for the Dreams stance", () => {
    const raiden = createRaidenShogunDefinition(0);
    const stance = raiden.burst.stance;

    expect(raiden.resources).toEqual([
      expect.objectContaining({
        id: "raiden-resolve",
        name: "诸愿百眼之轮·愿力",
        initial: 0,
        max: 60,
        gainOnBurstCast: {
          perEnergyCost: 0.2,
          defaultMultiplier: 1,
          multipliersByElement: { electro: 1 },
          excludeSource: true,
        },
      }),
    ]);
    expect(stance?.id).toBe("raiden-musou-isshin");
    expect(stance?.normalAttacks?.hits).toHaveLength(5);
    expect(stance?.normalAttacks?.hits[0]?.instances[0]?.scaling).toEqual(
      raiden.burst.instances[1]?.scaling,
    );
  });

  it("gates only the supported C2 effect in the stance", () => {
    const c1 = createRaidenShogunDefinition(1);
    const c2 = createRaidenShogunDefinition(2);

    expect(c1.burst.stance?.enemyModifiers).toBeUndefined();
    expect(c2.burst.stance?.enemyModifiers).toBeUndefined();
    expect(c2.constellations.find((row) => row.level === 2)?.buffs?.[0]).toMatchObject({
      conditions: { damageTypes: ["burst"] },
      enemyModifiers: [{ key: "defIgnore", value: 0.6 }],
    });
    expect(RAIDEN_SHOGUN_KIT_METADATA.constellations.find((row) => row.level === 4)?.support).toBe(
      "modelled",
    );
    expect(RAIDEN_SHOGUN_KIT_METADATA.constellations.find((row) => row.level === 6)?.support).toBe(
      "modelled",
    );
  });

  it("declares Raiden Eye as a delayed damage trigger", () => {
    const raiden = createRaidenShogunDefinition(0);

    expect(raiden.skill.instances).toHaveLength(1);
    expect(raiden.skill.triggers).toHaveLength(1);
    expect(raiden.skill.triggers?.[0]).toMatchObject({
      id: "raiden-shogun-eye",
      trigger: "onDamageDealt",
      durationSeconds: 25,
      icdSeconds: 0.9,
    });
    expect(raiden.skill.triggers?.[0]?.ability?.instances).toHaveLength(1);
    expect(raiden.skill.triggers?.[0]?.ability?.instances[0]?.id).toBe(
      "raiden-shogun-skill-2",
    );
  });

  it("carries the sourced Eye, particle, and Energy rules at talent level", () => {
    const raiden = createRaidenShogunDefinition(0, { normal: 10, skill: 9, burst: 9 });

    expect(raiden.skill.particles).toBeUndefined();
    expect(raiden.skill.buffs?.[0]).toMatchObject({
      targets: { scope: "party" },
      energyCostDmgBonus: { ratio: 0.3, damageTypes: ["burst"] },
    });
    expect(raiden.skill.triggers?.[0]?.ability?.particles).toEqual({
      count: 0.5,
      element: "electro",
    });
    expect(raiden.resources[0]).toMatchObject({
      gainOnParticlePickup: { amount: 2, cooldownSeconds: 3 },
    });
    expect(raidenArtifactStateEffects(raiden.id, 0, 9, 6)[0]).toMatchObject({
      kind: "partyEnergyOnHit",
      amount: 2.4,
      energyRechargeScaling: { threshold: 1, ratio: 0.6 },
    });
  });

  it("executes the sourced burst multiplier as a deterministic baseline", () => {
    const result = damageFor();

    expect(result.errors).toEqual([]);
    expect(result.damageByAbility["raiden-shogun-burst"]).toBeGreaterThan(0);
  });

  it("applies the sourced A4 Energy Recharge conversion to Electro damage", () => {
    const ordinaryEr = damageFor(0, 1.32);
    const boostedEr = damageFor(0, 2.32);
    const ordinary = ordinaryEr.damageByAbility["raiden-shogun-burst"] ?? 0;
    const boosted = boostedEr.damageByAbility["raiden-shogun-burst"] ?? 0;

    expect(boosted).toBeGreaterThan(ordinary);
  });

  it("increases burst damage through supported C2 DEF ignore and C3 talent levels", () => {
    const c0 = damageFor(0).damageByAbility["raiden-shogun-burst"] ?? 0;
    const c2 = damageFor(2).damageByAbility["raiden-shogun-burst"] ?? 0;
    const c3 = damageFor(3).damageByAbility["raiden-shogun-burst"] ?? 0;

    expect(c2).toBeGreaterThan(c0);
    expect(c3).toBeGreaterThan(c0);
  });

  it("adds cast-captured Resolve to the sourced initial burst hit", () => {
    const noResolve = createRaidenShogunDefinition();
    const withResolve = {
      ...noResolve,
      resources: noResolve.resources.map((resource) =>
        resource.id === "raiden-resolve" ? { ...resource, initial: 20 } : resource,
      ),
    };
    const rotation = [{ characterId: noResolve.id, actionType: "burst" as const }];
    const run = (character: typeof noResolve) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      rotation,
      testEnemy,
      { ...noCrit, resumeFrom: fullEnergySnapshot(character) },
    ).damageByAbility["raiden-shogun-burst"] ?? 0;

    expect(run(withResolve)).toBeGreaterThan(run(noResolve));
  });
});
