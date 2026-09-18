import type { DamageType } from "@/types";
import type {
  Buff,
  EnemyModifier,
  StatConversionModifier,
  StatModifier,
} from "@/simulation/buffs/types";
import type {
  WeaponPassiveBuffs,
  WeaponRefinement,
  WeaponStateEffectTemplate,
} from "@/simulation/engine/equipmentBuffs";
import type {
  GeneratedWeapon,
  GeneratedWeaponConversion,
  GeneratedWeaponEnemyModifier,
  GeneratedWeaponModifier,
  GeneratedWeaponRefinement,
} from "./generated";
import { generatedWeaponsById } from "./generated";
import type { Element } from "@/types";

// ============================================================================
// Generated weapon data -> `Buff` objects.
//
// THE GAP THIS CLOSES. `src/simulation/engine/equipmentBuffs.ts` harvests
// already-authored `Buff` objects for the owned refinement and composes them
// into the damage pipeline. The generator, correctly, does NOT emit `Buff`s: it
// emits its OWN sourced shape (`GeneratedWeaponModifier` /
// `...Conversion` / `...EnemyModifier`), because a generator that emitted
// engine types would couple the datamining pipeline to the simulation's
// internals. This module is the one seam between the two, and it lives in
// `src/game-data` because it is the DATA shape's translation, not an engine
// rule.
//
// It is pure, total and deterministic: same generated input, byte-identical
// `Buff` output, every array walked in a fixed order. Nothing here fetches,
// caches, or reads a clock.
//
// ---------------------------------------------------------------------------
// THE THREE RULES THIS MODULE ENFORCES
// ---------------------------------------------------------------------------
//
// 1. `expressible`, plus explicit verified adapters, BECOMES A BUFF.
//    A row bucketed `unimplemented` carries real, sourced numbers whose GATING
//    the vocabulary cannot state ("for 10s after using an Elemental Skill",
//    "when HP is below 70%"). Emitting one as a permanent buff would apply a
//    conditional passive at 100% uptime -- a plausible number that is simply
//    too big, which `docs/ROADMAP.md` 0 ranks as worse than a missing one.
//    An `unverified` row states no number this pipeline could read at all.
//    Both are skipped, silently and by construction, not filtered by a
//    hand-maintained allowlist.
//
// 2. `damageTypes` IS LOAD-BEARING AND IS CARRIED, NEVER DROPPED.
//    The generated modifier's `damageTypes` is the scope the grant is confined
//    to. `Buff` states scope on `conditions.damageTypes`, which is per-BUFF and
//    not per-modifier -- so a refinement row whose grants have DIFFERENT scopes
//    must become SEVERAL buffs, one per distinct scope. Rust is exactly this
//    shape: -10% Charged and +40% Normal in one row. Folding them into one
//    unconditioned buff would hand +40% to every Burst in the rotation.
//
// 3. FAIL CLOSED ON REFINEMENT.
//    A refinement level the generator did not emit yields NO entry, so
//    `harvestWeaponPassiveBuffs()` returns nothing for it. It never falls back
//    to R1: an R5 weapon quietly simulating as R1 is a wrong damage number that
//    a test asserting only "the passive applies" would still pass.
//
// ---------------------------------------------------------------------------
// WHY SCOPE GROUPING, AND WHY IT IS SAFE
// ---------------------------------------------------------------------------
// Splitting one refinement row into several buffs is not an approximation: the
// buff resolver sums every ACTIVE buff's modifiers, and two buffs with disjoint
// `conditions.damageTypes` are never both active for one hit. One buff per
// scope therefore reproduces exactly the per-modifier scoping the generated
// data states, using only the vocabulary that already exists.
//
// Each split buff gets its own `id` (scope-suffixed), because `Buff.id` is the
// STACKING identity: two same-id buffs would collapse under `refresh`.
// ============================================================================

/** The bucket whose rows map onto the buff vocabulary with nothing invented. */
const EXPRESSIBLE_BUCKET = "expressible";

/** Always-on portions last for the whole simulation; lifecycles use state effects. */
const PERMANENT_DURATION = Number.POSITIVE_INFINITY;

/** Simulation time at which an always-on equipment buff becomes active. */
const EQUIPMENT_BUFF_START_TIME = 0;

/** Mistsplitter's unconditional all-element grant, by refinement. */
const MISTSPLITTER_ALL_ELEMENT_BONUS_BY_REFINEMENT: Readonly<
  Record<WeaponRefinement, number>
> = {
  1: 0.12,
  2: 0.15,
  3: 0.18,
  4: 0.21,
  5: 0.24,
};

/** Mistsplitter's first, second and third stack bonuses, by refinement. */
const MISTSPLITTER_EMBLEM_BONUS_BY_REFINEMENT: Readonly<
  Record<WeaponRefinement, readonly [number, number, number]>
> = {
  1: [0.08, 0.08, 0.12],
  2: [0.1, 0.1, 0.15],
  3: [0.12, 0.12, 0.18],
  4: [0.14, 0.14, 0.21],
  5: [0.16, 0.16, 0.24],
};

/** The passive says “all elements”; physical is intentionally excluded. */
const ELEMENTAL_TYPES: readonly Element[] = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
];

/** Staff of Homa's sourced HP -> ATK ratios, by refinement. */
const HOMA_ATK_RATIO_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.008,
  2: 0.01,
  3: 0.012,
  4: 0.014,
  5: 0.016,
};

/** Additional Staff of Homa HP -> ATK ratios while below half HP. */
const HOMA_LOW_HP_ATK_RATIO_BY_REFINEMENT: Readonly<
  Record<WeaponRefinement, number>
> = {
  1: 0.01,
  2: 0.012,
  3: 0.014,
  4: 0.016,
  5: 0.018,
};

/** Azurelight's zero-energy CRIT DMG grant, by refinement. */
const AZURELIGHT_CRIT_DMG_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.4,
  2: 0.5,
  3: 0.6,
  4: 0.7,
  5: 0.8,
};

/** Splendor of Tranquil Waters' HP-triggered grants, by refinement. */
const SPLENDOR_SKILL_DMG_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.08,
  2: 0.1,
  3: 0.12,
  4: 0.14,
  5: 0.16,
};
const SPLENDOR_HP_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.14,
  2: 0.175,
  3: 0.21,
  4: 0.245,
  5: 0.28,
};

/** Symphonist's healing-triggered ATK grants, by refinement. */
const SYMPHONIST_SWEET_ECHOES_BY_REFINEMENT: Readonly<Record<WeaponRefinement, number>> = {
  1: 0.32,
  2: 0.4,
  3: 0.48,
  4: 0.56,
  5: 0.64,
};

const AZURELIGHT_SKILL_WINDOW = "weapon:azurelight-skill-window";
const SPLENDOR_SKILL_STACKS = "weapon:splendor-skill-stacks";
const SPLENDOR_HP_STACKS = "weapon:splendor-hp-stacks";
const SYMPHONIST_SWEET_ECHOES = "weapon:symphonist-sweet-echoes";

/**
 * A refinement row's grants, grouped by the damage-type scope they share.
 *
 * The key is the scope rendered as a stable string; `UNSCOPED_KEY` is the
 * genuinely unscoped group (an always-on ATK%), which is NOT the same thing as
 * "scope unknown" -- the generator never emits a clause whose scope it could
 * not resolve.
 */
interface ScopeGroup {
  /** Sorted scope, or undefined for a genuinely unscoped group. */
  readonly damageTypes?: readonly DamageType[];
  readonly modifiers: StatModifier[];
  readonly conversions: StatConversionModifier[];
  readonly enemyModifiers: EnemyModifier[];
}

/** Map key standing for "this grant applies to every damage type". */
const UNSCOPED_KEY = "";

/**
 * Stable key for a damage-type scope.
 *
 * SORTED, so `["normal", "charged"]` and `["charged", "normal"]` land in the
 * same group and produce the same buff id on every run. The generator already
 * sorts, and this re-sorts rather than trusting it, because a group that split
 * on ordering would emit two half-buffs instead of one.
 */
function scopeKey(damageTypes: readonly DamageType[] | undefined): string {
  if (!damageTypes || damageTypes.length === 0) return UNSCOPED_KEY;
  return [...damageTypes].sort().join(",");
}

/** Get or create the group for one scope, preserving first-seen order. */
function groupFor(
  groups: Map<string, ScopeGroup>,
  damageTypes: readonly DamageType[] | undefined,
): ScopeGroup {
  const key = scopeKey(damageTypes);
  const existing = groups.get(key);
  if (existing) return existing;
  const created: ScopeGroup = {
    damageTypes:
      key === UNSCOPED_KEY ? undefined : (key.split(",") as DamageType[]),
    modifiers: [],
    conversions: [],
    enemyModifiers: [],
  };
  groups.set(key, created);
  return created;
}

/**
 * `GeneratedWeaponModifier` -> `StatModifier`.
 *
 * `damageTypes` is deliberately NOT copied here: it is consumed one level up,
 * as the buff's condition. `stat` and `element` are already the engine's own
 * `StatKey` / `Element` (the generated types are declared against them), so
 * this is a field projection and not a translation table that could drift.
 */
function toStatModifier(modifier: GeneratedWeaponModifier): StatModifier {
  return modifier.element === undefined
    ? { stat: modifier.stat, value: modifier.value }
    : { stat: modifier.stat, value: modifier.value, element: modifier.element };
}

/**
 * `GeneratedWeaponConversion` -> `StatConversionModifier`.
 *
 * `threshold` has no counterpart in the generated shape and is left ABSENT
 * rather than defaulted -- a conversion whose threshold the prose stated would
 * not have been bucketed `expressible` without it.
 */
function toStatConversion(
  conversion: GeneratedWeaponConversion,
): StatConversionModifier {
  const converted: StatConversionModifier = {
    sourceStat: conversion.sourceStat,
    targetStat: conversion.targetStat,
    ratio: conversion.ratio,
  };
  if (conversion.maxCap !== undefined) converted.maxCap = conversion.maxCap;
  return converted;
}

/** `GeneratedWeaponEnemyModifier` -> `EnemyModifier`. A field projection. */
function toEnemyModifier(
  modifier: GeneratedWeaponEnemyModifier,
): EnemyModifier {
  return modifier.element === undefined
    ? { key: modifier.key, value: modifier.value }
    : { key: modifier.key, value: modifier.value, element: modifier.element };
}

/**
 * Homa is sourced as `unimplemented` because the generator cannot express its
 * HP threshold in the generated row shape. The runtime condition vocabulary
 * can express that threshold, so translate the complete passive here rather
 * than applying only the unconditional HP grant or inventing 100% uptime.
 */
function homaBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "staffofhoma") return [];

  const ratio = HOMA_ATK_RATIO_BY_REFINEMENT[row.refinement];
  const lowHpRatio = HOMA_LOW_HP_ATK_RATIO_BY_REFINEMENT[row.refinement];
  const baseId = `${weaponId}-r${row.refinement}`;
  const base: Buff = {
    id: baseId,
    source: passiveName,
    startTime: EQUIPMENT_BUFF_START_TIME,
    duration: PERMANENT_DURATION,
    stacking: { mode: "refresh" },
    // Weapon stats belong to the wearer even while they are off field (for
    // example, an off-field burst snapshot). The harvest step attaches the
    // wearer id, so `self` keeps this passive on that character only.
    targets: { scope: "self" },
    modifiers: row.modifiers,
    conversions: [{ sourceStat: "hp", targetStat: "atkFlat", ratio }],
  };
  const lowHp: Buff = {
    id: `${baseId}-low-hp`,
    source: passiveName,
    startTime: EQUIPMENT_BUFF_START_TIME,
    duration: PERMANENT_DURATION,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    conditions: { maxHpFractionExclusive: 0.5 },
    conversions: [
      { sourceStat: "hp", targetStat: "atkFlat", ratio: lowHpRatio },
    ],
  };
  return [base, lowHp];
}

/**
 * Mistsplitter's unconditional grant and three independently gated Emblem
 * stacks. Stack acquisition lives in `mistsplitterStateEffectsForRefinement`;
 * these buffs only read the resulting per-wearer resources.
 */
function mistsplitterBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "mistsplitterreforged") return [];
  const value = MISTSPLITTER_ALL_ELEMENT_BONUS_BY_REFINEMENT[row.refinement];
  const stackValues = MISTSPLITTER_EMBLEM_BONUS_BY_REFINEMENT[row.refinement];
  const stackConditions = (resourceId: string) => ({
    resources: [{ resourceId, comparator: "gte" as const, value: 1 }],
  });
  const stackBuffs = (
    id: string,
    resourceId: string,
    stackValue: number,
  ): readonly Buff[] =>
    ELEMENTAL_TYPES.map((element) => ({
      id: `${id}-${element}`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" as const },
      targets: { scope: "self" as const },
      conditions: {
        ...stackConditions(resourceId),
        elements: [element],
      },
      modifiers: [{
        stat: "elementalDmgBonus" as const,
        element,
        value: stackValue,
      }],
    }));
  const energyStackBuffs = ELEMENTAL_TYPES.map((element) => ({
    id: `${weaponId}-r${row.refinement}-emblem-energy-${element}`,
    source: passiveName,
    startTime: EQUIPMENT_BUFF_START_TIME,
    duration: PERMANENT_DURATION,
    stacking: { mode: "refresh" as const },
    targets: { scope: "self" as const },
    conditions: {
      requiresEnergyBelowMax: true,
      elements: [element],
    },
    modifiers: [{
      stat: "elementalDmgBonus" as const,
      element,
      value: stackValues[2],
    }],
  }));
  return [
    {
      id: `${weaponId}-r${row.refinement}-all-elements`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      modifiers: ELEMENTAL_TYPES.map((element) => ({
        stat: "elementalDmgBonus" as const,
        element,
        value,
      })),
    },
    ...stackBuffs(
      `${weaponId}-r${row.refinement}-emblem-normal`,
      "mistsplitter-emblem-normal",
      stackValues[0],
    ),
    ...stackBuffs(
      `${weaponId}-r${row.refinement}-emblem-burst`,
      "mistsplitter-emblem-burst",
      stackValues[1],
    ),
    ...energyStackBuffs,
  ];
}

/** Azurelight's post-skill window and zero-energy bonus. */
function azurelightBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "azurelight") return [];
  const attack = row.modifiers.find((modifier) => modifier.stat === "atkPercent")?.value;
  const critDmg = AZURELIGHT_CRIT_DMG_BY_REFINEMENT[row.refinement];
  if (attack === undefined || !Number.isFinite(attack) || critDmg === undefined) return [];
  const window = {
    resources: [{ resourceId: AZURELIGHT_SKILL_WINDOW, comparator: "gte" as const, value: 1 }],
  };
  return [
    {
      id: `${weaponId}-r${row.refinement}-skill-window`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: window,
      modifiers: [{ stat: "atkPercent", value: attack }],
    },
    {
      id: `${weaponId}-r${row.refinement}-zero-energy`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: { ...window, requiresZeroEnergy: true },
      modifiers: [
        { stat: "atkPercent", value: attack },
        { stat: "critDmg", value: critDmg },
      ],
    },
  ];
}

/** Static enemy-present damage/HP portion of Aqua Simulacra. */
function aquaSimulacraBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "aquasimulacra") return [];
  const hp = row.modifiers.find((modifier) => modifier.stat === "hpPercent")?.value;
  const damage = [0.2, 0.25, 0.3, 0.35, 0.4][row.refinement - 1];
  if (hp === undefined || damage === undefined) return [];
  return [{
    id: `${weaponId}-r${row.refinement}`,
    source: passiveName,
    startTime: EQUIPMENT_BUFF_START_TIME,
    duration: PERMANENT_DURATION,
    stacking: { mode: "refresh" },
    targets: { scope: "self" },
    modifiers: [
      { stat: "hpPercent", value: hp },
      { stat: "dmgBonus", value: damage },
    ],
  }];
}

/** Splendor's two independent HP-change windows. */
function splendorBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "splendoroftranquilwaters") return [];
  const skillDamage = SPLENDOR_SKILL_DMG_BY_REFINEMENT[row.refinement];
  const hp = SPLENDOR_HP_BY_REFINEMENT[row.refinement];
  if (skillDamage === undefined || hp === undefined) return [];
  const resource = (resourceId: string) => ({
    resources: [{ resourceId, comparator: "gte" as const, value: 1 }],
  });
  return [
    {
      id: `${weaponId}-r${row.refinement}-skill-damage`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: { ...resource(SPLENDOR_SKILL_STACKS), damageTypes: ["skill"] },
      modifiers: [{ stat: "dmgBonus", value: skillDamage }],
    },
    {
      id: `${weaponId}-r${row.refinement}-hp`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: resource(SPLENDOR_HP_STACKS),
      modifiers: [{ stat: "hpPercent", value: hp }],
    },
  ];
}

/** Symphonist's permanent ATK, off-field ATK and healing window. */
function symphonistBuffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  if (weaponId !== "symphonistofscents") return [];
  const attack = row.modifiers.find((modifier) => modifier.stat === "atkPercent")?.value;
  const sweetEchoes = SYMPHONIST_SWEET_ECHOES_BY_REFINEMENT[row.refinement];
  if (attack === undefined || sweetEchoes === undefined) return [];
  return [
    {
      id: `${weaponId}-r${row.refinement}-attack`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      modifiers: [{ stat: "atkPercent", value: attack }],
    },
    {
      id: `${weaponId}-r${row.refinement}-off-field`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "self" },
      conditions: { requiresOnField: false },
      modifiers: [{ stat: "atkPercent", value: attack }],
    },
    {
      id: `${weaponId}-r${row.refinement}-sweet-echoes`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      conditions: {
        resources: [{ resourceId: SYMPHONIST_SWEET_ECHOES, comparator: "gte", value: 1, owner: "source" }],
      },
      modifiers: [{ stat: "atkPercent", value: sweetEchoes }],
    },
  ];
}

/** Event-driven state acquisition rules for supported signature weapons. */
function weaponStateEffectsForRefinement(
  weaponId: string,
): readonly WeaponStateEffectTemplate[] {
  if (weaponId === "azurelight") {
    return [{
      kind: "resourceOnTrigger",
      resourceId: AZURELIGHT_SKILL_WINDOW,
      trigger: "skillCast",
      value: 1,
      durationSeconds: 12,
      cooldownSeconds: 0,
      maxStacks: 1,
      stackMode: "refresh",
    }];
  }
  if (weaponId === "splendoroftranquilwaters") {
    return [
      {
        kind: "resourceOnTrigger",
        resourceId: SPLENDOR_SKILL_STACKS,
        trigger: "resourceEvent",
        eventResourceId: "hpChange",
        eventTarget: "self",
        value: 1,
        durationSeconds: 6,
        cooldownSeconds: 0.2,
        maxStacks: 3,
        stackMode: "add",
      },
      {
        kind: "resourceOnTrigger",
        resourceId: SPLENDOR_HP_STACKS,
        trigger: "resourceEvent",
        eventResourceId: "hpChange",
        eventTarget: "otherPartyMember",
        value: 1,
        durationSeconds: 6,
        cooldownSeconds: 0.2,
        maxStacks: 2,
        stackMode: "add",
      },
    ];
  }
  if (weaponId === "symphonistofscents") {
    return [{
      kind: "resourceOnTrigger",
      resourceId: SYMPHONIST_SWEET_ECHOES,
      trigger: "resourceEvent",
      eventResourceId: "hpChange",
      eventSource: "owner",
      value: 1,
      durationSeconds: 3,
      cooldownSeconds: 0,
      maxStacks: 1,
      stackMode: "refresh",
    }];
  }
  if (weaponId !== "mistsplitterreforged") return [];
  return [
    {
      kind: "resourceOnTrigger",
      resourceId: "mistsplitter-emblem-normal",
      trigger: "damageDealt",
      value: 1,
      actionTypes: ["normal", "charged"],
      elements: ELEMENTAL_TYPES,
      durationSeconds: 5,
      cooldownSeconds: 0,
      maxStacks: 1,
      stackMode: "refresh",
    },
    {
      kind: "resourceOnTrigger",
      resourceId: "mistsplitter-emblem-burst",
      trigger: "burstCast",
      value: 1,
      durationSeconds: 10,
      cooldownSeconds: 0,
      maxStacks: 1,
      stackMode: "refresh",
    },
  ];
}

/**
 * The buffs one refinement row grants, one per distinct damage-type scope.
 *
 * A row outside the `expressible` bucket yields `[]` unless a named weapon
 * adapter above translates its conditional lifecycle exactly.
 *
 * ENEMY MODIFIERS carry no scope in the generated shape (shred is a property of
 * the enemy, not of a hit), so they join the unscoped group. They ride along as
 * sourced data; the engine declares `EnemyModifier` but the damage pipeline
 * does not consume it yet, which is a documented gap in
 * `src/simulation/buffs/types.ts` and not this module's to close.
 */
export function buffsForRefinement(
  weaponId: string,
  passiveName: string,
  row: GeneratedWeaponRefinement,
): readonly Buff[] {
  const homa = homaBuffsForRefinement(weaponId, passiveName, row);
  if (homa.length > 0) return homa;
  const mistsplitter = mistsplitterBuffsForRefinement(
    weaponId,
    passiveName,
    row,
  );
  if (mistsplitter.length > 0) return mistsplitter;
  const azurelight = azurelightBuffsForRefinement(weaponId, passiveName, row);
  if (azurelight.length > 0) return azurelight;
  const aquaSimulacra = aquaSimulacraBuffsForRefinement(weaponId, passiveName, row);
  if (aquaSimulacra.length > 0) return aquaSimulacra;
  const splendor = splendorBuffsForRefinement(weaponId, passiveName, row);
  if (splendor.length > 0) return splendor;
  const symphonist = symphonistBuffsForRefinement(weaponId, passiveName, row);
  if (symphonist.length > 0) return symphonist;
  if (row.bucket !== EXPRESSIBLE_BUCKET) return [];

  // Insertion-ordered: modifiers, then conversions, then enemy modifiers, each
  // in emitted order. A `Map` preserves that, so the buff list is stable.
  const groups = new Map<string, ScopeGroup>();

  for (const modifier of row.modifiers) {
    groupFor(groups, modifier.damageTypes).modifiers.push(
      toStatModifier(modifier),
    );
  }
  for (const conversion of row.conversions) {
    groupFor(groups, conversion.damageTypes).conversions.push(
      toStatConversion(conversion),
    );
  }
  for (const modifier of row.enemyModifiers) {
    groupFor(groups, undefined).enemyModifiers.push(toEnemyModifier(modifier));
  }

  const out: Buff[] = [];
  for (const [key, group] of groups) {
    const buff: Buff = {
      // Scope-suffixed so two scopes of one passive never collapse into one
      // stacking identity. Refinement is in the id too: a build is simulated at
      // exactly one refinement, but an id that omitted it would collide across
      // any caller that compared two refinements side by side.
      id:
        key === UNSCOPED_KEY
          ? `${weaponId}-r${row.refinement}`
          : `${weaponId}-r${row.refinement}-${key}`,
      source: passiveName,
      startTime: EQUIPMENT_BUFF_START_TIME,
      duration: PERMANENT_DURATION,
      stacking: { mode: "refresh" },
      // `party` would leak a weapon's passive onto the whole team; a weapon is
      // worn by one character and buffs only its wearer. `self` is not used
      // because it requires `sourceCharacterId`, and the harvest is already
      // per-character -- the buff reaches exactly the character whose
      // equipment entry produced it.
      // A weapon's stat/passive belongs to its wearer even when the wearer is
      // off field. The harvest step attaches sourceCharacterId, so `self`
      // prevents party leakage while keeping snapshots and coordinated hits
      // correctly buffed.
      targets: { scope: "self" },
    };
    if (group.damageTypes) buff.conditions = { damageTypes: group.damageTypes };
    if (group.modifiers.length > 0) buff.modifiers = group.modifiers;
    if (group.conversions.length > 0) buff.conversions = group.conversions;
    if (group.enemyModifiers.length > 0) {
      buff.enemyModifiers = group.enemyModifiers;
    }
    out.push(buff);
  }
  return out;
}

/**
 * A generated weapon's passive as the `WeaponPassiveBuffs` the engine harvests.
 *
 * Returns `undefined` when the weapon has no passive, or when NO refinement of
 * it is translated -- an entry whose every level is empty is indistinguishable
 * from an absent one to the harvest, and returning it would suggest the passive
 * is modelled when nothing about it is.
 *
 * A refinement level that is present but not expressible is OMITTED from
 * `buffsByRefinement`, which is what makes the fail-closed rule automatic:
 * `harvestWeaponPassiveBuffs()` reads the owned refinement's key and gets
 * nothing, rather than reading R1's.
 */
export function weaponPassiveBuffs(
  weapon: GeneratedWeapon,
): WeaponPassiveBuffs | undefined {
  const passive = weapon.passive;
  if (!passive) return undefined;

  const byRefinement: Partial<Record<WeaponRefinement, readonly Buff[]>> = {};
  const stateEffectsByRefinement: Partial<
    Record<WeaponRefinement, readonly WeaponStateEffectTemplate[]>
  > = {};
  let any = false;
  // Ascending refinement, so the emitted key order is fixed.
  for (const row of [...passive.refinements].sort(
    (a, b) => a.refinement - b.refinement,
  )) {
    const buffs = buffsForRefinement(weapon.id, passive.name, row);
    if (buffs.length === 0) continue;
    byRefinement[row.refinement] = buffs;
    const stateEffects = weaponStateEffectsForRefinement(weapon.id);
    if (stateEffects.length > 0) stateEffectsByRefinement[row.refinement] = stateEffects;
    any = true;
  }
  if (!any) return undefined;

  return {
    name: passive.name,
    buffsByRefinement: byRefinement,
    ...(Object.keys(stateEffectsByRefinement).length > 0
      ? { stateEffectsByRefinement }
      : {}),
  };
}

/** Same as {@link weaponPassiveBuffs}, by weapon id. Unknown id -> undefined. */
export function weaponPassiveBuffsById(
  weaponId: string,
): WeaponPassiveBuffs | undefined {
  const weapon = generatedWeaponsById.get(weaponId);
  if (!weapon) return undefined;
  return weaponPassiveBuffs(weapon);
}

/**
 * Every generated weapon whose passive yields at least one buff, by id.
 *
 * Built eagerly and once: the generated set is fixed at build time, and a lazy
 * cache would be mutable state in a module the optimizer calls from a worker.
 * Insertion order follows `generatedWeaponsById`, which the generator sorts by
 * id, so iteration is deterministic.
 */
export const weaponPassiveBuffsByWeaponId: ReadonlyMap<
  string,
  WeaponPassiveBuffs
> = new Map(
  [...generatedWeaponsById]
    .map(([id, weapon]) => [id, weaponPassiveBuffs(weapon)] as const)
    .filter((entry): entry is readonly [string, WeaponPassiveBuffs] =>
      entry[1] !== undefined,
    ),
);
