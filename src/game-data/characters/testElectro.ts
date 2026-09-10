import type { CharacterDefinition } from "@/types";

// ============================================================================
// Test character — an Electro battery with hand-tuned, illustrative numbers.
//
// Values are representative, NOT a faithful copy of any live-game character.
// Emits an ORB rather than particles (via `baseEnergyPerUnit`) so game-data can
// express both without an engine change.
// ============================================================================

export const testElectro: CharacterDefinition = {
  id: "test-electro",
  name: "Volt (Test Electro)",
  element: "electro",
  level: 90,
  maxEnergy: 40,
  baseStats: {
    atk: 1400,
    hp: 13000,
    def: 750,
    elementalMastery: 80,
    critRate: 0.4,
    critDmg: 1.0,
    energyRecharge: 1.6,
    dmgBonus: 0,
    elementalDmgBonus: { electro: 0.466 },
  },
  normalAttack: {
    id: "test-electro-na",
    name: "Normal Attack",
    actionType: "normal",
    element: "physical",
    damageType: "normal",
    multiplier: 0.75,
    scaling: "atk",
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  chargedAttack: {
    id: "test-electro-ca",
    name: "Charged Attack",
    actionType: "charged",
    element: "physical",
    damageType: "charged",
    multiplier: 1.4,
    scaling: "atk",
    castTime: 0.8,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  elementalSkill: {
    id: "test-electro-e",
    name: "Arc Charge",
    actionType: "skill",
    element: "electro",
    damageType: "skill",
    multiplier: 2.4,
    scaling: "atk",
    castTime: 1.0,
    cooldown: 6,
    energyCost: 0,
    energyGenerated: 0,
    // A single ORB (9 base energy on-element) instead of 3-energy particles.
    // Illustrative, not a measured in-game value.
    particles: { count: 1, element: "electro", baseEnergyPerUnit: 9 },
  },
  elementalBurst: {
    id: "test-electro-q",
    name: "Thunderfall",
    actionType: "burst",
    element: "electro",
    damageType: "burst",
    multiplier: 4.6,
    scaling: "atk",
    castTime: 1.4,
    cooldown: 15,
    energyCost: 40,
    energyGenerated: 0,
  },
};
