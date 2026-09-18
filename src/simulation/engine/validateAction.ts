import type {
  AbilityDefinition,
  ActionValidation,
  CharacterDefinition,
  CharacterState,
  RotationAction,
  SimulationConfig,
} from "@/types";
import {
  skillForInputVariant,
  type GenericCharacterDefinition,
} from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { energyCostOf } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { EPSILON } from "@/simulation/engine/constants";
import {
  FIRST_NORMAL_STRING_INDEX,
  normalStringIndexOf,
} from "@/simulation/engine/actionSpace";
import {
  abilityChargeStateAt,
  availableAt,
  isReady,
} from "@/simulation/cooldowns";
import { hasEnergy } from "@/simulation/energy";
import { resourceValueAt } from "@/simulation/character/runtime";

// ============================================================================
// Action validation — the SINGLE source of truth.
//
// `simulateRotation` calls this for every action, and the optimizer calls the
// same function to prune illegal branches. Never fork this logic: if the two
// ever disagree the optimizer will emit rotations the engine refuses to run.
//
// Pure: reads state, mutates nothing.
// ============================================================================

/**
 * Resolves the ability an action refers to, or undefined for swap/unknown.
 *
 * Supports both generic and legacy character models, as well as active stance
 * overrides.
 */
export function abilityForAction(
  def: CharacterDefinition | GenericCharacterDefinition,
  action: RotationAction,
  state?: {
    normalStringIndex?: number;
    activeStance?: import("@/types").ActiveStanceState;
    resources?: import("@/types").ResourceSnapshotState;
  },
  time?: number,
): AbilityDefinition | KitAbility | undefined {
  if (action.actionType === "swap") {
    return undefined;
  }

  // A tap/hold selector is meaningful only for an Elemental Skill. Rejecting
  // it here keeps malformed persisted rotations from silently changing the
  // meaning of another action type.
  if (action.skillVariant !== undefined && action.actionType !== "skill") {
    return undefined;
  }

  // Active stance replacement check: if a stance is active, it maps the action
  // to the stance's replacement ability.
  const activeStance = state?.activeStance as
    | import("@/types").ActiveStanceState<
        StanceDefinition<NormalAttackString, KitAbility>
      >
    | undefined;
  const isStanceActive =
    activeStance !== undefined &&
    (time === undefined ||
      time < activeStance.startTime + activeStance.stance.durationSeconds);

  const stance = isStanceActive ? activeStance.stance : undefined;

  const replacementResources = stance === undefined
    ? []
    : [
        ...(stance.replacementResourceCost === undefined
          ? []
          : [stance.replacementResourceCost]),
        ...(stance.replacementResourceCosts ?? []),
      ];
  const replacementResourceAvailable = replacementResources.every((replacementResource) =>
    resourceValueAt(
      state?.resources?.[replacementResource.resourceId],
      time ?? 0,
    ) >= (replacementResource.minimum ?? replacementResource.amount),
  );

  if (action.actionType === "normal" && stance?.normalAttacks && replacementResourceAvailable) {
    const index = action.normalIndex ?? normalStringIndexOf(state ?? {});
    return stance.normalAttacks.hits[index];
  }
  if (action.actionType === "charged" && stance?.chargedAttack) {
    return stance.chargedAttack;
  }
  if (action.actionType === "plungeLow" && stance?.plungeLow) {
    return stance.plungeLow;
  }
  if (action.actionType === "plungeHigh" && stance?.plungeHigh) {
    return stance.plungeHigh;
  }
  if (action.actionType === "skill" && stance?.skill) {
    // Stance replacement Skills do not currently declare tap/hold variants;
    // do not silently turn an explicitly selected input into the replacement.
    return action.skillVariant === undefined ? stance.skill : undefined;
  }
  if (action.actionType === "burst" && stance?.burst) {
    return stance.burst;
  }

  // Base character resolution:
  if ("normalAttacks" in def) {
    // GenericCharacterDefinition
    switch (action.actionType) {
      case "normal": {
        const index = action.normalIndex ?? normalStringIndexOf(state ?? {});
        return def.normalAttacks.hits[index];
      }
      case "charged":
        return def.chargedAttack;
      case "plungeLow":
        return def.plungeLow;
      case "plungeHigh":
        return def.plungeHigh;
      case "skill":
        return skillForInputVariant(def, action.skillVariant);
      case "burst":
        return def.burst;
    }
  } else {
    // Legacy CharacterDefinition
    switch (action.actionType) {
      case "normal":
        return (action.normalIndex ?? FIRST_NORMAL_STRING_INDEX) ===
          FIRST_NORMAL_STRING_INDEX
          ? def.normalAttack
          : undefined;
      case "charged":
        return def.chargedAttack;
      case "skill":
        return def.elementalSkill;
      case "burst":
        return def.elementalBurst;
      case "plungeLow":
      case "plungeHigh":
        return undefined;
    }
  }
}

/**
 * Returns whether an explicit id is the old editor-generated id for the
 * requested slot. Before stateful slot resolution was wired through the
 * editor, saved actions carried the character's base id even when a stance or
 * constellation replaced that slot. Treat only those known base-slot ids as
 * legacy slot metadata; arbitrary mismatches remain hard validation errors.
 */
function isAuthoredBaseSlotAbilityId(
  def: CharacterDefinition | GenericCharacterDefinition,
  action: RotationAction,
): boolean {
  const abilityId = action.abilityId;
  if (abilityId === undefined || !("normalAttacks" in def)) return false;

  switch (action.actionType) {
    case "normal":
      // The old editor always wrote the first legacy normal id and did not
      // pin normalIndex. Accept any base normal id in that unpinned form so
      // repeated authored N actions can follow the runtime string.
      return action.normalIndex === undefined &&
        def.normalAttacks.hits.some((ability) => ability.id === abilityId);
    case "charged":
      return def.chargedAttack?.id === abilityId;
    case "plungeLow":
      return def.plungeLow?.id === abilityId;
    case "plungeHigh":
      return def.plungeHigh?.id === abilityId;
    case "skill":
      return skillForInputVariant(def, action.skillVariant)?.id === abilityId;
    case "burst":
      return def.burst.id === abilityId;
    case "swap":
      return false;
  }
}

export interface ValidateActionInput {
  action: RotationAction;
  /** Every character's current state, keyed by character id. */
  states: ReadonlyMap<string, CharacterState>;
  /** Current simulation clock in seconds. */
  time: number;
  /** Character currently on-field, if any. */
  activeCharacterId?: string;
  config: SimulationConfig;
}

export function validateAction(input: ValidateActionInput): ActionValidation {
  const { action, states, time, activeCharacterId, config } = input;

  const state = states.get(action.characterId);
  if (!state) {
    return {
      valid: false,
      code: "unknown-character",
      reason: `Character "${action.characterId}" is not in the team.`,
    };
  }
  const def =
    (state.genericDefinition as GenericCharacterDefinition | undefined) ??
    state.definition;

  // Time bound applies to every action type.
  if (config.timeLimit !== undefined && time >= config.timeLimit - EPSILON) {
    return {
      valid: false,
      code: "past-time-limit",
      reason:
        `Action at ${time.toFixed(2)}s exceeds the ` +
        `${config.timeLimit.toFixed(2)}s time limit.`,
    };
  }

  if (action.actionType === "swap") {
    // Swapping to the character already on-field does nothing but burn time.
    if (activeCharacterId === def.id) {
      return {
        valid: false,
        code: "redundant-swap",
        reason: `${def.name} is already on-field.`,
      };
    }
    return { valid: true };
  }

  const ability = abilityForAction(def, action, state, time);
  if (!ability) {
    return {
      valid: false,
      code: "unknown-ability",
      reason: `Unknown action "${action.actionType}" for ${def.name}.`,
    };
  }

  // `abilityId` is authoritative when supplied. Checked AFTER resolution so an
  // unresolvable actionType still reports `unknown-ability` (the more specific
  // authoring error) rather than a mismatch.
  if (
    action.abilityId !== undefined &&
    action.abilityId !== ability.id &&
    !isAuthoredBaseSlotAbilityId(def, action)
  ) {
    return {
      valid: false,
      code: "mismatched-ability",
      reason:
        `${def.name} action "${action.actionType}" resolves to ability ` +
        `"${ability.id}", but the rotation specified "${action.abilityId}". ` +
        `Omit abilityId to use the slot ability.`,
    };
  }

  const genericAbility = "instances" in ability ? ability : undefined;
  const chargeState =
    genericAbility?.charges === undefined
      ? undefined
      : state.abilityCharges === undefined
        ? {
            current: genericAbility.charges.initialCharges ?? genericAbility.charges.maxCharges,
            max: genericAbility.charges.maxCharges,
            rechargeAt: [],
          }
        : abilityChargeStateAt(state.abilityCharges, ability.id, time);

  if (chargeState !== undefined) {
    if (chargeState.current <= 0) {
      const ready = chargeState.rechargeAt.find((at) => at > time + EPSILON);
      return {
        valid: false,
        code: "on-cooldown",
        reason:
          `${def.name} ${ability.name} has no charges available ` +
          `(attempted at ${time.toFixed(2)}s).`,
        ...(ready !== undefined ? { availableAt: ready } : {}),
      };
    }
  } else if (!isReady(state.cooldowns, ability.id, time, EPSILON)) {
    const ready = availableAt(state.cooldowns, ability.id);
    return {
      valid: false,
      code: "on-cooldown",
      reason:
        `${def.name} ${ability.name} is on cooldown until ${ready.toFixed(2)}s ` +
        `(attempted at ${time.toFixed(2)}s).`,
      availableAt: ready,
    };
  }

  const energyCost =
    genericAbility === undefined ? ability.energyCost : energyCostOf(genericAbility);
  if (energyCost > 0 && !hasEnergy(state.energy, energyCost, EPSILON)) {
    return {
      valid: false,
      code: "insufficient-energy",
      reason:
        `${def.name} ${ability.name} needs ${energyCost} energy but has ` +
        `${state.energy.current.toFixed(1)}.`,
    };
  }

  for (const cost of genericAbility?.cost?.resources ?? []) {
    const current = resourceValueAt(state.resources?.[cost.resourceId], time);
    if (current + EPSILON >= cost.amount) continue;
    return {
      valid: false,
      code: "insufficient-resource",
      reason:
        `${def.name} ${ability.name} needs at least ${cost.amount} ` +
        `${cost.resourceId} but has ${current.toFixed(1)}.`,
    };
  }

  return { valid: true };
}
