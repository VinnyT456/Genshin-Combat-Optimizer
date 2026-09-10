"use client";

import type { SimulationConfig } from "@/types";
import { cn } from "@/components/ui/cn";
import { CARD, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";

interface Props {
  config: Partial<SimulationConfig>;
  onChange: (next: Partial<SimulationConfig>) => void;
}

const CRIT_MODES: readonly { mode: "expected" | "always" | "never"; label: string; desc: string }[] = [
  { mode: "expected", label: "期望暴击", desc: "基于暴击率与暴击伤害计算理论数学期望" },
  { mode: "always", label: "必定暴击", desc: "强制每一次命中均触发暴击" },
  { mode: "never", label: "绝不暴击", desc: "仅计算基底未暴击伤害" },
];

const SWAP_COSTS: readonly { label: string; value: number }[] = [
  { label: "0.6秒 (默认)", value: 0.6 },
  { label: "0.4秒 (极速)", value: 0.4 },
  { label: "0.8秒 (高延迟)", value: 0.8 },
];

export function SimulationSettings({ config, onChange }: Props) {
  const currentCritMode = config.critMode ?? "expected";
  const currentSwapCost = config.swapCost ?? 0.6;

  return (
    <div className={cn(CARD, "flex flex-col gap-3 p-4 text-sm")}>
      <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          模拟计算参数
        </h3>
        <span className="text-xs text-slate-400">
          全局配置
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Crit Mode Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">暴击计算模式:</span>
            <span className="text-xs text-slate-400">
              {CRIT_MODES.find((m) => m.mode === currentCritMode)?.desc}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {CRIT_MODES.map(({ mode, label }) => {
              const active = currentCritMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange({ ...config, critMode: mode })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-sm border px-2 py-1.5 text-center text-micro font-medium",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    active
                      ? "border-amber-500 bg-amber-500/15 text-amber-400 font-bold"
                      : "border-surface-border bg-surface text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Swap Cost Selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">角色切人耗时:</span>
            <span className="text-micro text-slate-400 font-mono">
              直接影响循环总轴长与 DPS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {SWAP_COSTS.map(({ label, value }) => {
              const active = Math.abs(currentSwapCost - value) < 1e-4;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onChange({ ...config, swapCost: value })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-sm border px-2 py-1.5 text-center text-micro font-medium",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    active
                      ? "border-amber-500 bg-amber-500/15 text-amber-400 font-bold"
                      : "border-surface-border bg-surface text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
