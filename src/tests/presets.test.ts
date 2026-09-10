import { describe, expect, it } from "vitest";
import { amberHuTaoVvPreset } from "@/game-data/presets";

describe("KQM Presets — Amber Hu Tao VV Burst Support", () => {
  it("conforms to the PlaystylePreset schema", () => {
    expect(amberHuTaoVvPreset.id).toBe("amber-hutao-vv-burst-support");
    expect(amberHuTaoVvPreset.characterId).toBe("amber");
    expect(amberHuTaoVvPreset.team.slot1.characterId).toBe("hu-tao");
    expect(amberHuTaoVvPreset.team.slot2.characterId).toBe("xingqiu");
    expect(amberHuTaoVvPreset.team.slot3.characterId).toBe("amber");
    expect(amberHuTaoVvPreset.team.slot4.characterId).toBe("sucrose");

    expect(amberHuTaoVvPreset.rotation.length).toBeGreaterThan(0);
    expect(amberHuTaoVvPreset.erRequirements.length).toBeGreaterThanOrEqual(2);
    expect(amberHuTaoVvPreset.build.weapons.length).toBeGreaterThanOrEqual(2);
    expect(amberHuTaoVvPreset.build.artifacts.length).toBeGreaterThanOrEqual(2);
    expect(amberHuTaoVvPreset.mechanicsCaveatsZh.length).toBeGreaterThanOrEqual(3);
  });

  it("contains valid action types for every step in the rotation", () => {
    const validActions = new Set([
      "normal",
      "charged",
      "plungeLow",
      "plungeHigh",
      "skill",
      "burst",
      "swap",
    ]);

    for (const step of amberHuTaoVvPreset.rotation) {
      expect(validActions.has(step.actionType)).toBe(true);
      expect(step.characterId).toBeTruthy();
    }
  });
});
