/** Runtime Tighnari overlay for the sourced, executable talent and perk channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { tighnari } from "../generated/dendro";

const KEEN_SIGHT_EM = 50;
const KEEN_SIGHT_DURATION_SECONDS = 4;

/** A1 starts after a Wreath Arrow; attaching it to that cast makes it available to later casts. */
const keenSightBuff: Buff = {
  id: "tighnari-a1-keen-sight",
  source: "Keen Sight",
  sourceCharacterId: "tighnari",
  startTime: 0,
  duration: KEEN_SIGHT_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "elementalMastery", value: KEEN_SIGHT_EM }],
};

export function createTighnariDefinition(
  constellationLevel = tighnari.constellationLevel,
  talentLevels: TalentLevels = tighnari.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? tighnari.ascensionPhase;
  const chargedAttack = tighnari.chargedAttack;
  if (!chargedAttack) throw new Error("Tighnari charged attack is missing from generated data");

  return {
    ...tighnari,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // C1/C3/C5 talent buffs are authored in generated data and remain gated
    // by the engine's active-constellation resolver.
    passives: tighnari.passives.map((passive) =>
      passive.id === "tighnari-a1" ? { ...passive, buffs: [] } : passive,
    ),
    chargedAttack: {
      ...chargedAttack,
      ...(ascensionPhase >= 1 ? { buffs: [keenSightBuff] } : {}),
    },
  };
}

export const tighnariWithKit = createTighnariDefinition();

export const TIGHNARI_KIT_METADATA = {
  a1ElementalMastery: KEEN_SIGHT_EM,
  a1DurationSeconds: KEEN_SIGHT_DURATION_SECONDS,
  unsupportedPerks: [
    "a4ScholarlyBladeDynamicEmDamageBonus",
    "c2FieldOpponentPresenceAndDuration",
    "c4ReactionTriggeredStackedPartyEm",
    "c6AdditionalClusterbloomArrowAndChargeTime",
    "p3ExplorationPassive",
  ],
} as const;
