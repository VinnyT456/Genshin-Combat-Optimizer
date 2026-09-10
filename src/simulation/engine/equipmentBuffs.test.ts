import { describe, expect, it } from "vitest";
import type { EnemyState, Rotation, SimulationConfig } from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import type { ArtifactPiece, ArtifactSlot } from "@/simulation/character/equipment";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import {
  type ArtifactSetBonusBuffs,
  type CharacterEquipmentBuffs,
  type EquipmentBuffsByCharacter,
  type WeaponRefinement,
  harvestArtifactSetBuffs,
  harvestCharacterEquipmentBuffs,
  harvestTeamEquipmentBuffs,
  harvestWeaponPassiveBuffs,
  isWeaponRefinement,
  withEquipmentBuffs,
} from "@/simulation/engine/equipmentBuffs";
import { syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// EQUIPMENT BUFF HARVEST — the conditional half of the equipment model.
//
// `resolveEquippedStats()` already carried gear STATS to the engine. A weapon
// passive or a set bonus authored as `Buff` data had NO entry point, so it
// contributed nothing to damage.
//
// The two load-bearing tests in this file are asserted through
// `simulateRotation`, not through a unit call:
//
//   1. changing a weapon's REFINEMENT changes the damage number
//   2. going 2pc -> 4pc changes the damage number, and 3pc does NOT
//
// A harvest that merely returns the right list while nothing consumes it would
// pass a unit test and fail both of these.
//
// Every number here is SYNTHETIC, not game data.
// ============================================================================

const ENEMY: EnemyState = {
  id: "equipment-test-enemy",
  name: "Equipment Test Enemy",
  level: 90,
  resistances: {},
};

const SKILL_ROTATION: Rotation = [
  { characterId: syntheticUnit.id, actionType: "skill" },
];

/**
 * A PURE-ATK rotation, for the tests that assert an EXACT damage ratio.
 *
 * The synthetic SKILL is deliberately hybrid ATK+HP (0.05 * maxHP), so an ATK%
 * buff moves only the ATK share of it and the end-to-end ratio is diluted —
 * correctly, but by a factor that would have to be hard-coded here. The NORMAL
 * attack scales on ATK alone and costs no energy, so
 * `damage ratio == 1 + atkPercent` exactly and a broken assertion points at the
 * WIRING rather than at the fixture's scaling mix.
 */
const NORMAL_ROTATION: Rotation = [
  { characterId: syntheticUnit.id, actionType: "normal" },
];

/** A permanent, self-targeted flat ATK% buff, as gear data authors it. */
function atkBuff(id: string, value: number): Buff {
  return {
    id,
    source: id,
    sourceCharacterId: syntheticUnit.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "atkPercent", value }],
  };
}

/**
 * A weapon passive authored at every refinement, with a DISTINCT magnitude per
 * level — so an R1-by-default bug produces a visibly wrong number rather than
 * a number that happens to match.
 */
const ATK_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.2,
  2: 0.25,
  3: 0.3,
  4: 0.35,
  5: 0.4,
};

function weaponEquipment(refinement: WeaponRefinement): CharacterEquipmentBuffs {
  return {
    refinement,
    weaponPassive: {
      name: "Synthetic Passive",
      buffsByRefinement: {
        1: [atkBuff("synthetic-weapon", ATK_BY_REFINEMENT[1])],
        2: [atkBuff("synthetic-weapon", ATK_BY_REFINEMENT[2])],
        3: [atkBuff("synthetic-weapon", ATK_BY_REFINEMENT[3])],
        4: [atkBuff("synthetic-weapon", ATK_BY_REFINEMENT[4])],
        5: [atkBuff("synthetic-weapon", ATK_BY_REFINEMENT[5])],
      },
    },
  };
}

const SET_ID = "synthetic-set";

const SET_BONUS: ArtifactSetBonusBuffs = {
  setId: SET_ID,
  twoPiece: [atkBuff("synthetic-set-2pc", 0.18)],
  fourPiece: [atkBuff("synthetic-set-4pc", 0.5)],
};

const PIECE_SLOTS: readonly ArtifactSlot[] = [
  "flower",
  "plume",
  "sands",
  "goblet",
  "circlet",
];

/** `count` pieces of the synthetic set, each granting no stats of its own. */
function loadoutOf(count: number, setId: string = SET_ID) {
  const loadout: Partial<Record<ArtifactSlot, ArtifactPiece>> = {};
  for (const slot of PIECE_SLOTS.slice(0, count)) {
    loadout[slot] = {
      slot,
      setId,
      // Zero-valued main stat: the ONLY thing varying across these cases must
      // be the set BONUS, never the piece's own stats.
      mainStat: { stat: "atkFlat", value: 0 },
      substats: [],
    };
  }
  return loadout;
}

function setEquipment(count: number): CharacterEquipmentBuffs {
  return { artifacts: loadoutOf(count), setBonuses: [SET_BONUS] };
}

function damageWith(
  equipment: CharacterEquipmentBuffs | undefined,
  rotation: Rotation = SKILL_ROTATION,
): number {
  const equipmentBuffs: EquipmentBuffsByCharacter | undefined =
    equipment === undefined ? undefined : { [syntheticUnit.id]: equipment };
  const config: SimulationConfig = equipmentBuffs ? { equipmentBuffs } : {};
  return simulateRotation([syntheticUnit], rotation, ENEMY, config).totalDamage;
}

/** Damage on the pure-ATK normal, where the ratio is exactly `1 + atkPercent`. */
function normalDamageWith(equipment: CharacterEquipmentBuffs | undefined): number {
  return damageWith(equipment, NORMAL_ROTATION);
}

// ---------------------------------------------------------------------------
// DELIVERABLE 1 — refinement changes damage END TO END
// ---------------------------------------------------------------------------

describe("weapon refinement changes damage through simulateRotation", () => {
  it("every refinement R1..R5 yields a STRICTLY higher damage number", () => {
    const damages = ([1, 2, 3, 4, 5] as const).map((r) =>
      damageWith(weaponEquipment(r)),
    );
    for (let i = 1; i < damages.length; i += 1) {
      expect(damages[i]!).toBeGreaterThan(damages[i - 1]!);
    }
    // Five DISTINCT numbers: an R1-by-default bug collapses all five to one.
    expect(new Set(damages).size).toBe(damages.length);
  });

  it("R5 damage matches the R5 ATK% exactly, not R1's", () => {
    const bare = normalDamageWith(undefined);
    const r5 = normalDamageWith(weaponEquipment(5));
    // The normal attack is ATK-only and the unit is ungeared, so final ATK == base ATK and
    // the ratio is exactly (1 + atkPercent). Pinning the R5 value AND rejecting
    // the R1 value is what makes an R1-by-default bug fail here.
    expect(r5 / bare).toBeCloseTo(1 + ATK_BY_REFINEMENT[5], 6);
    expect(r5 / bare).not.toBeCloseTo(1 + ATK_BY_REFINEMENT[1], 6);
  });

  it("a passive with no stated refinement is INERT, never R1-by-default", () => {
    const noRefinement: CharacterEquipmentBuffs = {
      weaponPassive: weaponEquipment(1).weaponPassive,
    };
    expect(damageWith(noRefinement)).toBe(damageWith(undefined));
  });

  it("a refinement the passive does not author yields nothing", () => {
    const sparse: CharacterEquipmentBuffs = {
      refinement: 3,
      weaponPassive: {
        name: "Sparse",
        buffsByRefinement: { 1: [atkBuff("sparse", 0.2)] },
      },
    };
    expect(harvestWeaponPassiveBuffs(sparse)).toEqual([]);
    expect(damageWith(sparse)).toBe(damageWith(undefined));
  });

  it("rejects out-of-range refinements rather than indexing with them", () => {
    expect(isWeaponRefinement(0)).toBe(false);
    expect(isWeaponRefinement(6)).toBe(false);
    expect(isWeaponRefinement(2.5)).toBe(false);
    expect(isWeaponRefinement(1)).toBe(true);
    expect(isWeaponRefinement(5)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DELIVERABLE 2 — piece count gates set bonuses END TO END
// ---------------------------------------------------------------------------

describe("artifact piece count changes damage through simulateRotation", () => {
  it("2pc -> 4pc changes the damage number", () => {
    const twoPiece = damageWith(setEquipment(2));
    const fourPiece = damageWith(setEquipment(4));
    expect(fourPiece).toBeGreaterThan(twoPiece);
  });

  it("a 4pc bonus does NOT apply at 3 pieces", () => {
    // The load-bearing gate. 3 pieces must behave EXACTLY like 2.
    expect(damageWith(setEquipment(3))).toBe(damageWith(setEquipment(2)));
    expect(damageWith(setEquipment(3))).toBeLessThan(damageWith(setEquipment(4)));
  });

  it("1 piece grants nothing at all", () => {
    expect(damageWith(setEquipment(1))).toBe(damageWith(undefined));
    expect(damageWith(setEquipment(0))).toBe(damageWith(undefined));
  });

  it("4 pieces grant BOTH tiers, as in game", () => {
    const bare = normalDamageWith(undefined);
    const fourPiece = normalDamageWith(setEquipment(4));
    // 2pc 0.18 + 4pc 0.5 both fold into the ATK% channel.
    expect(fourPiece / bare).toBeCloseTo(1 + 0.18 + 0.5, 6);
  });

  it("5 pieces are still 4pc — no third tier is invented", () => {
    expect(damageWith(setEquipment(5))).toBe(damageWith(setEquipment(4)));
  });

  it("a set whose pieces are not equipped contributes nothing", () => {
    const otherSet: CharacterEquipmentBuffs = {
      artifacts: loadoutOf(4, "some-other-set"),
      setBonuses: [SET_BONUS],
    };
    expect(harvestArtifactSetBuffs(otherSet)).toEqual([]);
    expect(damageWith(otherSet)).toBe(damageWith(undefined));
  });
});

// ---------------------------------------------------------------------------
// Composition — sources coexist rather than replace one another
// ---------------------------------------------------------------------------

describe("equipment buffs compose with other sources", () => {
  it("weapon passive and set bonus stack in one build", () => {
    const bare = normalDamageWith(undefined);
    const both = normalDamageWith({
      ...weaponEquipment(5),
      ...setEquipment(4),
    });
    // 0.4 weapon + 0.18 2pc + 0.5 4pc, all in the ATK% channel.
    expect(both / bare).toBeCloseTo(1 + 0.4 + 0.18 + 0.5, 6);
  });

  it("a caller-supplied buffResolver is COMPOSED, not replaced", () => {
    const equipmentBuffs: EquipmentBuffsByCharacter = {
      [syntheticUnit.id]: weaponEquipment(5),
    };
    const withResolver = simulateRotation([syntheticUnit], NORMAL_ROTATION, ENEMY, {
      equipmentBuffs,
      buffResolver: (base) => ({ ...base, atk: base.atk * 2 }),
    });
    const equipmentOnly = normalDamageWith(weaponEquipment(5));
    // The caller's doubling runs AFTER the equipment fold, so both are present.
    expect(withResolver.totalDamage).toBeCloseTo(equipmentOnly * 2, 6);
  });

  it("only the wearing character is affected", () => {
    const teamIds = [syntheticUnit.id, "other-character"];
    const buffs = harvestTeamEquipmentBuffs(teamIds, {
      "other-character": weaponEquipment(5),
    });
    // Harvested (the id IS on the team), but self-targeted to its own owner.
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.targets.scope).toBe("self");
  });

  it("ids absent from the team are ignored", () => {
    expect(
      harvestTeamEquipmentBuffs([syntheticUnit.id], {
        "not-on-the-team": weaponEquipment(5),
      }),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Additivity and determinism
// ---------------------------------------------------------------------------

describe("the seam is additive and deterministic", () => {
  it("returns the caller's config BY IDENTITY when nothing is harvested", () => {
    // Identity, not deep equality: a fresh object would make every no-gear run
    // allocate new resolvers and split optimizer memo entries for zero
    // information.
    const bare: SimulationConfig = {};
    expect(withEquipmentBuffs([syntheticUnit.id], bare)).toBe(bare);

    const emptyMap: SimulationConfig = { equipmentBuffs: {} };
    expect(withEquipmentBuffs([syntheticUnit.id], emptyMap)).toBe(emptyMap);

    // Present but contributing nothing (1 piece of a 2pc set) is still identity.
    const inert: SimulationConfig = {
      equipmentBuffs: { [syntheticUnit.id]: setEquipment(1) },
    };
    expect(withEquipmentBuffs([syntheticUnit.id], inert)).toBe(inert);
  });

  it("absent equipmentBuffs reproduces prior behaviour exactly", () => {
    const withoutConfig = simulateRotation([syntheticUnit], SKILL_ROTATION, ENEMY);
    const withEmpty = simulateRotation([syntheticUnit], SKILL_ROTATION, ENEMY, {
      equipmentBuffs: {},
    });
    expect(withEmpty.totalDamage).toBe(withoutConfig.totalDamage);
  });

  it("harvest order is stable: weapon passive before set bonuses", () => {
    const buffs = harvestCharacterEquipmentBuffs({
      ...weaponEquipment(5),
      ...setEquipment(4),
    });
    expect(buffs.map((b) => b.id)).toEqual([
      "synthetic-weapon",
      "synthetic-set-2pc",
      "synthetic-set-4pc",
    ]);
  });

  it("repeated runs are byte-identical", () => {
    const config: SimulationConfig = {
      equipmentBuffs: {
        [syntheticUnit.id]: { ...weaponEquipment(3), ...setEquipment(4) },
      },
    };
    const a = simulateRotation([syntheticUnit], SKILL_ROTATION, ENEMY, config);
    const b = simulateRotation([syntheticUnit], SKILL_ROTATION, ENEMY, config);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("a malformed entry degrades to no buffs instead of throwing", () => {
    expect(
      harvestTeamEquipmentBuffs([syntheticUnit.id], {
        [syntheticUnit.id]: "not an object",
      }),
    ).toEqual([]);
  });
});
