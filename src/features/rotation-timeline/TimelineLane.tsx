"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  FOCUS_RING,
  STATE_CHIP,
  STATE_TEXT,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { spanFillClass } from "@/features/rotation-timeline/laneStyles";
import {
  laneHeaderStyle,
  laneTrackStyle,
  spanScrollMarginStyle,
} from "@/features/rotation-timeline/laneGeometry";
import {
  type Lane,
  abilityClassLabel,
  formatSeconds,
  INLINE_LABEL_MIN_PERCENT,
} from "@/features/rotation-timeline/timelineModel";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import { charNameZh } from "@/lib/i18n";

/**
 * Copy for a party slot nobody occupies. Names the STATE ("no character in this
 * slot") rather than reading as a value — an em dash beside a slot number is
 * indistinguishable from "this character did nothing".
 */
const EMPTY_SLOT_LABEL = "[空缺席位]";
const NO_ACTIONS_LABEL = "暂无动作";

interface Props {
  lane: Lane;
  /** Zebra striping so a four-lane stack stays scannable. */
  striped: boolean;
  selectedEventIndex: number | null;
  /** The one span in this lane that is in the roving tab order, if any. */
  rovingEventIndex: number | null;
  onSelect: (eventIndex: number) => void;
  registerSpan: (eventIndex: number, node: HTMLButtonElement | null) => void;
}

export function TimelineLane({
  lane,
  striped,
  selectedEventIndex,
  rovingEventIndex,
  onSelect,
  registerSpan,
}: Props) {
  const { character } = lane;
  const slotNumber = lane.slotIndex + 1;
  const displayName = character ? charNameZh(character.name) : "";

  return (
    <li className="flex items-stretch font-mono">
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-surface-border bg-surface px-2"
        style={laneHeaderStyle}
      >
        <span className="font-mono text-micro text-slate-400">
          <span className="sr-only">席位 </span>
          0{slotNumber}
        </span>
        {character === null ? (
          <span className="text-micro text-slate-400">{EMPTY_SLOT_LABEL}</span>
        ) : (
          <>
            <CharacterAvatar
              characterId={character.id}
              characterName={character.name}
              element={character.element}
              size="sm"
            />
            <span className="truncate text-micro font-medium" title={displayName}>
              {displayName}
            </span>
          </>
        )}
      </div>

      <div
        style={laneTrackStyle}
        className={cn(
          "relative min-w-0 flex-1",
          striped ? "bg-surface-raised" : "bg-surface-raised/60",
          character === null && "opacity-50",
        )}
      >
        {character !== null && lane.actions.length === 0 && (
          <span className="absolute inset-y-0 left-2 flex items-center text-micro italic text-slate-400">
            {NO_ACTIONS_LABEL}
          </span>
        )}
        {lane.actions.map((action) => {
          const selected = action.eventIndex === selectedEventIndex;
          const showInlineLabel = action.widthPercent >= INLINE_LABEL_MIN_PERCENT;
          const classGlyph =
            action.abilityClass === "N"
              ? "普"
              : action.abilityClass === "C"
                ? "重"
                : action.abilityClass;

          return (
            <button
              key={action.eventIndex}
              ref={(node) => registerSpan(action.eventIndex, node)}
              type="button"
              tabIndex={action.eventIndex === rovingEventIndex ? 0 : -1}
              aria-pressed={selected}
              aria-label={action.label}
              title={
                action.instant
                  ? `${action.label} · 即时命中`
                  : action.clamped
                  ? `${action.label} · 持续 ${formatSeconds(action.duration)}`
                  : action.label
              }
              onClick={() => onSelect(action.eventIndex)}
              style={{
                ...spanScrollMarginStyle,
                left: `${action.leftPercent}%`,
                width: `${action.widthPercent}%`,
              }}
              className={cn(
                "absolute top-1 bottom-1 flex items-center justify-start overflow-hidden rounded-sm border-l-2 px-1 text-left",
                "opacity-80 hover:opacity-100 transition-opacity duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                action.instant
                  ? "border-cyan-100 bg-transparent px-0"
                  : spanFillClass(action.element),
                selected && "opacity-100 ring-2 ring-amber-400",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "font-mono text-micro font-bold text-black/80",
                  action.instant && "hidden",
                )}
              >
                {classGlyph}
              </span>
              {showInlineLabel && (
                <span
                  aria-hidden="true"
                  className="ml-1 truncate text-micro text-black/80"
                >
                  {action.abilityName}
                </span>
              )}
            </button>
          );
        })}

        {lane.skips.map((skip) => (
          <SkipButton
            key={`skip-${skip.warningIndex}`}
            label={skip.label}
            leftPercent={skip.leftPercent}
          />
        ))}
      </div>
    </li>
  );
}

/**
 * A skipped action. It is a real `<button>`, not a decorated `<span>`: it is the
 * only element in the chart carrying an explanation of why an action did not
 * run, and a keyboard or touch user with no hover has to be able to reach it.
 *
 * Skips are not `CombatEvent`s, so they have no `eventIndex` and cannot join the
 * spans' roving tabindex group — they are ordinary tab stops instead. Activating
 * one reveals the reason as visible text beside the marker, so the reason is
 * never available through a tooltip alone.
 */
function SkipButton({ label, leftPercent }: { label: string; leftPercent: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <span
      className="absolute top-1 bottom-1 flex -translate-x-1/2 items-center gap-1"
      style={{ left: `${leftPercent}%` }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={label}
        title={label}
        onClick={() => setExpanded((open) => !open)}
        className={cn(
          "flex h-full items-center rounded-sm border border-dashed border-state-warning-border px-1",
          "hover:bg-state-warning-bg",
          TRANSITION_COLORS,
          FOCUS_RING,
          STATE_TEXT.warning,
        )}
      >
        <span className="text-micro">提示</span>
      </button>
      {expanded && (
        <span
          className={cn(
            "whitespace-nowrap rounded-sm border px-1 text-micro",
            STATE_CHIP.warning,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export { abilityClassLabel };
