// ---------------------------------------------------------------------------
// Which of the two timeline views is visible, at which breakpoint.
//
// Both subtrees stay MOUNTED at every width — unmounting on a breakpoint change
// would drop focus and any DOM state held by the hidden view. Visibility is
// therefore purely a display concern, and it is expressed here as pure strings
// so it is unit-testable without a DOM.
//
// Invariant: EVERY branch carries an explicit base display class. A responsive
// variant with no base (`"sm:block"`) inherits the element default and renders
// at all widths — that is precisely how both views once rendered stacked on
// desktop with no control to collapse either.
// ---------------------------------------------------------------------------

export type ViewMode = "lanes" | "list";

/** One option of the view switch. A closed table, so the control cannot drift. */
export interface TimelineViewOption {
  readonly id: ViewMode;
  readonly labelZh: string;
}

/** Options in display order, for the mobile radiogroup. */
export const TIMELINE_VIEW_OPTIONS: readonly TimelineViewOption[] = [
  { id: "list", labelZh: "列表模式" },
  { id: "lanes", labelZh: "多轨时间轴" },
];

/**
 * The lane chart: the desktop view. Shown whenever the viewport is >= `sm`, and
 * below `sm` only when the user opted into it.
 */
export function lanesVisibilityClass(mode: ViewMode): string {
  return mode === "lanes" ? "block" : "hidden sm:block";
}

/**
 * The event list: the mobile default. Never shown at >= `sm`, where the lane
 * chart replaces it — `sm:hidden` is what keeps the two mutually exclusive.
 */
export function listVisibilityClass(mode: ViewMode): string {
  return mode === "list" ? "block sm:hidden" : "hidden";
}
