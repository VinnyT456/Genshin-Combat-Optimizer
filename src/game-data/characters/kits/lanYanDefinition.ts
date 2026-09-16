/** Runtime Lan Yan overlay for sourced EM damage and post-Burst party buffs. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { lanYan } from "../generated/anemo";

const LAN_YAN_A4_SKILL_EM_RATIO = 3.09;
const LAN_YAN_A4_BURST_EM_RATIO = 7.74;
const LAN_YAN_C4_EM = 60;
const LAN_YAN_C4_DURATION_SECONDS = 12;

function withEmScaling(instance: DamageInstanceDefinition, ratio: number): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: [...instance.scaling, { stat: "elementalMastery", table: flatTalent(ratio) }],
  };
}

function c4BurstBuff(): Buff {
  return {
    id: "lan-yan-c4-party-em",
    source: "With Drakefalcon's Blood-Pearls Adorned",
    sourceCharacterId: lanYan.id,
    startTime: 0,
    duration: LAN_YAN_C4_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    modifiers: [{ stat: "elementalMastery", value: LAN_YAN_C4_EM }],
  };
}

export function createLanYanDefinition(
  constellationLevel = lanYan.constellationLevel,
  talentLevels: TalentLevels = lanYan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? lanYan.ascensionPhase;
  const skill = {
    ...lanYan.skill,
    instances: ascensionPhase >= 4
      ? lanYan.skill.instances.map((instance) => withEmScaling(instance, LAN_YAN_A4_SKILL_EM_RATIO))
      : lanYan.skill.instances,
  };
  const burst = {
    ...lanYan.burst,
    instances: ascensionPhase >= 4
      ? lanYan.burst.instances.map((instance) => withEmScaling(instance, LAN_YAN_A4_BURST_EM_RATIO))
      : lanYan.burst.instances,
    buffs: level >= 4 ? [c4BurstBuff()] : [],
  };

  return {
    ...lanYan,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill,
    burst,
  };
}

export const LAN_YAN_KIT_METADATA = {
  a4SkillEmRatio: LAN_YAN_A4_SKILL_EM_RATIO,
  a4BurstEmRatio: LAN_YAN_A4_BURST_EM_RATIO,
  c4PartyEm: LAN_YAN_C4_EM,
  c4DurationSeconds: LAN_YAN_C4_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ElementalAbsorptionAndAdditionalElementalSkillRing",
    "c1AbsorptionDependentAdditionalRing",
    "c2ShieldRestorationOnNormalAttack",
    "c6AdditionalSkillCharge",
    "p3WildlifeApproachBehavior",
  ],
} as const;

export const lanYanWithKit = createLanYanDefinition();
