/** Runtime Linnea overlay for the executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { linnea } from "../generated/geo";

const LINNEA_A1_GEO_RES_REDUCTION = 0.15;
const LINNEA_C5_BURST_LEVELS = 3;

/** Field Observation Notes: Lumi's first Geo RES reduction starts after Skill resolves. */
const a1LumiFieldBuff: Buff = {
  id: "linnea-a1-lumi-field-geo-shred",
  source: "Field Observation Notes",
  sourceCharacterId: linnea.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  enemyModifiers: [{ key: "resReduction", element: "geo", value: LINNEA_A1_GEO_RES_REDUCTION }],
};

const c5BurstTalentBuff: Buff = {
  id: "linnea-c5-burst-talent-level",
  source: "Fairyland's Farewell Gift",
  sourceCharacterId: linnea.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  talentLevelModifiers: [{ slot: "burst", levels: LINNEA_C5_BURST_LEVELS }],
};

export function createLinneaDefinition(
  constellationLevel = linnea.constellationLevel,
  talentLevels: TalentLevels = linnea.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? linnea.ascensionPhase;

  return {
    ...linnea,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...linnea.skill,
      ...(ascensionPhase >= 1 ? { buffs: [a1LumiFieldBuff] } : {}),
    },
    constellations: linnea.constellations.map((constellation) =>
      constellation.level === 5
        ? { ...constellation, buffs: [c5BurstTalentBuff] }
        : constellation,
    ),
  };
}

export const linneaWithKit = createLinneaDefinition();

export const LINNEA_KIT_METADATA = {
  a1GeoResReduction: LINNEA_A1_GEO_RES_REDUCTION,
  c5BurstTalentLevels: LINNEA_C5_BURST_LEVELS,
  unsupportedChannels: [
    "a1SecondGeoResReductionAfterSummoningLumi",
    "a4ConditionalPartyElementalMastery",
    "c1FieldCatalogStacksAndLunarCrystallizeDamage",
    "c2MoondriftHarmonyCritDamageWindowAndLumiUltimateCritDamage",
    "c4MoondriftHarmonyDefIncrease",
    "c6FieldCatalogStackDoublingAndLunarCrystallizeDamage",
    "p3HydroCrystallizeToLunarCrystallizeConversionAndDefScaling",
    "p4MasterAdventurer",
  ],
} as const;
