import type { AxisTick } from "@/features/rotation-timeline/timelineModel";

/** Value and unit must not wrap apart. */
const NBSP = "\u00a0";

interface Props {
  ticks: readonly AxisTick[];
}

/**
 * Shared x-axis, rendered once above the lanes and repeated below them. Tick
 * labels are text on a raised surface, so they use slate-400, not slate-500.
 */
export function TimelineAxis({ ticks }: Props) {
  return (
    <div className="relative h-5" aria-hidden="true">
      {ticks.map((tick) => (
        <span
          key={tick.time}
          style={{ left: `${tick.leftPercent}%` }}
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-micro text-slate-400"
        >
          {tick.showUnit ? `${tick.time}${NBSP}s` : tick.time}
        </span>
      ))}
    </div>
  );
}
