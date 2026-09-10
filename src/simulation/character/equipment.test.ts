import { describe, expect, it } from "vitest";
import type { Stats } from "@/types";
import type {
  ArtifactLoadout,
  ArtifactPiece,
  Equipment,
} from "@/simulation/character/equipment";
import {
  ARTIFACT_SLOTS,
  activeSetBonusKeys,
  countSetPieces,
  resolveEquippedStats,
  sumEquipmentStats,
} from "@/simulation/character/equipment";

// ============================================================================
// Equipment stat model.
//
// Every number here is SYNTHETIC — chosen so the expected result is
// hand-computable — and is NOT game data. No real weapon or artifact values
// are pinned in this file; those are `src/game-data`'s to source and verify.
// ============================================================================

/** Ungeared character: final == base by definition. */
const CHARACTER: Stats = {
  atk: 800,
  hp: 10000,
  def: 600,
  elementalMastery: 0,
  critRate: 0.05,
  critDmg: 0.5,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

function piece(
  slot: ArtifactPiece["slot"],
  setId: string,
  mainStat: ArtifactPiece["mainStat"],
  substats: ArtifactPiece["substats"] = [],
): ArtifactPiece {
  return { slot, setId, mainStat, substats };
}

describe("weapon base ATK joins BASE ATK", () => {
  it("adds weapon base ATK to the base channel, not the flat channel", () => {
    // Character base 800 + weapon base 600 => base ATK 1400.
    const { stats, base } = resolveEquippedStats(CHARACTER, {
      weapon: { baseAtk: 600 },
    });
    expect(base.atk).toBe(1400);
    expect(stats.atk).toBe(1400);
    expect(stats.base?.atk).toBe(1400);
  });

  it("lets ATK% scale the weapon's base ATK too", () => {
    // THIS is why the base/final split had to land first. Weapon base ATK is
    // roughly a third of a real build's base ATK; if it were treated as flat
    // ATK it would be excluded from every ATK% in the build.
    //
    // base 1400, +50% ATK => 1400 * 1.5 = 2100.
    // Treating weapon ATK as flat would give 800*1.5 + 600 = 1800 — 14% low.
    const { stats } = resolveEquippedStats(CHARACTER, {
      weapon: {
        baseAtk: 600,
        substat: { stat: "atkPercent", value: 0.5 },
      },
    });
    expect(stats.atk).toBe(2100);
  });
});

describe("the canonical channel formula", () => {
  it("applies percentages to BASE and flats afterwards", () => {
    // base ATK 800 + 400 (weapon) = 1200.
    // +46.6% ATK sands, +311 flat ATK plume.
    // Expected: 1200 * 1.466 + 311 = 1759.2 + 311 = 2070.2
    const artifacts: ArtifactLoadout = {
      plume: piece("plume", "setA", { stat: "atkFlat", value: 311 }),
      sands: piece("sands", "setA", { stat: "atkPercent", value: 0.466 }),
    };
    const { stats } = resolveEquippedStats(CHARACTER, {
      weapon: { baseAtk: 400 },
      artifacts,
    });
    expect(stats.atk).toBeCloseTo(2070.2, 6);
  });

  it("NEVER applies a percentage to an already-accumulated flat bonus", () => {
    // The signature bug. base 800, +311 flat, +100% ATK.
    // Correct:      800 * 2 + 311 = 1911
    // On-final bug: (800 + 311) * 2 = 2222  (+16%)
    const artifacts: ArtifactLoadout = {
      plume: piece("plume", "setA", { stat: "atkFlat", value: 311 }),
      sands: piece("sands", "setA", { stat: "atkPercent", value: 1.0 }),
    };
    const { stats } = resolveEquippedStats(CHARACTER, { artifacts });
    expect(stats.atk).toBe(1911);
    expect(stats.atk).not.toBe(2222);
  });

  it("sums multiple percentage sources additively, not multiplicatively", () => {
    // +20% and +30% ATK are ADDITIVE in game: base * (1 + 0.5), not
    // base * 1.2 * 1.3. base 1000 => 1500, not 1560.
    const character: Stats = { ...CHARACTER, atk: 1000 };
    const artifacts: ArtifactLoadout = {
      sands: piece("sands", "setA", { stat: "atkPercent", value: 0.2 }),
      goblet: piece("goblet", "setA", { stat: "atkPercent", value: 0.3 }),
    };
    const { stats } = resolveEquippedStats(character, { artifacts });
    expect(stats.atk).toBe(1500);
    expect(stats.atk).not.toBe(1560);
  });

  it("scales HP and DEF off their own bases, independently of ATK", () => {
    const artifacts: ArtifactLoadout = {
      flower: piece("flower", "setA", { stat: "hpFlat", value: 4780 }),
      sands: piece("sands", "setA", { stat: "hpPercent", value: 0.466 }),
      circlet: piece("circlet", "setA", { stat: "defPercent", value: 0.5 }),
    };
    const { stats } = resolveEquippedStats(CHARACTER, { artifacts });
    // HP: 10000 * 1.466 + 4780 = 19440
    expect(stats.hp).toBeCloseTo(19440, 6);
    // DEF: 600 * 1.5 = 900
    expect(stats.def).toBeCloseTo(900, 6);
    // ATK untouched.
    expect(stats.atk).toBe(800);
  });
});

describe("additive-fraction stats", () => {
  it("adds EM, crit, ER and DMG% onto the character's existing values", () => {
    const artifacts: ArtifactLoadout = {
      sands: piece("sands", "setA", { stat: "energyRecharge", value: 0.518 }, [
        { stat: "elementalMastery", value: 40 },
      ]),
      circlet: piece("circlet", "setA", { stat: "critRate", value: 0.311 }, [
        { stat: "critDmg", value: 0.622 },
      ]),
    };
    const { stats } = resolveEquippedStats(CHARACTER, { artifacts });
    expect(stats.critRate).toBeCloseTo(0.05 + 0.311, 6);
    expect(stats.critDmg).toBeCloseTo(0.5 + 0.622, 6);
    expect(stats.energyRecharge).toBeCloseTo(1 + 0.518, 6);
    expect(stats.elementalMastery).toBe(40);
  });

  it("merges a per-element DMG% goblet onto the existing map", () => {
    const character: Stats = {
      ...CHARACTER,
      elementalDmgBonus: { pyro: 0.15 },
    };
    const artifacts: ArtifactLoadout = {
      goblet: piece("goblet", "setA", {
        stat: "elementalDmgBonus",
        value: 0.466,
        element: "pyro",
      }),
    };
    const { stats } = resolveEquippedStats(character, { artifacts });
    expect(stats.elementalDmgBonus.pyro).toBeCloseTo(0.616, 6);
  });

  it("ignores an elemental DMG% grant that names no element", () => {
    // Malformed data: ignored rather than guessed at.
    const totals = sumEquipmentStats({
      artifacts: {
        goblet: piece("goblet", "setA", {
          stat: "elementalDmgBonus",
          value: 0.466,
        }),
      },
    });
    expect(totals.elementalDmgBonus).toEqual({});
  });
});

describe("set piece counting and bonus keys", () => {
  const fourPlusTwo: ArtifactLoadout = {
    flower: piece("flower", "crimson", { stat: "hpFlat", value: 4780 }),
    plume: piece("plume", "crimson", { stat: "atkFlat", value: 311 }),
    sands: piece("sands", "crimson", { stat: "atkPercent", value: 0.466 }),
    goblet: piece("goblet", "crimson", { stat: "atkPercent", value: 0.466 }),
    circlet: piece("circlet", "noblesse", { stat: "critRate", value: 0.311 }),
  };

  it("counts pieces per set", () => {
    expect(countSetPieces(fourPlusTwo)).toEqual({ crimson: 4, noblesse: 1 });
  });

  it("a 4-piece set activates BOTH its 2pc and 4pc bonus", () => {
    // Matches the game: wearing 4 pieces gives you the 2pc effect as well.
    expect(activeSetBonusKeys(fourPlusTwo)).toEqual(["crimson:2", "crimson:4"]);
  });

  it("a single piece activates nothing", () => {
    expect(activeSetBonusKeys({ circlet: fourPlusTwo.circlet })).toEqual([]);
  });

  it("two 2-piece sets activate both 2pc bonuses", () => {
    const split: ArtifactLoadout = {
      flower: piece("flower", "crimson", { stat: "hpFlat", value: 4780 }),
      plume: piece("plume", "crimson", { stat: "atkFlat", value: 311 }),
      sands: piece("sands", "noblesse", { stat: "atkPercent", value: 0.466 }),
      goblet: piece("goblet", "noblesse", { stat: "atkPercent", value: 0.466 }),
    };
    expect(activeSetBonusKeys(split)).toEqual(["crimson:2", "noblesse:2"]);
  });

  it("returns keys in a stable sorted order regardless of slot order", () => {
    // Determinism: the optimizer memo-hashes on this, so it must not depend on
    // object key insertion order.
    const a: ArtifactLoadout = {
      flower: piece("flower", "zebra", { stat: "hpFlat", value: 1 }),
      plume: piece("plume", "zebra", { stat: "atkFlat", value: 1 }),
      sands: piece("sands", "alpha", { stat: "atkPercent", value: 1 }),
      goblet: piece("goblet", "alpha", { stat: "atkPercent", value: 1 }),
    };
    const b: ArtifactLoadout = {
      goblet: a.goblet,
      sands: a.sands,
      plume: a.plume,
      flower: a.flower,
    };
    expect(activeSetBonusKeys(a)).toEqual(["alpha:2", "zebra:2"]);
    expect(activeSetBonusKeys(b)).toEqual(activeSetBonusKeys(a));
  });

  it("handles an absent loadout", () => {
    expect(countSetPieces(undefined)).toEqual({});
    expect(activeSetBonusKeys(undefined)).toEqual([]);
  });
});

describe("purity and determinism", () => {
  it("never mutates the character stats it is given", () => {
    const character: Stats = { ...CHARACTER, elementalDmgBonus: { pyro: 0.1 } };
    const snapshot = JSON.stringify(character);
    resolveEquippedStats(character, {
      weapon: { baseAtk: 600, substat: { stat: "atkPercent", value: 0.5 } },
      artifacts: {
        goblet: piece("goblet", "setA", {
          stat: "elementalDmgBonus",
          value: 0.466,
          element: "pyro",
        }),
      },
    });
    expect(JSON.stringify(character)).toBe(snapshot);
  });

  it("is a pure function of its inputs", () => {
    const equipment: Equipment = {
      weapon: { baseAtk: 608, substat: { stat: "critDmg", value: 0.662 } },
      artifacts: {
        sands: piece("sands", "setA", { stat: "atkPercent", value: 0.466 }, [
          { stat: "critRate", value: 0.1 },
        ]),
      },
    };
    const first = resolveEquippedStats(CHARACTER, equipment);
    const second = resolveEquippedStats(CHARACTER, equipment);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("no equipment is a no-op that still attaches the base channel", () => {
    const { stats } = resolveEquippedStats(CHARACTER);
    expect(stats.atk).toBe(CHARACTER.atk);
    expect(stats.hp).toBe(CHARACTER.hp);
    expect(stats.def).toBe(CHARACTER.def);
    // The base channel is attached even with no gear, so later buffs resolve.
    expect(stats.base).toEqual({ atk: 800, hp: 10000, def: 600 });
  });
});

describe("slot model", () => {
  it("declares exactly the five in-game slots in a fixed order", () => {
    expect(ARTIFACT_SLOTS).toEqual([
      "flower",
      "plume",
      "sands",
      "goblet",
      "circlet",
    ]);
  });

  it("substats accumulate across all five slots", () => {
    // 5 slots x +8% ATK substat = +40% ATK on base 1000 => 1400.
    const character: Stats = { ...CHARACTER, atk: 1000 };
    const sub = [{ stat: "atkPercent" as const, value: 0.08 }];
    const artifacts: ArtifactLoadout = {
      flower: piece("flower", "s", { stat: "hpFlat", value: 0 }, sub),
      plume: piece("plume", "s", { stat: "atkFlat", value: 0 }, sub),
      sands: piece("sands", "s", { stat: "critRate", value: 0 }, sub),
      goblet: piece("goblet", "s", { stat: "critRate", value: 0 }, sub),
      circlet: piece("circlet", "s", { stat: "critRate", value: 0 }, sub),
    };
    const { stats } = resolveEquippedStats(character, { artifacts });
    expect(stats.atk).toBeCloseTo(1400, 6);
  });
});
