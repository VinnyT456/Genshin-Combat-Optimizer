/** Runtime Flins kit overlay for the executable state, passive, and C4 seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { flins } from "../generated/electro";

const FLINS_MANIFEST_FLAME_DURATION_SECONDS = 20;
const FLINS_A4_ATK_TO_EM_RATIO = 0.08;
const FLINS_A4_ATK_TO_EM_CAP = 160;
const FLINS_C4_ATK_BONUS = 0.2;
const FLINS_C4_A4_ATK_TO_EM_CAP = 220;
const FLINS_C4_A4_ATK_TO_EM_RATIO = 0.1;

const c4Buff: Buff = {
  id: "flins-c4-night-on-bald-mountain",
  source: "Night on Bald Mountain",
  sourceCharacterId: "flins",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "atkPercent", value: FLINS_C4_ATK_BONUS }],
};

function manifestFlameStance(base: GenericCharacterDefinition): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "flins-manifest-flame",
    name: "Manifest Flame",
    durationSeconds: FLINS_MANIFEST_FLAME_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "flins-manifest-flame-electro-infusion",
      element: "electro",
      durationSeconds: FLINS_MANIFEST_FLAME_DURATION_SECONDS,
      canBeOverridden: false,
    },
    normalAttacks: base.normalAttacks,
    chargedAttack: base.chargedAttack,
    plungeLow: base.plungeLow,
    plungeHigh: base.plungeHigh,
  };
}

export function createFlinsDefinition(
  constellationLevel = flins.constellationLevel,
  talentLevels: TalentLevels = flins.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? flins.ascensionPhase;
  const a4 = flins.passives.find((passive) => passive.id === "flins-a4");
  if (!a4) throw new Error("Flins A4 passive is missing from generated data");

  const a4Ratio = level >= 4 ? FLINS_C4_A4_ATK_TO_EM_RATIO : FLINS_A4_ATK_TO_EM_RATIO;
  const a4Cap = level >= 4 ? FLINS_C4_A4_ATK_TO_EM_CAP : FLINS_A4_ATK_TO_EM_CAP;

  return {
    ...flins,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: flins.passives.map((passive) =>
      passive.id === a4.id
        ? {
            ...passive,
            buffs: ascensionPhase >= 4
              ? [{
                  id: "flins-a4-whispering-flame",
                  source: a4.name,
                  sourceCharacterId: "flins",
                  startTime: 0,
                  duration: Number.POSITIVE_INFINITY,
                  stacking: { mode: "refresh" as const },
                  targets: { scope: "self" as const },
                  conversions: [{
                    sourceStat: "atk" as const,
                    targetStat: "elementalMastery" as const,
                    ratio: a4Ratio,
                    maxCap: a4Cap,
                  }],
                }]
              : [],
          }
        : passive,
    ),
    skill: {
      ...flins.skill,
      stance: manifestFlameStance({ ...flins, ...overrides }),
    },
    constellations: flins.constellations.map((constellation) =>
      constellation.id === "flins-c4" && level >= 4
        ? { ...constellation, buffs: [c4Buff] }
        : constellation,
    ),
  };
}

export const FLINS_KIT_METADATA = {
  manifestFlameDurationSeconds: FLINS_MANIFEST_FLAME_DURATION_SECONDS,
  a4AtkToEmRatio: FLINS_A4_ATK_TO_EM_RATIO,
  a4AtkToEmCap: FLINS_A4_ATK_TO_EM_CAP,
  c4AtkBonus: FLINS_C4_ATK_BONUS,
  c4A4AtkToEmRatio: FLINS_C4_A4_ATK_TO_EM_RATIO,
  c4A4AtkToEmCap: FLINS_C4_A4_ATK_TO_EM_CAP,
  unsupportedChannels: [
    "oldWorldSecretsElectroChargedToLunarChargedConversion",
    "oldWorldSecretsAtkScaledLunarChargedBaseDamage",
    "a1MoonsignLunarChargedDamageBonus",
    "c1CooldownAndEnergyLifecycle",
    "c2ElectroResReductionAndAdditionalLunarChargedHit",
    "c6LunarChargedDamageElevation",
    "thunderousSymphonyBurstReplacementAndEnergyCost",
    "northlandSpearstormAdditionalLunarChargedHit",
  ],
} as const;

export const flinsWithKit = createFlinsDefinition();
