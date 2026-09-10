import { describe, expect, it } from "vitest";
import {
  createRun,
  fingerprintInputs,
  isRunStale,
  type RunInputs,
} from "./runState";
import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  SimulationResult,
} from "@/types";

// A fingerprint must react to inputs, so the fixtures below vary one field at a
// time. The result object is inert: nothing here reads it, because run identity
// is a property of the INPUTS only.

function character(
  overrides: Partial<CharacterDefinition> = {},
): CharacterDefinition {
  return {
    id: "xiangling",
    name: "Xiangling",
    element: "pyro",
    level: 90,
    ...overrides,
  } as CharacterDefinition;
}

const enemy: EnemyState = {
  id: "dummy",
  name: "Test Dummy",
  level: 90,
  resistances: { pyro: 0.1, hydro: 0.1 },
};

const rotation: Rotation = [
  { characterId: "xiangling", actionType: "skill" },
  { characterId: "xiangling", actionType: "burst" },
];

function inputs(overrides: Partial<RunInputs> = {}): RunInputs {
  return {
    team: [character()],
    rotation,
    enemy,
    config: { critMode: "expected", swapCost: 0.6 },
    ...overrides,
  };
}

const result = { totalDamage: 1000 } as SimulationResult;

describe("fingerprintInputs", () => {
  it("is stable for equal inputs built independently", () => {
    expect(fingerprintInputs(inputs())).toBe(fingerprintInputs(inputs()));
  });

  it("ignores resistance key insertion order", () => {
    // Two enemies differing only in assignment order are the same enemy; if
    // this failed, merely re-rendering the enemy form would invalidate a run.
    const reordered: EnemyState = {
      ...enemy,
      resistances: { hydro: 0.1, pyro: 0.1 },
    };
    expect(fingerprintInputs(inputs({ enemy: reordered }))).toBe(
      fingerprintInputs(inputs()),
    );
  });

  it("ignores resolver functions supplied by the adapter", () => {
    // Function identity is by reference, so including resolvers would make
    // every run instantly stale. `config` is narrowed on purpose.
    const withResolver = inputs({
      config: {
        critMode: "expected",
        swapCost: 0.6,
        buffResolver: () => ({ stats: {} }) as never,
      },
    });
    expect(fingerprintInputs(withResolver)).toBe(fingerprintInputs(inputs()));
  });

  describe("changes when a damage-relevant input changes", () => {
    const cases: ReadonlyArray<readonly [string, RunInputs]> = [
      ["team membership", inputs({ team: [character({ id: "bennett" })] })],
      ["team size", inputs({ team: [character(), character({ id: "xingqiu" })] })],
      ["character level", inputs({ team: [character({ level: 80 })] })],
      ["constellation", inputs({ team: [character({ constellation: 6 })] })],
      [
        "talent levels",
        inputs({
          team: [
            character({ talentLevels: { normal: 9, skill: 9, burst: 9 } }),
          ],
        }),
      ],
      [
        "rotation contents",
        inputs({ rotation: [{ characterId: "xiangling", actionType: "skill" }] }),
      ],
      [
        "rotation order",
        inputs({ rotation: [rotation[1]!, rotation[0]!] }),
      ],
      [
        "normal-attack string position",
        inputs({
          rotation: [
            { characterId: "xiangling", actionType: "normal", normalIndex: 2 },
          ],
        }),
      ],
      ["enemy level", inputs({ enemy: { ...enemy, level: 100 } })],
      [
        "enemy resistance",
        inputs({ enemy: { ...enemy, resistances: { pyro: 0.5 } } }),
      ],
      ["crit mode", inputs({ config: { critMode: "always", swapCost: 0.6 } })],
      ["swap cost", inputs({ config: { critMode: "expected", swapCost: 1.2 } })],
      ["time limit", inputs({ config: { critMode: "expected", timeLimit: 20 } })],
    ];

    for (const [label, changed] of cases) {
      it(label, () => {
        expect(fingerprintInputs(changed)).not.toBe(fingerprintInputs(inputs()));
      });
    }
  });

  it("distinguishes an unset optional field from a set one", () => {
    // Without an explicit unset marker, `swapCost: undefined` and a missing
    // key would collapse into the same string as a neighbouring field.
    expect(
      fingerprintInputs(inputs({ config: { critMode: "expected" } })),
    ).not.toBe(fingerprintInputs(inputs()));
  });
});

describe("isRunStale", () => {
  it("reports no staleness when there is no run", () => {
    expect(isRunStale(null, inputs())).toBe(false);
  });

  it("is fresh against the inputs it was created from", () => {
    const run = createRun(inputs(), result, true);
    expect(isRunStale(run, inputs())).toBe(false);
  });

  it("is stale once any input changes", () => {
    const run = createRun(inputs(), result, true);
    expect(isRunStale(run, inputs({ enemy: { ...enemy, level: 93 } }))).toBe(
      true,
    );
  });

  it("becomes fresh again when the inputs are reverted", () => {
    // Staleness is derived, not latched: undoing an edit restores the binding
    // rather than leaving a permanent warning the user cannot clear.
    const run = createRun(inputs(), result, true);
    const edited = inputs({ enemy: { ...enemy, level: 93 } });
    expect(isRunStale(run, edited)).toBe(true);
    expect(isRunStale(run, inputs())).toBe(false);
  });
});

describe("createRun", () => {
  it("binds the result to its own inputs, not to later edits", () => {
    // The whole point of UX-005: the run keeps its team even after the live
    // team is replaced, so a result region cannot mislabel old numbers.
    const original = inputs();
    const run = createRun(original, result, true);
    const laterTeam = [character({ id: "raiden" })];

    expect(run.inputs.team).toBe(original.team);
    expect(run.inputs.team).not.toBe(laterTeam);
    expect(run.result).toBe(result);
    expect(run.swapCostIsDefault).toBe(true);
  });
});
