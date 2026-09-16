/** Runtime overlay for Mizuki's sourced damage kit and talent-boost constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { yumemizukiMizuki } from "../generated/anemo";

export function createYumemizukiMizukiDefinition(
  constellationLevel = yumemizukiMizuki.constellationLevel,
  talentLevels: TalentLevels = yumemizukiMizuki.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...yumemizukiMizuki,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
    // C3 skill and C5 burst level buffs come from the generated source rows
    // and are activated by the engine only at their exact constellation gates.
    // Dreamdrifter movement, Swirl extensions, and snack quotas need state the
    // generic runtime does not expose, so they deliberately remain unsupported.
  };
}

export const yumemizukiMizukiWithKit = createYumemizukiMizukiDefinition();
