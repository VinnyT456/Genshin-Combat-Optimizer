import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { ALBEDO_A4_METADATA, createAlbedoDefinition } from "./albedoDefinition";

describe("Albedo runtime kit", () => {
  it("deals Geo skill damage through Solar Isotoma and its Transient Blossom", () => {
    const albedo = createAlbedoDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const result = simulateRotation(
      [albedo, testPyro],
      [{ characterId: "albedo", actionType: "skill" }],
      testEnemy,
    );
    const damage = result.timeline.filter((event) => event.type === "damage");

    expect(result.totalDamage).toBeGreaterThan(0);
    expect(damage).toHaveLength(2);
    expect(damage.every((event) => event.damage?.element === "geo")).toBe(true);
    expect(damage.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("uses the sourced DEF-scaling Transient Blossom row", () => {
    const albedo = createAlbedoDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const transient = albedo.skill.instances.find((instance) => instance.id === "albedo-skill-2");

    expect(transient?.scaling).toEqual([
      expect.objectContaining({ stat: "def" }),
    ]);
    expect(transient?.scaling[0]?.table.values[9]).toBe(2.4048);
  });

  it("increases skill damage through the sourced C3 talent-level buff", () => {
    const c0 = createAlbedoDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createAlbedoDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const rotation = [{ characterId: "albedo", actionType: "skill" as const }];

    const c0Result = simulateRotation([c0, testPyro], rotation, testEnemy);
    const c3Result = simulateRotation([c3, testPyro], rotation, testEnemy);

    expect(c3Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(c3Result.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
  });

  it("declares Homuncular Nature as a ten-second, 125 EM party buff on Burst", () => {
    const albedo = createAlbedoDefinition(0);
    expect(albedo.burst.buffs).toEqual([
      expect.objectContaining({
        sourceCharacterId: "albedo",
        duration: ALBEDO_A4_METADATA.durationSeconds,
        targets: { scope: "party" },
        modifiers: [{ stat: "elementalMastery", value: ALBEDO_A4_METADATA.elementalMastery }],
      }),
    ]);
  });
});
