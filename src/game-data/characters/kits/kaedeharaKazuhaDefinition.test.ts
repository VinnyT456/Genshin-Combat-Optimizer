import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { KAEDEHARA_KAZUHA_KIT_METADATA, createKaedeharaKazuhaDefinition } from "./kaedeharaKazuhaDefinition";

const noCrit = { critMode: "never" as const };

function fullEnergySnapshot(...characters: GenericCharacterDefinition[]): SimulationSnapshot {
  return {
    time: 0,
    activeCharacterId: characters[0]?.id ?? "kaedehara-kazuha",
    characters: Object.fromEntries(characters.map((character): [string, CharacterSnapshot] => [
      character.id,
      {
        characterId: character.id,
        energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
        cooldowns: {},
        normalStringIndex: 0,
      },
    ])),
  };
}

describe("Kaedehara Kazuha runtime kit", () => {
  it("executes the generated skill and burst damage", () => {
    const kazuha = createKaedeharaKazuhaDefinition();
    const ready = { ...kazuha, burst: { ...kazuha.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready],
      [{ characterId: ready.id, actionType: "skill" }, { characterId: ready.id, actionType: "burst" }],
      testEnemy,
      noCrit,
    );
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(5);
  });

  it("applies C2's post-Burst EM to a later Swirl damage event", () => {
    const c0 = createKaedeharaKazuhaDefinition(0);
    const c2 = createKaedeharaKazuhaDefinition(2);
    const pyroSource: GenericCharacterDefinition = {
      ...c0,
      id: "kazuha-pyro-source",
      name: "Synthetic Pyro Source",
      element: "pyro",
      skill: {
        ...c0.skill,
        id: "kazuha-pyro-source-skill",
        instances: c0.skill.instances.map((instance) => ({
          ...instance,
          element: "pyro",
          application: { element: "pyro", gauge: 1 },
        })),
      },
    };
    const rotation = [
      { characterId: c0.id, actionType: "burst" as const },
      { characterId: pyroSource.id, actionType: "swap" as const },
      { characterId: pyroSource.id, actionType: "skill" as const },
      { characterId: c0.id, actionType: "swap" as const },
      { characterId: c0.id, actionType: "skill" as const },
    ];
    const run = (kazuha: GenericCharacterDefinition) => simulateRotation(
      [kazuha, pyroSource],
      rotation.map((action) => ({ ...action, characterId: action.characterId === c0.id ? kazuha.id : action.characterId })),
      testEnemy,
      { ...noCrit, resumeFrom: fullEnergySnapshot(kazuha, pyroSource) },
    );
    expect(run(c2).totalDamage).toBeGreaterThan(run(c0).totalDamage);
  });

  it("uses C6 Anemo infusion and EM scaling on actual Normal Attack damage", () => {
    const c0 = createKaedeharaKazuhaDefinition(0, undefined, { baseStats: { ...createKaedeharaKazuhaDefinition().baseStats, elementalMastery: 0 } });
    const c6 = createKaedeharaKazuhaDefinition(6, undefined, { baseStats: { ...c0.baseStats, elementalMastery: 200 } });
    const rotation = [{ characterId: c0.id, actionType: "skill" as const }, { characterId: c0.id, actionType: "normal" as const }];
    const c0Result = simulateRotation([c0], rotation, testEnemy, noCrit);
    const c6Result = simulateRotation([c6], rotation, testEnemy, noCrit);
    const normal = c6Result.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");
    expect(normal?.damage?.element).toBe("anemo");
    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
  });

  it("retains generated C3 and C5 talent boosts in actual damage", () => {
    const c0 = createKaedeharaKazuhaDefinition(0);
    const c3 = createKaedeharaKazuhaDefinition(3);
    const c5 = createKaedeharaKazuhaDefinition(5);
    const skill = (character: GenericCharacterDefinition) => simulateRotation([character], [{ characterId: character.id, actionType: "skill" }], testEnemy, noCrit);
    const burst = (character: GenericCharacterDefinition) => simulateRotation([character], [{ characterId: character.id, actionType: "burst" }], testEnemy, { ...noCrit, resumeFrom: fullEnergySnapshot(character) });
    expect(skill(c3).totalDamage).toBeGreaterThan(skill(c0).totalDamage);
    expect(burst(c5).totalDamage).toBeGreaterThan(burst(c0).totalDamage);
  });

  it("documents unsupported conditional channels", () => {
    expect(KAEDEHARA_KAZUHA_KIT_METADATA.unsupportedChannels).toContain("a4SwirlTriggeredAbsorbedElementDamageBonus");
    expect(KAEDEHARA_KAZUHA_KIT_METADATA.unsupportedChannels).toContain("c1BurstTriggeredSkillReset");
  });
});
