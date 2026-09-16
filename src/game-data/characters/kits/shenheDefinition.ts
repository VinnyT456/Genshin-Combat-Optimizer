/** Runtime Shenhe overlay for source-backed damage buffs expressible by the kit model. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { shenhe } from "../generated/cryo";

const BURST_FIELD_DURATION_SECONDS = 12;
const C2_BURST_FIELD_EXTENSION_SECONDS = 6;
const A1_CRYO_DAMAGE_BONUS = 0.15;
const C2_CRYO_CRIT_DAMAGE = 0.15;

const a1FieldBuff: Buff = {
  id: "shenhe-a1-deific-embrace",
  source: "Deific Embrace",
  sourceCharacterId: shenhe.id,
  startTime: 0,
  duration: BURST_FIELD_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active" },
  conditions: { elements: ["cryo"] },
  modifiers: [{ stat: "elementalDmgBonus", element: "cryo", value: A1_CRYO_DAMAGE_BONUS }],
};

const c2FieldBuff: Buff = {
  id: "shenhe-c2-centered-spirit",
  source: "Centered Spirit",
  sourceCharacterId: shenhe.id,
  startTime: 0,
  duration: BURST_FIELD_DURATION_SECONDS + C2_BURST_FIELD_EXTENSION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "active" },
  conditions: { elements: ["cryo"] },
  modifiers: [{ stat: "critDmg", value: C2_CRYO_CRIT_DAMAGE }],
};

export function createShenheDefinition(
  constellationLevel = shenhe.constellationLevel,
  talentLevels: TalentLevels = shenhe.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? shenhe.ascensionPhase;

  return {
    ...shenhe,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: shenhe.passives,
    constellations: shenhe.constellations,
    burst: {
      ...shenhe.burst,
      buffs: [
        ...(ascensionPhase >= 1 ? [a1FieldBuff] : []),
        ...(level >= 2 ? [c2FieldBuff] : []),
      ],
    },
  };
}

export const shenheWithKit = createShenheDefinition();

export const SHENHE_KIT_METADATA = {
  a1CryoDamageBonus: A1_CRYO_DAMAGE_BONUS,
  a1FieldDurationSeconds: BURST_FIELD_DURATION_SECONDS,
  c2CryoCritDamage: C2_CRYO_CRIT_DAMAGE,
  c2FieldDurationSeconds: BURST_FIELD_DURATION_SECONDS + C2_BURST_FIELD_EXTENSION_SECONDS,
  unsupportedChannels: [
    "a4TapVersusHoldDamageBonusWindow",
    "c1AdditionalSkillCharge",
    "c4SkyfrostMantraStacksAndSkillScaling",
    "c6IcyQuillNormalAndChargedQuotaExemption",
    "icyQuillFlatDamageAndTriggerQuota",
    "p3ExpeditionRewardBonus",
  ],
} as const;
