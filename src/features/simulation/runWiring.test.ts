import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// WIRING guard for UX-005.
//
// `runState.ts` is pure and fully unit-tested, but passing unit tests prove
// nothing about whether the page USES it — the project has already been bitten
// by exactly that (a fully-tested `buildBreakdownTables` whose output no
// component ever rendered, and a tested `resolveDashboardState` that the page
// reimplemented inline instead of calling).
//
// The defect this guards is specific and invisible to a unit test: a result
// region reading LIVE editor state next to numbers computed from older inputs.
// So this asserts against the page source itself. It is a blunt instrument, and
// deliberately so — it fails loudly when someone reconnects a result region to
// live state, which is the regression that matters.
//
// STATUS (TASK #068). A DOM runner now exists, and
// `src/app/workspaceRun.dom.test.tsx` covers the properties below that are
// observable in a rendered DOM: that the page mounts, that Run produces
// numbers, that editing an input marks the result stale without changing the
// numbers, and that the results region keeps the RUN's team rather than the
// live one (that last mutation makes the page throw, which no string check
// could have described).
//
// The assertions kept here are the ones no render test reaches yet. They were
// each re-checked by mutation: `generateRotationInsights(run.result, team)`
// still passes the whole DOM suite, so that binding is genuinely unguarded
// without the string check below. These stay until a render test covers them;
// they are NOT redundant. Do not delete this file wholesale.
// ---------------------------------------------------------------------------

const PAGE_PATH = resolve(process.cwd(), "src/app/page.tsx");
const pageSource = readFileSync(PAGE_PATH, "utf8");

/** The results block: everything the run's numbers are rendered inside. */
function resultsRegion(): string {
  const start = pageSource.indexOf("{showResults && run !== null && (");
  const end = pageSource.indexOf("{/* Sleek Minimal Footer */}");
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return pageSource.slice(start, end);
}

describe("page wires results to the run snapshot", () => {
  it("stores the result as a run, not a bare SimulationResult", () => {
    expect(pageSource).toContain("useState<SimulationRun | null>(null)");
    expect(pageSource).toContain("createRun(");
  });

  it("derives staleness from the fingerprint rather than a stored flag", () => {
    expect(pageSource).toContain("isRunStale(run, liveInputs)");
    // A `setResultStale` setter would mean staleness is latched again, which
    // reintroduces the "an edit handler forgot to flag it" failure mode.
    expect(pageSource).not.toContain("setResultStale");
  });

  it("calls the tested dashboard state model instead of reimplementing it", () => {
    expect(pageSource).toContain("resolveDashboardState({");
  });

  it("renders no live editor state inside the results region", () => {
    // These identifiers are the LIVE inputs. Inside the results region every
    // one of them must be reached through `run.inputs.*` instead, otherwise a
    // stale result gets labelled with the current configuration.
    const region = resultsRegion();
    const liveOnlyBindings = [
      "team={team}",
      "team={teamMembers}",
      "enemy.name",
      "enemy.level",
      "rotation.length",
    ];
    for (const binding of liveOnlyBindings) {
      expect(region).not.toContain(binding);
    }
  });

  it("passes the run's own team to result regions", () => {
    const region = resultsRegion();
    expect(region).toContain("team={run.inputs.team}");
  });

  it("builds the copied summary from the run's inputs", () => {
    // The copy-summary function was the clearest instance of the defect: it
    // read the live enemy and live rotation length beside the run's damage.
    const start = pageSource.indexOf("function handleCopySummary()");
    const end = pageSource.indexOf("navigator.clipboard", start);
    const summary = pageSource.slice(start, end);

    expect(summary).toContain("inputs.enemy.name");
    expect(summary).toContain("inputs.rotation.length");
    expect(summary).toContain("inputs.team.map");
  });

  it("generates insights from the run's team, not the live team", () => {
    expect(pageSource).toContain(
      "generateRotationInsights(run.result, run.inputs.team)",
    );
  });

  it("withholds a stale run from the team builder's damage shares", () => {
    // The builder maps per-character shares onto the team it renders, so a
    // stale run there would attribute one team's damage to another's slots.
    expect(pageSource).toContain("resultStale ? null : (run?.result ?? null)");
  });
});

describe("page wires rotation search", () => {
  it("reaches the optimizer only through the adapter", () => {
    expect(pageSource).toContain("@/features/optimizer/optimizerAdapter");
    // The page must never import the engine or the search directly.
    expect(pageSource).not.toContain("@/simulation/optimizer");
    expect(pageSource).not.toContain("@/simulation/engine");
  });

  it("preserves the incumbent rotation when adopting a candidate", () => {
    expect(pageSource).toContain("adoptCandidate(rotation, candidate, rank, adoption)");
    expect(pageSource).toContain("restoreIncumbent(adoption)");
  });

  it("drops the restore offer when the user edits by hand", () => {
    expect(pageSource).toContain("clearAdoptionOnManualEdit()");
  });

  it("compares candidates only against a fresh baseline", () => {
    // A stale run describes different inputs, so using it as the baseline
    // would compute an improvement against the wrong rotation.
    expect(pageSource).toContain("if (run === null || resultStale) return null;");
  });
});
