#!/usr/bin/env python3
"""
Stage 2b of the character-data generator: parse constellations and passive
talents into structured, honestly-classified data.

WHY THIS IS HARD, AND WHY THE OUTPUT IS DELIBERATELY INCOMPLETE
Multipliers are published as numeric arrays. Constellations and passives are
NOT: both sources publish them as PROSE.

    "Increases the DMG dealt by 40%."
    "Within the Field created by Dandelion Breeze, all opponents have their
     Anemo RES decreased by 40%."

A prose string is not simulatable. The project's abstraction for an effect is
`Buff` (`src/simulation/buffs/types.ts`) -- plain data, declarative conditions,
never a predicate function. So every effect lands in exactly one of three
buckets, and WHICH bucket it landed in is recorded on the emitted row:

  EXPRESSIBLE   The prose maps onto the existing `Buff` vocabulary with no
                invented mechanism. Emitted as structured data.

  UNIMPLEMENTED The numbers are unambiguous, but the current vocabulary has no
                channel for the effect (a talent-level boost is not a stat; a
                healing or shield term has no `StatKey`). The numbers ARE
                emitted so nothing has to be re-derived later, and the row says
                what the buff system would need. NO mechanism is invented here.

  UNVERIFIED    The prose cannot be parsed into a number reliably, or the two
                sources disagree about it. The TEXT is emitted for display and
                the row carries a TODO. NOT ONE NUMBER IS GUESSED.

That third bucket is the point. The roster this generator replaced was 83%
wrong precisely because plausible-looking numbers were written from memory. A
row honestly marked UNVERIFIED costs nothing; a fabricated one costs the whole
dataset its credibility.

CROSS-VERIFICATION
Both sources publish every constellation and passive. Name and description are
compared after markup normalisation. Where the two disagree on the NUMBERS in
the text, the row is withheld from the structured bucket and reported -- never
split, never picked. In practice the disagreements are all one shape: Lunaris
tracks a newer game version and carries clauses Amber has not yet been updated
with.
"""

from __future__ import annotations

import dataclasses
import re

# --- Amber talent `type` discriminator (mirrors parse.py) ------------------
TALENT_TYPE_PASSIVE = 2

# Constellation levels are C1..C6, always six rows per character.
CONSTELLATION_COUNT = 6

# Passive talent slots. The game's own universal convention is that the first
# two combat passives unlock at Ascension 1 and Ascension 4; the third slot is
# the out-of-combat utility passive (cooking, sprinting, ore detection).
# NEITHER SOURCE publishes an explicit unlock field, so this positional rule is
# the only signal -- it is applied uniformly and recorded as an assumption
# rather than being asserted per character from memory.
ASCENSION_BY_PASSIVE_SLOT = (1, 4)
UTILITY_PASSIVE_SLOT_INDEX = 2

# --- Bucket names ----------------------------------------------------------
BUCKET_EXPRESSIBLE = "expressible"
BUCKET_UNIMPLEMENTED = "unimplemented"
BUCKET_UNVERIFIED = "unverified"

# --- Markup stripping ------------------------------------------------------
COLOR_OPEN = re.compile(r"<color=#[0-9A-Fa-f]{6,8}>")
LINK_OPEN = re.compile(r"\{LINK#[^}]*\}")
# A run of per-platform alternatives; the first is kept (see parse.strip_layout_macro).
LAYOUT_RUN = re.compile(r"(?:\{LAYOUT_[A-Z]+#[^}]*\})+")
LAYOUT_FIRST = re.compile(r"\{LAYOUT_[A-Z]+#([^}]*)\}")
ITALIC = re.compile(r"</?i>")
WHITESPACE = re.compile(r"\s+")

# Any number in the text, used to compare the two sources' claims.
NUMBER_TOKEN = re.compile(r"\d+(?:\.\d+)?%?")
# Verifier passive keys are a dense `p1..pN` sequence; anything else is not a
# passive slot and must not be ordered into the dense fallback list.
PASSIVE_KEY = re.compile(r"p\d+")


def strip_markup(text: str) -> str:
    """Reduce a source description to comparable plain text."""
    out = COLOR_OPEN.sub("", text).replace("</color>", "")
    out = LINK_OPEN.sub("", out).replace("{/LINK}", "")
    out = LAYOUT_RUN.sub(
        lambda run: LAYOUT_FIRST.match(run.group(0)).group(1),  # type: ignore[union-attr]
        out,
    )
    out = ITALIC.sub("", out)
    # Amber escapes newlines literally in the cached JSON.
    out = out.replace("\\n", " ").replace("\n", " ")
    out = out.replace("#", "").replace("*", "")
    return WHITESPACE.sub(" ", out).strip()


def numbers_in(text: str) -> list[str]:
    """Every numeric claim in a description, in order."""
    return NUMBER_TOKEN.findall(text)


# ---------------------------------------------------------------------------
# Talent-level constellations -- the one large STRUCTURED bucket
# ---------------------------------------------------------------------------
#
# "Increases the Level of <Dandelion Breeze> by 3." is fully machine-readable
# once the named ability is resolved to a slot. Amber sometimes ships this as
# structured `extraData.addTalentExtraLevel`, but only for 194 of the 259 rows
# that have it, and its `talentIndex` is an opaque internal id that does not map
# onto a slot. So the ABILITY NAME in the prose is matched against the
# character's own talent names -- which resolves all 259 rows exactly, with no
# fallback and no guessing.

TALENT_LEVEL_PROSE = re.compile(
    r"Increases the Level of (?:the )?(?:Elemental (?:Skill|Burst) )?(.+?) by (\d+)\.",
)
NORMAL_ATTACK_PREFIX = re.compile(r"^normal attack:\s*")


def ability_slot_index(amber_data: dict) -> dict[str, str]:
    """
    Map each of this character's talent NAMES to its ability slot.

    Amber orders talents so the first `type == 0` entry is the normal-attack
    string and the second is the elemental skill; `type == 1` is the burst.
    """
    talents = amber_data.get("talent") or {}
    ordered = sorted(talents.items(), key=lambda item: int(item[0]))
    index: dict[str, str] = {}

    attack_like = [key for key, value in ordered if value.get("type") == 0]
    for position, key in enumerate(attack_like):
        name = strip_markup(talents[key]["name"]).lower()
        index[name] = "normal" if position == 0 else "skill"

    for key, value in ordered:
        if value.get("type") == 1:
            index[strip_markup(value["name"]).lower()] = "burst"

    return index


def parse_talent_level_boost(
    description: str, slots: dict[str, str]
) -> tuple[str, int] | None:
    """
    Recover ("skill", 3) from "Increases the Level of <Gale Blade> by 3."

    Returns None when the row is not a talent-level boost, or when the ability
    it names is not one of this character's own talents -- the latter is
    reported rather than defaulted to a slot.
    """
    match = TALENT_LEVEL_PROSE.search(strip_markup(description))
    if match is None:
        return None
    name = NORMAL_ATTACK_PREFIX.sub("", match.group(1).strip().lower())
    slot = slots.get(name)
    if slot is None:
        return None
    return slot, int(match.group(2))


# ---------------------------------------------------------------------------
# Stat-modifier prose -- the EXPRESSIBLE bucket
# ---------------------------------------------------------------------------
#
# Each pattern below must satisfy three things before it is allowed here:
#   1. it names a `StatKey` (or `EnemyModifierKey`) that already exists;
#   2. the magnitude is unambiguous in the text;
#   3. the effect is UNCONDITIONAL, or conditional only in a way `BuffCondition`
#      can already express.
#
# Rule 3 is why this list is short. Most constellations gate their effect on
# something the condition vocabulary cannot state ("while the field created by
# her burst persists", "after picking up an Elemental Orb", "on the 3rd hit").
# Those are numerically clear but NOT expressible, so they go to the
# unimplemented bucket WITH their numbers, rather than being emitted as though
# they were always-on -- which would silently inflate every damage number.

# A percentage, captured. Anchored per pattern below.
PCT = r"(\d+(?:\.\d+)?)%"

#: (regex, StatKey). Applied to markup-stripped text.
#
# Both voices the sources use are accepted: "X is increased by N%" and the
# imperative "Increases X by N%". They are the same statement, and matching
# only one silently drops the other.
STAT_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(rf"(?:CRIT Rate (?:is )?increased by|Increases CRIT Rate by) {PCT}", re.I),
        "critRate",
    ),
    (
        re.compile(rf"(?:CRIT DMG (?:is )?increased by|Increases CRIT DMG by) {PCT}", re.I),
        "critDmg",
    ),
    (
        re.compile(rf"(?:ATK (?:is )?increased by|Increases ATK by) {PCT}", re.I),
        "atkPercent",
    ),
    (
        re.compile(
            rf"(?:Energy Recharge (?:is )?increased by|Increases Energy Recharge by) {PCT}",
            re.I,
        ),
        "energyRecharge",
    ),
    # Flat EM only. The trailing `(?!%)` is load-bearing: several kits say
    # "Elemental Mastery is increased by 8% of his ATK", which is a stat
    # CONVERSION (`StatConversionModifier`), not a flat +8. Reading the "8" as
    # flat EM would be a fabricated number of exactly the kind the audit found,
    # so the percentage form is excluded here and falls through to the
    # conversion detector below.
    #
    # The trailing guard must reject BOTH a following `%` and a following
    # digit. Without the digit clause the engine backtracks: "increased by 10%"
    # matches the "1" and then satisfies "not a percent sign" against the "0",
    # silently emitting a flat +1 EM. That is a fabricated number produced by a
    # regex rather than by memory -- the same failure mode, so it is guarded
    # explicitly and pinned by a test.
    (
        re.compile(
            # `(?!\d)` stops the backtrack mid-number; `(?!\s*%)` rejects the
            # percentage form. A trailing "." must still be allowed -- it ends
            # the sentence in "increased by 125."
            r"Elemental Mastery (?:is )?increased by (\d+(?:\.\d+)?)(?!\d)(?!\s*%)",
            re.I,
        ),
        "elementalMastery",
    ),
)

#: Percentage-of-another-stat conversions, e.g. "EM increased by 8% of his ATK".
#: Captured as (percentage, source stat, optional cap) -> `StatConversionModifier`.
CONVERSION_PATTERN = re.compile(
    rf"(Elemental Mastery|ATK|DEF|HP) (?:is )?increased by {PCT} of (?:\w+'s |his |her |their )?"
    r"(?:Max )?(ATK|DEF|HP|Elemental Mastery)",
    re.I,
)
#: Both phrasings the sources use for a conversion's ceiling. A cap that is
#: read but not emitted would overstate the buff without limit, so both forms
#: are matched and a conversion whose prose states a cap this cannot read is
#: demoted rather than emitted uncapped (see `parse_conversions`).
CONVERSION_CAP = re.compile(
    r"(?:maximum (?:increase|value|amount) obtainable (?:this way |in this way )?is"
    r"|up to) (\d+(?:\.\d+)?)",
    re.I,
)

#: Prose that states a ceiling in some form. If this matches but
#: `CONVERSION_CAP` does not, the cap exists but was not read.
CONVERSION_CAP_HINT = re.compile(r"maximum|up to|at most|cannot exceed", re.I)

#: Prose stat name -> the `StatKey` a conversion targets / the source stat name.
CONVERSION_TARGET_STAT = {
    "elemental mastery": "elementalMastery",
    "atk": "atkPercent",
    "def": "defPercent",
    "hp": "hpPercent",
}
CONVERSION_SOURCE_STAT = {
    "atk": "atk",
    "def": "def",
    "hp": "hp",
    "elemental mastery": "elementalMastery",
}

#: (regex, EnemyModifierKey). RES shred needs an element, read separately.
ENEMY_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(rf"DEF (?:is )?(?:decreased|reduced) by {PCT}", re.I),
        "defReduction",
    ),
)

RES_SHRED = re.compile(rf"(\w+) RES (?:is )?decreased by {PCT}", re.I)

ELEMENT_WORDS = frozenset(
    {"pyro", "hydro", "electro", "cryo", "anemo", "geo", "dendro", "physical"}
)

# Clauses that make an effect conditional in a way `BuffCondition` cannot state.
# Presence of ANY of these demotes an otherwise-parseable row out of the
# expressible bucket. Deliberately broad: a false demotion costs a row of
# structure, a false promotion corrupts every damage number that uses it.
CONDITIONAL_MARKERS = (
    " when ",
    " while ",
    " after ",
    " if ",
    " upon ",
    " within ",
    " during ",
    " every ",
    " each time ",
    " on hit",
    " chance",
    " per stack",
    " for each ",
    " nearby ",
    " against ",
    # A trigger the effect hangs off: the buff exists only for targets that
    # were hit, or for characters some other effect already touched. Neither
    # is a `BuffCondition` field, and both are common enough that omitting
    # them would let a targeted buff be emitted as an unconditional one.
    " damaged by ",
    " who have ",
    " hit by ",
    " affected by ",
    " enhanced",
    " additionally",
    " is increased to ",
)


def has_unmodellable_condition(text: str) -> bool:
    """True when the prose gates its effect on something `BuffCondition` lacks."""
    lowered = f" {text.lower()} "
    return any(marker in lowered for marker in CONDITIONAL_MARKERS)


@dataclasses.dataclass(frozen=True)
class ParsedModifier:
    """One stat change recovered from prose. Mirrors `StatModifier` in TS."""

    stat: str
    value: float
    element: str | None = None


@dataclasses.dataclass(frozen=True)
class ParsedEnemyModifier:
    """One enemy-side shred recovered from prose. Mirrors `EnemyModifier`."""

    key: str
    value: float
    element: str | None = None


@dataclasses.dataclass(frozen=True)
class ParsedConversion:
    """A stat conversion recovered from prose. Mirrors `StatConversionModifier`."""

    source_stat: str
    target_stat: str
    ratio: float
    max_cap: float | None = None


# --- Ability scoping -------------------------------------------------------
# A great many effects apply to ONE damage type rather than to everything:
# "Charged Attack CRIT Rate is increased by 15%". `BuffCondition.damageTypes`
# expresses exactly this, so such a row stays expressible -- but ONLY if the
# scope is carried through. Emitting it unscoped would turn a Charged-Attack-only
# crit bonus into a global one and inflate every other hit in the rotation.
DAMAGE_TYPE_MARKERS: tuple[tuple[str, str], ...] = (
    ("charged attack", "charged"),
    ("plunging attack", "plunge"),
    ("normal attack", "normal"),
    ("elemental skill", "skill"),
    ("elemental burst", "burst"),
)


def detect_damage_types(text: str) -> tuple[str, ...]:
    """Damage types the prose scopes its effect to, or () for unscoped."""
    lowered = text.lower()
    return tuple(
        sorted({slot for marker, slot in DAMAGE_TYPE_MARKERS if marker in lowered})
    )


def parse_conversions(text: str) -> list[ParsedConversion]:
    """
    Recover "<target> increased by N% of <source>" conversions from prose.

    A conversion whose prose announces a ceiling this parser cannot read is
    DROPPED rather than emitted uncapped: an uncapped conversion grows without
    limit, so guessing "no cap" is not the safe default it looks like.
    """
    found: list[ParsedConversion] = []
    cap_match = CONVERSION_CAP.search(text)
    cap = float(cap_match.group(1)) if cap_match else None
    if cap is None and CONVERSION_CAP_HINT.search(text):
        return []
    for target_word, raw, source_word in CONVERSION_PATTERN.findall(text):
        target = CONVERSION_TARGET_STAT.get(target_word.lower())
        source = CONVERSION_SOURCE_STAT.get(source_word.lower())
        if target is None or source is None:
            continue
        found.append(
            ParsedConversion(
                source_stat=source,
                target_stat=target,
                ratio=float(raw) / 100.0,
                max_cap=cap,
            )
        )
    return found


def parse_stat_modifiers(
    text: str,
) -> tuple[list[ParsedModifier], list[ParsedEnemyModifier]]:
    """
    Recover every stat/enemy modifier stated in the prose.

    Percentages become fractions (40% -> 0.4); Elemental Mastery is flat and is
    kept as written. Only the patterns above are recognised -- an unrecognised
    sentence yields nothing rather than a guess.
    """
    modifiers: list[ParsedModifier] = []
    enemy: list[ParsedEnemyModifier] = []

    for pattern, stat in STAT_PATTERNS:
        for raw in pattern.findall(text):
            value = float(raw)
            modifiers.append(
                ParsedModifier(
                    stat=stat,
                    # EM is the one flat stat here; every other key is a fraction.
                    value=value if stat == "elementalMastery" else value / 100.0,
                )
            )

    for pattern, key in ENEMY_PATTERNS:
        for raw in pattern.findall(text):
            enemy.append(ParsedEnemyModifier(key=key, value=float(raw) / 100.0))

    for element_word, raw in RES_SHRED.findall(text):
        element = element_word.lower()
        if element not in ELEMENT_WORDS:
            # "their RES decreased" with no element named -- not modellable as
            # a per-element shred, so it is left for the unverified bucket.
            continue
        enemy.append(
            ParsedEnemyModifier(
                key="resReduction", value=float(raw) / 100.0, element=element
            )
        )

    return modifiers, enemy


# ---------------------------------------------------------------------------
# The parsed row
# ---------------------------------------------------------------------------


@dataclasses.dataclass(frozen=True)
class ParsedPerk:
    """
    One constellation or passive talent, classified into exactly one bucket.

    `text` is ALWAYS present: even a fully-structured row keeps its prose, so a
    UI can show what the effect actually says and a later pass can re-derive
    from the same string this run read.
    """

    kind: str  # "constellation" | "passive"
    #: C1..C6 for a constellation; None for a passive.
    level: int | None
    #: Ascension phase for a passive (1 or 4); None for utility and constellations.
    unlock_ascension: int | None
    id_suffix: str
    name: str
    text: str
    bucket: str
    #: Structured effects, when `bucket == BUCKET_EXPRESSIBLE`.
    modifiers: tuple[ParsedModifier, ...] = ()
    enemy_modifiers: tuple[ParsedEnemyModifier, ...] = ()
    conversions: tuple[ParsedConversion, ...] = ()
    #: `BuffCondition.damageTypes` scope, or () when the effect is unscoped.
    damage_types: tuple[str, ...] = ()
    #: ("skill", 3) for a talent-level boost -- numerically clear, not a stat.
    talent_level_boost: tuple[str, int] | None = None
    #: Why the row is not expressible; what the buff system would need.
    reason: str | None = None


# Reasons, stated once so the emitted rows and the report agree word for word.
#
# HISTORICAL NOTE. A talent-level boost used to be UNIMPLEMENTED, with the
# reason "`Buff` has no talent-level modifier". That is no longer true:
# mechanics landed `Buff.talentLevelModifiers`, combat wired it through
# `talentLevelSeam.ts` into `planAbility`, and `TalentSlot` matches the emitted
# `PerkTalentSlot` 1:1. The reason constant is gone rather than kept-and-unused,
# so nothing can quote a blocker that has been cleared.
REASON_CONDITIONAL = (
    "effect is numerically clear but gated on a condition `BuffCondition` "
    "cannot express (field uptime, on-hit, stack-count or pickup trigger)"
)
REASON_NO_CHANNEL = (
    "effect has no channel in the current vocabulary (healing, shield, "
    "interruption resistance, stamina, cooldown or duration change)"
)
REASON_UNPARSED = "prose states no number this parser can read reliably"
REASON_UNRECOGNISED_EFFECT = (
    "prose states a number, but the effect it modifies is one no pattern here "
    "recognises; reading a value out of it would be a guess about WHAT the "
    "value modifies, not just how much"
)
REASON_SOURCE_CONFLICT = (
    "the two sources publish different numbers for this effect; withheld "
    "rather than split or picked"
)

# Effects whose subject matter has no `StatKey`/`EnemyModifierKey` at all.
# Checked before the conditional demotion so the reported reason is the more
# specific of the two.
NO_CHANNEL_MARKERS = (
    "heal",
    "regenerat",
    "shield",
    "interruption resistance",
    "stamina",
    "cooldown",
    "duration",
    "movement spd",
    "atk spd",
    "energy by",
    "restore",
    "hp by",
)


def classify(
    text: str,
    modifiers: list[ParsedModifier],
    enemy: list[ParsedEnemyModifier],
    conversions: list[ParsedConversion],
    boost: tuple[str, int] | None,
) -> tuple[str, str | None]:
    """
    Decide the bucket for one row. Returns (bucket, reason).

    Order matters. A talent-level boost is checked first and is EXPRESSIBLE:
    its entire meaning is two published fields (which talent, how many levels),
    it carries no duration, stack ceiling or trigger to invent, and the engine
    now consumes it end-to-end. It short-circuits before the conditional
    demotion below because the prose that names the talent ("Increases the Level
    of <Gale Blade> by 3") is unconditional even when the rest of the row's
    sentence is not. Then anything with no channel at all; then the conditional
    demotion; only a row that survives all three is claimed as expressible.
    """
    if boost is not None:
        return BUCKET_EXPRESSIBLE, None

    if not modifiers and not enemy and not conversions:
        lowered = text.lower()
        if any(marker in lowered for marker in NO_CHANNEL_MARKERS):
            return BUCKET_UNIMPLEMENTED, REASON_NO_CHANNEL
        # Distinguish "there is no number here" from "there is a number but we
        # do not know what it modifies". Both are unverified, but they need
        # different work to resolve, and collapsing them would misreport the
        # size of each.
        if NUMBER_TOKEN.search(text):
            return BUCKET_UNVERIFIED, REASON_UNRECOGNISED_EFFECT
        return BUCKET_UNVERIFIED, REASON_UNPARSED

    if has_unmodellable_condition(text):
        return BUCKET_UNIMPLEMENTED, REASON_CONDITIONAL

    return BUCKET_EXPRESSIBLE, None


def parse_perks(
    amber: dict, lunaris: dict | None
) -> tuple[list[ParsedPerk], list[str]]:
    """
    Parse every constellation and passive for one character.

    Returns (rows, conflicts). A row whose description the verifier contradicts
    NUMERICALLY is forced into the unverified bucket and also reported as a
    conflict, so a source divergence is visible in the run output and not only
    in the emitted file.
    """
    data = amber["data"]
    slots = ability_slot_index(data)
    verifier_constellations = (lunaris or {}).get("constellations") or {}
    verifier_passives = (lunaris or {}).get("passives") or {}

    rows: list[ParsedPerk] = []
    conflicts: list[str] = []

    # --- Constellations ----------------------------------------------------
    raw_constellations = data.get("constellation") or {}
    for key in sorted(raw_constellations, key=int):
        entry = raw_constellations[key]
        level = int(key) + 1
        text = strip_markup(entry.get("description") or "")
        name = strip_markup(entry.get("name") or "")

        verifier = verifier_constellations.get(f"const{level}")
        conflict = None
        if isinstance(verifier, dict):
            verifier_text = strip_markup(verifier.get("description") or "")
            if numbers_in(verifier_text) != numbers_in(text):
                conflict = (
                    f"C{level} {name!r}: primary={numbers_in(text)} "
                    f"verifier={numbers_in(verifier_text)}"
                )
        else:
            conflict = f"C{level} {name!r}: verifier publishes no row"

        boost = parse_talent_level_boost(entry.get("description") or "", slots)
        modifiers, enemy = parse_stat_modifiers(text)
        conversions = parse_conversions(text)
        damage_types = detect_damage_types(text)
        bucket, reason = classify(text, modifiers, enemy, conversions, boost)

        if conflict is not None:
            conflicts.append(conflict)
            # A contradicted row keeps its text for display but forfeits every
            # structured claim -- including a talent-level boost, since the
            # disagreement may be about exactly that number.
            bucket, reason = BUCKET_UNVERIFIED, REASON_SOURCE_CONFLICT
            modifiers, enemy, conversions, boost = [], [], [], None
            damage_types = ()

        rows.append(
            ParsedPerk(
                kind="constellation",
                level=level,
                unlock_ascension=None,
                id_suffix=f"c{level}",
                name=name,
                text=text,
                bucket=bucket,
                modifiers=tuple(modifiers),
                enemy_modifiers=tuple(enemy),
                conversions=tuple(conversions),
                damage_types=damage_types,
                talent_level_boost=boost,
                reason=reason,
            )
        )

    # --- Passive talents ---------------------------------------------------
    talents = data.get("talent") or {}
    # POSITION IS MEANINGFUL AND IS NOT THE SAME THING AS PRESENCE.
    #
    # The slot index carries the unlock rule (slots 0 and 1 are the Ascension 1
    # / Ascension 4 combat passives; slot 2 is the out-of-combat utility
    # passive), so it is assigned from the source's own ordering and kept even
    # when a slot is empty. Renumbering around a hole would silently promote a
    # later passive into the utility slot it does not occupy.
    #
    # A slot both sources publish as blank -- no name AND no description -- is
    # a placeholder in the game's own talent table, not a passive we failed to
    # read. Raiden Shogun is the roster's only case: Amber talent slot 6 and
    # Lunaris `p4` are both empty, so she has no utility passive and
    # "All-Preserver" is the fourth-slot bonus passive. Such a slot is skipped
    # rather than emitted as a nameless row, which would render an empty line
    # in the character detail UI and assert a passive that does not exist.
    passives = [
        talents[key]
        for key in sorted(talents, key=int)
        if talents[key].get("type") == TALENT_TYPE_PASSIVE
    ]
    # THE TWO SOURCES PACK PASSIVES DIFFERENTLY AND `position` IS NOT A KEY
    # INTO THE VERIFIER.
    #
    # `position` is the primary source's own slot ordinal and carries the
    # unlock rule, so it is kept exactly as-is above. The verifier, however,
    # emits a DENSE `p1..pN` list that omits blank slots entirely. Raiden
    # Shogun is the roster's case: Amber's talent slot 6 is blank, so her
    # "All-Preserver" sits at position 3 (-> `p4`) while the verifier packs it
    # at `p3` and publishes `p4` as an empty string. Looking up by `position`
    # therefore compared a real row against nothing and reported a source
    # conflict where the two sources actually AGREE.
    #
    # Resolution is by NAME first -- the only field that identifies a passive
    # independently of either source's packing -- and falls back to the dense
    # ordinal. A row that resolves to neither is still reported, because an
    # unmatchable row is a genuine finding and must not be silently dropped.
    verifier_by_name = {
        strip_markup(row.get("name") or ""): row
        for row in verifier_passives.values()
        if isinstance(row, dict) and strip_markup(row.get("name") or "")
    }
    dense_verifier = [
        verifier_passives[key]
        for key in sorted(
            (k for k in verifier_passives if PASSIVE_KEY.fullmatch(k)),
            key=lambda k: int(k[1:]),
        )
        if isinstance(verifier_passives[key], dict)
        and strip_markup(verifier_passives[key].get("description") or "")
    ]

    dense_position = 0
    for position, entry in enumerate(passives):
        text = strip_markup(entry.get("description") or "")
        name = strip_markup(entry.get("name") or "")

        if not name and not text:
            continue

        unlock: int | None = None
        if position < len(ASCENSION_BY_PASSIVE_SLOT):
            unlock = ASCENSION_BY_PASSIVE_SLOT[position]

        verifier = verifier_by_name.get(name)
        if verifier is None and dense_position < len(dense_verifier):
            verifier = dense_verifier[dense_position]
        dense_position += 1
        conflict = None
        if isinstance(verifier, dict):
            verifier_text = strip_markup(verifier.get("description") or "")
            if numbers_in(verifier_text) != numbers_in(text):
                conflict = (
                    f"passive {position + 1} {name!r}: primary={numbers_in(text)} "
                    f"verifier={numbers_in(verifier_text)}"
                )
        else:
            conflict = f"passive {position + 1} {name!r}: verifier publishes no row"

        modifiers, enemy = parse_stat_modifiers(text)
        conversions = parse_conversions(text)
        damage_types = detect_damage_types(text)
        bucket, reason = classify(text, modifiers, enemy, conversions, None)

        if conflict is not None:
            conflicts.append(conflict)
            bucket, reason = BUCKET_UNVERIFIED, REASON_SOURCE_CONFLICT
            modifiers, enemy, conversions = [], [], []
            damage_types = ()

        rows.append(
            ParsedPerk(
                kind="passive",
                level=None,
                unlock_ascension=unlock,
                id_suffix=f"a{unlock}" if unlock else f"p{position + 1}",
                name=name,
                text=text,
                bucket=bucket,
                modifiers=tuple(modifiers),
                enemy_modifiers=tuple(enemy),
                conversions=tuple(conversions),
                damage_types=damage_types,
                reason=reason,
            )
        )

    return rows, conflicts
