import { describe, expect, it } from "vitest";
import type { ArtifactLoadout } from "@/simulation/character/equipment";
import {
  applyArtifactStatPreset,
  countArtifactPiecesWithStats,
} from "./ArtifactStatsEditor";

describe("countArtifactPiecesWithStats", () => {
  it("ignores zero-valued placeholder pieces and counts authored stats", () => {
    const loadout: ArtifactLoadout = {
      flower: {
        slot: "flower",
        setId: "gladiators-finale",
        mainStat: { stat: "atkFlat", value: 0 },
        substats: [],
      },
      plume: {
        slot: "plume",
        setId: "gladiators-finale",
        mainStat: { stat: "atkFlat", value: 311 },
        substats: [{ stat: "critRate", value: 0.066 }],
      },
    };

    expect(countArtifactPiecesWithStats(loadout)).toBe(1);
  });

  it("returns zero when no loadout exists", () => {
    expect(countArtifactPiecesWithStats(undefined)).toBe(0);
  });

  it("applies deterministic main stats without changing set identity", () => {
    const loadout: ArtifactLoadout = {
      flower: {
        slot: "flower",
        setId: "gladiators-finale",
        mainStat: { stat: "atkFlat", value: 0 },
        substats: [],
      },
      plume: {
        slot: "plume",
        setId: "noblesse-oblige",
        mainStat: { stat: "atkFlat", value: 0 },
        substats: [],
      },
    };

    const next = applyArtifactStatPreset(loadout, "main");
    expect(next.flower?.setId).toBe("gladiators-finale");
    expect(next.flower?.mainStat).toEqual({ stat: "hpFlat", value: 4780 });
    expect(next.plume?.mainStat).toEqual({ stat: "atkFlat", value: 311 });
    expect(next.flower?.substats).toEqual([]);
  });

  it("applies a preset only to requested slots", () => {
    const loadout: ArtifactLoadout = {
      flower: {
        slot: "flower",
        setId: "gladiators-finale",
        mainStat: { stat: "atkFlat", value: 0 },
        substats: [],
      },
      plume: {
        slot: "plume",
        setId: "gladiators-finale",
        mainStat: { stat: "atkFlat", value: 0 },
        substats: [],
      },
    };

    const next = applyArtifactStatPreset(loadout, "balanced", ["flower"]);
    expect(next.flower?.substats.length).toBe(4);
    expect(next.plume?.mainStat.value).toBe(0);
    expect(next.plume?.substats).toEqual([]);
  });
});
