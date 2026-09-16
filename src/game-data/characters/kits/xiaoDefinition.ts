/** Runtime Xiao overlay for his sourced Burst stance and existing talents. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { xiao } from "../generated/anemo";

const XIAO_BURST_DURATION_SECONDS = 15;

/**
 * Bane of All Evil changes Xiao's weapon attacks to Anemo and replaces his
 * plunge values with his normal talent's low/high plunge rows. The burst itself
 * has no direct damage instance in generated data, faithfully matching source.
 */
export function createXiaoDefinition(
  constellationLevel = xiao.constellationLevel,
  talentLevels: TalentLevels = xiao.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const anemoAttack = (instance: (typeof xiao.normalAttacks.hits)[number]["instances"][number]) => ({
    ...instance,
    element: "anemo" as const,
    application: { element: "anemo" as const, gauge: 1 as const },
  });
  const stanceAbility = (ability: KitAbility | undefined): KitAbility => {
    if (!ability) throw new Error("Missing sourced Xiao attack for Bane of All Evil stance");
    return { ...ability, instances: ability.instances.map(anemoAttack) };
  };
  const stanceNormals: NormalAttackString = {
    ...xiao.normalAttacks,
    hits: xiao.normalAttacks.hits.map(stanceAbility),
  };

  return {
    ...xiao,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...xiao.burst,
      stance: {
        id: "xiao-bane-of-all-evil",
        name: "靖妖傩舞",
        durationSeconds: XIAO_BURST_DURATION_SECONDS,
        endsOnSwap: true,
        infusion: {
          id: "xiao-bane-of-all-evil-anemo-infusion",
          element: "anemo",
          durationSeconds: XIAO_BURST_DURATION_SECONDS,
          canBeOverridden: false,
        },
        normalAttacks: stanceNormals,
        chargedAttack: stanceAbility(xiao.chargedAttack),
        plungeLow: stanceAbility(xiao.plungeLow),
        plungeHigh: stanceAbility(xiao.plungeHigh),
      },
    },
  };
}

export const XIAO_KIT_METADATA = {
  burstDurationSeconds: XIAO_BURST_DURATION_SECONDS,
  executableConstellations: ["c3SkillTalentLevels", "c5BurstTalentLevels"],
  unsupportedChannels: [
    // Requires damage bonus that advances in timed steps during the stance.
    "a1BurstDamageBonusTimeRamp",
    // Requires accumulation and timed stack refresh from prior skill casts.
    "a4SkillDamageStacks",
    // Requires a charge-count cooldown model.
    "c1AdditionalSkillCharge",
    // Explicit off-field condition is unavailable to ordinary buff conditions.
    "c2OffFieldEnergyRecharge",
    // Requires HP-threshold-conditioned defense.
    "c4LowHpDefense",
    // Requires a multi-opponent hit count and conditional cooldown reset.
    "c6MultiOpponentPlungeSkillReset",
  ],
} as const;

export const xiaoWithKit = createXiaoDefinition();
