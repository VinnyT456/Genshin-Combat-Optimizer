/** Runtime Thoma kit overlay for source-backed damage mechanics. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { thoma } from "../generated/pyro";

const A4_FIERY_COLLAPSE_HP_RATIO = 0.022;

function withHpScaling(
  instance: DamageInstanceDefinition,
  ratio: number,
): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: [...instance.scaling, { stat: "hp", table: { values: [ratio] } }],
  };
}

export function createThomaDefinition(
  constellationLevel = thoma.constellationLevel,
  talentLevels: TalentLevels = thoma.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? thoma.ascensionPhase;
  const burstInstances = thoma.burst.instances.map((instance) =>
    ascensionPhase >= 4 && instance.id === "thoma-burst-2"
      ? withHpScaling(instance, A4_FIERY_COLLAPSE_HP_RATIO)
      : instance,
  );

  return {
    ...thoma,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    // Generated C3/C5 buffs carry the sourced Skill/Burst talent increases.
    constellations: thoma.constellations,
    burst: { ...thoma.burst, instances: burstInstances },
  };
}

export const THOMA_KIT_METADATA = {
  a4FieryCollapseHpRatio: A4_FIERY_COLLAPSE_HP_RATIO,
  unsupportedChannels: [
    "a1BarrierRefreshShieldStrengthStacks",
    "c1AttackTriggeredCooldownReduction",
    "c2BurstDurationExtension",
    "c4BurstEnergyRefund",
    "c6BarrierRefreshNormalChargedPlungeDamageWindow",
    "p3FishingDoubleCatch",
  ],
} as const;

export const thomaWithKit = createThomaDefinition();
