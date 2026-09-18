import type {
  Element,
  DamageType,
  ReactionBonusKey,
  ReactionBonusMap,
  Stats,
} from "@/types";
import { NO_REACTION_BONUS } from "@/types";
import type {
  ActiveBuff,
  BaseStatValues,
  EnemyModifier,
  EnemyModifierTotals,
  StatKey,
  StatModifier,
  CharacterResistanceModifier,
} from "@/simulation/buffs/types";
import type { BuffContext } from "@/types";


import { applyActiveConversions } from "@/simulation/buffs/conversions";


// ============================================================================
// Modifier folding — application order
//
// Genshin's stat formula for the ATK/HP/DEF channels is:
//
//     stat = baseStat * (1 + sum(stat%)) + sum(flatStat)
//
// The percentage applies to BASE stat ONLY (character base + weapon base), NOT
// to already-accumulated flat bonuses and NOT to final stat. Applying ATK% to
// final ATK is the single most common modelling bug; it inflates damage badly
// on characters with large flat-ATK contributions.
//
// The remaining stats (Crit Rate, Crit DMG, EM, ER, DMG%) are simple additive
// fractions: final = value + sum(bonuses). DMG% bonuses from different sources
// are additive with each other (they enter the damage formula as one
// `1 + total` factor), which the pipeline already does.
//
// Documented order:
//   1. Sum every active modifier per channel (value * stacks).
//   2. ATK/HP/DEF:  base * (1 + pct) + flat
//   3. Additive stats: incoming + sum
//   4. elementalDmgBonus: per-element additive merge onto the incoming map
//   5. reactionBonus:      per-reaction additive merge onto the incoming map,
//                          with the key OMITTED when the merged map is empty
//                          (the field is optional, so absence must round-trip)
//
// Everything is a pure fold over the ActiveBuff list; no ordering dependence
// between buffs (addition is commutative), so results are deterministic.
// ============================================================================

/** Accumulator for one pass of modifier folding. */
interface ModifierTotals {
  atkPercent: number;
  atkFlat: number;
  hpPercent: number;
  hpFlat: number;
  defPercent: number;
  defFlat: number;
  elementalMastery: number;
  critRate: number;
  critDmg: number;
  energyRecharge: number;
  dmgBonus: number;
  flatDamageBonus: number;
  /** Additive bonuses to the identity base multiplier (1.0). */
  baseDmgMultiplier: Partial<Record<DamageType, number>>;
  elementalDmgBonus: Partial<Record<Element, number>>;
  /**
   * `ReactionBonus` per reaction (KQM `combat-mechanics/damage/damage-formula`),
   * which the reaction formulas consume as `(1 + emBonus + ReactionBonus)`.
   * Kept per-reaction rather than scalar — see `StatKey."reactionBonus"`.
   */
  reactionBonus: ReactionBonusMap;
}

function emptyTotals(): ModifierTotals {
  return {
    atkPercent: 0,
    atkFlat: 0,
    hpPercent: 0,
    hpFlat: 0,
    defPercent: 0,
    defFlat: 0,
    elementalMastery: 0,
    critRate: 0,
    critDmg: 0,
    energyRecharge: 0,
    dmgBonus: 0,
    flatDamageBonus: 0,
    baseDmgMultiplier: {},
    elementalDmgBonus: {},
    reactionBonus: {},
  };
}

function applyModifier(
  totals: ModifierTotals,
  modifier: StatModifier,
  stacks: number,
  skippedKeyedModifiers: StatKey[],
): void {
  const amount = modifier.value * stacks;

  if (modifier.stat === "elementalDmgBonus") {
    // An elemental DMG% modifier without an element is malformed data; ignore
    // it rather than guessing which element was meant.
    if (modifier.element === undefined) {
      skippedKeyedModifiers.push(modifier.stat);
      return;
    }
    const current = totals.elementalDmgBonus[modifier.element] ?? 0;
    totals.elementalDmgBonus[modifier.element] = current + amount;
    return;
  }

  if (modifier.stat === "reactionBonus") {
    // A ReactionBonus that names no reaction is malformed data. SKIP AND
    // REPORT — it must never be folded as a global scalar, because every real
    // source is reaction-specific (a Vaporize/Melt set leaking onto Swirl and
    // Overloaded would silently inflate every transformative reaction).
    if (modifier.reaction === undefined) {
      skippedKeyedModifiers.push(modifier.stat);
      return;
    }
    const current = totals.reactionBonus[modifier.reaction] ?? 0;
    totals.reactionBonus[modifier.reaction] = current + amount;
    return;
  }

  if (modifier.stat === "flatDamageBonus") {
    totals.flatDamageBonus += amount;
    return;
  }

  if (modifier.stat === "baseDmgMultiplier") {
    if (modifier.damageType === undefined) {
      skippedKeyedModifiers.push(modifier.stat);
      return;
    }
    const current = totals.baseDmgMultiplier[modifier.damageType] ?? 0;
    totals.baseDmgMultiplier[modifier.damageType] = current + amount;
    return;
  }

  totals[modifier.stat] += amount;
}

/**
 * Sum every modifier carried by the active buffs. Pure.
 *
 * Modifiers dropped for a missing discriminator (`element` / `reaction`) are
 * reported through the second return channel rather than silently vanishing.
 */
export function sumModifiersWithDiagnostics(active: readonly ActiveBuff[]): {
  totals: ModifierTotals;
  skippedKeyedModifiers: readonly StatKey[];
} {
  const totals = emptyTotals();
  const skippedKeyedModifiers: StatKey[] = [];
  for (const { buff, stacks } of active) {
    // `modifiers` is optional: a pure enemy-side debuff carries none.
    for (const modifier of buff.modifiers ?? []) {
      applyModifier(totals, modifier, stacks, skippedKeyedModifiers);
    }
  }
  return { totals, skippedKeyedModifiers };
}

/** Sum every modifier carried by the active buffs. Pure. */
export function sumModifiers(active: readonly ActiveBuff[]): ModifierTotals {
  return sumModifiersWithDiagnostics(active).totals;
}

function liveResourceValue(
  resource: { value: number; lastChanged: number; durationSeconds?: number } | undefined,
  time: number,
): number {
  if (resource === undefined) return 0;
  if (
    resource.durationSeconds !== undefined &&
    time - resource.lastChanged >= resource.durationSeconds
  ) return 0;
  return resource.value;
}

/** Fold resource-backed modifiers after ordinary modifiers/conversions. */
export function applyResourceModifiers(
  base: Stats,
  active: readonly ActiveBuff[],
  context: BuffContext,
  explicitBaseValues: BaseStatValues = {},
): Stats {
  const totals = emptyTotals();
  for (const { buff, stacks } of active) {
    for (const modifier of buff.resourceModifiers ?? []) {
      const ownerId = modifier.owner === "source"
        ? buff.sourceCharacterId
        : context.character.id;
      const resource = ownerId === undefined
        ? undefined
        : context.snapshot?.characters[ownerId]?.resources?.[modifier.resourceId];
      const value = liveResourceValue(resource, context.time);
      const converted = Math.min(
        modifier.maxCap ?? Number.POSITIVE_INFINITY,
        Math.max(0, value - (modifier.threshold ?? 0)) * modifier.ratio * stacks,
      );
      if (!(converted > 0) || !Number.isFinite(converted)) continue;
      applyModifier(totals, {
        stat: modifier.targetStat,
        value: converted,
        ...(modifier.damageType !== undefined ? { damageType: modifier.damageType } : {}),
      }, 1, []);
    }
  }
  if (
    totals.atkPercent === 0 && totals.atkFlat === 0 &&
    totals.hpPercent === 0 && totals.hpFlat === 0 &&
    totals.defPercent === 0 && totals.defFlat === 0 &&
    totals.elementalMastery === 0 && totals.critRate === 0 &&
    totals.critDmg === 0 && totals.energyRecharge === 0 &&
    totals.dmgBonus === 0 && totals.flatDamageBonus === 0
    && Object.keys(totals.baseDmgMultiplier).length === 0
  ) return base;
  return applyTotals(base, totals, resolveBaseValues(base, explicitBaseValues)).stats;
}

/** Resolved character-side defensive channels for one hit/state query. */
export interface CharacterDefenseTotals {
  /** Additive resistance modifiers, keyed by damage element. */
  resistances: Partial<Record<Element, number>>;
  /** Additive shield strength bonus (0.35 == +35%). */
  shieldStrength: number;
  /** Additive reduction to elemental aura duration (0.4 == 40%). */
  auraDurationReduction: number;
}

/** Resolved healing channels. This output is consumed by event/state layers,
 * while remaining separate from outgoing damage stats and enemy modifiers. */
export interface HealingTotals {
  outgoing: number;
  received: number;
}

export function sumActiveHealing(
  active: readonly ActiveBuff[],
): HealingTotals {
  const totals: HealingTotals = { outgoing: 0, received: 0 };
  for (const { buff, stacks } of active) {
    for (const modifier of buff.healingModifiers ?? []) {
      totals[modifier.kind] += modifier.value * stacks;
    }
  }
  return totals;
}

function emptyCharacterDefenseTotals(): CharacterDefenseTotals {
  return { resistances: {}, shieldStrength: 0, auraDurationReduction: 0 };
}

/** Fold character resistance and shield-strength channels from active buffs. */
export function sumActiveCharacterDefense(
  active: readonly ActiveBuff[],
): CharacterDefenseTotals {
  const totals = emptyCharacterDefenseTotals();
  for (const { buff, stacks } of active) {
    for (const modifier of buff.resistanceModifiers ?? []) {
      const amount = modifier.value * stacks;
      totals.resistances[modifier.element] =
        (totals.resistances[modifier.element] ?? 0) + amount;
    }
    for (const modifier of buff.shieldStrengthModifiers ?? []) {
      totals.shieldStrength += modifier.value * stacks;
    }
    for (const modifier of buff.auraDurationModifiers ?? []) {
      totals.auraDurationReduction += modifier.value * stacks;
    }
  }
  return totals;
}

/** Alias for callers that resolve a pre-filtered modifier list. */
export function sumCharacterDefenseModifiers(
  modifiers: readonly CharacterResistanceModifier[],
  shieldStrengthModifiers: readonly { value: number }[] = [],
  auraDurationModifiers: readonly { value: number }[] = [],
): CharacterDefenseTotals {
  const totals = emptyCharacterDefenseTotals();
  for (const modifier of modifiers) {
    totals.resistances[modifier.element] =
      (totals.resistances[modifier.element] ?? 0) + modifier.value;
  }
  for (const modifier of shieldStrengthModifiers) totals.shieldStrength += modifier.value;
  for (const modifier of auraDurationModifiers) totals.auraDurationReduction += modifier.value;
  return totals;
}

// ---------------------------------------------------------------------------
// Base-stat precedence — the SINGLE rule for "what does a % modifier scale?"
// ---------------------------------------------------------------------------

/**
 * Decide which base ATK/HP/DEF a percentage modifier scales, given the two
 * places a base value can come from.
 *
 * PRECEDENCE: `Stats.base` WINS over an explicit per-character map.
 *
 * Rationale — these two sources are not equally trustworthy:
 *
 *  - `stats.base` travels WITH the very bag being folded. It is by construction
 *    the base of THIS bag: if an equipment layer produced final ATK 2400 from
 *    base 1100, `base.atk` is 1100 for that bag and cannot refer to anything
 *    else.
 *  - The explicit map is keyed by character id ALONE. It cannot see which bag
 *    it is being applied to, so it silently goes stale as soon as gear, weapon
 *    or stance changes the bag it was written for.
 *
 * When the two disagree, one of them is out of date, and it is always the map:
 * the id-keyed value was written once, the attached base was derived from the
 * bag in hand. Preferring the map would let a stale entry quietly rescale every
 * percentage modifier with nothing failing — the exact silent-wrongness this
 * project treats as its signature defect.
 *
 * ALL-OR-NOTHING, not per-channel: when `stats.base` is present it supplies all
 * three channels and the map is ignored entirely. Merging channel-by-channel
 * would let a partial map pair base ATK from one source with base HP from
 * another, producing a base bag that never described any real character.
 *
 * The map is RETAINED (not removed) for callers that hold base values but no
 * `Stats.base` bag — a `Stats` literal built by hand in data or a test. It is
 * a fallback, not a co-equal source.
 *
 * PURE.
 */
export function resolveBaseValues(
  stats: Stats,
  explicit: BaseStatValues = {},
): BaseStatValues {
  // `stats.base` is a complete BaseStats (all three channels required), so
  // there is nothing left for the map to contribute when it is present.
  return stats.base ?? explicit;
}

export interface ResolverDiagnostics {
  /** Channels where a % modifier was dropped for lack of a base value. */
  skippedPercentChannels: readonly ("atk" | "hp" | "def")[];
  /**
   * Modifiers dropped because their required discriminator was missing:
   * `elementalDmgBonus` with no `element`, `reactionBonus` with no `reaction`.
   *
   * Reported so malformed data is visible rather than silently ignored. Only
   * populated by entry points that sum modifiers themselves
   * ({@link foldBuffsIntoStatsWithDiagnostics}); `applyTotals` receives totals
   * that were already summed elsewhere and cannot see the dropped modifiers.
   */
  skippedKeyedModifiers: readonly StatKey[];
}

function foldChannel(
  finalValue: number,
  base: number | undefined,
  percent: number,
  flat: number,
  channel: "atk" | "hp" | "def",
  skipped: ("atk" | "hp" | "def")[],
): number {
  // stat = base * (1 + pct) + flat, expressed as a delta on the incoming final
  // value so pre-existing (weapon/artifact) contributions are preserved.
  if (percent !== 0) {
    if (base === undefined) {
      skipped.push(channel);
      return finalValue + flat;
    }
    return finalValue + base * percent + flat;
  }
  return finalValue + flat;
}

/**
 * Fold summed modifiers onto a `Stats` object.
 *
 * PURE: returns a brand-new `Stats` (including a new `elementalDmgBonus` map);
 * `base` is never mutated.
 */
export function applyTotals(
  base: Stats,
  totals: ModifierTotals,
  explicitBaseValues: BaseStatValues = {},
): { stats: Stats; diagnostics: ResolverDiagnostics } {
  const skipped: ("atk" | "hp" | "def")[] = [];
  // One precedence rule, applied here so EVERY entry point shares it.
  const baseValues = resolveBaseValues(base, explicitBaseValues);

  const elementalDmgBonus: Partial<Record<Element, number>> = {
    ...base.elementalDmgBonus,
  };
  for (const [element, bonus] of Object.entries(totals.elementalDmgBonus)) {
    const key = element as Element;
    elementalDmgBonus[key] = (elementalDmgBonus[key] ?? 0) + (bonus ?? 0);
  }

  // Same per-key additive merge as elementalDmgBonus, one map down: a missing
  // key reads as 0, and several sources naming the same reaction add up.
  //
  // KEY OMISSION IS DELIBERATE. Unlike `elementalDmgBonus`, `Stats.reactionBonus`
  // is OPTIONAL, so absence is a legal state that this fold must round-trip: a
  // bag with no reaction bonuses in and no reaction bonuses added comes back
  // WITHOUT the key, never as an empty `{}`. Two reasons this is the deliberate
  // choice rather than the convenient one:
  //   1. Identity — `fold(stats, [])` must deep-equal `stats`. Materialising `{}`
  //      would make the fold silently reshape every bag it touches.
  //   2. Determinism for the optimizer — `{}` and absent hash differently, so
  //      materialising would split one memo entry into two for zero information.
  // Safe downstream because every consumer reads `stats.reactionBonus?.[k] ?? 0`
  // (see `reactions/resolver.ts`, `engine/reactionSeam.ts`), for which an absent
  // map and an empty map are indistinguishable.
  const reactionBonus: ReactionBonusMap = {
    ...(base.reactionBonus ?? NO_REACTION_BONUS),
  };
  for (const [reaction, bonus] of Object.entries(totals.reactionBonus)) {
    const key = reaction as ReactionBonusKey;
    reactionBonus[key] = (reactionBonus[key] ?? 0) + (bonus ?? 0);
  }
  const hasReactionBonus = Object.keys(reactionBonus).length > 0;
  const baseDmgMultiplier: Partial<Record<DamageType, number>> = {
    ...(base.baseDmgMultiplier ?? {}),
  };
  for (const [damageType, bonus] of Object.entries(totals.baseDmgMultiplier)) {
    const key = damageType as DamageType;
    // Buff values are bonuses to the identity multiplier. This preserves the
    // existing Stats representation, where an authored 1.5 means 150% of the
    // talent motion value, while allowing several conditional buffs to add.
    baseDmgMultiplier[key] = (baseDmgMultiplier[key] ?? 1) + (bonus ?? 0);
  }
  const stats: Stats = {
    atk: foldChannel(
      base.atk,
      baseValues.atk,
      totals.atkPercent,
      totals.atkFlat,
      "atk",
      skipped,
    ),
    hp: foldChannel(
      base.hp,
      baseValues.hp,
      totals.hpPercent,
      totals.hpFlat,
      "hp",
      skipped,
    ),
    def: foldChannel(
      base.def,
      baseValues.def,
      totals.defPercent,
      totals.defFlat,
      "def",
      skipped,
    ),
    elementalMastery: base.elementalMastery + totals.elementalMastery,
    critRate: base.critRate + totals.critRate,
    critDmg: base.critDmg + totals.critDmg,
    energyRecharge: base.energyRecharge + totals.energyRecharge,
    dmgBonus: base.dmgBonus + totals.dmgBonus,
    elementalDmgBonus,
    ...(base.base !== undefined ? { base: { ...base.base } } : {}),
    ...(base.typeDmgBonus !== undefined
      ? { typeDmgBonus: { ...base.typeDmgBonus } }
      : {}),
    ...(base.flatDamageBonus !== undefined || totals.flatDamageBonus !== 0
      ? { flatDamageBonus: (base.flatDamageBonus ?? 0) + totals.flatDamageBonus }
      : {}),
    ...(base.baseDmgMultiplier !== undefined
      ? { baseDmgMultiplier }
      : {}),
    ...(base.baseDmgMultiplier === undefined && Object.keys(totals.baseDmgMultiplier).length > 0
      ? { baseDmgMultiplier }
      : {}),
    // Spread-or-nothing: omits the key entirely when empty (see above).
    ...(hasReactionBonus ? { reactionBonus } : {}),
  };

  return {
    stats,
    diagnostics: { skippedPercentChannels: skipped, skippedKeyedModifiers: [] },
  };
}

/**
 * Convenience: sum + apply modifiers and conversions in one pure step, keeping
 * the diagnostics collected while summing.
 */
export function foldBuffsIntoStatsWithDiagnostics(
  base: Stats,
  active: readonly ActiveBuff[],
  explicitBaseValues: BaseStatValues = {},
): { stats: Stats; diagnostics: ResolverDiagnostics } {
  // Resolve ONCE and share, so modifier folding and stat conversions can never
  // disagree about what a percentage scales.
  const baseValues = resolveBaseValues(base, explicitBaseValues);
  const { totals, skippedKeyedModifiers } = sumModifiersWithDiagnostics(active);
  const applied = applyTotals(base, totals, baseValues);
  return {
    stats: applyActiveConversions(applied.stats, active, baseValues),
    diagnostics: {
      skippedPercentChannels: applied.diagnostics.skippedPercentChannels,
      skippedKeyedModifiers,
    },
  };
}

/**
 * Convenience: sum + apply modifiers and conversions in one pure step.
 */
export function foldBuffsIntoStats(
  base: Stats,
  active: readonly ActiveBuff[],
  explicitBaseValues: BaseStatValues = {},
): Stats {
  return foldBuffsIntoStatsWithDiagnostics(base, active, explicitBaseValues)
    .stats;
}


// ---------------------------------------------------------------------------
// Enemy-side totals — computed but NOT consumed (see types.ts)
// ---------------------------------------------------------------------------

/**
 * Aggregate DEF/RES shred from active buffs carrying enemy modifiers.
 *
 * UNSUPPORTED end-to-end: the damage pipeline has no seam to receive this, so
 * nothing calls it in the damage path yet. Exposed so the model is testable and
 * ready the moment combat-engineer adds the seam.
 */
export function sumEnemyModifiers(
  modifiers: readonly EnemyModifier[],
): EnemyModifierTotals {
  return accumulateEnemyModifiers(emptyEnemyTotals(), modifiers, 1);
}

function emptyEnemyTotals(): EnemyModifierTotals {
  return { defReduction: 0, defIgnore: 0, resReduction: {} };
}

/**
 * Fold one batch of enemy modifiers into `totals`, scaled by `stacks`.
 *
 * DEF reduction and DEF ignore are summed WITHIN their own channel here; the
 * damage pipeline then applies the two channels as separate multiplicative
 * factors. RES reduction is summed per element. Same-channel sources being
 * additive (and the two DEF channels being multiplicative with each other) is
 * the standard model — see the pipeline's `defMultiplier`.
 *
 * Mutates only the `totals` object it was handed, which the callers own.
 */
function accumulateEnemyModifiers(
  totals: EnemyModifierTotals,
  modifiers: readonly EnemyModifier[],
  stacks: number,
): EnemyModifierTotals {
  for (const modifier of modifiers) {
    const amount = modifier.value * stacks;
    if (modifier.key === "resReduction") {
      // A RES shred that names no element is malformed; ignore rather than
      // guessing which element was meant.
      if (modifier.element === undefined) continue;
      const current = totals.resReduction[modifier.element] ?? 0;
      totals.resReduction[modifier.element] = current + amount;
      continue;
    }
    totals[modifier.key] += amount;
  }
  return totals;
}

/**
 * Aggregate the enemy-side debuffs carried by a set of already-filtered active
 * buffs, honouring each buff's stack count.
 *
 * Pure: returns a fresh totals object; never mutates the input.
 */
export function sumActiveEnemyModifiers(
  active: readonly ActiveBuff[],
): EnemyModifierTotals {
  const totals = emptyEnemyTotals();
  for (const { buff, stacks } of active) {
    accumulateEnemyModifiers(totals, buff.enemyModifiers ?? [], stacks);
  }
  return totals;
}
