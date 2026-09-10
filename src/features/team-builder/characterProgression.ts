import type { Stats } from "@/types";
import { perkEffectsForCharacter } from "@/game-data/characters/generated";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import {
  MAX_TALENT_LEVEL,
  MIN_TALENT_LEVEL,
} from "@/simulation/character/talent";

// ---------------------------------------------------------------------------
// Character progression model — level, ascension phase and talent levels.
//
// WHY THIS EXISTS (measured, not assumed):
//
// `GenericCharacterDefinition.baseStats` is a SNAPSHOT at level 90. It is
// exactly the level-90 point of `baseStatCurves` — verified for the live roster
// in this module's tests. So a level selector that only writes `level` would
// leave every character attacking with level-90 base ATK: Bennett at level 1
// would use 191 base ATK instead of his real 16. The number would move a
// little, because the attacker's level feeds the DEF multiplier, which is
// exactly what makes the bug convincing — the UI looks responsive while the
// stats behind it never change.
//
// This module resolves `baseStats` FROM the curve at the chosen level. That is
// a table lookup, not damage math: `baseStatCurves` is plain data indexed by
// level, and the engine consumes the resolved `baseStats` through its existing
// input. No formula is reimplemented here.
//
// WHAT THIS MODULE DELIBERATELY DOES NOT DO:
//
// It does not apply the ascension STAT bonus. `ascensionBonus` is emitted for
// every character (Bennett: +26.7% Energy Recharge at phase 6) and the engine
// reads it nowhere — raising `ascensionPhase` changes no damage today. Applying
// it here would be the UI computing a stat the engine does not model, which is
// the "no business logic in UI" line, and it would make the website disagree
// with the engine it is supposed to be a window onto. The phase is carried so
// it correctly gates ascension PASSIVES (which the engine does read), and the
// unapplied stat is disclosed by `ascensionStatIsSimulated()` rather than
// silently added or silently dropped.
//
// Pure: no React, no DOM, no engine calls.
// ---------------------------------------------------------------------------

/** Lowest character level in game. */
export const MIN_CHARACTER_LEVEL = 1;

/** Ascension phases, 0..6. */
export const MIN_ASCENSION_PHASE = 0;
export const MAX_ASCENSION_PHASE = 6;

export { MAX_TALENT_LEVEL, MIN_TALENT_LEVEL };

/** Talent levels a user may select, ascending. */
export const TALENT_LEVEL_OPTIONS: readonly number[] = Array.from(
  { length: MAX_TALENT_LEVEL - MIN_TALENT_LEVEL + 1 },
  (_, i) => MIN_TALENT_LEVEL + i,
);

/**
 * The character levels this character publishes a base-stat curve for.
 *
 * Read from the DATA. Every emitted level is one all three curves (HP/ATK/DEF)
 * resolve at, so a selector built on this can never land on a level where one
 * stat is present and another is missing.
 */
export function characterLevels(
  character: GenericCharacterDefinition,
): readonly number[] {
  const { hp, atk, def } = character.baseStatCurves;
  return Object.keys(atk.byLevel)
    .map(Number)
    .filter(
      (level) =>
        hp.byLevel[level] !== undefined && def.byLevel[level] !== undefined,
    )
    .sort((a, b) => a - b);
}

export function maxCharacterLevel(
  character: GenericCharacterDefinition,
): number {
  const levels = characterLevels(character);
  return levels[levels.length - 1] ?? MIN_CHARACTER_LEVEL;
}

/** Snaps a requested level onto the highest published level at or below it. */
export function clampCharacterLevel(
  character: GenericCharacterDefinition,
  level: number,
): number {
  const levels = characterLevels(character);
  if (levels.length === 0) return MIN_CHARACTER_LEVEL;
  let best = levels[0]!;
  for (const candidate of levels) {
    if (candidate <= level) best = candidate;
  }
  return best;
}

/** Clamps a talent level into the range the talent tables actually publish. */
export function clampTalentLevel(level: number): number {
  return Math.min(
    Math.max(Math.trunc(level), MIN_TALENT_LEVEL),
    MAX_TALENT_LEVEL,
  );
}

/**
 * The ascension phases reachable at a given character level.
 *
 * In game a level sits inside a phase band, and the two phases that share a
 * band boundary (e.g. level 40 is reachable at phase 1 pre-ascension and at
 * phase 2 post-ascension) are both legitimate. The bands are the game's own
 * level caps.
 */
const ASCENSION_LEVEL_CAPS: readonly number[] = [20, 40, 50, 60, 70, 80, 90];

export function ascensionPhasesForLevel(level: number): readonly number[] {
  const phases: number[] = [];
  for (let phase = MIN_ASCENSION_PHASE; phase <= MAX_ASCENSION_PHASE; phase += 1) {
    const cap = ASCENSION_LEVEL_CAPS[phase] ?? MIN_CHARACTER_LEVEL;
    const floor = phase === MIN_ASCENSION_PHASE ? MIN_CHARACTER_LEVEL : ASCENSION_LEVEL_CAPS[phase - 1]!;
    if (level >= floor && level <= cap) phases.push(phase);
  }
  return phases;
}

/** Snaps a phase onto one this level can actually be at. */
export function clampAscensionPhase(level: number, phase: number): number {
  const phases = ascensionPhasesForLevel(level);
  if (phases.length === 0) return MIN_ASCENSION_PHASE;
  if (phases.includes(phase)) return phase;
  // Below the band -> its lowest phase; above it -> its highest.
  return phase < phases[0]! ? phases[0]! : phases[phases.length - 1]!;
}

/**
 * Base HP/ATK/DEF at a character level, read from the curve.
 *
 * Returns `null` when the level has no published point, so the caller shows an
 * absence rather than a stand-in. Ascension jumps are already BAKED INTO the
 * curve (Diluc's base ATK steps at 20/40/50/60/70/80), so adding an ascension
 * term on top of this would double-count the very thing the curve encodes.
 */
export interface BaseStatsAtLevel {
  readonly hp: number;
  readonly atk: number;
  readonly def: number;
}

export function baseStatsAtLevel(
  character: GenericCharacterDefinition,
  level: number,
): BaseStatsAtLevel | null {
  const { hp, atk, def } = character.baseStatCurves;
  const h = hp.byLevel[level];
  const a = atk.byLevel[level];
  const d = def.byLevel[level];
  if (h === undefined || a === undefined || d === undefined) return null;
  return { hp: h, atk: a, def: d };
}

/**
 * A character's full `Stats` at a chosen level.
 *
 * The three curve-driven stats are REPLACED from the curve; every other stat
 * (crit rate/DMG base, ER base, and anything equipment already folded in) is
 * carried through untouched. Returns the input unchanged when the level has no
 * curve point — refusing to guess rather than emitting a partly-updated stat
 * block that looks authoritative.
 */
export function statsAtLevel(
  character: GenericCharacterDefinition,
  stats: Stats,
  level: number,
): Stats {
  const base = baseStatsAtLevel(character, level);
  if (base === null) return stats;
  return { ...stats, hp: base.hp, atk: base.atk, def: base.def };
}

/**
 * Whether the engine applies the ascension STAT bonus.
 *
 * Currently it does not: `ascensionBonus` is emitted by the generator and read
 * by nothing in the damage pipeline, which was verified by simulating one
 * character across all seven phases and observing identical damage. The UI must
 * therefore not present the ascension stat as active. This constant is the one
 * place that fact is stated, so wiring the channel later flips one value rather
 * than hunting for optimistic copy.
 */
export const ascensionStatIsSimulated = false;

/**
 * The talent-level boost a constellation grants, for DISPLAY only.
 *
 * The engine applies this itself, through `SimulationConfig.talentLevelResolver`
 * composed by the perk-buff harvest. The UI must therefore show the boost
 * WITHOUT adding it to the level it saves: writing `configured + boost` into
 * `talentLevels` would apply it a second time inside the engine, and the
 * resulting number would be a level the user never chose.
 *
 * Verified: Bennett C3 (+3 skill) at configured skill level 7 produces exactly
 * the damage of C0 at level 10, and C3 at 12 equals C0 at 15 — applied once,
 * and clamped at the table maximum.
 */
export interface TalentDisplayLevel {
  /** What the user chose and what is saved to the build. */
  readonly configured: number;
  /** Levels the constellation adds, applied by the ENGINE. */
  readonly boost: number;
  /** Effective level, clamped to the table maximum. Display only. */
  readonly effective: number;
}

export function talentDisplayLevel(
  configured: number,
  boost: number,
): TalentDisplayLevel {
  const base = clampTalentLevel(configured);
  return {
    configured: base,
    boost,
    effective: clampTalentLevel(base + boost),
  };
}

// ---------------------------------------------------------------------------
// Constellation talent-level boosts, resolved for DISPLAY.
//
// THE GAP THIS CLOSES: `talentDisplayLevel` above was correct, tested, and
// imported by NOTHING. So a Bennett at C3 with a configured skill level of 7
// was simulated at level 10 while every label on screen said 7. The damage
// moved when the user raised constellation and the interface offered no reason
// why — the number and the sheet disagreed with nothing to reconcile them.
//
// This resolver mirrors the engine's gate EXACTLY (`activeConstellations` in
// `simulation/character/character.ts` keeps constellations whose `level <=
// constellationLevel`). It is display-only and deliberately additive: nothing
// here is written back into `talentLevels`, because the engine already applies
// the boost through `talentLevelResolver`. Adding it to the saved level is the
// double-apply defect these functions exist to prevent.
// ---------------------------------------------------------------------------

/** The three talent slots a constellation can boost. */
export type TalentSlotName = "normal" | "skill" | "burst";

/** Levels added per slot by a character's unlocked constellations. */
export type TalentBoostBySlot = Readonly<Record<TalentSlotName, number>>;

const NO_TALENT_BOOST: TalentBoostBySlot = { normal: 0, skill: 0, burst: 0 };

function isTalentSlotName(value: string): value is TalentSlotName {
  return value === "normal" || value === "skill" || value === "burst";
}

/**
 * Talent-level boosts granted by the constellations unlocked at this level.
 *
 * Only rows the engine actually honours are counted: `support === "modelled"`
 * with a `talentLevelBoost` present. That is the same channel-specific test
 * `perkPresentation.isSimulated` applies, so a row shown as "simulated" and a
 * row counted here can never diverge. Boosts sum, because nothing forbids two
 * constellations touching one slot.
 */
export function talentBoostsForConstellation(
  characterId: string,
  constellationLevel: number,
): TalentBoostBySlot {
  const boosts = { ...NO_TALENT_BOOST };
  let touched = false;
  for (const perk of perkEffectsForCharacter(characterId)) {
    if (perk.kind !== "constellation") continue;
    if (perk.support !== "modelled") continue;
    const boost = perk.talentLevelBoost;
    if (boost === undefined) continue;
    // Mirrors `activeConstellations`: unlocked means level <= chosen level.
    if (perk.constellationLevel === undefined) continue;
    if (perk.constellationLevel > constellationLevel) continue;
    if (!isTalentSlotName(boost.slot)) continue;
    boosts[boost.slot] += boost.levels;
    touched = true;
  }
  return touched ? boosts : NO_TALENT_BOOST;
}

/**
 * One slot's level for a compact summary line: `"7"`, or `"7 (+3 → 10)"`.
 *
 * A formatter, not a calculation — it exists so the summary in the character
 * header cannot drift from `talentDisplayLevel`, and so no component assembles
 * this string inline. Returns the bare configured level when nothing is added,
 * which is the common case and must not carry decoration.
 */
export function formatTalentLevelSummary(
  configured: number,
  boost: number,
): string {
  const shown = talentDisplayLevel(configured, boost);
  if (shown.boost <= 0 || shown.effective === shown.configured) {
    return String(shown.configured);
  }
  return `${shown.configured} (+${shown.boost} → ${shown.effective})`;
}
