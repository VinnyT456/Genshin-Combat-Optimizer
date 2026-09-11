import { describe, expect, it } from "vitest";
import { allCharacters } from "@/game-data";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { harvestCharacterPerkBuffs } from "@/simulation/engine/perkBuffs";
import { generatedCharactersById } from "@/game-data/characters/generated";
import {
  getRaidenNationalBuffs,
} from "@/game-data/characters/kits/raidenNationalKit";
import { testEnemy } from "@/game-data";

const raidenDefinition = generatedCharactersById.get("raiden-shogun");
const raidenRoster = allCharacters.find((character) => character.id === "raiden-shogun");
const bennettRoster = allCharacters.find((character) => character.id === "bennett");

function requireRaiden() {
  if (raidenDefinition === undefined || raidenRoster === undefined || bennettRoster === undefined) {
    throw new Error("generated Raiden/Bennett roster entries are required for QA fixtures");
  }
  return {
    definition: raidenDefinition,
    website: toWebsiteCharacter(raidenRoster),
    bennett: toWebsiteCharacter(bennettRoster),
  };
}

describe("Raiden Shogun C0-C6 gameplay coverage", () => {
  it("keeps the generated six-level row and records exactly the executable C3/C5 channels", () => {
    const { definition } = requireRaiden();

    expect(definition.constellations?.map((constellation) => constellation.level)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);

    const buffsByLevel = new Map(
      definition.constellations?.map((constellation) => [
        constellation.level,
        constellation.buffs ?? [],
      ]),
    );
    expect(buffsByLevel.get(1)).toEqual([]);
    expect(buffsByLevel.get(2)).toEqual([]);
    expect(buffsByLevel.get(3)?.map((buff) => buff.id)).toEqual(["raiden-shogun-c3"]);
    expect(buffsByLevel.get(4)).toEqual([]);
    expect(buffsByLevel.get(5)?.map((buff) => buff.id)).toEqual(["raiden-shogun-c5"]);
    expect(buffsByLevel.get(6)).toEqual([]);
  });

  it("harvests C3/C5 only at their unlock levels and never leaks them at C0", () => {
    const { definition } = requireRaiden();
    const idsAt = (constellationLevel: number) =>
      harvestCharacterPerkBuffs({ ...definition, constellationLevel }).map((buff) => buff.id);

    expect(idsAt(0)).toEqual([]);
    expect(idsAt(1)).toEqual([]);
    expect(idsAt(2)).toEqual([]);
    expect(idsAt(3)).toEqual(["raiden-shogun-c3"]);
    expect(idsAt(4)).toEqual(["raiden-shogun-c3"]);
    expect(idsAt(5)).toEqual(["raiden-shogun-c3", "raiden-shogun-c5"]);
    expect(idsAt(6)).toEqual(["raiden-shogun-c3", "raiden-shogun-c5"]);
  });

  it("raises skill damage in a real adapter sequence at C5 while C0 remains the baseline", () => {
    const { website } = requireRaiden();
    const rotation = [
      { characterId: website.id, actionType: "skill" as const },
      { characterId: website.id, actionType: "normal" as const },
      { characterId: website.id, actionType: "normal" as const },
    ];

    const c0 = runSimulation({
      team: [{ ...website, constellation: 0 }],
      rotation,
      enemy: testEnemy,
      config: { critMode: "never" },
    }).result;
    const c5 = runSimulation({
      team: [{ ...website, constellation: 5 }],
      rotation,
      enemy: testEnemy,
      config: { critMode: "never" },
    }).result;

    expect(c0.errors).toEqual([]);
    expect(c5.errors).toEqual([]);
    expect(c5.damageByAbility[`${website.id}-skill`]).toBeGreaterThan(
      c0.damageByAbility[`${website.id}-skill`] ?? 0,
    );
  });

  it("keeps legacy C2 support and refuses a permanent C4 approximation", () => {
    const { website, bennett } = requireRaiden();
    const c0Buffs = getRaidenNationalBuffs([{ ...website, constellation: 0 }]);
    const c2Buffs = getRaidenNationalBuffs([{ ...website, constellation: 2 }]);
    const c4Buffs = getRaidenNationalBuffs([{ ...website, constellation: 4 }]);

    expect(c0Buffs.some((buff) => buff.id === "raiden-c2-def-ignore")).toBe(false);
    expect(c2Buffs.find((buff) => buff.id === "raiden-c2-def-ignore")?.enemyModifiers).toEqual([
      { key: "defIgnore", value: 0.6 },
    ]);
    expect(c4Buffs.some((buff) => buff.id === "raiden-c4-atk-bonus")).toBe(false);

    const rotation = [{ characterId: bennett.id, actionType: "skill" as const }];
    const c0 = runSimulation({
      team: [{ ...website, constellation: 0 }, bennett],
      rotation,
      enemy: testEnemy,
      config: { critMode: "never" },
    }).result;
    const c4 = runSimulation({
      team: [{ ...website, constellation: 4 }, bennett],
      rotation,
      enemy: testEnemy,
      config: { critMode: "never" },
    }).result;
    expect(c4.damageByCharacter[bennett.id]).toBeCloseTo(c0.damageByCharacter[bennett.id] ?? 0);
  });

  it("keeps legacy generated rows descriptive while runtime overlay executes C1/C6", () => {
    const { definition } = requireRaiden();
    const c1 = definition.constellations?.find((constellation) => constellation.level === 1);
    const c6 = definition.constellations?.find((constellation) => constellation.level === 6);

    expect(c1?.effects).toEqual([]);
    expect(c1?.buffs ?? []).toEqual([]);
    expect(c6?.effects).toEqual([]);
    expect(c6?.buffs ?? []).toEqual([]);
  });
});
