import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  createSigewinneDefinition,
  SIGEWINNE_KIT_METADATA,
} from "./sigewinneDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "skill" | "burst", talentLevel = 1) {
  const character = createSigewinneDefinition(constellationLevel, {
    normal: talentLevel,
    skill: talentLevel,
    burst: talentLevel,
  });
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "sigewinne");
}

describe("Sigewinne runtime kit", () => {
  it("preserves generated HP-scaling baseline skill and burst damage", () => {
    const skill = run(0, "skill", 10);
    const burst = run(0, "burst", 10);

    expect(skill.errors).toHaveLength(0);
    expect(damageEvents(skill)).toHaveLength(2);
    expect(damageEvents(burst)).toHaveLength(1);
    expect([...damageEvents(skill), ...damageEvents(burst)].every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("executes the generated C3 skill talent boost as higher simulated damage", () => {
    const c0 = damageEvents(run(0, "skill"))[0]?.damage?.finalDamage ?? 0;
    const c3 = damageEvents(run(3, "skill"))[0]?.damage?.finalDamage ?? 0;

    expect(c3).toBeGreaterThan(c0);
  });

  it("executes the generated C5 burst talent boost as higher simulated damage", () => {
    const c0 = damageEvents(run(0, "burst"))[0]?.damage?.finalDamage ?? 0;
    const c5 = damageEvents(run(5, "burst"))[0]?.damage?.finalDamage ?? 0;

    expect(c5).toBeGreaterThan(c0);
  });

  it("does not apply C3/C5 talent boosts below their constellation gates", () => {
    expect(damageEvents(run(2, "skill"))[0]?.damage?.finalDamage)
      .toBe(damageEvents(run(0, "skill"))[0]?.damage?.finalDamage);
    expect(damageEvents(run(4, "burst"))[0]?.damage?.finalDamage)
      .toBe(damageEvents(run(0, "burst"))[0]?.damage?.finalDamage);
  });

  it("documents sourced effects whose lifecycle cannot be represented safely", () => {
    expect(SIGEWINNE_KIT_METADATA.unsupportedChannels).toContain("c2PostHitHydroResistanceReductionAndShield");
    expect(SIGEWINNE_KIT_METADATA.unsupportedChannels).toContain("a1HydroDamageBonusWindowAndOffFieldSkillFlatDamageStacks");
  });
});
