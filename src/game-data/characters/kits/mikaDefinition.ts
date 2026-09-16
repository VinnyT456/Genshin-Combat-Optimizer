/** Runtime Mika overlay for executable Detector and constellation damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { mika } from "../generated/cryo";

const DETECTOR_RESOURCE_ID = "mika-detector";
const SOULWIND_DURATION_SECONDS = 12;
const DETECTOR_PHYSICAL_DAMAGE_BONUS = 0.1;
const C6_PHYSICAL_CRIT_DAMAGE = 0.6;
const BASE_DETECTOR_MAX_STACKS = 3;

function detectorCondition(value: number) {
  return {
    resources: [{ resourceId: DETECTOR_RESOURCE_ID, comparator: "gte" as const, value, owner: "source" as const }],
    elements: ["physical" as const],
  };
}

/** Each threshold contributes one sourced 10% Physical DMG Detector stack. */
function detectorBuffs(maxStacks: number): readonly Buff[] {
  return Array.from({ length: maxStacks }, (_, index) => ({
    id: `mika-a1-detector-${index + 1}`,
    source: "Suppressive Barrage",
    sourceCharacterId: mika.id,
    startTime: 0,
    duration: SOULWIND_DURATION_SECONDS,
    stacking: { mode: "refresh" as const },
    targets: { scope: "party" as const },
    conditions: detectorCondition(index + 1),
    modifiers: [{ stat: "elementalDmgBonus" as const, element: "physical" as const, value: DETECTOR_PHYSICAL_DAMAGE_BONUS }],
  }));
}

function c6PhysicalCritDamageBuff(): Buff {
  return {
    id: "mika-c6-companions-counsel",
    source: "Companion's Counsel",
    sourceCharacterId: mika.id,
    startTime: 0,
    duration: SOULWIND_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    conditions: detectorCondition(1),
    modifiers: [{ stat: "critDmg", value: C6_PHYSICAL_CRIT_DAMAGE }],
  };
}

export function createMikaDefinition(
  constellationLevel = mika.constellationLevel,
  talentLevels: TalentLevels = mika.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? mika.ascensionPhase;
  const maxDetectorStacks = BASE_DETECTOR_MAX_STACKS + (ascensionPhase >= 4 ? 1 : 0) + (level >= 6 ? 1 : 0);

  return {
    ...mika,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    resources: [{
      id: DETECTOR_RESOURCE_ID,
      name: "Detector",
      initial: 0,
      max: maxDetectorStacks,
      durationSeconds: SOULWIND_DURATION_SECONDS,
    }],
    skill: {
      ...mika.skill,
      // The generic state seam cannot count per-target hits, so one deterministic
      // Detector is granted per Skill cast; additional hit-specific gains stay unsupported.
      effects: [{ resourceId: DETECTOR_RESOURCE_ID, kind: "gain", amount: 1 }],
      buffs: [
        ...detectorBuffs(maxDetectorStacks),
        ...(level >= 6 ? [c6PhysicalCritDamageBuff()] : []),
      ],
    },
  };
}

export const MIKA_KIT_METADATA = {
  detectorResourceId: DETECTOR_RESOURCE_ID,
  soulwindDurationSeconds: SOULWIND_DURATION_SECONDS,
  detectorPhysicalDamageBonus: DETECTOR_PHYSICAL_DAMAGE_BONUS,
  baseDetectorMaxStacks: BASE_DETECTOR_MAX_STACKS,
  c6PhysicalCritDamage: C6_PHYSICAL_CRIT_DAMAGE,
  unsupportedChannels: [
    "a1PerAdditionalOpponentHitDetectorStack",
    "a1PerRimestarShardDetectorStack",
    "a4CriticalHitDetectorStackAndAdditionalMaximum",
    "c1SoulwindHealingIntervalReduction",
    "c2FlowfrostArrowAndRimestarFlareDetectorStackGeneration",
    "c4EagleplumeEnergyRefund",
    "c6ExactDetectorMaximumBeyondDeterministicSkillCastGain",
    "p3MondstadtResourceMinimapDisplay",
  ],
} as const;

export const mikaWithKit = createMikaDefinition();
