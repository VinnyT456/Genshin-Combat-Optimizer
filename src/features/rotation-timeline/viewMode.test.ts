import { describe, expect, it } from "vitest";
import {
  type ViewMode,
  lanesVisibilityClass,
  listVisibilityClass,
  TIMELINE_VIEW_OPTIONS,
} from "@/features/rotation-timeline/viewMode";

const MODES: ViewMode[] = ["lanes", "list"];

/**
 * Minimal Tailwind display resolver: the LAST display utility that applies at a
 * given width wins, which is exactly how the cascade orders base then `sm:`.
 * Deliberately tiny — its only job is to answer "is this element displayed".
 */
function displayedAt(classes: string, width: "base" | "sm"): boolean {
  let displayed: boolean | null = null;
  for (const token of classes.split(/\s+/).filter(Boolean)) {
    if (token === "block") displayed = true;
    else if (token === "hidden") displayed = false;
    else if (width === "sm" && token === "sm:block") displayed = true;
    else if (width === "sm" && token === "sm:hidden") displayed = false;
  }
  return displayed ?? true; // no display utility at all => element default
}

describe("timeline view visibility", () => {
  it("declares an explicit base display class in every branch", () => {
    // A responsive variant with no base ("sm:block") inherits the element
    // default and therefore renders at ALL widths. That is what once put both
    // views on screen at once, so it is asserted structurally, not inferred.
    for (const mode of MODES) {
      for (const classes of [lanesVisibilityClass(mode), listVisibilityClass(mode)]) {
        const tokens = classes.split(/\s+/);
        expect(tokens).toSatisfy((t: string[]) =>
          t.includes("block") || t.includes("hidden"),
        );
      }
    }
  });

  it("shows exactly one view at the sm breakpoint and above, in either mode", () => {
    for (const mode of MODES) {
      const visible = [
        displayedAt(lanesVisibilityClass(mode), "sm"),
        displayedAt(listVisibilityClass(mode), "sm"),
      ].filter(Boolean);
      expect(visible).toHaveLength(1);
    }
  });

  it("shows exactly one view below the sm breakpoint, in either mode", () => {
    for (const mode of MODES) {
      const visible = [
        displayedAt(lanesVisibilityClass(mode), "base"),
        displayedAt(listVisibilityClass(mode), "base"),
      ].filter(Boolean);
      expect(visible).toHaveLength(1);
    }
  });

  it("always resolves to the lane chart at sm and above", () => {
    // The mode toggle is mobile-only, so a desktop user has no control to
    // collapse a view. The lane chart must therefore be the one that wins.
    for (const mode of MODES) {
      expect(displayedAt(lanesVisibilityClass(mode), "sm")).toBe(true);
      expect(displayedAt(listVisibilityClass(mode), "sm")).toBe(false);
    }
  });

  it("honours the mode below sm, where the toggle is reachable", () => {
    expect(displayedAt(listVisibilityClass("list"), "base")).toBe(true);
    expect(displayedAt(lanesVisibilityClass("list"), "base")).toBe(false);
    expect(displayedAt(lanesVisibilityClass("lanes"), "base")).toBe(true);
    expect(displayedAt(listVisibilityClass("lanes"), "base")).toBe(false);
  });
});

describe("TIMELINE_VIEW_OPTIONS", () => {
  it("covers every ViewMode exactly once", () => {
    // The switch is a radiogroup: if an option were missing, that view would be
    // unreachable; if duplicated, two radios would report checked at once.
    const ids = TIMELINE_VIEW_OPTIONS.map((o) => o.id);
    expect([...ids].sort()).toEqual(["lanes", "list"]);
  });

  it("gives every option a visible Chinese label", () => {
    for (const option of TIMELINE_VIEW_OPTIONS) {
      expect(option.labelZh.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps exactly one option selected for any mode", () => {
    for (const mode of ["lanes", "list"] as const) {
      const checked = TIMELINE_VIEW_OPTIONS.filter((o) => o.id === mode);
      expect(checked).toHaveLength(1);
    }
  });
});
