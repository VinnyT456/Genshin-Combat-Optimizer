/** Runtime Bennett kit overlay for Fantastic Voyage's timed field. */

import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { bennett } from "../generated/pyro";

/** Fantastic Voyage ATK bonus by burst talent level, sourced from the talent table. */
const BENNETT_BURST_ATK_BONUS = [
  0.56, 0.66, 0.74, 0.84, 0.93, 1.01, 1.10, 1.18, 1.27, 1.35,
  1.45, 1.54, 1.64, 1.73, 1.83,
] as const;

const BENNETT_FIELD_DURATION = 12;
const BENNETT_A1_COOLDOWN_MULTIPLIER = 0.8;
const BENNETT_C2_ER_BONUS = 0.3;

function burstBonus(level: number): number {
  return BENNETT_BURST_ATK_BONUS[
    Math.min(Math.max(Math.trunc(level), 1), BENNETT_BURST_ATK_BONUS.length) - 1
  ]!;
}

function fieldBuffs(constellationLevel: number, talentLevel: number): readonly Buff[] {
  const field: Buff = {
    id: "bennett-fantastic-voyage-field",
    source: "美妙旅程",
    sourceCharacterId: "bennett",
    startTime: 0,
    duration: BENNETT_FIELD_DURATION,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    // At C0 the ATK branch only applies to characters above 70% HP. C1
    // removes that threshold; the condition is evaluated per party target,
    // matching the in-field behaviour rather than Bennett's own HP.
    ...(constellationLevel < 1 ? { conditions: { minHpFraction: 0.7 } } : {}),
    // Fantastic Voyage grants a fraction of Bennett's own Base ATK. The
    // engine resolves this source-based percentage to a flat target ATK value
    // at cast time, preserving the distinction from recipient ATK% buffs.
    sourceBaseAtkPercent: burstBonus(talentLevel) + (constellationLevel >= 1 ? 0.2 : 0),
  };
  if (constellationLevel < 6) return [field];
  return [
    field,
    {
      id: "bennett-c6-pyro-field",
      source: "烈火与勇气",
      sourceCharacterId: "bennett",
      startTime: 0,
      duration: BENNETT_FIELD_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      conditions: { weaponTypes: ["sword", "claymore", "polearm"] },
      modifiers: [
        { stat: "elementalDmgBonus", element: "pyro", value: 0.15 },
      ],
    },
  ];
}

export function createBennettDefinition(
  constellationLevel = bennett.constellationLevel,
  talentLevels = bennett.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.min(Math.max(Math.trunc(constellationLevel), 0), 6);
  const ascensionPhase = overrides.ascensionPhase ?? bennett.ascensionPhase;
  const skillCooldownMultiplier =
    ascensionPhase >= 1
      ? BENNETT_A1_COOLDOWN_MULTIPLIER
      : 1;
  const c2Buff: Buff = {
    id: "bennett-c2-impasse-conqueror",
    source: "踏破绝境",
    sourceCharacterId: "bennett",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { maxHpFraction: 0.7 },
    modifiers: [{ stat: "energyRecharge", value: BENNETT_C2_ER_BONUS }],
  };
  const constellations = bennett.constellations.map((constellation) =>
    constellation.level === 2 && level >= 2
      ? { ...constellation, buffs: [c2Buff] }
      : constellation,
  );
  const burst: KitAbility = {
    ...bennett.burst,
    buffs: fieldBuffs(level, talentLevels.burst),
  };
  return {
    ...bennett,
    ...overrides,
    constellationLevel: level,
    constellations,
    skill: {
      ...bennett.skill,
      cooldown: {
        values: bennett.skill.cooldown.values.map(
          (value) => value * skillCooldownMultiplier,
        ),
      },
    },
    talentLevels,
    burst,
  };
}

export const BENNETT_FIELD_METADATA = {
  durationSeconds: BENNETT_FIELD_DURATION,
  c1AddsBaseAtkPercent: 0.2,
  c2EnergyRechargeBonus: BENNETT_C2_ER_BONUS,
  a1CooldownMultiplier: BENNETT_A1_COOLDOWN_MULTIPLIER,
  hpGate: "C0 field ATK gate and C2 ER gate use runtime HP conditions",
  a4: "not modelled: no runtime field-dependent cooldown channel",
  c4: "not modelled: no conditional extra-hit channel",
  c6Infusion: "not modelled: infusion has no party weapon-type target channel",
} as const;

export const bennettWithKit = createBennettDefinition();
