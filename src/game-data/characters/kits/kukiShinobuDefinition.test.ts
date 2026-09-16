import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { testEnemy } from "@/game-data";
import {
  KUKI_SHINOBU_KIT_METADATA,
  createKukiShinobuDefinition,
} from "./kukiShinobuDefinition";

function snapshotFor(
  character: ReturnType<typeof createKukiShinobuDefinition>,
  currentHp = character.baseStats.hp,
): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
    maxHp: character.baseStats.hp,
    currentHp,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function damage(character: ReturnType<typeof createKukiShinobuDefinition>, actionType: "skill" | "burst", resumeFrom?: SimulationSnapshot): number {
  return simulateRotation([character], [{ characterId: character.id, actionType }], testEnemy, {
    critMode: "never",
    ...(resumeFrom ? { resumeFrom } : {}),
  }).totalDamage;
}

describe("Kuki Shinobu runtime kit", () => {
  it("executes the sourced skill and burst damage rows", () => {
    const character = createKukiShinobuDefinition();

    expect(damage(character, "skill")).toBeGreaterThan(0);
    expect(damage(character, "burst", snapshotFor(character))).toBeGreaterThan(0);
  });

  it("applies Heart's Repose EM scaling only to Sanctifying Ring damage", () => {
    const base = createKukiShinobuDefinition(0, undefined, {
      baseStats: { ...createKukiShinobuDefinition().baseStats, elementalMastery: 0 },
    });
    const highEm = createKukiShinobuDefinition(0, undefined, {
      baseStats: { ...base.baseStats, elementalMastery: 200 },
    });

    expect(damage(highEm, "skill")).toBeGreaterThan(damage(base, "skill"));
    expect(damage(highEm, "burst", snapshotFor(highEm))).toBe(damage(base, "burst", snapshotFor(base)));
    expect(KUKI_SHINOBU_KIT_METADATA.heartsReposeEmRatio).toBe(0.0025);
  });

  it("applies C6's 150 EM bonus only below 25% HP", () => {
    const c0 = createKukiShinobuDefinition(0);
    const c6 = createKukiShinobuDefinition(6);
    const lowHp = c6.baseStats.hp * 0.2;

    expect(damage(c6, "skill", snapshotFor(c6, lowHp))).toBeGreaterThan(
      damage(c0, "skill", snapshotFor(c0, lowHp)),
    );
    expect(KUKI_SHINOBU_KIT_METADATA.c6LowHpElementalMastery).toBe(150);
  });

  it("retains the generated C3 skill and C5 burst talent boosts", () => {
    const c0 = createKukiShinobuDefinition(0);
    const c3 = createKukiShinobuDefinition(3);
    const c5 = createKukiShinobuDefinition(5);

    expect(damage(c3, "skill")).toBeGreaterThan(damage(c0, "skill"));
    expect(damage(c5, "burst", snapshotFor(c5))).toBeGreaterThan(
      damage(c0, "burst", snapshotFor(c0)),
    );
  });
});
