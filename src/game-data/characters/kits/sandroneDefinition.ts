/** Runtime Sandrone overlay for the two sourced, executable talent boosts. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sandrone } from "../generated/cryo";

/**
 * Preserve generated talent rows and perk buff channels. The only currently
 * executable Sandrone perks are the generated C3 Normal and C5 Burst boosts;
 * stateful Decoding/Radiance effects remain unsupported until their resource
 * and reaction state can be established from verified source data.
 */
export function createSandroneDefinition(
  constellationLevel = sandrone.constellationLevel,
  talentLevels: TalentLevels = sandrone.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...sandrone,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const SANDRONE_KIT_SUPPORT = {
  modeledConstellations: [3, 5],
  unsupportedPerks: ["a1", "a4", "c1", "c2", "c4", "c6", "p3"],
  unsupportedReason:
    "requires unverified Decoding Power, Refined Tactics, Radiance state, or Stellar Glimmer reaction behavior",
} as const;

export const sandroneWithKit = createSandroneDefinition();
