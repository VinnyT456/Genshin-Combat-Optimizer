import { describe, it, expect } from "vitest";
import { generateRotationInsights } from "./insightsModel";
import { nationalTeam, testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { Rotation, SimulationResult } from "@/types";

describe("generateRotationInsights", () => {
  it("returns empty array for empty active members or zero duration", () => {
    const fakeResult = {
      duration: 0,
      totalDamage: 0,
      timeline: [],
      damageByCharacter: {},
      finalState: { characters: {} },
    } as unknown as SimulationResult;
    expect(generateRotationInsights(fakeResult, [])).toEqual([]);
  });

  it("extracts 4 real tactical insights from Raiden National team simulation", () => {
    const rotation: Rotation = [
      { characterId: "raiden", actionType: "skill" },
      { characterId: "bennett", actionType: "swap" },
      { characterId: "bennett", actionType: "burst" },
      { characterId: "bennett", actionType: "skill" },
      { characterId: "xiangling", actionType: "swap" },
      { characterId: "xiangling", actionType: "burst" },
      { characterId: "xiangling", actionType: "skill" },
      { characterId: "xingqiu", actionType: "swap" },
      { characterId: "xingqiu", actionType: "burst" },
      { characterId: "xingqiu", actionType: "skill" },
      { characterId: "raiden", actionType: "swap" },
      { characterId: "raiden", actionType: "burst" },
      { characterId: "raiden", actionType: "normal" },
    ];

    const result = simulateRotation(nationalTeam, rotation, testEnemy, { critMode: "expected" });
    const insights = generateRotationInsights(result, nationalTeam);

    expect(insights.length).toBeGreaterThanOrEqual(3);

    const categories = insights.map((i) => i.category);
    expect(categories).toContain("energy");
    expect(categories).toContain("damage");
    expect(categories).toContain("timing");

    for (const insight of insights) {
      expect(insight.title.length).toBeGreaterThan(0);
      expect(insight.summary.length).toBeGreaterThan(0);
      expect(insight.detail.length).toBeGreaterThan(0);
      expect(["success", "warning", "info"]).toContain(insight.status);
    }

    const copy = insights.map((insight) => `${insight.title} ${insight.summary} ${insight.detail}`).join(" ");
    expect(copy).not.toContain("无缝开启下一轮");
    expect(copy).not.toContain("无明显时间闲置");
  });

  it("uses a Chinese action label when the emitted damage name is English", () => {
    const rotation: Rotation = [{ characterId: "test-pyro", actionType: "skill" }];
    const result = simulateRotation([testPyro], rotation, testEnemy, { critMode: "expected" });
    const localizedResult = {
      ...result,
      timeline: result.timeline.map((event) =>
        event.damage
          ? { ...event, damage: { ...event.damage, abilityName: "English Generated Skill" } }
          : event,
      ),
    } as SimulationResult;

    const insights = generateRotationInsights(localizedResult, [testPyro]);
    const copy = insights.map((insight) => `${insight.title} ${insight.summary} ${insight.detail}`).join(" ");
    expect(copy).not.toContain("English Generated Skill");
    expect(copy).toContain("元素战技");
  });

  it("does not infer pure direct damage when no reaction event was emitted", () => {
    const rotation: Rotation = [{ characterId: "test-pyro", actionType: "skill" }];
    const result = simulateRotation([testPyro], rotation, testEnemy, { critMode: "expected" });
    const insights = generateRotationInsights(result, [testPyro]);

    const reactionInsight = insights.find((insight) => insight.category === "reaction");
    expect(reactionInsight?.id).toBe("reaction-synergy-unknown");
    expect(reactionInsight?.evidence).toBe("insufficient");
    expect(reactionInsight?.detail).toContain("不能证明");
  });

  it("does not turn a missing final energy snapshot into a deficit", () => {
    const rotation: Rotation = [{ characterId: "test-pyro", actionType: "skill" }];
    const result = simulateRotation([testPyro], rotation, testEnemy, { critMode: "expected" });
    const incomplete = {
      ...result,
      finalState: { ...result.finalState, characters: {} },
    } as SimulationResult;
    const energyInsight = generateRotationInsights(incomplete, [testPyro]).find(
      (insight) => insight.category === "energy",
    );
    expect(energyInsight?.id).toBe("energy-loop-unknown");
    expect(energyInsight?.evidence).toBe("insufficient");
    expect(energyInsight?.detail).not.toContain("尚缺 0");
  });
});
