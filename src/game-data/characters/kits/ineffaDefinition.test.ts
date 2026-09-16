import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { INEFFA_KIT_METADATA, createIneffaDefinition } from "./ineffaDefinition";

function runIneffa(
  character: ReturnType<typeof createIneffaDefinition>,
  actionType: "skill" | "burst",
) {
  // Burst energy is isolated from these damage assertions; energy generation
  // is one of the intentionally unsupported Ineffa state channels.
  const executable = {
    ...character,
    burst: { ...character.burst, energyCost: 0 },
  };
  return simulateRotation(
    [executable],
    [{ characterId: executable.id, actionType }],
    testEnemy,
    { critMode: "never" },
  );
}

function damageTotal(result: ReturnType<typeof simulateRotation>): number {
  return result.timeline
    .filter((event) => event.type === "damage")
    .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
}

describe("Ineffa runtime kit", () => {
  it("executes the baseline Skill and its two sourced Electro damage instances", () => {
    const result = runIneffa(createIneffaDefinition(0), "skill");
    const events = result.timeline.filter((event) => event.type === "damage");

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "electro")).toBe(true);
    expect(damageTotal(result)).toBeGreaterThan(0);
  });

  it("increases Skill damage at C3 through the sourced +3 talent level", () => {
    const c0 = damageTotal(runIneffa(createIneffaDefinition(0, { normal: 1, skill: 1, burst: 1 }), "skill"));
    const c3 = damageTotal(runIneffa(createIneffaDefinition(3, { normal: 1, skill: 1, burst: 1 }), "skill"));

    expect(c3).toBeGreaterThan(c0);
  });

  it("increases Burst damage at C5 through the sourced +3 talent level", () => {
    const c0 = damageTotal(runIneffa(createIneffaDefinition(0, { normal: 1, skill: 1, burst: 1 }), "burst"));
    const c5 = damageTotal(runIneffa(createIneffaDefinition(5, { normal: 1, skill: 1, burst: 1 }), "burst"));

    expect(c5).toBeGreaterThan(c0);
  });

  it("does not invent A1 thundercloud damage without the required Lunar-Charged state", () => {
    const c0 = damageTotal(runIneffa(createIneffaDefinition(0), "skill"));
    const a1 = damageTotal(runIneffa(createIneffaDefinition(0, undefined, { ascensionPhase: 1 }), "skill"));

    expect(a1).toBe(c0);
    expect(INEFFA_KIT_METADATA.unsupportedChannels).toContain("a1ThundercloudLunarChargedAdditionalAttack");
  });
});
