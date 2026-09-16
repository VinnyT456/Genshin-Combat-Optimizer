/** Runtime Escoffier overlay for the executable, source-verified damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { escoffier } from "../generated/cryo";

const ESCOFFIER_A4_MAX_COUNT = 4;
const ESCOFFIER_A4_RES_REDUCTION = [0, 0.05, 0.1, 0.15, 0.55] as const;
const ESCOFFIER_A4_DURATION_SECONDS = 12;
const ESCOFFIER_C1_CRYO_CRIT_DMG = 0.6;
const ESCOFFIER_C1_DURATION_SECONDS = 15;

/**
 * The generated data does not identify party elements. Callers must provide
 * the sourced Hydro/Cryo count; omitted or invalid input leaves these effects
 * inactive rather than inferring composition from character ids.
 */
export interface EscoffierPartyComposition {
  readonly hydroOrCryoCount?: number;
}

function boundedPartyCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), ESCOFFIER_A4_MAX_COUNT);
}

function a4Buff(count: number): Buff | undefined {
  const value = ESCOFFIER_A4_RES_REDUCTION[count];
  if (value === undefined || value === 0) return undefined;
  return {
    id: "escoffier-a4-hydro-cryo-res-shred",
    source: "Inspiration-Immersed Seasoning",
    sourceCharacterId: "escoffier",
    startTime: 0,
    duration: ESCOFFIER_A4_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    enemyModifiers: [
      { key: "resReduction", element: "hydro", value },
      { key: "resReduction", element: "cryo", value },
    ],
  };
}

function c1Buff(): Buff {
  return {
    id: "escoffier-c1-cryo-crit-dmg",
    source: "Pre-Dinner Dance for Your Taste Buds",
    sourceCharacterId: "escoffier",
    startTime: 0,
    duration: ESCOFFIER_C1_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    modifiers: [{ stat: "critDmg", value: ESCOFFIER_C1_CRYO_CRIT_DMG }],
  };
}

function abilityWithPostCastBuff(ability: KitAbility, buffs: readonly Buff[]): KitAbility {
  return buffs.length === 0 ? ability : { ...ability, buffs };
}

export function createEscoffierDefinition(
  constellationLevel = escoffier.constellationLevel,
  talentLevels: TalentLevels = escoffier.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: EscoffierPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.min(Math.max(Math.trunc(constellationLevel), 0), 6);
  const ascensionPhase = overrides.ascensionPhase ?? escoffier.ascensionPhase;
  const count = boundedPartyCount(composition.hydroOrCryoCount);
  const buffs: Buff[] = [];

  if (ascensionPhase >= 4) {
    const a4 = a4Buff(count);
    if (a4) buffs.push(a4);
  }
  // C1 requires the four-Hydro/Cryo A4 party condition. It is authored on
  // both damaging casts and becomes active after the triggering cast resolves.
  if (level >= 1 && ascensionPhase >= 4 && count === ESCOFFIER_A4_MAX_COUNT) {
    buffs.push(c1Buff());
  }

  return {
    ...escoffier,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    skill: abilityWithPostCastBuff(escoffier.skill, buffs),
    burst: abilityWithPostCastBuff(escoffier.burst, buffs),
  };
}

export const escoffierWithKit = createEscoffierDefinition();

export const ESCOFFIER_KIT_METADATA = {
  a4ResReductionByHydroOrCryoCount: ESCOFFIER_A4_RES_REDUCTION,
  a4DurationSeconds: ESCOFFIER_A4_DURATION_SECONDS,
  c1CryoCritDmg: ESCOFFIER_C1_CRYO_CRIT_DMG,
  c1DurationSeconds: ESCOFFIER_C1_DURATION_SECONDS,
  unsupportedChannels: [
    "a1RehabDietHealing",
    "c2FreshlyPreppedDelicacyColdDishStacksAndCryoDamageBonus",
    "c4RehabDietExtraHealingAndEnergy",
    "c6ColdStorageSpecialGradeFrostyParfait",
    "p3OffTheCuffCookeryCookingMek",
  ],
} as const;
