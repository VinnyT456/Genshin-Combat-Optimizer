/** Runtime Sayu overlay for sourced, executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { sayu } from "../generated/anemo";

const C2_TAP_KICK_DAMAGE_INCREASE = 0.033;

export function createSayuDefinition(
  constellationLevel = sayu.constellationLevel,
  talentLevels: TalentLevels = sayu.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const skill = level >= 2
    ? {
        ...sayu.skill,
        instances: sayu.skill.instances.map((instance) =>
          instance.id === "sayu-skill-4"
            ? {
                ...instance,
                scaling: instance.scaling.map((term) => ({
                  ...term,
                  table: {
                    ...term.table,
                    values: term.table.values.map((value) => value * (1 + C2_TAP_KICK_DAMAGE_INCREASE)),
                  },
                })),
              }
            : instance,
        ),
      }
    : sayu.skill;

  return {
    ...sayu,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill,
    // Generated C3/C5 buffs carry the sourced burst/skill talent boosts.
    constellations: sayu.constellations,
  };
}

export const SAYU_KIT_METADATA = {
  c2TapKickDamageIncrease: C2_TAP_KICK_DAMAGE_INCREASE,
  unsupportedChannels: [
    "c2WindwheelDurationBasedKickDamageStacks",
    "c6DarumaElementalMasteryDamageConversion",
    "a1SwirlTriggeredHealing",
    "a4DarumaHealingAndAreaChanges",
    "c1DarumaSimultaneousAttackAndHealing",
    "c4SwirlEnergyRestoration",
    "p3WildlifeStealth",
  ],
} as const;

export const sayuWithKit = createSayuDefinition();
