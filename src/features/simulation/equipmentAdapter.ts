import type { SimulationConfig, Stats } from "@/types";
import {
  applyArtifactStatsToResolvedStats,
  resolveEquippedStats,
  activeSetBonusKeys,
  type ArtifactLoadout,
  type WeaponStats,
} from "@/simulation/character/equipment";
import type {
  ArtifactPiece,
  ArtifactSlot,
} from "@/simulation/character/equipment";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import type {
  ArtifactSetBonusBuffs,
  CharacterEquipmentBuffs,
  WeaponPassiveBuffs,
  WeaponRefinement,
} from "@/simulation/engine/equipmentBuffs";
import { weaponPassiveBuffsById } from "@/game-data/weapons/weaponBuffs";
import {
  findWeaponBaseAtkAtLevel,
  findWeaponStatsAtLevel,
} from "@/game-data/weapons/registry";
import { setBonusBuffsById } from "@/game-data/artifacts/setBonusBuffs";
import { completeSetBonusBuffsById } from "@/game-data/artifacts/completeSetBonusBuffs";
import {
  type ArtifactPieceCount,
  type CharacterEquipmentSelection,
  DEFAULT_WEAPON_LEVEL,
  type EquipmentSelections,
  selectionFor,
} from "@/features/team-builder/equipmentSelection";

// ---------------------------------------------------------------------------
// The wire between the user's equipment choices and the simulation config.
//
// THE GAP THIS CLOSES. Every half of this chain already existed and was tested:
// `weaponPassiveBuffs()` emits per-refinement `Buff` data for 6 weapons,
// `setBonusBuffs()` emits 46 modelled set bonuses,
// `harvestWeaponPassiveBuffs()` / `harvestArtifactSetBuffs()` select and gate
// them, and `simulateRotation()` composes the result into the damage pipeline.
// Nothing connected the user's PICKS to the config field those harvests read,
// so equipping Rust R5 and a Crimson Witch set ran the simulation as though the
// character were bare — with every existing test green, because they all built
// `SimulationConfig` by hand.
//
// This module is the only place that crossing happens, and it is an adapter in
// the strict sense: it TRANSLATES a selection into the engine's already-defined
// input shapes and decides no game rules. In particular it does NOT decide
//
//   - which refinement's numbers apply   (`harvestWeaponPassiveBuffs` indexes)
//   - whether a 4pc tier is live         (`activeSetBonusKeys` gates on count)
//   - what any buff is worth             (the mechanics buff resolver)
//
// Re-deriving any of those here is exactly how a 4pc-at-3pc or an R5-as-R1
// overclaim is introduced, and it would be a SECOND implementation of a rule
// the engine already owns.
//
// DETERMINISM. The output is built by walking the team in party order and the
// artifact slots in `ARTIFACT_SLOTS` order. Nothing iterates an unordered bag,
// so two equal builds produce byte-identical config — which the optimizer's
// memoisation and the run fingerprint both rely on.
// ---------------------------------------------------------------------------

/**
 * A synthetic loadout standing in for legacy "N pieces of one set" selections.
 *
 * WHY SYNTHETIC. `harvestArtifactSetBuffs()` gates tiers on `activeSetBonusKeys()`,
 * which counts real `ArtifactPiece`s per slot. Older persisted selections only
 * named one SET and a piece count, so this function produces that fallback;
 * the current picker stores five explicit pieces and does not use it.
 *
 * The pieces carry NO STATS. That is deliberate and is the honest choice: the
 * generated artifact data publishes set bonuses and nothing else — no main
 * stats, no substats, no roll values. Authoring plausible main stats here would
 * put invented numbers into a damage figure the user reads as a result, which
 * is the failure mode this project ranks as worse than a missing feature. The
 * pieces exist ONLY to be counted; `sumEquipmentStats` sums their empty grants
 * to zero, so nothing is claimed that the data does not state.
 *
 * Slots are taken from the front of `ARTIFACT_SLOTS`, so the same count always
 * yields the same loadout.
 */
export function syntheticLoadout(
  setId: string,
  pieces: ArtifactPieceCount,
): ArtifactLoadout {
  const loadout: Partial<Record<ArtifactSlot, ArtifactPiece>> = {};
  for (const slot of ARTIFACT_SLOTS.slice(0, pieces)) {
    loadout[slot] = {
      slot,
      setId,
      // Zero-valued, element-free grants: a piece that is counted and grants
      // nothing. See the note above on why no main stat is invented.
      mainStat: { stat: "atkFlat", value: 0 },
      substats: [],
    };
  }
  return loadout;
}

/**
 * One character's selection as the engine's equipment-buff description.
 *
 * Returns `undefined` when the selection contributes NOTHING the engine could
 * read — no weapon with a modelled passive and no set with modelled bonuses.
 * An empty entry and an absent one are indistinguishable to the harvest, and
 * emitting one would put a key in `equipmentBuffs` (and therefore in the run
 * fingerprint) that describes no effect.
 *
 * A weapon whose passive is not modelled, or a set whose bonuses are not,
 * simply yields nothing for that half. It is never approximated, and the
 * picker's own support labels read the SAME generated rows, so the label and
 * the simulation cannot disagree.
 */
export function characterEquipmentBuffs(
  selection: CharacterEquipmentSelection,
): CharacterEquipmentBuffs | undefined {
  const passive: WeaponPassiveBuffs | undefined =
    selection.weaponId === undefined
      ? undefined
      : weaponPassiveBuffsById(selection.weaponId);

  // A modern loadout can mix sets per slot. Keep set ids sorted so equal
  // builds produce the same buff order and fingerprint on every run.
  const loadout = selection.artifactLoadout ?? (
    selection.artifactSetId && selection.artifactPieces !== undefined
      ? syntheticLoadout(selection.artifactSetId, selection.artifactPieces)
      : undefined
  );
  const setIds = new Set<string>();
  for (const piece of Object.values(loadout ?? {})) {
    if (piece?.setId) setIds.add(piece.setId);
  }
  if (setIds.size === 0 && selection.artifactSetId) {
    setIds.add(selection.artifactSetId);
  }
  const orderedSetIds = [...setIds].sort();
  const setBonuses = orderedSetIds
    .map((setId) => setBonusBuffsById(setId))
    .filter((value): value is ArtifactSetBonusBuffs => value !== undefined);
  const runtimeSetBonuses = orderedSetIds
    .map((setId) => completeSetBonusBuffsById(setId))
    .filter((value): value is ArtifactSetBonusBuffs => value !== undefined);

  if (!passive && setBonuses.length === 0 && runtimeSetBonuses.length === 0) {
    return undefined;
  }

  const entry: {
    refinement?: WeaponRefinement;
    weaponPassive?: WeaponPassiveBuffs;
    artifacts?: ArtifactLoadout;
    setBonuses?: readonly ArtifactSetBonusBuffs[];
    runtimeSetBonuses?: readonly ArtifactSetBonusBuffs[];
  } = {};

  if (passive) {
    entry.weaponPassive = passive;
    // The refinement is passed THROUGH, never defaulted here. When the
    // selection carries none, `harvestWeaponPassiveBuffs` fails closed and the
    // passive contributes nothing — which is the engine's stated rule, and is
    // preferable to this adapter quietly substituting R1 for an unstated level.
    if (selection.refinement !== undefined) entry.refinement = selection.refinement;
  }

  if (setBonuses.length > 0) entry.setBonuses = setBonuses;
  if (runtimeSetBonuses.length > 0) entry.runtimeSetBonuses = runtimeSetBonuses;
  if (loadout !== undefined) entry.artifacts = loadout;

  return entry;
}

/** Team-order character ids paired with the stats the run should use. */
export interface EquippedCharacter {
  readonly id: string;
  /**
   * The character's stat bag AS THE UI ALREADY RESOLVED IT — weapon base ATK
   * and substat folded in through the engine's own `resolveEquippedStats`.
   * Passed through, never recomputed: folding the weapon in a second time here
   * would double-count it.
   */
  readonly stats: Stats;
  /** Intrinsic stats, when the caller can retain them separately. */
  readonly intrinsicStats?: Stats;
}

/**
 * Resolve the authored weapon contribution used by the current picker.
 *
 * Older selections omitted weapon level, so level 90 remains the compatibility
 * default. New selections persist the exact level and missing generated values
 * fail closed rather than falling back to a different level.
 */
export function weaponStatsAtLevel(
  weaponId: string,
  level: number,
): WeaponStats | undefined {
  const authored = findWeaponStatsAtLevel(weaponId, level);
  if (!authored) {
    const baseAtk = findWeaponBaseAtkAtLevel(weaponId, level);
    return baseAtk === undefined ? undefined : { baseAtk };
  }
  return {
    baseAtk: authored.baseAtk,
    ...(authored.subStat.type !== "none"
      ? {
          substat: {
            stat: authored.subStat.type === "physicalDmg"
              ? "dmgBonus"
              : authored.subStat.type,
            value: authored.subStat.value,
          },
        }
      : {}),
  };
}

function weaponStatsAtAuthoredLevel(
  weaponId: string,
  level = DEFAULT_WEAPON_LEVEL,
): WeaponStats | undefined {
  return weaponStatsAtLevel(weaponId, level);
}

/**
 * Add a persisted weapon to intrinsic stats without folding it twice.
 *
 * Interactive selection already stores the result of `resolveEquippedStats`,
 * which carries `base`; URL/session hydration commonly restores the intrinsic
 * bag instead. A custom manual stat bag is preserved as authored by the user.
 */
function statsForSelection(
  stats: Stats,
  intrinsicStats: Stats | undefined,
  weaponId: string | undefined,
  weaponLevel: number | undefined,
  artifactLoadout: ArtifactLoadout | undefined,
): Stats {
  if (weaponId === undefined) {
    if (artifactLoadout === undefined) return stats;
    return stats.base === undefined
      ? resolveEquippedStats(stats, { artifacts: artifactLoadout }).stats
      : applyArtifactStatsToResolvedStats(stats, artifactLoadout);
  }
  const weapon = weaponStatsAtAuthoredLevel(weaponId, weaponLevel);
  if (!weapon) {
    return artifactLoadout
      ? applyArtifactStatsToResolvedStats(stats, artifactLoadout)
      : stats;
  }

  const source = intrinsicStats ?? stats;
  if (stats.base !== undefined) {
    return artifactLoadout
      ? applyArtifactStatsToResolvedStats(stats, artifactLoadout)
      : stats;
  }
  if (
    intrinsicStats !== undefined &&
    (stats.atk !== intrinsicStats.atk ||
      stats.hp !== intrinsicStats.hp ||
      stats.def !== intrinsicStats.def)
  ) {
    return artifactLoadout
      ? applyArtifactStatsToResolvedStats(stats, artifactLoadout)
      : stats;
  }
  return resolveEquippedStats(source, {
    weapon,
    artifacts: artifactLoadout,
  }).stats;
}

/**
 * The equipment half of a `SimulationConfig`, for one team.
 *
 * Returns the two fields together because they describe the same gear from two
 * angles and must never drift apart: `equippedStats` is what it is WORTH,
 * `equipmentBuffs` is what it CONDITIONALLY DOES. Supplying one without the
 * other is how a build ends up half-applied.
 *
 * Empty objects are omitted rather than emitted, so a team with no equipment
 * produces a config equal to the one it produced before this wire existed.
 */
export function equipmentConfig(
  team: readonly EquippedCharacter[],
  selections: EquipmentSelections,
): Pick<SimulationConfig, "equippedStats" | "equipmentBuffs"> {
  const equippedStats: Record<string, Stats> = {};
  const equipmentBuffs: Record<string, CharacterEquipmentBuffs> = {};

  // Party order. A `Record` built by walking the team is stable regardless of
  // how the selections record was keyed.
  for (const character of team) {
    const selection = selectionFor(selections, character.id);
    equippedStats[character.id] = statsForSelection(
      character.stats,
      character.intrinsicStats,
      selection.weaponId,
      selection.weaponLevel,
      selection.artifactLoadout,
    );
    const buffs = characterEquipmentBuffs(selection);
    if (buffs) equipmentBuffs[character.id] = buffs;
  }

  return {
    ...(Object.keys(equippedStats).length > 0 ? { equippedStats } : {}),
    ...(Object.keys(equipmentBuffs).length > 0 ? { equipmentBuffs } : {}),
  };
}

/**
 * Whether this exact selection contributes any modelled effect.
 *
 * The picker's honesty labels are derived from the same generated rows, so this
 * is a summary for the team panel rather than a second source of truth: it
 * answers "did anything I picked reach the simulation", which a per-row label
 * on a closed dialog cannot.
 */
export function selectionIsModelled(
  selection: CharacterEquipmentSelection,
): boolean {
  const entry = characterEquipmentBuffs(selection);
  if (!entry) return false;
  if (entry.weaponPassive) return true;
  const active = new Set(activeSetBonusKeys(entry.artifacts));
  for (const piece of Object.values(entry.artifacts ?? {})) {
    if (piece) active.add(`${piece.setId}:1`);
  }
  return (entry.runtimeSetBonuses ?? []).some((bonus) => {
    if (active.has(`${bonus.setId}:1`) && (bonus.onePiece?.length ?? 0) > 0) {
      return true;
    }
    if (active.has(`${bonus.setId}:2`)) {
      if (
        (bonus.twoPiece?.length ?? 0) > 0 ||
        (bonus.twoPieceHealingEffects?.length ?? 0) > 0 ||
        (bonus.twoPieceStateEffects?.length ?? 0) > 0 ||
        (bonus.healingEffects?.length ?? 0) > 0 ||
        (bonus.stateEffects?.length ?? 0) > 0
      ) return true;
    }
    if (active.has(`${bonus.setId}:4`)) {
      return (
        (bonus.fourPiece?.length ?? 0) > 0 ||
        (bonus.fourPieceHealingEffects?.length ?? 0) > 0 ||
        (bonus.fourPieceStateEffects?.length ?? 0) > 0
      );
    }
    return false;
  });
}
