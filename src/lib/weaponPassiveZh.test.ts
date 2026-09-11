import { describe, expect, it } from "vitest";
import { allWeapons } from "@/game-data/weapons/registry";
import { getWeaponPassiveZh } from "./weaponPassiveZh";

describe("getWeaponPassiveZh", () => {
  it("fails closed for an unknown English passive instead of partial translation", () => {
    const passive = getWeaponPassiveZh(
      "unknown-weapon",
      "Unknown Weapon Passive",
      "ATK is increased by 20%. DMG increased by 10%.",
    );

    expect(passive).toEqual({
      nameZh: "武器专属特效",
      descZh: "暂无中文特效说明",
    });
    expect(passive.nameZh).not.toContain("Unknown");
    expect(passive.descZh).not.toContain("ATK");
    expect(passive.descZh).not.toContain("DMG");
  });

  it("preserves verified Chinese mappings", () => {
    expect(getWeaponPassiveZh("rust", "ignored", "ignored")).toEqual({
      nameZh: "速射弓斗",
      descZh: "普通攻击造成的伤害提升40%，重击造成的伤害下降10%。",
    });

    expect(getWeaponPassiveZh("rust", "ignored", "ignored", 5)).toEqual({
      nameZh: "速射弓斗",
      descZh: "普通攻击造成的伤害提升80%，重击造成的伤害下降10%。",
    });
  });

  it("provides Chinese-only copy for every catalog passive", () => {
    const weaponsWithPassives = allWeapons.filter((weapon) => weapon.passive);
    expect(weaponsWithPassives.length).toBeGreaterThan(0);

    for (const weapon of weaponsWithPassives) {
      for (const refinement of [1, 2, 3, 4, 5]) {
        const passive = getWeaponPassiveZh(
          weapon.id,
          weapon.passive!.name,
          weapon.passive!.desc,
          refinement,
        );
        expect(passive.nameZh, `${weapon.id} passive name`).not.toMatch(/[A-Za-z]/);
        expect(passive.descZh, `${weapon.id} R${refinement} description`).not.toMatch(
          /[A-Za-z]/,
        );
        expect(passive.descZh, `${weapon.id} R${refinement} translation`).not.toBe(
          "暂无中文特效说明",
        );
      }
    }
  });
});
