import type { Rotation } from "@/types";
import {
  rotationEditDistance,
  rotationKey,
} from "./rotationIdentity";

export type SearchAlgorithm = "local" | "beam" | "genetic";

/** Shared bounded configuration for the MVP search portfolio. */
export interface SearchConfig {
  readonly topN: number;
  readonly maxEvaluations: number;
  readonly maxDepth: number;
  readonly beamWidth: number;
  readonly populationSize: number;
  readonly generations: number;
  readonly mutationRate: number;
  readonly eliteCount: number;
  readonly seed: number;
}

export interface RotationEvaluation {
  readonly rotation: Rotation;
  readonly score: number;
  readonly totalDamage: number;
  readonly duration: number;
  readonly dps: number;
  readonly valid: true;
}

/** The only surface search strategies use to interact with the engine. */
export interface SearchContext {
  /** `undefined` means budget exhausted; `null` means the simulator rejected it. */
  readonly evaluate: (rotation: Rotation) => RotationEvaluation | null | undefined;
  readonly mutate: (rotation: Rotation) => readonly Rotation[];
  readonly remainingEvaluations: () => number;
  readonly objective: "total-damage" | "dps";
}

export interface StrategyResult {
  readonly algorithm: SearchAlgorithm;
  readonly candidates: readonly RotationEvaluation[];
  readonly iterations: number;
  readonly depthReached: number;
  readonly budgetExhausted: boolean;
}

const SCORE_EPSILON = 1e-9;

/** Deterministic total ordering shared by all strategies. */
export function compareEvaluations(
  a: RotationEvaluation,
  b: RotationEvaluation,
): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.totalDamage !== a.totalDamage) return b.totalDamage - a.totalDamage;
  if (a.duration !== b.duration) return a.duration - b.duration;
  if (a.rotation.length !== b.rotation.length) {
    return a.rotation.length - b.rotation.length;
  }
  const aKey = rotationKey(a.rotation);
  const bKey = rotationKey(b.rotation);
  if (aKey < bKey) return -1;
  if (aKey > bKey) return 1;
  return 0;
}

function evaluateMutations(
  rotations: readonly Rotation[],
  context: SearchContext,
  seen: Set<string>,
): RotationEvaluation[] {
  const evaluated: RotationEvaluation[] = [];
  for (const rotation of rotations) {
    const key = rotationKey(rotation);
    if (seen.has(key)) continue;
    seen.add(key);
    const result = context.evaluate(rotation);
    if (result === undefined) break;
    if (result === null) continue;
    evaluated.push(result);
    if (context.remainingEvaluations() === 0) break;
  }
  return evaluated;
}

/** Local hill climbing over the current candidate's nearby mutations. */
export function localSearch(
  initialRotation: Rotation,
  context: SearchContext,
  config: SearchConfig,
): StrategyResult {
  const initial = context.evaluate(initialRotation);
  if (initial === undefined || initial === null) {
    return {
      algorithm: "local",
      candidates: [],
      iterations: 0,
      depthReached: 0,
      budgetExhausted: initial === undefined,
    };
  }

  const seen = new Set<string>([rotationKey(initial.rotation)]);
  const candidates: RotationEvaluation[] = [initial];
  let current = initial;
  let iterations = 0;
  let depthReached = 0;

  while (iterations < config.maxDepth && context.remainingEvaluations() > 0) {
    iterations += 1;
    const neighbors = evaluateMutations(context.mutate(current.rotation), context, seen);
    if (neighbors.length === 0) break;
    neighbors.sort(compareEvaluations);
    const best = neighbors[0]!;
    candidates.push(...neighbors);
    depthReached = iterations;
    if (best.score <= current.score + SCORE_EPSILON) break;
    current = best;
  }

  candidates.sort(compareEvaluations);
  return {
    algorithm: "local",
    candidates,
    iterations,
    depthReached,
    budgetExhausted: context.remainingEvaluations() === 0,
  };
}

/** Beam search over mutation neighborhoods, starting at the user's rotation. */
export function beamSearch(
  initialRotation: Rotation,
  context: SearchContext,
  config: SearchConfig,
): StrategyResult {
  const initial = context.evaluate(initialRotation);
  if (initial === undefined || initial === null) {
    return {
      algorithm: "beam",
      candidates: [],
      iterations: 0,
      depthReached: 0,
      budgetExhausted: initial === undefined,
    };
  }

  const seen = new Set<string>([rotationKey(initial.rotation)]);
  const candidates: RotationEvaluation[] = [initial];
  let beam: RotationEvaluation[] = [initial];
  let depthReached = 0;

  for (let depth = 1; depth <= config.maxDepth; depth += 1) {
    if (context.remainingEvaluations() === 0) break;
    const mutations: Rotation[] = [];
    for (const node of beam) mutations.push(...context.mutate(node.rotation));
    const next = evaluateMutations(mutations, context, seen);
    if (next.length === 0) break;
    next.sort(compareEvaluations);
    beam = next.slice(0, Math.max(1, config.beamWidth));
    candidates.push(...beam);
    depthReached = depth;
  }

  candidates.sort(compareEvaluations);
  return {
    algorithm: "beam",
    candidates,
    iterations: depthReached,
    depthReached,
    budgetExhausted: context.remainingEvaluations() === 0,
  };
}

/** Small deterministic PRNG; genetic search never uses ambient randomness. */
function createRandom(seed: number): () => number {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function clampFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Genetic search with deterministic mutation + elitism.
 *
 * Crossover is intentionally omitted from this MVP. Rotation actions carry
 * stateful ordering, cooldown and energy dependencies; mutation plus the
 * simulator's validity gate gives useful nearby offspring without inventing a
 * second crossover legality model.
 */
export function geneticSearch(
  initialRotation: Rotation,
  context: SearchContext,
  config: SearchConfig,
): StrategyResult {
  const initial = context.evaluate(initialRotation);
  if (initial === undefined || initial === null) {
    return {
      algorithm: "genetic",
      candidates: [],
      iterations: 0,
      depthReached: 0,
      budgetExhausted: initial === undefined,
    };
  }

  const random = createRandom(config.seed);
  const populationSize = Math.max(1, config.populationSize);
  const mutationRate = clampFraction(config.mutationRate);
  const eliteCount = Math.min(
    populationSize,
    Math.max(1, Math.trunc(config.eliteCount)),
  );
  const population: Rotation[] = [initial.rotation];
  const initialMutations = [...context.mutate(initial.rotation)];
  for (const mutation of initialMutations) {
    if (population.length >= populationSize) break;
    if (!population.some((entry) => rotationKey(entry) === rotationKey(mutation))) {
      population.push(mutation);
    }
  }

  const allCandidates: RotationEvaluation[] = [initial];
  const seenEvaluations = new Set<string>([rotationKey(initial.rotation)]);
  let generations = 0;
  let depthReached = 0;

  for (let generation = 0; generation < config.generations; generation += 1) {
    if (context.remainingEvaluations() === 0) break;
    const evaluated = evaluateMutations(population, context, seenEvaluations);
    if (generation === 0) {
      // `initial` is already cached/evaluated, so it is not returned by the
      // helper. Keep the root exactly once in the result pool.
      allCandidates.push(...evaluated);
    } else {
      allCandidates.push(...evaluated);
    }
    const ranked = [initial, ...evaluated]
      .filter((entry, index, entries) =>
        entries.findIndex((candidate) => rotationKey(candidate.rotation) === rotationKey(entry.rotation)) === index,
      )
      .sort(compareEvaluations);
    if (ranked.length === 0) break;
    generations += 1;
    depthReached = generation + 1;

    const parents = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 2)));
    const nextPopulation: Rotation[] = parents
      .slice(0, eliteCount)
      .map((entry) => entry.rotation);
    const nextKeys = new Set(nextPopulation.map(rotationKey));

    let attempts = 0;
    const maxAttempts = populationSize * 4;
    while (nextPopulation.length < populationSize && attempts < maxAttempts) {
      attempts += 1;
      const parent = parents[Math.floor(random() * parents.length)]!;
      let child = parent.rotation;
      if (random() < mutationRate) {
        const mutations = context.mutate(parent.rotation);
        if (mutations.length > 0) {
          child = mutations[Math.floor(random() * mutations.length)]!;
        }
      }
      const key = rotationKey(child);
      if (nextKeys.has(key)) continue;
      nextKeys.add(key);
      nextPopulation.push(child);
    }

    if (nextPopulation.length === 0) break;
    population.splice(0, population.length, ...nextPopulation);
  }

  allCandidates.sort(compareEvaluations);
  return {
    algorithm: "genetic",
    candidates: allCandidates,
    iterations: generations,
    depthReached,
    budgetExhausted: context.remainingEvaluations() === 0,
  };
}

/** Keeps edit distance available to callers without putting it in fitness. */
export function editsFromOriginal(
  original: Rotation,
  candidate: Rotation,
): number {
  return rotationEditDistance(original, candidate);
}
