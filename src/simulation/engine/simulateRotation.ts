import type {
  ActiveStanceState,
  BaseStats,
  BuffContext,
  CharacterDefinition,
  CharacterSnapshot,
  CharacterState,
  CombatEvent,
  EnemyModifiers,
  EnemyState,
  Rotation,
  SimulationConfig,
  SimulationResult,
  SimulationSnapshot,
  SimulationWarning,
  Stats,
  ArtifactStateEffect,
  DamageType,
  ActionType,
  ArtifactScheduledEvent,
  HealingEvent,
  PickupEvent,
  ResourceEvent,
  ParticleEmission,
} from "@/types";
import { CONFIG_WARNING_ACTION_INDEX, impliedBaseStats, withBaseStats } from "@/types";
import { computeDamage } from "@/simulation/damage/pipeline";
import {
  DEFAULT_SWAP_COST_SECONDS,
  EPSILON,
  MIN_SWAP_COST_SECONDS,
} from "@/simulation/engine/constants";
import { resolveStats } from "@/simulation/engine/buffSeam";
import { resolveEnemyModifiers } from "@/simulation/engine/enemySeam";
import { makeEnergyRechargeResolver } from "@/simulation/engine/energySeam";
import { abilityForAction, validateAction } from "@/simulation/engine/validateAction";
import {
  FIRST_NORMAL_STRING_INDEX,
  advanceNormalStringIndex,
  normalStringIndexOf,
  resolveNormalStringIndex,
} from "@/simulation/engine/actionSpace";
import {
  cloneAbilityChargeState,
  cloneCooldownState,
  consumeAbilityCharge,
  createAbilityChargeState,
  resetCooldowns,
  startCooldown,
} from "@/simulation/cooldowns";
import {
  cloneEnergyState,
  createEnergyState,
  distributeParticles,
  gainEnergyWithModifier,
  spendEnergy,
} from "@/simulation/energy";
import { allAbilities } from "@/simulation/character/character";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { liftAbility, liftCharacter } from "@/simulation/character/adapter";
import { cooldownFor, planAbility, talentLevelFor } from "@/simulation/character/execution";
import { talentValueAt } from "@/simulation/character/talent";
import type { PlannedHit } from "@/simulation/character/execution";
import type {
  KitAbility,
  NormalAttackString,
  ResourceScalingTerm,
  HealingDefinition,
  HealthChangeDefinition,
  PartyHpDamageBonus,
  ResourceTransferDefinition,
} from "@/simulation/character/kit";
import { energyCostOf } from "@/simulation/character/kit";
import {
  applyStateEffect,
  applyStateEffects,
  createResourceStates,
  resourceValueAt,
} from "@/simulation/character/runtime";
import {
  resolveReactions,
  snapshotEnemyAuras,
} from "@/simulation/engine/reactionSeam";
import type { EnemyAuraStore } from "@/simulation/engine/reactionSeam";
import {
  advanceReactionTicks,
  createReactionTickQueue,
  restoreReactionTicks,
  scheduleElectroCharged,
  snapshotReactionTicks,
} from "@/simulation/engine/reactionTicks";
import type {
  FiredReactionTick,
  ReactionTickQueue,
} from "@/simulation/engine/reactionTicks";
import { restoreFromSnapshot } from "@/simulation/engine/resume";
import { resolveTalentLevelBoosts } from "@/simulation/engine/talentLevelSeam";
import { harvestTeamPerkBuffs } from "@/simulation/engine/perkBuffs";
import { withEquipmentBuffs } from "@/simulation/engine/equipmentBuffs";
import { harvestTeamResonanceBuffs } from "@/simulation/engine/teamResonance";
import { withHarvestedBuffs } from "@/simulation/engine/composeResolvers";
import { harvestTeamEquipmentBuffs } from "@/simulation/engine/equipmentBuffs";
import { makeBuffResolver } from "@/simulation/buffs/makeBuffResolver";
import type { Buff } from "@/simulation/buffs/types";
import type { TransformativeInstance } from "@/simulation/reactions/resolver";
import { resolveInfusedElement } from "@/simulation/reactions/infusions";
import type { InfusionDefinition } from "@/simulation/reactions/infusions";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { createStanceBuff } from "@/simulation/buffs/types";
import { applyActiveConversions } from "@/simulation/buffs/conversions";
import type { TriggeredEffectDefinition, TriggerType } from "@/simulation/buffs/triggers";
import { canTriggerProc, isTriggerEffectActive } from "@/simulation/buffs/triggers";
import { applyHealingEvent, pickupEventRecord, resourceEventRecord } from "@/simulation/engine/stateEvents";

// ============================================================================
// Combat engine
//
// Event-driven, deterministic timeline simulation. Walks the rotation action by
// action, advancing a virtual clock by each action's cast time, and emits
// CombatEvents (damage / swap / energy). Legality is decided exclusively by
// `validateAction()` — the same function the optimizer calls — so engine and
// optimizer can never disagree. Illegal actions produce warnings and are
// skipped rather than throwing.
//
// Buffs are folded in through the `buffResolver` seam owned by the mechanics
// layer; the default is a no-op.
//
// No randomness: damage uses expected-value crit by default. No React, DOM, or
// I/O — pure function, safe to run in a Web Worker or a tight optimizer loop.
// ============================================================================

export interface ActiveInfusionEntry {
  infusion: InfusionDefinition;
  startTime: number;
}

export type TypedActiveStance = ActiveStanceState<
  StanceDefinition<NormalAttackString, KitAbility>
>;

export function getTypedStance(
  state: CharacterState,
): TypedActiveStance | undefined {
  return state.activeStance as TypedActiveStance | undefined;
}

/**
 * Resolve declarative resource terms into ordinary scaling terms at the point
 * the hit is authored to read them. A cast snapshot is retained on the active
 * stance so a resource consumed by the burst still powers every Musou Isshin
 * hit for the full stance window.
 */
function materializeResourceScaling(
  hit: PlannedHit,
  state: CharacterState,
  castTime: number,
  castResourceSnapshots?: Readonly<Record<string, number>>,
): PlannedHit | undefined {
  const terms = hit.resourceScaling;
  if (terms === undefined || terms.length === 0) return hit;

  const stance = getTypedStance(state);
  const additions = terms.flatMap((term: ResourceScalingTerm) => {
    const snapshotValue =
      term.snapshot === "cast"
        ? stance?.resourceSnapshots?.[term.resourceId] ?? castResourceSnapshots?.[term.resourceId]
        : term.snapshot === "action"
          ? castResourceSnapshots?.[term.resourceId]
        : undefined;
    const resource = state.resources?.[term.resourceId];
    const value =
      snapshotValue ??
      resourceValueAt(resource, term.snapshot === "cast" ? castTime : hit.timestamp);
    const stacks = Math.min(
      term.maxStacks ?? Number.POSITIVE_INFINITY,
      Math.max(0, value - (term.threshold ?? 0)),
    );
    if (!Number.isFinite(stacks) || !Number.isFinite(term.multiplierPerStack) || stacks === 0) {
      return [];
    }
    return [{ stat: term.stat, multiplier: term.multiplierPerStack * stacks }];
  });

  // A pure resource-scaled instance is a conditional hit, not a zero-damage
  // event. For example, Skirk's C1 crystal blade is not summoned when no
  // Void Rift was absorbed by the cast.
  if (additions.length === 0 && hit.scaling.length === 0) return undefined;

  return {
    ...hit,
    scaling: additions.length > 0 ? [...hit.scaling, ...additions] : hit.scaling,
    resourceScaling: undefined,
  };
}

function captureResourceSnapshots(
  state: CharacterState,
  time: number,
): Readonly<Record<string, number>> {
  const values: Record<string, number> = {};
  for (const [id, resource] of Object.entries(state.resources ?? {})) {
    values[id] = resourceValueAt(resource, time);
  }
  return values;
}

export interface ActiveTriggerEntry {
  trigger: TriggeredEffectDefinition<KitAbility>;
  startTime: number;
  lastProcTime?: number;
  procCount: number;
  /** Next scheduled time for a time-driven trigger. */
  nextProcTime?: number;
  /** Creating-cast snapshot for effects with snapshotMode=cast. */
  snapshot?: SimulationSnapshot;
}

function initCharacterState(
  inputDef: CharacterDefinition | GenericCharacterDefinition,
  startWithFullEnergy = false,
): CharacterState {
  const isGeneric = "normalAttacks" in inputDef;
  const genericDef: GenericCharacterDefinition = isGeneric
    ? inputDef
    : liftCharacter(inputDef);

  const legacyDef: CharacterDefinition = isGeneric
    ? {
        id: inputDef.id,
        name: inputDef.name,
        element: inputDef.element,
        level: inputDef.level,
        baseStats: inputDef.baseStats,
        maxEnergy: inputDef.maxEnergy,
        weaponType: inputDef.weaponType,
        normalAttack: {
          id: inputDef.normalAttacks.hits[0]?.id ?? `${inputDef.id}-na`,
          name: inputDef.normalAttacks.hits[0]?.name ?? "Normal Attack",
          actionType: "normal",
          element: inputDef.element,
          damageType: "normal",
          multiplier: 1.0,
          scaling: "atk",
          castTime: inputDef.normalAttacks.hits[0]?.castTime ?? 0.5,
          cooldown: 0,
          energyCost: 0,
          energyGenerated: 0,
        },
        chargedAttack: {
          id: inputDef.chargedAttack?.id ?? `${inputDef.id}-ca`,
          name: inputDef.chargedAttack?.name ?? "Charged Attack",
          actionType: "charged",
          element: inputDef.element,
          damageType: "charged",
          multiplier: 1.0,
          scaling: "atk",
          castTime: inputDef.chargedAttack?.castTime ?? 0.5,
          cooldown: 0,
          energyCost: 0,
          energyGenerated: 0,
        },
        elementalSkill: {
          id: inputDef.skill.id,
          name: inputDef.skill.name,
          actionType: "skill",
          element: inputDef.element,
          damageType: "skill",
          multiplier: 1.0,
          scaling: "atk",
          castTime: inputDef.skill.castTime,
          cooldown: 0,
          energyCost: inputDef.skill.energyCost,
          energyGenerated: inputDef.skill.energyGenerated ?? 0,
        },
        elementalBurst: {
          id: inputDef.burst.id,
          name: inputDef.burst.name,
          actionType: "burst",
          element: inputDef.element,
          damageType: "burst",
          multiplier: 1.0,
          scaling: "atk",
          castTime: inputDef.burst.castTime,
          cooldown: 0,
          energyCost: inputDef.burst.energyCost,
          energyGenerated: inputDef.burst.energyGenerated ?? 0,
        },
      }
    : inputDef;

  const energy = createEnergyState(legacyDef, startWithFullEnergy);
  return {
    definition: legacyDef,
    genericDefinition: genericDef,
    energy,
    cooldowns: {},
    normalStringIndex: FIRST_NORMAL_STRING_INDEX,
    resources: createResourceStates(
      genericDef.resources,
      0,
      startWithFullEnergy,
    ),
    abilityCharges: createAbilityChargeState(allAbilities(genericDef)),
    icd: {},
    activeStance: undefined,
  };
}

function snapshotCharacter(state: CharacterState): CharacterSnapshot {
  return {
    characterId: state.definition.id,
    energy: cloneEnergyState(state.energy),
    ...(state.maxHp !== undefined ? { maxHp: state.maxHp } : {}),
    ...(state.currentHp !== undefined ? { currentHp: state.currentHp } : {}),
    ...(state.shielded !== undefined ? { shielded: state.shielded } : {}),
    cooldowns: cloneCooldownState(state.cooldowns),
    ...(state.abilityCharges !== undefined && Object.keys(state.abilityCharges).length > 0
      ? { abilityCharges: cloneAbilityChargeState(state.abilityCharges) }
      : {}),
    normalStringIndex: normalStringIndexOf(state),
    icd: state.icd ? { ...state.icd } : undefined,
    resources: state.resources ? { ...state.resources } : undefined,
    activeStance: state.activeStance
      ? {
          stance: state.activeStance.stance,
          startTime: state.activeStance.startTime,
          ...(state.activeStance.resourceSnapshots !== undefined
            ? { resourceSnapshots: { ...state.activeStance.resourceSnapshots } }
            : {}),
        }
      : undefined,
  };
}

function snapshot(
  states: ReadonlyMap<string, CharacterState>,
  time: number,
  activeCharacterId: string | undefined,
  activeTriggers?: readonly ActiveTriggerEntry[],
  activeInfusions?: readonly ActiveInfusionEntry[],
  reactionTickQueue?: ReactionTickQueue,
  enemyAuras?: EnemyAuraStore,
  artifactEvents?: readonly ArtifactScheduledEvent[],
  healingHistory?: readonly HealingEvent[],
  runtimeBuffs?: readonly Buff[],
  artifactTriggerState?: Readonly<Record<string, { lastTriggered: number; count: number }>>,
): SimulationSnapshot {
  const characters: Record<string, CharacterSnapshot> = {};
  for (const [id, state] of states) characters[id] = snapshotCharacter(state);
  const auras =
    enemyAuras !== undefined ? snapshotEnemyAuras(enemyAuras) : undefined;
  const reactionTicks =
    reactionTickQueue !== undefined
      ? snapshotReactionTicks(reactionTickQueue)
      : undefined;
  return {
    time,
    activeCharacterId,
    characters,
    ...(auras !== undefined ? { enemyAuras: auras } : {}),
    ...(activeTriggers !== undefined && activeTriggers.length > 0
      ? { activeTriggers: [...activeTriggers] }
      : {}),
    ...(activeInfusions !== undefined && activeInfusions.length > 0
      ? { activeInfusions: [...activeInfusions] }
      : {}),
    ...(reactionTicks !== undefined ? { reactionTicks } : {}),
    ...(artifactEvents !== undefined && artifactEvents.length > 0
      ? { artifactEvents: artifactEvents.map((event) => ({ ...event })) }
      : {}),
    ...(healingHistory !== undefined && healingHistory.length > 0
      ? { healingHistory: healingHistory.map((event) => ({ ...event })) }
      : {}),
    ...(runtimeBuffs !== undefined && runtimeBuffs.length > 0
      ? { runtimeBuffs: runtimeBuffs.map((buff) => ({ ...buff })) }
      : {}),
    ...(artifactTriggerState !== undefined && Object.keys(artifactTriggerState).length > 0
      ? { artifactTriggerState: Object.fromEntries(Object.entries(artifactTriggerState).map(([key, value]) => [key, { ...value }])) }
      : {}),
  };
}

/**
 * The stat bag handed to the buff resolver for one character.
 *
 * Attaches the BASE channel (`Stats.base`) so that every downstream consumer —
 * the mechanics buff resolver, stat conversions, stance modifiers — can apply
 * `base * (1 + pct) + flat` correctly instead of skipping percentages or
 * scaling them off final.
 *
 * If a definition already carries `base` (i.e. gear has been folded in by an
 * equipment layer, which sets final ATK = charBase + weaponBase + ... while
 * keeping `base` = charBase + weaponBase), it is respected as-is. Otherwise the
 * self-base assumption applies: an ungeared character's final IS its base.
 */
export function statsWithBase(definitionStats: Stats): Stats {
  if (definitionStats.base !== undefined) return definitionStats;
  return withBaseStats(definitionStats, impliedBaseStats(definitionStats));
}

/**
 * Resolve a buff that references its producer's Base ATK into an ordinary
 * flat-ATK modifier. Bennett's Burst is the first consumer: its field grants
 * a percentage of Bennett's Base ATK to every target, so treating it as a
 * recipient ATK% would scale from the wrong character.
 */
function materializeRuntimeBuff(
  buff: Buff,
  sourceState: CharacterState,
  config: SimulationConfig,
  startTime: number,
): Buff {
  const sourcePercent = buff.sourceBaseAtkPercent;
  if (sourcePercent === undefined || !Number.isFinite(sourcePercent)) {
    return { ...buff, startTime };
  }
  const sourceStats = characterStatsFor(
    sourceState.definition.id,
    sourceState.definition.baseStats,
    config,
  );
  const sourceBaseAtk = sourceStats.base?.atk ?? impliedBaseStats(sourceState.definition.baseStats).atk;
  const value = sourceBaseAtk * sourcePercent;
  const { sourceBaseAtkPercent: _omitted, ...withoutSourcePercent } = buff;
  void _omitted;
  return {
    ...withoutSourcePercent,
    startTime,
    modifiers: [
      ...(buff.modifiers ?? []),
      ...(Number.isFinite(value) ? [{ stat: "atkFlat" as const, value }] : []),
    ],
  };
}

/**
 * The pre-buff stat bag for one character: their equipped stats when the
 * caller supplied any, otherwise their intrinsic definition stats.
 *
 * Equipped bags already carry the BASE channel (`resolveEquippedStats` attaches
 * it), so `statsWithBase` leaves them untouched and the self-base assumption
 * applies only to genuinely ungeared characters.
 */
function characterStatsFor(
  characterId: string,
  definitionStats: Stats,
  config: SimulationConfig,
): Stats {
  return statsWithBase(config.equippedStats?.[characterId] ?? definitionStats);
}

/**
 * Base values a stance's percentage modifiers scale.
 *
 * Prefers the BASE channel carried by the resolved stat bag (`stats.base`),
 * which is the character's true base ATK/HP/DEF plus weapon base ATK. Falls
 * back to the character definition's own stat bag, which is correct precisely
 * when no gear is equipped (`final == base`) — the state of every existing
 * fixture, so this fallback preserves prior behaviour exactly.
 *
 * The fallback must NEVER be `stats` itself: that is the already-buffed final
 * bag, and scaling ATK% off it is the on-final bug.
 */
export function stanceBaseFor(stats: Stats, definitionStats: Stats): BaseStats {
  return stats.base ?? impliedBaseStats(definitionStats);
}

function applyStanceStats(
  stats: Stats,
  stance: StanceDefinition<NormalAttackString, KitAbility>,
  definitionStats: Stats,
  characterId: string,
  startTime: number,
): Stats {
  const baseStats = stanceBaseFor(stats, definitionStats);
  let result = stats;
  if (stance.modifiers && stance.modifiers.length > 0) {
    result = {
      ...result,
      elementalDmgBonus: { ...result.elementalDmgBonus },
      ...(result.baseDmgMultiplier !== undefined
        ? { baseDmgMultiplier: { ...result.baseDmgMultiplier } }
        : {}),
    };
    for (const mod of stance.modifiers) {
      switch (mod.stat) {
        case "atkFlat":
          result.atk += mod.value;
          break;
        case "hpFlat":
          result.hp += mod.value;
          break;
        case "defFlat":
          result.def += mod.value;
          break;
        case "atkPercent":
          result.atk += baseStats.atk * mod.value;
          break;
        case "hpPercent":
          result.hp += baseStats.hp * mod.value;
          break;
        case "defPercent":
          result.def += baseStats.def * mod.value;
          break;
        case "elementalMastery":
          result.elementalMastery += mod.value;
          break;
        case "critRate":
          result.critRate += mod.value;
          break;
        case "critDmg":
          result.critDmg += mod.value;
          break;
        case "energyRecharge":
          result.energyRecharge += mod.value;
          break;
        case "dmgBonus":
          result.dmgBonus += mod.value;
          break;
        case "flatDamageBonus":
          result.flatDamageBonus = (result.flatDamageBonus ?? 0) + mod.value;
          break;
        case "baseDmgMultiplier":
          if (mod.damageType !== undefined) {
            result.baseDmgMultiplier = {
              ...(result.baseDmgMultiplier ?? {}),
              [mod.damageType]: (result.baseDmgMultiplier?.[mod.damageType] ?? 1) + mod.value,
            };
          }
          break;
        case "elementalDmgBonus":
          if (mod.element !== undefined) {
            const cur = result.elementalDmgBonus[mod.element] ?? 0;
            result.elementalDmgBonus[mod.element] = cur + mod.value;
          }
          break;
      }
    }
  }

  if (stance.conversions && stance.conversions.length > 0) {
    const activeBuff = {
      buff: createStanceBuff(stance, characterId, startTime),
      stacks: 1,
    };
    result = applyActiveConversions(result, [activeBuff], baseStats);
  }

  return result;
}

function evaluateTriggers(
  triggerType: TriggerType,
  currentTime: number,
  activeTriggers: ActiveTriggerEntry[],
  states: ReadonlyMap<string, CharacterState>,
  activeInfusions: ActiveInfusionEntry[],
  castSnapshot: SimulationSnapshot,
  enemy: EnemyState,
  config: SimulationConfig,
  timeline: CombatEvent[],
  enemyAuras: EnemyAuraStore,
  tickQueue: ReactionTickQueue,
  runtimeBuffs: Buff[],
  activeCharacterId?: string,
  onParticleEmission?: (
    sourceCharacterId: string,
    timestamp: number,
    ability: KitAbility,
    emission: ParticleEmission,
  ) => void,
  onDamageDealt?: (
    sourceCharacterId: string,
    timestamp: number,
    element: CharacterDefinition["element"],
  ) => void,
  onReaction?: (
    sourceCharacterId: string,
    timestamp: number,
    reactionKinds: readonly string[],
  ) => void,
  onHealthChange?: (
    change: HealthChangeDefinition,
    sourceCharacterId: string,
    timestamp: number,
  ) => void,
  partyHpDamageBonus?: (bonus: PartyHpDamageBonus | undefined) => number,
  eventSourceCharacterId?: string,
  eventAbilityId?: string,
  eventDamageType?: DamageType,
  eventElement?: CharacterDefinition["element"],
  onTriggeredHealing?: (
    healing: HealingDefinition,
    sourceCharacterId: string,
    timestamp: number,
  ) => void,
  excludedTriggerIds?: ReadonlySet<string>,
): number {
  let totalDamage = 0;
  for (const entry of activeTriggers) {
    if (entry.trigger.trigger !== triggerType) continue;
    if (excludedTriggerIds?.has(entry.trigger.id)) continue;
    const sourceState = states.get(entry.trigger.sourceCharacterId);
    if (!sourceState) continue;
    if (
      entry.trigger.eventSourceCharacterId !== undefined &&
      entry.trigger.eventSourceCharacterId !== eventSourceCharacterId
    ) continue;
    if (
      entry.trigger.excludeEventSourceCharacterId &&
      eventSourceCharacterId === entry.trigger.sourceCharacterId
    ) continue;
    if (
      entry.trigger.eventSourceMustBeActive &&
      eventSourceCharacterId !== activeCharacterId
    ) continue;
    if (
      entry.trigger.eventAbilityIds !== undefined &&
      (eventAbilityId === undefined || !entry.trigger.eventAbilityIds.includes(eventAbilityId))
    ) continue;
    if (
      entry.trigger.eventDamageTypes !== undefined &&
      (eventDamageType === undefined || !entry.trigger.eventDamageTypes.includes(eventDamageType))
    ) continue;
    if (
      entry.trigger.eventElements !== undefined &&
      (eventElement === undefined || !entry.trigger.eventElements.includes(eventElement))
    ) continue;
    if (entry.trigger.requiredResourceMinimum !== undefined) {
      const required = entry.trigger.requiredResourceMinimum;
      const value = resourceValueAt(sourceState.resources?.[required.resourceId], currentTime);
      if (value < required.amount) continue;
    }
    if (
      !isTriggerEffectActive(
        entry.trigger,
        entry.startTime,
        currentTime,
        entry.procCount,
      )
    ) {
      continue;
    }
    if (
      !canTriggerProc(
        entry.lastProcTime,
        currentTime,
        entry.trigger.icdSeconds,
      )
    ) {
      continue;
    }

    if (
      triggerType === "onInterval" &&
      (entry.nextProcTime === undefined ||
        currentTime < entry.nextProcTime - 1e-9)
    ) {
      continue;
    }

    entry.lastProcTime = currentTime;
    entry.procCount++;
    if (triggerType === "onInterval" && entry.trigger.intervalSeconds !== undefined) {
      entry.nextProcTime = currentTime + entry.trigger.intervalSeconds;
    }

    const sourceGeneric = sourceState.genericDefinition as GenericCharacterDefinition;
    const sourceDef = sourceState.definition;

    if (entry.trigger.stateEffects && entry.trigger.stateEffects.length > 0) {
      sourceState.resources = applyStateEffects(
        sourceState.resources ?? {},
        entry.trigger.stateEffects,
        currentTime,
      );
      for (const effect of entry.trigger.stateEffects) {
        const value = sourceState.resources[effect.resourceId]?.value;
        timeline.push(resourceEventRecord({
          timestamp: currentTime,
          sourceCharacterId: sourceDef.id,
          resourceId: effect.resourceId,
          kind: effect.kind,
          amount: effect.amount,
          ...(value !== undefined ? { value } : {}),
        }));
      }
    }

    const generatedEnergy = (entry.trigger.energyGenerated ?? 0) +
      (entry.trigger.energyGeneratedBySourceStat === undefined
        ? 0
        : Math.max(0, characterStatsFor(sourceDef.id, sourceDef.baseStats, config).critRate) *
          entry.trigger.energyGeneratedBySourceStat.ratio);
    if (generatedEnergy > 0 && Number.isFinite(generatedEnergy)) {
      const applied = gainEnergyWithModifier(
        sourceState.energy,
        generatedEnergy,
        config.energyGainModifier,
      );
      if (applied > 0) {
        timeline.push({
          timestamp: currentTime,
          type: "energy",
          characterId: sourceDef.id,
          description: `${sourceDef.name} gains ${applied.toFixed(2)} energy from ${entry.trigger.name}`,
          energy: sourceState.energy.current,
          energyByCharacter: Object.fromEntries(
            [...states.entries()].map(([id, state]) => [id, state.energy.current]),
          ),
        });
      }
    }

    for (const healing of entry.trigger.healing ?? []) {
      onTriggeredHealing?.(healing, sourceDef.id, currentTime);
    }
    for (const change of entry.trigger.hpChangesBeforeHit ?? []) {
      onHealthChange?.(change, sourceDef.id, currentTime);
    }

    const procAbility = entry.trigger.ability;
    if (!procAbility) {
      for (const effect of entry.trigger.stateEffectsAfterAbility ?? []) {
        sourceState.resources = applyStateEffects(
          sourceState.resources ?? {},
          [effect],
          currentTime,
        );
        const value = sourceState.resources[effect.resourceId]?.value;
        timeline.push(resourceEventRecord({
          timestamp: currentTime,
          sourceCharacterId: sourceDef.id,
          resourceId: effect.resourceId,
          kind: effect.kind,
          amount: effect.amount,
          ...(value !== undefined ? { value } : {}),
        }));
      }
      continue;
    }

    sourceState.icd = sourceState.icd ?? {};
    const procHits = planAbility({
      character: sourceGeneric,
      ability: procAbility,
      startTime: currentTime,
      icd: sourceState.icd,
    });

    for (const plannedHit of procHits) {
      const hit = materializeResourceScaling(plannedHit, sourceState, currentTime);
      if (hit === undefined) continue;
      for (const change of hit.hpChangesBeforeHit ?? []) {
        onHealthChange?.(change, sourceDef.id, hit.timestamp);
      }
      const effectiveElement = resolveInfusedElement(
        hit.element,
        hit.damageType,
        activeInfusions,
        hit.timestamp,
      );

      // A coordinated hit is still a real damage event. Re-run only the
      // consume-before-hit layer so effects such as Escoffier's Cold Dish can
      // empower the coordinated hit itself. The currently executing trigger
      // is excluded to prevent a self-recursive declaration from looping.
      const nestedExcludedTriggerIds = new Set(excludedTriggerIds ?? []);
      nestedExcludedTriggerIds.add(entry.trigger.id);
      totalDamage += evaluateTriggers(
        "onDamageDealtBeforeHit",
        hit.timestamp,
        activeTriggers,
        states,
        activeInfusions,
        castSnapshot,
        enemy,
        config,
        timeline,
        enemyAuras,
        tickQueue,
        runtimeBuffs,
        activeCharacterId,
        onParticleEmission,
        onDamageDealt,
        onReaction,
        onHealthChange,
        partyHpDamageBonus,
        sourceDef.id,
        hit.abilityId,
        hit.damageType,
        effectiveElement,
        onTriggeredHealing,
        nestedExcludedTriggerIds,
      );

      const buffContext: BuffContext = {
        time: hit.timestamp,
        character: sourceDef,
        ability: {
          id: hit.abilityId,
          name: hit.abilityName,
          actionType: "skill",
          element: effectiveElement,
          damageType: hit.damageType,
          multiplier: 0,
          scaling: "atk",
          castTime: 0,
          cooldown: 0,
          energyCost: hit.damageType === "burst"
            ? sourceDef.elementalBurst.energyCost
            : 0,
          energyGenerated: 0,
        },
        activeCharacterId,
        snapshot: entry.snapshot ?? castSnapshot,
        enemy,
      };

      let stats = resolveStats(
        characterStatsFor(sourceDef.id, sourceDef.baseStats, config),
        buffContext,
        config.buffResolver,
      );
      const enemyModifiers = resolveEnemyModifiers(
        buffContext,
        config.enemyModifierResolver,
      );

      const sourceStance = getTypedStance(sourceState);
      if (
        sourceStance &&
        hit.timestamp <
          sourceStance.startTime +
            sourceStance.stance.durationSeconds
      ) {
        stats = applyStanceStats(
          stats,
          sourceStance.stance,
          characterStatsFor(sourceDef.id, sourceDef.baseStats, config),
          sourceDef.id,
          sourceStance.startTime,
        );
      }

      const reaction = resolveReactions({
        store: enemyAuras,
        enemy,
        element: effectiveElement,
        gauge: hit.gauge,
        appliesElement: hit.appliesElement,
        time: hit.timestamp,
        stats: {
          level: sourceDef.level,
          elementalMastery: stats.elementalMastery,
          // ReactionBonus (Crimson Witch 4pc, Mona C1, Thundering Fury 4pc,
          // Viridescent Venerer 4pc) rides the buff-resolved stat bag, so it
          // is read at HIT time and respects buff windows.
          reactionBonus: stats.reactionBonus,
        },
        enemyModifiers,
      });

      const damage = computeDamage({
        timestamp: hit.timestamp,
        sourceCharacterId: sourceDef.id,
        hit,
        element: effectiveElement,
        stats,
        characterLevel: sourceDef.level,
        enemy,
        config,
        additionalDmgBonus: partyHpDamageBonus?.(hit.partyHpDamageBonus) ?? 0,
        enemyModifiers,
        reaction: {
          additiveBaseDamageBonus: reaction.additiveBaseDamageBonus,
          amplifyingMultiplier: reaction.amplifyingMultiplier,
        },
      });

      onReaction?.(sourceDef.id, hit.timestamp, reaction.reactionKinds ?? []);

      timeline.push({
        timestamp: hit.timestamp,
        type: "damage",
        characterId: sourceDef.id,
        description: `${sourceDef.name} ${hit.abilityName}`,
        damage,
      });
      onDamageDealt?.(sourceDef.id, hit.timestamp, effectiveElement);

      emitTransformative(
        timeline,
        reaction.transformative,
        hit.timestamp,
        sourceDef.id,
        sourceDef.name,
        hit.abilityId,
      );
      totalDamage += damage.finalDamage;
      totalDamage += reaction.transformative.reduce(
        (sum, instance) => sum + Math.max(0, Number.isFinite(instance.damage) ? instance.damage : 0),
        0,
      );

      scheduleReactionTicks(
        tickQueue,
        reaction.transformative,
        enemyAuras,
        enemy,
        hit.timestamp,
        sourceDef.id,
        sourceDef.name,
        sourceDef.level,
        stats,
        enemyModifiers,
      );
    }
    for (const effect of entry.trigger.stateEffectsAfterAbility ?? []) {
      sourceState.resources = applyStateEffects(
        sourceState.resources ?? {},
        [effect],
        currentTime,
      );
      const value = sourceState.resources[effect.resourceId]?.value;
      timeline.push(resourceEventRecord({
        timestamp: currentTime,
        sourceCharacterId: sourceDef.id,
        resourceId: effect.resourceId,
        kind: effect.kind,
        amount: effect.amount,
        ...(value !== undefined ? { value } : {}),
      }));
    }
    for (const buff of entry.trigger.buffs ?? []) {
      runtimeBuffs.push(
        materializeRuntimeBuff(buff, sourceState, config, currentTime),
      );
    }
    if (procAbility.particles !== undefined) {
      onParticleEmission?.(
        sourceDef.id,
        currentTime,
        procAbility,
        procAbility.particles,
      );
    }
  }
  return totalDamage;
}

/**
 * Start an Electro-Charged tick series if this hit produced one.
 *
 * EC is the only reaction with an INDEPENDENT clock: after the triggering hit
 * it keeps ticking on its own once per second, including through idle time and
 * past the final authored action. The triggering hit's own damage instance is
 * emitted by the ordinary transformative path exactly as before; this only
 * registers the FOLLOW-UP series, so wiring it in cannot change the value of
 * any hit that already existed.
 *
 * Attribution and pricing inputs are captured from the TRIGGER, matching how
 * transformative damage is priced everywhere else in this engine.
 */
function scheduleReactionTicks(
  queue: ReactionTickQueue,
  reactions: readonly TransformativeInstance[],
  store: EnemyAuraStore,
  enemy: EnemyState,
  time: number,
  characterId: string,
  characterName: string,
  characterLevel: number,
  stats: Stats,
  enemyModifiers: EnemyModifiers,
): void {
  if (!reactions.some((instance) => instance.kind === "electroCharged")) return;
  scheduleElectroCharged({
    queue,
    store,
    enemyId: enemy.id,
    time,
    sourceCharacterId: characterId,
    sourceCharacterName: characterName,
    triggerLevel: characterLevel,
    triggerElementalMastery: stats.elementalMastery,
    reactionBonus: stats.reactionBonus?.electroCharged ?? 0,
    enemyModifiers,
  });
}

/**
 * Drain every reaction tick due at or before `untilTime` and push one timeline
 * event per tick.
 *
 * Called BEFORE anything else that happens at `untilTime` — see CONTRACT 1 in
 * `reactionTicks.ts`: a tick and a hit at the same instant resolve tick-first,
 * deterministically, because the tick was caused earlier.
 */
function drainReactionTicks(
  queue: ReactionTickQueue,
  store: EnemyAuraStore,
  enemy: EnemyState,
  untilTime: number,
  timeline: CombatEvent[],
): number {
  const fired: FiredReactionTick[] = advanceReactionTicks({
    queue,
    store,
    enemy,
    untilTime,
  });
  let totalDamage = 0;
  for (const tick of fired) {
    totalDamage += Math.max(0, Number.isFinite(tick.damage) ? tick.damage : 0);
    timeline.push({
      timestamp: tick.time,
      type: "damage",
      characterId: tick.sourceCharacterId,
      description: `${tick.sourceCharacterName} ${tick.kind}`,
      damage: {
        timestamp: tick.time,
        sourceCharacterId: tick.sourceCharacterId,
        // Suffixed with `:tick` so a follow-up tick is aggregated separately
        // from the triggering instance, the same way `emitTransformative`
        // separates a reaction from the ability that caused it.
        abilityId: `${tick.kind}:tick`,
        abilityName: tick.kind,
        element: tick.resElement,
        damageType: "reaction",
        rawDamage: tick.damage,
        finalDamage: tick.damage,
        nonCritDamage: tick.damage,
        critDamage: tick.damage,
      },
    });
  }
  return totalDamage;
}

/**
 * Emit one damage event per transformative reaction.
 *
 * Transformative damage is its own instance: it does not crit, does not scale
 * with the trigger's DMG% or ATK, and already has RES applied by the mechanics
 * layer. It is therefore built directly rather than passed through
 * `computeDamage()`, which would re-apply DEF/RES/crit that do not belong.
 *
 * Ability id is suffixed with the reaction kind so `damageByAbility` separates
 * "the skill" from "the overload the skill caused" instead of merging them.
 */
function emitTransformative(
  timeline: CombatEvent[],
  instances: readonly TransformativeInstance[],
  timestamp: number,
  characterId: string,
  characterName: string,
  abilityId: string,
): number {
  let totalDamage = 0;
  for (const instance of instances) {
    const damage = Math.max(0, Number.isFinite(instance.damage) ? instance.damage : 0);
    totalDamage += damage;
    timeline.push({
      timestamp,
      type: "damage",
      characterId,
      description: `${characterName} ${instance.kind}`,
      damage: {
        timestamp,
        sourceCharacterId: characterId,
        abilityId: `${abilityId}:${instance.kind}`,
        abilityName: instance.kind,
        element: instance.resElement,
        damageType: "reaction",
        rawDamage: damage,
        finalDamage: damage,
        nonCritDamage: damage,
        critDamage: damage,
      },
    });
  }
  return totalDamage;
}

/**
 * Absolute per-character energy at this instant. Attached to every energy
 * event so a consumer can render a whole party without accumulating deltas.
 */
function energyByCharacter(
  states: ReadonlyMap<string, CharacterState>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, state] of states) out[id] = state.energy.current;
  return out;
}

export function simulateRotation(
  team: (CharacterDefinition | GenericCharacterDefinition)[],
  rotation: Rotation,
  enemy: EnemyState,
  inputConfig: SimulationConfig = {},
): SimulationResult {
  // Constellation / passive buffs are harvested from the team and COMPOSED
  // into the mechanics seams before anything reads `config`. Without this the
  // roster's 259 talent-level boosts are real data with no effect on damage:
  // `config.talentLevelResolver` was read below and supplied by nobody.
  //
  // Gating is NOT re-derived here — `withPerkBuffs` walks
  // `activeConstellations()` / `unlockedPassives()`, so a C6 buff on a C0
  // character is never in the list to begin with.
  //
  // Weapon passives and artifact set bonuses enter the SAME way, from
  // `config.equipmentBuffs`: the owned REFINEMENT's buffs are selected (never
  // R1-by-default) and a set's buffs are gated on its actual PIECE COUNT, so a
  // 4pc bonus is absent at 3 pieces. Composed, not chained-over: perk buffs,
  // equipment buffs and any caller-supplied resolver all coexist.
  // Harvest the team's static perk list once per run. The same list is needed
  // both for the live resolver and for the max-HP gate below; collecting it a
  // second time was pure overhead on every optimizer candidate.
  const teamPerkBuffs = harvestTeamPerkBuffs(team);
  const config: SimulationConfig = withHarvestedBuffs(
    withEquipmentBuffs(
      team.map((def) => def.id),
      withHarvestedBuffs(inputConfig, teamPerkBuffs),
    ),
    harvestTeamResonanceBuffs(team),
  );
  // NaN has no ordering relation with any timestamp. Treat it as the
  // smallest horizon so malformed callers cannot silently disable the event
  // bound and drain every pending tick. Preserve Infinity as unbounded.
  const timeLimit =
    config.timeLimit !== undefined && Number.isNaN(config.timeLimit)
      ? 0
      : config.timeLimit !== undefined && config.timeLimit === Number.NEGATIVE_INFINITY
        ? 0
        : config.timeLimit;
  const runtimeBuffs: Buff[] = [];

  const errors: string[] = [];
  const warnings: string[] = [];
  const structuredWarnings: SimulationWarning[] = [];
  const timeline: CombatEvent[] = [];
  // Enemy HP is optional for backwards compatibility. When a scenario
  // provides it, keep a deterministic runtime value so threshold artifact
  // effects (for example Brave Heart's >50% bonus) turn off at the correct
  // hit instead of reading a stale initial value forever.
  let trackedEnemyHp = enemy.currentHp ?? enemy.maxHp;
  const applyEnemyDamage = (amount: number): void => {
    if (trackedEnemyHp === undefined || !Number.isFinite(amount)) return;
    trackedEnemyHp = Math.max(0, trackedEnemyHp - Math.max(0, amount));
  };
  const enemyAtHit = (): EnemyState =>
    trackedEnemyHp === undefined
      ? enemy
      : { ...enemy, maxHp: enemy.maxHp ?? trackedEnemyHp, currentHp: trackedEnemyHp };

  const states = new Map<string, CharacterState>();
  for (const def of team) {
    const state = initCharacterState(def, config.startWithFullEnergy === true);
    // Start combat at full HP with no shield. This gives HP/shield-gated
    // artifact effects a real, deterministic initial state while preserving
    // optional scenario overrides through `resumeFrom`.
    const initialStats = characterStatsFor(def.id, def.baseStats, config);
    state.maxHp = initialStats.hp;
    state.currentHp = initialStats.hp;
    state.shielded = false;
    states.set(def.id, state);
  }

  // Healing artifacts consume an explicit, deterministic event stream. The
  // event stream is optional, so this state is inert for every existing run.
  const healingEvents: HealingEvent[] = [...(config.healingEvents ?? [])].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const healingEffects = config.healingArtifactEffects ?? [];
  const healingBonusFor = (sourceCharacterId: string): number => {
    const seen = new Set<string>();
    const hasExplicitGenericBonus = healingEffects.some(
      (effect) =>
      effect.sourceCharacterId === sourceCharacterId &&
        effect.kind === "healingBonus",
    );
    let total = 0;
    for (const effect of healingEffects) {
      if (effect.sourceCharacterId !== sourceCharacterId) continue;
      // One equipped set must not double-count if it is surfaced through
      // both compatibility and runtime equipment channels.
      // Tier-specific generic healing bonuses use distinct keys so a 2pc
      // bonus and a 4pc bonus can add together. Legacy descriptors without a
      // tier remain deduplicated by kind for backwards compatibility.
      const effectKey =
        effect.kind === "healingBonus"
          ? `${effect.kind}:${effect.healingBonus}`
          : effect.kind;
      if (seen.has(effectKey)) continue;
      seen.add(effectKey);
      // Generated 4pc Clam/Song descriptors retain their historical
      // `healingBonus` field for API compatibility. Their 2pc bonus is now
      // emitted separately as `healingBonus`; count one copy only.
      if (
        hasExplicitGenericBonus &&
        (effect.kind === "oceanHuedClam" || effect.kind === "songOfDaysPast")
      ) {
        continue;
      }
      // Both healing artifact sets publish the same sourced +15% 2pc bonus.
      // Keep the fallback for hand-authored runtime descriptors used by API
      // callers; generated descriptors carry the value explicitly.
      const sourcedBonus = effect.healingBonus ?? 0.15;
      total += Number.isFinite(sourcedBonus)
        ? Math.max(0, sourcedBonus)
        : 0;
    }
    return total;
  };
  const healingReceivedBonusFor = (targetCharacterId: string, time: number): number => {
    const seen = new Set<string>();
    let total = 0;
    for (const effect of healingEffects) {
      const appliesToTarget = effect.sourceCharacterId === targetCharacterId ||
        (effect.kind === "conditionalHealingReceivedBonus" && effect.targetScope === "party");
      if (!appliesToTarget) continue;
      const isConditional = effect.kind === "conditionalHealingReceivedBonus";
      if (effect.kind !== "healingReceivedBonus" && !isConditional) continue;
      if (isConditional) {
        const resource = states.get(effect.sourceCharacterId)?.resources?.[effect.resourceId];
        if (resourceValueAt(resource, time) < 1) continue;
      }
      const key = isConditional
        ? `${effect.kind}:${effect.healingBonus}:${effect.resourceId}`
        : `${effect.kind}:${effect.healingBonus}`;
      if (seen.has(key)) continue;
      seen.add(key);
      total += Number.isFinite(effect.healingBonus) ? Math.max(0, effect.healingBonus) : 0;
    }
    return total;
  };
  // This is a runtime history, rather than a pre-normalized copy of the input.
  // Healing can trigger state effects (Marechaussee) and only events that have
  // happened by the current clock may feed Clam/Song conversions.
  const normalizedHealingEvents: HealingEvent[] = [
    ...(config.resumeFrom?.healingHistory ?? []),
  ].map((event) => ({ ...event }));
  let healingIndex = 0;
  const hasSongOfDaysPast = healingEffects.some(
    (effect) => effect.kind === "songOfDaysPast",
  );
  const lastHealingTime = (): number | undefined =>
    normalizedHealingEvents.at(-1)?.timestamp;
  const storedHealing = (): number =>
    Math.min(15_000, normalizedHealingEvents.reduce((total, event) => total + event.amount, 0));
  let songUses = 0;

  function songBonusForHit(timestamp: number, damageType: string): number {
    if (
      !hasSongOfDaysPast ||
      lastHealingTime() === undefined ||
      storedHealing() <= 0 ||
      timestamp < lastHealingTime()! + 6 ||
      timestamp > lastHealingTime()! + 16 ||
      songUses >= 5 ||
      !["normal", "charged", "plunge", "skill", "burst"].includes(damageType)
    ) return 0;
    songUses += 1;
    return storedHealing() * 0.08;
  }

  const activeInfusions: ActiveInfusionEntry[] = [];
  const activeTriggers: ActiveTriggerEntry[] = [];
  // Per-enemy aura, owned by this run. Mutated in place by the reaction seam.
  let enemyAuras: EnemyAuraStore = {};
  // Time-driven reaction ticks (Electro-Charged today). Interleaved into the
  // action walk below; see `reactionTicks.ts` for the ordering/checkpoint/
  // horizon contracts this depends on.
  let tickQueue: ReactionTickQueue = createReactionTickQueue();
  // Pending artifact lifecycle events must exist before checkpoint restore so
  // resumed healing/energy schedules can be seeded without temporal gaps.
  const scheduledArtifactEvents: ArtifactScheduledEvent[] = [];

  // B2 — resume from a checkpoint. `restoreFromSnapshot` is the exact inverse
  // of the `snapshot()` this function returns, so the run continues from
  // `snapshot.time` with energy/cooldowns/ICD/resources/stance/aura intact.
  //
  // NOT byte-identical to simulating the same prefix from t=0: snapshotting
  // re-anchors aura decay, which re-rounds in IEEE-754. The divergence is
  // bounded by the mechanics layer's measured
  // `AURA_GAUGE_RELATIVE_TOLERANCE` (1e-9 relative); see `resume.ts`.
  let resumedFromTime: number | undefined;
  if (config.resumeFrom !== undefined) {
    const resumed = restoreFromSnapshot(states, config.resumeFrom);
    enemyAuras = resumed.enemyAuras;
    tickQueue = restoreReactionTicks(config.resumeFrom.reactionTicks);
    for (const entry of resumed.activeTriggers) {
      if (entry && typeof entry === "object") {
        activeTriggers.push(entry as ActiveTriggerEntry);
      }
    }
    for (const buff of resumed.runtimeBuffs) {
      if (buff && typeof buff === "object") runtimeBuffs.push(buff as Buff);
    }
    scheduledArtifactEvents.push(...resumed.artifactEvents);
    resumedFromTime = resumed.clock;
    for (const unknownId of resumed.unknownCharacterIds) {
      // Not fatal: a snapshot may come from a superset team. Reported so a
      // caller resuming with the WRONG team does not do so silently.
      warnings.push(
        `config.resumeFrom carries unknown character "${unknownId}"; ignored.`,
      );
    }
  }

  // A swap can never cost negative time — that would rewind the clock and
  // produce a negative duration (and a nonsensical DPS). Clamp to the floor
  // and report it, rather than throwing: the engine's contract is to warn and
  // continue, never to throw on bad input.
  const requestedSwapCost = config.swapCost ?? DEFAULT_SWAP_COST_SECONDS;
  const swapCost = Math.max(MIN_SWAP_COST_SECONDS, requestedSwapCost);
  if (requestedSwapCost < MIN_SWAP_COST_SECONDS) {
    const reason =
      `config.swapCost ${requestedSwapCost} is negative and would rewind the ` +
      `clock; clamped to ${MIN_SWAP_COST_SECONDS}.`;
    warnings.push(reason);
    structuredWarnings.push({
      actionIndex: CONFIG_WARNING_ACTION_INDEX,
      timestamp: 0,
      characterId: "",
      code: "invalid-config",
      message: reason,
    });
  }
  // Party size drives the off-field particle share. Defaults to the actual
  // team so the config field is never inert; an explicit value wins (lets the
  // optimizer model a 4-party share while simulating a subset).
  const partySize = config.partySize ?? team.length;
  // Stable iteration order for particle distribution => deterministic events.
  const party: CharacterState[] = team.map((def) => states.get(def.id)!);
  const artifactStateEffects: readonly ArtifactStateEffect[] =
    config.artifactStateEffects ?? [];
  const pickupEvents: readonly PickupEvent[] = [...(config.pickupEvents ?? [])]
    .filter((event) => Number.isFinite(event.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);
  const resourceEvents: readonly ResourceEvent[] = [...(config.resourceEvents ?? [])]
    .filter((event) => Number.isFinite(event.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);
  const runtimeConfig = (): SimulationConfig =>
    runtimeBuffs.length > 0 ? withHarvestedBuffs(config, runtimeBuffs) : config;

  // HP state only needs a mechanics pass when the team actually owns a buff
  // that can change HP. Keeping this resolver separate from the caller's
  // damage resolver avoids extra public resolver calls during every HP-ratio
  // read and keeps snapshot-per-cast instrumentation truthful.
  const staticMaxHpBuffs: readonly Buff[] = [
    ...teamPerkBuffs,
    ...harvestTeamEquipmentBuffs(team.map((def) => def.id), config.equipmentBuffs),
  ];
  const affectsMaxHp = (buff: Buff): boolean =>
    buff.modifiers?.some((modifier) => modifier.stat === "hpPercent" || modifier.stat === "hpFlat") === true ||
    buff.resourceModifiers?.some((modifier) => modifier.targetStat === "hpPercent" || modifier.targetStat === "hpFlat") === true ||
    buff.conversions?.some((conversion) => conversion.targetStat === "hpPercent" || conversion.targetStat === "hpFlat") === true;
  let cachedRuntimeBuffCount = -1;
  let cachedMaxHpResolver: ReturnType<typeof makeBuffResolver> | undefined;
  function maxHpResolver(): ReturnType<typeof makeBuffResolver> | undefined {
    if (runtimeBuffs.length === cachedRuntimeBuffCount) return cachedMaxHpResolver;
    cachedRuntimeBuffCount = runtimeBuffs.length;
    const buffs = [...staticMaxHpBuffs, ...runtimeBuffs].filter(affectsMaxHp);
    cachedMaxHpResolver = buffs.length > 0 ? makeBuffResolver({ buffs }) : undefined;
    return cachedMaxHpResolver;
  }

  /**
   * Keep runtime HP state aligned with the same resolved stats used to price a
   * hit. Max HP can change after the run starts (for example Yelan C4 marks or
   * Furina C2 excess Fanfare). Leaving CharacterState.maxHp at its initial
   * value makes every percentage HP drain, HP threshold, Fanfare conversion,
   * and healing cap use a different character sheet than damage does.
   *
   * This deliberately updates only the ceiling. A Max HP increase does not
   * heal the character, while a decrease can never leave current HP above the
   * new ceiling. The resolver remains the single owner of stat composition.
   */
  function refreshCharacterMaxHp(state: CharacterState, timestamp: number): void {
    const resolver = maxHpResolver();
    if (resolver === undefined) return;
    const context: BuffContext = {
      time: timestamp,
      character: state.definition,
      // HP modifiers in the supported kits are ability-independent. Using the
      // legacy Skill shape gives the shared resolver a complete ability
      // discriminator while avoiding a made-up damage event.
      ability: state.definition.elementalSkill,
      activeCharacterId,
      snapshot: snapshot(
        states,
        timestamp,
        activeCharacterId,
        activeTriggers,
        activeInfusions,
        tickQueue,
        enemyAuras,
        scheduledArtifactEvents,
        normalizedHealingEvents,
        runtimeBuffs,
        artifactTriggerState(),
      ),
      enemy: enemyAtHit(),
    };
    const resolved = resolveStats(
      characterStatsFor(state.definition.id, state.definition.baseStats, config),
      context,
      resolver,
    );
    if (!(resolved.hp > 0) || !Number.isFinite(resolved.hp)) return;
    state.maxHp = resolved.hp;
    if (state.currentHp !== undefined) {
      state.currentHp = Math.min(state.currentHp, resolved.hp);
    }
  }

  function refreshPartyMaxHp(timestamp: number): void {
    for (const member of party) refreshCharacterMaxHp(member, timestamp);
  }

  /** Resolve time-driven field procs that elapsed before the next action. */
  function processIntervalTriggers(until: number): void {
    for (const entry of activeTriggers) {
      if (entry.trigger.trigger !== "onInterval") continue;
      const interval = entry.trigger.intervalSeconds;
      if (interval === undefined || !Number.isFinite(interval) || interval <= 0) continue;
      if (entry.nextProcTime === undefined) entry.nextProcTime = entry.startTime + interval;
      let nextProcTime = entry.nextProcTime;
      while (nextProcTime <= until + 1e-9) {
        const procTime: number = nextProcTime;
        const before = entry.procCount;
        applyEnemyDamage(evaluateTriggers(
          "onInterval",
          procTime,
          activeTriggers,
          states,
          activeInfusions,
          entry.snapshot ?? snapshot(
            states,
            procTime,
            activeCharacterId,
            activeTriggers,
            activeInfusions,
            tickQueue,
            enemyAuras,
          ),
          enemy,
          runtimeConfig(),
          timeline,
          enemyAuras,
          tickQueue,
          runtimeBuffs,
          activeCharacterId,
          (sourceCharacterId, timestamp, ability) =>
            processParticleEmission(sourceCharacterId, timestamp, ability, activeCharacterId),
          (sourceCharacterId, timestamp, element) =>
            triggerDamageResourceGains(sourceCharacterId, timestamp, element),
          (sourceCharacterId, timestamp, reactionKinds) =>
            triggerReactionResourceGains(sourceCharacterId, timestamp, reactionKinds),
          (change, sourceCharacterId, timestamp) =>
            applyHealthChange(change, sourceCharacterId, timestamp),
          (bonus) => partyHpBonusForHit(bonus),
        ));
        // Expired or capped entries are removed below; make sure malformed
        // declarations cannot trap this loop at one timestamp.
        if (entry.procCount === before) nextProcTime = procTime + interval;
        else nextProcTime = entry.nextProcTime ?? procTime + interval;
        if (nextProcTime <= procTime) nextProcTime = procTime + interval;
      }
      entry.nextProcTime = nextProcTime;
    }
  }
  const nextStanceResourceDrain = new Map<string, number>();
  const endStance = (state: CharacterState, timestamp: number): void => {
    const stance = getTypedStance(state);
    if (!stance) return;
    for (const buff of stance.stance.stateEndBuffs ?? []) {
      runtimeBuffs.push({ ...buff, startTime: timestamp });
    }
    if (stance.stance.infusion !== undefined) {
      for (let index = activeInfusions.length - 1; index >= 0; index--) {
        const entry = activeInfusions[index]!;
        if (entry.infusion.id === stance.stance.infusion.id) {
          activeInfusions.splice(index, 1);
        }
      }
    }
    for (let index = activeTriggers.length - 1; index >= 0; index--) {
      const entry = activeTriggers[index]!;
      if (
        entry.trigger.sourceCharacterId === state.definition.id &&
        entry.startTime === stance.startTime
      ) {
        activeTriggers.splice(index, 1);
      }
    }
    const drain = stance.stance.resourceDrain;
    if (drain !== undefined) {
      nextStanceResourceDrain.delete(`${state.definition.id}:${drain.resourceId}`);
    }
    for (const resourceId of stance.stance.resetResourcesOnEnd ?? []) {
      const current = state.resources?.[resourceId];
      const value = current === undefined ? 0 : resourceValueAt(current, timestamp);
      if (current === undefined || value <= EPSILON) continue;
      const next = applyStateEffect(
        current,
        { resourceId, kind: "set", amount: 0 },
        timestamp,
      );
      state.resources = { ...(state.resources ?? {}), [resourceId]: next };
      timeline.push(resourceEventRecord({
        timestamp,
        sourceCharacterId: state.definition.id,
        resourceId,
        kind: "consume",
        amount: value,
        value: next.value,
      }));
    }
    state.activeStance = undefined;
  };
  function processStanceResourceDrains(until: number): void {
    if (!Number.isFinite(until) && until !== Number.POSITIVE_INFINITY) return;
    for (const state of states.values()) {
      const active = getTypedStance(state);
      const drain = active?.stance.resourceDrain;
      if (
        active === undefined ||
        drain === undefined ||
        !(drain.amountPerSecond > 0) ||
        !Number.isFinite(drain.amountPerSecond) ||
        !(drain.intervalSeconds > 0) ||
        !Number.isFinite(drain.intervalSeconds)
      ) continue;
      const key = `${state.definition.id}:${drain.resourceId}`;
      let next = nextStanceResourceDrain.get(key);
      if (next === undefined) {
        next = resumedFromTime === undefined
          ? active.startTime + drain.intervalSeconds
          : until + drain.intervalSeconds;
      }
      const stanceEnd = active.startTime + active.stance.durationSeconds;
      while (next < stanceEnd - EPSILON && next <= until + EPSILON) {
        const current = state.resources?.[drain.resourceId];
        const before = current === undefined ? 0 : resourceValueAt(current, next);
        const amount = drain.amountPerSecond * drain.intervalSeconds;
        if (current !== undefined && before > 0) {
          const updated = applyStateEffect(
            current,
            { resourceId: drain.resourceId, kind: "consume", amount },
            next,
          );
          state.resources = { ...(state.resources ?? {}), [drain.resourceId]: updated };
          timeline.push(resourceEventRecord({
            timestamp: next,
            sourceCharacterId: state.definition.id,
            resourceId: drain.resourceId,
            kind: "consume",
            amount: before - updated.value,
            value: updated.value,
          }));
          if (drain.endWhenDepleted && updated.value <= EPSILON) {
            endStance(state, next);
            break;
          }
        }
        next += drain.intervalSeconds;
      }
      if (getTypedStance(state) !== undefined) nextStanceResourceDrain.set(key, next);
    }
  }
  const consumeReplacementResource = (
    state: CharacterState,
    ability: KitAbility,
    actionType: ActionType,
    timestamp: number,
  ): void => {
    if (actionType !== "normal") return;
    const stance = getTypedStance(state);
    const costs = stance === undefined
      ? []
      : [
          ...(stance.stance.replacementResourceCost === undefined
            ? []
            : [stance.stance.replacementResourceCost]),
          ...(stance.stance.replacementResourceCosts ?? []),
          ...(stance.stance.postActionResourceCosts ?? []),
        ];
    if (!stance || costs.length === 0 || !stance.stance.normalAttacks) return;
    if (!stance.stance.normalAttacks.hits.some((entry) => entry.id === ability.id)) return;
    for (const cost of costs) {
      const current = state.resources?.[cost.resourceId];
      if (!current) continue;
      const available = resourceValueAt(current, timestamp);
      const next = applyStateEffect(
        current,
        { resourceId: cost.resourceId, kind: "consume", amount: cost.amount },
        timestamp,
      );
      state.resources = { ...(state.resources ?? {}), [cost.resourceId]: next };
      timeline.push(resourceEventRecord({
        timestamp,
        sourceCharacterId: state.definition.id,
        resourceId: cost.resourceId,
        kind: "consume",
        amount: Math.min(available, cost.amount),
        value: next.value,
      }));
      if (cost.endWhenDepleted && resourceValueAt(next, timestamp) <= EPSILON) {
        endStance(state, timestamp);
        break;
      }
    }
  };
  const lastArtifactTrigger = new Map<string, number>();
  const artifactTriggerCounts = new Map<string, number>();
  for (const [key, value] of Object.entries(config.resumeFrom?.artifactTriggerState ?? {})) {
    lastArtifactTrigger.set(key, value.lastTriggered);
    artifactTriggerCounts.set(key, value.count);
  }
  const artifactTriggerState = (): Readonly<Record<string, { lastTriggered: number; count: number }>> => {
    const out: Record<string, { lastTriggered: number; count: number }> = {};
    for (const [key, lastTriggered] of lastArtifactTrigger) {
      out[key] = { lastTriggered, count: artifactTriggerCounts.get(key) ?? 0 };
    }
    return out;
  };
  let pickupIndex = 0;
  let resourceIndex = 0;

  function triggerArtifactResources(
    trigger: Extract<ArtifactStateEffect, { kind: "resourceOnTrigger" }>["trigger"],
    sourceCharacterId: string,
    timestamp: number,
    damageType?: DamageType,
    element?: CharacterDefinition["element"],
    eventResourceId?: string,
    actionType?: ActionType,
    eventTargetCharacterId?: string,
    eventSourceCharacterId?: string,
  ): void {
    for (const effect of artifactStateEffects) {
      if (effect.kind !== "resourceOnTrigger" || effect.trigger !== trigger) continue;
      if (effect.trigger === "resourceEvent") {
        const eventTargetId = eventTargetCharacterId ?? sourceCharacterId;
        if (
          effect.eventTarget === "self" &&
          eventTargetId !== effect.sourceCharacterId
        ) continue;
        if (
          effect.eventTarget === "otherPartyMember" &&
          eventTargetId === effect.sourceCharacterId
        ) continue;
        if (
          effect.eventSource === "owner" &&
          (eventSourceCharacterId ?? sourceCharacterId) !== effect.sourceCharacterId
        ) continue;
        if (
          effect.eventTarget === undefined &&
          effect.eventSource === undefined &&
          effect.sourceCharacterId !== sourceCharacterId
        ) continue;
      } else if (effect.sourceCharacterId !== sourceCharacterId) {
        continue;
      }
      if (
        effect.actionTypes !== undefined &&
        (actionType === undefined || !effect.actionTypes.includes(actionType))
      ) continue;
      if (
        effect.damageTypes !== undefined &&
        (damageType === undefined || !effect.damageTypes.includes(damageType))
      ) continue;
      if (
        effect.elements !== undefined &&
        (element === undefined || !effect.elements.includes(element))
      ) continue;
      if (
        effect.eventResourceId !== undefined &&
        effect.eventResourceId !== eventResourceId
      ) continue;
      // A resource event id is an exact discriminator. Generic reaction
      // effects (without an id) run on the generic reaction pass only, while
      // element-specific rows run on their matching pass. This prevents one
      // reaction from incrementing both a generic and a specialised resource.
      if (
        effect.eventResourceId === undefined &&
        eventResourceId !== undefined
      ) continue;
      if (effect.trigger === "resourceEvent" && effect.eventResourceId === undefined) continue;
      const key = `${effect.kind}:${effect.sourceCharacterId}:${effect.resourceId}`;
      const state = states.get(effect.sourceCharacterId);
      if (!state || !Number.isFinite(effect.value) || effect.maxStacks <= 0) continue;
      const energyCost = effect.trigger === "skillCast"
        ? Math.max(0, effect.consumeEnergy ?? 0)
        : 0;
      if (state.energy.current < energyCost) continue;
      const previous = state.resources?.[effect.resourceId];
      // Resource lastChanged is part of the snapshot, so cooldown gating
      // survives resume. The map covers a resource that has not been created.
      const last = previous?.lastChanged ?? lastArtifactTrigger.get(key) ?? -Infinity;
      if (timestamp - last < Math.max(0, effect.cooldownSeconds)) continue;
      const live = resourceValueAt(previous, timestamp);
      const max = Math.max(0, effect.maxStacks);
      const gain = damageType !== undefined
        ? (effect.valuesByDamageType?.[damageType] ?? effect.value)
        : effect.value;
      if (!Number.isFinite(gain) || gain <= 0) continue;
      const next = effect.stackMode === "add"
        ? Math.min(max, live + Math.max(0, gain))
        : Math.min(max, Math.max(0, gain));
      state.resources = {
        ...(state.resources ?? {}),
        [effect.resourceId]: {
          id: effect.resourceId,
          value: next,
          max,
          lastChanged: timestamp,
          durationSeconds: Math.max(0, effect.durationSeconds),
        },
      };
      if (energyCost > 0) {
        spendEnergy(state.energy, energyCost);
        timeline.push({
          timestamp,
          type: "energy",
          characterId: sourceCharacterId,
          description: `${state.definition.name} consumes ${energyCost} energy for artifact effect`,
          energy: state.energy.current,
          energyByCharacter: energyByCharacter(states),
        });
      }
      lastArtifactTrigger.set(key, timestamp);
      timeline.push(resourceEventRecord({
        timestamp,
        sourceCharacterId: effect.sourceCharacterId,
        resourceId: effect.resourceId,
        kind: effect.stackMode === "add" ? "gain" : "set",
        amount: gain,
        value: next,
      }));
    }
  }

  function reduceArtifactCooldownsOnReaction(
    sourceCharacterId: string,
    timestamp: number,
    reactionKinds: readonly string[],
  ): void {
    if (!reactionKinds.some((kind) => [
      "quicken", "overloaded", "electroCharged", "superconduct", "hyperbloom",
    ].includes(kind))) return;
    for (const effect of artifactStateEffects) {
      if (effect.kind !== "cooldownReductionOnReaction" || effect.sourceCharacterId !== sourceCharacterId) continue;
      const key = `${effect.kind}:${effect.sourceCharacterId}`;
      const last = lastArtifactTrigger.get(key) ?? -Infinity;
      if (timestamp - last < Math.max(0, effect.cooldownSeconds)) continue;
      const state = states.get(sourceCharacterId);
      if (!state) continue;
      const abilityIds = [
        effect.abilityTypes?.includes("skill") ? state.definition.elementalSkill.id : undefined,
        effect.abilityTypes?.includes("burst") ? state.definition.elementalBurst.id : undefined,
      ].filter((id): id is string => id !== undefined);
      for (const abilityId of abilityIds) {
        const readyAt = state.cooldowns[abilityId];
        if (readyAt === undefined) continue;
        state.cooldowns[abilityId] = Math.max(timestamp, readyAt - Math.max(0, effect.reductionSeconds));
      }
      lastArtifactTrigger.set(key, timestamp);
    }
  }

  function triggerCooldownReductionOnHit(
    sourceCharacterId: string,
    timestamp: number,
    damageType: DamageType,
    element: CharacterDefinition["element"],
    actionType: ActionType,
  ): void {
    const source = states.get(sourceCharacterId);
    for (const effect of artifactStateEffects) {
      if (effect.kind !== "cooldownReductionOnHit" || effect.sourceCharacterId !== sourceCharacterId) continue;
      if (effect.damageTypes !== undefined && !effect.damageTypes.includes(damageType)) continue;
      if (effect.actionTypes !== undefined && !effect.actionTypes.includes(actionType)) continue;
      if (effect.elements !== undefined && !effect.elements.includes(element)) continue;
      if (effect.requiresStanceId !== undefined) {
        const activeStance = source === undefined ? undefined : getTypedStance(source);
        if (
          activeStance === undefined ||
          activeStance.stance.id !== effect.requiresStanceId ||
          timestamp >= activeStance.startTime + activeStance.stance.durationSeconds
        ) continue;
      }
      const key = `${effect.kind}:${effect.sourceCharacterId}`;
      const last = lastArtifactTrigger.get(key) ?? -Infinity;
      if (timestamp - last < Math.max(0, effect.cooldownSeconds)) continue;
      const count = artifactTriggerCounts.get(key) ?? 0;
      if (effect.maxTriggers !== undefined && count >= Math.max(0, effect.maxTriggers)) continue;
      for (const recipient of party) {
        if (effect.excludeSource && recipient.definition.id === sourceCharacterId) continue;
        const burstId = recipient.definition.elementalBurst.id;
        const readyAt = recipient.cooldowns[burstId];
        if (readyAt !== undefined) {
          recipient.cooldowns[burstId] = Math.max(timestamp, readyAt - Math.max(0, effect.reductionSeconds));
        }
      }
      lastArtifactTrigger.set(key, timestamp);
      artifactTriggerCounts.set(key, count + 1);
    }
  }

  function triggerPartyEnergyOnHit(
    sourceCharacterId: string,
    timestamp: number,
    damageType: DamageType,
    element: CharacterDefinition["element"],
    actionType: ActionType,
    sourceStats: Stats,
  ): void {
    const source = states.get(sourceCharacterId);
    for (const effect of artifactStateEffects) {
      if (effect.kind !== "partyEnergyOnHit" || effect.sourceCharacterId !== sourceCharacterId) continue;
      if (effect.damageTypes !== undefined && !effect.damageTypes.includes(damageType)) continue;
      if (effect.actionTypes !== undefined && !effect.actionTypes.includes(actionType)) continue;
      if (effect.elements !== undefined && !effect.elements.includes(element)) continue;
      if (effect.requiresStanceId !== undefined) {
        const activeStance = source === undefined ? undefined : getTypedStance(source);
        if (
          activeStance === undefined ||
          activeStance.stance.id !== effect.requiresStanceId ||
          timestamp >= activeStance.startTime + activeStance.stance.durationSeconds
        ) continue;
      }
      const key = `${effect.kind}:${effect.sourceCharacterId}`;
      const last = lastArtifactTrigger.get(key) ?? -Infinity;
      if (timestamp - last < Math.max(0, effect.cooldownSeconds)) continue;
      const count = artifactTriggerCounts.get(key) ?? 0;
      if (effect.maxTriggers !== undefined && count >= Math.max(0, effect.maxTriggers)) continue;

      const scaling = effect.energyRechargeScaling;
      const rechargeBonus = scaling === undefined
        ? 0
        : Math.max(0, sourceStats.energyRecharge - scaling.threshold) * scaling.ratio;
      const amount = effect.amount * (1 + rechargeBonus);
      if (!(amount > 0) || !Number.isFinite(amount)) continue;

      for (const recipient of party) {
        if (effect.excludeSource && recipient.definition.id === sourceCharacterId) continue;
        const applied = gainEnergyWithModifier(recipient.energy, amount, config.energyGainModifier);
        if (applied <= 0) continue;
        timeline.push({
          timestamp,
          type: "energy",
          characterId: recipient.definition.id,
          description: `${recipient.definition.name} gains ${applied.toFixed(2)} energy from ${source?.definition.name ?? sourceCharacterId}`,
          energy: recipient.energy.current,
          energyByCharacter: energyByCharacter(states),
        });
      }
      lastArtifactTrigger.set(key, timestamp);
      artifactTriggerCounts.set(key, count + 1);
    }
  }

  function triggerHpChangeResourceGains(
    sourceCharacterId: string,
    targetCharacterId: string,
    amount: number,
    timestamp: number,
  ): void {
    if (!(amount > 0) || !Number.isFinite(amount)) return;
    const target = states.get(targetCharacterId);
    if (target) refreshCharacterMaxHp(target, timestamp);
    const maxHp = target?.maxHp ?? 0;
    if (!(maxHp > 0)) return;
    for (const owner of party) {
      const generic = owner.genericDefinition as GenericCharacterDefinition;
      for (const definition of generic.resources) {
        const rule = definition.gainOnHpChange;
        if (rule === undefined) continue;
        if (
          rule.requiredResourceId !== undefined &&
          resourceValueAt(owner.resources?.[rule.requiredResourceId], timestamp) <
            (rule.requiredResourceMinimum ?? 1)
        ) continue;
        const gain = (amount / maxHp) * rule.pointsPerHpFraction;
        if (!(gain > 0) || !Number.isFinite(gain)) continue;
        const current = owner.resources?.[definition.id];
        if (current === undefined) continue;
        const currentValue = resourceValueAt(current, timestamp);
        const overflow = Math.max(0, currentValue + gain - current.max);
        const next = applyStateEffect(
          current,
          { resourceId: definition.id, kind: "gain", amount: gain },
          timestamp,
        );
        owner.resources = { ...(owner.resources ?? {}), [definition.id]: next };
        timeline.push(resourceEventRecord({
          timestamp,
          sourceCharacterId,
          targetCharacterId: owner.definition.id,
          resourceId: definition.id,
          kind: "gain",
          amount: gain,
          value: next.value,
        }));
        if (overflow > EPSILON && rule.overflowResourceId !== undefined) {
          const overflowState = owner.resources?.[rule.overflowResourceId];
          if (overflowState !== undefined) {
            const overflowNext = applyStateEffect(
              overflowState,
              { resourceId: rule.overflowResourceId, kind: "gain", amount: overflow },
              timestamp,
            );
            owner.resources = {
              ...(owner.resources ?? {}),
              [rule.overflowResourceId]: overflowNext,
            };
            timeline.push(resourceEventRecord({
              timestamp,
              sourceCharacterId,
              targetCharacterId: owner.definition.id,
              resourceId: rule.overflowResourceId,
              kind: "gain",
              amount: overflow,
              value: overflowNext.value,
            }));
          }
        }
      }
    }
    // HP-change resources can themselves alter Max HP (Yelan C4 and Furina
    // C2). Refresh every recipient after the resource transition so the next
    // event sees the new ceiling.
    refreshPartyMaxHp(timestamp);
  }

  const lastDamageResourceGain = new Map<string, number>();
  const damageResourceSources = new Map<string, Map<string, number>>();
  function triggerDamageResourceGains(
    sourceCharacterId: string,
    timestamp: number,
    element: CharacterDefinition["element"],
  ): void {
    for (const owner of party) {
      const generic = owner.genericDefinition as GenericCharacterDefinition;
      for (const definition of generic.resources) {
        const rule = definition.gainOnDamageDealt;
        if (rule === undefined || !rule.elements.includes(element)) continue;
        if (rule.excludeOwner && owner.definition.id === sourceCharacterId) continue;
        const key = `${owner.definition.id}:${definition.id}`;
        const last = lastDamageResourceGain.get(key) ?? -Infinity;
        if (timestamp - last < Math.max(0, rule.cooldownSeconds)) continue;
        if (rule.oncePerSource) {
          const sources = damageResourceSources.get(key);
          const sourceLast = sources?.get(sourceCharacterId);
          const duration = definition.durationSeconds ?? Number.POSITIVE_INFINITY;
          if (sourceLast !== undefined && timestamp - sourceLast < duration) continue;
        }
        const current = owner.resources?.[definition.id];
        if (current === undefined || !(rule.amount > 0)) continue;
        const next = applyStateEffect(
          current,
          { resourceId: definition.id, kind: "gain", amount: rule.amount },
          timestamp,
        );
        owner.resources = { ...(owner.resources ?? {}), [definition.id]: next };
        lastDamageResourceGain.set(key, timestamp);
        if (rule.oncePerSource) {
          const sources = damageResourceSources.get(key) ?? new Map<string, number>();
          sources.set(sourceCharacterId, timestamp);
          damageResourceSources.set(key, sources);
        }
        timeline.push(resourceEventRecord({
          timestamp,
          sourceCharacterId,
          targetCharacterId: owner.definition.id,
          resourceId: definition.id,
          kind: "gain",
          amount: rule.amount,
          value: next.value,
        }));
      }
    }
  }

  const lastReactionResourceGain = new Map<string, number>();
  function triggerReactionResourceGains(
    sourceCharacterId: string,
    timestamp: number,
    reactionKinds: readonly string[],
  ): void {
    if (reactionKinds.length === 0) return;
    for (const owner of party) {
      const generic = owner.genericDefinition as GenericCharacterDefinition;
      for (const definition of generic.resources) {
        const rule = definition.gainOnReaction;
        if (rule === undefined || !reactionKinds.some((kind) => rule.reactions.some((reaction) => reaction === kind))) continue;
        if (rule.excludeOwner && owner.definition.id === sourceCharacterId) continue;
        const key = `${owner.definition.id}:${definition.id}`;
        const last = lastReactionResourceGain.get(key) ?? -Infinity;
        if (timestamp - last < Math.max(0, rule.cooldownSeconds)) continue;
        const current = owner.resources?.[definition.id];
        if (current === undefined || !(rule.amount > 0)) continue;
        const next = applyStateEffect(
          current,
          { resourceId: definition.id, kind: "gain", amount: rule.amount },
          timestamp,
        );
        owner.resources = { ...(owner.resources ?? {}), [definition.id]: next };
        lastReactionResourceGain.set(key, timestamp);
        timeline.push(resourceEventRecord({
          timestamp,
          sourceCharacterId,
          targetCharacterId: owner.definition.id,
          resourceId: definition.id,
          kind: "gain",
          amount: next.value - resourceValueAt(current, timestamp),
          value: next.value,
        }));
      }
    }
  }

  function pushHealingEvent(event: HealingEvent): void {
    if (event.targetScope === "party") {
      for (const recipient of party) {
        pushHealingEvent({
          ...event,
          targetScope: "source",
          targetCharacterId: recipient.definition.id,
        });
      }
      return;
    }
    const safeAmount = Math.max(0, Number.isFinite(event.amount) ? event.amount : 0);
    const targetCharacterId = event.targetCharacterId ??
      (event.targetScope === "active" ? activeCharacterId : undefined) ??
      event.sourceCharacterId;
    const target = states.get(targetCharacterId);
    if (target) refreshCharacterMaxHp(target, event.timestamp);
    const normalized: HealingEvent = {
      ...event,
      targetCharacterId,
      amount:
        safeAmount *
        (1 + healingBonusFor(event.sourceCharacterId)) *
        (1 + healingReceivedBonusFor(targetCharacterId, event.timestamp)),
    };
    normalizedHealingEvents.push(normalized);
    normalizedHealingEvents.sort((a, b) => a.timestamp - b.timestamp);
    const record = applyHealingEvent(states, normalized);
    if (record) timeline.push(record);
    const restored = record?.healing?.amount ?? 0;
    triggerHpChangeResourceGains(
      normalized.sourceCharacterId,
      targetCharacterId,
      restored,
      normalized.timestamp,
    );
    // HP-changing events feed artifact lifecycles such as Marechaussee Hunter.
    // The event id is deliberately generic: callers that model HP loss can
    // emit the same `hpChange` ResourceEvent, while ordinary healing remains
    // deterministic and requires no hidden damage assumptions.
    if (restored > 0) {
      triggerArtifactResources(
        "resourceEvent",
        normalized.targetCharacterId ?? normalized.sourceCharacterId,
        normalized.timestamp,
        undefined,
        undefined,
        "hpChange",
        undefined,
        normalized.targetCharacterId,
        normalized.sourceCharacterId,
      );
    }
  }

  function resolveHealingAmount(
    healing: HealingDefinition,
    sourceStats: Stats,
    talentLevel: number,
  ): number {
    const scaled = healing.scaling.reduce((total, term) => {
      const multiplier = talentValueAt(term.table, talentLevel);
      const value = sourceStats[term.stat];
      return total + (Number.isFinite(multiplier) && Number.isFinite(value)
        ? multiplier * value
        : 0);
    }, 0);
    const flat = healing.flat === undefined ? 0 : talentValueAt(healing.flat, talentLevel);
    const baseAmount = scaled + (Number.isFinite(flat) ? flat : 0);
    const bonusMultiplier = healing.bonusMultiplierFromStat === undefined
      ? 0
      : Math.max(0, sourceStats[healing.bonusMultiplierFromStat.stat]) *
        healing.bonusMultiplierFromStat.ratio;
    return Math.max(0, baseAmount * (1 + bonusMultiplier));
  }

  function scheduleAbilityHealing(
    ability: KitAbility,
    source: CharacterState,
    timestamp: number,
    talentLevelBoosts: Parameters<typeof cooldownFor>[2],
    context: BuffContext,
  ): void {
    if (ability.healing === undefined || ability.healing.length === 0) return;
    const generic = source.genericDefinition as GenericCharacterDefinition;
    const sourceStats = resolveStats(
      characterStatsFor(source.definition.id, source.definition.baseStats, config),
      context,
      runtimeConfig().buffResolver,
    );
    for (const healing of ability.healing) {
      const amount = resolveHealingAmount(
        healing,
        sourceStats,
        talentLevelFor(generic, ability, talentLevelBoosts),
      );
      if (!(amount > 0)) continue;
      const delay = Math.max(0, healing.delay ?? 0);
      const baseInterval = healing.intervalSeconds;
      const duration = Math.max(0, healing.durationSeconds ?? 0);
      const intervalReduction = healing.intervalReductionFromStat;
      const interval = baseInterval !== undefined && intervalReduction !== undefined
        ? baseInterval * (1 - Math.min(
            intervalReduction.maxReduction,
            Math.max(0, Math.floor(
              sourceStats[intervalReduction.stat] / intervalReduction.unitValue,
            ) * intervalReduction.ratio),
          ))
        : baseInterval;
      const count = interval !== undefined && interval > 0 && duration > 0
        ? Math.floor(duration / interval + 1e-9)
        : 1;
      for (let index = 0; index < count; index++) {
        const at = timestamp + delay + (count === 1 ? 0 : (index + 1) * interval!);
        scheduledArtifactEvents.push({
          timestamp: at,
          kind: "healing",
          event: {
            timestamp: at,
            sourceCharacterId: source.definition.id,
            targetScope: healing.target === "self" ? "source" : healing.target,
            amount,
          },
        });
      }
    }
  }

  function scheduleTriggeredHealing(
    healing: HealingDefinition,
    sourceCharacterId: string,
    timestamp: number,
  ): void {
    const source = states.get(sourceCharacterId);
    if (!source) return;
    const triggerAbility: KitAbility = {
      id: `${sourceCharacterId}-${healing.id}-trigger`,
      name: healing.name,
      slot: "skill",
      castTime: 0,
      cooldown: { values: [0] },
      energyCost: 0,
      instances: [],
      healing: [healing],
    };
    const context: BuffContext = {
      time: timestamp,
      character: source.definition,
      ability: source.definition.elementalSkill,
      activeCharacterId,
      snapshot: snapshot(
        states,
        timestamp,
        activeCharacterId,
        activeTriggers,
        activeInfusions,
        tickQueue,
        enemyAuras,
        undefined,
        normalizedHealingEvents,
        runtimeBuffs,
        artifactTriggerState(),
      ),
      enemy: enemyAtHit(),
    };
    scheduleAbilityHealing(triggerAbility, source, timestamp, {}, context);
  }

  function applyHealthChange(
    change: HealthChangeDefinition,
    sourceCharacterId: string,
    timestamp: number,
  ): void {
    const source = states.get(sourceCharacterId);
    if (!source) return;
    const targets = change.target === "party"
      ? party
      : [change.target === "active" ? states.get(activeCharacterId ?? "") : source].filter(
          (target): target is CharacterState => target !== undefined,
        );
    for (const target of targets) {
      refreshCharacterMaxHp(target, timestamp);
      const maxHp = target.maxHp ?? 0;
      const currentHp = target.currentHp ?? maxHp;
      if (!(maxHp > 0)) continue;
      if (
        change.onlyIfHpFractionAbove !== undefined &&
        currentHp / maxHp <= change.onlyIfHpFractionAbove
      ) continue;
      const amount = Math.max(
        0,
        change.amount ?? maxHp * Math.max(0, change.maxHpFraction ?? 0),
      );
      if (!(amount > 0)) continue;
      if (change.kind === "damage") {
        const lost = Math.min(amount, currentHp);
        target.currentHp = Math.max(0, currentHp - amount);
        triggerHpChangeResourceGains(sourceCharacterId, target.definition.id, lost, timestamp);
        if (lost > 0) {
          timeline.push(resourceEventRecord({
            timestamp,
            sourceCharacterId,
            targetCharacterId: target.definition.id,
            resourceId: "hpChange",
            kind: "consume",
            amount: lost,
            value: target.currentHp,
          }));
          triggerArtifactResources(
            "resourceEvent",
            target.definition.id,
            timestamp,
            undefined,
            undefined,
            "hpChange",
            undefined,
            target.definition.id,
            sourceCharacterId,
          );
        }
      } else {
        pushHealingEvent({
          timestamp,
          sourceCharacterId,
          targetCharacterId: target.definition.id,
          amount,
        });
      }
    }
  }

  function partyHpBonusForHit(bonus: PartyHpDamageBonus | undefined): number {
    if (bonus === undefined) return 0;
    const count = party.reduce((total, member) => {
      const maxHp = member.maxHp ?? 0;
      const currentHp = member.currentHp ?? maxHp;
      return total + (maxHp > 0 && currentHp / maxHp >= bonus.minHpFraction ? 1 : 0);
    }, 0);
    return bonus.bonusByCount[Math.min(count, bonus.bonusByCount.length - 1)] ?? 0;
  }

  function scheduleHealing(effect: Extract<ArtifactStateEffect, { kind: "healOnPickup" }>, event: PickupEvent): void {
    const owner = states.get(effect.sourceCharacterId);
    if (owner) refreshCharacterMaxHp(owner, event.timestamp);
    const maxHp = owner?.maxHp ?? 0;
    const total = effect.amount ?? (maxHp * (effect.maxHpFraction ?? 0));
    const duration = Math.max(0, effect.durationSeconds ?? 0);
    const interval = Math.max(0.1, effect.tickIntervalSeconds ?? (duration > 0 ? 1 : 0));
    if (total <= 0) return;
    if (duration <= 0) {
      pushHealingEvent({ timestamp: event.timestamp, sourceCharacterId: effect.sourceCharacterId, amount: total });
      return;
    }
    const ticks = Math.max(1, Math.ceil(duration / interval));
    const perTick = total / ticks;
    for (let i = 1; i <= ticks; i++) {
      scheduledArtifactEvents.push({
        timestamp: event.timestamp + Math.min(duration, i * interval),
        kind: "healing",
        event: { timestamp: event.timestamp + Math.min(duration, i * interval), sourceCharacterId: effect.sourceCharacterId, amount: perTick },
      });
    }
  }

  function processArtifactEvents(until: number): void {
    while (healingIndex < healingEvents.length && healingEvents[healingIndex]!.timestamp <= until) {
      pushHealingEvent(healingEvents[healingIndex++]!);
    }
    while (pickupIndex < pickupEvents.length && pickupEvents[pickupIndex]!.timestamp <= until) {
      const event = pickupEvents[pickupIndex++]!;
      timeline.push(pickupEventRecord(event));
      if (event.kind === "particle" || event.kind === "orb") {
        triggerParticleResourceGains(event.sourceCharacterId, event.timestamp, event.amount ?? 1);
      }
      for (const effect of artifactStateEffects) {
        if (effect.kind === "healOnPickup" &&
            (effect.pickupKind === event.kind ||
              (effect.pickupKind === "item" && event.kind === "chest")) &&
            effect.sourceCharacterId === event.sourceCharacterId) {
          scheduleHealing(effect, event);
        }
        if (effect.kind === "energyOnParticlePickup" &&
            (event.kind === "particle" || event.kind === "orb") &&
            effect.sourceCharacterId === event.sourceCharacterId) {
          const last = lastArtifactTrigger.get(effect.kind + effect.sourceCharacterId) ?? -Infinity;
          if (event.timestamp - last >= effect.cooldownSeconds) {
            lastArtifactTrigger.set(effect.kind + effect.sourceCharacterId, event.timestamp);
            for (const recipient of party) {
              const type = recipient.definition.weaponType;
              if (effect.targetWeaponTypes && (type === undefined || !effect.targetWeaponTypes.includes(type))) continue;
              gainEnergyWithModifier(recipient.energy, effect.amount);
              timeline.push({
                timestamp: event.timestamp,
                type: "energy",
                characterId: recipient.definition.id,
                description: `${recipient.definition.name} gains ${effect.amount} energy from artifact pickup`,
                energy: recipient.energy.current,
                energyByCharacter: energyByCharacter(states),
              });
            }
          }
        }
      }
    }
    while (resourceIndex < resourceEvents.length && resourceEvents[resourceIndex]!.timestamp <= until) {
      const event = resourceEvents[resourceIndex++]!;
      timeline.push(resourceEventRecord(event));
      // Resource events may also describe an incoming damage/HP-loss stream.
      // Apply the supplied amount to the target so HP-gated buffs observe the
      // same state that the event represents. An event without an amount is
      // still a valid trigger-only signal (for Bond of Life/Nightsoul).
      if (event.resourceId === "damageTaken" || event.resourceId === "hpDecrease") {
        const targetId = event.targetCharacterId ?? event.sourceCharacterId;
        const target = states.get(targetId);
        if (target) refreshCharacterMaxHp(target, event.timestamp);
        const amount = Math.max(0, Number.isFinite(event.amount ?? 0) ? event.amount ?? 0 : 0);
        if (target && amount > 0 && target.currentHp !== undefined) {
          target.currentHp = Math.max(0, target.currentHp - amount);
        }
        if (amount > 0) {
          // Marechaussee Hunter listens to any current-HP change. Incoming
          // damage is a real HP decrease, so emit the generic change event in
          // addition to the more specific damage/loss ids above.
          triggerArtifactResources(
            "resourceEvent",
            targetId,
            event.timestamp,
            undefined,
            undefined,
            "hpChange",
            undefined,
            targetId,
            event.sourceCharacterId,
          );
        }
      }
      const eventOwnerId = (event.resourceId === "damageTaken" || event.resourceId === "hpDecrease")
        ? (event.targetCharacterId ?? event.sourceCharacterId)
        : event.sourceCharacterId;
      triggerArtifactResources(
        "resourceEvent",
        eventOwnerId,
        event.timestamp,
        undefined,
        undefined,
        event.resourceId,
      );
      if (event.resourceId === "damageTaken") {
        triggerArtifactResources(
          "resourceEvent",
          event.targetCharacterId ?? event.sourceCharacterId,
          event.timestamp,
          undefined,
          undefined,
          "hpDecrease",
        );
      }
      if (event.resourceId !== "nightsoul" || event.kind !== "triggerStart") continue;
      for (const effect of artifactStateEffects) {
        if (effect.kind !== "energyOnNightsoulBurst") continue;
        const receiver = states.get(effect.sourceCharacterId);
        if (!receiver) continue;
        gainEnergyWithModifier(receiver.energy, effect.amount);
        timeline.push({
          timestamp: event.timestamp,
          type: "energy",
          characterId: receiver.definition.id,
          description: `${receiver.definition.name} gains ${effect.amount} energy from Nightsoul Burst`,
          energy: receiver.energy.current,
          energyByCharacter: energyByCharacter(states),
        });
      }
    }
    scheduledArtifactEvents.sort((a, b) => a.timestamp - b.timestamp);
    while (scheduledArtifactEvents.length > 0 && scheduledArtifactEvents[0]!.timestamp <= until) {
      const scheduled = scheduledArtifactEvents.shift()!;
      if (scheduled.kind === "healing") pushHealingEvent(scheduled.event);
      else {
        const receiver = states.get(scheduled.sourceCharacterId);
        if (!receiver) continue;
        gainEnergyWithModifier(receiver.energy, scheduled.amount);
        timeline.push({
          timestamp: scheduled.timestamp,
          type: "energy",
          characterId: receiver.definition.id,
          description: `${receiver.definition.name} gains ${scheduled.amount} energy from artifact effect`,
          energy: receiver.energy.current,
          energyByCharacter: energyByCharacter(states),
        });
      }
    }
  }

  function triggerBurstArtifactEffects(sourceCharacterId: string, timestamp: number): void {
    for (const effect of artifactStateEffects) {
      if (effect.sourceCharacterId !== sourceCharacterId) continue;
      if (effect.kind === "partyEnergyOverTimeAfterBurst") {
        const ticks = Math.floor(effect.durationSeconds / effect.intervalSeconds);
        for (let i = 1; i <= ticks; i++) {
          const at = timestamp + i * effect.intervalSeconds;
          for (const recipient of party) {
            if (effect.excludeSource && recipient.definition.id === sourceCharacterId) continue;
            scheduledArtifactEvents.push({ timestamp: at, kind: "energy", sourceCharacterId: recipient.definition.id, amount: effect.amount });
          }
        }
      } else if (effect.kind === "healOnBurst") {
        const owner = states.get(sourceCharacterId);
        if (owner) refreshCharacterMaxHp(owner, timestamp);
        const amount = (owner?.maxHp ?? 0) * Math.max(0, effect.maxHpFraction);
        if (amount > 0) pushHealingEvent({ timestamp, sourceCharacterId, amount });
      }
    }
  }

  /**
   * Apply declarative resource gains that respond to a party burst cast.
   *
   * Raiden's Resolve is the first consumer: base gain is sourced from the
   * triggering burst's energy cost, while C1 supplies source-element
   * multipliers in the resource definition. The engine owns event ordering and
   * clamping; character-specific numbers stay in data.
   */
  function triggerBurstResourceGains(
    source: CharacterState,
    ability: KitAbility,
    timestamp: number,
  ): void {
    const energyCost = energyCostOf(ability);
    if (ability.slot !== "burst" || energyCost <= 0) return;

    for (const recipient of party) {
      const generic = recipient.genericDefinition as GenericCharacterDefinition;
      for (const definition of generic.resources) {
        const rule = definition.gainOnBurstCast;
        if (rule === undefined) continue;
        if (rule.excludeSource && recipient.definition.id === source.definition.id) continue;
        const multiplier =
          rule.multipliersByElement?.[source.definition.element] ??
          rule.defaultMultiplier ??
          1;
        const amount = energyCost * rule.perEnergyCost * multiplier;
        if (!(amount > 0) || !Number.isFinite(amount)) continue;
        const current = recipient.resources?.[definition.id];
        if (current === undefined) continue;
        const next = applyStateEffect(
          current,
          { resourceId: definition.id, kind: "gain", amount },
          timestamp,
        );
        recipient.resources = {
          ...(recipient.resources ?? {}),
          [definition.id]: next,
        };
        timeline.push(
          resourceEventRecord({
            timestamp,
            sourceCharacterId: source.definition.id,
            targetCharacterId: recipient.definition.id,
            resourceId: definition.id,
            kind: "gain",
            amount,
            value: next.value,
          }),
        );
      }
    }
  }

  /** Consume resources owned by a character when that character casts burst. */
  function consumeBurstResources(
    source: CharacterState,
    ability: KitAbility,
    timestamp: number,
  ): void {
    if (ability.slot !== "burst") return;
    const generic = source.genericDefinition as GenericCharacterDefinition;
    for (const definition of generic.resources) {
      if (!definition.consumeOnBurstCast) continue;
      // A resource cost is consumed through the explicit ability-cost
      // channel below. This guard keeps legacy definitions that still use
      // consumeOnBurstCast compatible without double-spending new profiles.
      if (ability.cost?.resources?.some((cost) => cost.resourceId === definition.id)) {
        continue;
      }
      const current = source.resources?.[definition.id];
      const value = resourceValueAt(current, timestamp);
      if (current === undefined || value <= 0) continue;
      const next = applyStateEffect(
        current,
        { resourceId: definition.id, kind: "set", amount: 0 },
        timestamp,
      );
      source.resources = {
        ...(source.resources ?? {}),
        [definition.id]: next,
      };
      timeline.push(
        resourceEventRecord({
          timestamp,
          sourceCharacterId: source.definition.id,
          resourceId: definition.id,
          kind: "consume",
          amount: value,
          value: next.value,
        }),
      );
    }
  }

  /** Consume explicit ability resource costs after cast snapshots are taken. */
  function consumeAbilityResources(
    source: CharacterState,
    ability: KitAbility,
    timestamp: number,
  ): void {
    for (const cost of ability.cost?.resources ?? []) {
      const current = source.resources?.[cost.resourceId];
      const value = resourceValueAt(current, timestamp);
      if (current === undefined || value < cost.amount - EPSILON) continue;
      const next = applyStateEffect(
        current,
        cost.consume === "all"
          ? { resourceId: cost.resourceId, kind: "set", amount: 0 }
          : { resourceId: cost.resourceId, kind: "consume", amount: cost.amount },
        timestamp,
      );
      source.resources = {
        ...(source.resources ?? {}),
        [cost.resourceId]: next,
      };
      timeline.push(
        resourceEventRecord({
          timestamp,
          sourceCharacterId: source.definition.id,
          resourceId: cost.resourceId,
          kind: "consume",
          amount: value - next.value,
          value: next.value,
        }),
      );
    }
  }

  function applyResourceTransfers(
    source: CharacterState,
    transfers: readonly ResourceTransferDefinition[] | undefined,
    timestamp: number,
  ): void {
    for (const transfer of transfers ?? []) {
      if (
        !(transfer.amountPerSourceUnit > 0) ||
        !Number.isFinite(transfer.amountPerSourceUnit)
      ) continue;
      const sourceState = source.resources?.[transfer.sourceResourceId];
      const targetState = source.resources?.[transfer.targetResourceId];
      if (!sourceState || !targetState) continue;
      const sourceValue = resourceValueAt(sourceState, timestamp);
      const units = Math.min(
        transfer.maxSourceUnits ?? Number.POSITIVE_INFINITY,
        sourceValue,
      );
      if (!(units > 0) || !Number.isFinite(units)) continue;
      const targetAmount = units * transfer.amountPerSourceUnit;
      if (!(targetAmount > 0) || !Number.isFinite(targetAmount)) continue;
      const targetValueBefore = resourceValueAt(targetState, timestamp);

      let nextResources = source.resources ?? {};
      if (transfer.consumeSource) {
        const nextSource = applyStateEffect(
          sourceState,
          { resourceId: transfer.sourceResourceId, kind: "consume", amount: units },
          timestamp,
        );
        nextResources = {
          ...nextResources,
          [transfer.sourceResourceId]: nextSource,
        };
        timeline.push(resourceEventRecord({
          timestamp,
          sourceCharacterId: source.definition.id,
          resourceId: transfer.sourceResourceId,
          kind: "consume",
          amount: sourceValue - nextSource.value,
          value: nextSource.value,
        }));
      }
      const nextTarget = applyStateEffect(
        targetState,
        { resourceId: transfer.targetResourceId, kind: "gain", amount: targetAmount },
        timestamp,
      );
      source.resources = {
        ...nextResources,
        [transfer.targetResourceId]: nextTarget,
      };
      timeline.push(resourceEventRecord({
        timestamp,
        sourceCharacterId: source.definition.id,
        resourceId: transfer.targetResourceId,
        kind: "gain",
        amount: nextTarget.value - targetValueBefore,
        value: nextTarget.value,
      }));
    }
  }

  function triggerParticleArtifactEffects(sourceCharacterId: string, timestamp: number): void {
    for (const effect of artifactStateEffects) {
      if (effect.kind !== "energyOnParticlePickup" || effect.sourceCharacterId !== sourceCharacterId) continue;
      const key = effect.kind + effect.sourceCharacterId;
      const last = lastArtifactTrigger.get(key) ?? -Infinity;
      if (timestamp - last < effect.cooldownSeconds) continue;
      lastArtifactTrigger.set(key, timestamp);
      for (const recipient of party) {
        const type = recipient.definition.weaponType;
        if (effect.targetWeaponTypes && (type === undefined || !effect.targetWeaponTypes.includes(type))) continue;
        const applied = gainEnergyWithModifier(recipient.energy, effect.amount);
        if (applied <= 0) continue;
        timeline.push({
          timestamp,
          type: "energy",
          characterId: recipient.definition.id,
          description: `${recipient.definition.name} gains ${applied.toFixed(2)} energy from artifact particle effect`,
          energy: recipient.energy.current,
          energyByCharacter: energyByCharacter(states),
        });
      }
    }
  }

  /** Apply deterministic particle-triggered resource gains, such as Raiden A1. */
  function triggerParticleResourceGains(
    particleSourceCharacterId: string,
    timestamp: number,
    expectedParticleCount = 1,
  ): void {
    const count = Math.max(0, Number.isFinite(expectedParticleCount) ? expectedParticleCount : 0);
    if (count === 0) return;
    for (const recipient of party) {
      const generic = recipient.genericDefinition as GenericCharacterDefinition;
      for (const definition of generic.resources) {
        const rule = definition.gainOnParticlePickup;
        if (rule === undefined) continue;
        const key = `resourceOnParticlePickup:${recipient.definition.id}:${definition.id}`;
        const last = lastArtifactTrigger.get(key) ?? -Infinity;
        if (timestamp - last < Math.max(0, rule.cooldownSeconds)) continue;
        const current = recipient.resources?.[definition.id];
        if (current === undefined) continue;
        const gain = rule.amount * count;
        if (!(gain > 0) || !Number.isFinite(gain)) continue;
        const next = applyStateEffect(current, {
          resourceId: definition.id,
          kind: "gain",
          amount: gain,
        }, timestamp);
        recipient.resources = {
          ...(recipient.resources ?? {}),
          [definition.id]: next,
        };
        lastArtifactTrigger.set(key, timestamp);
        timeline.push(resourceEventRecord({
          timestamp,
          sourceCharacterId: particleSourceCharacterId,
          targetCharacterId: recipient.definition.id,
          resourceId: definition.id,
          kind: "gain",
          amount: gain,
          value: next.value,
        }));
      }
    }
  }

  function processParticleEmission(
    sourceCharacterId: string,
    timestamp: number,
    ability: KitAbility,
    collectorCharacterId?: string,
  ): void {
    const source = states.get(sourceCharacterId);
    if (!source || ability.particles === undefined) return;
    const particleAbility = {
      id: ability.id,
      name: ability.name,
      actionType: ability.slot,
      element: ability.instances[0]?.element ?? source.definition.element,
      damageType: ability.instances[0]?.damageType ?? "skill",
      multiplier: 0,
      scaling: "atk" as const,
      castTime: ability.castTime,
      cooldown: 0,
      energyCost: ability.energyCost,
      energyGenerated: ability.energyGenerated ?? 0,
      particles: ability.particles,
    };
    const energyRechargeFor = makeEnergyRechargeResolver({
      time: timestamp,
      ability: particleAbility,
      activeCharacterId: collectorCharacterId,
      snapshot: snapshot(
        states,
        timestamp,
        collectorCharacterId,
        activeTriggers,
        activeInfusions,
        tickQueue,
        enemyAuras,
        undefined,
        normalizedHealingEvents,
        runtimeBuffs,
        artifactTriggerState(),
      ),
      enemy,
      resolver: runtimeConfig().buffResolver,
    });
    const gains = distributeParticles({
      emission: ability.particles,
      party,
      activeCharacterId: collectorCharacterId,
      partySize,
      ...(energyRechargeFor !== undefined ? { energyRechargeFor } : {}),
    });
    triggerParticleArtifactEffects(sourceCharacterId, timestamp);
    triggerParticleResourceGains(sourceCharacterId, timestamp, ability.particles.count);
    for (const gain of gains) {
      const receiver = states.get(gain.characterId)!;
      const applied = gainEnergyWithModifier(
        receiver.energy,
        gain.amount,
        config.energyGainModifier,
      );
      if (applied <= 0) continue;
      timeline.push({
        timestamp,
        type: "energy",
        characterId: receiver.definition.id,
        description:
          `${receiver.definition.name} gains ${applied.toFixed(2)} energy ` +
          `from ${source.definition.name} ${ability.name} particles ` +
          `(${gain.onField ? "on-field" : "off-field"})`,
        energy: receiver.energy.current,
        energyByCharacter: energyByCharacter(states),
      });
    }
  }

  // Resume seeds the clock and the on-field character; both default to a
  // cold start (t=0, nobody on-field) when no snapshot was supplied.
  let clock = resumedFromTime ?? 0;
  let activeCharacterId: string | undefined =
    config.resumeFrom?.activeCharacterId;

  // Events at or before a checkpoint have already been folded into its
  // character/resource state. Skip them on resume; replaying a healing or
  // damage event would double-apply HP changes and retrigger artifact stacks.
  if (config.resumeFrom !== undefined) {
    while (healingIndex < healingEvents.length && healingEvents[healingIndex]!.timestamp <= clock) healingIndex += 1;
    while (pickupIndex < pickupEvents.length && pickupEvents[pickupIndex]!.timestamp <= clock) pickupIndex += 1;
    while (resourceIndex < resourceEvents.length && resourceEvents[resourceIndex]!.timestamp <= clock) resourceIndex += 1;
  }

  // Resolve static and already-restored HP modifiers before the first external
  // event. A cold start is full HP after those modifiers; a resumed run keeps
  // its absolute current HP and only receives the new ceiling.
  refreshPartyMaxHp(clock);
  if (resumedFromTime === undefined) {
    for (const member of party) member.currentHp = member.maxHp;
  }

  // Process externally supplied events that occur before first action.
  processArtifactEvents(clock);

  for (let i = 0; i < rotation.length; i++) {
    const action = rotation[i]!;

    processArtifactEvents(clock);
    processStanceResourceDrains(clock);
    processIntervalTriggers(clock);

    // CONTRACT 1: every tick due at or before `clock` resolves BEFORE anything
    // this action does, so a tick and a hit at the same instant are ordered
    // deterministically (tick first, because it was caused earlier). Draining
    // here rather than after the action is also what makes the aura state this
    // action reads the state actually valid at `clock`.
    applyEnemyDamage(drainReactionTicks(tickQueue, enemyAuras, enemy, clock, timeline));

    const verdict = validateAction({
      action,
      states,
      time: clock,
      activeCharacterId,
      config: timeLimit === config.timeLimit ? config : { ...config, timeLimit },
    });

    if (!verdict.valid) {
      const message = `Action ${i}: ${verdict.reason}`;
      // A missing character is an authoring error; the rest are runtime
      // illegal-action warnings the caller can act on.
      if (verdict.code === "unknown-character") {
        errors.push(message);
      } else {
        warnings.push(`${message} Skipped.`);
        // Same data, unflattened, so the UI can place it on a lane at a time.
        structuredWarnings.push({
          actionIndex: i,
          timestamp: clock,
          characterId: action.characterId,
          code: verdict.code,
          message: verdict.reason,
          ...(verdict.availableAt !== undefined
            ? { availableAt: verdict.availableAt }
            : {}),
        });
      }
      continue;
    }

    // validateAction already proved the character exists.
    const state = states.get(action.characterId)!;
    const def = state.definition;

    if (action.actionType === "swap") {
      // Self-describing: records where we came from and what the swap actually
      // cost, so a consumer never has to re-derive either from config.
      timeline.push({
        timestamp: clock,
        type: "swap",
        characterId: def.id,
        description: `Swap to ${def.name}`,
        ...(activeCharacterId !== undefined
          ? { fromCharacterId: activeCharacterId }
          : {}),
        duration: swapCost,
      });

      // If previous character's stance ends on swap, cancel it
      if (activeCharacterId !== undefined) {
        const prevCharState = states.get(activeCharacterId);
        const prevStance = prevCharState ? getTypedStance(prevCharState) : undefined;
        if (prevStance) {
          const endsOnSwap = prevStance.stance.endsOnSwap ?? true;
          if (endsOnSwap) {
            const endedStance = prevStance.stance;
            endStance(prevCharState!, clock);
            if (endedStance.infusion) {
              const infIdx = activeInfusions.findIndex(
                (e) => e.infusion.id === endedStance.infusion!.id,
              );
              if (infIdx >= 0) activeInfusions.splice(infIdx, 1);
            }
          }
        }
      }

      activeCharacterId = def.id;
      clock += swapCost;
      continue;
    }

    // Casting puts the character on-field.
    activeCharacterId = def.id;

    // Resource-backed HP modifiers from an earlier action (for example a
    // Yelan C4 Lifeline mark) become part of the next action's character
    // sheet before its costs, healing, or damage are resolved.
    refreshPartyMaxHp(clock);

    // Check if current active stance expired before this action
    const currentStance = getTypedStance(state);
    if (
      currentStance !== undefined &&
      clock >=
        currentStance.startTime +
          currentStance.stance.durationSeconds
    ) {
      endStance(state, clock);
    }

    const genericDef = state.genericDefinition as GenericCharacterDefinition;
    const resolved = abilityForAction(genericDef, action, state, clock)!;
    const ability: KitAbility = "instances" in resolved ? resolved : liftAbility(resolved);
    const castResourceSnapshots = captureResourceSnapshots(state, clock);

    if (action.actionType === "burst") {
      triggerBurstArtifactEffects(def.id, clock);
    }

    const energyCost = energyCostOf(ability);
    if (energyCost > 0) {
      spendEnergy(state.energy, energyCost);
      timeline.push({
        timestamp: clock,
        type: "energy",
        characterId: def.id,
        description: `${def.name} spends ${energyCost} energy on burst`,
        energy: state.energy.current,
        energyByCharacter: energyByCharacter(states),
      });
    }

    // Resource costs are explicit data. Capture/snapshot-dependent damage is
    // evaluated from the pre-cost state, while the live state is reduced now.
    consumeAbilityResources(state, ability, clock);

    // Apply declarative state effects to resources
    if (ability.effects && ability.effects.length > 0) {
      state.resources = applyStateEffects(
        state.resources ?? {},
        ability.effects,
        clock,
      );
    }
    applyResourceTransfers(state, ability.resourceTransfers, clock);

    // Resolve-like resources gain from the burst event itself. This runs
    // after the cast's own declarative effects and before stance activation,
    // so a burst cannot spend resources it just generated while still making
    // the event visible in the same-timestamp timeline.
    if (action.actionType === "burst") {
      triggerBurstResourceGains(state, ability, clock);
    }

    // Activate stance if declared on ability
    if (ability.stance) {
      state.activeStance = {
        stance: ability.stance,
        startTime: clock,
        resourceSnapshots: castResourceSnapshots,
      };
      if (ability.stance.infusion) {
        activeInfusions.push({
          infusion: ability.stance.infusion,
          startTime: clock,
        });
      }
      if (ability.stance.triggers) {
        for (const trig of ability.stance.triggers) {
          activeTriggers.push({
            trigger: trig,
            startTime: clock,
            procCount: 0,
            ...(trig.trigger === "onInterval" && trig.intervalSeconds !== undefined
              ? { nextProcTime: clock + trig.intervalSeconds }
              : {}),
          });
        }
      }
    }
    if (ability.preHitBuffs) {
      for (const buff of ability.preHitBuffs) {
        runtimeBuffs.push(materializeRuntimeBuff(buff, state, config, clock));
      }
    }
    if (ability.infusion) {
      activeInfusions.push({
        infusion: ability.infusion,
        startTime: clock,
      });
    }
    // Both mechanics seams share one context, built once per cast.
    const castSnapshot = snapshot(
      states,
      clock,
      activeCharacterId,
      activeTriggers,
      activeInfusions,
      tickQueue,
      enemyAuras,
      undefined,
      normalizedHealingEvents,
      runtimeBuffs,
      artifactTriggerState(),
    );

    // Skill-hit triggers must be present while the skill's own hit resolves:
    // the hit is the event that creates them (for example Yelan C4), but the
    // trigger itself still runs only after the damage has been priced below.
    // Other cast-owned triggers keep the normal post-cast registration below.
    for (const trig of ability.triggers ?? []) {
      const triggerBelongsToThisCast =
        trig.trigger === "onSkillHit" ||
        (action.actionType === "burst" && trig.trigger === "onBurstCast");
      if (!triggerBelongsToThisCast) continue;
      activeTriggers.push({
        trigger: trig,
        startTime: clock,
        procCount: 0,
        ...(trig.snapshotMode === "cast" ? { snapshot: castSnapshot } : {}),
      });
    }

    // Stance triggers are registered before this snapshot exists. Bind only
    // cast-snapshot triggers created by this cast, leaving dynamic triggers
    // to resolve against the proc-time state.
    for (const entry of activeTriggers) {
      if (
        entry.snapshot === undefined &&
        entry.startTime === clock &&
        entry.trigger.sourceCharacterId === def.id &&
        entry.trigger.snapshotMode === "cast"
      ) {
        entry.snapshot = castSnapshot;
      }
    }

    // Evaluate action-based triggers (e.g. onNormalAttack)
    let actionTrigger: TriggerType | undefined;
    if (action.actionType === "normal") actionTrigger = "onNormalAttack";
    else if (action.actionType === "charged") actionTrigger = "onChargedAttack";
    else if (action.actionType === "skill") actionTrigger = "onSkillCast";
    else if (action.actionType === "burst") actionTrigger = "onBurstCast";

    if (actionTrigger) {
      applyEnemyDamage(evaluateTriggers(
        actionTrigger,
        clock,
        activeTriggers,
        states,
        activeInfusions,
        castSnapshot,
        enemy,
        runtimeConfig(),
        timeline,
        enemyAuras,
        tickQueue,
        runtimeBuffs,
        activeCharacterId,
        (sourceCharacterId, timestamp, ability) =>
          processParticleEmission(sourceCharacterId, timestamp, ability, activeCharacterId),
        (sourceCharacterId, timestamp, element) =>
          triggerDamageResourceGains(sourceCharacterId, timestamp, element),
        (sourceCharacterId, timestamp, reactionKinds) =>
          triggerReactionResourceGains(sourceCharacterId, timestamp, reactionKinds),
        (change, sourceCharacterId, timestamp) =>
          applyHealthChange(change, sourceCharacterId, timestamp),
        (bonus) => partyHpBonusForHit(bonus),
        def.id,
        ability.id,
      ));
    }

    // Talent-LEVEL boosts ("Increases the Level of Elemental Skill by 3").
    // Resolved once per CAST, not per hit: `planAbility` expands every
    // instance of the cast at ONE talent level, so a per-hit resolve would
    // imply hits of the same cast could read different table rows.
    const castBuffContext: BuffContext = {
      time: clock,
      character: def,
      ability: {
        id: ability.id,
        name: ability.name,
        actionType: action.actionType,
        element: def.element,
        // The cast's first instance carries the ability's damage type. This
        // context exists to IDENTIFY the cast for the resolver, not to price
        // it, so the representative type is enough and no mapping table from
        // `ActionType` (which has `plungeLow`/`swap`) is invented here.
        damageType: ability.instances[0]?.damageType ?? "normal",
        multiplier: 0,
        scaling: "atk",
        castTime: ability.castTime,
        cooldown: 0,
        energyCost: 0,
        energyGenerated: 0,
      },
      activeCharacterId,
      snapshot: castSnapshot,
      enemy,
    };
    const talentLevelBoosts = resolveTalentLevelBoosts(
      castBuffContext,
      config.talentLevelResolver,
    );
    scheduleAbilityHealing(
      ability,
      state,
      clock,
      talentLevelBoosts,
      castBuffContext,
    );

    // Plan ability hits via execution model
    state.icd = state.icd ?? {};
    const hits = planAbility({
      character: genericDef,
      ability,
      startTime: clock,
      icd: state.icd,
      talentLevelBoosts,
    });
    const materializedHits = hits.flatMap((hit) => {
      const materialized = materializeResourceScaling(
        hit,
        state,
        clock,
        castResourceSnapshots,
      );
      return materialized === undefined ? [] : [materialized];
    });

    if (action.actionType === "burst") {
      consumeBurstResources(state, ability, clock);
    }

    const appliedCastTime = ability.castTime;

    for (let hitIndex = 0; hitIndex < materializedHits.length; hitIndex++) {
      const hit = materializedHits[hitIndex]!;
      // Action legality uses cast-start time. Delayed hits use event time, so
      // an accepted cast cannot leak damage beyond a finite event horizon.
      if (timeLimit !== undefined && hit.timestamp > timeLimit + EPSILON) {
        continue;
      }
      for (const change of hit.hpChangesBeforeHit ?? []) {
        applyHealthChange(change, def.id, hit.timestamp);
      }
      // Resource and HP-gated dynamic effects read the live state. Snapshot
      // buffs still use the cast timestamp, while their state view remains
      // current for resource/party-health channels.
      castSnapshot.characters = Object.fromEntries(
        [...states.entries()].map(([id, current]) => [id, snapshotCharacter(current)]),
      );
      // Delayed hits are events on the same canonical clock. Drain pending
      // reaction work before a hit at that timestamp, including equal-time
      // boundaries. This prevents a delayed hit from jumping over an EC tick.
      const eventHorizon =
        timeLimit !== undefined ? Math.min(timeLimit, hit.timestamp) : hit.timestamp;
      if (eventHorizon >= clock - 1e-9) {
        applyEnemyDamage(
          drainReactionTicks(tickQueue, enemyAuras, enemy, eventHorizon, timeline),
        );
      }
      const hitEnemy = enemyAtHit();
      const effectiveElement = resolveInfusedElement(
        hit.element,
        hit.damageType,
        activeInfusions,
        hit.timestamp,
      );

      const effectiveStance = getTypedStance(state);
      const stanceActiveAtHit =
        effectiveStance !== undefined &&
        hit.timestamp <
          effectiveStance.startTime + effectiveStance.stance.durationSeconds;
      const effectiveDamageType =
        stanceActiveAtHit
          ? effectiveStance.stance.damageTypeOverride ?? hit.damageType
          : hit.damageType;

      // Some effects consume a limited charge immediately before a qualifying
      // hit (for example Escoffier's Cold Dish). This event is deliberately
      // separate from the historical post-hit damage trigger so the consumed
      // resource is visible to the damage resolver for the hit itself.
      applyEnemyDamage(evaluateTriggers(
        "onDamageDealtBeforeHit",
        hit.timestamp,
        activeTriggers,
        states,
        activeInfusions,
        castSnapshot,
        hitEnemy,
        runtimeConfig(),
        timeline,
        enemyAuras,
        tickQueue,
        runtimeBuffs,
        activeCharacterId,
        (sourceCharacterId, timestamp, ability) =>
          processParticleEmission(sourceCharacterId, timestamp, ability, activeCharacterId),
        (sourceCharacterId, timestamp, element) =>
          triggerDamageResourceGains(sourceCharacterId, timestamp, element),
        (sourceCharacterId, timestamp, reactionKinds) =>
          triggerReactionResourceGains(sourceCharacterId, timestamp, reactionKinds),
        (change, sourceCharacterId, timestamp) =>
          applyHealthChange(change, sourceCharacterId, timestamp),
        (bonus) => partyHpBonusForHit(bonus),
        def.id,
        ability.id,
        effectiveDamageType,
        effectiveElement,
      ));

      // Aura-gated artifact effects (Blizzard Strayer, Lavawalker,
      // Thundersoother, etc.) must read the aura as it exists for THIS hit.
      // Keep the cast snapshot object itself stable (snapshot semantics and
      // existing resolver contracts rely on object identity), while refreshing
      // only its serialized aura view between hits.
      castSnapshot.enemyAuras = snapshotEnemyAuras(enemyAuras);
      const hitSnapshot = castSnapshot;

      const hitBuffContext: BuffContext = {
        time: hit.timestamp,
        character: def,
        ability: {
          id: hit.abilityId,
          name: hit.abilityName,
          actionType: action.actionType,
          element: effectiveElement,
          damageType: effectiveDamageType,
          multiplier: 0,
          scaling: "atk",
          castTime: 0,
          cooldown: 0,
          energyCost: energyCostOf(ability),
          energyGenerated: 0,
        },
        activeCharacterId,
        snapshot: hitSnapshot,
        enemy: hitEnemy,
      };

      let stats = resolveStats(
        characterStatsFor(def.id, def.baseStats, config),
        hitBuffContext,
        runtimeConfig().buffResolver,
      );
      const enemyModifiers = resolveEnemyModifiers(
        hitBuffContext,
        runtimeConfig().enemyModifierResolver,
      );

      if (stanceActiveAtHit && effectiveStance !== undefined) {
        stats = applyStanceStats(
          stats,
          effectiveStance.stance,
          characterStatsFor(def.id, def.baseStats, config),
          def.id,
          effectiveStance.startTime,
        );
      }

      // Elemental application -> aura -> reaction. Resolved BEFORE the damage
      // instance because amplifying/additive terms feed into it.
      const reaction = resolveReactions({
        store: enemyAuras,
        enemy: hitEnemy,
        element: effectiveElement,
        gauge: hit.gauge,
        appliesElement: hit.appliesElement,
        time: hit.timestamp,
        stats: {
          level: def.level,
          elementalMastery: stats.elementalMastery,
          // See above: resolved per hit, so a timed reaction-bonus buff
          // applies to exactly the hits inside its window.
          reactionBonus: stats.reactionBonus,
        },
        enemyModifiers,
      });

      const healingFlatBonus = songBonusForHit(hit.timestamp, effectiveDamageType);
      const damage = computeDamage({
        timestamp: hit.timestamp,
        sourceCharacterId: def.id,
        hit,
        element: effectiveElement,
        damageType: effectiveDamageType,
        stats,
        characterLevel: def.level,
        enemy: hitEnemy,
        config,
        ...(healingFlatBonus > 0
          ? { flatDamageBonus: (stats.flatDamageBonus ?? 0) + healingFlatBonus }
          : {}),
        additionalDmgBonus: partyHpBonusForHit(hit.partyHpDamageBonus),
        enemyModifiers,
        reaction: {
          additiveBaseDamageBonus: reaction.additiveBaseDamageBonus,
          amplifyingMultiplier: reaction.amplifyingMultiplier,
        },
      });

      triggerReactionResourceGains(
        def.id,
        hit.timestamp,
        reaction.reactionKinds ?? [],
      );

      timeline.push({
        timestamp: hit.timestamp,
        type: "damage",
        characterId: def.id,
        description: `${def.name} ${hit.abilityName}`,
        damage,
        duration: hitIndex === 0 ? appliedCastTime : undefined,
      });

      if (trackedEnemyHp !== undefined) {
        trackedEnemyHp = Math.max(0, trackedEnemyHp - damage.finalDamage);
      }
      triggerDamageResourceGains(def.id, hit.timestamp, effectiveElement);

      applyEnemyDamage(emitTransformative(
        timeline,
        reaction.transformative,
        hit.timestamp,
        def.id,
        def.name,
        hit.abilityId,
      ));

      scheduleReactionTicks(
        tickQueue,
        reaction.transformative,
        enemyAuras,
        hitEnemy,
        hit.timestamp,
        def.id,
        def.name,
        def.level,
        stats,
        enemyModifiers,
      );

      if (action.actionType === "skill") {
        applyEnemyDamage(evaluateTriggers(
          "onSkillHit",
          hit.timestamp,
          activeTriggers,
          states,
          activeInfusions,
          castSnapshot,
          hitEnemy,
          runtimeConfig(),
          timeline,
          enemyAuras,
          tickQueue,
          runtimeBuffs,
          activeCharacterId,
          (sourceCharacterId, timestamp, ability) =>
            processParticleEmission(sourceCharacterId, timestamp, ability, activeCharacterId),
          (sourceCharacterId, timestamp, element) =>
            triggerDamageResourceGains(sourceCharacterId, timestamp, element),
          (sourceCharacterId, timestamp, reactionKinds) =>
            triggerReactionResourceGains(sourceCharacterId, timestamp, reactionKinds),
          (change, sourceCharacterId, timestamp) =>
            applyHealthChange(change, sourceCharacterId, timestamp),
          (bonus) => partyHpBonusForHit(bonus),
          def.id,
          ability.id,
        ));
      }

      applyEnemyDamage(evaluateTriggers(
        "onDamageDealt",
        hit.timestamp,
        activeTriggers,
        states,
        activeInfusions,
        castSnapshot,
        hitEnemy,
        runtimeConfig(),
        timeline,
        enemyAuras,
        tickQueue,
        runtimeBuffs,
        activeCharacterId,
        (sourceCharacterId, timestamp, ability) =>
          processParticleEmission(sourceCharacterId, timestamp, ability, activeCharacterId),
        (sourceCharacterId, timestamp, element) =>
          triggerDamageResourceGains(sourceCharacterId, timestamp, element),
        (sourceCharacterId, timestamp, reactionKinds) =>
          triggerReactionResourceGains(sourceCharacterId, timestamp, reactionKinds),
        (change, sourceCharacterId, timestamp) =>
          applyHealthChange(change, sourceCharacterId, timestamp),
        (bonus) => partyHpBonusForHit(bonus),
        def.id,
        ability.id,
        effectiveDamageType,
        effectiveElement,
        (healing, sourceCharacterId, timestamp) =>
          scheduleTriggeredHealing(healing, sourceCharacterId, timestamp),
      ));
      triggerArtifactResources(
        "damageDealt",
        def.id,
        hit.timestamp,
        effectiveDamageType,
        effectiveElement,
        undefined,
        action.actionType,
      );
      triggerCooldownReductionOnHit(def.id, hit.timestamp, effectiveDamageType, effectiveElement, action.actionType);
      triggerPartyEnergyOnHit(
        def.id,
        hit.timestamp,
        effectiveDamageType,
        effectiveElement,
        action.actionType,
        stats,
      );
      const reactionKinds = reaction.reactionKinds ?? [];
      if (reactionKinds.length > 0) {
        // Generic reaction-triggered sets (Instructor, Flower, etc.) receive
        // one activation. Specialised sets receive an exact event id so they
        // can distinguish Swirl/Crystallize and the swirled element.
        triggerArtifactResources("reaction", def.id, hit.timestamp);
        for (const kind of reactionKinds) {
          const transformed = reaction.transformative.find((entry) => entry.kind === kind);
          const eventId = kind === "swirl" && transformed
            ? `swirl:${transformed.resElement}`
            : kind;
          triggerArtifactResources("reaction", def.id, hit.timestamp, undefined, undefined, eventId);
        }
        reduceArtifactCooldownsOnReaction(def.id, hit.timestamp, reactionKinds);
      }
    }

    // A trigger declared by this cast becomes active after the cast's own
    // damage has resolved. This is both the natural lifecycle boundary for a
    // field/coordinated effect and prevents a newly-created effect from
    // consuming its first proc on the hit that created it.
    if (ability.triggers) {
      for (const trig of ability.triggers) {
        if (
          trig.trigger === "onSkillHit" ||
          (action.actionType === "burst" && trig.trigger === "onBurstCast")
        ) continue;
        activeTriggers.push({
          trigger: trig,
          startTime: clock,
          procCount: 0,
          ...(trig.trigger === "onInterval" && trig.intervalSeconds !== undefined
            ? { nextProcTime: clock + trig.intervalSeconds }
            : {}),
          ...(trig.snapshotMode === "cast" ? { snapshot: castSnapshot } : {}),
        });
      }
    }

    // Cast-owned buffs begin after the cast's damage has resolved. Keeping
    // this generic mirrors the trigger lifecycle and prevents a newly-created
    // field from buffing the hit that created it.
    if (ability.buffs) {
      for (const buff of ability.buffs) {
        runtimeBuffs.push(materializeRuntimeBuff(buff, state, config, clock));
      }
    }

    // Activate cast-triggered resources only after all hits of this cast have
    // resolved, so the triggering hit cannot consume its own newly-made buff.
    if (action.actionType === "skill") {
      triggerArtifactResources("skillCast", def.id, clock);
    } else if (action.actionType === "burst") {
      triggerArtifactResources("burstCast", def.id, clock);
    }

    // ---- Energy generation ------------------------------------------------
    if (ability.particles !== undefined) {
      processParticleEmission(def.id, clock, ability, activeCharacterId);
    }

    if (ability.energyGenerated && ability.energyGenerated > 0) {
      gainEnergyWithModifier(
        state.energy,
        ability.energyGenerated,
        config.energyGainModifier,
      );
      timeline.push({
        timestamp: clock,
        type: "energy",
        characterId: def.id,
        description: `${def.name} generates ${ability.energyGenerated} energy`,
        energy: state.energy.current,
        energyByCharacter: energyByCharacter(states),
      });
    }

    // Boost-aware: cooldown is a per-level table too, so a talent-level
    // boost can move it. Same bag as the multipliers, so the two cannot
    // disagree about which level this cast ran at.
    const cd = cooldownFor(genericDef, ability, talentLevelBoosts);
    const cooldownStart = ability.cooldownStartsAfterStance && ability.stance !== undefined
      ? clock + ability.stance.durationSeconds
      : clock;
    if (ability.charges === undefined) {
      startCooldown(state.cooldowns, ability.id, cooldownStart, cd);
    } else {
      // Charged abilities use one shared cooldown per spent charge. A second
      // charge remains usable immediately, while each spent charge returns at
      // the resolved cooldown boundary.
      state.abilityCharges ??= createAbilityChargeState(allAbilities(genericDef));
      consumeAbilityCharge(state.abilityCharges, ability.id, cooldownStart, cd);
    }

    // Gambler-style reset happens after the defeated hit's cooldown is
    // recorded, so the reset cannot be overwritten by this cast's normal
    // cooldown bookkeeping.
    if (trackedEnemyHp === 0) {
      for (const effect of artifactStateEffects) {
        if (effect.kind !== "resourceOnTrigger" || effect.trigger !== "defeat") continue;
        triggerArtifactResources("defeat", effect.sourceCharacterId, clock);
      }
      for (const effect of artifactStateEffects) {
        if (effect.kind !== "cooldownResetOnDefeat") continue;
        const last = lastArtifactTrigger.get(effect.kind + effect.sourceCharacterId) ?? -Infinity;
        if (clock - last < effect.cooldownSeconds) continue;
        const defeated = states.get(effect.sourceCharacterId);
        if (!defeated) continue;
        const abilityIds = [
          effect.abilityTypes?.includes("skill") ? defeated.definition.elementalSkill.id : undefined,
          effect.abilityTypes?.includes("burst") ? defeated.definition.elementalBurst.id : undefined,
        ].filter((id): id is string => id !== undefined);
        resetCooldowns(defeated.cooldowns, abilityIds);
        lastArtifactTrigger.set(effect.kind + effect.sourceCharacterId, clock);
      }
    }

    if (action.actionType === "normal") {
      const activeStance = getTypedStance(state);
      const normalAttacks =
        activeStance &&
        clock <
          activeStance.startTime +
            activeStance.stance.durationSeconds &&
        activeStance.stance.normalAttacks
          ? activeStance.stance.normalAttacks
          : genericDef.normalAttacks;
      state.normalStringIndex = advanceNormalStringIndex(
        resolveNormalStringIndex(action, state),
        normalAttacks.hits.length,
        normalAttacks.loops,
      );
    }

    consumeReplacementResource(state, ability, action.actionType, clock + appliedCastTime);
    clock += appliedCastTime;
  }

  // CONTRACT 3 — the tail. Electro-Charged keeps ticking after the player
  // stops attacking, so the queue is drained once more to the run's horizon.
  // The horizon is `config.timeLimit` when set (so a bounded run and an
  // unbounded one agree on every tick inside the bound), otherwise the clock
  // after the final authored action. Ticks beyond it are left PENDING: the
  // aura state they would have consumed stays in `finalState`, so a caller
  // resuming from the checkpoint still owns the unfinished reaction.
  const horizon =
    timeLimit !== undefined ? Math.min(timeLimit, clock) : clock;
  // Close any stance whose timer elapsed during the final cast. This emits
  // state-end effects at the authored expiry timestamp even when no later
  // action exists to perform the normal pre-action cleanup.
  for (const state of states.values()) {
    const activeStance = getTypedStance(state);
    if (
      activeStance !== undefined &&
      clock >= activeStance.startTime + activeStance.stance.durationSeconds
    ) {
      endStance(state, activeStance.startTime + activeStance.stance.durationSeconds);
    }
  }
  processArtifactEvents(horizon);
  processStanceResourceDrains(horizon);
  processIntervalTriggers(horizon);
  applyEnemyDamage(drainReactionTicks(tickQueue, enemyAuras, enemy, horizon, timeline));
  refreshPartyMaxHp(clock);

  // Ocean-Hued Clam's stored healing is an independent, mitigation-free
  // damage instance. A single team-wide foam is sufficient here: the data
  // descriptor is selected per wearer, while the game permits only one foam
  // active at a time and records healing from multiple equippers.
  if (
    normalizedHealingEvents.length > 0 &&
    healingEffects.some((effect) => effect.kind === "oceanHuedClam")
  ) {
    const event = normalizedHealingEvents[normalizedHealingEvents.length - 1]!;
    const clamSourceId = healingEffects.find(
      (effect) => effect.kind === "oceanHuedClam",
    )?.sourceCharacterId;
    const source =
      team.find((def) => def.id === clamSourceId) ??
      team.find((def) => def.id === event.sourceCharacterId) ??
      team[0];
    if (source) {
      const amount = Math.min(
        30_000,
        normalizedHealingEvents.reduce((total, item) => total + item.amount, 0),
      );
      const damage = computeDamage({
        timestamp: event.timestamp + 3,
        sourceCharacterId: source.id,
        healing: {
          event: { ...event, amount },
          multiplier: 0.9,
          maxAmount: 30_000,
          bypassMitigation: true,
        },
        stats: characterStatsFor(source.id, source.baseStats, config),
        characterLevel: source.level,
        enemy,
        config,
      });
      timeline.push({
        timestamp: event.timestamp + 3,
        type: "damage",
        characterId: source.id,
        description: `${source.name} healing artifact damage`,
        damage,
      });
    }
  }

  // Stably sort timeline by timestamp so delayed multi-hits and procs
  // appear at their chronological timestamp.
  timeline.sort((a, b) => a.timestamp - b.timestamp);

  // Duration is the time THIS run covers, not the absolute clock. On a cold
  // start the two coincide (start = 0). On a resume they do not: the run
  // begins at the checkpoint, so counting from 0 would bill it for time it
  // never simulated and understate DPS by exactly the prefix length.
  const duration = clock - (resumedFromTime ?? 0);

  // Aggregate.
  let totalDamage = 0;
  const damageByCharacter: Record<string, number> = {};
  const damageByAbility: Record<string, number> = {};
  const abilityNamesById: Record<string, string> = {};
  const damageByElement: Record<string, number> = {};

  for (const ev of timeline) {
    if (ev.type !== "damage" || !ev.damage) continue;
    const d = ev.damage;
    totalDamage += d.finalDamage;
    damageByCharacter[d.sourceCharacterId] =
      (damageByCharacter[d.sourceCharacterId] ?? 0) + d.finalDamage;
    damageByAbility[d.abilityId] =
      (damageByAbility[d.abilityId] ?? 0) + d.finalDamage;
    abilityNamesById[d.abilityId] = d.abilityName;
    damageByElement[d.element] =
      (damageByElement[d.element] ?? 0) + d.finalDamage;
  }

  const dps = duration > 0 ? totalDamage / duration : 0;

  return {
    totalDamage,
    dps,
    duration,
    damageByCharacter,
    damageByAbility,
    abilityNamesById,
    damageByElement,
    timeline,
    errors,
    warnings,
    structuredWarnings,
    effectiveSwapCost: swapCost,
    finalState: snapshot(
      states,
      clock,
      activeCharacterId,
      activeTriggers,
      activeInfusions,
      tickQueue,
      enemyAuras,
      scheduledArtifactEvents,
      normalizedHealingEvents,
      runtimeBuffs,
      artifactTriggerState(),
    ),
  };
}
