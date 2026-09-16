import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createTighnariDefinition, TIGHNARI_KIT_METADATA } from "./tighnariDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "tighnari");
}

function run(level: number, actionTypes: ("charged" | "skill" | "burst")[]) {
  const character = createTighnariDefinition(level);
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Tighnari runtime kit", () => {
  it("executes the sourced multi-part Wreath Arrow and burst damage baseline", () => {
    const result = run(0, ["charged", "burst"]);
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events.length).toBeGreaterThanOrEqual(4);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies the sourced C1 charged CRIT Rate in expected charged-shot damage only when unlocked", () => {
    const rotation = (id: string) => [{ characterId: id, actionType: "charged" as const }];
    const simulate = (level: number) => {
      const character = createTighnariDefinition(level);
      return simulateRotation([character], rotation(character.id), testEnemy);
    };
    const c0 = damageEvents(simulate(0))[0]?.damage?.finalDamage ?? 0;
    const c1 = damageEvents(simulate(1))[0]?.damage?.finalDamage ?? 0;

    expect(c1).toBeGreaterThan(c0);
  });

  it("resolves generated C3 and C5 talent-level boosts into higher burst and skill damage", () => {
    const c0Burst = damageEvents(run(0, ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c3Burst = damageEvents(run(3, ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c0Skill = damageEvents(run(0, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    const c5Skill = damageEvents(run(5, ["skill"]))[0]?.damage?.finalDamage ?? 0;

    expect(c3Burst).toBeGreaterThan(c0Burst);
    expect(c5Skill).toBeGreaterThan(c0Skill);
  });

  it("gates Keen Sight on ascension and activates its sourced EM buff after charged shot", () => {
    const locked = createTighnariDefinition(0, undefined, { ascensionPhase: 0 });
    const unlocked = createTighnariDefinition(0, undefined, { ascensionPhase: 1 });
    expect(locked.chargedAttack?.buffs).toBeUndefined();
    expect(unlocked.chargedAttack?.buffs?.[0]?.modifiers).toEqual([
      { stat: "elementalMastery", value: TIGHNARI_KIT_METADATA.a1ElementalMastery },
    ]);
    expect(TIGHNARI_KIT_METADATA.a1DurationSeconds).toBe(4);
  });
});
