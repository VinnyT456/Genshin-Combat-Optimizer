import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createPruneDefinition, PRUNE_KIT_METADATA } from "./pruneDefinition";

const noCrit = { critMode: "never" as const };

function damage(character: ReturnType<typeof createPruneDefinition>, actionType: "skill" | "burst"): number {
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  const result = simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
  return result.timeline
    .filter((event) => event.type === "damage" && event.characterId === ready.id)
    .reduce((total, event) => total + (event.type === "damage" ? event.damage?.finalDamage ?? 0 : 0), 0);
}

describe("Prune runtime kit", () => {
  it("produces deterministic sourced baseline Skill and Burst damage", () => {
    const prune = createPruneDefinition(0, { normal: 1, skill: 1, burst: 1 });
    expect(damage(prune, "skill")).toBeGreaterThan(0);
    expect(damage(prune, "burst")).toBeGreaterThan(0);
  });

  it("applies C3's Burst talent levels to actual Burst damage only", () => {
    const c0 = createPruneDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createPruneDefinition(3, { normal: 1, skill: 1, burst: 1 });
    expect(damage(c3, "burst")).toBeGreaterThan(damage(c0, "burst"));
    expect(damage(c3, "skill")).toBe(damage(c0, "skill"));
  });

  it("applies C5's Skill talent levels to actual Skill damage and preserves C3", () => {
    const c0 = createPruneDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createPruneDefinition(5, { normal: 1, skill: 1, burst: 1 });
    expect(damage(c5, "skill")).toBeGreaterThan(damage(c0, "skill"));
    expect(damage(c5, "burst")).toBeGreaterThan(damage(c0, "burst"));
  });

  it("documents reaction-, hit-, and party-state channels that remain fail-closed", () => {
    expect(PRUNE_KIT_METADATA.unsupportedChannels).toContain("a1SwirlTriggeredConvertedOathhammerDamage");
    expect(PRUNE_KIT_METADATA.unsupportedChannels).toContain("c2BurstHunterSeekerHitStackingAtk");
    expect(PRUNE_KIT_METADATA.unsupportedChannels).toContain("p4HexereiReactionTriggeredAtkBuff");
  });
});
