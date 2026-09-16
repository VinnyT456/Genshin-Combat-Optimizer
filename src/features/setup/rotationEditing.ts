// ---------------------------------------------------------------------------
// Pure editing logic for the sequence designer (COMPONENTS.md §14).
//
// This module edits a `Rotation` — an ordered `RotationAction[]` — and derives
// authoring-time presentation values from it. It performs NO damage, energy,
// reaction or optimizer math; those belong to the simulation engine and reach
// the UI only through `simulateRotation()` / `optimizeRotation()`.
//
// It lives beside the component rather than inside it so the insertion-index
// arithmetic and the §14.6 auto-swap rule are testable without a DOM.
// ---------------------------------------------------------------------------

import type {
  ActionType,
  CharacterDefinition,
  Rotation,
  RotationAction,
} from "@/types";
import { DEFAULT_SWAP_COST_SECONDS } from "@/simulation/engine/constants";
import { charNameZh } from "@/lib/i18n";

/** Action types the add bar can author. `swap` is inferred, never authored (§14.6). */
export type AddableActionType = Extract<
  ActionType,
  "normal" | "charged" | "skill" | "burst"
>;

export const ADDABLE_ACTION_TYPES: readonly AddableActionType[] = [
  "skill",
  "burst",
  "normal",
  "charged",
];

interface ActionLabel {
  /** Compact badge glyph. Always `aria-hidden` — the label carries the meaning. */
  readonly short: string;
  /** Full Chinese label. */
  readonly label: string;
}

const ACTION_LABELS: Record<ActionType, ActionLabel> = {
  normal: { short: "普", label: "普通攻击" },
  charged: { short: "重", label: "重击" },
  plungeLow: { short: "下低", label: "低空下落" },
  plungeHigh: { short: "下高", label: "高空下落" },
  skill: { short: "E", label: "元素战技" },
  burst: { short: "Q", label: "元素爆发" },
  swap: { short: "⇄", label: "切换角色" },
};

/** Keep generated ability ids/names out of the Chinese-first rotation UI. */
export function actionDisplayLabel(actionType: ActionType): string {
  return ACTION_LABELS[actionType]?.label ?? "未知动作";
}

export function actionBadgeGlyph(actionType: ActionType): string {
  return ACTION_LABELS[actionType]?.short ?? "?";
}

export function characterDisplayLabel(
  character: CharacterDefinition | null | undefined,
): string {
  return character ? charNameZh(character.name) : "未知角色";
}

/**
 * Fallback authoring-time cost of one character swap, in seconds.
 *
 * This is the value used when the caller supplies no configured cost — it
 * mirrors `SimulationConfig.swapCost`'s own default so an unconfigured editor
 * and an unconfigured run agree. It is NOT the cost: every function below takes
 * the effective cost as a parameter (§15.3/G4). The editor previously read this
 * constant directly, so selecting `0.4秒` in 模拟计算参数 left the editor
 * pricing swaps at 0.6s while the engine used 0.4s — two visible numbers for
 * one concept, disagreeing on the same screen.
 */
export const DEFAULT_EDITOR_SWAP_COST_SECONDS = DEFAULT_SWAP_COST_SECONDS;

/** Seconds are rendered to two decimals everywhere in this component. */
const SECONDS_PRECISION = 2;
/** Aggregate totals read as one decimal; per-row durations read as two. */
const TOTAL_PRECISION = 1;

export function formatSeconds(seconds: number): string {
  return seconds.toFixed(SECONDS_PRECISION);
}

export function formatTotalSeconds(seconds: number): string {
  return seconds.toFixed(TOTAL_PRECISION);
}

/**
 * Cast time of one action for the acting character, or `null` when the
 * character is not in the team.
 *
 * `null` is load-bearing: §14.1/D5 forbids printing a fabricated `0.50秒` in
 * the same type style as a real duration. Callers render `—` instead.
 */
export function actionDuration(
  action: RotationAction,
  character: CharacterDefinition | undefined,
  swapCostSeconds: number,
): number | null {
  if (action.actionType === "swap") return swapCostSeconds;
  if (character === undefined) return null;
  switch (action.actionType) {
    case "skill":
      return character.elementalSkill.castTime;
    case "burst":
      return character.elementalBurst.castTime;
    case "normal":
      return character.normalAttack.castTime;
    case "charged":
      return character.chargedAttack.castTime;
    default:
      return null;
  }
}

/** The ability id an addable action type resolves to on a given character. */
export function abilityIdFor(
  character: CharacterDefinition,
  actionType: AddableActionType,
): string {
  switch (actionType) {
    case "skill":
      return character.elementalSkill.id;
    case "burst":
      return character.elementalBurst.id;
    case "normal":
      return character.normalAttack.id;
    case "charged":
      return character.chargedAttack.id;
  }
}

export interface RowTiming {
  /** Running clock: the sum of every prior row's duration. */
  readonly startTime: number;
  /** `null` when the acting character is not in the team (§14.1/D5). */
  readonly duration: number | null;
}

/**
 * Running start times for every row.
 *
 * An orphaned row contributes no time — it will not execute, so advancing the
 * clock past it would state a duration the run will not have.
 */
export function rowTimings(
  rotation: Rotation,
  characterById: ReadonlyMap<string, CharacterDefinition>,
  swapCostSeconds: number,
): readonly RowTiming[] {
  let clock = 0;
  return rotation.map((action) => {
    const duration = actionDuration(
      action,
      characterById.get(action.characterId),
      swapCostSeconds,
    );
    const timing: RowTiming = { startTime: clock, duration };
    clock += duration ?? 0;
    return timing;
  });
}

export interface RotationSummary {
  readonly actionCount: number;
  /** `null` when every action is orphaned — zero is a number, this is an absence. */
  readonly totalSeconds: number | null;
  readonly swapCount: number;
  readonly swapSeconds: number;
  readonly orphanCount: number;
}

export function summarizeRotation(
  rotation: Rotation,
  characterById: ReadonlyMap<string, CharacterDefinition>,
  swapCostSeconds: number,
): RotationSummary {
  let totalSeconds = 0;
  let swapCount = 0;
  let orphanCount = 0;

  for (const action of rotation) {
    const character = characterById.get(action.characterId);
    if (character === undefined) {
      orphanCount += 1;
      continue;
    }
    if (action.actionType === "swap") swapCount += 1;
    totalSeconds += actionDuration(action, character, swapCostSeconds) ?? 0;
  }

  const allOrphaned = rotation.length > 0 && orphanCount === rotation.length;

  return {
    actionCount: rotation.length,
    totalSeconds: allOrphaned ? null : totalSeconds,
    swapCount,
    swapSeconds: swapCount * swapCostSeconds,
    orphanCount,
  };
}

// ---------------------------------------------------------------------------
// Insertion
// ---------------------------------------------------------------------------

/**
 * The array index the insertion cursor splices at.
 *
 * `selectedIndex === null` means the cursor sits at the end of the list; a
 * selected row means "immediately after that row".
 */
export function insertionIndex(
  rotation: Rotation,
  selectedIndex: number | null,
): number {
  if (selectedIndex === null) return rotation.length;
  if (selectedIndex < 0) return 0;
  if (selectedIndex >= rotation.length) return rotation.length;
  return selectedIndex + 1;
}

/**
 * The character acting immediately before the insertion point, i.e. the one
 * a swap would have to swap away from.
 *
 * Swap rows count: a `swap` names the character being swapped TO, so after a
 * swap row that character is the one on field.
 */
export function actorBefore(
  rotation: Rotation,
  index: number,
): string | undefined {
  const previous = rotation[index - 1];
  return previous?.characterId;
}

/**
 * §14.6: does inserting `characterId` at `index` require an auto-inserted swap?
 *
 * False when the previous actor is already the subject, and false at index 0
 * of an empty sequence — the first character on field is not swapped in.
 */
export function needsAutoSwap(
  rotation: Rotation,
  index: number,
  characterId: string,
): boolean {
  const previous = actorBefore(rotation, index);
  if (previous === undefined) return false;
  return previous !== characterId;
}

// ---------------------------------------------------------------------------
// Swap normalization (§14.6, applied to the WHOLE sequence)
// ---------------------------------------------------------------------------

/**
 * Removes `swap` rows that are no-ops — a swap to the character who is already
 * the active one at that point.
 *
 * `needsAutoSwap` answers §14.6 for a single insertion point. That is not
 * enough: an edit in the middle of the sequence changes who is active for every
 * row *after* it, so a swap that was doing real work can be stranded. Inserting
 * `香菱 E` between `⇄ 切至 香菱` and `香菱 Q` leaves the later swap pointing at a
 * character who is already on field. §14.6 forbids exactly that row, so the
 * invariant has to be restored over the whole array after every edit.
 *
 * Deliberately **remove-only**: it deletes no-op swaps and nothing else. It
 * never inserts a swap, never removes a swap that is doing real work, and never
 * touches a non-swap action or the order of any surviving row. Inserting a
 * missing swap would author an action — with a real time cost — that the user
 * did not ask for; a rotation left without one stays visibly wrong instead
 * (the row keeps its `未出战`-class honesty affordances and the run is the
 * engine's truth, not the editor's guess). See `missingSwapIndexes` for the
 * read-only report of that case.
 *
 * Pure, deterministic and idempotent: the output contains no redundant swap, so
 * a second pass is a no-op.
 */
export function normalizeSwaps(rotation: Rotation): Rotation {
  const removed = redundantSwapIndexes(rotation);
  if (removed.length === 0) return rotation;
  const drop = new Set(removed);
  return rotation.filter((_, index) => !drop.has(index));
}

/** Indices `normalizeSwaps` would delete, in ascending order. */
export function redundantSwapIndexes(rotation: Rotation): readonly number[] {
  const flagged: number[] = [];
  let active: string | undefined;

  rotation.forEach((action, index) => {
    if (action.actionType === "swap") {
      // Index 0 included: the first acting character is on field already, so a
      // leading swap to them is as redundant as a mid-sequence one (§14.6).
      if (active === undefined || active === action.characterId) {
        flagged.push(index);
        return;
      }
    }
    active = action.characterId;
  });

  return flagged;
}

/**
 * Indices of actions whose character is not the active one and that are not
 * preceded by a swap to them — i.e. rows the sequence cannot legally reach.
 *
 * Reported, never repaired: normalization is remove-only. A row at index 0 is
 * never listed; the first actor needs no swap.
 */
export function missingSwapIndexes(rotation: Rotation): readonly number[] {
  const flagged: number[] = [];
  let active: string | undefined;

  rotation.forEach((action, index) => {
    if (
      action.actionType !== "swap" &&
      active !== undefined &&
      active !== action.characterId
    ) {
      flagged.push(index);
    }
    active = action.characterId;
  });

  return flagged;
}

/**
 * Where an index in `rotation` lands after `normalizeSwaps` drops rows.
 *
 * Counts removals strictly before `index`. When the tracked row is itself
 * removed the index still resolves to the row that takes its place, which is
 * the §14.4 selection rule for a vanished row.
 */
export function indexAfterNormalize(rotation: Rotation, index: number): number {
  const removed = redundantSwapIndexes(rotation);
  let before = 0;
  for (const removedIndex of removed) {
    if (removedIndex < index) before += 1;
  }
  return index - before;
}

export interface InsertResult {
  readonly rotation: Rotation;
  /** Index of the authored action after the splice (past any auto-swap). */
  readonly actionIndex: number;
  /** How many rows were added: 1, or 2 when a swap was inferred. */
  readonly insertedCount: number;
  readonly autoSwapped: boolean;
}

/**
 * Splices an action in at the cursor, inserting a `swap` first when §14.6
 * requires one.
 */
export function insertAction(
  rotation: Rotation,
  index: number,
  character: CharacterDefinition,
  actionType: AddableActionType,
): InsertResult {
  const autoSwapped = needsAutoSwap(rotation, index, character.id);
  const inserted: RotationAction[] = [];

  if (autoSwapped) {
    inserted.push({ characterId: character.id, actionType: "swap" });
  }
  inserted.push({
    characterId: character.id,
    actionType,
    abilityId: abilityIdFor(character, actionType),
  });

  const spliced = [...rotation];
  spliced.splice(index, 0, ...inserted);

  // The insert changed who is active for every later row, so a swap after the
  // cursor may now be a no-op. §14.6 is an invariant over the whole sequence.
  const authoredIndex = index + inserted.length - 1;
  const next = normalizeSwaps(spliced);

  return {
    rotation: next,
    actionIndex: indexAfterNormalize(spliced, authoredIndex),
    insertedCount: inserted.length,
    autoSwapped,
  };
}

// ---------------------------------------------------------------------------
// Reorder / delete / duplicate
// ---------------------------------------------------------------------------

/**
 * Moves the row at `from` to `to`, clamping `to` into range.
 *
 * Normalized when the row actually moves: a move changes the active character
 * downstream of both the source and the destination, which can strand a swap on
 * either side. A move onto its own index returns the input unchanged — the
 * sequence cannot change, so there is nothing to normalize.
 */
export function moveAction(rotation: Rotation, from: number, to: number): Rotation {
  if (from < 0 || from >= rotation.length) return rotation;
  const clamped = Math.min(Math.max(to, 0), rotation.length - 1);
  if (clamped === from) return rotation;
  const next = [...rotation];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return rotation;
  next.splice(clamped, 0, moved);
  return normalizeSwaps(next);
}

export function duplicateAction(rotation: Rotation, index: number): Rotation {
  const source = rotation[index];
  if (source === undefined) return rotation;
  const next = [...rotation];
  next.splice(index + 1, 0, { ...source });
  return normalizeSwaps(next);
}

/**
 * Deletes the row at `index`.
 *
 * Normalized: deleting the last action a swap served leaves that swap pointing
 * at whoever is next, which may already be active.
 */
export function deleteAction(rotation: Rotation, index: number): Rotation {
  if (index < 0 || index >= rotation.length) return rotation;
  return normalizeSwaps(rotation.filter((_, i) => i !== index));
}

/**
 * Clamps a selection index into a rotation whose length may have shrunk under
 * it — normalization can drop rows the caller had already counted.
 */
export function clampSelection(
  rotation: Rotation,
  index: number,
): number | null {
  if (rotation.length === 0) return null;
  return Math.min(Math.max(index, 0), rotation.length - 1);
}

/**
 * Where selection lands after deleting `index` (§14.4): the row that took the
 * deleted index, the new last row when the deleted row was last, or `null`
 * when the list is now empty.
 */
export function selectionAfterDelete(
  lengthAfterDelete: number,
  deletedIndex: number,
): number | null {
  if (lengthAfterDelete === 0) return null;
  return Math.min(deletedIndex, lengthAfterDelete - 1);
}

// ---------------------------------------------------------------------------
// Announcements (§14.8) — built here so the strings are testable.
// ---------------------------------------------------------------------------

/** 1-based step number, as every user-facing string in this component uses. */
function step(index: number): number {
  return index + 1;
}

export function describeAction(
  action: RotationAction,
  character: CharacterDefinition | undefined,
): string {
  const name = characterDisplayLabel(character);
  if (action.actionType === "swap") return `切至 ${name}`;
  return `${name} ${actionDisplayLabel(action.actionType)}`;
}

export function announceInsert(
  result: InsertResult,
  characterName: string,
  actionType: AddableActionType,
  swapCostSeconds: number,
): string {
  const actionLabel = actionDisplayLabel(actionType);
  if (result.autoSwapped) {
    return (
      `已插入 切至 ${characterName}（${formatSeconds(swapCostSeconds)} 秒）与 ` +
      `${characterName} ${actionLabel}，共 2 个动作。现共 ${result.rotation.length} 个动作。`
    );
  }
  return (
    `已在第 ${step(result.actionIndex)} 步插入 ${characterName} ${actionLabel}。` +
    `共 ${result.rotation.length} 个动作。`
  );
}

export function announceNudge(description: string, toIndex: number): string {
  return `${description} 已移动到第 ${step(toIndex)} 步。`;
}

export function announceMoveTo(
  description: string,
  fromIndex: number,
  toIndex: number,
): string {
  return `${description} 已从第 ${step(fromIndex)} 步移动到第 ${step(toIndex)} 步。`;
}

export function announceDuplicate(description: string, atIndex: number): string {
  return `已在第 ${step(atIndex)} 步复制 ${description}。`;
}

/**
 * Copying a swap row would produce a swap to the character that swap just put
 * on field, which §14.6 forbids. The edit is refused out loud, not silently.
 */
export function announceDuplicateNoOp(description: string): string {
  return `未复制 ${description}：该角色已在场上，重复的切人不会执行。`;
}

export function announceDelete(
  description: string,
  atIndex: number,
  remaining: number,
): string {
  return `已删除第 ${step(atIndex)} 步 ${description}。剩余 ${remaining} 个动作。`;
}

export const ANNOUNCE_CLEARED = "已清空动作序列。";

/**
 * Accessible name for an add button: it must state the destination, because
 * the insertion rule is the one thing a keyboard user cannot see (§14.4).
 */
export function addButtonAccessibleName(
  selectedIndex: number | null,
  characterName: string,
  actionType: AddableActionType,
  durationSeconds: number,
  energyCost: number | null,
): string {
  const where =
    selectedIndex === null
      ? "在序列末尾插入"
      : `在第 ${step(selectedIndex)} 步之后插入`;
  const energy = energyCost === null ? "" : `，消耗 ${energyCost} 点能量`;
  return (
    `${where} ${characterName} ${actionDisplayLabel(actionType)}，` +
    `耗时 ${formatSeconds(durationSeconds)} 秒${energy}`
  );
}

/** Label on the insertion rule itself. */
export function insertionRuleLabel(selectedIndex: number | null): string {
  return selectedIndex === null
    ? "插入位置 · 序列末尾"
    : `插入位置 · 第 ${step(selectedIndex)} 步之后`;
}
