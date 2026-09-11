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


export const alyosha: GeneratedCharacter = {
  id: "alyosha",
  name: "Alyosha",
  element: "electro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1003, 2: 1086, 3: 1168, 4: 1252, 5: 1334, 6: 1417, 7: 1499, 8: 1583, 9: 1666, 10: 1748, 11: 1831, 12: 1914, 13: 1997, 14: 2079, 15: 2162, 16: 2246, 17: 2328, 18: 2411, 19: 2493, 20: 2577, 21: 3408, 22: 3491, 23: 3575, 24: 3657, 25: 3740, 26: 3822, 27: 3906, 28: 3988, 29: 4071, 30: 4153, 31: 4237, 32: 4320, 33: 4402, 34: 4485, 35: 4568, 36: 4651, 37: 4733, 38: 4816, 39: 4900, 40: 4982, 41: 5597, 42: 5680, 43: 5763, 44: 5845, 45: 5928, 46: 6012, 47: 6094, 48: 6177, 49: 6259, 50: 6343, 51: 7135, 52: 7218, 53: 7301, 54: 7383, 55: 7467, 56: 7549, 57: 7632, 58: 7714, 59: 7798, 60: 7881, 61: 8496, 62: 8579, 63: 8661, 64: 8744, 65: 8827, 66: 8910, 67: 8993, 68: 9075, 69: 9159, 70: 9241, 71: 9856, 72: 9939, 73: 10022, 74: 10105, 75: 10187, 76: 10271, 77: 10353, 78: 10436, 79: 10518, 80: 10602, 81: 11217, 82: 11299, 83: 11383, 84: 11465, 85: 11548, 86: 11630, 87: 11714, 88: 11796, 89: 11879, 90: 11962 } },
    atk: { byLevel: { 1: 22, 2: 24, 3: 26, 4: 28, 5: 30, 6: 31, 7: 33, 8: 35, 9: 37, 10: 39, 11: 41, 12: 42, 13: 44, 14: 46, 15: 48, 16: 50, 17: 52, 18: 54, 19: 55, 20: 57, 21: 76, 22: 77, 23: 79, 24: 81, 25: 83, 26: 85, 27: 87, 28: 89, 29: 90, 30: 92, 31: 94, 32: 96, 33: 98, 34: 100, 35: 101, 36: 103, 37: 105, 38: 107, 39: 109, 40: 111, 41: 124, 42: 126, 43: 128, 44: 130, 45: 132, 46: 133, 47: 135, 48: 137, 49: 139, 50: 141, 51: 158, 52: 160, 53: 162, 54: 164, 55: 166, 56: 168, 57: 169, 58: 171, 59: 173, 60: 175, 61: 189, 62: 190, 63: 192, 64: 194, 65: 196, 66: 198, 67: 200, 68: 201, 69: 203, 70: 205, 71: 219, 72: 221, 73: 222, 74: 224, 75: 226, 76: 228, 77: 230, 78: 232, 79: 233, 80: 235, 81: 249, 82: 251, 83: 253, 84: 254, 85: 256, 86: 258, 87: 260, 88: 262, 89: 264, 90: 265 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 78, 6: 83, 7: 88, 8: 93, 9: 98, 10: 103, 11: 108, 12: 112, 13: 117, 14: 122, 15: 127, 16: 132, 17: 137, 18: 142, 19: 147, 20: 151, 21: 200, 22: 205, 23: 210, 24: 215, 25: 220, 26: 225, 27: 230, 28: 234, 29: 239, 30: 244, 31: 249, 32: 254, 33: 259, 34: 264, 35: 268, 36: 273, 37: 278, 38: 283, 39: 288, 40: 293, 41: 329, 42: 334, 43: 339, 44: 344, 45: 348, 46: 353, 47: 358, 48: 363, 49: 368, 50: 373, 51: 419, 52: 424, 53: 429, 54: 434, 55: 439, 56: 444, 57: 449, 58: 453, 59: 458, 60: 463, 61: 499, 62: 504, 63: 509, 64: 514, 65: 519, 66: 524, 67: 528, 68: 533, 69: 538, 70: 543, 71: 579, 72: 584, 73: 589, 74: 594, 75: 599, 76: 604, 77: 608, 78: 613, 79: 618, 80: 623, 81: 659, 82: 664, 83: 669, 84: 674, 85: 679, 86: 683, 87: 688, 88: 693, 89: 698, 90: 703 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.267],
  },
  baseStats: {
    atk: 265,
    hp: 11962,
    def: 703,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1.267,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "alyosha-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alyosha-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.47816, 0.51708, 0.556, 0.6116, 0.65052, 0.695, 0.75616, 0.81732, 0.87848, 0.9452, 1.01192, 1.07864, 1.14536, 1.21208, 1.2788]) },
            ],
          },
        ],
      },
      {
        id: "alyosha-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alyosha-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4816, 0.5208, 0.56, 0.616, 0.6552, 0.7, 0.7616, 0.8232, 0.8848, 0.952, 1.0192, 1.0864, 1.1536, 1.2208, 1.288]) },
            ],
          },
        ],
      },
      {
        id: "alyosha-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alyosha-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.34228, 0.37014, 0.398, 0.4378, 0.46566, 0.4975, 0.54128, 0.58506, 0.62884, 0.6766, 0.72436, 0.77212, 0.81988, 0.86764, 0.9154]) },
              { stat: "atk", table: talentTable([0.3182, 0.3441, 0.37, 0.407, 0.4329, 0.4625, 0.5032, 0.5439, 0.5846, 0.629, 0.6734, 0.7178, 0.7622, 0.8066, 0.851]) },
            ],
          },
        ],
      },
      {
        id: "alyosha-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "alyosha-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.75852, 0.82026, 0.882, 0.9702, 1.03194, 1.1025, 1.19952, 1.29654, 1.39356, 1.4994, 1.60524, 1.71108, 1.81692, 1.92276, 2.0286]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "alyosha-charged",
      name: "Skirmishing Spear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alyosha-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.11026, 1.20063, 1.291, 1.4201, 1.51047, 1.61375, 1.75576, 1.89777, 2.03978, 2.1947, 2.34962, 2.50454, 2.65946, 2.81438, 2.9693]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "alyosha-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alyosha-plungeLow-1",
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
      id: "alyosha-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "alyosha-plungeHigh-1",
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
      id: "alyosha-skill",
      name: "Thunderbolt Strike",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 5, element: "electro" },
      instances: [
        {
          id: "alyosha-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.8672, 3.08224, 3.29728, 3.584, 3.79904, 4.01408, 4.3008, 4.58752, 4.87424, 5.16096, 5.44768, 5.7344, 6.0928, 6.4512, 6.8096]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "alyosha-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([3.584, 3.8528, 4.1216, 4.48, 4.7488, 5.0176, 5.376, 5.7344, 6.0928, 6.4512, 6.8096, 7.168, 7.616, 8.064, 8.512]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "alyosha-burst",
      name: "Hunter's Advance",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "alyosha-burst-1",
          name: "Fulgurite Hunting Field DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.7496, 0.80582, 0.86204, 0.937, 0.99322, 1.04944, 1.1244, 1.19936, 1.27432, 1.34928, 1.42424, 1.4992, 1.5929, 1.6866, 1.7803]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "alyosha-burst-2",
          name: "Tugarin DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.502232, 0.539899, 0.577567, 0.62779, 0.665457, 0.703125, 0.753348, 0.803571, 0.853794, 0.904018, 0.954241, 1.004464, 1.067243, 1.130022, 1.192801]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "alyosha-a1", name: "Awakened by the Baying Hounds", unlockAscension: 1, effects: [] },
    { id: "alyosha-a4", name: "Suffer the Winter Wheat Will", unlockAscension: 4, effects: [] },
    { id: "alyosha-p3", name: "Into the Fray", effects: [] },
    { id: "alyosha-p4", name: "Treetop Watch", effects: [] },
  ],
  constellations: [
    { level: 1, id: "alyosha-c1", name: "Frostvale Thunderclap", effects: [] },
    { level: 2, id: "alyosha-c2", name: "Howl From Afar", effects: [] },
    { level: 3, id: "alyosha-c3", name: "Friendly Call", effects: [], buffs: [{ id: "alyosha-c3", source: "Friendly Call", sourceCharacterId: "alyosha", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "alyosha-c4", name: "Harvest the Spoils", effects: [] },
    { level: 5, id: "alyosha-c5", name: "When the Nightbird Falls Silent", effects: [], buffs: [{ id: "alyosha-c5", source: "When the Nightbird Falls Silent", sourceCharacterId: "alyosha", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "alyosha-c6", name: "Standard Reclaimed", effects: [] },
  ],
  resources: [],
};

export const beidou: GeneratedCharacter = {
  id: "beidou",
  name: "Beidou",
  element: "electro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1094, 2: 1185, 3: 1275, 4: 1365, 5: 1455, 6: 1546, 7: 1636, 8: 1727, 9: 1817, 10: 1907, 11: 1998, 12: 2088, 13: 2178, 14: 2268, 15: 2359, 16: 2450, 17: 2540, 18: 2630, 19: 2720, 20: 2811, 21: 3718, 22: 3809, 23: 3900, 24: 3989, 25: 4080, 26: 4170, 27: 4261, 28: 4350, 29: 4441, 30: 4531, 31: 4622, 32: 4713, 33: 4802, 34: 4893, 35: 4983, 36: 5074, 37: 5163, 38: 5254, 39: 5345, 40: 5435, 41: 6106, 42: 6196, 43: 6287, 44: 6377, 45: 6467, 46: 6558, 47: 6648, 48: 6739, 49: 6828, 50: 6919, 51: 7783, 52: 7874, 53: 7965, 54: 8055, 55: 8145, 56: 8235, 57: 8326, 58: 8416, 59: 8507, 60: 8597, 61: 9268, 62: 9359, 63: 9448, 64: 9539, 65: 9629, 66: 9720, 67: 9811, 68: 9900, 69: 9991, 70: 10081, 71: 10752, 72: 10842, 73: 10933, 74: 11024, 75: 11113, 76: 11204, 77: 11294, 78: 11385, 79: 11475, 80: 11565, 81: 12237, 82: 12327, 83: 12417, 84: 12507, 85: 12598, 86: 12688, 87: 12779, 88: 12868, 89: 12959, 90: 13050 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 38, 14: 39, 15: 41, 16: 42, 17: 44, 18: 45, 19: 47, 20: 48, 21: 64, 22: 66, 23: 67, 24: 69, 25: 70, 26: 72, 27: 74, 28: 75, 29: 77, 30: 78, 31: 80, 32: 81, 33: 83, 34: 84, 35: 86, 36: 88, 37: 89, 38: 91, 39: 92, 40: 94, 41: 105, 42: 107, 43: 108, 44: 110, 45: 112, 46: 113, 47: 115, 48: 116, 49: 118, 50: 119, 51: 134, 52: 136, 53: 137, 54: 139, 55: 141, 56: 142, 57: 144, 58: 145, 59: 147, 60: 148, 61: 160, 62: 161, 63: 163, 64: 165, 65: 166, 66: 168, 67: 169, 68: 171, 69: 172, 70: 174, 71: 186, 72: 187, 73: 189, 74: 190, 75: 192, 76: 193, 77: 195, 78: 196, 79: 198, 80: 200, 81: 211, 82: 213, 83: 214, 84: 216, 85: 217, 86: 219, 87: 220, 88: 222, 89: 224, 90: 225 } },
    def: { byLevel: { 1: 54, 2: 59, 3: 63, 4: 68, 5: 72, 6: 77, 7: 81, 8: 86, 9: 90, 10: 95, 11: 99, 12: 104, 13: 108, 14: 113, 15: 117, 16: 122, 17: 126, 18: 131, 19: 135, 20: 140, 21: 185, 22: 189, 23: 194, 24: 198, 25: 203, 26: 207, 27: 212, 28: 216, 29: 221, 30: 225, 31: 230, 32: 234, 33: 239, 34: 243, 35: 248, 36: 252, 37: 257, 38: 261, 39: 266, 40: 270, 41: 303, 42: 308, 43: 312, 44: 317, 45: 321, 46: 326, 47: 330, 48: 335, 49: 339, 50: 344, 51: 387, 52: 391, 53: 396, 54: 400, 55: 405, 56: 409, 57: 414, 58: 418, 59: 423, 60: 427, 61: 460, 62: 465, 63: 469, 64: 474, 65: 478, 66: 483, 67: 487, 68: 492, 69: 496, 70: 501, 71: 534, 72: 539, 73: 543, 74: 548, 75: 552, 76: 557, 77: 561, 78: 566, 79: 570, 80: 575, 81: 608, 82: 612, 83: 617, 84: 621, 85: 626, 86: 630, 87: 635, 88: 639, 89: 644, 90: 648 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "electro",
  },
  baseStats: {
    atk: 225,
    hp: 13050,
    def: 648,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { electro: 0.24 },
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "beidou-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "beidou-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.71122, 0.76911, 0.827, 0.9097, 0.96759, 1.03375, 1.12472, 1.21569, 1.30666, 1.4059, 1.519613, 1.653338, 1.787064, 1.92079, 2.066673]) },
            ],
          },
        ],
      },
      {
        id: "beidou-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "beidou-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70864, 0.76632, 0.824, 0.9064, 0.96408, 1.03, 1.12064, 1.21128, 1.30192, 1.4008, 1.5141, 1.647341, 1.780582, 1.913822, 2.059176]) },
            ],
          },
        ],
      },
      {
        id: "beidou-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "beidou-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.88322, 0.95511, 1.027, 1.1297, 1.20159, 1.28375, 1.39672, 1.50969, 1.62266, 1.7459, 1.887112, 2.053178, 2.219244, 2.38531, 2.566473]) },
            ],
          },
        ],
      },
      {
        id: "beidou-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "beidou-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.86516, 0.93558, 1.006, 1.1066, 1.17702, 1.2575, 1.36816, 1.47882, 1.58948, 1.7102, 1.848525, 2.011195, 2.173865, 2.336536, 2.513994]) },
            ],
          },
        ],
      },
      {
        id: "beidou-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "beidou-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.12144, 1.21272, 1.304, 1.4344, 1.52568, 1.63, 1.77344, 1.91688, 2.06032, 2.2168, 2.3961, 2.606957, 2.817814, 3.02867, 3.258696]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "beidou-charged",
      name: "Oceanborne",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "beidou-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.56244, 0.60822, 0.654, 0.7194, 0.76518, 0.8175, 0.88944, 0.96138, 1.03332, 1.1118, 1.201725, 1.307477, 1.413229, 1.51898, 1.634346]) },
          ],
        },
        {
          id: "beidou-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.01824, 1.10112, 1.184, 1.3024, 1.38528, 1.48, 1.61024, 1.74048, 1.87072, 2.0128, 2.1756, 2.367053, 2.558506, 2.749958, 2.958816]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "beidou-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "beidou-plungeLow-1",
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
      id: "beidou-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "beidou-plungeHigh-1",
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
      id: "beidou-skill",
      name: "Tidecaller",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(7.5),
      energyCost: 0,
      particles: { count: 4, element: "electro" },
      instances: [
        {
          id: "beidou-skill-1",
          name: "Base DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.216, 1.3072, 1.3984, 1.52, 1.6112, 1.7024, 1.824, 1.9456, 2.0672, 2.1888, 2.3104, 2.432, 2.584, 2.736, 2.888]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "beidou-burst",
      name: "Stormbreaker",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "beidou-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.216, 1.3072, 1.3984, 1.52, 1.6112, 1.7024, 1.824, 1.9456, 2.0672, 2.1888, 2.3104, 2.432, 2.584, 2.736, 2.888]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "beidou-burst-2",
          name: "Lightning DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "beidou-a1", name: "Retribution", unlockAscension: 1, effects: [] },
    { id: "beidou-a4", name: "Lightning Storm", unlockAscension: 4, effects: [] },
    { id: "beidou-p3", name: "Conqueror of Tides", effects: [] },
    { id: "beidou-p4", name: "Polaris", effects: [] },
  ],
  constellations: [
    { level: 1, id: "beidou-c1", name: "Sea Beast's Scourge", effects: [] },
    { level: 2, id: "beidou-c2", name: "Upon the Turbulent Sea, the Thunder Arises", effects: [] },
    { level: 3, id: "beidou-c3", name: "Summoner of Storm", effects: [], buffs: [{ id: "beidou-c3", source: "Summoner of Storm", sourceCharacterId: "beidou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "beidou-c4", name: "Stunning Revenge", effects: [] },
    { level: 5, id: "beidou-c5", name: "Crimson Tidewalker", effects: [], buffs: [{ id: "beidou-c5", source: "Crimson Tidewalker", sourceCharacterId: "beidou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "beidou-c6", name: "Bane of Evil", effects: [] },
  ],
  resources: [],
};

export const clorinde: GeneratedCharacter = {
  id: "clorinde",
  name: "Clorinde",
  element: "electro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1009, 2: 1092, 3: 1176, 4: 1261, 5: 1344, 6: 1429, 7: 1513, 8: 1598, 9: 1682, 10: 1766, 11: 1851, 12: 1936, 13: 2020, 14: 2106, 15: 2191, 16: 2275, 17: 2361, 18: 2446, 19: 2532, 20: 2616, 21: 3567, 22: 3653, 23: 3738, 24: 3824, 25: 3910, 26: 3997, 27: 4082, 28: 4168, 29: 4255, 30: 4340, 31: 4427, 32: 4514, 33: 4601, 34: 4686, 35: 4773, 36: 4861, 37: 4948, 38: 5034, 39: 5121, 40: 5209, 41: 5910, 42: 5998, 43: 6086, 44: 6172, 45: 6260, 46: 6348, 47: 6436, 48: 6523, 49: 6612, 50: 6700, 51: 7607, 52: 7696, 53: 7783, 54: 7872, 55: 7961, 56: 8050, 57: 8138, 58: 8227, 59: 8316, 60: 8405, 61: 9108, 62: 9197, 63: 9286, 64: 9375, 65: 9465, 66: 9555, 67: 9643, 68: 9733, 69: 9823, 70: 9913, 71: 10617, 72: 10708, 73: 10798, 74: 10887, 75: 10978, 76: 11068, 77: 11159, 78: 11249, 79: 11340, 80: 11431, 81: 12136, 82: 12227, 83: 12318, 84: 12408, 85: 12499, 86: 12591, 87: 12682, 88: 12774, 89: 12865, 90: 12956 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 31, 4: 33, 5: 35, 6: 37, 7: 39, 8: 42, 9: 44, 10: 46, 11: 48, 12: 50, 13: 53, 14: 55, 15: 57, 16: 59, 17: 61, 18: 64, 19: 66, 20: 68, 21: 93, 22: 95, 23: 97, 24: 100, 25: 102, 26: 104, 27: 106, 28: 108, 29: 111, 30: 113, 31: 115, 32: 117, 33: 120, 34: 122, 35: 124, 36: 127, 37: 129, 38: 131, 39: 133, 40: 136, 41: 154, 42: 156, 43: 158, 44: 161, 45: 163, 46: 165, 47: 168, 48: 170, 49: 172, 50: 174, 51: 198, 52: 200, 53: 203, 54: 205, 55: 207, 56: 210, 57: 212, 58: 214, 59: 216, 60: 219, 61: 237, 62: 239, 63: 242, 64: 244, 65: 246, 66: 249, 67: 251, 68: 253, 69: 256, 70: 258, 71: 276, 72: 279, 73: 281, 74: 283, 75: 286, 76: 288, 77: 290, 78: 293, 79: 295, 80: 298, 81: 316, 82: 318, 83: 321, 84: 323, 85: 325, 86: 328, 87: 330, 88: 332, 89: 335, 90: 337 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 133, 16: 138, 17: 143, 18: 148, 19: 153, 20: 158, 21: 216, 22: 221, 23: 226, 24: 231, 25: 237, 26: 242, 27: 247, 28: 252, 29: 257, 30: 263, 31: 268, 32: 273, 33: 278, 34: 284, 35: 289, 36: 294, 37: 299, 38: 305, 39: 310, 40: 315, 41: 358, 42: 363, 43: 368, 44: 373, 45: 379, 46: 384, 47: 389, 48: 395, 49: 400, 50: 405, 51: 460, 52: 466, 53: 471, 54: 476, 55: 482, 56: 487, 57: 492, 58: 498, 59: 503, 60: 509, 61: 551, 62: 556, 63: 562, 64: 567, 65: 573, 66: 578, 67: 583, 68: 589, 69: 594, 70: 600, 71: 642, 72: 648, 73: 653, 74: 659, 75: 664, 76: 670, 77: 675, 78: 681, 79: 686, 80: 692, 81: 734, 82: 740, 83: 745, 84: 751, 85: 756, 86: 762, 87: 767, 88: 773, 89: 778, 90: 784 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 337,
    hp: 12956,
    def: 784,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "clorinde-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "clorinde-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.540596, 0.584598, 0.6286, 0.69146, 0.735462, 0.78575, 0.854896, 0.924042, 0.993188, 1.06862, 1.144052, 1.219484, 1.294916, 1.370348, 1.44578]) },
            ],
          },
        ],
      },
      {
        id: "clorinde-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "clorinde-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.516284, 0.558307, 0.60033, 0.660363, 0.702386, 0.750413, 0.816449, 0.882485, 0.948521, 1.020561, 1.092601, 1.16464, 1.23668, 1.308719, 1.380759]) },
            ],
          },
        ],
      },
      {
        id: "clorinde-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "clorinde-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.34185, 0.369675, 0.3975, 0.43725, 0.465075, 0.496875, 0.5406, 0.584325, 0.62805, 0.67575, 0.72345, 0.77115, 0.81885, 0.86655, 0.91425]) },
              { stat: "atk", table: talentTable([0.34185, 0.369675, 0.3975, 0.43725, 0.465075, 0.496875, 0.5406, 0.584325, 0.62805, 0.67575, 0.72345, 0.77115, 0.81885, 0.86655, 0.91425]) },
            ],
          },
        ],
      },
      {
        id: "clorinde-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "clorinde-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.23134, 0.25017, 0.269, 0.2959, 0.31473, 0.33625, 0.36584, 0.39543, 0.42502, 0.4573, 0.48958, 0.52186, 0.55414, 0.58642, 0.6187]) },
              { stat: "atk", table: talentTable([0.23134, 0.25017, 0.269, 0.2959, 0.31473, 0.33625, 0.36584, 0.39543, 0.42502, 0.4573, 0.48958, 0.52186, 0.55414, 0.58642, 0.6187]) },
              { stat: "atk", table: talentTable([0.23134, 0.25017, 0.269, 0.2959, 0.31473, 0.33625, 0.36584, 0.39543, 0.42502, 0.4573, 0.48958, 0.52186, 0.55414, 0.58642, 0.6187]) },
            ],
          },
        ],
      },
      {
        id: "clorinde-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "clorinde-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.900102, 0.973366, 1.04663, 1.151293, 1.224557, 1.308288, 1.423417, 1.538546, 1.653675, 1.779271, 1.904867, 2.030462, 2.156058, 2.281653, 2.407249]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "clorinde-charged",
      name: "Oath of Hunting Shadows",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "clorinde-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.2814, 1.3857, 1.49, 1.639, 1.7433, 1.8625, 2.0264, 2.1903, 2.3542, 2.533, 2.7118, 2.8906, 3.0694, 3.2482, 3.427]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "clorinde-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "clorinde-plungeLow-1",
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
      id: "clorinde-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "clorinde-plungeHigh-1",
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
      id: "clorinde-skill",
      name: "Hunter's Vigil",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "clorinde-skill-1",
          name: "Swift Hunt DMG (1)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.267632, 0.289416, 0.3112, 0.34232, 0.364104, 0.389, 0.423232, 0.457464, 0.491696, 0.52904, 0.566384, 0.603728, 0.641072, 0.678416, 0.71576]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-2",
          name: "Swift Hunt DMG (2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.38786, 0.41943, 0.451, 0.4961, 0.52767, 0.56375, 0.61336, 0.66297, 0.71258, 0.7667, 0.82082, 0.87494, 0.92906, 0.98318, 1.0373]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-3",
          name: "Impale the Night DMG (1)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.329724, 0.356562, 0.3834, 0.42174, 0.448578, 0.47925, 0.521424, 0.563598, 0.605772, 0.65178, 0.697788, 0.743796, 0.789804, 0.835812, 0.88182]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-4",
          name: "Impale the Night DMG (2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.439632, 0.475416, 0.5112, 0.56232, 0.598104, 0.639, 0.695232, 0.751464, 0.807696, 0.86904, 0.930384, 0.991728, 1.053072, 1.114416, 1.17576]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-5-1",
          name: "Impale the Night DMG (3) (1/3)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.25112, 0.27156, 0.292, 0.3212, 0.34164, 0.365, 0.39712, 0.42924, 0.46136, 0.4964, 0.53144, 0.56648, 0.60152, 0.63656, 0.6716]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-5-2",
          name: "Impale the Night DMG (3) (2/3)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.25112, 0.27156, 0.292, 0.3212, 0.34164, 0.365, 0.39712, 0.42924, 0.46136, 0.4964, 0.53144, 0.56648, 0.60152, 0.63656, 0.6716]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-5-3",
          name: "Impale the Night DMG (3) (3/3)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.25112, 0.27156, 0.292, 0.3212, 0.34164, 0.365, 0.39712, 0.42924, 0.46136, 0.4964, 0.53144, 0.56648, 0.60152, 0.63656, 0.6716]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "clorinde-skill-6",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.432, 0.4644, 0.4968, 0.54, 0.5724, 0.6048, 0.648, 0.6912, 0.7344, 0.7776, 0.8208, 0.864, 0.918, 0.972, 1.026]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "clorinde-burst",
      name: "Last Lightfall",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "clorinde-burst-1-1",
          name: "Skill DMG (1/5)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2688, 1.36396, 1.45912, 1.586, 1.68116, 1.77632, 1.9032, 2.03008, 2.15696, 2.28384, 2.41072, 2.5376, 2.6962, 2.8548, 3.0134]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "clorinde-burst-1-2",
          name: "Skill DMG (2/5)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2688, 1.36396, 1.45912, 1.586, 1.68116, 1.77632, 1.9032, 2.03008, 2.15696, 2.28384, 2.41072, 2.5376, 2.6962, 2.8548, 3.0134]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "clorinde-burst-1-3",
          name: "Skill DMG (3/5)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2688, 1.36396, 1.45912, 1.586, 1.68116, 1.77632, 1.9032, 2.03008, 2.15696, 2.28384, 2.41072, 2.5376, 2.6962, 2.8548, 3.0134]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "clorinde-burst-1-4",
          name: "Skill DMG (4/5)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2688, 1.36396, 1.45912, 1.586, 1.68116, 1.77632, 1.9032, 2.03008, 2.15696, 2.28384, 2.41072, 2.5376, 2.6962, 2.8548, 3.0134]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "clorinde-burst-1-5",
          name: "Skill DMG (5/5)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2688, 1.36396, 1.45912, 1.586, 1.68116, 1.77632, 1.9032, 2.03008, 2.15696, 2.28384, 2.41072, 2.5376, 2.6962, 2.8548, 3.0134]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "clorinde-a1", name: "Dark-Shattering Flame", unlockAscension: 1, effects: [] },
    { id: "clorinde-a4", name: "Lawful Remuneration", unlockAscension: 4, effects: [] },
    { id: "clorinde-p3", name: "Night Vigil's Harvest", effects: [] },
  ],
  constellations: [
    { level: 1, id: "clorinde-c1", name: "\"From This Day, I Pass the Candle's Shadow-Veil\"", effects: [] },
    { level: 2, id: "clorinde-c2", name: "\"Now, As We Face the Perils of the Long Night\"", effects: [] },
    { level: 3, id: "clorinde-c3", name: "\"I Pledge to Remember the Oath of Daylight\"", effects: [], buffs: [{ id: "clorinde-c3", source: "\"I Pledge to Remember the Oath of Daylight\"", sourceCharacterId: "clorinde", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "clorinde-c4", name: "\"To Enshrine Tears, Life, and Love\"", effects: [] },
    { level: 5, id: "clorinde-c5", name: "\"Holding Dawn's Coming as My Votive\"", effects: [], buffs: [{ id: "clorinde-c5", source: "\"Holding Dawn's Coming as My Votive\"", sourceCharacterId: "clorinde", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "clorinde-c6", name: "\"And So Shall I Never Despair\"", effects: [] },
  ],
  resources: [],
};

export const cyno: GeneratedCharacter = {
  id: "cyno",
  name: "Cyno",
  element: "electro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 972, 2: 1053, 3: 1134, 4: 1215, 5: 1296, 6: 1378, 7: 1459, 8: 1540, 9: 1622, 10: 1703, 11: 1784, 12: 1866, 13: 1948, 14: 2030, 15: 2112, 16: 2194, 17: 2276, 18: 2358, 19: 2441, 20: 2522, 21: 3439, 22: 3521, 23: 3604, 24: 3687, 25: 3769, 26: 3853, 27: 3936, 28: 4018, 29: 4102, 30: 4185, 31: 4268, 32: 4352, 33: 4435, 34: 4518, 35: 4602, 36: 4686, 37: 4770, 38: 4854, 39: 4937, 40: 5022, 41: 5698, 42: 5782, 43: 5867, 44: 5951, 45: 6035, 46: 6120, 47: 6204, 48: 6289, 49: 6375, 50: 6459, 51: 7334, 52: 7419, 53: 7504, 54: 7589, 55: 7675, 56: 7761, 57: 7846, 58: 7932, 59: 8017, 60: 8103, 61: 8781, 62: 8866, 63: 8953, 64: 9038, 65: 9125, 66: 9212, 67: 9297, 68: 9384, 69: 9470, 70: 9557, 71: 10236, 72: 10323, 73: 10410, 74: 10496, 75: 10584, 76: 10670, 77: 10758, 78: 10845, 79: 10933, 80: 11020, 81: 11700, 82: 11788, 83: 11875, 84: 11963, 85: 12050, 86: 12139, 87: 12226, 88: 12315, 89: 12403, 90: 12491 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 31, 5: 33, 6: 35, 7: 37, 8: 39, 9: 41, 10: 43, 11: 45, 12: 48, 13: 50, 14: 52, 15: 54, 16: 56, 17: 58, 18: 60, 19: 62, 20: 64, 21: 88, 22: 90, 23: 92, 24: 94, 25: 96, 26: 98, 27: 100, 28: 102, 29: 104, 30: 107, 31: 109, 32: 111, 33: 113, 34: 115, 35: 117, 36: 119, 37: 121, 38: 124, 39: 126, 40: 128, 41: 145, 42: 147, 43: 149, 44: 152, 45: 154, 46: 156, 47: 158, 48: 160, 49: 162, 50: 164, 51: 187, 52: 189, 53: 191, 54: 193, 55: 195, 56: 198, 57: 200, 58: 202, 59: 204, 60: 206, 61: 224, 62: 226, 63: 228, 64: 230, 65: 232, 66: 235, 67: 237, 68: 239, 69: 241, 70: 243, 71: 261, 72: 263, 73: 265, 74: 267, 75: 270, 76: 272, 77: 274, 78: 276, 79: 278, 80: 281, 81: 298, 82: 300, 83: 302, 84: 305, 85: 307, 86: 309, 87: 311, 88: 314, 89: 316, 90: 318 } },
    def: { byLevel: { 1: 67, 2: 72, 3: 78, 4: 84, 5: 89, 6: 95, 7: 100, 8: 106, 9: 112, 10: 117, 11: 123, 12: 128, 13: 134, 14: 140, 15: 145, 16: 151, 17: 157, 18: 162, 19: 168, 20: 174, 21: 237, 22: 242, 23: 248, 24: 254, 25: 259, 26: 265, 27: 271, 28: 276, 29: 282, 30: 288, 31: 294, 32: 299, 33: 305, 34: 311, 35: 317, 36: 322, 37: 328, 38: 334, 39: 340, 40: 345, 41: 392, 42: 398, 43: 404, 44: 409, 45: 415, 46: 421, 47: 427, 48: 433, 49: 439, 50: 444, 51: 504, 52: 510, 53: 516, 54: 522, 55: 528, 56: 534, 57: 540, 58: 546, 59: 552, 60: 557, 61: 604, 62: 610, 63: 616, 64: 622, 65: 628, 66: 634, 67: 640, 68: 646, 69: 651, 70: 657, 71: 704, 72: 710, 73: 716, 74: 722, 75: 728, 76: 734, 77: 740, 78: 746, 79: 752, 80: 758, 81: 805, 82: 811, 83: 817, 84: 823, 85: 829, 86: 835, 87: 841, 88: 847, 89: 853, 90: 859 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 318,
    hp: 12491,
    def: 859,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "cyno-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "cyno-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.492574, 0.532667, 0.57276, 0.630036, 0.670129, 0.71595, 0.778954, 0.841957, 0.904961, 0.973692, 1.042423, 1.111154, 1.179886, 1.248617, 1.317348]) },
            ],
          },
        ],
      },
      {
        id: "cyno-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "cyno-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.479209, 0.518215, 0.55722, 0.612942, 0.651947, 0.696525, 0.757819, 0.819113, 0.880408, 0.947274, 1.01414, 1.081007, 1.147873, 1.21474, 1.281606]) },
            ],
          },
        ],
      },
      {
        id: "cyno-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "cyno-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.293062, 0.316916, 0.34077, 0.374847, 0.398701, 0.425963, 0.463447, 0.500932, 0.538417, 0.579309, 0.620201, 0.661094, 0.701986, 0.742879, 0.783771]) },
              { stat: "atk", table: talentTable([0.293062, 0.316916, 0.34077, 0.374847, 0.398701, 0.425963, 0.463447, 0.500932, 0.538417, 0.579309, 0.620201, 0.661094, 0.701986, 0.742879, 0.783771]) },
            ],
          },
        ],
      },
      {
        id: "cyno-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "cyno-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.758907, 0.820679, 0.88245, 0.970695, 1.032466, 1.103063, 1.200132, 1.297202, 1.394271, 1.500165, 1.606059, 1.711953, 1.817847, 1.923741, 2.029635]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "cyno-charged",
      name: "Invoker's Spear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "cyno-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.22378, 1.32339, 1.423, 1.5653, 1.66491, 1.77875, 1.93528, 2.09181, 2.24834, 2.4191, 2.58986, 2.76062, 2.93138, 3.10214, 3.2729]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "cyno-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "cyno-plungeLow-1",
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
      id: "cyno-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "cyno-plungeHigh-1",
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
      id: "cyno-skill",
      name: "Secret Rite: Chasmic Soulfarer",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(7.5),
      energyCost: 0,
      particles: { count: 5, element: "electro" },
      instances: [
        {
          id: "cyno-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.304, 1.4018, 1.4996, 1.63, 1.7278, 1.8256, 1.956, 2.0864, 2.2168, 2.3472, 2.4776, 2.608, 2.771, 2.934, 3.097]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "cyno-skill-2",
          name: "Mortuary Rite DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.568, 1.6856, 1.8032, 1.96, 2.0776, 2.1952, 2.352, 2.5088, 2.6656, 2.8224, 2.9792, 3.136, 3.332, 3.528, 3.724]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "cyno-burst",
      name: "Sacred Rite: Wolf's Swiftness",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "cyno-burst-1",
          name: "1-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.782832, 0.846551, 0.91027, 1.001297, 1.065016, 1.137838, 1.237967, 1.338097, 1.438227, 1.547459, 1.656691, 1.765924, 1.875156, 1.984389, 2.093621]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-2",
          name: "2-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.824688, 0.891814, 0.95894, 1.054834, 1.12196, 1.198675, 1.304158, 1.409642, 1.515125, 1.630198, 1.745271, 1.860344, 1.975416, 2.090489, 2.205562]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-3",
          name: "3-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.046336, 1.131503, 1.21667, 1.338337, 1.423504, 1.520837, 1.654671, 1.788505, 1.922339, 2.068339, 2.214339, 2.36034, 2.50634, 2.652341, 2.798341]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-4",
          name: "4-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.516942, 0.559018, 0.601095, 0.661205, 0.703281, 0.751369, 0.817489, 0.88361, 0.94973, 1.021861, 1.093993, 1.166124, 1.238256, 1.310387, 1.382518]) },
            { stat: "atk", table: talentTable([0.516942, 0.559018, 0.601095, 0.661205, 0.703281, 0.751369, 0.817489, 0.88361, 0.94973, 1.021861, 1.093993, 1.166124, 1.238256, 1.310387, 1.382518]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-5",
          name: "5-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.308447, 1.414948, 1.52145, 1.673595, 1.780096, 1.901812, 2.069172, 2.236531, 2.403891, 2.586465, 2.769039, 2.951613, 3.134187, 3.316761, 3.499335]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-6",
          name: "Charged Attack DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.0105, 1.09275, 1.175, 1.2925, 1.37475, 1.46875, 1.598, 1.72725, 1.8565, 1.9975, 2.1385, 2.2795, 2.4205, 2.5615, 2.7025]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-7",
          name: "Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024, 1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612, 1.70982]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-8",
          name: "Low Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "cyno-burst-9",
          name: "High Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "cyno-a1", name: "Featherfall Judgment", unlockAscension: 1, effects: [] },
    { id: "cyno-a4", name: "Authority Over the Nine Bows", unlockAscension: 4, effects: [] },
    { id: "cyno-p3", name: "The Gift of Silence", effects: [] },
    { id: "cyno-p4", name: "A Star With Which to Start the Journey", effects: [] },
  ],
  constellations: [
    { level: 1, id: "cyno-c1", name: "Ordinance: Unceasing Vigil", effects: [] },
    { level: 2, id: "cyno-c2", name: "Ceremony: Homecoming of Spirits", effects: [] },
    { level: 3, id: "cyno-c3", name: "Precept: Lawful Enforcer", effects: [], buffs: [{ id: "cyno-c3", source: "Precept: Lawful Enforcer", sourceCharacterId: "cyno", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "cyno-c4", name: "Austerity: Forbidding Guard", effects: [] },
    { level: 5, id: "cyno-c5", name: "Funerary Rite: The Passing of Starlight", effects: [], buffs: [{ id: "cyno-c5", source: "Funerary Rite: The Passing of Starlight", sourceCharacterId: "cyno", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "cyno-c6", name: "Raiment: Just Scales", effects: [] },
  ],
  resources: [],
};

export const dori: GeneratedCharacter = {
  id: "dori",
  name: "Dori",
  element: "electro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1126, 3: 1211, 4: 1297, 5: 1382, 6: 1469, 7: 1554, 8: 1640, 9: 1727, 10: 1812, 11: 1898, 12: 1983, 13: 2070, 14: 2155, 15: 2241, 16: 2327, 17: 2413, 18: 2499, 19: 2584, 20: 2670, 21: 3532, 22: 3618, 23: 3705, 24: 3790, 25: 3876, 26: 3961, 27: 4048, 28: 4133, 29: 4219, 30: 4304, 31: 4391, 32: 4477, 33: 4562, 34: 4648, 35: 4734, 36: 4820, 37: 4905, 38: 4991, 39: 5078, 40: 5163, 41: 5801, 42: 5886, 43: 5972, 44: 6058, 45: 6144, 46: 6230, 47: 6315, 48: 6402, 49: 6487, 50: 6573, 51: 7394, 52: 7480, 53: 7567, 54: 7652, 55: 7738, 56: 7823, 57: 7910, 58: 7995, 59: 8081, 60: 8168, 61: 8804, 62: 8891, 63: 8976, 64: 9062, 65: 9147, 66: 9234, 67: 9320, 68: 9405, 69: 9492, 70: 9577, 71: 10215, 72: 10300, 73: 10386, 74: 10473, 75: 10558, 76: 10644, 77: 10729, 78: 10816, 79: 10901, 80: 10987, 81: 11625, 82: 11710, 83: 11797, 84: 11882, 85: 11968, 86: 12053, 87: 12140, 88: 12225, 89: 12311, 90: 12397 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 91, 8: 96, 9: 101, 10: 106, 11: 111, 12: 116, 13: 121, 14: 126, 15: 131, 16: 136, 17: 141, 18: 146, 19: 151, 20: 156, 21: 206, 22: 211, 23: 216, 24: 221, 25: 226, 26: 231, 27: 236, 28: 241, 29: 246, 30: 251, 31: 256, 32: 261, 33: 266, 34: 271, 35: 276, 36: 281, 37: 286, 38: 291, 39: 296, 40: 301, 41: 339, 42: 344, 43: 349, 44: 354, 45: 359, 46: 364, 47: 369, 48: 374, 49: 379, 50: 384, 51: 431, 52: 437, 53: 442, 54: 447, 55: 452, 56: 457, 57: 462, 58: 467, 59: 472, 60: 477, 61: 514, 62: 519, 63: 524, 64: 529, 65: 534, 66: 539, 67: 544, 68: 549, 69: 554, 70: 559, 71: 596, 72: 601, 73: 606, 74: 611, 75: 616, 76: 621, 77: 626, 78: 631, 79: 636, 80: 641, 81: 678, 82: 683, 83: 688, 84: 693, 85: 698, 86: 703, 87: 708, 88: 713, 89: 718, 90: 723 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 223,
    hp: 12397,
    def: 723,
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
        id: "dori-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dori-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.90214, 0.97557, 1.049, 1.1539, 1.22733, 1.31125, 1.42664, 1.54203, 1.65742, 1.7833, 1.90918, 2.03506, 2.16094, 2.28682, 2.4127]) },
            ],
          },
        ],
      },
      {
        id: "dori-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dori-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.410736, 0.444168, 0.4776, 0.52536, 0.558792, 0.597, 0.649536, 0.702072, 0.754608, 0.81192, 0.869232, 0.926544, 0.983856, 1.041168, 1.09848]) },
              { stat: "atk", table: talentTable([0.431204, 0.466302, 0.5014, 0.55154, 0.586638, 0.62675, 0.681904, 0.737058, 0.792212, 0.85238, 0.912548, 0.972716, 1.032884, 1.093052, 1.15322]) },
            ],
          },
        ],
      },
      {
        id: "dori-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dori-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.28398, 1.38849, 1.493, 1.6423, 1.74681, 1.86625, 2.03048, 2.19471, 2.35894, 2.5381, 2.71726, 2.89642, 3.07558, 3.25474, 3.4339]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "dori-charged",
      name: "Marvelous Sword-Dance (Modified)",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dori-charged-1",
          name: "Charged Attack Spinning DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.625455, 0.676364, 0.727273, 0.8, 0.850909, 0.909091, 0.989091, 1.069091, 1.149091, 1.236364, 1.336364, 1.453964, 1.571564, 1.689164, 1.817455]) },
          ],
        },
        {
          id: "dori-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.1309, 1.22295, 1.315, 1.4465, 1.53855, 1.64375, 1.7884, 1.93305, 2.0777, 2.2355, 2.416313, 2.628948, 2.841584, 3.054219, 3.286185]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "dori-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dori-plungeLow-1",
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
      id: "dori-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dori-plungeHigh-1",
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
      id: "dori-skill",
      name: "Spirit-Warding Lamp: Troubleshooter Cannon",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 2, element: "electro" },
      instances: [
        {
          id: "dori-skill-1",
          name: "Troubleshooter Shot DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.4728, 1.58326, 1.69372, 1.841, 1.95146, 2.06192, 2.2092, 2.35648, 2.50376, 2.65104, 2.79832, 2.9456, 3.1297, 3.3138, 3.4979]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "dori-skill-2",
          name: "After-Sales Service Round DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.3156, 0.33927, 0.36294, 0.3945, 0.41817, 0.44184, 0.4734, 0.50496, 0.53652, 0.56808, 0.59964, 0.6312, 0.67065, 0.7101, 0.74955]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "dori-burst",
      name: "Alcazarzaray's Exactitude",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "dori-burst-1",
          name: "Connector DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.158824, 0.170736, 0.182648, 0.19853, 0.210442, 0.222354, 0.238236, 0.254118, 0.270001, 0.285883, 0.301766, 0.317648, 0.337501, 0.357354, 0.377207]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "dori-a1", name: "An Eye for Gold", unlockAscension: 1, effects: [] },
    { id: "dori-a4", name: "Compound Interest", unlockAscension: 4, effects: [] },
    { id: "dori-p3", name: "Unexpected Order", effects: [] },
  ],
  constellations: [
    { level: 1, id: "dori-c1", name: "Additional Investment", effects: [] },
    { level: 2, id: "dori-c2", name: "Special Franchise", effects: [] },
    { level: 3, id: "dori-c3", name: "Wonders Never Cease", effects: [], buffs: [{ id: "dori-c3", source: "Wonders Never Cease", sourceCharacterId: "dori", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "dori-c4", name: "Discretionary Supplement", effects: [] },
    { level: 5, id: "dori-c5", name: "Value for Mora", effects: [], buffs: [{ id: "dori-c5", source: "Value for Mora", sourceCharacterId: "dori", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "dori-c6", name: "Sprinkling Weight", effects: [] },
  ],
  resources: [],
};

export const fischl: GeneratedCharacter = {
  id: "fischl",
  name: "Fischl",
  element: "electro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 770, 2: 834, 3: 898, 4: 962, 5: 1025, 6: 1089, 7: 1152, 8: 1216, 9: 1280, 10: 1343, 11: 1407, 12: 1470, 13: 1534, 14: 1597, 15: 1661, 16: 1725, 17: 1788, 18: 1852, 19: 1915, 20: 1979, 21: 2618, 22: 2682, 23: 2746, 24: 2809, 25: 2873, 26: 2936, 27: 3000, 28: 3063, 29: 3127, 30: 3191, 31: 3254, 32: 3318, 33: 3382, 34: 3446, 35: 3509, 36: 3573, 37: 3636, 38: 3700, 39: 3764, 40: 3827, 41: 4300, 42: 4363, 43: 4427, 44: 4490, 45: 4554, 46: 4618, 47: 4681, 48: 4745, 49: 4808, 50: 4872, 51: 5481, 52: 5545, 53: 5609, 54: 5672, 55: 5736, 56: 5799, 57: 5863, 58: 5926, 59: 5990, 60: 6054, 61: 6526, 62: 6590, 63: 6653, 64: 6717, 65: 6780, 66: 6844, 67: 6908, 68: 6971, 69: 7035, 70: 7099, 71: 7571, 72: 7635, 73: 7699, 74: 7763, 75: 7826, 76: 7890, 77: 7953, 78: 8017, 79: 8080, 80: 8144, 81: 8617, 82: 8680, 83: 8744, 84: 8807, 85: 8871, 86: 8934, 87: 8998, 88: 9061, 89: 9125, 90: 9189 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 24, 4: 26, 5: 27, 6: 29, 7: 31, 8: 32, 9: 34, 10: 36, 11: 37, 12: 39, 13: 41, 14: 42, 15: 44, 16: 46, 17: 48, 18: 49, 19: 51, 20: 53, 21: 70, 22: 71, 23: 73, 24: 75, 25: 76, 26: 78, 27: 80, 28: 81, 29: 83, 30: 85, 31: 87, 32: 88, 33: 90, 34: 92, 35: 93, 36: 95, 37: 97, 38: 98, 39: 100, 40: 102, 41: 114, 42: 116, 43: 118, 44: 119, 45: 121, 46: 123, 47: 124, 48: 126, 49: 128, 50: 130, 51: 146, 52: 147, 53: 149, 54: 151, 55: 152, 56: 154, 57: 156, 58: 158, 59: 159, 60: 161, 61: 173, 62: 175, 63: 177, 64: 179, 65: 180, 66: 182, 67: 184, 68: 185, 69: 187, 70: 189, 71: 201, 72: 203, 73: 205, 74: 206, 75: 208, 76: 210, 77: 211, 78: 213, 79: 215, 80: 216, 81: 229, 82: 231, 83: 232, 84: 234, 85: 236, 86: 237, 87: 239, 88: 241, 89: 243, 90: 244 } },
    def: { byLevel: { 1: 50, 2: 54, 3: 58, 4: 62, 5: 66, 6: 70, 7: 74, 8: 79, 9: 83, 10: 87, 11: 91, 12: 95, 13: 99, 14: 103, 15: 107, 16: 111, 17: 116, 18: 120, 19: 124, 20: 128, 21: 169, 22: 173, 23: 177, 24: 182, 25: 186, 26: 190, 27: 194, 28: 198, 29: 202, 30: 206, 31: 210, 32: 214, 33: 219, 34: 223, 35: 227, 36: 231, 37: 235, 38: 239, 39: 243, 40: 247, 41: 278, 42: 282, 43: 286, 44: 290, 45: 294, 46: 298, 47: 302, 48: 307, 49: 311, 50: 315, 51: 354, 52: 358, 53: 362, 54: 367, 55: 371, 56: 375, 57: 379, 58: 383, 59: 387, 60: 391, 61: 422, 62: 426, 63: 430, 64: 434, 65: 438, 66: 442, 67: 446, 68: 450, 69: 455, 70: 459, 71: 489, 72: 493, 73: 497, 74: 502, 75: 506, 76: 510, 77: 514, 78: 518, 79: 522, 80: 526, 81: 557, 82: 561, 83: 565, 84: 569, 85: 573, 86: 577, 87: 581, 88: 586, 89: 590, 90: 594 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 244,
    hp: 9189,
    def: 594,
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
        id: "fischl-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "fischl-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44118, 0.47709, 0.513, 0.5643, 0.60021, 0.64125, 0.69768, 0.75411, 0.81054, 0.8721, 0.93366, 0.99522, 1.05678, 1.11834, 1.1799]) },
            ],
          },
        ],
      },
      {
        id: "fischl-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "fischl-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.46784, 0.50592, 0.544, 0.5984, 0.63648, 0.68, 0.73984, 0.79968, 0.85952, 0.9248, 0.99008, 1.05536, 1.12064, 1.18592, 1.2512]) },
            ],
          },
        ],
      },
      {
        id: "fischl-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "fischl-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.58136, 0.62868, 0.676, 0.7436, 0.79092, 0.845, 0.91936, 0.99372, 1.06808, 1.1492, 1.23032, 1.31144, 1.39256, 1.47368, 1.5548]) },
            ],
          },
        ],
      },
      {
        id: "fischl-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "fischl-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.57706, 0.62403, 0.671, 0.7381, 0.78507, 0.83875, 0.91256, 0.98637, 1.06018, 1.1407, 1.22122, 1.30174, 1.38226, 1.46278, 1.5433]) },
            ],
          },
        ],
      },
      {
        id: "fischl-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "fischl-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.72068, 0.77934, 0.838, 0.9218, 0.98046, 1.0475, 1.13968, 1.23186, 1.32404, 1.4246, 1.52516, 1.62572, 1.72628, 1.82684, 1.9274]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "fischl-charged",
      name: "Bolts of Downfall",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "fischl-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "fischl-charged-2",
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
      id: "fischl-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "fischl-plungeLow-1",
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
      id: "fischl-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "fischl-plungeHigh-1",
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
      id: "fischl-skill",
      name: "Nightrider",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(25),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "fischl-skill-1",
          name: "Oz's ATK DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.888, 0.9546, 1.0212, 1.11, 1.1766, 1.2432, 1.332, 1.4208, 1.5096, 1.5984, 1.6872, 1.776, 1.887, 1.998, 2.109]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "fischl-skill-2",
          name: "Summoning DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.1544, 1.24098, 1.32756, 1.443, 1.52958, 1.61616, 1.7316, 1.84704, 1.96248, 2.07792, 2.19336, 2.3088, 2.4531, 2.5974, 2.7417]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "fischl-burst",
      name: "Midnight Phantasmagoria",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "fischl-burst-1",
          name: "Falling Thunder DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.08, 2.236, 2.392, 2.6, 2.756, 2.912, 3.12, 3.328, 3.536, 3.744, 3.952, 4.16, 4.42, 4.68, 4.94]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "fischl-a1", name: "Stellar Predator", unlockAscension: 1, effects: [] },
    { id: "fischl-a4", name: "Undone Be Thy Sinful Hex", unlockAscension: 4, effects: [] },
    { id: "fischl-p3", name: "Mein Hausgarten", effects: [] },
    { id: "fischl-p4", name: "Witch's Eve Rite: Phantasmal Nocturne", effects: [] },
  ],
  constellations: [
    { level: 1, id: "fischl-c1", name: "Gaze of the Deep", effects: [] },
    { level: 2, id: "fischl-c2", name: "Devourer of All Sins", effects: [] },
    { level: 3, id: "fischl-c3", name: "Wings of Nightmare", effects: [], buffs: [{ id: "fischl-c3", source: "Wings of Nightmare", sourceCharacterId: "fischl", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "fischl-c4", name: "Her Pilgrimage of Bleak", effects: [] },
    { level: 5, id: "fischl-c5", name: "Against the Fleeing Light", effects: [], buffs: [{ id: "fischl-c5", source: "Against the Fleeing Light", sourceCharacterId: "fischl", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "fischl-c6", name: "Evernight Raven", effects: [] },
  ],
  resources: [],
};

export const flins: GeneratedCharacter = {
  id: "flins",
  name: "Flins",
  element: "electro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 972, 2: 1053, 3: 1134, 4: 1215, 5: 1296, 6: 1378, 7: 1459, 8: 1540, 9: 1622, 10: 1703, 11: 1784, 12: 1866, 13: 1948, 14: 2030, 15: 2112, 16: 2194, 17: 2276, 18: 2358, 19: 2441, 20: 2522, 21: 3439, 22: 3521, 23: 3604, 24: 3687, 25: 3769, 26: 3853, 27: 3936, 28: 4018, 29: 4102, 30: 4185, 31: 4268, 32: 4352, 33: 4435, 34: 4518, 35: 4602, 36: 4686, 37: 4770, 38: 4854, 39: 4937, 40: 5022, 41: 5698, 42: 5782, 43: 5867, 44: 5951, 45: 6035, 46: 6120, 47: 6204, 48: 6289, 49: 6375, 50: 6459, 51: 7334, 52: 7419, 53: 7504, 54: 7589, 55: 7675, 56: 7761, 57: 7846, 58: 7932, 59: 8017, 60: 8103, 61: 8781, 62: 8866, 63: 8953, 64: 9038, 65: 9125, 66: 9212, 67: 9297, 68: 9384, 69: 9470, 70: 9557, 71: 10236, 72: 10323, 73: 10410, 74: 10496, 75: 10584, 76: 10670, 77: 10758, 78: 10845, 79: 10933, 80: 11020, 81: 11700, 82: 11788, 83: 11875, 84: 11963, 85: 12050, 86: 12139, 87: 12226, 88: 12315, 89: 12403, 90: 12491 } },
    atk: { byLevel: { 1: 27, 2: 30, 3: 32, 4: 34, 5: 36, 6: 39, 7: 41, 8: 43, 9: 46, 10: 48, 11: 50, 12: 53, 13: 55, 14: 57, 15: 59, 16: 62, 17: 64, 18: 66, 19: 69, 20: 71, 21: 97, 22: 99, 23: 101, 24: 104, 25: 106, 26: 108, 27: 111, 28: 113, 29: 115, 30: 118, 31: 120, 32: 122, 33: 125, 34: 127, 35: 130, 36: 132, 37: 134, 38: 137, 39: 139, 40: 141, 41: 160, 42: 163, 43: 165, 44: 167, 45: 170, 46: 172, 47: 175, 48: 177, 49: 179, 50: 182, 51: 206, 52: 209, 53: 211, 54: 214, 55: 216, 56: 218, 57: 221, 58: 223, 59: 226, 60: 228, 61: 247, 62: 250, 63: 252, 64: 254, 65: 257, 66: 259, 67: 262, 68: 264, 69: 267, 70: 269, 71: 288, 72: 291, 73: 293, 74: 295, 75: 298, 76: 300, 77: 303, 78: 305, 79: 308, 80: 310, 81: 329, 82: 332, 83: 334, 84: 337, 85: 339, 86: 342, 87: 344, 88: 347, 89: 349, 90: 352 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 79, 5: 84, 6: 89, 7: 94, 8: 100, 9: 105, 10: 110, 11: 115, 12: 121, 13: 126, 14: 131, 15: 137, 16: 142, 17: 147, 18: 153, 19: 158, 20: 163, 21: 223, 22: 228, 23: 233, 24: 239, 25: 244, 26: 249, 27: 255, 28: 260, 29: 266, 30: 271, 31: 276, 32: 282, 33: 287, 34: 292, 35: 298, 36: 303, 37: 309, 38: 314, 39: 320, 40: 325, 41: 369, 42: 374, 43: 380, 44: 385, 45: 391, 46: 396, 47: 402, 48: 407, 49: 413, 50: 418, 51: 475, 52: 480, 53: 486, 54: 491, 55: 497, 56: 502, 57: 508, 58: 513, 59: 519, 60: 524, 61: 568, 62: 574, 63: 580, 64: 585, 65: 591, 66: 596, 67: 602, 68: 607, 69: 613, 70: 619, 71: 663, 72: 668, 73: 674, 74: 679, 75: 685, 76: 691, 77: 696, 78: 702, 79: 708, 80: 713, 81: 757, 82: 763, 83: 769, 84: 774, 85: 780, 86: 786, 87: 791, 88: 797, 89: 803, 90: 809 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 352,
    hp: 12491,
    def: 809,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "flins-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "flins-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44726, 0.483665, 0.52007, 0.572077, 0.608482, 0.650088, 0.707295, 0.764503, 0.821711, 0.884119, 0.946527, 1.008936, 1.071344, 1.133753, 1.196161]) },
            ],
          },
        ],
      },
      {
        id: "flins-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "flins-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.451483, 0.488231, 0.52498, 0.577478, 0.614227, 0.656225, 0.713973, 0.771721, 0.829468, 0.892466, 0.955464, 1.018461, 1.081459, 1.144456, 1.207454]) },
            ],
          },
        ],
      },
      {
        id: "flins-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "flins-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.559198, 0.604714, 0.65023, 0.715253, 0.760769, 0.812787, 0.884313, 0.955838, 1.027363, 1.105391, 1.183419, 1.261446, 1.339474, 1.417501, 1.495529]) },
            ],
          },
        ],
      },
      {
        id: "flins-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "flins-na-4-1-1",
            name: "4-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.320389, 0.346467, 0.372545, 0.4098, 0.435878, 0.465681, 0.506661, 0.547641, 0.588621, 0.633327, 0.678032, 0.722737, 0.767443, 0.812148, 0.856853]) },
            ],
          },
          {
            id: "flins-na-4-1-2",
            name: "4-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.320389, 0.346467, 0.372545, 0.4098, 0.435878, 0.465681, 0.506661, 0.547641, 0.588621, 0.633327, 0.678032, 0.722737, 0.767443, 0.812148, 0.856853]) },
            ],
          },
        ],
      },
      {
        id: "flins-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "flins-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.767946, 0.830453, 0.89296, 0.982256, 1.044763, 1.1162, 1.214426, 1.312651, 1.410877, 1.518032, 1.625187, 1.732342, 1.839498, 1.946653, 2.053808]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "flins-charged",
      name: "Pocztowy Demonspear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "flins-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.03028, 1.11414, 1.198, 1.3178, 1.40166, 1.4975, 1.62928, 1.76106, 1.89284, 2.0366, 2.18036, 2.32412, 2.46788, 2.61164, 2.7554]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "flins-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "flins-plungeLow-1",
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
      id: "flins-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "flins-plungeHigh-1",
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
      id: "flins-skill",
      name: "Ancient Rite: Arcane Light",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "flins-skill-1",
          name: "1-Hit DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.58248, 0.626166, 0.669852, 0.7281, 0.771786, 0.815472, 0.87372, 0.931968, 0.990216, 1.048464, 1.106712, 1.16496, 1.23777, 1.31058, 1.38339]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-2",
          name: "2-Hit DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.587976, 0.632074, 0.676172, 0.73497, 0.779068, 0.823166, 0.881964, 0.940762, 0.999559, 1.058357, 1.117154, 1.175952, 1.249449, 1.322946, 1.396443]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-3",
          name: "3-Hit DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.728256, 0.782875, 0.837494, 0.91032, 0.964939, 1.019558, 1.092384, 1.16521, 1.238035, 1.310861, 1.383686, 1.456512, 1.547544, 1.638576, 1.729608]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-4-1",
          name: "4-Hit DMG (1/2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.417252, 0.448546, 0.47984, 0.521565, 0.552859, 0.584153, 0.625878, 0.667603, 0.709328, 0.751054, 0.792779, 0.834504, 0.88666, 0.938817, 0.990973]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-4-2",
          name: "4-Hit DMG (2/2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.417252, 0.448546, 0.47984, 0.521565, 0.552859, 0.584153, 0.625878, 0.667603, 0.709328, 0.751054, 0.792779, 0.834504, 0.88666, 0.938817, 0.990973]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-5",
          name: "5-Hit DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.000112, 1.07512, 1.150129, 1.25014, 1.325148, 1.400157, 1.500168, 1.600179, 1.70019, 1.800202, 1.900213, 2.000224, 2.125238, 2.250252, 2.375266]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-6",
          name: "Charged Attack DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.1496, 1.23582, 1.32204, 1.437, 1.52322, 1.60944, 1.7244, 1.83936, 1.95432, 2.06928, 2.18424, 2.2992, 2.4429, 2.5866, 2.7303]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "flins-skill-7",
          name: "Northland Spearstorm DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.784, 1.9178, 2.0516, 2.23, 2.3638, 2.4976, 2.676, 2.8544, 3.0328, 3.2112, 3.3896, 3.568, 3.791, 4.014, 4.237]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "flins-burst",
      name: "Ancient Ritual: Cometh the Night",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "flins-burst-1",
          name: "Initial Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.5984, 2.79328, 2.98816, 3.248, 3.44288, 3.63776, 3.8976, 4.15744, 4.41728, 4.67712, 4.93696, 5.1968, 5.5216, 5.8464, 6.1712]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "flins-burst-2",
          name: "Middle Phase Lunar-Charged DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.1624, 0.17458, 0.18676, 0.203, 0.21518, 0.22736, 0.2436, 0.25984, 0.27608, 0.29232, 0.30856, 0.3248, 0.3451, 0.3654, 0.3857]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "flins-burst-3",
          name: "Final Phase Lunar-Charged DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.16928, 1.256976, 1.344672, 1.4616, 1.549296, 1.636992, 1.75392, 1.870848, 1.987776, 2.104704, 2.221632, 2.33856, 2.48472, 2.63088, 2.77704]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "flins-burst-4",
          name: "Thunderous Symphony DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.71456, 0.768152, 0.821744, 0.8932, 0.946792, 1.000384, 1.07184, 1.143296, 1.214752, 1.286208, 1.357664, 1.42912, 1.51844, 1.60776, 1.69708]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "flins-burst-5",
          name: "Thunderous Symphony Additional DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.03936, 1.117312, 1.195264, 1.2992, 1.377152, 1.455104, 1.55904, 1.662976, 1.766912, 1.870848, 1.974784, 2.07872, 2.20864, 2.33856, 2.46848]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "flins-a1", name: "Symphony of Winter", unlockAscension: 1, effects: [] },
    { id: "flins-a4", name: "Whispering Flame", unlockAscension: 4, effects: [], buffs: [{ id: "flins-a4", source: "Whispering Flame", sourceCharacterId: "flins", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, conversions: [{ sourceStat: "atk", targetStat: "elementalMastery", ratio: 0.08, maxCap: 160 }] }] },
    { id: "flins-p3", name: "Moonsign Benediction: Old World Secrets", effects: [] },
    { id: "flins-p4", name: "A Light in the Dark", effects: [] },
  ],
  constellations: [
    { level: 1, id: "flins-c1", name: "Part the Veil of Snow", effects: [] },
    { level: 2, id: "flins-c2", name: "The Devil's Wall", effects: [] },
    { level: 3, id: "flins-c3", name: "Stranger in the Night", effects: [], buffs: [{ id: "flins-c3", source: "Stranger in the Night", sourceCharacterId: "flins", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "flins-c4", name: "Night on Bald Mountain", effects: [] },
    { level: 5, id: "flins-c5", name: "Exile's Shadow", effects: [], buffs: [{ id: "flins-c5", source: "Exile's Shadow", sourceCharacterId: "flins", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "flins-c6", name: "Songs and Dances of Death", effects: [] },
  ],
  resources: [],
};

export const iansan: GeneratedCharacter = {
  id: "iansan",
  name: "Iansan",
  element: "electro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 894, 2: 968, 3: 1041, 4: 1115, 5: 1188, 6: 1263, 7: 1336, 8: 1410, 9: 1484, 10: 1557, 11: 1632, 12: 1705, 13: 1779, 14: 1852, 15: 1927, 16: 2001, 17: 2074, 18: 2148, 19: 2221, 20: 2296, 21: 3036, 22: 3111, 23: 3185, 24: 3258, 25: 3332, 26: 3405, 27: 3480, 28: 3553, 29: 3627, 30: 3700, 31: 3774, 32: 3849, 33: 3922, 34: 3996, 35: 4069, 36: 4143, 37: 4217, 38: 4291, 39: 4365, 40: 4438, 41: 4987, 42: 5060, 43: 5134, 44: 5208, 45: 5282, 46: 5356, 47: 5429, 48: 5503, 49: 5577, 50: 5651, 51: 6356, 52: 6431, 53: 6505, 54: 6578, 55: 6652, 56: 6725, 57: 6800, 58: 6873, 59: 6947, 60: 7021, 61: 7569, 62: 7643, 63: 7716, 64: 7790, 65: 7864, 66: 7938, 67: 8012, 68: 8085, 69: 8159, 70: 8233, 71: 8781, 72: 8854, 73: 8929, 74: 9003, 75: 9076, 76: 9150, 77: 9223, 78: 9298, 79: 9371, 80: 9445, 81: 9994, 82: 10067, 83: 10141, 84: 10214, 85: 10288, 86: 10362, 87: 10436, 88: 10509, 89: 10583, 90: 10657 } },
    atk: { byLevel: { 1: 22, 2: 23, 3: 25, 4: 27, 5: 29, 6: 30, 7: 32, 8: 34, 9: 36, 10: 38, 11: 39, 12: 41, 13: 43, 14: 45, 15: 46, 16: 48, 17: 50, 18: 52, 19: 54, 20: 55, 21: 73, 22: 75, 23: 77, 24: 79, 25: 80, 26: 82, 27: 84, 28: 86, 29: 87, 30: 89, 31: 91, 32: 93, 33: 95, 34: 96, 35: 98, 36: 100, 37: 102, 38: 103, 39: 105, 40: 107, 41: 120, 42: 122, 43: 124, 44: 126, 45: 127, 46: 129, 47: 131, 48: 133, 49: 134, 50: 136, 51: 153, 52: 155, 53: 157, 54: 159, 55: 160, 56: 162, 57: 164, 58: 166, 59: 168, 60: 169, 61: 183, 62: 184, 63: 186, 64: 188, 65: 190, 66: 191, 67: 193, 68: 195, 69: 197, 70: 199, 71: 212, 72: 214, 73: 215, 74: 217, 75: 219, 76: 221, 77: 222, 78: 224, 79: 226, 80: 228, 81: 241, 82: 243, 83: 245, 84: 246, 85: 248, 86: 250, 87: 252, 88: 253, 89: 255, 90: 257 } },
    def: { byLevel: { 1: 54, 2: 58, 3: 62, 4: 67, 5: 71, 6: 76, 7: 80, 8: 84, 9: 89, 10: 93, 11: 98, 12: 102, 13: 107, 14: 111, 15: 115, 16: 120, 17: 124, 18: 129, 19: 133, 20: 137, 21: 182, 22: 186, 23: 191, 24: 195, 25: 200, 26: 204, 27: 208, 28: 213, 29: 217, 30: 222, 31: 226, 32: 230, 33: 235, 34: 239, 35: 244, 36: 248, 37: 252, 38: 257, 39: 261, 40: 266, 41: 299, 42: 303, 43: 307, 44: 312, 45: 316, 46: 321, 47: 325, 48: 330, 49: 334, 50: 338, 51: 381, 52: 385, 53: 389, 54: 394, 55: 398, 56: 403, 57: 407, 58: 412, 59: 416, 60: 420, 61: 453, 62: 458, 63: 462, 64: 466, 65: 471, 66: 475, 67: 480, 68: 484, 69: 489, 70: 493, 71: 526, 72: 530, 73: 535, 74: 539, 75: 543, 76: 548, 77: 552, 78: 557, 79: 561, 80: 566, 81: 598, 82: 603, 83: 607, 84: 612, 85: 616, 86: 620, 87: 625, 88: 629, 89: 634, 90: 638 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 257,
    hp: 10657,
    def: 638,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "iansan-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "iansan-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.469758, 0.507994, 0.54623, 0.600853, 0.639089, 0.682787, 0.742873, 0.802958, 0.863043, 0.928591, 0.994139, 1.059686, 1.125234, 1.190781, 1.256329]) },
            ],
          },
        ],
      },
      {
        id: "iansan-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "iansan-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.427644, 0.462452, 0.49726, 0.546986, 0.581794, 0.621575, 0.676274, 0.730972, 0.785671, 0.845342, 0.905013, 0.964684, 1.024356, 1.084027, 1.143698]) },
            ],
          },
        ],
      },
      {
        id: "iansan-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "iansan-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.643882, 0.696291, 0.7487, 0.82357, 0.875979, 0.935875, 1.018232, 1.100589, 1.182946, 1.27279, 1.362634, 1.452478, 1.542322, 1.632166, 1.72201]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "iansan-charged",
      name: "Weighted Spike",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "iansan-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.00276, 1.08438, 1.166, 1.2826, 1.36422, 1.4575, 1.58576, 1.71402, 1.84228, 1.9822, 2.12212, 2.26204, 2.40196, 2.54188, 2.6818]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "iansan-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "iansan-plungeLow-1",
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
      id: "iansan-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "iansan-plungeHigh-1",
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
      id: "iansan-skill",
      name: "Thunderbolt Rush",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 4, element: "electro" },
      instances: [
        {
          id: "iansan-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.864, 3.0788, 3.2936, 3.58, 3.7948, 4.0096, 4.296, 4.5824, 4.8688, 5.1552, 5.4416, 5.728, 6.086, 6.444, 6.802]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "iansan-burst",
      name: "The Three Principles of Power",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "iansan-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.304, 4.6268, 4.9496, 5.38, 5.7028, 6.0256, 6.456, 6.8864, 7.3168, 7.7472, 8.1776, 8.608, 9.146, 9.684, 10.222]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "iansan-a1", name: "Enhanced Resistance Training", unlockAscension: 1, effects: [] },
    { id: "iansan-a4", name: "Kinetic Energy Gradient Test", unlockAscension: 4, effects: [] },
    { id: "iansan-p3", name: "Night Realm's Gift: Hard Work and Drive", effects: [] },
    { id: "iansan-p4", name: "Caloric Balancing Plan", effects: [] },
  ],
  constellations: [
    { level: 1, id: "iansan-c1", name: "Starting's Never Easy", effects: [] },
    { level: 2, id: "iansan-c2", name: "Laziness is the Enemy!", effects: [] },
    { level: 3, id: "iansan-c3", name: "Scientific Diet Planning", effects: [], buffs: [{ id: "iansan-c3", source: "Scientific Diet Planning", sourceCharacterId: "iansan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "iansan-c4", name: "Slow and Steady Wins the Race", effects: [] },
    { level: 5, id: "iansan-c5", name: "We Can Push It Further!", effects: [], buffs: [{ id: "iansan-c5", source: "We Can Push It Further!", sourceCharacterId: "iansan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "iansan-c6", name: "Teachings of the Collective of Plenty", effects: [] },
  ],
  resources: [],
};

export const ineffa: GeneratedCharacter = {
  id: "ineffa",
  name: "Ineffa",
  element: "electro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 982, 2: 1063, 3: 1145, 4: 1227, 5: 1309, 6: 1391, 7: 1473, 8: 1555, 9: 1638, 10: 1719, 11: 1802, 12: 1884, 13: 1967, 14: 2050, 15: 2133, 16: 2215, 17: 2299, 18: 2381, 19: 2465, 20: 2547, 21: 3472, 22: 3556, 23: 3639, 24: 3723, 25: 3806, 26: 3891, 27: 3974, 28: 4058, 29: 4142, 30: 4226, 31: 4310, 32: 4394, 33: 4479, 34: 4562, 35: 4647, 36: 4732, 37: 4817, 38: 4901, 39: 4986, 40: 5071, 41: 5754, 42: 5839, 43: 5925, 44: 6009, 45: 6094, 46: 6180, 47: 6265, 48: 6351, 49: 6437, 50: 6523, 51: 7406, 52: 7492, 53: 7577, 54: 7664, 55: 7750, 56: 7837, 57: 7923, 58: 8009, 59: 8096, 60: 8182, 61: 8867, 62: 8953, 63: 9041, 64: 9127, 65: 9214, 66: 9302, 67: 9388, 68: 9476, 69: 9563, 70: 9650, 71: 10336, 72: 10424, 73: 10512, 74: 10599, 75: 10688, 76: 10775, 77: 10863, 78: 10952, 79: 11040, 80: 11128, 81: 11815, 82: 11903, 83: 11992, 84: 12080, 85: 12168, 86: 12258, 87: 12346, 88: 12436, 89: 12525, 90: 12613 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 32, 5: 34, 6: 36, 7: 39, 8: 41, 9: 43, 10: 45, 11: 47, 12: 49, 13: 51, 14: 54, 15: 56, 16: 58, 17: 60, 18: 62, 19: 64, 20: 67, 21: 91, 22: 93, 23: 95, 24: 97, 25: 100, 26: 102, 27: 104, 28: 106, 29: 108, 30: 111, 31: 113, 32: 115, 33: 117, 34: 119, 35: 122, 36: 124, 37: 126, 38: 128, 39: 130, 40: 133, 41: 151, 42: 153, 43: 155, 44: 157, 45: 159, 46: 162, 47: 164, 48: 166, 49: 168, 50: 171, 51: 194, 52: 196, 53: 198, 54: 201, 55: 203, 56: 205, 57: 207, 58: 210, 59: 212, 60: 214, 61: 232, 62: 234, 63: 237, 64: 239, 65: 241, 66: 243, 67: 246, 68: 248, 69: 250, 70: 253, 71: 270, 72: 273, 73: 275, 74: 277, 75: 280, 76: 282, 77: 284, 78: 287, 79: 289, 80: 291, 81: 309, 82: 311, 83: 314, 84: 316, 85: 318, 86: 321, 87: 323, 88: 325, 89: 328, 90: 330 } },
    def: { byLevel: { 1: 64, 2: 70, 3: 75, 4: 81, 5: 86, 6: 91, 7: 97, 8: 102, 9: 107, 10: 113, 11: 118, 12: 124, 13: 129, 14: 135, 15: 140, 16: 145, 17: 151, 18: 156, 19: 162, 20: 167, 21: 228, 22: 233, 23: 239, 24: 244, 25: 250, 26: 255, 27: 261, 28: 266, 29: 272, 30: 277, 31: 283, 32: 288, 33: 294, 34: 299, 35: 305, 36: 311, 37: 316, 38: 322, 39: 327, 40: 333, 41: 378, 42: 383, 43: 389, 44: 394, 45: 400, 46: 406, 47: 411, 48: 417, 49: 422, 50: 428, 51: 486, 52: 492, 53: 497, 54: 503, 55: 509, 56: 514, 57: 520, 58: 526, 59: 531, 60: 537, 61: 582, 62: 588, 63: 593, 64: 599, 65: 605, 66: 610, 67: 616, 68: 622, 69: 628, 70: 633, 71: 678, 72: 684, 73: 690, 74: 696, 75: 701, 76: 707, 77: 713, 78: 719, 79: 724, 80: 730, 81: 775, 82: 781, 83: 787, 84: 793, 85: 799, 86: 804, 87: 810, 88: 816, 89: 822, 90: 828 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 330,
    hp: 12613,
    def: 828,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "ineffa-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ineffa-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.348352, 0.376706, 0.40506, 0.445566, 0.47392, 0.506325, 0.550882, 0.595438, 0.639995, 0.688602, 0.737209, 0.785816, 0.834424, 0.883031, 0.931638]) },
            ],
          },
        ],
      },
      {
        id: "ineffa-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ineffa-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.342211, 0.370066, 0.39792, 0.437712, 0.465566, 0.4974, 0.541171, 0.584942, 0.628714, 0.676464, 0.724214, 0.771965, 0.819715, 0.867466, 0.915216]) },
            ],
          },
        ],
      },
      {
        id: "ineffa-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ineffa-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.227556, 0.246078, 0.2646, 0.29106, 0.309582, 0.33075, 0.359856, 0.388962, 0.418068, 0.44982, 0.481572, 0.513324, 0.545076, 0.576828, 0.60858]) },
              { stat: "atk", table: talentTable([0.227556, 0.246078, 0.2646, 0.29106, 0.309582, 0.33075, 0.359856, 0.388962, 0.418068, 0.44982, 0.481572, 0.513324, 0.545076, 0.576828, 0.60858]) },
            ],
          },
        ],
      },
      {
        id: "ineffa-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ineffa-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.560677, 0.606314, 0.65195, 0.717145, 0.762782, 0.814938, 0.886652, 0.958367, 1.030081, 1.108315, 1.186549, 1.264783, 1.343017, 1.421251, 1.499485]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "ineffa-charged",
      name: "Cyclonic Duster",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ineffa-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.94944, 1.02672, 1.104, 1.2144, 1.29168, 1.38, 1.50144, 1.62288, 1.74432, 1.8768, 2.00928, 2.14176, 2.27424, 2.40672, 2.5392]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "ineffa-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ineffa-plungeLow-1",
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
      id: "ineffa-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ineffa-plungeHigh-1",
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
      id: "ineffa-skill",
      name: "Cleaning Mode: Carrier Frequency",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "ineffa-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.864, 0.9288, 0.9936, 1.08, 1.1448, 1.2096, 1.296, 1.3824, 1.4688, 1.5552, 1.6416, 1.728, 1.836, 1.944, 2.052]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "ineffa-skill-2",
          name: "Birgitta Discharge DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "ineffa-burst",
      name: "Supreme Instruction: Cyclonic Exterminator",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "ineffa-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([6.768, 7.2756, 7.7832, 8.46, 8.9676, 9.4752, 10.152, 10.8288, 11.5056, 12.1824, 12.8592, 13.536, 14.382, 15.228, 16.074]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "ineffa-a1", name: "Overclocking Circuit", unlockAscension: 1, effects: [] },
    { id: "ineffa-a4", name: "Panoramic Permutation Protocol", unlockAscension: 4, effects: [] },
    { id: "ineffa-p3", name: "Moonsign Benediction: Assemblage Hub", effects: [] },
    { id: "ineffa-p4", name: "Flavor Synthesis Unit", effects: [] },
  ],
  constellations: [
    { level: 1, id: "ineffa-c1", name: "Rectifying Processor", effects: [] },
    { level: 2, id: "ineffa-c2", name: "Support Cleaning Module", effects: [] },
    { level: 3, id: "ineffa-c3", name: "Enhanced Emotion Emulator", effects: [], buffs: [{ id: "ineffa-c3", source: "Enhanced Emotion Emulator", sourceCharacterId: "ineffa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "ineffa-c4", name: "The Edictless Path", effects: [] },
    { level: 5, id: "ineffa-c5", name: "Mirror's Dream Transcension", effects: [], buffs: [{ id: "ineffa-c5", source: "Mirror's Dream Transcension", sourceCharacterId: "ineffa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "ineffa-c6", name: "A Dawning Morn for You", effects: [] },
  ],
  resources: [],
};

export const keqing: GeneratedCharacter = {
  id: "keqing",
  name: "Keqing",
  element: "electro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1020, 2: 1105, 3: 1189, 4: 1275, 5: 1360, 6: 1445, 7: 1530, 8: 1616, 9: 1701, 10: 1786, 11: 1872, 12: 1957, 13: 2043, 14: 2130, 15: 2216, 16: 2301, 17: 2388, 18: 2474, 19: 2560, 20: 2646, 21: 3607, 22: 3694, 23: 3781, 24: 3867, 25: 3954, 26: 4042, 27: 4129, 28: 4215, 29: 4303, 30: 4390, 31: 4477, 32: 4565, 33: 4653, 34: 4740, 35: 4827, 36: 4916, 37: 5004, 38: 5091, 39: 5179, 40: 5268, 41: 5977, 42: 6066, 43: 6155, 44: 6242, 45: 6331, 46: 6420, 47: 6509, 48: 6597, 49: 6687, 50: 6776, 51: 7693, 52: 7783, 53: 7872, 54: 7961, 55: 8051, 56: 8141, 57: 8231, 58: 8320, 59: 8410, 60: 8500, 61: 9211, 62: 9301, 63: 9392, 64: 9482, 65: 9572, 66: 9663, 67: 9753, 68: 9844, 69: 9934, 70: 10025, 71: 10737, 72: 10829, 73: 10920, 74: 11011, 75: 11103, 76: 11193, 77: 11285, 78: 11377, 79: 11469, 80: 11561, 81: 12274, 82: 12366, 83: 12457, 84: 12549, 85: 12641, 86: 12734, 87: 12826, 88: 12918, 89: 13011, 90: 13103 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 31, 5: 34, 6: 36, 7: 38, 8: 40, 9: 42, 10: 44, 11: 46, 12: 48, 13: 50, 14: 52, 15: 55, 16: 57, 17: 59, 18: 61, 19: 63, 20: 65, 21: 89, 22: 91, 23: 93, 24: 95, 25: 97, 26: 100, 27: 102, 28: 104, 29: 106, 30: 108, 31: 110, 32: 112, 33: 115, 34: 117, 35: 119, 36: 121, 37: 123, 38: 125, 39: 128, 40: 130, 41: 147, 42: 149, 43: 152, 44: 154, 45: 156, 46: 158, 47: 160, 48: 163, 49: 165, 50: 167, 51: 190, 52: 192, 53: 194, 54: 196, 55: 198, 56: 201, 57: 203, 58: 205, 59: 207, 60: 209, 61: 227, 62: 229, 63: 231, 64: 234, 65: 236, 66: 238, 67: 240, 68: 243, 69: 245, 70: 247, 71: 265, 72: 267, 73: 269, 74: 271, 75: 274, 76: 276, 77: 278, 78: 280, 79: 283, 80: 285, 81: 302, 82: 305, 83: 307, 84: 309, 85: 312, 86: 314, 87: 316, 88: 318, 89: 321, 90: 323 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 73, 4: 78, 5: 83, 6: 88, 7: 93, 8: 99, 9: 104, 10: 109, 11: 114, 12: 119, 13: 125, 14: 130, 15: 135, 16: 140, 17: 146, 18: 151, 19: 156, 20: 161, 21: 220, 22: 225, 23: 231, 24: 236, 25: 241, 26: 247, 27: 252, 28: 257, 29: 262, 30: 268, 31: 273, 32: 278, 33: 284, 34: 289, 35: 294, 36: 300, 37: 305, 38: 311, 39: 316, 40: 321, 41: 365, 42: 370, 43: 375, 44: 381, 45: 386, 46: 392, 47: 397, 48: 402, 49: 408, 50: 413, 51: 469, 52: 475, 53: 480, 54: 486, 55: 491, 56: 497, 57: 502, 58: 508, 59: 513, 60: 519, 61: 562, 62: 567, 63: 573, 64: 578, 65: 584, 66: 589, 67: 595, 68: 600, 69: 606, 70: 612, 71: 655, 72: 661, 73: 666, 74: 672, 75: 677, 76: 683, 77: 688, 78: 694, 79: 700, 80: 705, 81: 749, 82: 754, 83: 760, 84: 766, 85: 771, 86: 777, 87: 782, 88: 788, 89: 794, 90: 799 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 323,
    hp: 13103,
    def: 799,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "keqing-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "keqing-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.41022, 0.44361, 0.477, 0.5247, 0.55809, 0.59625, 0.64872, 0.70119, 0.75366, 0.8109, 0.86814, 0.92538, 0.98262, 1.03986, 1.0971]) },
            ],
          },
        ],
      },
      {
        id: "keqing-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "keqing-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.41022, 0.44361, 0.477, 0.5247, 0.55809, 0.59625, 0.64872, 0.70119, 0.75366, 0.8109, 0.86814, 0.92538, 0.98262, 1.03986, 1.0971]) },
            ],
          },
        ],
      },
      {
        id: "keqing-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "keqing-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.54438, 0.58869, 0.633, 0.6963, 0.74061, 0.79125, 0.86088, 0.93051, 1.00014, 1.0761, 1.15206, 1.22802, 1.30398, 1.37994, 1.4559]) },
            ],
          },
        ],
      },
      {
        id: "keqing-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "keqing-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.31476, 0.34038, 0.366, 0.4026, 0.42822, 0.4575, 0.49776, 0.53802, 0.57828, 0.6222, 0.66612, 0.71004, 0.75396, 0.79788, 0.8418]) },
              { stat: "atk", table: talentTable([0.344, 0.372, 0.4, 0.44, 0.468, 0.5, 0.544, 0.588, 0.632, 0.68, 0.728, 0.776, 0.824, 0.872, 0.92]) },
            ],
          },
        ],
      },
      {
        id: "keqing-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "keqing-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.66994, 0.72447, 0.779, 0.8569, 0.91143, 0.97375, 1.05944, 1.14513, 1.23082, 1.3243, 1.41778, 1.51126, 1.60474, 1.69822, 1.7917]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "keqing-charged",
      name: "Yunlai Swordsmanship",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "keqing-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.76798, 0.83049, 0.893, 0.9823, 1.04481, 1.11625, 1.21448, 1.31271, 1.41094, 1.5181, 1.62526, 1.73242, 1.83958, 1.94674, 2.0539]) },
            { stat: "atk", table: talentTable([0.86, 0.93, 1, 1.1, 1.17, 1.25, 1.36, 1.47, 1.58, 1.7, 1.82, 1.94, 2.06, 2.18, 2.3]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "keqing-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "keqing-plungeLow-1",
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
      id: "keqing-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "keqing-plungeHigh-1",
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
      id: "keqing-skill",
      name: "Stellar Restoration",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(7.5),
      energyCost: 0,
      particles: { count: 4, element: "electro" },
      instances: [
        {
          id: "keqing-skill-1",
          name: "Lightning Stiletto DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.504, 0.5418, 0.5796, 0.63, 0.6678, 0.7056, 0.756, 0.8064, 0.8568, 0.9072, 0.9576, 1.008, 1.071, 1.134, 1.197]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "keqing-skill-2",
          name: "Slashing DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.68, 1.806, 1.932, 2.1, 2.226, 2.352, 2.52, 2.688, 2.856, 3.024, 3.192, 3.36, 3.57, 3.78, 3.99]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "keqing-skill-3-1",
          name: "Thunderclap Slash DMG (1/2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "keqing-skill-3-2",
          name: "Thunderclap Slash DMG (2/2)",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "keqing-burst",
      name: "Starward Sword",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "keqing-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.88, 0.946, 1.012, 1.1, 1.166, 1.232, 1.32, 1.408, 1.496, 1.584, 1.672, 1.76, 1.87, 1.98, 2.09]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-1",
          name: "Consecutive Slash DMG (1/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-2",
          name: "Consecutive Slash DMG (2/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-3",
          name: "Consecutive Slash DMG (3/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-4",
          name: "Consecutive Slash DMG (4/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-5",
          name: "Consecutive Slash DMG (5/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-6",
          name: "Consecutive Slash DMG (6/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-7",
          name: "Consecutive Slash DMG (7/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-2-8",
          name: "Consecutive Slash DMG (8/8)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "keqing-burst-3",
          name: "Last Attack DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.888, 2.0296, 2.1712, 2.36, 2.5016, 2.6432, 2.832, 3.0208, 3.2096, 3.3984, 3.5872, 3.776, 4.012, 4.248, 4.484]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "keqing-a1", name: "Thundering Penance", unlockAscension: 1, effects: [] },
    { id: "keqing-a4", name: "Aristocratic Dignity", unlockAscension: 4, effects: [] },
    { id: "keqing-p3", name: "Land's Overseer", effects: [] },
  ],
  constellations: [
    { level: 1, id: "keqing-c1", name: "Thundering Might", effects: [] },
    { level: 2, id: "keqing-c2", name: "Keen Extraction", effects: [] },
    { level: 3, id: "keqing-c3", name: "Foreseen Reformation", effects: [], buffs: [{ id: "keqing-c3", source: "Foreseen Reformation", sourceCharacterId: "keqing", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "keqing-c4", name: "Attunement", effects: [] },
    { level: 5, id: "keqing-c5", name: "Beckoning Stars", effects: [], buffs: [{ id: "keqing-c5", source: "Beckoning Stars", sourceCharacterId: "keqing", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "keqing-c6", name: "Tenacious Star", effects: [] },
  ],
  resources: [],
};

export const kujouSara: GeneratedCharacter = {
  id: "kujou-sara",
  name: "Kujou Sara",
  element: "electro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 802, 2: 869, 3: 935, 4: 1001, 5: 1067, 6: 1134, 7: 1200, 8: 1266, 9: 1333, 10: 1399, 11: 1465, 12: 1531, 13: 1598, 14: 1663, 15: 1730, 16: 1797, 17: 1862, 18: 1929, 19: 1995, 20: 2061, 21: 2727, 22: 2793, 23: 2860, 24: 2926, 25: 2992, 26: 3058, 27: 3124, 28: 3190, 29: 3257, 30: 3323, 31: 3389, 32: 3456, 33: 3522, 34: 3588, 35: 3654, 36: 3721, 37: 3786, 38: 3853, 39: 3920, 40: 3985, 41: 4478, 42: 4544, 43: 4610, 44: 4676, 45: 4743, 46: 4809, 47: 4875, 48: 4942, 49: 5008, 50: 5074, 51: 5708, 52: 5774, 53: 5841, 54: 5907, 55: 5973, 56: 6039, 57: 6106, 58: 6172, 59: 6238, 60: 6305, 61: 6796, 62: 6863, 63: 6929, 64: 6995, 65: 7061, 66: 7128, 67: 7194, 68: 7260, 69: 7327, 70: 7393, 71: 7885, 72: 7951, 73: 8017, 74: 8084, 75: 8150, 76: 8216, 77: 8282, 78: 8349, 79: 8415, 80: 8481, 81: 8974, 82: 9040, 83: 9106, 84: 9172, 85: 9239, 86: 9304, 87: 9371, 88: 9437, 89: 9503, 90: 9570 } },
    atk: { byLevel: { 1: 16, 2: 18, 3: 19, 4: 20, 5: 22, 6: 23, 7: 24, 8: 26, 9: 27, 10: 29, 11: 30, 12: 31, 13: 33, 14: 34, 15: 35, 16: 37, 17: 38, 18: 39, 19: 41, 20: 42, 21: 56, 22: 57, 23: 58, 24: 60, 25: 61, 26: 62, 27: 64, 28: 65, 29: 67, 30: 68, 31: 69, 32: 71, 33: 72, 34: 73, 35: 75, 36: 76, 37: 77, 38: 79, 39: 80, 40: 81, 41: 91, 42: 93, 43: 94, 44: 95, 45: 97, 46: 98, 47: 100, 48: 101, 49: 102, 50: 104, 51: 117, 52: 118, 53: 119, 54: 121, 55: 122, 56: 123, 57: 125, 58: 126, 59: 127, 60: 129, 61: 139, 62: 140, 63: 141, 64: 143, 65: 144, 66: 146, 67: 147, 68: 148, 69: 150, 70: 151, 71: 161, 72: 162, 73: 164, 74: 165, 75: 166, 76: 168, 77: 169, 78: 170, 79: 172, 80: 173, 81: 183, 82: 185, 83: 186, 84: 187, 85: 189, 86: 190, 87: 191, 88: 193, 89: 194, 90: 195 } },
    def: { byLevel: { 1: 53, 2: 57, 3: 61, 4: 66, 5: 70, 6: 74, 7: 79, 8: 83, 9: 87, 10: 92, 11: 96, 12: 100, 13: 105, 14: 109, 15: 114, 16: 118, 17: 122, 18: 127, 19: 131, 20: 135, 21: 179, 22: 183, 23: 188, 24: 192, 25: 196, 26: 201, 27: 205, 28: 209, 29: 214, 30: 218, 31: 222, 32: 227, 33: 231, 34: 235, 35: 240, 36: 244, 37: 248, 38: 253, 39: 257, 40: 262, 41: 294, 42: 298, 43: 303, 44: 307, 45: 311, 46: 316, 47: 320, 48: 324, 49: 329, 50: 333, 51: 375, 52: 379, 53: 383, 54: 388, 55: 392, 56: 396, 57: 401, 58: 405, 59: 409, 60: 414, 61: 446, 62: 450, 63: 455, 64: 459, 65: 463, 66: 468, 67: 472, 68: 476, 69: 481, 70: 485, 71: 517, 72: 522, 73: 526, 74: 530, 75: 535, 76: 539, 77: 543, 78: 548, 79: 552, 80: 556, 81: 589, 82: 593, 83: 597, 84: 602, 85: 606, 86: 610, 87: 615, 88: 619, 89: 624, 90: 628 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 195,
    hp: 9570,
    def: 628,
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
        id: "kujou-sara-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kujou-sara-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.36894, 0.39897, 0.429, 0.4719, 0.50193, 0.53625, 0.58344, 0.63063, 0.67782, 0.7293, 0.78078, 0.83226, 0.88374, 0.93522, 0.9867]) },
            ],
          },
        ],
      },
      {
        id: "kujou-sara-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kujou-sara-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.387, 0.4185, 0.45, 0.495, 0.5265, 0.5625, 0.612, 0.6615, 0.711, 0.765, 0.819, 0.873, 0.927, 0.981, 1.035]) },
            ],
          },
        ],
      },
      {
        id: "kujou-sara-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kujou-sara-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.48504, 0.52452, 0.564, 0.6204, 0.65988, 0.705, 0.76704, 0.82908, 0.89112, 0.9588, 1.02648, 1.09416, 1.16184, 1.22952, 1.2972]) },
            ],
          },
        ],
      },
      {
        id: "kujou-sara-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kujou-sara-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.50396, 0.54498, 0.586, 0.6446, 0.68562, 0.7325, 0.79696, 0.86142, 0.92588, 0.9962, 1.06652, 1.13684, 1.20716, 1.27748, 1.3478]) },
            ],
          },
        ],
      },
      {
        id: "kujou-sara-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kujou-sara-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5805, 0.62775, 0.675, 0.7425, 0.78975, 0.84375, 0.918, 0.99225, 1.0665, 1.1475, 1.2285, 1.3095, 1.3905, 1.4715, 1.5525]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kujou-sara-charged",
      name: "Tengu Bowmanship",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kujou-sara-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "kujou-sara-charged-2",
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
      id: "kujou-sara-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kujou-sara-plungeLow-1",
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
      id: "kujou-sara-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kujou-sara-plungeHigh-1",
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
      id: "kujou-sara-skill",
      name: "Tengu Stormcall",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 3, element: "electro" },
      instances: [
        {
          id: "kujou-sara-skill-1",
          name: "Tengu Juurai: Ambush DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.2576, 1.35192, 1.44624, 1.572, 1.66632, 1.76064, 1.8864, 2.01216, 2.13792, 2.26368, 2.38944, 2.5152, 2.6724, 2.8296, 2.9868]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kujou-sara-burst",
      name: "Subjugation: Koukou Sendou",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "kujou-sara-burst-1",
          name: "Tengu Juurai: Titanbreaker DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.096, 4.4032, 4.7104, 5.12, 5.4272, 5.7344, 6.144, 6.5536, 6.9632, 7.3728, 7.7824, 8.192, 8.704, 9.216, 9.728]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "kujou-sara-burst-2",
          name: "Tengu Juurai: Stormcluster DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.3412, 0.36679, 0.39238, 0.4265, 0.45209, 0.47768, 0.5118, 0.54592, 0.58004, 0.61416, 0.64828, 0.6824, 0.72505, 0.7677, 0.81035]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kujou-sara-a1", name: "Immovable Will", unlockAscension: 1, effects: [] },
    { id: "kujou-sara-a4", name: "Decorum", unlockAscension: 4, effects: [] },
    { id: "kujou-sara-p3", name: "Land Survey", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kujou-sara-c1", name: "Crow's Eye", effects: [] },
    { level: 2, id: "kujou-sara-c2", name: "Dark Wings", effects: [] },
    { level: 3, id: "kujou-sara-c3", name: "The War Within", effects: [], buffs: [{ id: "kujou-sara-c3", source: "The War Within", sourceCharacterId: "kujou-sara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "kujou-sara-c4", name: "Conclusive Proof", effects: [] },
    { level: 5, id: "kujou-sara-c5", name: "Spellsinger", effects: [], buffs: [{ id: "kujou-sara-c5", source: "Spellsinger", sourceCharacterId: "kujou-sara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "kujou-sara-c6", name: "Sin of Pride", effects: [] },
  ],
  resources: [],
};

export const kukiShinobu: GeneratedCharacter = {
  id: "kuki-shinobu",
  name: "Kuki Shinobu",
  element: "electro",
  weaponType: "sword",
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
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "kuki-shinobu-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kuki-shinobu-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.48762, 0.52731, 0.567, 0.6237, 0.66339, 0.70875, 0.77112, 0.83349, 0.89586, 0.9639, 1.03194, 1.09998, 1.16802, 1.23606, 1.3041]) },
            ],
          },
        ],
      },
      {
        id: "kuki-shinobu-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kuki-shinobu-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44548, 0.48174, 0.518, 0.5698, 0.60606, 0.6475, 0.70448, 0.76146, 0.81844, 0.8806, 0.94276, 1.00492, 1.06708, 1.12924, 1.1914]) },
            ],
          },
        ],
      },
      {
        id: "kuki-shinobu-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kuki-shinobu-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5934, 0.6417, 0.69, 0.759, 0.8073, 0.8625, 0.9384, 1.0143, 1.0902, 1.173, 1.2558, 1.3386, 1.4214, 1.5042, 1.587]) },
            ],
          },
        ],
      },
      {
        id: "kuki-shinobu-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kuki-shinobu-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7611, 0.82305, 0.885, 0.9735, 1.03545, 1.10625, 1.2036, 1.30095, 1.3983, 1.5045, 1.6107, 1.7169, 1.8231, 1.9293, 2.0355]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kuki-shinobu-charged",
      name: "Shinobu's Shadowsword",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kuki-shinobu-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.556334, 0.601617, 0.6469, 0.71159, 0.756873, 0.808625, 0.879784, 0.950943, 1.022102, 1.09973, 1.177358, 1.254986, 1.332614, 1.410242, 1.48787]) },
            { stat: "atk", table: talentTable([0.667652, 0.721996, 0.77634, 0.853974, 0.908318, 0.970425, 1.055822, 1.14122, 1.226617, 1.319778, 1.412939, 1.5061, 1.59926, 1.692421, 1.785582]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kuki-shinobu-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kuki-shinobu-plungeLow-1",
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
      id: "kuki-shinobu-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kuki-shinobu-plungeHigh-1",
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
      id: "kuki-shinobu-skill",
      name: "Sanctifying Ring",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "kuki-shinobu-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.75712, 0.813904, 0.870688, 0.9464, 1.003184, 1.059968, 1.13568, 1.211392, 1.287104, 1.362816, 1.438528, 1.51424, 1.60888, 1.70352, 1.79816]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "kuki-shinobu-skill-2",
          name: "Grass Ring of Sanctification DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.2524, 0.27133, 0.29026, 0.3155, 0.33443, 0.35336, 0.3786, 0.40384, 0.42908, 0.45432, 0.47956, 0.5048, 0.53635, 0.5679, 0.59945]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kuki-shinobu-burst",
      name: "Gyoei Narukami Kariyama Rite",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "kuki-shinobu-burst-1",
          name: "Single Instance DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "hp", table: talentTable([0.036048, 0.038752, 0.041455, 0.04506, 0.047764, 0.050467, 0.054072, 0.057677, 0.061282, 0.064886, 0.068491, 0.072096, 0.076602, 0.081108, 0.085614]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "kuki-shinobu-burst-2",
          name: "Total DMG (1)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.252336, 0.271261, 0.290186, 0.31542, 0.334345, 0.35327, 0.378504, 0.403738, 0.428971, 0.454205, 0.479438, 0.504672, 0.536214, 0.567756, 0.599298]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "kuki-shinobu-burst-3",
          name: "Total DMG (2)",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "hp", table: talentTable([0.432576, 0.465019, 0.497462, 0.54072, 0.573163, 0.605606, 0.648864, 0.692122, 0.735379, 0.778637, 0.821894, 0.865152, 0.919224, 0.973296, 1.027368]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kuki-shinobu-a1", name: "Breaking Free", unlockAscension: 1, effects: [] },
    { id: "kuki-shinobu-a4", name: "Heart's Repose", unlockAscension: 4, effects: [] },
    { id: "kuki-shinobu-p3", name: "Protracted Prayers", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kuki-shinobu-c1", name: "To Cloister Compassion", effects: [] },
    { level: 2, id: "kuki-shinobu-c2", name: "To Forsake Fortune", effects: [] },
    { level: 3, id: "kuki-shinobu-c3", name: "To Sequester Sorrow", effects: [], buffs: [{ id: "kuki-shinobu-c3", source: "To Sequester Sorrow", sourceCharacterId: "kuki-shinobu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kuki-shinobu-c4", name: "To Sever Sealing", effects: [] },
    { level: 5, id: "kuki-shinobu-c5", name: "To Cease Courtesies", effects: [], buffs: [{ id: "kuki-shinobu-c5", source: "To Cease Courtesies", sourceCharacterId: "kuki-shinobu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kuki-shinobu-c6", name: "To Ward Weakness", effects: [] },
  ],
  resources: [],
};

export const lisa: GeneratedCharacter = {
  id: "lisa",
  name: "Lisa",
  element: "electro",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 802, 2: 869, 3: 935, 4: 1001, 5: 1067, 6: 1134, 7: 1200, 8: 1266, 9: 1333, 10: 1399, 11: 1465, 12: 1531, 13: 1598, 14: 1663, 15: 1730, 16: 1797, 17: 1862, 18: 1929, 19: 1995, 20: 2061, 21: 2727, 22: 2793, 23: 2860, 24: 2926, 25: 2992, 26: 3058, 27: 3124, 28: 3190, 29: 3257, 30: 3323, 31: 3389, 32: 3456, 33: 3522, 34: 3588, 35: 3654, 36: 3721, 37: 3786, 38: 3853, 39: 3920, 40: 3985, 41: 4478, 42: 4544, 43: 4610, 44: 4676, 45: 4743, 46: 4809, 47: 4875, 48: 4942, 49: 5008, 50: 5074, 51: 5708, 52: 5774, 53: 5841, 54: 5907, 55: 5973, 56: 6039, 57: 6106, 58: 6172, 59: 6238, 60: 6305, 61: 6796, 62: 6863, 63: 6929, 64: 6995, 65: 7061, 66: 7128, 67: 7194, 68: 7260, 69: 7327, 70: 7393, 71: 7885, 72: 7951, 73: 8017, 74: 8084, 75: 8150, 76: 8216, 77: 8282, 78: 8349, 79: 8415, 80: 8481, 81: 8974, 82: 9040, 83: 9106, 84: 9172, 85: 9239, 86: 9304, 87: 9371, 88: 9437, 89: 9503, 90: 9570 } },
    atk: { byLevel: { 1: 19, 2: 21, 3: 23, 4: 24, 5: 26, 6: 27, 7: 29, 8: 31, 9: 32, 10: 34, 11: 35, 12: 37, 13: 39, 14: 40, 15: 42, 16: 43, 17: 45, 18: 47, 19: 48, 20: 50, 21: 66, 22: 68, 23: 69, 24: 71, 25: 72, 26: 74, 27: 76, 28: 77, 29: 79, 30: 80, 31: 82, 32: 84, 33: 85, 34: 87, 35: 88, 36: 90, 37: 92, 38: 93, 39: 95, 40: 96, 41: 108, 42: 110, 43: 112, 44: 113, 45: 115, 46: 116, 47: 118, 48: 120, 49: 121, 50: 123, 51: 138, 52: 140, 53: 141, 54: 143, 55: 145, 56: 146, 57: 148, 58: 149, 59: 151, 60: 153, 61: 164, 62: 166, 63: 168, 64: 169, 65: 171, 66: 172, 67: 174, 68: 176, 69: 177, 70: 179, 71: 191, 72: 192, 73: 194, 74: 196, 75: 197, 76: 199, 77: 200, 78: 202, 79: 204, 80: 205, 81: 217, 82: 219, 83: 220, 84: 222, 85: 223, 86: 225, 87: 227, 88: 228, 89: 230, 90: 232 } },
    def: { byLevel: { 1: 48, 2: 52, 3: 56, 4: 60, 5: 64, 6: 68, 7: 72, 8: 76, 9: 80, 10: 84, 11: 88, 12: 92, 13: 96, 14: 100, 15: 104, 16: 108, 17: 112, 18: 116, 19: 119, 20: 123, 21: 163, 22: 167, 23: 171, 24: 175, 25: 179, 26: 183, 27: 187, 28: 191, 29: 195, 30: 199, 31: 203, 32: 207, 33: 211, 34: 215, 35: 219, 36: 223, 37: 227, 38: 231, 39: 235, 40: 239, 41: 268, 42: 272, 43: 276, 44: 280, 45: 284, 46: 288, 47: 292, 48: 296, 49: 300, 50: 304, 51: 342, 52: 346, 53: 350, 54: 354, 55: 358, 56: 362, 57: 366, 58: 370, 59: 374, 60: 378, 61: 407, 62: 411, 63: 415, 64: 419, 65: 423, 66: 427, 67: 431, 68: 435, 69: 439, 70: 443, 71: 472, 72: 476, 73: 480, 74: 484, 75: 488, 76: 492, 77: 496, 78: 500, 79: 504, 80: 508, 81: 538, 82: 542, 83: 546, 84: 549, 85: 553, 86: 557, 87: 561, 88: 565, 89: 569, 90: 573 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 232,
    hp: 9570,
    def: 573,
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
        id: "lisa-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lisa-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.396, 0.4257, 0.4554, 0.495, 0.5247, 0.5544, 0.594, 0.6336, 0.6732, 0.7128, 0.753984, 0.80784, 0.861696, 0.915552, 0.969408]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "lisa-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lisa-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.3592, 0.38614, 0.41308, 0.449, 0.47594, 0.50288, 0.5388, 0.57472, 0.61064, 0.64656, 0.683917, 0.732768, 0.781619, 0.83047, 0.879322]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "lisa-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lisa-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.428, 0.4601, 0.4922, 0.535, 0.5671, 0.5992, 0.642, 0.6848, 0.7276, 0.7704, 0.814912, 0.87312, 0.931328, 0.989536, 1.047744]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "lisa-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lisa-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.5496, 0.59082, 0.63204, 0.687, 0.72822, 0.76944, 0.8244, 0.87936, 0.93432, 0.98928, 1.046438, 1.121184, 1.19593, 1.270675, 1.345421]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "lisa-charged",
      name: "Lightning Touch",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lisa-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.7712, 1.90404, 2.03688, 2.214, 2.34684, 2.47968, 2.6568, 2.83392, 3.01104, 3.18816, 3.372365, 3.613248, 3.854131, 4.095014, 4.335898]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "lisa-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lisa-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "lisa-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lisa-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "lisa-skill",
      name: "Violet Arc",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 11, element: "electro" },
      instances: [
        {
          id: "lisa-skill-1",
          name: "Tapping DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.8, 0.86, 0.92, 1, 1.06, 1.12, 1.2, 1.28, 1.36, 1.44, 1.52, 1.6, 1.7, 1.8, 1.9]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "lisa-skill-2",
          name: "Non-Conductive Hold DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([3.2, 3.44, 3.68, 4, 4.24, 4.48, 4.8, 5.12, 5.44, 5.76, 6.08, 6.4, 6.8, 7.2, 7.6]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "lisa-skill-3",
          name: "Stack 1 Conductive Hold DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([3.68, 3.956, 4.232, 4.6, 4.876, 5.152, 5.52, 5.888, 6.256, 6.624, 6.992, 7.36, 7.82, 8.28, 8.74]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "lisa-skill-4",
          name: "Stack 2 Conductive Hold DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.24, 4.558, 4.876, 5.3, 5.618, 5.936, 6.36, 6.784, 7.208, 7.632, 8.056, 8.48, 9.01, 9.54, 10.07]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "lisa-skill-5",
          name: "Stack 3 Conductive Hold DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.872, 5.2374, 5.6028, 6.09, 6.4554, 6.8208, 7.308, 7.7952, 8.2824, 8.7696, 9.2568, 9.744, 10.353, 10.962, 11.571]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lisa-burst",
      name: "Lightning Rose",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "lisa-burst-1",
          name: "Discharge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.3656, 0.39302, 0.42044, 0.457, 0.48442, 0.51184, 0.5484, 0.58496, 0.62152, 0.65808, 0.69464, 0.7312, 0.7769, 0.8226, 0.8683]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "lisa-a1", name: "Induced Aftershock", unlockAscension: 1, effects: [] },
    { id: "lisa-a4", name: "Static Electricity Field", unlockAscension: 4, effects: [] },
    { id: "lisa-p3", name: "General Pharmaceutics", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lisa-c1", name: "Infinite Circuit", effects: [] },
    { level: 2, id: "lisa-c2", name: "Electromagnetic Field", effects: [] },
    { level: 3, id: "lisa-c3", name: "Resonant Thunder", effects: [], buffs: [{ id: "lisa-c3", source: "Resonant Thunder", sourceCharacterId: "lisa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "lisa-c4", name: "Plasma Eruption", effects: [] },
    { level: 5, id: "lisa-c5", name: "Electrocute", effects: [], buffs: [{ id: "lisa-c5", source: "Electrocute", sourceCharacterId: "lisa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "lisa-c6", name: "Pulsating Witch", effects: [] },
  ],
  resources: [],
};

export const ororon: GeneratedCharacter = {
  id: "ororon",
  name: "Ororon",
  element: "electro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 775, 2: 839, 3: 903, 4: 967, 5: 1031, 6: 1095, 7: 1159, 8: 1223, 9: 1287, 10: 1351, 11: 1415, 12: 1479, 13: 1543, 14: 1607, 15: 1671, 16: 1735, 17: 1799, 18: 1863, 19: 1927, 20: 1991, 21: 2634, 22: 2698, 23: 2762, 24: 2826, 25: 2890, 26: 2954, 27: 3018, 28: 3082, 29: 3146, 30: 3209, 31: 3274, 32: 3338, 33: 3402, 34: 3466, 35: 3529, 36: 3594, 37: 3657, 38: 3722, 39: 3786, 40: 3850, 41: 4325, 42: 4389, 43: 4453, 44: 4517, 45: 4581, 46: 4645, 47: 4709, 48: 4773, 49: 4837, 50: 4901, 51: 5513, 52: 5578, 53: 5642, 54: 5705, 55: 5770, 56: 5833, 57: 5898, 58: 5961, 59: 6025, 60: 6090, 61: 6565, 62: 6629, 63: 6693, 64: 6757, 65: 6820, 66: 6885, 67: 6949, 68: 7013, 69: 7077, 70: 7141, 71: 7616, 72: 7680, 73: 7744, 74: 7808, 75: 7872, 76: 7936, 77: 8000, 78: 8064, 79: 8128, 80: 8192, 81: 8668, 82: 8731, 83: 8796, 84: 8859, 85: 8924, 86: 8987, 87: 9051, 88: 9115, 89: 9179, 90: 9244 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 24, 4: 26, 5: 27, 6: 29, 7: 31, 8: 32, 9: 34, 10: 36, 11: 37, 12: 39, 13: 41, 14: 42, 15: 44, 16: 46, 17: 48, 18: 49, 19: 51, 20: 53, 21: 70, 22: 71, 23: 73, 24: 75, 25: 76, 26: 78, 27: 80, 28: 81, 29: 83, 30: 85, 31: 87, 32: 88, 33: 90, 34: 92, 35: 93, 36: 95, 37: 97, 38: 98, 39: 100, 40: 102, 41: 114, 42: 116, 43: 118, 44: 119, 45: 121, 46: 123, 47: 124, 48: 126, 49: 128, 50: 130, 51: 146, 52: 147, 53: 149, 54: 151, 55: 152, 56: 154, 57: 156, 58: 158, 59: 159, 60: 161, 61: 173, 62: 175, 63: 177, 64: 179, 65: 180, 66: 182, 67: 184, 68: 185, 69: 187, 70: 189, 71: 201, 72: 203, 73: 205, 74: 206, 75: 208, 76: 210, 77: 211, 78: 213, 79: 215, 80: 216, 81: 229, 82: 231, 83: 232, 84: 234, 85: 236, 86: 237, 87: 239, 88: 241, 89: 243, 90: 244 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 70, 7: 74, 8: 78, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 106, 16: 110, 17: 114, 18: 118, 19: 122, 20: 126, 21: 167, 22: 171, 23: 175, 24: 179, 25: 184, 26: 188, 27: 192, 28: 196, 29: 200, 30: 204, 31: 208, 32: 212, 33: 216, 34: 220, 35: 224, 36: 228, 37: 232, 38: 236, 39: 240, 40: 244, 41: 275, 42: 279, 43: 283, 44: 287, 45: 291, 46: 295, 47: 299, 48: 303, 49: 307, 50: 311, 51: 350, 52: 354, 53: 358, 54: 362, 55: 366, 56: 370, 57: 374, 58: 379, 59: 383, 60: 387, 61: 417, 62: 421, 63: 425, 64: 429, 65: 433, 66: 437, 67: 441, 68: 445, 69: 449, 70: 453, 71: 484, 72: 488, 73: 492, 74: 496, 75: 500, 76: 504, 77: 508, 78: 512, 79: 516, 80: 520, 81: 550, 82: 554, 83: 559, 84: 563, 85: 567, 86: 571, 87: 575, 88: 579, 89: 583, 90: 587 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 244,
    hp: 9244,
    def: 587,
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
        id: "ororon-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ororon-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.50642, 0.54764, 0.58886, 0.647746, 0.688966, 0.736075, 0.80085, 0.865624, 0.930399, 1.001062, 1.071725, 1.142388, 1.213052, 1.283715, 1.354378]) },
            ],
          },
        ],
      },
      {
        id: "ororon-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ororon-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.443734, 0.479852, 0.51597, 0.567567, 0.603685, 0.644963, 0.701719, 0.758476, 0.815233, 0.877149, 0.939065, 1.000982, 1.062898, 1.124815, 1.186731]) },
            ],
          },
        ],
      },
      {
        id: "ororon-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ororon-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.698208, 0.755039, 0.81187, 0.893057, 0.949888, 1.014838, 1.104143, 1.193449, 1.282755, 1.380179, 1.477603, 1.575028, 1.672452, 1.769877, 1.867301]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "ororon-charged",
      name: "Spiritvessel Snapshot",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ororon-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "ororon-charged-2",
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
      id: "ororon-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ororon-plungeLow-1",
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
      id: "ororon-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ororon-plungeHigh-1",
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
      id: "ororon-skill",
      name: "Night's Sling",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 3, element: "electro" },
      instances: [
        {
          id: "ororon-skill-1",
          name: "Spirit Orb DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.976, 2.1242, 2.2724, 2.47, 2.6182, 2.7664, 2.964, 3.1616, 3.3592, 3.5568, 3.7544, 3.952, 4.199, 4.446, 4.693]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "ororon-burst",
      name: "Dark Voices Echo",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "ororon-burst-1",
          name: "Ritual DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.74384, 1.874628, 2.005416, 2.1798, 2.310588, 2.441376, 2.61576, 2.790144, 2.964528, 3.138912, 3.313296, 3.48768, 3.70566, 3.92364, 4.14162]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "ororon-burst-2",
          name: "Soundwave Collision DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.332, 0.3569, 0.3818, 0.415, 0.4399, 0.4648, 0.498, 0.5312, 0.5644, 0.5976, 0.6308, 0.664, 0.7055, 0.747, 0.7885]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "ororon-a1", name: "Nightshade Synesthesia", unlockAscension: 1, effects: [] },
    { id: "ororon-a4", name: "Aspect Catalyst", unlockAscension: 4, effects: [] },
    { id: "ororon-p3", name: "Night Realm's Gift: Flowing Fog, Spritely Shadows", effects: [] },
    { id: "ororon-p4", name: "The Art of Skinchanging", effects: [] },
  ],
  constellations: [
    { level: 1, id: "ororon-c1", name: "Trails Amidst the Forest Fog", effects: [] },
    { level: 2, id: "ororon-c2", name: "King Bee of the Hidden Honeyed Wine", effects: [] },
    { level: 3, id: "ororon-c3", name: "Roosting Bat's Spiritcage", effects: [], buffs: [{ id: "ororon-c3", source: "Roosting Bat's Spiritcage", sourceCharacterId: "ororon", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "ororon-c4", name: "As the Mysteries of the Night Wind", effects: [] },
    { level: 5, id: "ororon-c5", name: "A Gift For the Soul", effects: [], buffs: [{ id: "ororon-c5", source: "A Gift For the Soul", sourceCharacterId: "ororon", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "ororon-c6", name: "Ode to Deep Springs", effects: [] },
  ],
  resources: [],
};

export const raidenShogun: GeneratedCharacter = {
  id: "raiden-shogun",
  name: "Raiden Shogun",
  element: "electro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1005, 2: 1088, 3: 1172, 4: 1256, 5: 1339, 6: 1424, 7: 1507, 8: 1592, 9: 1676, 10: 1759, 11: 1844, 12: 1928, 13: 2013, 14: 2098, 15: 2182, 16: 2267, 17: 2352, 18: 2437, 19: 2522, 20: 2606, 21: 3553, 22: 3639, 23: 3724, 24: 3810, 25: 3895, 26: 3981, 27: 4067, 28: 4152, 29: 4239, 30: 4324, 31: 4410, 32: 4497, 33: 4583, 34: 4669, 35: 4755, 36: 4843, 37: 4929, 38: 5015, 39: 5102, 40: 5189, 41: 5888, 42: 5975, 43: 6063, 44: 6149, 45: 6236, 46: 6324, 47: 6411, 48: 6499, 49: 6587, 50: 6675, 51: 7578, 52: 7667, 53: 7754, 54: 7842, 55: 7931, 56: 8019, 57: 8108, 58: 8196, 59: 8284, 60: 8373, 61: 9073, 62: 9162, 63: 9251, 64: 9340, 65: 9429, 66: 9519, 67: 9607, 68: 9696, 69: 9786, 70: 9875, 71: 10577, 72: 10667, 73: 10757, 74: 10846, 75: 10937, 76: 11026, 77: 11116, 78: 11207, 79: 11297, 80: 11388, 81: 12090, 82: 12181, 83: 12271, 84: 12362, 85: 12452, 86: 12543, 87: 12634, 88: 12725, 89: 12817, 90: 12907 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 31, 4: 33, 5: 35, 6: 37, 7: 39, 8: 42, 9: 44, 10: 46, 11: 48, 12: 50, 13: 53, 14: 55, 15: 57, 16: 59, 17: 61, 18: 64, 19: 66, 20: 68, 21: 93, 22: 95, 23: 97, 24: 100, 25: 102, 26: 104, 27: 106, 28: 108, 29: 111, 30: 113, 31: 115, 32: 117, 33: 120, 34: 122, 35: 124, 36: 127, 37: 129, 38: 131, 39: 133, 40: 136, 41: 154, 42: 156, 43: 158, 44: 161, 45: 163, 46: 165, 47: 168, 48: 170, 49: 172, 50: 174, 51: 198, 52: 200, 53: 203, 54: 205, 55: 207, 56: 210, 57: 212, 58: 214, 59: 216, 60: 219, 61: 237, 62: 239, 63: 242, 64: 244, 65: 246, 66: 249, 67: 251, 68: 253, 69: 256, 70: 258, 71: 276, 72: 279, 73: 281, 74: 283, 75: 286, 76: 288, 77: 290, 78: 293, 79: 295, 80: 298, 81: 316, 82: 318, 83: 321, 84: 323, 85: 325, 86: 328, 87: 330, 88: 332, 89: 335, 90: 337 } },
    def: { byLevel: { 1: 61, 2: 67, 3: 72, 4: 77, 5: 82, 6: 87, 7: 92, 8: 97, 9: 102, 10: 108, 11: 113, 12: 118, 13: 123, 14: 128, 15: 133, 16: 139, 17: 144, 18: 149, 19: 154, 20: 159, 21: 217, 22: 223, 23: 228, 24: 233, 25: 238, 26: 243, 27: 249, 28: 254, 29: 259, 30: 264, 31: 270, 32: 275, 33: 280, 34: 286, 35: 291, 36: 296, 37: 301, 38: 307, 39: 312, 40: 317, 41: 360, 42: 365, 43: 371, 44: 376, 45: 381, 46: 387, 47: 392, 48: 397, 49: 403, 50: 408, 51: 463, 52: 469, 53: 474, 54: 480, 55: 485, 56: 490, 57: 496, 58: 501, 59: 507, 60: 512, 61: 555, 62: 560, 63: 566, 64: 571, 65: 577, 66: 582, 67: 587, 68: 593, 69: 598, 70: 604, 71: 647, 72: 652, 73: 658, 74: 663, 75: 669, 76: 674, 77: 680, 78: 685, 79: 691, 80: 696, 81: 739, 82: 745, 83: 750, 84: 756, 85: 761, 86: 767, 87: 773, 88: 778, 89: 784, 90: 789 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.32],
  },
  baseStats: {
    atk: 337,
    hp: 12907,
    def: 789,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1.32,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 90,
  normalAttacks: {
    hits: [
      {
        id: "raiden-shogun-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "raiden-shogun-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.39646, 0.42873, 0.461, 0.5071, 0.53937, 0.57625, 0.62696, 0.67767, 0.72838, 0.7837, 0.847087, 0.921631, 0.996175, 1.070719, 1.152039]) },
            ],
          },
        ],
      },
      {
        id: "raiden-shogun-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "raiden-shogun-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.39732, 0.42966, 0.462, 0.5082, 0.54054, 0.5775, 0.62832, 0.67914, 0.72996, 0.7854, 0.848925, 0.92363, 0.998336, 1.073041, 1.154538]) },
            ],
          },
        ],
      },
      {
        id: "raiden-shogun-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "raiden-shogun-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4988, 0.5394, 0.58, 0.638, 0.6786, 0.725, 0.7888, 0.8526, 0.9164, 0.986, 1.06575, 1.159536, 1.253322, 1.347108, 1.44942]) },
            ],
          },
        ],
      },
      {
        id: "raiden-shogun-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "raiden-shogun-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.28982, 0.31341, 0.337, 0.3707, 0.39429, 0.42125, 0.45832, 0.49539, 0.53246, 0.5729, 0.619237, 0.67373, 0.728223, 0.782716, 0.842163]) },
              { stat: "atk", table: talentTable([0.28982, 0.31341, 0.337, 0.3707, 0.39429, 0.42125, 0.45832, 0.49539, 0.53246, 0.5729, 0.619237, 0.67373, 0.728223, 0.782716, 0.842163]) },
            ],
          },
        ],
      },
      {
        id: "raiden-shogun-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "raiden-shogun-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65446, 0.70773, 0.761, 0.8371, 0.89037, 0.95125, 1.03496, 1.11867, 1.20238, 1.2937, 1.398338, 1.521391, 1.644445, 1.767499, 1.901739]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "raiden-shogun-charged",
      name: "Origin",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "raiden-shogun-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.99588, 1.07694, 1.158, 1.2738, 1.35486, 1.4475, 1.57488, 1.70226, 1.82964, 1.9686, 2.127825, 2.315074, 2.502322, 2.689571, 2.893842]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "raiden-shogun-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "raiden-shogun-plungeLow-1",
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
      id: "raiden-shogun-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "raiden-shogun-plungeHigh-1",
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
      id: "raiden-shogun-skill",
      name: "Transcendence: Baleful Omen",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "raiden-shogun-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.172, 1.2599, 1.3478, 1.465, 1.5529, 1.6408, 1.758, 1.8752, 1.9924, 2.1096, 2.2268, 2.344, 2.4905, 2.637, 2.7835]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "raiden-shogun-skill-2",
          name: "Coordinated ATK DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.42, 0.4515, 0.483, 0.525, 0.5565, 0.588, 0.63, 0.672, 0.714, 0.756, 0.798, 0.84, 0.8925, 0.945, 0.9975]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "raiden-shogun-burst",
      name: "Secret Art: Musou Shinsetsu",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 90,
      instances: [
        {
          id: "raiden-shogun-burst-1",
          name: "Musou no Hitotachi Base DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.008, 4.3086, 4.6092, 5.01, 5.3106, 5.6112, 6.012, 6.4128, 6.8136, 7.2144, 7.6152, 8.016, 8.517, 9.018, 9.519]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-2",
          name: "1-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.447374, 0.477877, 0.50838, 0.54905, 0.579553, 0.61514, 0.660894, 0.706648, 0.752402, 0.798157, 0.843911, 0.889665, 0.935419, 0.981173, 1.026928]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-3",
          name: "2-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.43956, 0.46953, 0.4995, 0.53946, 0.56943, 0.604395, 0.64935, 0.694305, 0.73926, 0.784215, 0.82917, 0.874125, 0.91908, 0.964035, 1.00899]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-4",
          name: "3-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.538217, 0.574913, 0.61161, 0.660539, 0.697235, 0.740048, 0.795093, 0.850138, 0.905183, 0.960228, 1.015273, 1.070318, 1.125362, 1.180407, 1.235452]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-5",
          name: "4-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.30888, 0.32994, 0.351, 0.37908, 0.40014, 0.42471, 0.4563, 0.48789, 0.51948, 0.55107, 0.58266, 0.61425, 0.64584, 0.67743, 0.70902]) },
            { stat: "atk", table: talentTable([0.30976, 0.33088, 0.352, 0.38016, 0.40128, 0.42592, 0.4576, 0.48928, 0.52096, 0.55264, 0.58432, 0.616, 0.64768, 0.67936, 0.71104]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-6",
          name: "5-Hit DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.739438, 0.789854, 0.84027, 0.907492, 0.957908, 1.016727, 1.092351, 1.167975, 1.2436, 1.319224, 1.394848, 1.470473, 1.546097, 1.621721, 1.697345]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-7",
          name: "Charged Attack DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.616, 0.658, 0.7, 0.756, 0.798, 0.847, 0.91, 0.973, 1.036, 1.099, 1.162, 1.225, 1.288, 1.351, 1.414]) },
            { stat: "atk", table: talentTable([0.7436, 0.7943, 0.845, 0.9126, 0.9633, 1.02245, 1.0985, 1.17455, 1.2506, 1.32665, 1.4027, 1.47875, 1.5548, 1.63085, 1.7069]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-8",
          name: "Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024, 1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612, 1.70982]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-9",
          name: "Low Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "raiden-shogun-burst-10",
          name: "High Plunge DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "raiden-shogun-a1", name: "Wishes Unnumbered", unlockAscension: 1, effects: [] },
    { id: "raiden-shogun-a4", name: "Enlightened One", unlockAscension: 4, effects: [] },
    { id: "raiden-shogun-p4", name: "All-Preserver", effects: [] },
  ],
  constellations: [
    { level: 1, id: "raiden-shogun-c1", name: "Ominous Inscription", effects: [] },
    { level: 2, id: "raiden-shogun-c2", name: "Steelbreaker", effects: [] },
    { level: 3, id: "raiden-shogun-c3", name: "Shinkage Bygones", effects: [], buffs: [{ id: "raiden-shogun-c3", source: "Shinkage Bygones", sourceCharacterId: "raiden-shogun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "raiden-shogun-c4", name: "Pledge of Propriety", effects: [] },
    { level: 5, id: "raiden-shogun-c5", name: "Shogun's Descent", effects: [], buffs: [{ id: "raiden-shogun-c5", source: "Shogun's Descent", sourceCharacterId: "raiden-shogun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "raiden-shogun-c6", name: "Wishbearer", effects: [] },
  ],
  resources: [],
};

export const razor: GeneratedCharacter = {
  id: "razor",
  name: "Razor",
  element: "electro",
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
    stat: "physicalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.3],
  },
  baseStats: {
    atk: 234,
    hp: 11962,
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
        id: "razor-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "razor-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.9592, 1.0246, 1.09, 1.1772, 1.2426, 1.3189, 1.417, 1.5151, 1.6132, 1.7113, 1.8094, 1.9075, 2.0056, 2.1037, 2.2018]) },
            ],
          },
        ],
      },
      {
        id: "razor-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "razor-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.82632, 0.88266, 0.939, 1.01412, 1.07046, 1.13619, 1.2207, 1.30521, 1.38972, 1.47423, 1.55874, 1.64325, 1.72776, 1.81227, 1.89678]) },
            ],
          },
        ],
      },
      {
        id: "razor-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "razor-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.03312, 1.10356, 1.174, 1.26792, 1.33836, 1.42054, 1.5262, 1.63186, 1.73752, 1.84318, 1.94884, 2.0545, 2.16016, 2.26582, 2.37148]) },
            ],
          },
        ],
      },
      {
        id: "razor-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "razor-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.36048, 1.45324, 1.546, 1.66968, 1.76244, 1.87066, 2.0098, 2.14894, 2.28808, 2.42722, 2.56636, 2.7055, 2.84464, 2.98378, 3.12292]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "razor-charged",
      name: "Steel Fang",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "razor-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.625392, 0.676296, 0.7272, 0.79992, 0.850824, 0.909, 0.988992, 1.068984, 1.148976, 1.23624, 1.323504, 1.410768, 1.498032, 1.585296, 1.67256]) },
          ],
        },
        {
          id: "razor-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.1309, 1.22295, 1.315, 1.4465, 1.53855, 1.64375, 1.7884, 1.93305, 2.0777, 2.2355, 2.3933, 2.5511, 2.7089, 2.8667, 3.0245]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "razor-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "razor-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.640584, 1.77412, 1.907656, 2.098421, 2.231957, 2.38457, 2.594412, 2.804254, 3.014096, 3.243015, 3.471933, 3.700852, 3.929771, 4.15869, 4.387608]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "razor-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "razor-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([2.049178, 2.215971, 2.382765, 2.621042, 2.787835, 2.978456, 3.24056, 3.502665, 3.764769, 4.050701, 4.336632, 4.622564, 4.908496, 5.194428, 5.48036]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "razor-skill",
      name: "Claw and Thunder",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 7, element: "electro" },
      instances: [
        {
          id: "razor-skill-1",
          name: "Tap Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.992, 2.1414, 2.2908, 2.49, 2.6394, 2.7888, 2.988, 3.1872, 3.3864, 3.5856, 3.7848, 3.984, 4.233, 4.482, 4.731]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "razor-skill-2",
          name: "Hold Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.952, 3.1734, 3.3948, 3.69, 3.9114, 4.1328, 4.428, 4.7232, 5.0184, 5.3136, 5.6088, 5.904, 6.273, 6.642, 7.011]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "razor-burst",
      name: "Lightning Fang",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "razor-burst-1",
          name: "Burst DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.6, 1.72, 1.84, 2, 2.12, 2.24, 2.4, 2.56, 2.72, 2.88, 3.04, 3.2, 3.4, 3.6, 3.8]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "razor-burst-2",
          name: "Soul Companion DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "razor-a1", name: "Awakening", unlockAscension: 1, effects: [] },
    { id: "razor-a4", name: "Hunger", unlockAscension: 4, effects: [] },
    { id: "razor-p3", name: "Wolvensprint", effects: [] },
    { id: "razor-p4", name: "Witch's Eve Rite: Surge of Lightning", effects: [] },
  ],
  constellations: [
    { level: 1, id: "razor-c1", name: "Wolf's Instinct", effects: [] },
    { level: 2, id: "razor-c2", name: "Suppression", effects: [] },
    { level: 3, id: "razor-c3", name: "Soul Companion", effects: [], buffs: [{ id: "razor-c3", source: "Soul Companion", sourceCharacterId: "razor", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "razor-c4", name: "Bite", effects: [] },
    { level: 5, id: "razor-c5", name: "Sharpened Claws", effects: [], buffs: [{ id: "razor-c5", source: "Sharpened Claws", sourceCharacterId: "razor", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "razor-c6", name: "Lupus Fulguris", effects: [] },
  ],
  resources: [],
};

export const sethos: GeneratedCharacter = {
  id: "sethos",
  name: "Sethos",
  element: "electro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 821, 2: 889, 3: 956, 4: 1024, 5: 1091, 6: 1160, 7: 1227, 8: 1295, 9: 1363, 10: 1430, 11: 1498, 12: 1566, 13: 1634, 14: 1701, 15: 1769, 16: 1837, 17: 1905, 18: 1973, 19: 2040, 20: 2108, 21: 2788, 22: 2857, 23: 2925, 24: 2992, 25: 3060, 26: 3127, 27: 3196, 28: 3263, 29: 3331, 30: 3398, 31: 3466, 32: 3534, 33: 3602, 34: 3670, 35: 3737, 36: 3805, 37: 3873, 38: 3941, 39: 4009, 40: 4076, 41: 4580, 42: 4647, 43: 4715, 44: 4782, 45: 4851, 46: 4919, 47: 4986, 48: 5054, 49: 5121, 50: 5189, 51: 5837, 52: 5906, 53: 5974, 54: 6041, 55: 6109, 56: 6176, 57: 6245, 58: 6312, 59: 6380, 60: 6448, 61: 6951, 62: 7019, 63: 7086, 64: 7154, 65: 7222, 66: 7290, 67: 7358, 68: 7425, 69: 7493, 70: 7561, 71: 8064, 72: 8132, 73: 8200, 74: 8268, 75: 8335, 76: 8403, 77: 8471, 78: 8539, 79: 8606, 80: 8674, 81: 9178, 82: 9245, 83: 9313, 84: 9380, 85: 9449, 86: 9516, 87: 9584, 88: 9651, 89: 9719, 90: 9787 } },
    atk: { byLevel: { 1: 19, 2: 21, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 32, 10: 33, 11: 35, 12: 36, 13: 38, 14: 40, 15: 41, 16: 43, 17: 44, 18: 46, 19: 47, 20: 49, 21: 65, 22: 66, 23: 68, 24: 69, 25: 71, 26: 73, 27: 74, 28: 76, 29: 77, 30: 79, 31: 80, 32: 82, 33: 84, 34: 85, 35: 87, 36: 88, 37: 90, 38: 92, 39: 93, 40: 95, 41: 106, 42: 108, 43: 109, 44: 111, 45: 113, 46: 114, 47: 116, 48: 117, 49: 119, 50: 120, 51: 136, 52: 137, 53: 139, 54: 140, 55: 142, 56: 143, 57: 145, 58: 147, 59: 148, 60: 150, 61: 161, 62: 163, 63: 165, 64: 166, 65: 168, 66: 169, 67: 171, 68: 172, 69: 174, 70: 176, 71: 187, 72: 189, 73: 190, 74: 192, 75: 194, 76: 195, 77: 197, 78: 198, 79: 200, 80: 201, 81: 213, 82: 215, 83: 216, 84: 218, 85: 219, 86: 221, 87: 223, 88: 224, 89: 226, 90: 227 } },
    def: { byLevel: { 1: 47, 2: 51, 3: 55, 4: 59, 5: 62, 6: 66, 7: 70, 8: 74, 9: 78, 10: 82, 11: 86, 12: 90, 13: 93, 14: 97, 15: 101, 16: 105, 17: 109, 18: 113, 19: 117, 20: 121, 21: 159, 22: 163, 23: 167, 24: 171, 25: 175, 26: 179, 27: 183, 28: 187, 29: 190, 30: 194, 31: 198, 32: 202, 33: 206, 34: 210, 35: 214, 36: 218, 37: 221, 38: 225, 39: 229, 40: 233, 41: 262, 42: 266, 43: 270, 44: 273, 45: 277, 46: 281, 47: 285, 48: 289, 49: 293, 50: 297, 51: 334, 52: 338, 53: 342, 54: 345, 55: 349, 56: 353, 57: 357, 58: 361, 59: 365, 60: 369, 61: 397, 62: 401, 63: 405, 64: 409, 65: 413, 66: 417, 67: 421, 68: 425, 69: 428, 70: 432, 71: 461, 72: 465, 73: 469, 74: 473, 75: 477, 76: 481, 77: 484, 78: 488, 79: 492, 80: 496, 81: 525, 82: 529, 83: 533, 84: 536, 85: 540, 86: 544, 87: 548, 88: 552, 89: 556, 90: 560 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 227,
    hp: 9787,
    def: 560,
    elementalMastery: 96,
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
        id: "sethos-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sethos-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.526139, 0.568965, 0.61179, 0.672969, 0.715794, 0.764737, 0.832034, 0.899331, 0.966628, 1.040043, 1.113458, 1.186873, 1.260287, 1.333702, 1.407117]) },
            ],
          },
        ],
      },
      {
        id: "sethos-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sethos-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.237962, 0.257331, 0.2767, 0.30437, 0.323739, 0.345875, 0.376312, 0.406749, 0.437186, 0.47039, 0.503594, 0.536798, 0.570002, 0.603206, 0.63641]) },
              { stat: "atk", table: talentTable([0.266084, 0.287742, 0.3094, 0.34034, 0.361998, 0.38675, 0.420784, 0.454818, 0.488852, 0.52598, 0.563108, 0.600236, 0.637364, 0.674492, 0.71162]) },
            ],
          },
        ],
      },
      {
        id: "sethos-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sethos-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.739867, 0.800088, 0.86031, 0.946341, 1.006563, 1.075387, 1.170022, 1.264656, 1.35929, 1.462527, 1.565764, 1.669001, 1.772239, 1.875476, 1.978713]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sethos-charged",
      name: "Royal Reed Archery",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sethos-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "sethos-charged-2",
          name: "Aimed Shot Charge Level 1",
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
      id: "sethos-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sethos-plungeLow-1",
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
      id: "sethos-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sethos-plungeHigh-1",
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
      id: "sethos-skill",
      name: "Ancient Rite: The Thundering Sands",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      particles: { count: 2, element: "electro" },
      instances: [
        {
          id: "sethos-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.156, 1.2427, 1.3294, 1.445, 1.5317, 1.6184, 1.734, 1.8496, 1.9652, 2.0808, 2.1964, 2.312, 2.4565, 2.601, 2.7455]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sethos-burst",
      name: "Secret Rite: Twilight Shadowpiercer",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
      ],
    },
  passives: [
    { id: "sethos-a1", name: "Black Kite's Enigma", unlockAscension: 1, effects: [] },
    { id: "sethos-a4", name: "The Sand King's Boon", unlockAscension: 4, effects: [] },
    { id: "sethos-p3", name: "Thoth's Revelation", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sethos-c1", name: "Sealed Shrine's Spiritsong", effects: [] },
    { level: 2, id: "sethos-c2", name: "Papyrus Scripture of Silent Secrets", effects: [] },
    { level: 3, id: "sethos-c3", name: "Ode to the Moonrise Sage", effects: [], buffs: [{ id: "sethos-c3", source: "Ode to the Moonrise Sage", sourceCharacterId: "sethos", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "sethos-c4", name: "Beneficent Plumage", effects: [] },
    { level: 5, id: "sethos-c5", name: "Record of the Desolate God's Burning Sands", effects: [], buffs: [{ id: "sethos-c5", source: "Record of the Desolate God's Burning Sands", sourceCharacterId: "sethos", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "sethos-c6", name: "Pylon of the Sojourning Sun Temple", effects: [] },
  ],
  resources: [],
};

export const travelerFElectro: GeneratedCharacter = {
  id: "traveler-f-electro",
  name: "Traveler",
  element: "electro",
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
        id: "traveler-f-electro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-electro-na-1-1",
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
        id: "traveler-f-electro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-electro-na-2-1",
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
        id: "traveler-f-electro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-electro-na-3-1",
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
        id: "traveler-f-electro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-electro-na-4-1",
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
        id: "traveler-f-electro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-electro-na-5-1",
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
      id: "traveler-f-electro-charged",
      name: "Foreign Thundershock",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-electro-charged-1",
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
      id: "traveler-f-electro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-electro-plungeLow-1",
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
      id: "traveler-f-electro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-electro-plungeHigh-1",
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
      id: "traveler-f-electro-skill",
      name: "Lightning Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(13.5),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-electro-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.78664, 0.845638, 0.904636, 0.9833, 1.042298, 1.101296, 1.17996, 1.258624, 1.337288, 1.415952, 1.494616, 1.57328, 1.67161, 1.76994, 1.86827]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-electro-burst",
      name: "Bellowing Thunder",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-f-electro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.144, 1.2298, 1.3156, 1.43, 1.5158, 1.6016, 1.716, 1.8304, 1.9448, 2.0592, 2.1736, 2.288, 2.431, 2.574, 2.717]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "traveler-f-electro-burst-2",
          name: "Falling Thunder DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-electro-a1", name: "Thunderflash", unlockAscension: 1, effects: [] },
    { id: "traveler-f-electro-a4", name: "Resounding Roar", unlockAscension: 4, effects: [] },
    { id: "traveler-f-electro-p3", name: "Foreign Thundertrail", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-electro-c1", name: "Spring Thunder of Fertility", effects: [] },
    { level: 2, id: "traveler-f-electro-c2", name: "Violet Vehemence", effects: [] },
    { level: 3, id: "traveler-f-electro-c3", name: "Distant Crackling", effects: [], buffs: [{ id: "traveler-f-electro-c3", source: "Distant Crackling", sourceCharacterId: "traveler-f-electro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-f-electro-c4", name: "Fickle Cloudstrike", effects: [] },
    { level: 5, id: "traveler-f-electro-c5", name: "Clamor in the Wilds", effects: [], buffs: [{ id: "traveler-f-electro-c5", source: "Clamor in the Wilds", sourceCharacterId: "traveler-f-electro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-f-electro-c6", name: "World-Shaker", effects: [] },
  ],
  resources: [],
};

export const travelerMElectro: GeneratedCharacter = {
  id: "traveler-m-electro",
  name: "Traveler",
  element: "electro",
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
        id: "traveler-m-electro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-electro-na-1-1",
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
        id: "traveler-m-electro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-electro-na-2-1",
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
        id: "traveler-m-electro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-electro-na-3-1",
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
        id: "traveler-m-electro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-electro-na-4-1",
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
        id: "traveler-m-electro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-electro-na-5-1",
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
      id: "traveler-m-electro-charged",
      name: "Foreign Thundershock",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-electro-charged-1",
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
      id: "traveler-m-electro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-electro-plungeLow-1",
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
      id: "traveler-m-electro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-electro-plungeHigh-1",
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
      id: "traveler-m-electro-skill",
      name: "Lightning Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(13.5),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-electro-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.78664, 0.845638, 0.904636, 0.9833, 1.042298, 1.101296, 1.17996, 1.258624, 1.337288, 1.415952, 1.494616, 1.57328, 1.67161, 1.76994, 1.86827]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-electro-burst",
      name: "Bellowing Thunder",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-m-electro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.144, 1.2298, 1.3156, 1.43, 1.5158, 1.6016, 1.716, 1.8304, 1.9448, 2.0592, 2.1736, 2.288, 2.431, 2.574, 2.717]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "traveler-m-electro-burst-2",
          name: "Falling Thunder DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-electro-a1", name: "Thunderflash", unlockAscension: 1, effects: [] },
    { id: "traveler-m-electro-a4", name: "Resounding Roar", unlockAscension: 4, effects: [] },
    { id: "traveler-m-electro-p3", name: "Foreign Thundertrail", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-electro-c1", name: "Spring Thunder of Fertility", effects: [] },
    { level: 2, id: "traveler-m-electro-c2", name: "Violet Vehemence", effects: [] },
    { level: 3, id: "traveler-m-electro-c3", name: "Distant Crackling", effects: [], buffs: [{ id: "traveler-m-electro-c3", source: "Distant Crackling", sourceCharacterId: "traveler-m-electro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-m-electro-c4", name: "Fickle Cloudstrike", effects: [] },
    { level: 5, id: "traveler-m-electro-c5", name: "Clamor in the Wilds", effects: [], buffs: [{ id: "traveler-m-electro-c5", source: "Clamor in the Wilds", sourceCharacterId: "traveler-m-electro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-m-electro-c6", name: "World-Shaker", effects: [] },
  ],
  resources: [],
};

export const varesa: GeneratedCharacter = {
  id: "varesa",
  name: "Varesa",
  element: "electro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 989, 2: 1071, 3: 1153, 4: 1236, 5: 1318, 6: 1401, 7: 1483, 8: 1566, 9: 1649, 10: 1731, 11: 1814, 12: 1897, 13: 1980, 14: 2064, 15: 2147, 16: 2230, 17: 2314, 18: 2397, 19: 2481, 20: 2564, 21: 3496, 22: 3580, 23: 3664, 24: 3748, 25: 3832, 26: 3917, 27: 4001, 28: 4085, 29: 4170, 30: 4254, 31: 4339, 32: 4424, 33: 4509, 34: 4593, 35: 4678, 36: 4764, 37: 4849, 38: 4934, 39: 5019, 40: 5105, 41: 5793, 42: 5879, 43: 5965, 44: 6050, 45: 6136, 46: 6222, 47: 6308, 48: 6394, 49: 6481, 50: 6567, 51: 7456, 52: 7543, 53: 7629, 54: 7716, 55: 7803, 56: 7890, 57: 7977, 58: 8064, 59: 8151, 60: 8238, 61: 8927, 62: 9014, 63: 9102, 64: 9189, 65: 9277, 66: 9365, 67: 9452, 68: 9540, 69: 9628, 70: 9716, 71: 10406, 72: 10495, 73: 10583, 74: 10671, 75: 10760, 76: 10848, 77: 10937, 78: 11026, 79: 11115, 80: 11204, 81: 11895, 82: 11984, 83: 12073, 84: 12162, 85: 12251, 86: 12341, 87: 12430, 88: 12520, 89: 12610, 90: 12699 } },
    atk: { byLevel: { 1: 28, 2: 30, 3: 32, 4: 35, 5: 37, 6: 39, 7: 42, 8: 44, 9: 46, 10: 49, 11: 51, 12: 53, 13: 56, 14: 58, 15: 60, 16: 63, 17: 65, 18: 67, 19: 70, 20: 72, 21: 98, 22: 100, 23: 103, 24: 105, 25: 108, 26: 110, 27: 112, 28: 115, 29: 117, 30: 119, 31: 122, 32: 124, 33: 127, 34: 129, 35: 131, 36: 134, 37: 136, 38: 138, 39: 141, 40: 143, 41: 163, 42: 165, 43: 167, 44: 170, 45: 172, 46: 175, 47: 177, 48: 179, 49: 182, 50: 184, 51: 209, 52: 212, 53: 214, 54: 217, 55: 219, 56: 221, 57: 224, 58: 226, 59: 229, 60: 231, 61: 251, 62: 253, 63: 255, 64: 258, 65: 260, 66: 263, 67: 265, 68: 268, 69: 270, 70: 273, 71: 292, 72: 295, 73: 297, 74: 299, 75: 302, 76: 304, 77: 307, 78: 309, 79: 312, 80: 314, 81: 334, 82: 336, 83: 339, 84: 341, 85: 344, 86: 346, 87: 349, 88: 351, 89: 354, 90: 356 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 91, 8: 96, 9: 101, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 132, 16: 137, 17: 142, 18: 148, 19: 153, 20: 158, 21: 215, 22: 220, 23: 226, 24: 231, 25: 236, 26: 241, 27: 246, 28: 251, 29: 257, 30: 262, 31: 267, 32: 272, 33: 278, 34: 283, 35: 288, 36: 293, 37: 298, 38: 304, 39: 309, 40: 314, 41: 357, 42: 362, 43: 367, 44: 372, 45: 378, 46: 383, 47: 388, 48: 394, 49: 399, 50: 404, 51: 459, 52: 464, 53: 470, 54: 475, 55: 480, 56: 486, 57: 491, 58: 496, 59: 502, 60: 507, 61: 549, 62: 555, 63: 560, 64: 566, 65: 571, 66: 576, 67: 582, 68: 587, 69: 593, 70: 598, 71: 641, 72: 646, 73: 651, 74: 657, 75: 662, 76: 668, 77: 673, 78: 679, 79: 684, 80: 690, 81: 732, 82: 738, 83: 743, 84: 749, 85: 754, 86: 760, 87: 765, 88: 771, 89: 776, 90: 782 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 356,
    hp: 12699,
    def: 782,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "varesa-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varesa-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.467784, 0.502868, 0.537952, 0.58473, 0.619814, 0.654898, 0.701676, 0.748454, 0.795233, 0.842011, 0.88879, 0.935568, 0.994041, 1.052514, 1.110987]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "varesa-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varesa-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.40028, 0.430301, 0.460322, 0.50035, 0.530371, 0.560392, 0.60042, 0.640448, 0.680476, 0.720504, 0.760532, 0.80056, 0.850595, 0.90063, 0.950665]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "varesa-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varesa-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.563128, 0.605363, 0.647597, 0.70391, 0.746145, 0.788379, 0.844692, 0.901005, 0.957318, 1.01363, 1.069943, 1.126256, 1.196647, 1.267038, 1.337429]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "varesa-charged",
      name: "By the Horns",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varesa-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.8928, 0.95976, 1.02672, 1.116, 1.18296, 1.24992, 1.3392, 1.42848, 1.51776, 1.60704, 1.69632, 1.7856, 1.8972, 2.0088, 2.1204]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "varesa-charged-2",
          name: "Fiery Passion Charged Attack DMG",
          damageType: "charged",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.9264, 0.99588, 1.06536, 1.158, 1.22748, 1.29696, 1.3896, 1.48224, 1.57488, 1.66752, 1.76016, 1.8528, 1.9686, 2.0844, 2.2002]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "varesa-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varesa-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.49144, 1.612836, 1.734233, 1.907656, 2.029052, 2.167791, 2.358556, 2.549322, 2.740087, 2.948195, 3.156303, 3.364411, 3.572519, 3.780627, 3.988735]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "varesa-plungeLow-2",
          name: "Fiery Passion Low Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.23716, 2.419254, 2.601349, 2.861484, 3.043578, 3.251686, 3.537834, 3.823983, 4.110131, 4.422293, 4.734455, 5.046617, 5.358778, 5.67094, 5.983102]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "varesa-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varesa-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.862889, 2.01452, 2.16615, 2.382765, 2.534396, 2.707688, 2.945964, 3.184241, 3.422517, 3.682455, 3.942393, 4.202331, 4.462269, 4.722207, 4.982145]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "varesa-plungeHigh-2",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.794334, 3.021779, 3.249225, 3.574148, 3.801593, 4.061531, 4.418946, 4.776361, 5.133776, 5.523683, 5.91359, 6.303497, 6.693404, 7.083311, 7.473218]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "varesa-skill",
      name: "Riding the Night-Rainbow",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 3, element: "electro" },
      instances: [
        {
          id: "varesa-skill-1",
          name: "Rush DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.7448, 0.80066, 0.85652, 0.931, 0.98686, 1.04272, 1.1172, 1.19168, 1.26616, 1.34064, 1.41512, 1.4896, 1.5827, 1.6758, 1.7689]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "varesa-skill-2",
          name: "Fiery Passion Rush DMG",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.064, 1.1438, 1.2236, 1.33, 1.4098, 1.4896, 1.596, 1.7024, 1.8088, 1.9152, 2.0216, 2.128, 2.261, 2.394, 2.527]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "varesa-burst",
      name: "Guardian Vent!",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "varesa-burst-1",
          name: "Flying Kick DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([3.4512, 3.71004, 3.96888, 4.314, 4.57284, 4.83168, 5.1768, 5.52192, 5.86704, 6.21216, 6.55728, 6.9024, 7.3338, 7.7652, 8.1966]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "varesa-burst-2",
          name: "Fiery Passion Flying Kick DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([5.752, 6.1834, 6.6148, 7.19, 7.6214, 8.0528, 8.628, 9.2032, 9.7784, 10.3536, 10.9288, 11.504, 12.223, 12.942, 13.661]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "varesa-burst-3",
          name: "Volcano Kablam DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([4.0264, 4.32838, 4.63036, 5.033, 5.33498, 5.63696, 6.0396, 6.44224, 6.84488, 7.24752, 7.65016, 8.0528, 8.5561, 9.0594, 9.5627]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "varesa-a1", name: "Tag-Team Triple Jump!", unlockAscension: 1, effects: [] },
    { id: "varesa-a4", name: "The Hero Twice-Returned!", unlockAscension: 4, effects: [] },
    { id: "varesa-p3", name: "Night Realm's Gift: A Torch That Incinerates Evil", effects: [] },
    { id: "varesa-p4", name: "Blazing Heart, Singular Advance!", effects: [] },
  ],
  constellations: [
    { level: 1, id: "varesa-c1", name: "Undying Passion", effects: [] },
    { level: 2, id: "varesa-c2", name: "Beyond the Edge of Light", effects: [] },
    { level: 3, id: "varesa-c3", name: "Unbowed Resolve", effects: [], buffs: [{ id: "varesa-c3", source: "Unbowed Resolve", sourceCharacterId: "varesa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "varesa-c4", name: "The Courage to Press On", effects: [] },
    { level: 5, id: "varesa-c5", name: "Thoughts Floating on the Warm Breeze", effects: [], buffs: [{ id: "varesa-c5", source: "Thoughts Floating on the Warm Breeze", sourceCharacterId: "varesa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 6, id: "varesa-c6", name: "A Hero of Justice's Triumph", effects: [] },
  ],
  resources: [],
};

export const yaeMiko: GeneratedCharacter = {
  id: "yae-miko",
  name: "Yae Miko",
  element: "electro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 807, 2: 874, 3: 942, 4: 1009, 5: 1076, 6: 1144, 7: 1211, 8: 1279, 9: 1347, 10: 1414, 11: 1482, 12: 1550, 13: 1617, 14: 1686, 15: 1754, 16: 1822, 17: 1890, 18: 1958, 19: 2027, 20: 2095, 21: 2856, 22: 2924, 23: 2993, 24: 3061, 25: 3130, 26: 3199, 27: 3268, 28: 3337, 29: 3406, 30: 3475, 31: 3544, 32: 3614, 33: 3683, 34: 3752, 35: 3821, 36: 3891, 37: 3961, 38: 4030, 39: 4100, 40: 4170, 41: 4731, 42: 4802, 43: 4872, 44: 4941, 45: 5012, 46: 5082, 47: 5152, 48: 5222, 49: 5293, 50: 5364, 51: 6090, 52: 6161, 53: 6231, 54: 6302, 55: 6373, 56: 6444, 57: 6515, 58: 6586, 59: 6657, 60: 6729, 61: 7291, 62: 7363, 63: 7434, 64: 7505, 65: 7577, 66: 7649, 67: 7720, 68: 7792, 69: 7864, 70: 7936, 71: 8500, 72: 8572, 73: 8644, 74: 8716, 75: 8789, 76: 8861, 77: 8933, 78: 9006, 79: 9079, 80: 9151, 81: 9716, 82: 9788, 83: 9861, 84: 9934, 85: 10007, 86: 10080, 87: 10153, 88: 10226, 89: 10300, 90: 10372 } },
    atk: { byLevel: { 1: 26, 2: 29, 3: 31, 4: 33, 5: 35, 6: 37, 7: 40, 8: 42, 9: 44, 10: 46, 11: 49, 12: 51, 13: 53, 14: 55, 15: 57, 16: 60, 17: 62, 18: 64, 19: 66, 20: 69, 21: 94, 22: 96, 23: 98, 24: 100, 25: 102, 26: 105, 27: 107, 28: 109, 29: 112, 30: 114, 31: 116, 32: 118, 33: 121, 34: 123, 35: 125, 36: 127, 37: 130, 38: 132, 39: 134, 40: 137, 41: 155, 42: 157, 43: 160, 44: 162, 45: 164, 46: 166, 47: 169, 48: 171, 49: 173, 50: 176, 51: 199, 52: 202, 53: 204, 54: 206, 55: 209, 56: 211, 57: 213, 58: 216, 59: 218, 60: 220, 61: 239, 62: 241, 63: 243, 64: 246, 65: 248, 66: 250, 67: 253, 68: 255, 69: 258, 70: 260, 71: 278, 72: 281, 73: 283, 74: 285, 75: 288, 76: 290, 77: 293, 78: 295, 79: 297, 80: 300, 81: 318, 82: 321, 83: 323, 84: 325, 85: 328, 86: 330, 87: 332, 88: 335, 89: 337, 90: 340 } },
    def: { byLevel: { 1: 44, 2: 48, 3: 52, 4: 55, 5: 59, 6: 63, 7: 66, 8: 70, 9: 74, 10: 78, 11: 81, 12: 85, 13: 89, 14: 92, 15: 96, 16: 100, 17: 104, 18: 107, 19: 111, 20: 115, 21: 157, 22: 160, 23: 164, 24: 168, 25: 172, 26: 175, 27: 179, 28: 183, 29: 187, 30: 191, 31: 194, 32: 198, 33: 202, 34: 206, 35: 210, 36: 213, 37: 217, 38: 221, 39: 225, 40: 229, 41: 259, 42: 263, 43: 267, 44: 271, 45: 275, 46: 279, 47: 282, 48: 286, 49: 290, 50: 294, 51: 334, 52: 338, 53: 342, 54: 346, 55: 349, 56: 353, 57: 357, 58: 361, 59: 365, 60: 369, 61: 400, 62: 404, 63: 408, 64: 412, 65: 415, 66: 419, 67: 423, 68: 427, 69: 431, 70: 435, 71: 466, 72: 470, 73: 474, 74: 478, 75: 482, 76: 486, 77: 490, 78: 494, 79: 498, 80: 502, 81: 533, 82: 537, 83: 541, 84: 545, 85: 549, 86: 553, 87: 557, 88: 561, 89: 565, 90: 569 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 340,
    hp: 10372,
    def: 569,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 90,
  normalAttacks: {
    hits: [
      {
        id: "yae-miko-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yae-miko-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.396584, 0.426328, 0.456072, 0.49573, 0.525474, 0.555218, 0.594876, 0.634534, 0.674193, 0.713851, 0.75351, 0.793168, 0.842741, 0.892314, 0.941887]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "yae-miko-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yae-miko-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.385192, 0.414081, 0.442971, 0.48149, 0.510379, 0.539269, 0.577788, 0.616307, 0.654826, 0.693346, 0.731865, 0.770384, 0.818533, 0.866682, 0.914831]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
      {
        id: "yae-miko-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yae-miko-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "electro",
            scaling: [
              { stat: "atk", table: talentTable([0.568888, 0.611555, 0.654221, 0.71111, 0.753777, 0.796443, 0.853332, 0.910221, 0.96711, 1.023998, 1.080887, 1.137776, 1.208887, 1.279998, 1.351109]) },
            ],
            application: { element: "electro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yae-miko-charged",
      name: "Spiritfox Sin-Eater",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yae-miko-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.428948, 1.53612, 1.643291, 1.786185, 1.893357, 2.000528, 2.143423, 2.286317, 2.429212, 2.572107, 2.715002, 2.857897, 3.036515, 3.215134, 3.393752]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "yae-miko-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yae-miko-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "yae-miko-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yae-miko-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "yae-miko-skill",
      name: "Yakan Evocation: Sesshou Sakura",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(4),
      energyCost: 0,
      particles: { count: 1, element: "electro" },
      instances: [
        {
          id: "yae-miko-skill-1",
          name: "Sesshou Sakura DMG: Level 1",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.60672, 0.652224, 0.697728, 0.7584, 0.803904, 0.849408, 0.91008, 0.970752, 1.031424, 1.092096, 1.152768, 1.21344, 1.28928, 1.36512, 1.44096]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "yae-miko-skill-2",
          name: "Sesshou Sakura DMG: Level 2",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.7584, 0.81528, 0.87216, 0.948, 1.00488, 1.06176, 1.1376, 1.21344, 1.28928, 1.36512, 1.44096, 1.5168, 1.6116, 1.7064, 1.8012]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "yae-miko-skill-3",
          name: "Sesshou Sakura DMG: Level 3",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([0.948, 1.0191, 1.0902, 1.185, 1.2561, 1.3272, 1.422, 1.5168, 1.6116, 1.7064, 1.8012, 1.896, 2.0145, 2.133, 2.2515]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
        {
          id: "yae-miko-skill-4",
          name: "Sesshou Sakura DMG: Level 4",
          damageType: "skill",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([1.185, 1.273875, 1.36275, 1.48125, 1.570125, 1.659, 1.7775, 1.896, 2.0145, 2.133, 2.2515, 2.37, 2.518125, 2.66625, 2.814375]) },
          ],
          application: { element: "electro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yae-miko-burst",
      name: "Great Secret Art: Tenko Kenshin",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(22),
      energyCost: 90,
      instances: [
        {
          id: "yae-miko-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([2.6, 2.795, 2.99, 3.25, 3.445, 3.64, 3.9, 4.16, 4.42, 4.68, 4.94, 5.2, 5.525, 5.85, 6.175]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
        {
          id: "yae-miko-burst-2",
          name: "Tenko Thunderbolt DMG",
          damageType: "burst",
          element: "electro",
          scaling: [
            { stat: "atk", table: talentTable([3.33816, 3.588522, 3.838884, 4.1727, 4.423062, 4.673424, 5.00724, 5.341056, 5.674872, 6.008688, 6.342504, 6.67632, 7.09359, 7.51086, 7.92813]) },
          ],
          application: { element: "electro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yae-miko-a1", name: "The Shrine's Sacred Shade", unlockAscension: 1, effects: [] },
    { id: "yae-miko-a4", name: "Enlightened Blessing", unlockAscension: 4, effects: [] },
    { id: "yae-miko-p3", name: "Meditations of a Yako", effects: [] },
    { id: "yae-miko-p4", name: "Edict of Cleansing", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yae-miko-c1", name: "Yakan Offering", effects: [] },
    { level: 2, id: "yae-miko-c2", name: "Fox's Mooncall", effects: [] },
    { level: 3, id: "yae-miko-c3", name: "The Seven Glamours", effects: [], buffs: [{ id: "yae-miko-c3", source: "The Seven Glamours", sourceCharacterId: "yae-miko", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "yae-miko-c4", name: "Sakura Channeling", effects: [] },
    { level: 5, id: "yae-miko-c5", name: "Mischievous Teasing", effects: [], buffs: [{ id: "yae-miko-c5", source: "Mischievous Teasing", sourceCharacterId: "yae-miko", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "yae-miko-c6", name: "Forbidden Art: Daisesshou", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   alyosha.castTime: cast times are engine defaults, not sourced
//   alyosha.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   alyosha.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   beidou.castTime: cast times are engine defaults, not sourced
//   beidou.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   beidou.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   clorinde.castTime: cast times are engine defaults, not sourced
//   clorinde.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   clorinde.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   cyno.castTime: cast times are engine defaults, not sourced
//   cyno.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   cyno.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   dori.castTime: cast times are engine defaults, not sourced
//   dori.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   dori.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   fischl.castTime: cast times are engine defaults, not sourced
//   fischl.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   fischl.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   flins.castTime: cast times are engine defaults, not sourced
//   flins.constellations: 3 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   flins.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   iansan.castTime: cast times are engine defaults, not sourced
//   iansan.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   iansan.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   ineffa.castTime: cast times are engine defaults, not sourced
//   ineffa.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   ineffa.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   keqing.castTime: cast times are engine defaults, not sourced
//   keqing.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   keqing.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kujouSara.castTime: cast times are engine defaults, not sourced
//   kujouSara.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   kujouSara.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kukiShinobu.castTime: cast times are engine defaults, not sourced
//   kukiShinobu.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   kukiShinobu.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lisa.castTime: cast times are engine defaults, not sourced
//   lisa.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   lisa.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   ororon.castTime: cast times are engine defaults, not sourced
//   ororon.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   ororon.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   raidenShogun.castTime: cast times are engine defaults, not sourced
//   raidenShogun.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   raidenShogun.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   razor.castTime: cast times are engine defaults, not sourced
//   razor.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   razor.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sethos.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   sethos.castTime: cast times are engine defaults, not sourced
//   sethos.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   sethos.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFElectro.castTime: cast times are engine defaults, not sourced
//   travelerFElectro.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   travelerFElectro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFElectro.skill.particles: skill particle yield not published by either source
//   travelerMElectro.castTime: cast times are engine defaults, not sourced
//   travelerMElectro.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   travelerMElectro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMElectro.skill.particles: skill particle yield not published by either source
//   varesa.castTime: cast times are engine defaults, not sourced
//   varesa.constellations: 2 modelled, 6 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   varesa.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yaeMiko.castTime: cast times are engine defaults, not sourced
//   yaeMiko.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   yaeMiko.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const electroGeneratedCharacters: readonly GeneratedCharacter[] = [
  alyosha,
  beidou,
  clorinde,
  cyno,
  dori,
  fischl,
  flins,
  iansan,
  ineffa,
  keqing,
  kujouSara,
  kukiShinobu,
  lisa,
  ororon,
  raidenShogun,
  razor,
  sethos,
  travelerFElectro,
  travelerMElectro,
  varesa,
  yaeMiko,
];
