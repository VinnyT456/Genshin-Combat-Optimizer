import { describe, expect, it } from "vitest";
import { hitLabel } from "./AbilityCard";

describe("AbilityCard Chinese presentation labels", () => {
  it("uses an indexed Chinese hit label even when source data is English", () => {
    const generatedHitName = "Cutting DMG";

    expect(hitLabel(0)).toBe("第1段");
    expect(hitLabel(1)).toBe("第2段");
    expect(hitLabel(0)).not.toContain(generatedHitName);
  });
});
