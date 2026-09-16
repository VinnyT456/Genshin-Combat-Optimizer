"use client";

import type { SimulationConfig } from "@/types";
import { cn } from "@/components/ui/cn";
import { StatusChip } from "@/components/ui/StatusChip";
import { CARD, FOCUS_RING, TOUCH_TARGET, TRANSITION_COLORS } from "@/components/ui/tokens";
import {
  DEFAULT_EDITOR_SWAP_COST_SECONDS,
  formatSeconds,
} from "./rotationEditing";

interface Props {
  config: Partial<SimulationConfig>;
  onChange: (next: Partial<SimulationConfig>) => void;
}

type CritMode = "expected" | "always" | "never";

const DEFAULT_CRIT_MODE: CritMode = "expected";

/** Float comparison tolerance for matching a preset to the configured value. */
const PRESET_EPSILON = 1e-4;

const CRIT_MODES: readonly { mode: CritMode; label: string; desc: string }[] = [
  { mode: "expected", label: "期望暴击", desc: "基于暴击率与暴击伤害计算理论数学期望" },
  { mode: "always", label: "必定暴击", desc: "强制每一次命中均触发暴击" },
  { mode: "never", label: "绝不暴击", desc: "仅计算基底未暴击伤害" },
];

const SWAP_COSTS: readonly { label: string; value: number }[] = [
  { label: "0.4秒 (极速)", value: 0.4 },
  { label: "0.6秒 (默认)", value: DEFAULT_EDITOR_SWAP_COST_SECONDS },
  { label: "0.8秒 (高延迟)", value: 0.8 },
];

/** One shared selected-option treatment across the whole section (§15.4/N4). */
function optionClass(active: boolean): string {
  return cn(
    "rounded-sm border px-2 py-1.5 text-center text-micro font-medium",
    TOUCH_TARGET,
    TRANSITION_COLORS,
    FOCUS_RING,
    active
      ? "border-amber-500 bg-amber-500/15 font-bold text-amber-400"
      : "border-surface-border bg-surface text-slate-400 hover:border-slate-600 hover:text-slate-200",
  );
}

/**
 * Section-wide calculation rules (COMPONENTS §15.3).
 *
 * `critMode` and `swapCost` rewrite EVERY number on the page — the editor's
 * 总时长, the headline DPS, the timeline, the breakdown and every search
 * candidate. They previously rendered as a sidebar card, where position read
 * them as settings for the neighbouring enemy panel (§15.1/E1). The scope line
 * is therefore not decorative copy: it is the component's whole point (G1).
 *
 * Same `Partial<SimulationConfig>` in / `onChange` out contract as the
 * `SimulationSettings` card it replaces — a relocation, not a new capability.
 */
export function GlobalRulesBar({ config, onChange }: Props) {
  const currentCritMode: CritMode = config.critMode ?? DEFAULT_CRIT_MODE;
  const currentSwapCost = config.swapCost ?? DEFAULT_EDITOR_SWAP_COST_SECONDS;

  const critModeIsDefault = currentCritMode === DEFAULT_CRIT_MODE;
  const swapCostIsDefault =
    Math.abs(currentSwapCost - DEFAULT_EDITOR_SWAP_COST_SECONDS) < PRESET_EPSILON;

  const activeCritMode = CRIT_MODES.find((m) => m.mode === currentCritMode);

  return (
    <div className={cn(CARD, "flex flex-col gap-3 p-3 text-sm")}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-surface-border/60 pb-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-slate-200">全局计算规则</h3>
          {/* G1 — scope is stated, not implied. Renders unconditionally, and
              directly UNDER the heading: right-aligned at the far edge of a
              1200px bar it read as a caption rather than as the component's
              thesis. This is a position change only — size and colour are
              unchanged. */}
          <span className="text-micro text-slate-400">影响本页所有伤害与时长数值</span>
        </div>

        {/* Non-default is MARKED, never blocked: both are legitimate tools, but
            a number produced under them must never read as a default-run
            number. */}
        {(!critModeIsDefault || !swapCostIsDefault) && (
          <div className="flex flex-wrap justify-end gap-2">
            {!critModeIsDefault && activeCritMode !== undefined && (
              <StatusChip state="info">
                当前为「{activeCritMode.label}」，结果并非期望值。
              </StatusChip>
            )}
            {!swapCostIsDefault && (
              <StatusChip state="info">
                切人耗时已调整为{" "}
                {/* Same `formatSeconds` the editor header uses for this exact
                    concept — one concept, one rendering. */}
                <span className="font-mono tabular-nums">
                  {formatSeconds(currentSwapCost)}
                </span>{" "}
                秒，循环总时长随之变化。
              </StatusChip>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:gap-6">
        <fieldset className="min-w-0 flex-1 space-y-1.5">
          <legend className="mb-1 font-medium text-slate-300 text-micro">
            暴击计算模式
          </legend>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {CRIT_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...config, critMode: mode })}
                aria-pressed={currentCritMode === mode}
                className={optionClass(currentCritMode === mode)}
              >
                {label}
              </button>
            ))}
          </div>
          {activeCritMode !== undefined && (
            <p className="text-micro text-slate-400">{activeCritMode.desc}</p>
          )}
        </fieldset>

        <fieldset className="min-w-0 flex-1 space-y-1.5">
          <legend className="mb-1 font-medium text-slate-300 text-micro">
            角色切人耗时
          </legend>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {SWAP_COSTS.map(({ label, value }) => {
              const active = Math.abs(currentSwapCost - value) < PRESET_EPSILON;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onChange({ ...config, swapCost: value })}
                  aria-pressed={active}
                  className={optionClass(active)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-micro text-slate-400">计入循环总时长与 DPS</p>
        </fieldset>
      </div>
    </div>
  );
}
