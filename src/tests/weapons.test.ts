import { describe, expect, it } from "vitest";
import {
  allWeapons,
  findWeapon,
  getDefaultWeapon,
  getWeaponsByType,
} from "@/game-data/weapons/registry";
import { applyWeaponStats, filterWeapons } from "@/features/team-builder/weaponModel";
import { charNameZh } from "@/lib/i18n";
import type { Stats } from "@/types";

describe("Weapons System — Roster & Quality Integrity", () => {
  it("only contains weapons above 3 stars (4★ and 5★)", () => {
    expect(allWeapons.length).toBeGreaterThan(150);
    for (const w of allWeapons) {
      expect([4, 5]).toContain(w.rarity);
    }
  });

  it("covers all 5 weapon types", () => {
    const types = ["sword", "claymore", "polearm", "catalyst", "bow"] as const;
    for (const t of types) {
      const list = getWeaponsByType(t);
      expect(list.length).toBeGreaterThan(30);
    }
  });

  it("has valid level 90 base ATK and valid subStats", () => {
    for (const w of allWeapons) {
      expect(w.baseAtk).toBeGreaterThanOrEqual(410);
      expect(w.baseAtk).toBeLessThanOrEqual(741);
      expect(w.name).toBeTruthy();
      expect(w.nameZh).toBeTruthy();
    }
  });

  it("provides sensible default weapons for each weapon type", () => {
    const types = ["sword", "claymore", "polearm", "catalyst", "bow"] as const;
    for (const t of types) {
      const def = getDefaultWeapon(t);
      expect(def).toBeDefined();
      expect(def.weaponType).toBe(t);
      expect(def.rarity).toBe(5);
    }
  });
});

describe("Weapons Model — Filtering & Stat Calculations", () => {
  it("filters weapons by weapon type and rarity", () => {
    const swords = filterWeapons(allWeapons, {
      weaponType: "sword",
      rarity: 5,
      query: "",
    });
    expect(swords.length).toBeGreaterThan(10);
    for (const s of swords) {
      expect(s.weaponType).toBe("sword");
      expect(s.rarity).toBe(5);
    }
  });

  it("filters weapons by query in Chinese or English", () => {
    const homa = filterWeapons(allWeapons, {
      weaponType: "all",
      rarity: "all",
      query: "护摩",
    });
    expect(homa.length).toBeGreaterThanOrEqual(1);
    expect(homa[0]!.id).toBe("staffofhoma");

    const mistsplitter = filterWeapons(allWeapons, {
      weaponType: "all",
      rarity: "all",
      query: "mistsplitter",
    });
    expect(mistsplitter.length).toBeGreaterThanOrEqual(1);
    expect(mistsplitter[0]!.id).toBe("mistsplitterreforged");
  });

  it("applies weapon base ATK and substats correctly to character stats", () => {
    const baseStats: Stats = {
      atk: 200,
      hp: 15000,
      def: 800,
      elementalMastery: 0,
      critRate: 0.05,
      critDmg: 0.5,
      energyRecharge: 1.0,
      dmgBonus: 0,
      elementalDmgBonus: {},
    };

    const mist = findWeapon("mistsplitterreforged")!;
    expect(mist).toBeDefined();
    // Mist: 674 base ATK, 44.1% CRIT DMG
    const withMist = applyWeaponStats(baseStats, mist);
    expect(withMist.atk).toBe(200 + 674);
    expect(withMist.critDmg).toBeCloseTo(0.5 + 0.441, 3);
  });
});

describe("Traveler Naming — Chinese Translations", () => {
  it("removes English from all Traveler card representations", () => {
    expect(charNameZh("Traveler (Anemo)")).toBe("旅行者 (风)");
    expect(charNameZh("Traveler (Geo)")).toBe("旅行者 (岩)");
    expect(charNameZh("Traveler (Electro)")).toBe("旅行者 (雷)");
    expect(charNameZh("Traveler (Dendro)")).toBe("旅行者 (草)");
    expect(charNameZh("Traveler (Hydro)")).toBe("旅行者 (水)");
    expect(charNameZh("Traveler (Pyro)")).toBe("旅行者 (火)");
    expect(charNameZh("Traveler (Anemo Traveler)")).toBe("旅行者 (风)");
    expect(charNameZh("Traveler")).toBe("旅行者");
    expect(charNameZh("traveler-anemo")).toBe("旅行者 (风)");
    expect(charNameZh("traveler-geo")).toBe("旅行者 (岩)");
  });
});
