import { describe, expect, it } from "vitest";
import type { EnemyState, Rotation } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { talentValueAt } from "@/simulation/character/talent";
import { talentTable } from "@/simulation/character/talent";

// ============================================================================
// TALENT LEVEL — end-to-end wiring
//
// Talent multipliers are per-level TABLES (levels 1..15), not scalars. The path
// is `simulateRotation` -> `planAbility` -> `talentLevelFor` -> `resolveScaling`
// -> `talentValueAt`. Every link must be live, or the whole roster silently
// simulates at one level regardless of what the data says.
//
// The project has been burned by exactly this: talent level was INERT
// roster-wide because every ability used `flatTalent()`, so `talentValueAt`'s
// core contract was exercised by 0% of the data. These tests assert the ENGINE
// path, not the lookup in isolation — a passing `talent.test.ts` did not (and
// could not) catch that.
//
// All numbers here are SYNTHETIC fixture values, not game data.
// ============================================================================

const ENEMY: EnemyState = {
  id: "talent-test-enemy",
  name: "Talent Test Enemy",
  level: 90,
  resistances: {},
};

/** Same character, different skill talent level. */
function unitAtSkillLevel(level: number) {
  return {
    ...syntheticUnit,
    talentLevels: { ...syntheticUnit.talentLevels, skill: level },
  };
}

const SKILL_ROTATION: Rotation = [
  { characterId: syntheticUnit.id, actionType: "skill" },
];

describe("talent level changes damage end to end", () => {
  it("a higher skill talent level produces strictly more damage", () => {
    // The synthetic skill's ATK table is [1.0, 1.1, 1.2] — strictly
    // increasing, so more level must mean more damage.
    const l1 = simulateRotation([unitAtSkillLevel(1)], SKILL_ROTATION, ENEMY);
    const l3 = simulateRotation([unitAtSkillLevel(3)], SKILL_ROTATION, ENEMY);

    expect(l1.totalDamage).toBeGreaterThan(0);
    expect(l3.totalDamage).toBeGreaterThan(l1.totalDamage);
  });

  it("damage scales in the exact ratio of the talent table entries", () => {
    // The skill is hybrid (ATK table + a FLAT hp term), so only the ATK part
    // moves with level. Asserting the exact expected delta rather than a bare
    // inequality is what makes this test able to detect a level that is
    // resolved but resolved WRONG (e.g. off by one, or clamped).
    const l1 = simulateRotation([unitAtSkillLevel(1)], SKILL_ROTATION, ENEMY);
    const l3 = simulateRotation([unitAtSkillLevel(3)], SKILL_ROTATION, ENEMY);

    const atk = syntheticUnit.baseStats.atk;
    const hp = syntheticUnit.baseStats.hp;
    const hpTerm = 0.05 * hp; // flat across levels
    const base1 = 1.0 * atk + hpTerm;
    const base3 = 1.2 * atk + hpTerm;

    // Every multiplier after base (DMG%, DEF, RES, crit) is identical between
    // the two runs, so the damage ratio must equal the base ratio exactly.
    expect(l3.totalDamage / l1.totalDamage).toBeCloseTo(base3 / base1, 10);
  });

  it("level 1 and level 2 differ — adjacent levels are not collapsed", () => {
    // Guards the failure mode where a table is read at a fixed index: adjacent
    // levels are the hardest case to tell apart and the easiest to lose.
    const l1 = simulateRotation([unitAtSkillLevel(1)], SKILL_ROTATION, ENEMY);
    const l2 = simulateRotation([unitAtSkillLevel(2)], SKILL_ROTATION, ENEMY);
    expect(l2.totalDamage).not.toBe(l1.totalDamage);
  });

  it("the NORMAL talent level drives normal attacks independently of skill", () => {
    // Each of the three talents levels independently. Changing `normal` must
    // move normal-attack damage and changing `skill` must not.
    const naRotation: Rotation = [
      { characterId: syntheticUnit.id, actionType: "normal" },
    ];
    const withNormal1 = {
      ...syntheticUnit,
      talentLevels: { ...syntheticUnit.talentLevels, normal: 1 },
    };
    const withNormal5 = {
      ...syntheticUnit,
      talentLevels: { ...syntheticUnit.talentLevels, normal: 5 },
    };

    const n1 = simulateRotation([withNormal1], naRotation, ENEMY);
    const n5 = simulateRotation([withNormal5], naRotation, ENEMY);

    // NA table is [0.1 .. 0.5]: level 5 is 5x level 1.
    expect(n5.totalDamage / n1.totalDamage).toBeCloseTo(5, 10);

    // Changing the SKILL level must leave normal-attack damage untouched.
    const skillBumped = {
      ...withNormal1,
      talentLevels: { ...withNormal1.talentLevels, skill: 3 },
    };
    expect(
      simulateRotation([skillBumped], naRotation, ENEMY).totalDamage,
    ).toBe(n1.totalDamage);
  });

  it("clamps beyond the end of a short table instead of producing zero", () => {
    // The skill table has 3 entries. Level 15 must clamp to the last value,
    // matching level 3 — not fall off the end and yield 0 damage.
    const l3 = simulateRotation([unitAtSkillLevel(3)], SKILL_ROTATION, ENEMY);
    const l15 = simulateRotation([unitAtSkillLevel(15)], SKILL_ROTATION, ENEMY);
    expect(l15.totalDamage).toBe(l3.totalDamage);
    expect(l15.totalDamage).toBeGreaterThan(0);
  });
});

describe("talentValueAt underpins the wiring", () => {
  it("indexes a full 1..15 table by level, not by array position", () => {
    // A real regenerated character carries a 15-entry table; level N must read
    // entry N-1.
    const table = talentTable(
      Array.from({ length: 15 }, (_, i) => (i + 1) / 100),
    );
    expect(talentValueAt(table, 1)).toBeCloseTo(0.01, 10);
    expect(talentValueAt(table, 10)).toBeCloseTo(0.1, 10);
    expect(talentValueAt(table, 15)).toBeCloseTo(0.15, 10);
  });
});
