import type { Element, SupportClaim, SupportTier as AuthoredSupportTier } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { allAbilities } from "@/simulation/character/character";
import type {
  AbilitySlot,
  KitAbility,
  DamageInstanceDefinition,
} from "@/simulation/character/kit";
import type { ScalingStat } from "@/simulation/character/scaling";
import { lookupReaction } from "@/simulation/reactions/reactionTable";
import { isAuraElement } from "@/simulation/reactions/types";
import type { AuraElement, ReactionKind } from "@/simulation/reactions/types";
import { UNSUPPORTED_MECHANICS } from "@/simulation/reactions/unverified";

// ============================================================================
// CHARACTER COVERAGE MATRIX — machinery (TASK #024, qa-engineer).
//
// The user's required matrix is:
//
//   Character -> Skills -> Damage -> Element -> Reaction -> Energy
//             -> Cooldown -> Special Mechanics -> Tests
//
// This module builds that matrix and derives a SUPPORT TIER per character.
//
// ---------------------------------------------------------------------------
// THE ONE DESIGN RULE THAT MATTERS
// ---------------------------------------------------------------------------
// The tier is DERIVED from the character's actual authored data plus the
// actual capabilities of the landed engine and mechanics modules. It is NEVER
// read from a hand-maintained "supported characters" list.
//
// A hand-maintained list is the exact artefact that drifts: a character gets a
// mechanic the engine cannot express, the list still says FULLY SUPPORTED, and
// the UI confidently shows a wrong number. Here, adding a character with an
// unimplementable mechanic automatically demotes it, with a machine-readable
// reason attached, and no human has to remember to update anything.
//
// Consequence, stated so it is not mistaken for a bug: this file DOES name
// engine capabilities (e.g. "reaction-scaling instances are not modelled").
// That is a statement about THIS PROJECT's implementation, not about any
// character, and it lives in `src/tests` precisely so no production module
// gains a capability-introspection dependency.
//
// ---------------------------------------------------------------------------
// PHASE NOTE
// ---------------------------------------------------------------------------
// No real character data exists yet (Phase B is deliberately gated on
// cross-source verification). The machinery is therefore built and proven on
// the SYNTHETIC fixtures. When real rosters land, they are passed to
// `buildCoverageMatrix()` unchanged — no code here needs to know about them.
// ============================================================================

// ---------------------------------------------------------------------------
// Support tiers
// ---------------------------------------------------------------------------

/**
 * How completely this project can simulate a character.
 *
 * Ordered from best to worst; `compareTiers` relies on this order.
 */
export type SupportTier =
  /** Every authored ability is fully expressible AND covered by a test. */
  | "FULLY SUPPORTED"
  /** Damage/energy/cooldown work, but something in the kit is not modelled. */
  | "BASIC SUPPORT"
  /** A kit mechanic this project cannot express at all is present. */
  | "SPECIAL MECHANICS NOT YET IMPLEMENTED";

const TIER_ORDER: readonly SupportTier[] = [
  "FULLY SUPPORTED",
  "BASIC SUPPORT",
  "SPECIAL MECHANICS NOT YET IMPLEMENTED",
];

/** Negative when `a` is a better tier than `b`. */
export function compareTiers(a: SupportTier, b: SupportTier): number {
  return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
}

/** The worse (lower) of two tiers. */
export function worstTier(a: SupportTier, b: SupportTier): SupportTier {
  return compareTiers(a, b) >= 0 ? a : b;
}

// ---------------------------------------------------------------------------
// Gaps — the machine-readable reason a character is not FULLY SUPPORTED
// ---------------------------------------------------------------------------

/**
 * Every way a character can fail to be fully simulable.
 *
 * A closed union rather than free text, so a report consumer can branch on it
 * and so a new gap kind is a compile error at every switch, not a silent
 * string nobody handles.
 */
export type CoverageGapKind =
  /** The kit declares a resource/stack the engine cannot branch on. */
  | "conditional-resource-effect"
  /** An instance's element is overridden/infused — not expressible. */
  | "element-infusion"
  /** An off-field persistent source (a summon) with no tick model. */
  | "offfield-persistent-source"
  /** An instance whose damage scales off a reaction — not modelled. */
  | "reaction-scaling-instance"
  /** Healing or shielding output, which this project does not model. */
  | "healing-or-shielding"
  /** The kit relies on a mechanic quarantined in `unverified.ts`. */
  | "depends-on-unverified-mechanic"
  /** The character is authored but has no test exercising it. */
  | "untested"
  /**
   * The character carries passives/constellations whose EFFECTS are empty, so
   * the kit's conditional behaviour is present as prose but absent as data.
   *
   * This detector exists because every OTHER kind detects something PRESENT --
   * an infusion to override, a resource to branch on, a summon to tick. None
   * of them can see an ABSENCE. When the roster regenerated with empty
   * `effects`, the tier IMPROVED because the data got POORER: a kit with
   * nothing in it has nothing to detect, and "no detectable gaps" was read as
   * "fully supported". That is the TASK #028 lesson one layer up.
   */
  | "unmodelled-perk-effects";

export interface CoverageGap {
  kind: CoverageGapKind;
  /** Which ability (or `"character"`) the gap belongs to. */
  scope: string;
  /** Human-readable reason. Must be substantive, never a placeholder. */
  detail: string;
  /**
   * Tier this gap forces. `untested` only ever demotes to BASIC SUPPORT;
   * an inexpressible mechanic demotes all the way.
   */
  forcesTier: SupportTier;
}

// ---------------------------------------------------------------------------
// The matrix rows
// ---------------------------------------------------------------------------

/** One damage instance's coverage facts. */
export interface InstanceCoverage {
  id: string;
  name: string;
  /** DAMAGE column: which stats this instance scales from. */
  scalingStats: readonly ScalingStat[];
  /** ELEMENT column. */
  element: Element;
  /** Gauge units applied, or 0 when the instance applies no element. */
  gauge: number;
  /** ICD group this instance's application belongs to, when it has one. */
  icdGroup?: string;
  /** Seconds after cast start at which the hit lands. */
  delay: number;
}

/** SKILLS column: one ability, with its damage/energy/cooldown facts. */
export interface AbilityCoverage {
  id: string;
  name: string;
  slot: AbilitySlot;
  instances: readonly InstanceCoverage[];
  /** ENERGY column: cost paid, particles emitted, flat energy granted. */
  energyCost: number;
  particleCount: number;
  particleElement?: Element;
  flatEnergyGenerated: number;
  /** COOLDOWN column, at the character's authored talent level. */
  cooldownSeconds: number;
  castTimeSeconds: number;
  /** SPECIAL MECHANICS column, scoped to this ability. */
  stateEffectResourceIds: readonly string[];
  /** Infusion definition on this ability (TASK #025). */
  infusion?: {
    element: Element;
    durationSeconds: number;
    canBeOverridden: boolean;
  };
  /** Coordinated attack procs / triggers registered on cast (TASK #025 / #026). */
  triggers?: readonly {
    id: string;
    name: string;
    trigger: string;
    durationSeconds: number;
    icdSeconds: number;
  }[];
  /** Whether an alternate combat stance is entered on cast (TASK #025 / #026). */
  hasStance?: boolean;
}

/** REACTION column: a reaction this character can actually trigger. */
export interface ReactionCoverage {
  kind: ReactionKind;
  /** The aura element the character's own element reacts against. */
  auraElement: AuraElement;
  /** Whether this character is the TRIGGER (its element lands on the aura). */
  asTrigger: boolean;
}

/** TESTS column: what evidence exists that this character is simulated right. */
export interface TestCoverage {
  /** Ids of test suites that exercise this character. */
  suiteIds: readonly string[];
  /** Does at least one test assert a damage number for this character? */
  damageAsserted: boolean;
  /** Does at least one test assert energy/particle behaviour? */
  energyAsserted: boolean;
  /** Does at least one test assert a reaction for this character? */
  reactionAsserted: boolean;
}

/** One full row of the coverage matrix. */
export interface CharacterCoverage {
  id: string;
  name: string;
  element: Element;
  abilities: readonly AbilityCoverage[];
  reactions: readonly ReactionCoverage[];
  /** SPECIAL MECHANICS column at character scope. */
  resourceIds: readonly string[];
  passiveIds: readonly string[];
  constellationIds: readonly string[];
  /** Stat conversions defined on kit/stances (TASK #025 / #026). */
  statConversions?: readonly string[];
  tests: TestCoverage;
  gaps: readonly CoverageGap[];
  tier: SupportTier;
}

export interface CoverageMatrix {
  characters: readonly CharacterCoverage[];
  /** Counts per tier, for the report header. */
  tierCounts: Readonly<Record<SupportTier, number>>;
}

// ---------------------------------------------------------------------------
// Test evidence — supplied by the caller, keyed by character id
// ---------------------------------------------------------------------------

/**
 * Evidence that tests exist, supplied by the test suite that BUILDS the matrix.
 *
 * Deliberately an INPUT rather than something this module discovers by reading
 * the filesystem: a filesystem scan would make the report non-deterministic and
 * would count a test file that asserts nothing. The caller must state what it
 * actually asserts, and the caller is itself a test, so a false claim here is
 * a lie a reviewer can see in the diff.
 */
export interface TestEvidence {
  suiteId: string;
  characterIds: readonly string[];
  asserts: {
    damage?: boolean;
    energy?: boolean;
    reaction?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Capability detection — derived from the kit data, not from a list
// ---------------------------------------------------------------------------

/**
 * Ids of mechanics quarantined in `unverified.ts` that a KIT can depend on.
 *
 * Read from the live registry rather than duplicated, so retiring a gap in
 * `unverified.ts` automatically stops demoting characters here.
 */
const UNVERIFIED_IDS: ReadonlySet<string> = new Set(
  UNSUPPORTED_MECHANICS.map((mechanic) => mechanic.id),
);

/** Reactions this project can DETECT but cannot yet TRIGGER from simulation. */
const UNTRIGGERABLE_REACTIONS: ReadonlySet<ReactionKind> = new Set([
  "shattered",
  "hyperbloom",
  "burgeon",
  "aggravate",
  "spread",
]);

function instanceGauge(instance: DamageInstanceDefinition): number {
  return instance.application?.gauge ?? 0;
}

function scalingStatsOf(
  instance: DamageInstanceDefinition,
): readonly ScalingStat[] {
  // Deduplicated but ORDER-PRESERVING, so the report is stable and a hybrid
  // instance reads in its authored order.
  const seen = new Set<ScalingStat>();
  const out: ScalingStat[] = [];
  for (const term of instance.scaling) {
    if (seen.has(term.stat)) continue;
    seen.add(term.stat);
    out.push(term.stat);
  }
  return out;
}

function coverInstance(
  instance: DamageInstanceDefinition,
): InstanceCoverage {
  const application = instance.application;
  return {
    id: instance.id,
    name: instance.name,
    scalingStats: scalingStatsOf(instance),
    element: instance.element,
    gauge: instanceGauge(instance),
    ...(application?.icdGroup !== undefined
      ? { icdGroup: application.icdGroup }
      : {}),
    delay: instance.delay ?? 0,
  };
}

/**
 * Resolve a talent table at a level without importing the talent module's
 * private lookup: `cooldown` is a `TalentTable`, and the character declares
 * its own talent levels, so the value is fully determined by the data.
 */
function talentValue(table: { readonly values: readonly number[] }, level: number): number {
  if (table.values.length === 0) return 0;
  const index = Math.min(Math.max(Math.floor(level), 1), table.values.length) - 1;
  return table.values[index] ?? 0;
}

function talentLevelForSlot(
  def: GenericCharacterDefinition,
  slot: AbilitySlot,
): number {
  switch (slot) {
    case "skill":
      return def.talentLevels.skill;
    case "burst":
      return def.talentLevels.burst;
    default:
      return def.talentLevels.normal;
  }
}

function coverAbility(
  def: GenericCharacterDefinition,
  ability: KitAbility,
): AbilityCoverage {
  const level = talentLevelForSlot(def, ability.slot);
  return {
    id: ability.id,
    name: ability.name,
    slot: ability.slot,
    instances: ability.instances.map(coverInstance),
    energyCost: ability.energyCost,
    particleCount: ability.particles?.count ?? 0,
    ...(ability.particles?.element !== undefined
      ? { particleElement: ability.particles.element }
      : {}),
    flatEnergyGenerated: ability.energyGenerated ?? 0,
    cooldownSeconds: talentValue(ability.cooldown, level),
    castTimeSeconds: ability.castTime,
    stateEffectResourceIds: (ability.effects ?? []).map((e) => e.resourceId),
    ...(ability.infusion !== undefined
      ? {
          infusion: {
            element: ability.infusion.element,
            durationSeconds: ability.infusion.durationSeconds,
            canBeOverridden: ability.infusion.canBeOverridden,
          },
        }
      : {}),
    ...(ability.triggers !== undefined && ability.triggers.length > 0
      ? {
          triggers: ability.triggers.map((t) => ({
            id: t.id,
            name: t.name,
            trigger: t.trigger,
            durationSeconds: t.durationSeconds,
            icdSeconds: t.icdSeconds,
          })),
        }
      : {}),
    ...(ability.stance !== undefined ? { hasStance: true } : {}),
  };
}

/**
 * Reactions this character can trigger, derived from the reaction TABLE and
 * the elements its instances actually apply — never from a per-character list.
 */
function coverReactions(
  def: GenericCharacterDefinition,
): readonly ReactionCoverage[] {
  const appliedElements = new Set<Element>();
  for (const ability of allAbilities(def)) {
    for (const instance of ability.instances) {
      if (instanceGauge(instance) > 0) appliedElements.add(instance.element);
    }
  }

  const auraElements: readonly AuraElement[] = [
    "pyro",
    "hydro",
    "electro",
    "cryo",
    "dendro",
  ];

  const out: ReactionCoverage[] = [];
  // Fixed iteration order over both dimensions => deterministic output.
  for (const trigger of [...appliedElements].sort()) {
    for (const aura of auraElements) {
      if (isAuraElement(trigger) && trigger === aura) continue;
      const rule = lookupReaction(trigger, aura);
      if (!rule) continue;
      out.push({ kind: rule.kind, auraElement: aura, asTrigger: true });
    }
  }
  return out;
}

/**
 * Detect gaps by INSPECTING the kit against what the engine can express.
 *
 * Each detector answers a question about the DATA, so a future character that
 * uses the mechanic is caught the moment it is authored.
 */
/**
 * How many perk ids to name in a gap detail before eliding. A character with
 * 10 unmodelled perks should not render a 10-id sentence in every report row.
 */
const PERK_DETAIL_LIMIT = 3;

function detectGaps(
  def: GenericCharacterDefinition,
  reactions: readonly ReactionCoverage[],
  tests: TestCoverage,
): readonly CoverageGap[] {
  const gaps: CoverageGap[] = [];

  // 1. Conditional resource effects. A resource can be GAINED but the engine
  //    cannot branch on its value (documented Phase B gap: `StateEffect` has
  //    no predicate). A character that declares a resource therefore has
  //    behaviour that will not fire.
  if (def.resources.length > 0) {
    gaps.push({
      kind: "conditional-resource-effect",
      scope: "character",
      detail:
        `Declares ${def.resources.length} resource(s) ` +
        `(${def.resources.map((r) => r.id).join(", ")}). The engine tracks ` +
        "resource VALUES generically but `StateEffect` has no predicate, so " +
        "no effect can branch on a stack count. Any behaviour gated on these " +
        "resources will not fire.",
      forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
    });
  }

  // 2. Healing / shielding. Not modelled anywhere in this project.
  //    Detected structurally: an ability with zero damage instances is doing
  //    something the damage model cannot see.
  for (const ability of allAbilities(def)) {
    if (ability.instances.length === 0) {
      gaps.push({
        kind: "healing-or-shielding",
        scope: ability.id,
        detail:
          `Ability "${ability.name}" declares no damage instances, so its ` +
          "entire effect is outside the damage model. Healing and shielding " +
          "are not modelled by this project at all.",
        forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
      });
    }
  }

  // 3. Off-field persistent sources. Detected as an instance whose delay
  //    exceeds its ability's cast time: the hit lands after the ability is
  //    over, which is a summon/DoT the engine has no tick model for.
  for (const ability of allAbilities(def)) {
    for (const instance of ability.instances) {
      const delay = instance.delay ?? 0;
      if (delay > ability.castTime) {
        gaps.push({
          kind: "offfield-persistent-source",
          scope: ability.id,
          detail:
            `Instance "${instance.id}" lands at ${delay}s, after the ` +
            `${ability.castTime}s cast completes. That is an off-field ` +
            "persistent source (summon / DoT); the engine has no duration or " +
            "tick model for one.",
          forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
        });
      }
    }
  }

  // 4. Element infusion. Infusions are now expressible via `src/simulation/reactions/infusions.ts`
  //    (TASK #025). Detected as an instance whose APPLIED element differs from the element
  //    used for DMG% and RES lookup without an expressible infusion declaration.
  for (const ability of allAbilities(def)) {
    for (const instance of ability.instances) {
      const applied = instance.application?.element;
      if (
        applied !== undefined &&
        applied !== instance.element &&
        !ability.infusion &&
        !ability.stance?.infusion
      ) {
        gaps.push({
          kind: "element-infusion",
          scope: ability.id,
          detail:
            `Instance "${instance.id}" applies ${applied} but is priced as ` +
            `${instance.element} without an expressible infusion declaration. ` +
            "Element override / infusion requires explicit InfusionDefinition.",
          forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
        });
      }
    }
  }

  // 5. Reaction-scaling instances. Detected as an instance scaling off EM
  //    alone: an EM-only instance is a reaction-damage instance in disguise,
  //    which the damage pipeline cannot produce.
  for (const ability of allAbilities(def)) {
    for (const instance of ability.instances) {
      const stats = scalingStatsOf(instance);
      if (stats.length === 1 && stats[0] === "elementalMastery") {
        gaps.push({
          kind: "reaction-scaling-instance",
          scope: ability.id,
          detail:
            `Instance "${instance.id}" scales off Elemental Mastery only, ` +
            "which is a reaction-scaling instance. The damage pipeline " +
            "produces ability damage, not reaction damage, for such an " +
            "instance.",
          forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
        });
      }
    }
  }

  // 6. Dependence on a quarantined mechanic. If the character can trigger a
  //    reaction that this project detects but cannot produce, say so.
  const blocked = reactions
    .filter((reaction) => UNTRIGGERABLE_REACTIONS.has(reaction.kind))
    .map((reaction) => reaction.kind);
  if (blocked.length > 0) {
    gaps.push({
      kind: "depends-on-unverified-mechanic",
      scope: "character",
      detail:
        `Can reach reaction(s) ${[...new Set(blocked)].join(", ")}, which are ` +
        "quarantined in `unverified.ts` and cannot currently be produced " +
        "from simulation state.",
      forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
    });
  }

  // 7. Unmodelled passive/constellation effects. Detected as a passive or
  //    constellation ROW that carries no effects: the perk exists and is
  //    named, but nothing about it is simulatable.
  //
  //    Unlike every detector above, this one fires on what is MISSING. It is
  //    the reason `FULLY SUPPORTED` can no longer be reached by simply having
  //    an empty kit.
  const effectlessPerks = [
    ...def.passives.filter((p) => p.effects.length === 0),
    ...def.constellations.filter((c) => c.effects.length === 0),
  ];
  if (effectlessPerks.length > 0) {
    const totalPerks = def.passives.length + def.constellations.length;
    gaps.push({
      kind: "unmodelled-perk-effects",
      scope: "character",
      detail:
        `${effectlessPerks.length} of ${totalPerks} passives/constellations ` +
        `(${effectlessPerks
          .map((perk) => perk.id)
          .slice(0, PERK_DETAIL_LIMIT)
          .join(", ")}` +
        `${effectlessPerks.length > PERK_DETAIL_LIMIT ? ", ..." : ""}) ` +
        "carry no effects. The perk is named but not modelled, so any buff, " +
        "stat conversion or conditional it grants is silently absent from " +
        "every simulation. Naming a perk is not implementing it.",
      forcesTier: "BASIC SUPPORT",
    });
  }

  // 8. Untested. The weakest demotion: the kit may be perfectly expressible,
  //    but nothing proves the numbers are right.
  const missing: string[] = [];
  if (!tests.damageAsserted) missing.push("damage");
  if (!tests.energyAsserted) missing.push("energy");
  if (!tests.reactionAsserted) missing.push("reaction");
  if (tests.suiteIds.length === 0 || missing.length > 0) {
    gaps.push({
      kind: "untested",
      scope: "character",
      detail:
        tests.suiteIds.length === 0
          ? "No test suite exercises this character at all."
          : `Exercised by ${tests.suiteIds.join(", ")}, but no test asserts: ` +
            `${missing.join(", ")}.`,
      forcesTier: "BASIC SUPPORT",
    });
  }

  return gaps;
}

/** The tier is the WORST tier any detected gap forces. No gaps => full. */
export function deriveTier(gaps: readonly CoverageGap[]): SupportTier {
  let tier: SupportTier = "FULLY SUPPORTED";
  for (const gap of gaps) tier = worstTier(tier, gap.forcesTier);
  return tier;
}

// ---------------------------------------------------------------------------
// Building the matrix
// ---------------------------------------------------------------------------

function testCoverageFor(
  characterId: string,
  evidence: readonly TestEvidence[],
): TestCoverage {
  const relevant = evidence.filter((entry) =>
    entry.characterIds.includes(characterId),
  );
  return {
    // Sorted so the report never depends on evidence-array order.
    suiteIds: [...relevant.map((entry) => entry.suiteId)].sort(),
    damageAsserted: relevant.some((entry) => entry.asserts.damage === true),
    energyAsserted: relevant.some((entry) => entry.asserts.energy === true),
    reactionAsserted: relevant.some((entry) => entry.asserts.reaction === true),
  };
}

export function buildCharacterCoverage(
  def: GenericCharacterDefinition,
  evidence: readonly TestEvidence[],
): CharacterCoverage {
  const abilities = allAbilities(def).map((ability) =>
    coverAbility(def, ability),
  );
  const reactions = coverReactions(def);
  const tests = testCoverageFor(def.id, evidence);
  const gaps = detectGaps(def, reactions, tests);

  const statConversions: string[] = [];
  if (
    "statConversions" in def &&
    Array.isArray((def as { statConversions?: readonly { sourceStat: string; targetStat: string }[] }).statConversions)
  ) {
    for (const c of (def as { statConversions: readonly { sourceStat: string; targetStat: string }[] }).statConversions) {
      statConversions.push(`${c.sourceStat} -> ${c.targetStat}`);
    }
  }
  for (const ability of allAbilities(def)) {
    if (ability.stance?.conversions) {
      for (const c of ability.stance.conversions) {
        statConversions.push(`${c.sourceStat} -> ${c.targetStat}`);
      }
    }
  }

  return {
    id: def.id,
    name: def.name,
    element: def.element,
    abilities,
    reactions,
    resourceIds: def.resources.map((resource) => resource.id),
    passiveIds: def.passives.map((passive) => passive.id),
    constellationIds: def.constellations.map((c) => c.id),
    ...(statConversions.length > 0 ? { statConversions } : {}),
    tests,
    gaps,
    tier: deriveTier(gaps),
  };
}

/**
 * Build the full matrix over a registry.
 *
 * Output order is sorted by character id, NOT by registry order, so two
 * registries holding the same characters produce identical reports.
 */
export function buildCoverageMatrix(
  registry: readonly GenericCharacterDefinition[],
  evidence: readonly TestEvidence[],
): CoverageMatrix {
  const characters = [...registry]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((def) => buildCharacterCoverage(def, evidence));

  const tierCounts: Record<SupportTier, number> = {
    "FULLY SUPPORTED": 0,
    "BASIC SUPPORT": 0,
    "SPECIAL MECHANICS NOT YET IMPLEMENTED": 0,
  };
  for (const character of characters) tierCounts[character.tier] += 1;

  return { characters, tierCounts };
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function joinOrDash(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "—";
}

/**
 * Render the matrix as deterministic Markdown.
 *
 * Pure string building: same matrix in, byte-identical text out, no clock and
 * no locale-sensitive formatting.
 */
export function renderCoverageReport(matrix: CoverageMatrix): string {
  const lines: string[] = [];

  lines.push("# Character Coverage Matrix");
  lines.push("");
  lines.push(
    "Generated from the character registry by `src/tests/coverage/characterCoverage.ts`.",
  );
  lines.push(
    "Tiers are DERIVED from authored kit data plus landed engine capability — never from a maintained list.",
  );
  lines.push("");
  lines.push("| Tier | Characters |");
  lines.push("| --- | --- |");
  for (const tier of TIER_ORDER) {
    lines.push(`| ${tier} | ${matrix.tierCounts[tier]} |`);
  }
  lines.push("");

  for (const character of matrix.characters) {
    lines.push(`## ${character.name} (\`${character.id}\`) — ${character.element}`);
    lines.push("");
    lines.push(`**Support tier:** ${character.tier}`);
    lines.push("");

    lines.push("### Skills / Damage / Element / Energy / Cooldown");
    lines.push("");
    lines.push(
      "| Ability | Slot | Instances | Scaling | Element | Gauge | Energy cost | Particles | Cooldown (s) | Cast (s) |",
    );
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const ability of character.abilities) {
      const scaling = joinOrDash([
        ...new Set(ability.instances.flatMap((i) => i.scalingStats)),
      ]);
      const elements = joinOrDash([
        ...new Set(ability.instances.map((i) => i.element)),
      ]);
      const gauge = joinOrDash([
        ...new Set(ability.instances.map((i) => String(i.gauge))),
      ]);
      const particles =
        ability.particleCount > 0
          ? `${ability.particleCount} ${ability.particleElement ?? "?"}`
          : "—";
      lines.push(
        `| ${ability.name} | ${ability.slot} | ${ability.instances.length} | ` +
          `${scaling} | ${elements} | ${gauge} | ${ability.energyCost} | ` +
          `${particles} | ${ability.cooldownSeconds} | ${ability.castTimeSeconds} |`,
      );
    }
    lines.push("");

    lines.push("### Reactions reachable");
    lines.push("");
    if (character.reactions.length === 0) {
      lines.push("None — this character applies no element.");
    } else {
      lines.push("| Reaction | Against aura |");
      lines.push("| --- | --- |");
      for (const reaction of character.reactions) {
        lines.push(`| ${reaction.kind} | ${reaction.auraElement} |`);
      }
    }
    lines.push("");

    lines.push("### Special mechanics");
    lines.push("");
    lines.push(`- Resources: ${joinOrDash(character.resourceIds)}`);
    lines.push(`- Passives: ${joinOrDash(character.passiveIds)}`);
    lines.push(`- Constellations: ${joinOrDash(character.constellationIds)}`);
    if (character.statConversions && character.statConversions.length > 0) {
      lines.push(`- Stat conversions: ${joinOrDash(character.statConversions)}`);
    }
    lines.push("");

    lines.push("### Tests");
    lines.push("");
    lines.push(`- Suites: ${joinOrDash(character.tests.suiteIds)}`);
    lines.push(`- Damage asserted: ${character.tests.damageAsserted}`);
    lines.push(`- Energy asserted: ${character.tests.energyAsserted}`);
    lines.push(`- Reaction asserted: ${character.tests.reactionAsserted}`);
    lines.push("");

    lines.push("### Gaps forcing the tier");
    lines.push("");
    if (character.gaps.length === 0) {
      lines.push("None.");
    } else {
      for (const gap of character.gaps) {
        lines.push(
          `- \`${gap.kind}\` (${gap.scope}) → ${gap.forcesTier}: ${gap.detail}`,
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Ids of every unverified mechanic, exposed so a report consumer can cite it. */
export function unverifiedMechanicIds(): readonly string[] {
  return [...UNVERIFIED_IDS].sort();
}


// ---------------------------------------------------------------------------
// CLAIM vs CHECK — reconciling the AUTHORED tier (N9) with the DERIVED tier
// ---------------------------------------------------------------------------
//
// `src/types/index.ts` N9 defines `SupportTier = "full" | "basic" | "partial"`
// as a CLAIM THE AUTHOR MAKES. The tier this module computes is a CHECK,
// derived from what is actually implemented and tested.
//
// The two are deliberately INDEPENDENT and neither is computed from the other.
// The single most valuable thing this matrix can do is surface a DISAGREEMENT:
// an author claiming `full` for a character whose kit the engine demonstrably
// cannot express is precisely the failure this project keeps hitting, and it
// is invisible to every other test in the suite.
//
// The mapping below is a COMPARISON KEY only. It exists so the two vocabularies
// can be lined up; it is not a derivation in either direction, and it is never
// used to fill in a missing value.

/** Lines the authored vocabulary up with the derived one, for comparison ONLY. */
export function derivedTierForClaim(claim: AuthoredSupportTier): SupportTier {
  switch (claim) {
    case "FULL":
      return "FULLY SUPPORTED";
    case "BASIC":
      return "BASIC SUPPORT";
    case "PARTIAL":
    case "DATA_ONLY":
    case "NOT_IMPLEMENTED":
      return "SPECIAL MECHANICS NOT YET IMPLEMENTED";
    default:
      return "SPECIAL MECHANICS NOT YET IMPLEMENTED";
  }
}

/** Direction of a claim/check disagreement. */
export type ClaimVerdict =
  /** Claim and check agree. */
  | "agrees"
  /** The author claims MORE support than is implemented + tested. DANGEROUS. */
  | "overclaims"
  /** The author claims LESS. Conservative, but worth knowing. */
  | "underclaims";

export interface ClaimReconciliation {
  characterId: string;
  claimed: AuthoredSupportTier;
  derived: SupportTier;
  verdict: ClaimVerdict;
  /** Populated for `overclaims`: the gaps the claim ignores. */
  ignoredGaps: readonly CoverageGap[];
}

/**
 * Compare one authored claim against this module's derived tier.
 *
 * `overclaims` is the defect case: the author promises support the code cannot
 * deliver, so a user sees a confident number that is wrong.
 */
export function reconcileClaim(
  coverage: CharacterCoverage,
  claim: SupportClaim,
): ClaimReconciliation {
  const claimedAsDerived = derivedTierForClaim(claim.supportTier);
  const delta = compareTiers(claimedAsDerived, coverage.tier);

  const verdict: ClaimVerdict =
    delta === 0 ? "agrees" : delta < 0 ? "overclaims" : "underclaims";

  return {
    characterId: coverage.id,
    claimed: claim.supportTier,
    derived: coverage.tier,
    verdict,
    ignoredGaps:
      verdict === "overclaims"
        ? coverage.gaps.filter(
            (gap) => compareTiers(gap.forcesTier, claimedAsDerived) > 0,
          )
        : [],
  };
}

/** Reconcile a whole matrix. Returns only the rows that DISAGREE. */
export function findClaimDisagreements(
  matrix: CoverageMatrix,
  claims: Readonly<Record<string, SupportClaim>>,
): readonly ClaimReconciliation[] {
  const out: ClaimReconciliation[] = [];
  for (const coverage of matrix.characters) {
    const claim = claims[coverage.id];
    if (!claim) continue;
    const reconciliation = reconcileClaim(coverage, claim);
    if (reconciliation.verdict !== "agrees") out.push(reconciliation);
  }
  return out;
}
