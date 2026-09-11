// ============================================================================

import type { Buff } from "@/simulation/buffs/types";
// Coordinated Attacks & Trigger Declarations.
//
// Models reactive / triggered effects (Xingqiu rain swords on normal attack,
// Yelan burst dice, Raiden eye on damage dealt, Fischl A4 on reaction, etc.)
// purely as declarative data.
// ============================================================================

/**
 * Combat event trigger categories supported by triggered effects.
 */
export type TriggerType =
  | "onNormalAttack"
  | "onChargedAttack"
  | "onSkillCast"
  | "onBurstCast"
  | "onDamageDealt"
  | "onReaction"
  /** Time-driven field proc, evaluated at each declared interval. */
  | "onInterval";

/**
 * Declaration of a triggered / coordinated effect.
 */
export interface TriggeredEffectDefinition<TAbility = unknown> {
  id: string;
  name: string;
  trigger: TriggerType;
  durationSeconds: number;
  icdSeconds: number;
  /** Interval for time-driven triggers. Required when trigger is onInterval. */
  intervalSeconds?: number;
  /** Whether the proc uses the creating cast's stat snapshot. */
  snapshotMode?: "cast" | "dynamic";
  maxProcs?: number;
  sourceCharacterId: string;
  /** Ability executed when this effect triggers (e.g. coordinated attack). */
  ability?: TAbility;
  /** Declarative buffs created after the triggered ability resolves. */
  buffs?: readonly Buff[];
}

/**
 * Floating-point tolerance for ICD comparison (1 nanosecond).
 * Prevents IEEE-754 precision issues (e.g. 1.0000000000000002 - 0.0000000000000003).
 */
const ICD_EPSILON = 1e-9;

/**
 * Pure helper to decide whether a triggered effect's internal cooldown (ICD) has elapsed.
 *
 * Rules:
 *  - `lastProcTime === undefined`: has not proc'd yet, so it can trigger (true).
 *  - `currentTime < lastProcTime`: time rewind / in the past (false).
 *  - `icdSeconds <= 0`: no ICD (true).
 *  - `currentTime - lastProcTime >= icdSeconds - ICD_EPSILON`: ICD elapsed (true).
 */
export function canTriggerProc(
  lastProcTime: number | undefined,
  currentTime: number,
  icdSeconds: number,
): boolean {
  if (lastProcTime === undefined) {
    return true;
  }
  if (currentTime < lastProcTime) {
    return false;
  }
  if (icdSeconds <= 0) {
    return true;
  }
  return currentTime - lastProcTime >= icdSeconds - ICD_EPSILON;
}

/**
 * State of an active trigger instance during simulation.
 */
export interface TriggerInstanceState {
  startTime: number;
  lastProcTime?: number;
  procCount: number;
}

/**
 * Check whether a triggered effect is still within its active duration and proc cap.
 */
export function isTriggerEffectActive(
  effect: TriggeredEffectDefinition,
  startTime: number,
  currentTime: number,
  procCount: number = 0,
): boolean {
  if (currentTime < startTime) return false;
  if (
    effect.durationSeconds !== Number.POSITIVE_INFINITY &&
    currentTime >= startTime + effect.durationSeconds
  ) {
    return false;
  }
  if (effect.maxProcs !== undefined && procCount >= effect.maxProcs) {
    return false;
  }
  return true;
}

/**
 * Pure state transition for testing and advancing a trigger proc.
 */
export function evaluateTriggerProc(
  effect: TriggeredEffectDefinition,
  state: TriggerInstanceState,
  currentTime: number,
): { canProc: boolean; nextState: TriggerInstanceState } {
  if (!isTriggerEffectActive(effect, state.startTime, currentTime, state.procCount)) {
    return { canProc: false, nextState: state };
  }
  if (!canTriggerProc(state.lastProcTime, currentTime, effect.icdSeconds)) {
    return { canProc: false, nextState: state };
  }
  return {
    canProc: true,
    nextState: {
      startTime: state.startTime,
      lastProcTime: currentTime,
      procCount: state.procCount + 1,
    },
  };
}
