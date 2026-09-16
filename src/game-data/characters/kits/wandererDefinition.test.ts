import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createWandererDefinition, WANDERER_KIT_METADATA } from "./wandererDefinition";

function simulateAbility(
  constellationLevel: number,
  actionType: "skill" | "burst",
  talentLevels = { normal: 10, skill: 10, burst: 10 },
){
  const character = createWandererDefinition(constellationLevel, talentLevels);
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    { critMode: "never" },
  );
  expect(result.errors).toEqual([]);
  return {
    abilityId: character[actionType].id,
    damage: result.damageByAbility[character[actionType].id] ?? 0,
    events: result.timeline
      .filter((event) => event.type === "damage" && event.damage?.abilityId === character[actionType].id)
      .map((event) => event.damage!),
  };
}

describe("Wanderer runtime kit overlay", () => {
  it("simulates sourced skill hits as positive Anemo skill damage", () => {
    const { damage, events } = simulateAbility(0, "skill");
    expect(damage).toBeGreaterThan(0);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.element === "anemo" && event.damageType === "skill")).toBe(true);
    expect(events.every((event) => event.finalDamage > 0)).toBe(true);
  });

  it("simulates all five sourced burst hits as positive Anemo burst damage", () => {
    const { damage, events } = simulateAbility(0, "burst");
    expect(damage).toBeGreaterThan(0);
    expect(events).toHaveLength(5);
    expect(events.every((event) => event.element === "anemo" && event.damageType === "burst")).toBe(true);
    expect(events.every((event) => event.finalDamage > 0)).toBe(true);
  });

  it("applies sourced C3 Burst talent boost only at constellation three", () => {
    const c0 = simulateAbility(0, "burst");
    const c2 = simulateAbility(2, "burst");
    const c3 = simulateAbility(3, "burst");
    expect(c0.damage).toBeGreaterThan(0);
    expect(c2.damage).toBe(c0.damage);
    expect(c3.damage).toBeGreaterThan(c2.damage);
    expect(c3.events.every((event) => event.element === "anemo" && event.damageType === "burst" && event.finalDamage > 0)).toBe(true);
  });

  it("applies sourced C5 Skill talent boost only at constellation five", () => {
    const c0 = simulateAbility(0, "skill");
    const c4 = simulateAbility(4, "skill");
    const c5 = simulateAbility(5, "skill");
    expect(c0.damage).toBeGreaterThan(0);
    expect(c4.damage).toBe(c0.damage);
    expect(c5.damage).toBeGreaterThan(c4.damage);
    expect(c5.events.every((event) => event.element === "anemo" && event.damageType === "skill" && event.finalDamage > 0)).toBe(true);
  });

  it("resolves configured talent levels through actual damage", () => {
    expect(simulateAbility(0, "skill", { normal: 10, skill: 6, burst: 10 }).damage).toBeLessThan(
      simulateAbility(0, "skill", { normal: 10, skill: 10, burst: 10 }).damage,
    );
  });

  it("documents state/proc channels that remain unsupported", () => {
    expect(WANDERER_KIT_METADATA.unsupportedChannels).toContain(
      "c2BurstDamageFromMissingKuugoryokuAtCast",
    );
    expect(WANDERER_KIT_METADATA.unsupportedChannels).toContain("a4ProbabilisticDescentWindArrows");
    expect(WANDERER_KIT_METADATA.unsupportedChannels).toContain("c6WindfavoredNormalAttackTriggeredExtraHit");
    expect(WANDERER_KIT_METADATA.unsupportedReason).toContain("Windfavored and Kuugoryoku state are not represented");
  });
});
