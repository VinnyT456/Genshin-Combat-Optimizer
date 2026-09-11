import { describe, expect, it } from "vitest";
import { allCharacters, testEnemy, testPyro } from "@/game-data";
import { generatedArtifactSets } from "@/game-data/artifacts/generated/artifactSets";
import { runSimulation } from "./simulationAdapter";
import {
  characterEquipmentBuffs,
  equipmentConfig,
  selectionIsModelled,
  weaponStatsAtLevel,
} from "./equipmentAdapter";
import type { CharacterEquipmentBuffs } from "@/simulation/engine/equipmentBuffs";
import {
  equipArtifactLoadout,
  equipArtifactSet,
  equipWeapon,
  setArtifactPieces,
} from "@/features/team-builder/equipmentSelection";
import type { ArtifactLoadout } from "@/simulation/character/equipment";

const ROTATION = [{ characterId: testPyro.id, actionType: "normal" as const }];

describe("website equipment adapter", () => {
  it("uses the authored weapon curve at exact levels, including ascension jumps", () => {
    expect(weaponStatsAtLevel("mistsplitterreforged", 20)).toEqual({
      baseAtk: 133,
      substat: { stat: "critDmg", value: 0.169583 },
    });
    expect(weaponStatsAtLevel("mistsplitterreforged", 21)?.baseAtk).toBe(169);
    expect(weaponStatsAtLevel("mistsplitterreforged", 90)?.baseAtk).toBe(674);
    expect(weaponStatsAtLevel("mistsplitterreforged", 40)?.baseAtk).toBe(261);
    expect(weaponStatsAtLevel("mistsplitterreforged", 0)).toBeUndefined();
    expect(weaponStatsAtLevel("mistsplitterreforged", 91)).toBeUndefined();
  });

  it("passes a selected refinement and set piece count into the engine seam", () => {
    const selections = setArtifactPieces(
      equipArtifactSet({}, testPyro.id, "gladiators-finale", 2),
      testPyro.id,
      2,
    );
    const fields = equipmentConfig(
      [{ id: testPyro.id, stats: testPyro.baseStats }],
      equipWeapon(selections, testPyro.id, "thecatch", 5),
    );

    expect(fields.equippedStats?.[testPyro.id]?.atk).toBeGreaterThan(
      testPyro.baseStats.atk,
    );
    const buffs = fields.equipmentBuffs?.[testPyro.id] as CharacterEquipmentBuffs | undefined;
    expect(buffs?.refinement).toBe(5);
    expect(buffs?.artifacts).toBeDefined();
    expect(Object.keys(buffs?.artifacts ?? {})).toHaveLength(2);
    expect(buffs?.setBonuses?.[0]?.twoPiece).toBeDefined();
  });

  it("uses the selected weapon level for resolved stats", () => {
    const fields = equipmentConfig(
      [{ id: testPyro.id, stats: testPyro.baseStats }],
      equipWeapon({}, testPyro.id, "thecatch", 5, 20),
    );
    expect(fields.equippedStats?.[testPyro.id]?.base?.atk).toBe(
      testPyro.baseStats.atk + 109,
    );
    expect(fields.equippedStats?.[testPyro.id]?.base?.atk).not.toBe(
      testPyro.baseStats.atk + 510,
    );
  });

  it("passes fixed artifact stats through the same resolved-stats channel", () => {
    const fields = equipmentConfig(
      [{ id: testPyro.id, stats: testPyro.baseStats }],
      equipArtifactSet({}, testPyro.id, "gladiators-finale", 1, {
        flower: {
          slot: "flower",
          setId: "gladiators-finale",
          mainStat: { stat: "atkFlat", value: 311 },
          substats: [{ stat: "critRate", value: 0.066 }],
        },
      }),
    );
    const stats = fields.equippedStats?.[testPyro.id];
    expect(stats?.atk).toBeCloseTo(testPyro.baseStats.atk + 311, 8);
    expect(stats?.critRate).toBeCloseTo(testPyro.baseStats.critRate + 0.066, 8);
  });

  it("harvests set bonuses independently for a mixed 2+2+1 loadout", () => {
    const loadout: ArtifactLoadout = {
      flower: { slot: "flower", setId: "gladiators-finale", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
      plume: { slot: "plume", setId: "gladiators-finale", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
      sands: { slot: "sands", setId: "noblesse-oblige", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
      goblet: { slot: "goblet", setId: "noblesse-oblige", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
      circlet: { slot: "circlet", setId: "wanderers-troupe", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
    };
    const selection = equipArtifactLoadout({}, testPyro.id, loadout)[testPyro.id]!;
    const entry = characterEquipmentBuffs(selection);

    expect(Object.keys(entry?.artifacts ?? {})).toHaveLength(5);
    expect(entry?.runtimeSetBonuses?.map((bonus) => bonus.setId)).toEqual([
      "gladiators-finale",
      "noblesse-oblige",
      "wanderers-troupe",
    ]);
    expect(entry?.setBonuses?.some((bonus) => bonus.setId === "gladiators-finale")).toBe(true);
    expect(entry?.setBonuses?.some((bonus) => bonus.setId === "noblesse-oblige")).toBe(true);
  });

  it("activates a modelled 2pc tier and withholds the 4pc tier at two pieces", () => {
    const selections = equipArtifactSet({}, testPyro.id, "gladiators-finale", 2);
    const entry = characterEquipmentBuffs(selections[testPyro.id]!);
    expect(entry?.setBonuses?.[0]?.twoPiece).toBeDefined();
    expect(entry?.setBonuses?.[0]?.fourPiece).toBeUndefined();
  });

  it("changes damage through the public run adapter for a modelled set", () => {
    const base = runSimulation({
      team: [testPyro],
      rotation: ROTATION,
      enemy: testEnemy,
    }).result;
    const equipped = runSimulation({
      team: [testPyro],
      rotation: ROTATION,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "gladiators-finale", 2),
    }).result;
    expect(equipped.totalDamage).toBeGreaterThan(base.totalDamage);
  });

  it("resolves a persisted weapon onto intrinsic character stats", () => {
    const base = runSimulation({
      team: [testPyro],
      rotation: ROTATION,
      enemy: testEnemy,
    }).result;
    const hydrated = runSimulation({
      team: [testPyro],
      rotation: ROTATION,
      enemy: testEnemy,
      equipment: equipWeapon({}, testPyro.id, "thecatch", 5),
    }).result;

    expect(hydrated.totalDamage).toBeGreaterThan(base.totalDamage);
  });

  it("does not apply a selected weapon twice to already-resolved stats", () => {
    const selection = equipWeapon({}, testPyro.id, "thecatch", 5);
    const first = equipmentConfig(
      [{ id: testPyro.id, stats: testPyro.baseStats }],
      selection,
    ).equippedStats![testPyro.id]!;
    const second = equipmentConfig(
      [{ id: testPyro.id, stats: first }],
      selection,
    ).equippedStats![testPyro.id]!;

    expect(second).toEqual(first);
  });

  it("fails closed for unknown weapon and artifact ids", () => {
    expect(
      characterEquipmentBuffs({
        weaponId: "missing",
        artifactSetId: "missing",
        refinement: 5,
        artifactPieces: 4,
      }),
    ).toBeUndefined();
  });

  it("recognizes runtime healing artifact effects as modelled", () => {
    expect(
      selectionIsModelled(
        equipArtifactSet({}, testPyro.id, "ocean-hued-clam", 4)[testPyro.id]!,
      ),
    ).toBe(true);
    expect(
      selectionIsModelled(
        equipArtifactSet({}, testPyro.id, "tiny-miracle", 2)[testPyro.id]!,
      ),
    ).toBe(true);
  });

  it("keeps every generated artifact set addressable by the runtime adapter", () => {
    for (const set of generatedArtifactSets) {
      const entry = characterEquipmentBuffs(
        equipArtifactSet({}, testPyro.id, set.id, 4)[testPyro.id]!,
      );
      expect(entry?.runtimeSetBonuses?.[0]?.setId, set.id).toBe(set.id);
      expect(entry?.artifacts, set.id).toBeDefined();
    }
  });

  it("keeps selections keyed by character identity when a team is reordered", () => {
    const bennett = allCharacters.find((character) => character.id === "bennett");
    expect(bennett).toBeDefined();
    const selections = equipWeapon(
      equipArtifactSet({}, testPyro.id, "gladiators-finale", 2),
      testPyro.id,
      "thecatch",
      5,
    );
    const reordered = equipmentConfig(
      [
        { id: bennett!.id, stats: bennett!.baseStats },
        { id: testPyro.id, stats: testPyro.baseStats },
      ],
      selections,
    );
    const raidenBuffs = reordered.equipmentBuffs?.[testPyro.id] as CharacterEquipmentBuffs | undefined;
    expect(raidenBuffs?.refinement).toBe(5);
    expect(reordered.equipmentBuffs?.[bennett!.id]).toBeUndefined();
  });
});
