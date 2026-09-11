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


export const aloy: GeneratedCharacter = {
  id: "aloy",
  name: "Aloy",
  element: "cryo",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 848, 2: 919, 3: 989, 4: 1061, 5: 1131, 6: 1202, 7: 1273, 8: 1344, 9: 1415, 10: 1486, 11: 1557, 12: 1628, 13: 1699, 14: 1772, 15: 1843, 16: 1914, 17: 1986, 18: 2058, 19: 2130, 20: 2201, 21: 3000, 22: 3073, 23: 3145, 24: 3217, 25: 3289, 26: 3362, 27: 3434, 28: 3506, 29: 3579, 30: 3651, 31: 3724, 32: 3797, 33: 3870, 34: 3942, 35: 4015, 36: 4089, 37: 4162, 38: 4235, 39: 4308, 40: 4382, 41: 4972, 42: 5045, 43: 5119, 44: 5192, 45: 5266, 46: 5340, 47: 5414, 48: 5487, 49: 5562, 50: 5636, 51: 6399, 52: 6474, 53: 6547, 54: 6622, 55: 6697, 56: 6771, 57: 6846, 58: 6921, 59: 6995, 60: 7070, 61: 7662, 62: 7736, 63: 7812, 64: 7886, 65: 7962, 66: 8038, 67: 8112, 68: 8188, 69: 8263, 70: 8339, 71: 8931, 72: 9007, 73: 9083, 74: 9158, 75: 9235, 76: 9310, 77: 9387, 78: 9463, 79: 9539, 80: 9616, 81: 10209, 82: 10285, 83: 10362, 84: 10438, 85: 10515, 86: 10592, 87: 10668, 88: 10745, 89: 10822, 90: 10899 } },
    atk: { byLevel: { 1: 18, 2: 20, 3: 21, 4: 23, 5: 24, 6: 26, 7: 27, 8: 29, 9: 30, 10: 32, 11: 33, 12: 35, 13: 36, 14: 38, 15: 40, 16: 41, 17: 43, 18: 44, 19: 46, 20: 47, 21: 64, 22: 66, 23: 67, 24: 69, 25: 71, 26: 72, 27: 74, 28: 75, 29: 77, 30: 78, 31: 80, 32: 81, 33: 83, 34: 85, 35: 86, 36: 88, 37: 89, 38: 91, 39: 92, 40: 94, 41: 107, 42: 108, 43: 110, 44: 111, 45: 113, 46: 115, 47: 116, 48: 118, 49: 119, 50: 121, 51: 137, 52: 139, 53: 141, 54: 142, 55: 144, 56: 145, 57: 147, 58: 149, 59: 150, 60: 152, 61: 164, 62: 166, 63: 168, 64: 169, 65: 171, 66: 173, 67: 174, 68: 176, 69: 177, 70: 179, 71: 192, 72: 193, 73: 195, 74: 197, 75: 198, 76: 200, 77: 201, 78: 203, 79: 205, 80: 206, 81: 219, 82: 221, 83: 222, 84: 224, 85: 226, 86: 227, 87: 229, 88: 231, 89: 232, 90: 234 } },
    def: { byLevel: { 1: 53, 2: 57, 3: 61, 4: 66, 5: 70, 6: 75, 7: 79, 8: 83, 9: 88, 10: 92, 11: 97, 12: 101, 13: 105, 14: 110, 15: 114, 16: 119, 17: 123, 18: 128, 19: 132, 20: 137, 21: 186, 22: 191, 23: 195, 24: 200, 25: 204, 26: 209, 27: 213, 28: 218, 29: 222, 30: 227, 31: 231, 32: 236, 33: 240, 34: 245, 35: 249, 36: 254, 37: 258, 38: 263, 39: 267, 40: 272, 41: 309, 42: 313, 43: 318, 44: 322, 45: 327, 46: 331, 47: 336, 48: 341, 49: 345, 50: 350, 51: 397, 52: 402, 53: 406, 54: 411, 55: 416, 56: 420, 57: 425, 58: 429, 59: 434, 60: 439, 61: 475, 62: 480, 63: 485, 64: 489, 65: 494, 66: 499, 67: 503, 68: 508, 69: 513, 70: 517, 71: 554, 72: 559, 73: 564, 74: 568, 75: 573, 76: 578, 77: 582, 78: 587, 79: 592, 80: 597, 81: 634, 82: 638, 83: 643, 84: 648, 85: 652, 86: 657, 87: 662, 88: 667, 89: 672, 90: 676 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "cryo",
  },
  baseStats: {
    atk: 234,
    hp: 10899,
    def: 676,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { cryo: 0.28800000000000003 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "aloy-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aloy-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.2112, 0.2256, 0.24, 0.2592, 0.2736, 0.2904, 0.312, 0.3336, 0.3552, 0.3768, 0.3984, 0.42, 0.4416, 0.4632, 0.4848]) },
              { stat: "atk", table: talentTable([0.2376, 0.2538, 0.27, 0.2916, 0.3078, 0.3267, 0.351, 0.3753, 0.3996, 0.4239, 0.4482, 0.4725, 0.4968, 0.5211, 0.5454]) },
            ],
          },
        ],
      },
      {
        id: "aloy-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aloy-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4312, 0.4606, 0.49, 0.5292, 0.5586, 0.5929, 0.637, 0.6811, 0.7252, 0.7693, 0.8134, 0.8575, 0.9016, 0.9457, 0.9898]) },
            ],
          },
        ],
      },
      {
        id: "aloy-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aloy-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.528, 0.564, 0.6, 0.648, 0.684, 0.726, 0.78, 0.834, 0.888, 0.942, 0.996, 1.05, 1.104, 1.158, 1.212]) },
            ],
          },
        ],
      },
      {
        id: "aloy-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aloy-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65648, 0.70124, 0.746, 0.80568, 0.85044, 0.90266, 0.9698, 1.03694, 1.10408, 1.17122, 1.23836, 1.3055, 1.37264, 1.43978, 1.50692]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "aloy-charged",
      name: "Rapid Fire",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aloy-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "aloy-charged-2",
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
      id: "aloy-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aloy-plungeLow-1",
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
      id: "aloy-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aloy-plungeHigh-1",
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
      id: "aloy-skill",
      name: "Frozen Wilds",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      instances: [
        {
          id: "aloy-skill-1",
          name: "Freeze Bomb DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.776, 1.9092, 2.0424, 2.22, 2.3532, 2.4864, 2.664, 2.8416, 3.0192, 3.1968, 3.3744, 3.552, 3.774, 3.996, 4.218]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "aloy-skill-2",
          name: "Chillwater Bomblet DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.4, 0.43, 0.46, 0.5, 0.53, 0.56, 0.6, 0.64, 0.68, 0.72, 0.76, 0.8, 0.85, 0.9, 0.95]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "aloy-burst",
      name: "Prophecies of Dawn",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "aloy-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.592, 3.8614, 4.1308, 4.49, 4.7594, 5.0288, 5.388, 5.7472, 6.1064, 6.4656, 6.8248, 7.184, 7.633, 8.082, 8.531]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "aloy-a1", name: "Combat Override", unlockAscension: 1, effects: [] },
    { id: "aloy-a4", name: "Strong Strike", unlockAscension: 4, effects: [] },
    { id: "aloy-p3", name: "Easy Does It", effects: [] },
  ],
  constellations: [
    { level: 1, id: "aloy-c1", name: "Star of Another World", effects: [] },
    { level: 2, id: "aloy-c2", name: "Star of Another World", effects: [] },
    { level: 3, id: "aloy-c3", name: "Star of Another World", effects: [] },
    { level: 4, id: "aloy-c4", name: "Star of Another World", effects: [] },
    { level: 5, id: "aloy-c5", name: "Star of Another World", effects: [] },
    { level: 6, id: "aloy-c6", name: "Star of Another World", effects: [] },
  ],
  resources: [],
};

export const charlotte: GeneratedCharacter = {
  id: "charlotte",
  name: "Charlotte",
  element: "cryo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 903, 2: 978, 3: 1052, 4: 1127, 5: 1201, 6: 1275, 7: 1349, 8: 1424, 9: 1499, 10: 1573, 11: 1648, 12: 1722, 13: 1797, 14: 1871, 15: 1946, 16: 2021, 17: 2095, 18: 2170, 19: 2244, 20: 2319, 21: 3067, 22: 3142, 23: 3217, 24: 3291, 25: 3366, 26: 3440, 27: 3515, 28: 3589, 29: 3664, 30: 3738, 31: 3813, 32: 3888, 33: 3962, 34: 4037, 35: 4111, 36: 4186, 37: 4260, 38: 4335, 39: 4410, 40: 4484, 41: 5038, 42: 5112, 43: 5187, 44: 5261, 45: 5336, 46: 5410, 47: 5485, 48: 5559, 49: 5633, 50: 5708, 51: 6421, 52: 6496, 53: 6571, 54: 6645, 55: 6720, 56: 6794, 57: 6869, 58: 6943, 59: 7018, 60: 7093, 61: 7646, 62: 7721, 63: 7795, 64: 7870, 65: 7944, 66: 8019, 67: 8094, 68: 8168, 69: 8243, 70: 8317, 71: 8871, 72: 8945, 73: 9020, 74: 9095, 75: 9169, 76: 9244, 77: 9318, 78: 9392, 79: 9466, 80: 9541, 81: 10095, 82: 10169, 83: 10244, 84: 10318, 85: 10393, 86: 10467, 87: 10542, 88: 10616, 89: 10691, 90: 10766 } },
    atk: { byLevel: { 1: 15, 2: 16, 3: 17, 4: 18, 5: 19, 6: 21, 7: 22, 8: 23, 9: 24, 10: 25, 11: 27, 12: 28, 13: 29, 14: 30, 15: 31, 16: 32, 17: 34, 18: 35, 19: 36, 20: 37, 21: 49, 22: 51, 23: 52, 24: 53, 25: 54, 26: 55, 27: 57, 28: 58, 29: 59, 30: 60, 31: 61, 32: 63, 33: 64, 34: 65, 35: 66, 36: 67, 37: 68, 38: 70, 39: 71, 40: 72, 41: 81, 42: 82, 43: 83, 44: 85, 45: 86, 46: 87, 47: 88, 48: 89, 49: 91, 50: 92, 51: 103, 52: 104, 53: 106, 54: 107, 55: 108, 56: 109, 57: 110, 58: 112, 59: 113, 60: 114, 61: 123, 62: 124, 63: 125, 64: 127, 65: 128, 66: 129, 67: 130, 68: 131, 69: 133, 70: 134, 71: 143, 72: 144, 73: 145, 74: 146, 75: 147, 76: 149, 77: 150, 78: 151, 79: 152, 80: 153, 81: 162, 82: 164, 83: 165, 84: 166, 85: 167, 86: 168, 87: 170, 88: 171, 89: 172, 90: 173 } },
    def: { byLevel: { 1: 46, 2: 50, 3: 53, 4: 57, 5: 61, 6: 65, 7: 68, 8: 72, 9: 76, 10: 80, 11: 84, 12: 87, 13: 91, 14: 95, 15: 99, 16: 103, 17: 106, 18: 110, 19: 114, 20: 118, 21: 156, 22: 159, 23: 163, 24: 167, 25: 171, 26: 174, 27: 178, 28: 182, 29: 186, 30: 190, 31: 193, 32: 197, 33: 201, 34: 205, 35: 208, 36: 212, 37: 216, 38: 220, 39: 224, 40: 227, 41: 255, 42: 259, 43: 263, 44: 267, 45: 271, 46: 274, 47: 278, 48: 282, 49: 286, 50: 290, 51: 326, 52: 329, 53: 333, 54: 337, 55: 341, 56: 345, 57: 348, 58: 352, 59: 356, 60: 360, 61: 388, 62: 392, 63: 395, 64: 399, 65: 403, 66: 407, 67: 410, 68: 414, 69: 418, 70: 422, 71: 450, 72: 454, 73: 457, 74: 461, 75: 465, 76: 469, 77: 473, 78: 476, 79: 480, 80: 484, 81: 512, 82: 516, 83: 520, 84: 523, 85: 527, 86: 531, 87: 535, 88: 538, 89: 542, 90: 546 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 173,
    hp: 10766,
    def: 546,
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
        id: "charlotte-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "charlotte-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.498456, 0.53584, 0.573224, 0.62307, 0.660454, 0.697838, 0.747684, 0.79753, 0.847375, 0.897221, 0.947066, 0.996912, 1.059219, 1.121526, 1.183833]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "charlotte-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "charlotte-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.433752, 0.466283, 0.498815, 0.54219, 0.574721, 0.607253, 0.650628, 0.694003, 0.737378, 0.780754, 0.824129, 0.867504, 0.921723, 0.975942, 1.030161]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "charlotte-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "charlotte-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.646008, 0.694459, 0.742909, 0.80751, 0.855961, 0.904411, 0.969012, 1.033613, 1.098214, 1.162814, 1.227415, 1.292016, 1.372767, 1.453518, 1.534269]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "charlotte-charged",
      name: "Cool-Color Capture",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "charlotte-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.00512, 1.080504, 1.155888, 1.2564, 1.331784, 1.407168, 1.50768, 1.608192, 1.708704, 1.809216, 1.909728, 2.01024, 2.13588, 2.26152, 2.38716]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "charlotte-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "charlotte-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "charlotte-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "charlotte-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "charlotte-skill",
      name: "Framing: Freezing Point Composition",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 11, element: "cryo" },
      instances: [
        {
          id: "charlotte-skill-1",
          name: "Photo DMG (Tap)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "charlotte-skill-2",
          name: "\"Focused Impression\" Mark DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.406, 0.43645, 0.4669, 0.5075, 0.53795, 0.5684, 0.609, 0.6496, 0.6902, 0.7308, 0.7714, 0.812, 0.86275, 0.9135, 0.96425]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "charlotte-skill-3",
          name: "Photo DMG (Hold)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.392, 1.4964, 1.6008, 1.74, 1.8444, 1.9488, 2.088, 2.2272, 2.3664, 2.5056, 2.6448, 2.784, 2.958, 3.132, 3.306]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "charlotte-skill-4",
          name: "\"Snappy Silhouette\" Mark DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.392, 0.4214, 0.4508, 0.49, 0.5194, 0.5488, 0.588, 0.6272, 0.6664, 0.7056, 0.7448, 0.784, 0.833, 0.882, 0.931]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "charlotte-burst",
      name: "Still Photo: Comprehensive Confirmation",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "charlotte-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.77616, 0.834372, 0.892584, 0.9702, 1.028412, 1.086624, 1.16424, 1.241856, 1.319472, 1.397088, 1.474704, 1.55232, 1.64934, 1.74636, 1.84338]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "charlotte-burst-2",
          name: "Kamera DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.06468, 0.069531, 0.074382, 0.08085, 0.085701, 0.090552, 0.09702, 0.103488, 0.109956, 0.116424, 0.122892, 0.12936, 0.137445, 0.14553, 0.153615]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "charlotte-a1", name: "Moment of Impact", unlockAscension: 1, effects: [] },
    { id: "charlotte-a4", name: "Diversified Investigation", unlockAscension: 4, effects: [] },
    { id: "charlotte-p3", name: "First-Person Shutter", effects: [] },
  ],
  constellations: [
    { level: 1, id: "charlotte-c1", name: "A Need to Verify Facts", effects: [] },
    { level: 2, id: "charlotte-c2", name: "A Duty to Pursue Truth", effects: [] },
    { level: 3, id: "charlotte-c3", name: "An Imperative to Independence", effects: [], buffs: [{ id: "charlotte-c3", source: "An Imperative to Independence", sourceCharacterId: "charlotte", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "charlotte-c4", name: "A Responsibility to Oversee", effects: [] },
    { level: 5, id: "charlotte-c5", name: "A Principle of Conscience", effects: [], buffs: [{ id: "charlotte-c5", source: "A Principle of Conscience", sourceCharacterId: "charlotte", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "charlotte-c6", name: "A Summation of Interest", effects: [] },
  ],
  resources: [],
};

export const chongyun: GeneratedCharacter = {
  id: "chongyun",
  name: "Chongyun",
  element: "cryo",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 921, 2: 997, 3: 1073, 4: 1149, 5: 1225, 6: 1301, 7: 1377, 8: 1453, 9: 1530, 10: 1605, 11: 1682, 12: 1757, 13: 1834, 14: 1909, 15: 1985, 16: 2062, 17: 2137, 18: 2214, 19: 2289, 20: 2366, 21: 3129, 22: 3206, 23: 3282, 24: 3358, 25: 3434, 26: 3510, 27: 3586, 28: 3662, 29: 3738, 30: 3814, 31: 3890, 32: 3966, 33: 4042, 34: 4118, 35: 4194, 36: 4270, 37: 4346, 38: 4422, 39: 4499, 40: 4574, 41: 5139, 42: 5215, 43: 5291, 44: 5367, 45: 5443, 46: 5520, 47: 5595, 48: 5672, 49: 5747, 50: 5824, 51: 6551, 52: 6627, 53: 6704, 54: 6779, 55: 6856, 56: 6931, 57: 7008, 58: 7083, 59: 7160, 60: 7236, 61: 7800, 62: 7877, 63: 7952, 64: 8029, 65: 8104, 66: 8181, 67: 8257, 68: 8333, 69: 8409, 70: 8485, 71: 9050, 72: 9125, 73: 9202, 74: 9278, 75: 9354, 76: 9430, 77: 9506, 78: 9582, 79: 9658, 80: 9734, 81: 10299, 82: 10375, 83: 10451, 84: 10527, 85: 10603, 86: 10679, 87: 10755, 88: 10831, 89: 10907, 90: 10984 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 54, 2: 59, 3: 63, 4: 68, 5: 72, 6: 77, 7: 81, 8: 86, 9: 90, 10: 95, 11: 99, 12: 104, 13: 108, 14: 113, 15: 117, 16: 122, 17: 126, 18: 131, 19: 135, 20: 140, 21: 185, 22: 189, 23: 194, 24: 198, 25: 203, 26: 207, 27: 212, 28: 216, 29: 221, 30: 225, 31: 230, 32: 234, 33: 239, 34: 243, 35: 248, 36: 252, 37: 257, 38: 261, 39: 266, 40: 270, 41: 303, 42: 308, 43: 312, 44: 317, 45: 321, 46: 326, 47: 330, 48: 335, 49: 339, 50: 344, 51: 387, 52: 391, 53: 396, 54: 400, 55: 405, 56: 409, 57: 414, 58: 418, 59: 423, 60: 427, 61: 460, 62: 465, 63: 469, 64: 474, 65: 478, 66: 483, 67: 487, 68: 492, 69: 496, 70: 501, 71: 534, 72: 539, 73: 543, 74: 548, 75: 552, 76: 557, 77: 561, 78: 566, 79: 570, 80: 575, 81: 608, 82: 612, 83: 617, 84: 621, 85: 626, 86: 630, 87: 635, 88: 639, 89: 644, 90: 648 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 223,
    hp: 10984,
    def: 648,
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
        id: "chongyun-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chongyun-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70004, 0.75702, 0.814, 0.8954, 0.95238, 1.0175, 1.10704, 1.19658, 1.28612, 1.3838, 1.48148, 1.57916, 1.67684, 1.77452, 1.8722]) },
            ],
          },
        ],
      },
      {
        id: "chongyun-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chongyun-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.63124, 0.68262, 0.734, 0.8074, 0.85878, 0.9175, 0.99824, 1.07898, 1.15972, 1.2478, 1.33588, 1.42396, 1.51204, 1.60012, 1.6882]) },
            ],
          },
        ],
      },
      {
        id: "chongyun-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chongyun-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.80324, 0.86862, 0.934, 1.0274, 1.09278, 1.1675, 1.27024, 1.37298, 1.47572, 1.5878, 1.69988, 1.81196, 1.92404, 2.03612, 2.1482]) },
            ],
          },
        ],
      },
      {
        id: "chongyun-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chongyun-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.01222, 1.09461, 1.177, 1.2947, 1.37709, 1.47125, 1.60072, 1.73019, 1.85966, 2.0009, 2.14214, 2.28338, 2.42462, 2.56586, 2.7071]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "chongyun-charged",
      name: "Demonbane",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chongyun-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.562853, 0.608666, 0.65448, 0.719928, 0.765742, 0.8181, 0.890093, 0.962086, 1.034078, 1.112616, 1.191154, 1.269691, 1.348229, 1.426766, 1.505304]) },
          ],
        },
        {
          id: "chongyun-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.01781, 1.100655, 1.1835, 1.30185, 1.384695, 1.479375, 1.60956, 1.739745, 1.86993, 2.01195, 2.15397, 2.29599, 2.43801, 2.58003, 2.72205]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "chongyun-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chongyun-plungeLow-1",
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
      id: "chongyun-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chongyun-plungeHigh-1",
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
      id: "chongyun-skill",
      name: "Spirit Blade: Chonghua's Layered Frost",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "chongyun-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.7204, 1.84943, 1.97846, 2.1505, 2.27953, 2.40856, 2.5806, 2.75264, 2.92468, 3.09672, 3.26876, 3.4408, 3.65585, 3.8709, 4.08595]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "chongyun-burst",
      name: "Spirit Blade: Cloud-Parting Star",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "chongyun-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.424, 1.5308, 1.6376, 1.78, 1.8868, 1.9936, 2.136, 2.2784, 2.4208, 2.5632, 2.7056, 2.848, 3.026, 3.204, 3.382]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "chongyun-a1", name: "Steady Breathing", unlockAscension: 1, effects: [] },
    { id: "chongyun-a4", name: "Rimechaser Blade", unlockAscension: 4, effects: [] },
    { id: "chongyun-p3", name: "Gallant Journey", effects: [] },
  ],
  constellations: [
    { level: 1, id: "chongyun-c1", name: "Ice Unleashed", effects: [] },
    { level: 2, id: "chongyun-c2", name: "Atmospheric Revolution", effects: [] },
    { level: 3, id: "chongyun-c3", name: "Cloudburst", effects: [], buffs: [{ id: "chongyun-c3", source: "Cloudburst", sourceCharacterId: "chongyun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "chongyun-c4", name: "Frozen Skies", effects: [] },
    { level: 5, id: "chongyun-c5", name: "The True Path", effects: [], buffs: [{ id: "chongyun-c5", source: "The True Path", sourceCharacterId: "chongyun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "chongyun-c6", name: "Rally of Four Blades", effects: [] },
  ],
  resources: [],
};

export const citlali: GeneratedCharacter = {
  id: "citlali",
  name: "Citlali",
  element: "cryo",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 906, 2: 981, 3: 1056, 4: 1132, 5: 1207, 6: 1283, 7: 1358, 8: 1435, 9: 1511, 10: 1586, 11: 1662, 12: 1738, 13: 1814, 14: 1891, 15: 1967, 16: 2043, 17: 2120, 18: 2196, 19: 2273, 20: 2349, 21: 3203, 22: 3280, 23: 3357, 24: 3434, 25: 3511, 26: 3589, 27: 3666, 28: 3743, 29: 3820, 30: 3897, 31: 3975, 32: 4053, 33: 4131, 34: 4208, 35: 4286, 36: 4365, 37: 4443, 38: 4520, 39: 4598, 40: 4677, 41: 5307, 42: 5386, 43: 5464, 44: 5542, 45: 5621, 46: 5700, 47: 5779, 48: 5857, 49: 5937, 50: 6016, 51: 6830, 52: 6910, 53: 6989, 54: 7069, 55: 7148, 56: 7228, 57: 7308, 58: 7387, 59: 7467, 60: 7547, 61: 8178, 62: 8258, 63: 8338, 64: 8418, 65: 8499, 66: 8579, 67: 8659, 68: 8740, 69: 8820, 70: 8901, 71: 9533, 72: 9615, 73: 9695, 74: 9776, 75: 9857, 76: 9938, 77: 10020, 78: 10101, 79: 10183, 80: 10264, 81: 10897, 82: 10979, 83: 11060, 84: 11142, 85: 11223, 86: 11306, 87: 11387, 88: 11470, 89: 11552, 90: 11634 } },
    atk: { byLevel: { 1: 10, 2: 11, 3: 12, 4: 12, 5: 13, 6: 14, 7: 15, 8: 16, 9: 16, 10: 17, 11: 18, 12: 19, 13: 20, 14: 21, 15: 21, 16: 22, 17: 23, 18: 24, 19: 25, 20: 26, 21: 35, 22: 36, 23: 37, 24: 37, 25: 38, 26: 39, 27: 40, 28: 41, 29: 42, 30: 42, 31: 43, 32: 44, 33: 45, 34: 46, 35: 47, 36: 48, 37: 48, 38: 49, 39: 50, 40: 51, 41: 58, 42: 59, 43: 60, 44: 60, 45: 61, 46: 62, 47: 63, 48: 64, 49: 65, 50: 66, 51: 74, 52: 75, 53: 76, 54: 77, 55: 78, 56: 79, 57: 80, 58: 80, 59: 81, 60: 82, 61: 89, 62: 90, 63: 91, 64: 92, 65: 93, 66: 93, 67: 94, 68: 95, 69: 96, 70: 97, 71: 104, 72: 105, 73: 106, 74: 107, 75: 107, 76: 108, 77: 109, 78: 110, 79: 111, 80: 112, 81: 119, 82: 120, 83: 121, 84: 121, 85: 122, 86: 123, 87: 124, 88: 125, 89: 126, 90: 127 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 119, 14: 124, 15: 129, 16: 134, 17: 139, 18: 144, 19: 149, 20: 154, 21: 210, 22: 215, 23: 220, 24: 225, 25: 230, 26: 235, 27: 240, 28: 246, 29: 251, 30: 256, 31: 261, 32: 266, 33: 271, 34: 276, 35: 281, 36: 286, 37: 291, 38: 297, 39: 302, 40: 307, 41: 348, 42: 353, 43: 358, 44: 364, 45: 369, 46: 374, 47: 379, 48: 384, 49: 389, 50: 395, 51: 448, 52: 453, 53: 458, 54: 464, 55: 469, 56: 474, 57: 479, 58: 485, 59: 490, 60: 495, 61: 536, 62: 542, 63: 547, 64: 552, 65: 558, 66: 563, 67: 568, 68: 573, 69: 579, 70: 584, 71: 625, 72: 631, 73: 636, 74: 641, 75: 647, 76: 652, 77: 657, 78: 663, 79: 668, 80: 673, 81: 715, 82: 720, 83: 726, 84: 731, 85: 736, 86: 742, 87: 747, 88: 752, 89: 758, 90: 763 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 115],
  },
  baseStats: {
    atk: 127,
    hp: 11634,
    def: 763,
    elementalMastery: 115,
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
        id: "citlali-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "citlali-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.434072, 0.466627, 0.499183, 0.54259, 0.575145, 0.607701, 0.651108, 0.694515, 0.737922, 0.78133, 0.824737, 0.868144, 0.922403, 0.976662, 1.030921]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "citlali-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "citlali-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.388136, 0.417246, 0.446356, 0.48517, 0.51428, 0.54339, 0.582204, 0.621018, 0.659831, 0.698645, 0.737458, 0.776272, 0.824789, 0.873306, 0.921823]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "citlali-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "citlali-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.537712, 0.57804, 0.618369, 0.67214, 0.712468, 0.752797, 0.806568, 0.860339, 0.91411, 0.967882, 1.021653, 1.075424, 1.142638, 1.209852, 1.277066]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "citlali-charged",
      name: "Shadow-Stealing Spirit Vessel",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "citlali-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.992, 1.0664, 1.1408, 1.24, 1.3144, 1.3888, 1.488, 1.5872, 1.6864, 1.7856, 1.8848, 1.984, 2.108, 2.232, 2.356]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "citlali-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "citlali-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "citlali-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "citlali-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "citlali-skill",
      name: "Dawnfrost Darkstar",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 5, element: "cryo" },
      instances: [
        {
          id: "citlali-skill-1",
          name: "Obsidian Tzitzimitl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.7296, 0.78432, 0.83904, 0.912, 0.96672, 1.02144, 1.0944, 1.16736, 1.24032, 1.31328, 1.38624, 1.4592, 1.5504, 1.6416, 1.7328]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "citlali-skill-2",
          name: "Frostfall Storm DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.17024, 0.183008, 0.195776, 0.2128, 0.225568, 0.238336, 0.25536, 0.272384, 0.289408, 0.306432, 0.323456, 0.34048, 0.36176, 0.38304, 0.40432]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "citlali-burst",
      name: "Edict of Entwined Splendor",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "citlali-burst-1",
          name: "Ice Storm DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([5.376, 5.7792, 6.1824, 6.72, 7.1232, 7.5264, 8.064, 8.6016, 9.1392, 9.6768, 10.2144, 10.752, 11.424, 12.096, 12.768]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "citlali-burst-2",
          name: "Spiritvessel Skull DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.344, 1.4448, 1.5456, 1.68, 1.7808, 1.8816, 2.016, 2.1504, 2.2848, 2.4192, 2.5536, 2.688, 2.856, 3.024, 3.192]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "citlali-a1", name: "Mamaloaco's Frigid Rain", unlockAscension: 1, effects: [] },
    { id: "citlali-a4", name: "Itzpapalotl's Star Garments", unlockAscension: 4, effects: [] },
    { id: "citlali-p3", name: "Night Realm's Gift: Smoke, Mirrors, and the Flowing Winds", effects: [] },
    { id: "citlali-p4", name: "Songs of Profound Mystery", effects: [] },
  ],
  constellations: [
    { level: 1, id: "citlali-c1", name: "Radiant Blades of Centzon Mimixcoah", effects: [] },
    { level: 2, id: "citlali-c2", name: "Heart Devourer's Travail", effects: [] },
    { level: 3, id: "citlali-c3", name: "Cloud Serpent's Feathered Crown", effects: [], buffs: [{ id: "citlali-c3", source: "Cloud Serpent's Feathered Crown", sourceCharacterId: "citlali", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "citlali-c4", name: "Death Defier's Spirit Skull", effects: [] },
    { level: 5, id: "citlali-c5", name: "Nemontemi's Hex", effects: [], buffs: [{ id: "citlali-c5", source: "Nemontemi's Hex", sourceCharacterId: "citlali", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "citlali-c6", name: "Teoiztac's Secret Pact", effects: [] },
  ],
  resources: [],
};

export const diona: GeneratedCharacter = {
  id: "diona",
  name: "Diona",
  element: "cryo",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 802, 2: 869, 3: 935, 4: 1001, 5: 1067, 6: 1134, 7: 1200, 8: 1266, 9: 1333, 10: 1399, 11: 1465, 12: 1531, 13: 1598, 14: 1663, 15: 1730, 16: 1797, 17: 1862, 18: 1929, 19: 1995, 20: 2061, 21: 2727, 22: 2793, 23: 2860, 24: 2926, 25: 2992, 26: 3058, 27: 3124, 28: 3190, 29: 3257, 30: 3323, 31: 3389, 32: 3456, 33: 3522, 34: 3588, 35: 3654, 36: 3721, 37: 3786, 38: 3853, 39: 3920, 40: 3985, 41: 4478, 42: 4544, 43: 4610, 44: 4676, 45: 4743, 46: 4809, 47: 4875, 48: 4942, 49: 5008, 50: 5074, 51: 5708, 52: 5774, 53: 5841, 54: 5907, 55: 5973, 56: 6039, 57: 6106, 58: 6172, 59: 6238, 60: 6305, 61: 6796, 62: 6863, 63: 6929, 64: 6995, 65: 7061, 66: 7128, 67: 7194, 68: 7260, 69: 7327, 70: 7393, 71: 7885, 72: 7951, 73: 8017, 74: 8084, 75: 8150, 76: 8216, 77: 8282, 78: 8349, 79: 8415, 80: 8481, 81: 8974, 82: 9040, 83: 9106, 84: 9172, 85: 9239, 86: 9304, 87: 9371, 88: 9437, 89: 9503, 90: 9570 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 35, 14: 37, 15: 38, 16: 40, 17: 41, 18: 43, 19: 44, 20: 46, 21: 61, 22: 62, 23: 63, 24: 65, 25: 66, 26: 68, 27: 69, 28: 71, 29: 72, 30: 74, 31: 75, 32: 77, 33: 78, 34: 80, 35: 81, 36: 83, 37: 84, 38: 86, 39: 87, 40: 88, 41: 99, 42: 101, 43: 102, 44: 104, 45: 105, 46: 107, 47: 108, 48: 110, 49: 111, 50: 113, 51: 127, 52: 128, 53: 130, 54: 131, 55: 133, 56: 134, 57: 136, 58: 137, 59: 138, 60: 140, 61: 151, 62: 152, 63: 154, 64: 155, 65: 157, 66: 158, 67: 160, 68: 161, 69: 163, 70: 164, 71: 175, 72: 176, 73: 178, 74: 179, 75: 181, 76: 182, 77: 184, 78: 185, 79: 187, 80: 188, 81: 199, 82: 201, 83: 202, 84: 204, 85: 205, 86: 207, 87: 208, 88: 209, 89: 211, 90: 212 } },
    def: { byLevel: { 1: 50, 2: 55, 3: 59, 4: 63, 5: 67, 6: 71, 7: 75, 8: 79, 9: 84, 10: 88, 11: 92, 12: 96, 13: 100, 14: 104, 15: 109, 16: 113, 17: 117, 18: 121, 19: 125, 20: 129, 21: 171, 22: 175, 23: 179, 24: 184, 25: 188, 26: 192, 27: 196, 28: 200, 29: 204, 30: 209, 31: 213, 32: 217, 33: 221, 34: 225, 35: 229, 36: 234, 37: 238, 38: 242, 39: 246, 40: 250, 41: 281, 42: 285, 43: 289, 44: 293, 45: 298, 46: 302, 47: 306, 48: 310, 49: 314, 50: 318, 51: 358, 52: 362, 53: 367, 54: 371, 55: 375, 56: 379, 57: 383, 58: 387, 59: 392, 60: 396, 61: 427, 62: 431, 63: 435, 64: 439, 65: 443, 66: 447, 67: 452, 68: 456, 69: 460, 70: 464, 71: 495, 72: 499, 73: 503, 74: 507, 75: 511, 76: 516, 77: 520, 78: 524, 79: 528, 80: 532, 81: 563, 82: 567, 83: 572, 84: 576, 85: 580, 86: 584, 87: 588, 88: 592, 89: 596, 90: 601 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "cryo",
  },
  baseStats: {
    atk: 212,
    hp: 9570,
    def: 601,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { cryo: 0.24 },
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "diona-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diona-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3612, 0.3906, 0.42, 0.462, 0.4914, 0.525, 0.5712, 0.6174, 0.6636, 0.714, 0.77175, 0.839664, 0.907578, 0.975492, 1.04958]) },
            ],
          },
        ],
      },
      {
        id: "diona-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diona-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3354, 0.3627, 0.39, 0.429, 0.4563, 0.4875, 0.5304, 0.5733, 0.6162, 0.663, 0.716625, 0.779688, 0.842751, 0.905814, 0.97461]) },
            ],
          },
        ],
      },
      {
        id: "diona-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diona-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4558, 0.4929, 0.53, 0.583, 0.6201, 0.6625, 0.7208, 0.7791, 0.8374, 0.901, 0.973875, 1.059576, 1.145277, 1.230978, 1.32447]) },
            ],
          },
        ],
      },
      {
        id: "diona-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diona-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.43, 0.465, 0.5, 0.55, 0.585, 0.625, 0.68, 0.735, 0.79, 0.85, 0.91875, 0.9996, 1.08045, 1.1613, 1.2495]) },
            ],
          },
        ],
      },
      {
        id: "diona-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "diona-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5375, 0.58125, 0.625, 0.6875, 0.73125, 0.78125, 0.85, 0.91875, 0.9875, 1.0625, 1.148438, 1.2495, 1.350562, 1.451625, 1.561875]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "diona-charged",
      name: "Kätzlein Style",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diona-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.937125, 1.019592, 1.102059, 1.184526, 1.27449]) },
          ],
        },
        {
          id: "diona-charged-2",
          name: "Fully-Charged Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.24, 1.333, 1.426, 1.55, 1.643, 1.736, 1.86, 1.984, 2.108, 2.232, 2.36096, 2.5296, 2.69824, 2.86688, 3.03552]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "diona-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diona-plungeLow-1",
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
      id: "diona-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "diona-plungeHigh-1",
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
      id: "diona-skill",
      name: "Icy Paws",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 1, element: "cryo" },
      instances: [
        {
          id: "diona-skill-1",
          name: "Icy Paw DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.4192, 0.45064, 0.48208, 0.524, 0.55544, 0.58688, 0.6288, 0.67072, 0.71264, 0.75456, 0.79648, 0.8384, 0.8908, 0.9432, 0.9956]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "diona-burst",
      name: "Signature Mix",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "diona-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.8, 0.86, 0.92, 1, 1.06, 1.12, 1.2, 1.28, 1.36, 1.44, 1.52, 1.6, 1.7, 1.8, 1.9]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "diona-burst-2",
          name: "Continuous Field DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.5264, 0.56588, 0.60536, 0.658, 0.69748, 0.73696, 0.7896, 0.84224, 0.89488, 0.94752, 1.00016, 1.0528, 1.1186, 1.1844, 1.2502]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "diona-a1", name: "Cat's Tail Secret Menu", unlockAscension: 1, effects: [] },
    { id: "diona-a4", name: "Drunkards' Farce", unlockAscension: 4, effects: [] },
    { id: "diona-p3", name: "Complimentary Bar Food", effects: [] },
    { id: "diona-p4", name: "Choice Treasures", effects: [] },
  ],
  constellations: [
    { level: 1, id: "diona-c1", name: "A Lingering Flavor", effects: [] },
    { level: 2, id: "diona-c2", name: "Shaken, Not Purred", effects: [] },
    { level: 3, id: "diona-c3", name: "A—Another Round?", effects: [], buffs: [{ id: "diona-c3", source: "A—Another Round?", sourceCharacterId: "diona", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "diona-c4", name: "Wine Industry Slayer", effects: [] },
    { level: 5, id: "diona-c5", name: "Double Shot, on the Rocks", effects: [], buffs: [{ id: "diona-c5", source: "Double Shot, on the Rocks", sourceCharacterId: "diona", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "diona-c6", name: "Cat's Tail Closing Time", effects: [] },
  ],
  resources: [],
};

export const escoffier: GeneratedCharacter = {
  id: "escoffier",
  name: "Escoffier",
  element: "cryo",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1125, 3: 1212, 4: 1299, 5: 1385, 6: 1472, 7: 1559, 8: 1646, 9: 1733, 10: 1819, 11: 1907, 12: 1994, 13: 2081, 14: 2170, 15: 2257, 16: 2344, 17: 2433, 18: 2520, 19: 2608, 20: 2695, 21: 3675, 22: 3763, 23: 3851, 24: 3940, 25: 4028, 26: 4117, 27: 4206, 28: 4294, 29: 4383, 30: 4472, 31: 4561, 32: 4650, 33: 4740, 34: 4828, 35: 4918, 36: 5008, 37: 5097, 38: 5187, 39: 5276, 40: 5366, 41: 6089, 42: 6179, 43: 6270, 44: 6359, 45: 6449, 46: 6540, 47: 6630, 48: 6721, 49: 6812, 50: 6902, 51: 7837, 52: 7928, 53: 8019, 54: 8110, 55: 8202, 56: 8293, 57: 8385, 58: 8476, 59: 8567, 60: 8659, 61: 9383, 62: 9475, 63: 9567, 64: 9659, 65: 9751, 66: 9844, 67: 9935, 68: 10028, 69: 10120, 70: 10213, 71: 10938, 72: 11032, 73: 11124, 74: 11217, 75: 11310, 76: 11403, 77: 11496, 78: 11590, 79: 11683, 80: 11777, 81: 12503, 82: 12597, 83: 12690, 84: 12784, 85: 12877, 86: 12972, 87: 13065, 88: 13160, 89: 13255, 90: 13348 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 34, 5: 36, 6: 38, 7: 40, 8: 43, 9: 45, 10: 47, 11: 50, 12: 52, 13: 54, 14: 56, 15: 59, 16: 61, 17: 63, 18: 65, 19: 68, 20: 70, 21: 95, 22: 98, 23: 100, 24: 102, 25: 105, 26: 107, 27: 109, 28: 112, 29: 114, 30: 116, 31: 119, 32: 121, 33: 123, 34: 125, 35: 128, 36: 130, 37: 132, 38: 135, 39: 137, 40: 139, 41: 158, 42: 161, 43: 163, 44: 165, 45: 168, 46: 170, 47: 172, 48: 175, 49: 177, 50: 179, 51: 204, 52: 206, 53: 208, 54: 211, 55: 213, 56: 215, 57: 218, 58: 220, 59: 223, 60: 225, 61: 244, 62: 246, 63: 249, 64: 251, 65: 253, 66: 256, 67: 258, 68: 261, 69: 263, 70: 265, 71: 284, 72: 287, 73: 289, 74: 291, 75: 294, 76: 296, 77: 299, 78: 301, 79: 304, 80: 306, 81: 325, 82: 327, 83: 330, 84: 332, 85: 335, 86: 337, 87: 339, 88: 342, 89: 344, 90: 347 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 66, 4: 71, 5: 76, 6: 81, 7: 85, 8: 90, 9: 95, 10: 100, 11: 105, 12: 109, 13: 114, 14: 119, 15: 124, 16: 128, 17: 133, 18: 138, 19: 143, 20: 148, 21: 201, 22: 206, 23: 211, 24: 216, 25: 221, 26: 226, 27: 231, 28: 235, 29: 240, 30: 245, 31: 250, 32: 255, 33: 260, 34: 265, 35: 270, 36: 275, 37: 279, 38: 284, 39: 289, 40: 294, 41: 334, 42: 339, 43: 344, 44: 349, 45: 354, 46: 358, 47: 363, 48: 368, 49: 373, 50: 378, 51: 430, 52: 435, 53: 440, 54: 445, 55: 450, 56: 455, 57: 460, 58: 465, 59: 470, 60: 475, 61: 514, 62: 519, 63: 524, 64: 529, 65: 535, 66: 540, 67: 545, 68: 550, 69: 555, 70: 560, 71: 600, 72: 605, 73: 610, 74: 615, 75: 620, 76: 625, 77: 630, 78: 635, 79: 640, 80: 646, 81: 685, 82: 690, 83: 696, 84: 701, 85: 706, 86: 711, 87: 716, 88: 721, 89: 727, 90: 732 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 347,
    hp: 13348,
    def: 732,
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
        id: "escoffier-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "escoffier-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.51551, 0.55747, 0.59943, 0.659373, 0.701333, 0.749287, 0.815225, 0.881162, 0.947099, 1.019031, 1.090963, 1.162894, 1.234826, 1.306757, 1.378689]) },
            ],
          },
        ],
      },
      {
        id: "escoffier-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "escoffier-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.475933, 0.514671, 0.55341, 0.608751, 0.64749, 0.691762, 0.752638, 0.813513, 0.874388, 0.940797, 1.007206, 1.073615, 1.140025, 1.206434, 1.272843]) },
            ],
          },
        ],
      },
      {
        id: "escoffier-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "escoffier-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.329995, 0.356855, 0.383715, 0.422087, 0.448947, 0.479644, 0.521852, 0.564061, 0.60627, 0.652316, 0.698361, 0.744407, 0.790453, 0.836499, 0.882544]) },
              { stat: "atk", table: talentTable([0.403327, 0.436156, 0.468985, 0.515884, 0.548712, 0.586231, 0.63782, 0.689408, 0.740996, 0.797274, 0.853553, 0.909831, 0.966109, 1.022387, 1.078666]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "escoffier-charged",
      name: "Kitchen Skills",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "escoffier-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.15412, 1.24806, 1.342, 1.4762, 1.57014, 1.6775, 1.82512, 1.97274, 2.12036, 2.2814, 2.44244, 2.60348, 2.76452, 2.92556, 3.0866]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "escoffier-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "escoffier-plungeLow-1",
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
      id: "escoffier-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "escoffier-plungeHigh-1",
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
      id: "escoffier-skill",
      name: "Low-Temperature Cooking",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "escoffier-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.504, 0.5418, 0.5796, 0.63, 0.6678, 0.7056, 0.756, 0.8064, 0.8568, 0.9072, 0.9576, 1.008, 1.071, 1.134, 1.197]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "escoffier-skill-2",
          name: "Frosty Parfait DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2, 1.29, 1.38, 1.5, 1.59, 1.68, 1.8, 1.92, 2.04, 2.16, 2.28, 2.4, 2.55, 2.7, 2.85]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "escoffier-skill-3",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.336, 0.3612, 0.3864, 0.42, 0.4452, 0.4704, 0.504, 0.5376, 0.5712, 0.6048, 0.6384, 0.672, 0.714, 0.756, 0.798]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "escoffier-burst",
      name: "Scoring Cuts",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "escoffier-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([5.928, 6.3726, 6.8172, 7.41, 7.8546, 8.2992, 8.892, 9.4848, 10.0776, 10.6704, 11.2632, 11.856, 12.597, 13.338, 14.079]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "escoffier-a1", name: "Better to Salivate Than Medicate", unlockAscension: 1, effects: [] },
    { id: "escoffier-a4", name: "Inspiration-Immersed Seasoning", unlockAscension: 4, effects: [] },
    { id: "escoffier-p3", name: "Constant Off-the-Cuff Cookery", effects: [] },
  ],
  constellations: [
    { level: 1, id: "escoffier-c1", name: "Pre-Dinner Dance for Your Taste Buds", effects: [] },
    { level: 2, id: "escoffier-c2", name: "Fresh, Fragrant Stew Is an Art", effects: [] },
    { level: 3, id: "escoffier-c3", name: "The Bakery Magic of Caramel Browning", effects: [], buffs: [{ id: "escoffier-c3", source: "The Bakery Magic of Caramel Browning", sourceCharacterId: "escoffier", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "escoffier-c4", name: "Secret Rosemary Recipe", effects: [] },
    { level: 5, id: "escoffier-c5", name: "Symphony of a Thousand Sauces", effects: [], buffs: [{ id: "escoffier-c5", source: "Symphony of a Thousand Sauces", sourceCharacterId: "escoffier", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "escoffier-c6", name: "Tea Parties Bursting With Color", effects: [] },
  ],
  resources: [],
};

export const eula: GeneratedCharacter = {
  id: "eula",
  name: "Eula",
  element: "cryo",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1030, 2: 1115, 3: 1200, 4: 1287, 5: 1372, 6: 1459, 7: 1544, 8: 1631, 9: 1717, 10: 1803, 11: 1889, 12: 1976, 13: 2062, 14: 2150, 15: 2236, 16: 2323, 17: 2410, 18: 2497, 19: 2584, 20: 2671, 21: 3641, 22: 3729, 23: 3816, 24: 3904, 25: 3991, 26: 4080, 27: 4167, 28: 4255, 29: 4343, 30: 4431, 31: 4519, 32: 4608, 33: 4696, 34: 4784, 35: 4872, 36: 4962, 37: 5051, 38: 5139, 39: 5228, 40: 5317, 41: 6033, 42: 6123, 43: 6212, 44: 6301, 45: 6390, 46: 6480, 47: 6569, 48: 6659, 49: 6750, 50: 6839, 51: 7765, 52: 7856, 53: 7945, 54: 8036, 55: 8126, 56: 8217, 57: 8308, 58: 8398, 59: 8489, 60: 8579, 61: 9297, 62: 9388, 63: 9480, 64: 9570, 65: 9662, 66: 9753, 67: 9844, 68: 9936, 69: 10027, 70: 10119, 71: 10838, 72: 10930, 73: 11022, 74: 11114, 75: 11206, 76: 11298, 77: 11391, 78: 11483, 79: 11576, 80: 11669, 81: 12389, 82: 12481, 83: 12574, 84: 12667, 85: 12759, 86: 12853, 87: 12946, 88: 13039, 89: 13133, 90: 13226 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 33, 5: 35, 6: 38, 7: 40, 8: 42, 9: 44, 10: 47, 11: 49, 12: 51, 13: 53, 14: 56, 15: 58, 16: 60, 17: 62, 18: 65, 19: 67, 20: 69, 21: 94, 22: 96, 23: 99, 24: 101, 25: 103, 26: 106, 27: 108, 28: 110, 29: 112, 30: 115, 31: 117, 32: 119, 33: 121, 34: 124, 35: 126, 36: 128, 37: 131, 38: 133, 39: 135, 40: 138, 41: 156, 42: 158, 43: 161, 44: 163, 45: 165, 46: 168, 47: 170, 48: 172, 49: 175, 50: 177, 51: 201, 52: 203, 53: 205, 54: 208, 55: 210, 56: 212, 57: 215, 58: 217, 59: 220, 60: 222, 61: 240, 62: 243, 63: 245, 64: 247, 65: 250, 66: 252, 67: 255, 68: 257, 69: 259, 70: 262, 71: 280, 72: 283, 73: 285, 74: 287, 75: 290, 76: 292, 77: 295, 78: 297, 79: 299, 80: 302, 81: 320, 82: 323, 83: 325, 84: 328, 85: 330, 86: 332, 87: 335, 88: 337, 89: 340, 90: 342 } },
    def: { byLevel: { 1: 58, 2: 63, 3: 68, 4: 73, 5: 78, 6: 83, 7: 88, 8: 93, 9: 98, 10: 102, 11: 107, 12: 112, 13: 117, 14: 122, 15: 127, 16: 132, 17: 137, 18: 142, 19: 147, 20: 152, 21: 207, 22: 212, 23: 217, 24: 222, 25: 227, 26: 232, 27: 237, 28: 242, 29: 247, 30: 252, 31: 257, 32: 262, 33: 267, 34: 272, 35: 277, 36: 282, 37: 287, 38: 292, 39: 297, 40: 302, 41: 343, 42: 348, 43: 353, 44: 358, 45: 363, 46: 368, 47: 373, 48: 378, 49: 383, 50: 388, 51: 441, 52: 446, 53: 451, 54: 456, 55: 461, 56: 467, 57: 472, 58: 477, 59: 482, 60: 487, 61: 528, 62: 533, 63: 538, 64: 543, 65: 549, 66: 554, 67: 559, 68: 564, 69: 569, 70: 574, 71: 615, 72: 621, 73: 626, 74: 631, 75: 636, 76: 641, 77: 647, 78: 652, 79: 657, 80: 662, 81: 703, 82: 709, 83: 714, 84: 719, 85: 724, 86: 730, 87: 735, 88: 740, 89: 746, 90: 751 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 342,
    hp: 13226,
    def: 751,
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
        id: "eula-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "eula-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.897324, 0.970362, 1.0434, 1.14774, 1.220778, 1.30425, 1.419024, 1.533798, 1.648572, 1.77378, 1.917248, 2.085965, 2.254683, 2.423401, 2.607457]) },
            ],
          },
        ],
      },
      {
        id: "eula-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "eula-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.935508, 1.011654, 1.0878, 1.19658, 1.272726, 1.35975, 1.479408, 1.599066, 1.718724, 1.84926, 1.998833, 2.17473, 2.350627, 2.526524, 2.718412]) },
            ],
          },
        ],
      },
      {
        id: "eula-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "eula-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.567987, 0.614219, 0.66045, 0.726495, 0.772726, 0.825562, 0.898212, 0.970861, 1.043511, 1.122765, 1.213577, 1.320372, 1.427166, 1.533961, 1.650465]) },
              { stat: "atk", table: talentTable([0.567987, 0.614219, 0.66045, 0.726495, 0.772726, 0.825562, 0.898212, 0.970861, 1.043511, 1.122765, 1.213577, 1.320372, 1.427166, 1.533961, 1.650465]) },
            ],
          },
        ],
      },
      {
        id: "eula-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "eula-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.126428, 1.218114, 1.3098, 1.44078, 1.532466, 1.63725, 1.781328, 1.925406, 2.069484, 2.22666, 2.406758, 2.618552, 2.830347, 3.042141, 3.27319]) },
            ],
          },
        ],
      },
      {
        id: "eula-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "eula-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.718336, 0.776806, 0.835275, 0.918803, 0.977272, 1.044094, 1.135974, 1.227854, 1.319735, 1.419968, 1.534818, 1.669882, 1.804946, 1.94001, 2.087352]) },
              { stat: "atk", table: talentTable([0.718336, 0.776806, 0.835275, 0.918803, 0.977272, 1.044094, 1.135974, 1.227854, 1.319735, 1.419968, 1.534818, 1.669882, 1.804946, 1.94001, 2.087352]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "eula-charged",
      name: "Favonius Bladework - Edel",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "eula-charged-1",
          name: "Charged Attack Spinning DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.688, 0.744, 0.8, 0.88, 0.936, 1, 1.088, 1.176, 1.264, 1.36, 1.47, 1.59936, 1.72872, 1.85808, 1.9992]) },
          ],
        },
        {
          id: "eula-charged-2",
          name: "Charged Attack Final DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.24399, 1.345245, 1.4465, 1.59115, 1.692405, 1.808125, 1.96724, 2.126355, 2.28547, 2.45905, 2.657944, 2.891843, 3.125742, 3.359641, 3.614804]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "eula-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "eula-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.49144, 1.612836, 1.734233, 1.907656, 2.029052, 2.167791, 2.358556, 2.549322, 2.740087, 2.948195, 3.186652, 3.467078, 3.747503, 4.027928, 4.333847]) },
          ],
        },
      ],
    },
  plungeHigh:
    {
      id: "eula-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "eula-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.862889, 2.01452, 2.16615, 2.382765, 2.534396, 2.707688, 2.945964, 3.184241, 3.422517, 3.682455, 3.980301, 4.330567, 4.680834, 5.0311, 5.413209]) },
          ],
        },
      ],
    },
  skill:
    {
      id: "eula-skill",
      name: "Icetide Vortex",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(4),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "eula-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.464, 1.5738, 1.6836, 1.83, 1.9398, 2.0496, 2.196, 2.3424, 2.4888, 2.6352, 2.7816, 2.928, 3.111, 3.294, 3.477]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "eula-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.456, 2.6402, 2.8244, 3.07, 3.2542, 3.4384, 3.684, 3.9296, 4.1752, 4.4208, 4.6664, 4.912, 5.219, 5.526, 5.833]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "eula-skill-3",
          name: "Icewhirl Brand DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "eula-burst",
      name: "Glacial Illumination",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "eula-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.456, 2.6402, 2.8244, 3.07, 3.2542, 3.4384, 3.684, 3.9296, 4.1752, 4.4208, 4.6664, 4.912, 5.219, 5.526, 5.833]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "eula-burst-2",
          name: "Lightfall Sword Base DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.67048, 3.96924, 4.268, 4.6948, 4.99356, 5.335, 5.80448, 6.27396, 6.74344, 7.2556, 7.84245, 8.532586, 9.222721, 9.912857, 10.665732]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "eula-burst-3",
          name: "DMG Per Stack",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.74992, 0.81096, 0.872, 0.9592, 1.02024, 1.09, 1.18592, 1.28184, 1.37776, 1.4824, 1.6023, 1.743302, 1.884305, 2.025307, 2.179128]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "eula-a1", name: "Roiling Rime", unlockAscension: 1, effects: [] },
    { id: "eula-a4", name: "Wellspring of War-Lust", unlockAscension: 4, effects: [] },
    { id: "eula-p3", name: "Aristocratic Introspection", effects: [] },
  ],
  constellations: [
    { level: 1, id: "eula-c1", name: "Tidal Illusion", effects: [] },
    { level: 2, id: "eula-c2", name: "Lady of Seafoam", effects: [] },
    { level: 3, id: "eula-c3", name: "Lawrence Pedigree", effects: [], buffs: [{ id: "eula-c3", source: "Lawrence Pedigree", sourceCharacterId: "eula", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "eula-c4", name: "The Obstinacy of One's Inferiors", effects: [] },
    { level: 5, id: "eula-c5", name: "Chivalric Quality", effects: [], buffs: [{ id: "eula-c5", source: "Chivalric Quality", sourceCharacterId: "eula", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "eula-c6", name: "Noble Obligation", effects: [] },
  ],
  resources: [],
};

export const freminet: GeneratedCharacter = {
  id: "freminet",
  name: "Freminet",
  element: "cryo",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1012, 2: 1096, 3: 1179, 4: 1263, 5: 1346, 6: 1430, 7: 1513, 8: 1597, 9: 1681, 10: 1764, 11: 1848, 12: 1931, 13: 2015, 14: 2098, 15: 2182, 16: 2266, 17: 2349, 18: 2433, 19: 2516, 20: 2600, 21: 3439, 22: 3523, 23: 3607, 24: 3690, 25: 3774, 26: 3857, 27: 3941, 28: 4024, 29: 4108, 30: 4191, 31: 4275, 32: 4359, 33: 4442, 34: 4526, 35: 4609, 36: 4693, 37: 4776, 38: 4860, 39: 4944, 40: 5027, 41: 5648, 42: 5731, 43: 5815, 44: 5898, 45: 5982, 46: 6066, 47: 6149, 48: 6233, 49: 6316, 50: 6400, 51: 7200, 52: 7284, 53: 7368, 54: 7451, 55: 7535, 56: 7618, 57: 7702, 58: 7785, 59: 7869, 60: 7953, 61: 8573, 62: 8657, 63: 8740, 64: 8824, 65: 8907, 66: 8991, 67: 9075, 68: 9158, 69: 9242, 70: 9325, 71: 9946, 72: 10029, 73: 10113, 74: 10197, 75: 10280, 76: 10364, 77: 10447, 78: 10531, 79: 10614, 80: 10698, 81: 11319, 82: 11402, 83: 11486, 84: 11569, 85: 11653, 86: 11736, 87: 11820, 88: 11903, 89: 11987, 90: 12071 } },
    atk: { byLevel: { 1: 21, 2: 23, 3: 25, 4: 27, 5: 28, 6: 30, 7: 32, 8: 34, 9: 35, 10: 37, 11: 39, 12: 41, 13: 43, 14: 44, 15: 46, 16: 48, 17: 50, 18: 51, 19: 53, 20: 55, 21: 73, 22: 74, 23: 76, 24: 78, 25: 80, 26: 81, 27: 83, 28: 85, 29: 87, 30: 88, 31: 90, 32: 92, 33: 94, 34: 96, 35: 97, 36: 99, 37: 101, 38: 103, 39: 104, 40: 106, 41: 119, 42: 121, 43: 123, 44: 125, 45: 126, 46: 128, 47: 130, 48: 132, 49: 133, 50: 135, 51: 152, 52: 154, 53: 156, 54: 157, 55: 159, 56: 161, 57: 163, 58: 164, 59: 166, 60: 168, 61: 181, 62: 183, 63: 185, 64: 186, 65: 188, 66: 190, 67: 192, 68: 193, 69: 195, 70: 197, 71: 210, 72: 212, 73: 214, 74: 215, 75: 217, 76: 219, 77: 221, 78: 222, 79: 224, 80: 226, 81: 239, 82: 241, 83: 243, 84: 244, 85: 246, 86: 248, 87: 250, 88: 251, 89: 253, 90: 255 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 108, 12: 113, 13: 118, 14: 123, 15: 128, 16: 133, 17: 138, 18: 143, 19: 148, 20: 153, 21: 202, 22: 207, 23: 212, 24: 217, 25: 222, 26: 226, 27: 231, 28: 236, 29: 241, 30: 246, 31: 251, 32: 256, 33: 261, 34: 266, 35: 271, 36: 275, 37: 280, 38: 285, 39: 290, 40: 295, 41: 332, 42: 336, 43: 341, 44: 346, 45: 351, 46: 356, 47: 361, 48: 366, 49: 371, 50: 376, 51: 423, 52: 427, 53: 432, 54: 437, 55: 442, 56: 447, 57: 452, 58: 457, 59: 462, 60: 467, 61: 503, 62: 508, 63: 513, 64: 518, 65: 523, 66: 528, 67: 533, 68: 537, 69: 542, 70: 547, 71: 584, 72: 589, 73: 594, 74: 598, 75: 603, 76: 608, 77: 613, 78: 618, 79: 623, 80: 628, 81: 664, 82: 669, 83: 674, 84: 679, 85: 684, 86: 689, 87: 694, 88: 699, 89: 704, 90: 708 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 255,
    hp: 12071,
    def: 708,
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
        id: "freminet-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "freminet-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.842379, 0.910944, 0.97951, 1.077461, 1.146027, 1.224387, 1.332134, 1.43988, 1.547626, 1.665167, 1.782708, 1.900249, 2.017791, 2.135332, 2.252873]) },
            ],
          },
        ],
      },
      {
        id: "freminet-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "freminet-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.806757, 0.872424, 0.93809, 1.031899, 1.097565, 1.172613, 1.275802, 1.378992, 1.482182, 1.594753, 1.707324, 1.819895, 1.932465, 2.045036, 2.157607]) },
            ],
          },
        ],
      },
      {
        id: "freminet-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "freminet-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.01904, 1.101985, 1.18493, 1.303423, 1.386368, 1.481162, 1.611505, 1.741847, 1.872189, 2.014381, 2.156573, 2.298764, 2.440956, 2.583147, 2.725339]) },
            ],
          },
        ],
      },
      {
        id: "freminet-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "freminet-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.238047, 1.338819, 1.43959, 1.583549, 1.68432, 1.799487, 1.957842, 2.116197, 2.274552, 2.447303, 2.620054, 2.792805, 2.965555, 3.138306, 3.311057]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "freminet-charged",
      name: "Flowing Eddies",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "freminet-charged-1",
          name: "Charged Attack Cyclic DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.62522, 0.67611, 0.727, 0.7997, 0.85059, 0.90875, 0.98872, 1.06869, 1.14866, 1.2359, 1.32314, 1.41038, 1.49762, 1.58486, 1.6721]) },
          ],
        },
        {
          id: "freminet-charged-2",
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
      id: "freminet-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "freminet-plungeLow-1",
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
      id: "freminet-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "freminet-plungeHigh-1",
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
      id: "freminet-skill",
      name: "Pressurized Floe",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "freminet-skill-1",
          name: "Upward Thrust DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.8304, 0.89268, 0.95496, 1.038, 1.10028, 1.16256, 1.2456, 1.32864, 1.41168, 1.49472, 1.57776, 1.6608, 1.7646, 1.8684, 1.9722]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-2",
          name: "Frost DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.0716, 0.07697, 0.08234, 0.0895, 0.09487, 0.10024, 0.1074, 0.11456, 0.12172, 0.12888, 0.13604, 0.1432, 0.15215, 0.1611, 0.17005]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-3",
          name: "Spiritbreath Thorn DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.144, 0.1548, 0.1656, 0.18, 0.1908, 0.2016, 0.216, 0.2304, 0.2448, 0.2592, 0.2736, 0.288, 0.306, 0.324, 0.342]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-4",
          name: "Level 0 Shattering Pressure DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.0048, 2.15516, 2.30552, 2.506, 2.65636, 2.80672, 3.0072, 3.20768, 3.40816, 3.60864, 3.80912, 4.0096, 4.2602, 4.5108, 4.7614]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-5",
          name: "Level 1 Shattering Pressure DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.0024, 1.07758, 1.15276, 1.253, 1.32818, 1.40336, 1.5036, 1.60384, 1.70408, 1.80432, 1.90456, 2.0048, 2.1301, 2.2554, 2.3807]) },
            { stat: "atk", table: talentTable([0.48688, 0.523396, 0.559912, 0.6086, 0.645116, 0.681632, 0.73032, 0.779008, 0.827696, 0.876384, 0.925072, 0.97376, 1.03462, 1.09548, 1.15634]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-6",
          name: "Level 2 Shattering Pressure DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.70168, 0.754306, 0.806932, 0.8771, 0.929726, 0.982352, 1.05252, 1.122688, 1.192856, 1.263024, 1.333192, 1.40336, 1.49107, 1.57878, 1.66649]) },
            { stat: "atk", table: talentTable([0.85204, 0.915943, 0.979846, 1.06505, 1.128953, 1.192856, 1.27806, 1.363264, 1.448468, 1.533672, 1.618876, 1.70408, 1.810585, 1.91709, 2.023595]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-7",
          name: "Level 3 Shattering Pressure DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.40096, 0.431032, 0.461104, 0.5012, 0.531272, 0.561344, 0.60144, 0.641536, 0.681632, 0.721728, 0.761824, 0.80192, 0.85204, 0.90216, 0.95228]) },
            { stat: "atk", table: talentTable([1.2172, 1.30849, 1.39978, 1.5215, 1.61279, 1.70408, 1.8258, 1.94752, 2.06924, 2.19096, 2.31268, 2.4344, 2.58655, 2.7387, 2.89085]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "freminet-skill-8",
          name: "Level 4 Shattering Pressure DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.4344, 2.61698, 2.79956, 3.043, 3.22558, 3.40816, 3.6516, 3.89504, 4.13848, 4.38192, 4.62536, 4.8688, 5.1731, 5.4774, 5.7817]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "freminet-burst",
      name: "Shadowhunter's Ambush",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "freminet-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.184, 3.4228, 3.6616, 3.98, 4.2188, 4.4576, 4.776, 5.0944, 5.4128, 5.7312, 6.0496, 6.368, 6.766, 7.164, 7.562]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "freminet-a1", name: "Saturation Deep Dive", unlockAscension: 1, effects: [] },
    { id: "freminet-a4", name: "Parallel Condensers", unlockAscension: 4, effects: [] },
    { id: "freminet-p3", name: "Deepwater Navigation", effects: [] },
  ],
  constellations: [
    { level: 1, id: "freminet-c1", name: "Dreams of the Foamy Deep", effects: [] },
    { level: 2, id: "freminet-c2", name: "Penguins and the Land of Plenty", effects: [] },
    { level: 3, id: "freminet-c3", name: "Song of the Eddies and Bleached Sands", effects: [], buffs: [{ id: "freminet-c3", source: "Song of the Eddies and Bleached Sands", sourceCharacterId: "freminet", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "freminet-c4", name: "Dance of the Snowy Moon and Flute", effects: [] },
    { level: 5, id: "freminet-c5", name: "Nights of Hearth and Happiness", effects: [], buffs: [{ id: "freminet-c5", source: "Nights of Hearth and Happiness", sourceCharacterId: "freminet", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "freminet-c6", name: "Moment of Waking and Resolve", effects: [] },
  ],
  resources: [],
};

export const ganyu: GeneratedCharacter = {
  id: "ganyu",
  name: "Ganyu",
  element: "cryo",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 763, 2: 826, 3: 889, 4: 953, 5: 1017, 6: 1081, 7: 1144, 8: 1208, 9: 1272, 10: 1335, 11: 1399, 12: 1464, 13: 1528, 14: 1592, 15: 1656, 16: 1721, 17: 1785, 18: 1849, 19: 1914, 20: 1978, 21: 2697, 22: 2762, 23: 2827, 24: 2892, 25: 2956, 26: 3022, 27: 3087, 28: 3152, 29: 3217, 30: 3282, 31: 3348, 32: 3413, 33: 3479, 34: 3544, 35: 3609, 36: 3676, 37: 3741, 38: 3807, 39: 3872, 40: 3939, 41: 4469, 42: 4535, 43: 4602, 44: 4667, 45: 4734, 46: 4800, 47: 4866, 48: 4933, 49: 5000, 50: 5066, 51: 5752, 52: 5819, 53: 5885, 54: 5952, 55: 6020, 56: 6087, 57: 6154, 58: 6221, 59: 6288, 60: 6355, 61: 6887, 62: 6954, 63: 7022, 64: 7089, 65: 7157, 66: 7225, 67: 7292, 68: 7360, 69: 7428, 70: 7495, 71: 8028, 72: 8097, 73: 8164, 74: 8232, 75: 8301, 76: 8369, 77: 8438, 78: 8506, 79: 8575, 80: 8643, 81: 9177, 82: 9245, 83: 9314, 84: 9383, 85: 9451, 86: 9521, 87: 9589, 88: 9659, 89: 9728, 90: 9797 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 33, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 46, 11: 48, 12: 50, 13: 52, 14: 54, 15: 57, 16: 59, 17: 61, 18: 63, 19: 65, 20: 68, 21: 92, 22: 94, 23: 97, 24: 99, 25: 101, 26: 103, 27: 106, 28: 108, 29: 110, 30: 112, 31: 114, 32: 117, 33: 119, 34: 121, 35: 123, 36: 126, 37: 128, 38: 130, 39: 132, 40: 135, 41: 153, 42: 155, 43: 157, 44: 160, 45: 162, 46: 164, 47: 166, 48: 169, 49: 171, 50: 173, 51: 197, 52: 199, 53: 201, 54: 203, 55: 206, 56: 208, 57: 210, 58: 213, 59: 215, 60: 217, 61: 235, 62: 238, 63: 240, 64: 242, 65: 245, 66: 247, 67: 249, 68: 252, 69: 254, 70: 256, 71: 274, 72: 277, 73: 279, 74: 281, 75: 284, 76: 286, 77: 288, 78: 291, 79: 293, 80: 295, 81: 314, 82: 316, 83: 318, 84: 321, 85: 323, 86: 325, 87: 328, 88: 330, 89: 333, 90: 335 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 70, 7: 74, 8: 78, 9: 82, 10: 86, 11: 90, 12: 94, 13: 98, 14: 102, 15: 107, 16: 111, 17: 115, 18: 119, 19: 123, 20: 127, 21: 173, 22: 178, 23: 182, 24: 186, 25: 190, 26: 194, 27: 199, 28: 203, 29: 207, 30: 211, 31: 215, 32: 220, 33: 224, 34: 228, 35: 232, 36: 236, 37: 241, 38: 245, 39: 249, 40: 253, 41: 287, 42: 292, 43: 296, 44: 300, 45: 305, 46: 309, 47: 313, 48: 317, 49: 322, 50: 326, 51: 370, 52: 374, 53: 379, 54: 383, 55: 387, 56: 392, 57: 396, 58: 400, 59: 405, 60: 409, 61: 443, 62: 447, 63: 452, 64: 456, 65: 460, 66: 465, 67: 469, 68: 473, 69: 478, 70: 482, 71: 516, 72: 521, 73: 525, 74: 530, 75: 534, 76: 538, 77: 543, 78: 547, 79: 552, 80: 556, 81: 590, 82: 595, 83: 599, 84: 604, 85: 608, 86: 612, 87: 617, 88: 621, 89: 626, 90: 630 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 335,
    hp: 9797,
    def: 630,
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
        id: "ganyu-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.31734, 0.34317, 0.369, 0.4059, 0.43173, 0.46125, 0.50184, 0.54243, 0.58302, 0.6273, 0.678037, 0.737705, 0.797372, 0.857039, 0.922131]) },
            ],
          },
        ],
      },
      {
        id: "ganyu-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.35604, 0.38502, 0.414, 0.4554, 0.48438, 0.5175, 0.56304, 0.60858, 0.65412, 0.7038, 0.760725, 0.827669, 0.894613, 0.961556, 1.034586]) },
            ],
          },
        ],
      },
      {
        id: "ganyu-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.45494, 0.49197, 0.529, 0.5819, 0.61893, 0.66125, 0.71944, 0.77763, 0.83582, 0.8993, 0.972038, 1.057577, 1.143116, 1.228655, 1.321971]) },
            ],
          },
        ],
      },
      {
        id: "ganyu-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.45494, 0.49197, 0.529, 0.5819, 0.61893, 0.66125, 0.71944, 0.77763, 0.83582, 0.8993, 0.972038, 1.057577, 1.143116, 1.228655, 1.321971]) },
            ],
          },
        ],
      },
      {
        id: "ganyu-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.48246, 0.52173, 0.561, 0.6171, 0.65637, 0.70125, 0.76296, 0.82467, 0.88638, 0.9537, 1.030838, 1.121551, 1.212265, 1.302979, 1.401939]) },
            ],
          },
        ],
      },
      {
        id: "ganyu-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ganyu-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5762, 0.6231, 0.67, 0.737, 0.7839, 0.8375, 0.9112, 0.9849, 1.0586, 1.139, 1.231125, 1.339464, 1.447803, 1.556142, 1.67433]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "ganyu-charged",
      name: "Liutian Archery",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ganyu-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "ganyu-charged-2",
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
      id: "ganyu-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ganyu-plungeLow-1",
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
      id: "ganyu-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ganyu-plungeHigh-1",
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
      id: "ganyu-skill",
      name: "Trail of the Qilin",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "ganyu-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.32, 1.419, 1.518, 1.65, 1.749, 1.848, 1.98, 2.112, 2.244, 2.376, 2.508, 2.64, 2.805, 2.97, 3.135]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "ganyu-burst",
      name: "Celestial Shower",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "ganyu-burst-1",
          name: "Ice Shard DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.70272, 0.755424, 0.808128, 0.8784, 0.931104, 0.983808, 1.05408, 1.124352, 1.194624, 1.264896, 1.335168, 1.40544, 1.49328, 1.58112, 1.66896]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "ganyu-a1", name: "Undivided Heart", unlockAscension: 1, effects: [] },
    { id: "ganyu-a4", name: "Harmony Between Heaven and Earth", unlockAscension: 4, effects: [] },
    { id: "ganyu-p3", name: "Preserved for the Hunt", effects: [] },
  ],
  constellations: [
    { level: 1, id: "ganyu-c1", name: "Dew-Drinker", effects: [] },
    { level: 2, id: "ganyu-c2", name: "The Auspicious", effects: [] },
    { level: 3, id: "ganyu-c3", name: "Cloud-Strider", effects: [], buffs: [{ id: "ganyu-c3", source: "Cloud-Strider", sourceCharacterId: "ganyu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "ganyu-c4", name: "Westward Sojourn", effects: [] },
    { level: 5, id: "ganyu-c5", name: "The Merciful", effects: [], buffs: [{ id: "ganyu-c5", source: "The Merciful", sourceCharacterId: "ganyu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "ganyu-c6", name: "The Clement", effects: [] },
  ],
  resources: [],
};

export const kaeya: GeneratedCharacter = {
  id: "kaeya",
  name: "Kaeya",
  element: "cryo",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 976, 2: 1057, 3: 1137, 4: 1218, 5: 1298, 6: 1379, 7: 1459, 8: 1540, 9: 1620, 10: 1700, 11: 1781, 12: 1861, 13: 1942, 14: 2022, 15: 2103, 16: 2184, 17: 2264, 18: 2345, 19: 2425, 20: 2506, 21: 3315, 22: 3396, 23: 3477, 24: 3557, 25: 3638, 26: 3718, 27: 3799, 28: 3879, 29: 3960, 30: 4040, 31: 4121, 32: 4202, 33: 4282, 34: 4363, 35: 4443, 36: 4524, 37: 4604, 38: 4685, 39: 4766, 40: 4846, 41: 5445, 42: 5525, 43: 5606, 44: 5686, 45: 5767, 46: 5848, 47: 5928, 48: 6009, 49: 6089, 50: 6170, 51: 6940, 52: 7021, 53: 7102, 54: 7182, 55: 7263, 56: 7343, 57: 7424, 58: 7504, 59: 7585, 60: 7666, 61: 8264, 62: 8345, 63: 8425, 64: 8506, 65: 8586, 66: 8667, 67: 8748, 68: 8828, 69: 8909, 70: 8989, 71: 9588, 72: 9668, 73: 9749, 74: 9830, 75: 9910, 76: 9990, 77: 10070, 78: 10151, 79: 10231, 80: 10312, 81: 10911, 82: 10991, 83: 11072, 84: 11152, 85: 11233, 86: 11313, 87: 11394, 88: 11474, 89: 11555, 90: 11636 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 66, 2: 72, 3: 77, 4: 83, 5: 88, 6: 94, 7: 99, 8: 105, 9: 110, 10: 116, 11: 121, 12: 127, 13: 132, 14: 138, 15: 143, 16: 149, 17: 154, 18: 160, 19: 165, 20: 171, 21: 226, 22: 231, 23: 237, 24: 242, 25: 248, 26: 253, 27: 258, 28: 264, 29: 269, 30: 275, 31: 280, 32: 286, 33: 291, 34: 297, 35: 302, 36: 308, 37: 313, 38: 319, 39: 324, 40: 330, 41: 370, 42: 376, 43: 381, 44: 387, 45: 392, 46: 398, 47: 403, 48: 409, 49: 414, 50: 420, 51: 472, 52: 478, 53: 483, 54: 489, 55: 494, 56: 500, 57: 505, 58: 511, 59: 516, 60: 522, 61: 562, 62: 568, 63: 573, 64: 579, 65: 584, 66: 590, 67: 595, 68: 601, 69: 606, 70: 612, 71: 652, 72: 658, 73: 663, 74: 669, 75: 674, 76: 680, 77: 685, 78: 691, 79: 696, 80: 702, 81: 742, 82: 748, 83: 753, 84: 759, 85: 764, 86: 770, 87: 775, 88: 781, 89: 786, 90: 792 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.267],
  },
  baseStats: {
    atk: 223,
    hp: 11636,
    def: 792,
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
        id: "kaeya-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaeya-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5375, 0.58125, 0.625, 0.6875, 0.73125, 0.78125, 0.85, 0.91875, 0.9875, 1.0625, 1.148438, 1.2495, 1.350562, 1.451625, 1.561875]) },
            ],
          },
        ],
      },
      {
        id: "kaeya-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaeya-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.51686, 0.55893, 0.601, 0.6611, 0.70317, 0.75125, 0.81736, 0.88347, 0.94958, 1.0217, 1.104337, 1.201519, 1.298701, 1.395883, 1.501899]) },
            ],
          },
        ],
      },
      {
        id: "kaeya-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaeya-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65274, 0.70587, 0.759, 0.8349, 0.88803, 0.94875, 1.03224, 1.11573, 1.19922, 1.2903, 1.394662, 1.517393, 1.640123, 1.762853, 1.896741]) },
            ],
          },
        ],
      },
      {
        id: "kaeya-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaeya-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70864, 0.76632, 0.824, 0.9064, 0.96408, 1.03, 1.12064, 1.21128, 1.30192, 1.4008, 1.5141, 1.647341, 1.780582, 1.913822, 2.059176]) },
            ],
          },
        ],
      },
      {
        id: "kaeya-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaeya-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.88236, 0.95418, 1.026, 1.1286, 1.20042, 1.2825, 1.39536, 1.50822, 1.62108, 1.7442, 1.885275, 2.051179, 2.217083, 2.382988, 2.563974]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kaeya-charged",
      name: "Ceremonial Bladework",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaeya-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.5504, 0.5952, 0.64, 0.704, 0.7488, 0.8, 0.8704, 0.9408, 1.0112, 1.088, 1.176, 1.279488, 1.382976, 1.486464, 1.59936]) },
            { stat: "atk", table: talentTable([0.731, 0.7905, 0.85, 0.935, 0.9945, 1.0625, 1.156, 1.2495, 1.343, 1.445, 1.561875, 1.69932, 1.836765, 1.97421, 2.12415]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kaeya-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaeya-plungeLow-1",
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
      id: "kaeya-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaeya-plungeHigh-1",
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
      id: "kaeya-skill",
      name: "Frostgnaw",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "kaeya-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.912, 2.0554, 2.1988, 2.39, 2.5334, 2.6768, 2.868, 3.0592, 3.2504, 3.4416, 3.6328, 3.824, 4.063, 4.302, 4.541]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kaeya-burst",
      name: "Glacial Waltz",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "kaeya-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.776, 0.8342, 0.8924, 0.97, 1.0282, 1.0864, 1.164, 1.2416, 1.3192, 1.3968, 1.4744, 1.552, 1.649, 1.746, 1.843]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kaeya-a1", name: "Cold-Blooded Strike", unlockAscension: 1, effects: [] },
    { id: "kaeya-a4", name: "Glacial Heart", unlockAscension: 4, effects: [] },
    { id: "kaeya-p3", name: "Hidden Strength", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kaeya-c1", name: "Excellent Blood", effects: [] },
    { level: 2, id: "kaeya-c2", name: "Never-Ending Performance", effects: [] },
    { level: 3, id: "kaeya-c3", name: "Dance of Frost", effects: [], buffs: [{ id: "kaeya-c3", source: "Dance of Frost", sourceCharacterId: "kaeya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kaeya-c4", name: "Frozen Kiss", effects: [] },
    { level: 5, id: "kaeya-c5", name: "Frostbiting Embrace", effects: [], buffs: [{ id: "kaeya-c5", source: "Frostbiting Embrace", sourceCharacterId: "kaeya", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kaeya-c6", name: "Glacial Whirlwind", effects: [] },
  ],
  resources: [],
};

export const kamisatoAyaka: GeneratedCharacter = {
  id: "kamisato-ayaka",
  name: "Kamisato Ayaka",
  element: "cryo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1001, 2: 1084, 3: 1167, 4: 1251, 5: 1334, 6: 1418, 7: 1501, 8: 1586, 9: 1670, 10: 1753, 11: 1837, 12: 1921, 13: 2005, 14: 2090, 15: 2174, 16: 2258, 17: 2343, 18: 2427, 19: 2512, 20: 2597, 21: 3540, 22: 3625, 23: 3710, 24: 3795, 25: 3880, 26: 3966, 27: 4051, 28: 4136, 29: 4223, 30: 4308, 31: 4394, 32: 4480, 33: 4566, 34: 4651, 35: 4737, 36: 4824, 37: 4910, 38: 4996, 39: 5082, 40: 5170, 41: 5865, 42: 5952, 43: 6040, 44: 6126, 45: 6213, 46: 6300, 47: 6387, 48: 6474, 49: 6562, 50: 6649, 51: 7549, 52: 7637, 53: 7725, 54: 7813, 55: 7901, 56: 7989, 57: 8077, 58: 8165, 59: 8253, 60: 8341, 61: 9039, 62: 9127, 63: 9216, 64: 9304, 65: 9393, 66: 9482, 67: 9571, 68: 9660, 69: 9749, 70: 9838, 71: 10537, 72: 10627, 73: 10716, 74: 10805, 75: 10895, 76: 10984, 77: 11074, 78: 11164, 79: 11254, 80: 11345, 81: 12044, 82: 12134, 83: 12225, 84: 12315, 85: 12405, 86: 12496, 87: 12586, 88: 12677, 89: 12768, 90: 12858 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 33, 5: 35, 6: 38, 7: 40, 8: 42, 9: 44, 10: 47, 11: 49, 12: 51, 13: 53, 14: 56, 15: 58, 16: 60, 17: 62, 18: 65, 19: 67, 20: 69, 21: 94, 22: 96, 23: 99, 24: 101, 25: 103, 26: 106, 27: 108, 28: 110, 29: 112, 30: 115, 31: 117, 32: 119, 33: 121, 34: 124, 35: 126, 36: 128, 37: 131, 38: 133, 39: 135, 40: 138, 41: 156, 42: 158, 43: 161, 44: 163, 45: 165, 46: 168, 47: 170, 48: 172, 49: 175, 50: 177, 51: 201, 52: 203, 53: 205, 54: 208, 55: 210, 56: 212, 57: 215, 58: 217, 59: 220, 60: 222, 61: 240, 62: 243, 63: 245, 64: 247, 65: 250, 66: 252, 67: 255, 68: 257, 69: 259, 70: 262, 71: 280, 72: 283, 73: 285, 74: 287, 75: 290, 76: 292, 77: 295, 78: 297, 79: 299, 80: 302, 81: 320, 82: 323, 83: 325, 84: 328, 85: 330, 86: 332, 87: 335, 88: 337, 89: 340, 90: 342 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 133, 16: 138, 17: 143, 18: 148, 19: 153, 20: 158, 21: 216, 22: 221, 23: 226, 24: 231, 25: 237, 26: 242, 27: 247, 28: 252, 29: 257, 30: 263, 31: 268, 32: 273, 33: 278, 34: 284, 35: 289, 36: 294, 37: 299, 38: 305, 39: 310, 40: 315, 41: 358, 42: 363, 43: 368, 44: 373, 45: 379, 46: 384, 47: 389, 48: 395, 49: 400, 50: 405, 51: 460, 52: 466, 53: 471, 54: 476, 55: 482, 56: 487, 57: 492, 58: 498, 59: 503, 60: 509, 61: 551, 62: 556, 63: 562, 64: 567, 65: 573, 66: 578, 67: 583, 68: 589, 69: 594, 70: 600, 71: 642, 72: 648, 73: 653, 74: 659, 75: 664, 76: 670, 77: 675, 78: 681, 79: 686, 80: 692, 81: 734, 82: 740, 83: 745, 84: 751, 85: 756, 86: 762, 87: 767, 88: 773, 89: 778, 90: 784 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 342,
    hp: 12858,
    def: 784,
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
        id: "kamisato-ayaka-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayaka-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.457253, 0.494472, 0.53169, 0.584859, 0.622077, 0.664613, 0.723098, 0.781584, 0.84007, 0.903873, 0.967676, 1.031479, 1.095281, 1.159084, 1.222887]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayaka-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayaka-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.486846, 0.526473, 0.5661, 0.62271, 0.662337, 0.707625, 0.769896, 0.832167, 0.894438, 0.96237, 1.030302, 1.098234, 1.166166, 1.234098, 1.30203]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayaka-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayaka-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.626218, 0.677189, 0.72816, 0.800976, 0.851947, 0.9102, 0.990298, 1.070395, 1.150493, 1.237872, 1.325251, 1.41263, 1.50001, 1.587389, 1.674768]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayaka-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayaka-na-4-1-1",
            name: "4-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.226464, 0.244897, 0.26333, 0.289663, 0.308096, 0.329163, 0.358129, 0.387095, 0.416061, 0.447661, 0.479261, 0.51086, 0.54246, 0.574059, 0.605659]) },
            ],
          },
          {
            id: "kamisato-ayaka-na-4-1-2",
            name: "4-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.226464, 0.244897, 0.26333, 0.289663, 0.308096, 0.329163, 0.358129, 0.387095, 0.416061, 0.447661, 0.479261, 0.51086, 0.54246, 0.574059, 0.605659]) },
            ],
          },
          {
            id: "kamisato-ayaka-na-4-1-3",
            name: "4-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.226464, 0.244897, 0.26333, 0.289663, 0.308096, 0.329163, 0.358129, 0.387095, 0.416061, 0.447661, 0.479261, 0.51086, 0.54246, 0.574059, 0.605659]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayaka-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayaka-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.781817, 0.845454, 0.90909, 0.999999, 1.063635, 1.136363, 1.236362, 1.336362, 1.436362, 1.545453, 1.654544, 1.763635, 1.872725, 1.981816, 2.090907]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kamisato-ayaka-charged",
      name: "Kamisato Art: Kabuki",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayaka-charged-1-1",
          name: "Charged Attack DMG (1/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.55126, 0.59613, 0.641, 0.7051, 0.74997, 0.80125, 0.87176, 0.94227, 1.01278, 1.0897, 1.16662, 1.24354, 1.32046, 1.39738, 1.4743]) },
          ],
        },
        {
          id: "kamisato-ayaka-charged-1-2",
          name: "Charged Attack DMG (2/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.55126, 0.59613, 0.641, 0.7051, 0.74997, 0.80125, 0.87176, 0.94227, 1.01278, 1.0897, 1.16662, 1.24354, 1.32046, 1.39738, 1.4743]) },
          ],
        },
        {
          id: "kamisato-ayaka-charged-1-3",
          name: "Charged Attack DMG (3/3)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.55126, 0.59613, 0.641, 0.7051, 0.74997, 0.80125, 0.87176, 0.94227, 1.01278, 1.0897, 1.16662, 1.24354, 1.32046, 1.39738, 1.4743]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kamisato-ayaka-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayaka-plungeLow-1",
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
      id: "kamisato-ayaka-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayaka-plungeHigh-1",
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
      id: "kamisato-ayaka-skill",
      name: "Kamisato Art: Hyouka",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 2, element: "cryo" },
      instances: [
        {
          id: "kamisato-ayaka-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.392, 2.5714, 2.7508, 2.99, 3.1694, 3.3488, 3.588, 3.8272, 4.0664, 4.3056, 4.5448, 4.784, 5.083, 5.382, 5.681]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kamisato-ayaka-burst",
      name: "Kamisato Art: Soumetsu",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "kamisato-ayaka-burst-1",
          name: "Cutting DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.123, 1.207225, 1.29145, 1.40375, 1.487975, 1.5722, 1.6845, 1.7968, 1.9091, 2.0214, 2.1337, 2.246, 2.386375, 2.52675, 2.667125]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "kamisato-ayaka-burst-2",
          name: "Bloom DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.6845, 1.810837, 1.937175, 2.105625, 2.231962, 2.3583, 2.52675, 2.6952, 2.86365, 3.0321, 3.20055, 3.369, 3.579562, 3.790125, 4.000687]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kamisato-ayaka-a1", name: "Amatsumi Kunitsumi Sanctification", unlockAscension: 1, effects: [] },
    { id: "kamisato-ayaka-a4", name: "Kanten Senmyou Blessing", unlockAscension: 4, effects: [] },
    { id: "kamisato-ayaka-p3", name: "Fruits of Shinsa", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kamisato-ayaka-c1", name: "Snowswept Sakura", effects: [] },
    { level: 2, id: "kamisato-ayaka-c2", name: "Blizzard Blade Seki no To", effects: [] },
    { level: 3, id: "kamisato-ayaka-c3", name: "Frostbloom Kamifubuki", effects: [], buffs: [{ id: "kamisato-ayaka-c3", source: "Frostbloom Kamifubuki", sourceCharacterId: "kamisato-ayaka", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "kamisato-ayaka-c4", name: "Ebb and Flow", effects: [] },
    { level: 5, id: "kamisato-ayaka-c5", name: "Blossom Cloud Irutsuki", effects: [], buffs: [{ id: "kamisato-ayaka-c5", source: "Blossom Cloud Irutsuki", sourceCharacterId: "kamisato-ayaka", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "kamisato-ayaka-c6", name: "Dance of Suigetsu", effects: [] },
  ],
  resources: [],
};

export const layla: GeneratedCharacter = {
  id: "layla",
  name: "Layla",
  element: "cryo",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 930, 2: 1007, 3: 1083, 4: 1161, 5: 1237, 6: 1314, 7: 1390, 8: 1468, 9: 1545, 10: 1621, 11: 1698, 12: 1774, 13: 1852, 14: 1928, 15: 2005, 16: 2082, 17: 2159, 18: 2236, 19: 2312, 20: 2389, 21: 3160, 22: 3237, 23: 3315, 24: 3391, 25: 3468, 26: 3544, 27: 3622, 28: 3698, 29: 3775, 30: 3851, 31: 3928, 32: 4006, 33: 4082, 34: 4159, 35: 4235, 36: 4313, 37: 4389, 38: 4466, 39: 4543, 40: 4619, 41: 5190, 42: 5267, 43: 5344, 44: 5420, 45: 5497, 46: 5574, 47: 5651, 48: 5728, 49: 5804, 50: 5881, 51: 6616, 52: 6693, 53: 6770, 54: 6846, 55: 6924, 56: 7000, 57: 7077, 58: 7153, 59: 7231, 60: 7308, 61: 7878, 62: 7955, 63: 8031, 64: 8108, 65: 8185, 66: 8262, 67: 8339, 68: 8415, 69: 8492, 70: 8569, 71: 9140, 72: 9216, 73: 9293, 74: 9370, 75: 9446, 76: 9524, 77: 9600, 78: 9677, 79: 9753, 80: 9831, 81: 10401, 82: 10478, 83: 10555, 84: 10631, 85: 10708, 86: 10785, 87: 10862, 88: 10938, 89: 11015, 90: 11092 } },
    atk: { byLevel: { 1: 18, 2: 20, 3: 21, 4: 23, 5: 24, 6: 26, 7: 27, 8: 29, 9: 30, 10: 32, 11: 33, 12: 35, 13: 36, 14: 38, 15: 39, 16: 41, 17: 42, 18: 44, 19: 45, 20: 47, 21: 62, 22: 63, 23: 65, 24: 66, 25: 68, 26: 69, 27: 71, 28: 72, 29: 74, 30: 75, 31: 77, 32: 78, 33: 80, 34: 81, 35: 83, 36: 84, 37: 86, 38: 87, 39: 89, 40: 90, 41: 101, 42: 103, 43: 104, 44: 106, 45: 107, 46: 109, 47: 110, 48: 112, 49: 113, 50: 115, 51: 129, 52: 131, 53: 132, 54: 134, 55: 135, 56: 137, 57: 138, 58: 140, 59: 141, 60: 143, 61: 154, 62: 155, 63: 157, 64: 158, 65: 160, 66: 161, 67: 163, 68: 164, 69: 166, 70: 167, 71: 179, 72: 180, 73: 182, 74: 183, 75: 184, 76: 186, 77: 187, 78: 189, 79: 190, 80: 192, 81: 203, 82: 205, 83: 206, 84: 208, 85: 209, 86: 211, 87: 212, 88: 214, 89: 215, 90: 217 } },
    def: { byLevel: { 1: 55, 2: 59, 3: 64, 4: 69, 5: 73, 6: 78, 7: 82, 8: 87, 9: 91, 10: 96, 11: 100, 12: 105, 13: 109, 14: 114, 15: 118, 16: 123, 17: 128, 18: 132, 19: 137, 20: 141, 21: 187, 22: 191, 23: 196, 24: 200, 25: 205, 26: 209, 27: 214, 28: 218, 29: 223, 30: 227, 31: 232, 32: 237, 33: 241, 34: 246, 35: 250, 36: 255, 37: 259, 38: 264, 39: 268, 40: 273, 41: 307, 42: 311, 43: 316, 44: 320, 45: 325, 46: 329, 47: 334, 48: 338, 49: 343, 50: 347, 51: 391, 52: 395, 53: 400, 54: 404, 55: 409, 56: 413, 57: 418, 58: 423, 59: 427, 60: 432, 61: 465, 62: 470, 63: 474, 64: 479, 65: 483, 66: 488, 67: 493, 68: 497, 69: 502, 70: 506, 71: 540, 72: 544, 73: 549, 74: 553, 75: 558, 76: 563, 77: 567, 78: 572, 79: 576, 80: 581, 81: 614, 82: 619, 83: 623, 84: 628, 85: 633, 86: 637, 87: 642, 88: 646, 89: 651, 90: 655 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 217,
    hp: 11092,
    def: 655,
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
        id: "layla-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "layla-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.512173, 0.553862, 0.59555, 0.655105, 0.696793, 0.744438, 0.809948, 0.875459, 0.940969, 1.012435, 1.083901, 1.155367, 1.226833, 1.298299, 1.369765]) },
            ],
          },
        ],
      },
      {
        id: "layla-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "layla-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.484834, 0.524297, 0.56376, 0.620136, 0.659599, 0.7047, 0.766714, 0.828727, 0.890741, 0.958392, 1.026043, 1.093694, 1.161346, 1.228997, 1.296648]) },
            ],
          },
        ],
      },
      {
        id: "layla-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "layla-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.729736, 0.789133, 0.84853, 0.933383, 0.99278, 1.060663, 1.154001, 1.247339, 1.340677, 1.442501, 1.544325, 1.646148, 1.747972, 1.849795, 1.951619]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "layla-charged",
      name: "Sword of the Radiant Path",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "layla-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4773, 0.51615, 0.555, 0.6105, 0.64935, 0.69375, 0.7548, 0.81585, 0.8769, 0.9435, 1.0101, 1.0767, 1.1433, 1.2099, 1.2765]) },
            { stat: "atk", table: talentTable([0.52546, 0.56823, 0.611, 0.6721, 0.71487, 0.76375, 0.83096, 0.89817, 0.96538, 1.0387, 1.11202, 1.18534, 1.25866, 1.33198, 1.4053]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "layla-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "layla-plungeLow-1",
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
      id: "layla-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "layla-plungeHigh-1",
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
      id: "layla-skill",
      name: "Nights of Formal Focus",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "layla-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.128, 0.1376, 0.1472, 0.16, 0.1696, 0.1792, 0.192, 0.2048, 0.2176, 0.2304, 0.2432, 0.256, 0.272, 0.288, 0.304]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "layla-skill-2",
          name: "Shooting Star DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.1472, 0.15824, 0.16928, 0.184, 0.19504, 0.20608, 0.2208, 0.23552, 0.25024, 0.26496, 0.27968, 0.2944, 0.3128, 0.3312, 0.3496]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "layla-burst",
      name: "Dream of the Star-Stream Shaker",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "layla-burst-1",
          name: "Starlight Slug DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "hp", table: talentTable([0.046488, 0.049975, 0.053461, 0.05811, 0.061597, 0.065083, 0.069732, 0.074381, 0.07903, 0.083678, 0.088327, 0.092976, 0.098787, 0.104598, 0.110409]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "layla-a1", name: "Like Nascent Light", unlockAscension: 1, effects: [] },
    { id: "layla-a4", name: "Sweet Slumber Undisturbed", unlockAscension: 4, effects: [] },
    { id: "layla-p3", name: "Shadowy Dream-Signs", effects: [] },
  ],
  constellations: [
    { level: 1, id: "layla-c1", name: "Fortress of Fantasy", effects: [] },
    { level: 2, id: "layla-c2", name: "Light's Remit", effects: [] },
    { level: 3, id: "layla-c3", name: "Secrets of the Night", effects: [], buffs: [{ id: "layla-c3", source: "Secrets of the Night", sourceCharacterId: "layla", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "layla-c4", name: "Starry Illumination", effects: [] },
    { level: 5, id: "layla-c5", name: "Stream of Consciousness", effects: [], buffs: [{ id: "layla-c5", source: "Stream of Consciousness", sourceCharacterId: "layla", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "layla-c6", name: "Radiant Soulfire", effects: [] },
  ],
  resources: [],
};

export const lohen: GeneratedCharacter = {
  id: "lohen",
  name: "Lohen",
  element: "cryo",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1001, 2: 1084, 3: 1167, 4: 1251, 5: 1334, 6: 1418, 7: 1501, 8: 1586, 9: 1670, 10: 1753, 11: 1837, 12: 1921, 13: 2005, 14: 2090, 15: 2174, 16: 2258, 17: 2343, 18: 2427, 19: 2512, 20: 2597, 21: 3540, 22: 3625, 23: 3710, 24: 3795, 25: 3880, 26: 3966, 27: 4051, 28: 4136, 29: 4223, 30: 4308, 31: 4394, 32: 4480, 33: 4566, 34: 4651, 35: 4737, 36: 4824, 37: 4910, 38: 4996, 39: 5082, 40: 5170, 41: 5865, 42: 5952, 43: 6040, 44: 6126, 45: 6213, 46: 6300, 47: 6387, 48: 6474, 49: 6562, 50: 6649, 51: 7549, 52: 7637, 53: 7725, 54: 7813, 55: 7901, 56: 7989, 57: 8077, 58: 8165, 59: 8253, 60: 8341, 61: 9039, 62: 9127, 63: 9216, 64: 9304, 65: 9393, 66: 9482, 67: 9571, 68: 9660, 69: 9749, 70: 9838, 71: 10537, 72: 10627, 73: 10716, 74: 10805, 75: 10895, 76: 10984, 77: 11074, 78: 11164, 79: 11254, 80: 11345, 81: 12044, 82: 12134, 83: 12225, 84: 12315, 85: 12405, 86: 12496, 87: 12586, 88: 12677, 89: 12768, 90: 12858 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 34, 5: 36, 6: 38, 7: 40, 8: 42, 9: 45, 10: 47, 11: 49, 12: 51, 13: 54, 14: 56, 15: 58, 16: 60, 17: 63, 18: 65, 19: 67, 20: 70, 21: 95, 22: 97, 23: 99, 24: 102, 25: 104, 26: 106, 27: 109, 28: 111, 29: 113, 30: 115, 31: 118, 32: 120, 33: 122, 34: 125, 35: 127, 36: 129, 37: 132, 38: 134, 39: 136, 40: 138, 41: 157, 42: 159, 43: 162, 44: 164, 45: 166, 46: 169, 47: 171, 48: 173, 49: 176, 50: 178, 51: 202, 52: 205, 53: 207, 54: 209, 55: 212, 56: 214, 57: 216, 58: 219, 59: 221, 60: 223, 61: 242, 62: 244, 63: 247, 64: 249, 65: 252, 66: 254, 67: 256, 68: 259, 69: 261, 70: 264, 71: 282, 72: 285, 73: 287, 74: 289, 75: 292, 76: 294, 77: 297, 78: 299, 79: 301, 80: 304, 81: 323, 82: 325, 83: 327, 84: 330, 85: 332, 86: 335, 87: 337, 88: 340, 89: 342, 90: 344 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 76, 5: 81, 6: 86, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 117, 13: 122, 14: 127, 15: 133, 16: 138, 17: 143, 18: 148, 19: 153, 20: 158, 21: 216, 22: 221, 23: 226, 24: 231, 25: 237, 26: 242, 27: 247, 28: 252, 29: 257, 30: 263, 31: 268, 32: 273, 33: 278, 34: 284, 35: 289, 36: 294, 37: 299, 38: 305, 39: 310, 40: 315, 41: 358, 42: 363, 43: 368, 44: 373, 45: 379, 46: 384, 47: 389, 48: 395, 49: 400, 50: 405, 51: 460, 52: 466, 53: 471, 54: 476, 55: 482, 56: 487, 57: 492, 58: 498, 59: 503, 60: 509, 61: 551, 62: 556, 63: 562, 64: 567, 65: 573, 66: 578, 67: 583, 68: 589, 69: 594, 70: 600, 71: 642, 72: 648, 73: 653, 74: 659, 75: 664, 76: 670, 77: 675, 78: 681, 79: 686, 80: 692, 81: 734, 82: 740, 83: 745, 84: 751, 85: 756, 86: 762, 87: 767, 88: 773, 89: 778, 90: 784 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 344,
    hp: 12858,
    def: 784,
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
        id: "lohen-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lohen-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.539917, 0.583863, 0.62781, 0.690591, 0.734538, 0.784763, 0.853822, 0.922881, 0.99194, 1.067277, 1.142614, 1.217951, 1.293289, 1.368626, 1.443963]) },
            ],
          },
        ],
      },
      {
        id: "lohen-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lohen-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.564427, 0.610368, 0.65631, 0.721941, 0.767883, 0.820387, 0.892582, 0.964776, 1.03697, 1.115727, 1.194484, 1.273241, 1.351999, 1.430756, 1.509513]) },
            ],
          },
        ],
      },
      {
        id: "lohen-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lohen-na-3-1-1",
            name: "3-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254199, 0.274889, 0.29558, 0.325138, 0.345829, 0.369475, 0.401989, 0.434503, 0.467016, 0.502486, 0.537956, 0.573425, 0.608895, 0.644364, 0.679834]) },
            ],
          },
          {
            id: "lohen-na-3-1-2",
            name: "3-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254199, 0.274889, 0.29558, 0.325138, 0.345829, 0.369475, 0.401989, 0.434503, 0.467016, 0.502486, 0.537956, 0.573425, 0.608895, 0.644364, 0.679834]) },
            ],
          },
          {
            id: "lohen-na-3-1-3",
            name: "3-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254199, 0.274889, 0.29558, 0.325138, 0.345829, 0.369475, 0.401989, 0.434503, 0.467016, 0.502486, 0.537956, 0.573425, 0.608895, 0.644364, 0.679834]) },
            ],
          },
        ],
      },
      {
        id: "lohen-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lohen-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.752259, 0.81349, 0.87472, 0.962192, 1.023422, 1.0934, 1.189619, 1.285838, 1.382058, 1.487024, 1.59199, 1.696957, 1.801923, 1.90689, 2.011856]) },
            ],
          },
        ],
      },
      {
        id: "lohen-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lohen-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.368579, 0.398579, 0.42858, 0.471438, 0.501439, 0.535725, 0.582869, 0.630013, 0.677156, 0.728586, 0.780016, 0.831445, 0.882875, 0.934304, 0.985734]) },
              { stat: "atk", table: talentTable([0.552868, 0.597869, 0.64287, 0.707157, 0.752158, 0.803588, 0.874303, 0.945019, 1.015735, 1.092879, 1.170023, 1.247168, 1.324312, 1.401457, 1.478601]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "lohen-charged",
      name: "Spear of Favonius — Broken Oath",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lohen-charged-1-1",
          name: "Charged Attack DMG (1/2)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.65876, 0.71238, 0.766, 0.8426, 0.89622, 0.9575, 1.04176, 1.12602, 1.21028, 1.3022, 1.39412, 1.48604, 1.57796, 1.66988, 1.7618]) },
          ],
        },
        {
          id: "lohen-charged-1-2",
          name: "Charged Attack DMG (2/2)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.65876, 0.71238, 0.766, 0.8426, 0.89622, 0.9575, 1.04176, 1.12602, 1.21028, 1.3022, 1.39412, 1.48604, 1.57796, 1.66988, 1.7618]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "lohen-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lohen-plungeLow-1",
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
      id: "lohen-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lohen-plungeHigh-1",
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
      id: "lohen-skill",
      name: "Unforeseen Strike",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 1, element: "cryo" },
      instances: [
        {
          id: "lohen-skill-1",
          name: "1-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.809875, 0.875795, 0.941715, 1.035887, 1.101807, 1.177144, 1.280732, 1.384321, 1.48791, 1.600915, 1.713921, 1.826927, 1.939933, 2.052939, 2.165944]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-2",
          name: "2-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.84664, 0.915552, 0.984465, 1.082912, 1.151824, 1.230581, 1.338872, 1.447164, 1.555455, 1.67359, 1.791726, 1.909862, 2.027998, 2.146134, 2.264269]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-3-1",
          name: "3-Hit DMG (1/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.381298, 0.412334, 0.44337, 0.487707, 0.518743, 0.554212, 0.602983, 0.651754, 0.700525, 0.753729, 0.806933, 0.860138, 0.913342, 0.966547, 1.019751]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-3-2",
          name: "3-Hit DMG (2/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.381298, 0.412334, 0.44337, 0.487707, 0.518743, 0.554212, 0.602983, 0.651754, 0.700525, 0.753729, 0.806933, 0.860138, 0.913342, 0.966547, 1.019751]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-3-3",
          name: "3-Hit DMG (3/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.381298, 0.412334, 0.44337, 0.487707, 0.518743, 0.554212, 0.602983, 0.651754, 0.700525, 0.753729, 0.806933, 0.860138, 0.913342, 0.966547, 1.019751]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-4",
          name: "4-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.128389, 1.220234, 1.31208, 1.443288, 1.535134, 1.6401, 1.784429, 1.928758, 2.073086, 2.230536, 2.387986, 2.545435, 2.702885, 2.860334, 3.017784]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-5",
          name: "5-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.552868, 0.597869, 0.64287, 0.707157, 0.752158, 0.803588, 0.874303, 0.945019, 1.015735, 1.092879, 1.170023, 1.247168, 1.324312, 1.401457, 1.478601]) },
            { stat: "atk", table: talentTable([0.829302, 0.896804, 0.964305, 1.060736, 1.128237, 1.205381, 1.311455, 1.417528, 1.523602, 1.639319, 1.755035, 1.870752, 1.986468, 2.102185, 2.217901]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-6-1",
          name: "Charged Attack DMG (1/2)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.98814, 1.06857, 1.149, 1.2639, 1.34433, 1.43625, 1.56264, 1.68903, 1.81542, 1.9533, 2.09118, 2.22906, 2.36694, 2.50482, 2.6427]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-6-2",
          name: "Charged Attack DMG (2/2)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.98814, 1.06857, 1.149, 1.2639, 1.34433, 1.43625, 1.56264, 1.68903, 1.81542, 1.9533, 2.09118, 2.22906, 2.36694, 2.50482, 2.6427]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-7",
          name: "Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024, 1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612, 1.70982]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-8",
          name: "Low Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-9",
          name: "High Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-10-1",
          name: "Etched Into Bone and Soul DMG (1/4)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-10-2",
          name: "Etched Into Bone and Soul DMG (2/4)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-10-3",
          name: "Etched Into Bone and Soul DMG (3/4)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "lohen-skill-10-4",
          name: "Etched Into Bone and Soul DMG (4/4)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lohen-burst",
      name: "Manifest Judgment",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "lohen-burst-1-1",
          name: "Skill DMG (1/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "lohen-burst-1-2",
          name: "Skill DMG (2/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "lohen-burst-1-3",
          name: "Skill DMG (3/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "lohen-burst-1-4",
          name: "Skill DMG (4/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "lohen-burst-1-5",
          name: "Skill DMG (5/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "lohen-burst-1-6",
          name: "Skill DMG (6/6)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.188, 1.2771, 1.3662, 1.485, 1.5741, 1.6632, 1.782, 1.9008, 2.0196, 2.1384, 2.2572, 2.376, 2.5245, 2.673, 2.8215]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "lohen-a1", name: "Moratorium on Questioning", unlockAscension: 1, effects: [] },
    { id: "lohen-a4", name: "Flippant Masterpiece", unlockAscension: 4, effects: [] },
    { id: "lohen-p3", name: "When the Mood Strikes", effects: [] },
    { id: "lohen-p4", name: "Witch's Eve Rite: Unhealing Thorn", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lohen-c1", name: "O Breezes, That So Oft Bear Sorrowful Lament", effects: [] },
    { level: 2, id: "lohen-c2", name: "In Flight, I Strike Whatever Flies", effects: [] },
    { level: 3, id: "lohen-c3", name: "Only the Spear That Wounds Can Heal", effects: [], buffs: [{ id: "lohen-c3", source: "Only the Spear That Wounds Can Heal", sourceCharacterId: "lohen", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "lohen-c4", name: "Radiant Love, Laughing Death", effects: [] },
    { level: 5, id: "lohen-c5", name: "Never Ask, Nor Trouble You to Know", effects: [], buffs: [{ id: "lohen-c5", source: "Never Ask, Nor Trouble You to Know", sourceCharacterId: "lohen", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "lohen-c6", name: "To Drown, to Sink, Unconscious — Supreme Joy", effects: [] },
  ],
  resources: [],
};

export const mika: GeneratedCharacter = {
  id: "mika",
  name: "Mika",
  element: "cryo",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1049, 2: 1136, 3: 1222, 4: 1309, 5: 1395, 6: 1482, 7: 1568, 8: 1655, 9: 1742, 10: 1828, 11: 1915, 12: 2001, 13: 2088, 14: 2174, 15: 2261, 16: 2348, 17: 2434, 18: 2521, 19: 2607, 20: 2694, 21: 3563, 22: 3650, 23: 3737, 24: 3823, 25: 3910, 26: 3996, 27: 4083, 28: 4169, 29: 4256, 30: 4342, 31: 4429, 32: 4516, 33: 4602, 34: 4689, 35: 4775, 36: 4862, 37: 4948, 38: 5035, 39: 5122, 40: 5208, 41: 5852, 42: 5938, 43: 6025, 44: 6111, 45: 6198, 46: 6285, 47: 6371, 48: 6458, 49: 6544, 50: 6631, 51: 7459, 52: 7546, 53: 7633, 54: 7719, 55: 7806, 56: 7892, 57: 7979, 58: 8065, 59: 8152, 60: 8239, 61: 8882, 62: 8969, 63: 9055, 64: 9142, 65: 9228, 66: 9315, 67: 9402, 68: 9488, 69: 9575, 70: 9661, 71: 10304, 72: 10390, 73: 10477, 74: 10564, 75: 10650, 76: 10737, 77: 10823, 78: 10910, 79: 10996, 80: 11083, 81: 11727, 82: 11813, 83: 11900, 84: 11986, 85: 12073, 86: 12159, 87: 12246, 88: 12332, 89: 12419, 90: 12506 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 60, 2: 65, 3: 70, 4: 75, 5: 80, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 119, 14: 124, 15: 129, 16: 134, 17: 139, 18: 144, 19: 149, 20: 154, 21: 203, 22: 208, 23: 213, 24: 218, 25: 223, 26: 228, 27: 233, 28: 238, 29: 243, 30: 248, 31: 253, 32: 258, 33: 262, 34: 267, 35: 272, 36: 277, 37: 282, 38: 287, 39: 292, 40: 297, 41: 334, 42: 339, 43: 344, 44: 349, 45: 353, 46: 358, 47: 363, 48: 368, 49: 373, 50: 378, 51: 425, 52: 430, 53: 435, 54: 440, 55: 445, 56: 450, 57: 455, 58: 460, 59: 465, 60: 470, 61: 507, 62: 511, 63: 516, 64: 521, 65: 526, 66: 531, 67: 536, 68: 541, 69: 546, 70: 551, 71: 588, 72: 593, 73: 598, 74: 602, 75: 607, 76: 612, 77: 617, 78: 622, 79: 627, 80: 632, 81: 669, 82: 674, 83: 679, 84: 684, 85: 689, 86: 693, 87: 698, 88: 703, 89: 708, 90: 713 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 223,
    hp: 12506,
    def: 713,
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
        id: "mika-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mika-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.432632, 0.467846, 0.50306, 0.553366, 0.58858, 0.628825, 0.684162, 0.739498, 0.794835, 0.855202, 0.915569, 0.975936, 1.036304, 1.096671, 1.157038]) },
            ],
          },
        ],
      },
      {
        id: "mika-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mika-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.415019, 0.448799, 0.48258, 0.530838, 0.564619, 0.603225, 0.656309, 0.709393, 0.762476, 0.820386, 0.878296, 0.936205, 0.994115, 1.052024, 1.109934]) },
            ],
          },
        ],
      },
      {
        id: "mika-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mika-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.545034, 0.589397, 0.63376, 0.697136, 0.741499, 0.7922, 0.861914, 0.931627, 1.001341, 1.077392, 1.153443, 1.229494, 1.305546, 1.381597, 1.457648]) },
            ],
          },
        ],
      },
      {
        id: "mika-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mika-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.276146, 0.298623, 0.3211, 0.35321, 0.375687, 0.401375, 0.436696, 0.472017, 0.507338, 0.54587, 0.584402, 0.622934, 0.661466, 0.699998, 0.73853]) },
              { stat: "atk", table: talentTable([0.276146, 0.298623, 0.3211, 0.35321, 0.375687, 0.401375, 0.436696, 0.472017, 0.507338, 0.54587, 0.584402, 0.622934, 0.661466, 0.699998, 0.73853]) },
            ],
          },
        ],
      },
      {
        id: "mika-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mika-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.708743, 0.766432, 0.82412, 0.906532, 0.96422, 1.03015, 1.120803, 1.211456, 1.30211, 1.401004, 1.499898, 1.598793, 1.697687, 1.796582, 1.895476]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "mika-charged",
      name: "Spear of Favonius - Arrow's Passage",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mika-charged-1",
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
      id: "mika-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mika-plungeLow-1",
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
      id: "mika-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mika-plungeHigh-1",
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
      id: "mika-skill",
      name: "Starfrost Swirl",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "mika-skill-1",
          name: "Flowfrost Arrow DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.672, 0.7224, 0.7728, 0.84, 0.8904, 0.9408, 1.008, 1.0752, 1.1424, 1.2096, 1.2768, 1.344, 1.428, 1.512, 1.596]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "mika-skill-2",
          name: "Rimestar Flare DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.84, 0.903, 0.966, 1.05, 1.113, 1.176, 1.26, 1.344, 1.428, 1.512, 1.596, 1.68, 1.785, 1.89, 1.995]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "mika-skill-3",
          name: "Rimestar Shard DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.252, 0.2709, 0.2898, 0.315, 0.3339, 0.3528, 0.378, 0.4032, 0.4284, 0.4536, 0.4788, 0.504, 0.5355, 0.567, 0.5985]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "mika-burst",
      name: "Skyfeather Song",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
      ],
    },
  passives: [
    { id: "mika-a1", name: "Suppressive Barrage", unlockAscension: 1, effects: [] },
    { id: "mika-a4", name: "Topographical Mapping", unlockAscension: 4, effects: [] },
    { id: "mika-p3", name: "Demarcation", effects: [] },
  ],
  constellations: [
    { level: 1, id: "mika-c1", name: "Factor Confluence", effects: [] },
    { level: 2, id: "mika-c2", name: "Companion's Ingress", effects: [] },
    { level: 3, id: "mika-c3", name: "Reconnaissance Experience", effects: [], buffs: [{ id: "mika-c3", source: "Reconnaissance Experience", sourceCharacterId: "mika", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "mika-c4", name: "Sunfrost Encomium", effects: [] },
    { level: 5, id: "mika-c5", name: "Signal Arrow", effects: [], buffs: [{ id: "mika-c5", source: "Signal Arrow", sourceCharacterId: "mika", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "mika-c6", name: "Companion's Counsel", effects: [] },
  ],
  resources: [],
};

export const odette: GeneratedCharacter = {
  id: "odette",
  name: "Odette",
  element: "cryo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1011, 2: 1094, 3: 1178, 4: 1263, 5: 1347, 6: 1432, 7: 1516, 8: 1601, 9: 1686, 10: 1769, 11: 1854, 12: 1939, 13: 2024, 14: 2110, 15: 2195, 16: 2280, 17: 2366, 18: 2451, 19: 2536, 20: 2621, 21: 3574, 22: 3660, 23: 3745, 24: 3831, 25: 3917, 26: 4004, 27: 4090, 28: 4176, 29: 4263, 30: 4349, 31: 4436, 32: 4522, 33: 4609, 34: 4695, 35: 4782, 36: 4870, 37: 4957, 38: 5044, 39: 5131, 40: 5219, 41: 5921, 42: 6009, 43: 6097, 44: 6184, 45: 6272, 46: 6360, 47: 6448, 48: 6536, 49: 6625, 50: 6712, 51: 7621, 52: 7710, 53: 7798, 54: 7887, 55: 7976, 56: 8065, 57: 8154, 58: 8243, 59: 8332, 60: 8421, 61: 9125, 62: 9214, 63: 9304, 64: 9393, 65: 9483, 66: 9573, 67: 9662, 68: 9752, 69: 9842, 70: 9932, 71: 10637, 72: 10728, 73: 10818, 74: 10908, 75: 10999, 76: 11089, 77: 11180, 78: 11271, 79: 11362, 80: 11453, 81: 12159, 82: 12250, 83: 12341, 84: 12432, 85: 12523, 86: 12615, 87: 12706, 88: 12798, 89: 12890, 90: 12981 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 33, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 46, 11: 48, 12: 50, 13: 52, 14: 54, 15: 57, 16: 59, 17: 61, 18: 63, 19: 65, 20: 68, 21: 92, 22: 94, 23: 97, 24: 99, 25: 101, 26: 103, 27: 106, 28: 108, 29: 110, 30: 112, 31: 114, 32: 117, 33: 119, 34: 121, 35: 123, 36: 126, 37: 128, 38: 130, 39: 132, 40: 135, 41: 153, 42: 155, 43: 157, 44: 160, 45: 162, 46: 164, 47: 166, 48: 169, 49: 171, 50: 173, 51: 197, 52: 199, 53: 201, 54: 203, 55: 206, 56: 208, 57: 210, 58: 213, 59: 215, 60: 217, 61: 235, 62: 238, 63: 240, 64: 242, 65: 245, 66: 247, 67: 249, 68: 252, 69: 254, 70: 256, 71: 274, 72: 277, 73: 279, 74: 281, 75: 284, 76: 286, 77: 288, 78: 291, 79: 293, 80: 295, 81: 314, 82: 316, 83: 318, 84: 321, 85: 323, 86: 325, 87: 328, 88: 330, 89: 333, 90: 335 } },
    def: { byLevel: { 1: 61, 2: 66, 3: 71, 4: 77, 5: 82, 6: 87, 7: 92, 8: 97, 9: 102, 10: 107, 11: 112, 12: 118, 13: 123, 14: 128, 15: 133, 16: 138, 17: 143, 18: 149, 19: 154, 20: 159, 21: 217, 22: 222, 23: 227, 24: 232, 25: 237, 26: 243, 27: 248, 28: 253, 29: 258, 30: 264, 31: 269, 32: 274, 33: 279, 34: 285, 35: 290, 36: 295, 37: 301, 38: 306, 39: 311, 40: 316, 41: 359, 42: 364, 43: 370, 44: 375, 45: 380, 46: 386, 47: 391, 48: 396, 49: 402, 50: 407, 51: 462, 52: 467, 53: 473, 54: 478, 55: 484, 56: 489, 57: 494, 58: 500, 59: 505, 60: 511, 61: 553, 62: 559, 63: 564, 64: 569, 65: 575, 66: 580, 67: 586, 68: 591, 69: 597, 70: 602, 71: 645, 72: 650, 73: 656, 74: 661, 75: 667, 76: 672, 77: 678, 78: 683, 79: 689, 80: 694, 81: 737, 82: 743, 83: 748, 84: 754, 85: 759, 86: 765, 87: 770, 88: 776, 89: 781, 90: 787 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 335,
    hp: 12981,
    def: 787,
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
        id: "odette-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "odette-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.518571, 0.560781, 0.60299, 0.663289, 0.705498, 0.753738, 0.820066, 0.886395, 0.952724, 1.025083, 1.097442, 1.169801, 1.242159, 1.314518, 1.386877]) },
            ],
          },
        ],
      },
      {
        id: "odette-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "odette-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.515106, 0.557033, 0.59896, 0.658856, 0.700783, 0.7487, 0.814586, 0.880471, 0.946357, 1.018232, 1.090107, 1.161982, 1.233858, 1.305733, 1.377608]) },
            ],
          },
        ],
      },
      {
        id: "odette-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "odette-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.326112, 0.352656, 0.3792, 0.41712, 0.443664, 0.474, 0.515712, 0.557424, 0.599136, 0.64464, 0.690144, 0.735648, 0.781152, 0.826656, 0.87216]) },
              { stat: "atk", table: talentTable([0.382786, 0.413943, 0.4451, 0.48961, 0.520767, 0.556375, 0.605336, 0.654297, 0.703258, 0.75667, 0.810082, 0.863494, 0.916906, 0.970318, 1.02373]) },
            ],
          },
        ],
      },
      {
        id: "odette-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "odette-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.745732, 0.806431, 0.86713, 0.953843, 1.014542, 1.083912, 1.179297, 1.274681, 1.370065, 1.474121, 1.578177, 1.682232, 1.786288, 1.890343, 1.994399]) },
            ],
          },
        ],
      },
      {
        id: "odette-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "odette-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.902123, 0.975551, 1.04898, 1.153878, 1.227307, 1.311225, 1.426613, 1.542001, 1.657388, 1.783266, 1.909144, 2.035021, 2.160899, 2.286776, 2.412654]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "odette-charged",
      name: "Snow Swan Variation",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "odette-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.07414, 1.16157, 1.249, 1.3739, 1.46133, 1.56125, 1.69864, 1.83603, 1.97342, 2.1233, 2.27318, 2.42306, 2.57294, 2.72282, 2.8727]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "odette-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "odette-plungeLow-1",
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
      id: "odette-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "odette-plungeHigh-1",
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
      id: "odette-skill",
      name: "Adagio: Phantom Night Dancers",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 5, element: "cryo" },
      instances: [
        {
          id: "odette-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.0808, 1.16186, 1.24292, 1.351, 1.43206, 1.51312, 1.6212, 1.72928, 1.83736, 1.94544, 2.05352, 2.1616, 2.2967, 2.4318, 2.5669]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-2",
          name: "Coda at Dawn's Tolling DoT",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.9584, 1.03028, 1.10216, 1.198, 1.26988, 1.34176, 1.4376, 1.53344, 1.62928, 1.72512, 1.82096, 1.9168, 2.0366, 2.1564, 2.2762]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-3",
          name: "Coda at Dawn's Tolling Stellar-Conduct Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.0576, 3.28692, 3.51624, 3.822, 4.05132, 4.28064, 4.5864, 4.89216, 5.19792, 5.50368, 5.80944, 6.1152, 6.4974, 6.8796, 7.2618]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-4",
          name: "Stellar Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([4.5864, 4.93038, 5.27436, 5.733, 6.07698, 6.42096, 6.8796, 7.33824, 7.79688, 8.25552, 8.71416, 9.1728, 9.7461, 10.3194, 10.8927]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-5",
          name: "\"Plume\" Dance Move DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.4304, 0.46268, 0.49496, 0.538, 0.57028, 0.60256, 0.6456, 0.68864, 0.73168, 0.77472, 0.81776, 0.8608, 0.9146, 0.9684, 1.0222]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-6",
          name: "\"Plume\" Dance Move Stellar-Conduct Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.27024, 0.290508, 0.310776, 0.3378, 0.358068, 0.378336, 0.40536, 0.432384, 0.459408, 0.486432, 0.513456, 0.54048, 0.57426, 0.60804, 0.64182]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-7",
          name: "Stellar Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.40528, 0.435676, 0.466072, 0.5066, 0.536996, 0.567392, 0.60792, 0.648448, 0.688976, 0.729504, 0.770032, 0.81056, 0.86122, 0.91188, 0.96254]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-8",
          name: "\"Wing\" Dance Move DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.51464, 0.553238, 0.591836, 0.6433, 0.681898, 0.720496, 0.77196, 0.823424, 0.874888, 0.926352, 0.977816, 1.02928, 1.09361, 1.15794, 1.22227]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-9",
          name: "\"Wing\" Dance Move Stellar-Conduct Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.32312, 0.347354, 0.371588, 0.4039, 0.428134, 0.452368, 0.48468, 0.516992, 0.549304, 0.581616, 0.613928, 0.64624, 0.68663, 0.72702, 0.76741]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "odette-skill-10",
          name: "Stellar Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.48464, 0.520988, 0.557336, 0.6058, 0.642148, 0.678496, 0.72696, 0.775424, 0.823888, 0.872352, 0.920816, 0.96928, 1.02986, 1.09044, 1.15102]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "odette-burst",
      name: "Presto: Bluebird Finale",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "odette-burst-1-1",
          name: "Slash DMG (1/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.10176, 1.184392, 1.267024, 1.3772, 1.459832, 1.542464, 1.65264, 1.762816, 1.872992, 1.983168, 2.093344, 2.20352, 2.34124, 2.47896, 2.61668]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "odette-burst-1-2",
          name: "Slash DMG (2/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.10176, 1.184392, 1.267024, 1.3772, 1.459832, 1.542464, 1.65264, 1.762816, 1.872992, 1.983168, 2.093344, 2.20352, 2.34124, 2.47896, 2.61668]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "odette-burst-1-3",
          name: "Slash DMG (3/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.10176, 1.184392, 1.267024, 1.3772, 1.459832, 1.542464, 1.65264, 1.762816, 1.872992, 1.983168, 2.093344, 2.20352, 2.34124, 2.47896, 2.61668]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "odette-burst-2",
          name: "Final Slash DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.70272, 1.830424, 1.958128, 2.1284, 2.256104, 2.383808, 2.55408, 2.724352, 2.894624, 3.064896, 3.235168, 3.40544, 3.61828, 3.83112, 4.04396]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "odette-a1", name: "Spring Rite of the Chosen One", unlockAscension: 1, effects: [] },
    { id: "odette-a4", name: "Pathetique of Pateticheskaya", unlockAscension: 4, effects: [] },
    { id: "odette-p3", name: "Stellar Jubilee: Dance of Aurore", effects: [] },
    { id: "odette-p4", name: "Echo of Winter Daydreams", effects: [] },
  ],
  constellations: [
    { level: 1, id: "odette-c1", name: "\"On This Danceless Morn, She Gazes at Her Reflection\"", effects: [] },
    { level: 2, id: "odette-c2", name: "\"I Must See the Snow Swan's Unseen Dream for Myself, She Thought\"", effects: [] },
    { level: 3, id: "odette-c3", name: "\"I'll Chase the Shouting Wind Along, Climbing Alone As I Go\"", effects: [], buffs: [{ id: "odette-c3", source: "\"I'll Chase the Shouting Wind Along, Climbing Alone As I Go\"", sourceCharacterId: "odette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "odette-c4", name: "\"Up, Up the Long, Delirious, Burning Blue\"", effects: [] },
    { level: 5, id: "odette-c5", name: "\"Oh! I Have Slipped the Surly Bonds of Earth\"", effects: [], buffs: [{ id: "odette-c5", source: "\"Oh! I Have Slipped the Surly Bonds of Earth\"", sourceCharacterId: "odette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "odette-c6", name: "\"Put Out My Hand, and Touched the Face of the Divine\"", effects: [] },
  ],
  resources: [],
};

export const qiqi: GeneratedCharacter = {
  id: "qiqi",
  name: "Qiqi",
  element: "cryo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 963, 2: 1043, 3: 1123, 4: 1204, 5: 1283, 6: 1364, 7: 1444, 8: 1525, 9: 1606, 10: 1686, 11: 1767, 12: 1848, 13: 1929, 14: 2010, 15: 2091, 16: 2172, 17: 2254, 18: 2335, 19: 2417, 20: 2498, 21: 3405, 22: 3487, 23: 3569, 24: 3651, 25: 3732, 26: 3815, 27: 3897, 28: 3979, 29: 4062, 30: 4144, 31: 4226, 32: 4309, 33: 4392, 34: 4474, 35: 4557, 36: 4640, 37: 4723, 38: 4806, 39: 4889, 40: 4973, 41: 5642, 42: 5726, 43: 5809, 44: 5892, 45: 5976, 46: 6060, 47: 6144, 48: 6227, 49: 6312, 50: 6396, 51: 7262, 52: 7346, 53: 7430, 54: 7515, 55: 7600, 56: 7684, 57: 7769, 58: 7854, 59: 7939, 60: 8023, 61: 8695, 62: 8779, 63: 8865, 64: 8950, 65: 9036, 66: 9121, 67: 9206, 68: 9292, 69: 9377, 70: 9463, 71: 10135, 72: 10222, 73: 10308, 74: 10393, 75: 10480, 76: 10566, 77: 10652, 78: 10739, 79: 10826, 80: 10912, 81: 11586, 82: 11672, 83: 11759, 84: 11846, 85: 11932, 86: 12020, 87: 12106, 88: 12194, 89: 12282, 90: 12368 } },
    atk: { byLevel: { 1: 22, 2: 24, 3: 26, 4: 28, 5: 30, 6: 32, 7: 34, 8: 35, 9: 37, 10: 39, 11: 41, 12: 43, 13: 45, 14: 47, 15: 49, 16: 50, 17: 52, 18: 54, 19: 56, 20: 58, 21: 79, 22: 81, 23: 83, 24: 85, 25: 87, 26: 89, 27: 90, 28: 92, 29: 94, 30: 96, 31: 98, 32: 100, 33: 102, 34: 104, 35: 106, 36: 108, 37: 110, 38: 112, 39: 113, 40: 115, 41: 131, 42: 133, 43: 135, 44: 137, 45: 139, 46: 141, 47: 143, 48: 145, 49: 146, 50: 148, 51: 169, 52: 170, 53: 172, 54: 174, 55: 176, 56: 178, 57: 180, 58: 182, 59: 184, 60: 186, 61: 202, 62: 204, 63: 206, 64: 208, 65: 210, 66: 212, 67: 214, 68: 216, 69: 218, 70: 220, 71: 235, 72: 237, 73: 239, 74: 241, 75: 243, 76: 245, 77: 247, 78: 249, 79: 251, 80: 253, 81: 269, 82: 271, 83: 273, 84: 275, 85: 277, 86: 279, 87: 281, 88: 283, 89: 285, 90: 287 } },
    def: { byLevel: { 1: 72, 2: 78, 3: 84, 4: 90, 5: 96, 6: 102, 7: 108, 8: 114, 9: 120, 10: 126, 11: 132, 12: 138, 13: 144, 14: 150, 15: 156, 16: 162, 17: 168, 18: 174, 19: 180, 20: 186, 21: 254, 22: 260, 23: 266, 24: 272, 25: 278, 26: 284, 27: 291, 28: 297, 29: 303, 30: 309, 31: 315, 32: 321, 33: 327, 34: 334, 35: 340, 36: 346, 37: 352, 38: 358, 39: 365, 40: 371, 41: 421, 42: 427, 43: 433, 44: 439, 45: 446, 46: 452, 47: 458, 48: 464, 49: 471, 50: 477, 51: 541, 52: 548, 53: 554, 54: 560, 55: 567, 56: 573, 57: 579, 58: 586, 59: 592, 60: 598, 61: 648, 62: 655, 63: 661, 64: 667, 65: 674, 66: 680, 67: 686, 68: 693, 69: 699, 70: 706, 71: 756, 72: 762, 73: 769, 74: 775, 75: 781, 76: 788, 77: 794, 78: 801, 79: 807, 80: 814, 81: 864, 82: 870, 83: 877, 84: 883, 85: 890, 86: 896, 87: 903, 88: 909, 89: 916, 90: 922 } },
  },
  ascensionBonus: {
    stat: "healingBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.221],
  },
  baseStats: {
    atk: 287,
    hp: 12368,
    def: 922,
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
        id: "qiqi-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "qiqi-na-1-1",
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
        id: "qiqi-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "qiqi-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.38872, 0.42036, 0.452, 0.4972, 0.52884, 0.565, 0.61472, 0.66444, 0.71416, 0.7684, 0.82264, 0.87688, 0.93112, 0.98536, 1.0396]) },
            ],
          },
        ],
      },
      {
        id: "qiqi-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "qiqi-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.24166, 0.26133, 0.281, 0.3091, 0.32877, 0.35125, 0.38216, 0.41307, 0.44398, 0.4777, 0.51142, 0.54514, 0.57886, 0.61258, 0.6463]) },
              { stat: "atk", table: talentTable([0.24166, 0.26133, 0.281, 0.3091, 0.32877, 0.35125, 0.38216, 0.41307, 0.44398, 0.4777, 0.51142, 0.54514, 0.57886, 0.61258, 0.6463]) },
            ],
          },
        ],
      },
      {
        id: "qiqi-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "qiqi-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.24682, 0.26691, 0.287, 0.3157, 0.33579, 0.35875, 0.39032, 0.42189, 0.45346, 0.4879, 0.52234, 0.55678, 0.59122, 0.62566, 0.6601]) },
              { stat: "atk", table: talentTable([0.24682, 0.26691, 0.287, 0.3157, 0.33579, 0.35875, 0.39032, 0.42189, 0.45346, 0.4879, 0.52234, 0.55678, 0.59122, 0.62566, 0.6601]) },
            ],
          },
        ],
      },
      {
        id: "qiqi-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "qiqi-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.63038, 0.68169, 0.733, 0.8063, 0.85761, 0.91625, 0.99688, 1.07751, 1.15814, 1.2461, 1.33406, 1.42202, 1.50998, 1.59794, 1.6859]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "qiqi-charged",
      name: "Ancient Sword Art",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "qiqi-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.64328, 0.69564, 0.748, 0.8228, 0.87516, 0.935, 1.01728, 1.09956, 1.18184, 1.2716, 1.36136, 1.45112, 1.54088, 1.63064, 1.7204]) },
            { stat: "atk", table: talentTable([0.64328, 0.69564, 0.748, 0.8228, 0.87516, 0.935, 1.01728, 1.09956, 1.18184, 1.2716, 1.36136, 1.45112, 1.54088, 1.63064, 1.7204]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "qiqi-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "qiqi-plungeLow-1",
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
      id: "qiqi-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "qiqi-plungeHigh-1",
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
      id: "qiqi-skill",
      name: "Adeptus Art: Herald of Frost",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(30),
      energyCost: 0,
      particles: { count: 2, element: "cryo" },
      instances: [
        {
          id: "qiqi-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.96, 1.032, 1.104, 1.2, 1.272, 1.344, 1.44, 1.536, 1.632, 1.728, 1.824, 1.92, 2.04, 2.16, 2.28]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "qiqi-skill-2",
          name: "Herald of Frost DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "qiqi-skill-3",
          name: "Herald of Frost Coordinated Attack DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.24, 0.258, 0.276, 0.3, 0.318, 0.336, 0.36, 0.384, 0.408, 0.432, 0.456, 0.48, 0.51, 0.54, 0.57]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "qiqi-burst",
      name: "Adeptus Art: Preserver of Fortune",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "qiqi-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.848, 3.0616, 3.2752, 3.56, 3.7736, 3.9872, 4.272, 4.5568, 4.8416, 5.1264, 5.4112, 5.696, 6.052, 6.408, 6.764]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "qiqi-burst-2",
          name: "Stellar-Conduct DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.973336, 3.196336, 3.419336, 3.71667, 3.93967, 4.16267, 4.460004, 4.757338, 5.054671, 5.352005, 5.649338, 5.946672, 6.318339, 6.690006, 7.061673]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "qiqi-a1", name: "Life-Prolonging Methods", unlockAscension: 1, effects: [] },
    { id: "qiqi-a4", name: "A Glimpse Into Arcanum", unlockAscension: 4, effects: [] },
    { id: "qiqi-p3", name: "Former Life Memories", effects: [] },
    { id: "qiqi-p4", name: "Seven Sacred Treasures", effects: [] },
  ],
  constellations: [
    { level: 1, id: "qiqi-c1", name: "Ascetics of Frost", effects: [] },
    { level: 2, id: "qiqi-c2", name: "Frozen to the Bone", effects: [] },
    { level: 3, id: "qiqi-c3", name: "Ascendant Praise", effects: [], buffs: [{ id: "qiqi-c3", source: "Ascendant Praise", sourceCharacterId: "qiqi", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "qiqi-c4", name: "Divine Suppression", effects: [] },
    { level: 5, id: "qiqi-c5", name: "Crimson Lotus Bloom", effects: [], buffs: [{ id: "qiqi-c5", source: "Crimson Lotus Bloom", sourceCharacterId: "qiqi", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "qiqi-c6", name: "Rite of Resurrection", effects: [] },
  ],
  resources: [],
};

export const rosaria: GeneratedCharacter = {
  id: "rosaria",
  name: "Rosaria",
  element: "cryo",
  weaponType: "polearm",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1030, 2: 1116, 3: 1200, 4: 1286, 5: 1370, 6: 1456, 7: 1540, 8: 1626, 9: 1711, 10: 1796, 11: 1881, 12: 1966, 13: 2051, 14: 2136, 15: 2221, 16: 2307, 17: 2391, 18: 2477, 19: 2561, 20: 2647, 21: 3501, 22: 3587, 23: 3672, 24: 3757, 25: 3842, 26: 3927, 27: 4012, 28: 4097, 29: 4182, 30: 4267, 31: 4352, 32: 4438, 33: 4522, 34: 4608, 35: 4692, 36: 4778, 37: 4862, 38: 4948, 39: 5033, 40: 5118, 41: 5750, 42: 5835, 43: 5920, 44: 6005, 45: 6090, 46: 6176, 47: 6260, 48: 6346, 49: 6430, 50: 6516, 51: 7329, 52: 7415, 53: 7500, 54: 7585, 55: 7670, 56: 7755, 57: 7840, 58: 7925, 59: 8010, 60: 8096, 61: 8727, 62: 8813, 63: 8897, 64: 8983, 65: 9067, 66: 9153, 67: 9238, 68: 9323, 69: 9408, 70: 9493, 71: 10125, 72: 10210, 73: 10295, 74: 10381, 75: 10465, 76: 10551, 77: 10635, 78: 10721, 79: 10805, 80: 10891, 81: 11523, 82: 11608, 83: 11693, 84: 11778, 85: 11863, 86: 11948, 87: 12033, 88: 12118, 89: 12203, 90: 12289 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 23, 4: 25, 5: 27, 6: 28, 7: 30, 8: 32, 9: 33, 10: 35, 11: 37, 12: 38, 13: 40, 14: 42, 15: 43, 16: 45, 17: 47, 18: 48, 19: 50, 20: 52, 21: 68, 22: 70, 23: 72, 24: 73, 25: 75, 26: 77, 27: 78, 28: 80, 29: 82, 30: 83, 31: 85, 32: 87, 33: 88, 34: 90, 35: 92, 36: 93, 37: 95, 38: 97, 39: 98, 40: 100, 41: 112, 42: 114, 43: 116, 44: 117, 45: 119, 46: 121, 47: 122, 48: 124, 49: 126, 50: 127, 51: 143, 52: 145, 53: 146, 54: 148, 55: 150, 56: 151, 57: 153, 58: 155, 59: 156, 60: 158, 61: 170, 62: 172, 63: 174, 64: 175, 65: 177, 66: 179, 67: 180, 68: 182, 69: 184, 70: 185, 71: 198, 72: 199, 73: 201, 74: 203, 75: 204, 76: 206, 77: 208, 78: 209, 79: 211, 80: 213, 81: 225, 82: 227, 83: 228, 84: 230, 85: 232, 86: 233, 87: 235, 88: 237, 89: 238, 90: 240 } },
    def: { byLevel: { 1: 60, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 118, 14: 123, 15: 128, 16: 133, 17: 138, 18: 143, 19: 148, 20: 153, 21: 202, 22: 207, 23: 212, 24: 217, 25: 222, 26: 227, 27: 232, 28: 237, 29: 242, 30: 246, 31: 251, 32: 256, 33: 261, 34: 266, 35: 271, 36: 276, 37: 281, 38: 286, 39: 291, 40: 296, 41: 332, 42: 337, 43: 342, 44: 347, 45: 352, 46: 357, 47: 362, 48: 367, 49: 371, 50: 376, 51: 423, 52: 428, 53: 433, 54: 438, 55: 443, 56: 448, 57: 453, 58: 458, 59: 463, 60: 468, 61: 504, 62: 509, 63: 514, 64: 519, 65: 524, 66: 529, 67: 534, 68: 539, 69: 543, 70: 548, 71: 585, 72: 590, 73: 595, 74: 600, 75: 604, 76: 609, 77: 614, 78: 619, 79: 624, 80: 629, 81: 666, 82: 670, 83: 675, 84: 680, 85: 685, 86: 690, 87: 695, 88: 700, 89: 705, 90: 710 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 240,
    hp: 12289,
    def: 710,
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
        id: "rosaria-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "rosaria-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5246, 0.5673, 0.61, 0.671, 0.7137, 0.7625, 0.8296, 0.8967, 0.9638, 1.037, 1.1102, 1.1834, 1.2566, 1.3298, 1.403]) },
            ],
          },
        ],
      },
      {
        id: "rosaria-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "rosaria-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.516, 0.558, 0.6, 0.66, 0.702, 0.75, 0.816, 0.882, 0.948, 1.02, 1.092, 1.164, 1.236, 1.308, 1.38]) },
            ],
          },
        ],
      },
      {
        id: "rosaria-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "rosaria-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3182, 0.3441, 0.37, 0.407, 0.4329, 0.4625, 0.5032, 0.5439, 0.5846, 0.629, 0.6734, 0.7178, 0.7622, 0.8066, 0.851]) },
            ],
          },
          {
            id: "rosaria-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.3182, 0.3441, 0.37, 0.407, 0.4329, 0.4625, 0.5032, 0.5439, 0.5846, 0.629, 0.6734, 0.7178, 0.7622, 0.8066, 0.851]) },
            ],
          },
        ],
      },
      {
        id: "rosaria-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "rosaria-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.6966, 0.7533, 0.81, 0.891, 0.9477, 1.0125, 1.1016, 1.1907, 1.2798, 1.377, 1.4742, 1.5714, 1.6686, 1.7658, 1.863]) },
            ],
          },
        ],
      },
      {
        id: "rosaria-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "rosaria-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.41624, 0.45012, 0.484, 0.5324, 0.56628, 0.605, 0.65824, 0.71148, 0.76472, 0.8228, 0.88088, 0.93896, 0.99704, 1.05512, 1.1132]) },
              { stat: "atk", table: talentTable([0.43, 0.465, 0.5, 0.55, 0.585, 0.625, 0.68, 0.735, 0.79, 0.85, 0.91, 0.97, 1.03, 1.09, 1.15]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "rosaria-charged",
      name: "Spear of the Church",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "rosaria-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.3674, 1.4787, 1.59, 1.749, 1.8603, 1.9875, 2.1624, 2.3373, 2.5122, 2.703, 2.8938, 3.0846, 3.2754, 3.4662, 3.657]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "rosaria-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "rosaria-plungeLow-1",
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
      id: "rosaria-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "rosaria-plungeHigh-1",
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
      id: "rosaria-skill",
      name: "Ravaging Confession",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 3, element: "cryo" },
      instances: [
        {
          id: "rosaria-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.584, 0.6278, 0.6716, 0.73, 0.7738, 0.8176, 0.876, 0.9344, 0.9928, 1.0512, 1.1096, 1.168, 1.241, 1.314, 1.387]) },
            { stat: "atk", table: talentTable([1.36, 1.462, 1.564, 1.7, 1.802, 1.904, 2.04, 2.176, 2.312, 2.448, 2.584, 2.72, 2.89, 3.06, 3.23]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "rosaria-burst",
      name: "Rites of Termination",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "rosaria-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.04, 1.118, 1.196, 1.3, 1.378, 1.456, 1.56, 1.664, 1.768, 1.872, 1.976, 2.08, 2.21, 2.34, 2.47]) },
            { stat: "atk", table: talentTable([1.52, 1.634, 1.748, 1.9, 2.014, 2.128, 2.28, 2.432, 2.584, 2.736, 2.888, 3.04, 3.23, 3.42, 3.61]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "rosaria-burst-2",
          name: "Ice Lance DoT",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.32, 1.419, 1.518, 1.65, 1.749, 1.848, 1.98, 2.112, 2.244, 2.376, 2.508, 2.64, 2.805, 2.97, 3.135]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "rosaria-a1", name: "Regina Probationum", unlockAscension: 1, effects: [] },
    { id: "rosaria-a4", name: "Shadow Samaritan", unlockAscension: 4, effects: [] },
    { id: "rosaria-p3", name: "Night Walk", effects: [] },
  ],
  constellations: [
    { level: 1, id: "rosaria-c1", name: "Unholy Revelation", effects: [] },
    { level: 2, id: "rosaria-c2", name: "Land Without Promise", effects: [] },
    { level: 3, id: "rosaria-c3", name: "The Wages of Sin", effects: [], buffs: [{ id: "rosaria-c3", source: "The Wages of Sin", sourceCharacterId: "rosaria", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "rosaria-c4", name: "Painful Grace", effects: [] },
    { level: 5, id: "rosaria-c5", name: "Last Rites", effects: [], buffs: [{ id: "rosaria-c5", source: "Last Rites", sourceCharacterId: "rosaria", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "rosaria-c6", name: "Divine Retribution", effects: [] },
  ],
  resources: [],
};

export const sandrone: GeneratedCharacter = {
  id: "sandrone",
  name: "Sandrone",
  element: "cryo",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1030, 2: 1115, 3: 1200, 4: 1287, 5: 1372, 6: 1459, 7: 1544, 8: 1631, 9: 1717, 10: 1803, 11: 1889, 12: 1976, 13: 2062, 14: 2150, 15: 2236, 16: 2323, 17: 2410, 18: 2497, 19: 2584, 20: 2671, 21: 3641, 22: 3729, 23: 3816, 24: 3904, 25: 3991, 26: 4080, 27: 4167, 28: 4255, 29: 4343, 30: 4431, 31: 4519, 32: 4608, 33: 4696, 34: 4784, 35: 4872, 36: 4962, 37: 5051, 38: 5139, 39: 5228, 40: 5317, 41: 6033, 42: 6123, 43: 6212, 44: 6301, 45: 6390, 46: 6480, 47: 6569, 48: 6659, 49: 6750, 50: 6839, 51: 7765, 52: 7856, 53: 7945, 54: 8036, 55: 8126, 56: 8217, 57: 8308, 58: 8398, 59: 8489, 60: 8579, 61: 9297, 62: 9388, 63: 9480, 64: 9570, 65: 9662, 66: 9753, 67: 9844, 68: 9936, 69: 10027, 70: 10119, 71: 10838, 72: 10930, 73: 11022, 74: 11114, 75: 11206, 76: 11298, 77: 11391, 78: 11483, 79: 11576, 80: 11669, 81: 12389, 82: 12481, 83: 12574, 84: 12667, 85: 12759, 86: 12853, 87: 12946, 88: 13039, 89: 13133, 90: 13226 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 33, 5: 35, 6: 38, 7: 40, 8: 42, 9: 44, 10: 47, 11: 49, 12: 51, 13: 53, 14: 56, 15: 58, 16: 60, 17: 62, 18: 65, 19: 67, 20: 69, 21: 94, 22: 96, 23: 99, 24: 101, 25: 103, 26: 106, 27: 108, 28: 110, 29: 112, 30: 115, 31: 117, 32: 119, 33: 121, 34: 124, 35: 126, 36: 128, 37: 131, 38: 133, 39: 135, 40: 138, 41: 156, 42: 158, 43: 161, 44: 163, 45: 165, 46: 168, 47: 170, 48: 172, 49: 175, 50: 177, 51: 201, 52: 203, 53: 205, 54: 208, 55: 210, 56: 212, 57: 215, 58: 217, 59: 220, 60: 222, 61: 240, 62: 243, 63: 245, 64: 247, 65: 250, 66: 252, 67: 255, 68: 257, 69: 259, 70: 262, 71: 280, 72: 283, 73: 285, 74: 287, 75: 290, 76: 292, 77: 295, 78: 297, 79: 299, 80: 302, 81: 320, 82: 323, 83: 325, 84: 328, 85: 330, 86: 332, 87: 335, 88: 337, 89: 340, 90: 342 } },
    def: { byLevel: { 1: 59, 2: 63, 3: 68, 4: 73, 5: 78, 6: 83, 7: 88, 8: 93, 9: 98, 10: 103, 11: 107, 12: 112, 13: 117, 14: 122, 15: 127, 16: 132, 17: 137, 18: 142, 19: 147, 20: 152, 21: 207, 22: 212, 23: 217, 24: 222, 25: 227, 26: 232, 27: 237, 28: 242, 29: 247, 30: 252, 31: 257, 32: 262, 33: 267, 34: 272, 35: 277, 36: 282, 37: 287, 38: 292, 39: 297, 40: 302, 41: 343, 42: 348, 43: 353, 44: 358, 45: 364, 46: 369, 47: 374, 48: 379, 49: 384, 50: 389, 51: 442, 52: 447, 53: 452, 54: 457, 55: 462, 56: 467, 57: 473, 58: 478, 59: 483, 60: 488, 61: 529, 62: 534, 63: 539, 64: 544, 65: 550, 66: 555, 67: 560, 68: 565, 69: 570, 70: 576, 71: 617, 72: 622, 73: 627, 74: 632, 75: 638, 76: 643, 77: 648, 78: 653, 79: 659, 80: 664, 81: 705, 82: 710, 83: 715, 84: 721, 85: 726, 86: 731, 87: 736, 88: 742, 89: 747, 90: 752 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 342,
    hp: 13226,
    def: 752,
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
        id: "sandrone-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sandrone-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.762863, 0.824957, 0.88705, 0.975755, 1.037848, 1.108812, 1.206388, 1.303964, 1.401539, 1.507985, 1.614431, 1.720877, 1.827323, 1.933769, 2.040215]) },
            ],
          },
        ],
      },
      {
        id: "sandrone-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sandrone-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.67197, 0.726665, 0.78136, 0.859496, 0.914191, 0.9767, 1.06265, 1.148599, 1.234549, 1.328312, 1.422075, 1.515838, 1.609602, 1.703365, 1.797128]) },
            ],
          },
        ],
      },
      {
        id: "sandrone-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sandrone-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([1.028035, 1.111713, 1.19539, 1.314929, 1.398606, 1.494237, 1.62573, 1.757223, 1.888716, 2.032163, 2.17561, 2.319057, 2.462503, 2.60595, 2.749397]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sandrone-charged",
      name: "Formule Phenomenale: Self-Evident Proposition",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sandrone-charged-1",
          name: "Charged Attack Sweeping Fire DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.43, 0.465, 0.5, 0.55, 0.585, 0.625, 0.68, 0.735, 0.79, 0.85, 0.91, 0.97, 1.03, 1.09, 1.15]) },
          ],
        },
        {
          id: "sandrone-charged-2",
          name: "Charged Attack Condensed Beam DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.2255, 1.32525, 1.425, 1.5675, 1.66725, 1.78125, 1.938, 2.09475, 2.2515, 2.4225, 2.5935, 2.7645, 2.9355, 3.1065, 3.2775]) },
          ],
        },
        {
          id: "sandrone-charged-3",
          name: "Charged Attack Condensed Beam Stellar-Conduct DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.817, 0.8835, 0.95, 1.045, 1.1115, 1.1875, 1.292, 1.3965, 1.501, 1.615, 1.729, 1.843, 1.957, 2.071, 2.185]) },
          ],
        },
        {
          id: "sandrone-charged-4",
          name: "Charged Attack Condensed Beam Stellar Swirl DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.2255, 1.32525, 1.425, 1.5675, 1.66725, 1.78125, 1.938, 2.09475, 2.2515, 2.4225, 2.5935, 2.7645, 2.9355, 3.1065, 3.2775]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "sandrone-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sandrone-plungeLow-1",
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
      id: "sandrone-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sandrone-plungeHigh-1",
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
      id: "sandrone-skill",
      name: "Formule Phenomenale: Differential Analysis",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(4),
      energyCost: 0,
      particles: { count: 1, element: "cryo" },
      instances: [
        {
          id: "sandrone-skill-1",
          name: "Prism Shot DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.324, 0.3483, 0.3726, 0.405, 0.4293, 0.4536, 0.486, 0.5184, 0.5508, 0.5832, 0.6156, 0.648, 0.6885, 0.729, 0.7695]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "sandrone-skill-2",
          name: "Prism Shot Stellar-Conduct DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.216, 0.2322, 0.2484, 0.27, 0.2862, 0.3024, 0.324, 0.3456, 0.3672, 0.3888, 0.4104, 0.432, 0.459, 0.486, 0.513]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "sandrone-skill-3",
          name: "Prism Shot Stellar Swirl DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.324, 0.3483, 0.3726, 0.405, 0.4293, 0.4536, 0.486, 0.5184, 0.5508, 0.5832, 0.6156, 0.648, 0.6885, 0.729, 0.7695]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sandrone-burst",
      name: "Formule Phenomenale: Q.E.D.",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "sandrone-burst-1-1",
          name: "Bombardment DMG (1/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.88216, 0.948322, 1.014484, 1.1027, 1.168862, 1.235024, 1.32324, 1.411456, 1.499672, 1.587888, 1.676104, 1.76432, 1.87459, 1.98486, 2.09513]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "sandrone-burst-1-2",
          name: "Bombardment DMG (2/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.88216, 0.948322, 1.014484, 1.1027, 1.168862, 1.235024, 1.32324, 1.411456, 1.499672, 1.587888, 1.676104, 1.76432, 1.87459, 1.98486, 2.09513]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "sandrone-burst-1-3",
          name: "Bombardment DMG (3/3)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.88216, 0.948322, 1.014484, 1.1027, 1.168862, 1.235024, 1.32324, 1.411456, 1.499672, 1.587888, 1.676104, 1.76432, 1.87459, 1.98486, 2.09513]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "sandrone-burst-2",
          name: "Convective Inhibition Ray DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.308, 3.5561, 3.8042, 4.135, 4.3831, 4.6312, 4.962, 5.2928, 5.6236, 5.9544, 6.2852, 6.616, 7.0295, 7.443, 7.8565]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "sandrone-burst-3",
          name: "Convective Inhibition Ray Stellar-Conduct DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.205333, 2.370733, 2.536133, 2.756667, 2.922067, 3.087467, 3.308, 3.528533, 3.749067, 3.9696, 4.190133, 4.410667, 4.686333, 4.962, 5.237667]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "sandrone-burst-4",
          name: "Convective Inhibition Ray Stellar Swirl DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([3.308, 3.5561, 3.8042, 4.135, 4.3831, 4.6312, 4.962, 5.2928, 5.6236, 5.9544, 6.2852, 6.616, 7.0295, 7.443, 7.8565]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "sandrone-a1", name: "Eternal Speculation Engine", unlockAscension: 1, effects: [] },
    { id: "sandrone-a4", name: "A Lady's Code of Conduct", unlockAscension: 4, effects: [] },
    { id: "sandrone-p3", name: "Stellar Jubilee: Light of Rationalisme", effects: [] },
    { id: "sandrone-p4", name: "A Caucus Prelude and a Long Tale", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sandrone-c1", name: "Morrow After the Golden Dusk", effects: [] },
    { level: 2, id: "sandrone-c2", name: "An Heiress Gazed Into the Looking-Glass", effects: [] },
    { level: 3, id: "sandrone-c3", name: "Refuse the Wake of Dusk, the Moonlit Yoke", effects: [], buffs: [{ id: "sandrone-c3", source: "Refuse the Wake of Dusk, the Moonlit Yoke", sourceCharacterId: "sandrone", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "sandrone-c4", name: "In Knowledge Lies the World's True Ground", effects: [] },
    { level: 5, id: "sandrone-c5", name: "Of All Beside, She Takes No Part", effects: [], buffs: [{ id: "sandrone-c5", source: "Of All Beside, She Takes No Part", sourceCharacterId: "sandrone", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "sandrone-c6", name: "Narcissus Wakes, Her Eyes Upon the Dawn", effects: [] },
  ],
  resources: [],
};

export const shenhe: GeneratedCharacter = {
  id: "shenhe",
  name: "Shenhe",
  element: "cryo",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1011, 2: 1095, 3: 1179, 4: 1264, 5: 1348, 6: 1433, 7: 1517, 8: 1602, 9: 1687, 10: 1771, 11: 1856, 12: 1941, 13: 2026, 14: 2112, 15: 2197, 16: 2282, 17: 2368, 18: 2453, 19: 2539, 20: 2624, 21: 3577, 22: 3663, 23: 3749, 24: 3835, 25: 3921, 26: 4008, 27: 4094, 28: 4180, 29: 4267, 30: 4353, 31: 4440, 32: 4527, 33: 4614, 34: 4700, 35: 4787, 36: 4875, 37: 4962, 38: 5049, 39: 5136, 40: 5224, 41: 5927, 42: 6015, 43: 6103, 44: 6190, 45: 6278, 46: 6366, 47: 6454, 48: 6542, 49: 6631, 50: 6719, 51: 7628, 52: 7717, 53: 7805, 54: 7894, 55: 7983, 56: 8072, 57: 8161, 58: 8250, 59: 8339, 60: 8429, 61: 9134, 62: 9223, 63: 9313, 64: 9402, 65: 9492, 66: 9582, 67: 9671, 68: 9761, 69: 9851, 70: 9941, 71: 10647, 72: 10738, 73: 10828, 74: 10918, 75: 11009, 76: 11099, 77: 11190, 78: 11281, 79: 11372, 80: 11463, 81: 12171, 82: 12262, 83: 12353, 84: 12444, 85: 12535, 86: 12627, 87: 12718, 88: 12810, 89: 12902, 90: 12993 } },
    atk: { byLevel: { 1: 24, 2: 26, 3: 28, 4: 30, 5: 32, 6: 34, 7: 35, 8: 37, 9: 39, 10: 41, 11: 43, 12: 45, 13: 47, 14: 49, 15: 51, 16: 53, 17: 55, 18: 57, 19: 59, 20: 61, 21: 84, 22: 86, 23: 88, 24: 90, 25: 92, 26: 94, 27: 96, 28: 98, 29: 100, 30: 102, 31: 104, 32: 106, 33: 108, 34: 110, 35: 112, 36: 114, 37: 116, 38: 118, 39: 120, 40: 122, 41: 139, 42: 141, 43: 143, 44: 145, 45: 147, 46: 149, 47: 151, 48: 153, 49: 155, 50: 157, 51: 178, 52: 180, 53: 182, 54: 185, 55: 187, 56: 189, 57: 191, 58: 193, 59: 195, 60: 197, 61: 214, 62: 216, 63: 218, 64: 220, 65: 222, 66: 224, 67: 226, 68: 228, 69: 230, 70: 232, 71: 249, 72: 251, 73: 253, 74: 255, 75: 257, 76: 259, 77: 262, 78: 264, 79: 266, 80: 268, 81: 285, 82: 287, 83: 289, 84: 291, 85: 293, 86: 295, 87: 297, 88: 299, 89: 302, 90: 304 } },
    def: { byLevel: { 1: 65, 2: 70, 3: 75, 4: 81, 5: 86, 6: 92, 7: 97, 8: 102, 9: 108, 10: 113, 11: 119, 12: 124, 13: 129, 14: 135, 15: 140, 16: 146, 17: 151, 18: 157, 19: 162, 20: 168, 21: 229, 22: 234, 23: 239, 24: 245, 25: 250, 26: 256, 27: 262, 28: 267, 29: 273, 30: 278, 31: 284, 32: 289, 33: 295, 34: 300, 35: 306, 36: 311, 37: 317, 38: 323, 39: 328, 40: 334, 41: 379, 42: 384, 43: 390, 44: 395, 45: 401, 46: 407, 47: 412, 48: 418, 49: 424, 50: 429, 51: 487, 52: 493, 53: 499, 54: 504, 55: 510, 56: 516, 57: 521, 58: 527, 59: 533, 60: 538, 61: 583, 62: 589, 63: 595, 64: 601, 65: 606, 66: 612, 67: 618, 68: 624, 69: 629, 70: 635, 71: 680, 72: 686, 73: 692, 74: 697, 75: 703, 76: 709, 77: 715, 78: 721, 79: 727, 80: 732, 81: 778, 82: 783, 83: 789, 84: 795, 85: 801, 86: 807, 87: 812, 88: 818, 89: 824, 90: 830 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 304,
    hp: 12993,
    def: 830,
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
        id: "shenhe-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shenhe-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.43258, 0.46779, 0.503, 0.5533, 0.58851, 0.62875, 0.68408, 0.73941, 0.79474, 0.8551, 0.91546, 0.97582, 1.03618, 1.09654, 1.1569]) },
            ],
          },
        ],
      },
      {
        id: "shenhe-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shenhe-na-2-1",
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
        id: "shenhe-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shenhe-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5332, 0.5766, 0.62, 0.682, 0.7254, 0.775, 0.8432, 0.9114, 0.9796, 1.054, 1.1284, 1.2028, 1.2772, 1.3516, 1.426]) },
            ],
          },
        ],
      },
      {
        id: "shenhe-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shenhe-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.26316, 0.28458, 0.306, 0.3366, 0.35802, 0.3825, 0.41616, 0.44982, 0.48348, 0.5202, 0.55692, 0.59364, 0.63036, 0.66708, 0.7038]) },
              { stat: "atk", table: talentTable([0.26316, 0.28458, 0.306, 0.3366, 0.35802, 0.3825, 0.41616, 0.44982, 0.48348, 0.5202, 0.55692, 0.59364, 0.63036, 0.66708, 0.7038]) },
            ],
          },
        ],
      },
      {
        id: "shenhe-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shenhe-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65618, 0.70959, 0.763, 0.8393, 0.89271, 0.95375, 1.03768, 1.12161, 1.20554, 1.2971, 1.38866, 1.48022, 1.57178, 1.66334, 1.7549]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "shenhe-charged",
      name: "Dawnstar Piercer",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shenhe-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.106734, 1.196817, 1.2869, 1.41559, 1.505673, 1.608625, 1.750184, 1.891743, 2.033302, 2.18773, 2.342158, 2.496586, 2.651014, 2.805442, 2.95987]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "shenhe-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shenhe-plungeLow-1",
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
      id: "shenhe-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shenhe-plungeHigh-1",
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
      id: "shenhe-skill",
      name: "Spring Spirit Summoning",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 7, element: "cryo" },
      instances: [
        {
          id: "shenhe-skill-1",
          name: "Tap Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.392, 1.4964, 1.6008, 1.74, 1.8444, 1.9488, 2.088, 2.2272, 2.3664, 2.5056, 2.6448, 2.784, 2.958, 3.132, 3.306]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "shenhe-skill-2",
          name: "Hold Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.888, 2.0296, 2.1712, 2.36, 2.5016, 2.6432, 2.832, 3.0208, 3.2096, 3.3984, 3.5872, 3.776, 4.012, 4.248, 4.484]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "shenhe-burst",
      name: "Divine Maiden's Deliverance",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "shenhe-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.008, 1.0836, 1.1592, 1.26, 1.3356, 1.4112, 1.512, 1.6128, 1.7136, 1.8144, 1.9152, 2.016, 2.142, 2.268, 2.394]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "shenhe-burst-2",
          name: "DoT",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.3312, 0.35604, 0.38088, 0.414, 0.43884, 0.46368, 0.4968, 0.52992, 0.56304, 0.59616, 0.62928, 0.6624, 0.7038, 0.7452, 0.7866]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "shenhe-a1", name: "Deific Embrace", unlockAscension: 1, effects: [] },
    { id: "shenhe-a4", name: "Spirit Communion Seal", unlockAscension: 4, effects: [] },
    { id: "shenhe-p3", name: "Precise Comings and Goings", effects: [] },
  ],
  constellations: [
    { level: 1, id: "shenhe-c1", name: "Clarity of Heart", effects: [] },
    { level: 2, id: "shenhe-c2", name: "Centered Spirit", effects: [] },
    { level: 3, id: "shenhe-c3", name: "Seclusion", effects: [], buffs: [{ id: "shenhe-c3", source: "Seclusion", sourceCharacterId: "shenhe", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "shenhe-c4", name: "Insight", effects: [] },
    { level: 5, id: "shenhe-c5", name: "Divine Attainment", effects: [], buffs: [{ id: "shenhe-c5", source: "Divine Attainment", sourceCharacterId: "shenhe", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "shenhe-c6", name: "Mystical Abandon", effects: [] },
  ],
  resources: [],
};

export const skirk: GeneratedCharacter = {
  id: "skirk",
  name: "Skirk",
  element: "cryo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 967, 2: 1047, 3: 1127, 4: 1208, 5: 1289, 6: 1370, 7: 1450, 8: 1531, 9: 1612, 10: 1693, 11: 1774, 12: 1855, 13: 1936, 14: 2018, 15: 2100, 16: 2181, 17: 2263, 18: 2344, 19: 2426, 20: 2508, 21: 3419, 22: 3501, 23: 3583, 24: 3665, 25: 3747, 26: 3830, 27: 3912, 28: 3995, 29: 4078, 30: 4160, 31: 4243, 32: 4326, 33: 4409, 34: 4492, 35: 4575, 36: 4659, 37: 4742, 38: 4825, 39: 4908, 40: 4992, 41: 5664, 42: 5748, 43: 5832, 44: 5916, 45: 6000, 46: 6084, 47: 6168, 48: 6252, 49: 6337, 50: 6421, 51: 7291, 52: 7376, 53: 7460, 54: 7545, 55: 7630, 56: 7715, 57: 7800, 58: 7885, 59: 7970, 60: 8055, 61: 8729, 62: 8814, 63: 8900, 64: 8985, 65: 9071, 66: 9157, 67: 9242, 68: 9328, 69: 9414, 70: 9501, 71: 10175, 72: 10262, 73: 10348, 74: 10435, 75: 10522, 76: 10608, 77: 10695, 78: 10782, 79: 10869, 80: 10956, 81: 11631, 82: 11718, 83: 11805, 84: 11892, 85: 11979, 86: 12067, 87: 12154, 88: 12242, 89: 12330, 90: 12417 } },
    atk: { byLevel: { 1: 28, 2: 30, 3: 33, 4: 35, 5: 37, 6: 40, 7: 42, 8: 44, 9: 47, 10: 49, 11: 51, 12: 54, 13: 56, 14: 58, 15: 61, 16: 63, 17: 65, 18: 68, 19: 70, 20: 72, 21: 99, 22: 101, 23: 104, 24: 106, 25: 108, 26: 111, 27: 113, 28: 115, 29: 118, 30: 120, 31: 123, 32: 125, 33: 127, 34: 130, 35: 132, 36: 135, 37: 137, 38: 139, 39: 142, 40: 144, 41: 164, 42: 166, 43: 169, 44: 171, 45: 173, 46: 176, 47: 178, 48: 181, 49: 183, 50: 186, 51: 211, 52: 213, 53: 216, 54: 218, 55: 220, 56: 223, 57: 225, 58: 228, 59: 230, 60: 233, 61: 252, 62: 255, 63: 257, 64: 260, 65: 262, 66: 265, 67: 267, 68: 270, 69: 272, 70: 274, 71: 294, 72: 297, 73: 299, 74: 301, 75: 304, 76: 306, 77: 309, 78: 312, 79: 314, 80: 317, 81: 336, 82: 339, 83: 341, 84: 344, 85: 346, 86: 349, 87: 351, 88: 354, 89: 356, 90: 359 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 78, 5: 84, 6: 89, 7: 94, 8: 99, 9: 105, 10: 110, 11: 115, 12: 120, 13: 126, 14: 131, 15: 136, 16: 142, 17: 147, 18: 152, 19: 158, 20: 163, 21: 222, 22: 227, 23: 233, 24: 238, 25: 243, 26: 249, 27: 254, 28: 259, 29: 265, 30: 270, 31: 275, 32: 281, 33: 286, 34: 292, 35: 297, 36: 302, 37: 308, 38: 313, 39: 319, 40: 324, 41: 368, 42: 373, 43: 379, 44: 384, 45: 390, 46: 395, 47: 400, 48: 406, 49: 411, 50: 417, 51: 473, 52: 479, 53: 484, 54: 490, 55: 495, 56: 501, 57: 506, 58: 512, 59: 517, 60: 523, 61: 567, 62: 572, 63: 578, 64: 583, 65: 589, 66: 595, 67: 600, 68: 606, 69: 611, 70: 617, 71: 661, 72: 666, 73: 672, 74: 677, 75: 683, 76: 689, 77: 694, 78: 700, 79: 706, 80: 711, 81: 755, 82: 761, 83: 766, 84: 772, 85: 778, 86: 783, 87: 789, 88: 795, 89: 801, 90: 806 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 359,
    hp: 12417,
    def: 806,
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
        id: "skirk-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "skirk-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.54524, 0.58962, 0.634, 0.6974, 0.74178, 0.7925, 0.86224, 0.93198, 1.00172, 1.0778, 1.15388, 1.22996, 1.30604, 1.38212, 1.4582]) },
            ],
          },
        ],
      },
      {
        id: "skirk-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "skirk-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.49794, 0.53847, 0.579, 0.6369, 0.67743, 0.72375, 0.78744, 0.85113, 0.91482, 0.9843, 1.05378, 1.12326, 1.19274, 1.26222, 1.3317]) },
            ],
          },
        ],
      },
      {
        id: "skirk-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "skirk-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.32422, 0.35061, 0.377, 0.4147, 0.44109, 0.47125, 0.51272, 0.55419, 0.59566, 0.6409, 0.68614, 0.73138, 0.77662, 0.82186, 0.8671]) },
              { stat: "atk", table: talentTable([0.32422, 0.35061, 0.377, 0.4147, 0.44109, 0.47125, 0.51272, 0.55419, 0.59566, 0.6409, 0.68614, 0.73138, 0.77662, 0.82186, 0.8671]) },
            ],
          },
        ],
      },
      {
        id: "skirk-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "skirk-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.60802, 0.65751, 0.707, 0.7777, 0.82719, 0.88375, 0.96152, 1.03929, 1.11706, 1.2019, 1.28674, 1.37158, 1.45642, 1.54126, 1.6261]) },
            ],
          },
        ],
      },
      {
        id: "skirk-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "skirk-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.82904, 0.89652, 0.964, 1.0604, 1.12788, 1.205, 1.31104, 1.41708, 1.52312, 1.6388, 1.75448, 1.87016, 1.98584, 2.10152, 2.2172]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "skirk-charged",
      name: "Havoc: Sunder",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "skirk-charged-1-1",
          name: "Charged Attack DMG (1/2)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.66822, 0.72261, 0.777, 0.8547, 0.90909, 0.97125, 1.05672, 1.14219, 1.22766, 1.3209, 1.41414, 1.50738, 1.60062, 1.69386, 1.7871]) },
          ],
        },
        {
          id: "skirk-charged-1-2",
          name: "Charged Attack DMG (2/2)",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.66822, 0.72261, 0.777, 0.8547, 0.90909, 0.97125, 1.05672, 1.14219, 1.22766, 1.3209, 1.41414, 1.50738, 1.60062, 1.69386, 1.7871]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "skirk-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "skirk-plungeLow-1",
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
      id: "skirk-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "skirk-plungeHigh-1",
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
      id: "skirk-skill",
      name: "Havoc: Warp",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(8),
      energyCost: 0,
      particles: { count: 4, element: "cryo" },
      instances: [
        {
          id: "skirk-skill-1",
          name: "1-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.328244, 1.436357, 1.54447, 1.698917, 1.80703, 1.930588, 2.100479, 2.270371, 2.440263, 2.625599, 2.810935, 2.996272, 3.181608, 3.366945, 3.552281]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-2",
          name: "2-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.197997, 1.295509, 1.39302, 1.532322, 1.629833, 1.741275, 1.894507, 2.047739, 2.200972, 2.368134, 2.535296, 2.702459, 2.869621, 3.036784, 3.203946]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-3",
          name: "3-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.75723, 0.818865, 0.8805, 0.96855, 1.030185, 1.100625, 1.19748, 1.294335, 1.39119, 1.49685, 1.60251, 1.70817, 1.81383, 1.91949, 2.02515]) },
            { stat: "atk", table: talentTable([0.75723, 0.818865, 0.8805, 0.96855, 1.030185, 1.100625, 1.19748, 1.294335, 1.39119, 1.49685, 1.60251, 1.70817, 1.81383, 1.91949, 2.02515]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-4",
          name: "4-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.80539, 0.870945, 0.9365, 1.03015, 1.095705, 1.170625, 1.27364, 1.376655, 1.47967, 1.59205, 1.70443, 1.81681, 1.92919, 2.04157, 2.15395]) },
            { stat: "atk", table: talentTable([0.80539, 0.870945, 0.9365, 1.03015, 1.095705, 1.170625, 1.27364, 1.376655, 1.47967, 1.59205, 1.70443, 1.81681, 1.92919, 2.04157, 2.15395]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-5",
          name: "5-Hit DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.966244, 2.126287, 2.28633, 2.514963, 2.675006, 2.857912, 3.109409, 3.360905, 3.612401, 3.886761, 4.161121, 4.43548, 4.70984, 4.984199, 5.258559]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-6-1",
          name: "Charged Attack DMG (1/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.44548, 0.48174, 0.518, 0.5698, 0.60606, 0.6475, 0.70448, 0.76146, 0.81844, 0.8806, 0.94276, 1.00492, 1.06708, 1.12924, 1.1914]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-6-2",
          name: "Charged Attack DMG (2/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.44548, 0.48174, 0.518, 0.5698, 0.60606, 0.6475, 0.70448, 0.76146, 0.81844, 0.8806, 0.94276, 1.00492, 1.06708, 1.12924, 1.1914]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-6-3",
          name: "Charged Attack DMG (3/3)",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.44548, 0.48174, 0.518, 0.5698, 0.60606, 0.6475, 0.70448, 0.76146, 0.81844, 0.8806, 0.94276, 1.00492, 1.06708, 1.12924, 1.1914]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-7",
          name: "Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024, 1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612, 1.70982]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-8",
          name: "Low Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162, 2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537, 3.418915]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "skirk-skill-9",
          name: "High Plunge DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112, 2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606, 4.27041]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "skirk-burst",
      name: "Havoc: Ruin",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 0,
      instances: [
        {
          id: "skirk-burst-1-1",
          name: "Slash DMG (1/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2276, 1.31967, 1.41174, 1.5345, 1.62657, 1.71864, 1.8414, 1.96416, 2.08692, 2.20968, 2.33244, 2.4552, 2.60865, 2.7621, 2.91555]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "skirk-burst-1-2",
          name: "Slash DMG (2/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2276, 1.31967, 1.41174, 1.5345, 1.62657, 1.71864, 1.8414, 1.96416, 2.08692, 2.20968, 2.33244, 2.4552, 2.60865, 2.7621, 2.91555]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "skirk-burst-1-3",
          name: "Slash DMG (3/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2276, 1.31967, 1.41174, 1.5345, 1.62657, 1.71864, 1.8414, 1.96416, 2.08692, 2.20968, 2.33244, 2.4552, 2.60865, 2.7621, 2.91555]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "skirk-burst-1-4",
          name: "Slash DMG (4/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2276, 1.31967, 1.41174, 1.5345, 1.62657, 1.71864, 1.8414, 1.96416, 2.08692, 2.20968, 2.33244, 2.4552, 2.60865, 2.7621, 2.91555]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "skirk-burst-1-5",
          name: "Slash DMG (5/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.2276, 1.31967, 1.41174, 1.5345, 1.62657, 1.71864, 1.8414, 1.96416, 2.08692, 2.20968, 2.33244, 2.4552, 2.60865, 2.7621, 2.91555]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "skirk-burst-2",
          name: "Final Slash DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([2.046, 2.19945, 2.3529, 2.5575, 2.71095, 2.8644, 3.069, 3.2736, 3.4782, 3.6828, 3.8874, 4.092, 4.34775, 4.6035, 4.85925]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "skirk-a1", name: "Reason Beyond Reason", unlockAscension: 1, effects: [] },
    { id: "skirk-a4", name: "Return to Oblivion", unlockAscension: 4, effects: [] },
    { id: "skirk-p3", name: "Mutual Weapons Mentorship", effects: [] },
  ],
  constellations: [
    { level: 1, id: "skirk-c1", name: "Far to Fall", effects: [] },
    { level: 2, id: "skirk-c2", name: "Into the Abyss", effects: [] },
    { level: 3, id: "skirk-c3", name: "Serendipitous Sin", effects: [], buffs: [{ id: "skirk-c3", source: "Serendipitous Sin", sourceCharacterId: "skirk", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "skirk-c4", name: "Fractured Flow", effects: [] },
    { level: 5, id: "skirk-c5", name: "End of Wishes", effects: [], buffs: [{ id: "skirk-c5", source: "End of Wishes", sourceCharacterId: "skirk", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "skirk-c6", name: "To the Source", effects: [] },
  ],
  resources: [],
};

export const travelerFCryo: GeneratedCharacter = {
  id: "traveler-f-cryo",
  name: "Traveler",
  element: "cryo",
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
        id: "traveler-f-cryo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-cryo-na-1-1",
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
        id: "traveler-f-cryo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-cryo-na-2-1",
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
        id: "traveler-f-cryo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-cryo-na-3-1",
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
        id: "traveler-f-cryo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-cryo-na-4-1",
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
        id: "traveler-f-cryo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-cryo-na-5-1",
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
      id: "traveler-f-cryo-charged",
      name: "Foreign Frostglint",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-cryo-charged-1",
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
      id: "traveler-f-cryo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-cryo-plungeLow-1",
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
      id: "traveler-f-cryo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-cryo-plungeHigh-1",
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
      id: "traveler-f-cryo-skill",
      name: "Ice Fog Piercer",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-cryo-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.9168, 0.98556, 1.05432, 1.146, 1.21476, 1.28352, 1.3752, 1.46688, 1.55856, 1.65024, 1.74192, 1.8336, 1.9482, 2.0628, 2.1774]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "traveler-f-cryo-skill-2",
          name: "Ice Crystal DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.21392, 0.229964, 0.246008, 0.2674, 0.283444, 0.299488, 0.32088, 0.342272, 0.363664, 0.385056, 0.406448, 0.42784, 0.45458, 0.48132, 0.50806]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-cryo-burst",
      name: "Frostbound Javelin",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-f-cryo-burst-1",
          name: "Ice Javelin DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.55131, 0.592658, 0.634007, 0.689137, 0.730486, 0.771834, 0.826965, 0.882096, 0.937227, 0.992358, 1.047489, 1.10262, 1.171534, 1.240447, 1.309361]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "traveler-f-cryo-burst-2",
          name: "Stellar-Conduct Ice Javelin Single Strike DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.36754, 0.395105, 0.422671, 0.459425, 0.48699, 0.514556, 0.55131, 0.588064, 0.624818, 0.661572, 0.698326, 0.73508, 0.781022, 0.826965, 0.872907]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "traveler-f-cryo-burst-3",
          name: "Stellar Swirl Ice Javelin Single Strike DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.55131, 0.592658, 0.634007, 0.689137, 0.730486, 0.771834, 0.826965, 0.882096, 0.937227, 0.992358, 1.047489, 1.10262, 1.171534, 1.240447, 1.309361]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-cryo-a1", name: "Ever-Keen Frost", unlockAscension: 1, effects: [] },
    { id: "traveler-f-cryo-a4", name: "Lucent Ice", unlockAscension: 4, effects: [], buffs: [{ id: "traveler-f-cryo-a4", source: "Lucent Ice", sourceCharacterId: "traveler-f-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, conversions: [{ sourceStat: "atk", targetStat: "elementalMastery", ratio: 0.08, maxCap: 160 }] }] },
    { id: "traveler-f-cryo-p3", name: "Stellar Jubilee: Illusory Frostmirror", effects: [] },
    { id: "traveler-f-cryo-p4", name: "Foreign Permafrost", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-cryo-c1", name: "Somber Freeze", effects: [] },
    { level: 2, id: "traveler-f-cryo-c2", name: "Frostfall Reverberation", effects: [] },
    { level: 3, id: "traveler-f-cryo-c3", name: "Glacial Shard", effects: [], buffs: [{ id: "traveler-f-cryo-c3", source: "Glacial Shard", sourceCharacterId: "traveler-f-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-f-cryo-c4", name: "Enduring Ice", effects: [] },
    { level: 5, id: "traveler-f-cryo-c5", name: "Bittercold Fog", effects: [], buffs: [{ id: "traveler-f-cryo-c5", source: "Bittercold Fog", sourceCharacterId: "traveler-f-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-f-cryo-c6", name: "Brumal Grimfrost", effects: [] },
  ],
  resources: [],
};

export const travelerMCryo: GeneratedCharacter = {
  id: "traveler-m-cryo",
  name: "Traveler",
  element: "cryo",
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
        id: "traveler-m-cryo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-cryo-na-1-1",
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
        id: "traveler-m-cryo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-cryo-na-2-1",
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
        id: "traveler-m-cryo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-cryo-na-3-1",
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
        id: "traveler-m-cryo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-cryo-na-4-1",
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
        id: "traveler-m-cryo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-cryo-na-5-1",
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
      id: "traveler-m-cryo-charged",
      name: "Foreign Frostglint",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-cryo-charged-1",
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
      id: "traveler-m-cryo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-cryo-plungeLow-1",
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
      id: "traveler-m-cryo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-cryo-plungeHigh-1",
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
      id: "traveler-m-cryo-skill",
      name: "Ice Fog Piercer",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-cryo-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.9168, 0.98556, 1.05432, 1.146, 1.21476, 1.28352, 1.3752, 1.46688, 1.55856, 1.65024, 1.74192, 1.8336, 1.9482, 2.0628, 2.1774]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
        {
          id: "traveler-m-cryo-skill-2",
          name: "Ice Crystal DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.21392, 0.229964, 0.246008, 0.2674, 0.283444, 0.299488, 0.32088, 0.342272, 0.363664, 0.385056, 0.406448, 0.42784, 0.45458, 0.48132, 0.50806]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-cryo-burst",
      name: "Frostbound Javelin",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-m-cryo-burst-1",
          name: "Ice Javelin DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.55131, 0.592658, 0.634007, 0.689137, 0.730486, 0.771834, 0.826965, 0.882096, 0.937227, 0.992358, 1.047489, 1.10262, 1.171534, 1.240447, 1.309361]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "traveler-m-cryo-burst-2",
          name: "Stellar-Conduct Ice Javelin Single Strike DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.36754, 0.395105, 0.422671, 0.459425, 0.48699, 0.514556, 0.55131, 0.588064, 0.624818, 0.661572, 0.698326, 0.73508, 0.781022, 0.826965, 0.872907]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "traveler-m-cryo-burst-3",
          name: "Stellar Swirl Ice Javelin Single Strike DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.55131, 0.592658, 0.634007, 0.689137, 0.730486, 0.771834, 0.826965, 0.882096, 0.937227, 0.992358, 1.047489, 1.10262, 1.171534, 1.240447, 1.309361]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-cryo-a1", name: "Ever-Keen Frost", unlockAscension: 1, effects: [] },
    { id: "traveler-m-cryo-a4", name: "Lucent Ice", unlockAscension: 4, effects: [], buffs: [{ id: "traveler-m-cryo-a4", source: "Lucent Ice", sourceCharacterId: "traveler-m-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, conversions: [{ sourceStat: "atk", targetStat: "elementalMastery", ratio: 0.08, maxCap: 160 }] }] },
    { id: "traveler-m-cryo-p3", name: "Stellar Jubilee: Illusory Frostmirror", effects: [] },
    { id: "traveler-m-cryo-p4", name: "Foreign Permafrost", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-cryo-c1", name: "Somber Freeze", effects: [] },
    { level: 2, id: "traveler-m-cryo-c2", name: "Frostfall Reverberation", effects: [] },
    { level: 3, id: "traveler-m-cryo-c3", name: "Glacial Shard", effects: [], buffs: [{ id: "traveler-m-cryo-c3", source: "Glacial Shard", sourceCharacterId: "traveler-m-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-m-cryo-c4", name: "Enduring Ice", effects: [] },
    { level: 5, id: "traveler-m-cryo-c5", name: "Bittercold Fog", effects: [], buffs: [{ id: "traveler-m-cryo-c5", source: "Bittercold Fog", sourceCharacterId: "traveler-m-cryo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-m-cryo-c6", name: "Brumal Grimfrost", effects: [] },
  ],
  resources: [],
};

export const wriothesley: GeneratedCharacter = {
  id: "wriothesley",
  name: "Wriothesley",
  element: "cryo",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1058, 2: 1146, 3: 1234, 4: 1323, 5: 1411, 6: 1499, 7: 1587, 8: 1676, 9: 1765, 10: 1853, 11: 1942, 12: 2031, 13: 2120, 14: 2209, 15: 2298, 16: 2387, 17: 2477, 18: 2566, 19: 2656, 20: 2745, 21: 3742, 22: 3832, 23: 3922, 24: 4012, 25: 4102, 26: 4193, 27: 4283, 28: 4373, 29: 4464, 30: 4554, 31: 4645, 32: 4736, 33: 4827, 34: 4917, 35: 5008, 36: 5100, 37: 5191, 38: 5282, 39: 5373, 40: 5465, 41: 6201, 42: 6293, 43: 6385, 44: 6476, 45: 6568, 46: 6660, 47: 6752, 48: 6844, 49: 6937, 50: 7029, 51: 7981, 52: 8074, 53: 8166, 54: 8259, 55: 8352, 56: 8445, 57: 8538, 58: 8632, 59: 8725, 60: 8818, 61: 9556, 62: 9649, 63: 9743, 64: 9836, 65: 9930, 66: 10024, 67: 10117, 68: 10212, 69: 10306, 70: 10400, 71: 11139, 72: 11234, 73: 11328, 74: 11422, 75: 11518, 76: 11612, 77: 11707, 78: 11802, 79: 11898, 80: 11993, 81: 12733, 82: 12828, 83: 12923, 84: 13018, 85: 13114, 86: 13210, 87: 13305, 88: 13401, 89: 13498, 90: 13593 } },
    atk: { byLevel: { 1: 24, 2: 26, 3: 28, 4: 30, 5: 32, 6: 34, 7: 36, 8: 38, 9: 40, 10: 42, 11: 44, 12: 46, 13: 48, 14: 51, 15: 53, 16: 55, 17: 57, 18: 59, 19: 61, 20: 63, 21: 86, 22: 88, 23: 90, 24: 92, 25: 94, 26: 96, 27: 98, 28: 100, 29: 102, 30: 104, 31: 106, 32: 108, 33: 110, 34: 112, 35: 115, 36: 117, 37: 119, 38: 121, 39: 123, 40: 125, 41: 142, 42: 144, 43: 146, 44: 148, 45: 150, 46: 152, 47: 154, 48: 157, 49: 159, 50: 161, 51: 183, 52: 185, 53: 187, 54: 189, 55: 191, 56: 193, 57: 195, 58: 197, 59: 200, 60: 202, 61: 219, 62: 221, 63: 223, 64: 225, 65: 227, 66: 229, 67: 231, 68: 234, 69: 236, 70: 238, 71: 255, 72: 257, 73: 259, 74: 261, 75: 263, 76: 266, 77: 268, 78: 270, 79: 272, 80: 274, 81: 291, 82: 293, 83: 296, 84: 298, 85: 300, 86: 302, 87: 304, 88: 307, 89: 309, 90: 311 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 119, 14: 124, 15: 129, 16: 134, 17: 139, 18: 144, 19: 149, 20: 154, 21: 210, 22: 215, 23: 220, 24: 225, 25: 230, 26: 235, 27: 240, 28: 246, 29: 251, 30: 256, 31: 261, 32: 266, 33: 271, 34: 276, 35: 281, 36: 286, 37: 291, 38: 297, 39: 302, 40: 307, 41: 348, 42: 353, 43: 358, 44: 364, 45: 369, 46: 374, 47: 379, 48: 384, 49: 389, 50: 395, 51: 448, 52: 453, 53: 458, 54: 464, 55: 469, 56: 474, 57: 479, 58: 485, 59: 490, 60: 495, 61: 536, 62: 542, 63: 547, 64: 552, 65: 558, 66: 563, 67: 568, 68: 573, 69: 579, 70: 584, 71: 625, 72: 631, 73: 636, 74: 641, 75: 647, 76: 652, 77: 657, 78: 663, 79: 668, 80: 673, 81: 715, 82: 720, 83: 726, 84: 731, 85: 736, 86: 742, 87: 747, 88: 752, 89: 758, 90: 763 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 311,
    hp: 13593,
    def: 763,
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
        id: "wriothesley-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wriothesley-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.533596, 0.577028, 0.62046, 0.682506, 0.725938, 0.775575, 0.843826, 0.912076, 0.980327, 1.054782, 1.129237, 1.203692, 1.278148, 1.352603, 1.427058]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "wriothesley-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wriothesley-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.517987, 0.560148, 0.60231, 0.662541, 0.704703, 0.752888, 0.819142, 0.885396, 0.95165, 1.023927, 1.096204, 1.168481, 1.240759, 1.313036, 1.385313]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "wriothesley-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wriothesley-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.672228, 0.726944, 0.78166, 0.859826, 0.914542, 0.977075, 1.063058, 1.14904, 1.235023, 1.328822, 1.422621, 1.51642, 1.61022, 1.704019, 1.797818]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "wriothesley-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wriothesley-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.379041, 0.409893, 0.440745, 0.48482, 0.515672, 0.550931, 0.599413, 0.647895, 0.696377, 0.749266, 0.802156, 0.855045, 0.907935, 0.960824, 1.013713]) },
              { stat: "atk", table: talentTable([0.379041, 0.409893, 0.440745, 0.48482, 0.515672, 0.550931, 0.599413, 0.647895, 0.696377, 0.749266, 0.802156, 0.855045, 0.907935, 0.960824, 1.013713]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
      {
        id: "wriothesley-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wriothesley-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "cryo",
            scaling: [
              { stat: "atk", table: talentTable([0.90742, 0.98128, 1.05514, 1.160654, 1.234514, 1.318925, 1.43499, 1.551056, 1.667121, 1.793738, 1.920355, 2.046972, 2.173588, 2.300205, 2.426822]) },
            ],
            application: { element: "cryo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "wriothesley-charged",
      name: "Forceful Fists of Frost",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wriothesley-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.5296, 1.64432, 1.75904, 1.912, 2.02672, 2.14144, 2.2944, 2.44736, 2.60032, 2.75328, 2.90624, 3.0592, 3.2504, 3.4416, 3.6328]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "wriothesley-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wriothesley-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "wriothesley-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wriothesley-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "wriothesley-skill",
      name: "Icefang Rush",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 1, element: "cryo" },
      instances: [
        {
          id: "wriothesley-skill-1",
          name: "Enhanced Repelling Fist DMG",
          damageType: "skill",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.431695, 1.457545, 1.483395, 1.517, 1.54285, 1.5687, 1.602305, 1.63591, 1.669515, 1.70312, 1.736725, 1.77033, 1.803935, 1.83754, 1.871145]) },
          ],
          application: { element: "cryo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "wriothesley-burst",
      name: "Darkgold Wolfbite",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "wriothesley-burst-1-1",
          name: "Skill DMG (1/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "wriothesley-burst-1-2",
          name: "Skill DMG (2/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "wriothesley-burst-1-3",
          name: "Skill DMG (3/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "wriothesley-burst-1-4",
          name: "Skill DMG (4/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "wriothesley-burst-1-5",
          name: "Skill DMG (5/5)",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([1.272, 1.3674, 1.4628, 1.59, 1.6854, 1.7808, 1.908, 2.0352, 2.1624, 2.2896, 2.4168, 2.544, 2.703, 2.862, 3.021]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
        {
          id: "wriothesley-burst-2",
          name: "Surging Blade DMG",
          damageType: "burst",
          element: "cryo",
          scaling: [
            { stat: "atk", table: talentTable([0.424, 0.4558, 0.4876, 0.53, 0.5618, 0.5936, 0.636, 0.6784, 0.7208, 0.7632, 0.8056, 0.848, 0.901, 0.954, 1.007]) },
          ],
          application: { element: "cryo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "wriothesley-a1", name: "There Shall Be a Plea for Justice", unlockAscension: 1, effects: [] },
    { id: "wriothesley-a4", name: "There Shall Be a Reckoning for Sin", unlockAscension: 4, effects: [] },
    { id: "wriothesley-p3", name: "The Duke's Grace", effects: [] },
    { id: "wriothesley-p4", name: "There Shall Be an Unveiling for Injustice", effects: [] },
  ],
  constellations: [
    { level: 1, id: "wriothesley-c1", name: "Terror for the Evildoers", effects: [] },
    { level: 2, id: "wriothesley-c2", name: "Shackles for the Arrogant", effects: [] },
    { level: 3, id: "wriothesley-c3", name: "Punishment for the Frauds", effects: [], buffs: [{ id: "wriothesley-c3", source: "Punishment for the Frauds", sourceCharacterId: "wriothesley", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "wriothesley-c4", name: "Redemption for the Suffering", effects: [] },
    { level: 5, id: "wriothesley-c5", name: "Mercy for the Wronged", effects: [], buffs: [{ id: "wriothesley-c5", source: "Mercy for the Wronged", sourceCharacterId: "wriothesley", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "wriothesley-c6", name: "Esteem for the Innocent", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   aloy.castTime: cast times are engine defaults, not sourced
//   aloy.constellations: 0 modelled, 1 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   aloy.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   aloy.skill.particles: skill particle yield not published by either source
//   charlotte.castTime: cast times are engine defaults, not sourced
//   charlotte.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   charlotte.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   chongyun.castTime: cast times are engine defaults, not sourced
//   chongyun.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   chongyun.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   citlali.castTime: cast times are engine defaults, not sourced
//   citlali.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   citlali.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   diona.castTime: cast times are engine defaults, not sourced
//   diona.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   diona.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   escoffier.castTime: cast times are engine defaults, not sourced
//   escoffier.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   escoffier.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   eula.castTime: cast times are engine defaults, not sourced
//   eula.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   eula.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   freminet.castTime: cast times are engine defaults, not sourced
//   freminet.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   freminet.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   ganyu.castTime: cast times are engine defaults, not sourced
//   ganyu.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   ganyu.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kaeya.castTime: cast times are engine defaults, not sourced
//   kaeya.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   kaeya.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kamisatoAyaka.castTime: cast times are engine defaults, not sourced
//   kamisatoAyaka.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   kamisatoAyaka.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   layla.castTime: cast times are engine defaults, not sourced
//   layla.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   layla.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lohen.castTime: cast times are engine defaults, not sourced
//   lohen.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   lohen.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   mika.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   mika.castTime: cast times are engine defaults, not sourced
//   mika.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   mika.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   odette.castTime: cast times are engine defaults, not sourced
//   odette.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   odette.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   qiqi.castTime: cast times are engine defaults, not sourced
//   qiqi.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   qiqi.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   rosaria.castTime: cast times are engine defaults, not sourced
//   rosaria.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   rosaria.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sandrone.castTime: cast times are engine defaults, not sourced
//   sandrone.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 8 unverified (text only) -- see perkEffects.ts
//   sandrone.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   shenhe.castTime: cast times are engine defaults, not sourced
//   shenhe.constellations: 2 modelled, 0 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   shenhe.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   skirk.burst.energyCost: burst energy cost missing from source
//   skirk.castTime: cast times are engine defaults, not sourced
//   skirk.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   skirk.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFCryo.castTime: cast times are engine defaults, not sourced
//   travelerFCryo.constellations: 3 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   travelerFCryo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFCryo.skill.particles: skill particle yield not published by either source
//   travelerMCryo.castTime: cast times are engine defaults, not sourced
//   travelerMCryo.constellations: 3 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   travelerMCryo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMCryo.skill.particles: skill particle yield not published by either source
//   wriothesley.castTime: cast times are engine defaults, not sourced
//   wriothesley.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   wriothesley.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const cryoGeneratedCharacters: readonly GeneratedCharacter[] = [
  aloy,
  charlotte,
  chongyun,
  citlali,
  diona,
  escoffier,
  eula,
  freminet,
  ganyu,
  kaeya,
  kamisatoAyaka,
  layla,
  lohen,
  mika,
  odette,
  qiqi,
  rosaria,
  sandrone,
  shenhe,
  skirk,
  travelerFCryo,
  travelerMCryo,
  wriothesley,
];
