/** Runtime Layla kit overlay for the sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { layla } from "../generated/cryo";

const A4_SHOOTING_STAR_HP_RATIO = 0.015;
const C6_SHOOTING_STAR_DAMAGE_MULTIPLIER = 1.4;
const C6_STARLIGHT_SLUG_DAMAGE_MULTIPLIER = 1.4;

function withHpScaling(
  instance: DamageInstanceDefinition,
  ratio: number,
): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: [...instance.scaling, { stat: "hp", table: { values: [ratio] } }],
  };
}

function withDamageMultiplier(
  instance: DamageInstanceDefinition,
  multiplier: number,
): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: instance.scaling.map((term) => ({
      ...term,
      table: { values: term.table.values.map((value) => value * multiplier) },
    })),
  };
}

export function createLaylaDefinition(
  constellationLevel = layla.constellationLevel,
  talentLevels: TalentLevels = layla.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? layla.ascensionPhase;

  const skillInstances = layla.skill.instances.map((instance) => {
    const withA4 = ascensionPhase >= 4 && instance.id === "layla-skill-2"
      ? withHpScaling(instance, A4_SHOOTING_STAR_HP_RATIO)
      : instance;
    return level >= 6 && instance.id === "layla-skill-2"
      ? withDamageMultiplier(withA4, C6_SHOOTING_STAR_DAMAGE_MULTIPLIER)
      : withA4;
  });
  const burstInstances = layla.burst.instances.map((instance) =>
    level >= 6 && instance.id === "layla-burst-1"
      ? withDamageMultiplier(instance, C6_STARLIGHT_SLUG_DAMAGE_MULTIPLIER)
      : instance,
  );

  return {
    ...layla,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill: { ...layla.skill, instances: skillInstances },
    burst: { ...layla.burst, instances: burstInstances },
  };
}

export const LAYLA_KIT_METADATA = {
  a4ShootingStarHpRatio: A4_SHOOTING_STAR_HP_RATIO,
  c6ShootingStarDamageMultiplier: C6_SHOOTING_STAR_DAMAGE_MULTIPLIER,
  c6StarlightSlugDamageMultiplier: C6_STARLIGHT_SLUG_DAMAGE_MULTIPLIER,
  unsupportedChannels: [
    "a1DeepSleepShieldStrengthStacks",
    "c1ShieldAbsorptionAndPartyShieldLifecycle",
    "c2ShootingStarEnergyRestore",
    "c4DawnStarNormalChargedDamageBuffLifecycle",
    "p3TalentMaterialCraftingBonus",
  ],
} as const;

export const laylaWithKit = createLaylaDefinition();
