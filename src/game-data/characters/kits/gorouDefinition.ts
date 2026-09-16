/** Runtime Gorou overlay for the sourced DEF-scaling and Geo support channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { flatTalent } from "@/simulation/character/talent";
import type { Buff } from "@/simulation/buffs/types";
import { gorou } from "../generated/geo";

const GOROU_A1_DEF_PERCENT = 0.25;
const GOROU_A1_DURATION_SECONDS = 12;
const GOROU_A4_SKILL_DEF_RATIO = 1.56;
const GOROU_A4_BURST_DEF_RATIO = 0.156;
const GOROU_C6_DURATION_SECONDS = 12;
const GOROU_C6_CRIT_DAMAGE_BY_FIELD_LEVEL = { 1: 0.1, 2: 0.2, 3: 0.4 } as const;

export type GorouFieldLevel = keyof typeof GOROU_C6_CRIT_DAMAGE_BY_FIELD_LEVEL;

export interface GorouRuntimeOptions {
  /** Explicit General's Glory field level; omitted means C6 is fail-closed. */
  readonly fieldLevel?: GorouFieldLevel;
}

const a1Buff: Buff = {
  id: "gorou-a1-heedless-of-the-wind-and-weather",
  source: "Heedless of the Wind and Weather",
  sourceCharacterId: "gorou",
  startTime: 0,
  duration: GOROU_A1_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [{ stat: "defPercent", value: GOROU_A1_DEF_PERCENT }],
};

function withA4Scaling(definition: GenericCharacterDefinition): GenericCharacterDefinition {
  if (definition.skill === undefined) return definition;
  const skill = {
    ...definition.skill,
    instances: definition.skill.instances.map((instance) => ({
      ...instance,
      scaling: [...instance.scaling, { stat: "def" as const, table: flatTalent(GOROU_A4_SKILL_DEF_RATIO) }],
    })),
  };
  const burst = {
    ...definition.burst,
    instances: definition.burst.instances.map((instance) => ({
      ...instance,
      scaling: [...instance.scaling, { stat: "def" as const, table: flatTalent(GOROU_A4_BURST_DEF_RATIO) }],
    })),
  };
  return { ...definition, skill, burst };
}

function c6Buff(fieldLevel: GorouFieldLevel): Buff {
  return {
    id: "gorou-c6-valiant-hound-mountainous-fealty",
    source: "Valiant Hound: Mountainous Fealty",
    sourceCharacterId: "gorou",
    startTime: 0,
    duration: GOROU_C6_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    conditions: { elements: ["geo"] },
    modifiers: [{ stat: "critDmg", value: GOROU_C6_CRIT_DAMAGE_BY_FIELD_LEVEL[fieldLevel] }],
  };
}

export function createGorouDefinition(
  constellationLevel = gorou.constellationLevel,
  talentLevels: TalentLevels = gorou.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  options: GorouRuntimeOptions = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? gorou.ascensionPhase;
  const base: GenericCharacterDefinition = {
    ...gorou,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    // A1 and C6 start after the Burst cast, so neither buffs the triggering hit.
    burst: {
      ...gorou.burst,
      buffs: [
        ...(ascensionPhase >= 1 ? [a1Buff] : []),
        ...(level >= 6 && options.fieldLevel !== undefined ? [c6Buff(options.fieldLevel)] : []),
      ],
    },
  };
  return ascensionPhase >= 4 ? withA4Scaling(base) : base;
}

export const GOROU_KIT_METADATA = {
  a1DefPercent: GOROU_A1_DEF_PERCENT,
  a1DurationSeconds: GOROU_A1_DURATION_SECONDS,
  a4SkillDefRatio: GOROU_A4_SKILL_DEF_RATIO,
  a4BurstDefRatio: GOROU_A4_BURST_DEF_RATIO,
  c6DurationSeconds: GOROU_C6_DURATION_SECONDS,
  c6CritDamageByFieldLevel: GOROU_C6_CRIT_DAMAGE_BY_FIELD_LEVEL,
  unsupportedChannels: [
    "c1GeoHitTriggeredSkillCooldownReduction",
    "c2CrystallizeTriggeredGloryExtension",
    "c4GeneralGloryHealing",
    "c6ImplicitGeneralGloryFieldLevel",
    "p3ShiniesDetection",
  ],
} as const;

export const gorouWithKit = createGorouDefinition();
