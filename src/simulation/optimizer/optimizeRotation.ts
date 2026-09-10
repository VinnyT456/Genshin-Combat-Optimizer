import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  RotationAction,
  SimulationConfig,
  SimulationResult,
} from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { EPSILON } from "@/simulation/engine/constants";
import type {
  OptimizationObjective,
  OptimizationResult,
  OptimizerConfig,
} from "./CONTRACT";
import { generateCandidateActions } from "./actionGenerator";
import { stateKey } from "./stateKey";
import { admitCandidate, hasSkippedActions } from "./candidateAdmission";

// ============================================================================
// Beam Search Optimizer
//
// Explores the rotation action space using beam search.
// Treats the combat engine as a black box, scoring candidates solely through
// `simulateRotation()`.
//
// Pure TypeScript: deterministic, zero React/DOM, Web-Worker portable.
//
// ---------------------------------------------------------------------------
// D3 / B2 — INCREMENTAL EXPANSION VIA `resumeFrom`.
//
// Expanding a node used to re-simulate the whole prefix from t=0, making the
// search O(W*D^2) in engine work. `config.resumeFrom` (Phase B2) lets a run
// start from the parent's snapshot instead, which is O(1) in prefix length.
//
// Measured cost of appending ONE action to a prefix (4-char team):
//
//     prefix len      8      16      32      64     128
//     from zero   26.3us  27.6us  47.4us  89.0us 194.5us
//     resume       6.6us   3.5us   3.3us   3.3us   3.4us
//     speedup      4.0x    8.0x   14.3x   27.0x   57.5x
//
// Resume cost is FLAT in prefix length. That is the O(W*D^2) -> O(W*D) change.
//
// THE CATCH, and why the search cannot simply hand a resumed result back.
// A resumed `SimulationResult` describes the SUFFIX ONLY: `totalDamage`,
// `duration`, `timeline` and `dps` cover just the actions simulated after the
// checkpoint. Verified exactly additive on the damage channel
// (prefix.totalDamage + resumed.totalDamage === full.totalDamage, bit-for-bit
// in the probe), but a consumer reading `ranked.result.timeline` would see one
// action instead of the whole rotation.
//
// So the two uses are SPLIT:
//   * SEARCH/SCORING uses resumed suffixes plus a running accumulated total.
//     This is the hot path and gets the full speedup.
//   * EMISSION re-simulates each returned rotation ONCE from t=0, so
//     `RankedRotation.result` remains a true whole-rotation result. That costs
//     `topN` extra simulations for the entire search — negligible against the
//     thousands of nodes expanded, and it preserves the public contract
//     exactly as it was.
//
// The re-simulation at emission also RE-ESTABLISHES the D2 legality invariant
// against a from-zero run, so a rotation is never emitted on the strength of a
// resumed run alone.
//
// `timeLimit` is ABSOLUTE (checked against the real clock, not elapsed suffix
// time), verified by probe, so the combat window still closes correctly on a
// resumed run and `past-time-limit` still fires.
// ============================================================================

/**
 * Shortest action the engine can advance the clock by, used only to bound the
 * search depth. A rotation cannot contain more actions than the window divided
 * by this, so it is a safety stop against a zero-cost action looping forever
 * (see `swapCost: 0` in the known limitations), never a game quantity.
 */
const MIN_ACTION_ADVANCE_SECONDS = 0.1;

/** Depth bound is generous: the beam, not this, is the real search limit. */
const DEPTH_BOUND_SLACK = 2;

/** Floor so a very short window still explores a usable number of steps. */
const MIN_SEARCH_DEPTH = 100;

function maxSearchDepth(simulationDuration: number): number {
  return Math.max(
    MIN_SEARCH_DEPTH,
    Math.ceil(simulationDuration / MIN_ACTION_ADVANCE_SECONDS) *
      DEPTH_BOUND_SLACK,
  );
}

export interface SearchNode {
  rotation: Rotation;
  /**
   * For a node produced by incremental expansion this describes the SUFFIX
   * simulated after the parent's checkpoint, not the whole rotation. Use
   * {@link SearchNode.totalDamage} / {@link SearchNode.score} for whole-rotation
   * quantities, and re-simulate from t=0 before exposing a result publicly.
   */
  result: SimulationResult;
  /** Whole-rotation objective value. */
  score: number;
  /** Whole-rotation damage, accumulated across resumed suffixes. */
  totalDamage: number;
  /** Absolute clock at the end of this rotation. */
  endTime: number;
  /**
   * `rotationKey(rotation)`, built INCREMENTALLY by appending the new action's
   * segment to the parent's key.
   *
   * Re-deriving it per node would re-walk the whole prefix, which is the same
   * O(D^2) shape `resumeFrom` just removed from the engine — only in the
   * optimizer instead. Optional so hand-built test fixtures need not supply it.
   */
  rotationKeyCache?: string;
}

/**
 * Computes objective score for ranking.
 */
function computeScore(
  result: SimulationResult,
  objective: OptimizationObjective,
): number {
  if (objective === "dps") {
    return result.dps;
  }
  return result.totalDamage;
}

/**
 * Whole-rotation objective value from ACCUMULATED quantities.
 *
 * Needed because a resumed `SimulationResult` reports suffix-only damage and
 * duration; `result.dps` for a resumed run is the suffix's DPS, which is not
 * the quantity the search ranks by. A zero-length window scores 0 rather than
 * dividing by zero.
 */
function accumulatedScore(
  totalDamage: number,
  endTime: number,
  objective: OptimizationObjective,
): number {
  if (objective === "dps") {
    return endTime > 0 ? totalDamage / endTime : 0;
  }
  return totalDamage;
}

/**
 * Generates a stable string key for a rotation.
 */
function actionKeySegment(a: RotationAction): string {
  return `${a.characterId}:${a.actionType}:${a.abilityId ?? ""}:${a.normalIndex ?? ""};`;
}

function rotationKey(rotation: Rotation): string {
  let s = "";
  for (let i = 0; i < rotation.length; i++) {
    s += actionKeySegment(rotation[i]!);
  }
  return s;
}

/** Cached key, falling back to derivation for nodes built without one. */
function nodeKey(node: SearchNode): string {
  return node.rotationKeyCache ?? rotationKey(node.rotation);
}

/**
 * Deterministic node comparator. Exported for direct total-order testing:
 * in-process reruns cannot detect a missing tie-break (V8's sort is stable),
 * so the ordering property must be asserted on the comparator itself.
 * Sorts descending by score, with totalDamage / dps and rotationKey tie-breaking.
 */
export function compareNodes(a: SearchNode, b: SearchNode): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  // Node-level accumulated values, NOT `result.*`: after incremental
  // expansion `result` describes only the resumed suffix, so tie-breaking on
  // it would compare a suffix against a whole rotation.
  if (b.totalDamage !== a.totalDamage) {
    return b.totalDamage - a.totalDamage;
  }
  if (b.endTime !== a.endTime) {
    // Earlier finish first at equal damage: strictly better DPS.
    return a.endTime - b.endTime;
  }
  // Shorter rotation first: at equal score, fewer actions is strictly better.
  if (a.rotation.length !== b.rotation.length) {
    return a.rotation.length - b.rotation.length;
  }
  // Final tie-break on a code-unit comparison. NOT `localeCompare`, which is
  // locale/ICU dependent and therefore not reproducible across environments —
  // the ordering must be a property of the input alone.
  const keyA = nodeKey(a);
  const keyB = nodeKey(b);
  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return 0;
}

/**
 * Optimizes a combat rotation for a team against an enemy using beam search.
 *
 * Conforms to `src/simulation/optimizer/CONTRACT.ts`.
 *
 * @param team Team of characters (generic or legacy)
 * @param enemy Target enemy
 * @param config Optimizer parameters (beamWidth, simulationDuration, objective, topN)
 * @param simConfig Combat simulation configuration
 */
export function optimizeRotation(
  team: (CharacterDefinition | GenericCharacterDefinition)[],
  enemy: EnemyState,
  config: OptimizerConfig,
  simConfig: SimulationConfig = {},
): OptimizationResult {
  const maxDepth = maxSearchDepth(Math.max(0, config.simulationDuration));
  const beamWidth = Math.max(1, config.beamWidth);
  const topN = Math.max(1, config.topN);
  const budget = {
    beamWidth,
    topN,
    simulationDuration: config.simulationDuration,
    maxDepth,
  } as const;

  if (team.length === 0 || config.simulationDuration <= 0) {
    return {
      ranked: [],
      nodesExpanded: 0,
      objective: config.objective,
      budget,
      depthReached: 0,
      stopReason: "no-candidates",
    };
  }

  const effectiveSimConfig: SimulationConfig = {
    ...simConfig,
    timeLimit:
      simConfig.timeLimit !== undefined
        ? Math.min(simConfig.timeLimit, config.simulationDuration)
        : config.simulationDuration,
  };

  let nodesExpanded = 0;
  const rootResult = simulateRotation(team, [], enemy, effectiveSimConfig);
  const rootScore = computeScore(rootResult, config.objective);
  const rootNode: SearchNode = {
    rotation: [],
    result: rootResult,
    score: rootScore,
    totalDamage: rootResult.totalDamage,
    endTime: rootResult.finalState.time,
    rotationKeyCache: "",
  };

  const completedNodes: SearchNode[] = [];
  let currentBeam: SearchNode[] = [rootNode];

  const maxSteps = maxDepth;
  let step = 0;
  let stoppedForNoCandidates = false;
  let stopReason: "completed" | "budget-exhausted" | "no-candidates" =
    "completed";

  while (currentBeam.length > 0 && step < maxSteps) {
    step++;
    const nextCandidates: SearchNode[] = [];

    for (const node of currentBeam) {
      const lastAction = node.rotation[node.rotation.length - 1];
      const validActions = generateCandidateActions(
        team,
        node.result,
        effectiveSimConfig,
        lastAction,
      );

      if (validActions.length === 0) {
        if (node.rotation.length > 0) {
          completedNodes.push(node);
        }
        continue;
      }

      // Expansion simulates ONLY the appended action, resuming from this
      // node's end state. Cost is independent of `node.rotation.length`.
      const resumeConfig: SimulationConfig = {
        ...effectiveSimConfig,
        resumeFrom: node.result.finalState,
      };

      for (const action of validActions) {
        const suffix: Rotation = [action];
        const result = simulateRotation(team, suffix, enemy, resumeConfig);
        nodesExpanded++;

        // D2 RULING (see candidateAdmission.ts): an action-level warning means
        // the engine SKIPPED that action, not that the rotation is bad. The
        // suffix is a single action, so a skip leaves nothing to repair — the
        // candidate simply contributes no new state and is dropped. The parent
        // is already in the beam, so no reachable rotation is lost.
        const admitted = admitCandidate(suffix, result);
        if (admitted === undefined) {
          continue;
        }

        const candidateRotation = [...node.rotation, action];
        const candidateKey = nodeKey(node) + actionKeySegment(action);
        const totalDamage = node.totalDamage + result.totalDamage;
        const endTime = result.finalState.time;
        const score = accumulatedScore(totalDamage, endTime, config.objective);
        const candidateNode: SearchNode = {
          rotation: candidateRotation,
          result,
          score,
          totalDamage,
          endTime,
          rotationKeyCache: candidateKey,
        };

        if (endTime >= config.simulationDuration - EPSILON) {
          completedNodes.push(candidateNode);
        } else {
          nextCandidates.push(candidateNode);
        }
      }
    }

    if (nextCandidates.length === 0) {
      stopReason = completedNodes.length > 0 ? "completed" : "no-candidates";
      stoppedForNoCandidates = true;
      break;
    }

    // Sort descending by score with deterministic tie-breaking
    nextCandidates.sort(compareNodes);

    // Prune identical rotations and duplicate transposition states
    const seenRotations = new Set<string>();
    const seenStates = new Set<string>();
    const filteredCandidates: SearchNode[] = [];

    for (const cand of nextCandidates) {
      const rKey = nodeKey(cand);
      if (seenRotations.has(rKey)) {
        continue;
      }
      seenRotations.add(rKey);

      const sKey = stateKey(cand.result.finalState);
      if (seenStates.has(sKey)) {
        continue;
      }
      seenStates.add(sKey);

      filteredCandidates.push(cand);
    }

    currentBeam = filteredCandidates.slice(0, beamWidth);
    if (currentBeam.length === 0) {
      stopReason = completedNodes.length > 0 ? "completed" : "no-candidates";
    }
  }

  if (currentBeam.length > 0 && step >= maxSteps && !stoppedForNoCandidates) {
    stopReason = "budget-exhausted";
  }

  // Select candidate pool: prefer completed rotations that fulfilled the duration
  let candidatePool: SearchNode[];
  if (completedNodes.length >= topN) {
    candidatePool = completedNodes;
  } else if (completedNodes.length > 0) {
    candidatePool = [...completedNodes, ...currentBeam];
  } else {
    candidatePool = currentBeam;
  }

  candidatePool.sort(compareNodes);

  const seenKeys = new Set<string>();
  const ranked: { node: SearchNode }[] = [];

  for (const node of candidatePool) {
    if (node.rotation.length === 0) continue;
    const key = nodeKey(node);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // EMISSION re-simulates from t=0. `node.result` describes only the last
    // resumed suffix, so it must never be handed to a caller. This costs at
    // most `topN` simulations for the whole search.
    const fullResult = simulateRotation(
      team,
      node.rotation,
      enemy,
      effectiveSimConfig,
    );

    // Re-establish the D2 legality invariant against a FROM-ZERO run: what we
    // emit must be executable in full, not merely legal when resumed. A
    // rotation that fails here is dropped rather than emitted illegal.
    if (fullResult.errors.length > 0 || hasSkippedActions(fullResult)) {
      continue;
    }

    ranked.push({
      node: {
        rotation: node.rotation,
        result: fullResult,
        score: computeScore(fullResult, config.objective),
        totalDamage: fullResult.totalDamage,
        endTime: fullResult.finalState.time,
        rotationKeyCache: key,
      },
    });
    if (ranked.length >= topN) {
      break;
    }
  }

  // FINAL SORT on the FROM-ZERO scores.
  //
  // The beam ranks nodes by damage ACCUMULATED across resumed suffixes, but a
  // rotation is emitted with a score from a single from-zero run. Those two
  // numbers are equal in the reals and NOT byte-identical in IEEE-754:
  // snapshotting re-anchors aura decay, which re-rounds (mechanics' measured
  // `AURA_GAUGE_RELATIVE_TOLERANCE`, 1e-9 relative). Measured inversion:
  // 19026.771964839 ranked above 19026.771964839005, a ~5e-12 disagreement.
  //
  // The emitted order must be a total order over the EMITTED scores, so the
  // list is re-sorted with the same deterministic comparator rather than
  // inheriting the search's accumulated-score order.
  ranked.sort((x, y) => compareNodes(x.node, y.node));

  return {
    ranked: ranked.map(({ node }, index) => ({
      candidateId: nodeKey(node),
      rotation: node.rotation,
      result: node.result,
      score: node.score,
      rank: index + 1,
      tieBreakKey: nodeKey(node),
    })),
    nodesExpanded,
    objective: config.objective,
    budget,
    depthReached: step,
    stopReason,
  };
}
