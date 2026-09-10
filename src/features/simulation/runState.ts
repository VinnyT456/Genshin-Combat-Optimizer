// ---------------------------------------------------------------------------
// Run identity: the immutable binding between a displayed result and the exact
// inputs that produced it.
//
// WHY THIS EXISTS (MASTER-PLAN §6 wave 1 item 4, UX-005 — a CORRECTNESS item):
//
// The page previously stored a bare `SimulationResult` and rendered every
// result region — headline stats, copied summary, energy panel, timeline,
// insights — against the *live* team / enemy / rotation state. Editing the
// team after a run left the old numbers on screen labelled with the NEW team.
// A result that silently describes a previous team is the same class of defect
// as a wrong damage number: both assert something untrue about the game.
//
// The fix is structural, not a notice. A result is only ever handed around
// wrapped in the inputs it came from (`SimulationRun`), so a region physically
// cannot read a live input next to a stale number. Staleness is then DERIVED by
// comparing fingerprints rather than set by a boolean that four separate edit
// handlers must each remember to flip.
//
// No combat math lives here. This module only identifies inputs.
// ---------------------------------------------------------------------------

import type {
  CharacterDefinition,
  EnemyState,
  Element,
  Rotation,
  SimulationConfig,
  SimulationResult,
} from "@/types";
import type { EquipmentSelections } from "@/features/team-builder/equipmentSelection";

/**
 * Elements are enumerated explicitly so a fingerprint is stable regardless of
 * the key insertion order of `EnemyState.resistances`. Two enemies that differ
 * only in the order their resistances were assigned are the same enemy.
 */
const FINGERPRINT_ELEMENTS: readonly Element[] = [
  "pyro",
  "hydro",
  "electro",
  "cryo",
  "anemo",
  "geo",
  "dendro",
  "physical",
];

/** Field separator inside one fingerprint segment. */
/** Marker for an input the user left at the engine default. */
const UNSET = "~";

/**
 * The user-chosen inputs of a run.
 *
 * `config` is deliberately narrowed to the serializable, user-selectable
 * fields. `SimulationConfig` also carries `buffResolver` / `enemyModifierResolver`
 * FUNCTIONS supplied by the adapter; those are derived from the team and are
 * not identity of their own. Including them would make every fingerprint
 * unequal to every other (function identity is by reference), which would
 * report every run as instantly stale.
 */
export interface RunInputs {
  readonly team: readonly CharacterDefinition[];
  readonly rotation: Rotation;
  readonly enemy: EnemyState;
  readonly config: Partial<SimulationConfig>;
  /**
   * The user's equipment choices.
   *
   * Part of run IDENTITY, not decoration: the adapter turns these into
   * `equippedStats` and `equipmentBuffs`, which change the damage number.
   * Omitting them would leave a result computed at R5 labelled with an R1
   * build after the user changed refinement — the same class of defect the
   * whole `SimulationRun` wrapper exists to prevent.
   *
   * Optional so callers that simulate no gear (fixtures, the optimizer's own
   * request shape) keep their previous fingerprints exactly.
   */
  readonly equipment?: EquipmentSelections;
}

/**
 * A completed run: a result permanently bound to the inputs that produced it.
 *
 * Every field a result region needs to LABEL its numbers is here. Regions read
 * `run.inputs`, never the live editor state.
 */
export interface SimulationRun {
  readonly inputs: RunInputs;
  readonly result: SimulationResult;
  /** Whether `result.effectiveSwapCost` came from the engine default. */
  readonly swapCostIsDefault: boolean;
  /** Identity of `inputs`; compare against the live fingerprint for staleness. */
  readonly fingerprint: string;
}

/**
 * Fingerprints a character by the fields that can change its damage.
 *
 * Identity alone is insufficient: the same character at a different level,
 * constellation or talent level is a different input and must invalidate a
 * result. Fields the build UI does not yet expose are still included, so that
 * wiring them up later does not silently reintroduce the stale-result bug.
 */
function fingerprintCharacter(character: CharacterDefinition): string {
  // Keep the complete definition in the identity. This includes resolved
  // stats, talent tables, constellation effects and any equipment metadata
  // carried by the website adapter, rather than maintaining a fragile list of
  // fields that can fall behind the engine contract.
  return identityFingerprint(character);
}

function fingerprintEnemy(enemy: EnemyState): string {
  return identityFingerprint({
    ...enemy,
    resistances: FINGERPRINT_ELEMENTS.reduce<Record<string, number | string>>(
      (result, element) => {
        result[element] = enemy.resistances[element] ?? UNSET;
        return result;
      },
      {},
    ),
  });
}

function fingerprintRotation(rotation: Rotation): string {
  return identityFingerprint(rotation);
}

/**
 * Fingerprints only the user-selectable config fields — see {@link RunInputs}
 * on why resolver functions are excluded.
 */
function fingerprintConfig(config: Partial<SimulationConfig>): string {
  const identityConfig = { ...config };
  delete identityConfig.buffResolver;
  delete identityConfig.enemyModifierResolver;
  delete identityConfig.talentLevelResolver;
  return identityFingerprint(identityConfig);
}

/** Canonical identity serializer for user-visible inputs. */
function identityFingerprint(value: unknown): string {
  const active = new Set<object>();

  function visit(input: unknown): string {
    if (input === undefined) return JSON.stringify(UNSET);
    if (input === null) return "null";
    switch (typeof input) {
      case "string": return JSON.stringify(input);
      case "boolean": return input ? "true" : "false";
      case "number": return Number.isFinite(input) ? String(input) : JSON.stringify(String(input));
      case "function": return JSON.stringify("[function]");
      case "bigint": return JSON.stringify(`${input}n`);
      case "symbol": return JSON.stringify(String(input));
    }
    if (active.has(input)) return JSON.stringify("[cycle]");
    active.add(input);
    try {
      if (Array.isArray(input)) return `[${input.map(visit).join(",")}]`;
      const record = input as Record<string, unknown>;
      return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${visit(record[key])}`).join(",")}}`;
    } finally {
      active.delete(input);
    }
  }

  const text = visit(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `identity-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/**
 * Stable identity of a set of run inputs.
 *
 * Equal fingerprints mean the engine would be handed equivalent inputs, so a
 * displayed result still describes the current configuration. Unequal means the
 * result describes something the user is no longer looking at.
 */
export function fingerprintInputs(inputs: RunInputs): string {
  return identityFingerprint({
    team: inputs.team.map(fingerprintCharacter),
    rotation: fingerprintRotation(inputs.rotation),
    enemy: fingerprintEnemy(inputs.enemy),
    config: fingerprintConfig(inputs.config),
    // `identityFingerprint` sorts object keys, so two selection records that
    // differ only in insertion order are one input, not two.
    equipment: inputs.equipment ?? UNSET,
  });
}

/**
 * Binds a result to its inputs. The returned run is the ONLY value the UI
 * should pass to a result region.
 */
export function createRun(
  inputs: RunInputs,
  result: SimulationResult,
  swapCostIsDefault: boolean,
): SimulationRun {
  return {
    inputs,
    result,
    swapCostIsDefault,
    fingerprint: fingerprintInputs(inputs),
  };
}

/**
 * True when `run` no longer describes `liveInputs`.
 *
 * Derived, never stored: a stored boolean can only be as correct as the set of
 * edit handlers that remember to set it, and every new input control is a new
 * chance to forget one. A comparison cannot be forgotten.
 */
export function isRunStale(
  run: SimulationRun | null,
  liveInputs: RunInputs,
): boolean {
  if (run === null) return false;
  return run.fingerprint !== fingerprintInputs(liveInputs);
}
