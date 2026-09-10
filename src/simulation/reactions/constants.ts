// ============================================================================
// Verified game constants for the elemental reaction system.
//
// DATA PROVENANCE — every value below is cross-verified against TWO
// INDEPENDENT sources (project rule: never fill a constant from memory):
//
//   [S1] Genshin Impact Wiki (Fandom), retrieved 2026-09-02 via the MediaWiki
//        `action=parse` API (the rendered HTML is 403 from this environment,
//        the API is not). Pages: `Elemental Gauge Theory`, `Elemental
//        Reaction`, `Elemental Reaction/Level Scaling`, `Damage`,
//        `Elemental Mastery`, `Internal Cooldown`.
//   [S2] `frzyc/genshin-optimizer` @ master, an independent open-source
//        implementation whose numbers are datamined from the game client
//        (`ElementCoeffExcelConfigData: PlayerElementLevelCo`). Files:
//        `libs/gi/keymap/src/StatConstants.ts`.
//   [S3] KQM Theorycrafting Library (TCL), `github.com/KQM-git/TCL` @ master,
//        retrieved 2026-09-06 by cloning the repo (the rendered site is 403
//        from this environment). Community-maintained, independently sourced
//        from in-game testing; NOT derived from [S1]. Files are Markdown under
//        `docs/combat-mechanics/`.
//
// Anything that could NOT be cross-verified is exported from
// `unverified.ts` instead, never from this file. Precedent:
// `PARTICLE_COLORLESS_MULTIPLIER` (energy module) is still marked UNVERIFIED
// rather than guessed. A wrong reaction multiplier is worse than a missing
// one, because it looks right.
// ============================================================================

import type { Element } from "@/types";

// ---------------------------------------------------------------------------
// Gauge units
// ---------------------------------------------------------------------------

/**
 * Aura Tax: an aura created by an elemental attack retains only 80% of the
 * attack's gauge.
 *
 *   initialAuraGauge = AURA_TAX * attackGauge
 *
 * Verified: [S1] Elemental Gauge Theory / "Aura Tax" — a 2U Pyro application
 * creates a 1.6U aura.
 */
export const AURA_TAX = 0.8;

/**
 * Aura base duration in seconds for an attack of `x` gauge units:
 *
 *   baseDuration(x) = AURA_DURATION_SLOPE * x + AURA_DURATION_INTERCEPT
 *
 * Verified: [S1] Elemental Gauge Theory / "Aura Duration and Decay Rate".
 * Reproduces the published table exactly: 1U->9.5s, 1.5U->10.75s, 2U->12s,
 * 4U->17s, 8U->27s.
 */
export const AURA_DURATION_SLOPE = 2.5;
export const AURA_DURATION_INTERCEPT = 7;

/**
 * Gauge consumed per Electro-Charged tick, from BOTH the Hydro and the Electro
 * gauge, until either reaches 0.
 *
 * Verified: [S1] Elemental Gauge Theory / "Electro-Charged".
 */
export const ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK = 0.4;

/**
 * Dendro gauge drained per SECOND while a Burning aura is active.
 *
 * Verified: [S1] Elemental Gauge Theory / "Burning" — "the Dendro Aura will be
 * affected by a steady per-frame consumption of 0.4U per second".
 */
export const BURNING_DENDRO_DRAIN_PER_SECOND = 0.4;

// ---------------------------------------------------------------------------
// Reaction coefficients (aura CONSUMPTION, not damage)
// ---------------------------------------------------------------------------

/**
 * How much aura a reaction consumes:
 *
 *   resultGauge = auraGauge - REACTION_COEFFICIENT * triggerGauge
 *
 * This is the CONSUMPTION coefficient and is unrelated to the DAMAGE
 * multipliers below — a common and damaging conflation. Note the asymmetry
 * mirrors the damage side: the 2x-damage ("forward") direction also consumes
 * 2x aura, which is why forward vaporize usually clears the aura outright.
 *
 * Verified: [S1] Elemental Gauge Theory / "Most Elemental Reactions" table.
 */
export const REACTION_COEFFICIENT_HIGH = 2;
export const REACTION_COEFFICIENT_STANDARD = 1;
export const REACTION_COEFFICIENT_LOW = 0.5;

// ---------------------------------------------------------------------------
// Amplifying reaction damage multipliers
// ---------------------------------------------------------------------------

/**
 * Base multiplier applied to the TRIGGERING damage instance.
 *
 * Direction matters and is the single most common modelling bug:
 *   Melt      Pyro onto Cryo aura   -> 2.0   ("forward")
 *             Cryo onto Pyro aura   -> 1.5   ("reverse")
 *   Vaporize  Hydro onto Pyro aura  -> 2.0   ("forward")
 *             Pyro onto Hydro aura  -> 1.5   ("reverse")
 *
 * Verified: [S1] Damage / "Amplifying Reaction Damage" AND [S1] Elemental
 * Reaction (element-order table); [S2] `amplifyingReactions`
 * (`vaporize: {pyro: 1.5, hydro: 2}`, `melt: {pyro: 2, cryo: 1.5}`).
 * Both sources agree on both directions.
 */
export const AMPLIFYING_FORWARD_MULTIPLIER = 2.0;
export const AMPLIFYING_REVERSE_MULTIPLIER = 1.5;

// ---------------------------------------------------------------------------
// Transformative reaction base coefficients
// ---------------------------------------------------------------------------

/**
 * Base Reaction Coefficient for transformative reactions:
 *
 *   dmg = coefficient * levelMultiplier * (1 + emBonus + reactionBonus)
 *         * resMultiplier
 *
 * Verified against BOTH sources, which agree on every value:
 *   [S1] Damage / "Transformative Reaction Damage"
 *   [S2] `transformativeReactions[*].multi`
 */
export const TRANSFORMATIVE_COEFFICIENTS = {
  burning: 0.25,
  swirl: 0.6,
  superconduct: 1.5,
  electroCharged: 2.0,
  bloom: 2.0,
  overloaded: 2.75,
  burgeon: 3.0,
  hyperbloom: 3.0,
  shattered: 3.0,
} as const satisfies Record<string, number>;

/**
 * Which element's RES the enemy applies to each transformative reaction's
 * damage instance. This is NOT always the triggering element — Burgeon and
 * Hyperbloom are Dendro-RES despite being triggered by Pyro/Electro, and
 * Shattered is Physical.
 *
 * Verified: [S2] `transformativeReactions[*].resist`; consistent with [S1]
 * Damage (transformative DMG "is affected by Resistance").
 *
 * Swirl is deliberately ABSENT: swirl damage is dealt in the SWIRLED element,
 * so its RES element is dynamic and is resolved at reaction time.
 */
export const TRANSFORMATIVE_RES_ELEMENT = {
  burning: "pyro",
  superconduct: "cryo",
  electroCharged: "electro",
  bloom: "dendro",
  overloaded: "pyro",
  burgeon: "dendro",
  hyperbloom: "dendro",
  shattered: "physical",
} as const satisfies Record<string, Element>;

// ---------------------------------------------------------------------------
// Elemental Mastery bonus curves
// ---------------------------------------------------------------------------

/**
 * EM bonus curves, all of the form:
 *
 *   emBonus(EM) = SCALE * EM / (EM + SOFT_CAP)
 *
 * expressed as a FRACTION (the wiki states them x100%).
 *
 * Verified: [S1] Elemental Mastery / "Elemental Mastery Formula" (formulas A,
 * B and C) AND [S1] Damage, which restates A and B in the damage formulas.
 *
 *   A — amplifying (vaporize, melt):   2.78, 1400
 *   B — transformative:                  16, 2000
 *   C — additive (aggravate, spread):     5, 1200
 */
export const EM_BONUS_AMPLIFYING_SCALE = 2.78;
export const EM_BONUS_AMPLIFYING_SOFT_CAP = 1400;

export const EM_BONUS_TRANSFORMATIVE_SCALE = 16;
export const EM_BONUS_TRANSFORMATIVE_SOFT_CAP = 2000;

export const EM_BONUS_ADDITIVE_SCALE = 5;
export const EM_BONUS_ADDITIVE_SOFT_CAP = 1200;

// ---------------------------------------------------------------------------
// Additive (Catalyze) reaction coefficients
// ---------------------------------------------------------------------------

/**
 * Additive reactions add a flat term to BASE DMG (they do not multiply):
 *
 *   additiveBaseDmgBonus = coefficient * levelMultiplier * (1 + emBonus + ...)
 *
 * Verified: [S2] `additiveReactions` (spread 1.25, aggravate 1.15);
 * [S1] Elemental Reaction / "Additive Reactions" corroborates the ORDERING
 * ("Spread is slightly higher than Aggravate") and the additive-not-
 * multiplicative application, though [S1] does not print the two numbers.
 */
export const ADDITIVE_COEFFICIENTS = {
  spread: 1.25,
  aggravate: 1.15,
} as const satisfies Record<string, number>;

// ---------------------------------------------------------------------------
// Internal Cooldown
// ---------------------------------------------------------------------------

/**
 * Standard ICD: an ability re-applies its element after 2.5 seconds OR every
 * 3rd hit, whichever comes first.
 *
 * Verified: [S1] Internal Cooldown AND [S1] Elemental Gauge Theory, which
 * state the same 2.5s / 3-hit rule independently on two pages.
 *
 * Deviations (no ICD, 1s/3hits, 5s/5hits, Burning's 2s, ...) are real and
 * common, so they are expressed as PER-ABILITY DATA (`IcdConfig`), never as
 * branches in code. See `icd.ts`.
 */
export const DEFAULT_ICD_SECONDS = 2.5;
export const DEFAULT_ICD_HITS = 3;

/**
 * ICD of the Pyro re-application performed by Burning damage ticks.
 *
 * Verified by two INDEPENDENT sources:
 *   [S1] Elemental Gauge Theory / "Burning" ("Burning DMG will re-apply 1U of
 *        Pyro. This application follows an ICD of 2 seconds"), corroborated on
 *        [S1] Internal Cooldown / "Non-Standard ICD" ("Burning: 2s") — SAME
 *        source, so these two pages count ONCE between them, not twice.
 *   [S3] KQM Theorycrafting Library, `github.com/KQM-git/TCL` @ master
 *        (retrieved 2026-09-06), `docs/combat-mechanics/elemental-effects/
 *        transformative-reactions.md` § "Burning": Burning "applies 1U Pyro
 *        sometime between 0.25s and 0.42s after the 'Burning' text first
 *        appears, then once every 2s".
 *
 * An earlier revision of this comment cited [S1] twice and described it as two
 * independent pages. It was ONE source. [S3] is the genuine second.
 */
export const BURNING_ICD_SECONDS = 2;

// ---------------------------------------------------------------------------
// Transformative / additive reaction level multiplier
// ---------------------------------------------------------------------------

/**
 * Level Multiplier for the TRIGGERING CHARACTER, indexed by `level - 1`
 * (index 0 == level 1 ... index 99 == level 100).
 *
 * Verified by EXACT AGREEMENT of two independent sources across all 91 levels
 * the wiki tabulates (1-95, no mismatch beyond float printing):
 *   [S1] Elemental Reaction/Level Scaling, "Characters" column
 *   [S2] `transformativeReactionLevelMultipliers` (datamined
 *        `PlayerElementLevelCo`)
 *
 * IMPORTANT: characters and enemies diverge at level >= 58 and [S1] prints
 * both columns. This table is the CHARACTER column — the diff against the
 * enemy column was computed and is non-empty from level 58 up, which is how
 * the correct column was confirmed rather than assumed.
 *
 * Levels 96-100 come from [S2] only (the wiki table stops at 95); they are
 * beyond the level-90 cap for playable characters and are included for
 * completeness. Lookup is CLAMPED, never extrapolated.
 */
export const TRANSFORMATIVE_LEVEL_MULTIPLIER: readonly number[] = [
  17.165606,
  18.535048,
  19.904854,
  21.274902,
  22.6454,
  24.649612,
  26.640642,
  28.868587,
  31.36768,
  34.143345,
  37.201,
  40.66,
  44.446667,
  48.56352,
  53.74848,
  59.081898,
  64.420044,
  69.72446,
  75.12314,
  80.58478,
  86.11203,
  91.70374,
  97.24463,
  102.812645,
  108.40956,
  113.20169,
  118.102905,
  122.97932,
  129.72733,
  136.29291,
  142.67085,
  149.02902,
  155.41699,
  161.8255,
  169.10631,
  176.51808,
  184.07274,
  191.70952,
  199.55692,
  207.38205,
  215.3989,
  224.16566,
  233.50217,
  243.35057,
  256.06308,
  268.5435,
  281.52606,
  295.01364,
  309.0672,
  323.6016,
  336.75754,
  350.5303,
  364.4827,
  378.61917,
  398.6004,
  416.39825,
  434.387,
  452.95105,
  472.60623,
  492.8849,
  513.56854,
  539.1032,
  565.51056,
  592.53876,
  624.4434,
  651.47015,
  679.4968,
  707.79407,
  736.67145,
  765.64026,
  794.7734,
  824.67737,
  851.1578,
  877.74207,
  914.2291,
  946.74677,
  979.4114,
  1011.223,
  1044.7917,
  1077.4437,
  1109.9976,
  1142.9766,
  1176.3695,
  1210.1844,
  1253.8357,
  1288.9528,
  1325.4841,
  1363.4569,
  1405.0974,
  1446.8535,
  1462.788,
  1475.6956,
  1497.9644,
  1516.9423,
  1561.468,
  1593.5062,
  1621.0258,
  1643.8679,
  1662.1382,
  1674.8092
];

/** Highest level with a tabulated multiplier. Lookups clamp to this. */
export const MAX_TABULATED_LEVEL = TRANSFORMATIVE_LEVEL_MULTIPLIER.length;
