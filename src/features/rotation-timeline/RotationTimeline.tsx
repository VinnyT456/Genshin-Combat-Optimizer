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
  buildTimelineModel,
  formatSeconds,
  formatSecondsShort,
  laneIndexOfEvent,
  nearestInLane,
  neighbourInLane,
  selectableEventIndices,
  swapTimeFraction,
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
  selectedEventIndex,
  onSelectEvent,
}: Props) {
  const [mode, setMode] = useState<ViewMode>("lanes");
  const spanRefs = useRef(new Map<number, HTMLButtonElement>());

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
  const swapFraction = swapTimeFraction(model);

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-slate-300">
          循环轴长 {formatSeconds(model.duration)}
          {model.swapCount > 0 && (
            <>
              <span className="text-slate-400"> · </span>
              {model.swapCount} 次切人
              <span className="text-slate-400"> · </span>
              切人耗时 {formatSeconds(model.totalSwapTime)} (
              {(swapFraction * 100).toFixed(1)}%)
            </>
          )}
        </p>
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
                onClick={() => setMode(option.id)}
                className={cn(selected && "border-amber-500 bg-amber-500/10")}
              >
                {option.labelZh}
              </Button>
            );
          })}
        </div>
      </div>

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

      <p className="sr-only">{summary}</p>

      <p className="text-xs text-slate-400 font-mono">
        <span aria-hidden="true">▨ </span>
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
