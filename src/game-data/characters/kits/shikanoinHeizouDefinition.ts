/** Runtime overlay for Shikanoin Heizou's sourced Declension damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { talentTable, talentValueAt } from "@/simulation/character/talent";
import type { Buff } from "@/simulation/buffs/types";
import { shikanoinHeizou } from "../generated/anemo";

const DECLENSION_RESOURCE_ID = "shikanoin-heizou-declension";
const DECLENSION_MAX = 4;

// KQM TCL Heartstopper Strike table: per-stack Declension DMG bonus.
const DECLENSION_DAMAGE_PER_STACK = talentTable([
  0.5688, 0.6114, 0.654, 0.711, 0.7536, 0.7962, 0.8526, 0.9096, 0.9666,
  1.0236, 1.0806, 1.1376, 1.2087, 1.2798, 1.3509,
]);

function c6CritBuffs(): Buff[] {
  const buffs: Buff[] = [];
  for (let stacks = 1; stacks <= DECLENSION_MAX; stacks += 1) {
    buffs.push({
      id: `shikanoin-heizou-c6-declension-${stacks}`,
      source: "Curious Casefiles",
      sourceCharacterId: shikanoinHeizou.id,
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: {
        abilityIds: ["shikanoin-heizou-skill"],
        resources: [{ resourceId: DECLENSION_RESOURCE_ID, comparator: "gte", value: stacks }],
      },
      modifiers: [{ stat: "critRate", value: 0.04 }],
    });
  }
  buffs.push({
    id: "shikanoin-heizou-c6-conviction-crit-dmg",
    source: "Curious Casefiles",
    sourceCharacterId: shikanoinHeizou.id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: {
      abilityIds: ["shikanoin-heizou-skill"],
      resources: [{ resourceId: DECLENSION_RESOURCE_ID, comparator: "gte", value: DECLENSION_MAX }],
    },
    modifiers: [{ stat: "critDmg", value: 0.32 }],
  });
  return buffs;
}

/**
 * Build Heizou's generic kit. `declensionStacks` is an explicit scenario input;
 * the engine cannot currently grant stacks from Swirl or held-Skill charge.
 */
export function createShikanoinHeizouDefinition(
  constellationLevel = shikanoinHeizou.constellationLevel,
  talentLevels: TalentLevels = shikanoinHeizou.talentLevels,
  declensionStacks = 0,
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const stacks = Math.max(0, Math.min(DECLENSION_MAX, Math.trunc(declensionStacks)));
  const declensionMultiplier = talentValueAt(DECLENSION_DAMAGE_PER_STACK, talentLevels.skill);
  return {
    ...shikanoinHeizou,
    constellationLevel: level,
    talentLevels,
    resources: [{
      id: DECLENSION_RESOURCE_ID,
      name: "Declension",
      initial: stacks,
      max: DECLENSION_MAX,
      durationSeconds: 60,
    }],
    skill: {
      ...shikanoinHeizou.skill,
      instances: shikanoinHeizou.skill.instances.map((instance) => ({
        ...instance,
        resourceScaling: [{
          resourceId: DECLENSION_RESOURCE_ID,
          stat: "atk",
          multiplierPerStack: declensionMultiplier,
          snapshot: "hit",
        }],
      })),
    },
    constellations: shikanoinHeizou.constellations.map((constellation) => {
      if (constellation.level === 6 && level >= 6) {
        return { ...constellation, buffs: c6CritBuffs() };
      }
      return constellation;
    }),
  };
}

export const SHIKANOIN_HEIZOU_KIT_METADATA = {
  declensionResourceId: DECLENSION_RESOURCE_ID,
  declensionMaxStacks: DECLENSION_MAX,
  unsupportedChannels: [
    "a1SwirlTriggeredDeclensionGain",
    "skillHoldChargeAndConvictionDamageBonus",
    "a4PartyElementalMasteryBuff",
    "c1NormalAttackSpeedAndFieldEntryStack",
    "c2BurstPullAndDuration",
    "c4BurstExplosionEnergyRefund",
    "c6ConvictionSkillDamageBonus",
    "p3SprintingStaminaReduction",
    "burstAbsorbedElementAndPerTargetIris",
  ],
} as const;

export const shikanoinHeizouWithKit = createShikanoinHeizouDefinition();
