import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createVentiDefinition, VENTI_KIT_METADATA } from "./ventiDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "venti")
    .flatMap((event) => (event.damage ? [event.damage] : []));
}

function run(constellationLevel: number, actionType: "skill" | "burst") {
  const venti = createVentiDefinition(constellationLevel);
  const ready = { ...venti, burst: { ...venti.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Venti runtime kit", () => {
  it("executes the sourced baseline skill and both burst damage instances", () => {
    const skill = run(0, "skill");
    const burst = run(0, "burst");
    const skillHits = damageEvents(skill);
    const burstHits = damageEvents(burst);

    expect(skill.errors).toHaveLength(0);
    expect(skillHits).toHaveLength(2);
    expect(burstHits).toHaveLength(2);
    expect(skillHits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ element: "anemo", damageType: "skill", finalDamage: expect.any(Number) }),
      ]),
    );
    for (const hit of [...skillHits, ...burstHits]) {
      expect(hit.element).toBe("anemo");
      expect(hit.finalDamage).toBeGreaterThan(0);
    }
    expect(burstHits.every((hit) => hit.damageType === "burst")).toBe(true);
    expect(skillHits.every((hit) => hit.damageType === "skill")).toBe(true);
  });

  it("applies the generated C3 burst talent boost at exactly constellation three", () => {
    const sum = (constellation: number) =>
      damageEvents(run(constellation, "burst")).reduce((total, hit) => total + hit.finalDamage, 0);

    expect(sum(0)).toBe(sum(2));
    expect(sum(3)).toBeGreaterThan(sum(2));
    expect(sum(6)).toBe(sum(3));
  });

  it("applies the generated C5 skill talent boost at exactly constellation five", () => {
    const sum = (constellation: number) =>
      damageEvents(run(constellation, "skill")).reduce((total, hit) => total + hit.finalDamage, 0);

    expect(sum(0)).toBe(sum(4));
    expect(sum(5)).toBeGreaterThan(sum(4));
    expect(sum(6)).toBe(sum(5));
  });

  it("keeps unsupported/conflicted constellation damage effects inert", () => {
    expect(damageEvents(run(0, "skill"))).toEqual(damageEvents(run(2, "skill")));
    // C6 adds no extra modeled burst damage beyond the executable C3 talent boost.
    expect(damageEvents(run(3, "burst"))).toEqual(damageEvents(run(6, "burst")));
    expect(VENTI_KIT_METADATA.unsupportedChannels).toContain(
      "c6BurstResistanceReductionConflictingSourceNumbersAndAbsorptionState",
    );
  });
});
