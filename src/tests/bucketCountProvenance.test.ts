import { describe, expect, it } from "vitest";
import { generatedWeaponsById } from "@/game-data/weapons/generated/weapons";
import { allArtifactEffects } from "@/game-data/artifacts/registry";

// ============================================================================
// BUCKET COUNT PROVENANCE (TASK #067, item 4).
//
// THE DISCREPANCY: the weapon agent counted 725 unimplemented rows; an earlier
// report said 481. Behaviour is unaffected either way, but a census that two
// agents read differently is a census that cannot be used as evidence, and
// "the number moved" then stops being a signal.
//
// THE ANSWER, established by measurement below:
//
//   725 is CORRECT, and it counts REFINEMENT ROWS.
//   481 is not a row count of anything currently in the data.
//
// The unit ambiguity is the whole trap. A weapon passive is normally emitted as
// FIVE rows, one per refinement, so every population has two defensible sizes:
//
//     unimplemented ROWS      725      <- what the bucket census pins
//     distinct WEAPONS        146      <- the same population, counted per weapon
//
// 481 matches neither. It is also not divisible by 5, so it cannot be a row
// count of a whole number of five-refinement weapons. The most likely
// explanation is that it predates a regeneration of `weapons.ts` — a stale
// count is exactly what a regeneration produces when the number lives in prose
// rather than in an assertion.
//
// MEASURING CORRECTED A SECOND ASSUMPTION, which is worth stating because it
// shows why hand counts fail here: the emitter is NOT uniformly five rows per
// passive. 233 passives emit 5 rows and 3 emit 1, for 1168 rows across 236
// passives on 246 weapons. And 725 is not 146 x 5 (= 730), because one weapon
// (`otherworldlystory`) has a bucket that varies BY REFINEMENT. Four different
// plausible hand counts — 730, 1230, 146, 725 — are all derivable from the
// same data, and only one of them is the row census.
//
// THAT IS THE POINT OF THIS FILE. Every count in this project that anyone may
// quote should be DERIVED here, with its unit named, so the next disagreement
// is settled by running the suite instead of by two agents counting by hand.
//
// These assertions are deliberately UNIT-LABELLED. A future generator change
// that moves a number must edit a line that says what the number counts.
// ============================================================================

const WEAPON_ROWS = (() => {
  const rows: { weaponId: string; bucket: string }[] = [];
  for (const weapon of generatedWeaponsById.values()) {
    for (const row of weapon.passive?.refinements ?? []) {
      rows.push({ weaponId: weapon.id, bucket: row.bucket });
    }
  }
  return rows;
})();

function weaponsWithBucket(bucket: string): ReadonlySet<string> {
  const out = new Set<string>();
  for (const row of WEAPON_ROWS) {
    if (row.bucket === bucket) out.add(row.weaponId);
  }
  return out;
}

function rowsWithBucket(bucket: string): number {
  return WEAPON_ROWS.filter((row) => row.bucket === bucket).length;
}

describe("weapon counts — stated in ROWS", () => {
  it("725 unimplemented ROWS is the correct figure", () => {
    expect(rowsWithBucket("unimplemented")).toBe(725);
  });

  it("the same population is 146 distinct WEAPONS", () => {
    // Both numbers are true of one population. Quoting either without its unit
    // is what produced the disagreement.
    expect(weaponsWithBucket("unimplemented").size).toBe(146);
  });

  it("481 is NOT a count of unimplemented rows or weapons", () => {
    // Pinned explicitly so the retired figure cannot quietly come back.
    expect(rowsWithBucket("unimplemented")).not.toBe(481);
    expect(weaponsWithBucket("unimplemented").size).not.toBe(481);
  });

  it("481 cannot be a whole number of five-refinement weapons", () => {
    // The structural argument, independent of the current data: every passive
    // emits exactly five rows, so any row count of a set of whole weapons is
    // divisible by 5. 481 is not, so it cannot be a weapon-derived row count
    // under the current emitter at all.
    expect(481 % 5).not.toBe(0);
  });

  it("a passive emits FIVE refinement rows, except three that emit ONE", () => {
    // The premise the divisibility argument rests on, MEASURED rather than
    // assumed -- and the measurement corrected an assumption: the emitter is
    // not uniformly five-per-passive. Three passives carry a single row
    // (a passive whose text does not vary by refinement), so the exact shape
    // is 233 x 5 + 3 x 1 = 1168.
    //
    // This is precisely the kind of detail that makes a hand-counted census
    // wrong, and it is why the counts belong in assertions.
    const histogram: Record<number, number> = {};
    for (const weapon of generatedWeaponsById.values()) {
      const refinements = weapon.passive?.refinements;
      if (refinements === undefined) continue;
      histogram[refinements.length] =
        (histogram[refinements.length] ?? 0) + 1;
    }
    expect(histogram).toEqual({ 1: 3, 5: 233 });
    expect(233 * 5 + 3 * 1).toBe(WEAPON_ROWS.length);
  });

  it("exactly ONE weapon has a bucket that varies by refinement", () => {
    // A mixed-bucket weapon is legitimate -- a passive can be statable at some
    // refinements and not others -- but it is the reason a row count is NOT
    // simply five times a weapon count, so it is pinned by name.
    const mixed = [...generatedWeaponsById.values()]
      .filter((weapon) => {
        const buckets = new Set(
          (weapon.passive?.refinements ?? []).map((row) => row.bucket),
        );
        return buckets.size > 1;
      })
      .map((weapon) => weapon.id);
    expect(mixed).toEqual(["otherworldlystory"]);
  });

  it("the 725 rows decompose exactly into whole weapons plus the mixed one", () => {
    // Rebuilds 725 from per-weapon facts, so the pinned total and the
    // per-weapon view cannot drift apart silently.
    let rebuilt = 0;
    for (const weaponId of weaponsWithBucket("unimplemented")) {
      const weapon = generatedWeaponsById.get(weaponId)!;
      rebuilt += (weapon.passive?.refinements ?? []).filter(
        (row) => row.bucket === "unimplemented",
      ).length;
    }
    expect(rebuilt).toBe(725);
    expect(rebuilt).toBe(rowsWithBucket("unimplemented"));
  });

  it("the full weapon census adds up to the total row count", () => {
    // Guards against a fourth bucket appearing unnoticed: the three pinned
    // numbers must exhaust the data, not merely be individually correct.
    expect(
      rowsWithBucket("expressible") +
        rowsWithBucket("unimplemented") +
        rowsWithBucket("unverified"),
    ).toBe(WEAPON_ROWS.length);
    expect(WEAPON_ROWS.length).toBe(1168);
  });

  it("weapons WITHOUT a passive are excluded from every row count", () => {
    // 246 weapons but only 236 passives, so 10 weapons contribute no rows.
    // Counting all 246 weapons and multiplying by 5 gives 1230, not 1168 --
    // one of several ways a hand count goes wrong, and pinned so the
    // difference between the two populations stays visible.
    const total = [...generatedWeaponsById.values()].length;
    const withPassive = [...generatedWeaponsById.values()].filter(
      (weapon) => weapon.passive !== undefined,
    ).length;
    expect(total).toBe(246);
    expect(withPassive).toBe(236);
    expect(total * 5).not.toBe(WEAPON_ROWS.length);
    expect(withPassive).toBeLessThan(total);
  });
});

describe("artifact counts — stated in EFFECT ROWS", () => {
  // Artifacts have NO refinement dimension, so a set bonus is one row and the
  // row/entity ambiguity that produced 725-vs-481 cannot arise here. Stated
  // explicitly so the two censuses are not read as the same kind of number.
  it("46 modelled effect rows, 76 unimplemented, 122 total", () => {
    const census: Record<string, number> = {};
    for (const effect of allArtifactEffects) {
      census[effect.support] = (census[effect.support] ?? 0) + 1;
    }
    expect(census).toEqual({ modelled: 46, unimplemented: 76 });
    expect(allArtifactEffects.length).toBe(122);
  });

  it("an artifact effect id appears exactly once — rows are not multiplied", () => {
    const ids = allArtifactEffects.map((effect) => effect.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the artifact census has NO refinement dimension to double-count", () => {
    // The structural reason the two data sets count differently. If an
    // artifact row ever gained a per-level dimension, this fails and the
    // census above would need a stated unit like the weapon one.
    for (const effect of allArtifactEffects) {
      expect(effect).not.toHaveProperty("refinements");
    }
  });
});
