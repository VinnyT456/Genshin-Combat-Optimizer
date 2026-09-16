/** Runtime Illuga overlay for the executable Lightkeeper's Oath channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { illuga } from "../generated/geo";

const LIGHTKEEPERS_OATH_DURATION_SECONDS = 20;
const LIGHTKEEPERS_OATH_CRIT_RATE = 0.05;
const LIGHTKEEPERS_OATH_CRIT_DAMAGE = 0.1;
const NIGHTMARE_ORIOLES_CRIT_RATE = 0.1;
const NIGHTMARE_ORIOLES_CRIT_DAMAGE = 0.3;

/**
 * Lightkeeper's Oath is created by Illuga's Skill/Burst and affects other
 * active party members' Geo damage. The generated passive prose also has a
 * Moonsign/field-state EM clause; that state has no runtime seam yet and is
 * intentionally not inferred here.
 */
function lightkeepersOathBuff(constellationLevel: number): Buff {
  return {
    id: "illuga-a1-lightkeepers-oath",
    source: "Torchforger's Covenant",
    sourceCharacterId: "illuga",
    startTime: 0,
    duration: LIGHTKEEPERS_OATH_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "active", excludeSource: true },
    conditions: { elements: ["geo"] },
    modifiers: [
      { stat: "critRate", value: LIGHTKEEPERS_OATH_CRIT_RATE + (constellationLevel >= 6 ? NIGHTMARE_ORIOLES_CRIT_RATE : 0) },
      { stat: "critDmg", value: LIGHTKEEPERS_OATH_CRIT_DAMAGE + (constellationLevel >= 6 ? NIGHTMARE_ORIOLES_CRIT_DAMAGE : 0) },
    ],
  };
}

export function createIllugaDefinition(
  constellationLevel = illuga.constellationLevel,
  talentLevels: TalentLevels = illuga.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? illuga.ascensionPhase;
  const oath = ascensionPhase >= 1 ? [lightkeepersOathBuff(level)] : undefined;

  return {
    ...illuga,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: illuga.passives,
    skill: { ...illuga.skill, ...(oath ? { buffs: oath } : {}) },
    burst: { ...illuga.burst, ...(oath ? { buffs: oath } : {}) },
  };
}

export const illugaWithKit = createIllugaDefinition();

export const ILLUGA_KIT_METADATA = {
  lightkeepersOathDurationSeconds: LIGHTKEEPERS_OATH_DURATION_SECONDS,
  lightkeepersOathCritRate: LIGHTKEEPERS_OATH_CRIT_RATE,
  lightkeepersOathCritDamage: LIGHTKEEPERS_OATH_CRIT_DAMAGE,
  c6CritRate: NIGHTMARE_ORIOLES_CRIT_RATE,
  c6CritDamage: NIGHTMARE_ORIOLES_CRIT_DAMAGE,
  unsupportedChannels: [
    "a1MoonsignAscendantGleamPartyElementalMastery",
    "a4NightingaleSongDamageAndLunarCrystallizeScaling",
    "c1GeoReactionEnergyRestoration",
    "c2AedonStackTriggeredBurstDamage",
    "c4ActivePartyDefenseBonus",
    "p3MoonsignLevel",
    "p4NightSwiftStride",
  ],
} as const;
