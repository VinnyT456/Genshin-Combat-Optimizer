/** Runtime Clorinde overlay for the executable Hunter's Vigil channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { clorinde } from "../generated/electro";

const NIGHT_VIGIL_DURATION_SECONDS = 9;
const C1_ICD_SECONDS = 1.2;
const C1_SHADE_RATIO = 0.3;
const C6_CRIT_RATE = 0.1;
const C6_CRIT_DAMAGE = 0.7;
const C6_BUFF_DURATION_SECONDS = 12;

function c1ShadeAttack(): KitAbility {
  return {
    id: "clorinde-c1-nightvigil-shade",
    name: "Nightvigil Shade",
    slot: "normal",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [1, 2].map((index) => ({
      id: `clorinde-c1-nightvigil-shade-${index}`,
      name: `Nightvigil Shade DMG (${index}/2)`,
      damageType: "normal" as const,
      element: "electro" as const,
      scaling: [{ stat: "atk" as const, table: flatTalent(C1_SHADE_RATIO) }],
      application: { element: "electro" as const, gauge: 1 },
    })),
  };
}

function nightVigilStance(
  constellationLevel: number,
): StanceDefinition<NormalAttackString, KitAbility> {
  return {
    id: "clorinde-hunters-vigil-night-vigil",
    name: "Night Vigil",
    durationSeconds: NIGHT_VIGIL_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "clorinde-hunters-vigil-infusion",
      element: "electro",
      durationSeconds: NIGHT_VIGIL_DURATION_SECONDS,
      canBeOverridden: false,
    },
    ...(constellationLevel >= 1
      ? {
          triggers: [{
            id: "clorinde-c1-nightvigil-shade-trigger",
            name: "Nightvigil Shade",
            trigger: "onNormalAttack" as const,
            durationSeconds: NIGHT_VIGIL_DURATION_SECONDS,
            icdSeconds: C1_ICD_SECONDS,
            sourceCharacterId: "clorinde",
            ability: c1ShadeAttack(),
          }],
        }
      : {}),
  };
}

export function createClorindeDefinition(
  constellationLevel = clorinde.constellationLevel,
  talentLevels: TalentLevels = clorinde.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...clorinde,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...clorinde.skill,
      stance: nightVigilStance(level),
      ...(level >= 6
        ? {
            buffs: [{
              id: "clorinde-c6-nightvigil-crit",
              source: "And So Shall I Never Despair",
              sourceCharacterId: "clorinde",
              startTime: 0,
              duration: C6_BUFF_DURATION_SECONDS,
              stacking: { mode: "refresh" as const },
              targets: { scope: "self" as const },
              modifiers: [
                { stat: "critRate" as const, value: C6_CRIT_RATE },
                { stat: "critDmg" as const, value: C6_CRIT_DAMAGE },
              ],
            }],
          }
        : {}),
    },
  };
}

export const clorindeWithKit = createClorindeDefinition();

export const CLORINDE_KIT_METADATA = {
  nightVigilDurationSeconds: NIGHT_VIGIL_DURATION_SECONDS,
  c1IcdSeconds: C1_ICD_SECONDS,
  c1ShadeRatio: C1_SHADE_RATIO,
  c6CritRate: C6_CRIT_RATE,
  c6CritDamage: C6_CRIT_DAMAGE,
  c6BuffDurationSeconds: C6_BUFF_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ReactionTriggeredFlatDamage",
    "a4BondOfLifeCritRate",
    "c2ReactionTriggeredFlatDamage",
    "c4BondOfLifeBurstScaling",
    "c6GlimbrightShadeAndDamageReduction",
  ],
} as const;
