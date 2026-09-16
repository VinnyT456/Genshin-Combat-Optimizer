/** Runtime overlay for Arlecchino's executable sourced perk channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { arlecchino } from "../generated/pyro";

const ARLECCHINO_P3_PYRO_BONUS = 0.4;
const ARLECCHINO_C6_CRIT_RATE = 0.1;
const ARLECCHINO_C6_CRIT_DAMAGE = 0.7;
const ARLECCHINO_C6_DURATION_SECONDS = 20;

const p3Buff: Buff = {
  id: "arlecchino-p3-balemoon-alone",
  source: "The Balemoon Alone May Know",
  sourceCharacterId: "arlecchino",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: ARLECCHINO_P3_PYRO_BONUS }],
};

const c6Buff: Buff = {
  id: "arlecchino-c6-after-burst-crit",
  source: "From This Day On, We Shall Delight in New Life Together.",
  sourceCharacterId: "arlecchino",
  startTime: 0,
  duration: ARLECCHINO_C6_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: {
    abilityIds: [...arlecchino.normalAttacks.hits.map((hit) => hit.id), arlecchino.burst.id],
  },
  modifiers: [
    { stat: "critRate", value: ARLECCHINO_C6_CRIT_RATE },
    { stat: "critDmg", value: ARLECCHINO_C6_CRIT_DAMAGE },
  ],
};

export function createArlecchinoDefinition(
  constellationLevel = arlecchino.constellationLevel,
  talentLevels: TalentLevels = arlecchino.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const p3 = arlecchino.passives.find((passive) => passive.id === "arlecchino-p3");
  if (!p3) throw new Error("Arlecchino P3 passive is missing from generated data");

  return {
    ...arlecchino,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: arlecchino.passives.map((passive) =>
      passive.id === p3.id ? { ...passive, buffs: [p3Buff] } : passive,
    ),
    skill: { ...arlecchino.skill, ...(level >= 6 ? { buffs: [c6Buff] } : {}) },
  };
}

export const ARLECCHINO_KIT_METADATA = {
  p3PyroDamageBonus: ARLECCHINO_P3_PYRO_BONUS,
  c6CritRate: ARLECCHINO_C6_CRIT_RATE,
  c6CritDamage: ARLECCHINO_C6_CRIT_DAMAGE,
  c6DurationSeconds: ARLECCHINO_C6_DURATION_SECONDS,
  bondOfLifeDependentEffects: "fail-closed: no Bond of Life lifecycle seam" as const,
} as const;

export const arlecchinoWithKit = createArlecchinoDefinition();
