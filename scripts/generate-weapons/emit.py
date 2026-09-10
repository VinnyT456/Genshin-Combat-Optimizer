#!/usr/bin/env python3
"""
Stage 2 of the weapon-data generator: emit TypeScript from the cached sources.

Regenerates `src/game-data/weapons/generated/`. The emitted files are OUTPUT --
never hand-edit them; change this script and re-run.

WHAT THIS REPLACES
`src/game-data/weapons/weaponsData.ts` is hand-authored, carries level-90
values only, and cites the Fandom wiki (see its `iconUrl`s), a source
`docs/ROADMAP.md` §4 records as blocked and unusable. Its level-90 numbers spot-
check correct, but "correct where checked, unsourced everywhere else, and
single-source" is the precondition of the TASK #028 failure, not a defence
against it. This generator re-derives the same values from the two datamined
sources that already back the character roster, and additionally recovers the
per-level curves and refinement scaling the hand-authored file never had.

WHAT IS AND IS NOT EMITTED
Stats are emitted per level 1..90 for base ATK and the substat, both
cross-verified (see `curves.py`).

PASSIVES ARE PROSE and are bucketed exactly as constellations are, by reusing
the character generator's `perks` module rather than re-implementing the same
classification a second time:

  expressible     maps onto the declarative buff vocabulary.
  unimplemented   carries sourced numbers, but no channel exists for them.
  unverified      the prose states no number this parser can read, or the two
                  sources contradict each other.

A passive in the second or third bucket is emitted with its TEXT and its bucket,
never with an invented effect. Refinement is data, not a code branch: each
refinement level's own prose and numbers are emitted separately.

Usage:
    python3 scripts/generate-weapons/emit.py [--cache DIR] [--out DIR]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

# ORDER MATTERS. Both generators define a module named `curves`, and they are
# NOT interchangeable -- the character solver keys ascension phase off rows the
# verifier labels, the weapon solver has to derive it from the level ladder.
# This directory therefore goes LAST in the insert sequence so that it ends up
# FIRST on `sys.path` and wins the name.
#
# The character generator owns the prose classifier. Weapon passives, artifact
# set bonuses and constellations are the SAME idea, so they must go through the
# SAME classifier -- a second copy would drift and would be the "three parallel
# implementations of one concept" the project explicitly forbids.
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "generate-characters"))
sys.path.insert(0, str(pathlib.Path(__file__).parent))

import curves  # noqa: E402
import passives  # noqa: E402
import perks  # noqa: E402

assert hasattr(curves, "MIN_WEAPON_LEVEL"), (
    "imported the character generator's `curves` module instead of this one -- "
    "check the sys.path order above"
)

MIN_LEVEL = curves.MIN_WEAPON_LEVEL
MAX_LEVEL = curves.MAX_WEAPON_LEVEL

REFINEMENT_LEVELS = (1, 2, 3, 4, 5)

#: Amber weapon type -> the `WeaponType` the existing hand-authored types use.
WEAPON_TYPE_BY_AMBER = {
    "Sword": "sword",
    "Claymore": "claymore",
    "Polearm": "polearm",
    "Catalyst": "catalyst",
    "Bow": "bow",
}

#: Amber substat property -> the `EquipmentStatKey` the simulation seam defines
#: in `src/simulation/character/equipment.ts`. A property absent here has no
#: channel in the stat model and is emitted as an UNVERIFIED substat rather than
#: mapped onto an approximately-similar key.
EQUIPMENT_STAT_BY_PROP = {
    "FIGHT_PROP_ATTACK_PERCENT": "atkPercent",
    "FIGHT_PROP_HP_PERCENT": "hpPercent",
    "FIGHT_PROP_DEFENSE_PERCENT": "defPercent",
    "FIGHT_PROP_CRITICAL": "critRate",
    "FIGHT_PROP_CRITICAL_HURT": "critDmg",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "energyRecharge",
    "FIGHT_PROP_ELEMENT_MASTERY": "elementalMastery",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "dmgBonus",
}


def ts_string(value: str) -> str:
    """Emit a TypeScript double-quoted string literal."""
    escaped = (
        value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    )
    return f'"{escaped}"'


def ts_number(value: float) -> str:
    """Emit a number without float noise."""
    if value == int(value):
        return str(int(value))
    return repr(round(value, 6))


def identifier_for(name: str) -> str:
    """A lower-camel TypeScript identifier derived from a weapon name."""
    parts = [p for p in "".join(c if c.isalnum() else " " for c in name).split() if p]
    if not parts:
        return "weapon"
    head = parts[0].lower()
    tail = "".join(p[:1].upper() + p[1:].lower() for p in parts[1:])
    identifier = head + tail
    return identifier if identifier[0].isalpha() else f"w{identifier}"


def slug_for(name: str) -> str:
    """
    The weapon id, matching `findWeapon`'s existing normalisation.

    `registry.ts` looks up by `id.toLowerCase().replace(/[^a-z0-9]/g, "")`, so
    the emitted id must already be in that form or existing lookups miss.
    """
    return "".join(c for c in name.lower() if c.isalnum())


def load(path: pathlib.Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def stat_table(
    amber_data: dict, solution: curves.CurveSolution
) -> tuple[dict[int, float], tuple[str, dict[int, float]] | None, list[str]]:
    """
    Per-level base ATK and substat for one weapon.

    Returns `(baseAtkByLevel, (substatProp, valueByLevel) | None, notes)`.
    A level whose shared curve multiplier was not solvable is OMITTED from the
    table and named in `notes`, so a consumer sees a missing level rather than
    an interpolated guess.
    """
    ladder = curves._phase_ladder(amber_data)
    bonuses = curves._promote_bonus_by_phase(amber_data)
    notes: list[str] = []

    # A WEAPON'S OWN CAP, NOT THE 5-STAR ONE.
    #
    # The 1- and 2-star weapons ascend to level 70, not 90; their promote
    # ladder tops out at phase 4. BOTH sources nevertheless publish rows for
    # levels 71..90, and those rows are GARBAGE: Apprentice's Notes is
    # published at 185 ATK at L70 and 140 at L71, because above the cap the
    # ascension bonus is no longer applied to a level the weapon cannot reach.
    #
    # Both sources agreeing does not make a value true -- they are two mirrors
    # of the SAME upstream table, so they reproduce its artefacts identically
    # and the cross-verification cannot see it. This is the one place a
    # published number is rejected on a STRUCTURAL fact (the weapon's own
    # ladder) rather than on disagreement.
    #
    # Emitting them would have shipped a base ATK that DROPS 24% as a weapon
    # levels up. Levels above the cap are omitted and reported, exactly as an
    # unsolvable level is -- a consumer sees a missing level, never a fabricated
    # one.
    max_level = min(MAX_LEVEL, max((cap for _, cap in ladder), default=MAX_LEVEL))

    base_atk: dict[int, float] = {}
    substat: tuple[str, dict[int, float]] | None = None

    for entry in (amber_data.get("upgrade") or {}).get("prop") or []:
        prop = entry.get("propType")
        curve_type = entry.get("type")
        init_value = entry.get("initValue")
        if not isinstance(prop, str) or not isinstance(curve_type, str):
            continue
        if not isinstance(init_value, (int, float)) or init_value <= 0:
            continue

        multipliers = solution.multipliers.get(curve_type, {})
        is_base_atk = prop == curves.PROP_BASE_ATK
        table: dict[int, float] = {}
        missing: list[int] = []
        for level in range(MIN_LEVEL, max_level + 1):
            multiplier = multipliers.get(level)
            if multiplier is None:
                missing.append(level)
                continue
            bonus = (
                bonuses.get(curves._phase_for_level(ladder, level), 0.0)
                if is_base_atk
                else 0.0
            )
            table[level] = float(init_value) * multiplier + bonus

        if max_level < MAX_LEVEL:
            notes.append(
                f"{'baseAtk' if is_base_atk else 'substat'}: levels "
                f"{max_level + 1}-{MAX_LEVEL} are omitted -- this weapon "
                f"ascends only to level {max_level}, and both sources publish "
                f"rows above that cap which drop the ascension bonus and are "
                f"therefore lower than the level below them"
            )
        if missing:
            notes.append(
                f"{'baseAtk' if is_base_atk else 'substat'}: "
                f"{len(missing)} level(s) omitted -- the shared growth curve "
                f"{curve_type} could not be solved there "
                f"(levels {missing[0]}-{missing[-1]})"
            )

        if is_base_atk:
            base_atk = table
        elif prop in EQUIPMENT_STAT_BY_PROP:
            substat = (prop, table)
        else:
            notes.append(
                f"substat: property {prop} has no channel in the equipment "
                f"stat model, so no substat is emitted for this weapon"
            )

    return base_atk, substat, notes


def parse_refinements(
    amber_data: dict, lunaris: dict | None
) -> tuple[str, list[dict], list[str]]:
    """
    One weapon's passive, per refinement level, cross-verified.

    Returns `(passiveName, rows, conflicts)`. A refinement whose two sources
    disagree NUMERICALLY forfeits every structured claim and is forced into the
    unverified bucket -- the same rule `perks.parse_perks` applies to a
    contradicted constellation, for the same reason.
    """
    affix = amber_data.get("affix") or {}
    if not affix:
        return "", [], []

    affix_entry = affix[sorted(affix)[0]]
    name = perks.strip_markup(affix_entry.get("name") or "")
    upgrades = affix_entry.get("upgrade") or {}

    verifier_passive = (lunaris or {}).get("passive") or {}
    verifier_refinements = verifier_passive.get("refinements") or {}

    rows: list[dict] = []
    conflicts: list[str] = []

    for refinement in REFINEMENT_LEVELS:
        raw = upgrades.get(str(refinement - 1))
        if not isinstance(raw, str):
            continue
        text = perks.strip_markup(raw)

        verifier = verifier_refinements.get(str(refinement))
        conflict: str | None = None
        if isinstance(verifier, dict):
            verifier_text = perks.strip_markup(verifier.get("description") or "")
            if perks.numbers_in(verifier_text) != perks.numbers_in(text):
                conflict = (
                    f"R{refinement} {name!r}: "
                    f"primary={perks.numbers_in(text)} "
                    f"verifier={perks.numbers_in(verifier_text)}"
                )
        else:
            conflict = f"R{refinement} {name!r}: verifier publishes no row"

        modifiers, enemy, conversions, bucket, reason = passives.parse_weapon_effects(
            text
        )

        if conflict is not None:
            conflicts.append(conflict)
            bucket, reason = perks.BUCKET_UNVERIFIED, perks.REASON_SOURCE_CONFLICT
            modifiers, enemy, conversions = [], [], []

        rows.append(
            {
                "refinement": refinement,
                "text": text,
                "bucket": bucket,
                "reason": reason,
                "modifiers": modifiers,
                "enemy": enemy,
                "conversions": conversions,
            }
        )

    return name, rows, conflicts


def emit_damage_types(damage_types: tuple[str, ...]) -> str | None:
    """
    The `damageTypes` field, or None when the effect is genuinely unscoped.

    Sorted so two runs over identical input are byte-identical; the parser
    already emits them sorted, and this re-sorts rather than trusting that,
    because a scope that silently reorders would produce a spurious diff.
    """
    if not damage_types:
        return None
    rendered = ", ".join(ts_string(t) for t in sorted(damage_types))
    return f"damageTypes: [{rendered}]"


def emit_modifier(modifier: passives.ScopedModifier) -> str:
    parts = [
        f"stat: {ts_string(modifier.stat)}",
        f"value: {ts_number(modifier.value)}",
    ]
    if modifier.element is not None:
        parts.append(f"element: {ts_string(modifier.element)}")
    scope = emit_damage_types(modifier.damage_types)
    if scope is not None:
        parts.append(scope)
    return "{ " + ", ".join(parts) + " }"


def emit_conversion(conversion: passives.ScopedConversion) -> str:
    parts = [
        f"sourceStat: {ts_string(conversion.source_stat)}",
        f"targetStat: {ts_string(conversion.target_stat)}",
        f"ratio: {ts_number(conversion.ratio)}",
    ]
    if conversion.max_cap is not None:
        parts.append(f"maxCap: {ts_number(conversion.max_cap)}")
    scope = emit_damage_types(conversion.damage_types)
    if scope is not None:
        parts.append(scope)
    return "{ " + ", ".join(parts) + " }"


def emit_enemy_modifier(modifier: perks.ParsedEnemyModifier) -> str:
    parts = [
        f"key: {ts_string(modifier.key)}",
        f"value: {ts_number(modifier.value)}",
    ]
    if modifier.element is not None:
        parts.append(f"element: {ts_string(modifier.element)}")
    return "{ " + ", ".join(parts) + " }"


HEADER = '''// ============================================================================
// GENERATED FILE -- DO NOT EDIT.
//
// Regenerate with:
//   python3 scripts/generate-weapons/fetch.py
//   python3 scripts/generate-weapons/emit.py
//
// SOURCES (two INDEPENDENT datamined mirrors of the game's own files)
//   primary   Project Amber  {amber_endpoint}
//   verifier  Lunaris        {lunaris_endpoint} (version {lunaris_version})
//   fetched   {fetched_at}
//
// Every emitted number is confirmed by BOTH sources. Per-level stats are
// recovered by solving each shared growth curve against the verifier's
// published values and then REPLAYING the solution back through every weapon
// that shares the curve; a level that fails is omitted and reported, never
// interpolated.
//
// Weapon PASSIVES are prose. They are bucketed, not guessed -- see
// `GeneratedWeaponPassiveBucket`. A passive that is not `expressible` carries
// its text and its bucket and NO invented effect.
// ============================================================================
'''

TYPES_MODULE = '''
import type { DamageType, Element } from "@/types";
import type { EquipmentStatKey } from "@/simulation/character/equipment";
import type {
  EnemyModifierKey,
  StatConversionSourceStat,
  StatKey,
} from "@/simulation/buffs/types";

/**
 * How much of one weapon passive this generator could express.
 *
 * The SAME three buckets the character generator applies to constellations and
 * passives, produced by the SAME classifier (`scripts/generate-characters/perks.py`).
 * Weapon passives, artifact set bonuses and constellations are one idea, so
 * they get one vocabulary.
 *
 *  `expressible`    maps onto the declarative buff vocabulary.
 *  `unimplemented`  carries sourced numbers, but no channel exists for them.
 *  `unverified`     states no readable number, or the two sources contradict.
 */
export type GeneratedWeaponPassiveBucket =
  | "expressible"
  | "unimplemented"
  | "unverified";

/**
 * A stat grant read out of a passive's prose, with the scope it is confined to.
 *
 * TYPED AGAINST THE SIMULATION, NOT `string`. `stat` is the engine's own
 * `StatKey` and `damageTypes` its own `DamageType`, so a generator that starts
 * emitting a channel the buff system does not have becomes a TYPECHECK FAILURE
 * here rather than a value that is silently ignored at runtime.
 *
 * SCOPE IS PART OF THE VALUE. `damageTypes` is the set of damage types the
 * grant applies to; ABSENT means genuinely unscoped (an always-on ATK%), and it
 * is never a "scope unknown" sentinel -- a clause whose scope could not be
 * resolved is not emitted at all. A consumer MUST carry this onto the buff's
 * `conditions.damageTypes`: dropping it turns Rust's Normal-Attack-only +40%
 * into a global one and inflates every other hit in the rotation.
 */
export interface GeneratedWeaponModifier {
  readonly stat: StatKey;
  readonly value: number;
  /** Required when `stat === "elementalDmgBonus"`; absent otherwise. */
  readonly element?: Element;
  /** Damage types this grant is confined to. Absent means unscoped. */
  readonly damageTypes?: readonly DamageType[];
}

/**
 * A "X% of stat A becomes stat B" clause read out of a passive's prose.
 *
 * `damageTypes` scopes the conversion's OUTPUT exactly as it does for a
 * modifier: Redhorn Stonethresher converts DEF into a damage bonus that applies
 * only to Normal and Charged attacks.
 */
export interface GeneratedWeaponConversion {
  readonly sourceStat: StatConversionSourceStat;
  readonly targetStat: StatKey;
  readonly ratio: number;
  readonly maxCap?: number;
  /** Damage types the converted bonus is confined to. Absent means unscoped. */
  readonly damageTypes?: readonly DamageType[];
}

/**
 * An enemy-side debuff (DEF / RES shred) read out of a passive's prose.
 *
 * Emitted because several weapons state one plainly. NOTE that the engine
 * declares `EnemyModifier` but nothing consumes it yet (see the UNSUPPORTED
 * note in `src/simulation/buffs/types.ts`) -- so a row carrying one of these is
 * bucketed on its own merits and the shred rides along as sourced data rather
 * than as a wired effect.
 */
export interface GeneratedWeaponEnemyModifier {
  readonly key: EnemyModifierKey;
  readonly value: number;
  /** Required when `key === "resReduction"`; absent otherwise. */
  readonly element?: Element;
}

/**
 * One refinement level of a weapon passive.
 *
 * REFINEMENT IS DATA, NOT A CODE BRANCH. Each level carries its own prose and
 * its own numbers, so consuming R3 is indexing, never arithmetic on R1.
 */
export interface GeneratedWeaponRefinement {
  readonly refinement: 1 | 2 | 3 | 4 | 5;
  /** The passive's text at this refinement, markup stripped. */
  readonly text: string;
  readonly bucket: GeneratedWeaponPassiveBucket;
  /** Why it is not `expressible`. Absent when it is. */
  readonly reason?: string;
  /** Stat grants, when the prose yielded them. Empty otherwise. */
  readonly modifiers: readonly GeneratedWeaponModifier[];
  /** Stat conversions, when the prose yielded them. Empty otherwise. */
  readonly conversions: readonly GeneratedWeaponConversion[];
  /** Enemy-side shred, when the prose yielded it. Empty otherwise. */
  readonly enemyModifiers: readonly GeneratedWeaponEnemyModifier[];
}

/** A weapon's passive across all five refinement levels. */
export interface GeneratedWeaponPassive {
  readonly name: string;
  readonly refinements: readonly GeneratedWeaponRefinement[];
}

/**
 * A weapon's substat.
 *
 * `valueByLevel` is a table, not a single number: the substat scales with
 * weapon level, and emitting only the level-90 value would silently return the
 * level-90 number at every level -- the exact failure class the TASK #028 audit
 * was called to end.
 *
 * Values are FRACTIONS for percentage stats (0.662 == +66.2%) and raw points
 * for Elemental Mastery, matching `EquipmentStat` in the simulation seam.
 */
export interface GeneratedWeaponSubstat {
  readonly stat: EquipmentStatKey;
  readonly valueByLevel: Readonly<Record<number, number>>;
}

/** One value this run could not confirm, and why. */
export interface GeneratedWeaponUnverifiedField {
  readonly field: string;
  readonly reason: string;
}

/** One weapon, generated and cross-verified. */
export interface GeneratedWeapon {
  readonly id: string;
  readonly name: string;
  readonly weaponType: "sword" | "claymore" | "polearm" | "catalyst" | "bow";
  readonly rarity: 1 | 2 | 3 | 4 | 5;
  /** Base ATK at each weapon level. A missing level was not solvable. */
  readonly baseAtkByLevel: Readonly<Record<number, number>>;
  /** Absent for the handful of weapons that have no secondary stat. */
  readonly substat?: GeneratedWeaponSubstat;
  /** Absent for the low-rarity weapons that have no passive. */
  readonly passive?: GeneratedWeaponPassive;
  /** Per-field caveats. Empty when this run confirmed every emitted value. */
  readonly unverified: readonly GeneratedWeaponUnverifiedField[];
}
'''


def emit_weapon(weapon: dict) -> list[str]:
    """One `GeneratedWeapon` object literal."""
    lines = ["  {"]
    lines.append(f"    id: {ts_string(weapon['id'])},")
    lines.append(f"    name: {ts_string(weapon['name'])},")
    lines.append(f"    weaponType: {ts_string(weapon['weaponType'])},")
    lines.append(f"    rarity: {weapon['rarity']},")

    entries = ", ".join(
        f"{level}: {ts_number(value)}"
        for level, value in sorted(weapon["baseAtkByLevel"].items())
    )
    lines.append(f"    baseAtkByLevel: {{ {entries} }},")

    substat = weapon.get("substat")
    if substat is not None:
        values = ", ".join(
            f"{level}: {ts_number(value)}"
            for level, value in sorted(substat["valueByLevel"].items())
        )
        lines.append("    substat: {")
        lines.append(f"      stat: {ts_string(substat['stat'])},")
        lines.append(f"      valueByLevel: {{ {values} }},")
        lines.append("    },")

    passive = weapon.get("passive")
    if passive is not None and passive["refinements"]:
        lines.append("    passive: {")
        lines.append(f"      name: {ts_string(passive['name'])},")
        lines.append("      refinements: [")
        for row in passive["refinements"]:
            lines.append("        {")
            lines.append(f"          refinement: {row['refinement']},")
            lines.append(f"          text: {ts_string(row['text'])},")
            lines.append(f"          bucket: {ts_string(row['bucket'])},")
            if row["reason"]:
                lines.append(f"          reason: {ts_string(row['reason'])},")
            if row["modifiers"]:
                rendered = ", ".join(emit_modifier(m) for m in row["modifiers"])
                lines.append(f"          modifiers: [{rendered}],")
            else:
                lines.append("          modifiers: [],")
            if row["conversions"]:
                rendered = ", ".join(emit_conversion(c) for c in row["conversions"])
                lines.append(f"          conversions: [{rendered}],")
            else:
                lines.append("          conversions: [],")
            if row["enemy"]:
                rendered = ", ".join(emit_enemy_modifier(e) for e in row["enemy"])
                lines.append(f"          enemyModifiers: [{rendered}],")
            else:
                lines.append("          enemyModifiers: [],")
            lines.append("        },")
        lines.append("      ],")
        lines.append("    },")

    if weapon["unverified"]:
        lines.append("    unverified: [")
        for field, reason in weapon["unverified"]:
            lines.append(
                f"      {{ field: {ts_string(field)}, reason: {ts_string(reason)} }},"
            )
        lines.append("    ],")
    else:
        lines.append("    unverified: [],")

    lines.append("  },")
    return lines


def build_weapon(
    weapon_id: str,
    amber: dict,
    lunaris: dict | None,
    solution: curves.CurveSolution,
) -> tuple[dict | None, list[str], str | None]:
    """
    Assemble one weapon, or explain why it was skipped.

    Returns `(weapon, conflicts, skip_reason)`.
    """
    data = amber.get("data") or {}
    name = data.get("name")
    if not isinstance(name, str) or not name:
        return None, [], "source publishes no name"

    amber_type = data.get("type")
    weapon_type = WEAPON_TYPE_BY_AMBER.get(amber_type or "")
    if weapon_type is None:
        return None, [], f"unmapped weapon type {amber_type!r}"

    rarity = data.get("rank")
    if not isinstance(rarity, int) or not 1 <= rarity <= 5:
        return None, [], f"unmapped rarity {rarity!r}"

    if lunaris is None:
        # Fail CLOSED. A weapon the verifier does not publish cannot be
        # cross-verified, and single-source data is what this generator exists
        # to replace.
        return None, [], "verifier publishes no entry, so nothing is confirmable"

    base_atk, substat_pair, notes = stat_table(data, solution)
    if not base_atk:
        return None, [], "no solvable base-ATK curve"

    unverified: list[tuple[str, str]] = [("stats", note) for note in notes]

    substat: dict | None = None
    if substat_pair is not None:
        prop, table = substat_pair
        stat_key = EQUIPMENT_STAT_BY_PROP[prop]
        # NO SCALING HERE, DELIBERATELY.
        #
        # `curves.observations_for` scales Amber's fraction to the verifier's
        # percentage units only to COMPARE the two; `stat_table` above rebuilds
        # the value from the raw `initValue`, which is already the fraction the
        # equipment stat model wants (0.144 -> 0.662 at level 90 for Staff of
        # Homa's CRIT DMG). Applying a further 0.01 here emitted 0.006616 --
        # a 100x understatement that every structural check would have passed.
        substat = {
            "stat": stat_key,
            "valueByLevel": dict(sorted(table.items())),
        }

    passive_name, refinements, conflicts = parse_refinements(data, lunaris)
    passive = (
        {"name": passive_name, "refinements": refinements} if refinements else None
    )
    if passive is None and (data.get("affix") or {}):
        unverified.append(
            ("passive", "the source publishes an affix this run could not read")
        )
    for row in refinements:
        if row["bucket"] != perks.BUCKET_EXPRESSIBLE:
            unverified.append(
                (
                    f"passive.r{row['refinement']}",
                    f"{row['bucket']}: {row['reason'] or 'no reason recorded'}",
                )
            )

    weapon = {
        "id": slug_for(name),
        "name": name,
        "weaponType": weapon_type,
        "rarity": rarity,
        "baseAtkByLevel": base_atk,
        "substat": substat,
        "passive": passive,
        "unverified": sorted(set(unverified)),
    }
    return weapon, conflicts, None


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    here = pathlib.Path(__file__).parent
    parser.add_argument("--cache", type=pathlib.Path, default=here / ".cache")
    parser.add_argument(
        "--out",
        type=pathlib.Path,
        default=here.parent.parent / "src" / "game-data" / "weapons" / "generated",
    )
    args = parser.parse_args(argv)

    provenance = load(args.cache / "_provenance.json") or {}

    amber_files = sorted((args.cache / "amber").glob("*.json"), key=lambda p: int(p.stem))

    observations: list[curves.CurveObservation] = []
    payloads: list[tuple[str, dict, dict | None]] = []
    for path in amber_files:
        weapon_id = path.stem
        amber = load(path)
        if amber is None:
            continue
        lunaris = load(args.cache / "lunaris" / f"{weapon_id}.json")
        payloads.append((weapon_id, amber, lunaris))
        if lunaris is not None:
            observations.extend(
                curves.observations_for(weapon_id, amber.get("data") or {}, lunaris)
            )

    solution = curves.solve_curves(observations)

    weapons: list[dict] = []
    conflicts: list[str] = []
    skipped: list[tuple[str, str]] = []
    buckets: dict[str, int] = {
        perks.BUCKET_EXPRESSIBLE: 0,
        perks.BUCKET_UNIMPLEMENTED: 0,
        perks.BUCKET_UNVERIFIED: 0,
    }

    for weapon_id, amber, lunaris in payloads:
        weapon, weapon_conflicts, skip = build_weapon(
            weapon_id, amber, lunaris, solution
        )
        name = (amber.get("data") or {}).get("name", weapon_id)
        for conflict in weapon_conflicts:
            conflicts.append(f"{name}: {conflict}")
        if weapon is None:
            skipped.append((str(name), skip or "unknown"))
            continue
        weapons.append(weapon)
        if weapon["passive"]:
            for row in weapon["passive"]["refinements"]:
                buckets[row["bucket"]] += 1

    # Sorted by id so the output is byte-stable across runs.
    weapons.sort(key=lambda w: w["id"])

    args.out.mkdir(parents=True, exist_ok=True)
    for existing in args.out.glob("*.ts"):
        existing.unlink()

    header = HEADER.format(
        amber_endpoint="https://gi.yatta.moe/api/v2/en/weapon/{id}",
        lunaris_endpoint="https://api.lunaris.moe/data/{version}/en/weapon/{id}.json",
        lunaris_version=provenance.get("lunarisVersion", "unknown"),
        fetched_at=provenance.get("fetchedAt", "unknown"),
    )

    (args.out / "types.ts").write_text(header + TYPES_MODULE, encoding="utf-8")

    lines = [
        header,
        'import type { GeneratedWeapon } from "./types";',
        "",
        "export const generatedWeapons: readonly GeneratedWeapon[] = [",
    ]
    for weapon in weapons:
        lines.extend(emit_weapon(weapon))
    lines.append("];")
    lines.append("")
    lines.append(
        "export const generatedWeaponsById: ReadonlyMap<string, GeneratedWeapon> ="
    )
    lines.append("  new Map(generatedWeapons.map((weapon) => [weapon.id, weapon]));")
    lines.append("")
    (args.out / "weapons.ts").write_text("\n".join(lines), encoding="utf-8")

    (args.out / "index.ts").write_text(
        header
        + '\nexport * from "./types";\nexport * from "./weapons";\n',
        encoding="utf-8",
    )

    solved = sum(len(levels) for levels in solution.multipliers.values())
    print(f"emitted {len(weapons)} weapons to {args.out}")
    print(
        f"  growth curves: {len(solution.multipliers)} curves, {solved} per-level "
        f"multipliers recovered and replay-verified "
        f"({len(solution.conflicts)} conflicts)"
    )
    for conflict in solution.conflicts[:10]:
        print(f"  CURVE CONFLICT {conflict}")
    print(
        f"  passive refinements: expressible={buckets[perks.BUCKET_EXPRESSIBLE]} "
        f"unimplemented={buckets[perks.BUCKET_UNIMPLEMENTED]} "
        f"unverified={buckets[perks.BUCKET_UNVERIFIED]}"
    )
    print(f"  {len(conflicts)} passive source conflict(s)")
    for conflict in conflicts[:10]:
        print(f"  CONFLICT {conflict}")
    print(f"  skipped {len(skipped)} weapon(s)")
    for name, reason in skipped[:10]:
        print(f"    - {name}: {reason}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
