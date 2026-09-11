import { describe, expect, it } from "vitest";
import {
  RAIDEN_SHOGUN_KIT_METADATA,
  createRaidenShogunDefinition,
} from "./raidenShogunDefinition";

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
});
