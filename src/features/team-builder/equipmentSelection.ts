import { REFINEMENTS, type Refinement } from "@/features/team-builder/weaponPresentation";

// ---------------------------------------------------------------------------
// The user's equipment CHOICES, as a plain serializable value.
//
// WHY THIS MODULE EXISTS. The choices used to live as four `useState` hooks
// inside `TeamBuilder` (`equippedWeapons`, `equippedArtifacts`, plus the
// picker's browse-only `refinement`), keyed by SLOT INDEX. Nothing outside that
// component could read them, so the page could not hand them to the simulation
// adapter and the engine ran as though the user had equipped nothing. Weapon
// STATS reached the engine only incidentally, because `handleSelectWeapon`
// folded them into `character.baseStats`; weapon PASSIVES and artifact set
// bonuses reached it not at all.
//
// Two changes make the choices usable:
//
//   KEYED BY CHARACTER ID, not slot index. Reordering the party with the
//   move-slot control permuted the slot-indexed records against the team array,
//   which silently moved one character's weapon onto another. A character id is
//   the identity the engine, the persistence layer and the fingerprint all
//   already use.
//
//   REFINEMENT IS PART OF THE SELECTION. It was picker-local browse state that
//   was discarded on select, so every equipped weapon was simulated at R1
//   whatever the user had been looking at. `harvestWeaponPassiveBuffs()`
//   INDEXES per-refinement data, so this is a wrong damage number, not a
//   cosmetic gap.
//
// Pure: no React, no DOM, no engine call, no game math. This module only
// selects, merges and validates the user's choices.
// ---------------------------------------------------------------------------

/** Artifact piece counts a set bonus can be equipped at. */
export const ARTIFACT_PIECE_COUNTS = [1, 2, 4] as const;
export type ArtifactPieceCount = (typeof ARTIFACT_PIECE_COUNTS)[number];

/** Refinement a newly equipped weapon is assumed to be at until chosen. */
export const DEFAULT_REFINEMENT: Refinement = 1;

/**
 * Piece count a newly equipped set is assumed to be at.
 *
 * Four, because the picker presents a SET rather than five individual pieces,
 * and a user who picks "Crimson Witch" in a set picker means the set bonus they
 * associate with that name. Two would silently withhold the 4pc tier the label
 * implies. The count is then editable, so the assumption is visible and not
 * baked in.
 */
export const DEFAULT_ARTIFACT_PIECES: ArtifactPieceCount = 4;

/** One character's equipment choices. Every field is optional. */
export interface CharacterEquipmentSelection {
  readonly weaponId?: string;
  /** Owned refinement of `weaponId`. Meaningless without it. */
  readonly refinement?: Refinement;
  /** Equipped artifact SET id. `null`/absent means no set. */
  readonly artifactSetId?: string | null;
  /** How many pieces of `artifactSetId` are worn. */
  readonly artifactPieces?: ArtifactPieceCount;
}

/** The whole team's equipment choices, keyed by character id. */
export type EquipmentSelections = Readonly<
  Record<string, CharacterEquipmentSelection>
>;

export function emptyEquipmentSelections(): EquipmentSelections {
  return {};
}

export function isArtifactPieceCount(value: number): value is ArtifactPieceCount {
  return ARTIFACT_PIECE_COUNTS.includes(value as ArtifactPieceCount);
}

export function isRefinementValue(value: number): value is Refinement {
  return REFINEMENTS.includes(value as Refinement);
}

/**
 * One character's selection, or an empty one.
 *
 * Returns a value rather than `undefined` so call sites read fields directly
 * instead of each repeating an optional chain that could be forgotten.
 */
export function selectionFor(
  selections: EquipmentSelections,
  characterId: string,
): CharacterEquipmentSelection {
  return selections[characterId] ?? {};
}

/**
 * Merges a partial edit onto one character's selection.
 *
 * An absent field means UNCHANGED, never "reset to default" — the same rule
 * `applyBuildEdit` follows, for the same reason: equipping a weapon must not
 * silently clear the artifact set the user chose earlier.
 */
export function withSelection(
  selections: EquipmentSelections,
  characterId: string,
  edit: CharacterEquipmentSelection,
): EquipmentSelections {
  return {
    ...selections,
    [characterId]: { ...selectionFor(selections, characterId), ...edit },
  };
}

/**
 * Equips a weapon, carrying its refinement.
 *
 * The refinement travels WITH the weapon id for the same reason `level` travels
 * with `baseStats` in `applyBuildEdit`: an R5 selection whose refinement was
 * dropped simulates as R1 while the UI still reads R5, which is a wrong number
 * that no "the passive applies" assertion would catch.
 */
export function equipWeapon(
  selections: EquipmentSelections,
  characterId: string,
  weaponId: string,
  refinement: Refinement = DEFAULT_REFINEMENT,
): EquipmentSelections {
  return withSelection(selections, characterId, { weaponId, refinement });
}

/** Equips an artifact set, or clears it with `null`. */
export function equipArtifactSet(
  selections: EquipmentSelections,
  characterId: string,
  artifactSetId: string | null,
  pieces: ArtifactPieceCount = DEFAULT_ARTIFACT_PIECES,
): EquipmentSelections {
  return withSelection(selections, characterId, {
    artifactSetId,
    ...(artifactSetId === null ? {} : { artifactPieces: pieces }),
  });
}

/** Changes the refinement of an already-equipped weapon. */
export function setRefinement(
  selections: EquipmentSelections,
  characterId: string,
  refinement: Refinement,
): EquipmentSelections {
  return withSelection(selections, characterId, { refinement });
}

/** Changes how many pieces of the equipped set are worn. */
export function setArtifactPieces(
  selections: EquipmentSelections,
  characterId: string,
  pieces: ArtifactPieceCount,
): EquipmentSelections {
  return withSelection(selections, characterId, { artifactPieces: pieces });
}

/**
 * Drops selections for characters no longer on the team.
 *
 * Keyed by id, a removed character's choices would otherwise persist forever
 * and silently reappear if they were re-added — and would keep widening the
 * persisted blob. Called on team change, not on every render.
 */
export function pruneSelections(
  selections: EquipmentSelections,
  teamCharacterIds: readonly string[],
): EquipmentSelections {
  const present = new Set(teamCharacterIds);
  const next: Record<string, CharacterEquipmentSelection> = {};
  // Sorted, so the pruned record's key order does not depend on the incoming
  // one — the persisted JSON and the run fingerprint must both be stable.
  for (const id of Object.keys(selections).sort()) {
    if (present.has(id)) next[id] = selectionFor(selections, id);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** Storage key. Bumped from `-v1` because the shape changed id/refinement. */
export const EQUIPMENT_STORAGE_KEY = "genshin-team-equipment-v2";

interface PersistedEquipment {
  readonly version: 2;
  readonly byCharacter: EquipmentSelections;
}

const PERSISTED_VERSION = 2;

export function serializeSelections(selections: EquipmentSelections): string {
  const payload: PersistedEquipment = {
    version: PERSISTED_VERSION,
    byCharacter: selections,
  };
  return JSON.stringify(payload);
}

/**
 * Parses persisted selections, discarding anything malformed.
 *
 * Validates FIELD BY FIELD rather than casting the parsed blob. Session storage
 * is user-writable and survives a deploy, so a stale or hand-edited entry can
 * carry a refinement of `9` or a piece count of `3`. Casting would hand that
 * straight to `harvestWeaponPassiveBuffs`, whose fail-closed guard would then
 * silently drop the passive — a wrong damage number produced by trusting
 * storage. An unparseable blob yields no selections, never a partial guess.
 *
 * `isKnownWeaponId` / `isKnownSetId` are injected rather than imported so this
 * module stays free of game data and directly testable.
 */
export function parseSelections(
  raw: string | null,
  isKnownWeaponId: (id: string) => boolean,
  isKnownSetId: (id: string) => boolean,
): EquipmentSelections {
  if (raw === null) return emptyEquipmentSelections();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyEquipmentSelections();
  }
  if (typeof parsed !== "object" || parsed === null) {
    return emptyEquipmentSelections();
  }
  const record = parsed as Record<string, unknown>;
  if (record.version !== PERSISTED_VERSION) return emptyEquipmentSelections();
  const byCharacter = record.byCharacter;
  if (typeof byCharacter !== "object" || byCharacter === null) {
    return emptyEquipmentSelections();
  }

  const out: Record<string, CharacterEquipmentSelection> = {};
  const source = byCharacter as Record<string, unknown>;
  for (const characterId of Object.keys(source).sort()) {
    const entry = source[characterId];
    if (typeof entry !== "object" || entry === null) continue;
    const fields = entry as Record<string, unknown>;

    const selection: {
      weaponId?: string;
      refinement?: Refinement;
      artifactSetId?: string | null;
      artifactPieces?: ArtifactPieceCount;
    } = {};

    if (typeof fields.weaponId === "string" && isKnownWeaponId(fields.weaponId)) {
      selection.weaponId = fields.weaponId;
      // A refinement is kept only alongside the weapon it refines; on its own
      // it describes nothing.
      selection.refinement =
        typeof fields.refinement === "number" && isRefinementValue(fields.refinement)
          ? fields.refinement
          : DEFAULT_REFINEMENT;
    }

    if (fields.artifactSetId === null) {
      selection.artifactSetId = null;
    } else if (
      typeof fields.artifactSetId === "string" &&
      isKnownSetId(fields.artifactSetId)
    ) {
      selection.artifactSetId = fields.artifactSetId;
      selection.artifactPieces =
        typeof fields.artifactPieces === "number" &&
        isArtifactPieceCount(fields.artifactPieces)
          ? fields.artifactPieces
          : DEFAULT_ARTIFACT_PIECES;
    }

    if (Object.keys(selection).length > 0) out[characterId] = selection;
  }
  return out;
}
