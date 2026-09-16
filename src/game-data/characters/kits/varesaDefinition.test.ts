import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { VARESA_KIT_METADATA, createVaresaDefinition } from "./varesaDefinition";

function simulate(level: number, actionType: "normal" | "plungeHigh" | "burst", critMode: "never" | "expected" = "never") {
  const character = createVaresaDefinition(level, { normal: 10, skill: 10, burst: 10 });
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    { critMode },
  );
  return result;
}

describe("Varesa runtime kit", () => {
  it("preserves executable generated baseline normal, plunge, and burst damage", () => {
    for (const [actionType, damageType] of [
      ["normal", "normal"],
      ["plungeHigh", "plunge"],
      ["burst", "burst"],
    ] as const) {
      const result = simulate(0, actionType);
      const damageEvents = result.timeline.filter((event) => event.type === "damage");

      expect(result.totalDamage).toBeGreaterThan(0);
      expect(damageEvents.length).toBeGreaterThan(0);
      expect(damageEvents.every((event) => event.type === "damage" && event.damage?.element === "electro")).toBe(true);
      expect(damageEvents.every((event) => event.type === "damage" && event.damage?.damageType === damageType)).toBe(true);
    }
  });

  it("applies generated C3 burst talent levels to real burst damage", () => {
    expect(simulate(3, "burst").totalDamage).toBeGreaterThan(simulate(0, "burst").totalDamage);
  });

  it("applies generated C5 normal talent levels to real normal damage", () => {
    expect(simulate(5, "normal").totalDamage).toBeGreaterThan(simulate(0, "normal").totalDamage);
  });

  it("gates C6's CRIT bonuses to plunge and burst damage", () => {
    expect(simulate(6, "plungeHigh", "expected").totalDamage).toBeGreaterThan(simulate(0, "plungeHigh", "expected").totalDamage);
    expect(simulate(6, "burst", "expected").totalDamage).toBeGreaterThan(simulate(0, "burst", "expected").totalDamage);
    // C5 is necessarily active at C6, so compare against C5 to isolate C6.
    expect(simulate(6, "normal", "expected").totalDamage).toBeCloseTo(simulate(5, "normal", "expected").totalDamage, 8);
    expect(VARESA_KIT_METADATA.c6CritRate).toBe(0.1);
    expect(VARESA_KIT_METADATA.c6CritDmg).toBe(1);
  });

  it("records unsupported state-dependent mechanics rather than assuming uptime", () => {
    expect(VARESA_KIT_METADATA.unsupportedChannels).toContain("a4NightsoulBurstAtkStacks");
    expect(VARESA_KIT_METADATA.unsupportedChannels).toContain("c4BurstCastStateDependentDamageAndGroundImpactBuff");
  });
});
