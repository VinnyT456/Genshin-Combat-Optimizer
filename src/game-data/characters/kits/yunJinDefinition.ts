/** Runtime Yun Jin overlay for sourced post-Burst Normal Attack damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { yunJin } from "../generated/geo";

const YUN_JIN_C2_NORMAL_DAMAGE_BONUS = 0.15;
const YUN_JIN_C2_DURATION_SECONDS = 12;

const c2NormalAttackBuff: Buff = {
  id: "yun-jin-c2-normal-damage",
  source: "Myriad Mise-En-Scène",
  sourceCharacterId: "yun-jin",
  startTime: 0,
  duration: YUN_JIN_C2_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  conditions: { damageTypes: ["normal"] },
  modifiers: [{ stat: "dmgBonus", value: YUN_JIN_C2_NORMAL_DAMAGE_BONUS }],
};

/**
 * Flying Cloud Flag Formation's DEF-based Normal Attack additive damage is
 * intentionally omitted: its sourced hit quota cannot be consumed exactly by
 * the current generic runtime. A4's bonus is also inert because the definition
 * has no verified party-element-composition input.
 */
export function createYunJinDefinition(
  constellationLevel = yunJin.constellationLevel,
  talentLevels: TalentLevels = yunJin.talentLevels,
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...yunJin,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...yunJin.burst,
      buffs: level >= 2 ? [c2NormalAttackBuff] : [],
    },
  };
}

export const yunJinWithKit = createYunJinDefinition();

export const YUN_JIN_KIT_METADATA = {
  c2NormalDamageBonus: YUN_JIN_C2_NORMAL_DAMAGE_BONUS,
  c2DurationSeconds: YUN_JIN_C2_DURATION_SECONDS,
  unsupportedMechanics: [
    "Flying Cloud Flag Formation DEF-based additive Normal Attack damage and its sourced hit quota; runtime cannot consume a bounded quota per eligible hit",
    "A4 Breaking Conventions bonus; the exact 1/2/3/4 distinct party Elemental Types gate has no party-composition input",
    "A1 precise-hit charged Level 2 skill form; incoming-hit timing/state is unavailable",
    "C1 skill cooldown reduction",
    "C4 Crystallize/Lunar-Crystallize-triggered DEF increase",
    "C6 Normal Attack speed increase",
    "Light Nourishment cooking bonus",
  ],
} as const;
