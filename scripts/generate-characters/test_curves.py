#!/usr/bin/env python3
"""
Tests for the base-stat curve recovery.

Run with:  python3 scripts/generate-characters/test_curves.py

The curve is DERIVED, not read off a source, so it is exactly the kind of value
that could look plausible while being wrong. These tests pin the two things
that make the derivation trustworthy: that it reproduces the verifier's own
published integers, and that a genuine source disagreement is REPORTED rather
than averaged into a plausible middle.

Stdlib `unittest` only, matching the rest of the generator's zero-dependency rule.
"""

from __future__ import annotations

import glob
import json
import os
import pathlib
import unittest

import curves

CACHE = pathlib.Path(__file__).parent / ".cache"


def _cached_pairs() -> list[tuple[str, dict, dict]]:
    """Every character present in BOTH cached sources."""
    pairs: list[tuple[str, dict, dict]] = []
    for amber_path in sorted(glob.glob(str(CACHE / "amber" / "*.json"))):
        name = os.path.basename(amber_path)
        if name.startswith("_"):
            continue
        lunaris_path = CACHE / "lunaris" / name
        if not lunaris_path.exists():
            continue
        amber = json.loads(pathlib.Path(amber_path).read_text(encoding="utf-8"))
        lunaris = json.loads(lunaris_path.read_text(encoding="utf-8"))
        pairs.append((name, amber["data"], lunaris))
    return pairs


class TestRoundHalfUp(unittest.TestCase):
    """The verifier rounds half-up; Python's `round` does not."""

    def test_half_rounds_up_not_to_even(self) -> None:
        # `round(0.5)` is 0 and `round(2.5)` is 2 under banker's rounding, which
        # would put the recovered curve one integer below the source at every
        # exact half. Spelled out rather than inherited.
        self.assertEqual(curves.round_half_up(0.5), 1)
        self.assertEqual(curves.round_half_up(2.5), 3)
        self.assertEqual(curves.round_half_up(2.4), 2)


class TestConflictIsReportedNotAveraged(unittest.TestCase):
    """
    A source disagreement must produce NO value, not a plausible middle.

    Two characters are constructed whose published values cannot both come from
    one shared multiplier. The correct behaviour is an empty result plus a
    reported conflict — splitting the difference would emit a number neither
    source states, which is the precise failure the audit punished.
    """

    def test_impossible_intervals_yield_no_multiplier(self) -> None:
        observations = [
            curves.CurveObservation(
                curve_type="GROW_CURVE_TEST",
                level=1,
                init_value=100.0,
                ascension_bonus=0.0,
                published=100,  # implies m ~ 1.0
            ),
            curves.CurveObservation(
                curve_type="GROW_CURVE_TEST",
                level=1,
                init_value=100.0,
                ascension_bonus=0.0,
                published=500,  # implies m ~ 5.0 — irreconcilable
            ),
        ]
        solution = curves.solve_curves(observations)
        self.assertEqual(solution.multipliers, {})
        self.assertEqual(len(solution.conflicts), 1)
        self.assertIn("GROW_CURVE_TEST L1", solution.conflicts[0])

    def test_agreeing_observations_yield_a_multiplier(self) -> None:
        observations = [
            curves.CurveObservation(
                curve_type="GROW_CURVE_TEST",
                level=1,
                init_value=100.0,
                ascension_bonus=0.0,
                published=200,
            ),
            curves.CurveObservation(
                curve_type="GROW_CURVE_TEST",
                level=1,
                init_value=50.0,
                ascension_bonus=0.0,
                published=100,
            ),
        ]
        solution = curves.solve_curves(observations)
        self.assertEqual(solution.conflicts, [])
        self.assertAlmostEqual(
            solution.multipliers["GROW_CURVE_TEST"][1], 2.0, places=2
        )


class TestPartialCurveIsNeverEmitted(unittest.TestCase):
    """A curve missing levels must be withheld whole, not emitted with holes."""

    def test_missing_curve_type_returns_none(self) -> None:
        amber_data = {
            "upgrade": {
                "prop": [
                    {
                        "propType": curves.PROP_HP,
                        "initValue": 1000.0,
                        "type": "GROW_CURVE_ABSENT",
                    },
                    {
                        "propType": curves.PROP_ATK,
                        "initValue": 16.0,
                        "type": "GROW_CURVE_ABSENT",
                    },
                    {
                        "propType": curves.PROP_DEF,
                        "initValue": 60.0,
                        "type": "GROW_CURVE_ABSENT",
                    },
                ],
                "promote": [{"promoteLevel": 0, "unlockMaxLevel": 20}],
            }
        }
        solution = curves.CurveSolution(multipliers={}, conflicts=[])
        self.assertIsNone(curves.curve_for_character(amber_data, solution))


class TestAgainstCachedSources(unittest.TestCase):
    """
    The real cross-verification: the recovered curve must reproduce EVERY
    integer the verifier publishes, for every character, at every level 1..90.

    Skipped when the cache is absent so the suite still runs on a clean
    checkout — it is a verification of fetched data, not of the code alone.
    """

    @classmethod
    def setUpClass(cls) -> None:
        cls.pairs = _cached_pairs()  # type: ignore[attr-defined]
        if not cls.pairs:  # type: ignore[attr-defined]
            raise unittest.SkipTest("no fetched cache; run fetch.py first")
        observations: list[curves.CurveObservation] = []
        for _, amber_data, lunaris in cls.pairs:  # type: ignore[attr-defined]
            observations.extend(curves.observations_for(amber_data, lunaris))
        cls.solution = curves.solve_curves(observations)  # type: ignore[attr-defined]

    def test_no_curve_conflicts_in_the_cached_sources(self) -> None:
        self.assertEqual(self.solution.conflicts, [])

    def test_every_published_value_is_reproduced_exactly(self) -> None:
        checked = 0
        for name, amber_data, lunaris in self.pairs:
            curve = curves.curve_for_character(amber_data, self.solution)
            self.assertIsNotNone(curve, f"{name}: no curve recovered")
            assert curve is not None
            for row in lunaris["info"]["attributes"]:
                level = row["level"]
                if not (
                    curves.MIN_CHARACTER_LEVEL
                    <= level
                    <= curves.MAX_CHARACTER_LEVEL
                ):
                    continue
                for stat in ("hp", "atk", "def"):
                    checked += 1
                    self.assertEqual(
                        curve[stat][level],
                        row[stat],
                        f"{name} {stat} L{level}",
                    )
        # A guard against the loop silently checking nothing.
        self.assertGreater(checked, 30000)

    def test_covers_every_level_from_one_to_ninety(self) -> None:
        _, amber_data, _ = self.pairs[0]
        curve = curves.curve_for_character(amber_data, self.solution)
        assert curve is not None
        for stat in ("hp", "atk", "def"):
            self.assertEqual(
                sorted(curve[stat]),
                list(
                    range(
                        curves.MIN_CHARACTER_LEVEL,
                        curves.MAX_CHARACTER_LEVEL + 1,
                    )
                ),
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
