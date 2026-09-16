/** Runtime overlay for Kokomi's sourced talent-level constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sangonomiyaKokomi } from "../generated/hydro";

/**
 * Build Kokomi's executable character definition. The generated rows own her
 * talent tables and C3/C5 talent-level modifiers; unsupported conditional
 * perks are deliberately not approximated here.
 */
export function createSangonomiyaKokomiDefinition(
  constellationLevel = sangonomiyaKokomi.constellationLevel,
  talentLevels: TalentLevels = sangonomiyaKokomi.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...sangonomiyaKokomi,
    ...overrides,
    constellationLevel: level,
    talentLevels,
  };
}

export const sangonomiyaKokomiWithKit = createSangonomiyaKokomiDefinition();

export const SANGONOMIYA_KOKOMI_KIT_METADATA = {
  modeledConstellations: [3, 5],
  unsupportedPerks: [
    "a1-bake-kurage-duration-refresh: requires persistent skill-field lifecycle state",
    "a4-song-of-pearls: garment-gated HP/Healing-Bonus normal and charged damage scaling is not represented by the runtime",
    "c1-fish-proc: combo-final-normal conditional extra hit has unverified mapping; omitted",
    "c2-low-hp-healing: healing effect does not affect damage and low-HP healing state is unavailable",
    "c4-garment-speed-energy: attack-speed and hit-triggered energy lifecycle are unavailable",
    "c6-high-hp-hydro-bonus: garment, healing, and ally-HP gates are unavailable",
    "p3-swimming-stamina: outside damage simulation",
    "p4-flawless-strategy: healing bonus/crit-rate penalty channels are not compiled by this overlay",
  ],
} as const;
