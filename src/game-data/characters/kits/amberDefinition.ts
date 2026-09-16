/** Runtime Amber kit overlay for executable passive/constellation seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { amber } from "../generated/pyro";

const AMBER_A1_CRIT_RATE = 0.1;
const AMBER_C6_ATK_PERCENT = 0.15;
const AMBER_C6_DURATION_SECONDS = 10;

const a1Buff: Buff = {
  id: "amber-a1-fiery-rain-crit-rate",
  source: "Every Arrow Finds Its Target",
  sourceCharacterId: "amber",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { abilityIds: ["amber-burst"] },
  modifiers: [{ stat: "critRate", value: AMBER_A1_CRIT_RATE }],
};

const c6Buff: Buff = {
  id: "amber-c6-wildfire",
  source: "Wildfire",
  sourceCharacterId: "amber",
  startTime: 0,
  duration: AMBER_C6_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [{ stat: "atkPercent", value: AMBER_C6_ATK_PERCENT }],
};

export function createAmberDefinition(
  constellationLevel = amber.constellationLevel,
  talentLevels: TalentLevels = amber.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const a1 = amber.passives.find((passive) => passive.id === "amber-a1");
  if (!a1) throw new Error("Amber A1 passive is missing from generated data");

  return {
    ...amber,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: amber.passives.map((passive) =>
      passive.id === a1.id ? { ...passive, buffs: [a1Buff] } : passive,
    ),
    burst: {
      ...amber.burst,
      ...(level >= 6 ? { buffs: [c6Buff] } : {}),
    },
  };
}

export const amberWithKit = createAmberDefinition();

export const AMBER_KIT_METADATA = {
  a1FieryRainCritRate: AMBER_A1_CRIT_RATE,
  c6PartyAtkPercent: AMBER_C6_ATK_PERCENT,
  c6DurationSeconds: AMBER_C6_DURATION_SECONDS,
} as const;
