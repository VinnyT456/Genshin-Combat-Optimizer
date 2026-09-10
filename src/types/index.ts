// ============================================================================
// Core domain types for the Genshin combat simulator.
//
// These types are engine-facing only — they carry no React or UI concerns and
// can be imported by any pure TypeScript module. New game content is expressed
// entirely as data conforming to these shapes; the combat engine never needs to
// change to add a character, weapon, or enemy.
// ============================================================================

export type Element =
  | "pyro"
  | "hydro"
  | "electro"
  | "cryo"
  | "anemo"
  | "geo"
  | "dendro"
  | "physical";

/** Playable weapon categories used by conditional artifact effects. */
export type WeaponType =
  | "sword"
  | "claymore"
  | "polearm"
  | "catalyst"
  | "bow";

/**
 * Kind of damage an instance represents.
 *
 * `"reaction"` is NOT an action slot — no rotation can request it. It labels
 * the independent instances transformative reactions (overload, swirl, bloom,
 * ...) emit, which do not crit and do not scale off the trigger's stats. It is
 * kept in this union so a consumer can filter reaction damage out of a
 * per-slot breakdown without a second field.
 */
export type DamageType =
  | "normal"
  | "charged"
  | "plunge"
  | "skill"
  | "burst"
  | "reaction";

/**
 * An action a rotation can request.
 *
 * WIDENED (was `normal | charged | skill | burst | swap`) so that every slot a
 * kit can express is also ADDRESSABLE by a rotation. Plunging attacks were
 * describable (`DamageType` has `"plunge"`) and authorable (`AbilitySlot` has
 * `plungeLow`/`plungeHigh`) but could not be REQUESTED — so a search could
 * never generate one, and a validator cannot reject a candidate that was never
 * proposed. The names match `AbilitySlot` exactly so the two do not drift.
 *
 * Additive: every previously valid `ActionType` is still valid, and nothing
 * that consumes the union exhaustively is required to handle the new members
 * (`abilityForAction` returns `undefined` for a slot the character lacks,
 * yielding the existing `unknown-ability` rejection).
 */
export type ActionType =
  | "normal"
  | "charged"
  | "plungeLow"
  | "plungeHigh"
  | "skill"
  | "burst"
  | "swap";

/**
 * Action types that resolve to a damaging ability (everything except `swap`).
 * Named so callers can narrow without restating the union.
 */
export type AbilityActionType = Exclude<ActionType, "swap">;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * The three stat channels that Genshin scales by PERCENTAGE off a BASE value.
 *
 * In game, ATK%/HP%/DEF% multiply `characterBase + weaponBase` ONLY — never the
 * already-accumulated flat bonuses and never the final stat:
 *
 *     stat = base * (1 + sum(pct)) + sum(flat)
 *
 * Artifact main stats and substats are overwhelmingly percentage rolls, so a
 * model that cannot see `base` cannot compute an artifact build at all. It can
 * only skip those modifiers (understating) or apply them to final (badly
 * overstating) — both produce plausible-looking numbers that are wrong by tens
 * of percent, which is worse than failing.
 *
 * These are the ONLY three channels with a base/percentage split. EM, Crit
 * Rate, Crit DMG and ER are pure additive fractions in game and have no `%`
 * channel, so they deliberately have no entry here.
 */
export interface BaseStats {
  /** Character base ATK + weapon base ATK. Percentage ATK scales THIS. */
  atk: number;
  /** Character base HP. Percentage HP scales THIS. */
  hp: number;
  /** Character base DEF. Percentage DEF scales THIS. */
  def: number;
}

/**
 * Fully-resolved combat stats for a character at a point in time. This is the
 * flat bag the damage pipeline reads from — all bonuses (weapon, artifacts,
 * buffs) are expected to be folded into these numbers before damage is
 * computed.
 *
 * BASE/FINAL SPLIT: `atk`/`hp`/`def` are FINAL values (what the damage pipeline
 * multiplies). `base` carries the corresponding BASE values that percentage
 * modifiers scale. The two are separate fields because they are separate
 * quantities — collapsing them is the modelling bug this split exists to
 * prevent.
 *
 * `base` is OPTIONAL so that every pre-existing `Stats` literal in data and
 * tests remains valid. When it is ABSENT, percentage modifiers are SKIPPED and
 * REPORTED rather than misapplied — failing loudly beats silently inflating
 * damage. Use {@link withBaseStats} to attach it.
 */
export interface Stats {
  /** FINAL ATK (base * (1 + ATK%) + flat ATK). */
  atk: number;
  /** FINAL HP. */
  hp: number;
  /** FINAL DEF. */
  def: number;
  /**
   * BASE ATK/HP/DEF that percentage modifiers scale. Absent => percentage
   * modifiers on those three channels are skipped and reported.
   */
  base?: BaseStats;
  elementalMastery: number;
  /** Crit rate as a fraction, e.g. 0.5 == 50%. */
  critRate: number;
  /** Crit damage as a fraction, e.g. 1.0 == +100%. */
  critDmg: number;
  /** Energy recharge as a fraction, e.g. 1.0 == 100%. */
  energyRecharge: number;
  /** Generic DMG% bonus applied to every instance. */
  dmgBonus: number;
  /** Per-element DMG% bonus, keyed by element. */
  elementalDmgBonus: Partial<Record<Element, number>>;
  /** Per-damage-type DMG% bonus (normal, charged, skill, burst, plunge), e.g. Emblem 4pc, Troupe 4pc. */
  typeDmgBonus?: Partial<Record<DamageType, number>>;
  /**
   * Per-reaction DMG bonus fractions (`ReactionBonus` in the KQM formula).
   *
   * Source: KQM TCL `combat-mechanics/damage/damage-formula`, which names this
   * term in all three reaction formulas (Amplifying / Transformative /
   * Additive) and lists its sources: Crimson Witch 4pc, Mona C1, Thundering
   * Fury 4pc, Viridescent Venerer 4pc, Nilou A4.
   *
   * PER-REACTION, NOT A SCALAR — this shape is load-bearing. Crimson Witch 4pc
   * grants +15% to Vaporize and Melt ONLY; Viridescent Venerer 4pc grants +60%
   * to Swirl only; Thundering Fury 4pc covers Overloaded / Electro-Charged /
   * Superconduct / Aggravate. A single scalar would leak every one of those
   * onto every other reaction. Absent / missing key reads as 0.
   */
  reactionBonus?: ReactionBonusMap;
  /**
   * `AdditiveBaseDMGBonus` from non-reaction sources, in raw damage units.
   *
   * Source: KQM TCL `combat-mechanics/damage/damage-formula`, "Additive Base
   * DMG Sources" — Zhongli A4, Shenhe's Icy Quills, Yun Jin's Cliffbreaker's
   * Banner, Xianyun A4, Hu Tao C2, Redhorn Stonethresher, Echoes of an
   * Offering 4pc, and others. All of them feed the SAME formula term as
   * Aggravate/Spread, so they share one channel.
   *
   * Flat, NOT a fraction: it is added to base damage, not multiplied by it.
   * Absent reads as 0.
   */
  flatDamageBonus?: number;
  /**
   * `BaseDMGMultiplier` — per-damage-type multiplier on the TALENT motion
   * value, keyed by the damage type it buffs.
   *
   * Source: KQM TCL `combat-mechanics/damage/damage-formula`, section
   * "Base DMG Multiplier": "Unlike other bonuses, these are directly
   * multiplicative with base Talent scaling. They can be considered a
   * multiplier of the Talent motion value." Named sources: Yoimiya's Niwabi
   * Fire-Dance (Normal Attacks), Xingqiu C4 Evilsoother (1.5 on his Skill),
   * Wanderer's Hanega: Song of the Wind (Normal Attacks), Electro Traveler C6
   * World-Shaker (2).
   *
   * This is NOT a DMG% bonus: the KQM Yoimiya page states "The DMG Bonus from
   * Niwabi Fire-Dance is multiplicative" and that it "does not increase Yun
   * Jin's Cliffbreaker's Banner bonus" — Yun Jin's is an AdditiveBaseDMGBonus,
   * so BaseDMGMultiplier must apply strictly INSIDE the sigma, before the
   * additive term is added.
   *
   * Absent / missing key reads as 1 (no multiplier), never 0.
   */
  baseDmgMultiplier?: Partial<Record<DamageType, number>>;
}

/**
 * Reactions that can carry a `ReactionBonus`.
 *
 * Declared HERE rather than imported from `src/simulation/reactions` because
 * `src/types` is the root of the dependency graph and imports nothing — the
 * mechanics layer imports it, not the other way round. Kept structurally
 * identical to the damage-bearing members of mechanics' `ReactionKind`; the
 * pure-utility reactions (`frozen`, `quicken`, `crystallize`) are excluded
 * because they deal no damage and so have nothing for a bonus to scale.
 */
export type ReactionBonusKey =
  | "vaporize"
  | "melt"
  | "overloaded"
  | "superconduct"
  | "electroCharged"
  | "swirl"
  | "shattered"
  | "burning"
  | "bloom"
  | "hyperbloom"
  | "burgeon"
  | "aggravate"
  | "spread";

/** Per-reaction bonus fractions. A missing key means 0, not "no reaction". */
export type ReactionBonusMap = Partial<Record<ReactionBonusKey, number>>;

/** No reaction bonuses. Shared frozen default so callers need not allocate. */
export const NO_REACTION_BONUS: ReactionBonusMap = Object.freeze({});

/**
 * `BaseDMGMultiplier` for one damage type, defaulting to 1.
 *
 * The default is 1 (identity), NOT 0: an absent entry means "this talent has
 * no Base DMG Multiplier", which per KQM is the `otherwise` branch of the
 * piecewise definition and equals 1. Reading it as 0 would zero the talent.
 *
 * Negative values are clamped to 0 — a multiplier cannot invert damage — while
 * values above 1 are left alone, since real ones exceed 1 (Xingqiu C4 is 1.5,
 * Electro Traveler C6 is 2).
 */
export function baseDmgMultiplierFor(
  stats: Stats,
  damageType: DamageType,
): number {
  const value = stats.baseDmgMultiplier?.[damageType];
  if (value === undefined) return 1;
  return Math.max(0, value);
}

/**
 * Reads the base value of one percentage-scaling channel.
 *
 * Returns `undefined` when no base is attached, which callers MUST treat as
 * "I cannot scale this percentage" rather than substituting the final value.
 * Substituting final is precisely the ATK%-on-final-ATK bug.
 */
export function baseStatOf(
  stats: Stats,
  channel: keyof BaseStats,
): number | undefined {
  return stats.base?.[channel];
}

/**
 * Attaches base ATK/HP/DEF to a stat bag, returning a NEW object.
 *
 * Use this at the point where a character's base values are known (the engine,
 * when it reads a character definition) so that everything downstream — buff
 * resolver, stance modifiers, artifact and weapon folding — can scale
 * percentages correctly without any signature change.
 *
 * PURE: never mutates `stats`.
 */
export function withBaseStats(stats: Stats, base: BaseStats): Stats {
  return { ...stats, base: { ...base } };
}

/**
 * Base values implied by a stat bag that has none attached.
 *
 * SELF-BASE ASSUMPTION, stated explicitly because it is load-bearing: a
 * character definition authored with no weapon and no artifacts has
 * `final == base` by definition, so its own `atk`/`hp`/`def` ARE its base
 * values. This is the correct reading of every existing character in
 * `src/game-data` (verified: their `baseStats.atk` values are character base
 * ATK, e.g. Amber 223, not a geared final ATK).
 *
 * It is a SEPARATE named function rather than a default inside the resolver so
 * that the assumption is visible at each call site and cannot be silently
 * applied to an already-geared stat bag, which would double-count the gear.
 */
export function impliedBaseStats(stats: Stats): BaseStats {
  return { atk: stats.atk, hp: stats.hp, def: stats.def };
}

/**
 * Applies the canonical Genshin channel formula to ONE channel:
 *
 *     final = base * (1 + pct) + flat
 *
 * expressed as a DELTA on an incoming final value, so contributions already
 * folded in (weapon base ATK, artifact flat ATK) are preserved rather than
 * recomputed.
 *
 * `base === undefined` means the percentage cannot be scaled. The flat part is
 * still applied and the caller is told the percentage was dropped — the
 * fail-loud path.
 */
export function foldStatChannel(
  finalValue: number,
  base: number | undefined,
  percent: number,
  flat: number,
): { value: number; percentApplied: boolean } {
  if (percent === 0) return { value: finalValue + flat, percentApplied: true };
  if (base === undefined) {
    return { value: finalValue + flat, percentApplied: false };
  }
  return { value: finalValue + base * percent + flat, percentApplied: true };
}

// ---------------------------------------------------------------------------
// Abilities & characters
// ---------------------------------------------------------------------------

export interface AbilityDefinition {
  id: string;
  name: string;
  /** Which action slot triggers this ability. */
  actionType: ActionType;
  element: Element;
  damageType: DamageType;
  /**
   * Talent multiplier applied to the scaling stat, as a fraction.
   * e.g. 2.0 == 200% of ATK.
   */
  multiplier: number;
  /** Which stat the multiplier scales off. Phase 1 supports ATK only. */
  scaling: "atk";
  /** Seconds the action occupies on the timeline. */
  castTime: number;
  /** Seconds before the ability can be used again. 0 == no cooldown. */
  cooldown: number;
  /** Energy cost to cast (bursts). 0 for non-burst abilities. */
  energyCost: number;
  /**
   * Flat energy granted directly to the caster on cast (Phase 1 model).
   * Retained for backwards compatibility and for abilities that grant flat
   * energy rather than particles (e.g. "restores N energy" effects).
   *
   * NOTE: flat energy of this kind is NOT multiplied by Energy Recharge in
   * game. The particle path (`particles`) IS multiplied by ER.
   */
  energyGenerated: number;
  /**
   * Particle emission for the Phase 2 particle model. Optional: when absent the
   * ability emits no particles and only `energyGenerated` applies.
   *
   * UNCERTAIN (game data, not engine): real per-ability particle counts and
   * their internal cooldowns are character-specific and are NOT modelled here.
   * Whoever authors game-data must supply measured values; the engine only
   * consumes what it is given.
   */
  particles?: ParticleEmission;

  // --- Elemental application (requested by mechanics, TASK #023) ----------
  //
  // All four OPTIONAL, so this is additive and no existing data changes.
  // Mechanics' `ElementalAbility` is an INTERSECTION with this interface
  // rather than a redeclaration, so landing these collapses it to a no-op
  // with no call-site churn.
  //
  // THE DEFAULTING RULES MATTER MORE THAN THE FIELDS. If this module and
  // `src/simulation/reactions` disagree here, damage comes out wrong with no
  // error anywhere. They are stated in both places on purpose.

  /**
   * Gauge units this ability applies per APPLYING hit.
   *
   * ABSENT => 0U. This FAILS CLOSED: an ability nobody has authored
   * application data for produces NO reactions, rather than inventing 1U and
   * fabricating reaction damage that looks plausible.
   */
  application?: { gauge: number };
  /**
   * ICD behaviour for this ability.
   *
   * ABSENT => the documented 2.5s / 3-hit standard, which is the behaviour of
   * "most character abilities". Only MEANINGFUL for an ability that declares
   * an {@link AbilityDefinition.application} — with no application there is
   * nothing for an ICD to gate.
   *
   * Deviations (no ICD at all, 1s/3hits, 5s/5hits, 0.5s) are DATA, never a
   * code branch. Structurally identical to the mechanics layer's
   * `IcdBehaviour`; declared here because `src/types` sits BELOW mechanics in
   * the layering and must not import upward.
   */
  icd?:
    | { mode: "standard" }
    | { mode: "none" }
    | { mode: "custom"; config: { intervalSeconds: number; hits: number } };
  /**
   * Shared ICD counter key. Abilities declaring the SAME group advance one
   * counter together — the game does this for e.g. Normal and Charged attacks
   * on most sword users.
   *
   * ABSENT => the ability's own `id`, i.e. an independent ICD. Sharing is
   * opt-in, so an un-authored ability never silently borrows another's window.
   */
  icdGroup?: string;
  /**
   * Hits produced by one cast, for multi-hit abilities. ABSENT => 1.
   *
   * Each hit is tested against the ICD counter separately, which is what makes
   * the 1st/4th/7th application pattern fall out of a multi-hit ability.
   */
  hitCount?: number;
}

/**
 * A batch of energy particles produced by an ability.
 *
 * Genshin distinguishes particles (3 energy on-element base) from orbs
 * (9 energy on-element base). We model the base per-unit value explicitly so
 * game-data can express either without an engine change.
 */
export interface ParticleEmission {
  /** Number of particles/orbs generated. */
  count: number;
  /**
   * Element of the particle. Particles matching the receiving character's
   * element are worth full value; non-matching elemental particles are worth
   * less; `physical` here denotes colourless particles.
   */
  element: Element;
  /**
   * Base energy per unit for an on-element receiver.
   * Defaults to {@link PARTICLE_BASE_ENERGY} when omitted.
   */
  baseEnergyPerUnit?: number;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  element: Element;
  level: number;
  /** Base stats before weapon/artifact/buff contributions. */
  baseStats: Stats;
  maxEnergy: number;
  normalAttack: AbilityDefinition;
  chargedAttack: AbilityDefinition;
  elementalSkill: AbilityDefinition;
  elementalBurst: AbilityDefinition;
  /** Current constellation level (0..6). Defaults to 0 or character default. */
  constellation?: number;
  /** Talent levels (1..10+). */
  talentLevels?: { normal: number; skill: number; burst: number };
  /** Weapon category, when known (legacy fixtures may omit it). */
  weaponType?: WeaponType;
}

// ---------------------------------------------------------------------------
// Support tier (N9) — AUTHORED, never inferred
// ---------------------------------------------------------------------------

/**
 * How completely this project simulates a character.
 *
 *  - `FULL`            every mechanic that materially affects damage is modelled.
 *  - `BASIC`           abilities and scaling are modelled; nothing special is claimed.
 *  - `PARTIAL`         a defining mechanic is NOT implemented. `tierReason` says which.
 *  - `DATA_ONLY`       stats/multipliers exist; no mechanics are simulated.
 *  - `NOT_IMPLEMENTED` nothing is simulated. The least supported tier.
 *
 * This is a CLAIM THE AUTHOR MAKES, not a derived value. Deriving it from
 * "does the data have an effects array" would make a character whose special
 * mechanic is missing look fully simulated the moment someone authored a
 * plausible-looking kit — which is this project's signature failure mode.
 *
 * qa's coverage matrix DERIVES a separate tier from what is actually
 * implemented and tested. The two are deliberately independent: the authored
 * tier is the claim, the derived tier is the check, and a DISAGREEMENT BETWEEN
 * THEM IS A DEFECT worth surfacing. Neither must ever be computed from the
 * other.
 *
 * CANONICAL SPELLING: SCREAMING_SNAKE, exactly one spelling per tier.
 *
 * This union previously carried BOTH casings of the same tiers
 * (`"FULL" | ... | "full" | "basic" | "partial"`), which meant the type system
 * could not catch a casing inconsistency — and the data had already drifted
 * (45 `"FULL"` vs 7 `"full"`, 47 `"PARTIAL"` vs 1 `"partial"`). The dual
 * casing was compensated for downstream by an explicit both-spellings ternary,
 * which is the tell: the union had been widened to accommodate drift instead
 * of the drift being fixed, and any spelling not named in that check fell
 * through silently.
 *
 * That matters more than tidiness here. The support tier is how a user learns
 * that a character's special mechanics are NOT simulated, so a tier that can be
 * silently wrong from a casing typo defeats its own purpose.
 */
export type SupportTier =
  | "FULL"
  | "BASIC"
  | "PARTIAL"
  | "DATA_ONLY"
  | "NOT_IMPLEMENTED";

/**
 * The LEAST supported tier. Used as the fail-closed default.
 *
 * Under-promising is recoverable; over-promising is not. An unrecognised or
 * absent tier must therefore resolve here, never to `"FULL"`.
 */
export const LEAST_SUPPORTED_TIER: SupportTier = "NOT_IMPLEMENTED";

/**
 * Does this tier claim that everything materially affecting damage is modelled?
 *
 * TOTAL over the union with a `never` exhaustiveness check, so adding a tier is
 * a COMPILE ERROR here rather than a silent fall-through to one branch. This is
 * the same discipline as `damageTypeForActionType()`, and for the same reason:
 * the dangerous failure is a new member defaulting to the permissive answer.
 */
export function isFullSupport(tier: SupportTier): tier is "FULL" {
  switch (tier) {
    case "FULL":
      return true;
    case "BASIC":
    case "PARTIAL":
    case "DATA_ONLY":
    case "NOT_IMPLEMENTED":
      return false;
    default: {
      // Unreachable. Exists so an unmapped new member fails to compile.
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

/**
 * An authored support-tier claim.
 *
 * `tierReason` is REQUIRED for every tier BELOW `FULL` and forbidden at `FULL`,
 * enforced by the union below: a reduced claim with no stated gap is exactly
 * the silent half-support this field exists to prevent.
 *
 * Spellings are canonical (see {@link SupportTier}) — no dual casing.
 */
export type SupportClaim =
  | { supportTier: "FULL"; tierReason?: undefined }
  | {
      supportTier: "BASIC" | "PARTIAL" | "DATA_ONLY" | "NOT_IMPLEMENTED";
      /** Which mechanic is missing, in one user-facing sentence. */
      tierReason: string;
    };

// ---------------------------------------------------------------------------
// Character identity & elemental forms (N10)
// ---------------------------------------------------------------------------

/**
 * The identity of a playable character — "which character is this", answered
 * independently of any configuration or elemental form.
 *
 * BRANDED on purpose. A party duplicate-guard must compare IDENTITIES, and the
 * Traveler is one character with six swappable elemental forms. If identity ids
 * and form ids were both bare `string`, `slotA.id === slotB.id` would compile
 * while comparing an Anemo form to a Geo form and reporting two DIFFERENT
 * characters — letting two Travelers into one party undetected.
 *
 * The brand makes that comparison a TYPE ERROR rather than a subtle bug: a
 * `CharacterFormId` cannot be passed where a `CharacterIdentityId` is expected.
 * @see isSameCharacter
 */
export type CharacterIdentityId = string & { readonly __brand: "identity" };

/**
 * The id of one elemental FORM of a character. Distinct from
 * {@link CharacterIdentityId} so the two can never be confused.
 *
 * A form is what actually gets simulated (it has its own abilities and its own
 * support tier); the identity is what a duplicate guard reasons about.
 */
export type CharacterFormId = string & { readonly __brand: "form" };

/** One selectable elemental form. Most characters have exactly one. */
export interface CharacterForm {
  formId: CharacterFormId;
  /** The element this form plays as. */
  element: Element;
  /**
   * Label for the form alone, e.g. `"Anemo form"`. NOT the character name —
   * the Traveler is never renamed to "Anemo Traveler".
   */
  formLabel: string;
  /**
   * Support tier OF THIS FORM. Per-form because forms are implemented
   * independently and their tiers genuinely differ; collapsing them to one
   * character-level tier would overstate the weaker ones.
   */
  claim: SupportClaim;
}

/**
 * A roster entry: ONE character, carrying its list of elemental forms.
 *
 * This is the N10 shape. The Traveler is a SINGLE entry whose `forms` has six
 * members — not six entries sharing an identity field, and not six copies.
 * Because there is exactly one entry per character, the natural thing a
 * consumer reaches for (`entry.identityId`) is already the correct duplicate
 * key, and there is no per-element entry to accidentally key on instead.
 */
export interface CharacterRosterEntry {
  /** Stable identity. THE duplicate-guard key. */
  identityId: CharacterIdentityId;
  /** Display name. `"Traveler"`, never `"Anemo Traveler"`. */
  name: string;
  /**
   * Selectable elemental forms, in a fixed authored order.
   *
   * Length 1 for an ordinary character; 6 for the Traveler. Non-empty by
   * contract — a character with no form cannot be simulated.
   */
  forms: readonly [CharacterForm, ...CharacterForm[]];
}

/** True when the entry offers a choice of element (i.e. the Traveler). */
export function hasMultipleForms(entry: CharacterRosterEntry): boolean {
  return entry.forms.length > 1;
}

/**
 * A character PLACED in a party slot: an identity plus the chosen form.
 *
 * `formId` is optional because §5.4 requires a Traveler to enter a slot with
 * NO form chosen, rather than silently defaulting to one element — defaulting
 * would put a character the user never picked into the party and make every
 * downstream number wrong for the wrong element.
 */
export interface PlacedCharacter {
  identityId: CharacterIdentityId;
  /** Undefined means "form not chosen yet"; blocks simulation. */
  formId?: CharacterFormId;
}

/**
 * Are these the same character? THE duplicate-guard predicate.
 *
 * Compares identities and nothing else, so two Travelers in different forms
 * correctly answer `true` (and are rejected from one party). Writing the wrong
 * check is hard by construction: `formId` is a different branded type, so
 * comparing forms here would not typecheck, and there is only one roster entry
 * per character to key on in the first place.
 */
export function isSameCharacter(a: PlacedCharacter, b: PlacedCharacter): boolean {
  return a.identityId === b.identityId;
}

/** The chosen form of a placed character, or undefined if none is chosen. */
export function formOf(
  entry: CharacterRosterEntry,
  placed: PlacedCharacter,
): CharacterForm | undefined {
  if (placed.formId === undefined) return undefined;
  return entry.forms.find((f) => f.formId === placed.formId);
}

/**
 * Is this party legal with respect to duplicates?
 *
 * Provided so no consumer hand-rolls the guard. Empty slots are ignored;
 * a formless Traveler still counts as present, because it is the IDENTITY that
 * may not repeat.
 */
export function findDuplicateIdentity(
  party: readonly (PlacedCharacter | undefined)[],
): CharacterIdentityId | undefined {
  const seen = new Set<CharacterIdentityId>();
  for (const placed of party) {
    if (placed === undefined) continue;
    if (seen.has(placed.identityId)) return placed.identityId;
    seen.add(placed.identityId);
  }
  return undefined;
}

/**
 * Per-character energy bookkeeping. Kept as its own object so the energy
 * module owns it and future fields (particle ICD windows, energy-gain
 * multipliers) are additive.
 */
export interface EnergyState {
  /** Current energy, clamped to [0, maxEnergy]. */
  current: number;
  /** Cap, mirrored from the definition for self-contained resume. */
  max: number;
  /** Total energy gained over the run (diagnostics / optimizer heuristics). */
  totalGained: number;
  /** Total energy spent on bursts over the run. */
  totalSpent: number;
}

/** Declarative adjustment applied to a single energy gain before clamping. */
export interface EnergyGainModifier {
  /** Multiplicative factor; omitted means 1. */
  multiplier?: number;
  /** Flat energy added after multiplication; omitted means 0. */
  flat?: number;
}

/**
 * Cooldown bookkeeping: abilityId -> absolute timestamp (seconds) at which the
 * ability becomes usable again. An absent key means "ready".
 */
export type CooldownState = Readonly<Record<string, number>>;

export interface ActiveStanceState<TStance = unknown> {
  stance: TStance;
  startTime: number;
}

/** Mutable per-character state tracked during a simulation. */
export interface CharacterState {
  definition: CharacterDefinition;
  /** Generic character definition when lifted or provided. */
  genericDefinition?: unknown;
  /**
   * @deprecated Phase 1 mirror of `energy.current`. Read `energy` instead.
   *
   * NOW OPTIONAL AND NO LONGER MAINTAINED BY THE ENGINE (B4). It was verified
   * write-only — three assignments in `simulateRotation`, zero reads anywhere
   * in the repo — so it carried no information and could only ever drift out
   * of sync with `energy.current`, which is the single source of truth.
   *
   * Made optional rather than deleted outright because it is a PUBLIC field on
   * a public type: ~12 qa-owned test files plus `optimizer/actionGenerator.ts`
   * construct `CharacterState` literals containing it. Optional keeps every
   * one of those compiling unchanged while removing the drift risk, and lets
   * the field be deleted in a later, purely mechanical sweep.
   *
   * Anything still setting it is writing to a field nothing reads.
   */
  currentEnergy?: number;
  energy: EnergyState;
  /** Optional runtime HP state (when a scenario models incoming damage/healing). */
  maxHp?: number;
  currentHp?: number;
  shielded?: boolean;
  /** Map of abilityId -> timestamp at which it becomes available again. */
  cooldowns: Record<string, number>;
  /**
   * Next position in the normal-attack string (0 == N1). Advances on every
   * normal attack and wraps at the string length when the string loops.
   *
   * Tracked as STATE because the string is a looping sequence: which ability
   * `actionType: "normal"` resolves to depends on how many normals preceded
   * it. Nothing tracked this before, so N1 and N2 were indistinguishable.
   *
   * OPTIONAL so that constructing a `CharacterState` literal stays
   * source-compatible; absent is read as 0 (N1) everywhere via
   * `normalStringIndexOf()`.
   */
  normalStringIndex?: number;
  /**
   * Character-owned resources (stacks, stances, pools).
   */
  resources?: Record<string, ResourceSnapshot>;
  /**
   * ICD state counters.
   */
  icd?: Record<string, IcdCounterSnapshot>;
  /**
   * Active combat stance (e.g. Hu Tao E, Raiden Q).
   */
  activeStance?: ActiveStanceState;
}

/**
 * Immutable snapshot of a character at the end of a run (or at any checkpoint).
 * This is what the optimizer needs to expand a search node without replaying
 * the rotation prefix, and what the frontend renders for per-character energy.
 *
 * Deliberately plain-data and self-contained (no `definition` back-reference)
 * so it is JSON-serializable across a Web Worker boundary.
 */
export interface CharacterSnapshot {
  characterId: string;
  energy: EnergyState;
  /** Optional HP state for threshold effects and shield/HP-cost mechanics. */
  maxHp?: number;
  currentHp?: number;
  shielded?: boolean;
  cooldowns: CooldownState;
  /**
   * Next position in the normal-attack string (0 == N1).
   *
   * OPTIONAL for backwards compatibility; absent resumes at N1. Like the ICD
   * counters, absence is not neutral — a resume that drops it restarts every
   * string at its (usually weakest) first hit.
   */
  normalStringIndex?: number;
  /**
   * ICD counters, keyed by ICD group (see the mechanics layer's `icdKey()`).
   *
   * OPTIONAL for backwards compatibility, but its ABSENCE IS NOT NEUTRAL:
   * `evaluateIcd(behaviour, undefined, t)` means "first hit ever for this
   * group", which always applies its element. Resuming from a snapshot that
   * dropped these counters therefore re-applies the first hit after every
   * resume, systematically OVERSTATING reaction damage in proportion to how
   * often the search resumes. A resumable entry point MUST carry this.
   *
   * Structurally identical to the mechanics layer's `IcdCounter` /
   * `IcdState`; declared here rather than imported because `src/types` sits
   * BELOW mechanics in the layering and must not depend upward.
   */
  icd?: IcdCounterState;
  /**
   * Character-owned resource values (stacks, stances, pools), keyed by
   * resource id. Expiry is clock-driven and evaluated lazily from
   * `lastChanged`, so these values are only meaningful together with
   * {@link SimulationSnapshot.time}.
   *
   * Structurally identical to the character module's `ResourceStates`.
   */
  resources?: ResourceSnapshotState;
  /**
   * Active combat stance carried at snapshot time.
   */
  activeStance?: ActiveStanceState;
}

/** One ICD counter. Mirrors the mechanics layer's `IcdCounter` shape. */
export interface IcdCounterSnapshot {
  /** Time of the hit that started the current window. */
  windowStart: number;
  /** Hits since `windowStart`, INCLUDING the one that started it. */
  hitsInWindow: number;
}

/** ICD counters keyed by ICD group. */
export type IcdCounterState = Readonly<Record<string, IcdCounterSnapshot>>;

/** One resource value. Mirrors the character module's `ResourceState`. */
export interface ResourceSnapshot {
  id: string;
  value: number;
  max: number;
  /** Clock at which the value last changed; drives lazy expiry. */
  lastChanged: number;
  /** Absent means the resource never expires. */
  durationSeconds?: number;
}

/** Resource values keyed by resource id. */
export type ResourceSnapshotState = Readonly<Record<string, ResourceSnapshot>>;

/**
 * Elemental aura carried on one enemy, as plain data.
 *
 * Structurally identical to the mechanics layer's `AuraState`. Carried in the
 * snapshot because aura gauge and decay are the other half of the reaction
 * state: resuming with an empty aura loses every pending reaction the prefix
 * set up, in the opposite direction to the ICD bias.
 */
export interface AuraDrainSnapshot {
  /** Stable identifier of whatever imposed the drain (e.g. a reaction kind). */
  source: string;
  /** Gauge units consumed per second, on top of natural decay. */
  ratePerSecond: number;
}

export interface AuraSnapshot {
  auras: readonly {
    element: Element;
    gauge: number;
    since: number;
    decayRate: number;
    /**
     * Extra, attributed gauge consumption imposed by an ongoing reaction, on
     * top of `decayRate`.
     *
     * REQUIRED FOR CORRECTNESS, not cosmetic. `decayRate` is the aura's
     * NATURAL rate only; the mechanics layer computes the real rate as
     * `1/decayRate + sum(drains.ratePerSecond)`. Dropping this key on the way
     * into a snapshot therefore does not lose a label, it makes the resumed
     * aura decay STRICTLY SLOWER than the run it was taken from — silently,
     * with no error, and in the direction that manufactures extra reactions.
     *
     * Absent (never `[]`) means "no drains", mirroring the mechanics layer's
     * `Aura.drains`: an empty array and an absent key must not hash
     * differently, or the optimizer's memo splits for zero information.
     */
    drains?: readonly AuraDrainSnapshot[];
  }[];
  compound: readonly {
    kind: string;
    gauge: number;
    since: number;
    decayRate: number;
    /** See the `drains` note on `auras` above; identical rules. */
    drains?: readonly AuraDrainSnapshot[];
  }[];
}

/**
 * Everything needed to resume a simulation from a checkpoint. `simulateRotation`
 * returns one of these; a future resumable entry point will accept one via
 * {@link SimulationConfig.resumeFrom} without any breaking change.
 *
 * RESUMABILITY CONTRACT: a snapshot must carry every piece of state that is
 * CARRIED ACROSS actions, not merely the state a consumer wants to display.
 * Energy and cooldowns were not sufficient — ICD counters, resources and enemy
 * aura are all carried, and dropping any of them changes the numbers.
 */
export interface SimulationSnapshot {
  /** Clock (seconds) at which this snapshot was taken. */
  time: number;
  /** Character id that is currently on-field, or undefined if none has acted. */
  activeCharacterId?: string;
  /** Per-character state keyed by character id. */
  characters: Record<string, CharacterSnapshot>;
  /**
   * Enemy elemental aura at `time`, keyed by enemy id. Optional for backwards
   * compatibility; required for a faithful resume once reactions are wired.
   */
  enemyAuras?: Readonly<Record<string, AuraSnapshot>>;
  /** Active trigger effects (coordinated attacks, reactive procs). */
  activeTriggers?: readonly unknown[];
  /** Active weapon infusions. */
  activeInfusions?: readonly unknown[];
  /** Pending time-driven reaction work, currently Electro-Charged ticks. */
  reactionTicks?: ReactionTickQueueSnapshot;
  /** Pending timed artifact work (Exile energy, pickup healing ticks). */
  artifactEvents?: readonly ArtifactScheduledEvent[];
  /** Healing history needed to resume Song/Clam conversions without replay. */
  healingHistory?: readonly HealingEvent[];
}

/** Serializable queue state for time-driven reactions. */
export interface ReactionTickQueueSnapshot {
  entries: readonly ReactionTickSnapshotEntry[];
  nextSequence: number;
}

export interface ReactionTickSnapshotEntry {
  enemyId: string;
  kind: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  triggerLevel: number;
  triggerElementalMastery: number;
  reactionBonus: number;
  enemyModifiers: EnemyModifiers;
  lastTickTime: number;
  nextTickTime: number;
  sequence: number;
}

// ---------------------------------------------------------------------------
// Enemy
// ---------------------------------------------------------------------------

export interface EnemyState {
  id: string;
  name: string;
  level: number;
  /** Per-element resistance as a fraction, e.g. 0.1 == 10%. */
  resistances: Partial<Record<Element, number>>;
  /** Optional scenario HP state for threshold effects. */
  maxHp?: number;
  currentHp?: number;
}

// ---------------------------------------------------------------------------
// Rotation
// ---------------------------------------------------------------------------

export interface RotationAction {
  characterId: string;
  actionType: ActionType;
  /**
   * Ability id for damage actions; omitted for swaps.
   *
   * AUTHORITATIVE when present: if it does not match the ability `actionType`
   * resolves to, the action is rejected with `mismatched-ability` rather than
   * silently running the slot's ability. When absent, the slot ability is used
   * and no check is performed (unchanged behaviour).
   */
  abilityId?: string;
  /**
   * Position in the character's normal-attack STRING (0 == N1, 1 == N2, ...).
   *
   * Only meaningful when `actionType === "normal"`. Absent means "the next hit
   * of the string", i.e. the engine's tracked
   * {@link CharacterState.normalStringIndex} is used — which is what a human
   * authoring `N1 N2 N3` expects.
   *
   * Present pins an EXPLICIT position, which is what a search needs: without
   * it, `actionType: "normal"` cannot express N2-without-N1, so those branches
   * were not merely rejected, they were UNGENERATABLE.
   */
  normalIndex?: number;
}

/** A rotation is an ordered list of actions. Fully JSON-serializable. */
export type Rotation = RotationAction[];

// ---------------------------------------------------------------------------
// Damage & events
// ---------------------------------------------------------------------------

export interface DamageInstance {
  timestamp: number;
  sourceCharacterId: string;
  abilityId: string;
  abilityName: string;
  element: Element;
  damageType: DamageType;
  /** Damage before crit/def/res modifiers (talent * scaling stat). */
  rawDamage: number;
  /** Expected damage after all modifiers (crit-averaged). */
  finalDamage: number;
  /** Non-crit final damage. */
  nonCritDamage: number;
  /** Crit final damage. */
  critDamage: number;
}

/**
 * A deterministic healing occurrence supplied by a simulation scenario.
 * Healing is kept as an event rather than a stat so overflow and recipient
 * attribution remain available to artifact mechanics that consume it.
 */
export interface HealingEvent {
  timestamp: number;
  sourceCharacterId: string;
  targetCharacterId?: string;
  /** HP restored, including overflow when the source effect records it. */
  amount: number;
}

/** A deterministic pickup/collection occurrence (particles, orbs, items). */
export interface PickupEvent {
  timestamp: number;
  sourceCharacterId: string;
  targetCharacterId?: string;
  kind: "particle" | "orb" | "item" | "mora" | "chest" | "custom";
  amount?: number;
}

/** Serializable record for a resource transition or trigger lifecycle edge. */
export interface ResourceEvent {
  timestamp: number;
  sourceCharacterId: string;
  /** Optional recipient for external HP/damage events. */
  targetCharacterId?: string;
  resourceId: string;
  kind: "gain" | "consume" | "set" | "expire" | "triggerStart" | "triggerEnd";
  amount?: number;
  value?: number;
}

/** Serializable pending artifact event used by checkpoint/resume. */
export type ArtifactScheduledEvent =
  | { timestamp: number; kind: "energy"; sourceCharacterId: string; amount: number }
  | { timestamp: number; kind: "healing"; event: HealingEvent };

/**
 * Deterministic artifact lifecycle effect. This is a state channel, not a
 * damage Buff: the engine consumes it only when the declared trigger occurs.
 */
export type ArtifactStateEffect =
  | {
      /** Adds or refreshes a source-owned resource when a combat event occurs. */
      kind: "resourceOnTrigger";
      sourceCharacterId: string;
      resourceId: string;
      trigger:
        | "skillCast"
        | "burstCast"
        | "reaction"
        | "damageDealt"
        | "defeat"
        /** An externally supplied ResourceEvent (e.g. HP/Bond of Life). */
        | "resourceEvent";
      value: number;
      /** Optional damage-type gate for hit-triggered resources. */
      damageTypes?: readonly DamageType[];
      /** Optional element gate for hit-triggered resources. */
      elements?: readonly Element[];
      /** Optional per-damage-type gain, overriding `value` for that hit. */
      valuesByDamageType?: Partial<Record<DamageType, number>>;
      /** ResourceEvent.resourceId that activates a `resourceEvent` trigger. */
      eventResourceId?: string;
      durationSeconds: number;
      cooldownSeconds: number;
      maxStacks: number;
      stackMode: "refresh" | "add";
      /** Optional energy gate and cost, consumed when the trigger activates. */
      consumeEnergy?: number;
    }
  | {
      kind: "cooldownResetOnDefeat";
      sourceCharacterId: string;
      cooldownSeconds: number;
      abilityTypes?: readonly ("skill" | "burst")[];
    }
  | {
      /** Reduces selected cooldowns after a qualifying reaction. */
      kind: "cooldownReductionOnReaction";
      sourceCharacterId: string;
      reductionSeconds: number;
      cooldownSeconds: number;
      abilityTypes?: readonly ("skill" | "burst")[];
    }
  | {
      kind: "partyEnergyOverTimeAfterBurst";
      sourceCharacterId: string;
      amount: number;
      intervalSeconds: number;
      durationSeconds: number;
      excludeSource?: boolean;
    }
  | {
      kind: "energyOnParticlePickup";
      sourceCharacterId: string;
      amount: number;
      cooldownSeconds: number;
      targetWeaponTypes?: readonly WeaponType[];
    }
  | {
      kind: "energyOnNightsoulBurst";
      sourceCharacterId: string;
      amount: number;
    }
  | {
      kind: "healOnPickup";
      sourceCharacterId: string;
      pickupKind: "item" | "mora";
      amount?: number;
      maxHpFraction?: number;
      durationSeconds?: number;
      tickIntervalSeconds?: number;
    }
  | {
      kind: "healOnBurst";
      sourceCharacterId: string;
      maxHpFraction: number;
    };

/** Generic artifact reaction to a deterministic healing stream. */
export type HealingArtifactEffectInput =
  | {
      /** Generic healing effectiveness modifier from a healing-focused set. */
      kind: "healingBonus";
      /** Fraction added to deterministic healing events (0.15 == +15%). */
      healingBonus: number;
    }
  | {
      /** Incoming healing modifier applied to the event recipient. */
      kind: "healingReceivedBonus";
      /** Fraction added to healing received (0.2 == +20%). */
      healingBonus: number;
    }
  | {
      /** Incoming healing modifier gated by a live character resource. */
      kind: "conditionalHealingReceivedBonus";
      healingBonus: number;
      resourceId: string;
      /** Whether the modifier applies to the wearer only or the whole party. */
      targetScope?: "self" | "party";
    }
  | {
      kind: "oceanHuedClam";
      /** 2pc healing bonus carried by the equipped set. */
      healingBonus?: number;
    }
  | {
      kind: "songOfDaysPast";
      /** 2pc healing bonus carried by the equipped set. */
      healingBonus?: number;
    };

export type HealingArtifactEffect = HealingArtifactEffectInput & {
  sourceCharacterId: string;
};

export type CombatEventType =
  | "damage"
  | "swap"
  | "energy"
  | "healing"
  | "pickup"
  | "resource"
  | "info";

export interface CombatEvent {
  timestamp: number;
  type: CombatEventType;
  characterId: string;
  description: string;
  /** Present for damage events. */
  damage?: DamageInstance;
  /**
   * Energy of `characterId` after this event. Single-character scalar kept for
   * backwards compatibility; prefer {@link CombatEvent.energyByCharacter} when
   * rendering a multi-character readout.
   */
  energy?: number;
  /**
   * Full per-character energy snapshot (characterId -> current energy) taken
   * immediately AFTER this event was applied.
   *
   * Emitted on every `energy` event. Because particles grant energy to
   * off-field members too, a scalar cannot describe a 4-character party; this
   * absolute snapshot lets a consumer render exact state without accumulating
   * deltas (a dropped event can therefore never silently desync a display).
   */
  energyByCharacter?: Record<string, number>;
  healing?: HealingEvent;
  pickup?: PickupEvent;
  resource?: ResourceEvent;
  /**
   * Swap events only: the character who was on-field before this swap.
   * Undefined for the first swap of a run, when nobody was on-field yet.
   */
  fromCharacterId?: string;
  /**
   * Seconds of on-field time this event consumed — always the value the engine
   * ACTUALLY advanced the clock by, never a re-derived one. Consumers should
   * read this rather than looking cast times up from a `CharacterDefinition`,
   * so an effective duration that differs from the static definition is
   * reported faithfully.
   *
   * Emitted on:
   *  - `damage` events: the ability's applied cast time.
   *  - `swap` events: the effective swap cost (post-clamp, not the configured
   *    default).
   *
   * Absent on `energy` and `info` events, which consume no time.
   */
  duration?: number;
}

/**
 * `SimulationWarning.actionIndex` sentinel for a warning that is not tied to
 * any rotation action (e.g. an invalid config value). Consumers rendering a
 * timeline should not try to look up an action at this index.
 */
export const CONFIG_WARNING_ACTION_INDEX = -1;

/**
 * Machine-readable form of a skipped-action warning.
 *
 * The engine already computes all of this via {@link ActionValidation}; the
 * string in {@link SimulationResult.warnings} is a flattened rendering of the
 * same data. Consumers that need to place a warning on a timeline lane at a
 * timestamp should read this instead of parsing strings.
 */
export interface SimulationWarning {
  /**
   * Index of the offending action within the rotation, or
   * {@link CONFIG_WARNING_ACTION_INDEX} for warnings that belong to the run's
   * configuration rather than to any single action.
   */
  actionIndex: number;
  /** Simulation clock (seconds) at which the action was attempted. */
  timestamp: number;
  /** Character the action belonged to. */
  characterId: string;
  /** Why it was rejected. Same codes the optimizer prunes on. */
  code: ValidationErrorCode;
  /** Human-readable explanation (without the "Action N:" prefix). */
  message: string;
  /** For `on-cooldown`: when the action would have become legal. */
  availableAt?: number;
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Action validation (public seam: engine + optimizer share this)
// ---------------------------------------------------------------------------

/**
 * Machine-readable reason an action was rejected. The optimizer branches on
 * these codes to prune, so they are part of the public contract — add codes,
 * never repurpose one.
 */
export type ValidationErrorCode =
  | "unknown-character"
  | "unknown-ability"
  | "on-cooldown"
  | "insufficient-energy"
  | "redundant-swap"
  | "past-time-limit"
  /**
   * `RotationAction.abilityId` was supplied but does not match the ability the
   * `actionType` slot resolves to. `abilityId` is AUTHORITATIVE: rather than
   * silently executing the slot's ability (which produces plausible but wrong
   * numbers), the action is rejected. Omit `abilityId` to accept the slot
   * ability unconditionally.
   */
  | "mismatched-ability"
  /**
   * A config value is outside its legal domain (e.g. a negative `swapCost`,
   * which would rewind the simulation clock). Reported once, before any action
   * is processed.
   */
  | "invalid-config";

export type ActionValidation =
  | { valid: true }
  | {
      valid: false;
      code: ValidationErrorCode;
      /** Human-readable explanation for warnings/UI. */
      reason: string;
      /**
       * For `on-cooldown`: the timestamp at which the action becomes legal.
       * Lets the optimizer schedule instead of merely rejecting.
       */
      availableAt?: number;
    };

// ---------------------------------------------------------------------------
// Buff seam (mechanics-engineer owns the implementation; engine owns the seam)
// ---------------------------------------------------------------------------

/**
 * Hook the mechanics layer plugs into. The engine calls this immediately before
 * damage is computed and uses the returned stats as-is; it never inspects or
 * computes buff values itself.
 *
 * Contract:
 *  - MUST be pure and deterministic (no RNG, no IO) — determinism is required
 *    for the optimizer and for exact tests.
 *  - MUST NOT mutate `base` or anything reachable from `context`.
 *  - Returns fully-folded stats for this specific hit.
 */
export type BuffResolver = (
  base: Stats,
  context: BuffContext,
) => Stats;

/** Read-only context handed to the buff resolver for one damage instance. */
export interface BuffContext {
  /** Simulation clock (seconds) at the moment of the hit. */
  time: number;
  /** Character performing the action. */
  character: CharacterDefinition;
  /** Ability being cast. */
  ability: AbilityDefinition;
  /** Character currently on-field (equals `character.id` for on-field hits). */
  activeCharacterId?: string;
  /** Immutable view of every character's runtime state at `time`. */
  snapshot: SimulationSnapshot;
  /** Enemy being hit. */
  enemy: EnemyState;
}

// ---------------------------------------------------------------------------
// Enemy-modifier seam (mechanics computes DEF/RES shred; engine applies it)
// ---------------------------------------------------------------------------

/**
 * Enemy-side debuff totals in effect for ONE damage instance.
 *
 * Structurally identical to the mechanics layer's `EnemyModifierTotals`, but
 * declared here because the layering is one-way: the engine may not import from
 * `src/simulation/buffs`. Mechanics' aggregated totals are assignable to this
 * shape, so wiring is a direct pass-through with no adapter.
 *
 * All values are fractions and are DEBUFFS (positive == more damage taken):
 * `defReduction: 0.2` means the enemy's DEF is reduced by 20%.
 */
export interface EnemyModifiers {
  /** Fractional enemy DEF reduction. 0.2 == -20% DEF. */
  defReduction: number;
  /**
   * Fractional DEF ignore. Multiplicative with `defReduction` in game, so the
   * two are applied as separate factors, never summed.
   */
  defIgnore: number;
  /** Flat RES reduction per element, in fractions. 0.4 == -40% RES. */
  resReduction: Partial<Record<Element, number>>;
  /**
   * Target-side DMG Reduction, as a fraction (0.8 == -80%).
   *
   * NOT its own multiplier: KQM TCL's general damage formula puts it INSIDE
   * the DMG-bonus bracket, `(1 + DMGBonus - DMGReduction)`, so it subtracts
   * from the attacker's DMG Bonus rather than scaling the final number. The
   * TCL Evidence Vault entry "Damage Reduction Mechanics" (fooshi, 2022-07-22)
   * established this from the game's `Actor_SubHurtDelta` field, correcting
   * the older separate-multiplier assumption.
   *
   * Optional and defaulting to 0, so every existing `EnemyModifiers` producer
   * (including mechanics' `sumEnemyModifiers`) stays valid unchanged.
   */
  dmgReduction?: number;
}

/** Neutral totals: no shred. Used as the default so the engine runs standalone. */
export const NO_ENEMY_MODIFIERS: EnemyModifiers = {
  defReduction: 0,
  defIgnore: 0,
  resReduction: {},
};

/**
 * Hook the mechanics layer plugs into for enemy-side debuffs. The engine calls
 * this immediately before computing damage and applies the returned totals
 * as-is; it never inspects buffs or computes shred itself.
 *
 * Mirrors {@link BuffResolver} deliberately: same context, same purity rules,
 * separate channel. Stat-side and enemy-side outputs are kept distinct because
 * they are applied at different points in the damage pipeline.
 *
 * Contract:
 *  - MUST be pure and deterministic (no RNG, no IO).
 *  - MUST NOT mutate anything reachable from `context`.
 *  - Returns the TOTAL shred active for this hit (already aggregated).
 */
export type EnemyModifierResolver = (
  context: BuffContext,
) => EnemyModifiers;

// ---------------------------------------------------------------------------
// Talent-level seam (mechanics computes level deltas; engine selects the row)
// ---------------------------------------------------------------------------

/**
 * The three talent slots a constellation can raise.
 *
 * Structurally identical to the mechanics layer's `TalentSlot` and the
 * character layer's `TalentChannel`, and deliberately so: the three names
 * carry the same three strings, which is what makes the seam a pass-through
 * with NO translation table (and therefore no place for a mapping bug).
 * Re-declared here rather than imported because `src/types` sits below both.
 */
export type TalentLevelSlot = "normal" | "skill" | "burst";

/**
 * Per-slot talent-level DELTAS active for one cast. Sparse by design.
 *
 * A DELTA, never an absolute level: the buff layer does not know a character's
 * configured talent levels and must not invent them. An absent key means +0.
 *
 * A net-zero slot is OMITTED rather than materialised as `0`, for the same
 * reason `reactionBonus` omits its key: `{}` and `{ skill: 0 }` are
 * behaviourally identical but hash differently, which would split optimizer
 * memo entries for zero information.
 */
export type TalentLevelBoostMap = Partial<Record<TalentLevelSlot, number>>;

/**
 * Hook the mechanics layer plugs into for talent-LEVEL boosts.
 *
 * Mirrors {@link BuffResolver} and {@link EnemyModifierResolver}: same context,
 * same purity rules, separate channel. A separate channel because a talent
 * level is an INDEX into a per-level table, not a magnitude in the stat
 * formula — folding it into `Stats` would force every consumer of `Stats` to
 * know one of its numbers is not a value.
 *
 * Contract:
 *  - MUST be pure and deterministic (no RNG, no IO).
 *  - MUST NOT mutate anything reachable from `context`.
 *  - Returns sparse per-slot deltas, already aggregated across active buffs.
 *  - MUST NOT clamp: the cap applies to the RESULTING level (base + delta),
 *    which only the engine knows. See `resolveTalentLevel`.
 */
export type TalentLevelResolver = (
  context: BuffContext,
) => TalentLevelBoostMap;

/** Reports no talent-level boost. */
export const NO_TALENT_LEVEL_BOOSTS: TalentLevelBoostMap = {};

// ---------------------------------------------------------------------------
// Simulation config & result
// ---------------------------------------------------------------------------

export interface SimulationConfig {
  /** Whether to compute crit as an expected value (default) or forced. */
  critMode?: "expected" | "always" | "never";
  /**
   * Seconds of on-field time a character swap costs.
   * Defaults to {@link DEFAULT_SWAP_COST_SECONDS}.
   */
  swapCost?: number;
  /**
   * Hard time bound in seconds. Actions that would start at or after this time
   * are rejected with `past-time-limit`. Undefined == unbounded.
   */
  timeLimit?: number;
  /**
   * Number of characters in the party, used to scale off-field energy share.
   * Defaults to the length of the team passed to `simulateRotation`.
   */
  partySize?: number;
  /**
   * Mechanics-layer buff folding. Defaults to a no-op that returns base stats
   * unchanged, so the engine runs standalone.
   */
  buffResolver?: BuffResolver;
  /**
   * Mechanics-layer enemy debuffs (DEF/RES shred). Defaults to a no-op that
   * reports no shred, so the engine runs standalone and existing callers are
   * unaffected.
   *
   * Applied to a COPY of the enemy's values for the duration of one hit; the
   * `enemy` object passed to `simulateRotation` is never mutated. If a caller
   * supplies already-shredded resistances on `enemy`, this resolver's output
   * stacks on top of them — it does not detect or dedupe pre-shredded input.
   */
  enemyModifierResolver?: EnemyModifierResolver;
  /**
   * Mechanics-layer talent-LEVEL boosts ("Increases the Level of Elemental
   * Skill by 3"). Defaults to a no-op reporting no boost.
   *
   * Separate from {@link buffResolver} because a talent level is not a stat:
   * it selects a different ROW from the ability's per-level multiplier table,
   * upstream of all stat math. Returns sparse per-slot DELTAS, never absolute
   * levels — the buff layer does not know a character's configured levels.
   *
   * Resolved once per CAST (not per hit), because `planAbility` expands a
   * whole cast's scaling at one talent level.
   */
  talentLevelResolver?: TalentLevelResolver;
  /**
   * Start from a prior snapshot instead of a fresh state.
   *
   * IMPLEMENTED (B2). Energy, cooldowns, normal-string position, ICD counters,
   * resources, stance and enemy aura are all restored, and the run's `duration`
   * covers only the resumed span rather than the absolute clock.
   *
   * NOT byte-identical to simulating the same prefix from t=0: snapshotting
   * re-anchors aura decay, which re-rounds in IEEE-754. Divergence is bounded
   * by the mechanics layer's measured `AURA_GAUGE_RELATIVE_TOLERANCE` (1e-9
   * relative). Compare within that bound, never for exact equality.
   *
   * Character ids in the snapshot that are absent from `team` are ignored with
   * a warning, so a snapshot from a superset team is usable.
   */
  resumeFrom?: SimulationSnapshot;
  /**
   * Resolved equipment stats per character id.
   *
   * The engine does NOT know what a weapon or an artifact is. A caller folds
   * gear into a stat bag with `resolveEquippedStats()` (which attaches the
   * BASE channel) and supplies the result here; the engine then uses that bag
   * in place of the character definition's intrinsic stats.
   *
   * Keeping this a resolved `Stats` rather than a gear description means the
   * engine gains no knowledge of slots, sets or substats, and the equipment
   * model can grow without touching the simulation path.
   *
   * ADDITIVE: absent means "ungeared", i.e. exactly the previous behaviour.
   * A character id with no entry keeps its definition stats.
   */
  equippedStats?: Readonly<Record<string, Stats>>;
  /**
   * Conditional equipment effects — weapon passives and artifact set bonuses —
   * per character id, as `Buff` DATA.
   *
   * The companion to {@link SimulationConfig.equippedStats}, and deliberately a
   * SECOND channel rather than more fields on the first, because the two answer
   * different questions:
   *
   *   `equippedStats`   what the gear is WORTH in stats. Unconditional
   *                     arithmetic, already folded.
   *   `equipmentBuffs`  what CONDITIONAL effects it carries. Windows,
   *                     targeting and stacking, resolved by the mechanics
   *                     layer like every other buff.
   *
   * Folding a conditional effect into a stat bag is exactly the mistake this
   * split prevents: a "+20% ATK for 8s after using a skill" passive is not a
   * stat, and pre-adding it would apply it for the whole rotation.
   *
   * The engine SELECTS from this — the owned weapon refinement's buffs, and the
   * set bonuses whose piece count is met — then composes them into the same
   * three mechanics seams that constellation and passive buffs use. It does not
   * interpret what a buff is worth.
   *
   * TYPED AS `unknown` HERE ON PURPOSE. The concrete element type is the
   * mechanics layer's `Buff`, and `src/types` sits BELOW `src/simulation/buffs`;
   * importing it would invert the one-way layering. Re-declaring `Buff`'s full
   * shape here would be a second copy free to drift from the real one. The
   * engine's `equipmentBuffs.ts` owns the precise, fully-typed view
   * (`EquipmentBuffsByCharacter`) and callers should build the value with
   * those types, which are assignable to this field.
   *
   * ADDITIVE: absent means "no conditional equipment effects", i.e. exactly the
   * previous behaviour.
   */
  equipmentBuffs?: Readonly<Record<string, unknown>>;
  /** Deterministic healing occurrences consumed by healing artifacts. */
  healingEvents?: readonly HealingEvent[];
  /** Runtime-selected healing artifact effects, keyed by their wearer. */
  healingArtifactEffects?: readonly HealingArtifactEffect[];
  /** Deterministic party energy adjustments, resolved by the engine caller. */
  energyGainModifier?: EnergyGainModifier;
  /** Deterministic world pickups consumed by artifact lifecycle effects. */
  pickupEvents?: readonly PickupEvent[];
  /** Deterministic resource/trigger events (including Nightsoul Burst). */
  resourceEvents?: readonly ResourceEvent[];
  /** Runtime-selected artifact lifecycle effects, keyed by their wearer. */
  artifactStateEffects?: readonly ArtifactStateEffect[];
}

export interface SimulationResult {
  totalDamage: number;
  dps: number;
  duration: number;
  damageByCharacter: Record<string, number>;
  /**
   * Damage per ability, keyed by ability ID.
   *
   * CHANGED (was keyed by `ability.name`): display names are not unique —
   * two characters can share one, and an ability and its re-cast often do —
   * so name keys silently MERGE unrelated damage. `DamageInstance` already
   * carried `abilityId`; it was simply discarded at aggregation.
   * See {@link SimulationResult.abilityNamesById} to render labels.
   */
  damageByAbility: Record<string, number>;
  /**
   * abilityId -> display name, for every ability that dealt damage this run.
   * Lets a consumer label {@link SimulationResult.damageByAbility} without a
   * team lookup, and keeps the id/name split from costing the UI anything.
   */
  abilityNamesById: Record<string, string>;
  damageByElement: Record<string, number>;
  timeline: CombatEvent[];
  errors: string[];
  warnings: string[];
  /**
   * Structured form of {@link SimulationResult.warnings}, in the same order.
   * Additive: `warnings` remains the human-readable string list.
   */
  structuredWarnings: SimulationWarning[];
  /**
   * Swap cost in seconds actually used for this run — either
   * `config.swapCost` or {@link DEFAULT_SWAP_COST_SECONDS}. Lets a consumer
   * tell a user override apart from the default without re-deriving it.
   */
  effectiveSwapCost: number;
  /**
   * Post-run state of every character (energy + cooldowns) plus the final
   * clock and on-field character. Consumers: optimizer (successor generation
   * without replaying the prefix) and frontend (per-character energy display).
   */
  finalState: SimulationSnapshot;
}
