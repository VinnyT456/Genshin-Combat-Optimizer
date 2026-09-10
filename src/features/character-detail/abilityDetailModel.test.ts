import { describe, it, expect } from "vitest";
import { allCharacters, findCharacter } from "@/game-data/characters/registry";
import { talentTable, flatTalent } from "@/simulation/character/talent";
import type { KitAbility } from "@/simulation/character/kit";
import {
  TALENT_LEVELS,
  buildAbilityDetail,
  clampTalentLevel,
  hasLevelVariation,
  scalingStatZh,
  totalMultiplierAt,
} from "./abilityDetailModel";

function ability(overrides: Partial<KitAbility> = {}): KitAbility {
  return {
    id: "test-skill",
    name: "Test Skill",
    slot: "skill",
    castTime: 0.8,
    cooldown: flatTalent(10),
    energyCost: 0,
    instances: [
      {
        id: "hit-1",
        name: "1-Hit DMG",
        damageType: "skill",
        element: "pyro",
        scaling: [{ stat: "atk", table: talentTable([1.0, 1.1, 1.2]) }],
        application: { element: "pyro", gauge: 1 },
      },
    ],
    ...overrides,
  };
}

describe("abilityDetailModel", () => {
  describe("talent levels", () => {
    it("offers exactly levels 1..15", () => {
      expect(TALENT_LEVELS[0]).toBe(1);
      expect(TALENT_LEVELS[TALENT_LEVELS.length - 1]).toBe(15);
      expect(TALENT_LEVELS).toHaveLength(15);
    });

    it("clamps out-of-range levels instead of throwing", () => {
      expect(clampTalentLevel(0)).toBe(1);
      expect(clampTalentLevel(-5)).toBe(1);
      expect(clampTalentLevel(99)).toBe(15);
      expect(clampTalentLevel(Number.NaN)).toBe(1);
      expect(clampTalentLevel(7.9)).toBe(7);
    });
  });

  describe("resolving multipliers at a level", () => {
    it("reads the table entry for the selected level", () => {
      expect(buildAbilityDetail(ability(), 1).instances[0]!.terms[0]!.multiplier).toBe(1.0);
      expect(buildAbilityDetail(ability(), 2).instances[0]!.terms[0]!.multiplier).toBe(1.1);
    });

    it("clamps a short table at its last entry rather than inventing values", () => {
      // 3-entry table asked for level 15: honest clamp, no extrapolation.
      expect(buildAbilityDetail(ability(), 15).instances[0]!.terms[0]!.multiplier).toBe(1.2);
    });

    it("reports the clamped level it actually used", () => {
      expect(buildAbilityDetail(ability(), 99).level).toBe(15);
    });
  });

  describe("not-applicable fields are undefined, never zero", () => {
    it("reports no energy cost for a non-burst", () => {
      expect(buildAbilityDetail(ability({ energyCost: 0 }), 1).energyCost).toBeUndefined();
    });

    it("reports a real burst cost", () => {
      expect(buildAbilityDetail(ability({ energyCost: 80 }), 1).energyCost).toBe(80);
    });

    it("reports no cooldown when the ability has none", () => {
      const a = ability({ cooldown: flatTalent(0) });
      expect(buildAbilityDetail(a, 1).cooldown).toBeUndefined();
    });
  });

  describe("hybrid scaling", () => {
    const hybrid = ability({
      instances: [
        {
          id: "hit-1",
          name: "Hybrid",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.0]) },
            { stat: "hp", table: talentTable([0.05]) },
          ],
        },
      ],
    });

    it("flags an instance that sums two stats", () => {
      const row = buildAbilityDetail(hybrid, 1).instances[0]!;
      expect(row.hybrid).toBe(true);
      expect(row.terms).toHaveLength(2);
    });

    it("lists each distinct scaling stat once", () => {
      expect(buildAbilityDetail(hybrid, 1).scalingStats).toEqual(["atk", "hp"]);
    });

    it("sums every term for the growth curve", () => {
      expect(totalMultiplierAt(hybrid, 1)).toBeCloseTo(1.05);
    });
  });

  describe("level variation detection", () => {
    it("is true when a table actually grows", () => {
      expect(hasLevelVariation(ability())).toBe(true);
    });

    it("is false for a flat multiplier, so no misleading selector is shown", () => {
      const flat = ability({
        instances: [
          {
            id: "hit-1",
            name: "Flat",
            damageType: "skill",
            element: "pyro",
            scaling: [{ stat: "atk", table: flatTalent(1.5) }],
          },
        ],
      });
      expect(hasLevelVariation(flat)).toBe(false);
    });
  });

  describe("stat labels", () => {
    it("labels every scaling stat in Chinese", () => {
      expect(scalingStatZh("atk")).toBe("攻击力");
      expect(scalingStatZh("hp")).toBe("生命值上限");
      expect(scalingStatZh("def")).toBe("防御力");
      expect(scalingStatZh("elementalMastery")).toBe("元素精通");
    });
  });

  describe("against real character data", () => {
    it("resolves Diluc's skill at level 1 and 15 to different multipliers", () => {
      const diluc = findCharacter("diluc");
      expect(diluc).toBeDefined();
      const lo = buildAbilityDetail(diluc!.skill, 1);
      const hi = buildAbilityDetail(diluc!.skill, 15);
      expect(hi.instances[0]!.terms[0]!.multiplier).toBeGreaterThan(
        lo.instances[0]!.terms[0]!.multiplier,
      );
    });

    it("resolves every character's skill and burst without throwing", () => {
      for (const c of allCharacters) {
        for (const level of [1, 10, 15]) {
          expect(() => buildAbilityDetail(c.skill, level)).not.toThrow();
          expect(() => buildAbilityDetail(c.burst, level)).not.toThrow();
        }
      }
    });

    it("finds the non-ATK scaling present in the roster", () => {
      const stats = new Set<string>();
      for (const c of allCharacters) {
        for (const a of [c.skill, c.burst]) {
          for (const s of buildAbilityDetail(a, 10).scalingStats) stats.add(s);
        }
      }
      // Verified against the live roster: HP, DEF and EM scaling all exist.
      expect(stats.has("atk")).toBe(true);
      expect(stats.size).toBeGreaterThan(1);
    });

    // Verified against the live roster: Mavuika and Skirk drive their bursts
    // from a character resource rather than the energy system, and are authored
    // with energyCost 0 / maxEnergy 0. Reporting `undefined` is what lets the
    // detail page omit the field instead of printing a false "0 能量".
    it("omits the energy cost for the resource-driven bursts, and only those", () => {
      const withoutCost = allCharacters
        .filter((c) => buildAbilityDetail(c.burst, 10).energyCost === undefined)
        .map((c) => c.id)
        .sort();
      expect(withoutCost).toEqual(["mavuika", "skirk"]);
    });

    it("reports a positive burst cost for every energy-driven character", () => {
      for (const c of allCharacters) {
        if (c.maxEnergy === 0) continue;
        expect(buildAbilityDetail(c.burst, 10).energyCost).toBeGreaterThan(0);
      }
    });
  });
});
