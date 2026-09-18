"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";

export type ButtonVariant = "primary" | "secondary" | "quiet";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "border border-[#d4ff5f] bg-[#d4ff5f] text-[#10150a] font-semibold hover:border-[#e2ff99] hover:bg-[#e2ff99] active:bg-[#bce944]",
  secondary:
    "border border-surface-border bg-surface-raised text-slate-200 hover:border-cyan-300/60 hover:bg-surface-hover hover:text-white",
  quiet:
    "border border-transparent text-slate-400 hover:bg-white/5 hover:text-white",
};

export type ButtonSize = "sm" | "md";

const SIZE: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 py-2 text-xs sm:min-h-9",
  md: "min-h-11 px-5 py-2.5 text-sm",
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
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "secondary",
    size = "md",
    className,
    type = "button",
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
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
});
