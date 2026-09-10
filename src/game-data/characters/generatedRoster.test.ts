import { describe, expect, it } from "vitest";
import {
  allCharacters,
  characterRosterEntries,
  findCharacter,
  findRosterEntry,
} from "./registry";
import { generatedCharacterMeta } from "./generated/meta";
import { generatedCharacterProvenanceById } from "./generated/provenance";
import {
  MAX_TALENT_LEVEL,
  MIN_TALENT_LEVEL,
  talentValueAt,
} from "@/simulation/character/talent";
import { allAbilities } from "@/simulation/character/character";
import { findDuplicateIdentity, isSameCharacter } from "@/types";
import type { PlacedCharacter } from "@/types";

// ============================================================================
// The generated roster is LIVE.
//
// These tests exist because of the TASK #028 audit, which found the previous
// hand-authored roster was fabricated: 83% of its normal-attack multipliers
// matched no real game value at any talent level, every ability stored a
// scalar instead of a per-level table, and every scaler was recorded as ATK.
//
// Each test below pins one of those defects as FIXED, so a regression to
// hand-authored data fails here rather than silently producing plausible
// wrong numbers again.
// ============================================================================

describe("generated roster — talent level is no longer inert", () => {
  /**
   * THE headline regression test.
   *
   * `src/simulation/character/talent.ts` was written specifically to stop a
   * multiplier being stored as a scalar ("storing a scalar bakes in one level
   * and makes the data unusable at any other"). Before the cutover its core
   * contract was unused by 100% of the roster: `flatTalent()` produced
   * one-entry tables, which `talentValueAt` clamps, so every character dealt
   * identical damage at talent 1 and talent 15.
   */
  it("returns different multipliers at different talent levels", () => {
    const bennett = findCharacter("bennett");
    expect(bennett).toBeDefined();

    const table = bennett!.normalAttacks.hits[0]!.instances[0]!.scaling[0]!.table;
    const atLevel1 = talentValueAt(table, MIN_TALENT_LEVEL);
    const atLevel10 = talentValueAt(table, 10);
    const atLevel15 = talentValueAt(table, MAX_TALENT_LEVEL);

    expect(atLevel1).not.toBe(atLevel15);
    expect(atLevel10).toBeGreaterThan(atLevel1);
    expect(atLevel15).toBeGreaterThan(atLevel10);

    // Known-good datamined value at talent 10, in its correct position. This
    // is the value the audit used to prove the old data wrong.
    expect(atLevel10).toBeCloseTo(0.8806, 10);
  });

  it("gives most characters a strictly larger burst multiplier at 15 than at 1", () => {
    const varying = allCharacters.filter((character) => {
      const table = character.burst.instances[0]?.scaling[0]?.table;
      if (table === undefined) return false;
      return (
        talentValueAt(table, MAX_TALENT_LEVEL) > talentValueAt(table, MIN_TALENT_LEVEL)
      );
    });

    // Not every character qualifies: a few bursts deal no damage at all
    // (Barbara heals, Nahida only buffs), so they have no scaling table. The
    // point is that this is now the overwhelming majority rather than zero.
    expect(varying.length).toBeGreaterThan(allCharacters.length * 0.9);
  });

  it("carries real multi-entry talent tables across the roster", () => {
    const withRealTable = allCharacters.filter((character) =>
      allAbilities(character).some((ability) =>
        ability.instances.some((instance) =>
          instance.scaling.some((scale) => scale.table.values.length > 1),
        ),
      ),
    );

    // Every generated character carries per-level tables. The provenance probe
    // in `src/tests` pinned this at 0 before the cutover.
    expect(withRealTable.length).toBe(allCharacters.length);
  });

  it("sources full-length 15-level tables, not padded stubs", () => {
    const table = findCharacter("bennett")!.normalAttacks.hits[0]!.instances[0]!
      .scaling[0]!.table;
    expect(table.values).toHaveLength(MAX_TALENT_LEVEL);
    // Real datamined values carry full float precision; the audit's tell for
    // fabricated data was that 100% of values had <= 2 decimals.
    expect(table.values.some((value) => String(value).split(".")[1]!.length > 2)).toBe(
      true,
    );
  });
});

describe("generated roster — scaling stats are sourced, not folded into ATK", () => {
  /**
   * The audit's second structural defect: `scaling: "atk"` was the ONLY value
   * anywhere in the roster, so every HP-scaling character was mis-authored.
   * Yelan's skill is Max HP scaling in game and was authored as ATK.
   */
  it("authors Yelan's skill as HP scaling", () => {
    const yelan = findCharacter("yelan");
    expect(yelan).toBeDefined();

    const stats = yelan!.skill.instances.flatMap((instance) =>
      instance.scaling.map((scale) => scale.stat),
    );
    expect(stats).toContain("hp");
    expect(stats).not.toContain("atk");
  });

  it("uses more than one scaling stat across the roster", () => {
    const stats = new Set(
      allCharacters.flatMap((character) =>
        allAbilities(character).flatMap((ability) =>
          ability.instances.flatMap((instance) =>
            instance.scaling.map((scale) => scale.stat),
          ),
        ),
      ),
    );

    expect(stats.has("atk")).toBe(true);
    expect(stats.has("hp")).toBe(true);
    expect(stats.has("def")).toBe(true);
    expect(stats.size).toBeGreaterThan(1);
  });
});

describe("generated roster — identity and forms", () => {
  it("lists the Traveler exactly once, carrying its forms", () => {
    const travelerEntries = characterRosterEntries.filter(
      (entry) => entry.identityId === ("traveler" as typeof entry.identityId),
    );
    expect(travelerEntries).toHaveLength(1);

    const traveler = travelerEntries[0]!;
    // Named for the identity, never renamed per element.
    expect(traveler.name).toBe("Traveler");
    // Both genders across every element the source publishes.
    expect(traveler.forms.length).toBeGreaterThan(1);
    expect(new Set(traveler.forms.map((form) => form.element)).size).toBeGreaterThan(1);
  });

  it("rejects two Travelers in one party, whatever their forms", () => {
    const traveler = findRosterEntry("traveler");
    expect(traveler).toBeDefined();

    const [first, second] = traveler!.forms;
    expect(second).toBeDefined();

    const partyA: PlacedCharacter = {
      identityId: traveler!.identityId,
      formId: first.formId,
    };
    const partyB: PlacedCharacter = {
      identityId: traveler!.identityId,
      formId: second!.formId,
    };

    // Different forms, different elements — still the same character.
    expect(isSameCharacter(partyA, partyB)).toBe(true);
    expect(findDuplicateIdentity([partyA, partyB])).toBe(traveler!.identityId);
  });

  it("gives every ordinary character exactly one form", () => {
    const multiForm = characterRosterEntries.filter(
      (entry) => entry.forms.length > 1,
    );
    // The Traveler is the only character in the game with elemental forms.
    expect(multiForm).toHaveLength(1);
    expect(multiForm[0]!.identityId).toBe("traveler");
  });

  it("has one roster entry per identity and no duplicate ids", () => {
    const identities = characterRosterEntries.map((entry) => entry.identityId);
    expect(new Set(identities).size).toBe(identities.length);

    const ids = allCharacters.map((character) => character.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("generated roster — provenance", () => {
  it("is sourced entirely from the generator", () => {
    expect(allCharacters.length).toBeGreaterThan(0);
    // Every live character has generated metadata; nothing is hand-added.
    const metaIds = new Set(generatedCharacterMeta.map((meta) => meta.characterId));
    for (const character of allCharacters) {
      expect(metaIds.has(character.id)).toBe(true);
    }
  });

  it("orders the roster by sourced release date", () => {
    const dated = generatedCharacterMeta.filter(
      (meta) => meta.releaseDate !== undefined,
    );
    // Release dates come from the source's own timestamp, so every character
    // has one — a renamed character can no longer lose its ordering.
    expect(dated.length).toBe(generatedCharacterMeta.length);
  });

  /**
   * REWRITTEN, deliberately, when constellations landed.
   *
   * This test used to assert `constellations` and `passives` were EMPTY. That
   * was the honest claim while the generator emitted nothing for them; it
   * stopped being honest the moment it did. Keeping the old assertion would
   * have meant either deleting real data to satisfy a test, or letting a test
   * pin a state the data had outgrown.
   *
   * What has to stay pinned is the CLAIM, not the emptiness: no character may
   * assert more support than the generator actually produced for it. So the
   * assertions below check that the claim tracks the data, in both directions.
   */
  it("claims no more support than the data provides", () => {
    for (const character of allCharacters) {
      const provenance = generatedCharacterProvenanceById.get(character.id);
      expect(provenance).toBeDefined();

      // FULL is reserved for a character with every perk modelled and no
      // unconfirmed field. No character reaches it — see the count assertion
      // below — but the rule is stated as a rule, not as a hardcoded "never",
      // so a character that genuinely earns FULL later is not blocked by it.
      if (character.claim.supportTier === "FULL") {
        expect(provenance!.modelledPerks).toBe(provenance!.totalPerks);
        expect(provenance!.unverified).toHaveLength(0);
      } else {
        // Every non-FULL claim must say WHY, in that character's own terms.
        expect(character.claim.tierReason).toBeTruthy();
      }
    }
  });

  it("derives the support tier per character, not as one blanket constant", () => {
    // The defect this pins: a single shared `GENERATED_SUPPORT_TIER` gave ~127
    // characters one identical reason string, which carried zero per-character
    // information and so could not be acted on by a reader or a UI.
    const reasons = allCharacters.map((character) => character.claim.tierReason);
    expect(new Set(reasons).size).toBeGreaterThan(1);

    // A reason must quote that character's own counts, so two characters with
    // different gaps cannot read identically.
    for (const character of allCharacters) {
      const provenance = generatedCharacterProvenanceById.get(character.id)!;
      if (character.claim.supportTier === "FULL") continue;
      expect(character.claim.tierReason).toContain(String(provenance.totalPerks));
    }
  });

  it("reaches FULL for no character, and says so with counts", () => {
    // The honest answer, asserted rather than assumed. Every character has at
    // least one effect that is not modelled, so none reaches FULL.
    //
    // UPDATED: modelled perks went 7 -> 266 of 1234 when talent-level boosts
    // became simulatable (mechanics landed `Buff.talentLevelModifiers`, combat
    // wired it through `talentLevelSeam.ts`). The old assertion
    // `modelled < total * 0.01` encoded the BLOCKER, not a safety property, so
    // it is replaced below by the properties that actually keep the claim
    // honest rather than by a looser magic threshold.
    const full = allCharacters.filter(
      (character) => character.claim.supportTier === "FULL",
    );
    expect(full).toHaveLength(0);

    const totals = [...generatedCharacterProvenanceById.values()].reduce(
      (sum, entry) => ({
        modelled: sum.modelled + entry.modelledPerks,
        unimplemented: sum.unimplemented + entry.unimplementedPerks,
        unverified: sum.unverified + entry.unverifiedPerks,
        total: sum.total + entry.totalPerks,
      }),
      { modelled: 0, unimplemented: 0, unverified: 0, total: 0 },
    );

    // The buckets partition the whole set — nothing is uncounted. This is the
    // invariant that actually matters: a perk cannot be quietly dropped from
    // the accounting, whichever bucket it lands in.
    expect(
      totals.modelled + totals.unimplemented + totals.unverified,
    ).toBe(totals.total);

    // The majority of the kit is still NOT modelled, and is recorded as such
    // rather than claimed away. Stated as "most are unmodelled" — the property
    // the UI copy depends on — instead of a fixed ratio that must be edited
    // every time coverage moves.
    expect(totals.unimplemented + totals.unverified).toBeGreaterThan(
      totals.modelled,
    );

    // Coverage is real but partial. Both bounds are asserted so that a
    // regression which silently stopped modelling perks fails here just as
    // loudly as an over-claim would.
    expect(totals.modelled).toBeGreaterThan(0);
    expect(totals.modelled).toBeLessThan(totals.total);
  });

  it("carries constellations and passives now that the generator emits them", () => {
    // The inverse of the assertion this test replaced. Zero empty arrays: a
    // regression that silently stopped emitting perks fails here.
    for (const character of allCharacters) {
      expect(character.constellations.length).toBeGreaterThan(0);
    }
  });
});

describe("generated roster — per-value provenance is reachable from TypeScript", () => {
  /**
   * Cast-time and other unsourced-value markers used to exist ONLY as `//`
   * comments in the emitted modules. A UI cannot read a comment, so it could
   * mark every value as unverified or none — and marking none is how an
   * unsourced number gets presented as a sourced one.
   */
  it("names the unconfirmed field, not just the character", () => {
    for (const entry of generatedCharacterProvenanceById.values()) {
      for (const field of entry.unverified) {
        expect(field.field).toBeTruthy();
        expect(field.reason).toBeTruthy();
      }
    }
  });

  it("flags cast times as unsourced on every character", () => {
    // Neither source publishes animation timing, so every character carries
    // this caveat. If one ever does not, the generator started guessing.
    for (const entry of generatedCharacterProvenanceById.values()) {
      const fields = entry.unverified.map((item) => item.field);
      expect(fields).toContain("castTime");
    }
  });
});

describe("generated roster — base stats are a real per-level curve", () => {
  /**
   * `baseStatCurves` held a single `{ [90]: value }` entry for every
   * character: a point wearing a curve's type. A level selector reading it
   * would have returned the level-90 number at level 20 and presented it as a
   * level-20 number — silently wrong, which is the failure class the TASK #028
   * audit exists to end.
   */
  it("carries every character level from 1 to 90", () => {
    for (const character of allCharacters) {
      for (const stat of ["hp", "atk", "def"] as const) {
        const byLevel = character.baseStatCurves[stat].byLevel;
        expect(Object.keys(byLevel)).toHaveLength(90);
        expect(byLevel[1]).toBeGreaterThan(0);
        expect(byLevel[90]).toBeGreaterThan(byLevel[1]!);
      }
    }
  });

  it("increases monotonically with level", () => {
    for (const character of allCharacters) {
      for (const stat of ["hp", "atk", "def"] as const) {
        const byLevel = character.baseStatCurves[stat].byLevel;
        for (let level = 2; level <= 90; level += 1) {
          expect(byLevel[level]!).toBeGreaterThanOrEqual(byLevel[level - 1]!);
        }
      }
    }
  });

  it("agrees with the level-90 base stats it is emitted alongside", () => {
    // Two independently emitted fields reading from the same source row. A
    // drift between them means the curve and the flat stats disagree about the
    // same character.
    for (const character of allCharacters) {
      expect(character.baseStatCurves.hp.byLevel[90]).toBe(character.baseStats.hp);
      expect(character.baseStatCurves.atk.byLevel[90]).toBe(character.baseStats.atk);
      expect(character.baseStatCurves.def.byLevel[90]).toBe(character.baseStats.def);
    }
  });

  it("steps at the ascension breakpoints rather than growing smoothly", () => {
    // Ascension adds a flat bonus at levels 20/40/50/60/70/80, so the jump
    // across a breakpoint is larger than the jump either side of it. This
    // pins that the ascension bonus is actually in the curve — a curve built
    // from the growth multiplier alone would miss it and be uniformly low.
    const bennett = findCharacter("bennett")!;
    const hp = bennett.baseStatCurves.hp.byLevel;
    const acrossBreakpoint = hp[21]! - hp[20]!;
    const withinPhase = hp[20]! - hp[19]!;
    expect(acrossBreakpoint).toBeGreaterThan(withinPhase * 2);
  });
});

describe("generated roster — talent tables span every level the UI can offer", () => {
  it("carries all 15 talent levels on every scaling table", () => {
    // Frontend caps its talent selects at 11. The data supports 15, so the
    // control can widen without the data changing.
    for (const character of allCharacters) {
      for (const ability of allAbilities(character)) {
        for (const instance of ability.instances) {
          for (const scale of instance.scaling) {
            expect(scale.table.values).toHaveLength(MAX_TALENT_LEVEL);
          }
        }
      }
    }
  });
});
