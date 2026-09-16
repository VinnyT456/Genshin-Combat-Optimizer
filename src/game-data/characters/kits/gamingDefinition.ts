/** Runtime Gaming overlay for executable plunge damage and sourced gates. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { gaming } from "../generated/pyro";

const GAMING_A4_PLUNGE_DAMAGE_BONUS = 0.2;

/**
 * Bestial Ascent's Charmed Cloudstrider is a plunge attack for damage rules,
 * although the cast remains reachable through the skill action slot.
 */
const charmedCloudstriderPlungeBuff: Buff = {
  id: "gaming-a4-air-of-prosperity",
  source: "Air of Prosperity",
  sourceCharacterId: "gaming",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    abilityIds: ["gaming-skill"],
    minHpFraction: 0.5,
  },
  modifiers: [{ stat: "dmgBonus", value: GAMING_A4_PLUNGE_DAMAGE_BONUS }],
};

export function createGamingDefinition(
  constellationLevel = gaming.constellationLevel,
  talentLevels: TalentLevels = gaming.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? gaming.ascensionPhase;

  return {
    ...gaming,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...gaming.skill,
      instances: gaming.skill.instances.map((instance) => ({
        ...instance,
        damageType: "plunge" as const,
      })),
    },
    passives: gaming.passives.map((passive) =>
      passive.id === "gaming-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [charmedCloudstriderPlungeBuff] }
        : passive,
    ),
  };
}

export const gamingWithKit = createGamingDefinition();

export const GAMING_KIT_METADATA = {
  a4PlungeDamageBonus: GAMING_A4_PLUNGE_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1HealingAfterCharmedCloudstriderHit",
    "a4IncomingHealingBonusBelowHalfHp",
    "p3CurrentHpCostOnBestialAscent",
    "c1ManChaiHealing",
    "c2OverflowHealingAtkBuff",
    "c4EnergyRestorationAfterCharmedCloudstriderHit",
  ],
} as const;
