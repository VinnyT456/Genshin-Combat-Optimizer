import { describe, expect, it } from "vitest";
import type { Stats } from "@/types";
import type { WeaponDefinition } from "@/game-data/weapons/types";
import { applyWeaponStats } from "./weaponModel";

// ---------------------------------------------------------------------------
// Guards the stat model behind the weapon picker.
//
// The previous implementation applied ATK% to the ALREADY-FINAL ATK and
// substituted invented `?? 15000` HP / `?? 800` DEF constants. Both produced
// plausible-looking numbers that were simply wrong, and no test noticed.
// Synthetic fixtures throughout: never assert a real weapon's multipliers,
// which are regenerated data.
// ---------------------------------------------------------------------------

const baseStats: Stats = {
  atk: 300,
  hp: 15000,
  def: 800,
  elementalMastery: 0,
  critRate: 0.05,
  critDmg: 0.5,
  energyRecharge: 1.0,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

function weapon(partial: Partial<WeaponDefinition>): WeaponDefinition {
  return {
    id: "test-weapon",
    name: "Test Weapon",
    nameZh: "测试武器",
    weaponType: "sword",
    rarity: 5,
    baseAtk: 100,
    subStat: { type: "none", value: 0, labelZh: "无" },
    iconUrl: "",
    ...partial,
  } as WeaponDefinition;
}

describe("applyWeaponStats", () => {
  it("adds weapon base ATK to the character's ATK", () => {
    const result = applyWeaponStats(baseStats, weapon({ baseAtk: 100 }));
    expect(result.atk).toBe(400);
  });

  it("scales ATK% off BASE ATK (character + weapon)", () => {
    // base = 300 + 100 = 400; +50% => 600.
    const result = applyWeaponStats(
      baseStats,
      weapon({ baseAtk: 100, subStat: { type: "atkPercent", value: 0.5, labelZh: "攻击力" } }),
    );
    expect(result.atk).toBe(600);
  });

  it("does not round the ATK% result to an integer", () => {
    // THE DISCRIMINATING GUARD for a single weapon. With no flat ATK in play,
    // `base * (1 + p)` and `final * (1 + p)` are numerically identical, so the
    // arithmetic alone cannot distinguish the old implementation from the
    // engine. What DOES distinguish them is the old `Math.round`, which
    // silently discarded precision before any downstream stat could use it.
    // base = 300 + 608 = 908; 908 * 1.496 = 1358.368, not 1358.
    const result = applyWeaponStats(
      baseStats,
      weapon({ baseAtk: 608, subStat: { type: "atkPercent", value: 0.496, labelZh: "攻击力" } }),
    );
    expect(result.atk).toBeCloseTo(1358.368, 3);
    expect(Number.isInteger(result.atk)).toBe(false);
  });

  it("leaves HP and DEF untouched when the weapon does not grant them", () => {
    const result = applyWeaponStats(baseStats, weapon({}));
    expect(result.hp).toBe(baseStats.hp);
    expect(result.def).toBe(baseStats.def);
  });

  it("scales HP% off base HP", () => {
    const result = applyWeaponStats(
      baseStats,
      weapon({ subStat: { type: "hpPercent", value: 0.2, labelZh: "生命值" } }),
    );
    expect(result.hp).toBe(18000);
  });

  it("adds additive-fraction substats without touching ATK", () => {
    const result = applyWeaponStats(
      baseStats,
      weapon({ subStat: { type: "critDmg", value: 0.441, labelZh: "暴伤" } }),
    );
    expect(result.critDmg).toBeCloseTo(0.941, 6);
    expect(result.atk).toBe(400);
  });

  it("maps physicalDmg onto the generic DMG% channel", () => {
    const result = applyWeaponStats(
      baseStats,
      weapon({ subStat: { type: "physicalDmg", value: 0.15, labelZh: "物伤" } }),
    );
    expect(result.dmgBonus).toBeCloseTo(0.15, 6);
  });

  it("grants nothing extra for a weapon with no substat", () => {
    const result = applyWeaponStats(baseStats, weapon({ baseAtk: 50 }));
    expect(result.atk).toBe(350);
    expect(result.critRate).toBeCloseTo(baseStats.critRate, 6);
  });

  it("does not invent an HP value for a character that has none", () => {
    // The old `?? 15000` fallback materialised a stat out of thin air: a
    // character with no HP came back with 18000, a number with no source that
    // renders indistinguishably from a real one. The engine propagates the
    // absence instead, so the caller can show nothing rather than a guess.
    const noHp = { ...baseStats, hp: undefined } as unknown as Stats;
    const result = applyWeaponStats(
      noHp,
      weapon({ subStat: { type: "hpPercent", value: 0.2, labelZh: "生命值" } }),
    );
    expect(result.hp).not.toBe(18000);
    expect(Number.isFinite(result.hp)).toBe(false);
  });
});
