import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { CANDACE_KIT_METADATA, createCandaceDefinition } from "./candaceDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

describe("Candace runtime kit", () => {
  it("executes sourced skill and burst HP-scaling damage", () => {
    const candace = createCandaceDefinition(0);
    const result = simulateRotation(
      [{ ...candace, burst: { ...candace.burst, energyCost: 0 } }],
      [
        { characterId: "candace", actionType: "skill" },
        { characterId: "candace", actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result).length).toBeGreaterThanOrEqual(3);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies C2 Max HP after Heron's Sanctum and increases later burst damage", () => {
    const c0 = createCandaceDefinition(0);
    const c2 = createCandaceDefinition(2);
    const run = (character: typeof c0) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: "candace", actionType: "skill" },
        { characterId: "candace", actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    const c0Burst = damageEvents(run(c0)).at(-1)?.damage?.finalDamage ?? 0;
    const c2Burst = damageEvents(run(c2)).at(-1)?.damage?.finalDamage ?? 0;

    expect(c2Burst / c0Burst).toBeCloseTo(1.2, 8);
    expect(CANDACE_KIT_METADATA.c2MaxHpBonus).toBe(0.2);
  });

  it("executes C6's sourced 15% Max HP wave on another character's normal attack", () => {
    const candace = createCandaceDefinition(6);
    const other = { ...createCandaceDefinition(0), id: "other-candace", name: "Other Candace" };
    const result = simulateRotation(
      [
        { ...candace, burst: { ...candace.burst, energyCost: 0 } },
        other,
      ],
      [
        { characterId: "candace", actionType: "burst" },
        { characterId: "other-candace", actionType: "normal" },
      ],
      testEnemy,
      noCrit,
    );
    const candaceEvents = result.timeline.filter(
      (event) => event.type === "damage" && event.characterId === "candace",
    );

    expect(candaceEvents.length).toBe(3);
    expect(candaceEvents.at(-1)?.damage?.finalDamage).toBeGreaterThan(0);
    expect(CANDACE_KIT_METADATA.c6IcdSeconds).toBe(2.3);
  });

  it("includes C1's sourced three-second extension in C6 trigger duration", () => {
    const c6 = createCandaceDefinition(6);
    expect(c6.burst.triggers?.[0]?.durationSeconds).toBe(12);
    expect(CANDACE_KIT_METADATA.burstDurationSeconds + CANDACE_KIT_METADATA.c1ExtraDurationSeconds).toBe(12);
  });
});
