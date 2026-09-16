/** Runtime Furina overlay for the executable HP and Fanfare channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { furina } from "../generated/hydro";

const FURINA_A4_HP_THRESHOLD = 30_000;
const FURINA_A4_DAMAGE_PER_HP = 0.000007;
const FURINA_A4_MAX_DAMAGE_BONUS = 0.28;
const FURINA_C1_INITIAL_FANFARE = 150;
const FURINA_FANFARE_DAMAGE_PER_POINT = 0.0025;
const FURINA_C1_BUFF_DURATION_SECONDS = 18;

/** Salon member damage from Furina's A4, expressed through the generic conversion seam. */
const a4SalonDamageBuff: Buff = {
  id: "furina-a4-unheard-confession",
  source: "Unheard Confession",
  sourceCharacterId: "furina",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["furina-skill"] },
  conversions: [{
    sourceStat: "hp",
    targetStat: "dmgBonus",
    threshold: FURINA_A4_HP_THRESHOLD,
    ratio: FURINA_A4_DAMAGE_PER_HP,
    maxCap: FURINA_A4_MAX_DAMAGE_BONUS,
  }],
};

/**
 * C1's sourced opening Fanfare is a deterministic initial state. The engine
 * cannot yet gain Fanfare from arbitrary party HP changes, so later dynamic
 * Fanfare and its C2/C4 consumers remain explicitly unsupported below.
 */
const c1InitialFanfareBuff: Buff = {
  id: "furina-c1-love-is-a-rebellious-bird",
  source: "Love Is a Rebellious Bird That None Can Tame",
  sourceCharacterId: "furina",
  startTime: 0,
  duration: FURINA_C1_BUFF_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  conditions: { abilityIds: ["furina-skill", "furina-burst"] },
  modifiers: [{
    stat: "dmgBonus",
    value: FURINA_C1_INITIAL_FANFARE * FURINA_FANFARE_DAMAGE_PER_POINT,
  }],
};

export function createFurinaDefinition(
  constellationLevel = furina.constellationLevel,
  talentLevels: TalentLevels = furina.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? furina.ascensionPhase;

  return {
    ...furina,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: furina.passives.map((passive) =>
      passive.id === "furina-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [a4SalonDamageBuff] }
        : passive,
    ),
    burst: {
      ...furina.burst,
      ...(level >= 1 ? { buffs: [c1InitialFanfareBuff] } : {}),
    },
  };
}

export const furinaWithKit = createFurinaDefinition();

export const FURINA_KIT_METADATA = {
  a4HpThreshold: FURINA_A4_HP_THRESHOLD,
  a4DamagePerHp: FURINA_A4_DAMAGE_PER_HP,
  a4MaximumDamageBonus: FURINA_A4_MAX_DAMAGE_BONUS,
  c1InitialFanfare: FURINA_C1_INITIAL_FANFARE,
  fanfareDamagePerPoint: FURINA_FANFARE_DAMAGE_PER_POINT,
  c1BuffDurationSeconds: FURINA_C1_BUFF_DURATION_SECONDS,
  unsupportedChannels: [
    "a1PartyHealingAfterAllyDeath",
    "salonMemberModeSelectionAndIndependentAttackCadence",
    "fanfareGainFromPartyHpChanges",
    "c2FanfareToMaxHpConversion",
    "c4FanfareEnergyGeneration",
    "c6UniversalSalonInfusionAndHealing",
    "p3AquaticStamina",
  ],
} as const;
