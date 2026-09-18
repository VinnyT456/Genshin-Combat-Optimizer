import { describe, expect, it } from "vitest";
import { parseTalentUsageEvidence } from "./characterUsageEvidence";

describe("talent usage evidence parser", () => {
  it("distinguishes Skirk's recast from an additional skill charge", () => {
    const skill = parseTalentUsageEvidence(
      "依据点按、长按，以不同的方式产生效果。点按获得45点蛇之狡谋。长按获得45点蛇之狡谋，并能通过再次施放技能提前结束。",
    );
    expect(skill.inputVariants).toBe("tap-hold");
    expect(skill.canRecast).toBe(true);
    expect(skill.initialCharges).toBeUndefined();
    expect(skill.additionalUses).toHaveLength(0);
  });

  it("reads Skirk's alternate burst resource and its special zero-cost form", () => {
    const burst = parseTalentUsageEvidence(
      "元素爆发不依靠元素能量，而是依靠蛇之狡谋。当拥有至少50点蛇之狡谋时，可以消耗所有蛇之狡谋施放元素爆发。处于模式下时，无需消耗蛇之狡谋即可施放特殊元素爆发。",
    );
    expect(burst.alternateResource).toMatchObject({
      resourceName: "蛇之狡谋",
      minimum: { amount: 50, unit: "points" },
      consumesAll: true,
      zeroCostVariant: true,
      gains: [],
    });
  });

  it("only treats explicit available-use wording as charges", () => {
    const skill = parseTalentUsageEvidence(
      "拥有3次可使用次数。最多同时存在3株。依据点按、长按产生不同效果。",
    );
    expect(skill.initialCharges?.count).toBe(3);
    expect(skill.inputVariants).toBe("tap-hold");
  });

  it("keeps conditional extra uses separate from the base count", () => {
    const skill = parseTalentUsageEvidence(
      "拥有2次可使用次数。当进入特殊状态时，将额外获得一次短按施放的元素战技可用次数。",
    );
    expect(skill.initialCharges?.count).toBe(2);
    expect(skill.additionalUses).toHaveLength(1);
    expect(skill.additionalUses[0]?.count).toBe(1);
  });
});

