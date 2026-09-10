/**
 * Official Chinese Talents and Constellations data for Raiden National Team members:
 * - 雷电将军 (Raiden Shogun)
 * - 班尼特 (Bennett)
 * - 香菱 (Xiangling)
 * - 行秋 (Xingqiu)
 */

import type { Buff } from "@/simulation/buffs/types";
import type { CharacterDefinition } from "@/types";

export interface CharacterTalentInfo {
  id: string;
  name: string;
  nameEn: string;
  slot: "normal" | "skill" | "burst";
  slotNameZh: string;
  descriptionZh: string;
}

export interface CharacterPassiveInfo {
  id: string;
  name: string;
  nameEn: string;
  type: "a1" | "a4" | "utility";
  typeLabelZh: string;
  unlockAscension: number;
  descriptionZh: string;
}

export interface CharacterConstellationInfo {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  name: string;
  nameEn: string;
  descriptionZh: string;
}

export interface CharacterKitDetails {
  characterId: string;
  nameZh: string;
  nameEn: string;
  defaultConstellation: number;
  defaultTalentLevels: { normal: number; skill: number; burst: number };
  combatTalents: readonly CharacterTalentInfo[];
  passives: readonly CharacterPassiveInfo[];
  constellations: readonly CharacterConstellationInfo[];
}

export const RAIDEN_SHOGUN_KIT: CharacterKitDetails = {
  characterId: "raiden-shogun",
  nameZh: "雷电将军",
  nameEn: "Raiden Shogun",
  defaultConstellation: 2,
  defaultTalentLevels: { normal: 6, skill: 9, burst: 10 },
  combatTalents: [
    {
      id: "raiden-na",
      name: "源流",
      nameEn: "Origin",
      slot: "normal",
      slotNameZh: "普通攻击",
      descriptionZh: "进行至多五段的连续枪击。重击消耗体力进行向上的挑斩攻击。",
    },
    {
      id: "raiden-skill",
      name: "神变·恶曜开眼",
      nameEn: "Transcendence: Baleful Omen",
      slot: "skill",
      slotNameZh: "元素战技",
      descriptionZh:
        "雷电将军展开净土的一角，对周围的敌人造成雷元素伤害，并为队伍中附近的所有角色授以「雷罚恶曜之眼」。处于雷罚恶曜之眼协同下的角色攻击命中敌人时，雷罚恶曜之眼会进行协同攻击造成雷元素范围伤害；并在持续期间基于元素爆发的能量消耗提高元素爆发造成的伤害。",
    },
    {
      id: "raiden-burst",
      name: "奥义·梦想真说",
      nameEn: "Secret Art: Musou Shinsetsu",
      slot: "burst",
      slotNameZh: "元素爆发",
      descriptionZh:
        "汇聚万千真言与竭尽诸愿百眼之愿力，斩出梦想的一刀，造成雷元素范围伤害，并在随后一段时间内使用「梦想一心」进行战斗。梦想一心状态下普通攻击、重击与下落攻击均转化为无法被附魔覆盖的雷元素伤害，且命中敌人时为队伍中所有角色恢复元素能量。",
    },
  ],
  passives: [
    {
      id: "raiden-a1",
      name: "万千的愿望",
      nameEn: "Wishes Unnumbered",
      type: "a1",
      typeLabelZh: "突破等级 1 固有天赋",
      unlockAscension: 1,
      descriptionZh:
        "队伍中附近的角色获得元素微粒或元素晶球时，为诸愿百眼之轮积攒2点愿力。该效果每3秒至多触发一次。",
    },
    {
      id: "raiden-a4",
      name: "殊胜之御体",
      nameEn: "Enlightened One",
      type: "a4",
      typeLabelZh: "突破等级 4 固有天赋",
      unlockAscension: 4,
      descriptionZh:
        "基于元素充能效率超过100%的部分，每1%使雷电将军获得：梦想一心状态提供的元素能量恢复提高0.4%；雷元素伤害加成提升0.4%。",
    },
    {
      id: "raiden-utility",
      name: "天下名物狩",
      nameEn: "All-Preserver",
      type: "utility",
      typeLabelZh: "固有探索天赋",
      unlockAscension: 0,
      descriptionZh: "突破单手剑和长柄武器时，消耗的摩拉数量减少50%。",
    },
  ],
  constellations: [
    {
      level: 1,
      id: "raiden-c1",
      name: "恶曜盼蕊",
      nameEn: "Ominous Inscription",
      descriptionZh:
        "诸愿百眼之轮能更加迅速地积攒愿力。元素类型为雷元素/其他元素角色施放元素爆发积攒的愿力提升80%/20%。",
    },
    {
      level: 2,
      id: "raiden-c2",
      name: "斩铁断金",
      nameEn: "Steelbreaker",
      descriptionZh:
        "奥义·梦想真说的梦想一刀与梦想一心状态下的攻击将无视敌人60%的防御力。",
    },
    {
      level: 3,
      id: "raiden-c3",
      name: "真影旧事",
      nameEn: "Shinkage Bygones",
      descriptionZh: "奥义·梦想真说的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 4,
      id: "raiden-c4",
      name: "誓奉庆云",
      nameEn: "Pledge of Propriety",
      descriptionZh:
        "奥义·梦想真说施加的梦想一心状态结束后，附近队伍中所有角色（不包括雷电将军自己）的攻击力提升30%，持续10秒。",
    },
    {
      level: 5,
      id: "raiden-c5",
      name: "凶将显形",
      nameEn: "Shogun's Descent",
      descriptionZh: "神变·恶曜开眼的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 6,
      id: "raiden-c6",
      name: "负愿傲命",
      nameEn: "Wishbearer",
      descriptionZh:
        "梦想一心状态下，雷电将军普通攻击、重击、下落攻击命中敌人时，使附近所有角色（不包括雷电将军自己）元素爆发的冷却时间缩短1秒。该效果每1秒至多触发一次，持续期间至多触发5次。",
    },
  ],
};

export const BENNETT_KIT: CharacterKitDetails = {
  characterId: "bennett",
  nameZh: "班尼特",
  nameEn: "Bennett",
  defaultConstellation: 5,
  defaultTalentLevels: { normal: 1, skill: 8, burst: 10 },
  combatTalents: [
    {
      id: "bennett-na",
      name: "好运剑",
      nameEn: "Strike of Fortune",
      slot: "normal",
      slotNameZh: "普通攻击",
      descriptionZh: "进行至多五段的连续剑击。重击消耗体力瞬间向前方挥出两剑。",
    },
    {
      id: "bennett-skill",
      name: "热情过载",
      nameEn: "Passion Overload",
      slot: "skill",
      slotNameZh: "元素战技",
      descriptionZh:
        "点按向前快速挥出一击造成火元素伤害；长按蓄力一段造成二段火伤击飞敌人；长按蓄力二段造成三段强力火伤，但末段会造成击飞班尼特自身的爆炸。",
    },
    {
      id: "bennett-burst",
      name: "美妙旅程",
      nameEn: "Fantastic Voyage",
      slot: "burst",
      slotNameZh: "元素爆发",
      descriptionZh:
        "班尼特进行腾跃轰击造成火元素伤害并生成鼓舞领域。领域内角色生命值低于或等于70%时持续恢复生命值；高于70%时基于班尼特的基础攻击力获得攻击力加成，并施加火元素附着。",
    },
  ],
  passives: [
    {
      id: "bennett-a1",
      name: "热情复燃",
      nameEn: "Rekindle",
      type: "a1",
      typeLabelZh: "突破等级 1 固有天赋",
      unlockAscension: 1,
      descriptionZh: "热情过载的冷却时间减少20%。",
    },
    {
      id: "bennett-a4",
      name: "无畏的探险",
      nameEn: "Fearnaught",
      type: "a4",
      typeLabelZh: "突破等级 4 固有天赋",
      unlockAscension: 4,
      descriptionZh:
        "在美妙旅程领域内，热情过载具有如下效果：冷却时间减少50%；在蓄力二段时不会被自身爆炸震飞。",
    },
    {
      id: "bennett-utility",
      name: "晨光初现",
      nameEn: "It Should Be Safe...",
      type: "utility",
      typeLabelZh: "固有探索天赋",
      unlockAscension: 0,
      descriptionZh: "在蒙德执行探索派遣任务消耗的时间缩短25%。",
    },
  ],
  constellations: [
    {
      level: 1,
      id: "bennett-c1",
      name: "冒险憧憬",
      nameEn: "Grand Expectation",
      descriptionZh:
        "美妙旅程的攻击力提升效果不再有生命值限制，数值上额外追加班尼特基础攻击力20%的加成。",
    },
    {
      level: 2,
      id: "bennett-c2",
      name: "踏破绝境",
      nameEn: "Impasse Conqueror",
      descriptionZh: "班尼特的生命值低于70%时，元素充能效率提升30%。",
    },
    {
      level: 3,
      id: "bennett-c3",
      name: "火热激情",
      nameEn: "Unstoppable Fervor",
      descriptionZh: "热情过载的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 4,
      id: "bennett-c4",
      name: "热情不灭",
      nameEn: "Unexpected Odyssey",
      descriptionZh:
        "施放一段蓄力的热情过载时，在技能二段攻击中进行普通攻击，可以施加额外的下劈追击。",
    },
    {
      level: 5,
      id: "bennett-c5",
      name: "开拓的心境",
      nameEn: "True Explorer",
      descriptionZh: "美妙旅程的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 6,
      id: "bennett-c6",
      name: "烈火与勇气",
      nameEn: "Fire Ventures with Me",
      descriptionZh:
        "处于美妙旅程领域内的单手剑、双手剑、长柄武器角色获得15%火元素伤害加成，并获得火元素附魔。",
    },
  ],
};

export const XIANGLING_KIT: CharacterKitDetails = {
  characterId: "xiangling",
  nameZh: "香菱",
  nameEn: "Xiangling",
  defaultConstellation: 4,
  defaultTalentLevels: { normal: 1, skill: 8, burst: 10 },
  combatTalents: [
    {
      id: "xiangling-na",
      name: "白罗灭火",
      nameEn: "Dough-Fu",
      slot: "normal",
      slotNameZh: "普通攻击",
      descriptionZh: "进行至多五段的连续枪击。重击消耗体力向前方突进，对路径上的敌人造成伤害。",
    },
    {
      id: "xiangling-skill",
      name: "锅巴出击",
      nameEn: "Guoba Attack",
      slot: "skill",
      slotNameZh: "元素战技",
      descriptionZh:
        "唤出锅巴不断喷火，在持续时间内对前方锥形范围内的敌人连续造成火元素伤害。",
    },
    {
      id: "xiangling-burst",
      name: "旋火轮",
      nameEn: "Pyronado",
      slot: "burst",
      slotNameZh: "元素爆发",
      descriptionZh:
        "甩出围绕角色旋转的旋火轮。旋火轮会跟随角色移动，旋转并对触碰到的敌人造成火元素伤害。",
    },
  ],
  passives: [
    {
      id: "xiangling-a1",
      name: "交叉火力",
      nameEn: "Crossfire",
      type: "a1",
      typeLabelZh: "突破等级 1 固有天赋",
      unlockAscension: 1,
      descriptionZh: "锅巴的喷火距离提升20%。",
    },
    {
      id: "xiangling-a4",
      name: "绝云朝天",
      nameEn: "Beware, It's Super Hot!",
      type: "a4",
      typeLabelZh: "突破等级 4 固有天赋",
      unlockAscension: 4,
      descriptionZh:
        "锅巴出击效果结束时，锅巴会在消失的位置留下辣椒。拾取辣椒会使角色的攻击力提升10%，持续10秒。",
    },
    {
      id: "xiangling-utility",
      name: "万民堂大厨",
      nameEn: "Chef de Cuisine",
      type: "utility",
      typeLabelZh: "固有探索天赋",
      unlockAscension: 0,
      descriptionZh: "完美烹饪攻击类食物时，有12%概率获得2倍产出。",
    },
  ],
  constellations: [
    {
      level: 1,
      id: "xiangling-c1",
      name: "外酥里嫩",
      nameEn: "Crispy Outside, Tender Inside",
      descriptionZh: "受到锅巴攻击的敌人，火元素抗性降低15%，持续6秒。",
    },
    {
      level: 2,
      id: "xiangling-c2",
      name: "大火宽油",
      nameEn: "Oil Meets Fire",
      descriptionZh:
        "普通攻击的最后一击会给敌人施加持续2秒的内爆状态，持续时间结束后发生爆炸，造成75%火元素范围伤害。",
    },
    {
      level: 3,
      id: "xiangling-c3",
      name: "武火急烹",
      nameEn: "Deepfry",
      descriptionZh: "旋火轮的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 4,
      id: "xiangling-c4",
      name: "煨火慢炖",
      nameEn: "Slowbake",
      descriptionZh: "旋火轮的持续时间延长40%（由10秒提升至14秒）。",
    },
    {
      level: 5,
      id: "xiangling-c5",
      name: "锅巴凶猛",
      nameEn: "Guoba Mad",
      descriptionZh: "锅巴出击的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 6,
      id: "xiangling-c6",
      name: "大龙卷旋火",
      nameEn: "Condensed Pyronado",
      descriptionZh: "旋火轮持续期间，队伍中所有角色获得15%火元素伤害加成。",
    },
  ],
};

export const XINGQIU_KIT: CharacterKitDetails = {
  characterId: "xingqiu",
  nameZh: "行秋",
  nameEn: "Xingqiu",
  defaultConstellation: 6,
  defaultTalentLevels: { normal: 1, skill: 9, burst: 10 },
  combatTalents: [
    {
      id: "xingqiu-na",
      name: "古华剑法",
      nameEn: "Guhua Style",
      slot: "normal",
      slotNameZh: "普通攻击",
      descriptionZh: "进行至多五段的连续剑击。重击消耗体力向前连斩出两剑。",
    },
    {
      id: "xingqiu-skill",
      name: "古华剑·画雨笼山",
      nameEn: "Fatal Rainscreen",
      slot: "skill",
      slotNameZh: "元素战技",
      descriptionZh:
        "使出连续两段的剑技造成水元素伤害，同时生成最大数量的雨帘剑环绕在场上角色身旁。雨帘剑为当前场上角色提供抗打断能力与伤害减免。",
    },
    {
      id: "xingqiu-burst",
      name: "古华剑·裁雨留虹",
      nameEn: "Raincutter",
      slot: "burst",
      slotNameZh: "元素爆发",
      descriptionZh:
        "展开虹剑势，生成最大数量的雨帘剑。当前场上角色在进行普通攻击时，将协同产生剑雨攻击，对敌人造成水元素伤害，并施加水元素附着。",
    },
  ],
  passives: [
    {
      id: "xingqiu-a1",
      name: "生水要诀",
      nameEn: "Hydropathic",
      type: "a1",
      typeLabelZh: "突破等级 1 固有天赋",
      unlockAscension: 1,
      descriptionZh:
        "雨帘剑受击碎裂或持续时间结束时，基于行秋最大生命值的6%恢复当前场上角色的生命值。",
    },
    {
      id: "xingqiu-a4",
      name: "虚实工笔",
      nameEn: "Bladesidhe",
      type: "a4",
      typeLabelZh: "突破等级 4 固有天赋",
      unlockAscension: 4,
      descriptionZh: "行秋获得20%水元素伤害加成。",
    },
    {
      id: "xingqiu-utility",
      name: "灵光乍现",
      nameEn: "Flash of Genius",
      type: "utility",
      typeLabelZh: "固有探索天赋",
      unlockAscension: 0,
      descriptionZh: "合成角色天赋素材时，有25%概率返还部分合成材料。",
    },
  ],
  constellations: [
    {
      level: 1,
      id: "xingqiu-c1",
      name: "重帘留香",
      nameEn: "The Scent Remained",
      descriptionZh: "雨帘剑的最大数量增加1柄（由3柄增加至4柄）。",
    },
    {
      level: 2,
      id: "xingqiu-c2",
      name: "天青现虹",
      nameEn: "Rainbow Upon the Azure Sky",
      descriptionZh:
        "古华剑·裁雨留虹的持续时间延长3秒（由15秒提升至18秒）；此外，受到剑雨攻击的敌人水元素抗性降低15%，持续4秒。",
    },
    {
      level: 3,
      id: "xingqiu-c3",
      name: "织诗成锦",
      nameEn: "Weaver of Verses",
      descriptionZh: "古华剑·裁雨留虹的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 4,
      id: "xingqiu-c4",
      name: "孤舟斩蛟",
      nameEn: "Evilsoother",
      descriptionZh:
        "在古华剑·裁雨留虹效果持续期间，古华剑·画雨笼山造成的伤害提升50%。",
    },
    {
      level: 5,
      id: "xingqiu-c5",
      name: "雨深闭门",
      nameEn: "Embrace of Rain",
      descriptionZh: "古华剑·画雨笼山的技能等级提高3级。至多提升至15级。",
    },
    {
      level: 6,
      id: "xingqiu-c6",
      name: "万文集舍",
      nameEn: "Hence, Call Them My Own Verses",
      descriptionZh:
        "古华剑·裁雨留虹每发动2次剑雨攻击，就大幅增强下一次剑雨攻击（发射5柄剑雨），并在命中敌人时为行秋恢复3点元素能量。",
    },
  ],
};

export const RAIDEN_NATIONAL_KITS: Record<string, CharacterKitDetails> = {
  raiden: RAIDEN_SHOGUN_KIT,
  "raiden-shogun": RAIDEN_SHOGUN_KIT,
  bennett: BENNETT_KIT,
  xiangling: XIANGLING_KIT,
  xingqiu: XINGQIU_KIT,
};

export function getCharacterKitDetails(characterId: string): CharacterKitDetails | undefined {
  const normalized = characterId.toLowerCase().trim();
  return RAIDEN_NATIONAL_KITS[normalized];
}

/**
 * Returns active declarative buffs and enemy debuffs for Raiden National team
 * according to current constellation and talent configurations.
 */
export function getRaidenNationalBuffs(
  team: readonly CharacterDefinition[],
): readonly Buff[] {
  const buffs: Buff[] = [];

  for (const char of team) {
    const kit = getCharacterKitDetails(char.id);
    const cLevel =
      char.constellation !== undefined
        ? char.constellation
        : kit?.defaultConstellation ?? 0;
    const id = char.id.toLowerCase();

    // Raiden Shogun
    if (id === "raiden" || id === "raiden-shogun") {
      // A4 Passive: ER > 100% -> Electro DMG (0.4 ratio)
      buffs.push({
        id: "raiden-a4-conversion",
        source: "雷电将军·殊胜之御体",
        sourceCharacterId: char.id,
        startTime: 0,
        duration: Number.POSITIVE_INFINITY,
        stacking: { mode: "refresh" },
        targets: { scope: "self" },
        conversions: [
          {
            sourceStat: "energyRecharge",
            targetStat: "elementalDmgBonus",
            element: "electro",
            threshold: 1.0,
            ratio: 0.4,
          },
        ],
      });

      // C2: 60% DEF ignore during burst
      if (cLevel >= 2) {
        buffs.push({
          id: "raiden-c2-def-ignore",
          source: "雷电将军·斩铁断金",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "self" },
          conditions: { damageTypes: ["burst"] },
          enemyModifiers: [
            {
              key: "defIgnore",
              value: 0.6,
            },
          ],
        });
      }

      // C4: +30% ATK to other party members
      if (cLevel >= 4) {
        buffs.push({
          id: "raiden-c4-atk-bonus",
          source: "雷电将军·誓奉庆云",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          modifiers: [
            {
              stat: "atkPercent",
              value: 0.3,
            },
          ],
        });
      }
    }

    // Bennett
    if (id === "bennett") {
      // C6: +15% Pyro DMG to party
      if (cLevel >= 6) {
        buffs.push({
          id: "bennett-c6-pyro-dmg",
          source: "班尼特·烈火与勇气",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          modifiers: [
            {
              stat: "elementalDmgBonus",
              element: "pyro",
              value: 0.15,
            },
          ],
        });
      }
    }

    // Xiangling
    if (id === "xiangling") {
      // C1: 15% Pyro RES shred
      if (cLevel >= 1) {
        buffs.push({
          id: "xiangling-c1-pyro-shred",
          source: "香菱·外酥里嫩",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          enemyModifiers: [
            {
              key: "resReduction",
              element: "pyro",
              value: 0.15,
            },
          ],
        });
      }

      // C6: 15% Pyro DMG bonus
      if (cLevel >= 6) {
        buffs.push({
          id: "xiangling-c6-pyro-dmg",
          source: "香菱·大龙卷旋火",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          modifiers: [
            {
              stat: "elementalDmgBonus",
              element: "pyro",
              value: 0.15,
            },
          ],
        });
      }
    }

    // Xingqiu
    if (id === "xingqiu") {
      // A4: 20% Hydro DMG bonus
      buffs.push({
        id: "xingqiu-a4-hydro-dmg",
        source: "行秋·虚实工笔",
        sourceCharacterId: char.id,
        startTime: 0,
        duration: Number.POSITIVE_INFINITY,
        stacking: { mode: "refresh" },
        targets: { scope: "self" },
        modifiers: [
          {
            stat: "elementalDmgBonus",
            element: "hydro",
            value: 0.2,
          },
        ],
      });

      // C2: 15% Hydro RES shred
      if (cLevel >= 2) {
        buffs.push({
          id: "xingqiu-c2-hydro-shred",
          source: "行秋·天青现虹",
          sourceCharacterId: char.id,
          startTime: 0,
          duration: Number.POSITIVE_INFINITY,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          enemyModifiers: [
            {
              key: "resReduction",
              element: "hydro",
              value: 0.15,
            },
          ],
        });
      }
    }
  }

  return buffs;
}

