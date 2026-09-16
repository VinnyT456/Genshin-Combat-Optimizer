/** Runtime Kuki Shinobu kit overlay for the executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { kukiShinobu } from "../generated/electro";

const HEARTS_REPOSE_EM_RATIO = 0.0025;
const C6_LOW_HP_ELEMENTAL_MASTERY = 150;

/** Heart's Repose: Sanctifying Ring damage gains 25% of EM as DMG%. */
const heartsRepose: Buff = {
  id: "kuki-shinobu-a4-hearts-repose",
  source: "Heart's Repose",
  sourceCharacterId: kukiShinobu.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: [kukiShinobu.skill.id] },
  conversions: [{
    sourceStat: "elementalMastery",
    targetStat: "dmgBonus",
    ratio: HEARTS_REPOSE_EM_RATIO,
  }],
};

/** C6's low-HP EM bonus, evaluated only when the scenario supplies HP state. */
const c6LowHpElementalMastery: Buff = {
  id: "kuki-shinobu-c6-low-hp-elemental-mastery",
  source: "To Ward Weakness",
  sourceCharacterId: kukiShinobu.id,
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    abilityIds: [kukiShinobu.skill.id],
    maxHpFractionExclusive: 0.25,
  },
  modifiers: [{ stat: "elementalMastery", value: C6_LOW_HP_ELEMENTAL_MASTERY }],
};

export function createKukiShinobuDefinition(
  constellationLevel = kukiShinobu.constellationLevel,
  talentLevels: TalentLevels = kukiShinobu.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...kukiShinobu,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: kukiShinobu.passives.map((passive) =>
      passive.id === "kuki-shinobu-a4"
        ? { ...passive, buffs: [heartsRepose] }
        : passive,
    ),
    constellations: kukiShinobu.constellations.map((constellation) =>
      constellation.level === 6
        ? { ...constellation, buffs: [c6LowHpElementalMastery] }
        : constellation,
    ),
  };
}

export const kukiShinobuWithKit = createKukiShinobuDefinition();

export const KUKI_SHINOBU_KIT_METADATA = {
  heartsReposeEmRatio: HEARTS_REPOSE_EM_RATIO,
  c6LowHpElementalMastery: C6_LOW_HP_ELEMENTAL_MASTERY,
  unsupportedChannels: [
    "a1LowHpHealingBonus",
    "c1BurstAreaIncrease",
    "c2SanctifyingRingDurationExtension",
    "c4GrassRingCoordinatedAttack",
    "c6LethalDamagePreventionAndTimedTrigger",
    "p3ExpeditionTimeReduction",
  ],
} as const;
