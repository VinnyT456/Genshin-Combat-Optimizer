import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { STATE_CHIP, type SemanticState } from "@/components/ui/tokens";

interface Props {
  state: SemanticState;
  children: ReactNode;
  className?: string;
  title?: string;
}

/**
 * Semantic state chip. The text label carries the meaning without decorative
 * emoji or glyphs.
 */
export function StatusChip({ state, children, className, title }: Props) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-micro font-medium",
        STATE_CHIP[state],
        className,
      )}
    >
      <span>{children}</span>
    </span>
  );
}
