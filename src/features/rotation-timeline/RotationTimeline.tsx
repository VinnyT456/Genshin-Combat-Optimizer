"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterDefinition, CombatEvent, SimulationWarning } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { CARD, STATE_CHIP } from "@/components/ui/tokens";
import { TimelineAxis } from "@/features/rotation-timeline/TimelineAxis";
import { TimelineLane } from "@/features/rotation-timeline/TimelineLane";
import {
  laneHeaderStyle,
  laneStackStyle,
  swapOverlayStyle,
} from "@/features/rotation-timeline/laneGeometry";
import {
  type ViewMode,
  lanesVisibilityClass,
  listVisibilityClass,
  TIMELINE_VIEW_OPTIONS,
} from "@/features/rotation-timeline/viewMode";
import { SwapMarkers } from "@/features/rotation-timeline/SwapMarkers";
import { TimelineList } from "@/features/rotation-timeline/TimelineList";
import {
  type TimelineModel,
  type TimelineBuffWindow,
  buildTimelineModel,
  buildTimelineSummary,
  buildRuntimeBuffWindows,
  formatSeconds,
  formatSecondsShort,
  laneIndexOfEvent,
  nearestInLane,
  neighbourInLane,
  selectableEventIndices,
} from "@/features/rotation-timeline/timelineModel";
import { charNameZh } from "@/lib/i18n";

interface Props {
  timeline: readonly CombatEvent[];
  duration: number;
  /** Party order, holes allowed — lane order mirrors slot order. */
  team: readonly (CharacterDefinition | null)[];
  warnings: readonly SimulationWarning[];
  /** Swap cost the run actually used, from `result.effectiveSwapCost`. */
  effectiveSwapCost: number;
  /** True when `effectiveSwapCost` is the engine default rather than a user value. */
  swapCostIsDefault: boolean;
  /** Runtime buff evidence carried by the completed simulation snapshot. */
  runtimeBuffs?: readonly unknown[];
  selectedEventIndex: number | null;
  onSelectEvent: (eventIndex: number | null) => void;
}

export function RotationTimeline({
  timeline,
  duration,
  team,
  warnings,
  effectiveSwapCost,
  swapCostIsDefault,
  runtimeBuffs,
  selectedEventIndex,
  onSelectEvent,
}: Props) {
  const [mode, setMode] = useState<ViewMode>("list");
  const spanRefs = useRef(new Map<number, HTMLButtonElement>());
  const modeButtonRefs = useRef(new Map<ViewMode, HTMLButtonElement>());

  const model: TimelineModel = useMemo(
    () => buildTimelineModel({ timeline, duration, team, warnings }),
    [timeline, duration, team, warnings],
  );

  const charactersById = useMemo(() => {
    const map = new Map<string, CharacterDefinition>();
    team.forEach((c) => {
      if (c !== null) map.set(c.id, c);
    });
    return map;
  }, [team]);

  const order = useMemo(() => selectableEventIndices(model), [model]);

  // Exactly one span is in the tab order at a time; arrows move within the
  // group. 40 sequential tab stops would be unusable.
  const rovingEventIndex =
    selectedEventIndex !== null && order.includes(selectedEventIndex)
      ? selectedEventIndex
      : (order[0] ?? null);

  const registerSpan = useCallback(
    (eventIndex: number, node: HTMLButtonElement | null) => {
      if (node === null) spanRefs.current.delete(eventIndex);
      else spanRefs.current.set(eventIndex, node);
    },
    [],
  );

  // Keep a keyboard-selected span visible inside the horizontal scroller.
  useEffect(() => {
    if (selectedEventIndex === null) return;
    spanRefs.current
      .get(selectedEventIndex)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedEventIndex]);

  function focusEvent(eventIndex: number) {
    onSelectEvent(eventIndex);
    spanRefs.current.get(eventIndex)?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (order.length === 0) return;
    const current = rovingEventIndex;
    const first = order[0];
    const last = order[order.length - 1];

    if (event.key === "Home" && first !== undefined) {
      event.preventDefault();
      focusEvent(first);
      return;
    }
    if (event.key === "End" && last !== undefined) {
      event.preventDefault();
      focusEvent(last);
      return;
    }
    if (current === null) return;

    const laneIndex = laneIndexOfEvent(model, current);

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const step = event.key === "ArrowRight" ? 1 : -1;
      const lane = model.lanes[laneIndex];
      // Swaps live outside any lane, so they step through the global order.
      const next =
        lane === undefined
          ? order[order.indexOf(current) + step]
          : (neighbourInLane(lane, current, step) ?? undefined);
      if (next !== undefined) {
        event.preventDefault();
        focusEvent(next);
      }
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (laneIndex === -1) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const currentLane = model.lanes[laneIndex];
      const currentAction = currentLane?.actions.find(
        (a) => a.eventIndex === current,
      );
      const time = currentAction?.start ?? 0;
      // Skip empty lanes: land on the nearest event in the next lane that has one.
      for (let i = laneIndex + step; i >= 0 && i < model.lanes.length; i += step) {
        const lane = model.lanes[i];
        if (lane === undefined) continue;
        const target = nearestInLane(lane, time);
        if (target !== null) {
          event.preventDefault();
          focusEvent(target);
          return;
        }
      }
    }
  }

  const hasEvents = order.length > 0;
  const singleCharacter = charactersById.size <= 1;
  const timelineSummary = useMemo(
    () => buildTimelineSummary(model, timeline, warnings),
    [model, timeline, warnings],
  );
  const buffWindows = useMemo(
    () => buildRuntimeBuffWindows(runtimeBuffs, model.duration),
    [runtimeBuffs, model.duration],
  );

  function handleModeKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TIMELINE_VIEW_OPTIONS.findIndex((option) => option.id === mode);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % TIMELINE_VIEW_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + TIMELINE_VIEW_OPTIONS.length) % TIMELINE_VIEW_OPTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TIMELINE_VIEW_OPTIONS.length - 1;
    } else {
      return;
    }

    const next = TIMELINE_VIEW_OPTIONS[nextIndex];
    if (next === undefined) return;
    event.preventDefault();
    setMode(next.id);
    modeButtonRefs.current.get(next.id)?.focus();
  }

  const summary = useMemo(
    () =>
      model.lanes
        .filter((lane) => lane.character !== null)
        .map((lane) => {
          const actions = lane.actions
            .map(
              (a) =>
                `${a.abilityName} 于 ${formatSeconds(a.start)} 造成 ` +
                `${Math.round(a.damage).toLocaleString("zh-CN")} 点伤害`,
            )
            .join("; ");
          return `${charNameZh(lane.character?.name ?? "")}：${actions === "" ? "暂无动作" : actions}。`;
        })
        .join(" "),
    [model],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-200/80">
            执行摘要
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {formatSeconds(model.duration)} · {timelineSummary.traceEventCount} 条记录
          </p>
        </div>
        {/*
          Mutually-exclusive view switch, so `radiogroup` / `radio` with
          `aria-checked` — NOT `aria-pressed`. Two `aria-pressed` buttons
          announce as two independent toggles, one of them "pressed", and never
          convey "1 of 2" (UI-AUDIT-055 F8). Roving tabindex keeps the pair a
          single tab stop, as a radio group should be.
        */}
        <div
          role="radiogroup"
          aria-label="时间轴显示方式"
          onKeyDown={handleModeKeyDown}
          className="flex gap-1 sm:hidden"
        >
          {TIMELINE_VIEW_OPTIONS.map((option) => {
            const selected = mode === option.id;
            return (
              <Button
                key={option.id}
                size="sm"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                ref={(node) => {
                  if (node === null) modeButtonRefs.current.delete(option.id);
                  else modeButtonRefs.current.set(option.id, node);
                }}
                onClick={() => setMode(option.id)}
                className={cn(selected && "border-amber-500 bg-amber-500/10")}
              >
                {option.labelZh}
              </Button>
            );
          })}
        </div>
      </div>

      <div
        aria-label="时序摘要"
        className="grid grid-cols-2 gap-px overflow-hidden border border-surface-border bg-surface-border sm:grid-cols-4"
      >
        <TimelineMetric
          label="伤害事件"
          value={timelineSummary.damageEventCount.toLocaleString("zh-CN")}
          detail="按引擎时间线记录"
        />
        <TimelineMetric
          label="切人次数"
          value={timelineSummary.swapCount.toLocaleString("zh-CN")}
          detail={
            timelineSummary.swapCount === 0
              ? "无切人耗时"
              : `实际 ${formatSeconds(timelineSummary.totalSwapTime)}`
          }
        />
        <TimelineMetric
          label="切人占轴"
          value={`${(timelineSummary.swapTimeFraction * 100).toFixed(1)}%`}
          detail="占观测时间"
        />
        <TimelineMetric
          label="运行提示"
          value={timelineSummary.warningCount.toLocaleString("zh-CN")}
          detail={timelineSummary.warningCount === 0 ? "所有记录已执行" : "点击提示查看原因"}
          warning={timelineSummary.warningCount > 0}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-micro font-mono text-slate-400">
        <span className="text-slate-300">图例</span>
        <LegendItem label="普" detail="普通攻击" />
        <LegendItem label="重" detail="重击" />
        <LegendItem label="E" detail="元素战技" />
        <LegendItem label="Q" detail="元素爆发" />
        <LegendItem label="斜纹" detail="切人耗时" hatch />
      </div>

      <p id="timeline-reading-help" className="text-xs leading-5 text-slate-500">
        有宽度的色块代表动作占时；细竖线代表同一动作产生的即时命中。斜纹只表示切人后摇，最终伤害仍以引擎记录为准。
      </p>

      {!hasEvents && (
        <p className={cn("rounded-sm border px-3 py-2 text-sm font-mono", STATE_CHIP.info)}>
          未执行任何动作。请检查输出循环动作引用的角色是否存在于当前出战队伍中。
        </p>
      )}

      {/* Below 640px the list is the default and the lane chart is opt-in; at
          640px and above the lane chart always wins and the list is hidden, so
          exactly one view is ever visible. Both stay mounted. */}
      <div className={listVisibilityClass(mode)}>
        {mode === "list" ? (
          <TimelineList
            timeline={timeline}
            charactersById={charactersById}
            selectedEventIndex={selectedEventIndex}
            onSelect={onSelectEvent}
          />
        ) : null}
      </div>

      <div className={lanesVisibilityClass(mode)}>
        <div className={cn(CARD, "overflow-x-auto p-3")}>
          <div className="min-w-[40rem]">
            <div className="flex">
              <div className="shrink-0" style={laneHeaderStyle} />
              <div className="relative min-w-0 flex-1">
                <TimelineAxis ticks={model.ticks} />
              </div>
            </div>

            <div
              role="group"
              aria-label={`循环时序时间轴，共 ${model.lanes.length} 条角色轨道，总轴长 ${formatSecondsShort(model.duration)}`}
              onKeyDown={handleKeyDown}
              className="relative"
            >
              <ul className="flex flex-col" style={laneStackStyle}>
                {model.lanes.map((lane, i) => (
                  <TimelineLane
                    key={lane.slotIndex}
                    lane={lane}
                    striped={i % 2 === 0}
                    selectedEventIndex={selectedEventIndex}
                    rovingEventIndex={rovingEventIndex}
                    onSelect={onSelectEvent}
                    registerSpan={registerSpan}
                  />
                ))}
              </ul>

              {/* Swap overlay sits above the lane stack so one element can span
                  vertically from the outgoing lane to the incoming one. */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0"
                style={swapOverlayStyle}
              >
                <div className="pointer-events-auto relative h-full">
                  <SwapMarkers
                    model={model}
                    selectedEventIndex={selectedEventIndex}
                    rovingEventIndex={rovingEventIndex}
                    onSelect={onSelectEvent}
                    registerSpan={registerSpan}
                  />
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="shrink-0" style={laneHeaderStyle} />
              <div className="relative mt-1 min-w-0 flex-1">
                <TimelineAxis ticks={model.ticks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {buffWindows.length > 0 && (
        <BuffWindowTrack windows={buffWindows} duration={model.duration} />
      )}

      <p className="sr-only">{summary}</p>

      <p className="text-xs text-slate-400 font-mono">
        {singleCharacter ? (
          <>单人战斗循环 — 无切人换人耗时。</>
        ) : (
          <>
            切人耗时 {formatSecondsShort(effectiveSwapCost)}
            {swapCostIsDefault ? " (默认)" : ""} — 切人后摇已计入循环总轴长与 DPS。
          </>
        )}
        <span className="text-slate-400"> · </span>
        <span aria-hidden="true">普</span> 普通攻击 ·{" "}
        <span aria-hidden="true">重</span> 重击 ·{" "}
        <span aria-hidden="true">E</span> 元素战技 ·{" "}
        <span aria-hidden="true">Q</span> 元素爆发
      </p>
    </div>
  );
}

function BuffWindowTrack({
  windows,
  duration,
}: {
  windows: readonly TimelineBuffWindow[];
  duration: number;
}) {
  return (
    <section aria-label="已记录的增益窗口" className={cn(CARD, "space-y-2 p-3")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">增益窗口</h3>
          <p className="mt-0.5 text-xs text-slate-500">只显示引擎已发布的时间证据，不把重叠误读为单次命中归因。</p>
        </div>
        <span className="font-mono text-micro text-slate-500">观测轴长 {formatSeconds(duration)}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[40rem] space-y-1.5">
          {windows.map((window) => {
            const tone = window.id === "furina-fanfare-party-damage"
              ? "border-l-2 border-cyan-300 bg-cyan-300/20"
              : "border-l-2 border-violet-300 bg-violet-300/20";
            return (
              <div key={`${window.id}:${window.start}:${window.end}`} className="flex items-center gap-2">
                <div className="w-28 shrink-0 text-xs text-slate-300">
                  <div className="truncate" title={window.label}>{window.label}</div>
                  <div className="text-micro text-slate-500">{window.scopeLabel}</div>
                </div>
                <div className="relative h-7 min-w-0 flex-1 bg-surface-raised/70">
                  <span
                    aria-hidden="true"
                    className={cn("absolute inset-y-1 rounded-sm", tone)}
                    style={{ left: `${window.leftPercent}%`, width: `${window.widthPercent}%` }}
                  />
                  <span className="sr-only">
                    {window.label}，{window.scopeLabel}，从 {formatSeconds(window.start)} 持续到 {formatSeconds(window.end)}。
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-micro leading-4 text-slate-500">
        窗口重叠不代表每个命中都必然获得增益；场上角色范围、快照规则和命中时刻由引擎判定。
      </p>
    </section>
  );
}

function TimelineMetric({
  label,
  value,
  detail,
  warning = false,
}: {
  label: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <div className="min-w-0 bg-surface-raised px-3 py-2.5">
      <p className="text-micro font-mono uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className={cn("mt-1 tabular-nums text-lg font-semibold", warning ? "text-amber-300" : "text-cyan-100")}>
        {value}
      </p>
      <p className="mt-0.5 truncate text-micro text-slate-500" title={detail}>{detail}</p>
    </div>
  );
}

function LegendItem({ label, detail, hatch = false }: { label: string; detail: string; hatch?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-surface-border px-2 py-1" title={detail}>
      <span
        aria-hidden="true"
        className={cn("inline-flex min-w-5 items-center justify-center font-semibold text-slate-200", hatch && "border border-dashed border-slate-500")}
      >
        {label}
      </span>
      <span>{detail}</span>
    </span>
  );
}
