"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { CharacterDefinition, Rotation } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { ElementTag } from "@/components/ui/ElementTag";
import { IconButton } from "@/components/ui/IconButton";
import { LiveRegion } from "@/components/ui/LiveRegion";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  CARD,
  DISABLED,
  FOCUS_RING,
  STATE_CHIP,
  STATE_TEXT,
  TOUCH_TARGET,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { charNameZh } from "@/lib/i18n";
import {
  ADDABLE_ACTION_TYPES,
  ANNOUNCE_CLEARED,
  actionBadgeGlyph,
  actionDisplayLabel,
  actionDuration,
  addButtonAccessibleName,
  announceDelete,
  announceDuplicate,
  announceDuplicateNoOp,
  announceInsert,
  announceMoveTo,
  announceNudge,
  characterDisplayLabel,
  clampSelection,
  deleteAction,
  describeAction,
  duplicateAction,
  formatSeconds,
  formatTotalSeconds,
  insertAction,
  insertionIndex,
  insertionRuleLabel,
  missingSwapIndexes,
  moveAction,
  rowTimings,
  selectionAfterDelete,
  summarizeRotation,
  type AddableActionType,
} from "./rotationEditing";

interface Props {
  rotation: Rotation;
  onRotationChange: (next: Rotation) => void;
  team: readonly (CharacterDefinition | null)[];
  /**
   * Effective cost of one swap, in seconds, from the run configuration
   * (§15.3/G4). Required, not defaulted: the editor must price a swap at
   * exactly what the engine will charge for it, and a default here would let a
   * caller silently re-open the drift this prop exists to close.
   */
  swapCost: number;
}

// Re-exported for existing consumers and tests; the implementations live in
// the pure editing module.
export { actionDisplayLabel, characterDisplayLabel };

/** Row height budget: `max-h-96` shows roughly a dozen rows (§14.3-B). */
const LIST_MAX_HEIGHT = "max-h-96";

type RowMenuState =
  | { readonly kind: "closed" }
  | { readonly kind: "menu"; readonly index: number }
  | { readonly kind: "moveTo"; readonly index: number }
  /**
   * A command that was refused, with the reason held open at the row it was
   * issued from. Without this the refusal reaches the live region only, so a
   * sighted user sees the menu close and nothing happen — a dead click.
   */
  | { readonly kind: "refused"; readonly index: number; readonly reason: string };

const CLOSED_MENU: RowMenuState = { kind: "closed" };

export function RotationEditor({
  rotation,
  onRotationChange,
  team,
  swapCost,
}: Props) {
  const activeMembers = useMemo(
    () => team.filter((c): c is CharacterDefinition => c !== null),
    [team],
  );
  const characterById = useMemo(
    () => new Map(activeMembers.map((c) => [c.id, c] as const)),
    [activeMembers],
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pendingCharId, setPendingCharId] = useState<string | null>(null);
  const [rowMenu, setRowMenu] = useState<RowMenuState>(CLOSED_MENU);
  const [moveToValue, setMoveToValue] = useState<string>("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const listRef = useRef<HTMLOListElement | null>(null);
  /** Row index that should receive DOM focus after the next commit. */
  const pendingFocusRef = useRef<number | null>(null);

  // Selection is an index into an array the parent owns; a shrinking rotation
  // must not leave it dangling past the end.
  useEffect(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      if (rotation.length === 0) return null;
      return Math.min(current, rotation.length - 1);
    });
  }, [rotation.length]);

  const pendingChar =
    activeMembers.find((c) => c.id === pendingCharId) ?? activeMembers[0];

  const timings = useMemo(
    () => rowTimings(rotation, characterById, swapCost),
    [rotation, characterById, swapCost],
  );
  const summary = useMemo(
    () => summarizeRotation(rotation, characterById, swapCost),
    [rotation, characterById, swapCost],
  );

  // Rows the sequence cannot reach because no swap puts their character on
  // field. Normalization is remove-only by design (§14.6), so this gap is
  // surfaced rather than silently repaired with an action the user never asked
  // for — the same honesty rule as the `未出战` chip (§14.7).
  const unreachableRows = useMemo(
    () => new Set(missingSwapIndexes(rotation)),
    [rotation],
  );

  const cursorIndex = insertionIndex(rotation, selectedIndex);

  const focusRow = useCallback((index: number) => {
    const row = listRef.current?.querySelector<HTMLLIElement>(
      `[data-row-index="${index}"]`,
    );
    row?.focus();
    row?.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target === null) return;
    pendingFocusRef.current = null;
    focusRow(target);
  }, [rotation, focusRow]);

  const commit = useCallback(
    (next: Rotation, nextSelected: number | null, message: string) => {
      onRotationChange(next);
      setSelectedIndex(nextSelected);
      setAnnouncement(message);
      setRowMenu(CLOSED_MENU);
      if (nextSelected !== null) pendingFocusRef.current = nextSelected;
    },
    [onRotationChange],
  );

  // -------------------------------------------------------------------------
  // Add
  // -------------------------------------------------------------------------

  function handleAdd(actionType: AddableActionType) {
    if (!pendingChar) return;
    const result = insertAction(rotation, cursorIndex, pendingChar, actionType);
    commit(
      result.rotation,
      result.actionIndex,
      announceInsert(result, charNameZh(pendingChar.name), actionType, swapCost),
    );
  }

  // -------------------------------------------------------------------------
  // Reorder / delete / duplicate
  // -------------------------------------------------------------------------

  function handleNudge(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rotation.length) return;
    const action = rotation[index];
    if (action === undefined) return;
    const next = moveAction(rotation, index, target);
    const landed = clampSelection(next, target);
    commit(
      next,
      landed,
      announceNudge(
        describeAction(action, characterById.get(action.characterId)),
        landed ?? target,
      ),
    );
  }

  function handleMoveTo(index: number) {
    const parsed = Number.parseInt(moveToValue, 10);
    if (!Number.isFinite(parsed)) return;
    const target = Math.min(Math.max(parsed - 1, 0), rotation.length - 1);
    const action = rotation[index];
    if (action === undefined) return;
    const next = moveAction(rotation, index, target);
    const landed = clampSelection(next, target);
    setMoveToValue("");
    commit(
      next,
      landed,
      announceMoveTo(
        describeAction(action, characterById.get(action.characterId)),
        index,
        landed ?? target,
      ),
    );
  }

  function handleDuplicate(index: number) {
    const action = rotation[index];
    if (action === undefined) return;
    const next = duplicateAction(rotation, index);
    const description = describeAction(action, characterById.get(action.characterId));
    // A duplicated swap is a no-op swap and is normalized away (§14.6); say so
    // rather than announce a copy the list does not contain. The reason is both
    // announced AND held open at the row, so the refusal is not screen-reader-only.
    if (next.length === rotation.length) {
      const reason = announceDuplicateNoOp(description);
      setAnnouncement(reason);
      setRowMenu({ kind: "refused", index, reason });
      return;
    }
    commit(next, clampSelection(next, index + 1), announceDuplicate(description, index + 1));
  }

  function handleDelete(index: number) {
    const action = rotation[index];
    if (action === undefined) return;
    const next = deleteAction(rotation, index);
    commit(
      next,
      selectionAfterDelete(next.length, index),
      announceDelete(
        describeAction(action, characterById.get(action.characterId)),
        index,
        next.length,
      ),
    );
  }

  function handleClear() {
    onRotationChange([]);
    setSelectedIndex(null);
    setConfirmingClear(false);
    setRowMenu(CLOSED_MENU);
    setAnnouncement(ANNOUNCE_CLEARED);
  }

  // -------------------------------------------------------------------------
  // Keyboard (§14.8)
  // -------------------------------------------------------------------------

  function handleRowKeyDown(event: ReactKeyboardEvent<HTMLLIElement>, index: number) {
    const { key, altKey } = event;

    if (altKey && (key === "ArrowUp" || key === "ArrowDown")) {
      event.preventDefault();
      handleNudge(index, key === "ArrowUp" ? -1 : 1);
      return;
    }

    switch (key) {
      case "ArrowUp":
      case "ArrowDown": {
        event.preventDefault();
        const target = index + (key === "ArrowUp" ? -1 : 1);
        if (target < 0 || target >= rotation.length) return;
        setSelectedIndex(target);
        focusRow(target);
        return;
      }
      case "Home":
      case "End": {
        event.preventDefault();
        const target = key === "Home" ? 0 : rotation.length - 1;
        setSelectedIndex(target);
        focusRow(target);
        return;
      }
      case "Delete":
      case "Backspace":
        event.preventDefault();
        handleDelete(index);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        setSelectedIndex((current) => (current === index ? null : index));
        return;
      case "Escape":
        event.preventDefault();
        setSelectedIndex(null);
        setRowMenu(CLOSED_MENU);
        return;
      default:
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const hasTeam = activeMembers.length > 0;
  const rovingIndex = selectedIndex ?? 0;

  return (
    <div className={cn(CARD, "flex flex-col gap-4 p-4 text-sm")}>
      <LiveRegion message={announcement} />

      {/* A — Header ------------------------------------------------------ */}
      <div className="flex flex-col gap-2 border-b border-surface-border/60 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200">动作序列编排</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono tabular-nums">
                共 {summary.actionCount} 个动作
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {summary.totalSeconds === null
                  ? "总时长 —（全部动作失效）"
                  : summary.orphanCount > 0
                    ? `总时长 ${formatTotalSeconds(summary.totalSeconds)} 秒（不含 ${summary.orphanCount} 个失效动作）`
                    : `总时长 ${formatTotalSeconds(summary.totalSeconds)} 秒`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {summary.swapCount} 次切人 {formatTotalSeconds(summary.swapSeconds)} 秒
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-micro font-medium",
                  STATE_CHIP.info,
                )}
              >
                <span aria-hidden="true">◇</span>
                编排时长为估算值，实际时长以模拟结果为准。
              </span>
            </p>
          </div>

          {rotation.length > 0 &&
            (confirmingClear ? (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 rounded-sm border px-2 py-1 text-xs",
                  STATE_CHIP.warning,
                )}
              >
                <span>确认清空 {rotation.length} 个动作？</span>
                <Button size="sm" variant="secondary" onClick={handleClear}>
                  确认
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  autoFocus
                  onClick={() => setConfirmingClear(false)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="quiet" onClick={() => setConfirmingClear(true)}>
                清空序列
              </Button>
            ))}
        </div>

        {summary.orphanCount > 0 && (
          <p className={cn("text-xs", STATE_TEXT.warning)}>
            {summary.orphanCount} 个动作引用了已不在队伍中的角色，这些动作不会执行。
          </p>
        )}
      </div>

      {/* B — The one sequence list --------------------------------------- */}
      {!hasTeam ? (
        <div
          className={cn(
            "rounded-sm border border-dashed p-6 text-center text-xs",
            STATE_CHIP.info,
          )}
        >
          请先在上方「队伍阵容配置」中选择至少一位角色，然后在这里编排他们的动作。
        </div>
      ) : rotation.length === 0 ? (
        <div className="space-y-2 rounded-sm border border-dashed border-surface-border p-6 text-center text-sm text-slate-400">
          <p>尚未编排任何动作。</p>
          <p>从下方选择角色与技能，动作会依次加入序列。</p>
          <p>
            切换角色时会自动插入「切人」动作，切人耗时{" "}
            <span className="font-mono tabular-nums">
              {formatSeconds(swapCost)}
            </span>{" "}
            秒，同样计入总时长。
          </p>
        </div>
      ) : (
        <ol
          ref={listRef}
          className={cn("space-y-1.5 overflow-y-auto pr-1", LIST_MAX_HEIGHT)}
        >
          {rotation.map((action, index) => {
            const character = characterById.get(action.characterId);
            const isOrphaned = character === undefined;
            const isUnreachable = unreachableRows.has(index);
            const isSelected = selectedIndex === index;
            const timing = timings[index];
            const duration = timing?.duration ?? null;
            const displayName = characterDisplayLabel(character);
            const label =
              action.actionType === "swap"
                ? `切至 ${displayName}`
                : actionDisplayLabel(action.actionType);
            const menuOpen = rowMenu.kind !== "closed" && rowMenu.index === index;

            return (
              <li
                key={index}
                data-row-index={index}
                tabIndex={index === rovingIndex ? 0 : -1}
                aria-current={isSelected ? "true" : undefined}
                onClick={() =>
                  setSelectedIndex((current) => (current === index ? null : index))
                }
                onKeyDown={(event) => handleRowKeyDown(event, index)}
                className={cn(
                  "cursor-pointer rounded-sm border border-surface-border bg-surface px-3 py-2 text-xs",
                  TRANSITION_COLORS,
                  FOCUS_RING,
                  isSelected && "border-cyan-300/70 bg-cyan-300/10",
                )}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  {/* Line 1 at <640px: #N · time · character · action */}
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="w-8 shrink-0 font-mono text-micro tabular-nums text-slate-400">
                      #{index + 1}
                    </span>
                    <span className="w-12 shrink-0 font-mono text-micro tabular-nums text-slate-400">
                      {timing ? `${formatSeconds(timing.startTime)}s` : "—"}
                    </span>

                    {isOrphaned ? (
                      <span className={cn("truncate text-micro", STATE_TEXT.warning)}>
                        {action.characterId}
                      </span>
                    ) : (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <ElementTag element={character.element} />
                        <span className="truncate font-semibold text-slate-200">
                          {displayName}
                        </span>
                      </span>
                    )}

                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-micro font-bold text-slate-400"
                    >
                      {actionBadgeGlyph(action.actionType)}
                    </span>
                    <span className="truncate text-slate-300">{label}</span>
                  </div>

                  {/* Line 2 at <640px: duration · chips · [⋯] */}
                  <div className="flex shrink-0 items-center justify-end gap-1.5">
                    <span className="font-mono text-micro tabular-nums text-slate-400">
                      {duration === null ? "—" : `${formatSeconds(duration)}s`}
                    </span>

                    {isOrphaned && (
                      <>
                        <StatusChip state="warning">未出战</StatusChip>
                        <span
                          className={cn("hidden text-micro sm:inline", STATE_TEXT.warning)}
                        >
                          该角色已不在队伍中，此动作不会执行。
                        </span>
                      </>
                    )}

                    {!isOrphaned && isUnreachable && (
                      <>
                        <StatusChip state="warning">未切换</StatusChip>
                        <span
                          className={cn("hidden text-micro sm:inline", STATE_TEXT.warning)}
                        >
                          此动作前缺少切人，该角色当时不在场上。
                        </span>
                      </>
                    )}

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNudge(index, -1);
                      }}
                      className={cn(
                        "hidden rounded-sm border border-surface-border px-1.5 py-1 text-micro text-slate-400 hover:bg-surface-hover lg:inline-block",
                        TRANSITION_COLORS,
                        FOCUS_RING,
                        DISABLED,
                      )}
                      aria-label={`将第 ${index + 1} 步上移一位`}
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      disabled={index === rotation.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNudge(index, 1);
                      }}
                      className={cn(
                        "hidden rounded-sm border border-surface-border px-1.5 py-1 text-micro text-slate-400 hover:bg-surface-hover lg:inline-block",
                        TRANSITION_COLORS,
                        FOCUS_RING,
                        DISABLED,
                      )}
                      aria-label={`将第 ${index + 1} 步下移一位`}
                    >
                      下移
                    </button>

                    <IconButton
                      label={`第 ${index + 1} 步操作`}
                      glyph="⋯"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRowMenu(menuOpen ? CLOSED_MENU : { kind: "menu", index });
                        setMoveToValue(String(index + 1));
                      }}
                    />
                  </div>
                </div>

                {menuOpen && (
                  <div
                    className="mt-2 flex flex-col gap-1 rounded-sm border border-surface-border bg-surface-raised p-2"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    {/* Below 640px the in-row reason sentence does not fit, so the
                        chip's reason lives here instead. The reason must be
                        reachable at every width — a chip whose only explanation is
                        an off-screen sentence is tooltip-as-sole-source (§14.7). */}
                    {isOrphaned && (
                      <p className={cn("text-micro sm:hidden", STATE_TEXT.warning)}>
                        该角色已不在队伍中，此动作不会执行。
                      </p>
                    )}
                    {!isOrphaned && isUnreachable && (
                      <p className={cn("text-micro sm:hidden", STATE_TEXT.warning)}>
                        此动作前缺少切人，该角色当时不在场上。
                      </p>
                    )}
                    {/* A refused command explains itself where it was issued, at
                        every width — the live region alone would leave a sighted
                        user with a dead click. */}
                    {rowMenu.kind === "refused" && rowMenu.index === index && (
                      <p className={cn("text-micro", STATE_TEXT.info)}>
                        {rowMenu.reason}
                      </p>
                    )}
                    <RowMenuItem
                      label="上移一位"
                      hint="Alt+↑"
                      disabled={index === 0}
                      disabledReason="已是第一步"
                      onClick={() => handleNudge(index, -1)}
                    />
                    <RowMenuItem
                      label="下移一位"
                      hint="Alt+↓"
                      disabled={index === rotation.length - 1}
                      disabledReason="已是最后一步"
                      onClick={() => handleNudge(index, 1)}
                    />
                    {rowMenu.kind === "moveTo" ? (
                      <div className="flex items-center gap-1.5">
                        <label
                          className="text-micro text-slate-400"
                          htmlFor={`move-to-${index}`}
                        >
                          移动到第 … 步
                        </label>
                        <input
                          id={`move-to-${index}`}
                          type="number"
                          min={1}
                          max={rotation.length}
                          value={moveToValue}
                          onChange={(event) => setMoveToValue(event.target.value)}
                          className={cn(
                            "w-16 rounded-sm border border-surface-border bg-surface px-2 py-1 font-mono text-micro tabular-nums text-slate-200",
                            FOCUS_RING,
                          )}
                        />
                        <Button size="sm" onClick={() => handleMoveTo(index)}>
                          确认
                        </Button>
                      </div>
                    ) : (
                      <RowMenuItem
                        label="移动到第 … 步"
                        onClick={() => setRowMenu({ kind: "moveTo", index })}
                      />
                    )}
                    <RowMenuItem
                      label="在下方复制此步"
                      onClick={() => handleDuplicate(index)}
                    />
                    <div className="my-1 border-t border-surface-border" />
                    <RowMenuItem
                      label="删除此步"
                      hint="Delete"
                      onClick={() => handleDelete(index)}
                    />
                  </div>
                )}

                {/* The insertion rule sits below the selected row (§14.2). */}
                {selectedIndex === index && (
                  <InsertionRule selectedIndex={selectedIndex} />
                )}
              </li>
            );
          })}

          {selectedIndex === null && (
            <li aria-hidden="true">
              <InsertionRule selectedIndex={null} />
            </li>
          )}
        </ol>
      )}

      {/* C — Add bar ----------------------------------------------------- */}
      {hasTeam && (
        <div className="space-y-2.5 rounded-sm border border-surface-border bg-surface p-3 text-xs">
          <h4 className="text-xs font-semibold text-slate-300">添加到插入位置</h4>

          <div className="flex flex-wrap items-center gap-1.5">
            {activeMembers.map((c) => {
              const active = c.id === pendingChar?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPendingCharId(c.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    TOUCH_TARGET,
                    active
                      ? "border-cyan-300/70 bg-cyan-300/10 font-semibold text-slate-100"
                      : "border-surface-border bg-surface-raised text-slate-400 hover:text-slate-200",
                  )}
                >
                  <ElementTag element={c.element} />
                  <span>{charNameZh(c.name)}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center">
            {ADDABLE_ACTION_TYPES.map((actionType) => {
              if (!pendingChar) {
                return (
                  <Button key={actionType} size="sm" disabled>
                    {actionBadgeGlyph(actionType)} {actionDisplayLabel(actionType)}
                  </Button>
                );
              }
              const duration =
                actionDuration(
                  { characterId: pendingChar.id, actionType },
                  pendingChar,
                  swapCost,
                ) ?? 0;
              const energy = actionType === "burst" ? pendingChar.maxEnergy : null;
              return (
                <Button
                  key={actionType}
                  size="sm"
                  onClick={() => handleAdd(actionType)}
                  aria-label={addButtonAccessibleName(
                    selectedIndex,
                    charNameZh(pendingChar.name),
                    actionType,
                    duration,
                    energy,
                  )}
                >
                  <span className="font-mono tabular-nums">
                    {actionBadgeGlyph(actionType)} {actionDisplayLabel(actionType)}{" "}
                    {formatSeconds(duration)}s
                    {energy === null ? "" : ` · ${energy}能`}
                  </span>
                </Button>
              );
            })}
          </div>

          {!pendingChar && (
            <p className={cn("text-micro", STATE_TEXT.warning)}>请先选择一位角色</p>
          )}

          <p className="text-micro text-slate-400">
            切换角色时会自动插入「切人」动作，耗时{" "}
            <span className="font-mono tabular-nums">
              {formatSeconds(swapCost)}
            </span>{" "}
            秒。
          </p>
        </div>
      )}
    </div>
  );
}

function InsertionRule({ selectedIndex }: { selectedIndex: number | null }) {
  return (
    <div aria-hidden="true" className="mt-2 flex items-center gap-2">
      <span className={cn("shrink-0 text-micro", STATE_TEXT.info)}>
        {insertionRuleLabel(selectedIndex)}
      </span>
      <span className="h-px flex-1 bg-state-info-border" />
    </div>
  );
}

interface RowMenuItemProps {
  label: string;
  hint?: string;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
}

function RowMenuItem({
  label,
  hint,
  disabled = false,
  disabledReason,
  onClick,
}: RowMenuItemProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "flex flex-1 items-center justify-between gap-3 rounded-sm px-2 py-1 text-left text-micro text-slate-300 hover:bg-surface-hover",
          TRANSITION_COLORS,
          FOCUS_RING,
          DISABLED,
        )}
      >
        <span>{label}</span>
        {hint && (
          <span className="font-mono text-micro text-slate-400" aria-hidden="true">
            {hint}
          </span>
        )}
      </button>
      {disabled && disabledReason && (
        <span className="text-micro text-slate-400">{disabledReason}</span>
      )}
    </div>
  );
}
