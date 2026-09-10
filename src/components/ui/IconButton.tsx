"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import {
  DISABLED,
  FOCUS_RING,
  TOUCH_TARGET,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Required: an icon-only control must always be named for assistive tech. */
  label: string;
  /** Decorative glyph. Rendered `aria-hidden`; `label` carries the meaning. */
  glyph: string;
}

/**
 * Icon-only control. `label` is mandatory by type, so an unnamed icon button
 * cannot compile.
 */
export function IconButton({ label, glyph, className, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-slate-400 hover:text-slate-100 hover:bg-surface-hover active:translate-y-px",
        TOUCH_TARGET,
        TRANSITION_COLORS,
        FOCUS_RING,
        DISABLED,
        "disabled:active:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-slate-400",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
