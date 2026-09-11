import type { CharacterSnapshot, ResourceSnapshot } from "@/types";
import type {
  ActiveBuff,
  Buff,
  BuffCondition,
  BuffQuery,
  BuffState,
  ResourceCondition,
} from "@/simulation/buffs/types";

// ============================================================================
// getActiveBuffs(time, state, query)
//
// Answers "which buffs are live at time T for this character and this hit?".
// Pure: no clock, no RNG, no mutation of inputs.
//
// Three independent gates, all must pass:
//   1. Activation window   startTime <= t < startTime + duration
//   2. Targeting           scope matches the queried character
//   3. Conditions          declarative per-hit gate
// Then surviving buffs are grouped by `id` and folded per their stacking rule.
// ============================================================================

/** A buff with `duration <= 0` is inert; treated as never active. */
const MIN_MEANINGFUL_DURATION = 0;

/** Every buff contributes at least one stack once it is active. */
const MIN_STACKS = 1;

/**
 * Activation window is HALF-OPEN: `[startTime, startTime + duration)`.
 *
 * Rationale: a buff applied at t=0 with duration 10 covers t=0 (inclusive) and
 * has expired by t=10 (exclusive). Making the start inclusive means a buff
 * applied by an action can affect that same instant; making the end exclusive
 * means durations compose without double-counting at the seam. Infinity
 * duration is permanent.
 */
export function isWithinWindow(buff: Buff, time: number): boolean {
  if (!(buff.duration > MIN_MEANINGFUL_DURATION)) return false;
  if (time < buff.startTime) return false;
  if (buff.duration === Number.POSITIVE_INFINITY) return true;
  return time < buff.startTime + buff.duration;
}

/** Does this buff's target scope include the queried character? */
export function matchesTargets(buff: Buff, query: BuffQuery): boolean {
  const characterId = query.character.id;
  const { scope, characterIds } = buff.targets;
  if (buff.targets.excludeSource && buff.sourceCharacterId === characterId) return false;

  switch (scope) {
    case "party":
      return true;
    case "active":
      // No one is on-field yet => an `active`-scoped buff applies to no one.
      return (
        query.activeCharacterId !== undefined &&
        query.activeCharacterId === characterId
      );
    case "self":
      // Malformed data (no source) applies to nobody rather than everybody.
      return (
        buff.sourceCharacterId !== undefined &&
        buff.sourceCharacterId === characterId
      );
    case "characters":
      return characterIds?.includes(characterId) ?? false;
  }
}

function energyFraction(
  snapshotChar: CharacterSnapshot | undefined,
): number | undefined {
  if (!snapshotChar) return undefined;
  const { current, max } = snapshotChar.energy;
  if (!(max > 0)) return undefined;
  return current / max;
}

/**
 * Tolerance for `eq` / `neq` on a resource value.
 *
 * Resource values are usually integer stack counts, but nothing in the model
 * requires that, and an exact `===` on a fractional pool would be a latent
 * defect. Absolute (not relative) because resource values are small, bounded
 * counters, not a scaled physical quantity.
 */
export const RESOURCE_COMPARISON_EPSILON = 1e-9;

/**
 * Value of one resource at `time`, honouring lazy expiry.
 *
 * Mirrors `resourceValueAt()` in `src/simulation/character/runtime.ts`. It is
 * re-derived here rather than imported because the character module sits ABOVE
 * mechanics in the layering (`docs/ARCHITECTURE.md`) and lower layers must not
 * import upward. The rule it encodes is one line and is stated in the snapshot
 * type's own docs, so this is a shared CONTRACT, not duplicated logic.
 *
 * A missing resource reads as 0 — see `ResourceCondition` for why.
 */
function resourceValue(
  resource: ResourceSnapshot | undefined,
  time: number,
): number {
  if (!resource) return 0;
  if (
    resource.durationSeconds !== undefined &&
    time - resource.lastChanged >= resource.durationSeconds
  ) {
    return 0;
  }
  return resource.value;
}

/** Apply one declarative comparator. Pure, total, no branching on ids. */
function compareResource(
  actual: number,
  comparator: ResourceCondition["comparator"],
  expected: number,
): boolean {
  switch (comparator) {
    case "gte":
      return actual >= expected;
    case "gt":
      return actual > expected;
    case "lte":
      return actual <= expected;
    case "lt":
      return actual < expected;
    case "eq":
      return Math.abs(actual - expected) <= RESOURCE_COMPARISON_EPSILON;
    case "neq":
      return Math.abs(actual - expected) > RESOURCE_COMPARISON_EPSILON;
  }
}

/**
 * Evaluate one resource gate.
 *
 * FAILS CLOSED when the OWNER cannot be identified (no snapshot at all, or a
 * `"source"` gate on a buff with no `sourceCharacterId`) — an unresolvable
 * owner is a data error and must not grant the buff.
 *
 * Does NOT fail closed on a missing resource VALUE: an absent resource is a
 * legitimate, meaningful state (zero stacks) and reads as 0, so `lt 3` is true
 * for a character who has never gained the resource. The distinction is
 * deliberate — "I cannot tell" is unsafe, "it is zero" is a real answer.
 */
function matchesResourceCondition(
  condition: ResourceCondition,
  buff: Buff,
  query: BuffQuery,
  state: BuffState,
  time: number,
): boolean {
  const { snapshot } = state;
  if (!snapshot) return false;

  const ownerId =
    condition.owner === "source" ? buff.sourceCharacterId : query.character.id;
  if (ownerId === undefined) return false;

  const owner = snapshot.characters[ownerId];
  if (!owner) return false;

  const actual = resourceValue(owner.resources?.[condition.resourceId], time);
  return compareResource(actual, condition.comparator, condition.value);
}

/**
 * Declarative condition evaluation. Every present field must match (AND).
 * A condition that cannot be evaluated for lack of context (e.g. an energy
 * gate with no snapshot) FAILS CLOSED — the buff does not apply — so a missing
 * input can never silently inflate damage.
 *
 * `buff` and `time` are only consulted by the RESOURCE gate: `buff` supplies
 * `sourceCharacterId` for `owner: "source"`, and `time` drives lazy resource
 * expiry. Both are optional so the pre-existing 3-argument call form keeps
 * working; a `resources` gate evaluated without them fails closed rather than
 * silently passing.
 */
export function matchesConditions(
  condition: BuffCondition | undefined,
  query: BuffQuery,
  state: BuffState,
  buff?: Buff,
  time?: number,
): boolean {
  if (!condition) return true;

  const { ability } = query;

  if (condition.damageTypes) {
    if (!ability) return false;
    if (!condition.damageTypes.includes(ability.damageType)) return false;
  }

  if (condition.elements) {
    if (!ability) return false;
    if (!condition.elements.includes(ability.element)) return false;
  }

  if (condition.abilityIds) {
    if (!ability) return false;
    if (!condition.abilityIds.includes(ability.id)) return false;
  }

  if (condition.requiresOnField !== undefined) {
    const onField = query.activeCharacterId === query.character.id;
    if (onField !== condition.requiresOnField) return false;
  }

  if (
    condition.minEnergyFraction !== undefined ||
    condition.maxEnergyFraction !== undefined
  ) {
    const fraction = energyFraction(
      state.snapshot?.characters[query.character.id],
    );
    if (fraction === undefined) return false;
    if (
      condition.minEnergyFraction !== undefined &&
      fraction < condition.minEnergyFraction
    ) {
      return false;
    }
    if (
      condition.maxEnergyFraction !== undefined &&
      fraction > condition.maxEnergyFraction
    ) {
      return false;
    }
  }

  if (condition.requiresEnergyBelowMax) {
    const fraction = energyFraction(
      state.snapshot?.characters[query.character.id],
    );
    if (fraction === undefined || !(fraction < 1)) return false;
  }

  if (condition.resources && condition.resources.length > 0) {
    // Missing `buff`/`time` means the caller cannot supply the context a
    // resource gate needs. Fail closed rather than pass by omission.
    if (!buff || time === undefined) return false;
    for (const resourceCondition of condition.resources) {
      if (!matchesResourceCondition(resourceCondition, buff, query, state, time)) {
        return false;
      }
    }
  }

  if (condition.enemyAuraElements || condition.enemyAuraKinds) {
    const enemyId = query.enemy?.id;
    const aura = enemyId ? state.snapshot?.enemyAuras?.[enemyId] : undefined;
    if (!aura) return false;
    if (condition.enemyAuraElements) {
      const present = new Set(aura.auras.map((entry) => entry.element));
      if (!condition.enemyAuraElements.some((element) => present.has(element))) {
        return false;
      }
    }
    if (condition.enemyAuraKinds) {
      const present = new Set(aura.compound.map((entry) => entry.kind));
      if (!condition.enemyAuraKinds.some((kind) => present.has(kind))) {
        return false;
      }
    }
  }

  if (
    condition.minEnemyHpFraction !== undefined ||
    condition.maxEnemyHpFraction !== undefined ||
    condition.minEnemyHpFractionExclusive !== undefined ||
    condition.maxEnemyHpFractionExclusive !== undefined
  ) {
    const enemy = query.enemy;
    if (!enemy || enemy.maxHp === undefined || enemy.currentHp === undefined || !(enemy.maxHp > 0)) {
      return false;
    }
    const fraction = enemy.currentHp / enemy.maxHp;
    if (condition.minEnemyHpFraction !== undefined && fraction < condition.minEnemyHpFraction) return false;
    if (condition.maxEnemyHpFraction !== undefined && fraction > condition.maxEnemyHpFraction) return false;
    if (condition.minEnemyHpFractionExclusive !== undefined && fraction <= condition.minEnemyHpFractionExclusive) return false;
    if (condition.maxEnemyHpFractionExclusive !== undefined && fraction >= condition.maxEnemyHpFractionExclusive) return false;
  }

  if (condition.weaponTypes) {
    if (!query.character.weaponType || !condition.weaponTypes.includes(query.character.weaponType)) return false;
  }

  if (
    condition.minHpFraction !== undefined ||
    condition.maxHpFraction !== undefined ||
    condition.minHpFractionExclusive !== undefined ||
    condition.maxHpFractionExclusive !== undefined ||
    condition.requiresShield !== undefined
  ) {
    const character = state.snapshot?.characters[query.character.id];
    if (!character) return false;
    if (
      condition.minHpFraction !== undefined ||
      condition.maxHpFraction !== undefined ||
      condition.minHpFractionExclusive !== undefined ||
      condition.maxHpFractionExclusive !== undefined
    ) {
      if (character.maxHp === undefined || character.currentHp === undefined || !(character.maxHp > 0)) return false;
      const fraction = character.currentHp / character.maxHp;
      if (condition.minHpFraction !== undefined && fraction < condition.minHpFraction) return false;
      if (condition.maxHpFraction !== undefined && fraction > condition.maxHpFraction) return false;
      if (condition.minHpFractionExclusive !== undefined && fraction <= condition.minHpFractionExclusive) return false;
      if (condition.maxHpFractionExclusive !== undefined && fraction >= condition.maxHpFractionExclusive) return false;
    }
    if (condition.requiresShield !== undefined && character.shielded !== condition.requiresShield) return false;
  }

  return true;
}

/**
 * Collapse same-id buffs per their stacking rule.
 *
 *  - `refresh`     N overlapping applications => 1 stack. (Latest-applied wins
 *                  as the representative so `source`/modifiers reflect the most
 *                  recent application.)
 *  - `stack`       N applications => min(N, maxStacks) stacks. Each application
 *                  expired independently in the window filter above, so falling
 *                  stacks are already handled.
 *  - `independent` N applications => N separate ActiveBuff entries.
 *
 * Determinism: input order is not trusted. Groups are emitted sorted by id, and
 * within a group applications are sorted by (startTime, array index).
 */
function foldStacks(
  group: readonly { buff: Buff; index: number }[],
): ActiveBuff[] {
  const sorted = [...group].sort(
    (a, b) => a.buff.startTime - b.buff.startTime || a.index - b.index,
  );
  const first = sorted[0];
  if (!first) return [];

  const { mode, maxStacks } = first.buff.stacking;

  if (mode === "independent") {
    return sorted.map((entry) => ({ buff: entry.buff, stacks: MIN_STACKS }));
  }

  if (mode === "stack") {
    // maxStacks is required for `stack`; absent means "uncapped" rather than
    // silently dropping to 1 stack.
    const cap = maxStacks ?? Number.POSITIVE_INFINITY;
    const stacks = Math.min(sorted.length, Math.max(MIN_STACKS, cap));
    const latest = sorted[sorted.length - 1]!;
    return [{ buff: latest.buff, stacks }];
  }

  // `refresh`: one stack, represented by the most recently applied instance.
  const latest = sorted[sorted.length - 1]!;
  return [{ buff: latest.buff, stacks: MIN_STACKS }];
}

/**
 * Public mechanics seam. Returns the buffs active at `time` for the character
 * described by `query`, each with its effective stack count.
 *
 * Pure and deterministic: identical inputs always yield an identically ordered
 * result. Never mutates `state` or `query`.
 */
export function getActiveBuffs(
  time: number,
  state: BuffState,
  query: BuffQuery,
): ActiveBuff[] {
  const groups = new Map<string, { buff: Buff; index: number }[]>();

  for (let index = 0; index < state.buffs.length; index++) {
    const buff = state.buffs[index]!;
    // A cast snapshot freezes the buff's activation/condition verdict at the
    // cast timestamp. Dynamic buffs continue to be evaluated at the hit time.
    // The caller supplies the cast timestamp through the state snapshot, which
    // is already immutable and shared by every hit of the cast.
    const evaluationTime =
      buff.snapshotMode === "snapshot" && state.snapshot !== undefined
        ? state.snapshot.time
        : time;
    if (!isWithinWindow(buff, evaluationTime)) continue;
    if (!matchesTargets(buff, query)) continue;
    if (!matchesConditions(buff.conditions, query, state, buff, evaluationTime)) continue;

    const bucket = groups.get(buff.id);
    if (bucket) bucket.push({ buff, index });
    else groups.set(buff.id, [{ buff, index }]);
  }

  // Sort group keys so output order depends only on data, not on Map insertion.
  const ids = [...groups.keys()].sort();
  const result: ActiveBuff[] = [];
  for (const id of ids) result.push(...foldStacks(groups.get(id)!));
  return result;
}
