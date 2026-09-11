#!/usr/bin/env python3
"""
Stage 3 of the character-data generator: emit TypeScript character data.

Reads the cache written by `fetch.py`, parses it with `parse.py`, and writes
`src/game-data/characters/generated/*.ts`, one module per element plus a
barrel. Output is deterministic: every collection is emitted in sorted order
and no clock is read during emission (the fetch timestamp is carried in the
cache's provenance file), so re-running on an unchanged cache is byte-identical.

Only cross-verified values are emitted as executable data. An ability with a
missing verifier row or a conflicting value is withheld as a whole and listed
in the module's UNVERIFIED block with a TODO, so the gap is visible rather than
implied. Prose-only and other non-executable caveats remain reference metadata.

Usage:
    python3 scripts/generate-characters/emit.py [--cache DIR] [--out DIR]
"""

from __future__ import annotations

import argparse
import collections
import datetime
import json
import pathlib
import re

import curves
import parse
import perks

# --- Source vocabulary -> engine vocabulary --------------------------------
ELEMENT_BY_AMBER = {
    "Fire": "pyro",
    "Water": "hydro",
    "Electric": "electro",
    "Ice": "cryo",
    "Wind": "anemo",
    "Rock": "geo",
    "Grass": "dendro",
}

WEAPON_BY_AMBER = {
    "WEAPON_SWORD_ONE_HAND": "sword",
    "WEAPON_CLAYMORE": "claymore",
    "WEAPON_POLE": "polearm",
    "WEAPON_CATALYST": "catalyst",
    "WEAPON_BOW": "bow",
}

# Lunaris `ascensionStats` keys -> engine `AscensionStat` names.
ASCENSION_STAT_BY_LUNARIS = {
    "ATK%": "atkPercent",
    "HP%": "hpPercent",
    "DEF%": "defPercent",
    "EM": "elementalMastery",
    "CRIT Rate%": "critRate",
    "CRIT DMG%": "critDmg",
    "ER": "energyRecharge",
    "Healing%": "healingBonus",
    "Physical%": "physicalDmgBonus",
}

# Elemental ascension bonuses are keyed by element name, e.g. "Geo%".
ELEMENTAL_ASCENSION_STATS = {
    f"{amber_name.capitalize()}%": engine_name
    for amber_name, engine_name in (
        ("Pyro", "pyro"),
        ("Hydro", "hydro"),
        ("Electro", "electro"),
        ("Cryo", "cryo"),
        ("Anemo", "anemo"),
        ("Geo", "geo"),
        ("Dendro", "dendro"),
    )
}

# Keys in an attribute row that are not the ascension stat.
ATTRIBUTE_NON_STAT_KEYS = frozenset({"level", "ascension", "hp", "atk", "def"})

# Stats stored as percentages by Lunaris and as fractions by the engine.
PERCENT_ASCENSION_STATS = frozenset(
    {
        "atkPercent",
        "hpPercent",
        "defPercent",
        "critRate",
        "critDmg",
        "energyRecharge",
        "healingBonus",
        "physicalDmgBonus",
        "elementalDmgBonus",
    }
)

CHARACTER_LEVEL = 90
ASCENSION_PHASE = 6
ASCENSION_PHASE_COUNT = 7
CONSTELLATION_LEVEL = 0

# Default talent levels. 10 is the standard "crowned-adjacent" reference level
# and is the level every spot-check in the audit was quoted at.
DEFAULT_TALENT_LEVEL = 10

# Engine defaults for timing the source does not carry (see UNVERIFIED notes).
DEFAULT_NORMAL_CAST_TIME = 0.4
DEFAULT_CHARGED_CAST_TIME = 0.7
DEFAULT_PLUNGE_CAST_TIME = 0.6
DEFAULT_SKILL_CAST_TIME = 0.8
DEFAULT_BURST_CAST_TIME = 1.5

BASE_CRIT_RATE = 0.05
BASE_CRIT_DMG = 0.5
BASE_ENERGY_RECHARGE = 1.0

# Elemental gauge applied by skills and bursts absent a source value.
DEFAULT_SKILL_GAUGE = 1
DEFAULT_BURST_GAUGE = 2

SLOT_TO_DAMAGE_TYPE = {
    "normal": "normal",
    "charged": "charged",
    "plunge": "plunge",
    "skill": "skill",
    "burst": "burst",
}

# Amber ids for the two Traveler genders; every other character id is unique.
TRAVELER_MALE_ID = "10000005"
TRAVELER_FEMALE_ID = "10000007"

# The Traveler is ONE identity carrying a list of elemental forms (contract
# N10 / OQ-4): every emitted Traveler form shares this identity id, so the
# party duplicate-guard -- which keys on identity, not form -- rejects two
# Travelers even when they are in different elements or are different genders.
TRAVELER_IDENTITY = "traveler"

NORMAL_HIT_LABEL = re.compile(r"^(\d+)-Hit DMG$", re.IGNORECASE)


def ts_string(value: str) -> str:
    """Emit a TypeScript double-quoted string literal."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def ts_number(value: float) -> str:
    """
    Emit a number without float noise.

    `repr` on a value parsed from JSON round-trips exactly, so 0.8806 stays
    "0.8806" rather than becoming 0.8806000000000001.
    """
    if value == int(value):
        return str(int(value))
    return repr(value)


# ---------------------------------------------------------------------------
# Constellations & passives
# ---------------------------------------------------------------------------
#
# WHERE THE STRUCTURED DATA GOES, AND WHY IT IS NOT ON THE CHARACTER
#
# `ConstellationDefinition.effects` and `PassiveDefinition.effects` are typed
# `readonly StateEffect[]` -- a resource delta (`{resourceId, kind, amount}`)
# and nothing else. They CANNOT carry a `StatModifier`, a conversion, a RES
# shred, or a `BuffCondition`. Those types live in `src/simulation/**`, which
# this task does not own, so widening them is not on the table here.
#
# So the character definition receives the IDENTITY of every constellation and
# passive (level, name, unlock, empty state effects) plus executable Buffs for
# every unconditional structured row. The machine-readable EFFECTS table is
# also emitted alongside it in `perkEffects.ts`, a data-only module in
# `src/game-data`, so display and execution can be audited by id.
#
# THAT BLOCKER IS NOW CLEARED FOR EVERY STRUCTURED, UNCONDITIONAL EFFECT.
#
# combat-engineer added `buffs?: readonly Buff[]` to `PassiveDefinition` and
# `ConstellationDefinition` as a SIBLING of `effects` (not a widening of it),
# and mechanics-engineer landed the talent-level channel
# (`Buff.talentLevelModifiers: [{ slot, levels }]`). `TalentSlot` was defined to
# match the emitted `PerkTalentSlot`, so a parsed `talentLevelBoost` maps 1:1
# with NO translation table.
#
# Structured rows are emitted ON the character as buffs. The parser only puts
# unconditional rows in this bucket, so a permanent self-targeted buff is the
# narrowest safe representation for the current data. Conditional prose remains
# in `perkEffects.ts` with its honest bucket until the required trigger or
# resource lifecycle is available; it must never be promoted to an always-on
# effect merely because a number was present in the source text.

#: Bucket -> the TS union member recorded on every emitted perk row.
SUPPORT_BY_BUCKET = {
    perks.BUCKET_EXPRESSIBLE: "modelled",
    perks.BUCKET_UNIMPLEMENTED: "unimplemented",
    perks.BUCKET_UNVERIFIED: "unverified",
}


def emit_modifier(modifier: perks.ParsedModifier) -> str:
    parts = [
        f"stat: {ts_string(modifier.stat)}",
        f"value: {ts_number(modifier.value)}",
    ]
    if modifier.element is not None:
        parts.append(f"element: {ts_string(modifier.element)}")
    return "{ " + ", ".join(parts) + " }"


def emit_enemy_modifier(modifier: perks.ParsedEnemyModifier) -> str:
    parts = [
        f"key: {ts_string(modifier.key)}",
        f"value: {ts_number(modifier.value)}",
    ]
    if modifier.element is not None:
        parts.append(f"element: {ts_string(modifier.element)}")
    return "{ " + ", ".join(parts) + " }"


def emit_conversion(conversion: perks.ParsedConversion) -> str:
    parts = [
        f"sourceStat: {ts_string(conversion.source_stat)}",
        f"targetStat: {ts_string(conversion.target_stat)}",
        f"ratio: {ts_number(conversion.ratio)}",
    ]
    if conversion.max_cap is not None:
        parts.append(f"maxCap: {ts_number(conversion.max_cap)}")
    return "{ " + ", ".join(parts) + " }"


def emit_perk_effect(character_id: str, perk: perks.ParsedPerk, indent: str) -> list[str]:
    """One `GeneratedPerkEffect` object literal."""
    lines = [f"{indent}{{"]
    inner = indent + "  "
    lines.append(f"{inner}id: {ts_string(f'{character_id}-{perk.id_suffix}')},")
    lines.append(f"{inner}characterId: {ts_string(character_id)},")
    lines.append(f"{inner}kind: {ts_string(perk.kind)},")
    if perk.level is not None:
        lines.append(f"{inner}constellationLevel: {perk.level},")
    if perk.unlock_ascension is not None:
        lines.append(f"{inner}unlockAscension: {perk.unlock_ascension},")
    lines.append(f"{inner}name: {ts_string(perk.name)},")
    lines.append(f"{inner}support: {ts_string(SUPPORT_BY_BUCKET[perk.bucket])},")

    if perk.modifiers:
        rendered = ", ".join(emit_modifier(m) for m in perk.modifiers)
        lines.append(f"{inner}modifiers: [{rendered}],")
    if perk.conversions:
        rendered = ", ".join(emit_conversion(c) for c in perk.conversions)
        lines.append(f"{inner}conversions: [{rendered}],")
    if perk.enemy_modifiers:
        rendered = ", ".join(emit_enemy_modifier(e) for e in perk.enemy_modifiers)
        lines.append(f"{inner}enemyModifiers: [{rendered}],")
    if perk.damage_types:
        rendered = ", ".join(ts_string(d) for d in perk.damage_types)
        lines.append(f"{inner}damageTypes: [{rendered}],")
    if perk.talent_level_boost is not None:
        slot, amount = perk.talent_level_boost
        lines.append(
            f"{inner}talentLevelBoost: {{ slot: {ts_string(slot)}, "
            f"levels: {amount} }},"
        )
    if perk.reason is not None:
        lines.append(f"{inner}reason: {ts_string(perk.reason)},")
    lines.append(f"{inner}text: {ts_string(perk.text)},")
    lines.append(f"{indent}}},")
    return lines


# A constellation/passive talent-level boost is UNCONDITIONAL and PERMANENT: it
# is a property of owning the constellation, not of an in-combat window. So the
# buff is authored with the widest window and no gate, and the constellation
# gate itself is applied by `activeConstellations()` / `unlockedPassives()`,
# which already filter by `constellationLevel` / `ascensionPhase`.
BUFF_PERMANENT_START = 0
BUFF_PERMANENT_DURATION = "Number.POSITIVE_INFINITY"
# `refresh` rather than `stack`: a constellation is owned once, so two
# applications of the same id must not compound. `stack` would additionally
# require a `maxStacks` neither source publishes.
BUFF_STACKING_REFRESH = '{ mode: "refresh" }'
# `self`: these unconditional perk effects belong to the character that owns
# them. Scope `self` requires `sourceCharacterId`, which is emitted alongside.
BUFF_TARGETS_SELF = '{ scope: "self" }'


def emit_structured_perk_buff(
    character_id: str, perk: perks.ParsedPerk
) -> str | None:
    """Emit one executable Buff for an unconditional structured perk row.

    The parser's ``expressible`` bucket is deliberately conservative: every
    row here has a complete, unconditional effect that the Buff vocabulary can
    represent.  Keep the conversion in the generator so generated character
    definitions, the generated effect index, and the runtime harvester cannot
    drift apart.  Rows without a structured payload (which should only be
    talent-level rows after the old path is removed) return ``None``.
    """
    if perk.bucket != perks.BUCKET_EXPRESSIBLE:
        return None
    if not (
        perk.modifiers
        or perk.conversions
        or perk.enemy_modifiers
        or perk.talent_level_boost
    ):
        return None

    buff_id = f"{character_id}-{perk.id_suffix}"
    parts = [
        f"id: {ts_string(buff_id)}",
        f"source: {ts_string(perk.name)}",
        f"sourceCharacterId: {ts_string(character_id)}",
        f"startTime: {BUFF_PERMANENT_START}",
        f"duration: {BUFF_PERMANENT_DURATION}",
        f"stacking: {BUFF_STACKING_REFRESH}",
        f"targets: {BUFF_TARGETS_SELF}",
    ]

    # Talent-level boosts are selected by their talent slot, not by the
    # damage type of an individual hit. The normal-attack talent also owns
    # charged and plunging multipliers, so scoping a normal boost to
    # `damageTypes: ["normal"]` would silently drop it from those rows.
    if perk.damage_types and perk.talent_level_boost is None:
        rendered = ", ".join(ts_string(d) for d in perk.damage_types)
        parts.append(f"conditions: {{ damageTypes: [{rendered}] }}")
    if perk.modifiers:
        rendered = ", ".join(emit_modifier(m) for m in perk.modifiers)
        parts.append(f"modifiers: [{rendered}]")
    if perk.conversions:
        rendered = ", ".join(emit_conversion(c) for c in perk.conversions)
        parts.append(f"conversions: [{rendered}]")
    if perk.enemy_modifiers:
        rendered = ", ".join(emit_enemy_modifier(e) for e in perk.enemy_modifiers)
        parts.append(f"enemyModifiers: [{rendered}]")
    if perk.talent_level_boost:
        slot, levels = perk.talent_level_boost
        parts.append(
            "talentLevelModifiers: [{ slot: "
            f"{ts_string(slot)}, levels: {levels} }}]"
        )
    return "{ " + ", ".join(parts) + " }"


def emit_perk_identities(character_id: str, rows: list[perks.ParsedPerk]) -> list[str]:
    """
    The `passives` / `constellations` arrays ON the character definition.

    `effects` stays `[]`: its type admits only `StateEffect` (a resource delta),
    and every effect recovered here is a stat / conversion / shred / talent-level
    boost, none of which is one. Emitting a fabricated `StateEffect` to make the
    array look populated is exactly the plausible-but-wrong data this generator
    exists to prevent.

    `buffs` is populated for every unconditional structured row -- stat
    modifiers, conversions, enemy modifiers, and talent-level boosts. The key
    is OMITTED, never emitted as
    `[]`, when a perk has no such boost, matching how the buff bag is treated
    elsewhere (an empty bag and an absent one must not hash differently).
    """
    lines: list[str] = []

    passives = [row for row in rows if row.kind == "passive"]
    if not passives:
        lines.append("  passives: [],")
    else:
        lines.append("  passives: [")
        for row in passives:
            parts = [
                f"id: {ts_string(f'{character_id}-{row.id_suffix}')}",
                f"name: {ts_string(row.name)}",
            ]
            if row.unlock_ascension is not None:
                parts.append(f"unlockAscension: {row.unlock_ascension}")
            parts.append("effects: []")
            buff = emit_structured_perk_buff(character_id, row)
            if buff is not None:
                parts.append(f"buffs: [{buff}]")
            lines.append("    { " + ", ".join(parts) + " },")
        lines.append("  ],")

    constellations = sorted(
        (row for row in rows if row.kind == "constellation"),
        key=lambda row: row.level or 0,
    )
    if not constellations:
        lines.append("  constellations: [],")
    else:
        lines.append("  constellations: [")
        for row in constellations:
            parts = [
                f"level: {row.level}",
                f"id: {ts_string(f'{character_id}-{row.id_suffix}')}",
                f"name: {ts_string(row.name)}",
                "effects: []",
            ]
            buff = emit_structured_perk_buff(character_id, row)
            if buff is not None:
                parts.append(f"buffs: [{buff}]")
            lines.append("    { " + ", ".join(parts) + " },")
        lines.append("  ],")

    return lines


def release_date_for(data: dict) -> str | None:
    """
    Release date as `YYYY-MM-DD`, from the source's own `release` timestamp.

    The date is DERIVED, never authored: hand-keeping a release table is what
    left renamed characters ("raiden-shogun" vs "raiden") without one. Returns
    None when the source publishes no timestamp, so the gap is reported rather
    than defaulted to a date that would silently reorder the roster.
    """
    stamp = data.get("release")
    if not isinstance(stamp, (int, float)) or stamp <= 0:
        return None
    moment = datetime.datetime.fromtimestamp(float(stamp), datetime.timezone.utc)
    return moment.strftime("%Y-%m-%d")


def identifier_for(name: str) -> str:
    """A stable, valid TS identifier derived from a character name."""
    cleaned = re.sub(r"[^0-9A-Za-z]+", " ", name).strip()
    parts = cleaned.split()
    if not parts:
        return "character"
    head, *rest = parts
    identifier = head.lower() + "".join(word.capitalize() for word in rest)
    if identifier[0].isdigit():
        identifier = f"c{identifier}"
    return identifier


def slug_for(name: str) -> str:
    """A stable kebab-case id, matching the existing roster's id style."""
    return re.sub(r"[^0-9a-z]+", "-", name.lower()).strip("-")


def emit_table(table: tuple[float, ...]) -> str:
    return "talentTable([" + ", ".join(ts_number(v) for v in table) + "])"


def emit_scaling(terms: tuple[parse.ScalingTerm, ...], indent: str) -> str:
    lines = []
    for term in terms:
        lines.append(
            f"{indent}  {{ stat: {ts_string(term.stat)}, "
            f"table: {emit_table(term.table)} }},"
        )
    return "[\n" + "\n".join(lines) + f"\n{indent}]"


def emit_instance(
    instance: parse.DamageInstance,
    ability_id: str,
    index: int,
    element: str,
    damage_type: str,
    physical: bool,
    indent: str,
) -> list[str]:
    """
    Emit one damage instance, repeated `repeat` times.

    A "×3" row is three separate instances rather than one tripled multiplier:
    each lands independently in game, so each must be able to crit, react and
    carry its own ICD separately.
    """
    out: list[str] = []
    for repetition in range(instance.repeat):
        suffix = f"-{repetition + 1}" if instance.repeat > 1 else ""
        label = (
            f"{instance.label} ({repetition + 1}/{instance.repeat})"
            if instance.repeat > 1
            else instance.label
        )
        out.append(f"{indent}{{")
        out.append(f"{indent}  id: {ts_string(f'{ability_id}-{index}{suffix}')},")
        out.append(f"{indent}  name: {ts_string(label)},")
        out.append(f"{indent}  damageType: {ts_string(damage_type)},")
        out.append(
            f"{indent}  element: {ts_string('physical' if physical else element)},"
        )
        out.append(f"{indent}  scaling: {emit_scaling(instance.terms, indent + '  ')},")
        if not physical:
            gauge = (
                DEFAULT_BURST_GAUGE if damage_type == "burst" else DEFAULT_SKILL_GAUGE
            )
            out.append(
                f"{indent}  application: {{ element: {ts_string(element)}, "
                f"gauge: {gauge} }},"
            )
        out.append(f"{indent}}},")
    return out


def level_90_attributes(info: dict) -> dict:
    """
    The fully-ascended level-90 stat row from Lunaris' base-stat curve.

    A character appears at level 90 twice -- once at ascension 5 and once at 6 --
    so the ascension phase must be matched too, otherwise the un-ascended row
    (which lacks the ascension stat) wins.
    """
    for entry in info.get("attributes") or []:
        if not isinstance(entry, dict):
            continue
        if entry.get("level") == CHARACTER_LEVEL and (
            entry.get("ascension") == ASCENSION_PHASE
        ):
            return entry
    return {}


def burst_talent_for(amber: dict) -> dict | None:
    """The raw burst talent, needed when it has no damage rows of its own."""
    for key in sorted(amber["data"].get("talent", {}), key=int):
        talent = amber["data"]["talent"][key]
        if talent.get("type") == parse.TALENT_TYPE_BURST and talent.get("promote"):
            return talent
    return None


def group_abilities(
    abilities: list[parse.ParsedAbility],
) -> dict[str, list[parse.ParsedAbility]]:
    grouped: dict[str, list[parse.ParsedAbility]] = {}
    for ability in abilities:
        grouped.setdefault(ability.slot, []).append(ability)
    return grouped


def normal_string_instances(
    abilities: list[parse.ParsedAbility],
) -> list[tuple[int, parse.DamageInstance]]:
    """
    Order the normal-attack string by its "N-Hit DMG" labels.

    Rows that are part of the numbered combo become N1..Nx in order; extra
    damage rows in the same talent (Ganyu's Frostflake Arrow, Yelan's
    Breakthrough Barb) are NOT combo steps and are returned with index -1 so
    the caller can keep them out of the string.
    """
    ordered: list[tuple[int, parse.DamageInstance]] = []
    for ability in abilities:
        for instance in ability.instances:
            match = NORMAL_HIT_LABEL.match(instance.source_label.strip())
            ordered.append((int(match.group(1)) if match else -1, instance))
    ordered.sort(key=lambda pair: (pair[0] < 0, pair[0]))

    # A catalyst user with a single unnumbered "Normal Attack DMG" row (e.g.
    # Ningguang) has a one-hit string rather than no string at all.
    if not any(index > 0 for index, _ in ordered):
        for position, (index, instance) in enumerate(ordered):
            if instance.source_label.strip().lower() == "normal attack dmg":
                ordered[position] = (1, instance)
                break

    return ordered


def emit_ability(
    *,
    ability_id: str,
    name: str,
    slot: str,
    instances: list[parse.DamageInstance],
    element: str,
    physical: bool,
    cast_time: float,
    cooldown: float | None,
    energy_cost: int | None,
    particles: float | None,
    indent: str,
) -> list[str]:
    damage_type = SLOT_TO_DAMAGE_TYPE[
        "plunge" if slot.startswith("plunge") else slot
    ]
    lines = [f"{indent}{{"]
    lines.append(f"{indent}  id: {ts_string(ability_id)},")
    lines.append(f"{indent}  name: {ts_string(name)},")
    lines.append(f"{indent}  slot: {ts_string(slot)},")
    lines.append(f"{indent}  castTime: {ts_number(cast_time)},")
    lines.append(
        f"{indent}  cooldown: flatTalent({ts_number(cooldown or 0)}),"
    )
    lines.append(f"{indent}  energyCost: {ts_number(energy_cost or 0)},")
    if particles:
        lines.append(
            f"{indent}  particles: {{ count: {ts_number(particles)}, "
            f"element: {ts_string(element)} }},"
        )
    lines.append(f"{indent}  instances: [")
    for index, instance in enumerate(instances, start=1):
        lines.extend(
            emit_instance(
                instance,
                ability_id,
                index,
                element,
                damage_type,
                physical,
                indent + "    ",
            )
        )
    lines.append(f"{indent}  ],")
    lines.append(f"{indent}}}")
    return lines


def lunaris_particles(lunaris: dict) -> float | None:
    """
    Skill particle count, which Amber does not expose.

    Lunaris lists one entry per particle-generating event; the engine models a
    single per-cast yield, so the entries are summed. Returns None when the
    character generates none (or the field is shaped unexpectedly), which the
    caller records as UNVERIFIED rather than defaulting to a guess.
    """
    entries = lunaris.get("energy")
    if not isinstance(entries, list) or not entries:
        return None
    total = 0.0
    for entry in entries:
        if not isinstance(entry, dict):
            return None
        raw = str(entry.get("particles", "")).strip()
        try:
            total += float(raw)
        except ValueError:
            return None
    return total or None


def withhold_unverified_abilities(
    abilities: list[parse.ParsedAbility],
    reference: dict[str, dict[str, list[list[float]]]],
) -> tuple[list[parse.ParsedAbility], list[tuple[str, str]], int, int]:
    """Remove abilities whose executable multipliers are not corroborated.

    Verification is a publication boundary, rather than a logging-only check.
    An ability is retained only when every emitted instance has a verifier row
    and every compared value agrees within the source rounding tolerance.  The
    whole ability is withheld when one instance is uncertain: emitting the
    remaining terms would make a partial kit look verified and would make the
    impact depend on parser ordering.
    """
    retained: list[parse.ParsedAbility] = []
    notes: list[tuple[str, str]] = []
    checked = 0
    agreed = 0
    for ability in abilities:
        ability_checked, ability_agreed, verification_notes = parse.verify_ability(
            ability, reference
        )
        checked += ability_checked
        agreed += ability_agreed
        if verification_notes:
            coordinate = f"{ability.slot}.instances"
            reason = "verifier evidence missing or conflicting: " + "; ".join(
                sorted(set(verification_notes))
            )
            notes.append((coordinate, reason))
            continue
        retained.append(ability)
    return retained, notes, checked, agreed


def build_character_source(
    *,
    amber_id: str,
    amber: dict,
    lunaris: dict,
    abilities: list[parse.ParsedAbility],
    unmatched: list[tuple[str, str]],
    perk_rows: list[perks.ParsedPerk],
    curve_solution: curves.CurveSolution,
) -> tuple[str, str, str, list[tuple[str, str]], dict] | None:
    """
    Emit one character as a TypeScript const.

    Returns (element, identifier, source, unverified_notes, metadata), or None
    when the character cannot be modelled at all (missing element, no skill, no
    burst). `metadata` carries the sourced roster facts (identity, form label,
    release date) that the registry needs but that are not part of the combat
    definition itself.
    """
    data = amber["data"]
    name = data["name"]
    amber_element = data.get("element")
    element = ELEMENT_BY_AMBER.get(amber_element or "")
    weapon = WEAPON_BY_AMBER.get(data.get("weaponType") or "")
    if element is None or weapon is None:
        return None

    grouped = group_abilities(abilities)
    if "skill" not in grouped:
        return None

    # Every note is a (FIELD, REASON) pair, not a sentence. The field is the
    # dotted path of the value the caveat applies to, so a UI can key its
    # honesty markers off the same value it is about to render -- a `//`
    # comment cannot be read from TypeScript, which is why this is structured.
    notes: list[tuple[str, str]] = list(unmatched)
    # Traveler ships as one name across two genders and seven elements, so the
    # name alone is not unique. The source id ("10000005-anemo" vs
    # "10000007-anemo") is what actually distinguishes them, and it is stable
    # across patches, so it qualifies the id and identifier for those forms.
    char_id = slug_for(name)
    identifier = identifier_for(name)
    # Ordinary characters are their own identity, with a single form.
    identity_id = char_id
    form_label = name
    if "-" in amber_id:
        base, _, form_element = amber_id.partition("-")
        gender = "traveler-m" if base == TRAVELER_MALE_ID else "traveler-f"
        char_id = f"{gender}-{form_element}"
        identifier = identifier_for(f"{gender} {form_element}")
        # All 14 forms collapse to ONE identity. The form still carries its own
        # element and its own abilities -- it is only the duplicate-guard key
        # that is shared.
        identity_id = TRAVELER_IDENTITY
        gender_label = "Aether" if base == TRAVELER_MALE_ID else "Lumine"
        form_label = f"{gender_label} ({form_element.capitalize()})"
    # Catalyst normal attacks are elemental; every other weapon deals physical.
    physical_normals = weapon != "catalyst"

    info = lunaris.get("info") or {}
    # Amber states rarity as a numeric `rank`; Lunaris encodes it as a quality
    # enum ("QUALITY_PURPLE"), so the numeric field is the one used.
    rarity = 5 if data.get("rank") == 5 else 4
    # Lunaris publishes a full base-stat curve per character; the level-90 /
    # ascension-6 row carries base HP/ATK/DEF and the single ascension stat.
    stats = level_90_attributes(info)

    # --- base stats ------------------------------------------------------
    base_hp = float(stats.get("hp", 0))
    base_atk = float(stats.get("atk", 0))
    base_def = float(stats.get("def", 0))
    if not (base_hp and base_atk and base_def):
        notes.append(("baseStats", "base HP/ATK/DEF missing from source"))

    ascension_stat = "atkPercent"
    ascension_value = 0.0
    ascension_element: str | None = None
    for key, value in sorted(stats.items()):
        if key in ATTRIBUTE_NON_STAT_KEYS:
            continue
        try:
            numeric = float(str(value))
        except ValueError:
            continue
        if key in ELEMENTAL_ASCENSION_STATS:
            ascension_stat = "elementalDmgBonus"
            ascension_element = ELEMENTAL_ASCENSION_STATS[key]
            ascension_value = numeric / 100.0
            break
        mapped = ASCENSION_STAT_BY_LUNARIS.get(key)
        if mapped:
            ascension_stat = mapped
            ascension_value = (
                numeric / 100.0 if mapped in PERCENT_ASCENSION_STATS else numeric
            )
            break
    else:
        if stats:
            notes.append(
                (
                    "ascensionBonus.stat",
                    "no ascension stat published by the verifier source",
                )
            )

    # --- energy ----------------------------------------------------------
    # A burst that deals no damage is a real kit (Barbara heals, Xiao and
    # Nahida only buff), not a parse failure: the source lists no DMG row for
    # it. Such a burst is emitted with its true cooldown and cost but zero
    # damage instances, and the support gap is recorded as UNVERIFIED.
    burst_talent = burst_talent_for(amber)
    if grouped.get("burst"):
        # Prefer the parsed ability's cost, but fall back to the burst talent:
        # a few kits (Mavuika, Skirk) carry damage rows on a talent whose own
        # `cost` field is 0, with the real cost on the burst talent itself.
        max_energy = grouped["burst"][0].energy_cost or (
            (burst_talent or {}).get("cost") or 0
        )
    elif burst_talent is not None:
        max_energy = burst_talent.get("cost") or 0
        notes.append(
            (
                "burst.instances",
                "burst deals no damage in the source (support/heal burst); "
                "emitted with zero damage instances",
            )
        )
    else:
        max_energy = 0
    if not max_energy:
        notes.append(("burst.energyCost", "burst energy cost missing from source"))
    particles = lunaris_particles(lunaris) if lunaris else None
    if particles is None:
        notes.append(
            ("skill.particles", "skill particle yield not published by either source")
        )

    lines: list[str] = []
    lines.append(f"export const {identifier}: GeneratedCharacter = {{")
    lines.append(f"  id: {ts_string(char_id)},")
    lines.append(f"  name: {ts_string(name)},")
    lines.append(f"  element: {ts_string(element)},")
    lines.append(f"  weaponType: {ts_string(weapon)},")
    lines.append(f"  rarity: {rarity},")
    lines.append(f"  level: {CHARACTER_LEVEL},")
    lines.append(f"  ascensionPhase: {ASCENSION_PHASE},")
    lines.append(f"  constellationLevel: {CONSTELLATION_LEVEL},")
    lines.append(
        f"  talentLevels: {{ normal: {DEFAULT_TALENT_LEVEL}, "
        f"skill: {DEFAULT_TALENT_LEVEL}, burst: {DEFAULT_TALENT_LEVEL} }},"
    )
    # --- base-stat curves ------------------------------------------------
    # The full level 1..90 curve, recovered by `curves.py` from Amber's own
    # coefficients and proved against every integer Lunaris publishes. Before
    # this, the field held a single `{ [90]: value }` entry -- a point wearing
    # a curve's type -- so any level selector reading it would have returned
    # the level-90 number at level 20 and shown it as a level-20 number.
    #
    # A character whose curve could not be recovered keeps the single sourced
    # level-90 point and says so in `unverified`, so the limitation is
    # readable from TypeScript rather than being invisible.
    character_curve = curves.curve_for_character(data, curve_solution)
    lines.append("  baseStatCurves: {")
    if character_curve is None:
        notes.append(
            (
                "baseStatCurves",
                "per-level curve not recoverable from the sources; only the "
                "level-90 point is sourced, so this character's base stats "
                "must not be read at any other level",
            )
        )
        for stat_name, value in (
            ("hp", base_hp),
            ("atk", base_atk),
            ("def", base_def),
        ):
            lines.append(
                f"    {stat_name}: {{ byLevel: {{ {CHARACTER_LEVEL}: "
                f"{ts_number(value)} }} }},"
            )
    else:
        for stat_name in ("hp", "atk", "def"):
            by_level = character_curve[stat_name]
            pairs = ", ".join(
                f"{level}: {ts_number(by_level[level])}"
                for level in sorted(by_level)
            )
            lines.append(f"    {stat_name}: {{ byLevel: {{ {pairs} }} }},")
    lines.append("  },")

    phases = ["0"] * ASCENSION_PHASE_COUNT
    phases[ASCENSION_PHASE] = ts_number(ascension_value)
    lines.append("  ascensionBonus: {")
    lines.append(f"    stat: {ts_string(ascension_stat)},")
    lines.append(f"    valueByPhase: [{', '.join(phases)}],")
    if ascension_element:
        lines.append(f"    element: {ts_string(ascension_element)},")
    lines.append("  },")

    lines.append("  baseStats: {")
    lines.append(f"    atk: {ts_number(base_atk)},")
    lines.append(f"    hp: {ts_number(base_hp)},")
    lines.append(f"    def: {ts_number(base_def)},")
    lines.append(
        "    elementalMastery: "
        + ts_number(ascension_value if ascension_stat == "elementalMastery" else 0)
        + ","
    )
    lines.append(
        "    critRate: "
        + ts_number(
            BASE_CRIT_RATE + (ascension_value if ascension_stat == "critRate" else 0)
        )
        + ","
    )
    lines.append(
        "    critDmg: "
        + ts_number(
            BASE_CRIT_DMG + (ascension_value if ascension_stat == "critDmg" else 0)
        )
        + ","
    )
    lines.append(
        "    energyRecharge: "
        + ts_number(
            BASE_ENERGY_RECHARGE
            + (ascension_value if ascension_stat == "energyRecharge" else 0)
        )
        + ","
    )
    lines.append("    dmgBonus: 0,")
    if ascension_stat == "elementalDmgBonus" and ascension_element:
        lines.append(
            f"    elementalDmgBonus: {{ {ascension_element}: "
            f"{ts_number(ascension_value)} }},"
        )
    else:
        lines.append("    elementalDmgBonus: {},")
    lines.append("  },")
    lines.append(f"  maxEnergy: {ts_number(max_energy)},")

    # --- normal attack string -------------------------------------------
    combo = [
        (index, instance)
        for index, instance in normal_string_instances(grouped.get("normal", []))
        if index > 0
    ]
    extras = [
        instance
        for index, instance in normal_string_instances(grouped.get("normal", []))
        if index < 0
    ]
    normal_talent_name = (
        grouped.get("normal", [None])[0].name if grouped.get("normal") else "Normal Attack"
    )
    lines.append("  normalAttacks: {")
    lines.append("    hits: [")
    for order, (_, instance) in enumerate(combo, start=1):
        lines.extend(
            emit_ability(
                ability_id=f"{char_id}-na-{order}",
                name=instance.label,
                slot="normal",
                instances=[instance],
                element=element,
                physical=physical_normals,
                cast_time=DEFAULT_NORMAL_CAST_TIME,
                cooldown=0,
                energy_cost=0,
                particles=None,
                indent="      ",
            )
        )
        lines[-1] += ","
    lines.append("    ],")
    lines.append("    loops: true,")
    lines.append("  },")
    if not combo:
        notes.append(
            ("normalAttacks.hits", "no numbered normal-attack combo rows found")
        )

    # --- single-ability slots -------------------------------------------
    def emit_slot(key: str, field: str, slot: str, cast_time: float) -> None:
        entries = grouped.get(key, [])
        if not entries:
            return
        instances = [i for ability in entries for i in ability.instances]
        ability = entries[0]
        lines.append(f"  {field}:")
        body = emit_ability(
            ability_id=f"{char_id}-{slot}",
            name=ability.name,
            slot=slot,
            instances=instances,
            element=element,
            physical=physical_normals and slot in ("charged", "plungeLow", "plungeHigh"),
            cast_time=cast_time,
            cooldown=ability.cooldown,
            energy_cost=ability.energy_cost if slot == "burst" else 0,
            particles=particles if slot == "skill" else None,
            indent="    ",
        )
        lines.extend(body)
        lines[-1] += ","

    emit_slot("charged", "chargedAttack", "charged", DEFAULT_CHARGED_CAST_TIME)

    # Plunge rows are labelled Low/High; both share one talent.
    plunge_entries = grouped.get("plunge", [])
    plunge_instances = [i for a in plunge_entries for i in a.instances]
    for field, slot, needle in (
        ("plungeLow", "plungeLow", "low"),
        ("plungeHigh", "plungeHigh", "high"),
    ):
        matching = [
            i for i in plunge_instances if needle in i.label.lower()
        ]
        if not matching:
            continue
        lines.append(f"  {field}:")
        lines.extend(
            emit_ability(
                ability_id=f"{char_id}-{slot}",
                name=matching[0].label,
                slot=slot,
                instances=matching,
                element=element,
                physical=physical_normals,
                cast_time=DEFAULT_PLUNGE_CAST_TIME,
                cooldown=0,
                energy_cost=0,
                particles=None,
                indent="    ",
            )
        )
        lines[-1] += ","

    emit_slot("skill", "skill", "skill", DEFAULT_SKILL_CAST_TIME)
    if grouped.get("burst"):
        emit_slot("burst", "burst", "burst", DEFAULT_BURST_CAST_TIME)
    elif burst_talent is not None:
        lines.append("  burst:")
        lines.extend(
            emit_ability(
                ability_id=f"{char_id}-burst",
                name=burst_talent["name"],
                slot="burst",
                instances=[],
                element=element,
                physical=False,
                cast_time=DEFAULT_BURST_CAST_TIME,
                cooldown=burst_talent.get("cooldown"),
                energy_cost=max_energy,
                particles=None,
                indent="    ",
            )
        )
        lines[-1] += ","

    lines.extend(emit_perk_identities(char_id, perk_rows))
    # `resources` stays empty: a stack/stance pool must be DECLARED with an
    # initial value and a cap, and neither source publishes either. Every
    # candidate is described only in prose ("gains 1 stack, max 4"), and the
    # stack ceiling is exactly the sort of number the audit found invented.
    # Reported rather than guessed -- see the UNVERIFIED block.
    lines.append("  resources: [],")
    lines.append("};")

    # Timing is not published by either datamined source.
    notes.append(("castTime", "cast times are engine defaults, not sourced"))

    # Constellation / passive honesty notes. Counts, not adjectives: a reader
    # can see at a glance how much of this character's kit is actually modelled.
    modelled = sum(1 for row in perk_rows if row.bucket == perks.BUCKET_EXPRESSIBLE)
    unimplemented = sum(
        1 for row in perk_rows if row.bucket == perks.BUCKET_UNIMPLEMENTED
    )
    unverified = sum(1 for row in perk_rows if row.bucket == perks.BUCKET_UNVERIFIED)
    if perk_rows:
        notes.append(
            (
                "constellations",
                f"{modelled} modelled, {unimplemented} unimplemented (numbers "
                f"emitted, no buff channel), {unverified} unverified (text "
                f"only) -- see perkEffects.ts",
            )
        )
    notes.append(
        (
            "resources",
            "stacks/stances are not declared: neither source publishes an "
            "initial value or a cap for them",
        )
    )

    release_date = release_date_for(data)
    if release_date is None:
        notes.append(
            ("releaseDate", "release date not published by the primary source")
        )

    metadata = {
        "characterId": char_id,
        "identityId": identity_id,
        "name": name,
        "formLabel": form_label,
        "element": element,
        "releaseDate": release_date,
    }

    return element, identifier, "\n".join(lines), notes, metadata


HEADER_TEMPLATE = """// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-characters/fetch.py
//     python3 scripts/generate-characters/emit.py
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    {amber_endpoint}
//   Verifier source  Lunaris {lunaris_version}
//                    {lunaris_endpoint}
//   Fetched at       {fetched_at}
//
// Every multiplier below is a PER-TALENT-LEVEL table (levels 1..15) taken from
// the primary source and cross-checked value-by-value against the verifier.
// Values the two sources disagreed on are NOT emitted; rows the verifier does
// not publish are flagged in the UNVERIFIED block of the character concerned.
//
// Scaling stats (ATK / Max HP / DEF / Elemental Mastery) are read from the
// source's own parameter descriptions, so an HP-scaling skill is authored as
// HP-scaling rather than being folded into ATK.
// ============================================================================

import type {{ GenericCharacterDefinition }} from "@/simulation/character/character";
import {{ flatTalent, talentTable }} from "@/simulation/character/talent";

type GeneratedCharacter = GenericCharacterDefinition;
"""


def write_element_module(
    path: pathlib.Path,
    element: str,
    entries: list[tuple[str, str, list[tuple[str, str]]]],
    provenance: dict,
) -> None:
    header = HEADER_TEMPLATE.format(
        amber_endpoint="https://gi.yatta.moe/api/v2/en/avatar/{id}",
        lunaris_endpoint="https://api.lunaris.moe/data/{version}/en/char/{id}.json",
        lunaris_version=provenance.get("lunarisVersion", "unknown"),
        fetched_at=provenance.get("fetchedAt", "unknown"),
    )

    body: list[str] = [header]
    unverified_lines: list[str] = []
    for identifier, source, notes in entries:
        body.append("")
        body.append(source)
        for field, reason in notes:
            unverified_lines.append(f"//   {identifier}.{field}: {reason}")

    if unverified_lines:
        body.append("")
        body.append("// ---------------------------------------------------------------------------")
        body.append("// UNVERIFIED -- the sources do not publish these; nothing here was guessed.")
        body.append("// TODO: source each item below, or model it explicitly as unsupported.")
        body.extend(sorted(set(unverified_lines)))
        body.append("// ---------------------------------------------------------------------------")

    identifiers = sorted(identifier for identifier, _, _ in entries)
    body.append("")
    body.append(
        f"export const {element}GeneratedCharacters: readonly GeneratedCharacter[] = ["
    )
    for identifier in identifiers:
        body.append(f"  {identifier},")
    body.append("];")
    body.append("")

    path.write_text("\n".join(body), encoding="utf-8")


def write_metadata_module(
    path: pathlib.Path, metadata: list[dict], provenance: dict
) -> None:
    """
    Emit the sourced roster facts that are not part of a combat definition.

    Kept in its own module because `GenericCharacterDefinition` is the combat
    engine's type and is not this generator's to extend. The registry joins the
    two by character id.
    """
    lines = [
        "// ============================================================================",
        "// GENERATED FILE -- DO NOT EDIT BY HAND.",
        "//",
        "// Roster metadata: identity, form label and release date for every generated",
        "// character. Every field is derived from the primary source -- the release",
        "// date from its own `release` timestamp -- so a renamed character can never",
        "// silently lose its ordering the way a hand-kept table allowed.",
        "//",
        "// The Traveler's forms all share one `identityId`, which is the key the party",
        "// duplicate-guard compares. See `isSameCharacter` in `src/types`.",
        "//",
        f"//   Verifier data version  {provenance.get('lunarisVersion', 'unknown')}",
        f"//   Fetched at             {provenance.get('fetchedAt', 'unknown')}",
        "// ============================================================================",
        "",
        "/** Sourced roster facts for one generated character form. */",
        "export interface GeneratedCharacterMeta {",
        "  /** Id of the combat definition this describes. */",
        "  readonly characterId: string;",
        "  /**",
        "   * Identity key. Equal to `characterId` for an ordinary character; shared by",
        "   * every Traveler form so two Travelers cannot enter one party.",
        "   */",
        "  readonly identityId: string;",
        "  /** Display name of the IDENTITY (the Traveler is never renamed per element). */",
        "  readonly name: string;",
        "  /** Label for this form alone. */",
        "  readonly formLabel: string;",
        "  readonly element: string;",
        "  /** `YYYY-MM-DD`, or undefined when the source publishes no timestamp. */",
        "  readonly releaseDate?: string;",
        "}",
        "",
        "export const generatedCharacterMeta: readonly GeneratedCharacterMeta[] = [",
    ]
    for entry in sorted(metadata, key=lambda item: item["characterId"]):
        fields = [
            f"characterId: {ts_string(entry['characterId'])}",
            f"identityId: {ts_string(entry['identityId'])}",
            f"name: {ts_string(entry['name'])}",
            f"formLabel: {ts_string(entry['formLabel'])}",
            f"element: {ts_string(entry['element'])}",
        ]
        if entry["releaseDate"] is not None:
            fields.append(f"releaseDate: {ts_string(entry['releaseDate'])}")
        lines.append(f"  {{ {', '.join(fields)} }},")
    lines.append("];")
    lines.append("")
    lines.append(
        "export const generatedCharacterMetaById: "
        "ReadonlyMap<string, GeneratedCharacterMeta> ="
    )
    lines.append(
        "  new Map(generatedCharacterMeta.map((meta) => [meta.characterId, meta]));"
    )
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


PERK_EFFECTS_HEADER = """// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-characters/fetch.py
//     python3 scripts/generate-characters/emit.py
//
// CONSTELLATION & PASSIVE EFFECTS -- with an HONEST support flag per row.
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    {amber_endpoint}
//   Verifier source  Lunaris {lunaris_version}
//                    {lunaris_endpoint}
//   Fetched at       {fetched_at}
//
// WHY THIS MODULE EXISTS SEPARATELY FROM THE CHARACTER DEFINITIONS
// `ConstellationDefinition.effects` and `PassiveDefinition.effects` are typed
// `readonly StateEffect[]` -- a resource delta and nothing else. They cannot
// carry a stat modifier, a conversion, a RES shred or a condition. Those types
// live in `src/simulation/**`, which the data layer does not own. So the
// character definitions carry each perk's IDENTITY and this module carries its
// EFFECTS, joined by `id`.
//
// WHAT `support` MEANS -- read this before using any row
//
//   "modelled"       The effect maps onto the existing `Buff` vocabulary with
//                    no invented mechanism. `modifiers` / `conversions` /
//                    `enemyModifiers` are usable as-is, subject to
//                    `damageTypes` when present.
//
//   "unimplemented"  The numbers are unambiguous but the buff vocabulary has
//                    no channel for the effect -- a talent-level boost is not
//                    a stat; healing and shields have no `StatKey`; several
//                    effects are gated on a trigger `BuffCondition` cannot
//                    state. The numbers ARE emitted so nothing must be
//                    re-derived, and `reason` says what would be needed.
//                    DO NOT apply these as though they were unconditional.
//
//   "unverified"     The prose could not be parsed into a number reliably, or
//                    the two sources disagree about it. `text` is emitted for
//                    display only. NOT ONE NUMBER HERE WAS GUESSED.
//
// Rows the two sources contradict are marked "unverified" and forfeit every
// structured claim, rather than being split or picked between.
// ============================================================================

/** Which ability slot a talent-level boost applies to. */
export type PerkTalentSlot = "normal" | "skill" | "burst";

/** How completely an effect is modelled. See the header. */
export type PerkSupport = "modelled" | "unimplemented" | "unverified";

/** A stat change. Mirrors `StatModifier` in `src/simulation/buffs/types.ts`. */
export interface PerkStatModifier {{
  stat: string;
  value: number;
  element?: string;
}}

/** A stat conversion. Mirrors `StatConversionModifier`. */
export interface PerkConversion {{
  sourceStat: string;
  targetStat: string;
  ratio: number;
  maxCap?: number;
}}

/** An enemy-side shred. Mirrors `EnemyModifier`. */
export interface PerkEnemyModifier {{
  key: string;
  value: number;
  element?: string;
}}

/** One constellation or passive talent, with its classified effects. */
export interface GeneratedPerkEffect {{
  /** `{{characterId}}-c3` / `{{characterId}}-a1`, matching the character definition. */
  id: string;
  characterId: string;
  kind: "constellation" | "passive";
  /** C1..C6 for a constellation. */
  constellationLevel?: number;
  /** Ascension phase (1 or 4) for an ascension passive. */
  unlockAscension?: number;
  name: string;
  support: PerkSupport;
  modifiers?: readonly PerkStatModifier[];
  conversions?: readonly PerkConversion[];
  enemyModifiers?: readonly PerkEnemyModifier[];
  /** Damage types the effect is scoped to. Absent means unscoped. */
  damageTypes?: readonly string[];
  /** A talent-level boost, emitted as a `Buff` on the character definition. */
  talentLevelBoost?: {{ slot: PerkTalentSlot; levels: number }};
  /** Why the row is not `modelled`. Absent when it is. */
  reason?: string;
  /** The source prose, always present, for display and re-derivation. */
  text: string;
}}
"""


def write_perk_effects_module(
    path: pathlib.Path,
    rows: list[tuple[str, list[perks.ParsedPerk]]],
    provenance: dict,
) -> None:
    """
    Emit every constellation / passive effect, sorted, with its support flag.

    Sorted by character id then by perk id so the output is byte-stable.
    """
    lines = [
        PERK_EFFECTS_HEADER.format(
            amber_endpoint="https://gi.yatta.moe/api/v2/en/avatar/{id}",
            lunaris_endpoint="https://api.lunaris.moe/data/{version}/en/char/{id}.json",
            lunaris_version=provenance.get("lunarisVersion", "unknown"),
            fetched_at=provenance.get("fetchedAt", "unknown"),
        ),
        "",
        "export const generatedPerkEffects: readonly GeneratedPerkEffect[] = [",
    ]

    for character_id, perk_rows in sorted(rows, key=lambda entry: entry[0]):
        for perk in sorted(perk_rows, key=lambda row: row.id_suffix):
            lines.extend(emit_perk_effect(character_id, perk, "  "))

    lines.append("];")
    lines.append("")
    lines.append(
        "export const generatedPerkEffectsById: ReadonlyMap<string, GeneratedPerkEffect> ="
    )
    lines.append("  new Map(generatedPerkEffects.map((perk) => [perk.id, perk]));")
    lines.append("")
    lines.append("/** Every perk belonging to one character, in emitted order. */")
    lines.append(
        "export function perkEffectsForCharacter("
    )
    lines.append("  characterId: string,")
    lines.append("): readonly GeneratedPerkEffect[] {")
    lines.append(
        "  return generatedPerkEffects.filter((perk) => perk.characterId === characterId);"
    )
    lines.append("}")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


PROVENANCE_HEADER = """// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-characters/fetch.py
//     python3 scripts/generate-characters/emit.py
//
// PER-VALUE PROVENANCE -- what this run could NOT source, per character, per
// field, reachable from TypeScript.
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    {amber_endpoint}
//   Verifier source  Lunaris {lunaris_version}
//                    {lunaris_endpoint}
//   Fetched at       {fetched_at}
//
// WHY THIS MODULE EXISTS
// Every element module ends in an UNVERIFIED block of `//` comments. Comments
// are unreadable from TypeScript, so a UI wanting to mark a value as
// unsourced had no way to find out which values those were -- it could only
// mark everything or nothing, and marking nothing is how unsourced numbers get
// presented as sourced ones. The SAME notes are emitted here as data, keyed by
// the field they concern, so a renderer can put the marker on exactly the
// value it applies to.
//
// The comment block is kept as well: it is what a human reading the emitted
// character sees, and the two are generated from one list so they cannot drift.
//
// `field` is the dotted path within the character definition -- "castTime",
// "skill.particles", "burst.energyCost". A field named here is NOT wrong; it
// is UNCONFIRMED, and the reason says by what. Nothing was guessed to fill it.
//
// SUPPORT TIER
// `supportTier` is DERIVED per character from what this run actually emitted
// for THAT character -- see `tierReason`, which quotes that character's own
// counts. It is not a constant applied to the roster. No character reaches
// FULL, and the reason each one falls short is its own.
// ============================================================================

/**
 * Why a character sits at its support tier, as a CLOSED discriminator.
 *
 * Closed on purpose: a new code must be a compile error in every exhaustive
 * switch that consumes it, never a silent fallthrough to untranslated prose.
 *
 *  `fully-modelled`      every perk is modelled and no field carries a caveat.
 *  `no-perks-published`  neither source publishes any constellation or passive,
 *                        so there is nothing to model beyond the numbers.
 *  `perks-unmodelled`    the damage kit is sourced, but some perks are not
 *                        modelled. Which kind, and how many, is in the counts.
 */
export type GeneratedTierReasonCode =
  | "fully-modelled"
  | "no-perks-published"
  | "perks-unmodelled";

/** One value this run could not confirm, and why. */
export interface GeneratedUnverifiedField {{
  /** Dotted path of the affected field within the character definition. */
  readonly field: string;
  /** What could not be confirmed about it, in one sentence. */
  readonly reason: string;
}}

/** How much of one character's kit this run actually modelled. */
export interface GeneratedCharacterProvenance {{
  readonly characterId: string;
  /**
   * Support tier claimed for this character, derived from its own emitted
   * data. Mirrors `SupportTier` in `src/types`.
   */
  readonly supportTier: "FULL" | "BASIC" | "PARTIAL" | "DATA_ONLY" | "NOT_IMPLEMENTED";
  /**
   * STRUCTURED discriminator for why this character is at that tier.
   *
   * THIS, NOT `tierReason`, IS THE SEAM CONSUMERS READ.
   *
   * `tierReason` is English prose assembled from the counts below. A consumer
   * that substring-matches it is coupled to this generator's WORDING, so
   * rewording a sentence silently breaks that consumer with no type error and
   * no failing test -- which is exactly what happened: the zh-CN UI matched on
   * "Damage kit sourced from datamined data", the generator emitted "Damage kit
   * sourced (per-level talent tables, ...)", 0 of 132 matched, and every
   * character rendered ~250 characters of English prose in a Chinese product.
   *
   * The union is deliberately CLOSED so that adding a code is a compile error
   * in any exhaustive switch rather than a silent fallthrough. Translate on
   * this key and compose the sentence from `modelledPerks` / `unimplementedPerks`
   * / `unverifiedPerks` / `totalPerks` / `unconfirmedFields` in the target
   * language. Never parse `tierReason`.
   */
  readonly reasonCode: GeneratedTierReasonCode;
  /**
   * Human-readable English rendering of the same facts.
   *
   * FOR LOGS AND DEBUGGING ONLY. Not a translation source, not a parse target.
   */
  readonly tierReason: string;
  /** Constellations and passives whose effects map onto the buff vocabulary. */
  readonly modelledPerks: number;
  /** Perks with clear numbers but no channel in the buff vocabulary. */
  readonly unimplementedPerks: number;
  /** Perks whose prose could not be parsed, or that the sources contradict. */
  readonly unverifiedPerks: number;
  /** Total constellations and passives the sources publish for this character. */
  readonly totalPerks: number;
  /**
   * Dotted paths of the fields this run could not confirm, sorted and
   * de-duplicated.
   *
   * The same information `tierReason` ends with, as DATA, so a UI can list the
   * fields in its own language instead of slicing them back out of a sentence.
   */
  readonly unconfirmedFields: readonly string[];
  /** Per-field caveats. Empty when this run confirmed every emitted value. */
  readonly unverified: readonly GeneratedUnverifiedField[];
}}
"""


def derive_support(
    perk_rows: list[perks.ParsedPerk], notes: list[tuple[str, str]]
) -> tuple[str, str, str]:
    """
    Derive one character's support tier from what was emitted FOR IT.

    The rule, in full, so the claim can be audited rather than trusted:

      FULL      requires that every constellation and passive this character
                has is modelled AND that no emitted field carries a caveat.
      PARTIAL   the damage kit is sourced (per-level tables, scaling stats,
                cooldowns, energy costs) but some of the kit is not modelled.
      DATA_ONLY the source publishes no constellations or passives at all, so
                there is nothing to model beyond the numbers.

    In practice no character reaches FULL, and that is the honest answer rather
    than a placeholder: every character has at least one perk this generator
    could not express, and every character carries the unsourced-cast-time
    caveat. The reason string therefore quotes THAT character's own counts, so
    two characters with different gaps do not read identically.

    Returns `(tier, reasonCode, tierReason)`. The CODE is the seam consumers
    read; the prose is for logs. They are produced together, here, so the two
    can never drift apart -- the previous design let the prose be reworded
    without anything downstream noticing.
    """
    modelled = sum(1 for row in perk_rows if row.bucket == perks.BUCKET_EXPRESSIBLE)
    unimplemented = sum(
        1 for row in perk_rows if row.bucket == perks.BUCKET_UNIMPLEMENTED
    )
    unverified = sum(1 for row in perk_rows if row.bucket == perks.BUCKET_UNVERIFIED)
    total = len(perk_rows)

    if total == 0:
        return (
            "DATA_ONLY",
            "no-perks-published",
            "Damage kit sourced (per-level talent tables, scaling stats, "
            "cooldowns, energy costs), but neither source publishes any "
            "constellation or passive for this character, so none is modelled.",
        )

    if modelled == total and not notes:
        return ("FULL", "fully-modelled", "")

    # Lead with the largest gap, so the sentence says what is actually missing
    # for THIS character rather than reciting all three counts in a fixed order.
    gaps: list[str] = []
    if unimplemented:
        gaps.append(
            f"{unimplemented} carry sourced numbers the buff vocabulary has no "
            f"channel for"
        )
    if unverified:
        gaps.append(
            f"{unverified} state effects this generator could not parse into "
            f"numbers"
        )
    fields = sorted({field for field, _ in notes})
    detail = "; ".join(gaps)
    return (
        "PARTIAL",
        "perks-unmodelled",
        f"Damage kit sourced (per-level talent tables, scaling stats, "
        f"cooldowns, energy costs). Of {total} constellations and passives, "
        f"{modelled} are modelled as buffs and {total - modelled} are not: "
        f"{detail}. Unconfirmed fields: {', '.join(fields)}.",
    )


def write_provenance_module(
    path: pathlib.Path,
    entries: list[tuple[str, list[perks.ParsedPerk], list[tuple[str, str]]]],
    provenance: dict,
) -> None:
    """
    Emit the per-character support claim and per-field caveats as DATA.

    Sorted by character id, and each character's fields sorted by name, so the
    output is byte-stable across runs.
    """
    lines = [
        PROVENANCE_HEADER.format(
            amber_endpoint="https://gi.yatta.moe/api/v2/en/avatar/{id}",
            lunaris_endpoint="https://api.lunaris.moe/data/{version}/en/char/{id}.json",
            lunaris_version=provenance.get("lunarisVersion", "unknown"),
            fetched_at=provenance.get("fetchedAt", "unknown"),
        ),
        "",
        "export const generatedCharacterProvenance: "
        "readonly GeneratedCharacterProvenance[] = [",
    ]

    for character_id, perk_rows, notes in sorted(entries, key=lambda e: e[0]):
        tier, reason_code, reason = derive_support(perk_rows, notes)
        modelled = sum(
            1 for row in perk_rows if row.bucket == perks.BUCKET_EXPRESSIBLE
        )
        unimplemented = sum(
            1 for row in perk_rows if row.bucket == perks.BUCKET_UNIMPLEMENTED
        )
        unverified = sum(
            1 for row in perk_rows if row.bucket == perks.BUCKET_UNVERIFIED
        )
        lines.append("  {")
        lines.append(f"    characterId: {ts_string(character_id)},")
        lines.append(f"    supportTier: {ts_string(tier)},")
        lines.append(f"    reasonCode: {ts_string(reason_code)},")
        lines.append(f"    tierReason: {ts_string(reason)},")
        lines.append(f"    modelledPerks: {modelled},")
        lines.append(f"    unimplementedPerks: {unimplemented},")
        lines.append(f"    unverifiedPerks: {unverified},")
        lines.append(f"    totalPerks: {len(perk_rows)},")
        unconfirmed_fields = sorted({field for field, _ in notes})
        if unconfirmed_fields:
            rendered = ", ".join(ts_string(field) for field in unconfirmed_fields)
            lines.append(f"    unconfirmedFields: [{rendered}],")
        else:
            lines.append("    unconfirmedFields: [],")
        if notes:
            lines.append("    unverified: [")
            for field, reason_text in sorted(set(notes)):
                lines.append(
                    f"      {{ field: {ts_string(field)}, "
                    f"reason: {ts_string(reason_text)} }},"
                )
            lines.append("    ],")
        else:
            lines.append("    unverified: [],")
        lines.append("  },")

    lines.append("];")
    lines.append("")
    lines.append(
        "export const generatedCharacterProvenanceById: "
        "ReadonlyMap<string, GeneratedCharacterProvenance> ="
    )
    lines.append(
        "  new Map("
    )
    lines.append(
        "    generatedCharacterProvenance.map((entry) => [entry.characterId, entry]),"
    )
    lines.append("  );")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_index(
    path: pathlib.Path, elements: list[str], provenance: dict
) -> None:
    lines = [
        "// ============================================================================",
        "// GENERATED FILE -- DO NOT EDIT BY HAND.",
        "//",
        "// Barrel for the generated character roster. See any element module for the",
        "// full provenance header.",
        "//",
        f"//   Verifier data version  {provenance.get('lunarisVersion', 'unknown')}",
        f"//   Fetched at             {provenance.get('fetchedAt', 'unknown')}",
        "// ============================================================================",
        "",
        'import type { GenericCharacterDefinition } from "@/simulation/character/character";',
    ]
    for element in elements:
        lines.append(
            f'import {{ {element}GeneratedCharacters }} from "./{element}";'
        )
    lines.append("")
    for element in elements:
        lines.append(f"export {{ {element}GeneratedCharacters }} from './{element}';")
    lines.append("")
    lines.append("export type { GeneratedCharacterMeta } from './meta';")
    lines.append(
        "export type {"
    )
    lines.append("  GeneratedCharacterProvenance,")
    lines.append("  GeneratedUnverifiedField,")
    lines.append("} from './provenance';")
    lines.append(
        "export {"
    )
    lines.append("  generatedCharacterProvenance,")
    lines.append("  generatedCharacterProvenanceById,")
    lines.append("} from './provenance';")
    lines.append(
        "export { generatedCharacterMeta, generatedCharacterMetaById } from './meta';"
    )
    lines.append(
        "export type {"
    )
    lines.append(
        "  GeneratedPerkEffect,"
    )
    lines.append("  PerkConversion,")
    lines.append("  PerkEnemyModifier,")
    lines.append("  PerkStatModifier,")
    lines.append("  PerkSupport,")
    lines.append("  PerkTalentSlot,")
    lines.append("} from './perkEffects';")
    lines.append(
        "export {"
    )
    lines.append("  generatedPerkEffects,")
    lines.append("  generatedPerkEffectsById,")
    lines.append("  perkEffectsForCharacter,")
    lines.append("} from './perkEffects';")
    lines.append("")
    lines.append(
        "export const generatedCharacters: readonly GenericCharacterDefinition[] = ["
    )
    for element in elements:
        lines.append(f"  ...{element}GeneratedCharacters,")
    lines.append("];")
    lines.append("")
    lines.append(
        "export const generatedCharactersById: ReadonlyMap<string, GenericCharacterDefinition> ="
    )
    lines.append(
        "  new Map(generatedCharacters.map((character) => [character.id, character]));"
    )
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


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
        / "characters"
        / "generated",
    )
    args = parser.parse_args()

    provenance = json.loads(
        (args.cache / "_provenance.json").read_text(encoding="utf-8")
    )
    amber_list = json.loads(
        (args.cache / "amber" / "_list.json").read_text(encoding="utf-8")
    )["data"]["items"]

    # --- base-stat curves, solved once for the whole roster ----------------
    # Every character sharing a growth curve constrains the same unknown, so
    # the curve is recovered from the WHOLE roster before any character is
    # emitted -- one character alone does not pin it down. See `curves.py`.
    observations: list[curves.CurveObservation] = []
    for amber_id in sorted(amber_list):
        amber_payload = parse.load_cache(args.cache, "amber", amber_id)
        lunaris_payload = parse.load_cache(
            args.cache, "lunaris", parse.lunaris_id_for(amber_id)
        )
        if amber_payload is None or lunaris_payload is None:
            continue
        observations.extend(
            curves.observations_for(amber_payload["data"], lunaris_payload)
        )
    curve_solution = curves.solve_curves(observations)

    by_element: dict[str, list[tuple[str, str, list[tuple[str, str]]]]] = {}
    roster_metadata: list[dict] = []
    skipped: list[tuple[str, str]] = []
    stats = {"characters": 0, "abilities": 0, "instances": 0, "values": 0}
    verified = {"checked": 0, "agreed": 0}
    conflicts: list[str] = []
    perk_effects: list[tuple[str, list[perks.ParsedPerk]]] = []
    provenance_entries: list[
        tuple[str, list[perks.ParsedPerk], list[tuple[str, str]]]
    ] = []
    perk_stats: collections.Counter[str] = collections.Counter()

    for amber_id in sorted(amber_list):
        amber = parse.load_cache(args.cache, "amber", amber_id)
        if amber is None:
            skipped.append((amber_id, "no cached Amber payload"))
            continue
        lunaris = parse.load_cache(
            args.cache, "lunaris", parse.lunaris_id_for(amber_id)
        )
        if lunaris is None:
            skipped.append((amber_id, "no cached Lunaris payload to verify against"))
            continue

        abilities, parse_notes = parse.parse_character(amber)
        reference = parse.lunaris_values(lunaris)

        abilities, unmatched, checked, agreed = withhold_unverified_abilities(
            abilities, reference
        )
        verified["checked"] += checked
        verified["agreed"] += agreed
        for field, reason in unmatched:
            conflicts.append(f"{amber['data']['name']}: {field}: {reason}")
        for note in parse_notes:
            unmatched.append(
                (
                    f"{note.talent}.{note.label}",
                    f"{note.reason} (not emitted as executable data)",
                )
            )

        perk_rows, perk_conflicts = perks.parse_perks(amber, lunaris)
        for conflict in perk_conflicts:
            conflicts.append(f"{amber['data']['name']}: {conflict}")

        built = build_character_source(
            amber_id=amber_id,
            amber=amber,
            lunaris=lunaris,
            abilities=abilities,
            unmatched=unmatched,
            perk_rows=perk_rows,
            curve_solution=curve_solution,
        )
        if built is None:
            skipped.append(
                (amber_id, "no element/weapon mapping, or missing skill or burst")
            )
            continue

        element, identifier, source, notes, metadata = built
        by_element.setdefault(element, []).append((identifier, source, notes))
        roster_metadata.append(metadata)
        perk_effects.append((metadata["characterId"], perk_rows))
        provenance_entries.append((metadata["characterId"], perk_rows, notes))
        for row in perk_rows:
            perk_stats[row.kind] += 1
            perk_stats[row.bucket] += 1
        stats["characters"] += 1
        stats["abilities"] += len(abilities)
        for ability in abilities:
            stats["instances"] += len(ability.instances)
            for instance in ability.instances:
                stats["values"] += sum(len(term.table) for term in instance.terms)

    args.out.mkdir(parents=True, exist_ok=True)
    for existing in args.out.glob("*.ts"):
        existing.unlink()

    elements = sorted(by_element)
    for element in elements:
        entries = sorted(by_element[element], key=lambda entry: entry[0])
        write_element_module(
            args.out / f"{element}.ts", element, entries, provenance
        )
    write_metadata_module(args.out / "meta.ts", roster_metadata, provenance)
    write_perk_effects_module(
        args.out / "perkEffects.ts", perk_effects, provenance
    )
    write_provenance_module(
        args.out / "provenance.ts", provenance_entries, provenance
    )
    write_index(args.out / "index.ts", elements, provenance)

    print(f"emitted {stats['characters']} characters to {args.out}")
    solved_levels = sum(len(levels) for levels in curve_solution.multipliers.values())
    print(
        f"  base-stat curves: {len(curve_solution.multipliers)} growth curves, "
        f"{solved_levels} per-level multipliers recovered and replay-verified "
        f"({len(curve_solution.conflicts)} conflicts)"
    )
    for conflict in curve_solution.conflicts[:20]:
        print(f"  CURVE CONFLICT {conflict}")
    print(
        f"  abilities={stats['abilities']} instances={stats['instances']} "
        f"per-level values={stats['values']}"
    )
    print(
        f"  cross-verified {verified['agreed']}/{verified['checked']} values "
        f"({len(conflicts)} conflicts)"
    )
    for conflict in conflicts[:20]:
        print(f"  CONFLICT {conflict}")
    print(
        f"  constellations={perk_stats['constellation']} "
        f"passives={perk_stats['passive']}"
    )
    print(
        f"    modelled={perk_stats[perks.BUCKET_EXPRESSIBLE]} "
        f"unimplemented={perk_stats[perks.BUCKET_UNIMPLEMENTED]} "
        f"unverified={perk_stats[perks.BUCKET_UNVERIFIED]}"
    )
    print(f"  skipped {len(skipped)} character(s)")
    for amber_id, reason in skipped:
        name = amber_list.get(amber_id, {}).get("name", amber_id)
        print(f"    - {name} ({amber_id}): {reason}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
