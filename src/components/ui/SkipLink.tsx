import { cn } from "@/components/ui/cn";
import { FOCUS_RING } from "@/components/ui/tokens";

interface Props {
  targetId: string;
}

/**
 * Bypass block. Visually hidden until focused, so a keyboard user does not have
 * to traverse the team's ~20 controls to reach the results.
 */
export function SkipLink({ targetId }: Props) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50",
        "focus-visible:rounded-md focus-visible:border focus-visible:border-surface-border",
        "focus-visible:bg-surface-raised focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm",
        FOCUS_RING,
      )}
    >
      跳转至主要内容
    </a>
  );
}
