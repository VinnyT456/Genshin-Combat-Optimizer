/** Runtime overlay for Mualani's executable HP-scaled and constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { talentTable } from "@/simulation/character/talent";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { mualani } from "../generated/hydro";

const WAVECHASER_EXPLOITS_RESOURCE_ID = "mualani-wavechaser-exploits";
const WAVE_MOMENTUM_RESOURCE_ID = "mualani-wave-momentum";
const NIGHTSoul_BLESSING_DURATION_SECONDS = 5;
const A4_BURST_HP_RATIO_PER_STACK = 0.15;
const C1_FIRST_BITE_HP_RATIO = 0.66;
const C4_BURST_DAMAGE_BONUS = 0.75;

const zeroCooldown = talentTable([0]);

function sharkyBites(base: GenericCharacterDefinition): NormalAttackString {
  const source = base.skill.instances[0];
  if (!source) throw new Error("Mualani generated skill is missing Sharky's HP-scaled instance");

  // The first-bite-only lifecycle gate is not available in the generic state
  // vocabulary. C1 therefore remains fail-closed instead of applying its 66%
  // Max HP bonus to every bite. Wave Momentum's exact per-stack coefficient is
  // likewise not emitted by the generated source and is not invented here.
  const bite = {
    ...source,
    id: "mualani-sharkys-surging-bite-1",
    name: "Sharky's Surging Bite",
    damageType: "skill" as const,
    resourceScaling: undefined,
  };

  return {
    loops: true,
    hits: [{
      id: "mualani-sharkys-surging-bite",
      name: "Sharky's Surging Bite",
      slot: "normal",
      castTime: 0.4,
      cooldown: zeroCooldown,
      energyCost: 0,
      instances: [bite],
    }],
  };
}

function nightsoulBlessing(base: GenericCharacterDefinition): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "mualani-nightsouls-blessing",
    name: "Nightsoul's Blessing",
    durationSeconds: NIGHTSoul_BLESSING_DURATION_SECONDS,
    endsOnSwap: true,
    normalAttacks: sharkyBites(base),
  };
}

export function createMualaniDefinition(
  constellationLevel = mualani.constellationLevel,
  talentLevels: TalentLevels = mualani.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  options: { wavechaserExploitsStacks?: number } = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? mualani.ascensionPhase;
  const exploits = Math.max(0, Math.min(3, Math.trunc(options.wavechaserExploitsStacks ?? 0)));
  const burstInstance = mualani.burst.instances[0];
  if (!burstInstance) throw new Error("Mualani generated burst is missing Boomsharka-laka");

  return {
    ...mualani,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    resources: [
      {
        id: WAVECHASER_EXPLOITS_RESOURCE_ID,
        name: "Wavechaser's Exploits",
        initial: ascensionPhase >= 4 ? exploits : 0,
        max: 3,
        durationSeconds: 20,
        consumeOnBurstCast: true,
      },
      {
        id: WAVE_MOMENTUM_RESOURCE_ID,
        name: "Wave Momentum",
        initial: 0,
        max: 3,
        durationSeconds: NIGHTSoul_BLESSING_DURATION_SECONDS,
      },
    ],
    skill: {
      ...mualani.skill,
      // Surfshark Wavebreaker deals its damage through Sharky's Surging Bite
      // while the stance is active; the generated base row is reused there.
      instances: [],
      stance: nightsoulBlessing({ ...mualani, ...overrides, talentLevels }),
      ...(level >= 2 ? { effects: [{ resourceId: WAVE_MOMENTUM_RESOURCE_ID, kind: "gain" as const, amount: 2 }] } : {}),
    },
    burst: {
      ...mualani.burst,
      instances: [{
        ...burstInstance,
        ...(ascensionPhase >= 4
          ? {
              resourceScaling: [{
                resourceId: WAVECHASER_EXPLOITS_RESOURCE_ID,
                stat: "hp" as const,
                multiplierPerStack: A4_BURST_HP_RATIO_PER_STACK,
                snapshot: "cast" as const,
              }],
            }
          : {}),
      }],
    },
    constellations: mualani.constellations.map((constellation) =>
      constellation.id === "mualani-c4"
        ? {
            ...constellation,
            buffs: level >= 4
              ? [{
                  id: "mualani-c4-boomsharka-laka",
                  source: "Sharky Eats Puffies",
                  sourceCharacterId: mualani.id,
                  startTime: 0,
                  duration: Number.POSITIVE_INFINITY,
                  stacking: { mode: "refresh" as const },
                  targets: { scope: "self" as const },
                  conditions: { abilityIds: [mualani.burst.id] },
                  modifiers: [{ stat: "dmgBonus" as const, value: C4_BURST_DAMAGE_BONUS }],
                }]
              : [],
          }
        : constellation,
    ),
  };
}

export const MUALANI_KIT_METADATA = {
  wavechaserExploitsResourceId: WAVECHASER_EXPLOITS_RESOURCE_ID,
  waveMomentumResourceId: WAVE_MOMENTUM_RESOURCE_ID,
  nightsoulBlessingDurationSeconds: NIGHTSoul_BLESSING_DURATION_SECONDS,
  a4BurstHpRatioPerStack: A4_BURST_HP_RATIO_PER_STACK,
  c1FirstBiteHpRatio: C1_FIRST_BITE_HP_RATIO,
  c4BurstDamageBonus: C4_BURST_DAMAGE_BONUS,
  unsupportedChannels: [
    "a1PufferPickupNightsoulRestorationAndTwoPufferLimit",
    "a4NightsoulBurstTriggeredWavechaserExploitGeneration",
    "c1FirstBiteOnlyAndSharkMissileDamageLifecycle",
    "c2PufferTriggeredWaveMomentumAndNightsoulRecovery",
    "c4PufferTriggeredEnergyRestoration",
    "c6C1DamageReuseLimit",
    "p3NightsoulTransmissionAndPhlogistonConsumption",
    "waveMomentumPerStackSharkysSurgingBiteCoefficientNotEmitted",
  ],
} as const;

export const mualaniWithKit = createMualaniDefinition();
