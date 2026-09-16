/** Runtime Kirara overlay for supported HP scaling and constellation damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import type { Buff } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import { kirara } from "../generated/dendro";

const A4_SKILL_HP_RATIO = 0.000004;
const A4_BURST_HP_RATIO = 0.000003;
const C4_CARDAMOM_ATK_RATIO = 2;
const C4_SHIELD_DURATION_SECONDS = 12;
const C4_ICD_SECONDS = 3.8;
const C6_DURATION_SECONDS = 15;
const C6_ELEMENTAL_DMG_BONUS = 0.12;

const c6AllElementDmg: Buff = {
  id: "kirara-c6-countless-sights",
  source: "Countless Sights to See",
  sourceCharacterId: kirara.id,
  startTime: 0,
  duration: C6_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [
    { stat: "elementalDmgBonus", element: "anemo", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "cryo", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "dendro", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "electro", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "geo", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "hydro", value: C6_ELEMENTAL_DMG_BONUS },
    { stat: "elementalDmgBonus", element: "pyro", value: C6_ELEMENTAL_DMG_BONUS },
  ],
};

function withA4Scaling(
  instances: NonNullable<GenericCharacterDefinition["skill"]>["instances"],
  hpRatio: number,
): NonNullable<GenericCharacterDefinition["skill"]>["instances"] {
  return instances.map((instance) => ({
    ...instance,
    scaling: [...instance.scaling, { stat: "hp" as const, table: flatTalent(hpRatio) }],
  }));
}

function c4Cardamom(skill: NonNullable<GenericCharacterDefinition["skill"]>): KitAbility {
  const source = skill.instances[0];
  if (source === undefined) throw new Error("Kirara skill is missing its sourced Dendro damage row");
  return {
    id: "kirara-c4-small-cardamom",
    name: "Small Cat Grass Cardamom",
    slot: "burst",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{
      ...source,
      id: "kirara-c4-small-cardamom-hit",
      name: "Small Cat Grass Cardamom DMG",
      damageType: "burst",
      scaling: [{ stat: "atk", table: flatTalent(C4_CARDAMOM_ATK_RATIO) }],
    }],
  };
}

function c4Trigger(skill: NonNullable<GenericCharacterDefinition["skill"]>): TriggeredEffectDefinition<KitAbility> {
  return {
    id: "kirara-c4-steed-of-skanda",
    name: "Small Cat Grass Cardamom",
    trigger: "onNormalAttack",
    durationSeconds: C4_SHIELD_DURATION_SECONDS,
    icdSeconds: C4_ICD_SECONDS,
    sourceCharacterId: kirara.id,
    ability: c4Cardamom(skill),
  };
}

export function createKiraraDefinition(
  constellationLevel = kirara.constellationLevel,
  talentLevels: TalentLevels = kirara.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? kirara.ascensionPhase;
  const skill = {
    ...kirara.skill,
    instances: ascensionPhase >= 4 ? withA4Scaling(kirara.skill.instances, A4_SKILL_HP_RATIO) : kirara.skill.instances,
    ...(level >= 4 ? { triggers: [c4Trigger(kirara.skill)] } : {}),
    ...(level >= 6 ? { buffs: [c6AllElementDmg] } : {}),
  };
  const burst = {
    ...kirara.burst,
    instances: ascensionPhase >= 4 ? withA4Scaling(kirara.burst.instances, A4_BURST_HP_RATIO) : kirara.burst.instances,
    ...(level >= 6 ? { buffs: [c6AllElementDmg] } : {}),
  };

  return {
    ...kirara,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill,
    burst,
  };
}

export const KIRARA_KIT_METADATA = {
  a4SkillHpRatio: A4_SKILL_HP_RATIO,
  a4BurstHpRatio: A4_BURST_HP_RATIO,
  c4CardamomAtkRatio: C4_CARDAMOM_ATK_RATIO,
  c4ShieldDurationSeconds: C4_SHIELD_DURATION_SECONDS,
  c4IcdSeconds: C4_ICD_SECONDS,
  c6DurationSeconds: C6_DURATION_SECONDS,
  c6ElementalDmgBonus: C6_ELEMENTAL_DMG_BONUS,
  unsupportedChannels: [
    "a1ReinforcedPackagingShieldLifecycle",
    "c1HpBasedExtraCardamomCount",
    "c2CriticalTransportShieldCoopLifecycle",
    "c4RequiresShieldedActiveCharacterGate",
    "p3AnimalApproachBehavior",
  ],
} as const;

export const kiraraWithKit = createKiraraDefinition();
