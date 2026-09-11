# 雷电将军命之座模拟模型

本文记录雷电将军 C1–C6 的资料依据、事件边界、可复用实现模板和验证序列。命之座效果必须进入可序列化模拟状态，不能用永久伤害加成代替时间、命中或资源条件。

## 资料边界

- KQM 雷电将军 Quick Guide 与 Character Library：确认梦想一心持续时间、命之座触发窗口、C2 防御力无视、C4 目标和 C6 冷却缩减规则。
- Lunaris / 已生成角色倍率表：提供爆发初始斩击、梦想一心普通/重击/下落攻击倍率。
- 仓库生成数据：提供版本、验证状态和天赋等级表。生成文件不直接手改；角色专属状态通过数据适配层叠加。

不确定机制必须保持未接入状态，直到有来源和引擎状态同时支持。描述文本不等于可执行效果。

## C1–C6 事件模型

| 命之座 | 触发 | 模拟状态 | 验证结果 |
| --- | --- | --- | --- |
| C1 恶曜盼蕊 | 队伍角色施放元素爆发 | 愿力资源按爆发能量消耗增加；雷元素来源乘 1.8，其他元素来源乘 1.2 | 记录每次爆发后的愿力，确认 C0/C1 差值来自资源，不是直接伤害加成 |
| C2 斩铁断金 | 雷电将军爆发初始斩击、梦想一心攻击 | 对雷电将军相关爆发伤害应用 `defIgnore = 0.6` | 高防御敌人下比较初始斩击、梦想一心攻击、队友攻击 |
| C3 真影旧事 | 每次爆发选倍率表 | 爆发天赋等级 +3，结果等级封顶 15 | 只改变爆发倍率，不改变技能、普通攻击或资源 |
| C4 誓奉庆云 | 梦想一心状态结束 | 给除雷电将军外队友 +30% 攻击力，持续 10 秒，结束时刷新 | 状态内攻击不吃 C4；结束后队友吃；雷电将军不吃；10 秒后失效 |
| C5 凶将显形 | 每次战技选倍率表 | 战技天赋等级 +3，结果等级封顶 15 | 只改变战技倍率 |
| C6 负愿傲命 | 梦想一心期间，普通/重击/下落攻击命中 | 其他队员爆发冷却减少 1 秒；每 1 秒最多一次；每次状态最多 5 次；不影响雷电将军 | 使用至少 6 次命中和同秒多命中，确认最多 5 次且时间 ICD 生效 |

## 可复用命之座模板

### 天赋等级模板

```ts
{
  level: 3,
  buffs: [{
    id: "character-c3",
    sourceCharacterId: "character",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    talentLevelModifiers: [{ slot: "burst", levels: 3 }],
  }],
}
```

引擎在每次施放时读取一次有效等级，基准等级加增量后封顶 15。不要把天赋等级加成写进倍率常量。

### 状态窗口模板

```ts
{
  id: "character-state",
  durationSeconds: 7,
  endsOnSwap: true,
  damageTypeOverride: "burst",
  normalAttacks,
  chargedAttack,
  plungeLow,
  plungeHigh,
  stateEndBuffs,
}
```

状态进入、自然结束、换人结束都必须记录在快照。替换攻击引用已验证倍率表，不复制或重算倍率。

### 状态结束增益模板

```ts
{
  id: "character-state-end-buff",
  sourceCharacterId: "character",
  startTime: 0,
  duration: 10,
  stacking: { mode: "refresh" },
  targets: { scope: "party", excludeSource: true },
  modifiers: [{ stat: "atkPercent", value: 0.3 }],
}
```

模板只在状态结束时间实例化。不能把 `startTime` 固定为 0，也不能把 `duration` 设为无限。

### 命中触发冷却模板

```ts
{
  kind: "cooldownReductionOnHit",
  sourceCharacterId: "character",
  reductionSeconds: 1,
  cooldownSeconds: 1,
  maxTriggers: 5,
  requiresStanceId: "character-state",
  actionTypes: ["normal", "charged", "plungeLow", "plungeHigh"],
  excludeSource: true,
}
```

触发点必须是成功命中后的伤害事件。施放开始、命中前、反应触发都不能代替命中事件。计数、上次触发时间和状态窗口必须进入快照与优化器状态键。

### 按爆发能量触发资源模板

```ts
{
  id: "resolve",
  initial: 0,
  max: 60,
  gainOnBurstCast: {
    perEnergyCost: 0.2,
    defaultMultiplier: 1.2,
    multipliersByElement: { electro: 1.8 },
  },
}
```

规则由资源声明拥有者。事件来源元素和爆发能量由引擎提供，避免在通用引擎写角色分支。

### 资源快照伤害模板

愿力不是爆发后仍留在角色身上的永久增益。施放奥义时先读取愿力、再清空资源；初始斩击和随后七秒内的梦想一心攻击继续使用同一次读取结果。因此资源声明同时标记消耗，倍率实例声明按施法快照读取：

```ts
{
  id: "raiden-resolve",
  consumeOnBurstCast: true,
  // ... gainOnBurstCast
}

{
  stat: "atk",
  table: sourcedTalentTable,
  resourceScaling: [{
    resourceId: "raiden-resolve",
    stat: "atk",
    multiplierPerStack: 0.0087,
    snapshot: "cast",
  }],
}
```

雷电将军当前使用的来源倍率为：梦想一刀每层 `0.87% ATK`，梦想一心普通攻击每层 `0.71% ATK`，重击每层 `0.99% ATK`，下落攻击每层 `1.33% ATK`。这些是额外的基础倍率，会和天赋倍率一起进入同一个基础伤害求和，再接受增伤、暴击、防御、抗性和反应计算。状态快照必须进入 `ActiveStanceState`，并写入模拟快照与优化器状态键；否则从中途恢复会丢失愿力对应的梦想一心伤害。

## 验证序列

固定雷电将军、班尼特、香菱、行秋的等级、装备、能量、敌人等级、防御和抗性。使用 `critMode: "never"`，每个命之座只改变一个输入。

```ts
[
  { characterId: "raiden-shogun", actionType: "skill" },
  { characterId: "bennett", actionType: "burst" },
  { characterId: "xiangling", actionType: "burst" },
  { characterId: "xingqiu", actionType: "burst" },
  { characterId: "raiden-shogun", actionType: "burst" },
  { characterId: "raiden-shogun", actionType: "normal" },
  { characterId: "raiden-shogun", actionType: "normal" },
  { characterId: "raiden-shogun", actionType: "charged" },
  { characterId: "raiden-shogun", actionType: "normal" },
]
```

检查项：

1. C1：三名队友爆发后的愿力，雷元素与其他元素倍率，资源封顶 60。
2. C2：初始斩击与梦想一心攻击获得无视防御；状态外和队友不获得。
3. C3/C5：等级表切换和 15 级封顶。
4. C4：状态结束时间、队友排除雷电将军、10 秒边界和刷新。
5. C6：攻击类型、命中时间 ICD、五次上限、队友范围和雷电将军排除。
6. 快照恢复：在状态中间、C4 增益中间和 C6 已触发若干次时拆分运行，结果与连续运行一致。

## 过度模拟禁区

- 永久 C4 攻击力增益。
- 用所有 `damageType: "burst"` 伤害代替梦想一心状态条件。
- 用施放触发代替 C6 命中触发。
- 固定增加愿力，忽略爆发能量消耗和来源元素。
- 用伤害倍率代替 C2 防御力无视。
- 把 C6 冷却缩减写成能量恢复或爆发伤害加成。
