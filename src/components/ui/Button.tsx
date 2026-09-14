"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";

export type ButtonVariant = "primary" | "secondary" | "quiet";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "border border-cyan-300/70 bg-cyan-300/10 text-cyan-100 font-semibold shadow-[inset_3px_0_0_rgba(34,211,238,0.75)] hover:border-cyan-200 hover:bg-cyan-300/20 hover:text-white active:bg-cyan-300/25",
  secondary:
    "border border-surface-border bg-surface-raised text-slate-200 hover:border-cyan-400/60 hover:bg-surface-hover hover:text-cyan-100",
  quiet:
    "border border-transparent text-slate-400 hover:border-fuchsia-400/40 hover:bg-fuchsia-400/5 hover:text-fuchsia-100",
};

export type ButtonSize = "sm" | "md";

const SIZE: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/**
 * Baseline action button implementing the full interaction matrix
 * (hover / active / focus-visible / disabled). Callers supplying `disabled`
 * are responsible for rendering an adjacent visible reason — see
 * DESIGN-SYSTEM "Interaction states".
 */
export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium active:translate-y-px",
        TRANSITION_COLORS,
        FOCUS_RING,
        DISABLED,
        "disabled:active:translate-y-0",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
