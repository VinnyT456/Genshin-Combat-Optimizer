import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { KAEYA_KIT_METADATA, createKaeyaDefinition } from "./kaeyaDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "kaeya");
}

function run(character: ReturnType<typeof createKaeyaDefinition>, actionTypes: ("normal" | "charged" | "skill" | "burst")[]) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Kaeya runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const result = run(createKaeyaDefinition(), ["skill", "burst"]);
    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result)).toHaveLength(2);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C1 CRIT Rate only to Normal/Charged damage against a Cryo aura", () => {
    const c0 = createKaeyaDefinition(0);
    const c1 = createKaeyaDefinition(1);
    const runExpected = (character: ReturnType<typeof createKaeyaDefinition>, actions: ("normal" | "skill")[]) =>
      simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        actions.map((actionType) => ({ characterId: character.id, actionType })),
        testEnemy,
        { critMode: "expected" },
      );

    const baselineNoAura = runExpected(c0, ["normal"]);
    const c1NoAura = runExpected(c1, ["normal"]);
    const baselineCryoAura = runExpected(c0, ["skill", "normal"]);
    const c1CryoAura = runExpected(c1, ["skill", "normal"]);

    expect(c1NoAura.totalDamage).toBe(baselineNoAura.totalDamage);
    expect(c1CryoAura.totalDamage).toBeGreaterThan(baselineCryoAura.totalDamage);
    expect(KAEYA_KIT_METADATA.c1CritRate).toBe(0.15);
  });

  it("adds C6's additional icicle to actual burst damage", () => {
    const c0 = run(createKaeyaDefinition(0), ["burst"]);
    const c6 = run(createKaeyaDefinition(6), ["burst"]);

    expect(damageEvents(c0)).toHaveLength(1);
    expect(damageEvents(c6)).toHaveLength(2);
    expect(c6.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("resolves generated C3 and C5 talent boosts into higher damage", () => {
    expect(run(createKaeyaDefinition(3), ["skill"]).totalDamage).toBeGreaterThan(
      run(createKaeyaDefinition(0), ["skill"]).totalDamage,
    );
    expect(run(createKaeyaDefinition(5), ["burst"]).totalDamage).toBeGreaterThan(
      run(createKaeyaDefinition(0), ["burst"]).totalDamage,
    );
  });
});
