import { describe, expect, it } from "vitest";
import { findWeapon } from "@/game-data/weapons/registry";
import { findArtifact } from "@/game-data/artifacts/registry";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import type { EquipmentStat } from "@/simulation/character/equipment";
import {
  RECOMMENDED_BASE_BUILDS,
  baseBuildArtifactLoadout,
  equippedMatchesBaseBuild,
  recommendedBuildFor,
} from "./recommendedBuilds";

const EXPECTED_IDS = ["bennett", "raiden-shogun", "xiangling", "xingqiu"] as const;

describe("recommended base builds", () => {
  it("defines exactly the four spec'd characters", () => {
    expect(Object.keys(RECOMMENDED_BASE_BUILDS).sort()).toEqual(
      [...EXPECTED_IDS].sort(),
    );
  });

  it("resolves every weapon id to a real weapon", () => {
    for (const build of Object.values(RECOMMENDED_BASE_BUILDS)) {
      expect(findWeapon(build.weaponId), build.weaponId).toBeDefined();
    }
  });

  it("resolves every artifact set id to a real set", () => {
    for (const build of Object.values(RECOMMENDED_BASE_BUILDS)) {
      expect(findArtifact(build.artifactSetId), build.artifactSetId).toBeDefined();
    }
  });

  it("recommendedBuildFor returns undefined for characters with no build", () => {
    expect(recommendedBuildFor("nahida")).toBeUndefined();
    expect(recommendedBuildFor("bennett")).toBeDefined();
  });

  it("maps the spec'd LIVE KQM v4.5 weapons and sets to real repo ids", () => {
    expect(RECOMMENDED_BASE_BUILDS.bennett).toMatchObject({
      weaponId: "mistsplitterreforged",
      artifactSetId: "noblesse-oblige",
    });
    expect(RECOMMENDED_BASE_BUILDS["raiden-shogun"]).toMatchObject({
      weaponId: "engulfinglightning",
      artifactSetId: "emblem-of-severed-fate",
    });
    expect(RECOMMENDED_BASE_BUILDS.xiangling).toMatchObject({
      weaponId: "staffofthescarletsands",
      artifactSetId: "emblem-of-severed-fate",
    });
    expect(RECOMMENDED_BASE_BUILDS.xingqiu).toMatchObject({
      weaponId: "primordialjadecutter",
      artifactSetId: "emblem-of-severed-fate",
    });
  });

  it("fills all five slots with the recommended set (5 pieces still = 4pc tier)", () => {
    const build = RECOMMENDED_BASE_BUILDS["raiden-shogun"]!;
    const loadout = baseBuildArtifactLoadout(build);
    expect(Object.keys(loadout).length).toBe(ARTIFACT_SLOTS.length);
    for (const slot of ARTIFACT_SLOTS) {
      expect(loadout[slot]?.setId).toBe(build.artifactSetId);
      expect(loadout[slot]?.slot).toBe(slot);
    }
  });

  it("maps the spec'd main stats to the equipment stat model", () => {
    const raiden = baseBuildArtifactLoadout(RECOMMENDED_BASE_BUILDS["raiden-shogun"]!);
    expect(raiden.sands?.mainStat.stat).toBe("energyRecharge");
    expect(raiden.goblet?.mainStat).toMatchObject({
      stat: "elementalDmgBonus",
      element: "electro",
    });
    // "CRIT Rate/CRIT DMG" resolves deterministically to CRIT Rate.
    expect(raiden.circlet?.mainStat.stat).toBe("critRate");

    const bennett = baseBuildArtifactLoadout(RECOMMENDED_BASE_BUILDS.bennett!);
    // KQM healing-support default: ER% sands, HP% goblet.
    expect(bennett.sands?.mainStat.stat).toBe("energyRecharge");
    expect(bennett.goblet?.mainStat.stat).toBe("hpPercent");
    // Bennett's spec circlet ("Healing Bonus%") is unrepresentable — a zero
    // placeholder, never a wrong stat.
    expect(bennett.circlet?.mainStat).toEqual({ stat: "atkFlat", value: 0 });
  });

  it("records Bennett's non-simulated circlet intent as an honest note", () => {
    const bennett = RECOMMENDED_BASE_BUILDS.bennett!;
    expect(bennett.circletNote).toBeDefined();
    // Leads with the reassurance (damage number is complete), scoped to the
    // circlet slot — not a general claim about gear ATK.
    expect(bennett.circletNote).toBe(
      "主属性为治疗加成%，对伤害无影响，故未计入模拟。",
    );
    // A build whose circlet IS simulated carries no note.
    expect(RECOMMENDED_BASE_BUILDS["raiden-shogun"]!.circletNote).toBeUndefined();
  });

  describe("equippedMatchesBaseBuild", () => {
    const raiden = RECOMMENDED_BASE_BUILDS["raiden-shogun"]!;
    // The exact spec main stats, read from the authored loadout so the fixture
    // and the build can never drift apart.
    const raidenLoadout = baseBuildArtifactLoadout(raiden);
    const fullMatch = {
      weaponId: raiden.weaponId,
      artifactSetId: raiden.artifactSetId,
      sands: raidenLoadout.sands!.mainStat,
      goblet: raidenLoadout.goblet!.mainStat,
      circlet: raidenLoadout.circlet!.mainStat,
    } as const;

    it("is true when weapon, set and all main-stat channels match", () => {
      expect(equippedMatchesBaseBuild(raiden, fullMatch)).toBe(true);
    });

    it("is false when only the weapon matches (wrong set)", () => {
      expect(
        equippedMatchesBaseBuild(raiden, {
          ...fullMatch,
          artifactSetId: "gladiators-finale",
        }),
      ).toBe(false);
    });

    it("is false when only the set matches (wrong weapon)", () => {
      expect(
        equippedMatchesBaseBuild(raiden, {
          ...fullMatch,
          weaponId: "thecatch",
        }),
      ).toBe(false);
    });

    it("is false when the goblet main stat is changed off spec", () => {
      const changedGoblet: EquipmentStat = { stat: "atkPercent", value: 0.466 };
      expect(
        equippedMatchesBaseBuild(raiden, {
          ...fullMatch,
          goblet: changedGoblet,
        }),
      ).toBe(false);
    });

    it("is false when the goblet element is changed off spec", () => {
      const wrongElement: EquipmentStat = {
        stat: "elementalDmgBonus",
        value: 0.466,
        element: "pyro",
      };
      expect(
        equippedMatchesBaseBuild(raiden, {
          ...fullMatch,
          goblet: wrongElement,
        }),
      ).toBe(false);
    });

    it("ignores the circlet channel for a build whose circlet is unrepresentable", () => {
      // Bennett's spec circlet (Heal%) pins nothing, so any equipped circlet —
      // or none — still matches, as long as weapon/set/sands/goblet conform.
      const bennett = RECOMMENDED_BASE_BUILDS.bennett!;
      const bennettLoadout = baseBuildArtifactLoadout(bennett);
      expect(
        equippedMatchesBaseBuild(bennett, {
          weaponId: bennett.weaponId,
          artifactSetId: bennett.artifactSetId,
          sands: bennettLoadout.sands!.mainStat,
          goblet: bennettLoadout.goblet!.mainStat,
          circlet: { stat: "critRate", value: 0.311 },
        }),
      ).toBe(true);
    });
  });
});
