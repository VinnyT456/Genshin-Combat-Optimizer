"""Offline publication-boundary tests for the character emitter."""

from __future__ import annotations

import unittest

import emit
import parse


def _ability(label: str = "Skill DMG") -> parse.ParsedAbility:
    instance = parse.DamageInstance(
        label=label,
        terms=(parse.ScalingTerm(stat="atk", table=(0.5, 0.6)),),
        repeat=1,
        source_label=label,
        source_index=0,
    )
    return parse.ParsedAbility(
        name="Test Skill",
        slot="skill",
        variant=None,
        instances=(instance,),
        cooldown=10,
        energy_cost=None,
    )


class TestWithholdUnverifiedAbilities(unittest.TestCase):
    def test_agreeing_source_is_retained(self) -> None:
        retained, notes, checked, agreed = emit.withhold_unverified_abilities(
            [_ability()], {"elementalskill": {"skill dmg": [[0.5], [0.6]]}}
        )
        self.assertEqual(retained, [_ability()])
        self.assertEqual(notes, [])
        self.assertEqual((checked, agreed), (2, 2))

    def test_conflicting_value_withholds_whole_ability(self) -> None:
        retained, notes, checked, agreed = emit.withhold_unverified_abilities(
            [_ability()], {"elementalskill": {"skill dmg": [[0.5], [0.61]]}}
        )
        self.assertEqual(retained, [])
        self.assertEqual((checked, agreed), (2, 1))
        self.assertEqual(len(notes), 1)
        self.assertIn("conflicting", notes[0][1])
        self.assertIn("L2", notes[0][1])

    def test_missing_verifier_row_withholds_ability(self) -> None:
        retained, notes, checked, agreed = emit.withhold_unverified_abilities(
            [_ability()], {"elementalskill": {}}
        )
        self.assertEqual(retained, [])
        self.assertEqual((checked, agreed), (0, 0))
        self.assertEqual(len(notes), 1)
        self.assertIn("evidence missing", notes[0][1])
        self.assertIn("no Lunaris row", notes[0][1])


if __name__ == "__main__":
    unittest.main()
