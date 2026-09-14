// ---------------------------------------------------------------------------
// Pure resolution of artifact set icon URLs (TASK #068).
//
// Unlike character portraits, artifact icons need NO name->codename table: the
// generated data carries Project Amber's own `iconId` on every one of the 63
// sets, so there is nothing to derive and nothing to guess.
//
// SET THUMBNAIL VS. PIECE PREVIEW.
// Artifact icons are published per PIECE, with a `_1`..`_5` suffix on a shared
// set id. Set-library cards use the generated `iconId` verbatim: it is the
// published set thumbnail and is `_4` for almost every normal set. Detailed
// previews call `getArtifactIconSourcesForSlot`, which uses the explicit
// piece mapping below so the image matches the selected flower, plume, sands,
// goblet or circlet.
//
// Measured against the live CDN across all 63 sets:
//   - 59 sets carry `_4` (the Flower of Life). All five suffixes resolve.
//   - 4 sets carry `_3` (the single-piece elemental-resistance relics, source
//     ids 15009-15013). For these, `_3` is the ONLY suffix that resolves;
//     `_1`, `_2`, `_4` and `_5` all 404, because those pieces do not exist.
// So there is no universal slot. Normalising every id to `_4` would break
// exactly the four sets that have no `_4`. Taking the id as given is 63/63.
//
// HOST CHOICE (measured, not assumed — every claim below is a real request):
//   PRIMARY   https://api.lunaris.moe/data/assets/artifacts/{iconId}.webp
//             63/63 -> 200 image/webp, ~9-16KB each.
//   FALLBACK  https://gi.yatta.moe/assets/UI/reliquary/{iconId}.png
//             63/63 -> 200 image/png. Larger, so it is second, not first.
//
// DO NOT USE the `iconUrl` field on the generated data. It is
// `https://gi.yatta.moe/assets/UI/{iconId}.png` — missing the `/reliquary/`
// path segment — and it returns 404 for 63/63 sets. It is a field that was
// emitted but never requested. Consuming it is why the picker rendered no
// images at all before this module existed. The field is game-data and is not
// this module's to fix; a follow-up is filed with the Manager. This module
// ignores it rather than routing a known-404 into an <img>.
// ---------------------------------------------------------------------------

import type { ArtifactSlot } from "@/simulation/character/equipment";

/** Host serving the primary artifact icons. Mirrored in `next.config.mjs`. */
export const ARTIFACT_CDN_HOST = "api.lunaris.moe";
/** Host serving the fallback artifact icons. Mirrored in `next.config.mjs`. */
export const ARTIFACT_FALLBACK_CDN_HOST = "gi.yatta.moe";

const PRIMARY_BASE = `https://${ARTIFACT_CDN_HOST}/data/assets/artifacts/`;
const FALLBACK_BASE = `https://${ARTIFACT_FALLBACK_CDN_HOST}/assets/UI/reliquary/`;

/**
 * Shape of an `iconId` published by the source: `UI_RelicIcon_<setId>_<slot>`.
 * Anything else is not an icon id we have ever seen resolve, so it is treated
 * as absent rather than sent to the network as a guess.
 */
const ICON_ID_PATTERN = /^UI_RelicIcon_\d+_[1-5]$/;

/**
 * Project Amber's piece suffixes, confirmed from each set's cached `suit` data:
 * 1=goblet, 2=plume, 3=circlet, 4=flower, 5=sands.
 */
const SLOT_SUFFIX: Record<ArtifactSlot, 1 | 2 | 3 | 4 | 5> = {
  sands: 5,
  goblet: 1,
  circlet: 3,
  flower: 4,
  plume: 2,
};

export interface ArtifactIconSources {
  /** Primary URL, or `null` when the set carries no usable icon id. */
  readonly primary: string | null;
  /** Secondary URL, tried only after `primary` errors. */
  readonly fallback: string | null;
}

const NO_SOURCES: ArtifactIconSources = { primary: null, fallback: null };

/**
 * Full source chain for an artifact set icon.
 *
 * Returns both URLs so URL construction lives in one tested place rather than
 * in the component. A set with a missing or malformed `iconId` resolves to no
 * URL at all, so the UI renders its placeholder immediately instead of firing
 * a request that is known to fail and flashing a broken image.
 */
export function getArtifactIconSources(iconId: string | undefined): ArtifactIconSources {
  if (iconId === undefined || !ICON_ID_PATTERN.test(iconId)) return NO_SOURCES;
  return {
    primary: `${PRIMARY_BASE}${iconId}.webp`,
    fallback: `${FALLBACK_BASE}${iconId}.png`,
  };
}

/**
 * Ordered source chain for a specific artifact piece.
 *
 * Most sets expose all five piece icons. A small group of legacy one-piece
 * sets exposes only its published suffix, so the original set icon is kept as
 * the final fallback instead of guessing that every suffix exists.
 */
export function getArtifactIconSourcesForSlot(
  iconId: string | undefined,
  slot: ArtifactSlot,
): readonly string[] {
  const setSources = getArtifactIconSources(iconId);
  if (iconId === undefined || setSources.primary === null || setSources.fallback === null) {
    return [];
  }

  const pieceIconId = iconId.replace(/_[1-5]$/, `_${SLOT_SUFFIX[slot]}`);
  const pieceSources = getArtifactIconSources(pieceIconId);
  return Array.from(
    new Set(
      [pieceSources.primary, pieceSources.fallback, setSources.primary, setSources.fallback].filter(
        (source): source is string => source !== null,
      ),
    ),
  );
}

/**
 * Text shown when no icon renders. A single character keeps the placeholder
 * legible at the 36px size the picker uses, where two characters of a Chinese
 * set name would be unreadable.
 */
export function getArtifactInitial(nameZh: string): string {
  const trimmed = nameZh.trim();
  return trimmed.length === 0 ? "?" : trimmed.slice(0, 1);
}
