// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Barrel for the generated character roster. See any element module for the
// full provenance header.
//
//   Verifier data version  7.0.54
//   Fetched at             2026-09-04T01:08:25Z
// ============================================================================

import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { anemoGeneratedCharacters } from "./anemo";
import { cryoGeneratedCharacters } from "./cryo";
import { dendroGeneratedCharacters } from "./dendro";
import { electroGeneratedCharacters } from "./electro";
import { geoGeneratedCharacters } from "./geo";
import { hydroGeneratedCharacters } from "./hydro";
import { pyroGeneratedCharacters } from "./pyro";
import { withCharacterUsage } from "../usageProfile";

export { anemoGeneratedCharacters } from './anemo';
export { cryoGeneratedCharacters } from './cryo';
export { dendroGeneratedCharacters } from './dendro';
export { electroGeneratedCharacters } from './electro';
export { geoGeneratedCharacters } from './geo';
export { hydroGeneratedCharacters } from './hydro';
export { pyroGeneratedCharacters } from './pyro';

export type { GeneratedCharacterMeta } from './meta';
export type {
  GeneratedCharacterProvenance,
  GeneratedUnverifiedField,
} from './provenance';
export {
  generatedCharacterProvenance,
  generatedCharacterProvenanceById,
} from './provenance';
export { generatedCharacterMeta, generatedCharacterMetaById } from './meta';
export type {
  GeneratedPerkEffect,
  PerkConversion,
  PerkEnemyModifier,
  PerkStatModifier,
  PerkSupport,
  PerkTalentSlot,
} from './perkEffects';
export {
  generatedPerkEffects,
  generatedPerkEffectsById,
  perkEffectsForCharacter,
} from './perkEffects';

export const generatedCharacters: readonly GenericCharacterDefinition[] = [
  ...anemoGeneratedCharacters,
  ...cryoGeneratedCharacters,
  ...dendroGeneratedCharacters,
  ...electroGeneratedCharacters,
  ...geoGeneratedCharacters,
  ...hydroGeneratedCharacters,
  ...pyroGeneratedCharacters,
].map(withCharacterUsage);

export const generatedCharactersById: ReadonlyMap<string, GenericCharacterDefinition> =
  new Map(generatedCharacters.map((character) => [character.id, character]));
