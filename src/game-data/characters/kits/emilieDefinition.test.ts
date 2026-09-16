import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { EMILIE_KIT_METADATA, createEmilieDefinition } from "./emilieDefinition";

const noCrit = { critMode: "never" as const };

function firstEmilieDamage(result: ReturnType<typeof simulateRotation>) {
  const event = result.timeline.find((entry) => entry.type === "damage" && entry.characterId === "emilie");
  if (event?.damage === undefined) throw new Error("expected Emilie damage event");
  return event.damage;
}

describe("Emilie runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const emilie = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const ready = { ...emilie, burst: { ...emilie.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready],
      [
        { characterId: ready.id, actionType: "skill" },
        { characterId: ready.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    expect(result.timeline.filter((event) => event.type === "damage" && event.characterId === "emilie").length).toBeGreaterThan(1);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C1's 20% skill damage bonus", () => {
    const c0 = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c1 = createEmilieDefinition(1, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: "emilie", actionType: "skill" as const }];
    const c0Damage = firstEmilieDamage(simulateRotation([c0], rotation, testEnemy, noCrit));
    const c1Damage = firstEmilieDamage(simulateRotation([c1], rotation, testEnemy, noCrit));
    expect(c1Damage.finalDamage).toBeGreaterThan(c0Damage.finalDamage);
    expect(EMILIE_KIT_METADATA.c1SkillDamageBonus).toBe(0.2);
  });

  it("applies A4's ATK-scaled damage bonus only against a Burning enemy", () => {
    const emilie = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const plain = firstEmilieDamage(simulateRotation([emilie], [{ characterId: emilie.id, actionType: "skill" }], testEnemy, noCrit));
    const readyEmilie = { ...emilie, burst: { ...emilie.burst, energyCost: 0 } };
    const burningResult = simulateRotation(
      [testPyro, readyEmilie],
      [
        { characterId: testPyro.id, actionType: "skill" },
        { characterId: readyEmilie.id, actionType: "swap" },
        { characterId: readyEmilie.id, actionType: "skill" },
        { characterId: readyEmilie.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    const emilieDamageEvents = burningResult.timeline.filter((event) => event.type === "damage" && event.characterId === "emilie");
    const burningBurst = emilieDamageEvents.at(-1)?.damage;
    expect(burningBurst?.finalDamage).toBeGreaterThan(plain.finalDamage);
  });

  it("keeps A4 locked before Ascension 4", () => {
    const locked = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 3 });
    const unlocked = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4 });
    const rotation = [{ characterId: "emilie", actionType: "skill" as const }];
    const lockedDamage = firstEmilieDamage(simulateRotation([locked], rotation, testEnemy, noCrit));
    const unlockedDamage = firstEmilieDamage(simulateRotation([unlocked], rotation, testEnemy, noCrit));
    expect(unlockedDamage.finalDamage).toBe(lockedDamage.finalDamage);
  });

  it("preserves generated C3 and C5 talent boosts in damage", () => {
    const c0 = createEmilieDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createEmilieDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const c5 = createEmilieDefinition(5, { normal: 1, skill: 1, burst: 1 });
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c5Ready = { ...c5, burst: { ...c5.burst, energyCost: 0 } };
    expect(firstEmilieDamage(simulateRotation([c3], [{ characterId: "emilie", actionType: "skill" }], testEnemy, noCrit)).finalDamage)
      .toBeGreaterThan(firstEmilieDamage(simulateRotation([c0], [{ characterId: "emilie", actionType: "skill" }], testEnemy, noCrit)).finalDamage);
    expect(firstEmilieDamage(simulateRotation([c5Ready], [{ characterId: "emilie", actionType: "burst" }], testEnemy, noCrit)).finalDamage)
      .toBeGreaterThan(firstEmilieDamage(simulateRotation([c0Ready], [{ characterId: "emilie", actionType: "burst" }], testEnemy, noCrit)).finalDamage);
  });
});
