import { describe, expect, it } from "vitest";
import { actionDisplayLabel, characterDisplayLabel } from "./RotationEditor";

describe("RotationEditor Chinese presentation labels", () => {
  it("uses the Chinese action label instead of a generated English ability name", () => {
    const generatedAbilityName = "Fantastic Voyage";

    expect(actionDisplayLabel("skill")).toBe("元素战技");
    expect(actionDisplayLabel("skill")).not.toContain(generatedAbilityName);
  });

  it("uses a Chinese fallback when an action references no team character", () => {
    expect(characterDisplayLabel(null)).toBe("未知角色");
  });
});
