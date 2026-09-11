import type { CharacterDefinition, Rotation } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import { testElectro } from "@/game-data/characters/testElectro";
import { testAnemo } from "@/game-data/characters/testAnemo";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import {
  allCharacters,
  characterRosterEntries,
  charactersById,
  filterCharacters,
  findCharacter,
  findRosterEntry,
  toLegacyCharacterDefinition,
} from "@/game-data/characters/registry";

export {
  testPyro,
  testHydro,
  testElectro,
  testAnemo,
  testEnemy,
  allCharacters,
  charactersById,
  characterRosterEntries,
  findCharacter,
  findRosterEntry,
  filterCharacters,
  toLegacyCharacterDefinition,
};

export * from "./weapons/types";
export * from "./weapons/registry";
export * from "./characters/kits/raidenNationalKit";
export * from "./characters/kits/raidenShogunDefinition";
export * from "./characters/kits/xingqiuDefinition";
export * from "./characters/kits/xianglingDefinition";

/**
 * Playable roster, adapted to the legacy `CharacterDefinition` shape for UI
 * components that predate `GenericCharacterDefinition`.
 *
 * LOSSY: see `toLegacyCharacterDefinition`. The adapter collapses each
 * per-level talent table to the character's own talent level and drops
 * non-ATK scaling terms, which the legacy shape cannot express. Prefer
 * `allCharacters` wherever the newer shape is accepted.
 *
 * Test characters are excluded from this user-facing roster.
 */
export const characters: CharacterDefinition[] = allCharacters.map(
  toLegacyCharacterDefinition,
);

export interface RotationPreset {
  id: string;
  name: string;
  description: string;
  rotation: Rotation;
  defaultTeam: CharacterDefinition[];
}

/**
 * Looks a preset team member up by id, failing LOUDLY when it is missing.
 *
 * The previous form fell back to `characters[0]`, so a renamed id silently
 * substituted an arbitrary character and every number in the preset came out
 * wrong with no error anywhere — the same class of quiet-plausible-wrongness
 * the fabricated-data audit was about. Ids come from the generator, so a
 * rename must break here rather than be papered over.
 */
function requireCharacter(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) {
    throw new Error(
      `preset references unknown character id "${id}" — the generated roster ` +
        `may have renamed it`,
    );
  }
  return found;
}

/** Raiden National. Ids are the generator's, e.g. "raiden-shogun", not "raiden". */
export const RAIDEN_ID = "raiden-shogun";

export const nationalTeam: CharacterDefinition[] = [
  requireCharacter(RAIDEN_ID),
  requireCharacter("bennett"),
  requireCharacter("xiangling"),
  requireCharacter("xingqiu"),
];

/**
 * Standard 4-character Raiden National team rotation with coordinated attacks,
 * burst cycling, and off-field reactions.
 */
export const nationalRotation: Rotation = [
  { characterId: RAIDEN_ID, actionType: "skill" },
  { characterId: "bennett", actionType: "swap" },
  { characterId: "bennett", actionType: "burst" },
  { characterId: "bennett", actionType: "skill" },
  { characterId: "xiangling", actionType: "swap" },
  { characterId: "xiangling", actionType: "burst" },
  { characterId: "xiangling", actionType: "skill" },
  { characterId: "xingqiu", actionType: "swap" },
  { characterId: "xingqiu", actionType: "burst" },
  { characterId: "xingqiu", actionType: "skill" },
  { characterId: RAIDEN_ID, actionType: "swap" },
  { characterId: RAIDEN_ID, actionType: "burst" },
  { characterId: RAIDEN_ID, actionType: "normal" },
  { characterId: RAIDEN_ID, actionType: "normal" },
  { characterId: RAIDEN_ID, actionType: "normal" },
];

/** Hand-built solo Bennett sample rotation. */
export const sampleRotation: Rotation = [
  { characterId: "bennett", actionType: "skill" },
  { characterId: "bennett", actionType: "normal" },
  { characterId: "bennett", actionType: "normal" },
  { characterId: "bennett", actionType: "burst" },
  { characterId: "bennett", actionType: "normal" },
];

/**
 * Phase 2 four-character test party. Four distinct elements so off-element and
 * colourless particle routing is actually exercised in internal simulation unit tests.
 */
export const testTeam: CharacterDefinition[] = [
  testPyro,
  testHydro,
  testElectro,
  testAnemo,
];

/**
 * Sample 4-character rotation with swaps for testTeam in simulation test harness.
 */
export const teamRotation: Rotation = [
  { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
  { characterId: "test-hydro", actionType: "swap" },
  { characterId: "test-hydro", actionType: "skill", abilityId: "test-hydro-e" },
  { characterId: "test-electro", actionType: "swap" },
  { characterId: "test-electro", actionType: "skill", abilityId: "test-electro-e" },
  { characterId: "test-anemo", actionType: "swap" },
  { characterId: "test-anemo", actionType: "skill", abilityId: "test-anemo-e" },
  { characterId: "test-electro", actionType: "swap" },
  { characterId: "test-electro", actionType: "burst", abilityId: "test-electro-q" },
];

export const ROTATION_PRESETS: readonly RotationPreset[] = [
  {
    id: "national-team",
    name: "雷神国家队标准循环",
    description: "雷电将军 E → 班尼特 Q+E → 香菱 Q+E → 行秋 Q+E → 雷电将军 Q+3A",
    rotation: nationalRotation,
    defaultTeam: nationalTeam,
  },
  {
    id: "solo-bennett",
    name: "班尼特单人循环",
    description: "元素战技 → 2次普通攻击 → 元素爆发 → 普通攻击",
    rotation: sampleRotation,
    defaultTeam: [requireCharacter("bennett")],
  },
];
