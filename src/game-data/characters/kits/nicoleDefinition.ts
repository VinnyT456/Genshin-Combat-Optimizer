/** Runtime Nicole overlay for the executable, source-verified channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { nicole } from "../generated/pyro";

const NICOLE_A1_ATK_BONUS = 300;
const NICOLE_A1_DURATION_SECONDS = 20;

/**
 * Methexis' explicit ATK amount is executable, but its observation lifecycle
 * is not. The active-target gate is the closest available declarative seam:
 * it buffs another active party member after Nicole's Skill cast and never
 * leaks the buff onto Nicole herself while she remains on field.
 */
const a1Buff: Buff = {
  id: "nicole-a1-methexis",
  source: "Methexis",
  sourceCharacterId: nicole.id,
  startTime: 0,
  duration: NICOLE_A1_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active", excludeSource: true },
  modifiers: [{ stat: "atkFlat", value: NICOLE_A1_ATK_BONUS }],
};

export function createNicoleDefinition(
  constellationLevel = nicole.constellationLevel,
  talentLevels: TalentLevels = nicole.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? nicole.ascensionPhase;

  return {
    ...nicole,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...nicole.skill,
      ...(ascensionPhase >= 1 ? { buffs: [a1Buff] } : {}),
    },
  };
}

export const NICOLE_KIT_METADATA = {
  a1AtkBonus: NICOLE_A1_ATK_BONUS,
  a1DurationSeconds: NICOLE_A1_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ObservationThreeSecondTimingAndHexereiImmediateUpgrade",
    "a4ElementalHitTriggeredGuidanceUpgrade",
    "c1ElementalTypeCoordinatedArcaneProjection",
    "c2GuidanceAtkBonusAndElementalResistanceReduction",
    "c4PathfindersBlessingStackedDamageBonus",
    "c6PartyGuidancePropagationAndDefIgnore",
    "p3OutOfCombatTreasureCompassChargedAttack",
    "p4HexereiCharacterAndSecretRitePartyState",
  ],
} as const;

export const nicoleWithKit = createNicoleDefinition();
