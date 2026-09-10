import type { CharacterDefinition, SimulationConfig } from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import {
  activeConstellations,
  unlockedPassives,
} from "@/simulation/character/character";
import { withHarvestedBuffs } from "@/simulation/engine/composeResolvers";

// ============================================================================
// Perk buff harvest.
//
// Constellations and ascension passives carry `buffs` — the same declarative
// `Buff` objects a weapon passive or an artifact set uses. Until now nothing
// COLLECTED them, so "Increases the Level of Elemental Skill by 3" was real
// data with zero effect on damage: `SimulationConfig.talentLevelResolver` was
// read by the engine and never supplied by anyone.
//
// This module closes that link. It does exactly two things:
//
//   1. FLAT-MAP the team's already-gated perks into one buff list.
//   2. COMPOSE resolvers over that list with whatever the caller supplied.
//
// It decides NOTHING about game rules. Which perks are unlocked is answered by
// `activeConstellations()` / `unlockedPassives()` (character-owned); what a
// buff is worth is answered by the mechanics resolvers. A C6 buff on a C0
// character is filtered out upstream, at the source of truth, rather than
// re-derived here — reimplementing the gate is precisely how a C6-at-C0
// overclaim gets introduced.
//
// DETERMINISM: the harvest is an ordered walk (team order, then passives in
// declaration order, then constellations in ascending level). No `Object.keys`,
// no sorting by anything a caller could permute.
// ============================================================================

/** Does this definition carry the generic kit shape (perks live there)? */
function isGeneric(
  def: CharacterDefinition | GenericCharacterDefinition,
): def is GenericCharacterDefinition {
  return "normalAttacks" in def;
}

/**
 * All buffs granted by one character's UNLOCKED perks, in stable order.
 *
 * Passives first, then constellations ascending — mirroring how a character
 * sheet reads. A legacy `CharacterDefinition` has no perks and yields nothing.
 */
export function harvestCharacterPerkBuffs(
  def: CharacterDefinition | GenericCharacterDefinition,
): readonly Buff[] {
  if (!isGeneric(def)) return [];
  const out: Buff[] = [];
  for (const passive of unlockedPassives(def)) {
    for (const buff of passive.buffs ?? []) out.push(buff);
  }
  for (const constellation of activeConstellations(def)) {
    for (const buff of constellation.buffs ?? []) out.push(buff);
  }
  return out;
}

/**
 * All perk buffs of a whole team, in team order.
 *
 * Buffs keep their authored `targets`, so a `scope: "self"` constellation buff
 * still only reaches its own owner — harvesting a teammate's C3 does not leak
 * it across the party.
 */
export function harvestTeamPerkBuffs(
  team: readonly (CharacterDefinition | GenericCharacterDefinition)[],
): readonly Buff[] {
  const out: Buff[] = [];
  for (const def of team) out.push(...harvestCharacterPerkBuffs(def));
  return out;
}

/**
 * Config with the team's perk buffs wired into all three mechanics seams.
 *
 * Additive and non-destructive: a caller-supplied resolver is COMPOSED with the
 * perk one, never replaced, so external buffs (an artifact set, a teammate's
 * aura) and perk buffs coexist. A team with no perk buffs returns `config`
 * unchanged, so runs that had no perks are byte-identical to before.
 *
 * All three channels are wired from ONE list because a perk buff may carry any
 * of them; today the emitted roster uses only `talentLevelModifiers`, and the
 * other two channels contribute nothing rather than being special-cased.
 */
export function withPerkBuffs(
  team: readonly (CharacterDefinition | GenericCharacterDefinition)[],
  config: SimulationConfig,
): SimulationConfig {
  return withHarvestedBuffs(config, harvestTeamPerkBuffs(team));
}
