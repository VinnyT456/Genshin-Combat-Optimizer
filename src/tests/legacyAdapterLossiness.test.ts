import { describe, expect, it } from "vitest";
import {
  allCharacters,
  findCharacter,
  toLegacyCharacterDefinition,
} from "@/game-data/characters/registry";
import type { PlayableCharacter } from "@/game-data/characters/registry";
import { allAbilities } from "@/simulation/character/character";
import { MAX_TALENT_LEVEL, talentValueAt } from "@/simulation/character/talent";
import type { CharacterDefinition } from "@/types";

// ============================================================================
// `toLegacyCharacterDefinition` — LOSSY BY CONSTRUCTION (TASK #037, qa-engineer)
//
// The legacy `CharacterDefinition` shape holds ONE scalar multiplier per
// ability and hardcodes `scaling: "atk"`. The generated roster holds per-level
// tables scaling off ATK, Max HP, DEF or Elemental Mastery. The adapter
// therefore cannot be faithful, and the interesting question is not WHETHER it
// loses information but HOW it chooses to lose it.
//
// It makes two choices, and this file exists to make both of them EXPENSIVE TO
// REVERSE:
//
//   1. It resolves tables at the character's OWN authored talent level via
//      `talentValueAt`, rather than reading index 0. Reading index 0 would
//      silently report every character's LEVEL-1 numbers while looking
//      perfectly healthy.
//
//   2. It OMITS non-ATK terms rather than folding them into the ATK field. An
//      HP-scaling ability therefore reports multiplier 0 — visibly nothing,
//      instead of invisibly wrong.
//
// Choice 2 is the one under threat. It looks like a bug from the frontend:
// Yelan's skill shows 0 damage. The "obvious fix" is to add the HP coefficient
// into the ATK multiplier so a number appears. That fix would reintroduce
// EXACTLY the category error the TASK #028 audit found — Yelan's 0.407045x Max
// HP authored as ATK 0.407045 — and it would be far harder to detect the
// second time, because the number would be small and plausible rather than
// absent.
//
// A visible zero is the correct failure mode. These tests pin it.
//
// If the legacy shape ever gains a real scaling-stat field, REPLACE this file
// with assertions that the coefficient survives with its stat attached. Do not
// weaken it so that a folded value passes.
// ============================================================================

/** Sums the terms of an ability that scale off `stat`, at `talentLevel`. */
function scaledTermsOf(
  ability: PlayableCharacter["skill"] | undefined,
  stat: string,
  talentLevel: number,
): number {
  return (ability?.instances ?? []).reduce(
    (total, instance) =>
      total +
      instance.scaling
        .filter((scale) => scale.stat === stat)
        .reduce((sum, scale) => sum + talentValueAt(scale.table, talentLevel), 0),
    0,
  );
}

function requireCharacter(id: string): PlayableCharacter {
  const character = findCharacter(id);
  if (character === undefined) {
    throw new Error(`character "${id}" is missing from the registry`);
  }
  return character;
}

describe("toLegacyCharacterDefinition — non-ATK terms are OMITTED, never folded", () => {
  /**
   * The load-bearing case, named explicitly.
   *
   * Yelan's Lingering Lifeline is 0.407045x Max HP at talent 10. The
   * fabricated roster authored it as ATK 3.84 — the audit's headline example
   * of a category error. The adapter must report 0, and it must report 0
   * BECAUSE the term is HP-scaling, not because the ability is missing.
   */
  it("reports 0 for an HP-scaling skill instead of folding the HP coefficient into ATK", () => {
    const yelan = requireCharacter("yelan");
    const legacy = toLegacyCharacterDefinition(yelan);
    const talentLevel = yelan.talentLevels.skill;

    // Precondition: the term really is HP-scaling and really is non-zero.
    const hpTerm = scaledTermsOf(yelan.skill, "hp", talentLevel);
    const atkTerm = scaledTermsOf(yelan.skill, "atk", talentLevel);
    expect(hpTerm, "Yelan's skill no longer scales off HP").toBeGreaterThan(0);
    expect(atkTerm, "Yelan's skill gained an ATK term").toBe(0);

    // The adapter reports the ATK total, which is zero.
    expect(legacy.elementalSkill.multiplier).toBe(0);

    // ...and specifically NOT the HP coefficient wearing an ATK label. Each
    // assertion below blocks one plausible "fix":
    expect(
      legacy.elementalSkill.multiplier,
      "the HP coefficient was folded into the ATK multiplier — this is the audit's category error",
    ).not.toBeCloseTo(hpTerm, 6);
    expect(
      legacy.elementalSkill.multiplier,
      "HP and ATK terms were summed together",
    ).not.toBeCloseTo(hpTerm + atkTerm, 6);
  });

  it("reports 0 for a DEF-scaling skill instead of folding the DEF coefficient into ATK", () => {
    const noelle = requireCharacter("noelle");
    const legacy = toLegacyCharacterDefinition(noelle);
    const talentLevel = noelle.talentLevels.skill;

    const defTerm = scaledTermsOf(noelle.skill, "def", talentLevel);
    expect(defTerm, "Noelle's skill no longer scales off DEF").toBeGreaterThan(0);
    expect(legacy.elementalSkill.multiplier).toBe(0);
    expect(
      legacy.elementalSkill.multiplier,
      "the DEF coefficient was folded into the ATK multiplier",
    ).not.toBeCloseTo(defTerm, 6);
  });

  /**
   * The subtle case: an instance carrying BOTH an ATK term and an EM term.
   *
   * Here the adapter does not report zero — it reports a real, plausible
   * number. So "the value looks wrong" is not available as a signal, and only
   * an exact comparison catches a fold. Nahida's third skill instance is
   * ATK 1.8576 + EM 3.7152 at talent 10; the ATK-only sum across her skill is
   * 5.976, and folding the EM term in would give 9.6912.
   *
   * This is the assertion most likely to catch a well-intentioned regression,
   * because a mixed instance is exactly where "just add them up" feels safe.
   */
  it("drops the EM term from a MIXED ATK+EM instance rather than summing it in", () => {
    const nahida = requireCharacter("nahida");
    const legacy = toLegacyCharacterDefinition(nahida);
    const talentLevel = nahida.talentLevels.skill;

    const atkTerm = scaledTermsOf(nahida.skill, "atk", talentLevel);
    const emTerm = scaledTermsOf(nahida.skill, "elementalMastery", talentLevel);
    expect(atkTerm, "Nahida's skill lost its ATK terms").toBeGreaterThan(0);
    expect(emTerm, "Nahida's skill lost its EM term").toBeGreaterThan(0);

    // Exactly the ATK terms, to the last digit.
    expect(legacy.elementalSkill.multiplier).toBeCloseTo(atkTerm, 9);
    // And not the mixed sum, which is the shape a fold would produce.
    expect(
      legacy.elementalSkill.multiplier,
      "the EM coefficient was summed into the ATK multiplier",
    ).not.toBeCloseTo(atkTerm + emTerm, 6);
  });

  /**
   * The property, over the WHOLE roster rather than three named characters.
   *
   * For every character and every legacy ability slot, the reported multiplier
   * equals the ATK-only sum EXACTLY. A fold anywhere in the roster breaks this,
   * including for a character nobody thought to name.
   */
  it("equals the ATK-only sum for every ability of every character", () => {
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      const { normal, skill, burst } = character.talentLevels;

      const cases: readonly (readonly [
        CharacterDefinition["normalAttack"],
        PlayableCharacter["skill"] | undefined,
        number,
        string,
      ])[] = [
        [legacy.normalAttack, character.normalAttacks.hits[0], normal, "normal"],
        [
          legacy.chargedAttack,
          character.chargedAttack ?? character.normalAttacks.hits[0],
          normal,
          "charged",
        ],
        [legacy.elementalSkill, character.skill, skill, "skill"],
        [legacy.elementalBurst, character.burst, burst, "burst"],
      ];

      for (const [legacyAbility, source, talentLevel, label] of cases) {
        const atkOnly = scaledTermsOf(source, "atk", talentLevel);
        expect(
          legacyAbility.multiplier,
          `${character.id} ${label}: legacy multiplier ${legacyAbility.multiplier} != ATK-only sum ${atkOnly}`,
        ).toBeCloseTo(atkOnly, 9);
      }
    }
  });

  /**
   * The zeros are REACHABLE and NUMEROUS — so the property above is not
   * passing vacuously on a roster where every ability happens to be ATK-only.
   */
  it("produces a visible zero for a real, non-empty set of characters", () => {
    const zeroSkill: string[] = [];
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      if (legacy.elementalSkill.multiplier === 0) zeroSkill.push(character.id);
    }
    expect(
      zeroSkill.length,
      "no character's legacy skill reports 0 — either the roster lost its non-ATK scalers, or the adapter started folding",
    ).toBeGreaterThan(0);
    // Named members, so a shrink to a different set is still caught.
    expect(zeroSkill).toContain("yelan");
    expect(zeroSkill).toContain("noelle");
  });
});

describe("toLegacyCharacterDefinition — resolves at the character's OWN talent level", () => {
  /**
   * The second design choice, pinned against the specific wrong alternative.
   *
   * Reading `table.values[0]` instead of `talentValueAt(table, level)` would
   * report level-1 numbers roster-wide. Every band check, every plausibility
   * check and every "multiplier is positive" test would still pass, because
   * level-1 values are perfectly plausible values — they are just the wrong
   * row. Bennett's N1 makes the difference concrete and externally verifiable:
   * 0.44548 at L1 versus 0.8806 at L10, the audit's known-good value.
   */
  it("uses the authored talent level, not index 0", () => {
    const bennett = requireCharacter("bennett");
    expect(bennett.talentLevels.normal).toBe(10);

    const legacy = toLegacyCharacterDefinition(bennett);
    expect(legacy.normalAttack.multiplier).toBeCloseTo(0.8806, 6);
    // The value index 0 would have produced. Asserting it is DIFFERENT is what
    // makes this a real test rather than a restatement of the line above.
    expect(legacy.normalAttack.multiplier).not.toBeCloseTo(0.44548, 6);
  });

  it("moves with the talent level for every ATK-scaling character", () => {
    for (const character of allCharacters) {
      const atLevel1 = toLegacyCharacterDefinition({
        ...character,
        talentLevels: { normal: 1, skill: 1, burst: 1 },
      });
      const atLevel15 = toLegacyCharacterDefinition({
        ...character,
        talentLevels: {
          normal: MAX_TALENT_LEVEL,
          skill: MAX_TALENT_LEVEL,
          burst: MAX_TALENT_LEVEL,
        },
      });

      // Normal attacks are ATK-scaling for every character in the roster, so
      // this needs no exemption and cannot pass vacuously.
      expect(
        atLevel15.normalAttack.multiplier,
        `${character.id} normal attack does not respond to talent level`,
      ).toBeGreaterThan(atLevel1.normalAttack.multiplier);
    }
  });

  it("resolves cooldowns at the ability's own talent level too", () => {
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      expect(legacy.elementalSkill.cooldown).toBe(
        talentValueAt(character.skill.cooldown, character.talentLevels.skill),
      );
      expect(legacy.elementalBurst.cooldown).toBe(
        talentValueAt(character.burst.cooldown, character.talentLevels.burst),
      );
    }
  });
});

describe("toLegacyCharacterDefinition — the adapter is total and stable", () => {
  it("never emits NaN, Infinity, or a negative multiplier", () => {
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      for (const ability of [
        legacy.normalAttack,
        legacy.chargedAttack,
        legacy.elementalSkill,
        legacy.elementalBurst,
      ]) {
        expect(
          Number.isFinite(ability.multiplier),
          `${character.id} / ${ability.id} multiplier is not finite`,
        ).toBe(true);
        expect(
          ability.multiplier,
          `${character.id} / ${ability.id} multiplier is negative`,
        ).toBeGreaterThanOrEqual(0);
      }
      expect(Number.isFinite(legacy.elementalSkill.cooldown)).toBe(true);
      expect(Number.isFinite(legacy.elementalBurst.cooldown)).toBe(true);
    }
  });

  it("is deterministic — the same character adapts to an identical object", () => {
    for (const character of allCharacters) {
      expect(toLegacyCharacterDefinition(character)).toEqual(
        toLegacyCharacterDefinition(character),
      );
    }
  });

  it("carries identity, element and energy through unchanged", () => {
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      expect(legacy.id).toBe(character.id);
      expect(legacy.name).toBe(character.name);
      expect(legacy.element).toBe(character.element);
      expect(legacy.level).toBe(character.level);
      expect(legacy.maxEnergy).toBe(character.maxEnergy);
      expect(legacy.elementalBurst.energyCost).toBe(character.burst.energyCost);
      expect(legacy.baseStats).toEqual(character.baseStats);
    }
  });

  /**
   * The adapter's `scaling` field is hardcoded to `"atk"`. That is honest ONLY
   * because non-ATK terms are omitted: an omitted term cannot be mislabelled.
   * If a future change starts folding them in, this field becomes an active
   * lie rather than a limitation, so it is pinned alongside the omission.
   */
  it("labels every legacy ability as ATK-scaling, which is only honest while terms are omitted", () => {
    for (const character of allCharacters) {
      const legacy = toLegacyCharacterDefinition(character);
      for (const ability of [
        legacy.normalAttack,
        legacy.chargedAttack,
        legacy.elementalSkill,
        legacy.elementalBurst,
      ]) {
        expect(ability.scaling).toBe("atk");
      }
    }
  });

  /**
   * Quantifies the loss, so its SIZE is visible rather than only its existence.
   *
   * A frontend still on the legacy shape under-reports these characters. This
   * is not an assertion that the number is acceptable — it is a change
   * detector on the blast radius, in the same spirit as the UNVERIFIED pins.
   */
  it("pins how much of the roster the legacy shape under-reports", () => {
    const underReported: string[] = [];
    for (const character of allCharacters) {
      const hasNonAtkTerm = allAbilities(character).some((ability) =>
        ability.instances.some((instance) =>
          instance.scaling.some((scale) => scale.stat !== "atk"),
        ),
      );
      if (hasNonAtkTerm) underReported.push(character.id);
    }
    expect(underReported.length).toBeGreaterThan(0);
    expect(
      underReported.length,
      `${underReported.length} of ${allCharacters.length} characters carry a non-ATK term the legacy shape drops: ${underReported.join(", ")}`,
    ).toBeLessThan(allCharacters.length / 2);
  });
});
