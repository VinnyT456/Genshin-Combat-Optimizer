import { describe, expect, it } from "vitest";
import type {
  CharacterFormId,
  CharacterForm,
  CharacterIdentityId,
  CharacterRosterEntry,
  PlacedCharacter,
  SupportClaim,
} from "@/types";
import {
  findDuplicateIdentity,
  formOf,
  hasMultipleForms,
  isSameCharacter,
} from "@/types";
import { allAbilities } from "@/simulation/character/character";
import { planAbility } from "@/simulation/character/execution";
import { syntheticN1, syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// N10 — Traveler: ONE identity carrying a list of forms.
//
// The failure being designed out: a party duplicate-guard that keys on FORM id
// instead of IDENTITY id lets two Travelers (Anemo + Geo) into one party
// undetected, because their form ids differ. uiux flagged this as the single
// highest-risk bug in the character UI.
//
// N9 — support tier is AUTHORED, never inferred.
// ============================================================================

const id = (s: string) => s as CharacterIdentityId;
const form = (s: string) => s as CharacterFormId;

const BASIC: SupportClaim = { supportTier: "BASIC", tierReason: "Nothing special is claimed." };

function makeForm(f: string, element: CharacterForm["element"]): CharacterForm {
  return {
    formId: form(f),
    element,
    formLabel: `${element} form`,
    claim: BASIC,
  };
}

/** The Traveler: ONE entry, six forms. Not six entries, not six copies. */
const TRAVELER: CharacterRosterEntry = {
  identityId: id("traveler"),
  name: "Traveler",
  forms: [
    makeForm("traveler-anemo", "anemo"),
    makeForm("traveler-geo", "geo"),
    makeForm("traveler-electro", "electro"),
    makeForm("traveler-dendro", "dendro"),
    makeForm("traveler-hydro", "hydro"),
    makeForm("traveler-pyro", "pyro"),
  ],
};

/** An ordinary character: one entry, exactly one form. */
const DILUC: CharacterRosterEntry = {
  identityId: id("diluc"),
  name: "Diluc",
  forms: [makeForm("diluc", "pyro")],
};

describe("N10 — the Traveler is one entry with many forms", () => {
  it("is a SINGLE roster entry, not six", () => {
    const roster: readonly CharacterRosterEntry[] = [TRAVELER, DILUC];
    expect(roster.filter((e) => e.name === "Traveler")).toHaveLength(1);
    expect(TRAVELER.forms).toHaveLength(6);
  });

  it("never renames the character after its form", () => {
    // §5.4: the name is `Traveler`, never `Anemo Traveler`.
    expect(TRAVELER.name).toBe("Traveler");
    for (const f of TRAVELER.forms) expect(f.formLabel).not.toContain("Traveler");
  });

  it("distinguishes multi-form from single-form entries", () => {
    expect(hasMultipleForms(TRAVELER)).toBe(true);
    expect(hasMultipleForms(DILUC)).toBe(false);
  });

  it("guarantees at least one form at the type level", () => {
    // `forms` is a non-empty tuple type, so `[0]` needs no runtime guard.
    const first: CharacterForm = TRAVELER.forms[0];
    expect(first.element).toBe("anemo");
  });
});

describe("N10 — the duplicate guard keys on IDENTITY", () => {
  const anemoTraveler: PlacedCharacter = {
    identityId: id("traveler"),
    formId: form("traveler-anemo"),
  };
  const geoTraveler: PlacedCharacter = {
    identityId: id("traveler"),
    formId: form("traveler-geo"),
  };
  const diluc: PlacedCharacter = { identityId: id("diluc"), formId: form("diluc") };

  it("reports two DIFFERENT-form Travelers as the SAME character", () => {
    // This is the assertion the form-id bug would fail.
    expect(isSameCharacter(anemoTraveler, geoTraveler)).toBe(true);
    expect(anemoTraveler.formId).not.toBe(geoTraveler.formId);
  });

  it("still distinguishes genuinely different characters", () => {
    expect(isSameCharacter(anemoTraveler, diluc)).toBe(false);
  });

  it("rejects a party holding two Travelers in different forms", () => {
    expect(findDuplicateIdentity([anemoTraveler, diluc, geoTraveler])).toBe(
      id("traveler"),
    );
  });

  it("accepts a legal party", () => {
    expect(findDuplicateIdentity([anemoTraveler, diluc])).toBeUndefined();
  });

  it("counts a FORMLESS Traveler as present — identity may not repeat", () => {
    const formless: PlacedCharacter = { identityId: id("traveler") };
    expect(findDuplicateIdentity([formless, geoTraveler])).toBe(id("traveler"));
    // Formless is a real state (§5.4: no silent default to one element).
    expect(formless.formId).toBeUndefined();
    expect(formOf(TRAVELER, formless)).toBeUndefined();
  });

  it("ignores empty slots", () => {
    expect(findDuplicateIdentity([anemoTraveler, undefined, undefined])).toBeUndefined();
    expect(findDuplicateIdentity([undefined, undefined])).toBeUndefined();
  });

  it("resolves the chosen form when one is chosen", () => {
    expect(formOf(TRAVELER, geoTraveler)?.element).toBe("geo");
    // An id that is not one of this entry's forms resolves to nothing rather
    // than to a plausible-looking wrong form.
    expect(formOf(DILUC, geoTraveler)).toBeUndefined();
  });
});

describe("N9 — support tier is an authored claim", () => {
  it("carries the tier PER FORM, since forms are implemented independently", () => {
    const mixed: CharacterRosterEntry = {
      ...TRAVELER,
      forms: [
        { ...makeForm("traveler-anemo", "anemo"), claim: { supportTier: "FULL" } },
        {
          ...makeForm("traveler-dendro", "dendro"),
          claim: {
            supportTier: "PARTIAL",
            tierReason: "Lea Lotus Lamp's aura is not simulated.",
          },
        },
      ] as unknown as CharacterRosterEntry["forms"],
    };
    expect(mixed.forms[0].claim.supportTier).toBe("FULL");
    expect(mixed.forms[1]!.claim.supportTier).toBe("PARTIAL");
    // Collapsing to one character-level tier would overstate the weaker form.
    expect(mixed.forms[0].claim.supportTier).not.toBe(
      mixed.forms[1]!.claim.supportTier,
    );
  });

  it("requires a reason for a partial claim and forbids one otherwise", () => {
    const partial: SupportClaim = {
      supportTier: "PARTIAL",
      tierReason: "Burst infusion is not modelled.",
    };
    expect(partial.tierReason).toBeTruthy();

    // @ts-expect-error a `partial` claim MUST state which mechanic is missing.
    const noReason: SupportClaim = { supportTier: "PARTIAL" };
    void noReason;

    // @ts-expect-error a `full` claim has nothing to excuse.
    const fullWithReason: SupportClaim = {
      supportTier: "FULL",
      tierReason: "should not compile",
    };
    void fullWithReason;
  });

  it("is not derivable from the data — an empty kit can still claim `full`", () => {
    // Precisely the point: the tier is a CLAIM, so it cannot be back-computed.
    // qa's coverage matrix derives an independent tier; a disagreement between
    // the two is a defect to surface, not something either side should fix by
    // computing the other.
    const claim: SupportClaim = { supportTier: "FULL" };
    expect(claim.supportTier).toBe("FULL");
  });
});

describe("N13 — ability and instance ordering is stable and documented", () => {
  it("orders allAbilities: normal string, charged, plunges, skill, burst", () => {
    const CONTRACT = [
      "normal",
      "charged",
      "plungeLow",
      "plungeHigh",
      "skill",
      "burst",
    ] as const;

    const order = allAbilities(syntheticUnit).map((a) => a.slot);
    // Every emitted slot appears at a non-decreasing contract rank, i.e. the
    // sequence is exactly CONTRACT with the absent optional slots removed —
    // skipped, never emitted as holes.
    const ranks = order.map((slot) => CONTRACT.indexOf(slot));
    expect(ranks).not.toContain(-1);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i]!).toBeGreaterThanOrEqual(ranks[i - 1]!);
    }
    // skill and burst are mandatory and always last, in that order.
    expect(order.slice(-2)).toEqual(["skill", "burst"]);
    // The normal string comes first, in authored N1..Nn order.
    expect(order[0]).toBe("normal");
  });

  it("is referentially stable across calls", () => {
    expect(allAbilities(syntheticUnit).map((a) => a.id)).toEqual(
      allAbilities(syntheticUnit).map((a) => a.id),
    );
  });

  it("preserves instance AUTHORING order, never re-sorting by delay", () => {
    const authored = syntheticN1.instances.map((i) => i.id);
    const planned = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 0,
      icd: {},
    }).map((h) => h.instanceId);
    // Index alignment between `instances` and `PlannedHit`s is the guarantee.
    expect(planned).toEqual(authored);
  });

  it("keeps authoring order even when delays are DESCENDING", () => {
    // The case that would differ under a sort: later-authored hit lands first.
    const reordered = {
      ...syntheticN1,
      instances: [
        { ...syntheticN1.instances[0]!, id: "late", delay: 1 },
        { ...syntheticN1.instances[1]!, id: "early", delay: 0 },
      ],
    };
    const planned = planAbility({
      character: syntheticUnit,
      ability: reordered,
      startTime: 0,
      icd: {},
    });
    expect(planned.map((h) => h.instanceId)).toEqual(["late", "early"]);
    // Timestamps are genuinely out of order — proof no sort happened.
    expect(planned[0]!.timestamp).toBeGreaterThan(planned[1]!.timestamp);
  });
});
