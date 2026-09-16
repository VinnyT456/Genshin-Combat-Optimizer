import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createRosariaDefinition, ROSARIA_KIT_METADATA } from "./rosariaDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "skill" | "burst") {
  const character = createRosariaDefinition(constellationLevel);
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Rosaria runtime kit", () => {
  it("executes sourced baseline Normal, Skill, and Burst damage", () => {
    const character = createRosariaDefinition();
    const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready],
      (["normal", "skill", "burst"] as const).map((actionType) => ({ characterId: ready.id, actionType })),
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(result.timeline.filter((event) => event.type === "damage" && event.characterId === "rosaria").length).toBeGreaterThanOrEqual(4);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("increases actual Ravaging Confession damage at C3 through the generated talent boost", () => {
    expect(run(3, "skill").totalDamage).toBeGreaterThan(run(0, "skill").totalDamage);
  });

  it("increases actual Rites of Termination damage at C5 through the generated talent boost", () => {
    expect(run(5, "burst").totalDamage).toBeGreaterThan(run(0, "burst").totalDamage);
  });

  it("fails closed for sourced stateful perk channels without a deterministic runtime gate", () => {
    expect(ROSARIA_KIT_METADATA.unsupportedChannels).toContain("c6BurstHitPhysicalResistanceReductionWindow");
    expect(ROSARIA_KIT_METADATA.unsupportedChannels).toContain("c1CritTriggeredNormalDamageAndAttackSpeedWindow");
  });
});
