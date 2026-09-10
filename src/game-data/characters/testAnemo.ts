import type { CharacterDefinition } from "@/types";

// ============================================================================
// Test character — an Anemo support with hand-tuned, illustrative numbers.
//
// Values are representative, NOT a faithful copy of any live-game character.
// Emits COLOURLESS particles (modelled as `element: "physical"`) so the
// colourless multiplier path is exercised by a real team.
// ============================================================================

export const testAnemo: CharacterDefinition = {
  id: "test-anemo",
  name: "Gale (Test Anemo)",
  element: "anemo",
  level: 90,
  maxEnergy: 60,
  baseStats: {
    atk: 1200,
    hp: 15000,
    def: 900,
    elementalMastery: 200,
    critRate: 0.3,
    critDmg: 0.8,
    // Deliberately low: the below-100% ER branch must reduce energy gained.
    energyRecharge: 0.5,
    dmgBonus: 0,
    elementalDmgBonus: { anemo: 0.466 },
  },
  normalAttack: {
    id: "test-anemo-na",
    name: "Normal Attack",
    actionType: "normal",
    element: "physical",
    damageType: "normal",
    multiplier: 0.7,
    scaling: "atk",
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  chargedAttack: {
    id: "test-anemo-ca",
    name: "Charged Attack",
    actionType: "charged",
    element: "physical",
    damageType: "charged",
    multiplier: 1.3,
    scaling: "atk",
    castTime: 0.8,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  elementalSkill: {
    id: "test-anemo-e",
    name: "Wind Cutter",
    actionType: "skill",
    element: "anemo",
    damageType: "skill",
    multiplier: 2.2,
    scaling: "atk",
    castTime: 1.0,
    cooldown: 7,
    energyCost: 0,
    energyGenerated: 0,
    // Colourless particles: worth the colourless multiplier to EVERY receiver
    // regardless of element. Illustrative count, not measured game data.
    particles: { count: 3, element: "physical" },
  },
  elementalBurst: {
    id: "test-anemo-q",
    name: "Tempest",
    actionType: "burst",
    element: "anemo",
    damageType: "burst",
    multiplier: 4.0,
    scaling: "atk",
    castTime: 1.6,
    cooldown: 20,
    energyCost: 60,
    energyGenerated: 0,
  },
};
