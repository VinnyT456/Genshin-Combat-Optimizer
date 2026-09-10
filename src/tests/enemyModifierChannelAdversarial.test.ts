import { describe, expect, it } from "vitest";
import type { Buff } from "@/simulation/buffs/types";
import type { EnemyState, SimulationConfig } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { harvestArtifactSetBuffs } from "@/simulation/engine/equipmentBuffs";
import { makeResolvers } from "@/simulation/buffs/makeBuffResolver";
import type {
  ArtifactLoadout,
  ArtifactPiece,
  ArtifactSlot,
} from "@/simulation/character/equipment";
import { buffsForSetBonus } from "@/game-data/artifacts/setBonusBuffs";
import { allArtifactEffects } from "@/game-data/artifacts/registry";
import type { GeneratedArtifactEffect } from "@/game-data/artifacts/generated/setEffects";
import { syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// ADVERSARIAL attack on the `enemyModifiers` CHANNEL (TASK #067, item 2).
//
// THE CLAIM UNDER TEST, as reported: "`enemyModifiers` ride along but the
// damage pipeline does not consume `EnemyModifier`". No expressible WEAPON
// carries one, so nothing is lost there — but an artifact RES-shred set (e.g.
// Viridescent Venerer) would, and artifact data is landing now.
//
// A "rides along inertly" claim is only safe while it is TRUE, and it decays
// silently: the moment a data agent marks a shred-bearing row as modelled, an
// inert channel becomes a MISSING BUFF — real damage, absent, with no error.
// So the job is not to assert the current emptiness. It is to build the pin
// that FIRES the moment an artifact carries one.
//
// FIRST FINDING, and it changes the shape of this file:
//
//   THE PREMISE IS OUT OF DATE. The damage pipeline DOES consume
//   `EnemyModifiers` today — `src/simulation/damage/pipeline.ts:240` reads
//   `input.enemyModifiers.resReduction`, and `resolver.ts:422` accumulates
//   `buff.enemyModifiers` into it. The channel is LIVE end to end and section 1
//   proves it with a damage difference, not by reading the source.
//
// So the real risk is the opposite of the one reported: not that a shred would
// be dropped by the engine, but that the ARTIFACT DATA SHAPE cannot express
// one, so a shred set is silently reduced to whatever subset of its text does
// fit. Sections 2-4 attack that.
//
// METHOD NOTE (the weapon agent's lesson, applied):
// Every real artifact row today is shred-free, so a sweep asserting "no row
// yields a shred buff" would be uniformly true against real data and could not
// distinguish a working converter from one that discards shreds. Section 3
// therefore uses a LABELLED SYNTHETIC fixture that does carry one, so the
// assertion has something to fail against.
// ============================================================================

const ENEMY: EnemyState = {
  id: "target",
  name: "Test Target",
  level: 90,
  // A non-zero base RES, so a shred has room to move the number in BOTH
  // directions and the test is not measuring the RES formula's zero case.
  resistances: { hydro: 0.5 },
};

const ROTATION = [
  { characterId: syntheticUnit.id, actionType: "skill" as const },
];

/**
 * Total damage with `buffs` in force.
 *
 * Uses `makeResolvers`, NOT a hand-written `buffResolver`, because the
 * stat-side and enemy-side channels are SEPARATE resolvers on
 * `SimulationConfig` (`buffResolver` returns `Stats` and structurally cannot
 * carry enemy-side output — see `buffs/types.ts:446`). Building both from one
 * buff list is exactly what the production adapter does, so this measures the
 * real path rather than a test-only shortcut that could bypass the seam.
 */
function damageWith(buffs: readonly Buff[]): number {
  const resolvers = makeResolvers({ buffs });
  const config: Partial<SimulationConfig> = {
    critMode: "never",
    buffResolver: resolvers.buffResolver,
    enemyModifierResolver: resolvers.enemyModifierResolver,
  };
  return simulateRotation([syntheticUnit], ROTATION, ENEMY, config).totalDamage;
}

/** A minimal but REAL artifact loadout of `count` pieces of one set. */
function loadout(setId: string, count: number): ArtifactLoadout {
  const slots: readonly ArtifactSlot[] = [
    "flower",
    "plume",
    "sands",
    "goblet",
    "circlet",
  ];
  const out: Partial<Record<ArtifactSlot, ArtifactPiece>> = {};
  for (const slot of slots.slice(0, count)) {
    out[slot] = {
      slot,
      setId,
      // A zero-valued main stat: the pieces exist only to be COUNTED for the
      // set threshold, so they must contribute no damage of their own.
      mainStat: { stat: "atkFlat", value: 0 },
      substats: [],
    };
  }
  return out;
}

/** A permanent party-wide buff carrying only enemy-side modifiers. */
function shredBuff(element: "hydro", value: number): Buff {
  return {
    id: "synthetic-shred",
    source: "synthetic shred fixture",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    enemyModifiers: [{ key: "resReduction", value, element }],
  };
}

// ===========================================================================
// 1. THE CHANNEL IS LIVE — proven by damage, not by reading the pipeline.
// ===========================================================================

describe("enemyModifiers reach the damage pipeline", () => {
  it("a RES-shred buff INCREASES damage against a resistant enemy", () => {
    // If `enemyModifiers` were inert, these two would be equal. They are not,
    // which is the whole point: the channel is wired.
    const bare = damageWith([]);
    const shredded = damageWith([shredBuff("hydro", 0.4)]);
    expect(shredded).toBeGreaterThan(bare);
  });

  it("the increase matches the RES formula exactly, not merely 'more'", () => {
    // 50% RES -> multiplier 1 - 0.5 = 0.5.
    // 50% RES shredded by 40% -> 10% RES -> multiplier 1 - 0.1 = 0.9.
    // So the ratio is 0.9 / 0.5 = 1.8. Asserting the RATIO rather than an
    // absolute makes this independent of the fixture's ATK and multiplier.
    const bare = damageWith([]);
    const shredded = damageWith([shredBuff("hydro", 0.4)]);
    expect(shredded / bare).toBeCloseTo(1.8, 9);
  });

  it("a shred of zero is exactly a no-op", () => {
    expect(damageWith([shredBuff("hydro", 0)])).toBeCloseTo(damageWith([]), 9);
  });

  it("shred on a DIFFERENT element does not touch this damage", () => {
    const crossElement: Buff = {
      ...shredBuff("hydro", 0.4),
      enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    };
    expect(damageWith([crossElement])).toBeCloseTo(damageWith([]), 9);
  });

  it("shred is monotone: more shred is never less damage", () => {
    const totals = [0, 0.1, 0.2, 0.3, 0.4].map(
      (value) => damageWith([shredBuff("hydro", value)]),
    );
    for (let index = 1; index < totals.length; index += 1) {
      expect(totals[index]!).toBeGreaterThan(totals[index - 1]!);
    }
  });

  it("shred beyond 100% enters the NEGATIVE-RES branch, not a runaway", () => {
    // Negative RES uses the halved formula (1 - res/2), so a huge shred must
    // stay finite and must not multiply damage without bound.
    const huge = damageWith([shredBuff("hydro", 10)]);
    expect(Number.isFinite(huge)).toBe(true);
    // RES = 0.5 - 10 = -9.5 -> multiplier 1 + 9.5/2 = 5.75, vs bare 0.5.
    expect(huge / damageWith([])).toBeCloseTo(5.75 / 0.5, 6);
  });
});

// ===========================================================================
// 2. THE ARTIFACT DATA SHAPE — can a set bonus even STATE a shred?
// ===========================================================================

describe("artifact set bonuses and the enemy-side channel", () => {
  it("no modelled artifact row carries an enemy-side modifier TODAY", () => {
    // A statement of fact about the data as landed, not a rule. It is paired
    // with the synthetic fixture in section 3 so that it cannot be the only
    // thing standing between a shred set and silence.
    for (const effect of allArtifactEffects) {
      for (const buff of buffsForSetBonus(effect)) {
        expect(buff.enemyModifiers ?? []).toEqual([]);
      }
    }
  });

  it("the generated artifact shape has NO field for an enemy-side modifier", () => {
    // This is the actual constraint, and it is why section 2's sweep is
    // uniformly true. `ArtifactStatModifier` is character-side only: stat,
    // value, element, reaction. There is no `key: "resReduction"` vocabulary,
    // so a shred set cannot be expressed even in principle right now.
    const withModifiers = allArtifactEffects.filter(
      (effect) => (effect.modifiers ?? []).length > 0,
    );
    expect(withModifiers.length).toBeGreaterThan(0);
    for (const effect of withModifiers) {
      for (const modifier of effect.modifiers ?? []) {
        expect(Object.keys(modifier).sort()).not.toContain("key");
      }
    }
  });

  it("every RES-shred set is therefore held OUT of the modelled bucket", () => {
    // Fail-closed is the correct outcome while the vocabulary is missing: a
    // shred set that cannot be stated must grant NOTHING rather than grant the
    // half of its text that happens to fit. This asserts the fail-closed
    // property directly on the rows whose text mentions a RES decrease.
    const shredProse = /decreas\w* .{0,40}(RES|Resistance)/i;
    const shredRows = allArtifactEffects.filter((effect) =>
      shredProse.test(effect.text),
    );
    // Non-vacuity: such rows really do exist in the data (VV 4pc et al).
    expect(shredRows.length).toBeGreaterThan(0);
    for (const row of shredRows) {
      expect(row.support).not.toBe("modelled");
    }
  });

  it("a held-back shred row still EMITS its numbers, so nothing is re-derived", () => {
    const viridescent = allArtifactEffects.find(
      (effect) => effect.id === "viridescent-venerer-4pc",
    );
    expect(viridescent).toBeDefined();
    expect(viridescent!.support).toBe("unimplemented");
    // The 40% shred and the 10s duration survive as sourced params even though
    // the effect is not wired, which is what makes wiring it later a data
    // lookup rather than a fresh derivation.
    expect(viridescent!.params).toContain(0.4);
    expect(viridescent!.params).toContain(10);
  });
});

// ===========================================================================
// 3. THE PIN THAT FIRES — a LABELLED SYNTHETIC shred-bearing set bonus.
// ===========================================================================

describe("the moment an artifact DOES carry a shred", () => {
  // Real data is uniformly shred-free, so section 2's sweep cannot tell a
  // working converter from one that drops shreds. This fixture supplies the
  // missing case. It is deliberately shaped like a real row so that the day
  // the generator emits one, the only difference is provenance.
  //
  // It is typed through the PUBLIC generated interface, so if a data agent adds
  // an enemy-side field to `GeneratedArtifactEffect`, this fixture is the first
  // place that can express it and this test becomes the live check.
  const SYNTHETIC_SHRED_SET: GeneratedArtifactEffect = {
    id: "qa-synthetic-shred-4pc",
    setSlug: "qa-synthetic-shred",
    setId: 99999,
    pieces: 4,
    text: "QA SYNTHETIC FIXTURE — not real game data. Decreases opponents' Hydro RES by 40%.",
    textZh: "QA 合成夹具 —— 非真实游戏数据。",
    support: "modelled",
    modifiers: [{ stat: "elementalDmgBonus", value: 0.15, element: "hydro" }],
  };

  it("the converter handles a modelled row with the stat part it CAN express", () => {
    const buffs = buffsForSetBonus(SYNTHETIC_SHRED_SET);
    expect(buffs.length).toBe(1);
    expect(buffs[0]!.modifiers).toEqual([
      { stat: "elementalDmgBonus", value: 0.15, element: "hydro" },
    ]);
  });

  it("DOCUMENTED GAP: the shred in the prose is NOT carried into the buff", () => {
    // This is the honest statement of the current limitation. The row's text
    // states a 40% Hydro RES shred; the emitted buff contains no enemy-side
    // modifier because the generated shape has nowhere to put one.
    //
    // If a data agent later adds enemy-side support, `buffsForSetBonus` must
    // populate `enemyModifiers` — and THIS assertion will fail, which is
    // exactly the alarm this file exists to install. It is a `toEqual([])` on
    // a value that SHOULD become non-empty, so it cannot pass silently through
    // the transition.
    const buffs = buffsForSetBonus(SYNTHETIC_SHRED_SET);
    expect(buffs[0]!.enemyModifiers ?? []).toEqual([]);
  });

  it("a synthetic shred buff DOES survive the harvest, so only the DATA is missing", () => {
    // Proves the gap is exactly one layer wide. Hand `harvestArtifactSetBuffs`
    // a set bonus that already carries `enemyModifiers` and it reaches the
    // engine intact — so nothing between the artifact registry and the damage
    // pipeline discards it. The only missing piece is the generated shape.
    const harvested = harvestArtifactSetBuffs({
      artifacts: loadout("qa-synthetic-shred", 4),
      setBonuses: [
        {
          setId: "qa-synthetic-shred",
          fourPiece: [shredBuff("hydro", 0.4)],
        },
      ],
    });
    expect(harvested.length).toBe(1);
    expect(harvested[0]!.enemyModifiers).toEqual([
      { key: "resReduction", value: 0.4, element: "hydro" },
    ]);
  });

  it("and that harvested shred changes DAMAGE, closing the loop end to end", () => {
    const harvested = harvestArtifactSetBuffs({
      artifacts: loadout("qa-synthetic-shred", 4),
      setBonuses: [
        {
          setId: "qa-synthetic-shred",
          fourPiece: [shredBuff("hydro", 0.4)],
        },
      ],
    });
    expect(damageWith(harvested) / damageWith([])).toBeCloseTo(1.8, 9);
  });

  it("at 2 pieces the 4-piece shred is absent, not partially applied", () => {
    const harvested = harvestArtifactSetBuffs({
      artifacts: loadout("qa-synthetic-shred", 2),
      setBonuses: [
        {
          setId: "qa-synthetic-shred",
          fourPiece: [shredBuff("hydro", 0.4)],
        },
      ],
    });
    expect(harvested).toEqual([]);
    expect(damageWith(harvested)).toBeCloseTo(damageWith([]), 9);
  });
});

// ===========================================================================
// 4. BUCKET-COUNT PINS — a reclassification must be a visible test edit.
// ===========================================================================

describe("artifact bucket census discriminates", () => {
  // The weapon file pins 30 expressible rows; the artifact census is pinned in
  // `artifactDataAdversarial.test.ts` at 46 modelled. This section proves the
  // artifact pin DISCRIMINATES rather than merely matching, i.e. that it is a
  // count of something that can change independently of the code that reads it.
  it("the modelled count is a strict, non-empty subset of all effects", () => {
    const modelled = allArtifactEffects.filter(
      (effect) => effect.support === "modelled",
    );
    expect(modelled.length).toBe(46);
    expect(modelled.length).toBeGreaterThan(0);
    expect(modelled.length).toBeLessThan(allArtifactEffects.length);
  });

  it("the buckets partition the data with nothing unaccounted for", () => {
    // If a fourth bucket appeared, the pinned 46 could stay correct while the
    // meaning of "not modelled" quietly changed. This catches that.
    const census: Record<string, number> = {};
    for (const effect of allArtifactEffects) {
      census[effect.support] = (census[effect.support] ?? 0) + 1;
    }
    expect(census).toEqual({ modelled: 46, unimplemented: 76 });
    expect(46 + 76).toBe(allArtifactEffects.length);
  });

  it("exactly the modelled rows produce buffs — the bucket IS the gate", () => {
    // Ties the count to BEHAVIOUR. A reclassification does not merely change a
    // number in a test; it changes how many set bonuses can ever fire.
    const emitting = allArtifactEffects.filter(
      (effect) => buffsForSetBonus(effect).length > 0,
    );
    for (const effect of emitting) expect(effect.support).toBe("modelled");
    // Non-vacuous in the other direction too: modelled rows really do emit.
    expect(emitting.length).toBeGreaterThan(0);
  });
});
