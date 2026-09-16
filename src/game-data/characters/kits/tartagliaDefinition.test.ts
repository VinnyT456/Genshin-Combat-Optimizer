import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTartagliaDefinition } from "./tartagliaDefinition";

const noCrit = { critMode: "never" as const };

function damage(character: ReturnType<typeof createTartagliaDefinition>, action: "skill" | "burst") {
  const runnable = action === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  const result = simulateRotation(
    [runnable],
    [{ characterId: character.id, actionType: action }],
    testEnemy,
    noCrit,
  );
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === character.id)
    .map((event) => event.damage?.finalDamage ?? 0);
}

describe("Tartaglia runtime kit", () => {
  it("executes sourced skill damage with configured talent levels", () => {
    const low = createTartagliaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const high = createTartagliaDefinition(0, { normal: 1, skill: 10, burst: 1 });

    expect(damage(high, "skill")[0]).toBeGreaterThan(damage(low, "skill")[0] ?? 0);
  });

  it("applies the sourced C3 skill-level increase only at C3", () => {
    const rotationDamage = (c: number) => damage(
      createTartagliaDefinition(c, { normal: 1, skill: 10, burst: 1 }),
      "skill",
    );
    const c0 = rotationDamage(0);
    const c2 = rotationDamage(2);
    const c3 = rotationDamage(3);

    expect(c2[0]).toBe(c0[0]);
    expect(c3[0]).toBeGreaterThan(c2[0] ?? 0);
  });

  it("applies the sourced C5 burst-level increase only at C5", () => {
    const rotationDamage = (c: number) => damage(
      createTartagliaDefinition(c, { normal: 1, skill: 1, burst: 10 }),
      "burst",
    );
    const c0 = rotationDamage(0);
    const c4 = rotationDamage(4);
    const c5 = rotationDamage(5);

    expect(c4[0]).toBe(c0[0]);
    expect(c5[0]).toBeGreaterThan(c4[0] ?? 0);
  });

  it("keeps unmodelled state-dependent constellations damage-neutral beyond C3", () => {
    expect(damage(createTartagliaDefinition(6), "skill")).toEqual(
      damage(createTartagliaDefinition(3), "skill"),
    );
  });
});
