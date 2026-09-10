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


export const albedo: GeneratedCharacter = {
  id: "albedo",
  name: "Albedo",
  element: "geo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1030, 2: 1115, 3: 1200, 4: 1287, 5: 1372, 6: 1459, 7: 1544, 8: 1631, 9: 1717, 10: 1803, 11: 1889, 12: 1976, 13: 2062, 14: 2150, 15: 2236, 16: 2323, 17: 2410, 18: 2497, 19: 2584, 20: 2671, 21: 3641, 22: 3729, 23: 3816, 24: 3904, 25: 3991, 26: 4080, 27: 4167, 28: 4255, 29: 4343, 30: 4431, 31: 4519, 32: 4608, 33: 4696, 34: 4784, 35: 4872, 36: 4962, 37: 5051, 38: 5139, 39: 5228, 40: 5317, 41: 6033, 42: 6123, 43: 6212, 44: 6301, 45: 6390, 46: 6480, 47: 6569, 48: 6659, 49: 6750, 50: 6839, 51: 7765, 52: 7856, 53: 7945, 54: 8036, 55: 8126, 56: 8217, 57: 8308, 58: 8398, 59: 8489, 60: 8579, 61: 9297, 62: 9388, 63: 9480, 64: 9570, 65: 9662, 66: 9753, 67: 9844, 68: 9936, 69: 10027, 70: 10119, 71: 10838, 72: 10930, 73: 11022, 74: 11114, 75: 11206, 76: 11298, 77: 11391, 78: 11483, 79: 11576, 80: 11669, 81: 12389, 82: 12481, 83: 12574, 84: 12667, 85: 12759, 86: 12853, 87: 12946, 88: 13039, 89: 13133, 90: 13226 } },
    atk: { byLevel: { 1: 20, 2: 21, 3: 23, 4: 24, 5: 26, 6: 28, 7: 29, 8: 31, 9: 33, 10: 34, 11: 36, 12: 38, 13: 39, 14: 41, 15: 42, 16: 44, 17: 46, 18: 47, 19: 49, 20: 51, 21: 69, 22: 71, 23: 72, 24: 74, 25: 76, 26: 77, 27: 79, 28: 81, 29: 82, 30: 84, 31: 86, 32: 87, 33: 89, 34: 91, 35: 93, 36: 94, 37: 96, 38: 98, 39: 99, 40: 101, 41: 115, 42: 116, 43: 118, 44: 120, 45: 121, 46: 123, 47: 125, 48: 126, 49: 128, 50: 130, 51: 147, 52: 149, 53: 151, 54: 153, 55: 154, 56: 156, 57: 158, 58: 159, 59: 161, 60: 163, 61: 177, 62: 178, 63: 180, 64: 182, 65: 183, 66: 185, 67: 187, 68: 189, 69: 190, 70: 192, 71: 206, 72: 208, 73: 209, 74: 211, 75: 213, 76: 215, 77: 216, 78: 218, 79: 220, 80: 222, 81: 235, 82: 237, 83: 239, 84: 241, 85: 242, 86: 244, 87: 246, 88: 248, 89: 249, 90: 251 } },
    def: { byLevel: { 1: 68, 2: 74, 3: 80, 4: 85, 5: 91, 6: 97, 7: 102, 8: 108, 9: 114, 10: 119, 11: 125, 12: 131, 13: 137, 14: 142, 15: 148, 16: 154, 17: 160, 18: 165, 19: 171, 20: 177, 21: 241, 22: 247, 23: 253, 24: 259, 25: 264, 26: 270, 27: 276, 28: 282, 29: 288, 30: 294, 31: 299, 32: 305, 33: 311, 34: 317, 35: 323, 36: 329, 37: 335, 38: 340, 39: 346, 40: 352, 41: 400, 42: 406, 43: 412, 44: 417, 45: 423, 46: 429, 47: 435, 48: 441, 49: 447, 50: 453, 51: 514, 52: 520, 53: 526, 54: 532, 55: 538, 56: 544, 57: 550, 58: 556, 59: 562, 60: 568, 61: 616, 62: 622, 63: 628, 64: 634, 65: 640, 66: 646, 67: 652, 68: 658, 69: 664, 70: 670, 71: 718, 72: 724, 73: 730, 74: 736, 75: 742, 76: 748, 77: 755, 78: 761, 79: 767, 80: 773, 81: 821, 82: 827, 83: 833, 84: 839, 85: 845, 86: 851, 87: 858, 88: 864, 89: 870, 90: 876 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "geo",
  },
  baseStats: {
    atk: 251,
    hp: 13226,
    def: 876,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { geo: 0.28800000000000003 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "albedo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "albedo-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.367392, 0.397296, 0.4272, 0.46992, 0.499824, 0.534, 0.580992, 0.627984, 0.674976, 0.72624, 0.78498, 0.854058, 0.923136, 0.992215, 1.067573]) },
            ],
          },
        ],
      },
      {
        id: "albedo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "albedo-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.367392, 0.397296, 0.4272, 0.46992, 0.499824, 0.534, 0.580992, 0.627984, 0.674976, 0.72624, 0.78498, 0.854058, 0.923136, 0.992215, 1.067573]) },
            ],
          },
        ],
      },
      {
        id: "albedo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "albedo-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.474548, 0.513174, 0.5518, 0.60698, 0.645606, 0.68975, 0.750448, 0.811146, 0.871844, 0.93806, 1.013932, 1.103159, 1.192385, 1.281611, 1.378948]) },
            ],
          },
        ],
      },
      {
        id: "albedo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "albedo-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.49751, 0.538005, 0.5785, 0.63635, 0.676845, 0.723125, 0.78676, 0.850395, 0.91403, 0.98345, 1.062994, 1.156537, 1.250081, 1.343624, 1.445671]) },
            ],
          },
        ],
      },
      {
        id: "albedo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "albedo-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.620739, 0.671265, 0.72179, 0.793969, 0.844494, 0.902238, 0.981634, 1.061031, 1.140428, 1.227043, 1.326289, 1.443003, 1.559716, 1.676429, 1.803753]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "albedo-charged",
      name: "Favonius Bladework - Weiss",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "albedo-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.473, 0.5115, 0.55, 0.605, 0.6435, 0.6875, 0.748, 0.8085, 0.869, 0.935, 1.010625, 1.09956, 1.188495, 1.27743, 1.37445]) },
            { stat: "atk", table: talentTable([0.602, 0.651, 0.7, 0.77, 0.819, 0.875, 0.952, 1.029, 1.106, 1.19, 1.28625, 1.39944, 1.51263, 1.62582, 1.7493]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "albedo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "albedo-plungeLow-1",
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
      id: "albedo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "albedo-plungeHigh-1",
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
      id: "albedo-skill",
      name: "Abiogenesis: Solar Isotoma",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(4),
      energyCost: 0,
      particles: { count: 1, element: "geo" },
      instances: [
        {
          id: "albedo-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.304, 1.4018, 1.4996, 1.63, 1.7278, 1.8256, 1.956, 2.0864, 2.2168, 2.3472, 2.4776, 2.608, 2.771, 2.934, 3.097]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "albedo-skill-2",
          name: "Transient Blossom DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.336, 1.4362, 1.5364, 1.67, 1.7702, 1.8704, 2.004, 2.1376, 2.2712, 2.4048, 2.5384, 2.672, 2.839, 3.006, 3.173]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "albedo-burst",
      name: "Rite of Progeniture: Tectonic Tide",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "albedo-burst-1",
          name: "Burst DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([3.672, 3.9474, 4.2228, 4.59, 4.8654, 5.1408, 5.508, 5.8752, 6.2424, 6.6096, 6.9768, 7.344, 7.803, 8.262, 8.721]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "albedo-burst-2",
          name: "Fatal Blossom DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.72, 0.774, 0.828, 0.9, 0.954, 1.008, 1.08, 1.152, 1.224, 1.296, 1.368, 1.44, 1.53, 1.62, 1.71]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "albedo-a1", name: "Calcite Might", unlockAscension: 1, effects: [] },
    { id: "albedo-a4", name: "Homuncular Nature", unlockAscension: 4, effects: [] },
    { id: "albedo-p3", name: "Flash of Genius", effects: [] },
    { id: "albedo-p4", name: "Witch's Eve Rite: Book of Blinding Light", effects: [] },
  ],
  constellations: [
    { level: 1, id: "albedo-c1", name: "Flower of Eden", effects: [] },
    { level: 2, id: "albedo-c2", name: "Opening of Phanerozoic", effects: [] },
    { level: 3, id: "albedo-c3", name: "Grace of Helios", effects: [], buffs: [{ id: "albedo-c3", source: "Grace of Helios", sourceCharacterId: "albedo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "albedo-c4", name: "Descent of Divinity", effects: [] },
    { level: 5, id: "albedo-c5", name: "Tide of Hadean", effects: [], buffs: [{ id: "albedo-c5", source: "Tide of Hadean", sourceCharacterId: "albedo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "albedo-c6", name: "Dust of Purification", effects: [] },
  ],
  resources: [],
};

export const aratakiItto: GeneratedCharacter = {
  id: "arataki-itto",
  name: "Arataki Itto",
  element: "geo",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1001, 2: 1084, 3: 1167, 4: 1251, 5: 1334, 6: 1418, 7: 1501, 8: 1586, 9: 1670, 10: 1753, 11: 1837, 12: 1921, 13: 2005, 14: 2090, 15: 2174, 16: 2258, 17: 2343, 18: 2427, 19: 2512, 20: 2597, 21: 3540, 22: 3625, 23: 3710, 24: 3795, 25: 3880, 26: 3966, 27: 4051, 28: 4136, 29: 4223, 30: 4308, 31: 4394, 32: 4480, 33: 4566, 34: 4651, 35: 4737, 36: 4824, 37: 4910, 38: 4996, 39: 5082, 40: 5170, 41: 5865, 42: 5952, 43: 6040, 44: 6126, 45: 6213, 46: 6300, 47: 6387, 48: 6474, 49: 6562, 50: 6649, 51: 7549, 52: 7637, 53: 7725, 54: 7813, 55: 7901, 56: 7989, 57: 8077, 58: 8165, 59: 8253, 60: 8341, 61: 9039, 62: 9127, 63: 9216, 64: 9304, 65: 9393, 66: 9482, 67: 9571, 68: 9660, 69: 9749, 70: 9838, 71: 10537, 72: 10627, 73: 10716, 74: 10805, 75: 10895, 76: 10984, 77: 11074, 78: 11164, 79: 11254, 80: 11345, 81: 12044, 82: 12134, 83: 12225, 84: 12315, 85: 12405, 86: 12496, 87: 12586, 88: 12677, 89: 12768, 90: 12858 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 32, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 63, 22: 64, 23: 66, 24: 67, 25: 69, 26: 70, 27: 72, 28: 73, 29: 75, 30: 76, 31: 78, 32: 79, 33: 81, 34: 82, 35: 84, 36: 85, 37: 87, 38: 88, 39: 90, 40: 91, 41: 104, 42: 105, 43: 107, 44: 108, 45: 110, 46: 111, 47: 113, 48: 114, 49: 116, 50: 117, 51: 133, 52: 135, 53: 137, 54: 138, 55: 140, 56: 141, 57: 143, 58: 144, 59: 146, 60: 147, 61: 160, 62: 161, 63: 163, 64: 164, 65: 166, 66: 168, 67: 169, 68: 171, 69: 172, 70: 174, 71: 186, 72: 188, 73: 189, 74: 191, 75: 193, 76: 194, 77: 196, 78: 197, 79: 199, 80: 200, 81: 213, 82: 214, 83: 216, 84: 218, 85: 219, 86: 221, 87: 222, 88: 224, 89: 226, 90: 227 } },
    def: { byLevel: { 1: 75, 2: 81, 3: 87, 4: 93, 5: 100, 6: 106, 7: 112, 8: 118, 9: 125, 10: 131, 11: 137, 12: 143, 13: 150, 14: 156, 15: 162, 16: 168, 17: 175, 18: 181, 19: 187, 20: 194, 21: 264, 22: 270, 23: 277, 24: 283, 25: 289, 26: 296, 27: 302, 28: 309, 29: 315, 30: 321, 31: 328, 32: 334, 33: 341, 34: 347, 35: 353, 36: 360, 37: 366, 38: 373, 39: 379, 40: 386, 41: 438, 42: 444, 43: 451, 44: 457, 45: 463, 46: 470, 47: 476, 48: 483, 49: 489, 50: 496, 51: 563, 52: 570, 53: 576, 54: 583, 55: 589, 56: 596, 57: 602, 58: 609, 59: 616, 60: 622, 61: 674, 62: 681, 63: 687, 64: 694, 65: 701, 66: 707, 67: 714, 68: 721, 69: 727, 70: 734, 71: 786, 72: 793, 73: 799, 74: 806, 75: 813, 76: 819, 77: 826, 78: 833, 79: 840, 80: 846, 81: 898, 82: 905, 83: 912, 84: 919, 85: 925, 86: 932, 87: 939, 88: 946, 89: 952, 90: 959 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 227,
    hp: 12858,
    def: 959,
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
        id: "arataki-itto-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arataki-itto-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.792318, 0.856809, 0.9213, 1.01343, 1.077921, 1.151625, 1.252968, 1.354311, 1.455654, 1.56621, 1.692889, 1.841863, 1.990837, 2.139811, 2.302329]) },
            ],
          },
        ],
      },
      {
        id: "arataki-itto-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arataki-itto-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.76368, 0.82584, 0.888, 0.9768, 1.03896, 1.11, 1.20768, 1.30536, 1.40304, 1.5096, 1.6317, 1.77529, 1.918879, 2.062469, 2.219112]) },
            ],
          },
        ],
      },
      {
        id: "arataki-itto-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arataki-itto-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.916416, 0.991008, 1.0656, 1.17216, 1.246752, 1.332, 1.449216, 1.566432, 1.683648, 1.81152, 1.95804, 2.130348, 2.302655, 2.474963, 2.662934]) },
            ],
          },
        ],
      },
      {
        id: "arataki-itto-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arataki-itto-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.172249, 1.267664, 1.36308, 1.499388, 1.594804, 1.70385, 1.853789, 2.003728, 2.153666, 2.317236, 2.504659, 2.72507, 2.94548, 3.16589, 3.406337]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  plungeLow:
    {
      id: "arataki-itto-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "arataki-itto-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.636323, 1.769512, 1.902701, 2.092971, 2.22616, 2.378376, 2.587673, 2.79697, 3.006267, 3.234591, 3.462915, 3.69124, 3.919564, 4.147888, 4.376212]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "arataki-itto-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "arataki-itto-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([2.043855, 2.210216, 2.376576, 2.614234, 2.780594, 2.97072, 3.232143, 3.493567, 3.75499, 4.040179, 4.325368, 4.610557, 4.895747, 5.180936, 5.466125]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "arataki-itto-skill",
      name: "Masatsu Zetsugi: Akaushi Burst!",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 7, element: "geo" },
      instances: [
        {
          id: "arataki-itto-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([3.072, 3.3024, 3.5328, 3.84, 4.0704, 4.3008, 4.608, 4.9152, 5.2224, 5.5296, 5.8368, 6.144, 6.528, 6.912, 7.296]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "arataki-itto-burst",
      name: "Royal Descent: Behold, Itto the Evil!",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
      ],
    },
  passives: [
    { id: "arataki-itto-a1", name: "Arataki Ichiban", unlockAscension: 1, effects: [] },
    { id: "arataki-itto-a4", name: "Bloodline of the Crimson Oni", unlockAscension: 4, effects: [] },
    { id: "arataki-itto-p3", name: "Woodchuck Chucked", effects: [] },
  ],
  constellations: [
    { level: 1, id: "arataki-itto-c1", name: "Stay a While and Listen Up", effects: [] },
    { level: 2, id: "arataki-itto-c2", name: "Gather 'Round, It's a Brawl!", effects: [] },
    { level: 3, id: "arataki-itto-c3", name: "Horns Lowered, Coming Through", effects: [], buffs: [{ id: "arataki-itto-c3", source: "Horns Lowered, Coming Through", sourceCharacterId: "arataki-itto", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "arataki-itto-c4", name: "Jailhouse Bread and Butter", effects: [] },
    { level: 5, id: "arataki-itto-c5", name: "10 Years of Hanamizaka Fame", effects: [], buffs: [{ id: "arataki-itto-c5", source: "10 Years of Hanamizaka Fame", sourceCharacterId: "arataki-itto", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "arataki-itto-c6", name: "Arataki Itto, Present!", effects: [] },
  ],
  resources: [],
};

export const chiori: GeneratedCharacter = {
  id: "chiori",
  name: "Chiori",
  element: "geo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 890, 2: 964, 3: 1038, 4: 1113, 5: 1187, 6: 1262, 7: 1336, 8: 1410, 9: 1485, 10: 1559, 11: 1634, 12: 1709, 13: 1783, 14: 1859, 15: 1934, 16: 2009, 17: 2084, 18: 2159, 19: 2235, 20: 2310, 21: 3149, 22: 3225, 23: 3300, 24: 3376, 25: 3452, 26: 3528, 27: 3604, 28: 3680, 29: 3756, 30: 3832, 31: 3908, 32: 3985, 33: 4061, 34: 4137, 35: 4214, 36: 4291, 37: 4368, 38: 4444, 39: 4521, 40: 4598, 41: 5217, 42: 5295, 43: 5372, 44: 5449, 45: 5526, 46: 5604, 47: 5681, 48: 5759, 49: 5837, 50: 5915, 51: 6715, 52: 6794, 53: 6871, 54: 6949, 55: 7028, 56: 7106, 57: 7185, 58: 7263, 59: 7341, 60: 7420, 61: 8040, 62: 8119, 63: 8198, 64: 8276, 65: 8356, 66: 8435, 67: 8513, 68: 8592, 69: 8672, 70: 8751, 71: 9373, 72: 9453, 73: 9532, 74: 9611, 75: 9691, 76: 9771, 77: 9851, 78: 9931, 79: 10011, 80: 10091, 81: 10714, 82: 10794, 83: 10874, 84: 10954, 85: 11034, 86: 11115, 87: 11195, 88: 11277, 89: 11358, 90: 11438 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 31, 5: 34, 6: 36, 7: 38, 8: 40, 9: 42, 10: 44, 11: 46, 12: 48, 13: 50, 14: 52, 15: 55, 16: 57, 17: 59, 18: 61, 19: 63, 20: 65, 21: 89, 22: 91, 23: 93, 24: 95, 25: 97, 26: 100, 27: 102, 28: 104, 29: 106, 30: 108, 31: 110, 32: 112, 33: 115, 34: 117, 35: 119, 36: 121, 37: 123, 38: 125, 39: 128, 40: 130, 41: 147, 42: 149, 43: 152, 44: 154, 45: 156, 46: 158, 47: 160, 48: 163, 49: 165, 50: 167, 51: 190, 52: 192, 53: 194, 54: 196, 55: 198, 56: 201, 57: 203, 58: 205, 59: 207, 60: 209, 61: 227, 62: 229, 63: 231, 64: 234, 65: 236, 66: 238, 67: 240, 68: 243, 69: 245, 70: 247, 71: 265, 72: 267, 73: 269, 74: 271, 75: 274, 76: 276, 77: 278, 78: 280, 79: 283, 80: 285, 81: 302, 82: 305, 83: 307, 84: 309, 85: 312, 86: 314, 87: 316, 88: 318, 89: 321, 90: 323 } },
    def: { byLevel: { 1: 74, 2: 80, 3: 87, 4: 93, 5: 99, 6: 105, 7: 111, 8: 118, 9: 124, 10: 130, 11: 136, 12: 142, 13: 149, 14: 155, 15: 161, 16: 167, 17: 174, 18: 180, 19: 186, 20: 192, 21: 262, 22: 269, 23: 275, 24: 281, 25: 288, 26: 294, 27: 300, 28: 307, 29: 313, 30: 319, 31: 326, 32: 332, 33: 338, 34: 345, 35: 351, 36: 358, 37: 364, 38: 370, 39: 377, 40: 383, 41: 435, 42: 441, 43: 448, 44: 454, 45: 460, 46: 467, 47: 473, 48: 480, 49: 486, 50: 493, 51: 560, 52: 566, 53: 573, 54: 579, 55: 586, 56: 592, 57: 599, 58: 605, 59: 612, 60: 618, 61: 670, 62: 676, 63: 683, 64: 690, 65: 696, 66: 703, 67: 709, 68: 716, 69: 723, 70: 729, 71: 781, 72: 788, 73: 794, 74: 801, 75: 808, 76: 814, 77: 821, 78: 827, 79: 834, 80: 841, 81: 893, 82: 899, 83: 906, 84: 913, 85: 919, 86: 926, 87: 933, 88: 940, 89: 946, 90: 953 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 323,
    hp: 11438,
    def: 953,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 50,
  normalAttacks: {
    hits: [
      {
        id: "chiori-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chiori-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.494104, 0.534322, 0.57454, 0.631994, 0.672212, 0.718175, 0.781374, 0.844574, 0.907773, 0.976718, 1.045663, 1.114608, 1.183552, 1.252497, 1.321442]) },
            ],
          },
        ],
      },
      {
        id: "chiori-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chiori-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.468339, 0.506459, 0.54458, 0.599038, 0.637159, 0.680725, 0.740629, 0.800533, 0.860436, 0.925786, 0.991136, 1.056485, 1.121835, 1.187184, 1.252534]) },
            ],
          },
        ],
      },
      {
        id: "chiori-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chiori-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.304165, 0.328922, 0.35368, 0.389048, 0.413806, 0.4421, 0.481005, 0.51991, 0.558814, 0.601256, 0.643698, 0.686139, 0.728581, 0.771022, 0.813464]) },
              { stat: "atk", table: talentTable([0.304165, 0.328922, 0.35368, 0.389048, 0.413806, 0.4421, 0.481005, 0.51991, 0.558814, 0.601256, 0.643698, 0.686139, 0.728581, 0.771022, 0.813464]) },
            ],
          },
        ],
      },
      {
        id: "chiori-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chiori-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.751227, 0.812374, 0.87352, 0.960872, 1.022018, 1.0919, 1.187987, 1.284074, 1.380162, 1.484984, 1.589806, 1.694629, 1.799451, 1.904274, 2.009096]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "chiori-charged",
      name: "Weaving Blade",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chiori-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.54309, 0.587295, 0.6315, 0.69465, 0.738855, 0.789375, 0.85884, 0.928305, 0.99777, 1.07355, 1.14933, 1.22511, 1.30089, 1.37667, 1.45245]) },
            { stat: "atk", table: talentTable([0.54309, 0.587295, 0.6315, 0.69465, 0.738855, 0.789375, 0.85884, 0.928305, 0.99777, 1.07355, 1.14933, 1.22511, 1.30089, 1.37667, 1.45245]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "chiori-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chiori-plungeLow-1",
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
      id: "chiori-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chiori-plungeHigh-1",
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
      id: "chiori-skill",
      name: "Fluttering Hasode",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 3, element: "geo" },
      instances: [
        {
          id: "chiori-skill-1",
          name: "Tamoto DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.8208, 0.88236, 0.94392, 1.026, 1.08756, 1.14912, 1.2312, 1.31328, 1.39536, 1.47744, 1.55952, 1.6416, 1.7442, 1.8468, 1.9494]) },
            { stat: "def", table: talentTable([1.026, 1.10295, 1.1799, 1.2825, 1.35945, 1.4364, 1.539, 1.6416, 1.7442, 1.8468, 1.9494, 2.052, 2.18025, 2.3085, 2.43675]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "chiori-skill-2",
          name: "Upward Sweep Attack DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.4928, 1.60476, 1.71672, 1.866, 1.97796, 2.08992, 2.2392, 2.38848, 2.53776, 2.68704, 2.83632, 2.9856, 3.1722, 3.3588, 3.5454]) },
            { stat: "def", table: talentTable([1.866, 2.00595, 2.1459, 2.3325, 2.47245, 2.6124, 2.799, 2.9856, 3.1722, 3.3588, 3.5454, 3.732, 3.96525, 4.1985, 4.43175]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "chiori-burst",
      name: "Hiyoku: Twin Blades",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(13.5),
      energyCost: 50,
      instances: [
        {
          id: "chiori-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([2.5632, 2.75544, 2.94768, 3.204, 3.39624, 3.58848, 3.8448, 4.10112, 4.35744, 4.61376, 4.87008, 5.1264, 5.4468, 5.7672, 6.0876]) },
            { stat: "def", table: talentTable([3.204, 3.4443, 3.6846, 4.005, 4.2453, 4.4856, 4.806, 5.1264, 5.4468, 5.7672, 6.0876, 6.408, 6.8085, 7.209, 7.6095]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "chiori-a1", name: "Tailor-Made", unlockAscension: 1, effects: [] },
    { id: "chiori-a4", name: "The Finishing Touch", unlockAscension: 4, effects: [] },
    { id: "chiori-p3", name: "Brocaded Collar's Beauteous Silhouette", effects: [] },
  ],
  constellations: [
    { level: 1, id: "chiori-c1", name: "Six Paths of Sage Silkcraft", effects: [] },
    { level: 2, id: "chiori-c2", name: "In Five Colors Dyed", effects: [] },
    { level: 3, id: "chiori-c3", name: "Four Brocade Embellishments", effects: [], buffs: [{ id: "chiori-c3", source: "Four Brocade Embellishments", sourceCharacterId: "chiori", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "chiori-c4", name: "A Tailor's Three Courtesies", effects: [] },
    { level: 5, id: "chiori-c5", name: "Two Silken Plumules", effects: [], buffs: [{ id: "chiori-c5", source: "Two Silken Plumules", sourceCharacterId: "chiori", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "chiori-c6", name: "Sole Principle Pursuit", effects: [] },
  ],
  resources: [],
};

export const gorou: GeneratedCharacter = {
  id: "gorou",
  name: "Gorou",
  element: "geo",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 802, 2: 869, 3: 935, 4: 1001, 5: 1067, 6: 1134, 7: 1200, 8: 1266, 9: 1333, 10: 1399, 11: 1465, 12: 1531, 13: 1598, 14: 1663, 15: 1730, 16: 1797, 17: 1862, 18: 1929, 19: 1995, 20: 2061, 21: 2727, 22: 2793, 23: 2860, 24: 2926, 25: 2992, 26: 3058, 27: 3124, 28: 3190, 29: 3257, 30: 3323, 31: 3389, 32: 3456, 33: 3522, 34: 3588, 35: 3654, 36: 3721, 37: 3786, 38: 3853, 39: 3920, 40: 3985, 41: 4478, 42: 4544, 43: 4610, 44: 4676, 45: 4743, 46: 4809, 47: 4875, 48: 4942, 49: 5008, 50: 5074, 51: 5708, 52: 5774, 53: 5841, 54: 5907, 55: 5973, 56: 6039, 57: 6106, 58: 6172, 59: 6238, 60: 6305, 61: 6796, 62: 6863, 63: 6929, 64: 6995, 65: 7061, 66: 7128, 67: 7194, 68: 7260, 69: 7327, 70: 7393, 71: 7885, 72: 7951, 73: 8017, 74: 8084, 75: 8150, 76: 8216, 77: 8282, 78: 8349, 79: 8415, 80: 8481, 81: 8974, 82: 9040, 83: 9106, 84: 9172, 85: 9239, 86: 9304, 87: 9371, 88: 9437, 89: 9503, 90: 9570 } },
    atk: { byLevel: { 1: 15, 2: 17, 3: 18, 4: 19, 5: 20, 6: 22, 7: 23, 8: 24, 9: 25, 10: 27, 11: 28, 12: 29, 13: 30, 14: 32, 15: 33, 16: 34, 17: 36, 18: 37, 19: 38, 20: 39, 21: 52, 22: 53, 23: 55, 24: 56, 25: 57, 26: 58, 27: 60, 28: 61, 29: 62, 30: 63, 31: 65, 32: 66, 33: 67, 34: 68, 35: 70, 36: 71, 37: 72, 38: 74, 39: 75, 40: 76, 41: 85, 42: 87, 43: 88, 44: 89, 45: 91, 46: 92, 47: 93, 48: 94, 49: 96, 50: 97, 51: 109, 52: 110, 53: 111, 54: 113, 55: 114, 56: 115, 57: 117, 58: 118, 59: 119, 60: 120, 61: 130, 62: 131, 63: 132, 64: 134, 65: 135, 66: 136, 67: 137, 68: 139, 69: 140, 70: 141, 71: 151, 72: 152, 73: 153, 74: 154, 75: 156, 76: 157, 77: 158, 78: 159, 79: 161, 80: 162, 81: 171, 82: 173, 83: 174, 84: 175, 85: 176, 86: 178, 87: 179, 88: 180, 89: 181, 90: 183 } },
    def: { byLevel: { 1: 54, 2: 59, 3: 63, 4: 68, 5: 72, 6: 77, 7: 81, 8: 86, 9: 90, 10: 95, 11: 99, 12: 104, 13: 108, 14: 113, 15: 117, 16: 122, 17: 126, 18: 131, 19: 135, 20: 140, 21: 185, 22: 189, 23: 194, 24: 198, 25: 203, 26: 207, 27: 212, 28: 216, 29: 221, 30: 225, 31: 230, 32: 234, 33: 239, 34: 243, 35: 248, 36: 252, 37: 257, 38: 261, 39: 266, 40: 270, 41: 303, 42: 308, 43: 312, 44: 317, 45: 321, 46: 326, 47: 330, 48: 335, 49: 339, 50: 344, 51: 387, 52: 391, 53: 396, 54: 400, 55: 405, 56: 409, 57: 414, 58: 418, 59: 423, 60: 427, 61: 460, 62: 465, 63: 469, 64: 474, 65: 478, 66: 483, 67: 487, 68: 492, 69: 496, 70: 501, 71: 534, 72: 539, 73: 543, 74: 548, 75: 552, 76: 557, 77: 561, 78: 566, 79: 570, 80: 575, 81: 608, 82: 612, 83: 617, 84: 621, 85: 626, 86: 630, 87: 635, 88: 639, 89: 644, 90: 648 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "geo",
  },
  baseStats: {
    atk: 183,
    hp: 9570,
    def: 648,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { geo: 0.24 },
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "gorou-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gorou-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.37754, 0.40827, 0.439, 0.4829, 0.51363, 0.54875, 0.59704, 0.64533, 0.69362, 0.7463, 0.79898, 0.85166, 0.90434, 0.95702, 1.0097]) },
            ],
          },
        ],
      },
      {
        id: "gorou-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gorou-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.37152, 0.40176, 0.432, 0.4752, 0.50544, 0.54, 0.58752, 0.63504, 0.68256, 0.7344, 0.78624, 0.83808, 0.88992, 0.94176, 0.9936]) },
            ],
          },
        ],
      },
      {
        id: "gorou-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gorou-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4945, 0.53475, 0.575, 0.6325, 0.67275, 0.71875, 0.782, 0.84525, 0.9085, 0.9775, 1.0465, 1.1155, 1.1845, 1.2535, 1.3225]) },
            ],
          },
        ],
      },
      {
        id: "gorou-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gorou-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.58996, 0.63798, 0.686, 0.7546, 0.80262, 0.8575, 0.93296, 1.00842, 1.08388, 1.1662, 1.24852, 1.33084, 1.41316, 1.49548, 1.5778]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "gorou-charged",
      name: "Ripping Fang Fletching",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gorou-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "gorou-charged-2",
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
      id: "gorou-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gorou-plungeLow-1",
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
      id: "gorou-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gorou-plungeHigh-1",
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
      id: "gorou-skill",
      name: "Inuzaka All-Round Defense",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 2, element: "geo" },
      instances: [
        {
          id: "gorou-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.072, 1.1524, 1.2328, 1.34, 1.4204, 1.5008, 1.608, 1.7152, 1.8224, 1.9296, 2.0368, 2.144, 2.278, 2.412, 2.546]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "gorou-burst",
      name: "Juuga: Forward Unto Victory",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "gorou-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.98216, 1.055822, 1.129484, 1.2277, 1.301362, 1.375024, 1.47324, 1.571456, 1.669672, 1.767888, 1.866104, 1.96432, 2.08709, 2.20986, 2.33263]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "gorou-burst-2",
          name: "Crystal Collapse DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.613, 0.658975, 0.70495, 0.76625, 0.812225, 0.8582, 0.9195, 0.9808, 1.0421, 1.1034, 1.1647, 1.226, 1.302625, 1.37925, 1.455875]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "gorou-a1", name: "Heedless of the Wind and Weather", unlockAscension: 1, effects: [] },
    { id: "gorou-a4", name: "A Favor Repaid", unlockAscension: 4, effects: [] },
    { id: "gorou-p3", name: "Seeker of Shinies", effects: [] },
  ],
  constellations: [
    { level: 1, id: "gorou-c1", name: "Rushing Hound: Swift as the Wind", effects: [] },
    { level: 2, id: "gorou-c2", name: "Sitting Hound: Steady as a Clock", effects: [] },
    { level: 3, id: "gorou-c3", name: "Mauling Hound: Fierce as Fire", effects: [], buffs: [{ id: "gorou-c3", source: "Mauling Hound: Fierce as Fire", sourceCharacterId: "gorou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "gorou-c4", name: "Lapping Hound: Warm as Water", effects: [] },
    { level: 5, id: "gorou-c5", name: "Striking Hound: Thunderous Force", effects: [], buffs: [{ id: "gorou-c5", source: "Striking Hound: Thunderous Force", sourceCharacterId: "gorou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "gorou-c6", name: "Valiant Hound: Mountainous Fealty", effects: [] },
  ],
  resources: [],
};

export const illuga: GeneratedCharacter = {
  id: "illuga",
  name: "Illuga",
  element: "geo",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1003, 2: 1086, 3: 1168, 4: 1252, 5: 1334, 6: 1417, 7: 1499, 8: 1583, 9: 1666, 10: 1748, 11: 1831, 12: 1914, 13: 1997, 14: 2079, 15: 2162, 16: 2246, 17: 2328, 18: 2411, 19: 2493, 20: 2577, 21: 3408, 22: 3491, 23: 3575, 24: 3657, 25: 3740, 26: 3822, 27: 3906, 28: 3988, 29: 4071, 30: 4153, 31: 4237, 32: 4320, 33: 4402, 34: 4485, 35: 4568, 36: 4651, 37: 4733, 38: 4816, 39: 4900, 40: 4982, 41: 5597, 42: 5680, 43: 5763, 44: 5845, 45: 5928, 46: 6012, 47: 6094, 48: 6177, 49: 6259, 50: 6343, 51: 7135, 52: 7218, 53: 7301, 54: 7383, 55: 7467, 56: 7549, 57: 7632, 58: 7714, 59: 7798, 60: 7881, 61: 8496, 62: 8579, 63: 8661, 64: 8744, 65: 8827, 66: 8910, 67: 8993, 68: 9075, 69: 9159, 70: 9241, 71: 9856, 72: 9939, 73: 10022, 74: 10105, 75: 10187, 76: 10271, 77: 10353, 78: 10436, 79: 10518, 80: 10602, 81: 11217, 82: 11299, 83: 11383, 84: 11465, 85: 11548, 86: 11630, 87: 11714, 88: 11796, 89: 11879, 90: 11962 } },
    atk: { byLevel: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 21, 6: 23, 7: 24, 8: 25, 9: 27, 10: 28, 11: 29, 12: 31, 13: 32, 14: 33, 15: 35, 16: 36, 17: 37, 18: 39, 19: 40, 20: 41, 21: 54, 22: 56, 23: 57, 24: 58, 25: 60, 26: 61, 27: 62, 28: 64, 29: 65, 30: 66, 31: 68, 32: 69, 33: 70, 34: 72, 35: 73, 36: 74, 37: 76, 38: 77, 39: 78, 40: 80, 41: 89, 42: 91, 43: 92, 44: 93, 45: 95, 46: 96, 47: 97, 48: 99, 49: 100, 50: 101, 51: 114, 52: 115, 53: 117, 54: 118, 55: 119, 56: 121, 57: 122, 58: 123, 59: 125, 60: 126, 61: 136, 62: 137, 63: 138, 64: 140, 65: 141, 66: 142, 67: 144, 68: 145, 69: 146, 70: 148, 71: 158, 72: 159, 73: 160, 74: 161, 75: 163, 76: 164, 77: 165, 78: 167, 79: 168, 80: 169, 81: 179, 82: 181, 83: 182, 84: 183, 85: 185, 86: 186, 87: 187, 88: 188, 89: 190, 90: 191 } },
    def: { byLevel: { 1: 68, 2: 74, 3: 79, 4: 85, 5: 91, 6: 96, 7: 102, 8: 108, 9: 113, 10: 119, 11: 125, 12: 130, 13: 136, 14: 141, 15: 147, 16: 153, 17: 158, 18: 164, 19: 170, 20: 175, 21: 232, 22: 237, 23: 243, 24: 249, 25: 254, 26: 260, 27: 266, 28: 271, 29: 277, 30: 282, 31: 288, 32: 294, 33: 299, 34: 305, 35: 311, 36: 316, 37: 322, 38: 328, 39: 333, 40: 339, 41: 381, 42: 386, 43: 392, 44: 398, 45: 403, 46: 409, 47: 414, 48: 420, 49: 426, 50: 431, 51: 485, 52: 491, 53: 497, 54: 502, 55: 508, 56: 513, 57: 519, 58: 525, 59: 530, 60: 536, 61: 578, 62: 583, 63: 589, 64: 595, 65: 600, 66: 606, 67: 612, 68: 617, 69: 623, 70: 628, 71: 670, 72: 676, 73: 682, 74: 687, 75: 693, 76: 699, 77: 704, 78: 710, 79: 715, 80: 721, 81: 763, 82: 768, 83: 774, 84: 780, 85: 785, 86: 791, 87: 797, 88: 802, 89: 808, 90: 814 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 191,
    hp: 11962,
    def: 814,
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
        id: "illuga-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "illuga-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.473662, 0.512216, 0.55077, 0.605847, 0.644401, 0.688462, 0.749047, 0.809632, 0.870217, 0.936309, 1.002401, 1.068494, 1.134586, 1.200679, 1.266771]) },
            ],
          },
        ],
      },
      {
        id: "illuga-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "illuga-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.485255, 0.524753, 0.56425, 0.620675, 0.660172, 0.705313, 0.76738, 0.829448, 0.891515, 0.959225, 1.026935, 1.094645, 1.162355, 1.230065, 1.297775]) },
            ],
          },
        ],
      },
      {
        id: "illuga-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "illuga-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.31433, 0.339915, 0.3655, 0.40205, 0.427635, 0.456875, 0.49708, 0.537285, 0.57749, 0.62135, 0.66521, 0.70907, 0.75293, 0.79679, 0.84065]) },
              { stat: "atk", table: talentTable([0.31433, 0.339915, 0.3655, 0.40205, 0.427635, 0.456875, 0.49708, 0.537285, 0.57749, 0.62135, 0.66521, 0.70907, 0.75293, 0.79679, 0.84065]) },
            ],
          },
        ],
      },
      {
        id: "illuga-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "illuga-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.762786, 0.824873, 0.88696, 0.975656, 1.037743, 1.1087, 1.206266, 1.303831, 1.401397, 1.507832, 1.614267, 1.720702, 1.827138, 1.933573, 2.040008]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "illuga-charged",
      name: "Oathkeeper's Spear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "illuga-charged-1",
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
      id: "illuga-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "illuga-plungeLow-1",
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
      id: "illuga-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "illuga-plungeHigh-1",
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
      id: "illuga-skill",
      name: "Dawnbearing Songbird",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 9, element: "geo" },
      instances: [
        {
          id: "illuga-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "elementalMastery", table: talentTable([4.8256, 5.18752, 5.54944, 6.032, 6.39392, 6.75584, 7.2384, 7.72096, 8.20352, 8.68608, 9.16864, 9.6512, 10.2544, 10.8576, 11.4608]) },
            { stat: "def", table: talentTable([2.4128, 2.59376, 2.77472, 3.016, 3.19696, 3.37792, 3.6192, 3.86048, 4.10176, 4.34304, 4.58432, 4.8256, 5.1272, 5.4288, 5.7304]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "illuga-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "elementalMastery", table: talentTable([6.032, 6.4844, 6.9368, 7.54, 7.9924, 8.4448, 9.048, 9.6512, 10.2544, 10.8576, 11.4608, 12.064, 12.818, 13.572, 14.326]) },
            { stat: "def", table: talentTable([3.016, 3.2422, 3.4684, 3.77, 3.9962, 4.2224, 4.524, 4.8256, 5.1272, 5.4288, 5.7304, 6.032, 6.409, 6.786, 7.163]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "illuga-burst",
      name: "Shadowless Reflection",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "illuga-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "elementalMastery", table: talentTable([8.272, 8.8924, 9.5128, 10.34, 10.9604, 11.5808, 12.408, 13.2352, 14.0624, 14.8896, 15.7168, 16.544, 17.578, 18.612, 19.646]) },
            { stat: "def", table: talentTable([4.136, 4.4462, 4.7564, 5.17, 5.4802, 5.7904, 6.204, 6.6176, 7.0312, 7.4448, 7.8584, 8.272, 8.789, 9.306, 9.823]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "illuga-a1", name: "Torchforger's Covenant", unlockAscension: 1, effects: [] },
    { id: "illuga-a4", name: "Demonhunter's Dusk", unlockAscension: 4, effects: [] },
    { id: "illuga-p3", name: "Moonsign Benediction: Unwithering in Winter", effects: [] },
    { id: "illuga-p4", name: "Night Warden's Stride", effects: [] },
  ],
  constellations: [
    { level: 1, id: "illuga-c1", name: "Vigilant Sentinel", effects: [] },
    { level: 2, id: "illuga-c2", name: "Elk With Fanged Antlers", effects: [] },
    { level: 3, id: "illuga-c3", name: "Earthshaking Maw", effects: [], buffs: [{ id: "illuga-c3", source: "Earthshaking Maw", sourceCharacterId: "illuga", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "illuga-c4", name: "Solarhunting Wolf", effects: [] },
    { level: 5, id: "illuga-c5", name: "Hurricane Steed", effects: [], buffs: [{ id: "illuga-c5", source: "Hurricane Steed", sourceCharacterId: "illuga", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "illuga-c6", name: "Nightmare Orioles", effects: [] },
  ],
  resources: [],
};

export const kachina: GeneratedCharacter = {
  id: "kachina",
  name: "Kachina",
  element: "geo",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 989, 2: 1071, 3: 1153, 4: 1235, 5: 1316, 6: 1398, 7: 1479, 8: 1561, 9: 1643, 10: 1724, 11: 1806, 12: 1888, 13: 1970, 14: 2051, 15: 2133, 16: 2215, 17: 2296, 18: 2378, 19: 2459, 20: 2541, 21: 3362, 22: 3444, 23: 3526, 24: 3607, 25: 3689, 26: 3770, 27: 3852, 28: 3933, 29: 4016, 30: 4097, 31: 4179, 32: 4261, 33: 4342, 34: 4424, 35: 4505, 36: 4587, 37: 4669, 38: 4751, 39: 4833, 40: 4914, 41: 5521, 42: 5602, 43: 5684, 44: 5765, 45: 5848, 46: 5930, 47: 6011, 48: 6093, 49: 6174, 50: 6256, 51: 7037, 52: 7120, 53: 7202, 54: 7283, 55: 7365, 56: 7446, 57: 7528, 58: 7609, 59: 7691, 60: 7773, 61: 8380, 62: 8462, 63: 8543, 64: 8625, 65: 8706, 66: 8788, 67: 8870, 68: 8952, 69: 9034, 70: 9115, 71: 9722, 72: 9803, 73: 9885, 74: 9967, 75: 10048, 76: 10131, 77: 10212, 78: 10294, 79: 10375, 80: 10457, 81: 11064, 82: 11145, 83: 11227, 84: 11309, 85: 11391, 86: 11472, 87: 11554, 88: 11635, 89: 11717, 90: 11799 } },
    atk: { byLevel: { 1: 18, 2: 20, 3: 21, 4: 23, 5: 24, 6: 26, 7: 27, 8: 29, 9: 30, 10: 32, 11: 33, 12: 35, 13: 36, 14: 38, 15: 39, 16: 41, 17: 42, 18: 44, 19: 45, 20: 47, 21: 62, 22: 63, 23: 65, 24: 66, 25: 68, 26: 69, 27: 71, 28: 72, 29: 74, 30: 75, 31: 77, 32: 78, 33: 80, 34: 81, 35: 83, 36: 84, 37: 86, 38: 87, 39: 89, 40: 90, 41: 101, 42: 103, 43: 104, 44: 106, 45: 107, 46: 109, 47: 110, 48: 112, 49: 113, 50: 115, 51: 129, 52: 131, 53: 132, 54: 134, 55: 135, 56: 137, 57: 138, 58: 140, 59: 141, 60: 143, 61: 154, 62: 155, 63: 157, 64: 158, 65: 160, 66: 161, 67: 163, 68: 164, 69: 166, 70: 167, 71: 179, 72: 180, 73: 182, 74: 183, 75: 184, 76: 186, 77: 187, 78: 189, 79: 190, 80: 192, 81: 203, 82: 205, 83: 206, 84: 208, 85: 209, 86: 211, 87: 212, 88: 214, 89: 215, 90: 217 } },
    def: { byLevel: { 1: 66, 2: 72, 3: 77, 4: 83, 5: 88, 6: 94, 7: 99, 8: 105, 9: 110, 10: 116, 11: 121, 12: 127, 13: 132, 14: 138, 15: 143, 16: 149, 17: 154, 18: 160, 19: 165, 20: 171, 21: 226, 22: 231, 23: 237, 24: 242, 25: 248, 26: 253, 27: 259, 28: 264, 29: 270, 30: 275, 31: 281, 32: 286, 33: 292, 34: 297, 35: 303, 36: 308, 37: 314, 38: 319, 39: 325, 40: 330, 41: 371, 42: 376, 43: 382, 44: 387, 45: 393, 46: 398, 47: 404, 48: 409, 49: 415, 50: 420, 51: 473, 52: 478, 53: 484, 54: 489, 55: 495, 56: 500, 57: 506, 58: 511, 59: 517, 60: 522, 61: 563, 62: 568, 63: 574, 64: 579, 65: 585, 66: 590, 67: 596, 68: 601, 69: 607, 70: 612, 71: 653, 72: 658, 73: 664, 74: 669, 75: 675, 76: 680, 77: 686, 78: 691, 79: 697, 80: 702, 81: 743, 82: 748, 83: 754, 84: 759, 85: 765, 86: 770, 87: 776, 88: 781, 89: 787, 90: 792 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "geo",
  },
  baseStats: {
    atk: 217,
    hp: 11799,
    def: 792,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { geo: 0.24 },
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "kachina-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kachina-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.493984, 0.534192, 0.5744, 0.63184, 0.672048, 0.718, 0.781184, 0.844368, 0.907552, 0.97648, 1.045408, 1.114336, 1.183264, 1.252192, 1.32112]) },
            ],
          },
        ],
      },
      {
        id: "kachina-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kachina-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.27569, 0.29813, 0.32057, 0.352627, 0.375067, 0.400713, 0.435975, 0.471238, 0.506501, 0.544969, 0.583437, 0.621906, 0.660374, 0.698843, 0.737311]) },
              { stat: "atk", table: talentTable([0.306323, 0.331257, 0.35619, 0.391809, 0.416742, 0.445238, 0.484418, 0.523599, 0.56278, 0.605523, 0.648266, 0.691009, 0.733751, 0.776494, 0.819237]) },
            ],
          },
        ],
      },
      {
        id: "kachina-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kachina-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.704271, 0.761596, 0.81892, 0.900812, 0.958136, 1.02365, 1.113731, 1.203812, 1.293894, 1.392164, 1.490434, 1.588705, 1.686975, 1.785246, 1.883516]) },
            ],
          },
        ],
      },
      {
        id: "kachina-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kachina-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.774361, 0.837391, 0.90042, 0.990462, 1.053491, 1.125525, 1.224571, 1.323617, 1.422664, 1.530714, 1.638764, 1.746815, 1.854865, 1.962916, 2.070966]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kachina-charged",
      name: "Cragbiter",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kachina-charged-1",
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
      id: "kachina-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kachina-plungeLow-1",
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
      id: "kachina-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kachina-plungeHigh-1",
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
      id: "kachina-skill",
      name: "Go, Go Turbo Twirly!",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      particles: { count: 1, element: "geo" },
      instances: [
        {
          id: "kachina-skill-1",
          name: "Turbo Twirly Mounted DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.8776, 0.94342, 1.00924, 1.097, 1.16282, 1.22864, 1.3164, 1.40416, 1.49192, 1.57968, 1.66744, 1.7552, 1.8649, 1.9746, 2.0843]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "kachina-skill-2",
          name: "Turbo Twirly Independent DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.6376, 0.68542, 0.73324, 0.797, 0.84482, 0.89264, 0.9564, 1.02016, 1.08392, 1.14768, 1.21144, 1.2752, 1.3549, 1.4346, 1.5143]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kachina-burst",
      name: "Time to Get Serious!",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "kachina-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([3.805672, 4.1366, 4.4252, 4.81, 5.0986, 5.3872, 5.772, 6.1568, 6.5416, 6.9264, 7.3112, 7.696, 8.177, 8.658, 9.139]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kachina-a1", name: "Mountain Echoes", unlockAscension: 1, effects: [] },
    { id: "kachina-a4", name: "The Weight of Stone", unlockAscension: 4, effects: [] },
    { id: "kachina-p3", name: "Night Realm's Gift: Heart of Unity", effects: [] },
    { id: "kachina-p4", name: "Boon of Crystal Flame", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kachina-c1", name: "Shards Are Gems Too", effects: [] },
    { level: 2, id: "kachina-c2", name: "Never Leave Home Without... Turbo Twirly", effects: [] },
    { level: 3, id: "kachina-c3", name: "Improved Stabilizer", effects: [], buffs: [{ id: "kachina-c3", source: "Improved Stabilizer", sourceCharacterId: "kachina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kachina-c4", name: "More Foes, More Caution", effects: [] },
    { level: 5, id: "kachina-c5", name: "All I've Collected Till Now", effects: [], buffs: [{ id: "kachina-c5", source: "All I've Collected Till Now", sourceCharacterId: "kachina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kachina-c6", name: "This Time, I've Gotta Win", effects: [] },
  ],
  resources: [],
};

export const linnea: GeneratedCharacter = {
  id: "linnea",
  name: "Linnea",
  element: "geo",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 770, 2: 834, 3: 898, 4: 963, 5: 1027, 6: 1091, 7: 1155, 8: 1220, 9: 1285, 10: 1349, 11: 1413, 12: 1478, 13: 1543, 14: 1608, 15: 1673, 16: 1738, 17: 1803, 18: 1868, 19: 1933, 20: 1998, 21: 2724, 22: 2790, 23: 2855, 24: 2920, 25: 2986, 26: 3052, 27: 3118, 28: 3183, 29: 3249, 30: 3315, 31: 3381, 32: 3447, 33: 3514, 34: 3579, 35: 3645, 36: 3712, 37: 3779, 38: 3845, 39: 3911, 40: 3978, 41: 4514, 42: 4581, 43: 4648, 44: 4714, 45: 4781, 46: 4848, 47: 4915, 48: 4982, 49: 5050, 50: 5117, 51: 5809, 52: 5877, 53: 5944, 54: 6012, 55: 6080, 56: 6148, 57: 6215, 58: 6283, 59: 6351, 60: 6419, 61: 6956, 62: 7024, 63: 7092, 64: 7160, 65: 7228, 66: 7297, 67: 7365, 68: 7433, 69: 7502, 70: 7570, 71: 8108, 72: 8178, 73: 8246, 74: 8315, 75: 8384, 76: 8453, 77: 8522, 78: 8591, 79: 8661, 80: 8730, 81: 9268, 82: 9338, 83: 9407, 84: 9476, 85: 9546, 86: 9616, 87: 9685, 88: 9755, 89: 9825, 90: 9895 } },
    atk: { byLevel: { 1: 11, 2: 12, 3: 13, 4: 14, 5: 15, 6: 16, 7: 17, 8: 18, 9: 19, 10: 20, 11: 21, 12: 21, 13: 22, 14: 23, 15: 24, 16: 25, 17: 26, 18: 27, 19: 28, 20: 29, 21: 40, 22: 40, 23: 41, 24: 42, 25: 43, 26: 44, 27: 45, 28: 46, 29: 47, 30: 48, 31: 49, 32: 50, 33: 51, 34: 52, 35: 53, 36: 54, 37: 55, 38: 56, 39: 57, 40: 58, 41: 65, 42: 66, 43: 67, 44: 68, 45: 69, 46: 70, 47: 71, 48: 72, 49: 73, 50: 74, 51: 84, 52: 85, 53: 86, 54: 87, 55: 88, 56: 89, 57: 90, 58: 91, 59: 92, 60: 93, 61: 101, 62: 102, 63: 103, 64: 104, 65: 105, 66: 106, 67: 107, 68: 108, 69: 109, 70: 110, 71: 118, 72: 119, 73: 120, 74: 121, 75: 122, 76: 123, 77: 124, 78: 125, 79: 126, 80: 127, 81: 134, 82: 135, 83: 136, 84: 137, 85: 138, 86: 139, 87: 140, 88: 141, 89: 143, 90: 144 } },
    def: { byLevel: { 1: 71, 2: 76, 3: 82, 4: 88, 5: 94, 6: 100, 7: 106, 8: 112, 9: 118, 10: 124, 11: 130, 12: 135, 13: 141, 14: 147, 15: 153, 16: 159, 17: 165, 18: 171, 19: 177, 20: 183, 21: 250, 22: 256, 23: 262, 24: 268, 25: 274, 26: 280, 27: 286, 28: 292, 29: 298, 30: 304, 31: 310, 32: 316, 33: 322, 34: 328, 35: 334, 36: 340, 37: 346, 38: 352, 39: 358, 40: 365, 41: 414, 42: 420, 43: 426, 44: 432, 45: 438, 46: 444, 47: 450, 48: 457, 49: 463, 50: 469, 51: 532, 52: 539, 53: 545, 54: 551, 55: 557, 56: 563, 57: 570, 58: 576, 59: 582, 60: 588, 61: 638, 62: 644, 63: 650, 64: 656, 65: 663, 66: 669, 67: 675, 68: 681, 69: 688, 70: 694, 71: 743, 72: 750, 73: 756, 74: 762, 75: 768, 76: 775, 77: 781, 78: 787, 79: 794, 80: 800, 81: 849, 82: 856, 83: 862, 84: 869, 85: 875, 86: 881, 87: 888, 88: 894, 89: 901, 90: 907 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 144,
    hp: 9895,
    def: 907,
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
        id: "linnea-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "linnea-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.589969, 0.637989, 0.68601, 0.754611, 0.802632, 0.857513, 0.932974, 1.008435, 1.083896, 1.166217, 1.248538, 1.330859, 1.413181, 1.495502, 1.577823]) },
            ],
          },
        ],
      },
      {
        id: "linnea-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "linnea-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.511519, 0.553155, 0.59479, 0.654269, 0.695904, 0.743488, 0.808914, 0.874341, 0.939768, 1.011143, 1.082518, 1.153893, 1.225267, 1.296642, 1.368017]) },
            ],
          },
        ],
      },
      {
        id: "linnea-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "linnea-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.816312, 0.882756, 0.9492, 1.04412, 1.110564, 1.1865, 1.290912, 1.395324, 1.499736, 1.61364, 1.727544, 1.841448, 1.955352, 2.069256, 2.18316]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "linnea-charged",
      name: "Capture Protocol",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "linnea-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "linnea-charged-2",
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
      id: "linnea-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "linnea-plungeLow-1",
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
      id: "linnea-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "linnea-plungeHigh-1",
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
      id: "linnea-skill",
      name: "Countermeasure: Lumi's Battle Cry!",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 3, element: "geo" },
      instances: [
        {
          id: "linnea-skill-1-1",
          name: "Lumi Pound-Pound Pummeler DMG (1/2)",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "linnea-skill-1-2",
          name: "Lumi Pound-Pound Pummeler DMG (2/2)",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "linnea-skill-2",
          name: "Lumi Heavy Overdrive Hammer DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.125, 2.25, 2.375]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "linnea-skill-3",
          name: "Lumi Million Ton Crush DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([4, 4.3, 4.6, 5, 5.3, 5.6, 6, 6.4, 6.8, 7.2, 7.6, 8, 8.5, 9, 9.5]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "linnea-burst",
      name: "Memo: Survival Guide in Extreme Conditions",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
      ],
    },
  passives: [
    { id: "linnea-a1", name: "Field Observation Notes", unlockAscension: 1, effects: [] },
    { id: "linnea-a4", name: "Universal Naturalist Archive", unlockAscension: 4, effects: [] },
    { id: "linnea-p3", name: "Moonsign Benediction: Habitat Survey", effects: [] },
    { id: "linnea-p4", name: "Master Adventurer", effects: [] },
  ],
  constellations: [
    { level: 1, id: "linnea-c1", name: "Provisional Classification", effects: [] },
    { level: 2, id: "linnea-c2", name: "Tidings of Joy and Sorrow", effects: [] },
    { level: 3, id: "linnea-c3", name: "Eventful Log Page", effects: [], buffs: [{ id: "linnea-c3", source: "Eventful Log Page", sourceCharacterId: "linnea", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "linnea-c4", name: "Expert Instinct", effects: [] },
    { level: 5, id: "linnea-c5", name: "Fairyland's Farewell Gift", effects: [] },
    { level: 6, id: "linnea-c6", name: "Golden Beagle's Dream", effects: [] },
  ],
  resources: [],
};

export const navia: GeneratedCharacter = {
  id: "navia",
  name: "Navia",
  element: "geo",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 985, 2: 1067, 3: 1148, 4: 1231, 5: 1313, 6: 1395, 7: 1477, 8: 1560, 9: 1643, 10: 1724, 11: 1807, 12: 1890, 13: 1973, 14: 2056, 15: 2139, 16: 2222, 17: 2305, 18: 2388, 19: 2472, 20: 2555, 21: 3483, 22: 3566, 23: 3650, 24: 3734, 25: 3817, 26: 3902, 27: 3986, 28: 4070, 29: 4154, 30: 4238, 31: 4323, 32: 4407, 33: 4492, 34: 4576, 35: 4660, 36: 4746, 37: 4831, 38: 4915, 39: 5000, 40: 5086, 41: 5770, 42: 5856, 43: 5942, 44: 6026, 45: 6112, 46: 6198, 47: 6284, 48: 6369, 49: 6456, 50: 6542, 51: 7427, 52: 7514, 53: 7599, 54: 7686, 55: 7773, 56: 7859, 57: 7946, 58: 8033, 59: 8119, 60: 8206, 61: 8893, 62: 8979, 63: 9067, 64: 9154, 65: 9241, 66: 9329, 67: 9416, 68: 9503, 69: 9591, 70: 9679, 71: 10366, 72: 10455, 73: 10542, 74: 10630, 75: 10719, 76: 10806, 77: 10895, 78: 10984, 79: 11072, 80: 11161, 81: 11849, 82: 11938, 83: 12027, 84: 12115, 85: 12204, 86: 12294, 87: 12382, 88: 12472, 89: 12561, 90: 12650 } },
    atk: { byLevel: { 1: 27, 2: 30, 3: 32, 4: 34, 5: 36, 6: 39, 7: 41, 8: 43, 9: 46, 10: 48, 11: 50, 12: 53, 13: 55, 14: 57, 15: 59, 16: 62, 17: 64, 18: 66, 19: 69, 20: 71, 21: 97, 22: 99, 23: 101, 24: 104, 25: 106, 26: 108, 27: 111, 28: 113, 29: 115, 30: 118, 31: 120, 32: 122, 33: 125, 34: 127, 35: 130, 36: 132, 37: 134, 38: 137, 39: 139, 40: 141, 41: 160, 42: 163, 43: 165, 44: 167, 45: 170, 46: 172, 47: 175, 48: 177, 49: 179, 50: 182, 51: 206, 52: 209, 53: 211, 54: 214, 55: 216, 56: 218, 57: 221, 58: 223, 59: 226, 60: 228, 61: 247, 62: 250, 63: 252, 64: 254, 65: 257, 66: 259, 67: 262, 68: 264, 69: 267, 70: 269, 71: 288, 72: 291, 73: 293, 74: 295, 75: 298, 76: 300, 77: 303, 78: 305, 79: 308, 80: 310, 81: 329, 82: 332, 83: 334, 84: 337, 85: 339, 86: 342, 87: 344, 88: 347, 89: 349, 90: 352 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 72, 4: 77, 5: 82, 6: 87, 7: 93, 8: 98, 9: 103, 10: 108, 11: 113, 12: 118, 13: 124, 14: 129, 15: 134, 16: 139, 17: 145, 18: 150, 19: 155, 20: 160, 21: 218, 22: 224, 23: 229, 24: 234, 25: 239, 26: 245, 27: 250, 28: 255, 29: 260, 30: 266, 31: 271, 32: 276, 33: 282, 34: 287, 35: 292, 36: 298, 37: 303, 38: 308, 39: 314, 40: 319, 41: 362, 42: 367, 43: 373, 44: 378, 45: 383, 46: 389, 47: 394, 48: 399, 49: 405, 50: 410, 51: 466, 52: 471, 53: 476, 54: 482, 55: 487, 56: 493, 57: 498, 58: 504, 59: 509, 60: 515, 61: 558, 62: 563, 63: 568, 64: 574, 65: 579, 66: 585, 67: 590, 68: 596, 69: 601, 70: 607, 71: 650, 72: 656, 73: 661, 74: 666, 75: 672, 76: 678, 77: 683, 78: 689, 79: 694, 80: 700, 81: 743, 82: 749, 83: 754, 84: 760, 85: 765, 86: 771, 87: 776, 88: 782, 89: 788, 90: 793 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 352,
    hp: 12650,
    def: 793,
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
        id: "navia-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "navia-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.93519, 1.01131, 1.08743, 1.196173, 1.272293, 1.359287, 1.478905, 1.598522, 1.718139, 1.848631, 1.979123, 2.109614, 2.240106, 2.370597, 2.501089]) },
            ],
          },
        ],
      },
      {
        id: "navia-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "navia-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.865065, 0.935478, 1.00589, 1.106479, 1.176891, 1.257362, 1.36801, 1.478658, 1.589306, 1.710013, 1.83072, 1.951427, 2.072133, 2.19284, 2.313547]) },
            ],
          },
        ],
      },
      {
        id: "navia-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "navia-na-3-1-1",
            name: "3-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.348859, 0.377255, 0.40565, 0.446215, 0.47461, 0.507062, 0.551684, 0.596306, 0.640927, 0.689605, 0.738283, 0.786961, 0.835639, 0.884317, 0.932995]) },
            ],
          },
          {
            id: "navia-na-3-1-2",
            name: "3-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.348859, 0.377255, 0.40565, 0.446215, 0.47461, 0.507062, 0.551684, 0.596306, 0.640927, 0.689605, 0.738283, 0.786961, 0.835639, 0.884317, 0.932995]) },
            ],
          },
          {
            id: "navia-na-3-1-3",
            name: "3-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.348859, 0.377255, 0.40565, 0.446215, 0.47461, 0.507062, 0.551684, 0.596306, 0.640927, 0.689605, 0.738283, 0.786961, 0.835639, 0.884317, 0.932995]) },
            ],
          },
        ],
      },
      {
        id: "navia-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "navia-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.334316, 1.442923, 1.55153, 1.706683, 1.81529, 1.939412, 2.110081, 2.280749, 2.451417, 2.637601, 2.823785, 3.009968, 3.196152, 3.382335, 3.568519]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "navia-charged",
      name: "Blunt Refusal",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "navia-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.62522, 0.67611, 0.727, 0.7997, 0.85059, 0.90875, 0.98872, 1.06869, 1.14866, 1.2359, 1.32314, 1.41038, 1.49762, 1.58486, 1.6721]) },
          ],
        },
        {
          id: "navia-charged-2",
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
      id: "navia-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "navia-plungeLow-1",
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
      id: "navia-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "navia-plungeHigh-1",
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
      id: "navia-skill",
      name: "Ceremonial Crystalshot",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 4, element: "geo" },
      instances: [
        {
          id: "navia-skill-1",
          name: "Rosula Shardshot Base DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([3.948, 4.2441, 4.5402, 4.935, 5.2311, 5.5272, 5.922, 6.3168, 6.7116, 7.1064, 7.5012, 7.896, 8.3895, 8.883, 9.3765]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "navia-skill-2",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "navia-burst",
      name: "As the Sunlit Sky's Singing Salute",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "navia-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.752, 0.8084, 0.8648, 0.94, 0.9964, 1.0528, 1.128, 1.2032, 1.2784, 1.3536, 1.4288, 1.504, 1.598, 1.692, 1.786]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "navia-burst-2",
          name: "Cannon Fire Support DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.4315, 0.463863, 0.496225, 0.539375, 0.571738, 0.6041, 0.64725, 0.6904, 0.73355, 0.7767, 0.81985, 0.863, 0.916938, 0.970875, 1.024813]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "navia-a1", name: "Undisclosed Distribution Channels", unlockAscension: 1, effects: [] },
    { id: "navia-a4", name: "Mutual Assistance Network", unlockAscension: 4, effects: [] },
    { id: "navia-p3", name: "Painstaking Transaction", effects: [] },
  ],
  constellations: [
    { level: 1, id: "navia-c1", name: "A Lady's Rules for Keeping a Courteous Distance", effects: [] },
    { level: 2, id: "navia-c2", name: "The President's Pursuit of Victory", effects: [] },
    { level: 3, id: "navia-c3", name: "Businesswoman's Broad Vision", effects: [], buffs: [{ id: "navia-c3", source: "Businesswoman's Broad Vision", sourceCharacterId: "navia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "navia-c4", name: "The Oathsworn Never Capitulate", effects: [] },
    { level: 5, id: "navia-c5", name: "Negotiator's Resolute Negotiations", effects: [], buffs: [{ id: "navia-c5", source: "Negotiator's Resolute Negotiations", sourceCharacterId: "navia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "navia-c6", name: "The Flexible Finesse of the Spina's President", effects: [] },
  ],
  resources: [],
};

export const ningguang: GeneratedCharacter = {
  id: "ningguang",
  name: "Ningguang",
  element: "geo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 821, 2: 889, 3: 956, 4: 1024, 5: 1091, 6: 1160, 7: 1227, 8: 1295, 9: 1363, 10: 1430, 11: 1498, 12: 1566, 13: 1634, 14: 1701, 15: 1769, 16: 1837, 17: 1905, 18: 1973, 19: 2040, 20: 2108, 21: 2788, 22: 2857, 23: 2925, 24: 2992, 25: 3060, 26: 3127, 27: 3196, 28: 3263, 29: 3331, 30: 3398, 31: 3466, 32: 3534, 33: 3602, 34: 3670, 35: 3737, 36: 3805, 37: 3873, 38: 3941, 39: 4009, 40: 4076, 41: 4580, 42: 4647, 43: 4715, 44: 4782, 45: 4851, 46: 4919, 47: 4986, 48: 5054, 49: 5121, 50: 5189, 51: 5837, 52: 5906, 53: 5974, 54: 6041, 55: 6109, 56: 6176, 57: 6245, 58: 6312, 59: 6380, 60: 6448, 61: 6951, 62: 7019, 63: 7086, 64: 7154, 65: 7222, 66: 7290, 67: 7358, 68: 7425, 69: 7493, 70: 7561, 71: 8064, 72: 8132, 73: 8200, 74: 8268, 75: 8335, 76: 8403, 77: 8471, 78: 8539, 79: 8606, 80: 8674, 81: 9178, 82: 9245, 83: 9313, 84: 9380, 85: 9449, 86: 9516, 87: 9584, 88: 9651, 89: 9719, 90: 9787 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 61, 22: 62, 23: 63, 24: 65, 25: 66, 26: 68, 27: 69, 28: 71, 29: 72, 30: 74, 31: 75, 32: 77, 33: 78, 34: 80, 35: 81, 36: 83, 37: 84, 38: 86, 39: 87, 40: 88, 41: 99, 42: 101, 43: 102, 44: 104, 45: 105, 46: 107, 47: 108, 48: 110, 49: 111, 50: 113, 51: 127, 52: 128, 53: 130, 54: 131, 55: 133, 56: 134, 57: 136, 58: 137, 59: 138, 60: 140, 61: 151, 62: 152, 63: 154, 64: 155, 65: 157, 66: 158, 67: 160, 68: 161, 69: 163, 70: 164, 71: 175, 72: 176, 73: 178, 74: 179, 75: 181, 76: 182, 77: 184, 78: 185, 79: 187, 80: 188, 81: 199, 82: 201, 83: 202, 84: 204, 85: 205, 86: 207, 87: 208, 88: 209, 89: 211, 90: 212 } },
    def: { byLevel: { 1: 48, 2: 52, 3: 56, 4: 60, 5: 64, 6: 68, 7: 72, 8: 76, 9: 80, 10: 84, 11: 88, 12: 92, 13: 96, 14: 100, 15: 104, 16: 108, 17: 112, 18: 116, 19: 119, 20: 123, 21: 163, 22: 167, 23: 171, 24: 175, 25: 179, 26: 183, 27: 187, 28: 191, 29: 195, 30: 199, 31: 203, 32: 207, 33: 211, 34: 215, 35: 219, 36: 223, 37: 227, 38: 231, 39: 235, 40: 239, 41: 268, 42: 272, 43: 276, 44: 280, 45: 284, 46: 288, 47: 292, 48: 296, 49: 300, 50: 304, 51: 342, 52: 346, 53: 350, 54: 354, 55: 358, 56: 362, 57: 366, 58: 370, 59: 374, 60: 378, 61: 407, 62: 411, 63: 415, 64: 419, 65: 423, 66: 427, 67: 431, 68: 435, 69: 439, 70: 443, 71: 472, 72: 476, 73: 480, 74: 484, 75: 488, 76: 492, 77: 496, 78: 500, 79: 504, 80: 508, 81: 538, 82: 542, 83: 546, 84: 549, 85: 553, 86: 557, 87: 561, 88: 565, 89: 569, 90: 573 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "geo",
  },
  baseStats: {
    atk: 212,
    hp: 9787,
    def: 573,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { geo: 0.24 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "ningguang-na-1",
        name: "Normal Attack DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ningguang-na-1-1",
            name: "Normal Attack DMG",
            damageType: "normal",
            element: "geo",
            scaling: [
              { stat: "atk", table: talentTable([0.28, 0.301, 0.322, 0.35, 0.371, 0.392, 0.42, 0.448, 0.476, 0.504, 0.53312, 0.5712, 0.60928, 0.64736, 0.68544]) },
            ],
            application: { element: "geo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "ningguang-charged",
      name: "Sparkling Scatter",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ningguang-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.7408, 1.87136, 2.00192, 2.176, 2.30656, 2.43712, 2.6112, 2.78528, 2.95936, 3.13344, 3.314483, 3.551232, 3.787981, 4.02473, 4.261478]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "ningguang-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ningguang-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "ningguang-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ningguang-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "ningguang-skill",
      name: "Jade Screen",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 5, element: "geo" },
      instances: [
        {
          id: "ningguang-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([2.304, 2.4768, 2.6496, 2.88, 3.0528, 3.2256, 3.456, 3.6864, 3.9168, 4.1472, 4.3776, 4.608, 4.896, 5.184, 5.472]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "ningguang-burst",
      name: "Starshatter",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "ningguang-burst-1",
          name: "DMG Per Gem",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.8696, 0.93482, 1.00004, 1.087, 1.15222, 1.21744, 1.3044, 1.39136, 1.47832, 1.56528, 1.65224, 1.7392, 1.8479, 1.9566, 2.0653]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "ningguang-a1", name: "Backup Plan", unlockAscension: 1, effects: [] },
    { id: "ningguang-a4", name: "Strategic Reserve", unlockAscension: 4, effects: [] },
    { id: "ningguang-p3", name: "Trove of Marvelous Treasures", effects: [] },
  ],
  constellations: [
    { level: 1, id: "ningguang-c1", name: "Piercing Fragments", effects: [] },
    { level: 2, id: "ningguang-c2", name: "Shock Effect", effects: [] },
    { level: 3, id: "ningguang-c3", name: "Majesty Be the Array of Stars", effects: [], buffs: [{ id: "ningguang-c3", source: "Majesty Be the Array of Stars", sourceCharacterId: "ningguang", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "ningguang-c4", name: "Exquisite be the Jade, Outshining All Beneath", effects: [] },
    { level: 5, id: "ningguang-c5", name: "Invincible Be the Jade Screen", effects: [], buffs: [{ id: "ningguang-c5", source: "Invincible Be the Jade Screen", sourceCharacterId: "ningguang", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "ningguang-c6", name: "Grandeur Be the Seven Stars", effects: [] },
  ],
  resources: [],
};

export const noelle: GeneratedCharacter = {
  id: "noelle",
  name: "Noelle",
  element: "geo",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1012, 2: 1096, 3: 1179, 4: 1263, 5: 1346, 6: 1430, 7: 1513, 8: 1597, 9: 1681, 10: 1764, 11: 1848, 12: 1931, 13: 2015, 14: 2098, 15: 2182, 16: 2266, 17: 2349, 18: 2433, 19: 2516, 20: 2600, 21: 3439, 22: 3523, 23: 3607, 24: 3690, 25: 3774, 26: 3857, 27: 3941, 28: 4024, 29: 4108, 30: 4191, 31: 4275, 32: 4359, 33: 4442, 34: 4526, 35: 4609, 36: 4693, 37: 4776, 38: 4860, 39: 4944, 40: 5027, 41: 5648, 42: 5731, 43: 5815, 44: 5898, 45: 5982, 46: 6066, 47: 6149, 48: 6233, 49: 6316, 50: 6400, 51: 7200, 52: 7284, 53: 7368, 54: 7451, 55: 7535, 56: 7618, 57: 7702, 58: 7785, 59: 7869, 60: 7953, 61: 8573, 62: 8657, 63: 8740, 64: 8824, 65: 8907, 66: 8991, 67: 9075, 68: 9158, 69: 9242, 70: 9325, 71: 9946, 72: 10029, 73: 10113, 74: 10197, 75: 10280, 76: 10364, 77: 10447, 78: 10531, 79: 10614, 80: 10698, 81: 11319, 82: 11402, 83: 11486, 84: 11569, 85: 11653, 86: 11736, 87: 11820, 88: 11903, 89: 11987, 90: 12071 } },
    atk: { byLevel: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 21, 6: 23, 7: 24, 8: 25, 9: 27, 10: 28, 11: 29, 12: 31, 13: 32, 14: 33, 15: 35, 16: 36, 17: 37, 18: 39, 19: 40, 20: 41, 21: 54, 22: 56, 23: 57, 24: 58, 25: 60, 26: 61, 27: 62, 28: 64, 29: 65, 30: 66, 31: 68, 32: 69, 33: 70, 34: 72, 35: 73, 36: 74, 37: 76, 38: 77, 39: 78, 40: 80, 41: 89, 42: 91, 43: 92, 44: 93, 45: 95, 46: 96, 47: 97, 48: 99, 49: 100, 50: 101, 51: 114, 52: 115, 53: 117, 54: 118, 55: 119, 56: 121, 57: 122, 58: 123, 59: 125, 60: 126, 61: 136, 62: 137, 63: 138, 64: 140, 65: 141, 66: 142, 67: 144, 68: 145, 69: 146, 70: 148, 71: 158, 72: 159, 73: 160, 74: 161, 75: 163, 76: 164, 77: 165, 78: 167, 79: 168, 80: 169, 81: 179, 82: 181, 83: 182, 84: 183, 85: 185, 86: 186, 87: 187, 88: 188, 89: 190, 90: 191 } },
    def: { byLevel: { 1: 67, 2: 73, 3: 78, 4: 84, 5: 89, 6: 95, 7: 100, 8: 106, 9: 111, 10: 117, 11: 122, 12: 128, 13: 133, 14: 139, 15: 144, 16: 150, 17: 155, 18: 161, 19: 166, 20: 172, 21: 228, 22: 233, 23: 239, 24: 244, 25: 250, 26: 255, 27: 261, 28: 266, 29: 272, 30: 277, 31: 283, 32: 288, 33: 294, 34: 299, 35: 305, 36: 310, 37: 316, 38: 322, 39: 327, 40: 333, 41: 374, 42: 379, 43: 385, 44: 390, 45: 396, 46: 401, 47: 407, 48: 412, 49: 418, 50: 423, 51: 476, 52: 482, 53: 487, 54: 493, 55: 498, 56: 504, 57: 509, 58: 515, 59: 521, 60: 526, 61: 567, 62: 573, 63: 578, 64: 584, 65: 589, 66: 595, 67: 600, 68: 606, 69: 611, 70: 617, 71: 658, 72: 663, 73: 669, 74: 675, 75: 680, 76: 686, 77: 691, 78: 697, 79: 702, 80: 708, 81: 749, 82: 754, 83: 760, 84: 765, 85: 771, 86: 776, 87: 782, 88: 787, 89: 793, 90: 799 } },
  },
  ascensionBonus: {
    stat: "defPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.3],
  },
  baseStats: {
    atk: 191,
    hp: 12071,
    def: 799,
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
        id: "noelle-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "noelle-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7912, 0.8556, 0.92, 1.012, 1.0764, 1.15, 1.2512, 1.3524, 1.4536, 1.564, 1.6744, 1.7848, 1.8952, 2.0056, 2.116]) },
            ],
          },
        ],
      },
      {
        id: "noelle-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "noelle-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.73358, 0.79329, 0.853, 0.9383, 0.99801, 1.06625, 1.16008, 1.25391, 1.34774, 1.4501, 1.55246, 1.65482, 1.75718, 1.85954, 1.9619]) },
            ],
          },
        ],
      },
      {
        id: "noelle-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "noelle-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.86258, 0.93279, 1.003, 1.1033, 1.17351, 1.25375, 1.36408, 1.47441, 1.58474, 1.7051, 1.82546, 1.94582, 2.06618, 2.18654, 2.3069]) },
            ],
          },
        ],
      },
      {
        id: "noelle-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "noelle-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.13434, 1.22667, 1.319, 1.4509, 1.54323, 1.64875, 1.79384, 1.93893, 2.08402, 2.2423, 2.40058, 2.55886, 2.71714, 2.87542, 3.0337]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "noelle-charged",
      name: "Favonius Bladework - Maid",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "noelle-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.5074, 0.5487, 0.59, 0.649, 0.6903, 0.7375, 0.8024, 0.8673, 0.9322, 1.003, 1.0738, 1.1446, 1.2154, 1.2862, 1.357]) },
          ],
        },
        {
          id: "noelle-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.90472, 0.97836, 1.052, 1.1572, 1.23084, 1.315, 1.43072, 1.54644, 1.66216, 1.7884, 1.91464, 2.04088, 2.16712, 2.29336, 2.4196]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "noelle-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "noelle-plungeLow-1",
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
      id: "noelle-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "noelle-plungeHigh-1",
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
      id: "noelle-skill",
      name: "Breastplate",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(24),
      energyCost: 0,
      instances: [
        {
          id: "noelle-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.2, 1.29, 1.38, 1.5, 1.59, 1.68, 1.8, 1.92, 2.04, 2.16, 2.28, 2.4, 2.55, 2.7, 2.85]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "noelle-burst",
      name: "Sweeping Time",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "noelle-burst-1",
          name: "Burst DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "noelle-burst-2",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.928, 0.9976, 1.0672, 1.16, 1.2296, 1.2992, 1.392, 1.4848, 1.5776, 1.6704, 1.7632, 1.856, 1.972, 2.088, 2.204]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "noelle-a1", name: "Devotion", unlockAscension: 1, effects: [] },
    { id: "noelle-a4", name: "Nice and Clean", unlockAscension: 4, effects: [] },
    { id: "noelle-p3", name: "Maid's Knighthood", effects: [] },
  ],
  constellations: [
    { level: 1, id: "noelle-c1", name: "I Got Your Back", effects: [] },
    { level: 2, id: "noelle-c2", name: "Combat Maid", effects: [] },
    { level: 3, id: "noelle-c3", name: "Invulnerable Maid", effects: [], buffs: [{ id: "noelle-c3", source: "Invulnerable Maid", sourceCharacterId: "noelle", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "noelle-c4", name: "To Be Cleaned", effects: [] },
    { level: 5, id: "noelle-c5", name: "Favonius Sweeper Master", effects: [], buffs: [{ id: "noelle-c5", source: "Favonius Sweeper Master", sourceCharacterId: "noelle", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "noelle-c6", name: "Must Be Spotless", effects: [] },
  ],
  resources: [],
};

export const travelerFGeo: GeneratedCharacter = {
  id: "traveler-f-geo",
  name: "Traveler",
  element: "geo",
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
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "traveler-f-geo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-geo-na-1-1",
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
        id: "traveler-f-geo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-geo-na-2-1",
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
        id: "traveler-f-geo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-geo-na-3-1",
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
        id: "traveler-f-geo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-geo-na-4-1",
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
        id: "traveler-f-geo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-geo-na-5-1",
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
      id: "traveler-f-geo-charged",
      name: "Foreign Rockblade",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-geo-charged-1",
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
      id: "traveler-f-geo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-geo-plungeLow-1",
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
      id: "traveler-f-geo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-geo-plungeHigh-1",
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
      id: "traveler-f-geo-skill",
      name: "Starfell Sword",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-geo-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([2.48, 2.666, 2.852, 3.1, 3.286, 3.472, 3.72, 3.968, 4.216, 4.464, 4.712, 4.96, 5.27, 5.58, 5.89]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-geo-burst",
      name: "Wake of Earth",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-f-geo-burst-1",
          name: "DMG Per Shockwave",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.48, 1.591, 1.702, 1.85, 1.961, 2.072, 2.22, 2.368, 2.516, 2.664, 2.812, 2.96, 3.145, 3.33, 3.515]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-geo-a1", name: "Shattered Darkrock", unlockAscension: 1, effects: [] },
    { id: "traveler-f-geo-a4", name: "Frenzied Rockslide", unlockAscension: 4, effects: [] },
    { id: "traveler-f-geo-p3", name: "Foreign Adamantine", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-geo-c1", name: "Invincible Stonewall", effects: [] },
    { level: 2, id: "traveler-f-geo-c2", name: "Rockcore Meltdown", effects: [] },
    { level: 3, id: "traveler-f-geo-c3", name: "Will of the Rock", effects: [], buffs: [{ id: "traveler-f-geo-c3", source: "Will of the Rock", sourceCharacterId: "traveler-f-geo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-f-geo-c4", name: "Reaction Force", effects: [] },
    { level: 5, id: "traveler-f-geo-c5", name: "Meteorite Impact", effects: [], buffs: [{ id: "traveler-f-geo-c5", source: "Meteorite Impact", sourceCharacterId: "traveler-f-geo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-f-geo-c6", name: "Everlasting Boulder", effects: [] },
  ],
  resources: [],
};

export const travelerMGeo: GeneratedCharacter = {
  id: "traveler-m-geo",
  name: "Traveler",
  element: "geo",
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
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "traveler-m-geo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-geo-na-1-1",
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
        id: "traveler-m-geo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-geo-na-2-1",
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
        id: "traveler-m-geo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-geo-na-3-1",
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
        id: "traveler-m-geo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-geo-na-4-1",
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
        id: "traveler-m-geo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-geo-na-5-1",
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
      id: "traveler-m-geo-charged",
      name: "Foreign Rockblade",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-geo-charged-1",
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
      id: "traveler-m-geo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-geo-plungeLow-1",
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
      id: "traveler-m-geo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-geo-plungeHigh-1",
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
      id: "traveler-m-geo-skill",
      name: "Starfell Sword",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-geo-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([2.48, 2.666, 2.852, 3.1, 3.286, 3.472, 3.72, 3.968, 4.216, 4.464, 4.712, 4.96, 5.27, 5.58, 5.89]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-geo-burst",
      name: "Wake of Earth",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-m-geo-burst-1",
          name: "DMG Per Shockwave",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([1.48, 1.591, 1.702, 1.85, 1.961, 2.072, 2.22, 2.368, 2.516, 2.664, 2.812, 2.96, 3.145, 3.33, 3.515]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-geo-a1", name: "Shattered Darkrock", unlockAscension: 1, effects: [] },
    { id: "traveler-m-geo-a4", name: "Frenzied Rockslide", unlockAscension: 4, effects: [] },
    { id: "traveler-m-geo-p3", name: "Foreign Adamantine", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-geo-c1", name: "Invincible Stonewall", effects: [] },
    { level: 2, id: "traveler-m-geo-c2", name: "Rockcore Meltdown", effects: [] },
    { level: 3, id: "traveler-m-geo-c3", name: "Will of the Rock", effects: [], buffs: [{ id: "traveler-m-geo-c3", source: "Will of the Rock", sourceCharacterId: "traveler-m-geo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-m-geo-c4", name: "Reaction Force", effects: [] },
    { level: 5, id: "traveler-m-geo-c5", name: "Meteorite Impact", effects: [], buffs: [{ id: "traveler-m-geo-c5", source: "Meteorite Impact", sourceCharacterId: "traveler-m-geo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-m-geo-c6", name: "Everlasting Boulder", effects: [] },
  ],
  resources: [],
};

export const xilonen: GeneratedCharacter = {
  id: "xilonen",
  name: "Xilonen",
  element: "geo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 966, 2: 1046, 3: 1126, 4: 1207, 5: 1287, 6: 1368, 7: 1449, 8: 1530, 9: 1611, 10: 1691, 11: 1772, 12: 1853, 13: 1934, 14: 2016, 15: 2098, 16: 2179, 17: 2261, 18: 2342, 19: 2424, 20: 2505, 21: 3415, 22: 3497, 23: 3579, 24: 3661, 25: 3743, 26: 3827, 27: 3909, 28: 3991, 29: 4074, 30: 4156, 31: 4239, 32: 4322, 33: 4405, 34: 4487, 35: 4570, 36: 4654, 37: 4737, 38: 4820, 39: 4903, 40: 4987, 41: 5659, 42: 5743, 43: 5827, 44: 5910, 45: 5994, 46: 6078, 47: 6162, 48: 6246, 49: 6331, 50: 6415, 51: 7283, 52: 7368, 53: 7452, 54: 7537, 55: 7622, 56: 7707, 57: 7792, 58: 7877, 59: 7962, 60: 8047, 61: 8721, 62: 8805, 63: 8891, 64: 8976, 65: 9062, 66: 9148, 67: 9233, 68: 9319, 69: 9405, 70: 9491, 71: 10165, 72: 10252, 73: 10338, 74: 10424, 75: 10511, 76: 10597, 77: 10684, 78: 10771, 79: 10858, 80: 10945, 81: 11620, 82: 11707, 83: 11794, 84: 11881, 85: 11968, 86: 12056, 87: 12142, 88: 12230, 89: 12318, 90: 12405 } },
    atk: { byLevel: { 1: 21, 2: 23, 3: 25, 4: 27, 5: 29, 6: 30, 7: 32, 8: 34, 9: 36, 10: 37, 11: 39, 12: 41, 13: 43, 14: 45, 15: 47, 16: 48, 17: 50, 18: 52, 19: 54, 20: 56, 21: 76, 22: 78, 23: 79, 24: 81, 25: 83, 26: 85, 27: 87, 28: 88, 29: 90, 30: 92, 31: 94, 32: 96, 33: 98, 34: 99, 35: 101, 36: 103, 37: 105, 38: 107, 39: 109, 40: 111, 41: 125, 42: 127, 43: 129, 44: 131, 45: 133, 46: 135, 47: 137, 48: 138, 49: 140, 50: 142, 51: 161, 52: 163, 53: 165, 54: 167, 55: 169, 56: 171, 57: 173, 58: 175, 59: 177, 60: 178, 61: 193, 62: 195, 63: 197, 64: 199, 65: 201, 66: 203, 67: 205, 68: 207, 69: 209, 70: 210, 71: 225, 72: 227, 73: 229, 74: 231, 75: 233, 76: 235, 77: 237, 78: 239, 79: 241, 80: 243, 81: 258, 82: 260, 83: 262, 84: 263, 85: 265, 86: 267, 87: 269, 88: 271, 89: 273, 90: 275 } },
    def: { byLevel: { 1: 72, 2: 78, 3: 84, 4: 90, 5: 97, 6: 103, 7: 109, 8: 115, 9: 121, 10: 127, 11: 133, 12: 139, 13: 145, 14: 151, 15: 157, 16: 163, 17: 169, 18: 176, 19: 182, 20: 188, 21: 256, 22: 262, 23: 268, 24: 274, 25: 281, 26: 287, 27: 293, 28: 299, 29: 305, 30: 312, 31: 318, 32: 324, 33: 330, 34: 336, 35: 343, 36: 349, 37: 355, 38: 361, 39: 368, 40: 374, 41: 424, 42: 431, 43: 437, 44: 443, 45: 449, 46: 456, 47: 462, 48: 468, 49: 475, 50: 481, 51: 546, 52: 552, 53: 559, 54: 565, 55: 571, 56: 578, 57: 584, 58: 591, 59: 597, 60: 603, 61: 654, 62: 660, 63: 667, 64: 673, 65: 679, 66: 686, 67: 692, 68: 699, 69: 705, 70: 712, 71: 762, 72: 769, 73: 775, 74: 781, 75: 788, 76: 794, 77: 801, 78: 807, 79: 814, 80: 820, 81: 871, 82: 878, 83: 884, 84: 891, 85: 897, 86: 904, 87: 910, 88: 917, 89: 923, 90: 930 } },
  },
  ascensionBonus: {
    stat: "defPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.36],
  },
  baseStats: {
    atk: 275,
    hp: 12405,
    def: 930,
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
        id: "xilonen-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xilonen-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.517918, 0.560074, 0.60223, 0.662453, 0.704609, 0.752788, 0.819033, 0.885278, 0.951523, 1.023791, 1.096059, 1.168326, 1.240594, 1.312861, 1.385129]) },
            ],
          },
        ],
      },
      {
        id: "xilonen-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xilonen-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.273738, 0.296019, 0.3183, 0.35013, 0.372411, 0.397875, 0.432888, 0.467901, 0.502914, 0.54111, 0.579306, 0.617502, 0.655698, 0.693894, 0.73209]) },
              { stat: "atk", table: talentTable([0.273738, 0.296019, 0.3183, 0.35013, 0.372411, 0.397875, 0.432888, 0.467901, 0.502914, 0.54111, 0.579306, 0.617502, 0.655698, 0.693894, 0.73209]) },
            ],
          },
        ],
      },
      {
        id: "xilonen-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xilonen-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.729495, 0.788872, 0.84825, 0.933075, 0.992452, 1.060312, 1.15362, 1.246927, 1.340235, 1.442025, 1.543815, 1.645605, 1.747395, 1.849185, 1.950975]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xilonen-charged",
      name: "Ehecatl's Roar",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xilonen-charged-1",
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
      id: "xilonen-plungeLow",
      name: "Low/High Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xilonen-plungeLow-1",
          name: "Low/High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "def", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
            { stat: "def", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "xilonen-plungeHigh",
      name: "Low/High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xilonen-plungeHigh-1",
          name: "Low/High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "def", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
            { stat: "def", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "xilonen-skill",
      name: "Yohual's Scratch",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(7),
      energyCost: 0,
      particles: { count: 4, element: "geo" },
      instances: [
        {
          id: "xilonen-skill-1",
          name: "Rush DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.792, 1.9264, 2.0608, 2.24, 2.3744, 2.5088, 2.688, 2.8672, 3.0464, 3.2256, 3.4048, 3.584, 3.808, 4.032, 4.256]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xilonen-burst",
      name: "Ocelotlicue Point!",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "xilonen-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([2.8128, 3.02376, 3.23472, 3.516, 3.72696, 3.93792, 4.2192, 4.50048, 4.78176, 5.06304, 5.34432, 5.6256, 5.9772, 6.3288, 6.6804]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "xilonen-burst-2",
          name: "Follow-Up Beat DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([2.8128, 3.02376, 3.23472, 3.516, 3.72696, 3.93792, 4.2192, 4.50048, 4.78176, 5.06304, 5.34432, 5.6256, 5.9772, 6.3288, 6.6804]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "xilonen-a1", name: "Netotiliztli's Echoes", unlockAscension: 1, effects: [] },
    { id: "xilonen-a4", name: "Portable Armored Sheath", unlockAscension: 4, effects: [] },
    { id: "xilonen-p3", name: "Night Realm's Gift: Blessing of Forge-Fire", effects: [] },
    { id: "xilonen-p4", name: "Tour of Tepeilhuitl", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xilonen-c1", name: "Sabbatical Phrase", effects: [] },
    { level: 2, id: "xilonen-c2", name: "Chiucue Mix", effects: [] },
    { level: 3, id: "xilonen-c3", name: "Tonalpohualli's Loop", effects: [], buffs: [{ id: "xilonen-c3", source: "Tonalpohualli's Loop", sourceCharacterId: "xilonen", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "xilonen-c4", name: "Suchitl's Trance", effects: [] },
    { level: 5, id: "xilonen-c5", name: "Tlaltecuhtli's Crossfade", effects: [], buffs: [{ id: "xilonen-c5", source: "Tlaltecuhtli's Crossfade", sourceCharacterId: "xilonen", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "xilonen-c6", name: "Imperishable Night Carnival", effects: [] },
  ],
  resources: [],
};

export const yunJin: GeneratedCharacter = {
  id: "yun-jin",
  name: "Yun Jin",
  element: "geo",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 894, 2: 968, 3: 1041, 4: 1115, 5: 1188, 6: 1263, 7: 1336, 8: 1410, 9: 1484, 10: 1557, 11: 1632, 12: 1705, 13: 1779, 14: 1852, 15: 1927, 16: 2001, 17: 2074, 18: 2148, 19: 2221, 20: 2296, 21: 3036, 22: 3111, 23: 3185, 24: 3258, 25: 3332, 26: 3405, 27: 3480, 28: 3553, 29: 3627, 30: 3700, 31: 3774, 32: 3849, 33: 3922, 34: 3996, 35: 4069, 36: 4143, 37: 4217, 38: 4291, 39: 4365, 40: 4438, 41: 4987, 42: 5060, 43: 5134, 44: 5208, 45: 5282, 46: 5356, 47: 5429, 48: 5503, 49: 5577, 50: 5651, 51: 6356, 52: 6431, 53: 6505, 54: 6578, 55: 6652, 56: 6725, 57: 6800, 58: 6873, 59: 6947, 60: 7021, 61: 7569, 62: 7643, 63: 7716, 64: 7790, 65: 7864, 66: 7938, 67: 8012, 68: 8085, 69: 8159, 70: 8233, 71: 8781, 72: 8854, 73: 8929, 74: 9003, 75: 9076, 76: 9150, 77: 9223, 78: 9298, 79: 9371, 80: 9445, 81: 9994, 82: 10067, 83: 10141, 84: 10214, 85: 10288, 86: 10362, 87: 10436, 88: 10509, 89: 10583, 90: 10657 } },
    atk: { byLevel: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 21, 6: 23, 7: 24, 8: 25, 9: 27, 10: 28, 11: 29, 12: 31, 13: 32, 14: 33, 15: 35, 16: 36, 17: 37, 18: 39, 19: 40, 20: 41, 21: 54, 22: 56, 23: 57, 24: 58, 25: 60, 26: 61, 27: 62, 28: 64, 29: 65, 30: 66, 31: 68, 32: 69, 33: 70, 34: 72, 35: 73, 36: 74, 37: 76, 38: 77, 39: 78, 40: 80, 41: 89, 42: 91, 43: 92, 44: 93, 45: 95, 46: 96, 47: 97, 48: 99, 49: 100, 50: 101, 51: 114, 52: 115, 53: 117, 54: 118, 55: 119, 56: 121, 57: 122, 58: 123, 59: 125, 60: 126, 61: 136, 62: 137, 63: 138, 64: 140, 65: 141, 66: 142, 67: 144, 68: 145, 69: 146, 70: 148, 71: 158, 72: 159, 73: 160, 74: 161, 75: 163, 76: 164, 77: 165, 78: 167, 79: 168, 80: 169, 81: 179, 82: 181, 83: 182, 84: 183, 85: 185, 86: 186, 87: 187, 88: 188, 89: 190, 90: 191 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 72, 4: 77, 5: 82, 6: 87, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 117, 13: 123, 14: 128, 15: 133, 16: 138, 17: 143, 18: 148, 19: 153, 20: 158, 21: 209, 22: 214, 23: 219, 24: 225, 25: 230, 26: 235, 27: 240, 28: 245, 29: 250, 30: 255, 31: 260, 32: 265, 33: 270, 34: 275, 35: 280, 36: 286, 37: 291, 38: 296, 39: 301, 40: 306, 41: 344, 42: 349, 43: 354, 44: 359, 45: 364, 46: 369, 47: 374, 48: 379, 49: 384, 50: 389, 51: 438, 52: 443, 53: 448, 54: 453, 55: 458, 56: 463, 57: 469, 58: 474, 59: 479, 60: 484, 61: 522, 62: 527, 63: 532, 64: 537, 65: 542, 66: 547, 67: 552, 68: 557, 69: 562, 70: 567, 71: 605, 72: 610, 73: 615, 74: 620, 75: 625, 76: 631, 77: 636, 78: 641, 79: 646, 80: 651, 81: 689, 82: 694, 83: 699, 84: 704, 85: 709, 86: 714, 87: 719, 88: 724, 89: 729, 90: 734 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.267],
  },
  baseStats: {
    atk: 191,
    hp: 10657,
    def: 734,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1.267,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "yun-jin-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yun-jin-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.40506, 0.43803, 0.471, 0.5181, 0.55107, 0.58875, 0.64056, 0.69237, 0.74418, 0.8007, 0.85722, 0.91374, 0.97026, 1.02678, 1.0833]) },
            ],
          },
        ],
      },
      {
        id: "yun-jin-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yun-jin-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.40248, 0.43524, 0.468, 0.5148, 0.54756, 0.585, 0.63648, 0.68796, 0.73944, 0.7956, 0.85176, 0.90792, 0.96408, 1.02024, 1.0764]) },
            ],
          },
        ],
      },
      {
        id: "yun-jin-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yun-jin-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.22962, 0.24831, 0.267, 0.2937, 0.31239, 0.33375, 0.36312, 0.39249, 0.42186, 0.4539, 0.48594, 0.51798, 0.55002, 0.58206, 0.6141]) },
              { stat: "atk", table: talentTable([0.2752, 0.2976, 0.32, 0.352, 0.3744, 0.4, 0.4352, 0.4704, 0.5056, 0.544, 0.5824, 0.6208, 0.6592, 0.6976, 0.736]) },
            ],
          },
        ],
      },
      {
        id: "yun-jin-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yun-jin-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.23994, 0.25947, 0.279, 0.3069, 0.32643, 0.34875, 0.37944, 0.41013, 0.44082, 0.4743, 0.50778, 0.54126, 0.57474, 0.60822, 0.6417]) },
              { stat: "atk", table: talentTable([0.2881, 0.31155, 0.335, 0.3685, 0.39195, 0.41875, 0.4556, 0.49245, 0.5293, 0.5695, 0.6097, 0.6499, 0.6901, 0.7303, 0.7705]) },
            ],
          },
        ],
      },
      {
        id: "yun-jin-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yun-jin-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.67338, 0.72819, 0.783, 0.8613, 0.91611, 0.97875, 1.06488, 1.15101, 1.23714, 1.3311, 1.42506, 1.51902, 1.61298, 1.70694, 1.8009]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yun-jin-charged",
      name: "Cloud-Grazing Strike",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yun-jin-charged-1",
          name: "Charged Attack",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.2169, 1.31595, 1.415, 1.5565, 1.65555, 1.76875, 1.9244, 2.08005, 2.2357, 2.4055, 2.600062, 2.828868, 3.057673, 3.286479, 3.536085]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "yun-jin-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yun-jin-plungeLow-1",
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
      id: "yun-jin-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yun-jin-plungeHigh-1",
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
      id: "yun-jin-skill",
      name: "Opening Flourish",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 4, element: "geo" },
      instances: [
        {
          id: "yun-jin-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.4912, 1.60304, 1.71488, 1.864, 1.97584, 2.08768, 2.2368, 2.38592, 2.53504, 2.68416, 2.83328, 2.9824, 3.1688, 3.3552, 3.5416]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "yun-jin-skill-2",
          name: "Charge Level 1 DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([2.6096, 2.80532, 3.00104, 3.262, 3.45772, 3.65344, 3.9144, 4.17536, 4.43632, 4.69728, 4.95824, 5.2192, 5.5454, 5.8716, 6.1978]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "yun-jin-skill-3",
          name: "Charge Level 2 DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([3.728, 4.0076, 4.2872, 4.66, 4.9396, 5.2192, 5.592, 5.9648, 6.3376, 6.7104, 7.0832, 7.456, 7.922, 8.388, 8.854]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yun-jin-burst",
      name: "Cliffbreaker's Banner",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "yun-jin-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([2.44, 2.623, 2.806, 3.05, 3.233, 3.416, 3.66, 3.904, 4.148, 4.392, 4.636, 4.88, 5.185, 5.49, 5.795]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yun-jin-a1", name: "True to Oneself", unlockAscension: 1, effects: [] },
    { id: "yun-jin-a4", name: "Breaking Conventions", unlockAscension: 4, effects: [] },
    { id: "yun-jin-p3", name: "Light Nourishment", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yun-jin-c1", name: "Thespian Gallop", effects: [] },
    { level: 2, id: "yun-jin-c2", name: "Myriad Mise-En-Scène", effects: [] },
    { level: 3, id: "yun-jin-c3", name: "Seafaring General", effects: [], buffs: [{ id: "yun-jin-c3", source: "Seafaring General", sourceCharacterId: "yun-jin", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "yun-jin-c4", name: "Flower and a Fighter", effects: [] },
    { level: 5, id: "yun-jin-c5", name: "Famed Throughout the Land", effects: [], buffs: [{ id: "yun-jin-c5", source: "Famed Throughout the Land", sourceCharacterId: "yun-jin", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "yun-jin-c6", name: "Decorous Harmony", effects: [] },
  ],
  resources: [],
};

export const zhongli: GeneratedCharacter = {
  id: "zhongli",
  name: "Zhongli",
  element: "geo",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1144, 2: 1239, 3: 1334, 4: 1430, 5: 1525, 6: 1621, 7: 1716, 8: 1812, 9: 1908, 10: 2003, 11: 2099, 12: 2195, 13: 2291, 14: 2389, 15: 2485, 16: 2581, 17: 2678, 18: 2774, 19: 2871, 20: 2967, 21: 4046, 22: 4143, 23: 4240, 24: 4337, 25: 4435, 26: 4533, 27: 4630, 28: 4727, 29: 4826, 30: 4923, 31: 5021, 32: 5120, 33: 5218, 34: 5315, 35: 5414, 36: 5513, 37: 5612, 38: 5710, 39: 5808, 40: 5908, 41: 6703, 42: 6803, 43: 6902, 44: 7001, 45: 7100, 46: 7200, 47: 7299, 48: 7399, 49: 7500, 50: 7599, 51: 8628, 52: 8728, 53: 8828, 54: 8929, 55: 9029, 56: 9130, 57: 9231, 58: 9331, 59: 9432, 60: 9533, 61: 10330, 62: 10431, 63: 10533, 64: 10633, 65: 10735, 66: 10837, 67: 10938, 68: 11040, 69: 11141, 70: 11243, 71: 12042, 72: 12145, 73: 12247, 74: 12349, 75: 12451, 76: 12553, 77: 12656, 78: 12759, 79: 12862, 80: 12965, 81: 13765, 82: 13868, 83: 13971, 84: 14074, 85: 14177, 86: 14281, 87: 14384, 88: 14488, 89: 14592, 90: 14695 } },
    atk: { byLevel: { 1: 20, 2: 21, 3: 23, 4: 24, 5: 26, 6: 28, 7: 29, 8: 31, 9: 33, 10: 34, 11: 36, 12: 38, 13: 39, 14: 41, 15: 42, 16: 44, 17: 46, 18: 47, 19: 49, 20: 51, 21: 69, 22: 71, 23: 72, 24: 74, 25: 76, 26: 77, 27: 79, 28: 81, 29: 82, 30: 84, 31: 86, 32: 87, 33: 89, 34: 91, 35: 93, 36: 94, 37: 96, 38: 98, 39: 99, 40: 101, 41: 115, 42: 116, 43: 118, 44: 120, 45: 121, 46: 123, 47: 125, 48: 126, 49: 128, 50: 130, 51: 147, 52: 149, 53: 151, 54: 153, 55: 154, 56: 156, 57: 158, 58: 159, 59: 161, 60: 163, 61: 177, 62: 178, 63: 180, 64: 182, 65: 183, 66: 185, 67: 187, 68: 189, 69: 190, 70: 192, 71: 206, 72: 208, 73: 209, 74: 211, 75: 213, 76: 215, 77: 216, 78: 218, 79: 220, 80: 222, 81: 235, 82: 237, 83: 239, 84: 241, 85: 242, 86: 244, 87: 246, 88: 248, 89: 249, 90: 251 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 67, 4: 72, 5: 77, 6: 81, 7: 86, 8: 91, 9: 96, 10: 101, 11: 105, 12: 110, 13: 115, 14: 120, 15: 125, 16: 130, 17: 134, 18: 139, 19: 144, 20: 149, 21: 203, 22: 208, 23: 213, 24: 218, 25: 223, 26: 228, 27: 232, 28: 237, 29: 242, 30: 247, 31: 252, 32: 257, 33: 262, 34: 267, 35: 272, 36: 277, 37: 282, 38: 287, 39: 292, 40: 297, 41: 337, 42: 342, 43: 347, 44: 351, 45: 356, 46: 361, 47: 366, 48: 371, 49: 377, 50: 382, 51: 433, 52: 438, 53: 443, 54: 448, 55: 453, 56: 458, 57: 463, 58: 469, 59: 474, 60: 479, 61: 519, 62: 524, 63: 529, 64: 534, 65: 539, 66: 544, 67: 549, 68: 554, 69: 559, 70: 564, 71: 605, 72: 610, 73: 615, 74: 620, 75: 625, 76: 630, 77: 635, 78: 641, 79: 646, 80: 651, 81: 691, 82: 696, 83: 701, 84: 707, 85: 712, 86: 717, 87: 722, 88: 727, 89: 733, 90: 738 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "geo",
  },
  baseStats: {
    atk: 251,
    hp: 14695,
    def: 738,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { geo: 0.28800000000000003 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "zhongli-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.307691, 0.332735, 0.35778, 0.393558, 0.418603, 0.447225, 0.486581, 0.525937, 0.565292, 0.608226, 0.657421, 0.715274, 0.773127, 0.83098, 0.894092]) },
            ],
          },
        ],
      },
      {
        id: "zhongli-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.311518, 0.336874, 0.36223, 0.398453, 0.423809, 0.452788, 0.492633, 0.532478, 0.572323, 0.615791, 0.665598, 0.72417, 0.782743, 0.841315, 0.905213]) },
            ],
          },
        ],
      },
      {
        id: "zhongli-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.385762, 0.417161, 0.44856, 0.493416, 0.524815, 0.5607, 0.610042, 0.659383, 0.708725, 0.762552, 0.824229, 0.896761, 0.969293, 1.041825, 1.120951]) },
            ],
          },
        ],
      },
      {
        id: "zhongli-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.429389, 0.46434, 0.49929, 0.549219, 0.584169, 0.624113, 0.679034, 0.733956, 0.788878, 0.848793, 0.917445, 0.998181, 1.078916, 1.159651, 1.247726]) },
            ],
          },
        ],
      },
      {
        id: "zhongli-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-5-1-1",
            name: "5-Hit DMG (1/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.1075, 0.11625, 0.125, 0.1375, 0.14625, 0.15625, 0.17, 0.18375, 0.1975, 0.2125, 0.229687, 0.2499, 0.270112, 0.290325, 0.312375]) },
            ],
          },
          {
            id: "zhongli-na-5-1-2",
            name: "5-Hit DMG (2/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.1075, 0.11625, 0.125, 0.1375, 0.14625, 0.15625, 0.17, 0.18375, 0.1975, 0.2125, 0.229687, 0.2499, 0.270112, 0.290325, 0.312375]) },
            ],
          },
          {
            id: "zhongli-na-5-1-3",
            name: "5-Hit DMG (3/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.1075, 0.11625, 0.125, 0.1375, 0.14625, 0.15625, 0.17, 0.18375, 0.1975, 0.2125, 0.229687, 0.2499, 0.270112, 0.290325, 0.312375]) },
            ],
          },
          {
            id: "zhongli-na-5-1-4",
            name: "5-Hit DMG (4/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.1075, 0.11625, 0.125, 0.1375, 0.14625, 0.15625, 0.17, 0.18375, 0.1975, 0.2125, 0.229687, 0.2499, 0.270112, 0.290325, 0.312375]) },
            ],
          },
        ],
      },
      {
        id: "zhongli-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zhongli-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.544965, 0.589322, 0.63368, 0.697048, 0.741406, 0.7921, 0.861805, 0.93151, 1.001214, 1.077256, 1.164387, 1.266853, 1.369319, 1.471785, 1.583566]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "zhongli-charged",
      name: "Rain of Stone",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zhongli-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.11026, 1.20063, 1.291, 1.4201, 1.51047, 1.61375, 1.75576, 1.89777, 2.03978, 2.1947, 2.372212, 2.580967, 2.789722, 2.998477, 3.226209]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "zhongli-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zhongli-plungeLow-1",
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
      id: "zhongli-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zhongli-plungeHigh-1",
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
      id: "zhongli-skill",
      name: "Dominus Lapidis",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 1, element: "geo" },
      instances: [
        {
          id: "zhongli-skill-1",
          name: "Stone Stele DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.16, 0.172, 0.184, 0.2, 0.212, 0.224, 0.24, 0.256, 0.272, 0.288, 0.304, 0.32, 0.34, 0.36, 0.38]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zhongli-skill-2",
          name: "Resonance DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.32, 0.344, 0.368, 0.4, 0.424, 0.448, 0.48, 0.512, 0.544, 0.576, 0.608, 0.64, 0.68, 0.72, 0.76]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zhongli-skill-3",
          name: "Hold DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.8, 0.86, 0.92, 1, 1.06, 1.12, 1.2, 1.28, 1.36, 1.44, 1.52, 1.6, 1.7, 1.8, 1.9]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "zhongli-burst",
      name: "Planet Befall",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "zhongli-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([4.0108, 4.4444, 4.878, 5.42, 5.9078, 6.3956, 7.046, 7.6964, 8.3468, 8.9972, 9.6476, 10.298, 10.84, 11.382, 11.924]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "zhongli-a1", name: "Resonant Waves", unlockAscension: 1, effects: [] },
    { id: "zhongli-a4", name: "Dominance of Earth", unlockAscension: 4, effects: [] },
    { id: "zhongli-p3", name: "Arcanum of Crystal", effects: [] },
  ],
  constellations: [
    { level: 1, id: "zhongli-c1", name: "Rock, the Backbone of Earth", effects: [] },
    { level: 2, id: "zhongli-c2", name: "Stone, the Cradle of Jade", effects: [] },
    { level: 3, id: "zhongli-c3", name: "Jade, Shimmering through Darkness", effects: [], buffs: [{ id: "zhongli-c3", source: "Jade, Shimmering through Darkness", sourceCharacterId: "zhongli", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "zhongli-c4", name: "Topaz, Unbreakable and Fearless", effects: [] },
    { level: 5, id: "zhongli-c5", name: "Lazuli, Herald of the Order", effects: [], buffs: [{ id: "zhongli-c5", source: "Lazuli, Herald of the Order", sourceCharacterId: "zhongli", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "zhongli-c6", name: "Chrysos, Bounty of Dominator", effects: [] },
  ],
  resources: [],
};

export const zibai: GeneratedCharacter = {
  id: "zibai",
  name: "Zibai",
  element: "geo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1006, 2: 1089, 3: 1173, 4: 1257, 5: 1341, 6: 1425, 7: 1509, 8: 1593, 9: 1678, 10: 1761, 11: 1846, 12: 1930, 13: 2015, 14: 2100, 15: 2184, 16: 2269, 17: 2354, 18: 2439, 19: 2524, 20: 2609, 21: 3557, 22: 3642, 23: 3728, 24: 3813, 25: 3899, 26: 3985, 27: 4071, 28: 4156, 29: 4243, 30: 4328, 31: 4415, 32: 4501, 33: 4588, 34: 4673, 35: 4760, 36: 4847, 37: 4934, 38: 5020, 39: 5107, 40: 5194, 41: 5893, 42: 5981, 43: 6068, 44: 6155, 45: 6242, 46: 6330, 47: 6417, 48: 6505, 49: 6593, 50: 6681, 51: 7585, 52: 7674, 53: 7761, 54: 7850, 55: 7938, 56: 8027, 57: 8115, 58: 8204, 59: 8292, 60: 8381, 61: 9082, 62: 9171, 63: 9260, 64: 9349, 65: 9438, 66: 9528, 67: 9616, 68: 9706, 69: 9795, 70: 9885, 71: 10587, 72: 10677, 73: 10767, 74: 10856, 75: 10947, 76: 11036, 77: 11127, 78: 11217, 79: 11308, 80: 11399, 81: 12102, 82: 12192, 83: 12283, 84: 12373, 85: 12464, 86: 12555, 87: 12646, 88: 12737, 89: 12829, 90: 12919 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 20, 4: 22, 5: 23, 6: 25, 7: 26, 8: 28, 9: 29, 10: 31, 11: 32, 12: 34, 13: 35, 14: 37, 15: 38, 16: 39, 17: 41, 18: 42, 19: 44, 20: 45, 21: 62, 22: 63, 23: 65, 24: 66, 25: 68, 26: 69, 27: 71, 28: 72, 29: 74, 30: 75, 31: 77, 32: 78, 33: 80, 34: 81, 35: 83, 36: 84, 37: 86, 38: 87, 39: 89, 40: 90, 41: 103, 42: 104, 43: 106, 44: 107, 45: 109, 46: 110, 47: 112, 48: 113, 49: 115, 50: 116, 51: 132, 52: 134, 53: 135, 54: 137, 55: 138, 56: 140, 57: 141, 58: 143, 59: 144, 60: 146, 61: 158, 62: 160, 63: 161, 64: 163, 65: 164, 66: 166, 67: 167, 68: 169, 69: 170, 70: 172, 71: 184, 72: 186, 73: 187, 74: 189, 75: 191, 76: 192, 77: 194, 78: 195, 79: 197, 80: 198, 81: 211, 82: 212, 83: 214, 84: 215, 85: 217, 86: 218, 87: 220, 88: 222, 89: 223, 90: 225 } },
    def: { byLevel: { 1: 74, 2: 81, 3: 87, 4: 93, 5: 99, 6: 106, 7: 112, 8: 118, 9: 124, 10: 130, 11: 137, 12: 143, 13: 149, 14: 156, 15: 162, 16: 168, 17: 174, 18: 181, 19: 187, 20: 193, 21: 263, 22: 270, 23: 276, 24: 282, 25: 289, 26: 295, 27: 301, 28: 308, 29: 314, 30: 321, 31: 327, 32: 333, 33: 340, 34: 346, 35: 353, 36: 359, 37: 365, 38: 372, 39: 378, 40: 385, 41: 436, 42: 443, 43: 449, 44: 456, 45: 462, 46: 469, 47: 475, 48: 482, 49: 488, 50: 495, 51: 562, 52: 568, 53: 575, 54: 581, 55: 588, 56: 594, 57: 601, 58: 608, 59: 614, 60: 621, 61: 673, 62: 679, 63: 686, 64: 692, 65: 699, 66: 706, 67: 712, 68: 719, 69: 725, 70: 732, 71: 784, 72: 791, 73: 797, 74: 804, 75: 811, 76: 817, 77: 824, 78: 831, 79: 838, 80: 844, 81: 896, 82: 903, 83: 910, 84: 916, 85: 923, 86: 930, 87: 937, 88: 943, 89: 950, 90: 957 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 225,
    hp: 12919,
    def: 957,
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
        id: "zibai-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zibai-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.505542, 0.546691, 0.58784, 0.646624, 0.687773, 0.7348, 0.799462, 0.864125, 0.928787, 0.999328, 1.069869, 1.14041, 1.21095, 1.281491, 1.352032]) },
            ],
          },
        ],
      },
      {
        id: "zibai-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zibai-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.465527, 0.503418, 0.54131, 0.595441, 0.633333, 0.676638, 0.736182, 0.795726, 0.85527, 0.920227, 0.985184, 1.050141, 1.115099, 1.180056, 1.245013]) },
            ],
          },
        ],
      },
      {
        id: "zibai-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zibai-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.308882, 0.334023, 0.359165, 0.395082, 0.420223, 0.448956, 0.488464, 0.527973, 0.567481, 0.61058, 0.65368, 0.69678, 0.73988, 0.78298, 0.826079]) },
              { stat: "atk", table: talentTable([0.308882, 0.334023, 0.359165, 0.395082, 0.420223, 0.448956, 0.488464, 0.527973, 0.567481, 0.61058, 0.65368, 0.69678, 0.73988, 0.78298, 0.826079]) },
            ],
          },
        ],
      },
      {
        id: "zibai-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "zibai-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.778954, 0.842357, 0.90576, 0.996336, 1.059739, 1.1322, 1.231834, 1.331467, 1.431101, 1.539792, 1.648483, 1.757174, 1.865866, 1.974557, 2.083248]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "zibai-charged",
      name: "Golden Blade's Petaled Touch",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zibai-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.73659, 0.796545, 0.8565, 0.94215, 1.002105, 1.070625, 1.16484, 1.259055, 1.35327, 1.45605, 1.55883, 1.66161, 1.76439, 1.86717, 1.96995]) },
            { stat: "atk", table: talentTable([0.73659, 0.796545, 0.8565, 0.94215, 1.002105, 1.070625, 1.16484, 1.259055, 1.35327, 1.45605, 1.55883, 1.66161, 1.76439, 1.86717, 1.96995]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "zibai-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zibai-plungeLow-1",
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
      id: "zibai-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "zibai-plungeHigh-1",
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
      id: "zibai-skill",
      name: "Heaven and Earth Made Manifest",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 1, element: "geo" },
      instances: [
        {
          id: "zibai-skill-1",
          name: "Lunar Phase Shift 1-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.565792, 0.608226, 0.650661, 0.70724, 0.749674, 0.792109, 0.848688, 0.905267, 0.961846, 1.018426, 1.075005, 1.131584, 1.202308, 1.273032, 1.343756]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-2",
          name: "Lunar Phase Shift 2-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.521007, 0.560083, 0.599158, 0.651259, 0.690335, 0.72941, 0.781511, 0.833612, 0.885712, 0.937813, 0.989914, 1.042014, 1.10714, 1.172266, 1.237392]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-3",
          name: "Lunar Phase Shift 3-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.345694, 0.371621, 0.397548, 0.432117, 0.458044, 0.483971, 0.51854, 0.55311, 0.587679, 0.622248, 0.656818, 0.691387, 0.734599, 0.777811, 0.821022]) },
            { stat: "def", table: talentTable([0.345694, 0.371621, 0.397548, 0.432117, 0.458044, 0.483971, 0.51854, 0.55311, 0.587679, 0.622248, 0.656818, 0.691387, 0.734599, 0.777811, 0.821022]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-4",
          name: "Lunar Phase Shift 4-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.871788, 0.937172, 1.002556, 1.089735, 1.155119, 1.220503, 1.307682, 1.394861, 1.48204, 1.569218, 1.656397, 1.743576, 1.852549, 1.961523, 2.070496]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-5",
          name: "Lunar Phase Shift Charged Attack DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "atk", table: talentTable([0.6595, 0.708962, 0.758425, 0.824375, 0.873838, 0.9233, 0.98925, 1.0552, 1.12115, 1.1871, 1.25305, 1.319, 1.401437, 1.483875, 1.566312]) },
            { stat: "def", table: talentTable([0.6595, 0.708962, 0.758425, 0.824375, 0.873838, 0.9233, 0.98925, 1.0552, 1.12115, 1.1871, 1.25305, 1.319, 1.401437, 1.483875, 1.566312]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-6",
          name: "Spirit Steed's Stride 1-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.72528, 1.854676, 1.984072, 2.1566, 2.285996, 2.415392, 2.58792, 2.760448, 2.932976, 3.105504, 3.278032, 3.45056, 3.66622, 3.88188, 4.09754]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-7",
          name: "Spirit Steed's Stride 2-Hit DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.40968, 1.515406, 1.621132, 1.7621, 1.867826, 1.973552, 2.11452, 2.255488, 2.396456, 2.537424, 2.678392, 2.81936, 2.99557, 3.17178, 3.34799]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
        {
          id: "zibai-skill-8",
          name: "Lunar Phase Shift 4-Hit Additional DMG",
          damageType: "skill",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([0.29456, 0.316652, 0.338744, 0.3682, 0.390292, 0.412384, 0.44184, 0.471296, 0.500752, 0.530208, 0.559664, 0.58912, 0.62594, 0.66276, 0.69958]) },
          ],
          application: { element: "geo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "zibai-burst",
      name: "Tri-Sphere Eminence",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "zibai-burst-1",
          name: "Skill 1-Hit DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.2696, 1.36482, 1.46004, 1.587, 1.68222, 1.77744, 1.9044, 2.03136, 2.15832, 2.28528, 2.41224, 2.5392, 2.6979, 2.8566, 3.0153]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
        {
          id: "zibai-burst-2",
          name: "Skill 2-Hit DMG",
          damageType: "burst",
          element: "geo",
          scaling: [
            { stat: "def", table: talentTable([1.77744, 1.910748, 2.044056, 2.2218, 2.355108, 2.488416, 2.66616, 2.843904, 3.021648, 3.199392, 3.377136, 3.55488, 3.77706, 3.99924, 4.22142]) },
          ],
          application: { element: "geo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "zibai-a1", name: "The Selenic Adeptus Descends", unlockAscension: 1, effects: [] },
    { id: "zibai-a4", name: "Layered Peaks Pierce the Clouds", unlockAscension: 4, effects: [] },
    { id: "zibai-p3", name: "Moonsign Benediction: The Coursing Sun and Moon", effects: [] },
    { id: "zibai-p4", name: "Moonlit Flower Forest", effects: [] },
  ],
  constellations: [
    { level: 1, id: "zibai-c1", name: "Burst Forth With Vigor, But Enter in Silence", effects: [] },
    { level: 2, id: "zibai-c2", name: "At Birth Are Souls Born, and in Death Leave But Husks", effects: [] },
    { level: 3, id: "zibai-c3", name: "Free From Constraints and Worldly Ties", effects: [], buffs: [{ id: "zibai-c3", source: "Free From Constraints and Worldly Ties", sourceCharacterId: "zibai", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "zibai-c4", name: "The Spirit Passes, Then Form Follows", effects: [] },
    { level: 5, id: "zibai-c5", name: "Perceive the Worthless and Debate It Not", effects: [], buffs: [{ id: "zibai-c5", source: "Perceive the Worthless and Debate It Not", sourceCharacterId: "zibai", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "zibai-c6", name: "The World, A Journey in Passing", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   albedo.castTime: cast times are engine defaults, not sourced
//   albedo.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   albedo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   aratakiItto.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   aratakiItto.castTime: cast times are engine defaults, not sourced
//   aratakiItto.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   aratakiItto.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   chiori.castTime: cast times are engine defaults, not sourced
//   chiori.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   chiori.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   gorou.castTime: cast times are engine defaults, not sourced
//   gorou.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   gorou.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   illuga.castTime: cast times are engine defaults, not sourced
//   illuga.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   illuga.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kachina.castTime: cast times are engine defaults, not sourced
//   kachina.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   kachina.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   linnea.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   linnea.castTime: cast times are engine defaults, not sourced
//   linnea.constellations: 1 modelled, 2 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   linnea.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   navia.castTime: cast times are engine defaults, not sourced
//   navia.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   navia.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   ningguang.castTime: cast times are engine defaults, not sourced
//   ningguang.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   ningguang.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   noelle.castTime: cast times are engine defaults, not sourced
//   noelle.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   noelle.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   noelle.skill.particles: skill particle yield not published by either source
//   travelerFGeo.castTime: cast times are engine defaults, not sourced
//   travelerFGeo.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   travelerFGeo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFGeo.skill.particles: skill particle yield not published by either source
//   travelerMGeo.castTime: cast times are engine defaults, not sourced
//   travelerMGeo.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   travelerMGeo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMGeo.skill.particles: skill particle yield not published by either source
//   xilonen.castTime: cast times are engine defaults, not sourced
//   xilonen.constellations: 2 modelled, 6 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   xilonen.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yunJin.castTime: cast times are engine defaults, not sourced
//   yunJin.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   yunJin.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   zhongli.castTime: cast times are engine defaults, not sourced
//   zhongli.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   zhongli.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   zibai.castTime: cast times are engine defaults, not sourced
//   zibai.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   zibai.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const geoGeneratedCharacters: readonly GeneratedCharacter[] = [
  albedo,
  aratakiItto,
  chiori,
  gorou,
  illuga,
  kachina,
  linnea,
  navia,
  ningguang,
  noelle,
  travelerFGeo,
  travelerMGeo,
  xilonen,
  yunJin,
  zhongli,
  zibai,
];
