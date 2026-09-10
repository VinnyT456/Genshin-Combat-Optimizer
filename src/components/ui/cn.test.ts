import { describe, expect, it } from "vitest";
import { cn } from "@/components/ui/cn";

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops false, null, undefined and empty strings", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string when nothing applies", () => {
    expect(cn(false, undefined)).toBe("");
  });
});
