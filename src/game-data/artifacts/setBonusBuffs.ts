import type { DamageType, Element, ReactionBonusKey } from "@/types";
import type {
  Buff,
  BuffCondition,
  StatKey,
  StatModifier,
} from "@/simulation/buffs/types";
import type { ArtifactSetBonusBuffs } from "@/simulation/engine/equipmentBuffs";
import type { ArtifactSetDefinition } from "./types";
import type {
  ArtifactEffectCondition,
  ArtifactStatModifier,
  GeneratedArtifactEffect,
} from "./generated/setEffects";
import { generatedArtifactEffects } from "./generated/setEffects";
import { generatedArtifactSets } from "./generated/artifactSets";

// ============================================================================
// Generated artifact set-bonus data -> `Buff` objects.
//
// THE GAP THIS CLOSES. `harvestArtifactSetBuffs()` in
// `src/simulation/engine/equipmentBuffs.ts` already selects the right tier for
// the equipped piece count (delegating to `activeSetBonusKeys()`), and already
// composes what it finds into the damage pipeline. It consumes authored `Buff`
// objects. The generator, correctly, emits its OWN sourced shape
// (`GeneratedArtifactEffect`), because a generator that emitted engine types
// would couple the datamining pipeline to the simulation's internals. Until
// this module existed the two halves never met: `modelledArtifactEffects()`
// had no caller anywhere under `src/simulation` or `src/features`, so all 46
// modelled set bonuses contributed exactly zero damage.
//
// This is the artifact twin of `src/game-data/weapons/weaponBuffs.ts` and
// follows it deliberately closely. It is pure, total and deterministic: same
// generated input, byte-identical `Buff` output, every array walked in a fixed
// order. Nothing here fetches, caches, or reads a clock.
//
// ---------------------------------------------------------------------------
// THE FOUR RULES THIS MODULE ENFORCES
// ---------------------------------------------------------------------------
//
// 1. ONLY `modelled` BECOMES A BUFF.
//    An `unimplemented` row carries real, sourced numbers whose GATING the
//    vocabulary cannot state ("for 10s after using an Elemental Skill",
//    "against opponents above 50% HP"). Emitting one as a permanent buff would
//    apply a conditional bonus at 100% uptime -- a plausible number that is
//    simply too big, which `docs/ROADMAP.md` 0 ranks as WORSE than a missing
//    one. An `unverified` row states no number this pipeline could read at
//    all. Both are skipped by construction, not by a hand-maintained
//    allowlist: the check is on `support`, the same field
//    `modelledArtifactEffects()` gates on.
//
// 2. SCOPE IS LOAD-BEARING AND IS CARRIED, NEVER DROPPED.
//    A row's `conditions` is the scope its grant is confined to. `Buff` states
//    scope on `conditions`, which is per-BUFF and not per-modifier -- so a row
//    whose grants had DIFFERENT scopes must become SEVERAL buffs, one per
//    distinct scope. Folding disjoint scopes into one unconditioned buff nets
//    them into a global bonus: the weapon adapter's cautionary case is Rust,
//    whose -10% Charged and +40% Normal would have become a global +30%.
//
//    Today EVERY generated artifact row states one condition for the whole
//    row, so the per-scope split has no positive instance in real data. It is
//    implemented anyway, and tested with a SYNTHETIC row, because the
//    alternative -- folding, on the grounds that real data never needs the
//    split -- is a latent global-bonus bug the moment the generator emits a
//    two-scope row. See `setBonusBuffs.test.ts`.
//
// 3. FAIL CLOSED ON TIER.
//    A tier with no modelled rows is OMITTED from the returned object rather
//    than emitted as an empty array. `harvestArtifactSetBuffs()` reads
//    `bonus[tier.key] ?? []`, so an absent tier is correctly inert -- and an
//    absent key says "this tier is not modelled", which an empty array does
//    not. A set with NEITHER tier modelled yields `undefined` entirely.
//
// 4. AN UNRECOGNISED VOCABULARY WORD IS DROPPED, NOT CAST.
//    This is the one structural difference from the weapon adapter, and it is
//    forced by the data. `GeneratedWeaponModifier` declares its `stat` and
//    `element` AS the engine's `StatKey` / `Element`, so the weapon adapter is
//    a field projection that the compiler already checked.
//    `ArtifactStatModifier` declares them as `string`. A blind cast would
//    therefore compile while smuggling a value the engine has no case for.
//    That is not hypothetical: the generator emitted the damage-type scope
//    `"plunging"` where the engine's `DamageType` member is `"plunge"`, which
//    type-checked as `string` and matched no hit -- silently voiding Long
//    Night's Oath's 2pc. The generator has been fixed AND this module now
//    validates, so the same class of typo degrades to a dropped grant that the
//    count pin catches, never to a wrong number.
// ============================================================================

/** The bucket whose rows map onto the buff vocabulary with nothing invented. */
const MODELLED_SUPPORT = "modelled";

/** Set bonuses are permanently on once the pieces are worn. */
const PERMANENT_DURATION = Number.POSITIVE_INFINITY;

/** Simulation time at which an always-on equipment buff becomes active. */
const EQUIPMENT_BUFF_START_TIME = 0;

/** Piece counts that map onto the two tiers `ArtifactSetBonusBuffs` keys. */
const TWO_PIECE = 2;
const FOUR_PIECE = 4;

// ---------------------------------------------------------------------------
// Vocabulary validation (rule 4)
//
// Each list below is the engine union written out. A value the engine has no
// case for is DROPPED here rather than cast through, so an unknown word can
// never reach the resolver.
//
// The lists must be EXHAUSTIVE, not merely valid: a member omitted here would
// silently drop a grant the engine understands perfectly well. `Exhaustive<>`
// makes that a COMPILE error rather than a missing buff -- it fails unless
// every union member appears, so growing `DamageType` or `StatKey` upstream
// breaks the build here instead of quietly narrowing what artifacts can say.
// ---------------------------------------------------------------------------

/**
 * Identity on a literal tuple, but it only type-checks when the tuple covers
 * EVERY member of `Union`.
 *
 * Written as a curried function rather than a `satisfies` type so that `Tuple`
 * is INFERRED from the array literal. A bare `satisfies Exhaustive<U, U[]>`
 * looks equivalent and is not: its second parameter resolves to `readonly U[]`
 * before the literal is seen, so `[U] extends [Tuple[number]]` is trivially
 * true and an incomplete list compiles. This form makes the parameter type
 * `never` for an incomplete list, which nothing is assignable to.
 */
const exhaustive =
  <Union extends string>() =>
  <Tuple extends readonly Union[]>(
    values: [Union] extends [Tuple[number]] ? Tuple : never,
  ): readonly Union[] => values;

const DAMAGE_TYPES = exhaustive<DamageType>()([
  "normal",
  "charged",
  "plunge",
  "skill",
  "burst",
  "reaction",
] as const);

const ELEMENTS = exhaustive<Element>()([
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
  "physical",
] as const);

const STAT_KEYS = exhaustive<StatKey>()([
  "atkPercent",
  "atkFlat",
  "hpPercent",
  "hpFlat",
  "defPercent",
  "defFlat",
  "elementalMastery",
  "critRate",
  "critDmg",
  "energyRecharge",
  "dmgBonus",
  "flatDamageBonus",
  "elementalDmgBonus",
  "reactionBonus",
] as const);

const REACTION_BONUS_KEYS = exhaustive<ReactionBonusKey>()([
  "vaporize",
  "melt",
  "overloaded",
  "superconduct",
  "electroCharged",
  "swirl",
  "shattered",
  "burning",
  "bloom",
  "hyperbloom",
  "burgeon",
  "aggravate",
  "spread",
] as const);

function asDamageType(value: string): DamageType | undefined {
  return DAMAGE_TYPES.find((known) => known === value);
}

function asElement(value: string): Element | undefined {
  return ELEMENTS.find((known) => known === value);
}

function asStatKey(value: string): StatKey | undefined {
  return STAT_KEYS.find((known) => known === value);
}

function asReactionBonusKey(value: string): ReactionBonusKey | undefined {
  return REACTION_BONUS_KEYS.find((known) => known === value);
}

/**
 * `ArtifactStatModifier` -> `StatModifier`, or `undefined` if unusable.
 *
 * Dropped, never guessed at, when:
 *  - `stat` is not a `StatKey`;
 *  - `stat` is `elementalDmgBonus` and `element` is missing or unknown;
 *  - `stat` is `reactionBonus` and `reaction` is missing or unknown.
 *
 * The last two mirror the resolver's own rule, which ignores (and reports) an
 * `elementalDmgBonus` with no element. Dropping here rather than there means
 * the malformed grant never becomes part of a buff at all, so it cannot be
 * mistaken for a modelled effect in a UI listing of the buff's contents.
 */
function toStatModifier(
  modifier: ArtifactStatModifier,
): StatModifier | undefined {
  const stat = asStatKey(modifier.stat);
  if (stat === undefined) return undefined;

  if (stat === "elementalDmgBonus") {
    const element =
      modifier.element === undefined ? undefined : asElement(modifier.element);
    if (element === undefined) return undefined;
    return { stat, value: modifier.value, element };
  }

  if (stat === "reactionBonus") {
    const reaction =
      modifier.reaction === undefined
        ? undefined
        : asReactionBonusKey(modifier.reaction);
    if (reaction === undefined) return undefined;
    return { stat, value: modifier.value, reaction };
  }

  return { stat, value: modifier.value };
}

/**
 * `ArtifactEffectCondition` -> `BuffCondition`, or `undefined` for no gate.
 *
 * A field present but EMPTY after validation is treated as a dropped grant's
 * problem, not a licence to widen: `damageTypes: ["plunging"]` (every member
 * unknown) must not become "applies to every damage type", which is exactly
 * the over-application rule 1 exists to prevent. `unusable` reports that case
 * so the caller can drop the whole row instead.
 */
interface ConvertedCondition {
  readonly condition?: BuffCondition;
  /** True when a stated gate could not be represented at all. */
  readonly unusable: boolean;
}

function toBuffCondition(
  conditions: ArtifactEffectCondition | undefined,
): ConvertedCondition {
  if (!conditions) return { unusable: false };

  const condition: BuffCondition = {};
  let stated = false;

  if (conditions.damageTypes !== undefined) {
    stated = true;
    const damageTypes = conditions.damageTypes
      .map(asDamageType)
      .filter((value): value is DamageType => value !== undefined);
    // A gate whose every member was unrecognised cannot be narrowed; widening
    // it to "no gate" would apply a scoped bonus globally.
    if (damageTypes.length !== conditions.damageTypes.length) {
      return { unusable: true };
    }
    condition.damageTypes = damageTypes;
  }

  if (conditions.elements !== undefined) {
    stated = true;
    const elements = conditions.elements
      .map(asElement)
      .filter((value): value is Element => value !== undefined);
    if (elements.length !== conditions.elements.length) {
      return { unusable: true };
    }
    condition.elements = elements;
  }

  if (conditions.requiresOnField !== undefined) {
    stated = true;
    condition.requiresOnField = conditions.requiresOnField;
  }

  if (conditions.enemyAuraElements !== undefined) {
    stated = true;
    const elements = conditions.enemyAuraElements
      .map(asElement)
      .filter((value): value is Element => value !== undefined);
    if (elements.length !== conditions.enemyAuraElements.length) return { unusable: true };
    condition.enemyAuraElements = elements;
  }

  if (conditions.enemyAuraKinds !== undefined) {
    stated = true;
    // Compound-aura names are mechanics-owned strings. Keep the check
    // conservative: an empty or non-string entry cannot safely widen a gate.
    if (conditions.enemyAuraKinds.some((kind) => typeof kind !== "string" || kind.length === 0)) {
      return { unusable: true };
    }
    condition.enemyAuraKinds = [...conditions.enemyAuraKinds];
  }

  if (conditions.minEnemyHpFraction !== undefined || conditions.maxEnemyHpFraction !== undefined) {
    stated = true;
    const min = conditions.minEnemyHpFraction;
    const max = conditions.maxEnemyHpFraction;
    if (min !== undefined && (!Number.isFinite(min) || min < 0 || min > 1)) return { unusable: true };
    if (max !== undefined && (!Number.isFinite(max) || max < 0 || max > 1)) return { unusable: true };
    if (min !== undefined && max !== undefined && min > max) return { unusable: true };
    if (min !== undefined) condition.minEnemyHpFraction = min;
    if (max !== undefined) condition.maxEnemyHpFraction = max;
  }

  if (conditions.weaponTypes !== undefined) {
    stated = true;
    const allowed = ["sword", "claymore", "polearm", "catalyst", "bow"] as const;
    if (conditions.weaponTypes.some((weapon) => !allowed.includes(weapon as (typeof allowed)[number]))) {
      return { unusable: true };
    }
    condition.weaponTypes = [...conditions.weaponTypes] as typeof condition.weaponTypes;
  }

  if (conditions.minHpFraction !== undefined || conditions.maxHpFraction !== undefined) {
    stated = true;
    const min = conditions.minHpFraction;
    const max = conditions.maxHpFraction;
    if (min !== undefined && (!Number.isFinite(min) || min < 0 || min > 1)) return { unusable: true };
    if (max !== undefined && (!Number.isFinite(max) || max < 0 || max > 1)) return { unusable: true };
    if (min !== undefined && max !== undefined && min > max) return { unusable: true };
    if (min !== undefined) condition.minHpFraction = min;
    if (max !== undefined) condition.maxHpFraction = max;
  }
  if (conditions.requiresShield !== undefined) {
    stated = true;
    condition.requiresShield = conditions.requiresShield;
  }

  if (!stated) return { unusable: false };
  return { condition, unusable: false };
}

/**
 * Stable key for one row's condition, used to group grants sharing a scope.
 *
 * SORTED within each field and fixed in field order, so two conditions stating
 * the same gate in a different order land in the same group and produce the
 * same buff id on every run. `UNSCOPED_KEY` is the genuinely unscoped group
 * (an always-on ATK%), which is NOT "scope unknown" -- an unrepresentable gate
 * is rejected by `toBuffCondition` before it reaches here.
 */
const UNSCOPED_KEY = "";

function conditionKey(condition: BuffCondition | undefined): string {
  if (!condition) return UNSCOPED_KEY;
  const parts: string[] = [];
  if (condition.damageTypes) {
    parts.push(`d:${[...condition.damageTypes].sort().join("+")}`);
  }
  if (condition.elements) {
    parts.push(`e:${[...condition.elements].sort().join("+")}`);
  }
  if (condition.requiresOnField !== undefined) {
    parts.push(`f:${condition.requiresOnField}`);
  }
  if (condition.enemyAuraElements) {
    parts.push(`ae:${[...condition.enemyAuraElements].sort().join("+")}`);
  }
  if (condition.enemyAuraKinds) {
    parts.push(`ak:${[...condition.enemyAuraKinds].sort().join("+")}`);
  }
  if (condition.minEnemyHpFraction !== undefined) {
    parts.push(`ehmin:${condition.minEnemyHpFraction}`);
  }
  if (condition.maxEnemyHpFraction !== undefined) {
    parts.push(`ehmax:${condition.maxEnemyHpFraction}`);
  }
  if (condition.weaponTypes) {
    parts.push(`w:${[...condition.weaponTypes].sort().join("+")}`);
  }
  if (condition.minHpFraction !== undefined) {
    parts.push(`hmin:${condition.minHpFraction}`);
  }
  if (condition.maxHpFraction !== undefined) {
    parts.push(`hmax:${condition.maxHpFraction}`);
  }
  if (condition.requiresShield !== undefined) {
    parts.push(`s:${condition.requiresShield}`);
  }
  return parts.join(",");
}

/** One scope's accumulated grants. */
interface ScopeGroup {
  readonly condition?: BuffCondition;
  readonly modifiers: StatModifier[];
}

/**
 * Who a set's bonus buffs.
 *
 * THIS IS A PER-SET DATA DECISION, NOT A DEFAULT. Most bonuses buff only the
 * wearer (`active`), but a genuinely team-wide bonus -- Noblesse Oblige's 4pc
 * "+20% ATK for all party members" is the canonical one -- is `party`, and
 * getting it wrong turns a party-wide buff single-target or vice versa. Both
 * are plausible wrong numbers.
 *
 * The scope is derived from the ROW'S OWN PROSE rather than assumed, so a set
 * added by a later regeneration is classified by what it says. The patterns
 * below match the game's fixed wording for a team-wide grant; anything else is
 * the wearer.
 *
 * WHY `active` AND NOT `self` FOR THE WEARER: `self` requires
 * `sourceCharacterId`, and the harvest is already per-character -- the buff
 * reaches exactly the character whose equipment entry produced it. This
 * matches `weaponBuffs.ts`.
 *
 * STATUS TODAY: no `modelled` row matches, because every modelled row is a
 * 2-piece bonus and the game's team-wide bonuses are all 4-piece and all
 * currently `unimplemented` (their gating -- "after using an Elemental Burst"
 * -- is not statable). The classifier is present, exercised by a SYNTHETIC
 * fixture in the tests, and correct the moment such a row becomes modelled.
 * Hardcoding `active` because real data is uniformly `active` today would be
 * the silent-party-drop bug waiting for the first team-wide row.
 */
const PARTY_WIDE_PROSE = [
  /all party members/i,
  /all nearby party members/i,
  /nearby party members/i,
  /party members/i,
];

function targetScopeFor(effect: GeneratedArtifactEffect): "party" | "active" {
  return PARTY_WIDE_PROSE.some((pattern) => pattern.test(effect.text))
    ? "party"
    : "active";
}

/**
 * The buffs one generated set bonus grants, one per distinct scope.
 *
 * A row outside the `modelled` bucket yields `[]` -- see rule 1. So does a row
 * whose gate could not be represented, or whose every modifier was dropped:
 * an empty buff is indistinguishable from an absent one to the harvest, and
 * emitting it would suggest the bonus is modelled when nothing about it is.
 */
export function buffsForSetBonus(
  effect: GeneratedArtifactEffect,
): readonly Buff[] {
  if (effect.support !== MODELLED_SUPPORT) return [];

  const { condition, unusable } = toBuffCondition(effect.conditions);
  if (unusable) return [];

  const scope = targetScopeFor(effect);

  // Insertion-ordered so the buff list is stable. The generated shape states
  // ONE condition for the whole row, so today this map holds a single group;
  // it is a map because `Buff.conditions` is per-buff and a future row with
  // per-modifier scope must split rather than fold. See rule 2.
  const groups = new Map<string, ScopeGroup>();
  const key = conditionKey(condition);

  for (const modifier of effect.modifiers ?? []) {
    const converted = toStatModifier(modifier);
    if (!converted) continue;
    let group = groups.get(key);
    if (!group) {
      group = condition ? { condition, modifiers: [] } : { modifiers: [] };
      groups.set(key, group);
    }
    group.modifiers.push(converted);
  }

  const out: Buff[] = [];
  // No empty-group guard: a group is created LAZILY, only once a modifier has
  // actually converted, so `group.modifiers` is non-empty by construction. A
  // guard here would be unreachable -- and an unreachable guard is untestable
  // by definition, which is worse than no guard: it reads as a checked case
  // while no test can ever prove it fires. A row whose every modifier was
  // dropped therefore produces NO group at all and yields `[]`, which is the
  // behaviour the "drops a modifier whose stat the engine has no case for"
  // test pins.
  for (const [groupKey, group] of groups) {
    const buff: Buff = {
      // Scope-suffixed so two scopes of one bonus never collapse into one
      // stacking identity: `Buff.id` IS the stacking key, and two same-id
      // buffs merge under `refresh`. The row id already carries set and tier
      // (e.g. "gladiators-finale-2pc").
      id:
        groupKey === UNSCOPED_KEY ? effect.id : `${effect.id}-${groupKey}`,
      source: effect.text,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope },
    };
    if (group.condition) buff.conditions = group.condition;
    buff.modifiers = group.modifiers;
    out.push(buff);
  }
  return out;
}

/**
 * A generated set's bonuses as the `ArtifactSetBonusBuffs` the engine harvests.
 *
 * Returns `undefined` when NO tier of the set is modelled -- see rule 3. A
 * tier that is present but not modelled is OMITTED, which is what makes
 * fail-closed automatic: `harvestArtifactSetBuffs()` reads the tier key and
 * gets nothing, rather than getting an empty array that reads as "modelled,
 * grants nothing".
 *
 * 1-PIECE BONUSES (the elemental-resistance relics, source ids 15009-15013)
 * exist in the generated data and have no tier here, because
 * `ArtifactSetBonusBuffs` and `activeSetBonusKeys()` model only the 2pc/4pc
 * tiers the modern game uses. None is `modelled` -- all are self-RES, a
 * defensive channel the vocabulary does not have -- so nothing is lost today.
 * Adding a tier would be an engine-type change, which this module does not own.
 */
export function setBonusBuffs(
  set: ArtifactSetDefinition,
): ArtifactSetBonusBuffs | undefined {
  return setBonusBuffsFromRows(set.id, generatedArtifactEffects);
}

/**
 * The tier assembly, over an EXPLICIT row list.
 *
 * Exported for one reason: the real generated data cannot reach three of the
 * branches below. Today all 46 modelled rows are 2-piece, so the 4-piece key,
 * the 1-piece rejection and the piece-count ordering are all exercised
 * VACUOUSLY by production data -- a sweep over it passes just as happily
 * against an implementation that writes 4pc rows into `twoPiece`, lets a 1pc
 * row through, or sorts descending. Those are not hypothetical mutants; they
 * are the exact shape of a tier leak.
 *
 * `setBonusBuffs()` is this function bound to the generated rows, so the
 * production path and the tested path are the same code, not a parallel copy.
 * The tests drive it with rows LABELLED INVENTED. See `setBonusBuffs.test.ts`.
 */
export function setBonusBuffsFromRows(
  setId: string,
  rows: readonly GeneratedArtifactEffect[],
): ArtifactSetBonusBuffs | undefined {
  const bonuses: ArtifactSetBonusBuffs = { setId };
  let any = false;

  // Ascending piece count, so the emitted key order is fixed.
  const ordered = rows
    .filter((effect) => effect.setSlug === setId)
    .slice()
    .sort((a, b) => a.pieces - b.pieces);

  for (const row of ordered) {
    if (row.pieces !== TWO_PIECE && row.pieces !== FOUR_PIECE) continue;
    const buffs = buffsForSetBonus(row);
    if (buffs.length === 0) continue;
    if (row.pieces === TWO_PIECE) bonuses.twoPiece = buffs;
    else bonuses.fourPiece = buffs;
    any = true;
  }

  return any ? bonuses : undefined;
}

/**
 * Same as {@link setBonusBuffs}, by set id. Unknown id -> undefined.
 *
 * Lookup is by EXACT generated id, deliberately NOT through `findArtifact()`:
 * that helper normalises case and accepts retired aliases, which is right for
 * resolving a user's saved build and wrong here, where a near-miss id
 * resolving to a neighbouring set would attribute one set's damage to another.
 *
 * The `!set` early return is a readability shortcut and NOT load-bearing: with
 * it removed, `setBonusBuffsFromRows` would filter on an id no row carries and
 * return `undefined` anyway. A mutation sweep confirms it as an equivalent
 * mutant. It is kept because it states the intent; do not try to "cover" it
 * with an assertion, because no observable behaviour distinguishes the two.
 */
export function setBonusBuffsById(
  setId: string,
): ArtifactSetBonusBuffs | undefined {
  const set = generatedArtifactSets.find((candidate) => candidate.id === setId);
  if (!set) return undefined;
  return setBonusBuffs(set);
}

/**
 * Every generated set whose bonuses yield at least one buff, by set id.
 *
 * Built eagerly and once: the generated set is fixed at build time, and a lazy
 * cache would be mutable state in a module the optimizer calls from a worker.
 * Iteration follows `generatedArtifactSets`, which the generator sorts, so it
 * is deterministic.
 */
export const artifactSetBonusBuffsBySetId: ReadonlyMap<
  string,
  ArtifactSetBonusBuffs
> = new Map(
  generatedArtifactSets
    .map((set) => [set.id, setBonusBuffs(set)] as const)
    .filter((entry): entry is readonly [string, ArtifactSetBonusBuffs] =>
      entry[1] !== undefined,
    ),
);

/**
 * Every set-bonus buff list, flattened, for a caller that wants them all.
 *
 * This is the shape `SimulationConfig.equipmentBuffs[characterId].setBonuses`
 * takes. Passing the whole list is safe and is the intended use:
 * `harvestArtifactSetBuffs()` gates each entry on the equipped piece count, so
 * a set the character is not wearing contributes nothing.
 */
export const allArtifactSetBonusBuffs: readonly ArtifactSetBonusBuffs[] = [
  ...artifactSetBonusBuffsBySetId.values(),
];
