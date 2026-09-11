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

function burstBonus(level: number): number {
  return BENNETT_BURST_ATK_BONUS[
    Math.min(Math.max(Math.trunc(level), 1), BENNETT_BURST_ATK_BONUS.length) - 1
  ]!;
}

function fieldBuff(constellationLevel: number, talentLevel: number): Buff {
  return {
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
    ...(constellationLevel >= 6
      ? {
          modifiers: [
            { stat: "elementalDmgBonus" as const, element: "pyro" as const, value: 0.15 },
          ],
        }
      : {}),
    // Fantastic Voyage grants a fraction of Bennett's own Base ATK. The
    // engine resolves this source-based percentage to a flat target ATK value
    // at cast time, preserving the distinction from recipient ATK% buffs.
    sourceBaseAtkPercent: burstBonus(talentLevel) + (constellationLevel >= 1 ? 0.2 : 0),
  };
}

export function createBennettDefinition(
  constellationLevel = bennett.constellationLevel,
  talentLevels = bennett.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "baseStats">> = {},
): GenericCharacterDefinition {
  const burst: KitAbility = {
    ...bennett.burst,
    buffs: [fieldBuff(constellationLevel, talentLevels.burst)],
  };
  return {
    ...bennett,
    ...overrides,
    constellationLevel,
    talentLevels,
    burst,
  };
}

export const BENNETT_FIELD_METADATA = {
  durationSeconds: BENNETT_FIELD_DURATION,
  c1AddsBaseAtkPercent: 0.2,
  hpGate: "not modelled: runtime has no HP-threshold condition channel",
} as const;
