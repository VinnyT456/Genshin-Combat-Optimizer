import type {
  AbilityDefinition,
  CharacterDefinition,
  DamageType,
  Element,
  EnemyState,
  ReactionBonusKey,
  SimulationSnapshot,
  Stats,
} from "@/types";
import type { InfusionDefinition } from "@/simulation/reactions/infusions";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";


// ============================================================================
// Buff / debuff object model.
//
// A buff is PLAIN DATA. Adding new game content (a character's ATK% aura, a
// weapon passive, an artifact 4-piece, an enemy RES shred) must never require
// editing this module — you author a `Buff` object and register it.
//
// Nothing here is character-specific, and nothing here names a character.
// The resolver reads `Buff` objects generically: what stat, how much, when,
// to whom, under what condition.
// ============================================================================

/**
 * Which stat a modifier touches.
 *
 * Split deliberately into flat vs percentage channels because Genshin applies
 * them at different points in the formula (see `MODIFIER_APPLICATION_ORDER` in
 * `resolver.ts`). `atkPercent` scales BASE ATK, `atkFlat` is added after; they
 * are NOT interchangeable.
 */
export type StatKey =
  // --- ATK channel -----------------------------------------------------
  /** % of BASE ATK (character base + weapon base). Additive with other ATK%. */
  | "atkPercent"
  /** Flat ATK added after ATK% is applied to base ATK. */
  | "atkFlat"
  // --- HP channel ------------------------------------------------------
  | "hpPercent"
  | "hpFlat"
  // --- DEF channel -----------------------------------------------------
  | "defPercent"
  | "defFlat"
  // --- Additive-fraction stats ----------------------------------------
  /** Flat Elemental Mastery (EM has no % channel in game). */
  | "elementalMastery"
  /** Crit Rate as a fraction (0.05 == +5%). */
  | "critRate"
  /** Crit DMG as a fraction (0.10 == +10%). */
  | "critDmg"
  /** Energy Recharge as a fraction (0.20 == +20%). */
  | "energyRecharge"
  /** Generic DMG% bonus applied to every instance. */
  | "dmgBonus"
  /** Flat additive base damage (e.g. deterministic expected proc damage). */
  | "flatDamageBonus"
  /**
   * Per-element DMG% bonus. REQUIRES `element` to be set on the modifier;
   * a modifier with this key and no `element` is ignored (and reported).
   */
  | "elementalDmgBonus"
  /**
   * Per-reaction DMG bonus fraction — `ReactionBonus` in the KQM damage
   * formula (`combat-mechanics/damage/damage-formula`), which enters every
   * reaction formula as `(1 + emBonus + ReactionBonus)`.
   *
   * REQUIRES `reaction` to be set on the modifier; a modifier with this key
   * and no `reaction` is ignored (and reported), exactly as with
   * `elementalDmgBonus` and a missing `element`. It is deliberately NOT a
   * scalar: real sources are reaction-specific (a +15% Vaporize/Melt set must
   * not leak onto Swirl), so a reaction-less value has no defensible meaning.
   */
  | "reactionBonus";

/** Stat keys that are pure additive fractions/flats with no separate channel. */
export const SIMPLE_STAT_KEYS = [
  "elementalMastery",
  "critRate",
  "critDmg",
  "energyRecharge",
  "dmgBonus",
] as const;

/**
 * One stat change carried by a buff. A buff may carry several (e.g. a 4-piece
 * granting both ATK% and Crit Rate).
 */
export interface StatModifier {
  stat: StatKey;
  /** Magnitude for ONE stack. Total = value * stacks. */
  value: number;
  /**
   * Required when `stat === "elementalDmgBonus"`; ignored otherwise.
   * Which element's DMG bonus this modifier feeds.
   */
  element?: Element;
  /**
   * Required when `stat === "reactionBonus"`; ignored otherwise.
   * Which reaction's bonus channel this modifier feeds.
   *
   * A source covering several reactions is authored as several modifiers, one
   * per reaction — they genuinely are distinct keys in the game's formula.
   */
  reaction?: ReactionBonusKey;
}

/** Character-side resistance change, expressed as a fraction (0.15 == 15%).
 * This channel is deliberately separate from {@link EnemyModifier}: it
 * describes damage received by a character and must never alter enemy RES. */
export interface CharacterResistanceModifier {
  element: Element;
  value: number;
}

/** Shield absorption strength bonus (0.35 == +35%), per buff stack. */
export interface ShieldStrengthModifier {
  value: number;
}

/** Reduction to duration of elemental auras/debuffs applied to character. */
export interface AuraDurationModifier {
  value: number;
}

/** Healing effectiveness channel. Values are additive fractions per stack. */
export interface HealingModifier {
  kind: "outgoing" | "received";
  value: number;
}

// ---------------------------------------------------------------------------
// Stat Conversions
// ---------------------------------------------------------------------------

/**
 * Valid source stats for dynamic stat conversion passives (e.g. HP -> ATK).
 */
export type StatConversionSourceStat =
  | "hp"
  | "def"
  | "elementalMastery"
  | "energyRecharge"
  | "atk";

/**
 * Declaration of a dynamic stat conversion modifier.
 *
 * Calculated pure and deterministically:
 *   convertedValue = Math.min(maxCap ?? Infinity, Math.max(0, (sourceValue - (threshold ?? 0))) * ratio)
 */
export interface StatConversionModifier {
  sourceStat: StatConversionSourceStat;
  targetStat: StatKey;
  ratio: number;
  /** Threshold above which the source stat starts converting (e.g. 1.0 for ER > 100%, or 200 for EM > 200). */
  threshold?: number;
  /** Maximum cap on the converted value (e.g. 400% of base ATK). */
  maxCap?: number;
  /** Required when `targetStat === "elementalDmgBonus"`; ignored otherwise. */
  element?: Element;
}

/**
 * Per-character base stat values that percentage modifiers and conversion caps scale against.
 */
export interface BaseStatValues {
  /** Character base ATK + weapon base ATK. */
  atk?: number;
  hp?: number;
  def?: number;
}


// ---------------------------------------------------------------------------
// Talent-level modifiers
// ---------------------------------------------------------------------------

/**
 * Which talent a level boost applies to.
 *
 * Matches `PerkTalentSlot` in the generated character data, so an emitted
 * `talentLevelBoost: { slot, levels }` maps onto {@link TalentLevelModifier}
 * with no translation table. The three slots are the only ones the game's
 * constellations raise.
 */
export type TalentSlot = "normal" | "skill" | "burst";

/**
 * A boost to a talent's LEVEL, carried by a buff.
 *
 * WHY THIS IS NOT A `StatKey`: a talent level is not a magnitude that enters
 * `stat = base * (1 + pct) + flat`. It selects a different ROW from the
 * ability's per-level multiplier table, upstream of all stat math. Giving it a
 * `StatKey` would force every consumer of `Stats` to know that one of its
 * numbers is an index rather than a value.
 *
 * DECLARATIVE PLAIN DATA, like every other channel here — a slot and an
 * integer. No predicate function, so it survives `structuredClone` across a
 * Web Worker boundary.
 *
 * CONDITIONALITY comes free: this rides on `Buff`, so a C3 boost is authored as
 * a buff whose `conditions` / activation window gate it, and it resolves
 * through exactly the same machinery as a stat modifier. There is no separate
 * constellation-gating path.
 *
 * COMPOSITION: same-slot boosts ADD and the resulting LEVEL clamps at the game
 * maximum (see `talentLevel.ts`). `levels` is per stack, matching
 * `StatModifier.value`.
 */
export interface TalentLevelModifier {
  slot: TalentSlot;
  /** Levels added for ONE stack. Total = levels * stacks. */
  levels: number;
}

// ---------------------------------------------------------------------------
// Targeting
// ---------------------------------------------------------------------------

/**
 * Who a buff applies to. Evaluated against the character taking the action.
 *
 *  - `party`       every party member, on-field or off.
 *  - `active`      only the character currently on-field.
 *  - `self`        only the character named by `Buff.sourceCharacterId`.
 *  - `characters`  an explicit id allowlist (`characterIds`).
 *
 * `self` is expressed relative to the buff's own source so that authoring data
 * never needs to duplicate the character id in two places.
 */
export type BuffTargetScope = "party" | "active" | "self" | "characters";

export interface BuffTargets {
  scope: BuffTargetScope;
  /** For party/active scopes, omit the buff owner from the target set. */
  excludeSource?: boolean;
  /** Required when `scope === "characters"`. Ignored otherwise. */
  characterIds?: readonly string[];
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

/**
 * Comparison operators available to a declarative resource gate.
 *
 * A closed string union rather than a callback, so a condition stays plain,
 * `structuredClone`-able data. `eq` / `neq` compare with a tolerance (see
 * `RESOURCE_COMPARISON_EPSILON`) because a resource value can be fractional.
 */
export type ResourceComparator = "gte" | "gt" | "lte" | "lt" | "eq" | "neq";

/**
 * Declarative gate on a character-owned RESOURCE (stacks, stance flag, ammo
 * pool). This is what makes "if stacks >= 3, then X" — an extremely common kit
 * shape — expressible without naming a character anywhere.
 *
 * PLAIN DATA BY CONSTRUCTION: resource id + comparator + threshold. There is
 * deliberately no callback form. A predicate function would (a) let impurity
 * (clock, RNG, closure over mutable state) into the resolver and (b) fail to
 * survive `structuredClone` across a Web Worker boundary, both of which the
 * existing condition model exists to prevent.
 *
 * SEMANTICS
 *  - The resource is read from the buffed character's snapshot
 *    (`BuffState.snapshot.characters[characterId].resources`).
 *  - EXPIRY IS HONOURED. A resource with `durationSeconds` whose window has
 *    elapsed by the queried time reads as 0, matching the character module's
 *    lazy-expiry rule. A buff gated on `gte 1` therefore falls off with its
 *    resource, with no scheduled event required.
 *  - A MISSING resource reads as 0 rather than failing the gate outright, so
 *    `lt`/`lte`/`eq 0` behave intuitively ("while I have no stacks"). This is
 *    the one deliberate difference from the energy gate, which fails closed —
 *    see `matchesConditions` for why the two differ.
 */
export interface ResourceCondition {
  /** Resource id, matching the character kit's `ResourceDefinition.id`. */
  resourceId: string;
  comparator: ResourceComparator;
  /** Right-hand side of the comparison. */
  value: number;
  /**
   * Whose resource to read. Defaults to `"self"` — the buffed character.
   *
   * `"source"` reads the resource of `Buff.sourceCharacterId`, which expresses
   * the common "an off-field character's stack count buffs the whole party"
   * shape. A `"source"` gate with no `sourceCharacterId` fails closed.
   */
  owner?: "self" | "source";
}

/**
 * Declarative gate on a buff, evaluated per damage instance. Every field that
 * is present must match (logical AND). Absent fields are "don't care".
 *
 * Kept declarative ON PURPOSE: a predicate function would let callers smuggle
 * impurity (clocks, RNG) into the resolver and would not be serializable across
 * a Web Worker boundary.
 */
export interface BuffCondition {
  /** Only applies to hits of these damage types (normal/charged/skill/burst/...). */
  damageTypes?: readonly DamageType[];
  /** Only applies to hits of these elements. */
  elements?: readonly Element[];
  /** Only applies to these ability ids. */
  abilityIds?: readonly string[];
  /**
   * Only applies when the buffed character is (true) or is not (false) the
   * on-field character at the time of the hit.
   */
  requiresOnField?: boolean;
  /**
   * Energy gate on the buffed character, as a FRACTION of their max energy
   * (0.5 == at least half energy). Inclusive lower bound.
   */
  minEnergyFraction?: number;
  /** Energy gate, inclusive upper bound, as a fraction of max energy. */
  maxEnergyFraction?: number;
  /** Only applies while current energy is strictly below the character's maximum. */
  requiresEnergyBelowMax?: boolean;
  /**
   * Resource gates. ALL listed conditions must hold (logical AND), matching
   * the AND semantics of every other field on `BuffCondition`.
   *
   * A list rather than a single object so a kit can express a conjunction
   * ("3+ stacks AND the stance flag is set") without a nested boolean tree.
   * OR is intentionally NOT expressible: it is authored as two separate `Buff`
   * objects with `stacking.mode === "refresh"`, which keeps this type flat and
   * keeps the resolver branch-free. If a real kit needs OR *within* one buff,
   * raise it rather than nesting — a boolean AST here would be the start of a
   * predicate language.
   */
  resources?: readonly ResourceCondition[];
  /** Only applies while the target enemy has one of these elemental auras. */
  enemyAuraElements?: readonly Element[];
  /** Only applies while the target enemy has one of these compound auras (e.g. frozen). */
  enemyAuraKinds?: readonly string[];
  /** Enemy current HP fraction gates, when the scenario provides HP state. */
  minEnemyHpFraction?: number;
  maxEnemyHpFraction?: number;
  /** Strict enemy HP fraction gates. */
  minEnemyHpFractionExclusive?: number;
  maxEnemyHpFractionExclusive?: number;
  /** Character weapon-type gate used by weapon-restricted artifact bonuses. */
  weaponTypes?: readonly ("sword" | "claymore" | "polearm" | "catalyst" | "bow")[];
  /** Character HP fraction gates, when the scenario provides HP state. */
  minHpFraction?: number;
  maxHpFraction?: number;
  /** Strict character HP fraction gates. */
  minHpFractionExclusive?: number;
  maxHpFractionExclusive?: number;
  /** Shield-state gate for shield-dependent set bonuses. */
  requiresShield?: boolean;
}

// ---------------------------------------------------------------------------
// Stacking
// ---------------------------------------------------------------------------

/**
 * How multiple applications of the SAME buff (same `id`) combine.
 *
 *  - `refresh`     re-application restarts the duration; effect stays 1 stack.
 *                  (Most character/weapon buffs behave this way.)
 *  - `stack`       applications accumulate up to `maxStacks`; each instance
 *                  keeps its OWN expiry, so stacks fall off one at a time.
 *  - `independent` every application is a fully separate instance with its own
 *                  duration and its own full effect (no cap).
 *
 * `refresh` vs `independent` differ observably: with `refresh` two overlapping
 * applications give 1x the effect, with `independent` they give 2x.
 */
export type BuffStackingMode = "refresh" | "stack" | "independent";

export interface BuffStacking {
  mode: BuffStackingMode;
  /**
   * Cap for `mode === "stack"`. Required for `stack`; ignored otherwise.
   * Must be >= 1.
   */
  maxStacks?: number;
}

// ---------------------------------------------------------------------------
// Snapshot semantics
// ---------------------------------------------------------------------------

/**
 * Whether a buff's contribution is captured when the ability is cast
 * (`snapshot`) or re-evaluated at each hit (`dynamic`).
 *
 * The engine reuses one cast-time `SimulationSnapshot` for every hit in a
 * planned ability. The resolver uses that timestamp for snapshot buffs and
 * the hit timestamp for dynamic buffs, so a snapshot contribution remains
 * available across later hits even after its live window has ended.
 */
export type BuffSnapshotMode = "dynamic" | "snapshot";

export const UNSUPPORTED_SNAPSHOT_NOTE =
  "Snapshot buffs are evaluated at the cast timestamp carried by the shared " +
  "cast context; dynamic buffs are evaluated at each hit timestamp.";

// ---------------------------------------------------------------------------
// The buff itself
// ---------------------------------------------------------------------------

/**
 * A buff or debuff. A debuff is just a buff with negative values (or, once the
 * DEF/RES seam exists, one targeting the enemy — see `EnemyModifier` below).
 */
export interface Buff {
  /**
   * Identity used for stacking. Two applications with the same `id` stack
   * according to `stacking`; different ids never interact.
   */
  id: string;
  /** Human-readable provenance for UI/debugging (e.g. "Noblesse Oblige 4pc"). */
  source: string;
  /**
   * Character id that produced this buff, if any. Required when
   * `targets.scope === "self"`.
   */
  sourceCharacterId?: string;
  /** Simulation time (seconds) at which the buff becomes active. */
  startTime: number;
  /**
   * Active window length in seconds. Use `Number.POSITIVE_INFINITY` for a
   * permanent buff (e.g. a weapon passive that is always on).
   */
  duration: number;
  stacking: BuffStacking;
  targets: BuffTargets;
  /** Optional gate; absent means "always applies within the active window". */
  conditions?: BuffCondition;
  /**
   * Character-side stat changes granted, per stack.
   *
   * Optional so a pure debuff (RES shred only) needs no empty array. Absent is
   * equivalent to `[]`.
   */
  modifiers?: readonly StatModifier[];
  /**
   * Optional percentage of the SOURCE character's base ATK to add as flat
   * ATK to each target. This models effects such as Bennett's Burst, whose
   * party bonus is derived from Bennett's Base ATK rather than the recipient's
   * own base. The combat engine materialises this into an `atkFlat` modifier
   * when the buff is created; persisted runtime buffs therefore remain plain
   * data and deterministic.
   */
  sourceBaseAtkPercent?: number;
  /** Character-side elemental/physical RES modifiers, per stack. */
  resistanceModifiers?: readonly CharacterResistanceModifier[];
  /** Character-side shield strength modifiers, per stack. */
  shieldStrengthModifiers?: readonly ShieldStrengthModifier[];
  /** Character-side elemental aura duration reduction, per stack. */
  auraDurationModifiers?: readonly AuraDurationModifier[];
  /** Healing effectiveness, kept separate from damage/stat modifiers. */
  healingModifiers?: readonly HealingModifier[];
  /**
   * Stat conversions carried by this buff (e.g. HP -> ATK, ER -> Electro DMG).
   * Converted values are computed from the character's post-buff stats and
   * folded into the target stat channel.
   */
  conversions?: readonly StatConversionModifier[];
  /**
   * DMG bonus derived from the energy cost of the ability being evaluated.
   * This is distinct from a character-wide conversion: Raiden's Eye, for
   * example, scales the target's Burst DMG bonus by that target Burst's cost.
   */
  energyCostDmgBonus?: {
    ratio: number;
    maxCap?: number;
    damageTypes?: readonly DamageType[];
  };
  /**
   * Enemy-side debuffs (DEF/RES shred) carried by this buff, per stack.
   *
   * Gated by exactly the same window / targeting / condition rules as
   * `modifiers`, so a single data object can express "while active, this
   * character's team gets ATK% AND the enemy loses Pyro RES".
   *
   * NOTE on targeting: shred is a property of the ENEMY, not of a character,
   * but `targets` still decides whether the buff is live for the hit being
   * evaluated. Use `scope: "party"` for a debuff that applies to every
   * attacker (the usual case); a narrower scope models "only this character's
   * hits benefit".
   */
  enemyModifiers?: readonly EnemyModifier[];
  /**
   * Talent-level boosts carried by this buff, per stack.
   *
   * Gated by exactly the same window / targeting / condition rules as
   * `modifiers` and `enemyModifiers`, so "at C3, Elemental Skill is 3 levels
   * higher" is authored as one permanent, self-targeted buff whose activation
   * is decided by the constellation gate — no special-case path.
   *
   * Consumed end-to-end by the combat engine: unlocked perk buffs are
   * harvested, `sumTalentLevelBoosts()` produces the deltas, and talent lookup
   * applies them before selecting a row from the ability's talent table.
   */
  talentLevelModifiers?: readonly TalentLevelModifier[];
  snapshotMode?: BuffSnapshotMode;
}

// ---------------------------------------------------------------------------
// Enemy-side modifiers (DEF / RES shred) — DECLARED, NOT WIRED
// ---------------------------------------------------------------------------

/**
 * Enemy-facing debuff channels. These are mechanics-owned concepts but the
 * damage pipeline that would consume them is combat-engineer's file, and the
 * frozen `BuffResolver` signature only returns `Stats` — it has no channel for
 * enemy-side output.
 *
 * UNSUPPORTED: these are declared so authoring data is future-proof, and
 * `getEnemyModifiers()` can compute them, but NOTHING consumes them yet. A seam
 * on the damage pipeline is required. Reported to Manager (TASK #004).
 */
export type EnemyModifierKey =
  /** Fractional DEF reduction (0.2 == -20% enemy DEF). */
  | "defReduction"
  /** Fractional DEF ignore, multiplicative with defReduction in game. */
  | "defIgnore"
  /** Flat RES reduction in fractions (0.4 == -40% RES), per element. */
  | "resReduction";

export interface EnemyModifier {
  key: EnemyModifierKey;
  value: number;
  /** Required for `resReduction`; ignored otherwise. */
  element?: Element;
}

/** Aggregated enemy-side debuff totals at a point in time. */
export interface EnemyModifierTotals {
  defReduction: number;
  defIgnore: number;
  resReduction: Partial<Record<Element, number>>;
}

// ---------------------------------------------------------------------------
// State the buff layer reads
// ---------------------------------------------------------------------------

/**
 * Everything `getActiveBuffs` needs. Deliberately NOT the engine's mutable
 * state: a read-only, serializable view so this layer can never write back.
 */
export interface BuffState {
  /** All buffs known to the run, active or not. Order is irrelevant. */
  buffs: readonly Buff[];
  /** Runtime view used to evaluate conditions. Optional for pure-time queries. */
  snapshot?: SimulationSnapshot;
}

/**
 * Query describing WHO is being evaluated and for WHICH hit. Everything is
 * optional except the character, so `getActiveBuffs` can answer both
 * "what is on this character right now" (UI) and the narrower per-hit question
 * the resolver asks.
 */
export interface BuffQuery {
  character: CharacterDefinition;
  ability?: AbilityDefinition;
  activeCharacterId?: string;
  enemy?: EnemyState;
}

/** A buff that passed activation + targeting + conditions, with its stack count. */
export interface ActiveBuff {
  buff: Buff;
  /** Effective stacks at the queried time (>= 1). */
  stacks: number;
}

// ---------------------------------------------------------------------------
// Snapshot & Stance abstractions
// ---------------------------------------------------------------------------

/**
 * Declarative snapshot policy for an ability or damage instance.
 *
 * In Genshin:
 *  - `snapshot`: Character stats (ATK, DMG%, Crit, EM) are captured at cast start
 *    and applied to all subsequent hits/ticks of the ability (e.g. Xiangling burst,
 *    Beidou burst, Ganyu burst). Enemy-side DEF/RES shred remains dynamic.
 *  - `dynamic`: Character stats are re-evaluated in real time at the moment each
 *    individual hit lands (e.g. Xingqiu rain swords, Yelan burst, Nahida tri-karma).
 */
export interface SnapshotPolicy {
  mode: BuffSnapshotMode;
  /**
   * Whether enemy-side shred (DEF reduction/ignore, RES shred) is dynamic even
   * when character stats snapshot. Defaults to true (standard Genshin behaviour).
   */
  dynamicEnemyModifiers?: boolean;
}

/**
 * Snapshot flags that can be attached to an ability definition.
 */
export interface AbilitySnapshotConfig {
  snapshotMode: BuffSnapshotMode;
}

/**
 * Plain-data declaration of a character stance or combat mode.
 *
 * Examples in Genshin: Hu Tao E, Raiden Q, Childe E, Noelle Q, Yoimiya E, Cyno Q, Xiao Q.
 * Provides a clean authoring contract for stance buff packages, infusions,
 * and swap cancellation without custom logic.
 */
export interface StanceDefinition<TNormal = unknown, TAbility = unknown> {
  id: string;
  name: string;
  durationSeconds: number;
  /**
   * Whether swapping off-field cancels the stance immediately.
   * True for most stances in Genshin (Hu Tao, Raiden, Xiao, Cyno, Yoimiya).
   * False for stances that persist across swaps (Noelle Q).
   * Defaults to true when omitted.
   */
  endsOnSwap?: boolean;
  /** Weapon infusion granted while this stance is active. */
  infusion?: InfusionDefinition;
  /** Direct stat modifiers active during the stance. */
  modifiers?: readonly StatModifier[];
  /** Stat conversions active during the stance (e.g. HP -> ATK, DEF -> ATK). */
  conversions?: readonly StatConversionModifier[];
  /** Enemy-side shred applied during the stance. */
  enemyModifiers?: readonly EnemyModifier[];
  /** Damage type override (e.g. attacks counting as burst damage). */
  damageTypeOverride?: DamageType;
  /** Coordinated attacks or triggered procs activated by the stance. */
  triggers?: readonly TriggeredEffectDefinition<TAbility>[];
  /** Snapshot policy for buffs created by this stance. Defaults to "dynamic". */
  snapshotMode?: BuffSnapshotMode;
  /** Replacement normal attack string while this stance is active (e.g. Childe E, Raiden Q). */
  normalAttacks?: TNormal;
  /** Replacement charged attack while this stance is active. */
  chargedAttack?: TAbility;
  /** Replacement plunge attack while this stance is active. */
  plungeLow?: TAbility;
  plungeHigh?: TAbility;
  /** Replacement skill while this stance is active. */
  skill?: TAbility;
  /** Replacement burst while this stance is active. */
  burst?: TAbility;
  /** Buffs applied when this stance naturally expires or is cancelled. */
  stateEndBuffs?: readonly Buff[];
}

/**
 * A resolved package of runtime objects produced by entering a stance.
 */
export interface StancePackage {
  buff: Buff;
  infusion?: {
    infusion: InfusionDefinition;
    startTime: number;
  };
  triggers?: readonly TriggeredEffectDefinition[];
}

/**
 * Construct a standard Buff object from a StanceDefinition.
 * Pure and deterministic.
 */
export function createStanceBuff(
  stance: StanceDefinition,
  characterId: string,
  startTime: number,
): Buff {
  const endsOnSwap = stance.endsOnSwap ?? true;
  return {
    id: stance.id,
    source: stance.name,
    sourceCharacterId: characterId,
    startTime,
    duration: stance.durationSeconds,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: endsOnSwap ? { requiresOnField: true } : undefined,
    modifiers: stance.modifiers,
    conversions: stance.conversions,
    enemyModifiers: stance.enemyModifiers,
    snapshotMode: stance.snapshotMode ?? "dynamic",
  };
}

/**
 * Construct a complete StancePackage (buff, infusion entry, triggers) from a StanceDefinition.
 * Pure and deterministic.
 */
export function createStancePackage(
  stance: StanceDefinition,
  characterId: string,
  startTime: number,
): StancePackage {
  return {
    buff: createStanceBuff(stance, characterId, startTime),
    infusion: stance.infusion
      ? {
          infusion: stance.infusion,
          startTime,
        }
      : undefined,
    triggers: stance.triggers,
  };
}

/** Re-exported for convenience so consumers import one module. */
export type { Stats };
