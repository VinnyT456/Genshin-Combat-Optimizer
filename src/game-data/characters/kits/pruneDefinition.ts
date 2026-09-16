/** Runtime Prune overlay for the generated, executable damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { prune } from "../generated/anemo";

/**
 * Prune's documented oathhammer conversions, event-stacked ATK effects and
 * Rally damage depend on reaction/hit/field state the current kit vocabulary
 * cannot represent. They are intentionally not approximated as always-on buffs.
 * C3 and C5 talent levels are already expressed by generated gated buffs.
 */
export function createPruneDefinition(
  constellationLevel = prune.constellationLevel,
  talentLevels: TalentLevels = prune.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...prune,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const PRUNE_KIT_METADATA = {
  modelledPerks: ["c3BurstTalentLevel", "c5SkillTalentLevel"],
  unsupportedChannels: [
    "a1SwirlTriggeredConvertedOathhammerDamage",
    "a4OathhammerTriggeredPartyTollingRallyDamageBonus",
    "c1OathhammerHitEnergyRestore",
    "c2BurstHunterSeekerHitStackingAtk",
    "c4ConvertedOathhammerRicochetDamage",
    "c6HunterSeekerDurationAndReactionTriggeredPartyAtk",
    "p3CraftingMaterialChance",
    "p4HexereiReactionTriggeredAtkBuff",
  ],
} as const;

export const pruneWithKit = createPruneDefinition();
