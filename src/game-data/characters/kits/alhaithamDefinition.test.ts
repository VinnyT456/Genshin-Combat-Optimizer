import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createAlhaithamDefinition } from "./alhaithamDefinition";

const noCrit = { critMode: "never" as const };

function readyAlhaitham(constellationLevel = 0, elementalMastery = 0) {
  const base = createAlhaithamDefinition(constellationLevel);
  return createAlhaithamDefinition(
    constellationLevel,
    { normal: 10, skill: 10, burst: 10 },
    {
      level: 90,
      baseStats: { ...base.baseStats, elementalMastery },
    },
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter(
    (event) => event.type === "damage" && event.characterId === "alhaitham",
  );
}

describe("Alhaitham runtime kit", () => {
  it("executes the sourced skill rush and one-mirror Projection Attack", () => {
    const alhaitham = readyAlhaitham();
    const result = simulateRotation(
      [alhaitham],
      [{ characterId: alhaitham.id, actionType: "skill" }],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result)).toHaveLength(2);
    expect(damageEvents(result).map((event) => event.damage?.abilityId)).toEqual([
      "alhaitham-skill",
      "alhaitham-skill",
    ]);
    expect(result.finalState.characters[alhaitham.id]?.resources?.["alhaitham-mirrors"]?.value).toBe(1);
  });

  it("applies Mysteries Laid Bare's verified EM-to-Dendro burst scaling", () => {
    const lowEm = readyAlhaitham(0, 0);
    const highEm = readyAlhaitham(0, 500);
    const low = simulateRotation(
      [{ ...lowEm, burst: { ...lowEm.burst, energyCost: 0 } }],
      [{ characterId: lowEm.id, actionType: "burst" }],
      testEnemy,
      noCrit,
    );
    const high = simulateRotation(
      [{ ...highEm, burst: { ...highEm.burst, energyCost: 0 } }],
      [{ characterId: highEm.id, actionType: "burst" }],
      testEnemy,
      noCrit,
    );
    const lowHits = damageEvents(low);
    const highHits = damageEvents(high);

    expect(highHits[0]?.damage?.finalDamage).toBeGreaterThan(lowHits[0]?.damage?.finalDamage ?? 0);
  });

  it("applies the sourced C3 skill talent boost through the runtime damage path", () => {
    const c0 = readyAlhaitham(0);
    const c3 = readyAlhaitham(3);
    const rotation = [{ characterId: c0.id, actionType: "skill" as const }];
    const c0Result = simulateRotation([c0], rotation, testEnemy, noCrit);
    const c3Result = simulateRotation([c3], rotation, testEnemy, noCrit);
    const c0Hits = damageEvents(c0Result);
    const c3Hits = damageEvents(c3Result);

    expect(c3Hits[0]?.damage?.finalDamage).toBeGreaterThan(c0Hits[0]?.damage?.finalDamage ?? 0);
    expect(c3Hits[1]?.damage?.finalDamage).toBeGreaterThan(c0Hits[1]?.damage?.finalDamage ?? 0);
  });

  it("consumes tracked mirrors when the sourced burst is cast", () => {
    const alhaitham = readyAlhaitham();
    const burst = { ...alhaitham.burst, energyCost: 0 };
    const result = simulateRotation(
      [{ ...alhaitham, burst }],
      [
        { characterId: alhaitham.id, actionType: "skill" },
        { characterId: alhaitham.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    expect(
      result.finalState.characters[alhaitham.id]?.resources?.["alhaitham-mirrors"]?.value,
    ).toBe(0);
    expect(damageEvents(result)).toHaveLength(3);
  });
});
