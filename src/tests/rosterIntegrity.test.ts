import { describe, expect, it } from "vitest";
import {
  allCharacters,
  characterRosterEntries,
  charactersById,
  findCharacter,
  findRosterEntry,
} from "@/game-data/characters/registry";
import { allAbilities } from "@/simulation/character/character";
import type { CharacterRosterEntry, Element } from "@/types";

// ============================================================================
// Playable Character Roster Integrity Suite (TASK #030, revised TASK #037)
//
// Validates registry completeness, element coverage, Traveler single-identity
// architecture, level 90 stat boundaries, and kit multipliers/cooldowns across
// the whole generated roster.
//
// TASK #037: the hand-written `characters/traveler.ts` was deleted with the
// rest of the fabricated data. The Traveler's roster entry is now DERIVED by
// the registry from the generated forms' shared `identityId`, so this suite
// reaches it through the public `findRosterEntry("traveler")` seam. That is
// strictly the stronger test: it asserts the derivation produces one identity,
// rather than asserting an object the data agent hand-wrote says so.
// ============================================================================

/** Fails loudly instead of silently skipping if the identity disappears. */
function requireRosterEntry(
  entry: CharacterRosterEntry | undefined,
  identityId: string,
): CharacterRosterEntry {
  if (entry === undefined) {
    throw new Error(`roster entry "${identityId}" is missing from the registry`);
  }
  return entry;
}

const ALL_ELEMENTS = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
] as const;

type PlayableElement = (typeof ALL_ELEMENTS)[number];

describe("Roster Integrity — Playable Character Registry", () => {
  it("asserts all 80+ playable characters exist and load cleanly", () => {
    expect(allCharacters.length).toBeGreaterThanOrEqual(80);
    expect(charactersById.size).toBe(allCharacters.length);

    for (const char of allCharacters) {
      expect(char.id).toBeTruthy();
      expect(char.name).toBeTruthy();
      expect(char.element).toBeTruthy();
      expect(findCharacter(char.id)).toBe(char);
    }

  });

  /**
   * Support tier is PARTIAL roster-wide, and that is asserted as a POSITIVE
   * property rather than as "some FULL exist, some PARTIAL exist".
   *
   * The old assertion required at least one FULL character. It passed only
   * because the fabricated roster claimed FULL for kits whose passives and
   * constellations were invented; it is not a weaker assertion that broke, it
   * is an assertion that was checking an overclaim. Under the generated roster
   * every character's passives and constellations are empty, so FULL would
   * overstate the model in precisely the way the TASK #028 audit punished.
   *
   * This is therefore pinned from BOTH sides: nothing may claim FULL, and the
   * claim must carry a reason, so a future edit cannot quietly promote the
   * roster to FULL without this failing.
   */
  it("claims PARTIAL support roster-wide and never overclaims FULL", () => {
    const overclaiming = allCharacters.filter(
      (c) => c.claim.supportTier === "FULL",
    );
    expect(
      overclaiming.map((c) => c.id),
      "a character claims FULL support while passives and constellations are unmodelled",
    ).toEqual([]);

    for (const char of allCharacters) {
      expect(char.claim.supportTier, `${char.id} support tier`).toBe("PARTIAL");
      expect(
        char.claim.tierReason,
        `${char.id} claims a tier with no stated reason`,
      ).toBeTruthy();
    }

    // Every FORM of every roster entry carries the same claim, so the picker
    // cannot show a form badged differently from the character it belongs to.
    for (const entry of characterRosterEntries) {
      for (const form of entry.forms) {
        expect(
          form.claim.supportTier,
          `${entry.identityId} form ${form.formId} tier`,
        ).toBe("PARTIAL");
      }
    }
  });

  it("verifies every element has representation (Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro)", () => {
    const elementCounts: Record<PlayableElement, number> = {
      pyro: 0,
      hydro: 0,
      electro: 0,
      cryo: 0,
      anemo: 0,
      geo: 0,
      dendro: 0,
    };

    for (const char of allCharacters) {
      if (char.element !== "physical" && char.element in elementCounts) {
        elementCounts[char.element as PlayableElement]++;
      }
    }

    for (const elem of ALL_ELEMENTS) {
      expect(
        elementCounts[elem],
        `Element ${elem} must have at least 5 playable characters`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  /**
   * Traveler: ONE identity, MANY forms — the OQ-4 / N10 shape.
   *
   * The hand-written roster had 6 forms (one per element, no Cryo, one twin).
   * The generated roster has 14: both twins x 7 elements. The form COUNT is
   * therefore not the invariant — it changes every time a Traveler element
   * ships — so this asserts the properties that must hold at any count:
   * exactly one roster ENTRY, every form reachable from it, every form's
   * character resolving back to the same identity, and form ids unique.
   *
   * That is the property the party duplicate-guard depends on. Keying on
   * `identityId` is only safe if two Traveler forms genuinely share one.
   */
  it("verifies Traveler is ONE identity carrying all of its elemental forms (OQ-4 / N10)", () => {
    // 1. Roster entries list Traveler exactly ONCE, however many forms it has.
    const travelerEntries = characterRosterEntries.filter(
      (entry) => entry.identityId === "traveler",
    );
    expect(travelerEntries).toHaveLength(1);

    const traveler = requireRosterEntry(findRosterEntry("traveler"), "traveler");
    expect(traveler.identityId).toBe("traveler");
    // Value equality, NOT reference: `rosterEntryForIdentity` constructs a
    // fresh object per call, so `findRosterEntry("traveler")` and
    // `char.rosterEntry` are equal but not identical. See the DEFECT PIN at
    // the bottom of this file, which asserts that aliasing explicitly.
    expect(traveler).toEqual(travelerEntries[0]);

    // 2. Forms are unique by id and cover multiple distinct elements.
    const formIds = traveler.forms.map((f) => f.formId);
    expect(
      new Set(formIds).size,
      `Traveler has duplicate form ids: ${formIds.join(", ")}`,
    ).toBe(formIds.length);
    expect(traveler.forms.length).toBeGreaterThan(1);

    const travelerElements = new Set<Element>(traveler.forms.map((f) => f.element));
    // Anemo and Geo are the two the Traveler has had since launch; every other
    // element is patch-dependent and deliberately not required here.
    for (const elem of ["anemo", "geo"] as const) {
      expect(
        [...travelerElements],
        `Traveler must have an ${elem} form`,
      ).toContain(elem);
    }

    // 3. The registry's forms and its characters agree EXACTLY — no form
    //    listed that has no character, and no character orphaned from the entry.
    const travelerCharacters = allCharacters.filter(
      (c) => c.rosterEntry.identityId === "traveler",
    );
    expect(travelerCharacters.length).toBe(traveler.forms.length);
    expect([...formIds].sort()).toEqual(
      travelerCharacters.map((c) => c.id).sort(),
    );
    for (const tc of travelerCharacters) {
      expect(tc.rosterEntry).toEqual(traveler);
    }
  });

  /**
   * The duplicate-guard property, asserted against the REAL roster rather than
   * a fixture: every identity maps to exactly one roster entry, and every
   * character's form id belongs to its own identity's form list.
   *
   * uiux flagged (§5.6) that keying the party guard on form id instead of
   * identity id lets two Travelers into one party undetected. This asserts the
   * data shape that makes the identity key correct.
   */
  it("maps every identity to exactly one roster entry, with forms owned by that identity", () => {
    const entriesByIdentity = new Map<string, number>();
    for (const entry of characterRosterEntries) {
      entriesByIdentity.set(
        entry.identityId,
        (entriesByIdentity.get(entry.identityId) ?? 0) + 1,
      );
    }
    for (const [identityId, count] of entriesByIdentity) {
      expect(count, `identity ${identityId} has ${count} roster entries`).toBe(1);
    }

    // A form id appears under exactly one identity roster-wide.
    const identityByFormId = new Map<string, string>();
    for (const entry of characterRosterEntries) {
      for (const form of entry.forms) {
        const existing = identityByFormId.get(form.formId);
        expect(
          existing,
          `form ${form.formId} is claimed by both ${existing} and ${entry.identityId}`,
        ).toBeUndefined();
        identityByFormId.set(form.formId, entry.identityId);
      }
    }

    // Every character is reachable as a form of its own roster entry.
    for (const char of allCharacters) {
      expect(
        identityByFormId.get(char.id),
        `${char.id} is not listed as a form of any roster entry`,
      ).toBe(char.rosterEntry.identityId);
    }

    // Total forms across entries equals the character count exactly — no
    // character counted twice, none dropped.
    const totalForms = characterRosterEntries.reduce(
      (sum, entry) => sum + entry.forms.length,
      0,
    );
    expect(totalForms).toBe(allCharacters.length);
  });

  it("verifies all characters have valid Level 90 base stats (HP > 0, ATK > 0, DEF > 0, Crit Rate, Crit DMG, ER >= 1.0)", () => {
    for (const char of allCharacters) {
      expect(char.level, `${char.id} level`).toBe(90);

      const stats = char.baseStats;
      expect(stats.hp, `${char.id} HP`).toBeGreaterThan(0);
      expect(stats.atk, `${char.id} ATK`).toBeGreaterThan(0);
      expect(stats.def, `${char.id} DEF`).toBeGreaterThan(0);

      // Crit Rate >= 5% (base 0.05), Crit DMG >= 50% (base 0.50), ER >= 100% (base 1.0)
      expect(stats.critRate, `${char.id} critRate`).toBeGreaterThanOrEqual(0.05);
      expect(stats.critRate, `${char.id} critRate`).toBeLessThanOrEqual(1.0);

      expect(stats.critDmg, `${char.id} critDmg`).toBeGreaterThanOrEqual(0.5);

      expect(stats.energyRecharge, `${char.id} energyRecharge`).toBeGreaterThanOrEqual(1.0);

      // Max energy is non-negative and bounded. It is NOT asserted positive:
      // two characters have an energy cost the sources do not publish and it
      // is emitted as 0 rather than guessed. That set is pinned by name in the
      // UNVERIFIED block at the bottom of this file, so a THIRD such character
      // fails there rather than silently widening the exemption here.
      expect(char.maxEnergy, `${char.id} maxEnergy`).toBeGreaterThanOrEqual(0);
      expect(char.maxEnergy, `${char.id} maxEnergy`).toBeLessThanOrEqual(100);
    }
  });

  it("verifies all abilities (normal, skill, burst) have valid multipliers, cast times, and cooldowns", () => {
    for (const char of allCharacters) {
      const abilities = allAbilities(char);
      expect(
        abilities.length,
        `${char.id} must have abilities`,
      ).toBeGreaterThanOrEqual(3);

      // Normal attacks
      expect(char.normalAttacks.hits.length).toBeGreaterThanOrEqual(1);
      for (const na of char.normalAttacks.hits) {
        expect(na.castTime, `${char.id} NA castTime`).toBeGreaterThan(0);
        expect(na.instances.length, `${char.id} NA instances`).toBeGreaterThanOrEqual(1);
        for (const inst of na.instances) {
          expect(inst.scaling.length).toBeGreaterThanOrEqual(1);
          const mult = inst.scaling[0]!.table.values[0]!;
          expect(mult, `${char.id} NA multiplier`).toBeGreaterThan(0);
        }
      }

      // Elemental Skill
      expect(char.skill).toBeDefined();
      expect(char.skill.castTime, `${char.id} Skill castTime`).toBeGreaterThan(0);
      expect(char.skill.cooldown.values[0], `${char.id} Skill cooldown`).toBeGreaterThan(0);
      expect(char.skill.instances.length, `${char.id} Skill instances`).toBeGreaterThanOrEqual(1);
      for (const inst of char.skill.instances) {
        expect(inst.scaling.length).toBeGreaterThanOrEqual(1);
        const mult = inst.scaling[0]!.table.values[0]!;
        // Skill multiplier is >= 0 (some skills like Hu Tao E activate stance/infusion without direct initial damage)
        expect(mult, `${char.id} Skill multiplier`).toBeGreaterThanOrEqual(0);
      }

      // Elemental Burst
      expect(char.burst).toBeDefined();
      expect(char.burst.castTime, `${char.id} Burst castTime`).toBeGreaterThan(0);
      expect(char.burst.cooldown.values[0], `${char.id} Burst cooldown`).toBeGreaterThan(0);
      // energyCost mirrors maxEnergy EXACTLY, including when both are the
      // unpublished 0. Tying them together is the assertion that matters: a
      // burst that costs more than the character can ever hold is uncastable,
      // and that is detectable with no source at all.
      expect(char.burst.energyCost, `${char.id} Burst energyCost`).toBeGreaterThanOrEqual(0);
      expect(char.burst.energyCost, `${char.id} Burst energyCost`).toBe(char.maxEnergy);
      // Burst instances may be EMPTY: a support burst that only heals, shields
      // or buffs has no damage instance to emit, and inventing one would be
      // the overclaim the audit punished. The set is pinned by name below.
      for (const inst of char.burst.instances) {
        expect(inst.scaling.length).toBeGreaterThanOrEqual(1);
        const mult = inst.scaling[0]!.table.values[0]!;
        expect(mult, `${char.id} Burst multiplier`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("Roster Integrity — UNVERIFIED value shapes", () => {
  // ==========================================================================
  // CHANGE DETECTORS, not approvals.
  //
  // The generator emits an UNVERIFIED block for values neither source
  // publishes: it declines to guess, which is correct. But an unguessed value
  // still reaches the engine as a NUMBER — 0 energy cost, 0 damage instances,
  // a default cast time — and downstream code cannot tell an unpublished 0
  // from a real 0.
  //
  // These tests pin the SHAPE and MEMBERSHIP of those exemptions, in the same
  // spirit as the `PARTICLE_COLORLESS_MULTIPLIER` pin from TASK #017. They do
  // not assert the values are right. They assert that the set of things we are
  // uncertain about has not silently grown, and that a value moving off its
  // unverified default is noticed rather than absorbed.
  //
  // If one of these is SOURCED later, REPLACE the pin with the real assertion.
  // Do not simply add the new member to the list.
  // ==========================================================================

  /** Bursts whose energy cost neither source publishes; emitted as 0. */
  const UNVERIFIED_ZERO_BURST_ENERGY = ["mavuika", "skirk"] as const;

  /** Bursts that emit no damage instance (support / heal / buff bursts). */
  const UNVERIFIED_DAMAGELESS_BURSTS = [
    "arataki-itto",
    "barbara",
    "lauma",
    "linnea",
    "mika",
    "nahida",
    "sethos",
    "xiao",
  ] as const;

  it("pins exactly which bursts carry an UNVERIFIED zero energy cost", () => {
    const zeroCost = allCharacters
      .filter((c) => c.burst.energyCost === 0)
      .map((c) => c.id)
      .sort();
    expect(
      zeroCost,
      "the set of bursts with an unpublished energy cost has changed",
    ).toEqual([...UNVERIFIED_ZERO_BURST_ENERGY].sort());
  });

  it("pins exactly which bursts emit no damage instance", () => {
    const damageless = allCharacters
      .filter((c) => c.burst.instances.length === 0)
      .map((c) => c.id)
      .sort();
    expect(
      damageless,
      "the set of damageless bursts has changed",
    ).toEqual([...UNVERIFIED_DAMAGELESS_BURSTS].sort());
  });

  /**
   * A zero energy cost makes a burst castable at t=0 with no build-up, which
   * is a materially different rotation than the real character allows. This
   * asserts the consequence is REACHABLE and therefore visible, rather than
   * hiding behind a validator that happens to reject it for another reason.
   */
  it("shows an UNVERIFIED zero energy cost makes the burst castable from empty", () => {
    for (const id of UNVERIFIED_ZERO_BURST_ENERGY) {
      const char = findCharacter(id);
      expect(char, `${id} is missing from the roster`).toBeDefined();
      expect(char!.burst.energyCost).toBe(0);
      // Starting energy is 0, so a positive cost would make this uncastable.
      // The assertion is that the cost does not gate the cast at all today.
      expect(char!.maxEnergy).toBe(0);
    }
  });

  /**
   * Every ability has a cast time, and every one of them is currently an
   * ENGINE DEFAULT rather than a sourced value for at least some characters.
   * Pinning that they are all positive and drawn from a SMALL set of distinct
   * values is the change detector: a sourced cast time would be an arbitrary
   * measured number and would enlarge that set immediately.
   */
  it("pins that cast times come from a small set of engine defaults, not sourced values", () => {
    const castTimes = new Set<number>();
    for (const char of allCharacters) {
      for (const ability of allAbilities(char)) {
        expect(
          ability.castTime,
          `${char.id} / ${ability.id} cast time`,
        ).toBeGreaterThan(0);
        castTimes.add(ability.castTime);
      }
    }
    // A per-character sourced cast time would produce roughly one distinct
    // value per ability across 132 characters. A handful of shared defaults
    // produces a tiny set. This distinguishes the two without asserting any
    // particular default is correct.
    expect(
      castTimes.size,
      `cast times take ${castTimes.size} distinct values (${[...castTimes].sort((a, b) => a - b).join(", ")}) — if these are now sourced, replace this pin`,
    ).toBeLessThanOrEqual(8);
  });

  /**
   * Particle yields: pinned as a SHAPE, since the values themselves are
   * unpublished for some characters. A skill either emits a particle bundle
   * with a positive integer count and its own element, or emits none at all —
   * never a fractional or negative count, which would be a units error.
   */
  it("pins particle yields to a whole-number count with an element, or none", () => {
    const withoutParticles: string[] = [];
    for (const char of allCharacters) {
      const particles = char.skill.particles;
      if (particles === undefined) {
        withoutParticles.push(char.id);
        continue;
      }
      expect(
        Number.isInteger(particles.count),
        `${char.id} skill emits a fractional particle count ${particles.count}`,
      ).toBe(true);
      expect(particles.count, `${char.id} particle count`).toBeGreaterThan(0);
      expect(particles.element, `${char.id} particle element`).toBeTruthy();
    }
    // Skills with NO published particle yield are the 18-item UNVERIFIED set.
    // Pinned as a count bound rather than by name because the membership is
    // the generator's to change; a large jump means emission regressed.
    expect(
      withoutParticles.length,
      `${withoutParticles.length} skills emit no particles: ${withoutParticles.join(", ")}`,
    ).toBeLessThanOrEqual(20);
  });
});

describe("Roster Integrity — DEFECT PIN: roster entries are not shared instances", () => {
  /**
   * DEFECT PIN (routed to manager, TASK #037).
   *
   * `rosterEntryForIdentity` in `src/game-data/characters/registry.ts`
   * CONSTRUCTS A NEW OBJECT on every call, and it is called once per character
   * in `allCharacters`, once per identity in `characterRosterEntries`, and
   * again for `rosterEntriesByIdentity`. So for the Traveler alone there are
   * 15 structurally-equal but referentially-distinct `CharacterRosterEntry`
   * objects, and `findRosterEntry("traveler") === traveler.rosterEntry` is
   * FALSE.
   *
   * Concrete failing input:
   *   findCharacter("traveler-f-anemo")!.rosterEntry === findRosterEntry("traveler")
   *   -> false   (expected true; the two are `toEqual` but not `toBe`)
   *
   * Why it matters, beyond tidiness: React consumers key and memoise on
   * referential identity. A picker that stores the selected entry from
   * `characterRosterEntries` and compares it by reference against
   * `character.rosterEntry` will never match, and a `useMemo` keyed on the
   * entry will recompute on every render. It is also silently wasteful — the
   * roster allocates ~250 entry objects where 119 would do.
   *
   * This test asserts the CURRENT broken behaviour so the defect is visible.
   * When registry.ts memoises entries per identity, this fails and should be
   * REPLACED with the positive `toBe` assertion, not deleted.
   */
  it("DEFECT: findRosterEntry returns a different object than character.rosterEntry", () => {
    const character = findCharacter("traveler-f-anemo");
    expect(character, "traveler-f-anemo is missing from the roster").toBeDefined();
    const entry = findRosterEntry("traveler");
    expect(entry, "traveler roster entry is missing").toBeDefined();

    // Structurally identical...
    expect(character!.rosterEntry).toEqual(entry);
    // ...but not the same instance. When this flips, memoisation landed.
    expect(
      character!.rosterEntry === entry,
      "roster entries are now shared instances — replace this DEFECT pin with `expect(character.rosterEntry).toBe(entry)`",
    ).toBe(false);
  });

  /**
   * Bounds the defect precisely, so the pin above cannot be misread as
   * "the whole registry is referentially unstable".
   *
   * `characterRosterEntries` and `rosterEntriesByIdentity` DO share instances —
   * the map is built from the array. Only `PlayableCharacter.rosterEntry` is a
   * separate construction, because `allCharacters` calls
   * `rosterEntryForIdentity` again per character. Naming which half is broken
   * tells the owner exactly where the fix goes.
   */
  it("confirms the lookup map and the entry list DO share instances", () => {
    for (const entry of characterRosterEntries) {
      expect(
        findRosterEntry(entry.identityId),
        `${entry.identityId} lookup returned a different instance`,
      ).toBe(entry);
    }
  });

  it("DEFECT: every character's rosterEntry is a private copy", () => {
    const shared = allCharacters.filter(
      (char) => findRosterEntry(char.rosterEntry.identityId) === char.rosterEntry,
    );
    expect(
      shared.map((c) => c.id),
      "some characters now share the registry's roster entry instance — the fix has landed, replace these DEFECT pins",
    ).toEqual([]);
  });
});
