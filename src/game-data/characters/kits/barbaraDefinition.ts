/** Runtime Barbara kit overlay for the executable C2 Hydro-DMG channel. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { barbara } from "../generated/hydro";

const BARBARA_MELODY_LOOP_DURATION_SECONDS = 15;
const BARBARA_C2_HYDRO_DMG_BONUS = 0.15;
const BARBARA_C2_COOLDOWN_MULTIPLIER = 0.85;

const c2HydroBuff: Buff = {
  id: "barbara-c2-hydro-dmg",
  source: "Vitality Burst",
  sourceCharacterId: "barbara",
  startTime: 0,
  duration: BARBARA_MELODY_LOOP_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active" },
  modifiers: [
    {
      stat: "elementalDmgBonus",
      element: "hydro",
      value: BARBARA_C2_HYDRO_DMG_BONUS,
    },
  ],
};

export function createBarbaraDefinition(
  constellationLevel = barbara.constellationLevel,
  talentLevels: TalentLevels = barbara.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...barbara,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...barbara.skill,
      cooldown:
        level >= 2
          ? flatTalent(32 * BARBARA_C2_COOLDOWN_MULTIPLIER)
          : barbara.skill.cooldown,
      ...(level >= 2 ? { buffs: [c2HydroBuff] } : {}),
    },
  };
}

export const barbaraWithKit = createBarbaraDefinition();

export const BARBARA_KIT_METADATA = {
  melodyLoopDurationSeconds: BARBARA_MELODY_LOOP_DURATION_SECONDS,
  c2HydroDmgBonus: BARBARA_C2_HYDRO_DMG_BONUS,
  c2CooldownMultiplier: BARBARA_C2_COOLDOWN_MULTIPLIER,
  unsupportedChannels: ["a1StaminaReduction", "a4ParticleExtension", "c1Energy", "c4ChargedEnergy", "c6Revive"],
} as const;
