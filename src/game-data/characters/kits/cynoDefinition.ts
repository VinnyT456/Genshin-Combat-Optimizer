/** Runtime Cyno overlay for the executable Pactsworn Pathclearer state. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { cyno } from "../generated/electro";

const PACTSWORN_DURATION_SECONDS = 18;
const PACTSWORN_NORMAL_EM_RATIO = 1.5;

function pactswornNormalAttacks(base: GenericCharacterDefinition): NormalAttackString {
  return {
    loops: true,
    hits: base.burst.instances.slice(1, 5).map((instance, index) => ({
      id: `cyno-pactsworn-normal-${index + 1}`,
      name: `Pactsworn Pathclearer ${index + 1}-Hit DMG`,
      slot: "normal" as const,
      castTime: 0.4,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{
        ...instance,
        id: `cyno-pactsworn-normal-${index + 1}-1`,
        damageType: "normal" as const,
        scaling: [
          ...instance.scaling,
          { stat: "elementalMastery" as const, table: flatTalent(PACTSWORN_NORMAL_EM_RATIO) },
        ],
      }],
    })),
  };
}

function pactswornStance(base: GenericCharacterDefinition): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "cyno-pactsworn-pathclearer",
    name: "Pactsworn Pathclearer",
    durationSeconds: PACTSWORN_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "cyno-pactsworn-pathclearer-infusion",
      element: "electro",
      durationSeconds: PACTSWORN_DURATION_SECONDS,
      canBeOverridden: false,
    },
    normalAttacks: pactswornNormalAttacks(base),
    // The generated burst rows include the transformed normal/charged/plunge
    // attacks as alternate rows. Only the first row is the burst cast itself.
    // The stance exposes the other rows through the corresponding actions.
    chargedAttack: {
      id: "cyno-pactsworn-charged",
      name: "Pactsworn Pathclearer Charged Attack",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{ ...base.burst.instances[5]!, id: "cyno-pactsworn-charged-1", damageType: "charged" }],
    },
    plungeLow: {
      id: "cyno-pactsworn-plunge-low",
      name: "Pactsworn Pathclearer Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{ ...base.burst.instances[7]!, id: "cyno-pactsworn-plunge-low-1", damageType: "plunge" }],
    },
    plungeHigh: {
      id: "cyno-pactsworn-plunge-high",
      name: "Pactsworn Pathclearer High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [{ ...base.burst.instances[8]!, id: "cyno-pactsworn-plunge-high-1", damageType: "plunge" }],
    },
  };
}

export function createCynoDefinition(
  constellationLevel = cyno.constellationLevel,
  talentLevels: TalentLevels = cyno.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...cyno,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...cyno.burst,
      instances: [cyno.burst.instances[0]!],
      stance: pactswornStance(cyno),
    },
  };
}

export const cynoWithKit = createCynoDefinition();

export const CYNO_KIT_METADATA = {
  pactswornDurationSeconds: PACTSWORN_DURATION_SECONDS,
  pactswornNormalEmRatio: PACTSWORN_NORMAL_EM_RATIO,
  unsupportedChannels: [
    "a1EndseerJudicationAndDuststalkerBolts",
    "c1NormalAttackSpeed",
    "c2ElectroDamageStacksSourceConflict",
    "c4PartyEnergyOnReaction",
    "c6DayOfTheJackalDuststalkerBolts",
    "p4SkillTriggeredStanceOutsideBurst",
  ],
} as const;
