import type {
  AbilityDefinition,
  BuffContext,
  BuffResolver,
  CharacterState,
  EnemyState,
  SimulationSnapshot,
} from "@/types";
import { resolveStats } from "@/simulation/engine/buffSeam";
import type { EnergyRechargeResolver } from "@/simulation/energy";

// ============================================================================
// Energy-time seam.
//
// Third seam, alongside `buffSeam.ts` (stat side) and `enemySeam.ts` (enemy
// side). It exists because Energy Recharge is a BUFFED stat but was being read
// straight off `definition.baseStats`, so no weapon passive, artifact set or
// party buff could ever influence energy gain — burst timing was computed
// against the wrong ER and the whole rotation shifted, silently.
//
// Following the precedent set by `enemySeam.ts`, this does NOT change the
// frozen `BuffResolver` signature. It reuses it verbatim and only supplies a
// different context: `character` is the RECEIVER collecting the particle rather
// than the caster, because ER belongs to whoever collects.
//
// "Energy-time" is the point: the resolver is invoked at the collection
// timestamp, once per receiver, per emission — never a rotation-start snapshot.
// A buff live for only part of the rotation therefore applies to exactly the
// particles collected inside its window.
//
// Determinism: pure function of its inputs, evaluated in `party` order.
// ============================================================================

export interface EnergyRechargeSeamInput {
  /** Collection instant (seconds) — the same clock value as the emitting hit. */
  time: number;
  /** Ability that emitted the particles (the CASTER's ability, not the receiver's). */
  ability: AbilityDefinition;
  /** Character on-field at collection time, if any. */
  activeCharacterId: string | undefined;
  /** Immutable party state at `time`, shared with the damage-side context. */
  snapshot: SimulationSnapshot;
  enemy: EnemyState;
  /** Mechanics hook; undefined => unbuffed base ER (pre-seam behaviour). */
  resolver: BuffResolver | undefined;
}

/**
 * Builds the per-receiver ER lookup handed to `distributeParticles`.
 *
 * Returns `undefined` when no resolver is configured, so the energy module
 * takes its unbuffed default path and results stay byte-identical to before.
 */
export function makeEnergyRechargeResolver(
  input: EnergyRechargeSeamInput,
): EnergyRechargeResolver | undefined {
  const { resolver } = input;
  if (resolver === undefined) return undefined;

  return (receiver: CharacterState): number => {
    // Receiver-centric context: buff targeting (`self` / `characters` scopes)
    // and per-character `%` bases must key off whoever COLLECTS the particle.
    const context: BuffContext = {
      time: input.time,
      character: receiver.definition,
      ability: input.ability,
      activeCharacterId: input.activeCharacterId,
      snapshot: input.snapshot,
      enemy: input.enemy,
    };
    return resolveStats(receiver.definition.baseStats, context, resolver)
      .energyRecharge;
  };
}
