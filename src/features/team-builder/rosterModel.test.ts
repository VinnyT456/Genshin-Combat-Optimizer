import { describe, expect, it } from "vitest";
import { characters, testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import {
  ELEMENT_OPTIONS,
  RARITY_OPTIONS,
  WEAPON_OPTIONS,
  filterRoster,
  formatSupportTier,
  getCharacterMetadata,
  matchesSearch,
  normalizeSearchString,
} from "@/features/team-builder/rosterModel";

describe("rosterModel - metadata resolution", () => {
  it("resolves authored character metadata from the registry", () => {
    // Weapon type and rarity are SOURCED facts and stay pinned per character.
    // The support tier is NOT per-character any more: the generated roster
    // claims PARTIAL for everyone, because passives and constellations are
    // unmodelled. Pinning "Full" here previously only worked because the
    // fabricated roster overclaimed. See `rosterIntegrity.test.ts`.
    const bennett = getCharacterMetadata("bennett");
    expect(bennett.weaponType).toBe("sword");
    expect(bennett.rarity).toBe(4);

    const raiden = getCharacterMetadata("raiden-shogun");
    expect(raiden.weaponType).toBe("polearm");
    expect(raiden.rarity).toBe(5);

    const xiangling = getCharacterMetadata("xiangling");
    expect(xiangling.weaponType).toBe("polearm");
    expect(xiangling.rarity).toBe(4);

    const xingqiu = getCharacterMetadata("xingqiu");
    expect(xingqiu.weaponType).toBe("sword");
    expect(xingqiu.rarity).toBe(4);

    // Raiden National members are NOT promoted. A selected constellation and
    // its reconciled talent boosts now reach the engine, but that does not make
    // every defining mechanic fully simulated. The National kit supplies TEAM BUFFS, wired separately in
    // `simulationAdapter`; that is not a support-tier claim.
    for (const meta of [bennett, raiden, xiangling, xingqiu]) {
      expect(meta.supportTier).toBe("PARTIAL");
      expect(formatSupportTier(meta.supportTier).label).toBe("Partial");
      // A `partial` character must carry a named reason (DESIGN-SYSTEM).
      expect(meta.tierReason).toBeDefined();
    }

    const huTao = getCharacterMetadata("hu-tao");
    expect(huTao.weaponType).toBe("polearm");
    expect(huTao.rarity).toBe(5);

    const klee = getCharacterMetadata("klee");
    expect(klee.weaponType).toBe("catalyst");
    expect(klee.rarity).toBe(5);

    const nahida = getCharacterMetadata("nahida");
    expect(nahida.weaponType).toBe("catalyst");
    expect(nahida.rarity).toBe(5);

    for (const meta of [huTao, klee, nahida]) {
      expect(formatSupportTier(meta.supportTier).label).toBe("Partial");
    }
  });

  it("provides graceful fallbacks for test characters", () => {
    const pyroTest = getCharacterMetadata("test-pyro");
    expect(pyroTest.weaponType).toBe("sword");
    expect(pyroTest.rarity).toBe(5);
    expect(pyroTest.supportTier).toBe("FULL");

    const hydroTest = getCharacterMetadata("test-hydro");
    expect(hydroTest.weaponType).toBe("catalyst");

    const unknown = getCharacterMetadata("non-existent-character");
    expect(unknown.weaponType).toBe("sword");
    expect(unknown.rarity).toBe(5);
    expect(unknown.supportTier).toBe("FULL");
  });
});

describe("rosterModel - support tier formatting", () => {
  it("maps FULL / full to 'Full' with success state", () => {
    expect(formatSupportTier("FULL")).toEqual({ label: "Full", state: "success" });
    expect(formatSupportTier("full")).toEqual({ label: "Full", state: "success" });
  });

  it("maps PARTIAL / partial to 'Partial' with warning state", () => {
    expect(formatSupportTier("PARTIAL")).toEqual({ label: "Partial", state: "warning" });
    expect(formatSupportTier("partial")).toEqual({ label: "Partial", state: "warning" });
  });

  it("maps DATA_ONLY and NOT_IMPLEMENTED to 'Data' with info state", () => {
    expect(formatSupportTier("DATA_ONLY")).toEqual({ label: "Data", state: "info" });
    expect(formatSupportTier("NOT_IMPLEMENTED")).toEqual({ label: "Data", state: "info" });
  });

  it("maps basic to 'Basic' with info state", () => {
    expect(formatSupportTier("basic")).toEqual({ label: "Basic", state: "info" });
    expect(formatSupportTier("BASIC")).toEqual({ label: "Basic", state: "info" });
  });

  it("defaults undefined or empty tier to 'Full' with success state", () => {
    expect(formatSupportTier(undefined)).toEqual({ label: "Full", state: "success" });
    expect(formatSupportTier("")).toEqual({ label: "Full", state: "success" });
  });
});

describe("rosterModel - search normalization & matching", () => {
  it("normalizes text and strips diacritics", () => {
    expect(normalizeSearchString("Noëlle")).toBe("noelle");
    expect(normalizeSearchString("  RAIDEN  ")).toBe("raiden");
    expect(normalizeSearchString("Kazuha")).toBe("kazuha");
  });

  it("matches search query against name, element, or weapon", () => {
    const meta = getCharacterMetadata("bennett");
    const bennettDef = characters.find((c) => c.id === "bennett")!;

    // Empty query matches everything
    expect(matchesSearch(bennettDef, "", meta)).toBe(true);

    // Name match (case-insensitive)
    expect(matchesSearch(bennettDef, "bennett", meta)).toBe(true);
    expect(matchesSearch(bennettDef, "BENN", meta)).toBe(true);

    // Element match
    expect(matchesSearch(bennettDef, "pyro", meta)).toBe(true);

    // Weapon match
    expect(matchesSearch(bennettDef, "sword", meta)).toBe(true);

    // Non-match
    expect(matchesSearch(bennettDef, "hydro", meta)).toBe(false);
    expect(matchesSearch(bennettDef, "bow", meta)).toBe(false);
  });
});

describe("rosterModel - multi-facet filtering", () => {
  it("verifies the full roster contains all 80+ playable characters", () => {
    expect(characters.length).toBeGreaterThanOrEqual(80);
  });

  it("filters accurately by element", () => {
    const pyroChars = filterRoster(characters, {
      element: "pyro",
      weapon: "all",
      rarity: "all",
      query: "",
    });
    expect(pyroChars.length).toBeGreaterThan(10);
    expect(pyroChars.every((c) => c.element === "pyro")).toBe(true);

    const hydroChars = filterRoster(characters, {
      element: "hydro",
      weapon: "all",
      rarity: "all",
      query: "",
    });
    expect(hydroChars.length).toBeGreaterThan(10);
    expect(hydroChars.every((c) => c.element === "hydro")).toBe(true);
  });

  it("filters accurately by weapon type", () => {
    const bowChars = filterRoster(characters, {
      element: "all",
      weapon: "bow",
      rarity: "all",
      query: "",
    });
    expect(bowChars.length).toBeGreaterThan(10);
    expect(
      bowChars.every((c) => getCharacterMetadata(c.id).weaponType === "bow"),
    ).toBe(true);

    const catalystChars = filterRoster(characters, {
      element: "all",
      weapon: "catalyst",
      rarity: "all",
      query: "",
    });
    expect(catalystChars.length).toBeGreaterThan(10);
    expect(
      catalystChars.every((c) => getCharacterMetadata(c.id).weaponType === "catalyst"),
    ).toBe(true);
  });

  it("filters accurately by rarity", () => {
    const fiveStars = filterRoster(characters, {
      element: "all",
      weapon: "all",
      rarity: 5,
      query: "",
    });
    expect(fiveStars.length).toBeGreaterThan(30);
    expect(fiveStars.every((c) => getCharacterMetadata(c.id).rarity === 5)).toBe(true);

    const fourStars = filterRoster(characters, {
      element: "all",
      weapon: "all",
      rarity: 4,
      query: "",
    });
    expect(fourStars.length).toBeGreaterThan(30);
    expect(fourStars.every((c) => getCharacterMetadata(c.id).rarity === 4)).toBe(true);
  });

  it("combines multiple facets (Element + Weapon + Rarity)", () => {
    // Pyro + Polearm (Xiangling, Hu Tao, Thoma, Chevreuse, Arlecchino)
    const pyroPolearms = filterRoster(characters, {
      element: "pyro",
      weapon: "polearm",
      rarity: "all",
      query: "",
    });
    expect(pyroPolearms.length).toBeGreaterThanOrEqual(4);

    // Pyro + Polearm + 5★ (Hu Tao, Arlecchino)
    const fiveStarPyroPolearms = filterRoster(characters, {
      element: "pyro",
      weapon: "polearm",
      rarity: 5,
      query: "",
    });
    expect(fiveStarPyroPolearms.length).toBeGreaterThanOrEqual(2);
    const ids = fiveStarPyroPolearms.map((c) => c.id);
    expect(ids).toContain("hu-tao");
    expect(ids).toContain("arlecchino");
  });

  it("combines search query with facet filters", () => {
    const results = filterRoster(characters, {
      element: "pyro",
      weapon: "all",
      rarity: "all",
      query: "bennett",
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("bennett");
  });

  it("returns empty when no characters match impossible criteria", () => {
    const results = filterRoster(characters, {
      element: "hydro",
      weapon: "claymore",
      rarity: 5,
      query: "",
    });
    // Aino is a 4★ Hydro claymore; no 5★ Hydro claymore users exist in Genshin
    expect(results).toHaveLength(0);
  });

  it("verifies facet option arrays match design specifications", () => {
    expect(ELEMENT_OPTIONS.map((o) => o.id)).toEqual([
      "all",
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "anemo",
      "geo",
      "dendro",
    ]);

    expect(WEAPON_OPTIONS.map((o) => o.id)).toEqual([
      "all",
      "sword",
      "claymore",
      "polearm",
      "bow",
      "catalyst",
    ]);

    expect(RARITY_OPTIONS.map((o) => o.id)).toEqual(["all", 5, 4]);
  });

  it("proves that deploying ANY character from the full roster into a party simulates without error", () => {
    // Take every single character in the 80+ playable roster
    expect(characters.length).toBeGreaterThanOrEqual(80);

    for (const char of characters) {
      const rotation = [
        { characterId: char.id, actionType: "skill" as const },
        { characterId: char.id, actionType: "normal" as const },
      ];
      expect(() => {
        const result = simulateRotation([char], rotation, testEnemy);
        expect(result.duration).toBeGreaterThan(0);
        expect(Number.isFinite(result.totalDamage)).toBe(true);
      }).not.toThrow();
    }
  });
});
