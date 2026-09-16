import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createSangonomiyaKokomiDefinition,
  SANGONOMIYA_KOKOMI_KIT_METADATA,
} from "./sangonomiyaKokomiDefinition";

const deterministic = { critMode: "never" as const };

function kokomiDamage(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter(
    (event) => event.type === "damage" && event.characterId === "sangonomiya-kokomi",
  );
}

describe("Sangonomiya Kokomi runtime kit", () => {
  it("executes the generated normal, charged, skill, and burst damage tables", () => {
    const kokomi = createSangonomiyaKokomiDefinition(0, { normal: 10, skill: 10, burst: 10 });
    const result = simulateRotation(
      [{ ...kokomi, burst: { ...kokomi.burst, energyCost: 0 } }],
      [
        { characterId: kokomi.id, actionType: "normal" },
        { characterId: kokomi.id, actionType: "charged" },
        { characterId: kokomi.id, actionType: "skill" },
        { characterId: kokomi.id, actionType: "burst" },
      ],
      testEnemy,
      deterministic,
    );

    expect(result.errors).toHaveLength(0);
    expect(kokomiDamage(result)).toHaveLength(4); // One normal, charged, skill, and burst cast.
    expect(kokomiDamage(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C3's Burst talent-level increase only when C3 is unlocked", () => {
    const c2 = createSangonomiyaKokomiDefinition(2, { normal: 1, skill: 1, burst: 1 });
    const c3 = createSangonomiyaKokomiDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: c2.id, actionType: "burst" as const }];
    const damage = (character: typeof c2) => kokomiDamage(simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      rotation,
      testEnemy,
      deterministic,
    ))[0]?.damage?.finalDamage ?? 0;

    expect(damage(c3)).toBeGreaterThan(damage(c2));
    expect(kokomiDamage(simulateRotation(
      [{ ...c2, burst: { ...c2.burst, energyCost: 0 } }], rotation, testEnemy, deterministic,
    ))).toHaveLength(1);
  });

  it("applies C5's Skill talent-level increase only when C5 is unlocked", () => {
    const c4 = createSangonomiyaKokomiDefinition(4, { normal: 1, skill: 1, burst: 1 });
    const c5 = createSangonomiyaKokomiDefinition(5, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: c4.id, actionType: "skill" as const }];
    const damage = (character: typeof c4) => kokomiDamage(simulateRotation(
      [character], rotation, testEnemy, deterministic,
    ))[0]?.damage?.finalDamage ?? 0;

    expect(damage(c5)).toBeGreaterThan(damage(c4));
    expect(SANGONOMIYA_KOKOMI_KIT_METADATA.modeledConstellations).toEqual([3, 5]);
  });
});
