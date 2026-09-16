/** Runtime overlay for Kaveh's executable, generic-kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { kaveh } from "../generated/dendro";

const PAINTED_DOME_DURATION_SECONDS = 12;
const PAIRIDAeZA_LIGHT_ATK_RATIO = 0.618;

function pairidaezaLight(): KitAbility {
  const source = kaveh.skill.instances[0];
  if (source === undefined) throw new Error("Kaveh skill is missing its sourced Dendro damage row");

  return {
    id: "kaveh-c6-pairidaeza-light",
    name: "Pairidaeza's Light",
    slot: "skill",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{
      ...source,
      id: "kaveh-c6-pairidaeza-light-1",
      name: "Pairidaeza's Light DMG",
      scaling: [{ stat: "atk", table: flatTalent(PAIRIDAeZA_LIGHT_ATK_RATIO) }],
      damageType: "skill",
      application: { element: "dendro", gauge: 1 },
    }],
  };
}

function paintedDomeStance(level: number): StanceDefinition<NormalAttackString, KitAbility> {
  const triggers = level >= 6
    ? [
        {
          id: "kaveh-c6-pairidaeza-light-normal",
          name: "Pairidaeza's Light on Normal Attack",
          trigger: "onNormalAttack" as const,
          durationSeconds: PAINTED_DOME_DURATION_SECONDS,
          icdSeconds: 3,
          sourceCharacterId: kaveh.id,
          ability: pairidaezaLight(),
        },
        {
          id: "kaveh-c6-pairidaeza-light-charged",
          name: "Pairidaeza's Light on Charged Attack",
          trigger: "onChargedAttack" as const,
          durationSeconds: PAINTED_DOME_DURATION_SECONDS,
          icdSeconds: 3,
          sourceCharacterId: kaveh.id,
          ability: pairidaezaLight(),
        },
      ]
    : undefined;

  return {
    id: "kaveh-painted-dome",
    name: "Painted Dome",
    durationSeconds: PAINTED_DOME_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "kaveh-painted-dome-dendro-infusion",
      element: "dendro",
      durationSeconds: PAINTED_DOME_DURATION_SECONDS,
      canBeOverridden: false,
    },
    normalAttacks: kaveh.normalAttacks,
    chargedAttack: kaveh.chargedAttack,
    plungeLow: kaveh.plungeLow,
    plungeHigh: kaveh.plungeHigh,
    triggers,
  };
}

export function createKavehDefinition(
  constellationLevel = kaveh.constellationLevel,
  talentLevels: TalentLevels = kaveh.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...kaveh,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...kaveh.burst,
      stance: paintedDomeStance(level),
    },
  };
}

export const KAVEH_KIT_METADATA = {
  paintedDomeDurationSeconds: PAINTED_DOME_DURATION_SECONDS,
  pairidaezaLightAtkRatio: PAIRIDAeZA_LIGHT_ATK_RATIO,
  unsupportedChannels: [
    "a1DendroCoreDamageTriggeredHealing",
    "a4PaintedDomeNormalChargedPlungeTriggeredEmStacks",
    "c1PostSkillDendroResistanceAndIncomingHealing",
    "c2PaintedDomeNormalAttackSpeed",
    "c4KavehTriggeredBloomCoreDamageBonus",
    "c6PairidaezaLightPlungeAttackTrigger",
    "p3FurnishingMaterialRefund",
  ],
} as const;

export const kavehWithKit = createKavehDefinition();
