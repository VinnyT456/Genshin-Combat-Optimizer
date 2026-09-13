import type { DamageType, Element, ParticleEmission } from "@/types";
import type { ElementalApplication, ScalingStat, ScalingTerm } from "@/simulation/character/scaling";
import type { IcdBehaviour } from "@/simulation/reactions/types";
import type { TalentTable } from "@/simulation/character/talent";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import type { InfusionDefinition } from "@/simulation/reactions/infusions";

// ============================================================================
// Kit model — a character's abilities expressed entirely as DATA.
//
// The engine executes these shapes generically. No branch anywhere in
// `src/simulation/engine` may test a character id, name, or ability id: if a
// kit needs a capability that is not expressible here, the ABSTRACTION is
// extended first and the kit is then authored as data.
// ============================================================================

export type WeaponType = "sword" | "claymore" | "polearm" | "catalyst" | "bow";

export type Rarity = 4 | 5;

// ---------------------------------------------------------------------------
// Damage instances
// ---------------------------------------------------------------------------

/**
 * ONE hit. An ability owns a list of these, so multi-hit abilities (a 3-hit
 * burst, an N4 that swings twice) need no special case in the engine — they are
 * simply an ability whose `instances` array has more than one entry.
 *
 * Each instance is independently scaled, independently elemental, and carries
 * its own ICD group, because in game these genuinely differ hit-to-hit.
 */
export interface DamageInstanceDefinition {
  /** Stable id, unique within the owning ability. Used for breakdown keys. */
  id: string;
  /** Human-readable label, e.g. "Hit 1" or "Cutting DMG". */
  name: string;
  /**
   * Scaling terms, indexed by talent level. Summed (hybrid scaling).
   * A pure-ATK instance is one term.
   */
  scaling: readonly TalentScalingTerm[];
  /** For the damage breakdown and for buff `damageType` conditions. */
  damageType: DamageType;
  /**
   * Elemental application. Absent means the instance is non-elemental for
   * application purposes (it still has an `element` for DMG-bonus lookup).
   */
  application?: ElementalApplication;
  /** Element used for DMG% bonus and RES lookup. */
  element: Element;
  /**
   * Per-instance ICD OVERRIDE, feeding the mechanics layer's
   * `resolveIcdConfig()`. Absent means the group inherits the documented
   * 2.5s / 3-hit standard. This is an override, not a second source of truth:
   * `src/simulation/reactions/icd.ts` owns the ICD rule itself.
   */
  icd?: IcdBehaviour;
  /**
   * Seconds after the ability's cast start at which this hit lands.
   * Defaults to 0 (all hits at cast time). Lets a multi-hit ability spread its
   * instances across the timeline without a bespoke scheduler.
   */
  delay?: number;
  /**
   * Extra scaling supplied by a character-owned resource (for example
   * Raiden's Resolve). The engine resolves these terms at cast time or hit
   * time according to `snapshot`, keeping the authored coefficient separate
   * from the mutable runtime resource value.
   */
  resourceScaling?: readonly ResourceScalingTerm[];
}

/** A scaling term whose multiplier varies with talent level. */
export interface TalentScalingTerm {
  stat: ScalingStat;
  /** Per-level multiplier table. Resolved via `talentValueAt`. */
  table: TalentTable;
}

/** One point of a resource contributes this much of a stat to the hit. */
export interface ResourceScalingTerm {
  resourceId: string;
  stat: ScalingStat;
  multiplierPerStack: number;
  /** Cast snapshots persist through stance hits; hit reads the live value. */
  snapshot?: "cast" | "hit";
}

/** Resolves a talent-indexed term to a concrete one at a given talent level. */
export type ResolvedScalingTerm = ScalingTerm;

// ---------------------------------------------------------------------------
// Abilities
// ---------------------------------------------------------------------------

/**
 * Which slot an ability occupies. Deliberately WIDER than the legacy
 * `ActionType`: plunging attacks and the two normal-attack sub-slots are real
 * game concepts the four-slot model could not express.
 */
export type AbilitySlot =
  | "normal"
  | "charged"
  | "plungeLow"
  | "plungeHigh"
  | "skill"
  | "burst";

/**
 * A castable ability. Slot-agnostic: the same shape describes a normal-attack
 * string entry, a charged attack, a skill, or a burst.
 */
export interface KitAbility {
  id: string;
  name: string;
  slot: AbilitySlot;
  /**
   * Every hit this ability produces, in deterministic order.
   *
   * ORDERING GUARANTEE (N13): this is AUTHORING order and is preserved
   * end-to-end. `planAbility()` does NOT re-sort by `delay` — two instances at
   * the same delay have a defined sequence, and sorting would make the output
   * depend on a comparator's stability. Consumers may rely on index alignment
   * between `instances` and the `PlannedHit`s produced from them.
   */
  instances: readonly DamageInstanceDefinition[];
  /** Seconds the ability occupies on the timeline. */
  castTime: number;
  /** Cooldown in seconds. May vary with talent level. */
  cooldown: TalentTable;
  /** Burst energy cost. 0 for non-bursts. */
  energyCost: number;
  /** Particles emitted on cast. Absent means none. */
  particles?: ParticleEmission;
  /** Flat energy granted directly to the caster (not ER-scaled). */
  energyGenerated?: number;
  /**
   * State effects this cast produces (gain stacks, enter a stance, ...).
   * Declarative — see `state.ts`. The engine applies them; it does not
   * interpret their meaning.
   */
  effects?: readonly StateEffect[];
  /** Declarative buffs created after all hits of this cast resolve. */
  buffs?: readonly Buff[];
  /** Alternate combat stance entered when this ability is cast. */
  stance?: StanceDefinition<NormalAttackString, KitAbility>;
  /** Weapon infusion applied when this ability is cast. */
  infusion?: InfusionDefinition;
  /** Coordinated attacks or triggered effects registered when this ability is cast. */
  triggers?: readonly TriggeredEffectDefinition<KitAbility>[];
}

/**
 * A normal-attack STRING: N1..N5 (or more) as an ordered list of abilities.
 *
 * Modelled as a sequence rather than a single "normalAttack" because each hit
 * in the string has its own multiplier, cast time, and (for some weapon types)
 * its own hit count. `chargedAttack` is separate because it is reachable from
 * any point in the string.
 */
export interface NormalAttackString {
  /** N1, N2, ... in order. */
  hits: readonly KitAbility[];
  /**
   * Whether the string resets to N1 after the last hit. True for every
   * in-game combo; declared rather than assumed.
   */
  loops: boolean;
}

// ---------------------------------------------------------------------------
// Passives & constellations — DATA with declarative conditions
// ---------------------------------------------------------------------------

/**
 * A passive talent or a constellation. Both are the same shape: a named,
 * conditionally-active bundle of effects.
 *
 * Effects are references INTO the buff/state model, not predicates. A function
 * here would be unserializable across a Web Worker and could smuggle impurity
 * into a path that must stay deterministic.
 */
export interface PassiveDefinition {
  id: string;
  name: string;
  /** Ascension passives unlock at A1/A4; `0` means unconditional. */
  unlockAscension?: number;
  /** Effects granted while active. */
  effects: readonly StateEffect[];
  /**
   * Buffs granted while active — stat modifiers, reaction bonuses, and
   * talent-LEVEL boosts.
   *
   * A SIBLING of `effects` rather than a widening of it. Widening to
   * `StateEffect | Buff` would force every existing consumer of `effects` to
   * discriminate the union, so this is purely additive: nothing that reads
   * `effects` today changes, and a definition with no buffs omits the key.
   *
   * Activation and gating (constellation level, ascension, uptime windows)
   * ride the buff's own `conditions`, so no special-case path is needed here.
   */
  buffs?: readonly Buff[];
}

export interface ConstellationDefinition {
  /** C1..C6. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  name: string;
  effects: readonly StateEffect[];
  /**
   * Buffs granted by this constellation. See {@link PassiveDefinition.buffs}.
   *
   * This is where "Increases the Level of Elemental Skill by 3" lives: the
   * emitted `talentLevelBoost: { slot, levels }` maps 1:1 onto the buff's
   * `talentLevelModifiers: [{ slot, levels }]` with NO translation table,
   * because `TalentSlot` was defined to match the emitted slot names.
   */
  buffs?: readonly Buff[];
}

// ---------------------------------------------------------------------------
// State / stacks / resources — the EXTENSION SEAM
// ---------------------------------------------------------------------------

/**
 * Declaration of a character-owned resource: a stack counter, a stance flag, a
 * cost pool (Fischl's Oz uptime, Xingqiu's raincutters, Neuvillette's stacks).
 *
 * The engine tracks the numbers generically (see `runtime.ts`); what a
 * resource MEANS is expressed by the effects that read it. This is the seam
 * through which kit-specific behaviour arrives as data instead of as a branch
 * in the engine.
 */
export interface ResourceDefinition {
  id: string;
  name: string;
  /** Value at the start of a rotation. */
  initial: number;
  /** Hard cap. Gains clamp here. */
  max: number;
  /**
   * Seconds after which the resource decays to `initial`, if it expires.
   * Absent means it persists for the whole rotation.
   */
  durationSeconds?: number;
  /**
   * Optional event-driven gain rule for resources that respond to party burst
   * casts. The engine evaluates this declarative rule for every burst and
   * applies it to the owning character's resource.
   */
  gainOnBurstCast?: {
    /** Resource gained per point of the triggering burst's energy cost. */
    perEnergyCost: number;
    /** Multiplier used when no source-element override matches. */
    defaultMultiplier?: number;
    /** Element-specific multiplier overrides. */
    multipliersByElement?: Partial<Record<Element, number>>;
    /** Do not react to the owning character's own burst cast. */
    excludeSource?: boolean;
  };
  /**
   * Optional gain when the party collects an elemental particle or orb.
   * `amount` is per expected particle unit, so deterministic expected-value
   * emissions may use fractional particle counts.
   */
  gainOnParticlePickup?: {
    amount: number;
    cooldownSeconds: number;
  };
  /**
   * When true, a burst cast by the owning character consumes the current
   * value after its hits have captured any `snapshot: "cast"` scaling terms.
   * This is data rather than a Raiden-specific engine branch so future
   * resource-powered bursts can use the same lifecycle.
   */
  consumeOnBurstCast?: boolean;
}

/** How a `StateEffect` changes a resource. */
export type StateEffectKind = "gain" | "consume" | "set";

/**
 * A declarative change to a resource. Authored on abilities, passives and
 * constellations; applied by the engine's state module.
 *
 * Intentionally minimal for Phase A: it can express "this cast grants 2 stacks,
 * capped at 4". It cannot yet express conditional or reactive effects — that is
 * a documented Phase B gap, not an oversight.
 */
export interface StateEffect {
  resourceId: string;
  kind: StateEffectKind;
  amount: number;
}
