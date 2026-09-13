import { describe, expect, it } from "vitest";
import type { EquipmentStat } from "@/simulation/character/equipment";
import {
  addArtifactSubstatRoll,
  ARTIFACT_SUBSTAT_ROLL_VALUES,
  baselineArtifactSubstats,
  scoreArtifactSubstats,
  THEORETICAL_BEST_SUBSTAT_VALUE,
} from "./artifactSubstatScoring";

describe("artifact substat scoring", () => {
  it("keeps every five-star roll value at one decimal place", () => {
    for (const values of Object.values(ARTIFACT_SUBSTAT_ROLL_VALUES)) {
      expect(values).toHaveLength(4);
      expect(values.every((value) => Number(value.toFixed(1)) === value)).toBe(true);
    }
  });

  it("scores a best-value top-priority substat as 50", () => {
    const substat: EquipmentStat = {
      stat: "critRate",
      value: THEORETICAL_BEST_SUBSTAT_VALUE.crit_rate,
    };
    expect(scoreArtifactSubstats([substat], ["crit_rate"])).toBe(50);
  });

  it("uses the four rounded CRIT DMG upgrade increments", () => {
    const initial: EquipmentStat = { stat: "critDmg", value: 0.078 };
    const increments = ARTIFACT_SUBSTAT_ROLL_VALUES.crit_dmg;
    expect(increments).toEqual([5.4, 6.2, 7.0, 7.8]);
    expect(
      increments.map((_, index) => addArtifactSubstatRoll(initial, index)?.value),
    ).toEqual([0.132, 0.14, 0.148, 0.156]);
  });

  it("does not score a substat that duplicates the piece main stat", () => {
    const substat: EquipmentStat = {
      stat: "atkPercent",
      value: THEORETICAL_BEST_SUBSTAT_VALUE["ATK%"],
    };
    expect(
      scoreArtifactSubstats([substat], ["ATK%", "crit_rate"], {
        stat: "atkPercent",
        value: 0.466,
      }),
    ).toBe(0);
  });

  it("generates four upgraded lines for a level-20 baseline", () => {
    const mainStat: EquipmentStat = { stat: "energyRecharge", value: 0.518 };
    const priorities = ["ER%", "crit_rate", "crit_dmg", "ATK%"] as const;
    const substats = baselineArtifactSubstats(priorities, mainStat);

    expect(substats.map((stat) => stat.stat)).toEqual([
      "critRate",
      "critDmg",
      "atkPercent",
      "elementalMastery",
    ]);
    expect(substats.every((stat) => stat.value > 0)).toBe(true);
    // A completed level-20 four-line artifact has more than the old single-roll
    // 45–50 comparison band because it contains nine total roll increments.
    expect(scoreArtifactSubstats(substats, priorities, mainStat)).toBeGreaterThan(200);
  });
});
