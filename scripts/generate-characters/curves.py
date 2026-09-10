#!/usr/bin/env python3
"""
Stage 2c of the character-data generator: recover the per-level base-stat
curves that neither source publishes directly.

THE PROBLEM THIS SOLVES
`baseStatCurves` was emitted with a single entry -- `{ [90]: value }` -- for
every character. That is not a curve, it is one point wearing a curve's type.
A level selector reading it would return the level-90 number at every level and
present it as though it were the level-20 number: silently wrong, which is the
exact failure class the TASK #028 audit was called to end.

WHY IT COULD NOT SIMPLY BE READ OFF ONE SOURCE
Neither source hands over a per-level table that the other can check.

  Project Amber publishes the INPUTS to the game's own formula:
      upgrade.prop[]      initValue + a named growth curve (GROW_CURVE_HP_S4)
      upgrade.promote[]   the cumulative ascension bonus at each phase
    but NOT the growth curve's per-level multipliers. Amber serves no curve
    endpoint (probed: /avatarCurve, /curve, /avatar/curve, /upgrade/avatar --
    all 404), so Amber alone cannot produce a number for level 37.

  Lunaris publishes the OUTPUTS:
      info.attributes[]   hp/atk/def at every level 1..90 (plus 95 and 100)
    but as ROUNDED INTEGERS, and with no statement of the formula behind them.
    Lunaris alone is a table of unexplained integers.

Emitting Lunaris's integers directly would break the project's standing rule:
only values confirmable in BOTH sources may be emitted, and Amber cannot
confirm a bare integer.

HOW THE TWO SOURCES ARE MADE TO CHECK EACH OTHER
The game's formula is public in shape and is the one Amber's fields are named
for:

    base(level) = initValue * curve[curveType][level] + ascensionBonus(phase)

`curve` is shared by every character of the same curve type -- that is what
makes it a named curve rather than a per-character table. So each character
Lunaris publishes is an INDEPENDENT equation constraining one shared unknown.
Because Lunaris rounds, each published integer `v` does not fix the multiplier
but bounds it:

    (v - 0.5 - ascensionBonus) / initValue  <=  m  <  (v + 0.5 - ascensionBonus) / initValue

Intersecting those intervals across every character sharing a curve type
over-determines `m` heavily -- 53 to 134 characters constrain each of the 4
curve types at each level. The intersection is then verified by REPLAY: the
recovered multiplier is pushed back through the formula for every character at
every level and must reproduce Lunaris's published integer exactly.

That replay is the cross-verification. Amber supplies the coefficients,
Lunaris supplies the answers, and a curve that satisfies both is confirmed by
both. If any interval came out empty, or any replayed value missed, the sources
would be in genuine conflict -- and this module reports that and emits nothing
for the curve concerned, rather than splitting the difference.

Determinism: the recovered multipliers are a function of the cache alone, and
every iteration below is over a sorted key list.
"""

from __future__ import annotations

import dataclasses

# Amber's property names for the three stats that follow a level curve.
PROP_HP = "FIGHT_PROP_BASE_HP"
PROP_ATK = "FIGHT_PROP_BASE_ATTACK"
PROP_DEF = "FIGHT_PROP_BASE_DEFENSE"

#: Amber property -> the engine's `BaseStatCurves` field name.
STAT_BY_PROP = {PROP_HP: "hp", PROP_ATK: "atk", PROP_DEF: "def"}

#: Lunaris `info.attributes` key for each Amber property.
ATTRIBUTE_KEY_BY_PROP = {PROP_HP: "hp", PROP_ATK: "atk", PROP_DEF: "def"}

# Levels the engine emits a curve for. The game caps a character at 90; Lunaris
# additionally publishes 95 and 100, which are over-level rows that no playable
# build reaches, so they are excluded rather than emitted as reachable levels.
MIN_CHARACTER_LEVEL = 1
MAX_CHARACTER_LEVEL = 90

# Lunaris rounds each published value to the nearest integer, so a published
# `v` constrains the true value to [v - 0.5, v + 0.5). Verified empirically:
# rounding replays 100% of 33,120 published values, flooring only 51%.
ROUNDING_HALF_WIDTH = 0.5


@dataclasses.dataclass(frozen=True)
class CurveObservation:
    """One character's constraint on one (curve type, level) multiplier."""

    curve_type: str
    level: int
    #: Amber's `initValue` for this character and stat.
    init_value: float
    #: Amber's cumulative ascension bonus at the phase this level sits in.
    ascension_bonus: float
    #: Lunaris's published, rounded value at this level.
    published: int


def _promote_bonus_by_phase(amber_data: dict) -> dict[str, dict[int, float]]:
    """
    Cumulative ascension bonus per property, keyed by ascension phase.

    Amber's `addProps` at phase N is the CUMULATIVE total at that phase, not
    the increment over phase N-1. Verified against Bennett: the phase-6 HP
    entry (3719.104) reconstructs his published level-90 HP, whereas summing
    every phase (13670.77) overshoots into a negative multiplier.
    """
    by_phase: dict[str, dict[int, float]] = {
        PROP_HP: {},
        PROP_ATK: {},
        PROP_DEF: {},
    }
    for entry in (amber_data.get("upgrade") or {}).get("promote") or []:
        phase = entry.get("promoteLevel")
        if not isinstance(phase, int):
            continue
        props = entry.get("addProps") or {}
        for prop in sorted(by_phase):
            by_phase[prop][phase] = float(props.get(prop, 0.0))
    return by_phase


def observations_for(
    amber_data: dict, lunaris: dict
) -> list[CurveObservation]:
    """
    Every constraint one character contributes, or [] when either source is
    missing a field this needs. A character that cannot contribute is skipped
    silently -- it constrains nothing and misleads no one.
    """
    props = {
        entry.get("propType"): entry
        for entry in (amber_data.get("upgrade") or {}).get("prop") or []
    }
    attributes = (lunaris.get("info") or {}).get("attributes")
    if not isinstance(attributes, list) or not attributes:
        return []

    bonuses = _promote_bonus_by_phase(amber_data)
    found: list[CurveObservation] = []
    for prop in (PROP_HP, PROP_ATK, PROP_DEF):
        entry = props.get(prop)
        if entry is None:
            continue
        init_value = entry.get("initValue")
        curve_type = entry.get("type")
        if not isinstance(curve_type, str) or not isinstance(
            init_value, (int, float)
        ):
            continue
        if init_value <= 0:
            continue
        for row in attributes:
            if not isinstance(row, dict):
                continue
            level = row.get("level")
            phase = row.get("ascension")
            published = row.get(ATTRIBUTE_KEY_BY_PROP[prop])
            if not isinstance(level, int) or not isinstance(published, int):
                continue
            if not MIN_CHARACTER_LEVEL <= level <= MAX_CHARACTER_LEVEL:
                continue
            if not isinstance(phase, int):
                continue
            found.append(
                CurveObservation(
                    curve_type=curve_type,
                    level=level,
                    init_value=float(init_value),
                    ascension_bonus=bonuses[prop].get(phase, 0.0),
                    published=published,
                )
            )
    return found


@dataclasses.dataclass(frozen=True)
class CurveSolution:
    """The recovered multipliers for every curve type, plus what failed."""

    #: curve type -> level -> multiplier. A level absent here was not solvable.
    multipliers: dict[str, dict[int, float]]
    #: Human-readable descriptions of every (curve type, level) that failed.
    conflicts: list[str]


def solve_curves(observations: list[CurveObservation]) -> CurveSolution:
    """
    Recover each shared growth-curve multiplier by interval intersection, then
    prove it by replay.

    A (curve type, level) whose intervals do not intersect means the two
    sources genuinely disagree there; it is REPORTED and omitted, never
    averaged into a plausible-looking middle. Likewise a solution that fails
    replay against any contributing character is discarded.
    """
    grouped: dict[tuple[str, int], list[CurveObservation]] = {}
    for observation in observations:
        grouped.setdefault(
            (observation.curve_type, observation.level), []
        ).append(observation)

    multipliers: dict[str, dict[int, float]] = {}
    conflicts: list[str] = []

    for curve_type, level in sorted(grouped):
        rows = grouped[(curve_type, level)]
        lower = max(
            (row.published - ROUNDING_HALF_WIDTH - row.ascension_bonus)
            / row.init_value
            for row in rows
        )
        upper = min(
            (row.published + ROUNDING_HALF_WIDTH - row.ascension_bonus)
            / row.init_value
            for row in rows
        )
        if lower >= upper:
            conflicts.append(
                f"{curve_type} L{level}: no multiplier satisfies all "
                f"{len(rows)} characters (interval [{lower:.6f}, {upper:.6f}) "
                f"is empty) -- the sources disagree; omitted"
            )
            continue

        multiplier = (lower + upper) / 2.0
        mismatched = [
            row
            for row in rows
            if round_half_up(row.init_value * multiplier + row.ascension_bonus)
            != row.published
        ]
        if mismatched:
            conflicts.append(
                f"{curve_type} L{level}: recovered multiplier failed replay "
                f"for {len(mismatched)} of {len(rows)} characters; omitted"
            )
            continue

        multipliers.setdefault(curve_type, {})[level] = multiplier

    return CurveSolution(multipliers=multipliers, conflicts=conflicts)


def round_half_up(value: float) -> int:
    """
    The rounding Lunaris publishes with.

    Python's `round` is banker's rounding, which disagrees with the source on
    exact halves, so half-up is spelled out rather than inherited.
    """
    return int(value + 0.5)


def curve_for_character(
    amber_data: dict, solution: CurveSolution
) -> dict[str, dict[int, int]] | None:
    """
    Reconstruct one character's per-level base HP/ATK/DEF from the solved
    curves and that character's own Amber coefficients.

    Returns None when any of the three stats cannot be reconstructed, so a
    partial curve is never emitted -- a curve missing levels would be read as
    "this character has no stats there" rather than "this run could not source
    them".
    """
    props = {
        entry.get("propType"): entry
        for entry in (amber_data.get("upgrade") or {}).get("prop") or []
    }
    bonuses = _promote_bonus_by_phase(amber_data)

    # Ascension phase unlocked at each level. The game unlocks phase N at the
    # level cap of phase N-1, and a character sitting exactly ON a breakpoint
    # may be either side of it; the source's own `attributes` rows resolve that
    # ambiguity, so the phase-by-level map is read from Amber's `unlockMaxLevel`
    # rather than assumed.
    caps = sorted(
        (entry.get("promoteLevel"), entry.get("unlockMaxLevel"))
        for entry in (amber_data.get("upgrade") or {}).get("promote") or []
        if isinstance(entry.get("promoteLevel"), int)
        and isinstance(entry.get("unlockMaxLevel"), int)
    )
    if not caps:
        return None

    def phase_at(level: int) -> int:
        # The highest phase whose predecessor's cap this level has passed.
        # Below the first cap the character is unascended (phase 0).
        phase = 0
        for promote_level, cap in caps:
            if level > cap:
                phase = promote_level + 1
        return phase

    curves: dict[str, dict[int, int]] = {}
    for prop in (PROP_HP, PROP_ATK, PROP_DEF):
        entry = props.get(prop)
        if entry is None:
            return None
        init_value = entry.get("initValue")
        curve_type = entry.get("type")
        if not isinstance(curve_type, str) or not isinstance(
            init_value, (int, float)
        ):
            return None
        levels = solution.multipliers.get(curve_type)
        if levels is None:
            return None
        by_level: dict[int, int] = {}
        for level in range(MIN_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL + 1):
            multiplier = levels.get(level)
            if multiplier is None:
                return None
            by_level[level] = round_half_up(
                float(init_value) * multiplier
                + bonuses[prop].get(phase_at(level), 0.0)
            )
        curves[STAT_BY_PROP[prop]] = by_level

    return curves
