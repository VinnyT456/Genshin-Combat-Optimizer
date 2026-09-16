import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { XIANYUN_KIT_METADATA, createXianyunDefinition } from "./xianyunDefinition";

function runXianyun(constellationLevel: number, actionType: "skill" | "burst") {
  const character = createXianyunDefinition(constellationLevel, {
    normal: 1,
    skill: 1,
    burst: 1,
  });
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    { critMode: "never" },
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.flatMap((event) =>
    event.type === "damage" && event.damage ? [event.damage] : [],
  );
}

describe("Xianyun runtime kit", () => {
  it("preserves generated sourced skill and burst damage at C0", () => {
    const skill = runXianyun(0, "skill");
    const burst = runXianyun(0, "burst");

    expect(skill.errors).toEqual([]);
    const skillEvents = damageEvents(skill);
    const burstEvents = damageEvents(burst);

    expect(skillEvents).toHaveLength(4);
    expect(skillEvents.every((event) => event.finalDamage > 0)).toBe(true);
    expect(skillEvents.map(({ element, damageType, abilityId }) => ({ element, damageType, abilityId })))
      .toEqual(Array.from({ length: 4 }, () => ({
        element: "anemo",
        damageType: "skill",
        abilityId: "xianyun-skill",
      })));
    expect(burstEvents.length).toBeGreaterThan(0);
    expect(burstEvents.every((event) => event.finalDamage > 0)).toBe(true);
    expect(burstEvents.map(({ element, damageType, abilityId }) => ({ element, damageType, abilityId })))
      .toEqual(Array.from({ length: burstEvents.length }, () => ({
        element: "anemo",
        damageType: "burst",
        abilityId: "xianyun-burst",
      })));
  });

  it("applies C3 burst talent levels to simulated burst damage only at C3+", () => {
    const c0Events = damageEvents(runXianyun(0, "burst"));
    const c2Events = damageEvents(runXianyun(2, "burst"));
    const c3Events = damageEvents(runXianyun(3, "burst"));

    expect(c0Events.length).toBeGreaterThan(0);
    expect(c0Events.every((event) => event.finalDamage > 0 && event.element === "anemo" && event.damageType === "burst" && event.abilityId === "xianyun-burst")).toBe(true);
    expect(c2Events.map((event) => event.finalDamage)).toEqual(c0Events.map((event) => event.finalDamage));
    expect(c3Events.length).toBe(c0Events.length);
    expect(c3Events.every((event) => event.finalDamage > 0 && event.element === "anemo" && event.damageType === "burst" && event.abilityId === "xianyun-burst")).toBe(true);
    expect(c3Events[0]?.finalDamage ?? 0).toBeGreaterThan(c0Events[0]?.finalDamage ?? 0);
  });

  it("applies C5 skill talent levels to simulated skill damage only at C5+", () => {
    const c0Events = damageEvents(runXianyun(0, "skill"));
    const c4Events = damageEvents(runXianyun(4, "skill"));
    const c5Events = damageEvents(runXianyun(5, "skill"));

    expect(c0Events.length).toBe(4);
    expect(c0Events.every((event) => event.finalDamage > 0 && event.element === "anemo" && event.damageType === "skill" && event.abilityId === "xianyun-skill")).toBe(true);
    expect(c4Events.map((event) => event.finalDamage)).toEqual(c0Events.map((event) => event.finalDamage));
    expect(c5Events.length).toBe(c0Events.length);
    expect(c5Events.every((event) => event.finalDamage > 0 && event.element === "anemo" && event.damageType === "skill" && event.abilityId === "xianyun-skill")).toBe(true);
    expect(c5Events[0]?.finalDamage ?? 0).toBeGreaterThan(c0Events[0]?.finalDamage ?? 0);
  });

  it("fails closed for invalid constellation input and lists unsupported stateful effects", () => {
    expect(createXianyunDefinition(Number.NaN).constellationLevel).toBe(0);
    expect(createXianyunDefinition(99).constellationLevel).toBe(6);
    expect(XIANYUN_KIT_METADATA.unsupported).toContain(
      "A4 and C2 plunge shockwave flat damage: missing active Starwicker assistance state, per-character 0.4-second quota, single-target application, and 9,000/18,000 cap semantics",
    );
  });
});
