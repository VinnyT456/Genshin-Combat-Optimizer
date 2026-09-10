import { describe, it, expect } from "vitest";
import {
  allArtifacts,
  findArtifact,
  artifactsById,
  allArtifactEffects,
  activeArtifactEffects,
  modelledArtifactEffects,
  LEGACY_ARTIFACT_ID_ALIASES,
} from "../game-data/artifacts/registry";
import {
  generatedArtifactSets,
  type GeneratedArtifactSlot,
} from "../game-data/artifacts/generated/artifactSets";

describe("Artifacts Registry", () => {
  it("should have artifacts loaded", () => {
    expect(allArtifacts.length).toBeGreaterThan(0);
    expect(generatedArtifactSets.length).toBeGreaterThan(0);
  });

  it("should find an artifact by id", () => {
    const artifact = findArtifact("gladiators-finale");
    expect(artifact).toBeDefined();
    expect(artifact?.nameZh).toBe("角斗士的终幕礼");
  });

  it("should find an artifact case-insensitively", () => {
    const artifact = findArtifact("GLADIATORS-FINALE");
    expect(artifact).toBeDefined();
    expect(artifact?.id).toBe("gladiators-finale");
  });

  it("should have correct bonuses for a 5-star artifact", () => {
    const artifact = findArtifact("crimson-witch-of-flames");
    expect(artifact).toBeDefined();
    expect(artifact?.rarity).toBe(5);
    const twoPc = artifact?.bonuses.find((b) => b.pieces === 2);
    expect(twoPc?.descriptionZh).toContain("火元素伤害加成");
  });

  it("should return undefined for unknown artifact id", () => {
    const artifact = findArtifact("unknown-artifact");
    expect(artifact).toBeUndefined();
  });

  it("should map ids correctly in artifactsById", () => {
    const artifact = artifactsById.get("noblesse-oblige");
    expect(artifact).toBeDefined();
    expect(artifact?.nameEn).toBe("Noblesse Oblige");
  });
});

describe("Legacy artifact id aliases", () => {
  // A saved build written before the regeneration must still resolve to the
  // set the user actually picked -- silently selecting a DIFFERENT set would be
  // worse than failing, so every alias is asserted to land on a real set.
  it("resolves every retired id to an existing set", () => {
    for (const [legacyId, currentId] of LEGACY_ARTIFACT_ID_ALIASES) {
      const viaAlias = findArtifact(legacyId);
      expect(viaAlias, `alias ${legacyId} resolves`).toBeDefined();
      expect(viaAlias?.id).toBe(currentId);
    }
  });

  it("never aliases an id that is already a live set id", () => {
    // An alias shadowing a real id would hijack a valid lookup.
    for (const legacyId of LEGACY_ARTIFACT_ID_ALIASES.keys()) {
      expect(artifactsById.has(legacyId)).toBe(false);
    }
  });
});

describe("Artifact set effects", () => {
  it("keeps every effect joined to a real set", () => {
    for (const effect of allArtifactEffects) {
      expect(
        artifactsById.has(effect.setSlug),
        `${effect.id} joins a real set`,
      ).toBe(true);
    }
  });

  it("carries an honest support flag on every row", () => {
    for (const effect of allArtifactEffects) {
      expect(["modelled", "unimplemented", "unverified"]).toContain(
        effect.support,
      );
      // Anything not fully modelled must say why, or the flag is unusable.
      if (effect.support !== "modelled") {
        expect(effect.reason, `${effect.id} states a reason`).toBeTruthy();
      }
    }
  });

  it("emits structured modifiers only for modelled rows", () => {
    // The whole point of the split: an unverified row must never carry a
    // number a caller could mistake for a usable one.
    for (const effect of allArtifactEffects) {
      if (effect.support === "unverified") {
        expect(effect.modifiers, `${effect.id} withholds modifiers`).toBeUndefined();
      }
    }
  });

  it("activates bonuses cumulatively by piece count", () => {
    const four = activeArtifactEffects("gladiators-finale", 4);
    const two = activeArtifactEffects("gladiators-finale", 2);
    const one = activeArtifactEffects("gladiators-finale", 1);
    expect(four.map((e) => e.pieces)).toEqual([2, 4]);
    expect(two.map((e) => e.pieces)).toEqual([2]);
    expect(one).toHaveLength(0);
  });

  it("fails closed: modelled-only excludes unimplemented rows", () => {
    const all = activeArtifactEffects("gladiators-finale", 4);
    const modelled = modelledArtifactEffects("gladiators-finale", 4);
    expect(modelled.length).toBeLessThanOrEqual(all.length);
    for (const effect of modelled) {
      expect(effect.support).toBe("modelled");
    }
  });

  it("resolves effects through a legacy id too", () => {
    expect(activeArtifactEffects("crimson-witch", 4).length).toBeGreaterThan(0);
  });

  it("has no effects for an unknown set", () => {
    expect(activeArtifactEffects("unknown-artifact", 4)).toHaveLength(0);
  });
});

describe("Artifact data provenance", () => {
  it("gives every full set five slots", () => {
    // A five-piece set must publish all five, or a slot was silently dropped.
    // The "Prayers" relics (source ids 15009-15013) are genuinely single-piece
    // circlets in game -- one affix, one `suit` entry -- so they are the one
    // legitimate exception rather than an incomplete fetch.
    for (const set of generatedArtifactSets) {
      const singlePiece = set.bonuses.every((b) => b.pieces === 1);
      expect(set.pieces.length, `${set.id} piece count`).toBe(
        singlePiece ? 1 : 5,
      );
    }
  });

  it("orders pieces in the engine's slot order", () => {
    const order: readonly GeneratedArtifactSlot[] = [
      "flower",
      "plume",
      "sands",
      "goblet",
      "circlet",
    ];
    for (const set of generatedArtifactSets) {
      const slots = set.pieces.map((p) => p.slot);
      // Whatever subset a set has, it appears in canonical slot order.
      expect(slots).toEqual(order.filter((slot) => slots.includes(slot)));
    }
  });

  it("uses unique set ids", () => {
    const ids = generatedArtifactSets.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every set at least one bonus with Chinese display text", () => {
    for (const set of generatedArtifactSets) {
      expect(set.bonuses.length).toBeGreaterThan(0);
      for (const bonus of set.bonuses) {
        expect(bonus.descriptionZh.length).toBeGreaterThan(0);
      }
    }
  });
});
