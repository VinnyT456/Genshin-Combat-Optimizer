import { describe, expect, it } from "vitest";
import { optimizeRotation } from "./optimizeRotation";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allCharacters } from "@/game-data/characters/registry";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { Rotation } from "@/types";
import type { OptimizerConfig } from "./CONTRACT";

// ============================================================================
// D3 — OPTIMIZER PERFORMANCE BUDGET.
//
// The optimizer is the first place `simulateRotation()` is called hundreds of
// thousands of times, so it is the first place engine cost is visible as
// product latency. This file establishes the baseline and guards it.
//
// WHAT THESE TESTS ARE FOR. They catch an ORDER-OF-MAGNITUDE regression — an
// accidental O(n^2) in a hot loop, a per-candidate `JSON.stringify`, a lost
// memo. They are deliberately NOT microbenchmarks and must never be tuned to
// the current number: a threshold set just above today's measurement becomes a
// flake on a loaded CI box and gets deleted, which is strictly worse than
// having no test. Every budget below is >= ~8x the measured median.
//
// MEASUREMENT DISCIPLINE. Wall-clock on a shared runner is noisy in one
// direction only (it can be slow, never impossibly fast), so every timing is a
// MEDIAN of repeated runs after warm-up iterations that let the JIT settle.
// Un-warmed first runs were measured at up to 10x the steady-state cost, which
// is precisely the kind of noise that produces a flaky perf test.
//
// ---------------------------------------------------------------------------
// WHY THIS ONE COUNTS INSTEAD OF TIMING (changed 2026-09-07)
// ---------------------------------------------------------------------------
//
// "simulateRotation is linear in rotation length" was previously a wall-clock
// RATIO of two medians and was the single flakiest assertion in the repo: it
// passed in isolation and failed in the full suite. This project routinely runs
// 4-6 agents concurrently, so that is the NORMAL condition, not an outlier.
//
// The failure mode was NOT "the machine got slow". The bound was 24 against a
// true ratio of ~7.8, so a uniform slowdown cancels in a ratio and cannot fail
// it. The break was in the DENOMINATOR: the SHORT leg runs ~2.2 ms, small
// enough that one scheduler preemption inflates it, and a median of 5 does not
// reject a spike that hits 3+ samples. Measured under 8 spinning cores, SHORT
// swung 2.19 -> 4.40 ms while LONG stayed ~17 ms, dragging the observed ratio
// from 7.8 down to 3.8 — the ratio moved 2x on noise alone, in both directions.
// A bound that can be crossed by contention on a correct engine trains everyone
// to ignore a red suite, which is how a real regression ships unnoticed.
//
// So the claim is now tested as what it actually is: a statement about GROWTH,
// not about milliseconds. Engine work is COUNTED via the public `buffResolver`
// seam (one invocation per damage instance) plus emitted timeline events. Both
// are exact integers, perfectly deterministic, and completely immune to CPU
// contention. Measured: calls == events == rotation length, exactly, for every
// length from 1 to 256.
//
// The counting bound was MUTATION-VERIFIED rather than assumed — fed synthetic
// O(n^2) and O(n log n) growth, it reports 64 and ~14 against a bound of 12 and
// fails both, while true linear growth reports 8 and passes. It retains its
// failing power; it merely stopped being able to fail for the wrong reason.
//
// The remaining timing tests below are all ABSOLUTE ceilings with >= 8x
// headroom, where contention can only push toward the (correct) failing
// direction of "too slow" and cannot produce a false RED from a noisy
// denominator. Those stay as they are.
//
// ---------------------------------------------------------------------------
// MEASURED 2026-09-06. Apple Silicon, vitest, 4-character generic team,
// `testEnemy`. `resumeFrom` (Phase B2) landed DURING this task, so both a
// BEFORE and an AFTER column exist.
// ---------------------------------------------------------------------------
//
// Cost of ONE `simulateRotation` call from t=0, by rotation length:
//
//     len    1     2     4     8    16    32    64   128
//     us  27.1  31.8  15.4  27.7  37.6  49.0 126.1 205.8
//
// LINEAR in length: ~15 us fixed overhead plus ~1.6 us per action. This is the
// engine behaving correctly — it replays the whole rotation from t=0.
//
// Cost of appending ONE action to an existing prefix — the operation the
// search actually performs, and the one `resumeFrom` changes:
//
//     prefix len      8      16      32      64     128
//     from zero   26.3us  27.6us  47.4us  89.0us 194.5us
//     resume       6.6us   3.5us   3.3us   3.3us   3.4us
//     speedup      4.0x    8.0x   14.3x   27.0x   57.5x
//
// Resume is FLAT in prefix length. That is the whole point.
//
// Full search, beamWidth = 8, scaling in the combat window (= depth).
// RE-MEASURED 2026-09-07 by A/B-ing `resumeFrom` on/off in an out-of-tree copy
// (median of 5 timed runs after warm-up), now that B2 has actually landed:
//
//     dur(s)          5      10      20      40      80
//     BEFORE ms    36.8   106.0   321.3  1049.9  4406.1
//     AFTER  ms     9.4    21.9    65.9   154.0   359.9
//     speedup      3.9x    4.8x    4.9x    6.8x   12.2x
//     nodes(AFTER)  687    1327    2615    5273   10435
//     BEFORE us/node 53.6   79.9   120.9   199.0   422.0
//     AFTER  us/node 13.7   16.5    25.2    29.2    34.5
//
// CAVEAT ON THE "BEFORE" COLUMN, stated so the number is not over-read: it is
// produced by replaying `[...prefix, action]` from t=0, which is what the
// pre-B2 optimizer did. Because `timeLimit` is ABSOLUTE, that replay re-bills
// the prefix and can fit ONE MORE action into the same window, so BEFORE
// occasionally reports a slightly higher top score at the same duration
// (dur=20: 25249.65 vs 25101.23) off a 34- rather than 33-action rotation.
// That is a property of the measurement harness, NOT a regression in search
// quality: the shipped AFTER path is independently verified to emit only
// rotations that replay to their reported damage with zero skipped actions
// (`optimizeRotation.test.ts`). Compare the us/node columns, which are
// harness-independent; do not read the `top=` values as a quality comparison.
//
// READ THIS TABLE CAREFULLY — it is the evidence that B2 did what it claimed.
// Node count is LINEAR in duration both before and after (it doubles as
// duration doubles, exactly as beam search predicts) and is essentially
// UNCHANGED by resume, which is correct: resume changes what a node COSTS,
// never how many there are.
//
// BEFORE, per-node cost climbed 53.6 -> 422.0 us with depth — a ~7.9x rise
// across a 16x depth range. That rising term is the second D in O(W*D^2): at
// depth d every candidate re-simulated a d-action prefix from t=0. AFTER,
// per-node cost rises only 13.7 -> 34.5 us (~2.5x) over the same range, and
// most of that residual is aura/ICD state that genuinely grows with run
// length, not prefix replay. The dominant quadratic term is gone.
// End to end the worst case improved ~12x (4406 ms -> 360 ms).
//
// Removing the engine's quadratic exposed a second one in the OPTIMIZER:
// `rotationKey` re-serialised the whole prefix per node. It is now built
// incrementally (`SearchNode.rotationKeyCache`). Without that fix the AFTER
// dur=80 case measured ~865 ms with per-node cost still rising to 82.9 us —
// i.e. the optimizer's own O(D^2) would have eaten most of the engine win.
//
// Full search, simulationDuration = 20s, scaling in beam width (AFTER):
//
//     beam       2      4      8     16     32     64
//     ms       6.3   12.7   23.8   50.1  132.9  200.7
//     nodes    680   1324   2615   5198  10369  20082
//
// LINEAR in beam width, as designed. Beam width is the safe knob to turn.
// ============================================================================

/** Warm-up iterations before timing, so the JIT has settled. */
const WARMUP_RUNS = 3;
/** Timed iterations; the median is taken to reject scheduler noise. */
const TIMED_RUNS = 5;
/** Milliseconds per second, for readable budget arithmetic. */
const MS_PER_SECOND = 1000;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

/** Median wall-clock milliseconds of `run`, after warm-up. */
function medianMs(run: () => void): number {
  for (let i = 0; i < WARMUP_RUNS; i++) run();
  const samples: number[] = [];
  for (let i = 0; i < TIMED_RUNS; i++) {
    const start = performance.now();
    run();
    samples.push(performance.now() - start);
  }
  return median(samples);
}

const TEAM = allCharacters.slice(0, 4);

function repeatedNormals(length: number): Rotation {
  const rotation: Rotation = [];
  for (let i = 0; i < length; i++) {
    rotation.push({ characterId: TEAM[0]!.id, actionType: "normal" });
  }
  return rotation;
}

describe("D3 — optimizer performance budget", () => {
  // -------------------------------------------------------------------------
  // Engine call cost. The optimizer does not own this number, but it is the
  // multiplier on everything the optimizer does, so a regression here shows up
  // as an optimizer regression and must be attributable.
  // -------------------------------------------------------------------------

  it("a single simulateRotation call stays well under budget", () => {
    // Measured ~38 us at length 16. Budget 500 us ~= 13x headroom.
    const SINGLE_CALL_BUDGET_US = 500;
    const CALLS = 200;
    const rotation = repeatedNormals(16);

    const ms = medianMs(() => {
      for (let i = 0; i < CALLS; i++) {
        simulateRotation(TEAM, rotation, testEnemy, { timeLimit: 10000 });
      }
    });

    const perCallUs = (ms / CALLS) * MS_PER_SECOND;
    expect(perCallUs).toBeLessThan(SINGLE_CALL_BUDGET_US);
  });

  it("simulateRotation is linear in rotation length, not quadratic", () => {
    // COUNTING, NOT TIMING — deliberate. See "WHY THIS ONE COUNTS" above.
    //
    // Work is counted through the PUBLIC `buffResolver` seam, which the engine
    // invokes once per damage instance. The resolver returns `base` unchanged,
    // so it is behaviour-neutral: totals are identical with and without it.
    // This is still black-box — a documented config hook, not engine internals.
    const SHORT = 16;
    const LONG = 128;
    const LENGTH_RATIO = LONG / SHORT;
    // Slack absorbs per-run fixed work while still failing on any super-linear
    // term: an O(n^2) engine yields ratio 64 and an O(n log n) one ~14, both
    // far above this bound. Verified by mutation, not assumed.
    const SLACK = 1.5;

    const workFor = (len: number): { calls: number; events: number } => {
      let calls = 0;
      const result = simulateRotation(TEAM, repeatedNormals(len), testEnemy, {
        timeLimit: 10000,
        // Pass-through resolver: counts invocations, changes no number.
        buffResolver: (base) => {
          calls++;
          return base;
        },
      });
      return { calls, events: result.timeline.length };
    };

    const short = workFor(SHORT);
    const long = workFor(LONG);

    // Guard the denominator: a zero/near-zero SHORT measurement would make any
    // ratio look fine, which is exactly how the old timing version went flaky.
    expect(short.calls).toBeGreaterThan(0);
    expect(short.events).toBeGreaterThan(0);

    expect(long.calls / short.calls).toBeLessThan(LENGTH_RATIO * SLACK);
    expect(long.events / short.events).toBeLessThan(LENGTH_RATIO * SLACK);

    // ...and work must actually GROW with length, or the engine silently
    // stopped simulating the tail and the ratio above is vacuously satisfied.
    expect(long.calls).toBeGreaterThan(short.calls);
    expect(long.events).toBeGreaterThan(short.events);
  });

  // -------------------------------------------------------------------------
  // Search cost.
  // -------------------------------------------------------------------------

  it("a representative search completes inside its wall-clock budget", () => {
    // beam 8 / 20s is the representative interactive case. Measured ~118 ms;
    // budget 2000 ms is ~17x headroom, still far below a human-noticeable
    // multi-second stall.
    const BUDGET_MS = 2000;
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 20,
      objective: "total-damage",
      topN: 5,
    };

    let nodes = 0;
    const ms = medianMs(() => {
      nodes = optimizeRotation(TEAM, testEnemy, config).nodesExpanded;
    });

    expect(ms).toBeLessThan(BUDGET_MS);
    // Guard the denominator: a search that got fast by exploring nothing is a
    // correctness regression wearing a performance win's clothes.
    expect(nodes).toBeGreaterThan(1000);
  });

  it("node count stays LINEAR in beam width", () => {
    // Beam search expands at most beamWidth nodes per depth, so doubling the
    // beam must at most double the nodes. A super-linear result means pruning
    // (rotation-key or transposition dedupe) has stopped working.
    const base: Omit<OptimizerConfig, "beamWidth"> = {
      simulationDuration: 20,
      objective: "total-damage",
      topN: 5,
    };
    const nodesAt = (beamWidth: number): number =>
      optimizeRotation(TEAM, testEnemy, { ...base, beamWidth }).nodesExpanded;

    const small = nodesAt(8);
    const large = nodesAt(32);

    // 4x the beam, so 4x the nodes; 1.5x slack absorbs boundary effects where
    // a narrow beam terminates a branch a wide one keeps alive.
    const RATIO = 32 / 8;
    const SLACK = 1.5;
    expect(large / small).toBeLessThan(RATIO * SLACK);
    // ...and it must actually grow, or the beam width is being ignored.
    expect(large).toBeGreaterThan(small);
  });

  it("node count stays LINEAR in search depth", () => {
    // This is the invariant that ISOLATES the O(W*D^2) problem to per-node
    // COST rather than node COUNT. It must keep holding after `resumeFrom`
    // lands: resume changes how expensive a node is, never how many there are.
    const base: Omit<OptimizerConfig, "simulationDuration"> = {
      beamWidth: 8,
      objective: "total-damage",
      topN: 5,
    };
    const nodesAt = (simulationDuration: number): number =>
      optimizeRotation(TEAM, testEnemy, { ...base, simulationDuration })
        .nodesExpanded;

    const short = nodesAt(10);
    const long = nodesAt(40);

    const RATIO = 40 / 10;
    const SLACK = 1.5;
    expect(long / short).toBeLessThan(RATIO * SLACK);
    expect(long).toBeGreaterThan(short);
  });

  it("scales to a long window without falling off a cliff", () => {
    // dur=80 is the deepest case and the one `resumeFrom` most improved:
    // 2474 ms before, ~141 ms after. The budget is 2000 ms — ~14x the AFTER
    // measurement, but deliberately still BELOW the 2474 ms BEFORE number, so
    // this test now fails if incremental expansion is ever silently lost
    // (e.g. `resumeFrom` regressing to inert, or a node losing its snapshot).
    const BUDGET_MS = 2000;
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 80,
      objective: "total-damage",
      topN: 5,
    };

    // Single timed run, no warm-up loop: at ~2.5 s each, medianMs' 8 runs
    // would cost ~20 s of suite time to sharpen a bound that already has ~8x
    // headroom. A cold run is SLOWER than steady state, so measuring once is
    // the conservative choice for a ceiling test.
    const start = performance.now();
    optimizeRotation(TEAM, testEnemy, config);
    const ms = performance.now() - start;

    expect(ms).toBeLessThan(BUDGET_MS);
  }, 120000);

  // -------------------------------------------------------------------------
  // Performance must not have been bought with non-determinism.
  // -------------------------------------------------------------------------

  it("repeated searches do the SAME amount of work", () => {
    // Node count is a pure function of the input. If it varies run to run,
    // something time-, cache- or iteration-order-dependent leaked into the
    // search and every number in this file is meaningless.
    const config: OptimizerConfig = {
      beamWidth: 8,
      simulationDuration: 20,
      objective: "total-damage",
      topN: 5,
    };
    const first = optimizeRotation(TEAM, testEnemy, config);
    for (let i = 0; i < 3; i++) {
      const again = optimizeRotation(TEAM, testEnemy, config);
      expect(again.nodesExpanded).toBe(first.nodesExpanded);
      expect(JSON.stringify(again.ranked.map((r) => r.rotation))).toBe(
        JSON.stringify(first.ranked.map((r) => r.rotation)),
      );
    }
  });
});
