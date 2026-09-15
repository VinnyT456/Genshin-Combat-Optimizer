import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

interface Props {
  title: string;
  /** Technical telemetry identifier code e.g. "// SEC.01" */
  code?: string;
  /** Heading element id, so regions can be referenced by `aria-labelledby`. */
  id?: string;
  /** Optional right-aligned controls in the section header row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Page section with futuristic HUD styling and telemetry tracking rule.
 * Headings stay strictly hierarchical: page `h1` → section `h2`.
 */
export function Section({ title, code, id, actions, children, className }: Props) {
  return (
    <section className={cn("space-y-5", className)} aria-labelledby={id}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/70 pb-4">
        <div className="flex items-center gap-2">
          {code && (
            <span className="font-mono text-micro font-bold text-amber-500/90 tracking-wider">
              {code}
            </span>
          )}
          <h2
            id={id}
            tabIndex={-1}
            className="text-balance text-base font-bold tracking-tight text-slate-100 sm:text-lg"
          >
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
