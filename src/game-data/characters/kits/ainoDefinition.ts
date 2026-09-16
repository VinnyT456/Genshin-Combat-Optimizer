/** Runtime Aino kit overlay for the executable passive/constellation seams. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { aino } from "../generated/hydro";

const AINO_C1_EM = 80;
const AINO_A4_BURST_DMG_PER_EM = 0.5;

function c1Buffs(): readonly Buff[] {
  return [
    {
      id: "aino-c1-self-em",
      source: "The Theory of Ash—Field Equilibrium",
      sourceCharacterId: "aino",
      startTime: 0,
      duration: 15,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      modifiers: [{ stat: "elementalMastery", value: AINO_C1_EM }],
    },
    {
      id: "aino-c1-active-em",
      source: "The Theory of Ash—Field Equilibrium",
      sourceCharacterId: "aino",
      startTime: 0,
      duration: 15,
      stacking: { mode: "refresh" },
      targets: { scope: "active", excludeSource: true },
      modifiers: [{ stat: "elementalMastery", value: AINO_C1_EM }],
    },
  ];
}

export function createAinoDefinition(
  constellationLevel = aino.constellationLevel,
  talentLevels: TalentLevels = aino.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const a4 = aino.passives.find((passive) => passive.id === "aino-a4");
  if (!a4) throw new Error("Aino A4 passive is missing from generated data");

  return {
    ...aino,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: aino.passives.map((passive) =>
      passive.id === "aino-a4"
        ? {
            ...passive,
            buffs: [
              {
                id: "aino-a4-burst-em-conversion",
                source: a4.name,
                sourceCharacterId: "aino",
                startTime: 0,
                duration: Number.POSITIVE_INFINITY,
                stacking: { mode: "refresh" as const },
                targets: { scope: "self" as const },
                conditions: { damageTypes: ["burst"] as const },
                conversions: [
                  {
                    sourceStat: "elementalMastery" as const,
                    targetStat: "dmgBonus" as const,
                    ratio: AINO_A4_BURST_DMG_PER_EM,
                  },
                ],
              },
            ],
          }
        : passive,
    ),
    skill: {
      ...aino.skill,
      ...(level >= 1 ? { buffs: c1Buffs() } : {}),
    },
    burst: {
      ...aino.burst,
      ...(level >= 1 ? { buffs: c1Buffs() } : {}),
    },
  };
}

export const ainoWithKit = createAinoDefinition();
