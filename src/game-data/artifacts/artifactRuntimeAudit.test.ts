import { describe, expect, it } from "vitest";
import { generatedArtifactEffects } from "./generated/setEffects";
import { completeSetBonusBuffsById } from "./completeSetBonusBuffs";
import { syntheticLoadout } from "@/features/simulation/equipmentAdapter";
import {
  harvestArtifactHealingEffects,
  harvestArtifactSetBuffs,
  harvestTeamArtifactStateEffects,
  type CharacterEquipmentBuffs,
} from "@/simulation/engine/equipmentBuffs";

/**
 * This is deliberately an integration audit rather than a compiler-shape
 * check. A runtime record can exist while the equipment harvester accidentally
 * drops its tier, so every generated row is equipped at its own threshold and
 * must reach one of the executable seams: Buff, healing, or lifecycle state.
 */
describe("generated artifact runtime coverage", () => {
  it("audits every generated tier through the real harvesters", () => {
    expect(generatedArtifactEffects).toHaveLength(122);

    for (const effect of generatedArtifactEffects) {
      const runtime = completeSetBonusBuffsById(effect.setSlug);
      expect(runtime, effect.id).toBeDefined();

      const equipment: CharacterEquipmentBuffs = {
        artifacts: syntheticLoadout(effect.setSlug, effect.pieces as 1 | 2 | 4),
        runtimeSetBonuses: runtime ? [runtime] : [],
      };
      const buffs = harvestArtifactSetBuffs(equipment);
      const healing = harvestArtifactHealingEffects(equipment, "audit-wearer");
      const state = harvestTeamArtifactStateEffects(
        ["audit-wearer"],
        { "audit-wearer": equipment },
      );

      expect(
        buffs.length + healing.length + state.length,
        `${effect.id} must reach a runtime seam`,
      ).toBeGreaterThan(0);
    }
  });

  it("keeps source limitations explicit for every non-modelled row", () => {
    const nonModelled = generatedArtifactEffects.filter(
      (effect) => effect.support !== "modelled",
    );
    expect(nonModelled).toHaveLength(76);
    for (const effect of nonModelled) {
      expect(effect.reason?.trim(), effect.id).toBeTruthy();
    }
  });
});
