/**
 * Runtime overlay for Tartaglia's sourced damage kit.
 *
 * The generated data supplies all verified ranged talent rows and already
 * carries C3/C5 talent-level modifiers. This overlay exposes a clamped build
 * factory so those modifiers are exercised at the selected constellation.
 * Melee stance conversion, Riptide lifecycle damage, and cooldown/state
 * constellations remain unsupported: the generated sources do not provide a
 * verified state contract and the generic cast API cannot select stance rows.
 */
import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { tartaglia } from "../generated/hydro";

export function createTartagliaDefinition(
  constellationLevel = tartaglia.constellationLevel,
  talentLevels: TalentLevels = tartaglia.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  return {
    ...tartaglia,
    ...overrides,
    constellationLevel: Math.max(0, Math.min(6, Math.trunc(constellationLevel))),
    talentLevels,
  };
}

export const tartagliaWithKit = createTartagliaDefinition();
