/**
 * Runtime overlay for Aloy's one executable sourced perk.
 *
 * Frozen Wilds creates Coil pickups in-game. The current generic kit seam has
 * no ability-local pickup lifecycle, so this overlay records the first Coil as
 * a deterministic skill result and expires it with the sourced ten-second
 * Combat Override window. Strong Strike and Aloy's constellation rows remain
 * fail-closed: their required state/timing channels or gameplay effects are
 * not present in the verified generated data.
 */
import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { aloy } from "../generated/cryo";

const COIL_RESOURCE_ID = "aloy-coil";
const COMBAT_OVERRIDE_DURATION = 10;
const ALOY_ATK_BONUS = 0.16;
const PARTY_ATK_BONUS = 0.08;

function combatOverrideBuffs(): readonly Buff[] {
  const condition = {
    resources: [{ resourceId: COIL_RESOURCE_ID, comparator: "gte" as const, value: 1, owner: "source" as const }],
  };
  return [
    {
      id: "aloy-a1-self",
      source: "Combat Override",
      sourceCharacterId: "aloy",
      startTime: 0,
      duration: COMBAT_OVERRIDE_DURATION,
      stacking: { mode: "refresh" as const },
      targets: { scope: "self" as const },
      conditions: condition,
      modifiers: [{ stat: "atkPercent" as const, value: ALOY_ATK_BONUS }],
    },
    {
      id: "aloy-a1-party",
      source: "Combat Override",
      sourceCharacterId: "aloy",
      startTime: 0,
      duration: COMBAT_OVERRIDE_DURATION,
      stacking: { mode: "refresh" as const },
      targets: { scope: "party" as const, excludeSource: true },
      conditions: condition,
      modifiers: [{ stat: "atkPercent" as const, value: PARTY_ATK_BONUS }],
    },
  ];
}

export function createAloyDefinition(
  constellationLevel = aloy.constellationLevel,
  talentLevels: TalentLevels = aloy.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? aloy.ascensionPhase;
  const skill = {
    ...aloy.skill,
    effects: [{ resourceId: COIL_RESOURCE_ID, kind: "gain" as const, amount: 1 }],
    ...(ascensionPhase >= 1 ? { buffs: combatOverrideBuffs() } : {}),
  };

  return {
    ...aloy,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill,
    resources: [{
      id: COIL_RESOURCE_ID,
      name: "Coil",
      initial: 0,
      max: 4,
      durationSeconds: COMBAT_OVERRIDE_DURATION,
    }],
  };
}

export const aloyWithKit = createAloyDefinition();

