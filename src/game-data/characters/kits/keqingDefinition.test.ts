import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  KEQING_KIT_METADATA,
  createKeqingDefinition,
} from "./keqingDefinition";

const noCrit = { critMode: "never" as const };

describe("Keqing runtime kit", () => {
  it("executes baseline sourced skill and burst damage", () => {
    const keqing = createKeqingDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const burst = { ...keqing.burst, energyCost: 0 };
    const result = simulateRotation(
      [{ ...keqing, burst }],
      [
        { characterId: keqing.id, actionType: "skill" },
        { characterId: keqing.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.timeline.filter((event) => event.type === "damage").length).toBeGreaterThan(4);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies A1 Electro infusion to attacks after Stellar Restoration", () => {
    const withA1 = createKeqingDefinition(0);
    const withoutA1 = createKeqingDefinition(0, undefined, { ascensionPhase: 0 });
    const rotation = [
      { characterId: withA1.id, actionType: "skill" as const },
      { characterId: withA1.id, actionType: "normal" as const },
    ];
    const infused = simulateRotation([withA1], rotation, testEnemy, noCrit);
    const physical = simulateRotation([withoutA1], rotation, testEnemy, noCrit);
    const normal = infused.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");

    expect(normal?.damage?.element).toBe("electro");
    // Neutral dummy resistances make physical and Electro output equal here;
    // the post-infusion element is the damage-affecting runtime behavior.
    expect(physical.totalDamage).toBe(infused.totalDamage);
    expect(withA1.skill.stance?.infusion?.element).toBe("electro");
    expect(KEQING_KIT_METADATA.electroInfusionDurationSeconds).toBe(5);
  });

  it("applies A4 burst follow-up crit damage and C1 extra hits", () => {
    const c0 = createKeqingDefinition(0);
    const c1 = createKeqingDefinition(1);
    const c0Burst = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c1Burst = { ...c1, burst: { ...c1.burst, energyCost: 0 } };
    const c1Rotation = [
      { characterId: c1.id, actionType: "skill" as const },
      { characterId: c1.id, actionType: "normal" as const },
    ];
    const baseline = simulateRotation([c0Burst], [
      { characterId: c0.id, actionType: "skill" as const },
      { characterId: c0.id, actionType: "normal" as const },
    ], testEnemy, { critMode: "expected" });
    const c1Result = simulateRotation([c1Burst], c1Rotation, testEnemy, { critMode: "expected" });
    const c1Hits = c1Result.timeline.filter((event) => event.type === "damage" && event.damage?.abilityId === "keqing-skill");

    expect(c1Hits).toHaveLength(6);
    expect(c1Result.totalDamage).toBeGreaterThan(baseline.totalDamage);
    expect(c0.burst.buffs?.[0]?.modifiers).toEqual([
      { stat: "critRate", value: KEQING_KIT_METADATA.a4CritRate },
      { stat: "energyRecharge", value: KEQING_KIT_METADATA.a4EnergyRecharge },
    ]);
    expect(c1Result.totalDamage).toBeGreaterThan(0);
  });

  it("increases actual burst damage with C3 and skill damage with C5", () => {
    const c0 = createKeqingDefinition(0);
    const c3 = createKeqingDefinition(3);
    const c5 = createKeqingDefinition(5);
    const run = (character: ReturnType<typeof createKeqingDefinition>, actionType: "skill" | "burst") => {
      const ready = actionType === "burst" ? { ...character, burst: { ...character.burst, energyCost: 0 } } : character;
      return simulateRotation([ready], [{ characterId: ready.id, actionType }], testEnemy, noCrit).totalDamage;
    };

    expect(run(c3, "burst")).toBeGreaterThan(run(c0, "burst"));
    expect(run(c5, "skill")).toBeGreaterThan(run(c0, "skill"));
  });
});
