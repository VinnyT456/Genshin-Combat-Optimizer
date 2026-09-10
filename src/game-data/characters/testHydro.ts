import type { CharacterDefinition } from "@/types";

// ============================================================================
// Test character — a Hydro sub-DPS with hand-tuned, illustrative numbers.
//
// Values are representative, NOT a faithful copy of any live-game character.
// Exists to exercise 4-character team behaviour: off-element particle routing,
// off-field energy gain, and a distinct Energy Recharge value.
// ============================================================================

export const testHydro: CharacterDefinition = {
  id: "test-hydro",
  name: "Tide (Test Hydro)",
  element: "hydro",
  level: 90,
  maxEnergy: 60,
  baseStats: {
    atk: 1600,
    hp: 14000,
    def: 700,
    elementalMastery: 120,
    critRate: 0.5,
    critDmg: 1.2,
    // Deliberately high: makes the ER factor visible in energy tests.
    energyRecharge: 2.0,
    dmgBonus: 0,
    elementalDmgBonus: { hydro: 0.466 },
  },
  normalAttack: {
    id: "test-hydro-na",
    name: "Normal Attack",
    actionType: "normal",
    element: "physical",
    damageType: "normal",
    multiplier: 0.8,
    scaling: "atk",
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  chargedAttack: {
    id: "test-hydro-ca",
    name: "Charged Attack",
    actionType: "charged",
    element: "physical",
    damageType: "charged",
    multiplier: 1.5,
    scaling: "atk",
    castTime: 0.8,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  elementalSkill: {
    id: "test-hydro-e",
    name: "Tidal Surge",
    actionType: "skill",
    element: "hydro",
    damageType: "skill",
    multiplier: 2.8,
    scaling: "atk",
    castTime: 1.0,
    cooldown: 8,
    energyCost: 0,
    // Particle-only: no flat energy, so this ability exercises the Phase 2
    // path in isolation. Illustrative count, not measured game data.
    energyGenerated: 0,
    particles: { count: 3, element: "hydro" },
  },
  elementalBurst: {
    id: "test-hydro-q",
    name: "Deluge",
    actionType: "burst",
    element: "hydro",
    damageType: "burst",
    multiplier: 5.4,
    scaling: "atk",
    castTime: 1.5,
    cooldown: 18,
    energyCost: 60,
    energyGenerated: 0,
  },
};
