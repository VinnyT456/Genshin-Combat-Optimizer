"""Offline publication-boundary tests for the character emitter."""

from __future__ import annotations

import unittest

import emit
import parse
import perks


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


class TestStructuredPerkBuff(unittest.TestCase):
    def test_emits_direct_modifiers_with_damage_scope(self) -> None:
        row = perks.ParsedPerk(
            kind="constellation",
            level=1,
            unlock_ascension=None,
            id_suffix="c1",
            name="Charged Focus",
            text="Charged Attack CRIT Rate is increased by 15%.",
            bucket=perks.BUCKET_EXPRESSIBLE,
            modifiers=(perks.ParsedModifier(stat="critRate", value=0.15),),
            damage_types=("charged",),
        )
        buff = emit.emit_structured_perk_buff("test", row)
        self.assertIsNotNone(buff)
        assert buff is not None
        self.assertIn('conditions: { damageTypes: ["charged"] }', buff)
        self.assertIn('modifiers: [{ stat: "critRate", value: 0.15 }]', buff)
        self.assertIn('targets: { scope: "self" }', buff)

    def test_keeps_talent_boost_unscoped_by_hit_type(self) -> None:
        row = perks.ParsedPerk(
            kind="constellation",
            level=3,
            unlock_ascension=None,
            id_suffix="c3",
            name="Talent Crown",
            text="Increases the Level of Normal Attack: Test by 3.",
            bucket=perks.BUCKET_EXPRESSIBLE,
            damage_types=("normal",),
            talent_level_boost=("normal", 3),
        )
        buff = emit.emit_structured_perk_buff("test", row)
        self.assertIsNotNone(buff)
        assert buff is not None
        self.assertNotIn("conditions:", buff)
        self.assertIn('talentLevelModifiers: [{ slot: "normal", levels: 3 }]', buff)


if __name__ == "__main__":
    unittest.main()
