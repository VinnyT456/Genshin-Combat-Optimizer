import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createDilucDefinition } from "./dilucDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter(
    (event) => event.type === "damage" && event.characterId === "diluc",
  );
}

function run(character: ReturnType<typeof createDilucDefinition>, actionTypes: readonly ("normal" | "skill" | "burst")[]) {
  const burst = { ...character.burst, energyCost: 0 };
  return simulateRotation(
    [{ ...character, burst }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Diluc runtime kit", () => {
  it("executes the sourced three-hit skill with deterministic damage", () => {
    const events = damageEvents(run(createDilucDefinition(), ["skill"]));

    expect(events).toHaveLength(3);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies Blessing of Phoenix Pyro infusion and A4 Pyro DMG bonus to the next attack", () => {
    const a4 = createDilucDefinition(0, undefined, { ascensionPhase: 4 });
    const noA4 = createDilucDefinition(0, undefined, { ascensionPhase: 3 });
    const a4Events = damageEvents(run(a4, ["burst", "normal"]));
    const noA4Events = damageEvents(run(noA4, ["burst", "normal"]));
    const a4Normal = a4Events.at(-1)?.damage;
    const noA4Normal = noA4Events.at(-1)?.damage;

    expect(a4Normal?.element).toBe("pyro");
    expect(a4Normal?.finalDamage).toBeGreaterThan(noA4Normal?.finalDamage ?? 0);
  });

  it("applies C1 Conviction only while the enemy is above 50% HP", () => {
    const c0 = createDilucDefinition(0);
    const c1 = createDilucDefinition(1);
    const highHp = { ...testEnemy, maxHp: 100_000, currentHp: 100_000 };
    const lowHp = { ...testEnemy, maxHp: 100_000, currentHp: 40_000 };
    const runAt = (character: typeof c1, enemy: typeof highHp) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [{ characterId: character.id, actionType: "skill" as const }],
      enemy,
      noCrit,
    );
    const c0High = damageEvents(runAt(c0, highHp))[0]?.damage?.finalDamage ?? 0;
    const c1High = damageEvents(runAt(c1, highHp))[0]?.damage?.finalDamage ?? 0;
    const c0Low = damageEvents(runAt(c0, lowHp))[0]?.damage?.finalDamage ?? 0;
    const c1Low = damageEvents(runAt(c1, lowHp))[0]?.damage?.finalDamage ?? 0;

    expect(c1High).toBeGreaterThan(c0High);
    expect(c1Low).toBe(c0Low);
  });

  it("keeps generated C3 and C5 talent boosts in the runtime damage path", () => {
    const c0 = createDilucDefinition(0);
    const c3 = createDilucDefinition(3);
    const c5 = createDilucDefinition(5);

    expect(damageEvents(run(c3, ["skill"]))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(c0, ["skill"]))[0]?.damage?.finalDamage ?? 0,
    );
    expect(damageEvents(run(c5, ["burst"]))[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(run(c0, ["burst"]))[0]?.damage?.finalDamage ?? 0,
    );
  });
});
