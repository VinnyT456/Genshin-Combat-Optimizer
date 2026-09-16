/** Runtime Yoimiya overlay for generated damage rows and supported talent boosts. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { yoimiya } from "../generated/pyro";

/**
 * Niwabi Fire-Dance's timed normal-attack infusion and skill-level multiplier
 * are not represented: the generic stance supports replacement strings and
 * infusion, but cannot apply the skill's sourced multiplier to each normal
 * hit. No incomplete stance is started, so normal attacks remain physical.
 * Generated C3/C5 talent-level buffs are preserved and constellation gated.
 */
export function createYoimiyaDefinition(
  constellationLevel = yoimiya.constellationLevel,
  talentLevels: TalentLevels = yoimiya.talentLevels,
): GenericCharacterDefinition {
  return {
    ...yoimiya,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const yoimiyaWithKit = createYoimiyaDefinition();

export const YOIMIYA_KIT_METADATA = {
  unsupportedMechanics: [
    "Niwabi Fire-Dance normal-attack Pyro infusion and skill-level multiplier during its 10-second window; current stance cannot compose the authored multiplier with each sourced normal hit",
    "A1 Tricks of the Trouble-Maker normal-hit Pyro DMG stacks during Niwabi Fire-Dance",
    "A4 party ATK buff from Ryuukin Saxifrage and its bonus based on A1 stacks",
    "C1 Aurous Blaze duration extension and defeat-triggered ATK buff",
    "C2 CRIT-triggered Pyro DMG bonus",
    "C4 skill cooldown reduction triggered by Aurous Blaze explosions",
    "C6 chance-based extra Blazing Arrow during Niwabi Fire-Dance (random proc deliberately omitted)",
    "Aurous Blaze mark application, ownership, triggering, and explosion lifecycle",
  ],
} as const;
