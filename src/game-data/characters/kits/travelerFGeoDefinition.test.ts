import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createTravelerFGeoDefinition,
  TRAVELER_F_GEO_KIT_METADATA,
} from "./travelerFGeoDefinition";

const noCrit = { critMode: "never" as const };

function damages(result: ReturnType<typeof simulateRotation>) {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "traveler-f-geo")
    .map((event) => event.damage!);
}

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const traveler = createTravelerFGeoDefinition(constellationLevel);
  const ready = { ...traveler, burst: { ...traveler.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Female Traveler Geo runtime kit", () => {
  it("simulates sourced Starfell Sword damage as Geo", () => {
    const result = run(0, "skill");
    const hits = damages(result);

    expect(result.errors).toHaveLength(0);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.element).toBe("geo");
    expect(hits[0]?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates sourced Wake of Earth damage as Geo", () => {
    const result = run(0, "burst");
    const hits = damages(result);

    expect(result.errors).toHaveLength(0);
    expect(hits).toHaveLength(1);
    expect(hits.every((hit) => hit.element === "geo" && hit.finalDamage > 0)).toBe(true);
  });

  it("gates C3 burst and C5 skill talent boosts at their constellation levels", () => {
    const c2Burst = damages(run(2, "burst")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const c3Burst = damages(run(3, "burst")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const c4Skill = damages(run(4, "skill")).reduce((sum, hit) => sum + hit.finalDamage, 0);
    const c5Skill = damages(run(5, "skill")).reduce((sum, hit) => sum + hit.finalDamage, 0);

    expect(c3Burst).toBeGreaterThan(c2Burst);
    expect(c5Skill).toBeGreaterThan(c4Skill);
  });

  it("does not infer unsupported A4 damage or the unverified C2 explosion", () => {
    // C5's verified skill-level increase applies at both levels; C6 adds no unsupported hit.
    expect(damages(run(5, "skill")).map((hit) => hit.finalDamage)).toEqual(
      damages(run(6, "skill")).map((hit) => hit.finalDamage),
    );
    expect(TRAVELER_F_GEO_KIT_METADATA.unsupportedChannels).toContain(
      "a4NormalComboFinalHitGeoDamageUnverified",
    );
    expect(TRAVELER_F_GEO_KIT_METADATA.unsupportedChannels).toContain(
      "c2DestroyedMeteoriteExplosionUnverified",
    );
  });
});
