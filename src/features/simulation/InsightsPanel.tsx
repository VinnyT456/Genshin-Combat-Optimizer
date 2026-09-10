"use client";

import type { RotationInsight } from "./insightsModel";
import { cn } from "@/components/ui/cn";

interface Props {
  insights: readonly RotationInsight[];
}

// Status dots carry colour only. The coloured glow shadows that used to sit
// here added a second, unspecified visual channel for severity that the dot's
// semantic colour and the panel's text already carry (DESIGN-SYSTEM restraint
// rule; UI-AUDIT-055 F7).
const STATUS_THEMES = {
  success: {
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-gradient-to-br from-emerald-950/20 via-surface-raised to-surface-raised",
    badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    dot: "bg-emerald-400",
  },
  warning: {
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-gradient-to-br from-amber-950/20 via-surface-raised to-surface-raised",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    dot: "bg-amber-400",
  },
  info: {
    border: "border-sky-500/30 hover:border-sky-500/60",
    bg: "bg-gradient-to-br from-sky-950/20 via-surface-raised to-surface-raised",
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-300",
    dot: "bg-sky-400",
  },
} as const;

export function InsightsPanel({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          循环诊断与配队建议
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight) => {
          const theme = STATUS_THEMES[insight.status] ?? STATUS_THEMES.info;

          return (
            <div
              key={insight.id}
              className={cn(
                "relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-colors duration-150",
                theme.border,
                theme.bg,
              )}
            >
              <div>
                {/* Header row: Badge */}
                <div className="mb-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                      theme.badge,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
                    {insight.badge}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                  {insight.title}
                </h4>

                {/* Summary */}
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {insight.summary}
                </p>
              </div>

              {/* Actionable detail / advice box */}
              <div className="mt-3.5 rounded-md border border-surface-border/60 bg-surface/50 p-3 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-amber-400">优化建议: </span>
                {insight.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
