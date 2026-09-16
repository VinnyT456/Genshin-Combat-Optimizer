/** Runtime Baizhu kit overlay for the executable C6 damage channel. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { flatTalent } from "@/simulation/character/talent";
import { baizhu } from "../generated/dendro";

const BAIZHU_C6_SPIRITVEIN_HP_RATIO = 0.08;

export function createBaizhuDefinition(
  constellationLevel = baizhu.constellationLevel,
  talentLevels: TalentLevels = baizhu.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const burstInstance = baizhu.burst.instances[0];
  if (burstInstance === undefined) {
    throw new Error("Baizhu burst is missing its sourced Spiritvein row");
  }

  return {
    ...baizhu,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...baizhu.burst,
      instances: [
        {
          ...burstInstance,
          scaling:
            level >= 6
              ? [
                  ...burstInstance.scaling,
                  { stat: "hp", table: flatTalent(BAIZHU_C6_SPIRITVEIN_HP_RATIO) },
                ]
              : burstInstance.scaling,
        },
      ],
    },
  };
}

export const baizhuWithKit = createBaizhuDefinition();

export const BAIZHU_C6_METADATA = {
  spiritveinMaxHpRatio: BAIZHU_C6_SPIRITVEIN_HP_RATIO,
  support: "modelled",
} as const;
