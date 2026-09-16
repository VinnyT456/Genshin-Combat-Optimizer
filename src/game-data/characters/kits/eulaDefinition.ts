/** Runtime Eula overlay for the generic state and talent-level seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { talentValueAt } from "@/simulation/character/talent";
import { eula } from "../generated/cryo";

const GRIMHEART = "eula-grimheart";
const LIGHTFALL_ENERGY = "eula-lightfall-energy";

/**
 * Eula's sourced burst row is expressed as one base hit plus a per-stack hit.
 * The generic resourceScaling seam lets C6's guaranteed five starting stacks
 * affect only that per-stack row. The probabilistic extra-stack mechanic is
 * intentionally not represented: there is no deterministic conditional-hit
 * channel in the current model.
 */
function lightfallStackScaling(definition: GenericCharacterDefinition, talentLevels: TalentLevels) {
  const instance = definition.burst.instances.find((candidate) => candidate.id === "eula-burst-3");
  if (instance === undefined) throw new Error("Missing sourced Eula Lightfall stack row");
  return {
    ...instance,
    resourceScaling: [{
      resourceId: LIGHTFALL_ENERGY,
      stat: "atk" as const,
      multiplierPerStack: talentValueAt(instance.scaling[0]!.table, talentLevels.burst),
      snapshot: "hit" as const,
    }],
  };
}

export function createEulaDefinition(
  constellationLevel = eula.constellationLevel,
  talentLevels: TalentLevels = eula.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const burstInstances = eula.burst.instances.map((instance) =>
    instance.id === "eula-burst-3" ? lightfallStackScaling(eula, talentLevels) : instance,
  );

  return {
    ...eula,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Tap Icetide Vortex consumes no stacks in the current generic action
    // vocabulary, but it does deterministically create one Grimheart stack.
    skill: { ...eula.skill, effects: [{ resourceId: GRIMHEART, kind: "gain", amount: 1 }] },
    burst: {
      ...eula.burst,
      instances: burstInstances,
      // A4 grants one Grimheart on burst. C6 resets its guaranteed opening
      // Lightfall energy to five for every burst; this runs before hit resolve.
      effects: [
        { resourceId: GRIMHEART, kind: "gain", amount: 1 },
        ...(level >= 6 ? [{ resourceId: LIGHTFALL_ENERGY, kind: "set" as const, amount: 5 }] : []),
      ],
    },
    resources: [
      { id: GRIMHEART, name: "Grimheart", initial: 0, max: 2 },
      { id: LIGHTFALL_ENERGY, name: "Lightfall Sword energy", initial: level >= 6 ? 5 : 0, max: 30 },
    ],
  };
}

export const eulaWithKit = createEulaDefinition();

export const EULA_KIT_METADATA = {
  grimheartResourceId: GRIMHEART,
  lightfallEnergyResourceId: LIGHTFALL_ENERGY,
  c6StartingStacks: 5,
  unsupportedChannels: [
    "a1ShatteredLightfallSword",
    "a4IcetideVortexCooldownReset",
    "c1GrimheartConsumptionPhysicalDmgBuff",
    "c2HoldSkillCooldownReduction",
    "c4LightfallOnlyLowHpDamageBonus",
    "c6ProbabilisticAdditionalLightfallStacks",
    "p3CraftingTalentMaterials",
  ],
} as const;
