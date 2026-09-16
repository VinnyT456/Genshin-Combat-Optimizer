/** Runtime Nilou overlay for executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { nilou } from "../generated/hydro";

const C1_LUMINOUS_ILLUSION_MULTIPLIER = 1.65;
const C6_CRIT_RATE_PER_HP_STEP = 0.006;
const C6_CRIT_DMG_PER_HP_STEP = 0.012;
const C6_MAX_HP_STEPS = 50;
const C6_HP_STEP = 1_000;
const C6_HP_THRESHOLD = 30_000;

function multiplyScaling(
  instance: (typeof nilou.skill.instances)[number],
  multiplier: number,
) {
  return {
    ...instance,
    scaling: instance.scaling.map((term) => ({
      ...term,
      table: { values: term.table.values.map((value) => value * multiplier) },
    })),
  };
}

export function createNilouDefinition(
  constellationLevel = nilou.constellationLevel,
  talentLevels: TalentLevels = nilou.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const maxHp = overrides.baseStats?.hp ?? nilou.baseStats.hp;
  const c6HpSteps = Math.min(
    C6_MAX_HP_STEPS,
    Math.max(0, Math.floor((maxHp - C6_HP_THRESHOLD) / C6_HP_STEP)),
  );
  const baseStats = level >= 6
    ? {
        ...(overrides.baseStats ?? nilou.baseStats),
        critRate: (overrides.baseStats?.critRate ?? nilou.baseStats.critRate)
          + c6HpSteps * C6_CRIT_RATE_PER_HP_STEP,
        critDmg: (overrides.baseStats?.critDmg ?? nilou.baseStats.critDmg)
          + c6HpSteps * C6_CRIT_DMG_PER_HP_STEP,
      }
    : overrides.baseStats;

  return {
    ...nilou,
    ...overrides,
    ...(baseStats === undefined ? {} : { baseStats }),
    constellationLevel: level,
    talentLevels,
    skill: {
      ...nilou.skill,
      instances: nilou.skill.instances.map((instance) =>
        level >= 1 && instance.id === "nilou-skill-6"
          ? multiplyScaling(instance, C1_LUMINOUS_ILLUSION_MULTIPLIER)
          : instance,
      ),
    },
  };
}

export const NILOU_KIT_METADATA = {
  c1LuminousIllusionMultiplier: C1_LUMINOUS_ILLUSION_MULTIPLIER,
  c6CritRatePerHpStep: C6_CRIT_RATE_PER_HP_STEP,
  c6CritDmgPerHpStep: C6_CRIT_DMG_PER_HP_STEP,
  c6MaxHpSteps: C6_MAX_HP_STEPS,
  unsupportedChannels: [
    "a1GoldenChalicesBountyPartyCompositionAndBountifulCoreConversion",
    "a4BountifulCoreDamageBonus",
    "c1TranquilityAuraDurationExtension",
    "c2GoldenChalicesBountyHydroAndDendroResistanceReduction",
    "c4ThirdDanceStepHitEnergyAndBurstDamageWindow",
    "p3DoubleAdventureFoodChance",
  ],
} as const;

export const nilouWithKit = createNilouDefinition();
