// ---------------------------------------------------------------------------
// Single source of truth for the lane grid's px geometry.
//
// DESIGN-SYSTEM §2.3 "Derived geometry": the lane stack is the documented
// exception to content-derived sizing, because the swap marker must bridge two
// rows across a gap and no pure-CSS construct expresses that without knowing the
// row pitch. The exception is only tolerable with ONE declaration, so the
// numbers below are the sole declaration and every consumer — JS offset maths
// and rendered CSS alike — is derived from them mechanically. A comment pairing
// `40` with `h-10` is documentation, not enforcement; these helpers are.
//
// Values are emitted as inline styles rather than Tailwind classes on purpose:
// Tailwind cannot see a dynamically-built class name, so `h-[${n}px]` would be
// purged and silently render at auto height — exactly the drift this closes.
// ---------------------------------------------------------------------------

/** Height of one lane track row. */
export const LANE_HEIGHT_PX = 40;

/** Vertical gap between two lane rows. */
export const LANE_GAP_PX = 4;

/** Width of the sticky character-name column left of every track. */
export const LANE_HEADER_WIDTH_PX = 112;

/** Distance from the top of one lane row to the top of the next. */
export const LANE_ROW_PITCH_PX = LANE_HEIGHT_PX + LANE_GAP_PX;

/** Inline style for a lane track box. */
export const laneTrackStyle: React.CSSProperties = { height: `${LANE_HEIGHT_PX}px` };

/** Inline style for the sticky header column, and for its axis-row spacer. */
export const laneHeaderStyle: React.CSSProperties = {
  width: `${LANE_HEADER_WIDTH_PX}px`,
};

/** Inline style for the lane stack's row gap. */
export const laneStackStyle: React.CSSProperties = { gap: `${LANE_GAP_PX}px` };

/**
 * Inline style for the swap overlay, inset from the left by exactly the header
 * width so overlay x-offsets share the tracks' coordinate space.
 */
export const swapOverlayStyle: React.CSSProperties = {
  left: `${LANE_HEADER_WIDTH_PX}px`,
};

/**
 * Horizontal scroll margin for a focused span, so `scrollIntoView` does not
 * park it underneath the sticky header column.
 */
export const spanScrollMarginStyle: React.CSSProperties = {
  scrollMarginLeft: `${LANE_HEADER_WIDTH_PX}px`,
};

/** Top/height of an overlay element spanning lane rows `first`..`last`. */
export function laneRowSpanStyle(
  first: number,
  last: number,
): { top: number; height: number } {
  return {
    top: first * LANE_ROW_PITCH_PX,
    height: (last - first) * LANE_ROW_PITCH_PX + LANE_HEIGHT_PX,
  };
}
