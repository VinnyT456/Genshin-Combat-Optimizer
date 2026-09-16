import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerFHydroDefinition, TRAVELER_F_HYDRO_KIT_METADATA } from "./travelerFHydroDefinition";

const noCrit = { critMode: "never" as const };

function damages(result: ReturnType<typeof simulateRotation>) {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "traveler-f-hydro")
    .map((event) => event.damage!);
}

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const traveler = createTravelerFHydroDefinition(constellationLevel);
  const ready = { ...traveler, burst: { ...traveler.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Female Traveler Hydro runtime kit", () => {
  it("simulates the sourced initial Torrent Surge as Hydro skill damage", () => {
    const result = run(0, "skill");
    const hits = damages(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.element).toBe("hydro");
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates Rising Waters as sourced Hydro burst damage", () => {
    const result = run(0, "burst");
    const hits = damages(result);

    expect(result.errors).toEqual([]);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.element).toBe("hydro");
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("applies C3 skill and C5 burst talent boosts only at their unlocked levels", () => {
    const skillDamage = (level: number) => damages(run(level, "skill")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const burstDamage = (level: number) => damages(run(level, "burst")).reduce((sum, hit) => sum + hit.finalDamage, 0);

    expect(skillDamage(3)).toBeGreaterThan(skillDamage(2));
    expect(skillDamage(6)).toBe(skillDamage(3));
    expect(burstDamage(5)).toBeGreaterThan(burstDamage(4));
    expect(burstDamage(6)).toBe(burstDamage(5));
  });

  it("fails closed for stateful hold damage and unsupported perks", () => {
    const traveler = createTravelerFHydroDefinition(6);

    expect(traveler.skill.instances).toHaveLength(1);
    expect(traveler.skill.instances[0]?.id).toBe("traveler-f-hydro-skill-1");
    expect(TRAVELER_F_HYDRO_KIT_METADATA.unsupportedChannels).toContain(
      "p3BladeOfManyWatersTideboundChargedAttackRequiresHpChangeStacksAndHpThresholds",
    );
  });
});
