import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createQiqiDefinition, QIQI_KIT_METADATA } from "./qiqiDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "qiqi");
}

function run(character: ReturnType<typeof createQiqiDefinition>, actionTypes: ("normal" | "charged" | "skill" | "burst")[]) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Qiqi runtime kit", () => {
  it("executes sourced baseline Normal, Skill, and Burst damage", () => {
    const result = run(createQiqiDefinition(), ["normal", "skill", "burst"]);
    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result).length).toBeGreaterThanOrEqual(4);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("resolves generated C3 Burst talent boost into higher damage", () => {
    const burstC0 = run(createQiqiDefinition(0), ["burst"]);
    const burstC3 = run(createQiqiDefinition(3), ["burst"]);
    expect(burstC3.totalDamage).toBeGreaterThan(burstC0.totalDamage);
    expect(damageEvents(burstC3)[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(burstC0)[0]?.damage?.finalDamage ?? 0,
    );
  });

  it("resolves generated C5 Skill talent boost into higher damage", () => {
    const skillC0 = run(createQiqiDefinition(0), ["skill"]);
    const skillC5 = run(createQiqiDefinition(5), ["skill"]);
    expect(skillC5.totalDamage).toBeGreaterThan(skillC0.totalDamage);
    expect(damageEvents(skillC5)[0]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(skillC0)[0]?.damage?.finalDamage ?? 0,
    );
    expect(QIQI_KIT_METADATA.unsupportedChannels).toContain("c2FrozenToTheBoneNormalChargedDamageBonusSourceConflict");
  });
});
