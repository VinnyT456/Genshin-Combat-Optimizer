import { describe, it, expect } from "vitest";
import { allCharacters } from "@/game-data/characters/registry";
import { getCharacterMetadata } from "./rosterModel";
import {
  computeTierPresentation,
  shouldShowCardReason,
  shouldShowCardTier,
  type TierClaimLike,
} from "./tierPresentation";

const PARTIAL: TierClaimLike = {
  supportTier: "PARTIAL",
  tierReason: "Damage kit sourced. Of 9 constellations, 0 are modelled.",
};
/** Same tier, DIFFERENT reason — the shape the live roster actually has. */
const PARTIAL_OTHER_REASON: TierClaimLike = {
  supportTier: "PARTIAL",
  tierReason: "Damage kit sourced. Of 10 constellations, 1 is modelled.",
};
const FULL: TierClaimLike = { supportTier: "FULL", tierReason: undefined };

describe("tierPresentation", () => {
  describe("baseline is keyed on TIER ALONE", () => {
    // This is the ruling on UI-AUDIT-055 F1 and the whole point of the module.
    const roster = [PARTIAL, PARTIAL_OTHER_REASON, { ...PARTIAL }];
    const presentation = computeTierPresentation(roster);

    it("states the claim once even though every reason differs", () => {
      expect(presentation.showRosterStatement).toBe(true);
      expect(presentation.baseline?.supportTier).toBe("PARTIAL");
    });

    it("carries NO reason on the baseline — one character's sentence is not the roster's", () => {
      expect(presentation.baseline).not.toBeNull();
      expect(presentation.baseline).not.toHaveProperty("tierReason");
    });

    it("suppresses the per-card chip for every character sharing the tier", () => {
      for (const character of roster) {
        expect(shouldShowCardTier(character, presentation)).toBe(false);
      }
    });

    it("suppresses the per-card REASON while the roster statement shows", () => {
      // 132 x ~250-character paragraphs is the noise the module exists to stop.
      for (const character of roster) {
        expect(shouldShowCardReason(character, presentation)).toBe(false);
      }
    });

    it("does NOT treat a differing reason at the same tier as a deviation", () => {
      // The inverse of this assertion is the exact bug F1 filed: keying on
      // (tier, reason) made all 132 cards "deviate" and restored 132 chips.
      const uniform = computeTierPresentation([PARTIAL, { ...PARTIAL }]);
      expect(shouldShowCardTier(PARTIAL_OTHER_REASON, uniform)).toBe(false);
    });
  });

  describe("deviation in TIER is what earns a chip", () => {
    it("shows a chip for a character whose tier deviates from a stated baseline", () => {
      const uniform = computeTierPresentation([PARTIAL, PARTIAL_OTHER_REASON]);
      expect(shouldShowCardTier(FULL, uniform)).toBe(true);
    });

    it("makes no roster-level claim when tiers disagree", () => {
      const presentation = computeTierPresentation([PARTIAL, FULL]);
      expect(presentation.showRosterStatement).toBe(false);
      expect(presentation.baseline).toBeNull();
    });

    it("falls back to a chip on every card, including the majority tier", () => {
      const presentation = computeTierPresentation([PARTIAL, { ...PARTIAL }, FULL]);
      expect(shouldShowCardTier(PARTIAL, presentation)).toBe(true);
      expect(shouldShowCardTier(FULL, presentation)).toBe(true);
    });

    it("restores the per-card reason when no roster statement is showing", () => {
      const presentation = computeTierPresentation([PARTIAL, FULL]);
      expect(shouldShowCardReason(PARTIAL, presentation)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("makes no claim for an empty roster", () => {
      const presentation = computeTierPresentation([]);
      expect(presentation.showRosterStatement).toBe(false);
      expect(presentation.baseline).toBeNull();
    });

    it("never shows a reason for a character that has none", () => {
      const presentation = computeTierPresentation([FULL, PARTIAL]);
      expect(shouldShowCardReason(FULL, presentation)).toBe(false);
    });
  });

  describe("against the real roster, as the UI actually renders it", () => {
    // Goes through getCharacterMetadata, NOT the raw registry claim: that is
    // the function CharacterPicker feeds the presentation, so it is the only
    // one whose uniformity governs what a user sees.
    const claims: TierClaimLike[] = allCharacters.map((c) => {
      const meta = getCharacterMetadata(c.id);
      return { supportTier: meta.supportTier, tierReason: meta.tierReason };
    });

    it("has a roster large enough for repetition to matter", () => {
      expect(claims.length).toBeGreaterThan(100);
    });

    it("states one claim for the whole roster and shows zero per-card chips", () => {
      const presentation = computeTierPresentation(claims);
      expect(presentation.showRosterStatement).toBe(true);
      expect(presentation.baseline?.supportTier).toBe("PARTIAL");
      const chipped = claims.filter((c) => shouldShowCardTier(c, presentation));
      expect(chipped).toHaveLength(0);
    });

    // UI-AUDIT-055 F1's explicit ask: this finding was a DATA change silently
    // killing a UI decision. These two tests are the tripwire. If either fails,
    // re-read §7.3 and decide deliberately; do not just update the number.
    it("TRIPWIRE: exactly one distinct supportTier — the baseline's premise", () => {
      const tiers = new Set(claims.map((c) => c.supportTier));
      expect([...tiers].sort()).toEqual(["PARTIAL"]);
    });

    it("TRIPWIRE: reasons are MANY and per-character, so they must not key the baseline", () => {
      const reasons = new Set(claims.map((c) => c.tierReason));
      // Category assertion, not an exact count: the point is many-not-one.
      // If this collapses to 1, reasons became uniform and could rejoin the
      // baseline; if it were 1 today, keying on (tier, reason) would have
      // looked correct and F1 would not have been catchable here.
      expect(reasons.size).toBeGreaterThan(1);
    });
  });
});
