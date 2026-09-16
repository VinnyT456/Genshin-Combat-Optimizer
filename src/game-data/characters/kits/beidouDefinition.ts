/** Runtime Beidou kit overlay for the sourced talent-level constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { beidou } from "../generated/electro";

/**
 * Builds Beidou's executable definition while preserving the generated
 * damage tables and the generated C3/C5 talent-level buff declarations.
 *
 * The other Beidou perks intentionally remain fail-closed: their sourced
 * effects require perfect-counter/incoming-hit state, multi-target routing,
 * or a disputed RES value that the current generic contract cannot represent.
 */
export function createBeidouDefinition(
  constellationLevel = beidou.constellationLevel,
  talentLevels: TalentLevels = beidou.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...beidou,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const beidouWithKit = createBeidouDefinition();

export const BEIDOU_KIT_METADATA = {
  c3SkillTalentLevels: 3,
  c5BurstTalentLevels: 3,
  unsupportedPerks: ["beidou-a1", "beidou-a4", "beidou-c1", "beidou-c2", "beidou-c4", "beidou-c6", "beidou-p3", "beidou-p4"],
} as const;
