import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import { syntheticUnit } from "@/simulation/character/fixtures";
import type { ArtifactLoadout } from "@/simulation/character/equipment";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { completeSetBonusBuffsById } from "@/game-data/artifacts/completeSetBonusBuffs";

const enemy = {
  id: "healing-artifact-enemy",
  name: "Healing Artifact Enemy",
  level: 90,
  resistances: {},
};

function fourPieceSet(setId: string): ArtifactLoadout {
  return {
    flower: { slot: "flower", setId, mainStat: { stat: "hpFlat", value: 1 }, substats: [] },
    plume: { slot: "plume", setId, mainStat: { stat: "atkFlat", value: 1 }, substats: [] },
    sands: { slot: "sands", setId, mainStat: { stat: "atkPercent", value: 0 }, substats: [] },
    goblet: { slot: "goblet", setId, mainStat: { stat: "dmgBonus", value: 0 }, substats: [] },
  };
}

function equipment(setId: string, kind: "oceanHuedClam" | "songOfDaysPast") {
  return {
    artifacts: fourPieceSet(setId),
    runtimeSetBonuses: [{
      setId,
      healingEffects: [{ kind }],
    }],
  } satisfies NonNullable<SimulationConfig["equipmentBuffs"]>[string];
}

describe("healing artifact runtime seam", () => {
  it("emits capped Ocean-Hued Clam damage from healing events", () => {
    const config: SimulationConfig = {
      healingEvents: [{ timestamp: 0, sourceCharacterId: syntheticUnit.id, amount: 40_000 }],
      equipmentBuffs: { [syntheticUnit.id]: equipment("clam", "oceanHuedClam") },
      critMode: "always",
    };
    const result = simulateRotation([syntheticUnit], [], enemy, config);
    const healingDamage = result.timeline.find(
      (event) => event.damage?.abilityId === "healing-derived",
    )?.damage;

    expect(healingDamage?.finalDamage).toBe(27_000);
    expect(result.totalDamage).toBe(27_000);
  });

  it("applies the equipped set's 15% healing bonus before the Clam conversion", () => {
    const config: SimulationConfig = {
      healingEvents: [{ timestamp: 0, sourceCharacterId: syntheticUnit.id, amount: 1_000 }],
      equipmentBuffs: { [syntheticUnit.id]: equipment("clam", "oceanHuedClam") },
      critMode: "never",
    };
    const result = simulateRotation([syntheticUnit], [], enemy, config);
    expect(result.timeline.find((event) => event.damage?.abilityId === "healing-derived")?.damage?.finalDamage)
      .toBe(1_035);
  });

  it("keeps generated 2pc and 4pc healing descriptors from double-counting", () => {
    const generated = completeSetBonusBuffsById("ocean-hued-clam");
    expect(generated).toBeDefined();
    const config: SimulationConfig = {
      healingEvents: [{ timestamp: 0, sourceCharacterId: syntheticUnit.id, amount: 1_000 }],
      equipmentBuffs: {
        [syntheticUnit.id]: {
          artifacts: fourPieceSet("ocean-hued-clam"),
          runtimeSetBonuses: [generated!],
        },
      },
      critMode: "never",
    };
    const result = simulateRotation([syntheticUnit], [], enemy, config);
    expect(result.timeline.find((event) => event.damage?.abilityId === "healing-derived")?.damage?.finalDamage)
      .toBe(1_035);
  });

  it("applies Song of Days Past once per eligible hit after its six-second delay", () => {
    const rotation: Rotation = [
      { characterId: syntheticUnit.id, actionType: "normal" },
    ];
    const baseline = simulateRotation([syntheticUnit], rotation, enemy, {
      critMode: "never",
    });
    const withSong = simulateRotation([syntheticUnit], rotation, enemy, {
      critMode: "never",
      healingEvents: [{ timestamp: -6, sourceCharacterId: syntheticUnit.id, amount: 1_000 }],
      equipmentBuffs: { [syntheticUnit.id]: equipment("song", "songOfDaysPast") },
    });

    expect(withSong.totalDamage).toBeGreaterThan(baseline.totalDamage);
  });
});
