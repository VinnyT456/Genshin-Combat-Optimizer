/** Runtime Sethos overlay. Unverified stateful shot mechanics remain unsupported. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sethos } from "../generated/electro";

export function createSethosDefinition(
  constellationLevel = sethos.constellationLevel,
  talentLevels: TalentLevels = sethos.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...sethos,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const sethosWithKit = createSethosDefinition();

export const SETHOS_KIT_METADATA = {
  unsupportedChannels: [
    // Aimed-shot charge timing/energy consumption and Shadowpiercing shot selection
    // require a shot/resource state that the current action contract cannot express.
    "a1AimedShotEnergyChargeAndConsumption",
    "a4ScorchingSandshadeEmDamageAndLifecycle",
    "c1ShadowpiercingShotCritRate",
    "c2EnergyEventElectroDamageStacks",
    "c4MultiTargetPartyElementalMastery",
    "c6EnergyRefundAfterShadowpiercingShot",
    "burstDuskBoltStanceAndTransformedAttacks",
  ],
} as const;
