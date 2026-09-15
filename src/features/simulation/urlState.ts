import type { Element } from "@/types";
import type {
  CharacterFilterState,
  ElementFilter,
  RarityFilter,
  WeaponFilter,
} from "@/features/team-builder/rosterModel";

// ---------------------------------------------------------------------------
// Deep-linkable app state.
//
// Team, roster filters and the active view live in the URL so a configuration
// can be shared and bookmarked, and so browser back/forward moves between
// states instead of leaving the page.
//
// Encoding rules:
//  - Only NON-DEFAULT values are written. A default-state URL stays clean
//    (`/`), and adding a new default later cannot retroactively change what an
//    existing link means.
//  - Team slots are positional; an empty slot is the empty string, so
//    `?team=bennett,,xingqiu` unambiguously means slots 1 and 3.
//  - Decoding is TOTAL: any malformed input degrades to the default rather
//    than throwing. A hand-edited or truncated URL must never blank the app.
//
// Pure: no React, no `window`, no history access. The caller owns the
// browser API; this module only maps state <-> query string.
// ---------------------------------------------------------------------------

/** Which top-level panels are visible. */
export type AppView = "all" | "setup" | "results";
export type WorkspaceMode = "uid" | "experiment";

const VIEWS: readonly AppView[] = ["all", "setup", "results"];

/** Team slot count. Positional encoding depends on this being fixed. */
export const TEAM_SLOTS = 4;

/** Full deep-linkable state. */
export interface UrlState {
  /** Character ids by slot; `null` is an empty slot. Always `TEAM_SLOTS` long. */
  readonly team: readonly (string | null)[];
  readonly filters: CharacterFilterState;
  readonly view: AppView;
  readonly mode: WorkspaceMode;
}

const PARAM_TEAM = "team";
const PARAM_VIEW = "view";
const PARAM_ELEMENT = "el";
const PARAM_WEAPON = "wp";
const PARAM_RARITY = "rr";
const PARAM_QUERY = "q";
const PARAM_MODE = "mode";

const DEFAULT_VIEW: AppView = "all";
const DEFAULT_MODE: WorkspaceMode = "experiment";

export const DEFAULT_FILTERS: CharacterFilterState = {
  element: "all",
  weapon: "all",
  rarity: "all",
  query: "",
};

export const DEFAULT_URL_STATE: UrlState = {
  team: Array.from({ length: TEAM_SLOTS }, () => null),
  filters: DEFAULT_FILTERS,
  view: DEFAULT_VIEW,
  mode: DEFAULT_MODE,
};

const ELEMENT_VALUES: readonly Element[] = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
  "physical",
];

const WEAPON_VALUES: readonly WeaponFilter[] = [
  "sword",
  "claymore",
  "polearm",
  "catalyst",
  "bow",
];

function parseView(raw: string | null): AppView {
  if (raw === null) return DEFAULT_VIEW;
  return VIEWS.includes(raw as AppView) ? (raw as AppView) : DEFAULT_VIEW;
}
function parseMode(raw: string | null): WorkspaceMode {
  return raw === "uid" ? "uid" : DEFAULT_MODE;
}

function parseElement(raw: string | null): ElementFilter {
  if (raw === null) return "all";
  return ELEMENT_VALUES.includes(raw as Element) ? (raw as ElementFilter) : "all";
}

function parseWeapon(raw: string | null): WeaponFilter {
  if (raw === null) return "all";
  return WEAPON_VALUES.includes(raw as WeaponFilter) ? (raw as WeaponFilter) : "all";
}

/** Rarity is numeric in state but a string in the URL; only 4 and 5 exist. */
function parseRarity(raw: string | null): RarityFilter {
  if (raw === "4") return 4;
  if (raw === "5") return 5;
  return "all";
}

/**
 * Parses a positional team list. Extra entries are dropped and missing ones
 * padded, so a link from a future build with more slots still resolves.
 */
function parseTeam(raw: string | null): readonly (string | null)[] {
  const slots: (string | null)[] = Array.from({ length: TEAM_SLOTS }, () => null);
  if (raw === null) return slots;

  const parts = raw.split(",");
  for (let i = 0; i < TEAM_SLOTS; i += 1) {
    const id = parts[i]?.trim();
    slots[i] = id === undefined || id === "" ? null : id;
  }
  return slots;
}

/** Decodes state from a query string. Total: never throws. */
export function decodeUrlState(search: string): UrlState {
  const params = new URLSearchParams(search);
  return {
    team: parseTeam(params.get(PARAM_TEAM)),
    filters: {
      element: parseElement(params.get(PARAM_ELEMENT)),
      weapon: parseWeapon(params.get(PARAM_WEAPON)),
      rarity: parseRarity(params.get(PARAM_RARITY)),
      query: params.get(PARAM_QUERY) ?? "",
    },
    view: parseView(params.get(PARAM_VIEW)),
    mode: parseMode(params.get(PARAM_MODE)),
  };
}

/** True when no slot is filled — nothing worth writing to the URL. */
function teamIsEmpty(team: readonly (string | null)[]): boolean {
  return team.every((id) => id === null);
}

/**
 * Encodes state as a query string WITHOUT a leading `?`, omitting defaults.
 * Returns `""` for fully-default state.
 */
export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams();

  if (!teamIsEmpty(state.team)) {
    // Trailing empty slots carry no information; drop them so a 1-character
    // team does not encode as "bennett,,,".
    const ids = state.team.map((id) => id ?? "");
    while (ids.length > 0 && ids[ids.length - 1] === "") ids.pop();
    params.set(PARAM_TEAM, ids.join(","));
  }

  const { filters } = state;
  if (filters.element !== "all") params.set(PARAM_ELEMENT, filters.element);
  if (filters.weapon !== "all") params.set(PARAM_WEAPON, filters.weapon);
  if (filters.rarity !== "all") params.set(PARAM_RARITY, String(filters.rarity));
  if (filters.query !== "") params.set(PARAM_QUERY, filters.query);
  if (state.view !== DEFAULT_VIEW) params.set(PARAM_VIEW, state.view);
  if (state.mode !== DEFAULT_MODE) params.set(PARAM_MODE, state.mode);

  return params.toString();
}

/**
 * Canonical path for a state: `"/"` when default, `"/?..."` otherwise.
 * Used for `history.pushState`, so the default state has one canonical URL
 * rather than two that differ only by a dangling `?`.
 */
export function urlStateToPath(state: UrlState, pathname = "/"): string {
  const query = encodeUrlState(state);
  return query === "" ? pathname : `${pathname}?${query}`;
}

/** Structural equality, so callers can skip redundant history entries. */
export function urlStateEquals(a: UrlState, b: UrlState): boolean {
  return encodeUrlState(a) === encodeUrlState(b);
}
