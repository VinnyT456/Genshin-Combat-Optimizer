import type { CharacterDefinition, Rotation } from "@/types";

// ---------------------------------------------------------------------------
// Pure team-composition model. Slot arithmetic and party-order manipulation are
// presentation concerns, not game math — nothing here computes damage, energy
// or reactions. Kept out of React so it is directly unit-testable.
// ---------------------------------------------------------------------------

/** Maximum party size in Genshin. */
export const TEAM_SIZE = 4;

/** A team is always exactly TEAM_SIZE positional slots; holes are allowed. */
export type Team = readonly (CharacterDefinition | null)[];

export function emptyTeam(): Team {
  return Array.from({ length: TEAM_SIZE }, () => null);
}

/** Builds a team from a leading list of characters, padding with empty slots. */
export function teamFrom(characters: readonly CharacterDefinition[]): Team {
  return Array.from(
    { length: TEAM_SIZE },
    (_, i) => characters[i] ?? null,
  );
}

export function isSlotIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < TEAM_SIZE;
}

/** Members in party order, holes removed. */
export function members(team: Team): CharacterDefinition[] {
  return team.filter((c): c is CharacterDefinition => c !== null);
}

/**
 * Character level the enemy-mitigation preview is computed against.
 *
 * The DEF multiplier depends on the ATTACKER's level, but mitigation is shown
 * beside the enemy config, where no single character is in context. The first
 * party member is used, and the caller RENDERS the level next to the number so
 * the assumption is visible rather than implied (finding H5).
 *
 * Returns `null` for an empty team: there is no character to reference, and
 * inventing one would reintroduce the hardcoded level this replaced.
 */
export function referenceCharacterLevel(team: Team): number | null {
  const [first] = members(team);
  return first?.level ?? null;
}

export function memberCount(team: Team): number {
  return members(team).length;
}

export function isEmpty(team: Team): boolean {
  return memberCount(team) === 0;
}

export function isFull(team: Team): boolean {
  return memberCount(team) === TEAM_SIZE;
}

/** Slot index holding `characterId`, or -1. */
export function slotOf(team: Team, characterId: string): number {
  return team.findIndex((c) => c !== null && c.id === characterId);
}

/**
 * Places `character` (or clears the slot with `null`). If the character already
 * occupies another slot the two slots swap, so a "change" can never produce a
 * duplicate party member.
 */
export function setSlot(
  team: Team,
  index: number,
  character: CharacterDefinition | null,
): Team {
  if (!isSlotIndex(index)) return team;
  const next = [...team];
  if (character !== null) {
    const existing = slotOf(team, character.id);
    if (existing !== -1 && existing !== index) {
      next[existing] = team[index] ?? null;
    }
  }
  next[index] = character;
  return next;
}

/** Moves the slot at `from` to `to`, shifting the intervening slots. */
export function moveSlot(team: Team, from: number, to: number): Team {
  if (!isSlotIndex(from) || !isSlotIndex(to) || from === to) return team;
  const next = [...team];
  const [moved = null] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Resolves the character considered on-field. Before a run this is the user's
 * manual choice; it falls back to the first occupied slot so a team is never
 * rendered without an active member.
 */
export function resolveActiveId(team: Team, preferredId: string | null): string | null {
  if (preferredId !== null && slotOf(team, preferredId) !== -1) return preferredId;
  return members(team)[0]?.id ?? null;
}

/** Rotation actions whose character is no longer in the team. */
export function orphanedActionCount(
  team: Team,
  actionCharacterIds: readonly string[],
): number {
  const present = new Set(members(team).map((c) => c.id));
  return actionCharacterIds.filter((id) => !present.has(id)).length;
}

/**
 * Keeps a restored action sequence executable for the team that owns it.
 *
 * UID imports replace the public character roster, while older saved drafts
 * can still contain actions from the previous roster. Those actions would
 * make the optimizer reject the entire baseline as an unknown-character run.
 * Removing only actions whose character is absent preserves valid user work
 * and leaves the empty sequence available for a fresh search when none can be
 * retained.
 */
export function retainTeamActions(team: Team, rotation: Rotation): Rotation {
  const present = new Set(members(team).map((character) => character.id));
  return rotation.filter((action) => present.has(action.characterId));
}

/**
 * Sentence describing what {@link setSlot} did, for the live region.
 *
 * `setSlot` swaps when the incoming character already holds another slot, so a
 * single selection can move TWO characters. Announcing only the incoming one
 * would leave the displaced character's move silent for assistive tech.
 *
 * Takes the team as it was BEFORE the mutation.
 */
export function describeSelection(
  teamBefore: Team,
  slotIndex: number,
  character: CharacterDefinition,
): string {
  const target = slotIndex + 1;
  const previous = slotOf(teamBefore, character.id);

  if (previous !== -1 && previous !== slotIndex) {
    const displaced = teamBefore[slotIndex] ?? null;
    if (displaced === null) {
      return `${character.name} moved to slot ${target}.`;
    }
    return (
      `${character.name} moved to slot ${target}, ` +
      `${displaced.name} moved to slot ${previous + 1}.`
    );
  }

  const replaced = teamBefore[slotIndex] ?? null;
  if (replaced !== null && replaced.id !== character.id) {
    return `${replaced.name} replaced by ${character.name} in slot ${target}.`;
  }
  return `${character.name} added to slot ${target}.`;
}

/** The edits the character stats modal can produce in one save. */
export interface CharacterBuildEdit {
  readonly baseStats: CharacterDefinition["baseStats"];
  readonly constellation?: number;
  readonly talentLevels?: { normal: number; skill: number; burst: number };
  readonly level?: number;
}

/**
 * Merges one save from the build editor onto a character.
 *
 * Extracted from the component so the merge is testable: a React handler that
 * silently drops `level` cannot be caught by a pure-model test, and this
 * project has no DOM test harness to render the modal with.
 *
 * EVERY field is optional and an absent field means "unchanged", never
 * "reset to default". `level` in particular must travel WITH the `baseStats`
 * that were resolved from its curve — saving the level while keeping level-90
 * base stats is the snapshot bug (a level-1 Bennett computing with 191 base
 * ATK instead of 16), and saving the stats while dropping the level leaves the
 * DEF multiplier describing a character the panel no longer shows.
 *
 * Applies no game math: it selects values the caller already resolved.
 */
export function applyBuildEdit(
  character: CharacterDefinition,
  edit: CharacterBuildEdit,
): CharacterDefinition {
  return {
    ...character,
    level: edit.level !== undefined ? edit.level : character.level,
    baseStats: edit.baseStats,
    constellation:
      edit.constellation !== undefined
        ? edit.constellation
        : character.constellation,
    talentLevels:
      edit.talentLevels !== undefined
        ? edit.talentLevels
        : character.talentLevels,
  };
}
