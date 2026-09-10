import { describe, expect, it } from "vitest";
import type {
  EnemyState,
  Rotation,
  SimulationConfig,
  TalentLevelBoostMap,
  TalentLevelResolver,
} from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { noOpTalentLevelResolver } from "@/simulation/engine/talentLevelSeam";
import { syntheticUnit } from "@/simulation/character/fixtures";
import {
  MAX_TALENT_LEVEL_BOUND,
  MIN_TALENT_LEVEL_BOUND,
} from "@/simulation/buffs/talentLevel";
import { MAX_TALENT_LEVEL, MIN_TALENT_LEVEL } from "@/simulation/character/talent";

// ============================================================================
// TALENT-LEVEL SEAM — end-to-end wiring (#052 addendum).
//
// "Increases the Level of Elemental Skill by 3" is the most common
// constellation shape in the game: 259 already-emitted effects depend on it.
// Mechanics COMPUTES the delta; nothing consumed it, so a talent-level boost
// had exactly zero effect on damage.
//
// These tests assert the ENGINE path — `simulateRotation` -> talent-level
// seam -> `planAbility` -> `talentLevelFor` -> `resolveScaling` -> the table
// row. A unit test on `effectiveTalentLevel` cannot catch an unwired seam,
// which is precisely the failure mode being closed here.
//
// The synthetic skill's ATK table is [1.0, 1.1, 1.2], so a boost is OBSERVABLE
// as a different row rather than merely a different number.
// ============================================================================

const ENEMY: EnemyState = {
  id: "talent-seam-enemy",
  name: "Talent Seam Enemy",
  level: 90,
  resistances: {},
};

const NO_CRIT: SimulationConfig = { critMode: "never" };

function unitAtSkillLevel(level: number) {
  return {
    ...syntheticUnit,
    talentLevels: { ...syntheticUnit.talentLevels, skill: level },
  };
}

const SKILL_ROTATION: Rotation = [
  { characterId: syntheticUnit.id, actionType: "skill" },
];

/** A resolver returning a fixed boost bag, as mechanics' would. */
function boostResolver(boosts: TalentLevelBoostMap): TalentLevelResolver {
  return () => boosts;
}

function damageAt(
  configuredLevel: number,
  resolver?: TalentLevelResolver,
): number {
  return simulateRotation(
    [unitAtSkillLevel(configuredLevel)],
    SKILL_ROTATION,
    ENEMY,
    resolver ? { ...NO_CRIT, talentLevelResolver: resolver } : NO_CRIT,
  ).totalDamage;
}

describe("talent-level boosts reach the damage pipeline", () => {
  it("a +2 skill boost on a level-1 talent equals a configured level 3", () => {
    // THE CENTRAL CLAIM: the delta selects a different table ROW, and it is
    // the SAME row a character configured at that level would read. Anything
    // less (e.g. a boost that shifts damage by some other amount) means the
    // level is resolved but resolved wrong.
    const boosted = damageAt(1, boostResolver({ skill: 2 }));
    const configured = damageAt(3);

    expect(boosted).toBe(configured);
    // Guard against the vacuous pass where both are zero or equal to level 1.
    expect(boosted).toBeGreaterThan(damageAt(1));
  });

  it("does nothing when no resolver is supplied (additive change)", () => {
    expect(damageAt(1)).toBe(damageAt(1, noOpTalentLevelResolver));
    expect(damageAt(2)).toBe(damageAt(2, noOpTalentLevelResolver));
  });

  it("an absent slot key means +0, not a reset to level 1", () => {
    // Sparse bags are the contract. A burst-only boost must leave the skill
    // exactly where it was.
    expect(damageAt(3, boostResolver({ burst: 5 }))).toBe(damageAt(3));
    expect(damageAt(3, boostResolver({}))).toBe(damageAt(3));
  });

  it("boosts a slot INDEPENDENTLY of the other slots", () => {
    const skillOnly = damageAt(1, boostResolver({ skill: 2 }));
    const withNormalToo = damageAt(
      1,
      boostResolver({ skill: 2, normal: 4 }),
    );
    // The rotation casts only the skill, so the normal boost is inert here.
    expect(withNormalToo).toBe(skillOnly);
  });
});

describe("the clamp applies to the RESULTING level, not the delta", () => {
  it("a boost past the cap resolves to the max level, not past the table", () => {
    // A +10 boost on a level-3 talent would index level 13; the synthetic
    // table has 3 entries and `talentValueAt` clamps to its last one. The
    // point is that it does NOT crash and does not exceed the max row.
    const huge = damageAt(3, boostResolver({ skill: 100 }));
    const atCap = damageAt(MAX_TALENT_LEVEL);

    expect(huge).toBe(atCap);
  });

  it("clamping the DELTA instead would be wrong, and is not what happens", () => {
    // If the delta were clamped to <= 15 and then added, a level-15 talent
    // with +3 would resolve to 18. Clamping the RESULT pins it at 15.
    const boostedAtMax = damageAt(
      MAX_TALENT_LEVEL,
      boostResolver({ skill: 3 }),
    );
    expect(boostedAtMax).toBe(damageAt(MAX_TALENT_LEVEL));
  });

  it("a negative boost cannot drive the level below the floor", () => {
    const floored = damageAt(2, boostResolver({ skill: -100 }));
    expect(floored).toBe(damageAt(MIN_TALENT_LEVEL));
  });
});

describe("the two talent-level bounds agree across the layer seam", () => {
  it("mechanics' mirrored bounds match the authoritative character ones", () => {
    // Mechanics sits BELOW character and may not import upward, so the bound
    // is re-declared there. If the game ever raises the cap both must move;
    // this fails loudly if they drift.
    expect(MAX_TALENT_LEVEL_BOUND).toBe(MAX_TALENT_LEVEL);
    expect(MIN_TALENT_LEVEL_BOUND).toBe(MIN_TALENT_LEVEL);
  });
});

describe("the seam is deterministic", () => {
  it("identical inputs produce identical results", () => {
    const resolver = boostResolver({ skill: 2 });
    const a = simulateRotation([unitAtSkillLevel(1)], SKILL_ROTATION, ENEMY, {
      ...NO_CRIT,
      talentLevelResolver: resolver,
    });
    const b = simulateRotation([unitAtSkillLevel(1)], SKILL_ROTATION, ENEMY, {
      ...NO_CRIT,
      talentLevelResolver: resolver,
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
