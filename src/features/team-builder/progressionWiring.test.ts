import { describe, expect, it } from "vitest";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import { allCharacters, findCharacter } from "@/game-data/characters/registry";
import {
  baseStatsAtLevel,
  statsAtLevel,
  talentDisplayLevel,
} from "@/features/team-builder/characterProgression";
import { TALENT_LEVELS } from "@/features/character-detail/abilityDetailModel";
import type { EnemyState, Rotation } from "@/types";

// ---------------------------------------------------------------------------
// End-to-end wiring checks for character progression.
//
// These deliberately go through `runSimulation()` — the same adapter the UI
// calls — rather than asserting on the pure model alone. A pure-model test
// passes just as happily when the model is CORRECT AND UNWIRED, which is
// exactly the state `characterProgression` was in: a well-built module no
// component imported.
// ---------------------------------------------------------------------------

const enemy = {
  level: 90,
  resistances: {
    pyro: 0.1,
    hydro: 0.1,
    electro: 0.1,
    cryo: 0.1,
    anemo: 0.1,
    geo: 0.1,
    dendro: 0.1,
    physical: 0.1,
  },
  defReduction: 0,
  currentAura: null,
} as unknown as EnemyState;

const BENNETT = "bennett";

function skillRotation(characterId: string): Rotation {
  return [{ characterId, actionType: "skill" }];
}

function bennett() {
  const character = findCharacter(BENNETT);
  if (!character) throw new Error("bennett missing from roster");
  return character;
}

describe("character level reaches the damage number", () => {
  it("resolves base stats from the curve, not the level-90 snapshot", () => {
    const kit = bennett();
    // The roster's `baseStats` is a level-90 snapshot; the curve is the truth.
    expect(baseStatsAtLevel(kit, 90)?.atk).toBe(
      toWebsiteCharacter(kit).baseStats.atk,
    );
    expect(baseStatsAtLevel(kit, 1)!.atk).toBeLessThan(
      baseStatsAtLevel(kit, 90)!.atk,
    );
  });

  it("changing level WITH its resolved stats moves damage by the stat, not just the DEF multiplier", () => {
    const kit = bennett();
    const base = toWebsiteCharacter(kit);
    const rotation = skillRotation(base.id);

    const atLevel = (level: number) =>
      runSimulation({
        team: [
          {
            ...base,
            level,
            baseStats: statsAtLevel(kit, base.baseStats, level),
          },
        ],
        rotation,
        enemy,
      }).result.totalDamage;

    const low = atLevel(1);
    const high = atLevel(90);

    // Level 1 must be dramatically weaker. The bug this guards against left
    // level-1 at ~818 damage (only the DEF multiplier moved) where the correct
    // answer is ~68 — a >10x overstatement that still LOOKED responsive.
    expect(low).toBeLessThan(high / 5);
  });

  it("writing level WITHOUT resolved stats is the bug, and is detectably different", () => {
    const kit = bennett();
    const base = toWebsiteCharacter(kit);
    const rotation = skillRotation(base.id);

    const levelOnly = runSimulation({
      team: [{ ...base, level: 1 }],
      rotation,
      enemy,
    }).result.totalDamage;

    const levelAndStats = runSimulation({
      team: [
        { ...base, level: 1, baseStats: statsAtLevel(kit, base.baseStats, 1) },
      ],
      rotation,
      enemy,
    }).result.totalDamage;

    // If these ever converge, the curve resolution stopped being applied.
    expect(levelOnly).not.toBeCloseTo(levelAndStats, 5);
    expect(levelAndStats).toBeLessThan(levelOnly);
  });
});

describe("constellation talent boosts apply exactly once", () => {
  // The engine applies the boost itself via the composed `talentLevelResolver`.
  // If the UI ALSO added it to the configured level, it would apply twice.
  it("C3 at skill 7 equals C0 at skill 10, never C0 at 13", () => {
    const base = toWebsiteCharacter(bennett());
    const rotation = skillRotation(base.id);

    const damage = (constellation: number, skill: number) =>
      runSimulation({
        team: [
          {
            ...base,
            constellation,
            talentLevels: { normal: 1, skill, burst: 1 },
          },
        ],
        rotation,
        enemy,
      }).result.totalDamage;

    const boosted = damage(3, 7);
    expect(boosted).toBe(damage(0, 10));
    // A double-apply would land on 13.
    expect(boosted).not.toBe(damage(0, 13));
    expect(boosted).toBeGreaterThan(damage(0, 7));
  });

  it("clamps at the table maximum rather than running off the end", () => {
    const base = toWebsiteCharacter(bennett());
    const rotation = skillRotation(base.id);
    const damage = (constellation: number, skill: number) =>
      runSimulation({
        team: [
          {
            ...base,
            constellation,
            talentLevels: { normal: 1, skill, burst: 1 },
          },
        ],
        rotation,
        enemy,
      }).result.totalDamage;

    expect(damage(3, 12)).toBe(damage(0, 15));
  });

  it("reports the boost for display without adding it to the saved level", () => {
    const display = talentDisplayLevel(7, 3);
    expect(display.configured).toBe(7);
    expect(display.effective).toBe(10);
    // The SAVED value must remain what the user chose.
    expect(display.configured).not.toBe(display.effective);
  });
});

describe("talent selector spans the published table", () => {
  it("offers all 15 levels, not a truncated range", () => {
    expect(TALENT_LEVELS).toHaveLength(15);
    expect(TALENT_LEVELS.at(0)).toBe(1);
    expect(TALENT_LEVELS.at(-1)).toBe(15);
  });
});

describe("constellation reaches damage across the live roster", () => {
  it("moves the number for the overwhelming majority of characters", () => {
    let moved = 0;
    let considered = 0;
    for (const character of allCharacters) {
      const base = toWebsiteCharacter(character);
      const rotation: Rotation = [
        { characterId: base.id, actionType: "skill" },
        { characterId: base.id, actionType: "normal" },
        { characterId: base.id, actionType: "burst" },
      ];
      const at = (constellation: number) =>
        runSimulation({
          team: [{ ...base, constellation }],
          rotation,
          enemy,
        }).result.totalDamage;
      considered += 1;
      if (at(0) !== at(6)) moved += 1;
    }
    // Measured: 130 of 132. The two that do not move (Aloy, Varka) carry no
    // damage-affecting perk. A collapse here means the perk channel came
    // unplugged from the website adapter.
    expect(considered).toBeGreaterThan(100);
    expect(moved).toBeGreaterThan(considered * 0.9);
  });
});

// The source-text block that stood here ("the constellation boost actually
// reaches the ability tables") has been REPLACED by real render tests, now
// that a DOM runner exists. Its own comment named the gap: "No DOM test runner
// is installed here, so the render itself is out of reach."
//
// Every property it asserted is now covered, and each replacement was
// mutation-verified before this deletion:
//   - modal passes `talentBoost` to the ability cards
//   - boosts derive from the LIVE constellation selection, not the saved value
//   - the multiplier table renders at the BOOSTED level
//   - the header summary shows the live level, not the saved prop
//   - the level SELECTOR stays bound to the configured level (no double-apply)
// See `CharacterStatsModal.dom.test.tsx` and
// `../character-detail/AbilityCard.dom.test.tsx`.
