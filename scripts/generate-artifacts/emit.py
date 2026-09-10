#!/usr/bin/env python3
"""
Stage 3 of the artifact-data generator: emit TypeScript from the cache.

    python3 scripts/generate-artifacts/fetch.py
    python3 scripts/generate-artifacts/emit.py

WHAT IS EMITTED, and the split that MASTER-PLAN Wave 2 asks for

  generated/artifactSets.ts     REFERENCE RECORDS. Set identity, rarity, the
                                five slots with their per-slot piece names, and
                                the official set-bonus prose in English and
                                Chinese. Presentation data; no combat claim.

  generated/setEffects.ts       CONDITIONAL EFFECTS as `Buff`-shaped data, one
                                row per bonus, each carrying an honest `support`
                                flag. This is the ONLY file a damage path may
                                read, and only the "modelled" rows of it.

Static stats and conditional effects are therefore separate MODULES, not two
fields of one record, so a consumer cannot accidentally treat a conditional
grant as part of the panel.

WHAT IS DELIBERATELY NOT EMITTED

  Main-stat and substat VALUE TABLES. Neither source exposes them; every
  candidate endpoint 404s (recorded in fetch.py). They are therefore absent
  rather than reconstructed from memory -- which is exactly how the roster this
  project had to delete was written. `MAIN_STAT_VALUES_UNAVAILABLE` in the
  emitted module states this in code, reachable from TypeScript, so the gap
  cannot be mistaken for an oversight.

  Substat ROLLS. Out of scope by project rule: the simulation path is
  deterministic and the optimizer depends on it. Substats are the user's fixed
  owned values, entered as data, never rolled.

  Per-level main-stat progression. Same reason as the value tables.

  Legal main-stat DISTRIBUTIONS per slot. Flower/Plume are fixed by the game
  (flat HP / flat ATK) and are stated as such; the variable slots' legal sets
  are a game rule neither source publishes as data, so they are not invented.

DETERMINISM. Sets are emitted in ascending numeric set-id order, bonuses in
ascending piece count, and every dict is written through `sorted`. Re-running
the emitter on an unchanged cache produces a byte-identical file. The fetch
timestamp comes from the cache's provenance record, never from the clock.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import classify as C  # noqa: E402

# Amber's `suit` keys, in the engine's `ARTIFACT_SLOTS` order. The mapping is
# the game's own internal naming and is the join between the two sources.
SLOT_BY_EQUIP_KEY = {
    "EQUIP_BRACER": "flower",
    "EQUIP_NECKLACE": "plume",
    "EQUIP_SHOES": "sands",
    "EQUIP_RING": "goblet",
    "EQUIP_DRESS": "circlet",
}
SLOT_ORDER = ["flower", "plume", "sands", "goblet", "circlet"]

SUPPORT_BY_BUCKET = {
    C.BUCKET_EXPRESSIBLE: "modelled",
    C.BUCKET_UNIMPLEMENTED: "unimplemented",
    C.BUCKET_UNVERIFIED: "unverified",
}


def ts_string(value: str) -> str:
    """A TypeScript double-quoted string literal."""
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "")
    )
    return f'"{escaped}"'


def ts_number(value: float) -> str:
    """
    A number literal with no float noise.

    Source floats are single-precision game values (0.15000000596046448), so
    they are rounded to 6 decimal places -- far finer than any real magnitude
    and coarse enough to erase the representation artefact.
    """
    rounded = round(value, 6)
    if rounded == int(rounded):
        return str(int(rounded))
    return repr(rounded)


def slug(name: str) -> str:
    """
    Stable id from the English set name.

    Matches `findArtifact`'s existing normalisation in registry.ts
    (lowercase, keep [a-z0-9-]) so ids stay lookup-compatible.
    """
    out = []
    for ch in name.lower():
        if ch.isalnum():
            out.append(ch)
        elif ch in " -_":
            out.append("-")
        # apostrophes and punctuation are dropped, matching the registry
    text = "".join(out)
    while "--" in text:
        text = text.replace("--", "-")
    return text.strip("-")


def load_cache(cache: pathlib.Path) -> tuple[dict, dict, dict, dict]:
    amber_en = {}
    amber_chs = {}
    lunaris = {}
    listing = json.loads((cache / "amber" / "en" / "_list.json").read_text("utf-8"))
    set_ids = sorted(listing["data"]["items"], key=int)
    for set_id in set_ids:
        amber_en[set_id] = json.loads(
            (cache / "amber" / "en" / f"{set_id}.json").read_text("utf-8")
        )["data"]
        amber_chs[set_id] = json.loads(
            (cache / "amber" / "chs" / f"{set_id}.json").read_text("utf-8")
        )["data"]
        lunaris[set_id] = json.loads(
            (cache / "lunaris" / f"{set_id}.json").read_text("utf-8")
        ).get("info", {})
    provenance = json.loads((cache / "_provenance.json").read_text("utf-8"))
    return amber_en, amber_chs, lunaris, provenance


def bonus_rows(amber: dict, chs: dict, lun: dict) -> list[dict]:
    """
    Pair up each set's bonuses across the two sources.

    Amber keys `affixList` by an internal affix id whose ASCENDING order is the
    piece order (2-piece then 4-piece). A handful of one-bonus sets exist (the
    single-piece elemental-resistance relics), which is why the piece count is
    derived from the affix COUNT rather than assumed to be two.
    """
    affixes = sorted(amber["affixList"].items())
    chs_affixes = sorted(chs["affixList"].items())
    rows = []
    for index, (affix_id, text) in enumerate(affixes):
        pieces = 1 if len(affixes) == 1 else (2 if index == 0 else 4)
        verifier = lun.get("setBonuses", {}).get(f"{pieces}pc", {})
        rows.append(
            {
                "affixId": affix_id,
                "pieces": pieces,
                "text": text,
                "textZh": chs_affixes[index][1] if index < len(chs_affixes) else None,
                "params": tuple(verifier.get("params") or ()),
                "verifierText": verifier.get("description"),
            }
        )
    return rows


# ---------------------------------------------------------------------------
# artifactSets.ts -- reference records
# ---------------------------------------------------------------------------

SETS_HEADER = """// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-artifacts/fetch.py
//     python3 scripts/generate-artifacts/emit.py
//
// ARTIFACT SET REFERENCE RECORDS -- identity, rarity, slots and official prose.
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    https://gi.yatta.moe/api/v2/{lang}/reliquary/{id}
//                    locales: en (names/search), chs (display text)
//   Verifier source  Lunaris %(version)s
//                    https://api.lunaris.moe/data/{version}/en/artifact/{id}.json
//   Fetched at       %(fetched)s
//
// THIS FILE MAKES NO COMBAT CLAIM. It carries what a set IS -- its name in two
// languages, its rarity, its five slots and the official wording of its
// bonuses. The EFFECTS of those bonuses, with an honest support flag each, live
// in `setEffects.ts`. The split is deliberate: static build stats and
// conditional combat buffs must never travel in one record, or a conditional
// grant gets added to the panel and applied again on the timeline.
//
// WHAT IS ABSENT, AND WHY IT IS ABSENT RATHER THAN GUESSED
// Main-stat and substat value tables are NOT here. Neither source publishes
// them (every candidate endpoint 404s -- see fetch.py). Reconstructing them
// from memory is precisely how this project's 132-character roster came to be
// 83%% wrong, so the gap is stated instead: see `MAIN_STAT_VALUES_UNAVAILABLE`.
// ============================================================================

import type { ArtifactSetDefinition } from "../types";

/**
 * The five slots, in the engine's `ARTIFACT_SLOTS` order.
 *
 * Flower and Plume have game-fixed main stats (flat HP and flat ATK). The
 * other three vary, and the legal main-stat set per slot is a game rule that
 * neither source publishes as data -- so it is NOT enumerated here.
 */
export type GeneratedArtifactSlot =
  | "flower"
  | "plume"
  | "sands"
  | "goblet"
  | "circlet";

/** One physical piece of a set: which slot it occupies and what it is called. */
export interface GeneratedArtifactPiece {
  readonly slot: GeneratedArtifactSlot;
  readonly nameEn: string;
  readonly nameZh: string;
}

/**
 * Why no main-stat or substat VALUES appear in this module.
 *
 * Exported as a const so the gap is reachable from TypeScript and shows up in
 * a search, rather than living only in a comment nobody greps. A caller that
 * needs these values must source them; it must not invent them.
 */
export const MAIN_STAT_VALUES_UNAVAILABLE =
  "Artifact main-stat and substat value tables are not published by either " +
  "generator source (Project Amber and Lunaris both 404 on every affix/upgrade " +
  "endpoint probed). No values are emitted. TODO: find a second source that " +
  "publishes per-level main-stat values before any build math depends on them.";

/** Substat rolls are deliberately not modelled. */
export const SUBSTAT_ROLLS_OUT_OF_SCOPE =
  "Substat rolls are out of scope by project rule: the simulation path is " +
  "deterministic and the optimizer depends on that. Substats are the user's " +
  "fixed owned values, entered as data, never randomly rolled.";

"""


def emit_sets(rows: list[dict], provenance: dict) -> str:
    out = [
        SETS_HEADER
        % {
            "version": provenance.get("lunarisVersion", "unknown"),
            "fetched": provenance.get("fetchedAt", "unknown"),
        }
    ]
    out.append("/** Every artifact set, in ascending game set-id order. */\n")
    out.append(
        "export const generatedArtifactSets: readonly (ArtifactSetDefinition & {\n"
        "  readonly setId: number;\n"
        "  readonly pieces: readonly GeneratedArtifactPiece[];\n"
        "})[] = [\n"
    )
    for row in rows:
        out.append("  {\n")
        out.append(f"    id: {ts_string(row['id'])},\n")
        out.append(f"    setId: {row['setId']},\n")
        out.append(f"    nameEn: {ts_string(row['nameEn'])},\n")
        out.append(f"    nameZh: {ts_string(row['nameZh'])},\n")
        out.append(f"    rarity: {row['rarity']},\n")
        icon_id = row.get("iconId")
        if icon_id:
            out.append(f"    iconId: {ts_string(icon_id)},\n")
            out.append(
                f"    iconUrl: {ts_string('https://gi.yatta.moe/assets/UI/' + icon_id + '.png')},\n"
            )
        out.append("    bonuses: [\n")
        for bonus in row["bonuses"]:
            out.append("      {\n")
            out.append(f"        pieces: {bonus['pieces']},\n")
            out.append(
                f"        descriptionZh: {ts_string(bonus['textZh'] or bonus['text'])},\n"
            )
            out.append("      },\n")
        out.append("    ],\n")
        out.append("    pieces: [\n")
        for piece in row["pieces"]:
            out.append(
                "      { slot: %s, nameEn: %s, nameZh: %s },\n"
                % (
                    ts_string(piece["slot"]),
                    ts_string(piece["nameEn"]),
                    ts_string(piece["nameZh"]),
                )
            )
        out.append("    ],\n")
        out.append("  },\n")
    out.append("];\n")
    return "".join(out)


# ---------------------------------------------------------------------------
# setEffects.ts -- conditional effects with an honest support flag
# ---------------------------------------------------------------------------

EFFECTS_HEADER = """// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-artifacts/fetch.py
//     python3 scripts/generate-artifacts/emit.py
//
// ARTIFACT SET BONUSES AS `Buff` DATA -- with an HONEST support flag per row.
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    https://gi.yatta.moe/api/v2/{lang}/reliquary/{id}
//   Verifier source  Lunaris %(version)s
//                    https://api.lunaris.moe/data/{version}/en/artifact/{id}.json
//   Fetched at       %(fetched)s
//
// WHY THIS MODULE IS SEPARATE FROM `artifactSets.ts`
// A set bonus is a CONDITIONAL effect, not a static stat. MASTER-PLAN Wave 2
// requires the two be kept apart so a conditional grant is never pre-added to
// the resolved panel and then applied a second time on the timeline. Reference
// records live next door; only this file describes combat behaviour.
//
// THESE ROWS REUSE THE DECLARATIVE BUFF SYSTEM. `modifiers` mirrors
// `StatModifier` and `conditions` mirrors `BuffCondition` in
// `src/simulation/buffs/types.ts`, field for field, so a consumer builds a
// `Buff` from a row without a translation table. Set bonuses deliberately do
// NOT get a parallel effect mechanism of their own.
//
// WHAT `support` MEANS -- read this before using any row
//
//   "modelled"       The effect maps onto the existing `Buff` vocabulary with
//                    no invented mechanism, and both sources corroborate every
//                    number. `modifiers` is usable as-is, subject to
//                    `conditions` when present.
//
//   "unimplemented"  The numbers are unambiguous but the vocabulary has no
//                    channel for the effect -- healing, shields, stamina,
//                    attack speed, cooldown or energy manipulation, or a
//                    trigger `BuffCondition` cannot state. The numbers ARE
//                    emitted (`params`) so nothing must be re-derived, and
//                    `reason` says what would be needed.
//                    DO NOT apply these as though they were unconditional.
//
//   "unverified"     The prose could not be reduced to a number without
//                    guessing, or the sources disagree. `text` is for display
//                    only. NOT ONE NUMBER HERE WAS GUESSED.
//
// Rows the two sources contradict are marked "unverified" and forfeit every
// structured claim, rather than being split or picked between.
//
// DETERMINISM: no RNG. A probabilistic set bonus is classified
// "unimplemented", never converted into an expected value, because the
// simulation path must stay deterministic for the optimizer.
// ============================================================================

/** How completely an effect is modelled. See the header. */
export type ArtifactEffectSupport =
  | "modelled"
  | "unimplemented"
  | "unverified";

/** A stat change. Mirrors `StatModifier` in `src/simulation/buffs/types.ts`. */
export interface ArtifactStatModifier {
  readonly stat: string;
  readonly value: number;
  readonly element?: string;
  readonly reaction?: string;
}

/** A gate. Mirrors `BuffCondition` in `src/simulation/buffs/types.ts`. */
export interface ArtifactEffectCondition {
  readonly damageTypes?: readonly string[];
  readonly elements?: readonly string[];
  readonly requiresOnField?: boolean;
  readonly enemyAuraElements?: readonly string[];
  readonly enemyAuraKinds?: readonly string[];
  readonly minEnemyHpFraction?: number;
  readonly maxEnemyHpFraction?: number;
  readonly weaponTypes?: readonly string[];
  readonly minHpFraction?: number;
  readonly maxHpFraction?: number;
  readonly requiresShield?: boolean;
}

/** One set bonus (2-piece or 4-piece) and everything known about it. */
export interface GeneratedArtifactEffect {
  /** `${setSlug}-${pieces}pc`, e.g. "gladiators-finale-2pc". */
  readonly id: string;
  /** Set id this bonus belongs to, matching `artifactSets.ts`. */
  readonly setSlug: string;
  readonly setId: number;
  /** How many pieces activate it. */
  readonly pieces: number;
  /** Official English wording. */
  readonly text: string;
  /** Official Chinese wording -- the product's display language. */
  readonly textZh: string;
  readonly support: ArtifactEffectSupport;
  /** Why, when `support` is not "modelled". */
  readonly reason?: string;
  /** Usable only when `support === "modelled"`. */
  readonly modifiers?: readonly ArtifactStatModifier[];
  readonly conditions?: ArtifactEffectCondition;
  /**
   * Numbers the verifier states for this bonus, kept for EVERY bucket so an
   * unimplemented row never has to be re-derived by hand later.
   */
  readonly params?: readonly number[];
}

"""


def emit_effects(rows: list[dict], provenance: dict) -> str:
    out = [
        EFFECTS_HEADER
        % {
            "version": provenance.get("lunarisVersion", "unknown"),
            "fetched": provenance.get("fetchedAt", "unknown"),
        }
    ]
    out.append(
        "/** Every set bonus, ascending by set id then piece count. */\n"
        "export const generatedArtifactEffects: readonly GeneratedArtifactEffect[] = [\n"
    )
    for row in rows:
        for bonus in row["bonuses"]:
            result: C.Classified = bonus["classified"]
            support = SUPPORT_BY_BUCKET[result.bucket]
            out.append("  {\n")
            out.append(
                f"    id: {ts_string(f'{row['id']}-{bonus['pieces']}pc')},\n"
            )
            out.append(f"    setSlug: {ts_string(row['id'])},\n")
            out.append(f"    setId: {row['setId']},\n")
            out.append(f"    pieces: {bonus['pieces']},\n")
            out.append(f"    text: {ts_string(bonus['text'])},\n")
            out.append(
                f"    textZh: {ts_string(bonus['textZh'] or bonus['text'])},\n"
            )
            out.append(f"    support: {ts_string(support)},\n")
            if result.reason:
                out.append(f"    reason: {ts_string(result.reason)},\n")
            if result.modifiers:
                out.append("    modifiers: [\n")
                for modifier in result.modifiers:
                    parts = [
                        f"stat: {ts_string(modifier.stat)}",
                        f"value: {ts_number(modifier.value)}",
                    ]
                    if modifier.element:
                        parts.append(f"element: {ts_string(modifier.element)}")
                    if modifier.reaction:
                        parts.append(f"reaction: {ts_string(modifier.reaction)}")
                    out.append("      { " + ", ".join(parts) + " },\n")
                out.append("    ],\n")
            condition = result.condition
            if (
                condition.damage_types
                or condition.elements
                or condition.requires_on_field is not None
                or getattr(condition, "enemy_aura_elements", ())
                or getattr(condition, "enemy_aura_kinds", ())
                or getattr(condition, "min_enemy_hp_fraction", None) is not None
                or getattr(condition, "max_enemy_hp_fraction", None) is not None
                or getattr(condition, "weapon_types", ())
                or getattr(condition, "min_hp_fraction", None) is not None
                or getattr(condition, "max_hp_fraction", None) is not None
                or getattr(condition, "requires_shield", None) is not None
            ):
                out.append("    conditions: {\n")
                if condition.damage_types:
                    values = ", ".join(ts_string(v) for v in condition.damage_types)
                    out.append(f"      damageTypes: [{values}],\n")
                if condition.elements:
                    values = ", ".join(ts_string(v) for v in condition.elements)
                    out.append(f"      elements: [{values}],\n")
                if condition.requires_on_field is not None:
                    flag = "true" if condition.requires_on_field else "false"
                    out.append(f"      requiresOnField: {flag},\n")
                if getattr(condition, "enemy_aura_elements", ()):
                    values = ", ".join(ts_string(v) for v in condition.enemy_aura_elements)
                    out.append(f"      enemyAuraElements: [{values}],\n")
                if getattr(condition, "enemy_aura_kinds", ()):
                    values = ", ".join(ts_string(v) for v in condition.enemy_aura_kinds)
                    out.append(f"      enemyAuraKinds: [{values}],\n")
                if getattr(condition, "min_enemy_hp_fraction", None) is not None:
                    out.append(f"      minEnemyHpFraction: {ts_number(condition.min_enemy_hp_fraction)},\n")
                if getattr(condition, "max_enemy_hp_fraction", None) is not None:
                    out.append(f"      maxEnemyHpFraction: {ts_number(condition.max_enemy_hp_fraction)},\n")
                if getattr(condition, "weapon_types", ()):
                    values = ", ".join(ts_string(v) for v in condition.weapon_types)
                    out.append(f"      weaponTypes: [{values}],\n")
                if getattr(condition, "min_hp_fraction", None) is not None:
                    out.append(f"      minHpFraction: {ts_number(condition.min_hp_fraction)},\n")
                if getattr(condition, "max_hp_fraction", None) is not None:
                    out.append(f"      maxHpFraction: {ts_number(condition.max_hp_fraction)},\n")
                if getattr(condition, "requires_shield", None) is not None:
                    flag = "true" if condition.requires_shield else "false"
                    out.append(f"      requiresShield: {flag},\n")
                out.append("    },\n")
            if result.params:
                values = ", ".join(ts_number(p) for p in result.params)
                out.append(f"    params: [{values}],\n")
            out.append("  },\n")
    out.append("];\n")
    return "".join(out)


INDEX = """// GENERATED FILE -- DO NOT EDIT BY HAND.
export * from "./artifactSets";
export * from "./setEffects";
"""


def build_rows(cache: pathlib.Path) -> tuple[list[dict], dict]:
    amber_en, amber_chs, lunaris, provenance = load_cache(cache)
    rows = []
    # Ascending numeric set id: a stable, source-defined order that does not
    # depend on names or on dict iteration.
    for set_id in sorted(amber_en, key=int):
        amber = amber_en[set_id]
        chs = amber_chs[set_id]
        lun = lunaris[set_id]
        bonuses = bonus_rows(amber, chs, lun)
        for bonus in bonuses:
            bonus["classified"] = C.classify(
                bonus["text"], bonus["params"], bonus["verifierText"]
            )
        pieces = []
        for equip_key, slot in SLOT_BY_EQUIP_KEY.items():
            piece_en = amber.get("suit", {}).get(equip_key)
            piece_zh = chs.get("suit", {}).get(equip_key)
            if not piece_en:
                continue
            pieces.append(
                {
                    "slot": slot,
                    "nameEn": piece_en["name"],
                    "nameZh": (piece_zh or piece_en)["name"],
                }
            )
        pieces.sort(key=lambda p: SLOT_ORDER.index(p["slot"]))
        rows.append(
            {
                "setId": int(set_id),
                "id": slug(amber["name"]),
                "nameEn": amber["name"],
                "nameZh": chs["name"],
                # Exact Project Amber icon identity; never derive from names.
                "iconId": amber.get("icon"),
                # `levelList` is the set's rarity ladder; the max is the rarity
                # a player actually farms it at.
                "rarity": max(amber["levelList"]),
                "bonuses": bonuses,
                "pieces": pieces,
            }
        )
    return rows, provenance


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--cache",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parent / ".cache",
    )
    parser.add_argument(
        "--out",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parents[2]
        / "src"
        / "game-data"
        / "artifacts"
        / "generated",
    )
    args = parser.parse_args()

    rows, provenance = build_rows(args.cache)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "artifactSets.ts").write_text(
        emit_sets(rows, provenance), encoding="utf-8"
    )
    (args.out / "setEffects.ts").write_text(
        emit_effects(rows, provenance), encoding="utf-8"
    )
    (args.out / "index.ts").write_text(INDEX, encoding="utf-8")

    counts: dict[str, int] = {}
    for row in rows:
        for bonus in row["bonuses"]:
            bucket = bonus["classified"].bucket
            counts[bucket] = counts.get(bucket, 0) + 1
    total = sum(counts.values())
    print(f"emitted {len(rows)} sets, {total} set bonuses", file=sys.stderr)
    for bucket in (C.BUCKET_EXPRESSIBLE, C.BUCKET_UNIMPLEMENTED, C.BUCKET_UNVERIFIED):
        print(f"  {bucket:>14}: {counts.get(bucket, 0)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
