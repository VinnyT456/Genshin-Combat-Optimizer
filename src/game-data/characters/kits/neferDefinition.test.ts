import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { NEFER_KIT_METADATA, createNeferDefinition } from "./neferDefinition";

const noCrit = { critMode: "never" as const };

function run(character: ReturnType<typeof createNeferDefinition>, actionType: "skill" | "burst") {
  const ready = {
    ...character,
    burst: { ...character.burst, energyCost: 0 },
  };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Nefer runtime kit", () => {
  it("executes generated baseline skill and burst damage", () => {
    const skill = run(createNeferDefinition(0, { normal: 1, skill: 1, burst: 1 }), "skill");
    const burst = run(createNeferDefinition(0, { normal: 1, skill: 1, burst: 1 }), "burst");

    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(skill.totalDamage);
    expect(burst.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
  });

  it("retains C3 skill talent levels in actual damage output", () => {
    const c0 = run(createNeferDefinition(0, { normal: 1, skill: 1, burst: 1 }), "skill");
    const c3 = run(createNeferDefinition(3, { normal: 1, skill: 1, burst: 1 }), "skill");

    expect(c3.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("retains C5 burst talent levels in actual damage output", () => {
    const c0 = run(createNeferDefinition(0, { normal: 1, skill: 1, burst: 1 }), "burst");
    const c5 = run(createNeferDefinition(5, { normal: 1, skill: 1, burst: 1 }), "burst");

    expect(c5.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("does not invent C4 RES shred without the unavailable Shadow Dance state", () => {
    const c3 = run(createNeferDefinition(3, { normal: 1, skill: 1, burst: 1 }), "skill");
    const c4 = run(createNeferDefinition(4, { normal: 1, skill: 1, burst: 1 }), "skill");

    expect(c4.totalDamage).toBe(c3.totalDamage);
  });

  it("fails closed for unsupported passive and state-dependent channels", () => {
    const metadata = NEFER_KIT_METADATA.unsupportedChannels;

    expect(metadata).toContain("a1MoonsignSeedConversionVeilOfFalsehoodStacksAndEMBuff");
    expect(metadata).toContain("c4ShadowDanceDendroResistanceReductionAndVerdantDewRate");
    expect(createNeferDefinition().resources).toEqual([]);
  });
});
