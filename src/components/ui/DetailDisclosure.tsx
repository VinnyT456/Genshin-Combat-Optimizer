"use client";

import { useId, useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  FOCUS_RING,
  STATE_CHIP,
  TRANSITION_COLORS,
  type SemanticState,
} from "@/components/ui/tokens";

interface Props {
  /**
   * The explanation. Rendered as VISIBLE text when expanded — never as a
   * `title` alone, which DESIGN-SYSTEM forbids as a sole information source
   * because it is unreachable by keyboard and touch users.
   */
  detail: string;
  /** Accessible name of the trigger, e.g. "Why this character is partial". */
  triggerLabel: string;
  state?: SemanticState;
  className?: string;
}

/**
 * Toggle that reveals an explanatory sentence as visible text.
 *
 * Promoted from `TimelineLane`'s `SkipButton`, which already solved this
 * problem correctly (TASK #034 finding H2). A shared component keeps the one
 * accessible pattern in one place instead of a third variation per surface.
 */
export function DetailDisclosure({
  detail,
  triggerLabel,
  state = "warning",
  className,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();

  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailId}
        aria-label={triggerLabel}
        onClick={() => setExpanded((open) => !open)}
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border",
          "border-surface-border text-slate-300 hover:bg-surface-hover hover:text-slate-100",
          TRANSITION_COLORS,
          FOCUS_RING,
        )}
      >
        <span aria-hidden="true" className="text-micro font-semibold">
          ?
        </span>
      </button>
      {expanded && (
        <span
          id={detailId}
          className={cn("rounded-sm border px-2 py-1 text-micro", STATE_CHIP[state])}
        >
          {detail}
        </span>
      )}
    </span>
  );
}
