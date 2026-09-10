import { describe, expect, it } from "vitest";
import {
  activeArtifactEffects,
  allArtifactEffects,
  allArtifacts,
  findArtifact,
  findArtifactEffects,
  modelledArtifactEffects,
  LEGACY_ARTIFACT_ID_ALIASES,
} from "@/game-data/artifacts/registry";
import type { GeneratedArtifactEffect } from "@/game-data/artifacts/generated/setEffects";

// ============================================================================
// ADVERSARIAL audit of the REGENERATED artifact data (TASK #067).
//
// The retired hand-authored table passed every structural plausibility check
// and was still fabricated: 22 of 60 bonuses numerically contradicted, 6 of 31
// names invented, 5 sets describing sets that do not exist. The lesson from
// that audit is that STRUCTURAL checks are not PROVENANCE checks, so this file
// does both, and keeps them clearly separated.
//
// The strongest available provenance check without re-fetching the sources is
// INTERNAL CORROBORATION: a modelled row's structured `modifiers` must be
// recoverable from that row's OWN official text. The fabricated table failed
// exactly this - its numbers and its prose disagreed. This is not a claim that
// the text itself is correct; it is a claim that no number was invented beside
// the prose it is supposed to encode.
// ============================================================================

const PERCENT = /([\d.]+)%/g;

/** Percentages stated in a bonus's official English text, as fractions. */
function statedFractions(text: string): readonly number[] {
  return [...text.matchAll(PERCENT)].map((m) => Number(m[1]) / 100);
}

// ---------------------------------------------------------------------------
// BUCKET-COUNT PINS.
//
// The manager's requirement: a generator reclassification must be a VISIBLE
// test edit, never a silent shift in modelled damage. The weapon adapter pins
// 30 expressible rows; the artifact side had NO equivalent pin before this
// file. These numbers are the census of the data as landed.
// ---------------------------------------------------------------------------

describe("artifact bucket census — pinned", () => {
  it("pins the exact support census", () => {
    const census = { modelled: 0, unimplemented: 0, unverified: 0 };
    for (const effect of allArtifactEffects) census[effect.support] += 1;
    expect(census).toEqual({
      modelled: 46,
      unimplemented: 76,
      unverified: 0,
    });
  });

  it("pins the set and bonus counts", () => {
    expect(allArtifacts).toHaveLength(63);
    expect(allArtifactEffects).toHaveLength(122);
  });

  it("the pin DISCRIMINATES: modelled is a strict subset of all effects", () => {
    // A pin that could not move is not a pin. Promoting any single row from
    // unimplemented to modelled changes the first number above, and this
    // guards the direction: modelled must never be the whole set.
    const modelled = allArtifactEffects.filter((e) => e.support === "modelled");
    expect(modelled.length).toBeLessThan(allArtifactEffects.length);
    expect(modelled.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// PROVENANCE-STYLE checks: numbers must agree with their own prose.
// ---------------------------------------------------------------------------

describe("artifact modelled rows — internal corroboration", () => {
  const modelled = allArtifactEffects.filter((e) => e.support === "modelled");

  it("every modelled row carries at least one modifier", () => {
    for (const effect of modelled) {
      expect(effect.modifiers, effect.id).toBeDefined();
      expect(effect.modifiers?.length, effect.id).toBeGreaterThan(0);
    }
  });

  it("every fractional modifier value is stated in its own official text", () => {
    // The fabricated table's tell was numbers that its own prose contradicted.
    const orphans: string[] = [];
    for (const effect of modelled) {
      const stated = statedFractions(effect.text);
      for (const modifier of effect.modifiers ?? []) {
        // Flat values (Max HP +1000) are not percentages; skip those.
        if (Math.abs(modifier.value) >= 10) continue;
        if (!stated.some((p) => Math.abs(p - modifier.value) < 1e-9)) {
          orphans.push(`${effect.id}:${modifier.stat}=${modifier.value}`);
        }
      }
    }
    expect(orphans).toEqual([]);
  });

  it("no modelled row has a rounder distribution than real datamined data", () => {
    // The fabricated roster's tell was 331/669 values ending in the digit 5.
    // Artifact bonuses are genuinely round (18%, 20%, 35%), so this is NOT a
    // fabrication test here -- it pins that values are 2dp-or-fewer PERCENTAGES,
    // which is what official artifact prose actually publishes.
    for (const effect of modelled) {
      for (const modifier of effect.modifiers ?? []) {
        const asPercent = modifier.value * 100;
        expect(
          Math.abs(asPercent - Math.round(asPercent * 100) / 100),
          `${effect.id}:${modifier.stat}`,
        ).toBeLessThan(1e-9);
      }
    }
  });

  it("no non-modelled row leaks structured modifiers a caller could apply", () => {
    for (const effect of allArtifactEffects) {
      if (effect.support === "modelled") continue;
      expect(effect.modifiers, effect.id).toBeUndefined();
      expect(effect.reason, effect.id).toBeTruthy();
    }
  });

  it("every row states both English and Chinese official text", () => {
    for (const effect of allArtifactEffects) {
      expect(effect.text.length, effect.id).toBeGreaterThan(0);
      expect(effect.textZh.length, effect.id).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// STRUCTURAL integrity — the checks the fabricated table also passed, kept
// because they still catch generator faults, but never mistaken for provenance.
// ---------------------------------------------------------------------------

describe("artifact structural integrity", () => {
  it("effect ids are unique", () => {
    const ids = allArtifactEffects.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("set ids and slugs are unique", () => {
    const ids = allArtifacts.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every effect's setSlug resolves to a real set", () => {
    for (const effect of allArtifactEffects) {
      expect(findArtifact(effect.setSlug), effect.id).toBeDefined();
    }
  });

  it("every effect's piece count is 1, 2 or 4", () => {
    for (const effect of allArtifactEffects) {
      expect([1, 2, 4], effect.id).toContain(effect.pieces);
    }
  });

  it("effect id encodes its own set and piece count", () => {
    for (const effect of allArtifactEffects) {
      expect(effect.id).toBe(`${effect.setSlug}-${effect.pieces}pc`);
    }
  });

  it("no set declares the same piece tier twice", () => {
    const seen = new Map<string, Set<number>>();
    for (const effect of allArtifactEffects) {
      const tiers = seen.get(effect.setSlug) ?? new Set<number>();
      expect(tiers.has(effect.pieces), effect.id).toBe(false);
      tiers.add(effect.pieces);
      seen.set(effect.setSlug, tiers);
    }
  });
});

// ---------------------------------------------------------------------------
// THRESHOLD behaviour — the same off-by-one that matters in the engine.
// ---------------------------------------------------------------------------

describe("artifact effect activation thresholds", () => {
  /** A set with both a 2pc and a 4pc bonus, chosen from the real data. */
  const twoAndFour = (() => {
    for (const set of allArtifacts) {
      const effects = findArtifactEffects(set.id);
      if (
        effects.some((e) => e.pieces === 2) &&
        effects.some((e) => e.pieces === 4)
      ) {
        return set.id;
      }
    }
    throw new Error("fixture precondition: no set has both a 2pc and a 4pc");
  })();

  it.each([0, 1])("%i pieces activates nothing", (count) => {
    expect(activeArtifactEffects(twoAndFour, count)).toEqual([]);
  });

  it.each([2, 3])("%i pieces activates the 2pc tier only", (count) => {
    const active = activeArtifactEffects(twoAndFour, count);
    expect(active.map((e) => e.pieces)).toEqual([2]);
  });

  it.each([4, 5])("%i pieces activates BOTH tiers, as the game does", (count) => {
    const active = activeArtifactEffects(twoAndFour, count);
    expect(active.map((e) => e.pieces).sort()).toEqual([2, 4]);
  });

  it("negative and fractional piece counts activate nothing extra", () => {
    expect(activeArtifactEffects(twoAndFour, -1)).toEqual([]);
    expect(activeArtifactEffects(twoAndFour, 1.9).map((e) => e.pieces)).toEqual([]);
    expect(activeArtifactEffects(twoAndFour, 3.9).map((e) => e.pieces)).toEqual([2]);
  });

  it("modelled-only never returns a non-modelled row at any piece count", () => {
    for (const set of allArtifacts) {
      for (const count of [0, 1, 2, 3, 4, 5]) {
        for (const effect of modelledArtifactEffects(set.id, count)) {
          expect(effect.support, effect.id).toBe("modelled");
          expect(count, effect.id).toBeGreaterThanOrEqual(effect.pieces);
        }
      }
    }
  });

  it("an unknown set id yields nothing rather than throwing", () => {
    expect(findArtifactEffects("no-such-set")).toEqual([]);
    expect(activeArtifactEffects("no-such-set", 4)).toEqual([]);
    expect(modelledArtifactEffects("no-such-set", 4)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// LEGACY ALIASES — a saved build must still resolve, and never to a WRONG set.
// ---------------------------------------------------------------------------

describe("legacy artifact id aliases", () => {
  it("every alias target is a real generated set", () => {
    for (const [legacy, target] of LEGACY_ARTIFACT_ID_ALIASES) {
      expect(findArtifact(target), `${legacy} -> ${target}`).toBeDefined();
    }
  });

  it("no alias shadows a live generated id", () => {
    // If a legacy id were also a real id, the alias would be unreachable and
    // the mapping silently dead.
    for (const legacy of LEGACY_ARTIFACT_ID_ALIASES.keys()) {
      const direct = allArtifacts.some((set) => set.id === legacy);
      expect(direct, legacy).toBe(false);
    }
  });

  it("aliases are injective — two legacy ids never claim one set", () => {
    const targets = [...LEGACY_ARTIFACT_ID_ALIASES.values()];
    expect(new Set(targets).size).toBe(targets.length);
  });

  it("resolution through an alias is identical to direct resolution", () => {
    for (const [legacy, target] of LEGACY_ARTIFACT_ID_ALIASES) {
      expect(findArtifact(legacy)).toBe(findArtifact(target));
    }
  });
});

// ---------------------------------------------------------------------------
// DETERMINISM.
// ---------------------------------------------------------------------------

describe("artifact lookups — determinism", () => {
  it("repeated lookups return identically-ordered results", () => {
    const snapshot = (): string =>
      JSON.stringify(
        allArtifacts.map((set) => activeArtifactEffects(set.id, 4).map((e) => e.id)),
      );
    expect(new Set([snapshot(), snapshot(), snapshot()]).size).toBe(1);
  });

  it("effects for a set come back ascending by piece count", () => {
    for (const set of allArtifacts) {
      const pieces = findArtifactEffects(set.id).map(
        (e: GeneratedArtifactEffect) => e.pieces,
      );
      expect([...pieces].sort((a, b) => a - b), set.id).toEqual(pieces);
    }
  });
});
