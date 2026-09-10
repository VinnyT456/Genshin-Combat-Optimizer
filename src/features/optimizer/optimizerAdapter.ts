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

import { optimizeRotation } from "@/simulation/optimizer";
import type {
  OptimizationObjective,
  OptimizationResult,
  OptimizerConfig,
  RankedRotation,
} from "@/simulation/optimizer";
import { toEngineCharacter } from "@/features/simulation/simulationAdapter";
import type { WebsiteCharacterDefinition } from "@/features/simulation/simulationAdapter";
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
  readonly team: readonly (CharacterDefinition | WebsiteCharacterDefinition)[];
  readonly enemy: EnemyState;
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

/**
 * Runs a bounded rotation search.
 *
 * Blocking and synchronous — callers are responsible for yielding to the
 * browser before invoking it, so the "searching" state can paint.
 */
export function runSearch(request: SearchRequest): SearchOutcome {
  const beamWidth = beamWidthForBudget(request.budget);
  const durationSeconds = clampSearchDuration(request.durationSeconds);

  const optimizerConfig: OptimizerConfig = {
    beamWidth,
    simulationDuration: durationSeconds,
    objective: request.objective,
    topN: DEFAULT_TOP_N,
  };

  const outcome: OptimizationResult = optimizeRotation(
    request.team.map(toEngineCharacter),
    request.enemy,
    optimizerConfig,
    request.config,
  );

  return {
    candidates: outcome.ranked,
    requestedTopN: DEFAULT_TOP_N,
    nodesExpanded: outcome.nodesExpanded,
    budget: request.budget,
    objective: request.objective,
    durationSeconds,
    beamWidth,
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
