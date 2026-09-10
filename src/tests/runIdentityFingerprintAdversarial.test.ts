import { describe, expect, it } from "vitest";
import {
  createRun,
  fingerprintInputs,
  isRunStale,
  type RunInputs,
} from "@/features/simulation/runState";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type {
  CharacterDefinition,
  EnemyState,
  Element,
  Rotation,
  SimulationResult,
  Stats,
} from "@/types";
import { NEUTRAL_ENEMY, makeTestCharacter } from "./helpers/fixtures";

// ============================================================================
// ADVERSARIAL attack on RUN IDENTITY, round 2 (TASK #067, item 5).
//
// ROUND 1 (`runIdentityAdversarial.test.ts`) found three real holes in a
// fingerprint that read a hand-maintained FIELD LIST: character `baseStats`,
// `config.equipmentBuffs`, and a separator-injection collision. All three are
// FIXED — `fingerprintCharacter` now hashes the whole definition structurally,
// via a canonical serializer with sorted keys and an FNV-1a digest.
//
// That fix changes the threat model, so this file attacks the NEW design
// rather than re-running the old attack:
//
//   1. UNDER-sensitivity is now a HASH question, not a field-list question.
//      A whole-object hash cannot omit a field, but a 32-bit digest CAN
//      collide. Section 1 searches for one over realistic input ranges.
//   2. OVER-sensitivity is the new failure mode, and it is not benign: a
//      fingerprint that moves when nothing damage-relevant changed marks every
//      run stale, which trains the user to ignore the staleness warning. The
//      resolver FUNCTIONS are the specific hazard, since function identity is
//      by reference and the adapter rebuilds them on every render.
//   3. The remaining "displayed result describing inputs it was not computed
//      from" surface is no longer the fingerprint at all. It is a LABEL that
//      summarises structured inputs LOSSILY. Section 3 attacks the one such
//      label left in the copied summary.
//
// The guiding question is unchanged: CAN I STILL PRODUCE A DISPLAYED RESULT
// THAT DESCRIBES INPUTS IT WAS NOT COMPUTED FROM?
// ============================================================================

const ROTATION: Rotation = [{ characterId: "a", actionType: "skill" }];
const INERT_RESULT = { totalDamage: 1234 } as SimulationResult;

function inputsFor(
  team: readonly CharacterDefinition[],
  enemy: EnemyState = NEUTRAL_ENEMY,
): RunInputs {
  return { team, rotation: ROTATION, enemy, config: { critMode: "never" } };
}

function fingerprintOfStats(stats: Partial<Stats>): string {
  return fingerprintInputs(inputsFor([makeTestCharacter("a", { stats })]));
}

// ===========================================================================
// 1. UNDER-SENSITIVITY — can two DIFFERENT builds share one fingerprint?
// ===========================================================================

describe("fingerprint collisions over realistic input ranges", () => {
  it("15000 distinct builds produce 15000 distinct fingerprints", () => {
    // A 32-bit FNV-1a digest has a birthday bound around 2^16 ≈ 65k inputs, so
    // a sweep of this size is a meaningful probe rather than a formality: a
    // digest with poor avalanche on small numeric edits would collide here.
    //
    // Deterministic and exhaustive over the swept ranges — no sampling, no RNG.
    const seen = new Set<string>();
    let count = 0;
    for (let atk = 500; atk < 3000; atk += 1) {
      for (const critRate of [0, 0.05, 0.5]) {
        for (const level of [80, 90]) {
          seen.add(
            fingerprintInputs(
              inputsFor([makeTestCharacter("a", { stats: { atk, critRate } })], {
                ...NEUTRAL_ENEMY,
                level,
              }),
            ),
          );
          count += 1;
        }
      }
    }
    expect(count).toBe(15000);
    expect(seen.size).toBe(count);
  });

  it("adjacent ATK values never collide — the digest avalanches", () => {
    // The specific failure a weak hash shows first: neighbouring integers
    // mapping together. Checked densely rather than at a few sample points.
    const seen = new Set<string>();
    for (let atk = 1000; atk < 6000; atk += 1) {
      seen.add(fingerprintOfStats({ atk }));
    }
    expect(seen.size).toBe(5000);
  });

  it("a change in the LAST field is as visible as one in the first", () => {
    // Guards against a serializer that truncates, or a digest fed only a
    // prefix. `id` sorts early and `talentLevels` late in the canonical key
    // order, so both ends of the serialized string are exercised.
    const base = makeTestCharacter("a");
    const differentId = fingerprintInputs(
      inputsFor([{ ...base, id: "b" }]),
    );
    const differentTail = fingerprintInputs(
      inputsFor([{ ...base, talentLevels: { normal: 9, skill: 9, burst: 9 } }]),
    );
    const plain = fingerprintInputs(inputsFor([base]));
    expect(new Set([plain, differentId, differentTail]).size).toBe(3);
  });

  it("a float difference too small to matter is still a different run", () => {
    // Deliberately NOT asserting that tiny differences are folded together.
    // Folding would need a tolerance, and a tolerance is a second place for
    // the engine and the fingerprint to disagree. Exact identity is correct.
    expect(fingerprintOfStats({ atk: 1000 })).not.toBe(
      fingerprintOfStats({ atk: 1000.0001 }),
    );
  });

  it("swapping two characters' STATS is visible, not just their order", () => {
    // A hash that folded the team into an order-insensitive digest would miss
    // this: same multiset of stats, different assignment to characters.
    const first = inputsFor([
      makeTestCharacter("a", { stats: { atk: 1000 } }),
      makeTestCharacter("b", { stats: { atk: 2000 } }),
    ]);
    const second = inputsFor([
      makeTestCharacter("a", { stats: { atk: 2000 } }),
      makeTestCharacter("b", { stats: { atk: 1000 } }),
    ]);
    expect(fingerprintInputs(first)).not.toBe(fingerprintInputs(second));
  });
});

// ===========================================================================
// 2. OVER-SENSITIVITY — does the fingerprint move when nothing did?
// ===========================================================================

describe("fingerprint stability under irrelevant variation", () => {
  it("rebuilding the resolver functions does NOT make a run stale", () => {
    // THE LIVE HAZARD. `simulationAdapter` builds `buffResolver` and
    // `enemyModifierResolver` fresh on every call, so if the fingerprint
    // hashed them by reference, EVERY run would be instantly stale and the
    // staleness warning would become permanent noise the user learns to
    // ignore — which is the same end state as having no warning at all.
    const base = inputsFor([makeTestCharacter("a")]);
    const withResolvers: RunInputs = {
      ...base,
      config: {
        ...base.config,
        buffResolver: (stats) => stats,
        enemyModifierResolver: () => ({
          defReduction: 0,
          defIgnore: 0,
          resReduction: {},
        }),
      },
    };
    const rebuilt: RunInputs = {
      ...base,
      config: {
        ...base.config,
        buffResolver: (stats) => stats,
        enemyModifierResolver: () => ({
          defReduction: 0,
          defIgnore: 0,
          resReduction: {},
        }),
      },
    };
    expect(fingerprintInputs(withResolvers)).toBe(fingerprintInputs(rebuilt));
    const run = createRun(withResolvers, INERT_RESULT, false);
    expect(isRunStale(run, rebuilt)).toBe(false);
  });

  it("config key insertion order does not change identity", () => {
    const team = [makeTestCharacter("a")];
    const one = fingerprintInputs({
      team,
      rotation: ROTATION,
      enemy: NEUTRAL_ENEMY,
      config: { critMode: "never", swapCost: 1 },
    });
    const two = fingerprintInputs({
      team,
      rotation: ROTATION,
      enemy: NEUTRAL_ENEMY,
      config: { swapCost: 1, critMode: "never" },
    });
    expect(one).toBe(two);
  });

  it("resistance key insertion order does not change identity", () => {
    const team = [makeTestCharacter("a")];
    const forward: Partial<Record<Element, number>> = {
      pyro: 0.1,
      hydro: 0.2,
    };
    const reversed: Partial<Record<Element, number>> = {
      hydro: 0.2,
      pyro: 0.1,
    };
    expect(
      fingerprintInputs(inputsFor(team, { ...NEUTRAL_ENEMY, resistances: forward })),
    ).toBe(
      fingerprintInputs(inputsFor(team, { ...NEUTRAL_ENEMY, resistances: reversed })),
    );
  });

  it("an ABSENT resistance is not the same run as an explicit zero", () => {
    // The counterpart to the ordering test: normalising key order must not
    // also normalise ABSENCE, because the engine's `?? 0` default and an
    // authored 0 are the same NUMBER but they are not the same authored input.
    // Pinned so a future "tidy up the fingerprint" cannot merge them without
    // someone deciding to.
    const team = [makeTestCharacter("a")];
    const absent = fingerprintInputs(
      inputsFor(team, { ...NEUTRAL_ENEMY, resistances: {} }),
    );
    const explicit = fingerprintInputs(
      inputsFor(team, { ...NEUTRAL_ENEMY, resistances: { pyro: 0 } }),
    );
    expect(absent).not.toBe(explicit);
  });

  it("fingerprinting does not MUTATE the inputs it reads", () => {
    // A serializer that sorted arrays in place would reorder the user's
    // rotation as a side effect of checking staleness.
    const rotation: Rotation = [
      { characterId: "b", actionType: "skill" },
      { characterId: "a", actionType: "normal" },
    ];
    const before = JSON.stringify(rotation);
    fingerprintInputs({
      team: [makeTestCharacter("a")],
      rotation,
      enemy: NEUTRAL_ENEMY,
      config: { critMode: "never" },
    });
    expect(JSON.stringify(rotation)).toBe(before);
  });

  it("survives a self-referential input instead of hanging", () => {
    // The canonical serializer claims cycle handling. A stack overflow inside
    // a staleness check would take the whole page down, so it is exercised.
    const cyclic = makeTestCharacter("a") as CharacterDefinition & {
      self?: unknown;
    };
    cyclic.self = cyclic;
    expect(() => fingerprintInputs(inputsFor([cyclic]))).not.toThrow();
  });
});

// ===========================================================================
// 3. THE REMAINING SURFACE — a LOSSY LABEL over structured inputs.
// ===========================================================================

describe("copied summary — labels must not over-claim", () => {
  // The fingerprint now guarantees the summary is built from the RUN's inputs.
  // It cannot guarantee that a label SUMMARISING those inputs is true of them.
  //
  // `handleCopySummary` (src/app/page.tsx:417) renders:
  //
  //     基础全抗性 ${((inputs.enemy.resistances.pyro ?? 0.1) * 100)}%
  //
  // i.e. it reads the PYRO resistance and labels it "base ALL resistance".
  // That is a claim about eight numbers derived from one of them.
  //
  // TODAY IT IS TRUE, and provably so: every enemy the app can produce has
  // uniform resistances. `EnemyConfigurator.handleResPreset` writes ONE value
  // to all eight elements, and `testEnemy` is uniform at 0.1. So this is NOT a
  // live defect and is not reported as one.
  //
  // It is a LATENT one, and it is the exact shape of the original bug: a label
  // asserting something about the game that the data need not support. The
  // tests below pin the PRECONDITION that makes the label honest, so that the
  // first non-uniform enemy — a real boss with an element-specific RES — fails
  // here instead of silently printing a wrong summary.
  const ELEMENTS: readonly Element[] = [
    "pyro",
    "hydro",
    "electro",
    "cryo",
    "anemo",
    "geo",
    "dendro",
    "physical",
  ];

  function isUniform(enemy: EnemyState): boolean {
    const values = ELEMENTS.map((element) => enemy.resistances[element] ?? 0.1);
    return new Set(values).size === 1;
  }

  it("PRECONDITION: every shipped enemy has uniform resistances", () => {
    expect(isUniform(testEnemy)).toBe(true);
  });

  it("the uniformity check DISCRIMINATES — a synthetic boss fails it", () => {
    // The weapon agent's lesson: real data is uniformly true here, so the
    // check above cannot tell a working predicate from `return true`. This
    // labelled synthetic fixture supplies the negative case.
    const syntheticBoss: EnemyState = {
      id: "qa-synthetic-boss",
      name: "QA SYNTHETIC FIXTURE — not real game data",
      level: 90,
      // A real Genshin boss shape: heavily resistant to its own element.
      resistances: { ...testEnemy.resistances, pyro: 0.7 },
    };
    expect(isUniform(syntheticBoss)).toBe(false);
  });

  it("a non-uniform enemy would make the summary's pyro-as-all label WRONG", () => {
    // States the consequence in numbers rather than in prose, so the size of
    // the latent error is on record: the summary would report 70% while seven
    // of the eight elements are at 10%.
    const syntheticBoss: EnemyState = {
      id: "qa-synthetic-boss",
      name: "QA SYNTHETIC FIXTURE — not real game data",
      level: 90,
      resistances: { ...testEnemy.resistances, pyro: 0.7 },
    };
    const labelled = syntheticBoss.resistances.pyro ?? 0.1;
    const actual = syntheticBoss.resistances.hydro ?? 0.1;
    expect(labelled).toBe(0.7);
    expect(actual).toBe(0.1);
    expect(labelled).not.toBe(actual);
  });

  it("the enemy is part of run identity, so the numbers at least match the label", () => {
    // Even in the non-uniform case the DAMAGE is computed from the full
    // resistance map, and the fingerprint covers it — so the failure would be
    // a wrong LABEL beside right numbers, not the round-1 defect of right
    // labels beside wrong numbers. Worth separating: they need different fixes.
    const team = [makeTestCharacter("a")];
    const uniform = inputsFor(team, testEnemy);
    const boss = inputsFor(team, {
      ...testEnemy,
      resistances: { ...testEnemy.resistances, pyro: 0.7 },
    });
    expect(fingerprintInputs(uniform)).not.toBe(fingerprintInputs(boss));
    expect(isRunStale(createRun(uniform, INERT_RESULT, false), boss)).toBe(true);
  });
});

// ===========================================================================
// 4. THE END-TO-END PROPERTY — identity tracks DAMAGE, measured by the engine.
// ===========================================================================

describe("identity tracks what the engine actually reads", () => {
  /** The same inputs with crit actually contributing to damage. */
  function withCritMode(inputs: RunInputs): RunInputs {
    return { ...inputs, config: { ...inputs.config, critMode: "expected" } };
  }

  function damageOf(inputs: RunInputs): number {
    return runSimulation({
      team: inputs.team,
      rotation: inputs.rotation,
      enemy: inputs.enemy,
      config: inputs.config,
    }).result.totalDamage;
  }

  // Each case is a pair of input sets the ENGINE distinguishes. The engine
  // side is proven by an actual damage difference, so this sweep never shares
  // a predicate with the fingerprint it is testing.
  const cases: readonly [string, RunInputs, RunInputs][] = [
    [
      "ATK",
      inputsFor([makeTestCharacter("a", { stats: { atk: 1000 } })]),
      inputsFor([makeTestCharacter("a", { stats: { atk: 2000 } })]),
    ],
    [
      // TWO fixture bugs were caught here by the precondition, and both are
      // worth recording because each would have produced a PASSING but
      // meaningless case:
      //   1. Under `critMode: "never"` crit rate cannot change damage at all.
      //   2. `NEUTRAL_STATS` has `critDmg: 0`, so a crit multiplier of
      //      1 + rate * 0 = 1 makes even 100% crit rate a no-op.
      // Both stats must move together for crit to be observable.
      "crit rate (expected-value mode, non-zero crit DMG)",
      withCritMode(
        inputsFor([
          makeTestCharacter("a", { stats: { critRate: 0, critDmg: 1 } }),
        ]),
      ),
      withCritMode(
        inputsFor([
          makeTestCharacter("a", { stats: { critRate: 1, critDmg: 1 } }),
        ]),
      ),
    ],
    [
      "DMG bonus",
      inputsFor([makeTestCharacter("a", { stats: { dmgBonus: 0 } })]),
      inputsFor([makeTestCharacter("a", { stats: { dmgBonus: 1 } })]),
    ],
    [
      "enemy level",
      inputsFor([makeTestCharacter("a")], { ...NEUTRAL_ENEMY, level: 1 }),
      inputsFor([makeTestCharacter("a")], { ...NEUTRAL_ENEMY, level: 100 }),
    ],
    [
      "enemy resistance",
      inputsFor([makeTestCharacter("a")], {
        ...NEUTRAL_ENEMY,
        resistances: { pyro: 0 },
      }),
      inputsFor([makeTestCharacter("a")], {
        ...NEUTRAL_ENEMY,
        resistances: { pyro: 0.7 },
      }),
    ],
  ];

  it.each(cases)(
    "%s: the engine distinguishes these inputs (precondition)",
    (_label, left, right) => {
      expect(damageOf(left)).not.toBeCloseTo(damageOf(right), 6);
    },
  );

  it.each(cases)(
    "%s: so the fingerprint must distinguish them too",
    (_label, left, right) => {
      expect(fingerprintInputs(left)).not.toBe(fingerprintInputs(right));
      expect(isRunStale(createRun(left, INERT_RESULT, false), right)).toBe(true);
    },
  );

  it("and an input the engine ignores does not falsely invalidate a run", () => {
    // The other direction, so the suite is not satisfiable by "always stale".
    const base = inputsFor([makeTestCharacter("a")]);
    expect(isRunStale(createRun(base, INERT_RESULT, false), base)).toBe(false);
  });
});
