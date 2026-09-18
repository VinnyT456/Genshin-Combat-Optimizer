import type { AbilityChargeSnapshot, CooldownState } from "@/types";

// ============================================================================
// Cooldown tracking.
//
// A cooldown map is abilityId -> absolute timestamp at which the ability is
// usable again. Absent key == ready. Kept trivially simple and pure so the
// engine and the optimizer's validation share exactly one implementation.
// ============================================================================

export type MutableCooldownState = Record<string, number>;
export type MutableAbilityChargeState = Record<string, AbilityChargeSnapshot>;

/** Timestamp at which `abilityId` becomes usable (0 == always was ready). */
export function availableAt(
  cooldowns: CooldownState,
  abilityId: string,
): number {
  return cooldowns[abilityId] ?? 0;
}

export function isReady(
  cooldowns: CooldownState,
  abilityId: string,
  time: number,
  epsilon: number,
): boolean {
  return time >= availableAt(cooldowns, abilityId) - epsilon;
}

/** Starts a cooldown. No-op for abilities with zero cooldown. */
export function startCooldown(
  cooldowns: MutableCooldownState,
  abilityId: string,
  time: number,
  duration: number,
): void {
  if (duration <= 0) return;
  cooldowns[abilityId] = time + duration;
}

/** Reset one ability immediately. Missing ids remain absent (ready). */
export function resetCooldown(
  cooldowns: MutableCooldownState,
  abilityId: string,
): void {
  delete cooldowns[abilityId];
}

/** Reset a stable list of abilities, useful for declarative effect payloads. */
export function resetCooldowns(
  cooldowns: MutableCooldownState,
  abilityIds: readonly string[],
): void {
  for (const abilityId of abilityIds) resetCooldown(cooldowns, abilityId);
}

export function cloneCooldownState(
  cooldowns: CooldownState,
): MutableCooldownState {
  return { ...cooldowns };
}

/** Creates charge state for the abilities that explicitly declare charges. */
export function createAbilityChargeState(
  abilities: readonly { id: string; charges?: { maxCharges: number; initialCharges?: number } }[],
): MutableAbilityChargeState {
  const result: MutableAbilityChargeState = {};
  for (const ability of abilities) {
    const definition = ability.charges;
    if (definition === undefined) continue;
    const max = Math.max(1, Math.trunc(definition.maxCharges));
    const initial = Math.min(
      max,
      Math.max(0, Math.trunc(definition.initialCharges ?? max)),
    );
    result[ability.id] = { current: initial, max, rechargeAt: [] };
  }
  return result;
}

/** Returns charge state after applying all recharges due at `time`. */
export function abilityChargesAt(
  state: AbilityChargeSnapshot,
  time: number,
): AbilityChargeSnapshot {
  const pending = state.rechargeAt.filter((at) => at > time + 1e-9);
  const recovered = state.rechargeAt.length - pending.length;
  return {
    current: Math.min(state.max, state.current + recovered),
    max: state.max,
    rechargeAt: pending,
  };
}

/** Reads one ability's usage state without mutating the caller's state. */
export function abilityChargeStateAt(
  states: Readonly<Record<string, AbilityChargeSnapshot>> | undefined,
  abilityId: string,
  time: number,
): AbilityChargeSnapshot | undefined {
  const state = states?.[abilityId];
  return state === undefined ? undefined : abilityChargesAt(state, time);
}

/** Consumes one charge and schedules its recharge at the resolved cooldown. */
export function consumeAbilityCharge(
  states: MutableAbilityChargeState,
  abilityId: string,
  time: number,
  cooldownSeconds: number,
): boolean {
  const current = states[abilityId];
  if (current === undefined) return true;
  const ready = abilityChargesAt(current, time);
  if (ready.current <= 0) return false;
  states[abilityId] = {
    current: ready.current - 1,
    max: ready.max,
    rechargeAt:
      cooldownSeconds > 0
        ? [...ready.rechargeAt, time + cooldownSeconds].sort((a, b) => a - b)
        : ready.rechargeAt,
  };
  return true;
}

/** Resets all uses of one charged ability immediately. */
export function resetAbilityCharges(
  states: MutableAbilityChargeState,
  abilityId: string,
): void {
  const current = states[abilityId];
  if (current === undefined) return;
  states[abilityId] = { ...current, current: current.max, rechargeAt: [] };
}

export function cloneAbilityChargeState(
  states: Readonly<Record<string, AbilityChargeSnapshot>> | undefined,
): MutableAbilityChargeState | undefined {
  if (states === undefined) return undefined;
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => [id, {
      ...state,
      rechargeAt: [...state.rechargeAt],
    }]),
  );
}
