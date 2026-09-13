import type { Element } from "@/types";
import type { EquipmentStat } from "@/simulation/character/equipment";

// ---------------------------------------------------------------------------
// AUTHORING FORMAT for per-character KQM base builds.
//
// This module exists so a human can hand-write a build for every character in
// plain, readable tokens — `"ER%"`, `"pyro%"`, `"crit_rate"` — instead of the
// engine's `{ stat: "energyRecharge", value: 0.518 }` objects. You fill in
// `AuthoredBuild` rows in `recommendedBuildsData.ts`; `compileAuthoredBuild`
// turns each row into the `BaseBuild` the app already consumes, filling in the
// canonical level-90 5-star main-stat magnitudes for you.
//
// WHAT YOU NEED PER CHARACTER (all optional except weapon+set to count as filled):
//   weapon   — a weapon id  (see scratchpad/weapon-ids.tsv, column `id`)
//   set      — a 4pc artifact set id (see scratchpad/artifact-ids.tsv, column `id`)
//   sands    — a MainStat token (below)
//   goblet   — a MainStat token
//   circlet  — a MainStat token
//   substatPriorities — ordered SubstatToken guidance, highest first
//   note     — optional free text, e.g. an ER threshold reminder
//
// Level is always 90 and talents 9/9/9 (the app defaults) — you do not author
// those. Substat priorities are used to create a deterministic comparison
// baseline for the recommended loadout; the values are not random roll
// outcomes and remain editable by the user. A row left as `null` = "no recommended build" and
// the character keeps the generic weapon-type default on select. The current
// authored catalog fills every generated roster row; null remains supported for
// future characters or intentionally source-blocked data.
//
// NON-DAMAGE MAIN STATS. Some real KQM main stats (Healing Bonus%, Physical
// DMG% on a non-physical carry used purely as a stat stick, etc.) do not affect
// any DAMAGE number in this engine. Authoring one of those tokens does NOT map
// it to a wrong stat — it is left out of the simulated loadout and its intent is
// surfaced to the user as an honesty note. See NON_DAMAGE_MAIN_STATS below.
// ---------------------------------------------------------------------------

// Canonical level-90 5-star MAIN-STAT magnitudes, as fractions (0.466 == +46.6%)
// / flat points. These match the artifact editor's `PRESET_MAIN_STATS` so an
// auto-applied build reads identically to a hand-entered one. Fixed by the game,
// so they are constants, not authored per character.
const MAIN = {
  hpPercent: 0.466,
  atkPercent: 0.466,
  defPercent: 0.583,
  elementalMastery: 187,
  energyRecharge: 0.518,
  critRate: 0.311,
  critDmg: 0.622,
  elementalDmgBonus: 0.466,
  physicalDmgBonus: 0.583,
  healingBonus: 0.359,
} as const;

/**
 * Every main-stat token you can write for a sands / goblet / circlet slot.
 *
 * The element tokens (`pyro%` … `physical%`) are goblet DMG-bonus main stats.
 * `crit_rate` / `crit_dmg` are circlet stats. `heal%` is a circlet stat this
 * DAMAGE engine cannot represent (see NON_DAMAGE_MAIN_STATS).
 */
export type MainStatToken =
  | "HP%"
  | "ATK%"
  | "DEF%"
  | "EM"
  | "ER%"
  | "crit_rate"
  | "crit_dmg"
  | "pyro%"
  | "hydro%"
  | "electro%"
  | "cryo%"
  | "anemo%"
  | "geo%"
  | "dendro%"
  | "physical%"
  | "heal%";

/** Element DMG-bonus tokens → the `Element` they grant. */
const ELEMENT_TOKEN: Partial<Record<MainStatToken, Element>> = {
  "pyro%": "pyro",
  "hydro%": "hydro",
  "electro%": "electro",
  "cryo%": "cryo",
  "anemo%": "anemo",
  "geo%": "geo",
  "dendro%": "dendro",
  "physical%": "physical",
};

/**
 * Tokens the DAMAGE engine cannot model. Authoring one of these is legal and
 * honest: the slot is left OUT of the simulated loadout (never mapped to a wrong
 * stat) and a note is surfaced to the user. Maps token → the honesty note shown.
 */
const NON_DAMAGE_MAIN_STATS: Partial<Record<MainStatToken, string>> = {
  "heal%": "主属性为治疗加成%，对伤害无影响，故未计入模拟。",
};

/** A build as a human writes it. `null` for a character with no recommendation. */
export interface AuthoredBuild {
  /** Weapon id — column `id` in scratchpad/weapon-ids.tsv. */
  readonly weapon: string;
  /** 4pc artifact set id — column `id` in scratchpad/artifact-ids.tsv. */
  readonly set: string;
  /** Time Sands main stat. */
  readonly sands?: MainStatToken;
  /** Goblet main stat (usually an element `xxx%` for a DPS, ATK%/HP% for support). */
  readonly goblet?: MainStatToken;
  /** Circlet main stat (`crit_rate` / `crit_dmg`, or `heal%` for a healer). */
  readonly circlet?: MainStatToken;
  /** Ordered KQM-style substat priority, highest value first. */
  readonly substatPriorities?: readonly SubstatToken[];
  /** Optional free-text reminder, e.g. `"ER ~200%+ team-dependent"`. Not shown as a stat. */
  readonly note?: string;
}

/** Artifact substat tokens, ordered from highest to lower priority. */
export type SubstatToken =
  | "HP"
  | "ATK"
  | "DEF"
  | "HP%"
  | "ATK%"
  | "DEF%"
  | "EM"
  | "ER%"
  | "crit_rate"
  | "crit_dmg";

// ---------------------------------------------------------------------------
// Compiled shape — what the app consumes. Main-stat magnitudes remain
// deterministic; substat priorities are metadata for build guidance.
// ---------------------------------------------------------------------------

export interface BaseBuildMainStats {
  readonly sands?: EquipmentStat;
  readonly goblet?: EquipmentStat;
  /** `undefined` when the authored circlet token is a non-damage stat. */
  readonly circlet?: EquipmentStat;
}

export interface BaseBuild {
  readonly weaponId: string;
  readonly artifactSetId: string;
  readonly mainStats: BaseBuildMainStats;
  /** Ordered KQM guidance used by the deterministic artifact baseline generator. */
  readonly substatPriorities?: readonly SubstatToken[];
  /** Honesty note for a circlet whose real main stat the engine cannot model. */
  readonly circletNote?: string;
  /** The author's free-text `note`, carried through for display if wanted. */
  readonly note?: string;
}

/** Turn one authored main-stat token into an `EquipmentStat`, or `undefined`
 *  when the token is a non-damage stat the engine cannot represent. */
function compileMainStat(token: MainStatToken | undefined): {
  stat: EquipmentStat | undefined;
  note: string | undefined;
} {
  if (token === undefined) return { stat: undefined, note: undefined };

  const nonDamageNote = NON_DAMAGE_MAIN_STATS[token];
  if (nonDamageNote !== undefined) {
    return { stat: undefined, note: nonDamageNote };
  }

  const element = ELEMENT_TOKEN[token];
  if (element !== undefined) {
    return {
      stat: {
        stat: "elementalDmgBonus",
        value: MAIN.elementalDmgBonus,
        element,
      },
      note: undefined,
    };
  }

  switch (token) {
    case "HP%":
      return { stat: { stat: "hpPercent", value: MAIN.hpPercent }, note: undefined };
    case "ATK%":
      return { stat: { stat: "atkPercent", value: MAIN.atkPercent }, note: undefined };
    case "DEF%":
      return { stat: { stat: "defPercent", value: MAIN.defPercent }, note: undefined };
    case "EM":
      return {
        stat: { stat: "elementalMastery", value: MAIN.elementalMastery },
        note: undefined,
      };
    case "ER%":
      return {
        stat: { stat: "energyRecharge", value: MAIN.energyRecharge },
        note: undefined,
      };
    case "crit_rate":
      return { stat: { stat: "critRate", value: MAIN.critRate }, note: undefined };
    case "crit_dmg":
      return { stat: { stat: "critDmg", value: MAIN.critDmg }, note: undefined };
    default:
      // Exhaustiveness: every token is handled above (element + non-damage
      // tokens returned earlier). If this throws, a token was added without a
      // compile case.
      throw new Error(`Unhandled main-stat token: ${token as string}`);
  }
}

/** Compile one authored build (or `null`) into a `BaseBuild` (or `undefined`). */
export function compileAuthoredBuild(
  authored: AuthoredBuild | null,
): BaseBuild | undefined {
  if (authored === null) return undefined;

  const sands = compileMainStat(authored.sands);
  const goblet = compileMainStat(authored.goblet);
  const circlet = compileMainStat(authored.circlet);

  return {
    weaponId: authored.weapon,
    artifactSetId: authored.set,
    mainStats: {
      sands: sands.stat,
      goblet: goblet.stat,
      circlet: circlet.stat,
    },
    substatPriorities: authored.substatPriorities,
    // Only the circlet currently surfaces a non-damage note in the UI.
    circletNote: circlet.note,
    note: authored.note,
  };
}
