import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createEscoffierDefinition } from "./escoffierDefinition";

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.flatMap((entry) => (entry.type === "damage" && entry.damage ? [entry.damage] : []));
}

function burstDamage(result: ReturnType<typeof simulateRotation>) {
  const damage = damageEvents(result).find((entry) => entry.abilityId === "escoffier-burst");
  if (!damage) throw new Error("expected Escoffier burst damage");
  return damage;
}

function ready(definition: ReturnType<typeof createEscoffierDefinition>) {
  return { ...definition, burst: { ...definition.burst, energyCost: 0 } };
}

describe("Escoffier runtime kit", () => {
  it("executes the sourced baseline skill and burst damage", () => {
    const escoffier = ready(createEscoffierDefinition(0, { normal: 1, skill: 1, burst: 1 }));
    const result = simulateRotation(
      [escoffier],
      [
        { characterId: escoffier.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "burst" },
      ],
      testEnemy,
    );
    expect(damageEvents(result)).toHaveLength(4);
    expect(damageEvents(result).every((damage) => damage.element === "cryo")).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("applies A4 Hydro/Cryo RES reduction from an explicit four-character count", () => {
    const base = ready(createEscoffierDefinition(0, { normal: 1, skill: 1, burst: 1 }, {}, { hydroOrCryoCount: 0 }));
    const buffed = ready(createEscoffierDefinition(0, { normal: 1, skill: 1, burst: 1 }, {}, { hydroOrCryoCount: 4 }));
    const rotation = (id: string) => [
      { characterId: id, actionType: "skill" as const },
      { characterId: id, actionType: "burst" as const },
    ];
    const baseBurst = burstDamage(simulateRotation([base], rotation(base.id), testEnemy));
    const buffedBurst = burstDamage(simulateRotation([buffed], rotation(buffed.id), testEnemy));
    expect(buffedBurst.finalDamage).toBeGreaterThan(baseBurst.finalDamage);
  });

  it("applies C1 Cryo CRIT DMG after the four-Hydro/Cryo condition is met", () => {
    const c0 = ready(createEscoffierDefinition(0, { normal: 1, skill: 1, burst: 10 }, {}, { hydroOrCryoCount: 4 }));
    const c1 = ready(createEscoffierDefinition(1, { normal: 1, skill: 1, burst: 10 }, {}, { hydroOrCryoCount: 4 }));
    const rotation = (id: string) => [
      { characterId: id, actionType: "skill" as const },
      { characterId: id, actionType: "burst" as const },
    ];
    const c0Burst = burstDamage(simulateRotation([c0], rotation(c0.id), testEnemy));
    const c1Burst = burstDamage(simulateRotation([c1], rotation(c1.id), testEnemy));
    expect(c1Burst.finalDamage).toBeGreaterThan(c0Burst.finalDamage);
  });

  it("executes generated C3 skill and C5 burst talent boosts", () => {
    const c0 = ready(createEscoffierDefinition(0, { normal: 1, skill: 10, burst: 10 }));
    const c3 = ready(createEscoffierDefinition(3, { normal: 1, skill: 10, burst: 10 }));
    const c5 = ready(createEscoffierDefinition(5, { normal: 1, skill: 10, burst: 10 }));
    const c0Skill = damageEvents(simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy))[0]!;
    const c3Skill = damageEvents(simulateRotation([c3], [{ characterId: c3.id, actionType: "skill" }], testEnemy))[0]!;
    const c0Burst = burstDamage(simulateRotation([c0], [{ characterId: c0.id, actionType: "burst" }], testEnemy));
    const c5Burst = burstDamage(simulateRotation([c5], [{ characterId: c5.id, actionType: "burst" }], testEnemy));
    expect(c3Skill.finalDamage).toBeGreaterThan(c0Skill.finalDamage);
    expect(c5Burst.finalDamage).toBeGreaterThan(c0Burst.finalDamage);
  });
});
