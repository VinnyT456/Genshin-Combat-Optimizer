import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { DORI_KIT_METADATA, createDoriDefinition } from "./doriDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(character: ReturnType<typeof createDoriDefinition>, actionType: "skill" | "burst" | "normal") {
  const result = simulateRotation(
    [{ ...character, ...(actionType === "burst" ? { burst: { ...character.burst, energyCost: 0 } } : {}) }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
  return result;
}

describe("Dori runtime kit", () => {
  it("executes sourced skill and burst damage", () => {
    expect(damageFor(createDoriDefinition(), "skill").totalDamage).toBeGreaterThan(0);
    expect(damageFor(createDoriDefinition(), "burst").totalDamage).toBeGreaterThan(0);
  });

  it("adds C1's sourced additional After-Sales Service Round damage", () => {
    const c0 = damageFor(createDoriDefinition(0), "skill");
    const c1 = damageFor(createDoriDefinition(1), "skill");
    expect(c1.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
    expect(c1.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(DORI_KIT_METADATA.c1ServiceRoundAtkRatio).toBe(0.3156);
  });

  it("applies C6 Electro infusion to a normal attack after Burst", () => {
    const character = createDoriDefinition(6);
    const result = simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "burst" },
        { characterId: character.id, actionType: "normal" },
      ],
      testEnemy,
      noCrit,
    );
    const normalDamage = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.damageType === "normal",
    );
    expect(normalDamage?.damage?.element).toBe("electro");
    expect(normalDamage?.damage?.finalDamage).toBeGreaterThan(0);
    expect(DORI_KIT_METADATA.c6InfusionDurationSeconds).toBe(3);
  });

  it("retains generated C3 and C5 talent-level boosts", () => {
    expect(damageFor(createDoriDefinition(3), "burst").totalDamage).toBeGreaterThan(
      damageFor(createDoriDefinition(0), "burst").totalDamage,
    );
    expect(damageFor(createDoriDefinition(5), "skill").totalDamage).toBeGreaterThan(
      damageFor(createDoriDefinition(0), "skill").totalDamage,
    );
  });
});
