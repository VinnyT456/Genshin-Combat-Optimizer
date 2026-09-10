import { describe, expect, it } from "vitest";
import type { BuffContext, Stats } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { makeBuffResolver } from "@/simulation/buffs/makeBuffResolver";
import {
  foldBuffsIntoStats,
  foldBuffsIntoStatsWithDiagnostics,
  resolveBaseValues,
  sumEnemyModifiers,
  applyTotals,
  sumModifiers,
} from "@/simulation/buffs/resolver";
import { toReactionModifiers } from "@/simulation/reactions/resolver";
import type { ReactionResult } from "@/simulation/reactions/types";
import type { ActiveBuff, Buff } from "@/simulation/buffs/types";

const BASE_ATK = 800;
const FINAL_ATK = 1800;

function stats(overrides: Partial<Stats> = {}): Stats {
  return {
    atk: FINAL_ATK,
    hp: 12000,
    def: 800,
    elementalMastery: 100,
    critRate: 0.6,
    critDmg: 1.4,
    energyRecharge: 1.2,
    dmgBonus: 0,
    elementalDmgBonus: { pyro: 0.466 },
    ...overrides,
  };
}

function active(modifiers: Buff["modifiers"], stacks = 1): ActiveBuff[] {
  return [
    {
      buff: {
        id: "b",
        source: "test",
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers,
      },
      stacks,
    },
  ];
}

function makeContext(time = 0): BuffContext {
  return {
    time,
    character: testPyro,
    ability: testPyro.elementalSkill,
    activeCharacterId: testPyro.id,
    snapshot: { time, activeCharacterId: testPyro.id, characters: {} },
    enemy: testEnemy,
  };
}

describe("resolver — application order", () => {
  it("applies ATK% to BASE atk, not to final atk", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([{ stat: "atkPercent", value: 0.5 }]),
      { atk: BASE_ATK },
    );
    // 1800 + 800*0.5 = 2200, NOT 1800*1.5 = 2700.
    expect(result.atk).toBe(FINAL_ATK + BASE_ATK * 0.5);
    expect(result.atk).not.toBe(FINAL_ATK * 1.5);
  });

  it("adds flat ATK after the percentage term", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([
        { stat: "atkPercent", value: 0.5 },
        { stat: "atkFlat", value: 300 },
      ]),
      { atk: BASE_ATK },
    );
    // base*(pct) is not multiplied by the flat term.
    expect(result.atk).toBe(FINAL_ATK + BASE_ATK * 0.5 + 300);
  });

  it("sums ATK% from several buffs additively before scaling base", () => {
    const two: ActiveBuff[] = [
      ...active([{ stat: "atkPercent", value: 0.2 }]),
      ...active([{ stat: "atkPercent", value: 0.3 }]),
    ];
    const result = foldBuffsIntoStats(stats(), two, { atk: BASE_ATK });
    // (0.2+0.3)*base, not base*1.2*1.3.
    expect(result.atk).toBe(FINAL_ATK + BASE_ATK * 0.5);
  });

  it("multiplies a modifier by its stack count", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([{ stat: "atkFlat", value: 100 }], 3),
      { atk: BASE_ATK },
    );
    expect(result.atk).toBe(FINAL_ATK + 300);
  });

  it("skips % modifiers when no base value is supplied, and reports it", () => {
    const { stats: out, diagnostics } = applyTotals(
      stats(),
      sumModifiers(active([
        { stat: "atkPercent", value: 0.5 },
        { stat: "atkFlat", value: 50 },
      ])),
      {},
    );
    // Flat still applies; the % is dropped rather than misapplied to final ATK.
    expect(out.atk).toBe(FINAL_ATK + 50);
    expect(diagnostics.skippedPercentChannels).toContain("atk");
  });

  it("treats additive stats as simple sums", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([
        { stat: "critRate", value: 0.15 },
        { stat: "critDmg", value: 0.2 },
        { stat: "elementalMastery", value: 80 },
        { stat: "energyRecharge", value: 0.3 },
        { stat: "dmgBonus", value: 0.1 },
      ]),
    );
    expect(result.critRate).toBeCloseTo(0.75, 10);
    expect(result.critDmg).toBeCloseTo(1.6, 10);
    expect(result.elementalMastery).toBe(180);
    expect(result.energyRecharge).toBeCloseTo(1.5, 10);
    expect(result.dmgBonus).toBeCloseTo(0.1, 10);
  });

  it("merges elemental DMG% per element onto the existing map", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([
        { stat: "elementalDmgBonus", value: 0.15, element: "pyro" },
        { stat: "elementalDmgBonus", value: 0.2, element: "hydro" },
      ]),
    );
    expect(result.elementalDmgBonus.pyro).toBeCloseTo(0.616, 10);
    expect(result.elementalDmgBonus.hydro).toBeCloseTo(0.2, 10);
  });

  it("ignores an elementalDmgBonus modifier that names no element", () => {
    const result = foldBuffsIntoStats(
      stats(),
      active([{ stat: "elementalDmgBonus", value: 0.5 }]),
    );
    expect(result.elementalDmgBonus).toEqual({ pyro: 0.466 });
  });

  it("is order-independent (addition commutes)", () => {
    const mods: Buff["modifiers"] = [
      { stat: "atkFlat", value: 100 },
      { stat: "atkPercent", value: 0.2 },
      { stat: "critRate", value: 0.1 },
    ];
    const forward = foldBuffsIntoStats(stats(), active(mods), { atk: BASE_ATK });
    const backward = foldBuffsIntoStats(stats(), active([...mods].reverse()), { atk: BASE_ATK });
    expect(forward).toEqual(backward);
  });
});

describe("resolver — purity", () => {
  it("does not mutate the base stats and returns a new object", () => {
    const base = stats();
    const before = structuredClone(base);
    const out = foldBuffsIntoStats(
      base,
      active([
        { stat: "atkPercent", value: 0.5 },
        { stat: "elementalDmgBonus", value: 0.1, element: "pyro" },
      ]),
      { atk: BASE_ATK },
    );
    expect(base).toEqual(before);
    expect(out).not.toBe(base);
    expect(out.elementalDmgBonus).not.toBe(base.elementalDmgBonus);
  });

  it("returns a fresh object even with no active buffs", () => {
    const base = stats();
    const out = foldBuffsIntoStats(base, []);
    expect(out).not.toBe(base);
    expect(out).toEqual(base);
  });
});

describe("resolver — enemy modifiers (declared, not wired)", () => {
  it("aggregates def and res shred", () => {
    const totals = sumEnemyModifiers([
      { key: "defReduction", value: 0.2 },
      { key: "defReduction", value: 0.1 },
      { key: "defIgnore", value: 0.15 },
      { key: "resReduction", value: 0.4, element: "pyro" },
    ]);
    expect(totals.defReduction).toBeCloseTo(0.3, 10);
    expect(totals.defIgnore).toBeCloseTo(0.15, 10);
    expect(totals.resReduction.pyro).toBeCloseTo(0.4, 10);
  });

  it("ignores a resReduction with no element", () => {
    expect(sumEnemyModifiers([{ key: "resReduction", value: 0.4 }]).resReduction).toEqual({});
  });
});

describe("makeBuffResolver — frozen BuffResolver contract", () => {
  const permanentAtk: Buff = {
    id: "atk-up",
    source: "test-source",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    modifiers: [{ stat: "atkFlat", value: 200 }],
  };

  it("does not mutate base or context", () => {
    const resolver = makeBuffResolver({ buffs: [permanentAtk] });
    const base = stats();
    const context = makeContext();
    const baseBefore = structuredClone(base);
    const contextBefore = structuredClone(context);

    resolver(base, context);

    expect(base).toEqual(baseBefore);
    expect(context).toEqual(contextBefore);
  });

  it("is deterministic across repeated calls", () => {
    const resolver = makeBuffResolver({ buffs: [permanentAtk] });
    const a = resolver(stats(), makeContext(3));
    const b = resolver(stats(), makeContext(3));
    expect(a).toEqual(b);
  });

  it("is insulated from later mutation of the caller's buff array", () => {
    const buffs: Buff[] = [permanentAtk];
    const resolver = makeBuffResolver({ buffs });
    const before = resolver(stats(), makeContext()).atk;
    buffs.push({ ...permanentAtk, id: "sneaky" });
    expect(resolver(stats(), makeContext()).atk).toBe(before);
  });

  it("uses per-character base stats to scale ATK%", () => {
    const resolver = makeBuffResolver({
      buffs: [{ ...permanentAtk, modifiers: [{ stat: "atkPercent", value: 0.5 }] }],
      baseStats: { [testPyro.id]: { atk: BASE_ATK } },
    });
    expect(resolver(stats(), makeContext()).atk).toBe(FINAL_ATK + BASE_ATK * 0.5);
  });
});

describe("buffs wired through simulateRotation", () => {
  const rotation = [
    { characterId: testPyro.id, actionType: "skill" as const, abilityId: testPyro.elementalSkill.id },
  ];

  function run(buffs: Buff[]) {
    return simulateRotation([testPyro], rotation, testEnemy, {
      buffResolver: makeBuffResolver({
        buffs,
        baseStats: { [testPyro.id]: { atk: BASE_ATK } },
      }),
    });
  }

  const baseline = simulateRotation([testPyro], rotation, testEnemy);

  it("an active buff increases damage", () => {
    const buffed = run([
      {
        id: "dmg-up",
        source: "test",
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      },
    ]);
    expect(buffed.totalDamage).toBeGreaterThan(baseline.totalDamage);
  });

  it("a buff that has not started yet changes nothing", () => {
    const later = run([
      {
        id: "dmg-up",
        source: "test",
        startTime: 100,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      },
    ]);
    expect(later.totalDamage).toBeCloseTo(baseline.totalDamage, 10);
  });

  it("a condition that does not match changes nothing", () => {
    const mismatched = run([
      {
        id: "burst-only",
        source: "test",
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        conditions: { damageTypes: ["burst"] },
        modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      },
    ]);
    expect(mismatched.totalDamage).toBeCloseTo(baseline.totalDamage, 10);
  });

  it("ATK% through the engine scales the base the ENGINE attached", () => {
    const buffed = run([
      {
        id: "atk-pct",
        source: "test",
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "atkPercent", value: 0.5 }],
      },
    ]);
    // PRECEDENCE, end to end. `run()` passes a stale `baseStats` map entry of
    // BASE_ATK (800), but `testPyro` is an UNGEARED definition at atk 1800, so
    // the engine attaches `base.atk = 1800` via the self-base assumption. 1800
    // is testPyro's true base; the 800 in the map never described this
    // character. The bag wins, so the % scales 1800.
    //
    // Damage is linear in ATK, so the ratio is exactly the ATK ratio.
    const engineAttachedBase = FINAL_ATK;
    const expectedRatio = (FINAL_ATK + engineAttachedBase * 0.5) / FINAL_ATK;
    expect(buffed.totalDamage / baseline.totalDamage).toBeCloseTo(expectedRatio, 10);
    // Pins the direction: NOT the stale map's 800.
    const staleMapRatio = (FINAL_ATK + BASE_ATK * 0.5) / FINAL_ATK;
    expect(buffed.totalDamage / baseline.totalDamage).not.toBeCloseTo(staleMapRatio, 10);
  });

  it("simulation stays deterministic with a resolver attached", () => {
    const buffs: Buff[] = [
      {
        id: "dmg-up",
        source: "test",
        startTime: 0,
        duration: 10,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      },
    ];
    expect(run(buffs).totalDamage).toBe(run(buffs).totalDamage);
  });
});

// ===========================================================================
// Base-stat source of truth: `Stats.base` vs the explicit per-character map.
//
// Two sources for one quantity is a drift risk, so the precedence rule is
// pinned here rather than left to whichever `??` happened to be written.
// RULE: `Stats.base` wins; the id-keyed map is a fallback only.
// ===========================================================================

describe("resolveBaseValues — base-stat precedence", () => {
  // A geared bag: final ATK 2400 came from base 1100 plus artifact flat/%.
  // Scaling a % off 2400 is the on-final bug; off 1100 is correct.
  const GEARED_BASE = 1100;
  const GEARED_FINAL = 2400;

  function geared(overrides: Partial<Stats> = {}): Stats {
    return stats({
      atk: GEARED_FINAL,
      base: { atk: GEARED_BASE, hp: 12000, def: 800 },
      ...overrides,
    });
  }

  it("reads Stats.base when no explicit map is given", () => {
    expect(resolveBaseValues(geared())).toEqual({
      atk: GEARED_BASE,
      hp: 12000,
      def: 800,
    });
  });

  it("falls back to the explicit map when Stats carries no base", () => {
    // The genuinely base-less bag: a hand-built literal. This is the case the
    // map still exists to serve.
    expect(resolveBaseValues(stats(), { atk: BASE_ATK })).toEqual({
      atk: BASE_ATK,
    });
  });

  it("PRECEDENCE: Stats.base wins when the two sources disagree", () => {
    // The drift scenario: a stale id-keyed entry says 800 while the bag in
    // hand was built from base 1100. The bag is the fresher source.
    const resolved = resolveBaseValues(geared(), { atk: BASE_ATK });
    expect(resolved.atk).toBe(GEARED_BASE);
    expect(resolved.atk).not.toBe(BASE_ATK);
  });

  it("is ALL-OR-NOTHING: a present Stats.base ignores the map entirely", () => {
    // Never merged per channel — a partial map must not contribute base HP
    // while Stats.base supplies base ATK, which would describe no real bag.
    const resolved = resolveBaseValues(geared(), { hp: 999999, def: 999999 });
    expect(resolved).toEqual({ atk: GEARED_BASE, hp: 12000, def: 800 });
  });

  it("GUARDS the all-or-nothing precondition: BaseStats is TOTAL", () => {
    // Honest note on the test above: while `BaseStats` requires all three
    // channels, a present `stats.base` saturates every channel, so an
    // all-or-nothing rule and a per-channel merge are OBSERVATIONALLY
    // IDENTICAL. (Mutation-checked: `{ ...explicit, ...stats.base }` passes the
    // whole suite.) The distinction only becomes observable if `BaseStats`ss
    // channels ever become optional — at which point a merge could pair base
    // ATK from the bag with base HP from a stale map.
    //
    // So pin the PRECONDITION rather than pretend the behaviour is covered:
    // if this fails, `resolveBaseValues` must switch to an explicit
    // all-or-nothing branch instead of relying on saturation.
    const base: NonNullable<Stats["base"]> = { atk: 1, hp: 2, def: 3 };
    expect(Object.keys(base).sort()).toEqual(["atk", "def", "hp"]);
    // Type-level half of the guard: omitting a channel must not compile.
    // @ts-expect-error BaseStats requires all three channels.
    const partial: NonNullable<Stats["base"]> = { atk: 1 };
    expect(partial.atk).toBe(1);
  });

  it("yields no base at all when neither source has one", () => {
    expect(resolveBaseValues(stats())).toEqual({});
  });

  it("is pure: neither input is mutated", () => {
    const bag = geared();
    const map = { atk: BASE_ATK };
    const bagCopy = structuredClone(bag);
    const mapCopy = structuredClone(map);
    resolveBaseValues(bag, map);
    expect(bag).toEqual(bagCopy);
    expect(map).toEqual(mapCopy);
  });
});

describe("percentage buffs resolve against Stats.base", () => {
  const GEARED_BASE = 1100;
  const GEARED_FINAL = 2400;

  function geared(): Stats {
    return stats({
      atk: GEARED_FINAL,
      base: { atk: GEARED_BASE, hp: 12000, def: 800 },
    });
  }

  it("ACCEPTANCE: ATK% scales Stats.base with NO explicit map passed", () => {
    // The defect this fixes: before reading `Stats.base`, this call skipped the
    // percentage entirely and returned 2400.
    const result = foldBuffsIntoStats(
      geared(),
      active([{ stat: "atkPercent", value: 0.5 }]),
    );
    expect(result.atk).toBe(GEARED_FINAL + GEARED_BASE * 0.5);
    // Neither skipped (2400) nor scaled off final (3600).
    expect(result.atk).not.toBe(GEARED_FINAL);
    expect(result.atk).not.toBe(GEARED_FINAL * 1.5);
  });

  it("does not report a skip when Stats.base supplies the base", () => {
    const { diagnostics } = applyTotals(
      geared(),
      sumModifiers(active([{ stat: "atkPercent", value: 0.5 }])),
    );
    expect(diagnostics.skippedPercentChannels).toEqual([]);
  });

  it("still skips-and-reports for a genuinely base-less Stats", () => {
    // The fallback path is NOT dead: `Stats.base` is optional, so a bag with
    // neither source must keep failing loudly rather than misapplying.
    const { stats: out, diagnostics } = applyTotals(
      stats(),
      sumModifiers(active([{ stat: "atkPercent", value: 0.5 }])),
    );
    expect(out.atk).toBe(FINAL_ATK);
    expect(diagnostics.skippedPercentChannels).toContain("atk");
  });

  it("makeBuffResolver scales off Stats.base with no baseStats option", () => {
    const resolver = makeBuffResolver({
      buffs: [
        {
          id: "atk-pct",
          source: "test",
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          modifiers: [{ stat: "atkPercent", value: 0.5 }],
        },
      ],
    });
    const out = resolver(geared(), makeContext());
    expect(out.atk).toBe(GEARED_FINAL + GEARED_BASE * 0.5);
  });

  it("PRECEDENCE through makeBuffResolver: the bag beats a stale map", () => {
    // Same buff, same bag, but the caller ALSO passes a conflicting id-keyed
    // entry. The bag's own base must decide.
    const buffs: Buff[] = [
      {
        id: "atk-pct",
        source: "test",
        startTime: 0,
        duration: Number.POSITIVE_INFINITY,
        stacking: { mode: "refresh" },
        targets: { scope: "party" },
        modifiers: [{ stat: "atkPercent", value: 0.5 }],
      },
    ];
    const resolver = makeBuffResolver({
      buffs,
      baseStats: { [testPyro.id]: { atk: BASE_ATK } },
    });
    const out = resolver(geared(), makeContext());
    expect(out.atk).toBe(GEARED_FINAL + GEARED_BASE * 0.5);
    expect(out.atk).not.toBe(GEARED_FINAL + BASE_ATK * 0.5);
  });

  it("stat conversions read the same resolved base as modifiers", () => {
    // Conversions cap/scale off base too; both must agree, or a % and a
    // conversion in the same buff would scale different bases.
    const converting: ActiveBuff[] = [
      {
        buff: {
          id: "conv",
          source: "test",
          startTime: 0,
          duration: 10,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          conversions: [
            { sourceStat: "hp", targetStat: "atkPercent", ratio: 0.001 },
          ],
        },
        stacks: 1,
      },
    ];
    // hp 12000 * 0.001 = 12 -> as atkPercent, scales base 1100.
    const result = foldBuffsIntoStats(geared(), converting);
    expect(result.atk).toBe(GEARED_FINAL + GEARED_BASE * 12);
  });
});


// ---------------------------------------------------------------------------
// reactionBonus — per-reaction, never a scalar
// ---------------------------------------------------------------------------

/** No RES multiplier, so transformative numbers are unscaled by resistance. */
const noRes = (): number => 1;

function reaction(
  kind: "vaporize" | "swirl" | "overloaded",
): ReactionResult {
  if (kind === "vaporize") {
    return {
      kind: "vaporize",
      category: "amplifying",
      direction: "forward",
      triggerElement: "hydro",
      gaugeConsumed: 1,
    };
  }
  if (kind === "swirl") {
    return {
      kind: "swirl",
      category: "transformative",
      triggerElement: "anemo",
      swirledElement: "pyro",
      gaugeConsumed: 1,
    };
  }
  return {
    kind: "overloaded",
    category: "transformative",
    triggerElement: "pyro",
    gaugeConsumed: 1,
  };
}

describe("resolver — reactionBonus", () => {
  // Crimson Witch of Flames 4pc: +15% Vaporize and Melt DMG, and NOTHING else.
  // Source: KQM TCL `combat-mechanics/damage/damage-formula`, which lists
  // Crimson Witch 4pc under `ReactionBonus` sources (per-reaction, not global).
  const crimsonWitchShaped: Buff["modifiers"] = [
    { stat: "reactionBonus", value: 0.15, reaction: "vaporize" },
    { stat: "reactionBonus", value: 0.15, reaction: "melt" },
  ];

  it("a Crimson Witch-shaped buff yields 2.30 on forward vaporize", () => {
    const folded = foldBuffsIntoStats(stats(), active(crimsonWitchShaped));
    expect(folded.reactionBonus?.vaporize).toBeCloseTo(0.15, 10);

    const mods = toReactionModifiers(
      [reaction("vaporize")],
      {
        level: 90,
        elementalMastery: 0,
        reactionBonus: folded.reactionBonus,
      },
      noRes,
    );
    // Forward vaporize base 2.0 * (1 + emBonus(0) + 0.15) = 2.30.
    expect(mods.amplifyingMultiplier).toBeCloseTo(2.3, 10);
  });

  it("does NOT leak onto swirl or overloaded", () => {
    const folded = foldBuffsIntoStats(stats(), active(crimsonWitchShaped));
    expect(folded.reactionBonus?.swirl).toBeUndefined();
    expect(folded.reactionBonus?.overloaded).toBeUndefined();

    for (const kind of ["swirl", "overloaded"] as const) {
      const withBuff = toReactionModifiers(
        [reaction(kind)],
        { level: 90, elementalMastery: 0, reactionBonus: folded.reactionBonus },
        noRes,
      );
      const without = toReactionModifiers(
        [reaction(kind)],
        { level: 90, elementalMastery: 0 },
        noRes,
      );
      expect(withBuff.transformative[0]?.damage).toBeCloseTo(
        without.transformative[0]?.damage ?? Number.NaN,
        10,
      );
    }
  });

  it("sums several sources naming the same reaction", () => {
    const folded = foldBuffsIntoStats(
      stats(),
      active([
        { stat: "reactionBonus", value: 0.15, reaction: "vaporize" },
        { stat: "reactionBonus", value: 0.15, reaction: "vaporize" },
      ]),
    );
    expect(folded.reactionBonus?.vaporize).toBeCloseTo(0.3, 10);
  });

  it("merges additively onto a bonus already on the incoming bag", () => {
    const folded = foldBuffsIntoStats(
      stats({ reactionBonus: { vaporize: 0.1 } }),
      active([{ stat: "reactionBonus", value: 0.15, reaction: "vaporize" }]),
    );
    expect(folded.reactionBonus?.vaporize).toBeCloseTo(0.25, 10);
  });

  it("honours stacks", () => {
    const folded = foldBuffsIntoStats(
      stats(),
      active([{ stat: "reactionBonus", value: 0.1, reaction: "aggravate" }], 3),
    );
    expect(folded.reactionBonus?.aggravate).toBeCloseTo(0.3, 10);
  });

  it("SKIPS AND REPORTS a reactionBonus modifier that names no reaction", () => {
    const { stats: out, diagnostics } = foldBuffsIntoStatsWithDiagnostics(
      stats(),
      active([{ stat: "reactionBonus", value: 0.5 }]),
    );
    // It must NEVER become a global scalar: no reaction may see it.
    expect(out.reactionBonus).toBeUndefined();
    expect(diagnostics.skippedKeyedModifiers).toContain("reactionBonus");

    const mods = toReactionModifiers(
      [reaction("vaporize")],
      { level: 90, elementalMastery: 0, reactionBonus: out.reactionBonus },
      noRes,
    );
    expect(mods.amplifyingMultiplier).toBeCloseTo(2, 10);
  });

  it("omits the key entirely when there are no reaction bonuses", () => {
    // Deliberate: `Stats.reactionBonus` is OPTIONAL, so the fold round-trips
    // absence rather than materialising `{}` (identity + memo-hash stability).
    const out = foldBuffsIntoStats(stats(), active([{ stat: "critRate", value: 0.1 }]));
    expect("reactionBonus" in out).toBe(false);
  });

  it("returns a fresh reactionBonus map, never the input one", () => {
    const base = stats({ reactionBonus: { vaporize: 0.1 } });
    const before = structuredClone(base);
    const out = foldBuffsIntoStats(
      base,
      active([{ stat: "reactionBonus", value: 0.15, reaction: "vaporize" }]),
    );
    expect(out.reactionBonus).not.toBe(base.reactionBonus);
    expect(base).toEqual(before);
  });
});
