import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { RAZOR_KIT_METADATA, createRazorDefinition } from "./razorDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "skill" | "burst") {
  const character = createRazorDefinition(constellationLevel);
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Razor runtime kit", () => {
  it("executes sourced baseline Normal, Skill, and Burst damage", () => {
    const character = createRazorDefinition();
    const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready],
      (["normal", "skill", "burst"] as const).map((actionType) => ({ characterId: ready.id, actionType })),
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(5);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("increases actual Lightning Fang damage at C3 through the generated talent boost", () => {
    expect(run(3, "burst").totalDamage).toBeGreaterThan(run(0, "burst").totalDamage);
  });

  it("increases actual Claw and Thunder damage at C5 through the generated talent boost", () => {
    expect(run(5, "skill").totalDamage).toBeGreaterThan(run(0, "skill").totalDamage);
  });

  it("fails closed for sourced perk channels without deterministic runtime support", () => {
    expect(RAZOR_KIT_METADATA.unsupportedChannels).toContain("c1DamageBonusAfterParticlePickup");
    expect(RAZOR_KIT_METADATA.unsupportedChannels).toContain("c6PeriodicChargedNormalAttackAndElectroSigilOverflow");
  });
});
