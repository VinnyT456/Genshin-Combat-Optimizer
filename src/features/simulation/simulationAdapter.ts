import { simulateRotation } from "@/simulation/engine";
import { defMultiplier, resMultiplier } from "@/simulation/damage/pipeline";
import {
  type Equipment,
  type EquipmentStat,
  type ResolvedEquippedStats,
  resolveEquippedStats,
} from "@/simulation/character/equipment";
import { createBennettDefinition } from "@/game-data/characters/kits/bennettDefinition";
import { createAlbedoDefinition } from "@/game-data/characters/kits/albedoDefinition";
import { createAinoDefinition } from "@/game-data/characters/kits/ainoDefinition";
import { createXingqiuDefinition } from "@/game-data/characters/kits/xingqiuDefinition";
import {
  createRaidenShogunDefinition,
  raidenArtifactStateEffects,
} from "@/game-data/characters/kits/raidenShogunDefinition";
import { createQiqiDefinition } from "@/game-data/characters/kits/qiqiDefinition";
import { createRazorDefinition } from "@/game-data/characters/kits/razorDefinition";
import { createRosariaDefinition } from "@/game-data/characters/kits/rosariaDefinition";
import { createSandroneDefinition } from "@/game-data/characters/kits/sandroneDefinition";
import { createSangonomiyaKokomiDefinition } from "@/game-data/characters/kits/sangonomiyaKokomiDefinition";
import { createSayuDefinition } from "@/game-data/characters/kits/sayuDefinition";
import { createSethosDefinition } from "@/game-data/characters/kits/sethosDefinition";
import { createShenheDefinition } from "@/game-data/characters/kits/shenheDefinition";
import { createShikanoinHeizouDefinition } from "@/game-data/characters/kits/shikanoinHeizouDefinition";
import { createSigewinneDefinition } from "@/game-data/characters/kits/sigewinneDefinition";
import { createSkirkDefinition, type SkirkPartyComposition } from "@/game-data/characters/kits/skirkDefinition";
import { createSucroseDefinition } from "@/game-data/characters/kits/sucroseDefinition";
import { createTartagliaDefinition } from "@/game-data/characters/kits/tartagliaDefinition";
import { createThomaDefinition } from "@/game-data/characters/kits/thomaDefinition";
import { createTighnariDefinition } from "@/game-data/characters/kits/tighnariDefinition";
import { createVaresaDefinition } from "@/game-data/characters/kits/varesaDefinition";
import { createVarkaDefinition } from "@/game-data/characters/kits/varkaDefinition";
import { createVentiDefinition } from "@/game-data/characters/kits/ventiDefinition";
import { createWandererDefinition } from "@/game-data/characters/kits/wandererDefinition";
import { createWriothesleyDefinition } from "@/game-data/characters/kits/wriothesleyDefinition";
import { createXianyunDefinition } from "@/game-data/characters/kits/xianyunDefinition";
import { createXiaoDefinition } from "@/game-data/characters/kits/xiaoDefinition";
import { createXilonenDefinition } from "@/game-data/characters/kits/xilonenDefinition";
import { createTravelerFAnemoDefinition } from "@/game-data/characters/kits/travelerFAnemoDefinition";
import { createTravelerFCryoDefinition } from "@/game-data/characters/kits/travelerFCryoDefinition";
import { createTravelerFDendroDefinition } from "@/game-data/characters/kits/travelerFDendroDefinition";
import { createTravelerFElectroDefinition } from "@/game-data/characters/kits/travelerFElectroDefinition";
import { createTravelerFGeoDefinition } from "@/game-data/characters/kits/travelerFGeoDefinition";
import { createTravelerFHydroDefinition } from "@/game-data/characters/kits/travelerFHydroDefinition";
import { createTravelerFPyroDefinition } from "@/game-data/characters/kits/travelerFPyroDefinition";
import { createTravelerMAnemoDefinition } from "@/game-data/characters/kits/travelerMAnemoDefinition";
import { createTravelerMCryoDefinition } from "@/game-data/characters/kits/travelerMCryoDefinition";
import { createTravelerMDendroDefinition } from "@/game-data/characters/kits/travelerMDendroDefinition";
import { createTravelerMElectroDefinition } from "@/game-data/characters/kits/travelerMElectroDefinition";
import { createTravelerMGeoDefinition } from "@/game-data/characters/kits/travelerMGeoDefinition";
import { createTravelerMHydroDefinition } from "@/game-data/characters/kits/travelerMHydroDefinition";
import { createTravelerMPyroDefinition } from "@/game-data/characters/kits/travelerMPyroDefinition";
import { createXianglingDefinition } from "@/game-data/characters/kits/xianglingDefinition";
import { createXinyanDefinition } from "@/game-data/characters/kits/xinyanDefinition";
import { createYaeMikoDefinition } from "@/game-data/characters/kits/yaeMikoDefinition";
import { createYanfeiDefinition } from "@/game-data/characters/kits/yanfeiDefinition";
import { createYaoyaoDefinition } from "@/game-data/characters/kits/yaoyaoDefinition";
import { createYelanDefinition, type YelanPartyComposition } from "@/game-data/characters/kits/yelanDefinition";
import { createYoimiyaDefinition } from "@/game-data/characters/kits/yoimiyaDefinition";
import { createYumemizukiMizukiDefinition } from "@/game-data/characters/kits/yumemizukiMizukiDefinition";
import { createYunJinDefinition } from "@/game-data/characters/kits/yunJinDefinition";
import { createZhongliDefinition } from "@/game-data/characters/kits/zhongliDefinition";
import { createZibaiDefinition } from "@/game-data/characters/kits/zibaiDefinition";
import { withSkillInputVariants } from "@/game-data/characters/skillInputVariants";
import { createAlhaithamDefinition } from "@/game-data/characters/kits/alhaithamDefinition";
import { createAmberDefinition } from "@/game-data/characters/kits/amberDefinition";
import { createAlyoshaDefinition } from "@/game-data/characters/kits/alyoshaDefinition";
import { createAloyDefinition } from "@/game-data/characters/kits/aloyDefinition";
import { createAratakiIttoDefinition } from "@/game-data/characters/kits/aratakiIttoDefinition";
import { createArlecchinoDefinition } from "@/game-data/characters/kits/arlecchinoDefinition";
import { createBaizhuDefinition } from "@/game-data/characters/kits/baizhuDefinition";
import { createBarbaraDefinition } from "@/game-data/characters/kits/barbaraDefinition";
import { createBeidouDefinition } from "@/game-data/characters/kits/beidouDefinition";
import { createCandaceDefinition } from "@/game-data/characters/kits/candaceDefinition";
import { createCharlotteDefinition } from "@/game-data/characters/kits/charlotteDefinition";
import { createChevreuseDefinition } from "@/game-data/characters/kits/chevreuseDefinition";
import { createChongyunDefinition } from "@/game-data/characters/kits/chongyunDefinition";
import { createCitlaliDefinition } from "@/game-data/characters/kits/citlaliDefinition";
import { createChascaDefinition } from "@/game-data/characters/kits/chascaDefinition";
import { createChioriDefinition } from "@/game-data/characters/kits/chioriDefinition";
import { createColleiDefinition } from "@/game-data/characters/kits/colleiDefinition";
import { createClorindeDefinition } from "@/game-data/characters/kits/clorindeDefinition";
import { createCynoDefinition } from "@/game-data/characters/kits/cynoDefinition";
import { createDehyaDefinition } from "@/game-data/characters/kits/dehyaDefinition";
import { createDilucDefinition } from "@/game-data/characters/kits/dilucDefinition";
import { createDahliaDefinition } from "@/game-data/characters/kits/dahliaDefinition";
import { createDionaDefinition } from "@/game-data/characters/kits/dionaDefinition";
import { createDoriDefinition } from "@/game-data/characters/kits/doriDefinition";
import { createEscoffierDefinition, type EscoffierPartyComposition } from "@/game-data/characters/kits/escoffierDefinition";
import { createDurinDefinition } from "@/game-data/characters/kits/durinDefinition";
import { createEmilieDefinition } from "@/game-data/characters/kits/emilieDefinition";
import { createEulaDefinition } from "@/game-data/characters/kits/eulaDefinition";
import { createFischlDefinition } from "@/game-data/characters/kits/fischlDefinition";
import { createFaruzanDefinition } from "@/game-data/characters/kits/faruzanDefinition";
import { createFlinsDefinition } from "@/game-data/characters/kits/flinsDefinition";
import { createFreminetDefinition } from "@/game-data/characters/kits/freminetDefinition";
import { createFurinaDefinition } from "@/game-data/characters/kits/furinaDefinition";
import { createGamingDefinition } from "@/game-data/characters/kits/gamingDefinition";
import { createGanyuDefinition } from "@/game-data/characters/kits/ganyuDefinition";
import { createGorouDefinition } from "@/game-data/characters/kits/gorouDefinition";
import { createIansanDefinition } from "@/game-data/characters/kits/iansanDefinition";
import { createIfaDefinition } from "@/game-data/characters/kits/ifaDefinition";
import { createHuTaoDefinition } from "@/game-data/characters/kits/huTaoDefinition";
import { createIneffaDefinition } from "@/game-data/characters/kits/ineffaDefinition";
import { createJahodaDefinition } from "@/game-data/characters/kits/jahodaDefinition";
import { createIllugaDefinition } from "@/game-data/characters/kits/illugaDefinition";
import { createJeanDefinition } from "@/game-data/characters/kits/jeanDefinition";
import { createKachinaDefinition } from "@/game-data/characters/kits/kachinaDefinition";
import { createKaedeharaKazuhaDefinition } from "@/game-data/characters/kits/kaedeharaKazuhaDefinition";
import { createKaeyaDefinition } from "@/game-data/characters/kits/kaeyaDefinition";
import { createKamisatoAyakaDefinition } from "@/game-data/characters/kits/kamisatoAyakaDefinition";
import { createKamisatoAyatoDefinition } from "@/game-data/characters/kits/kamisatoAyatoDefinition";
import { createKavehDefinition } from "@/game-data/characters/kits/kavehDefinition";
import { createKinichDefinition } from "@/game-data/characters/kits/kinichDefinition";
import { createKeqingDefinition } from "@/game-data/characters/kits/keqingDefinition";
import { createKiraraDefinition } from "@/game-data/characters/kits/kiraraDefinition";
import { createKleeDefinition } from "@/game-data/characters/kits/kleeDefinition";
import { createKujouSaraDefinition } from "@/game-data/characters/kits/kujouSaraDefinition";
import { createLanYanDefinition } from "@/game-data/characters/kits/lanYanDefinition";
import { createLaumaDefinition } from "@/game-data/characters/kits/laumaDefinition";
import { createKukiShinobuDefinition } from "@/game-data/characters/kits/kukiShinobuDefinition";
import { createLaylaDefinition } from "@/game-data/characters/kits/laylaDefinition";
import { createLinneaDefinition } from "@/game-data/characters/kits/linneaDefinition";
import { createLisaDefinition } from "@/game-data/characters/kits/lisaDefinition";
import { createLohenDefinition } from "@/game-data/characters/kits/lohenDefinition";
import { createLynetteDefinition } from "@/game-data/characters/kits/lynetteDefinition";
import { createLyneyDefinition } from "@/game-data/characters/kits/lyneyDefinition";
import { createMavuikaDefinition } from "@/game-data/characters/kits/mavuikaDefinition";
import { createMonaDefinition } from "@/game-data/characters/kits/monaDefinition";
import { createMikaDefinition } from "@/game-data/characters/kits/mikaDefinition";
import { createNahidaDefinition } from "@/game-data/characters/kits/nahidaDefinition";
import { createNaviaDefinition } from "@/game-data/characters/kits/naviaDefinition";
import { createMualaniDefinition } from "@/game-data/characters/kits/mualaniDefinition";
import { createNeferDefinition } from "@/game-data/characters/kits/neferDefinition";
import { createNicoleDefinition } from "@/game-data/characters/kits/nicoleDefinition";
import { createNeuvilletteDefinition } from "@/game-data/characters/kits/neuvilletteDefinition";
import { createNilouDefinition } from "@/game-data/characters/kits/nilouDefinition";
import { createNingguangDefinition } from "@/game-data/characters/kits/ningguangDefinition";
import { createNoelleDefinition } from "@/game-data/characters/kits/noelleDefinition";
import { createOdetteDefinition } from "@/game-data/characters/kits/odetteDefinition";
import { createPruneDefinition } from "@/game-data/characters/kits/pruneDefinition";
import { createOroronDefinition } from "@/game-data/characters/kits/ororonDefinition";
import { equipmentConfig } from "@/features/simulation/equipmentAdapter";
import type { EquipmentSelections } from "@/features/team-builder/equipmentSelection";
import type {
  CharacterDefinition,
  Stats,
  EnemyState,
  Rotation,
  SimulationConfig,
  SimulationResult,
} from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";

// ---------------------------------------------------------------------------
// Thin adapter between the React layer and the combat engine. The UI never
// imports the engine directly and never computes damage, energy or reactions —
// this module exists only so component code depends on one narrow seam.
// ---------------------------------------------------------------------------

/** Crit is presented as an expected value; the UI shows no random rolls. */
const UI_SIMULATION_CONFIG: SimulationConfig = {
  critMode: "expected",
  startWithFullEnergy: true,
};

/**
 * True when the run used the engine's own swap cost rather than a UI override.
 * The adapter owns the config, so it is the only layer that can answer this
 * honestly — the timeline legend must not label a value "default" on a guess.
 */
export function swapCostWasDefault(config: SimulationConfig): boolean {
  return config.swapCost === undefined;
}

/**
 * Enemy mitigation preview, for the enemy configurator's readout.
 *
 * These RE-EXPORT the engine's own `defMultiplier` / `resMultiplier` rather
 * than recomputing them. The configurator previously inlined both formulas,
 * which is a second implementation of engine math in the UI: it would drift
 * from the engine silently and no test would fail (TASK #034 finding H5).
 *
 * `characterLevel` is a required argument, not a default: the DEF multiplier
 * depends on it, and baking in a level the user never chose renders an
 * assumption as if it were a result.
 */
export interface MitigationPreview {
  readonly defMultiplier: number;
  readonly resMultiplier: number;
  /** Combined factor, i.e. the share of raw damage that survives mitigation. */
  readonly totalMultiplier: number;
}

export function previewMitigation(
  characterLevel: number,
  enemyLevel: number,
  resistance: number,
): MitigationPreview {
  const def = defMultiplier(characterLevel, enemyLevel);
  const res = resMultiplier(resistance);
  return { defMultiplier: def, resMultiplier: res, totalMultiplier: def * res };
}

/**
 * Applies equipment to a character's stats using the ENGINE's stat model.
 *
 * The UI previously folded weapon substats in by hand, applying ATK% to the
 * already-final ATK. In game every percentage scales BASE ATK (character base
 * plus weapon base), so the local version inflated the result and compounded
 * with each additional source. `resolveEquippedStats` is the engine's own
 * `base * (1 + Sum pct) + Sum flat` implementation; delegating keeps exactly
 * one stat model in the project (finding H5's rule, applied to stats).
 */
export function applyEquipment(
  characterStats: Stats,
  equipment: Equipment,
): ResolvedEquippedStats {
  return resolveEquippedStats(characterStats, equipment);
}

export type { Equipment, EquipmentStat, ResolvedEquippedStats };

/**
 * Character shape kept by the website while legacy presentation components are
 * being migrated. The nested definition is lossless: multi-hit abilities,
 * scaling terms, passives, constellations, resources and level tables all reach
 * the engine. Top-level legacy fields remain available to existing UI views.
 */
export type WebsiteCharacterDefinition = CharacterDefinition & {
  readonly engineDefinition: GenericCharacterDefinition;
};

export function isWebsiteCharacter(
  character: CharacterDefinition | GenericCharacterDefinition | WebsiteCharacterDefinition,
): character is WebsiteCharacterDefinition {
  return "engineDefinition" in character;
}

export interface EngineTeamComposition {
  readonly skirk?: SkirkPartyComposition;
  readonly escoffier?: EscoffierPartyComposition;
  readonly yelan?: YelanPartyComposition;
}

/** Derives the team-wide inputs consumed by supported character overlays. */
export function engineCompositionForTeam(
  team: readonly (
    | CharacterDefinition
    | GenericCharacterDefinition
    | WebsiteCharacterDefinition
  )[],
): EngineTeamComposition {
  const elements = team.map((character) =>
    isWebsiteCharacter(character) ? character.engineDefinition.element : character.element,
  );
  return {
    skirk: {
      allHydroCryo: elements.every((element) => element === "hydro" || element === "cryo"),
      hasHydro: elements.includes("hydro"),
      hasCryo: elements.includes("cryo"),
    },
    escoffier: {
      hydroOrCryoCount: elements.filter((element) => element === "hydro" || element === "cryo").length,
    },
    yelan: { distinctElementCount: new Set(elements).size },
  };
}

/** Applies the editable website build to its lossless engine definition. */
export function toEngineCharacter(
  character: CharacterDefinition | GenericCharacterDefinition | WebsiteCharacterDefinition,
  composition: EngineTeamComposition = {},
): CharacterDefinition | GenericCharacterDefinition {
  if (!isWebsiteCharacter(character)) {
    if (!('normalAttacks' in character) && character.id === "chevreuse") {
      const adapted = createChevreuseDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "chongyun") {
      const adapted = createChongyunDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "candace") {
      const adapted = createCandaceDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "charlotte") {
      const adapted = createCharlotteDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "beidou") {
      const adapted = createBeidouDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "chasca") {
      const adapted = createChascaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "chiori") {
      const adapted = createChioriDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "clorinde") {
      const adapted = createClorindeDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "cyno") {
      const adapted = createCynoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "dehya") {
      const adapted = createDehyaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "dahlia") {
      const adapted = createDahliaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "diluc") {
      const adapted = createDilucDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "diona") {
      const adapted = createDionaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "dori") {
      const adapted = createDoriDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "escoffier") {
      const adapted = createEscoffierDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
        composition.escoffier,
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "durin") {
      const adapted = createDurinDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "emilie") {
      const adapted = createEmilieDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "eula") {
      const adapted = createEulaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "fischl") {
      const adapted = createFischlDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "faruzan") {
      const adapted = createFaruzanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "flins") {
      const adapted = createFlinsDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "freminet") {
      const adapted = createFreminetDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "furina") {
      const adapted = createFurinaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "gaming") {
      const adapted = createGamingDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "ganyu") {
      const adapted = createGanyuDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "gorou") {
      const adapted = createGorouDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "iansan") {
      const adapted = createIansanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "ifa") {
      const adapted = createIfaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "hu-tao") {
      const adapted = createHuTaoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "ineffa") {
      const adapted = createIneffaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "jahoda") {
      const adapted = createJahodaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "illuga") {
      const adapted = createIllugaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "jean") {
      const adapted = createJeanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kachina") {
      const adapted = createKachinaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kaedehara-kazuha") {
      const adapted = createKaedeharaKazuhaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kaeya") {
      const adapted = createKaeyaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kamisato-ayaka") {
      const adapted = createKamisatoAyakaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kamisato-ayato") {
      const adapted = createKamisatoAyatoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kaveh") {
      const adapted = createKavehDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kinich") {
      const adapted = createKinichDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "keqing") {
      const adapted = createKeqingDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kirara") {
      const adapted = createKiraraDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "klee") {
      const adapted = createKleeDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kujou-sara") {
      const adapted = createKujouSaraDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lan-yan") {
      const adapted = createLanYanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lauma") {
      const adapted = createLaumaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "kuki-shinobu") {
      const adapted = createKukiShinobuDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "layla") {
      const adapted = createLaylaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "linnea") {
      const adapted = createLinneaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lisa") {
      const adapted = createLisaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lohen") {
      const adapted = createLohenDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lynette") {
      const adapted = createLynetteDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "lyney") {
      const adapted = createLyneyDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "mavuika") {
      const adapted = createMavuikaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "mona") {
      const adapted = createMonaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "mika") {
      const adapted = createMikaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "nahida") {
      const adapted = createNahidaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "navia") {
      const adapted = createNaviaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "mualani") {
      const adapted = createMualaniDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "nefer") {
      const adapted = createNeferDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "nicole") {
      const adapted = createNicoleDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "neuvillette") {
      const adapted = createNeuvilletteDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "nilou") {
      const adapted = createNilouDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "ningguang") {
      const adapted = createNingguangDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "noelle") {
      const adapted = createNoelleDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "odette") {
      const adapted = createOdetteDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "prune") {
      const adapted = createPruneDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "ororon") {
      const adapted = createOroronDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "arataki-itto") {
      const adapted = createAratakiIttoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return { ...adapted, burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost } };
    }
    if (!('normalAttacks' in character) && character.id === "aloy") {
      const adapted = createAloyDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "arlecchino") {
      const adapted = createArlecchinoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "baizhu") {
      const adapted = createBaizhuDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "barbara") {
      const adapted = createBarbaraDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "amber") {
      const adapted = createAmberDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "alyosha") {
      const adapted = createAlyoshaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!('normalAttacks' in character) && character.id === "alhaitham") {
      const selectedConstellation = character.constellation ?? 0;
      const adapted = createAlhaithamDefinition(
        selectedConstellation,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "aino") {
      const adapted = createAinoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "albedo") {
      const adapted = createAlbedoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if ("normalAttacks" in character && character.id === "albedo") {
      const adapted = createAlbedoDefinition(
        character.constellationLevel,
        character.talentLevels,
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.burst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "bennett") {
      const adapted = createBennettDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if ("normalAttacks" in character && character.id === "bennett") {
      const adapted = createBennettDefinition(
        character.constellationLevel,
        character.talentLevels,
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.burst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xingqiu") {
      const adapted = createXingqiuDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if ("normalAttacks" in character && character.id === "xingqiu") {
      const adapted = createXingqiuDefinition(
        character.constellationLevel,
        character.talentLevels,
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.burst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xiangling") {
      const adapted = createXianglingDefinition(character.constellation ?? 0);
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        constellationLevel: character.constellation ?? adapted.constellationLevel,
        talentLevels: character.talentLevels ?? adapted.talentLevels,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xinyan") {
      const adapted = createXinyanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yae-miko") {
      const adapted = createYaeMikoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yanfei") {
      const adapted = createYanfeiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yaoyao") {
      const adapted = createYaoyaoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yelan") {
      const adapted = createYelanDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
        composition.yelan,
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yoimiya") {
      const adapted = createYoimiyaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yumemizuki-mizuki") {
      const adapted = createYumemizukiMizukiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "zhongli") {
      const adapted = createZhongliDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "yun-jin") {
      const adapted = createYunJinDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "zibai") {
      const adapted = createZibaiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (
      !("normalAttacks" in character) &&
      (character.id === "raiden-shogun" || character.id === "raiden")
    ) {
      const selectedConstellation = character.constellation ?? 0;
      const adapted = createRaidenShogunDefinition(
        selectedConstellation,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        constellationLevel: selectedConstellation,
        talentLevels: character.talentLevels ?? adapted.talentLevels,
        burst: {
          ...adapted.burst,
          energyCost: character.elementalBurst.energyCost,
        },
      };
    }
    if (!("normalAttacks" in character) && character.id === "qiqi") {
      const adapted = createQiqiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "razor") {
      const adapted = createRazorDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "rosaria") {
      const adapted = createRosariaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sandrone") {
      const adapted = createSandroneDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sangonomiya-kokomi") {
      const adapted = createSangonomiyaKokomiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sayu") {
      const adapted = createSayuDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sethos") {
      const adapted = createSethosDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "shenhe") {
      const adapted = createShenheDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "shikanoin-heizou") {
      const selectedConstellation = character.constellation ?? 0;
      const adapted = createShikanoinHeizouDefinition(
        selectedConstellation,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        constellationLevel: selectedConstellation,
        talentLevels: character.talentLevels ?? adapted.talentLevels,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sigewinne") {
      const adapted = createSigewinneDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "skirk") {
      const adapted = createSkirkDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
        composition.skirk,
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "sucrose") {
      const adapted = createSucroseDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "tartaglia") {
      const adapted = createTartagliaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "thoma") {
      const adapted = createThomaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "tighnari") {
      const adapted = createTighnariDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "varesa") {
      const adapted = createVaresaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "venti") {
      const adapted = createVentiDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "varka") {
      const adapted = createVarkaDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "wanderer") {
      const adapted = createWandererDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "wriothesley") {
      const adapted = createWriothesleyDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xianyun") {
      const adapted = createXianyunDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xiao") {
      const adapted = createXiaoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "xilonen") {
      const selectedConstellation = character.constellation ?? 0;
      const adapted = createXilonenDefinition(
        selectedConstellation,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
      );
      return {
        ...adapted,
        level: character.level,
        baseStats: character.baseStats,
        constellationLevel: selectedConstellation,
        talentLevels: character.talentLevels ?? adapted.talentLevels,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-anemo") {
      const adapted = createTravelerFAnemoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-cryo") {
      const adapted = createTravelerFCryoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-dendro") {
      const adapted = createTravelerFDendroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-electro") {
      const adapted = createTravelerFElectroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-geo") {
      const adapted = createTravelerFGeoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-hydro") {
      const adapted = createTravelerFHydroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-f-pyro") {
      const adapted = createTravelerFPyroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-anemo") {
      const adapted = createTravelerMAnemoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-cryo") {
      const adapted = createTravelerMCryoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-dendro") {
      const adapted = createTravelerMDendroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-electro") {
      const adapted = createTravelerMElectroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-geo") {
      const adapted = createTravelerMGeoDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-hydro") {
      const adapted = createTravelerMHydroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    if (!("normalAttacks" in character) && character.id === "traveler-m-pyro") {
      const adapted = createTravelerMPyroDefinition(
        character.constellation ?? 0,
        character.talentLevels ?? { normal: 1, skill: 1, burst: 1 },
        { level: character.level, baseStats: character.baseStats },
      );
      return {
        ...adapted,
        burst: { ...adapted.burst, energyCost: character.elementalBurst.energyCost },
      };
    }
    return character;
  }
  const selectedConstellation =
    character.constellation ?? character.engineDefinition.constellationLevel;
  const baseDefinition =
    character.id === "arataki-itto"
      ? createAratakiIttoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "aloy"
      ? createAloyDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "alyosha"
      ? createAlyoshaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "amber"
      ? createAmberDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "aino"
      ? createAinoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "alhaitham"
      ? createAlhaithamDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "albedo"
      ? createAlbedoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "baizhu"
        ? createBaizhuDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "candace"
        ? createCandaceDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "charlotte"
        ? createCharlotteDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "beidou"
        ? createBeidouDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "chasca"
        ? createChascaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "chiori"
        ? createChioriDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "clorinde"
        ? createClorindeDefinition(
            selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "dehya"
        ? createDehyaDefinition(
            selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "dahlia"
        ? createDahliaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "diluc"
        ? createDilucDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "diona"
        ? createDionaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "dori"
        ? createDoriDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "escoffier"
        ? createEscoffierDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
            {},
            composition.escoffier,
          )
      : character.id === "durin"
        ? createDurinDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "emilie"
        ? createEmilieDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "eula"
        ? createEulaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "fischl"
        ? createFischlDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "faruzan"
        ? createFaruzanDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "flins"
        ? createFlinsDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "freminet"
        ? createFreminetDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "furina"
        ? createFurinaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "gaming"
        ? createGamingDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "ganyu"
        ? createGanyuDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "gorou"
        ? createGorouDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "iansan"
        ? createIansanDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "ifa"
        ? createIfaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "hu-tao"
        ? createHuTaoDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "ineffa"
        ? createIneffaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "jahoda"
        ? createJahodaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "illuga"
        ? createIllugaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "jean"
        ? createJeanDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kachina"
        ? createKachinaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kaedehara-kazuha"
        ? createKaedeharaKazuhaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kaeya"
        ? createKaeyaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kamisato-ayaka"
        ? createKamisatoAyakaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kamisato-ayato"
        ? createKamisatoAyatoDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kaveh"
        ? createKavehDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kinich"
        ? createKinichDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "keqing"
        ? createKeqingDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kirara"
        ? createKiraraDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "klee"
        ? createKleeDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kujou-sara"
        ? createKujouSaraDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lan-yan"
        ? createLanYanDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lauma"
        ? createLaumaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "kuki-shinobu"
        ? createKukiShinobuDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "layla"
        ? createLaylaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "linnea"
        ? createLinneaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lisa"
        ? createLisaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lohen"
        ? createLohenDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lynette"
        ? createLynetteDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "lyney"
        ? createLyneyDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "mavuika"
        ? createMavuikaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "mona"
        ? createMonaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "mika"
        ? createMikaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "nahida"
        ? createNahidaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "navia"
        ? createNaviaDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "mualani"
        ? createMualaniDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "nefer"
        ? createNeferDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "nicole"
        ? createNicoleDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "neuvillette"
        ? createNeuvilletteDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "nilou"
        ? createNilouDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "ningguang"
        ? createNingguangDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "noelle"
        ? createNoelleDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "odette"
        ? createOdetteDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "prune"
        ? createPruneDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "ororon"
        ? createOroronDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "cyno"
        ? createCynoDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "chevreuse"
        ? createChevreuseDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "chongyun"
        ? createChongyunDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "citlali"
        ? createCitlaliDefinition(
            selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "collei"
        ? createColleiDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "barbara"
        ? createBarbaraDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "arlecchino"
      ? createArlecchinoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "raiden-shogun" || character.id === "raiden"
      ? createRaidenShogunDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "qiqi"
      ? createQiqiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "razor"
      ? createRazorDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "rosaria"
      ? createRosariaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "sandrone"
      ? createSandroneDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "sangonomiya-kokomi"
      ? createSangonomiyaKokomiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "sayu"
      ? createSayuDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "sethos"
      ? createSethosDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "shenhe"
      ? createShenheDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "shikanoin-heizou"
      ? createShikanoinHeizouDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "sigewinne"
      ? createSigewinneDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "skirk"
      ? createSkirkDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
          {},
          composition.skirk,
        )
      : character.id === "sucrose"
      ? createSucroseDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "tartaglia"
      ? createTartagliaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "thoma"
      ? createThomaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "tighnari"
      ? createTighnariDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "varesa"
      ? createVaresaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "venti"
      ? createVentiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "varka"
      ? createVarkaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "wanderer"
      ? createWandererDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "wriothesley"
      ? createWriothesleyDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "xianyun"
      ? createXianyunDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "xiao"
      ? createXiaoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "xilonen"
      ? createXilonenDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "xinyan"
      ? createXinyanDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yae-miko"
      ? createYaeMikoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yanfei"
      ? createYanfeiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yaoyao"
      ? createYaoyaoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yelan"
      ? createYelanDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
          {},
          composition.yelan,
        )
      : character.id === "yoimiya"
      ? createYoimiyaDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yumemizuki-mizuki"
      ? createYumemizukiMizukiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "zhongli"
      ? createZhongliDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "yun-jin"
      ? createYunJinDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "zibai"
      ? createZibaiDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-anemo"
      ? createTravelerFAnemoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-cryo"
      ? createTravelerFCryoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-dendro"
      ? createTravelerFDendroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-electro"
      ? createTravelerFElectroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-geo"
      ? createTravelerFGeoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-hydro"
      ? createTravelerFHydroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-f-pyro"
      ? createTravelerFPyroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-anemo"
      ? createTravelerMAnemoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-cryo"
      ? createTravelerMCryoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-dendro"
      ? createTravelerMDendroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-electro"
      ? createTravelerMElectroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-geo"
      ? createTravelerMGeoDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-hydro"
      ? createTravelerMHydroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "traveler-m-pyro"
      ? createTravelerMPyroDefinition(
          selectedConstellation,
          character.talentLevels ?? character.engineDefinition.talentLevels,
        )
      : character.id === "xiangling"
        ? createXianglingDefinition(selectedConstellation)
      : character.id === "bennett"
        ? createBennettDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.id === "xingqiu"
        ? createXingqiuDefinition(
            selectedConstellation,
            character.talentLevels ?? character.engineDefinition.talentLevels,
          )
      : character.engineDefinition;
  const definitionWithSkillVariants = withSkillInputVariants(baseDefinition);
  return {
    ...definitionWithSkillVariants,
    level: character.level,
    baseStats: character.baseStats,
    constellationLevel: selectedConstellation,
    talentLevels:
      character.talentLevels ?? character.engineDefinition.talentLevels,
  };
}

export interface RunSimulationInput {
  team: readonly (
    | CharacterDefinition
    | GenericCharacterDefinition
    | WebsiteCharacterDefinition
  )[];
  rotation: Rotation;
  enemy: EnemyState;
  config?: Partial<SimulationConfig>;
  /**
   * The user's equipment choices, keyed by character id.
   *
   * Optional so every existing caller (and every fixture) keeps its exact
   * previous behaviour: absent selections produce no `equippedStats` and no
   * `equipmentBuffs`, which is the config the adapter built before this wire
   * existed.
   */
  equipment?: EquipmentSelections;
}

export interface RunSimulationOutput {
  result: SimulationResult;
  /** Whether `result.effectiveSwapCost` came from the engine default. */
  swapCostIsDefault: boolean;
}

export function runSimulation({
  team,
  rotation,
  enemy,
  config,
  equipment,
}: RunSimulationInput): RunSimulationOutput {
  // The user's gear, translated into the two config fields the engine already
  // reads: `equippedStats` (what the gear is worth) and `equipmentBuffs` (the
  // weapon passives and set bonuses it carries). Built BEFORE the caller's
  // `config` is spread, so an explicit caller-supplied value still wins — the
  // optimizer's build search varies `equippedStats` directly and must not have
  // it overwritten by the team panel's selection.
  const equipmentFields = equipment
    ? equipmentConfig(
        team.map((character) => ({
          id: character.id,
          stats: character.baseStats,
          intrinsicStats: isWebsiteCharacter(character)
            ? character.engineDefinition.baseStats
            : character.baseStats,
        })),
        equipment,
      )
    : {};

  const composition = engineCompositionForTeam(team);
  const engineTeam = team.map((character) => toEngineCharacter(character, composition));
  const autoArtifactStateEffects = engineTeam.flatMap((character) => {
    if (!("normalAttacks" in character)) return [];
    if (character.id !== "raiden-shogun" && character.id !== "raiden") return [];
    return raidenArtifactStateEffects(
      character.id,
      character.constellationLevel,
      character.talentLevels.burst,
      character.ascensionPhase,
    );
  });

  const mergedConfig: SimulationConfig = {
    ...UI_SIMULATION_CONFIG,
    ...equipmentFields,
    ...config,
  };
  if (autoArtifactStateEffects.length > 0) {
    mergedConfig.artifactStateEffects = [
      ...autoArtifactStateEffects,
      ...(config?.artifactStateEffects ?? []),
    ];
  }
  return {
    result: simulateRotation(engineTeam, rotation, enemy, mergedConfig),
    swapCostIsDefault: swapCostWasDefault(mergedConfig),
  };
}
