import { describe, expect, it } from "vitest";
import {
  BUDGET_OPTIONS,
  OBJECTIVE_OPTIONS,
  SEARCH_SCOPE_NOTICE,
  budgetLabel,
  candidateCountLabel,
  improvementLabel,
  improvementTone,
  objectiveLabel,
  searchEffortLabel,
} from "./searchPresentation";
import {
  SEARCH_BUDGETS,
  beamWidthForBudget,
  clampSearchDuration,
  improvementOverBaseline,
  scoreForObjective,
  MAX_SEARCH_DURATION_SECONDS,
  MIN_SEARCH_DURATION_SECONDS,
} from "./optimizerAdapter";

describe("search scope disclosure", () => {
  it("never makes an affirmative optimality or guarantee claim", () => {
    // MASTER-PLAN §4 and UX-050: "best found" is the only supportable claim.
    // Matched on AFFIRMATIVE phrasings only: the notice legitimately contains
    // "不保证" (does not guarantee), and a bare "保证" substring check would
    // reject the very disclaimer this rule exists to require.
    // "全局最优" / "保证" are not banned outright, because the notice must be
    // able to DENY them ("并非全局最优解", "不保证"). What is banned is those
    // ideas asserted positively.
    const bannedClaims = [
      "保证更优",
      "保证最佳",
      "保证找到",
      "一定更好",
      "即为全局最优",
      "guaranteed",
      "optimal",
    ];
    for (const phrase of bannedClaims) {
      expect(SEARCH_SCOPE_NOTICE).not.toContain(phrase);
    }
  });

  it("explicitly limits coverage and denies monotone quality", () => {
    expect(SEARCH_SCOPE_NOTICE).toContain("结果不覆盖所有可行循环");
    expect(SEARCH_SCOPE_NOTICE).toContain("不保证");
  });

  it("budget hints describe effort, never outcome", () => {
    // A hint promising a better result would be an unsupported claim, because
    // a wider beam is only weakly monotone in quality.
    for (const option of BUDGET_OPTIONS) {
      expect(option.hint).not.toContain("更好");
      expect(option.hint).not.toContain("最优");
    }
  });
});

describe("budget presets", () => {
  it("covers every budget exactly once", () => {
    expect(BUDGET_OPTIONS.map((o) => o.id)).toEqual([...SEARCH_BUDGETS]);
  });

  it("widens the beam monotonically with effort", () => {
    expect(beamWidthForBudget("fast")).toBeLessThan(
      beamWidthForBudget("balanced"),
    );
    expect(beamWidthForBudget("balanced")).toBeLessThan(
      beamWidthForBudget("thorough"),
    );
  });

  it("labels every budget", () => {
    for (const budget of SEARCH_BUDGETS) {
      expect(budgetLabel(budget)).not.toBe(budget);
    }
  });
});

describe("objectives", () => {
  it("labels every offered objective", () => {
    for (const option of OBJECTIVE_OPTIONS) {
      expect(objectiveLabel(option.id)).toBe(option.label);
    }
  });

  it("scores a result by the selected objective", () => {
    const result = { totalDamage: 500, dps: 25 };
    expect(scoreForObjective(result, "total-damage")).toBe(500);
    expect(scoreForObjective(result, "dps")).toBe(25);
  });
});

describe("clampSearchDuration", () => {
  it("keeps in-range values", () => {
    expect(clampSearchDuration(20)).toBe(20);
  });

  it("clamps out-of-range values to the advertised bounds", () => {
    expect(clampSearchDuration(1)).toBe(MIN_SEARCH_DURATION_SECONDS);
    expect(clampSearchDuration(9999)).toBe(MAX_SEARCH_DURATION_SECONDS);
  });

  it("falls back rather than passing NaN to the engine", () => {
    expect(Number.isFinite(clampSearchDuration(Number.NaN))).toBe(true);
  });
});

describe("candidateCountLabel", () => {
  it("states the plain count when the list is full", () => {
    expect(candidateCountLabel(5, 5)).toBe("5 个候选循环");
  });

  it("discloses a short list honestly", () => {
    // UX-048: fewer than N results must be shown as fewer than N.
    const label = candidateCountLabel(3, 5);
    expect(label).toContain("3");
    expect(label).toContain("5");
    expect(label).toContain("仅找到");
  });
});

describe("improvement against the user's own rotation", () => {
  it("is null without a usable baseline", () => {
    expect(improvementOverBaseline(100, null)).toBeNull();
    expect(improvementOverBaseline(100, 0)).toBeNull();
  });

  it("computes a signed fraction", () => {
    expect(improvementOverBaseline(150, 100)).toBeCloseTo(0.5);
    expect(improvementOverBaseline(80, 100)).toBeCloseTo(-0.2);
  });

  it("distinguishes 'no baseline' from 'no change'", () => {
    // Rendering an absent baseline as 0% would assert a comparison that was
    // never made.
    expect(improvementLabel(null)).not.toContain("0.0%");
    expect(improvementLabel(null)).toContain("无基线");
    expect(improvementLabel(0)).toContain("持平");
  });

  it("signs the label", () => {
    expect(improvementLabel(0.25)).toContain("+25.0%");
    expect(improvementLabel(-0.25)).toContain("-25.0%");
  });

  it("tones a worse candidate as a warning but still renders it", () => {
    expect(improvementTone(0.1)).toBe("success");
    expect(improvementTone(-0.1)).toBe("warning");
    expect(improvementTone(null)).toBe("info");
    expect(improvementTone(0)).toBe("info");
  });
});

describe("searchEffortLabel", () => {
  it("reports the budget actually spent", () => {
    const label = searchEffortLabel(12, 340, 20);
    expect(label).toContain("12");
    expect(label).toContain("340");
    expect(label).toContain("20");
  });
});
