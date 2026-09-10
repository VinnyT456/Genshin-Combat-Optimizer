import { describe, expect, it } from "vitest";
import type { Buff } from "@/simulation/buffs/types";
import type { BuffContext, CharacterSnapshot } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { makeCharacterDefenseResolver } from "@/simulation/buffs/makeBuffResolver";
import { makeHealingResolver } from "@/simulation/buffs/makeBuffResolver";
import { sumActiveCharacterDefense, sumActiveHealing } from "@/simulation/buffs/resolver";
import type { CharacterDefenseTotals } from "@/simulation/buffs/resolver";

function buff(overrides: Partial<Buff> = {}): Buff {
  return {
    id: "defense",
    source: "test",
    startTime: 0,
    duration: 10,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    ...overrides,
  };
}

function context(snapshot: BuffContext["snapshot"]): BuffContext {
  return {
    time: snapshot.time,
    character: testPyro,
    ability: testPyro.elementalSkill,
    activeCharacterId: testPyro.id,
    snapshot,
    enemy: testEnemy,
  };
}

describe("character defensive buff channels", () => {
  it("aggregates resistance and shield strength independently", () => {
    const active = [{
      buff: buff({
        resistanceModifiers: [{ element: "pyro", value: 0.15 }, { element: "cryo", value: 0.1 }],
        shieldStrengthModifiers: [{ value: 0.35 }],
      }),
      stacks: 2,
    }];
    expect(sumActiveCharacterDefense(active)).toEqual({
      resistances: { pyro: 0.3, cryo: 0.2 },
      shieldStrength: 0.7,
      auraDurationReduction: 0,
    });
  });

  it("gates shield-dependent effects on serialized shield state", () => {
    const shielded: CharacterSnapshot = {
      characterId: testPyro.id,
      energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
      cooldowns: {},
      shielded: true,
    };
    const unshielded = { ...shielded, shielded: false };
    const resolve = makeCharacterDefenseResolver({ buffs: [buff({
      conditions: { requiresShield: true },
      shieldStrengthModifiers: [{ value: 0.35 }],
    })] });
    expect(resolve(context({ time: 0, characters: { [testPyro.id]: shielded } }))).toEqual({ resistances: {}, shieldStrength: 0.35, auraDurationReduction: 0 });
    expect(resolve(context({ time: 0, characters: { [testPyro.id]: unshielded } }))).toEqual({ resistances: {}, shieldStrength: 0, auraDurationReduction: 0 });
  });

  it("is serializable and does not leak into enemy modifiers", () => {
    const source = buff({
      resistanceModifiers: [{ element: "electro", value: 0.25 }],
      shieldStrengthModifiers: [{ value: 0.2 }],
    });
    const roundTrip = JSON.parse(JSON.stringify(source)) as Buff;
    const result: CharacterDefenseTotals = sumActiveCharacterDefense([{ buff: roundTrip, stacks: 1 }]);
    expect(result).toEqual({ resistances: { electro: 0.25 }, shieldStrength: 0.2, auraDurationReduction: 0 });
    expect("enemyModifiers" in roundTrip).toBe(false);
  });

  it("aggregates outgoing and received healing as separate channels", () => {
    const healing = buff({ healingModifiers: [
      { kind: "outgoing", value: 0.15 },
      { kind: "received", value: 0.2 },
    ] });
    expect(sumActiveHealing([{ buff: healing, stacks: 2 }])).toEqual({
      outgoing: 0.3,
      received: 0.4,
    });
    const resolve = makeHealingResolver({ buffs: [healing] });
    const snapshot = { time: 0, characters: { [testPyro.id]: {
      characterId: testPyro.id,
      energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
      cooldowns: {},
    } } };
    expect(resolve(context(snapshot))).toEqual({ outgoing: 0.15, received: 0.2 });
  });
});
