/** Runtime Jahoda overlay for executable, data-backed damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { jahoda } from "../generated/anemo";

const JAHODA_A1_ROBOT_DAMAGE_MULTIPLIER = 1.3;

/**
 * Explicit party composition used by Plan to Get Paid.
 *
 * Generated data does not infer elements from a caller's party, so omitted
 * counts deliberately leave the passive inactive. Ties follow the sourced
 * priority Pyro > Hydro > Electro > Cryo.
 */
export interface JahodaPartyComposition {
  readonly pyroCount?: number;
  readonly hydroCount?: number;
  readonly electroCount?: number;
  readonly cryoCount?: number;
}

type TrackedElement = keyof JahodaPartyComposition;

const ELEMENT_PRIORITY: readonly TrackedElement[] = ["pyroCount", "hydroCount", "electroCount", "cryoCount"];

function boundedCount(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function dominantElement(composition: JahodaPartyComposition): TrackedElement | undefined {
  let dominant: TrackedElement | undefined;
  let highest = 0;
  for (const element of ELEMENT_PRIORITY) {
    const count = boundedCount(composition[element]);
    if (count > highest) {
      highest = count;
      dominant = element;
    }
  }
  return dominant;
}

function withRobotDamageMultiplier(
  instance: DamageInstanceDefinition,
): DamageInstanceDefinition {
  return {
    ...instance,
    scaling: instance.scaling.map((term) => ({
      ...term,
      table: {
        values: term.table.values.map((multiplier) => multiplier * JAHODA_A1_ROBOT_DAMAGE_MULTIPLIER),
      },
    })),
  };
}

export function createJahodaDefinition(
  constellationLevel = jahoda.constellationLevel,
  talentLevels: TalentLevels = jahoda.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  composition: JahodaPartyComposition = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const a1 = jahoda.passives.find((passive) => passive.id === "jahoda-a1");
  if (!a1) throw new Error("Jahoda A1 passive is missing from generated data");

  const robotEnhanced =
    (overrides.ascensionPhase ?? jahoda.ascensionPhase) >= 1 &&
    dominantElement(composition) === "pyroCount";

  return {
    ...jahoda,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...jahoda.burst,
      instances: robotEnhanced
        ? jahoda.burst.instances.map((instance) =>
            instance.id === "jahoda-burst-2" ? withRobotDamageMultiplier(instance) : instance,
          )
        : jahoda.burst.instances,
    },
  };
}

export const jahodaWithKit = createJahodaDefinition();

export const JAHODA_KIT_METADATA = {
  a1RobotDamageMultiplier: JAHODA_A1_ROBOT_DAMAGE_MULTIPLIER,
  unsupportedChannels: [
    "a1HydroHealingElectroRobotCountCryoIntervalReduction",
    "a4RobotHealingTriggeredElementalMastery",
    "c1MeowballBounceChanceAndNearbyDamage",
    "c2SecondDominantElementEffect",
    "c4ElementalConversionEnergyRestore",
    "c6MoonsignPartyCritBuffAfterFullFlask",
    "p3PartyMoonsignLevel",
    "p4MoonsignExplorationMovement",
  ],
} as const;
