"use client";

import { useState } from "react";
import type { ActionType, CharacterDefinition, Rotation, RotationAction } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { ElementTag } from "@/components/ui/ElementTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { CARD, DISABLED, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { ROTATION_PRESETS, type RotationPreset } from "@/game-data";
import { charNameZh } from "@/lib/i18n";

interface Props {
  rotation: Rotation;
  onRotationChange: (next: Rotation) => void;
  team: readonly (CharacterDefinition | null)[];
}

const ACTION_LABELS: Record<ActionType, { short: string; label: string }> = {
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

export function characterDisplayLabel(
  character: CharacterDefinition | null | undefined,
): string {
  return character ? charNameZh(character.name) : "未知角色";
}

export function RotationEditor({ rotation, onRotationChange, team }: Props) {
  const activeMembers = team.filter((c): c is CharacterDefinition => c !== null);
  const teamMemberIds = new Set(activeMembers.map((c) => c.id));

  // Quick Action Builder state
  const [selectedCharId, setSelectedCharId] = useState<string>(
    activeMembers[0]?.id ?? "",
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Sync selected character if current selection was removed
  const currentChar =
    activeMembers.find((c) => c.id === selectedCharId) ?? activeMembers[0];

  // Track active preset if rotation matches one
  const matchedPreset = ROTATION_PRESETS.find(
    (p) =>
      p.rotation.length === rotation.length &&
      p.rotation.every(
        (a, i) =>
          a.characterId === rotation[i]?.characterId &&
          a.actionType === rotation[i]?.actionType &&
          a.abilityId === rotation[i]?.abilityId,
      ),
  );

  function handlePresetSelect(preset: RotationPreset) {
    onRotationChange([...preset.rotation]);
    setHighlightedIndex(null);
  }

  function handleMoveAction(index: number, direction: -1 | 1) {
    const next = [...rotation];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index]!;
    next[index] = next[target]!;
    next[target] = temp;
    onRotationChange(next);
    setHighlightedIndex(target);
  }

  function handleDeleteAction(index: number) {
    const next = rotation.filter((_, i) => i !== index);
    onRotationChange(next);
    if (highlightedIndex === index) setHighlightedIndex(null);
  }

  function handleQuickAdd(actionType: ActionType) {
    if (!currentChar) return;

    let abilityId: string | undefined;
    if (actionType === "skill") abilityId = currentChar.elementalSkill.id;
    else if (actionType === "burst") abilityId = currentChar.elementalBurst.id;
    else if (actionType === "normal") abilityId = currentChar.normalAttack.id;
    else if (actionType === "charged") abilityId = currentChar.chargedAttack.id;

    const newAction: RotationAction = {
      characterId: currentChar.id,
      actionType,
      ...(abilityId ? { abilityId } : {}),
    };

    onRotationChange([...rotation, newAction]);
    setHighlightedIndex(rotation.length);
  }

  return (
    <div className={cn(CARD, "flex flex-col gap-4 p-4 text-sm")}>
      {/* Header & Preset Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            动作序列编排
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            已编排 <span className="font-mono tabular-nums font-semibold text-slate-200">{rotation.length}</span> 个动作 · 点击下方技能快速追加
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400">预设方案:</span>
          {ROTATION_PRESETS.map((preset) => {
            const isSelected = matchedPreset?.id === preset.id;
            return (
              <Button
                key={preset.id}
                size="sm"
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.name}
              </Button>
            );
          })}
          {rotation.length > 0 && (
            <Button
              size="sm"
              variant="quiet"
              onClick={() => onRotationChange([])}
            >
              清空
            </Button>
          )}
        </div>
      </div>

      {/* Visual Rotation Sequence Ribbon */}
      {rotation.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-400">
            当前动作时序
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin font-mono">
            {rotation.map((action, index) => {
              const char = activeMembers.find((c) => c.id === action.characterId);
              const isSelected = highlightedIndex === index;
              const meta = ACTION_LABELS[action.actionType] ?? { short: "?", label: "未知动作" };
              const displayName = characterDisplayLabel(char);
              const elemBorder =
                char?.element === "pyro"
                  ? "border-red-500/50 bg-red-950/30 text-red-300"
                  : char?.element === "hydro"
                    ? "border-sky-500/50 bg-sky-950/30 text-sky-300"
                    : char?.element === "electro"
                      ? "border-purple-500/50 bg-purple-950/30 text-purple-300"
                      : char?.element === "anemo"
                        ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                        : "border-surface-border bg-surface text-slate-300";

              return (
                <div key={index} className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHighlightedIndex(index === highlightedIndex ? null : index)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs transition-colors duration-150",
                      elemBorder,
                      isSelected && "ring-2 ring-amber-400 shadow-md font-bold scale-105",
                      "hover:scale-102",
                    )}
                    title={`第 ${index + 1} 步: ${meta.label} (${displayName})`}
                  >
                    <span className="text-micro opacity-60">#{index + 1}</span>
                    <span className="font-bold">{meta.short}</span>
                    <span className="text-micro opacity-90">{displayName}</span>
                  </button>
                  {index < rotation.length - 1 && (
                    <span className="text-micro text-slate-400" aria-hidden="true">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action List */}
      {rotation.length === 0 ? (
        <div className="rounded-md border border-dashed border-surface-border p-6 text-center text-xs text-slate-400 font-mono">
          <p>当前循环序列为空。请在上方选择预设方案，或点击下方快捷按钮追加动作。</p>
        </div>
      ) : (
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {rotation.map((action, index) => {
            const character = activeMembers.find((c) => c.id === action.characterId);
            const isOrphaned = !teamMemberIds.has(action.characterId);
            const isHighlighted = highlightedIndex === index;
            const meta = ACTION_LABELS[action.actionType] ?? { short: "?", label: "未知动作" };
            const displayName = characterDisplayLabel(character);

            let abilityName = actionDisplayLabel(action.actionType);
            let castTime = "0.50秒";
            if (character) {
              if (action.actionType === "skill") {
                castTime = `${character.elementalSkill.castTime.toFixed(2)}秒`;
              } else if (action.actionType === "burst") {
                castTime = `${character.elementalBurst.castTime.toFixed(2)}秒`;
              } else if (action.actionType === "normal") {
                castTime = `${character.normalAttack.castTime.toFixed(2)}秒`;
              } else if (action.actionType === "charged") {
                castTime = `${character.chargedAttack.castTime.toFixed(2)}秒`;
              } else if (action.actionType === "swap") {
                abilityName = `切换至 ${displayName}`;
                castTime = "0.60秒";
              }
            }

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border border-surface-border bg-surface px-3 py-1.5 text-xs transition-colors",
                  isOrphaned && "border-amber-500/50 bg-amber-500/5",
                  isHighlighted && "border-amber-400 bg-amber-500/10",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-6 font-mono text-micro text-slate-400">
                    #{index + 1}
                  </span>

                  {/* Action type badge */}
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm font-mono text-micro font-bold",
                      action.actionType === "skill" && "bg-amber-500/20 text-amber-400",
                      action.actionType === "burst" && "bg-indigo-500/20 text-indigo-300",
                      action.actionType === "swap" && "bg-slate-700 text-slate-300",
                      (action.actionType === "normal" || action.actionType === "charged") &&
                        "bg-slate-800 text-slate-400",
                    )}
                    title={meta.label}
                  >
                    {meta.short}
                  </span>

                  {/* Character & Element */}
                  {character ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <ElementTag element={character.element} />
                      <span className="truncate font-medium text-slate-200">
                        {displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="truncate text-micro text-amber-400">
                      配置中的角色 ID 无法匹配
                    </span>
                  )}

                  {/* Ability Name & Cast duration */}
                  <span className="truncate text-micro text-slate-400">
                    {abilityName}
                  </span>
                  <span className="hidden font-mono text-micro text-slate-400 sm:inline-block">
                    ({castTime})
                  </span>
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex shrink-0 items-center gap-1">
                  {isOrphaned && (
                    <StatusChip state="warning">未出战</StatusChip>
                  )}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveAction(index, -1)}
                    className={cn(
                      "h-6 w-6 rounded-sm border border-surface-border text-center hover:bg-surface-hover",
                      TRANSITION_COLORS,
                      FOCUS_RING,
                      DISABLED,
                    )}
                    aria-label={`将第 ${index + 1} 个动作上移`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === rotation.length - 1}
                    onClick={() => handleMoveAction(index, 1)}
                    className={cn(
                      "h-6 w-6 rounded-sm border border-surface-border text-center hover:bg-surface-hover",
                      TRANSITION_COLORS,
                      FOCUS_RING,
                      DISABLED,
                    )}
                    aria-label={`将第 ${index + 1} 个动作下移`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAction(index)}
                    className={cn(
                      "h-6 w-6 rounded-sm border border-surface-border text-center text-slate-400 hover:text-red-400 hover:bg-surface-hover",
                      TRANSITION_COLORS,
                      FOCUS_RING,
                    )}
                    aria-label={`删除第 ${index + 1} 个动作`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rapid Action Palette */}
      {activeMembers.length > 0 && currentChar && (
        <div className="rounded-md border border-surface-border bg-surface p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="font-semibold text-slate-300">快捷追加动作到循环轴:</span>
            <span className="text-micro text-slate-400">点击按钮即可立即追加至轴末尾</span>
          </div>

          {/* Character selector pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activeMembers.map((c) => {
              const active = c.id === currentChar.id;
              const name = charNameZh(c.name);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCharId(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-sm border px-2 py-1 transition-colors duration-150 font-mono",
                    active
                      ? "border-amber-400 bg-amber-500/15 font-semibold text-amber-300"
                      : "border-surface-border bg-surface-raised text-slate-400 hover:text-slate-200",
                  )}
                >
                  <ElementTag element={c.element} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons for currently selected character */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd("skill")}
              title={`施放 ${ACTION_LABELS.skill.label} (耗时 ${currentChar.elementalSkill.castTime.toFixed(2)}秒)`}
            >
              [E] 元素战技 ({currentChar.elementalSkill.castTime.toFixed(2)}秒)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd("burst")}
              title={`施放 ${ACTION_LABELS.burst.label} (耗时 ${currentChar.elementalBurst.castTime.toFixed(2)}秒, 消耗 ${currentChar.maxEnergy} 能量)`}
            >
              [Q] 元素爆发 ({currentChar.elementalBurst.castTime.toFixed(2)}秒 · {currentChar.maxEnergy}能)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd("normal")}
              title={`施放 ${ACTION_LABELS.normal.label}`}
            >
              [普] 普通攻击
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd("charged")}
              title={`施放 ${ACTION_LABELS.charged.label}`}
            >
              [重] 重击
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd("swap")}
              title={`切换至 ${charNameZh(currentChar.name)} 登场`}
            >
              [⇄] 切人登场
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
