import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { SimulationConfig } from "@/types";
import { createArlecchinoDefinition } from "./arlecchinoDefinition";

const noCrit = { critMode: "never" as const };
function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "arlecchino");
}
function run(character: ReturnType<typeof createArlecchinoDefinition>, actionTypes: readonly ("normal" | "skill" | "burst")[], config: SimulationConfig = noCrit) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Arlecchino runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const events = damageEvents(run(createArlecchinoDefinition(), ["skill", "burst"]));
    expect(events.length).toBeGreaterThanOrEqual(4);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });
  it("applies the sourced 40% Pyro DMG passive to Pyro abilities", () => {
    const withPassive = createArlecchinoDefinition();
    const withoutPassive = { ...withPassive, passives: withPassive.passives.map((passive) => passive.id === "arlecchino-p3" ? { ...passive, buffs: [] } : passive) };
    const boosted = damageEvents(run(withPassive, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    const base = damageEvents(run(withoutPassive, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    expect(boosted).toBeGreaterThan(base);
  });
  it("applies C6's sourced post-skill CRIT bonuses to a following normal attack", () => {
    const c0 = damageEvents(run(createArlecchinoDefinition(0), ["skill", "normal"], {}));
    const c6 = damageEvents(run(createArlecchinoDefinition(6), ["skill", "normal"], {}));
    expect(c6[3]?.damage?.finalDamage).toBeGreaterThan(c0[3]?.damage?.finalDamage ?? 0);
  });
  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    const c0 = createArlecchinoDefinition(0);
    expect(damageEvents(run(createArlecchinoDefinition(3), ["normal"]))[0]?.damage?.finalDamage).toBeGreaterThan(damageEvents(run(c0, ["normal"]))[0]?.damage?.finalDamage ?? 0);
    expect(damageEvents(run(createArlecchinoDefinition(5), ["burst"]))[0]?.damage?.finalDamage).toBeGreaterThan(damageEvents(run(c0, ["burst"]))[0]?.damage?.finalDamage ?? 0);
  });
});
