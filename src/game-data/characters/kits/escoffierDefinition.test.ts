import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createEscoffierDefinition } from "./escoffierDefinition";
import { createSkirkDefinition } from "./skirkDefinition";

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

  it("emits the sourced burst heal and Rehab Diet ticks", () => {
    const escoffier = ready(createEscoffierDefinition(0, { normal: 1, skill: 1, burst: 10 }));
    const result = simulateRotation([escoffier], [{ characterId: escoffier.id, actionType: "burst" }], testEnemy);
    const healing = result.timeline.filter((event) => event.type === "healing");
    expect(healing.length).toBeGreaterThanOrEqual(1);
    expect(escoffier.burst.healing).toHaveLength(2);
  });

  it("gives C2 five Cold Dish charges to the next qualifying Cryo hits", () => {
    const escoffier = ready(createEscoffierDefinition(2));
    const skirk = createSkirkDefinition(0);
    const result = simulateRotation(
      [escoffier, skirk],
      [
        { characterId: escoffier.id, actionType: "skill" as const },
        { characterId: skirk.id, actionType: "skill" as const },
        { characterId: skirk.id, actionType: "normal" as const },
      ],
      testEnemy,
      { critMode: "never" },
    );
    const normal = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "skirk-seven-phase-normal-1",
    );
    expect(normal?.damage?.finalDamage ?? 0).toBeGreaterThan(0);
    expect(result.finalState.characters.escoffier?.resources?.["escoffier-cold-dish-stacks"]?.value).toBe(4);
  });

  it("applies Cold Dish to a single-enemy Skirk C6 coordinated burst hit", () => {
    const run = (constellationLevel: number) => {
      const escoffier = ready(createEscoffierDefinition(constellationLevel));
      const baseSkirk = createSkirkDefinition(6);
      const skirk = {
        ...baseSkirk,
        burst: { ...baseSkirk.burst, energyCost: 0 },
        resources: baseSkirk.resources.map((resource) =>
          resource.id === "serpents-subtlety" || resource.id === "skirk-havoc-sever"
            ? { ...resource, initial: resource.id === "serpents-subtlety" ? 55 : 3 }
            : resource,
        ),
      };
      return simulateRotation(
        [escoffier, skirk],
        [
          { characterId: escoffier.id, actionType: "skill" as const },
          { characterId: skirk.id, actionType: "burst" as const },
        ],
        testEnemy,
        { critMode: "never" },
      );
    };
    const c0 = run(0);
    const c2 = run(2);
    const c0Coordinated = damageEvents(c0).find((event) => event.abilityId === "skirk-c6-havoc-sever-burst-attack");
    const c2Coordinated = damageEvents(c2).find((event) => event.abilityId === "skirk-c6-havoc-sever-burst-attack");
    expect(c2Coordinated?.finalDamage ?? 0).toBeGreaterThan(c0Coordinated?.finalDamage ?? 0);
    expect(c2.finalState.characters.escoffier?.resources?.["escoffier-cold-dish-stacks"]?.value).toBe(0);
  });

  it("applies C4 Rehab Diet duration, expected healing, and energy", () => {
    const escoffier = ready(createEscoffierDefinition(4));
    const result = simulateRotation([escoffier], [{ characterId: escoffier.id, actionType: "burst" }], testEnemy);
    const rehab = escoffier.burst.healing?.find((healing) => healing.id === "escoffier-rehab-diet");
    expect(rehab?.durationSeconds).toBe(15);
    expect(rehab?.bonusMultiplierFromStat).toEqual({ stat: "critRate", ratio: 1 });
    expect(result.timeline.some((event) => event.type === "energy" && event.description.includes("Secret Rosemary Recipe"))).toBe(true);
  });

  it("fires up to six C6 Special-Grade Frosty Parfaits from attack hits", () => {
    const escoffier = ready(createEscoffierDefinition(6));
    const skirk = createSkirkDefinition(0);
    const result = simulateRotation(
      [escoffier, skirk],
      [
        { characterId: escoffier.id, actionType: "skill" as const },
        { characterId: skirk.id, actionType: "skill" as const },
        ...Array.from({ length: 5 }, () => ({ characterId: skirk.id, actionType: "normal" as const })),
      ],
      testEnemy,
      { critMode: "never" },
    );
    const procs = result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "escoffier-c6-special-grade-frosty-parfait-attack",
    );
    expect(procs.length).toBeGreaterThan(0);
    expect(procs.length).toBeLessThanOrEqual(6);
  });
});
