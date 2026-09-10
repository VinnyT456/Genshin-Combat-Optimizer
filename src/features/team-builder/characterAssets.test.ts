import { describe, expect, it } from "vitest";
import { allCharacters } from "@/game-data/characters/registry";
import {
  AVATAR_CDN_HOST,
  AVATAR_FALLBACK_CDN_HOST,
  MISSING_ICON_IDS,
  deriveAssetName,
  getAvatarInitials,
  getAvatarSources,
  resolveAssetName,
} from "./characterAssets";

describe("deriveAssetName", () => {
  it("strips separators and diacritics", () => {
    expect(deriveAssetName("Bennett")).toBe("Bennett");
    expect(deriveAssetName("Yun Jin")).toBe("YunJin");
    expect(deriveAssetName("Noëlle")).toBe("Noelle");
    expect(deriveAssetName("Traveler (Pyro)")).toBe("TravelerPyro");
  });
});

describe("resolveAssetName", () => {
  it("prefers the verified override over the derived name", () => {
    // Regression guard: deriving from the display name yields "Amber", which
    // 404s upstream. The override is the only correct answer.
    expect(deriveAssetName("Amber")).toBe("Amber");
    expect(resolveAssetName("amber", "Amber")).toBe("Ambor");
  });

  it("maps every codename class measured against the CDN", () => {
    expect(resolveAssetName("jean", "Jean")).toBe("Qin");
    expect(resolveAssetName("noelle", "Noelle")).toBe("Noel");
    expect(resolveAssetName("raiden-shogun", "Raiden Shogun")).toBe("Shougun");
    expect(resolveAssetName("hu-tao", "Hu Tao")).toBe("Hutao");
    expect(resolveAssetName("kamisato-ayaka", "Kamisato Ayaka")).toBe("Ayaka");
    expect(resolveAssetName("kirara", "Kirara")).toBe("Momoka");
  });

  it("collapses Traveler forms onto one portrait PER GENDER", () => {
    // The elemental forms share an icon, but the two Travelers do not share
    // one with each other — deriving from the display name would.
    for (const element of ["anemo", "geo", "electro", "dendro", "hydro", "pyro", "cryo"]) {
      expect(resolveAssetName(`traveler-m-${element}`, `Traveler (${element})`)).toBe(
        "PlayerBoy",
      );
      expect(resolveAssetName(`traveler-f-${element}`, `Traveler (${element})`)).toBe(
        "PlayerGirl",
      );
    }
  });

  it("returns null for characters with no published icon", () => {
    expect(resolveAssetName("skirk", "Skirk")).toBeNull();
    expect(resolveAssetName("sandrone", "Sandrone")).toBeNull();
  });

  it("falls back to derivation for an unknown id", () => {
    expect(resolveAssetName("test-pyro", "Test Pyro")).toBe("TestPyro");
  });
});

describe("getAvatarSources", () => {
  it("builds primary and fallback URLs on the configured hosts", () => {
    const sources = getAvatarSources("bennett", "Bennett");
    expect(sources.primary).toBe(
      `https://${AVATAR_CDN_HOST}/data/assets/avataricon/UI_AvatarIcon_Bennett.webp`,
    );
    expect(sources.fallback).toBe(
      `https://${AVATAR_FALLBACK_CDN_HOST}/assets/UI/UI_AvatarIcon_Bennett.png`,
    );
  });

  it("yields no URL at all when the icon is known to be absent", () => {
    // Requesting a URL that is known to 404 would flash a broken image; the
    // placeholder must render immediately instead.
    expect(getAvatarSources("skirk", "Skirk")).toEqual({ primary: null, fallback: null });
  });

  it("uses the override in the built URL, not the display name", () => {
    expect(getAvatarSources("amber", "Amber").primary).toContain("UI_AvatarIcon_Ambor.webp");
  });
});

describe("getAvatarInitials", () => {
  it("uses one initial per word for multi-word names", () => {
    expect(getAvatarInitials("Hu Tao")).toBe("HT");
    expect(getAvatarInitials("Raiden Shogun")).toBe("RS");
  });

  it("uses the first two letters of a single-word name", () => {
    expect(getAvatarInitials("Bennett")).toBe("BE");
  });

  it("never returns an empty string", () => {
    expect(getAvatarInitials("")).toBe("?");
    expect(getAvatarInitials("   ")).toBe("?");
  });
});

describe("roster coverage (guards the real data, not a fixture)", () => {
  it("resolves a portrait for every character except the known-missing ones", () => {
    const unresolved = allCharacters
      .filter((character) => resolveAssetName(character.id, character.name) === null)
      .map((character) => character.id);
    expect([...unresolved].sort()).toEqual([...MISSING_ICON_IDS].sort());
  });

  it("never derives a name containing a separator", () => {
    // A separator surviving into the URL means a new name shape appeared that
    // the derivation does not handle; every CDN filename is alphanumeric.
    for (const character of allCharacters) {
      const assetName = resolveAssetName(character.id, character.name);
      if (assetName === null) continue;
      expect(assetName).toMatch(/^[A-Za-z0-9]+$/);
    }
  });
});
