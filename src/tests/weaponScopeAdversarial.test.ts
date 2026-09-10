import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { Buff } from "@/simulation/buffs/types";
import type { WeaponRefinement } from "@/simulation/engine/equipmentBuffs";
import {
  buffsForRefinement,
  weaponPassiveBuffsById,
  weaponPassiveBuffsByWeaponId,
} from "@/game-data/weapons/weaponBuffs";
import { generatedWeaponsById } from "@/game-data/weapons/generated";
import type { GeneratedWeaponRefinement } from "@/game-data/weapons/generated";
import type { Rotation, SimulationConfig } from "@/types";
import {
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
  expectedNeutralDamage,
  makeTestCharacter,
} from "./helpers/fixtures";

// ============================================================================
// ADVERSARIAL attack on `damageTypes` scope survival (TASK #067).
//
// THE LOAD-BEARING PROPERTY. Rust R1 is one generated row carrying TWO grants
// with DIFFERENT scopes: -10% Charged and +40% Normal. `Buff` states scope
// per-BUFF (`conditions.damageTypes`), so the row must become TWO buffs. The
// specific failure the adapter exists to prevent is folding them into one
// UNCONDITIONED buff, which nets +30% on EVERY damage type — including Burst,
// which Rust does not touch at all.
//
// A "the passive applies" test passes under that bug. Only a per-damage-type
// number distinguishes it, so every assertion below is a number on a rotation
// chosen to isolate one scope.
//
// TWO INDEPENDENT VERIFICATIONS, deliberately:
//
//   1. REAL Rust data, end to end through `simulateRotation`.
//   2. A SYNTHETIC three-scope fixture, labelled as synthetic. Real weapon data
//      happens to use at most two scopes per row, so a sweep over real data
//      could not distinguish "groups by scope" from "splits into exactly two".
//      The synthetic case is NOT a claim about any real weapon.
//
// The expectation is NOT derived from the adapter's own grouping predicate:
// each expected number below is written from the weapon's published TEXT.
// ============================================================================

const RUST_ID = "rust";

/** ATK 1000, multiplier 1.0, DEF x0.5 -> 500 per normal/charged hit. */
const NORMAL_BASE = expectedNeutralDamage(1000, 1);
/** Skill: multiplier 2.0 -> 1000. Burst: multiplier 4.0 -> 2000. */
const SKILL_BASE = expectedNeutralDamage(1000, 2);
const BURST_BASE = expectedNeutralDamage(1000, 4);

function runRotation(
  rotation: Rotation,
  refinement?: WeaponRefinement,
  weaponId = RUST_ID,
): number {
  const passive = weaponPassiveBuffsById(weaponId);
  const config: SimulationConfig = {
    ...NO_CRIT_CONFIG,
    ...(refinement !== undefined && passive
      ? { equipmentBuffs: { a: { refinement, weaponPassive: passive } } }
      : {}),
  };
  return simulateRotation(
    [BURSTABLE],
    rotation,
    NEUTRAL_ENEMY,
    config,
  ).totalDamage;
}

/**
 * The burst is given ZERO energy cost so a Burst rotation is always a VALID
 * action. Scope survival is the question here; making it depend on particle
 * generation would couple this test to the energy model and let an energy
 * regression masquerade as a scope regression. (The original fixture's default
 * 40-cost burst silently produced 0 damage — an invalid action — which would
 * have made every "Burst is unchanged" assertion vacuously 0 === 0.)
 */
const BURSTABLE = makeTestCharacter("a", { elementalBurst: { energyCost: 0 } });

const NORMAL_ONLY: Rotation = [{ characterId: "a", actionType: "normal" }];
const CHARGED_ONLY: Rotation = [{ characterId: "a", actionType: "charged" }];
const SKILL_ONLY: Rotation = [{ characterId: "a", actionType: "skill" }];
const BURST_ONLY: Rotation = [{ characterId: "a", actionType: "burst" }];

describe("Rust — real data, scope survives end to end", () => {
  it("is present and expressible at every refinement R1-R5", () => {
    const passive = weaponPassiveBuffsById(RUST_ID);
    expect(passive).toBeDefined();
    for (const refinement of [1, 2, 3, 4, 5] as const) {
      expect(passive?.buffsByRefinement[refinement]).toBeDefined();
    }
  });

  it("R1 raises a Normal rotation by exactly x1.40", () => {
    expect(runRotation(NORMAL_ONLY, 1)).toBeCloseTo(NORMAL_BASE * 1.4, 6);
  });

  it("R1 LOWERS a Charged rotation by exactly x0.90", () => {
    // The negative grant is the half a 'passive applies' test never checks.
    expect(runRotation(CHARGED_ONLY, 1)).toBeCloseTo(NORMAL_BASE * 0.9, 6);
  });

  it("R1 leaves a Burst rotation BIT-IDENTICAL to no weapon at all", () => {
    const withRust = simulateRotation(
      [BURSTABLE],
      BURST_ONLY,
      NEUTRAL_ENEMY,
      {
        ...NO_CRIT_CONFIG,
        equipmentBuffs: {
          a: { refinement: 1, weaponPassive: weaponPassiveBuffsById(RUST_ID) },
        },
      },
    );
    const without = simulateRotation(
      [BURSTABLE],
      BURST_ONLY,
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(withRust.totalDamage).toBeCloseTo(BURST_BASE, 6);
    // Bit-identical, not merely close: the folded-buff bug would give +30%.
    expect(JSON.stringify(withRust)).toBe(JSON.stringify(without));
  });

  it("R1 leaves a Skill rotation unchanged", () => {
    expect(runRotation(SKILL_ONLY, 1)).toBeCloseTo(SKILL_BASE, 6);
  });

  it("the folded-buff bug is excluded numerically on every scope", () => {
    // Folding -10% Charged and +40% Normal into one unconditioned buff nets
    // +30%. Each assertion below is FALSE under that fold.
    expect(runRotation(NORMAL_ONLY, 1)).not.toBeCloseTo(NORMAL_BASE * 1.3, 6);
    expect(runRotation(CHARGED_ONLY, 1)).not.toBeCloseTo(NORMAL_BASE * 1.3, 6);
    expect(runRotation(BURST_ONLY, 1)).not.toBeCloseTo(BURST_BASE * 1.3, 6);
    expect(runRotation(SKILL_ONLY, 1)).not.toBeCloseTo(SKILL_BASE * 1.3, 6);
  });

  it.each([
    [1, 1.4],
    [2, 1.5],
    [3, 1.6],
    [4, 1.7],
    [5, 1.8],
  ])(
    "R%i scales the Normal grant to x%p while Charged stays x0.90",
    (refinement, normalFactor) => {
      const r = refinement as WeaponRefinement;
      expect(runRotation(NORMAL_ONLY, r)).toBeCloseTo(
        NORMAL_BASE * normalFactor,
        6,
      );
      // The Charged penalty is -10% at EVERY refinement; a refinement-indexed
      // bug that scaled both grants together would move this.
      expect(runRotation(CHARGED_ONLY, r)).toBeCloseTo(NORMAL_BASE * 0.9, 6);
    },
  );

  it("R5 is not simulated as R1 on the scoped path", () => {
    expect(runRotation(NORMAL_ONLY, 5)).not.toBeCloseTo(NORMAL_BASE * 1.4, 6);
    expect(runRotation(NORMAL_ONLY, 5)).toBeCloseTo(NORMAL_BASE * 1.8, 6);
  });
});

// ---------------------------------------------------------------------------
// SYNTHETIC three-scope fixture.
//
// LABELLED SYNTHETIC. No real weapon carries three distinct scopes in one row,
// so a sweep over real data cannot tell "groups by scope" from "splits in two".
// These numbers are invented for that discrimination and describe no weapon.
// ---------------------------------------------------------------------------

const SYNTHETIC_THREE_SCOPE: GeneratedWeaponRefinement = {
  refinement: 1,
  text: "SYNTHETIC FIXTURE — not a real weapon passive.",
  bucket: "expressible",
  modifiers: [
    { stat: "dmgBonus", value: 0.4, damageTypes: ["normal"] },
    { stat: "dmgBonus", value: -0.1, damageTypes: ["charged"] },
    { stat: "dmgBonus", value: 0.2, damageTypes: ["burst"] },
    // A genuinely UNSCOPED grant must stay its own group, not join one above.
    { stat: "atk", value: 0.05 },
  ],
  conversions: [],
  enemyModifiers: [],
} as GeneratedWeaponRefinement;

describe("synthetic multi-scope row (labelled synthetic)", () => {
  const buffs = buffsForRefinement("synth", "Synthetic Passive", SYNTHETIC_THREE_SCOPE);

  it("splits into one buff per distinct scope, plus the unscoped group", () => {
    expect(buffs).toHaveLength(4);
  });

  it("every scoped buff carries its own conditions.damageTypes", () => {
    const scopes = buffs.map((buff) => buff.conditions?.damageTypes ?? null);
    expect(scopes).toEqual([
      ["normal"],
      ["charged"],
      ["burst"],
      null,
    ]);
  });

  it("no buff carries a grant belonging to another scope", () => {
    for (const buff of buffs) {
      expect(buff.modifiers).toHaveLength(1);
    }
  });

  it("buff ids are distinct, so scopes cannot collapse under `refresh`", () => {
    const ids = buffs.map((buff) => buff.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the unscoped grant is NOT given a damageTypes condition", () => {
    const unscoped = buffs.find((buff) => buff.conditions === undefined);
    expect(unscoped?.modifiers).toEqual([{ stat: "atk", value: 0.05 }]);
  });
});

// ---------------------------------------------------------------------------
// BUCKET PIN — a reclassification must be a visible test edit.
// ---------------------------------------------------------------------------

describe("weapon bucket census", () => {
  const rows: GeneratedWeaponRefinement[] = [];
  for (const weapon of generatedWeaponsById.values()) {
    for (const row of weapon.passive?.refinements ?? []) rows.push(row);
  }

  it("pins the exact bucket census of the generated weapon data", () => {
    const census = { expressible: 0, unimplemented: 0, unverified: 0 };
    for (const row of rows) census[row.bucket] += 1;
    // A generator reclassification MUST show up as an edit to these numbers.
    expect(census).toEqual({
      expressible: 30,
      unimplemented: 725,
      unverified: 413,
    });
    expect(rows).toHaveLength(1168);
  });

  it("the 30 expressible rows belong to exactly 6 weapons, 5 refinements each", () => {
    // Cross-checks the pin from a DIFFERENT direction: per-weapon, not per-row.
    expect(weaponPassiveBuffsByWeaponId.size).toBe(6);
    for (const passive of weaponPassiveBuffsByWeaponId.values()) {
      expect(Object.keys(passive.buffsByRefinement)).toHaveLength(5);
    }
  });

  it("no non-expressible row ever becomes a buff", () => {
    for (const weapon of generatedWeaponsById.values()) {
      for (const row of weapon.passive?.refinements ?? []) {
        if (row.bucket === "expressible") continue;
        expect(
          buffsForRefinement(weapon.id, weapon.passive?.name ?? "", row),
        ).toEqual([]);
      }
    }
  });

  it("every emitted buff is permanent, active-scoped and starts at t=0", () => {
    for (const passive of weaponPassiveBuffsByWeaponId.values()) {
      for (const buffs of Object.values(passive.buffsByRefinement)) {
        for (const buff of buffs as readonly Buff[]) {
          expect(buff.startTime).toBe(0);
          expect(buff.duration).toBe(Number.POSITIVE_INFINITY);
          expect(buff.targets).toEqual({ scope: "active" });
        }
      }
    }
  });
});

describe("weapon buff adapter — determinism", () => {
  it("repeated conversion of the same weapon is byte-identical", () => {
    const runs = Array.from({ length: 3 }, () =>
      JSON.stringify(weaponPassiveBuffsById(RUST_ID)),
    );
    expect(new Set(runs).size).toBe(1);
  });

  it("an unknown weapon id yields undefined rather than throwing", () => {
    expect(weaponPassiveBuffsById("no-such-weapon")).toBeUndefined();
  });
});
