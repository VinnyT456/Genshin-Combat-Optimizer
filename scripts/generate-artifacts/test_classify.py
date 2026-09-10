#!/usr/bin/env python3
"""
Unit tests for the artifact set-bonus classifier.

Run with:
    python3 -m unittest discover -s scripts/generate-artifacts -p 'test_*.py'

These exist because the classifier is the component that decides what gets
PUBLISHED as a combat number. The failure mode that destroyed the previous
roster was silent: every structural check passed on fabricated data. So these
tests target the decisions, not the shapes -- especially the three that must
never collapse into each other: agreement, silence and contradiction.
"""

from __future__ import annotations

import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import classify as C  # noqa: E402


class TestMeaningfulParams(unittest.TestCase):
    def test_strips_zero_padding(self):
        # Lunaris pads every params array to a fixed width with 0.0.
        self.assertEqual(C.meaningful_params((0.18, 0.0, 0.0, 0.0)), (0.18,))

    def test_all_zero_array_is_silence_not_a_value(self):
        # The distinction that caused a 30-row false "source conflict" when it
        # was missing: an all-zero array states nothing, it does not state zero.
        self.assertEqual(C.meaningful_params((0.0, 0.0, 0.0)), ())


class TestExpressible(unittest.TestCase):
    def test_flat_atk_percent_with_agreeing_params(self):
        result = C.classify("ATK +18%.", (0.18000000715255737, 0.0))
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)
        self.assertEqual(result.modifiers[0].stat, "atkPercent")
        self.assertAlmostEqual(result.modifiers[0].value, 0.18)

    def test_elemental_dmg_bonus_carries_its_element(self):
        result = C.classify("Dendro DMG Bonus +15%.", (0.15000000596046448,))
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)
        self.assertEqual(result.modifiers[0].stat, "elementalDmgBonus")
        self.assertEqual(result.modifiers[0].element, "dendro")

    def test_physical_is_a_gated_dmg_bonus_not_an_element(self):
        # `elementalDmgBonus` has no "physical" member in the buff layer, so
        # physical must become `dmgBonus` gated to physical hits.
        result = C.classify("Physical DMG +25%", (), "Physical DMG +25%")
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)
        self.assertEqual(result.modifiers[0].stat, "dmgBonus")
        self.assertEqual(result.condition.elements, ("physical",))

    def test_damage_type_scoped_bonus(self):
        result = C.classify("Elemental Burst DMG +20%", (0.2,))
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)
        self.assertEqual(result.condition.damage_types, ("burst",))

    def test_flat_elemental_mastery_is_not_divided_by_100(self):
        result = C.classify("Increases Elemental Mastery by 80.", (80.0,))
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)
        self.assertEqual(result.modifiers[0].value, 80.0)

    def test_verifier_prose_corroborates_when_params_are_silent(self):
        result = C.classify("ATK +18%.", (0.0, 0.0), "ATK +18%.")
        self.assertEqual(result.bucket, C.BUCKET_EXPRESSIBLE)


class TestWithholding(unittest.TestCase):
    def test_contradiction_forfeits_every_structured_claim(self):
        # Never split, never pick the nicer one.
        result = C.classify("ATK +18%.", (0.25,))
        self.assertEqual(result.bucket, C.BUCKET_UNVERIFIED)
        self.assertEqual(result.reason, C.REASON_SOURCE_CONFLICT)
        self.assertEqual(result.modifiers, ())

    def test_contradicting_verifier_prose_also_withholds(self):
        result = C.classify("ATK +18%.", (0.0,), "ATK +25%.")
        self.assertEqual(result.bucket, C.BUCKET_UNVERIFIED)
        self.assertEqual(result.modifiers, ())

    def test_no_verifier_at_all_withholds(self):
        # A single-source number is not published, however plausible it looks.
        result = C.classify("ATK +18%.", (), None)
        self.assertEqual(result.bucket, C.BUCKET_UNVERIFIED)
        self.assertEqual(result.reason, C.REASON_NO_VERIFIER)
        self.assertEqual(result.modifiers, ())


class TestUnimplemented(unittest.TestCase):
    def test_healing_has_no_stat_key(self):
        result = C.classify("Healing Bonus +15%.", (0.15,))
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)
        self.assertEqual(result.modifiers, ())

    def test_numbers_survive_demotion(self):
        # The point of the unimplemented bucket: keep the numbers so nobody has
        # to re-derive them, while refusing to claim they are applied.
        result = C.classify("Healing Bonus +15%.", (0.15,))
        self.assertEqual(result.params, (0.15,))

    def test_probabilistic_effects_are_never_expected_valued(self):
        # Determinism is a project rule; a 36% proc must not become 0.36x.
        result = C.classify(
            "When Normal Attacks hit opponents, there is a 36% chance that it "
            "will trigger Valley Rite.",
            (0.36,),
        )
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)
        self.assertEqual(result.modifiers, ())

    def test_conditional_prose_is_not_emitted_as_a_standing_buff(self):
        # A duration/trigger the condition model cannot state must not be
        # flattened into an unconditional modifier.
        result = C.classify(
            "Using an Elemental Burst increases all party members' ATK by 20% "
            "for 12s. This effect cannot stack.",
            (0.2, 12.0),
        )
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)
        self.assertEqual(result.modifiers, ())

    def test_self_res_is_not_confused_with_enemy_shred(self):
        result = C.classify("All Elemental RES increased by 20%.", (0.2,))
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)
        self.assertEqual(result.modifiers, ())

    def test_unmodelled_game_systems_are_declined(self):
        result = C.classify(
            "While the equipping character is in Nightsoul's Blessing and is "
            "on the field, their DMG dealt is increased by 15%.",
            (0.15,),
        )
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)
        self.assertEqual(result.modifiers, ())

    def test_no_channel_screen_beats_a_parsable_opening_phrase(self):
        # Ordering guard: a sentence that STARTS like a plain stat line but
        # goes on to describe an unmodellable mechanism must not be emitted as
        # though the whole sentence were understood.
        result = C.classify(
            "ATK +18%. Increases Shield Strength by 35%.", (0.18, 0.35)
        )
        self.assertEqual(result.bucket, C.BUCKET_UNIMPLEMENTED)


if __name__ == "__main__":
    unittest.main()
