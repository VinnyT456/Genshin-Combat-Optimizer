import { fingerprintInputs, isRunStale, type RunInputs, type SimulationRun } from "@/features/simulation/runState";
import type { HistoryEntry } from "@/features/history/historyModel";

export type ComparisonStatus = "compatible" | "incompatible" | "stale" | "invalid";
export interface ComparisonResult {
  readonly status: ComparisonStatus;
  readonly delta: number | null;
  /** Relative change is intentionally absent when the baseline is zero. */
  readonly percent: number | null;
  readonly direction: "increase" | "decrease" | "equal" | "unavailable";
  readonly reasonZh: string;
}

function comparisonKey(run: SimulationRun): string {
  // A/B answers are meaningful only when the scenario is held constant.
  return fingerprintInputs({ ...run.inputs, rotation: [] });
}

export function comparisonCompatibility(a: SimulationRun, b: SimulationRun): boolean {
  return comparisonKey(a) === comparisonKey(b);
}

export function compareRuns(
  baseline: SimulationRun,
  candidate: SimulationRun,
  liveInputs?: RunInputs,
): ComparisonResult {
  if (liveInputs !== undefined && (isRunStale(baseline, liveInputs) || isRunStale(candidate, liveInputs))) {
    return { status: "stale", delta: null, percent: null, direction: "unavailable", reasonZh: "结果对应的配置已变更，无法比较。" };
  }
  if (!comparisonCompatibility(baseline, candidate)) {
    return { status: "incompatible", delta: null, percent: null, direction: "unavailable", reasonZh: "两次模拟的阵容、敌人或配置不同，无法进行 A/B 比较。" };
  }
  const base = baseline.result.totalDamage;
  const value = candidate.result.totalDamage;
  if (!Number.isFinite(base) || !Number.isFinite(value)) {
    return { status: "invalid", delta: null, percent: null, direction: "unavailable", reasonZh: "结果数值无效，无法比较。" };
  }
  const delta = value - base;
  const direction = delta === 0 ? "equal" : delta > 0 ? "increase" : "decrease";
  return {
    status: "compatible",
    delta,
    percent: base === 0 ? null : (delta / Math.abs(base)) * 100,
    direction,
    reasonZh: base === 0 ? "基准伤害为 0，仅显示差值，不计算百分比。" : "",
  };
}

export function compareHistoryEntries(a: HistoryEntry, b: HistoryEntry, liveInputs?: RunInputs): ComparisonResult {
  return compareRuns(a.run, b.run, liveInputs);
}
