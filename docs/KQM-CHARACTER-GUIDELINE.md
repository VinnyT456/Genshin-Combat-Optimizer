# KQM 角色理论与配队指南录入规范 (Character Playstyle & Preset Guidelines)

本规范制定了从 **KeqingMains (KQM) Quickguides / Extended Guides** 等开源理论计算社区提取角色流派、配队模板、输出循环轴、装备搭配及机制注意事项的标准操作流程（SOP）与机读数据模型规范。

以 **[Amber Quickguide — Hu Tao VV Burst Support](https://keqingmains.com/q/amber-quickguide/#Hu_Tao_VV_Burst_Support)** 为基准范例。

---

## 一、 录入结构总览 (Architecture Overview)

KQM 指南通常以**玩法流派 (Playstyles / Archetypes)** 为核心组织。每位角色可能具备 1～3 种核心流派（如：安柏作为“胡桃风套火扩散爆发辅助”、融甘托马、超燃香菱等）。

每一个流派在模拟器中对应一个**完整的可执行预设 (Playstyle Preset)**：

```
KQM Guide Section
  ├── 1. 核心定位与流派元数据 (Archetype Meta & Role)
  ├── 2. 队伍构成与替换位 (Team Composition & Flex Slots)
  ├── 3. 标准循环时序 (Rotation Sequence & Timing)
  ├── 4. 充能门槛 (Energy Recharge Requirements)
  ├── 5. 装备优先级 (Weapon & Artifact Recommendations)
  ├── 6. 天赋优先级与命座关键节点 (Talent & Constellation Spikes)
  └── 7. 实战机制细节与避坑注意 (Mechanics & Caveats)
```

---

## 二、 TypeScript 数据契约模型 (Schema Definition)

在系统中录入的结构化模型应符合以下 TypeScript 接口（可存放于 `src/game-data/presets/types.ts`）：

```ts
import type { ActionType, Element, Rotation, WeaponType } from "@/types";

export interface PlaystylePreset {
  id: string;                      // 唯一标识符，如 "amber-hutao-vv"
  characterId: string;             // 主角 ID，如 "amber"
  nameZh: string;                  // 流派中文名，如 "胡桃风套挂火爆发辅助"
  nameEn: string;                  // 流派英文名，如 "Hu Tao VV Burst Support"
  sourceUrl: string;               // 来源 URL，如 "https://keqingmains.com/q/amber-quickguide/#Hu_Tao_VV_Burst_Support"
  author?: string;                 // KQM 作者或团队署名
  version: string;                 // 对应游戏版本，如 "4.8" 或 "5.0"

  // 1. 队伍构成
  team: {
    slot1: { characterId: string; roleZh: string }; // 主C，如 "hu-tao"
    slot2: { characterId: string; roleZh: string }; // 水副C，如 "xingqiu" / "yelan"
    slot3: { characterId: string; roleZh: string }; // 当前角色，如 "amber"
    slot4: { characterId: string; roleZh: string; flexIds?: string[] }; // 风辅，如 "sucrose" / "kazuha"
  };

  // 2. 循环动作轴 (与优化器 Rotation 兼容)
  rotation: Rotation;
  rotationNotesZh: string[];       // 动作轴中文注解（如 "Xingqiu EQ(N1) -> Amber Q -> Sucrose E..."）

  // 3. 充能门槛 (ER Requirements)
  erRequirements: {
    characterId: string;
    minimumEr: number;             // 如 1.80 代表 180%
    recommendedWeapon?: string;    // 若使用西风弓或祭礼剑时的充能门槛
    conditionZh: string;           // 触发条件说明（如 "单火队伍，西风弓产球前台吃"）
  }[];

  // 4. 装备与圣遗物推荐 (Build Recommendations)
  build: {
    weapons: {
      weaponId: string;
      rank: number;                // 优先级 1, 2, 3...
      refinement?: number;         // 推荐精炼阶数，如 1 或 5
      commentZh: string;           // 推荐理由（如 "终末弓全队增伤增精通最佳选择"）
    }[];
    artifacts: {
      setId: string;               // 如 "instructor" (教官4) 或 "noblesse-oblige" (宗室4)
      pieces: 2 | 4;
      rank: number;
      commentZh: string;           // 推荐理由（如 "教官套为胡桃提供 120 额外元素精通"）
    }[];
    mainStats: {
      sands: string;               // 时之沙主词条（如 "元素充能效率" 或 "生命值百分比"）
      goblet: string;              // 空之杯主词条（如 "火元素伤害加成" 或 "生命值"）
      circlet: string;             // 理之冠主词条（如 "暴击率 (触发西风)" 或 "治疗加成"）
    };
    substatPriorityZh: string[];   // 副词条优先级，如 ["元素充能效率 (直至达标)", "暴击率", "元素精通"]
  };

  // 5. 命之座与天赋
  talents: {
    priorityZh: string;            // 如 "元素爆发 > 元素战技 > 普通攻击"
    recommendedLevels: { normal: number; skill: number; burst: number };
    keyConstellations: {
      level: number;               // 关键命之座层级，如 4
      impactZh: string;            // 命座质变说明（如 "C4 兔兔伯爵可充能2次，极大缓解充能压力"）
    }[];
  };

  // 6. 机制与实战避坑要点 (Mechanics & Caveats)
  mechanicsCaveatsZh: {
    topicZh: string;
    detailZh: string;
  }[];
}
```

---

## 三、 范例拆解：安柏 — 胡桃双火扩散辅助 (Amber Hu Tao VV)

以下展示如何将 KQM 页面数据完整解析为标准化条目：

```ts
export const AMBER_HU_TAO_VV_PRESET: PlaystylePreset = {
  id: "amber-hutao-vv-burst-support",
  characterId: "amber",
  nameZh: "胡桃风套火扩散爆发辅助",
  nameEn: "Hu Tao VV Burst Support",
  sourceUrl: "https://keqingmains.com/q/amber-quickguide/#Hu_Tao_VV_Burst_Support",
  version: "4.8",

  team: {
    slot1: { characterId: "hu-tao", roleZh: "主输出 (蒸发重击)" },
    slot2: { characterId: "xingqiu", roleZh: "水元素附着 / 副输出" },
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
      minimumEr: 1.80,
      recommendedWeapon: "favonius-warbow",
      conditionZh: "装备西风猎弓并在后台吃微粒时需 180%~200% 充能；若装备终末弓需 200%+ 充能保证大招每轮循环无缝。",
    },
    {
      characterId: "xingqiu",
      minimumEr: 1.80,
      recommendedWeapon: "sacrificial-sword",
      conditionZh: "装备精5祭礼剑双E时需 180% 充能；单E或其它武器需 210%+。",
    },
  ],

  build: {
    weapons: [
      {
        weaponId: "elegy-for-the-end",
        rank: 1,
        refinement: 1,
        commentZh: "首选毕业武器：安柏大招 18 段攻击可在 1 秒内瞬间叠满 4 层「别离之歌」被动，为胡桃提供 100~200 元素精通与 20%~40% 攻击力加成。",
      },
      {
        weaponId: "favonius-warbow",
        rank: 2,
        refinement: 5,
        commentZh: "高性价比平民选择：高充能副属性大幅降低自身充能压力，暴击产出无属性微粒帮助全队（尤其是胡桃和砂糖）回能。",
      },
    ],
    artifacts: [
      {
        setId: "instructor",
        pieces: 4,
        rank: 1,
        commentZh: "教官4件套：在场上触发元素反应后为全队提供 120 元素精通，对胡桃蒸发反应提升巨大（注意安柏必须在场上触发反应才能生效）。",
      },
      {
        setId: "noblesse-oblige",
        pieces: 4,
        rank: 2,
        commentZh: "昔日宗室之仪4件套：施放元素爆发后全队攻击力提升 20%，持续 12 秒，覆盖胡桃整个输出期。",
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
        impactZh: "兔兔伯爵额外获得 1 次使用次数，冷却缩短 20%，能产生双倍火元素微粒，大幅降低充能压力。",
      },
      {
        level: 6,
        impactZh: "施放箭雨后全队移动速度提高 15%，攻击力提升 15%，持续 10 秒，进一步增强辅助拐力。",
      },
    ],
  },

  mechanicsCaveatsZh: [
    {
      topicZh: "元素量与扩散时机 (Aura & Swirl Timing)",
      detailZh: "安柏元素爆发具备 2U 强火附着，且在 2 秒内总计命中 18 次。由于挂火频率极高，施放大招后即使怪物原本带有水附着，也会瞬间反应耗尽水并残留强火底，必须快速切风系角色打出火扩散。",
    },
    {
      topicZh: "终末弓被动极速触发 (Elegy Stacking)",
      detailZh: "终末嗟叹之诗的被动符文每 0.2 秒至多叠加一层，共需 4 层。安柏大招 18 支箭连续命中可确保在 0.8 秒内光速触发终末之歌，无需在前台停留。",
    },
    {
      topicZh: "教官4件套触发机制 (Instructor 4pc Trigger)",
      detailZh: "教官 4 件套的 120 精通加成必须由装备者在【前台】触发元素反应才能激活。切出安柏施放 Q 命中已有水底的敌人时可在前台瞬间触发蒸发反应并激活教官套。",
    },
    {
      topicZh: "避免抢胡桃反应 (Vaporize Priority)",
      detailZh: "安柏大招持续时间仅为 2 秒。等待安柏大招箭雨完全结束、且风系角色完成火扩散后，再切出行秋打出水剑并切出胡桃开 E，这样安柏的技能绝不会干扰胡桃后续的蒸发反应。",
    },
  ],
};
```

---

## 四、 录入标准化作业流程 (Standard Ingestion SOP)

后续添加新角色与流派时，请执行以下标准步骤：

### 步骤 1：定位目标流派与角色
1. 访问 KQM 对应角色 Quickguide（如 `keqingmains.com/q/{char}-quickguide/`）。
2. 梳理主要章节：
   - `Playstyles / Roles`（角色在队伍中是站场主C、后台副C还是驱动/增益辅助）
   - `Team Compositions`（队友搭配与替换位）
   - `Rotation & Energy`（动作顺序与充能门槛）
   - `Artifacts & Weapons`（首选与过渡搭配）
   - `Constellations & Talents`（关键命座与加点）

### 步骤 2：KQM 简写到动作轴（Rotation）转换规则
KQM 常用的循环简写应转换为本模拟器的动作列表：
- **`E`** $\rightarrow$ `{ characterId, actionType: "skill" }`
- **`Q`** $\rightarrow$ `{ characterId, actionType: "burst" }`
- **`N1 / N2 / N3`** $\rightarrow$ `{ characterId, actionType: "normal" }`
- **`C / CA`** $\rightarrow$ `{ characterId, actionType: "charged" }`
- **`hE / tE`** $\rightarrow$ 长按战技 / 点按战技
- **`D / Dash`** $\rightarrow$ 闪避（可作为间隔，或由引擎换人时间换算）
- **`Swap`** $\rightarrow$ 换人切出下一位角色 `{ characterId, actionType: "swap" }`

### 步骤 3：充能门槛（ER%）记录原则
- 记录基准：该特定配队下的实战充能区间（例如单雷、双雷、西风前台吃球、后台吃球）。
- 填入对应角色的建议面板中，用于在属性配置弹窗（`CharacterStatsModal`）提供一键套用参考。

### 步骤 4：关键命座与机制注意事项萃取
- **数值型质变**：如减抗、加伤、无视防御（需在 `raidenNationalKit.ts` 或类似模块中注册为 declarative `Buff`）。
- **轴时长改变型**：如香菱 C4（大招 +4s）、行秋 C2（大招 +3s），需在动作时序流中予以反映。
- **机制提示型**：如附魔冲突、快照锁面板（Snapshot）、教官套需前台触发反应等，记录在 `mechanicsCaveatsZh` 中，方便向用户展示提示与教学。

### 步骤 5：验证与仿真测试
1. 在 `src/tests/` 中编写对应预设的合法性测试，验证：
   - 动作轴中涉及的所有角色均在队伍中（`orphanedActionCount === 0`）。
   - 动作轴没有冷却中强行施放（无 CD 违规）。
   - 能量在开启大招前通过产球与西风满足消耗（无能量不足跳过动作）。
2. 运行 `npm run test` 与 `npm run typecheck` 保证 100% 通过。
