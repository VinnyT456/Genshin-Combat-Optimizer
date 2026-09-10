#!/usr/bin/env python3
"""
Tests for the constellation / passive prose parser.

Run with:  python3 scripts/generate-characters/test_perks.py

These pin the cases where a REGEX can fabricate a number. That is the same
failure the TASK #028 audit found in hand-authored data, arriving by a
different route, so each one is asserted rather than trusted.

Stdlib `unittest` only, matching the rest of the generator's zero-dependency rule.
"""

from __future__ import annotations

import unittest

import perks


class TestElementalMasteryBacktracking(unittest.TestCase):
    """The guard that stops "10% of ATK" being read as a flat +1 EM."""

    def test_percent_of_atk_is_a_conversion_not_flat_em(self) -> None:
        text = "Flins's Elemental Mastery is increased by 10% of his ATK. The maximum increase obtainable this way is 220."
        modifiers, _ = perks.parse_stat_modifiers(text)
        self.assertEqual(
            [m.stat for m in modifiers],
            [],
            "a percentage-of-ATK clause must not yield a flat EM modifier",
        )

        conversions = perks.parse_conversions(text)
        self.assertEqual(len(conversions), 1)
        self.assertEqual(conversions[0].source_stat, "atk")
        self.assertEqual(conversions[0].target_stat, "elementalMastery")
        self.assertAlmostEqual(conversions[0].ratio, 0.10)
        self.assertEqual(conversions[0].max_cap, 220.0)

    def test_flat_elemental_mastery_still_parses(self) -> None:
        modifiers, _ = perks.parse_stat_modifiers(
            "Elemental Mastery is increased by 125."
        )
        self.assertEqual([(m.stat, m.value) for m in modifiers], [("elementalMastery", 125.0)])

    def test_two_digit_percent_does_not_backtrack(self) -> None:
        """Regression: "by 10%" once matched "1" and passed a bare `(?!%)`."""
        modifiers, _ = perks.parse_stat_modifiers(
            "Elemental Mastery is increased by 10% of his ATK."
        )
        self.assertEqual(modifiers, [])


class TestConversionCaps(unittest.TestCase):
    def test_both_cap_phrasings_are_read(self) -> None:
        for text, expected in (
            (
                "The Traveler's Elemental Mastery is increased by 8% of their ATK. "
                "Up to 160 Elemental Mastery can be gained in this way.",
                160.0,
            ),
            (
                "Flins's Elemental Mastery is increased by 8% of his ATK. "
                "The maximum increase obtainable this way is 160.",
                160.0,
            ),
        ):
            with self.subTest(text=text):
                conversions = perks.parse_conversions(text)
                self.assertEqual(len(conversions), 1)
                self.assertEqual(conversions[0].max_cap, expected)

    def test_unreadable_cap_drops_the_conversion(self) -> None:
        """An uncapped conversion grows without bound, so it is not the safe default."""
        conversions = perks.parse_conversions(
            "ATK is increased by 25% of his DEF, up to a maximum of some unstated amount."
        )
        self.assertEqual(conversions, [])


class TestConditionalDemotion(unittest.TestCase):
    """Effects gated on something `BuffCondition` cannot state must not be claimed."""

    def test_trigger_gated_shred_is_not_expressible(self) -> None:
        text = (
            "Opponents damaged by Kamisato Art: Soumetsu's Frostflake Seki no To "
            "will have their DEF decreased by 30% for 6s."
        )
        _, enemy = perks.parse_stat_modifiers(text)
        self.assertTrue(enemy, "the number itself is readable")
        bucket, _ = perks.classify(text, [], enemy, [], None)
        self.assertEqual(bucket, perks.BUCKET_UNIMPLEMENTED)

    def test_unconditional_scoped_crit_is_expressible(self) -> None:
        text = "Tighnari's Charged Attack CRIT Rate is increased by 15%."
        modifiers, enemy = perks.parse_stat_modifiers(text)
        bucket, _ = perks.classify(text, modifiers, enemy, [], None)
        self.assertEqual(bucket, perks.BUCKET_EXPRESSIBLE)
        self.assertEqual(perks.detect_damage_types(text), ("charged",))

    def test_scope_is_recovered_so_a_buff_is_not_emitted_global(self) -> None:
        self.assertEqual(
            perks.detect_damage_types(
                "Bestial Ascent's Plunging Attack: Charmed Cloudstrider CRIT Rate "
                "increased by 20% and CRIT DMG increased by 40%."
            ),
            ("plunge",),
        )


class TestTalentLevelBoost(unittest.TestCase):
    SLOTS = {"gale blade": "skill", "dandelion breeze": "burst"}

    def test_named_ability_resolves_to_a_slot(self) -> None:
        self.assertEqual(
            perks.parse_talent_level_boost(
                "Increases the Level of <color=#FFD780FF>Gale Blade</color> by 3.\\n"
                "Maximum upgrade level is 15.",
                self.SLOTS,
            ),
            ("skill", 3),
        )

    def test_normal_attack_prefix_is_normalised(self) -> None:
        self.assertEqual(
            perks.parse_talent_level_boost(
                "Increases the Level of Normal Attack: Gale Blade by 3.", self.SLOTS
            ),
            ("skill", 3),
        )

    def test_unknown_ability_is_not_defaulted_to_a_slot(self) -> None:
        self.assertIsNone(
            perks.parse_talent_level_boost(
                "Increases the Level of Some Other Thing by 3.", self.SLOTS
            )
        )

    def test_talent_level_boost_is_expressible(self) -> None:
        """
        CHANGED DELIBERATELY. This used to assert UNIMPLEMENTED, because `Buff`
        had no talent-level channel. Mechanics landed
        `Buff.talentLevelModifiers` and combat wired it through
        `talentLevelSeam.ts`, so the blocker this test encoded is gone and a
        talent-level boost is now genuinely simulatable.
        """
        bucket, reason = perks.classify("", [], [], [], ("skill", 3))
        self.assertEqual(bucket, perks.BUCKET_EXPRESSIBLE)
        self.assertIsNone(reason)

    def test_talent_level_boost_beats_the_conditional_demotion(self) -> None:
        """
        A boost stays expressible even when the row's OTHER sentence is gated.
        The clause naming the talent is itself unconditional, and the boost is
        the only claim emitted from the row.
        """
        text = "Increases the Level of Gale Blade by 3. While the field persists, ATK is increased."
        bucket, _ = perks.classify(text, [], [], [], ("skill", 3))
        self.assertEqual(bucket, perks.BUCKET_EXPRESSIBLE)

    def test_source_conflict_still_forfeits_a_talent_level_boost(self) -> None:
        """
        Reclassifying to EXPRESSIBLE must NOT weaken the two-source rule: a
        contradicted row drops its boost before `classify` is consulted, so the
        withheld-on-conflict path is unaffected by the promotion.
        """
        bucket, reason = perks.classify("", [], [], [], None)
        self.assertEqual(bucket, perks.BUCKET_UNVERIFIED)
        self.assertEqual(reason, perks.REASON_UNPARSED)


class TestUnverifiedReasons(unittest.TestCase):
    def test_number_present_but_effect_unrecognised(self) -> None:
        bucket, reason = perks.classify(
            "Increases the pulling speed of Gale Blade and increases the DMG dealt by 40%.",
            [],
            [],
            [],
            None,
        )
        self.assertEqual(bucket, perks.BUCKET_UNVERIFIED)
        self.assertEqual(reason, perks.REASON_UNRECOGNISED_EFFECT)

    def test_no_number_at_all(self) -> None:
        bucket, reason = perks.classify(
            "Palm Vortex pulls in opponents and objects.", [], [], [], None
        )
        self.assertEqual(bucket, perks.BUCKET_UNVERIFIED)
        self.assertEqual(reason, perks.REASON_UNPARSED)


class TestMarkupStripping(unittest.TestCase):
    def test_colour_link_and_layout_markup_are_removed(self) -> None:
        self.assertEqual(
            perks.strip_markup(
                "When casting <color=#FFD780FF>Claw and Thunder</color> "
                "({LAYOUT_MOBILE#Tap}{LAYOUT_PC#Press}{LAYOUT_PS#Press})"
            ),
            "When casting Claw and Thunder (Tap)",
        )

    def test_numbers_survive_stripping(self) -> None:
        self.assertEqual(
            perks.numbers_in(perks.strip_markup("DEF decreased by <color=#FFFFFFFF>15%</color> for 7s.")),
            ["15%", "7"],
        )


class TestVerifierPassiveAlignment(unittest.TestCase):
    """
    The two sources pack passives differently, so the primary's slot ordinal is
    NOT a key into the verifier.

    Raiden Shogun is the roster's real case: the primary publishes a blank
    talent slot before "All-Preserver", so it sits at slot ordinal 4 while the
    verifier packs it densely at `p3` and publishes `p4` as an empty string.
    Keying the comparison on the ordinal compared a real row against nothing and
    reported a source conflict between two sources that AGREE -- a false
    conflict, which is exactly as damaging as a missed one because it withholds
    data the sources actually corroborate.
    """

    @staticmethod
    def _amber(passives: list[tuple[str, str]]) -> dict:
        talent = {
            str(index): {"type": perks.TALENT_TYPE_PASSIVE, "name": name, "description": text}
            for index, (name, text) in enumerate(passives)
        }
        return {"data": {"name": "Test", "talent": talent, "constellation": {}}}

    def test_blank_primary_slot_does_not_desync_the_verifier_lookup(self) -> None:
        amber = self._amber(
            [
                ("Wishes Unnumbered", "Restores 1 Energy."),
                ("Enlightened One", "Increases DEF by 30%."),
                ("", ""),
                ("All-Preserver", "Mora expended is decreased by 50%."),
            ]
        )
        lunaris = {
            "passives": {
                "p1": {"name": "Wishes Unnumbered", "description": "Restores 1 Energy."},
                "p2": {"name": "Enlightened One", "description": "Increases DEF by 30%."},
                "p3": {
                    "name": "All-Preserver",
                    "description": "Mora expended is decreased by 50%.",
                },
                "p4": "",
            }
        }
        rows, conflicts = perks.parse_perks(amber, lunaris)

        self.assertEqual(conflicts, [])
        self.assertEqual([row.name for row in rows], ["Wishes Unnumbered", "Enlightened One", "All-Preserver"])

    def test_a_genuinely_absent_verifier_row_is_still_reported(self) -> None:
        """The alignment fix must not become a way to silence real gaps."""
        amber = self._amber([("Only Passive", "Deals 40% more DMG.")])
        rows, conflicts = perks.parse_perks(amber, {"passives": {}})

        self.assertEqual(len(conflicts), 1)
        self.assertIn("verifier publishes no row", conflicts[0])
        self.assertEqual(rows[0].bucket, perks.BUCKET_UNVERIFIED)

    def test_a_real_numeric_disagreement_is_still_a_conflict(self) -> None:
        """Name-keyed lookup must compare values, not merely find a match."""
        amber = self._amber([("Shared Name", "Increases ATK by 20%.")])
        lunaris = {"passives": {"p1": {"name": "Shared Name", "description": "Increases ATK by 40%."}}}
        rows, conflicts = perks.parse_perks(amber, lunaris)

        self.assertEqual(len(conflicts), 1)
        self.assertEqual(rows[0].bucket, perks.BUCKET_UNVERIFIED)
        self.assertEqual(rows[0].reason, perks.REASON_SOURCE_CONFLICT)


if __name__ == "__main__":
    unittest.main(verbosity=2)
