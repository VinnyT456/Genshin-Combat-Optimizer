/** Runtime Rosaria kit overlay for sourced, executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { rosaria } from "../generated/cryo";

export function createRosariaDefinition(
  constellationLevel = rosaria.constellationLevel,
  talentLevels: TalentLevels = rosaria.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...rosaria,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Generated C3/C5 buffs carry the sourced skill/burst talent boosts.
    constellations: rosaria.constellations,
  };
}

export const ROSARIA_KIT_METADATA = {
  unsupportedChannels: [
    "a1RearAttackCritRateWindow",
    "a4CastTimeCritRateTransferToParty",
    "c1CritTriggeredNormalDamageAndAttackSpeedWindow",
    "c2IceLanceDurationAndAdditionalTicks",
    "c4SkillCritEnergyRefundOncePerCast",
    "c6BurstHitPhysicalResistanceReductionWindow",
    "p3NighttimeMovementSpeed",
  ],
} as const;

export const rosariaWithKit = createRosariaDefinition();
