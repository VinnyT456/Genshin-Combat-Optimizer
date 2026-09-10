import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent, talentTable } from "@/simulation/character/talent";

// ============================================================================
// SYNTHETIC fixtures for framework tests.
//
// Every number here is invented for testing and is NOT game data. Names are
// deliberately non-character-like ("Synthetic Multihit Unit") so no reader
// mistakes these for a real kit and no test pins a fabricated multiplier as if
// it were sourced. Real character data is a separate, source-verified task.
// ============================================================================

/** Talent-level table with distinct per-level values, to prove level lookup. */
const SYNTHETIC_NA_TABLE = talentTable([0.1, 0.2, 0.3, 0.4, 0.5]);
const SYNTHETIC_SKILL_TABLE = talentTable([1.0, 1.1, 1.2]);
const SYNTHETIC_BURST_TABLE = talentTable([2.0, 2.5]);

/** Two-hit normal attack: proves multi-instance expansion in one ability. */
export const syntheticN1: KitAbility = {
  id: "synthetic-n1",
  name: "Synthetic N1",
  slot: "normal",
  castTime: 0.5,
  cooldown: flatTalent(0),
  energyCost: 0,
  instances: [
    {
      id: "n1-hit1",
      name: "Hit 1",
      damageType: "normal",
      element: "physical",
      scaling: [{ stat: "atk", table: SYNTHETIC_NA_TABLE }],
    },
    {
      id: "n1-hit2",
      name: "Hit 2",
      damageType: "normal",
      element: "physical",
      scaling: [{ stat: "atk", table: SYNTHETIC_NA_TABLE }],
      delay: 0.2,
    },
  ],
};

/** Hybrid ATK+HP scaling with an ICD group: proves both mechanisms. */
export const syntheticSkill: KitAbility = {
  id: "synthetic-skill",
  name: "Synthetic Skill",
  slot: "skill",
  castTime: 1,
  cooldown: talentTable([6, 5.5, 5]),
  energyCost: 0,
  particles: { count: 3, element: "hydro" },
  instances: [
    {
      id: "skill-hit",
      name: "Skill Hit",
      damageType: "skill",
      element: "hydro",
      scaling: [
        { stat: "atk", table: SYNTHETIC_SKILL_TABLE },
        { stat: "hp", table: flatTalent(0.05) },
      ],
      application: { element: "hydro", gauge: 1, icdGroup: "synthetic-skill" },
    },
  ],
  effects: [{ resourceId: "synthetic-stacks", kind: "gain", amount: 2 }],
};

export const syntheticBurst: KitAbility = {
  id: "synthetic-burst",
  name: "Synthetic Burst",
  slot: "burst",
  castTime: 1.5,
  cooldown: flatTalent(15),
  energyCost: 40,
  instances: [
    {
      id: "burst-hit",
      name: "Burst Hit",
      damageType: "burst",
      element: "hydro",
      scaling: [{ stat: "atk", table: SYNTHETIC_BURST_TABLE }],
      // No icdGroup => applies every hit.
      application: { element: "hydro", gauge: 2 },
    },
  ],
};

/** A synthetic character exercising every framework capability. */
export const syntheticUnit: GenericCharacterDefinition = {
  id: "synthetic-unit",
  name: "Synthetic Multihit Unit",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 2,
  talentLevels: { normal: 3, skill: 2, burst: 1 },
  baseStatCurves: {
    hp: { byLevel: { 90: 10000 } },
    atk: { byLevel: { 90: 800 } },
    def: { byLevel: { 90: 600 } },
  },
  ascensionBonus: { stat: "critDmg", valueByPhase: [0, 0, 0.096, 0.192] },
  baseStats: {
    atk: 800,
    hp: 10000,
    def: 600,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: { hits: [syntheticN1], loops: true },
  skill: syntheticSkill,
  burst: syntheticBurst,
  passives: [
    {
      id: "synthetic-a1",
      name: "Synthetic A1",
      unlockAscension: 1,
      effects: [{ resourceId: "synthetic-stacks", kind: "gain", amount: 1 }],
    },
    {
      id: "synthetic-a4",
      name: "Synthetic A4",
      unlockAscension: 4,
      effects: [],
    },
  ],
  constellations: [
    { level: 1, id: "synthetic-c1", name: "Synthetic C1", effects: [] },
    { level: 4, id: "synthetic-c4", name: "Synthetic C4", effects: [] },
  ],
  resources: [
    {
      id: "synthetic-stacks",
      name: "Synthetic Stacks",
      initial: 0,
      max: 4,
      durationSeconds: 10,
    },
  ],
};
