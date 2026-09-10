import type { Rotation, SimulationResult, SimulationWarning } from "@/types";
import { CONFIG_WARNING_ACTION_INDEX } from "@/types";

// ============================================================================
// Candidate admission — the D2 ruling on legal-but-warned candidates.
//
// PROBLEM. The search previously rejected any candidate whose simulation
// produced an action-level warning:
//
//     const hasActionWarning = result.structuredWarnings.some(
//       (w) => w.actionIndex >= 0);
//     if (result.errors.length > 0 || hasActionWarning) continue;
//
// That test was read as "this rotation is bad". It is not. Traced through the
// engine, an action-level `SimulationWarning` is emitted from EXACTLY ONE site
// (simulateRotation.ts, the `!verdict.valid` branch), and every such warning is
// immediately followed by `continue` — the action is SKIPPED. So an
// action-level warning does not mean "warned", it means DROPPED.
//
// That reframing is what decides the ruling, and it cuts both ways:
//
//  - A blanket ACCEPT would be a contract violation, not merely poor search.
//    `SimulationResult` does not echo back the rotation, so the optimizer would
//    hand the caller the ORIGINAL action array while the result describes a
//    strictly shorter run. Measured: a 3-action rotation with 2 skipped actions
//    still reports `rotation.length === 3` with only 1 damage event. Replaying
//    that emitted rotation reproduces the warnings — i.e. the optimizer would
//    be emitting a rotation the engine refuses to run in full, which the
//    optimizer's hard rule forbids.
//
//  - A blanket REJECT (the previous behaviour) throws away a node whose
//    EXECUTED prefix is perfectly legal and may be excellent. The skipped
//    action is noise appended to a good rotation; the fix is to remove the
//    noise, not the rotation.
//
// RULING. Neither accept nor reject: REPAIR. A candidate is admitted with the
// skipped actions REMOVED, so the emitted rotation is by construction exactly
// the action sequence the engine executed. Legality is preserved (strictly
// more strongly than before — see `assertNoSkippedActions`) while the search
// space stops being silently truncated.
//
// PER-WARNING-KIND DECISION. All seven `ValidationErrorCode`s were enumerated
// against the engine sites that can emit them:
//
//   CODE                  ACTION-LEVEL?  DECISION
//   unknown-character     no             Routed to `errors`, never to
//                                        structuredWarnings. Rejects the node.
//                                        It is an authoring fault: the team
//                                        passed in does not contain the actor,
//                                        so nothing about the run is meaningful.
//   unknown-ability       yes            REPAIR. Action dropped by the engine.
//                                        Generatable via an out-of-range
//                                        `normalIndex`; the prefix is still valid.
//   on-cooldown           yes            REPAIR. The canonical "too early"
//                                        case. Rejecting it discards an
//                                        otherwise-good prefix for a mistake
//                                        that is one array element long.
//   insufficient-energy   yes            REPAIR. Same shape as on-cooldown.
//   redundant-swap        yes            REPAIR. A no-op swap; dropping it is
//                                        exactly the right normalisation.
//   past-time-limit       yes            REPAIR. Everything after the window
//                                        closes is dropped. This is the
//                                        NORMAL terminal condition of a search
//                                        that fills its window, not a defect.
//   mismatched-ability    yes            REPAIR, and it is the one code the
//                                        optimizer can cause itself:
//                                        `generateCandidateActions` stamps
//                                        `abilityId` from a snapshot-time
//                                        resolution, and `abilityId` is
//                                        AUTHORITATIVE. If a stance expires or
//                                        the normal-string index advances
//                                        between generation and replay, the
//                                        stamped id no longer matches and the
//                                        engine drops the action. Repair keeps
//                                        the good prefix.
//   invalid-config        NO             Config-scoped (`actionIndex === -1`),
//                                        emitted once before any action. It was
//                                        NEVER caught by the old
//                                        `actionIndex >= 0` filter — verified:
//                                        `swapCost: -5` yields exactly one
//                                        warning at index -1 and the old
//                                        predicate returns false for it. It is
//                                        also not per-candidate: it is constant
//                                        across every node in the run, so
//                                        rejecting on it would reject the
//                                        ENTIRE search or nothing. Correctly
//                                        ignored here; the engine has already
//                                        clamped to a legal value.
//
// The unstructured `warnings` array is deliberately NOT consulted. It carries
// run-wide engine notices rather than per-candidate facts, so admitting on it
// would reject every node in a search or none of them.
//
// UPDATED (TASK #054): the example previously cited here was the
// `resumeFrom is not implemented` notice. That warning NO LONGER EXISTS —
// Phase B2 wired `resumeFrom`, and the optimizer now passes it on every node
// expansion (`optimizeRotation.ts`). The reasoning is unchanged and does not
// depend on that example; only the example was stale. Verified by grep that no
// such string remains in the engine.
// ============================================================================

/** A candidate's simulation, plus the rotation the engine actually executed. */
export interface AdmittedCandidate {
  /**
   * The proposed rotation with every skipped action removed. Equal to the
   * proposal by reference when nothing was skipped, so the common path
   * allocates nothing.
   */
  rotation: Rotation;
  /** True when at least one action was dropped, i.e. `rotation` was rebuilt. */
  repaired: boolean;
}

/**
 * Decides whether a candidate enters the beam, and with which rotation.
 *
 * Returns `undefined` to REJECT. Rejection is reserved for `errors` — the
 * engine routes only `unknown-character` there, an authoring fault that makes
 * the whole run meaningless. Every action-level warning is REPAIRED instead.
 *
 * A candidate whose actions were ALL skipped repairs to an empty rotation,
 * which carries no information the parent node does not already have, so it is
 * rejected as well.
 */
export function admitCandidate(
  proposed: Rotation,
  result: SimulationResult,
): AdmittedCandidate | undefined {
  if (result.errors.length > 0) {
    return undefined;
  }

  const skipped = skippedActionIndices(result.structuredWarnings);
  if (skipped === undefined) {
    // Hot path: nothing was dropped, reuse the caller's array as-is.
    return { rotation: proposed, repaired: false };
  }

  const repaired: Rotation = [];
  for (let i = 0; i < proposed.length; i++) {
    if (!skipped.has(i)) {
      repaired.push(proposed[i]!);
    }
  }

  if (repaired.length === 0) {
    return undefined;
  }
  return { rotation: repaired, repaired: true };
}

/**
 * Indices the engine skipped, or `undefined` when it skipped nothing.
 *
 * Returning `undefined` rather than an empty `Set` keeps the overwhelmingly
 * common case allocation-free — this runs once per simulated candidate, which
 * is the search's hottest loop.
 */
function skippedActionIndices(
  warnings: readonly SimulationWarning[],
): Set<number> | undefined {
  let skipped: Set<number> | undefined;
  for (let i = 0; i < warnings.length; i++) {
    const index = warnings[i]!.actionIndex;
    // `CONFIG_WARNING_ACTION_INDEX` is run-scoped, not an action, and the
    // engine has already clamped the offending value. It must not repair.
    if (index === CONFIG_WARNING_ACTION_INDEX) continue;
    skipped ??= new Set<number>();
    skipped.add(index);
  }
  return skipped;
}

/**
 * Legality invariant: a rotation the optimizer emits must run with ZERO
 * actions skipped.
 *
 * This is a STRONGER guarantee than the rejected-on-warning predicate it
 * replaces. The old check asked "did the proposal warn"; a repaired rotation is
 * re-simulated and asserted to warn about nothing, so what is emitted is proven
 * executable rather than merely proposed by a validator that agreed at
 * generation time.
 */
export function hasSkippedActions(result: SimulationResult): boolean {
  return skippedActionIndices(result.structuredWarnings) !== undefined;
}
