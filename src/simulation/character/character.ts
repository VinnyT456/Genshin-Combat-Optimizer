import type { Element, Stats } from "@/types";
import type {
  ConstellationDefinition,
  KitAbility,
  NormalAttackString,
  PassiveDefinition,
  Rarity,
  ResourceDefinition,
  WeaponType,
} from "@/simulation/character/kit";

// ============================================================================
// Character definition (generic model).
//
// Additive to the legacy `CharacterDefinition` in `src/types` — that shape is
// untouched and every existing consumer keeps working. An adapter
// (`adapter.ts`) lifts a legacy character into this model, so the two coexist
// during migration instead of requiring a breaking rewrite.
// ============================================================================

/**
 * The stat a character gains on ascension. Genshin gives exactly one per
 * character, drawn from this set.
 */
export type AscensionStat =
  | "atkPercent"
  | "hpPercent"
  | "defPercent"
  | "elementalMastery"
  | "critRate"
  | "critDmg"
  | "energyRecharge"
  | "healingBonus"
  | "elementalDmgBonus"
  | "physicalDmgBonus";

/**
 * Ascension stat and its per-phase curve.
 *
 * `valueByPhase[0]` is ascension phase 0 (always 0 in game — the stat is not
 * unlocked yet). Phases run 0..6. Expressed as a table for the same reason
 * talent multipliers are: a scalar bakes in one level.
 */
export interface AscensionBonus {
  stat: AscensionStat;
  /** Value at each ascension phase 0..6. */
  valueByPhase: readonly number[];
  /** Required when `stat === "elementalDmgBonus"`. */
  element?: Element;
}

/** Base stat curve: base ATK/HP/DEF at a given character level. */
export interface BaseStatCurve {
  /** Base value at each supported character level, keyed by level. */
  byLevel: Readonly<Record<number, number>>;
}

/** The three stats that follow a level curve in game. */
export interface BaseStatCurves {
  hp: BaseStatCurve;
  atk: BaseStatCurve;
  def: BaseStatCurve;
}

/** Per-talent-type levels. Each of the three talents levels independently. */
export interface TalentLevels {
  normal: number;
  skill: number;
  burst: number;
}

/**
 * A fully data-driven character.
 *
 * Every field is data. Nothing here is executable, so a whole roster is
 * JSON-serializable and can be validated, diffed, and shipped to a Worker.
 */
export interface GenericCharacterDefinition {
  id: string;
  name: string;
  element: Element;
  weaponType: WeaponType;
  rarity: Rarity;

  /** Character level (1..90). */
  level: number;
  /** Ascension phase (0..6), which gates passives and the ascension stat. */
  ascensionPhase: number;
  /** Owned constellation level, 0..6. */
  constellationLevel: number;
  talentLevels: TalentLevels;

  /** Level curves for base HP/ATK/DEF. */
  baseStatCurves: BaseStatCurves;
  ascensionBonus: AscensionBonus;
  /**
   * Non-curve stats (crit rate/dmg base, ER base). Base ATK/HP/DEF come from
   * the curves and override any value present here.
   */
  baseStats: Stats;

  maxEnergy: number;

  // --- Kit ---------------------------------------------------------------
  normalAttacks: NormalAttackString;
  chargedAttack?: KitAbility;
  plungeLow?: KitAbility;
  plungeHigh?: KitAbility;
  skill: KitAbility;
  burst: KitAbility;

  passives: readonly PassiveDefinition[];
  constellations: readonly ConstellationDefinition[];
  /** Character-owned stacks / stances / pools. */
  resources: readonly ResourceDefinition[];
}

/**
 * Every castable ability of a character, in deterministic order.
 *
 * ORDERING GUARANTEE (N13) — this order is part of the contract and callers
 * (the UI kit display, the optimizer's candidate enumeration) may rely on it
 * without re-sorting:
 *
 *   1. the normal-attack string, in authored N1..Nn order
 *   2. chargedAttack, if present
 *   3. plungeLow, if present
 *   4. plungeHigh, if present
 *   5. skill
 *   6. burst
 *
 * Optional slots are SKIPPED, never emitted as holes, so the sequence is dense.
 * The order is written out explicitly rather than derived from `Object.values`
 * on an optional-slot record, which would make it depend on authoring order.
 */
export function allAbilities(
  def: GenericCharacterDefinition,
): readonly KitAbility[] {
  const out: KitAbility[] = [...def.normalAttacks.hits];
  // Fixed order — never `Object.values` on an optional-slot record, which
  // would make ability ordering depend on authoring order.
  if (def.chargedAttack) out.push(def.chargedAttack);
  if (def.plungeLow) out.push(def.plungeLow);
  if (def.plungeHigh) out.push(def.plungeHigh);
  out.push(def.skill, def.burst);
  return out;
}

/** Looks an ability up by id. Returns undefined when absent. */
export function findAbility(
  def: GenericCharacterDefinition,
  abilityId: string,
): KitAbility | undefined {
  return allAbilities(def).find((a) => a.id === abilityId);
}

/**
 * Ascension stat value at the character's current phase, clamped into range.
 * Phase 0 yields the table's first entry (0 in game).
 */
export function ascensionValue(bonus: AscensionBonus, phase: number): number {
  const { valueByPhase } = bonus;
  if (valueByPhase.length === 0) return 0;
  const index = Math.min(Math.max(phase, 0), valueByPhase.length - 1);
  return valueByPhase[index]!;
}

/**
 * Passives unlocked at the character's ascension phase, in declaration order.
 * A passive with no `unlockAscension` is always unlocked.
 */
export function unlockedPassives(
  def: GenericCharacterDefinition,
): readonly PassiveDefinition[] {
  return def.passives.filter(
    (p) => (p.unlockAscension ?? 0) <= def.ascensionPhase,
  );
}

/** Constellations the character owns, in ascending level order. */
export function activeConstellations(
  def: GenericCharacterDefinition,
): readonly ConstellationDefinition[] {
  // Definitions normally come from generated, validated data, but this is a
  // public runtime seam and website/session payloads are deserialised input.
  // An out-of-range or non-finite level cannot identify a legal C0--C6 state;
  // fail closed rather than treating (for example) C99 as ownership of every
  // constellation and leaking its damage/stat/energy effects.
  if (
    !Number.isInteger(def.constellationLevel) ||
    def.constellationLevel < 0 ||
    def.constellationLevel > 6
  ) {
    return [];
  }
  return def.constellations
    .filter(
      (c) =>
        Number.isInteger(c.level) &&
        c.level >= 1 &&
        c.level <= 6 &&
        c.level <= def.constellationLevel,
    )
    .slice()
    .sort((a, b) => a.level - b.level);
}
