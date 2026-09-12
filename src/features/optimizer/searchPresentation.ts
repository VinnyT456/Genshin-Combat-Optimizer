// ---------------------------------------------------------------------------
// Presentation model for rotation search. Pure — no React, no engine.
//
// Copy lives here rather than inline in the component for one reason specific
// to this feature: the wording is a CORRECTNESS surface. Beam search is greedy
// and offers no optimality guarantee (MASTER-PLAN §4: "'Best found' is the
// optimizer claim"), so every string that describes a search result is subject
// to the same review as a number. Keeping them in one tested module makes an
// over-claiming edit visible in review instead of buried in JSX.
// ---------------------------------------------------------------------------

import type { OptimizationObjective, SearchBudget } from "./optimizerAdapter";

/**
 * Phase of the search interaction. Drives which region the panel renders.
 *
 * There is deliberately no "blocked" phase: whether a search CAN start is an
 * independent axis (the panel takes a `blockedReason`), and a configuration can
 * become incomplete while results from an earlier search are still on screen.
 * Folding the two into one enum would force those results to be discarded.
 */
export type SearchPhase =
  /** No search has been run in this session. */
  | "idle"
  /** A search is executing. */
  | "queued"
  | "searching"
  | "canceling"
  /** A synchronous adapter cannot cancel yet, but the view model reserves this state. */
  | "canceled"
  | "failed"
  /** A search finished and produced at least one candidate. */
  | "results"
  /** A search finished and produced nothing. */
  | "empty";

export const SEARCH_UNSUPPORTED_NOTICE =
  "搜索在独立 Worker 中执行；当前仅展示 Worker 已确认的状态，不推测进度。";

export interface BudgetOption {
  readonly id: SearchBudget;
  readonly label: string;
  /** Runtime/quality trade, stated as a trade rather than as a promise. */
  readonly hint: string;
}

/**
 * Budget labels describe EFFORT, not outcome.
 *
 * "thorough" explores more candidates; it does not guarantee a better result,
 * because a greedy beam can discard the best rotation's prefix at any depth.
 * The hints therefore say what the search does, never what it will find.
 */
export const BUDGET_OPTIONS: readonly BudgetOption[] = [
  { id: "fast", label: "快速", hint: "候选最少，最快返回" },
  { id: "balanced", label: "均衡", hint: "候选与耗时兼顾" },
  { id: "thorough", label: "深入", hint: "候选最多，耗时最长" },
];

export interface ObjectiveOption {
  readonly id: OptimizationObjective;
  readonly label: string;
  readonly hint: string;
}

export const OBJECTIVE_OPTIONS: readonly ObjectiveOption[] = [
  { id: "total-damage", label: "总伤害", hint: "在时间窗口内累计伤害最高" },
  { id: "dps", label: "秒伤 (DPS)", hint: "按实际耗时平均的每秒伤害最高" },
];

/**
 * The standing disclosure shown with every search result.
 *
 * Required by UX-050: state the action space, objective and budget, and never
 * use "global optimum" or "guaranteed in game" wording.
 */
export const SEARCH_SCOPE_NOTICE =
  "搜索会组合当前阵容可执行的切人、普通攻击、元素战技与元素爆发。" +
  "结果是本次预算内找到的候选；结果不覆盖所有可行循环，也不保证实战表现。";

/** Shown above the candidate list, next to the incumbent-preserving copy. */
export const ADOPT_SAFETY_NOTICE =
  "复制会替换编辑器中的当前循环。第一次复制前的循环会保留，可在手动编辑前还原。";

export const SEARCHING_NOTICE =
  "正在搜索循环…";

export const EMPTY_RESULT_NOTICE =
  "本次搜索在上述阵容、敌人、时间窗口与投入程度下未返回候选。";

/**
 * Honest count summary for a Top-N list.
 *
 * Reports the actual number found against the number requested. A search that
 * could only build three legal rotations must not present a silently short list
 * as if it were the full Top-5 (UX-048).
 */
export function candidateCountLabel(
  found: number,
  requested: number,
): string {
  if (found >= requested) return `${found} 个候选循环`;
  return `${found} 个候选循环（请求 ${requested} 个，搜索空间内仅找到 ${found} 个）`;
}

/**
 * Describes the budget actually spent. `nodesExpanded` is a search diagnostic,
 * not a game value, and is labelled as such.
 */
export function searchEffortLabel(
  beamWidth: number,
  nodesExpanded: number,
  durationSeconds: number,
): string {
  return `束宽 ${beamWidth} · 展开节点 ${nodesExpanded} · 时间窗口 ${durationSeconds} 秒`;
}

export function objectiveLabel(objective: OptimizationObjective): string {
  return (
    OBJECTIVE_OPTIONS.find((option) => option.id === objective)?.label ??
    objective
  );
}

export function budgetLabel(budget: SearchBudget): string {
  return BUDGET_OPTIONS.find((option) => option.id === budget)?.label ?? budget;
}

/**
 * Signed improvement label against the user's own rotation.
 *
 * `null` improvement means there is no baseline to compare against, which is
 * shown as an explicit absence rather than as 0% — those are different facts.
 */
export function improvementLabel(improvement: number | null): string {
  if (improvement === null) return "无基线：尚未模拟当前循环，无法比较";
  const pct = (improvement * 100).toFixed(1);
  if (improvement > 0) return `较当前循环 +${pct}%`;
  if (improvement < 0) return `较当前循环 ${pct}%`;
  return "与当前循环持平";
}

/**
 * Whether a candidate is worth adopting relative to the baseline. Used only to
 * style the delta; a negative candidate is still shown, because a shorter or
 * more executable rotation can be preferable to the highest number.
 */
export function improvementTone(
  improvement: number | null,
): "success" | "warning" | "info" {
  if (improvement === null) return "info";
  if (improvement > 0) return "success";
  if (improvement < 0) return "warning";
  return "info";
}
