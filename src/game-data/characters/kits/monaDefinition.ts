/** Runtime Mona overlay for the executable, sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { mona } from "../generated/hydro";

const MONA_A4_HYDRO_DAMAGE_PER_ER = 0.2;

/** Waterborne Destiny: 20% of ER becomes Hydro DMG Bonus. */
const a4HydroDamageBuff: Buff = {
  id: "mona-a4-waterborne-destiny",
  source: "Waterborne Destiny",
  sourceCharacterId: "mona",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conversions: [{
    sourceStat: "energyRecharge",
    targetStat: "elementalDmgBonus",
    ratio: MONA_A4_HYDRO_DAMAGE_PER_ER,
    element: "hydro",
  }],
};

export function createMonaDefinition(
  constellationLevel = mona.constellationLevel,
  talentLevels: TalentLevels = mona.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? mona.ascensionPhase;

  return {
    ...mona,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: mona.passives.map((passive) =>
      passive.id === "mona-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [a4HydroDamageBuff] }
        : passive,
    ),
  };
}

export const MONA_KIT_METADATA = {
  a4HydroDamagePerEnergyRecharge: MONA_A4_HYDRO_DAMAGE_PER_ER,
  modelledPerks: ["a4HydroDamageConversion", "c3BurstTalentLevel", "c5SkillTalentLevel"],
  unsupportedChannels: [
    "a1IllusoryTorrentPhantomTrigger",
    "c1OmenReactionEnhancement",
    "c2NormalAttackChargedAttackProc",
    "c4OmenConditionalCritRate",
    "c6MovementDurationChargedAttackBonus",
    "p3CraftingMaterialRefund",
    "p4HexereiAstralGlowAndOmenExtension",
  ],
} as const;

export const monaWithKit = createMonaDefinition();
