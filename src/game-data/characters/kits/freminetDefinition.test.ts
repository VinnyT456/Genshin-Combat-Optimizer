import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { FREMINET_KIT_METADATA, createFreminetDefinition } from "./freminetDefinition";

const rotation = (actionType: "normal" | "skill") => [{ characterId: "freminet", actionType }];

function damage(character: ReturnType<typeof createFreminetDefinition>, actionType: "normal" | "skill") {
  return simulateRotation([character], rotation(actionType), testEnemy, { critMode: "expected" }).totalDamage;
}

describe("Freminet runtime kit", () => {
  it("executes the generated baseline skill and normal attack damage", () => {
    const freminet = createFreminetDefinition(0);

    expect(damage(freminet, "skill")).toBeGreaterThan(0);
    expect(damage(freminet, "normal")).toBeGreaterThan(0);
  });

  it("increases Pressurized Floe damage with C1's 15% crit-rate channel", () => {
    expect(damage(createFreminetDefinition(1), "skill"))
      .toBeGreaterThan(damage(createFreminetDefinition(0), "skill"));
    expect(damage(createFreminetDefinition(1), "normal"))
      .toBe(damage(createFreminetDefinition(0), "normal"));
  });

  it("applies C3 and C5 talent levels to the corresponding damage rows", () => {
    expect(damage(createFreminetDefinition(3), "normal"))
      .toBeGreaterThan(damage(createFreminetDefinition(0), "normal"));
    expect(damage(createFreminetDefinition(5), "skill"))
      .toBeGreaterThan(damage(createFreminetDefinition(0), "skill"));
  });

  it("fails closed for reaction- and pressure-state channels without changing baseline damage", () => {
    expect(FREMINET_KIT_METADATA.unsupportedChannels).toContain("a4ShatterTriggeredPressurizedFloeDamageBonus");
    expect(damage(createFreminetDefinition(6), "skill")).toBe(damage(createFreminetDefinition(5), "skill"));
  });
});
