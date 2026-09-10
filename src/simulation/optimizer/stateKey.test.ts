import { describe, expect, it } from "vitest";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { stateKey } from "./stateKey";
import { MEMO_KEY_DECIMAL_PLACES } from "./CONTRACT";
import { createAura, decayAuraState } from "@/simulation/reactions/aura";
import {
  AURA_GAUGE_RELATIVE_TOLERANCE,
  auraStatesEquivalent,
} from "@/simulation/reactions/auraTolerance";
import type { AuraState } from "@/simulation/reactions/types";
import type { Rotation } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allCharacters } from "@/game-data/characters/registry";
import { testEnemy } from "@/game-data/enemies/testEnemy";

// Synthetic fixtures only: character game-data multipliers are unverified
// (TASK #028 provenance audit), and a memo key is a pure function of snapshot
// SHAPE, so real kit numbers would add no coverage.

function energy(current: number) {
  return { current, max: 60, totalGained: 0, totalSpent: 0 };
}

function char(over: Partial<CharacterSnapshot> = {}): CharacterSnapshot {
  return {
    characterId: "a",
    energy: energy(10),
    cooldowns: {},
    ...over,
  };
}

function snap(over: Partial<SimulationSnapshot> = {}): SimulationSnapshot {
  return { time: 0, characters: { a: char() }, ...over };
}

describe("stateKey", () => {
  it("is stable across repeated calls", () => {
    const s = snap();
    expect(stateKey(s)).toBe(stateKey(s));
  });

  it("ignores object insertion order (the transposition it must collapse)", () => {
    const a: SimulationSnapshot = {
      time: 1,
      characters: { x: char({ characterId: "x" }), y: char({ characterId: "y" }) },
    };
    const b: SimulationSnapshot = {
      time: 1,
      characters: { y: char({ characterId: "y" }), x: char({ characterId: "x" }) },
    };
    expect(stateKey(a)).toBe(stateKey(b));
  });

  it("ignores cooldown key insertion order", () => {
    const a = snap({ characters: { a: char({ cooldowns: { e: 1, q: 2 } }) } });
    const b = snap({ characters: { a: char({ cooldowns: { q: 2, e: 1 } }) } });
    expect(stateKey(a)).toBe(stateKey(b));
  });

  // --- REQUIREMENT 3: float quantization -----------------------------------

  it("collapses ULP-level float differences that would defeat the memo", () => {
    const exact = 0.3;
    const drifted = 0.1 + 0.2; // 0.30000000000000004 in IEEE-754
    // Guard the premise: if these were equal the test would prove nothing.
    expect(drifted).not.toBe(exact);
    const a = snap({ characters: { a: char({ energy: energy(exact) }) } });
    const b = snap({ characters: { a: char({ energy: energy(drifted) }) } });
    expect(stateKey(a)).toBe(stateKey(b));
  });

  it("still distinguishes differences above the quantization grid", () => {
    const step = 10 ** -MEMO_KEY_DECIMAL_PLACES;
    const a = snap({ characters: { a: char({ energy: energy(10) }) } });
    const b = snap({
      characters: { a: char({ energy: energy(10 + step * 10) }) },
    });
    expect(stateKey(a)).not.toBe(stateKey(b));
  });

  it("normalizes -0 and 0 to the same key", () => {
    const a = snap({ characters: { a: char({ cooldowns: { e: 0 } }) } });
    const b = snap({ characters: { a: char({ cooldowns: { e: -0 } }) } });
    expect(stateKey(a)).toBe(stateKey(b));
  });

  // --- Completeness: every carried field must be discriminated -------------
  // Each of these fails if the key omits that field, which is the defect that
  // silently drops a genuinely-different node from the beam.

  it("discriminates normalStringIndex", () => {
    const a = snap({ characters: { a: char({ normalStringIndex: 0 }) } });
    const b = snap({ characters: { a: char({ normalStringIndex: 3 }) } });
    expect(stateKey(a)).not.toBe(stateKey(b));
  });

  it("discriminates ICD counters, and absent is not the same as empty", () => {
    const absent = snap({ characters: { a: char() } });
    const empty = snap({ characters: { a: char({ icd: {} }) } });
    const one = snap({
      characters: {
        a: char({ icd: { pyro: { windowStart: 0, hitsInWindow: 2 } } }),
      },
    });
    // Absence means "first hit ever" (always applies) — a real state difference.
    expect(stateKey(absent)).not.toBe(stateKey(empty));
    expect(stateKey(empty)).not.toBe(stateKey(one));
  });

  it("discriminates ICD hit count (the resume-bias field)", () => {
    const two = snap({
      characters: {
        a: char({ icd: { pyro: { windowStart: 0, hitsInWindow: 2 } } }),
      },
    });
    const three = snap({
      characters: {
        a: char({ icd: { pyro: { windowStart: 0, hitsInWindow: 3 } } }),
      },
    });
    expect(stateKey(two)).not.toBe(stateKey(three));
  });

  it("discriminates resource values", () => {
    const a = snap({
      characters: {
        a: char({
          resources: { stacks: { id: "stacks", value: 1, max: 4, lastChanged: 0 } },
        }),
      },
    });
    const b = snap({
      characters: {
        a: char({
          resources: { stacks: { id: "stacks", value: 4, max: 4, lastChanged: 0 } },
        }),
      },
    });
    expect(stateKey(a)).not.toBe(stateKey(b));
  });

  it("discriminates active stance", () => {
    const a = snap({
      characters: { a: char({ activeStance: { stance: { id: "melee" }, startTime: 0 } }) },
    });
    const b = snap({
      characters: { a: char({ activeStance: { stance: { id: "ranged" }, startTime: 0 } }) },
    });
    expect(stateKey(a)).not.toBe(stateKey(b));
  });

  it("discriminates enemy aura, and absent is not the same as empty", () => {
    const absent = snap();
    const empty = snap({ enemyAuras: { e1: { auras: [], compound: [] } } });
    const pyro = snap({
      enemyAuras: {
        e1: {
          auras: [{ element: "pyro", gauge: 2, since: 0, decayRate: 5 }],
          compound: [],
        },
      },
    });
    expect(stateKey(absent)).not.toBe(stateKey(empty));
    expect(stateKey(empty)).not.toBe(stateKey(pyro));
  });

  it("discriminates aura gauge above tolerance but collapses it below", () => {
    const base = (gauge: number): SimulationSnapshot =>
      snap({
        enemyAuras: {
          e1: {
            auras: [{ element: "pyro", gauge, since: 0, decayRate: 5 }],
            compound: [],
          },
        },
      });
    // Below mechanics' gauge tolerance: must collapse.
    expect(stateKey(base(2))).toBe(stateKey(base(2 + 1e-15)));
    // A real gauge difference: must not.
    expect(stateKey(base(2))).not.toBe(stateKey(base(2.5)));
  });

  it("keeps aura `since` and `decayRate` exact (mechanics contract)", () => {
    const mk = (since: number, decayRate: number): SimulationSnapshot =>
      snap({
        enemyAuras: {
          e1: { auras: [{ element: "pyro", gauge: 2, since, decayRate }], compound: [] },
        },
      });
    expect(stateKey(mk(0, 5))).not.toBe(stateKey(mk(0.5, 5)));
    expect(stateKey(mk(0, 5))).not.toBe(stateKey(mk(0, 6)));
  });

  it("discriminates activeCharacterId and time", () => {
    expect(stateKey(snap({ activeCharacterId: "a" }))).not.toBe(
      stateKey(snap({ activeCharacterId: "b" })),
    );
    expect(stateKey(snap({ time: 1 }))).not.toBe(stateKey(snap({ time: 2 })));
  });

  // -----------------------------------------------------------------------
  // Real re-anchored decay, not synthetic epsilon.
  //
  // The tests above perturb a gauge by hand. That proves the ROUNDING works but
  // not that the grid is coarse enough for the drift the mechanics layer
  // actually produces: `applyElement`/`decayAuraState` re-anchor on every hit,
  // so a checkpointed path accumulates extra roundings a straight-through path
  // never performs. Mechanics states that drift is bounded by
  // AURA_GAUGE_RELATIVE_TOLERANCE and that memo-hashing MUST quantize.
  // These tests drive the real decay functions to confirm the key honours it.
  // -----------------------------------------------------------------------

  it("hashes re-anchored and straight-through decay to the SAME key", () => {
    const withAuras = (state: AuraState): SimulationSnapshot =>
      snap({ time: 0, enemyAuras: { e1: state } });

    const origin: AuraState = {
      auras: [createAura("hydro", 4, 0)],
      compound: [],
    };
    const END = 6;

    // Straight-through: one decay step to the end time.
    const straight = decayAuraState(origin, END);

    // Re-anchored: the same interval walked in many small steps, which is what
    // a rotation with many hits (or a resumed checkpoint) produces.
    const STEPS = 240;
    let stepped = origin;
    for (let i = 1; i <= STEPS; i++) {
      stepped = decayAuraState(stepped, (END * i) / STEPS);
    }

    // Precondition: mechanics considers these equivalent...
    expect(auraStatesEquivalent(straight, stepped)).toBe(true);
    // ...and they are genuinely NOT byte-identical, or this proves nothing.
    const a = straight.auras[0]!;
    const b = stepped.auras[0]!;
    expect(a.gauge).not.toBe(b.gauge);
    expect(Math.abs(a.gauge - b.gauge)).toBeLessThanOrEqual(
      AURA_GAUGE_RELATIVE_TOLERANCE * Math.max(1, Math.abs(a.gauge)),
    );

    // The payload: equivalent states must not split the memo.
    expect(stateKey(withAuras(straight))).toBe(stateKey(withAuras(stepped)));
  });

  it("still separates auras that differ by more than the tolerance", () => {
    // The quantization must not be so coarse it merges genuinely different
    // states — that would be a silent loss of search space.
    const mk = (gauge: number): SimulationSnapshot =>
      snap({
        enemyAuras: {
          e1: {
            auras: [{ element: "hydro", gauge, since: 0, decayRate: 5.3125 }],
            compound: [],
          },
        },
      });
    const base = decayAuraState(
      { auras: [createAura("hydro", 4, 0)], compound: [] },
      3,
    ).auras[0]!.gauge;

    expect(stateKey(mk(base))).not.toBe(stateKey(mk(base + 1e-6)));
  });

  it("quantizes compound aura gauges on the same grid as elemental ones", () => {
    // `auraKey` handles `compound` through a separate branch; a regression
    // there would be invisible to the elemental tests above.
    const mk = (gauge: number): SimulationSnapshot =>
      snap({
        enemyAuras: {
          e1: {
            auras: [],
            compound: [{ kind: "quicken", gauge, since: 0, decayRate: 5 }],
          },
        },
      });
    expect(stateKey(mk(1.5))).toBe(stateKey(mk(1.5 + 1e-12)));
    expect(stateKey(mk(1.5))).not.toBe(stateKey(mk(1.5 + 1e-6)));
  });

  // -----------------------------------------------------------------------
  // LIVE round-trip through the real engine (added TASK #054, Phase D3).
  //
  // Everything above builds snapshots by hand or drives the decay functions
  // directly. Neither exercises the path that actually matters now that
  // `resumeFrom` (Phase B2) is WIRED and used in the beam-search hot loop
  // (`optimizeRotation.ts`): aura state genuinely round-trips OUT of a
  // snapshot and back IN, through the engine, on every node expansion.
  //
  // MEASURED FINDING (TASK #054) — record of what is and is NOT proven here.
  //
  // Mechanics warns that a resumed path may perform one EXTRA re-anchor at the
  // checkpoint time, making a resumed final state non-byte-identical to a cold
  // one. On the CURRENT engine that divergence does NOT arise: aura decay is
  // driven exclusively by `applyElement()` at HIT times (see
  // `engine/reactionSeam.ts`), and `restoreFromSnapshot` reinstates aura state
  // verbatim WITHOUT calling `decayAuraState`. A checkpoint therefore lands
  // between hits and introduces no additional re-anchor, and the gauges here
  // compare bit-identical (verified to 20 significant digits at every split).
  //
  // CONSEQUENCE, STATED PLAINLY: these two tests currently pass even if
  // `quantizeGauge` is removed from `stateKey`. They are NOT the guard for
  // quantization — the synthetic re-anchor tests above are, and those DO fail
  // under that mutation (verified). What these tests guard is the round-trip
  // itself: that resume preserves state, damage and clock well enough for the
  // memo key to converge at all.
  //
  // They are kept because the bit-identity is a PROPERTY OF THE CURRENT ENGINE,
  // not a guarantee of the contract. Mechanics is actively changing the aura
  // model (coupled decay for Burning/EC). If a future change makes resume
  // re-anchor — or makes decay time-driven rather than hit-driven — drift
  // becomes live, and quantization becomes load-bearing on THIS path. At that
  // point these tests start depending on it, and the comment above stops being
  // true. Re-verify rather than trusting this note.
  // -----------------------------------------------------------------------

  describe("resumeFrom round-trip (live engine)", () => {
    const TEAM = allCharacters.slice(0, 4);
    const TIME_LIMIT = 100000;
    /** Alternates characters and action types so real auras/ICD accumulate. */
    function mixedRotation(length: number): Rotation {
      const rotation: Rotation = [];
      for (let i = 0; i < length; i++) {
        rotation.push({
          characterId: TEAM[i % TEAM.length]!.id,
          actionType: i % 2 === 0 ? "skill" : "normal",
        });
      }
      return rotation;
    }

    const LENGTH = 8;
    const SPLITS = [1, 2, 3, 4, 5, 6];

    it("hashes a RESUMED final state identically to a COLD one", () => {
      const full = mixedRotation(LENGTH);
      const cold = simulateRotation(TEAM, full, testEnemy, {
        timeLimit: TIME_LIMIT,
      });

      for (const split of SPLITS) {
        const prefix = simulateRotation(TEAM, full.slice(0, split), testEnemy, {
          timeLimit: TIME_LIMIT,
        });
        const resumed = simulateRotation(TEAM, full.slice(split), testEnemy, {
          timeLimit: TIME_LIMIT,
          resumeFrom: prefix.finalState,
        });
        // The memo would break silently if this ever diverged.
        expect(stateKey(resumed.finalState)).toBe(stateKey(cold.finalState));
      }
    });

    it("splits total damage without losing or double-counting any", () => {
      // Guards the denominator of the claim above: identical keys would be
      // trivial if resume simply did nothing. prefix + suffix must reconstruct
      // the cold total, and the durations must partition the window (combat's
      // `clock - resumedFromTime` fix — a resumed run must NOT bill the prefix
      // it never simulated, which previously understated DPS).
      const full = mixedRotation(LENGTH);
      const cold = simulateRotation(TEAM, full, testEnemy, {
        timeLimit: TIME_LIMIT,
      });

      for (const split of SPLITS) {
        const prefix = simulateRotation(TEAM, full.slice(0, split), testEnemy, {
          timeLimit: TIME_LIMIT,
        });
        const resumed = simulateRotation(TEAM, full.slice(split), testEnemy, {
          timeLimit: TIME_LIMIT,
          resumeFrom: prefix.finalState,
        });

        expect(prefix.totalDamage + resumed.totalDamage).toBeCloseTo(
          cold.totalDamage,
          6,
        );
        expect(prefix.duration + resumed.duration).toBeCloseTo(
          cold.duration,
          9,
        );
        // Resume must actually advance the clock, not restart at zero.
        expect(resumed.finalState.time).toBeGreaterThan(prefix.finalState.time);
      }
    });
  });

});
