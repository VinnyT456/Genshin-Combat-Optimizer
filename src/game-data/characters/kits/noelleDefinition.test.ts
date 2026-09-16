import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createNoelleDefinition, NOELLE_KIT_METADATA } from "./noelleDefinition";

function run(constellation: number, actions: Array<"burst" | "charged" | "normal" | "skill">) {
  const source = createNoelleDefinition(constellation);
  const character = { ...source, burst: { ...source.burst, energyCost: 0 } };
  const result = simulateRotation(
    [character],
    actions.map((actionType) => ({ characterId: "noelle", actionType })),
    testEnemy,
    { critMode: "never" },
  );
  return result;
}

describe("Noelle runtime kit", () => {
  it("has sourced baseline skill damage and preserves DEF-only scaling", () => {
    const character = createNoelleDefinition();
    const skill = run(0, ["skill"]);
    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(character.skill.instances[0]?.scaling.map((term) => term.stat)).toEqual(["def"]);
  });

  it("converts post-burst attacks to Geo and adds the sourced talent-level DEF conversion", () => {
    const c0 = createNoelleDefinition(0);
    const result = run(0, ["burst", "normal"]);
    const hit = result.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");
    expect(hit?.damage?.element).toBe("geo");
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
    expect(c0.burst.stance?.conversions?.[0]?.ratio).toBe(0.72);
    expect(NOELLE_KIT_METADATA.burstDurationSeconds).toBe(15);
  });

  it("makes C2 charged hits deal more damage than C0", () => {
    const c0 = run(0, ["charged"]);
    const c2 = run(2, ["charged"]);
    expect(c2.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(c2.totalDamage / c0.totalDamage).toBeCloseTo(1.15, 5);
  });

  it("makes C6 burst-state normal hits deal more damage through the extra DEF conversion", () => {
    const c0 = run(0, ["burst", "normal"]);
    const c6 = run(6, ["burst", "normal"]);
    expect(c6.totalDamage).toBeGreaterThan(c0.totalDamage);
    // C5 raises the Burst talent to level 13 (85% DEF); C6 adds another 50%.
    expect(createNoelleDefinition(6).burst.stance?.conversions?.[0]?.ratio).toBe(1.35);
  });

  it("retains the generated C3/C5 talent-level perks", () => {
    expect(run(3, ["skill"]).totalDamage).toBeGreaterThan(run(0, ["skill"]).totalDamage);
    expect(run(5, ["burst"]).totalDamage).toBeGreaterThan(run(0, ["burst"]).totalDamage);
  });
});
