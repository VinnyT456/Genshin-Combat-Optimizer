/** Runtime Lyney overlay for executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { lyney } from "../generated/pyro";

const LYNEY_A4_PYRO_DAMAGE_BONUS = 0.6;

/**
 * Conclusive Ovation's base bonus is expressible as an enemy-aura gate. The
 * additional 20% per other Pyro party member is intentionally not inferred:
 * the current declarative conditions have no party-composition count gate.
 */
const a4ConclusiveOvationBuff: Buff = {
  id: "lyney-a4-conclusive-ovation",
  source: "Conclusive Ovation",
  sourceCharacterId: lyney.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { enemyAuraElements: ["pyro"] },
  modifiers: [{ stat: "dmgBonus", value: LYNEY_A4_PYRO_DAMAGE_BONUS }],
};

export function createLyneyDefinition(
  constellationLevel = lyney.constellationLevel,
  talentLevels: TalentLevels = lyney.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? lyney.ascensionPhase;

  return {
    ...lyney,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    passives: lyney.passives.map((passive) =>
      passive.id === "lyney-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [a4ConclusiveOvationBuff] }
        : passive,
    ),
  };
}

export const lyneyWithKit = createLyneyDefinition();

export const LYNEY_KIT_METADATA = {
  a4PyroDamageBonus: LYNEY_A4_PYRO_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1PropArrowHpConsumptionGrinMalkinEnergyAndDamage",
    "a4AdditionalTwentyPercentPerOtherPyroPartyMember",
    "c1AdditionalGrinMalkinHatAndPropSurplusStack",
    "c2CrispFocusCritDamageStacksAndSwapReset",
    "c4PyroChargedAttackTriggeredPyroResReduction",
    "c6PyrotechnicStrikeReprisedPropArrowFollowUp",
    "p3FontaineResourceMinimapDisplay",
  ],
} as const;
