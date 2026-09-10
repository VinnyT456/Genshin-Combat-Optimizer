import { describe, expect, it } from "vitest";
import { allCharacters, testEnemy, testPyro } from "@/game-data";
import { generatedArtifactSets } from "@/game-data/artifacts/generated/artifactSets";
import { runSimulation } from "./simulationAdapter";
import {
  characterEquipmentBuffs,
  equipmentConfig,
  selectionIsModelled,
} from "./equipmentAdapter";
import type { CharacterEquipmentBuffs } from "@/simulation/engine/equipmentBuffs";
import {
  equipArtifactSet,
  equipWeapon,
  setArtifactPieces,
} from "@/features/team-builder/equipmentSelection";

const ROTATION = [{ characterId: testPyro.id, actionType: "normal" as const }];

describe("website equipment adapter", () => {
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

    expect(fields.equippedStats?.[testPyro.id]).toBe(testPyro.baseStats);
    const buffs = fields.equipmentBuffs?.[testPyro.id] as CharacterEquipmentBuffs | undefined;
    expect(buffs?.refinement).toBe(5);
    expect(buffs?.artifacts).toBeDefined();
    expect(Object.keys(buffs?.artifacts ?? {})).toHaveLength(2);
    expect(buffs?.setBonuses?.[0]?.twoPiece).toBeDefined();
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
