import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { resolveEquippedStats } from "@/simulation/character/equipment";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";

// ============================================================================
// Equipment -> engine wiring.
//
// The engine takes gear as an already-RESOLVED stat bag
// (`SimulationConfig.equippedStats`), never as a gear description, so it stays
// ignorant of slots, sets and substats. These tests prove the seam is live and,
// crucially, that it is ADDITIVE: absent equipment reproduces prior behaviour
// exactly.
//
// Gear values here are SYNTHETIC, not game data.
// ============================================================================

const ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
  { characterId: testPyro.id, actionType: "normal" },
];

describe("equippedStats seam", () => {
  it("is inert when absent — prior behaviour is preserved exactly", () => {
    const withoutConfig = simulateRotation([testPyro], ROTATION, testEnemy);
    const withEmptyConfig = simulateRotation([testPyro], ROTATION, testEnemy, {});
    const withEmptyMap = simulateRotation([testPyro], ROTATION, testEnemy, {
      equippedStats: {},
    });

    expect(withEmptyConfig.totalDamage).toBe(withoutConfig.totalDamage);
    expect(withEmptyMap.totalDamage).toBe(withoutConfig.totalDamage);
  });

  it("a character with no entry keeps its definition stats", () => {
    const baseline = simulateRotation([testPyro], ROTATION, testEnemy);
    const otherCharacterGeared = simulateRotation(
      [testPyro],
      ROTATION,
      testEnemy,
      {
        equippedStats: {
          "some-other-character": resolveEquippedStats(testPyro.baseStats, {
            weapon: { baseAtk: 10000 },
          }).stats,
        },
      },
    );
    expect(otherCharacterGeared.totalDamage).toBe(baseline.totalDamage);
  });

  it("weapon base ATK increases damage through the pipeline", () => {
    const baseline = simulateRotation([testPyro], ROTATION, testEnemy);

    const geared = resolveEquippedStats(testPyro.baseStats, {
      weapon: { baseAtk: 600 },
    });
    const config: SimulationConfig = {
      equippedStats: { [testPyro.id]: geared.stats },
    };
    const withWeapon = simulateRotation([testPyro], ROTATION, testEnemy, config);

    // Every ability here is ATK-scaling, so damage scales with the ATK ratio.
    const ratio = geared.stats.atk / testPyro.baseStats.atk;
    expect(withWeapon.totalDamage / baseline.totalDamage).toBeCloseTo(ratio, 6);
  });

  it("an ATK% sands scales BASE ATK end to end, not final ATK", () => {
    // testPyro base ATK 1800, weapon base 600 => base 2400.
    // +46.6% ATK => 2400 * 1.466 = 3518.4
    // The on-final bug would instead give 2400 * 1.466 only if base==final;
    // the discriminating case is the FLAT term below.
    const geared = resolveEquippedStats(testPyro.baseStats, {
      weapon: { baseAtk: 600 },
      artifacts: {
        plume: {
          slot: "plume",
          setId: "synthetic",
          mainStat: { stat: "atkFlat", value: 311 },
          substats: [],
        },
        sands: {
          slot: "sands",
          setId: "synthetic",
          mainStat: { stat: "atkPercent", value: 0.466 },
          substats: [],
        },
      },
    });

    // Correct: 2400 * 1.466 + 311 = 3829.4
    // On-final: (2400 + 311) * 1.466 = 3974.3  (+3.8%)
    expect(geared.stats.atk).toBeCloseTo(3829.4, 6);

    const result = simulateRotation([testPyro], ROTATION, testEnemy, {
      equippedStats: { [testPyro.id]: geared.stats },
    });
    const baseline = simulateRotation([testPyro], ROTATION, testEnemy);
    expect(result.totalDamage / baseline.totalDamage).toBeCloseTo(
      3829.4 / 1800,
      6,
    );
  });

  it("a crit-rate circlet changes damage under expected-value crit", () => {
    // Crit is expected-value by default, so crit rate must move total damage
    // deterministically — no RNG involved.
    const geared = resolveEquippedStats(testPyro.baseStats, {
      artifacts: {
        circlet: {
          slot: "circlet",
          setId: "synthetic",
          mainStat: { stat: "critRate", value: 0.311 },
          substats: [],
        },
      },
    });
    const baseline = simulateRotation([testPyro], ROTATION, testEnemy);
    const withCrit = simulateRotation([testPyro], ROTATION, testEnemy, {
      equippedStats: { [testPyro.id]: geared.stats },
    });
    expect(withCrit.totalDamage).toBeGreaterThan(baseline.totalDamage);
  });

  it("stays deterministic with equipment applied", () => {
    const geared = resolveEquippedStats(testPyro.baseStats, {
      weapon: { baseAtk: 608, substat: { stat: "critDmg", value: 0.662 } },
      artifacts: {
        sands: {
          slot: "sands",
          setId: "synthetic",
          mainStat: { stat: "atkPercent", value: 0.466 },
          substats: [{ stat: "critRate", value: 0.1 }],
        },
      },
    });
    const config: SimulationConfig = {
      equippedStats: { [testPyro.id]: geared.stats },
    };
    const a = simulateRotation([testPyro], ROTATION, testEnemy, config);
    const b = simulateRotation([testPyro], ROTATION, testEnemy, config);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
