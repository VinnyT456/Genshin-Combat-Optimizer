/** Runtime Diluc overlay for the executable parts of his sourced kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { diluc } from "../generated/pyro";

const DILUC_PYRO_INFUSION_DURATION_SECONDS = 8;
const DILUC_A4_PYRO_DAMAGE_BONUS = 0.2;
const DILUC_C1_DAMAGE_BONUS = 0.15;

const c1ConvictionBuff: Buff = {
  id: "diluc-c1-conviction",
  source: "Conviction",
  sourceCharacterId: "diluc",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { minEnemyHpFractionExclusive: 0.5 },
  modifiers: [{ stat: "dmgBonus", value: DILUC_C1_DAMAGE_BONUS }],
};

function phoenixStance(ascensionPhase: number): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "diluc-blessing-of-phoenix",
    name: "Blessing of Phoenix",
    durationSeconds: DILUC_PYRO_INFUSION_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "diluc-phoenix-pyro-infusion",
      element: "pyro",
      durationSeconds: DILUC_PYRO_INFUSION_DURATION_SECONDS,
      canBeOverridden: false,
    },
    ...(ascensionPhase >= 4
      ? {
          modifiers: [{
            stat: "elementalDmgBonus" as const,
            element: "pyro" as const,
            value: DILUC_A4_PYRO_DAMAGE_BONUS,
          }],
        }
      : {}),
  };
}

export function createDilucDefinition(
  constellationLevel = diluc.constellationLevel,
  talentLevels: TalentLevels = diluc.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? diluc.ascensionPhase;

  return {
    ...diluc,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...diluc.burst,
      stance: phoenixStance(ascensionPhase),
    },
    constellations: diluc.constellations.map((constellation) =>
      constellation.id === "diluc-c1" && level >= 1
        ? { ...constellation, buffs: [c1ConvictionBuff] }
        : constellation,
    ),
  };
}

export const DILUC_KIT_METADATA = {
  a4PyroDamageBonus: DILUC_A4_PYRO_DAMAGE_BONUS,
  infusionDurationSeconds: DILUC_PYRO_INFUSION_DURATION_SECONDS,
  c1DamageBonus: DILUC_C1_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1ChargedAttackStaminaAndDuration",
    "c2DamageTakenTriggeredAttackSpeedAndAtk",
    "c4RhythmDependentSkillDamage",
    "c6NextTwoNormalAttackDamageAndAttackSpeed",
    "p3CraftingOreRefund",
  ],
} as const;

export const dilucWithKit = createDilucDefinition();
