import { describe, expect, it } from "vitest";
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
      descZh: "普通攻击造成的伤害提升40%~80%，重击造成的伤害下降10%。",
    });
  });
});
