/** Runtime Kaeya kit overlay for executable, sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import { kaeya } from "../generated/cryo";

const KAEYA_C1_CRIT_RATE = 0.15;

/** C1 applies only to Kaeya's Normal/Charged hits against Cryo-affected foes. */
const c1ExcellentBloodBuff: Buff = {
  id: "kaeya-c1-excellent-blood",
  source: "Excellent Blood",
  sourceCharacterId: "kaeya",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    damageTypes: ["normal", "charged"],
    enemyAuraElements: ["cryo"],
  },
  modifiers: [{ stat: "critRate", value: KAEYA_C1_CRIT_RATE }],
};

/** C6 creates one additional icicle with the sourced burst multiplier. */
function c6AdditionalIcicle(): DamageInstanceDefinition {
  const source = kaeya.burst.instances[0];
  if (source === undefined) throw new Error("Kaeya burst damage instance is missing from generated data");
  return {
    ...source,
    id: "kaeya-c6-additional-icicle",
    name: "Additional Icicle DMG",
    // The extra icicle is an additional hit, not a separately sourced aura application.
    application: undefined,
  };
}

export function createKaeyaDefinition(
  constellationLevel = kaeya.constellationLevel,
  talentLevels: TalentLevels = kaeya.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));

  return {
    ...kaeya,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    constellations: kaeya.constellations.map((constellation) =>
      constellation.id === "kaeya-c1" && level >= 1
        ? { ...constellation, buffs: [c1ExcellentBloodBuff] }
        : constellation,
    ),
    burst: {
      ...kaeya.burst,
      instances: level >= 6 ? [...kaeya.burst.instances, c6AdditionalIcicle()] : kaeya.burst.instances,
    },
  };
}

export const KAEYA_KIT_METADATA = {
  c1CritRate: KAEYA_C1_CRIT_RATE,
  unsupportedChannels: [
    "a1ColdBloodedStrikeHealing",
    "a4GlacialHeartAdditionalParticles",
    "c2GlacialWaltzDefeatDurationExtension",
    "c4FrozenKissLowHpShield",
    "c6GlacialWhirlwindEnergyRefund",
    "p3HiddenStrengthStaminaReduction",
  ],
} as const;

export const kaeyaWithKit = createKaeyaDefinition();
