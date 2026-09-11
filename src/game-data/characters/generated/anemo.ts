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


export const chasca: GeneratedCharacter = {
  id: "chasca",
  name: "Chasca",
  element: "anemo",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 763, 2: 826, 3: 889, 4: 953, 5: 1017, 6: 1081, 7: 1144, 8: 1208, 9: 1272, 10: 1335, 11: 1399, 12: 1464, 13: 1528, 14: 1592, 15: 1656, 16: 1721, 17: 1785, 18: 1849, 19: 1914, 20: 1978, 21: 2697, 22: 2762, 23: 2827, 24: 2892, 25: 2956, 26: 3022, 27: 3087, 28: 3152, 29: 3217, 30: 3282, 31: 3348, 32: 3413, 33: 3479, 34: 3544, 35: 3609, 36: 3676, 37: 3741, 38: 3807, 39: 3872, 40: 3939, 41: 4469, 42: 4535, 43: 4602, 44: 4667, 45: 4734, 46: 4800, 47: 4866, 48: 4933, 49: 5000, 50: 5066, 51: 5752, 52: 5819, 53: 5885, 54: 5952, 55: 6020, 56: 6087, 57: 6154, 58: 6221, 59: 6288, 60: 6355, 61: 6887, 62: 6954, 63: 7022, 64: 7089, 65: 7157, 66: 7225, 67: 7292, 68: 7360, 69: 7428, 70: 7495, 71: 8028, 72: 8097, 73: 8164, 74: 8232, 75: 8301, 76: 8369, 77: 8438, 78: 8506, 79: 8575, 80: 8643, 81: 9177, 82: 9245, 83: 9314, 84: 9383, 85: 9451, 86: 9521, 87: 9589, 88: 9659, 89: 9728, 90: 9797 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 31, 4: 34, 5: 36, 6: 38, 7: 40, 8: 43, 9: 45, 10: 47, 11: 50, 12: 52, 13: 54, 14: 56, 15: 59, 16: 61, 17: 63, 18: 65, 19: 68, 20: 70, 21: 95, 22: 98, 23: 100, 24: 102, 25: 105, 26: 107, 27: 109, 28: 112, 29: 114, 30: 116, 31: 119, 32: 121, 33: 123, 34: 125, 35: 128, 36: 130, 37: 132, 38: 135, 39: 137, 40: 139, 41: 158, 42: 161, 43: 163, 44: 165, 45: 168, 46: 170, 47: 172, 48: 175, 49: 177, 50: 179, 51: 204, 52: 206, 53: 208, 54: 211, 55: 213, 56: 215, 57: 218, 58: 220, 59: 223, 60: 225, 61: 244, 62: 246, 63: 249, 64: 251, 65: 253, 66: 256, 67: 258, 68: 261, 69: 263, 70: 265, 71: 284, 72: 287, 73: 289, 74: 291, 75: 294, 76: 296, 77: 299, 78: 301, 79: 304, 80: 306, 81: 325, 82: 327, 83: 330, 84: 332, 85: 335, 86: 337, 87: 339, 88: 342, 89: 344, 90: 347 } },
    def: { byLevel: { 1: 48, 2: 52, 3: 56, 4: 60, 5: 64, 6: 68, 7: 72, 8: 76, 9: 80, 10: 84, 11: 88, 12: 92, 13: 96, 14: 100, 15: 104, 16: 108, 17: 112, 18: 116, 19: 120, 20: 124, 21: 169, 22: 173, 23: 177, 24: 181, 25: 186, 26: 190, 27: 194, 28: 198, 29: 202, 30: 206, 31: 210, 32: 214, 33: 218, 34: 222, 35: 227, 36: 231, 37: 235, 38: 239, 39: 243, 40: 247, 41: 280, 42: 285, 43: 289, 44: 293, 45: 297, 46: 301, 47: 305, 48: 310, 49: 314, 50: 318, 51: 361, 52: 365, 53: 369, 54: 374, 55: 378, 56: 382, 57: 386, 58: 390, 59: 395, 60: 399, 61: 432, 62: 436, 63: 441, 64: 445, 65: 449, 66: 453, 67: 458, 68: 462, 69: 466, 70: 470, 71: 504, 72: 508, 73: 512, 74: 517, 75: 521, 76: 525, 77: 530, 78: 534, 79: 538, 80: 542, 81: 576, 82: 580, 83: 585, 84: 589, 85: 593, 86: 598, 87: 602, 88: 606, 89: 611, 90: 615 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 347,
    hp: 9797,
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
        id: "chasca-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chasca-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.480078, 0.519154, 0.55823, 0.614053, 0.653129, 0.697788, 0.759193, 0.820598, 0.882003, 0.948991, 1.015979, 1.082966, 1.149954, 1.216941, 1.283929]) },
            ],
          },
        ],
      },
      {
        id: "chasca-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chasca-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.445884, 0.482177, 0.51847, 0.570317, 0.60661, 0.648087, 0.705119, 0.762151, 0.819183, 0.881399, 0.943615, 1.005832, 1.068048, 1.130265, 1.192481]) },
            ],
          },
        ],
      },
      {
        id: "chasca-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chasca-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.296975, 0.321148, 0.34532, 0.379852, 0.404024, 0.43165, 0.469635, 0.50762, 0.545606, 0.587044, 0.628482, 0.669921, 0.711359, 0.752798, 0.794236]) },
            ],
          },
          {
            id: "chasca-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.296975, 0.321148, 0.34532, 0.379852, 0.404024, 0.43165, 0.469635, 0.50762, 0.545606, 0.587044, 0.628482, 0.669921, 0.711359, 0.752798, 0.794236]) },
            ],
          },
        ],
      },
      {
        id: "chasca-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "chasca-na-4-1-1",
            name: "4-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254672, 0.275401, 0.29613, 0.325743, 0.346472, 0.370163, 0.402737, 0.435311, 0.467885, 0.503421, 0.538957, 0.574492, 0.610028, 0.645563, 0.681099]) },
            ],
          },
          {
            id: "chasca-na-4-1-2",
            name: "4-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254672, 0.275401, 0.29613, 0.325743, 0.346472, 0.370163, 0.402737, 0.435311, 0.467885, 0.503421, 0.538957, 0.574492, 0.610028, 0.645563, 0.681099]) },
            ],
          },
          {
            id: "chasca-na-4-1-3",
            name: "4-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.254672, 0.275401, 0.29613, 0.325743, 0.346472, 0.370163, 0.402737, 0.435311, 0.467885, 0.503421, 0.538957, 0.574492, 0.610028, 0.645563, 0.681099]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "chasca-charged",
      name: "Phantom Feather Flurry",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chasca-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "chasca-charged-2",
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
      id: "chasca-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chasca-plungeLow-1",
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
      id: "chasca-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "chasca-plungeHigh-1",
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
      id: "chasca-skill",
      name: "Spirit Reins, Shadow Hunt",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6.5),
      energyCost: 0,
      particles: { count: 5, element: "anemo" },
      instances: [
        {
          id: "chasca-skill-1",
          name: "Resonance DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.6, 0.645, 0.69, 0.75, 0.795, 0.84, 0.9, 0.96, 1.02, 1.08, 1.14, 1.2, 1.275, 1.35, 1.425]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "chasca-skill-2",
          name: "Shadowhunt Shell DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.488, 0.5246, 0.5612, 0.61, 0.6466, 0.6832, 0.732, 0.7808, 0.8296, 0.8784, 0.9272, 0.976, 1.037, 1.098, 1.159]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "chasca-skill-3",
          name: "Shining Shadowhunt Shell DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.66572, 1.790649, 1.915578, 2.08215, 2.207079, 2.332008, 2.49858, 2.665152, 2.831724, 2.998296, 3.164868, 3.33144, 3.539655, 3.74787, 3.956085]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "chasca-skill-4",
          name: "Multitarget Fire Tap DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "chasca-burst",
      name: "Soul Reaper's Fatal Round",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "chasca-burst-1",
          name: "Galesplitting Soulseeker Shell DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.88, 0.946, 1.012, 1.1, 1.166, 1.232, 1.32, 1.408, 1.496, 1.584, 1.672, 1.76, 1.87, 1.98, 2.09]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "chasca-burst-2",
          name: "Soulseeker Shell DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.034, 1.11155, 1.1891, 1.2925, 1.37005, 1.4476, 1.551, 1.6544, 1.7578, 1.8612, 1.9646, 2.068, 2.19725, 2.3265, 2.45575]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "chasca-burst-3",
          name: "Radiant Soulseeker Shell DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.068, 2.2231, 2.3782, 2.585, 2.7401, 2.8952, 3.102, 3.3088, 3.5156, 3.7224, 3.9292, 4.136, 4.3945, 4.653, 4.9115]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "chasca-a1", name: "Bullet Trick", unlockAscension: 1, effects: [] },
    { id: "chasca-a4", name: "Intent to Cover", unlockAscension: 4, effects: [] },
    { id: "chasca-p3", name: "Night Realm's Gift: Everburning Heart", effects: [] },
    { id: "chasca-p4", name: "Mediation's True Meaning", effects: [] },
  ],
  constellations: [
    { level: 1, id: "chasca-c1", name: "Cylinder, the Restless Roulette", effects: [] },
    { level: 2, id: "chasca-c2", name: "Muzzle, the Searing Smoke", effects: [] },
    { level: 3, id: "chasca-c3", name: "Reins, Her Careful Control", effects: [], buffs: [{ id: "chasca-c3", source: "Reins, Her Careful Control", sourceCharacterId: "chasca", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "chasca-c4", name: "Sparks, the Sudden Shot", effects: [] },
    { level: 5, id: "chasca-c5", name: "Brim, the Sandshadow's Silhouette", effects: [], buffs: [{ id: "chasca-c5", source: "Brim, the Sandshadow's Silhouette", sourceCharacterId: "chasca", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "chasca-c6", name: "Showdown, the Glory of Battle", effects: [] },
  ],
  resources: [],
};

export const faruzan: GeneratedCharacter = {
  id: "faruzan",
  name: "Faruzan",
  element: "anemo",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 802, 2: 869, 3: 935, 4: 1001, 5: 1067, 6: 1134, 7: 1200, 8: 1266, 9: 1333, 10: 1399, 11: 1465, 12: 1531, 13: 1598, 14: 1663, 15: 1730, 16: 1797, 17: 1862, 18: 1929, 19: 1995, 20: 2061, 21: 2727, 22: 2793, 23: 2860, 24: 2926, 25: 2992, 26: 3058, 27: 3124, 28: 3190, 29: 3257, 30: 3323, 31: 3389, 32: 3456, 33: 3522, 34: 3588, 35: 3654, 36: 3721, 37: 3786, 38: 3853, 39: 3920, 40: 3985, 41: 4478, 42: 4544, 43: 4610, 44: 4676, 45: 4743, 46: 4809, 47: 4875, 48: 4942, 49: 5008, 50: 5074, 51: 5708, 52: 5774, 53: 5841, 54: 5907, 55: 5973, 56: 6039, 57: 6106, 58: 6172, 59: 6238, 60: 6305, 61: 6796, 62: 6863, 63: 6929, 64: 6995, 65: 7061, 66: 7128, 67: 7194, 68: 7260, 69: 7327, 70: 7393, 71: 7885, 72: 7951, 73: 8017, 74: 8084, 75: 8150, 76: 8216, 77: 8282, 78: 8349, 79: 8415, 80: 8481, 81: 8974, 82: 9040, 83: 9106, 84: 9172, 85: 9239, 86: 9304, 87: 9371, 88: 9437, 89: 9503, 90: 9570 } },
    atk: { byLevel: { 1: 16, 2: 18, 3: 19, 4: 21, 5: 22, 6: 23, 7: 25, 8: 26, 9: 27, 10: 29, 11: 30, 12: 31, 13: 33, 14: 34, 15: 36, 16: 37, 17: 38, 18: 40, 19: 41, 20: 42, 21: 56, 22: 57, 23: 59, 24: 60, 25: 61, 26: 63, 27: 64, 28: 65, 29: 67, 30: 68, 31: 70, 32: 71, 33: 72, 34: 74, 35: 75, 36: 76, 37: 78, 38: 79, 39: 80, 40: 82, 41: 92, 42: 93, 43: 95, 44: 96, 45: 97, 46: 99, 47: 100, 48: 101, 49: 103, 50: 104, 51: 117, 52: 119, 53: 120, 54: 121, 55: 123, 56: 124, 57: 125, 58: 127, 59: 128, 60: 129, 61: 140, 62: 141, 63: 142, 64: 144, 65: 145, 66: 146, 67: 148, 68: 149, 69: 150, 70: 152, 71: 162, 72: 163, 73: 165, 74: 166, 75: 167, 76: 169, 77: 170, 78: 171, 79: 173, 80: 174, 81: 184, 82: 186, 83: 187, 84: 188, 85: 190, 86: 191, 87: 192, 88: 194, 89: 195, 90: 196 } },
    def: { byLevel: { 1: 53, 2: 57, 3: 61, 4: 66, 5: 70, 6: 74, 7: 79, 8: 83, 9: 87, 10: 92, 11: 96, 12: 100, 13: 105, 14: 109, 15: 114, 16: 118, 17: 122, 18: 127, 19: 131, 20: 135, 21: 179, 22: 183, 23: 188, 24: 192, 25: 196, 26: 201, 27: 205, 28: 209, 29: 214, 30: 218, 31: 222, 32: 227, 33: 231, 34: 235, 35: 240, 36: 244, 37: 248, 38: 253, 39: 257, 40: 262, 41: 294, 42: 298, 43: 303, 44: 307, 45: 311, 46: 316, 47: 320, 48: 324, 49: 329, 50: 333, 51: 375, 52: 379, 53: 383, 54: 388, 55: 392, 56: 396, 57: 401, 58: 405, 59: 409, 60: 414, 61: 446, 62: 450, 63: 455, 64: 459, 65: 463, 66: 468, 67: 472, 68: 476, 69: 481, 70: 485, 71: 517, 72: 522, 73: 526, 74: 530, 75: 535, 76: 539, 77: 543, 78: 548, 79: 552, 80: 556, 81: 589, 82: 593, 83: 597, 84: 602, 85: 606, 86: 610, 87: 615, 88: 619, 89: 624, 90: 628 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 196,
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
        id: "faruzan-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "faruzan-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.447295, 0.483702, 0.52011, 0.572121, 0.608529, 0.650137, 0.70735, 0.764562, 0.821774, 0.884187, 0.9466, 1.009013, 1.071427, 1.13384, 1.196253]) },
            ],
          },
        ],
      },
      {
        id: "faruzan-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "faruzan-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.421864, 0.456202, 0.49054, 0.539594, 0.573932, 0.613175, 0.667134, 0.721094, 0.775053, 0.833918, 0.892783, 0.951648, 1.010512, 1.069377, 1.128242]) },
            ],
          },
        ],
      },
      {
        id: "faruzan-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "faruzan-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.531635, 0.574907, 0.61818, 0.679998, 0.723271, 0.772725, 0.840725, 0.908725, 0.976724, 1.050906, 1.125088, 1.199269, 1.273451, 1.347632, 1.421814]) },
            ],
          },
        ],
      },
      {
        id: "faruzan-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "faruzan-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.706206, 0.763688, 0.82117, 0.903287, 0.960769, 1.026463, 1.116791, 1.20712, 1.297449, 1.395989, 1.494529, 1.59307, 1.69161, 1.790151, 1.888691]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "faruzan-charged",
      name: "Parthian Shot",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "faruzan-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "faruzan-charged-2",
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
      id: "faruzan-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "faruzan-plungeLow-1",
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
      id: "faruzan-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "faruzan-plungeHigh-1",
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
      id: "faruzan-skill",
      name: "Wind Realm of Nasamjnin",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 2, element: "anemo" },
      instances: [
        {
          id: "faruzan-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.488, 1.5996, 1.7112, 1.86, 1.9716, 2.0832, 2.232, 2.3808, 2.5296, 2.6784, 2.8272, 2.976, 3.162, 3.348, 3.534]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "faruzan-skill-2",
          name: "Pressurized Collapse Vortex DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.08, 1.161, 1.242, 1.35, 1.431, 1.512, 1.62, 1.728, 1.836, 1.944, 2.052, 2.16, 2.295, 2.43, 2.565]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "faruzan-burst",
      name: "The Wind's Secret Ways",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "faruzan-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([3.776, 4.0592, 4.3424, 4.72, 5.0032, 5.2864, 5.664, 6.0416, 6.4192, 6.7968, 7.1744, 7.552, 8.024, 8.496, 8.968]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "faruzan-a1", name: "Impetuous Flow", unlockAscension: 1, effects: [] },
    { id: "faruzan-a4", name: "Lost Wisdom of the Seven Caverns", unlockAscension: 4, effects: [] },
    { id: "faruzan-p3", name: "Tomes Light the Path", effects: [] },
  ],
  constellations: [
    { level: 1, id: "faruzan-c1", name: "Truth by Any Means", effects: [] },
    { level: 2, id: "faruzan-c2", name: "Overzealous Intellect", effects: [] },
    { level: 3, id: "faruzan-c3", name: "Spirit-Orchard Stroll", effects: [], buffs: [{ id: "faruzan-c3", source: "Spirit-Orchard Stroll", sourceCharacterId: "faruzan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "faruzan-c4", name: "Divine Comprehension", effects: [] },
    { level: 5, id: "faruzan-c5", name: "Wonderland of Rumination", effects: [], buffs: [{ id: "faruzan-c5", source: "Wonderland of Rumination", sourceCharacterId: "faruzan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "faruzan-c6", name: "The Wondrous Path of Truth", effects: [] },
  ],
  resources: [],
};

export const ifa: GeneratedCharacter = {
  id: "ifa",
  name: "Ifa",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 845, 2: 915, 3: 985, 4: 1055, 5: 1124, 6: 1194, 7: 1264, 8: 1334, 9: 1404, 10: 1473, 11: 1543, 12: 1613, 13: 1683, 14: 1752, 15: 1822, 16: 1892, 17: 1962, 18: 2032, 19: 2101, 20: 2171, 21: 2872, 22: 2942, 23: 3012, 24: 3082, 25: 3152, 26: 3221, 27: 3291, 28: 3361, 29: 3431, 30: 3500, 31: 3570, 32: 3640, 33: 3710, 34: 3780, 35: 3849, 36: 3919, 37: 3989, 38: 4059, 39: 4129, 40: 4198, 41: 4717, 42: 4786, 43: 4857, 44: 4926, 45: 4996, 46: 5066, 47: 5135, 48: 5206, 49: 5275, 50: 5345, 51: 6013, 52: 6083, 53: 6153, 54: 6222, 55: 6292, 56: 6362, 57: 6432, 58: 6501, 59: 6571, 60: 6641, 61: 7159, 62: 7230, 63: 7299, 64: 7369, 65: 7438, 66: 7509, 67: 7579, 68: 7648, 69: 7718, 70: 7787, 71: 8306, 72: 8376, 73: 8446, 74: 8516, 75: 8585, 76: 8655, 77: 8725, 78: 8795, 79: 8864, 80: 8934, 81: 9453, 82: 9522, 83: 9593, 84: 9662, 85: 9732, 86: 9801, 87: 9871, 88: 9941, 89: 10011, 90: 10081 } },
    atk: { byLevel: { 1: 15, 2: 16, 3: 17, 4: 19, 5: 20, 6: 21, 7: 22, 8: 24, 9: 25, 10: 26, 11: 27, 12: 29, 13: 30, 14: 31, 15: 32, 16: 33, 17: 35, 18: 36, 19: 37, 20: 38, 21: 51, 22: 52, 23: 53, 24: 55, 25: 56, 26: 57, 27: 58, 28: 59, 29: 61, 30: 62, 31: 63, 32: 64, 33: 66, 34: 67, 35: 68, 36: 69, 37: 71, 38: 72, 39: 73, 40: 74, 41: 83, 42: 85, 43: 86, 44: 87, 45: 88, 46: 90, 47: 91, 48: 92, 49: 93, 50: 95, 51: 106, 52: 108, 53: 109, 54: 110, 55: 111, 56: 113, 57: 114, 58: 115, 59: 116, 60: 118, 61: 127, 62: 128, 63: 129, 64: 130, 65: 132, 66: 133, 67: 134, 68: 135, 69: 137, 70: 138, 71: 147, 72: 148, 73: 149, 74: 151, 75: 152, 76: 153, 77: 154, 78: 156, 79: 157, 80: 158, 81: 167, 82: 169, 83: 170, 84: 171, 85: 172, 86: 173, 87: 175, 88: 176, 89: 177, 90: 178 } },
    def: { byLevel: { 1: 51, 2: 55, 3: 59, 4: 63, 5: 68, 6: 72, 7: 76, 8: 80, 9: 84, 10: 88, 11: 93, 12: 97, 13: 101, 14: 105, 15: 109, 16: 114, 17: 118, 18: 122, 19: 126, 20: 130, 21: 172, 22: 177, 23: 181, 24: 185, 25: 189, 26: 193, 27: 198, 28: 202, 29: 206, 30: 210, 31: 214, 32: 219, 33: 223, 34: 227, 35: 231, 36: 235, 37: 240, 38: 244, 39: 248, 40: 252, 41: 283, 42: 287, 43: 292, 44: 296, 45: 300, 46: 304, 47: 308, 48: 313, 49: 317, 50: 321, 51: 361, 52: 365, 53: 370, 54: 374, 55: 378, 56: 382, 57: 386, 58: 390, 59: 395, 60: 399, 61: 430, 62: 434, 63: 438, 64: 443, 65: 447, 66: 451, 67: 455, 68: 459, 69: 463, 70: 468, 71: 499, 72: 503, 73: 507, 74: 511, 75: 516, 76: 520, 77: 524, 78: 528, 79: 532, 80: 537, 81: 568, 82: 572, 83: 576, 84: 580, 85: 584, 86: 589, 87: 593, 88: 597, 89: 601, 90: 605 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 178,
    hp: 10081,
    def: 605,
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
        id: "ifa-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ifa-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.536072, 0.576277, 0.616483, 0.67009, 0.710295, 0.750501, 0.804108, 0.857715, 0.911322, 0.96493, 1.018537, 1.072144, 1.139153, 1.206162, 1.273171]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "ifa-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ifa-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.474672, 0.510272, 0.545873, 0.59334, 0.62894, 0.664541, 0.712008, 0.759475, 0.806942, 0.85441, 0.901877, 0.949344, 1.008678, 1.068012, 1.127346]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "ifa-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "ifa-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.747584, 0.803653, 0.859722, 0.93448, 0.990549, 1.046618, 1.121376, 1.196134, 1.270893, 1.345651, 1.42041, 1.495168, 1.588616, 1.682064, 1.775512]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "ifa-charged",
      name: "Rite of Dispelling Winds",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ifa-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.4704, 1.58068, 1.69096, 1.838, 1.94828, 2.05856, 2.2056, 2.35264, 2.49968, 2.64672, 2.79376, 2.9408, 3.1246, 3.3084, 3.4922]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "ifa-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ifa-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "ifa-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "ifa-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "ifa-skill",
      name: "Airborne Disease Prevention",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(7.5),
      energyCost: 0,
      particles: { count: 9, element: "anemo" },
      instances: [
        {
          id: "ifa-skill-1",
          name: "Tonicshot DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.3336, 1.43362, 1.53364, 1.667, 1.76702, 1.86704, 2.0004, 2.13376, 2.26712, 2.40048, 2.53384, 2.6672, 2.8339, 3.0006, 3.1673]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "ifa-burst",
      name: "Compound Sedation Field",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "ifa-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([5.0848, 5.46616, 5.84752, 6.356, 6.73736, 7.11872, 7.6272, 8.13568, 8.64416, 9.15264, 9.66112, 10.1696, 10.8052, 11.4408, 12.0764]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "ifa-burst-2",
          name: "Sedation Mark DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.0896, 1.17132, 1.25304, 1.362, 1.44372, 1.52544, 1.6344, 1.74336, 1.85232, 1.96128, 2.07024, 2.1792, 2.3154, 2.4516, 2.5878]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "ifa-a1", name: "Field Medic's Vision", unlockAscension: 1, effects: [] },
    { id: "ifa-a4", name: "Mutual Aid Agreement", unlockAscension: 4, effects: [] },
    { id: "ifa-p3", name: "Night Realm's Gift: Focused Emergency Rescue", effects: [] },
    { id: "ifa-p4", name: "Tactical Warm Compress Bandaging", effects: [] },
  ],
  constellations: [
    { level: 1, id: "ifa-c1", name: "Vitiferous Elixir's Concoction", effects: [] },
    { level: 2, id: "ifa-c2", name: "Guiding Spirit of Ballistic Prayer", effects: [] },
    { level: 3, id: "ifa-c3", name: "Rebuttal in Negotiations With the Night", effects: [], buffs: [{ id: "ifa-c3", source: "Rebuttal in Negotiations With the Night", sourceCharacterId: "ifa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "ifa-c4", name: "Decayed Vessel's Permutation", effects: [] },
    { level: 5, id: "ifa-c5", name: "Vow of Universal Coexistence", effects: [], buffs: [{ id: "ifa-c5", source: "Vow of Universal Coexistence", sourceCharacterId: "ifa", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "ifa-c6", name: "Oath on a Feathered Knot", effects: [] },
  ],
  resources: [],
};

export const jahoda: GeneratedCharacter = {
  id: "jahoda",
  name: "Jahoda",
  element: "anemo",
  weaponType: "bow",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 809, 2: 876, 3: 942, 4: 1009, 5: 1076, 6: 1143, 7: 1209, 8: 1276, 9: 1343, 10: 1410, 11: 1477, 12: 1543, 13: 1610, 14: 1677, 15: 1744, 16: 1811, 17: 1877, 18: 1944, 19: 2011, 20: 2078, 21: 2748, 22: 2815, 23: 2882, 24: 2949, 25: 3016, 26: 3082, 27: 3149, 28: 3216, 29: 3283, 30: 3349, 31: 3416, 32: 3483, 33: 3550, 34: 3617, 35: 3683, 36: 3750, 37: 3817, 38: 3884, 39: 3951, 40: 4017, 41: 4514, 42: 4580, 43: 4647, 44: 4713, 45: 4780, 46: 4848, 47: 4914, 48: 4981, 49: 5047, 50: 5114, 51: 5753, 52: 5820, 53: 5887, 54: 5954, 55: 6021, 56: 6087, 57: 6154, 58: 6221, 59: 6288, 60: 6355, 61: 6850, 62: 6918, 63: 6984, 64: 7051, 65: 7117, 66: 7185, 67: 7252, 68: 7318, 69: 7385, 70: 7451, 71: 7948, 72: 8014, 73: 8081, 74: 8148, 75: 8215, 76: 8282, 77: 8348, 78: 8415, 79: 8482, 80: 8549, 81: 9045, 82: 9111, 83: 9179, 84: 9245, 85: 9312, 86: 9378, 87: 9445, 88: 9512, 89: 9579, 90: 9646 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 43, 18: 45, 19: 46, 20: 48, 21: 64, 22: 65, 23: 67, 24: 68, 25: 70, 26: 71, 27: 73, 28: 74, 29: 76, 30: 77, 31: 79, 32: 81, 33: 82, 34: 84, 35: 85, 36: 87, 37: 88, 38: 90, 39: 91, 40: 93, 41: 104, 42: 106, 43: 107, 44: 109, 45: 111, 46: 112, 47: 114, 48: 115, 49: 117, 50: 118, 51: 133, 52: 135, 53: 136, 54: 138, 55: 139, 56: 141, 57: 142, 58: 144, 59: 145, 60: 147, 61: 158, 62: 160, 63: 161, 64: 163, 65: 165, 66: 166, 67: 168, 68: 169, 69: 171, 70: 172, 71: 184, 72: 185, 73: 187, 74: 188, 75: 190, 76: 191, 77: 193, 78: 195, 79: 196, 80: 198, 81: 209, 82: 211, 83: 212, 84: 214, 85: 215, 86: 217, 87: 218, 88: 220, 89: 221, 90: 223 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 69, 7: 73, 8: 77, 9: 81, 10: 85, 11: 89, 12: 93, 13: 97, 14: 101, 15: 105, 16: 109, 17: 113, 18: 117, 19: 121, 20: 125, 21: 165, 22: 169, 23: 173, 24: 177, 25: 181, 26: 185, 27: 189, 28: 193, 29: 197, 30: 201, 31: 205, 32: 210, 33: 213, 34: 218, 35: 222, 36: 226, 37: 230, 38: 234, 39: 238, 40: 242, 41: 271, 42: 275, 43: 279, 44: 283, 45: 288, 46: 292, 47: 296, 48: 300, 49: 304, 50: 308, 51: 346, 52: 350, 53: 354, 54: 358, 55: 362, 56: 366, 57: 370, 58: 374, 59: 378, 60: 382, 61: 412, 62: 416, 63: 420, 64: 424, 65: 428, 66: 432, 67: 436, 68: 440, 69: 444, 70: 448, 71: 478, 72: 482, 73: 486, 74: 490, 75: 494, 76: 498, 77: 502, 78: 506, 79: 510, 80: 514, 81: 544, 82: 548, 83: 552, 84: 556, 85: 560, 86: 564, 87: 568, 88: 572, 89: 576, 90: 580 } },
  },
  ascensionBonus: {
    stat: "healingBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.185],
  },
  baseStats: {
    atk: 223,
    hp: 9646,
    def: 580,
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
        id: "jahoda-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jahoda-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.416739, 0.450659, 0.48458, 0.533038, 0.566959, 0.605725, 0.659029, 0.712333, 0.765636, 0.823786, 0.881936, 0.940085, 0.998235, 1.056384, 1.114534]) },
            ],
          },
        ],
      },
      {
        id: "jahoda-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jahoda-na-2-1-1",
            name: "2-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.192313, 0.207967, 0.22362, 0.245982, 0.261635, 0.279525, 0.304123, 0.328721, 0.35332, 0.380154, 0.406988, 0.433823, 0.460657, 0.487492, 0.514326]) },
            ],
          },
          {
            id: "jahoda-na-2-1-2",
            name: "2-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.192313, 0.207967, 0.22362, 0.245982, 0.261635, 0.279525, 0.304123, 0.328721, 0.35332, 0.380154, 0.406988, 0.433823, 0.460657, 0.487492, 0.514326]) },
            ],
          },
        ],
      },
      {
        id: "jahoda-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jahoda-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.511975, 0.553648, 0.59532, 0.654852, 0.696524, 0.74415, 0.809635, 0.87512, 0.940606, 1.012044, 1.083482, 1.154921, 1.226359, 1.297798, 1.369236]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "jahoda-charged",
      name: "Strike While the Arrow's Hot",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jahoda-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "jahoda-charged-2",
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
      id: "jahoda-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jahoda-plungeLow-1",
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
      id: "jahoda-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jahoda-plungeHigh-1",
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
      id: "jahoda-skill",
      name: "Savvy Strategy: Splitting the Spoils",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "anemo" },
      instances: [
        {
          id: "jahoda-skill-1",
          name: "Smoke Bomb DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.59, 1.70925, 1.8285, 1.9875, 2.10675, 2.226, 2.385, 2.544, 2.703, 2.862, 3.021, 3.18, 3.37875, 3.5775, 3.77625]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "jahoda-skill-2",
          name: "Unfilled Treasure Flask DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.908, 2.0511, 2.1942, 2.385, 2.5281, 2.6712, 2.862, 3.0528, 3.2436, 3.4344, 3.6252, 3.816, 4.0545, 4.293, 4.5315]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "jahoda-skill-3",
          name: "Filled Treasure Flask DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.12, 2.279, 2.438, 2.65, 2.809, 2.968, 3.18, 3.392, 3.604, 3.816, 4.028, 4.24, 4.505, 4.77, 5.035]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "jahoda-skill-4",
          name: "Meowball DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.28, 1.376, 1.472, 1.6, 1.696, 1.792, 1.92, 2.048, 2.176, 2.304, 2.432, 2.56, 2.72, 2.88, 3.04]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "jahoda-burst",
      name: "Hidden Aces: Seven Tools of the Hunter",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "jahoda-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.072, 2.2274, 2.3828, 2.59, 2.7454, 2.9008, 3.108, 3.3152, 3.5224, 3.7296, 3.9368, 4.144, 4.403, 4.662, 4.921]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "jahoda-burst-2",
          name: "Purrsonal Coordinated Assistance Robot DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.172664, 0.185614, 0.198564, 0.21583, 0.22878, 0.24173, 0.258996, 0.276262, 0.293529, 0.310795, 0.328062, 0.345328, 0.366911, 0.388494, 0.410077]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "jahoda-a1", name: "Plan to Get Paid", unlockAscension: 1, effects: [] },
    { id: "jahoda-a4", name: "Sweet Berry Bounty", unlockAscension: 4, effects: [] },
    { id: "jahoda-p3", name: "Moonsign Benediction: Rooftop Dash", effects: [] },
    { id: "jahoda-p4", name: "Backstreet Guile", effects: [] },
  ],
  constellations: [
    { level: 1, id: "jahoda-c1", name: "One More Flask!", effects: [] },
    { level: 2, id: "jahoda-c2", name: "Rogue's Quick Thinking", effects: [] },
    { level: 3, id: "jahoda-c3", name: "Desperate Gamble", effects: [], buffs: [{ id: "jahoda-c3", source: "Desperate Gamble", sourceCharacterId: "jahoda", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "jahoda-c4", name: "Wild Berry Amid the Dust", effects: [] },
    { level: 5, id: "jahoda-c5", name: "The Greatest Treasure", effects: [], buffs: [{ id: "jahoda-c5", source: "The Greatest Treasure", sourceCharacterId: "jahoda", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "jahoda-c6", name: "The Littlest Luck", effects: [] },
  ],
  resources: [],
};

export const jean: GeneratedCharacter = {
  id: "jean",
  name: "Jean",
  element: "anemo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1144, 2: 1239, 3: 1334, 4: 1430, 5: 1525, 6: 1621, 7: 1716, 8: 1812, 9: 1908, 10: 2003, 11: 2099, 12: 2195, 13: 2291, 14: 2389, 15: 2485, 16: 2581, 17: 2678, 18: 2774, 19: 2871, 20: 2967, 21: 4046, 22: 4143, 23: 4240, 24: 4337, 25: 4435, 26: 4533, 27: 4630, 28: 4727, 29: 4826, 30: 4923, 31: 5021, 32: 5120, 33: 5218, 34: 5315, 35: 5414, 36: 5513, 37: 5612, 38: 5710, 39: 5808, 40: 5908, 41: 6703, 42: 6803, 43: 6902, 44: 7001, 45: 7100, 46: 7200, 47: 7299, 48: 7399, 49: 7500, 50: 7599, 51: 8628, 52: 8728, 53: 8828, 54: 8929, 55: 9029, 56: 9130, 57: 9231, 58: 9331, 59: 9432, 60: 9533, 61: 10330, 62: 10431, 63: 10533, 64: 10633, 65: 10735, 66: 10837, 67: 10938, 68: 11040, 69: 11141, 70: 11243, 71: 12042, 72: 12145, 73: 12247, 74: 12349, 75: 12451, 76: 12553, 77: 12656, 78: 12759, 79: 12862, 80: 12965, 81: 13765, 82: 13868, 83: 13971, 84: 14074, 85: 14177, 86: 14281, 87: 14384, 88: 14488, 89: 14592, 90: 14695 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 29, 9: 31, 10: 33, 11: 34, 12: 36, 13: 37, 14: 39, 15: 40, 16: 42, 17: 44, 18: 45, 19: 47, 20: 48, 21: 66, 22: 67, 23: 69, 24: 71, 25: 72, 26: 74, 27: 75, 28: 77, 29: 79, 30: 80, 31: 82, 32: 83, 33: 85, 34: 87, 35: 88, 36: 90, 37: 91, 38: 93, 39: 95, 40: 96, 41: 109, 42: 111, 43: 112, 44: 114, 45: 116, 46: 117, 47: 119, 48: 120, 49: 122, 50: 124, 51: 140, 52: 142, 53: 144, 54: 145, 55: 147, 56: 149, 57: 150, 58: 152, 59: 154, 60: 155, 61: 168, 62: 170, 63: 171, 64: 173, 65: 175, 66: 176, 67: 178, 68: 180, 69: 181, 70: 183, 71: 196, 72: 198, 73: 199, 74: 201, 75: 203, 76: 204, 77: 206, 78: 208, 79: 209, 80: 211, 81: 224, 82: 226, 83: 227, 84: 229, 85: 231, 86: 232, 87: 234, 88: 236, 89: 238, 90: 239 } },
    def: { byLevel: { 1: 60, 2: 65, 3: 70, 4: 75, 5: 80, 6: 85, 7: 90, 8: 95, 9: 100, 10: 105, 11: 110, 12: 115, 13: 120, 14: 125, 15: 130, 16: 135, 17: 140, 18: 145, 19: 150, 20: 155, 21: 212, 22: 217, 23: 222, 24: 227, 25: 232, 26: 237, 27: 242, 28: 247, 29: 252, 30: 257, 31: 263, 32: 268, 33: 273, 34: 278, 35: 283, 36: 288, 37: 293, 38: 299, 39: 304, 40: 309, 41: 351, 42: 356, 43: 361, 44: 366, 45: 371, 46: 377, 47: 382, 48: 387, 49: 392, 50: 397, 51: 451, 52: 457, 53: 462, 54: 467, 55: 472, 56: 478, 57: 483, 58: 488, 59: 493, 60: 499, 61: 540, 62: 546, 63: 551, 64: 556, 65: 561, 66: 567, 67: 572, 68: 577, 69: 583, 70: 588, 71: 630, 72: 635, 73: 641, 74: 646, 75: 651, 76: 657, 77: 662, 78: 667, 79: 673, 80: 678, 81: 720, 82: 725, 83: 731, 84: 736, 85: 741, 86: 747, 87: 752, 88: 758, 89: 763, 90: 769 } },
  },
  ascensionBonus: {
    stat: "healingBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.221],
  },
  baseStats: {
    atk: 239,
    hp: 14695,
    def: 769,
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
        id: "jean-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jean-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.48332, 0.52266, 0.562, 0.6182, 0.65754, 0.7025, 0.76432, 0.82614, 0.88796, 0.9554, 1.032675, 1.12355, 1.214426, 1.305301, 1.404438]) },
            ],
          },
        ],
      },
      {
        id: "jean-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jean-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4558, 0.4929, 0.53, 0.583, 0.6201, 0.6625, 0.7208, 0.7791, 0.8374, 0.901, 0.973875, 1.059576, 1.145277, 1.230978, 1.32447]) },
            ],
          },
        ],
      },
      {
        id: "jean-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jean-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.60286, 0.65193, 0.701, 0.7711, 0.82017, 0.87625, 0.95336, 1.03047, 1.10758, 1.1917, 1.288088, 1.401439, 1.514791, 1.628143, 1.751799]) },
            ],
          },
        ],
      },
      {
        id: "jean-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jean-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.65876, 0.71238, 0.766, 0.8426, 0.89622, 0.9575, 1.04176, 1.12602, 1.21028, 1.3022, 1.407525, 1.531387, 1.655249, 1.779112, 1.914234]) },
            ],
          },
        ],
      },
      {
        id: "jean-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "jean-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.79206, 0.85653, 0.921, 1.0131, 1.07757, 1.15125, 1.25256, 1.35387, 1.45518, 1.5657, 1.692338, 1.841263, 1.990189, 2.139115, 2.301579]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "jean-charged",
      name: "Favonius Bladework",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jean-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.62024, 1.75212, 1.884, 2.0724, 2.20428, 2.355, 2.56224, 2.76948, 2.97672, 3.2028, 3.46185, 3.766493, 4.071136, 4.375778, 4.708116]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "jean-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jean-plungeLow-1",
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
      id: "jean-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "jean-plungeHigh-1",
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
      id: "jean-skill",
      name: "Gale Blade",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 3, element: "anemo" },
      instances: [
        {
          id: "jean-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.92, 3.139, 3.358, 3.65, 3.869, 4.088, 4.38, 4.672, 4.964, 5.256, 5.548, 5.84, 6.205, 6.57, 6.935]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "jean-burst",
      name: "Dandelion Breeze",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "jean-burst-1",
          name: "Burst DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([4.248, 4.5666, 4.8852, 5.31, 5.6286, 5.9472, 6.372, 6.7968, 7.2216, 7.6464, 8.0712, 8.496, 9.027, 9.558, 10.089]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "jean-burst-2",
          name: "Field Entering/Exiting DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.784, 0.8428, 0.9016, 0.98, 1.0388, 1.0976, 1.176, 1.2544, 1.3328, 1.4112, 1.4896, 1.568, 1.666, 1.764, 1.862]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "jean-a1", name: "Wind Companion", unlockAscension: 1, effects: [] },
    { id: "jean-a4", name: "Let the Wind Lead", unlockAscension: 4, effects: [] },
    { id: "jean-p3", name: "Guiding Breeze", effects: [] },
  ],
  constellations: [
    { level: 1, id: "jean-c1", name: "Spiraling Tempest", effects: [] },
    { level: 2, id: "jean-c2", name: "People's Aegis", effects: [] },
    { level: 3, id: "jean-c3", name: "When the West Wind Arises", effects: [], buffs: [{ id: "jean-c3", source: "When the West Wind Arises", sourceCharacterId: "jean", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "jean-c4", name: "Lands of Dandelion", effects: [] },
    { level: 5, id: "jean-c5", name: "Outbursting Gust", effects: [], buffs: [{ id: "jean-c5", source: "Outbursting Gust", sourceCharacterId: "jean", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "jean-c6", name: "Lion's Fang, Fair Protector of Mondstadt", effects: [] },
  ],
  resources: [],
};

export const kaedeharaKazuha: GeneratedCharacter = {
  id: "kaedehara-kazuha",
  name: "Kaedehara Kazuha",
  element: "anemo",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1125, 3: 1212, 4: 1299, 5: 1385, 6: 1472, 7: 1559, 8: 1646, 9: 1733, 10: 1819, 11: 1907, 12: 1994, 13: 2081, 14: 2170, 15: 2257, 16: 2344, 17: 2433, 18: 2520, 19: 2608, 20: 2695, 21: 3675, 22: 3763, 23: 3851, 24: 3940, 25: 4028, 26: 4117, 27: 4206, 28: 4294, 29: 4383, 30: 4472, 31: 4561, 32: 4650, 33: 4740, 34: 4828, 35: 4918, 36: 5008, 37: 5097, 38: 5187, 39: 5276, 40: 5366, 41: 6089, 42: 6179, 43: 6270, 44: 6359, 45: 6449, 46: 6540, 47: 6630, 48: 6721, 49: 6812, 50: 6902, 51: 7837, 52: 7928, 53: 8019, 54: 8110, 55: 8202, 56: 8293, 57: 8385, 58: 8476, 59: 8567, 60: 8659, 61: 9383, 62: 9475, 63: 9567, 64: 9659, 65: 9751, 66: 9844, 67: 9935, 68: 10028, 69: 10120, 70: 10213, 71: 10938, 72: 11032, 73: 11124, 74: 11217, 75: 11310, 76: 11403, 77: 11496, 78: 11590, 79: 11683, 80: 11777, 81: 12503, 82: 12597, 83: 12690, 84: 12784, 85: 12877, 86: 12972, 87: 13065, 88: 13160, 89: 13255, 90: 13348 } },
    atk: { byLevel: { 1: 23, 2: 25, 3: 27, 4: 29, 5: 31, 6: 33, 7: 35, 8: 37, 9: 39, 10: 40, 11: 42, 12: 44, 13: 46, 14: 48, 15: 50, 16: 52, 17: 54, 18: 56, 19: 58, 20: 60, 21: 82, 22: 84, 23: 86, 24: 88, 25: 90, 26: 91, 27: 93, 28: 95, 29: 97, 30: 99, 31: 101, 32: 103, 33: 105, 34: 107, 35: 109, 36: 111, 37: 113, 38: 115, 39: 117, 40: 119, 41: 135, 42: 137, 43: 139, 44: 141, 45: 143, 46: 145, 47: 147, 48: 149, 49: 151, 50: 153, 51: 174, 52: 176, 53: 178, 54: 180, 55: 182, 56: 184, 57: 186, 58: 188, 59: 190, 60: 192, 61: 208, 62: 211, 63: 213, 64: 215, 65: 217, 66: 219, 67: 221, 68: 223, 69: 225, 70: 227, 71: 243, 72: 245, 73: 247, 74: 249, 75: 251, 76: 253, 77: 255, 78: 258, 79: 260, 80: 262, 81: 278, 82: 280, 83: 282, 84: 284, 85: 286, 86: 288, 87: 290, 88: 292, 89: 295, 90: 297 } },
    def: { byLevel: { 1: 63, 2: 68, 3: 73, 4: 79, 5: 84, 6: 89, 7: 94, 8: 100, 9: 105, 10: 110, 11: 115, 12: 121, 13: 126, 14: 131, 15: 136, 16: 142, 17: 147, 18: 152, 19: 158, 20: 163, 21: 222, 22: 228, 23: 233, 24: 238, 25: 244, 26: 249, 27: 254, 28: 260, 29: 265, 30: 270, 31: 276, 32: 281, 33: 287, 34: 292, 35: 297, 36: 303, 37: 308, 38: 314, 39: 319, 40: 324, 41: 368, 42: 374, 43: 379, 44: 384, 45: 390, 46: 395, 47: 401, 48: 406, 49: 412, 50: 417, 51: 474, 52: 479, 53: 485, 54: 490, 55: 496, 56: 501, 57: 507, 58: 512, 59: 518, 60: 523, 61: 567, 62: 573, 63: 578, 64: 584, 65: 590, 66: 595, 67: 601, 68: 606, 69: 612, 70: 617, 71: 661, 72: 667, 73: 673, 74: 678, 75: 684, 76: 689, 77: 695, 78: 701, 79: 706, 80: 712, 81: 756, 82: 762, 83: 767, 84: 773, 85: 779, 86: 784, 87: 790, 88: 796, 89: 801, 90: 807 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 115],
  },
  baseStats: {
    atk: 297,
    hp: 13348,
    def: 807,
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
        id: "kaedehara-kazuha-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaedehara-kazuha-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44978, 0.48639, 0.523, 0.5753, 0.61191, 0.65375, 0.71128, 0.76881, 0.82634, 0.8891, 0.961013, 1.045582, 1.130151, 1.21472, 1.306977]) },
            ],
          },
        ],
      },
      {
        id: "kaedehara-kazuha-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaedehara-kazuha-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.45236, 0.48918, 0.526, 0.5786, 0.61542, 0.6575, 0.71536, 0.77322, 0.83108, 0.8942, 0.966525, 1.051579, 1.136633, 1.221688, 1.314474]) },
            ],
          },
        ],
      },
      {
        id: "kaedehara-kazuha-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaedehara-kazuha-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.258, 0.279, 0.3, 0.33, 0.351, 0.375, 0.408, 0.441, 0.474, 0.51, 0.55125, 0.59976, 0.64827, 0.69678, 0.7497]) },
              { stat: "atk", table: talentTable([0.3096, 0.3348, 0.36, 0.396, 0.4212, 0.45, 0.4896, 0.5292, 0.5688, 0.612, 0.6615, 0.719712, 0.777924, 0.836136, 0.89964]) },
            ],
          },
        ],
      },
      {
        id: "kaedehara-kazuha-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaedehara-kazuha-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.60716, 0.65658, 0.706, 0.7766, 0.82602, 0.8825, 0.96016, 1.03782, 1.11548, 1.2002, 1.297275, 1.411435, 1.525595, 1.639756, 1.764294]) },
            ],
          },
        ],
      },
      {
        id: "kaedehara-kazuha-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kaedehara-kazuha-na-5-1-1",
            name: "5-Hit DMG (1/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.2537, 0.27435, 0.295, 0.3245, 0.34515, 0.36875, 0.4012, 0.43365, 0.4661, 0.5015, 0.542063, 0.589764, 0.637465, 0.685167, 0.737205]) },
            ],
          },
          {
            id: "kaedehara-kazuha-na-5-1-2",
            name: "5-Hit DMG (2/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.2537, 0.27435, 0.295, 0.3245, 0.34515, 0.36875, 0.4012, 0.43365, 0.4661, 0.5015, 0.542063, 0.589764, 0.637465, 0.685167, 0.737205]) },
            ],
          },
          {
            id: "kaedehara-kazuha-na-5-1-3",
            name: "5-Hit DMG (3/3)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.2537, 0.27435, 0.295, 0.3245, 0.34515, 0.36875, 0.4012, 0.43365, 0.4661, 0.5015, 0.542063, 0.589764, 0.637465, 0.685167, 0.737205]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kaedehara-kazuha-charged",
      name: "Garyuu Bladework",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaedehara-kazuha-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.43, 0.465, 0.5, 0.55, 0.585, 0.625, 0.68, 0.735, 0.79, 0.85, 0.91875, 0.9996, 1.08045, 1.1613, 1.2495]) },
            { stat: "atk", table: talentTable([0.74648, 0.80724, 0.868, 0.9548, 1.01556, 1.085, 1.18048, 1.27596, 1.37144, 1.4756, 1.59495, 1.735306, 1.875661, 2.016017, 2.169132]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kaedehara-kazuha-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaedehara-kazuha-plungeLow-1",
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
      id: "kaedehara-kazuha-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kaedehara-kazuha-plungeHigh-1",
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
      id: "kaedehara-kazuha-skill",
      name: "Chihayaburu",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 7, element: "anemo" },
      instances: [
        {
          id: "kaedehara-kazuha-skill-1",
          name: "Tap Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.92, 2.064, 2.208, 2.4, 2.544, 2.688, 2.88, 3.072, 3.264, 3.456, 3.648, 3.84, 4.08, 4.32, 4.56]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "kaedehara-kazuha-skill-2",
          name: "Hold Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.608, 2.8036, 2.9992, 3.26, 3.4556, 3.6512, 3.912, 4.1728, 4.4336, 4.6944, 4.9552, 5.216, 5.542, 5.868, 6.194]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kaedehara-kazuha-burst",
      name: "Kazuha Slash",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "kaedehara-kazuha-burst-1",
          name: "Slashing DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.624, 2.8208, 3.0176, 3.28, 3.4768, 3.6736, 3.936, 4.1984, 4.4608, 4.7232, 4.9856, 5.248, 5.576, 5.904, 6.232]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "kaedehara-kazuha-burst-2",
          name: "DoT",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.2, 1.29, 1.38, 1.5, 1.59, 1.68, 1.8, 1.92, 2.04, 2.16, 2.28, 2.4, 2.55, 2.7, 2.85]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "kaedehara-kazuha-burst-3",
          name: "Additional Elemental DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kaedehara-kazuha-a1", name: "Soumon Swordsmanship", unlockAscension: 1, effects: [] },
    { id: "kaedehara-kazuha-a4", name: "Poetics of Fuubutsu", unlockAscension: 4, effects: [] },
    { id: "kaedehara-kazuha-p3", name: "Cloud Strider", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kaedehara-kazuha-c1", name: "Scarlet Hills", effects: [] },
    { level: 2, id: "kaedehara-kazuha-c2", name: "Yamaarashi Tailwind", effects: [] },
    { level: 3, id: "kaedehara-kazuha-c3", name: "Maple Monogatari", effects: [], buffs: [{ id: "kaedehara-kazuha-c3", source: "Maple Monogatari", sourceCharacterId: "kaedehara-kazuha", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kaedehara-kazuha-c4", name: "Oozora Genpou", effects: [] },
    { level: 5, id: "kaedehara-kazuha-c5", name: "Wisdom of Bansei", effects: [], buffs: [{ id: "kaedehara-kazuha-c5", source: "Wisdom of Bansei", sourceCharacterId: "kaedehara-kazuha", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kaedehara-kazuha-c6", name: "Crimson Momiji", effects: [] },
  ],
  resources: [],
};

export const lanYan: GeneratedCharacter = {
  id: "lan-yan",
  name: "Lan Yan",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 775, 2: 839, 3: 903, 4: 967, 5: 1031, 6: 1095, 7: 1159, 8: 1223, 9: 1287, 10: 1351, 11: 1415, 12: 1479, 13: 1543, 14: 1607, 15: 1671, 16: 1735, 17: 1799, 18: 1863, 19: 1927, 20: 1991, 21: 2634, 22: 2698, 23: 2762, 24: 2826, 25: 2890, 26: 2954, 27: 3018, 28: 3082, 29: 3146, 30: 3209, 31: 3274, 32: 3338, 33: 3402, 34: 3466, 35: 3529, 36: 3594, 37: 3657, 38: 3722, 39: 3786, 40: 3850, 41: 4325, 42: 4389, 43: 4453, 44: 4517, 45: 4581, 46: 4645, 47: 4709, 48: 4773, 49: 4837, 50: 4901, 51: 5513, 52: 5578, 53: 5642, 54: 5705, 55: 5770, 56: 5833, 57: 5898, 58: 5961, 59: 6025, 60: 6090, 61: 6565, 62: 6629, 63: 6693, 64: 6757, 65: 6820, 66: 6885, 67: 6949, 68: 7013, 69: 7077, 70: 7141, 71: 7616, 72: 7680, 73: 7744, 74: 7808, 75: 7872, 76: 7936, 77: 8000, 78: 8064, 79: 8128, 80: 8192, 81: 8668, 82: 8731, 83: 8796, 84: 8859, 85: 8924, 86: 8987, 87: 9051, 88: 9115, 89: 9179, 90: 9244 } },
    atk: { byLevel: { 1: 21, 2: 23, 3: 24, 4: 26, 5: 28, 6: 30, 7: 31, 8: 33, 9: 35, 10: 37, 11: 38, 12: 40, 13: 42, 14: 44, 15: 45, 16: 47, 17: 49, 18: 51, 19: 52, 20: 54, 21: 71, 22: 73, 23: 75, 24: 77, 25: 78, 26: 80, 27: 82, 28: 84, 29: 85, 30: 87, 31: 89, 32: 91, 33: 92, 34: 94, 35: 96, 36: 97, 37: 99, 38: 101, 39: 103, 40: 104, 41: 117, 42: 119, 43: 121, 44: 122, 45: 124, 46: 126, 47: 128, 48: 129, 49: 131, 50: 133, 51: 149, 52: 151, 53: 153, 54: 155, 55: 156, 56: 158, 57: 160, 58: 162, 59: 163, 60: 165, 61: 178, 62: 180, 63: 181, 64: 183, 65: 185, 66: 187, 67: 188, 68: 190, 69: 192, 70: 194, 71: 207, 72: 208, 73: 210, 74: 212, 75: 213, 76: 215, 77: 217, 78: 219, 79: 220, 80: 222, 81: 235, 82: 237, 83: 238, 84: 240, 85: 242, 86: 244, 87: 245, 88: 247, 89: 249, 90: 251 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 69, 7: 73, 8: 77, 9: 81, 10: 85, 11: 89, 12: 93, 13: 97, 14: 101, 15: 105, 16: 109, 17: 113, 18: 117, 19: 121, 20: 125, 21: 165, 22: 169, 23: 173, 24: 177, 25: 181, 26: 185, 27: 189, 28: 193, 29: 197, 30: 201, 31: 205, 32: 210, 33: 213, 34: 218, 35: 222, 36: 226, 37: 230, 38: 234, 39: 238, 40: 242, 41: 271, 42: 275, 43: 279, 44: 283, 45: 288, 46: 292, 47: 296, 48: 300, 49: 304, 50: 308, 51: 346, 52: 350, 53: 354, 54: 358, 55: 362, 56: 366, 57: 370, 58: 374, 59: 378, 60: 382, 61: 412, 62: 416, 63: 420, 64: 424, 65: 428, 66: 432, 67: 436, 68: 440, 69: 444, 70: 448, 71: 478, 72: 482, 73: 486, 74: 490, 75: 494, 76: 498, 77: 502, 78: 506, 79: 510, 80: 514, 81: 544, 82: 548, 83: 552, 84: 556, 85: 560, 86: 564, 87: 568, 88: 572, 89: 576, 90: 580 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 251,
    hp: 9244,
    def: 580,
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
        id: "lan-yan-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lan-yan-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.4144, 0.44548, 0.47656, 0.518, 0.54908, 0.58016, 0.6216, 0.66304, 0.70448, 0.74592, 0.78736, 0.8288, 0.8806, 0.9324, 0.9842]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "lan-yan-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lan-yan-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.20412, 0.219429, 0.234738, 0.25515, 0.270459, 0.285768, 0.30618, 0.326592, 0.347004, 0.367416, 0.387828, 0.40824, 0.433755, 0.45927, 0.484785]) },
              { stat: "atk", table: talentTable([0.24948, 0.268191, 0.286902, 0.31185, 0.330561, 0.349272, 0.37422, 0.399168, 0.424116, 0.449064, 0.474012, 0.49896, 0.530145, 0.56133, 0.592515]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "lan-yan-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lan-yan-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.2692, 0.28939, 0.30958, 0.3365, 0.35669, 0.37688, 0.4038, 0.43072, 0.45764, 0.48456, 0.51148, 0.5384, 0.57205, 0.6057, 0.63935]) },
              { stat: "atk", table: talentTable([0.2692, 0.28939, 0.30958, 0.3365, 0.35669, 0.37688, 0.4038, 0.43072, 0.45764, 0.48456, 0.51148, 0.5384, 0.57205, 0.6057, 0.63935]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "lan-yan-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lan-yan-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.6456, 0.69402, 0.74244, 0.807, 0.85542, 0.90384, 0.9684, 1.03296, 1.09752, 1.16208, 1.22664, 1.2912, 1.3719, 1.4526, 1.5333]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "lan-yan-charged",
      name: "Black Pheasant Strides on Water",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lan-yan-charged-1-1",
          name: "Charged Attack DMG (1/3)",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.3784, 0.40678, 0.43516, 0.473, 0.50138, 0.52976, 0.5676, 0.60544, 0.64328, 0.68112, 0.71896, 0.7568, 0.8041, 0.8514, 0.8987]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "lan-yan-charged-1-2",
          name: "Charged Attack DMG (2/3)",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.3784, 0.40678, 0.43516, 0.473, 0.50138, 0.52976, 0.5676, 0.60544, 0.64328, 0.68112, 0.71896, 0.7568, 0.8041, 0.8514, 0.8987]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "lan-yan-charged-1-3",
          name: "Charged Attack DMG (3/3)",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.3784, 0.40678, 0.43516, 0.473, 0.50138, 0.52976, 0.5676, 0.60544, 0.64328, 0.68112, 0.71896, 0.7568, 0.8041, 0.8514, 0.8987]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "lan-yan-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lan-yan-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "lan-yan-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lan-yan-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "lan-yan-skill",
      name: "Swallow-Wisp Pinion Dance",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 3, element: "anemo" },
      instances: [
        {
          id: "lan-yan-skill-1",
          name: "Feathermoon Ring DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.96256, 1.034752, 1.106944, 1.2032, 1.275392, 1.347584, 1.44384, 1.540096, 1.636352, 1.732608, 1.828864, 1.92512, 2.04544, 2.16576, 2.28608]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lan-yan-burst",
      name: "Lustrous Moonrise",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "lan-yan-burst-1-1",
          name: "Skill DMG (1/3)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.41064, 2.591438, 2.772236, 3.0133, 3.194098, 3.374896, 3.61596, 3.857024, 4.098088, 4.339152, 4.580216, 4.82128, 5.12261, 5.42394, 5.72527]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "lan-yan-burst-1-2",
          name: "Skill DMG (2/3)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.41064, 2.591438, 2.772236, 3.0133, 3.194098, 3.374896, 3.61596, 3.857024, 4.098088, 4.339152, 4.580216, 4.82128, 5.12261, 5.42394, 5.72527]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "lan-yan-burst-1-3",
          name: "Skill DMG (3/3)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.41064, 2.591438, 2.772236, 3.0133, 3.194098, 3.374896, 3.61596, 3.857024, 4.098088, 4.339152, 4.580216, 4.82128, 5.12261, 5.42394, 5.72527]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "lan-yan-a1", name: "Four Sealing Divination Charms", unlockAscension: 1, effects: [] },
    { id: "lan-yan-a4", name: "Skyfeather Evil-Subduing Charm", unlockAscension: 4, effects: [] },
    { id: "lan-yan-p3", name: "Thought and Intent, Like Silken Scent", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lan-yan-c1", name: "\"As One Might Stride Betwixt the Clouds\"", effects: [] },
    { level: 2, id: "lan-yan-c2", name: "\"Dance Vestments Billow Like Rainbow Jade\"", effects: [] },
    { level: 3, id: "lan-yan-c3", name: "\"On White Wings Pierce Through Cloud and Fog\"", effects: [], buffs: [{ id: "lan-yan-c3", source: "\"On White Wings Pierce Through Cloud and Fog\"", sourceCharacterId: "lan-yan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "lan-yan-c4", name: "\"With Drakefalcon's Blood-Pearls Adorned\"", effects: [] },
    { level: 5, id: "lan-yan-c5", name: "\"Having Met You, My Heart is Gladdened\"", effects: [], buffs: [{ id: "lan-yan-c5", source: "\"Having Met You, My Heart is Gladdened\"", sourceCharacterId: "lan-yan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "lan-yan-c6", name: "\"Let Us Away on Sylphic Wing, the Silvered Ornaments to Ring\"", effects: [] },
  ],
  resources: [],
};

export const lynette: GeneratedCharacter = {
  id: "lynette",
  name: "Lynette",
  element: "anemo",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1039, 2: 1126, 3: 1211, 4: 1297, 5: 1382, 6: 1469, 7: 1554, 8: 1640, 9: 1727, 10: 1812, 11: 1898, 12: 1983, 13: 2070, 14: 2155, 15: 2241, 16: 2327, 17: 2413, 18: 2499, 19: 2584, 20: 2670, 21: 3532, 22: 3618, 23: 3705, 24: 3790, 25: 3876, 26: 3961, 27: 4048, 28: 4133, 29: 4219, 30: 4304, 31: 4391, 32: 4477, 33: 4562, 34: 4648, 35: 4734, 36: 4820, 37: 4905, 38: 4991, 39: 5078, 40: 5163, 41: 5801, 42: 5886, 43: 5972, 44: 6058, 45: 6144, 46: 6230, 47: 6315, 48: 6402, 49: 6487, 50: 6573, 51: 7394, 52: 7480, 53: 7567, 54: 7652, 55: 7738, 56: 7823, 57: 7910, 58: 7995, 59: 8081, 60: 8168, 61: 8804, 62: 8891, 63: 8976, 64: 9062, 65: 9147, 66: 9234, 67: 9320, 68: 9405, 69: 9492, 70: 9577, 71: 10215, 72: 10300, 73: 10386, 74: 10473, 75: 10558, 76: 10644, 77: 10729, 78: 10816, 79: 10901, 80: 10987, 81: 11625, 82: 11710, 83: 11797, 84: 11882, 85: 11968, 86: 12053, 87: 12140, 88: 12225, 89: 12311, 90: 12397 } },
    atk: { byLevel: { 1: 19, 2: 21, 3: 23, 4: 24, 5: 26, 6: 27, 7: 29, 8: 31, 9: 32, 10: 34, 11: 35, 12: 37, 13: 39, 14: 40, 15: 42, 16: 43, 17: 45, 18: 47, 19: 48, 20: 50, 21: 66, 22: 68, 23: 69, 24: 71, 25: 72, 26: 74, 27: 76, 28: 77, 29: 79, 30: 80, 31: 82, 32: 84, 33: 85, 34: 87, 35: 88, 36: 90, 37: 92, 38: 93, 39: 95, 40: 96, 41: 108, 42: 110, 43: 112, 44: 113, 45: 115, 46: 116, 47: 118, 48: 120, 49: 121, 50: 123, 51: 138, 52: 140, 53: 141, 54: 143, 55: 145, 56: 146, 57: 148, 58: 149, 59: 151, 60: 153, 61: 164, 62: 166, 63: 168, 64: 169, 65: 171, 66: 172, 67: 174, 68: 176, 69: 177, 70: 179, 71: 191, 72: 192, 73: 194, 74: 196, 75: 197, 76: 199, 77: 200, 78: 202, 79: 204, 80: 205, 81: 217, 82: 219, 83: 220, 84: 222, 85: 223, 86: 225, 87: 227, 88: 228, 89: 230, 90: 232 } },
    def: { byLevel: { 1: 60, 2: 65, 3: 70, 4: 74, 5: 79, 6: 84, 7: 89, 8: 94, 9: 99, 10: 104, 11: 109, 12: 114, 13: 119, 14: 124, 15: 129, 16: 134, 17: 139, 18: 143, 19: 148, 20: 153, 21: 203, 22: 208, 23: 213, 24: 218, 25: 223, 26: 227, 27: 232, 28: 237, 29: 242, 30: 247, 31: 252, 32: 257, 33: 262, 34: 267, 35: 272, 36: 277, 37: 282, 38: 287, 39: 292, 40: 296, 41: 333, 42: 338, 43: 343, 44: 348, 45: 353, 46: 358, 47: 363, 48: 368, 49: 372, 50: 377, 51: 425, 52: 430, 53: 434, 54: 439, 55: 444, 56: 449, 57: 454, 58: 459, 59: 464, 60: 469, 61: 506, 62: 511, 63: 515, 64: 520, 65: 525, 66: 530, 67: 535, 68: 540, 69: 545, 70: 550, 71: 587, 72: 591, 73: 596, 74: 601, 75: 606, 76: 611, 77: 616, 78: 621, 79: 626, 80: 631, 81: 668, 82: 672, 83: 677, 84: 682, 85: 687, 86: 692, 87: 697, 88: 702, 89: 707, 90: 712 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "anemo",
  },
  baseStats: {
    atk: 232,
    hp: 12397,
    def: 712,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { anemo: 0.24 },
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "lynette-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lynette-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.430817, 0.465884, 0.50095, 0.551045, 0.586112, 0.626188, 0.681292, 0.736397, 0.791501, 0.851615, 0.911729, 0.971843, 1.031957, 1.092071, 1.152185]) },
            ],
          },
        ],
      },
      {
        id: "lynette-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lynette-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.376121, 0.406736, 0.43735, 0.481085, 0.511699, 0.546687, 0.594796, 0.642904, 0.691013, 0.743495, 0.795977, 0.848459, 0.900941, 0.953423, 1.005905]) },
            ],
          },
        ],
      },
      {
        id: "lynette-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lynette-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.27864, 0.30132, 0.324, 0.3564, 0.37908, 0.405, 0.44064, 0.47628, 0.51192, 0.5508, 0.58968, 0.62856, 0.66744, 0.70632, 0.7452]) },
              { stat: "atk", table: talentTable([0.215929, 0.233504, 0.25108, 0.276188, 0.293764, 0.31385, 0.341469, 0.369088, 0.396706, 0.426836, 0.456966, 0.487095, 0.517225, 0.547354, 0.577484]) },
            ],
          },
        ],
      },
      {
        id: "lynette-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "lynette-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.631541, 0.682945, 0.73435, 0.807785, 0.859189, 0.917937, 0.998716, 1.079494, 1.160273, 1.248395, 1.336517, 1.424639, 1.512761, 1.600883, 1.689005]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "lynette-charged",
      name: "Rapid Ritesword",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lynette-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.44204, 0.47802, 0.514, 0.5654, 0.60138, 0.6425, 0.69904, 0.75558, 0.81212, 0.8738, 0.93548, 0.99716, 1.05884, 1.12052, 1.1822]) },
            { stat: "atk", table: talentTable([0.61404, 0.66402, 0.714, 0.7854, 0.83538, 0.8925, 0.97104, 1.04958, 1.12812, 1.2138, 1.29948, 1.38516, 1.47084, 1.55652, 1.6422]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "lynette-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lynette-plungeLow-1",
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
      id: "lynette-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "lynette-plungeHigh-1",
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
      id: "lynette-skill",
      name: "Enigmatic Feint",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 1, element: "anemo" },
      instances: [
        {
          id: "lynette-skill-1",
          name: "Enigma Thrust DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.68, 2.881, 3.082, 3.35, 3.551, 3.752, 4.02, 4.288, 4.556, 4.824, 5.092, 5.36, 5.695, 6.03, 6.365]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "lynette-skill-2",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.312, 0.3354, 0.3588, 0.39, 0.4134, 0.4368, 0.468, 0.4992, 0.5304, 0.5616, 0.5928, 0.624, 0.663, 0.702, 0.741]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "lynette-burst",
      name: "Magic Trick: Astonishing Shift",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "lynette-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.832, 0.8944, 0.9568, 1.04, 1.1024, 1.1648, 1.248, 1.3312, 1.4144, 1.4976, 1.5808, 1.664, 1.768, 1.872, 1.976]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "lynette-burst-2",
          name: "Bogglecat Box DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.512, 0.5504, 0.5888, 0.64, 0.6784, 0.7168, 0.768, 0.8192, 0.8704, 0.9216, 0.9728, 1.024, 1.088, 1.152, 1.216]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "lynette-burst-3",
          name: "Vivid Shot DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.456, 0.4902, 0.5244, 0.57, 0.6042, 0.6384, 0.684, 0.7296, 0.7752, 0.8208, 0.8664, 0.912, 0.969, 1.026, 1.083]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "lynette-a1", name: "Sophisticated Synergy", unlockAscension: 1, effects: [] },
    { id: "lynette-a4", name: "Props Positively Prepped", unlockAscension: 4, effects: [] },
    { id: "lynette-p3", name: "Loci-Based Mnemonics", effects: [] },
  ],
  constellations: [
    { level: 1, id: "lynette-c1", name: "A Cold Blade Like a Shadow", effects: [] },
    { level: 2, id: "lynette-c2", name: "Endless Mysteries", effects: [] },
    { level: 3, id: "lynette-c3", name: "Cognition-Inverting Gaze", effects: [], buffs: [{ id: "lynette-c3", source: "Cognition-Inverting Gaze", sourceCharacterId: "lynette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "lynette-c4", name: "Tacit Coordination", effects: [] },
    { level: 5, id: "lynette-c5", name: "Obscuring Ambiguity", effects: [], buffs: [{ id: "lynette-c5", source: "Obscuring Ambiguity", sourceCharacterId: "lynette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "lynette-c6", name: "Watchful Eye", effects: [] },
  ],
  resources: [],
};

export const prune: GeneratedCharacter = {
  id: "prune",
  name: "Prune",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 811, 2: 879, 3: 945, 4: 1013, 5: 1079, 6: 1147, 7: 1213, 8: 1281, 9: 1348, 10: 1414, 11: 1482, 12: 1548, 13: 1616, 14: 1682, 15: 1750, 16: 1817, 17: 1883, 18: 1951, 19: 2017, 20: 2085, 21: 2757, 22: 2825, 23: 2892, 24: 2959, 25: 3026, 26: 3093, 27: 3160, 28: 3227, 29: 3294, 30: 3360, 31: 3428, 32: 3495, 33: 3562, 34: 3629, 35: 3696, 36: 3763, 37: 3829, 38: 3897, 39: 3964, 40: 4031, 41: 4529, 42: 4595, 43: 4663, 44: 4729, 45: 4797, 46: 4864, 47: 4931, 48: 4998, 49: 5064, 50: 5132, 51: 5773, 52: 5840, 53: 5907, 54: 5974, 55: 6041, 56: 6108, 57: 6175, 58: 6242, 59: 6309, 60: 6376, 61: 6874, 62: 6941, 63: 7008, 64: 7075, 65: 7141, 66: 7209, 67: 7276, 68: 7343, 69: 7410, 70: 7477, 71: 7975, 72: 8041, 73: 8109, 74: 8176, 75: 8242, 76: 8310, 77: 8376, 78: 8444, 79: 8510, 80: 8578, 81: 9076, 82: 9142, 83: 9210, 84: 9276, 85: 9344, 86: 9410, 87: 9477, 88: 9544, 89: 9611, 90: 9679 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 23, 5: 25, 6: 26, 7: 28, 8: 29, 9: 31, 10: 32, 11: 34, 12: 35, 13: 37, 14: 38, 15: 40, 16: 41, 17: 43, 18: 45, 19: 46, 20: 48, 21: 63, 22: 64, 23: 66, 24: 68, 25: 69, 26: 71, 27: 72, 28: 74, 29: 75, 30: 77, 31: 78, 32: 80, 33: 81, 34: 83, 35: 84, 36: 86, 37: 87, 38: 89, 39: 90, 40: 92, 41: 103, 42: 105, 43: 106, 44: 108, 45: 109, 46: 111, 47: 113, 48: 114, 49: 116, 50: 117, 51: 132, 52: 133, 53: 135, 54: 136, 55: 138, 56: 139, 57: 141, 58: 142, 59: 144, 60: 146, 61: 157, 62: 158, 63: 160, 64: 161, 65: 163, 66: 165, 67: 166, 68: 168, 69: 169, 70: 171, 71: 182, 72: 184, 73: 185, 74: 187, 75: 188, 76: 190, 77: 191, 78: 193, 79: 194, 80: 196, 81: 207, 82: 209, 83: 210, 84: 212, 85: 213, 86: 215, 87: 216, 88: 218, 89: 219, 90: 221 } },
    def: { byLevel: { 1: 49, 2: 53, 3: 57, 4: 61, 5: 65, 6: 69, 7: 73, 8: 77, 9: 81, 10: 85, 11: 89, 12: 93, 13: 97, 14: 101, 15: 105, 16: 109, 17: 113, 18: 117, 19: 121, 20: 125, 21: 165, 22: 169, 23: 173, 24: 177, 25: 181, 26: 185, 27: 189, 28: 193, 29: 197, 30: 201, 31: 205, 32: 210, 33: 213, 34: 218, 35: 222, 36: 226, 37: 230, 38: 234, 39: 238, 40: 242, 41: 271, 42: 275, 43: 279, 44: 283, 45: 288, 46: 292, 47: 296, 48: 300, 49: 304, 50: 308, 51: 346, 52: 350, 53: 354, 54: 358, 55: 362, 56: 366, 57: 370, 58: 374, 59: 378, 60: 382, 61: 412, 62: 416, 63: 420, 64: 424, 65: 428, 66: 432, 67: 436, 68: 440, 69: 444, 70: 448, 71: 478, 72: 482, 73: 486, 74: 490, 75: 494, 76: 498, 77: 502, 78: 506, 79: 510, 80: 514, 81: 544, 82: 548, 83: 552, 84: 556, 85: 560, 86: 564, 87: 568, 88: 572, 89: 576, 90: 580 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 221,
    hp: 9679,
    def: 580,
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
        id: "prune-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "prune-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.486208, 0.522674, 0.559139, 0.60776, 0.644226, 0.680691, 0.729312, 0.777933, 0.826554, 0.875174, 0.923795, 0.972416, 1.033192, 1.093968, 1.154744]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "prune-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "prune-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.482808, 0.519019, 0.555229, 0.60351, 0.639721, 0.675931, 0.724212, 0.772493, 0.820774, 0.869054, 0.917335, 0.965616, 1.025967, 1.086318, 1.146669]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "prune-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "prune-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.679768, 0.730751, 0.781733, 0.84971, 0.900693, 0.951675, 1.019652, 1.087629, 1.155606, 1.223582, 1.291559, 1.359536, 1.444507, 1.529478, 1.614449]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "prune-charged",
      name: "Badaboom! Hexbuster Hammer",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "prune-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.3352, 1.43534, 1.53548, 1.669, 1.76914, 1.86928, 2.0028, 2.13632, 2.26984, 2.40336, 2.53688, 2.6704, 2.8373, 3.0042, 3.1711]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "prune-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "prune-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "prune-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "prune-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "prune-skill",
      name: "Ring-A-Ding-Ding! Hexhunter Chime",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 5, element: "anemo" },
      instances: [
        {
          id: "prune-skill-1",
          name: "Ring-A-Ding-Ding! Hexhunter Chime DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.6744, 1.79998, 1.92556, 2.093, 2.21858, 2.34416, 2.5116, 2.67904, 2.84648, 3.01392, 3.18136, 3.3488, 3.5581, 3.7674, 3.9767]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "prune-skill-2",
          name: "Clang Clang! Witch-tribution Comes! DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.0456, 2.19902, 2.35244, 2.557, 2.71042, 2.86384, 3.0684, 3.27296, 3.47752, 3.68208, 3.88664, 4.0912, 4.3469, 4.6026, 4.8583]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "prune-burst",
      name: "The Bell Tolls! The Hunt Is On!",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "prune-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.9696, 1.04232, 1.11504, 1.212, 1.28472, 1.35744, 1.4544, 1.55136, 1.64832, 1.74528, 1.84224, 1.9392, 2.0604, 2.1816, 2.3028]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "prune-burst-2",
          name: "Witchlure Bell DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.7044, 0.75723, 0.81006, 0.8805, 0.93333, 0.98616, 1.0566, 1.12704, 1.19748, 1.26792, 1.33836, 1.4088, 1.49685, 1.5849, 1.67295]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "prune-a1", name: "Verdict and Punishment", unlockAscension: 1, effects: [] },
    { id: "prune-a4", name: "Tolling Synchronicity", unlockAscension: 4, effects: [] },
    { id: "prune-p3", name: "Tinker-Tink, Clank, and Bang!", effects: [] },
    { id: "prune-p4", name: "Witch's Eve Rite: Witchseeker's Vow", effects: [] },
  ],
  constellations: [
    { level: 1, id: "prune-c1", name: "With a Vow to Rescue, the Journey Begins", effects: [] },
    { level: 2, id: "prune-c2", name: "Useful for Cleaning Messy Baggage, Elemental Powers Are Indeed", effects: [] },
    { level: 3, id: "prune-c3", name: "The Caravan Exits the Mountain Pass, the Scenery Once More Changed", effects: [], buffs: [{ id: "prune-c3", source: "The Caravan Exits the Mountain Pass, the Scenery Once More Changed", sourceCharacterId: "prune", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "prune-c4", name: "Looking Back Following the Wind, One's Shadow Still Halved", effects: [] },
    { level: 5, id: "prune-c5", name: "100 Defeats? No Problem, Tomorrow, We Go Again", effects: [], buffs: [{ id: "prune-c5", source: "100 Defeats? No Problem, Tomorrow, We Go Again", sourceCharacterId: "prune", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "prune-c6", name: "And That's the Story! Share It With Your Friends!", effects: [] },
  ],
  resources: [],
};

export const sayu: GeneratedCharacter = {
  id: "sayu",
  name: "Sayu",
  element: "anemo",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 994, 2: 1076, 3: 1158, 4: 1240, 5: 1322, 6: 1404, 7: 1486, 8: 1568, 9: 1651, 10: 1732, 11: 1815, 12: 1896, 13: 1979, 14: 2060, 15: 2143, 16: 2225, 17: 2307, 18: 2389, 19: 2471, 20: 2553, 21: 3377, 22: 3460, 23: 3542, 24: 3624, 25: 3706, 26: 3788, 27: 3870, 28: 3952, 29: 4034, 30: 4116, 31: 4198, 32: 4281, 33: 4362, 34: 4445, 35: 4526, 36: 4609, 37: 4690, 38: 4773, 39: 4855, 40: 4937, 41: 5547, 42: 5628, 43: 5711, 44: 5792, 45: 5875, 46: 5957, 47: 6038, 48: 6121, 49: 6202, 50: 6285, 51: 7070, 52: 7152, 53: 7235, 54: 7316, 55: 7399, 56: 7480, 57: 7563, 58: 7644, 59: 7727, 60: 7809, 61: 8418, 62: 8501, 63: 8582, 64: 8665, 65: 8746, 66: 8829, 67: 8911, 68: 8993, 69: 9075, 70: 9157, 71: 9767, 72: 9848, 73: 9931, 74: 10013, 75: 10095, 76: 10177, 77: 10259, 78: 10341, 79: 10423, 80: 10505, 81: 11115, 82: 11197, 83: 11279, 84: 11361, 85: 11443, 86: 11525, 87: 11607, 88: 11689, 89: 11771, 90: 11854 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 24, 4: 26, 5: 27, 6: 29, 7: 31, 8: 32, 9: 34, 10: 36, 11: 37, 12: 39, 13: 41, 14: 42, 15: 44, 16: 46, 17: 48, 18: 49, 19: 51, 20: 53, 21: 70, 22: 71, 23: 73, 24: 75, 25: 76, 26: 78, 27: 80, 28: 81, 29: 83, 30: 85, 31: 87, 32: 88, 33: 90, 34: 92, 35: 93, 36: 95, 37: 97, 38: 98, 39: 100, 40: 102, 41: 114, 42: 116, 43: 118, 44: 119, 45: 121, 46: 123, 47: 124, 48: 126, 49: 128, 50: 130, 51: 146, 52: 147, 53: 149, 54: 151, 55: 152, 56: 154, 57: 156, 58: 158, 59: 159, 60: 161, 61: 173, 62: 175, 63: 177, 64: 179, 65: 180, 66: 182, 67: 184, 68: 185, 69: 187, 70: 189, 71: 201, 72: 203, 73: 205, 74: 206, 75: 208, 76: 210, 77: 211, 78: 213, 79: 215, 80: 216, 81: 229, 82: 231, 83: 232, 84: 234, 85: 236, 86: 237, 87: 239, 88: 241, 89: 243, 90: 244 } },
    def: { byLevel: { 1: 62, 2: 68, 3: 73, 4: 78, 5: 83, 6: 88, 7: 93, 8: 99, 9: 104, 10: 109, 11: 114, 12: 119, 13: 124, 14: 129, 15: 135, 16: 140, 17: 145, 18: 150, 19: 155, 20: 160, 21: 212, 22: 217, 23: 223, 24: 228, 25: 233, 26: 238, 27: 243, 28: 248, 29: 253, 30: 259, 31: 264, 32: 269, 33: 274, 34: 279, 35: 284, 36: 290, 37: 295, 38: 300, 39: 305, 40: 310, 41: 348, 42: 354, 43: 359, 44: 364, 45: 369, 46: 374, 47: 379, 48: 385, 49: 390, 50: 395, 51: 444, 52: 449, 53: 454, 54: 460, 55: 465, 56: 470, 57: 475, 58: 480, 59: 485, 60: 491, 61: 529, 62: 534, 63: 539, 64: 544, 65: 549, 66: 555, 67: 560, 68: 565, 69: 570, 70: 575, 71: 614, 72: 619, 73: 624, 74: 629, 75: 634, 76: 639, 77: 644, 78: 650, 79: 655, 80: 660, 81: 698, 82: 703, 83: 709, 84: 714, 85: 719, 86: 724, 87: 729, 88: 734, 89: 739, 90: 745 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 244,
    hp: 11854,
    def: 745,
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
        id: "sayu-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sayu-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7224, 0.7812, 0.84, 0.924, 0.9828, 1.05, 1.1424, 1.2348, 1.3272, 1.428, 1.5435, 1.679328, 1.815156, 1.950984, 2.09916]) },
            ],
          },
        ],
      },
      {
        id: "sayu-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sayu-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7138, 0.7719, 0.83, 0.913, 0.9711, 1.0375, 1.1288, 1.2201, 1.3114, 1.411, 1.525125, 1.659336, 1.793547, 1.927758, 2.07417]) },
            ],
          },
        ],
      },
      {
        id: "sayu-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sayu-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4343, 0.46965, 0.505, 0.5555, 0.59085, 0.63125, 0.6868, 0.74235, 0.7979, 0.8585, 0.927937, 1.009596, 1.091255, 1.172913, 1.261995]) },
              { stat: "atk", table: talentTable([0.4343, 0.46965, 0.505, 0.5555, 0.59085, 0.63125, 0.6868, 0.74235, 0.7979, 0.8585, 0.927937, 1.009596, 1.091255, 1.172913, 1.261995]) },
            ],
          },
        ],
      },
      {
        id: "sayu-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sayu-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.98126, 1.06113, 1.141, 1.2551, 1.33497, 1.42625, 1.55176, 1.67727, 1.80278, 1.9397, 2.096588, 2.281087, 2.465587, 2.650087, 2.851359]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sayu-charged",
      name: "Shuumatsuban Ninja Blade",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sayu-charged-1",
          name: "Charged Attack Spinning DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.625455, 0.676364, 0.727273, 0.8, 0.850909, 0.909091, 0.989091, 1.069091, 1.149091, 1.236364, 1.336364, 1.453964, 1.571564, 1.689164, 1.817455]) },
          ],
        },
        {
          id: "sayu-charged-2",
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
      id: "sayu-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sayu-plungeLow-1",
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
      id: "sayu-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sayu-plungeHigh-1",
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
      id: "sayu-skill",
      name: "Yoohoo Art: Fuuin Dash",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 3, element: "anemo" },
      instances: [
        {
          id: "sayu-skill-1",
          name: "Fuufuu Windwheel DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "sayu-skill-2",
          name: "Fuufuu Windwheel Elemental DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.168, 0.1806, 0.1932, 0.21, 0.2226, 0.2352, 0.252, 0.2688, 0.2856, 0.3024, 0.3192, 0.336, 0.357, 0.378, 0.399]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "sayu-skill-3",
          name: "Fuufuu Whirlwind Kick Elemental DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.7616, 0.81872, 0.87584, 0.952, 1.00912, 1.06624, 1.1424, 1.21856, 1.29472, 1.37088, 1.44704, 1.5232, 1.6184, 1.7136, 1.8088]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "sayu-skill-4",
          name: "Fuufuu Whirlwind Kick Tap DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.584, 1.7028, 1.8216, 1.98, 2.0988, 2.2176, 2.376, 2.5344, 2.6928, 2.8512, 3.0096, 3.168, 3.366, 3.564, 3.762]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "sayu-skill-5",
          name: "Fuufuu Whirlwind Kick Hold DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.176, 2.3392, 2.5024, 2.72, 2.8832, 3.0464, 3.264, 3.4816, 3.6992, 3.9168, 4.1344, 4.352, 4.624, 4.896, 5.168]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sayu-burst",
      name: "Yoohoo Art: Mujina Flurry",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "sayu-burst-1",
          name: "Skill Activation DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.168, 1.2556, 1.3432, 1.46, 1.5476, 1.6352, 1.752, 1.8688, 1.9856, 2.1024, 2.2192, 2.336, 2.482, 2.628, 2.774]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "sayu-burst-2",
          name: "Muji-Muji Daruma DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.52, 0.559, 0.598, 0.65, 0.689, 0.728, 0.78, 0.832, 0.884, 0.936, 0.988, 1.04, 1.105, 1.17, 1.235]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "sayu-a1", name: "Someone More Capable", unlockAscension: 1, effects: [] },
    { id: "sayu-a4", name: "No Work Today!", unlockAscension: 4, effects: [] },
    { id: "sayu-p3", name: "Yoohoo Art: Silencer's Secret", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sayu-c1", name: "Multi-Task no Jutsu", effects: [] },
    { level: 2, id: "sayu-c2", name: "Egress Prep", effects: [] },
    { level: 3, id: "sayu-c3", name: "Eh, the Bunshin Can Handle It", effects: [], buffs: [{ id: "sayu-c3", source: "Eh, the Bunshin Can Handle It", sourceCharacterId: "sayu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "sayu-c4", name: "Skiving: New and Improved", effects: [] },
    { level: 5, id: "sayu-c5", name: "Speed Comes First", effects: [], buffs: [{ id: "sayu-c5", source: "Speed Comes First", sourceCharacterId: "sayu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "sayu-c6", name: "Sleep O'Clock", effects: [] },
  ],
  resources: [],
};

export const shikanoinHeizou: GeneratedCharacter = {
  id: "shikanoin-heizou",
  name: "Shikanoin Heizou",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 894, 2: 968, 3: 1041, 4: 1115, 5: 1188, 6: 1263, 7: 1336, 8: 1410, 9: 1484, 10: 1557, 11: 1632, 12: 1705, 13: 1779, 14: 1852, 15: 1927, 16: 2001, 17: 2074, 18: 2148, 19: 2221, 20: 2296, 21: 3036, 22: 3111, 23: 3185, 24: 3258, 25: 3332, 26: 3405, 27: 3480, 28: 3553, 29: 3627, 30: 3700, 31: 3774, 32: 3849, 33: 3922, 34: 3996, 35: 4069, 36: 4143, 37: 4217, 38: 4291, 39: 4365, 40: 4438, 41: 4987, 42: 5060, 43: 5134, 44: 5208, 45: 5282, 46: 5356, 47: 5429, 48: 5503, 49: 5577, 50: 5651, 51: 6356, 52: 6431, 53: 6505, 54: 6578, 55: 6652, 56: 6725, 57: 6800, 58: 6873, 59: 6947, 60: 7021, 61: 7569, 62: 7643, 63: 7716, 64: 7790, 65: 7864, 66: 7938, 67: 8012, 68: 8085, 69: 8159, 70: 8233, 71: 8781, 72: 8854, 73: 8929, 74: 9003, 75: 9076, 76: 9150, 77: 9223, 78: 9298, 79: 9371, 80: 9445, 81: 9994, 82: 10067, 83: 10141, 84: 10214, 85: 10288, 86: 10362, 87: 10436, 88: 10509, 89: 10583, 90: 10657 } },
    atk: { byLevel: { 1: 19, 2: 20, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 31, 10: 33, 11: 34, 12: 36, 13: 38, 14: 39, 15: 41, 16: 42, 17: 44, 18: 45, 19: 47, 20: 48, 21: 64, 22: 66, 23: 67, 24: 69, 25: 70, 26: 72, 27: 74, 28: 75, 29: 77, 30: 78, 31: 80, 32: 81, 33: 83, 34: 84, 35: 86, 36: 88, 37: 89, 38: 91, 39: 92, 40: 94, 41: 105, 42: 107, 43: 108, 44: 110, 45: 112, 46: 113, 47: 115, 48: 116, 49: 118, 50: 119, 51: 134, 52: 136, 53: 137, 54: 139, 55: 141, 56: 142, 57: 144, 58: 145, 59: 147, 60: 148, 61: 160, 62: 161, 63: 163, 64: 165, 65: 166, 66: 168, 67: 169, 68: 171, 69: 172, 70: 174, 71: 186, 72: 187, 73: 189, 74: 190, 75: 192, 76: 193, 77: 195, 78: 196, 79: 198, 80: 200, 81: 211, 82: 213, 83: 214, 84: 216, 85: 217, 86: 219, 87: 220, 88: 222, 89: 224, 90: 225 } },
    def: { byLevel: { 1: 57, 2: 62, 3: 67, 4: 72, 5: 76, 6: 81, 7: 86, 8: 90, 9: 95, 10: 100, 11: 105, 12: 109, 13: 114, 14: 119, 15: 124, 16: 128, 17: 133, 18: 138, 19: 143, 20: 147, 21: 195, 22: 200, 23: 204, 24: 209, 25: 214, 26: 219, 27: 223, 28: 228, 29: 233, 30: 237, 31: 242, 32: 247, 33: 252, 34: 256, 35: 261, 36: 266, 37: 271, 38: 275, 39: 280, 40: 285, 41: 320, 42: 325, 43: 329, 44: 334, 45: 339, 46: 344, 47: 348, 48: 353, 49: 358, 50: 363, 51: 408, 52: 413, 53: 417, 54: 422, 55: 427, 56: 432, 57: 436, 58: 441, 59: 446, 60: 451, 61: 486, 62: 490, 63: 495, 64: 500, 65: 505, 66: 509, 67: 514, 68: 519, 69: 524, 70: 528, 71: 563, 72: 568, 73: 573, 74: 578, 75: 582, 76: 587, 77: 592, 78: 597, 79: 601, 80: 606, 81: 641, 82: 646, 83: 651, 84: 655, 85: 660, 86: 665, 87: 670, 88: 674, 89: 679, 90: 684 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "anemo",
  },
  baseStats: {
    atk: 225,
    hp: 10657,
    def: 684,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { anemo: 0.24 },
  },
  maxEnergy: 40,
  normalAttacks: {
    hits: [
      {
        id: "shikanoin-heizou-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shikanoin-heizou-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.374736, 0.402841, 0.430946, 0.46842, 0.496525, 0.52463, 0.562104, 0.599578, 0.637051, 0.674525, 0.711998, 0.749472, 0.796314, 0.843156, 0.889998]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "shikanoin-heizou-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shikanoin-heizou-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.36852, 0.396159, 0.423798, 0.46065, 0.488289, 0.515928, 0.55278, 0.589632, 0.626484, 0.663336, 0.700188, 0.73704, 0.783105, 0.82917, 0.875235]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "shikanoin-heizou-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shikanoin-heizou-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.5106, 0.548895, 0.58719, 0.63825, 0.676545, 0.71484, 0.7659, 0.81696, 0.86802, 0.91908, 0.97014, 1.0212, 1.085025, 1.14885, 1.212675]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "shikanoin-heizou-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shikanoin-heizou-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.147824, 0.158911, 0.169998, 0.18478, 0.195867, 0.206954, 0.221736, 0.236518, 0.251301, 0.266083, 0.280866, 0.295648, 0.314126, 0.332604, 0.351082]) },
              { stat: "atk", table: talentTable([0.162608, 0.174804, 0.186999, 0.20326, 0.215456, 0.227651, 0.243912, 0.260173, 0.276434, 0.292694, 0.308955, 0.325216, 0.345542, 0.365868, 0.386194]) },
              { stat: "atk", table: talentTable([0.192176, 0.206589, 0.221002, 0.24022, 0.254633, 0.269046, 0.288264, 0.307482, 0.326699, 0.345917, 0.365134, 0.384352, 0.408374, 0.432396, 0.456418]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "shikanoin-heizou-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "shikanoin-heizou-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.614496, 0.660583, 0.70667, 0.76812, 0.814207, 0.860294, 0.921744, 0.983194, 1.044643, 1.106093, 1.167542, 1.228992, 1.305804, 1.382616, 1.459428]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "shikanoin-heizou-charged",
      name: "Fudou Style Martial Arts",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shikanoin-heizou-charged-1",
          name: "Charged Attack",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.73, 0.78475, 0.8395, 0.9125, 0.96725, 1.022, 1.095, 1.168, 1.241, 1.314, 1.387, 1.46, 1.55125, 1.6425, 1.73375]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "shikanoin-heizou-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shikanoin-heizou-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "shikanoin-heizou-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "shikanoin-heizou-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "shikanoin-heizou-skill",
      name: "Heartstopper Strike",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 5, element: "anemo" },
      instances: [
        {
          id: "shikanoin-heizou-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.2752, 2.44584, 2.61648, 2.844, 3.01464, 3.18528, 3.4128, 3.64032, 3.86784, 4.09536, 4.32288, 4.5504, 4.8348, 5.1192, 5.4036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "shikanoin-heizou-burst",
      name: "Windmuster Kick",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(12),
      energyCost: 40,
      instances: [
        {
          id: "shikanoin-heizou-burst-1",
          name: "Fudou Style Vacuum Slugger DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([3.14688, 3.382896, 3.618912, 3.9336, 4.169616, 4.405632, 4.72032, 5.035008, 5.349696, 5.664384, 5.979072, 6.29376, 6.68712, 7.08048, 7.47384]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "shikanoin-heizou-burst-2",
          name: "Windmuster Iris DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.21456, 0.230652, 0.246744, 0.2682, 0.284292, 0.300384, 0.32184, 0.343296, 0.364752, 0.386208, 0.407664, 0.42912, 0.45594, 0.48276, 0.50958]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "shikanoin-heizou-a1", name: "Paradoxical Practice", unlockAscension: 1, effects: [] },
    { id: "shikanoin-heizou-a4", name: "Penetrative Reasoning", unlockAscension: 4, effects: [] },
    { id: "shikanoin-heizou-p3", name: "Pre-Existing Guilt", effects: [] },
  ],
  constellations: [
    { level: 1, id: "shikanoin-heizou-c1", name: "Named Juvenile Casebook", effects: [] },
    { level: 2, id: "shikanoin-heizou-c2", name: "Investigative Collection", effects: [] },
    { level: 3, id: "shikanoin-heizou-c3", name: "Esoteric Puzzle Book", effects: [], buffs: [{ id: "shikanoin-heizou-c3", source: "Esoteric Puzzle Book", sourceCharacterId: "shikanoin-heizou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "shikanoin-heizou-c4", name: "Tome of Lies", effects: [] },
    { level: 5, id: "shikanoin-heizou-c5", name: "Secret Archive", effects: [], buffs: [{ id: "shikanoin-heizou-c5", source: "Secret Archive", sourceCharacterId: "shikanoin-heizou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "shikanoin-heizou-c6", name: "Curious Casefiles", effects: [] },
  ],
  resources: [],
};

export const sucrose: GeneratedCharacter = {
  id: "sucrose",
  name: "Sucrose",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 775, 2: 839, 3: 903, 4: 967, 5: 1031, 6: 1095, 7: 1159, 8: 1223, 9: 1287, 10: 1351, 11: 1415, 12: 1479, 13: 1543, 14: 1607, 15: 1671, 16: 1735, 17: 1799, 18: 1863, 19: 1927, 20: 1991, 21: 2634, 22: 2698, 23: 2762, 24: 2826, 25: 2890, 26: 2954, 27: 3018, 28: 3082, 29: 3146, 30: 3209, 31: 3274, 32: 3338, 33: 3402, 34: 3466, 35: 3529, 36: 3594, 37: 3657, 38: 3722, 39: 3786, 40: 3850, 41: 4325, 42: 4389, 43: 4453, 44: 4517, 45: 4581, 46: 4645, 47: 4709, 48: 4773, 49: 4837, 50: 4901, 51: 5513, 52: 5578, 53: 5642, 54: 5705, 55: 5770, 56: 5833, 57: 5898, 58: 5961, 59: 6025, 60: 6090, 61: 6565, 62: 6629, 63: 6693, 64: 6757, 65: 6820, 66: 6885, 67: 6949, 68: 7013, 69: 7077, 70: 7141, 71: 7616, 72: 7680, 73: 7744, 74: 7808, 75: 7872, 76: 7936, 77: 8000, 78: 8064, 79: 8128, 80: 8192, 81: 8668, 82: 8731, 83: 8796, 84: 8859, 85: 8924, 86: 8987, 87: 9051, 88: 9115, 89: 9179, 90: 9244 } },
    atk: { byLevel: { 1: 14, 2: 15, 3: 17, 4: 18, 5: 19, 6: 20, 7: 21, 8: 22, 9: 24, 10: 25, 11: 26, 12: 27, 13: 28, 14: 30, 15: 31, 16: 32, 17: 33, 18: 34, 19: 35, 20: 37, 21: 48, 22: 50, 23: 51, 24: 52, 25: 53, 26: 54, 27: 55, 28: 57, 29: 58, 30: 59, 31: 60, 32: 61, 33: 63, 34: 64, 35: 65, 36: 66, 37: 67, 38: 68, 39: 70, 40: 71, 41: 80, 42: 81, 43: 82, 44: 83, 45: 84, 46: 85, 47: 87, 48: 88, 49: 89, 50: 90, 51: 101, 52: 103, 53: 104, 54: 105, 55: 106, 56: 107, 57: 108, 58: 110, 59: 111, 60: 112, 61: 121, 62: 122, 63: 123, 64: 124, 65: 125, 66: 127, 67: 128, 68: 129, 69: 130, 70: 131, 71: 140, 72: 141, 73: 142, 74: 144, 75: 145, 76: 146, 77: 147, 78: 148, 79: 149, 80: 151, 81: 159, 82: 161, 83: 162, 84: 163, 85: 164, 86: 165, 87: 166, 88: 168, 89: 169, 90: 170 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 78, 6: 83, 7: 88, 8: 93, 9: 98, 10: 103, 11: 108, 12: 112, 13: 117, 14: 122, 15: 127, 16: 132, 17: 137, 18: 142, 19: 147, 20: 151, 21: 200, 22: 205, 23: 210, 24: 215, 25: 220, 26: 225, 27: 230, 28: 234, 29: 239, 30: 244, 31: 249, 32: 254, 33: 259, 34: 264, 35: 268, 36: 273, 37: 278, 38: 283, 39: 288, 40: 293, 41: 329, 42: 334, 43: 339, 44: 344, 45: 348, 46: 353, 47: 358, 48: 363, 49: 368, 50: 373, 51: 419, 52: 424, 53: 429, 54: 434, 55: 439, 56: 444, 57: 449, 58: 453, 59: 458, 60: 463, 61: 499, 62: 504, 63: 509, 64: 514, 65: 519, 66: 524, 67: 528, 68: 533, 69: 538, 70: 543, 71: 579, 72: 584, 73: 589, 74: 594, 75: 599, 76: 604, 77: 608, 78: 613, 79: 618, 80: 623, 81: 659, 82: 664, 83: 669, 84: 674, 85: 679, 86: 683, 87: 688, 88: 693, 89: 698, 90: 703 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
    element: "anemo",
  },
  baseStats: {
    atk: 170,
    hp: 9244,
    def: 703,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { anemo: 0.24 },
  },
  maxEnergy: 80,
  normalAttacks: {
    hits: [
      {
        id: "sucrose-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sucrose-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.33464, 0.359738, 0.384836, 0.4183, 0.443398, 0.468496, 0.50196, 0.535424, 0.568888, 0.602352, 0.635816, 0.66928, 0.71111, 0.75294, 0.79477]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "sucrose-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sucrose-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.30616, 0.329122, 0.352084, 0.3827, 0.405662, 0.428624, 0.45924, 0.489856, 0.520472, 0.551088, 0.581704, 0.61232, 0.65059, 0.68886, 0.72713]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "sucrose-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sucrose-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.38448, 0.413316, 0.442152, 0.4806, 0.509436, 0.538272, 0.57672, 0.615168, 0.653616, 0.692064, 0.730512, 0.76896, 0.81702, 0.86508, 0.91314]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "sucrose-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sucrose-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.479176, 0.515114, 0.551052, 0.59897, 0.634908, 0.670846, 0.718764, 0.766682, 0.814599, 0.862517, 0.910434, 0.958352, 1.018249, 1.078146, 1.138043]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sucrose-charged",
      name: "Wind Spirit Creation",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sucrose-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.2016, 1.29172, 1.38184, 1.502, 1.59212, 1.68224, 1.8024, 1.92256, 2.04272, 2.16288, 2.28304, 2.4032, 2.5534, 2.7036, 2.8538]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "sucrose-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sucrose-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "sucrose-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sucrose-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "sucrose-skill",
      name: "Astable Anemohypostasis Creation - 6308",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 4, element: "anemo" },
      instances: [
        {
          id: "sucrose-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.112, 2.2704, 2.4288, 2.64, 2.7984, 2.9568, 3.168, 3.3792, 3.5904, 3.8016, 4.0128, 4.224, 4.488, 4.752, 5.016]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sucrose-burst",
      name: "Forbidden Creation - Isomer 75 / Type II",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "sucrose-burst-1",
          name: "DoT",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.48, 1.591, 1.702, 1.85, 1.961, 2.072, 2.22, 2.368, 2.516, 2.664, 2.812, 2.96, 3.145, 3.33, 3.515]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "sucrose-burst-2",
          name: "Additional Elemental DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.44, 0.473, 0.506, 0.55, 0.583, 0.616, 0.66, 0.704, 0.748, 0.792, 0.836, 0.88, 0.935, 0.99, 1.045]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "sucrose-a1", name: "Catalyst Conversion", unlockAscension: 1, effects: [] },
    { id: "sucrose-a4", name: "Mollis Favonius", unlockAscension: 4, effects: [] },
    { id: "sucrose-p3", name: "Astable Invention", effects: [] },
    { id: "sucrose-p4", name: "Witch's Eve Rite: Sevenfold Transmutation", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sucrose-c1", name: "Clustered Vacuum Field", effects: [] },
    { level: 2, id: "sucrose-c2", name: "Beth: Unbound Form", effects: [] },
    { level: 3, id: "sucrose-c3", name: "Flawless Alchemistress", effects: [], buffs: [{ id: "sucrose-c3", source: "Flawless Alchemistress", sourceCharacterId: "sucrose", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "sucrose-c4", name: "Alchemania", effects: [] },
    { level: 5, id: "sucrose-c5", name: "Caution: Standard Flask", effects: [], buffs: [{ id: "sucrose-c5", source: "Caution: Standard Flask", sourceCharacterId: "sucrose", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "sucrose-c6", name: "Chaotic Entropy", effects: [] },
  ],
  resources: [],
};

export const travelerFAnemo: GeneratedCharacter = {
  id: "traveler-f-anemo",
  name: "Traveler",
  element: "anemo",
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
        id: "traveler-f-anemo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-anemo-na-1-1",
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
        id: "traveler-f-anemo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-anemo-na-2-1",
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
        id: "traveler-f-anemo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-anemo-na-3-1",
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
        id: "traveler-f-anemo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-anemo-na-4-1",
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
        id: "traveler-f-anemo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-anemo-na-5-1",
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
      id: "traveler-f-anemo-charged",
      name: "Foreign Ironwind",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-anemo-charged-1",
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
      id: "traveler-f-anemo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-anemo-plungeLow-1",
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
      id: "traveler-f-anemo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-anemo-plungeHigh-1",
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
      id: "traveler-f-anemo-skill",
      name: "Palm Vortex",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(5),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-anemo-skill-1",
          name: "Initial Cutting DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.12, 0.129, 0.138, 0.15, 0.159, 0.168, 0.18, 0.192, 0.204, 0.216, 0.228, 0.24, 0.255, 0.27, 0.285]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-f-anemo-skill-2",
          name: "Max Cutting DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.168, 0.1806, 0.1932, 0.21, 0.2226, 0.2352, 0.252, 0.2688, 0.2856, 0.3024, 0.3192, 0.336, 0.357, 0.378, 0.399]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-f-anemo-skill-3",
          name: "Initial Storm DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.76, 1.892, 2.024, 2.2, 2.332, 2.464, 2.64, 2.816, 2.992, 3.168, 3.344, 3.52, 3.74, 3.96, 4.18]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-f-anemo-skill-4",
          name: "Max Storm DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.92, 2.064, 2.208, 2.4, 2.544, 2.688, 2.88, 3.072, 3.264, 3.456, 3.648, 3.84, 4.08, 4.32, 4.56]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-anemo-burst",
      name: "Gust Surge",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-f-anemo-burst-1",
          name: "Tornado DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.808, 0.8686, 0.9292, 1.01, 1.0706, 1.1312, 1.212, 1.2928, 1.3736, 1.4544, 1.5352, 1.616, 1.717, 1.818, 1.919]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "traveler-f-anemo-burst-2",
          name: "Additional Elemental DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.248, 0.2666, 0.2852, 0.31, 0.3286, 0.3472, 0.372, 0.3968, 0.4216, 0.4464, 0.4712, 0.496, 0.527, 0.558, 0.589]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-anemo-a1", name: "Slitting Wind", unlockAscension: 1, effects: [] },
    { id: "traveler-f-anemo-a4", name: "Second Wind", unlockAscension: 4, effects: [] },
    { id: "traveler-f-anemo-p3", name: "Foreign Windwrath", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-anemo-c1", name: "Raging Vortex", effects: [] },
    { level: 2, id: "traveler-f-anemo-c2", name: "Uprising Whirlwind", effects: [], buffs: [{ id: "traveler-f-anemo-c2", source: "Uprising Whirlwind", sourceCharacterId: "traveler-f-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, modifiers: [{ stat: "energyRecharge", value: 0.16 }] }] },
    { level: 3, id: "traveler-f-anemo-c3", name: "Sweeping Gust", effects: [], buffs: [{ id: "traveler-f-anemo-c3", source: "Sweeping Gust", sourceCharacterId: "traveler-f-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-f-anemo-c4", name: "Cherishing Breezes", effects: [] },
    { level: 5, id: "traveler-f-anemo-c5", name: "Vortex Stellaris", effects: [], buffs: [{ id: "traveler-f-anemo-c5", source: "Vortex Stellaris", sourceCharacterId: "traveler-f-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-f-anemo-c6", name: "Intertwined Winds", effects: [] },
  ],
  resources: [],
};

export const travelerMAnemo: GeneratedCharacter = {
  id: "traveler-m-anemo",
  name: "Traveler",
  element: "anemo",
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
        id: "traveler-m-anemo-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-anemo-na-1-1",
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
        id: "traveler-m-anemo-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-anemo-na-2-1",
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
        id: "traveler-m-anemo-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-anemo-na-3-1",
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
        id: "traveler-m-anemo-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-anemo-na-4-1",
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
        id: "traveler-m-anemo-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-anemo-na-5-1",
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
      id: "traveler-m-anemo-charged",
      name: "Foreign Ironwind",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-anemo-charged-1",
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
      id: "traveler-m-anemo-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-anemo-plungeLow-1",
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
      id: "traveler-m-anemo-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-anemo-plungeHigh-1",
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
      id: "traveler-m-anemo-skill",
      name: "Palm Vortex",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(5),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-anemo-skill-1",
          name: "Initial Cutting DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.12, 0.129, 0.138, 0.15, 0.159, 0.168, 0.18, 0.192, 0.204, 0.216, 0.228, 0.24, 0.255, 0.27, 0.285]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-m-anemo-skill-2",
          name: "Max Cutting DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.168, 0.1806, 0.1932, 0.21, 0.2226, 0.2352, 0.252, 0.2688, 0.2856, 0.3024, 0.3192, 0.336, 0.357, 0.378, 0.399]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-m-anemo-skill-3",
          name: "Initial Storm DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.76, 1.892, 2.024, 2.2, 2.332, 2.464, 2.64, 2.816, 2.992, 3.168, 3.344, 3.52, 3.74, 3.96, 4.18]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "traveler-m-anemo-skill-4",
          name: "Max Storm DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.92, 2.064, 2.208, 2.4, 2.544, 2.688, 2.88, 3.072, 3.264, 3.456, 3.648, 3.84, 4.08, 4.32, 4.56]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-anemo-burst",
      name: "Gust Surge",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "traveler-m-anemo-burst-1",
          name: "Tornado DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.808, 0.8686, 0.9292, 1.01, 1.0706, 1.1312, 1.212, 1.2928, 1.3736, 1.4544, 1.5352, 1.616, 1.717, 1.818, 1.919]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "traveler-m-anemo-burst-2",
          name: "Additional Elemental DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.248, 0.2666, 0.2852, 0.31, 0.3286, 0.3472, 0.372, 0.3968, 0.4216, 0.4464, 0.4712, 0.496, 0.527, 0.558, 0.589]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-anemo-a1", name: "Slitting Wind", unlockAscension: 1, effects: [] },
    { id: "traveler-m-anemo-a4", name: "Second Wind", unlockAscension: 4, effects: [] },
    { id: "traveler-m-anemo-p3", name: "Foreign Windwrath", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-anemo-c1", name: "Raging Vortex", effects: [] },
    { level: 2, id: "traveler-m-anemo-c2", name: "Uprising Whirlwind", effects: [], buffs: [{ id: "traveler-m-anemo-c2", source: "Uprising Whirlwind", sourceCharacterId: "traveler-m-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, modifiers: [{ stat: "energyRecharge", value: 0.16 }] }] },
    { level: 3, id: "traveler-m-anemo-c3", name: "Sweeping Gust", effects: [], buffs: [{ id: "traveler-m-anemo-c3", source: "Sweeping Gust", sourceCharacterId: "traveler-m-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "traveler-m-anemo-c4", name: "Cherishing Breezes", effects: [] },
    { level: 5, id: "traveler-m-anemo-c5", name: "Vortex Stellaris", effects: [], buffs: [{ id: "traveler-m-anemo-c5", source: "Vortex Stellaris", sourceCharacterId: "traveler-m-anemo", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "traveler-m-anemo-c6", name: "Intertwined Winds", effects: [] },
  ],
  resources: [],
};

export const varka: GeneratedCharacter = {
  id: "varka",
  name: "Varka",
  element: "anemo",
  weaponType: "claymore",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 982, 2: 1063, 3: 1145, 4: 1227, 5: 1309, 6: 1391, 7: 1473, 8: 1555, 9: 1638, 10: 1719, 11: 1802, 12: 1884, 13: 1967, 14: 2050, 15: 2133, 16: 2215, 17: 2299, 18: 2381, 19: 2465, 20: 2547, 21: 3472, 22: 3556, 23: 3639, 24: 3723, 25: 3806, 26: 3891, 27: 3974, 28: 4058, 29: 4142, 30: 4226, 31: 4310, 32: 4394, 33: 4479, 34: 4562, 35: 4647, 36: 4732, 37: 4817, 38: 4901, 39: 4986, 40: 5071, 41: 5754, 42: 5839, 43: 5925, 44: 6009, 45: 6094, 46: 6180, 47: 6265, 48: 6351, 49: 6437, 50: 6523, 51: 7406, 52: 7492, 53: 7577, 54: 7664, 55: 7750, 56: 7837, 57: 7923, 58: 8009, 59: 8096, 60: 8182, 61: 8867, 62: 8953, 63: 9041, 64: 9127, 65: 9214, 66: 9302, 67: 9388, 68: 9476, 69: 9563, 70: 9650, 71: 10336, 72: 10424, 73: 10512, 74: 10599, 75: 10688, 76: 10775, 77: 10863, 78: 10952, 79: 11040, 80: 11128, 81: 11815, 82: 11903, 83: 11992, 84: 12080, 85: 12168, 86: 12258, 87: 12346, 88: 12436, 89: 12525, 90: 12613 } },
    atk: { byLevel: { 1: 27, 2: 30, 3: 32, 4: 34, 5: 37, 6: 39, 7: 41, 8: 44, 9: 46, 10: 48, 11: 50, 12: 53, 13: 55, 14: 57, 15: 60, 16: 62, 17: 64, 18: 67, 19: 69, 20: 71, 21: 97, 22: 99, 23: 102, 24: 104, 25: 106, 26: 109, 27: 111, 28: 113, 29: 116, 30: 118, 31: 121, 32: 123, 33: 125, 34: 128, 35: 130, 36: 132, 37: 135, 38: 137, 39: 139, 40: 142, 41: 161, 42: 163, 43: 166, 44: 168, 45: 170, 46: 173, 47: 175, 48: 178, 49: 180, 50: 182, 51: 207, 52: 210, 53: 212, 54: 214, 55: 217, 56: 219, 57: 222, 58: 224, 59: 226, 60: 229, 61: 248, 62: 250, 63: 253, 64: 255, 65: 258, 66: 260, 67: 263, 68: 265, 69: 267, 70: 270, 71: 289, 72: 292, 73: 294, 74: 296, 75: 299, 76: 301, 77: 304, 78: 306, 79: 309, 80: 311, 81: 330, 82: 333, 83: 335, 84: 338, 85: 340, 86: 343, 87: 345, 88: 348, 89: 350, 90: 353 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 72, 4: 77, 5: 83, 6: 88, 7: 93, 8: 98, 9: 103, 10: 108, 11: 114, 12: 119, 13: 124, 14: 129, 15: 134, 16: 140, 17: 145, 18: 150, 19: 155, 20: 161, 21: 219, 22: 224, 23: 230, 24: 235, 25: 240, 26: 245, 27: 251, 28: 256, 29: 261, 30: 266, 31: 272, 32: 277, 33: 282, 34: 288, 35: 293, 36: 298, 37: 304, 38: 309, 39: 314, 40: 320, 41: 363, 42: 368, 43: 374, 44: 379, 45: 384, 46: 390, 47: 395, 48: 401, 49: 406, 50: 411, 51: 467, 52: 472, 53: 478, 54: 483, 55: 489, 56: 494, 57: 500, 58: 505, 59: 511, 60: 516, 61: 559, 62: 565, 63: 570, 64: 576, 65: 581, 66: 587, 67: 592, 68: 598, 69: 603, 70: 609, 71: 652, 72: 657, 73: 663, 74: 668, 75: 674, 76: 680, 77: 685, 78: 691, 79: 696, 80: 702, 81: 745, 82: 751, 83: 756, 84: 762, 85: 767, 86: 773, 87: 779, 88: 784, 89: 790, 90: 795 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 353,
    hp: 12613,
    def: 795,
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
        id: "varka-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varka-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.654598, 0.707879, 0.76116, 0.837276, 0.890557, 0.95145, 1.035178, 1.118905, 1.202633, 1.293972, 1.385311, 1.47665, 1.56799, 1.659329, 1.750668]) },
            ],
          },
        ],
      },
      {
        id: "varka-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varka-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.239885, 0.25941, 0.278936, 0.30683, 0.326355, 0.34867, 0.379353, 0.410036, 0.440719, 0.474191, 0.507664, 0.541136, 0.574608, 0.60808, 0.641553]) },
              { stat: "atk", table: talentTable([0.445501, 0.481762, 0.518024, 0.569826, 0.606088, 0.64753, 0.704513, 0.761495, 0.818478, 0.880641, 0.942804, 1.004967, 1.067129, 1.129292, 1.191455]) },
            ],
          },
        ],
      },
      {
        id: "varka-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varka-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.324364, 0.350765, 0.377167, 0.414884, 0.441285, 0.471459, 0.512947, 0.554435, 0.595924, 0.641184, 0.686444, 0.731704, 0.776964, 0.822224, 0.867484]) },
              { stat: "atk", table: talentTable([0.60239, 0.651421, 0.700453, 0.770498, 0.81953, 0.875566, 0.952616, 1.029666, 1.106716, 1.19077, 1.274824, 1.358879, 1.442933, 1.526988, 1.611042]) },
            ],
          },
        ],
      },
      {
        id: "varka-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varka-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.554316, 0.599434, 0.644553, 0.709008, 0.754127, 0.805691, 0.876592, 0.947493, 1.018394, 1.09574, 1.173086, 1.250433, 1.327779, 1.405126, 1.482472]) },
              { stat: "atk", table: talentTable([0.298478, 0.322772, 0.347067, 0.381774, 0.406068, 0.433834, 0.472011, 0.510188, 0.548366, 0.590014, 0.631662, 0.67331, 0.714958, 0.756606, 0.798254]) },
            ],
          },
        ],
      },
      {
        id: "varka-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "varka-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.697498, 0.754271, 0.811044, 0.892148, 0.948921, 1.013805, 1.10302, 1.192235, 1.28145, 1.378775, 1.4761, 1.573425, 1.670751, 1.768076, 1.865401]) },
              { stat: "atk", table: talentTable([0.375576, 0.406146, 0.436716, 0.480388, 0.510958, 0.545895, 0.593934, 0.641973, 0.690011, 0.742417, 0.794823, 0.847229, 0.899635, 0.952041, 1.004447]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "varka-charged",
      name: "Favonius Bladework: Dancing Radiance",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varka-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.856388, 0.926094, 0.9958, 1.09538, 1.165086, 1.24475, 1.354288, 1.463826, 1.573364, 1.69286, 1.812356, 1.931852, 2.051348, 2.170844, 2.29034]) },
            { stat: "atk", table: talentTable([0.461132, 0.498666, 0.5362, 0.58982, 0.627354, 0.67025, 0.729232, 0.788214, 0.847196, 0.91154, 0.975884, 1.040228, 1.104572, 1.168916, 1.23326]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "varka-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varka-plungeLow-1",
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
      id: "varka-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "varka-plungeHigh-1",
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
      id: "varka-skill",
      name: "Windbound Execution",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(16),
      energyCost: 0,
      particles: { count: 6, element: "anemo" },
      instances: [
        {
          id: "varka-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.784, 2.9928, 3.2016, 3.48, 3.6888, 3.8976, 4.176, 4.4544, 4.7328, 5.0112, 5.2896, 5.568, 5.916, 6.264, 6.612]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-2",
          name: "Sturm und Drang 1-Hit DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.818247, 0.884848, 0.95145, 1.046595, 1.113196, 1.189312, 1.293972, 1.398631, 1.503291, 1.617465, 1.731639, 1.845813, 1.959987, 2.074161, 2.188335]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-3",
          name: "Sturm und Drang 2-Hit DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.299856, 0.324263, 0.34867, 0.383537, 0.407944, 0.435837, 0.474191, 0.512545, 0.550899, 0.592739, 0.634579, 0.67642, 0.71826, 0.760101, 0.801941]) },
            { stat: "atk", table: talentTable([0.556876, 0.602203, 0.64753, 0.712283, 0.75761, 0.809413, 0.880641, 0.951869, 1.023097, 1.100801, 1.178505, 1.256208, 1.333912, 1.411615, 1.489319]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-4",
          name: "Sturm und Drang 3-Hit DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.405455, 0.438457, 0.471459, 0.518605, 0.551607, 0.589323, 0.641184, 0.693044, 0.744905, 0.80148, 0.858055, 0.91463, 0.971205, 1.02778, 1.084355]) },
            { stat: "atk", table: talentTable([0.752987, 0.814277, 0.875566, 0.963123, 1.024413, 1.094458, 1.19077, 1.287082, 1.383395, 1.488463, 1.593531, 1.698599, 1.803666, 1.908734, 2.013802]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-5",
          name: "Sturm und Drang 4-Hit DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.692894, 0.749293, 0.805691, 0.88626, 0.942659, 1.007114, 1.09574, 1.184366, 1.272992, 1.369675, 1.466358, 1.563041, 1.659724, 1.756407, 1.85309]) },
            { stat: "atk", table: talentTable([0.373097, 0.403465, 0.433834, 0.477217, 0.507585, 0.542292, 0.590014, 0.637736, 0.685457, 0.737517, 0.789577, 0.841637, 0.893698, 0.945758, 0.997818]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-6",
          name: "Sturm und Drang 5-Hit DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.871872, 0.942839, 1.013805, 1.115186, 1.186152, 1.267256, 1.378775, 1.490293, 1.601812, 1.723469, 1.845125, 1.966782, 2.088438, 2.210095, 2.331751]) },
            { stat: "atk", table: talentTable([0.46947, 0.507682, 0.545895, 0.600485, 0.638697, 0.682369, 0.742417, 0.802466, 0.862514, 0.928022, 0.993529, 1.059036, 1.124544, 1.190051, 1.255559]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-7",
          name: "Sturm und Drang Charged Attack DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.070485, 1.157618, 1.24475, 1.369225, 1.456357, 1.555937, 1.69286, 1.829783, 1.966705, 2.116075, 2.265445, 2.414815, 2.564185, 2.713555, 2.862925]) },
            { stat: "atk", table: talentTable([0.576415, 0.623333, 0.67025, 0.737275, 0.784192, 0.837813, 0.91154, 0.985267, 1.058995, 1.139425, 1.219855, 1.300285, 1.380715, 1.461145, 1.541575]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-8",
          name: "Four Winds' Ascension DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.7576, 1.88942, 2.02124, 2.197, 2.32882, 2.46064, 2.6364, 2.81216, 2.98792, 3.16368, 3.33944, 3.5152, 3.7349, 3.9546, 4.1743]) },
            { stat: "atk", table: talentTable([0.9464, 1.01738, 1.08836, 1.183, 1.25398, 1.32496, 1.4196, 1.51424, 1.60888, 1.70352, 1.79816, 1.8928, 2.0111, 2.1294, 2.2477]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-9-1",
          name: "Azure Devour DMG (1/2)",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.936, 1.0062, 1.0764, 1.17, 1.2402, 1.3104, 1.404, 1.4976, 1.5912, 1.6848, 1.7784, 1.872, 1.989, 2.106, 2.223]) },
            { stat: "atk", table: talentTable([0.504, 0.5418, 0.5796, 0.63, 0.6678, 0.7056, 0.756, 0.8064, 0.8568, 0.9072, 0.9576, 1.008, 1.071, 1.134, 1.197]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "varka-skill-9-2",
          name: "Azure Devour DMG (2/2)",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.936, 1.0062, 1.0764, 1.17, 1.2402, 1.3104, 1.404, 1.4976, 1.5912, 1.6848, 1.7784, 1.872, 1.989, 2.106, 2.223]) },
            { stat: "atk", table: talentTable([0.504, 0.5418, 0.5796, 0.63, 0.6678, 0.7056, 0.756, 0.8064, 0.8568, 0.9072, 0.9576, 1.008, 1.071, 1.134, 1.197]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "varka-burst",
      name: "Northwind Avatar",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "varka-burst-1",
          name: "Skill 1-Hit DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([3.3696, 3.62232, 3.87504, 4.212, 4.46472, 4.71744, 5.0544, 5.39136, 5.72832, 6.06528, 6.40224, 6.7392, 7.1604, 7.5816, 8.0028]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "varka-burst-2",
          name: "Skill 2-Hit DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.8144, 1.95048, 2.08656, 2.268, 2.40408, 2.54016, 2.7216, 2.90304, 3.08448, 3.26592, 3.44736, 3.6288, 3.8556, 4.0824, 4.3092]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "varka-a1", name: "Dawn Wind's March", unlockAscension: 1, effects: [] },
    { id: "varka-a4", name: "Wind's Vanguard", unlockAscension: 4, effects: [] },
    { id: "varka-p3", name: "Homebound Wind's Paean", effects: [] },
    { id: "varka-p4", name: "Witch's Eve Rite: Dawn's Return", effects: [] },
  ],
  constellations: [
    { level: 1, id: "varka-c1", name: "\"Come, Friend, Let Us Dance Beneath the Moon's Soft Glow\"", effects: [] },
    { level: 2, id: "varka-c2", name: "\"When Dawn Breaks, Our Journey Shall Take Flight\"", effects: [] },
    { level: 3, id: "varka-c3", name: "\"O Friend, Quaff Not the Bitter Wine That Brings Tears of Woe\"", effects: [] },
    { level: 4, id: "varka-c4", name: "\"For None May Take From Us Our Freedom of Song\"", effects: [] },
    { level: 5, id: "varka-c5", name: "\"Fill High the Cup With Fine Wine, for Tyrants Come and Go\"", effects: [] },
    { level: 6, id: "varka-c6", name: "\"Beloved Mondstadt, Steadfast You Shall Shine\"", effects: [] },
  ],
  resources: [],
};

export const venti: GeneratedCharacter = {
  id: "venti",
  name: "Venti",
  element: "anemo",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 820, 2: 888, 3: 956, 4: 1025, 5: 1093, 6: 1162, 7: 1230, 8: 1299, 9: 1368, 10: 1436, 11: 1504, 12: 1573, 13: 1642, 14: 1712, 15: 1781, 16: 1850, 17: 1919, 18: 1988, 19: 2058, 20: 2127, 21: 2899, 22: 2969, 23: 3039, 24: 3108, 25: 3178, 26: 3249, 27: 3318, 28: 3388, 29: 3458, 30: 3528, 31: 3599, 32: 3669, 33: 3740, 34: 3809, 35: 3880, 36: 3951, 37: 4022, 38: 4092, 39: 4163, 40: 4234, 41: 4804, 42: 4875, 43: 4947, 44: 5017, 45: 5089, 46: 5160, 47: 5231, 48: 5303, 49: 5375, 50: 5446, 51: 6183, 52: 6255, 53: 6327, 54: 6399, 55: 6471, 56: 6543, 57: 6615, 58: 6687, 59: 6760, 60: 6832, 61: 7403, 62: 7476, 63: 7549, 64: 7621, 65: 7694, 66: 7767, 67: 7839, 68: 7912, 69: 7985, 70: 8058, 71: 8630, 72: 8704, 73: 8777, 74: 8850, 75: 8924, 76: 8997, 77: 9070, 78: 9144, 79: 9218, 80: 9292, 81: 9865, 82: 9939, 83: 10013, 84: 10086, 85: 10160, 86: 10235, 87: 10308, 88: 10383, 89: 10458, 90: 10531 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 24, 4: 26, 5: 27, 6: 29, 7: 31, 8: 32, 9: 34, 10: 36, 11: 38, 12: 39, 13: 41, 14: 43, 15: 44, 16: 46, 17: 48, 18: 50, 19: 51, 20: 53, 21: 72, 22: 74, 23: 76, 24: 78, 25: 79, 26: 81, 27: 83, 28: 85, 29: 86, 30: 88, 31: 90, 32: 92, 33: 93, 34: 95, 35: 97, 36: 99, 37: 100, 38: 102, 39: 104, 40: 106, 41: 120, 42: 122, 43: 124, 44: 125, 45: 127, 46: 129, 47: 131, 48: 132, 49: 134, 50: 136, 51: 154, 52: 156, 53: 158, 54: 160, 55: 162, 56: 163, 57: 165, 58: 167, 59: 169, 60: 171, 61: 185, 62: 187, 63: 189, 64: 190, 65: 192, 66: 194, 67: 196, 68: 198, 69: 199, 70: 201, 71: 216, 72: 217, 73: 219, 74: 221, 75: 223, 76: 225, 77: 227, 78: 228, 79: 230, 80: 232, 81: 246, 82: 248, 83: 250, 84: 252, 85: 254, 86: 256, 87: 258, 88: 259, 89: 261, 90: 263 } },
    def: { byLevel: { 1: 52, 2: 56, 3: 61, 4: 65, 5: 69, 6: 74, 7: 78, 8: 82, 9: 87, 10: 91, 11: 96, 12: 100, 13: 104, 14: 109, 15: 113, 16: 117, 17: 122, 18: 126, 19: 131, 20: 135, 21: 184, 22: 189, 23: 193, 24: 197, 25: 202, 26: 206, 27: 211, 28: 215, 29: 220, 30: 224, 31: 228, 32: 233, 33: 237, 34: 242, 35: 246, 36: 251, 37: 255, 38: 260, 39: 264, 40: 269, 41: 305, 42: 310, 43: 314, 44: 319, 45: 323, 46: 328, 47: 332, 48: 337, 49: 341, 50: 346, 51: 393, 52: 397, 53: 402, 54: 406, 55: 411, 56: 415, 57: 420, 58: 425, 59: 429, 60: 434, 61: 470, 62: 475, 63: 479, 64: 484, 65: 488, 66: 493, 67: 498, 68: 502, 69: 507, 70: 512, 71: 548, 72: 553, 73: 557, 74: 562, 75: 567, 76: 571, 77: 576, 78: 581, 79: 585, 80: 590, 81: 626, 82: 631, 83: 636, 84: 640, 85: 645, 86: 650, 87: 654, 88: 659, 89: 664, 90: 669 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.32],
  },
  baseStats: {
    atk: 263,
    hp: 10531,
    def: 669,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1.32,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "venti-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.20382, 0.22041, 0.237, 0.2607, 0.27729, 0.29625, 0.32232, 0.34839, 0.37446, 0.4029, 0.435487, 0.47381, 0.512133, 0.550456, 0.592263]) },
              { stat: "atk", table: talentTable([0.20382, 0.22041, 0.237, 0.2607, 0.27729, 0.29625, 0.32232, 0.34839, 0.37446, 0.4029, 0.435487, 0.47381, 0.512133, 0.550456, 0.592263]) },
            ],
          },
        ],
      },
      {
        id: "venti-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.44376, 0.47988, 0.516, 0.5676, 0.60372, 0.645, 0.70176, 0.75852, 0.81528, 0.8772, 0.94815, 1.031587, 1.115024, 1.198462, 1.289484]) },
            ],
          },
        ],
      },
      {
        id: "venti-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.52374, 0.56637, 0.609, 0.6699, 0.71253, 0.76125, 0.82824, 0.89523, 0.96222, 1.0353, 1.119037, 1.217513, 1.315988, 1.414463, 1.521891]) },
            ],
          },
        ],
      },
      {
        id: "venti-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-4-1",
            name: "4-Hit DMG",
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
        id: "venti-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.50654, 0.54777, 0.589, 0.6479, 0.68913, 0.73625, 0.80104, 0.86583, 0.93062, 1.0013, 1.082288, 1.177529, 1.27277, 1.368011, 1.471911]) },
            ],
          },
        ],
      },
      {
        id: "venti-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "venti-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.7095, 0.76725, 0.825, 0.9075, 0.96525, 1.03125, 1.122, 1.21275, 1.3035, 1.4025, 1.515937, 1.64934, 1.782742, 1.916145, 2.061675]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "venti-charged",
      name: "Divine Marksmanship",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "venti-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.937125, 1.019592, 1.102059, 1.184526, 1.27449]) },
          ],
        },
        {
          id: "venti-charged-2",
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
      id: "venti-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "venti-plungeLow-1",
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
      id: "venti-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "venti-plungeHigh-1",
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
      id: "venti-skill",
      name: "Skyward Sonnet",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 7, element: "anemo" },
      instances: [
        {
          id: "venti-skill-1",
          name: "Tap DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.76, 2.967, 3.174, 3.45, 3.657, 3.864, 4.14, 4.416, 4.692, 4.968, 5.244, 5.52, 5.865, 6.21, 6.555]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "venti-skill-2",
          name: "Hold DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([3.8, 4.085, 4.37, 4.75, 5.035, 5.32, 5.7, 6.08, 6.46, 6.84, 7.22, 7.6, 8.075, 8.55, 9.025]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "venti-burst",
      name: "Wind's Grand Ode",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "venti-burst-1",
          name: "DoT",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.376, 0.4042, 0.4324, 0.47, 0.4982, 0.5264, 0.564, 0.6016, 0.6392, 0.6768, 0.7144, 0.752, 0.799, 0.846, 0.893]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "venti-burst-2",
          name: "Additional Elemental DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.188, 0.2021, 0.2162, 0.235, 0.2491, 0.2632, 0.282, 0.3008, 0.3196, 0.3384, 0.3572, 0.376, 0.3995, 0.423, 0.4465]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "venti-a1", name: "Embrace of Winds", unlockAscension: 1, effects: [] },
    { id: "venti-a4", name: "Stormeye", unlockAscension: 4, effects: [] },
    { id: "venti-p3", name: "Windrider", effects: [] },
    { id: "venti-p4", name: "Witch's Eve Rite: Temporal Wind's Eulogy", effects: [] },
  ],
  constellations: [
    { level: 1, id: "venti-c1", name: "Splitting Gales", effects: [] },
    { level: 2, id: "venti-c2", name: "Breeze of Reminiscence", effects: [] },
    { level: 3, id: "venti-c3", name: "Ode to Thousand Winds", effects: [], buffs: [{ id: "venti-c3", source: "Ode to Thousand Winds", sourceCharacterId: "venti", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "venti-c4", name: "Hurricane of Freedom", effects: [] },
    { level: 5, id: "venti-c5", name: "Concerto dal Cielo", effects: [], buffs: [{ id: "venti-c5", source: "Concerto dal Cielo", sourceCharacterId: "venti", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "venti-c6", name: "Storm of Defiance", effects: [] },
  ],
  resources: [],
};

export const wanderer: GeneratedCharacter = {
  id: "wanderer",
  name: "Wanderer",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 791, 2: 857, 3: 923, 4: 989, 5: 1055, 6: 1121, 7: 1187, 8: 1253, 9: 1320, 10: 1385, 11: 1452, 12: 1518, 13: 1585, 14: 1652, 15: 1719, 16: 1785, 17: 1852, 18: 1919, 19: 1986, 20: 2053, 21: 2798, 22: 2865, 23: 2933, 24: 3000, 25: 3067, 26: 3135, 27: 3203, 28: 3270, 29: 3338, 30: 3405, 31: 3473, 32: 3541, 33: 3609, 34: 3676, 35: 3745, 36: 3813, 37: 3881, 38: 3949, 39: 4018, 40: 4086, 41: 4636, 42: 4705, 43: 4774, 44: 4842, 45: 4911, 46: 4980, 47: 5049, 48: 5118, 49: 5187, 50: 5256, 51: 5968, 52: 6037, 53: 6106, 54: 6176, 55: 6245, 56: 6315, 57: 6385, 58: 6454, 59: 6524, 60: 6593, 61: 7145, 62: 7215, 63: 7285, 64: 7355, 65: 7425, 66: 7496, 67: 7565, 68: 7636, 69: 7706, 70: 7777, 71: 8329, 72: 8400, 73: 8471, 74: 8541, 75: 8612, 76: 8683, 77: 8754, 78: 8825, 79: 8896, 80: 8968, 81: 9521, 82: 9592, 83: 9663, 84: 9734, 85: 9806, 86: 9878, 87: 9949, 88: 10021, 89: 10093, 90: 10164 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 32, 5: 34, 6: 36, 7: 38, 8: 40, 9: 43, 10: 45, 11: 47, 12: 49, 13: 51, 14: 53, 15: 55, 16: 58, 17: 60, 18: 62, 19: 64, 20: 66, 21: 90, 22: 92, 23: 95, 24: 97, 25: 99, 26: 101, 27: 103, 28: 105, 29: 108, 30: 110, 31: 112, 32: 114, 33: 116, 34: 119, 35: 121, 36: 123, 37: 125, 38: 127, 39: 130, 40: 132, 41: 149, 42: 152, 43: 154, 44: 156, 45: 158, 46: 161, 47: 163, 48: 165, 49: 167, 50: 169, 51: 192, 52: 195, 53: 197, 54: 199, 55: 201, 56: 204, 57: 206, 58: 208, 59: 210, 60: 213, 61: 230, 62: 233, 63: 235, 64: 237, 65: 239, 66: 242, 67: 244, 68: 246, 69: 248, 70: 251, 71: 269, 72: 271, 73: 273, 74: 275, 75: 278, 76: 280, 77: 282, 78: 285, 79: 287, 80: 289, 81: 307, 82: 309, 83: 312, 84: 314, 85: 316, 86: 318, 87: 321, 88: 323, 89: 325, 90: 328 } },
    def: { byLevel: { 1: 47, 2: 51, 3: 55, 4: 59, 5: 63, 6: 67, 7: 71, 8: 75, 9: 79, 10: 83, 11: 87, 12: 91, 13: 95, 14: 99, 15: 103, 16: 107, 17: 111, 18: 115, 19: 119, 20: 123, 21: 167, 22: 171, 23: 175, 24: 179, 25: 183, 26: 187, 27: 191, 28: 195, 29: 199, 30: 203, 31: 207, 32: 212, 33: 216, 34: 220, 35: 224, 36: 228, 37: 232, 38: 236, 39: 240, 40: 244, 41: 277, 42: 281, 43: 285, 44: 289, 45: 293, 46: 297, 47: 302, 48: 306, 49: 310, 50: 314, 51: 356, 52: 361, 53: 365, 54: 369, 55: 373, 56: 377, 57: 381, 58: 386, 59: 390, 60: 394, 61: 427, 62: 431, 63: 435, 64: 439, 65: 444, 66: 448, 67: 452, 68: 456, 69: 460, 70: 465, 71: 498, 72: 502, 73: 506, 74: 510, 75: 514, 76: 519, 77: 523, 78: 527, 79: 531, 80: 536, 81: 569, 82: 573, 83: 577, 84: 581, 85: 586, 86: 590, 87: 594, 88: 599, 89: 603, 90: 607 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 328,
    hp: 10164,
    def: 607,
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
        id: "wanderer-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wanderer-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.68714, 0.74307, 0.799, 0.8789, 0.93483, 0.99875, 1.08664, 1.17453, 1.26242, 1.3583, 1.45418, 1.55006, 1.64594, 1.74182, 1.8377]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "wanderer-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wanderer-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.65016, 0.70308, 0.756, 0.8316, 0.88452, 0.945, 1.02816, 1.11132, 1.19448, 1.2852, 1.37592, 1.46664, 1.55736, 1.64808, 1.7388]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "wanderer-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "wanderer-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.47644, 0.51522, 0.554, 0.6094, 0.64818, 0.6925, 0.75344, 0.81438, 0.87532, 0.9418, 1.00828, 1.07476, 1.14124, 1.20772, 1.2742]) },
              { stat: "atk", table: talentTable([0.47644, 0.51522, 0.554, 0.6094, 0.64818, 0.6925, 0.75344, 0.81438, 0.87532, 0.9418, 1.00828, 1.07476, 1.14124, 1.20772, 1.2742]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "wanderer-charged",
      name: "Yuuban Meigen",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wanderer-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.3208, 1.41986, 1.51892, 1.651, 1.75006, 1.84912, 1.9812, 2.11328, 2.24536, 2.37744, 2.50952, 2.6416, 2.8067, 2.9718, 3.1369]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "wanderer-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wanderer-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "wanderer-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "wanderer-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "wanderer-skill",
      name: "Hanega: Song of the Wind",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 1, element: "anemo" },
      instances: [
        {
          id: "wanderer-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.952, 1.0234, 1.0948, 1.19, 1.2614, 1.3328, 1.428, 1.5232, 1.6184, 1.7136, 1.8088, 1.904, 2.023, 2.142, 2.261]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "wanderer-skill-2",
          name: "Kuugo: Fushoudan DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.329825, 1.349575, 1.369325, 1.395, 1.41475, 1.4345, 1.460175, 1.48585, 1.511525, 1.5372, 1.562875, 1.58855, 1.614225, 1.6399, 1.665575]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "wanderer-skill-3",
          name: "Kuugo: Toufukai DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.26386, 1.27966, 1.29546, 1.316, 1.3318, 1.3476, 1.36814, 1.38868, 1.40922, 1.42976, 1.4503, 1.47084, 1.49138, 1.51192, 1.53246]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "wanderer-burst",
      name: "Kyougen: Five Ceremonial Plays",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "wanderer-burst-1-1",
          name: "Skill DMG (1/5)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.472, 1.5824, 1.6928, 1.84, 1.9504, 2.0608, 2.208, 2.3552, 2.5024, 2.6496, 2.7968, 2.944, 3.128, 3.312, 3.496]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "wanderer-burst-1-2",
          name: "Skill DMG (2/5)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.472, 1.5824, 1.6928, 1.84, 1.9504, 2.0608, 2.208, 2.3552, 2.5024, 2.6496, 2.7968, 2.944, 3.128, 3.312, 3.496]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "wanderer-burst-1-3",
          name: "Skill DMG (3/5)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.472, 1.5824, 1.6928, 1.84, 1.9504, 2.0608, 2.208, 2.3552, 2.5024, 2.6496, 2.7968, 2.944, 3.128, 3.312, 3.496]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "wanderer-burst-1-4",
          name: "Skill DMG (4/5)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.472, 1.5824, 1.6928, 1.84, 1.9504, 2.0608, 2.208, 2.3552, 2.5024, 2.6496, 2.7968, 2.944, 3.128, 3.312, 3.496]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "wanderer-burst-1-5",
          name: "Skill DMG (5/5)",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.472, 1.5824, 1.6928, 1.84, 1.9504, 2.0608, 2.208, 2.3552, 2.5024, 2.6496, 2.7968, 2.944, 3.128, 3.312, 3.496]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "wanderer-a1", name: "Jade-Claimed Flower", unlockAscension: 1, effects: [] },
    { id: "wanderer-a4", name: "Gales of Reverie", unlockAscension: 4, effects: [] },
    { id: "wanderer-p3", name: "Strum the Swirling Winds", effects: [] },
  ],
  constellations: [
    { level: 1, id: "wanderer-c1", name: "Shoban: Ostentatious Plumage", effects: [] },
    { level: 2, id: "wanderer-c2", name: "Niban: Isle Amidst White Waves", effects: [] },
    { level: 3, id: "wanderer-c3", name: "Sanban: Moonflower Kusemai", effects: [], buffs: [{ id: "wanderer-c3", source: "Sanban: Moonflower Kusemai", sourceCharacterId: "wanderer", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "wanderer-c4", name: "Yonban: Set Adrift into Spring", effects: [] },
    { level: 5, id: "wanderer-c5", name: "Matsuban: Ancient Illuminator From Abroad", effects: [], buffs: [{ id: "wanderer-c5", source: "Matsuban: Ancient Illuminator From Abroad", sourceCharacterId: "wanderer", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "wanderer-c6", name: "Shugen: The Curtains' Melancholic Sway", effects: [] },
  ],
  resources: [],
};

export const xianyun: GeneratedCharacter = {
  id: "xianyun",
  name: "Xianyun",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 810, 2: 878, 3: 945, 4: 1013, 5: 1080, 6: 1148, 7: 1215, 8: 1284, 9: 1352, 10: 1419, 11: 1487, 12: 1555, 13: 1623, 14: 1692, 15: 1760, 16: 1828, 17: 1897, 18: 1965, 19: 2034, 20: 2102, 21: 2866, 22: 2935, 23: 3003, 24: 3072, 25: 3141, 26: 3211, 27: 3280, 28: 3349, 29: 3418, 30: 3487, 31: 3557, 32: 3627, 33: 3696, 34: 3765, 35: 3835, 36: 3905, 37: 3975, 38: 4045, 39: 4114, 40: 4185, 41: 4748, 42: 4819, 43: 4889, 44: 4959, 45: 5029, 46: 5100, 47: 5170, 48: 5241, 49: 5312, 50: 5383, 51: 6111, 52: 6183, 53: 6253, 54: 6324, 55: 6396, 56: 6467, 57: 6538, 58: 6610, 59: 6681, 60: 6752, 61: 7317, 62: 7389, 63: 7461, 64: 7532, 65: 7604, 66: 7676, 67: 7748, 68: 7820, 69: 7892, 70: 7964, 71: 8530, 72: 8603, 73: 8675, 74: 8747, 75: 8820, 76: 8892, 77: 8965, 78: 9038, 79: 9111, 80: 9184, 81: 9750, 82: 9823, 83: 9896, 84: 9969, 85: 10042, 86: 10116, 87: 10189, 88: 10262, 89: 10336, 90: 10409 } },
    atk: { byLevel: { 1: 26, 2: 28, 3: 30, 4: 33, 5: 35, 6: 37, 7: 39, 8: 41, 9: 43, 10: 46, 11: 48, 12: 50, 13: 52, 14: 54, 15: 57, 16: 59, 17: 61, 18: 63, 19: 65, 20: 68, 21: 92, 22: 94, 23: 97, 24: 99, 25: 101, 26: 103, 27: 106, 28: 108, 29: 110, 30: 112, 31: 114, 32: 117, 33: 119, 34: 121, 35: 123, 36: 126, 37: 128, 38: 130, 39: 132, 40: 135, 41: 153, 42: 155, 43: 157, 44: 160, 45: 162, 46: 164, 47: 166, 48: 169, 49: 171, 50: 173, 51: 197, 52: 199, 53: 201, 54: 203, 55: 206, 56: 208, 57: 210, 58: 213, 59: 215, 60: 217, 61: 235, 62: 238, 63: 240, 64: 242, 65: 245, 66: 247, 67: 249, 68: 252, 69: 254, 70: 256, 71: 274, 72: 277, 73: 279, 74: 281, 75: 284, 76: 286, 77: 288, 78: 291, 79: 293, 80: 295, 81: 314, 82: 316, 83: 318, 84: 321, 85: 323, 86: 325, 87: 328, 88: 330, 89: 333, 90: 335 } },
    def: { byLevel: { 1: 45, 2: 48, 3: 52, 4: 56, 5: 59, 6: 63, 7: 67, 8: 71, 9: 74, 10: 78, 11: 82, 12: 86, 13: 89, 14: 93, 15: 97, 16: 101, 17: 104, 18: 108, 19: 112, 20: 116, 21: 158, 22: 161, 23: 165, 24: 169, 25: 173, 26: 177, 27: 180, 28: 184, 29: 188, 30: 192, 31: 196, 32: 199, 33: 203, 34: 207, 35: 211, 36: 215, 37: 219, 38: 222, 39: 226, 40: 230, 41: 261, 42: 265, 43: 269, 44: 273, 45: 277, 46: 281, 47: 284, 48: 288, 49: 292, 50: 296, 51: 336, 52: 340, 53: 344, 54: 348, 55: 352, 56: 356, 57: 360, 58: 364, 59: 368, 60: 371, 61: 403, 62: 406, 63: 410, 64: 414, 65: 418, 66: 422, 67: 426, 68: 430, 69: 434, 70: 438, 71: 469, 72: 473, 73: 477, 74: 481, 75: 485, 76: 489, 77: 493, 78: 497, 79: 501, 80: 505, 81: 536, 82: 540, 83: 544, 84: 548, 85: 552, 86: 556, 87: 560, 88: 565, 89: 569, 90: 573 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 335,
    hp: 10409,
    def: 573,
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
        id: "xianyun-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xianyun-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.403024, 0.433251, 0.463478, 0.50378, 0.534007, 0.564234, 0.604536, 0.644838, 0.685141, 0.725443, 0.765746, 0.806048, 0.856426, 0.906804, 0.957182]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "xianyun-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xianyun-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.388552, 0.417693, 0.446835, 0.48569, 0.514831, 0.543973, 0.582828, 0.621683, 0.660538, 0.699394, 0.738249, 0.777104, 0.825673, 0.874242, 0.922811]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "xianyun-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xianyun-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.488776, 0.525434, 0.562092, 0.61097, 0.647628, 0.684286, 0.733164, 0.782042, 0.830919, 0.879797, 0.928674, 0.977552, 1.038649, 1.099746, 1.160843]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "xianyun-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xianyun-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.649168, 0.697856, 0.746543, 0.81146, 0.860148, 0.908835, 0.973752, 1.038669, 1.103586, 1.168502, 1.233419, 1.298336, 1.379482, 1.460628, 1.541774]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xianyun-charged",
      name: "Word of Wind and Flower",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xianyun-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.2312, 1.32354, 1.41588, 1.539, 1.63134, 1.72368, 1.8468, 1.96992, 2.09304, 2.21616, 2.33928, 2.4624, 2.6163, 2.7702, 2.9241]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "xianyun-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xianyun-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "xianyun-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xianyun-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "xianyun-skill",
      name: "White Clouds at Dawn",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 5, element: "anemo" },
      instances: [
        {
          id: "xianyun-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.248, 0.2666, 0.2852, 0.31, 0.3286, 0.3472, 0.372, 0.3968, 0.4216, 0.4464, 0.4712, 0.496, 0.527, 0.558, 0.589]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "xianyun-skill-2",
          name: "Driftcloud Wave DMG (1)",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.16, 1.247, 1.334, 1.45, 1.537, 1.624, 1.74, 1.856, 1.972, 2.088, 2.204, 2.32, 2.465, 2.61, 2.755]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "xianyun-skill-3",
          name: "Driftcloud Wave DMG (2)",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.48, 1.591, 1.702, 1.85, 1.961, 2.072, 2.22, 2.368, 2.516, 2.664, 2.812, 2.96, 3.145, 3.33, 3.515]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "xianyun-skill-4",
          name: "Driftcloud Wave DMG (3)",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([3.376, 3.6292, 3.8824, 4.22, 4.4732, 4.7264, 5.064, 5.4016, 5.7392, 6.0768, 6.4144, 6.752, 7.174, 7.596, 8.018]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xianyun-burst",
      name: "Stars Gather at Dusk",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "xianyun-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.08, 1.161, 1.242, 1.35, 1.431, 1.512, 1.62, 1.728, 1.836, 1.944, 2.052, 2.16, 2.295, 2.43, 2.565]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "xianyun-burst-2",
          name: "Starwicker DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.392, 0.4214, 0.4508, 0.49, 0.5194, 0.5488, 0.588, 0.6272, 0.6664, 0.7056, 0.7448, 0.784, 0.833, 0.882, 0.931]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "xianyun-a1", name: "Galefeather Pursuit", unlockAscension: 1, effects: [] },
    { id: "xianyun-a4", name: "Consider, the Adeptus in Her Realm", unlockAscension: 4, effects: [] },
    { id: "xianyun-p3", name: "Crane Form", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xianyun-c1", name: "Purifying Wind", effects: [] },
    { level: 2, id: "xianyun-c2", name: "Aloof From the World", effects: [] },
    { level: 3, id: "xianyun-c3", name: "Creations of Star and Moon", effects: [], buffs: [{ id: "xianyun-c3", source: "Creations of Star and Moon", sourceCharacterId: "xianyun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "xianyun-c4", name: "Mystery Millet Gourmet", effects: [] },
    { level: 5, id: "xianyun-c5", name: "Astride Rose-Colored Clouds", effects: [], buffs: [{ id: "xianyun-c5", source: "Astride Rose-Colored Clouds", sourceCharacterId: "xianyun", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "xianyun-c6", name: "They Call Her Cloud Retainer", effects: [] },
  ],
  resources: [],
};

export const xiao: GeneratedCharacter = {
  id: "xiao",
  name: "Xiao",
  element: "anemo",
  weaponType: "polearm",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 991, 2: 1074, 3: 1156, 4: 1239, 5: 1322, 6: 1405, 7: 1487, 8: 1570, 9: 1654, 10: 1736, 11: 1819, 12: 1903, 13: 1986, 14: 2070, 15: 2153, 16: 2237, 17: 2321, 18: 2404, 19: 2489, 20: 2572, 21: 3506, 22: 3590, 23: 3675, 24: 3759, 25: 3843, 26: 3929, 27: 4013, 28: 4097, 29: 4182, 30: 4267, 31: 4352, 32: 4437, 33: 4522, 34: 4607, 35: 4692, 36: 4778, 37: 4863, 38: 4949, 39: 5034, 40: 5120, 41: 5810, 42: 5896, 43: 5982, 44: 6067, 45: 6154, 46: 6240, 47: 6326, 48: 6412, 49: 6500, 50: 6586, 51: 7477, 52: 7565, 53: 7651, 54: 7738, 55: 7825, 56: 7913, 57: 8000, 58: 8087, 59: 8174, 60: 8262, 61: 8953, 62: 9040, 63: 9128, 64: 9216, 65: 9304, 66: 9392, 67: 9479, 68: 9568, 69: 9656, 70: 9744, 71: 10436, 72: 10526, 73: 10614, 74: 10702, 75: 10791, 76: 10880, 77: 10969, 78: 11058, 79: 11147, 80: 11236, 81: 11930, 82: 12019, 83: 12108, 84: 12197, 85: 12287, 86: 12377, 87: 12466, 88: 12556, 89: 12647, 90: 12736 } },
    atk: { byLevel: { 1: 27, 2: 29, 3: 32, 4: 34, 5: 36, 6: 39, 7: 41, 8: 43, 9: 45, 10: 48, 11: 50, 12: 52, 13: 54, 14: 57, 15: 59, 16: 61, 17: 64, 18: 66, 19: 68, 20: 71, 21: 96, 22: 98, 23: 101, 24: 103, 25: 105, 26: 108, 27: 110, 28: 112, 29: 115, 30: 117, 31: 119, 32: 122, 33: 124, 34: 126, 35: 129, 36: 131, 37: 133, 38: 136, 39: 138, 40: 140, 41: 159, 42: 162, 43: 164, 44: 166, 45: 169, 46: 171, 47: 173, 48: 176, 49: 178, 50: 181, 51: 205, 52: 207, 53: 210, 54: 212, 55: 215, 56: 217, 57: 219, 58: 222, 59: 224, 60: 227, 61: 245, 62: 248, 63: 250, 64: 253, 65: 255, 66: 258, 67: 260, 68: 262, 69: 265, 70: 267, 71: 286, 72: 289, 73: 291, 74: 293, 75: 296, 76: 298, 77: 301, 78: 303, 79: 306, 80: 308, 81: 327, 82: 330, 83: 332, 84: 334, 85: 337, 86: 339, 87: 342, 88: 344, 89: 347, 90: 349 } },
    def: { byLevel: { 1: 62, 2: 67, 3: 73, 4: 78, 5: 83, 6: 88, 7: 93, 8: 99, 9: 104, 10: 109, 11: 114, 12: 119, 13: 125, 14: 130, 15: 135, 16: 140, 17: 146, 18: 151, 19: 156, 20: 161, 21: 220, 22: 225, 23: 231, 24: 236, 25: 241, 26: 247, 27: 252, 28: 257, 29: 262, 30: 268, 31: 273, 32: 278, 33: 284, 34: 289, 35: 294, 36: 300, 37: 305, 38: 311, 39: 316, 40: 321, 41: 365, 42: 370, 43: 375, 44: 381, 45: 386, 46: 392, 47: 397, 48: 402, 49: 408, 50: 413, 51: 469, 52: 475, 53: 480, 54: 486, 55: 491, 56: 497, 57: 502, 58: 508, 59: 513, 60: 519, 61: 562, 62: 567, 63: 573, 64: 578, 65: 584, 66: 589, 67: 595, 68: 600, 69: 606, 70: 612, 71: 655, 72: 661, 73: 666, 74: 672, 75: 677, 76: 683, 77: 688, 78: 694, 79: 700, 80: 705, 81: 749, 82: 754, 83: 760, 84: 766, 85: 771, 86: 777, 87: 782, 88: 788, 89: 794, 90: 799 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 349,
    hp: 12736,
    def: 799,
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
        id: "xiao-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.27544, 0.29422, 0.313, 0.33804, 0.35682, 0.37873, 0.4069, 0.43507, 0.46324, 0.49141, 0.51958, 0.54775, 0.57592, 0.60409, 0.63226]) },
              { stat: "atk", table: talentTable([0.27544, 0.29422, 0.313, 0.33804, 0.35682, 0.37873, 0.4069, 0.43507, 0.46324, 0.49141, 0.51958, 0.54775, 0.57592, 0.60409, 0.63226]) },
            ],
          },
        ],
      },
      {
        id: "xiao-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.56936, 0.60818, 0.647, 0.69876, 0.73758, 0.78287, 0.8411, 0.89933, 0.95756, 1.01579, 1.07402, 1.13225, 1.19048, 1.24871, 1.30694]) },
            ],
          },
        ],
      },
      {
        id: "xiao-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.68552, 0.73226, 0.779, 0.84132, 0.88806, 0.94259, 1.0127, 1.08281, 1.15292, 1.22303, 1.29314, 1.36325, 1.43336, 1.50347, 1.57358]) },
            ],
          },
        ],
      },
      {
        id: "xiao-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.37664, 0.40232, 0.428, 0.46224, 0.48792, 0.51788, 0.5564, 0.59492, 0.63344, 0.67196, 0.71048, 0.749, 0.78752, 0.82604, 0.86456]) },
              { stat: "atk", table: talentTable([0.37664, 0.40232, 0.428, 0.46224, 0.48792, 0.51788, 0.5564, 0.59492, 0.63344, 0.67196, 0.71048, 0.749, 0.78752, 0.82604, 0.86456]) },
            ],
          },
        ],
      },
      {
        id: "xiao-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.71544, 0.76422, 0.813, 0.87804, 0.92682, 0.98373, 1.0569, 1.13007, 1.20324, 1.27641, 1.34958, 1.42275, 1.49592, 1.56909, 1.64226]) },
            ],
          },
        ],
      },
      {
        id: "xiao-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xiao-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.95832, 1.02366, 1.089, 1.17612, 1.24146, 1.31769, 1.4157, 1.51371, 1.61172, 1.70973, 1.80774, 1.90575, 2.00376, 2.10177, 2.19978]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xiao-charged",
      name: "Whirlwind Thrust",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiao-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.21088, 1.29344, 1.376, 1.48608, 1.56864, 1.66496, 1.7888, 1.91264, 2.03648, 2.16032, 2.28416, 2.408, 2.53184, 2.65568, 2.77952]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "xiao-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiao-plungeLow-1",
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
      id: "xiao-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xiao-plungeHigh-1",
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
      id: "xiao-skill",
      name: "Lemniscatic Wind Cycling",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 3, element: "anemo" },
      instances: [
        {
          id: "xiao-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([2.528, 2.7176, 2.9072, 3.16, 3.3496, 3.5392, 3.792, 4.0448, 4.2976, 4.5504, 4.8032, 5.056, 5.372, 5.688, 6.004]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xiao-burst",
      name: "Bane of All Evil",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
      ],
    },
  passives: [
    { id: "xiao-a1", name: "Conqueror of Evil: Tamer of Demons", unlockAscension: 1, effects: [] },
    { id: "xiao-a4", name: "Dissolution Eon: Heaven Fall", unlockAscension: 4, effects: [] },
    { id: "xiao-p3", name: "Transcension: Gravity Defier", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xiao-c1", name: "Dissolution Eon: Destroyer of Worlds", effects: [] },
    { level: 2, id: "xiao-c2", name: "Annihilation Eon: Blossom of Kaleidos", effects: [] },
    { level: 3, id: "xiao-c3", name: "Conqueror of Evil: Wrath Deity", effects: [], buffs: [{ id: "xiao-c3", source: "Conqueror of Evil: Wrath Deity", sourceCharacterId: "xiao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "xiao-c4", name: "Transcension: Extinction of Suffering", effects: [] },
    { level: 5, id: "xiao-c5", name: "Evolution Eon: Origin of Ignorance", effects: [], buffs: [{ id: "xiao-c5", source: "Evolution Eon: Origin of Ignorance", sourceCharacterId: "xiao", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "xiao-c6", name: "Conqueror of Evil: Guardian Yaksha", effects: [] },
  ],
  resources: [],
};

export const yumemizukiMizuki: GeneratedCharacter = {
  id: "yumemizuki-mizuki",
  name: "Yumemizuki Mizuki",
  element: "anemo",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 991, 2: 1074, 3: 1156, 4: 1239, 5: 1322, 6: 1405, 7: 1487, 8: 1570, 9: 1654, 10: 1736, 11: 1819, 12: 1903, 13: 1986, 14: 2070, 15: 2153, 16: 2237, 17: 2321, 18: 2404, 19: 2489, 20: 2572, 21: 3506, 22: 3590, 23: 3675, 24: 3759, 25: 3843, 26: 3929, 27: 4013, 28: 4097, 29: 4182, 30: 4267, 31: 4352, 32: 4437, 33: 4522, 34: 4607, 35: 4692, 36: 4778, 37: 4863, 38: 4949, 39: 5034, 40: 5120, 41: 5810, 42: 5896, 43: 5982, 44: 6067, 45: 6154, 46: 6240, 47: 6326, 48: 6412, 49: 6500, 50: 6586, 51: 7477, 52: 7565, 53: 7651, 54: 7738, 55: 7825, 56: 7913, 57: 8000, 58: 8087, 59: 8174, 60: 8262, 61: 8953, 62: 9040, 63: 9128, 64: 9216, 65: 9304, 66: 9392, 67: 9479, 68: 9568, 69: 9656, 70: 9744, 71: 10436, 72: 10526, 73: 10614, 74: 10702, 75: 10791, 76: 10880, 77: 10969, 78: 11058, 79: 11147, 80: 11236, 81: 11930, 82: 12019, 83: 12108, 84: 12197, 85: 12287, 86: 12377, 87: 12466, 88: 12556, 89: 12647, 90: 12736 } },
    atk: { byLevel: { 1: 17, 2: 18, 3: 20, 4: 21, 5: 22, 6: 24, 7: 25, 8: 27, 9: 28, 10: 29, 11: 31, 12: 32, 13: 34, 14: 35, 15: 36, 16: 38, 17: 39, 18: 41, 19: 42, 20: 43, 21: 59, 22: 61, 23: 62, 24: 64, 25: 65, 26: 66, 27: 68, 28: 69, 29: 71, 30: 72, 31: 74, 32: 75, 33: 76, 34: 78, 35: 79, 36: 81, 37: 82, 38: 84, 39: 85, 40: 87, 41: 98, 42: 100, 43: 101, 44: 103, 45: 104, 46: 105, 47: 107, 48: 108, 49: 110, 50: 111, 51: 126, 52: 128, 53: 129, 54: 131, 55: 132, 56: 134, 57: 135, 58: 137, 59: 138, 60: 140, 61: 151, 62: 153, 63: 154, 64: 156, 65: 157, 66: 159, 67: 160, 68: 162, 69: 163, 70: 165, 71: 176, 72: 178, 73: 179, 74: 181, 75: 182, 76: 184, 77: 185, 78: 187, 79: 188, 80: 190, 81: 202, 82: 203, 83: 205, 84: 206, 85: 208, 86: 209, 87: 211, 88: 212, 89: 214, 90: 215 } },
    def: { byLevel: { 1: 59, 2: 64, 3: 69, 4: 74, 5: 79, 6: 84, 7: 88, 8: 93, 9: 98, 10: 103, 11: 108, 12: 113, 13: 118, 14: 123, 15: 128, 16: 133, 17: 138, 18: 143, 19: 148, 20: 153, 21: 208, 22: 213, 23: 218, 24: 223, 25: 228, 26: 234, 27: 239, 28: 244, 29: 249, 30: 254, 31: 259, 32: 264, 33: 269, 34: 274, 35: 279, 36: 284, 37: 289, 38: 294, 39: 299, 40: 304, 41: 345, 42: 350, 43: 356, 44: 361, 45: 366, 46: 371, 47: 376, 48: 381, 49: 386, 50: 391, 51: 444, 52: 450, 53: 455, 54: 460, 55: 465, 56: 470, 57: 476, 58: 481, 59: 486, 60: 491, 61: 532, 62: 537, 63: 543, 64: 548, 65: 553, 66: 558, 67: 563, 68: 569, 69: 574, 70: 579, 71: 620, 72: 626, 73: 631, 74: 636, 75: 641, 76: 647, 77: 652, 78: 657, 79: 663, 80: 668, 81: 709, 82: 714, 83: 720, 84: 725, 85: 730, 86: 736, 87: 741, 88: 746, 89: 752, 90: 757 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 115],
  },
  baseStats: {
    atk: 215,
    hp: 12736,
    def: 757,
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
        id: "yumemizuki-mizuki-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yumemizuki-mizuki-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.522768, 0.561976, 0.601183, 0.65346, 0.692668, 0.731875, 0.784152, 0.836429, 0.888706, 0.940982, 0.993259, 1.045536, 1.110882, 1.176228, 1.241574]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "yumemizuki-mizuki-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yumemizuki-mizuki-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.469144, 0.50433, 0.539516, 0.58643, 0.621616, 0.656802, 0.703716, 0.75063, 0.797545, 0.844459, 0.891374, 0.938288, 0.996931, 1.055574, 1.114217]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
      {
        id: "yumemizuki-mizuki-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yumemizuki-mizuki-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "anemo",
            scaling: [
              { stat: "atk", table: talentTable([0.713688, 0.767215, 0.820741, 0.89211, 0.945637, 0.999163, 1.070532, 1.141901, 1.21327, 1.284638, 1.356007, 1.427376, 1.516587, 1.605798, 1.695009]) },
            ],
            application: { element: "anemo", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yumemizuki-mizuki-charged",
      name: "Pure Heart, Pure Dreams",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yumemizuki-mizuki-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.3, 1.3975, 1.495, 1.625, 1.7225, 1.82, 1.95, 2.08, 2.21, 2.34, 2.47, 2.6, 2.7625, 2.925, 3.0875]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "yumemizuki-mizuki-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yumemizuki-mizuki-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "yumemizuki-mizuki-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yumemizuki-mizuki-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "yumemizuki-mizuki-skill",
      name: "Aisa Utamakura Pilgrimage",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(15),
      energyCost: 0,
      particles: { count: 1, element: "anemo" },
      instances: [
        {
          id: "yumemizuki-mizuki-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.57744, 0.620748, 0.664056, 0.7218, 0.765108, 0.808416, 0.86616, 0.923904, 0.981648, 1.039392, 1.097136, 1.15488, 1.22706, 1.29924, 1.37142]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
        {
          id: "yumemizuki-mizuki-skill-2",
          name: "Continuous Attack DMG",
          damageType: "skill",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.44912, 0.482804, 0.516488, 0.5614, 0.595084, 0.628768, 0.67368, 0.718592, 0.763504, 0.808416, 0.853328, 0.89824, 0.95438, 1.01052, 1.06666]) },
          ],
          application: { element: "anemo", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yumemizuki-mizuki-burst",
      name: "Anraku Secret Spring Therapy",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "yumemizuki-mizuki-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.9408, 1.01136, 1.08192, 1.176, 1.24656, 1.31712, 1.4112, 1.50528, 1.59936, 1.69344, 1.78752, 1.8816, 1.9992, 2.1168, 2.2344]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
        {
          id: "yumemizuki-mizuki-burst-2",
          name: "Munen Shockwave DMG",
          damageType: "burst",
          element: "anemo",
          scaling: [
            { stat: "atk", table: talentTable([0.7056, 0.75852, 0.81144, 0.882, 0.93492, 0.98784, 1.0584, 1.12896, 1.19952, 1.27008, 1.34064, 1.4112, 1.4994, 1.5876, 1.6758]) },
          ],
          application: { element: "anemo", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yumemizuki-mizuki-a1", name: "Bright Moon's Restless Voice", unlockAscension: 1, effects: [] },
    { id: "yumemizuki-mizuki-a4", name: "Thoughts by Day Bring Dreams by Night", unlockAscension: 4, effects: [] },
    { id: "yumemizuki-mizuki-p3", name: "All Ailments Banished", effects: [] },
    { id: "yumemizuki-mizuki-p4", name: "Vast Be the Dream", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yumemizuki-mizuki-c1", name: "In Mist-Like Waters", effects: [] },
    { level: 2, id: "yumemizuki-mizuki-c2", name: "Your Echo I Meet in Dreams", effects: [] },
    { level: 3, id: "yumemizuki-mizuki-c3", name: "Till Dawn's Moon Ends Night", effects: [], buffs: [{ id: "yumemizuki-mizuki-c3", source: "Till Dawn's Moon Ends Night", sourceCharacterId: "yumemizuki-mizuki", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "yumemizuki-mizuki-c4", name: "Buds Warm Lucid Springs", effects: [] },
    { level: 5, id: "yumemizuki-mizuki-c5", name: "As Setting Moon Brings Year's End", effects: [], buffs: [{ id: "yumemizuki-mizuki-c5", source: "As Setting Moon Brings Year's End", sourceCharacterId: "yumemizuki-mizuki", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "yumemizuki-mizuki-c6", name: "The Heart Lingers Long", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   chasca.castTime: cast times are engine defaults, not sourced
//   chasca.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   chasca.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   faruzan.castTime: cast times are engine defaults, not sourced
//   faruzan.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   faruzan.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   ifa.castTime: cast times are engine defaults, not sourced
//   ifa.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   ifa.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   jahoda.castTime: cast times are engine defaults, not sourced
//   jahoda.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   jahoda.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   jean.castTime: cast times are engine defaults, not sourced
//   jean.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   jean.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kaedeharaKazuha.castTime: cast times are engine defaults, not sourced
//   kaedeharaKazuha.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   kaedeharaKazuha.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lanYan.castTime: cast times are engine defaults, not sourced
//   lanYan.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   lanYan.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   lynette.castTime: cast times are engine defaults, not sourced
//   lynette.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   lynette.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   prune.castTime: cast times are engine defaults, not sourced
//   prune.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   prune.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sayu.castTime: cast times are engine defaults, not sourced
//   sayu.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   sayu.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   shikanoinHeizou.castTime: cast times are engine defaults, not sourced
//   shikanoinHeizou.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   shikanoinHeizou.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sucrose.castTime: cast times are engine defaults, not sourced
//   sucrose.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   sucrose.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFAnemo.castTime: cast times are engine defaults, not sourced
//   travelerFAnemo.constellations: 3 modelled, 3 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   travelerFAnemo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFAnemo.skill.particles: skill particle yield not published by either source
//   travelerMAnemo.castTime: cast times are engine defaults, not sourced
//   travelerMAnemo.constellations: 3 modelled, 3 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   travelerMAnemo.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMAnemo.skill.particles: skill particle yield not published by either source
//   varka.castTime: cast times are engine defaults, not sourced
//   varka.constellations: 0 modelled, 0 unimplemented (numbers emitted, no buff channel), 10 unverified (text only) -- see perkEffects.ts
//   varka.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   venti.castTime: cast times are engine defaults, not sourced
//   venti.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   venti.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   wanderer.castTime: cast times are engine defaults, not sourced
//   wanderer.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   wanderer.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   xianyun.castTime: cast times are engine defaults, not sourced
//   xianyun.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   xianyun.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   xiao.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   xiao.castTime: cast times are engine defaults, not sourced
//   xiao.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   xiao.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yumemizukiMizuki.castTime: cast times are engine defaults, not sourced
//   yumemizukiMizuki.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   yumemizukiMizuki.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const anemoGeneratedCharacters: readonly GeneratedCharacter[] = [
  chasca,
  faruzan,
  ifa,
  jahoda,
  jean,
  kaedeharaKazuha,
  lanYan,
  lynette,
  prune,
  sayu,
  shikanoinHeizou,
  sucrose,
  travelerFAnemo,
  travelerMAnemo,
  varka,
  venti,
  wanderer,
  xianyun,
  xiao,
  yumemizukiMizuki,
];
