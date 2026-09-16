/** Runtime Charlotte overlay for the executable, data-backed A4 channel. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { charlotte } from "../generated/cryo";

const CHARLOTTE_A4_MAX_COUNT = 3;
const CHARLOTTE_A4_CRYO_DMG_PER_NON_FONTAINIAN = 0.05;

/**
 * Party tags required by Diversified Investigation.
 *
 * Generated character data intentionally does not infer nation membership.
 * Callers must provide sourced party counts; omitted counts leave the passive
 * inactive rather than guessing from character ids.
 */
export interface CharlottePartyComposition {
  readonly fontainianCount?: number;
  readonly nonFontainianCount?: number;
}

function boundedCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), CHARLOTTE_A4_MAX_COUNT);
}

function a4Buff(composition: CharlottePartyComposition): Buff | undefined {
  const nonFontainianCount = boundedCount(composition.nonFontainianCount);
  if (nonFontainianCount === 0) return undefined;
  return {
    id: "charlotte-a4-diversified-investigation",
    source: "Diversified Investigation",
    sourceCharacterId: "charlotte",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [
      {
        stat: "elementalDmgBonus",
        element: "cryo",
        value: nonFontainianCount * CHARLOTTE_A4_CRYO_DMG_PER_NON_FONTAINIAN,
      },
    ],
  };
}

export function createCharlotteDefinition(
  constellationLevel = charlotte.constellationLevel,
  talentLevels: TalentLevels = charlotte.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: CharlottePartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const a4 = charlotte.passives.find((passive) => passive.id === "charlotte-a4");
  if (!a4) throw new Error("Charlotte A4 passive is missing from generated data");

  const a4Modifier =
    (overrides.ascensionPhase ?? charlotte.ascensionPhase) >= 4
      ? a4Buff(composition)
      : undefined;

  return {
    ...charlotte,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: charlotte.passives.map((passive) =>
      passive.id === a4.id
        ? { ...passive, buffs: a4Modifier === undefined ? [] : [a4Modifier] }
        : passive,
    ),
  };
}

export const charlotteWithKit = createCharlotteDefinition();

export const CHARLOTTE_KIT_METADATA = {
  a4CryoDmgPerNonFontainian: CHARLOTTE_A4_CRYO_DMG_PER_NON_FONTAINIAN,
  a4MaximumCount: CHARLOTTE_A4_MAX_COUNT,
  unsupportedChannels: [
    "a1MarkedTargetDefeatCooldownReduction",
    "c1VerificationHealing",
    "c2SkillHitCountAtkBuff",
    "c4MarkedTargetBurstDamageAndEnergy",
    "c6NormalChargedCoordinatedAttackAndHealing",
    "p3SpecialAnalysisZoomLens",
  ],
} as const;
