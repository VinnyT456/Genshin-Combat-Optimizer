/** Runtime Dahlia overlay for the executable, source-verified damage kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { dahlia } from "../generated/hydro";

/**
 * Dahlia's generated definition already contains the complete verified damage
 * tables and the executable C3/C5 talent-level buffs. This wrapper provides
 * the same runtime seam as other character-specific definitions so website
 * progression and direct engine callers cannot fall back to a lossy legacy
 * projection.
 */
export function createDahliaDefinition(
  constellationLevel = dahlia.constellationLevel,
  talentLevels: TalentLevels = dahlia.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...dahlia,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const dahliaWithKit = createDahliaDefinition();

export const DAHLIA_KIT_METADATA = {
  /** These generated rows are the only Dahlia perks with a damage-model channel. */
  modelledPerks: ["c3BurstTalentLevel", "c5SkillTalentLevel"],
  unsupportedChannels: [
    "a1FrozenReactionBenisonAndEnergy",
    "a4FavonianFavorAttackSpeed",
    "c1BenisonEnergy",
    "c2ShieldStrength",
    "c4FavonianFavorDuration",
    "c6AttackSpeedAndRevive",
    "p3MovementSpeed",
  ],
} as const;
