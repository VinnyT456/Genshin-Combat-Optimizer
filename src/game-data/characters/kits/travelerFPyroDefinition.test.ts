import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerFPyroDefinition, TRAVELER_F_PYRO_KIT_METADATA } from "./travelerFPyroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionTypes: Array<"skill" | "burst">) {
  const traveler = createTravelerFPyroDefinition(constellationLevel);
  const ready = { ...traveler, burst: { ...traveler.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    actionTypes.map((actionType) => ({ characterId: ready.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-f-pyro");
}

describe("Female Traveler Pyro runtime kit", () => {
  it("simulates the sourced Pyro Skill and Burst hits with the correct element", () => {
    const result = run(0, ["skill", "burst"]);
    const hits = damageEvents(result);

    expect(hits).toHaveLength(2);
    expect(hits.map((event) => event.damage?.element)).toEqual(["pyro", "pyro"]);
    expect(hits.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies generated C3 Skill and C5 Burst talent boosts to simulated damage", () => {
    const c2Skill = damageEvents(run(2, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    const c3Skill = damageEvents(run(3, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    const c4Burst = damageEvents(run(4, ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c5Burst = damageEvents(run(5, ["burst"]))[0]?.damage?.finalDamage ?? 0;

    expect(c3Skill).toBeGreaterThan(c2Skill);
    expect(c5Burst).toBeGreaterThan(c4Burst);
  });

  it("activates C4 Pyro DMG only after its Burst and only at C4", () => {
    const c3 = damageEvents(run(3, ["burst", "skill"]));
    const c4 = damageEvents(run(4, ["burst", "skill"]));

    expect(c3[1]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c4[1]?.damage?.finalDamage).toBeGreaterThan(c3[1]?.damage?.finalDamage ?? 0);
    expect(c4[0]?.damage?.finalDamage).toBeCloseTo(c3[0]?.damage?.finalDamage ?? 0, 8);
  });

  it("keeps unsupported Nightsoul-dependent effects explicitly inert", () => {
    expect(TRAVELER_F_PYRO_KIT_METADATA.unsupportedChannels).toContain(
      "c6NightsoulGatedPyroInfusionAndCritDamageUnsupported",
    );
    expect(damageEvents(run(5, ["skill"]))[0]?.damage?.element).toBe("pyro");
  });
});
