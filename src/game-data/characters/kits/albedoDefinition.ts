/** Runtime Albedo kit overlay for the sourced Homuncular Nature buff. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { albedo } from "../generated/geo";

const HOMUNCULAR_NATURE_DURATION = 10;
const HOMUNCULAR_NATURE_EM = 125;

/** Homuncular Nature's party EM buff, created after Albedo casts his Burst. */
const homuncularNatureBuff: Buff = {
  id: "albedo-a4-homuncular-nature",
  source: "Homuncular Nature",
  sourceCharacterId: "albedo",
  startTime: 0,
  duration: HOMUNCULAR_NATURE_DURATION,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [{ stat: "elementalMastery", value: HOMUNCULAR_NATURE_EM }],
};

export function createAlbedoDefinition(
  constellationLevel = albedo.constellationLevel,
  talentLevels: TalentLevels = albedo.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...albedo,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: albedo.passives,
    burst: {
      ...albedo.burst,
      buffs: [homuncularNatureBuff],
    },
  };
}

export const ALBEDO_A4_METADATA = {
  durationSeconds: HOMUNCULAR_NATURE_DURATION,
  elementalMastery: HOMUNCULAR_NATURE_EM,
} as const;

export const albedoWithKit = createAlbedoDefinition();
