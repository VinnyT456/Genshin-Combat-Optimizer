import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { LAUMA_KIT_METADATA, createLaumaDefinition } from "./laumaDefinition";

const noCrit = { critMode: "never" as const };

function firstDamage(character: ReturnType<typeof createLaumaDefinition>, actionType: "normal" | "skill") {
  const result = simulateRotation([character], [{ characterId: character.id, actionType }], testEnemy, noCrit);
  const event = result.timeline.find((entry) => entry.type === "damage" && entry.characterId === character.id);
  if (event?.damage === undefined) throw new Error(`expected ${actionType} damage event`);
  return event.damage.finalDamage;
}

describe("Lauma runtime kit", () => {
  it("executes sourced baseline skill damage", () => {
    const lauma = createLaumaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    expect(firstDamage(lauma, "skill")).toBeGreaterThan(0);
  });

  it("applies A4 EM scaling only to Skill damage after Ascension 4", () => {
    const baseStats = createLaumaDefinition().baseStats;
    const lowEm = createLaumaDefinition(0, { normal: 1, skill: 1, burst: 1 }, {
      baseStats: { ...baseStats, elementalMastery: 0 },
    });
    const highEm = createLaumaDefinition(0, { normal: 1, skill: 1, burst: 1 }, {
      baseStats: { ...baseStats, elementalMastery: 800 },
    });
    const lockedHighEm = createLaumaDefinition(0, { normal: 1, skill: 1, burst: 1 }, {
      ascensionPhase: 3,
      baseStats: { ...baseStats, elementalMastery: 800 },
    });

    expect(firstDamage(highEm, "skill")).toBeGreaterThan(firstDamage(lowEm, "skill"));
    expect(firstDamage(highEm, "normal")).toBe(firstDamage(lowEm, "normal"));
    expect(firstDamage(lockedHighEm, "skill")).toBe(firstDamage(lowEm, "skill"));
  });

  it("retains the generated C5 Skill talent boost in actual damage", () => {
    const c0 = createLaumaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createLaumaDefinition(5, { normal: 1, skill: 1, burst: 1 });
    expect(firstDamage(c5, "skill")).toBeGreaterThan(firstDamage(c0, "skill"));
    // The sourced Burst is a support/heal burst with no damage instance, so
    // C3's burst-level increase is retained by the generated constellation
    // row but has no damage event for this engine to compare.
    expect(c5.constellations.find((row) => row.id === "lauma-c3")?.buffs?.[0]).toMatchObject({
      talentLevelModifiers: [{ slot: "burst", levels: 3 }],
    });
  });

  it("documents unsupported reaction and lifecycle channels fail-closed", () => {
    expect(LAUMA_KIT_METADATA.unsupportedChannels).toContain("p3BloomToLunarBloomConversionAndMoonsignPartyState");
    expect(LAUMA_KIT_METADATA.unsupportedChannels).toContain("c6SanctuaryAdditionalLunarBloomHitAndPaleHymnNormalAttackState");
  });
});
