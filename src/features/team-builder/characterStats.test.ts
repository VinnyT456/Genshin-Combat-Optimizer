import { describe, it, expect } from "vitest";
import { nationalTeam } from "@/game-data";
import { setSlot } from "./teamModel";
import type { CharacterDefinition, Stats } from "@/types";

describe("Character Stats Customization", () => {
  it("allows updating character baseStats and preserves character identity", () => {
    const raiden = nationalTeam[0]!;
    expect(raiden.id).toBe("raiden-shogun");

    const customStats: Stats = {
      ...raiden.baseStats,
      atk: 2200,
      critRate: 0.75,
      critDmg: 1.60,
      energyRecharge: 2.70,
      elementalMastery: 120,
    };

    const updatedRaiden: CharacterDefinition = {
      ...raiden,
      baseStats: customStats,
    };

    expect(updatedRaiden.id).toBe("raiden-shogun");
    expect(updatedRaiden.baseStats.atk).toBe(2200);
    expect(updatedRaiden.baseStats.critRate).toBe(0.75);
    expect(updatedRaiden.baseStats.critDmg).toBe(1.60);
    expect(updatedRaiden.baseStats.energyRecharge).toBe(2.70);
    expect(updatedRaiden.baseStats.elementalMastery).toBe(120);

    // Verify team integration via setSlot
    const team = [raiden, null, null, null];
    const newTeam = setSlot(team, 0, updatedRaiden);
    expect(newTeam[0]?.baseStats.atk).toBe(2200);
    expect(newTeam[0]?.baseStats.critRate).toBe(0.75);
  });
});
