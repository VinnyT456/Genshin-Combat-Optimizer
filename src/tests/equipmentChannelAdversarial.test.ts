import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { Buff } from "@/simulation/buffs/types";
import type {
  ArtifactLoadout,
  ArtifactPiece,
} from "@/simulation/character/equipment";
import type {
  ArtifactSetBonusBuffs,
  CharacterEquipmentBuffs,
  WeaponRefinement,
} from "@/simulation/engine/equipmentBuffs";
import {
  harvestArtifactSetBuffs,
  harvestCharacterEquipmentBuffs,
  harvestTeamEquipmentBuffs,
  harvestWeaponPassiveBuffs,
} from "@/simulation/engine/equipmentBuffs";
import type { Rotation, SimulationConfig } from "@/types";
import {
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
  expectedNeutralDamage,
  makeTestCharacter,
} from "./helpers/fixtures";

// ============================================================================
// ADVERSARIAL attack on the equipment buff channel (TASK #067).
//
// The channel is `SimulationConfig.equipmentBuffs` -> `withEquipmentBuffs()` ->
// `withHarvestedBuffs()` -> the three mechanics resolvers. Its two SELECTION
// rules are the whole point of the module, and both fail in a direction a
// naive "the passive applies" test cannot see:
//
//   REFINEMENT   an R5 weapon simulating as R1 still "applies the passive".
//   PIECE COUNT  a 4pc bonus live at 3 pieces still "applies the bonus".
//
// So every assertion below pins a NUMBER, not a boolean. Fixtures are the
// project's neutral set: level-0 attacker vs a level-0 zero-res dummy, crit
// off, so DEF multiplier is exactly 0.5 and every expected value is
// hand-computable.
//
// SYNTHETIC BY DESIGN. These buffs are authored here, not read from
// `src/game-data`. The lesson from the weapon sweep is that a test which
// derives its expectation from the same predicate as the code cannot catch a
// bug in that shared predicate. Real data is also uniformly R1-empty for
// several refinements, which would make a data-driven refinement test vacuous.
// Nothing here claims these are real weapon or set values.
// ============================================================================

/** ATK 1000, skill multiplier 2.0, DEF x0.5 -> 1000 damage with no bonuses. */
const BASE_SKILL_DAMAGE = expectedNeutralDamage(1000, 2);

/** One skill cast. Single hit keeps every total exactly one damage number. */
const SKILL_ONLY: Rotation = [{ characterId: "a", actionType: "skill" }];

/** A permanent, unconditional DMG% buff of `value` on the active character. */
function dmgBuff(id: string, value: number): Buff {
  return {
    id,
    source: id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "active" },
    modifiers: [{ stat: "dmgBonus", value }],
  };
}

/** A permanent RES-shred buff — the channel artifacts are expected to use. */
function shredBuff(id: string, value: number): Buff {
  return {
    id,
    source: id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "active" },
    enemyModifiers: [{ key: "resReduction", value, element: "pyro" }],
  };
}

function piece(slot: ArtifactPiece["slot"], setId: string): ArtifactPiece {
  return {
    slot,
    setId,
    mainStat: { stat: "atkFlat", value: 0 },
    substats: [],
  };
}

/** A loadout of `count` pieces of `setId`, filling slots in a fixed order. */
function loadout(setId: string, count: number): ArtifactLoadout {
  const slots: readonly ArtifactPiece["slot"][] = [
    "flower",
    "plume",
    "sands",
    "goblet",
    "circlet",
  ];
  const out: ArtifactLoadout = {};
  for (let i = 0; i < count; i += 1) {
    const slot = slots[i];
    if (slot === undefined) break;
    out[slot] = piece(slot, setId);
  }
  return out;
}

function runWith(equipment: CharacterEquipmentBuffs | undefined): number {
  const config: SimulationConfig = {
    ...NO_CRIT_CONFIG,
    ...(equipment ? { equipmentBuffs: { a: equipment } } : {}),
  };
  return simulateRotation(
    [makeTestCharacter("a")],
    SKILL_ONLY,
    NEUTRAL_ENEMY,
    config,
  ).totalDamage;
}

describe("equipment channel — baseline", () => {
  it("an ungeared run is the hand-computed neutral damage", () => {
    expect(runWith(undefined)).toBeCloseTo(BASE_SKILL_DAMAGE, 6);
  });

  it("an empty equipment entry changes nothing", () => {
    expect(runWith({})).toBeCloseTo(BASE_SKILL_DAMAGE, 6);
  });
});

// ---------------------------------------------------------------------------
// REFINEMENT: fail-closed, and R5 must not simulate as R1.
// ---------------------------------------------------------------------------

/**
 * A passive whose magnitude DIFFERS per refinement, so any confusion between
 * two levels is a different damage number rather than a different code path.
 * R3 is deliberately ABSENT to pin the "not authored" case separately from the
 * "no refinement stated" case.
 */
const REFINED_PASSIVE = {
  name: "Synthetic Refined Passive",
  buffsByRefinement: {
    1: [dmgBuff("syn-r1", 0.1)],
    2: [dmgBuff("syn-r2", 0.2)],
    4: [dmgBuff("syn-r4", 0.4)],
    5: [dmgBuff("syn-r5", 0.5)],
  },
} as const;

describe("equipment channel — refinement selection", () => {
  it.each([
    [1, 0.1],
    [2, 0.2],
    [4, 0.4],
    [5, 0.5],
  ])("R%i applies exactly its own magnitude", (refinement, bonus) => {
    const damage = runWith({
      refinement: refinement as WeaponRefinement,
      weaponPassive: REFINED_PASSIVE,
    });
    expect(damage).toBeCloseTo(expectedNeutralDamage(1000, 2, bonus), 6);
  });

  it("R5 is NOT silently simulated as R1 (the defect the module names)", () => {
    const r5 = runWith({ refinement: 5, weaponPassive: REFINED_PASSIVE });
    const r1 = runWith({ refinement: 1, weaponPassive: REFINED_PASSIVE });
    // Both "apply the passive"; only a NUMBER distinguishes them.
    expect(r5).toBeGreaterThan(r1);
    expect(r5).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.5), 6);
    expect(r1).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.1), 6);
  });

  it("an unauthored refinement yields NO buff, not the R1 fallback", () => {
    // R3 is absent from the table. Falling back to R1 would give 1100.
    expect(runWith({ refinement: 3, weaponPassive: REFINED_PASSIVE })).toBeCloseTo(
      BASE_SKILL_DAMAGE,
      6,
    );
  });

  it("a missing refinement yields NO buff, not the R1 fallback", () => {
    expect(runWith({ weaponPassive: REFINED_PASSIVE })).toBeCloseTo(
      BASE_SKILL_DAMAGE,
      6,
    );
  });

  it.each([0, 6, 1.5, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "out-of-range refinement %p yields no buff and does not throw",
    (refinement) => {
      const equipment = {
        refinement,
        weaponPassive: REFINED_PASSIVE,
      } as unknown as CharacterEquipmentBuffs;
      expect(harvestWeaponPassiveBuffs(equipment)).toEqual([]);
      expect(runWith(equipment)).toBeCloseTo(BASE_SKILL_DAMAGE, 6);
    },
  );
});

// ---------------------------------------------------------------------------
// PIECE COUNT: the 2pc/4pc boundary, attacked from both sides.
// ---------------------------------------------------------------------------

const SYNTHETIC_SET: ArtifactSetBonusBuffs = {
  setId: "synthetic-set",
  twoPiece: [dmgBuff("syn-2pc", 0.15)],
  fourPiece: [dmgBuff("syn-4pc", 0.35)],
};

describe("equipment channel — artifact piece-count gating", () => {
  it.each([
    [0, 0],
    [1, 0],
    [2, 0.15],
    [3, 0.15],
    [4, 0.15 + 0.35],
    [5, 0.15 + 0.35],
  ])("%i pieces grants exactly +%p DMG", (count, bonus) => {
    const damage = runWith({
      artifacts: loadout("synthetic-set", count),
      setBonuses: [SYNTHETIC_SET],
    });
    expect(damage).toBeCloseTo(expectedNeutralDamage(1000, 2, bonus), 6);
  });

  it("3 pieces is NOT the 4pc bonus — the off-by-one that reads as 'works'", () => {
    const three = runWith({
      artifacts: loadout("synthetic-set", 3),
      setBonuses: [SYNTHETIC_SET],
    });
    const four = runWith({
      artifacts: loadout("synthetic-set", 4),
      setBonuses: [SYNTHETIC_SET],
    });
    expect(three).toBeLessThan(four);
    expect(three).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.15), 6);
  });

  it("4pc grants the 2pc bonus as well, matching the game", () => {
    const four = runWith({
      artifacts: loadout("synthetic-set", 4),
      setBonuses: [SYNTHETIC_SET],
    });
    // Not merely > 2pc: the 2pc term must still be present at 4 pieces.
    expect(four).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.5), 6);
  });

  it("buffs of a set that is not equipped never apply", () => {
    expect(
      runWith({
        artifacts: loadout("some-other-set", 4),
        setBonuses: [SYNTHETIC_SET],
      }),
    ).toBeCloseTo(BASE_SKILL_DAMAGE, 6);
  });

  it("two 2pc sets both apply, and neither reaches its 4pc tier", () => {
    const artifacts: ArtifactLoadout = {
      flower: piece("flower", "set-a"),
      plume: piece("plume", "set-a"),
      sands: piece("sands", "set-b"),
      goblet: piece("goblet", "set-b"),
    };
    const damage = runWith({
      artifacts,
      setBonuses: [
        { setId: "set-a", twoPiece: [dmgBuff("a2", 0.1)], fourPiece: [dmgBuff("a4", 9)] },
        { setId: "set-b", twoPiece: [dmgBuff("b2", 0.2)], fourPiece: [dmgBuff("b4", 9)] },
      ],
    });
    expect(damage).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.3), 6);
  });
});

// ---------------------------------------------------------------------------
// THE `enemyModifiers` PATH — the manager's headline ask.
//
// The weapon adapter carries `enemyModifiers` through but no expressible weapon
// has one today, so the path is untravelled by real data. Artifacts (RES-shred
// sets) are expected to be the first real carrier. These tests pin that the
// channel is LIVE, so the day such a set lands it changes damage rather than
// being silently dropped.
// ---------------------------------------------------------------------------

describe("equipment channel — enemyModifiers are not silently dropped", () => {
  it("a set-bonus RES shred reaches the damage pipeline", () => {
    // Enemy pyro RES 0. A -20% shred gives RES -0.2, and the pipeline's
    // negative-RES branch halves it: multiplier 1 - (-0.2)/2 = 1.10.
    const withShred = runWith({
      artifacts: loadout("shred-set", 4),
      setBonuses: [{ setId: "shred-set", fourPiece: [shredBuff("shred-4pc", 0.2)] }],
    });
    expect(withShred).toBeCloseTo(BASE_SKILL_DAMAGE * 1.1, 6);
    // The whole point: it is NOT equal to the unshredded run.
    expect(withShred).not.toBeCloseTo(BASE_SKILL_DAMAGE, 6);
  });

  it("a weapon-passive RES shred reaches the damage pipeline too", () => {
    const withShred = runWith({
      refinement: 5,
      weaponPassive: {
        name: "Synthetic Shred Passive",
        buffsByRefinement: { 5: [shredBuff("wpn-shred-r5", 0.2)] },
      },
    });
    expect(withShred).toBeCloseTo(BASE_SKILL_DAMAGE * 1.1, 6);
  });

  it("shred is gated by piece count exactly like a stat bonus", () => {
    const bonuses: readonly ArtifactSetBonusBuffs[] = [
      { setId: "shred-set", fourPiece: [shredBuff("shred-4pc", 0.2)] },
    ];
    const three = runWith({ artifacts: loadout("shred-set", 3), setBonuses: bonuses });
    const four = runWith({ artifacts: loadout("shred-set", 4), setBonuses: bonuses });
    expect(three).toBeCloseTo(BASE_SKILL_DAMAGE, 6);
    expect(four).toBeCloseTo(BASE_SKILL_DAMAGE * 1.1, 6);
  });

  it("shred composes ADDITIVELY with a caller-supplied enemy resolver", () => {
    // Both sources must survive: composition is additive, never replacement.
    const config: SimulationConfig = {
      ...NO_CRIT_CONFIG,
      enemyModifierResolver: () => ({
        defReduction: 0,
        defIgnore: 0,
        resReduction: { pyro: 0.2 },
      }),
      equipmentBuffs: {
        a: {
          artifacts: loadout("shred-set", 4),
          setBonuses: [
            { setId: "shred-set", fourPiece: [shredBuff("shred-4pc", 0.2)] },
          ],
        },
      },
    };
    const damage = simulateRotation(
      [makeTestCharacter("a")],
      SKILL_ONLY,
      NEUTRAL_ENEMY,
      config,
    ).totalDamage;
    // Total shred 0.4 -> RES -0.4 -> multiplier 1.20.
    expect(damage).toBeCloseTo(BASE_SKILL_DAMAGE * 1.2, 6);
  });
});

// ---------------------------------------------------------------------------
// COMPOSITION and ORDER.
// ---------------------------------------------------------------------------

describe("equipment channel — composition is additive, never replacement", () => {
  it("a caller-supplied buffResolver survives alongside equipment buffs", () => {
    const config: SimulationConfig = {
      ...NO_CRIT_CONFIG,
      buffResolver: (base) => ({ ...base, dmgBonus: base.dmgBonus + 0.25 }),
      equipmentBuffs: {
        a: { refinement: 5, weaponPassive: REFINED_PASSIVE },
      },
    };
    const damage = simulateRotation(
      [makeTestCharacter("a")],
      SKILL_ONLY,
      NEUTRAL_ENEMY,
      config,
    ).totalDamage;
    // R5 gives +0.50, the caller gives +0.25; both must be present.
    expect(damage).toBeCloseTo(expectedNeutralDamage(1000, 2, 0.75), 6);
  });

  it("weapon buffs precede artifact buffs in the harvested order", () => {
    const harvested = harvestCharacterEquipmentBuffs({
      refinement: 1,
      weaponPassive: REFINED_PASSIVE,
      artifacts: loadout("synthetic-set", 4),
      setBonuses: [SYNTHETIC_SET],
    });
    expect(harvested.map((buff) => buff.id)).toEqual([
      "syn-r1",
      "syn-2pc",
      "syn-4pc",
    ]);
  });

  it("team harvest walks TEAM order, not the config map's key order", () => {
    const byCharacter = {
      b: { refinement: 1, weaponPassive: { name: "b", buffsByRefinement: { 1: [dmgBuff("bb", 0.1)] } } },
      a: { refinement: 1, weaponPassive: { name: "a", buffsByRefinement: { 1: [dmgBuff("aa", 0.1)] } } },
    };
    // Map key order is b,a — team order is a,b and must win.
    expect(harvestTeamEquipmentBuffs(["a", "b"], byCharacter).map((x) => x.id)).toEqual([
      "aa",
      "bb",
    ]);
    expect(harvestTeamEquipmentBuffs(["b", "a"], byCharacter).map((x) => x.id)).toEqual([
      "bb",
      "aa",
    ]);
  });

  it("ids absent from the team are ignored", () => {
    const byCharacter = {
      ghost: {
        refinement: 5,
        weaponPassive: REFINED_PASSIVE,
      },
    };
    expect(harvestTeamEquipmentBuffs(["a"], byCharacter)).toEqual([]);
  });
});

describe("equipment channel — malformed input degrades, never throws", () => {
  it.each([null, undefined, 42, "weapon", true, []])(
    "a %p equipment entry is ignored",
    (value) => {
      expect(() =>
        harvestTeamEquipmentBuffs(["a"], { a: value }),
      ).not.toThrow();
    },
  );

  it("set bonuses with no artifacts yield nothing", () => {
    expect(harvestArtifactSetBuffs({ setBonuses: [SYNTHETIC_SET] })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// DETERMINISM over the new path.
// ---------------------------------------------------------------------------

describe("equipment channel — determinism", () => {
  const equipment: CharacterEquipmentBuffs = {
    refinement: 4,
    weaponPassive: REFINED_PASSIVE,
    artifacts: loadout("synthetic-set", 4),
    setBonuses: [SYNTHETIC_SET],
  };

  it("repeated runs over the equipment path are byte-identical", () => {
    const runs = Array.from({ length: 5 }, () =>
      JSON.stringify(
        simulateRotation(
          [makeTestCharacter("a")],
          SKILL_ONLY,
          NEUTRAL_ENEMY,
          { ...NO_CRIT_CONFIG, equipmentBuffs: { a: equipment } },
        ),
      ),
    );
    expect(new Set(runs).size).toBe(1);
  });

  it("harvest order does not depend on set-bonus authoring being sorted", () => {
    // Two DIFFERENT authored orders of the same sets must each be stable, and
    // the harvest must follow the AUTHORED order — a documented contract.
    const forward = harvestArtifactSetBuffs({
      artifacts: {
        flower: piece("flower", "set-a"),
        plume: piece("plume", "set-a"),
        sands: piece("sands", "set-b"),
        goblet: piece("goblet", "set-b"),
      },
      setBonuses: [
        { setId: "set-b", twoPiece: [dmgBuff("b2", 0.2)] },
        { setId: "set-a", twoPiece: [dmgBuff("a2", 0.1)] },
      ],
    });
    expect(forward.map((buff) => buff.id)).toEqual(["b2", "a2"]);
  });
});
