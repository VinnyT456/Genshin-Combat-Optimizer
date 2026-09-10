import type { CharacterDefinition } from "@/types";

// ============================================================================
// Test character — a Pyro DPS with hand-tuned, illustrative numbers.
//
// Values are representative, NOT a faithful copy of any live-game character.
// The point of Phase 1 is a correct, extensible engine; a small amount of
// realistic data is enough to exercise every path.
// ============================================================================

export const testPyro: CharacterDefinition = {
  id: "test-pyro",
  name: "Ember (Test Pyro)",
  element: "pyro",
  level: 90,
  maxEnergy: 60,
  baseStats: {
    atk: 1800,
    hp: 12000,
    def: 800,
    elementalMastery: 100,
    critRate: 0.6,
    critDmg: 1.4,
    energyRecharge: 1.2,
    dmgBonus: 0,
    elementalDmgBonus: { pyro: 0.466 },
  },
  normalAttack: {
    id: "test-pyro-na",
    name: "Normal Attack",
    actionType: "normal",
    element: "physical",
    damageType: "normal",
    multiplier: 0.85,
    scaling: "atk",
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  chargedAttack: {
    id: "test-pyro-ca",
    name: "Charged Attack",
    actionType: "charged",
    element: "physical",
    damageType: "charged",
    multiplier: 1.6,
    scaling: "atk",
    castTime: 0.8,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  elementalSkill: {
    id: "test-pyro-e",
    name: "Flame Strike",
    actionType: "skill",
    element: "pyro",
    damageType: "skill",
    multiplier: 3.2,
    scaling: "atk",
    castTime: 1.0,
    cooldown: 6,
    energyCost: 0,
    // Flat grant retained so the Phase 1 sample rotation still reaches its
    // burst; `particles` is the Phase 2 path and stacks on top of it.
    energyGenerated: 30,
    // Illustrative: 4 pyro particles. NOT a measured in-game particle count.
    particles: { count: 4, element: "pyro" },
  },
  elementalBurst: {
    id: "test-pyro-q",
    name: "Inferno Burst",
    actionType: "burst",
    element: "pyro",
    damageType: "burst",
    multiplier: 6.0,
    scaling: "atk",
    castTime: 1.5,
    cooldown: 15,
    // Kept intentionally low so the sample rotation reaches a legal burst after
    // a single skill cast. maxEnergy stays 60 to exercise the energy cap.
    energyCost: 30,
    energyGenerated: 0,
  },
};
