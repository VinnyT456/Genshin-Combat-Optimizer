/** Runtime Venti overlay for generated, executable talent-level constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { venti } from "../generated/anemo";

/**
 * Venti's sourced C3/C5 talent boosts are already represented by generated
 * constellation buffs. Keep this factory as the stable overlay seam and make
 * the requested constellation/talent inputs explicit for simulations.
 */
export function createVentiDefinition(
  constellationLevel = venti.constellationLevel,
  talentLevels: TalentLevels = venti.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...venti,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const VENTI_KIT_METADATA = {
  executableConstellations: ["c3BurstTalentLevels", "c5SkillTalentLevels"],
  unsupportedChannels: [
    // C1/C2/C6 source rows conflict across the configured verifiers.
    "c1AimedShotExtraArrowsConflictingSourceNumbers",
    "c2SkillHitAndLaunchedTargetResistanceReductionConflictingSourceNumbers",
    "c6BurstResistanceReductionConflictingSourceNumbersAndAbsorptionState",
    // C4 requires pickup events; C6 would additionally require burst-hit debuffs.
    "c4ParticlePickupAnemoDamageBonus",
    "a1HoldSkillUpcurrent",
    "a4BurstEndEnergyAndAbsorbedElementDistribution",
    "p3GlidingStaminaReduction",
    "p4HexereiSwirlTriggeredCharacterAndStormeyeDamage",
  ],
} as const;

export const ventiWithKit = createVentiDefinition();
