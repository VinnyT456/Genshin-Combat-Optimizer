/** Runtime Ganyu overlay for the executable charged-shot and burst-field buffs. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { ganyu } from "../generated/cryo";

const GANYU_A1_CHARGED_CRIT_RATE = 0.2;
const GANYU_A1_DURATION_SECONDS = 5;
const GANYU_A4_CRYO_DAMAGE_BONUS = 0.2;
const GANYU_A4_DURATION_SECONDS = 15;

const a1ChargedCritRateBuff: Buff = {
  id: "ganyu-a1-undivided-heart",
  source: "Undivided Heart",
  sourceCharacterId: "ganyu",
  startTime: 0,
  duration: GANYU_A1_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { damageTypes: ["charged"] },
  modifiers: [{ stat: "critRate", value: GANYU_A1_CHARGED_CRIT_RATE }],
};

const a4CryoFieldBuff: Buff = {
  id: "ganyu-a4-harmony-between-heaven-and-earth",
  source: "Harmony Between Heaven and Earth",
  sourceCharacterId: "ganyu",
  startTime: 0,
  duration: GANYU_A4_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active" },
  conditions: { elements: ["cryo"] },
  modifiers: [{ stat: "elementalDmgBonus", element: "cryo", value: GANYU_A4_CRYO_DAMAGE_BONUS }],
};

export function createGanyuDefinition(
  constellationLevel = ganyu.constellationLevel,
  talentLevels: TalentLevels = ganyu.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? ganyu.ascensionPhase;
  const chargedAttack = ganyu.chargedAttack;
  if (chargedAttack === undefined) throw new Error("Ganyu charged attack is missing from generated data");

  return {
    ...ganyu,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: ganyu.passives.map((passive) => {
      if (passive.id === "ganyu-a1") {
        return {
          ...passive,
          // A1 is materialized by the charged attack below, after that shot
          // resolves; making it a passive-owned buff would boost shot one.
          buffs: [],
        };
      }
      if (passive.id === "ganyu-a4") {
        return {
          ...passive,
          // The field only exists after Celestial Shower is cast; its buff is
          // therefore attached to the burst below, not active from time zero.
          buffs: [],
        };
      }
      return passive;
    }),
    chargedAttack: {
      ...chargedAttack,
      ...(ascensionPhase >= 1 ? { buffs: [a1ChargedCritRateBuff] } : {}),
    },
    burst: {
      ...ganyu.burst,
      ...(ascensionPhase >= 4 ? { buffs: [a4CryoFieldBuff] } : {}),
    },
  };
}

export const ganyuWithKit = createGanyuDefinition();

export const GANYU_KIT_METADATA = {
  a1ChargedCritRate: GANYU_A1_CHARGED_CRIT_RATE,
  a1DurationSeconds: GANYU_A1_DURATION_SECONDS,
  a4CryoDamageBonus: GANYU_A4_CRYO_DAMAGE_BONUS,
  a4DurationSeconds: GANYU_A4_DURATION_SECONDS,
  unsupportedChannels: [
    "c1FrostflakeArrowCryoResistanceReduction",
    "c2SkillChargeCount",
    "c4CelestialShowerDamageTakenStacks",
    "c6InstantChargeAfterSkill",
    "p3CraftingBowRefund",
  ],
} as const;
