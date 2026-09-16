import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerMHydroDefinition, TRAVELER_M_HYDRO_KIT_METADATA } from "./travelerMHydroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "charged" | "plungeLow" | "skill" | "burst") {
  const character = createTravelerMHydroDefinition(constellationLevel);
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
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-m-hydro");
}

describe("Male Hydro Traveler runtime kit", () => {
  it("simulates Torrent Surge as positive Hydro skill damage and normals as physical damage", () => {
    const skillEvents = damageEvents(run(0, "skill"));
    const normalEvents = damageEvents(run(0, "normal"));

    expect(skillEvents).toHaveLength(1);
    expect(skillEvents[0]?.damage?.damageType).toBe("skill");
    expect(skillEvents[0]?.damage?.element).toBe("hydro");
    expect(skillEvents[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(normalEvents.length).toBeGreaterThan(0);
    expect(normalEvents.every((event) => event.damage?.element === "physical")).toBe(true);
    expect(normalEvents.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("simulates Rising Waters as positive Hydro burst damage", () => {
    const events = damageEvents(run(0, "burst"));

    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.damageType).toBe("burst");
    expect(events[0]?.damage?.element).toBe("hydro");
    expect(events[0]?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("gates C3 skill and C5 burst talent boosts at their constellation levels", () => {
    const skillDamage = (level: number) => damageEvents(run(level, "skill"))[0]?.damage?.finalDamage ?? 0;
    const burstDamage = (level: number) => damageEvents(run(level, "burst"))[0]?.damage?.finalDamage ?? 0;

    expect(skillDamage(3)).toBeGreaterThan(skillDamage(0));
    expect(skillDamage(2)).toBe(skillDamage(0));
    expect(burstDamage(5)).toBeGreaterThan(burstDamage(0));
    expect(burstDamage(4)).toBe(burstDamage(0));
  });

  it("fails closed for stateful hold damage and documents unsupported sourced effects", () => {
    const character = createTravelerMHydroDefinition(6);

    expect(character.skill.instances).toHaveLength(1);
    expect(character.skill.instances[0]?.id).toBe("traveler-m-hydro-skill-1");
    expect(TRAVELER_M_HYDRO_KIT_METADATA.unsupportedChannels).toContain(
      "a4SuffusionHpConsumptionBonusDamageRequiresUnmodelledHpCostState",
    );
    expect(TRAVELER_M_HYDRO_KIT_METADATA.unsupportedChannels).toContain(
      "p3BladeOfManyWatersTideboundChargedAttackRequiresHpChangeStacksAndHpThresholds",
    );
  });
});
