import { describe, expect, it } from "vitest";
import { allCharacters, testEnemy, testPyro } from "@/game-data";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import { runSimulation, toEngineCharacter } from "./simulationAdapter";

describe("simulationAdapter — website character wiring", () => {
  it("passes the selected constellation through the live roster adapter", () => {
    const bennett = allCharacters.find((character) => character.id === "bennett");
    expect(bennett).toBeDefined();
    const websiteBennett = toWebsiteCharacter(bennett!);
    const rotation = [{ characterId: "bennett", actionType: "skill" as const }];

    const c0 = runSimulation({
      team: [{ ...websiteBennett, constellation: 0 }],
      rotation,
      enemy: testEnemy,
    }).result;
    const c3 = runSimulation({
      team: [{ ...websiteBennett, constellation: 3 }],
      rotation,
      enemy: testEnemy,
    }).result;

    expect(c0.totalDamage).toBeGreaterThan(0);
    expect(c3.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("preserves the edited build while retaining the full generic kit", () => {
    const bennett = toWebsiteCharacter(
      allCharacters.find((character) => character.id === "bennett")!,
    );
    const edited = {
      ...bennett,
      baseStats: { ...bennett.baseStats, atk: 1234, critRate: 0.7 },
      constellation: 3,
      talentLevels: { normal: 8, skill: 10, burst: 9 },
    };

    const engineCharacter = toEngineCharacter(edited);
    expect("normalAttacks" in engineCharacter).toBe(true);
    if (!("normalAttacks" in engineCharacter)) throw new Error("expected generic character");
    expect(engineCharacter.id).toBe(bennett.id);
    expect(engineCharacter.baseStats.atk).toBe(1234);
    expect(engineCharacter.baseStats.critRate).toBe(0.7);
    expect(engineCharacter.constellationLevel).toBe(3);
    expect(engineCharacter.talentLevels).toEqual({ normal: 8, skill: 10, burst: 9 });
    expect(engineCharacter.passives).toBe(bennett.engineDefinition.passives);
    expect(engineCharacter.constellations).toBe(bennett.engineDefinition.constellations);
  });

  it("does not apply a burst-only constellation boost to the skill", () => {
    const bennett = allCharacters.find((character) => character.id === "bennett")!;
    const websiteBennett = toWebsiteCharacter(bennett);
    const rotation = [{ characterId: "bennett", actionType: "skill" as const }];

    const c3 = runSimulation({
      team: [{ ...websiteBennett, constellation: 3 }],
      rotation,
      enemy: testEnemy,
    }).result;
    const c5 = runSimulation({
      team: [{ ...websiteBennett, constellation: 5 }],
      rotation,
      enemy: testEnemy,
    }).result;

    expect(c5.totalDamage).toBeCloseTo(c3.totalDamage, 9);
  });

  it("keeps legacy character definitions compatible", () => {
    const result = runSimulation({
      team: [testPyro],
      rotation: [{ characterId: testPyro.id, actionType: "normal" }],
      enemy: testEnemy,
    }).result;

    expect(result.totalDamage).toBeGreaterThan(0);
  });
});
