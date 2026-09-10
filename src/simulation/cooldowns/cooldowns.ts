import type { CooldownState } from "@/types";

// ============================================================================
// Cooldown tracking.
//
// A cooldown map is abilityId -> absolute timestamp at which the ability is
// usable again. Absent key == ready. Kept trivially simple and pure so the
// engine and the optimizer's validation share exactly one implementation.
// ============================================================================

export type MutableCooldownState = Record<string, number>;

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
