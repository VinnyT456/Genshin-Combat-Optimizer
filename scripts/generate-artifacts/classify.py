#!/usr/bin/env python3
"""
Stage 2 of the artifact-data generator: turn set-bonus PROSE into honestly
classified `Buff` data.

WHY THIS FILE IS SHAPED LIKE `generate-characters/perks.py`

A set bonus and a constellation are the same kind of object: a conditional
effect described in a sentence. The character generator already solved this,
and the solution is the three-bucket split reused verbatim here, because three
parallel implementations of one idea is exactly what the project forbids.

  EXPRESSIBLE    The effect maps onto the existing `Buff` vocabulary with no
                 invented mechanism -- a `StatKey`, a `BuffCondition`, an
                 `EnemyModifier`. Emitted as structured data, usable as-is.

  UNIMPLEMENTED  The numbers are unambiguous but the vocabulary has no channel
                 for the effect: stamina cost, attack SPD, cooldown reduction,
                 energy regeneration, shield strength, healing, a trigger
                 `BuffCondition` cannot state. THE NUMBERS ARE STILL EMITTED so
                 nothing has to be re-derived later, and `reason` records what
                 the vocabulary would need. These must NEVER be applied as
                 though they were unconditional.

  UNVERIFIED     The prose cannot be parsed into a number reliably, or the two
                 sources disagree. `text` is emitted for display only and the
                 row carries a TODO. NOT ONE NUMBER IS GUESSED.

WITHHOLD ON CONFLICT. When the verifier does not corroborate a number scraped
from Amber's prose, the row is demoted to UNVERIFIED and reported -- never
split, never resolved toward the nicer value.

HOW THE VERIFIER IS READ, in priority order:

  1. Lunaris's parsed `params`, once zero padding is stripped (see
     `meaningful_params` -- the array is fixed-width, so all-zero means the
     source states nothing, NOT that it states zero).
  2. When those are silent, Lunaris's own `description` prose, which is a
     separate extraction from Amber's and does state the magnitude.

WHAT IS NOT A SECOND SOURCE. Amber's Chinese locale is a TRANSLATION of Amber's
English -- one extraction rendered twice. Corroborating an English number
against its own Chinese rendering would be the "two mirrors are not two
independent experiments" error, so the CN text is carried for DISPLAY only and
never votes on a value.

WHAT CORROBORATION HERE DOES AND DOES NOT PROVE. Amber ships prose; Lunaris
ships the same bonus pre-parsed into numbers. Agreement is therefore between
two DIFFERENT REPRESENTATIONS produced by two different pipelines, which is a
real check on transcription -- the precise failure mode that produced the table
this generator replaces. It is not independent measurement: both projects
datamine one game binary and share an upstream, the same caveat that surfaced
with the 1-2 star weapon ascension cap. Corroboration is claimed at that
strength and no higher.
"""

from __future__ import annotations

import dataclasses
import re

# --- Buckets ---------------------------------------------------------------
BUCKET_EXPRESSIBLE = "expressible"
BUCKET_UNIMPLEMENTED = "unimplemented"
BUCKET_UNVERIFIED = "unverified"

# --- Reasons ---------------------------------------------------------------
REASON_SOURCE_CONFLICT = "sources disagree about the numbers; every structured claim forfeited"
REASON_NO_VERIFIER = "no verifier source for this set; single-source numbers are not published"
REASON_UNPARSED = "prose could not be reduced to a number without guessing"
REASON_NO_CHANNEL = "numbers are unambiguous but the Buff vocabulary has no channel for this effect"

# Tolerance for comparing a percentage scraped from prose ("15%" -> 0.15) with
# Lunaris's float (0.15000000596046448). The source stores game floats at
# single precision, so exact equality would reject every correct value.
FLOAT_TOLERANCE = 1e-4


# ---------------------------------------------------------------------------
# Element / damage-type vocabulary, mirroring src/types and the buff layer.
# ---------------------------------------------------------------------------

ELEMENTS = {
    "Pyro": "pyro",
    "Hydro": "hydro",
    "Electro": "electro",
    "Cryo": "cryo",
    "Anemo": "anemo",
    "Geo": "geo",
    "Dendro": "dendro",
    "Physical": "physical",
}

# `DamageType` values the engine already understands.
#
# The VALUES here must be exactly `DamageType` in `src/types/index.ts`. The
# game's prose says "Plunging Attack" but the engine's member is `plunge`, not
# `plunging` -- a scope emitted as `plunging` type-checks (the generated
# condition is `readonly string[]`) and then matches NO hit, silently dropping
# the bonus. Keep this table keyed by prose and valued by the engine union.
DAMAGE_TYPES = {
    "Normal Attack": "normal",
    "Charged Attack": "charged",
    "Plunging Attack": "plunge",
    "Elemental Skill": "skill",
    "Elemental Burst": "burst",
}


# ---------------------------------------------------------------------------
# Effects that are CLEARLY NUMERIC but have NO `StatKey` / `BuffCondition`.
#
# Each entry is (regex, what the vocabulary would need). Matching one of these
# forces the UNIMPLEMENTED bucket: the numbers survive, the claim does not.
# ---------------------------------------------------------------------------

NO_CHANNEL_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"Shield Strength", re.I),
     "no `shieldStrength` StatKey; shields are not modelled"),
    (re.compile(r"\bhealing\b|\bheals?\b|\bHealing Bonus\b|healing received|Healing Effectiveness", re.I),
     "no healing/incoming-healing StatKey"),
    (re.compile(r"\bRES\b (?:increased|increases)|Elemental RES to|All Elemental RES|RES increased by", re.I),
     "self RES is a defensive channel; only enemy-side resReduction exists"),
    (re.compile(r"Stamina", re.I),
     "no stamina model"),
    (re.compile(r"Attack SPD|Normal Attack SPD|ATK SPD", re.I),
     "no attack-speed channel; animation timing is not modelled"),
    (re.compile(r"\bCD\b|cooldown|Elemental Skill CD", re.I),
     "cooldown manipulation is engine state, not a Buff modifier"),
    (re.compile(r"regenerates? .*Energy|Energy to all party|restores? .*Energy|Elemental Energy", re.I),
     "energy regeneration is engine state, not a Buff modifier"),
    (re.compile(r"Max HP|restores? \d+ HP|HP over \d", re.I),
     "healing/HP restoration has no StatKey"),
    (re.compile(r"Affected by \w+ for .* less time", re.I),
     "aura-duration reduction is a defensive channel with no representation"),
    (re.compile(r"Moonsign|Gleaming Moon|Lunar[- ]|Stellar[- ]|Nightsoul|Bond of Life|Moondrift|Witch's Homework|Hexerei", re.I),
     "depends on a game system the simulation does not model"),
    (re.compile(r"\bchance\b|\bodds\b", re.I),
     "probabilistic trigger; the simulation path is deterministic by rule"),
    (re.compile(r"Opening a chest|Picking up Mora|Defeating an opponent|After defeating", re.I),
     "out-of-combat or kill trigger that BuffCondition cannot state"),
]


# ---------------------------------------------------------------------------
# The EXPRESSIBLE grammar.
#
# Deliberately narrow: a pattern here asserts "this sentence means exactly this
# modifier". Anything a pattern does not cover falls through to a lower bucket,
# which costs one row. Over-matching costs correctness, which is unrecoverable.
# ---------------------------------------------------------------------------

def _pct(raw: str) -> float:
    """'18' -> 0.18. Percentages are fractions everywhere in the buff layer."""
    return round(float(raw.replace(",", "")) / 100.0, 6)


@dataclasses.dataclass(frozen=True)
class Modifier:
    """One `StatModifier`, matching src/simulation/buffs/types.ts."""

    stat: str
    value: float
    element: str | None = None
    reaction: str | None = None


@dataclasses.dataclass(frozen=True)
class Condition:
    """A `BuffCondition`. Only the fields the grammar can actually justify."""

    damage_types: tuple[str, ...] = ()
    elements: tuple[str, ...] = ()
    requires_on_field: bool | None = None


# Each rule: (pattern, builder). The builder returns (modifiers, condition).
# `None` from a builder means "matched the shape but not confidently" and
# demotes the row rather than emitting a doubtful number.

def _simple_stat(stat: str):
    def build(m: re.Match[str]) -> tuple[list[Modifier], Condition]:
        return [Modifier(stat, _pct(m.group("v")))], Condition()

    return build


def _flat_stat(stat: str):
    def build(m: re.Match[str]) -> tuple[list[Modifier], Condition]:
        return [Modifier(stat, float(m.group("v").replace(",", "")))], Condition()

    return build


def _elemental_dmg(m: re.Match[str]) -> tuple[list[Modifier], Condition]:
    element = ELEMENTS[m.group("e").capitalize()]
    if element == "physical":
        # Physical DMG% is `dmgBonus` gated to physical hits, NOT
        # `elementalDmgBonus` -- physical is not an element in the buff layer.
        return (
            [Modifier("dmgBonus", _pct(m.group("v")))],
            Condition(elements=("physical",)),
        )
    return [Modifier("elementalDmgBonus", _pct(m.group("v")), element=element)], Condition()


def _damage_type_dmg(types: tuple[str, ...]):
    def build(m: re.Match[str]) -> tuple[list[Modifier], Condition]:
        return (
            [Modifier("dmgBonus", _pct(m.group("v")))],
            Condition(damage_types=types),
        )

    return build


EXPRESSIBLE_RULES: list[tuple[re.Pattern[str], object]] = [
    # --- Plain stat lines (the 2-piece bonuses, almost without exception) ---
    (re.compile(r"^ATK \+(?P<v>[\d.]+)%\.?$", re.I), _simple_stat("atkPercent")),
    (re.compile(r"^HP \+(?P<v>[\d.]+)%\.?$", re.I), _simple_stat("hpPercent")),
    (re.compile(r"^DEF \+(?P<v>[\d.]+)%\.?$", re.I), _simple_stat("defPercent")),
    (re.compile(r"^Energy Recharge \+(?P<v>[\d.]+)%\.?$", re.I),
     _simple_stat("energyRecharge")),
    (re.compile(r"^CRIT Rate \+(?P<v>[\d.]+)%\.?$", re.I), _simple_stat("critRate")),
    (re.compile(r"^CRIT DMG \+(?P<v>[\d.]+)%\.?$", re.I), _simple_stat("critDmg")),
    (re.compile(r"^Increases Elemental Mastery by (?P<v>[\d,]+)\.?$", re.I),
     _flat_stat("elementalMastery")),

    # --- Per-element DMG bonus ---------------------------------------------
    (re.compile(
        r"^(?:Gain a |Increases )?(?P<e>Pyro|Hydro|Electro|Cryo|Anemo|Geo|Dendro|Physical)"
        r"\s+DMG(?: Bonus)?(?: is)?\s*(?:\+|increased by\s*)(?P<v>[\d.]+)%\.?$", re.I),
     _elemental_dmg),

    # --- DMG bonus scoped to a damage type ---------------------------------
    (re.compile(r"^Elemental Burst DMG \+(?P<v>[\d.]+)%\.?$", re.I),
     _damage_type_dmg(("burst",))),
    (re.compile(r"^Increases Elemental Skill DMG by (?P<v>[\d.]+)%\.?$", re.I),
     _damage_type_dmg(("skill",))),
    (re.compile(r"^Normal and Charged Attack DMG \+(?P<v>[\d.]+)%\.?$", re.I),
     _damage_type_dmg(("normal", "charged"))),
    (re.compile(r"^Plunging Attack DMG increased by (?P<v>[\d.]+)%\.?$", re.I),
     _damage_type_dmg(("plunge",))),
]


@dataclasses.dataclass(frozen=True)
class Classified:
    """One set bonus, in exactly one bucket."""

    bucket: str
    reason: str | None
    modifiers: tuple[Modifier, ...] = ()
    condition: Condition = Condition()
    #: Numbers recovered from the verifier, kept even when unusable, so an
    #: unimplemented row never has to be re-derived by hand later.
    params: tuple[float, ...] = ()


def _prose_numbers(text: str) -> list[float]:
    """
    Percentages and bare counts mentioned in the prose, as fractions where the
    text writes a percent sign. Used only to CORROBORATE against the verifier.
    """
    found: list[float] = []
    for raw, pct in re.findall(r"(\d[\d,]*(?:\.\d+)?)(%?)", text):
        value = float(raw.replace(",", ""))
        found.append(value / 100.0 if pct else value)
    return found


def meaningful_params(params: tuple[float, ...]) -> tuple[float, ...]:
    """
    Drop the zero padding from a verifier `params` array.

    Lunaris ships every bonus a FIXED-WIDTH array padded with 0.0, so an
    all-zero array means "this source states no number here", not "this source
    says zero". The distinction is the whole ballgame: two sets whose prose is
    the identical string "ATK +18%." ship `[0.0, ...]` (15001) and
    `[0.18, 0.0, ...]` (15023) respectively. Treating the padding as data would
    manufacture a source conflict for 15001 and withhold a correct value --
    failing closed on a bug rather than on evidence, which still corrupts the
    output. Zero is never a legitimate magnitude for any bonus here.
    """
    return tuple(p for p in params if p != 0.0)


def corroborated(modifiers: list[Modifier], params: tuple[float, ...]) -> bool:
    """
    True when every emitted magnitude appears in the verifier's parsed params.

    Lunaris's `params` array is unordered relative to the prose, so this is
    MEMBERSHIP, not positional equality: a value the verifier states
    DIFFERENTLY is a genuine conflict and demotes the row.

    Callers must pass an array already stripped by `meaningful_params` and must
    treat an empty result as SILENCE, which is not agreement and not conflict.
    """
    for modifier in modifiers:
        value = modifier.value
        # Flat stats (EM 80) appear in params raw; fractions appear as floats.
        if not any(abs(value - p) <= FLOAT_TOLERANCE for p in params):
            return False
    return True


def classify(
    text: str,
    params: tuple[float, ...],
    verifier_text: str | None = None,
) -> Classified:
    """
    Decide the bucket for one set bonus.

    `text` is the primary source's prose, `params` the verifier's parsed
    numbers and `verifier_text` the verifier's own prose (used only when its
    params are silent).

    Order matters. The no-channel screen runs FIRST so that a sentence which
    happens to open with a parsable stat phrase but goes on to describe an
    unmodellable mechanism cannot be emitted as though the whole sentence were
    understood.
    """
    flat = " ".join(text.split())
    stated = meaningful_params(params)

    for pattern, need in NO_CHANNEL_PATTERNS:
        if pattern.search(flat):
            return Classified(BUCKET_UNIMPLEMENTED, need, params=stated)

    for pattern, build in EXPRESSIBLE_RULES:
        match = pattern.match(flat)
        if not match:
            continue
        modifiers, condition = build(match)  # type: ignore[operator]
        if not modifiers:
            return Classified(BUCKET_UNVERIFIED, REASON_UNPARSED, params=stated)
        # Verifier check, in three distinct outcomes -- collapsing any two of
        # them is how a fabricated value gets published.
        if not stated:
            # PARAMS SILENT. Fall back to the verifier's own PROSE, which is a
            # separate extraction from Amber's and states the magnitude in
            # text. This is a real second source; what is NOT used as a second
            # source is Amber's Chinese locale, which is a TRANSLATION of
            # Amber's English -- one extraction in two languages. Treating
            # those as two sources is precisely the "two mirrors are not two
            # independent experiments" error.
            if verifier_text is None:
                return Classified(BUCKET_UNVERIFIED, REASON_NO_VERIFIER, params=stated)
            if not corroborated(modifiers, tuple(_prose_numbers(verifier_text))):
                return Classified(
                    BUCKET_UNVERIFIED, REASON_SOURCE_CONFLICT, params=stated
                )
            return Classified(
                BUCKET_EXPRESSIBLE, None, tuple(modifiers), condition, stated
            )
        if not corroborated(modifiers, stated):
            # CONTRADICTION. Never split, never pick the nicer one.
            return Classified(BUCKET_UNVERIFIED, REASON_SOURCE_CONFLICT, params=stated)
        return Classified(
            BUCKET_EXPRESSIBLE, None, tuple(modifiers), condition, stated
        )

    # Anything with a duration, a stack count or a trigger falls here: the
    # numbers may be plain, but the ACTIVATION is prose the condition model
    # cannot state, so it is not expressible as a standing buff.
    if _prose_numbers(flat):
        return Classified(BUCKET_UNIMPLEMENTED, REASON_NO_CHANNEL, params=stated)
    return Classified(BUCKET_UNVERIFIED, REASON_UNPARSED, params=stated)
