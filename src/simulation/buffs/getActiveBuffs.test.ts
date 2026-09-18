import { describe, expect, it } from "vitest";
import type { AbilityDefinition, CharacterDefinition, SimulationSnapshot } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { getActiveBuffs } from "@/simulation/buffs/getActiveBuffs";
import type { Buff, BuffState } from "@/simulation/buffs/types";

const ATK_PCT = 0.2;

function buff(overrides: Partial<Buff> = {}): Buff {
  return {
    id: "b",
    source: "test",
    startTime: 0,
    duration: 10,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    modifiers: [{ stat: "atkPercent", value: ATK_PCT }],
    ...overrides,
  };
}

const other: CharacterDefinition = { ...testPyro, id: "other", name: "Other" };

function query(character: CharacterDefinition = testPyro, ability?: AbilityDefinition, activeCharacterId?: string) {
  return { character, ability, activeCharacterId };
}

function state(buffs: Buff[], snapshot?: SimulationSnapshot): BuffState {
  return { buffs, snapshot };
}

describe("getActiveBuffs — activation window", () => {
  it("is inclusive at startTime", () => {
    expect(getActiveBuffs(0, state([buff({ startTime: 0 })]), query())).toHaveLength(1);
  });

  it("is exclusive at expiry", () => {
    const s = state([buff({ startTime: 0, duration: 10 })]);
    expect(getActiveBuffs(9.999, s, query())).toHaveLength(1);
    expect(getActiveBuffs(10, s, query())).toHaveLength(0);
  });

  it("is inactive before startTime", () => {
    expect(getActiveBuffs(4.9, state([buff({ startTime: 5 })]), query())).toHaveLength(0);
  });

  it("treats Infinity duration as permanent", () => {
    const s = state([buff({ duration: Number.POSITIVE_INFINITY })]);
    expect(getActiveBuffs(1e6, s, query())).toHaveLength(1);
  });

  it("treats non-positive duration as inert", () => {
    expect(getActiveBuffs(0, state([buff({ duration: 0 })]), query())).toHaveLength(0);
    expect(getActiveBuffs(0, state([buff({ duration: -1 })]), query())).toHaveLength(0);
  });

  it("keeps a snapshot buff active for later hits after it expires live", () => {
    const snapshot: SimulationSnapshot = { time: 0, characters: {} };
    const s = state(
      [buff({ duration: 3, snapshotMode: "snapshot" })],
      snapshot,
    );

    expect(getActiveBuffs(0, s, query())).toHaveLength(1);
    expect(getActiveBuffs(5, s, query())).toHaveLength(1);
  });

  it("re-evaluates a dynamic buff at each hit", () => {
    const snapshot: SimulationSnapshot = { time: 0, characters: {} };
    const s = state([buff({ duration: 3, snapshotMode: "dynamic" })], snapshot);

    expect(getActiveBuffs(0, s, query())).toHaveLength(1);
    expect(getActiveBuffs(5, s, query())).toHaveLength(0);
  });
});

describe("getActiveBuffs — targeting", () => {
  it("party scope hits every character", () => {
    const s = state([buff({ targets: { scope: "party" } })]);
    expect(getActiveBuffs(0, s, query(testPyro))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(other))).toHaveLength(1);
  });

  it("active scope hits only the on-field character", () => {
    const s = state([buff({ targets: { scope: "active" } })]);
    expect(getActiveBuffs(0, s, query(testPyro, undefined, testPyro.id))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(other, undefined, testPyro.id))).toHaveLength(0);
  });

  it("active scope applies to nobody when no one is on-field", () => {
    const s = state([buff({ targets: { scope: "active" } })]);
    expect(getActiveBuffs(0, s, query(testPyro, undefined, undefined))).toHaveLength(0);
  });

  it("self scope keys off sourceCharacterId", () => {
    const s = state([buff({ targets: { scope: "self" }, sourceCharacterId: testPyro.id })]);
    expect(getActiveBuffs(0, s, query(testPyro))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(other))).toHaveLength(0);
  });

  it("self scope with no source applies to nobody (fails closed)", () => {
    const s = state([buff({ targets: { scope: "self" } })]);
    expect(getActiveBuffs(0, s, query(testPyro))).toHaveLength(0);
  });

  it("characters scope uses the allowlist", () => {
    const s = state([buff({ targets: { scope: "characters", characterIds: [other.id] } })]);
    expect(getActiveBuffs(0, s, query(other))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(testPyro))).toHaveLength(0);
  });
});

describe("getActiveBuffs — conditions", () => {
  it("filters by damage type", () => {
    const s = state([buff({ conditions: { damageTypes: ["burst"] } })]);
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.elementalBurst))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.elementalSkill))).toHaveLength(0);
  });

  it("filters by element", () => {
    const s = state([buff({ conditions: { elements: ["pyro"] } })]);
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.elementalSkill))).toHaveLength(1);
    // Normal attack is physical in the test data.
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.normalAttack))).toHaveLength(0);
  });

  it("filters by ability id", () => {
    const s = state([buff({ conditions: { abilityIds: [testPyro.elementalBurst.id] } })]);
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.elementalBurst))).toHaveLength(1);
    expect(getActiveBuffs(0, s, query(testPyro, testPyro.elementalSkill))).toHaveLength(0);
  });

  it("fails closed when a condition needs an ability that is absent", () => {
    const s = state([buff({ conditions: { damageTypes: ["burst"] } })]);
    expect(getActiveBuffs(0, s, query(testPyro, undefined))).toHaveLength(0);
  });

  it("honours requiresOnField in both directions", () => {
    const onFieldOnly = state([buff({ conditions: { requiresOnField: true } })]);
    expect(getActiveBuffs(0, onFieldOnly, query(testPyro, undefined, testPyro.id))).toHaveLength(1);
    expect(getActiveBuffs(0, onFieldOnly, query(testPyro, undefined, other.id))).toHaveLength(0);

    const offFieldOnly = state([buff({ conditions: { requiresOnField: false } })]);
    expect(getActiveBuffs(0, offFieldOnly, query(testPyro, undefined, other.id))).toHaveLength(1);
    expect(getActiveBuffs(0, offFieldOnly, query(testPyro, undefined, testPyro.id))).toHaveLength(0);
  });

  it("evaluates energy-fraction gates against the snapshot", () => {
    const snapshot: SimulationSnapshot = {
      time: 0,
      characters: {
        [testPyro.id]: {
          characterId: testPyro.id,
          energy: { current: 30, max: 60, totalGained: 30, totalSpent: 0 },
          cooldowns: {},
        },
      },
    };
    const half = state([buff({ conditions: { minEnergyFraction: 0.5 } })], snapshot);
    expect(getActiveBuffs(0, half, query(testPyro))).toHaveLength(1);

    const needsFull = state([buff({ conditions: { minEnergyFraction: 0.9 } })], snapshot);
    expect(getActiveBuffs(0, needsFull, query(testPyro))).toHaveLength(0);

    const capped = state([buff({ conditions: { maxEnergyFraction: 0.25 } })], snapshot);
    expect(getActiveBuffs(0, capped, query(testPyro))).toHaveLength(0);
  });

  it("fails closed on an energy gate with no snapshot", () => {
    const s = state([buff({ conditions: { minEnergyFraction: 0 } })]);
    expect(getActiveBuffs(0, s, query(testPyro))).toHaveLength(0);
  });

  it("requires current energy to be strictly below maximum", () => {
    const belowMax: SimulationSnapshot = {
      time: 0,
      characters: {
        [testPyro.id]: {
          characterId: testPyro.id,
          energy: { current: 59, max: 60, totalGained: 59, totalSpent: 0 },
          cooldowns: {},
        },
      },
    };
    const full: SimulationSnapshot = {
      ...belowMax,
      characters: {
        [testPyro.id]: {
          ...belowMax.characters[testPyro.id]!,
          energy: { current: 60, max: 60, totalGained: 60, totalSpent: 0 },
        },
      },
    };
    const gated = (snapshot: SimulationSnapshot) =>
      getActiveBuffs(
        0,
        state([buff({ conditions: { requiresEnergyBelowMax: true } })], snapshot),
        query(testPyro),
      );
    expect(gated(belowMax)).toHaveLength(1);
    expect(gated(full)).toHaveLength(0);
    expect(
      getActiveBuffs(0, state([buff({ conditions: { requiresEnergyBelowMax: true } })]), query(testPyro)),
    ).toHaveLength(0);
  });

  it("treats a zero-max-energy character as having zero ordinary energy", () => {
    const zeroEnergy: SimulationSnapshot = {
      time: 0,
      characters: {
        [testPyro.id]: {
          characterId: testPyro.id,
          energy: { current: 0, max: 0, totalGained: 0, totalSpent: 0 },
          cooldowns: {},
        },
      },
    };
    const nonZeroEnergy: SimulationSnapshot = {
      ...zeroEnergy,
      characters: {
        [testPyro.id]: {
          ...zeroEnergy.characters[testPyro.id]!,
          energy: { current: 1, max: 0, totalGained: 1, totalSpent: 0 },
        },
      },
    };
    const gated = (snapshot: SimulationSnapshot) =>
      getActiveBuffs(
        0,
        state([buff({ conditions: { requiresZeroEnergy: true } })], snapshot),
        query(testPyro),
      );

    expect(gated(zeroEnergy)).toHaveLength(1);
    expect(gated(nonZeroEnergy)).toHaveLength(0);
  });

  it("supports strict enemy and character HP thresholds", () => {
    const snapshot: SimulationSnapshot = {
      time: 0,
      characters: {
        [testPyro.id]: {
          characterId: testPyro.id,
          energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
          cooldowns: {},
          currentHp: 50,
          maxHp: 100,
        },
      },
    };
    const enemy = { ...testEnemy, id: "threshold-enemy", currentHp: 50, maxHp: 100 };
    expect(
      getActiveBuffs(
        0,
        state([buff({ conditions: { minEnemyHpFractionExclusive: 0.5 } })], snapshot),
        { ...query(testPyro), enemy },
      ),
    ).toHaveLength(0);
    expect(
      getActiveBuffs(
        0,
        state([buff({ conditions: { maxHpFractionExclusive: 0.5 } })], snapshot),
        query(testPyro),
      ),
    ).toHaveLength(0);
  });
});

describe("getActiveBuffs — stacking", () => {
  it("refresh collapses overlapping applications to one stack", () => {
    const s = state([
      buff({ id: "x", startTime: 0, stacking: { mode: "refresh" } }),
      buff({ id: "x", startTime: 2, stacking: { mode: "refresh" } }),
    ]);
    const active = getActiveBuffs(3, s, query());
    expect(active).toHaveLength(1);
    expect(active[0]?.stacks).toBe(1);
  });

  it("stack accumulates up to maxStacks", () => {
    const mk = (startTime: number) =>
      buff({ id: "x", startTime, stacking: { mode: "stack", maxStacks: 2 } });
    const s = state([mk(0), mk(1), mk(2)]);
    const active = getActiveBuffs(3, s, query());
    expect(active).toHaveLength(1);
    expect(active[0]?.stacks).toBe(2);
  });

  it("stack loses stacks as individual applications expire", () => {
    const mk = (startTime: number) =>
      buff({ id: "x", startTime, duration: 5, stacking: { mode: "stack", maxStacks: 3 } });
    const s = state([mk(0), mk(3)]);
    expect(getActiveBuffs(4, s, query())[0]?.stacks).toBe(2);
    // First application expired at t=5.
    expect(getActiveBuffs(5, s, query())[0]?.stacks).toBe(1);
  });

  it("independent keeps each application as its own entry", () => {
    const mk = (startTime: number) =>
      buff({ id: "x", startTime, stacking: { mode: "independent" } });
    const s = state([mk(0), mk(1)]);
    expect(getActiveBuffs(2, s, query())).toHaveLength(2);
  });

  it("different ids never interact", () => {
    const s = state([buff({ id: "a" }), buff({ id: "b" })]);
    expect(getActiveBuffs(0, s, query())).toHaveLength(2);
  });
});

describe("getActiveBuffs — determinism & purity", () => {
  it("returns a stable order regardless of input order", () => {
    const a = buff({ id: "aaa" });
    const b = buff({ id: "bbb" });
    const c = buff({ id: "ccc" });
    const forward = getActiveBuffs(0, state([a, b, c]), query()).map((x) => x.buff.id);
    const reversed = getActiveBuffs(0, state([c, b, a]), query()).map((x) => x.buff.id);
    expect(forward).toEqual(reversed);
    expect(forward).toEqual(["aaa", "bbb", "ccc"]);
  });

  it("does not mutate the state it is given", () => {
    const s = state([buff({ id: "a" }), buff({ id: "b" })]);
    const before = structuredClone(s);
    getActiveBuffs(0, s, query());
    expect(s).toEqual(before);
  });
});
