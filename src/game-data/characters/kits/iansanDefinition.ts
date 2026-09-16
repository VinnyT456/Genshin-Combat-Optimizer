/** Runtime Iansan overlay for the executable ATK and talent-level channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { iansan } from "../generated/electro";

const IANSAN_PRECISE_MOVEMENT_ATK = 0.2;
const IANSAN_PRECISE_MOVEMENT_DURATION_SECONDS = 15;
const IANSAN_C2_OFF_FIELD_ATK = 0.3;

const preciseMovementBuff: Buff = {
  id: "iansan-precise-movement",
  source: "Enhanced Resistance Training",
  sourceCharacterId: "iansan",
  startTime: 0,
  duration: IANSAN_PRECISE_MOVEMENT_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "atkPercent", value: IANSAN_PRECISE_MOVEMENT_ATK }],
};

const c2OffFieldPartyBuff: Buff = {
  id: "iansan-c2-off-field-atk",
  source: "Laziness is the Enemy!",
  sourceCharacterId: "iansan",
  startTime: 0,
  duration: IANSAN_PRECISE_MOVEMENT_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  // The active target is necessarily another character when Iansan is off
  // field. Excluding the source also prevents this aura from buffing Iansan
  // when she remains the active character after casting Burst.
  targets: { scope: "active", excludeSource: true },
  modifiers: [{ stat: "atkPercent", value: IANSAN_C2_OFF_FIELD_ATK }],
};

/** Build Iansan's generic definition at a selected constellation/talent level. */
export function createIansanDefinition(
  constellationLevel = iansan.constellationLevel,
  talentLevels: TalentLevels = iansan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? iansan.ascensionPhase;

  return {
    ...iansan,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    // Enhanced Resistance Training starts only after Swift Stormflight hits;
    // the generic post-cast buff lifecycle provides that boundary.
    skill: {
      ...iansan.skill,
      ...(ascensionPhase >= 1 ? { buffs: [preciseMovementBuff] } : {}),
    },
    burst: {
      ...iansan.burst,
      ...(level >= 2 && ascensionPhase >= 1
        ? { buffs: [preciseMovementBuff, c2OffFieldPartyBuff] }
        : {}),
    },
  };
}

export const iansanWithKit = createIansanDefinition();

export const IANSAN_KIT_METADATA = {
  preciseMovementAtk: IANSAN_PRECISE_MOVEMENT_ATK,
  preciseMovementDurationSeconds: IANSAN_PRECISE_MOVEMENT_DURATION_SECONDS,
  c2OffFieldPartyAtk: IANSAN_C2_OFF_FIELD_ATK,
  unsupportedChannels: [
    "a1NightsoulRestorationExtraPointsAndTriggerCadence",
    "a4NightsoulRestorationHealing",
    "c1NightsoulConsumptionEnergyRefund",
    "c2RequiresExplicitOffFieldPreciseMovementState",
    "c4SurgingForceAndOverflowRestoration",
    "c6OverflowTriggeredExtremeForceDamageBonus",
    "p3NightsoulTransmissionAndPhlogiston",
    "p4PhlogistonRecovery",
  ],
} as const;
