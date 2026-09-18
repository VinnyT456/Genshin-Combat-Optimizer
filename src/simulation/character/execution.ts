import type { DamageType, Element } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type {
  DamageInstanceDefinition,
  KitAbility,
  ResourceScalingTerm,
  PartyHpDamageBonus,
  HealthChangeDefinition,
} from "@/simulation/character/kit";
import type { ScalingTerm } from "@/simulation/character/scaling";
import { evaluateIcd } from "@/simulation/reactions/icd";
import { STANDARD_ICD } from "@/simulation/reactions/types";
import type { IcdBehaviour, IcdCounter } from "@/simulation/reactions/types";
import type { TalentTable } from "@/simulation/character/talent";
import { talentValueAt } from "@/simulation/character/talent";
import { effectiveTalentLevel } from "@/simulation/buffs/talentLevel";
import type { TalentLevelBoostMap } from "@/types";

// ============================================================================
// Execution model — data-driven ability -> ordered simulation hits.
//
// This is the single place that turns a `KitAbility` into the concrete hits the
// engine emits. It is PURE: it reads a definition and a clock, and returns a
// list. It performs no damage math (the damage pipeline does that), applies no
// buffs (the buff seam does that), and knows no character.
//
// Multi-hit falls out of the model rather than being special-cased: an ability
// with three `instances` yields three `PlannedHit`s, each with its own absolute
// timestamp, scaling terms, element and ICD verdict.
// ============================================================================

/** Which talent's level governs an ability's multipliers. */
export type TalentChannel = "normal" | "skill" | "burst";

/**
 * The talent channel an ability slot reads its level from.
 *
 * Normal, charged and plunging attacks all scale off the NORMAL ATTACK talent
 * level in game — a mapping, declared once here, not a branch at each call.
 */
export function talentChannelForSlot(ability: KitAbility): TalentChannel {
  if (ability.talentChannel !== undefined) return ability.talentChannel;
  switch (ability.slot) {
    case "skill":
      return "skill";
    case "burst":
      return "burst";
    default:
      // normal / charged / plungeLow / plungeHigh
      return "normal";
  }
}

/** One concrete hit the engine will emit. */
export interface PlannedHit {
  abilityId: string;
  abilityName: string;
  instanceId: string;
  instanceName: string;
  /** Absolute simulation time of this hit. */
  timestamp: number;
  /** Talent-resolved scaling terms; summed by the damage pipeline. */
  scaling: readonly ScalingTerm[];
  /** Resource terms are materialised by the engine at the appropriate time. */
  resourceScaling?: readonly ResourceScalingTerm[];
  partyHpDamageBonus?: PartyHpDamageBonus;
  hpChangesBeforeHit?: readonly HealthChangeDefinition[];
  element: Element;
  damageType: DamageType;
  /**
   * Whether this hit APPLIES its element this time, per the ICD counter.
   * `false` means it still deals damage but triggers no aura/reaction.
   * Undefined when the instance declares no elemental application.
   */
  appliesElement?: boolean;
  /** Gauge units applied, present only when `appliesElement` is true. */
  gauge?: number;
}

/**
 * Mutable ICD state, keyed by ICD group. Plain-data and serializable.
 *
 * The counter SHAPE and the ICD rule itself are owned by the mechanics layer
 * (`src/simulation/reactions/icd.ts`); this is the mutable, engine-side
 * container the planner advances. Mechanics' own `IcdState` is `Readonly`
 * because that layer is immutable-by-convention.
 */
export type IcdState = Record<string, IcdCounter>;

export interface PlanAbilityInput {
  character: GenericCharacterDefinition;
  ability: KitAbility;
  /** Simulation clock at the START of the cast. */
  startTime: number;
  /**
   * ICD counters for this character. MUTATED in place as hits are planned,
   * because ICD is inherently stateful across casts. Pass a fresh object to
   * plan without side effects.
   */
  icd: IcdState;
  /**
   * Talent-level deltas from the mechanics talent-level seam, resolved once
   * per CAST — which is the right granularity, because a cast expands all of
   * its instances at a single talent level.
   *
   * ADDITIVE: absent means no boost, i.e. exactly the previous behaviour.
   */
  talentLevelBoosts?: TalentLevelBoostMap;
}

/**
 * Read a sourced talent row without turning an incomplete definition into a
 * simulation exception. Generated data normally withholds an ability when a
 * required table is unavailable, but this public execution seam also accepts
 * direct definitions. A missing/invalid table therefore contributes zero,
 * which is the engine's fail-closed value for absent combat data.
 */
function safeTalentValueAt(table: TalentTable | undefined, level: number): number {
  if (
    table === undefined ||
    table === null ||
    !Array.isArray(table.values) ||
    table.values.length === 0
  ) {
    return 0;
  }
  const value = talentValueAt(table, level);
  return Number.isFinite(value) ? value : 0;
}

/** Resolves an instance's talent-indexed scaling terms at a talent level. */
export function resolveScaling(
  instance: DamageInstanceDefinition,
  talentLevel: number,
): readonly ScalingTerm[] {
  return instance.scaling.map((term) => ({
    stat: term.stat,
    multiplier: safeTalentValueAt(term.table, talentLevel),
  }));
}

/**
 * Talent level governing this ability on this character, INCLUDING any
 * constellation level boost ("Increases the Level of Elemental Skill by 3").
 *
 * `boosts` is the sparse per-slot delta bag produced by the mechanics layer's
 * talent-level seam. Absent (or an absent key) means +0, i.e. exactly the
 * previous behaviour — this is an additive change.
 *
 * The clamp is delegated to `resolveTalentLevel` rather than done here so the
 * rule lives in ONE place. It applies to the RESULTING level (base + delta),
 * never to the delta: clamping the delta would cap +20 on a level-1 talent at
 * +15 while letting +3 through on a level-15 talent.
 *
 * `talentValueAt` also clamps internally, so an unclamped level would not
 * crash — it would silently resolve to the level-15 row while the reported
 * level said 18. Clamping at the seam keeps the REPORTED level honest.
 */
export function talentLevelFor(
  character: GenericCharacterDefinition,
  ability: KitAbility,
  boosts?: TalentLevelBoostMap,
): number {
  const slot = talentChannelForSlot(ability);
  const configured = character.talentLevels[slot];
  if (boosts === undefined) return configured;
  return effectiveTalentLevel(slot, configured, boosts);
}

/**
 * Cooldown of an ability at the character's current talent level.
 *
 * Boost-aware for the same reason multipliers are: cooldown is stored as a
 * per-level table, so a level boost can move it.
 */
export function cooldownFor(
  character: GenericCharacterDefinition,
  ability: KitAbility,
  boosts?: TalentLevelBoostMap,
): number {
  return safeTalentValueAt(
    ability.cooldown,
    talentLevelFor(character, ability, boosts),
  );
}

/**
 * Expands one ability cast into its ordered hits.
 *
 * Order is `instances` order, which is authoring order — deterministic and
 * stable. Hits are NOT re-sorted by `delay`: an authored order is meaningful
 * (two hits at the same delay have a defined sequence), and re-sorting would
 * make output depend on a comparator's stability.
 */
export function planAbility(input: PlanAbilityInput): readonly PlannedHit[] {
  const { character, ability, startTime, icd, talentLevelBoosts } = input;
  const talentLevel = talentLevelFor(character, ability, talentLevelBoosts);

  const hits: PlannedHit[] = [];
  for (const instance of ability.instances) {
    const timestamp = startTime + (instance.delay ?? 0);

    const hit: PlannedHit = {
      abilityId: ability.id,
      abilityName: ability.name,
      instanceId: instance.id,
      instanceName: instance.name,
      timestamp,
      scaling: resolveScaling(instance, talentLevel),
      element: instance.element,
      damageType: instance.damageType,
      ...(instance.resourceScaling !== undefined
        ? { resourceScaling: instance.resourceScaling }
        : {}),
      ...(instance.partyHpDamageBonus !== undefined
        ? { partyHpDamageBonus: instance.partyHpDamageBonus }
        : {}),
      ...(instance.hpChangesBeforeHit !== undefined
        ? { hpChangesBeforeHit: instance.hpChangesBeforeHit }
        : {}),
    };

    const application = instance.application;
    if (application !== undefined) {
      if (application.icdGroup === undefined) {
        // No ICD group declared => applies every hit.
        hit.appliesElement = true;
        hit.gauge = application.gauge;
      } else {
        const behaviour: IcdBehaviour = instance.icd ?? STANDARD_ICD;
        const result = evaluateIcd(
          behaviour,
          icd[application.icdGroup],
          timestamp,
        );
        icd[application.icdGroup] = result.counter;
        hit.appliesElement = result.applies;
        if (result.applies) hit.gauge = application.gauge;
      }
    }

    hits.push(hit);
  }
  return hits;
}
