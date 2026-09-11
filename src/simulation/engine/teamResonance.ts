import type { CharacterDefinition } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { Buff } from "@/simulation/buffs/types";

type TeamCharacter = CharacterDefinition | GenericCharacterDefinition;

/**
 * Resolve team-wide elemental resonances that have deterministic stat effects.
 *
 * Resonances require a complete four-character party in the combat model. The
 * UI's roster detector uses the same rule. Effects whose activation depends on
 * a hit, shield, aura, or other lifecycle state stay out of this static list.
 */
export function harvestTeamResonanceBuffs(
  team: readonly TeamCharacter[],
): readonly Buff[] {
  if (team.length < 4) return [];

  let pyroCount = 0;
  for (const character of team) {
    if (character.element === "pyro") pyroCount += 1;
  }
  if (pyroCount < 2) return [];

  return [
    {
      id: "resonance-fervent-flames",
      source: "Fervent Flames",
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      modifiers: [{ stat: "atkPercent", value: 0.25 }],
    },
  ];
}
