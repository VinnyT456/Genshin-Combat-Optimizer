// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Regenerate with:
//     python3 scripts/generate-artifacts/fetch.py
//     python3 scripts/generate-artifacts/emit.py
//
// ARTIFACT SET REFERENCE RECORDS -- identity, rarity, slots and official prose.
//
// PROVENANCE
//   Primary source   Project Amber (datamined game files)
//                    https://gi.yatta.moe/api/v2/{lang}/reliquary/{id}
//                    locales: en (names/search), chs (display text)
//   Verifier source  Lunaris 7.0.54
//                    https://api.lunaris.moe/data/{version}/en/artifact/{id}.json
//   Fetched at       2026-09-08T01:06:58Z
//
// THIS FILE MAKES NO COMBAT CLAIM. It carries what a set IS -- its name in two
// languages, its rarity, its five slots and the official wording of its
// bonuses. The EFFECTS of those bonuses, with an honest support flag each, live
// in `setEffects.ts`. The split is deliberate: static build stats and
// conditional combat buffs must never travel in one record, or a conditional
// grant gets added to the panel and applied again on the timeline.
//
// WHAT IS ABSENT, AND WHY IT IS ABSENT RATHER THAN GUESSED
// Main-stat and substat value tables are NOT here. Neither source publishes
// them (every candidate endpoint 404s -- see fetch.py). Reconstructing them
// from memory is precisely how this project's 132-character roster came to be
// 83% wrong, so the gap is stated instead: see `MAIN_STAT_VALUES_UNAVAILABLE`.
// ============================================================================

import type { ArtifactSetDefinition } from "../types";

/**
 * The five slots, in the engine's `ARTIFACT_SLOTS` order.
 *
 * Flower and Plume have game-fixed main stats (flat HP and flat ATK). The
 * other three vary, and the legal main-stat set per slot is a game rule that
 * neither source publishes as data -- so it is NOT enumerated here.
 */
export type GeneratedArtifactSlot =
  | "flower"
  | "plume"
  | "sands"
  | "goblet"
  | "circlet";

/** One physical piece of a set: which slot it occupies and what it is called. */
export interface GeneratedArtifactPiece {
  readonly slot: GeneratedArtifactSlot;
  readonly nameEn: string;
  readonly nameZh: string;
}

/**
 * Why no main-stat or substat VALUES appear in this module.
 *
 * Exported as a const so the gap is reachable from TypeScript and shows up in
 * a search, rather than living only in a comment nobody greps. A caller that
 * needs these values must source them; it must not invent them.
 */
export const MAIN_STAT_VALUES_UNAVAILABLE =
  "Artifact main-stat and substat value tables are not published by either " +
  "generator source (Project Amber and Lunaris both 404 on every affix/upgrade " +
  "endpoint probed). No values are emitted. TODO: find a second source that " +
  "publishes per-level main-stat values before any build math depends on them.";

/** Substat rolls are deliberately not modelled. */
export const SUBSTAT_ROLLS_OUT_OF_SCOPE =
  "Substat rolls are out of scope by project rule: the simulation path is " +
  "deterministic and the optimizer depends on that. Substats are the user's " +
  "fixed owned values, entered as data, never randomly rolled.";

/** Every artifact set, in ascending game set-id order. */
export const generatedArtifactSets: readonly (ArtifactSetDefinition & {
  readonly setId: number;
  readonly pieces: readonly GeneratedArtifactPiece[];
})[] = [
  {
    id: "resolution-of-sojourner",
    setId: 10001,
    nameEn: "Resolution of Sojourner",
    nameZh: "行者之心",
    rarity: 4,
    iconId: "UI_RelicIcon_10001_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10001_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "重击的暴击率提升30%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Heart of Comradeship", nameZh: "故人之心" },
      { slot: "plume", nameEn: "Feather of Homecoming", nameZh: "归乡之羽" },
      { slot: "sands", nameEn: "Sundial of the Sojourner", nameZh: "逐光之石" },
      { slot: "goblet", nameEn: "Goblet of the Sojourner", nameZh: "异国之盏" },
      { slot: "circlet", nameEn: "Crown of Parting", nameZh: "感别之冠" },
    ],
  },
  {
    id: "brave-heart",
    setId: 10002,
    nameEn: "Brave Heart",
    nameZh: "勇士之心",
    rarity: 4,
    iconId: "UI_RelicIcon_10002_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10002_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "对生命值高于50%的敌人，造成的伤害增加30%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Medal of the Brave", nameZh: "勇士的勋章" },
      { slot: "plume", nameEn: "Prospect of the Brave", nameZh: "勇士的期许" },
      { slot: "sands", nameEn: "Fortitude of the Brave", nameZh: "勇士的坚毅" },
      { slot: "goblet", nameEn: "Outset of the Brave", nameZh: "勇士的壮行" },
      { slot: "circlet", nameEn: "Crown of the Brave", nameZh: "勇士的冠冕" },
    ],
  },
  {
    id: "defenders-will",
    setId: 10003,
    nameEn: "Defender's Will",
    nameZh: "守护之心",
    rarity: 4,
    iconId: "UI_RelicIcon_10003_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10003_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "防御力提高30%。",
      },
      {
        pieces: 4,
        descriptionZh: "队伍里每有不同一种元素类型的自己的角色，自身获得30%相应的元素抗性。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Guardian's Flower", nameZh: "守护之花" },
      { slot: "plume", nameEn: "Guardian's Sigil", nameZh: "守护徽印" },
      { slot: "sands", nameEn: "Guardian's Clock", nameZh: "守护座钟" },
      { slot: "goblet", nameEn: "Guardian's Vessel", nameZh: "守护之皿" },
      { slot: "circlet", nameEn: "Guardian's Band", nameZh: "守护束带" },
    ],
  },
  {
    id: "tiny-miracle",
    setId: 10004,
    nameEn: "Tiny Miracle",
    nameZh: "奇迹",
    rarity: 4,
    iconId: "UI_RelicIcon_10004_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10004_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "所有元素抗性提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "受到某个元素类型的伤害后，相应的抗性提升30%，持续10秒。该效果每10秒只能触发一次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Tiny Miracle's Flower", nameZh: "奇迹之花" },
      { slot: "plume", nameEn: "Tiny Miracle's Feather", nameZh: "奇迹之羽" },
      { slot: "sands", nameEn: "Tiny Miracle's Hourglass", nameZh: "奇迹之沙" },
      { slot: "goblet", nameEn: "Tiny Miracle's Goblet", nameZh: "奇迹之杯" },
      { slot: "circlet", nameEn: "Tiny Miracle's Earrings", nameZh: "奇迹耳坠" },
    ],
  },
  {
    id: "berserker",
    setId: 10005,
    nameEn: "Berserker",
    nameZh: "战狂",
    rarity: 4,
    iconId: "UI_RelicIcon_10005_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10005_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "暴击率提高12%。",
      },
      {
        pieces: 4,
        descriptionZh: "生命值低于70%时，暴击率额外提升24%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Berserker's Rose", nameZh: "战狂的蔷薇" },
      { slot: "plume", nameEn: "Berserker's Indigo Feather", nameZh: "战狂的翎羽" },
      { slot: "sands", nameEn: "Berserker's Timepiece", nameZh: "战狂的时计" },
      { slot: "goblet", nameEn: "Berserker's Bone Goblet", nameZh: "战狂的骨杯" },
      { slot: "circlet", nameEn: "Berserker's Battle Mask", nameZh: "战狂的鬼面" },
    ],
  },
  {
    id: "martial-artist",
    setId: 10006,
    nameEn: "Martial Artist",
    nameZh: "武人",
    rarity: 4,
    iconId: "UI_RelicIcon_10006_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10006_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "普通攻击与重击造成的伤害提高15%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素战技后的8秒内，普通攻击和重击造成的伤害提升25%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Martial Artist's Red Flower", nameZh: "武人的红花" },
      { slot: "plume", nameEn: "Martial Artist's Feather Accessory", nameZh: "武人的羽饰" },
      { slot: "sands", nameEn: "Martial Artist's Water Hourglass", nameZh: "武人的水漏" },
      { slot: "goblet", nameEn: "Martial Artist's Wine Cup", nameZh: "武人的酒杯" },
      { slot: "circlet", nameEn: "Martial Artist's Bandana", nameZh: "武人的头巾" },
    ],
  },
  {
    id: "instructor",
    setId: 10007,
    nameEn: "Instructor",
    nameZh: "教官",
    rarity: 4,
    iconId: "UI_RelicIcon_10007_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10007_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "触发元素反应后，队伍中所有角色的元素精通提高120点，持续8秒。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Instructor's Brooch", nameZh: "教官的胸花" },
      { slot: "plume", nameEn: "Instructor's Feather Accessory", nameZh: "教官的羽饰" },
      { slot: "sands", nameEn: "Instructor's Pocket Watch", nameZh: "教官的怀表" },
      { slot: "goblet", nameEn: "Instructor's Tea Cup", nameZh: "教官的茶杯" },
      { slot: "circlet", nameEn: "Instructor's Cap", nameZh: "教官的帽子" },
    ],
  },
  {
    id: "gambler",
    setId: 10008,
    nameEn: "Gambler",
    nameZh: "赌徒",
    rarity: 4,
    iconId: "UI_RelicIcon_10008_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10008_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素战技造成的伤害提升20%。",
      },
      {
        pieces: 4,
        descriptionZh: "击败敌人时，有100%概率清除元素战技的冷却时间。该效果每15秒至多触发一次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Gambler's Brooch", nameZh: "赌徒的胸花" },
      { slot: "plume", nameEn: "Gambler's Feather Accessory", nameZh: "赌徒的羽饰" },
      { slot: "sands", nameEn: "Gambler's Pocket Watch", nameZh: "赌徒的怀表" },
      { slot: "goblet", nameEn: "Gambler's Dice Cup", nameZh: "赌徒的骰盅" },
      { slot: "circlet", nameEn: "Gambler's Earrings", nameZh: "赌徒的耳环" },
    ],
  },
  {
    id: "the-exile",
    setId: 10009,
    nameEn: "The Exile",
    nameZh: "流放者",
    rarity: 4,
    iconId: "UI_RelicIcon_10009_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10009_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素充能效率提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素爆发后，每2秒为队伍中所有角色（不包括自己）恢复2点元素能量。该效果持续6秒，无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Exile's Flower", nameZh: "流放者之花" },
      { slot: "plume", nameEn: "Exile's Feather", nameZh: "流放者之羽" },
      { slot: "sands", nameEn: "Exile's Pocket Watch", nameZh: "流放者怀表" },
      { slot: "goblet", nameEn: "Exile's Goblet", nameZh: "流放者之杯" },
      { slot: "circlet", nameEn: "Exile's Circlet", nameZh: "流放者头冠" },
    ],
  },
  {
    id: "adventurer",
    setId: 10010,
    nameEn: "Adventurer",
    nameZh: "冒险家",
    rarity: 3,
    iconId: "UI_RelicIcon_10010_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10010_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "生命值上限提高1000点。",
      },
      {
        pieces: 4,
        descriptionZh: "开启各类宝箱后的5秒内，持续恢复30%生命值。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Adventurer's Flower", nameZh: "冒险家之花" },
      { slot: "plume", nameEn: "Adventurer's Tail Feather", nameZh: "冒险家尾羽" },
      { slot: "sands", nameEn: "Adventurer's Pocket Watch", nameZh: "冒险家怀表" },
      { slot: "goblet", nameEn: "Adventurer's Golden Goblet", nameZh: "冒险家金杯" },
      { slot: "circlet", nameEn: "Adventurer's Bandana", nameZh: "冒险家头带" },
    ],
  },
  {
    id: "lucky-dog",
    setId: 10011,
    nameEn: "Lucky Dog",
    nameZh: "幸运儿",
    rarity: 3,
    iconId: "UI_RelicIcon_10011_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10011_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "防御力提高100点。",
      },
      {
        pieces: 4,
        descriptionZh: "拾取摩拉时，恢复300点生命值。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Lucky Dog's Clover", nameZh: "幸运儿绿花" },
      { slot: "plume", nameEn: "Lucky Dog's Eagle Feather", nameZh: "幸运儿鹰羽" },
      { slot: "sands", nameEn: "Lucky Dog's Hourglass", nameZh: "幸运儿沙漏" },
      { slot: "goblet", nameEn: "Lucky Dog's Goblet", nameZh: "幸运儿之杯" },
      { slot: "circlet", nameEn: "Lucky Dog's Silver Circlet", nameZh: "幸运儿银冠" },
    ],
  },
  {
    id: "scholar",
    setId: 10012,
    nameEn: "Scholar",
    nameZh: "学士",
    rarity: 4,
    iconId: "UI_RelicIcon_10012_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10012_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素充能效率提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "获得元素微粒或元素晶球时，队伍中所有弓箭和法器角色额外恢复3点元素能量。该效果每3秒只能触发一次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Scholar's Bookmark", nameZh: "学士的书签" },
      { slot: "plume", nameEn: "Scholar's Quill Pen", nameZh: "学士的羽笔" },
      { slot: "sands", nameEn: "Scholar's Clock", nameZh: "学士的时钟" },
      { slot: "goblet", nameEn: "Scholar's Ink Cup", nameZh: "学士的墨杯" },
      { slot: "circlet", nameEn: "Scholar's Lens", nameZh: "学士的镜片" },
    ],
  },
  {
    id: "traveling-doctor",
    setId: 10013,
    nameEn: "Traveling Doctor",
    nameZh: "游医",
    rarity: 3,
    iconId: "UI_RelicIcon_10013_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_10013_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "角色受到的治疗效果提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素爆发时，恢复20%生命值。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Traveling Doctor's Silver Lotus", nameZh: "游医的银莲" },
      { slot: "plume", nameEn: "Traveling Doctor's Owl Feather", nameZh: "游医的枭羽" },
      { slot: "sands", nameEn: "Traveling Doctor's Pocket Watch", nameZh: "游医的怀钟" },
      { slot: "goblet", nameEn: "Traveling Doctor's Medicine Pot", nameZh: "游医的药壶" },
      { slot: "circlet", nameEn: "Traveling Doctor's Handkerchief", nameZh: "游医的方巾" },
    ],
  },
  {
    id: "blizzard-strayer",
    setId: 14001,
    nameEn: "Blizzard Strayer",
    nameZh: "冰风迷途的勇士",
    rarity: 5,
    iconId: "UI_RelicIcon_14001_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_14001_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%冰元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "攻击处于冰元素影响下的敌人时，暴击率提高20%；若敌人处于冻结状态下，则暴击率额外提高20%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Snowswept Memory", nameZh: "历经风雪的思念" },
      { slot: "plume", nameEn: "Icebreaker's Resolve", nameZh: "摧冰而行的执望" },
      { slot: "sands", nameEn: "Frozen Homeland's Demise", nameZh: "冰雪故园的终期" },
      { slot: "goblet", nameEn: "Frost-Weaved Dignity", nameZh: "遍结寒霜的傲骨" },
      { slot: "circlet", nameEn: "Broken Rime's Echo", nameZh: "破冰踏雪的回音" },
    ],
  },
  {
    id: "thundersoother",
    setId: 14002,
    nameEn: "Thundersoother",
    nameZh: "平息鸣雷的尊者",
    rarity: 5,
    iconId: "UI_RelicIcon_14002_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_14002_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "雷元素抗性提高40%。",
      },
      {
        pieces: 4,
        descriptionZh: "对处于雷元素影响下的敌人造成的伤害提升35%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Thundersoother's Heart", nameZh: "平雷之心" },
      { slot: "plume", nameEn: "Thundersoother's Plume", nameZh: "平雷之羽" },
      { slot: "sands", nameEn: "Hour of Soothing Thunder", nameZh: "平雷之刻" },
      { slot: "goblet", nameEn: "Thundersoother's Goblet", nameZh: "平雷之器" },
      { slot: "circlet", nameEn: "Thundersoother's Diadem", nameZh: "平雷之冠" },
    ],
  },
  {
    id: "lavawalker",
    setId: 14003,
    nameEn: "Lavawalker",
    nameZh: "渡过烈火的贤人",
    rarity: 5,
    iconId: "UI_RelicIcon_14003_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_14003_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "火元素抗性提高40%。",
      },
      {
        pieces: 4,
        descriptionZh: "对处于火元素影响下的敌人造成的伤害提升35%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Lavawalker's Resolution", nameZh: "渡火者的决绝" },
      { slot: "plume", nameEn: "Lavawalker's Salvation", nameZh: "渡火者的解脱" },
      { slot: "sands", nameEn: "Lavawalker's Torment", nameZh: "渡火者的煎熬" },
      { slot: "goblet", nameEn: "Lavawalker's Epiphany", nameZh: "渡火者的醒悟" },
      { slot: "circlet", nameEn: "Lavawalker's Wisdom", nameZh: "渡火者的智慧" },
    ],
  },
  {
    id: "maiden-beloved",
    setId: 14004,
    nameEn: "Maiden Beloved",
    nameZh: "被怜爱的少女",
    rarity: 5,
    iconId: "UI_RelicIcon_14004_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_14004_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "角色造成的治疗效果提升15%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素战技或元素爆发后的10秒内，队伍中所有角色受治疗效果加成提高20%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Maiden's Distant Love", nameZh: "远方的少女之心" },
      { slot: "plume", nameEn: "Maiden's Heart-stricken Infatuation", nameZh: "少女飘摇的思念" },
      { slot: "sands", nameEn: "Maiden's Passing Youth", nameZh: "少女苦短的良辰" },
      { slot: "goblet", nameEn: "Maiden's Fleeting Leisure", nameZh: "少女片刻的闲暇" },
      { slot: "circlet", nameEn: "Maiden's Fading Beauty", nameZh: "少女易逝的芳颜" },
    ],
  },
  {
    id: "gladiators-finale",
    setId: 15001,
    nameEn: "Gladiator's Finale",
    nameZh: "角斗士的终幕礼",
    rarity: 5,
    iconId: "UI_RelicIcon_15001_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15001_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备该圣遗物套装的角色为单手剑、双手剑、长柄武器角色时，角色普通攻击造成的伤害提高35%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Gladiator's Nostalgia", nameZh: "角斗士的留恋" },
      { slot: "plume", nameEn: "Gladiator's Destiny", nameZh: "角斗士的归宿" },
      { slot: "sands", nameEn: "Gladiator's Longing", nameZh: "角斗士的希冀" },
      { slot: "goblet", nameEn: "Gladiator's Intoxication", nameZh: "角斗士的酣醉" },
      { slot: "circlet", nameEn: "Gladiator's Triumphus", nameZh: "角斗士的凯旋" },
    ],
  },
  {
    id: "viridescent-venerer",
    setId: 15002,
    nameEn: "Viridescent Venerer",
    nameZh: "翠绿之影",
    rarity: 5,
    iconId: "UI_RelicIcon_15002_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15002_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%风元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "扩散反应造成的伤害提升60%，星扩散反应造成的伤害提升20%。根据扩散的元素类型，降低受到影响的敌人40%的对应元素抗性，持续10秒。对敌人触发星扩散反应时，也会降低其40%的冰元素抗性。同元素类型的抗性降低效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "In Remembrance of Viridescent Fields", nameZh: "野花记忆的绿野" },
      { slot: "plume", nameEn: "Viridescent Arrow Feather", nameZh: "猎人青翠的箭羽" },
      { slot: "sands", nameEn: "Viridescent Venerer's Determination", nameZh: "翠绿猎人的笃定" },
      { slot: "goblet", nameEn: "Viridescent Venerer's Vessel", nameZh: "翠绿猎人的容器" },
      { slot: "circlet", nameEn: "Viridescent Venerer's Diadem", nameZh: "翠绿的猎人之冠" },
    ],
  },
  {
    id: "wanderers-troupe",
    setId: 15003,
    nameEn: "Wanderer's Troupe",
    nameZh: "流浪大地的乐团",
    rarity: 5,
    iconId: "UI_RelicIcon_15003_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15003_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "装备该圣遗物套装的角色为法器、弓箭角色时，角色重击造成的伤害提高35%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Troupe's Dawnlight", nameZh: "乐团的晨光" },
      { slot: "plume", nameEn: "Bard's Arrow Feather", nameZh: "琴师的箭羽" },
      { slot: "sands", nameEn: "Concert's Final Hour", nameZh: "终幕的时计" },
      { slot: "goblet", nameEn: "Wanderer's String-Kettle", nameZh: "吟游者之壶" },
      { slot: "circlet", nameEn: "Conductor's Top Hat", nameZh: "指挥的礼帽" },
    ],
  },
  {
    id: "thundering-fury",
    setId: 15005,
    nameEn: "Thundering Fury",
    nameZh: "如雷的盛怒",
    rarity: 5,
    iconId: "UI_RelicIcon_15005_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15005_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%雷元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "超载、感电、超导、超绽放反应造成的伤害提升40%，超激化反应带来的伤害提升提高20%，月感电、星超导反应造成的伤害提升20%。触发上述元素反应或原激化反应时，元素战技冷却时间减少1秒。该效果每0.8秒最多触发一次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Thunderbird's Mercy", nameZh: "雷鸟的怜悯" },
      { slot: "plume", nameEn: "Survivor of Catastrophe", nameZh: "雷灾的孑遗" },
      { slot: "sands", nameEn: "Hourglass of Thunder", nameZh: "雷霆的时计" },
      { slot: "goblet", nameEn: "Omen of Thunderstorm", nameZh: "降雷的凶兆" },
      { slot: "circlet", nameEn: "Thunder Summoner's Crown", nameZh: "唤雷的头冠" },
    ],
  },
  {
    id: "crimson-witch-of-flames",
    setId: 15006,
    nameEn: "Crimson Witch of Flames",
    nameZh: "炽烈的炎之魔女",
    rarity: 5,
    iconId: "UI_RelicIcon_15006_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15006_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%火元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "超载、燃烧、烈绽放反应造成的伤害提升40%，蒸发、融化反应的加成系数提高15%。施放元素战技后的10秒内，2件套的效果提高50%，该效果最多叠加3次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Witch's Flower of Blaze", nameZh: "魔女的炎之花" },
      { slot: "plume", nameEn: "Witch's Ever-Burning Plume", nameZh: "魔女常燃之羽" },
      { slot: "sands", nameEn: "Witch's End Time", nameZh: "魔女破灭之时" },
      { slot: "goblet", nameEn: "Witch's Heart Flames", nameZh: "魔女的心之火" },
      { slot: "circlet", nameEn: "Witch's Scorching Hat", nameZh: "焦灼的魔女帽" },
    ],
  },
  {
    id: "noblesse-oblige",
    setId: 15007,
    nameEn: "Noblesse Oblige",
    nameZh: "昔日宗室之仪",
    rarity: 5,
    iconId: "UI_RelicIcon_15007_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15007_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素爆发造成的伤害提升20%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素爆发后，队伍中所有角色攻击力提升20%，持续12秒。该效果不可叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Royal Flora", nameZh: "宗室之花" },
      { slot: "plume", nameEn: "Royal Plume", nameZh: "宗室之翎" },
      { slot: "sands", nameEn: "Royal Pocket Watch", nameZh: "宗室时计" },
      { slot: "goblet", nameEn: "Royal Silver Urn", nameZh: "宗室银瓮" },
      { slot: "circlet", nameEn: "Royal Masque", nameZh: "宗室面具" },
    ],
  },
  {
    id: "bloodstained-chivalry",
    setId: 15008,
    nameEn: "Bloodstained Chivalry",
    nameZh: "染血的骑士道",
    rarity: 5,
    iconId: "UI_RelicIcon_15008_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15008_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "造成的物理伤害提高25%。",
      },
      {
        pieces: 4,
        descriptionZh: "击败敌人后的10秒内，施放重击时不消耗体力，且重击造成的伤害提升50%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Bloodstained Flower of Iron", nameZh: "染血的铁之心" },
      { slot: "plume", nameEn: "Bloodstained Black Plume", nameZh: "染血的黑之羽" },
      { slot: "sands", nameEn: "Bloodstained Final Hour", nameZh: "骑士染血之时" },
      { slot: "goblet", nameEn: "Bloodstained Chevalier's Goblet", nameZh: "染血骑士之杯" },
      { slot: "circlet", nameEn: "Bloodstained Iron Mask", nameZh: "染血的铁假面" },
    ],
  },
  {
    id: "prayers-for-illumination",
    setId: 15009,
    nameEn: "Prayers for Illumination",
    nameZh: "祭火之人",
    rarity: 4,
    iconId: "UI_RelicIcon_15009_3",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15009_3.png",
    bonuses: [
      {
        pieces: 1,
        descriptionZh: "受到的火元素附着效果的持续时间减少40%。",
      },
    ],
    pieces: [
      { slot: "circlet", nameEn: "Tiara of Flame", nameZh: "祭火礼冠" },
    ],
  },
  {
    id: "prayers-for-destiny",
    setId: 15010,
    nameEn: "Prayers for Destiny",
    nameZh: "祭水之人",
    rarity: 4,
    iconId: "UI_RelicIcon_15010_3",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15010_3.png",
    bonuses: [
      {
        pieces: 1,
        descriptionZh: "受到的水元素附着效果的持续时间减少40%。",
      },
    ],
    pieces: [
      { slot: "circlet", nameEn: "Tiara of Torrents", nameZh: "祭水礼冠" },
    ],
  },
  {
    id: "prayers-for-wisdom",
    setId: 15011,
    nameEn: "Prayers for Wisdom",
    nameZh: "祭雷之人",
    rarity: 4,
    iconId: "UI_RelicIcon_15011_3",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15011_3.png",
    bonuses: [
      {
        pieces: 1,
        descriptionZh: "受到的雷元素附着效果的持续时间减少40%。",
      },
    ],
    pieces: [
      { slot: "circlet", nameEn: "Tiara of Thunder", nameZh: "祭雷礼冠" },
    ],
  },
  {
    id: "prayers-to-springtime",
    setId: 15013,
    nameEn: "Prayers to Springtime",
    nameZh: "祭冰之人",
    rarity: 4,
    iconId: "UI_RelicIcon_15013_3",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15013_3.png",
    bonuses: [
      {
        pieces: 1,
        descriptionZh: "受到的冰元素附着效果的持续时间减少40%。",
      },
    ],
    pieces: [
      { slot: "circlet", nameEn: "Tiara of Frost", nameZh: "祭冰礼冠" },
    ],
  },
  {
    id: "archaic-petra",
    setId: 15014,
    nameEn: "Archaic Petra",
    nameZh: "悠古的磐岩",
    rarity: 5,
    iconId: "UI_RelicIcon_15014_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15014_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%岩元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "获得结晶反应形成的晶片或触发月结晶反应时，队伍中所有角色获得35%对应元素伤害加成，持续10秒。同时只能通过该效果获得一种元素伤害加成。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Flower of Creviced Cliff", nameZh: "磐陀裂生之花" },
      { slot: "plume", nameEn: "Feather of Jagged Peaks", nameZh: "嵯峨群峰之翼" },
      { slot: "sands", nameEn: "Sundial of Enduring Jade", nameZh: "星罗圭璧之晷" },
      { slot: "goblet", nameEn: "Goblet of Chiseled Crag", nameZh: "巉岩琢塑之樽" },
      { slot: "circlet", nameEn: "Mask of Solitude Basalt", nameZh: "不动玄石之相" },
    ],
  },
  {
    id: "retracing-bolide",
    setId: 15015,
    nameEn: "Retracing Bolide",
    nameZh: "逆飞的流星",
    rarity: 5,
    iconId: "UI_RelicIcon_15015_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15015_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "护盾强效提高35%。",
      },
      {
        pieces: 4,
        descriptionZh: "处于护盾庇护下时，额外获得40%普通攻击和重击伤害加成。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Summer Night's Bloom", nameZh: "夏祭之花" },
      { slot: "plume", nameEn: "Summer Night's Finale", nameZh: "夏祭终末" },
      { slot: "sands", nameEn: "Summer Night's Moment", nameZh: "夏祭之刻" },
      { slot: "goblet", nameEn: "Summer Night's Waterballoon", nameZh: "夏祭水玉" },
      { slot: "circlet", nameEn: "Summer Night's Mask", nameZh: "夏祭之面" },
    ],
  },
  {
    id: "heart-of-depth",
    setId: 15016,
    nameEn: "Heart of Depth",
    nameZh: "沉沦之心",
    rarity: 5,
    iconId: "UI_RelicIcon_15016_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15016_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%水元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素战技后的15秒内，普通攻击与重击造成的伤害提高30%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Gilded Corsage", nameZh: "饰金胸花" },
      { slot: "plume", nameEn: "Gust of Nostalgia", nameZh: "追忆之风" },
      { slot: "sands", nameEn: "Copper Compass", nameZh: "坚铜罗盘" },
      { slot: "goblet", nameEn: "Goblet of Thundering Deep", nameZh: "沉波之盏" },
      { slot: "circlet", nameEn: "Wine-Stained Tricorne", nameZh: "酒渍船帽" },
    ],
  },
  {
    id: "tenacity-of-the-millelith",
    setId: 15017,
    nameEn: "Tenacity of the Millelith",
    nameZh: "千岩牢固",
    rarity: 5,
    iconId: "UI_RelicIcon_15017_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15017_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "生命值提升20%。",
      },
      {
        pieces: 4,
        descriptionZh: "元素战技命中敌人后，使队伍中附近的所有角色攻击力提升20%，护盾强效提升30%，持续3秒。该效果每0.5秒至多触发一次。装备此圣遗物套装的角色处于队伍后台时，依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Flower of Accolades", nameZh: "勋绩之花" },
      { slot: "plume", nameEn: "Ceremonial War-Plume", nameZh: "昭武翎羽" },
      { slot: "sands", nameEn: "Orichalceous Time-Dial", nameZh: "金铜时晷" },
      { slot: "goblet", nameEn: "Noble's Pledging Vessel", nameZh: "盟誓金爵" },
      { slot: "circlet", nameEn: "General's Ancient Helm", nameZh: "将帅兜鍪" },
    ],
  },
  {
    id: "pale-flame",
    setId: 15018,
    nameEn: "Pale Flame",
    nameZh: "苍白之火",
    rarity: 5,
    iconId: "UI_RelicIcon_15018_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15018_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "造成的物理伤害提高25%。",
      },
      {
        pieces: 4,
        descriptionZh: "元素战技命中敌人后，攻击力提升9%。该效果持续7秒，至多叠加2层，每0.3秒至多触发一次。叠满2层时，2件套的效果提升100%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Stainless Bloom", nameZh: "无垢之花" },
      { slot: "plume", nameEn: "Wise Doctor's Pinion", nameZh: "贤医之羽" },
      { slot: "sands", nameEn: "Moment of Cessation", nameZh: "停摆之刻" },
      { slot: "goblet", nameEn: "Surpassing Cup", nameZh: "超越之盏" },
      { slot: "circlet", nameEn: "Mocking Mask", nameZh: "嗤笑之面" },
    ],
  },
  {
    id: "shimenawas-reminiscence",
    setId: 15019,
    nameEn: "Shimenawa's Reminiscence",
    nameZh: "追忆之注连",
    rarity: 5,
    iconId: "UI_RelicIcon_15019_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15019_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素战技时，如果角色的元素能量高于或等于15点，则会流失15点元素能量，使接下来的10秒内，普通攻击、重击、下落攻击造成的伤害提高50%，持续期间内该效果不会再次触发。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Entangling Bloom", nameZh: "羁缠之花" },
      { slot: "plume", nameEn: "Shaft of Remembrance", nameZh: "思忆之矢" },
      { slot: "sands", nameEn: "Morning Dew's Moment", nameZh: "朝露之时" },
      { slot: "goblet", nameEn: "Hopeful Heart", nameZh: "祈望之心" },
      { slot: "circlet", nameEn: "Capricious Visage", nameZh: "无常之面" },
    ],
  },
  {
    id: "emblem-of-severed-fate",
    setId: 15020,
    nameEn: "Emblem of Severed Fate",
    nameZh: "绝缘之旗印",
    rarity: 5,
    iconId: "UI_RelicIcon_15020_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15020_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素充能效率提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "基于元素充能效率的25%，提高元素爆发造成的伤害。至多通过这种方式获得75%提升。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Magnificent Tsuba", nameZh: "明威之镡" },
      { slot: "plume", nameEn: "Sundered Feather", nameZh: "切落之羽" },
      { slot: "sands", nameEn: "Storm Cage", nameZh: "雷云之笼" },
      { slot: "goblet", nameEn: "Scarlet Vessel", nameZh: "绯花之壶" },
      { slot: "circlet", nameEn: "Ornate Kabuto", nameZh: "华饰之兜" },
    ],
  },
  {
    id: "husk-of-opulent-dreams",
    setId: 15021,
    nameEn: "Husk of Opulent Dreams",
    nameZh: "华馆梦醒形骸记",
    rarity: 5,
    iconId: "UI_RelicIcon_15021_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15021_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "防御力提高30%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备此圣遗物套装的角色在以下情况下，将获得「问答」效果：在场上用岩元素攻击命中敌人后获得一层，每0.3秒至多触发一次；在队伍后台中，每3秒获得一层。问答至多叠加4层，每层能提供6%防御力与6%岩元素伤害加成。每6秒，若未获得问答效果，将损失一层。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Bloom Times", nameZh: "荣花之期" },
      { slot: "plume", nameEn: "Plume of Luxury", nameZh: "华馆之羽" },
      { slot: "sands", nameEn: "Song of Life", nameZh: "众生之谣" },
      { slot: "goblet", nameEn: "Calabash of Awakening", nameZh: "梦醒之瓢" },
      { slot: "circlet", nameEn: "Skeletal Hat", nameZh: "形骸之笠" },
    ],
  },
  {
    id: "ocean-hued-clam",
    setId: 15022,
    nameEn: "Ocean-Hued Clam",
    nameZh: "海染砗磲",
    rarity: 5,
    iconId: "UI_RelicIcon_15022_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15022_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "治疗加成提高15%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备此圣遗物套装的角色对队伍中的角色进行治疗时，将产生持续3秒的海染泡沫，记录治疗的生命值回复量（包括溢出值）。持续时间结束时，海染泡沫将会爆炸，对周围的敌人造成90%累计回复量的伤害（该伤害结算方式同感电、超导等元素反应，但不受元素精通、等级或反应伤害加成效果影响）。每3.5秒至多产生一个海染泡沫；海染泡沫至多记录30000点回复量，含溢出部分的治疗量；自己的队伍中同时至多存在一个海染泡沫。装备此圣遗物套装的角色处于队伍后台时，依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Sea-Dyed Blossom", nameZh: "海染之花" },
      { slot: "plume", nameEn: "Deep Palace's Plume", nameZh: "渊宫之羽" },
      { slot: "sands", nameEn: "Cowry of Parting", nameZh: "离别之贝" },
      { slot: "goblet", nameEn: "Pearl Cage", nameZh: "真珠之笼" },
      { slot: "circlet", nameEn: "Crown of Watatsumi", nameZh: "海祇之冠" },
    ],
  },
  {
    id: "vermillion-hereafter",
    setId: 15023,
    nameEn: "Vermillion Hereafter",
    nameZh: "辰砂往生录",
    rarity: 5,
    iconId: "UI_RelicIcon_15023_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15023_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素爆发后，将产生持续16秒的「潜光」效果：攻击力提升8%；并在角色的生命值降低时，攻击力进一步提升10%，至多通过这种方式提升4次，每0.8秒至多触发一次。「潜光」效果将在角色退场时消失；持续期间再次施放元素爆发，将移除原有的「潜光」。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Flowering Life", nameZh: "生灵之华" },
      { slot: "plume", nameEn: "Feather of Nascent Light", nameZh: "潜光片羽" },
      { slot: "sands", nameEn: "Solar Relic", nameZh: "阳辔之遗" },
      { slot: "goblet", nameEn: "Moment of the Pact", nameZh: "结契之刻" },
      { slot: "circlet", nameEn: "Thundering Poise", nameZh: "虺雷之姿" },
    ],
  },
  {
    id: "echoes-of-an-offering",
    setId: 15024,
    nameEn: "Echoes of an Offering",
    nameZh: "来歆余响",
    rarity: 5,
    iconId: "UI_RelicIcon_15024_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15024_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "普通攻击命中敌人时，有36%概率触发「幽谷祝祀」：普通攻击造成的伤害提高，伤害提高值为攻击力的70%，该效果将在普通攻击造成伤害后的0.05秒后清除。普通攻击未触发「幽谷祝祀」时，会使下次触发概率提升20%；0.2秒内至多判定1次触发与否。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Soulscent Bloom", nameZh: "魂香之花" },
      { slot: "plume", nameEn: "Jade Leaf", nameZh: "垂玉之叶" },
      { slot: "sands", nameEn: "Symbol of Felicitation", nameZh: "祝祀之凭" },
      { slot: "goblet", nameEn: "Chalice of the Font", nameZh: "涌泉之盏" },
      { slot: "circlet", nameEn: "Flowing Rings", nameZh: "浮溯之珏" },
    ],
  },
  {
    id: "deepwood-memories",
    setId: 15025,
    nameEn: "Deepwood Memories",
    nameZh: "深林的记忆",
    rarity: 5,
    iconId: "UI_RelicIcon_15025_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15025_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%草元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "元素战技或元素爆发命中敌人后，使命中目标的草元素抗性降低30%，持续8秒。装备者处于队伍后台时，依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Labyrinth Wayfarer", nameZh: "迷宫的游人" },
      { slot: "plume", nameEn: "Scholar of Vines", nameZh: "翠蔓的智者" },
      { slot: "sands", nameEn: "A Time of Insight", nameZh: "贤智的定期" },
      { slot: "goblet", nameEn: "Lamp of the Lost", nameZh: "迷误者之灯" },
      { slot: "circlet", nameEn: "Laurel Coronet", nameZh: "月桂的宝冠" },
    ],
  },
  {
    id: "gilded-dreams",
    setId: 15026,
    nameEn: "Gilded Dreams",
    nameZh: "饰金之梦",
    rarity: 5,
    iconId: "UI_RelicIcon_15026_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15026_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "触发元素反应后的8秒内，会根据队伍内其他角色的元素类型，使装备者获得强化：队伍中每存在1个和装备者同类元素的角色，攻击力提升14%；每存在1个和装备者不同元素类型的角色，元素精通提升50点。上述每类效果至多计算3个角色。该效果每8秒至多触发一次。装备者处于队伍后台时，依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Dreaming Steelbloom", nameZh: "梦中的铁花" },
      { slot: "plume", nameEn: "Feather of Judgment", nameZh: "裁断的翎羽" },
      { slot: "sands", nameEn: "The Sunken Years", nameZh: "沉金的岁月" },
      { slot: "goblet", nameEn: "Honeyed Final Feast", nameZh: "如蜜的终宴" },
      { slot: "circlet", nameEn: "Shadow of the Sand King", nameZh: "沙王的投影" },
    ],
  },
  {
    id: "desert-pavilion-chronicle",
    setId: 15027,
    nameEn: "Desert Pavilion Chronicle",
    nameZh: "沙上楼阁史话",
    rarity: 5,
    iconId: "UI_RelicIcon_15027_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15027_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%风元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "重击命中敌人后，该角色的普通攻击速度提升10%，普通攻击、重击与下落攻击造成的伤害提升40%，持续15秒。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "The First Days of the City of Kings", nameZh: "众王之都的开端" },
      { slot: "plume", nameEn: "End of the Golden Realm", nameZh: "黄金邦国的结末" },
      { slot: "sands", nameEn: "Timepiece of the Lost Path", nameZh: "失落迷途的机芯" },
      { slot: "goblet", nameEn: "Defender of the Enchanting Dream", nameZh: "迷醉长梦的守护" },
      { slot: "circlet", nameEn: "Legacy of the Desert High-Born", nameZh: "流沙贵嗣的遗宝" },
    ],
  },
  {
    id: "flower-of-paradise-lost",
    setId: 15028,
    nameEn: "Flower of Paradise Lost",
    nameZh: "乐园遗落之花",
    rarity: 5,
    iconId: "UI_RelicIcon_15028_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15028_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者绽放、超绽放、烈绽放反应造成的伤害提升40%，造成的月绽放反应伤害提升10%。此外，装备者触发绽放、超绽放、烈绽放、月绽放后，上述效果带来的加成提升25%，该效果持续10秒，至多叠加4次，每1秒至多触发一次。装备者处于队伍后台时依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Ay-Khanoum's Myriad", nameZh: "月女的华彩" },
      { slot: "plume", nameEn: "Wilting Feast", nameZh: "谢落的筵席" },
      { slot: "sands", nameEn: "A Moment Congealed", nameZh: "凝结的时刻" },
      { slot: "goblet", nameEn: "Secret-Keeper's Magic Bottle", nameZh: "守秘的魔瓶" },
      { slot: "circlet", nameEn: "Amethyst Crown", nameZh: "紫晶的花冠" },
    ],
  },
  {
    id: "nymphs-dream",
    setId: 15029,
    nameEn: "Nymph's Dream",
    nameZh: "水仙之梦",
    rarity: 5,
    iconId: "UI_RelicIcon_15029_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15029_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%水元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "普通攻击、重击、下落攻击、元素战技或元素爆发命中敌人后，将产生1层持续8秒的「镜中水仙」效果。处于1/2/3层及以上「镜中水仙」效果下时，攻击力将提高7%/16%/25%，水元素伤害加成提升4%/9%/15%。由普通攻击、重击、下落攻击、元素战技或元素爆发产生的「镜中水仙」将分别独立存在。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Odyssean Flower", nameZh: "旅途中的鲜花" },
      { slot: "plume", nameEn: "Wicked Mage's Plumule", nameZh: "坏巫师的羽杖" },
      { slot: "sands", nameEn: "Nymph's Constancy", nameZh: "水仙的时时刻刻" },
      { slot: "goblet", nameEn: "Heroes' Tea Party", nameZh: "勇者们的茶会" },
      { slot: "circlet", nameEn: "Fell Dragon's Monocle", nameZh: "恶龙的单片镜" },
    ],
  },
  {
    id: "vourukashas-glow",
    setId: 15030,
    nameEn: "Vourukasha's Glow",
    nameZh: "花海甘露之光",
    rarity: 5,
    iconId: "UI_RelicIcon_15030_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15030_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "生命值提升20%。",
      },
      {
        pieces: 4,
        descriptionZh: "元素战技与元素爆发造成的伤害提升10%；装备者受到伤害后的5秒内，上述伤害提升效果提高80%，该提高效果至多叠加5层，每层持续时间独立计算，处于队伍后台时依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Stamen of Khvarena's Origin", nameZh: "灵光源起之蕊" },
      { slot: "plume", nameEn: "Vibrant Pinion", nameZh: "琦色灵彩之羽" },
      { slot: "sands", nameEn: "Ancient Abscission", nameZh: "久远花落之时" },
      { slot: "goblet", nameEn: "Feast of Boundless Joy", nameZh: "无边酣乐之筵" },
      { slot: "circlet", nameEn: "Heart of Khvarena's Brilliance", nameZh: "灵光明烁之心" },
    ],
  },
  {
    id: "marechaussee-hunter",
    setId: 15031,
    nameEn: "Marechaussee Hunter",
    nameZh: "逐影猎人",
    rarity: 5,
    iconId: "UI_RelicIcon_15031_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15031_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "普通攻击与重击造成的伤害提高15%。",
      },
      {
        pieces: 4,
        descriptionZh: "当前生命值提升或降低时，暴击率提升12%，该效果持续5秒，至多叠加3次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Hunter's Brooch", nameZh: "猎人的胸花" },
      { slot: "plume", nameEn: "Masterpiece's Overture", nameZh: "杰作的序曲" },
      { slot: "sands", nameEn: "Moment of Judgment", nameZh: "裁判的时刻" },
      { slot: "goblet", nameEn: "Forgotten Vessel", nameZh: "遗忘的容器" },
      { slot: "circlet", nameEn: "Veteran's Visage", nameZh: "老兵的容颜" },
    ],
  },
  {
    id: "golden-troupe",
    setId: 15032,
    nameEn: "Golden Troupe",
    nameZh: "黄金剧团",
    rarity: 5,
    iconId: "UI_RelicIcon_15032_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15032_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素战技造成的伤害提升20%。",
      },
      {
        pieces: 4,
        descriptionZh: "元素战技造成的伤害提升25%；此外，处于队伍后台时，元素战技造成的伤害还将进一步提升25%，该效果将在登场后2秒移除。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Golden Song's Variation", nameZh: "黄金乐曲的变奏" },
      { slot: "plume", nameEn: "Golden Bird's Shedding", nameZh: "黄金飞鸟的落羽" },
      { slot: "sands", nameEn: "Golden Era's Prelude", nameZh: "黄金时代的先声" },
      { slot: "goblet", nameEn: "Golden Night's Bustle", nameZh: "黄金之夜的喧嚣" },
      { slot: "circlet", nameEn: "Golden Troupe's Reward", nameZh: "黄金剧团的奖赏" },
    ],
  },
  {
    id: "song-of-days-past",
    setId: 15033,
    nameEn: "Song of Days Past",
    nameZh: "昔时之歌",
    rarity: 5,
    iconId: "UI_RelicIcon_15033_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15033_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "治疗加成提高15%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者对队伍中的角色进行治疗时，将产生持续6秒的渴盼效果，记录治疗的生命值回复量（包括溢出值）。持续时间结束时，渴盼效果将转变为「彼时的浪潮」效果：队伍中自己的当前场上角色的普通攻击、重击、下落攻击、元素战技与元素爆发命中敌人时，将基于渴盼效果所记录的回复量的8%提高造成的伤害，「彼时的浪潮」将在生效5次或10秒后移除。一次渴盼效果至多记录15000点回复量，同时至多存在一个，能够记录多个装备者的产生的回复量；装备者处于队伍后台时，依然能触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Forgotten Oath of Days Past", nameZh: "昔时遗落之誓" },
      { slot: "plume", nameEn: "Recollection of Days Past", nameZh: "昔时浮想之思" },
      { slot: "sands", nameEn: "Echoing Sound From Days Past", nameZh: "昔时回映之音" },
      { slot: "goblet", nameEn: "Promised Dream of Days Past", nameZh: "昔时应许之梦" },
      { slot: "circlet", nameEn: "Poetry of Days Past", nameZh: "昔时传奏之诗" },
    ],
  },
  {
    id: "nighttime-whispers-in-the-echoing-woods",
    setId: 15034,
    nameEn: "Nighttime Whispers in the Echoing Woods",
    nameZh: "回声之林夜话",
    rarity: 5,
    iconId: "UI_RelicIcon_15034_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15034_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "施放元素战技后的10秒内，岩元素伤害加成提升20%；若处于结晶反应产生的护盾庇护下，或附近存在月结晶反应产生的月笼，上述效果提高150%，进一步提高的效果将在不满足上述条件的1秒后移除。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Selfless Floral Accessory", nameZh: "无私的妆饰花" },
      { slot: "plume", nameEn: "Honest Quill", nameZh: "诚恳的蘸水笔" },
      { slot: "sands", nameEn: "Faithful Hourglass", nameZh: "忠实的砂时计" },
      { slot: "goblet", nameEn: "Magnanimous Ink Bottle", nameZh: "慷慨的墨水瓶" },
      { slot: "circlet", nameEn: "Compassionate Ladies' Hat", nameZh: "慈爱的淑女帽" },
    ],
  },
  {
    id: "fragment-of-harmonic-whimsy",
    setId: 15035,
    nameEn: "Fragment of Harmonic Whimsy",
    nameZh: "谐律异想断章",
    rarity: 5,
    iconId: "UI_RelicIcon_15035_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15035_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "生命之契的数值提升或降低时，角色造成的伤害提升18%，该效果持续6秒，至多叠加3次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Harmonious Symphony Prelude", nameZh: "谐律交响的前奏" },
      { slot: "plume", nameEn: "Ancient Sea's Nocturnal Musing", nameZh: "古海玄幽的夜想" },
      { slot: "sands", nameEn: "The Grand Jape of the Turning of Fate", nameZh: "命途轮转的谐谑" },
      { slot: "goblet", nameEn: "Ichor Shower Rhapsody", nameZh: "灵露倾洒的狂诗" },
      { slot: "circlet", nameEn: "Whimsical Dance of the Withered", nameZh: "异想零落的圆舞" },
    ],
  },
  {
    id: "unfinished-reverie",
    setId: 15036,
    nameEn: "Unfinished Reverie",
    nameZh: "未竟的遐思",
    rarity: 5,
    iconId: "UI_RelicIcon_15036_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15036_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "脱离战斗状态3秒后，造成的伤害提升50%。在战斗状态下，附近不存在处于燃烧状态下的敌人超过6秒后，上述伤害提升效果每秒降低10%，直到降低至0%；存在处于燃烧状态下的敌人时，每秒提升10%，直到达到50%。装备此圣遗物套装的角色处于队伍后台时，依然会触发该效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Dark Fruit of Bright Flowers", nameZh: "暗结的明花" },
      { slot: "plume", nameEn: "Faded Emerald Tail", nameZh: "褪光的翠尾" },
      { slot: "sands", nameEn: "Moment of Attainment", nameZh: "举业的识刻" },
      { slot: "goblet", nameEn: "The Wine-Flask Over Which the Plan Was Hatched", nameZh: "筹谋的共樽" },
      { slot: "circlet", nameEn: "Crownless Crown", nameZh: "失冕的宝冠" },
    ],
  },
  {
    id: "scroll-of-the-hero-of-cinder-city",
    setId: 15037,
    nameEn: "Scroll of the Hero of Cinder City",
    nameZh: "烬城勇者绘卷",
    rarity: 5,
    iconId: "UI_RelicIcon_15037_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15037_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "队伍中附近的角色触发「夜魂迸发」时，装备者恢复6点元素能量。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者触发其对应元素类型的相关反应后，队伍中附近的所有角色的该元素反应相关的元素伤害加成提升12%，持续15秒。若触发该效果时，装备者处于夜魂加持状态下，还将使队伍中附近的所有角色的与该元素反应相关的元素伤害加成提升28%，持续20秒。装备者处于后台时也能触发上述效果。同名圣遗物套装产生的伤害加成效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Beast Tamer's Talisman", nameZh: "驯兽师的护符" },
      { slot: "plume", nameEn: "Mountain Ranger's Marker", nameZh: "巡山客的信标" },
      { slot: "sands", nameEn: "Mystic's Gold Dial", nameZh: "秘术家的金盘" },
      { slot: "goblet", nameEn: "Wandering Scholar's Claw Cup", nameZh: "游学者的爪杯" },
      { slot: "circlet", nameEn: "Demon-Warrior's Feather Mask", nameZh: "魔战士的羽面" },
    ],
  },
  {
    id: "obsidian-codex",
    setId: 15038,
    nameEn: "Obsidian Codex",
    nameZh: "黑曜秘典",
    rarity: 5,
    iconId: "UI_RelicIcon_15038_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15038_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "装备者处于夜魂加持状态，并且在场上时，造成的伤害提高15%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者在场上消耗1点夜魂值后，暴击率提高40%，持续6秒。该效果每1秒至多触发一次。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Reckoning of the Xenogenic", nameZh: "异种的期许" },
      { slot: "plume", nameEn: "Root of the Spirit-Marrow", nameZh: "灵髓的根脉" },
      { slot: "sands", nameEn: "Myths of the Night Realm", nameZh: "夜域的迷思" },
      { slot: "goblet", nameEn: "Pre-Banquet of the Contenders", nameZh: "纷争的前宴" },
      { slot: "circlet", nameEn: "Crown of the Saints", nameZh: "诸圣的礼冠" },
    ],
  },
  {
    id: "long-nights-oath",
    setId: 15039,
    nameEn: "Long Night's Oath",
    nameZh: "长夜之誓",
    rarity: 5,
    iconId: "UI_RelicIcon_15039_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15039_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "下落攻击造成的伤害提升25%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者的下落攻击/重击/元素战技命中敌人后，获得1/2/2层「永照的流辉」，由下落攻击、重击或元素战技产生的该效果分别每1秒至多触发一次。永照的流辉：下落攻击造成的伤害提升15%，持续6秒，至多叠加5层，每层持续时间独立计算。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Lightkeeper's Pledge", nameZh: "执灯人的誓词" },
      { slot: "plume", nameEn: "Nightingale's Tail Feather", nameZh: "夜鸣莺的尾羽" },
      { slot: "sands", nameEn: "Undying One's Mourning Bell", nameZh: "不死者的哀铃" },
      { slot: "goblet", nameEn: "A Horn Unwinded", nameZh: "未吹响的号角" },
      { slot: "circlet", nameEn: "Dyed Tassel", nameZh: "被浸染的缨盔" },
    ],
  },
  {
    id: "finale-of-the-deep-galleries",
    setId: 15040,
    nameEn: "Finale of the Deep Galleries",
    nameZh: "深廊终曲",
    rarity: 5,
    iconId: "UI_RelicIcon_15040_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15040_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "获得15%冰元素伤害加成。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者的元素能量为0时，普通攻击造成的伤害提升60%，元素爆发造成的伤害提升60%。装备者的普通攻击造成伤害后，上述元素爆发伤害提升效果将失效6秒；装备者的元素爆发造成伤害后，上述普通攻击伤害提升效果将失效6秒。角色处于队伍后台也能触发。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Deep Gallery's Echoing Song", nameZh: "深廊的回奏之歌" },
      { slot: "plume", nameEn: "Deep Gallery's Distant Pact", nameZh: "深廊的漫远之约" },
      { slot: "sands", nameEn: "Deep Gallery's Moment of Oblivion", nameZh: "深廊的湮落之刻" },
      { slot: "goblet", nameEn: "Deep Gallery's Bestowed Banquet", nameZh: "深廊的饫赐之宴" },
      { slot: "circlet", nameEn: "Deep Gallery's Lost Crown", nameZh: "深廊的遂失之冕" },
    ],
  },
  {
    id: "night-of-the-skys-unveiling",
    setId: 15041,
    nameEn: "Night of the Sky's Unveiling",
    nameZh: "穹境示现之夜",
    rarity: 5,
    iconId: "UI_RelicIcon_15041_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15041_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "队伍中附近的角色触发月曜反应时，若装备者在场上，将获得持续4秒的「月辉明光·蓄念」效果：队伍的月兆为初辉/满辉时，暴击率提升15%/30%。队伍中的角色每拥有一种不同的「月辉明光」效果，队伍中的所有角色触发的月曜反应造成的伤害提升10%。由「月辉明光」产生的效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Bloom of the Mind's Desire", nameZh: "渴真之花" },
      { slot: "plume", nameEn: "Feather of Indelible Sin", nameZh: "深罪之羽" },
      { slot: "sands", nameEn: "Revelation's Toll", nameZh: "谕告之钟" },
      { slot: "goblet", nameEn: "Vessel of Plenty", nameZh: "满溢之壶" },
      { slot: "circlet", nameEn: "Crown of the Befallen", nameZh: "永劫之冕" },
    ],
  },
  {
    id: "silken-moons-serenade",
    setId: 15042,
    nameEn: "Silken Moon's Serenade",
    nameZh: "纺月的夜歌",
    rarity: 5,
    iconId: "UI_RelicIcon_15042_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15042_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素充能效率提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "造成元素伤害时，获得持续8秒的「月辉明光·崇信」效果：队伍的月兆为初辉/满辉时，队伍中的所有角色的元素精通提高60点/120点。装备者处于后台时也能触发上述效果。队伍中的角色每拥有一种不同的「月辉明光」效果，队伍中的所有角色触发的月曜反应造成的伤害提升10%。由「月辉明光」产生的效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Crystal Tear of the Wanderer", nameZh: "流离者的晶泪" },
      { slot: "plume", nameEn: "Pristine Plume of the Blessed", nameZh: "受福者的白羽" },
      { slot: "sands", nameEn: "Frost Devotee's Delirium", nameZh: "祭霜者的迷狂" },
      { slot: "goblet", nameEn: "Joyous Glory of the Pure", nameZh: "至纯者的欢荣" },
      { slot: "circlet", nameEn: "Holy Crown of the Believer", nameZh: "司信者的圣冕" },
    ],
  },
  {
    id: "aubade-of-morningstar-and-moon",
    setId: 15043,
    nameEn: "Aubade of Morningstar and Moon",
    nameZh: "晨星与月的晓歌",
    rarity: 5,
    iconId: "UI_RelicIcon_15043_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15043_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素精通提高80点。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者处于队伍后台时，造成的月曜反应伤害提升20%；队伍的月兆等级至少为满辉时，造成的月曜反应伤害进一步提升40%。上述效果将在装备者位于场上3秒后移除。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Moonlit Offering's Opulent Dream", nameZh: "献与月的华梦" },
      { slot: "plume", nameEn: "Moonlit Offering's Parting Light", nameZh: "献与月的离光" },
      { slot: "sands", nameEn: "Moonlit Offering's Final Hour", nameZh: "献与月的终时" },
      { slot: "goblet", nameEn: "Moonlit Offering's Libation", nameZh: "献与月的酹祭" },
      { slot: "circlet", nameEn: "Moonlit Offering's Silver Crown", nameZh: "献与月的银冕" },
    ],
  },
  {
    id: "a-day-carved-from-rising-winds",
    setId: 15044,
    nameEn: "A Day Carved From Rising Winds",
    nameZh: "风起之日",
    rarity: 5,
    iconId: "UI_RelicIcon_15044_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15044_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "普通攻击、重击、元素战技或元素爆发命中敌人后，将获得持续6秒的「风与牧歌的眷怜」：攻击力提高25%。若装备者已经完成了「魔女的课业」，则「风与牧歌的眷怜」将会升级为「风与牧歌的决意」，额外使通过考验的装备者的暴击率提升20%。装备者处于队伍后台时，也能触发上述效果。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Windborne Flower's Spruchdichtung", nameZh: "风花的箴铭" },
      { slot: "plume", nameEn: "Dawn's Brilliant Oath", nameZh: "晨光的明誓" },
      { slot: "sands", nameEn: "A Note in Spring's Leich", nameZh: "春律的片刻" },
      { slot: "goblet", nameEn: "Heldenepos's Unspoken Tale", nameZh: "未言的宴话" },
      { slot: "circlet", nameEn: "Minnesang of Love and Lament", nameZh: "哀慕的恋歌" },
    ],
  },
  {
    id: "celestial-gift",
    setId: 15045,
    nameEn: "Celestial Gift",
    nameZh: "天之美赐",
    rarity: 5,
    iconId: "UI_RelicIcon_15045_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15045_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "元素充能效率提高20%。",
      },
      {
        pieces: 4,
        descriptionZh: "若装备者已经完成了魔女的课业，则施放元素战技后，会获得「天光之引」效果：依据装备者的元素类型，使队伍中附近的所有角色获得20%对应元素伤害加成，持续20秒。装备者处于后台时也能触发上述效果，同名圣遗物套装产生的伤害加成效果无法叠加。\\n·队伍拥有「魔导·秘仪」效果时，「天光之引」效果将会升级为「凡世颂歌」，除装备者的元素类型外，还会依据队伍中自己的当前场上角色的元素类型，使队伍中附近的所有角色获得对应元素伤害加成，且上述两种元素伤害加成提升至40%，同元素类型的元素伤害加成效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Heavensent Fragrance", nameZh: "天授之馨" },
      { slot: "plume", nameEn: "Heavensent Demise", nameZh: "天授之殁" },
      { slot: "sands", nameEn: "Heavensent Decree", nameZh: "天授之令" },
      { slot: "goblet", nameEn: "Heavensent Reward", nameZh: "天授之禄" },
      { slot: "circlet", nameEn: "Heavensent Crown", nameZh: "天授之冕" },
    ],
  },
  {
    id: "disenchantment-in-deep-shadow",
    setId: 15046,
    nameEn: "Disenchantment in Deep Shadow",
    nameZh: "影中沉凝的幻灭",
    rarity: 5,
    iconId: "UI_RelicIcon_15046_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15046_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "超导反应造成的伤害提升80%，星超导反应造成的伤害提升40%；装备者攻击受到超导或星超导反应影响的敌人时，本次攻击的暴击率提高16%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Iridescence That Ceased Amidst Glory", nameZh: "止于荣礼的缎彩" },
      { slot: "plume", nameEn: "Sharpness That Ceased Upon Wondrous Creation", nameZh: "止于妙想成型的锋毫" },
      { slot: "sands", nameEn: "Moment That Ceased Upon Waking From Grand Dreams", nameZh: "止于宏伟梦醒的时刻" },
      { slot: "goblet", nameEn: "Ovations That Ceased Upon Festivity", nameZh: "止于祝庆的喝礼" },
      { slot: "circlet", nameEn: "Pendulum That Ceased Amidst a Great Fall", nameZh: "止于阔步跌坠的灵摆" },
    ],
  },
  {
    id: "scarlet-proof",
    setId: 15047,
    nameEn: "Scarlet Proof",
    nameZh: "血红之证",
    rarity: 5,
    iconId: "UI_RelicIcon_15047_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15047_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者触发星扩散反应后的10秒内，暴击率提升16%，星扩散反应伤害提升40%。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Honor to Your Devotion", nameZh: "感谢你的奉献" },
      { slot: "plume", nameEn: "Glory to Your Legacy", nameZh: "铭记你的功勋" },
      { slot: "sands", nameEn: "Time Gifted Unto You", nameZh: "授予你的年华" },
      { slot: "goblet", nameEn: "Chalice of Your Blood and Sorrow", nameZh: "饮尽你的血泪" },
      { slot: "circlet", nameEn: "Testament to Your Faith", nameZh: "缅怀你的信仰" },
    ],
  },
  {
    id: "heart-of-the-furnace",
    setId: 15048,
    nameEn: "Heart of the Furnace",
    nameZh: "炉火融炼之心",
    rarity: 5,
    iconId: "UI_RelicIcon_15048_4",
    iconUrl: "https://gi.yatta.moe/assets/UI/UI_RelicIcon_15048_4.png",
    bonuses: [
      {
        pieces: 2,
        descriptionZh: "攻击力提高18%。",
      },
      {
        pieces: 4,
        descriptionZh: "装备者触发星烁反应或造成星烁反应伤害后的12秒内，攻击力提升12%，队伍中附近的所有角色造成的星烁反应伤害提升50%。装备者处于后台时也能触发上述效果。同名圣遗物套装产生的伤害加成效果无法叠加。",
      },
    ],
    pieces: [
      { slot: "flower", nameEn: "Foundryman's Conjecture", nameZh: "熔铸者的揣度" },
      { slot: "plume", nameEn: "Foundryman's Observation", nameZh: "熔铸者的观测" },
      { slot: "sands", nameEn: "Foundryman's Calculus", nameZh: "熔铸者的计算" },
      { slot: "goblet", nameEn: "Foundryman's Magnanimity", nameZh: "熔铸者的雅量" },
      { slot: "circlet", nameEn: "Foundryman's Legacy", nameZh: "熔铸者的继志" },
    ],
  },
];
