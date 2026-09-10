import { describe, expect, it } from "vitest";
import { allArtifacts } from "@/game-data/artifacts/registry";
import {
  ARTIFACT_CDN_HOST,
  ARTIFACT_FALLBACK_CDN_HOST,
  getArtifactIconSources,
  getArtifactInitial,
} from "./artifactAssets";

describe("getArtifactIconSources", () => {
  it("builds primary and fallback URLs on the configured hosts", () => {
    const sources = getArtifactIconSources("UI_RelicIcon_15025_4");
    expect(sources.primary).toBe(
      `https://${ARTIFACT_CDN_HOST}/data/assets/artifacts/UI_RelicIcon_15025_4.webp`,
    );
    expect(sources.fallback).toBe(
      `https://${ARTIFACT_FALLBACK_CDN_HOST}/assets/UI/reliquary/UI_RelicIcon_15025_4.png`,
    );
  });

  it("uses the iconId's own slot suffix verbatim", () => {
    // The four single-piece resistance relics publish ONLY `_3`; `_4` 404s for
    // them. Normalising every set to one slot would break exactly those four,
    // so the suffix must survive untouched.
    const sources = getArtifactIconSources("UI_RelicIcon_15009_3");
    expect(sources.primary).toContain("UI_RelicIcon_15009_3.webp");
    expect(sources.primary).not.toContain("_4");
  });

  it("never emits the known-404 path the generated iconUrl field uses", () => {
    // `iconUrl` in the generated data omits `/reliquary/` and 404s for 63/63
    // sets. Regression guard: if someone reintroduces that shape, this fails.
    const sources = getArtifactIconSources("UI_RelicIcon_10001_4");
    expect(sources.fallback).toContain("/assets/UI/reliquary/");
    expect(sources.fallback).not.toMatch(/\/assets\/UI\/UI_RelicIcon/);
  });

  it("yields no URL for a missing icon id", () => {
    expect(getArtifactIconSources(undefined)).toEqual({ primary: null, fallback: null });
  });

  it("yields no URL for a malformed icon id rather than guessing", () => {
    for (const bad of ["", "UI_RelicIcon_15025", "UI_RelicIcon_15025_9", "15025_4", "../etc"]) {
      expect(getArtifactIconSources(bad)).toEqual({ primary: null, fallback: null });
    }
  });
});

describe("getArtifactInitial", () => {
  it("uses the first character of the Chinese name", () => {
    expect(getArtifactInitial("绝缘之旗印")).toBe("绝");
  });

  it("never returns an empty string", () => {
    expect(getArtifactInitial("")).toBe("?");
    expect(getArtifactInitial("   ")).toBe("?");
  });
});

describe("artifact coverage (guards the real registry, not a fixture)", () => {
  it("resolves an icon for every set in the registry", () => {
    const unresolved = allArtifacts
      .filter((set) => getArtifactIconSources(set.iconId).primary === null)
      .map((set) => set.id);
    expect(unresolved).toEqual([]);
  });

  it("covers a non-trivial registry, so the check above cannot pass vacuously", () => {
    expect(allArtifacts.length).toBeGreaterThan(50);
  });

  it("only ever emits the two hosts declared in next.config.mjs", () => {
    // A third host would be silently blocked by `next/image` at runtime.
    for (const set of allArtifacts) {
      const { primary, fallback } = getArtifactIconSources(set.iconId);
      expect(primary).toContain(`https://${ARTIFACT_CDN_HOST}/`);
      expect(fallback).toContain(`https://${ARTIFACT_FALLBACK_CDN_HOST}/`);
    }
  });
});
