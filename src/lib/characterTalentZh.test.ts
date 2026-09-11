import { describe, expect, it } from "vitest";
import { generatedCharacters } from "@/game-data/characters/generated";
import {
  characterTalentZhById,
  talentZhForCharacter,
  talentZhForSlot,
} from "./characterTalentZh";

const SLOTS = ["normal", "skill", "burst"] as const;

describe("characterTalentZh", () => {
  it("covers every generated playable character", () => {
    expect(Object.keys(characterTalentZhById)).toHaveLength(generatedCharacters.length);
    for (const character of generatedCharacters) {
      const copy = talentZhForCharacter(character.id);
      expect(copy, character.id).toBeDefined();
      expect(copy?.nameZh, character.id).toMatch(/[^A-Za-z0-9]/);
      for (const slot of SLOTS) {
        const talent = talentZhForSlot(character.id, slot);
        expect(talent, `${character.id}/${slot}`).toBeDefined();
        expect(talent?.nameZh, `${character.id}/${slot} name`).toMatch(/[^A-Za-z0-9]/);
        expect(talent?.descriptionZh, `${character.id}/${slot} description`).toMatch(
          /[^A-Za-z0-9]/,
        );
      }
    }
  });

  it("keeps source markup out of rendered copy", () => {
    for (const copy of Object.values(characterTalentZhById)) {
      for (const slot of SLOTS) {
        const talent = copy.abilities[slot];
        expect(talent?.descriptionZh).not.toMatch(/<color|<\/color>|\{LINK#/);
      }
    }
  });

  it("fails closed for unknown characters and slots", () => {
    expect(talentZhForCharacter("unknown-character")).toBeUndefined();
    expect(talentZhForSlot("unknown-character", "skill")).toBeUndefined();
  });
});
