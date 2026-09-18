import type { CharacterDefinition, EnergyGainModifier, EnergyState } from "@/types";

// ============================================================================
// Per-character energy state.
//
// Owns creation, spending, and gaining of energy. The particle -> energy
// conversion itself lives in `particles.ts`; this module only applies the
// resulting amount and enforces the cap.
// ============================================================================

export function createEnergyState(
  def: CharacterDefinition,
  startWithFullEnergy = false,
): EnergyState {
  return {
    current: startWithFullEnergy ? def.maxEnergy : 0,
    max: def.maxEnergy,
    totalGained: 0,
    totalSpent: 0,
  };
}

/** Immutable copy — used when snapshotting for the optimizer / frontend. */
export function cloneEnergyState(state: EnergyState): EnergyState {
  return { ...state };
}

export function hasEnergy(state: EnergyState, cost: number, epsilon: number): boolean {
  return state.current >= cost - epsilon;
}

/** Spends energy, clamping at 0. Mutates in place (hot path). */
export function spendEnergy(state: EnergyState, cost: number): void {
  const spent = Math.min(state.current, cost);
  state.current -= spent;
  state.totalSpent += spent;
}

/** Adds energy, clamping at the character's cap. Mutates in place. */
export function gainEnergy(state: EnergyState, amount: number): void {
  if (amount <= 0) return;
  const gained = Math.min(amount, state.max - state.current);
  if (gained <= 0) return;
  state.current += gained;
  state.totalGained += gained;
}

/** Resolve a declarative gain adjustment. Invalid values fail closed. */
export function adjustedEnergyGain(
  amount: number,
  modifier: EnergyGainModifier = {},
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const multiplier = modifier.multiplier === undefined
    ? 1
    : Number.isFinite(modifier.multiplier) ? Math.max(0, modifier.multiplier) : 1;
  const flat = modifier.flat === undefined
    ? 0
    : Number.isFinite(modifier.flat) ? modifier.flat : 0;
  return Math.max(0, amount * multiplier + flat);
}

/** Applies a gain adjustment and returns the amount that passed the cap. */
export function gainEnergyWithModifier(
  state: EnergyState,
  amount: number,
  modifier?: EnergyGainModifier,
): number {
  const before = state.current;
  gainEnergy(state, adjustedEnergyGain(amount, modifier));
  return state.current - before;
}
