"use client";

import { useId } from "react";
import type { Element, EnemyState } from "@/types";
import { cn } from "@/components/ui/cn";
import {
  CARD,
  FOCUS_RING,
  TOUCH_TARGET,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { fmtPercent } from "@/lib/format";
import { previewMitigation } from "@/features/simulation/simulationAdapter";

import { enemyNameZh } from "@/lib/i18n";

interface Props {
  enemy: EnemyState;
  onChange: (next: EnemyState) => void;
  /**
   * Character level the mitigation preview is computed against. Rendered
   * beside the number, because the DEF multiplier depends on it and a preview
   * that assumed a level silently would present an assumption as a result.
   * `null` (empty team) hides the preview rather than guessing a level.
   */
  referenceLevel: number | null;
}

const RES_PRESETS: readonly { label: string; value: number }[] = [
  { label: "标准抗性 (10%)", value: 0.1 },
  { label: "无抗性 / 减抗后 (0%)", value: 0.0 },
  { label: "中高抗性 (30%)", value: 0.3 },
  { label: "首领高抗 (70%)", value: 0.7 },
];

export function EnemyConfigurator({ enemy, onChange, referenceLevel }: Props) {
  const levelId = useId();
  const currentBaseRes = enemy.resistances.pyro ?? 0.1;

  // Mitigation preview comes from the ENGINE's own formulas via the adapter.
  // Inlining them here would be a second implementation of damage math in the
  // UI that could drift from the engine with nothing failing (finding H5).
  // `referenceLevel` is supplied by the caller from real team data, so the
  // level this preview assumes is shown to the user rather than hardcoded.
  const mitigation =
    referenceLevel === null
      ? null
      : previewMitigation(referenceLevel, enemy.level, currentBaseRes);

  function handleLevelChange(level: number) {
    const clamped = Math.max(1, Math.min(110, Math.round(level)));
    onChange({
      ...enemy,
      level: clamped,
    });
  }

  function handleResPreset(value: number) {
    const nextRes: Partial<Record<Element, number>> = {
      pyro: value,
      hydro: value,
      electro: value,
      cryo: value,
      anemo: value,
      geo: value,
      dendro: value,
      physical: value,
    };
    onChange({
      ...enemy,
      resistances: nextRes,
    });
  }

  return (
    <div className={cn(CARD, "flex flex-col gap-3 p-4 text-sm")}>
      <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          目标敌人属性
        </h3>
        <span className="font-mono text-xs text-slate-400">
          等级 {enemy.level} · 全抗性 {fmtPercent(currentBaseRes)}
        </span>
      </div>

      <div className="space-y-3">
        {/* Enemy Name & Basic Info */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-200">{enemyNameZh(enemy.name)}</span>
          <span className="text-xs text-slate-400">单目标木桩</span>
        </div>

        {/* Zone 1 — inputs (§15.4/N1). The rule matches the derived zone's, so
            the enemy name line above reads as a card-identity band rather than
            as the head of this zone: three bands, symmetric boundaries. */}
        <div className="border-t border-surface-border pt-3">
          <p className="text-micro text-slate-400">场景输入</p>
        </div>

        {/* Level input */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <label htmlFor={levelId} className="text-slate-300">
            敌人等级:
          </label>
          <div className="flex items-center gap-1.5 font-mono">
            <button
              type="button"
              onClick={() => handleLevelChange(enemy.level - 5)}
              className={cn(
                "h-7 w-7 rounded-sm border border-surface-border bg-surface text-center hover:bg-surface-hover",
                TOUCH_TARGET,
                TRANSITION_COLORS,
                FOCUS_RING,
              )}
              aria-label="降低等级 5 级"
            >
              -
            </button>
            <input
              id={levelId}
              type="number"
              min={1}
              max={110}
              value={enemy.level}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className={cn(
                "h-7 w-16 rounded-sm border border-surface-border bg-surface text-center text-slate-200",
                FOCUS_RING,
              )}
            />
            <button
              type="button"
              onClick={() => handleLevelChange(enemy.level + 5)}
              className={cn(
                "h-7 w-7 rounded-sm border border-surface-border bg-surface text-center hover:bg-surface-hover",
                TOUCH_TARGET,
                TRANSITION_COLORS,
                FOCUS_RING,
              )}
              aria-label="提升等级 5 级"
            >
              +
            </button>
          </div>
        </div>

        {/* Resistance presets */}
        <div className="space-y-1.5 text-xs">
          <span className="text-slate-300">基础元素抗性预设:</span>
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            {RES_PRESETS.map((preset) => {
              const active = Math.abs(currentBaseRes - preset.value) < 1e-4;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleResPreset(preset.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-left text-micro",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    active
                      ? "border-amber-500 bg-amber-500/15 font-semibold text-amber-400"
                      : "border-surface-border bg-surface text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone 2 — derived readout (§15.4/N1). The label is the fix for E4:
            it states that this is a result, not a fourth control. It keeps its
            place in the empty-team state so the structure does not shift when a
            team arrives (N6). */}
        <div className="border-t border-surface-border pt-3">
          <p className="mb-1.5 text-micro text-slate-400">由上述输入推导</p>

        {/* Enemy mitigation preview — engine formulas via the adapter. */}
        {mitigation === null ? (
          <p className="rounded-sm border border-surface-border bg-surface p-2.5 text-micro text-slate-400">
            添加角色后显示承伤率（防御乘区取决于角色等级）。
          </p>
        ) : (
          <div className="rounded-sm border border-surface-border bg-surface p-2.5 space-y-1.5 text-micro">
            <div className="flex items-center justify-between text-slate-300">
              <span>对 {referenceLevel} 级角色综合承伤率:</span>
              <span className="font-mono font-semibold text-amber-400">
                {fmtPercent(mitigation.totalMultiplier)}
              </span>
            </div>
            {/* N5 — decorative; the percentage above is the accessible value. */}
            <div
              aria-hidden="true"
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised"
            >
              <div
                className="h-full bg-cyan-300"
                style={{
                  width: `${Math.min(100, Math.max(0, mitigation.totalMultiplier * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>防御乘区承伤: {fmtPercent(mitigation.defMultiplier)}</span>
              <span>抗性乘区承伤: {fmtPercent(mitigation.resMultiplier)}</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
