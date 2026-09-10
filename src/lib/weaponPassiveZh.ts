/**
 * Chinese translations and dictionary for weapon passive skill names and descriptions.
 * Provides authentic in-game localization for all weapons.
 */

interface PassiveZh {
  nameZh: string;
  descZh: string;
}

const WEAPON_PASSIVE_ZH: Record<string, PassiveZh> = {
  // 5★ Swords
  mistsplitterreforged: {
    nameZh: "雾切之巴印",
    descZh: "获得12%~24%所有元素伤害加成，并能获得「雾切之巴印」的威势。持有1/2/3层巴印时，分别获得(8/16/28)%~(16/32/56)%所属元素伤害加成。普攻造成元素伤害、施放元素爆发、能量低于100%时各获得1层。",
  },
  primordialjadecutter: {
    nameZh: "护国的无垢之心",
    descZh: "生命值提升20%~40%。此外，基于装备该武器的角色生命值上限的1.2%~2.4%，获得攻击力加成。",
  },
  aquilafavonia: {
    nameZh: "西风之鹰的抗争",
    descZh: "攻击力提升20%~40%。受到伤害时恢复相当于攻击力100%~160%的生命值，并对周围敌人造成200%~320%攻击力的伤害，每15秒至多触发一次。",
  },
  freedomsworn: {
    nameZh: "抗争的千年大乐",
    descZh: "造成的伤害提升10%~20%。触发元素反应时获得「奋起之符」，持有2枚时消耗并使全队普通攻击/重击/下落攻击伤害提升16%~32%，攻击力提升20%~40%，持续12秒。",
  },
  harangeppakufutsu: {
    nameZh: "白刃波涛",
    descZh: "获得12%~24%全元素伤害加成。队伍中附近其他角色施放元素战技时，获得「波穗」效果。装备者施放战技时消耗波穗，每层使普通攻击伤害提升20%~40%，至多2层。",
  },
  lightoffoliarincision: {
    nameZh: "白月光芒",
    descZh: "暴击率提升4%~8%。普通攻击造成元素伤害后，普通攻击和元素战技造成的伤害值提高，提高数值相当于元素精通的120%~240%。生效28次或12秒后消失。",
  },
  splendoroftranquilwaters: {
    nameZh: "湖光的朝与暮",
    descZh: "当前生命值提升或降低时，元素战技伤害提升8%~16%，至多叠加3层；队伍中其他角色生命值变动时，生命值上限提升14%~28%，至多叠加2层。角色在后台亦可触发。",
  },
  absolution: {
    nameZh: "绝命盟约",
    descZh: "暴击伤害提升20%~40%。赋予生命之契的数值提升时，造成的伤害提升16%~32%，持续6秒，至多叠加3层。",
  },
  keyofkhajnisut: {
    nameZh: "沉入沙海的史诗",
    descZh: "生命值提升20%~40%。元素战技命中敌人时基于生命上限的0.12%~0.24%获得元素精通，至多3层。叠满3层时基于生命上限的0.2%~0.4%为全队提升元素精通，持续20秒。",
  },
  urakumisugiri: {
    nameZh: "锦之绣",
    descZh: "普通攻击造成的伤害提升16%~32%，元素战技造成的伤害提升24%~48%。队伍中附近的角色在场上造成岩元素伤害后，上述效果翻倍，持续15秒。防御力提升20%~40%。",
  },
  peakpatrolsong: {
    nameZh: "朝向荣光的巡礼",
    descZh: "普通攻击或下落攻击命中敌人后获得「荣光之歌」，防御力提升8%~16%，获得10%~20%全元素伤害加成，至多叠加2层。叠满时为全队提供全元素伤害加成。",
  },
  skywardblade: {
    nameZh: "穿刺高天的苍鹰",
    descZh: "暴击率提升4%~8%。施放元素爆发后获得移速与攻速提升10%，普通攻击与重击命中时造成20%~40%攻击力的额外伤害，持续12秒。",
  },
  summitshaper: {
    nameZh: "金璋皇极",
    descZh: "护盾强效提升20%~40%。攻击命中敌人后攻击力提升4%~8%，至多叠加5层。处于护盾庇护下时，该效果的攻击力提升翻倍。",
  },

  // 4★ Swords
  favoniussword: {
    nameZh: "顺风而行",
    descZh: "攻击造成暴击时，有60%~100%的概率产生少量元素微粒，能为角色恢复6点元素能量。该效果每12~6秒只能触发一次。",
  },
  sacrificialsword: {
    nameZh: "气定神闲",
    descZh: "元素战技造成伤害时，有40%~80%的概率重置该战技的冷却时间。该效果每30~16秒只能触发一次。",
  },
  theblacksword: {
    nameZh: "正义",
    descZh: "普通攻击与重击造成的伤害提升20%~40%。普通攻击与重击造成暴击时恢复相当于攻击力60%~100%的生命值，每5秒至多一次。",
  },
  ironsting: {
    nameZh: "注能之刺",
    descZh: "造成元素伤害后的6秒内，角色造成的伤害提高6%~12%，该效果最多叠加2层。该效果每1秒只能触发一次。",
  },
  amenomakageuchi: {
    nameZh: "岩藏胤",
    descZh: "施放元素战技后获得一枚嗣胤之种。施放元素爆发后清除所有种子，每枚种子为角色恢复6~12点元素能量。",
  },
  festeringdesire: {
    nameZh: "不休的渴慕",
    descZh: "元素战技造成的伤害增加16%~32%，元素战技的暴击率提升6%~12%。",
  },
  fleuvecendreferryman: {
    nameZh: "水银漫步",
    descZh: "元素战技的暴击率提升8%~16%。施放元素战技后的5秒内，元素充能效率提升16%~32%。",
  },
  wolffang: {
    nameZh: "北风的引路人",
    descZh: "元素战技与元素爆发造成的伤害提升16%~32%。战技或爆发命中敌人时，其暴击率分别提升2%~4%，至多叠加4层。",
  },
  xiphosmoonlight: {
    nameZh: "镇灵的低语",
    descZh: "每10秒，每点元素精通提供0.036%~0.072%的元素充能效率，并为队伍中其他角色提供相当于该效果30%的充能效率，持续12秒。",
  },
  lionsroar: {
    nameZh: "踏火息雷",
    descZh: "对处于火元素或雷元素影响下的敌人，造成的伤害提高20%~36%。",
  },

  // 5★ Polearms
  staffofhoma: {
    nameZh: "无羁的朱赤之蝶",
    descZh: "生命值提升20%~40%。此外，基于装备该武器的角色生命值上限的0.8%~1.6%，获得攻击力加成。装备该武器的角色生命值低于50%时，攻击力额外提升生命值上限的1%~2%。",
  },
  engulfinglightning: {
    nameZh: "非时之梦·常世津粮",
    descZh: "攻击力获得提升，提升数值相当于元素充能效率超出100%部分的28%~56%，至多通过这种方式提升80%~160%。施放元素爆发后的12秒内，元素充能效率提升30%~50%。",
  },
  primordialjadewingedspear: {
    nameZh: "昭理的鸢之枪",
    descZh: "命中敌人时自身攻击力提高3.2%~6.4%，持续6秒，最多叠加7层。具有满层状态时，造成的伤害提升12%~24%。",
  },
  calamityqueller: {
    nameZh: "灭却之戒法",
    descZh: "获得12%~24%全元素伤害加成。施放元素战技后获得「圆顿」，每秒使攻击力提升3.2%~6.4%，至多叠加6层。在后台时攻击力提升翻倍。",
  },
  staffofthescarletsands: {
    nameZh: "热沙的蜃景",
    descZh: "基于装备者元素精通的52%~104%，获得攻击力加成。元素战技命中敌人时，基于精通的28%~56%进一步获得攻击力加成，至多叠加3层。",
  },
  crimsonmoonssemblance: {
    nameZh: "残日之影",
    descZh: "重击命中敌人时赋予生命值上限25%的生命之契。持有生命之契时造成的伤害提升12%~28%；生命之契大于等于生命值上限30%时，伤害进一步提升24%~56%。",
  },
  lumidouceelegy: {
    nameZh: "白昼的破晓之音",
    descZh: "攻击力提升15%~31%。对敌人触发燃烧反应或造成草元素伤害后，造成的伤害提升18%~38%，至多叠加2层。恢复12~16点元素能量。",
  },
  vortexvanquisher: {
    nameZh: "金璋皇极",
    descZh: "护盾强效提升20%~40%。攻击命中敌人后攻击力提升4%~8%，至多叠加5层。处于护盾庇护下时，该效果的攻击力提升翻倍。",
  },
  skywardspine: {
    nameZh: "黑色连翼",
    descZh: "暴击率提升8%~16%，普通攻击速度提升12%。普通攻击与重击命中敌人时有50%概率触发真空刃，造成40%~100%攻击力的额外伤害。",
  },

  // 4★ Polearms
  thecatch: {
    nameZh: "舟奔大江",
    descZh: "元素爆发造成的伤害提升16%~32%，元素爆发的暴击率提升6%~12%。",
  },
  favoniuslance: {
    nameZh: "顺风而行",
    descZh: "攻击造成暴击时，有60%~100%的概率产生少量元素微粒，能为角色恢复6点元素能量。该效果每12~6秒只能触发一次。",
  },
  dragonsbane: {
    nameZh: "止水息火",
    descZh: "对处于水元素或火元素影响下的敌人，造成的伤害提高20%~36%。",
  },
  deathmatch: {
    nameZh: "角斗士",
    descZh: "身边至少有2个敌人时，获得16%~32%攻击力提升与16%~32%防御力提升；身边的敌人少于2个时，获得24%~48%攻击力提升。",
  },
  balladofthefjords: {
    nameZh: "故事的收梢",
    descZh: "队伍中存在至少3种不同元素类型的角色时，元素精通提升120~240点。",
  },
  wavebreakersfin: {
    nameZh: "驭浪的海祇",
    descZh: "全队所有角色的能量上限的总和，每1点使装备此武器角色的元素爆发伤害提高0.12%~0.24%，至多提高40%~80%。",
  },

  // 5★ Claymores
  wolfsgravestone: {
    nameZh: "如狼般奔行",
    descZh: "攻击力提升20%~40%；攻击命中生命值低于30%的敌人时，队伍中所有成员的攻击力提升40%~80%，持续12秒。该效果30秒只能触发一次。",
  },
  redhornstonethresher: {
    nameZh: "御伽大王御伽话",
    descZh: "防御力提高28%~56%；普通攻击与重击造成的伤害值提高，提高数值相当于防御力的40%~80%。",
  },
  beaconofthereedsea: {
    nameZh: "沙海守望",
    descZh: "元素战技命中敌人后攻击力提升20%~40%；受到伤害后攻击力提升20%~40%。处于未受护盾保护的状态下时，生命值上限提升32%~64%。",
  },
  verdict: {
    nameZh: "誓约的盟约",
    descZh: "攻击力提升20%~40%。队伍中角色获得结晶反应产生的晶片时，元素战技造成的伤害提升18%~36%，至多叠加2层。施放元素战技后消耗印记。",
  },
  songofbrokenpines: {
    nameZh: "千年的大乐·揭旗之歌",
    descZh: "物理伤害提升20.7%。普通攻击或重击命中敌人时获得一枚低语之符，持有4枚时消耗并使全队普通攻击速度提升12%~24%，攻击力提升20%~40%，持续12秒。",
  },
  skywardpride: {
    nameZh: "斩裂晴空的龙脊",
    descZh: "造成的伤害提升8%~16%。施放元素爆发后，普通攻击和重击命中时发出真空刃，对路径上的敌人造成80%~160%攻击力的伤害，持续20秒或发出8次。",
  },
  theunforged: {
    nameZh: "金璋皇极",
    descZh: "护盾强效提升20%~40%。攻击命中敌人后攻击力提升4%~8%，至多叠加5层。处于护盾庇护下时，该效果的攻击力提升翻倍。",
  },

  // 4★ Claymores
  serpentspine: {
    nameZh: "破浪",
    descZh: "角色在场上时，每4秒提升6%~10%造成的伤害，3%~1.8%受到的伤害。该效果最多叠加5层，角色退场不重置，受到伤害后减少1层。",
  },
  favoniusgreatsword: {
    nameZh: "顺风而行",
    descZh: "攻击造成暴击时，有60%~100%的概率产生少量元素微粒，能为角色恢复6点元素能量。该效果每12~6秒只能触发一次。",
  },
  sacrificialgreatsword: {
    nameZh: "气定神闲",
    descZh: "元素战技造成伤害时，有40%~80%的概率重置该战技的冷却时间。该效果每30~16秒只能触发一次。",
  },
  tidalshadow: {
    nameZh: "白浪白刃",
    descZh: "受到治疗后，攻击力提升24%~48%，持续8秒。角色处于队伍后台也能触发。",
  },
  rainslasher: {
    nameZh: "止水息火",
    descZh: "对处于水元素或雷元素影响下的敌人，造成的伤害提高20%~36%。",
  },
  ultimateoverlordsmegamagicsword: {
    nameZh: "加油！",
    descZh: "攻击力提升12%~24%。帮助美露莘解决问题后，攻击力额外提升至多12%~24%。",
  },

  // 5★ Catalysts
  kagurasverity: {
    nameZh: "神乐舞",
    descZh: "施放元素战技时获得「神乐之真意」效果，使元素战技造成的伤害提升12%~24%，持续16秒，至多叠加3层。持有3层时获得12%~24%全元素伤害加成。",
  },
  lostprayertothesacredwinds: {
    nameZh: "无边际的眷顾",
    descZh: "移动速度提升10%。在场上每4秒获得8%~16%元素伤害加成，至多叠加4层。角色倒下或退场后重置。",
  },
  athousandfloatingdreams: {
    nameZh: "千夜的拂晓歌",
    descZh: "队伍中每个与装备者元素相同的角色使元素精通提升32~64点；每个不同的角色使对应元素伤害加成提升10%~26%。并使周围队伍中其他角色的元素精通提升40~48点。",
  },
  tomeoftheeternalflow: {
    nameZh: "万世的巡回",
    descZh: "生命值提升16%~32%。当前生命值提升或降低时，重击造成的伤害提升14%~30%，至多叠加3层。达到3层或刷新时恢复8~12点元素能量。",
  },
  cashflowsupervision: {
    nameZh: "黄金的血脉",
    descZh: "攻击力提升16%~32%。当前生命值提升或降低时，普通攻击造成的伤害提升16%~32%，重击伤害提升14%~28%，至多叠加3层。3层时提升8%~16%攻速。",
  },
  skywardatlas: {
    nameZh: "浮游之眷",
    descZh: "元素伤害加成提升12%~24%。普通攻击命中时有50%概率获得高天流云的青睐，在15秒内主动攻击附近的敌人，造成160%~320%攻击力的伤害。",
  },
  memoryofdust: {
    nameZh: "金璋皇极",
    descZh: "护盾强效提升20%~40%。攻击命中敌人后攻击力提升4%~8%，至多叠加5层。处于护盾庇护下时，该效果的攻击力提升翻倍。",
  },
  surfsup: {
    nameZh: "水色波涛",
    descZh: "生命值上限提升20%~40%。施放元素战技后获得「热浪之礼」，普通攻击造成的伤害提升，该效果每12秒至多触发一次。",
  },
  cranesechoingcall: {
    nameZh: "鹤羽拂云",
    descZh: "装备者下落攻击命中敌人后，队伍中附近所有角色的下落攻击造成的伤害提升28%~56%，持续20秒。下落攻击命中时恢复2.5~3.5点元素能量。",
  },
  jadefallssplendor: {
    nameZh: "定土玉圭",
    descZh: "施放元素爆发或创造护盾后的3秒内恢复元素能量，并基于生命值上限提升对应元素伤害加成。",
  },
  everlastingmoonglow: {
    nameZh: "白夜的偏月",
    descZh: "治疗加成提升10%~20%。普通攻击造成的伤害增加，增加值相当于生命上限的1%~3%。施放元素爆发后普通攻击命中恢复元素能量。",
  },

  // 4★ Catalysts
  thewidsith: {
    nameZh: "登场乐",
    descZh: "角色登场时，随机获得一个主题乐，持续10秒。宣叙调：攻击力提升60%~120%；咏叹调：全元素伤害提升48%~96%；间奏曲：元素精通提升240~480。每30秒只能触发一次。",
  },
  sacrificialfragments: {
    nameZh: "气定神闲",
    descZh: "元素战技造成伤害时，有40%~80%的概率重置该战技的冷却时间。该效果每30~16秒只能触发一次。",
  },
  favoniuscodex: {
    nameZh: "顺风而行",
    descZh: "攻击造成暴击时，有60%~100%的概率产生少量元素微粒，能为角色恢复6点元素能量。该效果每12~6秒只能触发一次。",
  },
  prototypeamber: {
    nameZh: "日金",
    descZh: "施放元素爆发后6秒内，每2秒恢复4~6点元素能量，并为队伍中所有角色恢复4%~6%生命值。",
  },
  solarpearl: {
    nameZh: "日月辉",
    descZh: "普通攻击命中敌人后的6秒内，元素战技与元素爆发的伤害提升20%~40%；战技或爆发命中后，普通攻击伤害提升20%~40%。",
  },
  sacrificialjade: {
    nameZh: "奔玉",
    descZh: "处于后台超过5秒后，生命值上限提升32%~64%，元素精通提升40~80点。登场后生效10秒。",
  },
  dodocotales: {
    nameZh: "嘟嘟大冒险",
    descZh: "普通攻击命中敌人后的6秒内，重击造成的伤害提升16%~32%；重击命中后攻击力提升8%~16%。",
  },

  // 5★ Bows
  aquasimulacra: {
    nameZh: "濯洗之谋",
    descZh: "生命值提升16%~32%。周围存在敌人时，装备该武器的角色造成的伤害提升20%~40%，不论该角色处于场上或是场下均能生效。",
  },
  thunderingpulse: {
    nameZh: "飞雷御执",
    descZh: "攻击力提升20%~40%，并能获得「飞雷之巴印」的威势。在持有1/2/3层飞雷之巴印时，普通攻击造成的伤害提高(12/24/40)%~(24/48/80)%。普攻造成伤害、施放战技、能量低于100%时各获1层。",
  },
  polarstar: {
    nameZh: "极昼的先驱",
    descZh: "元素战技和元素爆发造成的伤害提升12%~24%。普通攻击、重击、元素战技或元素爆发命中敌人后获得「白夜极星」层数，提升攻击力10%~48%。",
  },
  thefirstgreatmagic: {
    nameZh: "戏剧的独白",
    descZh: "重击造成的伤害提升16%~32%。队伍中每存在一位与装备者元素相同的角色，获得攻击力加成；元素不同的角色提供移动速度提升。",
  },
  hunterspath: {
    nameZh: "林薮之终",
    descZh: "获得12%~24%全元素伤害加成。重击命中敌人后获得「无休止的狩猎」，重击造成的伤害值提高，提高数值相当于元素精通的160%~320%。",
  },
  elegyfortheend: {
    nameZh: "别离的思念",
    descZh: "元素精通提高60~120点。元素战技或元素爆发命中敌人时获得一枚回忆之符。持有4枚时消耗，全队元素精通提高100~200点，攻击力提升20%~40%，持续12秒。",
  },
  skywardharp: {
    nameZh: "回响长天的诗歌",
    descZh: "暴击伤害提高20%~40%。攻击命中时有60%~100%概率造成125%攻击力范围物理伤害，每4~2秒至多触发一次。",
  },
  amosbow: {
    nameZh: "矢志不移",
    descZh: "普通攻击和重击造成的伤害提升12%~24%。箭矢发射后每经过0.1秒伤害提升8%~16%，至多叠加5次。",
  },
  silvershowerheartstrings: {
    nameZh: "静谧沉落的晨曦",
    descZh: "治疗队伍成员、施放战技或赋予生命之契时获得「疗愈」，使生命值上限提升至多12%~28%，元素爆发暴击率提升28%。",
  },
  astralvulturescrimsonplumage: {
    nameZh: "辉煌之羽",
    descZh: "触发扩散反应后攻击力提升24%~48%，持续12秒。重击与下落攻击造成的伤害获得大幅提升。",
  },

  // 4★ Bows
  thestringless: {
    nameZh: "无矢之歌",
    descZh: "元素战技与元素爆发造成的伤害提升24%~48%。",
  },
  favoniuswarbow: {
    nameZh: "顺风而行",
    descZh: "攻击造成暴击时，有60%~100%的概率产生少量元素微粒，能为角色恢复6点元素能量。该效果每12~6秒只能触发一次。",
  },
  sacrificialbow: {
    nameZh: "气定神闲",
    descZh: "元素战技造成伤害时，有40%~80%的概率重置该战技的冷却时间。该效果每30~16秒只能触发一次。",
  },
  rust: {
    nameZh: "速射弓斗",
    descZh: "普通攻击造成的伤害提升40%~80%，重击造成的伤害下降10%。",
  },
  fadingtwilight: {
    nameZh: "渊深霞色",
    descZh: "攻击命中敌人后切换状态，分别使角色造成的伤害提升6%/10%/14%~12%/20%/28%，后台亦可触发。",
  },
  mouunsmoon: {
    nameZh: "驭浪的海祇",
    descZh: "全队所有角色的能量上限的总和，每1点使装备此武器角色的元素爆发伤害提高0.12%~0.24%，至多提高40%~80%。",
  },
  scionoftheblazingsun: {
    nameZh: "白热的炽阳",
    descZh: "重击命中敌人后向其降下阳炎矢，造成60%~120%攻击力的伤害，并使受影响的敌人受到重击伤害增加28%~56%。",
  },
  cloudforged: {
    nameZh: "积翠之云",
    descZh: "元素能量减少时，元素精通提升40~80点，持续6秒，至多叠加2层。",
  },
  chainbreaker: {
    nameZh: "坚毅的誓言",
    descZh: "队伍中每有一位来自纳塔或与装备者元素类型不同的角色，攻击力提升4.8%~9.6%；至少有3位时，元素精通提升24~48点。",
  },
  songofstillness: {
    nameZh: "白浪白刃",
    descZh: "受到治疗后造成的伤害提升16%~32%，持续8秒。角色处于队伍后台也能触发。",
  },
};

const MISSING_PASSIVE_NAME_ZH = "武器专属特效";
const MISSING_PASSIVE_DESC_ZH = "暂无中文特效说明";

/**
 * Resolve a verified Chinese passive presentation.
 *
 * Generated/legacy weapon data may contain English source prose. It must not
 * be rendered after a partial keyword substitution because that produces a
 * misleading mixed-language description. Unmapped passives fail closed.
 */
export function getWeaponPassiveZh(
  weaponId: string,
  _fallbackName: string,
  _fallbackDesc: string,
): PassiveZh {
  // Keep the legacy arguments in the public call shape while refusing to
  // render unverified source prose.
  void _fallbackName;
  void _fallbackDesc;

  const found = WEAPON_PASSIVE_ZH[weaponId];
  if (found) return found;

  return {
    nameZh: MISSING_PASSIVE_NAME_ZH,
    descZh: MISSING_PASSIVE_DESC_ZH,
  };
}
