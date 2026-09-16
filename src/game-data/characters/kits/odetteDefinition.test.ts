import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createOdetteDefinition, ODETTE_KIT_METADATA } from "./odetteDefinition";

function damage(constellation: number, actionType: "normal" | "skill" | "burst") {
  const character = createOdetteDefinition(constellation);
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: "odette", actionType }],
    testEnemy,
    { critMode: "never" },
  ).totalDamage;
}

describe("Odette runtime kit", () => {
  it("executes generated baseline Normal, Skill, and Burst damage", () => {
    expect(damage(0, "normal")).toBeGreaterThan(0);
    expect(damage(0, "skill")).toBeGreaterThan(0);
    expect(damage(0, "burst")).toBeGreaterThan(0);
  });

  it("applies the generated C3 Skill talent increase to actual damage", () => {
    expect(damage(3, "skill")).toBeGreaterThan(damage(0, "skill"));
  });

  it("applies the generated C5 Burst talent increase to actual damage", () => {
    expect(damage(5, "burst")).toBeGreaterThan(damage(0, "burst"));
  });

  it("does not activate unmodeled passive or constellation damage channels", () => {
    expect(damage(1, "normal")).toBe(damage(0, "normal"));
    expect(damage(2, "skill")).toBe(damage(0, "skill"));
    expect(damage(4, "burst")).toBe(damage(0, "burst"));
    expect(damage(6, "normal")).toBe(damage(0, "normal"));
    expect(ODETTE_KIT_METADATA.unsupportedChannels).toContain("c2SnowSwansUnseenDream");
  });
});
