import type { WeaponDefinition } from "./types";

export const weaponsData: readonly WeaponDefinition[] = [
  {
    "id": "whitelakefrostfeather",
    "name": "Whitelake Frostfeather",
    "nameZh": "白湖霜羽",
    "weaponType": "sword",
    "rarity": 5,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ec/Weapon_Whitelake_Frostfeather.png/revision/latest/scale-to-width-down/60?cb=20260812163243",
    "passive": {
      "name": "Snow Swan's Finale",
      "desc": "When the equipping character hits an opponent with their Elemental Skill, they gain \"Lake-Hued Lament\": ATK increases by 8~16% for 8s. This effect can trigger once every 0.1s. Max 3 stacks, and each stack's duration is independent.At 3 stacks, the CRIT DMG of any Stellar Glimmer reaction DMG caused by the equipping character is increased by 50~110%, and triggering Stellar Glimmer reactions or Stellar Glimmer reaction DMG will also restore 4~6 Elemental Energy to the character. This Energy recovery effect can trigger once every 3.5s.This effect can be triggered even when the equipping character is off-field."
    }
  },
  {
    "id": "exaiphanesblade",
    "name": "Exaiphanes Blade",
    "nameZh": "埃克塞法涅斯之剑",
    "weaponType": "sword",
    "rarity": 5,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Weapon_Exaiphanes_Blade.png/revision/latest/scale-to-width-down/60?cb=20260812163111",
    "passive": {
      "name": "Traveler's Path",
      "desc": "When the Traveler equips this, their ATK will increase by 16% for 8s after they hit an opponent. At the same time, they will also regenerate 3 Elemental Energy~CRIT DMG increases by ?% for every Element they have resonated with. Additionally, the Traveler's ATK will also increase by ?% for ?s, and regenerate ? Elemental Energy, after they attack and hit an opponent. This effect can trigger once every 5~?s. This can be triggered even when the character is not on the field."
    }
  },
  {
    "id": "ateaspoonoftranscendence",
    "name": "A Teaspoon of Transcendence",
    "nameZh": "超然茶匙",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "Luna VIII",
    "versionWeight": 680,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c4/Weapon_A_Teaspoon_of_Transcendence.png/revision/latest/scale-to-width-down/60?cb=20260701054412",
    "passive": {
      "name": "White Fairy's Queening",
      "desc": "ATK increased by 28~56%.Additionally, each time the equipping character hits an opponent with their Charged Attack, they attain \"Surmount\" for a short time: their Stellar-Conduct and Stellar Swirl DMG is increased by 16~32% for 5s. This effect can stack once every 0.2s, max 3 stacks."
    }
  },
  {
    "id": "angelosheptades",
    "name": "Angelos' Heptades",
    "nameZh": "天使的七重奏",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "Luna VII",
    "versionWeight": 670,
    "baseAtk": 741,
    "subStat": {
      "type": "atkPercent",
      "value": 0.165,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/3d/Weapon_Angelos%27_Heptades.png/revision/latest/scale-to-width-down/60?cb=20260520092859",
    "passive": {
      "name": "Crown of the Final Scion",
      "desc": "ATK is increased by 12~24%. After the equipping character creates a Shield, they gain \"Pathfinder's Light\" for 20s: Increases your active party member's DMG by 10~22% for every 1,000 ATK the equipping character has, up to a maximum of 26~58%. Additionally, when the equipping character creates a Shield, they will also gain \"Guide's Contentment\": Restores 14~18 Elemental Energy to the equipping character. The aforementioned effect can trigger once every 14s, and can also be triggered when any type of chest is opened outside of combat. The equipping character may trigger this effect even when they are an off-field.Hexerei: Secret Rite: When your own Hexerei character is off-field in the party, they will also gain 50% of the DMG increase from Pathfinder's Light."
    }
  },
  {
    "id": "disasterandremorse",
    "name": "Disaster and Remorse",
    "nameZh": "灾厄与懊悔",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "Luna VII",
    "versionWeight": 670,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Weapon_Disaster_and_Remorse.png/revision/latest/scale-to-width-down/60?cb=20260609131032",
    "passive": {
      "name": "Dolorous Stroke",
      "desc": "After the equipping character uses an Elemental Skill, they gain \"Path of Conflict\" for 17s, as well as \"Unforgivable\" and \"Irreparable\" for 3s each. This effect can trigger once every 18s.Unforgivable: Increases the equipping character's Normal Attack and Charged Attack DMG by 40~80%.Irreparable: Increases the equipping character's Elemental Skill and Elemental Burst DMG by 40~80%.While Path of Conflict is in effect, when the equipping character hits an opponent with a Normal Attack or Charged Attack, Irreparable's duration will be increased by 1s. When the equipping character hits an opponent with their Elemental Skill or Elemental Burst, Unforgivable's duration will be increased by 1s. Each of the above effects can be triggered once every 0.1s. When Path of Conflict ends or the equipping character leaves the field, both Unforgivable and Irreparable will be removed.Hexerei: Secret Rite: The above DMG boosts are increased by 75%."
    }
  },
  {
    "id": "goldenfrostboundoath",
    "name": "Golden Frostbound Oath",
    "nameZh": "金色霜缚之誓",
    "weaponType": "bow",
    "rarity": 5,
    "version": "Luna VI",
    "versionWeight": 660,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c8/Weapon_Golden_Frostbound_Oath.png/revision/latest/scale-to-width-down/60?cb=20260408171816",
    "passive": {
      "name": "Dawn's Salutation Returned",
      "desc": "Increases DEF by 16~32%. When the equipping character's Elemental Skill or Lunar-Crystallize attack(s) hits enemies, gain the Frost Fae's Favor effect for 6s: Geo DMG inflicted by the equipping character increases by 40~80%, Lunar-Crystallize Reaction DMG increases by 40~80%.While this effect is active, if there are Moondrifts near the equipping character, all other nearby party members Will gain the Frost Fae's Mischief effect: Geo DMG dealt increases by 20~40% and Lunar-Crystallize Reaction DMG increases by 20~40%. This effect can be triggered even when the equipping character is off-field."
    }
  },
  {
    "id": "gestofthemightywolf",
    "name": "Gest of the Mighty Wolf",
    "nameZh": "巨狼的功业",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "Luna V",
    "versionWeight": 650,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/3b/Weapon_Gest_of_the_Mighty_Wolf.png/revision/latest/scale-to-width-down/60?cb=20260225040155",
    "passive": {
      "name": "Indomitable Chivalry",
      "desc": "Increase ATK SPD by 10%. Every time the equipping character's Normal Attack(s) hit opponent(s), when they cast their Elemental Skill, or when they begin their Charged Attack(s), gain 1/2/2 stacks of Four Winds' Hymn respectively: DMG dealt is increased by 7.5~15.5%, for 4s. Max 4 stacks. This effect can be triggered once every 0.01s.Additionally, when the team has the \"Hexerei: Secret Rite\" effect, each stack of Four Winds' Hymn will increase the CRIT DMG of the equipping character by 7.5~15.5%."
    }
  },
  {
    "id": "nocturnescurtaincall",
    "name": "Nocturne's Curtain Call",
    "nameZh": "夜曲谢幕",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "Luna IV",
    "versionWeight": 640,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/24/Weapon_Nocturne%27s_Curtain_Call.png/revision/latest/scale-to-width-down/60?cb=20260223141109",
    "passive": {
      "name": "Ballad of the Crossroads",
      "desc": "Max HP increases by 10~18%. When triggering Lunar reactions or inflicting Lunar Reaction DMG on opponents, the equipping character will recover 14~18 Energy, and receive the Bountiful Sea's Sacred Wine effect for 12s: Max HP increases by an additional 14~22%, CRIT DMG from Lunar Reaction DMG increases by 60~140%. The Energy recovery effect can be triggered at most once every 18s, and can be triggered even when the equipping character is off-field."
    }
  },
  {
    "id": "lightbearingmoonshard",
    "name": "Lightbearing Moonshard",
    "nameZh": "载光月屑",
    "weaponType": "sword",
    "rarity": 5,
    "version": "Luna IV",
    "versionWeight": 640,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f6/Weapon_Lightbearing_Moonshard.png/revision/latest/scale-to-width-down/60?cb=20260203180102",
    "passive": {
      "name": "Legacy of Lang-Gan",
      "desc": "Increases DEF by 20~40%. DMG inflicted by Lunar-Crystallize reactions increases by 64~128% for 5s after the equipping character uses an Elemental Skill."
    }
  },
  {
    "id": "thedaybreakchronicles",
    "name": "The Daybreak Chronicles",
    "nameZh": "黎明纪事",
    "weaponType": "bow",
    "rarity": 5,
    "version": "Luna III",
    "versionWeight": 630,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/5c/Weapon_The_Daybreak_Chronicles.png/revision/latest/scale-to-width-down/60?cb=20251208172450",
    "passive": {
      "name": "Dawning Song of Daybreak",
      "desc": "The equipping character gains Stirring Dawn Breeze: 3s after leaving combat, Normal Attack, Elemental Skill, and Elemental Burst DMG is increased by 60~120%. While in combat, this DMG Bonus will decrease by 10~20% per second until it reaches 0%. When the equipping character's Normal Attacks, Elemental Skills, or Elemental Bursts hit an opponent, the DMG Bonus for the corresponding DMG type is increased by 10~20% until it reaches 60~120%. This effect can be triggered once every 0.1s for each of the attack types mentioned above. This effect can be triggered even if the equipping character is off-field.Additionally, when the party possesses Hexerei: Secret Rite effects, when the equipping character's Normal Attacks, Elemental Skills, or Elemental Bursts hit an opponent, the DMG Bonus for all these DMG types is increased by 20~40% instead."
    }
  },
  {
    "id": "athameartis",
    "name": "Athame Artis",
    "nameZh": "艺者之匕",
    "weaponType": "sword",
    "rarity": 5,
    "version": "Luna III",
    "versionWeight": 630,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/83/Weapon_Athame_Artis.png/revision/latest/scale-to-width-down/60?cb=20251203231213",
    "passive": {
      "name": "Day King's Splendor Solis",
      "desc": "CRIT DMG from Elemental Bursts is increased by 16~32%. When an Elemental Burst hits an opponent, gain the Blade of the Daylight Hours effect: ATK is increased by 20~40%. Nearby active party members other than the equipping character have their ATK increased by 16~32% for 3s.Additionally, when the party possesses Hexerei: Secret Rite effects, the effects of Blade of the Daylight Hours are increased by an additional 75%. This effect can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "reliquaryoftruth",
    "name": "Reliquary of Truth",
    "nameZh": "真理圣匣",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "Luna II",
    "versionWeight": 620,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/86/Weapon_Reliquary_of_Truth.png/revision/latest/scale-to-width-down/60?cb=20251022123903",
    "passive": {
      "name": "Essence of Falsity",
      "desc": "CRIT Rate is increased by 8~16%. When the equipping character unleashes an Elemental Skill, they gain the Secret of Lies effect: Elemental Mastery is increased by 80~160 for 12s. When the equipping character deals Lunar-Bloom DMG to an opponent, they gain the Moon of Truth effect: CRIT DMG is increased by 24~48% for 4s. When both the Secret of Lies and Moon of Truth effects are active at the same time, the results of both effects will be increased by 50%."
    }
  },
  {
    "id": "bloodsoakedruins",
    "name": "Bloodsoaked Ruins",
    "nameZh": "血染遗迹",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/79/Weapon_Bloodsoaked_Ruins.png/revision/latest/scale-to-width-down/60?cb=20250930222728",
    "passive": {
      "name": "Mournful Tribute",
      "desc": "For 3.5s after using an Elemental Burst, the equipping character's Lunar-Charged DMG dealt to opponents is increased by 36~84%. Additionally, after triggering a Lunar-Charged reaction, the equipping character will gain Requiem of Ruin: CRIT DMG is increased by 28~56% for 6s. They will also regain 12~16 Elemental Energy. Elemental Energy can be restored this way once every 14s."
    }
  },
  {
    "id": "nightweaverslookingglass",
    "name": "Nightweaver's Looking Glass",
    "nameZh": "织夜者的窥镜",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 542,
    "subStat": {
      "type": "elementalMastery",
      "value": 265,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a7/Weapon_Nightweaver%27s_Looking_Glass.png/revision/latest/scale-to-width-down/60?cb=20250910053737",
    "passive": {
      "name": "Millennial Hymn",
      "desc": "When the equipping character's Elemental Skill deals Hydro or Dendro DMG, they will gain Prayer of the Far North: Elemental Mastery is increased by 60~120 for 4.5s. When nearby party members trigger Lunar-Bloom reactions, the equipping character gains New Moon Verse: Elemental Mastery is increased by 60~120 for 10s. When both Prayer of the Far North and New Moon Verse are in effect, all nearby party members' Bloom DMG is increased by 120~240%, their Hyperbloom and Burgeon DMG is increased by 80~160%, and their Lunar-Bloom DMG is increased by 40~80%. This effect cannot stack. The aforementioned effects can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "fracturedhalo",
    "name": "Fractured Halo",
    "nameZh": "碎裂光环",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "5.8",
    "versionWeight": 580,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Weapon_Fractured_Halo.png/revision/latest/scale-to-width-down/60?cb=20250730033114",
    "passive": {
      "name": "Purifying Crown",
      "desc": "After an Elemental Skill or Elemental Burst is used, ATK is increased by 24~48% for 20s. If the equipping character creates a Shield while this effect is active, they will gain the Electrifying Edict effect for 20s: All nearby party members deal 40~80% more Lunar-Charged DMG."
    }
  },
  {
    "id": "azurelight",
    "name": "Azurelight",
    "nameZh": "苍穹之光",
    "weaponType": "sword",
    "rarity": 5,
    "version": "5.7",
    "versionWeight": 570,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/bd/Weapon_Azurelight.png/revision/latest/scale-to-width-down/60?cb=20250618034648",
    "passive": {
      "name": "Whitehill's Bestowal",
      "desc": "Within 12s after an Elemental Skill is used, ATK is increased by 24~48%. During this time, when the equipping character has 0 Energy, ATK will be further increased by 24~48%, and CRIT DMG will be increased by 40~80%."
    }
  },
  {
    "id": "symphonistofscents",
    "name": "Symphonist of Scents",
    "nameZh": "香氛交响家",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "5.6",
    "versionWeight": 560,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/5d/Weapon_Symphonist_of_Scents.png/revision/latest/scale-to-width-down/60?cb=20250507052735",
    "passive": {
      "name": "Seasoned Symphony",
      "desc": "ATK is increased by 12~24%. When the equipping character is off-field, ATK is increased by an additional 12~24%. After initiating healing, the equipping character and the character(s) they have healed will obtain the \"Sweet Echoes\" effect, increasing their ATK by 32~64% for 3s. This effect can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "vividnotions",
    "name": "Vivid Notions",
    "nameZh": "生动构想",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "5.5",
    "versionWeight": 550,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/63/Weapon_Vivid_Notions.png/revision/latest/scale-to-width-down/60?cb=20250326200027",
    "passive": {
      "name": "Falling Rainbow's Wish",
      "desc": "ATK is increased by 28~56%. When you use a Plunging Attack, you will gain the \"Dawn's First Hue\" effect: Plunging Attack CRIT DMG is increased by 28~56%. When you use an Elemental Skill or Burst, you will gain the \"Twilight's Splendor\" effect: Plunging Attack CRIT DMG is increased by 40~80%. The two effects above each last for 15s, and will be canceled 0.1s after the ground impact hits a target."
    }
  },
  {
    "id": "sunnymorningsleepin",
    "name": "Sunny Morning Sleep-In",
    "nameZh": "晨曦浅眠",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "5.4",
    "versionWeight": 540,
    "baseAtk": 542,
    "subStat": {
      "type": "elementalMastery",
      "value": 265,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/91/Weapon_Sunny_Morning_Sleep-In.png/revision/latest/scale-to-width-down/60?cb=20250212014640",
    "passive": {
      "name": "Bathhouses, Hawks, and Narukami",
      "desc": "Elemental Mastery increases by 120~240 for 6s after triggering Swirl. Elemental Mastery increases by 96~192 for 9s after the wielder's Elemental Skill hits an opponent. Elemental Mastery increases by 32~64 for 30s after the wielder's Elemental Burst hits an opponent."
    }
  },
  {
    "id": "athousandblazingsuns",
    "name": "A Thousand Blazing Suns",
    "nameZh": "炽烈千阳",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "5.3",
    "versionWeight": 530,
    "baseAtk": 741,
    "subStat": {
      "type": "critRate",
      "value": 0.11,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Weapon_A_Thousand_Blazing_Suns.png/revision/latest/scale-to-width-down/60?cb=20250102021247",
    "passive": {
      "name": "Sunset Reignites the Dawn",
      "desc": "Gain the \"Scorching Brilliance\" effect when using an Elemental Skill or Burst: CRIT DMG increased by 20~40% and ATK increased by 28~56% for 6s. This effect can trigger once every 10s.While a \"Scorching Brilliance\" instance is active, its duration is increased by 2s after Normal or Charged attacks deal Elemental DMG. This effect can trigger once every second, and the max duration increase is 6s.Additionally, when the equipping character is in the Nightsoul's Blessing state, \"Scorching Brilliance\" effects are increased by 75%, and its duration will not count down when the equipping character is off—field."
    }
  },
  {
    "id": "starcallerswatch",
    "name": "Starcaller's Watch",
    "nameZh": "呼星者的怀表",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "5.3",
    "versionWeight": 530,
    "baseAtk": 542,
    "subStat": {
      "type": "elementalMastery",
      "value": 265,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a4/Weapon_Starcaller%27s_Watch.png/revision/latest/scale-to-width-down/60?cb=20250102021801",
    "passive": {
      "name": "Offering Unto Wind and Sun",
      "desc": "Increases Elemental Mastery by 100~200. Gain the \"Mirror of Night\" effect within 15s after the equipping character creates a shield: The current active party member deals 28~56% increased DMG to nearby opponents. You can gain the \"Mirror of Night\" effect once every 14s."
    }
  },
  {
    "id": "astralvulturescrimsonplumage",
    "name": "Astral Vulture's Crimson Plumage",
    "nameZh": "星鹫赤羽",
    "weaponType": "bow",
    "rarity": 5,
    "version": "5.2",
    "versionWeight": 520,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/97/Weapon_Astral_Vulture%27s_Crimson_Plumage.png/revision/latest/scale-to-width-down/60?cb=20241123040025",
    "passive": {
      "name": "The Moonring Sighted",
      "desc": "For 12s after triggering a Swirl reaction, ATK increases by 24~48%. In addition, when 1/2 or more characters in the party are of a different Elemental Type from the equipping character, the DMG dealt by the equipping character's Charged Attacks is increased by 20/48~40/96% and Elemental Burst DMG dealt is increased by 10/24~20/48%."
    }
  },
  {
    "id": "peakpatrolsong",
    "name": "Peak Patrol Song",
    "nameZh": "岩峰巡歌",
    "weaponType": "sword",
    "rarity": 5,
    "version": "5.1",
    "versionWeight": 510,
    "baseAtk": 542,
    "subStat": {
      "type": "defPercent",
      "value": 0.8270000000000001,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b4/Weapon_Peak_Patrol_Song.png/revision/latest/scale-to-width-down/60?cb=20241009015437",
    "passive": {
      "name": "Halcyon Years Unending",
      "desc": "Gain \"Ode to Flowers\" after Normal or Plunging Attacks hit an opponent: DEF increases by 8~16% and gain a 10~20% All Elemental DMG Bonus for 6s. Max 2 stacks. Can trigger once per 0.1s. When this effect reaches 2 stacks or the 2nd stack's duration is refreshed, increase all nearby party members' All Elemental DMG Bonus by 8~16% for every 1,000 DEF the equipping character has, up to a maximum of 25.6~51.2%, for 15s."
    }
  },
  {
    "id": "fangofthemountainking",
    "name": "Fang of the Mountain King",
    "nameZh": "山王之牙",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 741,
    "subStat": {
      "type": "critRate",
      "value": 0.11,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/35/Weapon_Fang_of_the_Mountain_King.png/revision/latest/scale-to-width-down/60?cb=20240919114417",
    "passive": {
      "name": "Turquoise Hunt",
      "desc": "Gain 1 stack of Canopy's Favor after hitting an opponent with an Elemental Skill. This can be triggered once every 0.5s. After a nearby party member triggers a Burning or Burgeon reaction, the equipping character will gain 3 stacks. This effect can be triggered once every 2s and can be triggered even when the triggering party member is off-field. Canopy's Favor: Elemental Skill and Burst DMG is increased by 10~20% for 6s. Max 6 stacks. Each stack is counted independently."
    }
  },
  {
    "id": "surfsup",
    "name": "Surf's Up",
    "nameZh": "冲浪时光",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8a/Weapon_Surf%27s_Up.png/revision/latest/scale-to-width-down/60?cb=20240914112415",
    "passive": {
      "name": "Aqua Remembrance",
      "desc": "Max HP increased by 20~40%. Once every 15s, for the 14s after using an Elemental Skill: Gain 4 Scorching Summer stacks. Each stack increases Normal Attack DMG by 12~24%. For the duration of the effect, every 1.5s, lose 1 stack after a Normal Attack hits an opponent; once every 1.5s, gain 1 stack after triggering a Vaporize reaction on an opponent. Max 4 Scorching Summer stacks."
    }
  },
  {
    "id": "lumidouceelegy",
    "name": "Lumidouce Elegy",
    "nameZh": "柔灯挽歌",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "4.8",
    "versionWeight": 480,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8e/Weapon_Lumidouce_Elegy.png/revision/latest/scale-to-width-down/60?cb=20240819223150",
    "passive": {
      "name": "Bright Dawn Overture",
      "desc": "ATK increased by 15~31%. After the equipping character triggers Burning on an opponent or deals Dendro DMG to Burning opponents, the DMG dealt is increased by 18~38%. This effect lasts for 8s, max 2 stacks. When 2 stacks are reached or when the duration is refreshed at 2 stacks, restore 12~16 Energy. Energy can be restored this way once every 12s. The 2 aforementioned effects can be triggered even when the character is off-field."
    }
  },
  {
    "id": "absolution",
    "name": "Absolution",
    "nameZh": "赦罪",
    "weaponType": "sword",
    "rarity": 5,
    "version": "4.7",
    "versionWeight": 470,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/5f/Weapon_Absolution.png/revision/latest/scale-to-width-down/60?cb=20240605052700",
    "passive": {
      "name": "Deathly Pact",
      "desc": "CRIT DMG increased by 20~40%. Increasing the value of a Bond of Life increases the DMG the equipping character deals by 16~32% for 6s. Max 3 stacks."
    }
  },
  {
    "id": "silvershowerheartstrings",
    "name": "Silvershower Heartstrings",
    "nameZh": "白雨心弦",
    "weaponType": "bow",
    "rarity": 5,
    "version": "4.7",
    "versionWeight": 470,
    "baseAtk": 542,
    "subStat": {
      "type": "hpPercent",
      "value": 0.662,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/41/Weapon_Silvershower_Heartstrings.png/revision/latest/scale-to-width-down/60?cb=20240625110525",
    "passive": {
      "name": "Dryas's Nocturne",
      "desc": "The equipping character can gain the Remedy effect. When they possess 1/2/3 Remedy stacks, Max HP will increase by 12/24/40~24/48/80. 1 stack may be gained when the following conditions are met: 1 stack for 25s when using an Elemental Skill; 1 stack for 25s when the value of a Bond of Life value increases; 1 stack for 20s for performing healing. Stacks can still be triggered when the equipping character is not on the field. Each stack's duration is counted independently. In addition, when 3 stacks are active, Elemental Burst CRIT Rate will be increased by 28~56. This effect will be canceled 4s after falling under 3 stacks."
    }
  },
  {
    "id": "crimsonmoonssemblance",
    "name": "Crimson Moon's Semblance",
    "nameZh": "赤月之形",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "4.6",
    "versionWeight": 460,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/82/Weapon_Crimson_Moon%27s_Semblance.png/revision/latest/scale-to-width-down/60?cb=20240424233354",
    "passive": {
      "name": "Ashen Sun's Shadow",
      "desc": "Grants a Bond of Life equal to 25% of Max HP when a Charged Attack hits an opponent. This effect can be triggered up to once every 14s. In addition, when the equipping character has a Bond of Life, they gain a 12~28% DMG Bonus; if the value of the Bond of Life is greater than or equal to 30% of Max HP, then gain an additional 24~56% DMG."
    }
  },
  {
    "id": "urakumisugiri",
    "name": "Uraku Misugiri",
    "nameZh": "有乐御簾切",
    "weaponType": "sword",
    "rarity": 5,
    "version": "4.5",
    "versionWeight": 450,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Weapon_Uraku_Misugiri.png/revision/latest/scale-to-width-down/60?cb=20240313020744",
    "passive": {
      "name": "Brocade Bloom, Shrine Sword",
      "desc": "Normal Attack DMG is increased by 16~32% and Elemental Skill DMG is increased by 24~48%. After a nearby active character deals Geo DMG, the aforementioned effects increase by 100% for 15s. Additionally, the wielder's DEF is increased by 20~40%."
    }
  },
  {
    "id": "cranesechoingcall",
    "name": "Crane's Echoing Call",
    "nameZh": "鹤鸣余音",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "4.4",
    "versionWeight": 440,
    "baseAtk": 741,
    "subStat": {
      "type": "atkPercent",
      "value": 0.165,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/61/Weapon_Crane%27s_Echoing_Call.png/revision/latest/scale-to-width-down/60?cb=20240201122314",
    "passive": {
      "name": "Cloudfall Axiom",
      "desc": "After the equipping character hits an opponent with a Plunging Attack, all nearby party members' Plunging Attacks will deal 28~80% increased DMG for 20s. When nearby party members hit opponents with Plunging Attacks, they will restore 2.5~3.5 Energy to the equipping character. Energy can be restored this way every 0.7s. This energy regain effect can be triggered even if the equipping character is not on the field."
    }
  },
  {
    "id": "verdict",
    "name": "Verdict",
    "nameZh": "裁断",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "4.3",
    "versionWeight": 430,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1d/Weapon_Verdict.png/revision/latest/scale-to-width-down/60?cb=20231220030158",
    "passive": {
      "name": "Many Oaths of Dawn and Dusk",
      "desc": "Increases ATK by 20~40%. When characters in your party obtain Elemental Shards from Crystallize or trigger Lunar-Crystallize reactions, the equipping character will gain 1 Seal, increasing Elemental Skill DMG by 18~36%. The Seal lasts for 15s, and the equipped may have up to 2 Seals at once. All of the equipper's Seals will disappear 0.2s after their Elemental Skill deals DMG. Up to 1 Seal may be obtained every second through the Lunar-Crystallize reaction."
    }
  },
  {
    "id": "splendoroftranquilwaters",
    "name": "Splendor of Tranquil Waters",
    "nameZh": "静水流涌之辉",
    "weaponType": "sword",
    "rarity": 5,
    "version": "4.2",
    "versionWeight": 420,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/4f/Weapon_Splendor_of_Tranquil_Waters.png/revision/latest/scale-to-width-down/60?cb=20231221072120",
    "passive": {
      "name": "Dawn and Dusk by the Lake",
      "desc": "When the equipping character's current HP increases or decreases, Elemental Skill DMG dealt will be increased by 8~16% for 6s. Max 3 stacks. This effect can be triggered once every 0.2s. When other party members' current HP increases or decreases, the equipping character's Max HP will be increased by 14~28% for 6s. Max 2 stacks. This effect can be triggered once every 0.2s. The aforementioned effects can be triggered even if the wielder is off-field."
    }
  },
  {
    "id": "cashflowsupervision",
    "name": "Cashflow Supervision",
    "nameZh": "金流监督",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f2/Weapon_Cashflow_Supervision.png/revision/latest/scale-to-width-down/60?cb=20231017112141",
    "passive": {
      "name": "Golden Blood-Tide",
      "desc": "ATK is increased by 16~32%. When current HP increases or decreases, Normal Attack DMG is increased by 16~32%, Charged Attack DMG is increased by 14~28%, and Stellar-Conduct DMG is increased by 14~28% for 4s. Max 3 stacks. This effect can be triggered once every 0.3s. When the wielder has 3 stacks, ATK SPD will be increased by 8~16%."
    }
  },
  {
    "id": "tomeoftheeternalflow",
    "name": "Tome of the Eternal Flow",
    "nameZh": "万世流涌大典",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/91/Weapon_Tome_of_the_Eternal_Flow.png/revision/latest/scale-to-width-down/60?cb=20230927120830",
    "passive": {
      "name": "Aeon Wave",
      "desc": "HP is increased by 16~32%. When current HP increases or decreases, Charged Attack DMG will be increased by 14~30% for 4s. Max 3 stacks, can be triggered once every 0.3s. When you have 3 stacks or refresh a third stack's duration, 8~12 Energy will be restored. This Energy restoration effect can be triggered once every 12s."
    }
  },
  {
    "id": "thefirstgreatmagic",
    "name": "The First Great Magic",
    "nameZh": "最初的大魔术",
    "weaponType": "bow",
    "rarity": 5,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/03/Weapon_The_First_Great_Magic.png/revision/latest/scale-to-width-down/60?cb=20230817015113",
    "passive": {
      "name": "Parsifal the Great",
      "desc": "DMG dealt by Charged Attacks increased by 16~32%. For every party member with the same Elemental Type as the wielder (including the wielder themselves), gain 1 Gimmick stack. For every party member with a different Elemental Type from the wielder, gain 1 Theatrics stack. When the wielder has 1/2/3 or more Gimmick stacks, ATK will be increased by 16/32/48~32/64/96%. When the wielder has 1/2/3 or more Theatrics stacks, Movement SPD will be increased by 4/7/10~12/15/18%."
    }
  },
  {
    "id": "jadefallssplendor",
    "name": "Jadefall's Splendor",
    "nameZh": "碧落之珑",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "3.6",
    "versionWeight": 360,
    "baseAtk": 608,
    "subStat": {
      "type": "hpPercent",
      "value": 0.496,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/7a/Weapon_Jadefall%27s_Splendor.png/revision/latest/scale-to-width-down/60?cb=20231219232643",
    "passive": {
      "name": "Primordial Jade Regalia",
      "desc": "For 3s after using an Elemental Burst or creating a shield, the equipping character can gain the Primordial Jade Regalia effect: Restore 4.5~6.5 Energy every 2.5s, and gain 0.3~1.1% Elemental DMG Bonus for their corresponding Elemental Type for every 1,000 Max HP they possess, up to 12~44%. Primordial Jade Regalia will still take effect even if the equipping character is not on the field."
    }
  },
  {
    "id": "beaconofthereedsea",
    "name": "Beacon of the Reed Sea",
    "nameZh": "苇海信标",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "3.5",
    "versionWeight": 350,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6c/Weapon_Beacon_of_the_Reed_Sea.png/revision/latest/scale-to-width-down/60?cb=20231219232124",
    "passive": {
      "name": "Desert Watch",
      "desc": "After the character's Elemental Skill hits an opponent, their ATK will be increased by 20~40% for 8s. After the character takes DMG, their ATK will be increased by 20~40% for 8s. The 2 aforementioned effects can be triggered even when the character is not on the field. Additionally, when not protected by a shield, the character's Max HP will be increased by 32~64%."
    }
  },
  {
    "id": "lightoffoliarincision",
    "name": "Light of Foliar Incision",
    "nameZh": "裁叶萃光",
    "weaponType": "sword",
    "rarity": 5,
    "version": "3.4",
    "versionWeight": 340,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/de/Weapon_Light_of_Foliar_Incision.png/revision/latest/scale-to-width-down/60?cb=20230120084947",
    "passive": {
      "name": "Whitemoon Bristle",
      "desc": "CRIT Rate is increased by 4~8%. After Normal Attacks deal Elemental DMG, the Foliar Incision effect will be obtained, increasing DMG dealt by Normal Attacks and Elemental Skills by 120~240% of Elemental Mastery. This effect will disappear after 28 DMG instances or 12s. You can obtain Foliar Incision once every 12s."
    }
  },
  {
    "id": "tulaytullahsremembrance",
    "name": "Tulaytullah's Remembrance",
    "nameZh": "图莱杜拉的回忆",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "3.3",
    "versionWeight": 330,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/fc/Weapon_Tulaytullah%27s_Remembrance.png/revision/latest/scale-to-width-down/60?cb=20231219233255",
    "passive": {
      "name": "Bygone Azure Teardrop",
      "desc": "Normal Attack SPD is increased by 10~20%. After the wielder unleashes an Elemental Skill, Normal Attack DMG will increase by 4.8~9.6% every second for 14s. After this character hits an opponent with a Normal Attack during this duration, Normal Attack DMG will be increased by 9.6~19.2%. This increase can be triggered once every 0.3s. The maximum Normal Attack DMG increase per single duration of the overall effect is 48~96%. The effect will be removed when the wielder leaves the field, and using the Elemental Skill again will reset all DMG buffs."
    }
  },
  {
    "id": "athousandfloatingdreams",
    "name": "A Thousand Floating Dreams",
    "nameZh": "千夜浮梦",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "3.2",
    "versionWeight": 320,
    "baseAtk": 542,
    "subStat": {
      "type": "elementalMastery",
      "value": 265,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/4c/Weapon_A_Thousand_Floating_Dreams.png/revision/latest/scale-to-width-down/60?cb=20221102030910",
    "passive": {
      "name": "A Thousand Nights' Dawnsong",
      "desc": "Party members other than the equipping character will provide the equipping character with buffs based on whether their Elemental Type is the same as the latter or not. If their Elemental Types are the same, increase Elemental Mastery by 32~64. If not, increase the equipping character's DMG Bonus from their Elemental Type by 10~26%. Each of the aforementioned effects can have up to 3 stacks. Additionally, all nearby party members other than the equipping character will have their Elemental Mastery increased by 40~48. Multiple such effects from multiple such weapons can stack."
    }
  },
  {
    "id": "staffofthescarletsands",
    "name": "Staff of the Scarlet Sands",
    "nameZh": "赤沙之杖",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 542,
    "subStat": {
      "type": "critRate",
      "value": 0.441,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Weapon_Staff_of_the_Scarlet_Sands.png/revision/latest/scale-to-width-down/60?cb=20231219233121",
    "passive": {
      "name": "Heat Haze at Horizon's End",
      "desc": "The equipping character gains 52~104% of their Elemental Mastery as bonus ATK. When an Elemental Skill hits opponents, the Dream of the Scarlet Sands effect will be gained for 10s: The equipping character will gain 28~56% of their Elemental Mastery as bonus ATK. Max 3 stacks."
    }
  },
  {
    "id": "keyofkhajnisut",
    "name": "Key of Khaj-Nisut",
    "nameZh": "圣显之钥",
    "weaponType": "sword",
    "rarity": 5,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 542,
    "subStat": {
      "type": "hpPercent",
      "value": 0.662,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/52/Weapon_Key_of_Khaj-Nisut.png/revision/latest/scale-to-width-down/60?cb=20231219232736",
    "passive": {
      "name": "Sunken Song of the Sands",
      "desc": "HP increased by 20~40%. When an Elemental Skill hits opponents, you gain the Grand Hymn effect for 20s. This effect increases the equipping character's Elemental Mastery by 0.12~0.24% of their Max HP. This effect can trigger once every 0.3s. Max 3 stacks. When this effect gains 3 stacks, or when the third stack's duration is refreshed, the Elemental Mastery of all nearby party members will be increased by 0.2~0.4% of the equipping character's max HP for 20s."
    }
  },
  {
    "id": "hunterspath",
    "name": "Hunter's Path",
    "nameZh": "猎人之径",
    "weaponType": "bow",
    "rarity": 5,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 542,
    "subStat": {
      "type": "critRate",
      "value": 0.441,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Weapon_Hunter%27s_Path.png/revision/latest/scale-to-width-down/60?cb=20220824051509",
    "passive": {
      "name": "At the End of the Beast-Paths",
      "desc": "Gain 12~24% All Elemental DMG Bonus. Obtain the Tireless Hunt effect after hitting an opponent with a Charged Attack. This effect increases Charged Attack DMG by 160~320% of Elemental Mastery. This effect will be removed after 12 Charged Attacks or 10s. Only 1 instance of Tireless Hunt can be gained every 12s."
    }
  },
  {
    "id": "aquasimulacra",
    "name": "Aqua Simulacra",
    "nameZh": "若水",
    "weaponType": "bow",
    "rarity": 5,
    "version": "2.7",
    "versionWeight": 270,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/cd/Weapon_Aqua_Simulacra.png/revision/latest/scale-to-width-down/60?cb=20220531054835",
    "passive": {
      "name": "The Cleansing Form",
      "desc": "HP is increased by 16~32%. When there are opponents nearby, the DMG dealt by the wielder of this weapon is increased by 20~40%. This will take effect whether the character is on-field or not."
    }
  },
  {
    "id": "harangeppakufutsu",
    "name": "Haran Geppaku Futsu",
    "nameZh": "波乱月白经津",
    "weaponType": "sword",
    "rarity": 5,
    "version": "2.6",
    "versionWeight": 260,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/85/Weapon_Haran_Geppaku_Futsu.png/revision/latest/scale-to-width-down/60?cb=20220330041349",
    "passive": {
      "name": "Honed Flow",
      "desc": "Obtain 12~24% All Elemental DMG Bonus. When other nearby party members use Elemental Skills, the character equipping this weapon will gain 1 Wavespike stack. Max 2 stacks. This effect can be triggered once every 0.3s. When the character equipping this weapon uses an Elemental Skill, all stacks of Wavespike will be consumed to gain Rippling Upheaval: each stack of Wavespike consumed will increase Normal Attack DMG by 20~40% for 8s."
    }
  },
  {
    "id": "kagurasverity",
    "name": "Kagura's Verity",
    "nameZh": "神乐之真意",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "2.5",
    "versionWeight": 250,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b7/Weapon_Kagura%27s_Verity.png/revision/latest/scale-to-width-down/60?cb=20220216070811",
    "passive": {
      "name": "Kagura Dance of the Sacred Sakura",
      "desc": "Using an Elemental Skill grants the Kagura Dance effect, increasing the wielding character's Elemental Skill DMG by 12~24% as well as their Stellar-Conduct DMG by 12~24% for 24s. Max 3 stacks. This character will gain a 12~24% All Elemental DMG Bonus when they possess 3 stacks."
    }
  },
  {
    "id": "calamityqueller",
    "name": "Calamity Queller",
    "nameZh": "息灾",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "2.4",
    "versionWeight": 240,
    "baseAtk": 741,
    "subStat": {
      "type": "atkPercent",
      "value": 0.165,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8b/Weapon_Calamity_Queller.png/revision/latest/scale-to-width-down/60?cb=20231219232455",
    "passive": {
      "name": "Extinguishing Precept",
      "desc": "Gain 12~24% All Elemental DMG Bonus. Obtain Consummation for 20s after using an Elemental Skill, causing ATK to increase by 3.2~6.4% per second. This ATK increase has a maximum of 6 stacks. When the character equipped with this weapon is not on the field, Consummation's ATK increase is doubled."
    }
  },
  {
    "id": "redhornstonethresher",
    "name": "Redhorn Stonethresher",
    "nameZh": "赤角石溃杵",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "2.3",
    "versionWeight": 230,
    "baseAtk": 542,
    "subStat": {
      "type": "critDmg",
      "value": 0.882,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Weapon_Redhorn_Stonethresher.png/revision/latest/scale-to-width-down/60?cb=20211214105242",
    "passive": {
      "name": "Gokadaiou Otogibanashi",
      "desc": "DEF is increased by 28~56%. Normal and Charged Attack DMG is increased by 40~80% of DEF."
    }
  },
  {
    "id": "polarstar",
    "name": "Polar Star",
    "nameZh": "冬极白星",
    "weaponType": "bow",
    "rarity": 5,
    "version": "2.2",
    "versionWeight": 220,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Weapon_Polar_Star.png/revision/latest/scale-to-width-down/60?cb=20211013042349",
    "passive": {
      "name": "Daylight's Augury",
      "desc": "Elemental Skill and Elemental Burst DMG increased by 12~24%. After a Normal Attack, Charged Attack, Elemental Skill or Elemental Burst hits an opponent, 1 stack of Ashen Nightstar will be gained for 12s. When 1/2/3/4 stacks of Ashen Nightstar are present, ATK is increased by 10/20/30/48~20/40/60/96%. The stack of Ashen Nightstar created by the Normal Attack, Charged Attack, Elemental Skill or Elemental Burst will be counted independently of the others."
    }
  },
  {
    "id": "everlastingmoonglow",
    "name": "Everlasting Moonglow",
    "nameZh": "不灭月华",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "2.1",
    "versionWeight": 210,
    "baseAtk": 608,
    "subStat": {
      "type": "hpPercent",
      "value": 0.496,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/e1/Weapon_Everlasting_Moonglow.png/revision/latest/scale-to-width-down/60?cb=20210921104126",
    "passive": {
      "name": "Byakuya Kougetsu",
      "desc": "Healing Bonus increased by 10~20%, Normal Attack DMG is increased by 1~3.0% of the Max HP of the character equipping this weapon. For 12s after using an Elemental Burst, Normal Attacks that hit opponents will restore 0.6 Energy. Energy can be restored this way once every 0.1s."
    }
  },
  {
    "id": "engulfinglightning",
    "name": "Engulfing Lightning",
    "nameZh": "薙草之稻光",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "2.1",
    "versionWeight": 210,
    "baseAtk": 608,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.551,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/21/Weapon_Engulfing_Lightning.png/revision/latest/scale-to-width-down/60?cb=20210901044846",
    "passive": {
      "name": "Timeless Dream: Eternal Stove",
      "desc": "ATK increased by 28~56% of Energy Recharge over the base 100%. You can gain a maximum bonus of 80~120% ATK. Gain 30~50% Energy Recharge for 12s after using an Elemental Burst."
    }
  },
  {
    "id": "mistsplitterreforged",
    "name": "Mistsplitter Reforged",
    "nameZh": "雾切之回光",
    "weaponType": "sword",
    "rarity": 5,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 674,
    "subStat": {
      "type": "critDmg",
      "value": 0.441,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/09/Weapon_Mistsplitter_Reforged.png/revision/latest/scale-to-width-down/60?cb=20210721035408",
    "passive": {
      "name": "Mistsplitter's Edge",
      "desc": "Gain a 12~24% Elemental DMG Bonus for all elements and receive the might of the Mistsplitter's Emblem. At stack levels 1/2/3, Mistsplitter's Emblem provides a 8/16/28~16/32/56% Elemental DMG Bonus for the character's Elemental Type. The character will obtain 1 stack of Mistsplitter's Emblem in each of the following scenarios: Normal Attack deals Elemental DMG (stack lasts 5s), casting Elemental Burst (stack lasts 10s); Energy is less than 100% (stack disappears when Energy is full). Each stack's duration is calculated independently."
    }
  },
  {
    "id": "thunderingpulse",
    "name": "Thundering Pulse",
    "nameZh": "飞雷之弦振",
    "weaponType": "bow",
    "rarity": 5,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/77/Weapon_Thundering_Pulse.png/revision/latest/scale-to-width-down/60?cb=20210811094805",
    "passive": {
      "name": "Rule By Thunder",
      "desc": "Increases ATK by 20~40% and grants the might of the Thunder Emblem. At stack levels 1/2/3, the Thunder Emblem increases Normal Attack DMG by 12/24/40~24/48/80%. The character will obtain 1 stack of Thunder Emblem in each of the following scenarios: Normal Attack deals DMG (stack lasts 5s), casting Elemental Skill (stack lasts 10s); Energy is less than 100% (stack disappears when Energy is full). Each stack's duration is calculated independently."
    }
  },
  {
    "id": "freedomsworn",
    "name": "Freedom-Sworn",
    "nameZh": "苍古自由之誓",
    "weaponType": "sword",
    "rarity": 5,
    "version": "1.6",
    "versionWeight": 160,
    "baseAtk": 608,
    "subStat": {
      "type": "elementalMastery",
      "value": 198,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/39/Weapon_Freedom-Sworn.png/revision/latest/scale-to-width-down/60?cb=20210629202549",
    "passive": {
      "name": "Revolutionary Chorale",
      "desc": "A part of the \"Millennial Movement\" that wanders amidst the winds.Increases DMG by 10~20%.When the character wielding this weapon triggers Elemental Reactions, they gain a Sigil of Rebellion. This effect can be triggered once every 0.5s and can be triggered even if said character is not on the field.When you possess 2 Sigils of Rebellion, all of them will be consumed and all nearby party members will obtain \"Millennial Movement: Song of Resistance\" for 12s.\"Millennial Movement: Song of Resistance\" increases Normal, Charged, and Plunging Attack DMG by 16~32% and increases ATK by 20~40%. Once this effect is triggered, you will not gain Sigils of Rebellion for 20s.Of the many effects of the \"Millennial Movement,\" buffs of the same type will not stack."
    }
  },
  {
    "id": "songofbrokenpines",
    "name": "Song of Broken Pines",
    "nameZh": "松籁响起之时",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "1.5",
    "versionWeight": 150,
    "baseAtk": 741,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.207,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Weapon_Song_of_Broken_Pines.png/revision/latest/scale-to-width-down/60?cb=20210518151739",
    "passive": {
      "name": "Rebel's Banner-Hymn",
      "desc": "A part of the \"Millennial Movement\" that wanders amidst the winds.Increases ATK by 16~32%, and when Normal or Charged Attacks hit opponents, the character gains a Sigil of Whispers. This effect can be triggered once every 0.3s.When you possess four Sigils of Whispers, all of them will be consumed and all nearby party members will obtain the \"Millennial Movement: Banner-Hymn\" effect for 12s.\"Millennial Movement: Banner-Hymn\" increases Normal ATK SPD by 12~24% and increases ATK by 20~40%. Once this effect is triggered, you will not gain Sigils of Whispers for 20s.Of the many effects of the \"Millennial Movement\", buffs of the same type will not stack."
    }
  },
  {
    "id": "elegyfortheend",
    "name": "Elegy for the End",
    "nameZh": "终末嗟叹之诗",
    "weaponType": "bow",
    "rarity": 5,
    "version": "1.4",
    "versionWeight": 140,
    "baseAtk": 608,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.551,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a5/Weapon_Elegy_for_the_End.png/revision/latest/scale-to-width-down/60?cb=20210317075424",
    "passive": {
      "name": "The Parting Refrain",
      "desc": "A part of the \"Millennial Movement\" that wanders amidst the winds.Increases Elemental Mastery by 60~120.When the Elemental Skills or Elemental Bursts of the character wielding this weapon hit opponents, that character gains a Sigil of Remembrance. This effect can be triggered once every 0.2s and can be triggered even if said character is not on the field.When you possess 4 Sigils of Remembrance, all of them will be consumed and all nearby party members will obtain the \"Millennial Movement: Farewell Song\" effect for 12s.\"Millennial Movement: Farewell Song\" increases Elemental Mastery by 100~200 and increases ATK by 20~40%. Once this effect is triggered, you will not gain Sigils of Remembrance for 20s.Of the many effects of the \"Millennial Movement,\" buffs of the same type will not stack."
    }
  },
  {
    "id": "staffofhoma",
    "name": "Staff of Homa",
    "nameZh": "护摩之杖",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "1.3",
    "versionWeight": 130,
    "baseAtk": 608,
    "subStat": {
      "type": "critDmg",
      "value": 0.662,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/17/Weapon_Staff_of_Homa.png/revision/latest/scale-to-width-down/60?cb=20210225200935",
    "passive": {
      "name": "Reckless Cinnabar",
      "desc": "HP increased by 20~40%. Additionally, provides an ATK Bonus based on 0.8~1.6% of the wielder's Max HP. When the wielder's HP is less than 50%, this ATK bonus is increased by an additional 1~1.8% of Max HP."
    }
  },
  {
    "id": "primordialjadecutter",
    "name": "Primordial Jade Cutter",
    "nameZh": "磐岩结绿",
    "weaponType": "sword",
    "rarity": 5,
    "version": "1.3",
    "versionWeight": 130,
    "baseAtk": 542,
    "subStat": {
      "type": "critRate",
      "value": 0.441,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2a/Weapon_Primordial_Jade_Cutter.png/revision/latest/scale-to-width-down/60?cb=20210319202419",
    "passive": {
      "name": "Protector's Virtue",
      "desc": "HP increased by 20~40%. Additionally, provides an ATK Bonus based on 1.2~2.4% of the wielder's Max HP."
    }
  },
  {
    "id": "summitshaper",
    "name": "Summit Shaper",
    "nameZh": "斫峰之刃",
    "weaponType": "sword",
    "rarity": 5,
    "version": "1.2",
    "versionWeight": 120,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/ca/Weapon_Summit_Shaper.png/revision/latest/scale-to-width-down/60?cb=20201223042936",
    "passive": {
      "name": "Golden Majesty",
      "desc": "Increases Shield Strength by 20~40%. Scoring hits on opponents increases ATK by 4~8% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%."
    }
  },
  {
    "id": "memoryofdust",
    "name": "Memory of Dust",
    "nameZh": "尘世之锁",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "1.1",
    "versionWeight": 110,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/ca/Weapon_Memory_of_Dust.png/revision/latest/scale-to-width-down/60?cb=20201119232148",
    "passive": {
      "name": "Golden Majesty",
      "desc": "Increases Shield Strength by 20~40%. Scoring hits on opponents increases ATK by 4~8% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%."
    }
  },
  {
    "id": "vortexvanquisher",
    "name": "Vortex Vanquisher",
    "nameZh": "贯虹之槊",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "1.1",
    "versionWeight": 110,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d6/Weapon_Vortex_Vanquisher.png/revision/latest/scale-to-width-down/60?cb=20201129060822",
    "passive": {
      "name": "Golden Majesty",
      "desc": "Increases Shield Strength by 20~40%. Scoring hits on opponents increases ATK by 4~8% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%."
    }
  },
  {
    "id": "theunforged",
    "name": "The Unforged",
    "nameZh": "无工之剑",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "1.1",
    "versionWeight": 110,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f7/Weapon_The_Unforged.png/revision/latest/scale-to-width-down/60?cb=20201129060814",
    "passive": {
      "name": "Golden Majesty",
      "desc": "Increases Shield Strength by 20~40%. Scoring hits on opponents increases ATK by 4~8% for 8s. Max 5 stacks. Can only occur once every 0.3s. While protected by a shield, this ATK increase effect is increased by 100%."
    }
  },
  {
    "id": "aquilafavonia",
    "name": "Aquila Favonia",
    "nameZh": "风鹰剑",
    "weaponType": "sword",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.413,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Weapon_Aquila_Favonia.png/revision/latest/scale-to-width-down/60?cb=20201120002750",
    "passive": {
      "name": "Falcon's Defiance",
      "desc": "ATK is increased by 20~40%. Triggers on taking DMG: the soul of the Falcon of the West awakens, holding the banner of the resistance aloft, regenerating HP equal to 100~160% of ATK and dealing 200~320% of ATK as DMG to surrounding opponents. This effect can only occur once every 15s."
    }
  },
  {
    "id": "primordialjadewingedspear",
    "name": "Primordial Jade Winged-Spear",
    "nameZh": "和璞鸢",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Weapon_Primordial_Jade_Winged-Spear.png/revision/latest/scale-to-width-down/60?cb=20201116152024",
    "passive": {
      "name": "Eagle Spear of Justice",
      "desc": "On hit, increases ATK by 3.2~6.0% for 6s. Max 7 stacks. This effect can only occur once every 0.3s. While in possession of the maximum possible stacks, DMG dealt is increased by 12~24%."
    }
  },
  {
    "id": "skywardpride",
    "name": "Skyward Pride",
    "nameZh": "天空之傲",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.368,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/0b/Weapon_Skyward_Pride.png/revision/latest/scale-to-width-down/60?cb=20201116035255",
    "passive": {
      "name": "Sky-ripping Dragon Spine",
      "desc": "Increases all DMG by 8~16%. After using an Elemental Burst, a vacuum blade that does 80~160% of ATK as DMG to opponents along its path will be created when Normal or Charged Attacks hit. Lasts for 20s or 8 vacuum blades."
    }
  },
  {
    "id": "skywardspine",
    "name": "Skyward Spine",
    "nameZh": "天空之脊",
    "weaponType": "polearm",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.368,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/69/Weapon_Skyward_Spine.png/revision/latest/scale-to-width-down/60?cb=20201116035301",
    "passive": {
      "name": "Black Wing",
      "desc": "Increases CRIT Rate by 8~16% and increases Normal ATK SPD by 12%. Additionally, Normal and Charged Attacks hits on opponents have a 50% chance to trigger a vacuum blade that deals 40~100% of ATK as DMG in a small AoE. This effect can occur no more than once every 2s."
    }
  },
  {
    "id": "skywardatlas",
    "name": "Skyward Atlas",
    "nameZh": "天空之卷",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "atkPercent",
      "value": 0.331,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/33/Weapon_Skyward_Atlas.png/revision/latest/scale-to-width-down/60?cb=20231219172437",
    "passive": {
      "name": "Wandering Clouds",
      "desc": "Increases Elemental DMG Bonus by 12~24%. Normal Attack hits have a 50% chance to earn the favor of the clouds, which actively seek out nearby opponents to attack for 15s, dealing 160~320% ATK DMG. Can only occur once every 30s."
    }
  },
  {
    "id": "skywardharp",
    "name": "Skyward Harp",
    "nameZh": "天空之翼",
    "weaponType": "bow",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 674,
    "subStat": {
      "type": "critRate",
      "value": 0.221,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/19/Weapon_Skyward_Harp.png/revision/latest/scale-to-width-down/60?cb=20201116035246",
    "passive": {
      "name": "Echoing Ballad",
      "desc": "Increases CRIT DMG by 20~40%. Hits have a 60~100% chance to inflict a small AoE attack, dealing 125% Physical ATK DMG. Can only occur once every 4~2s."
    }
  },
  {
    "id": "amosbow",
    "name": "Amos' Bow",
    "nameZh": "阿莫斯之弓",
    "weaponType": "bow",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/de/Weapon_Amos%27_Bow.png/revision/latest/scale-to-width-down/60?cb=20201120010513",
    "passive": {
      "name": "Strong-Willed",
      "desc": "Increases Normal Attack and Charged Attack DMG by 12~24%. After a Normal or Charged Attack is fired, DMG dealt increases by a further 8~16% every 0.1 seconds the arrow is in the air for up to 5 times."
    }
  },
  {
    "id": "wolfsgravestone",
    "name": "Wolf's Gravestone",
    "nameZh": "狼的末路",
    "weaponType": "claymore",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 608,
    "subStat": {
      "type": "atkPercent",
      "value": 0.496,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/4f/Weapon_Wolf%27s_Gravestone.png/revision/latest/scale-to-width-down/60?cb=20201116035623",
    "passive": {
      "name": "Wolfish Tracker",
      "desc": "Increases ATK by 20~40%. On hit, attacks against opponents with less than 30% HP increase all party members' ATK by 40~80% for 12s. Can only occur once every 30s."
    }
  },
  {
    "id": "lostprayertothesacredwinds",
    "name": "Lost Prayer to the Sacred Winds",
    "nameZh": "四风原典",
    "weaponType": "catalyst",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 608,
    "subStat": {
      "type": "critRate",
      "value": 0.331,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/98/Weapon_Lost_Prayer_to_the_Sacred_Winds.png/revision/latest/scale-to-width-down/60?cb=20201116034132",
    "passive": {
      "name": "Boundless Blessing",
      "desc": "Increases Movement SPD by 10%. When in battle, gain an 8~16% Elemental DMG Bonus every 4s. Max 4 stacks. Lasts until the character falls or leaves combat."
    }
  },
  {
    "id": "skywardblade",
    "name": "Skyward Blade",
    "nameZh": "天空之刃",
    "weaponType": "sword",
    "rarity": 5,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 608,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.551,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/03/Weapon_Skyward_Blade.png/revision/latest/scale-to-width-down/60?cb=20201116035239",
    "passive": {
      "name": "Sky-Piercing Fang",
      "desc": "CRIT Rate increased by 4~8%. Gains Skypiercing Might upon using an Elemental Burst: Increases Movement SPD by 10%, increases ATK SPD by 10%, and Normal and Charged hits deal additional DMG equal to 20~40% of ATK. Skypiercing Might lasts for 12s."
    }
  },
  {
    "id": "songofthevigil",
    "name": "Song of the Vigil",
    "nameZh": "守夜人之歌",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 565,
    "subStat": {
      "type": "elementalMastery",
      "value": 110,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/45/Weapon_Song_of_the_Vigil.png/revision/latest/scale-to-width-down/60?cb=20260813123418",
    "passive": {
      "name": "Cadence of Days Gone By",
      "desc": "Triggering an Elemental Reaction regenerates 4~8 Elemental Energy for the equipping character. This effect can trigger once every 9s. On the other hand, triggering a Stellar Glimmer reaction increases their ATK by 20~40% for 12s. The aforementioned effects can trigger even when the character is not on the field."
    }
  },
  {
    "id": "bladeofatonement",
    "name": "Blade of Atonement",
    "nameZh": "赎罪之刃",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/27/Weapon_Blade_of_Atonement.png/revision/latest/scale-to-width-down/60?cb=20260813123530",
    "passive": {
      "name": "Repentance and Redemption",
      "desc": "Triggering an Elemental Reaction increases the equipping character's Elemental Mastery by 64~128 for 12s, while triggering a Stellar Glimmer reaction increases their ATK by 16~32% for 12s. The aforementioned effects can trigger even when the character is not on the field."
    }
  },
  {
    "id": "echoesoftheheart",
    "name": "Echoes of the Heart",
    "nameZh": "心之回响",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/dc/Weapon_Echoes_of_the_Heart.png/revision/latest/scale-to-width-down/60?cb=20260813122226",
    "passive": {
      "name": "Echo of a Vow",
      "desc": "Triggering an Elemental Reaction increases the equipping character's Elemental Mastery by 60~120 for 12s, while triggering a Stellar Glimmer reaction increases their Stellar Glimmer reaction DMG dealt by 16~32% for 12s. The aforementioned effects can trigger even when the character is not on the field."
    }
  },
  {
    "id": "jadevista",
    "name": "Jade Vista",
    "nameZh": "翠玉远景",
    "weaponType": "bow",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/01/Weapon_Jade_Vista.png/revision/latest/scale-to-width-down/60?cb=20260812215531",
    "passive": {
      "name": "A Candle Woven From the Night",
      "desc": "For every party member other than the equipping character:Who is of the same Elemental Type as the equipper: The equipping character's Elemental Mastery is increased by 64~128;Who is not of the same Elemental Type as the equipper: The equipping character's ATK increases by 12~24%. The two effects described above can stack up to 3 times in total, with Elemental Mastery buffs applied first."
    }
  },
  {
    "id": "forgedbythegoldenmelody",
    "name": "Forged by the Golden Melody",
    "nameZh": "黄金旋律锻造之剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/26/Weapon_Forged_by_the_Golden_Melody.png/revision/latest/scale-to-width-down/60?cb=20260812221137",
    "passive": {
      "name": "Day and Night in Counterpoint",
      "desc": "Every 10s, the equipping character plays a \"Harmonic Movement\" of the corresponding type for a boost in the following order: +18~36% ATK > +120~240 Elemental Mastery > +28~56% Stellar Glimmer reaction DMG. Each instance of Harmonic Movement lasts 10s. This effect can trigger even when the equipping character is not on the field.Triggering a Stellar Glimmer reaction will also grant an additional 12-second instance of \"Harmonic Movement: Contrapuntal\" with the same effects as the Harmonic Movement active when Stellar Glimmer is triggered. This effect stacks with the original Harmonic Movement effect, and can trigger once every 12s."
    }
  },
  {
    "id": "frostbreath",
    "name": "Frostbreath",
    "nameZh": "霜息长枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Weapon_Frostbreath.png/revision/latest/scale-to-width-down/60?cb=20260812213927",
    "passive": {
      "name": "A Cast Real Far",
      "desc": "Triggering a Cryo or Hydro-related elemental reaction increases the equipping character's ATK by 20~40% for the next 15s, as well as regenerates 6~12 Elemental Energy for other members of their party. This effect can trigger once every 16s."
    }
  },
  {
    "id": "covenantoffrostandsnow",
    "name": "Covenant of Frost and Snow",
    "nameZh": "霜雪之盟",
    "weaponType": "bow",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "defPercent",
      "value": 0.517,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/e5/Weapon_Covenant_of_Frost_and_Snow.png/revision/latest/scale-to-width-down/60?cb=20260813123623",
    "passive": {
      "name": "The Law's Equilibrium",
      "desc": "For 12s after the equipping character uses an Elemental Skill, their Elemental Mastery is increased by 120~240."
    }
  },
  {
    "id": "hereticsmoltenblade",
    "name": "Heretic's Molten Blade",
    "nameZh": "异端熔火之刃",
    "weaponType": "sword",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b9/Weapon_Heretic%27s_Molten_Blade.png/revision/latest/scale-to-width-down/60?cb=20260812212624",
    "passive": {
      "name": "Lone Light's Blessing",
      "desc": "After the equipping character uses their Elemental Skill, they gain \"Gleam of First Light.\" While active, Gleam of First Light tracks their distance traveled. Each second, the equipping character gains an ATK Bonus ranging from 18~36% to 36~72% based on the distance traveled during the previous second. Gleam of First Light lasts 14s, can be triggered once every 14s, and is removed when the equipping character leaves the field."
    }
  },
  {
    "id": "emberwell",
    "name": "Emberwell",
    "nameZh": "余烬之井",
    "weaponType": "sword",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8e/Weapon_Emberwell.png/revision/latest/scale-to-width-down/60?cb=20260812130408",
    "passive": {
      "name": "Starfire Upon the Snowplains",
      "desc": "Triggering an Elemental Reaction increases the equipping character's ATK by 16~32% for 12s. Triggering a Stellar Glimmer reaction increases their Stellar Glimmer reaction DMG dealt by 16~32% for 12s. The aforementioned effects can trigger even when the character is not on the field."
    }
  },
  {
    "id": "clashofkings",
    "name": "Clash of Kings",
    "nameZh": "诸王之争",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "7.0",
    "versionWeight": 700,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Weapon_Clash_of_Kings.png/revision/latest/scale-to-width-down/60?cb=20260812220234",
    "passive": {
      "name": "Without Heed for Day nor Night",
      "desc": "Using an Elemental Skill grants the equipping character \"Laws of the Board,\" which increases their ATK by 20~40% and their Elemental Mastery by 100~200. This effect lasts 6s and can trigger once every 12s. Does not stack. The duration of this effect will also be extended by 6s if the equipping character hits an opponent with a Charged Attack while it is active. The effect can be extended for max 6s in this way."
    }
  },
  {
    "id": "rainbowserpentsrainbow",
    "name": "Rainbow Serpent's Rain Bow",
    "nameZh": "虹蛇彩雨弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "Luna III",
    "versionWeight": 630,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6e/Weapon_Rainbow_Serpent%27s_Rain_Bow.png/revision/latest/scale-to-width-down/60?cb=20251219062324",
    "passive": {
      "name": "Astral Whispers Beyond the Sacred Throne",
      "desc": "ATK is increased by 28~56% for 8s after the equipping character's attacks hit an opponent while the equipping character is off-field."
    }
  },
  {
    "id": "sacrificersstaff",
    "name": "Sacrificer's Staff",
    "nameZh": "祭司之杖",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "Luna II",
    "versionWeight": 620,
    "baseAtk": 620,
    "subStat": {
      "type": "critRate",
      "value": 0.092,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/40/Weapon_Sacrificer%27s_Staff.png/revision/latest/scale-to-width-down/60?cb=20251022123127",
    "passive": {
      "name": "Untainted Desire",
      "desc": "For 6s after an Elemental Skill hits an opponent, ATK is increased by 8~16% and Energy Recharge is increased by 6~12%. Max 3 stacks. This effect can be triggered even when the equipping character is off-field."
    }
  },
  {
    "id": "dawningfrost",
    "name": "Dawning Frost",
    "nameZh": "拂晓之霜",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "Luna II",
    "versionWeight": 620,
    "baseAtk": 510,
    "subStat": {
      "type": "critDmg",
      "value": 0.551,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/0d/Weapon_Dawning_Frost.png/revision/latest/scale-to-width-down/60?cb=20251022123046",
    "passive": {
      "name": "Nocturnal Dreams",
      "desc": "For 10s after a Charged Attack hits an opponent, Elemental Mastery is increased by 72~144. For 10s after an Elemental Skill hits an opponent. Elemental Mastery is increased by 48~96."
    }
  },
  {
    "id": "moonweaversdawn",
    "name": "Moonweaver's Dawn",
    "nameZh": "织月者的拂晓",
    "weaponType": "sword",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f1/Weapon_Moonweaver%27s_Dawn.png/revision/latest/scale-to-width-down/60?cb=20250911022113",
    "passive": {
      "name": "Secret Silver's Testament",
      "desc": "Increases Elemental Burst DMG by 20~40%. When the equipping character's Energy Capacity does not exceed 60/40, their Elemental Burst DMG is increased by an additional 16/28~32/56%."
    }
  },
  {
    "id": "prospectorsshovel",
    "name": "Prospector's Shovel",
    "nameZh": "勘探铲",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/fc/Weapon_Prospector%27s_Shovel.png/revision/latest/scale-to-width-down/60?cb=20250910060631",
    "passive": {
      "name": "Swift and Sure",
      "desc": "Electro-Charged DMG is increased by 48~96%, and Lunar-Charged DMG is increased by 12~24%. Moonsign: Ascendant Gleam: Lunar-Charged DMG is increased by an additional 12~24%."
    }
  },
  {
    "id": "etherlightspindlelute",
    "name": "Etherlight Spindlelute",
    "nameZh": "以太光芒琴",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c3/Weapon_Etherlight_Spindlelute.png/revision/latest/scale-to-width-down/60?cb=20250912020338",
    "passive": {
      "name": "Last Singer",
      "desc": "For 20s after using an Elemental Skill, the equipping character's Elemental Mastery is increased by 100~200."
    }
  },
  {
    "id": "blackmarrowlantern",
    "name": "Blackmarrow Lantern",
    "nameZh": "黑髓灯笼",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 454,
    "subStat": {
      "type": "elementalMastery",
      "value": 221,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c7/Weapon_Blackmarrow_Lantern.png/revision/latest/scale-to-width-down/60?cb=20250910061754",
    "passive": {
      "name": "Token of Covenant",
      "desc": "Bloom DMG is increased by 48~96%, and Lunar-Bloom DMG is increased by 12~24%. Moonsign: Ascendant Gleam: Lunar-Bloom DMG is increased by an additional 12~24%."
    }
  },
  {
    "id": "serenityscall",
    "name": "Serenity's Call",
    "nameZh": "宁静之唤",
    "weaponType": "sword",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/fe/Weapon_Serenity%27s_Call.png/revision/latest/scale-to-width-down/60?cb=20250910060031",
    "passive": {
      "name": "Solemn Silence",
      "desc": "Upon causing an Elemental Reaction, increases Max HP by 16~32% for 12s. Moonsign: Ascendant Gleam: Max HP from this effect is further increased by 16~32%. This effect can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "masterkey",
    "name": "Master Key",
    "nameZh": "万能钥匙",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/82/Weapon_Master_Key.png/revision/latest/scale-to-width-down/60?cb=20250912041437",
    "passive": {
      "name": "Fall Into Place",
      "desc": "Upon causing an Elemental Reaction, increases Elemental Mastery by 60~120 for 12s. Moonsign: Ascendant Gleam: Elemental Mastery from this effect is further increased by 60~120. This effect can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "snarehook",
    "name": "Snare Hook",
    "nameZh": "陷阱钩",
    "weaponType": "bow",
    "rarity": 4,
    "version": "Luna I",
    "versionWeight": 610,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c8/Weapon_Snare_Hook.png/revision/latest/scale-to-width-down/60?cb=20250910061712",
    "passive": {
      "name": "Phantom Flash",
      "desc": "Upon causing an Elemental Reaction, increases Elemental Mastery by 60~120 for 12s. Moonsign: Ascendant Gleam: Elemental Mastery from this effect is further increased by 60~120. This effect can be triggered even if the equipping character is off-field."
    }
  },
  {
    "id": "flameforgedinsight",
    "name": "Flame-Forged Insight",
    "nameZh": "熔火锻造的洞察",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "5.8",
    "versionWeight": 580,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/45/Weapon_Flame-Forged_Insight.png/revision/latest/scale-to-width-down/60?cb=20250731224951",
    "passive": {
      "name": "Mind in Bloom",
      "desc": "When Electro-Charged, Lunar-Charged, Bloom, Lunar-Bloom, Crystallize or Lunar-Crystallize is triggered, restore 12~24 Elemental Energy and increase Elemental Mastery by 60~120 for 15 seconds. This effect can be triggered once every 15s and can be triggered even when the equipping character is off-field."
    }
  },
  {
    "id": "sequenceofsolitude",
    "name": "Sequence of Solitude",
    "nameZh": "孤寂之律",
    "weaponType": "bow",
    "rarity": 4,
    "version": "5.6",
    "versionWeight": 560,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Weapon_Sequence_of_Solitude.png/revision/latest/scale-to-width-down/60?cb=20250509063049",
    "passive": {
      "name": "Silent Trigger",
      "desc": "When an attack hits an opponent, deal AoE DMG equal to 40~80% of Max HP at the target location. This effect can be triggered once every 15s."
    }
  },
  {
    "id": "tamayurateinoohanashi",
    "name": "Tamayuratei no Ohanashi",
    "nameZh": "玉响亭的叙谈",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "5.4",
    "versionWeight": 540,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/53/Weapon_Tamayuratei_no_Ohanashi.png/revision/latest/scale-to-width-down/60?cb=20250214063802",
    "passive": {
      "name": "Busybody's Running Light",
      "desc": "Increase ATK by 20~40% and Movement SPD by 10% for 10s when using an Elemental Skill."
    }
  },
  {
    "id": "calamityofeshu",
    "name": "Calamity of Eshu",
    "nameZh": "厄休的祸患",
    "weaponType": "sword",
    "rarity": 4,
    "version": "5.2",
    "versionWeight": 520,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/7b/Weapon_Calamity_of_Eshu.png/revision/latest/scale-to-width-down/60?cb=20241128032839",
    "passive": {
      "name": "Diffusing Boundary",
      "desc": "While characters are protected by a Shield, DMG dealt by Normal and Charged Attacks is increased by 20~40%, and Normal and Charged Attack CRIT Rate is increased by 8~16%."
    }
  },
  {
    "id": "flowerwreathedfeathers",
    "name": "Flower-Wreathed Feathers",
    "nameZh": "缀花之翎",
    "weaponType": "bow",
    "rarity": 4,
    "version": "5.2",
    "versionWeight": 520,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1f/Weapon_Flower-Wreathed_Feathers.png/revision/latest/scale-to-width-down/60?cb=20241123034817",
    "passive": {
      "name": "Inflorescence Unattainable",
      "desc": "Decreases Gliding Stamina consumption by 15%. When using Aimed Shots, the DMG dealt by Charged Attacks increases by 6~12% every 0.5s. This effect can stack up to 6 times and will be removed 10s after leaving Aiming Mode."
    }
  },
  {
    "id": "waveridingwhirl",
    "name": "Waveriding Whirl",
    "nameZh": "乘浪旋涡",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "5.2",
    "versionWeight": 520,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/99/Weapon_Waveriding_Whirl.png/revision/latest/scale-to-width-down/60?cb=20241123035157",
    "passive": {
      "name": "Fangs Flying To and Fro",
      "desc": "Decreases Swimming Stamina consumption by 15%. In addition, for 10s after using an Elemental Skill, Max HP is increased by 20~40%. For every Hydro Elemental character in the party, Max HP is increased by another 12~24%, and the maximum increase that can be achieved in this way is 24~48%. Can be triggered once every 15s."
    }
  },
  {
    "id": "sturdybone",
    "name": "Sturdy Bone",
    "nameZh": "坚牢之骨",
    "weaponType": "sword",
    "rarity": 4,
    "version": "5.1",
    "versionWeight": 510,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Weapon_Sturdy_Bone.png/revision/latest/scale-to-width-down/60?cb=20241009015423",
    "passive": {
      "name": "Trapper's Pride",
      "desc": "Sprint or Alternate Sprint Stamina Consumption decreased by 15%. Additionally, after using Sprint or Alternate Sprint, Normal Attack DMG is increased by 16~32% of ATK. This effect expires after triggering 18 times or 7s."
    }
  },
  {
    "id": "fruitfulhook",
    "name": "Fruitful Hook",
    "nameZh": "硕果钩",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "5.1",
    "versionWeight": 510,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/bb/Weapon_Fruitful_Hook.png/revision/latest/scale-to-width-down/60?cb=20241029194749",
    "passive": {
      "name": "The Weight of Falling Branches",
      "desc": "Increase Plunging Attack CRIT Rate by 16~32%; After a Plunging Attack hits an opponent, Normal, Charged, and Plunging Attack DMG increased by 16~32% for 10s."
    }
  },
  {
    "id": "mountainbracingbolt",
    "name": "Mountain-Bracing Bolt",
    "nameZh": "稳固山石之箭",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "5.1",
    "versionWeight": 510,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/66/Weapon_Mountain-Bracing_Bolt.png/revision/latest/scale-to-width-down/60?cb=20241009015511",
    "passive": {
      "name": "Hope Beyond the Peaks",
      "desc": "Decreases Climbing Stamina Consumption by 15% and increases Elemental Skill DMG by 12~24%. Also, after other nearby party members use Elemental Skills, the equipping character's Elemental Skill DMG will also increase by 12~24% for 8s."
    }
  },
  {
    "id": "earthshaker",
    "name": "Earth Shaker",
    "nameZh": "撼地者",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/78/Weapon_Earth_Shaker.png/revision/latest/scale-to-width-down/60?cb=20240914112937",
    "passive": {
      "name": "Oath of Qhapaq Nan",
      "desc": "After a party member triggers a Pyro-related reaction, the equipping character's Elemental Skill DMG is increased by 16~32% for 8s. This effect can be triggered even when the triggering party member is not on the field."
    }
  },
  {
    "id": "chainbreaker",
    "name": "Chain Breaker",
    "nameZh": "碎链",
    "weaponType": "bow",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/7a/Weapon_Chain_Breaker.png/revision/latest/scale-to-width-down/60?cb=20240914113326",
    "passive": {
      "name": "Flower—Feather Song",
      "desc": "For every party member from Natlan or who has a different Elemental Type from the equipping character, the equipping character gains 4.8~9.6% increased ATK. When there are no less than 3 of the aforementioned characters, the equipping character gains 24~48 Elemental Mastery."
    }
  },
  {
    "id": "footprintoftherainbow",
    "name": "Footprint of the Rainbow",
    "nameZh": "虹之行迹",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 510,
    "subStat": {
      "type": "defPercent",
      "value": 0.517,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d6/Weapon_Footprint_of_the_Rainbow.png/revision/latest/scale-to-width-down/60?cb=20240914113044",
    "passive": {
      "name": "Pact of Flowing Springs",
      "desc": "Using an Elemental Skill increases DEF by 16~32% for 15s."
    }
  },
  {
    "id": "ashgravendrinkinghorn",
    "name": "Ash-Graven Drinking Horn",
    "nameZh": "灰烬号角",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/25/Weapon_Ash-Graven_Drinking_Horn.png/revision/latest/scale-to-width-down/60?cb=20240914112623",
    "passive": {
      "name": "Tupac's Grip",
      "desc": "When an attack hits an opponent, deal AoE DMG equal to 40~80% of Max HP at the target location. This effect can be triggered once every 15s."
    }
  },
  {
    "id": "ringofyaxche",
    "name": "Ring of Yaxche",
    "nameZh": "亚克斯契之环",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/45/Weapon_Ring_of_Yaxche.png/revision/latest/scale-to-width-down/60?cb=20240914113218",
    "passive": {
      "name": "Echoes of the Plentiful Land",
      "desc": "Using an Elemental Skill grants the Jade-Forged Crown effect: Every 1,000 Max HP will increase the Normal Attack DMG dealt by the equipping character by 0.6~1% for 10s. Normal Attack DMG can be increased this way by a maximum of 16~32%."
    }
  },
  {
    "id": "fluteofezpitzal",
    "name": "Flute of Ezpitzal",
    "nameZh": "厄兹皮茨尔之笛",
    "weaponType": "sword",
    "rarity": 4,
    "version": "5.0",
    "versionWeight": 500,
    "baseAtk": 454,
    "subStat": {
      "type": "defPercent",
      "value": 0.69,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/31/Weapon_Flute_of_Ezpitzal.png/revision/latest/scale-to-width-down/60?cb=20240914112822",
    "passive": {
      "name": "Smoke-and-Mirror Mystery",
      "desc": "Using an Elemental Skill increases DEF by 16~32% for 15s."
    }
  },
  {
    "id": "cloudforged",
    "name": "Cloudforged",
    "nameZh": "筑云",
    "weaponType": "bow",
    "rarity": 4,
    "version": "4.7",
    "versionWeight": 470,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f8/Weapon_Cloudforged.png/revision/latest/scale-to-width-down/60?cb=20240607022532",
    "passive": {
      "name": "Crag-Chiseled Forge",
      "desc": "After Elemental Energy is decreased, the equipping character's Elemental Mastery will increase by 40~80 for 18s. Max 2 stacks."
    }
  },
  {
    "id": "dialoguesofthedesertsages",
    "name": "Dialogues of the Desert Sages",
    "nameZh": "沙漠贤者的问答",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "4.5",
    "versionWeight": 450,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ea/Weapon_Dialogues_of_the_Desert_Sages.png/revision/latest/scale-to-width-down/60?cb=20240314034048",
    "passive": {
      "name": "Principle of Equilibrium",
      "desc": "When the wielder performs healing, restore 8~16 Energy. This effect can be triggered once every 10s and can occur even when the character is not on the field."
    }
  },
  {
    "id": "ultimateoverlordsmegamagicsword",
    "name": "\"Ultimate Overlord's Mega Magic Sword\"",
    "nameZh": "“究极霸王超级魔剑”",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "4.3",
    "versionWeight": 430,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6e/Weapon_Ultimate_Overlord%27s_Mega_Magic_Sword.png/revision/latest/scale-to-width-down/60?cb=20231221021745",
    "passive": {
      "name": "Melussistance!",
      "desc": "ATK increased by 12~24%. That's not all! The support from all Melusines you've helped in Merusea Village fills you with strength! Based on the number of them you've helped, your ATK is increased by up to an additional 12~24%."
    }
  },
  {
    "id": "swordofnarzissenkreuz",
    "name": "Sword of Narzissenkreuz",
    "nameZh": "水仙十字之剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "4.2",
    "versionWeight": 420,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1f/Weapon_Sword_of_Narzissenkreuz_Pneuma.png/revision/latest/scale-to-width-down/60?cb=20231219233137",
    "passive": {
      "name": "Hero's Blade",
      "desc": "When the equipping character does not have an Arkhe: When Normal Attacks, Charged Attacks, or Plunging Attacks strike, a Pneuma or Ousia energy blast will be unleashed, dealing 160~320% of ATK as DMG. This effect can be triggered once every 12s. The energy blast type is determined by the current type of the Sword of Narzissenkreuz."
    }
  },
  {
    "id": "rangegauge",
    "name": "Range Gauge",
    "nameZh": "测距规",
    "weaponType": "bow",
    "rarity": 4,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/11/Weapon_Range_Gauge.png/revision/latest/scale-to-width-down/60?cb=20231219232959",
    "passive": {
      "name": "Masons' Ditty",
      "desc": "When the wielder is healed or heals others, they will gain a Unity's Symbol that lasts 30s, up to a maximum of 3 Symbols. When using their Elemental Skill or Burst, all Symbols will be consumed and the Struggle effect will be granted for 10s. For each Symbol consumed, gain 3~7% ATK and 7~13% All Elemental DMG Bonus. The Struggle effect can be triggered once every 15s, and Symbols can be gained even when the character is not on the field."
    }
  },
  {
    "id": "prospectorsdrill",
    "name": "Prospector's Drill",
    "nameZh": "勘探钻机",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b1/Weapon_Prospector%27s_Drill.png/revision/latest/scale-to-width-down/60?cb=20231019120257",
    "passive": {
      "name": "Masons' Ditty",
      "desc": "When the wielder is healed or heals others, they will gain a Unity's Symbol that lasts 30s, up to a maximum of 3 Symbols. When using their Elemental Skill or Burst, all Symbols will be consumed and the Struggle effect will be granted for 10s. For each Symbol consumed, gain 3~7% ATK and 7~13% All Elemental DMG Bonus. The Struggle effect can be triggered once every 15s, and Symbols can be gained even when the character is not on the field."
    }
  },
  {
    "id": "balladoftheboundlessblue",
    "name": "Ballad of the Boundless Blue",
    "nameZh": "无边湛蓝的歌宪",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b5/Weapon_Ballad_of_the_Boundless_Blue.png/revision/latest/scale-to-width-down/60?cb=20231012042231",
    "passive": {
      "name": "Azure Skies",
      "desc": "Within 6s after Normal or Charged Attacks hit an opponent, Normal Attack DMG will be increased by 8~16% and Charged Attack DMG will be increased by 6~12%. Max 3 stacks. This effect can be triggered once every 0.3s."
    }
  },
  {
    "id": "thedockhandsassistant",
    "name": "The Dockhand's Assistant",
    "nameZh": "船坞工的助手",
    "weaponType": "sword",
    "rarity": 4,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/eb/Weapon_The_Dockhand%27s_Assistant.png/revision/latest/scale-to-width-down/60?cb=20231219233202",
    "passive": {
      "name": "Sea Shanty",
      "desc": "When the wielder is healed or heals others, they will gain a Stoic's Symbol that lasts 30s, up to a maximum of 3 Symbols. When using their Elemental Skill or Burst, all Symbols will be consumed and the Roused effect will be granted for 10s. For each Symbol consumed, gain 40~80 Elemental Mastery, and 2s after the effect occurs, 2~4 Energy per Symbol consumed will be restored for said character. The Roused effect can be triggered once every 15s, and Symbols can be gained even when the character is not on the field."
    }
  },
  {
    "id": "portablepowersaw",
    "name": "Portable Power Saw",
    "nameZh": "便携式动力锯",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "4.1",
    "versionWeight": 410,
    "baseAtk": 454,
    "subStat": {
      "type": "hpPercent",
      "value": 0.551,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/49/Weapon_Portable_Power_Saw.png/revision/latest/scale-to-width-down/60?cb=20231219232919",
    "passive": {
      "name": "Sea Shanty",
      "desc": "When the wielder is healed or heals others, they will gain a Stoic's Symbol that lasts 30s, up to a maximum of 3 Symbols. When using their Elemental Skill or Burst, all Symbols will be consumed and the Roused effect will be granted for 10s. For each Symbol consumed, gain 40~80 Elemental Mastery, and 2s after the effect occurs, 2~4 Energy per Symbol consumed will be restored for said character. The Roused effect can be triggered once every 15s, and Symbols can be gained even when the character is not on the field."
    }
  },
  {
    "id": "flowingpurity",
    "name": "Flowing Purity",
    "nameZh": "纯水流华",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/01/Weapon_Flowing_Purity.png/revision/latest/scale-to-width-down/60?cb=20230817015237",
    "passive": {
      "name": "Unfinished Masterpiece",
      "desc": "When using an Elemental Skill, All Elemental DMG Bonus will be increased by 8~16% for 15s, and a Bond of Life worth 24% of Max HP will be granted. This effect can be triggered once every 10s. When the Bond of Life is cleared, every 1,000 HP cleared in the process will provide 2~4% All Elemental DMG Bonus, up to a maximum of 12~24%. This effect lasts 15s."
    }
  },
  {
    "id": "rightfulreward",
    "name": "Rightful Reward",
    "nameZh": "公义的酬报",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 565,
    "subStat": {
      "type": "hpPercent",
      "value": 0.276,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8d/Weapon_Rightful_Reward.png/revision/latest/scale-to-width-down/60?cb=20231219233024",
    "passive": {
      "name": "Tip of the Spear",
      "desc": "When the wielder is healed, restore 8~16 Energy. This effect can be triggered once every 10s, and can occur even when the character is not on the field."
    }
  },
  {
    "id": "finaleofthedeep",
    "name": "Finale of the Deep",
    "nameZh": "海渊终曲",
    "weaponType": "sword",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/5a/Weapon_Finale_of_the_Deep.png/revision/latest/scale-to-width-down/60?cb=20230817015329",
    "passive": {
      "name": "An End Sublime",
      "desc": "When using an Elemental Skill, ATK will be increased by 12~24% for 15s, and a Bond of Life worth 25% of Max HP will be granted. This effect can be triggered once every 10s. When the Bond of Life is cleared, a maximum of 150~300 ATK will be gained based on 2.4~4.8% of the total amount of the Life Bond cleared, lasting for 15s."
    }
  },
  {
    "id": "talkingstick",
    "name": "Talking Stick",
    "nameZh": "聊聊棒",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 565,
    "subStat": {
      "type": "critRate",
      "value": 0.184,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/28/Weapon_Talking_Stick.png/revision/latest/scale-to-width-down/60?cb=20230817015212",
    "passive": {
      "name": "\"The Silver Tongue\"",
      "desc": "ATK will be increased by  16~32% for 15s after being affected by Pyro. This effect can be triggered once every 12s. All Elemental DMG Bonus will be increased by 12~24% for 15s after being affected by Hydro, Cryo, Electro, or Dendro. This effect can be triggered once every 12s."
    }
  },
  {
    "id": "scionoftheblazingsun",
    "name": "Scion of the Blazing Sun",
    "nameZh": "烈阳之嗣",
    "weaponType": "bow",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 565,
    "subStat": {
      "type": "critRate",
      "value": 0.184,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/83/Weapon_Scion_of_the_Blazing_Sun.png/revision/latest/scale-to-width-down/60?cb=20230817015133",
    "passive": {
      "name": "The Way of Sunfire",
      "desc": "After a Charged Attack hits an opponent, a Sunfire Arrow will descend upon the opponent hit, dealing 60~120% ATK as DMG, and applying the Heartsearer effect to the opponent damaged by said Arrow for 10s. Opponents affected by Heartsearer take 28~56% more Charged Attack DMG from the wielder. A Sunfire Arrow can be triggered once every 10s."
    }
  },
  {
    "id": "fleuvecendreferryman",
    "name": "Fleuve Cendre Ferryman",
    "nameZh": "灰河渡手",
    "weaponType": "sword",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/7e/Weapon_Fleuve_Cendre_Ferryman.png/revision/latest/scale-to-width-down/60?cb=20231219232547",
    "passive": {
      "name": "Ironbone",
      "desc": "Increases Elemental Skill CRIT Rate by 8~16%. Additionally, increases Energy Recharge by 16~32% for 5s after using an Elemental Skill."
    }
  },
  {
    "id": "songofstillness",
    "name": "Song of Stillness",
    "nameZh": "静谧之曲",
    "weaponType": "bow",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/bd/Weapon_Song_of_Stillness.png/revision/latest/scale-to-width-down/60?cb=20230817015059",
    "passive": {
      "name": "Benthic Pulse",
      "desc": "After the wielder is healed, they will deal 16~32% more DMG for 8s. This can be triggered even when the character is not on the field."
    }
  },
  {
    "id": "wolffang",
    "name": "Wolf-Fang",
    "nameZh": "狼牙",
    "weaponType": "sword",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/e3/Weapon_Wolf-Fang.png/revision/latest/scale-to-width-down/60?cb=20230817015301",
    "passive": {
      "name": "Northwind Wolf",
      "desc": "DMG dealt by Elemental Skill and Elemental Burst is increased by 16~32%. When an Elemental Skill hits an opponent, its CRIT Rate will be increased by 2~4%. When an Elemental Burst hits an opponent, its CRIT Rate will be increased by 2~4%. Both of these effects last 10s separately, have 4 max stacks, and can be triggered once every 0.1s."
    }
  },
  {
    "id": "tidalshadow",
    "name": "Tidal Shadow",
    "nameZh": "浪影阔剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/69/Weapon_Tidal_Shadow.png/revision/latest/scale-to-width-down/60?cb=20230817015159",
    "passive": {
      "name": "White Cruising Wave",
      "desc": "After the wielder is healed, ATK will be increased by 24~48% for 8s. This can be triggered even when the character is not on the field."
    }
  },
  {
    "id": "balladofthefjords",
    "name": "Ballad of the Fjords",
    "nameZh": "峡湾长歌",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/82/Weapon_Ballad_of_the_Fjords.png/revision/latest/scale-to-width-down/60?cb=20230817015147",
    "passive": {
      "name": "Tales of the Tundra",
      "desc": "When there are at least 3 different Elemental Types in your party, Elemental Mastery will be increased by 120~240."
    }
  },
  {
    "id": "sacrificialjade",
    "name": "Sacrificial Jade",
    "nameZh": "遗祀玉珑",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "4.0",
    "versionWeight": 400,
    "baseAtk": 454,
    "subStat": {
      "type": "critRate",
      "value": 0.368,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/86/Weapon_Sacrificial_Jade.png/revision/latest/scale-to-width-down/60?cb=20230817015224",
    "passive": {
      "name": "Jade Circulation",
      "desc": "When not on the field for more than 5s, Max HP will be increased by 32~64% and Elemental Mastery will be increased by 40~80. These effects will be canceled after the wielder has been on the field for 10s."
    }
  },
  {
    "id": "ibispiercer",
    "name": "Ibis Piercer",
    "nameZh": "鹮穿之喙",
    "weaponType": "bow",
    "rarity": 4,
    "version": "3.7",
    "versionWeight": 370,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/ce/Weapon_Ibis_Piercer.png/revision/latest/scale-to-width-down/60?cb=20231219232614",
    "passive": {
      "name": "Secret Wisdom's Favor",
      "desc": "The character's Elemental Mastery will increase by 40~80 within 6s after Charged Attacks hit opponents. Max 2 stacks. This effect can be triggered once every 0.5s."
    }
  },
  {
    "id": "mailedflower",
    "name": "Mailed Flower",
    "nameZh": "饰铁之花",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "3.5",
    "versionWeight": 350,
    "baseAtk": 565,
    "subStat": {
      "type": "elementalMastery",
      "value": 110,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c7/Weapon_Mailed_Flower.png/revision/latest/scale-to-width-down/60?cb=20231219232804",
    "passive": {
      "name": "Whispers of Wind and Flower",
      "desc": "Within 8s after the character's Elemental Skill hits an opponent or the character triggers an Elemental Reaction, their ATK and Elemental Mastery will be increased by 12~24% and 48~96 respectively."
    }
  },
  {
    "id": "toukaboushigure",
    "name": "Toukabou Shigure",
    "nameZh": "东花坊时雨",
    "weaponType": "sword",
    "rarity": 4,
    "version": "3.3",
    "versionWeight": 330,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b5/Weapon_Toukabou_Shigure.png/revision/latest/scale-to-width-down/60?cb=20231219233230",
    "passive": {
      "name": "Kaidan: Rainfall Earthbinder",
      "desc": "After an attack hits opponents, it will inflict an instance of Cursed Parasol upon one of them for 10s. This effect can be triggered once every 15s. If this opponent is defeated during Cursed Parasol's duration, Cursed Parasol's CD will be refreshed immediately. The character wielding this weapon will deal 16~32% more DMG to the opponent affected by Cursed Parasol."
    }
  },
  {
    "id": "missivewindspear",
    "name": "Missive Windspear",
    "nameZh": "风信之锋",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Weapon_Missive_Windspear.png/revision/latest/scale-to-width-down/60?cb=20231219232854",
    "passive": {
      "name": "The Wind Unattained",
      "desc": "Within 10s after an Elemental Reaction is triggered, ATK is increased by 12~24% and Elemental Mastery is increased by 48~96."
    }
  },
  {
    "id": "wanderingevenstar",
    "name": "Wandering Evenstar",
    "nameZh": "流浪的晚星",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Weapon_Wandering_Evenstar.png/revision/latest/scale-to-width-down/60?cb=20231219232420",
    "passive": {
      "name": "Wildling Nightstar",
      "desc": "The following effect will trigger every 10s: The equipping character will gain 24~48% of their Elemental Mastery as bonus ATK for 12s, with nearby party members gaining 30% of this buff for the same duration. Multiple instances of this weapon can allow this buff to stack. This effect will still trigger even if the character is not on the field."
    }
  },
  {
    "id": "makhairaaquamarine",
    "name": "Makhaira Aquamarine",
    "nameZh": "玛海菈的水色",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/90/Weapon_Makhaira_Aquamarine.png/revision/latest/scale-to-width-down/60?cb=20231219232829",
    "passive": {
      "name": "Desert Pavilion",
      "desc": "The following effect will trigger every 10s: The equipping character will gain 24~48% of their Elemental Mastery as bonus ATK for 12s, with nearby party members gaining 30% of this buff for the same duration. Multiple instances of this weapon can allow this buff to stack. This effect will still trigger even if the character is not on the field."
    }
  },
  {
    "id": "xiphosmoonlight",
    "name": "Xiphos' Moonlight",
    "nameZh": "西福斯的月光",
    "weaponType": "sword",
    "rarity": 4,
    "version": "3.1",
    "versionWeight": 310,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/8a/Weapon_Xiphos%27_Moonlight.png/revision/latest/scale-to-width-down/60?cb=20221014114116",
    "passive": {
      "name": "Jinni's Whisper",
      "desc": "The following effect will trigger every 10s: The equipping character will gain 0.036~0.072% Energy Recharge for each point of Elemental Mastery they possess for 12s, with nearby party members gaining 30% of this buff for the same duration. Multiple instances of this weapon can allow this buff to stack. This effect will still trigger even if the character is not on the field."
    }
  },
  {
    "id": "moonpiercer",
    "name": "Moonpiercer",
    "nameZh": "贯月矢",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 565,
    "subStat": {
      "type": "elementalMastery",
      "value": 110,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a4/Weapon_Moonpiercer.png/revision/latest/scale-to-width-down/60?cb=20220824051538",
    "passive": {
      "name": "Stillwood Moonshadow",
      "desc": "After triggering Burning, Quicken, Aggravate, Spread, Bloom, Lunar-Bloom, Hyperbloom, or Burgeon, a Leaf of Revival will be created around the character for a maximum of 10s. When picked up, the Leaf will grant the character 16~32% ATK for 12s. Only 1 Leaf can be generated this way every 20s. This effect can still be triggered if the character is not on the field."
    }
  },
  {
    "id": "forestregalia",
    "name": "Forest Regalia",
    "nameZh": "森林王器",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/51/Weapon_Forest_Regalia.png/revision/latest/scale-to-width-down/60?cb=20220824051440",
    "passive": {
      "name": "Forest Sanctuary",
      "desc": "After triggering Burning, Quicken, Aggravate, Spread, Bloom, Lunar-Bloom, Hyperbloom, or Burgeon, a Leaf of Consciousness will be created around the character for a maximum of 10s. When picked up, the Leaf will grant the character 60~120 Elemental Mastery for 12s. Only 1 Leaf can be generated this way every 20s. This effect can still be triggered if the character is not on the field. The Leaf of Consciousness' effect cannot stack."
    }
  },
  {
    "id": "sapwoodblade",
    "name": "Sapwood Blade",
    "nameZh": "原木刀",
    "weaponType": "sword",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/00/Weapon_Sapwood_Blade.png/revision/latest/scale-to-width-down/60?cb=20220824051553",
    "passive": {
      "name": "Forest Sanctuary",
      "desc": "After triggering Burning, Quicken, Aggravate, Spread, Bloom, Lunar-Bloom, Hyperbloom, or Burgeon, a Leaf of Consciousness will be created around the character for a maximum of 10s. When picked up, the Leaf will grant the character 60~120 Elemental Mastery for 12s. Only 1 Leaf can be generated this way every 20s. This effect can still be triggered if the character is not on the field. The Leaf of Consciousness' effect cannot stack."
    }
  },
  {
    "id": "endoftheline",
    "name": "End of the Line",
    "nameZh": "竭泽",
    "weaponType": "bow",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/71/Weapon_End_of_the_Line.png/revision/latest/scale-to-width-down/60?cb=20220824051424",
    "passive": {
      "name": "Net Snapper",
      "desc": "Triggers the Flowrider effect after using an Elemental Skill, dealing 80~160% ATK as AoE DMG upon hitting an opponent with an attack. Flowrider will be removed after 15s or after causing 3 instances of AoE DMG. Only 1 instance of AoE DMG can be caused every 2s in this way. Flowrider can be triggered once every 12s."
    }
  },
  {
    "id": "fruitoffulfillment",
    "name": "Fruit of Fulfillment",
    "nameZh": "盈满之实",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/98/Weapon_Fruit_of_Fulfillment.png/revision/latest/scale-to-width-down/60?cb=20220824051455",
    "passive": {
      "name": "Full Circle",
      "desc": "Obtain the \"Wax and Wane\" effect after an Elemental Reaction is triggered, gaining 24~36 Elemental Mastery while losing 5% ATK. For every 0.3s, 1 stack of Wax and Wane can be gained. Max 5 stacks. For every 6s that go by without an Elemental Reaction being triggered, 1 stack will be lost. This effect can be triggered even when the character is off-field."
    }
  },
  {
    "id": "kingssquire",
    "name": "King's Squire",
    "nameZh": "王下近侍",
    "weaponType": "bow",
    "rarity": 4,
    "version": "3.0",
    "versionWeight": 300,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a2/Weapon_King%27s_Squire.png/revision/latest/scale-to-width-down/60?cb=20220824051523",
    "passive": {
      "name": "Labyrinth Lord's Instruction",
      "desc": "Obtain the Teachings of the Forest effect when unleashing Elemental Skills and Elemental Burst, increasing Elemental Mastery by 60~140 for 12s. This effect will be removed when switching characters. When the Teachings of the Forest effect ends or is removed, it will deal 100~180% of ATK as DMG to 1 nearby opponent. The Teachings of the Forest effect can be triggered once every 20s."
    }
  },
  {
    "id": "kagotsurubeisshin",
    "name": "Kagotsurube Isshin",
    "nameZh": "笼钓瓶一心",
    "weaponType": "sword",
    "rarity": 4,
    "version": "2.8",
    "versionWeight": 280,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/96/Weapon_Kagotsurube_Isshin.png/revision/latest/scale-to-width-down/60?cb=20231219232710",
    "passive": {
      "name": "Isshin Art Clarity",
      "desc": "When a Normal, Charged, or Plunging Attack hits an opponent, it will whip up a Hewing Gale, dealing AoE DMG equal to 180% of ATK and increasing ATK by 15% for 8s. This effect can be triggered once every 8s."
    }
  },
  {
    "id": "fadingtwilight",
    "name": "Fading Twilight",
    "nameZh": "落霞",
    "weaponType": "bow",
    "rarity": 4,
    "version": "2.7",
    "versionWeight": 270,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2b/Weapon_Fading_Twilight.png/revision/latest/scale-to-width-down/60?cb=20231219232521",
    "passive": {
      "name": "Radiance of the Deeps",
      "desc": "Has three states, Evengleam, Afterglow, and Dawnblaze, which increase DMG dealt by 6/10/14~12/20/28 respectively. When attacks hit opponents, this weapon will switch to the next state. This weapon can change states once every 7s. The character equipping this weapon can still trigger the state switch while not on the field."
    }
  },
  {
    "id": "oathsworneye",
    "name": "Oathsworn Eye",
    "nameZh": "证誓之明瞳",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "2.5",
    "versionWeight": 250,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/af/Weapon_Oathsworn_Eye.png/revision/latest/scale-to-width-down/60?cb=20220217053540",
    "passive": {
      "name": "People of the Faltering Light",
      "desc": "Increases Energy Recharge by 24~48% for 10s after using an Elemental Skill."
    }
  },
  {
    "id": "cinnabarspindle",
    "name": "Cinnabar Spindle",
    "nameZh": "辰砂之纺锤",
    "weaponType": "sword",
    "rarity": 4,
    "version": "2.3",
    "versionWeight": 230,
    "baseAtk": 454,
    "subStat": {
      "type": "defPercent",
      "value": 0.69,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/dc/Weapon_Cinnabar_Spindle.png/revision/latest/scale-to-width-down/60?cb=20211125225624",
    "passive": {
      "name": "Spotless Heart",
      "desc": "Elemental Skill DMG is increased by 40~80% of DEF. The effect will be triggered no more than once every 1.5s and will be cleared 0.1s after the Elemental Skill deals DMG."
    }
  },
  {
    "id": "wavebreakersfin",
    "name": "Wavebreaker's Fin",
    "nameZh": "断浪之鳍",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "2.2",
    "versionWeight": 220,
    "baseAtk": 620,
    "subStat": {
      "type": "atkPercent",
      "value": 0.138,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/66/Weapon_Wavebreaker%27s_Fin.png/revision/latest/scale-to-width-down/60?cb=20231219232055",
    "passive": {
      "name": "Watatsumi Wavewalker",
      "desc": "For every point of the entire party's combined maximum Energy capacity, the Elemental Burst DMG of the character equipping this weapon is increased by 0.12~0.24%. A maximum of 40~80% increased Elemental Burst DMG can be achieved this way."
    }
  },
  {
    "id": "mouunsmoon",
    "name": "Mouun's Moon",
    "nameZh": "曚云之月",
    "weaponType": "bow",
    "rarity": 4,
    "version": "2.2",
    "versionWeight": 220,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/42/Weapon_Mouun%27s_Moon.png/revision/latest/scale-to-width-down/60?cb=20230824222236",
    "passive": {
      "name": "Watatsumi Wavewalker",
      "desc": "For every point of the entire party's combined maximum Energy capacity, the Elemental Burst DMG of the character equipping this weapon is increased by 0.12~0.24%. A maximum of 40~80% increased Elemental Burst DMG can be achieved this way."
    }
  },
  {
    "id": "akuoumaru",
    "name": "Akuoumaru",
    "nameZh": "恶王丸",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "2.2",
    "versionWeight": 220,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c5/Weapon_Akuoumaru.png/revision/latest/scale-to-width-down/60?cb=20211013044027",
    "passive": {
      "name": "Watatsumi Wavewalker",
      "desc": "For every point of the entire party's combined maximum Energy capacity, the Elemental Burst DMG of the character equipping this weapon is increased by 0.12~0.24%. A maximum of 40~80% increased Elemental Burst DMG can be achieved this way."
    }
  },
  {
    "id": "thecatch",
    "name": "\"The Catch\"",
    "nameZh": "“渔获”",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "2.1",
    "versionWeight": 210,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f5/Weapon_The_Catch.png/revision/latest/scale-to-width-down/60?cb=20210901044833",
    "passive": {
      "name": "Shanty",
      "desc": "Increases Elemental Burst DMG by 16~32% and Elemental Burst CRIT Rate by 6~12%."
    }
  },
  {
    "id": "predator",
    "name": "Predator",
    "nameZh": "掠食者",
    "weaponType": "bow",
    "rarity": 4,
    "version": "2.1",
    "versionWeight": 210,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2e/Weapon_Predator.png/revision/latest/scale-to-width-down/60?cb=20211228193811",
    "passive": {
      "name": "Strong Strike",
      "desc": "Effective only on the following platform:\"PlayStation™Network\"Dealing Cryo DMG to opponents increases this character's Normal and Charged Attack DMG by 10% for 6s. This effect can have a maximum of 2 stacks. Additionally, when Aloy equips Predator, ATK is increased by 66."
    }
  },
  {
    "id": "luxurioussealord",
    "name": "Luxurious Sea-Lord",
    "nameZh": "衔珠海皇",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "2.1",
    "versionWeight": 210,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/ab/Weapon_Luxurious_Sea-Lord.png/revision/latest/scale-to-width-down/60?cb=20231219172138",
    "passive": {
      "name": "Oceanic Victory",
      "desc": "Increases Elemental Burst DMG by 12~24%. When Elemental Burst hits opponents, there is a 100% chance of summoning a huge onrush of tuna that deals 100~200% ATK as AoE DMG. This effect can occur once every 15s."
    }
  },
  {
    "id": "hakushinring",
    "name": "Hakushin Ring",
    "nameZh": "白辰之环",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ee/Weapon_Hakushin_Ring.png/revision/latest/scale-to-width-down/60?cb=20210723074418",
    "passive": {
      "name": "Sakura Saiguu",
      "desc": "After the character equipped with this weapon triggers an Electro elemental reaction, nearby party members of an Elemental Type involved in the elemental reaction receive a 10~20% Elemental DMG Bonus for their element, lasting 6s. Elemental Bonuses gained in this way cannot be stacked."
    }
  },
  {
    "id": "kitaincrossspear",
    "name": "Kitain Cross Spear",
    "nameZh": "喜多院十文字",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 565,
    "subStat": {
      "type": "elementalMastery",
      "value": 110,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/13/Weapon_Kitain_Cross_Spear.png/revision/latest/scale-to-width-down/60?cb=20210723074313",
    "passive": {
      "name": "Samurai Conduct",
      "desc": "Increases Elemental Skill DMG by 6~12%. After Elemental Skill hits an opponent, the character loses 3 Energy but regenerates 3~5 Energy every 2s for the next 6s. This effect can occur once every 10s. Can be triggered even when the character is not on the field."
    }
  },
  {
    "id": "katsuragikirinagamasa",
    "name": "Katsuragikiri Nagamasa",
    "nameZh": "桂木斩长正",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2e/Weapon_Katsuragikiri_Nagamasa.png/revision/latest/scale-to-width-down/60?cb=20211103232839",
    "passive": {
      "name": "Samurai Conduct",
      "desc": "Increases Elemental Skill DMG by 6~12%. After Elemental Skill hits an opponent, the character loses 3 Energy but regenerates 3~5 Energy every 2s for the next 6s. This effect can occur once every 10s. Can be triggered even when the character is not on the field."
    }
  },
  {
    "id": "hamayumi",
    "name": "Hamayumi",
    "nameZh": "破魔之弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d9/Weapon_Hamayumi.png/revision/latest/scale-to-width-down/60?cb=20210726032818",
    "passive": {
      "name": "Full Draw",
      "desc": "Increases Normal Attack DMG by 16~32% and Charged Attack DMG by 12~24%. When the equipping character's Energy reaches 100%, this effect is increased by 100%."
    }
  },
  {
    "id": "amenomakageuchi",
    "name": "Amenoma Kageuchi",
    "nameZh": "天目影打刀",
    "weaponType": "sword",
    "rarity": 4,
    "version": "2.0",
    "versionWeight": 200,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ea/Weapon_Amenoma_Kageuchi.png/revision/latest/scale-to-width-down/60?cb=20210723074436",
    "passive": {
      "name": "Iwakura Succession",
      "desc": "After casting an Elemental Skill, gain 1 Succession Seed. This effect can be triggered once every 5s. The Succession Seed lasts for 30s. Up to 3 Succession Seeds may exist simultaneously. After using an Elemental Burst, all Succession Seeds are consumed and after 2s, the character regenerates 6~12 Energy for each seed consumed."
    }
  },
  {
    "id": "mitternachtswaltz",
    "name": "Mitternachts Waltz",
    "nameZh": "幽夜华尔兹",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.6",
    "versionWeight": 160,
    "baseAtk": 510,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.517,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/77/Weapon_Mitternachts_Waltz.png/revision/latest/scale-to-width-down/60?cb=20210611013556",
    "passive": {
      "name": "Evernight Duet",
      "desc": "Normal Attack hits on opponents increase Elemental Skill DMG by 20~40% for 5s. Elemental Skill hits on opponents increase Normal Attack DMG by 20~40% for 5s."
    }
  },
  {
    "id": "dodocotales",
    "name": "Dodoco Tales",
    "nameZh": "嘟嘟可故事集",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.6",
    "versionWeight": 160,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/51/Weapon_Dodoco_Tales.png/revision/latest/scale-to-width-down/60?cb=20210613085809",
    "passive": {
      "name": "Dodoventure!",
      "desc": "Normal Attack hits on opponents increase Charged Attack DMG by 16~32% for 6s. Charged Attack hits on opponents increase ATK by 8~16% for 6s."
    }
  },
  {
    "id": "thealleyflash",
    "name": "The Alley Flash",
    "nameZh": "暗巷闪光",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.4",
    "versionWeight": 140,
    "baseAtk": 620,
    "subStat": {
      "type": "elementalMastery",
      "value": 55,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/83/Weapon_The_Alley_Flash.png/revision/latest/scale-to-width-down/60?cb=20210317151138",
    "passive": {
      "name": "Itinerant Hero",
      "desc": "Increases DMG dealt by the character equipping this weapon by 12~24%. Taking DMG disables this effect for 5s."
    }
  },
  {
    "id": "wineandsong",
    "name": "Wine and Song",
    "nameZh": "暗巷的酒与诗",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.4",
    "versionWeight": 140,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/c6/Weapon_Wine_and_Song.png/revision/latest/scale-to-width-down/60?cb=20210317183126",
    "passive": {
      "name": "Ever-Changing",
      "desc": "Hitting an opponent with a Normal Attack decreases the Stamina consumption of Sprint or Alternate Sprint by 14~22% for 5s. Additionally, using a Sprint or Alternate Sprint ability increases ATK by 20~40% for 5s."
    }
  },
  {
    "id": "alleyhunter",
    "name": "Alley Hunter",
    "nameZh": "暗巷猎手",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.4",
    "versionWeight": 140,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/0a/Weapon_Alley_Hunter.png/revision/latest/scale-to-width-down/60?cb=20220316031100",
    "passive": {
      "name": "Oppidan Ambush",
      "desc": "While the character equipped with this weapon is in the party but not on the field, their DMG increases by 2~4% every second up to a max of 20~40%. When the character is on the field for more than 4s, the aforementioned DMG buff decreases by 4~8% per second until it reaches 0%."
    }
  },
  {
    "id": "windblumeode",
    "name": "Windblume Ode",
    "nameZh": "风花之颂",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.4",
    "versionWeight": 140,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/38/Weapon_Windblume_Ode.png/revision/latest/scale-to-width-down/60?cb=20210317075422",
    "passive": {
      "name": "Windblume Wish",
      "desc": "After using an Elemental Skill, receive a boon from the ancient wish of the Windblume, increasing ATK by 16~32% for 6s."
    }
  },
  {
    "id": "lithicspear",
    "name": "Lithic Spear",
    "nameZh": "千岩长枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.3",
    "versionWeight": 130,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2a/Weapon_Lithic_Spear.png/revision/latest/scale-to-width-down/60?cb=20210225200953",
    "passive": {
      "name": "Lithic Axiom: Unity",
      "desc": "For every character in the party who hails from Liyue, the character who equips this weapon gains 7~11% ATK increase and a 3~7% CRIT Rate increase. This effect stacks up to 4 times."
    }
  },
  {
    "id": "lithicblade",
    "name": "Lithic Blade",
    "nameZh": "千岩古剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.3",
    "versionWeight": 130,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/3a/Weapon_Lithic_Blade.png/revision/latest/scale-to-width-down/60?cb=20210225201003",
    "passive": {
      "name": "Lithic Axiom: Unity",
      "desc": "For every character in the party who hails from Liyue, the character who equips this weapon gains 7~11% ATK increase and 3~7% CRIT Rate increase. This effect stacks up to 4 times."
    }
  },
  {
    "id": "snowtombedstarsilver",
    "name": "Snow-Tombed Starsilver",
    "nameZh": "雪葬的星银",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.2",
    "versionWeight": 120,
    "baseAtk": 565,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.345,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/49/Weapon_Snow-Tombed_Starsilver.png/revision/latest/scale-to-width-down/60?cb=20201223042944",
    "passive": {
      "name": "Frost Burial",
      "desc": "Hitting an opponent with Normal and Charged Attacks has a 60~100% chance of forming and dropping an Everfrost Icicle above them, dealing AoE DMG equal to 80~140% of ATK. Opponents affected by Cryo are instead dealt DMG equal to 200~360% of ATK. Can only occur once every 10s."
    }
  },
  {
    "id": "festeringdesire",
    "name": "Festering Desire",
    "nameZh": "腐殖之剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.2",
    "versionWeight": 120,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/70/Weapon_Festering_Desire.png/revision/latest/scale-to-width-down/60?cb=20201223042935",
    "passive": {
      "name": "Undying Admiration",
      "desc": "Increases Elemental Skill DMG by 16~32% and Elemental Skill CRIT Rate by 6~12%."
    }
  },
  {
    "id": "frostbearer",
    "name": "Frostbearer",
    "nameZh": "忍冬之果",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.2",
    "versionWeight": 120,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1c/Weapon_Frostbearer.png/revision/latest/scale-to-width-down/60?cb=20210209065948",
    "passive": {
      "name": "Frost Burial",
      "desc": "Hitting an opponent with Normal and Charged Attacks has a 60~100% chance of forming and dropping an Everfrost Icicle above them, dealing 80~140% AoE ATK DMG. Opponents affected by Cryo are dealt 200~360% ATK DMG instead by the icicle. Can only occur once every 10s."
    }
  },
  {
    "id": "dragonspinespear",
    "name": "Dragonspine Spear",
    "nameZh": "龙脊长枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.2",
    "versionWeight": 120,
    "baseAtk": 454,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.69,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Weapon_Dragonspine_Spear.png/revision/latest/scale-to-width-down/60?cb=20201223042936",
    "passive": {
      "name": "Frost Burial",
      "desc": "Hitting an opponent with Normal and Charged Attacks has a 60~100% chance of forming and dropping an Everfrost Icicle above them, dealing 80~140% AoE ATK DMG. Opponents affected by Cryo are dealt 200~360% ATK DMG instead by the icicle. Can only occur once every 10s."
    }
  },
  {
    "id": "royalspear",
    "name": "Royal Spear",
    "nameZh": "宗室猎枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.1",
    "versionWeight": 110,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/fd/Weapon_Royal_Spear.png/revision/latest/scale-to-width-down/60?cb=20201202041704",
    "passive": {
      "name": "Focus",
      "desc": "Upon dealing damage to an opponent, increases CRIT Rate by 8~16%. Max 5 stacks. A CRIT hit removes all existing stacks."
    }
  },
  {
    "id": "blackcliffwarbow",
    "name": "Blackcliff Warbow",
    "nameZh": "黑岩战弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "critDmg",
      "value": 0.368,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/b8/Weapon_Blackcliff_Warbow.png/revision/latest/scale-to-width-down/60?cb=20201103093753",
    "passive": {
      "name": "Press the Advantage",
      "desc": "After defeating an opponent, ATK is increased by 12~24% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others."
    }
  },
  {
    "id": "blackclifflongsword",
    "name": "Blackcliff Longsword",
    "nameZh": "黑岩长剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "critDmg",
      "value": 0.368,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6f/Weapon_Blackcliff_Longsword.png/revision/latest/scale-to-width-down/60?cb=20201116033216",
    "passive": {
      "name": "Press the Advantage",
      "desc": "After defeating an opponent, ATK is increased by 12~24% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others."
    }
  },
  {
    "id": "sacrificialgreatsword",
    "name": "Sacrificial Greatsword",
    "nameZh": "祭礼大剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/17/Weapon_Sacrificial_Greatsword.png/revision/latest/scale-to-width-down/60?cb=20201120004023",
    "passive": {
      "name": "Composed",
      "desc": "After dealing damage to an opponent with an Elemental Skill, the skill has a 40~80% chance to end its own CD. Can only occur once every 30~16s."
    }
  },
  {
    "id": "sacrificialbow",
    "name": "Sacrificial Bow",
    "nameZh": "祭礼弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ec/Weapon_Sacrificial_Bow.png/revision/latest/scale-to-width-down/60?cb=20201120002607",
    "passive": {
      "name": "Composed",
      "desc": "After dealing damage to an opponent with an Elemental Skill, the skill has a 40~80% chance to end its own CD. Can only occur once every 30~16s."
    }
  },
  {
    "id": "crescentpike",
    "name": "Crescent Pike",
    "nameZh": "流月针",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.345,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/4c/Weapon_Crescent_Pike.png/revision/latest/scale-to-width-down/60?cb=20201116033544",
    "passive": {
      "name": "Infusion Needle",
      "desc": "After picking up an Elemental Orb/Particle, Normal and Charged Attacks deal an additional 20~40% ATK as DMG for 5s."
    }
  },
  {
    "id": "prototypearchaic",
    "name": "Prototype Archaic",
    "nameZh": "试作古华",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/ab/Weapon_Prototype_Archaic.png/revision/latest/scale-to-width-down/60?cb=20201116034721",
    "passive": {
      "name": "Crush",
      "desc": "On hit, Normal or Charged Attacks have a 50% chance to deal an additional 240~480% ATK DMG to opponents within a small AoE. Can only occur once every 15s."
    }
  },
  {
    "id": "prototyperancour",
    "name": "Prototype Rancour",
    "nameZh": "试作斩岩",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.345,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/ef/Weapon_Prototype_Rancour.png/revision/latest/scale-to-width-down/60?cb=20201116034823",
    "passive": {
      "name": "Smashed Stone",
      "desc": "On hit, Normal or Charged Attacks increase ATK and DEF by 4~8% for 6s. Max 4 stacks. This effect can only occur once every 0.3s."
    }
  },
  {
    "id": "mappamare",
    "name": "Mappa Mare",
    "nameZh": "万国诸海图谱",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "elementalMastery",
      "value": 110,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/4d/Weapon_Mappa_Mare.png/revision/latest/scale-to-width-down/60?cb=20201116034208",
    "passive": {
      "name": "Infusion Scroll",
      "desc": "Triggering an Elemental reaction grants a 8~16% Elemental DMG Bonus for 10s. Max 2 stacks."
    }
  },
  {
    "id": "favoniuslance",
    "name": "Favonius Lance",
    "nameZh": "西风长枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.306,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/5/57/Weapon_Favonius_Lance.png/revision/latest/scale-to-width-down/60?cb=20201116154512",
    "passive": {
      "name": "Windfall",
      "desc": "CRIT Hits have a 60~100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every 12~6s."
    }
  },
  {
    "id": "royalgreatsword",
    "name": "Royal Greatsword",
    "nameZh": "宗室大剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/b/bf/Weapon_Royal_Greatsword.png/revision/latest/scale-to-width-down/60?cb=20201116034928",
    "passive": {
      "name": "Focus",
      "desc": "Upon dealing damage to an opponent, increases CRIT Rate by 8~16%. Max 5 stacks. A CRIT hit removes all existing stacks."
    }
  },
  {
    "id": "royalgrimoire",
    "name": "Royal Grimoire",
    "nameZh": "宗室秘法录",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 565,
    "subStat": {
      "type": "atkPercent",
      "value": 0.276,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/99/Weapon_Royal_Grimoire.png/revision/latest/scale-to-width-down/60?cb=20201120000114",
    "passive": {
      "name": "Focus",
      "desc": "Upon dealing damage to an opponent, increases CRIT Rate by 8~16%. Max 5 stacks. A CRIT hit removes all existing stacks."
    }
  },
  {
    "id": "whiteblind",
    "name": "Whiteblind",
    "nameZh": "白影剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "defPercent",
      "value": 0.517,
      "labelZh": "防御力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/0/04/Weapon_Whiteblind.png/revision/latest/scale-to-width-down/60?cb=20201116035607",
    "passive": {
      "name": "Infusion Blade",
      "desc": "On hit, Normal or Charged Attacks increase ATK and DEF by 6~12% for 6s. Max 4 stacks (24~48%  total). Can only occur once every 0.5s."
    }
  },
  {
    "id": "theviridescenthunt",
    "name": "The Viridescent Hunt",
    "nameZh": "苍翠猎弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Weapon_The_Viridescent_Hunt.png/revision/latest/scale-to-width-down/60?cb=20201120010331",
    "passive": {
      "name": "Verdant Wind",
      "desc": "Upon hit, Normal and Aimed Shot Attacks have a 50% chance to generate a Cyclone, which will continuously attract surrounding opponents, dealing 40~80% of ATK as DMG to these opponents every 0.5s for 4s. This effect can only occur once every 14~10s."
    }
  },
  {
    "id": "serpentspine",
    "name": "Serpent Spine",
    "nameZh": "螭骨剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/88/Weapon_Serpent_Spine.png/revision/latest/scale-to-width-down/60?cb=20201116035126",
    "passive": {
      "name": "Wavesplitter",
      "desc": "Every 4s a character is on the field, they will deal 6~10% more DMG and take 3~2%  more DMG. This effect has a maximum of 5 stacks and will not be reset if the character leaves the field, but will be reduced by 1 stack when the character takes DMG."
    }
  },
  {
    "id": "theflute",
    "name": "The Flute",
    "nameZh": "笛剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/63/Weapon_The_Flute.png/revision/latest/scale-to-width-down/60?cb=20201119203316",
    "passive": {
      "name": "Chord",
      "desc": "Normal or Charged Attacks grant a Harmonic on hits. Gaining 5 Harmonics triggers the power of music and deals 100~200% ATK DMG to surrounding enemies. Harmonics last up to 30s, and a maximum of 1 can be gained every 0.5s."
    }
  },
  {
    "id": "rust",
    "name": "Rust",
    "nameZh": "弓藏",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/1c/Weapon_Rust.png/revision/latest/scale-to-width-down/60?cb=20201120002437",
    "passive": {
      "name": "Rapid Firing",
      "desc": "Increases Normal Attack DMG by 40~80% but decreases Charged Attack DMG by 10%."
    }
  },
  {
    "id": "theblacksword",
    "name": "The Black Sword",
    "nameZh": "黑剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/cf/Weapon_The_Black_Sword.png/revision/latest/scale-to-width-down/60?cb=20201116035352",
    "passive": {
      "name": "Justice",
      "desc": "Increases DMG dealt by Normal and Charged Attacks by 20~40%.Additionally, regenerates 60~100% of ATK as HP when Normal and Charged Attacks score a CRIT Hit. This effect can occur once every 5s."
    }
  },
  {
    "id": "blackcliffpole",
    "name": "Blackcliff Pole",
    "nameZh": "黑岩刺枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critDmg",
      "value": 0.551,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d5/Weapon_Blackcliff_Pole.png/revision/latest/scale-to-width-down/60?cb=20201116153435",
    "passive": {
      "name": "Press the Advantage",
      "desc": "After defeating an opponent, ATK is increased by 12~24% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others."
    }
  },
  {
    "id": "blackcliffagate",
    "name": "Blackcliff Agate",
    "nameZh": "黑岩绯玉",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critDmg",
      "value": 0.551,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a6/Weapon_Blackcliff_Agate.png/revision/latest/scale-to-width-down/60?cb=20201119233950",
    "passive": {
      "name": "Press the Advantage",
      "desc": "After defeating an opponent, ATK is increased by 12~24% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others."
    }
  },
  {
    "id": "blackcliffslasher",
    "name": "Blackcliff Slasher",
    "nameZh": "黑岩斩刀",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critDmg",
      "value": 0.551,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d7/Weapon_Blackcliff_Slasher.png/revision/latest/scale-to-width-down/60?cb=20201116033252",
    "passive": {
      "name": "Press the Advantage",
      "desc": "After defeating an opponent, ATK is increased by 12~24% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others."
    }
  },
  {
    "id": "thestringless",
    "name": "The Stringless",
    "nameZh": "绝弦",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/71/Weapon_The_Stringless.png/revision/latest/scale-to-width-down/60?cb=20201116035406",
    "passive": {
      "name": "Arrowless Song",
      "desc": "Increases Elemental Skill and Elemental Burst DMG by 24~48%."
    }
  },
  {
    "id": "thewidsith",
    "name": "The Widsith",
    "nameZh": "流浪乐章",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critDmg",
      "value": 0.551,
      "labelZh": "暴击伤害"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/f0/Weapon_The_Widsith.png/revision/latest/scale-to-width-down/60?cb=20201119201814",
    "passive": {
      "name": "Debut",
      "desc": "When a character takes the field, they will gain a random theme song for 10s. This can only occur once every 30s. Recitative: ATK is increased by 60~120%. Aria: Increases all Elemental DMG by 48~96%. Interlude: Elemental Mastery is increased by 240~480."
    }
  },
  {
    "id": "prototypecrescent",
    "name": "Prototype Crescent",
    "nameZh": "试作澹月",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/4/43/Weapon_Prototype_Crescent.png/revision/latest/scale-to-width-down/60?cb=20201116034737",
    "passive": {
      "name": "Unreturning",
      "desc": "Charged Attack hits on weak points increase Movement SPD by 10% and ATK by 36~72% for 10s."
    }
  },
  {
    "id": "prototypeamber",
    "name": "Prototype Amber",
    "nameZh": "试作金珀",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/2a/Weapon_Prototype_Amber.png/revision/latest/scale-to-width-down/60?cb=20201116034808",
    "passive": {
      "name": "Gilding",
      "desc": "Using an Elemental Burst regenerates 4~6 Energy every 2s for 6s. All party members will regenerate 4~6% HP every 2s for this duration."
    }
  },
  {
    "id": "prototypestarglitter",
    "name": "Prototype Starglitter",
    "nameZh": "试作星镰",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/7/7e/Weapon_Prototype_Starglitter.png/revision/latest/scale-to-width-down/60?cb=20201116034758",
    "passive": {
      "name": "Magic Affinity",
      "desc": "After using an Elemental Skill, increases Normal and Charged Attack DMG by 8~16% for 12s. Max 2 stacks."
    }
  },
  {
    "id": "ironsting",
    "name": "Iron Sting",
    "nameZh": "铁蜂刺",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/35/Weapon_Iron_Sting.png/revision/latest/scale-to-width-down/60?cb=20201116034058",
    "passive": {
      "name": "Infusion Stinger",
      "desc": "Dealing Elemental DMG increases all DMG by 6~12% for 6s. Max 2 stacks. Can only occur once every 1s."
    }
  },
  {
    "id": "favoniuscodex",
    "name": "Favonius Codex",
    "nameZh": "西风秘典",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.45899999999999996,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/36/Weapon_Favonius_Codex.png/revision/latest/scale-to-width-down/60?cb=20201116033719",
    "passive": {
      "name": "Windfall",
      "desc": "CRIT hits have a 60~100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every 12~6s."
    }
  },
  {
    "id": "lionsroar",
    "name": "Lion's Roar",
    "nameZh": "匣里龙吟",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/e/e6/Weapon_Lion%27s_Roar.png/revision/latest/scale-to-width-down/60?cb=20201119232745",
    "passive": {
      "name": "Bane of Fire and Thunder",
      "desc": "Increases DMG against enemies affected by Pyro or Electro by 20~36%."
    }
  },
  {
    "id": "solarpearl",
    "name": "Solar Pearl",
    "nameZh": "匣里日月",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "critRate",
      "value": 0.276,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/f/fc/Weapon_Solar_Pearl.png/revision/latest/scale-to-width-down/60?cb=20201116035322",
    "passive": {
      "name": "Solar Shine",
      "desc": "Normal Attack hits increase Elemental Skill and Elemental Burst DMG by 20~40% for 6s. Likewise, Elemental Skill or Elemental Burst hits increase Normal Attack DMG by 20~40% for 6s."
    }
  },
  {
    "id": "rainslasher",
    "name": "Rainslasher",
    "nameZh": "雨裁",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "elementalMastery",
      "value": 165,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Weapon_Rainslasher.png/revision/latest/scale-to-width-down/60?cb=20201119235128",
    "passive": {
      "name": "Bane of Storm and Tide",
      "desc": "Increases DMG against opponents affected by Hydro or Electro by 20~36%."
    }
  },
  {
    "id": "thebell",
    "name": "The Bell",
    "nameZh": "钟剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "hpPercent",
      "value": 0.413,
      "labelZh": "生命值"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6e/Weapon_The_Bell.png/revision/latest/scale-to-width-down/60?cb=20201116035344",
    "passive": {
      "name": "Rebellious Guardian",
      "desc": "Taking DMG generates a shield which absorbs DMG up to 20~32% of max HP. This shield lasts for 10s or until broken, and can only be triggered once every 45s. While protected by a shield, the character gains 12~24% increased DMG."
    }
  },
  {
    "id": "royalbow",
    "name": "Royal Bow",
    "nameZh": "宗室长弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/99/Weapon_Royal_Bow.png/revision/latest/scale-to-width-down/60?cb=20201120002134",
    "passive": {
      "name": "Focus",
      "desc": "Upon dealing damage to an opponent, increases CRIT Rate by 8~16%. Max 5 stacks. A CRIT hit removes all existing stacks."
    }
  },
  {
    "id": "royallongsword",
    "name": "Royal Longsword",
    "nameZh": "宗室长剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 510,
    "subStat": {
      "type": "atkPercent",
      "value": 0.413,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/c/cd/Weapon_Royal_Longsword.png/revision/latest/scale-to-width-down/60?cb=20201116034952",
    "passive": {
      "name": "Focus",
      "desc": "Upon dealing damage to an opponent, increases CRIT Rate by 8~16%. Max 5 stacks. A CRIT hit removes all existing stacks."
    }
  },
  {
    "id": "compoundbow",
    "name": "Compound Bow",
    "nameZh": "钢轮弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "physicalDmg",
      "value": 0.69,
      "labelZh": "物理伤害加成"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/3/32/Weapon_Compound_Bow.png/revision/latest/scale-to-width-down/60?cb=20201116033506",
    "passive": {
      "name": "Infusion Arrow",
      "desc": "Normal Attack and Charged Attack hits increase ATK by 4~8% and Normal ATK SPD by 1.2~2.4% for 6s. Max 4 stacks. Can only occur once every 0.3s."
    }
  },
  {
    "id": "sacrificialfragments",
    "name": "Sacrificial Fragments",
    "nameZh": "祭礼残章",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "elementalMastery",
      "value": 221,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6c/Weapon_Sacrificial_Fragments.png/revision/latest/scale-to-width-down/60?cb=20231219233057",
    "passive": {
      "name": "Composed",
      "desc": "After dealing damage to an opponent with an Elemental Skill, the skill has a 40~80% chance to end its own CD. Can only occur once every 30~16s."
    }
  },
  {
    "id": "sacrificialsword",
    "name": "Sacrificial Sword",
    "nameZh": "祭礼剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/a/a0/Weapon_Sacrificial_Sword.png/revision/latest/scale-to-width-down/60?cb=20201120010840",
    "passive": {
      "name": "Composed",
      "desc": "After dealing damage to an opponent with an Elemental Skill, the skill has a 40~80% chance to end its own CD. Can only occur once every 30~16s."
    }
  },
  {
    "id": "deathmatch",
    "name": "Deathmatch",
    "nameZh": "决斗之枪",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "critRate",
      "value": 0.368,
      "labelZh": "暴击率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/69/Weapon_Deathmatch.png/revision/latest/scale-to-width-down/60?cb=20201116154647",
    "passive": {
      "name": "Gladiator",
      "desc": "If there are at least 2 opponents nearby, ATK is increased by 16~32% and DEF is increased by 16~32%. If there are fewer than 2 opponents nearby, ATK is increased by 24~48%."
    }
  },
  {
    "id": "favoniusgreatsword",
    "name": "Favonius Greatsword",
    "nameZh": "西风大剑",
    "weaponType": "claymore",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/9c/Weapon_Favonius_Greatsword.png/revision/latest/scale-to-width-down/60?cb=20201119235934",
    "passive": {
      "name": "Windfall",
      "desc": "CRIT hits have a 60~100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every 12~6s."
    }
  },
  {
    "id": "favoniussword",
    "name": "Favonius Sword",
    "nameZh": "西风剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/9/90/Weapon_Favonius_Sword.png/revision/latest/scale-to-width-down/60?cb=20201116033811",
    "passive": {
      "name": "Windfall",
      "desc": "CRIT hits have a 60~100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every 12~6s."
    }
  },
  {
    "id": "favoniuswarbow",
    "name": "Favonius Warbow",
    "nameZh": "西风猎弓",
    "weaponType": "bow",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "energyRecharge",
      "value": 0.613,
      "labelZh": "元素充能效率"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/8/85/Weapon_Favonius_Warbow.png/revision/latest/scale-to-width-down/60?cb=20201120003145",
    "passive": {
      "name": "Windfall",
      "desc": "CRIT hits have a 60~100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character. Can only occur once every 12~6s."
    }
  },
  {
    "id": "dragonsbane",
    "name": "Dragon's Bane",
    "nameZh": "匣里灭辰",
    "weaponType": "polearm",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "elementalMastery",
      "value": 221,
      "labelZh": "元素精通"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/2/24/Weapon_Dragon%27s_Bane.png/revision/latest/scale-to-width-down/60?cb=20201116033629",
    "passive": {
      "name": "Bane of Flame and Water",
      "desc": "Increases DMG against opponents affected by Hydro or Pyro by 20~36%."
    }
  },
  {
    "id": "eyeofperception",
    "name": "Eye of Perception",
    "nameZh": "昭心",
    "weaponType": "catalyst",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 454,
    "subStat": {
      "type": "atkPercent",
      "value": 0.551,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/6/6c/Weapon_Eye_of_Perception.png/revision/latest/scale-to-width-down/60?cb=20201116033703",
    "passive": {
      "name": "Echo",
      "desc": "Normal and Charged Attacks have a 50% chance to fire a Bolt of Perception, dealing 240~360% ATK as DMG. This bolt can bounce between opponents a maximum of 4 times. This effect can occur once every 12~8s."
    }
  },
  {
    "id": "swordofdescension",
    "name": "Sword of Descension",
    "nameZh": "降临之剑",
    "weaponType": "sword",
    "rarity": 4,
    "version": "1.0",
    "versionWeight": 100,
    "baseAtk": 440,
    "subStat": {
      "type": "atkPercent",
      "value": 0.35200000000000004,
      "labelZh": "攻击力"
    },
    "iconUrl": "https://static.wikia.nocookie.net/gensin-impact/images/1/17/Weapon_Sword_of_Descension.png/revision/latest/scale-to-width-down/60?cb=20201116035338",
    "passive": {
      "name": "Descension",
      "desc": "Effective only on the following platform:\"PlayStation™Network\"Hitting enemies with Normal or Charged Attacks grants a 50% chance to deal 200% ATK as DMG in a small AoE. This effect can only occur once every 10s. Additionally, if the Traveler equips the Sword of Descension, their ATK is increased by 66."
    }
  }
];
