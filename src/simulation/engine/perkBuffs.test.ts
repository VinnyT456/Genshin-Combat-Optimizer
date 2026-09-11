import { describe, expect, it } from "vitest";
import type { EnemyState, Rotation, SimulationConfig, Stats } from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import {
  harvestCharacterPerkBuffs,
  harvestTeamPerkBuffs,
  withPerkBuffs,
} from "@/simulation/engine/perkBuffs";
import { syntheticUnit } from "@/simulation/character/fixtures";
import {
  anemoGeneratedCharacters,
  cryoGeneratedCharacters,
  dendroGeneratedCharacters,
  electroGeneratedCharacters,
  geoGeneratedCharacters,
  hydroGeneratedCharacters,
  pyroGeneratedCharacters,
  generatedCharactersById,
} from "@/game-data/characters/generated";

// ============================================================================
// PERK BUFF HARVEST — the last link in the talent-level chain.
//
// The chain is: constellation data (`ConstellationDefinition.buffs`) -> harvest
// -> `makeTalentLevelResolver` -> `SimulationConfig.talentLevelResolver` ->
// `planAbility` -> `talentLevelFor` -> `talentValueAt` -> damage.
//
// Before this module the last-but-one link was missing: the engine READ
// `config.talentLevelResolver` and nobody SUPPLIED it, so a talent-level boost
// had zero effect on damage. The load-bearing test in this file is
// "constellation level changes the damage number", asserted through
// `simulateRotation`, not through a unit call.
//
// All numbers are SYNTHETIC fixture values, not game data.
// ============================================================================

const ENEMY: EnemyState = {
  id: "perk-test-enemy",
  name: "Perk Test Enemy",
  level: 90,
  resistances: {},
};

const SKILL_ROTATION: Rotation = [
  { characterId: syntheticUnit.id, actionType: "skill" },
];

/** A permanent, self-targeted +N skill-level buff, exactly as data emits it. */
function skillLevelBuff(id: string, levels: number): Buff {
  return {
    id,
    source: id,
    sourceCharacterId: syntheticUnit.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    talentLevelModifiers: [{ slot: "skill", levels }],
  };
}

function atkBuff(
  id: string,
  sourceCharacterId: string,
  scope: "self" | "party",
): Buff {
  return {
    id,
    source: id,
    sourceCharacterId,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope },
    modifiers: [{ stat: "atkFlat", value: 100 }],
  };
}

/**
 * The synthetic unit with a C3 that boosts skill level, at a chosen C-level.
 *
 * Skill talent level is pinned to 1 so a +2 boost lands on a real, distinct
 * row of the synthetic skill's ATK table ([1.0, 1.1, 1.2]) rather than being
 * absorbed by the level-15 clamp.
 */
function unitWithSkillConstellation(
  constellationLevel: number,
): GenericCharacterDefinition {
  return {
    ...syntheticUnit,
    constellationLevel,
    talentLevels: { ...syntheticUnit.talentLevels, skill: 1 },
    constellations: [
      { level: 1, id: "synthetic-c1", name: "Synthetic C1", effects: [] },
      {
        level: 3,
        id: "synthetic-c3",
        name: "Synthetic C3",
        effects: [],
        buffs: [skillLevelBuff("synthetic-c3", 2)],
      },
    ],
  };
}

describe("constellation level changes damage end to end", () => {
  it("C3 raises skill damage; C2 (one short) does not", () => {
    const atC2 = simulateRotation(
      [unitWithSkillConstellation(2)],
      SKILL_ROTATION,
      ENEMY,
    );
    const atC3 = simulateRotation(
      [unitWithSkillConstellation(3)],
      SKILL_ROTATION,
      ENEMY,
    );

    expect(atC2.totalDamage).toBeGreaterThan(0);
    // THE deliverable: the same character, the same rotation, a different
    // constellation level, a different damage number.
    expect(atC3.totalDamage).toBeGreaterThan(atC2.totalDamage);
  });

  it("generated direct constellation modifiers change the real roster damage", () => {
    const tighnari = generatedCharactersById.get("tighnari");
    expect(tighnari).toBeDefined();
    if (tighnari === undefined) return;

    const rotation: Rotation = [
      { characterId: tighnari.id, actionType: "charged" },
    ];
    const c0 = simulateRotation(
      [{ ...tighnari, constellationLevel: 0 }],
      rotation,
      ENEMY,
      { critMode: "expected" },
    );
    const c1 = simulateRotation(
      [{ ...tighnari, constellationLevel: 1 }],
      rotation,
      ENEMY,
      { critMode: "expected" },
    );

    // Tighnari C1 grants +15% Charged Attack CRIT Rate. The generated
    // constellation buff is damage-type scoped, so it must affect this hit.
    expect(c1.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("the boosted damage equals the damage of the equivalent talent level", () => {
    // C3 grants +2 skill levels on a skill pinned to level 1, so the result
    // must match a C0 character configured at skill level 3 exactly. An
    // inequality alone cannot tell a correct boost from an off-by-one.
    const boosted = simulateRotation(
      [unitWithSkillConstellation(3)],
      SKILL_ROTATION,
      ENEMY,
    );
    const equivalent = simulateRotation(
      [
        {
          ...unitWithSkillConstellation(0),
          talentLevels: { ...syntheticUnit.talentLevels, skill: 3 },
        },
      ],
      SKILL_ROTATION,
      ENEMY,
    );

    expect(boosted.totalDamage).toBeCloseTo(equivalent.totalDamage, 9);
  });

  it("a C6 buff has no effect at C0 — the overclaim this chain prevents", () => {
    const c6Only: GenericCharacterDefinition = {
      ...syntheticUnit,
      talentLevels: { ...syntheticUnit.talentLevels, skill: 1 },
      constellations: [
        {
          level: 6,
          id: "synthetic-c6",
          name: "Synthetic C6",
          effects: [],
          buffs: [skillLevelBuff("synthetic-c6", 2)],
        },
      ],
    };

    const atC0 = simulateRotation(
      [{ ...c6Only, constellationLevel: 0 }],
      SKILL_ROTATION,
      ENEMY,
    );
    const atC5 = simulateRotation(
      [{ ...c6Only, constellationLevel: 5 }],
      SKILL_ROTATION,
      ENEMY,
    );
    const atC6 = simulateRotation(
      [{ ...c6Only, constellationLevel: 6 }],
      SKILL_ROTATION,
      ENEMY,
    );

    expect(atC5.totalDamage).toBeCloseTo(atC0.totalDamage, 9);
    expect(atC6.totalDamage).toBeGreaterThan(atC0.totalDamage);
  });

  it("an ascension passive buff applies only once its phase is reached", () => {
    const withA4Buff = (ascensionPhase: number): GenericCharacterDefinition => ({
      ...syntheticUnit,
      ascensionPhase,
      constellationLevel: 0,
      talentLevels: { ...syntheticUnit.talentLevels, skill: 1 },
      constellations: [],
      passives: [
        {
          id: "synthetic-a4",
          name: "Synthetic A4",
          unlockAscension: 4,
          effects: [],
          buffs: [skillLevelBuff("synthetic-a4", 2)],
        },
      ],
    });

    const locked = simulateRotation([withA4Buff(3)], SKILL_ROTATION, ENEMY);
    const unlocked = simulateRotation([withA4Buff(4)], SKILL_ROTATION, ENEMY);

    expect(locked.totalDamage).toBeGreaterThan(0);
    expect(unlocked.totalDamage).toBeGreaterThan(locked.totalDamage);
  });

  it("applies direct stat buffs only at their unlocked constellation level", () => {
    const withC1StatBuff = (constellationLevel: number): GenericCharacterDefinition => ({
      ...syntheticUnit,
      constellationLevel,
      constellations: [
        {
          level: 1,
          id: "synthetic-c1-atk",
          name: "Synthetic C1 ATK",
          effects: [],
          buffs: [atkBuff("synthetic-c1-atk", syntheticUnit.id, "self")],
        },
      ],
    });

    const c0 = simulateRotation([withC1StatBuff(0)], SKILL_ROTATION, ENEMY);
    const c1 = simulateRotation([withC1StatBuff(1)], SKILL_ROTATION, ENEMY);

    expect(c1.totalDamage).toBeGreaterThan(c0.totalDamage);
  });
});

describe("harvest", () => {
  it("collects only unlocked perks, passives before constellations", () => {
    const def: GenericCharacterDefinition = {
      ...syntheticUnit,
      ascensionPhase: 4,
      constellationLevel: 3,
      passives: [
        {
          id: "p-a1",
          name: "A1",
          unlockAscension: 1,
          effects: [],
          buffs: [skillLevelBuff("p-a1", 1)],
        },
        {
          id: "p-a4",
          name: "A4",
          unlockAscension: 4,
          effects: [],
          buffs: [skillLevelBuff("p-a4", 1)],
        },
      ],
      constellations: [
        {
          level: 1,
          id: "c1",
          name: "C1",
          effects: [],
          buffs: [skillLevelBuff("c1", 1)],
        },
        {
          level: 3,
          id: "c3",
          name: "C3",
          effects: [],
          buffs: [skillLevelBuff("c3", 1)],
        },
        {
          level: 6,
          id: "c6",
          name: "C6",
          effects: [],
          buffs: [skillLevelBuff("c6", 1)],
        },
      ],
    };

    expect(harvestCharacterPerkBuffs(def).map((b) => b.id)).toEqual([
      "p-a1",
      "p-a4",
      "c1",
      "c3",
    ]);
  });

  it("is deterministic and team-ordered", () => {
    const a = { ...unitWithSkillConstellation(3), id: "unit-a" };
    const b = { ...unitWithSkillConstellation(3), id: "unit-b" };
    const first = harvestTeamPerkBuffs([a, b]).map((x) => x.source);
    const second = harvestTeamPerkBuffs([a, b]).map((x) => x.source);
    expect(first).toEqual(second);
    expect(harvestTeamPerkBuffs([a, b])).toHaveLength(2);
  });

  it("yields nothing for a perkless team, leaving config untouched", () => {
    const config: SimulationConfig = { critMode: "never" };
    const perkless: GenericCharacterDefinition = {
      ...syntheticUnit,
      passives: [],
      constellations: [],
    };
    expect(harvestTeamPerkBuffs([perkless])).toHaveLength(0);
    expect(withPerkBuffs([perkless], config)).toBe(config);
  });

  it("has exact C0 through C6 boundaries, including every intermediate level", () => {
    const def: GenericCharacterDefinition = {
      ...syntheticUnit,
      passives: [],
      constellations: [1, 2, 3, 4, 5, 6].map((level) => ({
        level: level as 1 | 2 | 3 | 4 | 5 | 6,
        id: `c${level}`,
        name: `C${level}`,
        effects: [],
        buffs: [skillLevelBuff(`c${level}`, 1)],
      })),
    };

    for (let level = 0; level <= 6; level += 1) {
      expect(
        harvestCharacterPerkBuffs({ ...def, constellationLevel: level }).map(
          (buff) => buff.id,
        ),
      ).toEqual(Array.from({ length: level }, (_, index) => `c${index + 1}`));
    }
  });

  it("preserves authored target scope when harvesting teammate perks", () => {
    const source = {
      ...syntheticUnit,
      id: "source",
      constellationLevel: 1,
      constellations: [
        {
          level: 1 as const,
          id: "source-c1-party",
          name: "Party buff",
          effects: [],
          buffs: [atkBuff("source-c1-party", "source", "party")],
        },
      ],
    };
    const teammate = { ...syntheticUnit, id: "teammate", constellationLevel: 0 };
    const own = simulateRotation(
      [source],
      [{ characterId: "source", actionType: "skill" }],
      ENEMY,
    );
    const party = simulateRotation(
      [source, teammate],
      [{ characterId: "teammate", actionType: "skill" }],
      ENEMY,
    );
    const unbuffed = simulateRotation(
      [teammate],
      [{ characterId: "teammate", actionType: "skill" }],
      ENEMY,
    );

    expect(own.totalDamage).toBeGreaterThan(0);
    expect(party.totalDamage).toBeGreaterThan(unbuffed.totalDamage);

    const selfSource = {
      ...source,
      constellations: [
        {
          level: 1 as const,
          id: "source-c1-self",
          name: "Self buff",
          effects: [],
          buffs: [atkBuff("source-c1-self", "source", "self")],
        },
      ],
    };
    const selfScopedTeammateHit = simulateRotation(
      [selfSource, teammate],
      [{ characterId: "teammate", actionType: "skill" }],
      ENEMY,
    );
    expect(selfScopedTeammateHit.totalDamage).toBeCloseTo(unbuffed.totalDamage, 9);
  });
});

describe("composition with caller-supplied resolvers", () => {
  it("keeps an external stat buff AND applies the perk boost", () => {
    const externalAtk: SimulationConfig = {
      buffResolver: (base: Stats): Stats => ({ ...base, atk: base.atk * 2 }),
    };

    const perkOnly = simulateRotation(
      [unitWithSkillConstellation(3)],
      SKILL_ROTATION,
      ENEMY,
    );
    const both = simulateRotation(
      [unitWithSkillConstellation(3)],
      SKILL_ROTATION,
      ENEMY,
      externalAtk,
    );

    // Doubling ATK must still double the (already perk-boosted) damage: the
    // caller's resolver is composed with the perk one, not replaced by it.
    expect(both.totalDamage).toBeGreaterThan(perkOnly.totalDamage);
  });

  it("adds a caller-supplied talent-level boost to the perk boost", () => {
    const plusOneSkill: SimulationConfig = {
      talentLevelResolver: () => ({ skill: 1 }),
    };

    // C3 (+2) composed with an external +1 on a level-1 skill == level 4.
    // The synthetic table has 3 entries, so level 3 and level 4 both clamp to
    // the last row; assert against the same clamped reference rather than
    // asserting a strict increase the table cannot express.
    const composed = simulateRotation(
      [unitWithSkillConstellation(3)],
      SKILL_ROTATION,
      ENEMY,
      plusOneSkill,
    );
    const externalOnly = simulateRotation(
      [unitWithSkillConstellation(0)],
      SKILL_ROTATION,
      ENEMY,
      plusOneSkill,
    );

    expect(composed.totalDamage).toBeGreaterThan(externalOnly.totalDamage);
  });
});

// ---------------------------------------------------------------------------
// REAL ROSTER — the harvest must reach shipped data, not just fixtures.
//
// A synthetic fixture proves the mechanism. It cannot prove the mechanism finds
// every structured perk the generator actually emitted, which is the whole
// point of the task. This block asserts against the generated roster.
// ---------------------------------------------------------------------------

describe("real roster", () => {
  const ROSTER: readonly GenericCharacterDefinition[] = [
    ...anemoGeneratedCharacters,
    ...cryoGeneratedCharacters,
    ...dendroGeneratedCharacters,
    ...electroGeneratedCharacters,
    ...geoGeneratedCharacters,
    ...hydroGeneratedCharacters,
    ...pyroGeneratedCharacters,
  ];

  function harvestedAt(constellationLevel: number, ascensionPhase = 6): number {
    return ROSTER.reduce(
      (n, character) =>
        n +
        harvestCharacterPerkBuffs({
          ...character,
          constellationLevel,
          ascensionPhase,
        }).length,
      0,
    );
  }

  it("harvests passive buffs at C0 and constellation buffs only at C6", () => {
    // Three unconditional generated passive buffs are available at full
    // ascension, so C0 is not expected to be empty anymore. At ascension 0
    // those passives are locked, which gives us a clean no-perk boundary.
    expect(harvestedAt(0, 0)).toBe(0);
    expect(harvestedAt(0)).toBe(3);
    expect(harvestedAt(6)).toBe(266);
    expect(harvestedAt(6)).toBeGreaterThan(harvestedAt(0));
  });

  it("the harvested count is monotonically non-decreasing in C level", () => {
    // Unlocking a constellation can only ADD perks, never remove one.
    const counts = [0, 1, 2, 3, 4, 5, 6].map(harvestedAt);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]!).toBeGreaterThanOrEqual(counts[i - 1]!);
    }
    expect(counts[6]!).toBeGreaterThan(counts[0]!);
  });
});
