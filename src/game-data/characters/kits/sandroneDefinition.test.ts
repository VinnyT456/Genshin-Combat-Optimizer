import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createSandroneDefinition, SANDRONE_KIT_SUPPORT } from "./sandroneDefinition";

const noCrit = { critMode: "never" as const };

function runDamage(
  constellation: number,
  actionType: "normal" | "skill" | "burst",
  talents = { normal: 1, skill: 1, burst: 1 },
) {
  const character = createSandroneDefinition(constellation, talents);
  const actor = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [actor],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Sandrone runtime kit", () => {
  it("executes generated Cryo skill damage as the sourced baseline", () => {
    const result = runDamage(0, "skill");
    const hits = result.timeline.filter((event) => event.type === "damage");

    expect(result.errors).toEqual([]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((event) => event.damage?.element === "cryo")).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("increases actual Normal Attack damage at C3, but not below C3", () => {
    const rotation = [{ characterId: "sandrone", actionType: "normal" as const }];
    const damageAt = (constellation: number) => {
      const character = createSandroneDefinition(constellation, { normal: 1, skill: 1, burst: 1 });
      return simulateRotation([character], rotation, testEnemy, noCrit).totalDamage;
    };

    expect(damageAt(3)).toBeGreaterThan(damageAt(2));
    expect(damageAt(2)).toBe(damageAt(0));
  });

  it("increases actual Burst damage at C5, but not below C5", () => {
    const damageAt = (constellation: number) => runDamage(constellation, "burst").totalDamage;

    expect(damageAt(5)).toBeGreaterThan(damageAt(4));
    expect(damageAt(4)).toBe(damageAt(0));
  });

  it("keeps state-dependent numerical perk claims explicitly unsupported", () => {
    expect(SANDRONE_KIT_SUPPORT.modeledConstellations).toEqual([3, 5]);
    expect(SANDRONE_KIT_SUPPORT.unsupportedPerks).toContain("c2");
    expect(SANDRONE_KIT_SUPPORT.unsupportedPerks).toContain("p3");
  });
});
