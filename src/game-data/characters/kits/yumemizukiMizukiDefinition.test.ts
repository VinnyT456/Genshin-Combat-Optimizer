import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createYumemizukiMizukiDefinition } from "./yumemizukiMizukiDefinition";

const noCrit = { critMode: "never" as const };

function simulate(constellationLevel: number, actionType: "normal" | "charged" | "skill" | "burst") {
  const mizuki = createYumemizukiMizukiDefinition(constellationLevel);
  const actor = actionType === "normal"
    ? mizuki
    : { ...mizuki, burst: { ...mizuki.burst, energyCost: 0 } };
  return simulateRotation(
    [actor],
    [{ characterId: actor.id, actionType }],
    testEnemy,
    noCrit,
  );
}

function firstDamage(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.find((event) => event.type === "damage" && event.characterId === "yumemizuki-mizuki");
}

describe("Yumemizuki Mizuki runtime kit", () => {
  it("executes sourced direct Anemo normal, charged, and skill hits", () => {
    for (const [actionType, damageType] of [
      ["normal", "normal"],
      ["charged", "charged"],
      ["skill", "skill"],
    ] as const) {
      const result = simulate(0, actionType);
      const hit = firstDamage(result);

      expect(result.errors).toEqual([]);
      expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
      expect(hit?.damage?.element).toBe("anemo");
      expect(hit?.damage?.damageType).toBe(damageType);
    }
  });

  it("executes sourced Anemo burst damage", () => {
    const result = simulate(0, "burst");
    const hit = firstDamage(result);

    expect(result.errors).toEqual([]);
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
    expect(hit?.damage?.element).toBe("anemo");
    expect(hit?.damage?.damageType).toBe("burst");
  });

  it("applies C3 skill and C5 burst talent boosts only at their respective gates", () => {
    const c0Skill = firstDamage(simulate(0, "skill"))?.damage?.finalDamage ?? 0;
    const c2Skill = firstDamage(simulate(2, "skill"))?.damage?.finalDamage ?? 0;
    const c3Skill = firstDamage(simulate(3, "skill"))?.damage?.finalDamage ?? 0;
    const c4Burst = firstDamage(simulate(4, "burst"))?.damage?.finalDamage ?? 0;
    const c5Burst = firstDamage(simulate(5, "burst"))?.damage?.finalDamage ?? 0;

    expect(c0Skill).toBeGreaterThan(0);
    expect(c2Skill).toBe(c0Skill);
    expect(c3Skill).toBeGreaterThan(c2Skill);
    expect(c4Burst).toBeGreaterThan(0);
    expect(c5Burst).toBeGreaterThan(c4Burst);
  });
});
