import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  ResourceSnapshot,
  SimulationSnapshot,
} from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import {
  RESOURCE_COMPARISON_EPSILON,
  getActiveBuffs,
  matchesConditions,
} from "@/simulation/buffs/getActiveBuffs";
import type {
  Buff,
  BuffState,
  ResourceComparator,
  ResourceCondition,
} from "@/simulation/buffs/types";

// ============================================================================
// Regression tests for the RESOURCE-AWARE BuffCondition.
//
// The kit shape being enabled is "if stacks >= 3, then X" — expressed as PLAIN
// DATA with no character named anywhere, and no callback anywhere.
// ============================================================================

const STACKS = "stacks";
const ATK_PCT = 0.2;

const other: CharacterDefinition = { ...testPyro, id: "other", name: "Other" };

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

function resource(overrides: Partial<ResourceSnapshot> = {}): ResourceSnapshot {
  return {
    id: STACKS,
    value: 0,
    max: 4,
    lastChanged: 0,
    ...overrides,
  };
}

function snapshotWith(
  resources: Record<string, Record<string, ResourceSnapshot>>,
  time = 0,
): SimulationSnapshot {
  const characters: SimulationSnapshot["characters"] = {};
  for (const [characterId, resourceStates] of Object.entries(resources)) {
    characters[characterId] = {
      characterId,
      energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
      cooldowns: {},
      resources: resourceStates,
    };
  }
  return { time, characters };
}

function stacksGate(
  comparator: ResourceComparator,
  value: number,
  owner?: ResourceCondition["owner"],
): ResourceCondition {
  return {
    resourceId: STACKS,
    comparator,
    value,
    ...(owner ? { owner } : {}),
  };
}

function stateWith(value: number, buffs: Buff[]): BuffState {
  return {
    buffs,
    snapshot: snapshotWith({ [testPyro.id]: { [STACKS]: resource({ value }) } }),
  };
}

describe("BuffCondition.resources — the 'stacks >= N' kit shape", () => {
  it("applies the buff once the threshold is reached", () => {
    const gated = buff({ conditions: { resources: [stacksGate("gte", 3)] } });
    expect(getActiveBuffs(0, stateWith(2, [gated]), { character: testPyro })).toHaveLength(0);
    expect(getActiveBuffs(0, stateWith(3, [gated]), { character: testPyro })).toHaveLength(1);
    expect(getActiveBuffs(0, stateWith(4, [gated]), { character: testPyro })).toHaveLength(1);
  });

  it("supports every declared comparator", () => {
    const cases: readonly [ResourceComparator, number, number, boolean][] = [
      ["gte", 3, 3, true],
      ["gte", 3, 2, false],
      ["gt", 3, 3, false],
      ["gt", 3, 4, true],
      ["lte", 1, 1, true],
      ["lte", 1, 2, false],
      ["lt", 1, 0, true],
      ["lt", 1, 1, false],
      ["eq", 2, 2, true],
      ["eq", 2, 3, false],
      ["neq", 2, 3, true],
      ["neq", 2, 2, false],
    ];
    for (const [comparator, threshold, actual, expected] of cases) {
      const gated = buff({
        conditions: { resources: [stacksGate(comparator, threshold)] },
      });
      const active = getActiveBuffs(0, stateWith(actual, [gated]), {
        character: testPyro,
      });
      expect(
        active.length === 1,
        `${comparator} ${threshold} vs ${actual}`,
      ).toBe(expected);
    }
  });

  it("ANDs multiple resource gates", () => {
    const state: BuffState = {
      buffs: [
        buff({
          conditions: {
            resources: [
              stacksGate("gte", 2),
              { resourceId: "stance", comparator: "eq", value: 1 },
            ],
          },
        }),
      ],
      snapshot: snapshotWith({
        [testPyro.id]: {
          [STACKS]: resource({ value: 3 }),
          stance: resource({ id: "stance", value: 0, max: 1 }),
        },
      }),
    };
    expect(getActiveBuffs(0, state, { character: testPyro })).toHaveLength(0);

    const bothMet: BuffState = {
      ...state,
      snapshot: snapshotWith({
        [testPyro.id]: {
          [STACKS]: resource({ value: 3 }),
          stance: resource({ id: "stance", value: 1, max: 1 }),
        },
      }),
    };
    expect(getActiveBuffs(0, bothMet, { character: testPyro })).toHaveLength(1);
  });

  it("ANDs a resource gate with the other condition fields", () => {
    const gated = buff({
      conditions: {
        resources: [stacksGate("gte", 3)],
        requiresOnField: true,
      },
    });
    // Resource satisfied, but off-field.
    expect(
      getActiveBuffs(0, stateWith(3, [gated]), {
        character: testPyro,
        activeCharacterId: other.id,
      }),
    ).toHaveLength(0);
    expect(
      getActiveBuffs(0, stateWith(3, [gated]), {
        character: testPyro,
        activeCharacterId: testPyro.id,
      }),
    ).toHaveLength(1);
  });
});

describe("BuffCondition.resources — missing data semantics", () => {
  it("reads a MISSING resource as 0 rather than failing the gate", () => {
    const empty: BuffState = {
      buffs: [],
      snapshot: snapshotWith({ [testPyro.id]: {} }),
    };
    const belowOne = buff({ conditions: { resources: [stacksGate("lt", 1)] } });
    expect(
      getActiveBuffs(0, { ...empty, buffs: [belowOne] }, { character: testPyro }),
    ).toHaveLength(1);

    const atLeastOne = buff({ conditions: { resources: [stacksGate("gte", 1)] } });
    expect(
      getActiveBuffs(0, { ...empty, buffs: [atLeastOne] }, { character: testPyro }),
    ).toHaveLength(0);
  });

  it("FAILS CLOSED with no snapshot at all", () => {
    const gated = buff({ conditions: { resources: [stacksGate("lt", 99)] } });
    // Would be TRUE if the resource read as 0 — it must not, because the owner
    // itself is unresolvable.
    expect(getActiveBuffs(0, { buffs: [gated] }, { character: testPyro })).toHaveLength(0);
  });

  it("FAILS CLOSED when the character is absent from the snapshot", () => {
    const gated = buff({ conditions: { resources: [stacksGate("lt", 99)] } });
    const state: BuffState = {
      buffs: [gated],
      snapshot: snapshotWith({ [other.id]: { [STACKS]: resource({ value: 0 }) } }),
    };
    expect(getActiveBuffs(0, state, { character: testPyro })).toHaveLength(0);
  });

  it("FAILS CLOSED for owner:'source' with no sourceCharacterId", () => {
    const gated = buff({
      conditions: { resources: [stacksGate("lt", 99, "source")] },
    });
    expect(getActiveBuffs(0, stateWith(0, [gated]), { character: testPyro })).toHaveLength(0);
  });

  it("FAILS CLOSED when matchesConditions is called without buff/time", () => {
    const condition = { resources: [stacksGate("lt", 99)] };
    const state = stateWith(0, []);
    // 3-argument legacy form cannot evaluate a resource gate.
    expect(matchesConditions(condition, { character: testPyro }, state)).toBe(false);
    // With full context it evaluates normally.
    expect(
      matchesConditions(condition, { character: testPyro }, state, buff(), 0),
    ).toBe(true);
  });

  it("leaves buffs with no resource gate unaffected by a missing snapshot", () => {
    const plain = buff();
    expect(getActiveBuffs(0, { buffs: [plain] }, { character: testPyro })).toHaveLength(1);
  });

  it("treats an empty resources array as no gate", () => {
    const gated = buff({ conditions: { resources: [] } });
    expect(getActiveBuffs(0, { buffs: [gated] }, { character: testPyro })).toHaveLength(1);
  });
});

describe("BuffCondition.resources — owner:'source'", () => {
  it("reads the SOURCE character's resource, not the buffed one", () => {
    const gated = buff({
      sourceCharacterId: other.id,
      conditions: { resources: [stacksGate("gte", 3, "source")] },
    });
    const state: BuffState = {
      buffs: [gated],
      snapshot: snapshotWith({
        // The buffed character has plenty; the SOURCE does not.
        [testPyro.id]: { [STACKS]: resource({ value: 4 }) },
        [other.id]: { [STACKS]: resource({ value: 1 }) },
      }),
    };
    expect(getActiveBuffs(0, state, { character: testPyro })).toHaveLength(0);

    const sourceReady: BuffState = {
      ...state,
      snapshot: snapshotWith({
        [testPyro.id]: { [STACKS]: resource({ value: 0 }) },
        [other.id]: { [STACKS]: resource({ value: 3 }) },
      }),
    };
    expect(getActiveBuffs(0, sourceReady, { character: testPyro })).toHaveLength(1);
  });

  it("defaults to owner:'self' when omitted", () => {
    const gated = buff({
      sourceCharacterId: other.id,
      conditions: { resources: [stacksGate("gte", 3)] },
    });
    const state: BuffState = {
      buffs: [gated],
      snapshot: snapshotWith({
        [testPyro.id]: { [STACKS]: resource({ value: 3 }) },
        [other.id]: { [STACKS]: resource({ value: 0 }) },
      }),
    };
    expect(getActiveBuffs(0, state, { character: testPyro })).toHaveLength(1);
  });
});

describe("BuffCondition.resources — expiry", () => {
  it("honours lazy resource expiry, so the buff falls off with its resource", () => {
    const gated = buff({
      duration: Number.POSITIVE_INFINITY,
      conditions: { resources: [stacksGate("gte", 1)] },
    });
    const state: BuffState = {
      buffs: [gated],
      snapshot: snapshotWith({
        [testPyro.id]: {
          [STACKS]: resource({ value: 3, lastChanged: 0, durationSeconds: 5 }),
        },
      }),
    };
    expect(getActiveBuffs(4.999, state, { character: testPyro })).toHaveLength(1);
    // Expiry boundary is inclusive at `lastChanged + durationSeconds`,
    // matching the character runtime's `>=`.
    expect(getActiveBuffs(5, state, { character: testPyro })).toHaveLength(0);
    expect(getActiveBuffs(10, state, { character: testPyro })).toHaveLength(0);
  });

  it("never expires a resource with no durationSeconds", () => {
    const gated = buff({
      duration: Number.POSITIVE_INFINITY,
      conditions: { resources: [stacksGate("gte", 1)] },
    });
    expect(getActiveBuffs(1e6, stateWith(2, [gated]), { character: testPyro })).toHaveLength(1);
  });
});

describe("BuffCondition.resources — purity and serializability", () => {
  it("a resource condition survives structuredClone (Web Worker safe)", () => {
    const gated = buff({
      conditions: {
        resources: [stacksGate("gte", 3), stacksGate("lt", 4, "source")],
      },
    });
    const cloned = structuredClone(gated);
    expect(cloned).toEqual(gated);
    expect(cloned.conditions?.resources?.[0]?.comparator).toBe("gte");
  });

  it("does not mutate the state or the query", () => {
    const gated = buff({ conditions: { resources: [stacksGate("gte", 1)] } });
    const state = stateWith(2, [gated]);
    const stateBefore = structuredClone(state);
    const query = { character: testPyro };
    const queryBefore = structuredClone(query);
    getActiveBuffs(0, state, query);
    expect(state).toEqual(stateBefore);
    expect(query).toEqual(queryBefore);
  });

  it("is deterministic across repeated identical calls", () => {
    const gated = buff({ conditions: { resources: [stacksGate("gte", 1)] } });
    const state = stateWith(2, [gated]);
    const a = getActiveBuffs(0, state, { character: testPyro });
    const b = getActiveBuffs(0, state, { character: testPyro });
    expect(a).toEqual(b);
  });
});

describe("BuffCondition.resources — fractional comparison", () => {
  it("compares eq/neq with a tolerance rather than ===", () => {
    const gated = buff({
      conditions: { resources: [stacksGate("eq", 0.3)] },
    });
    // 0.1 + 0.2 !== 0.3 in IEEE-754, but is well within the tolerance.
    const state = stateWith(0.1 + 0.2, [gated]);
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(getActiveBuffs(0, state, { character: testPyro })).toHaveLength(1);
  });

  it("still separates values further apart than the tolerance", () => {
    const gated = buff({ conditions: { resources: [stacksGate("eq", 0.3)] } });
    const off = stateWith(0.3 + RESOURCE_COMPARISON_EPSILON * 100, [gated]);
    expect(getActiveBuffs(0, off, { character: testPyro })).toHaveLength(0);
  });
});
