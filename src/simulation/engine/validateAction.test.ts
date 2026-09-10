import { describe, expect, it } from "vitest";
import { validateAction } from "@/simulation/engine/validateAction";
import { createEnergyState } from "@/simulation/energy";
import type {
  CharacterDefinition,
  CharacterState,
  Stats,
} from "@/types";

const baseStats: Stats = {
  atk: 1000,
  hp: 0,
  def: 0,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

function makeChar(): CharacterDefinition {
  const ability = (
    id: string,
    actionType: CharacterDefinition["normalAttack"]["actionType"],
    cooldown: number,
    energyCost: number,
  ) => ({
    id,
    name: id.toUpperCase(),
    actionType,
    element: "pyro" as const,
    damageType: "skill" as const,
    multiplier: 1,
    scaling: "atk" as const,
    castTime: 1,
    cooldown,
    energyCost,
    energyGenerated: 0,
  });
  return {
    id: "c",
    name: "C",
    element: "pyro",
    level: 90,
    maxEnergy: 40,
    baseStats,
    normalAttack: ability("na", "normal", 0, 0),
    chargedAttack: ability("ca", "charged", 0, 0),
    elementalSkill: ability("e", "skill", 6, 0),
    elementalBurst: ability("q", "burst", 15, 40),
  };
}

function makeState(def: CharacterDefinition): CharacterState {
  const energy = createEnergyState(def);
  return { definition: def, currentEnergy: energy.current, energy, cooldowns: {} };
}

function statesFor(state: CharacterState): Map<string, CharacterState> {
  return new Map([[state.definition.id, state]]);
}

describe("validateAction", () => {
  it("accepts a ready action", () => {
    const states = statesFor(makeState(makeChar()));
    const v = validateAction({
      action: { characterId: "c", actionType: "normal", abilityId: "na" },
      states,
      time: 0,
      config: {},
    });
    expect(v.valid).toBe(true);
  });

  it("reports unknown-character", () => {
    const states = statesFor(makeState(makeChar()));
    const v = validateAction({
      action: { characterId: "ghost", actionType: "normal" },
      states,
      time: 0,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "unknown-character" });
  });

  it("reports on-cooldown with availableAt", () => {
    const state = makeState(makeChar());
    state.cooldowns["e"] = 6;
    const v = validateAction({
      action: { characterId: "c", actionType: "skill", abilityId: "e" },
      states: statesFor(state),
      time: 1,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "on-cooldown", availableAt: 6 });
  });

  it("treats the cooldown boundary as ready", () => {
    const state = makeState(makeChar());
    state.cooldowns["e"] = 6;
    const v = validateAction({
      action: { characterId: "c", actionType: "skill", abilityId: "e" },
      states: statesFor(state),
      time: 6,
      config: {},
    });
    expect(v.valid).toBe(true);
  });

  it("reports insufficient-energy for a burst", () => {
    const v = validateAction({
      action: { characterId: "c", actionType: "burst", abilityId: "q" },
      states: statesFor(makeState(makeChar())),
      time: 0,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "insufficient-energy" });
  });

  it("reports redundant-swap when already on-field", () => {
    const states = statesFor(makeState(makeChar()));
    const v = validateAction({
      action: { characterId: "c", actionType: "swap" },
      states,
      time: 0,
      activeCharacterId: "c",
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "redundant-swap" });
  });

  it("reports past-time-limit at or beyond the bound", () => {
    const states = statesFor(makeState(makeChar()));
    const v = validateAction({
      action: { characterId: "c", actionType: "normal", abilityId: "na" },
      states,
      time: 20,
      config: { timeLimit: 20 },
    });
    expect(v).toMatchObject({ valid: false, code: "past-time-limit" });
  });
});
