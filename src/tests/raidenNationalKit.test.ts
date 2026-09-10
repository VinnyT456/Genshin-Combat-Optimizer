import { describe, expect, it } from "vitest";
import {
  BENNETT_KIT,
  RAIDEN_SHOGUN_KIT,
  XIANGLING_KIT,
  XINGQIU_KIT,
  getCharacterKitDetails,
  getRaidenNationalBuffs,
} from "@/game-data/characters/kits/raidenNationalKit";
import { nationalTeam } from "@/game-data";

describe("Raiden National Kit Data & Constellations", () => {
  const allKits = [RAIDEN_SHOGUN_KIT, BENNETT_KIT, XIANGLING_KIT, XINGQIU_KIT];

  it("has complete combat talents, passives, and C1-C6 constellations for all 4 characters", () => {
    for (const kit of allKits) {
      expect(kit.nameZh).toBeTruthy();
      expect(kit.combatTalents.length).toBe(3);
      expect(kit.passives.length).toBe(3);
      expect(kit.constellations.length).toBe(6);

      // Verify passives include A1, A4, and Utility
      const passiveTypes = kit.passives.map((p) => p.type);
      expect(passiveTypes).toContain("a1");
      expect(passiveTypes).toContain("a4");
      expect(passiveTypes).toContain("utility");

      for (const p of kit.passives) {
        expect(p.name).toBeTruthy();
        expect(p.descriptionZh).toBeTruthy();
      }

      // Verify constellations are 1..6 in order
      expect(kit.constellations.map((c) => c.level)).toEqual([1, 2, 3, 4, 5, 6]);
      for (const c of kit.constellations) {
        expect(c.name).toBeTruthy();
        expect(c.descriptionZh).toBeTruthy();
      }
    }
  });

  it("resolves kits through getCharacterKitDetails", () => {
    expect(getCharacterKitDetails("raiden")?.nameZh).toBe("雷电将军");
    expect(getCharacterKitDetails("raiden-shogun")?.nameZh).toBe("雷电将军");
    expect(getCharacterKitDetails("bennett")?.nameZh).toBe("班尼特");
    expect(getCharacterKitDetails("xiangling")?.nameZh).toBe("香菱");
    expect(getCharacterKitDetails("xingqiu")?.nameZh).toBe("行秋");
    expect(getCharacterKitDetails("unknown")).toBeUndefined();
  });

  it("attaches default constellations to nationalTeam characters", () => {
    const raiden = nationalTeam.find((c) => c.id === "raiden-shogun");
    const bennett = nationalTeam.find((c) => c.id === "bennett");
    const xiangling = nationalTeam.find((c) => c.id === "xiangling");
    const xingqiu = nationalTeam.find((c) => c.id === "xingqiu");

    expect(raiden?.constellation).toBe(2);
    expect(bennett?.constellation).toBe(5);
    expect(xiangling?.constellation).toBe(4);
    expect(xingqiu?.constellation).toBe(6);

    expect(raiden?.talentLevels?.burst).toBe(10);
    expect(bennett?.talentLevels?.burst).toBe(10);
    expect(xiangling?.talentLevels?.burst).toBe(10);
    expect(xingqiu?.talentLevels?.burst).toBe(10);
  });

  it("generates active buffs based on constellation configurations", () => {
    const buffs = getRaidenNationalBuffs(nationalTeam);

    // Raiden A4 conversion + C2 DEF ignore (since Raiden is C2)
    const raidenA4 = buffs.find((b) => b.id === "raiden-a4-conversion");
    expect(raidenA4).toBeDefined();
    expect(raidenA4?.conversions?.[0]?.ratio).toBe(0.4);

    const raidenC2 = buffs.find((b) => b.id === "raiden-c2-def-ignore");
    expect(raidenC2).toBeDefined();
    expect(raidenC2?.enemyModifiers?.[0]?.value).toBe(0.6);

    // Xiangling C1 RES shred (Xiangling is C4 >= 1)
    const xianglingC1 = buffs.find((b) => b.id === "xiangling-c1-pyro-shred");
    expect(xianglingC1).toBeDefined();

    // Xingqiu A4 Hydro DMG + C2 RES shred (Xingqiu is C6 >= 2)
    const xingqiuA4 = buffs.find((b) => b.id === "xingqiu-a4-hydro-dmg");
    expect(xingqiuA4).toBeDefined();

    const xingqiuC2 = buffs.find((b) => b.id === "xingqiu-c2-hydro-shred");
    expect(xingqiuC2).toBeDefined();
  });
});
