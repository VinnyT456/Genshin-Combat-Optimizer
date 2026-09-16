/** Runtime overlay for Xianyun's source-backed, currently executable kit data. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { xianyun } from "../generated/anemo";

/**
 * The generated definition already contains the sourced talent tables and
 * executable C3/C5 talent-level buffs. Keep mechanics without a matching
 * lifecycle/damage channel explicitly unsupported instead of approximating.
 */
export function createXianyunDefinition(
  constellationLevel = xianyun.constellationLevel,
  talentLevels: TalentLevels = xianyun.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Number.isFinite(constellationLevel)
    ? Math.max(0, Math.min(6, Math.trunc(constellationLevel)))
    : 0;

  return {
    ...xianyun,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: xianyun.passives,
    constellations: xianyun.constellations,
  };
}

export const xianyunWithKit = createXianyunDefinition();

export const XIANYUN_KIT_METADATA = {
  supported: ["sourced normal, charged, plunge, skill, and burst ATK multipliers", "C3 burst talent levels", "C5 skill talent levels"],
  unsupported: [
    "A1 Storm Pinion stacks: per-opponent hit counting, independent 20-second stack expiry, and party plunge CRIT Rate are not represented by current runtime seams",
    "A4 and C2 plunge shockwave flat damage: missing active Starwicker assistance state, per-character 0.4-second quota, single-target application, and 9,000/18,000 cap semantics",
    "C1 additional skill charge: charge-count cooldown state is unavailable",
    "C2 20% ATK after a Skyladder: Skyladder-specific cast lifecycle and 15-second expiry are unavailable",
    "C4 healing: Skyladder count during one Cloud Transmogrification and healing-on-wave-hit are unavailable",
    "C6 Driftcloud Wave CRIT DMG and skill cooldown reset: per-state Skyladder count and bounded reset-use state are unavailable",
    "Burst Starwicker duration/ticks, Adeptal Assistance stacks, and plunge-enabling state: no verified lifecycle resource declaration is available",
  ],
} as const;
