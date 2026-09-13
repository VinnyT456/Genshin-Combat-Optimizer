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
import { scoreArtifactSubstats } from "./artifactSubstatScoring";

const EXPECTED_IDS = [
  "amber",
  "arlecchino",
  "bennett",
  "chevreuse",
  "dehya",
  "diluc",
  "durin",
  "gaming",
  "hu-tao",
  "klee",
  "lyney",
  "mavuika",
  "nicole",
  "thoma",
  "traveler-f-pyro",
  "traveler-m-pyro",
  "xiangling",
  "yanfei",
  "yoimiya",
  "aino",
  "barbara",
  "candace",
  "columbina",
  "dahlia",
  "furina",
  "kamisato-ayato",
  "mona",
  "mualani",
  "neuvillette",
  "nilou",
  "sangonomiya-kokomi",
  "sigewinne",
  "tartaglia",
  "xingqiu",
  "yelan",
  "alyosha",
  "beidou",
  "clorinde",
  "cyno",
  "dori",
  "fischl",
  "flins",
  "iansan",
  "ineffa",
  "keqing",
  "kujou-sara",
  "kuki-shinobu",
  "lisa",
  "ororon",
  "raiden-shogun",
  "razor",
  "sethos",
  "varesa",
  "yae-miko",
  "charlotte",
  "chongyun",
  "citlali",
  "diona",
  "escoffier",
  "eula",
  "freminet",
  "ganyu",
  "kaeya",
  "kamisato-ayaka",
  "layla",
  "mika",
  "odette",
  "qiqi",
  "rosaria",
  "sandrone",
  "shenhe",
  "skirk",
  "wriothesley",
  "faruzan",
  "jean",
  "kaedehara-kazuha",
  "kinich",
  "lynette",
  "sayu",
  "shikanoin-heizou",
  "sucrose",
  "traveler-f-anemo",
  "traveler-f-dendro",
  "traveler-m-anemo",
  "traveler-m-dendro",
  "venti",
  "wanderer",
  "xianyun",
  "xiao",
  "yumemizuki-mizuki",
  "albedo",
  "arataki-itto",
  "chiori",
  "gorou",
  "kachina",
  "navia",
  "ningguang",
  "noelle",
  "xilonen",
  "yun-jin",
  "zhongli",
  "alhaitham",
  "baizhu",
  "collei",
  "emilie",
  "kaveh",
  "kirara",
  "nahida",
  "tighnari",
  "yaoyao",
  "aloy",
  "lohen",
  "traveler-f-cryo",
  "traveler-m-cryo",
  "chasca",
  "ifa",
  "jahoda",
  "lan-yan",
  "prune",
  "varka",
  "illuga",
  "linnea",
  "traveler-f-geo",
  "traveler-m-geo",
  "zibai",
  "lauma",
  "nefer",
  "xinyan",
  "traveler-f-hydro",
  "traveler-m-hydro",
  "traveler-f-electro",
  "traveler-m-electro",
] as const;

describe("recommended base builds", () => {
  it("defines the complete authored KQM baseline roster", () => {
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

  it("provides substat priorities for every filled baseline", () => {
    for (const [id, build] of Object.entries(RECOMMENDED_BASE_BUILDS)) {
      expect(
        build.substatPriorities?.length,
        `${id}: missing substat priorities`,
      ).toBeGreaterThan(0);
    }
  });

  it("recommendedBuildFor returns undefined for unknown character ids", () => {
    expect(recommendedBuildFor("not-a-character")).toBeUndefined();
    expect(recommendedBuildFor("bennett")).toBeDefined();
  });

  it("resolves the legacy Raiden id to the canonical recommended build", () => {
    expect(recommendedBuildFor("raiden")).toBe(
      RECOMMENDED_BASE_BUILDS["raiden-shogun"],
    );
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

  it("gives every recommended piece four legal level-20 substats", () => {
    for (const [id, build] of Object.entries(RECOMMENDED_BASE_BUILDS)) {
      const priorities = build.substatPriorities ?? [];
      const loadout = baseBuildArtifactLoadout(build);
      for (const slot of ARTIFACT_SLOTS) {
        const piece = loadout[slot]!;
        expect(piece.substats, `${id}/${slot}: incomplete baseline`).toHaveLength(4);
        expect(new Set(piece.substats.map((stat) => stat.stat)).size).toBe(4);
        expect(piece.substats.every((stat) => stat.value > 0)).toBe(true);
        expect(
          piece.substats.some((stat) => stat.stat === piece.mainStat.stat),
          `${id}/${slot}: substat duplicates main stat`,
        ).toBe(false);
        const score = scoreArtifactSubstats(piece.substats, priorities, piece.mainStat);
        expect(score, `${id}/${slot}: score below baseline`).toBeGreaterThan(45);
      }
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

  it("keeps KQM priority order visible for representative builds", () => {
    expect(RECOMMENDED_BASE_BUILDS["raiden-shogun"]!.substatPriorities).toEqual([
      "ER%",
      "crit_rate",
      "crit_dmg",
      "ATK%",
    ]);
    expect(RECOMMENDED_BASE_BUILDS["kaedehara-kazuha"]!.substatPriorities).toEqual([
      "ER%",
      "EM",
      "crit_rate",
      "crit_dmg",
    ]);
    expect(RECOMMENDED_BASE_BUILDS.bennett!.substatPriorities).toEqual([
      "ER%",
      "HP%",
    ]);
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
