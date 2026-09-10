import { describe, expect, it } from "vitest";
import { chinesePerkDisplayCopy } from "./CharacterStatsModal";

describe("CharacterStatsModal Chinese perk copy", () => {
  it("never falls back to generated English names or source descriptions", () => {
    const copy = chinesePerkDisplayCopy({
      descriptionZh: undefined,
      name: "English Generated Constellation Name",
      text: "English generated description",
    });

    expect(copy).toEqual({
      label: "命之座效果",
      description: "暂无中文描述文本。",
    });
    expect(JSON.stringify(copy)).not.toContain("English");
  });

  it("preserves authored Chinese descriptions", () => {
    expect(
      chinesePerkDisplayCopy({
        descriptionZh: "提升元素爆发等级。",
        name: "English Generated Constellation Name",
      }),
    ).toEqual({
      label: "命之座效果",
      description: "提升元素爆发等级。",
    });
  });
});
