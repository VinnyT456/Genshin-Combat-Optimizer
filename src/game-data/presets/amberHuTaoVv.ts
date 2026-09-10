import type { PlaystylePreset } from "./types";

/**
 * Amber — Hu Tao VV Burst Support playstyle preset.
 * Sourced from KeqingMains: https://keqingmains.com/q/amber-quickguide/#Hu_Tao_VV_Burst_Support
 */
export const amberHuTaoVvPreset: PlaystylePreset = {
  id: "amber-hutao-vv-burst-support",
  characterId: "amber",
  nameZh: "胡桃风套火扩散爆发辅助",
  nameEn: "Hu Tao VV Burst Support",
  sourceUrl:
    "https://keqingmains.com/q/amber-quickguide/#Hu_Tao_VV_Burst_Support",
  version: "4.8",

  team: {
    slot1: { characterId: "hu-tao", roleZh: "主输出 (蒸发重击)" },
    slot2: { characterId: "xingqiu", roleZh: "水元素附着 / 副输出", flexIds: ["yelan"] },
    slot3: { characterId: "amber", roleZh: "火附着供风套扩散 / 团队增益" },
    slot4: { characterId: "sucrose", roleZh: "翠绿之影 40% 减抗 / 精通拐", flexIds: ["kazuha", "lynette"] },
  },

  rotation: [
    { characterId: "xingqiu", actionType: "skill" },
    { characterId: "xingqiu", actionType: "burst" },
    { characterId: "xingqiu", actionType: "normal" },
    { characterId: "amber", actionType: "swap" },
    { characterId: "amber", actionType: "burst" },
    { characterId: "sucrose", actionType: "swap" },
    { characterId: "sucrose", actionType: "skill" },
    { characterId: "hu-tao", actionType: "swap" },
    { characterId: "hu-tao", actionType: "skill" },
    { characterId: "hu-tao", actionType: "normal" },
    { characterId: "hu-tao", actionType: "charged" },
    { characterId: "hu-tao", actionType: "normal" },
    { characterId: "hu-tao", actionType: "charged" },
    { characterId: "hu-tao", actionType: "burst" },
  ],

  rotationNotesZh: [
    "行秋施放 E Q (N1) 铺垫水附着并开启剑雨协同。",
    "立刻切安柏施放元素爆发 Q，打出 2U 强火并在极短时间内覆盖水元素附着留下火底。",
    "切风系（砂糖/万叶）施放战技 E 触发火扩散，触发翠绿之影 4件套 40% 火抗削减与全队精通加成。",
    "切胡桃开启 E，进行 8~9 次重击蒸发输出，在状态结束前施放元素爆发 Q。",
  ],

  erRequirements: [
    {
      characterId: "amber",
      minimumEr: 1.8,
      recommendedWeapon: "favonius-warbow",
      conditionZh:
        "装备西风猎弓并在后台吃微粒时需 180%~200% 充能；若装备终末弓需 200%+ 充能保证大招每轮循环无缝。",
    },
    {
      characterId: "xingqiu",
      minimumEr: 1.8,
      recommendedWeapon: "sacrificial-sword",
      conditionZh:
        "装备精5祭礼剑双E时需 180% 充能；单E或其它武器需 210%+。",
    },
  ],

  build: {
    weapons: [
      {
        weaponId: "elegy-for-the-end",
        rank: 1,
        refinement: 1,
        commentZh:
          "首选毕业武器：安柏大招 18 段攻击可在 1 秒内瞬间叠满 4 层「别离之歌」被动，为胡桃提供 100~200 元素精通与 20%~40% 攻击力加成。",
      },
      {
        weaponId: "favonius-warbow",
        rank: 2,
        refinement: 5,
        commentZh:
          "高性价比平民选择：高充能副属性大幅降低自身充能压力，暴击产出无属性微粒帮助全队（尤其是胡桃和砂糖）回能。",
      },
    ],
    artifacts: [
      {
        setId: "instructor",
        pieces: 4,
        rank: 1,
        commentZh:
          "教官4件套：在场上触发元素反应后为全队提供 120 元素精通，对胡桃蒸发反应提升巨大（注意安柏必须在场上触发反应才能生效）。",
      },
      {
        setId: "noblesse-oblige",
        pieces: 4,
        rank: 2,
        commentZh:
          "昔日宗室之仪4件套：施放元素爆发后全队攻击力提升 20%，持续 12 秒，覆盖胡桃整个输出期。",
      },
    ],
    mainStats: {
      sands: "元素充能效率 (优先保证大招循环)",
      goblet: "火元素伤害加成 或 生命值/防御力 (生存)",
      circlet: "暴击率 (装备西风猎弓时保证触发白球)",
    },
    substatPriorityZh: [
      "元素充能效率 (直至达到 180%~200%+ 门槛)",
      "暴击率 (装备西风弓时需保证 50%+ 暴击率)",
      "生命值 / 防御力 (提高前台瞬切生存能力)",
    ],
  },

  talents: {
    priorityZh: "元素爆发 Q > 元素战技 E > 普通攻击 (普攻无需升级)",
    recommendedLevels: { normal: 1, skill: 6, burst: 9 },
    keyConstellations: [
      {
        level: 4,
        impactZh:
          "兔兔伯爵额外获得 1 次使用次数，冷却缩短 20%，能产生双倍火元素微粒，大幅降低充能压力。",
      },
      {
        level: 6,
        impactZh:
          "施放箭雨后全队移动速度提高 15%，攻击力提升 15%，持续 10 秒，进一步增强辅助拐力。",
      },
    ],
  },

  mechanicsCaveatsZh: [
    {
      topicZh: "元素量与扩散时机 (Aura & Swirl Timing)",
      detailZh:
        "安柏元素爆发具备 2U 强火附着，且在 2 秒内总计命中 18 次。由于挂火频率极高，施放大招后即使怪物原本带有水附着，也会瞬间反应耗尽水并残留强火底，必须快速切风系角色打出火扩散。",
    },
    {
      topicZh: "终末弓被动极速触发 (Elegy Stacking)",
      detailZh:
        "终末嗟叹之诗的被动符文每 0.2 秒至多叠加一层，共需 4 层。安柏大招 18 支箭连续命中可确保在 0.8 秒内光速触发终末之歌，无需在前台停留。",
    },
    {
      topicZh: "教官4件套触发机制 (Instructor 4pc Trigger)",
      detailZh:
        "教官 4 件套的 120 精通加成必须由装备者在【前台】触发元素反应才能激活。切出安柏施放 Q 命中已有水底的敌人时可在前台瞬间触发蒸发反应并激活教官套。",
    },
    {
      topicZh: "避免抢胡桃反应 (Vaporize Priority)",
      detailZh:
        "安柏大招持续时间仅为 2 秒。等待安柏大招箭雨完全结束、且风系角色完成火扩散后，再切出行秋打出水剑并切出胡桃开 E，这样安柏的技能绝不会干扰胡桃后续的蒸发反应。",
    },
  ],
};
