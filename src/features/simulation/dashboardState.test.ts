import { describe, expect, it } from "vitest";
import {
  resolveDashboardState,
  type DashboardStateInput,
} from "./dashboardState";

const base: DashboardStateInput = {
  memberCount: 4,
  rotationLength: 8,
  hasResult: false,
  resultStale: false,
};

describe("resolveDashboardState", () => {
  it("is ready when configured but not yet simulated", () => {
    const state = resolveDashboardState(base);
    expect(state.phase).toBe("ready");
    expect(state.canSimulate).toBe(true);
    expect(state.blockedReason).toBeNull();
    expect(state.showEmptyState).toBe(true);
    expect(state.showResults).toBe(false);
  });

  it("blocks on an empty team and names the team as the cause", () => {
    const state = resolveDashboardState({ ...base, memberCount: 0 });
    expect(state.phase).toBe("blocked");
    expect(state.canSimulate).toBe(false);
    expect(state.blockedReason).toBe("no-team");
  });

  it("blames the team before the rotation when both are empty", () => {
    // With no characters a rotation cannot be authored, so pointing the user
    // at the rotation editor first would send them to a dead control.
    const state = resolveDashboardState({
      ...base,
      memberCount: 0,
      rotationLength: 0,
    });
    expect(state.blockedReason).toBe("no-team");
  });

  it("blocks on an empty rotation once a team exists", () => {
    const state = resolveDashboardState({ ...base, rotationLength: 0 });
    expect(state.phase).toBe("blocked");
    expect(state.blockedReason).toBe("no-rotation");
  });

  it("shows results when a fresh result exists", () => {
    const state = resolveDashboardState({ ...base, hasResult: true });
    expect(state.phase).toBe("results");
    expect(state.showResults).toBe(true);
    expect(state.showEmptyState).toBe(false);
  });

  it("marks a result stale without hiding it", () => {
    // Qualifying the numbers is correct; deleting them out from under a
    // reader is not.
    const state = resolveDashboardState({
      ...base,
      hasResult: true,
      resultStale: true,
    });
    expect(state.phase).toBe("stale");
    expect(state.showResults).toBe(true);
  });

  it("keeps showing an existing result even when the run is now blocked", () => {
    // Deleting the last rotation step blocks re-running, but the previously
    // computed result stays on screen rather than vanishing.
    const state = resolveDashboardState({
      ...base,
      rotationLength: 0,
      hasResult: true,
      resultStale: true,
    });
    expect(state.canSimulate).toBe(false);
    expect(state.blockedReason).toBe("no-rotation");
    expect(state.showResults).toBe(true);
    expect(state.showEmptyState).toBe(false);
  });

  it("never reports an empty state and a result at the same time", () => {
    for (const hasResult of [true, false]) {
      for (const resultStale of [true, false]) {
        for (const memberCount of [0, 4]) {
          for (const rotationLength of [0, 8]) {
            const state = resolveDashboardState({
              memberCount,
              rotationLength,
              hasResult,
              resultStale,
            });
            expect(state.showResults).toBe(!state.showEmptyState);
          }
        }
      }
    }
  });
});
