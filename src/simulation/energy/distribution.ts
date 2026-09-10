import type { CharacterState, EnergyGainModifier, ParticleEmission } from "@/types";
import { particleEnergyFor } from "@/simulation/energy/particles";

// ============================================================================
// Particle distribution across a party.
//
// One ability emits ONE ParticleEmission; every party member receives energy
// from it. The on-field collector gets the full share, off-field members get
// the party-size-scaled share, and each receiver's own Energy Recharge and
// element apply to their own gain.
//
// This module answers "who gains how much"; it does not mutate state and does
// not know about the timeline. The engine applies the results and emits events,
// so the ordering of side effects stays in one place.
//
// Per-unit value, element multipliers and field shares all come from
// `constants.ts` via `particleEnergyFor` — this file adds no new game numbers.
//
// ENERGY-TIME SEAM
// ----------------
// Energy Recharge is a BUFFED stat: weapon passives, artifact sets and party
// buffs all move it. Reading it from `definition.baseStats` makes every such
// buff invisible to the energy path, which shifts burst availability and hence
// the whole rotation. So the ER used here is supplied by the caller through
// `energyRechargeFor`, which the engine implements by asking the SAME buff seam
// damage uses, at the collection timestamp.
//
// Resolution is per receiver AND per collection instant — not a rotation-start
// snapshot — so an ER buff that is live for only part of the rotation applies
// to exactly the particles collected inside its window.
// ============================================================================

/** Energy one specific character gains from one emission. */
export interface ParticleGain {
  characterId: string;
  /** Energy before the max-energy clamp (the clamp happens on apply). */
  amount: number;
  /** True when this character was on-field at collection time. */
  onField: boolean;
  /**
   * Energy Recharge actually applied to this gain, as a fraction (1.0 == 100%).
   * Exposed so a consumer can show WHY a gain differs from the unbuffed value
   * without re-deriving it (and so tests can assert the seam was consulted).
   */
  energyRecharge: number;
  /** Declarative party gain adjustment selected for this receiver. */
  modifier?: EnergyGainModifier;
}

/**
 * Resolves the Energy Recharge of one RECEIVER at the moment of collection.
 *
 * MUST be pure and deterministic — it sits in the simulation path.
 * Omitted => the receiver's unbuffed `baseStats.energyRecharge` is used, which
 * is exactly the pre-seam behaviour.
 */
export type EnergyRechargeResolver = (receiver: CharacterState) => number;
export type EnergyGainModifierResolver = (receiver: CharacterState) => EnergyGainModifier | undefined;

export interface DistributeParticlesInput {
  emission: ParticleEmission;
  /**
   * Every party member, in a stable order. Iteration order determines the
   * order of emitted energy events, so it must be deterministic — the engine
   * passes the team order.
   */
  party: readonly CharacterState[];
  /** Character on-field when the particles are collected, if any. */
  activeCharacterId: string | undefined;
  /** Party size used for off-field share scaling. */
  partySize: number;
  /**
   * Buff-folded ER lookup, evaluated once per receiver at this instant.
   * Defaults to unbuffed base ER.
   */
  energyRechargeFor?: EnergyRechargeResolver;
  energyGainModifierFor?: EnergyGainModifierResolver;
}

/** Unbuffed fallback: preserves behaviour for callers that pass no resolver. */
const baseEnergyRecharge: EnergyRechargeResolver = (receiver) =>
  receiver.definition.baseStats.energyRecharge;

/**
 * Computes each party member's gain from one emission.
 *
 * Deterministic and pure: output order follows `party` order, and every value
 * is a function of the inputs alone (given a pure `energyRechargeFor`).
 */
export function distributeParticles(
  input: DistributeParticlesInput,
): ParticleGain[] {
  const { emission, party, activeCharacterId, partySize } = input;
  const energyRechargeFor = input.energyRechargeFor ?? baseEnergyRecharge;
  const energyGainModifierFor = input.energyGainModifierFor;
  const gains: ParticleGain[] = [];

  for (const state of party) {
    const def = state.definition;
    const onField = def.id === activeCharacterId;
    // Each receiver's OWN (buff-folded) Energy Recharge scales what they collect.
    const energyRecharge = energyRechargeFor(state);
    const amount = particleEnergyFor({
      emission,
      receiverElement: def.element,
      onField,
      partySize,
      energyRecharge,
    });
    gains.push({
      characterId: def.id,
      amount,
      onField,
      energyRecharge,
      ...(energyGainModifierFor !== undefined
        ? { modifier: energyGainModifierFor(state) }
        : {}),
    });
  }

  return gains;
}
