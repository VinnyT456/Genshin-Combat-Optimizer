/** Sourced baseline runtime definition for Zibai. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { zibai } from "../generated/geo";

/**
 * The two verified constellation talent boosts are already emitted as generic
 * buffs. Other perk prose is intentionally not translated into runtime effects:
 * it depends on unsupported Phase Shift/Lunar-Crystallize state or is unverified.
 */
export function createZibaiDefinition(
  constellationLevel = zibai.constellationLevel,
  talentLevels: TalentLevels = zibai.talentLevels,
): GenericCharacterDefinition {
  return {
    ...zibai,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const zibaiWithKit = createZibaiDefinition();

export const ZIBAI_KIT_METADATA = {
  unsupportedMechanics: [
    "A1 Selenic Descent timed DEF additive damage to Spirit Steed's Stride 2nd hit; source marks the prose unverified",
    "A4 party-composition-gated DEF and Elemental Mastery bonuses; party-element input is unavailable and source marks the prose unverified",
    "C1 Phase Shift Radiance grant, additional Stride use, and first-use Lunar-Crystallize bonus; Phase Shift state is unavailable and source marks the prose unverified",
    "C2 Lunar-Crystallize reaction bonus and A1 enhancement; reaction type and Phase Shift state are unsupported and source marks the prose unverified",
    "C4 Normal Attack sequence persistence and hit-triggered Scattermoon Splendor follow-up; stateful hit quota is unsupported and source marks the prose unverified",
    "C6 Phase Shift Radiance gain/consumption and temporary damage scaling; resource state is undeclared and source marks the prose unverified",
    "P3 Hydro Crystallize conversion to Lunar-Crystallize and DEF scaling; reaction conversion is unsupported and source marks the prose unverified",
    "P4 out-of-combat nighttime Energy restoration; time-of-day and domain/combat gating are unavailable",
  ],
} as const;
