import { describe, expect, it } from "vitest";
import { createRaidenShogunDefinition } from "@/game-data/characters/kits/raidenShogunDefinition";
import { resolveInitialStatsPreview } from "./initialStatsPreview";
import type { ArtifactLoadout } from "@/simulation/character/equipment";

describe("resolveInitialStatsPreview", () => {
  it("includes selected weapon base stats and substats", () => {
    const character = createRaidenShogunDefinition(0);
    const preview = resolveInitialStatsPreview({
      character,
      intrinsicCharacter: character,
      selection: { weaponId: "thecatch", refinement: 5 },
    });

    expect(preview.stats.base?.atk).toBe(character.baseStats.atk + 510);
    expect(preview.stats.atk).toBe(character.baseStats.atk + 510);
    expect(preview.stats.energyRecharge).toBeGreaterThan(
      character.baseStats.energyRecharge,
    );
    expect(preview.conditionalBuffs).toBeGreaterThan(0);
  });

  it("uses the selected weapon level instead of the catalog level-90 value", () => {
    const character = createRaidenShogunDefinition(0);
    const preview = resolveInitialStatsPreview({
      character,
      intrinsicCharacter: character,
      selection: { weaponId: "thecatch", refinement: 5, weaponLevel: 20 },
    });

    expect(preview.stats.base?.atk).toBe(character.baseStats.atk + 109);
    expect(preview.stats.base?.atk).not.toBe(character.baseStats.atk + 510);
  });

  it("folds fixed artifact main and substats into the panel", () => {
    const character = createRaidenShogunDefinition(0);
    const artifacts: ArtifactLoadout = {
      flower: {
        slot: "flower",
        setId: "gladiators-finale",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [{ stat: "critRate", value: 0.066 }],
      },
    };
    const preview = resolveInitialStatsPreview({
      character,
      intrinsicCharacter: character,
      selection: {
        artifactSetId: "gladiators-finale",
        artifactPieces: 1,
        artifactLoadout: artifacts,
      },
    });

    expect(preview.stats.hp).toBe(character.baseStats.hp + 4780);
    expect(preview.stats.critRate).toBeCloseTo(character.baseStats.critRate + 0.066, 8);
  });

  it("includes a verified unconditional artifact set stat", () => {
    const character = createRaidenShogunDefinition(0);
    const preview = resolveInitialStatsPreview({
      character,
      intrinsicCharacter: character,
      selection: {
        artifactSetId: "gladiators-finale",
        artifactPieces: 2,
      },
    });

    expect(preview.stats.atk).toBeCloseTo(character.baseStats.atk * 1.18, 8);
    expect(preview.permanentBuffs).toBeGreaterThan(0);
  });

  it("keeps conditional passives out of the initial stat bag", () => {
    const character = createRaidenShogunDefinition(0);
    const preview = resolveInitialStatsPreview({
      character,
      intrinsicCharacter: character,
      selection: {
        weaponId: "thecatch",
        refinement: 5,
        artifactSetId: "gladiators-finale",
        artifactPieces: 4,
      },
    });

    // The Catch's Burst bonus is action-scoped and Gladiator's 4pc bonus is
    // conditional. Neither may become a global `dmgBonus` in the panel.
    expect(preview.stats.dmgBonus).toBe(0);
    expect(preview.conditionalBuffs).toBeGreaterThan(0);
  });
});
