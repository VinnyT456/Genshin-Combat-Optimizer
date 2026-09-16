/** Runtime Dori kit overlay for the executable, sourced constellation effects. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { dori } from "../generated/electro";

const DORI_C1_SERVICE_ROUND_ATK_RATIO = 0.3156;
const DORI_C6_INFUSION_DURATION_SECONDS = 3;

/** C1 creates one additional After-Sales Service Round. */
function c1ServiceRound(): NonNullable<GenericCharacterDefinition["skill"]>["instances"][number] {
  const source = dori.skill.instances[1];
  if (source === undefined) throw new Error("Dori skill is missing its sourced After-Sales Service Round row");
  return {
    ...source,
    id: "dori-c1-after-sales-service-round",
    name: "Additional After-Sales Service Round DMG",
    scaling: [{ stat: "atk", table: flatTalent(DORI_C1_SERVICE_ROUND_ATK_RATIO) }],
    application: undefined,
  };
}

function c6Stance(): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "dori-c6-sprinkling-weight",
    name: "Sprinkling Weight",
    durationSeconds: DORI_C6_INFUSION_DURATION_SECONDS,
    endsOnSwap: false,
    infusion: {
      id: "dori-c6-electro-infusion",
      element: "electro",
      durationSeconds: DORI_C6_INFUSION_DURATION_SECONDS,
      canBeOverridden: true,
    },
    normalAttacks: dori.normalAttacks,
  };
}

export function createDoriDefinition(
  constellationLevel = dori.constellationLevel,
  talentLevels: TalentLevels = dori.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...dori,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...dori.skill,
      instances: level >= 1 ? [...dori.skill.instances, c1ServiceRound()] : dori.skill.instances,
    },
    burst: {
      ...dori.burst,
      ...(level >= 6 ? { stance: c6Stance() } : {}),
    },
  };
}

export const DORI_KIT_METADATA = {
  c1ServiceRoundAtkRatio: DORI_C1_SERVICE_ROUND_ATK_RATIO,
  c6InfusionDurationSeconds: DORI_C6_INFUSION_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ReactionTriggeredBurstCooldownReduction",
    "a4EnergyRestorationOnBurstProjectileHit",
    "c2HealingTriggeredJinniToop",
    "c4ConditionalIncomingHealingAndEnergyRecharge",
    "c6NormalAttackHealing",
    "p3CraftingMaterialRefund",
  ],
} as const;

export const doriWithKit = createDoriDefinition();
