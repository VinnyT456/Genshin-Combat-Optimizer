import { describe, expect, it } from "vitest";
import { findCharacter } from "@/game-data/characters/registry";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import { toWebsiteCharacter } from "./rosterModel";
import {
  mergeRecommendedBuildEquipment,
  prepareCharacterWithRecommendedBuild,
} from "./recommendedBuildSelection";

describe("recommended build selection", () => {
  it("seeds a new character with the authored weapon and artifact loadout", () => {
    const raiden = findCharacter("raiden-shogun");
    if (!raiden) throw new Error("Raiden Shogun missing from roster");
    const character = toWebsiteCharacter(raiden);

    const prepared = prepareCharacterWithRecommendedBuild(character);
    const equipment = mergeRecommendedBuildEquipment({}, character);
    const selection = equipment[character.id];

    expect(prepared.build?.weaponId).toBe("engulfinglightning");
    expect(prepared.weapon.id).toBe("engulfinglightning");
    expect(prepared.character.baseStats.base?.atk).toBeGreaterThan(
      character.baseStats.atk,
    );
    expect(selection?.weaponId).toBe("engulfinglightning");
    expect(selection?.artifactSetId).toBe("emblem-of-severed-fate");
    expect(Object.keys(selection?.artifactLoadout ?? {})).toHaveLength(
      ARTIFACT_SLOTS.length,
    );
    for (const slot of ARTIFACT_SLOTS) {
      expect(selection?.artifactLoadout?.[slot]?.setId).toBe(
        "emblem-of-severed-fate",
      );
    }
  });

  it("preserves an explicit equipment choice while filling only missing weapon state", () => {
    const raiden = findCharacter("raiden-shogun");
    if (!raiden) throw new Error("Raiden Shogun missing from roster");
    const character = toWebsiteCharacter(raiden);

    const selections = {
      [character.id]: { weaponId: "thecatch", refinement: 5 as const },
    };
    const merged = mergeRecommendedBuildEquipment(selections, character);

    expect(merged[character.id]?.weaponId).toBe("thecatch");
    expect(merged[character.id]?.refinement).toBe(5);
    expect(merged[character.id]?.artifactLoadout).toBeUndefined();
  });
});
