"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/components/ui/cn";
import { CARD, FOCUS_RING, STATE_CHIP, TRANSITION_COLORS } from "@/components/ui/tokens";
import { fmtNum } from "@/lib/format";
import { actionTypeZh, charNameZh } from "@/lib/i18n";
import type { CharacterDefinition, Rotation } from "@/types";
import {
  MAX_SEARCH_DURATION_SECONDS,
  MIN_SEARCH_DURATION_SECONDS,
  improvementOverBaseline,
  type OptimizationObjective,
  type SearchBudget,
  type SearchOutcome,
} from "./optimizerAdapter";
import {
  ADOPT_SAFETY_NOTICE,
  BUDGET_OPTIONS,
  EMPTY_RESULT_NOTICE,
  OBJECTIVE_OPTIONS,
  SEARCHING_NOTICE,
  SEARCH_SCOPE_NOTICE,
  SEARCH_UNSUPPORTED_NOTICE,
  budgetLabel,
  candidateCountLabel,
  improvementLabel,
  improvementTone,
  objectiveLabel,
  searchEffortLabel,
  searchStatusLabel,
  type SearchPhase,
} from "./searchPresentation";

/** Actions previewed inline before the list is truncated with a count. */
const ROTATION_PREVIEW_LIMIT = 8;

export interface RotationSearchPanelProps {
  readonly phase: SearchPhase;
  readonly budget: SearchBudget;
  readonly objective: OptimizationObjective;
  readonly durationSeconds: number;
  readonly outcome: SearchOutcome | null;
  /** Objective value of the user's own rotation, or null if it has not been run. */
  readonly baselineScore: number | null;
  readonly blockedReason: string | null;
  readonly errorMessage?: string | null;
  readonly canRestore: boolean;
  readonly adoptedRank: number | null;
  readonly selectedCandidateId?: string | null;
  readonly requestSummary?: string | null;
  readonly draftChanged?: boolean;
  readonly team: readonly CharacterDefinition[];
  readonly onBudgetChange: (budget: SearchBudget) => void;
  readonly onObjectiveChange: (objective: OptimizationObjective) => void;
  readonly onDurationChange: (seconds: number) => void;
  readonly onSearch: () => void;
  readonly onCancel?: () => void;
  readonly onAdopt: (rotation: Rotation, rank: number) => void;
  readonly onSelectCandidate?: (candidateId: string) => void;
  readonly onRestore: () => void;
}

/**
 * Rotation search: bounded budget presets, ranked suggestions and adoption.
 *
 * Presentation only. Scoring, budget mapping and every claim string come from
 * `optimizerAdapter` / `searchPresentation`; this component decides layout and
 * nothing else.
 */
export function RotationSearchPanel({
  phase,
  budget,
  objective,
  durationSeconds,
  outcome,
  baselineScore,
  blockedReason,
  errorMessage = null,
  canRestore,
  adoptedRank,
  selectedCandidateId = null,
  requestSummary = null,
  draftChanged = false,
  team,
  onBudgetChange,
  onObjectiveChange,
  onDurationChange,
  onSearch,
  onCancel,
  onAdopt,
  onSelectCandidate,
  onRestore,
}: RotationSearchPanelProps) {
  const durationId = useId();
  const nameById = new Map(team.map((c) => [c.id, charNameZh(c.name)]));
  const searching = phase === "queued" || phase === "searching" || phase === "canceling";
  const durationInvalid =
    !Number.isFinite(durationSeconds) ||
    durationSeconds < MIN_SEARCH_DURATION_SECONDS ||
    durationSeconds > MAX_SEARCH_DURATION_SECONDS;

  return (
    <div className="space-y-5" role="region" aria-labelledby={`${durationId}-search-heading`} aria-busy={searching}>
      <div className={cn(CARD, "space-y-4 p-4")}>
        <h2 id={`${durationId}-search-heading`} className="text-base font-semibold text-slate-100">条件</h2>
        <fieldset className="space-y-2" disabled={searching}>
          <legend className="text-xs font-semibold text-slate-300">目标</legend>
          <div className="flex flex-wrap gap-2">
            {OBJECTIVE_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.id}
                selected={option.id === objective}
                label={option.label}
                hint={option.hint}
                onSelect={() => onObjectiveChange(option.id)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2" disabled={searching}>
          <legend className="text-xs font-semibold text-slate-300">投入程度</legend>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((option) => (
              <ChoiceButton
                key={option.id}
                selected={option.id === budget}
                label={option.label}
                hint={option.hint}
                onSelect={() => onBudgetChange(option.id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label
              htmlFor={durationId}
              className="block text-xs font-semibold text-slate-300"
            >
              时间窗口（秒）
            </label>
            <input
              id={durationId}
              type="number"
              inputMode="numeric"
              min={MIN_SEARCH_DURATION_SECONDS}
              max={MAX_SEARCH_DURATION_SECONDS}
              value={durationSeconds}
              disabled={searching}
              onChange={(event) => onDurationChange(Number(event.target.value))}
              aria-invalid={durationInvalid}
              aria-describedby={durationInvalid ? `${durationId}-error` : undefined}
              className={cn(
                "min-h-11 w-24 rounded-sm border border-surface-border bg-surface px-2 py-1",
                durationInvalid && "border-red-400",
                "font-mono text-sm tabular-nums text-slate-100",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                TRANSITION_COLORS,
                FOCUS_RING,
              )}
            />
            {durationInvalid && (
              <p id={`${durationId}-error`} className="text-xs text-red-300">
                请输入5至60秒。
              </p>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={phase === "queued" || phase === "searching" ? onCancel : onSearch}
            disabled={phase === "canceling" || (phase !== "queued" && phase !== "searching" && (blockedReason !== null || durationInvalid))}
          >
            {phase === "canceling" ? "正在取消…" : phase === "queued" || phase === "searching" ? "取消搜索" : phase === "failed" ? "重试相同条件" : "开始搜索"}
          </Button>

          {blockedReason !== null && (
            <span className="text-xs font-medium text-amber-400">
              {blockedReason}
            </span>
          )}
          {searching && (
            <span className="text-xs text-slate-400">
              {SEARCHING_NOTICE}
            </span>
          )}
        </div>

        <p className="max-w-prose text-xs leading-relaxed text-slate-400">
          搜索范围：{requestSummary ?? `当前阵容与配置 · ${objectiveLabel(objective)} · ${durationSeconds}秒 · ${budgetLabel(budget)}`}
          <br />{SEARCH_SCOPE_NOTICE}
        </p>
      </div>

      <div className={cn(CARD, "space-y-3 p-4")} role="region" aria-labelledby={`${durationId}-status-heading`} aria-busy={searching}>
        <h3 id={`${durationId}-status-heading`} className="text-sm font-semibold text-slate-200">搜索状态</h3>
        <p className={cn("text-sm", phase === "idle" ? "text-slate-400" : "text-slate-300")}>
          {searchStatusLabel(phase)}
        </p>
        {searching && <p className="text-xs text-slate-500">{SEARCH_UNSUPPORTED_NOTICE}</p>}
        {draftChanged && <p className="rounded-sm border border-amber-400/40 bg-amber-500/10 p-2 text-xs text-amber-200">当前配置已更改。本次搜索仍使用开始时的配置；结果完成后不会自动应用。</p>}
      </div>

      {canRestore && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-sm border p-3 text-xs",
            STATE_CHIP.info,
          )}
        >
          <span>
            当前编辑器内容来自候选循环
            {adoptedRank === null ? "" : ` #${adoptedRank}`}，原循环已保留。
          </span>
          <Button size="sm" variant="secondary" onClick={onRestore}>
            还原为原循环
          </Button>
        </div>
      )}

      {phase === "empty" && (
        <p
          className={cn("rounded-sm border p-4 text-sm", STATE_CHIP.warning)}
          role="status"
        >
          {EMPTY_RESULT_NOTICE}
        </p>
      )}

      {phase === "canceled" && (
        <div className={cn(CARD, "space-y-2 p-4")} role="status">
          <h3 className="text-sm font-semibold text-slate-200">搜索已取消</h3>
          <p className="text-sm text-slate-400">当前配置和已有结果均已保留。</p>
        </div>
      )}

      {phase === "failed" && (
        <div className={cn(CARD, "space-y-2 border-red-400/40 p-4")} role="alert">
          <h3 className="text-sm font-semibold text-red-200">搜索未完成</h3>
          <p className="text-sm text-red-300">{errorMessage ?? "搜索过程中发生错误。当前配置和此前结果已保留。"}</p>
        </div>
      )}

      {phase === "idle" && (
        <div className={cn(CARD, "p-6 text-center")}>
          <p className="text-sm font-semibold text-slate-200">尚未搜索循环</p>
          <p className="mt-1.5 text-xs text-slate-400">
            设置搜索目标、时间窗口与投入程度后，在保留当前动作集合的前提下比较不同顺序。
          </p>
        </div>
      )}

      {phase === "results" && outcome !== null && (
        <div className="space-y-3">
          {draftChanged && <p className="rounded-sm border border-amber-400/40 bg-amber-500/10 p-2 text-xs text-amber-200">当前配置已更改；以下候选仍对应开始时的搜索条件。</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-300">
              {candidateCountLabel(
                outcome.candidates.length,
                outcome.requestedTopN,
              )}
            </span>
            <span className="font-mono text-slate-400">
              {objectiveLabel(outcome.objective)} · {budgetLabel(outcome.budget)} ·{" "}
              {searchEffortLabel(
                outcome.beamWidth,
                outcome.nodesExpanded,
                outcome.durationSeconds,
              )}
              {outcome.totalEvaluations !== undefined && (
                <> · 组合评估 {outcome.totalEvaluations} 次</>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-400">{ADOPT_SAFETY_NOTICE}</p>

          <ol className="space-y-3">
            {outcome.candidates.map((candidate, index) => {
              const rank = candidate.rank ?? index + 1;
              const improvement = improvementOverBaseline(
                candidate.score,
                baselineScore,
              );
              return (
                <li key={candidate.candidateId} className={cn(CARD, "p-4 space-y-3")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{rank}
                      </span>
                      <div>
                        <div className="font-mono text-2xl font-black tabular-nums text-white">
                          {fmtNum(candidate.score)}
                        </div>
                        <div className="mt-0.5 text-micro text-slate-400">
                          {objectiveLabel(outcome.objective)} ·{" "}
                          {candidate.rotation.length} 步 ·{" "}
                          {candidate.result.duration.toFixed(2)} 秒
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusChip state={improvementTone(improvement)}>
                        {improvementLabel(improvement)}
                      </StatusChip>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSelectCandidate?.(candidate.candidateId)}
                        aria-expanded={selectedCandidateId === candidate.candidateId}
                        aria-controls={`candidate-${candidate.candidateId}-details`}
                      >
                        {selectedCandidateId === candidate.candidateId ? "收起候选" : "查看候选"}
                      </Button>
                    </div>
                  </div>

                  <RotationPreview
                    rotation={candidate.rotation}
                    nameById={nameById}
                  />
                  {selectedCandidateId === candidate.candidateId && (
                    <div className="space-y-3 border-t border-surface-border/50 pt-3" id={`candidate-${candidate.candidateId}-details`}>
                      <ol className="space-y-1 text-sm text-slate-300">
                        {candidate.rotation.map((action, actionIndex) => (
                          <li key={`${candidate.candidateId}-${actionIndex}`} className="flex gap-2"><span className="font-mono text-slate-500">{actionIndex + 1}.</span><span>{nameById.get(action.characterId) ?? "未知角色"} · {actionTypeZh(action.actionType)}</span></li>
                        ))}
                      </ol>
                      <p className="text-xs text-slate-400">候选已从头验证；结果对应本次搜索条件。</p>
                      <Button size="md" variant="primary" onClick={() => onAdopt(candidate.rotation, rank)}>
                        复制此候选到编辑器
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function ChoiceButton({
  selected,
  label,
  hint,
  onSelect,
}: {
  selected: boolean;
  label: string;
  hint: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "min-h-11 min-w-28 rounded-sm border px-3 py-1.5 text-left",
        TRANSITION_COLORS,
        FOCUS_RING,
        "disabled:opacity-60 disabled:cursor-not-allowed",
        selected
          ? "border-amber-500 bg-amber-500/10 text-amber-200"
          : "border-surface-border bg-surface text-slate-300 hover:bg-surface-hover hover:text-slate-100",
      )}
    >
      <span className="block text-xs font-semibold">{label}</span>
      <span className="block text-micro text-slate-400">{hint}</span>
    </button>
  );
}

function RotationPreview({
  rotation,
  nameById,
}: {
  rotation: Rotation;
  nameById: ReadonlyMap<string, string>;
}) {
  const shown = rotation.slice(0, ROTATION_PREVIEW_LIMIT);
  const remaining = rotation.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-surface-border/50 pt-2.5">
      {shown.map((action, index) => (
        <span
          key={index}
          className="rounded-sm border border-surface-border bg-surface px-1.5 py-0.5 font-mono text-micro text-slate-300"
        >
          {nameById.get(action.characterId) ?? "未知角色"}
          <span className="text-slate-500"> · </span>
          {actionTypeZh(action.actionType)}
        </span>
      ))}
      {remaining > 0 && (
        <span className="font-mono text-micro text-slate-500">
          +{remaining} 步
        </span>
      )}
    </div>
  );
}
