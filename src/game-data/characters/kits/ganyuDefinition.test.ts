import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { GANYU_KIT_METADATA, createGanyuDefinition } from "./ganyuDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

function runGanyu(
  definition: ReturnType<typeof createGanyuDefinition>,
  actionTypes: ("charged" | "skill" | "burst")[],
  critMode: "never" | "expected" = "never",
) {
  return simulateRotation(
    [{ ...definition, burst: { ...definition.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: "ganyu", actionType })),
    testEnemy,
    { critMode },
  );
}

describe("Ganyu runtime kit", () => {
  it("produces the generated two-part charged-shot damage", () => {
    const result = runGanyu(createGanyuDefinition(0), ["charged"]);
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A1 charged CRIT Rate only to a charged shot after the triggering shot", () => {
    const a1 = runGanyu(createGanyuDefinition(0), ["charged", "charged"], "expected");
    const c0Definition = createGanyuDefinition(0, undefined, { ascensionPhase: 0 });
    const noA1 = runGanyu(c0Definition, ["charged", "charged"], "expected");
    const baselineSecond = damageEvents(noA1)[2]?.damage?.finalDamage ?? 0;
    const a1Second = damageEvents(a1)[2]?.damage?.finalDamage ?? 0;

    expect(damageEvents(a1)).toHaveLength(4);
    expect(a1Second).toBeGreaterThan(baselineSecond);
    expect(GANYU_KIT_METADATA.a1ChargedCritRate).toBe(0.2);
  });

  it("applies A4 Cryo DMG after Celestial Shower to a later Cryo hit", () => {
    const noA4 = runGanyu(createGanyuDefinition(0, undefined, { ascensionPhase: 1 }), ["burst", "skill"]);
    const withA4 = runGanyu(createGanyuDefinition(0), ["burst", "skill"]);
    const baselineSkill = damageEvents(noA4).at(-1)?.damage?.finalDamage ?? 0;
    const boostedSkill = damageEvents(withA4).at(-1)?.damage?.finalDamage ?? 0;

    expect(boostedSkill / baselineSkill).toBeCloseTo(1.2, 8);
    expect(GANYU_KIT_METADATA.a4CryoDamageBonus).toBe(0.2);
  });

  it("resolves C3's generated burst talent boost into higher burst damage", () => {
    const c0 = damageEvents(runGanyu(createGanyuDefinition(0), ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c3 = damageEvents(runGanyu(createGanyuDefinition(3), ["burst"]))[0]?.damage?.finalDamage ?? 0;

    expect(c3).toBeGreaterThan(c0);
  });
});
