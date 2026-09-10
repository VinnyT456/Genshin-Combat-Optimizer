import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type { EquipmentBuffsByCharacter } from "@/simulation/engine/equipmentBuffs";
import { harvestWeaponPassiveBuffs } from "@/simulation/engine/equipmentBuffs";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type {
  GeneratedWeapon,
  GeneratedWeaponRefinement,
} from "./generated";
import { generatedWeaponsById } from "./generated";
import {
  buffsForRefinement,
  weaponPassiveBuffs,
  weaponPassiveBuffsById,
  weaponPassiveBuffsByWeaponId,
} from "./weaponBuffs";

// ============================================================================
// The generated-weapon -> `Buff` adapter, proven END TO END.
//
// The engine's equipment channel was live but UNFED: it consumes authored
// `Buff` objects and the generator emits its own sourced shape. These tests
// pin the translation at the only place it can be proven -- a damage number
// out of `simulateRotation` -- and pin the two ways the translation can be
// silently wrong while every structural check still passes:
//
//   SCOPE DROPPED     Rust's Normal-only +40% applied to a Burst. The buff
//                     exists, the damage moves, and the number is too big.
//   REFINEMENT LOST   an R5 weapon simulating as R1. The passive applies, the
//                     damage moves, and the number is too small.
//
// Both are the ROADMAP 0 failure mode: a plausible wrong number that a naive
// "the passive applies" assertion still passes.
//
// WEAPONS USED ARE REAL GENERATED DATA, not fixtures. If the generator stops
// emitting one of these as `expressible`, these tests fail loudly rather than
// vacuously passing on an empty buff list -- which is the point.
// ============================================================================

/** Rust: -10% Charged, +40%..+80% Normal. The scope-discriminating weapon. */
const RUST = "rust";
/** "The Catch": Burst-only DMG% and CRIT Rate. */
const THE_CATCH = "thecatch";
/** Redhorn Stonethresher: unscoped DEF%, plus a Normal/Charged-scoped conversion. */
const REDHORN = "redhornstonethresher";

const NORMAL_ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "normal" },
];
const BURST_ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
  { characterId: testPyro.id, actionType: "burst" },
];

function weaponFor(id: string) {
  const weapon = generatedWeaponsById.get(id);
  expect(weapon, `generated data must still contain ${id}`).toBeDefined();
  return weapon!;
}

/** Damage for a rotation with one weapon's passive equipped at `refinement`. */
function damageWith(
  weaponId: string | undefined,
  refinement: 1 | 2 | 3 | 4 | 5,
  rotation: Rotation,
): number {
  let config: SimulationConfig = {};
  if (weaponId !== undefined) {
    const weaponPassive = weaponPassiveBuffsById(weaponId);
    expect(weaponPassive, `${weaponId} must yield buffs`).toBeDefined();
    const equipmentBuffs: EquipmentBuffsByCharacter = {
      [testPyro.id]: { refinement, weaponPassive: weaponPassive! },
    };
    config = { equipmentBuffs };
  }
  return simulateRotation([testPyro], rotation, testEnemy, config).totalDamage;
}

// ---------------------------------------------------------------------------
// DELIVERABLE — a generated weapon's Buff changes damage through the engine
// ---------------------------------------------------------------------------

describe("a generated weapon's emitted Buff reaches simulateRotation", () => {
  it("Rust's Normal-attack bonus raises Normal damage", () => {
    const bare = damageWith(undefined, 1, NORMAL_ROTATION);
    const equipped = damageWith(RUST, 1, NORMAL_ROTATION);
    expect(equipped).toBeGreaterThan(bare);
  });

  it("Rust R1 grants exactly +40% Normal DMG, not some other number", () => {
    // testPyro's normal attack is Physical, and `dmgBonus` is the generic
    // channel, so the whole effect is a clean 1.40 multiplier on the hit.
    const bare = damageWith(undefined, 1, NORMAL_ROTATION);
    const equipped = damageWith(RUST, 1, NORMAL_ROTATION);
    expect(equipped / bare).toBeCloseTo(1.4, 9);
  });

  it("every refinement R1..R5 yields a distinct, increasing Normal damage", () => {
    const damages = ([1, 2, 3, 4, 5] as const).map((r) =>
      damageWith(RUST, r, NORMAL_ROTATION),
    );
    for (let i = 1; i < damages.length; i += 1) {
      expect(damages[i]!).toBeGreaterThan(damages[i - 1]!);
    }
    // An R1-by-default bug collapses all five onto one number.
    expect(new Set(damages).size).toBe(damages.length);
  });

  it("Rust R5 is +80% Normal DMG — the R5 row, not R1's scaled", () => {
    const bare = damageWith(undefined, 5, NORMAL_ROTATION);
    expect(damageWith(RUST, 5, NORMAL_ROTATION) / bare).toBeCloseTo(1.8, 9);
  });
});

// ---------------------------------------------------------------------------
// THE SCOPE ROUND TRIP — `damageTypes` survives generated data -> Buff -> hit
// ---------------------------------------------------------------------------

describe("damageTypes scope survives the round trip", () => {
  it("Rust's Normal-only bonus does NOT apply to a Burst hit", () => {
    // THE headline assertion. Dropping `conditions.damageTypes` turns Rust's
    // Normal-only +40% into a global one and inflates this number by 40%.
    const bare = damageWith(undefined, 1, BURST_ROTATION);
    expect(damageWith(RUST, 1, BURST_ROTATION)).toBe(bare);
  });

  it("Rust's Charged penalty does not touch Normal damage either", () => {
    // Rust R1 carries BOTH -10% Charged and +40% Normal in ONE generated row.
    // Folding the row into a single unconditioned buff would net them to +30%.
    const bare = damageWith(undefined, 1, NORMAL_ROTATION);
    expect(damageWith(RUST, 1, NORMAL_ROTATION) / bare).toBeCloseTo(1.4, 9);
  });

  it("'The Catch' Burst bonus moves Burst damage and not Normal damage", () => {
    // The mirror image of Rust: a Burst-scoped weapon must be inert on Normals.
    expect(damageWith(THE_CATCH, 1, BURST_ROTATION)).toBeGreaterThan(
      damageWith(undefined, 1, BURST_ROTATION),
    );
    expect(damageWith(THE_CATCH, 1, NORMAL_ROTATION)).toBe(
      damageWith(undefined, 1, NORMAL_ROTATION),
    );
  });

  it("a row with two different scopes becomes two separately-gated buffs", () => {
    const rust = weaponFor(RUST);
    const r1 = rust.passive!.refinements.find((r) => r.refinement === 1)!;
    const buffs = buffsForRefinement(rust.id, rust.passive!.name, r1);

    expect(buffs).toHaveLength(2);
    const scopes = buffs.map((b) => b.conditions?.damageTypes);
    expect(scopes).toContainEqual(["charged"]);
    expect(scopes).toContainEqual(["normal"]);
    // Distinct stacking identities, or `refresh` would collapse them into one.
    expect(new Set(buffs.map((b) => b.id)).size).toBe(2);
  });

  it("every emitted buff carries the scope of the grants it holds", () => {
    // Swept across ALL generated weapons: no row may lose its scope.
    for (const [id, weapon] of generatedWeaponsById) {
      for (const row of weapon.passive?.refinements ?? []) {
        for (const buff of buffsForRefinement(id, weapon.passive!.name, row)) {
          const scope = buff.conditions?.damageTypes;
          for (const modifier of row.modifiers) {
            // A modifier's scope must equal the scope of whichever buff holds
            // it; the only way to check that generically is that some buff
            // carries exactly this scope.
            expect(
              buffsForRefinement(id, weapon.passive!.name, row).some(
                (b) =>
                  JSON.stringify(b.conditions?.damageTypes ?? null) ===
                  JSON.stringify(
                    modifier.damageTypes
                      ? [...modifier.damageTypes].sort()
                      : null,
                  ),
              ),
            ).toBe(true);
          }
          // A buff with no grants at all is meaningless data.
          expect(
            (buff.modifiers?.length ?? 0) +
              (buff.conversions?.length ?? 0) +
              (buff.enemyModifiers?.length ?? 0),
          ).toBeGreaterThan(0);
          if (scope !== undefined) expect(scope.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("Redhorn's scoped conversion and unscoped stat land in different buffs", () => {
    const redhorn = weaponFor(REDHORN);
    const r1 = redhorn.passive!.refinements.find((r) => r.refinement === 1)!;
    const buffs = buffsForRefinement(redhorn.id, redhorn.passive!.name, r1);

    const unscoped = buffs.filter((b) => b.conditions === undefined);
    const scoped = buffs.filter((b) => b.conditions !== undefined);
    // The DEF% is genuinely always-on; the DEF -> DMG% conversion is not.
    expect(unscoped).toHaveLength(1);
    expect(unscoped[0]!.modifiers).toEqual([
      { stat: "defPercent", value: 0.28 },
    ]);
    expect(scoped).toHaveLength(1);
    expect(scoped[0]!.conditions?.damageTypes).toEqual(["charged", "normal"]);
    expect(scoped[0]!.conversions).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// FAIL CLOSED — bucketing and refinement
// ---------------------------------------------------------------------------

describe("only the expressible bucket becomes a Buff", () => {
  it("no non-expressible row anywhere yields a buff", () => {
    let expressible = 0;
    let skipped = 0;
    for (const [id, weapon] of generatedWeaponsById) {
      for (const row of weapon.passive?.refinements ?? []) {
        const buffs = buffsForRefinement(id, weapon.passive!.name, row);
        if (row.bucket === "expressible") {
          expressible += 1;
        } else {
          skipped += 1;
          // An always-on approximation of a conditional passive overstates it.
          expect(buffs).toEqual([]);
        }
      }
    }
    // Pins the bucketing the generator emits: 30 expressible rows across 6
    // weapons. A generator change that reclassifies rows must be a deliberate,
    // visible edit here rather than a silent shift in modelled damage.
    expect(expressible).toBe(30);
    expect(skipped).toBeGreaterThan(0);
  });

  it("exactly the six always-on weapons feed buffs into the engine", () => {
    expect([...weaponPassiveBuffsByWeaponId.keys()].sort()).toEqual([
      "festeringdesire",
      "redhornstonethresher",
      "rust",
      "thecatch",
      "thestringless",
      "whitetassel",
    ]);
  });

  it("a weapon with no expressible refinement yields no passive entry", () => {
    for (const weapon of generatedWeaponsById.values()) {
      const expressible = (weapon.passive?.refinements ?? []).some(
        (row) => row.bucket === "expressible",
      );
      if (!expressible) expect(weaponPassiveBuffs(weapon)).toBeUndefined();
    }
  });
});

describe("refinement fails closed", () => {
  it("an unstated refinement yields nothing rather than defaulting to R1", () => {
    const weaponPassive = weaponPassiveBuffsById(RUST)!;
    // No `refinement` key at all — the harvest must not reach for R1.
    expect(harvestWeaponPassiveBuffs({ weaponPassive })).toEqual([]);
  });

  it("a partly-expressible passive omits the levels that are not", () => {
    // NO GENERATED WEAPON IS THIS SHAPE TODAY: all six expressible passives are
    // expressible at all five refinements. The rule must still hold when one
    // appears, and the only way to prove it now is a hand-built row -- so this
    // is a SYNTHETIC weapon, not game data, and it is the one place in this
    // file that invents a value.
    //
    // Without it, an "R1 fallback" bug is invisible: every sweep over the real
    // data compares against a predicate that is uniformly true.
    const rust = weaponFor(RUST);
    const r1 = rust.passive!.refinements.find((r) => r.refinement === 1)!;
    const partial: GeneratedWeapon = {
      ...rust,
      id: "synthetic-partial",
      passive: {
        name: rust.passive!.name,
        refinements: [
          r1,
          {
            refinement: 2,
            text: "gated on a trigger the vocabulary cannot state",
            bucket: "unimplemented",
            modifiers: [],
            conversions: [],
            enemyModifiers: [],
          },
        ],
      },
    };

    const passive = weaponPassiveBuffs(partial);
    expect(passive).toBeDefined();
    expect(passive!.buffsByRefinement[1]).toBeDefined();
    // R2 must be ABSENT, not R1's buffs under an R2 key. An R2 owner gets
    // nothing; silently handing them R1's numbers is a wrong damage number.
    expect(passive!.buffsByRefinement[2]).toBeUndefined();
    expect(
      harvestWeaponPassiveBuffs({ refinement: 2, weaponPassive: passive! }),
    ).toEqual([]);
  });

  it("a refinement level with no expressible row is simply absent", () => {
    const weaponPassive = weaponPassiveBuffsById(RUST)!;
    for (const [id, weapon] of generatedWeaponsById) {
      const passive = weaponPassiveBuffs(weapon);
      if (!passive) continue;
      for (const level of [1, 2, 3, 4, 5] as const) {
        const row = weapon.passive!.refinements.find(
          (r) => r.refinement === level,
        );
        const present = passive.buffsByRefinement[level] !== undefined;
        expect(present, `${id} R${level}`).toBe(
          row?.bucket === "expressible" && buffsForRefinement(id, "", row).length > 0,
        );
      }
    }
    // And the five Rust levels are all present, so the sweep above is not
    // vacuously true.
    expect(Object.keys(weaponPassive.buffsByRefinement)).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// DETERMINISM
// ---------------------------------------------------------------------------

describe("the adapter is deterministic", () => {
  it("identical input yields byte-identical output", () => {
    const first = JSON.stringify(
      [...generatedWeaponsById].map(([, w]) => weaponPassiveBuffs(w) ?? null),
    );
    const second = JSON.stringify(
      [...generatedWeaponsById].map(([, w]) => weaponPassiveBuffs(w) ?? null),
    );
    expect(second).toBe(first);
  });

  it("scope keys are sorted, so grant order cannot reorder a buff id", () => {
    const redhorn = weaponFor(REDHORN);
    const r1 = redhorn.passive!.refinements.find((r) => r.refinement === 1)!;
    const buffs = buffsForRefinement(redhorn.id, redhorn.passive!.name, r1);
    const scoped = buffs.find((b) => b.conditions !== undefined)!;
    expect(scoped.conditions!.damageTypes).toEqual(["charged", "normal"]);
    expect(scoped.id).toBe("redhornstonethresher-r1-charged,normal");
  });

  it("a REVERSED scope groups and ids identically to a sorted one", () => {
    // The generator emits `damageTypes` sorted today, which makes the adapter's
    // own re-sort a no-op against real data -- so a regression that dropped it
    // would be invisible. SYNTHETIC reversed rows are the only way to hold the
    // guarantee: two grants whose scopes differ only in ORDER must land in ONE
    // buff, not two half-buffs with different ids.
    const row: GeneratedWeaponRefinement = {
      refinement: 1,
      text: "synthetic",
      bucket: "expressible",
      modifiers: [
        { stat: "dmgBonus", value: 0.1, damageTypes: ["normal", "charged"] },
        { stat: "critRate", value: 0.2, damageTypes: ["charged", "normal"] },
      ],
      conversions: [],
      enemyModifiers: [],
    };
    const buffs = buffsForRefinement("synthetic", "Synthetic", row);
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.conditions!.damageTypes).toEqual(["charged", "normal"]);
    expect(buffs[0]!.id).toBe("synthetic-r1-charged,normal");
    expect(buffs[0]!.modifiers).toHaveLength(2);
  });

  it("weapon passive buffs are permanent and worn by the wearer only", () => {
    for (const [, passive] of weaponPassiveBuffsByWeaponId) {
      for (const buffs of Object.values(passive.buffsByRefinement)) {
        for (const buff of buffs ?? []) {
          expect(buff.duration).toBe(Number.POSITIVE_INFINITY);
          expect(buff.startTime).toBe(0);
          expect(buff.stacking).toEqual({ mode: "refresh" });
          // NOT `party`: a weapon buffs its wearer, never the whole team.
          expect(buff.targets.scope).toBe("active");
        }
      }
    }
  });
});
