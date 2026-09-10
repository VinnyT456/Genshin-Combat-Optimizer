import type { Element } from "@/types";

// ---------------------------------------------------------------------------
// Element-keyed SURFACE styling (card tints, fills, borders).
//
// `format.ts` already owns element FOREGROUND and solid-fill classes
// (`elementTextClass` / `elementBgClass`). This module adds the missing
// surface-tint token that four separate components had each re-derived by
// hand as a nested ternary over raw Tailwind palette colours
// (`from-red-950/25`, `bg-sky-500`, ...).
//
// Those hand-rolled values did NOT match the design tokens: `bg-red-500`
// (#ef4444) was standing in for `element.pyro` (#ec4c3a), `bg-sky-500`
// (#0ea5e9) for `element.hydro` (#2f9fe0), and so on. Centralising here means
// element colour is defined exactly once, in terms of the tokens in
// `tailwind.config.ts`, and adding an element is a single-line change instead
// of a fifth ternary.
//
// Pure data + pure functions: no React, no DOM, directly unit-testable.
// ---------------------------------------------------------------------------

/** Every element the UI can style, in the roster's canonical display order. */
export const ELEMENTS: readonly Element[] = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
  "physical",
] as const;

/**
 * Subtle vertical tint + matching border for a card representing a character
 * of this element. Uses the `element.*` design tokens via arbitrary-value
 * opacity modifiers so the hue always tracks `tailwind.config.ts`.
 *
 * The tint is intentionally low-contrast: it is a *secondary* cue. The element
 * name is always rendered as text alongside it (never colour-only).
 */
const SURFACE_TINT: Record<Element, string> = {
  pyro: "bg-gradient-to-b from-element-pyro/10 to-surface-raised border-element-pyro/30",
  hydro: "bg-gradient-to-b from-element-hydro/10 to-surface-raised border-element-hydro/30",
  electro:
    "bg-gradient-to-b from-element-electro/10 to-surface-raised border-element-electro/30",
  cryo: "bg-gradient-to-b from-element-cryo/10 to-surface-raised border-element-cryo/30",
  anemo: "bg-gradient-to-b from-element-anemo/10 to-surface-raised border-element-anemo/30",
  geo: "bg-gradient-to-b from-element-geo/10 to-surface-raised border-element-geo/30",
  dendro:
    "bg-gradient-to-b from-element-dendro/10 to-surface-raised border-element-dendro/30",
  physical: "bg-surface-raised border-surface-border",
};

/**
 * Card tint + border for an element. Falls back to the neutral raised surface
 * when the element is unknown (e.g. a rotation row whose character was
 * removed), so a missing element degrades to "no tint" rather than throwing.
 */
export function elementSurfaceClass(element: Element | undefined): string {
  if (element === undefined) return SURFACE_TINT.physical;
  return SURFACE_TINT[element] ?? SURFACE_TINT.physical;
}

/**
 * Tinted chip: element-coloured text on a faint fill of the same hue.
 * Grey text on a coloured background reads as washed out, so the foreground is
 * a shade of the background's own hue rather than a neutral.
 */
const CHIP_TINT: Record<Element, string> = {
  pyro: "bg-element-pyro/15 text-element-pyro border-element-pyro/40",
  hydro: "bg-element-hydro/15 text-element-hydro border-element-hydro/40",
  electro: "bg-element-electro/15 text-element-electro border-element-electro/40",
  cryo: "bg-element-cryo/15 text-element-cryo border-element-cryo/40",
  anemo: "bg-element-anemo/15 text-element-anemo border-element-anemo/40",
  geo: "bg-element-geo/15 text-element-geo border-element-geo/40",
  dendro: "bg-element-dendro/15 text-element-dendro border-element-dendro/40",
  physical: "bg-element-physical/15 text-element-physical border-element-physical/40",
};

/** Tinted chip classes for an element, for filter pills and inline markers. */
export function elementChipClass(element: Element | undefined): string {
  if (element === undefined) return CHIP_TINT.physical;
  return CHIP_TINT[element] ?? CHIP_TINT.physical;
}
