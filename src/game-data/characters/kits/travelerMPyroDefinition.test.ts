import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { TRAVELER_M_PYRO_KIT_METADATA, createTravelerMPyroDefinition } from "./travelerMPyroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "charged" | "plungeLow" | "skill" | "burst") {
  const character = createTravelerMPyroDefinition(constellationLevel);
  const simulationCharacter = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [simulationCharacter],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-m-pyro");
}

describe("Male Pyro Traveler runtime kit", () => {
  it("simulates authored Pyro skill and physical normal damage with positive values", () => {
    const skillEvents = damageEvents(run(0, "skill"));
    const normalEvents = damageEvents(run(0, "normal"));

    expect(skillEvents).toHaveLength(1);
    expect(skillEvents[0]?.damage?.element).toBe("pyro");
    expect(skillEvents[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(normalEvents.length).toBeGreaterThan(0);
    expect(normalEvents.every((event) => event.damage?.element === "physical")).toBe(true);
    expect(normalEvents.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("simulates sourced burst damage as a positive Pyro hit", () => {
    const events = damageEvents(run(0, "burst"));

    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("pyro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("gates the sourced C3 skill and C5 burst talent-level boosts", () => {
    const c0Skill = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c3Skill = damageEvents(run(3, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c0Burst = damageEvents(run(0, "burst"))[0]?.damage?.finalDamage ?? 0;
    const c5Burst = damageEvents(run(5, "burst"))[0]?.damage?.finalDamage ?? 0;

    expect(c3Skill).toBeGreaterThan(c0Skill);
    expect(c5Burst).toBeGreaterThan(c0Burst);
    expect(damageEvents(run(2, "skill"))[0]?.damage?.finalDamage).toBe(c0Skill);
    expect(damageEvents(run(4, "burst"))[0]?.damage?.finalDamage).toBe(c0Burst);
  });

  it("documents sourced effects that require unsupported state or triggers", () => {
    expect(TRAVELER_M_PYRO_KIT_METADATA.unsupportedChannels).toContain("c4PostBurstPyroDamageBonus");
    expect(TRAVELER_M_PYRO_KIT_METADATA.unsupportedChannels).toContain("p3NightsoulBurstStacksAndInfernoChargedAttack");
  });
});
