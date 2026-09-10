import { describe, expect, it } from "vitest";
import {
  charNameZh,
  actionTypeZh,
  elementZh,
  enemyNameZh,
  resonanceFullDescZh,
  resonanceNameZh,
  resonanceShortDescZh,
  tierReasonZh,
  tierZh,
  weaponZh,
} from "./i18n";

describe("i18n helpers", () => {
  it("translates tier reasons correctly without '已支持'", () => {
    const dataminedReason =
      "Damage kit sourced from datamined data (per-level talent tables, scaling stats, cooldowns, energy costs). Passives and constellations are not published as machine-readable parameters by either source and are not modelled.";
    const result = tierReasonZh(dataminedReason);
    expect(result).toBe(
      "全等级天赋倍率、属性成长曲线、冷却时间与能量消耗。固有天赋与命之座暂未作为机读参数实装。",
    );
    expect(result).not.toContain("已支持");
  });

  it("translates other specific caveats", () => {
    expect(tierReasonZh("Burst infusion is not modelled")).toBe("元素爆发附魔暂未实装。");
    expect(tierReasonZh("Stack-gated behaviour is not simulated")).toBe("层数叠加机制暂未实装。");
    expect(tierReasonZh("Stacks are not simulated")).toBe("层数机制暂未实装。");
    expect(tierReasonZh(undefined)).toBeUndefined();
  });

  it("returns undefined on a miss — never the untranslated English source", () => {
    // This asserted `toBe("Custom reason")` — falling through to the source
    // string. That is how all 132 live tier reasons came to render as ~250
    // characters of English engineering prose in a zh-CN product: the
    // generator's wording changed to "Damage kit sourced (per-level talent
    // tables, ..." and zero reasons matched any pattern. TypeScript could not
    // catch it because the fallback is a valid string.
    //
    // Failing closed is the rule (ROADMAP §0). Callers render nothing.
    expect(tierReasonZh("Custom reason")).toBeUndefined();
    expect(
      tierReasonZh("Damage kit sourced (per-level talent tables, cooldowns)"),
    ).toBeUndefined();
  });

  it("translates support tiers", () => {
    expect(tierZh("full")).toBe("完整支持");
    expect(tierZh("FULL")).toBe("完整支持");
    expect(tierZh("partial")).toBe("基础支持");
    expect(tierZh("PARTIAL")).toBe("基础支持");
    expect(tierZh(undefined)).toBe("完整支持");
  });

  it("translates resonance names and descriptions", () => {
    expect(resonanceNameZh("Fervent Flames")).toBe("热诚之火");
    expect(resonanceShortDescZh("Fervent Flames")).toBe("攻击力提升25%");
    expect(resonanceFullDescZh("Fervent Flames")).toContain("全队基础攻击力提升25%");
  });

  it("translates character, element, weapon and enemy", () => {
    expect(charNameZh("raiden")).toBe("雷电将军");
    expect(charNameZh("bennett")).toBe("班尼特");
    expect(charNameZh("xiangling")).toBe("香菱");
    expect(charNameZh("xingqiu")).toBe("行秋");
    expect(elementZh("electro")).toBe("雷元素");
    expect(weaponZh("polearm")).toBe("长柄武器");
    expect(enemyNameZh("Hilichurl")).toBe("丘丘人");
  });

  it("fails closed for an unknown action type", () => {
    expect(actionTypeZh("generated-action")).toBe("未知动作");
  });
});
