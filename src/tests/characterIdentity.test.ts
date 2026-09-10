import { describe, expect, it } from "vitest";

import type {
  CharacterFormId,
  CharacterIdentityId,
  CharacterRosterEntry,
  Element,
  PlacedCharacter,
  SupportClaim,
} from "@/types";
import {
  findDuplicateIdentity,
  formOf,
  hasMultipleForms,
  isSameCharacter,
} from "@/types";

// ============================================================================
// CHARACTER IDENTITY & ELEMENTAL FORMS (N10) — adversarial regression.
//
// uiux flagged "two Traveler FORMS both enter one party" as the highest-risk
// bug in the character UI. The failure is nasty because it looks correct: an
// Anemo Traveler and a Geo Traveler have different FORM ids, so a naive
// `a.id === b.id` reports two different characters and the party guard passes.
//
// The N10 design defends against this with BRANDED ids and a single roster
// entry per character. This file attacks that defence from outside:
//
//   1. The guard must reject two Travelers in ANY form combination, including
//      a formless one.
//   2. The guard must NOT reject two genuinely different characters that
//      happen to share an element.
//   3. The brand must make the WRONG comparison a compile error, and the right
//      one the only thing that typechecks.
//
// No production code is touched: these are pure-function contract tests.
// ============================================================================

// ---------------------------------------------------------------------------
// Fixtures. Ids are cast at the boundary only, exactly as real data would be.
// ---------------------------------------------------------------------------

function identity(id: string): CharacterIdentityId {
  return id as CharacterIdentityId;
}

function form(id: string): CharacterFormId {
  return id as CharacterFormId;
}

const FULL_CLAIM: SupportClaim = { supportTier: "FULL" };

function makeForm(
  id: string,
  element: Element,
  claim: SupportClaim = FULL_CLAIM,
) {
  return {
    formId: form(id),
    element,
    formLabel: `${element} form`,
    claim,
  };
}

/**
 * The Traveler: ONE roster entry with six elemental forms.
 *
 * Built here as six FORMS under one identity — the shape N10 mandates —
 * precisely so a test can prove the guard sees one character, not six.
 */
const TRAVELER: CharacterRosterEntry = {
  identityId: identity("traveler"),
  name: "Traveler",
  forms: [
    makeForm("traveler-anemo", "anemo"),
    makeForm("traveler-geo", "geo"),
    makeForm("traveler-electro", "electro", {
      supportTier: "PARTIAL",
      tierReason: "Stack-gated behaviour is not simulated.",
    }),
    makeForm("traveler-dendro", "dendro"),
    makeForm("traveler-hydro", "hydro"),
    makeForm("traveler-pyro", "pyro"),
  ],
};

/** An ordinary single-form character. */
const ORDINARY: CharacterRosterEntry = {
  identityId: identity("ordinary-anemo-unit"),
  name: "Ordinary Anemo Unit",
  forms: [makeForm("ordinary-anemo-unit-form", "anemo")],
};

const OTHER: CharacterRosterEntry = {
  identityId: identity("other-unit"),
  name: "Other Unit",
  forms: [makeForm("other-unit-form", "anemo")],
};

function place(
  entry: CharacterRosterEntry,
  formId?: CharacterFormId,
): PlacedCharacter {
  return formId === undefined
    ? { identityId: entry.identityId }
    : { identityId: entry.identityId, formId };
}

// ---------------------------------------------------------------------------
// The duplicate guard
// ---------------------------------------------------------------------------

describe("Traveler duplicate guard: two FORMS are still ONE character", () => {
  it("rejects EVERY pair of distinct Traveler forms", () => {
    // The exhaustive attack: all 15 unordered pairs of the six forms. A guard
    // that compared forms instead of identity would pass all 15.
    const forms = TRAVELER.forms;
    let pairsChecked = 0;
    for (let i = 0; i < forms.length; i += 1) {
      for (let j = i + 1; j < forms.length; j += 1) {
        const party = [
          place(TRAVELER, forms[i]!.formId),
          place(TRAVELER, forms[j]!.formId),
        ];
        expect(findDuplicateIdentity(party)).toBe(TRAVELER.identityId);
        expect(isSameCharacter(party[0]!, party[1]!)).toBe(true);
        pairsChecked += 1;
      }
    }
    // Guards against the loop silently doing nothing.
    expect(pairsChecked).toBe(15);
  });

  it("rejects the SAME Traveler form twice", () => {
    const party = [
      place(TRAVELER, form("traveler-anemo")),
      place(TRAVELER, form("traveler-anemo")),
    ];
    expect(findDuplicateIdentity(party)).toBe(TRAVELER.identityId);
  });

  it("rejects a FORMLESS Traveler alongside a formed one, in either slot order", () => {
    // §5.4 lets a Traveler enter a slot with no form chosen. It is still the
    // same identity, so the guard must fire — otherwise a user can seat two
    // Travelers by leaving one unchosen and pick its element afterwards.
    const formless = place(TRAVELER);
    const formed = place(TRAVELER, form("traveler-geo"));

    expect(findDuplicateIdentity([formless, formed])).toBe(
      TRAVELER.identityId,
    );
    expect(findDuplicateIdentity([formed, formless])).toBe(
      TRAVELER.identityId,
    );
    expect(isSameCharacter(formless, formed)).toBe(true);
  });

  it("rejects TWO formless Travelers", () => {
    expect(findDuplicateIdentity([place(TRAVELER), place(TRAVELER)])).toBe(
      TRAVELER.identityId,
    );
  });

  it("catches the duplicate wherever it sits in a 4-slot party", () => {
    const traveler = place(TRAVELER, form("traveler-pyro"));
    const dup = place(TRAVELER, form("traveler-hydro"));
    const positions: readonly (readonly (PlacedCharacter | undefined)[])[] = [
      [traveler, dup, place(ORDINARY), place(OTHER)],
      [traveler, place(ORDINARY), dup, place(OTHER)],
      [traveler, place(ORDINARY), place(OTHER), dup],
      [place(ORDINARY), traveler, place(OTHER), dup],
      [undefined, traveler, undefined, dup],
    ];
    for (const party of positions) {
      expect(findDuplicateIdentity(party)).toBe(TRAVELER.identityId);
    }
  });
});

describe("the duplicate guard does NOT over-reject", () => {
  it("accepts a legal party of four distinct characters", () => {
    const party = [
      place(TRAVELER, form("traveler-anemo")),
      place(ORDINARY, form("ordinary-anemo-unit-form")),
      place(OTHER, form("other-unit-form")),
      undefined,
    ];
    expect(findDuplicateIdentity(party)).toBeUndefined();
  });

  it("accepts two DIFFERENT characters that share an element", () => {
    // All three fixtures above can be Anemo. Element is not identity.
    expect(
      findDuplicateIdentity([
        place(TRAVELER, form("traveler-anemo")),
        place(ORDINARY, form("ordinary-anemo-unit-form")),
        place(OTHER, form("other-unit-form")),
      ]),
    ).toBeUndefined();
  });

  it("ignores empty slots entirely", () => {
    expect(findDuplicateIdentity([])).toBeUndefined();
    expect(
      findDuplicateIdentity([undefined, undefined, undefined, undefined]),
    ).toBeUndefined();
    expect(
      findDuplicateIdentity([undefined, place(TRAVELER), undefined]),
    ).toBeUndefined();
  });

  it("returns the FIRST duplicate identity when there are two of them", () => {
    // Determinism: the reported identity must not depend on iteration luck.
    const party = [
      place(TRAVELER, form("traveler-anemo")),
      place(ORDINARY),
      place(TRAVELER, form("traveler-geo")),
      place(ORDINARY),
    ];
    expect(findDuplicateIdentity(party)).toBe(TRAVELER.identityId);
  });
});

// ---------------------------------------------------------------------------
// The brand is the defence — the wrong comparison must not typecheck
// ---------------------------------------------------------------------------

describe("branded ids make the WRONG comparison impossible to write", () => {
  it("isSameCharacter compares identity ONLY, ignoring the chosen form", () => {
    const a: PlacedCharacter = {
      identityId: identity("x"),
      formId: form("x-anemo"),
    };
    const b: PlacedCharacter = {
      identityId: identity("x"),
      formId: form("x-geo"),
    };
    const c: PlacedCharacter = {
      identityId: identity("y"),
      formId: form("x-anemo"),
    };

    expect(isSameCharacter(a, b)).toBe(true);
    // ...and crucially, a SHARED form id across different identities is NOT
    // the same character. A form-keyed guard would get this backwards.
    expect(isSameCharacter(a, c)).toBe(false);
  });

  it("a CharacterFormId cannot be used where a CharacterIdentityId is expected", () => {
    // The brand is a compile-time defence, so the runtime assertion here can
    // only witness that the two brands are distinct nominal types. The real
    // proof is the @ts-expect-error directives below: if the brand were ever
    // weakened to a bare `string`, these would stop erroring and the test
    // would FAIL to compile — a loud, deliberate breakage.
    // NOTE on directive PLACEMENT: for an object literal, TypeScript reports
    // the error at the offending PROPERTY line, not at the statement. A
    // directive placed above the `const` is therefore "unused" and tsc fails
    // with TS2578 — which is itself useful, since it means these cannot be
    // silently satisfied by an error somewhere else on the statement.
    const bad: PlacedCharacter = {
      // @ts-expect-error a form id is not an identity id
      identityId: form("traveler-anemo"),
    };
    expect(bad).toBeDefined();

    const alsoBad: PlacedCharacter = {
      identityId: identity("traveler"),
      // @ts-expect-error an identity id is not a form id
      formId: identity("traveler"),
    };
    expect(alsoBad).toBeDefined();

    const plainString: PlacedCharacter = {
      // @ts-expect-error a bare string is neither
      identityId: "traveler",
    };
    expect(plainString).toBeDefined();
  });

  it("isSameCharacter is reflexive, symmetric and transitive", () => {
    const a = place(TRAVELER, form("traveler-anemo"));
    const b = place(TRAVELER, form("traveler-geo"));
    const c = place(TRAVELER);
    const d = place(ORDINARY);

    expect(isSameCharacter(a, a)).toBe(true);
    expect(isSameCharacter(a, b)).toBe(isSameCharacter(b, a));
    expect(isSameCharacter(a, d)).toBe(isSameCharacter(d, a));
    expect(isSameCharacter(a, b) && isSameCharacter(b, c)).toBe(true);
    expect(isSameCharacter(a, c)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

describe("elemental forms", () => {
  it("hasMultipleForms distinguishes the Traveler from everyone else", () => {
    expect(hasMultipleForms(TRAVELER)).toBe(true);
    expect(hasMultipleForms(ORDINARY)).toBe(false);
  });

  it("formOf resolves the chosen form and returns undefined when none is chosen", () => {
    expect(formOf(TRAVELER, place(TRAVELER, form("traveler-geo")))?.element).toBe(
      "geo",
    );
    expect(formOf(TRAVELER, place(TRAVELER))).toBeUndefined();
  });

  it("formOf returns undefined for a form that belongs to ANOTHER character", () => {
    // A cross-wired formId must not silently resolve to a plausible form.
    expect(
      formOf(ORDINARY, {
        identityId: ORDINARY.identityId,
        formId: form("traveler-anemo"),
      }),
    ).toBeUndefined();
  });

  it("each form carries its OWN support claim — they are not collapsed", () => {
    // Collapsing six forms to one character-level tier would overstate the
    // weaker ones. The electro form is deliberately `partial` here.
    const claims = TRAVELER.forms.map((f) => f.claim.supportTier);
    expect(new Set(claims).size).toBeGreaterThan(1);

    const electro = TRAVELER.forms.find((f) => f.element === "electro")!;
    expect(electro.claim.supportTier).toBe("PARTIAL");
    expect(
      electro.claim.supportTier === "PARTIAL" ? electro.claim.tierReason : "",
    ).toContain("not simulated");
  });

  it("a `partial` claim CANNOT omit its reason (enforced by the union)", () => {
    // A UNION mismatch is reported at the variable, not at the property, so
    // these directives sit above the statement (unlike the branded-id ones).
    // @ts-expect-error `partial` requires `tierReason`
    const missing: SupportClaim = { supportTier: "PARTIAL" };
    expect(missing).toBeDefined();

    // @ts-expect-error `full` forbids `tierReason`
    const spurious: SupportClaim = {
      supportTier: "FULL",
      tierReason: "should not be allowed",
    };
    expect(spurious).toBeDefined();
  });

  it("the display name is the CHARACTER name, never the form", () => {
    // "Anemo Traveler" is a form label, not a character name. Renaming the
    // entry per element would give the duplicate guard a second thing to key
    // on and reintroduce the bug it was designed out of.
    expect(TRAVELER.name).toBe("Traveler");
    for (const f of TRAVELER.forms) {
      expect(f.formLabel).not.toBe(TRAVELER.name);
      expect(f.formLabel).toContain("form");
    }
  });

  it("every roster entry has at least one form (non-empty by contract)", () => {
    for (const entry of [TRAVELER, ORDINARY, OTHER]) {
      expect(entry.forms.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("form ids are unique within an entry", () => {
    const ids = TRAVELER.forms.map((f) => f.formId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
