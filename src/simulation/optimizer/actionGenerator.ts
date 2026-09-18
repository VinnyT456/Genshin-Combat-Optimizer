import type {
  ActionType,
  CharacterDefinition,
  CharacterState,
  RotationAction,
  SimulationConfig,
  SimulationResult,
  SimulationSnapshot,
} from "@/types";
import {
  allAbilities,
  declaredSkillInputVariants,
} from "@/simulation/character/character";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { liftCharacter } from "@/simulation/character/adapter";
import { createEnergyState } from "@/simulation/energy";
import {
  FIRST_NORMAL_STRING_INDEX,
  LEGACY_NORMAL_STRING_LENGTH,
} from "@/simulation/engine/actionSpace";
import { abilityForAction, validateAction } from "@/simulation/engine/validateAction";
import {
  cloneAbilityChargeState,
  createAbilityChargeState,
} from "@/simulation/cooldowns";

// ============================================================================
// Candidate Action Generation
//
// Generates and validates legal actions for the optimizer beam search.
// Respects active character on-field requirements, cooldowns, burst energy,
// swap costs, and simulation time limits.
//
// Pure TypeScript: no React, DOM, or IO.
// ============================================================================

// "normal" is generated separately: it is the one action type whose ability
// depends on a STRING POSITION, so it expands to one candidate per position
// rather than a single candidate.
const STANDARD_ABILITY_ACTION_TYPES: readonly ActionType[] = [
  "charged",
  "skill",
  "burst",
];

function pushSkillCandidates(
  out: RotationAction[],
  characterId: string,
  def: CharacterDefinition | GenericCharacterDefinition,
): void {
  if ("normalAttacks" in def) {
    const variants = declaredSkillInputVariants(def);
    if (variants.length > 0) {
      for (const skillVariant of variants) {
        out.push({ characterId, actionType: "skill", skillVariant });
      }
      return;
    }
  }
  out.push({ characterId, actionType: "skill" });
}

/**
 * How many distinct normal-attack positions a character can address.
 *
 * The legacy shape has a single `normalAttack` (an N1-only string); the generic
 * kit model carries the real N1..N5.
 */
function normalStringLength(
  def: CharacterDefinition | GenericCharacterDefinition,
): number {
  if ("normalAttacks" in def) {
    return Math.max(def.normalAttacks.hits.length, LEGACY_NORMAL_STRING_LENGTH);
  }
  return LEGACY_NORMAL_STRING_LENGTH;
}

/**
 * Emits one `normal` candidate per addressable string position, each with an
 * EXPLICIT `normalIndex`.
 *
 * Pinning the index is what makes "N2 without N1" proposable. Without it,
 * `actionType: "normal"` can only ever mean "whatever comes next", so every
 * other position is ungeneratable — invisible to pruning rather than rejected
 * by it. Out-of-range positions are not filtered here; `validateAction()` is
 * the single source of legality truth and rejects them.
 */
function pushNormalCandidates(
  out: RotationAction[],
  characterId: string,
  def: CharacterDefinition | GenericCharacterDefinition,
): void {
  const length = normalStringLength(def);
  for (let index = FIRST_NORMAL_STRING_INDEX; index < length; index++) {
    out.push({ characterId, actionType: "normal", normalIndex: index });
  }
}

/**
 * Converts a generic character definition into a minimal legacy CharacterDefinition
 * so it conforms to the CharacterState interface.
 */
function toLegacyDef(
  inputDef: CharacterDefinition | GenericCharacterDefinition,
): CharacterDefinition {
  if (!("normalAttacks" in inputDef)) {
    return inputDef;
  }
  const n1 = inputDef.normalAttacks.hits[0];
  const ca = inputDef.chargedAttack;
  const skill = inputDef.skill;
  const burst = inputDef.burst;

  return {
    id: inputDef.id,
    name: inputDef.name,
    element: inputDef.element,
    level: inputDef.level,
    baseStats: inputDef.baseStats,
    maxEnergy: inputDef.maxEnergy,
    normalAttack: {
      id: n1?.id ?? `${inputDef.id}-na`,
      name: n1?.name ?? "Normal Attack",
      actionType: "normal",
      element: inputDef.element,
      damageType: "normal",
      multiplier: 1.0,
      scaling: "atk",
      castTime: n1?.castTime ?? 0.5,
      cooldown: 0,
      energyCost: 0,
      energyGenerated: 0,
    },
    chargedAttack: {
      id: ca?.id ?? `${inputDef.id}-ca`,
      name: ca?.name ?? "Charged Attack",
      actionType: "charged",
      element: inputDef.element,
      damageType: "charged",
      multiplier: 1.0,
      scaling: "atk",
      castTime: ca?.castTime ?? 0.5,
      cooldown: 0,
      energyCost: 0,
      energyGenerated: 0,
    },
    elementalSkill: {
      id: skill.id,
      name: skill.name,
      actionType: "skill",
      element: inputDef.element,
      damageType: "skill",
      multiplier: 1.0,
      scaling: "atk",
      castTime: skill.castTime,
      cooldown: 0,
      energyCost: skill.energyCost,
      energyGenerated: skill.energyGenerated ?? 0,
    },
    elementalBurst: {
      id: burst.id,
      name: burst.name,
      actionType: "burst",
      element: inputDef.element,
      damageType: "burst",
      multiplier: 1.0,
      scaling: "atk",
      castTime: burst.castTime,
      cooldown: 0,
      energyCost: burst.energyCost,
      energyGenerated: burst.energyGenerated ?? 0,
    },
  };
}

/**
 * Reconstructs a runtime CharacterState map for `validateAction()` from a team definition
 * and simulation snapshot.
 */
export function buildCharacterStates(
  team: readonly (CharacterDefinition | GenericCharacterDefinition)[],
  snapshot: SimulationSnapshot,
): Map<string, CharacterState> {
  const states = new Map<string, CharacterState>();
  for (const charDef of team) {
    const isGeneric = "normalAttacks" in charDef;
    const genericDef: GenericCharacterDefinition = isGeneric
      ? charDef
      : liftCharacter(charDef);
    const legacyDef = toLegacyDef(charDef);

    const charSnap = snapshot.characters[charDef.id];
    const energy = charSnap ? charSnap.energy : createEnergyState(legacyDef);

    states.set(charDef.id, {
      definition: legacyDef,
      genericDefinition: genericDef,
      currentEnergy: energy.current,
      energy,
      cooldowns: charSnap ? { ...charSnap.cooldowns } : {},
      abilityCharges:
        charSnap?.abilityCharges !== undefined
          ? cloneAbilityChargeState(charSnap.abilityCharges)
          : createAbilityChargeState(allAbilities(genericDef)),
      normalStringIndex:
        charSnap?.normalStringIndex ?? FIRST_NORMAL_STRING_INDEX,
      resources: charSnap?.resources ? { ...charSnap.resources } : undefined,
      icd: charSnap?.icd ? { ...charSnap.icd } : undefined,
      activeStance: charSnap?.activeStance,
    });
  }
  return states;
}

/**
 * Generates all legal candidate actions for the current state of a rotation.
 *
 * Rules:
 * 1. Only on-field character can perform abilities (normal, charged, skill, burst, plunges).
 * 2. If no character is on-field yet (t=0), any team member can perform an initial action or swap.
 * 3. Swaps are only generated to other team members (prunes redundant self-swaps).
 * 4. Consecutive swaps (swap immediately after swap) are pruned early.
 * 5. Every candidate is verified through `validateAction()`, pruning cooldowns, energy deficits, etc.
 */
export function generateCandidateActions(
  team: readonly (CharacterDefinition | GenericCharacterDefinition)[],
  current: SimulationResult | SimulationSnapshot,
  simConfig?: SimulationConfig,
  lastAction?: RotationAction,
): RotationAction[] {
  if (team.length === 0) {
    return [];
  }

  const snapshot: SimulationSnapshot =
    "finalState" in current ? current.finalState : current;

  // Infer last action if not provided and current is a SimulationResult
  let effectiveLastAction = lastAction;
  if (
    !effectiveLastAction &&
    "timeline" in current &&
    current.timeline.length > 0
  ) {
    for (let i = current.timeline.length - 1; i >= 0; i--) {
      const ev = current.timeline[i]!;
      if (ev.type === "swap") {
        effectiveLastAction = { characterId: ev.characterId, actionType: "swap" };
        break;
      }
      if (ev.type === "damage") {
        break;
      }
    }
  }

  const states = buildCharacterStates(team, snapshot);
  const activeCharacterId = snapshot.activeCharacterId;
  const candidates: RotationAction[] = [];

  if (activeCharacterId === undefined) {
    // Rotation start: any team member can perform initial abilities or be swapped to.
    for (const charDef of team) {
      if (team.length > 1) {
        candidates.push({ characterId: charDef.id, actionType: "swap" });
      }
      pushNormalCandidates(candidates, charDef.id, charDef);
      for (const actionType of STANDARD_ABILITY_ACTION_TYPES) {
        if (actionType === "skill") {
          pushSkillCandidates(candidates, charDef.id, charDef);
        } else {
          candidates.push({ characterId: charDef.id, actionType });
        }
      }
      if ("normalAttacks" in charDef) {
        if (charDef.plungeLow) {
          candidates.push({ characterId: charDef.id, actionType: "plungeLow" });
        }
        if (charDef.plungeHigh) {
          candidates.push({ characterId: charDef.id, actionType: "plungeHigh" });
        }
      }
    }
  } else {
    // Active character on field: can perform abilities.
    const activeState = states.get(activeCharacterId);
    const activeDef =
      (activeState?.genericDefinition as
        | GenericCharacterDefinition
        | undefined) ?? activeState?.definition;

    if (activeDef) {
      pushNormalCandidates(candidates, activeCharacterId, activeDef);
    }
    for (const actionType of STANDARD_ABILITY_ACTION_TYPES) {
      if (actionType === "skill") {
        pushSkillCandidates(
          candidates,
          activeCharacterId,
          activeDef ?? states.get(activeCharacterId)?.definition ?? team[0]!,
        );
      } else {
        candidates.push({ characterId: activeCharacterId, actionType });
      }
    }

    if (activeDef && "normalAttacks" in activeDef) {
      if (activeDef.plungeLow) {
        candidates.push({
          characterId: activeCharacterId,
          actionType: "plungeLow",
        });
      }
      if (activeDef.plungeHigh) {
        candidates.push({
          characterId: activeCharacterId,
          actionType: "plungeHigh",
        });
      }
    }

    // Swaps to other team members:
    // Prune redundant swap (active character cannot swap to self).
    // Prune consecutive swaps (do not swap immediately after another swap).
    if (team.length > 1 && effectiveLastAction?.actionType !== "swap") {
      for (const charDef of team) {
        if (charDef.id !== activeCharacterId) {
          candidates.push({ characterId: charDef.id, actionType: "swap" });
        }
      }
    }
  }

  // Validate candidates against the engine's single source of truth
  const validActions: RotationAction[] = [];
  for (const candidate of candidates) {
    const verdict = validateAction({
      action: candidate,
      states,
      time: snapshot.time,
      activeCharacterId,
      config: simConfig ?? {},
    });

    if (!verdict.valid) {
      continue;
    }

    if (candidate.actionType === "swap") {
      validActions.push(candidate);
    } else {
      const state = states.get(candidate.characterId)!;
      const def =
        (state.genericDefinition as GenericCharacterDefinition | undefined) ??
        state.definition;
      const ability = abilityForAction(def, candidate, state, snapshot.time);
      if (ability) {
        validActions.push({
          ...candidate,
          abilityId: ability.id,
        });
      } else {
        validActions.push(candidate);
      }
    }
  }

  return validActions;
}
