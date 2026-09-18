// ---------------------------------------------------------------------------
// Thin adapter between the React layer and the rotation search.
//
// Same rule as `simulationAdapter`: component code depends on ONE narrow seam,
// never on `src/simulation` directly, and never computes damage, energy or a
// score of its own. Everything here is either input marshalling or presentation
// metadata about a search that already ran.
//
// The search is SYNCHRONOUS today and blocks the main thread. Moving it into a
// worker is a separate, separately-owned piece of work, so this module's
// signatures are deliberately shaped to survive that move: inputs are plain
// serializable data, and the output carries the budget actually spent rather
// than assuming the caller watched it run.
// ---------------------------------------------------------------------------

import {
  optimizeRotationPortfolio,
  rotationKey,
  type PortfolioOptimizationResult,
} from "@/simulation/optimizer";
import type {
  OptimizationObjective,
  RankedRotation,
} from "@/simulation/optimizer/CONTRACT";
import {
  engineCompositionForTeam,
  isWebsiteCharacter,
  toEngineCharacter,
} from "@/features/simulation/simulationAdapter";
import type { WebsiteCharacterDefinition } from "@/features/simulation/simulationAdapter";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { equipmentConfig } from "@/features/simulation/equipmentAdapter";
import type { EquipmentSelections } from "@/features/team-builder/equipmentSelection";
import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  SimulationConfig,
} from "@/types";

/**
 * Search budget presets.
 *
 * The user picks a runtime/quality trade-off, not a beam width. An integer beam
 * width is an implementation detail of the algorithm: it has no units the user
 * can reason about, and "is 12 a lot?" is not a question the product should ask
 * them. The mapping from preset to width lives here so the UI never encodes it.
 *
 * IMPORTANT — these are NOT quality guarantees. Beam search is greedy: a wider
 * beam explores more candidates, but it can still discard the prefix of the
 * best rotation at any depth. `thorough` is therefore only WEAKLY monotone in
 * quality, and the UI must never promise it beats `fast`.
 */
export type SearchBudget = "fast" | "balanced" | "thorough";

export const SEARCH_BUDGETS: readonly SearchBudget[] = [
  "fast",
  "balanced",
  "thorough",
];

/** Candidates retained per expansion depth, per preset. */
const BEAM_WIDTH_BY_BUDGET: Record<SearchBudget, number> = {
  fast: 4,
  balanced: 12,
  thorough: 32,
};

/** How many ranked rotations a search returns. */
const DEFAULT_TOP_N = 5;

/** Combat window the search optimizes within, in seconds. */
export const DEFAULT_SEARCH_DURATION_SECONDS = 20;

/** Bounds for the user-editable search window. */
export const MIN_SEARCH_DURATION_SECONDS = 5;
export const MAX_SEARCH_DURATION_SECONDS = 60;

export function beamWidthForBudget(budget: SearchBudget): number {
  return BEAM_WIDTH_BY_BUDGET[budget];
}

/** Inputs the user chooses for a search. Plain data: worker-transferable. */
export interface SearchRequest {
  readonly team: readonly (
    | CharacterDefinition
    | GenericCharacterDefinition
    | WebsiteCharacterDefinition
  )[];
  readonly enemy: EnemyState;
  /** Current editor rotation. Optional only for legacy callers. */
  readonly initialRotation?: Rotation;
  /** Current editable weapons/artifacts, when available from the workspace. */
  readonly equipment?: EquipmentSelections;
  readonly budget: SearchBudget;
  readonly objective: OptimizationObjective;
  readonly durationSeconds: number;
  readonly config: Partial<SimulationConfig>;
}

/**
 * What a search actually did.
 *
 * `requestedTopN` is reported alongside the candidates so the UI can say
 * "3 of 5" honestly when the search space could not supply five distinct
 * rotations, rather than silently rendering a short list (UX-048).
 */
export interface SearchOutcome {
  readonly candidates: readonly RankedRotation[];
  readonly requestedTopN: number;
  readonly nodesExpanded: number;
  readonly budget: SearchBudget;
  readonly objective: OptimizationObjective;
  readonly durationSeconds: number;
  readonly beamWidth: number;
  /** Portfolio metadata; optional for compatibility with persisted test fixtures. */
  readonly totalEvaluations?: number;
  readonly stopReason?: PortfolioOptimizationResult["stopReason"];
}

/**
 * Clamps the search window to the bounds the UI advertises.
 *
 * Done here rather than in the component so an out-of-range value from any
 * caller (a restored URL, a future saved project) cannot reach the engine.
 */
export function clampSearchDuration(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_SEARCH_DURATION_SECONDS;
  return Math.min(
    MAX_SEARCH_DURATION_SECONDS,
    Math.max(MIN_SEARCH_DURATION_SECONDS, seconds),
  );
}

const MAX_EVALUATIONS_BY_BUDGET: Record<SearchBudget, number> = {
  fast: 120,
  balanced: 300,
  thorough: 600,
};

/**
 * Runs the bounded portfolio rotation search.
 *
 * Blocking and synchronous — callers are responsible for yielding to the
 * browser before invoking it, so the "searching" state can paint.
 */
export function runSearch(request: SearchRequest): SearchOutcome {
  const beamWidth = beamWidthForBudget(request.budget);
  const durationSeconds = clampSearchDuration(request.durationSeconds);

  const composition = engineCompositionForTeam(request.team);
  const engineTeam = request.team.map((character) =>
    toEngineCharacter(character, composition),
  );
  const equipmentFields = request.equipment
    ? equipmentConfig(
        request.team.map((character) => ({
          id: character.id,
          stats: character.baseStats,
          intrinsicStats: isWebsiteCharacter(character)
            ? character.engineDefinition.baseStats
            : character.baseStats,
        })),
        request.equipment,
      )
    : {};
  const outcome = optimizeRotationPortfolio({
    initialRotation: request.initialRotation ?? [],
    team: engineTeam,
    enemy: request.enemy,
    simulationConfig: {
      startWithFullEnergy: true,
      ...equipmentFields,
      ...request.config,
    },
    config: {
      objective: request.objective,
      simulationDuration: durationSeconds,
      topN: DEFAULT_TOP_N,
      maxEvaluations: MAX_EVALUATIONS_BY_BUDGET[request.budget],
      maxDepth: 3,
      beamWidth,
      populationSize: request.budget === "fast" ? 8 : request.budget === "balanced" ? 12 : 18,
      generations: request.budget === "fast" ? 4 : request.budget === "balanced" ? 8 : 12,
      mutationRate: 1,
      eliteCount: 2,
      seed: 1,
    },
  });

  const candidates: RankedRotation[] = outcome.topRotations.map((candidate, index) => ({
    candidateId: `portfolio-${rotationKey(candidate.rotation)}`,
    rotation: candidate.rotation,
    result: candidate.result,
    score: candidate.score,
    rank: index + 1,
    tieBreakKey: rotationKey(candidate.rotation),
  }));
  const nodesExpanded = outcome.algorithmStats.reduce(
    (total, stats) => total + stats.evaluations,
    0,
  );

  return {
    candidates,
    requestedTopN: DEFAULT_TOP_N,
    nodesExpanded,
    budget: request.budget,
    objective: request.objective,
    durationSeconds,
    beamWidth,
    totalEvaluations: outcome.totalEvaluations,
    stopReason: outcome.stopReason,
  };
}

/**
 * Score improvement of a candidate over the user's current rotation, as a
 * fraction. `null` when there is no baseline to compare against — a baseline of
 * zero has no meaningful percentage, and inventing one ("+∞%") would be a
 * fabricated number.
 */
export function improvementOverBaseline(
  candidateScore: number,
  baselineScore: number | null,
): number | null {
  if (baselineScore === null || baselineScore <= 0) return null;
  return (candidateScore - baselineScore) / baselineScore;
}

/** Objective value of an already-computed result, for baseline comparison. */
export function scoreForObjective(
  result: { readonly totalDamage: number; readonly dps: number },
  objective: OptimizationObjective,
): number {
  return objective === "dps" ? result.dps : result.totalDamage;
}

export type { OptimizationObjective, RankedRotation };
export type { Rotation };
