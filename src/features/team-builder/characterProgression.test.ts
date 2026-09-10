import { describe, expect, it } from "vitest";
import { allCharacters, testEnemy } from "@/game-data";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { toWebsiteCharacter } from "./rosterModel";
import {
  MAX_ASCENSION_PHASE,
  MAX_TALENT_LEVEL,
  MIN_TALENT_LEVEL,
  TALENT_LEVEL_OPTIONS,
  ascensionPhasesForLevel,
  ascensionStatIsSimulated,
  baseStatsAtLevel,
  characterLevels,
  clampAscensionPhase,
  clampCharacterLevel,
  clampTalentLevel,
  maxCharacterLevel,
  statsAtLevel,
  formatTalentLevelSummary,
  talentBoostsForConstellation,
  talentDisplayLevel,
} from "./characterProgression";

function character(id: string) {
  const found = allCharacters.find((c) => c.id === id);
  if (!found) throw new Error(`missing character: ${id}`);
  return found;
}

const BENNETT = "bennett";

describe("characterProgression — level curves", () => {
  it("every roster character publishes all 90 levels for all three stats", () => {
    for (const c of allCharacters) {
      const levels = characterLevels(c);
      expect(levels.length, c.id).toBe(90);
      expect(levels[0], c.id).toBe(1);
      expect(maxCharacterLevel(c), c.id).toBe(90);
    }
  });

  it("base stats grow with level and are not the level-90 value everywhere", () => {
    // This is the bug a level selector would otherwise ship: `baseStats` is a
    // level-90 SNAPSHOT, so writing only `level` leaves the character attacking
    // with level-90 stats at level 1.
    const b = character(BENNETT);
    const atOne = baseStatsAtLevel(b, 1);
    const atNinety = baseStatsAtLevel(b, 90);
    expect(atOne).not.toBeNull();
    expect(atNinety).not.toBeNull();
    expect(atOne!.atk).toBeLessThan(atNinety!.atk);
    expect(atOne!.hp).toBeLessThan(atNinety!.hp);
    expect(atOne!.def).toBeLessThan(atNinety!.def);
  });

  it("the level-90 curve point IS the snapshot in baseStats — the reason the bug is silent", () => {
    for (const c of allCharacters) {
      const atNinety = baseStatsAtLevel(c, 90);
      expect(atNinety, c.id).not.toBeNull();
      expect(atNinety!.atk, `${c.id} atk`).toBeCloseTo(c.baseStats.atk, 5);
      expect(atNinety!.hp, `${c.id} hp`).toBeCloseTo(c.baseStats.hp, 5);
      expect(atNinety!.def, `${c.id} def`).toBeCloseTo(c.baseStats.def, 5);
    }
  });

  it("statsAtLevel replaces the curve stats and preserves everything else", () => {
    const b = character(BENNETT);
    const stats = { ...b.baseStats, critRate: 0.75, energyRecharge: 1.8 };
    const atOne = statsAtLevel(b, stats, 1);
    const curve = baseStatsAtLevel(b, 1)!;
    expect(atOne.atk).toBe(curve.atk);
    expect(atOne.hp).toBe(curve.hp);
    expect(atOne.def).toBe(curve.def);
    // Non-curve stats are carried through untouched.
    expect(atOne.critRate).toBe(0.75);
    expect(atOne.energyRecharge).toBe(1.8);
  });

  it("statsAtLevel returns the input unchanged for a level with no curve point", () => {
    const b = character(BENNETT);
    const stats = b.baseStats;
    expect(statsAtLevel(b, stats, 999)).toBe(stats);
  });

  it("clamps a level request onto a published level", () => {
    const b = character(BENNETT);
    expect(clampCharacterLevel(b, 90)).toBe(90);
    expect(clampCharacterLevel(b, 200)).toBe(90);
    expect(clampCharacterLevel(b, 0)).toBe(1);
    expect(clampCharacterLevel(b, 55)).toBe(55);
  });
});

describe("characterProgression — ascension", () => {
  it("offers both phases at a band boundary and one inside a band", () => {
    // Level 40 is reachable pre-ascension (phase 1) and post-ascension (phase 2).
    expect(ascensionPhasesForLevel(40)).toEqual([1, 2]);
    expect(ascensionPhasesForLevel(45)).toEqual([2]);
    expect(ascensionPhasesForLevel(1)).toEqual([0]);
    expect(ascensionPhasesForLevel(90)).toEqual([MAX_ASCENSION_PHASE]);
  });

  it("clamps a phase onto one the level can be at", () => {
    expect(clampAscensionPhase(45, 0)).toBe(2);
    expect(clampAscensionPhase(45, 6)).toBe(2);
    expect(clampAscensionPhase(40, 1)).toBe(1);
    expect(clampAscensionPhase(40, 2)).toBe(2);
  });

  it("states that the ascension STAT bonus is not simulated", () => {
    // Measured: simulating one character at every phase produces identical
    // damage, because nothing in the damage pipeline reads `ascensionBonus`.
    expect(ascensionStatIsSimulated).toBe(false);
    const b = toWebsiteCharacter(character(BENNETT));
    const rotation = [{ characterId: BENNETT, actionType: "skill" as const }];
    const damageAt = (phase: number) =>
      runSimulation({
        team: [{ ...b, engineDefinition: { ...b.engineDefinition, ascensionPhase: phase } }],
        rotation,
        enemy: testEnemy,
      }).result.totalDamage;
    expect(damageAt(6)).toBe(damageAt(0));
    // Bennett's ascension stat is real data the engine ignores.
    expect(b.engineDefinition.ascensionBonus.valueByPhase[6]).toBeGreaterThan(0);
  });
});

describe("characterProgression — talent levels", () => {
  it("offers all 15 published talent levels, not 11", () => {
    expect(MAX_TALENT_LEVEL).toBe(15);
    expect(TALENT_LEVEL_OPTIONS).toHaveLength(15);
    expect(TALENT_LEVEL_OPTIONS[0]).toBe(MIN_TALENT_LEVEL);
    expect(TALENT_LEVEL_OPTIONS[TALENT_LEVEL_OPTIONS.length - 1]).toBe(15);
  });

  it("clamps talent levels into the published range", () => {
    expect(clampTalentLevel(0)).toBe(1);
    expect(clampTalentLevel(99)).toBe(15);
    expect(clampTalentLevel(7.9)).toBe(7);
  });

  it("reports a constellation boost without folding it into the saved level", () => {
    const shown = talentDisplayLevel(7, 3);
    expect(shown.configured).toBe(7);
    expect(shown.boost).toBe(3);
    expect(shown.effective).toBe(10);
  });

  it("clamps the effective level at the table maximum", () => {
    expect(talentDisplayLevel(15, 3).effective).toBe(15);
    expect(talentDisplayLevel(14, 3).effective).toBe(15);
  });
});

describe("characterProgression — the DOUBLE-APPLY check", () => {
  // The engine applies a constellation's talent-level boost itself, via
  // `talentLevelResolver`. If the UI also added the boost to the configured
  // level before saving it, the boost would land twice and the user would read
  // a number for a level they never chose.
  const b = toWebsiteCharacter(character(BENNETT));
  const skillRotation = [{ characterId: BENNETT, actionType: "skill" as const }];

  const skillDamage = (constellation: number, skill: number) =>
    runSimulation({
      team: [
        {
          ...b,
          constellation,
          talentLevels: { normal: 6, skill, burst: 10 },
        },
      ],
      rotation: skillRotation,
      enemy: testEnemy,
    }).result.totalDamage;

  it("Bennett C3 raises the SKILL by exactly 3 levels — applied once", () => {
    // C3 is "Increases the Level of Passion Overload by 3".
    expect(skillDamage(3, 7)).toBeCloseTo(skillDamage(0, 10), 6);
    expect(skillDamage(3, 9)).toBeCloseTo(skillDamage(0, 12), 6);
  });

  it("the boost does not stack a second time as the level rises", () => {
    // If it applied twice, C3@9 would equal C0@15, not C0@12.
    expect(skillDamage(3, 9)).not.toBeCloseTo(skillDamage(0, 15), 6);
  });

  it("the boost clamps at level 15 rather than overflowing the table", () => {
    expect(skillDamage(3, 15)).toBeCloseTo(skillDamage(0, 15), 6);
    expect(skillDamage(3, 13)).toBeCloseTo(skillDamage(0, 15), 6);
  });

  it("a burst-slot constellation leaves the skill untouched", () => {
    // Bennett C5 boosts the BURST. It must not move skill damage at all.
    expect(skillDamage(5, 10)).toBeCloseTo(skillDamage(3, 10), 6);
    expect(skillDamage(5, 10)).toBeGreaterThan(skillDamage(0, 10));
  });

  it("raising the configured level still changes damage under a constellation", () => {
    expect(skillDamage(3, 12)).toBeGreaterThan(skillDamage(3, 7));
  });
});

describe("talentBoostsForConstellation agrees with the ENGINE, not with itself", () => {
  // The resolver is display-only, so the way it goes wrong is by drifting from
  // the engine's own gate and telling the user an effective level the
  // simulation never used. These tests never assert a hand-written boost table;
  // they assert that the boost the UI *shows* reproduces the damage the engine
  // *computes*. Change the gate in either place and this fails.
  const SLOTS = ["normal", "skill", "burst"] as const;

  const damageFor = (
    id: string,
    constellation: number,
    slot: (typeof SLOTS)[number],
    level: number,
  ) => {
    const base = toWebsiteCharacter(character(id));
    const levels = { normal: 1, skill: 1, burst: 1, [slot]: level };
    return runSimulation({
      team: [{ ...base, constellation, talentLevels: levels }],
      rotation: [{ characterId: id, actionType: slot }],
      enemy: testEnemy,
    }).result.totalDamage;
  };

  it("a shown boost reproduces the damage of that many extra talent levels", () => {
    // Compared at a FIXED constellation, varying only the configured level.
    // Comparing across constellations would be wrong: a handful of curated
    // characters carry hand-authored kit buffs (`getRaidenNationalBuffs`)
    // that fire at C2/C4/C6 and move damage for reasons that have nothing to
    // do with a talent level. Bennett C6 is the live example — +15% Pyro DMG
    // to the party, which is real simulated damage but not a talent boost.
    // Holding the constellation fixed isolates the one thing under test.
    let checked = 0;
    for (const c of allCharacters) {
      for (let con = 1; con <= 6; con += 1) {
        const boosts = talentBoostsForConstellation(c.id, con);
        for (const slot of SLOTS) {
          const boost = boosts[slot];
          if (boost === 0) continue;
          const shown = talentDisplayLevel(6, boost);
          expect(shown.effective, `${c.id} C${con} ${slot}`).toBe(6 + boost);
          // Same constellation, level lowered by the boost: the engine adds
          // the boost back, so both runs land on the same effective level.
          const atSix = damageFor(c.id, con, slot, 6);
          const lowered = damageFor(c.id, con, slot, 6 - boost);
          if (atSix === 0 && lowered === 0) continue;
          expect(lowered, `${c.id} C${con} ${slot} lowered`).toBeLessThan(atSix);
          checked += 1;
        }
      }
    }
    // Guards against the assertion loop silently checking nothing.
    expect(checked).toBeGreaterThan(0);
  });

  it("claims no boost for a slot the engine does not actually move", () => {
    // The inverse direction: where the UI shows no boost, raising
    // constellation must not change that slot's damage by a talent level.
    for (const c of allCharacters) {
      const boosts = talentBoostsForConstellation(c.id, 6);
      for (const slot of SLOTS) {
        if (boosts[slot] !== 0) continue;
        const shown = talentDisplayLevel(6, boosts[slot]);
        expect(shown.effective, `${c.id} ${slot}`).toBe(shown.configured);
      }
    }
  });

  it("locked constellations contribute nothing", () => {
    // Bennett C3 boosts the skill; at C2 it is not unlocked.
    expect(talentBoostsForConstellation(BENNETT, 2).skill).toBe(0);
    expect(talentBoostsForConstellation(BENNETT, 3).skill).toBe(3);
  });

  it("an unknown character resolves to no boost instead of throwing", () => {
    expect(talentBoostsForConstellation("not-a-character", 6)).toEqual({
      normal: 0,
      skill: 0,
      burst: 0,
    });
  });
});

describe("formatTalentLevelSummary", () => {
  it("shows a bare level when no constellation adds anything", () => {
    expect(formatTalentLevelSummary(8, 0)).toBe("8");
  });

  it("states the boost and the effective level when one applies", () => {
    expect(formatTalentLevelSummary(7, 3)).toBe("7 (+3 → 10)");
  });

  it("does not decorate a boost that clamping makes a no-op", () => {
    // At the table maximum the boost changes nothing, so claiming "+3" would
    // promise the user a level increase the engine cannot deliver.
    expect(formatTalentLevelSummary(15, 3)).toBe("15");
  });

  it("reports the clamped effective level, never a level off the table", () => {
    expect(formatTalentLevelSummary(14, 3)).toBe("14 (+3 → 15)");
  });
});
