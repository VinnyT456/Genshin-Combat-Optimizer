"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";

export type ButtonVariant = "primary" | "secondary" | "quiet";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-amber-500 text-black font-semibold hover:bg-amber-400",
  secondary:
    "border border-surface-border bg-surface-raised text-slate-200 hover:bg-surface-hover",
  quiet: "text-slate-400 hover:text-slate-100",
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
        "rounded-md active:translate-y-px",
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
