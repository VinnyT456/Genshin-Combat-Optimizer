import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { CYNO_KIT_METADATA, createCynoDefinition } from "./cynoDefinition";

const noCrit = { critMode: "never" as const };

function fullEnergySnapshot(character: ReturnType<typeof createCynoDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

describe("Cyno runtime kit", () => {
  it("executes the sourced burst cast and enters the Electro Pactsworn state", () => {
    const cyno = createCynoDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const result = simulateRotation([cyno], [{ characterId: cyno.id, actionType: "burst" }], testEnemy, {
      ...noCrit,
      resumeFrom: fullEnergySnapshot(cyno),
    });
    const hits = result.timeline.filter((event) => event.type === "damage");

    expect(hits).toHaveLength(1);
    expect(hits[0]?.damage?.element).toBe("electro");
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(cyno.burst.stance).toMatchObject({
      durationSeconds: CYNO_KIT_METADATA.pactswornDurationSeconds,
      infusion: { element: "electro", canBeOverridden: false },
    });
  });

  it("converts the following Normal Attack to Electro and adds the sourced EM scaling", () => {
    const noEm = createCynoDefinition(0, undefined, { baseStats: { ...cynoWithStats(), elementalMastery: 0 } });
    const withEm = createCynoDefinition(0, undefined, { baseStats: { ...cynoWithStats(), elementalMastery: 200 } });
    const rotation = [
      { characterId: noEm.id, actionType: "burst" as const },
      { characterId: noEm.id, actionType: "normal" as const },
    ];
    const noEmResult = simulateRotation([noEm], rotation, testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(noEm) });
    const withEmResult = simulateRotation([withEm], rotation, testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(withEm) });
    const normal = withEmResult.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");

    expect(normal?.damage?.element).toBe("electro");
    expect(withEmResult.totalDamage).toBeGreaterThan(noEmResult.totalDamage);
  });

  it("retains the generated C3 and C5 talent boosts", () => {
    const c0 = createCynoDefinition(0);
    const c3 = createCynoDefinition(3);
    const c5 = createCynoDefinition(5);
    const burst = [{ characterId: c0.id, actionType: "burst" as const }];
    const skill = [{ characterId: c0.id, actionType: "skill" as const }];

    expect(simulateRotation([c3], [{ characterId: c3.id, actionType: "burst" }], testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(c3) }).totalDamage)
      .toBeGreaterThan(simulateRotation([c0], burst, testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(c0) }).totalDamage);
    expect(simulateRotation([c5], [{ characterId: c5.id, actionType: "skill" }], testEnemy, noCrit).totalDamage)
      .toBeGreaterThan(simulateRotation([c0], skill, testEnemy, noCrit).totalDamage);
  });
});

function cynoWithStats() {
  return createCynoDefinition().baseStats;
}
