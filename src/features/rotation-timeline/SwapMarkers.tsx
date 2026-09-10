"use client";

import { cn } from "@/components/ui/cn";
import {
  laneRowSpanStyle,
  spanScrollMarginStyle,
} from "@/features/rotation-timeline/laneGeometry";
import {
  type SwapSpan,
  type TimelineModel,
  formatSecondsShort,
  INLINE_LABEL_MIN_PERCENT,
} from "@/features/rotation-timeline/timelineModel";

/** Diagonal hatch: a swap must read as consumed time, never as decoration. */
const HATCH_BACKGROUND =
  "repeating-linear-gradient(45deg, rgba(148,163,184,0.45) 0 2px, transparent 2px 6px)";

interface Props {
  model: TimelineModel;
  selectedEventIndex: number | null;
  rovingEventIndex: number | null;
  onSelect: (eventIndex: number) => void;
  registerSpan: (eventIndex: number, node: HTMLButtonElement | null) => void;
}

function laneRowOf(model: TimelineModel, characterId: string | null): number {
  if (characterId === null) return -1;
  return model.lanes.findIndex((lane) => lane.character?.id === characterId);
}

/**
 * Swap spans, drawn in an overlay above the lane stack so a single element can
 * span vertically from the outgoing lane to the incoming one. The width encodes
 * the time cost; the vertical bridge encodes the transfer of control.
 */
export function SwapMarkers({
  model,
  selectedEventIndex,
  rovingEventIndex,
  onSelect,
  registerSpan,
}: Props) {
  function geometry(swap: SwapSpan): { top: number; height: number } {
    const toRow = laneRowOf(model, swap.toCharacterId);
    const fromRow = laneRowOf(model, swap.fromCharacterId);
    // An opening swap has no origin lane, so it occupies only its own row.
    const rows = fromRow === -1 ? [toRow] : [fromRow, toRow];
    const valid = rows.filter((r) => r >= 0);
    if (valid.length === 0) return laneRowSpanStyle(0, 0);
    return laneRowSpanStyle(Math.min(...valid), Math.max(...valid));
  }

  return (
    <>
      {model.swaps.map((swap) => {
        const { top, height } = geometry(swap);
        const selected = swap.eventIndex === selectedEventIndex;
        const showInlineLabel = swap.widthPercent >= INLINE_LABEL_MIN_PERCENT;
        return (
          <button
            key={swap.eventIndex}
            ref={(node) => registerSpan(swap.eventIndex, node)}
            type="button"
            tabIndex={swap.eventIndex === rovingEventIndex ? 0 : -1}
            aria-pressed={selected}
            aria-label={swap.label}
            title={swap.label}
            onClick={() => onSelect(swap.eventIndex)}
            style={{
              ...spanScrollMarginStyle,
              left: `${swap.leftPercent}%`,
              width: `${swap.widthPercent}%`,
              top,
              height,
              backgroundImage: HATCH_BACKGROUND,
            }}
            className={cn(
              "absolute flex items-center justify-center rounded-sm border border-surface-border bg-slate-500/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
              selected && "ring-2 ring-amber-400",
            )}
          >
            {showInlineLabel && (
              <span
                aria-hidden="true"
                className="font-mono text-micro tabular-nums text-slate-200"
              >
                {formatSecondsShort(swap.duration)}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
