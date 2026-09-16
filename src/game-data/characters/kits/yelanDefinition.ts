/** Runtime Yelan overlay for sourced Lifeline and Exquisite Throw damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { yelan } from "../generated/hydro";

const EXQUISITE_THROW_DURATION_SECONDS = 15;
const EXQUISITE_THROW_ICD_SECONDS = 1;

export function createYelanDefinition(
  constellationLevel = yelan.constellationLevel,
  talentLevels: TalentLevels = yelan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const coordinatedHits = yelan.burst.instances.slice(1);
  if (coordinatedHits.length !== 3) throw new Error("Yelan burst must provide three Exquisite Throw hits");

  const coordinatedAbility: KitAbility = {
    id: "yelan-exquisite-throw-coordinated",
    name: "Exquisite Throw coordinated attack",
    slot: "burst",
    castTime: 0,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: coordinatedHits,
  };

  return {
    ...yelan,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...yelan.burst,
      // Burst cast's sourced opening hit; the three dice hits are coordinated
      // attacks, which need an active Burst and a qualifying normal attack.
      instances: yelan.burst.instances.slice(0, 1),
      triggers: [{
        id: "yelan-exquisite-throw",
        name: "Exquisite Throw",
        trigger: "onNormalAttack",
        durationSeconds: EXQUISITE_THROW_DURATION_SECONDS,
        icdSeconds: EXQUISITE_THROW_ICD_SECONDS,
        snapshotMode: "cast",
        sourceCharacterId: yelan.id,
        ability: coordinatedAbility,
      }],
    },
  };
}

export const YELAN_KIT_METADATA = {
  unsupportedChannels: [
    "skillLifelineDurationAndDetonationTiming",
    "burstExquisiteThrowTriggeredByLifelineDetonation",
    "a1TurnControlPartyCompositionDamageBonus",
    "a4AdaptWithEaseRampAndExpiration",
    "c1AdditionalLifelineCharge",
    "c2ExtraExquisiteThrowHit",
    "c4MaxHpStackAndExpiration",
    "c6BreakthroughBarbDamageSequence",
    "p3ExpeditionDuration",
  ],
} as const;

export const yelanWithKit = createYelanDefinition();
