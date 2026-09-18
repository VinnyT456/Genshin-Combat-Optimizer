import type {
  AbilityDefinition,
  DamageInstance,
  DamageType,
  Element,
  EnemyModifiers,
  EnemyState,
  HealingEvent,
  SimulationConfig,
  Stats,
} from "@/types";
import { baseDmgMultiplierFor, NO_ENEMY_MODIFIERS } from "@/types";
import type { PlannedHit } from "@/simulation/character/execution";
import { scaledBase } from "@/simulation/character/scaling";

// ============================================================================
// Damage pipeline
//
// AUDITED against the KQM Theorycrafting Library (library.keqingmains.com),
// page `combat-mechanics/damage/damage-formula`, whose general formula is:
//
//   DMG = (Σ(BaseDMG * BaseDMGMultiplier) + AdditiveBaseDMGBonus)
//         * (1 + DMGBonus - DMGReduction_target)
//         * CRIT * EnemyDefMult * EnemyResMult * AmplifyingReaction
//
// Our term order below differs only in the ORDER the multiplications are
// written; all of CRIT / DEF / RES / Amplifying are scalar factors on the same
// product, so the result is identical and the fixed order keeps it
// reproducible.
//
// Standard Genshin damage formula (Phase 1 subset):
//
//   base       = talentMultiplier * scalingStat
//   dmgBonus   = 1 + genericDmg% + elementalDmg%
//   crit       = expected | forced-crit | forced-noncrit
//   defMult    = defenderLevelFactor / (defenderLevelFactor + enemyDefFactor)
//                (enemy DEF first reduced by DEF shred / DEF ignore)
//   resMult    = resistance multiplier (handles negative res)
//                (enemy RES first reduced by RES shred)
//
//   final = (base * baseDmgMultiplier + additive) * dmgBonus * defMult
//           * resMult * amplifyingReaction * crit
//
// CANONICAL ORDER (fixed, so results are reproducible):
//   Base Stats -> Talent Scaling -> Base DMG Multiplier -> Additive Bonuses
//   -> DMG Bonus -> Crit -> DEF -> RES -> Reaction
//
// `Base DMG Multiplier` sits BETWEEN talent scaling and additive bonuses
// because KQM places it inside the sigma: `Σ(BaseDMG * BaseDMGMultiplier)
// + AdditiveBaseDMGBonus`. It is a refinement of the canonical order, not a
// reordering of it — every previously listed term keeps its relative position.
//
// Non-ATK scaling is live: `input.hit` carries talent-resolved scaling TERMS
// (ATK/HP/DEF/EM) which `scaledBase` sums, so hybrid instances work.
//
// DEF/RES shred totals arrive via the enemy-modifier seam
// (`SimulationConfig.enemyModifierResolver`) and reaction terms via the
// reaction seam (`engine/reactionSeam.ts`); mechanics COMPUTES both, this file
// only SEQUENCES them. Transformative reactions are not here — they are
// independent instances the engine emits separately. Non-reaction flat
// additive terms (Zhongli A4, Shenhe, Yun Jin) ride `Stats.flatDamageBonus`,
// which the buff layer populates. Nothing here is character-specific.
// ============================================================================

/**
 * Hard cap on TOTAL DEF reduction, per KQM TCL.
 *
 * Source: KQM Theorycrafting Library, `combat-mechanics/damage/damage-formula`
 * ("DefReduction is hard capped at 90%") and its Evidence Vault entry
 * "Defense shred is hard capped at 90%" (Phana/Mcpie/jamberry, 2021-08-09),
 * which measured Barbara/Klee damage against stacked shred and matched the
 * 90%-capped prediction to within stat-page rounding.
 *
 * This applies to DEF REDUCTION only. DEF IGNORE is a separate channel and
 * KQM states no cap for it, so it is NOT capped here.
 */
export const MAX_DEF_REDUCTION = 0.9;

/**
 * DEF multiplier. Character level and enemy level determine how much of the
 * enemy's DEF is ignored.
 *
 * DEF shred enters here as two SEPARATE multiplicative factors on the enemy's
 * effective DEF, matching KQM's `EnemyDefMult`:
 *
 *   (charLvl+100)
 *   / ((charLvl+100) + (enemyLvl+100) * (1 - DefReduction) * (1 - DefIgnore))
 *
 * They are never summed. Both default to 0, so calling this with two arguments
 * is identical to the pre-shred behaviour.
 *
 * DEF reduction is clamped to [0, MAX_DEF_REDUCTION]. The upper clamp matters:
 * stacked shred (e.g. Lisa A4 15% + Klee C2 23% + Ayaka C4 30% + Razor C4 15%
 * + Zhongli 20% = 103%) previously drove the reduction factor to 0, making the
 * enemy's DEF vanish entirely and the multiplier 1.0. KQM caps it at 90%,
 * giving 0.90476 — the old value overstated damage by ~10.5%.
 *
 * DEF ignore is clamped at 0 only (no upper cap is documented by KQM), so
 * >100% ignore does not start healing the enemy's DEF back up.
 */
export function defMultiplier(
  characterLevel: number,
  enemyLevel: number,
  defReduction = 0,
  defIgnore = 0,
): number {
  const attacker = characterLevel + 100;
  const cappedReduction = Math.min(MAX_DEF_REDUCTION, Math.max(0, defReduction));
  const reduction = 1 - cappedReduction;
  const ignore = Math.max(0, 1 - defIgnore);
  const defender = (enemyLevel + 100) * reduction * ignore;
  return attacker / (attacker + defender);
}

/**
 * Resistance multiplier. Mirrors the in-game piecewise formula:
 *   res < 0        -> 1 - res/2
 *   0 <= res < 0.75 -> 1 - res
 *   res >= 0.75    -> 1 / (4*res + 1)
 */
export function resMultiplier(resistance: number): number {
  if (resistance < 0) return 1 - resistance / 2;
  if (resistance < 0.75) return 1 - resistance;
  return 1 / (4 * resistance + 1);
}

/**
 * DMG bonus bracket, per KQM's general formula:
 *
 *   (1 + DMGBonus - DMGReduction_target)
 *
 * Every DMG% source is ADDITIVE with every other one — generic, per-element
 * and per-damage-type all sum into the single `DMGBonus` term. None of them is
 * a separate multiplier. (Amplifying reactions look like a big DMG% but are
 * NOT part of this bracket; they multiply the whole result instead.)
 *
 * Target DMG Reduction subtracts INSIDE the same bracket rather than forming
 * its own factor, so a high attacker DMG Bonus dilutes it.
 *
 * Clamped at 0: reduction cannot flip the bracket negative and turn damage
 * into healing.
 */
function totalDmgBonus(
  stats: Stats,
  element: Element,
  damageType?: DamageType,
  dmgReduction = 0,
  additionalDmgBonus = 0,
): number {
  const elemental = stats.elementalDmgBonus[element] ?? 0;
  const typeBonus =
    damageType && stats.typeDmgBonus
      ? (stats.typeDmgBonus[damageType] ?? 0)
      : 0;
  return Math.max(0, 1 + stats.dmgBonus + additionalDmgBonus + elemental + typeBonus - dmgReduction);
}

export interface DamageInput {
  timestamp: number;
  sourceCharacterId: string;
  ability?: AbilityDefinition;
  /** Planned hit from generic execution (takes precedence over ability). */
  hit?: PlannedHit;
  /**
   * Healing-derived damage source, used by artifact effects such as a stored
   * healing detonation. The caller supplies the deterministic accumulated
   * healing event and the sourced conversion multiplier; no artifact identity
   * is interpreted by this pipeline.
   */
  healing?: {
    event: HealingEvent;
    multiplier: number;
    maxAmount?: number;
    /** Healing artifact damage can opt out of ordinary mitigation and crit. */
    bypassMitigation?: boolean;
  };
  /** Element override (e.g. from elemental weapon infusion). */
  element?: Element;
  /** Damage type override (e.g. from stance damageTypeOverride). */
  damageType?: DamageType;
  stats: Stats;
  characterLevel: number;
  enemy: EnemyState;
  config: SimulationConfig;
  /**
   * `AdditiveBaseDMGBonus` from NON-reaction sources (Zhongli A4, Shenhe's Icy
   * Quills, Yun Jin's Cliffbreaker's Banner, Xianyun A4, Hu Tao C2, ...).
   *
   * Source: KQM TCL `combat-mechanics/damage/damage-formula`, "Additive Base
   * DMG Sources", which lists these alongside Aggravate/Spread as members of
   * the SAME term. They therefore share one channel here rather than getting
   * separate ones.
   *
   * Added to base damage AFTER `BaseDMGMultiplier` has scaled the talent
   * value, and before DMG%, DEF, RES and CRIT.
   *
   * Supplied by the engine from `Stats.flatDamageBonus`, which the buff layer
   * populates; an explicit value here overrides that for one instance.
   */
  flatDamageBonus?: number;
  /** Per-instance dynamic DMG bonus from a declarative kit condition. */
  additionalDmgBonus?: number;
  /**
   * Per-instance `BaseDMGMultiplier` override.
   *
   * Absent means "use the damage-type-keyed value on `Stats`", which is the
   * normal path — Yoimiya's and Wanderer's buffs are timed effects on Normal
   * Attacks, so they belong on the stat bag the buff layer resolves. This
   * override exists for the case a single instance of a multi-hit ability is
   * excluded, which the stat-bag shape alone cannot express.
   */
  baseDamageMultiplier?: number;
  /**
   * Enemy-side debuffs for THIS hit, supplied by the mechanics layer via the
   * enemy-modifier seam. Optional: defaults to no shred, so existing callers
   * are unaffected.
   *
   * These are applied ON TOP of `enemy`'s own values. The engine reads the
   * enemy's declared resistances and shreds them here exactly once; it never
   * mutates `enemy`, so there is no path by which a value is shredded twice
   * within one hit.
   */
  enemyModifiers?: EnemyModifiers;
  /**
   * Reaction terms for THIS hit, supplied by the mechanics layer via the
   * reaction seam. Optional: absent means "no reaction", so every existing
   * caller is unaffected.
   *
   * The engine SEQUENCES these; it does not compute them. Both enter at fixed
   * points in the canonical order (see `reaction` below).
   */
  reaction?: ReactionTerms;
}

/**
 * The two channels a reaction applies to the TRIGGERING instance.
 *
 * Transformative reactions are NOT here: they are independent damage
 * instances that do not scale with the trigger's stats, so the engine emits
 * them as their own events rather than folding them in.
 */
export interface ReactionTerms {
  /**
   * Added to BASE damage, inside the parenthesis, before DMG%/crit/DEF/RES.
   * This is the additive channel (aggravate / spread).
   */
  additiveBaseDamageBonus?: number;
  /**
   * Multiplies the instance's damage AFTER crit/DEF/RES. This is the
   * amplifying channel (vaporize / melt). 1 == no amplification.
   */
  amplifyingMultiplier?: number;
}

export function computeDamage(input: DamageInput): DamageInstance {
  const { stats, enemy, characterLevel, config } = input;
  const shred = input.enemyModifiers ?? NO_ENEMY_MODIFIERS;

  let rawDamage: number;
  let element: Element;
  let damageType: DamageType;
  let abilityId: string;
  let abilityName: string;
  const healingSource = input.healing;

  if (input.hit) {
    rawDamage = scaledBase(input.hit.scaling, stats);
    element = input.element ?? input.hit.element;
    damageType = input.damageType ?? input.hit.damageType;
    abilityId = input.hit.abilityId;
    abilityName = input.hit.abilityName;
  } else if (input.ability) {
    const scalingStat = stats.atk; // Phase 1: ATK-only scaling.
    rawDamage = input.ability.multiplier * scalingStat;
    element = input.element ?? input.ability.element;
    damageType = input.damageType ?? input.ability.damageType;
    abilityId = input.ability.id;
    abilityName = input.ability.name;
  } else if (healingSource) {
    const recordedAmount = Number.isFinite(healingSource.event.amount)
      ? Math.max(0, healingSource.event.amount)
      : 0;
    const maximum =
      healingSource.maxAmount !== undefined &&
      Number.isFinite(healingSource.maxAmount)
        ? Math.max(0, healingSource.maxAmount)
        : Number.POSITIVE_INFINITY;
    const multiplier = Number.isFinite(healingSource.multiplier)
      ? Math.max(0, healingSource.multiplier)
      : 0;
    const amount = Math.max(
      0,
      Math.min(recordedAmount, maximum),
    );
    rawDamage = amount * multiplier;
    element = input.element ?? "physical";
    damageType = input.damageType ?? "reaction";
    abilityId = "healing-derived";
    abilityName = "Healing-derived damage";
  } else {
    throw new Error("computeDamage requires either hit or ability");
  }

  // BASE DMG MULTIPLIER multiplies the TALENT MOTION VALUE, strictly INSIDE
  // the sigma of KQM's `Σ(BaseDMG * BaseDMGMultiplier) + AdditiveBaseDMGBonus`
  // — so it scales the talent base but NOT the additive bonuses that follow.
  // That placement is load-bearing, not cosmetic: KQM's Yoimiya page states
  // Niwabi Fire-Dance "does not increase Yun Jin's Cliffbreaker's Banner
  // bonus", and Yun Jin's bonus is exactly an AdditiveBaseDMGBonus. Applying
  // it after the addition instead would inflate every flat additive and every
  // aggravate/spread term along with it.
  //
  // A per-instance override (`input.baseDamageMultiplier`) wins over the
  // stats-carried, damage-type-keyed one so a single instance of a multi-hit
  // ability can opt out.
  const baseDmgMultiplier =
    input.baseDamageMultiplier ?? baseDmgMultiplierFor(stats, damageType);
  const scaledTalentBase = rawDamage * baseDmgMultiplier;

  // ADDITIVE BONUSES enter the base, inside the parenthesis, before DMG%.
  // Aggravate/spread and flat additives (Shenhe / Yun Jin) add flat base damage that is then
  // scaled by DMG%, crit, DEF and RES exactly like the talent base is.
  const additive =
    (input.reaction?.additiveBaseDamageBonus ?? 0) +
    (input.flatDamageBonus ?? stats.flatDamageBonus ?? 0);
  const baseDamage = scaledTalentBase + additive;

  const bonusMult = healingSource?.bypassMitigation
    ? 1
    : totalDmgBonus(stats, element, damageType, shred.dmgReduction, input.additionalDmgBonus);
  const def = healingSource?.bypassMitigation
    ? 1
    : defMultiplier(
        characterLevel,
        enemy.level,
        shred.defReduction,
        shred.defIgnore,
      );
  // RES shred subtracts from the enemy's declared resistance BEFORE the
  // piecewise multiplier, so shredding past 0 correctly enters the
  // negative-resistance branch (which halves the surplus) rather than being
  // clamped away.
  const baseRes = enemy.resistances[element] ?? 0;
  const shredded = baseRes - (shred.resReduction[element] ?? 0);
  const res = healingSource?.bypassMitigation ? 1 : resMultiplier(shredded);

  // REACTION (amplifying) is the LAST term, applied after crit/DEF/RES.
  const amplify = input.reaction?.amplifyingMultiplier ?? 1;

  const preCrit = baseDamage * bonusMult * def * res * amplify;

  const nonCritDamage = preCrit;
  const critDamage = preCrit * (1 + stats.critDmg);
  const clampedCritRate = Math.min(1, Math.max(0, stats.critRate));
  const expectedDamage = preCrit * (1 + clampedCritRate * stats.critDmg);

  let finalDamage: number;
  if (healingSource?.bypassMitigation) {
    finalDamage = preCrit;
  } else switch (config.critMode ?? "expected") {
    case "always":
      finalDamage = critDamage;
      break;
    case "never":
      finalDamage = nonCritDamage;
      break;
    default:
      finalDamage = expectedDamage;
  }

  return {
    timestamp: input.timestamp,
    sourceCharacterId: input.sourceCharacterId,
    abilityId,
    abilityName,
    element,
    damageType,
    // Reported base INCLUDES the additive reaction term, so `rawDamage` is
    // always the value the rest of the pipeline actually scaled.
    rawDamage: baseDamage,
    finalDamage,
    nonCritDamage,
    critDamage,
  };
}
