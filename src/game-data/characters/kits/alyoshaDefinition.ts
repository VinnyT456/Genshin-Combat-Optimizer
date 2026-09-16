/** Runtime Alyosha kit overlay for the executable Energy Recharge passive seam. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";
import { alyosha } from "../generated/electro";

/** Suffer the Winter Wheat Will: 0.35% Skill/Burst DMG per 1% ER, capped at 70%. */
const ALYOSHA_A4_DMG_PER_ER = 0.35;
const ALYOSHA_A4_DMG_CAP = 0.7;

function a4Buff(): Buff {
  return {
    id: "alyosha-a4-er-dmg",
    source: "Suffer the Winter Wheat Will",
    sourceCharacterId: "alyosha",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { damageTypes: ["skill", "burst"] },
    conversions: [
      {
        sourceStat: "energyRecharge",
        targetStat: "dmgBonus",
        ratio: ALYOSHA_A4_DMG_PER_ER,
        maxCap: ALYOSHA_A4_DMG_CAP,
      },
    ],
  };
}

export function createAlyoshaDefinition(
  constellationLevel = alyosha.constellationLevel,
  talentLevels: TalentLevels = alyosha.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const a4 = alyosha.passives.find((passive) => passive.id === "alyosha-a4");
  if (!a4) throw new Error("Alyosha A4 passive is missing from generated data");

  return {
    ...alyosha,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    passives: alyosha.passives.map((passive) =>
      passive.id === a4.id ? { ...passive, buffs: [a4Buff()] } : passive,
    ),
  };
}

export const alyoshaWithKit = createAlyoshaDefinition();

