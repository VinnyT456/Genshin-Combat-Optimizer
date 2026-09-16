/** Runtime Durin overlay for the executable portions of his sourced kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { durin } from "../generated/pyro";

const DURIN_C4_BURST_DAMAGE_BONUS = 0.4;
const DURIN_C6_BURST_DEF_IGNORE = 0.3;

function c4BurstDamageBuff(): Buff {
  return {
    id: "durin-c4-burst-damage",
    source: "Emanare's Source",
    sourceCharacterId: "durin",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { damageTypes: ["burst"] },
    modifiers: [{ stat: "dmgBonus", value: DURIN_C4_BURST_DAMAGE_BONUS }],
  };
}

function c6BurstDefIgnoreBuff(): Buff {
  return {
    id: "durin-c6-burst-def-ignore",
    source: "Dual Birth",
    sourceCharacterId: "durin",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { damageTypes: ["burst"] },
    // The generic enemy-modifier seam executes this unconditional first clause.
    // Form-specific enhancements remain unsupported below.
    enemyModifiers: [{ key: "defIgnore", value: DURIN_C6_BURST_DEF_IGNORE }],
  };
}

export function createDurinDefinition(
  constellationLevel = durin.constellationLevel,
  talentLevels: TalentLevels = durin.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...durin,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    constellations: durin.constellations.map((constellation) => {
      if (constellation.id === "durin-c4") {
        return { ...constellation, buffs: level >= 4 ? [c4BurstDamageBuff()] : [] };
      }
      if (constellation.id === "durin-c6") {
        return { ...constellation, buffs: level >= 6 ? [c6BurstDefIgnoreBuff()] : [] };
      }
      return constellation;
    }),
  };
}

export const durinWithKit = createDurinDefinition();

export const DURIN_KIT_METADATA = {
  c4BurstDamageBonus: DURIN_C4_BURST_DAMAGE_BONUS,
  c6BurstDefIgnore: DURIN_C6_BURST_DEF_IGNORE,
  unsupportedChannels: [
    "a1FormDependentBurningShredAndVaporizeMeltBonus",
    "a4PeriodicAttackPrimordialFusionStacks",
    "c1FormDependentCycleOfEnlightenmentTriggers",
    "c2ReactionTriggeredPartyElementalDamageBuff",
    "c4CycleOfEnlightenmentConsumptionRefundChance",
    "c6FormSpecificAdditionalDefIgnoreAndPostHitDefShred",
    "p4HexereiPartyRequirementAndPassiveEnhancement",
  ],
} as const;
