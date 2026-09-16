/** Runtime Faruzan overlay for the executable, sourced buff channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { faruzan } from "../generated/anemo";

const FARUZAN_A4_ANEMO_DAMAGE_BONUS = 0.32;
const FARUZAN_C2_BURST_DURATION_SECONDS = 18;
const FARUZAN_BURST_DURATION_SECONDS = 12;
const FARUZAN_C6_ANEMO_CRIT_DAMAGE = 0.4;

function burstBuffs(constellationLevel: number): readonly Buff[] {
  const duration = constellationLevel >= 2
    ? FARUZAN_C2_BURST_DURATION_SECONDS
    : FARUZAN_BURST_DURATION_SECONDS;
  const buffs: Buff[] = [
    {
      id: "faruzan-a4-lost-wisdom",
      source: "Lost Wisdom of the Seven Caverns",
      sourceCharacterId: "faruzan",
      startTime: 0,
      duration,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      conditions: { elements: ["anemo"] },
      // The source-stat-to-party elemental-DMG conversion is not available at
      // this seam. Use the authored maximum and document the approximation in
      // metadata rather than silently inventing a per-recipient conversion.
      modifiers: [{ stat: "elementalDmgBonus", element: "anemo", value: FARUZAN_A4_ANEMO_DAMAGE_BONUS }],
    },
  ];
  if (constellationLevel >= 6) {
    buffs.push({
      id: "faruzan-c6-wondrous-path-of-truth",
      source: "The Wondrous Path of Truth",
      sourceCharacterId: "faruzan",
      startTime: 0,
      duration,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      conditions: { elements: ["anemo"] },
      modifiers: [{ stat: "critDmg", value: FARUZAN_C6_ANEMO_CRIT_DAMAGE }],
    });
  }
  return buffs;
}

export function createFaruzanDefinition(
  constellationLevel = faruzan.constellationLevel,
  talentLevels: TalentLevels = faruzan.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? faruzan.ascensionPhase;

  return {
    ...faruzan,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: faruzan.passives.map((passive) =>
      passive.id === "faruzan-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [] }
        : passive,
    ),
    burst: {
      ...faruzan.burst,
      buffs: ascensionPhase >= 4 ? burstBuffs(level) : [],
    },
  };
}

export const FARUZAN_KIT_METADATA = {
  a4AnemoDamageBonus: FARUZAN_A4_ANEMO_DAMAGE_BONUS,
  burstDurationSeconds: FARUZAN_BURST_DURATION_SECONDS,
  c2BurstDurationSeconds: FARUZAN_C2_BURST_DURATION_SECONDS,
  c6AnemoCritDamage: FARUZAN_C6_ANEMO_CRIT_DAMAGE,
  unsupportedChannels: [
    "a1SkillChargedShotStateAndHurricaneArrow",
    "a4SourceAtkScaledPartyBonusBeyondAuthoredMaximum",
    "c1SecondHurricaneArrow",
    "c4PressurizedCollapseEnergyRefund",
    "c6BurstTriggeredPressurizedCollapseVortex",
    "p3CraftingMaterialRefund",
  ],
} as const;

export const faruzanWithKit = createFaruzanDefinition();
