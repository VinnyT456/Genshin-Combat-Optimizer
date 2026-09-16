/** Runtime Collei overlay for executable, sourced passive/constellation channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition, KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { collei } from "../generated/dendro";

const COLLEI_C1_ER_BONUS = 0.2;
const COLLEI_C4_EM_BONUS = 60;
const COLLEI_C4_DURATION_SECONDS = 12;
const COLLEI_C6_EXTRA_ATK_RATIO = 2;

const c1ErBuff: Buff = {
  id: "collei-c1-deepwood-patrol",
  source: "Deepwood Patrol",
  sourceCharacterId: "collei",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { requiresOnField: false },
  modifiers: [{ stat: "energyRecharge", value: COLLEI_C1_ER_BONUS }],
};

const c4EmBuff: Buff = {
  id: "collei-c4-gift-of-the-woods",
  source: "Gift of the Woods",
  sourceCharacterId: "collei",
  startTime: 0,
  duration: COLLEI_C4_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party", excludeSource: true },
  modifiers: [{ stat: "elementalMastery", value: COLLEI_C4_EM_BONUS }],
};

function c6MiniatureCuileinAnbar(): DamageInstanceDefinition {
  const source = collei.skill.instances[0];
  if (source === undefined) throw new Error("Collei skill is missing its Floral Ring row");
  return {
    ...source,
    id: "collei-c6-miniature-cuilein-anbar",
    name: "Miniature Cuilein-Anbar DMG",
    scaling: [{ stat: "atk", table: flatTalent(COLLEI_C6_EXTRA_ATK_RATIO) }],
  };
}

export function createColleiDefinition(
  constellationLevel = collei.constellationLevel,
  talentLevels: TalentLevels = collei.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const passives = collei.passives.map((passive) =>
    passive.id === "collei-a1" && level >= 1
      ? { ...passive, buffs: [c1ErBuff] }
      : passive,
  );
  const skill: KitAbility = {
    ...collei.skill,
    instances: level >= 6
      ? [...collei.skill.instances, c6MiniatureCuileinAnbar()]
      : collei.skill.instances,
  };

  return {
    ...collei,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives,
    skill,
    burst: {
      ...collei.burst,
      ...(level >= 4 ? { buffs: [c4EmBuff] } : {}),
    },
  };
}

export const colleiWithKit = createColleiDefinition();

export const COLLEI_KIT_METADATA = {
  c1EnergyRechargeBonus: COLLEI_C1_ER_BONUS,
  c4ElementalMasteryBonus: COLLEI_C4_EM_BONUS,
  c4DurationSeconds: COLLEI_C4_DURATION_SECONDS,
  c6ExtraAtkRatio: COLLEI_C6_EXTRA_ATK_RATIO,
  unsupportedChannels: [
    "a1SproutReactionGateAndDamageOverTime",
    "a4SproutDurationExtension",
    "c2SproutReplacementAndExtension",
    "p3GlidingStamina",
  ],
} as const;
