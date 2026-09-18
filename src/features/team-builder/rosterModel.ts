import type { CharacterDefinition, Element } from "@/types";
import type { SemanticState } from "@/components/ui/tokens";
import type { Rarity, WeaponType } from "@/simulation/character/kit";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import {
  findCharacter,
  releaseDateOf,
  toLegacyCharacterDefinition,
  type PlayableCharacter,
} from "@/game-data/characters/registry";
import type { WebsiteCharacterDefinition } from "@/features/simulation/simulationAdapter";
import { charNameZh, elementZh, weaponZh } from "@/lib/i18n";
import { withSkillInputVariants } from "@/game-data/characters/skillInputVariants";
import { createSkirkDefinition } from "@/game-data/characters/kits/skirkDefinition";

// ---------------------------------------------------------------------------
// Pure character roster and facet filtering model for TeamBuilder and
// CharacterPicker (COMPONENTS.md §4, TASK #029).
// Keeps filtering, search, and metadata projection pure and unit-testable.
// ---------------------------------------------------------------------------

export type ElementFilter = "all" | Element;
export type WeaponFilter = "all" | WeaponType;
export type RarityFilter = "all" | Rarity;

function engineDefinitionFor(character: PlayableCharacter): GenericCharacterDefinition {
  // Skirk's generated rows describe the sourced talents, but her executable
  // kit has two distinct Skill inputs and a stance-dependent Burst. Keep that
  // runtime overlay beside the sequence editor so its tap/hold buttons match
  // the definition the simulator will execute.
  return character.id === "skirk"
    ? createSkirkDefinition(character.constellationLevel, character.talentLevels)
    : withSkillInputVariants(character);
}

/** Keeps the complete generated kit beside the legacy fields used by the UI. */
export function toWebsiteCharacter(
  character: PlayableCharacter,
): WebsiteCharacterDefinition {
  return {
    ...toLegacyCharacterDefinition(character),
    engineDefinition: engineDefinitionFor(character),
  };
}

/**
 * Keeps imported level/stats while attaching the lossless kit used by the
 * sequence editor. Enka starts with the legacy presentation shape because its
 * values are account-specific; replacing that shape with generated data would
 * discard the imported build. The simulation adapter still applies the
 * imported constellation/talents when it creates the runtime definition.
 */
export function attachEngineDefinition(
  character: CharacterDefinition,
): CharacterDefinition | WebsiteCharacterDefinition {
  const source = findCharacter(character.id);
  return source === undefined
    ? character
    : { ...character, engineDefinition: engineDefinitionFor(source) };
}

export interface ElementOption {
  readonly id: ElementFilter;
  readonly label: string;
  readonly labelZh: string;
}

export const ELEMENT_OPTIONS: readonly ElementOption[] = [
  { id: "all", label: "All", labelZh: "全部元素" },
  { id: "pyro", label: "Pyro", labelZh: "火" },
  { id: "hydro", label: "Hydro", labelZh: "水" },
  { id: "electro", label: "Electro", labelZh: "雷" },
  { id: "cryo", label: "Cryo", labelZh: "冰" },
  { id: "anemo", label: "Anemo", labelZh: "风" },
  { id: "geo", label: "Geo", labelZh: "岩" },
  { id: "dendro", label: "Dendro", labelZh: "草" },
];

export interface WeaponOption {
  readonly id: WeaponFilter;
  readonly label: string;
  readonly labelZh: string;
}

export const WEAPON_OPTIONS: readonly WeaponOption[] = [
  { id: "all", label: "All", labelZh: "全部武器" },
  { id: "sword", label: "Sword", labelZh: "单手剑" },
  { id: "claymore", label: "Claymore", labelZh: "双手剑" },
  { id: "polearm", label: "Polearm", labelZh: "长柄武器" },
  { id: "bow", label: "Bow", labelZh: "弓" },
  { id: "catalyst", label: "Catalyst", labelZh: "法器" },
];

export interface RarityOption {
  readonly id: RarityFilter;
  readonly label: string;
  readonly labelZh: string;
}

export const RARITY_OPTIONS: readonly RarityOption[] = [
  { id: "all", label: "All", labelZh: "全部星级" },
  { id: 5, label: "5★", labelZh: "5★" },
  { id: 4, label: "4★", labelZh: "4★" },
];

export interface CharacterMetadata {
  readonly weaponType: WeaponType;
  readonly weaponLabel: string;
  readonly weaponLabelZh: string;
  readonly rarity: Rarity;
  readonly supportTier: string;
  readonly tierReason?: string;
}

const WEAPON_LABELS: Record<WeaponType, { label: string; labelZh: string }> = {
  sword: { label: "Sword", labelZh: "单手剑" },
  claymore: { label: "Claymore", labelZh: "双手剑" },
  polearm: { label: "Polearm", labelZh: "长柄武器" },
  bow: { label: "Bow", labelZh: "弓" },
  catalyst: { label: "Catalyst", labelZh: "法器" },
};

/**
 * Raiden National team members.
 *
 * Retained because `simulationAdapter` keys the team-buff resolver off this
 * grouping. It must NOT be used to adjust a support tier — see
 * `getCharacterMetadata`.
 */
export const RAIDEN_NATIONAL_IDS = new Set([
  "raiden",
  "raiden-shogun",
  "bennett",
  "xiangling",
  "xingqiu",
]);

/**
 * Resolves authored character metadata from the registry, with graceful
 * fallbacks for legacy/test fixtures.
 */
export function getCharacterMetadata(characterId: string): CharacterMetadata {
  const registered = findCharacter(characterId);
  if (registered) {
    const weaponInfo = WEAPON_LABELS[registered.weaponType] ?? {
      label: registered.weaponType,
      labelZh: weaponZh(registered.weaponType),
    };
    // Tier is passed through from the registry claim, UNMODIFIED.
    //
    // This function previously promoted the five Raiden National ids to "FULL"
    // and dropped their reason. That was a UI-invented tier, which
    // DESIGN-SYSTEM forbids outright ("no component may compute or adjust a
    // tier from character fields"; inference "can only DEMOTE", never promote),
    // and it was an OVERCLAIM against the engine. The website now preserves the
    // generic kit and selected constellation, but a working channel still does
    // not make the entire character fully supported. The National kit supplies
    // TEAM BUFFS, which
    // `simulationAdapter` wires separately and which are not a tier claim.
    //
    // ROADMAP §0: fail closed, never open. Under-promising is recoverable.
    return {
      weaponType: registered.weaponType,
      weaponLabel: weaponInfo.label,
      weaponLabelZh: weaponInfo.labelZh,
      rarity: registered.rarity,
      supportTier: registered.claim.supportTier,
      tierReason: registered.claim.tierReason,
    };
  }

  // Fallbacks for test characters or unindexed fixtures
  const fallbackWeapons: Record<string, WeaponType> = {
    "test-pyro": "sword",
    "test-hydro": "catalyst",
    "test-electro": "bow",
    "test-anemo": "claymore",
  };

  const weaponType = fallbackWeapons[characterId] ?? "sword";
  const weaponInfo = WEAPON_LABELS[weaponType];

  return {
    weaponType,
    weaponLabel: weaponInfo.label,
    weaponLabelZh: weaponInfo.labelZh,
    rarity: 5,
    supportTier: "FULL",
  };
}

export interface FormattedSupportTier {
  readonly label: string;
  readonly state: SemanticState;
}

/**
 * Maps an authored support-tier claim into short label and semantic state token
 * for StatusChip rendering (DESIGN-SYSTEM.md & COMPONENTS.md §4).
 */
export function formatSupportTier(tier?: string): FormattedSupportTier {
  if (!tier) {
    return { label: "Full", state: "success" };
  }

  const normalized = tier.toUpperCase();
  switch (normalized) {
    case "FULL":
      return { label: "Full", state: "success" };
    case "PARTIAL":
      return { label: "Partial", state: "warning" };
    case "DATA_ONLY":
      return { label: "Data", state: "info" };
    case "NOT_IMPLEMENTED":
      return { label: "Data", state: "info" };
    case "BASIC":
      return { label: "Basic", state: "info" };
    default:
      return { label: "Full", state: "success" };
  }
}

/**
 * Normalizes text for diacritic-insensitive and case-insensitive matching.
 */
export function normalizeSearchString(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Checks whether a character matches a search query against name, element, or weapon.
 */
export function matchesSearch(
  character: CharacterDefinition,
  query: string,
  meta: CharacterMetadata,
): boolean {
  const normalizedQuery = normalizeSearchString(query);
  if (normalizedQuery.length === 0) return true;

  const normalizedName = normalizeSearchString(character.name);
  const normalizedNameZh = normalizeSearchString(charNameZh(character.name) || charNameZh(character.id));
  const normalizedElement = normalizeSearchString(character.element);
  const normalizedElementZh = normalizeSearchString(elementZh(character.element));
  const normalizedWeaponType = normalizeSearchString(meta.weaponType);
  const normalizedWeaponLabel = normalizeSearchString(meta.weaponLabel);
  const normalizedWeaponLabelZh = normalizeSearchString(meta.weaponLabelZh);

  return (
    normalizedName.includes(normalizedQuery) ||
    normalizedNameZh.includes(normalizedQuery) ||
    normalizedElement.includes(normalizedQuery) ||
    normalizedElementZh.includes(normalizedQuery) ||
    normalizedWeaponType.includes(normalizedQuery) ||
    normalizedWeaponLabel.includes(normalizedQuery) ||
    normalizedWeaponLabelZh.includes(normalizedQuery)
  );
}

/**
 * Sourced release date for a character id.
 *
 * Goes through the registry rather than the legacy `releaseOrder` table: that
 * table is keyed by the PRE-cutover ids, so after the rename it returned its
 * undated sentinel for 23 of 132 characters and silently mis-sorted them.
 * Unknown ids (test fixtures) sort last, which is the same contract as before.
 */
function releaseDateForId(characterId: string): string {
  const registered = findCharacter(characterId);
  return registered === undefined ? UNDATED_SORT_KEY : releaseDateOf(registered);
}

/** Sorts after every real character; mirrors the registry's own sentinel. */
const UNDATED_SORT_KEY = "9999-99-99";

export const ELEMENT_SORT_ORDER: Record<Element, number> = {
  pyro: 1,
  hydro: 2,
  anemo: 3,
  electro: 4,
  dendro: 5,
  cryo: 6,
  geo: 7,
  physical: 8,
};

export interface CharacterFilterState {
  readonly element: ElementFilter;
  readonly weapon: WeaponFilter;
  readonly rarity: RarityFilter;
  readonly query: string;
}

/**
 * Multi-facet filtering function. Applies element, weapon, rarity, and search
 * filters simultaneously (AND across facets, OR within single selection),
 * and sorts results strictly by element order, 5★/4★ rarity, and name.
 */
export function filterRoster(
  roster: readonly CharacterDefinition[],
  filters: CharacterFilterState,
): readonly CharacterDefinition[] {
  return roster
    .filter((character) => {
      // 1. Element filter
      if (filters.element !== "all" && character.element !== filters.element) {
        return false;
      }

      const meta = getCharacterMetadata(character.id);

      // 2. Weapon filter
      if (filters.weapon !== "all" && meta.weaponType !== filters.weapon) {
        return false;
      }

      // 3. Rarity filter
      if (filters.rarity !== "all" && meta.rarity !== filters.rarity) {
        return false;
      }

      // 4. Live search filter
      if (!matchesSearch(character, filters.query, meta)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const orderA = ELEMENT_SORT_ORDER[a.element] ?? 99;
      const orderB = ELEMENT_SORT_ORDER[b.element] ?? 99;
      if (orderA !== orderB) return orderA - orderB;

      // Sequential chronological release within each element
      // Sourced release date from the registry. The old `releaseOrder` table
      // is keyed by the PRE-cutover ids, so after the rename it returned the
      // undated sentinel for 23 of 132 characters and silently mis-sorted them.
      const dateA = releaseDateForId(a.id);
      const dateB = releaseDateForId(b.id);
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      const metaA = getCharacterMetadata(a.id);
      const metaB = getCharacterMetadata(b.id);
      if (metaA.rarity !== metaB.rarity) return metaB.rarity - metaA.rarity;

      return a.name.localeCompare(b.name);
    });
}
