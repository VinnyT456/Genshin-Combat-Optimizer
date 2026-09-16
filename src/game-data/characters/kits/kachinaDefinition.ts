/** Runtime Kachina overlay for Turbo Twirly damage and explicit field state. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { flatTalent } from "@/simulation/character/talent";
import type { Buff } from "@/simulation/buffs/types";
import { kachina } from "../generated/geo";

const KACHINA_A4_DEF_RATIO = 0.2;
const KACHINA_C4_DEF_BY_OPPONENTS = [0, 0.08, 0.12, 0.16, 0.2] as const;
const KACHINA_C4_FIELD_DURATION_SECONDS = 12;

export interface KachinaRuntimeOptions {
  /** Number of opponents in the Turbo Drill Field; omitted means C4 is inert. */
  readonly turboDrillFieldOpponents?: number;
}

function withA4TurboTwirlyScaling(
  definition: GenericCharacterDefinition,
  ascensionPhase: number,
): GenericCharacterDefinition {
  if (ascensionPhase < 4) return definition;
  return {
    ...definition,
    skill: {
      ...definition.skill,
      // Both generated skill instances are Turbo Twirly damage. A4 adds 20%
      // of Kachina's DEF to each instance; it is not a generic Geo bonus.
      instances: definition.skill.instances.map((instance) => ({
        ...instance,
        scaling: [...instance.scaling, { stat: "def" as const, table: flatTalent(KACHINA_A4_DEF_RATIO) }],
      })),
    },
  };
}

function c4FieldBuff(opponents: number): Buff | undefined {
  const count = Math.max(0, Math.min(4, Math.trunc(opponents)));
  const value = KACHINA_C4_DEF_BY_OPPONENTS[count];
  if (value === undefined || value === 0) return undefined;
  return {
    id: "kachina-c4-turbo-drill-field",
    source: "More Foes, More Caution",
    sourceCharacterId: "kachina",
    startTime: 0,
    duration: KACHINA_C4_FIELD_DURATION_SECONDS,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [{ stat: "defPercent", value }],
  };
}

export function createKachinaDefinition(
  constellationLevel = kachina.constellationLevel,
  talentLevels: TalentLevels = kachina.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
  options: KachinaRuntimeOptions = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? kachina.ascensionPhase;
  const fieldBuff = level >= 4 && options.turboDrillFieldOpponents !== undefined
    ? c4FieldBuff(options.turboDrillFieldOpponents)
    : undefined;

  const definition = {
    ...kachina,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    constellations: kachina.constellations,
    burst: {
      ...kachina.burst,
      buffs: fieldBuff === undefined ? [] : [fieldBuff],
    },
  } satisfies GenericCharacterDefinition;

  return withA4TurboTwirlyScaling(definition, ascensionPhase);
}

export const kachinaWithKit = createKachinaDefinition();

export const KACHINA_KIT_METADATA = {
  a4TurboTwirlyDefRatio: KACHINA_A4_DEF_RATIO,
  c4DefBonusByFieldOpponents: KACHINA_C4_DEF_BY_OPPONENTS,
  c4FieldDurationSeconds: KACHINA_C4_FIELD_DURATION_SECONDS,
  unsupportedChannels: [
    "a1NightsoulBurstTriggeredGeoDamageBonus",
    "c1CrystallizeShardAbsorptionAndEnergy",
    "c2NightsoulPointsAndBlessingState",
    "c6ShieldReplacementTriggeredGeoDamage",
    "p3NightsoulTransmissionAndPhlogiston",
    "p4NatlanHarvestableStaminaAndMinimap",
  ],
} as const;
