/** Runtime Ifa kit overlay for the executable C4 and talent-level seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { ifa } from "../generated/anemo";

const IFA_C4_ELEMENTAL_MASTERY = 100;
const IFA_C4_DURATION_SECONDS = 15;

/** C4's EM is granted after the Burst hits and therefore affects later reactions. */
const c4ElementalMasteryBuff: Buff = {
  id: "ifa-c4-decayed-vessel-elemental-mastery",
  source: "Decayed Vessel's Permutation",
  sourceCharacterId: "ifa",
  startTime: 0,
  duration: IFA_C4_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "elementalMastery", value: IFA_C4_ELEMENTAL_MASTERY }],
};

export function createIfaDefinition(
  constellationLevel = ifa.constellationLevel,
  talentLevels: TalentLevels = ifa.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...ifa,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...ifa.burst,
      ...(level >= 4 ? { buffs: [c4ElementalMasteryBuff] } : {}),
    },
  };
}

export const IFA_KIT_METADATA = {
  c4ElementalMastery: IFA_C4_ELEMENTAL_MASTERY,
  c4DurationSeconds: IFA_C4_DURATION_SECONDS,
  unsupportedChannels: [
    "a1RescueEssentialsResourceAndReactionDamageBonus",
    "a4NightsoulBurstTriggeredElementalMastery",
    "nightsoulBlessingAndPhlogistonLifecycle",
    "c1SupportingFireEnergyRestoration",
    "c2RescueEssentialsResourceGainAndLimit",
    "c4RestrainingWindCurrentDurationExtension",
    "c6HoldSupportingFireChanceAndAdditionalTonicshot",
    "p4ConditionalPhlogistonHealing",
  ],
} as const;

export const ifaWithKit = createIfaDefinition();
