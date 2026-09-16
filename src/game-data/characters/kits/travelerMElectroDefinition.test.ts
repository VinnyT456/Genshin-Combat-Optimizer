import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { TRAVELER_M_ELECTRO_KIT_METADATA, createTravelerMElectroDefinition } from "./travelerMElectroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const character = createTravelerMElectroDefinition(constellationLevel);
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
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-m-electro");
}

describe("Male Electro Traveler runtime kit", () => {
  it("simulates Lightning Blade as Electro damage", () => {
    const result = run(0, "skill");
    const events = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("electro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates only the sourced initial Bellowing Thunder slash", () => {
    const result = run(0, "burst");
    const events = damageEvents(result);

    expect(result.errors).toEqual([]);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("electro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(TRAVELER_M_ELECTRO_KIT_METADATA.unsupportedChannels).toContain("fallingThunderNormalChargedHitTriggerAndProcInterval");
  });

  it("gates C3 burst and C5 skill talent-level increases", () => {
    const c0Skill = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c5Skill = damageEvents(run(5, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c0Burst = damageEvents(run(0, "burst"))[0]?.damage?.finalDamage ?? 0;
    const c3Burst = damageEvents(run(3, "burst"))[0]?.damage?.finalDamage ?? 0;

    expect(c5Skill).toBeGreaterThan(c0Skill);
    expect(c3Burst).toBeGreaterThan(c0Burst);
    expect(damageEvents(run(6, "skill"))[0]?.damage?.finalDamage).toBe(c5Skill);
    expect(damageEvents(run(6, "burst"))[0]?.damage?.finalDamage).toBe(c3Burst);
  });
});
