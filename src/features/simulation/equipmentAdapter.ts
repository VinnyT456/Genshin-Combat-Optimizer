import type { SimulationConfig, Stats } from "@/types";
import type {
  ArtifactLoadout,
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
import { setBonusBuffsById } from "@/game-data/artifacts/setBonusBuffs";
import { completeSetBonusBuffsById } from "@/game-data/artifacts/completeSetBonusBuffs";
import {
  type ArtifactPieceCount,
  type CharacterEquipmentSelection,
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
 * A synthetic loadout standing in for "N pieces of one set".
 *
 * WHY SYNTHETIC. `harvestArtifactSetBuffs()` gates tiers on `activeSetBonusKeys()`,
 * which counts real `ArtifactPiece`s per slot. The picker, by design, selects a
 * SET and a piece count rather than five individual artifacts, so this function
 * produces the loadout that count describes.
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

  const setBonus: ArtifactSetBonusBuffs | undefined =
    selection.artifactSetId === undefined || selection.artifactSetId === null
      ? undefined
      : setBonusBuffsById(selection.artifactSetId);
  const runtimeSetBonus: ArtifactSetBonusBuffs | undefined =
    selection.artifactSetId === undefined || selection.artifactSetId === null
      ? undefined
      : completeSetBonusBuffsById(selection.artifactSetId);

  if (!passive && !setBonus && !runtimeSetBonus) return undefined;

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

  if (setBonus && selection.artifactSetId) {
    entry.setBonuses = [setBonus];
    // Only the equipped set's loadout, so the tier gate counts real pieces.
    // `artifactPieces` is required to claim any tier; without it nothing is
    // counted and no bonus is applied.
    if (selection.artifactPieces !== undefined) {
      entry.artifacts = syntheticLoadout(
        selection.artifactSetId,
        selection.artifactPieces,
      );
    }
  }
  if (runtimeSetBonus) {
    entry.runtimeSetBonuses = [runtimeSetBonus];
    if (selection.artifactPieces !== undefined && selection.artifactSetId) {
      entry.artifacts ??= syntheticLoadout(
        selection.artifactSetId,
        selection.artifactPieces,
      );
    }
  }

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
    equippedStats[character.id] = character.stats;
    const buffs = characterEquipmentBuffs(selectionFor(selections, character.id));
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
  const pieces = selection.artifactPieces;
  if (pieces === undefined) return false;
  return (entry.runtimeSetBonuses ?? []).some((bonus) =>
    pieces === 1
      ? (bonus.onePiece?.length ?? 0) > 0
      : pieces >= 4
      ? (bonus.fourPiece?.length ?? 0) > 0 ||
        (bonus.healingEffects?.length ?? 0) > 0 ||
        (bonus.fourPieceHealingEffects?.length ?? 0) > 0 ||
        (bonus.twoPieceHealingEffects?.length ?? 0) > 0 ||
        (bonus.stateEffects?.length ?? 0) > 0 ||
        (bonus.twoPieceStateEffects?.length ?? 0) > 0 ||
        (bonus.fourPieceStateEffects?.length ?? 0) > 0 ||
        (bonus.twoPiece?.length ?? 0) > 0
      : (bonus.twoPiece?.length ?? 0) > 0 ||
        (bonus.twoPieceHealingEffects?.length ?? 0) > 0 ||
        (bonus.stateEffects?.length ?? 0) > 0 ||
        (bonus.twoPieceStateEffects?.length ?? 0) > 0 ||
        (bonus.healingEffects?.length ?? 0) > 0,
  );
}
