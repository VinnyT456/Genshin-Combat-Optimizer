import { describe, expect, it } from "vitest";
import {
  createRun,
  fingerprintInputs,
  isRunStale,
  type RunInputs,
} from "@/features/simulation/runState";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import type { CharacterDefinition, Rotation, SimulationResult } from "@/types";
import { NEUTRAL_ENEMY, makeTestCharacter } from "./helpers/fixtures";

// ============================================================================
// ADVERSARIAL attack on RUN IDENTITY (TASK #067).
//
// `handleCopySummary` was a LIVE defect: it read the live `enemy.name` and
// `enemy.level` beside a PREVIOUS run's damage numbers, so the summary asserted
// something untrue about the game. The fix binds a result to its inputs
// (`SimulationRun`) and DERIVES staleness by comparing fingerprints.
//
// The attack question is therefore not "does the fingerprint change when the
// enemy changes" -- that is the case that was already fixed. It is:
//
//   CAN I STILL PRODUCE A DISPLAYED RESULT THAT DESCRIBES INPUTS
//   IT WAS NOT COMPUTED FROM?
//
// A fingerprint is a security boundary of exactly the fields it reads. Any
// damage-determining field it omits is a live hole: the user edits it, the
// fingerprint does not move, `isRunStale` returns false, and the page keeps
// rendering the old numbers as current.
//
// So the method is: for each field the ENGINE demonstrably reads, prove the
// FINGERPRINT reads it too. The engine side is proven by an actual damage
// difference, not by inspection -- otherwise the test would share a predicate
// with the code it is testing.
// ============================================================================

const ROTATION: Rotation = [{ characterId: "a", actionType: "skill" }];
const INERT_RESULT = { totalDamage: 1234 } as SimulationResult;

function inputsFor(team: readonly CharacterDefinition[]): RunInputs {
  return {
    team,
    rotation: ROTATION,
    enemy: NEUTRAL_ENEMY,
    config: { critMode: "never" },
  };
}

/** Actual engine damage for a set of inputs — the ground truth for "matters". */
function damageOf(inputs: RunInputs): number {
  return runSimulation({
    team: inputs.team,
    rotation: inputs.rotation,
    enemy: inputs.enemy,
    config: inputs.config,
  }).result.totalDamage;
}

describe("run identity — fields the fingerprint already covers", () => {
  it.each([
    ["enemy level", { ...NEUTRAL_ENEMY, level: 50 }],
    ["enemy name", { ...NEUTRAL_ENEMY, name: "Other Dummy" }],
    ["enemy id", { ...NEUTRAL_ENEMY, id: "other" }],
    ["enemy resistances", { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } }],
  ])("changing %s makes an existing run stale", (_label, enemy) => {
    const base = inputsFor([makeTestCharacter("a")]);
    const run = createRun(base, INERT_RESULT, false);
    expect(isRunStale(run, { ...base, enemy })).toBe(true);
  });

  it("changing the rotation makes an existing run stale", () => {
    const base = inputsFor([makeTestCharacter("a")]);
    const run = createRun(base, INERT_RESULT, false);
    expect(
      isRunStale(run, {
        ...base,
        rotation: [{ characterId: "a", actionType: "normal" }],
      }),
    ).toBe(true);
  });

  it("changing critMode makes an existing run stale", () => {
    const base = inputsFor([makeTestCharacter("a")]);
    const run = createRun(base, INERT_RESULT, false);
    expect(isRunStale(run, { ...base, config: { critMode: "always" } })).toBe(
      true,
    );
  });

  it("changing character level makes an existing run stale", () => {
    const base = inputsFor([makeTestCharacter("a")]);
    const run = createRun(base, INERT_RESULT, false);
    const other = makeTestCharacter("a");
    expect(
      isRunStale(run, inputsFor([{ ...other, level: 80 }])),
    ).toBe(true);
  });

  it("reordering the team makes an existing run stale", () => {
    const a = makeTestCharacter("a");
    const b = makeTestCharacter("b");
    const run = createRun(inputsFor([a, b]), INERT_RESULT, false);
    expect(isRunStale(run, inputsFor([b, a]))).toBe(true);
  });

  it("an unchanged run is NOT stale, so the check is not vacuously true", () => {
    const base = inputsFor([makeTestCharacter("a")]);
    const run = createRun(base, INERT_RESULT, false);
    expect(isRunStale(run, inputsFor([makeTestCharacter("a")]))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// THE HOLE.
//
// `CharacterDefinition.baseStats` is overlaid onto the engine definition by
// `toEngineCharacter()` (simulationAdapter.ts:111) and is therefore fully
// damage-determining. `fingerprintCharacter()` reads id, level, constellation
// and talentLevels -- and NOT baseStats.
//
// DEFECT QA-067-A (owner: frontend-engineer, src/features/simulation/runState.ts:96
// `fingerprintCharacter`). Proven below: two teams differing ONLY in
// `baseStats.atk` produce 1000 vs 2000 damage and the SAME fingerprint, so
// `isRunStale` reports false and the page renders the old numbers as current.
//
// The failing assertions use `it.fails`, the project's convention for pinning a
// known defect: the suite stays green, and the moment the fingerprint is
// corrected these tests FAIL LOUDLY and must be flipped to `it`. That is what
// keeps a fix from landing silently and what stops the bug being made permanent
// by pinning it as expected behaviour.
// ---------------------------------------------------------------------------

describe("run identity — damage-determining stats must be part of identity", () => {
  const weak = makeTestCharacter("a", { stats: { atk: 1000 } });
  const strong = makeTestCharacter("a", { stats: { atk: 2000 } });

  it("PRECONDITION: the two builds really do produce different damage", () => {
    // Proven by the ENGINE, not by inspecting the fingerprint's field list --
    // otherwise this test would share a predicate with the code under test.
    const weakDamage = damageOf(inputsFor([weak]));
    const strongDamage = damageOf(inputsFor([strong]));
    expect(strongDamage).toBeGreaterThan(weakDamage);
    expect(strongDamage).toBeCloseTo(weakDamage * 2, 6);
  });

  // DEFECT QA-067-A — flip to `it` when the fingerprint covers stats.
  it("a run made with ATK 1000 is STALE once ATK becomes 2000", () => {
    const run = createRun(inputsFor([weak]), INERT_RESULT, false);
    expect(isRunStale(run, inputsFor([strong]))).toBe(true);
  });

  // DEFECT QA-067-A.
  it("fingerprints of two differently-statted teams differ", () => {
    expect(fingerprintInputs(inputsFor([weak]))).not.toBe(
      fingerprintInputs(inputsFor([strong])),
    );
  });

  // DEFECT QA-067-A — every one of these stats changes damage.
  it.each([
    ["critRate", { critRate: 0.5 }],
    ["critDmg", { critDmg: 1.5 }],
    ["dmgBonus", { dmgBonus: 0.5 }],
    ["elementalMastery", { elementalMastery: 200 }],
  ])("a change to %s is part of run identity", (_label, override) => {
    const before = makeTestCharacter("a");
    const after = makeTestCharacter("a", { stats: override });
    const run = createRun(inputsFor([before]), INERT_RESULT, false);
    expect(isRunStale(run, inputsFor([after]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EQUIPMENT BUFFS are damage-determining config and must be part of identity.
//
// DEFECT QA-067-B (owner: frontend-engineer, src/features/simulation/runState.ts:135
// `fingerprintConfig`). It reads critMode, swapCost, timeLimit and partySize
// only. `config.equipmentBuffs` is read by the ENGINE
// (`simulateRotation.ts:586` -> `withEquipmentBuffs`) and is absent from the
// fingerprint, so an equipment change is invisible to staleness. Measured:
// dmgBonus 0 / 0.5 / 5 give 1000 / 1500 / 6000 damage under ONE fingerprint.
//
// This is the SAME class as the original `handleCopySummary` defect and it
// arrived with the equipment wave, so the fingerprint has not kept pace with
// the inputs the engine consumes.
// ---------------------------------------------------------------------------

describe("run identity — equipment buffs must be part of identity", () => {
  const equipment = {
    a: {
      refinement: 5 as const,
      weaponPassive: {
        name: "Synthetic",
        buffsByRefinement: {
          5: [
            {
              id: "syn",
              source: "syn",
              startTime: 0,
              duration: Number.POSITIVE_INFINITY,
              stacking: { mode: "refresh" as const },
              targets: { scope: "active" as const },
              modifiers: [{ stat: "dmgBonus" as const, value: 0.5 }],
            },
          ],
        },
      },
    },
  };

  const bare = inputsFor([makeTestCharacter("a")]);
  const geared: RunInputs = {
    ...bare,
    config: { ...bare.config, equipmentBuffs: equipment },
  };

  it("PRECONDITION: equipping the passive really does change damage", () => {
    expect(damageOf(geared)).toBeCloseTo(damageOf(bare) * 1.5, 6);
  });

  // DEFECT QA-067-B — flip to `it` when the fingerprint covers equipmentBuffs.
  it("equipping a weapon passive makes an existing bare run stale", () => {
    const run = createRun(bare, INERT_RESULT, false);
    expect(isRunStale(run, geared)).toBe(true);
  });

  // DEFECT QA-067-B.
  it("changing refinement makes an existing run stale", () => {
    const runAtR5 = createRun(geared, INERT_RESULT, false);
    const atR1: RunInputs = {
      ...bare,
      config: {
        ...bare.config,
        equipmentBuffs: { a: { ...equipment.a, refinement: 1 as const } },
      },
    };
    expect(isRunStale(runAtR5, atR1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Fingerprint hygiene: no collisions from separator injection.
// ---------------------------------------------------------------------------

describe("run identity — fingerprint separator hygiene", () => {
  // DEFECT QA-067-C (owner: frontend-engineer, runState.ts:112 `fingerprintEnemy`).
  // Fields are joined on ":" without escaping, so an id/name pair can be shifted
  // across the separator to forge another enemy's fingerprint. Reachable only if
  // an enemy name may contain ":", which the current game data does not — LOW
  // severity, but it is a real collision and is pinned rather than ignored.
  it("an enemy name containing the field separator cannot forge another name", () => {
    const a = { ...NEUTRAL_ENEMY, id: "x", name: "a:90" };
    const b = { ...NEUTRAL_ENEMY, id: "x:a", name: "90" };
    const team = [makeTestCharacter("a")];
    expect(
      fingerprintInputs({ ...inputsFor(team), enemy: a }),
    ).not.toBe(fingerprintInputs({ ...inputsFor(team), enemy: b }));
  });

  it("a null run is never stale", () => {
    expect(isRunStale(null, inputsFor([makeTestCharacter("a")]))).toBe(false);
  });

  it("fingerprinting is pure — repeated calls agree", () => {
    const inputs = inputsFor([makeTestCharacter("a")]);
    expect(new Set([
      fingerprintInputs(inputs),
      fingerprintInputs(inputs),
      fingerprintInputs(inputs),
    ]).size).toBe(1);
  });
});
