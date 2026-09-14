import type { Element } from "@/types";

// ---------------------------------------------------------------------------
// Pure resolution of character portrait URLs (TASK #033, Priority 1).
//
// The CDN filenames are the game's INTERNAL asset codenames, which are NOT
// derivable from the display name by any string rule. Three distinct classes
// were measured against the live CDN across the full 124-entry roster:
//
//   1. Most entries — the display name with separators stripped is correct
//      ("Bennett" -> Bennett). "Hu Tao" -> Hutao is NOT in this class.
//   2. 40 entries — an internal codename unrelated or only loosely related to
//      the display name ("Amber" -> Ambor, "Jean" -> Qin, "Noelle" -> Noel,
//      "Raiden Shogun" -> Shougun), plus the Traveler, whose forms share one
//      portrait PER GENDER rather than per element.
//   3. 1 entry — no icon published on ANY known CDN (see MISSING_ICON_IDS).
//
// A naive derive-from-name mapping was measured broken for ~30% of the roster,
// so derivation alone cannot be correct. Every override below was verified with
// a live HTTP request returning 200 image/webp; none is written from memory.
// `characterAssets.test.ts` asserts coverage against the REAL registry, so a
// roster change that outruns this table fails the suite instead of silently
// rendering placeholders.
// ---------------------------------------------------------------------------

/** Host serving the primary avatar icons. Mirrored in `next.config.mjs`. */
export const AVATAR_CDN_HOST = "api.lunaris.moe";
/** Host serving the fallback avatar icons. Mirrored in `next.config.mjs`. */
export const AVATAR_FALLBACK_CDN_HOST = "gi.yatta.moe";

const PRIMARY_BASE = `https://${AVATAR_CDN_HOST}/data/assets/avataricon/UI_AvatarIcon_`;
const FALLBACK_BASE = `https://${AVATAR_FALLBACK_CDN_HOST}/assets/UI/UI_AvatarIcon_`;

/**
 * Character id -> internal game asset codename, for every character whose
 * codename is not derivable from its display name. Each entry was confirmed
 * against the live CDN; do not add a value that has not been requested.
 */
const ASSET_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  // Codenames that differ outright from the published display name.
  amber: "Ambor",
  noelle: "Noel",
  jean: "Qin",
  yanfei: "Feiyan",
  thoma: "Tohma",
  lyney: "Liney",
  lynette: "Linette",
  "shikanoin-heizou": "Heizo",
  xianyun: "Liuyun",
  ororon: "Olorun",
  alhaitham: "Alhatham",
  baizhu: "Baizhuer",
  kirara: "Momoka",
  "raiden-shogun": "Shougun",
  "yae-miko": "Yae",

  // Multi-word names that collapse to a single token rather than a
  // concatenation of every word.
  "hu-tao": "Hutao",
  "yun-jin": "Yunjin",
  "lan-yan": "Lanyan",
  "yumemizuki-mizuki": "Mizuki",
  // Project Amber's current internal asset codename includes the `New`
  // suffix; the plain `Skirk` URL is not published by the asset CDN.
  skirk: "SkirkNew",

  // Family-name characters: the asset drops the surname.
  "kamisato-ayaka": "Ayaka",
  "kamisato-ayato": "Ayato",
  "kaedehara-kazuha": "Kazuha",
  "sangonomiya-kokomi": "Kokomi",
  "kujou-sara": "Sara",
  "kuki-shinobu": "Shinobu",
  "arataki-itto": "Itto",

  // The Traveler's forms share ONE portrait per gender, not per element.
  "traveler-m-anemo": "PlayerBoy",
  "traveler-m-geo": "PlayerBoy",
  "traveler-m-electro": "PlayerBoy",
  "traveler-m-dendro": "PlayerBoy",
  "traveler-m-hydro": "PlayerBoy",
  "traveler-m-pyro": "PlayerBoy",
  "traveler-m-cryo": "PlayerBoy",
  "traveler-f-anemo": "PlayerGirl",
  "traveler-f-geo": "PlayerGirl",
  "traveler-f-electro": "PlayerGirl",
  "traveler-f-dendro": "PlayerGirl",
  "traveler-f-hydro": "PlayerGirl",
  "traveler-f-pyro": "PlayerGirl",
  "traveler-f-cryo": "PlayerGirl",
};

/**
 * Characters with no portrait published on any known CDN. These resolve to no
 * URL at all so the UI renders its placeholder immediately, instead of firing a
 * request that is known to 404 and flashing a broken image.
 */
export const MISSING_ICON_IDS: ReadonlySet<string> = new Set(["sandrone"]);

/**
 * Derives the asset codename for a character whose name maps directly: strip
 * diacritics and every non-alphanumeric separator ("Yun Jin" -> "YunJin").
 * Only correct for class 1 above; overrides take precedence.
 */
export function deriveAssetName(displayName: string): string {
  return displayName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9]/g, "");
}

/**
 * Resolves the internal asset codename for a character, or `null` when the
 * character has no published icon.
 */
export function resolveAssetName(characterId: string, displayName: string): string | null {
  if (MISSING_ICON_IDS.has(characterId)) return null;
  return ASSET_NAME_OVERRIDES[characterId] ?? deriveAssetName(displayName);
}

export interface AvatarSources {
  /** Primary URL, or `null` when no icon exists upstream. */
  readonly primary: string | null;
  /** Secondary URL tried only after `primary` errors. */
  readonly fallback: string | null;
}

/**
 * Full source chain for a character portrait. Returning both URLs (rather than
 * letting the component build them) keeps URL construction in one tested place.
 */
export function getAvatarSources(characterId: string, displayName: string): AvatarSources {
  const assetName = resolveAssetName(characterId, displayName);
  if (assetName === null) {
    return { primary: null, fallback: null };
  }
  return {
    primary: `${PRIMARY_BASE}${assetName}.webp`,
    fallback: `${FALLBACK_BASE}${assetName}.png`,
  };
}

/**
 * Initials shown when no portrait renders. Uses the first character of each of
 * the first two words so "Hu Tao" reads "HT" rather than "H".
 */
export function getAvatarInitials(displayName: string): string {
  const words = displayName
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]!}${words[1]![0]!}`.toUpperCase();
}

/**
 * Element-tinted placeholder styling. Kept beside the URL logic so the loading,
 * error, and no-icon states are all driven from this one module.
 */
export const AVATAR_PLACEHOLDER_STYLES: Readonly<Record<Element, string>> = {
  pyro: "bg-red-500/15 text-red-200 border-red-500/40",
  hydro: "bg-sky-500/15 text-sky-200 border-sky-500/40",
  electro: "bg-purple-500/15 text-purple-200 border-purple-500/40",
  cryo: "bg-cyan-500/15 text-cyan-200 border-cyan-500/40",
  anemo: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  geo: "bg-amber-500/15 text-amber-200 border-amber-500/40",
  dendro: "bg-lime-500/15 text-lime-200 border-lime-500/40",
  physical: "bg-slate-500/15 text-slate-200 border-slate-500/40",
};
