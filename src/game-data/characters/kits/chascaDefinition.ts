/** Runtime Chasca kit overlay for the executable sourced C2/C4 effects. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import { chasca } from "../generated/anemo";

const CHASCA_C2_AOE_ATK_RATIO = 4;
const CHASCA_C4_AOE_ATK_RATIO = 4;
const CHASCA_C4_ENERGY_RESTORE = 1.5;

function extraChargedHit(id: string, name: string) {
  return {
    id,
    name,
    damageType: "charged" as const,
    element: "anemo" as const,
    scaling: [{ stat: "atk" as const, table: flatTalent(CHASCA_C2_AOE_ATK_RATIO) }],
  };
}

export function createChascaDefinition(
  constellationLevel = chasca.constellationLevel,
  talentLevels: TalentLevels = chasca.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const skillInstances = [...chasca.skill.instances];
  const burstInstances = [...chasca.burst.instances];
  if (level >= 2) skillInstances.push(extraChargedHit("chasca-c2-skill-aoe", "Muzzle AoE Elemental DMG"));
  if (level >= 4) burstInstances.push(extraChargedHit("chasca-c4-burst-aoe", "Sparks AoE Elemental DMG"));

  const skill: KitAbility = { ...chasca.skill, instances: skillInstances };
  const burst: KitAbility = {
    ...chasca.burst,
    instances: burstInstances,
    ...(level >= 4 ? { energyGenerated: CHASCA_C4_ENERGY_RESTORE } : {}),
  };
  return { ...chasca, ...overrides, constellationLevel: level, talentLevels, skill, burst };
}

export const chascaWithKit = createChascaDefinition();

export const CHASCA_KIT_METADATA = {
  c2AoeAtkRatio: CHASCA_C2_AOE_ATK_RATIO,
  c4AoeAtkRatio: CHASCA_C4_AOE_ATK_RATIO,
  c4EnergyRestore: CHASCA_C4_ENERGY_RESTORE,
} as const;
