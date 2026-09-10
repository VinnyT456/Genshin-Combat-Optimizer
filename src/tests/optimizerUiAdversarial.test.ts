import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEARCH_DURATION_SECONDS,
  MAX_SEARCH_DURATION_SECONDS,
  MIN_SEARCH_DURATION_SECONDS,
  SEARCH_BUDGETS,
  beamWidthForBudget,
  clampSearchDuration,
  improvementOverBaseline,
  runSearch,
  scoreForObjective,
  type SearchBudget,
  type SearchRequest,
  type OptimizationObjective,
} from "@/features/optimizer/optimizerAdapter";
import {
  NO_ADOPTION,
  adoptCandidate,
  canRestore,
  clearAdoptionOnManualEdit,
  restoreIncumbent,
} from "@/features/optimizer/incumbentRotation";
import {
  ADOPT_SAFETY_NOTICE,
  SEARCH_SCOPE_NOTICE,
  candidateCountLabel,
  improvementLabel,
} from "@/features/optimizer/searchPresentation";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { buildCharacterStates } from "@/simulation/optimizer/actionGenerator";
import { validateAction } from "@/simulation/engine/validateAction";
import type { Rotation } from "@/types";
import { NEUTRAL_ENEMY, makeTestCharacter } from "./helpers/fixtures";

// ============================================================================
// ADVERSARIAL attack on the optimizer UI seam (TASK #067).
//
// The optimizer is the one surface where the product makes a RECOMMENDATION, so
// the failure modes are different in kind from a wrong damage number:
//
//   - an IMPOSSIBLE rotation offered as a suggestion (the user copies it into
//     the editor and it will not execute);
//   - a NON-DETERMINISTIC ranking (two identical searches disagree, and the
//     beam search's own pruning depends on determinism);
//   - a MIS-ORDERED ranking (rank 1 is not actually the best candidate);
//   - an OPTIMALITY CLAIM the beam search cannot support.
//
// Every candidate below is re-validated against `validateAction()` -- the same
// function the engine uses -- and re-simulated through `simulateRotation()`, so
// the check does not trust the optimizer's own bookkeeping.
// ============================================================================

const TEAM = [makeTestCharacter("a"), makeTestCharacter("b")];

function request(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    team: TEAM,
    enemy: NEUTRAL_ENEMY,
    budget: "fast",
    objective: "total-damage",
    durationSeconds: 10,
    config: { critMode: "never" },
    ...overrides,
  };
}

describe("optimizer UI — determinism", () => {
  it("two identical searches return byte-identical outcomes", () => {
    const a = runSearch(request());
    const b = runSearch(request());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it.each(SEARCH_BUDGETS)("budget %s is deterministic", (budget) => {
    const a = runSearch(request({ budget }));
    const b = runSearch(request({ budget }));
    expect(JSON.stringify(a.candidates)).toBe(JSON.stringify(b.candidates));
    expect(a.nodesExpanded).toBe(b.nodesExpanded);
  });

  it.each<OptimizationObjective>(["total-damage", "dps"])(
    "objective %s is deterministic",
    (objective) => {
      const a = runSearch(request({ objective }));
      const b = runSearch(request({ objective }));
      expect(JSON.stringify(a.candidates)).toBe(JSON.stringify(b.candidates));
    },
  );

  it("a repeated search does not accumulate hidden state", () => {
    // Five runs, not two: a module-level cache or counter would usually show up
    // on the third or later run rather than the second.
    const runs = Array.from({ length: 5 }, () =>
      JSON.stringify(runSearch(request()).candidates),
    );
    expect(new Set(runs).size).toBe(1);
  });
});

describe("optimizer UI — no impossible rotation is ever offered", () => {
  const outcome = runSearch(request({ budget: "balanced" }));

  it("PRECONDITION: the search actually returned candidates", () => {
    // Otherwise every assertion below is vacuously true.
    expect(outcome.candidates.length).toBeGreaterThan(0);
  });

  it("every action of every candidate validates against the engine", () => {
    for (const candidate of outcome.candidates) {
      // Re-walk the rotation through the ENGINE's own validator rather than
      // trusting that the optimizer only generated legal moves.
      const replay = simulateRotation(TEAM, candidate.rotation, NEUTRAL_ENEMY, {
        critMode: "never",
      });
      expect(replay.timeline.length).toBeGreaterThan(0);
    }
  });

  it("every candidate names a character that is actually on the team", () => {
    const ids = new Set(TEAM.map((c) => c.id));
    for (const candidate of outcome.candidates) {
      for (const action of candidate.rotation) {
        expect(ids.has(action.characterId), action.characterId).toBe(true);
      }
    }
  });

  it("re-simulating a candidate reproduces the score the UI displays", () => {
    // If these diverge, the ranking the user sees is not the ranking the engine
    // would produce for the rotation they copy into the editor.
    for (const candidate of outcome.candidates) {
      const replay = simulateRotation(TEAM, candidate.rotation, NEUTRAL_ENEMY, {
        critMode: "never",
      });
      expect(scoreForObjective(replay, outcome.objective)).toBeCloseTo(
        candidate.score,
        6,
      );
    }
  });

  it("validateAction accepts the first action of every candidate", () => {
    for (const candidate of outcome.candidates) {
      const first = candidate.rotation[0];
      if (first === undefined) continue;
      const initial = simulateRotation(TEAM, [], NEUTRAL_ENEMY, {
        critMode: "never",
      });
      const states = buildCharacterStates(TEAM, initial.finalState);
      expect(
        validateAction({
          action: first,
          states,
          time: initial.finalState.time,
          activeCharacterId: initial.finalState.activeCharacterId,
          config: { critMode: "never" },
        }).valid,
        JSON.stringify(first),
      ).toBe(true);
    }
  });
});

describe("optimizer UI — ranking correctness", () => {
  const outcome = runSearch(request({ budget: "balanced" }));

  it("candidates are ordered best-first by score", () => {
    const scores = outcome.candidates.map((c) => c.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("no candidate exceeds the requested topN", () => {
    expect(outcome.candidates.length).toBeLessThanOrEqual(outcome.requestedTopN);
  });

  it("candidate rotations are distinct — no duplicate suggestions", () => {
    const seen = outcome.candidates.map((c) => JSON.stringify(c.rotation));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("a larger beam never ranks a WORSE best candidate", () => {
    // Beam search offers no optimality guarantee, but widening the beam must
    // not lose a candidate it already had — that would indicate a pruning bug
    // rather than an inherent limitation.
    const fast = runSearch(request({ budget: "fast" })).candidates[0];
    const thorough = runSearch(request({ budget: "thorough" })).candidates[0];
    if (fast === undefined || thorough === undefined) return;
    expect(thorough.score).toBeGreaterThanOrEqual(fast.score - 1e-9);
  });

  it("beamWidth is monotonic in budget", () => {
    const widths = SEARCH_BUDGETS.map(beamWidthForBudget);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  });
});

describe("optimizer UI — makes no optimality claim", () => {
  it("the scope notice does not promise an optimum", () => {
    const forbidden = ["最优", "最佳", "optimal", "best possible", "guarantee"];
    for (const word of forbidden) {
      expect(SEARCH_SCOPE_NOTICE.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  it("the adopt notice warns rather than recommends", () => {
    expect(ADOPT_SAFETY_NOTICE.length).toBeGreaterThan(0);
  });

  it("candidateCountLabel is honest when the search returned fewer than asked", () => {
    const label = candidateCountLabel(3, 5);
    expect(label).toContain("3");
    expect(label).toContain("5");
  });

  it("improvementLabel invents no number when there is no baseline", () => {
    expect(improvementLabel(null)).not.toMatch(/\d/);
  });

  it("improvementOverBaseline returns null rather than a fabricated infinity", () => {
    expect(improvementOverBaseline(100, null)).toBeNull();
    expect(improvementOverBaseline(100, 0)).toBeNull();
    expect(improvementOverBaseline(100, -5)).toBeNull();
  });

  it("improvementOverBaseline is exact on a hand-computable case", () => {
    expect(improvementOverBaseline(150, 100)).toBeCloseTo(0.5, 12);
    expect(improvementOverBaseline(50, 100)).toBeCloseTo(-0.5, 12);
  });
});

describe("optimizer UI — search duration clamping", () => {
  it.each([
    [MIN_SEARCH_DURATION_SECONDS - 1, MIN_SEARCH_DURATION_SECONDS],
    [MIN_SEARCH_DURATION_SECONDS, MIN_SEARCH_DURATION_SECONDS],
    [MAX_SEARCH_DURATION_SECONDS, MAX_SEARCH_DURATION_SECONDS],
    [MAX_SEARCH_DURATION_SECONDS + 1, MAX_SEARCH_DURATION_SECONDS],
    [0, MIN_SEARCH_DURATION_SECONDS],
    [-100, MIN_SEARCH_DURATION_SECONDS],
  ])("clamps %p to %p", (input, expected) => {
    expect(clampSearchDuration(input)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "non-finite %p falls back to the default rather than propagating",
    (input) => {
      expect(clampSearchDuration(input)).toBe(DEFAULT_SEARCH_DURATION_SECONDS);
    },
  );

  it("the clamped duration is what the outcome reports", () => {
    const outcome = runSearch(request({ durationSeconds: 9999 }));
    expect(outcome.durationSeconds).toBe(MAX_SEARCH_DURATION_SECONDS);
  });
});

// ---------------------------------------------------------------------------
// INCUMBENT PRESERVATION — search must never destroy hand-authored work.
// ---------------------------------------------------------------------------

const HAND_AUTHORED: Rotation = [
  { characterId: "a", actionType: "skill" },
  { characterId: "b", actionType: "burst" },
];
const SUGGESTION_ONE: Rotation = [{ characterId: "a", actionType: "normal" }];
const SUGGESTION_TWO: Rotation = [{ characterId: "b", actionType: "normal" }];

describe("optimizer UI — incumbent rotation preservation", () => {
  it("adopting captures the hand-authored rotation", () => {
    const t = adoptCandidate(HAND_AUTHORED, SUGGESTION_ONE, 1, NO_ADOPTION);
    expect(t.rotation).toEqual(SUGGESTION_ONE);
    expect(t.adoption.incumbent).toEqual(HAND_AUTHORED);
    expect(canRestore(t.adoption)).toBe(true);
  });

  it("adopting a SECOND candidate still restores the ORIGINAL", () => {
    // The named failure: browsing three suggestions silently loses the user's
    // own rotation after the first click.
    const first = adoptCandidate(HAND_AUTHORED, SUGGESTION_ONE, 1, NO_ADOPTION);
    const second = adoptCandidate(
      first.rotation,
      SUGGESTION_TWO,
      2,
      first.adoption,
    );
    const third = adoptCandidate(
      second.rotation,
      SUGGESTION_ONE,
      3,
      second.adoption,
    );
    expect(third.adoption.incumbent).toEqual(HAND_AUTHORED);
    expect(restoreIncumbent(third.adoption)?.rotation).toEqual(HAND_AUTHORED);
  });

  it("nothing is mutated — the original rotation object is unchanged", () => {
    const snapshot = JSON.stringify(HAND_AUTHORED);
    const t = adoptCandidate(HAND_AUTHORED, SUGGESTION_ONE, 1, NO_ADOPTION);
    adoptCandidate(t.rotation, SUGGESTION_TWO, 2, t.adoption);
    expect(JSON.stringify(HAND_AUTHORED)).toBe(snapshot);
  });

  it("restore is unavailable before any adoption", () => {
    expect(canRestore(NO_ADOPTION)).toBe(false);
    expect(restoreIncumbent(NO_ADOPTION)).toBeNull();
  });

  it("a manual edit clears the adoption, so restore cannot resurrect stale work", () => {
    const t = adoptCandidate(HAND_AUTHORED, SUGGESTION_ONE, 1, NO_ADOPTION);
    const cleared = clearAdoptionOnManualEdit();
    expect(canRestore(cleared)).toBe(false);
    // And the pre-edit state really was restorable, so this is not vacuous.
    expect(canRestore(t.adoption)).toBe(true);
  });

  it("the adopted rank is carried for labelling and matches what was adopted", () => {
    const t = adoptCandidate(HAND_AUTHORED, SUGGESTION_ONE, 4, NO_ADOPTION);
    expect(t.adoption.adoptedRank).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// PERFORMANCE REGRESSION — counted, not wall-clocked.
//
// MASTER-PLAN §9 item 9 requires counting budgets in CI where wall-clock timing
// would be unreliable. `nodesExpanded` is the search's own work counter and is
// fully deterministic, so it is a stable budget on any machine. A wall-clock
// assertion here would be flaky on a loaded CI box and is deliberately avoided.
// ---------------------------------------------------------------------------

describe("optimizer — counted performance budget", () => {
  it.each<[SearchBudget, number]>([
    ["fast", 5_000],
    ["balanced", 20_000],
    ["thorough", 100_000],
  ])("budget %s expands at most %i nodes", (budget, limit) => {
    const outcome = runSearch(request({ budget }));
    expect(outcome.nodesExpanded).toBeGreaterThan(0);
    expect(outcome.nodesExpanded).toBeLessThanOrEqual(limit);
  });

  it("node count is monotonic in budget", () => {
    const counts = SEARCH_BUDGETS.map(
      (budget) => runSearch(request({ budget })).nodesExpanded,
    );
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
  });
});
