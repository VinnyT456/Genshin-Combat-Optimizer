import type {
  CharacterState,
  ArtifactScheduledEvent,
  SimulationSnapshot,
} from "@/types";
import { cloneEnergyState } from "@/simulation/energy";
import { cloneCooldownState } from "@/simulation/cooldowns";
import { restoreEnemyAuras } from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";

// ============================================================================
// B2 — resuming a simulation from a checkpoint.
//
// `simulateRotation` already PRODUCES a `SimulationSnapshot` carrying every
// piece of cross-action state (energy, cooldowns, normal-string position, ICD
// counters, resources, stance, enemy aura). This module is the exact INVERSE:
// it pours a snapshot back into freshly-initialised state so a run can start
// at `snapshot.time` instead of at t=0.
//
// WHY THIS EXISTS: the optimizer expands a search tree of rotation prefixes.
// Without resume it must re-simulate every prefix from zero, which is O(W·D^2)
// engine work for width W and depth D. Resuming from the parent node's
// snapshot makes each expansion O(1) in prefix length, i.e. O(W·D) overall.
//
// ---------------------------------------------------------------------------
// EXACTNESS: resume is NOT byte-identical to simulate-from-zero, BY DESIGN.
//
// Aura decay is stored as `(gauge, since, decayRate)` and read as
//   gauge(t) = gauge(since) - (t - since) / decayRate
// A snapshot RE-ANCHORS `since` to the checkpoint time. In the reals,
// decaying 0->t1->t2 equals decaying 0->t2; in IEEE-754 it does not, because
// re-anchoring introduces a second rounding of the same quantity.
//
// The mechanics layer measured this and published the bound as
// `AURA_GAUGE_RELATIVE_TOLERANCE = 1e-9` (see `reactions/auraTolerance.ts`).
// That is a MEASURED composability bound, not a fitted fudge factor. Callers
// and tests must compare resumed vs from-zero runs within that relative
// tolerance and must NOT assert exact equality.
//
// Everything else in the snapshot (energy, cooldowns, ICD counters, resource
// values, string index) is carried exactly, so the tolerance applies to the
// aura channel alone and to damage that depends on it.
// ---------------------------------------------------------------------------
//
// Unknown character ids in the snapshot are IGNORED rather than fatal: a
// snapshot may legitimately come from a superset team (the optimizer evaluates
// subsets). Missing ids simply keep their freshly-initialised state, which is
// the honest "no prior history" answer.
// ============================================================================

/** State restored from a snapshot, ready to seed a run. */
export interface ResumedRunState {
  /** Clock (seconds) the run should start from. */
  clock: number;
  /** Character on-field at the checkpoint, if any. */
  activeCharacterId: string | undefined;
  /** Enemy aura store rebuilt from the snapshot. */
  enemyAuras: EnemyAuraStore;
  /** Ids present in the snapshot but absent from the team. */
  unknownCharacterIds: readonly string[];
  /** Active trigger instances copied from the checkpoint. */
  activeTriggers: readonly unknown[];
  /** Pending timed artifact events copied from checkpoint. */
  artifactEvents: readonly ArtifactScheduledEvent[];
  /** Runtime buffs created before the checkpoint. */
  runtimeBuffs: readonly unknown[];
  artifactTriggerState: Readonly<Record<string, { lastTriggered: number; count: number }>>;
}

/**
 * Pour `snapshot` into `states` (mutated in place) and return the run-level
 * state the caller should start from.
 *
 * Pure with respect to the snapshot: nothing in `snapshot` is retained by
 * reference in a way that lets a later mutation leak back into it. Energy,
 * cooldowns, ICD and resource bags are all copied.
 */
export function restoreFromSnapshot(
  states: ReadonlyMap<string, CharacterState>,
  snapshot: SimulationSnapshot,
): ResumedRunState {
  const unknownCharacterIds: string[] = [];

  // Sorted for deterministic warning order — `Object.keys` order is insertion
  // order, which depends on how the snapshot was built.
  for (const id of Object.keys(snapshot.characters).sort()) {
    const characterSnapshot = snapshot.characters[id]!;
    const state = states.get(id);
    if (state === undefined) {
      unknownCharacterIds.push(id);
      continue;
    }

    state.energy = cloneEnergyState(characterSnapshot.energy);
    state.cooldowns = cloneCooldownState(characterSnapshot.cooldowns);
    if (characterSnapshot.maxHp !== undefined) state.maxHp = characterSnapshot.maxHp;
    if (characterSnapshot.currentHp !== undefined) state.currentHp = characterSnapshot.currentHp;
    if (characterSnapshot.shielded !== undefined) state.shielded = characterSnapshot.shielded;

    // Absent means "no prior history" for each of these; leaving the
    // freshly-initialised value is exactly that, so only assign when present.
    if (characterSnapshot.normalStringIndex !== undefined) {
      state.normalStringIndex = characterSnapshot.normalStringIndex;
    }
    if (characterSnapshot.icd !== undefined) {
      state.icd = { ...characterSnapshot.icd };
    }
    if (characterSnapshot.resources !== undefined) {
      state.resources = { ...characterSnapshot.resources };
    }
    // A stance is a live window keyed on `startTime`; carrying it is what lets
    // a resumed run see a stance that is still running at the checkpoint.
    state.activeStance = characterSnapshot.activeStance
      ? {
          stance: characterSnapshot.activeStance.stance,
          startTime: characterSnapshot.activeStance.startTime,
          ...(characterSnapshot.activeStance.resourceSnapshots !== undefined
            ? { resourceSnapshots: { ...characterSnapshot.activeStance.resourceSnapshots } }
            : {}),
        }
      : undefined;
  }

  return {
    clock: snapshot.time,
    activeCharacterId: snapshot.activeCharacterId,
    enemyAuras: restoreEnemyAuras(snapshot.enemyAuras),
    unknownCharacterIds,
    activeTriggers: snapshot.activeTriggers?.map((entry) =>
      entry && typeof entry === "object"
        ? { ...(entry as Record<string, unknown>) }
        : entry,
    ) ?? [],
    artifactEvents: snapshot.artifactEvents?.map((event) => ({ ...event })) ?? [],
    runtimeBuffs: snapshot.runtimeBuffs?.map((buff) =>
      buff && typeof buff === "object" ? { ...(buff as Record<string, unknown>) } : buff,
    ) ?? [],
    artifactTriggerState: Object.fromEntries(
      Object.entries(snapshot.artifactTriggerState ?? {}).map(([key, value]) => [key, { ...value }]),
    ),
  };
}
