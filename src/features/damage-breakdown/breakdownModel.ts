// ---------------------------------------------------------------------------
// Pure presentation model for the damage breakdown tables.
//
// The engine keys `damageByAbility` by ability ID, not by name, because two
// abilities may legitimately share a display name (across characters, or an
// ability and its re-cast) and a name-keyed map silently merges unrelated
// damage. The ID is therefore the identity here too — it stays the React key
// and the sort tiebreaker — and the name is DISPLAY-ONLY, looked up through
// `abilityNamesById`.
//
// Nothing here computes damage; it only shapes what the engine already emitted.
// Kept out of React so it is unit-testable without a DOM.
// ---------------------------------------------------------------------------

import {
  parseReactionKey,
  QUALIFIER_SEPARATOR,
} from "@/lib/reactionLabel";
import { actionTypeZh, charNameZh, reactionZh } from "@/lib/i18n";

/**
 * One breakdown table, fully resolved. The component maps these to markup and
 * decides nothing: which tables exist, and which are ID-keyed and therefore
 * need labels, is decided here where it can be tested without a DOM.
 */
export interface BreakdownTableModel {
  readonly title: string;
  readonly rows: readonly BreakdownRow[];
}

/** A single table row: stable identity, display label, value and share. */
export interface BreakdownRow {
  /** Stable identity — the map key. Ability ID for the by-ability table. */
  readonly key: string;
  /** What the user sees. Falls back to `key` when no label is available. */
  readonly label: string;
  readonly value: number;
  /** Share of the run total, in percent (0-100). */
  readonly percent: number;
  /**
   * Disambiguating suffix, present ONLY when this row's label collides with
   * another row in the SAME table (COMPONENTS.md §10.4). Undefined is the
   * common case and renders nothing, so a table of distinct labels is visually
   * unchanged. The component renders this when present and decides nothing.
   */
  readonly qualifier?: string;
}

/**
 * Optional `key -> display name` map. Only the by-ability table is ID-keyed and
 * therefore needs one; the by-character and by-element tables are already keyed
 * by human-readable values and pass nothing.
 */
export type BreakdownLabels = Readonly<Record<string, string>>;

/** A share of zero, used when the total is non-positive and no share is defined. */
const NO_SHARE_PERCENT = 0;

const PERCENT_SCALE = 100;

/**
 * Resolves a row's display label.
 *
 * DELIBERATE FALLBACK: an ID absent from `labels` renders as the RAW ID rather
 * than as a placeholder like "Unknown". `abilityNamesById` covers every ability
 * that dealt damage, so a miss means the two maps disagree — a contract bug. The
 * raw ID is still meaningful to a theorycrafter, keeps the row attributable, and
 * surfaces the mismatch instead of hiding it behind an opaque label. An empty
 * label is treated as missing for the same reason: a blank row is unusable.
 */
export function resolveLabel(key: string, labels?: BreakdownLabels): string {
  // OWN properties only. A bare `labels[key]` reaches Object.prototype, so an
  // ability id of "constructor" or "toString" would resolve to a function and
  // render as source text. Ability ids are engine-supplied strings, not a
  // vetted identifier set, so this is a real key space.
  if (labels === undefined || !Object.hasOwn(labels, key)) return key;
  const label = labels[key];
  return label !== undefined && label !== "" ? label : key;
}

function inferredAbilityLabel(key: string, damageType?: string): string {
  if (damageType !== undefined) {
    const label = actionTypeZh(damageType);
    if (label !== damageType) return label;
  }
  const suffix = key.slice(key.lastIndexOf("-") + 1).toLowerCase();
  if (suffix === "na" || suffix === "normal") return "普通攻击";
  if (suffix === "ca" || suffix === "charged") return "重击";
  if (suffix === "e" || suffix === "skill") return "元素战技";
  if (suffix === "q" || suffix === "burst") return "元素爆发";
  return "未知动作";
}

function chineseAbilityLabels(
  result: BreakdownSource,
): BreakdownLabels {
  const labels: Record<string, string> = {};
  for (const event of result.timeline ?? []) {
    if (event.type !== "damage" || event.damage === undefined) continue;
    const reaction = parseReactionKey(event.damage.abilityId);
    labels[event.damage.abilityId] = reaction === null
      ? inferredAbilityLabel(event.damage.abilityId, event.damage.damageType)
      : `反应：${reactionZh(reaction.reactionKind)}`;
  }
  for (const key of Object.keys(result.damageByAbility)) {
    if (labels[key] !== undefined) continue;
    const reaction = parseReactionKey(key);
    labels[key] = reaction === null ? inferredAbilityLabel(key) : `反应：${reactionZh(reaction.reactionKind)}`;
  }
  return labels;
}

/**
 * Resolves an ability bucket's display label, naming transformative reaction
 * buckets as reactions.
 *
 * The engine gives a transformative reaction its own bucket keyed
 * `${triggerAbilityId}:${reactionKind}` with `abilityName` set to the raw kind
 * token. Left alone, such a row reads `electroCharged` — a machine word with no
 * indication that it is a reaction rather than an ability, and no indication of
 * what set it off. Both facts are already in the key, so both are recoverable
 * here without an engine change.
 *
 * The trigger's own name is looked up through the SAME `labels` map, so a
 * reaction row never invents a name the by-ability table does not already use.
 * When the trigger id has no label, `resolveLabel`'s raw-id fallback applies to
 * it as well — the missing-label signal survives one level down.
 */
export function resolveAbilityLabel(
  key: string,
  labels?: BreakdownLabels,
): string {
  const reaction = parseReactionKey(key);
  if (reaction === null) return resolveLabel(key, labels);
  const trigger = resolveLabel(reaction.triggerAbilityId, labels);
  return (
    reactionZh(reaction.reactionKind) + QUALIFIER_SEPARATOR + trigger
  );
}

/**
 * Builds the sorted, labelled rows for one breakdown table.
 *
 * Sorted by value descending; ties break on `key` ascending so the order is
 * deterministic (`Object.entries` order must not leak into the rendering, and
 * the optimizer relies on determinism elsewhere for the same reason).
 *
 * `resolveRowLabel` is injected rather than branched on inside, so the
 * by-ability table's reaction-aware naming is a property of THAT table and the
 * name-keyed tables cannot accidentally acquire it.
 */
export function buildBreakdownRows(
  data: Readonly<Record<string, number>>,
  total: number,
  labels?: BreakdownLabels,
  resolveRowLabel: (key: string, labels?: BreakdownLabels) => string = resolveLabel,
): BreakdownRow[] {
  return Object.entries(data)
    .map(([key, value]) => ({
      key,
      label: resolveRowLabel(key, labels),
      value,
      percent: total > 0 ? (value / total) * PERCENT_SCALE : NO_SHARE_PERCENT,
    }))
    .sort((a, b) => (b.value - a.value) || a.key.localeCompare(b.key));
}

/**
 * The minimum shape of a timeline damage event this model reads.
 *
 * Structural, not `CombatEvent`, so the collision tests can build a two-event
 * fixture instead of a whole simulation — and so a field this model does not
 * use cannot quietly become a dependency.
 */
export interface BreakdownDamageEvent {
  readonly type: string;
  readonly damage?: {
    readonly abilityId: string;
    readonly sourceCharacterId: string;
    readonly damageType?: string;
  };
}

/** A party member, as far as owner attribution is concerned. */
export interface BreakdownCharacter {
  readonly id: string;
  readonly name: string;
}

/**
 * Builds `abilityId -> owning character id` from the run's timeline.
 *
 * `damageByAbility` is keyed by ability id and carries no owner, but every
 * damage event already publishes `damage.sourceCharacterId` beside
 * `damage.abilityId`, so ownership is DERIVABLE here with no engine change
 * (COMPONENTS.md §10.5, data need N17).
 *
 * FIRST writer wins. An ability id contributed to by more than one character
 * would be a shared bucket that no single owner disambiguates; keeping the
 * first is deterministic (the timeline is ordered) rather than depending on
 * which event happened to be last.
 */
export function buildOwnerByAbilityId(
  timeline: readonly BreakdownDamageEvent[],
): ReadonlyMap<string, string> {
  const owners = new Map<string, string>();
  for (const event of timeline) {
    if (event.type !== "damage" || event.damage === undefined) continue;
    const { abilityId, sourceCharacterId } = event.damage;
    if (!owners.has(abilityId)) owners.set(abilityId, sourceCharacterId);
  }
  return owners;
}

/**
 * Owner display name for an ability bucket, or undefined when it cannot be
 * resolved.
 *
 * An unresolvable owner omits the qualifier rather than blocking the row: a
 * row is never prevented from rendering by a failed lookup (§10.7). A character
 * id with no name in the team falls back to the id — the same missing-label
 * rule as `resolveLabel`, recurring one level up (§10.5 step 2).
 */
function ownerNameFor(
  abilityId: string,
  owners: ReadonlyMap<string, string>,
  namesById: ReadonlyMap<string, string>,
): string | undefined {
  const ownerId = owners.get(abilityId);
  if (ownerId === undefined) return undefined;
  return namesById.get(ownerId) ?? ownerId;
}

/**
 * Applies §10's collision-conditional owner qualifier.
 *
 * Rules, in order:
 *  1. A label appearing on exactly one row is NOT ambiguous and gets no
 *     qualifier. A qualifier on every row is noise; the disambiguation must be
 *     conditional on the ambiguity actually existing (§10.4).
 *  2. Colliding rows are qualified by their OWNING CHARACTER NAME — the answer
 *     to the question a user asks on seeing two identical labels ("whose is
 *     this?"). It is stable across runs, unlike an ordinal.
 *  3. Colliding rows that resolve to the SAME owner are not separated by the
 *     name, so and ONLY THEN the ability id is appended (§10.5). The raw id is
 *     never the first-line strategy: it is the deliberate signal for a MISSING
 *     label, and making it routine would destroy that signal.
 *
 * Rows are returned in their input order; only `qualifier` is added.
 */
export function applyCollisionQualifiers(
  rows: readonly BreakdownRow[],
  owners: ReadonlyMap<string, string>,
  namesById: ReadonlyMap<string, string>,
): BreakdownRow[] {
  const labelCounts = new Map<string, number>();
  for (const row of rows) {
    labelCounts.set(row.label, (labelCounts.get(row.label) ?? 0) + 1);
  }

  // Which (label, owner) pairs are themselves duplicated — the residual case
  // where the owner name cannot disambiguate either.
  const labelOwnerCounts = new Map<string, number>();
  for (const row of rows) {
    if ((labelCounts.get(row.label) ?? 0) < 2) continue;
    const owner = ownerNameFor(row.key, owners, namesById);
    if (owner === undefined) continue;
    const pair = `${row.label}\u0000${owner}`;
    labelOwnerCounts.set(pair, (labelOwnerCounts.get(pair) ?? 0) + 1);
  }

  return rows.map((row) => {
    if ((labelCounts.get(row.label) ?? 0) < 2) return { ...row };
    const owner = ownerNameFor(row.key, owners, namesById);
    if (owner === undefined) return { ...row };
    const sameOwnerCollision =
      (labelOwnerCounts.get(`${row.label}\u0000${owner}`) ?? 0) > 1;
    return {
      ...row,
      qualifier: sameOwnerCollision
        ? owner + QUALIFIER_SEPARATOR + row.key
        : owner,
    };
  });
}

/**
 * Composes a row's final visible text from its label and optional qualifier.
 *
 * Lives here rather than in JSX because the qualifier is the ONLY thing
 * distinguishing two identically-named rows: a component that resolved the
 * label but dropped the qualifier would render two rows reading exactly the
 * same, and no test of `applyCollisionQualifiers` alone would notice, because
 * the model would still be returning the right data. This function is the
 * assertable form of "the qualifier reaches the user".
 */
export function composeRowText(label: string, qualifier?: string): string {
  return qualifier === undefined ? label : label + QUALIFIER_SEPARATOR + qualifier;
}

/** The subset of a `SimulationResult` the breakdown renders. */
export interface BreakdownSource {
  readonly totalDamage: number;
  readonly damageByAbility: Readonly<Record<string, number>>;
  /** Ability id -> display name. The by-ability map is ID-keyed. */
  readonly abilityNamesById: BreakdownLabels;
  readonly damageByCharacter: Readonly<Record<string, number>>;
  readonly damageByElement: Readonly<Record<string, number>>;
  /**
   * The run's event list, read ONLY for `damage.sourceCharacterId` so ability
   * buckets can be attributed to an owner. Nothing here re-aggregates damage
   * from it — the totals come from the engine's own maps.
   */
  readonly timeline?: readonly BreakdownDamageEvent[];
}

/**
 * Builds all three breakdown tables from a simulation result.
 *
 * This is the binding that the "By Ability" table is labelled from
 * `abilityNamesById`, resolved with the reaction-aware resolver, and passed
 * through the collision qualifier — while the other two, whose keys are already
 * human-readable and unique, are not. Keeping it here rather than in JSX is
 * what makes the binding assertable without a DOM: a component that forgot to
 * pass the labels would render raw ability ids, and one that forgot the
 * qualifier would render duplicate rows, and no pure test of the individual
 * helpers would notice either.
 */
export function buildBreakdownTables(
  result: BreakdownSource,
  team: readonly BreakdownCharacter[] = [],
): BreakdownTableModel[] {
  const { totalDamage } = result;
  const owners = buildOwnerByAbilityId(result.timeline ?? []);
  const namesById = new Map(team.map((c) => [c.id, charNameZh(c.name)]));
  return [
    {
      title: "By Ability",
      rows: applyCollisionQualifiers(
        buildBreakdownRows(
          result.damageByAbility,
          totalDamage,
          chineseAbilityLabels(result),
          resolveAbilityLabel,
        ),
        owners,
        namesById,
      ),
    },
    {
      title: "By Character",
      rows: buildBreakdownRows(result.damageByCharacter, totalDamage),
    },
    {
      title: "By Element",
      rows: buildBreakdownRows(result.damageByElement, totalDamage),
    },
  ];
}
