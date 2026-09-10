import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { STATE_CHIP, STATE_GLYPH, type SemanticState } from "@/components/ui/tokens";

interface Props {
  state: SemanticState;
  children: ReactNode;
  /** Set false for chips whose meaning is already fully carried by the label. */
  showGlyph?: boolean;
  className?: string;
  title?: string;
}

/**
 * Semantic state chip. The glyph is decorative and `aria-hidden`; the text
 * label always carries the meaning, so status is never colour-only.
 */
export function StatusChip({ state, children, showGlyph = true, className, title }: Props) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-micro font-medium",
        STATE_CHIP[state],
        className,
      )}
    >
      {showGlyph && <span aria-hidden="true">{STATE_GLYPH[state]}</span>}
      <span>{children}</span>
    </span>
  );
}
