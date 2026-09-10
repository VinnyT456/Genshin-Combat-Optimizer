import { describe, expect, it } from "vitest";
import {
  buildCharacterStates,
  generateCandidateActions,
} from "./actionGenerator";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import { testElectro } from "@/game-data/characters/testElectro";
import { filterCharacters } from "@/game-data/characters/registry";
import type {
  CharacterDefinition,
  CharacterSnapshot,
  EnemyState,
  SimulationSnapshot,
} from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";

const enemy: EnemyState = { id: "test-target", name: "Target", level: 90, resistances: {} };

describe("actionGenerator", () => {
  it("generates normal, charged, skill, burst for a solo character when legal", () => {
    // Initial simulation of empty rotation sets up character state
    const res = simulateRotation([testPyro], [], enemy);
    const actions = generateCandidateActions([testPyro], res);

    // Initial state: activeCharacterId is undefined, so candidate actions include abilities
    const actionTypes = actions.map((a) => a.actionType);
    expect(actionTypes).toContain("normal");
    expect(actionTypes).toContain("charged");
    expect(actionTypes).toContain("skill");
    // testPyro has maxEnergy: 40 and starts with 0 energy in test data, so burst should be pruned
    expect(actionTypes).not.toContain("burst");
  });

  it("prunes skill when on cooldown", () => {
    // Run rotation with skill: [ { characterId: "test-pyro", actionType: "skill" } ]
    const res = simulateRotation(
      [testPyro],
      [{ characterId: "test-pyro", actionType: "skill" }],
      enemy,
    );
    // At t=1.0s, testPyro skill has 6s CD, so it's on CD until 7.0s
    const actions = generateCandidateActions([testPyro], res);
    const actionTypes = actions.map((a) => a.actionType);

    expect(actionTypes).toContain("normal");
    expect(actionTypes).toContain("charged");
    expect(actionTypes).not.toContain("skill");
  });

  it("allows burst once energy requirement is satisfied", () => {
    // Create a character with sufficient starting energy
    const fullEnergyPyro: CharacterDefinition = {
      ...testPyro,
      elementalBurst: {
        ...testPyro.elementalBurst,
        energyCost: 20,
      },
    };
    // Pyro skill generates 20 energy, so after 1 skill it has 20 energy
    const res = simulateRotation(
      [fullEnergyPyro],
      [{ characterId: fullEnergyPyro.id, actionType: "skill" }],
      enemy,
    );
    expect(res.finalState.characters[fullEnergyPyro.id]?.energy.current).toBeGreaterThanOrEqual(20);

    const actions = generateCandidateActions([fullEnergyPyro], res);
    const actionTypes = actions.map((a) => a.actionType);
    expect(actionTypes).toContain("burst");
  });

  it("generates swaps to other team members but prunes redundant swap to self", () => {
    const team = [testPyro, testHydro, testElectro];
    // Start with testPyro having performed a normal attack
    const res = simulateRotation(
      team,
      [{ characterId: "test-pyro", actionType: "normal" }],
      enemy,
    );
    expect(res.finalState.activeCharacterId).toBe("test-pyro");

    const actions = generateCandidateActions(team, res);
    const swaps = actions.filter((a) => a.actionType === "swap");

    // Can swap to test-hydro and test-electro, but NOT to test-pyro
    expect(swaps).toHaveLength(2);
    expect(swaps.map((s) => s.characterId)).toEqual(["test-hydro", "test-electro"]);
  });

  it("prunes consecutive swaps (no swap immediately after swap)", () => {
    const team = [testPyro, testHydro, testElectro];
    // Last action was a swap to testHydro
    const res = simulateRotation(
      team,
      [
        { characterId: "test-pyro", actionType: "normal" },
        { characterId: "test-hydro", actionType: "swap" },
      ],
      enemy,
    );

    const actions = generateCandidateActions(team, res, undefined, {
      characterId: "test-hydro",
      actionType: "swap",
    });

    const swaps = actions.filter((a) => a.actionType === "swap");
    // Consecutive swaps are pruned: Hydro MUST perform an action first
    expect(swaps).toHaveLength(0);
    // Hydro's own abilities must be present
    expect(actions.filter((a) => a.characterId === "test-hydro").length).toBeGreaterThan(0);
  });

  it("prunes all actions when time exceeds timeLimit", () => {
    const res = simulateRotation([testPyro], [], enemy);
    const actions = generateCandidateActions([testPyro], res, { timeLimit: 0 });
    expect(actions).toHaveLength(0);
  });

  it("works seamlessly with GenericCharacterDefinition (PlayableCharacter)", () => {
    const amber = filterCharacters({ element: "pyro" }).find(
      (c) => c.id === "amber",
    )!;
    expect(amber).toBeDefined();

    const res = simulateRotation([amber], [], enemy);
    const actions = generateCandidateActions([amber], res);

    expect(actions.length).toBeGreaterThan(0);
    const normal = actions.find((a) => a.actionType === "normal");
    expect(normal).toBeDefined();
    expect(normal?.characterId).toBe(amber.id);
  });

  it("buildCharacterStates accurately reflects snapshot energy and cooldowns", () => {
    const snap: SimulationSnapshot = {
      time: 5.0,
      activeCharacterId: "test-pyro",
      characters: {
        "test-pyro": {
          characterId: "test-pyro",
          energy: { current: 35, max: 40, totalGained: 35, totalSpent: 0 },
          cooldowns: { "test-pyro-e": 11.0 },
        } as CharacterSnapshot,
      },
    };

    const states = buildCharacterStates([testPyro], snap);
    const charState = states.get("test-pyro");

    expect(charState).toBeDefined();
    expect(charState?.energy.current).toBe(35);
    expect(charState?.cooldowns["test-pyro-e"]).toBe(11.0);
  });
});
