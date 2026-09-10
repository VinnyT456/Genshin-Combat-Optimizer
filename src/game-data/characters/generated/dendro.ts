// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-characters/fetch.py
//     python3 scripts/generate-characters/emit.py
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    https://gi.yatta.moe/api/v2/en/avatar/{id}
//   Verifier source  Lunaris 7.0.54
//                    https://api.lunaris.moe/data/{version}/en/char/{id}.json
//   Fetched at       2026-09-04T01:08:25Z
//
// Every multiplier below is a PER-TALENT-LEVEL table (levels 1..15) taken from
// the primary source and cross-checked value-by-value against the verifier.
// Values the two sources disagreed on are NOT emitted; rows the verifier does
// not publish are flagged in the UNVERIFIED block of the character concerned.
//
// Scaling stats (ATK / Max HP / DEF / Elemental Mastery) are read from the
// source's own parameter descriptions, so an HP-scaling skill is authored as
// HP-scaling rather than being folded into ATK.
// ============================================================================

import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { flatTalent, talentTable } from "@/simulation/character/talent";

type GeneratedCharacter = GenericCharacterDefinition;


export const alhaitham: GeneratedCharacter = {
  id: "alhaitham",
  name: "Alhaitham",
  element: "dendro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1125, 3: 1212, 4: 1299, 5: 1385, 6: 1472, 7: 1559, 8: 1646, 9: 1733, 10: 1819, 11: 1907, 12: 1994, 13: 2081, 14: 2170, 15: 2257, 16: 2344, 17: 2433, 18: 2520, 19: 2608, 20: 2695, 21: 3675, 22: 3763, 23: 3851, 24: 3940, 25: 4028, 26: 4117, 27: 4206, 28: 4294, 29: 4383, 30: 4472, 31: 4561, 32: 4650, 33: 4740, 34: 4828, 35: 4918, 36: 5008, 37: 5097, 38: 5187, 39: 5276, 40: 5366, 41: 6089, 42: 6179, 43: 6270, 44: 6359, 45: 6449, 46: 6540, 47: 6630, 48: 6721, 49: 6812, 50: 6902, 51: 7837, 52: 7928, 53: 8019, 54: 8110, 55: 8202, 56: 8293, 57: 8385, 58: 8476, 59: 8567, 60: 8659, 61: 9383, 62: 9475, 63: 9567, 64: 9659, 65: 9751, 66: 9844, 67: 9935, 68: 10028, 69: 10120, 70: 10213, 71: 10938, 72: 11032, 73: 11124, 74: 11217, 75: 11310, 76: 11403, 77: 11496, 78: 11590, 79: 11683, 80: 11777, 81: 12503, 82: 12597, 83: 12690, 84: 12784, 85: 12877, 86: 12972, 87: 13065, 88: 13160, 89: 13255, 90: 13348 } },
    atk: { byLevel: { 1: 24, 2: 26, 3: 28, 4: 30, 5: 33, 6: 35, 7: 37, 8: 39, 9: 41, 10: 43, 11: 45, 12: 47, 13: 49, 14: 51, 15: 53, 16: 55, 17: 57, 18: 59, 19: 61, 20: 63, 21: 86, 22: 88, 23: 90, 24: 92, 25: 95, 26: 97, 27: 99, 28: 101, 29: 103, 30: 105, 31: 107, 32: 109, 33: 111, 34: 113, 35: 115, 36: 118, 37: 120, 38: 122, 39: 124, 40: 126, 41: 143, 42: 145, 43: 147, 44: 149, 45: 151, 46: 154, 47: 156, 48: 158, 49: 160, 50: 162, 51: 184, 52: 186, 53: 188, 54: 190, 55: 193, 56: 195, 57: 197, 58: 199, 59: 201, 60: 203, 61: 220, 62: 222, 63: 225, 64: 227, 65: 229, 66: 231, 67: 233, 68: 235, 69: 238, 70: 240, 71: 257, 72: 259, 73: 261, 74: 263, 75: 265, 76: 268, 77: 270, 78: 272, 79: 274, 80: 276, 81: 293, 82: 296, 83: 298, 84: 300, 85: 302, 86: 304, 87: 307, 88: 309, 89: 311, 90: 313 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 91, 8: 96, 9: 101, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 132, 16: 137, 17: 142, 18: 148, 19: 153, 20: 158, 21: 215, 22: 220, 23: 226, 24: 231, 25: 236, 26: 241, 27: 246, 28: 251, 29: 257, 30: 262, 31: 267, 32: 272, 33: 278, 34: 283, 35: 288, 36: 293, 37: 298, 38: 304, 39: 309, 40: 314, 41: 357, 42: 362, 43: 367, 44: 372, 45: 378, 46: 383, 47: 388, 48: 394, 49: 399, 50: 404, 51: 459, 52: 464, 53: 470, 54: 475, 55: 480, 56: 486, 57: 491, 58: 496, 59: 502, 60: 507, 61: 549, 62: 555, 63: 560, 64: 566, 65: 571, 66: 576, 67: 582, 68: 587, 69: 593, 70: 598, 71: 641, 72: 646, 73: 651, 74: 657, 75: 662, 76: 668, 77: 673, 78: 679, 79: 684, 80: 690, 81: 732, 82: 738, 83: 743, 84: 749, 85: 754, 86: 760, 87: 765, 88: 771, 89: 776, 90: 782 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "dendro",
  },
  baseStats: {
    atk: 313,
    hp: 13348,
    def: 782,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { dendro: 0.28800000000000003 },
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "alhaitham-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alhaitham-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.495257, 0.535568, 0.57588, 0.633468, 0.67378, 0.71985, 0.783197, 0.846544, 0.90989, 0.978996, 1.048102, 1.117207, 1.186313, 1.255418, 1.324524]) },
            ],
          },
        ],
      },
      {
        id: "alhaitham-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alhaitham-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.507495, 0.548802, 0.59011, 0.649121, 0.690429, 0.737638, 0.80255, 0.867462, 0.932374, 1.003187, 1.074, 1.144813, 1.215627, 1.28644, 1.357253]) },
            ],
          },
        ],
      },
      {
        id: "alhaitham-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alhaitham-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.341785, 0.369605, 0.397425, 0.437167, 0.464987, 0.496781, 0.540498, 0.584215, 0.627931, 0.675622, 0.723313, 0.771004, 0.818696, 0.866387, 0.914077]) },
              { stat: "atk", table: talentTable([0.341785, 0.369605, 0.397425, 0.437167, 0.464987, 0.496781, 0.540498, 0.584215, 0.627931, 0.675622, 0.723313, 0.771004, 0.818696, 0.866387, 0.914077]) },
            ],
          },
        ],
      },
      {
        id: "alhaitham-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alhaitham-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.667678, 0.722024, 0.77637, 0.854007, 0.908353, 0.970463, 1.055863, 1.141264, 1.226665, 1.319829, 1.412993, 1.506158, 1.599322, 1.692487, 1.785651]) },
            ],
          },
        ],
      },
      {
        id: "alhaitham-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alhaitham-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.838509, 0.906759, 0.97501, 1.072511, 1.140762, 1.218762, 1.326014, 1.433265, 1.540516, 1.657517, 1.774518, 1.891519, 2.008521, 2.125522, 2.242523]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "alhaitham-charged",
      name: "Abductive Reasoning",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alhaitham-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.55255, 0.597525, 0.6425, 0.70675, 0.751725, 0.803125, 0.8738, 0.944475, 1.01515, 1.09225, 1.16935, 1.24645, 1.32355, 1.40065, 1.47775]) },
            { stat: "atk", table: talentTable([0.55255, 0.597525, 0.6425, 0.70675, 0.751725, 0.803125, 0.8738, 0.944475, 1.01515, 1.09225, 1.16935, 1.24645, 1.32355, 1.40065, 1.47775]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "alhaitham-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alhaitham-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "alhaitham-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alhaitham-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "alhaitham-skill",
      name: "Universality: An Elaboration on Form",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 1, element: "dendro" },
      instances: [
        {
          id: "alhaitham-skill-1",
          name: "Rush Attack DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.936, 2.0812, 2.2264, 2.42, 2.5652, 2.7104, 2.904, 3.0976, 3.2912, 3.4848, 3.6784, 3.872, 4.114, 4.356, 4.598]) },
            { stat: "elementalMastery", table: talentTable([1.5488, 1.66496, 1.78112, 1.936, 2.05216, 2.16832, 2.3232, 2.47808, 2.63296, 2.78784, 2.94272, 3.0976, 3.2912, 3.4848, 3.6784]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-2",
          name: "1-Mirror Projection Attack DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-3-1",
          name: "2-Mirror Projection Attack DMG (1/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-3-2",
          name: "2-Mirror Projection Attack DMG (2/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-4-1",
          name: "3-Mirror Projection Attack DMG (1/3)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-4-2",
          name: "3-Mirror Projection Attack DMG (2/3)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "alhaitham-skill-4-3",
          name: "3-Mirror Projection Attack DMG (3/3)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
            { stat: "elementalMastery", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "alhaitham-burst",
      name: "Particular Field: Fetters of Phenomena",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "alhaitham-burst-1",
          name: "Single-Instance DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.216, 1.3072, 1.3984, 1.52, 1.6112, 1.7024, 1.824, 1.9456, 2.0672, 2.1888, 2.3104, 2.432, 2.584, 2.736, 2.888]) },
            { stat: "elementalMastery", table: talentTable([0.9728, 1.04576, 1.11872, 1.216, 1.28896, 1.36192, 1.4592, 1.55648, 1.65376, 1.75104, 1.84832, 1.9456, 2.0672, 2.1888, 2.3104]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "alhaitham-a1", name: "Four-Causal Correction", unlockAscension: 1, effects: [] },
    { id: "alhaitham-a4", name: "Mysteries Laid Bare", unlockAscension: 4, effects: [] },
    { id: "alhaitham-p3", name: "Law of Reductive Overdetermination", effects: [] },
  ],
  constellations: [
    { level: 1, id: "alhaitham-c1", name: "Intuition", effects: [] },
    { level: 2, id: "alhaitham-c2", name: "Debate", effects: [] },
    { level: 3, id: "alhaitham-c3", name: "Negation", effects: [], buffs: [{ id: "alhaitham-c3", source: "Negation", sourceCharacterId: "alhaitham", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "alhaitham-c4", name: "Elucidation", effects: [] },
    { level: 5, id: "alhaitham-c5", name: "Sagacity", effects: [], buffs: [{ id: "alhaitham-c5", source: "Sagacity", sourceCharacterId: "alhaitham", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "alhaitham-c6", name: "Structuration", effects: [] },
  ],
  resources: [],
};

export const baizhu: GeneratedCharacter = {
  id: "baizhu",
  name: "Baizhu",
  element: "dendro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1125, 3: 1212, 4: 1299, 5: 1385, 6: 1472, 7: 1559, 8: 1646, 9: 1733, 10: 1819, 11: 1907, 12: 1994, 13: 2081, 14: 2170, 15: 2257, 16: 2344, 17: 2433, 18: 2520, 19: 2608, 20: 2695, 21: 3675, 22: 3763, 23: 3851, 24: 3940, 25: 4028, 26: 4117, 27: 4206, 28: 4294, 29: 4383, 30: 4472, 31: 4561, 32: 4650, 33: 4740, 34: 4828, 35: 4918, 36: 5008, 37: 5097, 38: 5187, 39: 5276, 40: 5366, 41: 6089, 42: 6179, 43: 6270, 44: 6359, 45: 6449, 46: 6540, 47: 6630, 48: 6721, 49: 6812, 50: 6902, 51: 7837, 52: 7928, 53: 8019, 54: 8110, 55: 8202, 56: 8293, 57: 8385, 58: 8476, 59: 8567, 60: 8659, 61: 9383, 62: 9475, 63: 9567, 64: 9659, 65: 9751, 66: 9844, 67: 9935, 68: 10028, 69: 10120, 70: 10213, 71: 10938, 72: 11032, 73: 11124, 74: 11217, 75: 11310, 76: 11403, 77: 11496, 78: 11590, 79: 11683, 80: 11777, 81: 12503, 82: 12597, 83: 12690, 84: 12784, 85: 12877, 86: 12972, 87: 13065, 88: 13160, 89: 13255, 90: 13348 } },
    atk: { byLevel: { 1: 15, 2: 16, 3: 17, 4: 19, 5: 20, 6: 21, 7: 22, 8: 24, 9: 25, 10: 26, 11: 28, 12: 29, 13: 30, 14: 31, 15: 33, 16: 34, 17: 35, 18: 36, 19: 38, 20: 39, 21: 53, 22: 54, 23: 56, 24: 57, 25: 58, 26: 59, 27: 61, 28: 62, 29: 63, 30: 65, 31: 66, 32: 67, 33: 68, 34: 70, 35: 71, 36: 72, 37: 74, 38: 75, 39: 76, 40: 77, 41: 88, 42: 89, 43: 90, 44: 92, 45: 93, 46: 94, 47: 96, 48: 97, 49: 98, 50: 100, 51: 113, 52: 114, 53: 116, 54: 117, 55: 118, 56: 120, 57: 121, 58: 122, 59: 124, 60: 125, 61: 135, 62: 137, 63: 138, 64: 139, 65: 141, 66: 142, 67: 143, 68: 145, 69: 146, 70: 147, 71: 158, 72: 159, 73: 160, 74: 162, 75: 163, 76: 164, 77: 166, 78: 167, 79: 169, 80: 170, 81: 180, 82: 182, 83: 183, 84: 184, 85: 186, 86: 187, 87: 188, 88: 190, 89: 191, 90: 193 } },
    def: { byLevel: { 1: 39, 2: 42, 3: 45, 4: 49, 5: 52, 6: 55, 7: 58, 8: 62, 9: 65, 10: 68, 11: 71, 12: 75, 13: 78, 14: 81, 15: 84, 16: 88, 17: 91, 18: 94, 19: 98, 20: 101, 21: 138, 22: 141, 23: 144, 24: 147, 25: 151, 26: 154, 27: 157, 28: 161, 29: 164, 30: 167, 31: 171, 32: 174, 33: 177, 34: 181, 35: 184, 36: 187, 37: 191, 38: 194, 39: 197, 40: 201, 41: 228, 42: 231, 43: 235, 44: 238, 45: 241, 46: 245, 47: 248, 48: 252, 49: 255, 50: 258, 51: 293, 52: 297, 53: 300, 54: 304, 55: 307, 56: 310, 57: 314, 58: 317, 59: 321, 60: 324, 61: 351, 62: 355, 63: 358, 64: 361, 65: 365, 66: 368, 67: 372, 68: 375, 69: 379, 70: 382, 71: 409, 72: 413, 73: 416, 74: 420, 75: 423, 76: 427, 77: 430, 78: 434, 79: 437, 80: 441, 81: 468, 82: 471, 83: 475, 84: 478, 85: 482, 86: 485, 87: 489, 88: 493, 89: 496, 90: 500 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 193,
    hp: 13348,
    def: 500,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "baizhu-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "baizhu-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.373704, 0.401732, 0.42976, 0.46713, 0.495158, 0.523186, 0.560556, 0.597926, 0.635297, 0.672667, 0.710038, 0.747408, 0.794121, 0.840834, 0.887547]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "baizhu-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "baizhu-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.364248, 0.391567, 0.418885, 0.45531, 0.482629, 0.509947, 0.546372, 0.582797, 0.619222, 0.655646, 0.692071, 0.728496, 0.774027, 0.819558, 0.865089]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "baizhu-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "baizhu-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.225416, 0.242322, 0.259228, 0.28177, 0.298676, 0.315582, 0.338124, 0.360666, 0.383207, 0.405749, 0.42829, 0.450832, 0.479009, 0.507186, 0.535363]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
          {
            id: "baizhu-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.225416, 0.242322, 0.259228, 0.28177, 0.298676, 0.315582, 0.338124, 0.360666, 0.383207, 0.405749, 0.42829, 0.450832, 0.479009, 0.507186, 0.535363]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "baizhu-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "baizhu-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.541376, 0.581979, 0.622582, 0.67672, 0.717323, 0.757926, 0.812064, 0.866202, 0.920339, 0.974477, 1.028614, 1.082752, 1.150424, 1.218096, 1.285768]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "baizhu-charged",
      name: "The Classics of Acupuncture",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "baizhu-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.2104, 1.30118, 1.39196, 1.513, 1.60378, 1.69456, 1.8156, 1.93664, 2.05768, 2.17872, 2.29976, 2.4208, 2.5721, 2.7234, 2.8747]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "baizhu-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "baizhu-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "baizhu-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "baizhu-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "baizhu-skill",
      name: "Universal Diagnosis",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 4, element: "dendro" },
      instances: [
        {
          id: "baizhu-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.792, 0.8514, 0.9108, 0.99, 1.0494, 1.1088, 1.188, 1.2672, 1.3464, 1.4256, 1.5048, 1.584, 1.683, 1.782, 1.881]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "baizhu-burst",
      name: "Holistic Revivification",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "baizhu-burst-1",
          name: "Spiritvein DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.97064, 1.043438, 1.116236, 1.2133, 1.286098, 1.358896, 1.45596, 1.553024, 1.650088, 1.747152, 1.844216, 1.94128, 2.06261, 2.18394, 2.30527]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "baizhu-a1", name: "Five Fortunes Forever", unlockAscension: 1, effects: [] },
    { id: "baizhu-a4", name: "All Things Are of the Earth", unlockAscension: 4, effects: [] },
    { id: "baizhu-p3", name: "Herbal Nourishment", effects: [] },
  ],
  constellations: [
    { level: 1, id: "baizhu-c1", name: "Attentive Observation", effects: [] },
    { level: 2, id: "baizhu-c2", name: "Incisive Discernment", effects: [] },
    { level: 3, id: "baizhu-c3", name: "All Aspects Stabilized", effects: [], buffs: [{ id: "baizhu-c3", source: "All Aspects Stabilized", sourceCharacterId: "baizhu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "baizhu-c4", name: "Ancient Art of Perception", effects: [] },
    { level: 5, id: "baizhu-c5", name: "The Hidden Ebb and Flow", effects: [], buffs: [{ id: "baizhu-c5", source: "The Hidden Ebb and Flow", sourceCharacterId: "baizhu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "baizhu-c6", name: "Elimination of Malicious Qi", effects: [] },
  ],
  resources: [],
};

export const collei: GeneratedCharacter = {
  id: "collei",
  name: "Collei",
  element: "dendro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 821, 2: 889, 3: 956, 4: 1024, 5: 1091, 6: 1160, 7: 1227, 8: 1295, 9: 1363, 10: 1430, 11: 1498, 12: 1566, 13: 1634, 14: 1701, 15: 1769, 16: 1837, 17: 1905, 18: 1973, 19: 2040, 20: 2108, 21: 2788, 22: 2857, 23: 2925, 24: 2992, 25: 3060, 26: 3127, 27: 3196, 28: 3263, 29: 3331, 30: 3398, 31: 3466, 32: 3534, 33: 3602, 34: 3670, 35: 3737, 36: 3805, 37: 3873, 38: 3941, 39: 4009, 40: 4076, 41: 4580, 42: 4647, 43: 4715, 44: 4782, 45: 4851, 46: 4919, 47: 4986, 48: 5054, 49: 5121, 50: 5189, 51: 5837, 52: 5906, 53: 5974, 54: 6041, 55: 6109, 56: 6176, 57: 6245, 58: 6312, 59: 6380, 60: 6448, 61: 6951, 62: 7019, 63: 7086, 64: 7154, 65: 7222, 66: 7290, 67: 7358, 68: 7425, 69: 7493, 70: 7561, 71: 8064, 72: 8132, 73: 8200, 74: 8268, 75: 8335, 76: 8403, 77: 8471, 78: 8539, 79: 8606, 80: 8674, 81: 9178, 82: 9245, 83: 9313, 84: 9380, 85: 9449, 86: 9516, 87: 9584, 88: 9651, 89: 9719, 90: 9787 } },
    atk: { byLevel: { 1: 17, 2: 18, 3: 20, 4: 21, 5: 22, 6: 24, 7: 25, 8: 26, 9: 28, 10: 29, 11: 31, 12: 32, 13: 33, 14: 35, 15: 36, 16: 37, 17: 39, 18: 40, 19: 42, 20: 43, 21: 57, 22: 58, 23: 60, 24: 61, 25: 62, 26: 64, 27: 65, 28: 67, 29: 68, 30: 69, 31: 71, 32: 72, 33: 73, 34: 75, 35: 76, 36: 78, 37: 79, 38: 80, 39: 82, 40: 83, 41: 93, 42: 95, 43: 96, 44: 98, 45: 99, 46: 100, 47: 102, 48: 103, 49: 104, 50: 106, 51: 119, 52: 120, 53: 122, 54: 123, 55: 125, 56: 126, 57: 127, 58: 129, 59: 130, 60: 132, 61: 142, 62: 143, 63: 145, 64: 146, 65: 147, 66: 149, 67: 150, 68: 151, 69: 153, 70: 154, 71: 165, 72: 166, 73: 167, 74: 169, 75: 170, 76: 171, 77: 173, 78: 174, 79: 176, 80: 177, 81: 187, 82: 189, 83: 190, 84: 191, 85: 193, 86: 194, 87: 196, 88: 197, 89: 198, 90: 200 } },
    def: { byLevel: { 1: 50, 2: 55, 3: 59, 4: 63, 5: 67, 6: 71, 7: 75, 8: 79, 9: 84, 10: 88, 11: 92, 12: 96, 13: 100, 14: 104, 15: 109, 16: 113, 17: 117, 18: 121, 19: 125, 20: 129, 21: 171, 22: 175, 23: 179, 24: 184, 25: 188, 26: 192, 27: 196, 28: 200, 29: 204, 30: 209, 31: 213, 32: 217, 33: 221, 34: 225, 35: 229, 36: 234, 37: 238, 38: 242, 39: 246, 40: 250, 41: 281, 42: 285, 43: 289, 44: 293, 45: 298, 46: 302, 47: 306, 48: 310, 49: 314, 50: 318, 51: 358, 52: 362, 53: 367, 54: 371, 55: 375, 56: 379, 57: 383, 58: 387, 59: 392, 60: 396, 61: 427, 62: 431, 63: 435, 64: 439, 65: 443, 66: 447, 67: 452, 68: 456, 69: 460, 70: 464, 71: 495, 72: 499, 73: 503, 74: 507, 75: 511, 76: 516, 77: 520, 78: 524, 79: 528, 80: 532, 81: 563, 82: 567, 83: 572, 84: 576, 85: 580, 86: 584, 87: 588, 88: 592, 89: 596, 90: 601 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 200,
    hp: 9787,
    def: 601,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "collei-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "collei-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.43602, 0.47151, 0.507, 0.5577, 0.59319, 0.63375, 0.68952, 0.74529, 0.80106, 0.8619, 0.92274, 0.98358, 1.04442, 1.10526, 1.1661]) },
            ],
          },
        ],
      },
      {
        id: "collei-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "collei-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.42656, 0.46128, 0.496, 0.5456, 0.58032, 0.62, 0.67456, 0.72912, 0.78368, 0.8432, 0.90272, 0.96224, 1.02176, 1.08128, 1.1408]) },
            ],
          },
        ],
      },
      {
        id: "collei-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "collei-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.54094, 0.58497, 0.629, 0.6919, 0.73593, 0.78625, 0.85544, 0.92463, 0.99382, 1.0693, 1.14478, 1.22026, 1.29574, 1.37122, 1.4467]) },
            ],
          },
        ],
      },
      {
        id: "collei-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "collei-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.68026, 0.73563, 0.791, 0.8701, 0.92547, 0.98875, 1.07576, 1.16277, 1.24978, 1.3447, 1.43962, 1.53454, 1.62946, 1.72438, 1.8193]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "collei-charged",
      name: "Supplicant's Bowmanship",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "collei-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "collei-charged-2",
          name: "Fully-Charged Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.24, 1.333, 1.426, 1.55, 1.643, 1.736, 1.86, 1.984, 2.108, 2.232, 2.356, 2.48, 2.635, 2.79, 2.945]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "collei-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "collei-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "collei-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "collei-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "collei-skill",
      name: "Floral Brush",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 3, element: "dendro" },
      instances: [
        {
          id: "collei-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.512, 1.6254, 1.7388, 1.89, 2.0034, 2.1168, 2.268, 2.4192, 2.5704, 2.7216, 2.8728, 3.024, 3.213, 3.402, 3.591]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "collei-burst",
      name: "Trump-Card Kitty",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "collei-burst-1",
          name: "Explosion DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.01824, 2.169608, 2.320976, 2.5228, 2.674168, 2.825536, 3.02736, 3.229184, 3.431008, 3.632832, 3.834656, 4.03648, 4.28876, 4.54104, 4.79332]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "collei-burst-2",
          name: "Leap DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.43248, 0.464916, 0.497352, 0.5406, 0.573036, 0.605472, 0.64872, 0.691968, 0.735216, 0.778464, 0.821712, 0.86496, 0.91902, 0.97308, 1.02714]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "collei-a1", name: "Floral Sidewinder", unlockAscension: 1, effects: [] },
    { id: "collei-a4", name: "The Languid Wood", unlockAscension: 4, effects: [] },
    { id: "collei-p3", name: "Gliding Champion of Sumeru", effects: [] },
  ],
  constellations: [
    { level: 1, id: "collei-c1", name: "Deepwood Patrol", effects: [] },
    { level: 2, id: "collei-c2", name: "Through Hill and Copse", effects: [] },
    { level: 3, id: "collei-c3", name: "Scent of Summer", effects: [], buffs: [{ id: "collei-c3", source: "Scent of Summer", sourceCharacterId: "collei", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "collei-c4", name: "Gift of the Woods", effects: [] },
    { level: 5, id: "collei-c5", name: "All Embers", effects: [], buffs: [{ id: "collei-c5", source: "All Embers", sourceCharacterId: "collei", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "collei-c6", name: "Forest of Falling Arrows", effects: [] },
  ],
  resources: [],
};

export const emilie: GeneratedCharacter = {
  id: "emilie",
  name: "Emilie",
  element: "dendro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1056, 2: 1144, 3: 1232, 4: 1320, 5: 1408, 6: 1497, 7: 1584, 8: 1673, 9: 1762, 10: 1850, 11: 1938, 12: 2027, 13: 2116, 14: 2206, 15: 2294, 16: 2383, 17: 2473, 18: 2561, 19: 2651, 20: 2740, 21: 3735, 22: 3825, 23: 3915, 24: 4005, 25: 4095, 26: 4185, 27: 4275, 28: 4365, 29: 4456, 30: 4546, 31: 4636, 32: 4727, 33: 4818, 34: 4908, 35: 4999, 36: 5091, 37: 5181, 38: 5272, 39: 5363, 40: 5455, 41: 6189, 42: 6281, 43: 6373, 44: 6464, 45: 6556, 46: 6648, 47: 6740, 48: 6832, 49: 6925, 50: 7016, 51: 7966, 52: 8059, 53: 8151, 54: 8244, 55: 8337, 56: 8430, 57: 8523, 58: 8616, 59: 8709, 60: 8802, 61: 9538, 62: 9631, 63: 9725, 64: 9818, 65: 9912, 66: 10006, 67: 10099, 68: 10193, 69: 10287, 70: 10381, 71: 11119, 72: 11214, 73: 11308, 74: 11402, 75: 11497, 76: 11591, 77: 11686, 78: 11781, 79: 11876, 80: 11971, 81: 12710, 82: 12805, 83: 12900, 84: 12995, 85: 13090, 86: 13186, 87: 13281, 88: 13377, 89: 13473, 90: 13568 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 33, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 46, 11: 48, 12: 50, 13: 52, 14: 54, 15: 57, 16: 59, 17: 61, 18: 63, 19: 65, 20: 68, 21: 92, 22: 94, 23: 97, 24: 99, 25: 101, 26: 103, 27: 106, 28: 108, 29: 110, 30: 112, 31: 114, 32: 117, 33: 119, 34: 121, 35: 123, 36: 126, 37: 128, 38: 130, 39: 132, 40: 135, 41: 153, 42: 155, 43: 157, 44: 160, 45: 162, 46: 164, 47: 166, 48: 169, 49: 171, 50: 173, 51: 197, 52: 199, 53: 201, 54: 203, 55: 206, 56: 208, 57: 210, 58: 213, 59: 215, 60: 217, 61: 235, 62: 238, 63: 240, 64: 242, 65: 245, 66: 247, 67: 249, 68: 252, 69: 254, 70: 256, 71: 274, 72: 277, 73: 279, 74: 281, 75: 284, 76: 286, 77: 288, 78: 291, 79: 293, 80: 295, 81: 314, 82: 316, 83: 318, 84: 321, 85: 323, 86: 325, 87: 328, 88: 330, 89: 333, 90: 335 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 66, 4: 71, 5: 76, 6: 81, 7: 85, 8: 90, 9: 95, 10: 100, 11: 104, 12: 109, 13: 114, 14: 119, 15: 123, 16: 128, 17: 133, 18: 138, 19: 143, 20: 147, 21: 201, 22: 206, 23: 211, 24: 215, 25: 220, 26: 225, 27: 230, 28: 235, 29: 240, 30: 245, 31: 249, 32: 254, 33: 259, 34: 264, 35: 269, 36: 274, 37: 279, 38: 284, 39: 289, 40: 294, 41: 333, 42: 338, 43: 343, 44: 348, 45: 353, 46: 358, 47: 363, 48: 368, 49: 373, 50: 378, 51: 429, 52: 434, 53: 439, 54: 444, 55: 449, 56: 454, 57: 459, 58: 464, 59: 469, 60: 474, 61: 513, 62: 518, 63: 523, 64: 528, 65: 533, 66: 538, 67: 543, 68: 549, 69: 554, 70: 559, 71: 598, 72: 603, 73: 608, 74: 614, 75: 619, 76: 624, 77: 629, 78: 634, 79: 639, 80: 644, 81: 684, 82: 689, 83: 694, 84: 699, 85: 704, 86: 710, 87: 715, 88: 720, 89: 725, 90: 730 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 335,
    hp: 13568,
    def: 730,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 50,
  normalAttacks: {
    hits: [
      {
        id: "emilie-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "emilie-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.485608, 0.525134, 0.56466, 0.621126, 0.660652, 0.705825, 0.767938, 0.83005, 0.892163, 0.959922, 1.027681, 1.09544, 1.1632, 1.230959, 1.298718]) },
            ],
          },
        ],
      },
      {
        id: "emilie-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "emilie-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.448954, 0.485497, 0.52204, 0.574244, 0.610787, 0.65255, 0.709974, 0.767399, 0.824823, 0.887468, 0.950113, 1.012758, 1.075402, 1.138047, 1.200692]) },
            ],
          },
        ],
      },
      {
        id: "emilie-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "emilie-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.593004, 0.641272, 0.68954, 0.758494, 0.806762, 0.861925, 0.937774, 1.013624, 1.089473, 1.172218, 1.254963, 1.337708, 1.420452, 1.503197, 1.585942]) },
            ],
          },
        ],
      },
      {
        id: "emilie-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "emilie-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.751029, 0.81216, 0.87329, 0.960619, 1.021749, 1.091613, 1.187674, 1.283736, 1.379798, 1.484593, 1.589388, 1.694183, 1.798977, 1.903772, 2.008567]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "emilie-charged",
      name: "Shadow-Hunting Spear (Custom)",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "emilie-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.91332, 0.98766, 1.062, 1.1682, 1.24254, 1.3275, 1.44432, 1.56114, 1.67796, 1.8054, 1.93284, 2.06028, 2.18772, 2.31516, 2.4426]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "emilie-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "emilie-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "emilie-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "emilie-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "emilie-skill",
      name: "Fragrance Extraction",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(14),
      energyCost: 0,
      particles: { count: 2, element: "dendro" },
      instances: [
        {
          id: "emilie-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.4708, 0.50611, 0.54142, 0.5885, 0.62381, 0.65912, 0.7062, 0.75328, 0.80036, 0.84744, 0.89452, 0.9416, 1.00045, 1.0593, 1.11815]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "emilie-skill-2",
          name: "Level 1 Lumidouce Case Attack DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.396, 0.4257, 0.4554, 0.495, 0.5247, 0.5544, 0.594, 0.6336, 0.6732, 0.7128, 0.7524, 0.792, 0.8415, 0.891, 0.9405]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "emilie-skill-3-1",
          name: "Level 2 Lumidouce Case Attack DMG (1/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "emilie-skill-3-2",
          name: "Level 2 Lumidouce Case Attack DMG (2/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "emilie-skill-4",
          name: "Spiritbreath Thorn DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.3852, 0.41409, 0.44298, 0.4815, 0.51039, 0.53928, 0.5778, 0.61632, 0.65484, 0.69336, 0.73188, 0.7704, 0.81855, 0.8667, 0.91485]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "emilie-burst",
      name: "Aromatic Explication",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(13.5),
      energyCost: 50,
      instances: [
        {
          id: "emilie-burst-1",
          name: "Level 3 Lumidouce Case Attack DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.172, 2.3349, 2.4978, 2.715, 2.8779, 3.0408, 3.258, 3.4752, 3.6924, 3.9096, 4.1268, 4.344, 4.6155, 4.887, 5.1585]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "emilie-a1", name: "Lingering Fragrance", unlockAscension: 1, effects: [] },
    { id: "emilie-a4", name: "Rectification", unlockAscension: 4, effects: [] },
    { id: "emilie-p3", name: "Headspace Capture", effects: [] },
  ],
  constellations: [
    { level: 1, id: "emilie-c1", name: "Light Fragrance Leaching", effects: [] },
    { level: 2, id: "emilie-c2", name: "Lakelight Top Note", effects: [] },
    { level: 3, id: "emilie-c3", name: "Exquisite Essence", effects: [], buffs: [{ id: "emilie-c3", source: "Exquisite Essence", sourceCharacterId: "emilie", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "emilie-c4", name: "Lumidouce Heart Note", effects: [] },
    { level: 5, id: "emilie-c5", name: "Puredew Aroma", effects: [], buffs: [{ id: "emilie-c5", source: "Puredew Aroma", sourceCharacterId: "emilie", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "emilie-c6", name: "Marcotte Sillage", effects: [] },
  ],
  resources: [],
};

export const kaveh: GeneratedCharacter = {
  id: "kaveh",
  name: "Kaveh",
  element: "dendro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1003, 2: 1086, 3: 1168, 4: 1252, 5: 1334, 6: 1417, 7: 1499, 8: 1583, 9: 1666, 10: 1748, 11: 1831, 12: 1914, 13: 1997, 14: 2079, 15: 2162, 16: 2246, 17: 2328, 18: 2411, 19: 2493, 20: 2577, 21: 3408, 22: 3491, 23: 3575, 24: 3657, 25: 3740, 26: 3822, 27: 3906, 28: 3988, 29: 4071, 30: 4153, 31: 4237, 32: 4320, 33: 4402, 34: 4485, 35: 4568, 36: 4651, 37: 4733, 38: 4816, 39: 4900, 40: 4982, 41: 5597, 42: 5680, 43: 5763, 44: 5845, 45: 5928, 46: 6012, 47: 6094, 48: 6177, 49: 6259, 50: 6343, 51: 7135, 52: 7218, 53: 7301, 54: 7383, 55: 7467, 56: 7549, 57: 7632, 58: 7714, 59: 7798, 60: 7881, 61: 8496, 62: 8579, 63: 8661, 64: 8744, 65: 8827, 66: 8910, 67: 8993, 68: 9075, 69: 9159, 70: 9241, 71: 9856, 72: 9939, 73: 10022, 74: 10105, 75: 10187, 76: 10271, 77: 10353, 78: 10436, 79: 10518, 80: 10602, 81: 11217, 82: 11299, 83: 11383, 84: 11465, 85: 11548, 86: 11630, 87: 11714, 88: 11796, 89: 11879, 90: 11962 } },
    atk: { byLevel: { 1: 20, 2: 21, 3: 23, 4: 24, 5: 26, 6: 28, 7: 29, 8: 31, 9: 33, 10: 34, 11: 36, 12: 37, 13: 39, 14: 41, 15: 42, 16: 44, 17: 45, 18: 47, 19: 49, 20: 50, 21: 67, 22: 68, 23: 70, 24: 71, 25: 73, 26: 75, 27: 76, 28: 78, 29: 80, 30: 81, 31: 83, 32: 84, 33: 86, 34: 88, 35: 89, 36: 91, 37: 92, 38: 94, 39: 96, 40: 97, 41: 109, 42: 111, 43: 113, 44: 114, 45: 116, 46: 117, 47: 119, 48: 121, 49: 122, 50: 124, 51: 139, 52: 141, 53: 143, 54: 144, 55: 146, 56: 147, 57: 149, 58: 151, 59: 152, 60: 154, 61: 166, 62: 168, 63: 169, 64: 171, 65: 172, 66: 174, 67: 176, 68: 177, 69: 179, 70: 180, 71: 193, 72: 194, 73: 196, 74: 197, 75: 199, 76: 201, 77: 202, 78: 204, 79: 205, 80: 207, 81: 219, 82: 221, 83: 222, 84: 224, 85: 226, 86: 227, 87: 229, 88: 230, 89: 232, 90: 234 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 79, 5: 84, 6: 89, 7: 94, 8: 99, 9: 105, 10: 110, 11: 115, 12: 120, 13: 125, 14: 130, 15: 136, 16: 141, 17: 146, 18: 151, 19: 156, 20: 162, 21: 214, 22: 219, 23: 224, 24: 230, 25: 235, 26: 240, 27: 245, 28: 250, 29: 256, 30: 261, 31: 266, 32: 271, 33: 276, 34: 282, 35: 287, 36: 292, 37: 297, 38: 302, 39: 308, 40: 313, 41: 351, 42: 356, 43: 362, 44: 367, 45: 372, 46: 377, 47: 382, 48: 388, 49: 393, 50: 398, 51: 448, 52: 453, 53: 458, 54: 463, 55: 469, 56: 474, 57: 479, 58: 484, 59: 489, 60: 495, 61: 533, 62: 538, 63: 544, 64: 549, 65: 554, 66: 559, 67: 564, 68: 570, 69: 575, 70: 580, 71: 619, 72: 624, 73: 629, 74: 634, 75: 639, 76: 645, 77: 650, 78: 655, 79: 660, 80: 665, 81: 704, 82: 709, 83: 714, 84: 720, 85: 725, 86: 730, 87: 735, 88: 740, 89: 746, 90: 751 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 234,
    hp: 11962,
    def: 751,
    elementalMastery: 96,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "kaveh-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaveh-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.761857, 0.823868, 0.88588, 0.974468, 1.03648, 1.10735, 1.204797, 1.302244, 1.39969, 1.505996, 1.612302, 1.718607, 1.824913, 1.931218, 2.037524]) },
            ],
          },
        ],
      },
      {
        id: "kaveh-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaveh-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.696385, 0.753068, 0.80975, 0.890725, 0.947407, 1.012188, 1.10126, 1.190333, 1.279405, 1.376575, 1.473745, 1.570915, 1.668085, 1.765255, 1.862425]) },
            ],
          },
        ],
      },
      {
        id: "kaveh-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaveh-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.842611, 0.911195, 0.97978, 1.077758, 1.146343, 1.224725, 1.332501, 1.440277, 1.548052, 1.665626, 1.7832, 1.900773, 2.018347, 2.13592, 2.253494]) },
            ],
          },
        ],
      },
      {
        id: "kaveh-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaveh-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.026883, 1.110467, 1.19405, 1.313455, 1.397039, 1.492563, 1.623908, 1.755254, 1.886599, 2.029885, 2.173171, 2.316457, 2.459743, 2.603029, 2.746315]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kaveh-charged",
      name: "Schematic Setup",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaveh-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.53148, 0.57474, 0.618, 0.6798, 0.72306, 0.7725, 0.84048, 0.90846, 0.97644, 1.0506, 1.12476, 1.19892, 1.27308, 1.34724, 1.4214]) },
          ],
        },
        {
          id: "kaveh-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.96148, 1.03974, 1.118, 1.2298, 1.30806, 1.3975, 1.52048, 1.64346, 1.76644, 1.9006, 2.03476, 2.16892, 2.30308, 2.43724, 2.5714]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kaveh-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaveh-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.49144, 1.612836, 1.734233, 1.907656, 2.029052, 2.167791, 2.358556, 2.549322, 2.740087, 2.948195, 3.156303, 3.364411, 3.572519, 3.780627, 3.988735]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "kaveh-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaveh-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.862889, 2.01452, 2.16615, 2.382765, 2.534396, 2.707688, 2.945964, 3.184241, 3.422517, 3.682455, 3.942393, 4.202331, 4.462269, 4.722207, 4.982145]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "kaveh-skill",
      name: "Artistic Ingenuity",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 2, element: "dendro" },
      instances: [
        {
          id: "kaveh-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.04, 2.193, 2.346, 2.55, 2.703, 2.856, 3.06, 3.264, 3.468, 3.672, 3.876, 4.08, 4.335, 4.59, 4.845]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kaveh-burst",
      name: "Painted Dome",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "kaveh-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.6, 1.72, 1.84, 2, 2.12, 2.24, 2.4, 2.56, 2.72, 2.88, 3.04, 3.2, 3.4, 3.6, 3.8]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kaveh-a1", name: "An Architect's Undertaking", unlockAscension: 1, effects: [] },
    { id: "kaveh-a4", name: "A Craftsman's Curious Conceptions", unlockAscension: 4, effects: [] },
    { id: "kaveh-p3", name: "The Art of Budgeting", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kaveh-c1", name: "Sublime Salutations", effects: [] },
    { level: 2, id: "kaveh-c2", name: "Grace of Royal Roads", effects: [] },
    { level: 3, id: "kaveh-c3", name: "Profferings of Dur Untash", effects: [], buffs: [{ id: "kaveh-c3", source: "Profferings of Dur Untash", sourceCharacterId: "kaveh", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "kaveh-c4", name: "Feast of Apadana", effects: [] },
    { level: 5, id: "kaveh-c5", name: "Treasures of Bonkhanak", effects: [], buffs: [{ id: "kaveh-c5", source: "Treasures of Bonkhanak", sourceCharacterId: "kaveh", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "kaveh-c6", name: "Pairidaeza's Dreams", effects: [] },
  ],
  resources: [],
};

export const kinich: GeneratedCharacter = {
  id: "kinich",
  name: "Kinich",
  element: "dendro",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1001, 2: 1084, 3: 1167, 4: 1251, 5: 1334, 6: 1418, 7: 1501, 8: 1586, 9: 1670, 10: 1753, 11: 1837, 12: 1921, 13: 2005, 14: 2090, 15: 2174, 16: 2258, 17: 2343, 18: 2427, 19: 2512, 20: 2597, 21: 3540, 22: 3625, 23: 3710, 24: 3795, 25: 3880, 26: 3966, 27: 4051, 28: 4136, 29: 4223, 30: 4308, 31: 4394, 32: 4480, 33: 4566, 34: 4651, 35: 4737, 36: 4824, 37: 4910, 38: 4996, 39: 5082, 40: 5170, 41: 5865, 42: 5952, 43: 6040, 44: 6126, 45: 6213, 46: 6300, 47: 6387, 48: 6474, 49: 6562, 50: 6649, 51: 7549, 52: 7637, 53: 7725, 54: 7813, 55: 7901, 56: 7989, 57: 8077, 58: 8165, 59: 8253, 60: 8341, 61: 9039, 62: 9127, 63: 9216, 64: 9304, 65: 9393, 66: 9482, 67: 9571, 68: 9660, 69: 9749, 70: 9838, 71: 10537, 72: 10627, 73: 10716, 74: 10805, 75: 10895, 76: 10984, 77: 11074, 78: 11164, 79: 11254, 80: 11345, 81: 12044, 82: 12134, 83: 12225, 84: 12315, 85: 12405, 86: 12496, 87: 12586, 88: 12677, 89: 12768, 90: 12858 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 32, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 45, 11: 47, 12: 50, 13: 52, 14: 54, 15: 56, 16: 58, 17: 61, 18: 63, 19: 65, 20: 67, 21: 92, 22: 94, 23: 96, 24: 98, 25: 100, 26: 103, 27: 105, 28: 107, 29: 109, 30: 111, 31: 114, 32: 116, 33: 118, 34: 120, 35: 122, 36: 125, 37: 127, 38: 129, 39: 131, 40: 134, 41: 152, 42: 154, 43: 156, 44: 158, 45: 161, 46: 163, 47: 165, 48: 167, 49: 170, 50: 172, 51: 195, 52: 197, 53: 200, 54: 202, 55: 204, 56: 207, 57: 209, 58: 211, 59: 213, 60: 216, 61: 234, 62: 236, 63: 238, 64: 241, 65: 243, 66: 245, 67: 247, 68: 250, 69: 252, 70: 254, 71: 272, 72: 275, 73: 277, 74: 279, 75: 282, 76: 284, 77: 286, 78: 289, 79: 291, 80: 293, 81: 311, 82: 314, 83: 316, 84: 318, 85: 321, 86: 323, 87: 325, 88: 328, 89: 330, 90: 332 } },
    def: { byLevel: { 1: 62, 2: 68, 3: 73, 4: 78, 5: 83, 6: 88, 7: 94, 8: 99, 9: 104, 10: 109, 11: 115, 12: 120, 13: 125, 14: 130, 15: 136, 16: 141, 17: 146, 18: 151, 19: 157, 20: 162, 21: 221, 22: 226, 23: 231, 24: 237, 25: 242, 26: 247, 27: 253, 28: 258, 29: 263, 30: 269, 31: 274, 32: 279, 33: 285, 34: 290, 35: 295, 36: 301, 37: 306, 38: 311, 39: 317, 40: 322, 41: 366, 42: 371, 43: 377, 44: 382, 45: 387, 46: 393, 47: 398, 48: 404, 49: 409, 50: 415, 51: 471, 52: 476, 53: 482, 54: 487, 55: 493, 56: 498, 57: 504, 58: 509, 59: 515, 60: 520, 61: 564, 62: 569, 63: 575, 64: 580, 65: 586, 66: 591, 67: 597, 68: 602, 69: 608, 70: 613, 71: 657, 72: 662, 73: 668, 74: 674, 75: 679, 76: 685, 77: 690, 78: 696, 79: 702, 80: 707, 81: 751, 82: 756, 83: 762, 84: 768, 85: 773, 86: 779, 87: 785, 88: 790, 89: 796, 90: 802 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 332,
    hp: 12858,
    def: 802,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "kinich-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kinich-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.98986, 1.07043, 1.151, 1.2661, 1.34667, 1.43875, 1.56536, 1.69197, 1.81858, 1.9567, 2.09482, 2.23294, 2.37106, 2.50918, 2.6473]) },
            ],
          },
        ],
      },
      {
        id: "kinich-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kinich-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.82904, 0.89652, 0.964, 1.0604, 1.12788, 1.205, 1.31104, 1.41708, 1.52312, 1.6388, 1.75448, 1.87016, 1.98584, 2.10152, 2.2172]) },
            ],
          },
        ],
      },
      {
        id: "kinich-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kinich-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.23496, 1.33548, 1.436, 1.5796, 1.68012, 1.795, 1.95296, 2.11092, 2.26888, 2.4412, 2.61352, 2.78584, 2.95816, 3.13048, 3.3028]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kinich-charged",
      name: "Nightsun Style",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kinich-charged-1-1",
          name: "Charged Attack DMG (1/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.48418, 0.52359, 0.563, 0.6193, 0.65871, 0.70375, 0.76568, 0.82761, 0.88954, 0.9571, 1.02466, 1.09222, 1.15978, 1.22734, 1.2949]) },
          ],
        },
        {
          id: "kinich-charged-1-2",
          name: "Charged Attack DMG (2/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.48418, 0.52359, 0.563, 0.6193, 0.65871, 0.70375, 0.76568, 0.82761, 0.88954, 0.9571, 1.02466, 1.09222, 1.15978, 1.22734, 1.2949]) },
          ],
        },
        {
          id: "kinich-charged-1-3",
          name: "Charged Attack DMG (3/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.48418, 0.52359, 0.563, 0.6193, 0.65871, 0.70375, 0.76568, 0.82761, 0.88954, 0.9571, 1.02466, 1.09222, 1.15978, 1.22734, 1.2949]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kinich-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kinich-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.49144, 1.612836, 1.734233, 1.907656, 2.029052, 2.167791, 2.358556, 2.549322, 2.740087, 2.948195, 3.156303, 3.364411, 3.572519, 3.780627, 3.988735]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "kinich-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kinich-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.862889, 2.01452, 2.16615, 2.382765, 2.534396, 2.707688, 2.945964, 3.184241, 3.422517, 3.682455, 3.942393, 4.202331, 4.462269, 4.722207, 4.982145]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "kinich-skill",
      name: "Canopy Hunter: Riding High",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 5, element: "dendro" },
      instances: [
        {
          id: "kinich-skill-1-1",
          name: "Loop Shot DMG (1/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.5728, 0.61576, 0.65872, 0.716, 0.75896, 0.80192, 0.8592, 0.91648, 0.97376, 1.03104, 1.08832, 1.1456, 1.2172, 1.2888, 1.3604]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "kinich-skill-1-2",
          name: "Loop Shot DMG (2/2)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.5728, 0.61576, 0.65872, 0.716, 0.75896, 0.80192, 0.8592, 0.91648, 0.97376, 1.03104, 1.08832, 1.1456, 1.2172, 1.2888, 1.3604]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "kinich-skill-2",
          name: "Scalespiker Cannon DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([6.8744, 7.38998, 7.90556, 8.593, 9.10858, 9.62416, 10.3116, 10.99904, 11.68648, 12.37392, 13.06136, 13.7488, 14.6081, 15.4674, 16.3267]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kinich-burst",
      name: "Hail to the Almighty Dragonlord",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "kinich-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.34, 1.4405, 1.541, 1.675, 1.7755, 1.876, 2.01, 2.144, 2.278, 2.412, 2.546, 2.68, 2.8475, 3.015, 3.1825]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "kinich-burst-2",
          name: "Dragon Breath DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.20736, 1.297912, 1.388464, 1.5092, 1.599752, 1.690304, 1.81104, 1.931776, 2.052512, 2.173248, 2.293984, 2.41472, 2.56564, 2.71656, 2.86748]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kinich-a1", name: "The Price of Desolation", unlockAscension: 1, effects: [] },
    { id: "kinich-a4", name: "Flame Spirit Pact", unlockAscension: 4, effects: [] },
    { id: "kinich-p3", name: "Night Realm's Gift: Repaid in Full", effects: [] },
    { id: "kinich-p4", name: "Swift Envoy", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kinich-c1", name: "Parrot's Beak", effects: [] },
    { level: 2, id: "kinich-c2", name: "Tiger Beetle's Palm", effects: [] },
    { level: 3, id: "kinich-c3", name: "Protosuchian's Claw", effects: [], buffs: [{ id: "kinich-c3", source: "Protosuchian's Claw", sourceCharacterId: "kinich", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kinich-c4", name: "Hummingbird's Feather", effects: [] },
    { level: 5, id: "kinich-c5", name: "Howler Monkey's Tail", effects: [], buffs: [{ id: "kinich-c5", source: "Howler Monkey's Tail", sourceCharacterId: "kinich", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kinich-c6", name: "Auspicious Beast's Shape", effects: [] },
  ],
  resources: [],
};

export const kirara: GeneratedCharacter = {
  id: "kirara",
  name: "Kirara",
  element: "dendro",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1021, 2: 1106, 3: 1190, 4: 1274, 5: 1358, 6: 1443, 7: 1527, 8: 1611, 9: 1696, 10: 1780, 11: 1865, 12: 1948, 13: 2033, 14: 2117, 15: 2202, 16: 2286, 17: 2370, 18: 2455, 19: 2539, 20: 2623, 21: 3470, 22: 3555, 23: 3640, 24: 3723, 25: 3808, 26: 3892, 27: 3977, 28: 4060, 29: 4145, 30: 4229, 31: 4314, 32: 4398, 33: 4482, 34: 4567, 35: 4651, 36: 4735, 37: 4819, 38: 4904, 39: 4989, 40: 5072, 41: 5699, 42: 5783, 43: 5868, 44: 5951, 45: 6036, 46: 6121, 47: 6205, 48: 6289, 49: 6373, 50: 6458, 51: 7264, 52: 7349, 53: 7434, 54: 7518, 55: 7602, 56: 7686, 57: 7771, 58: 7855, 59: 7939, 60: 8024, 61: 8650, 62: 8735, 63: 8819, 64: 8903, 65: 8987, 66: 9072, 67: 9157, 68: 9240, 69: 9325, 70: 9409, 71: 10036, 72: 10119, 73: 10204, 74: 10289, 75: 10373, 76: 10457, 77: 10541, 78: 10626, 79: 10710, 80: 10794, 81: 11421, 82: 11505, 83: 11590, 84: 11673, 85: 11758, 86: 11842, 87: 11927, 88: 12010, 89: 12095, 90: 12180 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 46, 2: 50, 3: 53, 4: 57, 5: 61, 6: 65, 7: 68, 8: 72, 9: 76, 10: 80, 11: 84, 12: 87, 13: 91, 14: 95, 15: 99, 16: 103, 17: 106, 18: 110, 19: 114, 20: 118, 21: 156, 22: 159, 23: 163, 24: 167, 25: 171, 26: 174, 27: 178, 28: 182, 29: 186, 30: 190, 31: 193, 32: 197, 33: 201, 34: 205, 35: 208, 36: 212, 37: 216, 38: 220, 39: 224, 40: 227, 41: 255, 42: 259, 43: 263, 44: 267, 45: 271, 46: 274, 47: 278, 48: 282, 49: 286, 50: 290, 51: 326, 52: 329, 53: 333, 54: 337, 55: 341, 56: 345, 57: 348, 58: 352, 59: 356, 60: 360, 61: 388, 62: 392, 63: 395, 64: 399, 65: 403, 66: 407, 67: 410, 68: 414, 69: 418, 70: 422, 71: 450, 72: 454, 73: 457, 74: 461, 75: 465, 76: 469, 77: 473, 78: 476, 79: 480, 80: 484, 81: 512, 82: 516, 83: 520, 84: 523, 85: 527, 86: 531, 87: 535, 88: 538, 89: 542, 90: 546 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 223,
    hp: 12180,
    def: 546,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "kirara-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kirara-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.47902, 0.51801, 0.557, 0.6127, 0.65169, 0.69625, 0.75752, 0.81879, 0.88006, 0.9469, 1.01374, 1.08058, 1.14742, 1.21426, 1.2811]) },
            ],
          },
        ],
      },
      {
        id: "kirara-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kirara-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.46354, 0.50127, 0.539, 0.5929, 0.63063, 0.67375, 0.73304, 0.79233, 0.85162, 0.9163, 0.98098, 1.04566, 1.11034, 1.17502, 1.2397]) },
            ],
          },
        ],
      },
      {
        id: "kirara-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kirara-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254216, 0.274908, 0.2956, 0.32516, 0.345852, 0.3695, 0.402016, 0.434532, 0.467048, 0.50252, 0.537992, 0.573464, 0.608936, 0.644408, 0.67988]) },
              { stat: "atk", table: talentTable([0.381324, 0.412362, 0.4434, 0.48774, 0.518778, 0.55425, 0.603024, 0.651798, 0.700572, 0.75378, 0.806988, 0.860196, 0.913404, 0.966612, 1.01982]) },
            ],
          },
        ],
      },
      {
        id: "kirara-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kirara-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.73272, 0.79236, 0.852, 0.9372, 0.99684, 1.065, 1.15872, 1.25244, 1.34616, 1.4484, 1.55064, 1.65288, 1.75512, 1.85736, 1.9596]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kirara-charged",
      name: "Boxcutter",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kirara-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.223772, 0.241986, 0.2602, 0.28622, 0.304434, 0.32525, 0.353872, 0.382494, 0.411116, 0.44234, 0.473564, 0.504788, 0.536012, 0.567236, 0.59846]) },
            { stat: "atk", table: talentTable([0.447544, 0.483972, 0.5204, 0.57244, 0.608868, 0.6505, 0.707744, 0.764988, 0.822232, 0.88468, 0.947128, 1.009576, 1.072024, 1.134472, 1.19692]) },
            { stat: "atk", table: talentTable([0.447544, 0.483972, 0.5204, 0.57244, 0.608868, 0.6505, 0.707744, 0.764988, 0.822232, 0.88468, 0.947128, 1.009576, 1.072024, 1.134472, 1.19692]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kirara-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kirara-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "kirara-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kirara-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "kirara-skill",
      name: "Meow-teor Kick",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      particles: { count: 4, element: "dendro" },
      instances: [
        {
          id: "kirara-skill-1",
          name: "Tail-Flicking Flying Kick DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.04, 1.118, 1.196, 1.3, 1.378, 1.456, 1.56, 1.664, 1.768, 1.872, 1.976, 2.08, 2.21, 2.34, 2.47]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "kirara-skill-2",
          name: "Urgent Neko Parcel Hit DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.336, 0.3612, 0.3864, 0.42, 0.4452, 0.4704, 0.504, 0.5376, 0.5712, 0.6048, 0.6384, 0.672, 0.714, 0.756, 0.798]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "kirara-skill-3",
          name: "Flipclaw Strike DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.44, 1.548, 1.656, 1.8, 1.908, 2.016, 2.16, 2.304, 2.448, 2.592, 2.736, 2.88, 3.06, 3.24, 3.42]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kirara-burst",
      name: "Secret Art: Surprise Dispatch",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "kirara-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([5.7024, 6.13008, 6.55776, 7.128, 7.55568, 7.98336, 8.5536, 9.12384, 9.69408, 10.26432, 10.83456, 11.4048, 12.1176, 12.8304, 13.5432]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "kirara-burst-2",
          name: "Cat Grass Cardamom Explosion DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.3564, 0.38313, 0.40986, 0.4455, 0.47223, 0.49896, 0.5346, 0.57024, 0.60588, 0.64152, 0.67716, 0.7128, 0.75735, 0.8019, 0.84645]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kirara-a1", name: "Bewitching, Betwitching Tails", unlockAscension: 1, effects: [] },
    { id: "kirara-a4", name: "Pupillary Variance", unlockAscension: 4, effects: [] },
    { id: "kirara-p3", name: "Cat's Creeping Carriage", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kirara-c1", name: "Material Circulation", effects: [] },
    { level: 2, id: "kirara-c2", name: "Perfectly Packaged", effects: [] },
    { level: 3, id: "kirara-c3", name: "Universal Recognition", effects: [], buffs: [{ id: "kirara-c3", source: "Universal Recognition", sourceCharacterId: "kirara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kirara-c4", name: "Steed of Skanda", effects: [] },
    { level: 5, id: "kirara-c5", name: "A Thousand Miles in a Day", effects: [], buffs: [{ id: "kirara-c5", source: "A Thousand Miles in a Day", sourceCharacterId: "kirara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kirara-c6", name: "Countless Sights to See", effects: [] },
  ],
  resources: [],
};

export const lauma: GeneratedCharacter = {
  id: "lauma",
  name: "Lauma",
  element: "dendro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 829, 2: 898, 3: 967, 4: 1037, 5: 1106, 6: 1175, 7: 1244, 8: 1314, 9: 1383, 10: 1452, 11: 1522, 12: 1592, 13: 1661, 14: 1732, 15: 1801, 16: 1871, 17: 1942, 18: 2011, 19: 2082, 20: 2151, 21: 2933, 22: 3004, 23: 3074, 24: 3145, 25: 3215, 26: 3286, 27: 3357, 28: 3427, 29: 3499, 30: 3569, 31: 3641, 32: 3712, 33: 3783, 34: 3854, 35: 3925, 36: 3997, 37: 4068, 38: 4140, 39: 4211, 40: 4283, 41: 4860, 42: 4932, 43: 5004, 44: 5076, 45: 5148, 46: 5220, 47: 5292, 48: 5364, 49: 5437, 50: 5509, 51: 6255, 52: 6328, 53: 6400, 54: 6473, 55: 6546, 56: 6619, 57: 6692, 58: 6765, 59: 6838, 60: 6911, 61: 7489, 62: 7562, 63: 7636, 64: 7709, 65: 7783, 66: 7857, 67: 7930, 68: 8004, 69: 8078, 70: 8151, 71: 8730, 72: 8805, 73: 8879, 74: 8953, 75: 9027, 76: 9101, 77: 9176, 78: 9250, 79: 9325, 80: 9400, 81: 9980, 82: 10054, 83: 10129, 84: 10204, 85: 10278, 86: 10354, 87: 10428, 88: 10504, 89: 10579, 90: 10654 } },
    atk: { byLevel: { 1: 20, 2: 21, 3: 23, 4: 25, 5: 26, 6: 28, 7: 30, 8: 31, 9: 33, 10: 35, 11: 36, 12: 38, 13: 40, 14: 41, 15: 43, 16: 45, 17: 46, 18: 48, 19: 50, 20: 51, 21: 70, 22: 72, 23: 74, 24: 75, 25: 77, 26: 79, 27: 80, 28: 82, 29: 84, 30: 85, 31: 87, 32: 89, 33: 91, 34: 92, 35: 94, 36: 96, 37: 97, 38: 99, 39: 101, 40: 103, 41: 116, 42: 118, 43: 120, 44: 121, 45: 123, 46: 125, 47: 127, 48: 128, 49: 130, 50: 132, 51: 150, 52: 151, 53: 153, 54: 155, 55: 157, 56: 158, 57: 160, 58: 162, 59: 164, 60: 165, 61: 179, 62: 181, 63: 183, 64: 184, 65: 186, 66: 188, 67: 190, 68: 192, 69: 193, 70: 195, 71: 209, 72: 211, 73: 212, 74: 214, 75: 216, 76: 218, 77: 220, 78: 221, 79: 223, 80: 225, 81: 239, 82: 241, 83: 242, 84: 244, 85: 246, 86: 248, 87: 250, 88: 251, 89: 253, 90: 255 } },
    def: { byLevel: { 1: 52, 2: 56, 3: 61, 4: 65, 5: 69, 6: 74, 7: 78, 8: 82, 9: 87, 10: 91, 11: 96, 12: 100, 13: 104, 14: 109, 15: 113, 16: 117, 17: 122, 18: 126, 19: 131, 20: 135, 21: 184, 22: 189, 23: 193, 24: 197, 25: 202, 26: 206, 27: 211, 28: 215, 29: 220, 30: 224, 31: 228, 32: 233, 33: 237, 34: 242, 35: 246, 36: 251, 37: 255, 38: 260, 39: 264, 40: 269, 41: 305, 42: 310, 43: 314, 44: 319, 45: 323, 46: 328, 47: 332, 48: 337, 49: 341, 50: 346, 51: 393, 52: 397, 53: 402, 54: 406, 55: 411, 56: 415, 57: 420, 58: 425, 59: 429, 60: 434, 61: 470, 62: 475, 63: 479, 64: 484, 65: 488, 66: 493, 67: 498, 68: 502, 69: 507, 70: 512, 71: 548, 72: 553, 73: 557, 74: 562, 75: 567, 76: 571, 77: 576, 78: 581, 79: 585, 80: 590, 81: 626, 82: 631, 83: 636, 84: 640, 85: 645, 86: 650, 87: 654, 88: 659, 89: 664, 90: 669 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 315],
  },
  baseStats: {
    atk: 255,
    hp: 10654,
    def: 669,
    elementalMastery: 315,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "lauma-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lauma-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.337024, 0.362301, 0.387578, 0.42128, 0.446557, 0.471834, 0.505536, 0.539238, 0.572941, 0.606643, 0.640346, 0.674048, 0.716176, 0.758304, 0.800432]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "lauma-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lauma-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.318048, 0.341902, 0.365755, 0.39756, 0.421414, 0.445267, 0.477072, 0.508877, 0.540682, 0.572486, 0.604291, 0.636096, 0.675852, 0.715608, 0.755364]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "lauma-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lauma-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.444968, 0.478341, 0.511713, 0.55621, 0.589583, 0.622955, 0.667452, 0.711949, 0.756446, 0.800942, 0.845439, 0.889936, 0.945557, 1.001178, 1.056799]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  plungeLow:
    {
      id: "lauma-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lauma-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "lauma-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lauma-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "lauma-skill",
      name: "Runo: Dawnless Rest of Karsikko",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 3, element: "dendro" },
      instances: [
        {
          id: "lauma-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.216, 1.3072, 1.3984, 1.52, 1.6112, 1.7024, 1.824, 1.9456, 2.0672, 2.1888, 2.3104, 2.432, 2.584, 2.736, 2.888]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "lauma-skill-2",
          name: "1-Hit Hold DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.5808, 1.69936, 1.81792, 1.976, 2.09456, 2.21312, 2.3712, 2.52928, 2.68736, 2.84544, 3.00352, 3.1616, 3.3592, 3.5568, 3.7544]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "lauma-skill-3",
          name: "2-Hit Hold DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "elementalMastery", table: talentTable([1.52, 1.634, 1.748, 1.9, 2.014, 2.128, 2.28, 2.432, 2.584, 2.736, 2.888, 3.04, 3.23, 3.42, 3.61]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "lauma-skill-4",
          name: "Frostgrove Sanctuary Attack DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
            { stat: "elementalMastery", table: talentTable([1.92, 2.064, 2.208, 2.4, 2.544, 2.688, 2.88, 3.072, 3.264, 3.456, 3.648, 3.84, 4.08, 4.32, 4.56]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lauma-burst",
      name: "Runo: All Hearts Become the Beating Moon",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
      ],
    },
  passives: [
    { id: "lauma-a1", name: "Light for the Frosty Night", unlockAscension: 1, effects: [] },
    { id: "lauma-a4", name: "Cleansing for the Spring", unlockAscension: 4, effects: [] },
    { id: "lauma-p3", name: "Moonsign Benediction: Nature's Chorus", effects: [] },
    { id: "lauma-p4", name: "Prayers for the Forest", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lauma-c1", name: "\"O Lips, Weave Me Songs and Psalms\"", effects: [] },
    { level: 2, id: "lauma-c2", name: "\"Twine Warnings and Tales From the North\"", effects: [] },
    { level: 3, id: "lauma-c3", name: "\"Seek Not to Tread the Sly Fox's Path\"", effects: [], buffs: [{ id: "lauma-c3", source: "\"Seek Not to Tread the Sly Fox's Path\"", sourceCharacterId: "lauma", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "lauma-c4", name: "\"Nor Yearn for the Great Bear's Might\"", effects: [] },
    { level: 5, id: "lauma-c5", name: "\"If Truth May Be Subject to Witness\"", effects: [], buffs: [{ id: "lauma-c5", source: "\"If Truth May Be Subject to Witness\"", sourceCharacterId: "lauma", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "lauma-c6", name: "\"I Offer Blood and Tears to the Moonlight\"", effects: [] },
  ],
  resources: [],
};

export const nahida: GeneratedCharacter = {
  id: "nahida",
  name: "Nahida",
  element: "dendro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 807, 2: 873, 3: 940, 4: 1008, 5: 1075, 6: 1143, 7: 1210, 8: 1278, 9: 1345, 10: 1412, 11: 1480, 12: 1548, 13: 1615, 14: 1684, 15: 1752, 16: 1819, 17: 1888, 18: 1956, 19: 2024, 20: 2092, 21: 2852, 22: 2921, 23: 2989, 24: 3058, 25: 3126, 26: 3196, 27: 3264, 28: 3333, 29: 3402, 30: 3471, 31: 3540, 32: 3609, 33: 3679, 34: 3747, 35: 3817, 36: 3887, 37: 3956, 38: 4026, 39: 4095, 40: 4165, 41: 4726, 42: 4796, 43: 4866, 44: 4936, 45: 5006, 46: 5076, 47: 5146, 48: 5216, 49: 5287, 50: 5357, 51: 6083, 52: 6154, 53: 6224, 54: 6295, 55: 6366, 56: 6437, 57: 6508, 58: 6579, 59: 6650, 60: 6721, 61: 7283, 62: 7354, 63: 7426, 64: 7497, 65: 7568, 66: 7640, 67: 7711, 68: 7783, 69: 7855, 70: 7926, 71: 8490, 72: 8562, 73: 8634, 74: 8706, 75: 8778, 76: 8850, 77: 8923, 78: 8995, 79: 9068, 80: 9140, 81: 9704, 82: 9777, 83: 9850, 84: 9922, 85: 9995, 86: 10068, 87: 10141, 88: 10214, 89: 10287, 90: 10360 } },
    atk: { byLevel: { 1: 23, 2: 25, 3: 27, 4: 29, 5: 31, 6: 33, 7: 35, 8: 37, 9: 39, 10: 41, 11: 43, 12: 45, 13: 47, 14: 49, 15: 51, 16: 53, 17: 54, 18: 56, 19: 58, 20: 60, 21: 82, 22: 84, 23: 86, 24: 88, 25: 90, 26: 92, 27: 94, 28: 96, 29: 98, 30: 100, 31: 102, 32: 104, 33: 106, 34: 108, 35: 110, 36: 112, 37: 114, 38: 116, 39: 118, 40: 120, 41: 136, 42: 138, 43: 140, 44: 142, 45: 144, 46: 146, 47: 149, 48: 151, 49: 153, 50: 155, 51: 176, 52: 178, 53: 180, 54: 182, 55: 184, 56: 186, 57: 188, 58: 190, 59: 192, 60: 194, 61: 210, 62: 212, 63: 214, 64: 216, 65: 218, 66: 220, 67: 223, 68: 225, 69: 227, 70: 229, 71: 245, 72: 247, 73: 249, 74: 251, 75: 253, 76: 255, 77: 257, 78: 260, 79: 262, 80: 264, 81: 280, 82: 282, 83: 284, 84: 286, 85: 288, 86: 291, 87: 293, 88: 295, 89: 297, 90: 299 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 70, 7: 74, 8: 78, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 107, 16: 111, 17: 115, 18: 119, 19: 123, 20: 127, 21: 173, 22: 178, 23: 182, 24: 186, 25: 190, 26: 194, 27: 199, 28: 203, 29: 207, 30: 211, 31: 215, 32: 220, 33: 224, 34: 228, 35: 232, 36: 236, 37: 241, 38: 245, 39: 249, 40: 253, 41: 287, 42: 292, 43: 296, 44: 300, 45: 305, 46: 309, 47: 313, 48: 317, 49: 322, 50: 326, 51: 370, 52: 374, 53: 379, 54: 383, 55: 387, 56: 392, 57: 396, 58: 400, 59: 405, 60: 409, 61: 443, 62: 447, 63: 452, 64: 456, 65: 460, 66: 465, 67: 469, 68: 473, 69: 478, 70: 482, 71: 516, 72: 521, 73: 525, 74: 530, 75: 534, 76: 538, 77: 543, 78: 547, 79: 552, 80: 556, 81: 590, 82: 595, 83: 599, 84: 604, 85: 608, 86: 612, 87: 617, 88: 621, 89: 626, 90: 630 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 115],
  },
  baseStats: {
    atk: 299,
    hp: 10360,
    def: 630,
    elementalMastery: 115,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 50,
  normalAttacks: {
    hits: [
      {
        id: "nahida-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nahida-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.403048, 0.433277, 0.463505, 0.50381, 0.534039, 0.564267, 0.604572, 0.644877, 0.685182, 0.725486, 0.765791, 0.806096, 0.856477, 0.906858, 0.957239]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nahida-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nahida-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.369744, 0.397475, 0.425206, 0.46218, 0.489911, 0.517642, 0.554616, 0.59159, 0.628565, 0.665539, 0.702514, 0.739488, 0.785706, 0.831924, 0.878142]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nahida-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nahida-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.458744, 0.49315, 0.527556, 0.57343, 0.607836, 0.642242, 0.688116, 0.73399, 0.779865, 0.825739, 0.871614, 0.917488, 0.974831, 1.032174, 1.089517]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nahida-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nahida-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.584064, 0.627869, 0.671674, 0.73008, 0.773885, 0.81769, 0.876096, 0.934502, 0.992909, 1.051315, 1.109722, 1.168128, 1.241136, 1.314144, 1.387152]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "nahida-charged",
      name: "Akara",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nahida-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.32, 1.419, 1.518, 1.65, 1.749, 1.848, 1.98, 2.112, 2.244, 2.376, 2.508, 2.64, 2.805, 2.97, 3.135]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "nahida-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nahida-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "nahida-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nahida-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "nahida-skill",
      name: "All Schemes to Know",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(5),
      energyCost: 0,
      particles: { count: 3, element: "dendro" },
      instances: [
        {
          id: "nahida-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.984, 1.0578, 1.1316, 1.23, 1.3038, 1.3776, 1.476, 1.5744, 1.6728, 1.7712, 1.8696, 1.968, 2.091, 2.214, 2.337]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nahida-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.304, 1.4018, 1.4996, 1.63, 1.7278, 1.8256, 1.956, 2.0864, 2.2168, 2.3472, 2.4776, 2.608, 2.771, 2.934, 3.097]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nahida-skill-3",
          name: "Tri-Karma Purification DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.032, 1.1094, 1.1868, 1.29, 1.3674, 1.4448, 1.548, 1.6512, 1.7544, 1.8576, 1.9608, 2.064, 2.193, 2.322, 2.451]) },
            { stat: "elementalMastery", table: talentTable([2.064, 2.2188, 2.3736, 2.58, 2.7348, 2.8896, 3.096, 3.3024, 3.5088, 3.7152, 3.9216, 4.128, 4.386, 4.644, 4.902]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "nahida-burst",
      name: "Illusory Heart",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(13.5),
      energyCost: 50,
      instances: [
      ],
    },
  passives: [
    { id: "nahida-a1", name: "Compassion Illuminated", unlockAscension: 1, effects: [] },
    { id: "nahida-a4", name: "Awakening Elucidated", unlockAscension: 4, effects: [] },
    { id: "nahida-p3", name: "On All Things Meditated", effects: [] },
  ],
  constellations: [
    { level: 1, id: "nahida-c1", name: "The Seed of Stored Knowledge", effects: [] },
    { level: 2, id: "nahida-c2", name: "The Root of All Fullness", effects: [] },
    { level: 3, id: "nahida-c3", name: "The Shoot of Conscious Attainment", effects: [], buffs: [{ id: "nahida-c3", source: "The Shoot of Conscious Attainment", sourceCharacterId: "nahida", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "nahida-c4", name: "The Stem of Manifest Inference", effects: [] },
    { level: 5, id: "nahida-c5", name: "The Leaves of Enlightening Speech", effects: [], buffs: [{ id: "nahida-c5", source: "The Leaves of Enlightening Speech", sourceCharacterId: "nahida", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "nahida-c6", name: "The Fruit of Reason's Culmination", effects: [] },
  ],
  resources: [],
};

export const nefer: GeneratedCharacter = {
  id: "nefer",
  name: "Nefer",
  element: "dendro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 989, 2: 1071, 3: 1153, 4: 1236, 5: 1318, 6: 1401, 7: 1483, 8: 1567, 9: 1650, 10: 1732, 11: 1815, 12: 1898, 13: 1981, 14: 2065, 15: 2148, 16: 2231, 17: 2315, 18: 2398, 19: 2482, 20: 2565, 21: 3497, 22: 3581, 23: 3666, 24: 3750, 25: 3834, 26: 3919, 27: 4003, 28: 4087, 29: 4172, 30: 4256, 31: 4341, 32: 4426, 33: 4511, 34: 4595, 35: 4680, 36: 4766, 37: 4851, 38: 4936, 39: 5021, 40: 5107, 41: 5795, 42: 5881, 43: 5967, 44: 6052, 45: 6138, 46: 6224, 47: 6310, 48: 6396, 49: 6483, 50: 6569, 51: 7459, 52: 7546, 53: 7632, 54: 7719, 55: 7806, 56: 7893, 57: 7980, 58: 8067, 59: 8154, 60: 8241, 61: 8931, 62: 9018, 63: 9106, 64: 9193, 65: 9281, 66: 9369, 67: 9456, 68: 9544, 69: 9632, 70: 9720, 71: 10410, 72: 10499, 73: 10587, 74: 10675, 75: 10764, 76: 10852, 77: 10941, 78: 11030, 79: 11119, 80: 11208, 81: 11900, 82: 11989, 83: 12078, 84: 12167, 85: 12256, 86: 12346, 87: 12435, 88: 12525, 89: 12615, 90: 12704 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 34, 5: 36, 6: 38, 7: 40, 8: 42, 9: 45, 10: 47, 11: 49, 12: 51, 13: 54, 14: 56, 15: 58, 16: 60, 17: 63, 18: 65, 19: 67, 20: 70, 21: 95, 22: 97, 23: 99, 24: 102, 25: 104, 26: 106, 27: 109, 28: 111, 29: 113, 30: 115, 31: 118, 32: 120, 33: 122, 34: 125, 35: 127, 36: 129, 37: 132, 38: 134, 39: 136, 40: 138, 41: 157, 42: 159, 43: 162, 44: 164, 45: 166, 46: 169, 47: 171, 48: 173, 49: 176, 50: 178, 51: 202, 52: 205, 53: 207, 54: 209, 55: 212, 56: 214, 57: 216, 58: 219, 59: 221, 60: 223, 61: 242, 62: 244, 63: 247, 64: 249, 65: 252, 66: 254, 67: 256, 68: 259, 69: 261, 70: 264, 71: 282, 72: 285, 73: 287, 74: 289, 75: 292, 76: 294, 77: 297, 78: 299, 79: 301, 80: 304, 81: 323, 82: 325, 83: 327, 84: 330, 85: 332, 86: 335, 87: 337, 88: 340, 89: 342, 90: 344 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 73, 4: 78, 5: 83, 6: 88, 7: 93, 8: 99, 9: 104, 10: 109, 11: 114, 12: 119, 13: 125, 14: 130, 15: 135, 16: 140, 17: 146, 18: 151, 19: 156, 20: 161, 21: 220, 22: 225, 23: 231, 24: 236, 25: 241, 26: 247, 27: 252, 28: 257, 29: 262, 30: 268, 31: 273, 32: 278, 33: 284, 34: 289, 35: 294, 36: 300, 37: 305, 38: 311, 39: 316, 40: 321, 41: 365, 42: 370, 43: 375, 44: 381, 45: 386, 46: 392, 47: 397, 48: 402, 49: 408, 50: 413, 51: 469, 52: 475, 53: 480, 54: 486, 55: 491, 56: 497, 57: 502, 58: 508, 59: 513, 60: 519, 61: 562, 62: 567, 63: 573, 64: 578, 65: 584, 66: 589, 67: 595, 68: 600, 69: 606, 70: 612, 71: 655, 72: 661, 73: 666, 74: 672, 75: 677, 76: 683, 77: 688, 78: 694, 79: 700, 80: 705, 81: 749, 82: 754, 83: 760, 84: 766, 85: 771, 86: 777, 87: 782, 88: 788, 89: 794, 90: 799 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 344,
    hp: 12704,
    def: 799,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "nefer-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nefer-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.380712, 0.409265, 0.437819, 0.47589, 0.504443, 0.532997, 0.571068, 0.609139, 0.64721, 0.685282, 0.723353, 0.761424, 0.809013, 0.856602, 0.904191]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nefer-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nefer-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.37564, 0.403813, 0.431986, 0.46955, 0.497723, 0.525896, 0.56346, 0.601024, 0.638588, 0.676152, 0.713716, 0.75128, 0.798235, 0.84519, 0.892145]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nefer-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nefer-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.2524, 0.27133, 0.29026, 0.3155, 0.33443, 0.35336, 0.3786, 0.40384, 0.42908, 0.45432, 0.47956, 0.5048, 0.53635, 0.5679, 0.59945]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
          {
            id: "nefer-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.2524, 0.27133, 0.29026, 0.3155, 0.33443, 0.35336, 0.3786, 0.40384, 0.42908, 0.45432, 0.47956, 0.5048, 0.53635, 0.5679, 0.59945]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
      {
        id: "nefer-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nefer-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "dendro",
            scaling: [
              { stat: "atk", table: talentTable([0.609944, 0.65569, 0.701436, 0.76243, 0.808176, 0.853922, 0.914916, 0.97591, 1.036905, 1.097899, 1.158894, 1.219888, 1.296131, 1.372374, 1.448617]) },
            ],
            application: { element: "dendro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "nefer-charged",
      name: "Striking Serpent",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nefer-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.3088, 1.40696, 1.50512, 1.636, 1.73416, 1.83232, 1.9632, 2.09408, 2.22496, 2.35584, 2.48672, 2.6176, 2.7812, 2.9448, 3.1084]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "nefer-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nefer-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "nefer-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nefer-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "nefer-skill",
      name: "Senet Strategy: Dance of a Thousand Nights",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 5, element: "dendro" },
      instances: [
        {
          id: "nefer-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.76384, 0.821128, 0.878416, 0.9548, 1.012088, 1.069376, 1.14576, 1.222144, 1.298528, 1.374912, 1.451296, 1.52768, 1.62316, 1.71864, 1.81412]) },
            { stat: "elementalMastery", table: talentTable([1.52768, 1.642256, 1.756832, 1.9096, 2.024176, 2.138752, 2.29152, 2.444288, 2.597056, 2.749824, 2.902592, 3.05536, 3.24632, 3.43728, 3.62824]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nefer-skill-2",
          name: "Phantasm Performance 1-Hit DMG (Nefer)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.2464, 0.26488, 0.28336, 0.308, 0.32648, 0.34496, 0.3696, 0.39424, 0.41888, 0.44352, 0.46816, 0.4928, 0.5236, 0.5544, 0.5852]) },
            { stat: "elementalMastery", table: talentTable([0.4928, 0.52976, 0.56672, 0.616, 0.65296, 0.68992, 0.7392, 0.78848, 0.83776, 0.88704, 0.93632, 0.9856, 1.0472, 1.1088, 1.1704]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nefer-skill-3",
          name: "Phantasm Performance 2-Hit DMG (Nefer)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.32032, 0.344344, 0.368368, 0.4004, 0.424424, 0.448448, 0.48048, 0.512512, 0.544544, 0.576576, 0.608608, 0.64064, 0.68068, 0.72072, 0.76076]) },
            { stat: "elementalMastery", table: talentTable([0.64064, 0.688688, 0.736736, 0.8008, 0.848848, 0.896896, 0.96096, 1.025024, 1.089088, 1.153152, 1.217216, 1.28128, 1.36136, 1.44144, 1.52152]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nefer-skill-4",
          name: "Phantasm Performance 1-Hit DMG (Shades)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "elementalMastery", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nefer-skill-5",
          name: "Phantasm Performance 2-Hit DMG (Shades)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "elementalMastery", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
        {
          id: "nefer-skill-6",
          name: "Phantasm Performance 3-Hit DMG (Shades)",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "elementalMastery", table: talentTable([1.28, 1.376, 1.472, 1.6, 1.696, 1.792, 1.92, 2.048, 2.176, 2.304, 2.432, 2.56, 2.72, 2.88, 3.04]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "nefer-burst",
      name: "Sacred Vow: True Eye's Phantasm",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "nefer-burst-1",
          name: "1-Hit DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.2464, 2.41488, 2.58336, 2.808, 2.97648, 3.14496, 3.3696, 3.59424, 3.81888, 4.04352, 4.26816, 4.4928, 4.7736, 5.0544, 5.3352]) },
            { stat: "elementalMastery", table: talentTable([4.4928, 4.82976, 5.16672, 5.616, 5.95296, 6.28992, 6.7392, 7.18848, 7.63776, 8.08704, 8.53632, 8.9856, 9.5472, 10.1088, 10.6704]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "nefer-burst-2",
          name: "2-Hit DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([3.3696, 3.62232, 3.87504, 4.212, 4.46472, 4.71744, 5.0544, 5.39136, 5.72832, 6.06528, 6.40224, 6.7392, 7.1604, 7.5816, 8.0028]) },
            { stat: "elementalMastery", table: talentTable([6.7392, 7.24464, 7.75008, 8.424, 8.92944, 9.43488, 10.1088, 10.78272, 11.45664, 12.13056, 12.80448, 13.4784, 14.3208, 15.1632, 16.0056]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "nefer-a1", name: "A Wager of Moonlight", unlockAscension: 1, effects: [] },
    { id: "nefer-a4", name: "Daughter of the Dust and Sand", unlockAscension: 4, effects: [] },
    { id: "nefer-p3", name: "Moonsign Benediction: Dusklit Eaves", effects: [] },
    { id: "nefer-p4", name: "Conspiracy of the Golden Vault", effects: [] },
  ],
  constellations: [
    { level: 1, id: "nefer-c1", name: "Planning Breeds Success", effects: [] },
    { level: 2, id: "nefer-c2", name: "Observation Feeds Strategy", effects: [] },
    { level: 3, id: "nefer-c3", name: "Deceit Cloaks the Truth", effects: [], buffs: [{ id: "nefer-c3", source: "Deceit Cloaks the Truth", sourceCharacterId: "nefer", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "nefer-c4", name: "Delusion Ensnares Reason", effects: [] },
    { level: 5, id: "nefer-c5", name: "Opportunity Hides in the Margins", effects: [], buffs: [{ id: "nefer-c5", source: "Opportunity Hides in the Margins", sourceCharacterId: "nefer", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "nefer-c6", name: "Victory Flows from the Turning of Tides", effects: [] },
  ],
  resources: [],
};

export const tighnari: GeneratedCharacter = {
  id: "tighnari",
  name: "Tighnari",
  element: "dendro",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 845, 2: 915, 3: 985, 4: 1056, 5: 1126, 6: 1197, 7: 1267, 8: 1338, 9: 1409, 10: 1479, 11: 1550, 12: 1621, 13: 1692, 14: 1764, 15: 1835, 16: 1906, 17: 1977, 18: 2048, 19: 2120, 20: 2191, 21: 2987, 22: 3059, 23: 3131, 24: 3202, 25: 3274, 26: 3347, 27: 3419, 28: 3490, 29: 3563, 30: 3635, 31: 3707, 32: 3780, 33: 3853, 34: 3925, 35: 3997, 36: 4071, 37: 4143, 38: 4216, 39: 4289, 40: 4362, 41: 4949, 42: 5023, 43: 5096, 44: 5169, 45: 5242, 46: 5316, 47: 5389, 48: 5463, 49: 5537, 50: 5611, 51: 6370, 52: 6445, 53: 6518, 54: 6592, 55: 6667, 56: 6741, 57: 6815, 58: 6890, 59: 6964, 60: 7038, 61: 7627, 62: 7702, 63: 7777, 64: 7851, 65: 7926, 66: 8001, 67: 8076, 68: 8151, 69: 8226, 70: 8301, 71: 8891, 72: 8967, 73: 9042, 74: 9117, 75: 9193, 76: 9269, 77: 9345, 78: 9421, 79: 9497, 80: 9573, 81: 10163, 82: 10239, 83: 10315, 84: 10391, 85: 10467, 86: 10544, 87: 10620, 88: 10697, 89: 10774, 90: 10850 } },
    atk: { byLevel: { 1: 21, 2: 23, 3: 24, 4: 26, 5: 28, 6: 30, 7: 31, 8: 33, 9: 35, 10: 37, 11: 38, 12: 40, 13: 42, 14: 44, 15: 45, 16: 47, 17: 49, 18: 51, 19: 52, 20: 54, 21: 74, 22: 76, 23: 77, 24: 79, 25: 81, 26: 83, 27: 84, 28: 86, 29: 88, 30: 90, 31: 92, 32: 93, 33: 95, 34: 97, 35: 99, 36: 101, 37: 102, 38: 104, 39: 106, 40: 108, 41: 122, 42: 124, 43: 126, 44: 128, 45: 129, 46: 131, 47: 133, 48: 135, 49: 137, 50: 139, 51: 157, 52: 159, 53: 161, 54: 163, 55: 165, 56: 166, 57: 168, 58: 170, 59: 172, 60: 174, 61: 188, 62: 190, 63: 192, 64: 194, 65: 196, 66: 198, 67: 199, 68: 201, 69: 203, 70: 205, 71: 220, 72: 221, 73: 223, 74: 225, 75: 227, 76: 229, 77: 231, 78: 233, 79: 234, 80: 236, 81: 251, 82: 253, 83: 255, 84: 257, 85: 258, 86: 260, 87: 262, 88: 264, 89: 266, 90: 268 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 70, 7: 74, 8: 78, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 107, 16: 111, 17: 115, 18: 119, 19: 123, 20: 127, 21: 173, 22: 178, 23: 182, 24: 186, 25: 190, 26: 194, 27: 199, 28: 203, 29: 207, 30: 211, 31: 215, 32: 220, 33: 224, 34: 228, 35: 232, 36: 236, 37: 241, 38: 245, 39: 249, 40: 253, 41: 287, 42: 292, 43: 296, 44: 300, 45: 305, 46: 309, 47: 313, 48: 317, 49: 322, 50: 326, 51: 370, 52: 374, 53: 379, 54: 383, 55: 387, 56: 392, 57: 396, 58: 400, 59: 405, 60: 409, 61: 443, 62: 447, 63: 452, 64: 456, 65: 460, 66: 465, 67: 469, 68: 473, 69: 478, 70: 482, 71: 516, 72: 521, 73: 525, 74: 530, 75: 534, 76: 538, 77: 543, 78: 547, 79: 552, 80: 556, 81: 590, 82: 595, 83: 599, 84: 604, 85: 608, 86: 612, 87: 617, 88: 621, 89: 626, 90: 630 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "dendro",
  },
  baseStats: {
    atk: 268,
    hp: 10850,
    def: 630,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { dendro: 0.28800000000000003 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "tighnari-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tighnari-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44634, 0.48267, 0.519, 0.5709, 0.60723, 0.64875, 0.70584, 0.76293, 0.82002, 0.8823, 0.94458, 1.00686, 1.06914, 1.13142, 1.1937]) },
            ],
          },
        ],
      },
      {
        id: "tighnari-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tighnari-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.41968, 0.45384, 0.488, 0.5368, 0.57096, 0.61, 0.66368, 0.71736, 0.77104, 0.8296, 0.88816, 0.94672, 1.00528, 1.06384, 1.1224]) },
            ],
          },
        ],
      },
      {
        id: "tighnari-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tighnari-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26445, 0.285975, 0.3075, 0.33825, 0.359775, 0.384375, 0.4182, 0.452025, 0.48585, 0.52275, 0.55965, 0.59655, 0.63345, 0.67035, 0.70725]) },
            ],
          },
          {
            id: "tighnari-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26445, 0.285975, 0.3075, 0.33825, 0.359775, 0.384375, 0.4182, 0.452025, 0.48585, 0.52275, 0.55965, 0.59655, 0.63345, 0.67035, 0.70725]) },
            ],
          },
        ],
      },
      {
        id: "tighnari-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tighnari-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.68628, 0.74214, 0.798, 0.8778, 0.93366, 0.9975, 1.08528, 1.17306, 1.26084, 1.3566, 1.45236, 1.54812, 1.64388, 1.73964, 1.8354]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "tighnari-charged",
      name: "Khanda Barrier-Buster",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tighnari-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "tighnari-charged-2",
          name: "Level 1 Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.24, 1.333, 1.426, 1.55, 1.643, 1.736, 1.86, 1.984, 2.108, 2.232, 2.356, 2.48, 2.635, 2.79, 2.945]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "tighnari-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tighnari-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "tighnari-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tighnari-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "tighnari-skill",
      name: "Vijnana-Phala Mine",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 4, element: "dendro" },
      instances: [
        {
          id: "tighnari-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.496, 1.6082, 1.7204, 1.87, 1.9822, 2.0944, 2.244, 2.3936, 2.5432, 2.6928, 2.8424, 2.992, 3.179, 3.366, 3.553]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "tighnari-burst",
      name: "Fashioner's Tanglevine Shaft",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "tighnari-burst-1",
          name: "Tanglevine Shaft DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.5562, 0.597915, 0.63963, 0.69525, 0.736965, 0.77868, 0.8343, 0.88992, 0.94554, 1.00116, 1.05678, 1.1124, 1.181925, 1.25145, 1.320975]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "tighnari-burst-2",
          name: "Secondary Tanglevine Shaft DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.6798, 0.730785, 0.78177, 0.84975, 0.900735, 0.95172, 1.0197, 1.08768, 1.15566, 1.22364, 1.29162, 1.3596, 1.444575, 1.52955, 1.614525]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "tighnari-a1", name: "Keen Sight", unlockAscension: 1, effects: [] },
    { id: "tighnari-a4", name: "Scholarly Blade", unlockAscension: 4, effects: [] },
    { id: "tighnari-p3", name: "Encyclopedic Knowledge", effects: [] },
  ],
  constellations: [
    { level: 1, id: "tighnari-c1", name: "Beginnings Determined at the Roots", effects: [] },
    { level: 2, id: "tighnari-c2", name: "Origins Known From the Stem", effects: [] },
    { level: 3, id: "tighnari-c3", name: "Fortunes Read Amongst the Branches", effects: [], buffs: [{ id: "tighnari-c3", source: "Fortunes Read Amongst the Branches", sourceCharacterId: "tighnari", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "tighnari-c4", name: "Withering Glimpsed in the Leaves", effects: [] },
    { level: 5, id: "tighnari-c5", name: "Comprehension Amidst the Flowers", effects: [], buffs: [{ id: "tighnari-c5", source: "Comprehension Amidst the Flowers", sourceCharacterId: "tighnari", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "tighnari-c6", name: "Karma Adjudged From the Leaden Fruit", effects: [] },
  ],
  resources: [],
};

export const travelerFDendro: GeneratedCharacter = {
  id: "traveler-f-dendro",
  name: "Traveler",
  element: "dendro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 912, 2: 987, 3: 1062, 4: 1138, 5: 1213, 6: 1288, 7: 1363, 8: 1439, 9: 1514, 10: 1589, 11: 1665, 12: 1740, 13: 1815, 14: 1890, 15: 1966, 16: 2042, 17: 2116, 18: 2192, 19: 2267, 20: 2342, 21: 3098, 22: 3174, 23: 3250, 24: 3324, 25: 3400, 26: 3475, 27: 3551, 28: 3625, 29: 3701, 30: 3776, 31: 3851, 32: 3927, 33: 4002, 34: 4078, 35: 4152, 36: 4228, 37: 4303, 38: 4378, 39: 4454, 40: 4529, 41: 5089, 42: 5163, 43: 5239, 44: 5314, 45: 5389, 46: 5465, 47: 5540, 48: 5616, 49: 5690, 50: 5766, 51: 6486, 52: 6562, 53: 6637, 54: 6712, 55: 6788, 56: 6863, 57: 6938, 58: 7013, 59: 7089, 60: 7164, 61: 7723, 62: 7799, 63: 7874, 64: 7949, 65: 8024, 66: 8100, 67: 8175, 68: 8250, 69: 8326, 70: 8401, 71: 8960, 72: 9035, 73: 9111, 74: 9186, 75: 9261, 76: 9337, 77: 9412, 78: 9487, 79: 9562, 80: 9638, 81: 10197, 82: 10272, 83: 10348, 84: 10423, 85: 10498, 86: 10573, 87: 10649, 88: 10724, 89: 10799, 90: 10875 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 61, 22: 62, 23: 63, 24: 65, 25: 66, 26: 68, 27: 69, 28: 71, 29: 72, 30: 74, 31: 75, 32: 77, 33: 78, 34: 80, 35: 81, 36: 83, 37: 84, 38: 86, 39: 87, 40: 88, 41: 99, 42: 101, 43: 102, 44: 104, 45: 105, 46: 107, 47: 108, 48: 110, 49: 111, 50: 113, 51: 127, 52: 128, 53: 130, 54: 131, 55: 133, 56: 134, 57: 136, 58: 137, 59: 138, 60: 140, 61: 151, 62: 152, 63: 154, 64: 155, 65: 157, 66: 158, 67: 160, 68: 161, 69: 163, 70: 164, 71: 175, 72: 176, 73: 178, 74: 179, 75: 181, 76: 182, 77: 184, 78: 185, 79: 187, 80: 188, 81: 199, 82: 201, 83: 202, 84: 204, 85: 205, 86: 207, 87: 208, 88: 209, 89: 211, 90: 212 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 67, 4: 71, 5: 76, 6: 81, 7: 86, 8: 90, 9: 95, 10: 100, 11: 104, 12: 109, 13: 114, 14: 119, 15: 123, 16: 128, 17: 133, 18: 138, 19: 142, 20: 147, 21: 194, 22: 199, 23: 204, 24: 209, 25: 213, 26: 218, 27: 223, 28: 228, 29: 232, 30: 237, 31: 242, 32: 246, 33: 251, 34: 256, 35: 261, 36: 265, 37: 270, 38: 275, 39: 280, 40: 284, 41: 319, 42: 324, 43: 329, 44: 333, 45: 338, 46: 343, 47: 348, 48: 352, 49: 357, 50: 362, 51: 407, 52: 412, 53: 417, 54: 421, 55: 426, 56: 431, 57: 435, 58: 440, 59: 445, 60: 450, 61: 485, 62: 489, 63: 494, 64: 499, 65: 504, 66: 508, 67: 513, 68: 518, 69: 523, 70: 527, 71: 562, 72: 567, 73: 572, 74: 577, 75: 581, 76: 586, 77: 591, 78: 595, 79: 600, 80: 605, 81: 640, 82: 645, 83: 649, 84: 654, 85: 659, 86: 664, 87: 668, 88: 673, 89: 678, 90: 683 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 212,
    hp: 10875,
    def: 683,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "traveler-f-dendro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-dendro-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44462, 0.48081, 0.517, 0.5687, 0.60489, 0.64625, 0.70312, 0.75999, 0.81686, 0.8789, 0.94094, 1.00298, 1.06502, 1.12706, 1.1891]) },
            ],
          },
        ],
      },
      {
        id: "traveler-f-dendro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-dendro-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4343, 0.46965, 0.505, 0.5555, 0.59085, 0.63125, 0.6868, 0.74235, 0.7979, 0.8585, 0.9191, 0.9797, 1.0403, 1.1009, 1.1615]) },
            ],
          },
        ],
      },
      {
        id: "traveler-f-dendro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-dendro-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.52976, 0.57288, 0.616, 0.6776, 0.72072, 0.77, 0.83776, 0.90552, 0.97328, 1.0472, 1.12112, 1.19504, 1.26896, 1.34288, 1.4168]) },
            ],
          },
        ],
      },
      {
        id: "traveler-f-dendro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-dendro-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.58308, 0.63054, 0.678, 0.7458, 0.79326, 0.8475, 0.92208, 0.99666, 1.07124, 1.1526, 1.23396, 1.31532, 1.39668, 1.47804, 1.5594]) },
            ],
          },
        ],
      },
      {
        id: "traveler-f-dendro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-dendro-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70778, 0.76539, 0.823, 0.9053, 0.96291, 1.02875, 1.11928, 1.20981, 1.30034, 1.3991, 1.49786, 1.59662, 1.69538, 1.79414, 1.8929]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "traveler-f-dendro-charged",
      name: "Foreign Fieldcleaver",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-dendro-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.559, 0.6045, 0.65, 0.715, 0.7605, 0.8125, 0.884, 0.9555, 1.027, 1.105, 1.183, 1.261, 1.339, 1.417, 1.495]) },
            { stat: "atk", table: talentTable([0.7224, 0.7812, 0.84, 0.924, 0.9828, 1.05, 1.1424, 1.2348, 1.3272, 1.428, 1.5288, 1.6296, 1.7304, 1.8312, 1.932]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "traveler-f-dendro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-dendro-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "traveler-f-dendro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-dendro-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "traveler-f-dendro-skill",
      name: "Razorgrass Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-dendro-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.304, 2.4768, 2.6496, 2.88, 3.0528, 3.2256, 3.456, 3.6864, 3.9168, 4.1472, 4.3776, 4.608, 4.896, 5.184, 5.472]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-dendro-burst",
      name: "Surgent Manifestation",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-f-dendro-burst-1",
          name: "Lea Lotus Lamp Attack DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.8016, 0.86172, 0.92184, 1.002, 1.06212, 1.12224, 1.2024, 1.28256, 1.36272, 1.44288, 1.52304, 1.6032, 1.7034, 1.8036, 1.9038]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "traveler-f-dendro-burst-2",
          name: "Explosion DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([4.008, 4.3086, 4.6092, 5.01, 5.3106, 5.6112, 6.012, 6.4128, 6.8136, 7.2144, 7.6152, 8.016, 8.517, 9.018, 9.519]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-dendro-a1", name: "Verdant Overgrowth", unlockAscension: 1, effects: [] },
    { id: "traveler-f-dendro-a4", name: "Verdant Luxury", unlockAscension: 4, effects: [] },
    { id: "traveler-f-dendro-p3", name: "Foreign Verdalume", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-dendro-c1", name: "Symbiotic Creeper", effects: [] },
    { level: 2, id: "traveler-f-dendro-c2", name: "Green Resilience", effects: [] },
    { level: 3, id: "traveler-f-dendro-c3", name: "Whirling Weeds", effects: [], buffs: [{ id: "traveler-f-dendro-c3", source: "Whirling Weeds", sourceCharacterId: "traveler-f-dendro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-f-dendro-c4", name: "Treacle Grass", effects: [] },
    { level: 5, id: "traveler-f-dendro-c5", name: "Viridian Transience", effects: [], buffs: [{ id: "traveler-f-dendro-c5", source: "Viridian Transience", sourceCharacterId: "traveler-f-dendro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-f-dendro-c6", name: "Withering Aggregation", effects: [] },
  ],
  resources: [],
};

export const travelerMDendro: GeneratedCharacter = {
  id: "traveler-m-dendro",
  name: "Traveler",
  element: "dendro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 912, 2: 987, 3: 1062, 4: 1138, 5: 1213, 6: 1288, 7: 1363, 8: 1439, 9: 1514, 10: 1589, 11: 1665, 12: 1740, 13: 1815, 14: 1890, 15: 1966, 16: 2042, 17: 2116, 18: 2192, 19: 2267, 20: 2342, 21: 3098, 22: 3174, 23: 3250, 24: 3324, 25: 3400, 26: 3475, 27: 3551, 28: 3625, 29: 3701, 30: 3776, 31: 3851, 32: 3927, 33: 4002, 34: 4078, 35: 4152, 36: 4228, 37: 4303, 38: 4378, 39: 4454, 40: 4529, 41: 5089, 42: 5163, 43: 5239, 44: 5314, 45: 5389, 46: 5465, 47: 5540, 48: 5616, 49: 5690, 50: 5766, 51: 6486, 52: 6562, 53: 6637, 54: 6712, 55: 6788, 56: 6863, 57: 6938, 58: 7013, 59: 7089, 60: 7164, 61: 7723, 62: 7799, 63: 7874, 64: 7949, 65: 8024, 66: 8100, 67: 8175, 68: 8250, 69: 8326, 70: 8401, 71: 8960, 72: 9035, 73: 9111, 74: 9186, 75: 9261, 76: 9337, 77: 9412, 78: 9487, 79: 9562, 80: 9638, 81: 10197, 82: 10272, 83: 10348, 84: 10423, 85: 10498, 86: 10573, 87: 10649, 88: 10724, 89: 10799, 90: 10875 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 61, 22: 62, 23: 63, 24: 65, 25: 66, 26: 68, 27: 69, 28: 71, 29: 72, 30: 74, 31: 75, 32: 77, 33: 78, 34: 80, 35: 81, 36: 83, 37: 84, 38: 86, 39: 87, 40: 88, 41: 99, 42: 101, 43: 102, 44: 104, 45: 105, 46: 107, 47: 108, 48: 110, 49: 111, 50: 113, 51: 127, 52: 128, 53: 130, 54: 131, 55: 133, 56: 134, 57: 136, 58: 137, 59: 138, 60: 140, 61: 151, 62: 152, 63: 154, 64: 155, 65: 157, 66: 158, 67: 160, 68: 161, 69: 163, 70: 164, 71: 175, 72: 176, 73: 178, 74: 179, 75: 181, 76: 182, 77: 184, 78: 185, 79: 187, 80: 188, 81: 199, 82: 201, 83: 202, 84: 204, 85: 205, 86: 207, 87: 208, 88: 209, 89: 211, 90: 212 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 67, 4: 71, 5: 76, 6: 81, 7: 86, 8: 90, 9: 95, 10: 100, 11: 104, 12: 109, 13: 114, 14: 119, 15: 123, 16: 128, 17: 133, 18: 138, 19: 142, 20: 147, 21: 194, 22: 199, 23: 204, 24: 209, 25: 213, 26: 218, 27: 223, 28: 228, 29: 232, 30: 237, 31: 242, 32: 246, 33: 251, 34: 256, 35: 261, 36: 265, 37: 270, 38: 275, 39: 280, 40: 284, 41: 319, 42: 324, 43: 329, 44: 333, 45: 338, 46: 343, 47: 348, 48: 352, 49: 357, 50: 362, 51: 407, 52: 412, 53: 417, 54: 421, 55: 426, 56: 431, 57: 435, 58: 440, 59: 445, 60: 450, 61: 485, 62: 489, 63: 494, 64: 499, 65: 504, 66: 508, 67: 513, 68: 518, 69: 523, 70: 527, 71: 562, 72: 567, 73: 572, 74: 577, 75: 581, 76: 586, 77: 591, 78: 595, 79: 600, 80: 605, 81: 640, 82: 645, 83: 649, 84: 654, 85: 659, 86: 664, 87: 668, 88: 673, 89: 678, 90: 683 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 212,
    hp: 10875,
    def: 683,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "traveler-m-dendro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-dendro-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44462, 0.48081, 0.517, 0.5687, 0.60489, 0.64625, 0.70312, 0.75999, 0.81686, 0.8789, 0.94094, 1.00298, 1.06502, 1.12706, 1.1891]) },
            ],
          },
        ],
      },
      {
        id: "traveler-m-dendro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-dendro-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4343, 0.46965, 0.505, 0.5555, 0.59085, 0.63125, 0.6868, 0.74235, 0.7979, 0.8585, 0.9191, 0.9797, 1.0403, 1.1009, 1.1615]) },
            ],
          },
        ],
      },
      {
        id: "traveler-m-dendro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-dendro-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.52976, 0.57288, 0.616, 0.6776, 0.72072, 0.77, 0.83776, 0.90552, 0.97328, 1.0472, 1.12112, 1.19504, 1.26896, 1.34288, 1.4168]) },
            ],
          },
        ],
      },
      {
        id: "traveler-m-dendro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-dendro-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.58308, 0.63054, 0.678, 0.7458, 0.79326, 0.8475, 0.92208, 0.99666, 1.07124, 1.1526, 1.23396, 1.31532, 1.39668, 1.47804, 1.5594]) },
            ],
          },
        ],
      },
      {
        id: "traveler-m-dendro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-dendro-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70778, 0.76539, 0.823, 0.9053, 0.96291, 1.02875, 1.11928, 1.20981, 1.30034, 1.3991, 1.49786, 1.59662, 1.69538, 1.79414, 1.8929]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "traveler-m-dendro-charged",
      name: "Foreign Fieldcleaver",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-dendro-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.559, 0.6045, 0.65, 0.715, 0.7605, 0.8125, 0.884, 0.9555, 1.027, 1.105, 1.183, 1.261, 1.339, 1.417, 1.495]) },
            { stat: "atk", table: talentTable([0.60716, 0.65658, 0.706, 0.7766, 0.82602, 0.8825, 0.96016, 1.03782, 1.11548, 1.2002, 1.28492, 1.36964, 1.45436, 1.53908, 1.6238]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "traveler-m-dendro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-dendro-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "traveler-m-dendro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-dendro-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "traveler-m-dendro-skill",
      name: "Razorgrass Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-dendro-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([2.304, 2.4768, 2.6496, 2.88, 3.0528, 3.2256, 3.456, 3.6864, 3.9168, 4.1472, 4.3776, 4.608, 4.896, 5.184, 5.472]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-dendro-burst",
      name: "Surgent Manifestation",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-m-dendro-burst-1",
          name: "Lea Lotus Lamp Attack DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.8016, 0.86172, 0.92184, 1.002, 1.06212, 1.12224, 1.2024, 1.28256, 1.36272, 1.44288, 1.52304, 1.6032, 1.7034, 1.8036, 1.9038]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "traveler-m-dendro-burst-2",
          name: "Explosion DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([4.008, 4.3086, 4.6092, 5.01, 5.3106, 5.6112, 6.012, 6.4128, 6.8136, 7.2144, 7.6152, 8.016, 8.517, 9.018, 9.519]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-dendro-a1", name: "Verdant Overgrowth", unlockAscension: 1, effects: [] },
    { id: "traveler-m-dendro-a4", name: "Verdant Luxury", unlockAscension: 4, effects: [] },
    { id: "traveler-m-dendro-p3", name: "Foreign Verdalume", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-dendro-c1", name: "Symbiotic Creeper", effects: [] },
    { level: 2, id: "traveler-m-dendro-c2", name: "Green Resilience", effects: [] },
    { level: 3, id: "traveler-m-dendro-c3", name: "Whirling Weeds", effects: [], buffs: [{ id: "traveler-m-dendro-c3", source: "Whirling Weeds", sourceCharacterId: "traveler-m-dendro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-m-dendro-c4", name: "Treacle Grass", effects: [] },
    { level: 5, id: "traveler-m-dendro-c5", name: "Viridian Transience", effects: [], buffs: [{ id: "traveler-m-dendro-c5", source: "Viridian Transience", sourceCharacterId: "traveler-m-dendro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-m-dendro-c6", name: "Withering Aggregation", effects: [] },
  ],
  resources: [],
};

export const yaoyao: GeneratedCharacter = {
  id: "yaoyao",
  name: "Yaoyao",
  element: "dendro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1030, 2: 1116, 3: 1200, 4: 1286, 5: 1370, 6: 1456, 7: 1540, 8: 1626, 9: 1711, 10: 1796, 11: 1881, 12: 1966, 13: 2051, 14: 2136, 15: 2221, 16: 2307, 17: 2391, 18: 2477, 19: 2561, 20: 2647, 21: 3501, 22: 3587, 23: 3672, 24: 3757, 25: 3842, 26: 3927, 27: 4012, 28: 4097, 29: 4182, 30: 4267, 31: 4352, 32: 4438, 33: 4522, 34: 4608, 35: 4692, 36: 4778, 37: 4862, 38: 4948, 39: 5033, 40: 5118, 41: 5750, 42: 5835, 43: 5920, 44: 6005, 45: 6090, 46: 6176, 47: 6260, 48: 6346, 49: 6430, 50: 6516, 51: 7329, 52: 7415, 53: 7500, 54: 7585, 55: 7670, 56: 7755, 57: 7840, 58: 7925, 59: 8010, 60: 8096, 61: 8727, 62: 8813, 63: 8897, 64: 8983, 65: 9067, 66: 9153, 67: 9238, 68: 9323, 69: 9408, 70: 9493, 71: 10125, 72: 10210, 73: 10295, 74: 10381, 75: 10465, 76: 10551, 77: 10635, 78: 10721, 79: 10805, 80: 10891, 81: 11523, 82: 11608, 83: 11693, 84: 11778, 85: 11863, 86: 11948, 87: 12033, 88: 12118, 89: 12203, 90: 12289 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 61, 22: 62, 23: 63, 24: 65, 25: 66, 26: 68, 27: 69, 28: 71, 29: 72, 30: 74, 31: 75, 32: 77, 33: 78, 34: 80, 35: 81, 36: 83, 37: 84, 38: 86, 39: 87, 40: 88, 41: 99, 42: 101, 43: 102, 44: 104, 45: 105, 46: 107, 47: 108, 48: 110, 49: 111, 50: 113, 51: 127, 52: 128, 53: 130, 54: 131, 55: 133, 56: 134, 57: 136, 58: 137, 59: 138, 60: 140, 61: 151, 62: 152, 63: 154, 64: 155, 65: 157, 66: 158, 67: 160, 68: 161, 69: 163, 70: 164, 71: 175, 72: 176, 73: 178, 74: 179, 75: 181, 76: 182, 77: 184, 78: 185, 79: 187, 80: 188, 81: 199, 82: 201, 83: 202, 84: 204, 85: 205, 86: 207, 87: 208, 88: 209, 89: 211, 90: 212 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 79, 5: 84, 6: 89, 7: 94, 8: 99, 9: 105, 10: 110, 11: 115, 12: 120, 13: 125, 14: 130, 15: 136, 16: 141, 17: 146, 18: 151, 19: 156, 20: 162, 21: 214, 22: 219, 23: 224, 24: 230, 25: 235, 26: 240, 27: 245, 28: 250, 29: 256, 30: 261, 31: 266, 32: 271, 33: 276, 34: 282, 35: 287, 36: 292, 37: 297, 38: 302, 39: 308, 40: 313, 41: 351, 42: 356, 43: 362, 44: 367, 45: 372, 46: 377, 47: 382, 48: 388, 49: 393, 50: 398, 51: 448, 52: 453, 53: 458, 54: 463, 55: 469, 56: 474, 57: 479, 58: 484, 59: 489, 60: 495, 61: 533, 62: 538, 63: 544, 64: 549, 65: 554, 66: 559, 67: 564, 68: 570, 69: 575, 70: 580, 71: 619, 72: 624, 73: 629, 74: 634, 75: 639, 76: 645, 77: 650, 78: 655, 79: 660, 80: 665, 81: 704, 82: 709, 83: 714, 84: 720, 85: 725, 86: 730, 87: 735, 88: 740, 89: 746, 90: 751 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 212,
    hp: 12289,
    def: 751,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "yaoyao-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yaoyao-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.510014, 0.551527, 0.59304, 0.652344, 0.693857, 0.7413, 0.806534, 0.871769, 0.937003, 1.008168, 1.079333, 1.150498, 1.221662, 1.292827, 1.363992]) },
            ],
          },
        ],
      },
      {
        id: "yaoyao-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yaoyao-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.474428, 0.513044, 0.55166, 0.606826, 0.645442, 0.689575, 0.750258, 0.81094, 0.871623, 0.937822, 1.004021, 1.07022, 1.13642, 1.202619, 1.268818]) },
            ],
          },
        ],
      },
      {
        id: "yaoyao-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yaoyao-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.313771, 0.339311, 0.36485, 0.401335, 0.426874, 0.456063, 0.496196, 0.53633, 0.576463, 0.620245, 0.664027, 0.707809, 0.751591, 0.795373, 0.839155]) },
              { stat: "atk", table: talentTable([0.329457, 0.356274, 0.38309, 0.421399, 0.448215, 0.478862, 0.521002, 0.563142, 0.605282, 0.651253, 0.697224, 0.743195, 0.789165, 0.835136, 0.881107]) },
            ],
          },
        ],
      },
      {
        id: "yaoyao-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yaoyao-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.779315, 0.842747, 0.90618, 0.996798, 1.060231, 1.132725, 1.232405, 1.332085, 1.431764, 1.540506, 1.649248, 1.757989, 1.866731, 1.975472, 2.084214]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yaoyao-charged",
      name: "Toss 'N' Turn Spear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yaoyao-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.1266, 1.2183, 1.31, 1.441, 1.5327, 1.6375, 1.7816, 1.9257, 2.0698, 2.227, 2.3842, 2.5414, 2.6986, 2.8558, 3.013]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "yaoyao-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yaoyao-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "yaoyao-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yaoyao-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "yaoyao-skill",
      name: "Raphanus Sky Cluster",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 1, element: "dendro" },
      instances: [
        {
          id: "yaoyao-skill-1",
          name: "White Jade Radish DMG",
          damageType: "skill",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.2992, 0.32164, 0.34408, 0.374, 0.39644, 0.41888, 0.4488, 0.47872, 0.50864, 0.53856, 0.56848, 0.5984, 0.6358, 0.6732, 0.7106]) },
          ],
          application: { element: "dendro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yaoyao-burst",
      name: "Moonjade Descent",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "yaoyao-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([1.1456, 1.23152, 1.31744, 1.432, 1.51792, 1.60384, 1.7184, 1.83296, 1.94752, 2.06208, 2.17664, 2.2912, 2.4344, 2.5776, 2.7208]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
        {
          id: "yaoyao-burst-2",
          name: "Adeptal Legacy White Jade Radish DMG",
          damageType: "burst",
          element: "dendro",
          scaling: [
            { stat: "atk", table: talentTable([0.7216, 0.77572, 0.82984, 0.902, 0.95612, 1.01024, 1.0824, 1.15456, 1.22672, 1.29888, 1.37104, 1.4432, 1.5334, 1.6236, 1.7138]) },
          ],
          application: { element: "dendro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yaoyao-a1", name: "Starscatter", unlockAscension: 1, effects: [] },
    { id: "yaoyao-a4", name: "In Others' Shoes", unlockAscension: 4, effects: [] },
    { id: "yaoyao-p3", name: "Tailing on Tiptoes", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yaoyao-c1", name: "Adeptus' Tutelage", effects: [] },
    { level: 2, id: "yaoyao-c2", name: "Innocent", effects: [] },
    { level: 3, id: "yaoyao-c3", name: "Loyal and Kind", effects: [], buffs: [{ id: "yaoyao-c3", source: "Loyal and Kind", sourceCharacterId: "yaoyao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "yaoyao-c4", name: "Winsome", effects: [] },
    { level: 5, id: "yaoyao-c5", name: "Compassionate", effects: [], buffs: [{ id: "yaoyao-c5", source: "Compassionate", sourceCharacterId: "yaoyao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "yaoyao-c6", name: "Beneficent", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   alhaitham.castTime: cast times are engine defaults, not sourced
//   alhaitham.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   alhaitham.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   baizhu.castTime: cast times are engine defaults, not sourced
//   baizhu.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   baizhu.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   collei.castTime: cast times are engine defaults, not sourced
//   collei.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   collei.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   emilie.castTime: cast times are engine defaults, not sourced
//   emilie.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   emilie.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kaveh.castTime: cast times are engine defaults, not sourced
//   kaveh.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   kaveh.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kinich.castTime: cast times are engine defaults, not sourced
//   kinich.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   kinich.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kirara.castTime: cast times are engine defaults, not sourced
//   kirara.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   kirara.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lauma.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   lauma.castTime: cast times are engine defaults, not sourced
//   lauma.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   lauma.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   nahida.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   nahida.castTime: cast times are engine defaults, not sourced
//   nahida.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   nahida.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   nefer.castTime: cast times are engine defaults, not sourced
//   nefer.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   nefer.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   tighnari.castTime: cast times are engine defaults, not sourced
//   tighnari.constellations: 3 modelled, 3 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   tighnari.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFDendro.castTime: cast times are engine defaults, not sourced
//   travelerFDendro.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   travelerFDendro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFDendro.skill.particles: skill particle yield not published by either source
//   travelerMDendro.castTime: cast times are engine defaults, not sourced
//   travelerMDendro.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   travelerMDendro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMDendro.skill.particles: skill particle yield not published by either source
//   yaoyao.castTime: cast times are engine defaults, not sourced
//   yaoyao.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   yaoyao.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const dendroGeneratedCharacters: readonly GeneratedCharacter[] = [
  alhaitham,
  baizhu,
  collei,
  emilie,
  kaveh,
  kinich,
  kirara,
  lauma,
  nahida,
  nefer,
  tighnari,
  travelerFDendro,
  travelerMDendro,
  yaoyao,
];
