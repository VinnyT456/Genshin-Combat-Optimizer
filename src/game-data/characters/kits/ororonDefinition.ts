/** Runtime Ororon overlay for sourced, directly expressible damage effects. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { ororon } from "../generated/electro";

const C2_ELECTRO_DAMAGE_BONUS = 0.08;
const C2_DURATION_SECONDS = 9;
const A1_HYPERSENSE_ATK_RATIO = 1.6;
const C6_BURST_HYPERSENSE_MULTIPLIER = 2;

const c2SpiritualSupersenseBuff: Buff = {
  id: "ororon-c2-spiritual-supersense",
  source: "King Bee of the Hidden Honeyed Wine",
  sourceCharacterId: ororon.id,
  startTime: 0,
  duration: C2_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "elementalDmgBonus", element: "electro", value: C2_ELECTRO_DAMAGE_BONUS }],
};

function c6BurstHypersense(): DamageInstanceDefinition {
  return {
    id: "ororon-c6-burst-hypersense",
    name: "Hypersense DMG",
    damageType: "burst",
    element: "electro",
    scaling: [{ stat: "atk", table: flatTalent(A1_HYPERSENSE_ATK_RATIO * C6_BURST_HYPERSENSE_MULTIPLIER) }],
  };
}

export function createOroronDefinition(
  constellationLevel = ororon.constellationLevel,
  talentLevels: TalentLevels = ororon.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const burstInstances = level >= 6
    ? [...ororon.burst.instances, c6BurstHypersense()]
    : ororon.burst.instances;

  return {
    ...ororon,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    burst: {
      ...ororon.burst,
      instances: burstInstances,
      ...(level >= 2 ? { buffs: [c2SpiritualSupersenseBuff] } : {}),
    },
  };
}

export const ororonWithKit = createOroronDefinition();

export const ORORON_KIT_METADATA = {
  c2ElectroDamageBonus: C2_ELECTRO_DAMAGE_BONUS,
  c2DurationSeconds: C2_DURATION_SECONDS,
  a1HypersenseAtkRatio: A1_HYPERSENSE_ATK_RATIO,
  c6BurstHypersenseMultiplier: C6_BURST_HYPERSENSE_MULTIPLIER,
  unsupportedChannels: [
    "a1NightsoulGainAndReactionTriggeredHypersense",
    "a1NightsoulBlessingStateAndHypersenseCooldown",
    "c1AdditionalSkillBouncesAndNighttideHypersenseDamageGate",
    "c2AdditionalOpponentHitElectroBonusStacks",
    "a4AspectSigilPartyEnergyOnNormalChargedPlungeHits",
    "c4BurstOculusRotationAndEnergyRestoration",
    "c6HypersenseTriggeredActiveCharacterAtkStacks",
    "p3NightsoulTransmissionAndTraversal",
    "p4GlidingSpeed",
  ],
} as const;
