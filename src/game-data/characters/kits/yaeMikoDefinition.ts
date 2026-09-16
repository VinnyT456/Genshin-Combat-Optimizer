/** Runtime Yae Miko overlay with sourced unconditional damage and gated talents. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { yaeMiko } from "../generated/electro";

export function createYaeMikoDefinition(
  constellationLevel = yaeMiko.constellationLevel,
  talentLevels: TalentLevels = yaeMiko.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...yaeMiko,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Skill casts place Sakura; damage requires a later, stateful lightning
    // interval. Do not misrepresent a placement as four simultaneous hits.
    skill: { ...yaeMiko.skill, instances: [] },
    // The first Burst hit is unconditional; each following bolt depends on a
    // destroyed Sakura count, which this runtime does not track.
    burst: { ...yaeMiko.burst, instances: yaeMiko.burst.instances.slice(0, 1) },
  };
}

export const YAE_MIKO_KIT_METADATA = {
  unsupportedChannels: [
    "skillSesshouSakuraPlacementCountAndIntervalDamage",
    "burstTenkoThunderboltCountFromDestroyedSakura",
    "a1SakuraChargeCooldownReset",
    "a4ElementalMasteryToSakuraDamageConversion",
    "c1TenkoThunderboltEnergyRestoration",
    "c2SakuraStartingAndMaximumLevelAndRange",
    "c4LightningTriggeredPartyElectroDamageBonus",
    "c6SakuraDefenseIgnore",
    "p3CraftingProbability",
    "p4ReactionTriggeredSakuraEnhancementAndDuration",
  ],
} as const;

export const yaeMikoWithKit = createYaeMikoDefinition();
