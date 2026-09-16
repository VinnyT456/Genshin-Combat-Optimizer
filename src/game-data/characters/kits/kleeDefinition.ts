/** Runtime Klee overlay for the executable portions of her sourced kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { klee } from "../generated/pyro";

const C2_DEF_REDUCTION = 0.23;
const C2_DURATION_SECONDS = 10;

/**
 * Explosive Frags is authored on Jumpy Dumpty. Cast-owned buffs begin after
 * the cast's own hits, matching the engine lifecycle and allowing subsequent
 * attacks to observe the mine-triggered DEF reduction.
 */
function c2ExplosiveFragsBuff(): Buff {
  return {
    id: "klee-c2-explosive-frags",
    source: "Explosive Frags",
    sourceCharacterId: klee.id,
    startTime: 0,
    duration: C2_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    enemyModifiers: [{ key: "defReduction", value: C2_DEF_REDUCTION }],
  };
}

export function createKleeDefinition(
  constellationLevel = klee.constellationLevel,
  talentLevels: TalentLevels = klee.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...klee,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...klee.skill,
      ...(level >= 2 ? { buffs: [c2ExplosiveFragsBuff()] } : {}),
    },
    // Keep the generated C3/C5 talent-level buffs and gate only the overlay's
    // executable C2 channel here. Other Klee effects remain fail-closed.
    constellations: klee.constellations,
  };
}

export const kleeWithKit = createKleeDefinition();

export const KLEE_KIT_METADATA = {
  c2DefReduction: C2_DEF_REDUCTION,
  c2DurationSeconds: C2_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ExplosiveSparkChanceAndChargedAttackDamage",
    "a4ChargedAttackCritTriggeredPartyEnergy",
    "c1SparksSummonedByAttacksAndSkills",
    "c4OffFieldBurstDepartureExplosion",
    "c6PartyEnergyRegenerationDuringBurst",
    "c6PartyPyroDamageBonus",
    "p3MondstadtResourceMinimapDisplay",
    "p4HexereiPartyRequirementBoomBadgesAndBoomBoomStrike",
  ],
} as const;
