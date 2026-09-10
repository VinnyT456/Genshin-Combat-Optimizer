import { describe, expect, it } from "vitest";
import { generatedWeapons, generatedWeaponsById } from "./generated";
import type { GeneratedWeapon } from "./generated";

// ============================================================================
// THE UNIT REGRESSION.
//
// `stat_table` in `scripts/generate-weapons/emit.py` rebuilds a substat from
// Amber's raw `initValue`, which is ALREADY the fraction the equipment stat
// model wants. An earlier revision additionally multiplied by 0.01, because a
// SEPARATE code path (`curves.observations_for`) scales that same fraction into
// the verifier's PERCENTAGE units purely in order to compare the two sources.
// Applying the comparison-only scaling to the emitted value understated every
// weapon substat by 100x: Staff of Homa's 66.2% CRIT DMG was emitted as
// 0.006616 (0.66%) instead of 0.661583.
//
// WHY NOTHING CAUGHT IT. Every structural check passed. The value was
// positive, finite, monotonically increasing across levels, and of the right
// type. It was a plausible number in the wrong unit — precisely the failure
// class ROADMAP.md §0 exists to close ("a wrong number that looks plausible is
// worse than a missing one, because nothing ever fails").
//
// A 100x unit error is invisible to bounds-checking but glaring against a
// PUBLISHED value, so these tests pin published values and the unit contract
// rather than a range.
// ============================================================================

/**
 * `EquipmentStat.value` is documented as a FRACTION for every percentage and
 * fraction-valued channel (`0.466 == +46.6%`), and raw points for flat ones.
 * These are the only two channels a generated weapon substat can land in.
 */
const FRACTIONAL_STAT_KEYS = new Set([
  "atkPercent",
  "hpPercent",
  "defPercent",
  "critRate",
  "critDmg",
  "energyRecharge",
  "dmgBonus",
  "elementalDmgBonus",
]);

/** The flat channel a weapon substat can use. Raw points, not a fraction. */
const FLAT_STAT_KEYS = new Set(["elementalMastery", "atkFlat", "hpFlat", "defFlat"]);

const MAX_LEVEL = 90;

/**
 * No real weapon substat fraction is this small at level 90.
 *
 * The weakest 1-star substats sit around +5% (0.05); the 100x bug produced
 * values around 0.0007-0.007. This threshold sits far below any real value and
 * far above every value the bug produced, so it separates the two cleanly
 * without encoding a specific weapon's number.
 */
const IMPLAUSIBLY_SMALL_FRACTION = 0.005;

/** A fraction at or above 1.0 would be a percentage NUMBER left unscaled. */
const IMPLAUSIBLY_LARGE_FRACTION = 1.5;

function atMaxLevel(table: Readonly<Record<number, number>>): number | undefined {
  return table[MAX_LEVEL];
}

describe("generated weapons — substats are FRACTIONS, not percentage numbers", () => {
  it("reproduces published level-90 substats exactly", () => {
    // Hand-checked against both sources' published level-90 values. These are
    // the assertion the 100x bug would have failed by three orders of
    // magnitude, and no bounds check would have.
    //
    // Compared at the SOURCE's own precision: both sources publish a substat
    // to one decimal as a percentage (66.2), which is three decimals as a
    // fraction (0.662). Asserting tighter than the source publishes would pin
    // curve-solver noise rather than a fact — the emitted 0.551319 is the
    // solved value behind a published 55.1%. Three decimals is still five
    // orders of magnitude tighter than the 100x bug.
    const cases: ReadonlyArray<
      readonly [id: string, stat: string, valueAtNinety: number]
    > = [
      // Published L90 CRIT DMG 66.2% — the weapon the bug was found on.
      ["staffofhoma", "critDmg", 0.662],
      // Published L90 Energy Recharge 55.1%. A SECOND channel, so the test
      // cannot be satisfied by a critDmg-only special case.
      ["engulfinglightning", "energyRecharge", 0.551],
    ];

    for (const [id, stat, expected] of cases) {
      const weapon = generatedWeaponsById.get(id);
      expect(weapon, `${id} should be emitted`).toBeDefined();
      expect(weapon?.substat?.stat).toBe(stat);
      const actual = atMaxLevel(weapon!.substat!.valueByLevel);
      expect(actual, `${id} substat at L${MAX_LEVEL}`).toBeCloseTo(expected, 3);
    }
  });

  it("emits every fractional substat in fraction units across the whole roster", () => {
    // The roster-wide form of the same claim. The bug was uniform — it hit
    // EVERY weapon — so a single-weapon assertion could be satisfied by a
    // special case. This one cannot.
    const offenders: string[] = [];

    for (const weapon of generatedWeapons) {
      const substat = weapon.substat;
      if (substat == null) continue;
      if (!FRACTIONAL_STAT_KEYS.has(substat.stat)) continue;

      const value = atMaxLevel(substat.valueByLevel);
      if (value === undefined) continue;

      if (value < IMPLAUSIBLY_SMALL_FRACTION) {
        offenders.push(
          `${weapon.id} ${substat.stat}=${value} — 100x too small; ` +
            `a percentage was scaled to a fraction twice`,
        );
      } else if (value > IMPLAUSIBLY_LARGE_FRACTION) {
        offenders.push(
          `${weapon.id} ${substat.stat}=${value} — looks like a percentage ` +
            `NUMBER (66.2) left unscaled into a fraction field`,
        );
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps flat substats in raw points, so the two unit systems stay separate", () => {
    // The mirror of the test above. Elemental Mastery is NOT a fraction, so
    // "fix" the fractional bug by scaling everything and this fails.
    const emWeapons = generatedWeapons.filter(
      (w) => w.substat != null && FLAT_STAT_KEYS.has(w.substat.stat),
    );
    expect(emWeapons.length).toBeGreaterThan(0);

    for (const weapon of emWeapons) {
      const value = atMaxLevel(weapon.substat!.valueByLevel);
      if (value === undefined) continue;
      // Real flat EM substats are tens-to-hundreds of points. A value below 1
      // means it was treated as a fraction.
      expect(value, `${weapon.id} flat substat should be raw points`).toBeGreaterThan(1);
    }
  });
});

describe("generated weapons — per-level tables are monotonic and complete", () => {
  it("never decreases as level rises", () => {
    // A curve-solving error that swapped or corrupted a row shows up here even
    // when the magnitude stays plausible.
    for (const weapon of generatedWeapons) {
      const tables: Array<readonly [string, Readonly<Record<number, number>>]> = [
        ["baseAtk", weapon.baseAtkByLevel],
      ];
      if (weapon.substat != null) {
        tables.push(["substat", weapon.substat.valueByLevel]);
      }

      for (const [label, table] of tables) {
        const levels = Object.keys(table)
          .map(Number)
          .sort((a, b) => a - b);
        let previous = Number.NEGATIVE_INFINITY;
        for (const level of levels) {
          const value = table[level]!;
          expect(
            value,
            `${weapon.id} ${label} decreased at L${level}`,
          ).toBeGreaterThanOrEqual(previous);
          previous = value;
        }
      }
    }
  });

  it("emits a base ATK for every weapon, since a weapon without one is unusable", () => {
    for (const weapon of generatedWeapons) {
      expect(
        Object.keys(weapon.baseAtkByLevel).length,
        `${weapon.id} has no base ATK table`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("generated weapons — the honesty contract", () => {
  it("emits no weapon the verifier could not confirm", () => {
    // Fail CLOSED. `build_weapon` skips a weapon Lunaris does not publish, so
    // single-source data can never reach the roster. 24 weapons are withheld
    // on exactly this rule.
    expect(generatedWeapons.length).toBeGreaterThan(0);
    for (const weapon of generatedWeapons) {
      expect(weapon.id).toMatch(/^[a-z0-9]+$/);
      expect(weapon.name.length).toBeGreaterThan(0);
    }
  });

  it("never attaches a number to an `unverified` passive", () => {
    // The bucket is the claim, and the three buckets mean DIFFERENT things:
    //
    //   expressible    numbers, and a channel to apply them through.
    //   unimplemented  numbers ARE sourced and emitted; no channel exists yet.
    //                  Carrying modifiers here is correct, not a leak — the
    //                  data is real, it simply cannot be simulated.
    //   unverified     the prose states no readable number, or the two sources
    //                  contradict each other. This bucket must be BARE.
    //
    // Only the last is a hard prohibition: a contradicted or unparseable
    // passive forfeits every structured claim. Asserting bareness for
    // `unimplemented` too would be wrong and would delete sourced data.
    for (const weapon of generatedWeapons) {
      for (const refinement of weapon.passive?.refinements ?? []) {
        if (refinement.bucket !== "unverified") continue;
        expect(
          refinement.modifiers ?? [],
          `${weapon.id} r${refinement.refinement} is unverified but carries modifiers`,
        ).toEqual([]);
      }
    }
  });

  it("keeps ids unique, so a lookup can never be ambiguous", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const weapon of generatedWeapons) {
      if (seen.has(weapon.id)) duplicates.push(weapon.id);
      seen.add(weapon.id);
    }
    expect(duplicates).toEqual([]);
    expect(generatedWeaponsById.size).toBe(generatedWeapons.length);
  });
});

// Type-level guard: the emitted shape is what the tests above assume.
const _shapeCheck: readonly GeneratedWeapon[] = generatedWeapons;
void _shapeCheck;
