import { describe, expect, it } from "vitest";
import { filterCoverageRows, coverageStateZh, coverageUnknownZh, type CoverageRow } from "./coverageModel";

const rows: CoverageRow[] = [
  { id: "a", name: "甲", states: { sourced: true, represented: true, executable: true, "live-wired": true, "regression-tested": true, unknown: false } },
  { id: "b", name: "乙", states: { sourced: true, represented: true, executable: false, "live-wired": false, "regression-tested": false, unknown: "unknown" } },
];

describe("coverage filtering and unknown states", () => {
  it("filters by query and independently named state", () => {
    expect(filterCoverageRows(rows, { query: "乙" })).toHaveLength(1);
    expect(filterCoverageRows(rows, { state: "executable" })).toEqual([rows[0]]);
  });
  it("does not translate unknown into a positive claim", () => {
    expect(coverageStateZh("unknown")).toBe("状态未知");
    expect(coverageUnknownZh(undefined)).toBe("状态未知");
  });
});
