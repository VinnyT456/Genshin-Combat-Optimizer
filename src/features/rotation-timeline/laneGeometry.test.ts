import { describe, expect, it } from "vitest";
import {
  LANE_GAP_PX,
  LANE_HEIGHT_PX,
  LANE_HEADER_WIDTH_PX,
  LANE_ROW_PITCH_PX,
  laneHeaderStyle,
  laneRowSpanStyle,
  laneStackStyle,
  laneTrackStyle,
  spanScrollMarginStyle,
  swapOverlayStyle,
} from "@/features/rotation-timeline/laneGeometry";

describe("lane geometry is one declaration, not several that must agree", () => {
  it("derives every rendered value from the px constants", () => {
    // Changing a constant must move the rendered CSS with it. If any of these
    // were hand-written strings, the drift they hide would typecheck and lint.
    expect(laneTrackStyle.height).toBe(`${LANE_HEIGHT_PX}px`);
    expect(laneStackStyle.gap).toBe(`${LANE_GAP_PX}px`);
    expect(laneHeaderStyle.width).toBe(`${LANE_HEADER_WIDTH_PX}px`);
    expect(swapOverlayStyle.left).toBe(`${LANE_HEADER_WIDTH_PX}px`);
    expect(spanScrollMarginStyle.scrollMarginLeft).toBe(`${LANE_HEADER_WIDTH_PX}px`);
  });

  it("offsets the swap overlay by exactly the header width", () => {
    // The overlay and the tracks must share one x origin, or every swap marker
    // lands at the wrong timestamp.
    expect(swapOverlayStyle.left).toBe(laneHeaderStyle.width);
  });

  it("computes row pitch as height plus gap", () => {
    expect(LANE_ROW_PITCH_PX).toBe(LANE_HEIGHT_PX + LANE_GAP_PX);
  });
});

describe("laneRowSpanStyle", () => {
  it("gives a single-row span exactly one lane height", () => {
    expect(laneRowSpanStyle(0, 0)).toEqual({ top: 0, height: LANE_HEIGHT_PX });
    expect(laneRowSpanStyle(2, 2)).toEqual({
      top: 2 * LANE_ROW_PITCH_PX,
      height: LANE_HEIGHT_PX,
    });
  });

  it("bridges adjacent rows across the gap", () => {
    // A swap from lane 0 to lane 1 must cover both tracks AND the gap between
    // them, otherwise the bridge reads as two disconnected marks.
    expect(laneRowSpanStyle(0, 1)).toEqual({
      top: 0,
      height: LANE_HEIGHT_PX * 2 + LANE_GAP_PX,
    });
  });

  it("bridges non-adjacent rows across every intervening gap", () => {
    expect(laneRowSpanStyle(0, 3).height).toBe(LANE_HEIGHT_PX * 4 + LANE_GAP_PX * 3);
  });
});
