// ============================================================================
// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Roster metadata: identity, form label and release date for every generated
// character. Every field is derived from the primary source -- the release
// date from its own `release` timestamp -- so a renamed character can never
// silently lose its ordering the way a hand-kept table allowed.
//
// The Traveler's forms all share one `identityId`, which is the key the party
// duplicate-guard compares. See `isSameCharacter` in `src/types`.
//
//   Verifier data version  7.0.54
//   Fetched at             2026-09-04T01:08:25Z
// ============================================================================

/** Sourced roster facts for one generated character form. */
export interface GeneratedCharacterMeta {
  /** Id of the combat definition this describes. */
  readonly characterId: string;
  /**
   * Identity key. Equal to `characterId` for an ordinary character; shared by
   * every Traveler form so two Travelers cannot enter one party.
   */
  readonly identityId: string;
  /** Display name of the IDENTITY (the Traveler is never renamed per element). */
  readonly name: string;
  /** Label for this form alone. */
  readonly formLabel: string;
  readonly element: string;
  /** `YYYY-MM-DD`, or undefined when the source publishes no timestamp. */
  readonly releaseDate?: string;
}

export const generatedCharacterMeta: readonly GeneratedCharacterMeta[] = [
  { characterId: "aino", identityId: "aino", name: "Aino", formLabel: "Aino", element: "hydro", releaseDate: "2025-09-08" },
  { characterId: "albedo", identityId: "albedo", name: "Albedo", formLabel: "Albedo", element: "geo", releaseDate: "2020-12-21" },
  { characterId: "alhaitham", identityId: "alhaitham", name: "Alhaitham", formLabel: "Alhaitham", element: "dendro", releaseDate: "2023-01-16" },
  { characterId: "aloy", identityId: "aloy", name: "Aloy", formLabel: "Aloy", element: "cryo", releaseDate: "2021-08-31" },
  { characterId: "alyosha", identityId: "alyosha", name: "Alyosha", formLabel: "Alyosha", element: "electro", releaseDate: "2026-08-10" },
  { characterId: "amber", identityId: "amber", name: "Amber", formLabel: "Amber", element: "pyro", releaseDate: "2020-09-27" },
  { characterId: "arataki-itto", identityId: "arataki-itto", name: "Arataki Itto", formLabel: "Arataki Itto", element: "geo", releaseDate: "2021-12-14" },
  { characterId: "arlecchino", identityId: "arlecchino", name: "Arlecchino", formLabel: "Arlecchino", element: "pyro", releaseDate: "2024-04-22" },
  { characterId: "baizhu", identityId: "baizhu", name: "Baizhu", formLabel: "Baizhu", element: "dendro", releaseDate: "2023-05-02" },
  { characterId: "barbara", identityId: "barbara", name: "Barbara", formLabel: "Barbara", element: "hydro", releaseDate: "2020-09-27" },
  { characterId: "beidou", identityId: "beidou", name: "Beidou", formLabel: "Beidou", element: "electro", releaseDate: "2020-09-27" },
  { characterId: "bennett", identityId: "bennett", name: "Bennett", formLabel: "Bennett", element: "pyro", releaseDate: "2020-09-27" },
  { characterId: "candace", identityId: "candace", name: "Candace", formLabel: "Candace", element: "hydro", releaseDate: "2022-09-26" },
  { characterId: "charlotte", identityId: "charlotte", name: "Charlotte", formLabel: "Charlotte", element: "cryo", releaseDate: "2023-11-06" },
  { characterId: "chasca", identityId: "chasca", name: "Chasca", formLabel: "Chasca", element: "anemo", releaseDate: "2024-11-18" },
  { characterId: "chevreuse", identityId: "chevreuse", name: "Chevreuse", formLabel: "Chevreuse", element: "pyro", releaseDate: "2024-01-09" },
  { characterId: "chiori", identityId: "chiori", name: "Chiori", formLabel: "Chiori", element: "geo", releaseDate: "2024-03-11" },
  { characterId: "chongyun", identityId: "chongyun", name: "Chongyun", formLabel: "Chongyun", element: "cryo", releaseDate: "2020-09-27" },
  { characterId: "citlali", identityId: "citlali", name: "Citlali", formLabel: "Citlali", element: "cryo", releaseDate: "2024-12-30" },
  { characterId: "clorinde", identityId: "clorinde", name: "Clorinde", formLabel: "Clorinde", element: "electro", releaseDate: "2024-06-03" },
  { characterId: "collei", identityId: "collei", name: "Collei", formLabel: "Collei", element: "dendro", releaseDate: "2022-08-23" },
  { characterId: "columbina", identityId: "columbina", name: "Columbina", formLabel: "Columbina", element: "hydro", releaseDate: "2026-01-12" },
  { characterId: "cyno", identityId: "cyno", name: "Cyno", formLabel: "Cyno", element: "electro", releaseDate: "2022-09-26" },
  { characterId: "dahlia", identityId: "dahlia", name: "Dahlia", formLabel: "Dahlia", element: "hydro", releaseDate: "2025-06-16" },
  { characterId: "dehya", identityId: "dehya", name: "Dehya", formLabel: "Dehya", element: "pyro", releaseDate: "2023-02-27" },
  { characterId: "diluc", identityId: "diluc", name: "Diluc", formLabel: "Diluc", element: "pyro", releaseDate: "2020-09-27" },
  { characterId: "diona", identityId: "diona", name: "Diona", formLabel: "Diona", element: "cryo", releaseDate: "2020-11-11" },
  { characterId: "dori", identityId: "dori", name: "Dori", formLabel: "Dori", element: "electro", releaseDate: "2022-09-09" },
  { characterId: "durin", identityId: "durin", name: "Durin", formLabel: "Durin", element: "pyro", releaseDate: "2025-12-01" },
  { characterId: "emilie", identityId: "emilie", name: "Emilie", formLabel: "Emilie", element: "dendro", releaseDate: "2024-08-06" },
  { characterId: "escoffier", identityId: "escoffier", name: "Escoffier", formLabel: "Escoffier", element: "cryo", releaseDate: "2025-05-05" },
  { characterId: "eula", identityId: "eula", name: "Eula", formLabel: "Eula", element: "cryo", releaseDate: "2021-05-18" },
  { characterId: "faruzan", identityId: "faruzan", name: "Faruzan", formLabel: "Faruzan", element: "anemo", releaseDate: "2022-12-05" },
  { characterId: "fischl", identityId: "fischl", name: "Fischl", formLabel: "Fischl", element: "electro", releaseDate: "2020-09-27" },
  { characterId: "flins", identityId: "flins", name: "Flins", formLabel: "Flins", element: "electro", releaseDate: "2025-09-30" },
  { characterId: "freminet", identityId: "freminet", name: "Freminet", formLabel: "Freminet", element: "cryo", releaseDate: "2023-09-05" },
  { characterId: "furina", identityId: "furina", name: "Furina", formLabel: "Furina", element: "hydro", releaseDate: "2023-11-06" },
  { characterId: "gaming", identityId: "gaming", name: "Gaming", formLabel: "Gaming", element: "pyro", releaseDate: "2024-01-29" },
  { characterId: "ganyu", identityId: "ganyu", name: "Ganyu", formLabel: "Ganyu", element: "cryo", releaseDate: "2021-01-12" },
  { characterId: "gorou", identityId: "gorou", name: "Gorou", formLabel: "Gorou", element: "geo", releaseDate: "2021-12-14" },
  { characterId: "hu-tao", identityId: "hu-tao", name: "Hu Tao", formLabel: "Hu Tao", element: "pyro", releaseDate: "2021-03-02" },
  { characterId: "iansan", identityId: "iansan", name: "Iansan", formLabel: "Iansan", element: "electro", releaseDate: "2025-03-24" },
  { characterId: "ifa", identityId: "ifa", name: "Ifa", formLabel: "Ifa", element: "anemo", releaseDate: "2025-05-05" },
  { characterId: "illuga", identityId: "illuga", name: "Illuga", formLabel: "Illuga", element: "geo", releaseDate: "2026-02-03" },
  { characterId: "ineffa", identityId: "ineffa", name: "Ineffa", formLabel: "Ineffa", element: "electro", releaseDate: "2025-07-28" },
  { characterId: "jahoda", identityId: "jahoda", name: "Jahoda", formLabel: "Jahoda", element: "anemo", releaseDate: "2025-12-01" },
  { characterId: "jean", identityId: "jean", name: "Jean", formLabel: "Jean", element: "anemo", releaseDate: "2020-09-27" },
  { characterId: "kachina", identityId: "kachina", name: "Kachina", formLabel: "Kachina", element: "geo", releaseDate: "2024-08-26" },
  { characterId: "kaedehara-kazuha", identityId: "kaedehara-kazuha", name: "Kaedehara Kazuha", formLabel: "Kaedehara Kazuha", element: "anemo", releaseDate: "2021-06-29" },
  { characterId: "kaeya", identityId: "kaeya", name: "Kaeya", formLabel: "Kaeya", element: "cryo", releaseDate: "2020-09-27" },
  { characterId: "kamisato-ayaka", identityId: "kamisato-ayaka", name: "Kamisato Ayaka", formLabel: "Kamisato Ayaka", element: "cryo", releaseDate: "2021-07-20" },
  { characterId: "kamisato-ayato", identityId: "kamisato-ayato", name: "Kamisato Ayato", formLabel: "Kamisato Ayato", element: "hydro", releaseDate: "2022-03-29" },
  { characterId: "kaveh", identityId: "kaveh", name: "Kaveh", formLabel: "Kaveh", element: "dendro", releaseDate: "2023-05-02" },
  { characterId: "keqing", identityId: "keqing", name: "Keqing", formLabel: "Keqing", element: "electro", releaseDate: "2020-09-27" },
  { characterId: "kinich", identityId: "kinich", name: "Kinich", formLabel: "Kinich", element: "dendro", releaseDate: "2024-09-17" },
  { characterId: "kirara", identityId: "kirara", name: "Kirara", formLabel: "Kirara", element: "dendro", releaseDate: "2023-05-22" },
  { characterId: "klee", identityId: "klee", name: "Klee", formLabel: "Klee", element: "pyro", releaseDate: "2020-09-27" },
  { characterId: "kujou-sara", identityId: "kujou-sara", name: "Kujou Sara", formLabel: "Kujou Sara", element: "electro", releaseDate: "2021-08-31" },
  { characterId: "kuki-shinobu", identityId: "kuki-shinobu", name: "Kuki Shinobu", formLabel: "Kuki Shinobu", element: "electro", releaseDate: "2022-06-21" },
  { characterId: "lan-yan", identityId: "lan-yan", name: "Lan Yan", formLabel: "Lan Yan", element: "anemo", releaseDate: "2025-01-21" },
  { characterId: "lauma", identityId: "lauma", name: "Lauma", formLabel: "Lauma", element: "dendro", releaseDate: "2025-09-08" },
  { characterId: "layla", identityId: "layla", name: "Layla", formLabel: "Layla", element: "cryo", releaseDate: "2022-11-18" },
  { characterId: "linnea", identityId: "linnea", name: "Linnea", formLabel: "Linnea", element: "geo", releaseDate: "2026-04-06" },
  { characterId: "lisa", identityId: "lisa", name: "Lisa", formLabel: "Lisa", element: "electro", releaseDate: "2020-09-27" },
  { characterId: "lohen", identityId: "lohen", name: "Lohen", formLabel: "Lohen", element: "cryo", releaseDate: "2026-06-09" },
  { characterId: "lynette", identityId: "lynette", name: "Lynette", formLabel: "Lynette", element: "anemo", releaseDate: "2023-08-14" },
  { characterId: "lyney", identityId: "lyney", name: "Lyney", formLabel: "Lyney", element: "pyro", releaseDate: "2023-08-14" },
  { characterId: "mavuika", identityId: "mavuika", name: "Mavuika", formLabel: "Mavuika", element: "pyro", releaseDate: "2024-12-30" },
  { characterId: "mika", identityId: "mika", name: "Mika", formLabel: "Mika", element: "cryo", releaseDate: "2023-03-21" },
  { characterId: "mona", identityId: "mona", name: "Mona", formLabel: "Mona", element: "hydro", releaseDate: "2020-09-27" },
  { characterId: "mualani", identityId: "mualani", name: "Mualani", formLabel: "Mualani", element: "hydro", releaseDate: "2024-08-26" },
  { characterId: "nahida", identityId: "nahida", name: "Nahida", formLabel: "Nahida", element: "dendro", releaseDate: "2022-10-31" },
  { characterId: "navia", identityId: "navia", name: "Navia", formLabel: "Navia", element: "geo", releaseDate: "2023-12-18" },
  { characterId: "nefer", identityId: "nefer", name: "Nefer", formLabel: "Nefer", element: "dendro", releaseDate: "2025-10-20" },
  { characterId: "neuvillette", identityId: "neuvillette", name: "Neuvillette", formLabel: "Neuvillette", element: "hydro", releaseDate: "2023-09-25" },
  { characterId: "nicole", identityId: "nicole", name: "Nicole", formLabel: "Nicole", element: "pyro", releaseDate: "2026-05-18" },
  { characterId: "nilou", identityId: "nilou", name: "Nilou", formLabel: "Nilou", element: "hydro", releaseDate: "2022-10-14" },
  { characterId: "ningguang", identityId: "ningguang", name: "Ningguang", formLabel: "Ningguang", element: "geo", releaseDate: "2020-09-27" },
  { characterId: "noelle", identityId: "noelle", name: "Noelle", formLabel: "Noelle", element: "geo", releaseDate: "2020-09-27" },
  { characterId: "odette", identityId: "odette", name: "Odette", formLabel: "Odette", element: "cryo", releaseDate: "2026-08-10" },
  { characterId: "ororon", identityId: "ororon", name: "Ororon", formLabel: "Ororon", element: "electro", releaseDate: "2024-11-18" },
  { characterId: "prune", identityId: "prune", name: "Prune", formLabel: "Prune", element: "anemo", releaseDate: "2026-05-18" },
  { characterId: "qiqi", identityId: "qiqi", name: "Qiqi", formLabel: "Qiqi", element: "cryo", releaseDate: "2020-09-27" },
  { characterId: "raiden-shogun", identityId: "raiden-shogun", name: "Raiden Shogun", formLabel: "Raiden Shogun", element: "electro", releaseDate: "2021-08-31" },
  { characterId: "razor", identityId: "razor", name: "Razor", formLabel: "Razor", element: "electro", releaseDate: "2020-09-27" },
  { characterId: "rosaria", identityId: "rosaria", name: "Rosaria", formLabel: "Rosaria", element: "cryo", releaseDate: "2021-04-06" },
  { characterId: "sandrone", identityId: "sandrone", name: "Sandrone", formLabel: "Sandrone", element: "cryo", releaseDate: "2026-06-29" },
  { characterId: "sangonomiya-kokomi", identityId: "sangonomiya-kokomi", name: "Sangonomiya Kokomi", formLabel: "Sangonomiya Kokomi", element: "hydro", releaseDate: "2021-09-21" },
  { characterId: "sayu", identityId: "sayu", name: "Sayu", formLabel: "Sayu", element: "anemo", releaseDate: "2021-08-10" },
  { characterId: "sethos", identityId: "sethos", name: "Sethos", formLabel: "Sethos", element: "electro", releaseDate: "2024-06-03" },
  { characterId: "shenhe", identityId: "shenhe", name: "Shenhe", formLabel: "Shenhe", element: "cryo", releaseDate: "2022-01-04" },
  { characterId: "shikanoin-heizou", identityId: "shikanoin-heizou", name: "Shikanoin Heizou", formLabel: "Shikanoin Heizou", element: "anemo", releaseDate: "2022-07-12" },
  { characterId: "sigewinne", identityId: "sigewinne", name: "Sigewinne", formLabel: "Sigewinne", element: "hydro", releaseDate: "2024-06-26" },
  { characterId: "skirk", identityId: "skirk", name: "Skirk", formLabel: "Skirk", element: "cryo", releaseDate: "2025-06-16" },
  { characterId: "sucrose", identityId: "sucrose", name: "Sucrose", formLabel: "Sucrose", element: "anemo", releaseDate: "2020-09-27" },
  { characterId: "tartaglia", identityId: "tartaglia", name: "Tartaglia", formLabel: "Tartaglia", element: "hydro", releaseDate: "2020-11-11" },
  { characterId: "thoma", identityId: "thoma", name: "Thoma", formLabel: "Thoma", element: "pyro", releaseDate: "2021-11-02" },
  { characterId: "tighnari", identityId: "tighnari", name: "Tighnari", formLabel: "Tighnari", element: "dendro", releaseDate: "2022-08-23" },
  { characterId: "traveler-f-anemo", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Anemo)", element: "anemo", releaseDate: "2020-09-27" },
  { characterId: "traveler-f-cryo", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Cryo)", element: "cryo", releaseDate: "2026-08-12" },
  { characterId: "traveler-f-dendro", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Dendro)", element: "dendro", releaseDate: "2022-07-12" },
  { characterId: "traveler-f-electro", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Electro)", element: "electro", releaseDate: "2021-07-20" },
  { characterId: "traveler-f-geo", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Geo)", element: "geo", releaseDate: "2020-09-27" },
  { characterId: "traveler-f-hydro", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Hydro)", element: "hydro", releaseDate: "2023-07-23" },
  { characterId: "traveler-f-pyro", identityId: "traveler", name: "Traveler", formLabel: "Lumine (Pyro)", element: "pyro", releaseDate: "2025-01-01" },
  { characterId: "traveler-m-anemo", identityId: "traveler", name: "Traveler", formLabel: "Aether (Anemo)", element: "anemo", releaseDate: "2020-09-27" },
  { characterId: "traveler-m-cryo", identityId: "traveler", name: "Traveler", formLabel: "Aether (Cryo)", element: "cryo", releaseDate: "2026-08-12" },
  { characterId: "traveler-m-dendro", identityId: "traveler", name: "Traveler", formLabel: "Aether (Dendro)", element: "dendro", releaseDate: "2022-07-12" },
  { characterId: "traveler-m-electro", identityId: "traveler", name: "Traveler", formLabel: "Aether (Electro)", element: "electro", releaseDate: "2021-07-20" },
  { characterId: "traveler-m-geo", identityId: "traveler", name: "Traveler", formLabel: "Aether (Geo)", element: "geo", releaseDate: "2020-09-27" },
  { characterId: "traveler-m-hydro", identityId: "traveler", name: "Traveler", formLabel: "Aether (Hydro)", element: "hydro", releaseDate: "2023-07-23" },
  { characterId: "traveler-m-pyro", identityId: "traveler", name: "Traveler", formLabel: "Aether (Pyro)", element: "pyro", releaseDate: "2025-01-01" },
  { characterId: "varesa", identityId: "varesa", name: "Varesa", formLabel: "Varesa", element: "electro", releaseDate: "2025-03-24" },
  { characterId: "varka", identityId: "varka", name: "Varka", formLabel: "Varka", element: "anemo", releaseDate: "2026-02-23" },
  { characterId: "venti", identityId: "venti", name: "Venti", formLabel: "Venti", element: "anemo", releaseDate: "2020-09-27" },
  { characterId: "wanderer", identityId: "wanderer", name: "Wanderer", formLabel: "Wanderer", element: "anemo", releaseDate: "2022-12-05" },
  { characterId: "wriothesley", identityId: "wriothesley", name: "Wriothesley", formLabel: "Wriothesley", element: "cryo", releaseDate: "2023-10-17" },
  { characterId: "xiangling", identityId: "xiangling", name: "Xiangling", formLabel: "Xiangling", element: "pyro", releaseDate: "2020-09-27" },
  { characterId: "xianyun", identityId: "xianyun", name: "Xianyun", formLabel: "Xianyun", element: "anemo", releaseDate: "2024-01-29" },
  { characterId: "xiao", identityId: "xiao", name: "Xiao", formLabel: "Xiao", element: "anemo", releaseDate: "2021-02-01" },
  { characterId: "xilonen", identityId: "xilonen", name: "Xilonen", formLabel: "Xilonen", element: "geo", releaseDate: "2024-10-07" },
  { characterId: "xingqiu", identityId: "xingqiu", name: "Xingqiu", formLabel: "Xingqiu", element: "hydro", releaseDate: "2020-09-27" },
  { characterId: "xinyan", identityId: "xinyan", name: "Xinyan", formLabel: "Xinyan", element: "pyro", releaseDate: "2020-12-02" },
  { characterId: "yae-miko", identityId: "yae-miko", name: "Yae Miko", formLabel: "Yae Miko", element: "electro", releaseDate: "2022-02-15" },
  { characterId: "yanfei", identityId: "yanfei", name: "Yanfei", formLabel: "Yanfei", element: "pyro", releaseDate: "2021-04-26" },
  { characterId: "yaoyao", identityId: "yaoyao", name: "Yaoyao", formLabel: "Yaoyao", element: "dendro", releaseDate: "2023-01-16" },
  { characterId: "yelan", identityId: "yelan", name: "Yelan", formLabel: "Yelan", element: "hydro", releaseDate: "2022-05-30" },
  { characterId: "yoimiya", identityId: "yoimiya", name: "Yoimiya", formLabel: "Yoimiya", element: "pyro", releaseDate: "2021-08-10" },
  { characterId: "yumemizuki-mizuki", identityId: "yumemizuki-mizuki", name: "Yumemizuki Mizuki", formLabel: "Yumemizuki Mizuki", element: "anemo", releaseDate: "2025-02-10" },
  { characterId: "yun-jin", identityId: "yun-jin", name: "Yun Jin", formLabel: "Yun Jin", element: "geo", releaseDate: "2022-01-04" },
  { characterId: "zhongli", identityId: "zhongli", name: "Zhongli", formLabel: "Zhongli", element: "geo", releaseDate: "2020-12-02" },
  { characterId: "zibai", identityId: "zibai", name: "Zibai", formLabel: "Zibai", element: "geo", releaseDate: "2026-02-03" },
];

export const generatedCharacterMetaById: ReadonlyMap<string, GeneratedCharacterMeta> =
  new Map(generatedCharacterMeta.map((meta) => [meta.characterId, meta]));
