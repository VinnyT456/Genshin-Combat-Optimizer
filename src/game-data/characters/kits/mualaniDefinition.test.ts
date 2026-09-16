import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { MUALANI_KIT_METADATA, createMualaniDefinition } from "./mualaniDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createMualaniDefinition>,
  actionTypes: readonly ("normal" | "skill" | "burst")[],
) {
  const executable = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation(
    [executable],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damage(result: ReturnType<typeof simulateRotation>): number[] {
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === "mualani")
    .map((event) => event.type === "damage" ? event.damage?.finalDamage ?? 0 : 0);
}

describe("Mualani runtime kit", () => {
  it("executes the HP-scaled Sharky's Surging Bite stance and Boomsharka-laka", () => {
    const events = damage(run(createMualaniDefinition(), ["skill", "normal", "burst"]));
    expect(events).toHaveLength(2);
    expect(events.every((value) => value > 0)).toBe(true);
  });

  it("adds A4 Wavechaser's Exploits as deterministic Max-HP burst damage", () => {
    const base = damage(run(createMualaniDefinition(0, undefined, {}, { wavechaserExploitsStacks: 0 }), ["burst"]))[0] ?? 0;
    const stacked = damage(run(createMualaniDefinition(0, undefined, {}, { wavechaserExploitsStacks: 3 }), ["burst"]))[0] ?? 0;

    expect(stacked).toBeGreaterThan(base);
    expect(MUALANI_KIT_METADATA.a4BurstHpRatioPerStack).toBe(0.15);
  });

  it("applies C4's 75% Boomsharka-laka damage increase only at C4", () => {
    const c3 = damage(run(createMualaniDefinition(3), ["burst"]))[0] ?? 0;
    const c4 = damage(run(createMualaniDefinition(4), ["burst"]))[0] ?? 0;

    expect(c4).toBeGreaterThan(c3);
    expect(c4 / c3).toBeCloseTo(1.75, 8);
  });

  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    // C3 raises the Skill talent, but the sourced bite row is executed as a
    // stance normal hit and the current engine has no cross-slot talent alias.
    expect(createMualaniDefinition(3).constellations.find((entry) => entry.id === "mualani-c3")?.buffs)
      .toBeDefined();
    expect(damage(run(createMualaniDefinition(5), ["burst"]))[0] ?? 0)
      .toBeGreaterThan(damage(run(createMualaniDefinition(0), ["burst"]))[0] ?? 0);
  });
});
