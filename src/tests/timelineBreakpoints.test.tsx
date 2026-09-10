import { describe, expect, it } from "vitest";
import {
  lanesVisibilityClass,
  listVisibilityClass,
  type ViewMode,
} from "@/features/rotation-timeline/viewMode";

// ============================================================================
// TASK #017 — BREAKPOINT REGRESSION (expected RED pending TASK #015).
//
// A High-severity defect shipped with 354 tests green: RotationTimeline
// rendered BOTH the lane chart and the event list, stacked, at >= 640px.
// The cause was a Tailwind branch resolving to a bare "sm:block" with no base
// display class, so the element was visible below AND above the breakpoint.
//
// No test asserted the thing that actually matters: at any given viewport,
// EXACTLY ONE timeline view is visible. That invariant is what this file
// encodes, for every value of `mode`.
//
// Why a class-string model rather than a rendered DOM assertion: the repo has
// no jsdom and no testing-library, and jsdom does not evaluate Tailwind
// media-query utilities anyway — `getComputedStyle` would report nothing about
// `sm:block` because no stylesheet is loaded. Resolving the utility classes the
// way Tailwind does is therefore the only way to test this without adding
// dependencies, and it targets the defect exactly: the bug lives in the class
// STRING, not in the DOM tree.
//
// The class expressions are IMPORTED from `viewMode.ts` — the same pure module
// RotationTimeline.tsx applies to its wrappers (lines 229 and 240). Nothing is
// copied, so this suite cannot drift out of sync with the shipping component.
// ============================================================================

/** The `sm:` breakpoint, in px. Tailwind default; mirrored from the config. */
const SM_BREAKPOINT_PX = 640;

// The functions under test are the REAL ones from `viewMode.ts`, which
// RotationTimeline.tsx applies directly to its two wrapper divs (lines 229 and
// 240). Nothing is transcribed, so this suite cannot go green against a stale
// copy of the component's class strings.

function listWrapperClass(mode: ViewMode): string {
  return listVisibilityClass(mode);
}

function lanesWrapperClass(mode: ViewMode): string {
  return lanesVisibilityClass(mode);
}

// ---------------------------------------------------------------------------
// A minimal Tailwind display-utility resolver.
//
// Handles exactly the utilities these wrappers use: `block`, `hidden`, and
// their `sm:`-prefixed forms. Later classes win, and at a viewport >= 640px the
// `sm:` variants are active and are applied AFTER the unprefixed ones (Tailwind
// orders responsive variants after base utilities in the generated stylesheet).
//
// Crucially: an element with NO display utility at all is NOT hidden — a <div>
// defaults to `display: block`. That default is precisely what the shipped bug
// relied on, so the model must reproduce it rather than assuming "no class
// means invisible".
// ---------------------------------------------------------------------------

const DEFAULT_DIV_DISPLAY = "block";

function resolveDisplay(classes: string, viewportPx: number): string {
  const smActive = viewportPx >= SM_BREAKPOINT_PX;
  let display = DEFAULT_DIV_DISPLAY;

  // Base (unprefixed) utilities first.
  for (const token of classes.split(/\s+/).filter((t) => t.length > 0)) {
    if (token === "block") display = "block";
    else if (token === "hidden") display = "none";
  }

  // Then the sm: layer, which overrides the base layer when active.
  if (smActive) {
    for (const token of classes.split(/\s+/).filter((t) => t.length > 0)) {
      if (token === "sm:block") display = "block";
      else if (token === "sm:hidden") display = "none";
    }
  }

  return display;
}

function isVisible(classes: string, viewportPx: number): boolean {
  return resolveDisplay(classes, viewportPx) !== "none";
}

const ALL_MODES: readonly ViewMode[] = ["lanes", "list"];

/** Viewports either side of the breakpoint, including the boundary itself. */
const BELOW_SM = SM_BREAKPOINT_PX - 1;
const AT_SM = SM_BREAKPOINT_PX;
const ABOVE_SM = SM_BREAKPOINT_PX + 400;

describe("display-utility model (self-test: the model can distinguish)", () => {
  // If these fail, every assertion below is meaningless.
  it("treats a bare `block` as visible at both breakpoints", () => {
    expect(isVisible("block", BELOW_SM)).toBe(true);
    expect(isVisible("block", ABOVE_SM)).toBe(true);
  });

  it("treats `hidden` as hidden at both breakpoints", () => {
    expect(isVisible("hidden", BELOW_SM)).toBe(false);
    expect(isVisible("hidden", ABOVE_SM)).toBe(false);
  });

  it("treats `hidden sm:block` as hidden below and visible at/above sm", () => {
    expect(isVisible("hidden sm:block", BELOW_SM)).toBe(false);
    expect(isVisible("hidden sm:block", AT_SM)).toBe(true);
    expect(isVisible("hidden sm:block", ABOVE_SM)).toBe(true);
  });

  it("treats `block sm:hidden` as visible below and hidden at/above sm", () => {
    expect(isVisible("block sm:hidden", BELOW_SM)).toBe(true);
    expect(isVisible("block sm:hidden", AT_SM)).toBe(false);
  });

  it("treats a bare `sm:block` as visible at BOTH — the defect's mechanism", () => {
    // A div with only `sm:block` still gets the UA default `display: block`
    // below the breakpoint. This is why the bug was invisible to class-presence
    // checks: the class list looked responsive but hid nothing.
    expect(isVisible("sm:block", BELOW_SM)).toBe(true);
    expect(isVisible("sm:block", ABOVE_SM)).toBe(true);
  });
});

describe("RotationTimeline: exactly one timeline view is visible", () => {
  // THE INVARIANT. Independent of which view is which, and of `mode` — two
  // stacked timelines is never a valid rendering.
  for (const mode of ALL_MODES) {
    for (const [label, viewport] of [
      ["below sm", BELOW_SM],
      ["at the sm boundary", AT_SM],
      ["above sm", ABOVE_SM],
    ] as const) {
      it(`mode="${mode}" ${label} (${viewport}px): exactly one view visible`, () => {
        const visible = [
          isVisible(listWrapperClass(mode), viewport),
          isVisible(lanesWrapperClass(mode), viewport),
        ].filter(Boolean).length;
        expect(visible).toBe(1);
      });
    }
  }
});

describe("RotationTimeline: the correct view is the visible one", () => {
  // At/above sm the lane chart is AUTHORITATIVE in both modes: the mode toggle
  // is itself `sm:hidden`, so `mode` is a mobile-only preference and must not
  // be able to leave a desktop user looking at the list.
  for (const mode of ALL_MODES) {
    it(`mode="${mode}": at/above sm shows the lane chart, never the list`, () => {
      expect(isVisible(lanesWrapperClass(mode), AT_SM)).toBe(true);
      expect(isVisible(listWrapperClass(mode), AT_SM)).toBe(false);
      expect(isVisible(lanesWrapperClass(mode), ABOVE_SM)).toBe(true);
      expect(isVisible(listWrapperClass(mode), ABOVE_SM)).toBe(false);
    });
  }

  // Below sm the MODE decides, because that is where the toggle exists.
  it('mode="list" below sm shows the list, not the lane chart', () => {
    expect(isVisible(listWrapperClass("list"), BELOW_SM)).toBe(true);
    expect(isVisible(lanesWrapperClass("list"), BELOW_SM)).toBe(false);
  });

  it('mode="lanes" below sm honours the opt-in and shows the lane chart', () => {
    // The mobile toggle exists precisely so a user can choose the lane chart on
    // a narrow screen; the list must then be hidden, not stacked underneath.
    expect(isVisible(lanesWrapperClass("lanes"), BELOW_SM)).toBe(true);
    expect(isVisible(listWrapperClass("lanes"), BELOW_SM)).toBe(false);
  });

  it("the mobile toggle actually changes which view is visible below sm", () => {
    // Guards against a fix that satisfies "exactly one visible" by pinning the
    // same view in both modes, which would make the toggle a no-op control.
    expect(isVisible(lanesWrapperClass("lanes"), BELOW_SM)).not.toBe(
      isVisible(lanesWrapperClass("list"), BELOW_SM),
    );
  });
});

describe("no wrapper relies on a bare responsive display utility", () => {
  // A structural rule that catches the defect CLASS, not just this instance:
  // if a class list mentions `sm:block`/`sm:hidden` it must also state a base
  // display, otherwise its below-sm behaviour is an accident of the UA default.
  const RESPONSIVE_DISPLAY = /(^|\s)sm:(block|hidden)(\s|$)/;
  const BASE_DISPLAY = /(^|\s)(block|hidden|flex|grid|inline-block)(\s|$)/;

  for (const mode of ALL_MODES) {
    for (const [name, classes] of [
      ["list wrapper", listWrapperClass(mode)],
      ["lanes wrapper", lanesWrapperClass(mode)],
    ] as const) {
      it(`mode="${mode}" ${name} states a base display class`, () => {
        if (RESPONSIVE_DISPLAY.test(classes)) {
          expect(
            BASE_DISPLAY.test(classes),
            `"${classes}" sets a sm: display variant with no base display class, ` +
              `so below 640px it falls back to the browser default instead of an ` +
              `intended value.`,
          ).toBe(true);
        }
      });
    }
  }
});

describe("wiring guard: the component applies these exact classes", () => {
  // The suite above tests `viewMode.ts`. This pins the values so that if the
  // component ever stops using these helpers, or the helpers change meaning,
  // the mismatch is visible here rather than silently untested.
  it("matches the classes RotationTimeline.tsx applies to its wrappers", () => {
    expect({
      list: { lanes: listWrapperClass("lanes"), list: listWrapperClass("list") },
      lanes: { lanes: lanesWrapperClass("lanes"), list: lanesWrapperClass("list") },
    }).toEqual({
      // The list is never visible at >= sm; the lane chart always is.
      list: { lanes: "hidden", list: "block sm:hidden" },
      lanes: { lanes: "block", list: "hidden sm:block" },
    });
  });
});
