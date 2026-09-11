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


export const amber: GeneratedCharacter = {
  id: "amber",
  name: "Amber",
  element: "pyro",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 793, 2: 859, 3: 924, 4: 990, 5: 1055, 6: 1121, 7: 1186, 8: 1252, 9: 1318, 10: 1383, 11: 1448, 12: 1514, 13: 1579, 14: 1644, 15: 1710, 16: 1776, 17: 1841, 18: 1907, 19: 1972, 20: 2038, 21: 2696, 22: 2761, 23: 2827, 24: 2892, 25: 2958, 26: 3023, 27: 3089, 28: 3154, 29: 3220, 30: 3285, 31: 3351, 32: 3417, 33: 3482, 34: 3547, 35: 3613, 36: 3678, 37: 3743, 38: 3809, 39: 3875, 40: 3940, 41: 4427, 42: 4492, 43: 4558, 44: 4623, 45: 4689, 46: 4755, 47: 4820, 48: 4886, 49: 4951, 50: 5016, 51: 5643, 52: 5709, 53: 5775, 54: 5840, 55: 5905, 56: 5971, 57: 6036, 58: 6101, 59: 6167, 60: 6233, 61: 6719, 62: 6785, 63: 6850, 64: 6916, 65: 6981, 66: 7047, 67: 7113, 68: 7178, 69: 7244, 70: 7309, 71: 7795, 72: 7861, 73: 7926, 74: 7992, 75: 8057, 76: 8123, 77: 8188, 78: 8254, 79: 8319, 80: 8385, 81: 8872, 82: 8937, 83: 9003, 84: 9068, 85: 9134, 86: 9199, 87: 9264, 88: 9329, 89: 9395, 90: 9461 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 50, 2: 55, 3: 59, 4: 63, 5: 67, 6: 71, 7: 75, 8: 79, 9: 84, 10: 88, 11: 92, 12: 96, 13: 100, 14: 104, 15: 109, 16: 113, 17: 117, 18: 121, 19: 125, 20: 129, 21: 171, 22: 175, 23: 179, 24: 184, 25: 188, 26: 192, 27: 196, 28: 200, 29: 204, 30: 209, 31: 213, 32: 217, 33: 221, 34: 225, 35: 229, 36: 234, 37: 238, 38: 242, 39: 246, 40: 250, 41: 281, 42: 285, 43: 289, 44: 293, 45: 298, 46: 302, 47: 306, 48: 310, 49: 314, 50: 318, 51: 358, 52: 362, 53: 367, 54: 371, 55: 375, 56: 379, 57: 383, 58: 387, 59: 392, 60: 396, 61: 427, 62: 431, 63: 435, 64: 439, 65: 443, 66: 447, 67: 452, 68: 456, 69: 460, 70: 464, 71: 495, 72: 499, 73: 503, 74: 507, 75: 511, 76: 516, 77: 520, 78: 524, 79: 528, 80: 532, 81: 563, 82: 567, 83: 572, 84: 576, 85: 580, 86: 584, 87: 588, 88: 592, 89: 596, 90: 601 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 223,
    hp: 9461,
    def: 601,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "amber-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "amber-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3612, 0.3906, 0.42, 0.462, 0.4914, 0.525, 0.5712, 0.6174, 0.6636, 0.714, 0.7644, 0.8148, 0.8652, 0.9156, 0.966]) },
            ],
          },
        ],
      },
      {
        id: "amber-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "amber-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3612, 0.3906, 0.42, 0.462, 0.4914, 0.525, 0.5712, 0.6174, 0.6636, 0.714, 0.7644, 0.8148, 0.8652, 0.9156, 0.966]) },
            ],
          },
        ],
      },
      {
        id: "amber-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "amber-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4644, 0.5022, 0.54, 0.594, 0.6318, 0.675, 0.7344, 0.7938, 0.8532, 0.918, 0.9828, 1.0476, 1.1124, 1.1772, 1.242]) },
            ],
          },
        ],
      },
      {
        id: "amber-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "amber-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.473, 0.5115, 0.55, 0.605, 0.6435, 0.6875, 0.748, 0.8085, 0.869, 0.935, 1.001, 1.067, 1.133, 1.199, 1.265]) },
            ],
          },
        ],
      },
      {
        id: "amber-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "amber-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5934, 0.6417, 0.69, 0.759, 0.8073, 0.8625, 0.9384, 1.0143, 1.0902, 1.173, 1.2558, 1.3386, 1.4214, 1.5042, 1.587]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "amber-charged",
      name: "Sharpshooter",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "amber-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "amber-charged-2",
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
      id: "amber-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "amber-plungeLow-1",
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
      id: "amber-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "amber-plungeHigh-1",
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
      id: "amber-skill",
      name: "Explosive Puppet",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "pyro" },
      instances: [
        {
          id: "amber-skill-1",
          name: "Explosion DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.232, 1.3244, 1.4168, 1.54, 1.6324, 1.7248, 1.848, 1.9712, 2.0944, 2.2176, 2.3408, 2.464, 2.618, 2.772, 2.926]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "amber-burst",
      name: "Fiery Rain",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "amber-burst-1",
          name: "Fiery Rain DMG Per Wave",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.2808, 0.30186, 0.32292, 0.351, 0.37206, 0.39312, 0.4212, 0.44928, 0.47736, 0.50544, 0.53352, 0.5616, 0.5967, 0.6318, 0.6669]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "amber-burst-2",
          name: "Total Fiery Rain DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([5.0544, 5.43348, 5.81256, 6.318, 6.69708, 7.07616, 7.5816, 8.08704, 8.59248, 9.09792, 9.60336, 10.1088, 10.7406, 11.3724, 12.0042]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "amber-a1", name: "Every Arrow Finds Its Target", unlockAscension: 1, effects: [] },
    { id: "amber-a4", name: "Precise Shot", unlockAscension: 4, effects: [] },
    { id: "amber-p3", name: "Gliding Champion", effects: [] },
  ],
  constellations: [
    { level: 1, id: "amber-c1", name: "One Arrow to Rule Them All", effects: [] },
    { level: 2, id: "amber-c2", name: "Bunny Triggered", effects: [] },
    { level: 3, id: "amber-c3", name: "It Burns!", effects: [], buffs: [{ id: "amber-c3", source: "It Burns!", sourceCharacterId: "amber", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "amber-c4", name: "It's Not Just Any Doll...", effects: [] },
    { level: 5, id: "amber-c5", name: "It's Baron Bunny!", effects: [], buffs: [{ id: "amber-c5", source: "It's Baron Bunny!", sourceCharacterId: "amber", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "amber-c6", name: "Wildfire", effects: [] },
  ],
  resources: [],
};

export const arlecchino: GeneratedCharacter = {
  id: "arlecchino",
  name: "Arlecchino",
  element: "pyro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1020, 2: 1105, 3: 1189, 4: 1275, 5: 1360, 6: 1445, 7: 1530, 8: 1616, 9: 1701, 10: 1786, 11: 1872, 12: 1957, 13: 2043, 14: 2130, 15: 2216, 16: 2301, 17: 2388, 18: 2474, 19: 2560, 20: 2646, 21: 3607, 22: 3694, 23: 3781, 24: 3867, 25: 3954, 26: 4042, 27: 4129, 28: 4215, 29: 4303, 30: 4390, 31: 4477, 32: 4565, 33: 4653, 34: 4740, 35: 4827, 36: 4916, 37: 5004, 38: 5091, 39: 5179, 40: 5268, 41: 5977, 42: 6066, 43: 6155, 44: 6242, 45: 6331, 46: 6420, 47: 6509, 48: 6597, 49: 6687, 50: 6776, 51: 7693, 52: 7783, 53: 7872, 54: 7961, 55: 8051, 56: 8141, 57: 8231, 58: 8320, 59: 8410, 60: 8500, 61: 9211, 62: 9301, 63: 9392, 64: 9482, 65: 9572, 66: 9663, 67: 9753, 68: 9844, 69: 9934, 70: 10025, 71: 10737, 72: 10829, 73: 10920, 74: 11011, 75: 11103, 76: 11193, 77: 11285, 78: 11377, 79: 11469, 80: 11561, 81: 12274, 82: 12366, 83: 12457, 84: 12549, 85: 12641, 86: 12734, 87: 12826, 88: 12918, 89: 13011, 90: 13103 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 33, 5: 35, 6: 38, 7: 40, 8: 42, 9: 44, 10: 47, 11: 49, 12: 51, 13: 53, 14: 56, 15: 58, 16: 60, 17: 62, 18: 65, 19: 67, 20: 69, 21: 94, 22: 96, 23: 99, 24: 101, 25: 103, 26: 106, 27: 108, 28: 110, 29: 112, 30: 115, 31: 117, 32: 119, 33: 121, 34: 124, 35: 126, 36: 128, 37: 131, 38: 133, 39: 135, 40: 138, 41: 156, 42: 158, 43: 161, 44: 163, 45: 165, 46: 168, 47: 170, 48: 172, 49: 175, 50: 177, 51: 201, 52: 203, 53: 205, 54: 208, 55: 210, 56: 212, 57: 215, 58: 217, 59: 220, 60: 222, 61: 240, 62: 243, 63: 245, 64: 247, 65: 250, 66: 252, 67: 255, 68: 257, 69: 259, 70: 262, 71: 280, 72: 283, 73: 285, 74: 287, 75: 290, 76: 292, 77: 295, 78: 297, 79: 299, 80: 302, 81: 320, 82: 323, 83: 325, 84: 328, 85: 330, 86: 332, 87: 335, 88: 337, 89: 340, 90: 342 } },
    def: { byLevel: { 1: 60, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 119, 14: 124, 15: 129, 16: 134, 17: 139, 18: 144, 19: 149, 20: 154, 21: 211, 22: 216, 23: 221, 24: 226, 25: 231, 26: 236, 27: 241, 28: 246, 29: 251, 30: 256, 31: 261, 32: 266, 33: 272, 34: 277, 35: 282, 36: 287, 37: 292, 38: 297, 39: 302, 40: 307, 41: 349, 42: 354, 43: 359, 44: 364, 45: 369, 46: 375, 47: 380, 48: 385, 49: 390, 50: 395, 51: 449, 52: 454, 53: 459, 54: 465, 55: 470, 56: 475, 57: 480, 58: 486, 59: 491, 60: 496, 61: 538, 62: 543, 63: 548, 64: 553, 65: 559, 66: 564, 67: 569, 68: 574, 69: 580, 70: 585, 71: 627, 72: 632, 73: 637, 74: 643, 75: 648, 76: 653, 77: 659, 78: 664, 79: 669, 80: 675, 81: 716, 82: 722, 83: 727, 84: 732, 85: 738, 86: 743, 87: 749, 88: 754, 89: 759, 90: 765 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 342,
    hp: 13103,
    def: 765,
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
        id: "arlecchino-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.475004, 0.513667, 0.55233, 0.607563, 0.646226, 0.690412, 0.751169, 0.811925, 0.872681, 0.938961, 1.005241, 1.07152, 1.1378, 1.204079, 1.270359]) },
            ],
          },
        ],
      },
      {
        id: "arlecchino-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.521057, 0.563468, 0.60588, 0.666468, 0.70888, 0.75735, 0.823997, 0.890644, 0.95729, 1.029996, 1.102702, 1.175407, 1.248113, 1.320818, 1.393524]) },
            ],
          },
        ],
      },
      {
        id: "arlecchino-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.653858, 0.707079, 0.7603, 0.83633, 0.889551, 0.950375, 1.034008, 1.117641, 1.201274, 1.29251, 1.383746, 1.474982, 1.566218, 1.657454, 1.74869]) },
            ],
          },
        ],
      },
      {
        id: "arlecchino-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.371451, 0.401686, 0.43192, 0.475112, 0.505346, 0.5399, 0.587411, 0.634922, 0.682434, 0.734264, 0.786094, 0.837925, 0.889755, 0.941586, 0.993416]) },
              { stat: "atk", table: talentTable([0.371451, 0.401686, 0.43192, 0.475112, 0.505346, 0.5399, 0.587411, 0.634922, 0.682434, 0.734264, 0.786094, 0.837925, 0.889755, 0.941586, 0.993416]) },
            ],
          },
        ],
      },
      {
        id: "arlecchino-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.699816, 0.756778, 0.81374, 0.895114, 0.952076, 1.017175, 1.106686, 1.196198, 1.285709, 1.383358, 1.481007, 1.578656, 1.676304, 1.773953, 1.871602]) },
            ],
          },
        ],
      },
      {
        id: "arlecchino-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "arlecchino-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.853782, 0.923276, 0.99277, 1.092047, 1.161541, 1.240962, 1.350167, 1.459372, 1.568577, 1.687709, 1.806841, 1.925974, 2.045106, 2.164239, 2.283371]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "arlecchino-charged",
      name: "Invitation to a Beheading",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "arlecchino-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.90816, 0.98208, 1.056, 1.1616, 1.23552, 1.32, 1.43616, 1.55232, 1.66848, 1.7952, 1.92192, 2.04864, 2.17536, 2.30208, 2.4288]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "arlecchino-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "arlecchino-plungeLow-1",
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
      id: "arlecchino-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "arlecchino-plungeHigh-1",
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
      id: "arlecchino-skill",
      name: "All Is Ash",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(30),
      energyCost: 0,
      particles: { count: 5, element: "pyro" },
      instances: [
        {
          id: "arlecchino-skill-1",
          name: "Spike DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.1484, 0.15953, 0.17066, 0.1855, 0.19663, 0.20776, 0.2226, 0.23744, 0.25228, 0.26712, 0.28196, 0.2968, 0.31535, 0.3339, 0.35245]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "arlecchino-skill-2",
          name: "Cleave DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.3356, 1.43577, 1.53594, 1.6695, 1.76967, 1.86984, 2.0034, 2.13696, 2.27052, 2.40408, 2.53764, 2.6712, 2.83815, 3.0051, 3.17205]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "arlecchino-skill-3",
          name: "Blood-Debt Directive DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.318, 0.34185, 0.3657, 0.3975, 0.42135, 0.4452, 0.477, 0.5088, 0.5406, 0.5724, 0.6042, 0.636, 0.67575, 0.7155, 0.75525]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "arlecchino-burst",
      name: "Balemoon Rising",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "arlecchino-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.704, 3.9818, 4.2596, 4.63, 4.9078, 5.1856, 5.556, 5.9264, 6.2968, 6.6672, 7.0376, 7.408, 7.871, 8.334, 8.797]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "arlecchino-a1", name: "Agony Alone May Be Repaid", unlockAscension: 1, effects: [] },
    { id: "arlecchino-a4", name: "Strength Alone Can Defend", unlockAscension: 4, effects: [] },
    { id: "arlecchino-p3", name: "The Balemoon Alone May Know", effects: [] },
  ],
  constellations: [
    { level: 1, id: "arlecchino-c1", name: "\"All Reprisals and Arrears, Mine to Bear...\"", effects: [] },
    { level: 2, id: "arlecchino-c2", name: "\"All Rewards and Retribution, Mine to Bestow...\"", effects: [] },
    { level: 3, id: "arlecchino-c3", name: "\"You Shall Become a New Member of Our Family...\"", effects: [], buffs: [{ id: "arlecchino-c3", source: "\"You Shall Become a New Member of Our Family...\"", sourceCharacterId: "arlecchino", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "arlecchino-c4", name: "\"You Shall Love and Protect Each Other Henceforth...\"", effects: [] },
    { level: 5, id: "arlecchino-c5", name: "\"For Alone, We Are as Good as Dead...\"", effects: [], buffs: [{ id: "arlecchino-c5", source: "\"For Alone, We Are as Good as Dead...\"", sourceCharacterId: "arlecchino", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "arlecchino-c6", name: "\"From This Day On, We Shall Delight in New Life Together.\"", effects: [] },
  ],
  resources: [],
};

export const bennett: GeneratedCharacter = {
  id: "bennett",
  name: "Bennett",
  element: "pyro",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1126, 3: 1211, 4: 1297, 5: 1382, 6: 1469, 7: 1554, 8: 1640, 9: 1727, 10: 1812, 11: 1898, 12: 1983, 13: 2070, 14: 2155, 15: 2241, 16: 2327, 17: 2413, 18: 2499, 19: 2584, 20: 2670, 21: 3532, 22: 3618, 23: 3705, 24: 3790, 25: 3876, 26: 3961, 27: 4048, 28: 4133, 29: 4219, 30: 4304, 31: 4391, 32: 4477, 33: 4562, 34: 4648, 35: 4734, 36: 4820, 37: 4905, 38: 4991, 39: 5078, 40: 5163, 41: 5801, 42: 5886, 43: 5972, 44: 6058, 45: 6144, 46: 6230, 47: 6315, 48: 6402, 49: 6487, 50: 6573, 51: 7394, 52: 7480, 53: 7567, 54: 7652, 55: 7738, 56: 7823, 57: 7910, 58: 7995, 59: 8081, 60: 8168, 61: 8804, 62: 8891, 63: 8976, 64: 9062, 65: 9147, 66: 9234, 67: 9320, 68: 9405, 69: 9492, 70: 9577, 71: 10215, 72: 10300, 73: 10386, 74: 10473, 75: 10558, 76: 10644, 77: 10729, 78: 10816, 79: 10901, 80: 10987, 81: 11625, 82: 11710, 83: 11797, 84: 11882, 85: 11968, 86: 12053, 87: 12140, 88: 12225, 89: 12311, 90: 12397 } },
    atk: { byLevel: { 1: 16, 2: 17, 3: 19, 4: 20, 5: 21, 6: 23, 7: 24, 8: 25, 9: 27, 10: 28, 11: 29, 12: 31, 13: 32, 14: 33, 15: 35, 16: 36, 17: 37, 18: 39, 19: 40, 20: 41, 21: 54, 22: 56, 23: 57, 24: 58, 25: 60, 26: 61, 27: 62, 28: 64, 29: 65, 30: 66, 31: 68, 32: 69, 33: 70, 34: 72, 35: 73, 36: 74, 37: 76, 38: 77, 39: 78, 40: 80, 41: 89, 42: 91, 43: 92, 44: 93, 45: 95, 46: 96, 47: 97, 48: 99, 49: 100, 50: 101, 51: 114, 52: 115, 53: 117, 54: 118, 55: 119, 56: 121, 57: 122, 58: 123, 59: 125, 60: 126, 61: 136, 62: 137, 63: 138, 64: 140, 65: 141, 66: 142, 67: 144, 68: 145, 69: 146, 70: 148, 71: 158, 72: 159, 73: 160, 74: 161, 75: 163, 76: 164, 77: 165, 78: 167, 79: 168, 80: 169, 81: 179, 82: 181, 83: 182, 84: 183, 85: 185, 86: 186, 87: 187, 88: 188, 89: 190, 90: 191 } },
    def: { byLevel: { 1: 65, 2: 70, 3: 75, 4: 81, 5: 86, 6: 91, 7: 97, 8: 102, 9: 107, 10: 113, 11: 118, 12: 123, 13: 129, 14: 134, 15: 139, 16: 145, 17: 150, 18: 155, 19: 161, 20: 166, 21: 220, 22: 225, 23: 230, 24: 236, 25: 241, 26: 246, 27: 252, 28: 257, 29: 262, 30: 268, 31: 273, 32: 279, 33: 284, 34: 289, 35: 294, 36: 300, 37: 305, 38: 311, 39: 316, 40: 321, 41: 361, 42: 366, 43: 372, 44: 377, 45: 382, 46: 388, 47: 393, 48: 398, 49: 404, 50: 409, 51: 460, 52: 465, 53: 471, 54: 476, 55: 481, 56: 487, 57: 492, 58: 497, 59: 503, 60: 508, 61: 548, 62: 553, 63: 558, 64: 564, 65: 569, 66: 574, 67: 580, 68: 585, 69: 590, 70: 596, 71: 635, 72: 641, 73: 646, 74: 652, 75: 657, 76: 662, 77: 667, 78: 673, 79: 678, 80: 684, 81: 723, 82: 729, 83: 734, 84: 739, 85: 745, 86: 750, 87: 755, 88: 761, 89: 766, 90: 771 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.267],
  },
  baseStats: {
    atk: 191,
    hp: 12397,
    def: 771,
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
        id: "bennett-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "bennett-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44548, 0.48174, 0.518, 0.5698, 0.60606, 0.6475, 0.70448, 0.76146, 0.81844, 0.8806, 0.94276, 1.00492, 1.06708, 1.12924, 1.1914]) },
            ],
          },
        ],
      },
      {
        id: "bennett-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "bennett-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.42742, 0.46221, 0.497, 0.5467, 0.58149, 0.62125, 0.67592, 0.73059, 0.78526, 0.8449, 0.90454, 0.96418, 1.02382, 1.08346, 1.1431]) },
            ],
          },
        ],
      },
      {
        id: "bennett-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "bennett-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5461, 0.59055, 0.635, 0.6985, 0.74295, 0.79375, 0.8636, 0.93345, 1.0033, 1.0795, 1.1557, 1.2319, 1.3081, 1.3843, 1.4605]) },
            ],
          },
        ],
      },
      {
        id: "bennett-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "bennett-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.59684, 0.64542, 0.694, 0.7634, 0.81198, 0.8675, 0.94384, 1.02018, 1.09652, 1.1798, 1.26308, 1.34636, 1.42964, 1.51292, 1.5962]) },
            ],
          },
        ],
      },
      {
        id: "bennett-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "bennett-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.71896, 0.77748, 0.836, 0.9196, 0.97812, 1.045, 1.13696, 1.22892, 1.32088, 1.4212, 1.52152, 1.62184, 1.72216, 1.82248, 1.9228]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "bennett-charged",
      name: "Strike of Fortune",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "bennett-charged-1",
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
      id: "bennett-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "bennett-plungeLow-1",
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
      id: "bennett-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "bennett-plungeHigh-1",
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
      id: "bennett-skill",
      name: "Passion Overload",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(5),
      energyCost: 0,
      particles: { count: 6, element: "pyro" },
      instances: [
        {
          id: "bennett-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.376, 1.4792, 1.5824, 1.72, 1.8232, 1.9264, 2.064, 2.2016, 2.3392, 2.4768, 2.6144, 2.752, 2.924, 3.096, 3.268]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "bennett-skill-2",
          name: "Charge Level 1 DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
            { stat: "atk", table: talentTable([0.92, 0.989, 1.058, 1.15, 1.219, 1.288, 1.38, 1.472, 1.564, 1.656, 1.748, 1.84, 1.955, 2.07, 2.185]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "bennett-skill-3",
          name: "Charge Level 2 DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.88, 0.946, 1.012, 1.1, 1.166, 1.232, 1.32, 1.408, 1.496, 1.584, 1.672, 1.76, 1.87, 1.98, 2.09]) },
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "bennett-skill-4",
          name: "Explosion DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.32, 1.419, 1.518, 1.65, 1.749, 1.848, 1.98, 2.112, 2.244, 2.376, 2.508, 2.64, 2.805, 2.97, 3.135]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "bennett-burst",
      name: "Fantastic Voyage",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "bennett-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([2.328, 2.5026, 2.6772, 2.91, 3.0846, 3.2592, 3.492, 3.7248, 3.9576, 4.1904, 4.4232, 4.656, 4.947, 5.238, 5.529]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "bennett-a1", name: "Rekindle", unlockAscension: 1, effects: [] },
    { id: "bennett-a4", name: "Fearnaught", unlockAscension: 4, effects: [] },
    { id: "bennett-p3", name: "It Should Be Safe...", effects: [] },
  ],
  constellations: [
    { level: 1, id: "bennett-c1", name: "Grand Expectation", effects: [] },
    { level: 2, id: "bennett-c2", name: "Impasse Conqueror", effects: [] },
    { level: 3, id: "bennett-c3", name: "Unstoppable Fervor", effects: [], buffs: [{ id: "bennett-c3", source: "Unstoppable Fervor", sourceCharacterId: "bennett", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "bennett-c4", name: "Unexpected Odyssey", effects: [] },
    { level: 5, id: "bennett-c5", name: "True Explorer", effects: [], buffs: [{ id: "bennett-c5", source: "True Explorer", sourceCharacterId: "bennett", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "bennett-c6", name: "Fire Ventures With Me", effects: [] },
  ],
  resources: [],
};

export const chevreuse: GeneratedCharacter = {
  id: "chevreuse",
  name: "Chevreuse",
  element: "pyro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1003, 2: 1086, 3: 1168, 4: 1252, 5: 1334, 6: 1417, 7: 1499, 8: 1583, 9: 1666, 10: 1748, 11: 1831, 12: 1914, 13: 1997, 14: 2079, 15: 2162, 16: 2246, 17: 2328, 18: 2411, 19: 2493, 20: 2577, 21: 3408, 22: 3491, 23: 3575, 24: 3657, 25: 3740, 26: 3822, 27: 3906, 28: 3988, 29: 4071, 30: 4153, 31: 4237, 32: 4320, 33: 4402, 34: 4485, 35: 4568, 36: 4651, 37: 4733, 38: 4816, 39: 4900, 40: 4982, 41: 5597, 42: 5680, 43: 5763, 44: 5845, 45: 5928, 46: 6012, 47: 6094, 48: 6177, 49: 6259, 50: 6343, 51: 7135, 52: 7218, 53: 7301, 54: 7383, 55: 7467, 56: 7549, 57: 7632, 58: 7714, 59: 7798, 60: 7881, 61: 8496, 62: 8579, 63: 8661, 64: 8744, 65: 8827, 66: 8910, 67: 8993, 68: 9075, 69: 9159, 70: 9241, 71: 9856, 72: 9939, 73: 10022, 74: 10105, 75: 10187, 76: 10271, 77: 10353, 78: 10436, 79: 10518, 80: 10602, 81: 11217, 82: 11299, 83: 11383, 84: 11465, 85: 11548, 86: 11630, 87: 11714, 88: 11796, 89: 11879, 90: 11962 } },
    atk: { byLevel: { 1: 16, 2: 18, 3: 19, 4: 20, 5: 22, 6: 23, 7: 24, 8: 26, 9: 27, 10: 28, 11: 30, 12: 31, 13: 32, 14: 34, 15: 35, 16: 36, 17: 38, 18: 39, 19: 40, 20: 42, 21: 55, 22: 56, 23: 58, 24: 59, 25: 60, 26: 62, 27: 63, 28: 64, 29: 66, 30: 67, 31: 68, 32: 70, 33: 71, 34: 72, 35: 74, 36: 75, 37: 76, 38: 78, 39: 79, 40: 80, 41: 90, 42: 92, 43: 93, 44: 94, 45: 96, 46: 97, 47: 98, 48: 100, 49: 101, 50: 102, 51: 115, 52: 117, 53: 118, 54: 119, 55: 121, 56: 122, 57: 123, 58: 125, 59: 126, 60: 127, 61: 137, 62: 139, 63: 140, 64: 141, 65: 143, 66: 144, 67: 145, 68: 147, 69: 148, 70: 149, 71: 159, 72: 161, 73: 162, 74: 163, 75: 165, 76: 166, 77: 167, 78: 169, 79: 170, 80: 171, 81: 181, 82: 183, 83: 184, 84: 185, 85: 187, 86: 188, 87: 189, 88: 191, 89: 192, 90: 193 } },
    def: { byLevel: { 1: 51, 2: 55, 3: 59, 4: 63, 5: 67, 6: 72, 7: 76, 8: 80, 9: 84, 10: 88, 11: 93, 12: 97, 13: 101, 14: 105, 15: 109, 16: 114, 17: 118, 18: 122, 19: 126, 20: 130, 21: 172, 22: 176, 23: 181, 24: 185, 25: 189, 26: 193, 27: 197, 28: 202, 29: 206, 30: 210, 31: 214, 32: 218, 33: 223, 34: 227, 35: 231, 36: 235, 37: 239, 38: 243, 39: 248, 40: 252, 41: 283, 42: 287, 43: 291, 44: 295, 45: 300, 46: 304, 47: 308, 48: 312, 49: 316, 50: 321, 51: 361, 52: 365, 53: 369, 54: 373, 55: 377, 56: 382, 57: 386, 58: 390, 59: 394, 60: 398, 61: 429, 62: 434, 63: 438, 64: 442, 65: 446, 66: 450, 67: 455, 68: 459, 69: 463, 70: 467, 71: 498, 72: 502, 73: 507, 74: 511, 75: 515, 76: 519, 77: 523, 78: 528, 79: 532, 80: 536, 81: 567, 82: 571, 83: 575, 84: 580, 85: 584, 86: 588, 87: 592, 88: 596, 89: 601, 90: 605 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 193,
    hp: 11962,
    def: 605,
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
        id: "chevreuse-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chevreuse-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.531299, 0.574545, 0.61779, 0.679569, 0.722814, 0.772237, 0.840194, 0.908151, 0.976108, 1.050243, 1.124378, 1.198513, 1.272647, 1.346782, 1.420917]) },
            ],
          },
        ],
      },
      {
        id: "chevreuse-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chevreuse-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.493107, 0.533243, 0.57338, 0.630718, 0.670855, 0.716725, 0.779797, 0.842869, 0.90594, 0.974746, 1.043552, 1.112357, 1.181163, 1.249968, 1.318774]) },
            ],
          },
        ],
      },
      {
        id: "chevreuse-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chevreuse-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.276449, 0.298951, 0.321453, 0.353598, 0.3761, 0.401816, 0.437176, 0.472535, 0.507895, 0.546469, 0.585044, 0.623618, 0.662192, 0.700767, 0.739341]) },
              { stat: "atk", table: talentTable([0.324527, 0.350942, 0.377357, 0.415093, 0.441508, 0.471697, 0.513206, 0.554715, 0.596225, 0.641508, 0.68679, 0.732073, 0.777356, 0.822639, 0.867922]) },
            ],
          },
        ],
      },
      {
        id: "chevreuse-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chevreuse-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.772615, 0.835503, 0.89839, 0.988229, 1.051116, 1.122988, 1.22181, 1.320633, 1.419456, 1.527263, 1.63507, 1.742877, 1.850683, 1.95849, 2.066297]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "chevreuse-charged",
      name: "Line Bayonet Thrust EX",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chevreuse-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.2169, 1.31595, 1.415, 1.5565, 1.65555, 1.76875, 1.9244, 2.08005, 2.2357, 2.4055, 2.5753, 2.7451, 2.9149, 3.0847, 3.2545]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "chevreuse-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chevreuse-plungeLow-1",
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
      id: "chevreuse-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chevreuse-plungeHigh-1",
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
      id: "chevreuse-skill",
      name: "Short-Range Rapid Interdiction Fire",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "pyro" },
      instances: [
        {
          id: "chevreuse-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.152, 1.2384, 1.3248, 1.44, 1.5264, 1.6128, 1.728, 1.8432, 1.9584, 2.0736, 2.1888, 2.304, 2.448, 2.592, 2.736]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "chevreuse-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.728, 1.8576, 1.9872, 2.16, 2.2896, 2.4192, 2.592, 2.7648, 2.9376, 3.1104, 3.2832, 3.456, 3.672, 3.888, 4.104]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "chevreuse-skill-3",
          name: "Overcharged Ball DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([2.824, 3.0358, 3.2476, 3.53, 3.7418, 3.9536, 4.236, 4.5184, 4.8008, 5.0832, 5.3656, 5.648, 6.001, 6.354, 6.707]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "chevreuse-skill-4",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.288, 0.3096, 0.3312, 0.36, 0.3816, 0.4032, 0.432, 0.4608, 0.4896, 0.5184, 0.5472, 0.576, 0.612, 0.648, 0.684]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "chevreuse-burst",
      name: "Ring of Bursting Grenades",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "chevreuse-burst-1",
          name: "Explosive Grenade DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.6816, 3.95772, 4.23384, 4.602, 4.87812, 5.15424, 5.5224, 5.89056, 6.25872, 6.62688, 6.99504, 7.3632, 7.8234, 8.2836, 8.7438]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "chevreuse-burst-2",
          name: "Secondary Explosive Shell DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.49088, 0.527696, 0.564512, 0.6136, 0.650416, 0.687232, 0.73632, 0.785408, 0.834496, 0.883584, 0.932672, 0.98176, 1.04312, 1.10448, 1.16584]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "chevreuse-a1", name: "Vanguard's Coordinated Tactics", unlockAscension: 1, effects: [] },
    { id: "chevreuse-a4", name: "Vertical Force Coordination", unlockAscension: 4, effects: [] },
    { id: "chevreuse-p3", name: "Double Time March", effects: [] },
  ],
  constellations: [
    { level: 1, id: "chevreuse-c1", name: "Stable Front Line's Resolve", effects: [] },
    { level: 2, id: "chevreuse-c2", name: "Sniper Induced Explosion", effects: [] },
    { level: 3, id: "chevreuse-c3", name: "Practiced Field Stripping Technique", effects: [], buffs: [{ id: "chevreuse-c3", source: "Practiced Field Stripping Technique", sourceCharacterId: "chevreuse", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "chevreuse-c4", name: "The Secret to Rapid-Fire Multishots", effects: [] },
    { level: 5, id: "chevreuse-c5", name: "Enhanced Incendiary Firepower", effects: [], buffs: [{ id: "chevreuse-c5", source: "Enhanced Incendiary Firepower", sourceCharacterId: "chevreuse", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "chevreuse-c6", name: "In Pursuit of Ending Evil", effects: [] },
  ],
  resources: [],
};

export const dehya: GeneratedCharacter = {
  id: "dehya",
  name: "Dehya",
  element: "pyro",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1220, 2: 1322, 3: 1423, 4: 1525, 5: 1627, 6: 1729, 7: 1830, 8: 1933, 9: 2035, 10: 2137, 11: 2239, 12: 2342, 13: 2444, 14: 2548, 15: 2650, 16: 2753, 17: 2857, 18: 2959, 19: 3063, 20: 3165, 21: 4315, 22: 4419, 23: 4523, 24: 4626, 25: 4730, 26: 4835, 27: 4939, 28: 5043, 29: 5148, 30: 5251, 31: 5356, 32: 5461, 33: 5566, 34: 5670, 35: 5775, 36: 5881, 37: 5986, 38: 6091, 39: 6196, 40: 6302, 41: 7150, 42: 7256, 43: 7363, 44: 7467, 45: 7574, 46: 7680, 47: 7786, 48: 7892, 49: 7999, 50: 8106, 51: 9203, 52: 9310, 53: 9417, 54: 9524, 55: 9631, 56: 9739, 57: 9846, 58: 9953, 59: 10061, 60: 10168, 61: 11019, 62: 11126, 63: 11235, 64: 11342, 65: 11451, 66: 11560, 67: 11667, 68: 11776, 69: 11884, 70: 11993, 71: 12845, 72: 12955, 73: 13063, 74: 13172, 75: 13282, 76: 13390, 77: 13500, 78: 13610, 79: 13720, 80: 13829, 81: 14683, 82: 14793, 83: 14902, 84: 15012, 85: 15122, 86: 15233, 87: 15343, 88: 15454, 89: 15565, 90: 15675 } },
    atk: { byLevel: { 1: 21, 2: 22, 3: 24, 4: 26, 5: 28, 6: 29, 7: 31, 8: 33, 9: 34, 10: 36, 11: 38, 12: 40, 13: 41, 14: 43, 15: 45, 16: 47, 17: 48, 18: 50, 19: 52, 20: 54, 21: 73, 22: 75, 23: 77, 24: 78, 25: 80, 26: 82, 27: 84, 28: 85, 29: 87, 30: 89, 31: 91, 32: 92, 33: 94, 34: 96, 35: 98, 36: 100, 37: 101, 38: 103, 39: 105, 40: 107, 41: 121, 42: 123, 43: 125, 44: 126, 45: 128, 46: 130, 47: 132, 48: 134, 49: 135, 50: 137, 51: 156, 52: 158, 53: 159, 54: 161, 55: 163, 56: 165, 57: 167, 58: 169, 59: 170, 60: 172, 61: 187, 62: 188, 63: 190, 64: 192, 65: 194, 66: 196, 67: 198, 68: 199, 69: 201, 70: 203, 71: 218, 72: 219, 73: 221, 74: 223, 75: 225, 76: 227, 77: 229, 78: 231, 79: 232, 80: 234, 81: 249, 82: 251, 83: 252, 84: 254, 85: 256, 86: 258, 87: 260, 88: 262, 89: 264, 90: 265 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 69, 7: 73, 8: 77, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 106, 16: 110, 17: 114, 18: 119, 19: 123, 20: 127, 21: 173, 22: 177, 23: 181, 24: 185, 25: 189, 26: 194, 27: 198, 28: 202, 29: 206, 30: 210, 31: 215, 32: 219, 33: 223, 34: 227, 35: 231, 36: 236, 37: 240, 38: 244, 39: 248, 40: 252, 41: 286, 42: 291, 43: 295, 44: 299, 45: 303, 46: 308, 47: 312, 48: 316, 49: 320, 50: 325, 51: 369, 52: 373, 53: 377, 54: 382, 55: 386, 56: 390, 57: 394, 58: 399, 59: 403, 60: 407, 61: 441, 62: 446, 63: 450, 64: 454, 65: 459, 66: 463, 67: 467, 68: 472, 69: 476, 70: 480, 71: 515, 72: 519, 73: 523, 74: 528, 75: 532, 76: 536, 77: 541, 78: 545, 79: 550, 80: 554, 81: 588, 82: 593, 83: 597, 84: 601, 85: 606, 86: 610, 87: 615, 88: 619, 89: 624, 90: 628 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 265,
    hp: 15675,
    def: 628,
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
        id: "dehya-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dehya-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.621178, 0.671739, 0.7223, 0.79453, 0.845091, 0.902875, 0.982328, 1.061781, 1.141234, 1.22791, 1.314586, 1.401262, 1.487938, 1.574614, 1.66129]) },
            ],
          },
        ],
      },
      {
        id: "dehya-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dehya-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.617102, 0.667331, 0.71756, 0.789316, 0.839545, 0.89695, 0.975882, 1.054813, 1.133745, 1.219852, 1.305959, 1.392066, 1.478174, 1.564281, 1.650388]) },
            ],
          },
        ],
      },
      {
        id: "dehya-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dehya-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.766312, 0.828686, 0.89106, 0.980166, 1.04254, 1.113825, 1.211842, 1.309858, 1.407875, 1.514802, 1.621729, 1.728656, 1.835584, 1.942511, 2.049438]) },
            ],
          },
        ],
      },
      {
        id: "dehya-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dehya-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.952914, 1.030477, 1.10804, 1.218844, 1.296407, 1.38505, 1.506934, 1.628819, 1.750703, 1.883668, 2.016633, 2.149598, 2.282562, 2.415527, 2.548492]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "dehya-charged",
      name: "Sandstorm Assault",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dehya-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.5633, 0.60915, 0.655, 0.7205, 0.76635, 0.81875, 0.8908, 0.96285, 1.0349, 1.1135, 1.1921, 1.2707, 1.3493, 1.4279, 1.5065]) },
          ],
        },
        {
          id: "dehya-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.01824, 1.10112, 1.184, 1.3024, 1.38528, 1.48, 1.61024, 1.74048, 1.87072, 2.0128, 2.15488, 2.29696, 2.43904, 2.58112, 2.7232]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "dehya-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dehya-plungeLow-1",
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
      id: "dehya-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dehya-plungeHigh-1",
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
      id: "dehya-skill",
      name: "Molten Inferno",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      particles: { count: 1, element: "pyro" },
      instances: [
        {
          id: "dehya-skill-1",
          name: "Indomitable Flame DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.1288, 1.21346, 1.29812, 1.411, 1.49566, 1.58032, 1.6932, 1.80608, 1.91896, 2.03184, 2.14472, 2.2576, 2.3987, 2.5398, 2.6809]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "dehya-skill-2",
          name: "Ranging Flame DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.328, 1.4276, 1.5272, 1.66, 1.7596, 1.8592, 1.992, 2.1248, 2.2576, 2.3904, 2.5232, 2.656, 2.822, 2.988, 3.154]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "dehya-skill-3",
          name: "Field DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.602, 0.64715, 0.6923, 0.7525, 0.79765, 0.8428, 0.903, 0.9632, 1.0234, 1.0836, 1.1438, 1.204, 1.27925, 1.3545, 1.42975]) },
            { stat: "hp", table: talentTable([0.01032, 0.011094, 0.011868, 0.0129, 0.013674, 0.014448, 0.01548, 0.016512, 0.017544, 0.018576, 0.019608, 0.02064, 0.02193, 0.02322, 0.02451]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "dehya-burst",
      name: "Leonine Bite",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "dehya-burst-1",
          name: "Flame-Mane's Fist DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.987, 1.061025, 1.13505, 1.23375, 1.307775, 1.3818, 1.4805, 1.5792, 1.6779, 1.7766, 1.8753, 1.974, 2.097375, 2.22075, 2.344125]) },
            { stat: "hp", table: talentTable([0.01692, 0.018189, 0.019458, 0.02115, 0.022419, 0.023688, 0.02538, 0.027072, 0.028764, 0.030456, 0.032148, 0.03384, 0.035955, 0.03807, 0.040185]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "dehya-burst-2",
          name: "Incineration Drive DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.393, 1.497475, 1.60195, 1.74125, 1.845725, 1.9502, 2.0895, 2.2288, 2.3681, 2.5074, 2.6467, 2.786, 2.960125, 3.13425, 3.308375]) },
            { stat: "hp", table: talentTable([0.02388, 0.025671, 0.027462, 0.02985, 0.031641, 0.033432, 0.03582, 0.038208, 0.040596, 0.042984, 0.045372, 0.04776, 0.050745, 0.05373, 0.056715]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "dehya-a1", name: "Unstinting Succor", unlockAscension: 1, effects: [] },
    { id: "dehya-a4", name: "Stalwart and True", unlockAscension: 4, effects: [] },
    { id: "dehya-p3", name: "The Sunlit Way", effects: [] },
  ],
  constellations: [
    { level: 1, id: "dehya-c1", name: "The Flame Incandescent", effects: [] },
    { level: 2, id: "dehya-c2", name: "The Sand-Blades Glittering", effects: [] },
    { level: 3, id: "dehya-c3", name: "A Rage Swift as Fire", effects: [], buffs: [{ id: "dehya-c3", source: "A Rage Swift as Fire", sourceCharacterId: "dehya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "dehya-c4", name: "An Oath Abiding", effects: [] },
    { level: 5, id: "dehya-c5", name: "The Alpha Unleashed", effects: [], buffs: [{ id: "dehya-c5", source: "The Alpha Unleashed", sourceCharacterId: "dehya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "dehya-c6", name: "The Burning Claws Cleaving", effects: [] },
  ],
  resources: [],
};

export const diluc: GeneratedCharacter = {
  id: "diluc",
  name: "Diluc",
  element: "pyro",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1011, 2: 1094, 3: 1178, 4: 1263, 5: 1347, 6: 1432, 7: 1516, 8: 1601, 9: 1686, 10: 1769, 11: 1854, 12: 1939, 13: 2024, 14: 2110, 15: 2195, 16: 2280, 17: 2366, 18: 2451, 19: 2536, 20: 2621, 21: 3574, 22: 3660, 23: 3745, 24: 3831, 25: 3917, 26: 4004, 27: 4090, 28: 4176, 29: 4263, 30: 4349, 31: 4436, 32: 4522, 33: 4609, 34: 4695, 35: 4782, 36: 4870, 37: 4957, 38: 5044, 39: 5131, 40: 5219, 41: 5921, 42: 6009, 43: 6097, 44: 6184, 45: 6272, 46: 6360, 47: 6448, 48: 6536, 49: 6625, 50: 6712, 51: 7621, 52: 7710, 53: 7798, 54: 7887, 55: 7976, 56: 8065, 57: 8154, 58: 8243, 59: 8332, 60: 8421, 61: 9125, 62: 9214, 63: 9304, 64: 9393, 65: 9483, 66: 9573, 67: 9662, 68: 9752, 69: 9842, 70: 9932, 71: 10637, 72: 10728, 73: 10818, 74: 10908, 75: 10999, 76: 11089, 77: 11180, 78: 11271, 79: 11362, 80: 11453, 81: 12159, 82: 12250, 83: 12341, 84: 12432, 85: 12523, 86: 12615, 87: 12706, 88: 12798, 89: 12890, 90: 12981 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 33, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 46, 11: 48, 12: 50, 13: 52, 14: 54, 15: 57, 16: 59, 17: 61, 18: 63, 19: 65, 20: 68, 21: 92, 22: 94, 23: 97, 24: 99, 25: 101, 26: 103, 27: 106, 28: 108, 29: 110, 30: 112, 31: 114, 32: 117, 33: 119, 34: 121, 35: 123, 36: 126, 37: 128, 38: 130, 39: 132, 40: 135, 41: 153, 42: 155, 43: 157, 44: 160, 45: 162, 46: 164, 47: 166, 48: 169, 49: 171, 50: 173, 51: 197, 52: 199, 53: 201, 54: 203, 55: 206, 56: 208, 57: 210, 58: 213, 59: 215, 60: 217, 61: 235, 62: 238, 63: 240, 64: 242, 65: 245, 66: 247, 67: 249, 68: 252, 69: 254, 70: 256, 71: 274, 72: 277, 73: 279, 74: 281, 75: 284, 76: 286, 77: 288, 78: 291, 79: 293, 80: 295, 81: 314, 82: 316, 83: 318, 84: 321, 85: 323, 86: 325, 87: 328, 88: 330, 89: 333, 90: 335 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 133, 16: 138, 17: 143, 18: 148, 19: 153, 20: 158, 21: 216, 22: 221, 23: 226, 24: 231, 25: 237, 26: 242, 27: 247, 28: 252, 29: 257, 30: 263, 31: 268, 32: 273, 33: 278, 34: 284, 35: 289, 36: 294, 37: 299, 38: 305, 39: 310, 40: 315, 41: 358, 42: 363, 43: 368, 44: 373, 45: 379, 46: 384, 47: 389, 48: 395, 49: 400, 50: 405, 51: 460, 52: 466, 53: 471, 54: 476, 55: 482, 56: 487, 57: 492, 58: 498, 59: 503, 60: 509, 61: 551, 62: 556, 63: 562, 64: 567, 65: 573, 66: 578, 67: 583, 68: 589, 69: 594, 70: 600, 71: 642, 72: 648, 73: 653, 74: 659, 75: 664, 76: 670, 77: 675, 78: 681, 79: 686, 80: 692, 81: 734, 82: 740, 83: 745, 84: 751, 85: 756, 86: 762, 87: 767, 88: 773, 89: 778, 90: 784 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 335,
    hp: 12981,
    def: 784,
    elementalMastery: 0,
    critRate: 0.242,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "diluc-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diluc-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.89698, 0.96999, 1.043, 1.1473, 1.22031, 1.30375, 1.41848, 1.53321, 1.64794, 1.7731, 1.916513, 2.085166, 2.253819, 2.422472, 2.606457]) },
            ],
          },
        ],
      },
      {
        id: "diluc-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diluc-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.87634, 0.94767, 1.019, 1.1209, 1.19223, 1.27375, 1.38584, 1.49793, 1.61002, 1.7323, 1.872412, 2.037185, 2.201957, 2.366729, 2.546481]) },
            ],
          },
        ],
      },
      {
        id: "diluc-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diluc-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.98814, 1.06857, 1.149, 1.2639, 1.34433, 1.43625, 1.56264, 1.68903, 1.81542, 1.9533, 2.111287, 2.297081, 2.482874, 2.668667, 2.871351]) },
            ],
          },
        ],
      },
      {
        id: "diluc-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diluc-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.33988, 1.44894, 1.558, 1.7138, 1.82286, 1.9475, 2.11888, 2.29026, 2.46164, 2.6486, 2.862825, 3.114754, 3.366682, 3.618611, 3.893442]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "diluc-charged",
      name: "Tempered Sword",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diluc-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.688, 0.744, 0.8, 0.88, 0.936, 1, 1.088, 1.176, 1.264, 1.36, 1.47, 1.59936, 1.72872, 1.85808, 1.9992]) },
          ],
        },
        {
          id: "diluc-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.247, 1.3485, 1.45, 1.595, 1.6965, 1.8125, 1.972, 2.1315, 2.291, 2.465, 2.664375, 2.89884, 3.133305, 3.36777, 3.62355]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "diluc-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diluc-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.789728, 1.935403, 2.081079, 2.289187, 2.434862, 2.601349, 2.830267, 3.059186, 3.288105, 3.537834, 3.787564, 4.037293, 4.287023, 4.536752, 4.786482]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "diluc-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diluc-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([2.235467, 2.417423, 2.59938, 2.859318, 3.041275, 3.249225, 3.535157, 3.821089, 4.10702, 4.418946, 4.730872, 5.042797, 5.354723, 5.666648, 5.978574]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "diluc-skill",
      name: "Searing Onslaught",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 2, element: "pyro" },
      instances: [
        {
          id: "diluc-skill-1",
          name: "1-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.944, 1.0148, 1.0856, 1.18, 1.2508, 1.3216, 1.416, 1.5104, 1.6048, 1.6992, 1.7936, 1.888, 2.006, 2.124, 2.242]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "diluc-skill-2",
          name: "2-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.976, 1.0492, 1.1224, 1.22, 1.2932, 1.3664, 1.464, 1.5616, 1.6592, 1.7568, 1.8544, 1.952, 2.074, 2.196, 2.318]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "diluc-skill-3",
          name: "3-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.288, 1.3846, 1.4812, 1.61, 1.7066, 1.8032, 1.932, 2.0608, 2.1896, 2.3184, 2.4472, 2.576, 2.737, 2.898, 3.059]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "diluc-burst",
      name: "Dawn",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "diluc-burst-1",
          name: "Slashing DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([2.04, 2.193, 2.346, 2.55, 2.703, 2.856, 3.06, 3.264, 3.468, 3.672, 3.876, 4.08, 4.335, 4.59, 4.845]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "diluc-burst-2",
          name: "DoT",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "diluc-burst-3",
          name: "Explosion DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([2.04, 2.193, 2.346, 2.55, 2.703, 2.856, 3.06, 3.264, 3.468, 3.672, 3.876, 4.08, 4.335, 4.59, 4.845]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "diluc-a1", name: "Relentless", unlockAscension: 1, effects: [] },
    { id: "diluc-a4", name: "Blessing of Phoenix", unlockAscension: 4, effects: [] },
    { id: "diluc-p3", name: "Tradition of the Dawn Knight", effects: [] },
  ],
  constellations: [
    { level: 1, id: "diluc-c1", name: "Conviction", effects: [] },
    { level: 2, id: "diluc-c2", name: "Searing Ember", effects: [] },
    { level: 3, id: "diluc-c3", name: "Fire and Steel", effects: [], buffs: [{ id: "diluc-c3", source: "Fire and Steel", sourceCharacterId: "diluc", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "diluc-c4", name: "Flowing Flame", effects: [] },
    { level: 5, id: "diluc-c5", name: "Phoenix, Harbinger of Dawn", effects: [], buffs: [{ id: "diluc-c5", source: "Phoenix, Harbinger of Dawn", sourceCharacterId: "diluc", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "diluc-c6", name: "Flaming Sword, Nemesis of the Dark", effects: [] },
  ],
  resources: [],
};

export const durin: GeneratedCharacter = {
  id: "durin",
  name: "Durin",
  element: "pyro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 968, 2: 1048, 3: 1128, 4: 1210, 5: 1290, 6: 1371, 7: 1451, 8: 1533, 9: 1614, 10: 1694, 11: 1776, 12: 1857, 13: 1938, 14: 2020, 15: 2102, 16: 2183, 17: 2265, 18: 2346, 19: 2429, 20: 2510, 21: 3422, 22: 3504, 23: 3586, 24: 3669, 25: 3751, 26: 3834, 27: 3916, 28: 3999, 29: 4082, 30: 4164, 31: 4247, 32: 4330, 33: 4414, 34: 4496, 35: 4579, 36: 4663, 37: 4747, 38: 4830, 39: 4913, 40: 4997, 41: 5670, 42: 5754, 43: 5838, 44: 5921, 45: 6006, 46: 6090, 47: 6174, 48: 6258, 49: 6343, 50: 6428, 51: 7298, 52: 7383, 53: 7467, 54: 7552, 55: 7637, 56: 7722, 57: 7808, 58: 7893, 59: 7978, 60: 8063, 61: 8738, 62: 8823, 63: 8909, 64: 8994, 65: 9080, 66: 9166, 67: 9252, 68: 9338, 69: 9424, 70: 9510, 71: 10185, 72: 10273, 73: 10359, 74: 10445, 75: 10532, 76: 10618, 77: 10705, 78: 10792, 79: 10879, 80: 10966, 81: 11643, 82: 11730, 83: 11817, 84: 11904, 85: 11991, 86: 12079, 87: 12166, 88: 12254, 89: 12343, 90: 12430 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 34, 5: 36, 6: 38, 7: 40, 8: 43, 9: 45, 10: 47, 11: 50, 12: 52, 13: 54, 14: 56, 15: 59, 16: 61, 17: 63, 18: 65, 19: 68, 20: 70, 21: 95, 22: 98, 23: 100, 24: 102, 25: 105, 26: 107, 27: 109, 28: 112, 29: 114, 30: 116, 31: 119, 32: 121, 33: 123, 34: 125, 35: 128, 36: 130, 37: 132, 38: 135, 39: 137, 40: 139, 41: 158, 42: 161, 43: 163, 44: 165, 45: 168, 46: 170, 47: 172, 48: 175, 49: 177, 50: 179, 51: 204, 52: 206, 53: 208, 54: 211, 55: 213, 56: 215, 57: 218, 58: 220, 59: 223, 60: 225, 61: 244, 62: 246, 63: 249, 64: 251, 65: 253, 66: 256, 67: 258, 68: 261, 69: 263, 70: 265, 71: 284, 72: 287, 73: 289, 74: 291, 75: 294, 76: 296, 77: 299, 78: 301, 79: 304, 80: 306, 81: 325, 82: 327, 83: 330, 84: 332, 85: 335, 86: 337, 87: 339, 88: 342, 89: 344, 90: 347 } },
    def: { byLevel: { 1: 64, 2: 69, 3: 75, 4: 80, 5: 85, 6: 91, 7: 96, 8: 101, 9: 107, 10: 112, 11: 117, 12: 123, 13: 128, 14: 134, 15: 139, 16: 144, 17: 150, 18: 155, 19: 161, 20: 166, 21: 226, 22: 232, 23: 237, 24: 243, 25: 248, 26: 254, 27: 259, 28: 265, 29: 270, 30: 275, 31: 281, 32: 287, 33: 292, 34: 297, 35: 303, 36: 309, 37: 314, 38: 320, 39: 325, 40: 331, 41: 375, 42: 381, 43: 386, 44: 392, 45: 397, 46: 403, 47: 408, 48: 414, 49: 420, 50: 425, 51: 483, 52: 488, 53: 494, 54: 500, 55: 505, 56: 511, 57: 517, 58: 522, 59: 528, 60: 533, 61: 578, 62: 584, 63: 589, 64: 595, 65: 601, 66: 606, 67: 612, 68: 618, 69: 623, 70: 629, 71: 674, 72: 680, 73: 685, 74: 691, 75: 697, 76: 702, 77: 708, 78: 714, 79: 720, 80: 726, 81: 770, 82: 776, 83: 782, 84: 788, 85: 793, 86: 799, 87: 805, 88: 811, 89: 817, 90: 822 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 347,
    hp: 12430,
    def: 822,
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
        id: "durin-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "durin-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.456505, 0.493663, 0.53082, 0.583902, 0.621059, 0.663525, 0.721915, 0.780305, 0.838696, 0.902394, 0.966092, 1.029791, 1.093489, 1.157188, 1.220886]) },
            ],
          },
        ],
      },
      {
        id: "durin-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "durin-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.410048, 0.443424, 0.4768, 0.52448, 0.557856, 0.596, 0.648448, 0.700896, 0.753344, 0.81056, 0.867776, 0.924992, 0.982208, 1.039424, 1.09664]) },
            ],
          },
        ],
      },
      {
        id: "durin-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "durin-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.291617, 0.315354, 0.33909, 0.372999, 0.396735, 0.423863, 0.461162, 0.498462, 0.535762, 0.576453, 0.617144, 0.657835, 0.698525, 0.739216, 0.779907]) },
              { stat: "atk", table: talentTable([0.291617, 0.315354, 0.33909, 0.372999, 0.396735, 0.423863, 0.461162, 0.498462, 0.535762, 0.576453, 0.617144, 0.657835, 0.698525, 0.739216, 0.779907]) },
            ],
          },
        ],
      },
      {
        id: "durin-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "durin-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.711521, 0.769436, 0.82735, 0.910085, 0.968, 1.034188, 1.125196, 1.216205, 1.307213, 1.406495, 1.505777, 1.605059, 1.704341, 1.803623, 1.902905]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "durin-charged",
      name: "Radiant Wingslash",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "durin-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.13434, 1.22667, 1.319, 1.4509, 1.54323, 1.64875, 1.79384, 1.93893, 2.08402, 2.2423, 2.40058, 2.55886, 2.71714, 2.87542, 3.0337]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "durin-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "durin-plungeLow-1",
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
      id: "durin-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "durin-plungeHigh-1",
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
      id: "durin-skill",
      name: "Binary Form: Convergence and Division",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 4, element: "pyro" },
      instances: [
        {
          id: "durin-skill-1",
          name: "Transmutation: Confirmation of Purity DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.056, 1.1352, 1.2144, 1.32, 1.3992, 1.4784, 1.584, 1.6896, 1.7952, 1.9008, 2.0064, 2.112, 2.244, 2.376, 2.508]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "durin-skill-2",
          name: "Transmutation: Denial of Darkness DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.7224, 0.77658, 0.83076, 0.903, 0.95718, 1.01136, 1.0836, 1.15584, 1.22808, 1.30032, 1.37256, 1.4448, 1.5351, 1.6254, 1.7157]) },
            { stat: "atk", table: talentTable([0.532, 0.5719, 0.6118, 0.665, 0.7049, 0.7448, 0.798, 0.8512, 0.9044, 0.9576, 1.0108, 1.064, 1.1305, 1.197, 1.2635]) },
            { stat: "atk", table: talentTable([0.6464, 0.69488, 0.74336, 0.808, 0.85648, 0.90496, 0.9696, 1.03424, 1.09888, 1.16352, 1.22816, 1.2928, 1.3736, 1.4544, 1.5352]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "durin-burst",
      name: "Principle of Purity: As the Light Shifts",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "durin-burst-1",
          name: "Principle of Purity: As the Light Shifts DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.1896, 1.27882, 1.36804, 1.487, 1.57622, 1.66544, 1.7844, 1.90336, 2.02232, 2.14128, 2.26024, 2.3792, 2.5279, 2.6766, 2.8253]) },
            { stat: "atk", table: talentTable([0.964, 1.0363, 1.1086, 1.205, 1.2773, 1.3496, 1.446, 1.5424, 1.6388, 1.7352, 1.8316, 1.928, 2.0485, 2.169, 2.2895]) },
            { stat: "atk", table: talentTable([1.1184, 1.20228, 1.28616, 1.398, 1.48188, 1.56576, 1.6776, 1.78944, 1.90128, 2.01312, 2.12496, 2.2368, 2.3766, 2.5164, 2.6562]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "durin-burst-2",
          name: "Principle of Darkness: As the Stars Smolder DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.2544, 1.34848, 1.44256, 1.568, 1.66208, 1.75616, 1.8816, 2.00704, 2.13248, 2.25792, 2.38336, 2.5088, 2.6656, 2.8224, 2.9792]) },
            { stat: "atk", table: talentTable([1.0176, 1.09392, 1.17024, 1.272, 1.34832, 1.42464, 1.5264, 1.62816, 1.72992, 1.83168, 1.93344, 2.0352, 2.1624, 2.2896, 2.4168]) },
            { stat: "atk", table: talentTable([1.1184, 1.20228, 1.28616, 1.398, 1.48188, 1.56576, 1.6776, 1.78944, 1.90128, 2.01312, 2.12496, 2.2368, 2.3766, 2.5164, 2.6562]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "durin-burst-3",
          name: "Dragon of White Flame DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.9464, 1.01738, 1.08836, 1.183, 1.25398, 1.32496, 1.4196, 1.51424, 1.60888, 1.70352, 1.79816, 1.8928, 2.0111, 2.1294, 2.2477]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "durin-burst-4",
          name: "Dragon of Dark Decay DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.2984, 1.39578, 1.49316, 1.623, 1.72038, 1.81776, 1.9476, 2.07744, 2.20728, 2.33712, 2.46696, 2.5968, 2.7591, 2.9214, 3.0837]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "durin-a1", name: "Light Manifest of the Divine Calculus", unlockAscension: 1, effects: [] },
    { id: "durin-a4", name: "Chaos Formed Like the Night", unlockAscension: 4, effects: [] },
    { id: "durin-p3", name: "Echoes of the Surging Earth", effects: [] },
    { id: "durin-p4", name: "Witch's Eve Rite: Ode to Ascension", effects: [] },
  ],
  constellations: [
    { level: 1, id: "durin-c1", name: "Adamah's Redemption", effects: [] },
    { level: 2, id: "durin-c2", name: "Unground Visions", effects: [] },
    { level: 3, id: "durin-c3", name: "Flame Mirror's Revelation", effects: [], buffs: [{ id: "durin-c3", source: "Flame Mirror's Revelation", sourceCharacterId: "durin", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "durin-c4", name: "Emanare's Source", effects: [] },
    { level: 5, id: "durin-c5", name: "Scouring Flame's Sundering", effects: [], buffs: [{ id: "durin-c5", source: "Scouring Flame's Sundering", sourceCharacterId: "durin", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "durin-c6", name: "Dual Birth", effects: [] },
  ],
  resources: [],
};

export const gaming: GeneratedCharacter = {
  id: "gaming",
  name: "Gaming",
  element: "pyro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 957, 2: 1037, 3: 1115, 4: 1195, 5: 1273, 6: 1353, 7: 1431, 8: 1511, 9: 1590, 10: 1669, 11: 1748, 12: 1827, 13: 1906, 14: 1985, 15: 2064, 16: 2144, 17: 2222, 18: 2302, 19: 2380, 20: 2460, 21: 3253, 22: 3333, 23: 3412, 24: 3491, 25: 3570, 26: 3649, 27: 3728, 28: 3807, 29: 3886, 30: 3965, 31: 4044, 32: 4123, 33: 4202, 34: 4281, 35: 4360, 36: 4439, 37: 4518, 38: 4597, 39: 4677, 40: 4755, 41: 5343, 42: 5422, 43: 5501, 44: 5579, 45: 5659, 46: 5738, 47: 5817, 48: 5896, 49: 5975, 50: 6054, 51: 6810, 52: 6890, 53: 6969, 54: 7048, 55: 7127, 56: 7206, 57: 7285, 58: 7364, 59: 7443, 60: 7523, 61: 8109, 62: 8189, 63: 8267, 64: 8347, 65: 8425, 66: 8505, 67: 8584, 68: 8663, 69: 8742, 70: 8821, 71: 9408, 72: 9487, 73: 9566, 74: 9646, 75: 9724, 76: 9804, 77: 9882, 78: 9962, 79: 10040, 80: 10120, 81: 10707, 82: 10786, 83: 10865, 84: 10944, 85: 11023, 86: 11102, 87: 11181, 88: 11260, 89: 11339, 90: 11419 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 32, 5: 34, 6: 36, 7: 38, 8: 40, 9: 42, 10: 44, 11: 46, 12: 48, 13: 50, 14: 52, 15: 55, 16: 57, 17: 59, 18: 61, 19: 63, 20: 65, 21: 86, 22: 88, 23: 90, 24: 92, 25: 94, 26: 96, 27: 98, 28: 101, 29: 103, 30: 105, 31: 107, 32: 109, 33: 111, 34: 113, 35: 115, 36: 117, 37: 119, 38: 121, 39: 124, 40: 126, 41: 141, 42: 143, 43: 145, 44: 147, 45: 149, 46: 152, 47: 154, 48: 156, 49: 158, 50: 160, 51: 180, 52: 182, 53: 184, 54: 186, 55: 188, 56: 190, 57: 192, 58: 195, 59: 197, 60: 199, 61: 214, 62: 216, 63: 218, 64: 220, 65: 223, 66: 225, 67: 227, 68: 229, 69: 231, 70: 233, 71: 249, 72: 251, 73: 253, 74: 255, 75: 257, 76: 259, 77: 261, 78: 263, 79: 265, 80: 267, 81: 283, 82: 285, 83: 287, 84: 289, 85: 291, 86: 293, 87: 295, 88: 297, 89: 300, 90: 302 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 78, 6: 83, 7: 88, 8: 93, 9: 98, 10: 103, 11: 108, 12: 112, 13: 117, 14: 122, 15: 127, 16: 132, 17: 137, 18: 142, 19: 147, 20: 151, 21: 200, 22: 205, 23: 210, 24: 215, 25: 220, 26: 225, 27: 230, 28: 234, 29: 239, 30: 244, 31: 249, 32: 254, 33: 259, 34: 264, 35: 268, 36: 273, 37: 278, 38: 283, 39: 288, 40: 293, 41: 329, 42: 334, 43: 339, 44: 344, 45: 348, 46: 353, 47: 358, 48: 363, 49: 368, 50: 373, 51: 419, 52: 424, 53: 429, 54: 434, 55: 439, 56: 444, 57: 449, 58: 453, 59: 458, 60: 463, 61: 499, 62: 504, 63: 509, 64: 514, 65: 519, 66: 524, 67: 528, 68: 533, 69: 538, 70: 543, 71: 579, 72: 584, 73: 589, 74: 594, 75: 599, 76: 604, 77: 608, 78: 613, 79: 618, 80: 623, 81: 659, 82: 664, 83: 669, 84: 674, 85: 679, 86: 683, 87: 688, 88: 693, 89: 698, 90: 703 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 302,
    hp: 11419,
    def: 703,
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
        id: "gaming-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gaming-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.83856, 0.906815, 0.97507, 1.072577, 1.140832, 1.218838, 1.326095, 1.433353, 1.540611, 1.657619, 1.774627, 1.891636, 2.008644, 2.125653, 2.242661]) },
            ],
          },
        ],
      },
      {
        id: "gaming-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gaming-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.790443, 0.854782, 0.91912, 1.011032, 1.07537, 1.1489, 1.250003, 1.351106, 1.45221, 1.562504, 1.672798, 1.783093, 1.893387, 2.003682, 2.113976]) },
            ],
          },
        ],
      },
      {
        id: "gaming-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gaming-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.06646, 1.153265, 1.24007, 1.364077, 1.450882, 1.550088, 1.686495, 1.822903, 1.959311, 2.108119, 2.256927, 2.405736, 2.554544, 2.703353, 2.852161]) },
            ],
          },
        ],
      },
      {
        id: "gaming-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "gaming-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.279491, 1.383635, 1.48778, 1.636558, 1.740703, 1.859725, 2.023381, 2.187037, 2.350692, 2.529226, 2.70776, 2.886293, 3.064827, 3.24336, 3.421894]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "gaming-charged",
      name: "Stellar Rend",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gaming-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.62522, 0.67611, 0.727, 0.7997, 0.85059, 0.90875, 0.98872, 1.06869, 1.14866, 1.2359, 1.32314, 1.41038, 1.49762, 1.58486, 1.6721]) },
          ],
        },
        {
          id: "gaming-charged-2",
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
      id: "gaming-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gaming-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.282638, 1.387039, 1.49144, 1.640584, 1.744985, 1.8643, 2.028358, 2.192417, 2.356475, 2.535448, 2.714421, 2.893394, 3.072366, 3.251339, 3.430312]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "gaming-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "gaming-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.602085, 1.732488, 1.86289, 2.049179, 2.179581, 2.328612, 2.53353, 2.738448, 2.943366, 3.166913, 3.39046, 3.614007, 3.837553, 4.0611, 4.284647]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "gaming-skill",
      name: "Bestial Ascent",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 2, element: "pyro" },
      instances: [
        {
          id: "gaming-skill-1",
          name: "Plunging Attack: Charmed Cloudstrider DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([2.304, 2.4768, 2.6496, 2.88, 3.0528, 3.2256, 3.456, 3.6864, 3.9168, 4.1472, 4.3776, 4.608, 4.896, 5.184, 5.472]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "gaming-burst",
      name: "Suanni's Gilded Dance",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "gaming-burst-1",
          name: "Suanni Man Chai Smash DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.704, 3.9818, 4.2596, 4.63, 4.9078, 5.1856, 5.556, 5.9264, 6.2968, 6.6672, 7.0376, 7.408, 7.871, 8.334, 8.797]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "gaming-a1", name: "Dance of Amity", unlockAscension: 1, effects: [] },
    { id: "gaming-a4", name: "Air of Prosperity", unlockAscension: 4, effects: [] },
    { id: "gaming-p3", name: "The Striding Beast", effects: [] },
  ],
  constellations: [
    { level: 1, id: "gaming-c1", name: "Bringer of Blessing", effects: [] },
    { level: 2, id: "gaming-c2", name: "Plum Blossoms Underfoot", effects: [] },
    { level: 3, id: "gaming-c3", name: "Awakening Spirit", effects: [], buffs: [{ id: "gaming-c3", source: "Awakening Spirit", sourceCharacterId: "gaming", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "gaming-c4", name: "Soar Across Mountains", effects: [] },
    { level: 5, id: "gaming-c5", name: "Evil-Daunting Roar", effects: [], buffs: [{ id: "gaming-c5", source: "Evil-Daunting Roar", sourceCharacterId: "gaming", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "gaming-c6", name: "To Tame All Beasts", effects: [], buffs: [{ id: "gaming-c6", source: "To Tame All Beasts", sourceCharacterId: "gaming", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, conditions: { damageTypes: ["plunge"] }, modifiers: [{ stat: "critRate", value: 0.2 }, { stat: "critDmg", value: 0.4 }] }] },
  ],
  resources: [],
};

export const huTao: GeneratedCharacter = {
  id: "hu-tao",
  name: "Hu Tao",
  element: "pyro",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1211, 2: 1311, 3: 1412, 4: 1513, 5: 1614, 6: 1716, 7: 1816, 8: 1918, 9: 2019, 10: 2120, 11: 2222, 12: 2323, 13: 2425, 14: 2528, 15: 2630, 16: 2731, 17: 2834, 18: 2936, 19: 3039, 20: 3141, 21: 4282, 22: 4384, 23: 4487, 24: 4590, 25: 4693, 26: 4797, 27: 4900, 28: 5003, 29: 5107, 30: 5210, 31: 5314, 32: 5418, 33: 5523, 34: 5625, 35: 5730, 36: 5835, 37: 5939, 38: 6043, 39: 6147, 40: 6253, 41: 7094, 42: 7200, 43: 7305, 44: 7409, 45: 7514, 46: 7620, 47: 7725, 48: 7830, 49: 7937, 50: 8042, 51: 9131, 52: 9238, 53: 9343, 54: 9450, 55: 9556, 56: 9663, 57: 9769, 58: 9876, 59: 9982, 60: 10089, 61: 10933, 62: 11039, 63: 11147, 64: 11254, 65: 11362, 66: 11469, 67: 11576, 68: 11684, 69: 11791, 70: 11899, 71: 12744, 72: 12853, 73: 12961, 74: 13069, 75: 13178, 76: 13286, 77: 13395, 78: 13504, 79: 13612, 80: 13721, 81: 14568, 82: 14677, 83: 14786, 84: 14895, 85: 15004, 86: 15114, 87: 15223, 88: 15333, 89: 15443, 90: 15552 } },
    atk: { byLevel: { 1: 8, 2: 9, 3: 10, 4: 10, 5: 11, 6: 12, 7: 12, 8: 13, 9: 14, 10: 15, 11: 15, 12: 16, 13: 17, 14: 17, 15: 18, 16: 19, 17: 19, 18: 20, 19: 21, 20: 21, 21: 29, 22: 30, 23: 31, 24: 31, 25: 32, 26: 33, 27: 34, 28: 34, 29: 35, 30: 36, 31: 36, 32: 37, 33: 38, 34: 38, 35: 39, 36: 40, 37: 41, 38: 41, 39: 42, 40: 43, 41: 49, 42: 49, 43: 50, 44: 51, 45: 51, 46: 52, 47: 53, 48: 54, 49: 54, 50: 55, 51: 62, 52: 63, 53: 64, 54: 65, 55: 65, 56: 66, 57: 67, 58: 68, 59: 68, 60: 69, 61: 75, 62: 76, 63: 76, 64: 77, 65: 78, 66: 78, 67: 79, 68: 80, 69: 81, 70: 81, 71: 87, 72: 88, 73: 89, 74: 89, 75: 90, 76: 91, 77: 92, 78: 92, 79: 93, 80: 94, 81: 100, 82: 100, 83: 101, 84: 102, 85: 103, 86: 103, 87: 104, 88: 105, 89: 106, 90: 106 } },
    def: { byLevel: { 1: 68, 2: 74, 3: 80, 4: 85, 5: 91, 6: 97, 7: 102, 8: 108, 9: 114, 10: 119, 11: 125, 12: 131, 13: 137, 14: 142, 15: 148, 16: 154, 17: 160, 18: 165, 19: 171, 20: 177, 21: 241, 22: 247, 23: 253, 24: 259, 25: 264, 26: 270, 27: 276, 28: 282, 29: 288, 30: 294, 31: 299, 32: 305, 33: 311, 34: 317, 35: 323, 36: 329, 37: 335, 38: 340, 39: 346, 40: 352, 41: 400, 42: 406, 43: 412, 44: 417, 45: 423, 46: 429, 47: 435, 48: 441, 49: 447, 50: 453, 51: 514, 52: 520, 53: 526, 54: 532, 55: 538, 56: 544, 57: 550, 58: 556, 59: 562, 60: 568, 61: 616, 62: 622, 63: 628, 64: 634, 65: 640, 66: 646, 67: 652, 68: 658, 69: 664, 70: 670, 71: 718, 72: 724, 73: 730, 74: 736, 75: 742, 76: 748, 77: 755, 78: 761, 79: 767, 80: 773, 81: 821, 82: 827, 83: 833, 84: 839, 85: 845, 86: 851, 87: 858, 88: 864, 89: 870, 90: 876 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 106,
    hp: 15552,
    def: 876,
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
        id: "hu-tao-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.468864, 0.500832, 0.5328, 0.575424, 0.607392, 0.644688, 0.69264, 0.740592, 0.788544, 0.836496, 0.884448, 0.9324, 0.980352, 1.028304, 1.076256]) },
            ],
          },
        ],
      },
      {
        id: "hu-tao-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.482539, 0.51544, 0.54834, 0.592207, 0.625108, 0.663491, 0.712842, 0.762193, 0.811543, 0.860894, 0.910244, 0.959595, 1.008946, 1.058296, 1.107647]) },
            ],
          },
        ],
      },
      {
        id: "hu-tao-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.6105, 0.652125, 0.69375, 0.74925, 0.790875, 0.839438, 0.901875, 0.964313, 1.02675, 1.089188, 1.151625, 1.214063, 1.2765, 1.338938, 1.401375]) },
            ],
          },
        ],
      },
      {
        id: "hu-tao-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65641, 0.701165, 0.74592, 0.805594, 0.850349, 0.902563, 0.969696, 1.036829, 1.103962, 1.171094, 1.238227, 1.30536, 1.372493, 1.439626, 1.506758]) },
            ],
          },
        ],
      },
      {
        id: "hu-tao-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.332737, 0.355423, 0.37811, 0.408359, 0.431045, 0.457513, 0.491543, 0.525573, 0.559603, 0.593633, 0.627663, 0.661693, 0.695722, 0.729752, 0.763782]) },
              { stat: "atk", table: talentTable([0.352, 0.376, 0.4, 0.432, 0.456, 0.484, 0.52, 0.556, 0.592, 0.628, 0.664, 0.7, 0.736, 0.772, 0.808]) },
            ],
          },
        ],
      },
      {
        id: "hu-tao-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "hu-tao-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.859584, 0.918192, 0.9768, 1.054944, 1.113552, 1.181928, 1.26984, 1.357752, 1.445664, 1.533576, 1.621488, 1.7094, 1.797312, 1.885224, 1.973136]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "hu-tao-charged",
      name: "Secret Spear of Wangsheng",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "hu-tao-charged-1",
          name: "Charged Attack",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.3596, 1.4523, 1.545, 1.6686, 1.7613, 1.86945, 2.0085, 2.14755, 2.2866, 2.42565, 2.5647, 2.70375, 2.8428, 2.98185, 3.1209]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "hu-tao-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "hu-tao-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.308107, 1.397296, 1.486485, 1.605404, 1.694593, 1.798647, 1.932431, 2.066214, 2.199998, 2.333781, 2.467565, 2.601349, 2.735132, 2.868916, 3.0027]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "hu-tao-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "hu-tao-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.633896, 1.745298, 1.8567, 2.005236, 2.116638, 2.246607, 2.41371, 2.580813, 2.747916, 2.915019, 3.082122, 3.249225, 3.416328, 3.583431, 3.750534]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "hu-tao-skill",
      name: "Guide to Afterlife",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 3, element: "pyro" },
      instances: [
        {
          id: "hu-tao-skill-1",
          name: "Blood Blossom DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.64, 0.688, 0.736, 0.8, 0.848, 0.896, 0.96, 1.024, 1.088, 1.152, 1.216, 1.28, 1.36, 1.44, 1.52]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "hu-tao-burst",
      name: "Spirit Soother",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "hu-tao-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.03272, 3.21432, 3.39592, 3.632, 3.8136, 3.9952, 4.23128, 4.46736, 4.70344, 4.93952, 5.1756, 5.41168, 5.64776, 5.88384, 6.11992]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "hu-tao-burst-2",
          name: "Low HP Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.7909, 4.0179, 4.2449, 4.54, 4.767, 4.994, 5.2891, 5.5842, 5.8793, 6.1744, 6.4695, 6.7646, 7.0597, 7.3548, 7.6499]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "hu-tao-a1", name: "Flutter By", unlockAscension: 1, effects: [] },
    { id: "hu-tao-a4", name: "Sanguine Rouge", unlockAscension: 4, effects: [] },
    { id: "hu-tao-p3", name: "The More the Merrier", effects: [] },
  ],
  constellations: [
    { level: 1, id: "hu-tao-c1", name: "Crimson Bouquet", effects: [] },
    { level: 2, id: "hu-tao-c2", name: "Ominous Rainfall", effects: [] },
    { level: 3, id: "hu-tao-c3", name: "Lingering Carmine", effects: [], buffs: [{ id: "hu-tao-c3", source: "Lingering Carmine", sourceCharacterId: "hu-tao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "hu-tao-c4", name: "Garden of Eternal Rest", effects: [] },
    { level: 5, id: "hu-tao-c5", name: "Floral Incense", effects: [], buffs: [{ id: "hu-tao-c5", source: "Floral Incense", sourceCharacterId: "hu-tao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "hu-tao-c6", name: "Butterfly's Embrace", effects: [] },
  ],
  resources: [],
};

export const klee: GeneratedCharacter = {
  id: "klee",
  name: "Klee",
  element: "pyro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 801, 2: 867, 3: 934, 4: 1001, 5: 1067, 6: 1135, 7: 1201, 8: 1268, 9: 1336, 10: 1402, 11: 1469, 12: 1537, 13: 1604, 14: 1672, 15: 1739, 16: 1807, 17: 1875, 18: 1942, 19: 2010, 20: 2077, 21: 2832, 22: 2900, 23: 2968, 24: 3036, 25: 3104, 26: 3173, 27: 3241, 28: 3309, 29: 3378, 30: 3446, 31: 3515, 32: 3584, 33: 3653, 34: 3721, 35: 3790, 36: 3859, 37: 3928, 38: 3997, 39: 4066, 40: 4136, 41: 4692, 42: 4762, 43: 4832, 44: 4901, 45: 4970, 46: 5040, 47: 5110, 48: 5179, 49: 5250, 50: 5319, 51: 6039, 52: 6110, 53: 6180, 54: 6250, 55: 6321, 56: 6391, 57: 6461, 58: 6532, 59: 6602, 60: 6673, 61: 7231, 62: 7302, 63: 7373, 64: 7443, 65: 7515, 66: 7586, 67: 7656, 68: 7728, 69: 7799, 70: 7870, 71: 8429, 72: 8501, 73: 8573, 74: 8644, 75: 8716, 76: 8787, 77: 8859, 78: 8931, 79: 9004, 80: 9076, 81: 9636, 82: 9708, 83: 9780, 84: 9852, 85: 9924, 86: 9997, 87: 10069, 88: 10142, 89: 10214, 90: 10287 } },
    atk: { byLevel: { 1: 24, 2: 26, 3: 28, 4: 30, 5: 32, 6: 34, 7: 36, 8: 38, 9: 40, 10: 42, 11: 44, 12: 46, 13: 48, 14: 51, 15: 53, 16: 55, 17: 57, 18: 59, 19: 61, 20: 63, 21: 86, 22: 88, 23: 90, 24: 92, 25: 94, 26: 96, 27: 98, 28: 100, 29: 102, 30: 104, 31: 106, 32: 108, 33: 110, 34: 112, 35: 115, 36: 117, 37: 119, 38: 121, 39: 123, 40: 125, 41: 142, 42: 144, 43: 146, 44: 148, 45: 150, 46: 152, 47: 154, 48: 157, 49: 159, 50: 161, 51: 183, 52: 185, 53: 187, 54: 189, 55: 191, 56: 193, 57: 195, 58: 197, 59: 200, 60: 202, 61: 219, 62: 221, 63: 223, 64: 225, 65: 227, 66: 229, 67: 231, 68: 234, 69: 236, 70: 238, 71: 255, 72: 257, 73: 259, 74: 261, 75: 263, 76: 266, 77: 268, 78: 270, 79: 272, 80: 274, 81: 291, 82: 293, 83: 296, 84: 298, 85: 300, 86: 302, 87: 304, 88: 307, 89: 309, 90: 311 } },
    def: { byLevel: { 1: 48, 2: 52, 3: 56, 4: 60, 5: 64, 6: 68, 7: 72, 8: 76, 9: 80, 10: 84, 11: 88, 12: 92, 13: 96, 14: 100, 15: 104, 16: 108, 17: 112, 18: 116, 19: 120, 20: 124, 21: 169, 22: 173, 23: 177, 24: 181, 25: 186, 26: 190, 27: 194, 28: 198, 29: 202, 30: 206, 31: 210, 32: 214, 33: 218, 34: 222, 35: 227, 36: 231, 37: 235, 38: 239, 39: 243, 40: 247, 41: 280, 42: 285, 43: 289, 44: 293, 45: 297, 46: 301, 47: 305, 48: 310, 49: 314, 50: 318, 51: 361, 52: 365, 53: 369, 54: 374, 55: 378, 56: 382, 57: 386, 58: 390, 59: 395, 60: 399, 61: 432, 62: 436, 63: 441, 64: 445, 65: 449, 66: 453, 67: 458, 68: 462, 69: 466, 70: 470, 71: 504, 72: 508, 73: 512, 74: 517, 75: 521, 76: 525, 77: 530, 78: 534, 79: 538, 80: 542, 81: 576, 82: 580, 83: 585, 84: 589, 85: 593, 86: 598, 87: 602, 88: 606, 89: 611, 90: 615 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "pyro",
  },
  baseStats: {
    atk: 311,
    hp: 10287,
    def: 615,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { pyro: 0.28800000000000003 },
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "klee-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "klee-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.7216, 0.77572, 0.82984, 0.902, 0.95612, 1.01024, 1.0824, 1.15456, 1.22672, 1.29888, 1.373926, 1.472064, 1.570202, 1.668339, 1.766477]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "klee-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "klee-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.624, 0.6708, 0.7176, 0.78, 0.8268, 0.8736, 0.936, 0.9984, 1.0608, 1.1232, 1.188096, 1.27296, 1.357824, 1.442688, 1.527552]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "klee-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "klee-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.8992, 0.96664, 1.03408, 1.124, 1.19144, 1.25888, 1.3488, 1.43872, 1.52864, 1.61856, 1.712077, 1.834368, 1.956659, 2.07895, 2.201242]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "klee-charged",
      name: "Kaboom!",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "klee-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.5736, 1.69162, 1.80964, 1.967, 2.08502, 2.20304, 2.3604, 2.51776, 2.67512, 2.83248, 2.996134, 3.210144, 3.424154, 3.638163, 3.852173]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "klee-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "klee-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "klee-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "klee-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "klee-skill",
      name: "Jumpy Dumpty",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      particles: { count: 12, element: "pyro" },
      instances: [
        {
          id: "klee-skill-1",
          name: "Jumpy Dumpty DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.952, 1.0234, 1.0948, 1.19, 1.2614, 1.3328, 1.428, 1.5232, 1.6184, 1.7136, 1.8088, 1.904, 2.023, 2.142, 2.261]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "klee-skill-2",
          name: "Mine DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "klee-burst",
      name: "Sparks 'n' Splash",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "klee-burst-1",
          name: "Sparks 'n' Splash DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.4264, 0.45838, 0.49036, 0.533, 0.56498, 0.59696, 0.6396, 0.68224, 0.72488, 0.76752, 0.81016, 0.8528, 0.9061, 0.9594, 1.0127]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "klee-a1", name: "Pounding Surprise", unlockAscension: 1, effects: [] },
    { id: "klee-a4", name: "Sparkling Burst", unlockAscension: 4, effects: [] },
    { id: "klee-p3", name: "All Of My Treasures!", effects: [] },
    { id: "klee-p4", name: "Witch's Eve Rite: Sparkborne Magic", effects: [] },
  ],
  constellations: [
    { level: 1, id: "klee-c1", name: "Chained Reactions", effects: [] },
    { level: 2, id: "klee-c2", name: "Explosive Frags", effects: [] },
    { level: 3, id: "klee-c3", name: "Exquisite Compound", effects: [], buffs: [{ id: "klee-c3", source: "Exquisite Compound", sourceCharacterId: "klee", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "klee-c4", name: "Sparkly Explosion", effects: [] },
    { level: 5, id: "klee-c5", name: "Nova Burst", effects: [], buffs: [{ id: "klee-c5", source: "Nova Burst", sourceCharacterId: "klee", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "klee-c6", name: "Blazing Delight", effects: [] },
  ],
  resources: [],
};

export const lyney: GeneratedCharacter = {
  id: "lyney",
  name: "Lyney",
  element: "pyro",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 858, 2: 929, 3: 1000, 4: 1072, 5: 1144, 6: 1216, 7: 1287, 8: 1359, 9: 1431, 10: 1502, 11: 1574, 12: 1646, 13: 1719, 14: 1791, 15: 1864, 16: 1936, 17: 2009, 18: 2081, 19: 2154, 20: 2226, 21: 3034, 22: 3107, 23: 3180, 24: 3253, 25: 3326, 26: 3400, 27: 3473, 28: 3546, 29: 3619, 30: 3692, 31: 3766, 32: 3840, 33: 3914, 34: 3987, 35: 4060, 36: 4135, 37: 4209, 38: 4283, 39: 4356, 40: 4431, 41: 5027, 42: 5102, 43: 5177, 44: 5251, 45: 5325, 46: 5400, 47: 5474, 48: 5549, 49: 5625, 50: 5699, 51: 6471, 52: 6546, 53: 6621, 54: 6697, 55: 6772, 56: 6848, 57: 6923, 58: 6999, 59: 7074, 60: 7150, 61: 7748, 62: 7823, 63: 7900, 64: 7975, 65: 8051, 66: 8128, 67: 8203, 68: 8280, 69: 8356, 70: 8432, 71: 9031, 72: 9109, 73: 9185, 74: 9261, 75: 9339, 76: 9415, 77: 9492, 78: 9569, 79: 9647, 80: 9724, 81: 10324, 82: 10401, 83: 10478, 84: 10555, 85: 10633, 86: 10711, 87: 10788, 88: 10866, 89: 10944, 90: 11021 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 31, 5: 33, 6: 35, 7: 37, 8: 39, 9: 41, 10: 43, 11: 45, 12: 48, 13: 50, 14: 52, 15: 54, 16: 56, 17: 58, 18: 60, 19: 62, 20: 64, 21: 88, 22: 90, 23: 92, 24: 94, 25: 96, 26: 98, 27: 100, 28: 102, 29: 104, 30: 107, 31: 109, 32: 111, 33: 113, 34: 115, 35: 117, 36: 119, 37: 121, 38: 124, 39: 126, 40: 128, 41: 145, 42: 147, 43: 149, 44: 152, 45: 154, 46: 156, 47: 158, 48: 160, 49: 162, 50: 164, 51: 187, 52: 189, 53: 191, 54: 193, 55: 195, 56: 198, 57: 200, 58: 202, 59: 204, 60: 206, 61: 224, 62: 226, 63: 228, 64: 230, 65: 232, 66: 235, 67: 237, 68: 239, 69: 241, 70: 243, 71: 261, 72: 263, 73: 265, 74: 267, 75: 270, 76: 272, 77: 274, 78: 276, 79: 278, 80: 281, 81: 298, 82: 300, 83: 302, 84: 305, 85: 307, 86: 309, 87: 311, 88: 314, 89: 316, 90: 318 } },
    def: { byLevel: { 1: 42, 2: 45, 3: 49, 4: 52, 5: 56, 6: 59, 7: 63, 8: 66, 9: 70, 10: 73, 11: 77, 12: 80, 13: 84, 14: 87, 15: 91, 16: 94, 17: 98, 18: 102, 19: 105, 20: 109, 21: 148, 22: 152, 23: 155, 24: 159, 25: 162, 26: 166, 27: 170, 28: 173, 29: 177, 30: 180, 31: 184, 32: 187, 33: 191, 34: 195, 35: 198, 36: 202, 37: 205, 38: 209, 39: 213, 40: 216, 41: 245, 42: 249, 43: 253, 44: 256, 45: 260, 46: 264, 47: 267, 48: 271, 49: 275, 50: 278, 51: 316, 52: 320, 53: 323, 54: 327, 55: 331, 56: 334, 57: 338, 58: 342, 59: 345, 60: 349, 61: 378, 62: 382, 63: 386, 64: 389, 65: 393, 66: 397, 67: 400, 68: 404, 69: 408, 70: 412, 71: 441, 72: 445, 73: 448, 74: 452, 75: 456, 76: 460, 77: 463, 78: 467, 79: 471, 80: 475, 81: 504, 82: 508, 83: 511, 84: 515, 85: 519, 86: 523, 87: 527, 88: 530, 89: 534, 90: 538 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 318,
    hp: 11021,
    def: 538,
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
        id: "lyney-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lyney-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.38786, 0.41943, 0.451, 0.4961, 0.52767, 0.56375, 0.61336, 0.66297, 0.71258, 0.7667, 0.82082, 0.87494, 0.92906, 0.98318, 1.0373]) },
            ],
          },
        ],
      },
      {
        id: "lyney-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lyney-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.38012, 0.41106, 0.442, 0.4862, 0.51714, 0.5525, 0.60112, 0.64974, 0.69836, 0.7514, 0.80444, 0.85748, 0.91052, 0.96356, 1.0166]) },
            ],
          },
        ],
      },
      {
        id: "lyney-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lyney-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.27262, 0.29481, 0.317, 0.3487, 0.37089, 0.39625, 0.43112, 0.46599, 0.50086, 0.5389, 0.57694, 0.61498, 0.65302, 0.69106, 0.7291]) },
              { stat: "atk", table: talentTable([0.27262, 0.29481, 0.317, 0.3487, 0.37089, 0.39625, 0.43112, 0.46599, 0.50086, 0.5389, 0.57694, 0.61498, 0.65302, 0.69106, 0.7291]) },
            ],
          },
        ],
      },
      {
        id: "lyney-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lyney-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.56932, 0.61566, 0.662, 0.7282, 0.77454, 0.8275, 0.90032, 0.97314, 1.04596, 1.1254, 1.20484, 1.28428, 1.36372, 1.44316, 1.5226]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "lyney-charged",
      name: "Card Force Translocation",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lyney-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "lyney-charged-2",
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
      id: "lyney-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lyney-plungeLow-1",
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
      id: "lyney-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lyney-plungeHigh-1",
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
      id: "lyney-skill",
      name: "Bewildering Lights",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 5, element: "pyro" },
      instances: [
        {
          id: "lyney-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.672, 1.7974, 1.9228, 2.09, 2.2154, 2.3408, 2.508, 2.6752, 2.8424, 3.0096, 3.1768, 3.344, 3.553, 3.762, 3.971]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lyney-burst",
      name: "Wondrous Trick: Miracle Parade",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "lyney-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.54, 1.6555, 1.771, 1.925, 2.0405, 2.156, 2.31, 2.464, 2.618, 2.772, 2.926, 3.08, 3.2725, 3.465, 3.6575]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "lyney-burst-2",
          name: "Explosive Firework DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([4.14, 4.4505, 4.761, 5.175, 5.4855, 5.796, 6.21, 6.624, 7.038, 7.452, 7.866, 8.28, 8.7975, 9.315, 9.8325]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "lyney-a1", name: "Perilous Performance", unlockAscension: 1, effects: [] },
    { id: "lyney-a4", name: "Conclusive Ovation", unlockAscension: 4, effects: [] },
    { id: "lyney-p3", name: "Trivial Observations", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lyney-c1", name: "Whimsical Wonders", effects: [] },
    { level: 2, id: "lyney-c2", name: "Loquacious Cajoling", effects: [] },
    { level: 3, id: "lyney-c3", name: "Prestidigitation", effects: [], buffs: [{ id: "lyney-c3", source: "Prestidigitation", sourceCharacterId: "lyney", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "lyney-c4", name: "Well-Versed, Well-Rehearsed", effects: [] },
    { level: 5, id: "lyney-c5", name: "To Pierce Enigmas", effects: [], buffs: [{ id: "lyney-c5", source: "To Pierce Enigmas", sourceCharacterId: "lyney", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "lyney-c6", name: "Guarded Smile", effects: [] },
  ],
  resources: [],
};

export const mavuika: GeneratedCharacter = {
  id: "mavuika",
  name: "Mavuika",
  element: "pyro",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 977, 2: 1058, 3: 1139, 4: 1221, 5: 1303, 6: 1385, 7: 1466, 8: 1548, 9: 1630, 10: 1711, 11: 1793, 12: 1875, 13: 1957, 14: 2040, 15: 2122, 16: 2204, 17: 2288, 18: 2370, 19: 2453, 20: 2535, 21: 3456, 22: 3539, 23: 3622, 24: 3705, 25: 3788, 26: 3872, 27: 3955, 28: 4038, 29: 4122, 30: 4205, 31: 4289, 32: 4373, 33: 4457, 34: 4540, 35: 4624, 36: 4709, 37: 4793, 38: 4877, 39: 4961, 40: 5046, 41: 5726, 42: 5811, 43: 5896, 44: 5980, 45: 6065, 46: 6150, 47: 6235, 48: 6320, 49: 6406, 50: 6491, 51: 7370, 52: 7456, 53: 7541, 54: 7627, 55: 7713, 56: 7799, 57: 7885, 58: 7971, 59: 8057, 60: 8143, 61: 8824, 62: 8910, 63: 8997, 64: 9083, 65: 9170, 66: 9257, 67: 9343, 68: 9430, 69: 9517, 70: 9604, 71: 10286, 72: 10374, 73: 10461, 74: 10548, 75: 10636, 76: 10723, 77: 10811, 78: 10899, 79: 10986, 80: 11074, 81: 11758, 82: 11846, 83: 11934, 84: 12021, 85: 12109, 86: 12198, 87: 12286, 88: 12375, 89: 12464, 90: 12552 } },
    atk: { byLevel: { 1: 28, 2: 30, 3: 33, 4: 35, 5: 37, 6: 40, 7: 42, 8: 44, 9: 47, 10: 49, 11: 51, 12: 54, 13: 56, 14: 58, 15: 61, 16: 63, 17: 65, 18: 68, 19: 70, 20: 72, 21: 99, 22: 101, 23: 104, 24: 106, 25: 108, 26: 111, 27: 113, 28: 115, 29: 118, 30: 120, 31: 123, 32: 125, 33: 127, 34: 130, 35: 132, 36: 135, 37: 137, 38: 139, 39: 142, 40: 144, 41: 164, 42: 166, 43: 169, 44: 171, 45: 173, 46: 176, 47: 178, 48: 181, 49: 183, 50: 186, 51: 211, 52: 213, 53: 216, 54: 218, 55: 220, 56: 223, 57: 225, 58: 228, 59: 230, 60: 233, 61: 252, 62: 255, 63: 257, 64: 260, 65: 262, 66: 265, 67: 267, 68: 270, 69: 272, 70: 274, 71: 294, 72: 297, 73: 299, 74: 301, 75: 304, 76: 306, 77: 309, 78: 312, 79: 314, 80: 317, 81: 336, 82: 339, 83: 341, 84: 344, 85: 346, 86: 349, 87: 351, 88: 354, 89: 356, 90: 359 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 72, 4: 77, 5: 82, 6: 87, 7: 92, 8: 98, 9: 103, 10: 108, 11: 113, 12: 118, 13: 123, 14: 129, 15: 134, 16: 139, 17: 144, 18: 149, 19: 155, 20: 160, 21: 218, 22: 223, 23: 228, 24: 234, 25: 239, 26: 244, 27: 249, 28: 255, 29: 260, 30: 265, 31: 270, 32: 276, 33: 281, 34: 286, 35: 292, 36: 297, 37: 302, 38: 308, 39: 313, 40: 318, 41: 361, 42: 366, 43: 372, 44: 377, 45: 382, 46: 388, 47: 393, 48: 399, 49: 404, 50: 409, 51: 465, 52: 470, 53: 476, 54: 481, 55: 486, 56: 492, 57: 497, 58: 503, 59: 508, 60: 514, 61: 556, 62: 562, 63: 567, 64: 573, 65: 578, 66: 584, 67: 589, 68: 595, 69: 600, 70: 606, 71: 649, 72: 654, 73: 660, 74: 665, 75: 671, 76: 676, 77: 682, 78: 687, 79: 693, 80: 698, 81: 742, 82: 747, 83: 753, 84: 758, 85: 764, 86: 769, 87: 775, 88: 780, 89: 786, 90: 792 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 359,
    hp: 12552,
    def: 792,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.884,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 0,
  normalAttacks: {
    hits: [
      {
        id: "mavuika-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mavuika-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.80035, 0.865495, 0.93064, 1.023704, 1.088849, 1.1633, 1.26567, 1.368041, 1.470411, 1.582088, 1.693765, 1.805442, 1.917118, 2.028795, 2.140472]) },
            ],
          },
        ],
      },
      {
        id: "mavuika-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mavuika-na-2-1-1",
            name: "2-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.364799, 0.394492, 0.424185, 0.466604, 0.496296, 0.530231, 0.576892, 0.623552, 0.670212, 0.721114, 0.772017, 0.822919, 0.873821, 0.924723, 0.975625]) },
            ],
          },
          {
            id: "mavuika-na-2-1-2",
            name: "2-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.364799, 0.394492, 0.424185, 0.466604, 0.496296, 0.530231, 0.576892, 0.623552, 0.670212, 0.721114, 0.772017, 0.822919, 0.873821, 0.924723, 0.975625]) },
            ],
          },
        ],
      },
      {
        id: "mavuika-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mavuika-na-3-1-1",
            name: "3-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.332232, 0.359274, 0.386317, 0.424948, 0.45199, 0.482896, 0.525391, 0.567885, 0.61038, 0.656738, 0.703096, 0.749454, 0.795812, 0.84217, 0.888528]) },
            ],
          },
          {
            id: "mavuika-na-3-1-2",
            name: "3-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.332232, 0.359274, 0.386317, 0.424948, 0.45199, 0.482896, 0.525391, 0.567885, 0.61038, 0.656738, 0.703096, 0.749454, 0.795812, 0.84217, 0.888528]) },
            ],
          },
          {
            id: "mavuika-na-3-1-3",
            name: "3-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.332232, 0.359274, 0.386317, 0.424948, 0.45199, 0.482896, 0.525391, 0.567885, 0.61038, 0.656738, 0.703096, 0.749454, 0.795812, 0.84217, 0.888528]) },
            ],
          },
        ],
      },
      {
        id: "mavuika-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mavuika-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.161929, 1.256504, 1.35108, 1.486188, 1.580764, 1.68885, 1.837469, 1.986088, 2.134706, 2.296836, 2.458966, 2.621095, 2.783225, 2.945354, 3.107484]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "mavuika-charged",
      name: "Flames Weave Life",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mavuika-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.93844, 2.09622, 2.254, 2.4794, 2.63718, 2.8175, 3.06544, 3.31338, 3.56132, 3.8318, 4.10228, 4.37276, 4.64324, 4.91372, 5.1842]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "mavuika-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mavuika-plungeLow-1",
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
      id: "mavuika-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mavuika-plungeHigh-1",
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
      id: "mavuika-skill",
      name: "The Named Moment",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 5, element: "pyro" },
      instances: [
        {
          id: "mavuika-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.744, 0.7998, 0.8556, 0.93, 0.9858, 1.0416, 1.116, 1.1904, 1.2648, 1.3392, 1.4136, 1.488, 1.581, 1.674, 1.767]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-2",
          name: "Ring of Searing Radiance DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.28, 1.376, 1.472, 1.6, 1.696, 1.792, 1.92, 2.048, 2.176, 2.304, 2.432, 2.56, 2.72, 2.88, 3.04]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-3",
          name: "Flamestrider Normal Attack 1-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.572648, 0.619259, 0.66587, 0.732457, 0.779068, 0.832337, 0.905583, 0.978829, 1.052075, 1.131979, 1.211883, 1.291788, 1.371692, 1.451597, 1.531501]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-4",
          name: "Flamestrider Normal Attack 2-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.591327, 0.639459, 0.68759, 0.756349, 0.80448, 0.859488, 0.935122, 1.010757, 1.086392, 1.168903, 1.251414, 1.333925, 1.416435, 1.498946, 1.581457]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-5",
          name: "Flamestrider Normal Attack 3-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.699868, 0.756834, 0.8138, 0.89518, 0.952146, 1.01725, 1.106768, 1.196286, 1.285804, 1.38346, 1.481116, 1.578772, 1.676428, 1.774084, 1.87174]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-6",
          name: "Flamestrider Normal Attack 4-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.697047, 0.753784, 0.81052, 0.891572, 0.948308, 1.01315, 1.102307, 1.191464, 1.280622, 1.377884, 1.475146, 1.572409, 1.669671, 1.766934, 1.864196]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-7",
          name: "Flamestrider Normal Attack 5-Hit DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.910035, 0.984107, 1.05818, 1.163998, 1.238071, 1.322725, 1.439125, 1.555525, 1.671924, 1.798906, 1.925888, 2.052869, 2.179851, 2.306832, 2.433814]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-8",
          name: "Flamestrider Sprint DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.8084, 0.8742, 0.94, 1.034, 1.0998, 1.175, 1.2784, 1.3818, 1.4852, 1.598, 1.7108, 1.8236, 1.9364, 2.0492, 2.162]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-9",
          name: "Flamestrider Charged Attack Cyclic DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.989, 1.0695, 1.15, 1.265, 1.3455, 1.4375, 1.564, 1.6905, 1.817, 1.955, 2.093, 2.231, 2.369, 2.507, 2.645]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-10",
          name: "Flamestrider Charged Attack Final DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.376, 1.488, 1.6, 1.76, 1.872, 2, 2.176, 2.352, 2.528, 2.72, 2.912, 3.104, 3.296, 3.488, 3.68]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "mavuika-skill-11",
          name: "Flamestrider Plunge DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.5996, 1.7298, 1.86, 2.046, 2.1762, 2.325, 2.5296, 2.7342, 2.9388, 3.162, 3.3852, 3.6084, 3.8316, 4.0548, 4.278]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "mavuika-burst",
      name: "Hour of Burning Skies",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 0,
      instances: [
        {
          id: "mavuika-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([4.448, 4.7816, 5.1152, 5.56, 5.8936, 6.2272, 6.672, 7.1168, 7.5616, 8.0064, 8.4512, 8.896, 9.452, 10.008, 10.564]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "mavuika-a1", name: "Gift of Flaming Flowers", unlockAscension: 1, effects: [] },
    { id: "mavuika-a4", name: "\"Kiongozi\"", unlockAscension: 4, effects: [] },
    { id: "mavuika-p3", name: "Night Realm's Gift: Exhaust Mode", effects: [] },
    { id: "mavuika-p4", name: "Night-Shattering Radiance", effects: [] },
  ],
  constellations: [
    { level: 1, id: "mavuika-c1", name: "The Night-Lord's Explication", effects: [] },
    { level: 2, id: "mavuika-c2", name: "The Ashen Price", effects: [] },
    { level: 3, id: "mavuika-c3", name: "The Burning Sun", effects: [], buffs: [{ id: "mavuika-c3", source: "The Burning Sun", sourceCharacterId: "mavuika", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "mavuika-c4", name: "The Leader's Resolve", effects: [] },
    { level: 5, id: "mavuika-c5", name: "The Meaning of Truth", effects: [], buffs: [{ id: "mavuika-c5", source: "The Meaning of Truth", sourceCharacterId: "mavuika", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "mavuika-c6", name: "\"Humanity's Name\" Unfettered", effects: [] },
  ],
  resources: [],
};

export const nicole: GeneratedCharacter = {
  id: "nicole",
  name: "Nicole",
  element: "pyro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 810, 2: 878, 3: 945, 4: 1013, 5: 1080, 6: 1148, 7: 1215, 8: 1284, 9: 1352, 10: 1419, 11: 1487, 12: 1555, 13: 1623, 14: 1692, 15: 1760, 16: 1828, 17: 1897, 18: 1965, 19: 2034, 20: 2102, 21: 2866, 22: 2935, 23: 3003, 24: 3072, 25: 3141, 26: 3211, 27: 3280, 28: 3349, 29: 3418, 30: 3487, 31: 3557, 32: 3627, 33: 3696, 34: 3765, 35: 3835, 36: 3905, 37: 3975, 38: 4045, 39: 4114, 40: 4185, 41: 4748, 42: 4819, 43: 4889, 44: 4959, 45: 5029, 46: 5100, 47: 5170, 48: 5241, 49: 5312, 50: 5383, 51: 6111, 52: 6183, 53: 6253, 54: 6324, 55: 6396, 56: 6467, 57: 6538, 58: 6610, 59: 6681, 60: 6752, 61: 7317, 62: 7389, 63: 7461, 64: 7532, 65: 7604, 66: 7676, 67: 7748, 68: 7820, 69: 7892, 70: 7964, 71: 8530, 72: 8603, 73: 8675, 74: 8747, 75: 8820, 76: 8892, 77: 8965, 78: 9038, 79: 9111, 80: 9184, 81: 9750, 82: 9823, 83: 9896, 84: 9969, 85: 10042, 86: 10116, 87: 10189, 88: 10262, 89: 10336, 90: 10409 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 33, 5: 35, 6: 38, 7: 40, 8: 42, 9: 44, 10: 47, 11: 49, 12: 51, 13: 53, 14: 56, 15: 58, 16: 60, 17: 62, 18: 65, 19: 67, 20: 69, 21: 94, 22: 96, 23: 99, 24: 101, 25: 103, 26: 106, 27: 108, 28: 110, 29: 112, 30: 115, 31: 117, 32: 119, 33: 121, 34: 124, 35: 126, 36: 128, 37: 131, 38: 133, 39: 135, 40: 138, 41: 156, 42: 158, 43: 161, 44: 163, 45: 165, 46: 168, 47: 170, 48: 172, 49: 175, 50: 177, 51: 201, 52: 203, 53: 205, 54: 208, 55: 210, 56: 212, 57: 215, 58: 217, 59: 220, 60: 222, 61: 240, 62: 243, 63: 245, 64: 247, 65: 250, 66: 252, 67: 255, 68: 257, 69: 259, 70: 262, 71: 280, 72: 283, 73: 285, 74: 287, 75: 290, 76: 292, 77: 295, 78: 297, 79: 299, 80: 302, 81: 320, 82: 323, 83: 325, 84: 328, 85: 330, 86: 332, 87: 335, 88: 337, 89: 340, 90: 342 } },
    def: { byLevel: { 1: 44, 2: 47, 3: 51, 4: 55, 5: 58, 6: 62, 7: 66, 8: 69, 9: 73, 10: 77, 11: 80, 12: 84, 13: 88, 14: 91, 15: 95, 16: 99, 17: 103, 18: 106, 19: 110, 20: 114, 21: 155, 22: 159, 23: 162, 24: 166, 25: 170, 26: 174, 27: 177, 28: 181, 29: 185, 30: 188, 31: 192, 32: 196, 33: 200, 34: 203, 35: 207, 36: 211, 37: 215, 38: 219, 39: 222, 40: 226, 41: 257, 42: 260, 43: 264, 44: 268, 45: 272, 46: 276, 47: 279, 48: 283, 49: 287, 50: 291, 51: 330, 52: 334, 53: 338, 54: 342, 55: 346, 56: 350, 57: 353, 58: 357, 59: 361, 60: 365, 61: 395, 62: 399, 63: 403, 64: 407, 65: 411, 66: 415, 67: 419, 68: 423, 69: 427, 70: 430, 71: 461, 72: 465, 73: 469, 74: 473, 75: 477, 76: 481, 77: 485, 78: 488, 79: 492, 80: 496, 81: 527, 82: 531, 83: 535, 84: 539, 85: 543, 86: 547, 87: 551, 88: 555, 89: 559, 90: 563 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 342,
    hp: 10409,
    def: 563,
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
        id: "nicole-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nicole-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.351792, 0.378176, 0.404561, 0.43974, 0.466124, 0.492509, 0.527688, 0.562867, 0.598046, 0.633226, 0.668405, 0.703584, 0.747558, 0.791532, 0.835506]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "nicole-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nicole-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.296336, 0.318561, 0.340786, 0.37042, 0.392645, 0.41487, 0.444504, 0.474138, 0.503771, 0.533405, 0.563038, 0.592672, 0.629714, 0.666756, 0.703798]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "nicole-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nicole-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.46188, 0.496521, 0.531162, 0.57735, 0.611991, 0.646632, 0.69282, 0.739008, 0.785196, 0.831384, 0.877572, 0.92376, 0.981495, 1.03923, 1.096965]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "nicole-charged",
      name: "Allegoria",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nicole-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.1232, 1.20744, 1.29168, 1.404, 1.48824, 1.57248, 1.6848, 1.79712, 1.90944, 2.02176, 2.13408, 2.2464, 2.3868, 2.5272, 2.6676]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "nicole-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nicole-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "nicole-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nicole-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "nicole-skill",
      name: "Revelation: Uncreated Light",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 5, element: "pyro" },
      instances: [
        {
          id: "nicole-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.384, 1.4878, 1.5916, 1.73, 1.8338, 1.9376, 2.076, 2.2144, 2.3528, 2.4912, 2.6296, 2.768, 2.941, 3.114, 3.287]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "nicole-burst",
      name: "Revelation: Ladder of Divine Ascent",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "nicole-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.168, 3.4056, 3.6432, 3.96, 4.1976, 4.4352, 4.752, 5.0688, 5.3856, 5.7024, 6.0192, 6.336, 6.732, 7.128, 7.524]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "nicole-burst-2",
          name: "Arcane Projection DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.99, 1.08, 1.17, 1.26, 1.35, 1.44, 1.53, 1.62, 1.71, 1.8, 1.908, 2.016, 2.124, 2.232, 2.34]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "nicole-a1", name: "Methexis", unlockAscension: 1, effects: [] },
    { id: "nicole-a4", name: "Philokalia", unlockAscension: 4, effects: [] },
    { id: "nicole-p3", name: "Nepsis", effects: [] },
    { id: "nicole-p4", name: "Witch's Eve Rite: Light in the Darkness", effects: [] },
  ],
  constellations: [
    { level: 1, id: "nicole-c1", name: "\"Do Not Be Afraid, Child Who Is Loved\"", effects: [] },
    { level: 2, id: "nicole-c2", name: "\"I Will Guide You and Show You the Path You Should Tread\"", effects: [] },
    { level: 3, id: "nicole-c3", name: "\"A Lamp by Your Side, A Light to Shine the Way\"", effects: [], buffs: [{ id: "nicole-c3", source: "\"A Lamp by Your Side, A Light to Shine the Way\"", sourceCharacterId: "nicole", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "nicole-c4", name: "\"Whether Left or Right, No Matter Which Way You Turn\"", effects: [] },
    { level: 5, id: "nicole-c5", name: "\"You Will Hear My Voice Beside You\"", effects: [], buffs: [{ id: "nicole-c5", source: "\"You Will Hear My Voice Beside You\"", sourceCharacterId: "nicole", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "nicole-c6", name: "\"This Is the Path, Walk It Without Delay\"", effects: [] },
  ],
  resources: [],
};

export const thoma: GeneratedCharacter = {
  id: "thoma",
  name: "Thoma",
  element: "pyro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 866, 2: 938, 3: 1009, 4: 1081, 5: 1152, 6: 1224, 7: 1295, 8: 1367, 9: 1439, 10: 1510, 11: 1582, 12: 1653, 13: 1725, 14: 1796, 15: 1868, 16: 1939, 17: 2010, 18: 2082, 19: 2153, 20: 2225, 21: 2943, 22: 3015, 23: 3087, 24: 3158, 25: 3230, 26: 3301, 27: 3373, 28: 3444, 29: 3516, 30: 3587, 31: 3659, 32: 3731, 33: 3802, 34: 3874, 35: 3945, 36: 4017, 37: 4088, 38: 4160, 39: 4231, 40: 4302, 41: 4834, 42: 4905, 43: 4977, 44: 5048, 45: 5120, 46: 5192, 47: 5263, 48: 5335, 49: 5406, 50: 5478, 51: 6162, 52: 6234, 53: 6306, 54: 6377, 55: 6449, 56: 6520, 57: 6591, 58: 6662, 59: 6734, 60: 6806, 61: 7337, 62: 7409, 63: 7480, 64: 7552, 65: 7623, 66: 7695, 67: 7767, 68: 7838, 69: 7910, 70: 7981, 71: 8512, 72: 8583, 73: 8655, 74: 8727, 75: 8798, 76: 8870, 77: 8941, 78: 9013, 79: 9084, 80: 9156, 81: 9688, 82: 9759, 83: 9831, 84: 9902, 85: 9973, 86: 10044, 87: 10116, 88: 10187, 89: 10259, 90: 10331 } },
    atk: { byLevel: { 1: 17, 2: 18, 3: 20, 4: 21, 5: 23, 6: 24, 7: 25, 8: 27, 9: 28, 10: 29, 11: 31, 12: 32, 13: 34, 14: 35, 15: 36, 16: 38, 17: 39, 18: 41, 19: 42, 20: 43, 21: 57, 22: 59, 23: 60, 24: 62, 25: 63, 26: 64, 27: 66, 28: 67, 29: 69, 30: 70, 31: 71, 32: 73, 33: 74, 34: 76, 35: 77, 36: 78, 37: 80, 38: 81, 39: 83, 40: 84, 41: 94, 42: 96, 43: 97, 44: 99, 45: 100, 46: 101, 47: 103, 48: 104, 49: 106, 50: 107, 51: 120, 52: 122, 53: 123, 54: 125, 55: 126, 56: 127, 57: 129, 58: 130, 59: 132, 60: 133, 61: 143, 62: 145, 63: 146, 64: 147, 65: 149, 66: 150, 67: 152, 68: 153, 69: 154, 70: 156, 71: 166, 72: 168, 73: 169, 74: 170, 75: 172, 76: 173, 77: 175, 78: 176, 79: 177, 80: 179, 81: 189, 82: 191, 83: 192, 84: 193, 85: 195, 86: 196, 87: 198, 88: 199, 89: 200, 90: 202 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 79, 5: 84, 6: 89, 7: 94, 8: 99, 9: 105, 10: 110, 11: 115, 12: 120, 13: 125, 14: 130, 15: 136, 16: 141, 17: 146, 18: 151, 19: 156, 20: 162, 21: 214, 22: 219, 23: 224, 24: 230, 25: 235, 26: 240, 27: 245, 28: 250, 29: 256, 30: 261, 31: 266, 32: 271, 33: 276, 34: 282, 35: 287, 36: 292, 37: 297, 38: 302, 39: 308, 40: 313, 41: 351, 42: 356, 43: 362, 44: 367, 45: 372, 46: 377, 47: 382, 48: 388, 49: 393, 50: 398, 51: 448, 52: 453, 53: 458, 54: 463, 55: 469, 56: 474, 57: 479, 58: 484, 59: 489, 60: 495, 61: 533, 62: 538, 63: 544, 64: 549, 65: 554, 66: 559, 67: 564, 68: 570, 69: 575, 70: 580, 71: 619, 72: 624, 73: 629, 74: 634, 75: 639, 76: 645, 77: 650, 78: 655, 79: 660, 80: 665, 81: 704, 82: 709, 83: 714, 84: 720, 85: 725, 86: 730, 87: 735, 88: 740, 89: 746, 90: 751 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 202,
    hp: 10331,
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
        id: "thoma-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "thoma-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.443932, 0.480066, 0.5162, 0.56782, 0.603954, 0.64525, 0.702032, 0.758814, 0.815596, 0.87754, 0.939484, 1.001428, 1.063372, 1.125316, 1.18726]) },
            ],
          },
        ],
      },
      {
        id: "thoma-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "thoma-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.436278, 0.471789, 0.5073, 0.55803, 0.593541, 0.634125, 0.689928, 0.745731, 0.801534, 0.86241, 0.923286, 0.984162, 1.045038, 1.105914, 1.16679]) },
            ],
          },
        ],
      },
      {
        id: "thoma-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "thoma-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26789, 0.289695, 0.3115, 0.34265, 0.364455, 0.389375, 0.42364, 0.457905, 0.49217, 0.52955, 0.56693, 0.60431, 0.64169, 0.67907, 0.71645]) },
            ],
          },
          {
            id: "thoma-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26789, 0.289695, 0.3115, 0.34265, 0.364455, 0.389375, 0.42364, 0.457905, 0.49217, 0.52955, 0.56693, 0.60431, 0.64169, 0.67907, 0.71645]) },
            ],
          },
        ],
      },
      {
        id: "thoma-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "thoma-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.673552, 0.728376, 0.7832, 0.86152, 0.916344, 0.979, 1.065152, 1.151304, 1.237456, 1.33144, 1.425424, 1.519408, 1.613392, 1.707376, 1.80136]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "thoma-charged",
      name: "Swiftshatter Spear",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "thoma-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.12746, 1.21923, 1.311, 1.4421, 1.53387, 1.63875, 1.78296, 1.92717, 2.07138, 2.2287, 2.38602, 2.54334, 2.70066, 2.85798, 3.0153]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "thoma-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "thoma-plungeLow-1",
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
      id: "thoma-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "thoma-plungeHigh-1",
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
      id: "thoma-skill",
      name: "Blazing Blessing",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "pyro" },
      instances: [
        {
          id: "thoma-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.464, 1.5738, 1.6836, 1.83, 1.9398, 2.0496, 2.196, 2.3424, 2.4888, 2.6352, 2.7816, 2.928, 3.111, 3.294, 3.477]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "thoma-burst",
      name: "Crimson Ooyoroi",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "thoma-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.88, 0.946, 1.012, 1.1, 1.166, 1.232, 1.32, 1.408, 1.496, 1.584, 1.672, 1.76, 1.87, 1.98, 2.09]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "thoma-burst-2",
          name: "Fiery Collapse DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.58, 0.6235, 0.667, 0.725, 0.7685, 0.812, 0.87, 0.928, 0.986, 1.044, 1.102, 1.16, 1.2325, 1.305, 1.3775]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "thoma-a1", name: "Imbricated Armor", unlockAscension: 1, effects: [] },
    { id: "thoma-a4", name: "Flaming Assault", unlockAscension: 4, effects: [] },
    { id: "thoma-p3", name: "Snap and Swing", effects: [] },
  ],
  constellations: [
    { level: 1, id: "thoma-c1", name: "A Comrade's Duty", effects: [] },
    { level: 2, id: "thoma-c2", name: "A Subordinate's Skills", effects: [] },
    { level: 3, id: "thoma-c3", name: "Fortified Resolve", effects: [], buffs: [{ id: "thoma-c3", source: "Fortified Resolve", sourceCharacterId: "thoma", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "thoma-c4", name: "Long-Term Planning", effects: [] },
    { level: 5, id: "thoma-c5", name: "Raging Wildfire", effects: [], buffs: [{ id: "thoma-c5", source: "Raging Wildfire", sourceCharacterId: "thoma", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "thoma-c6", name: "Burning Heart", effects: [] },
  ],
  resources: [],
};

export const travelerFPyro: GeneratedCharacter = {
  id: "traveler-f-pyro",
  name: "Traveler",
  element: "pyro",
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
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "traveler-f-pyro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-pyro-na-1-1",
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
        id: "traveler-f-pyro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-pyro-na-2-1",
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
        id: "traveler-f-pyro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-pyro-na-3-1",
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
        id: "traveler-f-pyro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-pyro-na-4-1",
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
        id: "traveler-f-pyro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-pyro-na-5-1",
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
      id: "traveler-f-pyro-charged",
      name: "Foreign Blaze",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-pyro-charged-1",
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
      id: "traveler-f-pyro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-pyro-plungeLow-1",
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
      id: "traveler-f-pyro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-pyro-plungeHigh-1",
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
      id: "traveler-f-pyro-skill",
      name: "Flowfire Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-pyro-skill-1",
          name: "Hold DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.988, 1.0621, 1.1362, 1.235, 1.3091, 1.3832, 1.482, 1.5808, 1.6796, 1.7784, 1.8772, 1.976, 2.0995, 2.223, 2.3465]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-pyro-burst",
      name: "Plains Scorcher",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "traveler-f-pyro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([4.272, 4.5924, 4.9128, 5.34, 5.6604, 5.9808, 6.408, 6.8352, 7.2624, 7.6896, 8.1168, 8.544, 9.078, 9.612, 10.146]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-pyro-a1", name: "True Flame of Incineration", unlockAscension: 1, effects: [] },
    { id: "traveler-f-pyro-a4", name: "Embers Unspent", unlockAscension: 4, effects: [] },
    { id: "traveler-f-pyro-p3", name: "Foreign Starfire", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-pyro-c1", name: "Starfire's Flowing Light", effects: [] },
    { level: 2, id: "traveler-f-pyro-c2", name: "Ever-Lit Candle", effects: [] },
    { level: 3, id: "traveler-f-pyro-c3", name: "Relayed Beacon", effects: [], buffs: [{ id: "traveler-f-pyro-c3", source: "Relayed Beacon", sourceCharacterId: "traveler-f-pyro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-f-pyro-c4", name: "Ravaging Flame", effects: [] },
    { level: 5, id: "traveler-f-pyro-c5", name: "The Fire Inextinguishable", effects: [], buffs: [{ id: "traveler-f-pyro-c5", source: "The Fire Inextinguishable", sourceCharacterId: "traveler-f-pyro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-f-pyro-c6", name: "The Sacred Flame Imperishable", effects: [] },
  ],
  resources: [],
};

export const travelerMPyro: GeneratedCharacter = {
  id: "traveler-m-pyro",
  name: "Traveler",
  element: "pyro",
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
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "traveler-m-pyro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-pyro-na-1-1",
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
        id: "traveler-m-pyro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-pyro-na-2-1",
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
        id: "traveler-m-pyro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-pyro-na-3-1",
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
        id: "traveler-m-pyro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-pyro-na-4-1",
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
        id: "traveler-m-pyro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-pyro-na-5-1",
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
      id: "traveler-m-pyro-charged",
      name: "Foreign Blaze",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-pyro-charged-1",
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
      id: "traveler-m-pyro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-pyro-plungeLow-1",
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
      id: "traveler-m-pyro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-pyro-plungeHigh-1",
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
      id: "traveler-m-pyro-skill",
      name: "Flowfire Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-pyro-skill-1",
          name: "Hold DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.988, 1.0621, 1.1362, 1.235, 1.3091, 1.3832, 1.482, 1.5808, 1.6796, 1.7784, 1.8772, 1.976, 2.0995, 2.223, 2.3465]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-pyro-burst",
      name: "Plains Scorcher",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "traveler-m-pyro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([4.272, 4.5924, 4.9128, 5.34, 5.6604, 5.9808, 6.408, 6.8352, 7.2624, 7.6896, 8.1168, 8.544, 9.078, 9.612, 10.146]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-pyro-a1", name: "True Flame of Incineration", unlockAscension: 1, effects: [] },
    { id: "traveler-m-pyro-a4", name: "Embers Unspent", unlockAscension: 4, effects: [] },
    { id: "traveler-m-pyro-p3", name: "Foreign Starfire", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-pyro-c1", name: "Starfire's Flowing Light", effects: [] },
    { level: 2, id: "traveler-m-pyro-c2", name: "Ever-Lit Candle", effects: [] },
    { level: 3, id: "traveler-m-pyro-c3", name: "Relayed Beacon", effects: [], buffs: [{ id: "traveler-m-pyro-c3", source: "Relayed Beacon", sourceCharacterId: "traveler-m-pyro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-m-pyro-c4", name: "Ravaging Flame", effects: [] },
    { level: 5, id: "traveler-m-pyro-c5", name: "The Fire Inextinguishable", effects: [], buffs: [{ id: "traveler-m-pyro-c5", source: "The Fire Inextinguishable", sourceCharacterId: "traveler-m-pyro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-m-pyro-c6", name: "The Sacred Flame Imperishable", effects: [] },
  ],
  resources: [],
};

export const xiangling: GeneratedCharacter = {
  id: "xiangling",
  name: "Xiangling",
  element: "pyro",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 912, 2: 987, 3: 1062, 4: 1138, 5: 1213, 6: 1288, 7: 1363, 8: 1439, 9: 1514, 10: 1589, 11: 1665, 12: 1740, 13: 1815, 14: 1890, 15: 1966, 16: 2042, 17: 2116, 18: 2192, 19: 2267, 20: 2342, 21: 3098, 22: 3174, 23: 3250, 24: 3324, 25: 3400, 26: 3475, 27: 3551, 28: 3625, 29: 3701, 30: 3776, 31: 3851, 32: 3927, 33: 4002, 34: 4078, 35: 4152, 36: 4228, 37: 4303, 38: 4378, 39: 4454, 40: 4529, 41: 5089, 42: 5163, 43: 5239, 44: 5314, 45: 5389, 46: 5465, 47: 5540, 48: 5616, 49: 5690, 50: 5766, 51: 6486, 52: 6562, 53: 6637, 54: 6712, 55: 6788, 56: 6863, 57: 6938, 58: 7013, 59: 7089, 60: 7164, 61: 7723, 62: 7799, 63: 7874, 64: 7949, 65: 8024, 66: 8100, 67: 8175, 68: 8250, 69: 8326, 70: 8401, 71: 8960, 72: 9035, 73: 9111, 74: 9186, 75: 9261, 76: 9337, 77: 9412, 78: 9487, 79: 9562, 80: 9638, 81: 10197, 82: 10272, 83: 10348, 84: 10423, 85: 10498, 86: 10573, 87: 10649, 88: 10724, 89: 10799, 90: 10875 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 38, 14: 39, 15: 41, 16: 42, 17: 44, 18: 45, 19: 47, 20: 48, 21: 64, 22: 66, 23: 67, 24: 69, 25: 70, 26: 72, 27: 74, 28: 75, 29: 77, 30: 78, 31: 80, 32: 81, 33: 83, 34: 84, 35: 86, 36: 88, 37: 89, 38: 91, 39: 92, 40: 94, 41: 105, 42: 107, 43: 108, 44: 110, 45: 112, 46: 113, 47: 115, 48: 116, 49: 118, 50: 119, 51: 134, 52: 136, 53: 137, 54: 139, 55: 141, 56: 142, 57: 144, 58: 145, 59: 147, 60: 148, 61: 160, 62: 161, 63: 163, 64: 165, 65: 166, 66: 168, 67: 169, 68: 171, 69: 172, 70: 174, 71: 186, 72: 187, 73: 189, 74: 190, 75: 192, 76: 193, 77: 195, 78: 196, 79: 198, 80: 200, 81: 211, 82: 213, 83: 214, 84: 216, 85: 217, 86: 219, 87: 220, 88: 222, 89: 224, 90: 225 } },
    def: { byLevel: { 1: 56, 2: 61, 3: 65, 4: 70, 5: 75, 6: 79, 7: 84, 8: 88, 9: 93, 10: 98, 11: 102, 12: 107, 13: 112, 14: 116, 15: 121, 16: 126, 17: 130, 18: 135, 19: 139, 20: 144, 21: 191, 22: 195, 23: 200, 24: 204, 25: 209, 26: 214, 27: 218, 28: 223, 29: 228, 30: 232, 31: 237, 32: 242, 33: 246, 34: 251, 35: 255, 36: 260, 37: 265, 38: 269, 39: 274, 40: 279, 41: 313, 42: 318, 43: 322, 44: 327, 45: 331, 46: 336, 47: 341, 48: 345, 49: 350, 50: 355, 51: 399, 52: 404, 53: 408, 54: 413, 55: 417, 56: 422, 57: 427, 58: 431, 59: 436, 60: 441, 61: 475, 62: 480, 63: 484, 64: 489, 65: 494, 66: 498, 67: 503, 68: 507, 69: 512, 70: 517, 71: 551, 72: 556, 73: 560, 74: 565, 75: 570, 76: 574, 77: 579, 78: 584, 79: 588, 80: 593, 81: 627, 82: 632, 83: 636, 84: 641, 85: 646, 86: 650, 87: 655, 88: 660, 89: 664, 90: 669 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 225,
    hp: 10875,
    def: 669,
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
        id: "xiangling-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiangling-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.42054, 0.45477, 0.489, 0.5379, 0.57213, 0.61125, 0.66504, 0.71883, 0.77262, 0.8313, 0.898537, 0.977609, 1.05668, 1.135751, 1.222011]) },
            ],
          },
        ],
      },
      {
        id: "xiangling-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiangling-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4214, 0.4557, 0.49, 0.539, 0.5733, 0.6125, 0.6664, 0.7203, 0.7742, 0.833, 0.900375, 0.979608, 1.058841, 1.138074, 1.22451]) },
            ],
          },
        ],
      },
      {
        id: "xiangling-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiangling-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26058, 0.28179, 0.303, 0.3333, 0.35451, 0.37875, 0.41208, 0.44541, 0.47874, 0.5151, 0.556762, 0.605758, 0.654753, 0.703748, 0.757197]) },
              { stat: "atk", table: talentTable([0.26058, 0.28179, 0.303, 0.3333, 0.35451, 0.37875, 0.41208, 0.44541, 0.47874, 0.5151, 0.556762, 0.605758, 0.654753, 0.703748, 0.757197]) },
            ],
          },
        ],
      },
      {
        id: "xiangling-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiangling-na-4-1-1",
            name: "4-Hit DMG (1/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.14104, 0.15252, 0.164, 0.1804, 0.19188, 0.205, 0.22304, 0.24108, 0.25912, 0.2788, 0.30135, 0.327869, 0.354388, 0.380906, 0.409836]) },
            ],
          },
          {
            id: "xiangling-na-4-1-2",
            name: "4-Hit DMG (2/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.14104, 0.15252, 0.164, 0.1804, 0.19188, 0.205, 0.22304, 0.24108, 0.25912, 0.2788, 0.30135, 0.327869, 0.354388, 0.380906, 0.409836]) },
            ],
          },
          {
            id: "xiangling-na-4-1-3",
            name: "4-Hit DMG (3/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.14104, 0.15252, 0.164, 0.1804, 0.19188, 0.205, 0.22304, 0.24108, 0.25912, 0.2788, 0.30135, 0.327869, 0.354388, 0.380906, 0.409836]) },
            ],
          },
          {
            id: "xiangling-na-4-1-4",
            name: "4-Hit DMG (4/4)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.14104, 0.15252, 0.164, 0.1804, 0.19188, 0.205, 0.22304, 0.24108, 0.25912, 0.2788, 0.30135, 0.327869, 0.354388, 0.380906, 0.409836]) },
            ],
          },
        ],
      },
      {
        id: "xiangling-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiangling-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.71036, 0.76818, 0.826, 0.9086, 0.96642, 1.0325, 1.12336, 1.21422, 1.30508, 1.4042, 1.517775, 1.651339, 1.784903, 1.918468, 2.064174]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xiangling-charged",
      name: "Dough-Fu",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiangling-charged-1",
          name: "Charged Attack DMG",
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
      id: "xiangling-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiangling-plungeLow-1",
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
      id: "xiangling-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiangling-plungeHigh-1",
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
      id: "xiangling-skill",
      name: "Guoba Attack",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 1, element: "pyro" },
      instances: [
        {
          id: "xiangling-skill-1",
          name: "Flame DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.1128, 1.19626, 1.27972, 1.391, 1.47446, 1.55792, 1.6692, 1.78048, 1.89176, 2.00304, 2.11432, 2.2256, 2.3647, 2.5038, 2.6429]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xiangling-burst",
      name: "Pyronado",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "xiangling-burst-1",
          name: "1-Hit Swing DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.72, 0.774, 0.828, 0.9, 0.954, 1.008, 1.08, 1.152, 1.224, 1.296, 1.368, 1.44, 1.53, 1.62, 1.71]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "xiangling-burst-2",
          name: "2-Hit Swing DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.88, 0.946, 1.012, 1.1, 1.166, 1.232, 1.32, 1.408, 1.496, 1.584, 1.672, 1.76, 1.87, 1.98, 2.09]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "xiangling-burst-3",
          name: "3-Hit Swing DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.096, 1.1782, 1.2604, 1.37, 1.4522, 1.5344, 1.644, 1.7536, 1.8632, 1.9728, 2.0824, 2.192, 2.329, 2.466, 2.603]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "xiangling-burst-4",
          name: "Pyronado DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.12, 1.204, 1.288, 1.4, 1.484, 1.568, 1.68, 1.792, 1.904, 2.016, 2.128, 2.24, 2.38, 2.52, 2.66]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "xiangling-a1", name: "Crossfire", unlockAscension: 1, effects: [] },
    { id: "xiangling-a4", name: "Beware, It's Super Hot!", unlockAscension: 4, effects: [] },
    { id: "xiangling-p3", name: "Chef de Cuisine", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xiangling-c1", name: "Crispy Outside, Tender Inside", effects: [] },
    { level: 2, id: "xiangling-c2", name: "Oil Meets Fire", effects: [] },
    { level: 3, id: "xiangling-c3", name: "Deepfry", effects: [], buffs: [{ id: "xiangling-c3", source: "Deepfry", sourceCharacterId: "xiangling", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "xiangling-c4", name: "Slowbake", effects: [] },
    { level: 5, id: "xiangling-c5", name: "Guoba Mad", effects: [], buffs: [{ id: "xiangling-c5", source: "Guoba Mad", sourceCharacterId: "xiangling", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "xiangling-c6", name: "Condensed Pyronado", effects: [] },
  ],
  resources: [],
};

export const xinyan: GeneratedCharacter = {
  id: "xinyan",
  name: "Xinyan",
  element: "pyro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 939, 2: 1017, 3: 1094, 4: 1172, 5: 1249, 6: 1327, 7: 1404, 8: 1482, 9: 1560, 10: 1637, 11: 1715, 12: 1792, 13: 1870, 14: 1947, 15: 2025, 16: 2103, 17: 2180, 18: 2258, 19: 2335, 20: 2413, 21: 3191, 22: 3269, 23: 3347, 24: 3424, 25: 3502, 26: 3579, 27: 3657, 28: 3734, 29: 3812, 30: 3889, 31: 3967, 32: 4045, 33: 4122, 34: 4200, 35: 4277, 36: 4355, 37: 4432, 38: 4510, 39: 4588, 40: 4665, 41: 5241, 42: 5318, 43: 5396, 44: 5473, 45: 5551, 46: 5629, 47: 5706, 48: 5784, 49: 5861, 50: 5939, 51: 6681, 52: 6759, 53: 6837, 54: 6914, 55: 6992, 56: 7069, 57: 7147, 58: 7224, 59: 7301, 60: 7379, 61: 7955, 62: 8033, 63: 8110, 64: 8188, 65: 8265, 66: 8343, 67: 8421, 68: 8498, 69: 8576, 70: 8653, 71: 9229, 72: 9306, 73: 9384, 74: 9462, 75: 9539, 76: 9617, 77: 9694, 78: 9772, 79: 9849, 80: 9927, 81: 10503, 82: 10580, 83: 10658, 84: 10735, 85: 10813, 86: 10890, 87: 10968, 88: 11045, 89: 11123, 90: 11201 } },
    atk: { byLevel: { 1: 21, 2: 23, 3: 24, 4: 26, 5: 28, 6: 29, 7: 31, 8: 33, 9: 35, 10: 36, 11: 38, 12: 40, 13: 41, 14: 43, 15: 45, 16: 47, 17: 48, 18: 50, 19: 52, 20: 54, 21: 71, 22: 73, 23: 74, 24: 76, 25: 78, 26: 79, 27: 81, 28: 83, 29: 85, 30: 86, 31: 88, 32: 90, 33: 91, 34: 93, 35: 95, 36: 97, 37: 98, 38: 100, 39: 102, 40: 103, 41: 116, 42: 118, 43: 120, 44: 121, 45: 123, 46: 125, 47: 127, 48: 128, 49: 130, 50: 132, 51: 148, 52: 150, 53: 152, 54: 153, 55: 155, 56: 157, 57: 159, 58: 160, 59: 162, 60: 164, 61: 176, 62: 178, 63: 180, 64: 182, 65: 183, 66: 185, 67: 187, 68: 189, 69: 190, 70: 192, 71: 205, 72: 206, 73: 208, 74: 210, 75: 212, 76: 213, 77: 215, 78: 217, 79: 219, 80: 220, 81: 233, 82: 235, 83: 236, 84: 238, 85: 240, 86: 242, 87: 243, 88: 245, 89: 247, 90: 249 } },
    def: { byLevel: { 1: 67, 2: 73, 3: 78, 4: 84, 5: 89, 6: 95, 7: 100, 8: 106, 9: 111, 10: 117, 11: 122, 12: 128, 13: 133, 14: 139, 15: 144, 16: 150, 17: 155, 18: 161, 19: 166, 20: 172, 21: 228, 22: 233, 23: 239, 24: 244, 25: 250, 26: 255, 27: 261, 28: 266, 29: 272, 30: 277, 31: 283, 32: 288, 33: 294, 34: 299, 35: 305, 36: 310, 37: 316, 38: 322, 39: 327, 40: 333, 41: 374, 42: 379, 43: 385, 44: 390, 45: 396, 46: 401, 47: 407, 48: 412, 49: 418, 50: 423, 51: 476, 52: 482, 53: 487, 54: 493, 55: 498, 56: 504, 57: 509, 58: 515, 59: 521, 60: 526, 61: 567, 62: 573, 63: 578, 64: 584, 65: 589, 66: 595, 67: 600, 68: 606, 69: 611, 70: 617, 71: 658, 72: 663, 73: 669, 74: 675, 75: 680, 76: 686, 77: 691, 78: 697, 79: 702, 80: 708, 81: 749, 82: 754, 83: 760, 84: 765, 85: 771, 86: 776, 87: 782, 88: 787, 89: 793, 90: 799 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 249,
    hp: 11201,
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
        id: "xinyan-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xinyan-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7654, 0.8277, 0.89, 0.979, 1.0413, 1.1125, 1.2104, 1.3083, 1.4062, 1.513, 1.6198, 1.7266, 1.8334, 1.9402, 2.047]) },
            ],
          },
        ],
      },
      {
        id: "xinyan-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xinyan-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7396, 0.7998, 0.86, 0.946, 1.0062, 1.075, 1.1696, 1.2642, 1.3588, 1.462, 1.5652, 1.6684, 1.7716, 1.8748, 1.978]) },
            ],
          },
        ],
      },
      {
        id: "xinyan-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xinyan-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.9546, 1.0323, 1.11, 1.221, 1.2987, 1.3875, 1.5096, 1.6317, 1.7538, 1.887, 2.0202, 2.1534, 2.2866, 2.4198, 2.553]) },
            ],
          },
        ],
      },
      {
        id: "xinyan-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xinyan-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.15842, 1.25271, 1.347, 1.4817, 1.57599, 1.68375, 1.83192, 1.98009, 2.12826, 2.2899, 2.45154, 2.61318, 2.77482, 2.93646, 3.0981]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xinyan-charged",
      name: "Dance on Fire",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xinyan-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.625455, 0.676364, 0.727273, 0.8, 0.850909, 0.909091, 0.989091, 1.069091, 1.149091, 1.236364, 1.323636, 1.410909, 1.498182, 1.585455, 1.672727]) },
          ],
        },
        {
          id: "xinyan-charged-2",
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
      id: "xinyan-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xinyan-plungeLow-1",
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
      id: "xinyan-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xinyan-plungeHigh-1",
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
      id: "xinyan-skill",
      name: "Sweeping Fervor",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 4, element: "pyro" },
      instances: [
        {
          id: "xinyan-skill-1",
          name: "Swing DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.696, 1.8232, 1.9504, 2.12, 2.2472, 2.3744, 2.544, 2.7136, 2.8832, 3.0528, 3.2224, 3.392, 3.604, 3.816, 4.028]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "xinyan-skill-2",
          name: "DoT",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.336, 0.3612, 0.3864, 0.42, 0.4452, 0.4704, 0.504, 0.5376, 0.5712, 0.6048, 0.6384, 0.672, 0.714, 0.756, 0.798]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xinyan-burst",
      name: "Riff Revolution",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "xinyan-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([3.408, 3.6636, 3.9192, 4.26, 4.5156, 4.7712, 5.112, 5.4528, 5.7936, 6.1344, 6.4752, 6.816, 7.242, 7.668, 8.094]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "xinyan-a1", name: "\"The Show Goes On, Even Without an Audience...\"", unlockAscension: 1, effects: [] },
    { id: "xinyan-a4", name: "\"...Now That's Rock 'N' Roll!\"", unlockAscension: 4, effects: [] },
    { id: "xinyan-p3", name: "A Rad Recipe", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xinyan-c1", name: "Fatal Acceleration", effects: [] },
    { level: 2, id: "xinyan-c2", name: "Impromptu Opening", effects: [] },
    { level: 3, id: "xinyan-c3", name: "Double-Stop", effects: [], buffs: [{ id: "xinyan-c3", source: "Double-Stop", sourceCharacterId: "xinyan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "xinyan-c4", name: "Wildfire Rhythm", effects: [] },
    { level: 5, id: "xinyan-c5", name: "Screamin' for an Encore", effects: [], buffs: [{ id: "xinyan-c5", source: "Screamin' for an Encore", sourceCharacterId: "xinyan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "xinyan-c6", name: "Rockin' in a Flaming World", effects: [] },
  ],
  resources: [],
};

export const yanfei: GeneratedCharacter = {
  id: "yanfei",
  name: "Yanfei",
  element: "pyro",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 784, 2: 849, 3: 914, 4: 979, 5: 1043, 6: 1108, 7: 1172, 8: 1237, 9: 1302, 10: 1367, 11: 1432, 12: 1496, 13: 1561, 14: 1626, 15: 1691, 16: 1756, 17: 1820, 18: 1885, 19: 1949, 20: 2014, 21: 2665, 22: 2730, 23: 2795, 24: 2859, 25: 2924, 26: 2988, 27: 3053, 28: 3118, 29: 3183, 30: 3247, 31: 3312, 32: 3377, 33: 3442, 34: 3507, 35: 3571, 36: 3636, 37: 3700, 38: 3765, 39: 3831, 40: 3895, 41: 4376, 42: 4440, 43: 4506, 44: 4570, 45: 4635, 46: 4700, 47: 4764, 48: 4829, 49: 4894, 50: 4959, 51: 5578, 52: 5643, 53: 5708, 54: 5773, 55: 5838, 56: 5902, 57: 5967, 58: 6031, 59: 6096, 60: 6161, 61: 6642, 62: 6707, 63: 6771, 64: 6836, 65: 6901, 66: 6966, 67: 7031, 68: 7095, 69: 7160, 70: 7225, 71: 7706, 72: 7770, 73: 7835, 74: 7900, 75: 7965, 76: 8030, 77: 8094, 78: 8159, 79: 8223, 80: 8289, 81: 8770, 82: 8834, 83: 8899, 84: 8963, 85: 9029, 86: 9093, 87: 9158, 88: 9222, 89: 9287, 90: 9352 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 23, 4: 25, 5: 27, 6: 28, 7: 30, 8: 32, 9: 33, 10: 35, 11: 37, 12: 38, 13: 40, 14: 42, 15: 43, 16: 45, 17: 47, 18: 48, 19: 50, 20: 52, 21: 68, 22: 70, 23: 72, 24: 73, 25: 75, 26: 77, 27: 78, 28: 80, 29: 82, 30: 83, 31: 85, 32: 87, 33: 88, 34: 90, 35: 92, 36: 93, 37: 95, 38: 97, 39: 98, 40: 100, 41: 112, 42: 114, 43: 116, 44: 117, 45: 119, 46: 121, 47: 122, 48: 124, 49: 126, 50: 127, 51: 143, 52: 145, 53: 146, 54: 148, 55: 150, 56: 151, 57: 153, 58: 155, 59: 156, 60: 158, 61: 170, 62: 172, 63: 174, 64: 175, 65: 177, 66: 179, 67: 180, 68: 182, 69: 184, 70: 185, 71: 198, 72: 199, 73: 201, 74: 203, 75: 204, 76: 206, 77: 208, 78: 209, 79: 211, 80: 213, 81: 225, 82: 227, 83: 228, 84: 230, 85: 232, 86: 233, 87: 235, 88: 237, 89: 238, 90: 240 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 70, 7: 74, 8: 78, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 106, 16: 110, 17: 114, 18: 118, 19: 122, 20: 126, 21: 167, 22: 171, 23: 175, 24: 179, 25: 184, 26: 188, 27: 192, 28: 196, 29: 200, 30: 204, 31: 208, 32: 212, 33: 216, 34: 220, 35: 224, 36: 228, 37: 232, 38: 236, 39: 240, 40: 244, 41: 275, 42: 279, 43: 283, 44: 287, 45: 291, 46: 295, 47: 299, 48: 303, 49: 307, 50: 311, 51: 350, 52: 354, 53: 358, 54: 362, 55: 366, 56: 370, 57: 374, 58: 379, 59: 383, 60: 387, 61: 417, 62: 421, 63: 425, 64: 429, 65: 433, 66: 437, 67: 441, 68: 445, 69: 449, 70: 453, 71: 484, 72: 488, 73: 492, 74: 496, 75: 500, 76: 504, 77: 508, 78: 512, 79: 516, 80: 520, 81: 550, 82: 554, 83: 559, 84: 563, 85: 567, 86: 571, 87: 575, 88: 579, 89: 583, 90: 587 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "pyro",
  },
  baseStats: {
    atk: 240,
    hp: 9352,
    def: 587,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { pyro: 0.24 },
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "yanfei-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yanfei-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.583416, 0.627172, 0.670928, 0.72927, 0.773026, 0.816782, 0.875124, 0.933466, 0.991807, 1.050149, 1.10849, 1.166832, 1.239759, 1.312686, 1.385613]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "yanfei-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yanfei-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.521256, 0.56035, 0.599444, 0.65157, 0.690664, 0.729758, 0.781884, 0.83401, 0.886135, 0.938261, 0.990386, 1.042512, 1.107669, 1.172826, 1.237983]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
      {
        id: "yanfei-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yanfei-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "pyro",
            scaling: [
              { stat: "atk", table: talentTable([0.760128, 0.817138, 0.874147, 0.95016, 1.00717, 1.064179, 1.140192, 1.216205, 1.292218, 1.36823, 1.444243, 1.520256, 1.615272, 1.710288, 1.805304]) },
            ],
            application: { element: "pyro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yanfei-charged",
      name: "Seal of Approval",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yanfei-charged-1",
          name: "Charged Attack (1)",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([0.982294, 1.041114, 1.099934, 1.1764, 1.23522, 1.29404, 1.370506, 1.446972, 1.523438, 1.599904, 1.67637, 1.752836, 1.829302, 1.905768, 1.982234]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "yanfei-charged-2",
          name: "Charged Attack (2)",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.15564, 1.22484, 1.29404, 1.384, 1.4532, 1.5224, 1.61236, 1.70232, 1.79228, 1.88224, 1.9722, 2.06216, 2.15212, 2.24208, 2.33204]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "yanfei-charged-3",
          name: "Charged Attack (3)",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.328986, 1.408566, 1.488146, 1.5916, 1.67118, 1.75076, 1.854214, 1.957668, 2.061122, 2.164576, 2.26803, 2.371484, 2.474938, 2.578392, 2.681846]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "yanfei-charged-4",
          name: "Charged Attack (4)",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.502332, 1.592292, 1.682252, 1.7992, 1.88916, 1.97912, 2.096068, 2.213016, 2.329964, 2.446912, 2.56386, 2.680808, 2.797756, 2.914704, 3.031652]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
        {
          id: "yanfei-charged-5",
          name: "Charged Attack (5)",
          damageType: "charged",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.675678, 1.776018, 1.876358, 2.0068, 2.10714, 2.20748, 2.337922, 2.468364, 2.598806, 2.729248, 2.85969, 2.990132, 3.120574, 3.251016, 3.381458]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "yanfei-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yanfei-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "yanfei-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yanfei-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "yanfei-skill",
      name: "Signed Edict",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 3, element: "pyro" },
      instances: [
        {
          id: "yanfei-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.696, 1.8232, 1.9504, 2.12, 2.2472, 2.3744, 2.544, 2.7136, 2.8832, 3.0528, 3.2224, 3.392, 3.604, 3.816, 4.028]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yanfei-burst",
      name: "Done Deal",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "yanfei-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.824, 1.9608, 2.0976, 2.28, 2.4168, 2.5536, 2.736, 2.9184, 3.1008, 3.2832, 3.4656, 3.648, 3.876, 4.104, 4.332]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yanfei-a1", name: "Proviso", unlockAscension: 1, effects: [] },
    { id: "yanfei-a4", name: "Blazing Eye", unlockAscension: 4, effects: [] },
    { id: "yanfei-p3", name: "Encyclopedic Expertise", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yanfei-c1", name: "The Law Knows No Kindness", effects: [] },
    { level: 2, id: "yanfei-c2", name: "Right of Final Interpretation", effects: [] },
    { level: 3, id: "yanfei-c3", name: "Samadhi Fire-Forged", effects: [], buffs: [{ id: "yanfei-c3", source: "Samadhi Fire-Forged", sourceCharacterId: "yanfei", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "yanfei-c4", name: "Supreme Amnesty", effects: [] },
    { level: 5, id: "yanfei-c5", name: "Abiding Affidavit", effects: [], buffs: [{ id: "yanfei-c5", source: "Abiding Affidavit", sourceCharacterId: "yanfei", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "yanfei-c6", name: "Extra Clause", effects: [] },
  ],
  resources: [],
};

export const yoimiya: GeneratedCharacter = {
  id: "yoimiya",
  name: "Yoimiya",
  element: "pyro",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 791, 2: 857, 3: 923, 4: 989, 5: 1055, 6: 1121, 7: 1187, 8: 1253, 9: 1320, 10: 1385, 11: 1452, 12: 1518, 13: 1585, 14: 1652, 15: 1719, 16: 1785, 17: 1852, 18: 1919, 19: 1986, 20: 2053, 21: 2798, 22: 2865, 23: 2933, 24: 3000, 25: 3067, 26: 3135, 27: 3203, 28: 3270, 29: 3338, 30: 3405, 31: 3473, 32: 3541, 33: 3609, 34: 3676, 35: 3745, 36: 3813, 37: 3881, 38: 3949, 39: 4018, 40: 4086, 41: 4636, 42: 4705, 43: 4774, 44: 4842, 45: 4911, 46: 4980, 47: 5049, 48: 5118, 49: 5187, 50: 5256, 51: 5968, 52: 6037, 53: 6106, 54: 6176, 55: 6245, 56: 6315, 57: 6385, 58: 6454, 59: 6524, 60: 6593, 61: 7145, 62: 7215, 63: 7285, 64: 7355, 65: 7425, 66: 7496, 67: 7565, 68: 7636, 69: 7706, 70: 7777, 71: 8329, 72: 8400, 73: 8471, 74: 8541, 75: 8612, 76: 8683, 77: 8754, 78: 8825, 79: 8896, 80: 8968, 81: 9521, 82: 9592, 83: 9663, 84: 9734, 85: 9806, 86: 9878, 87: 9949, 88: 10021, 89: 10093, 90: 10164 } },
    atk: { byLevel: { 1: 25, 2: 27, 3: 29, 4: 31, 5: 34, 6: 36, 7: 38, 8: 40, 9: 42, 10: 44, 11: 46, 12: 48, 13: 50, 14: 52, 15: 55, 16: 57, 17: 59, 18: 61, 19: 63, 20: 65, 21: 89, 22: 91, 23: 93, 24: 95, 25: 97, 26: 100, 27: 102, 28: 104, 29: 106, 30: 108, 31: 110, 32: 112, 33: 115, 34: 117, 35: 119, 36: 121, 37: 123, 38: 125, 39: 128, 40: 130, 41: 147, 42: 149, 43: 152, 44: 154, 45: 156, 46: 158, 47: 160, 48: 163, 49: 165, 50: 167, 51: 190, 52: 192, 53: 194, 54: 196, 55: 198, 56: 201, 57: 203, 58: 205, 59: 207, 60: 209, 61: 227, 62: 229, 63: 231, 64: 234, 65: 236, 66: 238, 67: 240, 68: 243, 69: 245, 70: 247, 71: 265, 72: 267, 73: 269, 74: 271, 75: 274, 76: 276, 77: 278, 78: 280, 79: 283, 80: 285, 81: 302, 82: 305, 83: 307, 84: 309, 85: 312, 86: 314, 87: 316, 88: 318, 89: 321, 90: 323 } },
    def: { byLevel: { 1: 48, 2: 52, 3: 56, 4: 60, 5: 64, 6: 68, 7: 72, 8: 76, 9: 80, 10: 84, 11: 88, 12: 92, 13: 96, 14: 100, 15: 104, 16: 108, 17: 112, 18: 116, 19: 120, 20: 124, 21: 169, 22: 173, 23: 177, 24: 181, 25: 186, 26: 190, 27: 194, 28: 198, 29: 202, 30: 206, 31: 210, 32: 214, 33: 218, 34: 222, 35: 227, 36: 231, 37: 235, 38: 239, 39: 243, 40: 247, 41: 280, 42: 285, 43: 289, 44: 293, 45: 297, 46: 301, 47: 305, 48: 310, 49: 314, 50: 318, 51: 361, 52: 365, 53: 369, 54: 374, 55: 378, 56: 382, 57: 386, 58: 390, 59: 395, 60: 399, 61: 432, 62: 436, 63: 441, 64: 445, 65: 449, 66: 453, 67: 458, 68: 462, 69: 466, 70: 470, 71: 504, 72: 508, 73: 512, 74: 517, 75: 521, 76: 525, 77: 530, 78: 534, 79: 538, 80: 542, 81: 576, 82: 580, 83: 585, 84: 589, 85: 593, 86: 598, 87: 602, 88: 606, 89: 611, 90: 615 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 323,
    hp: 10164,
    def: 615,
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
        id: "yoimiya-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yoimiya-na-1-1-1",
            name: "1-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3564, 0.3807, 0.405, 0.4374, 0.4617, 0.49005, 0.5265, 0.56295, 0.5994, 0.63585, 0.6723, 0.70875, 0.7452, 0.78165, 0.8181]) },
            ],
          },
          {
            id: "yoimiya-na-1-1-2",
            name: "1-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3564, 0.3807, 0.405, 0.4374, 0.4617, 0.49005, 0.5265, 0.56295, 0.5994, 0.63585, 0.6723, 0.70875, 0.7452, 0.78165, 0.8181]) },
            ],
          },
        ],
      },
      {
        id: "yoimiya-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yoimiya-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.68376, 0.73038, 0.777, 0.83916, 0.88578, 0.94017, 1.0101, 1.08003, 1.14996, 1.21989, 1.28982, 1.35975, 1.42968, 1.49961, 1.56954]) },
            ],
          },
        ],
      },
      {
        id: "yoimiya-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yoimiya-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.888888, 0.949494, 1.0101, 1.090908, 1.151514, 1.222221, 1.31313, 1.404039, 1.494948, 1.585857, 1.676766, 1.767675, 1.858584, 1.949493, 2.040402]) },
            ],
          },
        ],
      },
      {
        id: "yoimiya-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yoimiya-na-4-1-1",
            name: "4-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4642, 0.49585, 0.5275, 0.5697, 0.60135, 0.638275, 0.68575, 0.733225, 0.7807, 0.828175, 0.87565, 0.923125, 0.9706, 1.018075, 1.06555]) },
            ],
          },
          {
            id: "yoimiya-na-4-1-2",
            name: "4-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4642, 0.49585, 0.5275, 0.5697, 0.60135, 0.638275, 0.68575, 0.733225, 0.7807, 0.828175, 0.87565, 0.923125, 0.9706, 1.018075, 1.06555]) },
            ],
          },
        ],
      },
      {
        id: "yoimiya-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yoimiya-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.05864, 1.13082, 1.203, 1.29924, 1.37142, 1.45563, 1.5639, 1.67217, 1.78044, 1.88871, 1.99698, 2.10525, 2.21352, 2.32179, 2.43006]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yoimiya-charged",
      name: "Firework Flare-Up",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yoimiya-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "yoimiya-charged-2",
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
      id: "yoimiya-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yoimiya-plungeLow-1",
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
      id: "yoimiya-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yoimiya-plungeHigh-1",
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
      id: "yoimiya-skill",
      name: "Niwabi Fire-Dance",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 1, element: "pyro" },
      instances: [
        {
          id: "yoimiya-skill-1",
          name: "Blazing Arrow DMG",
          damageType: "skill",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.37909, 1.40179, 1.42449, 1.454, 1.4767, 1.4994, 1.52891, 1.55842, 1.58793, 1.61744, 1.64695, 1.67646, 1.70597, 1.73548, 1.76499]) },
          ],
          application: { element: "pyro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yoimiya-burst",
      name: "Ryuukin Saxifrage",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "yoimiya-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
        {
          id: "yoimiya-burst-2",
          name: "Aurous Blaze Explosion DMG",
          damageType: "burst",
          element: "pyro",
          scaling: [
            { stat: "atk", table: talentTable([1.22, 1.3115, 1.403, 1.525, 1.6165, 1.708, 1.83, 1.952, 2.074, 2.196, 2.318, 2.44, 2.5925, 2.745, 2.8975]) },
          ],
          application: { element: "pyro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yoimiya-a1", name: "Tricks of the Trouble-Maker", unlockAscension: 1, effects: [] },
    { id: "yoimiya-a4", name: "Summer Night's Dawn", unlockAscension: 4, effects: [] },
    { id: "yoimiya-p3", name: "Blazing Match", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yoimiya-c1", name: "Agate Ryuukin", effects: [] },
    { level: 2, id: "yoimiya-c2", name: "A Procession of Bonfires", effects: [] },
    { level: 3, id: "yoimiya-c3", name: "Trickster's Flare", effects: [], buffs: [{ id: "yoimiya-c3", source: "Trickster's Flare", sourceCharacterId: "yoimiya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "yoimiya-c4", name: "Pyrotechnic Professional", effects: [] },
    { level: 5, id: "yoimiya-c5", name: "A Summer Festival's Eve", effects: [], buffs: [{ id: "yoimiya-c5", source: "A Summer Festival's Eve", sourceCharacterId: "yoimiya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "yoimiya-c6", name: "Naganohara Meteor Swarm", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   amber.castTime: cast times are engine defaults, not sourced
//   amber.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   amber.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   arlecchino.castTime: cast times are engine defaults, not sourced
//   arlecchino.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   arlecchino.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   bennett.castTime: cast times are engine defaults, not sourced
//   bennett.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   bennett.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   chevreuse.castTime: cast times are engine defaults, not sourced
//   chevreuse.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   chevreuse.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   dehya.castTime: cast times are engine defaults, not sourced
//   dehya.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   dehya.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   diluc.castTime: cast times are engine defaults, not sourced
//   diluc.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   diluc.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   durin.castTime: cast times are engine defaults, not sourced
//   durin.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   durin.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   gaming.castTime: cast times are engine defaults, not sourced
//   gaming.constellations: 3 modelled, 5 unimplemented (numbers emitted, no buff channel), 1 unverified (text only) -- see perkEffects.ts
//   gaming.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   huTao.castTime: cast times are engine defaults, not sourced
//   huTao.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   huTao.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   klee.castTime: cast times are engine defaults, not sourced
//   klee.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   klee.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lyney.castTime: cast times are engine defaults, not sourced
//   lyney.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   lyney.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   mavuika.burst.energyCost: burst energy cost missing from source
//   mavuika.castTime: cast times are engine defaults, not sourced
//   mavuika.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   mavuika.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   nicole.castTime: cast times are engine defaults, not sourced
//   nicole.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   nicole.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   thoma.castTime: cast times are engine defaults, not sourced
//   thoma.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   thoma.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFPyro.castTime: cast times are engine defaults, not sourced
//   travelerFPyro.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   travelerFPyro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFPyro.skill.particles: skill particle yield not published by either source
//   travelerMPyro.castTime: cast times are engine defaults, not sourced
//   travelerMPyro.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   travelerMPyro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMPyro.skill.particles: skill particle yield not published by either source
//   xiangling.castTime: cast times are engine defaults, not sourced
//   xiangling.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   xiangling.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   xinyan.castTime: cast times are engine defaults, not sourced
//   xinyan.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   xinyan.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yanfei.castTime: cast times are engine defaults, not sourced
//   yanfei.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   yanfei.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yoimiya.castTime: cast times are engine defaults, not sourced
//   yoimiya.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   yoimiya.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const pyroGeneratedCharacters: readonly GeneratedCharacter[] = [
  amber,
  arlecchino,
  bennett,
  chevreuse,
  dehya,
  diluc,
  durin,
  gaming,
  huTao,
  klee,
  lyney,
  mavuika,
  nicole,
  thoma,
  travelerFPyro,
  travelerMPyro,
  xiangling,
  xinyan,
  yanfei,
  yoimiya,
];
