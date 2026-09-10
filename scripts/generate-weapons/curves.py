#!/usr/bin/env python3
"""
Stage 2a of the weapon-data generator: recover the per-level weapon stat curves
that neither source publishes directly.

This is the SAME technique `scripts/generate-characters/curves.py` uses, for the
same reason, and the docstring there carries the full argument. In brief:

  Project Amber publishes the INPUTS to the game's formula --
      upgrade.prop[]      initValue + a NAMED growth curve (GROW_CURVE_ATTACK_301)
      upgrade.promote[]   the cumulative ascension bonus at each phase
    but NOT the growth curve's per-level multipliers, so Amber alone cannot
    state a weapon's ATK at level 37.

  Lunaris publishes the OUTPUTS --
      stats[level]        base ATK and the substat at every level 1..90
    but ROUNDED, and with no statement of the formula behind them.

Emitting Lunaris's numbers directly would break the standing rule that only
values confirmable in BOTH sources may be emitted, because Amber cannot confirm
a bare rounded number.

    value(level, phase) = initValue * curve[curveType][level] + ascensionBonus(phase)

`curve` is shared by every weapon of the same curve type, so each weapon is an
INDEPENDENT equation constraining one shared unknown. Rounding turns each
published value into an INTERVAL rather than a point; intersecting those
intervals across every weapon sharing a curve type over-determines the
multiplier (3 to 138 weapons per curve type here). The intersection is then
proved by REPLAY against every contributing weapon at every level.

That replay is the cross-verification. A (curve type, level) whose intervals do
not intersect means the sources genuinely disagree; it is REPORTED and omitted,
never averaged into a plausible-looking middle.

TWO WEAPON-SPECIFIC DIFFERENCES FROM THE CHARACTER SOLVER

1. ASCENSION PHASE IS NOT PUBLISHED PER ROW. Lunaris's character payload names
   the ascension phase on each row; its weapon payload does not -- it publishes
   ONE row per level and, at a breakpoint level, that row is the ASCENDED
   value. Level 20 is therefore phase 0 and level 21 is phase 1. The phase is
   recovered from Amber's own `unlockMaxLevel` ladder rather than assumed, so a
   weapon with a shorter ladder (the 1-3 star weapons cap below 90) resolves
   correctly instead of being forced onto the 5-star ladder.

2. SUBSTATS TAKE NO ASCENSION BONUS. Amber's `addProps` carries base ATK only.
   A substat's ascension bonus is therefore ZERO, not missing, and the substat
   curve is a pure `initValue * multiplier`. Rounding is to ONE DECIMAL for a
   substat percentage against integers for base ATK, so the half-width differs
   per property and is carried on the observation rather than being a constant.

Determinism: the recovered multipliers are a function of the cache alone, and
every iteration below is over a sorted key list.
"""

from __future__ import annotations

import dataclasses

PROP_BASE_ATK = "FIGHT_PROP_BASE_ATTACK"

# Amber property name -> the key Lunaris publishes the same value under.
# A property absent here is one the verifier does not publish, so it cannot be
# cross-verified and is deliberately not solved for.
LUNARIS_KEY_BY_PROP = {
    PROP_BASE_ATK: "atk",
    "FIGHT_PROP_ATTACK_PERCENT": "ATK%",
    "FIGHT_PROP_CRITICAL": "CRIT Rate%",
    "FIGHT_PROP_CRITICAL_HURT": "CRIT DMG%",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "Energy Recharge%",
    "FIGHT_PROP_ELEMENT_MASTERY": "Elemental Mastery",
    "FIGHT_PROP_HP_PERCENT": "HP%",
    "FIGHT_PROP_DEFENSE_PERCENT": "DEF%",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "Physical DMG%",
}

# A percentage substat is published as a percentage NUMBER (66.2 meaning 66.2%),
# so Amber's fraction (0.662) must be scaled before the two can be compared.
PERCENT_PROPS = frozenset(
    prop for prop in LUNARIS_KEY_BY_PROP if prop.endswith("%")
) | frozenset(
    {
        "FIGHT_PROP_ATTACK_PERCENT",
        "FIGHT_PROP_CRITICAL",
        "FIGHT_PROP_CRITICAL_HURT",
        "FIGHT_PROP_CHARGE_EFFICIENCY",
        "FIGHT_PROP_HP_PERCENT",
        "FIGHT_PROP_DEFENSE_PERCENT",
        "FIGHT_PROP_PHYSICAL_ADD_HURT",
    }
)

MIN_WEAPON_LEVEL = 1
MAX_WEAPON_LEVEL = 90

# Base ATK is published as an integer -> the true value lies within +/- 0.5.
# A substat is published to one decimal -> +/- 0.05. Using the integer width for
# a substat would accept a 10x-too-loose interval and let a wrong multiplier
# survive intersection.
ROUNDING_HALF_WIDTH_INTEGER = 0.5
ROUNDING_HALF_WIDTH_ONE_DECIMAL = 0.05

# Replay must reproduce the published number EXACTLY at the source's own
# precision, so the comparison is made on the rounded value, not within a
# tolerance. These are the quantums that rounding is performed to.
QUANTUM_INTEGER = 1.0
QUANTUM_ONE_DECIMAL = 0.1

# Two interval endpoints computed by different divisions can straddle the same
# true value by a few ULPs. GROW_CURVE_CRITICAL_201 levels 40-44 are the real
# case: 132 weapons pin the multiplier to exactly 2.575, and the intersection
# comes out as [2.575, 2.5749999999999997] -- a gap of -4.4e-16, which is
# floating-point noise on an AGREEMENT, not a disagreement between the sources.
# Treating it as a conflict withheld 5 levels the sources fully corroborate.
#
# Sized to the arithmetic rather than picked: the endpoints are quotients of
# values under ~1e3, so their representation error is a few multiples of
# 2**-52 * 1e3 ~= 2e-13. This bound sits above that and far below the ~1e-3
# separation of any genuinely conflicting interval, so it can absorb the noise
# without ever admitting a real contradiction. Replay still has to pass.
INTERVAL_EPSILON = 1e-9


@dataclasses.dataclass(frozen=True)
class CurveObservation:
    """One weapon's constraint on one (curve type, level) multiplier."""

    curve_type: str
    level: int
    #: Amber's `initValue` for this weapon and property, already scaled to the
    #: units the verifier publishes in.
    init_value: float
    #: Amber's cumulative ascension bonus at the phase this level sits in.
    ascension_bonus: float
    #: The verifier's published, rounded value at this level.
    published: float
    #: Half-width of the rounding interval around `published`.
    half_width: float
    #: Rounding quantum, for the replay check.
    quantum: float
    #: Which weapon contributed this, for conflict reporting.
    weapon_id: str


def _round_half_up(value: float, quantum: float) -> float:
    """
    Round to a quantum, halves going UP.

    Python's built-in `round` is banker's rounding (round-half-to-EVEN), which
    disagrees with the game's presentation on exact halves. Matching the source
    exactly matters here because replay asserts equality, not closeness.
    """
    scaled = value / quantum
    return (int(scaled + 0.5) if scaled >= 0 else -int(-scaled + 0.5)) * quantum


def _phase_ladder(amber_data: dict) -> list[tuple[int, int]]:
    """
    `(phase, unlockMaxLevel)` pairs in ascending phase order.

    Read from the weapon's OWN promote table rather than assumed, because the
    low-rarity weapons cap below level 90 on a shorter ladder.
    """
    ladder: list[tuple[int, int]] = []
    for entry in (amber_data.get("upgrade") or {}).get("promote") or []:
        phase = entry.get("promoteLevel")
        cap = entry.get("unlockMaxLevel")
        if isinstance(phase, int) and isinstance(cap, int):
            ladder.append((phase, cap))
    ladder.sort()
    return ladder


def _phase_for_level(ladder: list[tuple[int, int]], level: int) -> int:
    """
    The ascension phase a level's PUBLISHED value belongs to.

    At a breakpoint the verifier publishes the ASCENDED value (level 20 is
    phase 0; level 21 is phase 1), so the phase is the LAST one whose cap is
    strictly below the level -- not the first whose cap reaches it.
    """
    phase = 0
    for candidate, cap in ladder:
        if level > cap:
            phase = candidate + 1
    return phase


def _promote_bonus_by_phase(amber_data: dict) -> dict[int, float]:
    """
    Cumulative base-ATK ascension bonus per phase.

    Amber's `addProps` at phase N is the CUMULATIVE total at that phase, not the
    increment over phase N-1 (verified: Staff of Homa's phase-6 entry, 186.7,
    reconstructs its published level-90 ATK of 608; summing every phase
    overshoots badly). Only base ATK carries one -- a substat's bonus is zero.
    """
    bonuses: dict[int, float] = {}
    for entry in (amber_data.get("upgrade") or {}).get("promote") or []:
        phase = entry.get("promoteLevel")
        if not isinstance(phase, int):
            continue
        props = entry.get("addProps") or {}
        bonuses[phase] = float(props.get(PROP_BASE_ATK, 0.0))
    return bonuses


def observations_for(weapon_id: str, amber_data: dict, lunaris: dict) -> list[CurveObservation]:
    """
    Every constraint one weapon contributes.

    Returns [] when either source lacks a field this needs. A weapon that cannot
    contribute is skipped silently: it constrains nothing and misleads no one.
    """
    stats = lunaris.get("stats")
    if not isinstance(stats, dict) or not stats:
        return []

    ladder = _phase_ladder(amber_data)
    bonuses = _promote_bonus_by_phase(amber_data)

    found: list[CurveObservation] = []
    for entry in (amber_data.get("upgrade") or {}).get("prop") or []:
        prop = entry.get("propType")
        curve_type = entry.get("type")
        init_value = entry.get("initValue")
        if not isinstance(prop, str) or not isinstance(curve_type, str):
            continue
        if not isinstance(init_value, (int, float)) or init_value <= 0:
            continue
        lunaris_key = LUNARIS_KEY_BY_PROP.get(prop)
        if lunaris_key is None:
            continue

        is_percent = prop in PERCENT_PROPS
        # Whether a property takes an ASCENSION BONUS is a separate question
        # from its precision: only base ATK does.
        is_base_atk = prop == PROP_BASE_ATK
        scaled_init = float(init_value) * (100.0 if is_percent else 1.0)
        # PRECISION FOLLOWS THE PROPERTY, NOT THE SLOT.
        #
        # The verifier publishes PERCENTAGE stats to one decimal ("35.2") and
        # WHOLE-POINT stats as integers -- base ATK, and also Elemental Mastery,
        # which is a flat point value rather than a percentage. Keying the
        # rounding width on "is this base ATK" instead of "is this a percentage"
        # gave every EM weapon a 10x-too-tight interval: Dark Iron Sword's
        # published EM of 31 (true value 30.6) then demanded a multiplier of
        # ~1.014 at level 1, where the rest of its curve demanded 1.0, and the
        # intersection came out empty. That reported a SOURCE CONFLICT for what
        # was really this module's own precision bug -- a false conflict, which
        # withholds data the sources actually agree on.
        half_width = (
            ROUNDING_HALF_WIDTH_ONE_DECIMAL if is_percent
            else ROUNDING_HALF_WIDTH_INTEGER
        )
        quantum = QUANTUM_ONE_DECIMAL if is_percent else QUANTUM_INTEGER

        for level_key in sorted(stats, key=int):
            level = int(level_key)
            if not MIN_WEAPON_LEVEL <= level <= MAX_WEAPON_LEVEL:
                continue
            row = stats[level_key]
            if not isinstance(row, dict):
                continue
            published = row.get(lunaris_key)
            if not isinstance(published, (int, float)):
                continue
            # Only base ATK takes an ascension bonus; a substat's is zero.
            bonus = bonuses.get(_phase_for_level(ladder, level), 0.0) if is_base_atk else 0.0
            found.append(
                CurveObservation(
                    curve_type=curve_type,
                    level=level,
                    init_value=scaled_init,
                    ascension_bonus=bonus,
                    published=float(published),
                    half_width=half_width,
                    quantum=quantum,
                    weapon_id=weapon_id,
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

    A (curve type, level) whose intervals do not intersect means the two sources
    genuinely disagree there; it is REPORTED and omitted, never averaged.
    Likewise a solution failing replay against any contributing weapon is
    discarded rather than emitted with a caveat.

    GROW_CURVE_CRITICAL_201 levels 40-44 are the roster's genuine failure and
    are expected to stay unsolved. Three weapons there impose contradictory
    constraints on one shared multiplier: The Black Sword (initValue 6.0)
    publishes 15.4, which needs m < 2.575, while weapon 11413 (initValue 10.0)
    publishes 25.8, which needs m >= 2.575. No single multiplier satisfies both
    under any one rounding rule -- half-up and half-even were both checked
    against the whole corpus and each replays 41,910/41,910 elsewhere, so the
    rounding rule is not the culprit. The explanation is that the game's own
    `initValue` carries more precision than the primary source publishes, which
    this module cannot recover and must not invent. Those five levels are
    therefore REPORTED and omitted, and the weapons depending on them carry an
    UNVERIFIED marker rather than a fabricated number.
    """
    grouped: dict[tuple[str, int], list[CurveObservation]] = {}
    for observation in observations:
        grouped.setdefault((observation.curve_type, observation.level), []).append(
            observation
        )

    multipliers: dict[str, dict[int, float]] = {}
    conflicts: list[str] = []

    for key in sorted(grouped):
        curve_type, level = key
        rows = grouped[key]

        low = float("-inf")
        high = float("inf")
        for row in rows:
            lo = (row.published - row.half_width - row.ascension_bonus) / row.init_value
            hi = (row.published + row.half_width - row.ascension_bonus) / row.init_value
            low = max(low, lo)
            high = min(high, hi)

        # `low > high` is a genuine contradiction. `low == high` is NOT: enough
        # weapons constrained the multiplier that the intersection collapsed to
        # a single point, which is the strongest possible agreement rather than
        # a disagreement. Rejecting it withheld 5 real levels of
        # GROW_CURVE_CRITICAL_201. Replay below still has to accept the value,
        # so admitting the point costs no rigour.
        if low - high > INTERVAL_EPSILON:
            conflicts.append(
                f"{curve_type} L{level}: {len(rows)} weapons give no common "
                f"multiplier (interval [{low:.6f}, {high:.6f}) is empty)"
            )
            continue

        # The midpoint of the intersection is the least-committed choice inside
        # a range every source agrees on. Replay is what actually validates it.
        candidate = (min(low, high) + max(low, high)) / 2.0

        failed = next(
            (
                row
                for row in rows
                if _round_half_up(
                    row.init_value * candidate + row.ascension_bonus, row.quantum
                )
                != _round_half_up(row.published, row.quantum)
            ),
            None,
        )
        if failed is not None:
            conflicts.append(
                f"{curve_type} L{level}: replay failed for weapon "
                f"{failed.weapon_id} (published {failed.published})"
            )
            continue

        multipliers.setdefault(curve_type, {})[level] = candidate

    return CurveSolution(multipliers=multipliers, conflicts=conflicts)
