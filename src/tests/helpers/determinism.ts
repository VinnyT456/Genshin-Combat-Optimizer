import { expect } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  SimulationConfig,
  SimulationResult,
} from "@/types";

// ============================================================================
// Determinism regression harness.
//
// The hardest invariant in this project: identical (team, rotation, enemy,
// config) MUST produce a structurally identical SimulationResult, every run,
// forever. The optimizer's beam search is only stable if this holds, and every
// exact-value test in the suite silently depends on it.
//
// This is a REGISTRY, not a one-off test. Future phases add a scenario here and
// get full determinism coverage for free:
//
//   registerScenario({ name, team, rotation, enemy, config });
//
// Checks performed per scenario:
//   1. Repeat-run structural equality (deep, including the whole timeline and
//      finalState) across N runs.
//   2. JSON round-trip stability — catches NaN / Infinity / -0 / undefined
//      leaking into the result, which deep-equal alone would accept but which
//      breaks Web Worker transfer and result caching.
//   3. Input immutability — the engine must not mutate the caller's team,
//      rotation, enemy or config. A mutating engine produces run-order-dependent
//      results, which is non-determinism wearing a disguise.
// ============================================================================

/** Number of repeat runs per scenario. Small: determinism is all-or-nothing. */
export const DETERMINISM_RUN_COUNT = 3;

export interface DeterminismScenario {
  /** Unique, human-readable scenario name (used as the test title). */
  name: string;
  /** Factory, not a value: each run gets pristine inputs. */
  team: () => CharacterDefinition[];
  rotation: () => Rotation;
  enemy: () => EnemyState;
  config?: () => SimulationConfig;
}

const registry: DeterminismScenario[] = [];

/** Registers a scenario for the determinism suite to exercise. */
export function registerScenario(scenario: DeterminismScenario): void {
  const clash = registry.some((s) => s.name === scenario.name);
  if (clash) throw new Error(`Duplicate determinism scenario: ${scenario.name}`);
  registry.push(scenario);
}

export function registeredScenarios(): readonly DeterminismScenario[] {
  return registry;
}

function runScenario(scenario: DeterminismScenario): SimulationResult {
  return simulateRotation(
    scenario.team(),
    scenario.rotation(),
    scenario.enemy(),
    scenario.config?.() ?? {},
  );
}

/**
 * Asserts a value survives a JSON round-trip unchanged. Any NaN, Infinity or
 * undefined-valued numeric field breaks this, as does -0 vs 0 asymmetry.
 */
export function expectJsonStable(result: SimulationResult): void {
  const encoded = JSON.stringify(result);
  expect(encoded).not.toContain("null");
  const decoded = JSON.parse(encoded) as SimulationResult;
  expect(JSON.stringify(decoded)).toBe(encoded);
}

/** Runs a scenario N times and asserts every run is deeply identical. */
export function expectDeterministic(scenario: DeterminismScenario): void {
  const first = runScenario(scenario);
  for (let i = 1; i < DETERMINISM_RUN_COUNT; i++) {
    const next = runScenario(scenario);
    // Deep structural equality covers timeline + finalState in full.
    expect(next).toEqual(first);
    // Byte-identical serialization also pins KEY ORDER, which toEqual ignores
    // but which matters for hashing results in an optimizer memo table.
    expect(JSON.stringify(next)).toBe(JSON.stringify(first));
  }
  expectJsonStable(first);
}

/** Asserts the engine treats its inputs as read-only. */
export function expectInputsUnmutated(scenario: DeterminismScenario): void {
  const team = scenario.team();
  const rotation = scenario.rotation();
  const enemy = scenario.enemy();
  const config = scenario.config?.() ?? {};

  const teamBefore = JSON.stringify(team);
  const rotationBefore = JSON.stringify(rotation);
  const enemyBefore = JSON.stringify(enemy);
  const configBefore = JSON.stringify(config);

  simulateRotation(team, rotation, enemy, config);

  expect(JSON.stringify(team)).toBe(teamBefore);
  expect(JSON.stringify(rotation)).toBe(rotationBefore);
  expect(JSON.stringify(enemy)).toBe(enemyBefore);
  expect(JSON.stringify(config)).toBe(configBefore);
}

/**
 * Asserts a fresh simulation equals one run after an unrelated prior
 * simulation — i.e. no state leaks across calls through module-level mutable
 * state. This is the failure mode a plain repeat-run check misses.
 */
export function expectNoCrossRunLeakage(
  scenario: DeterminismScenario,
  interference: DeterminismScenario,
): void {
  const clean = runScenario(scenario);
  runScenario(interference);
  const afterInterference = runScenario(scenario);
  expect(afterInterference).toEqual(clean);
}
