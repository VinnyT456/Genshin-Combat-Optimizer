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


export const aino: GeneratedCharacter = {
  id: "aino",
  name: "Aino",
  element: "hydro",
  weaponType: "claymore",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 939, 2: 1017, 3: 1094, 4: 1172, 5: 1249, 6: 1327, 7: 1404, 8: 1482, 9: 1560, 10: 1637, 11: 1715, 12: 1792, 13: 1870, 14: 1947, 15: 2025, 16: 2103, 17: 2180, 18: 2258, 19: 2335, 20: 2413, 21: 3191, 22: 3269, 23: 3347, 24: 3424, 25: 3502, 26: 3579, 27: 3657, 28: 3734, 29: 3812, 30: 3889, 31: 3967, 32: 4045, 33: 4122, 34: 4200, 35: 4277, 36: 4355, 37: 4432, 38: 4510, 39: 4588, 40: 4665, 41: 5241, 42: 5318, 43: 5396, 44: 5473, 45: 5551, 46: 5629, 47: 5706, 48: 5784, 49: 5861, 50: 5939, 51: 6681, 52: 6759, 53: 6837, 54: 6914, 55: 6992, 56: 7069, 57: 7147, 58: 7224, 59: 7301, 60: 7379, 61: 7955, 62: 8033, 63: 8110, 64: 8188, 65: 8265, 66: 8343, 67: 8421, 68: 8498, 69: 8576, 70: 8653, 71: 9229, 72: 9306, 73: 9384, 74: 9462, 75: 9539, 76: 9617, 77: 9694, 78: 9772, 79: 9849, 80: 9927, 81: 10503, 82: 10580, 83: 10658, 84: 10735, 85: 10813, 86: 10890, 87: 10968, 88: 11045, 89: 11123, 90: 11201 } },
    atk: { byLevel: { 1: 20, 2: 22, 3: 24, 4: 25, 5: 27, 6: 29, 7: 30, 8: 32, 9: 34, 10: 35, 11: 37, 12: 39, 13: 40, 14: 42, 15: 44, 16: 45, 17: 47, 18: 49, 19: 50, 20: 52, 21: 69, 22: 71, 23: 72, 24: 74, 25: 76, 26: 77, 27: 79, 28: 81, 29: 82, 30: 84, 31: 86, 32: 87, 33: 89, 34: 91, 35: 92, 36: 94, 37: 96, 38: 97, 39: 99, 40: 101, 41: 113, 42: 115, 43: 117, 44: 118, 45: 120, 46: 122, 47: 123, 48: 125, 49: 127, 50: 128, 51: 144, 52: 146, 53: 148, 54: 149, 55: 151, 56: 153, 57: 154, 58: 156, 59: 158, 60: 160, 61: 172, 62: 174, 63: 175, 64: 177, 65: 179, 66: 180, 67: 182, 68: 184, 69: 185, 70: 187, 71: 200, 72: 201, 73: 203, 74: 205, 75: 206, 76: 208, 77: 210, 78: 211, 79: 213, 80: 215, 81: 227, 82: 229, 83: 230, 84: 232, 85: 234, 86: 235, 87: 237, 88: 239, 89: 240, 90: 242 } },
    def: { byLevel: { 1: 51, 2: 55, 3: 59, 4: 64, 5: 68, 6: 72, 7: 76, 8: 80, 9: 85, 10: 89, 11: 93, 12: 97, 13: 101, 14: 106, 15: 110, 16: 114, 17: 118, 18: 122, 19: 127, 20: 131, 21: 173, 22: 177, 23: 182, 24: 186, 25: 190, 26: 194, 27: 198, 28: 203, 29: 207, 30: 211, 31: 215, 32: 219, 33: 224, 34: 228, 35: 232, 36: 236, 37: 240, 38: 245, 39: 249, 40: 253, 41: 284, 42: 288, 43: 293, 44: 297, 45: 301, 46: 305, 47: 309, 48: 314, 49: 318, 50: 322, 51: 362, 52: 367, 53: 371, 54: 375, 55: 379, 56: 383, 57: 388, 58: 392, 59: 396, 60: 400, 61: 431, 62: 436, 63: 440, 64: 444, 65: 448, 66: 452, 67: 457, 68: 461, 69: 465, 70: 469, 71: 501, 72: 505, 73: 509, 74: 513, 75: 517, 76: 522, 77: 526, 78: 530, 79: 534, 80: 538, 81: 570, 82: 574, 83: 578, 84: 582, 85: 586, 86: 591, 87: 595, 88: 599, 89: 603, 90: 607 } },
  },
  ascensionBonus: {
    stat: "elementalMastery",
    valueByPhase: [0, 0, 0, 0, 0, 0, 96],
  },
  baseStats: {
    atk: 242,
    hp: 11201,
    def: 607,
    elementalMastery: 96,
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
        id: "aino-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aino-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.664986, 0.719113, 0.77324, 0.850564, 0.904691, 0.96655, 1.051606, 1.136663, 1.221719, 1.314508, 1.407297, 1.500086, 1.592874, 1.685663, 1.778452]) },
            ],
          },
        ],
      },
      {
        id: "aino-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aino-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.661916, 0.715793, 0.76967, 0.846637, 0.900514, 0.962087, 1.046751, 1.131415, 1.216079, 1.308439, 1.400799, 1.49316, 1.58552, 1.677881, 1.770241]) },
            ],
          },
        ],
      },
      {
        id: "aino-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "aino-na-3-1-1",
            name: "3-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.492165, 0.532225, 0.572285, 0.629514, 0.669573, 0.715356, 0.778308, 0.841259, 0.90421, 0.972885, 1.041559, 1.110233, 1.178907, 1.247581, 1.316256]) },
            ],
          },
          {
            id: "aino-na-3-1-2",
            name: "3-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.492165, 0.532225, 0.572285, 0.629514, 0.669573, 0.715356, 0.778308, 0.841259, 0.90421, 0.972885, 1.041559, 1.110233, 1.178907, 1.247581, 1.316256]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "aino-charged",
      name: "Bish-Bash-Bosh Repair",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aino-charged-1",
          name: "Charged Attack Loop DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.62522, 0.67611, 0.727, 0.7997, 0.85059, 0.90875, 0.98872, 1.06869, 1.14866, 1.2359, 1.32314, 1.41038, 1.49762, 1.58486, 1.6721]) },
          ],
        },
        {
          id: "aino-charged-2",
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
      id: "aino-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aino-plungeLow-1",
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
      id: "aino-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "aino-plungeHigh-1",
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
      id: "aino-skill",
      name: "Musecatcher",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 3, element: "hydro" },
      instances: [
        {
          id: "aino-skill-1",
          name: "Stage 1 DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.656, 0.7052, 0.7544, 0.82, 0.8692, 0.9184, 0.984, 1.0496, 1.1152, 1.1808, 1.2464, 1.312, 1.394, 1.476, 1.558]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "aino-skill-2",
          name: "Stage 2 DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.888, 2.0296, 2.1712, 2.36, 2.5016, 2.6432, 2.832, 3.0208, 3.2096, 3.3984, 3.5872, 3.776, 4.012, 4.248, 4.484]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "aino-burst",
      name: "Precision Hydronic Cooler",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(13.5),
      energyCost: 50,
      instances: [
        {
          id: "aino-burst-1",
          name: "Water Ball DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.20112, 0.216204, 0.231288, 0.2514, 0.266484, 0.281568, 0.30168, 0.321792, 0.341904, 0.362016, 0.382128, 0.40224, 0.42738, 0.45252, 0.47766]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "aino-a1", name: "Modular Efficiency Protocol", unlockAscension: 1, effects: [] },
    { id: "aino-a4", name: "Structured Power Booster", unlockAscension: 4, effects: [] },
    { id: "aino-p3", name: "Moonsign Benediction: Force Limit Analysis", effects: [] },
    { id: "aino-p4", name: "Miniaturized Detection Sensor", effects: [] },
  ],
  constellations: [
    { level: 1, id: "aino-c1", name: "The Theory of Ash—Field Equilibrium", effects: [] },
    { level: 2, id: "aino-c2", name: "The Principle of Transference in Gear Differentials", effects: [] },
    { level: 3, id: "aino-c3", name: "Cake and the Art of Mechanism Repair", effects: [], buffs: [{ id: "aino-c3", source: "Cake and the Art of Mechanism Repair", sourceCharacterId: "aino", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "aino-c4", name: "Butter and Cats and the Law of Energy Supply", effects: [] },
    { level: 5, id: "aino-c5", name: "Perpetual Turbine of Metal and Light", effects: [], buffs: [{ id: "aino-c5", source: "Perpetual Turbine of Metal and Light", sourceCharacterId: "aino", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "aino-c6", name: "The Burden of Creative Genius", effects: [] },
  ],
  resources: [],
};

export const barbara: GeneratedCharacter = {
  id: "barbara",
  name: "Barbara",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 821, 2: 889, 3: 956, 4: 1024, 5: 1091, 6: 1160, 7: 1227, 8: 1295, 9: 1363, 10: 1430, 11: 1498, 12: 1566, 13: 1634, 14: 1701, 15: 1769, 16: 1837, 17: 1905, 18: 1973, 19: 2040, 20: 2108, 21: 2788, 22: 2857, 23: 2925, 24: 2992, 25: 3060, 26: 3127, 27: 3196, 28: 3263, 29: 3331, 30: 3398, 31: 3466, 32: 3534, 33: 3602, 34: 3670, 35: 3737, 36: 3805, 37: 3873, 38: 3941, 39: 4009, 40: 4076, 41: 4580, 42: 4647, 43: 4715, 44: 4782, 45: 4851, 46: 4919, 47: 4986, 48: 5054, 49: 5121, 50: 5189, 51: 5837, 52: 5906, 53: 5974, 54: 6041, 55: 6109, 56: 6176, 57: 6245, 58: 6312, 59: 6380, 60: 6448, 61: 6951, 62: 7019, 63: 7086, 64: 7154, 65: 7222, 66: 7290, 67: 7358, 68: 7425, 69: 7493, 70: 7561, 71: 8064, 72: 8132, 73: 8200, 74: 8268, 75: 8335, 76: 8403, 77: 8471, 78: 8539, 79: 8606, 80: 8674, 81: 9178, 82: 9245, 83: 9313, 84: 9380, 85: 9449, 86: 9516, 87: 9584, 88: 9651, 89: 9719, 90: 9787 } },
    atk: { byLevel: { 1: 13, 2: 14, 3: 16, 4: 17, 5: 18, 6: 19, 7: 20, 8: 21, 9: 22, 10: 23, 11: 24, 12: 25, 13: 27, 14: 28, 15: 29, 16: 30, 17: 31, 18: 32, 19: 33, 20: 34, 21: 45, 22: 46, 23: 48, 24: 49, 25: 50, 26: 51, 27: 52, 28: 53, 29: 54, 30: 55, 31: 56, 32: 58, 33: 59, 34: 60, 35: 61, 36: 62, 37: 63, 38: 64, 39: 65, 40: 66, 41: 75, 42: 76, 43: 77, 44: 78, 45: 79, 46: 80, 47: 81, 48: 82, 49: 83, 50: 84, 51: 95, 52: 96, 53: 97, 54: 98, 55: 99, 56: 101, 57: 102, 58: 103, 59: 104, 60: 105, 61: 113, 62: 114, 63: 115, 64: 116, 65: 118, 66: 119, 67: 120, 68: 121, 69: 122, 70: 123, 71: 131, 72: 132, 73: 133, 74: 135, 75: 136, 76: 137, 77: 138, 78: 139, 79: 140, 80: 141, 81: 149, 82: 150, 83: 152, 84: 153, 85: 154, 86: 155, 87: 156, 88: 157, 89: 158, 90: 159 } },
    def: { byLevel: { 1: 56, 2: 61, 3: 65, 4: 70, 5: 75, 6: 79, 7: 84, 8: 88, 9: 93, 10: 98, 11: 102, 12: 107, 13: 112, 14: 116, 15: 121, 16: 126, 17: 130, 18: 135, 19: 139, 20: 144, 21: 191, 22: 195, 23: 200, 24: 204, 25: 209, 26: 214, 27: 218, 28: 223, 29: 228, 30: 232, 31: 237, 32: 242, 33: 246, 34: 251, 35: 255, 36: 260, 37: 265, 38: 269, 39: 274, 40: 279, 41: 313, 42: 318, 43: 322, 44: 327, 45: 331, 46: 336, 47: 341, 48: 345, 49: 350, 50: 355, 51: 399, 52: 404, 53: 408, 54: 413, 55: 417, 56: 422, 57: 427, 58: 431, 59: 436, 60: 441, 61: 475, 62: 480, 63: 484, 64: 489, 65: 494, 66: 498, 67: 503, 68: 507, 69: 512, 70: 517, 71: 551, 72: 556, 73: 560, 74: 565, 75: 570, 76: 574, 77: 579, 78: 584, 79: 588, 80: 593, 81: 627, 82: 632, 83: 636, 84: 641, 85: 646, 86: 650, 87: 655, 88: 660, 89: 664, 90: 669 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 159,
    hp: 9787,
    def: 669,
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
        id: "barbara-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "barbara-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.3784, 0.40678, 0.43516, 0.473, 0.50138, 0.52976, 0.5676, 0.60544, 0.64328, 0.68112, 0.720474, 0.771936, 0.823398, 0.874861, 0.926323]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "barbara-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "barbara-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.3552, 0.38184, 0.40848, 0.444, 0.47064, 0.49728, 0.5328, 0.56832, 0.60384, 0.63936, 0.676301, 0.724608, 0.772915, 0.821222, 0.86953]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "barbara-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "barbara-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.4104, 0.44118, 0.47196, 0.513, 0.54378, 0.57456, 0.6156, 0.65664, 0.69768, 0.73872, 0.781402, 0.837216, 0.89303, 0.948845, 1.004659]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "barbara-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "barbara-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.552, 0.5934, 0.6348, 0.69, 0.7314, 0.7728, 0.828, 0.8832, 0.9384, 0.9936, 1.051008, 1.12608, 1.201152, 1.276224, 1.351296]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "barbara-charged",
      name: "Whisper of Water",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "barbara-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.6624, 1.78708, 1.91176, 2.078, 2.20268, 2.32736, 2.4936, 2.65984, 2.82608, 2.99232, 3.16521, 3.391296, 3.617382, 3.843469, 4.069555]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "barbara-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "barbara-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "barbara-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "barbara-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "barbara-skill",
      name: "Let the Show Begin♪",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(32),
      energyCost: 0,
      instances: [
        {
          id: "barbara-skill-1",
          name: "Droplet DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.584, 0.6278, 0.6716, 0.73, 0.7738, 0.8176, 0.876, 0.9344, 0.9928, 1.0512, 1.1096, 1.168, 1.241, 1.314, 1.387]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "barbara-burst",
      name: "Shining Miracle♪",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
      ],
    },
  passives: [
    { id: "barbara-a1", name: "Glorious Season", unlockAscension: 1, effects: [] },
    { id: "barbara-a4", name: "Encore", unlockAscension: 4, effects: [] },
    { id: "barbara-p3", name: "With My Whole Heart♪", effects: [] },
  ],
  constellations: [
    { level: 1, id: "barbara-c1", name: "Gleeful Songs", effects: [] },
    { level: 2, id: "barbara-c2", name: "Vitality Burst", effects: [] },
    { level: 3, id: "barbara-c3", name: "Star of Tomorrow", effects: [], buffs: [{ id: "barbara-c3", source: "Star of Tomorrow", sourceCharacterId: "barbara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "barbara-c4", name: "Attentiveness Be My Power", effects: [] },
    { level: 5, id: "barbara-c5", name: "The Purest Companionship", effects: [], buffs: [{ id: "barbara-c5", source: "The Purest Companionship", sourceCharacterId: "barbara", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "barbara-c6", name: "Dedicating Everything to You", effects: [] },
  ],
  resources: [],
};

export const candace: GeneratedCharacter = {
  id: "candace",
  name: "Candace",
  element: "hydro",
  weaponType: "polearm",
  rarity: 4,
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
    stat: "hpPercent",
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
        id: "candace-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "candace-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.60802, 0.65751, 0.707, 0.7777, 0.82719, 0.88375, 0.96152, 1.03929, 1.11706, 1.2019, 1.28674, 1.37158, 1.45642, 1.54126, 1.6261]) },
            ],
          },
        ],
      },
      {
        id: "candace-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "candace-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.61146, 0.66123, 0.711, 0.7821, 0.83187, 0.88875, 0.96696, 1.04517, 1.12338, 1.2087, 1.29402, 1.37934, 1.46466, 1.54998, 1.6353]) },
            ],
          },
        ],
      },
      {
        id: "candace-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "candace-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.354879, 0.383765, 0.41265, 0.453915, 0.4828, 0.515813, 0.561204, 0.606596, 0.651987, 0.701505, 0.751023, 0.800541, 0.850059, 0.899577, 0.949095]) },
              { stat: "atk", table: talentTable([0.433741, 0.469046, 0.50435, 0.554785, 0.59009, 0.630438, 0.685916, 0.741395, 0.796873, 0.857395, 0.917917, 0.978439, 1.038961, 1.099483, 1.160005]) },
            ],
          },
        ],
      },
      {
        id: "candace-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "candace-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.94944, 1.02672, 1.104, 1.2144, 1.29168, 1.38, 1.50144, 1.62288, 1.74432, 1.8768, 2.00928, 2.14176, 2.27424, 2.40672, 2.5392]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "candace-charged",
      name: "Gleaming Spear - Guardian Stance",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "candace-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.24184, 1.34292, 1.444, 1.5884, 1.68948, 1.805, 1.96384, 2.12268, 2.28152, 2.4548, 2.62808, 2.80136, 2.97464, 3.14792, 3.3212]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "candace-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "candace-plungeLow-1",
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
      id: "candace-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "candace-plungeHigh-1",
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
      id: "candace-skill",
      name: "Sacred Rite: Heron's Sanctum",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 5, element: "hydro" },
      instances: [
        {
          id: "candace-skill-1",
          name: "Basic DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.12, 0.129, 0.138, 0.15, 0.159, 0.168, 0.18, 0.192, 0.204, 0.216, 0.228, 0.24, 0.255, 0.27, 0.285]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "candace-skill-2",
          name: "Charged Up DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.1904, 0.20468, 0.21896, 0.238, 0.25228, 0.26656, 0.2856, 0.30464, 0.32368, 0.34272, 0.36176, 0.3808, 0.4046, 0.4284, 0.4522]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "candace-burst",
      name: "Sacred Rite: Wagtail's Tide",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "candace-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.066104, 0.071062, 0.07602, 0.08263, 0.087588, 0.092546, 0.099156, 0.105766, 0.112377, 0.118987, 0.125598, 0.132208, 0.140471, 0.148734, 0.156997]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "candace-burst-2",
          name: "Wave Impact DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.066104, 0.071062, 0.07602, 0.08263, 0.087588, 0.092546, 0.099156, 0.105766, 0.112377, 0.118987, 0.125598, 0.132208, 0.140471, 0.148734, 0.156997]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "candace-a1", name: "Aegis of Crossed Arrows", unlockAscension: 1, effects: [] },
    { id: "candace-a4", name: "Celestial Dome of Sand", unlockAscension: 4, effects: [] },
    { id: "candace-p3", name: "To Dawn's First Light", effects: [] },
  ],
  constellations: [
    { level: 1, id: "candace-c1", name: "Returning Heiress of the Scarlet Sands", effects: [] },
    { level: 2, id: "candace-c2", name: "Moon-Piercing Brilliance", effects: [] },
    { level: 3, id: "candace-c3", name: "Hunter's Supplication", effects: [], buffs: [{ id: "candace-c3", source: "Hunter's Supplication", sourceCharacterId: "candace", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "candace-c4", name: "Sentinel Oath", effects: [] },
    { level: 5, id: "candace-c5", name: "Heterochromatic Gaze", effects: [], buffs: [{ id: "candace-c5", source: "Heterochromatic Gaze", sourceCharacterId: "candace", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "candace-c6", name: "The Overflow", effects: [] },
  ],
  resources: [],
};

export const columbina: GeneratedCharacter = {
  id: "columbina",
  name: "Columbina",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1144, 2: 1239, 3: 1334, 4: 1430, 5: 1525, 6: 1621, 7: 1716, 8: 1812, 9: 1908, 10: 2003, 11: 2099, 12: 2195, 13: 2291, 14: 2389, 15: 2485, 16: 2581, 17: 2678, 18: 2774, 19: 2871, 20: 2967, 21: 4046, 22: 4143, 23: 4240, 24: 4337, 25: 4435, 26: 4533, 27: 4630, 28: 4727, 29: 4826, 30: 4923, 31: 5021, 32: 5120, 33: 5218, 34: 5315, 35: 5414, 36: 5513, 37: 5612, 38: 5710, 39: 5808, 40: 5908, 41: 6703, 42: 6803, 43: 6902, 44: 7001, 45: 7100, 46: 7200, 47: 7299, 48: 7399, 49: 7500, 50: 7599, 51: 8628, 52: 8728, 53: 8828, 54: 8929, 55: 9029, 56: 9130, 57: 9231, 58: 9331, 59: 9432, 60: 9533, 61: 10330, 62: 10431, 63: 10533, 64: 10633, 65: 10735, 66: 10837, 67: 10938, 68: 11040, 69: 11141, 70: 11243, 71: 12042, 72: 12145, 73: 12247, 74: 12349, 75: 12451, 76: 12553, 77: 12656, 78: 12759, 79: 12862, 80: 12965, 81: 13765, 82: 13868, 83: 13971, 84: 14074, 85: 14177, 86: 14281, 87: 14384, 88: 14488, 89: 14592, 90: 14695 } },
    atk: { byLevel: { 1: 7, 2: 8, 3: 9, 4: 9, 5: 10, 6: 11, 7: 11, 8: 12, 9: 12, 10: 13, 11: 14, 12: 14, 13: 15, 14: 16, 15: 16, 16: 17, 17: 17, 18: 18, 19: 19, 20: 19, 21: 26, 22: 27, 23: 28, 24: 28, 25: 29, 26: 30, 27: 30, 28: 31, 29: 31, 30: 32, 31: 33, 32: 33, 33: 34, 34: 35, 35: 35, 36: 36, 37: 37, 38: 37, 39: 38, 40: 38, 41: 44, 42: 44, 43: 45, 44: 46, 45: 46, 46: 47, 47: 48, 48: 48, 49: 49, 50: 49, 51: 56, 52: 57, 53: 57, 54: 58, 55: 59, 56: 59, 57: 60, 58: 61, 59: 61, 60: 62, 61: 67, 62: 68, 63: 69, 64: 69, 65: 70, 66: 71, 67: 71, 68: 72, 69: 73, 70: 73, 71: 78, 72: 79, 73: 80, 74: 80, 75: 81, 76: 82, 77: 82, 78: 83, 79: 84, 80: 84, 81: 90, 82: 90, 83: 91, 84: 92, 85: 92, 86: 93, 87: 94, 88: 94, 89: 95, 90: 96 } },
    def: { byLevel: { 1: 40, 2: 43, 3: 47, 4: 50, 5: 53, 6: 57, 7: 60, 8: 63, 9: 67, 10: 70, 11: 74, 12: 77, 13: 80, 14: 84, 15: 87, 16: 90, 17: 94, 18: 97, 19: 101, 20: 104, 21: 142, 22: 145, 23: 149, 24: 152, 25: 155, 26: 159, 27: 162, 28: 166, 29: 169, 30: 173, 31: 176, 32: 179, 33: 183, 34: 186, 35: 190, 36: 193, 37: 197, 38: 200, 39: 204, 40: 207, 41: 235, 42: 238, 43: 242, 44: 245, 45: 249, 46: 252, 47: 256, 48: 259, 49: 263, 50: 266, 51: 302, 52: 306, 53: 309, 54: 313, 55: 316, 56: 320, 57: 323, 58: 327, 59: 331, 60: 334, 61: 362, 62: 366, 63: 369, 64: 373, 65: 376, 66: 380, 67: 383, 68: 387, 69: 390, 70: 394, 71: 422, 72: 426, 73: 429, 74: 433, 75: 436, 76: 440, 77: 443, 78: 447, 79: 451, 80: 454, 81: 482, 82: 486, 83: 490, 84: 493, 85: 497, 86: 500, 87: 504, 88: 508, 89: 511, 90: 515 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 96,
    hp: 14695,
    def: 515,
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
        id: "columbina-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "columbina-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.46792, 0.503014, 0.538108, 0.5849, 0.619994, 0.655088, 0.70188, 0.748672, 0.795464, 0.842256, 0.889048, 0.93584, 0.99433, 1.05282, 1.11131]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "columbina-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "columbina-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.366256, 0.393725, 0.421194, 0.45782, 0.485289, 0.512758, 0.549384, 0.58601, 0.622635, 0.659261, 0.695886, 0.732512, 0.778294, 0.824076, 0.869858]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "columbina-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "columbina-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.58484, 0.628703, 0.672566, 0.73105, 0.774913, 0.818776, 0.87726, 0.935744, 0.994228, 1.052712, 1.111196, 1.16968, 1.242785, 1.31589, 1.388995]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "columbina-charged",
      name: "Moondew Cascade",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "columbina-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.1608, 1.24786, 1.33492, 1.451, 1.53806, 1.62512, 1.7412, 1.85728, 1.97336, 2.08944, 2.20552, 2.3216, 2.4667, 2.6118, 2.7569]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "columbina-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "columbina-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "columbina-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "columbina-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "columbina-skill",
      name: "Eternal Tides",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(17),
      energyCost: 0,
      particles: { count: 3, element: "hydro" },
      instances: [
        {
          id: "columbina-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.1672, 0.17974, 0.19228, 0.209, 0.22154, 0.23408, 0.2508, 0.26752, 0.28424, 0.30096, 0.31768, 0.3344, 0.3553, 0.3762, 0.3971]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-2",
          name: "Gravity Ripple: Continuous DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.0936, 0.10062, 0.10764, 0.117, 0.12402, 0.13104, 0.1404, 0.14976, 0.15912, 0.16848, 0.17784, 0.1872, 0.1989, 0.2106, 0.2223]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-3",
          name: "Gravity Interference: Lunar-Charged DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.04704, 0.050568, 0.054096, 0.0588, 0.062328, 0.065856, 0.07056, 0.075264, 0.079968, 0.084672, 0.089376, 0.09408, 0.09996, 0.10584, 0.11172]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-4-1",
          name: "Gravity Interference: Lunar-Bloom DMG (1/5)",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.01408, 0.015136, 0.016192, 0.0176, 0.018656, 0.019712, 0.02112, 0.022528, 0.023936, 0.025344, 0.026752, 0.02816, 0.02992, 0.03168, 0.03344]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-4-2",
          name: "Gravity Interference: Lunar-Bloom DMG (2/5)",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.01408, 0.015136, 0.016192, 0.0176, 0.018656, 0.019712, 0.02112, 0.022528, 0.023936, 0.025344, 0.026752, 0.02816, 0.02992, 0.03168, 0.03344]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-4-3",
          name: "Gravity Interference: Lunar-Bloom DMG (3/5)",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.01408, 0.015136, 0.016192, 0.0176, 0.018656, 0.019712, 0.02112, 0.022528, 0.023936, 0.025344, 0.026752, 0.02816, 0.02992, 0.03168, 0.03344]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-4-4",
          name: "Gravity Interference: Lunar-Bloom DMG (4/5)",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.01408, 0.015136, 0.016192, 0.0176, 0.018656, 0.019712, 0.02112, 0.022528, 0.023936, 0.025344, 0.026752, 0.02816, 0.02992, 0.03168, 0.03344]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-4-5",
          name: "Gravity Interference: Lunar-Bloom DMG (5/5)",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.01408, 0.015136, 0.016192, 0.0176, 0.018656, 0.019712, 0.02112, 0.022528, 0.023936, 0.025344, 0.026752, 0.02816, 0.02992, 0.03168, 0.03344]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "columbina-skill-5",
          name: "Gravity Interference: Lunar-Crystallize DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.08824, 0.094858, 0.101476, 0.1103, 0.116918, 0.123536, 0.13236, 0.141184, 0.150008, 0.158832, 0.167656, 0.17648, 0.18751, 0.19854, 0.20957]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "columbina-burst",
      name: "Moonlit Melancholy",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "columbina-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.3224, 0.34658, 0.37076, 0.403, 0.42718, 0.45136, 0.4836, 0.51584, 0.54808, 0.58032, 0.61256, 0.6448, 0.6851, 0.7254, 0.7657]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "columbina-a1", name: "Lunacy's Lure", unlockAscension: 1, effects: [] },
    { id: "columbina-a4", name: "Law of the New Moon", unlockAscension: 4, effects: [] },
    { id: "columbina-p3", name: "Moonsign Benediction: Moonlight, Lent Unto You", effects: [] },
    { id: "columbina-p4", name: "Lunar Vigil", effects: [] },
  ],
  constellations: [
    { level: 1, id: "columbina-c1", name: "Radiance Over Blossoms and Peaks", effects: [] },
    { level: 2, id: "columbina-c2", name: "Not in Lone Splendor", effects: [] },
    { level: 3, id: "columbina-c3", name: "Dreamlike Glow Across Tranquil Waters", effects: [], buffs: [{ id: "columbina-c3", source: "Dreamlike Glow Across Tranquil Waters", sourceCharacterId: "columbina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "columbina-c4", name: "Cloudveiled Ridges in Floral Mists", effects: [] },
    { level: 5, id: "columbina-c5", name: "Silence Tending One Lone Song", effects: [], buffs: [{ id: "columbina-c5", source: "Silence Tending One Lone Song", sourceCharacterId: "columbina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "columbina-c6", name: "Through Darkness Led by Moonlight", effects: [] },
  ],
  resources: [],
};

export const dahlia: GeneratedCharacter = {
  id: "dahlia",
  name: "Dahlia",
  element: "hydro",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1049, 2: 1136, 3: 1222, 4: 1309, 5: 1395, 6: 1482, 7: 1568, 8: 1655, 9: 1742, 10: 1828, 11: 1915, 12: 2001, 13: 2088, 14: 2174, 15: 2261, 16: 2348, 17: 2434, 18: 2521, 19: 2607, 20: 2694, 21: 3563, 22: 3650, 23: 3737, 24: 3823, 25: 3910, 26: 3996, 27: 4083, 28: 4169, 29: 4256, 30: 4342, 31: 4429, 32: 4516, 33: 4602, 34: 4689, 35: 4775, 36: 4862, 37: 4948, 38: 5035, 39: 5122, 40: 5208, 41: 5852, 42: 5938, 43: 6025, 44: 6111, 45: 6198, 46: 6285, 47: 6371, 48: 6458, 49: 6544, 50: 6631, 51: 7459, 52: 7546, 53: 7633, 54: 7719, 55: 7806, 56: 7892, 57: 7979, 58: 8065, 59: 8152, 60: 8239, 61: 8882, 62: 8969, 63: 9055, 64: 9142, 65: 9228, 66: 9315, 67: 9402, 68: 9488, 69: 9575, 70: 9661, 71: 10304, 72: 10390, 73: 10477, 74: 10564, 75: 10650, 76: 10737, 77: 10823, 78: 10910, 79: 10996, 80: 11083, 81: 11727, 82: 11813, 83: 11900, 84: 11986, 85: 12073, 86: 12159, 87: 12246, 88: 12332, 89: 12419, 90: 12506 } },
    atk: { byLevel: { 1: 16, 2: 17, 3: 18, 4: 20, 5: 21, 6: 22, 7: 24, 8: 25, 9: 26, 10: 28, 11: 29, 12: 30, 13: 32, 14: 33, 15: 34, 16: 35, 17: 37, 18: 38, 19: 39, 20: 41, 21: 54, 22: 55, 23: 56, 24: 58, 25: 59, 26: 60, 27: 62, 28: 63, 29: 64, 30: 66, 31: 67, 32: 68, 33: 70, 34: 71, 35: 72, 36: 73, 37: 75, 38: 76, 39: 77, 40: 79, 41: 88, 42: 90, 43: 91, 44: 92, 45: 94, 46: 95, 47: 96, 48: 98, 49: 99, 50: 100, 51: 113, 52: 114, 53: 115, 54: 117, 55: 118, 56: 119, 57: 121, 58: 122, 59: 123, 60: 125, 61: 134, 62: 136, 63: 137, 64: 138, 65: 139, 66: 141, 67: 142, 68: 143, 69: 145, 70: 146, 71: 156, 72: 157, 73: 158, 74: 160, 75: 161, 76: 162, 77: 164, 78: 165, 79: 166, 80: 168, 81: 177, 82: 179, 83: 180, 84: 181, 85: 182, 86: 184, 87: 185, 88: 186, 89: 188, 90: 189 } },
    def: { byLevel: { 1: 47, 2: 51, 3: 55, 4: 59, 5: 62, 6: 66, 7: 70, 8: 74, 9: 78, 10: 82, 11: 86, 12: 90, 13: 93, 14: 97, 15: 101, 16: 105, 17: 109, 18: 113, 19: 117, 20: 121, 21: 159, 22: 163, 23: 167, 24: 171, 25: 175, 26: 179, 27: 183, 28: 187, 29: 190, 30: 194, 31: 198, 32: 202, 33: 206, 34: 210, 35: 214, 36: 218, 37: 221, 38: 225, 39: 229, 40: 233, 41: 262, 42: 266, 43: 270, 44: 273, 45: 277, 46: 281, 47: 285, 48: 289, 49: 293, 50: 297, 51: 334, 52: 338, 53: 342, 54: 345, 55: 349, 56: 353, 57: 357, 58: 361, 59: 365, 60: 369, 61: 397, 62: 401, 63: 405, 64: 409, 65: 413, 66: 417, 67: 421, 68: 425, 69: 428, 70: 432, 71: 461, 72: 465, 73: 469, 74: 473, 75: 477, 76: 481, 77: 484, 78: 488, 79: 492, 80: 496, 81: 525, 82: 529, 83: 533, 84: 536, 85: 540, 86: 544, 87: 548, 88: 552, 89: 556, 90: 560 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 189,
    hp: 12506,
    def: 560,
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
        id: "dahlia-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dahlia-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.43547, 0.470915, 0.50636, 0.556996, 0.592441, 0.63295, 0.68865, 0.744349, 0.800049, 0.860812, 0.921575, 0.982338, 1.043102, 1.103865, 1.164628]) },
            ],
          },
        ],
      },
      {
        id: "dahlia-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dahlia-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.401001, 0.43364, 0.46628, 0.512908, 0.545548, 0.58285, 0.634141, 0.685432, 0.736722, 0.792676, 0.84863, 0.904583, 0.960537, 1.01649, 1.072444]) },
            ],
          },
        ],
      },
      {
        id: "dahlia-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dahlia-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.237446, 0.256773, 0.2761, 0.30371, 0.323037, 0.345125, 0.375496, 0.405867, 0.436238, 0.46937, 0.502502, 0.535634, 0.568766, 0.601898, 0.63503]) },
              { stat: "atk", table: talentTable([0.290164, 0.313782, 0.3374, 0.37114, 0.394758, 0.42175, 0.458864, 0.495978, 0.533092, 0.57358, 0.614068, 0.654556, 0.695044, 0.735532, 0.77602]) },
            ],
          },
        ],
      },
      {
        id: "dahlia-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "dahlia-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.656576, 0.710018, 0.76346, 0.839806, 0.893248, 0.954325, 1.038306, 1.122286, 1.206267, 1.297882, 1.389497, 1.481112, 1.572728, 1.664343, 1.755958]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "dahlia-charged",
      name: "Favonius Bladework - Ritual",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dahlia-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.398765, 0.431222, 0.46368, 0.510048, 0.542506, 0.5796, 0.630605, 0.68161, 0.732614, 0.788256, 0.843898, 0.899539, 0.955181, 1.010822, 1.066464]) },
            { stat: "atk", table: talentTable([0.550675, 0.595498, 0.64032, 0.704352, 0.749174, 0.8004, 0.870835, 0.94127, 1.011706, 1.088544, 1.165382, 1.242221, 1.319059, 1.395898, 1.472736]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "dahlia-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dahlia-plungeLow-1",
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
      id: "dahlia-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "dahlia-plungeHigh-1",
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
      id: "dahlia-skill",
      name: "Immersive Ordinance",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(9),
      energyCost: 0,
      particles: { count: 3, element: "hydro" },
      instances: [
        {
          id: "dahlia-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([2.328, 2.5026, 2.6772, 2.91, 3.0846, 3.2592, 3.492, 3.7248, 3.9576, 4.1904, 4.4232, 4.656, 4.947, 5.238, 5.529]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "dahlia-burst",
      name: "Radiant Psalter",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "dahlia-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([4.064, 4.3688, 4.6736, 5.08, 5.3848, 5.6896, 6.096, 6.5024, 6.9088, 7.3152, 7.7216, 8.128, 8.636, 9.144, 9.652]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "dahlia-a1", name: "The Wind's Gentle Grace", unlockAscension: 1, effects: [] },
    { id: "dahlia-a4", name: "Prayer of Well-Wrought Joy", unlockAscension: 4, effects: [] },
    { id: "dahlia-p3", name: "Pilgrimage Upon Returning Winds", effects: [] },
  ],
  constellations: [
    { level: 1, id: "dahlia-c1", name: "Infallible Procession", effects: [] },
    { level: 2, id: "dahlia-c2", name: "Revelation of Mercy", effects: [] },
    { level: 3, id: "dahlia-c3", name: "Windblume Offertory", effects: [], buffs: [{ id: "dahlia-c3", source: "Windblume Offertory", sourceCharacterId: "dahlia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "dahlia-c4", name: "Collect of the Assembly", effects: [] },
    { level: 5, id: "dahlia-c5", name: "Let It Be Subtly So", effects: [], buffs: [{ id: "dahlia-c5", source: "Let It Be Subtly So", sourceCharacterId: "dahlia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "dahlia-c6", name: "You Shall Go Out With Joy", effects: [] },
  ],
  resources: [],
};

export const furina: GeneratedCharacter = {
  id: "furina",
  name: "Furina",
  element: "hydro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1192, 2: 1291, 3: 1389, 4: 1490, 5: 1588, 6: 1689, 7: 1787, 8: 1888, 9: 1988, 10: 2087, 11: 2187, 12: 2287, 13: 2387, 14: 2488, 15: 2588, 16: 2688, 17: 2790, 18: 2890, 19: 2991, 20: 3091, 21: 4214, 22: 4315, 23: 4417, 24: 4518, 25: 4619, 26: 4722, 27: 4823, 28: 4924, 29: 5027, 30: 5128, 31: 5231, 32: 5333, 33: 5436, 34: 5537, 35: 5639, 36: 5743, 37: 5846, 38: 5948, 39: 6050, 40: 6154, 41: 6983, 42: 7086, 43: 7190, 44: 7292, 45: 7396, 46: 7500, 47: 7603, 48: 7707, 49: 7812, 50: 7916, 51: 8987, 52: 9092, 53: 9196, 54: 9301, 55: 9406, 56: 9510, 57: 9615, 58: 9720, 59: 9825, 60: 9930, 61: 10761, 62: 10866, 63: 10972, 64: 11077, 65: 11183, 66: 11289, 67: 11394, 68: 11500, 69: 11606, 70: 11712, 71: 12544, 72: 12651, 73: 12757, 74: 12863, 75: 12970, 76: 13076, 77: 13184, 78: 13291, 79: 13398, 80: 13505, 81: 14339, 82: 14446, 83: 14553, 84: 14660, 85: 14768, 86: 14876, 87: 14983, 88: 15092, 89: 15200, 90: 15307 } },
    atk: { byLevel: { 1: 19, 2: 21, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 32, 10: 33, 11: 35, 12: 36, 13: 38, 14: 40, 15: 41, 16: 43, 17: 44, 18: 46, 19: 48, 20: 49, 21: 67, 22: 69, 23: 70, 24: 72, 25: 74, 26: 75, 27: 77, 28: 78, 29: 80, 30: 82, 31: 83, 32: 85, 33: 87, 34: 88, 35: 90, 36: 92, 37: 93, 38: 95, 39: 96, 40: 98, 41: 111, 42: 113, 43: 115, 44: 116, 45: 118, 46: 120, 47: 121, 48: 123, 49: 125, 50: 126, 51: 143, 52: 145, 53: 147, 54: 148, 55: 150, 56: 152, 57: 153, 58: 155, 59: 157, 60: 158, 61: 171, 62: 173, 63: 175, 64: 177, 65: 178, 66: 180, 67: 182, 68: 183, 69: 185, 70: 187, 71: 200, 72: 202, 73: 203, 74: 205, 75: 207, 76: 208, 77: 210, 78: 212, 79: 214, 80: 215, 81: 229, 82: 230, 83: 232, 84: 234, 85: 235, 86: 237, 87: 239, 88: 241, 89: 242, 90: 244 } },
    def: { byLevel: { 1: 54, 2: 59, 3: 63, 4: 68, 5: 72, 6: 77, 7: 81, 8: 86, 9: 90, 10: 95, 11: 99, 12: 104, 13: 108, 14: 113, 15: 118, 16: 122, 17: 127, 18: 131, 19: 136, 20: 140, 21: 191, 22: 196, 23: 201, 24: 205, 25: 210, 26: 215, 27: 219, 28: 224, 29: 228, 30: 233, 31: 238, 32: 242, 33: 247, 34: 252, 35: 256, 36: 261, 37: 266, 38: 270, 39: 275, 40: 280, 41: 317, 42: 322, 43: 327, 44: 331, 45: 336, 46: 341, 47: 345, 48: 350, 49: 355, 50: 360, 51: 408, 52: 413, 53: 418, 54: 423, 55: 427, 56: 432, 57: 437, 58: 442, 59: 446, 60: 451, 61: 489, 62: 494, 63: 499, 64: 503, 65: 508, 66: 513, 67: 518, 68: 523, 69: 527, 70: 532, 71: 570, 72: 575, 73: 580, 74: 584, 75: 589, 76: 594, 77: 599, 78: 604, 79: 609, 80: 614, 81: 652, 82: 656, 83: 661, 84: 666, 85: 671, 86: 676, 87: 681, 88: 686, 89: 691, 90: 696 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 244,
    hp: 15307,
    def: 696,
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
        id: "furina-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "furina-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.483862, 0.523246, 0.56263, 0.618893, 0.658277, 0.703287, 0.765177, 0.827066, 0.888955, 0.956471, 1.023987, 1.091502, 1.159018, 1.226533, 1.294049]) },
            ],
          },
        ],
      },
      {
        id: "furina-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "furina-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.437293, 0.472886, 0.50848, 0.559328, 0.594922, 0.6356, 0.691533, 0.747466, 0.803398, 0.864416, 0.925434, 0.986451, 1.047469, 1.108486, 1.169504]) },
            ],
          },
        ],
      },
      {
        id: "furina-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "furina-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.5512, 0.596065, 0.64093, 0.705023, 0.749888, 0.801162, 0.871665, 0.942167, 1.012669, 1.089581, 1.166493, 1.243404, 1.320316, 1.397227, 1.474139]) },
            ],
          },
        ],
      },
      {
        id: "furina-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "furina-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.732978, 0.792639, 0.8523, 0.93753, 0.997191, 1.065375, 1.159128, 1.252881, 1.346634, 1.44891, 1.551186, 1.653462, 1.755738, 1.858014, 1.96029]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "furina-charged",
      name: "Soloist's Solicitation",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "furina-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.74218, 0.80259, 0.863, 0.9493, 1.00971, 1.07875, 1.17368, 1.26861, 1.36354, 1.4671, 1.57066, 1.67422, 1.77778, 1.88134, 1.9849]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "furina-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "furina-plungeLow-1",
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
      id: "furina-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "furina-plungeHigh-1",
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
      id: "furina-skill",
      name: "Salon Solitaire",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      particles: { count: 1, element: "hydro" },
      instances: [
        {
          id: "furina-skill-1",
          name: "Ousia Bubble DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.07864, 0.084538, 0.090436, 0.0983, 0.104198, 0.110096, 0.11796, 0.125824, 0.133688, 0.141552, 0.149416, 0.15728, 0.16711, 0.17694, 0.18677]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "furina-skill-2",
          name: "Gentilhomme Usher DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.0596, 0.06407, 0.06854, 0.0745, 0.07897, 0.08344, 0.0894, 0.09536, 0.10132, 0.10728, 0.11324, 0.1192, 0.12665, 0.1341, 0.14155]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "furina-skill-3",
          name: "Surintendante Chevalmarin DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.03232, 0.034744, 0.037168, 0.0404, 0.042824, 0.045248, 0.04848, 0.051712, 0.054944, 0.058176, 0.061408, 0.06464, 0.06868, 0.07272, 0.07676]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "furina-skill-4",
          name: "Mademoiselle Crabaletta DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.08288, 0.089096, 0.095312, 0.1036, 0.109816, 0.116032, 0.12432, 0.132608, 0.140896, 0.149184, 0.157472, 0.16576, 0.17612, 0.18648, 0.19684]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "furina-burst",
      name: "Let the People Rejoice",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "furina-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.114064, 0.122619, 0.131174, 0.14258, 0.151135, 0.15969, 0.171096, 0.182502, 0.193909, 0.205315, 0.216722, 0.228128, 0.242386, 0.256644, 0.270902]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "furina-a1", name: "Endless Waltz", unlockAscension: 1, effects: [] },
    { id: "furina-a4", name: "Unheard Confession", unlockAscension: 4, effects: [] },
    { id: "furina-p3", name: "The Sea Is My Stage", effects: [] },
  ],
  constellations: [
    { level: 1, id: "furina-c1", name: "\"Love Is a Rebellious Bird That None Can Tame\"", effects: [] },
    { level: 2, id: "furina-c2", name: "\"A Woman Adapts Like Duckweed in Water\"", effects: [] },
    { level: 3, id: "furina-c3", name: "\"My Secret Is Hidden Within Me, No One Will Know My Name\"", effects: [], buffs: [{ id: "furina-c3", source: "\"My Secret Is Hidden Within Me, No One Will Know My Name\"", sourceCharacterId: "furina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "furina-c4", name: "\"They Know Not Life, Who Dwelt in the Netherworld Not!\"", effects: [] },
    { level: 5, id: "furina-c5", name: "\"His Name I Now Know, It Is...!\"", effects: [], buffs: [{ id: "furina-c5", source: "\"His Name I Now Know, It Is...!\"", sourceCharacterId: "furina", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "furina-c6", name: "\"Hear Me — Let Us Raise the Chalice of Love!\"", effects: [] },
  ],
  resources: [],
};

export const kamisatoAyato: GeneratedCharacter = {
  id: "kamisato-ayato",
  name: "Kamisato Ayato",
  element: "hydro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1068, 2: 1156, 3: 1245, 4: 1335, 5: 1423, 6: 1513, 7: 1602, 8: 1691, 9: 1781, 10: 1870, 11: 1959, 12: 2049, 13: 2139, 14: 2229, 15: 2319, 16: 2409, 17: 2500, 18: 2589, 19: 2680, 20: 2770, 21: 3776, 22: 3867, 23: 3957, 24: 4048, 25: 4139, 26: 4231, 27: 4321, 28: 4412, 29: 4504, 30: 4595, 31: 4687, 32: 4778, 33: 4870, 34: 4961, 35: 5053, 36: 5146, 37: 5238, 38: 5329, 39: 5421, 40: 5514, 41: 6256, 42: 6349, 43: 6442, 44: 6534, 45: 6627, 46: 6720, 47: 6813, 48: 6906, 49: 7000, 50: 7092, 51: 8053, 52: 8147, 53: 8239, 54: 8333, 55: 8427, 56: 8521, 57: 8615, 58: 8709, 59: 8803, 60: 8897, 61: 9642, 62: 9736, 63: 9831, 64: 9925, 65: 10020, 66: 10115, 67: 10209, 68: 10304, 69: 10399, 70: 10494, 71: 11239, 72: 11335, 73: 11430, 74: 11525, 75: 11621, 76: 11716, 77: 11813, 78: 11909, 79: 12005, 80: 12101, 81: 12847, 82: 12943, 83: 13040, 84: 13136, 85: 13232, 86: 13329, 87: 13425, 88: 13522, 89: 13619, 90: 13715 } },
    atk: { byLevel: { 1: 23, 2: 25, 3: 27, 4: 29, 5: 31, 6: 33, 7: 35, 8: 37, 9: 39, 10: 41, 11: 43, 12: 45, 13: 47, 14: 49, 15: 51, 16: 53, 17: 54, 18: 56, 19: 58, 20: 60, 21: 82, 22: 84, 23: 86, 24: 88, 25: 90, 26: 92, 27: 94, 28: 96, 29: 98, 30: 100, 31: 102, 32: 104, 33: 106, 34: 108, 35: 110, 36: 112, 37: 114, 38: 116, 39: 118, 40: 120, 41: 136, 42: 138, 43: 140, 44: 142, 45: 144, 46: 146, 47: 149, 48: 151, 49: 153, 50: 155, 51: 176, 52: 178, 53: 180, 54: 182, 55: 184, 56: 186, 57: 188, 58: 190, 59: 192, 60: 194, 61: 210, 62: 212, 63: 214, 64: 216, 65: 218, 66: 220, 67: 223, 68: 225, 69: 227, 70: 229, 71: 245, 72: 247, 73: 249, 74: 251, 75: 253, 76: 255, 77: 257, 78: 260, 79: 262, 80: 264, 81: 280, 82: 282, 83: 284, 84: 286, 85: 288, 86: 291, 87: 293, 88: 295, 89: 297, 90: 299 } },
    def: { byLevel: { 1: 60, 2: 65, 3: 70, 4: 75, 5: 80, 6: 85, 7: 90, 8: 95, 9: 100, 10: 105, 11: 110, 12: 115, 13: 120, 14: 125, 15: 130, 16: 135, 17: 140, 18: 145, 19: 150, 20: 155, 21: 212, 22: 217, 23: 222, 24: 227, 25: 232, 26: 237, 27: 242, 28: 247, 29: 252, 30: 257, 31: 263, 32: 268, 33: 273, 34: 278, 35: 283, 36: 288, 37: 293, 38: 299, 39: 304, 40: 309, 41: 351, 42: 356, 43: 361, 44: 366, 45: 371, 46: 377, 47: 382, 48: 387, 49: 392, 50: 397, 51: 451, 52: 457, 53: 462, 54: 467, 55: 472, 56: 478, 57: 483, 58: 488, 59: 493, 60: 499, 61: 540, 62: 546, 63: 551, 64: 556, 65: 561, 66: 567, 67: 572, 68: 577, 69: 583, 70: 588, 71: 630, 72: 635, 73: 641, 74: 646, 75: 651, 76: 657, 77: 662, 78: 667, 79: 673, 80: 678, 81: 720, 82: 725, 83: 731, 84: 736, 85: 741, 86: 747, 87: 752, 88: 758, 89: 763, 90: 769 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 299,
    hp: 13715,
    def: 769,
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
        id: "kamisato-ayato-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayato-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.449617, 0.486213, 0.52281, 0.575091, 0.611688, 0.653512, 0.711022, 0.768531, 0.82604, 0.888777, 0.951514, 1.014251, 1.076989, 1.139726, 1.202463]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayato-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayato-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.471572, 0.509956, 0.54834, 0.603174, 0.641558, 0.685425, 0.745742, 0.80606, 0.866377, 0.932178, 0.997979, 1.06378, 1.12958, 1.195381, 1.261182]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayato-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayato-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.586124, 0.633832, 0.68154, 0.749694, 0.797402, 0.851925, 0.926894, 1.001864, 1.076833, 1.158618, 1.240403, 1.322188, 1.403972, 1.485757, 1.567542]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayato-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayato-na-4-1-1",
            name: "4-Hit DMG (1/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.294485, 0.318455, 0.342425, 0.376667, 0.400637, 0.428031, 0.465698, 0.503365, 0.541031, 0.582122, 0.623213, 0.664304, 0.705395, 0.746487, 0.787577]) },
            ],
          },
          {
            id: "kamisato-ayato-na-4-1-2",
            name: "4-Hit DMG (2/2)",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.294485, 0.318455, 0.342425, 0.376667, 0.400637, 0.428031, 0.465698, 0.503365, 0.541031, 0.582122, 0.623213, 0.664304, 0.705395, 0.746487, 0.787577]) },
            ],
          },
        ],
      },
      {
        id: "kamisato-ayato-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "kamisato-ayato-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.756043, 0.817582, 0.87912, 0.967032, 1.02857, 1.0989, 1.195603, 1.292306, 1.38901, 1.494504, 1.599998, 1.705493, 1.810987, 1.916482, 2.021976]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "kamisato-ayato-charged",
      name: "Kamisato Art: Marobashi",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayato-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([1.295297, 1.400728, 1.506159, 1.656775, 1.762206, 1.882699, 2.048376, 2.214054, 2.379731, 2.56047, 2.741209, 2.921948, 3.102688, 3.283427, 3.464166]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "kamisato-ayato-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayato-plungeLow-1",
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
      id: "kamisato-ayato-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "kamisato-ayato-plungeHigh-1",
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
      id: "kamisato-ayato-skill",
      name: "Kamisato Art: Kyouka",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 2, element: "hydro" },
      instances: [
        {
          id: "kamisato-ayato-skill-1",
          name: "Shunsuiken 1-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.5289, 0.57195, 0.615, 0.6765, 0.71955, 0.76875, 0.8364, 0.90405, 0.9717, 1.0455, 1.1193, 1.1931, 1.2669, 1.3407, 1.4145]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "kamisato-ayato-skill-2",
          name: "Shunsuiken 2-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.5891, 0.63705, 0.685, 0.7535, 0.80145, 0.85625, 0.9316, 1.00695, 1.0823, 1.1645, 1.2467, 1.3289, 1.4111, 1.4933, 1.5755]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "kamisato-ayato-skill-3",
          name: "Shunsuiken 3-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.6493, 0.70215, 0.755, 0.8305, 0.88335, 0.94375, 1.0268, 1.10985, 1.1929, 1.2835, 1.3741, 1.4647, 1.5553, 1.6459, 1.7365]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "kamisato-ayato-skill-4",
          name: "Water Illusion DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.0148, 1.0974, 1.18, 1.298, 1.3806, 1.475, 1.6048, 1.7346, 1.8644, 2.006, 2.1476, 2.2892, 2.4308, 2.5724, 2.714]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "kamisato-ayato-burst",
      name: "Kamisato Art: Suiyuu",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "kamisato-ayato-burst-1",
          name: "Bloomwater Blade DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.66456, 0.714402, 0.764244, 0.8307, 0.880542, 0.930384, 0.99684, 1.063296, 1.129752, 1.196208, 1.262664, 1.32912, 1.41219, 1.49526, 1.57833]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "kamisato-ayato-a1", name: "Kamisato Art: Mine Wo Matoishi Kiyotaki", unlockAscension: 1, effects: [] },
    { id: "kamisato-ayato-a4", name: "Kamisato Art: Michiyuku Hagetsu", unlockAscension: 4, effects: [] },
    { id: "kamisato-ayato-p3", name: "Kamisato Art: Daily Cooking", effects: [] },
  ],
  constellations: [
    { level: 1, id: "kamisato-ayato-c1", name: "Kyouka Fuushi", effects: [] },
    { level: 2, id: "kamisato-ayato-c2", name: "World Source", effects: [] },
    { level: 3, id: "kamisato-ayato-c3", name: "To Admire the Flowers", effects: [], buffs: [{ id: "kamisato-ayato-c3", source: "To Admire the Flowers", sourceCharacterId: "kamisato-ayato", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "kamisato-ayato-c4", name: "Endless Flow", effects: [] },
    { level: 5, id: "kamisato-ayato-c5", name: "Bansui Ichiro", effects: [], buffs: [{ id: "kamisato-ayato-c5", source: "Bansui Ichiro", sourceCharacterId: "kamisato-ayato", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "kamisato-ayato-c6", name: "Boundless Origin", effects: [] },
  ],
  resources: [],
};

export const mona: GeneratedCharacter = {
  id: "mona",
  name: "Mona",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 810, 2: 878, 3: 945, 4: 1013, 5: 1080, 6: 1148, 7: 1215, 8: 1284, 9: 1352, 10: 1419, 11: 1487, 12: 1555, 13: 1623, 14: 1692, 15: 1760, 16: 1828, 17: 1897, 18: 1965, 19: 2034, 20: 2102, 21: 2866, 22: 2935, 23: 3003, 24: 3072, 25: 3141, 26: 3211, 27: 3280, 28: 3349, 29: 3418, 30: 3487, 31: 3557, 32: 3627, 33: 3696, 34: 3765, 35: 3835, 36: 3905, 37: 3975, 38: 4045, 39: 4114, 40: 4185, 41: 4748, 42: 4819, 43: 4889, 44: 4959, 45: 5029, 46: 5100, 47: 5170, 48: 5241, 49: 5312, 50: 5383, 51: 6111, 52: 6183, 53: 6253, 54: 6324, 55: 6396, 56: 6467, 57: 6538, 58: 6610, 59: 6681, 60: 6752, 61: 7317, 62: 7389, 63: 7461, 64: 7532, 65: 7604, 66: 7676, 67: 7748, 68: 7820, 69: 7892, 70: 7964, 71: 8530, 72: 8603, 73: 8675, 74: 8747, 75: 8820, 76: 8892, 77: 8965, 78: 9038, 79: 9111, 80: 9184, 81: 9750, 82: 9823, 83: 9896, 84: 9969, 85: 10042, 86: 10116, 87: 10189, 88: 10262, 89: 10336, 90: 10409 } },
    atk: { byLevel: { 1: 22, 2: 24, 3: 26, 4: 28, 5: 30, 6: 32, 7: 34, 8: 35, 9: 37, 10: 39, 11: 41, 12: 43, 13: 45, 14: 47, 15: 49, 16: 50, 17: 52, 18: 54, 19: 56, 20: 58, 21: 79, 22: 81, 23: 83, 24: 85, 25: 87, 26: 89, 27: 90, 28: 92, 29: 94, 30: 96, 31: 98, 32: 100, 33: 102, 34: 104, 35: 106, 36: 108, 37: 110, 38: 112, 39: 113, 40: 115, 41: 131, 42: 133, 43: 135, 44: 137, 45: 139, 46: 141, 47: 143, 48: 145, 49: 146, 50: 148, 51: 169, 52: 170, 53: 172, 54: 174, 55: 176, 56: 178, 57: 180, 58: 182, 59: 184, 60: 186, 61: 202, 62: 204, 63: 206, 64: 208, 65: 210, 66: 212, 67: 214, 68: 216, 69: 218, 70: 220, 71: 235, 72: 237, 73: 239, 74: 241, 75: 243, 76: 245, 77: 247, 78: 249, 79: 251, 80: 253, 81: 269, 82: 271, 83: 273, 84: 275, 85: 277, 86: 279, 87: 281, 88: 283, 89: 285, 90: 287 } },
    def: { byLevel: { 1: 51, 2: 55, 3: 59, 4: 64, 5: 68, 6: 72, 7: 76, 8: 81, 9: 85, 10: 89, 11: 93, 12: 98, 13: 102, 14: 106, 15: 110, 16: 115, 17: 119, 18: 123, 19: 128, 20: 132, 21: 180, 22: 184, 23: 188, 24: 193, 25: 197, 26: 202, 27: 206, 28: 210, 29: 215, 30: 219, 31: 223, 32: 228, 33: 232, 34: 236, 35: 241, 36: 245, 37: 249, 38: 254, 39: 258, 40: 263, 41: 298, 42: 302, 43: 307, 44: 311, 45: 316, 46: 320, 47: 324, 48: 329, 49: 333, 50: 338, 51: 384, 52: 388, 53: 392, 54: 397, 55: 401, 56: 406, 57: 410, 58: 415, 59: 419, 60: 424, 61: 459, 62: 464, 63: 468, 64: 473, 65: 477, 66: 482, 67: 486, 68: 491, 69: 495, 70: 500, 71: 535, 72: 540, 73: 544, 74: 549, 75: 554, 76: 558, 77: 563, 78: 567, 79: 572, 80: 576, 81: 612, 82: 617, 83: 621, 84: 626, 85: 630, 86: 635, 87: 639, 88: 644, 89: 649, 90: 653 } },
  },
  ascensionBonus: {
    stat: "energyRecharge",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.32],
  },
  baseStats: {
    atk: 287,
    hp: 10409,
    def: 653,
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
        id: "mona-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mona-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.376, 0.4042, 0.4324, 0.47, 0.4982, 0.5264, 0.564, 0.6016, 0.6392, 0.6768, 0.7144, 0.752, 0.799, 0.846, 0.893]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "mona-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mona-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.36, 0.387, 0.414, 0.45, 0.477, 0.504, 0.54, 0.576, 0.612, 0.648, 0.684, 0.72, 0.765, 0.81, 0.855]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "mona-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mona-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.448, 0.4816, 0.5152, 0.56, 0.5936, 0.6272, 0.672, 0.7168, 0.7616, 0.8064, 0.8512, 0.896, 0.952, 1.008, 1.064]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "mona-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mona-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.5616, 0.60372, 0.64584, 0.702, 0.74412, 0.78624, 0.8424, 0.89856, 0.95472, 1.01088, 1.06704, 1.1232, 1.1934, 1.2636, 1.3338]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "mona-charged",
      name: "Ripple of Fate",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mona-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.4972, 1.60949, 1.72178, 1.8715, 1.98379, 2.09608, 2.2458, 2.39552, 2.54524, 2.69496, 2.850669, 3.054288, 3.257907, 3.461526, 3.665146]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "mona-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mona-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "mona-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mona-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "mona-skill",
      name: "Mirror Reflection of Doom",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 4, element: "hydro" },
      instances: [
        {
          id: "mona-skill-1",
          name: "DoT",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.32, 0.344, 0.368, 0.4, 0.424, 0.448, 0.48, 0.512, 0.544, 0.576, 0.608, 0.64, 0.68, 0.72, 0.76]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "mona-skill-2",
          name: "Explosion DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.328, 1.4276, 1.5272, 1.66, 1.7596, 1.8592, 1.992, 2.1248, 2.2576, 2.3904, 2.5232, 2.656, 2.822, 2.988, 3.154]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "mona-burst",
      name: "Stellaris Phantasm",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "mona-burst-1",
          name: "Illusory Bubble Explosion DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([4.424, 4.7558, 5.0876, 5.53, 5.8618, 6.1936, 6.636, 7.0784, 7.5208, 7.9632, 8.4056, 8.848, 9.401, 9.954, 10.507]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "mona-a1", name: "\"Come 'n' Get Me, Hag!\"", unlockAscension: 1, effects: [] },
    { id: "mona-a4", name: "Waterborne Destiny", unlockAscension: 4, effects: [] },
    { id: "mona-p3", name: "Principium of Astrology", effects: [] },
    { id: "mona-p4", name: "Witch's Eve Rite: Genesis of Starsigns", effects: [] },
  ],
  constellations: [
    { level: 1, id: "mona-c1", name: "Prophecy of Submersion", effects: [] },
    { level: 2, id: "mona-c2", name: "Lunar Chain", effects: [] },
    { level: 3, id: "mona-c3", name: "Restless Revolution", effects: [], buffs: [{ id: "mona-c3", source: "Restless Revolution", sourceCharacterId: "mona", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "mona-c4", name: "Prophecy of Oblivion", effects: [] },
    { level: 5, id: "mona-c5", name: "Mockery of Fortuna", effects: [], buffs: [{ id: "mona-c5", source: "Mockery of Fortuna", sourceCharacterId: "mona", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "mona-c6", name: "Rhetorics of Calamitas", effects: [] },
  ],
  resources: [],
};

export const mualani: GeneratedCharacter = {
  id: "mualani",
  name: "Mualani",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1182, 2: 1280, 3: 1378, 4: 1478, 5: 1576, 6: 1675, 7: 1773, 8: 1872, 9: 1972, 10: 2070, 11: 2169, 12: 2268, 13: 2368, 14: 2468, 15: 2568, 16: 2667, 17: 2767, 18: 2867, 19: 2967, 20: 3066, 21: 4180, 22: 4281, 23: 4381, 24: 4482, 25: 4582, 26: 4684, 27: 4785, 28: 4885, 29: 4987, 30: 5087, 31: 5189, 32: 5290, 33: 5392, 34: 5493, 35: 5594, 36: 5697, 37: 5799, 38: 5900, 39: 6002, 40: 6105, 41: 6927, 42: 7030, 43: 7132, 44: 7234, 45: 7337, 46: 7440, 47: 7543, 48: 7645, 49: 7750, 50: 7852, 51: 8915, 52: 9019, 53: 9122, 54: 9226, 55: 9330, 56: 9434, 57: 9538, 58: 9642, 59: 9746, 60: 9850, 61: 10675, 62: 10779, 63: 10884, 64: 10988, 65: 11093, 66: 11198, 67: 11302, 68: 11408, 69: 11513, 70: 11618, 71: 12443, 72: 12550, 73: 12655, 74: 12760, 75: 12867, 76: 12972, 77: 13078, 78: 13185, 79: 13291, 80: 13397, 81: 14224, 82: 14330, 83: 14437, 84: 14543, 85: 14649, 86: 14757, 87: 14863, 88: 14971, 89: 15079, 90: 15185 } },
    atk: { byLevel: { 1: 14, 2: 15, 3: 17, 4: 18, 5: 19, 6: 20, 7: 21, 8: 22, 9: 24, 10: 25, 11: 26, 12: 27, 13: 28, 14: 30, 15: 31, 16: 32, 17: 33, 18: 34, 19: 36, 20: 37, 21: 50, 22: 51, 23: 52, 24: 54, 25: 55, 26: 56, 27: 57, 28: 58, 29: 60, 30: 61, 31: 62, 32: 63, 33: 65, 34: 66, 35: 67, 36: 68, 37: 69, 38: 71, 39: 72, 40: 73, 41: 83, 42: 84, 43: 85, 44: 87, 45: 88, 46: 89, 47: 90, 48: 92, 49: 93, 50: 94, 51: 107, 52: 108, 53: 109, 54: 110, 55: 112, 56: 113, 57: 114, 58: 115, 59: 117, 60: 118, 61: 128, 62: 129, 63: 130, 64: 132, 65: 133, 66: 134, 67: 135, 68: 137, 69: 138, 70: 139, 71: 149, 72: 150, 73: 151, 74: 153, 75: 154, 76: 155, 77: 157, 78: 158, 79: 159, 80: 160, 81: 170, 82: 172, 83: 173, 84: 174, 85: 175, 86: 177, 87: 178, 88: 179, 89: 181, 90: 182 } },
    def: { byLevel: { 1: 44, 2: 48, 3: 52, 4: 55, 5: 59, 6: 63, 7: 67, 8: 70, 9: 74, 10: 78, 11: 81, 12: 85, 13: 89, 14: 93, 15: 96, 16: 100, 17: 104, 18: 108, 19: 111, 20: 115, 21: 157, 22: 161, 23: 165, 24: 168, 25: 172, 26: 176, 27: 180, 28: 183, 29: 187, 30: 191, 31: 195, 32: 199, 33: 202, 34: 206, 35: 210, 36: 214, 37: 218, 38: 222, 39: 225, 40: 229, 41: 260, 42: 264, 43: 268, 44: 272, 45: 276, 46: 279, 47: 283, 48: 287, 49: 291, 50: 295, 51: 335, 52: 339, 53: 343, 54: 346, 55: 350, 56: 354, 57: 358, 58: 362, 59: 366, 60: 370, 61: 401, 62: 405, 63: 409, 64: 413, 65: 417, 66: 421, 67: 424, 68: 428, 69: 432, 70: 436, 71: 467, 72: 471, 73: 475, 74: 479, 75: 483, 76: 487, 77: 491, 78: 495, 79: 499, 80: 503, 81: 534, 82: 538, 83: 542, 84: 546, 85: 550, 86: 554, 87: 558, 88: 562, 89: 566, 90: 570 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 182,
    hp: 15185,
    def: 570,
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
        id: "mualani-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mualani-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.51396, 0.552507, 0.591054, 0.64245, 0.680997, 0.719544, 0.77094, 0.822336, 0.873732, 0.925128, 0.976524, 1.02792, 1.092165, 1.15641, 1.220655]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "mualani-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mualani-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.446256, 0.479725, 0.513194, 0.55782, 0.591289, 0.624758, 0.669384, 0.71401, 0.758635, 0.803261, 0.847886, 0.892512, 0.948294, 1.004076, 1.059858]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "mualani-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "mualani-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.700344, 0.75287, 0.805396, 0.87543, 0.927956, 0.980482, 1.050516, 1.12055, 1.190585, 1.260619, 1.330654, 1.400688, 1.488231, 1.575774, 1.663317]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "mualani-charged",
      name: "Cooling Treatment",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mualani-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.4288, 1.53596, 1.64312, 1.786, 1.89316, 2.00032, 2.1432, 2.28608, 2.42896, 2.57184, 2.71472, 2.8576, 3.0362, 3.2148, 3.3934]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "mualani-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mualani-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "mualani-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "mualani-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "mualani-skill",
      name: "Surfshark Wavebreaker",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 9, element: "hydro" },
      instances: [
        {
          id: "mualani-skill-1",
          name: "Sharky's Bite Base DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.0868, 0.09331, 0.09982, 0.1085, 0.11501, 0.12152, 0.1302, 0.13888, 0.14756, 0.15624, 0.16492, 0.1736, 0.18445, 0.1953, 0.20615]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "mualani-burst",
      name: "Boomsharka-laka",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "mualani-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.584392, 0.628221, 0.672051, 0.73049, 0.774319, 0.818149, 0.876588, 0.935027, 0.993466, 1.051906, 1.110345, 1.168784, 1.241833, 1.314882, 1.387931]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "mualani-a1", name: "Heat-Resistant Freshwater Floater", unlockAscension: 1, effects: [] },
    { id: "mualani-a4", name: "Natlan's Greatest Guide", unlockAscension: 4, effects: [] },
    { id: "mualani-p3", name: "Night Realm's Gift: Crests and Troughs", effects: [] },
    { id: "mualani-p4", name: "The Trick Is to Keep Smiling!", effects: [] },
  ],
  constellations: [
    { level: 1, id: "mualani-c1", name: "The Leisurely \"Meztli\"...", effects: [] },
    { level: 2, id: "mualani-c2", name: "Mualani, Going All Out!", effects: [] },
    { level: 3, id: "mualani-c3", name: "Surfing Atop Joyous Seas", effects: [], buffs: [{ id: "mualani-c3", source: "Surfing Atop Joyous Seas", sourceCharacterId: "mualani", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "mualani-c4", name: "Sharky Eats Puffies", effects: [] },
    { level: 5, id: "mualani-c5", name: "Same Style of Surfboard on Sale!", effects: [], buffs: [{ id: "mualani-c5", source: "Same Style of Surfboard on Sale!", sourceCharacterId: "mualani", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "mualani-c6", name: "Spirit of the Springs' People", effects: [] },
  ],
  resources: [],
};

export const neuvillette: GeneratedCharacter = {
  id: "neuvillette",
  name: "Neuvillette",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1144, 2: 1239, 3: 1334, 4: 1430, 5: 1525, 6: 1621, 7: 1716, 8: 1812, 9: 1908, 10: 2003, 11: 2099, 12: 2195, 13: 2291, 14: 2389, 15: 2485, 16: 2581, 17: 2678, 18: 2774, 19: 2871, 20: 2967, 21: 4046, 22: 4143, 23: 4240, 24: 4337, 25: 4435, 26: 4533, 27: 4630, 28: 4727, 29: 4826, 30: 4923, 31: 5021, 32: 5120, 33: 5218, 34: 5315, 35: 5414, 36: 5513, 37: 5612, 38: 5710, 39: 5808, 40: 5908, 41: 6703, 42: 6803, 43: 6902, 44: 7001, 45: 7100, 46: 7200, 47: 7299, 48: 7399, 49: 7500, 50: 7599, 51: 8628, 52: 8728, 53: 8828, 54: 8929, 55: 9029, 56: 9130, 57: 9231, 58: 9331, 59: 9432, 60: 9533, 61: 10330, 62: 10431, 63: 10533, 64: 10633, 65: 10735, 66: 10837, 67: 10938, 68: 11040, 69: 11141, 70: 11243, 71: 12042, 72: 12145, 73: 12247, 74: 12349, 75: 12451, 76: 12553, 77: 12656, 78: 12759, 79: 12862, 80: 12965, 81: 13765, 82: 13868, 83: 13971, 84: 14074, 85: 14177, 86: 14281, 87: 14384, 88: 14488, 89: 14592, 90: 14695 } },
    atk: { byLevel: { 1: 16, 2: 18, 3: 19, 4: 20, 5: 22, 6: 23, 7: 24, 8: 26, 9: 27, 10: 28, 11: 30, 12: 31, 13: 32, 14: 34, 15: 35, 16: 37, 17: 38, 18: 39, 19: 41, 20: 42, 21: 57, 22: 59, 23: 60, 24: 61, 25: 63, 26: 64, 27: 66, 28: 67, 29: 68, 30: 70, 31: 71, 32: 73, 33: 74, 34: 75, 35: 77, 36: 78, 37: 80, 38: 81, 39: 82, 40: 84, 41: 95, 42: 96, 43: 98, 44: 99, 45: 101, 46: 102, 47: 103, 48: 105, 49: 106, 50: 108, 51: 122, 52: 124, 53: 125, 54: 127, 55: 128, 56: 129, 57: 131, 58: 132, 59: 134, 60: 135, 61: 146, 62: 148, 63: 149, 64: 151, 65: 152, 66: 154, 67: 155, 68: 157, 69: 158, 70: 159, 71: 171, 72: 172, 73: 174, 74: 175, 75: 177, 76: 178, 77: 179, 78: 181, 79: 182, 80: 184, 81: 195, 82: 197, 83: 198, 84: 200, 85: 201, 86: 202, 87: 204, 88: 205, 89: 207, 90: 208 } },
    def: { byLevel: { 1: 45, 2: 49, 3: 52, 4: 56, 5: 60, 6: 64, 7: 67, 8: 71, 9: 75, 10: 79, 11: 82, 12: 86, 13: 90, 14: 94, 15: 97, 16: 101, 17: 105, 18: 109, 19: 113, 20: 116, 21: 159, 22: 163, 23: 166, 24: 170, 25: 174, 26: 178, 27: 182, 28: 185, 29: 189, 30: 193, 31: 197, 32: 201, 33: 205, 34: 208, 35: 212, 36: 216, 37: 220, 38: 224, 39: 228, 40: 232, 41: 263, 42: 267, 43: 271, 44: 275, 45: 279, 46: 282, 47: 286, 48: 290, 49: 294, 50: 298, 51: 338, 52: 342, 53: 346, 54: 350, 55: 354, 56: 358, 57: 362, 58: 366, 59: 370, 60: 374, 61: 405, 62: 409, 63: 413, 64: 417, 65: 421, 66: 425, 67: 429, 68: 433, 69: 437, 70: 441, 71: 472, 72: 476, 73: 480, 74: 484, 75: 488, 76: 492, 77: 496, 78: 500, 79: 505, 80: 509, 81: 540, 82: 544, 83: 548, 84: 552, 85: 556, 86: 560, 87: 564, 88: 568, 89: 572, 90: 576 } },
  },
  ascensionBonus: {
    stat: "critDmg",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.384],
  },
  baseStats: {
    atk: 208,
    hp: 14695,
    def: 576,
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
        id: "neuvillette-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "neuvillette-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.545768, 0.586701, 0.627633, 0.68221, 0.723143, 0.764075, 0.818652, 0.873229, 0.927806, 0.982382, 1.036959, 1.091536, 1.159757, 1.227978, 1.296199]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "neuvillette-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "neuvillette-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.462456, 0.49714, 0.531824, 0.57807, 0.612754, 0.647438, 0.693684, 0.73993, 0.786175, 0.832421, 0.878666, 0.924912, 0.982719, 1.040526, 1.098333]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "neuvillette-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "neuvillette-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.723376, 0.777629, 0.831882, 0.90422, 0.958473, 1.012726, 1.085064, 1.157402, 1.229739, 1.302077, 1.374414, 1.446752, 1.537174, 1.627596, 1.718018]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "neuvillette-charged",
      name: "As Water Seeks Equilibrium",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "neuvillette-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.368, 1.4706, 1.5732, 1.71, 1.8126, 1.9152, 2.052, 2.1888, 2.3256, 2.4624, 2.5992, 2.736, 2.907, 3.078, 3.249]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "neuvillette-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "neuvillette-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "neuvillette-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "neuvillette-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "neuvillette-skill",
      name: "O Tears, I Shall Repay",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(12),
      energyCost: 0,
      particles: { count: 4, element: "hydro" },
      instances: [
        {
          id: "neuvillette-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.12864, 0.138288, 0.147936, 0.1608, 0.170448, 0.180096, 0.19296, 0.205824, 0.218688, 0.231552, 0.244416, 0.25728, 0.27336, 0.28944, 0.30552]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "neuvillette-skill-2",
          name: "Spiritbreath Thorn DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.208, 0.2236, 0.2392, 0.26, 0.2756, 0.2912, 0.312, 0.3328, 0.3536, 0.3744, 0.3952, 0.416, 0.442, 0.468, 0.494]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "neuvillette-burst",
      name: "O Tides, I Have Returned",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "neuvillette-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.222578, 0.239272, 0.255965, 0.278223, 0.294916, 0.31161, 0.333868, 0.356125, 0.378383, 0.400641, 0.422899, 0.445157, 0.472979, 0.500801, 0.528624]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "neuvillette-burst-2",
          name: "Waterfall DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.091055, 0.097884, 0.104713, 0.113818, 0.120647, 0.127477, 0.136582, 0.145688, 0.154793, 0.163898, 0.173004, 0.182109, 0.193491, 0.204873, 0.216255]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "neuvillette-a1", name: "Heir to the Ancient Sea's Authority", unlockAscension: 1, effects: [] },
    { id: "neuvillette-a4", name: "Discipline of the Supreme Arbitration", unlockAscension: 4, effects: [] },
    { id: "neuvillette-p3", name: "Gather Like the Tide", effects: [] },
  ],
  constellations: [
    { level: 1, id: "neuvillette-c1", name: "Venerable Institution", effects: [] },
    { level: 2, id: "neuvillette-c2", name: "Juridical Exhortation", effects: [] },
    { level: 3, id: "neuvillette-c3", name: "Ancient Postulation", effects: [], buffs: [{ id: "neuvillette-c3", source: "Ancient Postulation", sourceCharacterId: "neuvillette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "normal", levels: 3 }] }] },
    { level: 4, id: "neuvillette-c4", name: "Crown of Commiseration", effects: [] },
    { level: 5, id: "neuvillette-c5", name: "Axiomatic Judgment", effects: [], buffs: [{ id: "neuvillette-c5", source: "Axiomatic Judgment", sourceCharacterId: "neuvillette", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "neuvillette-c6", name: "Wrathful Recompense", effects: [] },
  ],
  resources: [],
};

export const nilou: GeneratedCharacter = {
  id: "nilou",
  name: "Nilou",
  element: "hydro",
  weaponType: "sword",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1182, 2: 1280, 3: 1378, 4: 1478, 5: 1576, 6: 1675, 7: 1773, 8: 1872, 9: 1972, 10: 2070, 11: 2169, 12: 2268, 13: 2368, 14: 2468, 15: 2568, 16: 2667, 17: 2767, 18: 2867, 19: 2967, 20: 3066, 21: 4180, 22: 4281, 23: 4381, 24: 4482, 25: 4582, 26: 4684, 27: 4785, 28: 4885, 29: 4987, 30: 5087, 31: 5189, 32: 5290, 33: 5392, 34: 5493, 35: 5594, 36: 5697, 37: 5799, 38: 5900, 39: 6002, 40: 6105, 41: 6927, 42: 7030, 43: 7132, 44: 7234, 45: 7337, 46: 7440, 47: 7543, 48: 7645, 49: 7750, 50: 7852, 51: 8915, 52: 9019, 53: 9122, 54: 9226, 55: 9330, 56: 9434, 57: 9538, 58: 9642, 59: 9746, 60: 9850, 61: 10675, 62: 10779, 63: 10884, 64: 10988, 65: 11093, 66: 11198, 67: 11302, 68: 11408, 69: 11513, 70: 11618, 71: 12443, 72: 12550, 73: 12655, 74: 12760, 75: 12867, 76: 12972, 77: 13078, 78: 13185, 79: 13291, 80: 13397, 81: 14224, 82: 14330, 83: 14437, 84: 14543, 85: 14649, 86: 14757, 87: 14863, 88: 14971, 89: 15079, 90: 15185 } },
    atk: { byLevel: { 1: 18, 2: 19, 3: 21, 4: 22, 5: 24, 6: 25, 7: 27, 8: 28, 9: 30, 10: 31, 11: 33, 12: 34, 13: 36, 14: 37, 15: 39, 16: 40, 17: 42, 18: 43, 19: 45, 20: 46, 21: 63, 22: 65, 23: 66, 24: 68, 25: 69, 26: 71, 27: 72, 28: 74, 29: 75, 30: 77, 31: 78, 32: 80, 33: 82, 34: 83, 35: 85, 36: 86, 37: 88, 38: 89, 39: 91, 40: 92, 41: 105, 42: 106, 43: 108, 44: 109, 45: 111, 46: 112, 47: 114, 48: 116, 49: 117, 50: 119, 51: 135, 52: 136, 53: 138, 54: 140, 55: 141, 56: 143, 57: 144, 58: 146, 59: 147, 60: 149, 61: 161, 62: 163, 63: 165, 64: 166, 65: 168, 66: 169, 67: 171, 68: 172, 69: 174, 70: 176, 71: 188, 72: 190, 73: 191, 74: 193, 75: 195, 76: 196, 77: 198, 78: 199, 79: 201, 80: 203, 81: 215, 82: 217, 83: 218, 84: 220, 85: 222, 86: 223, 87: 225, 88: 226, 89: 228, 90: 230 } },
    def: { byLevel: { 1: 57, 2: 61, 3: 66, 4: 71, 5: 76, 6: 80, 7: 85, 8: 90, 9: 95, 10: 99, 11: 104, 12: 109, 13: 114, 14: 118, 15: 123, 16: 128, 17: 133, 18: 138, 19: 142, 20: 147, 21: 201, 22: 205, 23: 210, 24: 215, 25: 220, 26: 225, 27: 230, 28: 234, 29: 239, 30: 244, 31: 249, 32: 254, 33: 259, 34: 264, 35: 268, 36: 273, 37: 278, 38: 283, 39: 288, 40: 293, 41: 332, 42: 337, 43: 342, 44: 347, 45: 352, 46: 357, 47: 362, 48: 367, 49: 372, 50: 377, 51: 428, 52: 433, 53: 438, 54: 443, 55: 448, 56: 453, 57: 458, 58: 463, 59: 468, 60: 473, 61: 512, 62: 517, 63: 522, 64: 527, 65: 532, 66: 537, 67: 542, 68: 547, 69: 552, 70: 557, 71: 597, 72: 602, 73: 607, 74: 612, 75: 617, 76: 622, 77: 628, 78: 633, 79: 638, 80: 643, 81: 682, 82: 688, 83: 693, 84: 698, 85: 703, 86: 708, 87: 713, 88: 718, 89: 723, 90: 729 } },
  },
  ascensionBonus: {
    stat: "hpPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
  },
  baseStats: {
    atk: 230,
    hp: 15185,
    def: 729,
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
        id: "nilou-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nilou-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.503074, 0.544022, 0.58497, 0.643467, 0.684415, 0.731213, 0.795559, 0.859906, 0.924253, 0.994449, 1.064645, 1.134842, 1.205038, 1.275235, 1.345431]) },
            ],
          },
        ],
      },
      {
        id: "nilou-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nilou-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.45439, 0.491375, 0.52836, 0.581196, 0.618181, 0.66045, 0.71857, 0.776689, 0.834809, 0.898212, 0.961615, 1.025018, 1.088422, 1.151825, 1.215228]) },
            ],
          },
        ],
      },
      {
        id: "nilou-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "nilou-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.70354, 0.760805, 0.81807, 0.899877, 0.957142, 1.022588, 1.112575, 1.202563, 1.292551, 1.390719, 1.488887, 1.587056, 1.685224, 1.783393, 1.881561]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "nilou-charged",
      name: "Dance of Samser",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nilou-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.50224, 0.54312, 0.584, 0.6424, 0.68328, 0.73, 0.79424, 0.85848, 0.92272, 0.9928, 1.06288, 1.13296, 1.20304, 1.27312, 1.3432]) },
            { stat: "atk", table: talentTable([0.54438, 0.58869, 0.633, 0.6963, 0.74061, 0.79125, 0.86088, 0.93051, 1.00014, 1.0761, 1.15206, 1.22802, 1.30398, 1.37994, 1.4559]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "nilou-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nilou-plungeLow-1",
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
      id: "nilou-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "nilou-plungeHigh-1",
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
      id: "nilou-skill",
      name: "Dance of Haftkarsvar",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      particles: { count: 4, element: "hydro" },
      instances: [
        {
          id: "nilou-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.033389, 0.035893, 0.038397, 0.041736, 0.04424, 0.046744, 0.050083, 0.053422, 0.056761, 0.0601, 0.063439, 0.066778, 0.070951, 0.075125, 0.079298]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-2",
          name: "Sword Dance Steps 1-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.045525, 0.048939, 0.052354, 0.056906, 0.06032, 0.063735, 0.068287, 0.07284, 0.077392, 0.081945, 0.086497, 0.09105, 0.09674, 0.102431, 0.108121]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-3",
          name: "Whirling Steps 1-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.032619, 0.035066, 0.037512, 0.040774, 0.04322, 0.045667, 0.048929, 0.052191, 0.055453, 0.058715, 0.061976, 0.065238, 0.069316, 0.073393, 0.077471]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-4",
          name: "Sword Dance Steps 2-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.051445, 0.055303, 0.059162, 0.064306, 0.068164, 0.072023, 0.077167, 0.082312, 0.087456, 0.092601, 0.097745, 0.10289, 0.10932, 0.115751, 0.122181]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-5",
          name: "Whirling Steps 2-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.039605, 0.042575, 0.045546, 0.049506, 0.052476, 0.055447, 0.059407, 0.063368, 0.067328, 0.071289, 0.075249, 0.07921, 0.08416, 0.089111, 0.094061]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-6",
          name: "Luminous Illusion Wheel DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.071688, 0.077065, 0.082441, 0.08961, 0.094987, 0.100363, 0.107532, 0.114701, 0.12187, 0.129038, 0.136207, 0.143376, 0.152337, 0.161298, 0.170259]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "nilou-skill-7",
          name: "Water Wheel DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.050616, 0.054412, 0.058208, 0.06327, 0.067066, 0.070862, 0.075924, 0.080986, 0.086047, 0.091109, 0.09617, 0.101232, 0.107559, 0.113886, 0.120213]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "nilou-burst",
      name: "Dance of Abzendegi: Distant Dreams, Listening Spring",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "nilou-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.18432, 0.198144, 0.211968, 0.2304, 0.244224, 0.258048, 0.27648, 0.294912, 0.313344, 0.331776, 0.350208, 0.36864, 0.39168, 0.41472, 0.43776]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "nilou-burst-2",
          name: "Lingering Aeon DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.22528, 0.242176, 0.259072, 0.2816, 0.298496, 0.315392, 0.33792, 0.360448, 0.382976, 0.405504, 0.428032, 0.45056, 0.47872, 0.50688, 0.53504]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "nilou-a1", name: "Court of Dancing Petals", unlockAscension: 1, effects: [] },
    { id: "nilou-a4", name: "Dreamy Dance of Aeons", unlockAscension: 4, effects: [] },
    { id: "nilou-p3", name: "White Jade Lotus", effects: [] },
  ],
  constellations: [
    { level: 1, id: "nilou-c1", name: "Dance of the Waning Moon", effects: [] },
    { level: 2, id: "nilou-c2", name: "The Starry Skies Their Flowers Rain", effects: [] },
    { level: 3, id: "nilou-c3", name: "Beguiling Shadowstep", effects: [], buffs: [{ id: "nilou-c3", source: "Beguiling Shadowstep", sourceCharacterId: "nilou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "nilou-c4", name: "Fricative Pulse", effects: [] },
    { level: 5, id: "nilou-c5", name: "Twirling Light", effects: [], buffs: [{ id: "nilou-c5", source: "Twirling Light", sourceCharacterId: "nilou", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "nilou-c6", name: "Frostbreaker's Melody", effects: [] },
  ],
  resources: [],
};

export const sangonomiyaKokomi: GeneratedCharacter = {
  id: "sangonomiya-kokomi",
  name: "Sangonomiya Kokomi",
  element: "hydro",
  weaponType: "catalyst",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1049, 2: 1136, 3: 1223, 4: 1311, 5: 1398, 6: 1486, 7: 1573, 8: 1661, 9: 1749, 10: 1836, 11: 1924, 12: 2012, 13: 2100, 14: 2190, 15: 2278, 16: 2366, 17: 2455, 18: 2543, 19: 2632, 20: 2720, 21: 3708, 22: 3798, 23: 3887, 24: 3976, 25: 4065, 26: 4155, 27: 4244, 28: 4333, 29: 4424, 30: 4513, 31: 4603, 32: 4693, 33: 4783, 34: 4872, 35: 4963, 36: 5054, 37: 5144, 38: 5234, 39: 5324, 40: 5416, 41: 6145, 42: 6236, 43: 6327, 44: 6417, 45: 6509, 46: 6600, 47: 6691, 48: 6782, 49: 6875, 50: 6966, 51: 7909, 52: 8001, 53: 8092, 54: 8185, 55: 8277, 56: 8369, 57: 8461, 58: 8554, 59: 8646, 60: 8738, 61: 9469, 62: 9562, 63: 9655, 64: 9747, 65: 9841, 66: 9934, 67: 10026, 68: 10120, 69: 10213, 70: 10306, 71: 11038, 72: 11133, 73: 11226, 74: 11319, 75: 11414, 76: 11507, 77: 11602, 78: 11696, 79: 11790, 80: 11885, 81: 12618, 82: 12712, 83: 12807, 84: 12901, 85: 12995, 86: 13091, 87: 13185, 88: 13281, 89: 13376, 90: 13471 } },
    atk: { byLevel: { 1: 18, 2: 20, 3: 21, 4: 23, 5: 24, 6: 26, 7: 27, 8: 29, 9: 30, 10: 32, 11: 33, 12: 35, 13: 37, 14: 38, 15: 40, 16: 41, 17: 43, 18: 44, 19: 46, 20: 47, 21: 65, 22: 66, 23: 68, 24: 69, 25: 71, 26: 72, 27: 74, 28: 75, 29: 77, 30: 79, 31: 80, 32: 82, 33: 83, 34: 85, 35: 86, 36: 88, 37: 90, 38: 91, 39: 93, 40: 94, 41: 107, 42: 109, 43: 110, 44: 112, 45: 113, 46: 115, 47: 116, 48: 118, 49: 120, 50: 121, 51: 138, 52: 139, 53: 141, 54: 142, 55: 144, 56: 146, 57: 147, 58: 149, 59: 150, 60: 152, 61: 165, 62: 166, 63: 168, 64: 170, 65: 171, 66: 173, 67: 174, 68: 176, 69: 178, 70: 179, 71: 192, 72: 194, 73: 195, 74: 197, 75: 199, 76: 200, 77: 202, 78: 204, 79: 205, 80: 207, 81: 220, 82: 221, 83: 223, 84: 224, 85: 226, 86: 228, 87: 229, 88: 231, 89: 233, 90: 234 } },
    def: { byLevel: { 1: 51, 2: 55, 3: 60, 4: 64, 5: 68, 6: 72, 7: 77, 8: 81, 9: 85, 10: 90, 11: 94, 12: 98, 13: 102, 14: 107, 15: 111, 16: 115, 17: 120, 18: 124, 19: 128, 20: 133, 21: 181, 22: 185, 23: 190, 24: 194, 25: 198, 26: 203, 27: 207, 28: 211, 29: 216, 30: 220, 31: 225, 32: 229, 33: 233, 34: 238, 35: 242, 36: 247, 37: 251, 38: 255, 39: 260, 40: 264, 41: 300, 42: 304, 43: 309, 44: 313, 45: 317, 46: 322, 47: 326, 48: 331, 49: 335, 50: 340, 51: 386, 52: 390, 53: 395, 54: 399, 55: 404, 56: 408, 57: 413, 58: 417, 59: 422, 60: 426, 61: 462, 62: 466, 63: 471, 64: 475, 65: 480, 66: 485, 67: 489, 68: 494, 69: 498, 70: 503, 71: 538, 72: 543, 73: 548, 74: 552, 75: 557, 76: 561, 77: 566, 78: 571, 79: 575, 80: 580, 81: 616, 82: 620, 83: 625, 84: 629, 85: 634, 86: 639, 87: 643, 88: 648, 89: 653, 90: 657 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "hydro",
  },
  baseStats: {
    atk: 234,
    hp: 13471,
    def: 657,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { hydro: 0.28800000000000003 },
  },
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "sangonomiya-kokomi-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sangonomiya-kokomi-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.68376, 0.735042, 0.786324, 0.8547, 0.905982, 0.957264, 1.02564, 1.094016, 1.162392, 1.230768, 1.299144, 1.36752, 1.45299, 1.53846, 1.62393]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "sangonomiya-kokomi-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sangonomiya-kokomi-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.615384, 0.661538, 0.707692, 0.76923, 0.815384, 0.861538, 0.923076, 0.984614, 1.046153, 1.107691, 1.16923, 1.230768, 1.307691, 1.384614, 1.461537]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
      {
        id: "sangonomiya-kokomi-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sangonomiya-kokomi-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "hydro",
            scaling: [
              { stat: "atk", table: talentTable([0.943056, 1.013785, 1.084514, 1.17882, 1.249549, 1.320278, 1.414584, 1.50889, 1.603195, 1.697501, 1.791806, 1.886112, 2.003994, 2.121876, 2.239758]) },
            ],
            application: { element: "hydro", gauge: 1 },
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sangonomiya-kokomi-charged",
      name: "The Shape of Water",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sangonomiya-kokomi-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.4832, 1.59444, 1.70568, 1.854, 1.96524, 2.07648, 2.2248, 2.37312, 2.52144, 2.66976, 2.81808, 2.9664, 3.1518, 3.3372, 3.5226]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeLow:
    {
      id: "sangonomiya-kokomi-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sangonomiya-kokomi-plungeLow-1",
          name: "Low Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.136335, 1.228828, 1.32132, 1.453452, 1.545944, 1.65165, 1.796995, 1.94234, 2.087686, 2.246244, 2.404802, 2.563361, 2.721919, 2.880478, 3.039036]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  plungeHigh:
    {
      id: "sangonomiya-kokomi-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sangonomiya-kokomi-plungeHigh-1",
          name: "High Plunge DMG",
          damageType: "plunge",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.419344, 1.534872, 1.6504, 1.81544, 1.930968, 2.063, 2.244544, 2.426088, 2.607632, 2.80568, 3.003728, 3.201776, 3.399824, 3.597872, 3.79592]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  skill:
    {
      id: "sangonomiya-kokomi-skill",
      name: "Kurage's Oath",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(20),
      energyCost: 0,
      particles: { count: 1, element: "hydro" },
      instances: [
        {
          id: "sangonomiya-kokomi-skill-1",
          name: "Ripple DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.091904, 1.173797, 1.25569, 1.36488, 1.446773, 1.528666, 1.637856, 1.747046, 1.856237, 1.965427, 2.074618, 2.183808, 2.320296, 2.456784, 2.593272]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sangonomiya-kokomi-burst",
      name: "Nereid's Ascension",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "sangonomiya-kokomi-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.10416, 0.111972, 0.119784, 0.1302, 0.138012, 0.145824, 0.15624, 0.166656, 0.177072, 0.187488, 0.197904, 0.20832, 0.22134, 0.23436, 0.24738]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "sangonomiya-kokomi-a1", name: "Tamakushi Casket", unlockAscension: 1, effects: [] },
    { id: "sangonomiya-kokomi-a4", name: "Song of Pearls", unlockAscension: 4, effects: [] },
    { id: "sangonomiya-kokomi-p3", name: "Princess of Watatsumi", effects: [] },
    { id: "sangonomiya-kokomi-p4", name: "Flawless Strategy", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sangonomiya-kokomi-c1", name: "At Water's Edge", effects: [] },
    { level: 2, id: "sangonomiya-kokomi-c2", name: "The Clouds Like Waves Rippling", effects: [] },
    { level: 3, id: "sangonomiya-kokomi-c3", name: "The Moon, A Ship O'er the Seas", effects: [], buffs: [{ id: "sangonomiya-kokomi-c3", source: "The Moon, A Ship O'er the Seas", sourceCharacterId: "sangonomiya-kokomi", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "sangonomiya-kokomi-c4", name: "The Moon Overlooks the Waters", effects: [] },
    { level: 5, id: "sangonomiya-kokomi-c5", name: "All Streams Flow to the Sea", effects: [], buffs: [{ id: "sangonomiya-kokomi-c5", source: "All Streams Flow to the Sea", sourceCharacterId: "sangonomiya-kokomi", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "sangonomiya-kokomi-c6", name: "Sango Isshin", effects: [] },
  ],
  resources: [],
};

export const sigewinne: GeneratedCharacter = {
  id: "sigewinne",
  name: "Sigewinne",
  element: "hydro",
  weaponType: "bow",
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
  maxEnergy: 70,
  normalAttacks: {
    hits: [
      {
        id: "sigewinne-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sigewinne-na-1-1",
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
        id: "sigewinne-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sigewinne-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.510711, 0.552281, 0.59385, 0.653235, 0.694804, 0.742312, 0.807636, 0.872959, 0.938283, 1.009545, 1.080807, 1.152069, 1.223331, 1.294593, 1.365855]) },
            ],
          },
        ],
      },
      {
        id: "sigewinne-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sigewinne-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.78291, 0.846635, 0.91036, 1.001396, 1.065121, 1.13795, 1.23809, 1.338229, 1.438369, 1.547612, 1.656855, 1.766098, 1.875342, 1.984585, 2.093828]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "sigewinne-charged",
      name: "Targeted Treatment",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sigewinne-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "sigewinne-charged-2",
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
      id: "sigewinne-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sigewinne-plungeLow-1",
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
      id: "sigewinne-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "sigewinne-plungeHigh-1",
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
      id: "sigewinne-skill",
      name: "Rebound Hydrotherapy",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(18),
      energyCost: 0,
      instances: [
        {
          id: "sigewinne-skill-1",
          name: "Bolstering Bubblebalm DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.0228, 0.02451, 0.02622, 0.0285, 0.03021, 0.03192, 0.0342, 0.03648, 0.03876, 0.04104, 0.04332, 0.0456, 0.04845, 0.0513, 0.05415]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "sigewinne-skill-2",
          name: "Surging Blade DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.00684, 0.007353, 0.007866, 0.00855, 0.009063, 0.009576, 0.01026, 0.010944, 0.011628, 0.012312, 0.012996, 0.01368, 0.014535, 0.01539, 0.016245]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "sigewinne-burst",
      name: "Super Saturated Syringing",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "sigewinne-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.117708, 0.126536, 0.135364, 0.147135, 0.155963, 0.164791, 0.176562, 0.188333, 0.200104, 0.211874, 0.223645, 0.235416, 0.250129, 0.264843, 0.279556]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "sigewinne-a1", name: "Requires Appropriate Rest", unlockAscension: 1, effects: [] },
    { id: "sigewinne-a4", name: "Detailed Diagnosis, Thorough Treatment", unlockAscension: 4, effects: [] },
    { id: "sigewinne-p3", name: "Emergency Dose", effects: [] },
  ],
  constellations: [
    { level: 1, id: "sigewinne-c1", name: "\"Can the Happiest of Spirits Understand Anxiety?\"", effects: [] },
    { level: 2, id: "sigewinne-c2", name: "\"Can the Most Merciful of Spirits Defeat Its Foes?\"", effects: [] },
    { level: 3, id: "sigewinne-c3", name: "\"Can the Healthiest of Spirits Cure Fevers?\"", effects: [], buffs: [{ id: "sigewinne-c3", source: "\"Can the Healthiest of Spirits Cure Fevers?\"", sourceCharacterId: "sigewinne", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "sigewinne-c4", name: "\"Can the Loveliest of Spirits Keep Decay at Bay?\"", effects: [] },
    { level: 5, id: "sigewinne-c5", name: "\"Can the Most Joyful of Spirits Alleviate Agony?\"", effects: [], buffs: [{ id: "sigewinne-c5", source: "\"Can the Most Joyful of Spirits Alleviate Agony?\"", sourceCharacterId: "sigewinne", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "sigewinne-c6", name: "\"Can the Most Radiant of Spirits Pray For Me?\"", effects: [] },
  ],
  resources: [],
};

export const tartaglia: GeneratedCharacter = {
  id: "tartaglia",
  name: "Tartaglia",
  element: "hydro",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1020, 2: 1105, 3: 1189, 4: 1275, 5: 1360, 6: 1445, 7: 1530, 8: 1616, 9: 1701, 10: 1786, 11: 1872, 12: 1957, 13: 2043, 14: 2130, 15: 2216, 16: 2301, 17: 2388, 18: 2474, 19: 2560, 20: 2646, 21: 3607, 22: 3694, 23: 3781, 24: 3867, 25: 3954, 26: 4042, 27: 4129, 28: 4215, 29: 4303, 30: 4390, 31: 4477, 32: 4565, 33: 4653, 34: 4740, 35: 4827, 36: 4916, 37: 5004, 38: 5091, 39: 5179, 40: 5268, 41: 5977, 42: 6066, 43: 6155, 44: 6242, 45: 6331, 46: 6420, 47: 6509, 48: 6597, 49: 6687, 50: 6776, 51: 7693, 52: 7783, 53: 7872, 54: 7961, 55: 8051, 56: 8141, 57: 8231, 58: 8320, 59: 8410, 60: 8500, 61: 9211, 62: 9301, 63: 9392, 64: 9482, 65: 9572, 66: 9663, 67: 9753, 68: 9844, 69: 9934, 70: 10025, 71: 10737, 72: 10829, 73: 10920, 74: 11011, 75: 11103, 76: 11193, 77: 11285, 78: 11377, 79: 11469, 80: 11561, 81: 12274, 82: 12366, 83: 12457, 84: 12549, 85: 12641, 86: 12734, 87: 12826, 88: 12918, 89: 13011, 90: 13103 } },
    atk: { byLevel: { 1: 23, 2: 25, 3: 27, 4: 29, 5: 31, 6: 33, 7: 35, 8: 37, 9: 39, 10: 41, 11: 43, 12: 45, 13: 47, 14: 49, 15: 51, 16: 53, 17: 55, 18: 57, 19: 59, 20: 61, 21: 83, 22: 85, 23: 87, 24: 89, 25: 91, 26: 93, 27: 95, 28: 97, 29: 99, 30: 101, 31: 103, 32: 105, 33: 107, 34: 109, 35: 111, 36: 113, 37: 115, 38: 117, 39: 119, 40: 121, 41: 137, 42: 140, 43: 142, 44: 144, 45: 146, 46: 148, 47: 150, 48: 152, 49: 154, 50: 156, 51: 177, 52: 179, 53: 181, 54: 183, 55: 185, 56: 187, 57: 189, 58: 191, 59: 193, 60: 195, 61: 212, 62: 214, 63: 216, 64: 218, 65: 220, 66: 222, 67: 224, 68: 226, 69: 228, 70: 231, 71: 247, 72: 249, 73: 251, 74: 253, 75: 255, 76: 257, 77: 260, 78: 262, 79: 264, 80: 266, 81: 282, 82: 284, 83: 287, 84: 289, 85: 291, 86: 293, 87: 295, 88: 297, 89: 299, 90: 301 } },
    def: { byLevel: { 1: 63, 2: 69, 3: 74, 4: 79, 5: 85, 6: 90, 7: 95, 8: 100, 9: 106, 10: 111, 11: 116, 12: 122, 13: 127, 14: 132, 15: 138, 16: 143, 17: 148, 18: 154, 19: 159, 20: 165, 21: 224, 22: 230, 23: 235, 24: 240, 25: 246, 26: 251, 27: 257, 28: 262, 29: 268, 30: 273, 31: 278, 32: 284, 33: 289, 34: 295, 35: 300, 36: 306, 37: 311, 38: 317, 39: 322, 40: 328, 41: 372, 42: 377, 43: 383, 44: 388, 45: 394, 46: 399, 47: 405, 48: 410, 49: 416, 50: 421, 51: 478, 52: 484, 53: 489, 54: 495, 55: 501, 56: 506, 57: 512, 58: 517, 59: 523, 60: 528, 61: 573, 62: 578, 63: 584, 64: 589, 65: 595, 66: 601, 67: 606, 68: 612, 69: 618, 70: 623, 71: 668, 72: 673, 73: 679, 74: 685, 75: 690, 76: 696, 77: 702, 78: 707, 79: 713, 80: 719, 81: 763, 82: 769, 83: 775, 84: 780, 85: 786, 86: 792, 87: 797, 88: 803, 89: 809, 90: 815 } },
  },
  ascensionBonus: {
    stat: "elementalDmgBonus",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.28800000000000003],
    element: "hydro",
  },
  baseStats: {
    atk: 301,
    hp: 13103,
    def: 815,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: { hydro: 0.28800000000000003 },
  },
  maxEnergy: 60,
  normalAttacks: {
    hits: [
      {
        id: "tartaglia-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.4128, 0.4464, 0.48, 0.528, 0.5616, 0.6, 0.6528, 0.7056, 0.7584, 0.816, 0.8736, 0.9312, 0.9888, 1.0464, 1.104]) },
            ],
          },
        ],
      },
      {
        id: "tartaglia-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.46268, 0.50034, 0.538, 0.5918, 0.62946, 0.6725, 0.73168, 0.79086, 0.85004, 0.9146, 0.97916, 1.04372, 1.10828, 1.17284, 1.2374]) },
            ],
          },
        ],
      },
      {
        id: "tartaglia-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.55384, 0.59892, 0.644, 0.7084, 0.75348, 0.805, 0.87584, 0.94668, 1.01752, 1.0948, 1.17208, 1.24936, 1.32664, 1.40392, 1.4812]) },
            ],
          },
        ],
      },
      {
        id: "tartaglia-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.57018, 0.61659, 0.663, 0.7293, 0.77571, 0.82875, 0.90168, 0.97461, 1.04754, 1.1271, 1.20666, 1.28622, 1.36578, 1.44534, 1.5249]) },
            ],
          },
        ],
      },
      {
        id: "tartaglia-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.60888, 0.65844, 0.708, 0.7788, 0.82836, 0.885, 0.96288, 1.04076, 1.11864, 1.2036, 1.28856, 1.37352, 1.45848, 1.54344, 1.6284]) },
            ],
          },
        ],
      },
      {
        id: "tartaglia-na-6",
        name: "6-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "tartaglia-na-6-1",
            name: "6-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.72756, 0.78678, 0.846, 0.9306, 0.98982, 1.0575, 1.15056, 1.24362, 1.33668, 1.4382, 1.53972, 1.64124, 1.74276, 1.84428, 1.9458]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "tartaglia-charged",
      name: "Cutting Torrent",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tartaglia-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "tartaglia-charged-2",
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
      id: "tartaglia-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tartaglia-plungeLow-1",
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
      id: "tartaglia-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "tartaglia-plungeHigh-1",
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
      id: "tartaglia-skill",
      name: "Foul Legacy: Raging Tide",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(6),
      energyCost: 0,
      particles: { count: 4, element: "hydro" },
      instances: [
        {
          id: "tartaglia-skill-1",
          name: "Stance Change DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.72, 0.774, 0.828, 0.9, 0.954, 1.008, 1.08, 1.152, 1.224, 1.296, 1.368, 1.44, 1.53, 1.62, 1.71]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-2",
          name: "1-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.38872, 0.42036, 0.452, 0.4972, 0.52884, 0.565, 0.61472, 0.66444, 0.71416, 0.7684, 0.82264, 0.87688, 0.93112, 0.98536, 1.0396]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-3",
          name: "2-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.41624, 0.45012, 0.484, 0.5324, 0.56628, 0.605, 0.65824, 0.71148, 0.76472, 0.8228, 0.88088, 0.93896, 0.99704, 1.05512, 1.1132]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-4",
          name: "3-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.5633, 0.60915, 0.655, 0.7205, 0.76635, 0.81875, 0.8908, 0.96285, 1.0349, 1.1135, 1.1921, 1.2707, 1.3493, 1.4279, 1.5065]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-5",
          name: "4-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.59942, 0.64821, 0.697, 0.7667, 0.81549, 0.87125, 0.94792, 1.02459, 1.10126, 1.1849, 1.26854, 1.35218, 1.43582, 1.51946, 1.6031]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-6",
          name: "5-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.55298, 0.59799, 0.643, 0.7073, 0.75231, 0.80375, 0.87448, 0.94521, 1.01594, 1.0931, 1.17026, 1.24742, 1.32458, 1.40174, 1.4789]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-7",
          name: "6-Hit DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.35432, 0.38316, 0.412, 0.4532, 0.48204, 0.515, 0.56032, 0.60564, 0.65096, 0.7004, 0.74984, 0.79928, 0.84872, 0.89816, 0.9476]) },
            { stat: "atk", table: talentTable([0.37668, 0.40734, 0.438, 0.4818, 0.51246, 0.5475, 0.59568, 0.64386, 0.69204, 0.7446, 0.79716, 0.84972, 0.90228, 0.95484, 1.0074]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "tartaglia-skill-8",
          name: "Charged Attack DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.602, 0.651, 0.7, 0.77, 0.819, 0.875, 0.952, 1.029, 1.106, 1.19, 1.274, 1.358, 1.442, 1.526, 1.61]) },
            { stat: "atk", table: talentTable([0.71982, 0.77841, 0.837, 0.9207, 0.97929, 1.04625, 1.13832, 1.23039, 1.32246, 1.4229, 1.52334, 1.62378, 1.72422, 1.82466, 1.9251]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "tartaglia-burst",
      name: "Havoc: Obliteration",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(15),
      energyCost: 60,
      instances: [
        {
          id: "tartaglia-burst-1",
          name: "Skill DMG: Melee",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([4.64, 4.988, 5.336, 5.8, 6.148, 6.496, 6.96, 7.424, 7.888, 8.352, 8.816, 9.28, 9.86, 10.44, 11.02]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "tartaglia-burst-2",
          name: "Skill DMG: Ranged",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([3.784, 4.0678, 4.3516, 4.73, 5.0138, 5.2976, 5.676, 6.0544, 6.4328, 6.8112, 7.1896, 7.568, 8.041, 8.514, 8.987]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "tartaglia-burst-3",
          name: "Riptide Blast DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.2, 1.29, 1.38, 1.5, 1.59, 1.68, 1.8, 1.92, 2.04, 2.16, 2.28, 2.4, 2.55, 2.7, 2.85]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "tartaglia-a1", name: "Never Ending", unlockAscension: 1, effects: [] },
    { id: "tartaglia-a4", name: "Sword of Torrents", unlockAscension: 4, effects: [] },
    { id: "tartaglia-p3", name: "Master of Weaponry", effects: [] },
  ],
  constellations: [
    { level: 1, id: "tartaglia-c1", name: "Foul Legacy: Tide Withholder", effects: [] },
    { level: 2, id: "tartaglia-c2", name: "Foul Legacy: Understream", effects: [] },
    { level: 3, id: "tartaglia-c3", name: "Abyssal Mayhem: Vortex of Turmoil", effects: [], buffs: [{ id: "tartaglia-c3", source: "Abyssal Mayhem: Vortex of Turmoil", sourceCharacterId: "tartaglia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "tartaglia-c4", name: "Abyssal Mayhem: Hydrospout", effects: [] },
    { level: 5, id: "tartaglia-c5", name: "Havoc: Formless Blade", effects: [], buffs: [{ id: "tartaglia-c5", source: "Havoc: Formless Blade", sourceCharacterId: "tartaglia", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "tartaglia-c6", name: "Havoc: Annihilation", effects: [] },
  ],
  resources: [],
};

export const travelerFHydro: GeneratedCharacter = {
  id: "traveler-f-hydro",
  name: "Traveler",
  element: "hydro",
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
        id: "traveler-f-hydro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-hydro-na-1-1",
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
        id: "traveler-f-hydro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-hydro-na-2-1",
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
        id: "traveler-f-hydro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-hydro-na-3-1",
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
        id: "traveler-f-hydro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-hydro-na-4-1",
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
        id: "traveler-f-hydro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-f-hydro-na-5-1",
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
      id: "traveler-f-hydro-charged",
      name: "Foreign Stream",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-hydro-charged-1",
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
      id: "traveler-f-hydro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-hydro-plungeLow-1",
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
      id: "traveler-f-hydro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-hydro-plungeHigh-1",
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
      id: "traveler-f-hydro-skill",
      name: "Aquacrest Saber",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      instances: [
        {
          id: "traveler-f-hydro-skill-1",
          name: "Torrent Surge DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.8928, 2.03476, 2.17672, 2.366, 2.50796, 2.64992, 2.8392, 3.02848, 3.21776, 3.40704, 3.59632, 3.7856, 4.0222, 4.2588, 4.4954]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "traveler-f-hydro-skill-2",
          name: "Dewdrop DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "traveler-f-hydro-skill-3",
          name: "Spiritbreath Thorn DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-f-hydro-burst",
      name: "Rising Waters",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-f-hydro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.018664, 1.095064, 1.171464, 1.27333, 1.34973, 1.42613, 1.527996, 1.629862, 1.731729, 1.833595, 1.935462, 2.037328, 2.164661, 2.291994, 2.419327]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-f-hydro-a1", name: "Spotless Waters", unlockAscension: 1, effects: [] },
    { id: "traveler-f-hydro-a4", name: "Clear Waters", unlockAscension: 4, effects: [] },
    { id: "traveler-f-hydro-p3", name: "Foreign Aqualis", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-f-hydro-c1", name: "Swelling Lake", effects: [] },
    { level: 2, id: "traveler-f-hydro-c2", name: "Trickling Purity", effects: [] },
    { level: 3, id: "traveler-f-hydro-c3", name: "Turbulent Ripples", effects: [], buffs: [{ id: "traveler-f-hydro-c3", source: "Turbulent Ripples", sourceCharacterId: "traveler-f-hydro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-f-hydro-c4", name: "Pouring Descent", effects: [] },
    { level: 5, id: "traveler-f-hydro-c5", name: "Churning Whirlpool", effects: [], buffs: [{ id: "traveler-f-hydro-c5", source: "Churning Whirlpool", sourceCharacterId: "traveler-f-hydro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-f-hydro-c6", name: "Tides of Justice", effects: [] },
  ],
  resources: [],
};

export const travelerMHydro: GeneratedCharacter = {
  id: "traveler-m-hydro",
  name: "Traveler",
  element: "hydro",
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
        id: "traveler-m-hydro-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-hydro-na-1-1",
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
        id: "traveler-m-hydro-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-hydro-na-2-1",
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
        id: "traveler-m-hydro-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-hydro-na-3-1",
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
        id: "traveler-m-hydro-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-hydro-na-4-1",
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
        id: "traveler-m-hydro-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "traveler-m-hydro-na-5-1",
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
      id: "traveler-m-hydro-charged",
      name: "Foreign Stream",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-hydro-charged-1",
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
      id: "traveler-m-hydro-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-hydro-plungeLow-1",
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
      id: "traveler-m-hydro-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-hydro-plungeHigh-1",
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
      id: "traveler-m-hydro-skill",
      name: "Aquacrest Saber",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      instances: [
        {
          id: "traveler-m-hydro-skill-1",
          name: "Torrent Surge DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.8928, 2.03476, 2.17672, 2.366, 2.50796, 2.64992, 2.8392, 3.02848, 3.21776, 3.40704, 3.59632, 3.7856, 4.0222, 4.2588, 4.4954]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "traveler-m-hydro-skill-2",
          name: "Dewdrop DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
        {
          id: "traveler-m-hydro-skill-3",
          name: "Spiritbreath Thorn DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.328, 0.3526, 0.3772, 0.41, 0.4346, 0.4592, 0.492, 0.5248, 0.5576, 0.5904, 0.6232, 0.656, 0.697, 0.738, 0.779]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "traveler-m-hydro-burst",
      name: "Rising Waters",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "traveler-m-hydro-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.018664, 1.095064, 1.171464, 1.27333, 1.34973, 1.42613, 1.527996, 1.629862, 1.731729, 1.833595, 1.935462, 2.037328, 2.164661, 2.291994, 2.419327]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "traveler-m-hydro-a1", name: "Spotless Waters", unlockAscension: 1, effects: [] },
    { id: "traveler-m-hydro-a4", name: "Clear Waters", unlockAscension: 4, effects: [] },
    { id: "traveler-m-hydro-p3", name: "Foreign Aqualis", effects: [] },
  ],
  constellations: [
    { level: 1, id: "traveler-m-hydro-c1", name: "Swelling Lake", effects: [] },
    { level: 2, id: "traveler-m-hydro-c2", name: "Trickling Purity", effects: [] },
    { level: 3, id: "traveler-m-hydro-c3", name: "Turbulent Ripples", effects: [], buffs: [{ id: "traveler-m-hydro-c3", source: "Turbulent Ripples", sourceCharacterId: "traveler-m-hydro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 4, id: "traveler-m-hydro-c4", name: "Pouring Descent", effects: [] },
    { level: 5, id: "traveler-m-hydro-c5", name: "Churning Whirlpool", effects: [], buffs: [{ id: "traveler-m-hydro-c5", source: "Churning Whirlpool", sourceCharacterId: "traveler-m-hydro", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 6, id: "traveler-m-hydro-c6", name: "Tides of Justice", effects: [] },
  ],
  resources: [],
};

export const xingqiu: GeneratedCharacter = {
  id: "xingqiu",
  name: "Xingqiu",
  element: "hydro",
  weaponType: "sword",
  rarity: 4,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 857, 2: 928, 3: 999, 4: 1070, 5: 1140, 6: 1211, 7: 1281, 8: 1352, 9: 1424, 10: 1494, 11: 1565, 12: 1635, 13: 1706, 14: 1777, 15: 1848, 16: 1919, 17: 1989, 18: 2060, 19: 2131, 20: 2202, 21: 2912, 22: 2984, 23: 3055, 24: 3125, 25: 3196, 26: 3266, 27: 3338, 28: 3408, 29: 3479, 30: 3549, 31: 3620, 32: 3692, 33: 3762, 34: 3833, 35: 3903, 36: 3974, 37: 4045, 38: 4116, 39: 4187, 40: 4257, 41: 4783, 42: 4854, 43: 4925, 44: 4995, 45: 5066, 46: 5137, 47: 5208, 48: 5279, 49: 5349, 50: 5420, 51: 6097, 52: 6168, 53: 6239, 54: 6309, 55: 6381, 56: 6451, 57: 6522, 58: 6592, 59: 6663, 60: 6735, 61: 7260, 62: 7331, 63: 7401, 64: 7472, 65: 7543, 66: 7614, 67: 7685, 68: 7755, 69: 7826, 70: 7897, 71: 8423, 72: 8493, 73: 8564, 74: 8635, 75: 8706, 76: 8777, 77: 8847, 78: 8918, 79: 8988, 80: 9060, 81: 9586, 82: 9656, 83: 9727, 84: 9797, 85: 9868, 86: 9939, 87: 10010, 88: 10080, 89: 10151, 90: 10222 } },
    atk: { byLevel: { 1: 17, 2: 18, 3: 20, 4: 21, 5: 23, 6: 24, 7: 25, 8: 27, 9: 28, 10: 29, 11: 31, 12: 32, 13: 34, 14: 35, 15: 36, 16: 38, 17: 39, 18: 41, 19: 42, 20: 43, 21: 57, 22: 59, 23: 60, 24: 62, 25: 63, 26: 64, 27: 66, 28: 67, 29: 69, 30: 70, 31: 71, 32: 73, 33: 74, 34: 76, 35: 77, 36: 78, 37: 80, 38: 81, 39: 83, 40: 84, 41: 94, 42: 96, 43: 97, 44: 99, 45: 100, 46: 101, 47: 103, 48: 104, 49: 106, 50: 107, 51: 120, 52: 122, 53: 123, 54: 125, 55: 126, 56: 127, 57: 129, 58: 130, 59: 132, 60: 133, 61: 143, 62: 145, 63: 146, 64: 147, 65: 149, 66: 150, 67: 152, 68: 153, 69: 154, 70: 156, 71: 166, 72: 168, 73: 169, 74: 170, 75: 172, 76: 173, 77: 175, 78: 176, 79: 177, 80: 179, 81: 189, 82: 191, 83: 192, 84: 193, 85: 195, 86: 196, 87: 198, 88: 199, 89: 200, 90: 202 } },
    def: { byLevel: { 1: 64, 2: 69, 3: 74, 4: 79, 5: 84, 6: 90, 7: 95, 8: 100, 9: 106, 10: 111, 11: 116, 12: 121, 13: 126, 14: 132, 15: 137, 16: 142, 17: 147, 18: 153, 19: 158, 20: 163, 21: 216, 22: 221, 23: 226, 24: 232, 25: 237, 26: 242, 27: 247, 28: 253, 29: 258, 30: 263, 31: 268, 32: 274, 33: 279, 34: 284, 35: 289, 36: 295, 37: 300, 38: 305, 39: 310, 40: 316, 41: 354, 42: 360, 43: 365, 44: 370, 45: 375, 46: 381, 47: 386, 48: 391, 49: 396, 50: 402, 51: 452, 52: 457, 53: 462, 54: 468, 55: 473, 56: 478, 57: 483, 58: 489, 59: 494, 60: 499, 61: 538, 62: 543, 63: 549, 64: 554, 65: 559, 66: 564, 67: 570, 68: 575, 69: 580, 70: 585, 71: 624, 72: 629, 73: 635, 74: 640, 75: 645, 76: 650, 77: 656, 78: 661, 79: 666, 80: 671, 81: 710, 82: 716, 83: 721, 84: 726, 85: 731, 86: 737, 87: 742, 88: 747, 89: 752, 90: 758 } },
  },
  ascensionBonus: {
    stat: "atkPercent",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.24],
  },
  baseStats: {
    atk: 202,
    hp: 10222,
    def: 758,
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
        id: "xingqiu-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xingqiu-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.46612, 0.50406, 0.542, 0.5962, 0.63414, 0.6775, 0.73712, 0.79674, 0.85636, 0.9214, 0.995925, 1.083566, 1.171208, 1.258849, 1.354458]) },
            ],
          },
        ],
      },
      {
        id: "xingqiu-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xingqiu-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.47644, 0.51522, 0.554, 0.6094, 0.64818, 0.6925, 0.75344, 0.81438, 0.87532, 0.9418, 1.017975, 1.107557, 1.197139, 1.28672, 1.384446]) },
            ],
          },
        ],
      },
      {
        id: "xingqiu-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xingqiu-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.28552, 0.30876, 0.332, 0.3652, 0.38844, 0.415, 0.45152, 0.48804, 0.52456, 0.5644, 0.61005, 0.663734, 0.717419, 0.771103, 0.829668]) },
              { stat: "atk", table: talentTable([0.28552, 0.30876, 0.332, 0.3652, 0.38844, 0.415, 0.45152, 0.48804, 0.52456, 0.5644, 0.61005, 0.663734, 0.717419, 0.771103, 0.829668]) },
            ],
          },
        ],
      },
      {
        id: "xingqiu-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xingqiu-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.55986, 0.60543, 0.651, 0.7161, 0.76167, 0.81375, 0.88536, 0.95697, 1.02858, 1.1067, 1.196212, 1.301479, 1.406746, 1.512013, 1.626849]) },
            ],
          },
        ],
      },
      {
        id: "xingqiu-na-5",
        name: "5-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "xingqiu-na-5-1",
            name: "5-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.35862, 0.38781, 0.417, 0.4587, 0.48789, 0.52125, 0.56712, 0.61299, 0.65886, 0.7089, 0.766237, 0.833666, 0.901095, 0.968524, 1.042083]) },
              { stat: "atk", table: talentTable([0.35862, 0.38781, 0.417, 0.4587, 0.48789, 0.52125, 0.56712, 0.61299, 0.65886, 0.7089, 0.766237, 0.833666, 0.901095, 0.968524, 1.042083]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "xingqiu-charged",
      name: "Guhua Style",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xingqiu-charged-1",
          name: "Charged Attack DMG",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.473, 0.5115, 0.55, 0.605, 0.6435, 0.6875, 0.748, 0.8085, 0.869, 0.935, 1.010625, 1.09956, 1.188495, 1.27743, 1.37445]) },
            { stat: "atk", table: talentTable([0.56158, 0.60729, 0.653, 0.7183, 0.76401, 0.81625, 0.88808, 0.95991, 1.03174, 1.1101, 1.199887, 1.305478, 1.411068, 1.516658, 1.631847]) },
          ],
        },
      ],
    },
  plungeLow:
    {
      id: "xingqiu-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xingqiu-plungeLow-1",
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
      id: "xingqiu-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "xingqiu-plungeHigh-1",
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
      id: "xingqiu-skill",
      name: "Guhua Sword: Fatal Rainscreen",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(21),
      energyCost: 0,
      particles: { count: 5, element: "hydro" },
      instances: [
        {
          id: "xingqiu-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([1.68, 1.806, 1.932, 2.1, 2.226, 2.352, 2.52, 2.688, 2.856, 3.024, 3.192, 3.36, 3.57, 3.78, 3.99]) },
            { stat: "atk", table: talentTable([1.912, 2.0554, 2.1988, 2.39, 2.5334, 2.6768, 2.868, 3.0592, 3.2504, 3.4416, 3.6328, 3.824, 4.063, 4.302, 4.541]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "xingqiu-burst",
      name: "Guhua Sword: Raincutter",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(20),
      energyCost: 80,
      instances: [
        {
          id: "xingqiu-burst-1",
          name: "Sword Rain DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "atk", table: talentTable([0.54272, 0.583424, 0.624128, 0.6784, 0.719104, 0.759808, 0.81408, 0.868352, 0.922624, 0.976896, 1.031168, 1.08544, 1.15328, 1.22112, 1.28896]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "xingqiu-a1", name: "Hydropathic", unlockAscension: 1, effects: [] },
    { id: "xingqiu-a4", name: "Blades Amidst Raindrops", unlockAscension: 4, effects: [] },
    { id: "xingqiu-p3", name: "Flash of Genius", effects: [] },
  ],
  constellations: [
    { level: 1, id: "xingqiu-c1", name: "The Scent Remained", effects: [] },
    { level: 2, id: "xingqiu-c2", name: "Rainbow Upon the Azure Sky", effects: [] },
    { level: 3, id: "xingqiu-c3", name: "Weaver of Verses", effects: [], buffs: [{ id: "xingqiu-c3", source: "Weaver of Verses", sourceCharacterId: "xingqiu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "xingqiu-c4", name: "Evilsoother", effects: [] },
    { level: 5, id: "xingqiu-c5", name: "Embrace of Rain", effects: [], buffs: [{ id: "xingqiu-c5", source: "Embrace of Rain", sourceCharacterId: "xingqiu", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "xingqiu-c6", name: "Hence, Call Them My Own Verses", effects: [] },
  ],
  resources: [],
};

export const yelan: GeneratedCharacter = {
  id: "yelan",
  name: "Yelan",
  element: "hydro",
  weaponType: "bow",
  rarity: 5,
  level: 90,
  ascensionPhase: 6,
  constellationLevel: 0,
  talentLevels: { normal: 10, skill: 10, burst: 10 },
  baseStatCurves: {
    hp: { byLevel: { 1: 1125, 2: 1218, 3: 1312, 4: 1406, 5: 1500, 6: 1594, 7: 1687, 8: 1782, 9: 1876, 10: 1970, 11: 2064, 12: 2159, 13: 2253, 14: 2349, 15: 2443, 16: 2538, 17: 2633, 18: 2728, 19: 2824, 20: 2918, 21: 3978, 22: 4074, 23: 4169, 24: 4265, 25: 4361, 26: 4457, 27: 4553, 28: 4649, 29: 4745, 30: 4841, 31: 4938, 32: 5034, 33: 5131, 34: 5227, 35: 5324, 36: 5421, 37: 5518, 38: 5615, 39: 5712, 40: 5810, 41: 6592, 42: 6689, 43: 6787, 44: 6884, 45: 6982, 46: 7080, 47: 7178, 48: 7276, 49: 7375, 50: 7472, 51: 8484, 52: 8583, 53: 8681, 54: 8780, 55: 8879, 56: 8978, 57: 9077, 58: 9176, 59: 9275, 60: 9374, 61: 10158, 62: 10257, 63: 10357, 64: 10456, 65: 10556, 66: 10656, 67: 10755, 68: 10856, 69: 10956, 70: 11056, 71: 11841, 72: 11942, 73: 12043, 74: 12143, 75: 12244, 76: 12344, 77: 12445, 78: 12547, 79: 12648, 80: 12749, 81: 13536, 82: 13637, 83: 13738, 84: 13839, 85: 13941, 86: 14043, 87: 14144, 88: 14247, 89: 14349, 90: 14450 } },
    atk: { byLevel: { 1: 19, 2: 21, 3: 22, 4: 24, 5: 25, 6: 27, 7: 28, 8: 30, 9: 32, 10: 33, 11: 35, 12: 36, 13: 38, 14: 40, 15: 41, 16: 43, 17: 44, 18: 46, 19: 48, 20: 49, 21: 67, 22: 69, 23: 70, 24: 72, 25: 74, 26: 75, 27: 77, 28: 78, 29: 80, 30: 82, 31: 83, 32: 85, 33: 87, 34: 88, 35: 90, 36: 92, 37: 93, 38: 95, 39: 96, 40: 98, 41: 111, 42: 113, 43: 115, 44: 116, 45: 118, 46: 120, 47: 121, 48: 123, 49: 125, 50: 126, 51: 143, 52: 145, 53: 147, 54: 148, 55: 150, 56: 152, 57: 153, 58: 155, 59: 157, 60: 158, 61: 171, 62: 173, 63: 175, 64: 177, 65: 178, 66: 180, 67: 182, 68: 183, 69: 185, 70: 187, 71: 200, 72: 202, 73: 203, 74: 205, 75: 207, 76: 208, 77: 210, 78: 212, 79: 214, 80: 215, 81: 229, 82: 230, 83: 232, 84: 234, 85: 235, 86: 237, 87: 239, 88: 241, 89: 242, 90: 244 } },
    def: { byLevel: { 1: 43, 2: 46, 3: 50, 4: 53, 5: 57, 6: 60, 7: 64, 8: 68, 9: 71, 10: 75, 11: 78, 12: 82, 13: 85, 14: 89, 15: 93, 16: 96, 17: 100, 18: 103, 19: 107, 20: 111, 21: 151, 22: 154, 23: 158, 24: 162, 25: 165, 26: 169, 27: 173, 28: 176, 29: 180, 30: 184, 31: 187, 32: 191, 33: 195, 34: 198, 35: 202, 36: 206, 37: 209, 38: 213, 39: 217, 40: 220, 41: 250, 42: 254, 43: 257, 44: 261, 45: 265, 46: 268, 47: 272, 48: 276, 49: 280, 50: 283, 51: 322, 52: 325, 53: 329, 54: 333, 55: 337, 56: 340, 57: 344, 58: 348, 59: 352, 60: 355, 61: 385, 62: 389, 63: 393, 64: 397, 65: 400, 66: 404, 67: 408, 68: 412, 69: 415, 70: 419, 71: 449, 72: 453, 73: 457, 74: 460, 75: 464, 76: 468, 77: 472, 78: 476, 79: 480, 80: 483, 81: 513, 82: 517, 83: 521, 84: 525, 85: 529, 86: 533, 87: 536, 88: 540, 89: 544, 90: 548 } },
  },
  ascensionBonus: {
    stat: "critRate",
    valueByPhase: [0, 0, 0, 0, 0, 0, 0.192],
  },
  baseStats: {
    atk: 244,
    hp: 14450,
    def: 548,
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
        id: "yelan-na-1",
        name: "1-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yelan-na-1-1",
            name: "1-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.40678, 0.43989, 0.473, 0.5203, 0.55341, 0.59125, 0.64328, 0.69531, 0.74734, 0.8041, 0.86086, 0.91762, 0.97438, 1.03114, 1.0879]) },
            ],
          },
        ],
      },
      {
        id: "yelan-na-2",
        name: "2-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yelan-na-2-1",
            name: "2-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.39044, 0.42222, 0.454, 0.4994, 0.53118, 0.5675, 0.61744, 0.66738, 0.71732, 0.7718, 0.82628, 0.88076, 0.93524, 0.98972, 1.0442]) },
            ],
          },
        ],
      },
      {
        id: "yelan-na-3",
        name: "3-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yelan-na-3-1",
            name: "3-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.516, 0.558, 0.6, 0.66, 0.702, 0.75, 0.816, 0.882, 0.948, 1.02, 1.092, 1.164, 1.236, 1.308, 1.38]) },
            ],
          },
        ],
      },
      {
        id: "yelan-na-4",
        name: "4-Hit DMG",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "yelan-na-4-1",
            name: "4-Hit DMG",
            damageType: "normal",
            element: "physical",
            scaling: [
              { stat: "atk", table: talentTable([0.32508, 0.35154, 0.378, 0.4158, 0.44226, 0.4725, 0.51408, 0.55566, 0.59724, 0.6426, 0.68796, 0.73332, 0.77868, 0.82404, 0.8694]) },
              { stat: "atk", table: talentTable([0.32508, 0.35154, 0.378, 0.4158, 0.44226, 0.4725, 0.51408, 0.55566, 0.59724, 0.6426, 0.68796, 0.73332, 0.77868, 0.82404, 0.8694]) },
            ],
          },
        ],
      },
    ],
    loops: true,
  },
  chargedAttack:
    {
      id: "yelan-charged",
      name: "Stealthy Bowshot",
      slot: "charged",
      castTime: 0.7,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yelan-charged-1",
          name: "Aimed Shot",
          damageType: "charged",
          element: "physical",
          scaling: [
            { stat: "atk", table: talentTable([0.4386, 0.4743, 0.51, 0.561, 0.5967, 0.6375, 0.6936, 0.7497, 0.8058, 0.867, 0.9282, 0.9894, 1.0506, 1.1118, 1.173]) },
          ],
        },
        {
          id: "yelan-charged-2",
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
      id: "yelan-plungeLow",
      name: "Low Plunge DMG",
      slot: "plungeLow",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yelan-plungeLow-1",
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
      id: "yelan-plungeHigh",
      name: "High Plunge DMG",
      slot: "plungeHigh",
      castTime: 0.6,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [
        {
          id: "yelan-plungeHigh-1",
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
      id: "yelan-skill",
      name: "Lingering Lifeline",
      slot: "skill",
      castTime: 0.8,
      cooldown: flatTalent(10),
      energyCost: 0,
      particles: { count: 4, element: "hydro" },
      instances: [
        {
          id: "yelan-skill-1",
          name: "Skill DMG",
          damageType: "skill",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.226136, 0.243096, 0.260056, 0.28267, 0.29963, 0.31659, 0.339204, 0.361818, 0.384431, 0.407045, 0.429658, 0.452272, 0.480539, 0.508806, 0.537073]) },
          ],
          application: { element: "hydro", gauge: 1 },
        },
      ],
    },
  burst:
    {
      id: "yelan-burst",
      name: "Depth-Clarion Dice",
      slot: "burst",
      castTime: 1.5,
      cooldown: flatTalent(18),
      energyCost: 70,
      instances: [
        {
          id: "yelan-burst-1",
          name: "Skill DMG",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.07308, 0.078561, 0.084042, 0.09135, 0.096831, 0.102312, 0.10962, 0.116928, 0.124236, 0.131544, 0.138852, 0.14616, 0.155295, 0.16443, 0.173565]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "yelan-burst-2-1",
          name: "Exquisite Throw DMG (1/3)",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.04872, 0.052374, 0.056028, 0.0609, 0.064554, 0.068208, 0.07308, 0.077952, 0.082824, 0.087696, 0.092568, 0.09744, 0.10353, 0.10962, 0.11571]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "yelan-burst-2-2",
          name: "Exquisite Throw DMG (2/3)",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.04872, 0.052374, 0.056028, 0.0609, 0.064554, 0.068208, 0.07308, 0.077952, 0.082824, 0.087696, 0.092568, 0.09744, 0.10353, 0.10962, 0.11571]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
        {
          id: "yelan-burst-2-3",
          name: "Exquisite Throw DMG (3/3)",
          damageType: "burst",
          element: "hydro",
          scaling: [
            { stat: "hp", table: talentTable([0.04872, 0.052374, 0.056028, 0.0609, 0.064554, 0.068208, 0.07308, 0.077952, 0.082824, 0.087696, 0.092568, 0.09744, 0.10353, 0.10962, 0.11571]) },
          ],
          application: { element: "hydro", gauge: 2 },
        },
      ],
    },
  passives: [
    { id: "yelan-a1", name: "Turn Control", unlockAscension: 1, effects: [] },
    { id: "yelan-a4", name: "Adapt With Ease", unlockAscension: 4, effects: [] },
    { id: "yelan-p3", name: "Necessary Calculation", effects: [] },
  ],
  constellations: [
    { level: 1, id: "yelan-c1", name: "Enter the Plotters", effects: [] },
    { level: 2, id: "yelan-c2", name: "Taking All Comers", effects: [] },
    { level: 3, id: "yelan-c3", name: "Beware the Trickster's Dice", effects: [], buffs: [{ id: "yelan-c3", source: "Beware the Trickster's Dice", sourceCharacterId: "yelan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "burst", levels: 3 }] }] },
    { level: 4, id: "yelan-c4", name: "Bait-and-Switch", effects: [] },
    { level: 5, id: "yelan-c5", name: "Dealer's Sleight", effects: [], buffs: [{ id: "yelan-c5", source: "Dealer's Sleight", sourceCharacterId: "yelan", startTime: 0, duration: Number.POSITIVE_INFINITY, stacking: { mode: "refresh" }, targets: { scope: "self" }, talentLevelModifiers: [{ slot: "skill", levels: 3 }] }] },
    { level: 6, id: "yelan-c6", name: "Winner Takes All", effects: [] },
  ],
  resources: [],
};

// ---------------------------------------------------------------------------
// UNVERIFIED -- the sources do not publish these; nothing here was guessed.
// TODO: source each item below, or model it explicitly as unsupported.
//   aino.castTime: cast times are engine defaults, not sourced
//   aino.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   aino.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   barbara.burst.instances: burst deals no damage in the source (support/heal burst); emitted with zero damage instances
//   barbara.castTime: cast times are engine defaults, not sourced
//   barbara.constellations: 2 modelled, 6 unimplemented (numbers emitted, no buff channel), 1 unverified (text only) -- see perkEffects.ts
//   barbara.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   barbara.skill.particles: skill particle yield not published by either source
//   candace.castTime: cast times are engine defaults, not sourced
//   candace.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   candace.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   columbina.castTime: cast times are engine defaults, not sourced
//   columbina.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   columbina.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   dahlia.castTime: cast times are engine defaults, not sourced
//   dahlia.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   dahlia.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   furina.castTime: cast times are engine defaults, not sourced
//   furina.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   furina.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   kamisatoAyato.castTime: cast times are engine defaults, not sourced
//   kamisatoAyato.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   kamisatoAyato.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   mona.castTime: cast times are engine defaults, not sourced
//   mona.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 7 unverified (text only) -- see perkEffects.ts
//   mona.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   mualani.castTime: cast times are engine defaults, not sourced
//   mualani.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   mualani.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   neuvillette.castTime: cast times are engine defaults, not sourced
//   neuvillette.constellations: 2 modelled, 3 unimplemented (numbers emitted, no buff channel), 4 unverified (text only) -- see perkEffects.ts
//   neuvillette.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   nilou.castTime: cast times are engine defaults, not sourced
//   nilou.constellations: 2 modelled, 1 unimplemented (numbers emitted, no buff channel), 6 unverified (text only) -- see perkEffects.ts
//   nilou.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sangonomiyaKokomi.castTime: cast times are engine defaults, not sourced
//   sangonomiyaKokomi.constellations: 2 modelled, 7 unimplemented (numbers emitted, no buff channel), 1 unverified (text only) -- see perkEffects.ts
//   sangonomiyaKokomi.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sigewinne.castTime: cast times are engine defaults, not sourced
//   sigewinne.constellations: 2 modelled, 5 unimplemented (numbers emitted, no buff channel), 2 unverified (text only) -- see perkEffects.ts
//   sigewinne.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   sigewinne.skill.particles: skill particle yield not published by either source
//   tartaglia.castTime: cast times are engine defaults, not sourced
//   tartaglia.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   tartaglia.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFHydro.castTime: cast times are engine defaults, not sourced
//   travelerFHydro.constellations: 2 modelled, 6 unimplemented (numbers emitted, no buff channel), 1 unverified (text only) -- see perkEffects.ts
//   travelerFHydro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerFHydro.skill.particles: skill particle yield not published by either source
//   travelerMHydro.castTime: cast times are engine defaults, not sourced
//   travelerMHydro.constellations: 2 modelled, 6 unimplemented (numbers emitted, no buff channel), 1 unverified (text only) -- see perkEffects.ts
//   travelerMHydro.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   travelerMHydro.skill.particles: skill particle yield not published by either source
//   xingqiu.castTime: cast times are engine defaults, not sourced
//   xingqiu.constellations: 2 modelled, 4 unimplemented (numbers emitted, no buff channel), 3 unverified (text only) -- see perkEffects.ts
//   xingqiu.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
//   yelan.castTime: cast times are engine defaults, not sourced
//   yelan.constellations: 2 modelled, 2 unimplemented (numbers emitted, no buff channel), 5 unverified (text only) -- see perkEffects.ts
//   yelan.resources: stacks/stances are not declared: neither source publishes an initial value or a cap for them
// ---------------------------------------------------------------------------

export const hydroGeneratedCharacters: readonly GeneratedCharacter[] = [
  aino,
  barbara,
  candace,
  columbina,
  dahlia,
  furina,
  kamisatoAyato,
  mona,
  mualani,
  neuvillette,
  nilou,
  sangonomiyaKokomi,
  sigewinne,
  tartaglia,
  travelerFHydro,
  travelerMHydro,
  xingqiu,
  yelan,
];
