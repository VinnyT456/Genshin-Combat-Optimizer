/** Runtime Varesa overlay for sourced, directly representable damage effects. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { varesa } from "../generated/electro";

const VARESA_C6_CRIT_RATE = 0.1;
const VARESA_C6_CRIT_DMG = 1;

function c6DamageBuff(): Buff {
  return {
    id: "varesa-c6-plunge-burst-crit",
    source: "A Hero of Justice's Triumph",
    sourceCharacterId: "varesa",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { damageTypes: ["plunge", "burst"] },
    modifiers: [
      { stat: "critRate", value: VARESA_C6_CRIT_RATE },
      { stat: "critDmg", value: VARESA_C6_CRIT_DMG },
    ],
  };
}

export function createVaresaDefinition(
  constellationLevel = varesa.constellationLevel,
  talentLevels: TalentLevels = varesa.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...varesa,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    constellations: varesa.constellations.map((constellation) =>
      constellation.id === "varesa-c6"
        ? { ...constellation, buffs: level >= 6 ? [c6DamageBuff()] : [] }
        : constellation,
    ),
  };
}

export const VARESA_KIT_METADATA = {
  c6CritRate: VARESA_C6_CRIT_RATE,
  c6CritDmg: VARESA_C6_CRIT_DMG,
  unsupportedChannels: [
    "a1RainbowCrashGroundImpactAdditiveDamageAndConsumption",
    "a4NightsoulBurstAtkStacks",
    "c1SpecialPlungeRainbowCrashAndNightsoulCostReduction",
    "c2PlungeTriggeredApexDriveAndEnergyRefund",
    "c4BurstCastStateDependentDamageAndGroundImpactBuff",
    "c6ApexDriveEnergyRefundAndNightsoulRestoration",
    "nightsoulAndFieryPassionStateLifecycle",
  ],
} as const;

export const varesaWithKit = createVaresaDefinition();
