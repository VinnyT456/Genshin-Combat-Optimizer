import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  SimulationConfig,
  SimulationResult,
} from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { hasSkippedActions } from "./candidateAdmission";
import { generateRotationMutations } from "./rotationMutations";
import { rotationEditDistance, rotationKey } from "./rotationIdentity";
import {
  beamSearch,
  compareEvaluations,
  geneticSearch,
  localSearch,
  type RotationEvaluation,
  type SearchAlgorithm,
  type SearchConfig,
  type SearchContext,
  type StrategyResult,
} from "./searchStrategies";

export interface PortfolioSearchConfig {
  readonly objective: "total-damage" | "dps";
  readonly simulationDuration: number;
  readonly topN: number;
  readonly maxEvaluations: number;
  readonly maxDepth: number;
  readonly beamWidth: number;
  readonly populationSize: number;
  readonly generations: number;
  readonly mutationRate: number;
  readonly eliteCount: number;
  readonly seed: number;
  readonly algorithms: readonly SearchAlgorithm[];
}

export const DEFAULT_PORTFOLIO_SEARCH_CONFIG: PortfolioSearchConfig = {
  objective: "dps",
  simulationDuration: 20,
  topN: 5,
  maxEvaluations: 500,
  maxDepth: 3,
  beamWidth: 8,
  populationSize: 12,
  generations: 8,
  mutationRate: 1,
  eliteCount: 2,
  seed: 1,
  algorithms: ["local", "beam", "genetic"],
};

export interface RotationOptimizationRequest {
  readonly initialRotation: Rotation;
  readonly team: readonly (CharacterDefinition | GenericCharacterDefinition)[];
  readonly enemy: EnemyState;
  readonly simulationConfig?: SimulationConfig;
  readonly config?: Partial<PortfolioSearchConfig>;
}

export interface OptimizedRotation {
  readonly rotation: Rotation;
  /** Exact cold-replay output used to score and verify this candidate. */
  readonly result: SimulationResult;
  readonly totalDamage: number;
  readonly duration: number;
  readonly dps: number;
  readonly score: number;
  readonly improvementAbsolute: number;
  readonly improvementPercent: number | null;
  readonly editsFromOriginal: number;
  readonly discoveredBy: readonly SearchAlgorithm[];
}

export interface SearchAlgorithmStats {
  readonly algorithm: SearchAlgorithm;
  /** Unique simulator evaluations first charged to this algorithm. */
  readonly evaluations: number;
  readonly validCandidates: number;
  readonly invalidCandidates: number;
  readonly iterations: number;
  readonly depthReached: number;
  readonly budgetExhausted: boolean;
  readonly elapsedTimeMs: number;
}

export interface PortfolioOptimizationResult {
  readonly baseline: OptimizedRotation | null;
  readonly topRotations: readonly OptimizedRotation[];
  readonly algorithmStats: readonly SearchAlgorithmStats[];
  /** Exploration evaluations plus bounded final cold replays. */
  readonly totalEvaluations: number;
  readonly validCandidates: number;
  readonly invalidCandidates: number;
  readonly stopReason: "completed" | "budget-exhausted" | "no-candidates";
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.trunc(value));
}

function nonNegativeInteger(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.trunc(value));
}

function finitePositive(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function resolveConfig(
  requested: Partial<PortfolioSearchConfig> | undefined,
): PortfolioSearchConfig {
  const merged = { ...DEFAULT_PORTFOLIO_SEARCH_CONFIG, ...requested };
  const algorithms = (merged.algorithms ?? DEFAULT_PORTFOLIO_SEARCH_CONFIG.algorithms).filter(
    (algorithm, index, entries) => entries.indexOf(algorithm) === index,
  );
  return {
    objective: merged.objective === "total-damage" ? "total-damage" : "dps",
    simulationDuration: finitePositive(
      merged.simulationDuration,
      DEFAULT_PORTFOLIO_SEARCH_CONFIG.simulationDuration,
    ),
    topN: positiveInteger(merged.topN, DEFAULT_PORTFOLIO_SEARCH_CONFIG.topN),
    maxEvaluations: positiveInteger(
      merged.maxEvaluations,
      DEFAULT_PORTFOLIO_SEARCH_CONFIG.maxEvaluations,
    ),
    maxDepth: nonNegativeInteger(merged.maxDepth, DEFAULT_PORTFOLIO_SEARCH_CONFIG.maxDepth),
    beamWidth: positiveInteger(merged.beamWidth, DEFAULT_PORTFOLIO_SEARCH_CONFIG.beamWidth),
    populationSize: positiveInteger(
      merged.populationSize,
      DEFAULT_PORTFOLIO_SEARCH_CONFIG.populationSize,
    ),
    generations: nonNegativeInteger(
      merged.generations,
      DEFAULT_PORTFOLIO_SEARCH_CONFIG.generations,
    ),
    mutationRate: Number.isFinite(merged.mutationRate)
      ? Math.min(1, Math.max(0, merged.mutationRate))
      : DEFAULT_PORTFOLIO_SEARCH_CONFIG.mutationRate,
    eliteCount: positiveInteger(merged.eliteCount, DEFAULT_PORTFOLIO_SEARCH_CONFIG.eliteCount),
    seed: Number.isFinite(merged.seed) ? Math.trunc(merged.seed) : DEFAULT_PORTFOLIO_SEARCH_CONFIG.seed,
    algorithms,
  };
}

function toStrategyConfig(config: PortfolioSearchConfig): SearchConfig {
  return config;
}

function validResult(result: ReturnType<typeof simulateRotation>): boolean {
  return result.errors.length === 0 && !hasSkippedActions(result);
}

function toEvaluation(
  rotation: Rotation,
  result: ReturnType<typeof simulateRotation>,
  objective: PortfolioSearchConfig["objective"],
): RotationEvaluation | undefined {
  if (!validResult(result)) return undefined;
  const score = objective === "dps" ? result.dps : result.totalDamage;
  return {
    rotation,
    score,
    totalDamage: result.totalDamage,
    duration: result.duration,
    dps: result.dps,
    valid: true,
  };
}

function sortedAlgorithms(
  algorithms: readonly SearchAlgorithm[],
): readonly SearchAlgorithm[] {
  const order: readonly SearchAlgorithm[] = ["local", "beam", "genetic"];
  return order.filter((algorithm) => algorithms.includes(algorithm));
}

function strategyFor(algorithm: SearchAlgorithm): typeof localSearch {
  switch (algorithm) {
    case "local":
      return localSearch;
    case "beam":
      return beamSearch;
    case "genetic":
      return geneticSearch;
  }
}

function asOptimizedRotation(
  evaluation: RotationEvaluation,
  result: SimulationResult,
  original: Rotation,
  baselineScore: number,
  discoveredBy: readonly SearchAlgorithm[],
): OptimizedRotation {
  const improvementAbsolute = evaluation.score - baselineScore;
  return {
    rotation: evaluation.rotation,
    result,
    totalDamage: evaluation.totalDamage,
    duration: evaluation.duration,
    dps: evaluation.dps,
    score: evaluation.score,
    improvementAbsolute,
    improvementPercent:
      baselineScore > 0 ? improvementAbsolute / baselineScore : null,
    editsFromOriginal: rotationEditDistance(original, evaluation.rotation),
    discoveredBy,
  };
}

/**
 * Runs the MVP search portfolio around a user-provided rotation.
 *
 * Each strategy only proposes reorderings of the user's action sequence. Every
 * score comes from the existing deterministic simulator, and every final
 * candidate receives a cold replay before it is emitted.
 */
export function optimizeRotationPortfolio(
  request: RotationOptimizationRequest,
): PortfolioOptimizationResult {
  const config = resolveConfig(request.config);
  // Reorder-only search has no search space for an empty sequence. Returning
  // no candidate makes the contract explicit instead of presenting a fake
  // zero-action suggestion with zero damage.
  if (request.initialRotation.length === 0) {
    return {
      baseline: null,
      topRotations: [],
      algorithmStats: [],
      totalEvaluations: 0,
      validCandidates: 0,
      invalidCandidates: 0,
      stopReason: "no-candidates",
    };
  }
  const team = [...request.team];
  const baseSimulationConfig = {
    ...(request.simulationConfig ?? {}),
    timeLimit:
      request.simulationConfig?.timeLimit === undefined
        ? config.simulationDuration
        : Math.min(request.simulationConfig.timeLimit, config.simulationDuration),
    // Portfolio candidates always start from the user's initial state.
    resumeFrom: undefined,
  } satisfies SimulationConfig;
  const cache = new Map<string, RotationEvaluation | null>();
  const resultCache = new Map<string, SimulationResult>();
  let explorationEvaluations = 0;
  let validCandidates = 0;
  let invalidCandidates = 0;

  const evaluate = (rotation: Rotation): RotationEvaluation | null | undefined => {
    const key = rotationKey(rotation);
    if (cache.has(key)) return cache.get(key);
    if (explorationEvaluations >= config.maxEvaluations) return undefined;

    explorationEvaluations += 1;
    const result = simulateRotation(
      team,
      rotation,
      request.enemy,
      baseSimulationConfig,
    );
    const evaluation = toEvaluation(rotation, result, config.objective);
    if (evaluation === undefined) {
      invalidCandidates += 1;
      cache.set(key, null);
      return null;
    }
    validCandidates += 1;
    cache.set(key, evaluation);
    resultCache.set(key, result);
    return evaluation;
  };

  const context: SearchContext = {
    evaluate,
    mutate: (rotation) => generateRotationMutations(rotation),
    remainingEvaluations: () => config.maxEvaluations - explorationEvaluations,
    objective: config.objective,
  };

  const strategyResults: StrategyResult[] = [];
  const algorithmStats: SearchAlgorithmStats[] = [];
  for (const algorithm of sortedAlgorithms(config.algorithms)) {
    const beforeEvaluations = explorationEvaluations;
    const beforeValid = validCandidates;
    const beforeInvalid = invalidCandidates;
    const startedAt = performance.now();
    const result = strategyFor(algorithm)(
      request.initialRotation,
      context,
      toStrategyConfig(config),
    );
    strategyResults.push(result);
    algorithmStats.push({
      algorithm,
      evaluations: explorationEvaluations - beforeEvaluations,
      validCandidates: validCandidates - beforeValid,
      invalidCandidates: invalidCandidates - beforeInvalid,
      iterations: result.iterations,
      depthReached: result.depthReached,
      budgetExhausted: result.budgetExhausted,
      elapsedTimeMs: performance.now() - startedAt,
    });
  }

  if (config.algorithms.length === 0 && !cache.has(rotationKey(request.initialRotation))) {
    evaluate(request.initialRotation);
  }

  const baselineKey = rotationKey(request.initialRotation);
  const baselineEntry = cache.get(baselineKey);
  if (baselineEntry === undefined || baselineEntry === null) {
    return {
      baseline: null,
      topRotations: [],
      algorithmStats,
      totalEvaluations: explorationEvaluations,
      validCandidates,
      invalidCandidates,
      stopReason: "no-candidates",
    };
  }
  const baselineEvaluation = baselineEntry;

  const discovered = new Map<
    string,
    { evaluation: RotationEvaluation; algorithms: Set<SearchAlgorithm> }
  >();
  for (const result of strategyResults) {
    for (const evaluation of result.candidates) {
      const key = rotationKey(evaluation.rotation);
      const existing = discovered.get(key);
      if (existing === undefined) {
        discovered.set(key, {
          evaluation,
          algorithms: new Set([result.algorithm]),
        });
      } else {
        existing.algorithms.add(result.algorithm);
      }
    }
  }
  if (!discovered.has(baselineKey)) {
    discovered.set(baselineKey, {
      evaluation: baselineEvaluation,
      algorithms: new Set(),
    });
  }

  const rankedPool = [...discovered.values()].sort((a, b) =>
    compareEvaluations(a.evaluation, b.evaluation),
  );
  const finalists = rankedPool.slice(0, config.topN);
  if (!finalists.some((entry) => rotationKey(entry.evaluation.rotation) === baselineKey)) {
    const baseline = discovered.get(baselineKey);
    if (baseline !== undefined) finalists.push(baseline);
  }

  // The exploration cache is exact, but these bounded cold replays verify the
  // finalists against a fresh from-zero engine invocation before emission.
  const verified = new Map<string, RotationEvaluation>();
  let finalReplays = 0;
  for (const finalist of finalists) {
    const result = simulateRotation(
      team,
      finalist.evaluation.rotation,
      request.enemy,
      baseSimulationConfig,
    );
    finalReplays += 1;
    const evaluation = toEvaluation(
      finalist.evaluation.rotation,
      result,
      config.objective,
    );
    if (evaluation !== undefined) {
      verified.set(rotationKey(evaluation.rotation), evaluation);
      resultCache.set(rotationKey(evaluation.rotation), result);
    }
  }

  const baseline = verified.get(baselineKey) ?? baselineEvaluation;
  const baselineScore = baseline.score;
  const finalCandidates = [...verified.entries()]
    .sort(([, a], [, b]) => compareEvaluations(a, b))
    .slice(0, config.topN)
    .map(([key, evaluation]) => {
      const algorithms = discovered.get(key)?.algorithms ?? new Set<SearchAlgorithm>();
      const result = resultCache.get(key);
      if (result === undefined) return null;
      return asOptimizedRotation(
        evaluation,
        result,
        request.initialRotation,
        baselineScore,
        sortedAlgorithms([...algorithms]),
      );
    })
    .filter((candidate): candidate is OptimizedRotation => candidate !== null);

  const budgetExhausted =
    explorationEvaluations >= config.maxEvaluations ||
    strategyResults.some((result) => result.budgetExhausted);
  return {
    baseline: asOptimizedRotation(
      baseline,
      resultCache.get(baselineKey) ??
        simulateRotation(team, request.initialRotation, request.enemy, baseSimulationConfig),
      request.initialRotation,
      baselineScore,
      [],
    ),
    topRotations: finalCandidates,
    algorithmStats,
    totalEvaluations: explorationEvaluations + finalReplays,
    validCandidates,
    invalidCandidates,
    stopReason: budgetExhausted ? "budget-exhausted" : "completed",
  };
}
