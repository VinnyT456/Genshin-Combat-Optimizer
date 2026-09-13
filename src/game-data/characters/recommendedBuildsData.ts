import type { AuthoredBuild, SubstatToken } from "./buildAuthoring";

// Ordered priorities, not random roll outcomes. KQM priorities are
// rotation/team-dependent, so each row chooses the closest baseline and keeps
// the caveat in `note` where it matters. The recommended-build compiler uses
// these priorities to create a deterministic level-20 four-line comparison
// baseline (five upgrades; every line upgraded at least once) for each
// artifact piece; users can edit those values afterward.
const CRIT_ATK_EM = ["crit_rate", "crit_dmg", "ATK%", "EM", "ER%"] as const satisfies readonly SubstatToken[];
const CRIT_ATK_EM_NO_ER = ["crit_rate", "crit_dmg", "ATK%", "EM"] as const satisfies readonly SubstatToken[];
const CRIT_ATK = ["crit_rate", "crit_dmg", "ATK%", "ER%"] as const satisfies readonly SubstatToken[];
const CRIT_ATK_NO_ER = ["crit_rate", "crit_dmg", "ATK%"] as const satisfies readonly SubstatToken[];
const CRIT_EM_ATK = ["crit_rate", "crit_dmg", "EM", "ATK%", "ER%"] as const satisfies readonly SubstatToken[];
const CRIT_EM_HP = ["crit_rate", "crit_dmg", "EM", "HP%", "ATK%"] as const satisfies readonly SubstatToken[];
const CRIT_HP_EM = ["crit_rate", "crit_dmg", "HP%", "EM", "ER%"] as const satisfies readonly SubstatToken[];
const CRIT_HP_ER = ["crit_rate", "crit_dmg", "HP%", "ER%"] as const satisfies readonly SubstatToken[];
const ER_CRIT_ATK = ["ER%", "crit_rate", "crit_dmg", "ATK%"] as const satisfies readonly SubstatToken[];
const ER_CRIT_ATK_EM = ["ER%", "crit_rate", "crit_dmg", "ATK%", "EM"] as const satisfies readonly SubstatToken[];
const ER_CRIT_HP = ["ER%", "crit_rate", "crit_dmg", "HP%"] as const satisfies readonly SubstatToken[];
const ER_CRIT_EM = ["ER%", "crit_rate", "crit_dmg", "EM"] as const satisfies readonly SubstatToken[];
const ER_EM_CRIT = ["ER%", "EM", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const ER_ATK_CRIT = ["ER%", "ATK%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const ER_HP_CRIT = ["ER%", "HP%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const ER_CRIT_DEF = ["ER%", "crit_rate", "crit_dmg", "DEF%"] as const satisfies readonly SubstatToken[];
const ER_DEF_CRIT = ["ER%", "DEF%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const ER_HP = ["ER%", "HP%"] as const satisfies readonly SubstatToken[];
const HP_ER = ["HP%", "ER%"] as const satisfies readonly SubstatToken[];
const HP_ER_CRIT = ["HP%", "ER%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const HP_CRIT_ER = ["HP%", "crit_rate", "crit_dmg", "ER%"] as const satisfies readonly SubstatToken[];
const EM_ER = ["EM", "ER%"] as const satisfies readonly SubstatToken[];
const EM_ER_CRIT = ["EM", "ER%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];
const EM_CRIT_ER = ["EM", "crit_rate", "crit_dmg", "ER%"] as const satisfies readonly SubstatToken[];
const CRIT_DEF_ER = ["crit_rate", "crit_dmg", "DEF%", "ER%"] as const satisfies readonly SubstatToken[];
const DEF_ER_CRIT = ["DEF%", "ER%", "crit_rate", "crit_dmg"] as const satisfies readonly SubstatToken[];

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
//     substatPriorities: ["EM", "ER%", "crit_rate", "crit_dmg"],
//     note: "optional reminder",
//   },
//
// Leave a character `null` to give it NO recommended build (keeps the generic
// weapon-type default on select). Level 90 / talents 9/9/9 are implied — do not
// author them. `substatPriorities` is ordered highest-to-lower priority; it is
// guidance for the deterministic level-20 comparison baseline and does not
// claim to be a sourced inventory of a player's exact artifact rolls.
//
// MainStatToken values: "HP%" "ATK%" "DEF%" "EM" "ER%" "crit_rate" "crit_dmg"
//   "pyro%" "hydro%" "electro%" "cryo%" "anemo%" "geo%" "dendro%" "physical%" "heal%"
//   ("heal%" and other non-damage stats are recorded honestly, not simulated.)
// SubstatToken values: "HP" "ATK" "DEF" "HP%" "ATK%" "DEF%" "EM" "ER%"
//   "crit_rate" "crit_dmg"
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
  amber: {
    weapon: "astralvulturescrimsonplumage",
    set: "shimenawas-reminiscence",
    sands: "EM",
    goblet: "pyro%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · Melt charged-shot baseline; weakspot hits reduce the value of CRIT Rate.",
  },
  // Arlecchino (polearm)
  arlecchino: {
    weapon: "crimsonmoonssemblance",
    set: "fragment-of-harmonic-whimsy",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM_NO_ER,
    note: "KQM Quick Guide · Fragment of Harmonic Whimsy / ATK% baseline; ER is not a damage priority.",
  },
  bennett: {
    weapon: "mistsplitterreforged",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "HP%",
    circlet: "heal%",
    substatPriorities: ER_HP,
    note: "KQM v4.5 · Healing-support default. Burst ATK buff scales off BASE ATK only.",
  },
  // Chevreuse (polearm)
  chevreuse: {
    weapon: "favoniuslance",
    set: "noblesse-oblige",
    sands: "HP%",
    goblet: "HP%",
    circlet: "heal%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · support baseline; ER Sands may be needed for Burst-every-rotation teams.",
  },
  // Dehya (claymore)
  dehya: {
    weapon: "favoniusgreatsword",
    set: "tenacity-of-the-millelith",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · off-field support baseline; Burgeon uses a separate EM-focused build.",
  },
  // Diluc (claymore)
  diluc: {
    weapon: "beaconofthereedsea",
    set: "crimson-witch-of-flames",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · ATK% baseline; EM Sands is team-dependent for Vaporize or Melt.",
  },
  // Durin (sword)
  durin: {
    weapon: "athameartis",
    set: "celestial-gift",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · support/DPS baseline; use ER Sands when the rotation needs more Burst consistency.",
  },
  // Gaming (claymore)
  gaming: {
    weapon: "serpentspine",
    set: "crimson-witch-of-flames",
    sands: "ER%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK_EM,
    note: "KQM Quick Guide · ER-first baseline; Serpent Spine assumes maintained stacks and shield protection.",
  },
  // Hu Tao (polearm)
  "hu-tao": {
    weapon: "staffofhoma",
    set: "crimson-witch-of-flames",
    sands: "EM",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_EM_HP,
    note: "KQM Quick Guide · EM Sands baseline; 4pc Shimenawa is a strong alternative with different Burst usage.",
  },
  // Klee (catalyst)
  klee: {
    weapon: "lostprayertothesacredwinds",
    set: "crimson-witch-of-flames",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · standard on-field baseline; ATK% Goblet is viable with high external DMG Bonus.",
  },
  // Lyney (bow)
  lyney: {
    weapon: "thefirstgreatmagic",
    set: "marechaussee-hunter",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · Marechaussee Hunter assumes reliable HP fluctuation.",
  },
  // Mavuika (claymore)
  mavuika: {
    weapon: "athousandblazingsuns",
    set: "obsidian-codex",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · on-field baseline; EM Sands is competitive in Vaporize or Melt teams.",
  },
  // Nicole (catalyst)
  nicole: {
    weapon: "angelosheptades",
    set: "celestial-gift",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · stack ATK toward the Skill-buff threshold; ER depends on Burst frequency.",
  },
  // Thoma (polearm)
  thoma: {
    weapon: "kitaincrossspear",
    set: "flower-of-paradise-lost",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER,
    note: "KQM Quick Guide · Burgeon baseline; ER must be met before additional EM.",
  },
  // Traveler (sword)
  "traveler-f-pyro": {
    weapon: "freedomsworn",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ER%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK_EM,
    note: "KQM Quick Guide · general off-field baseline; Burgeon and Overloaded variants prefer EM.",
  },
  // Traveler (sword)
  "traveler-m-pyro": {
    weapon: "freedomsworn",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ER%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK_EM,
    note: "KQM Quick Guide · general off-field baseline; Burgeon and Overloaded variants prefer EM.",
  },
  xiangling: {
    weapon: "staffofthescarletsands",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK_EM,
    note: "KQM v4.5 · high ER requirement, team-dependent.",
  },
  // Xinyan (claymore)
  xinyan: {
    weapon: "redhornstonethresher",
    set: "pale-flame",
    sands: "ATK%",
    goblet: "physical%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Guide · Physical DPS baseline; 2pc Pale Flame plus 2pc Bloodstained is the unconditional alternative.",
  },
  // Yanfei (catalyst)
  yanfei: {
    weapon: "lostprayertothesacredwinds",
    set: "wanderers-troupe",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · general Pyro DPS baseline; EM Sands is reaction-dependent.",
  },
  // Yoimiya (bow)
  yoimiya: {
    weapon: "thunderingpulse",
    set: "shimenawas-reminiscence",
    sands: "ATK%",
    goblet: "pyro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Shimenawa baseline; its Energy drain generally changes Burst usage.",
  },

  // ======================== HYDRO ========================
  // Aino (claymore)
  aino: {
    weapon: "favoniusgreatsword",
    set: "silken-moons-serenade",
    sands: "ER%",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · ER-first support baseline; EM becomes relevant for Bloom or Lunar-Charged ownership.",
  },
  // Barbara (catalyst)
  barbara: {
    weapon: "prototypeamber",
    set: "ocean-hued-clam",
    sands: "HP%",
    goblet: "HP%",
    circlet: "heal%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · healing baseline; DPS/driver variants use Hydro DMG and CRIT instead.",
  },
  // Candace (polearm)
  candace: {
    weapon: "favoniuslance",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "HP%",
    circlet: "crit_rate",
    substatPriorities: HP_CRIT_ER,
    note: "KQM Quick Guide · support baseline; on-field and Bloom variants differ substantially.",
  },
  // Columbina (catalyst)
  columbina: {
    weapon: "prototypeamber",
    set: "silken-moons-serenade",
    sands: "HP%",
    goblet: "HP%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_HP,
    note: "KQM Quick Guide · off-field support baseline; use ER Sands when Burst is required every rotation.",
  },
  // Dahlia (sword)
  dahlia: {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: ER_HP_CRIT,
    note: "KQM Quick Guide · shield/support baseline; CRIT Rate Circlet is the Favonius alternative.",
  },
  // Furina (sword)
  furina: {
    weapon: "splendoroftranquilwaters",
    set: "golden-troupe",
    sands: "ER%",
    goblet: "HP%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_HP,
    note: "KQM Quick Guide · ER is team-dependent; HP% Goblet is the default personal-damage baseline.",
  },
  // Kamisato Ayato (sword)
  "kamisato-ayato": {
    weapon: "harangeppakufutsu",
    set: "heart-of-depth",
    sands: "ATK%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · on-field baseline; ER Sands is appropriate for Burst-oriented rotations.",
  },
  // Mona (catalyst)
  mona: {
    weapon: "favoniuscodex",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · Burst-support baseline; ER varies significantly by team and weapon.",
  },
  // Mualani (catalyst)
  mualani: {
    weapon: "surfsup",
    set: "obsidian-codex",
    sands: "HP%",
    goblet: "hydro%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_HP_EM,
    note: "KQM Quick Guide · forward-Vaporize baseline; HP% Goblet is competitive with Hydro%.",
  },
  // Neuvillette (catalyst)
  neuvillette: {
    weapon: "tomeoftheeternalflow",
    set: "marechaussee-hunter",
    sands: "HP%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_HP_ER,
    note: "KQM Quick Guide · HP% / Hydro / CRIT baseline; HP% Goblet remains team-dependent.",
  },
  // Nilou (sword)
  nilou: {
    weapon: "keyofkhajnisut",
    set: "vourukashas-glow",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · full-HP Bloom baseline; the guide generally mixes two HP% 2-piece sets.",
  },
  // Sangonomiya Kokomi (catalyst)
  "sangonomiya-kokomi": {
    weapon: "prototypeamber",
    set: "ocean-hued-clam",
    sands: "HP%",
    goblet: "hydro%",
    circlet: "heal%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · on-field healer/enabler baseline; HP% Goblet is a support alternative.",
  },
  // Sigewinne (bow)
  sigewinne: {
    weapon: "prototypeamber",
    set: "ocean-hued-clam",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · HP support baseline; Healing Bonus is optional once healing is sufficient.",
  },
  // Tartaglia (bow)
  tartaglia: {
    weapon: "polarstar",
    set: "nymphs-dream",
    sands: "ATK%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · on-field DPS baseline; ER and set choice depend on Burst frequency.",
  },
  // Traveler (sword)
  "traveler-f-hydro": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · support/battery baseline; ER and Favonius CRIT requirements are rotation-dependent.",
  },
  // Traveler (sword)
  "traveler-m-hydro": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · same support/battery baseline as the female Traveler variant.",
  },
  xingqiu: {
    weapon: "primordialjadecutter",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM v4.5 · Sacrificial Sword is the 4-star budget alt.",
  },
  // Yelan (bow)
  yelan: {
    weapon: "aquasimulacra",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "hydro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · Emblem baseline; ER takes priority until the team rotation is sustainable.",
  },

  // ======================== ELECTRO ========================
  // Alyosha (polearm)
  alyosha: {
    weapon: "favoniuslance",
    set: "heart-of-the-furnace",
    sands: "ER%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · Stellar-Conduct support baseline; Noblesse is preferred outside those teams.",
  },
  // Beidou (claymore)
  beidou: {
    weapon: "serpentspine",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · ER-first off-field baseline; requirements depend heavily on team particles.",
  },
  // Clorinde (sword)
  clorinde: {
    weapon: "absolution",
    set: "fragment-of-harmonic-whimsy",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · ATK baseline; EM Sands is team- and constellation-dependent.",
  },
  // Cyno (polearm)
  cyno: {
    weapon: "staffofthescarletsands",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · EM Sands baseline; meet ER requirements before offensive stats.",
  },
  // Dori (claymore)
  dori: {
    weapon: "favoniusgreatsword",
    set: "gilded-dreams",
    sands: "ER%",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · flexible reaction/support baseline; pure healing uses HP% and Healing Bonus.",
  },
  // Fischl (bow)
  fischl: {
    weapon: "polarstar",
    set: "golden-troupe",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · off-field Oz baseline; Aggravate teams can trade toward EM.",
  },
  // Flins (polearm)
  flins: {
    weapon: "staffofthescarletsands",
    set: "night-of-the-skys-unveiling",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Lunar-Charged baseline; assumes a Level 2 Moonsign team for full set value.",
  },
  // Iansan (polearm)
  iansan: {
    weapon: "symphonistofscents",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · support baseline; ER is the practical first priority in Burst rotations.",
  },
  // Ineffa (polearm)
  ineffa: {
    weapon: "fracturedhalo",
    set: "aubade-of-morningstar-and-moon",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · general Lunar-Charged baseline; full EM is preferred for Hyperbloom-focused teams.",
  },
  // Keqing (sword)
  keqing: {
    weapon: "mistsplitterreforged",
    set: "thundering-fury",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Aggravate baseline; EM is competitive in reaction-heavy teams.",
  },
  // Kujou Sara (bow)
  "kujou-sara": {
    weapon: "elegyfortheend",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · Burst-support baseline; C6's Electro CRIT DMG buff is constellation-gated.",
  },
  // Kuki Shinobu (sword)
  "kuki-shinobu": {
    weapon: "freedomsworn",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER,
    note: "KQM Quick Guide · Hyperbloom baseline; HP% and Healing Bonus are defensive alternatives.",
  },
  // Lisa (catalyst)
  lisa: {
    weapon: "kagurasverity",
    set: "thundering-fury",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · on-field Aggravate baseline; EM Sands is preferable in Quickburn/Quickbloom.",
  },
  // Ororon (bow)
  ororon: {
    weapon: "elegyfortheend",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_EM,
    note: "KQM Quick Guide · ER-first off-field baseline; EM gains value in Lunar-Charged or Overloaded teams.",
  },
  "raiden-shogun": {
    weapon: "engulfinglightning",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM v4.5 · ER target ~250%+ team-dependent.",
  },
  // Razor (claymore)
  razor: {
    weapon: "wolfsgravestone",
    set: "pale-flame",
    sands: "ATK%",
    goblet: "physical%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · Physical baseline; Aggravate and Quickbloom variants require different gearing.",
  },
  // Sethos (bow)
  sethos: {
    weapon: "hunterspath",
    set: "wanderers-troupe",
    sands: "EM",
    goblet: "EM",
    circlet: "crit_dmg",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · charged-shot/Quicken baseline; Hunter's Path is only marginally ahead of Slingshot.",
  },
  // Traveler (sword)
  "traveler-f-electro": {
    weapon: "favoniussword",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Guide · battery baseline; ER varies with Electro Resonance, Amulet pickup, and rotation.",
  },
  // Traveler (sword)
  "traveler-m-electro": {
    weapon: "favoniussword",
    set: "emblem-of-severed-fate",
    sands: "ER%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Guide · same battery baseline as the female Traveler variant.",
  },
  // Varesa (catalyst)
  varesa: {
    weapon: "vividnotions",
    set: "long-nights-oath",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · plunge DPS baseline; ATK% Goblet is competitive with high external DMG Bonus.",
  },
  // Yae Miko (catalyst)
  "yae-miko": {
    weapon: "kagurasverity",
    set: "disenchantment-in-deep-shadow",
    sands: "ATK%",
    goblet: "electro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · ATK / Electro / CRIT baseline; EM becomes more valuable in reaction teams.",
  },

  // ======================== CRYO ========================
  // Aloy (bow)
  aloy: {
    weapon: "sacrificialbow",
    set: "emblem-of-severed-fate",
    sands: "EM",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · Reverse-Melt baseline; EM, ER%, or ATK% Sands remain team-dependent.",
  },
  // Charlotte (catalyst)
  charlotte: {
    weapon: "prototypeamber",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "ATK%",
    circlet: "heal%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · high-ER support baseline; Healing Bonus is not simulated as damage.",
  },
  // Chongyun (claymore)
  chongyun: {
    weapon: "wolfsgravestone",
    set: "noblesse-oblige",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · general baseline; EM Sands is preferable for reliable Melt Burst teams.",
  },
  // Citlali (catalyst)
  citlali: {
    weapon: "starcallerswatch",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER,
    note: "KQM Quick Guide · EM support baseline; meet ER requirements before additional EM.",
  },
  // Diona (bow)
  diona: {
    weapon: "favoniuswarbow",
    set: "noblesse-oblige",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · shield/healing-support baseline; CRIT Rate Circlet can improve Favonius consistency.",
  },
  // Escoffier (polearm)
  escoffier: {
    weapon: "symphonistofscents",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ER%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · Burst/healing support baseline; Scroll uptime is team-dependent.",
  },
  // Eula (claymore)
  eula: {
    weapon: "songofbrokenpines",
    set: "pale-flame",
    sands: "ATK%",
    goblet: "physical%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · Physical baseline; ER Sands is conditional on team energy and Burst frequency.",
  },
  // Freminet (claymore)
  freminet: {
    weapon: "songofbrokenpines",
    set: "pale-flame",
    sands: "ATK%",
    goblet: "physical%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Physical baseline; Cryo plunge/Melt teams use different conditions.",
  },
  // Ganyu (bow)
  ganyu: {
    weapon: "amosbow",
    set: "blizzard-strayer",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Freeze baseline; Melt uses EM Sands and a different artifact direction.",
  },
  // Kaeya (sword)
  kaeya: {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · support/off-field baseline; personal DPS can use Emblem or Blizzard Strayer.",
  },
  // Kamisato Ayaka (sword)
  "kamisato-ayaka": {
    weapon: "mistsplitterreforged",
    set: "blizzard-strayer",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · Freeze baseline; Marechaussee Hunter is a strong Furina-team alternative.",
  },
  // Layla (sword)
  layla: {
    weapon: "keyofkhajnisut",
    set: "tenacity-of-the-millelith",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · shield-support baseline; Favonius Sword is the utility alternative.",
  },
  // Lohen (polearm)
  lohen: {
    weapon: "disasterandremorse",
    set: "a-day-carved-from-rising-winds",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · general baseline; EM Sands is competitive in Melt and Freeze uses different sets.",
  },
  // Mika (polearm)
  mika: {
    weapon: "favoniuslance",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "HP%",
    circlet: "heal%",
    substatPriorities: ER_HP_CRIT,
    note: "KQM Quick Guide · support baseline; Healing Bonus is not simulated as damage and Favonius needs CRIT Rate.",
  },
  // Odette (sword)
  odette: {
    weapon: "mistsplitterreforged",
    set: "disenchantment-in-deep-shadow",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · Stellar damage baseline; the signature weapon is not required for this local stat-stick choice.",
  },
  // Qiqi (sword)
  qiqi: {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · CRIT Rate supports Favonius consistency; healing is not simulated as damage.",
  },
  // Rosaria (polearm)
  rosaria: {
    weapon: "favoniuslance",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · support baseline; ATK% Sands is valid after ER requirements are met.",
  },
  // Sandrone (claymore)
  sandrone: {
    weapon: "wolfsgravestone",
    set: "disenchantment-in-deep-shadow",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · listed 5-star alternative; Stellar-Conduct damage and passive conditions are team-dependent.",
  },
  // Shenhe (polearm)
  shenhe: {
    weapon: "favoniuslance",
    set: "noblesse-oblige",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · ATK support baseline; ER Sands may be needed in low-particle teams.",
  },
  // Skirk (sword)
  skirk: {
    weapon: "azurelight",
    set: "finale-of-the-deep-galleries",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · no ER baseline; set choice depends on on-field versus quickswap/Burst play.",
  },
  // Traveler (sword)
  "traveler-f-cryo": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Stellar guide/TCL-derived support proxy; no single text loadout table exists, so ER and team use remain conditional.",
  },
  // Traveler (sword)
  "traveler-m-cryo": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Stellar guide/TCL-derived support proxy; same baseline as the female Traveler variant.",
  },
  // Wriothesley (catalyst)
  wriothesley: {
    weapon: "cashflowsupervision",
    set: "marechaussee-hunter",
    sands: "ATK%",
    goblet: "cryo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Marechaussee Hunter baseline; CRIT DMG Circlet is preferred with abundant CRIT Rate.",
  },

  // ======================== ANEMO ========================
  // Chasca (bow)
  chasca: {
    weapon: "astralvulturescrimsonplumage",
    set: "obsidian-codex",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_dmg",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · signature/BiS baseline; ATK% is preferred over EM for the general build.",
  },
  // Faruzan (bow)
  faruzan: {
    weapon: "favoniuswarbow",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · pre-C6 ER-heavy support baseline; C6 can shift toward offensive stats or Tenacity.",
  },
  // Ifa (catalyst)
  ifa: {
    weapon: "favoniuscodex",
    set: "viridescent-venerer",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · healer/on-field Swirl baseline; ER Sands may be needed for high Burst requirements.",
  },
  // Jahoda (bow)
  jahoda: {
    weapon: "favoniuswarbow",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · general support/healer baseline; VV uptime is team-dependent.",
  },
  // Jean (sword)
  jean: {
    weapon: "favoniussword",
    set: "viridescent-venerer",
    sands: "ATK%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · general support baseline; Sunfire instead prefers EM main stats.",
  },
  // Kaedehara Kazuha (sword)
  "kaedehara-kazuha": {
    weapon: "freedomsworn",
    set: "viridescent-venerer",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · full EM baseline; use ER Sands when energy support is unavailable.",
  },
  // Lan Yan (catalyst)
  "lan-yan": {
    weapon: "starcallerswatch",
    set: "viridescent-venerer",
    sands: "ATK%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · off-field shield-support baseline; ER may replace Sands and TTDS is a team-support alternative.",
  },
  // Lynette (sword)
  lynette: {
    weapon: "favoniussword",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · ER is rotation-dependent; C4 enables reliable double-Skill rotations.",
  },
  // Prune (catalyst)
  prune: {
    weapon: "favoniuscodex",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_ATK_CRIT,
    note: "KQM Quick Guide · general off-field support baseline; build ER first, then ATK.",
  },
  // Sayu (claymore)
  sayu: {
    weapon: "favoniusgreatsword",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "EM",
    circlet: "heal%",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · support/healing baseline; on-field drivers can use ATK%/Anemo%/CRIT or full EM.",
  },
  // Shikanoin Heizou (catalyst)
  "shikanoin-heizou": {
    weapon: "sacrificialfragments",
    set: "viridescent-venerer",
    sands: "ATK%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · ADC/quickswap baseline; reaction-driver play prefers full EM.",
  },
  // Sucrose (catalyst)
  sucrose: {
    weapon: "sacrificialfragments",
    set: "viridescent-venerer",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER,
    note: "KQM Quick Guide · standard reaction-support baseline; Thrilling Tales is a team-dependent alternative.",
  },
  // Traveler (sword)
  "traveler-f-anemo": {
    weapon: "favoniussword",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · ER and Favonius CRIT requirements are rotation-dependent.",
  },
  // Traveler (sword)
  "traveler-m-anemo": {
    weapon: "favoniussword",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · same baseline as the female Traveler variant.",
  },
  // Varka (claymore)
  varka: {
    weapon: "gestofthemightywolf",
    set: "a-day-carved-from-rising-winds",
    sands: "ATK%",
    goblet: "ATK%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · neutral schema baseline; PHEC/ATK/Anemo Goblet choice is team-, gear-, and constellation-dependent.",
  },
  // Venti (bow)
  venti: {
    weapon: "thestringless",
    set: "viridescent-venerer",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER_CRIT,
    note: "KQM Quick Guide · deterministic EM baseline; CRIT build has a higher invested ceiling.",
  },
  // Wanderer (catalyst)
  wanderer: {
    weapon: "tulaytullahsremembrance",
    set: "desert-pavilion-chronicle",
    sands: "ATK%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · ER is generally unnecessary before C2; ATK% Goblet can win with heavy DMG Bonus buffs.",
  },
  // Xianyun (catalyst)
  xianyun: {
    weapon: "favoniuscodex",
    set: "viridescent-venerer",
    sands: "ER%",
    goblet: "ATK%",
    circlet: "ATK%",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · support baseline; meet ER first, then build ATK toward the Plunging Attack buff cap.",
  },
  // Xiao (polearm)
  xiao: {
    weapon: "staffofhoma",
    set: "vermillion-hereafter",
    sands: "ATK%",
    goblet: "anemo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_NO_ER,
    note: "KQM Quick Guide · ATK/Anemo/CRIT baseline; Burst uptime still determines ER needs.",
  },
  // Yumemizuki Mizuki (catalyst)
  "yumemizuki-mizuki": {
    weapon: "thestringless",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "EM",
    circlet: "crit_rate",
    substatPriorities: EM_CRIT_ER,
    note: "KQM Quick Guide · Stellar-Swirl/personal-damage baseline; outside that team, full EM and Viridescent are preferred.",
  },

  // ======================== GEO ========================
  // Albedo (sword)
  albedo: {
    weapon: "urakumisugiri",
    set: "husk-of-opulent-dreams",
    sands: "DEF%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · DEF/Geo/CRIT baseline; Husk is strongest with pre-stacked uptime.",
  },
  // Arataki Itto (claymore)
  "arataki-itto": {
    weapon: "redhornstonethresher",
    set: "husk-of-opulent-dreams",
    sands: "DEF%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · DEF/Geo/CRIT baseline; Husk is strongest with pre-stacked uptime.",
  },
  // Chiori (sword)
  chiori: {
    weapon: "urakumisugiri",
    set: "husk-of-opulent-dreams",
    sands: "DEF%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · Burst is usually not every rotation; DEF% Goblet is a valid alternative.",
  },
  // Gorou (bow)
  gorou: {
    weapon: "favoniuswarbow",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "ER%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_DEF,
    note: "KQM Quick Guide · ER and Favonius consistency dominate; Geo Goblet is a deterministic personal-damage placeholder.",
  },
  // Illuga (polearm)
  illuga: {
    weapon: "dragonsbane",
    set: "silken-moons-serenade",
    sands: "ER%",
    goblet: "EM",
    circlet: "crit_rate",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · general Zibai-support baseline; full value requires Lunar-Crystallize context.",
  },
  // Kachina (polearm)
  kachina: {
    weapon: "favoniuslance",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "DEF%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: DEF_ER_CRIT,
    note: "KQM Quick Guide · support Scroll baseline; ER depends on rotation.",
  },
  // Linnea (bow)
  linnea: {
    weapon: "goldenfrostboundoath",
    set: "husk-of-opulent-dreams",
    sands: "DEF%",
    goblet: "DEF%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · general baseline; Silken Moon's Serenade is preferred when prioritizing team Lunar-Reaction buffs.",
  },
  // Navia (claymore)
  navia: {
    weapon: "verdict",
    set: "nighttime-whispers-in-the-echoing-woods",
    sands: "ATK%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · ATK/Geo/CRIT baseline; ER Sands may be needed for Burst consistency.",
  },
  // Ningguang (catalyst)
  ningguang: {
    weapon: "cashflowsupervision",
    set: "emblem-of-severed-fate",
    sands: "ATK%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK,
    note: "KQM Quick Guide · quickswap/Burst baseline; 2pc Geo plus 2pc ATK is broadly competitive.",
  },
  // Noelle (claymore)
  noelle: {
    weapon: "redhornstonethresher",
    set: "husk-of-opulent-dreams",
    sands: "DEF%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · DEF/Geo/CRIT C6/high-Burst baseline; ATK% Sands is preferred before C6.",
  },
  // Traveler (sword)
  "traveler-f-geo": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Guide · support/battery baseline; quickswap DPS uses different weapons and mixed 2pc sets.",
  },
  // Traveler (sword)
  "traveler-m-geo": {
    weapon: "favoniussword",
    set: "noblesse-oblige",
    sands: "ER%",
    goblet: "geo%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Guide · same support/battery baseline as the female Traveler variant.",
  },
  // Xilonen (sword)
  xilonen: {
    weapon: "peakpatrolsong",
    set: "scroll-of-the-hero-of-cinder-city",
    sands: "DEF%",
    goblet: "DEF%",
    circlet: "DEF%",
    substatPriorities: DEF_ER_CRIT,
    note: "KQM Quick Guide · support baseline; ER Sands or CRIT Rate may be needed for Favonius rotations.",
  },
  // Yun Jin (polearm)
  "yun-jin": {
    weapon: "favoniuslance",
    set: "husk-of-opulent-dreams",
    sands: "ER%",
    goblet: "DEF%",
    circlet: "DEF%",
    substatPriorities: ER_DEF_CRIT,
    note: "KQM Quick Guide · ER/DEF support baseline; CRIT Rate may be needed for Favonius consistency.",
  },
  // Zhongli (polearm)
  zhongli: {
    weapon: "favoniuslance",
    set: "tenacity-of-the-millelith",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · shield-support baseline; CRIT Rate is an optional Favonius breakpoint.",
  },
  // Zibai (sword)
  zibai: {
    weapon: "lightbearingmoonshard",
    set: "night-of-the-skys-unveiling",
    sands: "DEF%",
    goblet: "DEF%",
    circlet: "crit_rate",
    substatPriorities: CRIT_DEF_ER,
    note: "KQM Quick Guide · Ascendant Gleam baseline; CRIT DMG Circlet is team-ratio dependent.",
  },

  // ======================== DENDRO ========================
  // Alhaitham (sword)
  alhaitham: {
    weapon: "lightoffoliarincision",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · EM / Dendro / CRIT baseline for Quicken teams.",
  },
  // Baizhu (catalyst)
  baizhu: {
    weapon: "jadefallssplendor",
    set: "deepwood-memories",
    sands: "HP%",
    goblet: "HP%",
    circlet: "HP%",
    substatPriorities: HP_ER,
    note: "KQM Quick Guide · HP support baseline; ER remains team-dependent.",
  },
  // Collei (bow)
  collei: {
    weapon: "elegyfortheend",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER_CRIT,
    note: "KQM Guide · Bloom/Burning personal-damage baseline; Deepwood or Noblesse is more general support.",
  },
  // Emilie (polearm)
  emilie: {
    weapon: "lumidouceelegy",
    set: "unfinished-reverie",
    sands: "ATK%",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Burning baseline; Burst may be used every other rotation.",
  },
  // Kaveh (claymore)
  kaveh: {
    weapon: "sacrificialgreatsword",
    set: "deepwood-memories",
    sands: "ER%",
    goblet: "EM",
    circlet: "heal%",
    substatPriorities: EM_ER,
    note: "KQM Quick Guide · Bloom baseline; high ER requirements and Healing Bonus is not simulated as damage.",
  },
  // Kinich (claymore)
  kinich: {
    weapon: "serpentspine",
    set: "obsidian-codex",
    sands: "ATK%",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_ATK_EM,
    note: "KQM Quick Guide · Burning/Burgeon baseline; Serpent Spine is a listed alternative to his signature weapon.",
  },
  // Kirara (sword)
  kirara: {
    weapon: "favoniussword",
    set: "tenacity-of-the-millelith",
    sands: "HP%",
    goblet: "HP%",
    circlet: "crit_rate",
    substatPriorities: HP_ER_CRIT,
    note: "KQM Quick Guide · shield-support baseline; CRIT Rate is for Favonius consistency.",
  },
  // Lauma (catalyst)
  lauma: {
    weapon: "nightweaverslookingglass",
    set: "silken-moons-serenade",
    sands: "ER%",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: ER_EM_CRIT,
    note: "KQM Quick Guide · supportive Lunar-Bloom baseline; ER varies broadly by team and rotation.",
  },
  // Nahida (catalyst)
  nahida: {
    weapon: "athousandfloatingdreams",
    set: "deepwood-memories",
    sands: "EM",
    goblet: "EM",
    circlet: "EM",
    substatPriorities: EM_ER_CRIT,
    note: "KQM Quick Guide · full-EM off-field baseline; Dendro/CRIT pieces can win for personal damage.",
  },
  // Nefer (catalyst)
  nefer: {
    weapon: "reliquaryoftruth",
    set: "night-of-the-skys-unveiling",
    sands: "EM",
    goblet: "EM",
    circlet: "crit_dmg",
    substatPriorities: CRIT_EM_HP,
    note: "KQM Quick Guide · Lunar-Bloom baseline; assumes Hydro plus Lauma or another Dendro teammate.",
  },
  // Tighnari (bow)
  tighnari: {
    weapon: "hunterspath",
    set: "gilded-dreams",
    sands: "EM",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: CRIT_EM_ATK,
    note: "KQM Quick Guide · Hunter's Path favors EM Sands; 4pc Gilded is the practical baseline.",
  },
  // Traveler (sword)
  "traveler-f-dendro": {
    weapon: "favoniussword",
    set: "deepwood-memories",
    sands: "ER%",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · ER-first Dendro support baseline; Bloom teams can shift toward EM.",
  },
  // Traveler (sword)
  "traveler-m-dendro": {
    weapon: "favoniussword",
    set: "deepwood-memories",
    sands: "ER%",
    goblet: "dendro%",
    circlet: "crit_rate",
    substatPriorities: ER_CRIT_ATK,
    note: "KQM Quick Guide · same baseline as the female Traveler variant.",
  },
  // Yaoyao (polearm)
  yaoyao: {
    weapon: "favoniuslance",
    set: "deepwood-memories",
    sands: "ER%",
    goblet: "HP%",
    circlet: "heal%",
    substatPriorities: ER_HP_CRIT,
    note: "KQM Quick Guide · healer/Dendro-support baseline; Healing Bonus is not simulated as damage.",
  },
};
