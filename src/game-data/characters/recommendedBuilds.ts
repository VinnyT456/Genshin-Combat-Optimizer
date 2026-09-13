import type {
  ArtifactLoadout,
  ArtifactPiece,
  ArtifactSlot,
  EquipmentStat,
} from "@/simulation/character/equipment";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import type {
  BaseBuild,
  BaseBuildMainStats,
} from "./buildAuthoring";
import { compileAuthoredBuild } from "./buildAuthoring";
import { baselineArtifactSubstats } from "./artifactSubstatScoring";
import { AUTHORED_BASE_BUILDS } from "./recommendedBuildsData";

// ---------------------------------------------------------------------------
// Per-character recommended "base builds" — auto-applied on team selection.
//
// The build DATA is hand-authored in `recommendedBuildsData.ts` using the
// readable token format in `buildAuthoring.ts` (e.g. `sands: "ER%"`). This
// module compiles that authored data into the `BaseBuild` shape the app
// consumes and provides the lookup / match / loadout helpers. It computes no
// game math beyond expanding authored tokens into canonical main-stat values.
//
// A character absent or `null` in the authored data has NO recommended build
// and keeps the generic weapon-type default on select. Fixed context for every
// filled build: level 90, talents 9/9/9 (the app defaults).
//
// LAYERING. This is GAME DATA. Importing the equipment stat MODEL from
// `@/simulation/character/equipment` is a downward (data → sim types)
// dependency and is intentional.
// ---------------------------------------------------------------------------

// Flower and Plume always roll flat HP / flat ATK in game; fixed, not authored.
const FLOWER_HP_FLAT = 4780;
const PLUME_ATK_FLAT = 311;

export type { BaseBuild } from "./buildAuthoring";

/**
 * Recommended base builds, keyed by CHARACTER ID (never slot index — slot-index
 * keying detaches a build from its owner when the party is reordered).
 *
 * Compiled from `AUTHORED_BASE_BUILDS`. A `null` authored row compiles to
 * `undefined` and is dropped, so this record contains only characters that
 * actually have a build. Weapon / set ids come straight from the authored data;
 * the companion test asserts every filled id resolves against the generated
 * weapon / artifact registries, so a typo cannot ship silently.
 */
export const RECOMMENDED_BASE_BUILDS: Readonly<Record<string, BaseBuild>> =
  Object.fromEntries(
    Object.entries(AUTHORED_BASE_BUILDS).flatMap(([id, authored]) => {
      const compiled = compileAuthoredBuild(authored);
      return compiled ? [[id, compiled] as const] : [];
    }),
  );

/** Legacy ids accepted by the engine and older saved teams. */
const RECOMMENDED_BUILD_ID_ALIASES: Readonly<Record<string, string>> = {
  raiden: "raiden-shogun",
};

/** The recommended build for a character, or `undefined` if none is defined. */
export function recommendedBuildFor(
  characterId: string,
): BaseBuild | undefined {
  return (
    RECOMMENDED_BASE_BUILDS[characterId] ??
    RECOMMENDED_BASE_BUILDS[RECOMMENDED_BUILD_ID_ALIASES[characterId] ?? ""]
  );
}

/** The equipped loadout the match check reads: weapon id, set id, and the three
 *  variable main-stat channels the spec pins (sands/goblet/circlet). */
export interface EquippedBuildState {
  readonly weaponId: string | undefined;
  readonly artifactSetId: string | undefined;
  /** Equipped main stat per variable slot, or `undefined` when the slot is empty. */
  readonly sands: EquipmentStat | undefined;
  readonly goblet: EquipmentStat | undefined;
  readonly circlet: EquipmentStat | undefined;
}

/** True when two main stats occupy the same channel (and element, for DMG bonus). */
function mainStatChannelMatches(
  equipped: EquipmentStat | undefined,
  expected: EquipmentStat | undefined,
): boolean {
  // An unpinned spec slot (`undefined` — either unauthored or a non-damage stat
  // like Bennett's Heal% circlet) constrains nothing, so any equipped stat — or
  // none — still matches.
  if (expected === undefined) return true;
  if (equipped === undefined) return false;
  if (equipped.stat !== expected.stat) return false;
  // Element is only load-bearing for per-element DMG bonus.
  if (expected.stat === "elementalDmgBonus") {
    return equipped.element === expected.element;
  }
  return true;
}

/**
 * Whether the equipped gear still matches a character's KQM base build.
 *
 * Pure (no React): compares the equipped weapon id, artifact set id AND the
 * sands/goblet/circlet main-stat CHANNELS against the build's `mainStats`.
 * Returns false the moment a load-bearing main stat is changed (e.g. the goblet
 * is swapped off its spec channel), so the "matches baseline" chip and the
 * circlet note only show while the loadout genuinely conforms.
 */
export function equippedMatchesBaseBuild(
  build: BaseBuild,
  equipped: EquippedBuildState,
): boolean {
  return (
    equipped.weaponId === build.weaponId &&
    equipped.artifactSetId === build.artifactSetId &&
    mainStatChannelMatches(equipped.sands, build.mainStats.sands) &&
    mainStatChannelMatches(equipped.goblet, build.mainStats.goblet) &&
    mainStatChannelMatches(equipped.circlet, build.mainStats.circlet)
  );
}

/** Zero-value placeholder main stat, used where a slot has no simulated stat. */
function placeholderMainStat(): EquipmentStat {
  return { stat: "atkFlat", value: 0 };
}

/** Main stat for a slot, falling back to a zero placeholder for unpinned slots. */
function mainStatForSlot(
  slot: ArtifactSlot,
  mainStats: BaseBuildMainStats,
): EquipmentStat {
  switch (slot) {
    case "flower":
      return { stat: "hpFlat", value: FLOWER_HP_FLAT };
    case "plume":
      return { stat: "atkFlat", value: PLUME_ATK_FLAT };
    case "sands":
      return mainStats.sands ?? placeholderMainStat();
    case "goblet":
      return mainStats.goblet ?? placeholderMainStat();
    case "circlet":
      return mainStats.circlet ?? placeholderMainStat();
  }
}

/**
 * Builds the artifact loadout for a recommended build.
 *
 * ALL FIVE SLOTS are filled with the recommended set so the spec's sands,
 * goblet AND circlet main stats all take effect — occupying five slots of a
 * "4pc" set still counts as (and only as) the 4pc tier, so this is faithful to
 * the build. Each piece receives four substat lines and five deterministic
 * upgrades ([2, 1, 1, 1]), derived from the authored priority order. These are
 * comparison values, not random roll outcomes, and remain editable in the
 * artifact editor.
 */
export function baseBuildArtifactLoadout(build: BaseBuild): ArtifactLoadout {
  const loadout: ArtifactLoadout = {};
  for (const slot of ARTIFACT_SLOTS) {
    const mainStat = mainStatForSlot(slot, build.mainStats);
    const piece: ArtifactPiece = {
      slot,
      setId: build.artifactSetId,
      mainStat,
      substats: baselineArtifactSubstats(build.substatPriorities, mainStat),
    };
    loadout[slot] = piece;
  }
  return loadout;
}
