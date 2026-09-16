/** Runtime Jean overlay for the executable, generated-data-backed kit. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { jean } from "../generated/anemo";

const JEAN_C4_FIELD_DURATION_SECONDS = 10;

const c4FieldBuff: Buff = {
  id: "jean-c4-dandelion-field-anemo-shred",
  source: "Lands of Dandelion",
  sourceCharacterId: "jean",
  startTime: 0,
  duration: JEAN_C4_FIELD_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  enemyModifiers: [{ key: "resReduction", element: "anemo", value: 0.4 }],
};

/**
 * Jean's generated C3/C5 rows already carry the generic talent-level boost
 * buffs. This factory normalizes constellation/talent inputs while preserving
 * those sourced rows and the generated attack tables.
 */
export function createJeanDefinition(
  constellationLevel = jean.constellationLevel,
  talentLevels: TalentLevels = jean.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.min(Math.max(Math.trunc(constellationLevel), 0), 6);

  return {
    ...jean,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...jean.burst,
      ...(level >= 4 ? { buffs: [c4FieldBuff] } : {}),
    },
  };
}

export const jeanWithKit = createJeanDefinition();

export const JEAN_KIT_METADATA = {
  supportedChannels: ["c3BurstTalentLevel", "c4DandelionFieldAnemoResReduction", "c5SkillTalentLevel"],
  c4FieldDurationSeconds: JEAN_C4_FIELD_DURATION_SECONDS,
  unsupportedChannels: [
    "a1WindCompanionNormalAttackHealing",
    "a4LetTheWindLeadBurstEnergyRegeneration",
    "c1SpiralingTempestHeldSkillDamageAndPullSpeed",
    "c2PeoplesAegisParticleTriggeredAttackSpeed",
    "c6LionsFangFieldGatedIncomingDamageReduction",
    "p3GuidingBreezeCookingProc",
  ],
} as const;
