/** Runtime Navia overlay for executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { navia } from "../generated/geo";

const NAVIA_A1_DURATION_SECONDS = 4;
const NAVIA_A1_NORMAL_CHARGED_PLUNGE_DMG_BONUS = 0.4;
const NAVIA_A4_ATK_PER_ELEMENTAL_MEMBER = 0.2;
const NAVIA_A4_MAX_ELEMENTAL_MEMBERS = 2;

/**
 * The generated roster does not identify party composition. Callers must
 * provide the sourced count of Pyro/Electro/Cryo/Hydro party members;
 * omitted or invalid input leaves Mutual Assistance Network inactive.
 */
export interface NaviaPartyComposition {
  readonly pyroElectroCryoHydroCount?: number;
}

function boundedElementalMemberCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), NAVIA_A4_MAX_ELEMENTAL_MEMBERS);
}

function a4Buff(count: number): Buff | undefined {
  if (count === 0) return undefined;
  return {
    id: "navia-a4-mutual-assistance-network",
    source: "Mutual Assistance Network",
    sourceCharacterId: navia.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "atkPercent", value: count * NAVIA_A4_ATK_PER_ELEMENTAL_MEMBER }],
  };
}

function a1Stance(): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "navia-a1-undisclosed-distribution-channels",
    name: "Undisclosed Distribution Channels",
    durationSeconds: NAVIA_A1_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "navia-a1-geo-infusion",
      element: "geo",
      durationSeconds: NAVIA_A1_DURATION_SECONDS,
      canBeOverridden: false,
    },
    modifiers: [{
      stat: "dmgBonus",
      value: NAVIA_A1_NORMAL_CHARGED_PLUNGE_DMG_BONUS,
    }],
  };
}

export function createNaviaDefinition(
  constellationLevel = navia.constellationLevel,
  talentLevels: TalentLevels = navia.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: NaviaPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? navia.ascensionPhase;
  const a4 = navia.passives.find((passive) => passive.id === "navia-a4");
  if (!a4) throw new Error("Navia A4 passive is missing from generated data");

  const a4Modifier = ascensionPhase >= 4
    ? a4Buff(boundedElementalMemberCount(composition.pyroElectroCryoHydroCount))
    : undefined;

  return {
    ...navia,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    passives: navia.passives.map((passive) =>
      passive.id === a4.id
        ? { ...passive, buffs: a4Modifier === undefined ? [] : [a4Modifier] }
        : passive,
    ),
    skill: {
      ...navia.skill,
      ...(ascensionPhase >= 1 ? { stance: a1Stance() } : {}),
    },
  };
}

export const NAVIA_KIT_METADATA = {
  a1DurationSeconds: NAVIA_A1_DURATION_SECONDS,
  a1NormalChargedPlungeDmgBonus: NAVIA_A1_NORMAL_CHARGED_PLUNGE_DMG_BONUS,
  a4AtkPerElementalMember: NAVIA_A4_ATK_PER_ELEMENTAL_MEMBER,
  a4MaximumElementalMembers: NAVIA_A4_MAX_ELEMENTAL_MEMBERS,
  unsupportedChannels: [
    "c1CrystalShrapnelEnergyAndBurstCooldownReduction",
    "c2CrystalShrapnelConditionalSkillCritRateAndCannonFireSupport",
    "c4BurstHitGatedGeoResistanceReduction",
    "c6CrystalShrapnelConditionalSkillCritDamageAndRefund",
    "p3FontaineExpeditionRewardBonus",
  ],
} as const;

export const naviaWithKit = createNaviaDefinition();
