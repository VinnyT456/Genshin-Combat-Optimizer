/** Runtime Ineffa overlay for the executable talent-level constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { ineffa } from "../generated/electro";

/**
 * Build Ineffa's generic definition at a selected constellation/talent level.
 *
 * The generated record already contains the declarative C3/C5 talent boosts;
 * this overlay preserves those buffs while making the runtime construction
 * explicit and keeping the unsupported stateful effects fail-closed.
 */
export function createIneffaDefinition(
  constellationLevel = ineffa.constellationLevel,
  talentLevels: TalentLevels = ineffa.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...ineffa,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // C3/C5 are sourced talent-level buffs and are activated by the shared
    // activeConstellations() resolver. Other generated rows remain empty:
    // their effects require state/lifecycle channels not present in the
    // current runtime (see INEFFA_KIT_METADATA.unsupportedChannels).
    constellations: ineffa.constellations.map((constellation) => {
      if (constellation.id === "ineffa-c3") {
        return {
          ...constellation,
          buffs: level >= 3 ? constellation.buffs : [],
        };
      }
      if (constellation.id === "ineffa-c5") {
        return {
          ...constellation,
          buffs: level >= 5 ? constellation.buffs : [],
        };
      }
      return constellation;
    }),
  };
}

export const INEFFA_KIT_METADATA = {
  executableConstellations: ["ineffa-c3", "ineffa-c5"],
  unsupportedChannels: [
    "a1ThundercloudLunarChargedAdditionalAttack",
    "a4ParameterPermutationSourceAtkToPartyEm",
    "c1CarrierFlowCompositeLunarChargedBonus",
    "c2PunishmentEdictDelayedAoEDamageAndShield",
    "c4LunarChargedEnergyRecovery",
    "c6ThundercloudTriggeredAoEDamage",
    "p3ElectroChargedToLunarChargedConversionAndMoonsign",
    "p4FoodSeasoningProcAndAppearance",
  ],
} as const;

export const ineffaWithKit = createIneffaDefinition();
