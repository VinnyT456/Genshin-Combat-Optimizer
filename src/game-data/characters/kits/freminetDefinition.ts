/** Runtime Freminet overlay for the executable, sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { freminet } from "../generated/cryo";

const C1_PRESSURIZED_FLOE_CRIT_RATE = 0.15;

/**
 * C1's Pressurized Floe crit-rate increase has an ability-level condition in
 * the current vocabulary. It therefore applies to the generated skill cast
 * (including its sourced pressure rows), rather than inventing a pressure
 * timer or a per-instance predicate.
 */
const c1PressurizedFloeBuff: Buff = {
  id: "freminet-c1-pressurized-floe-crit-rate",
  source: "Dreams of the Foamy Deep",
  sourceCharacterId: "freminet",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["freminet-skill"] },
  modifiers: [{ stat: "critRate", value: C1_PRESSURIZED_FLOE_CRIT_RATE }],
};

export function createFreminetDefinition(
  constellationLevel = freminet.constellationLevel,
  talentLevels: TalentLevels = freminet.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...freminet,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    constellations: freminet.constellations.map((constellation) =>
      constellation.id === "freminet-c1" && level >= 1
        ? { ...constellation, buffs: [c1PressurizedFloeBuff] }
        : constellation,
    ),
  };
}

export const freminetWithKit = createFreminetDefinition();

export const FREMINET_KIT_METADATA = {
  c1PressurizedFloeCritRate: C1_PRESSURIZED_FLOE_CRIT_RATE,
  unsupportedChannels: [
    "a1PressureLevelBelowFourCooldownReduction",
    "a4ShatterTriggeredPressurizedFloeDamageBonus",
    "c2PressureLevelEnergyRestoration",
    "c4ReactionTriggeredAtkStacks",
    "c6ReactionTriggeredCritDmgStacks",
    "p3AquaticStaminaReduction",
  ],
} as const;
