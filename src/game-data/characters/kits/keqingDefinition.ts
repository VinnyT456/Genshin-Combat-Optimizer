/** Runtime Keqing overlay for executable infusion, burst passive, and damage constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { keqing } from "../generated/electro";

const ELECTRO_INFUSION_DURATION_SECONDS = 5;
const A4_DURATION_SECONDS = 8;
const A4_CRIT_RATE = 0.15;
const A4_ENERGY_RECHARGE = 0.15;
const C1_RATIO = 0.5;
const C6_ELECTRO_DMG_BONUS = 0.06;
const C6_DURATION_SECONDS = 8;

const a4AristocraticDignity: Buff = {
  id: "keqing-a4-aristocratic-dignity",
  source: "Aristocratic Dignity",
  sourceCharacterId: keqing.id,
  startTime: 0,
  duration: A4_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [
    { stat: "critRate", value: A4_CRIT_RATE },
    { stat: "energyRecharge", value: A4_ENERGY_RECHARGE },
  ],
};

const c6TenaciousStar: Buff = {
  id: "keqing-c6-tenacious-star",
  source: "Tenacious Star",
  sourceCharacterId: keqing.id,
  startTime: 0,
  duration: C6_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { elements: ["electro"] },
  modifiers: [{ stat: "elementalDmgBonus", element: "electro", value: C6_ELECTRO_DMG_BONUS }],
};

function keqingInfusionStance(): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "keqing-thundering-penance",
    name: "Thundering Penance",
    durationSeconds: ELECTRO_INFUSION_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "keqing-thundering-penance-infusion",
      element: "electro",
      durationSeconds: ELECTRO_INFUSION_DURATION_SECONDS,
      canBeOverridden: false,
    },
  };
}

function c1ThunderMightHits(): KitAbility["instances"] {
  const source = keqing.skill.instances[0];
  if (source === undefined) throw new Error("Keqing skill is missing its sourced Lightning Stiletto row");
  return ["start", "terminus"].map((location) => ({
    ...source,
    id: `keqing-c1-thundering-might-${location}`,
    name: `Thundering Might (${location})`,
    scaling: [{ stat: "atk" as const, table: flatTalent(C1_RATIO) }],
  }));
}

export function createKeqingDefinition(
  constellationLevel = keqing.constellationLevel,
  talentLevels: TalentLevels = keqing.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? keqing.ascensionPhase;
  const c6 = level >= 6 ? c6TenaciousStar : undefined;
  const burstBuffs = [
    ...(ascensionPhase >= 4 ? [a4AristocraticDignity] : []),
    ...(c6 ? [c6] : []),
  ];

  return {
    ...keqing,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...keqing.skill,
      stance: ascensionPhase >= 1 ? keqingInfusionStance() : undefined,
      instances: level >= 1 ? [...keqing.skill.instances, ...c1ThunderMightHits()] : keqing.skill.instances,
      ...(c6 ? { buffs: [c6] } : {}),
    },
    chargedAttack: {
      ...keqing.chargedAttack!,
      ...(c6 ? { buffs: [c6] } : {}),
    },
    burst: {
      ...keqing.burst,
      ...(burstBuffs.length > 0 ? { buffs: burstBuffs } : {}),
    },
  };
}

export const KEQING_KIT_METADATA = {
  electroInfusionDurationSeconds: ELECTRO_INFUSION_DURATION_SECONDS,
  a4CritRate: A4_CRIT_RATE,
  a4EnergyRecharge: A4_ENERGY_RECHARGE,
  a4DurationSeconds: A4_DURATION_SECONDS,
  c1Ratio: C1_RATIO,
  c6ElectroDmgBonus: C6_ELECTRO_DMG_BONUS,
  c6DurationSeconds: C6_DURATION_SECONDS,
  unsupportedChannels: [
    "a1RecastOnlyLightningStilettoLifecycle",
    "c2ConditionalParticleGeneration",
    "c4ElectroReactionTriggeredAtkBuff",
    "p3ExpeditionTimeReduction",
  ],
} as const;

export const keqingWithKit = createKeqingDefinition();
