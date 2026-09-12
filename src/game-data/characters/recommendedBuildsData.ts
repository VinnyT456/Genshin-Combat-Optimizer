import type { AuthoredBuild } from "./buildAuthoring";

// ---------------------------------------------------------------------------
// HAND-AUTHORED KQM base builds, one row per character (132 total).
//
// HOW TO FILL A ROW. Replace `null` with an object:
//
//   "kaedehara-kazuha": {
//     weapon: "freedomsworn",          // id from scratchpad/weapon-ids.tsv
//     set: "viridescent-venerer",      // id from scratchpad/artifact-ids.tsv
//     sands: "EM",                     // MainStatToken
//     goblet: "anemo%",
//     circlet: "crit_rate",
//     note: "optional reminder",
//   },
//
// Leave a character `null` to give it NO recommended build (keeps the generic
// weapon-type default on select). Level 90 / talents 9/9/9 are implied — do not
// author them. Only MAIN stats are authored; substats are not.
//
// MainStatToken values: "HP%" "ATK%" "DEF%" "EM" "ER%" "crit_rate" "crit_dmg"
//   "pyro%" "hydro%" "electro%" "cryo%" "anemo%" "geo%" "dendro%" "physical%" "heal%"
//   ("heal%" and other non-damage stats are recorded honestly, not simulated.)
//
// Ids: see scratchpad/weapon-ids.tsv and scratchpad/artifact-ids.tsv (id<TAB>name).
// The companion test asserts every FILLED weapon/set id resolves — an unknown id
// fails the build, so a typo cannot ship silently.
// ---------------------------------------------------------------------------

export const AUTHORED_BASE_BUILDS: Readonly<
  Record<string, AuthoredBuild | null>
> = {
  // ======================== PYRO ========================
  // Amber (bow)
  amber: null,
  // Arlecchino (polearm)
  arlecchino: null,
  bennett: {
    weapon: "mistsplitterreforged",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "HP%",
    circlet: "heal%",
    note: "KQM v4.5 · Healing-support default. Burst ATK buff scales off BASE ATK only.",
  },
  // Chevreuse (polearm)
  chevreuse: null,
  // Dehya (claymore)
  dehya: null,
  // Diluc (claymore)
  diluc: null,
  // Durin (sword)
  durin: null,
  // Gaming (claymore)
  gaming: null,
  // Hu Tao (polearm)
  "hu-tao": null,
  // Klee (catalyst)
  klee: null,
  // Lyney (bow)
  lyney: null,
  // Mavuika (claymore)
  mavuika: null,
  // Nicole (catalyst)
  nicole: null,
  // Thoma (polearm)
  thoma: null,
  // Traveler (sword)
  "traveler-f-pyro": null,
  // Traveler (sword)
  "traveler-m-pyro": null,
  xiangling: {
    weapon: "staffofthescarletsands",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "pyro%",
    circlet: "crit_rate",
    note: "KQM v4.5 · high ER requirement, team-dependent.",
  },
  // Xinyan (claymore)
  xinyan: null,
  // Yanfei (catalyst)
  yanfei: null,
  // Yoimiya (bow)
  yoimiya: null,

  // ======================== HYDRO ========================
  // Aino (claymore)
  aino: null,
  // Barbara (catalyst)
  barbara: null,
  // Candace (polearm)
  candace: null,
  // Columbina (catalyst)
  columbina: null,
  // Dahlia (sword)
  dahlia: null,
  // Furina (sword)
  furina: null,
  // Kamisato Ayato (sword)
  "kamisato-ayato": null,
  // Mona (catalyst)
  mona: null,
  // Mualani (catalyst)
  mualani: null,
  // Neuvillette (catalyst)
  neuvillette: null,
  // Nilou (sword)
  nilou: null,
  // Sangonomiya Kokomi (catalyst)
  "sangonomiya-kokomi": null,
  // Sigewinne (bow)
  sigewinne: null,
  // Tartaglia (bow)
  tartaglia: null,
  // Traveler (sword)
  "traveler-f-hydro": null,
  // Traveler (sword)
  "traveler-m-hydro": null,
  xingqiu: {
    weapon: "primordialjadecutter",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    note: "KQM v4.5 · Sacrificial Sword is the 4-star budget alt.",
  },
  // Yelan (bow)
  yelan: null,

  // ======================== ELECTRO ========================
  // Alyosha (polearm)
  alyosha: null,
  // Beidou (claymore)
  beidou: null,
  // Clorinde (sword)
  clorinde: null,
  // Cyno (polearm)
  cyno: null,
  // Dori (claymore)
  dori: null,
  // Fischl (bow)
  fischl: null,
  // Flins (polearm)
  flins: null,
  // Iansan (polearm)
  iansan: null,
  // Ineffa (polearm)
  ineffa: null,
  // Keqing (sword)
  keqing: null,
  // Kujou Sara (bow)
  "kujou-sara": null,
  // Kuki Shinobu (sword)
  "kuki-shinobu": null,
  // Lisa (catalyst)
  lisa: null,
  // Ororon (bow)
  ororon: null,
  "raiden-shogun": {
    weapon: "engulfinglightning",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    note: "KQM v4.5 · ER target ~250%+ team-dependent.",
  },
  // Razor (claymore)
  razor: null,
  // Sethos (bow)
  sethos: null,
  // Traveler (sword)
  "traveler-f-electro": null,
  // Traveler (sword)
  "traveler-m-electro": null,
  // Varesa (catalyst)
  varesa: null,
  // Yae Miko (catalyst)
  "yae-miko": null,

  // ======================== CRYO ========================
  // Aloy (bow)
  aloy: null,
  // Charlotte (catalyst)
  charlotte: null,
  // Chongyun (claymore)
  chongyun: null,
  // Citlali (catalyst)
  citlali: null,
  // Diona (bow)
  diona: null,
  // Escoffier (polearm)
  escoffier: null,
  // Eula (claymore)
  eula: null,
  // Freminet (claymore)
  freminet: null,
  // Ganyu (bow)
  ganyu: null,
  // Kaeya (sword)
  kaeya: null,
  // Kamisato Ayaka (sword)
  "kamisato-ayaka": null,
  // Layla (sword)
  layla: null,
  // Lohen (polearm)
  lohen: null,
  // Mika (polearm)
  mika: null,
  // Odette (sword)
  odette: null,
  // Qiqi (sword)
  qiqi: null,
  // Rosaria (polearm)
  rosaria: null,
  // Sandrone (claymore)
  sandrone: null,
  // Shenhe (polearm)
  shenhe: null,
  // Skirk (sword)
  skirk: null,
  // Traveler (sword)
  "traveler-f-cryo": null,
  // Traveler (sword)
  "traveler-m-cryo": null,
  // Wriothesley (catalyst)
  wriothesley: null,

  // ======================== ANEMO ========================
  // Chasca (bow)
  chasca: null,
  // Faruzan (bow)
  faruzan: null,
  // Ifa (catalyst)
  ifa: null,
  // Jahoda (bow)
  jahoda: null,
  // Jean (sword)
  jean: null,
  // Kaedehara Kazuha (sword)
  "kaedehara-kazuha": null,
  // Lan Yan (catalyst)
  "lan-yan": null,
  // Lynette (sword)
  lynette: null,
  // Prune (catalyst)
  prune: null,
  // Sayu (claymore)
  sayu: null,
  // Shikanoin Heizou (catalyst)
  "shikanoin-heizou": null,
  // Sucrose (catalyst)
  sucrose: null,
  // Traveler (sword)
  "traveler-f-anemo": null,
  // Traveler (sword)
  "traveler-m-anemo": null,
  // Varka (claymore)
  varka: null,
  // Venti (bow)
  venti: null,
  // Wanderer (catalyst)
  wanderer: null,
  // Xianyun (catalyst)
  xianyun: null,
  // Xiao (polearm)
  xiao: null,
  // Yumemizuki Mizuki (catalyst)
  "yumemizuki-mizuki": null,

  // ======================== GEO ========================
  // Albedo (sword)
  albedo: null,
  // Arataki Itto (claymore)
  "arataki-itto": null,
  // Chiori (sword)
  chiori: null,
  // Gorou (bow)
  gorou: null,
  // Illuga (polearm)
  illuga: null,
  // Kachina (polearm)
  kachina: null,
  // Linnea (bow)
  linnea: null,
  // Navia (claymore)
  navia: null,
  // Ningguang (catalyst)
  ningguang: null,
  // Noelle (claymore)
  noelle: null,
  // Traveler (sword)
  "traveler-f-geo": null,
  // Traveler (sword)
  "traveler-m-geo": null,
  // Xilonen (sword)
  xilonen: null,
  // Yun Jin (polearm)
  "yun-jin": null,
  // Zhongli (polearm)
  zhongli: null,
  // Zibai (sword)
  zibai: null,

  // ======================== DENDRO ========================
  // Alhaitham (sword)
  alhaitham: null,
  // Baizhu (catalyst)
  baizhu: null,
  // Collei (bow)
  collei: null,
  // Emilie (polearm)
  emilie: null,
  // Kaveh (claymore)
  kaveh: null,
  // Kinich (claymore)
  kinich: null,
  // Kirara (sword)
  kirara: null,
  // Lauma (catalyst)
  lauma: null,
  // Nahida (catalyst)
  nahida: null,
  // Nefer (catalyst)
  nefer: null,
  // Tighnari (bow)
  tighnari: null,
  // Traveler (sword)
  "traveler-f-dendro": null,
  // Traveler (sword)
  "traveler-m-dendro": null,
  // Yaoyao (polearm)
  yaoyao: null,
};
