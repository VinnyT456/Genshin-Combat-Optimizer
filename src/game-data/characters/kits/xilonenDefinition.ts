/** Runtime Xilonen kit overlay for the currently executable sourced kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { xilonen } from "../generated/geo";

/**
 * Source-Sample/Nightsoul gates (A1, A4, C2, C4 and C6) are deliberately not
 * synthesized here: the generic runtime does not represent those states or
 * C4's per-character six-hit additive DEF damage quota. The generated C3/C5
 * talent-level buffs remain the only supported constellation effects.
 */
export function createXilonenDefinition(
  constellationLevel = xilonen.constellationLevel,
  talentLevels: TalentLevels = xilonen.talentLevels,
): GenericCharacterDefinition {
  return {
    ...xilonen,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const xilonenWithKit = createXilonenDefinition();
