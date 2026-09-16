/** Runtime Citlali overlay for the executable, sourced A4/C2/C4 channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { citlali } from "../generated/cryo";

const CITLALI_A4_SKILL_EM_RATIO = 0.9;
const CITLALI_A4_BURST_EM_RATIO = 12;
const CITLALI_C2_SELF_EM = 125;
const CITLALI_C4_SKULL_EM_RATIO = 18;

function withEmScaling(instance: DamageInstanceDefinition, ratio: number): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: [...instance.scaling, { stat: "elementalMastery", table: flatTalent(ratio) }],
  };
}

function c2SelfEmBuff(): Buff {
  return {
    id: "citlali-c2-self-em",
    source: "Heart Devourer's Travail",
    sourceCharacterId: "citlali",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "elementalMastery", value: CITLALI_C2_SELF_EM }],
  };
}

function c4Skull(source: DamageInstanceDefinition): DamageInstanceDefinition {
  return {
    ...source,
    id: "citlali-c4-spiritvessel-skull",
    name: "Additional Obsidian Spiritvessel Skull DMG",
    scaling: [{ stat: "elementalMastery", table: flatTalent(CITLALI_C4_SKULL_EM_RATIO) }],
    damageType: "skill",
    application: undefined,
  };
}

export function createCitlaliDefinition(
  constellationLevel = citlali.constellationLevel,
  talentLevels: TalentLevels = citlali.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? citlali.ascensionPhase;
  const skillInstances = citlali.skill.instances.map((instance) =>
    ascensionPhase >= 4 && instance.id === "citlali-skill-2"
      ? withEmScaling(instance, CITLALI_A4_SKILL_EM_RATIO)
      : instance,
  );
  const burstInstances = citlali.burst.instances.map((instance) =>
    ascensionPhase >= 4 && instance.id === "citlali-burst-1"
      ? withEmScaling(instance, CITLALI_A4_BURST_EM_RATIO)
      : instance,
  );
  const frostfallStorm = citlali.skill.instances.find((instance) => instance.id === "citlali-skill-2");
  if (frostfallStorm === undefined) {
    throw new Error("Citlali generated skill is missing its sourced Frostfall Storm row");
  }
  const skill = {
    ...citlali.skill,
    instances: level >= 4
      ? [...skillInstances, c4Skull(frostfallStorm)]
      : skillInstances,
  };

  return {
    ...citlali,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill,
    burst: { ...citlali.burst, instances: burstInstances },
    constellations: citlali.constellations.map((constellation) =>
      constellation.level === 2
        ? { ...constellation, buffs: [...(constellation.buffs ?? []), c2SelfEmBuff()] }
        : constellation,
    ),
  };
}

export const citlaliWithKit = createCitlaliDefinition();

export const CITLALI_KIT_METADATA = {
  a4SkillEmRatio: CITLALI_A4_SKILL_EM_RATIO,
  a4BurstEmRatio: CITLALI_A4_BURST_EM_RATIO,
  c2SelfEm: CITLALI_C2_SELF_EM,
  c4SkullEmRatio: CITLALI_C4_SKULL_EM_RATIO,
  unsupportedChannels: [
    "a1FrozenMeltPyroHydroResReductionAndNightsoul",
    "a4NightsoulBurstRecovery",
    "c1StellarBladeStacks",
    "c2PartyShieldAndShieldedPartyEm",
    "c4NightsoulRecoveryAndEnergy",
    "c6CifraOfTheSecretLaw",
    "p3NightsoulTransmission",
    "p4PhlogistonRecovery",
  ],
} as const;
