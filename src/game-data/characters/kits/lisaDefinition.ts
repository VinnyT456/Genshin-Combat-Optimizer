/** Runtime Lisa kit overlay for the executable talent-level constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { lisa } from "../generated/electro";

const C3_BURST_TALENT_LEVELS = 3;
const C5_SKILL_TALENT_LEVELS = 3;

/**
 * Lisa's generated C3/C5 buffs are already authored in the generic vocabulary.
 * Keeping them on the generated constellation rows lets the normal perk resolver
 * gate them by constellation level and apply the boosts at cast time.
 */
export function createLisaDefinition(
  constellationLevel = lisa.constellationLevel,
  talentLevels: TalentLevels = lisa.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...lisa,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Retain generated C3/C5 rows; unsupported effects remain inert rather than
    // inventing a lifecycle/status channel that the engine cannot represent.
    constellations: lisa.constellations.map((constellation) => ({
      ...constellation,
      ...(constellation.level === 3
        ? { buffs: lisa.constellations.find((entry) => entry.level === 3)?.buffs }
        : constellation.level === 5
          ? { buffs: lisa.constellations.find((entry) => entry.level === 5)?.buffs }
          : {}),
    })),
  };
}

export const lisaWithKit = createLisaDefinition();

export const LISA_KIT_METADATA = {
  c3BurstTalentLevels: C3_BURST_TALENT_LEVELS,
  c5SkillTalentLevels: C5_SKILL_TALENT_LEVELS,
  unsupportedChannels: [
    "a1ChargedAttackConductiveStatus",
    "a4PostBurstEnemyDefReduction",
    "c1HoldSkillEnergyRegeneration",
    "c2HoldSkillDefAndInterruptionResistance",
    "c4BurstAdditionalLightningBolts",
    "c6OnFieldConductiveStacks",
    "p3PotionMaterialRefund",
  ],
} as const;
