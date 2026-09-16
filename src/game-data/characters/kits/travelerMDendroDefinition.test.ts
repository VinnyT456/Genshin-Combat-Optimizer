import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { TRAVELER_M_DENDRO_KIT_METADATA, createTravelerMDendroDefinition } from "./travelerMDendroDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "charged" | "plungeLow" | "skill" | "burst") {
  const character = createTravelerMDendroDefinition(constellationLevel);
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
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "traveler-m-dendro");
}

describe("Male Dendro Traveler runtime kit", () => {
  it("simulates sourced skill damage as Dendro and authored normal damage as physical", () => {
    const skillEvents = damageEvents(run(0, "skill"));
    const normalEvents = damageEvents(run(0, "normal"));

    expect(skillEvents).toHaveLength(1);
    expect(skillEvents[0]?.damage?.element).toBe("dendro");
    expect(skillEvents[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(normalEvents.length).toBeGreaterThan(0);
    expect(normalEvents.every((event) => event.damage?.element === "physical")).toBe(true);
    expect(normalEvents.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("simulates both sourced burst hits as Dendro damage", () => {
    const events = damageEvents(run(0, "burst"));

    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "dendro")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("gates C3 skill and C5 burst talent boosts at the corresponding constellation levels", () => {
    const c0Skill = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c3Skill = damageEvents(run(3, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c0Burst = damageEvents(run(0, "burst")).map((event) => event.damage?.finalDamage ?? 0);
    const c5Burst = damageEvents(run(5, "burst")).map((event) => event.damage?.finalDamage ?? 0);

    expect(c3Skill).toBeGreaterThan(c0Skill);
    expect(c5Burst).toHaveLength(c0Burst.length);
    expect(c5Burst.every((damage, index) => damage > (c0Burst[index] ?? 0))).toBe(true);
    expect(damageEvents(run(2, "skill"))[0]?.damage?.finalDamage).toBe(c0Skill);
    expect(damageEvents(run(4, "burst")).map((event) => event.damage?.finalDamage)).toEqual(c0Burst);
  });

  it("documents sourced mechanics whose required runtime state is unavailable", () => {
    expect(TRAVELER_M_DENDRO_KIT_METADATA.unsupportedChannels).toContain("a4EmScalingSkillAndBurstDamageBonus");
    expect(TRAVELER_M_DENDRO_KIT_METADATA.unsupportedChannels).toContain("p3VerdantViridisStacksAndVerdessenceChargedAttackAndVinecores");
  });
});
