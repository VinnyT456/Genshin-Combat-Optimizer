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
export * from "./characters/kits/alhaithamDefinition";
export * from "./characters/kits/alyoshaDefinition";
export * from "./characters/kits/aloyDefinition";
export * from "./characters/kits/aratakiIttoDefinition";
export * from "./characters/kits/baizhuDefinition";
export * from "./characters/kits/beidouDefinition";
export * from "./characters/kits/candaceDefinition";
export * from "./characters/kits/charlotteDefinition";
export * from "./characters/kits/chascaDefinition";
export * from "./characters/kits/chioriDefinition";
export * from "./characters/kits/chevreuseDefinition";
export * from "./characters/kits/chongyunDefinition";
export * from "./characters/kits/colleiDefinition";
export * from "./characters/kits/clorindeDefinition";
export * from "./characters/kits/dehyaDefinition";
export * from "./characters/kits/citlaliDefinition";
export * from "./characters/kits/cynoDefinition";
export * from "./characters/kits/dilucDefinition";
export * from "./characters/kits/dahliaDefinition";
export * from "./characters/kits/dionaDefinition";
export * from "./characters/kits/doriDefinition";
export * from "./characters/kits/escoffierDefinition";
export * from "./characters/kits/durinDefinition";
export * from "./characters/kits/emilieDefinition";
export * from "./characters/kits/eulaDefinition";
export * from "./characters/kits/fischlDefinition";
export * from "./characters/kits/faruzanDefinition";
export * from "./characters/kits/flinsDefinition";
export * from "./characters/kits/freminetDefinition";
export * from "./characters/kits/furinaDefinition";
export * from "./characters/kits/gamingDefinition";
export * from "./characters/kits/ganyuDefinition";
export * from "./characters/kits/gorouDefinition";
export * from "./characters/kits/iansanDefinition";
export * from "./characters/kits/ifaDefinition";
export * from "./characters/kits/huTaoDefinition";
export * from "./characters/kits/ineffaDefinition";
export * from "./characters/kits/jahodaDefinition";
export * from "./characters/kits/illugaDefinition";
export * from "./characters/kits/jeanDefinition";
export * from "./characters/kits/kachinaDefinition";
export * from "./characters/kits/kaedeharaKazuhaDefinition";
export * from "./characters/kits/kaeyaDefinition";
export * from "./characters/kits/kamisatoAyakaDefinition";
export * from "./characters/kits/kamisatoAyatoDefinition";
export * from "./characters/kits/kavehDefinition";
export * from "./characters/kits/kinichDefinition";
export * from "./characters/kits/keqingDefinition";
export * from "./characters/kits/kiraraDefinition";
export * from "./characters/kits/kleeDefinition";
export * from "./characters/kits/kujouSaraDefinition";
export * from "./characters/kits/lanYanDefinition";
export * from "./characters/kits/laumaDefinition";
export * from "./characters/kits/kukiShinobuDefinition";
export * from "./characters/kits/laylaDefinition";
export * from "./characters/kits/linneaDefinition";
export * from "./characters/kits/lisaDefinition";
export * from "./characters/kits/lohenDefinition";
export * from "./characters/kits/lynetteDefinition";
export * from "./characters/kits/lyneyDefinition";
export * from "./characters/kits/mavuikaDefinition";
export * from "./characters/kits/monaDefinition";
export * from "./characters/kits/mikaDefinition";
export * from "./characters/kits/nahidaDefinition";
export * from "./characters/kits/naviaDefinition";
export * from "./characters/kits/mualaniDefinition";
export * from "./characters/kits/neferDefinition";
export * from "./characters/kits/nicoleDefinition";
export * from "./characters/kits/neuvilletteDefinition";
export * from "./characters/kits/nilouDefinition";
export * from "./characters/kits/ningguangDefinition";
export * from "./characters/kits/noelleDefinition";
export * from "./characters/kits/odetteDefinition";
export * from "./characters/kits/pruneDefinition";
export * from "./characters/kits/ororonDefinition";
export * from "./characters/kits/qiqiDefinition";
export * from "./characters/kits/rosariaDefinition";
export * from "./characters/kits/razorDefinition";
export * from "./characters/kits/sandroneDefinition";
export * from "./characters/kits/sangonomiyaKokomiDefinition";
export * from "./characters/kits/sayuDefinition";
export * from "./characters/kits/sethosDefinition";
export * from "./characters/kits/shenheDefinition";
export * from "./characters/kits/shikanoinHeizouDefinition";
export * from "./characters/kits/sigewinneDefinition";
export * from "./characters/kits/skirkDefinition";
export * from "./characters/kits/sucroseDefinition";
export * from "./characters/kits/tartagliaDefinition";
export * from "./characters/kits/thomaDefinition";
export * from "./characters/kits/tighnariDefinition";
export * from "./characters/kits/varesaDefinition";
export * from "./characters/kits/varkaDefinition";
export * from "./characters/kits/ventiDefinition";
export * from "./characters/kits/wandererDefinition";
export * from "./characters/kits/wriothesleyDefinition";
export * from "./characters/kits/xianyunDefinition";
export * from "./characters/kits/xiaoDefinition";
export * from "./characters/kits/xilonenDefinition";
export * from "./characters/kits/xinyanDefinition";
export * from "./characters/kits/yaeMikoDefinition";
export * from "./characters/kits/yanfeiDefinition";
export * from "./characters/kits/yaoyaoDefinition";
export * from "./characters/kits/yelanDefinition";
export * from "./characters/kits/yoimiyaDefinition";
export * from "./characters/kits/yumemizukiMizukiDefinition";
export * from "./characters/kits/yunJinDefinition";
export * from "./characters/kits/zhongliDefinition";
export * from "./characters/kits/zibaiDefinition";
export * from "./characters/kits/travelerFAnemoDefinition";
export * from "./characters/kits/travelerFCryoDefinition";
export * from "./characters/kits/travelerFDendroDefinition";
export * from "./characters/kits/travelerFElectroDefinition";
export * from "./characters/kits/travelerFGeoDefinition";
export * from "./characters/kits/travelerFHydroDefinition";
export * from "./characters/kits/travelerFPyroDefinition";
export * from "./characters/kits/travelerMAnemoDefinition";
export * from "./characters/kits/travelerMCryoDefinition";
export * from "./characters/kits/travelerMDendroDefinition";
export * from "./characters/kits/travelerMElectroDefinition";
export * from "./characters/kits/travelerMGeoDefinition";
export * from "./characters/kits/travelerMHydroDefinition";
export * from "./characters/kits/travelerMPyroDefinition";

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

/**
 * Assembled UI-facing preset shape.
 *
 * DELIBERATELY has zero importers since COMPONENTS.md §14.10 removed the
 * rotation-preset buttons from `RotationEditor`. It is kept as the seam for a
 * future opt-in presets surface; `nationalRotation` and `sampleRotation` below
 * it remain load-bearing test fixtures (determinism corpus + runtime stress).
 * Do not delete either to "clean up" this array.
 */
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
