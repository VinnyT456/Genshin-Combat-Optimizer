/** Runtime Kinich overlay for the executable, deterministic damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { kinich } from "../generated/dendro";

const KINICH_C2_CANNON_BONUS = 1;
const KINICH_C4_BURST_DMG_BONUS = 0.7;
const KINICH_C6_BOUNCE_SCALING = 7;

function c4BurstBuff(): Buff {
  return {
    id: "kinich-c4-burst-damage",
    source: "Hummingbird's Feather",
    sourceCharacterId: "kinich",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { damageTypes: ["burst"] },
    modifiers: [{ stat: "dmgBonus", value: KINICH_C4_BURST_DMG_BONUS }],
  };
}

function c2CannonInstance() {
  const cannon = kinich.skill.instances[2];
  if (!cannon) throw new Error("Missing sourced Kinich Scalespiker Cannon instance");
  return {
    ...cannon,
    id: "kinich-skill-2-c2",
    name: "Scalespiker Cannon DMG (C2)",
    scaling: [...cannon.scaling, { stat: "atk" as const, table: flatTalent(KINICH_C2_CANNON_BONUS) }],
  };
}

function c6BounceInstance() {
  const cannon = kinich.skill.instances[2];
  if (!cannon) throw new Error("Missing sourced Kinich Scalespiker Cannon instance");
  return {
    ...cannon,
    id: "kinich-skill-3-c6-bounce",
    name: "Scalespiker Cannon Bounce DMG (C6)",
    scaling: [{ stat: "atk" as const, table: flatTalent(KINICH_C6_BOUNCE_SCALING) }],
  };
}

export function createKinichDefinition(
  constellationLevel = kinich.constellationLevel,
  talentLevels: TalentLevels = kinich.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.min(Math.max(Math.trunc(constellationLevel), 0), 6);
  const skillInstances: KitAbility["instances"] = [
    ...kinich.skill.instances.slice(0, 2),
    ...(level >= 2 ? [c2CannonInstance()] : [kinich.skill.instances[2]!]),
    ...(level >= 6 ? [c6BounceInstance()] : []),
  ];

  return {
    ...kinich,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: { ...kinich.skill, instances: skillInstances },
    constellations: kinich.constellations.map((constellation) =>
      constellation.id === "kinich-c4"
        ? { ...constellation, buffs: level >= 4 ? [c4BurstBuff()] : [] }
        : constellation,
    ),
  };
}

export const kinichWithKit = createKinichDefinition();

export const KINICH_KIT_METADATA = {
  c2CannonBonus: KINICH_C2_CANNON_BONUS,
  c4BurstDmgBonus: KINICH_C4_BURST_DMG_BONUS,
  c6BounceScaling: KINICH_C6_BOUNCE_SCALING,
  unsupportedChannels: [
    "a1NightsoulPointsAndDesolationState",
    "a4HunterExperienceStacksAndCannonConsumption",
    "c1PostSwingCannonCritDamage",
    "c2DendroResReductionAndFirstCannonAoE",
    "p3PhlogistonAndNightsoulTransmission",
    "p4NatlanHarvestMovementSpeed",
  ],
} as const;
