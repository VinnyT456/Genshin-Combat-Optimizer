import { describe, it, expect } from "vitest";
import {
  DEFAULT_URL_STATE,
  TEAM_SLOTS,
  decodeUrlState,
  encodeUrlState,
  urlStateEquals,
  urlStateToPath,
  type UrlState,
} from "./urlState";

function stateWith(overrides: Partial<UrlState>): UrlState {
  return { ...DEFAULT_URL_STATE, ...overrides };
}

describe("urlState", () => {
  describe("defaults are omitted", () => {
    it("encodes fully-default state as an empty query", () => {
      expect(encodeUrlState(DEFAULT_URL_STATE)).toBe("");
    });

    it("maps default state to the bare path, not a dangling '?'", () => {
      expect(urlStateToPath(DEFAULT_URL_STATE)).toBe("/");
    });

    it("omits each filter that is at its default", () => {
      const encoded = encodeUrlState(
        stateWith({ filters: { ...DEFAULT_URL_STATE.filters, element: "pyro" } }),
      );
      expect(encoded).toBe("el=pyro");
    });
  });

  describe("team encoding is positional", () => {
    it("preserves the slot of a character after an empty slot", () => {
      const state = stateWith({ team: [null, "xingqiu", null, null] });
      expect(encodeUrlState(state)).toBe("team=%2Cxingqiu");
      expect(decodeUrlState(encodeUrlState(state)).team).toEqual([
        null,
        "xingqiu",
        null,
        null,
      ]);
    });

    it("drops trailing empty slots rather than padding with commas", () => {
      const state = stateWith({ team: ["bennett", null, null, null] });
      expect(encodeUrlState(state)).toBe("team=bennett");
    });

    it("round-trips a full team", () => {
      const team = ["raiden-shogun", "xingqiu", "xiangling", "bennett"];
      const state = stateWith({ team });
      expect(decodeUrlState(encodeUrlState(state)).team).toEqual(team);
    });

    it("always decodes to exactly TEAM_SLOTS entries", () => {
      expect(decodeUrlState("team=a").team).toHaveLength(TEAM_SLOTS);
      expect(decodeUrlState("").team).toHaveLength(TEAM_SLOTS);
      expect(decodeUrlState("team=a,b,c,d,e,f").team).toHaveLength(TEAM_SLOTS);
    });
  });

  describe("decoding is total", () => {
    it("falls back to defaults for unknown values", () => {
      const decoded = decodeUrlState("view=nonsense&el=lightning&wp=hammer&rr=9");
      expect(decoded.view).toBe("all");
      expect(decoded.filters.element).toBe("all");
      expect(decoded.filters.weapon).toBe("all");
      expect(decoded.filters.rarity).toBe("all");
    });

    it("does not throw on malformed input", () => {
      expect(() => decodeUrlState("%%%&&&==")).not.toThrow();
      expect(() => decodeUrlState("team=")).not.toThrow();
    });

    it("treats a blank team parameter as an empty team", () => {
      expect(decodeUrlState("team=").team).toEqual([null, null, null, null]);
    });
  });

  describe("round-trip fidelity", () => {
    it("round-trips a fully-populated state", () => {
      const state: UrlState = {
        team: ["bennett", null, "xiangling", null],
        filters: { element: "pyro", weapon: "polearm", rarity: 4, query: "香菱" },
      view: "results",
        mode: "uid",
      };
      expect(decodeUrlState(encodeUrlState(state))).toEqual(state);
    });

    it("round-trips a CJK search query", () => {
      const state = stateWith({
        filters: { ...DEFAULT_URL_STATE.filters, query: "雷电将军" },
      });
      expect(decodeUrlState(encodeUrlState(state)).filters.query).toBe("雷电将军");
    });

    it("round-trips rarity as a number, not a string", () => {
      const state = stateWith({
        filters: { ...DEFAULT_URL_STATE.filters, rarity: 5 },
      });
      expect(decodeUrlState(encodeUrlState(state)).filters.rarity).toBe(5);
    });
  });

  describe("urlStateEquals", () => {
    it("is true for states that encode identically", () => {
      expect(urlStateEquals(DEFAULT_URL_STATE, { ...DEFAULT_URL_STATE })).toBe(true);
    });

    it("is false when the view differs", () => {
      expect(
        urlStateEquals(DEFAULT_URL_STATE, stateWith({ view: "setup" })),
      ).toBe(false);
    });
  });
});
