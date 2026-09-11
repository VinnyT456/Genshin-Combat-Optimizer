import { REFINEMENTS, type Refinement } from "@/features/team-builder/weaponPresentation";
import type {
  ArtifactLoadout,
  EquipmentStat,
  EquipmentStatKey,
} from "@/simulation/character/equipment";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";

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

/** Artifact piece counts supported by the editor, including mixed loadouts. */
export const ARTIFACT_PIECE_COUNTS = [1, 2, 3, 4, 5] as const;
export type ArtifactPieceCount = (typeof ARTIFACT_PIECE_COUNTS)[number];

/** Refinement a newly equipped weapon is assumed to be at until chosen. */
export const DEFAULT_REFINEMENT: Refinement = 1;

/** Weapon level assumed when an older saved selection has no level field. */
export const DEFAULT_WEAPON_LEVEL = 90;
export const MIN_WEAPON_LEVEL = 1;
export const MAX_WEAPON_LEVEL = 90;

const EQUIPMENT_STAT_KEYS: readonly EquipmentStatKey[] = [
  "atkPercent",
  "hpPercent",
  "defPercent",
  "atkFlat",
  "hpFlat",
  "defFlat",
  "elementalMastery",
  "critRate",
  "critDmg",
  "energyRecharge",
  "dmgBonus",
  "elementalDmgBonus",
];

function parseEquipmentStat(value: unknown): EquipmentStat | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const stat = record.stat;
  const amount = record.value;
  if (
    typeof stat !== "string" ||
    !EQUIPMENT_STAT_KEYS.includes(stat as EquipmentStatKey) ||
    typeof amount !== "number" ||
    !Number.isFinite(amount)
  ) {
    return undefined;
  }
  if (stat === "elementalDmgBonus") {
    const element = record.element;
    if (
      element !== "pyro" &&
      element !== "hydro" &&
      element !== "electro" &&
      element !== "cryo" &&
      element !== "anemo" &&
      element !== "geo" &&
      element !== "dendro" &&
      element !== "physical"
    ) {
      return undefined;
    }
    return { stat, value: amount, element };
  }
  return { stat: stat as Exclude<EquipmentStatKey, "elementalDmgBonus">, value: amount };
}

export function isWeaponLevel(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_WEAPON_LEVEL &&
    value <= MAX_WEAPON_LEVEL
  );
}

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
  /** Current level of `weaponId`; omitted legacy entries mean level 90. */
  readonly weaponLevel?: number;
  /** Primary artifact SET id for legacy summaries. Mixed loadouts use each piece's `setId`. */
  readonly artifactSetId?: string | null;
  /** Number of pieces belonging to `artifactSetId` for legacy summaries. */
  readonly artifactPieces?: ArtifactPieceCount;
  /** Fixed main/substats for each equipped piece. Each piece may use a different set. */
  readonly artifactLoadout?: ArtifactLoadout;
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
  weaponLevel: number = DEFAULT_WEAPON_LEVEL,
): EquipmentSelections {
  return withSelection(selections, characterId, {
    weaponId,
    refinement,
    ...(isWeaponLevel(weaponLevel) ? { weaponLevel } : {}),
  });
}

/** Equips an artifact set, or clears it with `null`. */
export function equipArtifactSet(
  selections: EquipmentSelections,
  characterId: string,
  artifactSetId: string | null,
  pieces: ArtifactPieceCount = DEFAULT_ARTIFACT_PIECES,
  artifactLoadout?: ArtifactLoadout,
): EquipmentSelections {
  if (artifactSetId === null) {
    const current = selectionFor(selections, characterId);
    const rest = { ...current };
    delete rest.artifactPieces;
    delete rest.artifactLoadout;
    return { ...selections, [characterId]: { ...rest, artifactSetId: null } };
  }
  return withSelection(selections, characterId, {
    artifactSetId,
    artifactPieces: pieces,
    ...(artifactLoadout === undefined ? {} : { artifactLoadout }),
  });
}

/**
 * Saves a five-slot artifact loadout. The legacy set id/count fields are kept
 * as a stable summary for existing cards and persisted builds; the simulation
 * reads every piece in `artifactLoadout` when present.
 */
export function equipArtifactLoadout(
  selections: EquipmentSelections,
  characterId: string,
  artifactLoadout: ArtifactLoadout,
): EquipmentSelections {
  const pieces = ARTIFACT_SLOTS.map((slot) => artifactLoadout[slot]).filter(
    (piece): piece is NonNullable<typeof piece> => piece !== undefined,
  );
  if (pieces.length === 0) {
    return equipArtifactSet(selections, characterId, null);
  }

  // Legacy cards still need one set/count summary. Pick the set with the most
  // equipped pieces so a 4+1 build remains labelled by its four-piece set,
  // even when the off-piece occupies the first slot (usually the flower).
  const counts = new Map<string, number>();
  for (const piece of pieces) counts.set(piece.setId, (counts.get(piece.setId) ?? 0) + 1);
  let primarySetId = pieces[0]!.setId;
  let primaryCount = counts.get(primarySetId) ?? 0;
  for (const slot of ARTIFACT_SLOTS) {
    const setId = artifactLoadout[slot]?.setId;
    if (!setId) continue;
    const count = counts.get(setId) ?? 0;
    if (count > primaryCount) {
      primarySetId = setId;
      primaryCount = count;
    }
  }
  return withSelection(selections, characterId, {
    artifactSetId: primarySetId,
    artifactPieces: primaryCount as ArtifactPieceCount,
    artifactLoadout,
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

/** Changes the level of an already-equipped weapon. */
export function setWeaponLevel(
  selections: EquipmentSelections,
  characterId: string,
  weaponLevel: number,
): EquipmentSelections {
  if (!isWeaponLevel(weaponLevel)) return selections;
  return withSelection(selections, characterId, { weaponLevel });
}

/** Changes how many pieces of the equipped set are worn. */
export function setArtifactPieces(
  selections: EquipmentSelections,
  characterId: string,
  pieces: ArtifactPieceCount,
): EquipmentSelections {
  return withSelection(selections, characterId, { artifactPieces: pieces });
}

/** Counts each set in a mixed five-slot loadout in deterministic set-id order. */
export function artifactSetCounts(
  loadout: ArtifactLoadout | undefined,
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const slot of ["flower", "plume", "sands", "goblet", "circlet"] as const) {
    const setId = loadout?.[slot]?.setId;
    if (setId) counts[setId] = (counts[setId] ?? 0) + 1;
  }
  return counts;
}

/** Human-readable combination label such as `2+2`, `4+1`, or `1+1+1+1+1`. */
export function artifactCombinationLabel(
  loadout: ArtifactLoadout | undefined,
): string | undefined {
  const counts = Object.values(artifactSetCounts(loadout));
  if (counts.length <= 1) return undefined;
  return counts.sort((a, b) => b - a).join("+");
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
      weaponLevel?: number;
      artifactSetId?: string | null;
      artifactPieces?: ArtifactPieceCount;
      artifactLoadout?: ArtifactLoadout;
    } = {};

    if (typeof fields.weaponId === "string" && isKnownWeaponId(fields.weaponId)) {
      selection.weaponId = fields.weaponId;
      // A refinement is kept only alongside the weapon it refines; on its own
      // it describes nothing.
      selection.refinement =
        typeof fields.refinement === "number" && isRefinementValue(fields.refinement)
          ? fields.refinement
          : DEFAULT_REFINEMENT;
      selection.weaponLevel =
        typeof fields.weaponLevel === "number" && isWeaponLevel(fields.weaponLevel)
          ? fields.weaponLevel
          : DEFAULT_WEAPON_LEVEL;
    }

    const rawArtifactSetId = fields.artifactSetId;
    if (rawArtifactSetId === null) selection.artifactSetId = null;
    else if (typeof rawArtifactSetId === "string" && isKnownSetId(rawArtifactSetId)) {
      selection.artifactSetId = rawArtifactSetId;
    }

    if (
      typeof fields.artifactPieces === "number" &&
      isArtifactPieceCount(fields.artifactPieces)
    ) {
      selection.artifactPieces = fields.artifactPieces;
    }

    if (typeof fields.artifactLoadout === "object" && fields.artifactLoadout !== null) {
      const loadout: ArtifactLoadout = {};
      for (const slot of ["flower", "plume", "sands", "goblet", "circlet"] as const) {
        const rawPiece = (fields.artifactLoadout as Record<string, unknown>)[slot];
        if (typeof rawPiece !== "object" || rawPiece === null) continue;
        const piece = rawPiece as Record<string, unknown>;
        if (
          typeof piece.setId !== "string" ||
          !isKnownSetId(piece.setId) ||
          piece.slot !== slot
        ) continue;
        const mainStat = parseEquipmentStat(piece.mainStat);
        if (mainStat === undefined) continue;
        const substats = Array.isArray(piece.substats)
          ? piece.substats
              .map(parseEquipmentStat)
              .filter((value): value is NonNullable<typeof value> => value !== undefined)
          : [];
        loadout[slot] = { slot, setId: piece.setId, mainStat, substats };
      }
      if (Object.keys(loadout).length > 0) {
        selection.artifactLoadout = loadout;
        if (selection.artifactSetId === undefined) {
          const first = Object.values(loadout)[0];
          if (first) selection.artifactSetId = first.setId;
        }
        if (selection.artifactPieces === undefined && selection.artifactSetId) {
          const count = Object.values(loadout).filter(
            (piece) => piece?.setId === selection.artifactSetId,
          ).length;
          if (count > 0) selection.artifactPieces = count as ArtifactPieceCount;
        }
      }
    }

    if (Object.keys(selection).length > 0) out[characterId] = selection;
  }
  return out;
}
