import type { Element, ParticleEmission } from "@/types";
import {
  OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE,
  OFF_FIELD_PARTICLE_SHARE_FALLBACK,
  PARTICLE_BASE_ENERGY,
  PARTICLE_COLORLESS_MULTIPLIER,
  PARTICLE_MATCHING_ELEMENT_MULTIPLIER,
  PARTICLE_OFF_ELEMENT_MULTIPLIER,
} from "@/simulation/energy/constants";

// ============================================================================
// Particle -> energy conversion (party-size scaled).
//
//   energy = count * baseEnergyPerUnit
//          * elementMultiplier(particleElement, receiverElement)
//          * fieldShare(onField, partySize)
//          * energyRecharge
//
// Every factor is sourced from `constants.ts`, several of which are marked
// UNCERTAIN there. Deterministic: no RNG.
// ============================================================================

/** Colourless particles are modelled with the `physical` element tag. */
const COLORLESS_ELEMENT: Element = "physical";

export function elementMultiplier(
  particleElement: Element,
  receiverElement: Element,
): number {
  if (particleElement === COLORLESS_ELEMENT) return PARTICLE_COLORLESS_MULTIPLIER;
  return particleElement === receiverElement
    ? PARTICLE_MATCHING_ELEMENT_MULTIPLIER
    : PARTICLE_OFF_ELEMENT_MULTIPLIER;
}

/** On-field collector receives full value; off-field members a party share. */
export function fieldShare(onField: boolean, partySize: number): number {
  if (onField) return 1;
  return (
    OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[partySize] ??
    OFF_FIELD_PARTICLE_SHARE_FALLBACK
  );
}

export interface ParticleEnergyInput {
  emission: ParticleEmission;
  receiverElement: Element;
  /** Is the receiver the on-field character when the particle is collected? */
  onField: boolean;
  partySize: number;
  /** Receiver's Energy Recharge as a fraction (1.0 == 100%). */
  energyRecharge: number;
}

/** Energy a single receiver gains from one particle emission. */
export function particleEnergyFor(input: ParticleEnergyInput): number {
  const { emission, receiverElement, onField, partySize, energyRecharge } = input;
  const perUnit = emission.baseEnergyPerUnit ?? PARTICLE_BASE_ENERGY;
  return (
    emission.count *
    perUnit *
    elementMultiplier(emission.element, receiverElement) *
    fieldShare(onField, partySize) *
    energyRecharge
  );
}
