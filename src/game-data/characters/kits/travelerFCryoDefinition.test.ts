import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { TRAVELER_F_CRYO_KIT_METADATA, createTravelerFCryoDefinition } from "./travelerFCryoDefinition";

const noCrit = { critMode: "never" as const };

function run(character: ReturnType<typeof createTravelerFCryoDefinition>, actionTypes: ("skill" | "burst")[]) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Female Cryo Traveler runtime kit", () => {
  it("simulates the sourced Cryo skill damage instances", () => {
    const character = createTravelerFCryoDefinition();
    const result = run(character, ["skill"]);
    const events = result.timeline.filter((event) => event.type === "damage" && event.characterId === character.id);

    expect(result.errors).toEqual([]);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "cryo")).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("simulates sourced Cryo burst damage without inventing field-triggered extra strikes", () => {
    const character = createTravelerFCryoDefinition();
    const result = run(character, ["burst"]);
    const events = result.timeline.filter((event) => event.type === "damage" && event.characterId === character.id);

    expect(result.errors).toEqual([]);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("cryo");
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("gates sourced C3 burst and C5 skill talent boosts at their constellation levels", () => {
    const damage = (constellationLevel: number, action: "skill" | "burst") =>
      run(createTravelerFCryoDefinition(constellationLevel, { normal: 1, skill: 6, burst: 6 }), [action]).totalDamage;

    expect(damage(3, "burst")).toBeGreaterThan(damage(2, "burst"));
    expect(damage(6, "burst")).toBe(damage(3, "burst"));
    expect(damage(5, "skill")).toBeGreaterThan(damage(4, "skill"));
    expect(damage(6, "skill")).toBe(damage(5, "skill"));
  });

  it("keeps state-dependent effects explicitly unsupported and fail-closed", () => {
    const character = createTravelerFCryoDefinition(6);

    expect(character.constellationLevel).toBe(6);
    expect(character.burst.instances).toHaveLength(1);
    expect(TRAVELER_F_CRYO_KIT_METADATA.unsupportedChannels).toContain("p4IcepointStacksFreezingIceChargedAttackAndFrostglow");
  });
});
