/** Runtime Candace kit overlay for supported damage and constellation seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { candace } from "../generated/hydro";

const CANDACE_BURST_DURATION_SECONDS = 9;
const CANDACE_C1_EXTRA_DURATION_SECONDS = 3;
const CANDACE_C2_HP_BONUS = 0.2;
const CANDACE_C2_DURATION_SECONDS = 15;
const CANDACE_C6_HP_RATIO = 0.15;
const CANDACE_C6_ICD_SECONDS = 2.3;

const candaceC2HpBuff: Buff = {
  id: "candace-c2-max-hp",
  source: "Moon-Piercing Brilliance",
  sourceCharacterId: "candace",
  startTime: 0,
  duration: CANDACE_C2_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "hpPercent", value: CANDACE_C2_HP_BONUS }],
};

function c6WaveAbility(): KitAbility {
  const sourceInstance = candace.burst.instances[1];
  if (sourceInstance === undefined) {
    throw new Error("Candace burst is missing its sourced Wave Impact row");
  }
  return {
    id: "candace-c6-wave",
    name: "The Overflow Wave",
    slot: "burst",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [
      {
        ...sourceInstance,
        id: "candace-c6-wave-1",
        name: "The Overflow Wave DMG",
        scaling: [{ stat: "hp", table: flatTalent(CANDACE_C6_HP_RATIO) }],
      },
    ],
  };
}

export function createCandaceDefinition(
  constellationLevel = candace.constellationLevel,
  talentLevels: TalentLevels = candace.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const burstDuration = CANDACE_BURST_DURATION_SECONDS +
    (level >= 1 ? CANDACE_C1_EXTRA_DURATION_SECONDS : 0);
  const c6Wave = c6WaveAbility();

  return {
    ...candace,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...candace.skill,
      ...(level >= 2 ? { buffs: [candaceC2HpBuff] } : {}),
    },
    burst: {
      ...candace.burst,
      ...(level >= 6
        ? {
            triggers: [
              {
                id: "candace-c6-overflow",
                name: "The Overflow Wave",
                trigger: "onNormalAttack" as const,
                durationSeconds: burstDuration,
                icdSeconds: CANDACE_C6_ICD_SECONDS,
                sourceCharacterId: "candace",
                ability: c6Wave,
              },
            ],
          }
        : {}),
    },
  };
}

export const candaceWithKit = createCandaceDefinition();

export const CANDACE_KIT_METADATA = {
  burstDurationSeconds: CANDACE_BURST_DURATION_SECONDS,
  c1ExtraDurationSeconds: CANDACE_C1_EXTRA_DURATION_SECONDS,
  c2MaxHpBonus: CANDACE_C2_HP_BONUS,
  c2DurationSeconds: CANDACE_C2_DURATION_SECONDS,
  c6MaxHpRatio: CANDACE_C6_HP_RATIO,
  c6IcdSeconds: CANDACE_C6_ICD_SECONDS,
  unsupportedChannels: [
    "a1InstantHoldCharge",
    "a4SourceMaxHpNormalDamageBonus",
    "c4HoldCooldownSelection",
    "c6ExcludeCandaceSelf",
    "p3ClimbingStamina",
  ],
} as const;
