// ---------------------------------------------------------------------------
// Class-name tokens for the interaction/state matrix in DESIGN-SYSTEM.md.
// Components compose these instead of re-typing the rules, so the matrix is
// defined exactly once.
// ---------------------------------------------------------------------------

/** Never remove an outline without this replacement. Always `:focus-visible`. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** Only colours transition, and only for 150ms. Never `transition-all`. */
export const TRANSITION_COLORS = "transition-colors duration-150";

/** Disabled is not a semantic colour — it is opacity + cursor + a visible reason. */
export const DISABLED = "disabled:opacity-60 disabled:cursor-not-allowed";

/** Default card/panel shell: 1px border, raised surface, rounded-xl radius. */
export const CARD =
  "rounded-xl border border-surface-border/80 bg-surface-raised/80 backdrop-blur-sm shadow-sm";

/** Minimum touch target (44x44 CSS px) for compact icon-only controls. */
export const TOUCH_TARGET = "min-h-11 min-w-11 sm:min-h-0 sm:min-w-0";

export type SemanticState = "success" | "warning" | "error" | "info";

/** fg + tinted bg + border triplet for a semantic state chip or panel. */
export const STATE_CHIP: Record<SemanticState, string> = {
  success: "text-state-success-fg bg-state-success-bg border-state-success-border",
  warning: "text-state-warning-fg bg-state-warning-bg border-state-warning-border",
  error: "text-state-error-fg bg-state-error-bg border-state-error-border",
  info: "text-state-info-fg bg-state-info-bg border-state-info-border",
};

/** Foreground-only variant, for inline prose that must not carry a fill. */
export const STATE_TEXT: Record<SemanticState, string> = {
  success: "text-state-success-fg",
  warning: "text-state-warning-fg",
  error: "text-state-error-fg",
  info: "text-state-info-fg",
};

/**
 * Decorative glyph paired with each state. The glyph is always `aria-hidden`;
 * the adjacent text label carries the meaning (never colour-only).
 */
export const STATE_GLYPH: Record<SemanticState, string> = {
  success: "✓", // ✓
  warning: "⚠", // ⚠
  error: "✕", // ✕
  info: "◇", // ◇
};
