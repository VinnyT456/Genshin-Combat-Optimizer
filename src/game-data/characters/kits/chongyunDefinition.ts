/** Runtime Chongyun kit overlay for executable, sourced extra-hit effects. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition, KitAbility } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import { chongyun } from "../generated/cryo";

const CHONGYUN_C1_BLADE_ATK_RATIO = 0.5;

/** C1's three ice blades are three separate 50% ATK Cryo hits. */
function c1IceBlade(index: number): DamageInstanceDefinition {
  return {
    id: `chongyun-c1-ice-blade-${index}`,
    name: `Ice Blade ${index}`,
    damageType: "normal",
    element: "cryo",
    scaling: [{ stat: "atk", table: flatTalent(CHONGYUN_C1_BLADE_ATK_RATIO) }],
  };
}

/** C6 summons one additional spirit blade with the burst's sourced multiplier. */
function c6SpiritBlade(): DamageInstanceDefinition {
  const source = chongyun.burst.instances[0];
  if (source === undefined) throw new Error("Chongyun burst damage instance is missing from generated data");
  return {
    ...source,
    id: "chongyun-c6-spirit-blade",
    name: "Additional Spirit Blade DMG",
    // The constellation describes an additional blade, but not a second
    // elemental application. Keep application fail-closed while preserving
    // its sourced damage multiplier.
    application: undefined,
  };
}

export function createChongyunDefinition(
  constellationLevel = chongyun.constellationLevel,
  talentLevels: TalentLevels = chongyun.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const normalAttacks = {
    ...chongyun.normalAttacks,
    hits: chongyun.normalAttacks.hits.map((hit, index) =>
      level >= 1 && index === chongyun.normalAttacks.hits.length - 1
        ? { ...hit, instances: [...hit.instances, c1IceBlade(1), c1IceBlade(2), c1IceBlade(3)] }
        : hit,
    ),
  };
  const burst: KitAbility = {
    ...chongyun.burst,
    instances: level >= 6 ? [...chongyun.burst.instances, c6SpiritBlade()] : chongyun.burst.instances,
  };

  return { ...chongyun, ...overrides, constellationLevel: level, talentLevels, normalAttacks, burst };
}

export const chongyunWithKit = createChongyunDefinition();

export const CHONGYUN_KIT_METADATA = {
  c1BladeAtkRatio: CHONGYUN_C1_BLADE_ATK_RATIO,
  c1BladeCount: 3,
  unsupportedPerks: [
    "chongyun-a1",
    "chongyun-a4",
    "chongyun-c2",
    "chongyun-c4",
    "chongyun-c6-lower-hp-damage-bonus",
    "chongyun-p3",
  ],
} as const;
