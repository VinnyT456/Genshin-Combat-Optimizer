import { describe, expect, it } from "vitest";
import { generatedArtifactEffects } from "@/game-data/artifacts/generated";
import { buffsForSetBonus } from "@/game-data/artifacts/setBonusBuffs";
import {
  ARTIFACT_SUPPORT_LABEL_ZH,
  artifactBonusSupport,
  artifactBonusSupportAt,
  setHasModelledBonus,
} from "./artifactSupportPresentation";

describe("artifact bonus support", () => {
  it("orders a set's bonuses ascending by piece count", () => {
    for (const effect of generatedArtifactEffects) {
      const rows = artifactBonusSupport(effect.setSlug);
      const pieces = rows.map((r) => r.pieces);
      expect([...pieces].sort((a, b) => a - b)).toEqual(pieces);
    }
  });

  it("always carries the official Chinese wording", () => {
    // "Not simulated" must never mean "not shown".
    for (const effect of generatedArtifactEffects) {
      const row = artifactBonusSupportAt(effect.setSlug, effect.pieces);
      expect(row?.textZh).toBe(effect.textZh);
      expect(row!.textZh.length).toBeGreaterThan(0);
    }
  });

  it("surfaces the generator's own reason for every unimplemented bonus", () => {
    let checked = 0;
    for (const effect of generatedArtifactEffects) {
      if (effect.support === "modelled") continue;
      const row = artifactBonusSupportAt(effect.setSlug, effect.pieces);
      expect(row?.kind).toBe(effect.support);
      if (effect.reason !== undefined) {
        expect(row?.reason).toBe(effect.reason);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("never attaches a reason to a modelled bonus", () => {
    for (const effect of generatedArtifactEffects) {
      if (effect.support !== "modelled") continue;
      const row = artifactBonusSupportAt(effect.setSlug, effect.pieces);
      expect(row?.reason).toBeUndefined();
      expect(row?.label).toBe(ARTIFACT_SUPPORT_LABEL_ZH.modelled);
    }
  });

  it("returns undefined for a tier the set does not publish", () => {
    expect(artifactBonusSupportAt("gladiators-finale", 3)).toBeUndefined();
    expect(artifactBonusSupport("no-such-set-id")).toEqual([]);
  });

  it("reports runtime-compiled effects separately from source support", () => {
    const heartDepth = artifactBonusSupportAt("heart-of-depth", 4);
    expect(heartDepth?.kind).toBe("unimplemented");
    expect(heartDepth?.runtimeSupported).toBe(true);
    expect(heartDepth?.runtimeLabel).toBe("已接入模拟（条件效果）");

    const tinyMiracle = artifactBonusSupportAt("tiny-miracle", 2);
    expect(tinyMiracle?.runtimeSupported).toBe(true);

    expect(
      artifactBonusSupportAt("ocean-hued-clam", 2)?.runtimeSupported,
    ).toBe(true);
    expect(
      artifactBonusSupportAt("maiden-beloved", 2)?.runtimeSupported,
    ).toBe(true);
  });

  it("gives every published tier an executable or state-backed runtime path", () => {
    const unsupported = generatedArtifactEffects
      .map((effect) => ({ effect, row: artifactBonusSupportAt(effect.setSlug, effect.pieces) }))
      .filter(({ row }) => row?.runtimeSupported !== true)
      .map(({ effect }) => effect.id);
    expect(unsupported).toEqual([]);
  });
});

describe("the label cannot disagree with the engine", () => {
  // The picker's chip and the simulation must be driven by the same fact. If
  // a row is labelled 已接入模拟 but yields no buff, the UI overclaims.
  it("labels a bonus simulated only where the engine takes buffs from it", () => {
    for (const effect of generatedArtifactEffects) {
      const row = artifactBonusSupportAt(effect.setSlug, effect.pieces);
      if (row?.kind !== "modelled") {
        // A non-modelled row must never produce engine buffs.
        expect(buffsForSetBonus(effect)).toEqual([]);
      }
    }
  });

  it("reports set-level support consistently with its tiers", () => {
    for (const effect of generatedArtifactEffects) {
      const rows = artifactBonusSupport(effect.setSlug);
      const anyModelled = rows.some((r) => r.kind === "modelled");
      expect(setHasModelledBonus(effect.setSlug)).toBe(anyModelled);
    }
  });
});
