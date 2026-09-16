/** Runtime Yanfei overlay for generated damage rows and supported talent boosts. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { yanfei } from "../generated/pyro";

/**
 * Seal-dependent effects are intentionally not inferred: the runtime does not
 * track Scarlet Seals or their consumption. This leaves A1/A4 and C1/C6
 * charged-attack adjustments inactive; only generated C3 Skill and C5 Burst
 * talent-level buffs execute.
 */
export function createYanfeiDefinition(
  constellationLevel = yanfei.constellationLevel,
  talentLevels: TalentLevels = yanfei.talentLevels,
): GenericCharacterDefinition {
  return {
    ...yanfei,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const yanfeiWithKit = createYanfeiDefinition();

export const YANFEI_KIT_METADATA = {
  unsupportedMechanics: [
    "Scarlet Seal generation, cap, consumption, and seal-count charged-attack scaling",
    "A1 Proviso charged-attack CRIT DMG while consuming Scarlet Seals",
    "A4 Blazing Eye follow-up hit after a CRIT charged attack",
    "C1 charged-attack interruption resistance and stamina reduction",
    "C2 charged-attack CRIT Rate against low-HP enemies",
    "C4 burst shield amount, duration, and absorption state",
    "C6 additional Scarlet Seal and corresponding charged-attack scaling",
  ],
} as const;
