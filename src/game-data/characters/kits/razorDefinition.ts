/** Runtime Razor kit overlay for sourced, executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { razor } from "../generated/electro";

export function createRazorDefinition(
  constellationLevel = razor.constellationLevel,
  talentLevels: TalentLevels = razor.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...razor,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Generated constellation buffs already encode C3 burst / C5 skill levels;
    // retain them and let the shared active-constellation gate apply them.
    constellations: razor.constellations,
  };
}

export const RAZOR_KIT_METADATA = {
  unsupportedChannels: [
    "a1SkillCooldownReductionAndBurstReset",
    "a4EnergyRechargeBelowHalfEnergy",
    "c1DamageBonusAfterParticlePickup",
    "c2CritRateAgainstLowHpEnemy",
    "c4SkillHitDefenseReduction",
    "c6PeriodicChargedNormalAttackAndElectroSigilOverflow",
    "hexereiBurstAndSigilEffects",
  ],
} as const;

export const razorWithKit = createRazorDefinition();
