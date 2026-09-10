// ============================================================================
// OPTIMIZER CONTRACT — what beam search REQUIRES from the combat engine.
//
// TYPES AND CONSTANTS ONLY. There is deliberately no algorithm here: the
// optimizer is Phase 4 and unscheduled. This file exists so the requirements a
// beam search places on the engine are stated in COMPILABLE form BEFORE the
// character framework is wired into the engine, while changing them is still
// cheap.
//
// Nothing in this file is imported by the engine, and nothing here reimplements
// damage, energy or reaction math — the engine is a black box scored solely
// through `simulateRotation()`.
// ============================================================================

import type {
  Rotation,
  SimulationResult,
  SimulationSnapshot,
} from "@/types";

// ---------------------------------------------------------------------------
// Search configuration
// ---------------------------------------------------------------------------

/** What a candidate rotation is ranked by. */
export type OptimizationObjective = "total-damage" | "dps";

/** Why a deterministic search stopped. */
export type OptimizationStopReason =
  | "completed"
  | "budget-exhausted"
  | "no-candidates";

/** The fixed work/configuration identity used for one search invocation. */
export interface OptimizationBudget {
  readonly beamWidth: number;
  readonly topN: number;
  readonly simulationDuration: number;
  /** Safety depth cap derived from the requested simulation window. */
  readonly maxDepth: number;
}

export interface OptimizerConfig {
  /** Candidates retained per expansion depth. */
  beamWidth: number;
  /** Combat window in seconds the search optimizes within. */
  simulationDuration: number;
  objective: OptimizationObjective;
  /** Number of ranked rotations returned. */
  topN: number;
}

export interface RankedRotation {
  /** Stable identifier for this candidate across identical search requests. */
  candidateId: string;
  rotation: Rotation;
  result: SimulationResult;
  /** Objective value; the sole ranking key, ties broken deterministically. */
  score: number;
  /** One-based position in the final, emitted ranking. */
  rank: number;
  /** Stable code-unit rotation key used as the final tie-break. */
  tieBreakKey: string;
}

export interface OptimizationResult {
  /** Ranked best-first. Length <= `OptimizerConfig.topN`. */
  ranked: readonly RankedRotation[];
  /** Nodes expanded — a search-quality diagnostic, not a game value. */
  nodesExpanded: number;
  /** Objective requested for this invocation. */
  objective: OptimizationObjective;
  /** Fixed search budget/configuration identity for this invocation. */
  budget: OptimizationBudget;
  /** Actual deepest expansion level reached (root is depth 0). */
  depthReached: number;
  /** Explicit reason the bounded search stopped. */
  stopReason: OptimizationStopReason;
}

// ---------------------------------------------------------------------------
// REQUIREMENT 1 — resumable search state
// ---------------------------------------------------------------------------

/**
 * Beam search expands a node by appending ONE action to a retained prefix. With
 * a beam of width W over depth D, re-simulating each prefix from t=0 costs
 * O(W * D^2) action-steps instead of O(W * D). `SimulationSnapshot` exists to
 * make the O(W * D) path possible.
 *
 * For that to work, a snapshot must capture EVERY piece of state that affects
 * the damage of a subsequent action. As of the character framework landing,
 * `SimulationSnapshot` (src/types/index.ts:188) carries `time`,
 * `activeCharacterId` and per-character `{ energy, cooldowns }` — and nothing
 * else.
 *
 * The framework introduced three further pieces of carried state. Each is
 * legitimately per-character or per-target simulation state that survives
 * across actions, and none of them is representable in the current snapshot:
 *
 *  1. ICD counters — `IcdState` (src/simulation/character/execution.ts:69,
 *     and the mechanics-side `IcdState` at src/simulation/reactions/types.ts:282).
 *     Whether a hit APPLIES its element depends on a hit-count/time window
 *     carried across casts. Resuming with empty counters makes the first hit
 *     after a resume always apply, which OVERSTATES reaction damage.
 *
 *  2. Resource states — `ResourceStates`
 *     (src/simulation/character/runtime.ts:31). Stacks, stances and pools are
 *     explicitly designed to persist across casts and to expire on a clock.
 *
 *  3. Target aura state — `AuraState`
 *     (src/simulation/reactions/types.ts:129). A rotation prefix leaves the
 *     enemy in an elemental state; the next action's reaction depends on it.
 *
 * This type states the shape the optimizer needs. It is intentionally declared
 * as an EXTENSION of `SimulationSnapshot` rather than a replacement, so the
 * change combat-engineer would make is purely additive: three optional fields.
 *
 * OWNERSHIP: `src/types` belongs to combat-engineer. This declaration is a
 * REQUEST expressed in code, not an edit to their type.
 */
/**
 * STATUS (TASK #029, optimizer-engineer): the SHAPE is satisfied, the BEHAVIOUR
 * is not.
 *
 * `SimulationSnapshot` now carries `CharacterSnapshot.{icd,resources,
 * normalStringIndex,activeStance}` and `SimulationSnapshot.enemyAuras`, so
 * every field this interface requested exists on the real type — this
 * declaration is now redundant with `SimulationSnapshot` itself.
 *
 * RESOLVED (TASK #054): `SimulationConfig.resumeFrom` is now WIRED (Phase B2,
 * combat-engineer) and the beam search USES it — see the incremental-expansion
 * section in `optimizeRotation.ts`. Expansion simulates only the appended
 * action from the parent's snapshot, so the search is O(W * D), not O(W * D^2).
 *
 * Measured: per-node cost went from rising with depth (24.6 -> 237.2 us over a
 * 16x depth range) to FLAT (~10-14 us), an ~17x end-to-end improvement on the
 * deepest case. Numbers and method are recorded in `performance.test.ts`.
 *
 * The superseded guidance said the optimizer "must NOT pass `resumeFrom`"
 * because it would silently yield a from-zero result behind a warning. That
 * was correct while the engine ignored the field; it no longer applies. The
 * remaining caveat is different and is handled explicitly: a RESUMED result
 * describes the SUFFIX only, so it must never be handed to a caller. Emission
 * re-simulates from t=0 for exactly that reason.
 */
export interface ResumableSnapshot extends SimulationSnapshot {
  /**
   * ICD counters per character, keyed by character id then ICD group.
   * Absent means "not tracked" — which is only sound before reactions are
   * wired into the engine.
   */
  icdByCharacter?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** Resource/stack/stance values per character, keyed by character id. */
  resourcesByCharacter?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** Elemental aura state per enemy, keyed by enemy id. */
  auraByEnemy?: Readonly<Record<string, unknown>>;
  /**
   * Index into each character's normal-attack string.
   *
   * `NormalAttackString` (src/simulation/character/kit.ts:123) is an ORDERED,
   * looping sequence: which ability an N-press resolves to depends on how many
   * normals that character has already thrown. No field anywhere in the engine
   * or in `CharacterState` currently tracks this, so an N-press is not
   * presently a well-defined action for a multi-hit string.
   */
  normalStringIndexByCharacter?: Readonly<Record<string, number>>;
}

// ---------------------------------------------------------------------------
// REQUIREMENT 2 — cost model under one-action-to-N-damage-events
// ---------------------------------------------------------------------------

/**
 * Beam search's runtime is (nodes expanded) * (cost of scoring one node).
 * Scoring one node is one `simulateRotation()` call, whose cost is proportional
 * to the number of DAMAGE EVENTS it emits, not the number of actions.
 *
 * Today one action emits exactly one damage event, so events == actions. Once
 * the kit model is wired in, one action emits `ability.instances.length`
 * events, and each event is an independent buff-resolve + enemy-resolve +
 * damage computation. The engine currently builds a FULL `SimulationSnapshot`
 * per cast (simulateRotation.ts:222) to populate `BuffContext.snapshot`; at N
 * instances per action that becomes N snapshot allocations per action, each
 * O(party size).
 *
 * This is the single largest optimizer-facing cost risk in the wiring change,
 * and it is an ENGINE-INTERNAL allocation question — the optimizer cannot fix
 * it from outside, and must not try to.
 */
export const MULTI_HIT_COST_NOTE =
  "Per-node scoring cost scales with total damage instances, not actions.";

/**
 * Aggregation keys the optimizer reads to score without walking the timeline.
 *
 * `damageByAbility` is currently keyed by `ability.name`
 * (simulateRotation.ts:350-351) — a HUMAN-READABLE label, not a stable id. Two
 * abilities sharing a display name collide silently. For scoring by total
 * damage this is harmless (the sum is unaffected), but any per-ability
 * objective or per-ability pruning heuristic needs a stable key.
 */
export const ABILITY_BREAKDOWN_KEY_NOTE =
  "RESOLVED (TASK #022): damageByAbility is keyed by ability ID; abilityNamesById supplies labels.";

// ---------------------------------------------------------------------------
// REQUIREMENT 3 — memoization key
// ---------------------------------------------------------------------------

/**
 * Two search nodes are interchangeable when they leave the simulation in the
 * same state, regardless of the action order that produced it. Memoizing on
 * that state collapses transpositions and is the main super-linear win
 * available to a beam search over a fixed action set.
 *
 * A memo key must therefore be derived from the RESUMABLE STATE, not from the
 * rotation prefix. Every field of `ResumableSnapshot` is plain data and
 * JSON-serializable by construction, and the determinism harness
 * (src/tests/helpers/determinism.ts:90) already pins key ORDER via
 * byte-identical `JSON.stringify`, so a stable key is derivable.
 *
 * The blocking caveat is FLOAT EQUALITY, not key order: keys are built from
 * continuous quantities (energy, cooldown timestamps, aura gauge) that are the
 * result of accumulated floating-point arithmetic. Two states that are equal in
 * game terms can differ in the last ULP and hash differently, silently
 * disabling the memo. Any key must therefore quantize before hashing.
 */
export const MEMO_KEY_QUANTIZATION_NOTE =
  "Memo keys must quantize floats; raw ULP-level differences defeat the table.";

/**
 * Decimal places continuous state is rounded to before it enters a memo key.
 *
 * Chosen to sit far below any quantity the engine can meaningfully distinguish
 * (energy is O(1..300), timestamps O(0..60)s) while sitting far ABOVE the
 * ~1e-16 relative error that accumulated arithmetic introduces. Rounding is a
 * property of the KEY only; scoring always uses full-precision values.
 */
export const MEMO_KEY_DECIMAL_PLACES = 6;

// ---------------------------------------------------------------------------
// REQUIREMENT 4 — legality
// ---------------------------------------------------------------------------

/**
 * The optimizer must never emit a rotation the engine would refuse. It gets
 * this for free by generating candidates through `validateAction()` — the same
 * function the engine uses (src/simulation/engine/validateAction.ts:53), proven
 * to agree with the engine by independent replay in
 * src/tests/engine-validation-agreement.test.ts.
 *
 * `validateAction` resolves an ability via `abilityForAction`
 * (validateAction.ts:24), which switches over the four legacy slots. Under the
 * kit model an `AbilitySlot` (kit.ts:79) has SIX members — `plungeLow` and
 * `plungeHigh` have no `ActionType` (src/types/index.ts:22) to reach them, and
 * a looping normal-attack string has no index to resolve N1 vs N2. Those
 * actions are therefore currently ungeneratable rather than illegal, which is
 * a silent loss of search space rather than a correctness bug.
 */
export const ACTION_GENERATION_NOTE =
  "RESOLVED (TASK #022 + #029): ActionType covers plungeLow/plungeHigh and RotationAction.normalIndex pins string position; both are generated.";
