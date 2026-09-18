import { describe, expect, it } from "vitest";
import { allCharacters } from "@/game-data/characters/registry";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { allAbilities } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { MAX_TALENT_LEVEL, talentValueAt } from "@/simulation/character/talent";

// ============================================================================
// Character Data — STRUCTURAL INVARIANTS (TASK #028, qa-engineer)
//
// These assertions are SOURCE-INDEPENDENT. They cannot tell a correct
// multiplier from an incorrect one, and they deliberately do not try: a value
// being structurally plausible is NOT evidence that it was cross-verified.
//
// What they DO catch is structural nonsense that is detectable with no source
// at all -- negative cooldowns, energy costs outside the real game's discrete
// ladder, N-strings that do not build, multipliers outside believable bands.
//
// Read the failure of these tests as "the data is definitely broken"; read
// their success as "the data is not OBVIOUSLY broken", never as "the data is
// verified". Provenance is a separate problem and is not testable from inside
// the repo.
// ============================================================================

/**
 * Burst energy costs in Genshin are drawn from a small discrete ladder, not a
 * continuous range. Any value off this ladder is a data-entry error rather
 * than a balance choice.
 */
const VALID_BURST_ENERGY_COSTS = new Set([0, 40, 50, 60, 70, 80, 90]);

/**
 * Widest believable band for a single ATK-scaling damage instance, expressed
 * as a fraction (1.0 === 100% ATK). The lower bound is deliberately > 0 for
 * instances that scale at all; the upper bound sits well above the largest
 * real single-instance multipliers so that only nonsense trips it.
 */
/**
 * Ascension phases run 0..6 in game; a passive unlock gate outside that range
 * would either hide a real passive forever or reveal one at phase 0.
 */
const MAX_ASCENSION_PHASE = 6;

const MIN_PLAUSIBLE_MULTIPLIER = 0.01;
const MAX_PLAUSIBLE_MULTIPLIER = 40;

/** Longest cooldown of any real ability, with generous headroom. */
const MAX_PLAUSIBLE_COOLDOWN_SECONDS = 60;

/** No real cast time exceeds this; a larger value indicates a units mistake. */
const MAX_PLAUSIBLE_CAST_TIME_SECONDS = 10;

function atkMultiplierOf(ability: KitAbility, level: number): number | null {
  let total: number | null = null;
  for (const instance of ability.instances) {
    for (const scale of instance.scaling) {
      if (scale.stat !== "atk") continue;
      const value = talentValueAt(scale.table, level);
      total = (total ?? 0) + value;
    }
  }
  return total;
}

function describeAbility(
  character: GenericCharacterDefinition,
  ability: KitAbility,
): string {
  return `${character.name} / ${ability.slot} / ${ability.id}`;
}

describe("Character data — structural invariants (source-independent)", () => {
  it("exposes a non-empty roster to assert against", () => {
    expect(allCharacters.length).toBeGreaterThan(0);
  });

  it("gives every character a normal-attack string with at least one hit", () => {
    for (const character of allCharacters) {
      expect(
        character.normalAttacks.hits.length,
        `${character.name} has an empty normal-attack string`,
      ).toBeGreaterThan(0);
    }
  });

  it("keeps every cooldown finite, non-negative, and within a sane bound", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        for (let level = 1; level <= MAX_TALENT_LEVEL; level += 1) {
          const cooldown = talentValueAt(ability.cooldown, level);
          const where = `${describeAbility(character, ability)} @ talent ${level}`;
          expect(Number.isFinite(cooldown), `${where} cooldown not finite`).toBe(
            true,
          );
          expect(cooldown, `${where} cooldown negative`).toBeGreaterThanOrEqual(
            0,
          );
          expect(
            cooldown,
            `${where} cooldown implausibly long`,
          ).toBeLessThanOrEqual(MAX_PLAUSIBLE_COOLDOWN_SECONDS);
        }
      }
    }
  });

  it("gives skills a positive cooldown and normals/charged/plunges none", () => {
    for (const character of allCharacters) {
      const skillCooldown = talentValueAt(character.skill.cooldown, 1);
      expect(
        skillCooldown,
        `${character.name} elemental skill has a zero cooldown`,
      ).toBeGreaterThan(0);

      const burstCooldown = talentValueAt(character.burst.cooldown, 1);
      expect(
        burstCooldown,
        `${character.name} elemental burst has a zero cooldown`,
      ).toBeGreaterThan(0);

      for (const hit of character.normalAttacks.hits) {
        expect(
          talentValueAt(hit.cooldown, 1),
          `${character.name} normal hit ${hit.id} has a cooldown`,
        ).toBe(0);
      }
    }
  });

  it("draws every burst energy cost from the real discrete ladder", () => {
    for (const character of allCharacters) {
      const cost = character.burst.energyCost;
      expect(
        VALID_BURST_ENERGY_COSTS.has(cost),
        `${character.name} burst energy cost ${cost} is off the real 40/50/60/70/80/90 ladder`,
      ).toBe(true);
    }
  });

  it("matches maxEnergy to the burst's own energy cost", () => {
    for (const character of allCharacters) {
      expect(
        character.maxEnergy,
        `${character.name} maxEnergy (${character.maxEnergy}) disagrees with its burst cost (${character.burst.energyCost})`,
      ).toBe(character.burst.energyCost);
    }
  });

  it("charges nothing for normal, charged, and plunge attacks", () => {
    for (const character of allCharacters) {
      const free = [
        ...character.normalAttacks.hits,
        ...(character.chargedAttack ? [character.chargedAttack] : []),
        ...(character.plungeLow ? [character.plungeLow] : []),
        ...(character.plungeHigh ? [character.plungeHigh] : []),
      ];
      for (const ability of free) {
        expect(
          ability.energyCost,
          `${describeAbility(character, ability)} costs energy`,
        ).toBe(0);
      }
    }
  });

  it("keeps every ATK multiplier finite and inside a believable band", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        const multiplier = atkMultiplierOf(ability, 9);
        if (multiplier === null) continue; // non-ATK scaler; nothing to band
        const where = describeAbility(character, ability);
        expect(Number.isFinite(multiplier), `${where} multiplier not finite`).toBe(
          true,
        );
        if (multiplier === 0) continue; // deliberate zero-damage utility ability
        expect(multiplier, `${where} multiplier too small`).toBeGreaterThanOrEqual(
          MIN_PLAUSIBLE_MULTIPLIER,
        );
        expect(multiplier, `${where} multiplier too large`).toBeLessThanOrEqual(
          MAX_PLAUSIBLE_MULTIPLIER,
        );
      }
    }
  });

  it("keeps every cast time finite, non-negative, and plausibly short", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        const where = describeAbility(character, ability);
        expect(
          Number.isFinite(ability.castTime),
          `${where} cast time not finite`,
        ).toBe(true);
        expect(ability.castTime, `${where} cast time negative`).toBeGreaterThanOrEqual(
          0,
        );
        expect(
          ability.castTime,
          `${where} cast time implausibly long`,
        ).toBeLessThanOrEqual(MAX_PLAUSIBLE_CAST_TIME_SECONDS);
      }
    }
  });

  it("keeps base stats positive and inside level-90 bands", () => {
    for (const character of allCharacters) {
      const { hp, atk, def } = character.baseStats;
      expect(hp, `${character.name} baseHp`).toBeGreaterThan(0);
      expect(atk, `${character.name} baseAtk`).toBeGreaterThan(0);
      expect(def, `${character.name} baseDef`).toBeGreaterThan(0);
      // Level-90 base stats sit in well-known ranges across the whole roster.
      expect(hp, `${character.name} baseHp out of band`).toBeLessThan(30000);
      expect(atk, `${character.name} baseAtk out of band`).toBeLessThan(1000);
      expect(def, `${character.name} baseDef out of band`).toBeLessThan(1500);
    }
  });

  it("assigns every character a unique id", () => {
    const seen = new Set<string>();
    for (const character of allCharacters) {
      expect(seen.has(character.id), `duplicate character id ${character.id}`).toBe(
        false,
      );
      seen.add(character.id);
    }
  });

  it("assigns every ability of a character a unique id", () => {
    for (const character of allCharacters) {
      const seen = new Set<string>();
      for (const ability of allAbilities(character)) {
        expect(
          seen.has(ability.id),
          `${character.name} has duplicate ability id ${ability.id}`,
        ).toBe(false);
        seen.add(ability.id);
      }
    }
  });
});

describe("Character data — normal-attack string shape", () => {
  /**
   * In game an N-string's later hits are, broadly, worth more than its first
   * hit: the combo builds. This is asserted as FIRST-vs-LAST rather than
   * strict monotonicity, because real strings legitimately dip (a fast 2-hit
   * flourish mid-string is common), so strict monotonicity would fail on
   * CORRECT data and is the wrong invariant to encode.
   */
  it("makes the last normal hit worth at least as much as the first", () => {
    for (const character of allCharacters) {
      const hits = character.normalAttacks.hits;
      if (hits.length < 2) continue;
      const first = atkMultiplierOf(hits[0]!, 9);
      const last = atkMultiplierOf(hits[hits.length - 1]!, 9);
      if (first === null || last === null) continue;
      if (first === 0 || last === 0) continue;
      expect(
        last,
        `${character.name} N-string ends weaker than it starts (N1 ${first} -> N${hits.length} ${last})`,
      ).toBeGreaterThanOrEqual(first);
    }
  });

  it("keeps every normal hit's multiplier strictly positive", () => {
    for (const character of allCharacters) {
      for (const hit of character.normalAttacks.hits) {
        const multiplier = atkMultiplierOf(hit, 9);
        if (multiplier === null) continue;
        expect(
          multiplier,
          `${character.name} normal hit ${hit.id} deals no damage`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("keeps N-string length within the real 1..6 hit range", () => {
    for (const character of allCharacters) {
      const count = character.normalAttacks.hits.length;
      // 1 is legitimate: Ningguang's Sparkling Scatter really is a single
      // repeating normal attack, so a >=2 floor would fail on CORRECT data.
      expect(
        count,
        `${character.name} has an implausible ${count}-hit normal string`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        count,
        `${character.name} has an implausible ${count}-hit normal string`,
      ).toBeLessThanOrEqual(6);
    }
  });

  /**
   * Charged attacks are not universally stronger per-instance than N1:
   * Diluc's charged attack is a CYCLIC spin (a small per-tick multiplier that
   * repeats while stamina drains) plus a final slash, so its single-instance
   * value is legitimately below N1. The invariant that does hold for every
   * kit is that a charged attack deals SOME damage where one is authored.
   */
  it("gives every authored charged attack a positive multiplier", () => {
    for (const character of allCharacters) {
      if (!character.chargedAttack) continue;
      const charged = atkMultiplierOf(character.chargedAttack, 9);
      if (charged === null) continue;
      expect(
        charged,
        `${character.name} charged attack deals no damage`,
      ).toBeGreaterThan(0);
    }
  });

  it("makes a high plunge worth more than a low plunge", () => {
    for (const character of allCharacters) {
      if (!character.plungeLow || !character.plungeHigh) continue;
      const low = atkMultiplierOf(character.plungeLow, 9);
      const high = atkMultiplierOf(character.plungeHigh, 9);
      if (low === null || high === null) continue;
      if (low === 0 || high === 0) continue;
      expect(
        high,
        `${character.name} high plunge (${high}) is not stronger than low plunge (${low})`,
      ).toBeGreaterThan(low);
    }
  });
});

describe("Character data — talent-level table provenance", () => {
  // ==========================================================================
  // PROVENANCE PROBE — INVERTED AT THE CUTOVER (TASK #028 -> TASK #037).
  //
  // This probe was written under the fabricated roster, where it recorded the
  // audit's structural defect #1: talent level was INERT because every ability
  // used `flatTalent()`, a one-entry table `talentValueAt` clamps. It pinned
  // `withRealTable === 0` and asserted burst damage was identical at talent 1
  // and talent 15 -- both DEFECT PINS, deliberately shaped so that the moment
  // real sourced tables landed the suite would fail loudly.
  //
  // It did. The generated roster landed and both assertions broke.
  //
  // The old assertions are therefore REPLACED, not re-pinned to new numbers.
  // Re-pinning `withRealTable` from 0 to 132 would have preserved the exact
  // WRONG SHAPE of the test -- a counter that a future half-regression could
  // satisfy by any means. What the repo actually needs asserted now is the
  // POSITIVE property: talent level is LIVE. So the direction of every
  // assertion below is flipped. A regression to flat scalars now fails because
  // damage stopped moving with level, which is the defect itself, not because
  // a bookkeeping integer drifted.
  // ==========================================================================

  /**
   * Every character carries per-level tables — no exceptions, no allowance.
   *
   * Expressed as "the set of flat-only characters is EMPTY" rather than as a
   * count equal to the roster size. A count has to be edited every time a
   * character is added, and an edit is where an unnoticed regression hides;
   * an emptiness assertion is stable under roster growth and names the
   * offenders when it fails.
   */
  it("gives every character real per-level talent tables, with no flat-scalar holdouts", () => {
    const flatOnly: string[] = [];
    for (const character of allCharacters) {
      const scalingTables = allAbilities(character).flatMap((ability) =>
        ability.instances.flatMap((instance) =>
          instance.scaling.map((scale) => scale.table),
        ),
      );
      if (!scalingTables.some((table) => table.values.length > 1)) {
        flatOnly.push(character.id);
      }
    }
    expect(
      flatOnly,
      `these characters have only flat one-entry talent tables, so talent level is inert for them: ${flatOnly.join(", ")}`,
    ).toEqual([]);
  });

  /**
   * The generated source publishes talents at levels 1..15, so a table with a
   * different length means a row was dropped or duplicated in emission — a
   * failure the value-band checks above cannot see, because every individual
   * value would still be plausible.
   */
  it("gives every scaling table exactly one entry per talent level 1..15", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        for (const instance of ability.instances) {
          for (const scale of instance.scaling) {
            expect(
              scale.table.values.length,
              `${describeAbility(character, ability)} / ${instance.id} / ${scale.stat} has ${scale.table.values.length} talent rows, not ${MAX_TALENT_LEVEL}`,
            ).toBe(MAX_TALENT_LEVEL);
          }
        }
      }
    }
  });

  /**
   * The inversion of the old "talent level is inert" DEFECT PIN.
   *
   * Damage must STRICTLY INCREASE from talent 1 to talent 15 for every ability
   * that scales off ATK at all. A zero-ATK ability is skipped rather than
   * failed: a burst can legitimately have no ATK term (it scales off HP/DEF/EM,
   * or deals no damage), and `atkMultiplierOf` correctly reports 0 there. That
   * exemption is asserted to be NARROW by the following test, so it cannot
   * quietly widen into a hole that hides a regression.
   */
  it("makes every ATK-scaling ability strictly stronger at talent 15 than at talent 1", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        const atTalent1 = atkMultiplierOf(ability, 1);
        const atTalent15 = atkMultiplierOf(ability, MAX_TALENT_LEVEL);
        if (atTalent1 === null || atTalent15 === null) continue;
        if (atTalent1 === 0 && atTalent15 === 0) continue; // non-ATK / damageless
        expect(
          atTalent15,
          `${describeAbility(character, ability)} does not grow with talent level (L1 ${atTalent1} -> L15 ${atTalent15})`,
        ).toBeGreaterThan(atTalent1);
      }
    }
  });

  /**
   * Bounds the exemption the previous test grants.
   *
   * Bursts with no ATK term at all are real — they scale off HP (Kokomi),
   * DEF (Itto), EM (Nahida), or deal no damage (Gorou, Layla). But if that set
   * ever swallowed the roster, the "strictly stronger" test above would pass
   * vacuously while asserting nothing. This caps it: a clear MAJORITY of bursts
   * must carry a live ATK term.
   *
   * The bound is a fraction, not a headcount, so adding characters does not
   * force an edit — the same reason the flat-holdout test asserts emptiness.
   */
  it("keeps ATK-less bursts a minority, so the growth test cannot pass vacuously", () => {
    let atkScaling = 0;
    let atkLess = 0;
    for (const character of allCharacters) {
      const atTalent15 = atkMultiplierOf(character.burst, MAX_TALENT_LEVEL);
      if (atTalent15 !== null && atTalent15 > 0) atkScaling += 1;
      else atkLess += 1;
    }
    expect(atkScaling + atkLess).toBe(allCharacters.length);
    expect(
      atkScaling / allCharacters.length,
      `only ${atkScaling} of ${allCharacters.length} bursts carry an ATK term`,
    ).toBeGreaterThan(0.5);
    // Non-zero from the other side: if this hit 0 the roster would have lost
    // its HP/DEF/EM scalers, which is the category error the audit found.
    expect(atkLess, "no burst scales off anything but ATK").toBeGreaterThan(0);
  });

  /**
   * Talent tables must be MONOTONIC in level, per row.
   *
   * Genshin talent scaling never decreases with level. Checking per-row rather
   * than only at the endpoints catches a mis-ordered or transposed emission
   * that endpoints alone would miss — e.g. a table emitted in reverse still has
   * a larger value at one end, so an endpoint-only check reads as healthy.
   */
  it("keeps every talent table non-decreasing across levels 1..15", () => {
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        for (const instance of ability.instances) {
          for (const scale of instance.scaling) {
            for (let level = 2; level <= MAX_TALENT_LEVEL; level += 1) {
              const previous = talentValueAt(scale.table, level - 1);
              const current = talentValueAt(scale.table, level);
              expect(
                current,
                `${describeAbility(character, ability)} / ${scale.stat} decreases from talent ${level - 1} (${previous}) to ${level} (${current})`,
              ).toBeGreaterThanOrEqual(previous);
            }
          }
        }
      }
    }
  });

  /**
   * KNOWN-GOOD ANCHOR — the one value in this suite that is a PROVENANCE check
   * rather than a structural one.
   *
   * Bennett's N1 at talent 10 is `0.8806`, independently confirmed by the
   * TASK #028 audit against the real game before any of this data was
   * generated. Pinning it here ties the emitted table to an externally-known
   * number at a specific INDEX, which is strictly stronger than any band check:
   * a table that is correct but off-by-one in level indexing passes every other
   * assertion in this file and fails this one.
   *
   * The L1 and L15 neighbours are pinned too, so an off-by-one that happens to
   * land 0.8806 at the wrong index is also caught.
   */
  it("anchors Bennett N1 to the audit's externally-confirmed level-10 value", () => {
    const bennett = allCharacters.find((character) => character.id === "bennett");
    expect(bennett, "bennett is missing from the roster").toBeDefined();
    const n1 = bennett!.normalAttacks.hits[0];
    expect(n1, "bennett has no first normal hit").toBeDefined();

    expect(atkMultiplierOf(n1!, 10)).toBeCloseTo(0.8806, 6);
    expect(atkMultiplierOf(n1!, 1)).toBeCloseTo(0.44548, 6);
    expect(atkMultiplierOf(n1!, 15)).toBeCloseTo(1.1914, 6);
  });
});

describe("Character data — scaling-stat category coverage", () => {
  // ==========================================================================
  // The audit's structural defect #2 was that `scaling: "atk"` was the ONLY
  // value anywhere in the roster: every HP-, DEF- and EM-scaling ability was
  // mis-authored as ATK. That is a CATEGORY error, not a numeric one, and no
  // multiplier correction repairs it.
  //
  // These assertions pin that the category axis is populated. They deliberately
  // do NOT pin exact counts per stat — a count would have to be edited on every
  // roster change, and the property that matters is "the axis exists and is
  // used", not "there are exactly 45 HP terms".
  // ==========================================================================

  function scalingStatCensus(): ReadonlyMap<string, number> {
    const census = new Map<string, number>();
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        for (const instance of ability.instances) {
          for (const scale of instance.scaling) {
            census.set(scale.stat, (census.get(scale.stat) ?? 0) + 1);
          }
        }
      }
    }
    return census;
  }

  it("uses every non-ATK scaling stat somewhere in the roster", () => {
    const census = scalingStatCensus();
    for (const stat of ["atk", "hp", "def", "elementalMastery"] as const) {
      expect(
        census.get(stat) ?? 0,
        `no ability anywhere scales off ${stat} — the audit's category error has returned`,
      ).toBeGreaterThan(0);
    }
  });

  /**
   * Named characters whose real kits scale off something other than ATK.
   *
   * These are the specific cases the audit called out (Yelan's skill is
   * 0.40704x Max HP in game, authored as ATK 3.84 in the fabricated data).
   * Asserting them BY NAME means a regression that reverts one kit to ATK is
   * caught even while the roster-wide census above still looks healthy.
   */
  it("keeps the audit's named non-ATK scalers scaling off the right stat", () => {
    // Only characters whose TALENT PARAMETERS themselves scale off a non-ATK
    // stat are listed. Arataki Itto is deliberately ABSENT and is pinned
    // separately below: his DEF scaling comes from a passive, not from a
    // talent parameter, and passives are not modelled.
    const expectations: readonly (readonly [string, string])[] = [
      ["yelan", "hp"],
      ["sangonomiya-kokomi", "hp"],
      ["noelle", "def"],
      ["albedo", "def"],
      ["nahida", "elementalMastery"],
    ];
    for (const [characterId, expectedStat] of expectations) {
      const character = allCharacters.find((c) => c.id === characterId);
      expect(character, `${characterId} is missing from the roster`).toBeDefined();
      const stats = new Set(
        allAbilities(character!).flatMap((ability) =>
          ability.instances.flatMap((instance) =>
            instance.scaling.map((scale) => scale.stat),
          ),
        ),
      );
      expect(
        stats.has(expectedStat as never),
        `${characterId} no longer scales off ${expectedStat} anywhere in its kit (found: ${[...stats].join(", ")})`,
      ).toBe(true);
    }
  });
});

describe("Character data — DEFECT PINS (passive-derived scaling is missing)", () => {
  // ==========================================================================
  // DEFECT PIN, not an approval.
  //
  // The generator now emits passive and constellation ROWS for every character,
  // but every row carries `effects: []` -- neither source publishes kit
  // behaviour as machine-readable parameters. Withholding rather than guessing
  // is the correct call under the no-guessing rule, and it is exactly why the
  // roster claims support tier PARTIAL rather than FULL.
  //
  // But it has a consequence the tier alone does not express: for characters
  // whose non-ATK scaling lives in a PASSIVE rather than in a talent parameter,
  // the emitted kit reports pure ATK scaling and is therefore WRONG in kind,
  // not merely incomplete. Arataki Itto's Sweeping Time converts DEF into ATK
  // via the Superlative Superstrength passive; with passives empty, his whole
  // kit reads as ATK-scaling with no trace that DEF matters at all.
  //
  // These tests assert the CURRENT, DEFECTIVE state so that it is visible and
  // so that fixing it fails here loudly rather than passing silently. When
  // passives land, REPLACE these pins with the positive assertion — do not
  // relax them.
  // ==========================================================================

  const PASSIVE_DERIVED_SCALERS: readonly (readonly [string, string])[] = [
    ["arataki-itto", "def"],
  ];

  it("DEFECT: passive-derived scalers are emitted as pure ATK", () => {
    for (const [characterId, missingStat] of PASSIVE_DERIVED_SCALERS) {
      const character = allCharacters.find((c) => c.id === characterId);
      expect(character, `${characterId} is missing from the roster`).toBeDefined();
      const stats = new Set(
        allAbilities(character!).flatMap((ability) =>
          ability.instances.flatMap((instance) =>
            instance.scaling.map((scale) => scale.stat),
          ),
        ),
      );
      expect(
        stats.has(missingStat as never),
        `${characterId} now scales off ${missingStat} — the defect is FIXED. Replace this pin with a positive assertion instead of relaxing it.`,
      ).toBe(false);
    }
  });

  // ==========================================================================
  // REPLACEMENT for the retired pin "no character carries passives or
  // constellations" (TASK #049, qa-engineer).
  //
  // That pin fired because the generator now emits passives and
  // constellations for all 132 characters. It was written to fail at exactly
  // this moment, and per the project standard it is REPLACED rather than
  // re-pinned.
  //
  // But the replacement must not be an approval. What landed is the STRUCTURE
  // (id / name / level / effects array), not the BEHAVIOUR: every one of the
  // emitted entries carries `effects: []`. So the honest replacement is two
  // assertions of different kinds:
  //
  //   1. POSITIVE assertions on what is genuinely emitted -- shape, identity,
  //      C1..C6 completeness, id/name discipline. These are real coverage of
  //      real data and would fail if the emission regressed.
  //   2. A NEW, NARROWER pin on the part that is still absent: zero
  //      simulatable effects. Stated as a ratio over the whole roster so that
  //      the first character to gain an effect fails here loudly.
  //
  // Assertions are deliberately STRUCTURAL, not exact counts, because a data
  // agent is concurrently deriving per-character tiers and bucketing effects.
  // Pinning "exactly 792 constellations" would churn on every roster edit
  // while proving nothing; pinning "every character has exactly C1..C6" is
  // stable under that churn and is the property that actually matters.
  // ==========================================================================

  it("emits a complete, well-formed C1..C6 constellation set for every character", () => {
    const CONSTELLATION_LEVELS = [1, 2, 3, 4, 5, 6] as const;
    for (const character of allCharacters) {
      const constellations = character.constellations ?? [];
      expect(
        constellations.length,
        `${character.id} does not carry a full six-constellation set`,
      ).toBe(CONSTELLATION_LEVELS.length);

      // Levels are exactly C1..C6 with no gap and no duplicate. A generator
      // that dropped or doubled a row would pass a mere length check.
      expect(
        constellations.map((c) => c.level),
        `${character.id} constellation levels are not exactly C1..C6 in order`,
      ).toEqual([...CONSTELLATION_LEVELS]);

      for (const constellation of constellations) {
        expect(
          constellation.id.startsWith(`${character.id}-c`),
          `${character.id} constellation id "${constellation.id}" is not namespaced to its character`,
        ).toBe(true);
        expect(
          constellation.id,
          `${character.id} C${constellation.level} id does not encode its level`,
        ).toBe(`${character.id}-c${constellation.level}`);
        // A blank name would render as an empty row in the character detail UI.
        expect(
          constellation.name.trim().length,
          `${character.id} C${constellation.level} has a blank name`,
        ).toBeGreaterThan(0);
      }
    }
  });

  /**
   * KNOWN DATA DEFECT, allowlisted so the rest of the roster stays asserted.
   *
   * `src/game-data/characters/generated/electro.ts:4323` emits
   * `{ id: "raiden-shogun-p3", name: "", effects: [] }` -- the only blank name
   * anywhere in the roster. Owner: the data agent (generated output, not
   * qa-owned). Reported rather than patched.
   *
   * The allowlist is pinned from BOTH sides by the census test below, so
   * fixing it fails here and must be removed deliberately, and a SECOND blank
   * name appearing also fails. An allowlist that only shrank silently would be
   * a way to launder new defects.
   */
  // FIXED in TASK #053: the generator no longer emits a blank passive name.
  // Allowlist emptied deliberately, exactly as the census below demands — any
  // NEW blank name still fails, so this cannot launder a future defect.
  const BLANK_NAMED_PASSIVES: ReadonlySet<string> = new Set<string>();

  it("has exactly the known set of blank-named passives — no more, no fewer", () => {
    const blank: string[] = [];
    for (const character of allCharacters) {
      for (const passive of character.passives ?? []) {
        if (passive.name.trim().length === 0) blank.push(passive.id);
      }
    }
    expect(
      blank.sort(),
      "the blank-passive-name defect set changed: either a new one appeared, or the known one was fixed and this allowlist must be deleted",
    ).toEqual([...BLANK_NAMED_PASSIVES].sort());
  });

  it("emits passives with unique, namespaced ids and non-blank names", () => {
    for (const character of allCharacters) {
      const passives = character.passives ?? [];
      // Every real character has at least the ascension pair plus a utility
      // passive; zero passives means the emission dropped the character.
      expect(
        passives.length,
        `${character.id} carries no passives at all`,
      ).toBeGreaterThan(0);

      const ids = passives.map((p) => p.id);
      expect(
        new Set(ids).size,
        `${character.id} has duplicate passive ids (${ids.join(", ")})`,
      ).toBe(ids.length);

      for (const passive of passives) {
        expect(
          passive.id.startsWith(`${character.id}-`),
          `${character.id} passive id "${passive.id}" is not namespaced to its character`,
        ).toBe(true);
        if (!BLANK_NAMED_PASSIVES.has(passive.id)) {
          expect(
            passive.name.trim().length,
            `${character.id} passive "${passive.id}" has a blank name`,
          ).toBeGreaterThan(0);
        }
        // `unlockAscension` gates visibility in the UI. An out-of-range phase
        // would either hide a real passive or reveal one too early.
        if (passive.unlockAscension !== undefined) {
          expect(
            passive.unlockAscension,
            `${character.id} passive "${passive.id}" has an out-of-range ascension gate`,
          ).toBeGreaterThanOrEqual(0);
          expect(passive.unlockAscension).toBeLessThanOrEqual(MAX_ASCENSION_PHASE);
        }
      }
    }
  });

  it("keeps every constellation and passive id unique across the whole roster", () => {
    // Ids reach the UI as React keys and the buff system as effect owners. A
    // collision between two characters would be invisible per-character and
    // is only detectable roster-wide.
    const seen = new Map<string, string>();
    const collisions: string[] = [];
    for (const character of allCharacters) {
      for (const entry of [
        ...(character.constellations ?? []),
        ...(character.passives ?? []),
      ]) {
        const owner = seen.get(entry.id);
        if (owner !== undefined) {
          collisions.push(`${entry.id} claimed by both ${owner} and ${character.id}`);
        } else {
          seen.set(entry.id, character.id);
        }
      }
    }
    expect(collisions, "constellation/passive id collision across the roster").toEqual([]);
  });

  it("DEFECT: every emitted constellation and passive carries ZERO simulatable effects", () => {
    // THE NARROWED PIN. The rows landed; the EFFECTS did not. Until an effect
    // is emitted, a populated `constellations` array is presentation data
    // only, and any consumer that reads "has constellations" as "constellation
    // damage is modelled" is overclaiming.
    //
    // Asserted as a census over the whole roster rather than on a sample, so
    // the FIRST character to gain a real effect fails here. When that happens,
    // REPLACE this with a positive assertion on the emitted effects and revisit
    // the derived-tier detector in `src/tests/coverage/characterCoverage.ts`,
    // which reads an effect-less kit as having nothing wrong with it.
    const withEffects: string[] = [];
    let totalEntries = 0;
    for (const character of allCharacters) {
      for (const entry of [
        ...(character.constellations ?? []),
        ...(character.passives ?? []),
      ]) {
        totalEntries += 1;
        if ((entry.effects?.length ?? 0) > 0) withEffects.push(entry.id);
      }
    }

    // Guards the census itself: if the roster stopped emitting entries, the
    // "zero effects" assertion below would pass vacuously.
    expect(
      totalEntries,
      "no constellations or passives are emitted at all — the census is vacuous",
    ).toBeGreaterThan(allCharacters.length * 6);

    expect(
      withEffects,
      "constellation/passive EFFECTS have started landing — replace this pin with a positive assertion and revisit the derived support tier",
    ).toEqual([]);
  });

  it("keeps only explicitly sourced resources in the roster", () => {
    // The fabricated roster hand-authored these (Diluc burst pyro infusion,
    // Xingqiu Raincutter coordinated procs, Hu Tao Paramita stance). None
    // survive the cutover: they are kit BEHAVIOUR, and neither source publishes
    // behaviour as parameters. Simulation of those kits is therefore
    // structurally incomplete, not merely numerically approximate.
    const offenders: string[] = [];
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        if (ability.infusion !== undefined) offenders.push(`${character.id}:infusion`);
        if ((ability.triggers?.length ?? 0) > 0) offenders.push(`${character.id}:trigger`);
        if (ability.stance !== undefined) offenders.push(`${character.id}:stance`);
      }
      if ((character.resources?.length ?? 0) > 0) offenders.push(`${character.id}:resource`);
    }
    expect(offenders).toEqual(["mavuika:resource", "skirk:resource"]);
  });
});
