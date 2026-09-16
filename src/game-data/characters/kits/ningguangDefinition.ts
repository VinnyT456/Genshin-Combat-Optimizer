/** Runtime Ningguang overlay for the executable, source-verified kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { ningguang } from "../generated/geo";

const NINGGUANG_A4_DURATION_SECONDS = 10;
const NINGGUANG_A4_GEO_DAMAGE_BONUS = 0.12;

/** Strategic Reserve after Ningguang's Jade Screen cast resolves. */
const strategicReserveBuff: Buff = {
  id: "ningguang-a4-strategic-reserve",
  source: "Strategic Reserve",
  sourceCharacterId: ningguang.id,
  startTime: 0,
  duration: NINGGUANG_A4_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { elements: ["geo"] },
  modifiers: [{ stat: "elementalDmgBonus", element: "geo", value: NINGGUANG_A4_GEO_DAMAGE_BONUS }],
};

export function createNingguangDefinition(
  constellationLevel = ningguang.constellationLevel,
  talentLevels: TalentLevels = ningguang.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? ningguang.ascensionPhase;

  return {
    ...ningguang,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...ningguang.skill,
      // The buff is attached to the cast, so it starts after Jade Screen's
      // own damage and affects subsequent Geo damage only.
      ...(ascensionPhase >= 4 ? { buffs: [strategicReserveBuff] } : {}),
    },
  };
}

export const NINGGUANG_KIT_METADATA = {
  a4DurationSeconds: NINGGUANG_A4_DURATION_SECONDS,
  a4GeoDamageBonus: NINGGUANG_A4_GEO_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1JadeStarStaminaAndChargedAttackProjectileState",
    "c1NormalAttackAreaOfEffect",
    "c2JadeScreenResetAndExplosion",
    "c4JadeScreenElementalResistanceAura",
    "c6BurstGrantedJadeStarsAndNextChargedAttackProjectiles",
    "p3MinimapOreDisplay",
  ],
} as const;

export const ningguangWithKit = createNingguangDefinition();
