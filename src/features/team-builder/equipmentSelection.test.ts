import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEAPON_LEVEL,
  equipWeapon,
  parseSelections,
  serializeSelections,
} from "./equipmentSelection";

const knownWeapon = (id: string) => id === "thecatch";
const knownSet = (id: string) =>
  id === "gladiators-finale" || id === "noblesse-oblige";

describe("equipment selection persistence", () => {
  it("round-trips refinement and weapon level together", () => {
    const source = equipWeapon({}, "raiden-shogun", "thecatch", 5, 20);
    const restored = parseSelections(
      serializeSelections(source),
      knownWeapon,
      knownSet,
    );

    expect(restored["raiden-shogun"]).toMatchObject({
      weaponId: "thecatch",
      refinement: 5,
      weaponLevel: 20,
    });
  });

  it("defaults legacy weapon selections to level 90", () => {
    const restored = parseSelections(
      JSON.stringify({
        version: 2,
        byCharacter: {
          "raiden-shogun": {
            weaponId: "thecatch",
            refinement: 3,
          },
        },
      }),
      knownWeapon,
      knownSet,
    );

    expect(restored["raiden-shogun"]?.weaponLevel).toBe(DEFAULT_WEAPON_LEVEL);
  });

  it("round-trips mixed five-piece artifact sets and authored stats", () => {
    const source = {
      "raiden-shogun": {
        artifactSetId: "gladiators-finale",
        artifactPieces: 2 as const,
        artifactLoadout: {
          flower: {
            slot: "flower" as const,
            setId: "gladiators-finale",
            mainStat: { stat: "atkFlat" as const, value: 311 },
            substats: [{ stat: "critRate" as const, value: 0.066 }],
          },
          plume: {
            slot: "plume" as const,
            setId: "gladiators-finale",
            mainStat: { stat: "atkFlat" as const, value: 0 },
            substats: [],
          },
          sands: {
            slot: "sands" as const,
            setId: "noblesse-oblige",
            mainStat: { stat: "energyRecharge" as const, value: 0.518 },
            substats: [],
          },
        },
      },
    };
    const restored = parseSelections(
      serializeSelections(source),
      knownWeapon,
      knownSet,
    );
    const loadout = restored["raiden-shogun"]?.artifactLoadout;

    expect(loadout?.flower?.setId).toBe("gladiators-finale");
    expect(loadout?.flower?.mainStat.value).toBe(311);
    expect(loadout?.sands?.setId).toBe("noblesse-oblige");
    expect(loadout?.sands?.mainStat.value).toBe(0.518);
  });
});
