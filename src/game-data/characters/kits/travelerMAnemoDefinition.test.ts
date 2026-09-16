import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTravelerMAnemoDefinition, TRAVELER_M_ANEMO_KIT_METADATA } from "./travelerMAnemoDefinition";

const noCrit = { critMode: "never" as const };

function damages(result: ReturnType<typeof simulateRotation>) {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "traveler-m-anemo")
    .map((event) => event.damage!);
}

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const traveler = createTravelerMAnemoDefinition(constellationLevel);
  const ready = { ...traveler, burst: { ...traveler.burst, energyCost: 0 } };
  return simulateRotation([ready], [{ characterId: ready.id, actionType }], testEnemy, noCrit);
}

describe("Male Traveler Anemo runtime kit", () => {
  it("simulates sourced Anemo damage from Palm Vortex and Gust Surge", () => {
    const skill = damages(run(0, "skill"));
    const burst = damages(run(0, "burst"));

    expect(skill).toHaveLength(4);
    expect(burst).toHaveLength(2);
    expect([...skill, ...burst].every((hit) => hit.element === "anemo" && hit.finalDamage > 0)).toBe(true);
  });

  it("applies C3's generated burst talent boost to actual burst damage", () => {
    const c2Damage = damages(run(2, "burst")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const c3Damage = damages(run(3, "burst")).reduce((sum, hit) => sum + hit.finalDamage, 0);

    expect(c3Damage).toBeGreaterThan(c2Damage);
  });

  it("applies C5's generated skill talent boost to actual skill damage", () => {
    const c4Damage = damages(run(4, "skill")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const c5Damage = damages(run(5, "skill")).reduce((sum, hit) => sum + hit.finalDamage, 0);

    expect(c5Damage).toBeGreaterThan(c4Damage);
  });

  it("keeps unverified A1 and unsupported C6 damage effects inert", () => {
    expect(damages(run(3, "burst")).map((hit) => hit.finalDamage)).toEqual(
      damages(run(6, "burst")).map((hit) => hit.finalDamage),
    );
    expect(TRAVELER_M_ANEMO_KIT_METADATA.unsupportedChannels).toContain(
      "a1SlittingWindNormalComboWindBladeUnverified",
    );
    expect(TRAVELER_M_ANEMO_KIT_METADATA.unsupportedChannels).toContain(
      "c6IntertwinedWindsBurstHitResistanceReductionUnsupported",
    );
  });
});
