import type { Buff, BuffCondition, StatConversionModifier, StatModifier } from "@/simulation/buffs/types";
import type { ArtifactSetBonusBuffs } from "@/simulation/engine/equipmentBuffs";
import type { Element, ReactionBonusKey } from "@/types";
import { generatedArtifactEffects } from "./generated/setEffects";
import { buffsForSetBonus } from "./setBonusBuffs";

/**
 * Runtime artifact compiler.
 *
 * The generated table intentionally keeps prose and source parameters separate
 * from the mechanics vocabulary.  `setBonusBuffs()` exposes the conservative
 * subset that was expressible when the table was generated; this compiler adds
 * the remaining deterministic, damage-relevant set effects without changing
 * the generated file or inventing artifact stat rolls. Healing-triggered
 * effects use the explicit healing-event seam. Proc rows use expected values
 * where the engine has no RNG mode; effects that still require unsupported
 * state (shields, pickups, energy/cooldown events) remain inert and visible as
 * limitations in the source table.
 */

const INFINITE = Number.POSITIVE_INFINITY;

function makeBuff(
  effectId: string,
  source: string,
  modifiers: readonly StatModifier[],
  conditions?: BuffCondition,
  scope: "active" | "party" = "active",
  conversions?: readonly StatConversionModifier[],
): Buff {
  return {
    id: effectId,
    source,
    startTime: 0,
    duration: INFINITE,
    stacking: { mode: "refresh" },
    targets: { scope },
    ...(conditions ? { conditions } : {}),
    modifiers,
    ...(conversions && conversions.length > 0 ? { conversions } : {}),
  };
}

function dmg(
  effectId: string,
  source: string,
  value: number,
  damageTypes?: BuffCondition["damageTypes"],
  extra?: Omit<BuffCondition, "damageTypes">,
  scope: "active" | "party" = "active",
): Buff {
  return makeBuff(
    effectId,
    source,
    [{ stat: "dmgBonus", value }],
    { ...(damageTypes ? { damageTypes } : {}), ...(extra ?? {}) },
    scope,
  );
}

function reaction(
  effectId: string,
  source: string,
  values: Partial<Record<ReactionBonusKey, number>>,
): Buff {
  const modifiers: StatModifier[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    modifiers.push({ stat: "reactionBonus", reaction: key as ReactionBonusKey, value });
  }
  return makeBuff(effectId, source, modifiers);
}

function elemental(
  effectId: string,
  source: string,
  element: Element,
  value: number,
  conditions?: BuffCondition,
): Buff {
  return makeBuff(
    effectId,
    source,
    [{ stat: "elementalDmgBonus", element, value }],
    conditions,
  );
}

function resistance(
  effectId: string,
  source: string,
  elements: readonly Element[],
  value: number,
): Buff {
  return {
    ...makeBuff(effectId, source, []),
    resistanceModifiers: elements.map((element) => ({ element, value })),
  };
}

const ELEMENTAL_ELEMENTS: readonly Element[] = [
  "pyro", "hydro", "electro", "cryo", "anemo", "geo", "dendro",
];

function resourceGatedResistance(
  effectId: string,
  source: string,
  element: Element,
  value: number,
  resourceId: string,
): Buff {
  return {
    ...makeBuff(effectId, source, [], {
      resources: [{ resourceId, comparator: "gte", value: 1, owner: "source" }],
    }),
    resistanceModifiers: [{ element, value }],
  };
}

function resourceGatedEnemyResistance(
  effectId: string,
  source: string,
  element: Element,
  value: number,
  resourceId: string,
): Buff {
  return {
    ...makeBuff(effectId, source, [], {
      resources: [{ resourceId, comparator: "gte", value: 1, owner: "source" }],
    }, "party"),
    enemyModifiers: [{ key: "resReduction", element, value }],
  };
}

function shieldStrength(
  effectId: string,
  source: string,
  value: number,
): Buff {
  return {
    ...makeBuff(effectId, source, []),
    shieldStrengthModifiers: [{ value }],
  };
}

function partyShieldBuff(
  effectId: string,
  source: string,
  modifiers: readonly StatModifier[],
  shieldValue: number,
  conditions?: BuffCondition,
): Buff {
  return {
    ...makeBuff(effectId, source, modifiers, conditions, "party"),
    shieldStrengthModifiers: [{ value: shieldValue }],
  };
}

function resourceGatedDamage(
  effectId: string,
  source: string,
  value: number,
  resourceId: string,
  damageTypes: BuffCondition["damageTypes"],
  scope: "active" | "party" = "active",
): Buff {
  return dmg(effectId, source, value, damageTypes, {
    resources: [{ resourceId, comparator: "gte", value: 1, owner: "source" }],
  }, scope);
}

function resourceThresholdBuffs(
  effectId: string,
  source: string,
  resourceId: string,
  thresholds: readonly { minimum: number; modifiers: readonly StatModifier[] }[],
  damageTypes?: BuffCondition["damageTypes"],
  elements?: BuffCondition["elements"],
): readonly Buff[] {
  return thresholds.map(({ minimum, modifiers }) => makeBuff(
    `${effectId}-${minimum}`,
    source,
    modifiers,
    {
      ...(damageTypes ? { damageTypes } : {}),
      ...(elements ? { elements } : {}),
      resources: [{ resourceId, comparator: "gte", value: minimum, owner: "source" }],
    },
  ));
}

function auraDurationReduction(
  effectId: string,
  source: string,
  value: number,
): Buff {
  return {
    ...makeBuff(effectId, source, []),
    auraDurationModifiers: [{ value }],
  };
}

/** Compile one generated row. Returns undefined when its mechanic is not yet
 * representable by the generic engine. */
function compile(effectId: string, text: string): readonly Buff[] | undefined {
  const source = `${text} (${effectId})`;
  switch (effectId) {
    case "resolution-of-sojourner-4pc":
      return [makeBuff(effectId, source, [{ stat: "critRate", value: 0.3 }], { damageTypes: ["charged"] })];
    case "brave-heart-4pc":
      return [dmg(effectId, source, 0.3, undefined, { minEnemyHpFractionExclusive: 0.5 })];
    case "defenders-will-4pc":
      return [resistance(effectId, source, ["pyro", "hydro", "anemo", "electro", "dendro", "cryo", "geo"], 0.3)];
    case "tiny-miracle-2pc":
      return [resistance(effectId, source, ["pyro", "hydro", "anemo", "electro", "dendro", "cryo", "geo"], 0.2)];
    case "tiny-miracle-4pc":
      return ELEMENTAL_ELEMENTS.map((element) => resourceGatedResistance(
        `${effectId}-${element}`,
        source,
        element,
        0.3,
        `artifact:tiny-miracle:${element}`,
      ));
    case "prayers-for-illumination-1pc":
    case "prayers-for-destiny-1pc":
    case "prayers-for-wisdom-1pc":
    case "prayers-to-springtime-1pc":
      return [auraDurationReduction(effectId, source, 0.4)];
    case "martial-artist-4pc":
      return [resourceGatedDamage(effectId, source, 0.25, "artifact:martial-artist", ["normal", "charged"] )];
    case "berserker-4pc":
      return [makeBuff(effectId, source, [{ stat: "critRate", value: 0.24 }], { maxHpFractionExclusive: 0.7 })];
    case "instructor-4pc":
      return [makeBuff(effectId, source, [{ stat: "elementalMastery", value: 120 }], { resources: [{ resourceId: "artifact:instructor", comparator: "gte", value: 1, owner: "source" }] }, "party")];
    case "blizzard-strayer-4pc":
      return [
        makeBuff(`${effectId}-cryo`, source, [{ stat: "critRate", value: 0.2 }], { enemyAuraElements: ["cryo"] }),
        makeBuff(`${effectId}-frozen`, source, [{ stat: "critRate", value: 0.2 }], { enemyAuraKinds: ["frozen"] }),
      ];
    case "thundersoother-2pc":
      return [resistance(effectId, source, ["electro"], 0.4)];
    case "thundersoother-4pc":
      return [dmg(effectId, source, 0.35, undefined, { enemyAuraElements: ["electro"] })];
    case "lavawalker-4pc":
      return [dmg(effectId, source, 0.35, undefined, { enemyAuraElements: ["pyro"] })];
    case "lavawalker-2pc":
      return [resistance(effectId, source, ["pyro"], 0.4)];
    case "gladiators-finale-4pc":
      return [dmg(effectId, source, 0.35, ["normal"], { weaponTypes: ["sword", "claymore", "polearm"] })];
    case "viridescent-venerer-4pc":
      return [
        reaction(effectId, source, { swirl: 0.6 }),
        ...ELEMENTAL_ELEMENTS.map((element) => resourceGatedEnemyResistance(
          `${effectId}-${element}`,
          source,
          element,
          0.4,
          `artifact:viridescent-venerer:${element}`,
        )),
      ];
    case "wanderers-troupe-4pc":
      return [dmg(effectId, source, 0.35, ["charged"], { weaponTypes: ["catalyst", "bow"] })];
    case "thundering-fury-4pc":
      return [reaction(effectId, source, {
        overloaded: 0.4,
        electroCharged: 0.4,
        superconduct: 0.4,
        hyperbloom: 0.4,
        aggravate: 0.2,
      })];
    case "crimson-witch-of-flames-4pc":
      return [
        reaction(effectId, source, {
          overloaded: 0.4,
          burning: 0.4,
          burgeon: 0.4,
          vaporize: 0.15,
          melt: 0.15,
        }),
        ...resourceThresholdBuffs(`${effectId}-stacks`, source, "artifact:crimson-witch-of-flames", [
          { minimum: 1, modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: 0.075 }] },
          { minimum: 2, modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: 0.075 }] },
          { minimum: 3, modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: 0.075 }] },
        ]),
      ];
    case "noblesse-oblige-4pc":
      return [makeBuff(effectId, source, [{ stat: "atkPercent", value: 0.2 }], { resources: [{ resourceId: "artifact:noblesse-oblige", comparator: "gte", value: 1, owner: "source" }] }, "party")];
    case "bloodstained-chivalry-4pc":
      return [resourceGatedDamage(effectId, source, 0.5, "artifact:bloodstained-chivalry", ["charged"] )];
    case "archaic-petra-2pc":
      return [elemental(effectId, source, "geo", 0.15)];
    case "archaic-petra-4pc":
      return ELEMENTAL_ELEMENTS.map((element) => makeBuff(
        `${effectId}-${element}`,
        source,
        [{ stat: "elementalDmgBonus", element, value: 0.35 }],
        { resources: [{ resourceId: `artifact:archaic-petra:${element}`, comparator: "gte", value: 1, owner: "source" }] },
        "party",
      ));
    case "retracing-bolide-4pc":
      return [dmg(effectId, source, 0.4, ["normal", "charged"], { requiresShield: true })];
    case "retracing-bolide-2pc":
      return [shieldStrength(effectId, source, 0.35)];
    case "heart-of-depth-4pc":
      return [resourceGatedDamage(effectId, source, 0.3, "artifact:heart-of-depth", ["normal", "charged"] )];
    case "tenacity-of-the-millelith-4pc":
      return [partyShieldBuff(effectId, source, [{ stat: "atkPercent", value: 0.2 }], 0.3, { resources: [{ resourceId: "artifact:tenacity", comparator: "gte", value: 1, owner: "source" }] })];
    case "pale-flame-4pc":
      return [
        ...resourceThresholdBuffs(effectId, source, "artifact:pale-flame", [
          { minimum: 1, modifiers: [{ stat: "atkPercent", value: 0.09 }] },
          { minimum: 2, modifiers: [{ stat: "atkPercent", value: 0.09 }] },
        ]),
        ...resourceThresholdBuffs(`${effectId}-physical`, source, "artifact:pale-flame", [
          { minimum: 2, modifiers: [{ stat: "dmgBonus", value: 0.25 }] },
        ], undefined, ["physical"]),
      ];
    case "shimenawas-reminiscence-4pc":
      return [resourceGatedDamage(effectId, source, 0.5, "artifact:shimenawa", ["normal", "charged", "plunge"])];
    case "emblem-of-severed-fate-4pc":
      return [makeBuff(effectId, source, [], undefined, "active", [{
        sourceStat: "energyRecharge",
        targetStat: "dmgBonus",
        ratio: 0.25,
        maxCap: 0.75,
      }])];
    case "husk-of-opulent-dreams-4pc":
      // Curiosity stacks are represented as one threshold buff per stack. The
      // engine folds all satisfied thresholds, yielding 6% DEF and 6% Geo DMG
      // per live stack without inventing a second stacking vocabulary.
      return resourceThresholdBuffs(effectId, source, "artifact:husk-of-opulent-dreams", [
        { minimum: 1, modifiers: [{ stat: "defPercent", value: 0.06 }, { stat: "elementalDmgBonus", element: "geo", value: 0.06 }] },
        { minimum: 2, modifiers: [{ stat: "defPercent", value: 0.06 }, { stat: "elementalDmgBonus", element: "geo", value: 0.06 }] },
        { minimum: 3, modifiers: [{ stat: "defPercent", value: 0.06 }, { stat: "elementalDmgBonus", element: "geo", value: 0.06 }] },
        { minimum: 4, modifiers: [{ stat: "defPercent", value: 0.06 }, { stat: "elementalDmgBonus", element: "geo", value: 0.06 }] },
      ]);
    case "vermillion-hereafter-4pc":
      return [
        ...resourceThresholdBuffs(`${effectId}-base`, source, "artifact:vermillion-base", [
          { minimum: 1, modifiers: [{ stat: "atkPercent", value: 0.08 }] },
        ]),
        ...resourceThresholdBuffs(`${effectId}-hp-loss`, source, "artifact:vermillion-hp-loss", [
          { minimum: 1, modifiers: [{ stat: "atkPercent", value: 0.1 }] },
          { minimum: 2, modifiers: [{ stat: "atkPercent", value: 0.1 }] },
          { minimum: 3, modifiers: [{ stat: "atkPercent", value: 0.1 }] },
          { minimum: 4, modifiers: [{ stat: "atkPercent", value: 0.1 }] },
        ]),
      ];
    case "echoes-of-an-offering-4pc":
      // Deterministic expected-value mode: 36% proc chance × 70% ATK is a
      // +25.2% ATK additive base-damage contribution on Normal Attacks.
      // This keeps the simulator RNG-free while preserving the sourced mean.
      return [
        makeBuff(
          effectId,
          source,
          [],
          { damageTypes: ["normal"] },
          "active",
          [{ sourceStat: "atk", targetStat: "flatDamageBonus", ratio: 0.252 }],
        ),
      ];
    case "deepwood-memories-4pc":
      return [{
        ...makeBuff(effectId, source, [], { resources: [{ resourceId: "artifact:deepwood", comparator: "gte", value: 1, owner: "source" }] }, "party"),
        enemyModifiers: [{ key: "resReduction", element: "dendro", value: 0.3 }],
      }];
    case "gilded-dreams-4pc":
      // The exact same/different-element split is supplied by the build
      // adapter in a later pass; the activation window itself is represented
      // here so the maximum sourced grant is never permanent uptime.
      return [makeBuff(effectId, source, [{ stat: "atkPercent", value: 0.42 }, { stat: "elementalMastery", value: 100 }], {
        resources: [{ resourceId: "artifact:gilded-dreams", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "desert-pavilion-chronicle-4pc":
      return [resourceGatedDamage(effectId, source, 0.4, "artifact:desert-pavilion-chronicle", ["normal", "charged", "plunge"] )];
    case "flower-of-paradise-lost-4pc":
      return [
        reaction(effectId, source, { bloom: 0.4, hyperbloom: 0.4, burgeon: 0.4 }),
        ...resourceThresholdBuffs(`${effectId}-stacks`, source, "artifact:flower-of-paradise-lost", [
          { minimum: 1, modifiers: [{ stat: "reactionBonus", reaction: "bloom", value: 0.25 }, { stat: "reactionBonus", reaction: "hyperbloom", value: 0.25 }, { stat: "reactionBonus", reaction: "burgeon", value: 0.25 }] },
          { minimum: 2, modifiers: [{ stat: "reactionBonus", reaction: "bloom", value: 0.25 }, { stat: "reactionBonus", reaction: "hyperbloom", value: 0.25 }, { stat: "reactionBonus", reaction: "burgeon", value: 0.25 }] },
          { minimum: 3, modifiers: [{ stat: "reactionBonus", reaction: "bloom", value: 0.25 }, { stat: "reactionBonus", reaction: "hyperbloom", value: 0.25 }, { stat: "reactionBonus", reaction: "burgeon", value: 0.25 }] },
          { minimum: 4, modifiers: [{ stat: "reactionBonus", reaction: "bloom", value: 0.25 }, { stat: "reactionBonus", reaction: "hyperbloom", value: 0.25 }, { stat: "reactionBonus", reaction: "burgeon", value: 0.25 }] },
        ]),
      ];
    case "nymphs-dream-4pc":
      return resourceThresholdBuffs(effectId, source, "artifact:nymphs-dream", [
        { minimum: 1, modifiers: [{ stat: "atkPercent", value: 0.07 }, { stat: "elementalDmgBonus", element: "hydro", value: 0.04 }] },
        { minimum: 2, modifiers: [{ stat: "atkPercent", value: 0.09 }, { stat: "elementalDmgBonus", element: "hydro", value: 0.05 }] },
        { minimum: 3, modifiers: [{ stat: "atkPercent", value: 0.09 }, { stat: "elementalDmgBonus", element: "hydro", value: 0.06 }] },
      ]);
    case "vourukashas-glow-4pc":
      return [
        dmg(`${effectId}-base`, source, 0.1, ["skill", "burst"]),
        ...resourceThresholdBuffs(`${effectId}-stacks`, source, "artifact:vourukashas-glow", [
          // The sourced text says the 10% base bonus is increased by 80%
          // per stack: 0.10 * 0.80 = 0.08 DMG per stack, five stacks total
          // 50% skill/burst DMG. It is not an 80 percentage-point add.
          { minimum: 1, modifiers: [{ stat: "dmgBonus", value: 0.08 }] },
          { minimum: 2, modifiers: [{ stat: "dmgBonus", value: 0.08 }] },
          { minimum: 3, modifiers: [{ stat: "dmgBonus", value: 0.08 }] },
          { minimum: 4, modifiers: [{ stat: "dmgBonus", value: 0.08 }] },
          { minimum: 5, modifiers: [{ stat: "dmgBonus", value: 0.08 }] },
        ], ["skill", "burst"]),
      ];
    case "marechaussee-hunter-4pc":
      return resourceThresholdBuffs(effectId, source, "artifact:marechaussee-hunter", [
        { minimum: 1, modifiers: [{ stat: "critRate", value: 0.12 }] },
        { minimum: 2, modifiers: [{ stat: "critRate", value: 0.12 }] },
        { minimum: 3, modifiers: [{ stat: "critRate", value: 0.12 }] },
      ]);
    case "golden-troupe-4pc":
      return [
        dmg(`${effectId}-base`, source, 0.25, ["skill"]),
        dmg(`${effectId}-offfield`, source, 0.25, ["skill"], { requiresOnField: false }),
      ];
    case "nighttime-whispers-in-the-echoing-woods-4pc":
      return [
        ...resourceThresholdBuffs(effectId, source, "artifact:nighttime-whispers", [
          { minimum: 1, modifiers: [{ stat: "elementalDmgBonus", element: "geo", value: 0.2 }] },
        ]),
        ...resourceThresholdBuffs(`${effectId}-shield`, source, "artifact:nighttime-whispers-shield", [
          { minimum: 1, modifiers: [{ stat: "elementalDmgBonus", element: "geo", value: 0.3 }] },
        ]),
      ];
    case "fragment-of-harmonic-whimsy-4pc":
      return resourceThresholdBuffs(effectId, source, "artifact:fragment-of-harmonic-whimsy", [
        { minimum: 1, modifiers: [{ stat: "dmgBonus", value: 0.18 }] },
        { minimum: 2, modifiers: [{ stat: "dmgBonus", value: 0.18 }] },
        { minimum: 3, modifiers: [{ stat: "dmgBonus", value: 0.18 }] },
      ]);
    case "unfinished-reverie-4pc":
      return [dmg(effectId, source, 0.5, undefined, {
        resources: [{ resourceId: "artifact:unfinished-reverie", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "scroll-of-the-hero-of-cinder-city-4pc":
      return [makeBuff(effectId, source, ELEMENTAL_ELEMENTS.map((element) => ({
        stat: "elementalDmgBonus" as const,
        element,
        value: 0.4,
      })), {
        resources: [{ resourceId: "artifact:scroll-cinder-city", comparator: "gte", value: 1, owner: "source" }],
      }, "party")];
    case "obsidian-codex-2pc":
      return [dmg(effectId, source, 0.15, undefined, {
        requiresOnField: true,
        resources: [{ resourceId: "artifact:obsidian-codex-nightsoul", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "obsidian-codex-4pc":
      // Nightsoul points are not yet a shared resource in every character
      // definition. Restrict approximation to the on-field window instead
      // of granting the 40% CRIT Rate to off-field hits.
      return [makeBuff(effectId, source, [{ stat: "critRate", value: 0.4 }], {
        requiresOnField: true,
        resources: [{ resourceId: "artifact:obsidian-codex-crit", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "long-nights-oath-4pc":
      return resourceThresholdBuffs(effectId, source, "artifact:long-nights-oath", [
        { minimum: 1, modifiers: [{ stat: "dmgBonus", value: 0.15 }] },
        { minimum: 2, modifiers: [{ stat: "dmgBonus", value: 0.15 }] },
        { minimum: 3, modifiers: [{ stat: "dmgBonus", value: 0.15 }] },
        { minimum: 4, modifiers: [{ stat: "dmgBonus", value: 0.15 }] },
        { minimum: 5, modifiers: [{ stat: "dmgBonus", value: 0.15 }] },
      ], ["plunge"]);
    case "finale-of-the-deep-galleries-4pc":
      return [
        dmg(`${effectId}-normal`, source, 0.6, ["normal"], {
          maxEnergyFraction: 0,
          resources: [{ resourceId: "artifact:finale-normal-disabled", comparator: "lt", value: 1, owner: "source" }],
        }),
        dmg(`${effectId}-burst`, source, 0.6, ["burst"], {
          maxEnergyFraction: 0,
          resources: [{ resourceId: "artifact:finale-burst-disabled", comparator: "lt", value: 1, owner: "source" }],
        }),
      ];
    case "night-of-the-skys-unveiling-4pc":
      return [makeBuff(effectId, source, [
        { stat: "critRate", value: 0.3 },
        { stat: "dmgBonus", value: 0.1 },
      ], { resources: [{ resourceId: "artifact:night-skys-unveiling", comparator: "gte", value: 1, owner: "source" }] })];
    case "silken-moons-serenade-4pc":
      return [makeBuff(effectId, source, [{ stat: "elementalMastery", value: 120 }], {
        resources: [{ resourceId: "artifact:silken-moons-serenade", comparator: "gte", value: 1, owner: "source" }],
      }, "party")];
    case "aubade-of-morningstar-and-moon-4pc":
      return [makeBuff(effectId, source, [
        { stat: "dmgBonus", value: 0.2 },
      ], {
        damageTypes: ["reaction"],
        requiresOnField: false,
        resources: [{ resourceId: "artifact:aubade-moonsign", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "disenchantment-in-deep-shadow-4pc":
      return [
        makeBuff(`${effectId}-crit`, source, [{ stat: "critRate", value: 0.16 }], {
          resources: [{ resourceId: "artifact:disenchantment-stellar-conduct", comparator: "gte", value: 1, owner: "source" }],
        }),
        makeBuff(`${effectId}-reaction`, source, [{ stat: "reactionBonus", reaction: "superconduct", value: 0.8 }], {
          resources: [{ resourceId: "artifact:disenchantment-stellar-conduct", comparator: "gte", value: 1, owner: "source" }],
        }),
      ];
    case "scarlet-proof-4pc":
      return [
        makeBuff(`${effectId}-crit`, source, [{ stat: "critRate", value: 0.16 }], {
          resources: [{ resourceId: "artifact:scarlet-proof", comparator: "gte", value: 1, owner: "source" }],
        }),
        makeBuff(`${effectId}-reaction`, source, [{ stat: "reactionBonus", reaction: "swirl", value: 0.4 }], {
          resources: [{ resourceId: "artifact:scarlet-proof", comparator: "gte", value: 1, owner: "source" }],
        }),
      ];
    case "heart-of-the-furnace-4pc":
      return [makeBuff(effectId, source, [{ stat: "atkPercent", value: 0.12 }], {
        resources: [{ resourceId: "artifact:heart-of-the-furnace", comparator: "gte", value: 1, owner: "source" }],
      })];
    case "celestial-gift-4pc":
      return [makeBuff(effectId, source, ELEMENTAL_ELEMENTS.map((element) => ({
        stat: "elementalDmgBonus" as const,
        element,
        value: 0.2,
      })), {
        resources: [{ resourceId: "artifact:celestial-gift", comparator: "gte", value: 1, owner: "source" }],
      }, "party")];
    case "a-day-carved-from-rising-winds-4pc":
      return [
        ...resourceThresholdBuffs(effectId, source, "artifact:a-day-carved-from-rising-winds", [
          { minimum: 1, modifiers: [{ stat: "atkPercent", value: 0.25 }] },
        ]),
        makeBuff(`${effectId}-homework`, source, [{ stat: "critRate", value: 0.2 }], {
          resources: [{ resourceId: "artifact:a-day-carved-from-rising-winds-homework", comparator: "gte", value: 1, owner: "source" }],
        }),
      ];
    case "adventurer-2pc":
      return [makeBuff(effectId, source, [{ stat: "hpFlat", value: 1000 }])];
    case "lucky-dog-2pc":
      return [makeBuff(effectId, source, [{ stat: "defFlat", value: 100 }])];
    default:
      return undefined;
  }
}

function completeForSet(setId: string): ArtifactSetBonusBuffs | undefined {
  const rows = generatedArtifactEffects.filter((effect) => effect.setSlug === setId);
  if (rows.length === 0) return undefined;
  const bonus: ArtifactSetBonusBuffs = { setId };
  for (const effect of rows) {
    // Lifecycle effects use the serializable state vocabulary. Keeping these
    // out of Buffs prevents pickup, burst, and defeat triggers becoming
    // unconditional uptime.
    const stateEffect = (() => {
      switch (effect.id) {
        case "gambler-4pc":
          return { kind: "cooldownResetOnDefeat" as const, cooldownSeconds: 15, abilityTypes: ["skill" as const] };
        case "thundering-fury-4pc":
          return { kind: "cooldownReductionOnReaction" as const, reductionSeconds: 1, cooldownSeconds: 0.8, abilityTypes: ["skill" as const] };
        case "tiny-miracle-4pc":
          return ELEMENTAL_ELEMENTS.map((element) => ({
            kind: "resourceOnTrigger" as const,
            resourceId: `artifact:tiny-miracle:${element}`,
            trigger: "resourceEvent" as const,
            eventResourceId: `damageTaken:${element}`,
            value: 1,
            durationSeconds: 10,
            cooldownSeconds: 10,
            maxStacks: 1,
            stackMode: "refresh" as const,
          }));
        case "viridescent-venerer-4pc":
          return ELEMENTAL_ELEMENTS.map((element) => ({
            kind: "resourceOnTrigger" as const,
            resourceId: `artifact:viridescent-venerer:${element}`,
            trigger: "reaction" as const,
            eventResourceId: `swirl:${element}`,
            value: 1,
            durationSeconds: 10,
            cooldownSeconds: 0,
            maxStacks: 1,
            stackMode: "refresh" as const,
          }));
        case "archaic-petra-4pc":
          return ELEMENTAL_ELEMENTS.map((element) => ({
            kind: "resourceOnTrigger" as const,
            resourceId: `artifact:archaic-petra:${element}`,
            trigger: "resourceEvent" as const,
            eventResourceId: `crystallize:${element}`,
            value: 1,
            durationSeconds: 10,
            cooldownSeconds: 0,
            maxStacks: 1,
            stackMode: "refresh" as const,
          }));
        case "the-exile-4pc":
          return { kind: "partyEnergyOverTimeAfterBurst" as const, amount: 2, intervalSeconds: 2, durationSeconds: 6, excludeSource: true };
        case "scholar-4pc":
          return { kind: "energyOnParticlePickup" as const, amount: 3, cooldownSeconds: 3, targetWeaponTypes: ["bow" as const, "catalyst" as const] };
        case "adventurer-4pc":
          return { kind: "healOnPickup" as const, pickupKind: "item" as const, maxHpFraction: 0.3, durationSeconds: 5, tickIntervalSeconds: 1 };
        case "lucky-dog-4pc":
          return { kind: "healOnPickup" as const, pickupKind: "mora" as const, amount: 300 };
        case "maiden-beloved-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:maiden-beloved", trigger: "skillCast" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:maiden-beloved", trigger: "burstCast" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
          ];
        case "traveling-doctor-4pc":
          return { kind: "healOnBurst" as const, maxHpFraction: 0.2 };
        case "finale-of-the-deep-galleries-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:finale-burst-disabled", trigger: "damageDealt" as const, damageTypes: ["normal"], value: 1, durationSeconds: 6, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:finale-normal-disabled", trigger: "damageDealt" as const, damageTypes: ["burst"], value: 1, durationSeconds: 6, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
          ];
        case "scroll-of-the-hero-of-cinder-city-2pc":
          return { kind: "energyOnNightsoulBurst" as const, amount: 6 };
        case "scroll-of-the-hero-of-cinder-city-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:scroll-cinder-city", trigger: "reaction" as const, value: 1, durationSeconds: 15, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "martial-artist-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:martial-artist", trigger: "skillCast" as const, value: 1, durationSeconds: 8, cooldownSeconds: 8, maxStacks: 1, stackMode: "refresh" as const };
        case "instructor-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:instructor", trigger: "reaction" as const, value: 1, durationSeconds: 8, cooldownSeconds: 8, maxStacks: 1, stackMode: "refresh" as const };
        case "gilded-dreams-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:gilded-dreams", trigger: "reaction" as const, value: 1, durationSeconds: 8, cooldownSeconds: 8, maxStacks: 1, stackMode: "refresh" as const };
        case "heart-of-depth-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:heart-of-depth", trigger: "skillCast" as const, value: 1, durationSeconds: 15, cooldownSeconds: 15, maxStacks: 1, stackMode: "refresh" as const };
        case "noblesse-oblige-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:noblesse-oblige", trigger: "burstCast" as const, value: 1, durationSeconds: 12, cooldownSeconds: 12, maxStacks: 1, stackMode: "refresh" as const };
        case "crimson-witch-of-flames-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:crimson-witch-of-flames", trigger: "skillCast" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 3, stackMode: "add" as const };
        case "bloodstained-chivalry-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:bloodstained-chivalry", trigger: "defeat" as const, value: 1, durationSeconds: 10, cooldownSeconds: 15, maxStacks: 1, stackMode: "refresh" as const };
        case "tenacity-of-the-millelith-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:tenacity", trigger: "skillCast" as const, value: 1, durationSeconds: 3, cooldownSeconds: 3, maxStacks: 1, stackMode: "refresh" as const };
        case "deepwood-memories-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:deepwood", trigger: "skillCast" as const, value: 1, durationSeconds: 8, cooldownSeconds: 8, maxStacks: 1, stackMode: "refresh" as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:deepwood", trigger: "burstCast" as const, value: 1, durationSeconds: 8, cooldownSeconds: 8, maxStacks: 1, stackMode: "refresh" as const },
          ];
        case "pale-flame-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:pale-flame", trigger: "skillCast" as const, value: 1, durationSeconds: 7, cooldownSeconds: 0, maxStacks: 2, stackMode: "add" as const };
        case "shimenawas-reminiscence-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:shimenawa", trigger: "skillCast" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const, consumeEnergy: 15 };
        case "nymphs-dream-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:nymphs-dream", trigger: "damageDealt" as const, value: 1, durationSeconds: 8, cooldownSeconds: 0, maxStacks: 3, stackMode: "add" as const, damageTypes: ["normal", "charged", "plunge", "skill", "burst"] as const };
        case "long-nights-oath-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:long-nights-oath", trigger: "damageDealt" as const, value: 0, valuesByDamageType: { plunge: 1, charged: 2, skill: 2 }, durationSeconds: 6, cooldownSeconds: 1, maxStacks: 5, stackMode: "add" as const, damageTypes: ["plunge", "charged", "skill"] as const };
        case "husk-of-opulent-dreams-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:husk-of-opulent-dreams", trigger: "damageDealt" as const, value: 1, durationSeconds: 6, cooldownSeconds: 0.3, maxStacks: 4, stackMode: "add" as const, elements: ["geo"] as const };
        case "vermillion-hereafter-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:vermillion-base", trigger: "burstCast" as const, value: 1, durationSeconds: 16, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:vermillion-hp-loss", trigger: "resourceEvent" as const, eventResourceId: "hpDecrease", value: 1, durationSeconds: 16, cooldownSeconds: 0.8, maxStacks: 4, stackMode: "add" as const },
          ];
        case "vourukashas-glow-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:vourukashas-glow", trigger: "resourceEvent" as const, eventResourceId: "damageTaken", value: 1, durationSeconds: 5, cooldownSeconds: 0, maxStacks: 5, stackMode: "add" as const };
        case "marechaussee-hunter-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:marechaussee-hunter", trigger: "resourceEvent" as const, eventResourceId: "hpChange", value: 1, durationSeconds: 5, cooldownSeconds: 0, maxStacks: 3, stackMode: "add" as const };
        case "fragment-of-harmonic-whimsy-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:fragment-of-harmonic-whimsy", trigger: "resourceEvent" as const, eventResourceId: "bondOfLife", value: 1, durationSeconds: 6, cooldownSeconds: 0, maxStacks: 3, stackMode: "add" as const };
        case "desert-pavilion-chronicle-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:desert-pavilion-chronicle", trigger: "damageDealt" as const, value: 1, durationSeconds: 15, cooldownSeconds: 1, maxStacks: 1, stackMode: "refresh" as const, damageTypes: ["charged"] as const };
        case "flower-of-paradise-lost-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:flower-of-paradise-lost", trigger: "reaction" as const, value: 1, durationSeconds: 10, cooldownSeconds: 1, maxStacks: 4, stackMode: "add" as const };
        case "nighttime-whispers-in-the-echoing-woods-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:nighttime-whispers", trigger: "skillCast" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:nighttime-whispers-shield", trigger: "resourceEvent" as const, eventResourceId: "crystallizeShield" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
          ];
        case "unfinished-reverie-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:unfinished-reverie", trigger: "resourceEvent" as const, eventResourceId: "combatExit" as const, value: 1, durationSeconds: 50, cooldownSeconds: 3, maxStacks: 1, stackMode: "refresh" as const };
        case "obsidian-codex-2pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:obsidian-codex-nightsoul", trigger: "resourceEvent" as const, eventResourceId: "nightsoulBlessing" as const, value: 1, durationSeconds: 15, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "obsidian-codex-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:obsidian-codex-crit", trigger: "resourceEvent" as const, eventResourceId: "nightsoulConsume" as const, value: 1, durationSeconds: 6, cooldownSeconds: 1, maxStacks: 1, stackMode: "refresh" as const };
        case "night-of-the-skys-unveiling-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:night-skys-unveiling", trigger: "resourceEvent" as const, eventResourceId: "lunarReaction" as const, value: 1, durationSeconds: 4, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "silken-moons-serenade-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:silken-moons-serenade", trigger: "damageDealt" as const, value: 1, durationSeconds: 8, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const, elements: [...ELEMENTAL_ELEMENTS] };
        case "aubade-of-morningstar-and-moon-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:aubade-moonsign", trigger: "resourceEvent" as const, eventResourceId: "moonsignAscendant" as const, value: 1, durationSeconds: 60, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "celestial-gift-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:celestial-gift", trigger: "skillCast" as const, value: 1, durationSeconds: 20, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "disenchantment-in-deep-shadow-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:disenchantment-stellar-conduct", trigger: "resourceEvent" as const, eventResourceId: "stellarConduct" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "scarlet-proof-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:scarlet-proof", trigger: "resourceEvent" as const, eventResourceId: "stellarSwirl" as const, value: 1, durationSeconds: 10, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "heart-of-the-furnace-4pc":
          return { kind: "resourceOnTrigger" as const, resourceId: "artifact:heart-of-the-furnace", trigger: "resourceEvent" as const, eventResourceId: "stellarGlimmer" as const, value: 1, durationSeconds: 12, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const };
        case "a-day-carved-from-rising-winds-4pc":
          return [
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:a-day-carved-from-rising-winds", trigger: "damageDealt" as const, value: 1, durationSeconds: 6, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const, damageTypes: ["normal", "charged", "skill", "burst"] as const },
            { kind: "resourceOnTrigger" as const, resourceId: "artifact:a-day-carved-from-rising-winds-homework", trigger: "resourceEvent" as const, eventResourceId: "witchHomework" as const, value: 1, durationSeconds: 3600, cooldownSeconds: 0, maxStacks: 1, stackMode: "refresh" as const },
          ];
        default:
          return undefined;
      }
    })();
    if (stateEffect) {
      const key = effect.pieces === 1
        ? "stateEffects"
        : effect.pieces === 2
          ? "twoPieceStateEffects"
          : "fourPieceStateEffects";
      const effects = Array.isArray(stateEffect) ? stateEffect : [stateEffect];
      bonus[key] = [...(bonus[key] ?? []), ...effects];
    }
    // Healing effectiveness is a tiered property for several early sets.
    // Keep it on the same deterministic healing-event seam as Clam/Song so
    // healing-derived damage can consume it without inventing a character
    // stat channel. Tier-specific fields avoid applying a 4pc-only effect at
    // two pieces while preserving the legacy `healingEffects` contract.
    if (
      effect.pieces === 2 &&
      (effect.id === "ocean-hued-clam-2pc" ||
        effect.id === "song-of-days-past-2pc")
    ) {
      bonus.twoPieceHealingEffects = [{ kind: "healingBonus", healingBonus: 0.15 }];
    }
    if (effect.pieces === 2 && effect.id === "traveling-doctor-2pc") {
      bonus.twoPieceHealingEffects = [{ kind: "healingReceivedBonus", healingBonus: 0.2 }];
    }
    if (effect.pieces === 2 && effect.id === "maiden-beloved-2pc") {
      bonus.twoPieceHealingEffects = [{ kind: "healingBonus", healingBonus: 0.15 }];
    }
    if (effect.pieces === 4 && effect.id === "maiden-beloved-4pc") {
      bonus.fourPieceHealingEffects = [{
        kind: "conditionalHealingReceivedBonus",
        healingBonus: 0.2,
        resourceId: "artifact:maiden-beloved",
        targetScope: "party",
      }];
    }
    if (effect.pieces === 4 && effect.id === "ocean-hued-clam-4pc") {
      bonus.healingEffects = [{ kind: "oceanHuedClam", healingBonus: 0.15 }];
    }
    if (effect.pieces === 4 && effect.id === "song-of-days-past-4pc") {
      bonus.healingEffects = [{ kind: "songOfDaysPast", healingBonus: 0.15 }];
    }
    const buffs = effect.support === "modelled"
      ? buffsForSetBonus(effect)
      : compile(effect.id, effect.text) ?? [];
    if (buffs.length === 0) continue;
    if (effect.pieces === 1) bonus.onePiece = buffs;
    if (effect.pieces === 2) bonus.twoPiece = buffs;
    if (effect.pieces === 4) bonus.fourPiece = buffs;
  }
  // Keep a record for every generated set, including sets whose effects are
  // healing, self-resistance, pickup, or other mechanics the current engine
  // cannot represent.  An empty tier record is inert at harvest time, but it
  // preserves the generated catalog's identity and makes unsupported effects
  // explicit instead of making the set disappear from the runtime registry.
  return bonus;
}

/** Complete deterministic artifact effect records for the equipment adapter. */
export const completeArtifactSetBonusBuffs: readonly ArtifactSetBonusBuffs[] = generatedArtifactEffects
  .map((effect) => effect.setSlug)
  .filter((id, index, ids) => ids.indexOf(id) === index)
  .map((id) => completeForSet(id))
  .filter((value): value is ArtifactSetBonusBuffs => value !== undefined);

export function completeSetBonusBuffsById(setId: string): ArtifactSetBonusBuffs | undefined {
  return completeForSet(setId);
}
